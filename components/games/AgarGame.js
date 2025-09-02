// components/games/AgarGame.js - Agar.io Clone with Bots
import React, { useState, useEffect, useRef, useCallback } from 'react';

const AgarGame = ({ gameMode = "digital", showToast, studentData, updateStudentData }) => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, gameOver
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState(studentData?.firstName || 'Player');
  const [gameStats, setGameStats] = useState({
    cellsEaten: 0,
    timePlayed: 0,
    bestScore: 0
  });

  // Game constants
  const WORLD_WIDTH = 3000;
  const WORLD_HEIGHT = 3000;
  const MIN_CELL_SIZE = 10;
  const MAX_CELL_SIZE = 200;
  const FOOD_COUNT = 800;
  const BOT_COUNT = 12;
  const VIEWPORT_WIDTH = 800;
  const VIEWPORT_HEIGHT = 600;

  // Game objects
  const gameObjects = useRef({
    player: null,
    bots: [],
    food: [],
    camera: { x: 0, y: 0 }
  });

  // Player colors - educational theme
  const PLAYER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
    '#00D2D3', '#FF9F43', '#3742FA', '#2F3542'
  ];

  // Bot names - educational theme
  const BOT_NAMES = [
    'BookBot', 'MathWhiz', 'ScienceAce', 'WordSmith', 'QuizMaster',
    'StudyBuddy', 'BrainBox', 'LearnBot', 'WisdomCell', 'KnowledgeBlob',
    'SmartSphere', 'EduCell', 'ThinkTank', 'MindMerge', 'IQBubble'
  ];

  // Initialize game objects
  const initializeGame = useCallback(() => {
    const objects = gameObjects.current;
    
    // Create player
    objects.player = {
      id: 'player',
      name: playerName,
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: 20,
      color: PLAYER_COLORS[0],
      speed: 0,
      targetX: 0,
      targetY: 0,
      isPlayer: true,
      score: 0
    };

    // Create bots
    objects.bots = [];
    for (let i = 0; i < BOT_COUNT; i++) {
      objects.bots.push({
        id: `bot_${i}`,
        name: BOT_NAMES[i % BOT_NAMES.length],
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: 15 + Math.random() * 25,
        color: PLAYER_COLORS[(i + 1) % PLAYER_COLORS.length],
        speed: 0,
        targetX: 0,
        targetY: 0,
        isBot: true,
        lastTargetUpdate: 0,
        aggressiveness: Math.random() * 0.7 + 0.3, // 0.3-1.0
        score: Math.floor(Math.random() * 500)
      });
    }

    // Create food
    objects.food = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
      objects.food.push({
        id: `food_${i}`,
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        size: 3 + Math.random() * 4,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        isFood: true
      });
    }

    // Center camera on player
    objects.camera.x = objects.player.x - VIEWPORT_WIDTH / 2;
    objects.camera.y = objects.player.y - VIEWPORT_HEIGHT / 2;

    setScore(0);
    setGameStats(prev => ({ ...prev, cellsEaten: 0, timePlayed: 0 }));
  }, [playerName]);

  // Calculate cell speed based on size
  const getCellSpeed = (size) => {
    return Math.max(1, 5 - (size - MIN_CELL_SIZE) / 20);
  };

  // Distance between two points
  const distance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Check if one cell can eat another
  const canEat = (eater, food) => {
    const sizeDiff = eater.size - food.size;
    const dist = distance(eater.x, eater.y, food.x, food.y);
    return sizeDiff > food.size * 0.1 && dist < eater.size * 0.8;
  };

  // Bot AI logic
  const updateBotAI = (bot, allCells, food, deltaTime) => {
    const now = Date.now();
    
    // Update target every 500ms + random variance
    if (now - bot.lastTargetUpdate > 500 + Math.random() * 1000) {
      const nearbyObjects = [];
      
      // Find nearby food
      food.forEach(f => {
        const dist = distance(bot.x, bot.y, f.x, f.y);
        if (dist < 200) {
          nearbyObjects.push({ ...f, distance: dist, type: 'food', priority: 10 });
        }
      });

      // Find nearby cells
      allCells.forEach(cell => {
        if (cell.id === bot.id) return;
        
        const dist = distance(bot.x, bot.y, cell.x, cell.y);
        if (dist < 300) {
          let priority = 0;
          
          if (canEat(bot, cell)) {
            // Can eat this cell - high priority
            priority = 8 - (dist / 50);
          } else if (canEat(cell, bot)) {
            // This cell can eat bot - avoid!
            priority = -15 + (dist / 30);
          } else {
            // Neutral - low priority to approach
            priority = 1;
          }
          
          nearbyObjects.push({ 
            ...cell, 
            distance: dist, 
            type: 'cell', 
            priority: priority * bot.aggressiveness 
          });
        }
      });

      // Sort by priority and distance
      nearbyObjects.sort((a, b) => {
        if (Math.abs(a.priority - b.priority) > 1) {
          return b.priority - a.priority;
        }
        return a.distance - b.distance;
      });

      // Choose target
      if (nearbyObjects.length > 0) {
        const target = nearbyObjects[0];
        if (target.priority > 0) {
          bot.targetX = target.x;
          bot.targetY = target.y;
        } else {
          // Flee in opposite direction
          const angle = Math.atan2(target.y - bot.y, target.x - bot.x);
          const fleeDistance = 200;
          bot.targetX = bot.x - Math.cos(angle) * fleeDistance;
          bot.targetY = bot.y - Math.sin(angle) * fleeDistance;
        }
      } else {
        // No nearby objects, wander randomly
        const angle = Math.random() * Math.PI * 2;
        const wanderDistance = 100 + Math.random() * 200;
        bot.targetX = bot.x + Math.cos(angle) * wanderDistance;
        bot.targetY = bot.y + Math.sin(angle) * wanderDistance;
      }

      // Keep targets within world bounds
      bot.targetX = Math.max(50, Math.min(WORLD_WIDTH - 50, bot.targetX));
      bot.targetY = Math.max(50, Math.min(WORLD_HEIGHT - 50, bot.targetY));
      
      bot.lastTargetUpdate = now;
    }

    // Move towards target
    const targetDist = distance(bot.x, bot.y, bot.targetX, bot.targetY);
    if (targetDist > 5) {
      const angle = Math.atan2(bot.targetY - bot.y, bot.targetX - bot.x);
      const speed = getCellSpeed(bot.size);
      bot.x += Math.cos(angle) * speed;
      bot.y += Math.sin(angle) * speed;
    }

    // Keep within world bounds
    bot.x = Math.max(bot.size, Math.min(WORLD_WIDTH - bot.size, bot.x));
    bot.y = Math.max(bot.size, Math.min(WORLD_HEIGHT - bot.size, bot.y));
  };

  // Handle eating logic
  const handleEating = () => {
    const objects = gameObjects.current;
    const allCells = [objects.player, ...objects.bots];

    // Check cell vs food
    allCells.forEach(cell => {
      objects.food.forEach((food, foodIndex) => {
        if (canEat(cell, food)) {
          // Eat food
          cell.size += food.size * 0.3;
          cell.size = Math.min(cell.size, MAX_CELL_SIZE);
          
          if (cell.isPlayer) {
            const points = Math.floor(food.size * 2);
            setScore(prev => prev + points);
            setGameStats(prev => ({ 
              ...prev, 
              cellsEaten: prev.cellsEaten + 1 
            }));
          } else {
            cell.score += Math.floor(food.size * 2);
          }

          // Replace eaten food
          objects.food[foodIndex] = {
            id: `food_${Date.now()}_${Math.random()}`,
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: 3 + Math.random() * 4,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            isFood: true
          };
        }
      });
    });

    // Check cell vs cell
    allCells.forEach((eater, eaterIndex) => {
      allCells.forEach((food, foodIndex) => {
        if (eater.id !== food.id && canEat(eater, food)) {
          // Eat the cell
          const sizeGain = food.size * 0.7;
          eater.size += sizeGain;
          eater.size = Math.min(eater.size, MAX_CELL_SIZE);

          if (eater.isPlayer) {
            const points = Math.floor(food.size * 5);
            setScore(prev => prev + points);
            setGameStats(prev => ({ 
              ...prev, 
              cellsEaten: prev.cellsEaten + 1 
            }));
            showToast(`Ate ${food.name}! +${points} points`, 'success');
          } else {
            eater.score += Math.floor(food.size * 5);
          }

          if (food.isPlayer) {
            // Player was eaten - game over
            setGameState('gameOver');
            showToast(`You were eaten by ${eater.name}!`, 'error');
            return;
          }

          // Respawn the eaten bot
          if (food.isBot) {
            objects.bots[foodIndex - 1] = {
              id: `bot_${Date.now()}`,
              name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
              x: Math.random() * WORLD_WIDTH,
              y: Math.random() * WORLD_HEIGHT,
              size: 15 + Math.random() * 10,
              color: PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)],
              speed: 0,
              targetX: 0,
              targetY: 0,
              isBot: true,
              lastTargetUpdate: 0,
              aggressiveness: Math.random() * 0.7 + 0.3,
              score: 0
            };
          }
        }
      });
    });
  };

  // Update camera to follow player
  const updateCamera = () => {
    const objects = gameObjects.current;
    const player = objects.player;
    
    // Smooth camera movement
    const targetCameraX = player.x - VIEWPORT_WIDTH / 2;
    const targetCameraY = player.y - VIEWPORT_HEIGHT / 2;
    
    objects.camera.x += (targetCameraX - objects.camera.x) * 0.1;
    objects.camera.y += (targetCameraY - objects.camera.y) * 0.1;

    // Keep camera within world bounds
    objects.camera.x = Math.max(0, Math.min(WORLD_WIDTH - VIEWPORT_WIDTH, objects.camera.x));
    objects.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - VIEWPORT_HEIGHT, objects.camera.y));
  };

  // Update leaderboard
  const updateLeaderboard = () => {
    const objects = gameObjects.current;
    const allCells = [
      { ...objects.player, score: score },
      ...objects.bots
    ];

    const sortedCells = allCells
      .sort((a, b) => Math.floor(b.size * 10 + b.score) - Math.floor(a.size * 10 + a.score))
      .slice(0, 10)
      .map((cell, index) => ({
        rank: index + 1,
        name: cell.name,
        score: Math.floor(cell.size * 10 + cell.score),
        isPlayer: cell.isPlayer
      }));

    setLeaderboard(sortedCells);
  };

  // Render game
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const objects = gameObjects.current;

    // Clear canvas
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    
    for (let x = -objects.camera.x % gridSize; x < VIEWPORT_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIEWPORT_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = -objects.camera.y % gridSize; y < VIEWPORT_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIEWPORT_WIDTH, y);
      ctx.stroke();
    }

    // Draw food
    objects.food.forEach(food => {
      const screenX = food.x - objects.camera.x;
      const screenY = food.y - objects.camera.y;

      if (screenX + food.size >= 0 && screenX - food.size <= VIEWPORT_WIDTH &&
          screenY + food.size >= 0 && screenY - food.size <= VIEWPORT_HEIGHT) {
        
        ctx.fillStyle = food.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, food.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw cells (bots first, then player on top)
    const allCells = [...objects.bots, objects.player];
    
    allCells.forEach(cell => {
      const screenX = cell.x - objects.camera.x;
      const screenY = cell.y - objects.camera.y;

      if (screenX + cell.size >= 0 && screenX - cell.size <= VIEWPORT_WIDTH &&
          screenY + cell.size >= 0 && screenY - cell.size <= VIEWPORT_HEIGHT) {
        
        // Cell body
        const gradient = ctx.createRadialGradient(
          screenX - cell.size * 0.3, 
          screenY - cell.size * 0.3, 
          0, 
          screenX, 
          screenY, 
          cell.size
        );
        gradient.addColorStop(0, cell.color);
        gradient.addColorStop(1, cell.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, cell.size, 0, Math.PI * 2);
        ctx.fill();

        // Cell border
        ctx.strokeStyle = cell.isPlayer ? '#FFD700' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = cell.isPlayer ? 3 : 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, cell.size, 0, Math.PI * 2);
        ctx.stroke();

        // Cell name
        const fontSize = Math.max(10, Math.min(18, cell.size / 4));
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.name, screenX, screenY);
      }
    });

    // Draw world borders
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 10]);
    
    const borderLeft = -objects.camera.x;
    const borderRight = WORLD_WIDTH - objects.camera.x;
    const borderTop = -objects.camera.y;
    const borderBottom = WORLD_HEIGHT - objects.camera.y;
    
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
  };

  // Main game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const deltaTime = 16; // Assume 60 FPS
    const objects = gameObjects.current;

    // Update player movement
    const player = objects.player;
    const targetDist = distance(player.x, player.y, player.targetX, player.targetY);
    if (targetDist > 5) {
      const angle = Math.atan2(player.targetY - player.y, player.targetX - player.x);
      const speed = getCellSpeed(player.size);
      player.x += Math.cos(angle) * speed;
      player.y += Math.sin(angle) * speed;
    }

    // Keep player within bounds
    player.x = Math.max(player.size, Math.min(WORLD_WIDTH - player.size, player.x));
    player.y = Math.max(player.size, Math.min(WORLD_HEIGHT - player.size, player.y));

    // Update bots
    const allCells = [player, ...objects.bots];
    objects.bots.forEach(bot => {
      updateBotAI(bot, allCells, objects.food, deltaTime);
    });

    // Handle eating
    handleEating();

    // Update camera
    updateCamera();

    // Update leaderboard
    updateLeaderboard();

    // Update game stats
    setGameStats(prev => ({ 
      ...prev, 
      timePlayed: prev.timePlayed + deltaTime,
      bestScore: Math.max(prev.bestScore, score)
    }));

    // Render
    render();

    // Continue game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score]);

  // Mouse movement handler
  const handleMouseMove = (event) => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const objects = gameObjects.current;
    objects.player.targetX = mouseX + objects.camera.x;
    objects.player.targetY = mouseY + objects.camera.y;
  };

  // Start game
  const startGame = () => {
    initializeGame();
    setGameState('playing');
  };

  // Restart game
  const restartGame = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    startGame();
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  // Start game loop when playing
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
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  if (gameState === 'menu') {
    return (
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-8 text-white text-center min-h-96">
        <div className="text-6xl mb-6">🟢</div>
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          Cell Battle Arena
        </h2>
        <p className="text-xl mb-6 text-blue-100">
          Grow your cell by eating food and smaller players!
        </p>
        
        <div className="mb-6">
          <label className="block text-lg mb-2">Your Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white text-black text-center font-semibold"
            maxLength="12"
          />
        </div>

        <button
          onClick={startGame}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:shadow-lg transition-all hover:scale-105"
        >
          🚀 Start Game
        </button>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold">Objective</div>
            <div className="text-blue-200">Grow by eating smaller cells and food</div>
          </div>
          <div className="bg-green-800 rounded-lg p-4">
            <div className="text-2xl mb-2">🏃</div>
            <div className="font-semibold">Movement</div>
            <div className="text-green-200">Move mouse to control your cell</div>
          </div>
          <div className="bg-purple-800 rounded-lg p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Strategy</div>
            <div className="text-purple-200">Larger cells move slower but can eat more</div>
          </div>
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
                {gameObjects.current.player ? Math.floor(gameObjects.current.player.size) : 0}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-300">Eaten: </span>
              <span className="text-lg font-bold text-blue-400">{gameStats.cellsEaten}</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={togglePause}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
            >
              {gameState === 'playing' ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            <button
              onClick={restartGame}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
            >
              🔄 Restart
            </button>
          </div>
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
            
            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 text-center">
                  <div className="text-4xl mb-4">⏸️</div>
                  <h3 className="text-xl font-bold mb-4">Game Paused</h3>
                  <button
                    onClick={togglePause}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    ▶️ Resume
                  </button>
                </div>
              </div>
            )}

            {gameState === 'gameOver' && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-8 text-center max-w-md">
                  <div className="text-4xl mb-4">💀</div>
                  <h3 className="text-2xl font-bold mb-4 text-red-600">Game Over!</h3>
                  <div className="space-y-2 mb-6 text-lg">
                    <div>Final Score: <span className="font-bold text-blue-600">{score.toLocaleString()}</span></div>
                    <div>Cells Eaten: <span className="font-bold text-green-600">{gameStats.cellsEaten}</span></div>
                    <div>Time Played: <span className="font-bold text-purple-600">{Math.floor(gameStats.timePlayed / 1000)}s</span></div>
                  </div>
                  <button
                    onClick={restartGame}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
                  >
                    🔄 Play Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="w-64 bg-white rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4 text-center">🏆 Leaderboard</h3>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.name}
                className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                  entry.isPlayer 
                    ? 'bg-yellow-100 border-2 border-yellow-400 font-bold' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`
                    ${index === 0 ? 'text-yellow-500' : ''}
                    ${index === 1 ? 'text-gray-400' : ''}
                    ${index === 2 ? 'text-yellow-600' : ''}
                    font-bold
                  `}>
                    #{entry.rank}
                  </span>
                  <span className="truncate">{entry.name}</span>
                  {entry.isPlayer && <span>👤</span>}
                </div>
                <span className="font-bold text-blue-600">
                  {entry.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgarGame;