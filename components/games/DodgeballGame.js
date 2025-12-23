// components/games/DodgeballGame.js - COMPLETE OVERHAUL
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateAvatarLevel, getAvatarImage } from '../../utils/gameHelpers';

// ============================================
// GAME CONSTANTS
// ============================================
const GAME_WIDTH = 800;
const GAME_HEIGHT = 500;
const PLAYER_RADIUS = 24;
const PLAYER_SPEED = 280;
const BALL_BASE_SPEED = 140;
const BALL_RADIUS = 14;
const BALL_ADD_INTERVAL_MS = 8000;
const POWERUP_LIFETIME_MS = 10000;
const POWERUP_RADIUS = 20;
const POWERUP_TYPES = ['shield', 'dash', 'slow', 'shrink'];

const TROPHY_THRESHOLDS = [
  { id: 'bronze', label: 'Bronze Survivor', seconds: 30, icon: '🥉', color: '#CD7F32' },
  { id: 'silver', label: 'Silver Survivor', seconds: 60, icon: '🥈', color: '#C0C0C0' },
  { id: 'gold', label: 'Gold Survivor', seconds: 90, icon: '🥇', color: '#FFD700' },
  { id: 'diamond', label: 'Diamond Legend', seconds: 120, icon: '💎', color: '#B9F2FF' }
];

const BALL_COLORS = [
  { from: '#FF6B6B', to: '#FF8E53', glow: 'rgba(255,107,107,0.6)' },
  { from: '#4ECDC4', to: '#44A08D', glow: 'rgba(78,205,196,0.6)' },
  { from: '#A8E6CF', to: '#88D8B0', glow: 'rgba(168,230,207,0.6)' },
  { from: '#DDA0DD', to: '#DA70D6', glow: 'rgba(221,160,221,0.6)' },
  { from: '#87CEEB', to: '#00BFFF', glow: 'rgba(135,206,235,0.6)' },
  { from: '#FFD93D', to: '#FF6B6B', glow: 'rgba(255,217,61,0.6)' },
  { from: '#6BCB77', to: '#4CAF50', glow: 'rgba(107,203,119,0.6)' },
  { from: '#9B59B6', to: '#8E44AD', glow: 'rgba(155,89,182,0.6)' }
];

// ============================================
// UTILITY FUNCTIONS
// ============================================
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const randomInRange = (min, max) => min + Math.random() * (max - min);
const formatTime = (ms) => (ms / 1000).toFixed(1);

const randomPosition = (padding = 80) => ({
  x: randomInRange(padding, GAME_WIDTH - padding),
  y: randomInRange(padding, GAME_HEIGHT - padding)
});

const createBall = (index = 0) => {
  const speed = BALL_BASE_SPEED + index * 10;
  const angle = Math.random() * Math.PI * 2;
  const colorScheme = BALL_COLORS[index % BALL_COLORS.length];
  const { x, y } = randomPosition();

  return {
    id: `ball-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: BALL_RADIUS,
    colorScheme,
    trail: []
  };
};

const createPowerup = () => {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  const { x, y } = randomPosition(100);

  return {
    id: `power-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    x,
    y,
    spawnedAt: Date.now(),
    pulse: 0
  };
};

// ============================================
// PARTICLE SYSTEM
// ============================================
const createParticle = (x, y, color, speed = 2, life = 1) => ({
  id: `p-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  x,
  y,
  vx: (Math.random() - 0.5) * speed * 2,
  vy: (Math.random() - 0.5) * speed * 2,
  life,
  maxLife: life,
  color,
  size: randomInRange(2, 6)
});

const createExplosion = (x, y, color, count = 12) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = randomInRange(80, 200);
    particles.push({
      id: `exp-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 1,
      color,
      size: randomInRange(4, 10)
    });
  }
  return particles;
};

// ============================================
// POWERUP ICON COMPONENT
// ============================================
const PowerupIcon = ({ type }) => {
  const icons = {
    shield: '🛡️',
    dash: '⚡',
    slow: '⏳',
    shrink: '🔮'
  };
  return <span className="text-2xl">{icons[type] || '✨'}</span>;
};

// ============================================
// MAIN GAME COMPONENT
// ============================================
const DodgeballGame = ({ studentData, showToast, storageKeySuffix = 'student-dodgeball' }) => {
  // Game state
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameover
  const [player, setPlayer] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const [balls, setBalls] = useState([]);
  const [powerups, setPowerups] = useState([]);
  const [particles, setParticles] = useState([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestMs, setBestMs] = useState(0);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [nearMiss, setNearMiss] = useState(false);

  // Power-up states
  const [activeShield, setActiveShield] = useState(false);
  const [dashActive, setDashActive] = useState(false);
  const [slowActive, setSlowActive] = useState(false);
  const [shrinkActive, setShrinkActive] = useState(false);
  const [lastTrophy, setLastTrophy] = useState(null);

  // Refs for game loop
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const keysRef = useRef({});
  const gameStateRef = useRef('idle');
  const playerRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
  const ballsRef = useRef([]);
  const powerupsRef = useRef([]);
  const particlesRef = useRef([]);
  const shieldRef = useRef(false);
  const dashRef = useRef(false);
  const slowRef = useRef(false);
  const shrinkRef = useRef(false);
  const ballAddTimerRef = useRef(0);
  const powerupTimerRef = useRef(0);

  // Avatar image
  const avatarSrc = useMemo(() => {
    if (!studentData) return null;
    const level = calculateAvatarLevel(studentData.totalPoints || 0);
    return getAvatarImage(studentData.avatarBase, level);
  }, [studentData]);

  // Load best score
  useEffect(() => {
    const saved = localStorage.getItem(`dodgeball-best-${storageKeySuffix}`);
    if (saved) setBestMs(Number(saved));
  }, [storageKeySuffix]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync refs with state
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { ballsRef.current = balls; }, [balls]);
  useEffect(() => { powerupsRef.current = powerups; }, [powerups]);
  useEffect(() => { particlesRef.current = particles; }, [particles]);
  useEffect(() => { shieldRef.current = activeShield; }, [activeShield]);
  useEffect(() => { dashRef.current = dashActive; }, [dashActive]);
  useEffect(() => { slowRef.current = slowActive; }, [slowActive]);
  useEffect(() => { shrinkRef.current = shrinkActive; }, [shrinkActive]);

  // Handle power-up collection
  const handlePowerup = useCallback((type) => {
    const messages = {
      shield: '🛡️ Shield activated! Block one hit!',
      dash: '⚡ Speed boost! Move faster for 4s!',
      slow: '⏳ Time warp! Balls slowed for 5s!',
      shrink: '🔮 Shrink mode! Smaller hitbox for 6s!'
    };
    showToast?.(messages[type] || 'Power-up collected!');

    if (type === 'shield') {
      setActiveShield(true);
      shieldRef.current = true;
    } else if (type === 'dash') {
      setDashActive(true);
      dashRef.current = true;
      setTimeout(() => { setDashActive(false); dashRef.current = false; }, 4000);
    } else if (type === 'slow') {
      setSlowActive(true);
      slowRef.current = true;
      setTimeout(() => { setSlowActive(false); slowRef.current = false; }, 5000);
    } else if (type === 'shrink') {
      setShrinkActive(true);
      shrinkRef.current = true;
      setTimeout(() => { setShrinkActive(false); shrinkRef.current = false; }, 6000);
    }
  }, [showToast]);

  // Game over handler
  const handleGameOver = useCallback((hitBall) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const survivalMs = Date.now() - startTimeRef.current;
    setElapsedMs(survivalMs);
    setGameState('gameover');
    gameStateRef.current = 'gameover';

    // Screen shake effect
    setScreenShake({ x: randomInRange(-10, 10), y: randomInRange(-10, 10) });
    setTimeout(() => setScreenShake({ x: 0, y: 0 }), 100);

    // Create explosion particles
    if (hitBall) {
      const explosion = createExplosion(playerRef.current.x, playerRef.current.y, '#FF6B6B');
      setParticles(prev => [...prev, ...explosion]);
    }

    // Save best score
    setBestMs((prev) => {
      const nextBest = Math.max(prev, survivalMs);
      localStorage.setItem(`dodgeball-best-${storageKeySuffix}`, nextBest);
      return nextBest;
    });

    // Check for trophy
    const trophy = TROPHY_THRESHOLDS.slice().reverse().find((t) => survivalMs / 1000 >= t.seconds) || null;
    setLastTrophy(trophy);
    if (trophy) {
      showToast?.(`${trophy.icon} ${trophy.label}! You survived ${formatTime(survivalMs)}s`);
    } else {
      showToast?.(`💥 Hit! You lasted ${formatTime(survivalMs)}s. Try again!`);
    }
  }, [showToast, storageKeySuffix]);

  // Main game loop
  const gameLoop = useCallback((timestamp) => {
    if (gameStateRef.current !== 'playing') return;

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const speedMult = dashRef.current ? 1.6 : 1;
    const ballSpeedMult = slowRef.current ? 0.5 : 1;
    const playerRadius = shrinkRef.current ? PLAYER_RADIUS * 0.6 : PLAYER_RADIUS;

    // Update elapsed time
    setElapsedMs(Date.now() - startTimeRef.current);

    // Update player position
    const keys = keysRef.current;
    const up = keys['arrowup'] || keys['w'];
    const down = keys['arrowdown'] || keys['s'];
    const left = keys['arrowleft'] || keys['a'];
    const right = keys['arrowright'] || keys['d'];

    let newPlayer = { ...playerRef.current };
    const moveSpeed = PLAYER_SPEED * speedMult * deltaTime;

    if (up) newPlayer.y -= moveSpeed;
    if (down) newPlayer.y += moveSpeed;
    if (left) newPlayer.x -= moveSpeed;
    if (right) newPlayer.x += moveSpeed;

    newPlayer.x = clamp(newPlayer.x, playerRadius, GAME_WIDTH - playerRadius);
    newPlayer.y = clamp(newPlayer.y, playerRadius, GAME_HEIGHT - playerRadius);

    playerRef.current = newPlayer;
    setPlayer(newPlayer);

    // Update balls
    let hitDetected = null;
    let closestDistance = Infinity;

    const updatedBalls = ballsRef.current.map((ball) => {
      let { x, y, vx, vy, trail } = ball;

      x += vx * deltaTime * ballSpeedMult;
      y += vy * deltaTime * ballSpeedMult;

      // Bounce off walls
      if (x <= ball.radius || x >= GAME_WIDTH - ball.radius) {
        vx = -vx;
        x = clamp(x, ball.radius, GAME_WIDTH - ball.radius);
      }
      if (y <= ball.radius || y >= GAME_HEIGHT - ball.radius) {
        vy = -vy;
        y = clamp(y, ball.radius, GAME_HEIGHT - ball.radius);
      }

      // Update trail
      const newTrail = [...(trail || []), { x, y }].slice(-8);

      // Check collision with player
      const dx = x - newPlayer.x;
      const dy = y - newPlayer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) closestDistance = distance;

      if (distance < ball.radius + playerRadius) {
        hitDetected = ball;
      }

      return { ...ball, x, y, vx, vy, trail: newTrail };
    });

    // Ball-to-ball collisions
    for (let i = 0; i < updatedBalls.length; i++) {
      for (let j = i + 1; j < updatedBalls.length; j++) {
        const a = updatedBalls[i];
        const b = updatedBalls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = a.radius + b.radius;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          a.x -= nx * overlap / 2;
          a.y -= ny * overlap / 2;
          b.x += nx * overlap / 2;
          b.y += ny * overlap / 2;

          // Velocity swap for elastic collision
          const v1n = a.vx * nx + a.vy * ny;
          const v2n = b.vx * nx + b.vy * ny;

          a.vx += (v2n - v1n) * nx;
          a.vy += (v2n - v1n) * ny;
          b.vx += (v1n - v2n) * nx;
          b.vy += (v1n - v2n) * ny;
        }
      }
    }

    ballsRef.current = updatedBalls;
    setBalls(updatedBalls);

    // Near miss detection
    const nearMissThreshold = playerRadius + BALL_RADIUS + 20;
    setNearMiss(closestDistance < nearMissThreshold && closestDistance > playerRadius + BALL_RADIUS);

    // Handle collision
    if (hitDetected) {
      if (shieldRef.current) {
        setActiveShield(false);
        shieldRef.current = false;
        showToast?.('🛡️ Shield blocked the hit!');
        // Remove the ball that hit
        const filtered = ballsRef.current.filter(b => b.id !== hitDetected.id);
        ballsRef.current = filtered;
        setBalls(filtered);
        // Create shield break particles
        const shieldParticles = createExplosion(newPlayer.x, newPlayer.y, '#60A5FA', 8);
        setParticles(prev => [...prev, ...shieldParticles]);
      } else {
        handleGameOver(hitDetected);
        return;
      }
    }

    // Update power-ups
    const now = Date.now();
    const updatedPowerups = powerupsRef.current
      .filter(p => now - p.spawnedAt < POWERUP_LIFETIME_MS)
      .map(p => ({ ...p, pulse: (p.pulse + deltaTime * 3) % (Math.PI * 2) }));

    // Check power-up collection
    const collectedPowerups = [];
    const remainingPowerups = updatedPowerups.filter(p => {
      const dx = p.x - newPlayer.x;
      const dy = p.y - newPlayer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < playerRadius + POWERUP_RADIUS) {
        collectedPowerups.push(p);
        return false;
      }
      return true;
    });

    collectedPowerups.forEach(p => handlePowerup(p.type));
    powerupsRef.current = remainingPowerups;
    setPowerups(remainingPowerups);

    // Update particles
    const updatedParticles = particlesRef.current
      .map(p => ({
        ...p,
        x: p.x + p.vx * deltaTime,
        y: p.y + p.vy * deltaTime,
        life: p.life - deltaTime * 2,
        vx: p.vx * 0.98,
        vy: p.vy * 0.98 + 50 * deltaTime
      }))
      .filter(p => p.life > 0);

    particlesRef.current = updatedParticles;
    setParticles(updatedParticles);

    // Timer-based spawning
    ballAddTimerRef.current += deltaTime * 1000;
    powerupTimerRef.current += deltaTime * 1000;

    // Add new ball
    if (ballAddTimerRef.current >= BALL_ADD_INTERVAL_MS) {
      ballAddTimerRef.current = 0;
      const newBall = createBall(ballsRef.current.length);
      ballsRef.current = [...ballsRef.current, newBall];
      setBalls([...ballsRef.current]);
      setComboMultiplier(prev => Math.min(prev + 0.1, 3));
    }

    // Add new power-up
    if (powerupTimerRef.current >= 15000 && powerupsRef.current.length < 2) {
      powerupTimerRef.current = 0;
      const newPowerup = createPowerup();
      powerupsRef.current = [...powerupsRef.current, newPowerup];
      setPowerups([...powerupsRef.current]);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [handleGameOver, handlePowerup, showToast]);

  // Start game
  const startGame = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Reset state
    const initialPlayer = { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
    const initialBalls = [createBall(0)];

    setPlayer(initialPlayer);
    playerRef.current = initialPlayer;
    setBalls(initialBalls);
    ballsRef.current = initialBalls;
    setPowerups([]);
    powerupsRef.current = [];
    setParticles([]);
    particlesRef.current = [];
    setElapsedMs(0);
    setActiveShield(false);
    shieldRef.current = false;
    setDashActive(false);
    dashRef.current = false;
    setSlowActive(false);
    slowRef.current = false;
    setShrinkActive(false);
    shrinkRef.current = false;
    setLastTrophy(null);
    setComboMultiplier(1);
    setNearMiss(false);
    ballAddTimerRef.current = 0;
    powerupTimerRef.current = 0;

    startTimeRef.current = Date.now();
    lastTimeRef.current = performance.now();

    setGameState('playing');
    gameStateRef.current = 'playing';

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Trophy progress
  const trophyProgress = TROPHY_THRESHOLDS.map((tier) => ({
    ...tier,
    unlocked: elapsedMs / 1000 >= tier.seconds || bestMs / 1000 >= tier.seconds,
    current: elapsedMs / 1000 >= tier.seconds
  }));

  // Calculate player radius for display
  const displayPlayerRadius = shrinkActive ? PLAYER_RADIUS * 0.6 : PLAYER_RADIUS;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border-b border-white/10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">🥎</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Dodgeball Frenzy</h2>
                <p className="text-purple-300 text-sm">Survive the chaos, dodge the neon balls!</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timer */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-purple-500/30">
              <div className="text-xs text-purple-300 uppercase tracking-wide">Time</div>
              <div className="text-2xl font-bold text-white font-mono">{formatTime(elapsedMs)}s</div>
            </div>

            {/* Best */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-green-500/30">
              <div className="text-xs text-green-300 uppercase tracking-wide">Best</div>
              <div className="text-2xl font-bold text-green-400 font-mono">{bestMs ? `${formatTime(bestMs)}s` : '—'}</div>
            </div>

            {/* Balls count */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-3 border border-orange-500/30">
              <div className="text-xs text-orange-300 uppercase tracking-wide">Balls</div>
              <div className="text-2xl font-bold text-orange-400">{balls.length}</div>
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={startGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95"
            >
              {gameState === 'playing' ? '🔄 Restart' : gameState === 'gameover' ? '🎮 Play Again' : '🚀 Start Game'}
            </button>
          </div>
        </div>

        {/* Active buffs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {activeShield && (
            <span className="px-3 py-1.5 rounded-full bg-blue-500/30 border border-blue-400/50 text-blue-300 text-sm font-semibold flex items-center gap-1">
              🛡️ Shield Active
            </span>
          )}
          {dashActive && (
            <span className="px-3 py-1.5 rounded-full bg-yellow-500/30 border border-yellow-400/50 text-yellow-300 text-sm font-semibold flex items-center gap-1 animate-pulse">
              ⚡ Speed Boost
            </span>
          )}
          {slowActive && (
            <span className="px-3 py-1.5 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-300 text-sm font-semibold flex items-center gap-1">
              ⏳ Time Warp
            </span>
          )}
          {shrinkActive && (
            <span className="px-3 py-1.5 rounded-full bg-purple-500/30 border border-purple-400/50 text-purple-300 text-sm font-semibold flex items-center gap-1">
              🔮 Shrink Mode
            </span>
          )}
          {nearMiss && gameState === 'playing' && (
            <span className="px-3 py-1.5 rounded-full bg-red-500/30 border border-red-400/50 text-red-300 text-sm font-semibold animate-pulse">
              ⚠️ Close Call!
            </span>
          )}
        </div>
      </div>

      {/* Game Area */}
      <div className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          {/* Main Arena */}
          <div className="flex-1">
            <div
              ref={containerRef}
              className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30"
              style={{
                backgroundColor: '#0f0a1f',
                aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
                maxHeight: '500px',
                transform: `translate(${screenShake.x}px, ${screenShake.y}px)`
              }}
            >
              {/* Animated background */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.15) 0%, transparent 40%),
                    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)
                  `
                }}
              />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              />

              {/* Particles */}
              {particles.map((p) => (
                <div
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${(p.x / GAME_WIDTH) * 100}%`,
                    top: `${(p.y / GAME_HEIGHT) * 100}%`,
                    width: p.size * (p.life / p.maxLife),
                    height: p.size * (p.life / p.maxLife),
                    backgroundColor: p.color,
                    opacity: p.life / p.maxLife,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}

              {/* Balls with trails */}
              {balls.map((ball) => (
                <React.Fragment key={ball.id}>
                  {/* Trail */}
                  {ball.trail?.map((t, i) => (
                    <div
                      key={`${ball.id}-trail-${i}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${(t.x / GAME_WIDTH) * 100}%`,
                        top: `${(t.y / GAME_HEIGHT) * 100}%`,
                        width: `${((ball.radius * 2) / GAME_WIDTH) * 100 * (i / ball.trail.length) * 0.6}%`,
                        height: `${((ball.radius * 2) / GAME_HEIGHT) * 100 * (i / ball.trail.length) * 0.6}%`,
                        background: ball.colorScheme.glow,
                        opacity: (i / ball.trail.length) * 0.4,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}

                  {/* Ball */}
                  <div
                    className="absolute rounded-full transition-transform duration-75"
                    style={{
                      left: `${(ball.x / GAME_WIDTH) * 100}%`,
                      top: `${(ball.y / GAME_HEIGHT) * 100}%`,
                      width: `${((ball.radius * 2) / GAME_WIDTH) * 100}%`,
                      height: `${((ball.radius * 2) / GAME_HEIGHT) * 100}%`,
                      background: `radial-gradient(circle at 30% 30%, #fff, ${ball.colorScheme.from}, ${ball.colorScheme.to})`,
                      boxShadow: `0 0 20px ${ball.colorScheme.glow}, 0 0 40px ${ball.colorScheme.glow}, inset 0 0 10px rgba(255,255,255,0.3)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                </React.Fragment>
              ))}

              {/* Power-ups */}
              {powerups.map((p) => (
                <div
                  key={p.id}
                  className="absolute flex items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/30"
                  style={{
                    left: `${(p.x / GAME_WIDTH) * 100}%`,
                    top: `${(p.y / GAME_HEIGHT) * 100}%`,
                    width: `${((POWERUP_RADIUS * 2 + 8) / GAME_WIDTH) * 100}%`,
                    height: `${((POWERUP_RADIUS * 2 + 8) / GAME_HEIGHT) * 100}%`,
                    transform: `translate(-50%, -50%) scale(${1 + Math.sin(p.pulse) * 0.1})`,
                    boxShadow: '0 0 20px rgba(255,255,255,0.3), 0 0 40px rgba(139,92,246,0.3)'
                  }}
                >
                  <PowerupIcon type={p.type} />
                </div>
              ))}

              {/* Player */}
              <div
                className="absolute transition-all duration-100"
                style={{
                  left: `${(player.x / GAME_WIDTH) * 100}%`,
                  top: `${(player.y / GAME_HEIGHT) * 100}%`,
                  width: `${((displayPlayerRadius * 2) / GAME_WIDTH) * 100}%`,
                  height: `${((displayPlayerRadius * 2) / GAME_HEIGHT) * 100}%`,
                  transform: `translate(-50%, -50%) ${dashActive ? 'scale(1.1)' : ''}`,
                  transition: shrinkActive ? 'width 0.3s, height 0.3s' : 'transform 0.1s'
                }}
              >
                {/* Shield effect */}
                {activeShield && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      transform: 'scale(1.4)',
                      background: 'radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(96,165,250,0) 70%)',
                      boxShadow: '0 0 30px rgba(96,165,250,0.6), inset 0 0 20px rgba(96,165,250,0.3)'
                    }}
                  />
                )}

                {/* Speed trail effect */}
                {dashActive && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md animate-ping" style={{ animationDuration: '0.5s' }} />
                    <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-lg" style={{ transform: 'scale(1.3)' }} />
                  </>
                )}

                {/* Player avatar container */}
                <div
                  className="w-full h-full rounded-full overflow-hidden border-4"
                  style={{
                    borderColor: activeShield ? '#60A5FA' : dashActive ? '#FBBF24' : shrinkActive ? '#A855F7' : '#fff',
                    boxShadow: `0 0 15px ${activeShield ? 'rgba(96,165,250,0.5)' : dashActive ? 'rgba(251,191,36,0.5)' : 'rgba(255,255,255,0.3)'}`,
                    background: '#1a1a2e'
                  }}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="Player"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                      😎
                    </div>
                  )}
                </div>
              </div>

              {/* Game Over Overlay */}
              {gameState === 'gameover' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                  <div className="text-6xl mb-4 animate-bounce">💥</div>
                  <h3 className="text-3xl font-black text-white mb-2">Game Over!</h3>
                  <p className="text-xl text-purple-300 mb-4">You survived {formatTime(elapsedMs)} seconds</p>

                  {lastTrophy && (
                    <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <div className="text-4xl mb-2">{lastTrophy.icon}</div>
                      <div className="text-xl font-bold text-yellow-300">{lastTrophy.label}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
                  >
                    🎮 Play Again
                  </button>
                </div>
              )}

              {/* Idle state overlay */}
              {gameState === 'idle' && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                  <div className="text-6xl mb-4">🥎</div>
                  <h3 className="text-3xl font-black text-white mb-2">Ready to Dodge?</h3>
                  <p className="text-purple-300 mb-6 max-w-md">
                    Use <span className="font-bold text-white">WASD</span> or <span className="font-bold text-white">Arrow Keys</span> to move.<br />
                    Avoid the balls, collect power-ups, survive as long as you can!
                  </p>
                  <button
                    type="button"
                    onClick={startGame}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105 animate-pulse"
                  >
                    🚀 Start Game
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:w-72 space-y-4">
            {/* Trophy Cabinet */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>🏆</span> Trophy Cabinet
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {trophyProgress.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-xl p-3 text-center border transition-all ${tier.unlocked
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                        : 'bg-white/5 border-white/10'
                      }`}
                  >
                    <div className={`text-2xl mb-1 ${tier.unlocked ? '' : 'grayscale opacity-40'}`}>
                      {tier.icon}
                    </div>
                    <div className={`text-xs font-semibold ${tier.unlocked ? 'text-yellow-300' : 'text-gray-500'}`}>
                      {tier.label}
                    </div>
                    <div className={`text-xs ${tier.unlocked ? 'text-yellow-400/70' : 'text-gray-600'}`}>
                      {tier.seconds}s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Power-ups Guide */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-purple-500/20">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>✨</span> Power-ups
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  { icon: '🛡️', name: 'Shield', desc: 'Block one hit' },
                  { icon: '⚡', name: 'Speed', desc: 'Move faster' },
                  { icon: '⏳', name: 'Time Warp', desc: 'Slow balls' },
                  { icon: '🔮', name: 'Shrink', desc: 'Smaller hitbox' }
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-gray-300">
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-gray-500">—</span>
                    <span className="text-gray-400">{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
              <h4 className="text-sm font-bold text-purple-300 mb-2">💡 Pro Tips</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Stay near the center for more escape routes</li>
                <li>• Save shield power-ups for when there are many balls</li>
                <li>• Use speed boost to quickly grab distant power-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DodgeballGame;
