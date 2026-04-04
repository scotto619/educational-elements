import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Zap } from 'lucide-react';

const EndlessRunnerGame = ({ studentData, showToast, updateStudentData, classData, classmates }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [gamePhase, setGamePhase] = useState('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [obstaclesDodged, setObstaclesDodged] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem(`endlessrunner-highscore-${studentData?.id || 'guest'}`);
    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
  }, [studentData?.id]);

  const initializeGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    gameStateRef.current = {
      // Player
      player: {
        x: 100,
        y: height - 120,
        width: 30,
        height: 40,
        velocityY: 0,
        jumping: false,
        jumpHoldTime: 0,
        grounded: false,
        color: '#FF6B6B'
      },

      // Physics
      gravity: 0.5,
      jumpForce: 12,

      // Game state
      gameSpeed: 6,
      baseGameSpeed: 6,
      maxGameSpeed: 12,
      score: 0,
      distance: 0,
      coinsCollected: 0,
      comboCount: 0,
      multiplier: 1,
      obstaclesDodged: 0,
      gameActive: true,
      shielded: false,
      speedBoosted: false,
      magnetActive: false,

      // Power-up timers
      shieldTimer: 0,
      speedBoostTimer: 0,
      magnetTimer: 0,

      // Collectibles
      coins: [],
      powerUps: [],
      obstacles: [],
      particles: [],

      // Spawning
      spawnCounter: 0,
      spawnRate: 180,
      minSpawnRate: 60,
      coinSpawnChance: 0.3,
      powerUpSpawnChance: 0.05,

      // Environment
      groundLevel: height - 80,
      parallaxOffset: 0,

      // Input
      inputBuffer: { jump: false, jumpHeld: false }
    };

    setGamePhase('playing');
    setScore(0);
    setDistance(0);
    setCoinsCollected(0);
    setMultiplier(1);
    setObstaclesDodged(0);

    gameLoop();
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStateRef.current) return;

    const ctx = canvas.getContext('2d');
    const state = gameStateRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // Update game speed based on distance
    const speedProgression = Math.min(state.distance / 2000, 1);
    state.gameSpeed = state.baseGameSpeed + speedProgression * (state.maxGameSpeed - state.baseGameSpeed);

    // Adjust spawn rate based on speed
    state.spawnRate = Math.max(state.minSpawnRate, 180 - speedProgression * 120);

    // Handle input — tap to jump, hold longer for higher jump
    if (state.inputBuffer.jump && state.player.grounded) {
      state.player.velocityY = -state.jumpForce;
      state.player.grounded = false;
      state.player.jumpHoldTime = 0;
      state.inputBuffer.jump = false;
      spawnParticles(state, state.player.x + state.player.width / 2, state.groundLevel, 4, '#8B8B8B', 'dust');
    }

    // Extend jump height while holding
    if (state.inputBuffer.jumpHeld && !state.player.grounded && state.player.velocityY < 0) {
      state.player.jumpHoldTime = (state.player.jumpHoldTime || 0) + 1;
      if (state.player.jumpHoldTime < 12) {
        state.player.velocityY -= 0.4;
      }
    }

    // Player physics
    state.player.velocityY += state.gravity;
    state.player.y += state.player.velocityY;
    state.player.grounded = false;

    // Ground collision
    if (state.player.y + state.player.height >= state.groundLevel) {
      state.player.y = state.groundLevel - state.player.height;
      state.player.velocityY = 0;
      state.player.grounded = true;

      // Dust particles on landing
      spawnParticles(state, state.player.x + state.player.width / 2, state.groundLevel, 5, '#8B8B8B', 'dust');
    }

    // Update timers
    if (state.shieldTimer > 0) state.shieldTimer--;
    if (state.speedBoostTimer > 0) state.speedBoostTimer--;
    if (state.magnetTimer > 0) state.magnetTimer--;

    state.shielded = state.shieldTimer > 0;
    state.speedBoosted = state.speedBoostTimer > 0;
    state.magnetActive = state.magnetTimer > 0;

    // Spawn obstacles
    state.spawnCounter++;
    if (state.spawnCounter > state.spawnRate) {
      spawnObstacle(state, width);
      state.spawnCounter = 0;
    }

    // Spawn coins
    if (Math.random() < state.coinSpawnChance * state.gameSpeed / state.baseGameSpeed) {
      spawnCoin(state, width);
    }

    // Spawn power-ups
    if (Math.random() < state.powerUpSpawnChance * state.gameSpeed / state.baseGameSpeed) {
      spawnPowerUp(state, width);
    }

    // Update obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const obs = state.obstacles[i];
      obs.x -= state.gameSpeed;

      // Collision detection
      if (checkCollision(state.player, obs)) {
        if (state.shielded) {
          state.shieldTimer = 0;
          spawnParticles(state, obs.x, obs.y, 10, '#FFD700', 'powerup');
          state.obstacles.splice(i, 1);
          state.multiplier = Math.max(1, state.multiplier - 0.5);
        } else if (!state.speedBoosted) {
          state.gameActive = false;
        }
      }

      if (obs.x + obs.width < 0) {
        if (state.gameActive) {
          state.obstaclesDodged++;
          state.comboCount++;
          const newMultiplier = Math.min(1 + state.comboCount * 0.1, 3);
          state.multiplier = newMultiplier;
        }
        state.obstacles.splice(i, 1);
      }
    }

    // Update coins
    for (let i = state.coins.length - 1; i >= 0; i--) {
      const coin = state.coins[i];
      coin.x -= state.gameSpeed;
      coin.rotation += 0.1;
      coin.bounce += 0.1;

      // Magnet effect
      if (state.magnetActive) {
        const dx = state.player.x - coin.x;
        const dy = state.player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          const speed = 5;
          coin.x += (dx / distance) * speed;
          coin.y += (dy / distance) * speed;
        }
      }

      // Coin collection
      if (checkCollision(state.player, {
        x: coin.x,
        y: coin.y,
        width: coin.size,
        height: coin.size
      })) {
        state.coinsCollected++;
        state.score += Math.round(10 * state.multiplier);
        spawnParticles(state, coin.x, coin.y, 8, '#FFD700', 'spark');
        state.coins.splice(i, 1);
      } else if (coin.x < -50) {
        state.coins.splice(i, 1);
      }
    }

    // Update power-ups
    for (let i = state.powerUps.length - 1; i >= 0; i--) {
      const pu = state.powerUps[i];
      pu.x -= state.gameSpeed;
      pu.rotation += 0.05;
      pu.bounce = Math.sin(state.distance * 0.05) * 10;

      if (checkCollision(state.player, {
        x: pu.x,
        y: pu.y,
        width: pu.size,
        height: pu.size
      })) {
        activatePowerUp(state, pu.type);
        spawnParticles(state, pu.x, pu.y, 12, '#00FF00', 'powerup');
        state.powerUps.splice(i, 1);
      } else if (pu.x < -50) {
        state.powerUps.splice(i, 1);
      }
    }

    // Update particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.3;
      p.life--;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    // Update parallax offset
    state.parallaxOffset += state.gameSpeed;

    // Update distance and score
    state.distance += state.gameSpeed * 0.2;
    if (state.gameActive) {
      state.score += Math.round(state.multiplier);
    }

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Draw parallax background
    drawParallaxBackground(ctx, state, width, height);

    // Draw ground
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, state.groundLevel, width, height - state.groundLevel);
    ctx.strokeStyle = '#4a7c24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, state.groundLevel);
    ctx.lineTo(width, state.groundLevel);
    ctx.stroke();

    // Draw player
    drawPlayer(ctx, state);

    // Draw obstacles
    state.obstacles.forEach(obs => drawObstacle(ctx, obs));

    // Draw coins
    state.coins.forEach(coin => drawCoin(ctx, coin));

    // Draw power-ups
    state.powerUps.forEach(pu => drawPowerUp(ctx, pu));

    // Draw particles
    state.particles.forEach(p => drawParticle(ctx, p));

    // Draw shield effect if active
    if (state.shielded) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        state.player.x + state.player.width / 2,
        state.player.y + state.player.height / 2,
        45,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Update React state
    setScore(Math.floor(state.score));
    setDistance(Math.floor(state.distance));
    setCoinsCollected(state.coinsCollected);
    setMultiplier(parseFloat(state.multiplier.toFixed(1)));
    setObstaclesDodged(state.obstaclesDodged);

    if (!state.gameActive) {
      endGame(state);
      return;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const drawParallaxBackground = (ctx, state, width, height) => {
    const offset = Math.floor(state.parallaxOffset);

    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.5);
    gradient.addColorStop(0, '#0f3460');
    gradient.addColorStop(1, '#533483');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.5);

    // Clouds layer 1 (slowest)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 3; i++) {
      const cloudX = ((i * width + offset * 0.3) % (width * 2)) - width;
      drawCloud(ctx, cloudX, height * 0.15, 60, 30);
    }

    // Mountains layer 1
    ctx.fillStyle = '#2d5016';
    drawMountains(ctx, offset * 0.5, height * 0.4, width, height * 0.4);

    // Mountains layer 2 (faster)
    ctx.fillStyle = '#3a6b1e';
    drawMountains(ctx, offset * 0.7, height * 0.5, width, height * 0.35);
  };

  const drawCloud = (ctx, x, y, width, height) => {
    ctx.beginPath();
    ctx.arc(x, y, height / 2, Math.PI * 0.5, Math.PI * 1.5);
    ctx.arc(x + width / 2, y - height / 2, height / 2, Math.PI, 0);
    ctx.arc(x + width, y, height / 2, Math.PI * 1.5, Math.PI * 0.5);
    ctx.arc(x + width / 2, y + height / 2, height / 2, 0, Math.PI);
    ctx.fill();
  };

  const drawMountains = (ctx, offset, y, width, height) => {
    ctx.beginPath();
    ctx.moveTo(-width + (offset % width), y + height);
    for (let i = 0; i < 5; i++) {
      const px = -width + (offset % width) + i * 300;
      ctx.lineTo(px, y);
      ctx.lineTo(px + 150, y + height);
    }
    ctx.lineTo(width * 2, y + height);
    ctx.fill();
  };

  const drawPlayer = (ctx, state) => {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

    // Body
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -8, 6, 6);
    ctx.fillRect(4, -8, 6, 6);

    // Pupils
    ctx.fillStyle = '#000';
    const pupilOffset = state.player.velocityY * 0.5;
    ctx.fillRect(-7, -7 + pupilOffset, 3, 3);
    ctx.fillRect(5, -7 + pupilOffset, 3, 3);

    ctx.restore();
  };

  const drawObstacle = (ctx, obs) => {
    if (obs.type === 'wall') {
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      // Pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      for (let i = 0; i < obs.height; i += 15) {
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + i);
        ctx.lineTo(obs.x + obs.width, obs.y + i);
        ctx.stroke();
      }
    } else if (obs.type === 'gap') {
      // Draw sides of gap
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(obs.x - 20, obs.y, 20, obs.height);
      ctx.fillRect(obs.x + obs.width, obs.y, 20, obs.height);
    }
  };

  const drawCoin = (ctx, coin) => {
    ctx.save();
    ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2 - Math.sin(coin.bounce) * 5);
    ctx.rotate(coin.rotation);

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(-coin.size / 2, -coin.size / 2, coin.size, coin.size);

    ctx.fillStyle = '#FFF8DC';
    ctx.fillRect(-coin.size / 3, -coin.size / 3, coin.size * 0.66, coin.size * 0.66);

    ctx.restore();
  };

  const drawPowerUp = (ctx, pu) => {
    ctx.save();
    ctx.translate(pu.x + pu.size / 2, pu.y + pu.size / 2 + pu.bounce);
    ctx.rotate(pu.rotation);

    const colors = { shield: '#00FFFF', speedboost: '#FF00FF', magnet: '#00FF00' };
    ctx.fillStyle = colors[pu.type] || '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, pu.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(0, 0, pu.size / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawParticle = (ctx, p) => {
    ctx.save();
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();
  };

  const spawnObstacle = (state, width) => {
    const height = 40;
    const types = ['wall', 'gap'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'wall') {
      state.obstacles.push({
        x: width,
        y: state.groundLevel - height,
        width: 30 + Math.random() * 20,
        height: height,
        type: 'wall'
      });
    } else {
      state.obstacles.push({
        x: width,
        y: state.groundLevel - height * 2,
        width: 40 + Math.random() * 30,
        height: height,
        type: 'gap'
      });
    }
  };

  const spawnCoin = (state, width) => {
    state.coins.push({
      x: width + Math.random() * 100,
      y: state.groundLevel - 100 - Math.random() * 150,
      size: 12,
      rotation: 0,
      bounce: 0
    });
  };

  const spawnPowerUp = (state, width) => {
    const types = ['shield', 'speedboost', 'magnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    state.powerUps.push({
      x: width + Math.random() * 100,
      y: state.groundLevel - 150 - Math.random() * 100,
      size: 20,
      type: type,
      rotation: 0,
      bounce: 0
    });
  };

  const spawnParticles = (state, x, y, count, color, type) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      state.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: color,
        size: 3 + Math.random() * 2,
        life: 30,
        maxLife: 30,
        type: type
      });
    }
  };

  const activatePowerUp = (state, type) => {
    if (type === 'shield') {
      state.shieldTimer = 300;
    } else if (type === 'speedboost') {
      state.speedBoostTimer = 180;
    } else if (type === 'magnet') {
      state.magnetTimer = 240;
    }
  };

  const checkCollision = (rect1, rect2) => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  };

  const endGame = (state) => {
    setGamePhase('gameover');
    const finalScore = Math.floor(state.score);

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem(`endlessrunner-highscore-${studentData?.id || 'guest'}`, finalScore);
      showToast(`New High Score! ${finalScore} points!`, 'success');
    } else {
      showToast(`Game Over! Score: ${finalScore} points`, 'success');
    }

    if (updateStudentData && studentData?.id) {
      updateStudentData({
        ...studentData,
        endlessRunnerStats: {
          lastScore: finalScore,
          highScore: Math.max(finalScore, highScore),
          totalDistance: Math.floor(state.distance),
          coinsCollected: state.coinsCollected
        }
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        gameStateRef.current.inputBuffer.jump = true;
        gameStateRef.current.inputBuffer.jumpHeld = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        gameStateRef.current.inputBuffer.jumpHeld = false;
        e.preventDefault();
      }
    };

    const handleMouseDown = () => {
      if (gameStateRef.current) {
        gameStateRef.current.inputBuffer.jump = true;
        gameStateRef.current.inputBuffer.jumpHeld = true;
      }
    };

    const handleMouseUp = () => {
      if (gameStateRef.current) {
        gameStateRef.current.inputBuffer.jumpHeld = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchend', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-4 text-white drop-shadow-lg"
        >
          Endless Runner
        </motion.h1>

        {/* Game Canvas + Overlays */}
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full block cursor-pointer"
          />

          {/* HUD Overlay */}
          <AnimatePresence>
            {gamePhase === 'playing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 left-4 right-4 flex justify-between text-white font-bold text-lg pointer-events-none"
              >
                <div className="bg-black/50 px-4 py-2 rounded-lg backdrop-blur">
                  <div>Distance: {distance}m</div>
                  <div>Coins: {coinsCollected}</div>
                </div>
                <div className="bg-black/50 px-4 py-2 rounded-lg backdrop-blur text-right">
                  <div>Score: {score}</div>
                  <div className="text-yellow-400">x{multiplier}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Screen */}
          <AnimatePresence>
            {gamePhase === 'menu' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-10"
              >
                <div className="text-center">
                  <motion.h2
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold text-white mb-8"
                  >
                    Endless Runner
                  </motion.h2>
                  <p className="text-xl text-gray-300 mb-4">Jump over obstacles and collect coins!</p>
                  <p className="text-gray-400 mb-8">
                    Click or Press SPACE to jump. Hold for higher jumps.
                  </p>
                  {highScore > 0 && (
                    <p className="text-2xl text-yellow-400 mb-8 font-bold">
                      High Score: {highScore}
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={initializeGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-12 rounded-lg text-xl transition"
                  >
                    Start Game
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Screen */}
          <AnimatePresence>
            {gamePhase === 'gameover' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center"
                >
                  <h2 className="text-5xl font-bold text-red-500 mb-6">Game Over!</h2>
                  <div className="bg-slate-800 rounded-lg p-8 mb-8 max-w-md">
                    <div className="text-3xl text-yellow-400 font-bold mb-4">Score: {score}</div>
                    <div className="grid grid-cols-2 gap-4 text-white mb-4">
                      <div>
                        <p className="text-gray-400">Distance</p>
                        <p className="text-2xl font-bold">{distance}m</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Coins</p>
                        <p className="text-2xl font-bold">{coinsCollected}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Dodged</p>
                        <p className="text-2xl font-bold">{obstaclesDodged}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Max Mult.</p>
                        <p className="text-2xl font-bold">x{multiplier}</p>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGamePhase('menu')}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-12 rounded-lg flex items-center justify-center gap-2 mx-auto"
                  >
                    <RotateCcw size={24} />
                    Play Again
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Jump Button */}
      {gamePhase === 'playing' && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 h-48 md:hidden bg-gradient-to-t from-blue-500 to-transparent active:from-blue-600 transition"
          onMouseDown={() => {
            if (gameStateRef.current) {
              gameStateRef.current.inputBuffer.jump = true;
              gameStateRef.current.inputBuffer.jumpHeld = true;
            }
          }}
          onMouseUp={() => {
            if (gameStateRef.current) {
              gameStateRef.current.inputBuffer.jumpHeld = false;
            }
          }}
          onTouchStart={() => {
            if (gameStateRef.current) {
              gameStateRef.current.inputBuffer.jump = true;
              gameStateRef.current.inputBuffer.jumpHeld = true;
            }
          }}
          onTouchEnd={() => {
            if (gameStateRef.current) {
              gameStateRef.current.inputBuffer.jumpHeld = false;
            }
          }}
        />
      )}
    </div>
  );
};

export default EndlessRunnerGame;
