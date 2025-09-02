// components/games/MultiplayerAgarGame.js - Real-time Multiplayer Agar Game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '../../utils/firebase';
import { ref, push, set, onValue, off, remove, onDisconnect } from 'firebase/database';

const MultiplayerAgarGame = ({ 
  gameMode = "digital", 
  showToast, 
  studentData, 
  updateStudentData,
  classData 
}) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const playerRef = useRef(null);
  const gameRoomRef = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // menu, joining, playing, gameOver
  const [connectedPlayers, setConnectedPlayers] = useState({});
  const [gameRoom, setGameRoom] = useState(null);
  const [score, setScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    cellsEaten: 0,
    timePlayed: 0,
    playersEaten: 0
  });

  // Game constants
  const WORLD_WIDTH = 4000;
  const WORLD_HEIGHT = 4000;
  const MIN_CELL_SIZE = 10;
  const MAX_CELL_SIZE = 200;
  const FOOD_COUNT = 1200;
  const VIEWPORT_WIDTH = 800;
  const VIEWPORT_HEIGHT = 600;
  const UPDATE_RATE = 50; // ms between updates

  // Game objects
  const gameObjects = useRef({
    localPlayer: null,
    food: [],
    camera: { x: 0, y: 0 },
    lastUpdate: 0
  });

  // Player colors
  const PLAYER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#3742FA', '#2F3542',
    '#FF3838', '#2ECC71', '#3498DB', '#9B59B6',
    '#F39C12', '#E67E22', '#E74C3C', '#1ABC9C'
  ];

  // Initialize local player
  const createLocalPlayer = useCallback(() => {
    const colorIndex = Object.keys(connectedPlayers).length % PLAYER_COLORS.length;
    return {
      id: `${studentData.id}_${Date.now()}`,
      name: studentData.firstName || 'Student',
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: 20,
      color: PLAYER_COLORS[colorIndex],
      targetX: 0,
      targetY: 0,
      score: 0,
      lastUpdate: Date.now(),
      isLocal: true
    };
  }, [studentData, connectedPlayers]);

  // Create or join game room
  const joinGameRoom = useCallback(async () => {
    if (!classData?.classCode) {
      showToast('Class code not found!', 'error');
      return;
    }

    setGameState('joining');
    
    try {
      const roomId = `agar_${classData.classCode}`;
      gameRoomRef.current = ref(database, `gameRooms/${roomId}`);
      
      // Create local player
      const localPlayer = createLocalPlayer();
      gameObjects.current.localPlayer = localPlayer;
      
      // Set up player reference
      playerRef.current = ref(database, `gameRooms/${roomId}/players/${localPlayer.id}`);
      
      // Join the game room
      await set(playerRef.current, {
        ...localPlayer,
        connectedAt: Date.now(),
        active: true
      });

      // Set up disconnect cleanup
      onDisconnect(playerRef.current).remove();

      // Initialize food if we're the first player
      const foodRef = ref(database, `gameRooms/${roomId}/food`);
      const foodSnapshot = await new Promise(resolve => {
        onValue(foodRef, resolve, { onlyOnce: true });
      });

      if (!foodSnapshot.exists()) {
        const foodData = {};
        for (let i = 0; i < FOOD_COUNT; i++) {
          const foodId = `food_${i}`;
          foodData[foodId] = {
            id: foodId,
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: 3 + Math.random() * 4,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
          };
        }
        await set(foodRef, foodData);
      }

      // Listen for other players
      const playersRef = ref(database, `gameRooms/${roomId}/players`);
      onValue(playersRef, (snapshot) => {
        const players = snapshot.val() || {};
        setConnectedPlayers(players);
      });

      // Listen for food updates
      onValue(foodRef, (snapshot) => {
        const food = snapshot.val() || {};
        gameObjects.current.food = Object.values(food);
      });

      setGameRoom(roomId);
      setGameState('playing');
      showToast(`Joined multiplayer arena! ${Object.keys(connectedPlayers).length} players online`, 'success');

    } catch (error) {
      console.error('Error joining game room:', error);
      showToast('Failed to join multiplayer game', 'error');
      setGameState('menu');
    }
  }, [classData, createLocalPlayer, connectedPlayers, showToast]);

  // Leave game room
  const leaveGameRoom = useCallback(async () => {
    try {
      if (playerRef.current) {
        await remove(playerRef.current);
      }
      
      // Clean up listeners
      if (gameRoomRef.current) {
        off(gameRoomRef.current);
      }
      
      setGameState('menu');
      setConnectedPlayers({});
      setScore(0);
      
    } catch (error) {
      console.error('Error leaving game room:', error);
    }
  }, []);

  // Update player position to Firebase
  const updatePlayerPosition = useCallback(async (player) => {
    if (!playerRef.current || !player) return;
    
    try {
      await set(playerRef.current, {
        ...player,
        lastUpdate: Date.now(),
        active: true
      });
    } catch (error) {
      console.warn('Error updating player position:', error);
    }
  }, []);

  // Handle eating food
  const eatFood = useCallback(async (foodId, player) => {
    if (!gameRoom) return;

    try {
      const foodRef = ref(database, `gameRooms/${gameRoom}/food/${foodId}`);
      const food = gameObjects.current.food.find(f => f.id === foodId);
      
      if (food) {
        // Remove the eaten food
        await remove(foodRef);
        
        // Create new food elsewhere
        const newFoodId = `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newFoodRef = ref(database, `gameRooms/${gameRoom}/food/${newFoodId}`);
        await set(newFoodRef, {
          id: newFoodId,
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT,
          size: 3 + Math.random() * 4,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });

        // Update local player
        player.size += food.size * 0.3;
        player.size = Math.min(player.size, MAX_CELL_SIZE);
        player.score += Math.floor(food.size * 2);
        
        setScore(prev => prev + Math.floor(food.size * 2));
        setGameStats(prev => ({ ...prev, cellsEaten: prev.cellsEaten + 1 }));
      }
    } catch (error) {
      console.warn('Error handling food consumption:', error);
    }
  }, [gameRoom]);

  // Handle eating another player
  const eatPlayer = useCallback(async (eatenPlayerId, eater) => {
    if (!gameRoom) return;

    try {
      const eatenPlayer = connectedPlayers[eatenPlayerId];
      if (!eatenPlayer) return;

      // Update eater
      eater.size += eatenPlayer.size * 0.7;
      eater.size = Math.min(eater.size, MAX_CELL_SIZE);
      eater.score += Math.floor(eatenPlayer.size * 10);

      setScore(prev => prev + Math.floor(eatenPlayer.size * 10));
      setGameStats(prev => ({ ...prev, playersEaten: prev.playersEaten + 1 }));
      
      showToast(`You ate ${eatenPlayer.name}! +${Math.floor(eatenPlayer.size * 10)} points`, 'success');

      // If we ate someone, respawn them
      const respawnedPlayer = {
        ...eatenPlayer,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: 20,
        score: Math.floor(eatenPlayer.score * 0.5) // Lose half their score
      };

      const eatenPlayerRef = ref(database, `gameRooms/${gameRoom}/players/${eatenPlayerId}`);
      await set(eatenPlayerRef, respawnedPlayer);

    } catch (error) {
      console.warn('Error handling player consumption:', error);
    }
  }, [gameRoom, connectedPlayers, showToast]);

  // Check collisions and eating
  const checkCollisions = useCallback((localPlayer) => {
    if (!localPlayer) return;

    // Check food collisions
    gameObjects.current.food.forEach(food => {
      const dist = distance(localPlayer.x, localPlayer.y, food.x, food.y);
      if (dist < localPlayer.size * 0.8 + food.size) {
        eatFood(food.id, localPlayer);
      }
    });

    // Check player collisions
    Object.values(connectedPlayers).forEach(otherPlayer => {
      if (otherPlayer.id === localPlayer.id || !otherPlayer.active) return;
      
      const dist = distance(localPlayer.x, localPlayer.y, otherPlayer.x, otherPlayer.y);
      const sizeDiff = localPlayer.size - otherPlayer.size;
      
      if (sizeDiff > otherPlayer.size * 0.1 && dist < localPlayer.size * 0.8) {
        // We can eat the other player
        eatPlayer(otherPlayer.id, localPlayer);
      } else if (sizeDiff < -localPlayer.size * 0.1 && dist < otherPlayer.size * 0.8) {
        // We got eaten - game over for us
        setGameState('gameOver');
        showToast(`You were eaten by ${otherPlayer.name}!`, 'error');
      }
    });
  }, [connectedPlayers, eatFood, eatPlayer]);

  // Utility functions
  const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const getCellSpeed = (size) => Math.max(1, 5 - (size - MIN_CELL_SIZE) / 20);

  // Update camera to follow local player
  const updateCamera = useCallback(() => {
    const localPlayer = gameObjects.current.localPlayer;
    if (!localPlayer) return;
    
    const camera = gameObjects.current.camera;
    const targetCameraX = localPlayer.x - VIEWPORT_WIDTH / 2;
    const targetCameraY = localPlayer.y - VIEWPORT_HEIGHT / 2;
    
    camera.x += (targetCameraX - camera.x) * 0.1;
    camera.y += (targetCameraY - camera.y) * 0.1;

    // Keep camera within bounds
    camera.x = Math.max(0, Math.min(WORLD_WIDTH - VIEWPORT_WIDTH, camera.x));
    camera.y = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_HEIGHT, camera.y));
  }, []);

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const objects = gameObjects.current;
    const camera = objects.camera;

    // Clear canvas
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = -camera.x % gridSize; x < VIEWPORT_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIEWPORT_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = -camera.y % gridSize; y < VIEWPORT_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEWPORT_WIDTH, y);
      ctx.stroke();
    }

    // Draw food
    objects.food.forEach(food => {
      const screenX = food.x - camera.x;
      const screenY = food.y - camera.y;

      if (screenX + food.size >= -50 && screenX - food.size <= VIEWPORT_WIDTH + 50 &&
          screenY + food.size >= -50 && screenY - food.size <= VIEWPORT_HEIGHT + 50) {
        
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, food.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw players
    const allPlayers = Object.values(connectedPlayers).filter(p => p.active);
    
    // Sort by size (smallest first, so largest renders on top)
    allPlayers.sort((a, b) => a.size - b.size);
    
    allPlayers.forEach(player => {
      const screenX = player.x - camera.x;
      const screenY = player.y - camera.y;

      if (screenX + player.size >= -50 && screenX - player.size <= VIEWPORT_WIDTH + 50 &&
          screenY + player.size >= -50 && screenY - player.size <= VIEWPORT_HEIGHT + 50) {
        
        // Cell body with gradient
        const gradient = ctx.createRadialGradient(
          screenX - player.size * 0.3, 
          screenY - player.size * 0.3, 
          0, 
          screenX, 
          screenY, 
          player.size
        );
        gradient.addColorStop(0, player.color);
        gradient.addColorStop(1, player.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, player.size, 0, Math.PI * 2);
        ctx.fill();

        // Cell border
        const isLocalPlayer = player.id === objects.localPlayer?.id;
        ctx.strokeStyle = isLocalPlayer ? '#FFD700' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = isLocalPlayer ? 3 : 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, player.size, 0, Math.PI * 2);
        ctx.stroke();

        // Player name
        const fontSize = Math.max(10, Math.min(18, player.size / 4));
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.name, screenX, screenY);

        // Score display for local player
        if (isLocalPlayer && player.size > 30) {
          ctx.fillStyle = '#FFFF00';
          ctx.font = `bold ${Math.min(12, fontSize - 2)}px Arial`;
          ctx.fillText(player.score.toLocaleString(), screenX, screenY + fontSize + 2);
        }
      }
    });

    // Draw world borders
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    
    const borderLeft = -camera.x;
    const borderRight = WORLD_WIDTH - camera.x;
    const borderTop = -camera.y;
    const borderBottom = WORLD_HEIGHT - camera.y;
    
    if (borderLeft > -10 && borderLeft < VIEWPORT_WIDTH + 10) {
      ctx.beginPath();
      ctx.moveTo(borderLeft, 0);
      ctx.lineTo(borderLeft, VIEWPORT_HEIGHT);
      ctx.stroke();
    }
    
    if (borderRight > -10 && borderRight < VIEWPORT_WIDTH + 10) {
      ctx.beginPath();
      ctx.moveTo(borderRight, 0);
      ctx.lineTo(borderRight, VIEWPORT_HEIGHT);
      ctx.stroke();
    }
    
    if (borderTop > -10 && borderTop < VIEWPORT_HEIGHT + 10) {
      ctx.beginPath();
      ctx.moveTo(0, borderTop);
      ctx.lineTo(VIEWPORT_WIDTH, borderTop);
      ctx.stroke();
    }
    
    if (borderBottom > -10 && borderBottom < VIEWPORT_HEIGHT + 10) {
      ctx.beginPath();
      ctx.moveTo(0, borderBottom);
      ctx.lineTo(VIEWPORT_WIDTH, borderBottom);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }, [connectedPlayers]);

  // Main game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const objects = gameObjects.current;
    const localPlayer = objects.localPlayer;
    
    if (!localPlayer) return;

    // Update local player movement
    const targetDist = distance(localPlayer.x, localPlayer.y, localPlayer.targetX, localPlayer.targetY);
    if (targetDist > 5) {
      const angle = Math.atan2(localPlayer.targetY - localPlayer.y, localPlayer.targetX - localPlayer.x);
      const speed = getCellSpeed(localPlayer.size);
      localPlayer.x += Math.cos(angle) * speed;
      localPlayer.y += Math.sin(angle) * speed;
    }

    // Keep player within bounds
    localPlayer.x = Math.max(localPlayer.size, Math.min(WORLD_WIDTH - localPlayer.size, localPlayer.x));
    localPlayer.y = Math.max(localPlayer.size, Math.min(WORLD_HEIGHT - localPlayer.size, localPlayer.y));

    // Check collisions
    checkCollisions(localPlayer);

    // Update camera
    updateCamera();

    // Update player position to Firebase (throttled)
    if (now - objects.lastUpdate > UPDATE_RATE) {
      updatePlayerPosition(localPlayer);
      objects.lastUpdate = now;
    }

    // Render
    render();

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, checkCollisions, updateCamera, updatePlayerPosition, render]);

  // Mouse movement handler
  const handleMouseMove = useCallback((event) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const objects = gameObjects.current;
    const localPlayer = objects.localPlayer;
    if (localPlayer) {
      localPlayer.targetX = mouseX + objects.camera.x;
      localPlayer.targetY = mouseY + objects.camera.y;
    }
  }, [gameState]);

  // Game loop effect
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveGameRoom();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [leaveGameRoom]);

  // Create leaderboard from connected players
  const leaderboard = Object.values(connectedPlayers)
    .filter(p => p.active)
    .sort((a, b) => (Math.floor(b.size * 10) + b.score) - (Math.floor(a.size * 10) + a.score))
    .slice(0, 10)
    .map((player, index) => ({
      rank: index + 1,
      name: player.name,
      score: Math.floor(player.size * 10) + player.score,
      isLocalPlayer: player.id === gameObjects.current.localPlayer?.id
    }));

  if (gameState === 'menu') {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 text-white text-center min-h-96">
        <div className="text-6xl mb-6">🔴</div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Multiplayer Cell Arena
        </h2>
        <p className="text-xl mb-6 text-blue-100">
          Battle your classmates in real-time!
        </p>
        
        <div className="mb-6 p-4 bg-blue-800 rounded-lg">
          <div className="text-lg font-semibold mb-2">Class: {classData?.name || 'Unknown'}</div>
          <div className="text-sm text-blue-200">Room Code: {classData?.classCode || 'N/A'}</div>
        </div>

        <button
          onClick={joinGameRoom}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:shadow-lg transition-all hover:scale-105"
          disabled={!classData?.classCode}
        >
          🚀 Join Multiplayer Game
        </button>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Multiplayer</div>
            <div className="text-blue-200">Play with your classmates in real-time</div>
          </div>
          <div className="bg-green-800 rounded-lg p-4">
            <div className="text-2xl mb-2">🏃</div>
            <div className="font-semibold">Movement</div>
            <div className="text-green-200">Move mouse to control your cell</div>
          </div>
          <div className="bg-purple-800 rounded-lg p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Strategy</div>
            <div className="text-purple-200">Eat food and smaller players to grow</div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'joining') {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 text-white text-center min-h-96 flex items-center justify-center">
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-bold mb-2">Joining Multiplayer Arena...</h3>
          <p className="text-blue-200">Connecting to your classmates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Game HUD */}
      <div className="bg-black bg-opacity-50 rounded-lg p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm text-gray-300">Score: </span>
              <span className="text-xl font-bold text-yellow-400">{score.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-sm text-gray-300">Size: </span>
              <span className="text-lg font-bold text-green-400">
                {gameObjects.current.localPlayer ? Math.floor(gameObjects.current.localPlayer.size) : 0}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-300">Players: </span>
              <span className="text-lg font-bold text-blue-400">
                {Object.values(connectedPlayers).filter(p => p.active).length}
              </span>
            </div>
          </div>
          
          <button
            onClick={leaveGameRoom}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            🚪 Leave Game
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        {/* Game Canvas */}
        <div className="flex-1">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={VIEWPORT_WIDTH}
              height={VIEWPORT_HEIGHT}
              onMouseMove={handleMouseMove}
              className="cursor-none"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
            
            {gameState === 'gameOver' && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 text-center max-w-md">
                  <div className="text-4xl mb-4">💀</div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">You Were Eaten!</h3>
                  <div className="space-y-2 mb-6 text-lg">
                    <div>Final Score: <span className="font-bold text-blue-600">{score.toLocaleString()}</span></div>
                    <div>Cells Eaten: <span className="font-bold text-green-600">{gameStats.cellsEaten}</span></div>
                    <div>Players Eaten: <span className="font-bold text-purple-600">{gameStats.playersEaten}</span></div>
                  </div>
                  <button
                    onClick={joinGameRoom}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg mr-3"
                  >
                    🔄 Respawn
                  </button>
                  <button
                    onClick={() => setGameState('menu')}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 text-lg"
                  >
                    🏠 Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-64 bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 text-center">🏆 Live Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="text-2xl mb-2">👥</div>
              <div>Waiting for players...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.name}_${entry.rank}`}
                  className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                    entry.isLocalPlayer 
                      ? 'bg-yellow-100 border-2 border-yellow-400 font-bold' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`
                      ${entry.rank === 1 ? 'text-yellow-500' : ''}
                      ${entry.rank === 2 ? 'text-gray-400' : ''}
                      ${entry.rank === 3 ? 'text-yellow-600' : ''}
                      font-bold
                    `}>
                      #{entry.rank}
                    </span>
                    <span className="truncate">{entry.name}</span>
                    {entry.isLocalPlayer && <span>👤</span>}
                  </div>
                  <span className="font-bold text-blue-600">
                    {entry.score.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
            Room: {classData?.classCode}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerAgarGame;