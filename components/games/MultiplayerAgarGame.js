// components/games/MultiplayerAgarGame.js - Optimized Real-time Multiplayer Agar Game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { database } from '../../utils/firebase';
import { ref, push, set, update, onChildAdded, onChildChanged, onChildRemoved, off, remove, onDisconnect } from 'firebase/database';

const MultiplayerAgarGame = ({ 
  gameMode = "digital", 
  showToast, 
  studentData, 
  updateStudentData,
  classData,
  classmates = []
}) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const networkIntervalRef = useRef(null);
  const playerRef = useRef(null);
  const roomPath = useRef(null);
  
  const [gameState, setGameState] = useState('menu'); // menu, joining, playing, gameOver
  const [gameRoom, setGameRoom] = useState(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activePlayerCount, setActivePlayerCount] = useState(0);
  const [gameStats, setGameStats] = useState({
    cellsEaten: 0,
    timePlayed: 0,
    playersEaten: 0
  });

  // Game constants
  const WORLD_WIDTH = 4000;
  const WORLD_HEIGHT = 4000;
  const MIN_CELL_SIZE = 15;
  const MAX_CELL_SIZE = 300;
  const FOOD_COUNT = 800;
  const VIEWPORT_WIDTH = 800;
  const VIEWPORT_HEIGHT = 600;
  const NETWORK_RATE = 100; // ms between Firebase syncs

  // Game state held entirely in refs for requestAnimationFrame
  const gameObjects = useRef({
    localPlayer: null,
    remotePlayers: {}, // { id: {x, y, targetX, targetY, size, name, color, score} }
    food: {}, // { id: {x, y, size, color} }
    camera: { x: 0, y: 0 },
    lastNetworkSync: 0,
    mouse: { x: VIEWPORT_WIDTH / 2, y: VIEWPORT_HEIGHT / 2 }
  });

  // Player colors
  const PLAYER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#3742FA', '#2F3542',
    '#FF3838', '#2ECC71', '#3498DB', '#9B59B6',
    '#F39C12', '#E67E22', '#E74C3C', '#1ABC9C'
  ];

  // Utility functions
  const distance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const getCellSpeed = (size) => Math.max(1.5, 6 - (size - MIN_CELL_SIZE) / 25);
  const getRandomColor = () => `hsl(${Math.random() * 360}, 80%, 60%)`;

  // Determine an initial spawn point
  const getSpawnPoint = () => ({
    x: 200 + Math.random() * (WORLD_WIDTH - 400),
    y: 200 + Math.random() * (WORLD_HEIGHT - 400)
  });

  const createLocalPlayer = useCallback(() => {
    // Attempt to keep same color per character
    const charCode = (studentData?.firstName?.charCodeAt(0) || 0) + (studentData?.lastName?.charCodeAt(0) || 0);
    const colorIndex = charCode % PLAYER_COLORS.length;
    const spawn = getSpawnPoint();

    return {
      id: studentData?.id || `anon_${Date.now()}`,
      name: studentData?.firstName || 'Student',
      x: spawn.x,
      y: spawn.y,
      size: MIN_CELL_SIZE,
      color: PLAYER_COLORS[colorIndex],
      targetX: spawn.x,
      targetY: spawn.y,
      score: 0,
      active: true
    };
  }, [studentData]);

  // Network listeners setup
  const setupNetworkListeners = (roomId) => {
    const foodRefPath = ref(database, `gameRooms/${roomId}/food`);
    const playersRefPath = ref(database, `gameRooms/${roomId}/players`);

    // --- FOOD LISTENERS ---
    onChildAdded(foodRefPath, (snapshot) => {
      if (snapshot.exists()) {
        gameObjects.current.food[snapshot.key] = snapshot.val();
      }
    });

    onChildRemoved(foodRefPath, (snapshot) => {
      delete gameObjects.current.food[snapshot.key];
    });

    // --- PLAYER LISTENERS ---
    onChildAdded(playersRefPath, (snapshot) => {
      if (snapshot.exists()) {
        const p = snapshot.val();
        if (p.id !== gameObjects.current.localPlayer?.id && p.active) {
          gameObjects.current.remotePlayers[snapshot.key] = p;
        }
      }
    });

    onChildChanged(playersRefPath, (snapshot) => {
      if (snapshot.exists()) {
        const p = snapshot.val();
        
        // If this is US (from server), we check if we got eaten!
        if (p.id === gameObjects.current.localPlayer?.id) {
          if (!p.active) {
            setGameState('gameOver');
            showToast('You were eaten!', 'error');
          } else if (p.size < gameObjects.current.localPlayer.size - 10) {
            // Significant size reduction = eaten or forced resize
            gameObjects.current.localPlayer.size = p.size;
            gameObjects.current.localPlayer.score = p.score;
            setGameState('gameOver'); 
            showToast('You were eaten!', 'error');
          }
        } 
        // If it's a remote player
        else {
          if (p.active) {
            gameObjects.current.remotePlayers[snapshot.key] = p;
          } else {
            delete gameObjects.current.remotePlayers[snapshot.key];
          }
        }
      }
    });

    onChildRemoved(playersRefPath, (snapshot) => {
      delete gameObjects.current.remotePlayers[snapshot.key];
    });
  };

  const removeNetworkListeners = (roomId) => {
    if (!roomId) return;
    off(ref(database, `gameRooms/${roomId}/food`));
    off(ref(database, `gameRooms/${roomId}/players`));
  };

  // Join the Game Room
  const joinGameRoom = useCallback(async () => {
    if (!classData?.classCode) {
      showToast('Class code not found!', 'error');
      return;
    }

    setGameState('joining');
    
    try {
      const roomId = `agar_${classData.classCode.toLowerCase()}`;
      roomPath.current = roomId;
      
      const localPlayer = createLocalPlayer();
      gameObjects.current.localPlayer = localPlayer;
      gameObjects.current.remotePlayers = {}; // reset
      gameObjects.current.food = {}; // reset
      
      playerRef.current = ref(database, `gameRooms/${roomId}/players/${localPlayer.id}`);
      
      // We must write roomCode for Firebase Validation Rules to pass!
      await update(ref(database, `gameRooms/${roomId}`), {
        roomCode: classData.classCode,
        gameType: 'cell-arena',
        lastActivity: Date.now(),
        [`players/${localPlayer.id}`]: {
          ...localPlayer,
          timestamp: Date.now()
        }
      });

      // Manage disconnects
      onDisconnect(playerRef.current).update({ active: false, size: 0 });

      // Check if food exists, if not generate initial food (avoids 1200 items, just do 400 locally!)
      // BUT, Firebase limit... we should let players dynamically spawn food over time if low!
      // For now we'll spawn some if there's very little.
      
      setupNetworkListeners(roomId);

      setGameRoom(roomId);
      setScore(0);
      setGameStats({ cellsEaten: 0, timePlayed: 0, playersEaten: 0 });
      setGameState('playing');
      showToast(`Joined the arena!`, 'success');

      // Start the network sync interval
      networkIntervalRef.current = setInterval(syncNetwork, NETWORK_RATE);

      // Periodically generate food if room is barren (only the first player or randomly)
      setTimeout(() => generateFoodIfNeeded(roomId), 2000);

    } catch (error) {
      console.error('Error joining game room:', error);
      showToast('Failed to join multiplayer game', 'error');
      setGameState('menu');
    }
  }, [classData, createLocalPlayer, showToast]);

  const generateFoodIfNeeded = async (roomId) => {
    const currentFoodCount = Object.keys(gameObjects.current.food).length;
    if (currentFoodCount < FOOD_COUNT / 2) {
      // Spawn up to 100 food items at a time to restore balance quickly
      const spawnCount = Math.min(100, FOOD_COUNT - currentFoodCount);
      const updates = {};
      for(let i=0; i<spawnCount; i++) {
        const id = `food_${Date.now()}_${Math.floor(Math.random()*10000)}`;
        updates[id] = {
          id,
          x: Math.random() * WORLD_WIDTH,
          y: Math.random() * WORLD_HEIGHT,
          size: 3 + Math.random() * 4,
          color: getRandomColor()
        };
      }
      try {
        await update(ref(database, `gameRooms/${roomId}/food`), updates);
      } catch (e) {
        // ignore
      }
    }
    // Continue checking every few seconds as long as we're in the game
    setTimeout(() => {
        if (gameState === 'playing') generateFoodIfNeeded(roomId);
    }, 5000);
  };

  const leaveGameRoom = useCallback(async () => {
    try {
      clearInterval(networkIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

      if (playerRef.current) {
        await update(playerRef.current, { active: false, size: 0 });
      }
      removeNetworkListeners(roomPath.current);
      
      setGameState('menu');
      
    } catch (error) {
      console.error('Error leaving game room:', error);
    }
  }, []);

  // Update position to Firebase
  const syncNetwork = useCallback(() => {
    const loc = gameObjects.current.localPlayer;
    if (!loc || !playerRef.current || gameState !== 'playing') return;

    // Send the current target and loc
    update(playerRef.current, {
      x: Math.round(loc.x),
      y: Math.round(loc.y),
      targetX: Math.round(loc.targetX),
      targetY: Math.round(loc.targetY),
      size: Math.round(loc.size * 10) / 10,
      score: loc.score,
      timestamp: Date.now()
    }).catch(() => {});

    // Every sync, maybe spawn a few food items if room is getting empty to maintain density randomly
    if (Math.random() < 0.4 && Object.keys(gameObjects.current.food).length < FOOD_COUNT) {
      const id = `f_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      set(ref(database, `gameRooms/${roomPath.current}/food/${id}`), {
        id,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: 3 + Math.random() * 4,
        color: getRandomColor()
      }).catch(()=>{});
    }
  }, [gameState]);

  // Eating Mechanics
  const checkEating = () => {
    const p = gameObjects.current.localPlayer;
    if (!p || gameState !== 'playing') return;

    // Eat Food
    Object.values(gameObjects.current.food).forEach(food => {
      const dist = distance(p.x, p.y, food.x, food.y);
      if (dist < p.size * 0.85 + food.size) {
        // Eat it locally immediately
        delete gameObjects.current.food[food.id];
        
        // Update stats
        p.size = Math.min(MAX_CELL_SIZE, p.size + food.size * 0.2);
        p.score += Math.floor(food.size * 2);
        setScore(p.score);
        setGameStats(s => ({...s, cellsEaten: s.cellsEaten + 1}));

        // Send removal to Firebase
        remove(ref(database, `gameRooms/${roomPath.current}/food/${food.id}`)).catch(()=>{});
      }
    });

    // Eat Other Players
    Object.values(gameObjects.current.remotePlayers).forEach(remote => {
      const dist = distance(p.x, p.y, remote.x, remote.y);
      const sizeDiff = p.size - remote.size;

      // Can we eat them? (Must be 10% larger)
      if (sizeDiff > remote.size * 0.1 && dist < p.size * 0.8) {
        // Eat them!
        p.size = Math.min(MAX_CELL_SIZE, p.size + remote.size * 0.5);
        p.score += Math.floor(remote.size * 10);
        setScore(p.score);
        setGameStats(s => ({...s, playersEaten: s.playersEaten + 1}));
        showToast(`You ate ${remote.name}! +${Math.floor(remote.size * 10)} pts`, 'success');

        // Kill them in Firebase
        update(ref(database, `gameRooms/${roomPath.current}/players/${remote.id}`), {
          active: false,
          size: 10,
          killedBy: p.name
        }).catch(()=>{});
        
        // Remove locally temporarily so we don't eat them multiple times this frame
        delete gameObjects.current.remotePlayers[remote.id];
      }
    });
  };

  // Interpolate and handle movement
  const updateMovement = () => {
    const objs = gameObjects.current;
    
    // 1. Move Local Player
    const p = objs.localPlayer;
    if (p) {
      // Update target based on mouse AND camera (mouse is screen relative)
      p.targetX = objs.mouse.x + objs.camera.x;
      p.targetY = objs.mouse.y + objs.camera.y;

      const dist = distance(p.x, p.y, p.targetX, p.targetY);
      if (dist > 5) {
        const speed = getCellSpeed(p.size);
        const ratio = Math.min(1, speed / dist);
        p.x += (p.targetX - p.x) * ratio;
        p.y += (p.targetY - p.y) * ratio;
      }
      p.x = Math.max(p.size, Math.min(WORLD_WIDTH - p.size, p.x));
      p.y = Math.max(p.size, Math.min(WORLD_HEIGHT - p.size, p.y));

      // Update camera smooth follow
      const targetCamX = p.x - VIEWPORT_WIDTH / 2;
      const targetCamY = p.y - VIEWPORT_HEIGHT / 2;
      objs.camera.x += (targetCamX - objs.camera.x) * 0.1;
      objs.camera.y += (targetCamY - objs.camera.y) * 0.1;
      objs.camera.x = Math.max(0, Math.min(WORLD_WIDTH - VIEWPORT_WIDTH, objs.camera.x));
      objs.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_HEIGHT, objs.camera.y));
    }

    // 2. Interpolate Remote Players
    Object.values(objs.remotePlayers).forEach(remote => {
      const dist = distance(remote.x, remote.y, remote.targetX, remote.targetY);
      if (dist > 2) {
        const speed = getCellSpeed(remote.size);
        // Slightly faster to catch up to network latency
        const ratio = Math.min(1, (speed * 1.2) / dist);
        remote.x += (remote.targetX - remote.x) * ratio;
        remote.y += (remote.targetY - remote.y) * ratio;
      }
    });
  };

  const updatePeriodicState = () => {
    // Render dynamic leaderboard every ~1s (handled here just for UI react updates)
    const all = [gameObjects.current.localPlayer, ...Object.values(gameObjects.current.remotePlayers)].filter(Boolean);
    setActivePlayerCount(all.length);
    
    const sorted = [...all].sort((a,b) => b.score - a.score).slice(0, 10);
    setLeaderboard(sorted.map((s, i) => ({
      rank: i+1,
      name: s.name,
      score: s.score,
      isLocal: s.id === gameObjects.current.localPlayer?.id
    })));
  };

  // Main Render/Update Loop
  const loop = useCallback(() => {
    if (gameState !== 'playing') return;

    // Logic
    updateMovement();
    checkEating();

    // Occasional UI updates for performance (we skip expensive React state setters on every frame)
    if (Math.random() < 0.05) updatePeriodicState();

    // Render 
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const { camera, localPlayer, remotePlayers, food } = gameObjects.current;

      // Clear
      ctx.fillStyle = '#111827'; // Dark gray/bg
      ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = -camera.x % gridSize; x < VIEWPORT_WIDTH; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VIEWPORT_HEIGHT); ctx.stroke();
      }
      for (let y = -camera.y % gridSize; y < VIEWPORT_HEIGHT; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEWPORT_WIDTH, y); ctx.stroke();
      }

      // Draw World Borders
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      const padding = 2; // draw slightly inside so we see it
      const borderL = -camera.x + padding;
      const borderR = WORLD_WIDTH - camera.x - padding;
      const borderT = -camera.y + padding;
      const borderB = WORLD_HEIGHT - camera.y - padding;
      ctx.strokeRect(borderL, borderT, WORLD_WIDTH, WORLD_HEIGHT);
      ctx.setLineDash([]);

      // Draw Food
      Object.values(food).forEach(f => {
        const sx = f.x - camera.x;
        const sy = f.y - camera.y;
        if (sx + f.size >= 0 && sx - f.size <= VIEWPORT_WIDTH && sy + f.size >= 0 && sy - f.size <= VIEWPORT_HEIGHT) {
          ctx.fillStyle = f.color;
          ctx.beginPath(); ctx.arc(sx, sy, f.size, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Draw all Players (sorted by size, smallest first so big eats visually properly)
      const visiblePlayers = [localPlayer, ...Object.values(remotePlayers)].filter(Boolean)
        .sort((a,b) => a.size - b.size);

      visiblePlayers.forEach(p => {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;

        if (sx + p.size >= -50 && sx - p.size <= VIEWPORT_WIDTH + 50 && sy + p.size >= -50 && sy - p.size <= VIEWPORT_HEIGHT + 50) {
          const isLocal = p.id === localPlayer?.id;
          
          ctx.beginPath();
          ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
          
          const grad = ctx.createRadialGradient(sx - p.size*0.3, sy - p.size*0.3, 0, sx, sy, p.size);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, p.color + '80'); // transparency
          
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.lineWidth = isLocal ? 4 : 2;
          ctx.strokeStyle = isLocal ? '#eab308' : 'rgba(255,255,255,0.4)';
          ctx.stroke();

          // Text
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          let fSize = Math.max(12, p.size * 0.3);
          ctx.font = `bold ${Math.min(fSize, 24)}px Inter, sans-serif`;
          ctx.fillText(p.name, sx, sy - (p.size * 0.1));
          
          // Score under name if large enough
          if (p.size > 30) {
            ctx.font = `normal ${Math.min(fSize * 0.7, 16)}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.fillText(Math.floor(p.size).toString(), sx, sy + (p.size * 0.3));
          }
        }
      });
    }

    animationFrameRef.current = requestAnimationFrame(loop);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, loop]);

  useEffect(() => {
    return () => leaveGameRoom();
  }, [leaveGameRoom]);

  const updatePointer = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    gameObjects.current.mouse.x = (clientX - rect.left) * scaleX;
    gameObjects.current.mouse.y = (clientY - rect.top) * scaleY;
  };

  const handleMouseMove = (e) => updatePointer(e.clientX, e.clientY);
  
  const handleTouch = (e) => {
    // Stop scrolling while dragging on the canvas
    if (e.touches && e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-8 text-white text-center min-h-[500px] flex items-center justify-center shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_100%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-lg">
          <div className="text-8xl mb-6 animate-pulse">🦠</div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            Cell Battle Arena
          </h2>
          <p className="text-xl mb-10 text-indigo-200">
            Join your classmates in the arena. Eat dots to grow, and hunt smaller cells to claim victory!
          </p>
          
          <div className="mb-8 p-6 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div className="text-indigo-200 font-medium mb-1">Current Class Room</div>
            <div className="text-3xl font-bold tracking-widest text-emerald-400 font-mono">
              {classData?.classCode || 'NO CODE'}
            </div>
          </div>

          <button
            onClick={joinGameRoom}
            disabled={!classData?.classCode}
            className={`w-full py-5 rounded-2xl font-bold text-2xl transition-all shadow-xl
              ${classData?.classCode 
                ? 'bg-gradient-to-r from-emerald-500 hover:from-emerald-400 to-teal-600 hover:to-teal-500 text-white hover:scale-[1.02] transform' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            {classData?.classCode ? '🚀 Enter Arena' : 'Missing Class Code'}
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'joining') {
    return (
      <div className="bg-indigo-900 rounded-2xl p-8 text-white text-center min-h-[500px] flex items-center justify-center border border-indigo-700/50">
        <div className="space-y-6">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-400 mx-auto"></div>
          <h3 className="text-2xl font-bold text-emerald-400">Connecting to Arena...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Game Header */}
      <div className="bg-gray-900 rounded-2xl p-4 md:p-5 text-white shadow-lg border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Score</span>
            <span className="text-2xl font-bold text-yellow-400">{score.toLocaleString()}</span>
          </div>
          <div className="bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Size</span>
            <span className="text-2xl font-bold text-emerald-400">
              {gameObjects.current.localPlayer ? Math.floor(gameObjects.current.localPlayer.size) : 0}
            </span>
          </div>
          <div className="hidden md:block bg-gray-800 rounded-xl px-4 py-2 border border-gray-700">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Active Players</span>
            <span className="text-2xl font-bold text-cyan-400">{activePlayerCount}</span>
          </div>
        </div>
        
        <button
          onClick={leaveGameRoom}
          className="bg-red-500/10 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all font-semibold"
        >
          Leave Game
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Game Canvas container */}
        <div className="flex-1 order-2 lg:order-1 relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 border-2 border-gray-800">
          <canvas
            ref={canvasRef}
            width={VIEWPORT_WIDTH}
            height={VIEWPORT_HEIGHT}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            className="w-full h-auto cursor-crosshair touch-none"
            style={{ aspectRatio: '4/3' }}
          />
          
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
              <div className="bg-gray-900 p-8 md:p-10 rounded-3xl border border-red-500/30 text-center max-w-sm w-full mx-4 shadow-2xl transform scale-100">
                <div className="text-6xl mb-6">💀</div>
                <h3 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                  Eaten Alive!
                </h3>
                <p className="text-gray-400 mb-8">Better luck next time.</p>
                
                <div className="bg-gray-800 rounded-2xl p-5 mb-8 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Final Score</span>
                    <span className="font-bold text-xl text-yellow-400">{score.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Food Eaten</span>
                    <span className="font-semibold text-emerald-400">{gameStats.cellsEaten}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Players Eaten</span>
                    <span className="font-semibold text-cyan-400">{gameStats.playersEaten}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={joinGameRoom}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                  >
                    Respawn
                  </button>
                  <button
                    onClick={leaveGameRoom}
                    className="w-full bg-gray-800 text-gray-300 py-3 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard Column */}
        <div className="lg:w-72 order-1 lg:order-2 shrink-0">
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800 shadow-xl lg:h-[calc(100%-0px)] overflow-hidden flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              🏆 Top Players
            </h3>
            
            {leaderboard.length === 0 ? (
              <div className="text-center text-gray-500 py-10 flex-1 flex flex-col justify-center">
                 <span className="text-3xl mb-3 block opacity-50">📡</span>
                Waiting for players...
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.name}_${entry.rank}`}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      entry.isLocal 
                        ? 'bg-indigo-600/20 border border-indigo-500/50' 
                        : 'bg-gray-800/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`font-black text-sm w-5 text-center shrink-0 ${
                        entry.rank === 1 ? 'text-yellow-400' :
                        entry.rank === 2 ? 'text-gray-300' :
                        entry.rank === 3 ? 'text-orange-400' : 'text-gray-600'
                      }`}>
                        {entry.rank}
                      </span>
                      <span className={`truncate font-medium text-sm ${entry.isLocal ? 'text-white' : 'text-gray-300'}`}>
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-yellow-400/90 shrink-0 ml-2">
                      {entry.score >= 1000 ? (entry.score/1000).toFixed(1)+'k' : entry.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4 mt-4 border-t border-gray-800 text-xs text-center text-gray-500 font-mono tracking-widest">
              ROOM: {classData?.classCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerAgarGame;