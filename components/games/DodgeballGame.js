// components/games/DodgeballGame.js — Dodgeball Frenzy (major overhaul)
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAvatarLevel, getAvatarImage } from '../../utils/gameHelpers';

// ── Constants ─────────────────────────────────────────────────────────────────
const GW = 800;
const GH = 500;
const PLAYER_RADIUS  = 24;
const PLAYER_SPEED   = 290;
const BALL_BASE_SPEED = 138;
const BALL_RADIUS     = 14;

const POWERUP_SPAWN_MS    = 13000;
const POWERUP_LIFETIME_MS = 11000;
const POWERUP_RADIUS      = 20;
const POWERUP_TYPES = ['shield', 'dash', 'slow', 'freeze', 'shrink'];

const NEAR_MISS_DIST   = 40;   // px — yellow zone
const MEGA_MISS_DIST   = 22;   // px — red zone / mega bonus
const NEAR_MISS_STREAK_WINDOW = 3200; // ms between near misses to keep streak

const SCORE_PER_SECOND = 100;
const NEAR_MISS_BASE   = 30;
const MEGA_MISS_BASE   = 110;

const TROPHY_THRESHOLDS = [
  { id: 'bronze',  label: 'Bronze',  seconds: 30,  icon: '🥉', color: '#CD7F32' },
  { id: 'silver',  label: 'Silver',  seconds: 60,  icon: '🥈', color: '#C0C0C0' },
  { id: 'gold',    label: 'Gold',    seconds: 90,  icon: '🥇', color: '#FFD700' },
  { id: 'diamond', label: 'Diamond', seconds: 120, icon: '💎', color: '#B9F2FF' },
  { id: 'legend',  label: 'Legend',  seconds: 180, icon: '👑', color: '#ff6b6b' },
];

const BALL_COLORS = [
  { from: '#FF6B6B', to: '#FF8E53', glow: 'rgba(255,107,107,0.7)'  },
  { from: '#4ECDC4', to: '#44A08D', glow: 'rgba(78,205,196,0.7)'   },
  { from: '#DDA0DD', to: '#DA70D6', glow: 'rgba(221,160,221,0.7)'  },
  { from: '#87CEEB', to: '#00BFFF', glow: 'rgba(135,206,235,0.7)'  },
  { from: '#FFD93D', to: '#FF6B6B', glow: 'rgba(255,217,61,0.7)'   },
  { from: '#6BCB77', to: '#4CAF50', glow: 'rgba(107,203,119,0.7)'  },
  { from: '#9B59B6', to: '#8E44AD', glow: 'rgba(155,89,182,0.7)'   },
  { from: '#A8E6CF', to: '#88D8B0', glow: 'rgba(168,230,207,0.7)'  },
  // Fast ball — hot red/orange
  { from: '#FF4757', to: '#FF6348', glow: 'rgba(255,71,87,0.85)'   },
  // Homing ball — eerie green
  { from: '#2ed573', to: '#1e90ff', glow: 'rgba(46,213,115,0.75)'  },
  // Mega ball — deep magenta
  { from: '#e84393', to: '#c0392b', glow: 'rgba(232,67,147,0.75)'  },
];

// ── Utilities ─────────────────────────────────────────────────────────────────
const clamp       = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd         = (a, b)    => a + Math.random() * (b - a);
const fmt         = (ms)      => (ms / 1000).toFixed(1);

const chooseBallType = (elapsedSec) => {
  const r = Math.random();
  if (elapsedSec > 100 && r < 0.30) return 'homing';
  if (elapsedSec > 55  && r < 0.28) return 'fast';
  if (elapsedSec > 75  && r < 0.18) return 'mega';
  return 'normal';
};

const createBall = (index = 0, type = 'normal') => {
  const base = BALL_BASE_SPEED + index * 7;
  const cfg = {
    normal: { speed: base,         radius: BALL_RADIUS,         colorIdx: index % 8 },
    fast:   { speed: base * 1.68,  radius: BALL_RADIUS * 0.72,  colorIdx: 8         },
    mega:   { speed: base * 0.58,  radius: BALL_RADIUS * 1.62,  colorIdx: 10        },
    homing: { speed: base * 0.84,  radius: BALL_RADIUS * 0.88,  colorIdx: 9         },
  }[type] || { speed: base, radius: BALL_RADIUS, colorIdx: index % 8 };

  const angle = Math.random() * Math.PI * 2;
  const x = rnd(90, GW - 90);
  const y = rnd(90, GH - 90);

  return {
    id:    `b-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
    x, y,
    vx: Math.cos(angle) * cfg.speed,
    vy: Math.sin(angle) * cfg.speed,
    speed: cfg.speed,
    radius: cfg.radius,
    type,
    colorScheme: BALL_COLORS[cfg.colorIdx],
    trail: [],
  };
};

const createPowerup = () => {
  const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
  return {
    id: `pu-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    x: rnd(100, GW - 100),
    y: rnd(100, GH - 100),
    spawnedAt: Date.now(),
    pulse: 0,
  };
};

const createExplosion = (x, y, color, count = 14) =>
  Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const speed = rnd(70, 190);
    return {
      id: `e-${Date.now()}-${i}`,
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1, maxLife: 1,
      color,
      size: rnd(4, 10),
    };
  });

const POWERUP_META = {
  shield: { icon: '🛡️', label: 'Shield',    color: '#60A5FA', desc: 'Block one hit'          },
  dash:   { icon: '⚡', label: 'Speed',     color: '#FBBF24', desc: 'Move faster for 4s'      },
  slow:   { icon: '⏳', label: 'Time Warp', color: '#818CF8', desc: 'Slow balls for 5s'       },
  freeze: { icon: '❄️', label: 'Freeze',    color: '#67E8F9', desc: 'Freeze all balls for 2s' },
  shrink: { icon: '🔮', label: 'Shrink',    color: '#A855F7', desc: 'Smaller hitbox for 6s'   },
};

// ── Component ─────────────────────────────────────────────────────────────────
const DodgeballGame = ({ studentData, showToast, storageKeySuffix = 'student-dodgeball' }) => {

  // Core state
  const [gameState,     setGameState]     = useState('idle');
  const [player,        setPlayer]        = useState({ x: GW / 2, y: GH / 2 });
  const [balls,         setBalls]         = useState([]);
  const [powerups,      setPowerups]      = useState([]);
  const [particles,     setParticles]     = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [elapsedMs,     setElapsedMs]     = useState(0);
  const [score,         setScore]         = useState(0);
  const [bestMs,        setBestMs]        = useState(0);
  const [bestScore,     setBestScore]     = useState(0);
  const [dangerLevel,   setDangerLevel]   = useState(0);
  const [nearMissStreak,setNearMissStreak]= useState(0);
  const [milestone,     setMilestone]     = useState(null);
  const [lastTrophy,    setLastTrophy]    = useState(null);

  // Power-up states
  const [activeShield, setActiveShield] = useState(false);
  const [dashActive,   setDashActive]   = useState(false);
  const [slowActive,   setSlowActive]   = useState(false);
  const [freezeActive, setFreezeActive] = useState(false);
  const [shrinkActive, setShrinkActive] = useState(false);

  // Refs
  const containerRef       = useRef(null);
  const animationRef       = useRef(null);
  const lastTimeRef        = useRef(0);
  const startTimeRef       = useRef(0);
  const keysRef            = useRef({});
  const touchRef           = useRef({ active: false, startX: 0, startY: 0, curX: 0, curY: 0 });
  const gameStateRef       = useRef('idle');
  const playerRef          = useRef({ x: GW / 2, y: GH / 2 });
  const ballsRef           = useRef([]);
  const powerupsRef        = useRef([]);
  const particlesRef       = useRef([]);
  const floatingTextsRef   = useRef([]);
  const shieldRef          = useRef(false);
  const dashRef            = useRef(false);
  const slowRef            = useRef(false);
  const freezeRef          = useRef(false);
  const shrinkRef          = useRef(false);
  const ballAddTimerRef    = useRef(0);
  const powerupTimerRef    = useRef(0);
  const bonusScoreRef      = useRef(0);
  const nearMissStreakRef  = useRef(0);
  const lastNearMissRef    = useRef(0);
  const prevNearMissRef    = useRef(false);
  const milestonesRef      = useRef({});

  const avatarSrc = useMemo(() => {
    if (!studentData) return null;
    const level = calculateAvatarLevel(studentData.totalPoints || 0);
    return getAvatarImage(studentData.avatarBase, level);
  }, [studentData]);

  // Load best scores
  useEffect(() => {
    const savedMs    = localStorage.getItem(`dodgeball-best-${storageKeySuffix}`);
    const savedScore = localStorage.getItem(`dodgeball-score-${storageKeySuffix}`);
    if (savedMs)    setBestMs(Number(savedMs));
    if (savedScore) setBestScore(Number(savedScore));
  }, [storageKeySuffix]);

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d',' '].includes(e.key.toLowerCase()))
        e.preventDefault();
    };
    const up = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Ref syncs
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { playerRef.current    = player;    }, [player]);
  useEffect(() => { ballsRef.current     = balls;     }, [balls]);
  useEffect(() => { powerupsRef.current  = powerups;  }, [powerups]);
  useEffect(() => { particlesRef.current = particles; }, [particles]);
  useEffect(() => { shieldRef.current    = activeShield; }, [activeShield]);
  useEffect(() => { dashRef.current      = dashActive;   }, [dashActive]);
  useEffect(() => { slowRef.current      = slowActive;   }, [slowActive]);
  useEffect(() => { freezeRef.current    = freezeActive; }, [freezeActive]);
  useEffect(() => { shrinkRef.current    = shrinkActive; }, [shrinkActive]);

  // ── Power-up handler ────────────────────────────────────────────────────────

  const handlePowerup = useCallback((type) => {
    const meta = POWERUP_META[type];
    showToast?.(`${meta.icon} ${meta.label}! ${meta.desc}`);

    if (type === 'shield') {
      setActiveShield(true); shieldRef.current = true;
    } else if (type === 'dash') {
      setDashActive(true);  dashRef.current = true;
      setTimeout(() => { setDashActive(false);  dashRef.current = false;  }, 4000);
    } else if (type === 'slow') {
      setSlowActive(true);  slowRef.current = true;
      setTimeout(() => { setSlowActive(false);  slowRef.current = false;  }, 5000);
    } else if (type === 'freeze') {
      setFreezeActive(true); freezeRef.current = true;
      setTimeout(() => { setFreezeActive(false); freezeRef.current = false; }, 2200);
    } else if (type === 'shrink') {
      setShrinkActive(true); shrinkRef.current = true;
      setTimeout(() => { setShrinkActive(false); shrinkRef.current = false; }, 6000);
    }
  }, [showToast]);

  // ── Game over ───────────────────────────────────────────────────────────────

  const handleGameOver = useCallback((hitBall) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const survivalMs   = Date.now() - startTimeRef.current;
    const finalScore   = Math.floor(survivalMs / 1000 * SCORE_PER_SECOND) + bonusScoreRef.current;

    setElapsedMs(survivalMs);
    setScore(finalScore);
    setGameState('gameover');
    gameStateRef.current = 'gameover';

    if (hitBall) {
      const exp = createExplosion(playerRef.current.x, playerRef.current.y, '#FF6B6B', 20);
      setParticles(prev => [...prev, ...exp]);
    }

    setBestMs(prev => {
      const next = Math.max(prev, survivalMs);
      localStorage.setItem(`dodgeball-best-${storageKeySuffix}`, next);
      return next;
    });
    setBestScore(prev => {
      const next = Math.max(prev, finalScore);
      localStorage.setItem(`dodgeball-score-${storageKeySuffix}`, next);
      return next;
    });

    const trophy = TROPHY_THRESHOLDS.slice().reverse().find(t => survivalMs / 1000 >= t.seconds) || null;
    setLastTrophy(trophy);
  }, [storageKeySuffix]);

  // ── Game loop ───────────────────────────────────────────────────────────────

  const gameLoop = useCallback((timestamp) => {
    if (gameStateRef.current !== 'playing') return;

    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const elapsedSec   = (Date.now() - startTimeRef.current) / 1000;
    const speedMult    = dashRef.current ? 1.62 : 1;
    const ballSpdMult  = freezeRef.current ? 0 : slowRef.current ? 0.45 : 1;
    const effectiveR   = shrinkRef.current ? PLAYER_RADIUS * 0.6 : PLAYER_RADIUS;

    // Score: time-based + bonus
    const currentScore = Math.floor(elapsedSec * SCORE_PER_SECOND) + bonusScoreRef.current;
    setElapsedMs(Date.now() - startTimeRef.current);
    setScore(currentScore);

    // Milestone check
    TROPHY_THRESHOLDS.forEach(t => {
      if (!milestonesRef.current[t.id] && elapsedSec >= t.seconds) {
        milestonesRef.current[t.id] = true;
        setMilestone(t);
        setTimeout(() => setMilestone(null), 2600);
      }
    });

    // ── Player movement (keyboard) ──
    const k = keysRef.current;
    let p = { ...playerRef.current };
    const mv = PLAYER_SPEED * speedMult * dt;

    if (k['arrowup']    || k['w']) p.y -= mv;
    if (k['arrowdown']  || k['s']) p.y += mv;
    if (k['arrowleft']  || k['a']) p.x -= mv;
    if (k['arrowright'] || k['d']) p.x += mv;

    // Touch movement
    const t = touchRef.current;
    if (t.active) {
      const tdx  = t.curX - t.startX;
      const tdy  = t.curY - t.startY;
      const tmag = Math.sqrt(tdx * tdx + tdy * tdy);
      if (tmag > 8) {
        const sense = Math.min(tmag / 55, 1);
        p.x += (tdx / tmag) * PLAYER_SPEED * speedMult * dt * sense;
        p.y += (tdy / tmag) * PLAYER_SPEED * speedMult * dt * sense;
      }
    }

    p.x = clamp(p.x, effectiveR, GW - effectiveR);
    p.y = clamp(p.y, effectiveR, GH - effectiveR);
    playerRef.current = p;
    setPlayer(p);

    // ── Update balls ──
    let hitDetected  = null;
    let closestDist  = Infinity;

    const updatedBalls = ballsRef.current.map(ball => {
      let { x, y, vx, vy, trail, speed: bspd, type } = ball;

      // Homing steering
      if (type === 'homing' && !freezeRef.current) {
        const hdx  = p.x - x, hdy = p.y - y;
        const hd   = Math.sqrt(hdx * hdx + hdy * hdy) || 1;
        const pull = 0.025;
        vx += (hdx / hd) * bspd * pull;
        vy += (hdy / hd) * bspd * pull;
        const curSpd = Math.sqrt(vx * vx + vy * vy) || 1;
        vx = (vx / curSpd) * bspd;
        vy = (vy / curSpd) * bspd;
      }

      x += vx * dt * ballSpdMult;
      y += vy * dt * ballSpdMult;

      if (x <= ball.radius || x >= GW - ball.radius) { vx = -vx; x = clamp(x, ball.radius, GW - ball.radius); }
      if (y <= ball.radius || y >= GH - ball.radius) { vy = -vy; y = clamp(y, ball.radius, GH - ball.radius); }

      const newTrail = [...(trail || []), { x, y }].slice(-10);

      const dx = x - p.x, dy = y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) closestDist = dist;
      if (dist < ball.radius + effectiveR) hitDetected = ball;

      return { ...ball, x, y, vx, vy, trail: newTrail };
    });

    // Ball-to-ball elastic collisions
    for (let i = 0; i < updatedBalls.length; i++) {
      for (let j = i + 1; j < updatedBalls.length; j++) {
        const a = updatedBalls[i], b = updatedBalls[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minD = a.radius + b.radius;
        if (dist < minD) {
          const ov = minD - dist, nx = dx / dist, ny = dy / dist;
          a.x -= nx * ov / 2; a.y -= ny * ov / 2;
          b.x += nx * ov / 2; b.y += ny * ov / 2;
          const v1n = a.vx * nx + a.vy * ny;
          const v2n = b.vx * nx + b.vy * ny;
          a.vx += (v2n - v1n) * nx; a.vy += (v2n - v1n) * ny;
          b.vx += (v1n - v2n) * nx; b.vy += (v1n - v2n) * ny;
        }
      }
    }
    ballsRef.current = updatedBalls;
    setBalls(updatedBalls);

    // ── Danger meter ──
    const dangerBalls = Math.min(updatedBalls.length / 9, 1);
    const dangerProx  = closestDist < 90 ? (1 - closestDist / 90) * 0.38 : 0;
    setDangerLevel(Math.min(1, dangerBalls * 0.65 + dangerProx));

    // ── Near miss detection ──
    const isNearMiss  = closestDist < NEAR_MISS_DIST   && closestDist > effectiveR + BALL_RADIUS;
    const isMegaMiss  = closestDist < MEGA_MISS_DIST   && closestDist > effectiveR + BALL_RADIUS;
    const wasNearMiss = prevNearMissRef.current;
    prevNearMissRef.current = isNearMiss || isMegaMiss;

    if ((isNearMiss || isMegaMiss) && !wasNearMiss) {
      const now = Date.now();
      if (now - lastNearMissRef.current < NEAR_MISS_STREAK_WINDOW) {
        nearMissStreakRef.current = Math.min(nearMissStreakRef.current + 1, 8);
      } else {
        nearMissStreakRef.current = 1;
      }
      lastNearMissRef.current = now;
      setNearMissStreak(nearMissStreakRef.current);

      const base     = isMegaMiss ? MEGA_MISS_BASE : NEAR_MISS_BASE;
      const mult     = 1 + (nearMissStreakRef.current - 1) * 0.5;
      const pts      = Math.floor(base * mult);
      bonusScoreRef.current += pts;

      floatingTextsRef.current = [
        ...floatingTextsRef.current,
        {
          id:    `ft-${Date.now()}`,
          x:     p.x + rnd(-25, 25),
          y:     p.y - 28,
          text:  isMegaMiss ? `🔥 +${pts}!!` : `+${pts} close!`,
          color: isMegaMiss ? '#fbbf24' : '#34d399',
          life:  0.9,
        },
      ].slice(-7);
    }

    // ── Collision handling ──
    if (hitDetected) {
      if (shieldRef.current) {
        setActiveShield(false); shieldRef.current = false;
        showToast?.('🛡️ Shield blocked the hit!');
        const filtered = ballsRef.current.filter(b => b.id !== hitDetected.id);
        ballsRef.current = filtered;
        setBalls(filtered);
        const sp = createExplosion(p.x, p.y, '#60A5FA', 10);
        setParticles(prev => [...prev, ...sp]);
      } else {
        handleGameOver(hitDetected);
        return;
      }
    }

    // ── Power-ups ──
    const now = Date.now();
    const updatedPowerups = powerupsRef.current
      .filter(pu => now - pu.spawnedAt < POWERUP_LIFETIME_MS)
      .map(pu => ({ ...pu, pulse: (pu.pulse + dt * 3.2) % (Math.PI * 2) }));

    const remaining = updatedPowerups.filter(pu => {
      const dx = pu.x - p.x, dy = pu.y - p.y;
      if (Math.sqrt(dx * dx + dy * dy) < effectiveR + POWERUP_RADIUS) {
        handlePowerup(pu.type);
        const sp = createExplosion(pu.x, pu.y, POWERUP_META[pu.type].color, 8);
        setParticles(prev => [...prev, ...sp]);
        return false;
      }
      return true;
    });
    powerupsRef.current = remaining;
    setPowerups(remaining);

    // ── Particles ──
    const updatedParticles = particlesRef.current
      .map(pt => ({
        ...pt,
        x: pt.x + pt.vx * dt,
        y: pt.y + pt.vy * dt,
        life: pt.life - dt * 1.8,
        vx: pt.vx * 0.97,
        vy: pt.vy * 0.97 + 40 * dt,
      }))
      .filter(pt => pt.life > 0);
    particlesRef.current = updatedParticles;
    setParticles(updatedParticles);

    // ── Floating texts ──
    const updatedFT = floatingTextsRef.current
      .map(ft => ({ ...ft, y: ft.y - 55 * dt, life: ft.life - dt * 1.1 }))
      .filter(ft => ft.life > 0);
    floatingTextsRef.current = updatedFT;
    setFloatingTexts([...updatedFT]);

    // ── Timers: ball spawn (accelerates) ──
    ballAddTimerRef.current  += dt * 1000;
    powerupTimerRef.current  += dt * 1000;

    const ballAddInterval = Math.max(3200, 7200 - Math.floor(elapsedSec / 15) * 450);
    if (ballAddTimerRef.current >= ballAddInterval && ballsRef.current.length < 14) {
      ballAddTimerRef.current = 0;
      const bType   = chooseBallType(elapsedSec);
      const newBall = createBall(ballsRef.current.length, bType);
      ballsRef.current = [...ballsRef.current, newBall];
      setBalls([...ballsRef.current]);
      const typeLabel = bType !== 'normal' ? ` (${bType})` : '';
      floatingTextsRef.current = [
        ...floatingTextsRef.current,
        { id: `ft-nb-${Date.now()}`, x: newBall.x, y: newBall.y + 30, text: `⚡ New ball!${typeLabel}`, color: '#fb923c', life: 0.85 },
      ].slice(-7);
    }

    // ── Timer: power-up spawn ──
    if (powerupTimerRef.current >= POWERUP_SPAWN_MS && powerupsRef.current.length < 2) {
      powerupTimerRef.current = 0;
      const pu = createPowerup();
      powerupsRef.current = [...powerupsRef.current, pu];
      setPowerups([...powerupsRef.current]);
    }

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [handleGameOver, handlePowerup, showToast]);

  // ── Start game ──────────────────────────────────────────────────────────────

  const startGame = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const initP = { x: GW / 2, y: GH / 2 };
    const initB = [createBall(0)];

    playerRef.current      = initP;
    ballsRef.current       = initB;
    powerupsRef.current    = [];
    particlesRef.current   = [];
    floatingTextsRef.current = [];
    bonusScoreRef.current  = 0;
    nearMissStreakRef.current = 0;
    lastNearMissRef.current   = 0;
    prevNearMissRef.current   = false;
    milestonesRef.current     = {};
    ballAddTimerRef.current   = 0;
    powerupTimerRef.current   = 0;

    setPlayer(initP);
    setBalls(initB);
    setPowerups([]);
    setParticles([]);
    setFloatingTexts([]);
    setElapsedMs(0);
    setScore(0);
    setDangerLevel(0);
    setNearMissStreak(0);
    setMilestone(null);
    setLastTrophy(null);
    setActiveShield(false); shieldRef.current  = false;
    setDashActive(false);   dashRef.current    = false;
    setSlowActive(false);   slowRef.current    = false;
    setFreezeActive(false); freezeRef.current  = false;
    setShrinkActive(false); shrinkRef.current  = false;

    startTimeRef.current = Date.now();
    lastTimeRef.current  = performance.now();

    setGameState('playing');
    gameStateRef.current = 'playing';
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); }, []);

  // ── Touch handlers ──────────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e) => {
    if (gameStateRef.current !== 'playing') return;
    e.preventDefault();
    const rect  = containerRef.current?.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = GW / (rect?.width  || GW);
    const scaleY = GH / (rect?.height || GH);
    touchRef.current = {
      active: true,
      startX: (touch.clientX - (rect?.left || 0)) * scaleX,
      startY: (touch.clientY - (rect?.top  || 0)) * scaleY,
      curX:   (touch.clientX - (rect?.left || 0)) * scaleX,
      curY:   (touch.clientY - (rect?.top  || 0)) * scaleY,
    };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchRef.current.active) return;
    e.preventDefault();
    const rect  = containerRef.current?.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = GW / (rect?.width  || GW);
    const scaleY = GH / (rect?.height || GH);
    touchRef.current.curX = (touch.clientX - (rect?.left || 0)) * scaleX;
    touchRef.current.curY = (touch.clientY - (rect?.top  || 0)) * scaleY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchRef.current = { active: false, startX: 0, startY: 0, curX: 0, curY: 0 };
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────

  const trophyProgress = TROPHY_THRESHOLDS.map(t => ({
    ...t,
    unlocked: bestMs / 1000 >= t.seconds,
    current:  elapsedMs / 1000 >= t.seconds,
  }));

  const displayR = shrinkActive ? PLAYER_RADIUS * 0.6 : PLAYER_RADIUS;

  const dangerColor = dangerLevel > 0.72
    ? 'rgba(239,68,68,0.85)'
    : dangerLevel > 0.42
    ? 'rgba(245,158,11,0.7)'
    : 'rgba(139,92,246,0.35)';

  const activePowerups = [
    activeShield && 'shield',
    dashActive   && 'dash',
    slowActive   && 'slow',
    freezeActive && 'freeze',
    shrinkActive && 'shrink',
  ].filter(Boolean);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-3xl shadow-2xl overflow-hidden relative">

      {/* ── Top HUD ── */}
      <div className="bg-black/40 backdrop-blur border-b border-white/10 px-5 py-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5 mr-auto">
          <span className="text-3xl">🥎</span>
          <div>
            <h2 className="text-xl font-black text-white leading-none">Dodgeball Frenzy</h2>
            <p className="text-purple-400 text-xs">Dodge · Survive · Score</p>
          </div>
        </div>

        {/* Score */}
        <div className="bg-black/50 border border-purple-500/30 rounded-xl px-4 py-2 text-center min-w-[80px]">
          <div className="text-[10px] text-purple-300 uppercase tracking-widest">Score</div>
          <div className="text-xl font-black text-white font-mono">{score.toLocaleString()}</div>
        </div>

        {/* Time */}
        <div className="bg-black/50 border border-cyan-500/30 rounded-xl px-4 py-2 text-center min-w-[72px]">
          <div className="text-[10px] text-cyan-300 uppercase tracking-widest">Time</div>
          <div className="text-xl font-black text-white font-mono">{fmt(elapsedMs)}s</div>
        </div>

        {/* Balls */}
        <div className="bg-black/50 border border-orange-500/30 rounded-xl px-4 py-2 text-center min-w-[60px]">
          <div className="text-[10px] text-orange-300 uppercase tracking-widest">Balls</div>
          <div className="text-xl font-black text-orange-400">{balls.length}</div>
        </div>

        {/* Danger meter */}
        <div className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 w-32 hidden sm:block">
          <div className="text-[10px] text-white/50 uppercase tracking-widest mb-1.5">Danger</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${dangerLevel * 100}%`,
                background: dangerLevel > 0.7 ? 'linear-gradient(to right,#ef4444,#ff6b6b)'
                          : dangerLevel > 0.4 ? 'linear-gradient(to right,#f59e0b,#fbbf24)'
                          : 'linear-gradient(to right,#10b981,#34d399)',
              }} />
          </div>
        </div>

        {/* Start / Restart */}
        <button onClick={startGame}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95 text-sm">
          {gameState === 'playing' ? '🔄 Restart' : gameState === 'gameover' ? '🎮 Again' : '🚀 Start'}
        </button>
      </div>

      {/* ── Active power-ups + near-miss streak ── */}
      {(activePowerups.length > 0 || nearMissStreak >= 2) && (
        <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-white/5 bg-black/20">
          {activePowerups.map(type => {
            const m = POWERUP_META[type];
            return (
              <span key={type} className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse border"
                style={{ background: `${m.color}22`, borderColor: `${m.color}55`, color: m.color }}>
                {m.icon} {m.label}
              </span>
            );
          })}
          {nearMissStreak >= 2 && (
            <motion.span key={nearMissStreak}
              initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1">
              🔥 ×{nearMissStreak} near-miss streak!
            </motion.span>
          )}
        </div>
      )}

      {/* ── Arena ── */}
      <div className="p-4">
        <div ref={containerRef}
          className="relative rounded-2xl overflow-hidden mx-auto select-none"
          style={{
            backgroundColor: '#0a0616',
            aspectRatio: `${GW} / ${GH}`,
            maxHeight: 520,
            border: `2px solid ${dangerColor}`,
            boxShadow: dangerLevel > 0.65 ? `0 0 35px ${dangerColor}` : 'none',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}>

          {/* Layered background */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(139,92,246,0.12) 0%, transparent 45%),
              radial-gradient(circle at 80% 70%, rgba(236,72,153,0.10) 0%, transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(59,130,246,0.07) 0%, transparent 60%)
            `
          }} />

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />

          {/* Danger flash overlay */}
          {dangerLevel > 0.8 && (
            <div className="absolute inset-0 pointer-events-none animate-pulse"
              style={{ background: 'radial-gradient(circle at center, transparent 50%, rgba(239,68,68,0.07) 100%)' }} />
          )}

          {/* Particles */}
          {particles.map(pt => (
            <div key={pt.id} className="absolute rounded-full pointer-events-none"
              style={{
                left: `${(pt.x / GW) * 100}%`,
                top:  `${(pt.y / GH) * 100}%`,
                width:  pt.size * (pt.life / pt.maxLife),
                height: pt.size * (pt.life / pt.maxLife),
                background: pt.color,
                opacity: pt.life / pt.maxLife,
                transform: 'translate(-50%,-50%)',
              }} />
          ))}

          {/* Ball trails + balls */}
          {balls.map(ball => (
            <React.Fragment key={ball.id}>
              {ball.trail?.map((tr, i) => (
                <div key={`${ball.id}-t${i}`} className="absolute rounded-full pointer-events-none"
                  style={{
                    left:    `${(tr.x / GW) * 100}%`,
                    top:     `${(tr.y / GH) * 100}%`,
                    width:   `${((ball.radius * 1.8) / GW) * 100 * (i / ball.trail.length) * 0.55}%`,
                    height:  `${((ball.radius * 1.8) / GH) * 100 * (i / ball.trail.length) * 0.55}%`,
                    background: ball.colorScheme.glow,
                    opacity: (i / ball.trail.length) * 0.45,
                    transform: 'translate(-50%,-50%)',
                  }} />
              ))}
              <div className="absolute rounded-full"
                style={{
                  left:   `${(ball.x / GW) * 100}%`,
                  top:    `${(ball.y / GH) * 100}%`,
                  width:  `${((ball.radius * 2) / GW) * 100}%`,
                  height: `${((ball.radius * 2) / GH) * 100}%`,
                  background: `radial-gradient(circle at 30% 28%, #fff, ${ball.colorScheme.from}, ${ball.colorScheme.to})`,
                  boxShadow:  `0 0 18px ${ball.colorScheme.glow}, 0 0 36px ${ball.colorScheme.glow}, inset 0 0 8px rgba(255,255,255,0.25)`,
                  transform: 'translate(-50%,-50%)',
                  // Homing balls pulsate
                  outline: ball.type === 'homing' ? '2px dashed rgba(46,213,115,0.6)' : 'none',
                  outlineOffset: 3,
                }}>
                {/* Type label for special balls */}
                {ball.type !== 'normal' && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black whitespace-nowrap pointer-events-none"
                    style={{ color: ball.colorScheme.from, textShadow: `0 0 6px ${ball.colorScheme.glow}` }}>
                    {ball.type === 'fast' ? '⚡' : ball.type === 'mega' ? '💥' : '🎯'}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}

          {/* Power-ups */}
          {powerups.map(pu => {
            const m = POWERUP_META[pu.type];
            return (
              <div key={pu.id} className="absolute flex items-center justify-center rounded-2xl"
                style={{
                  left:   `${(pu.x / GW) * 100}%`,
                  top:    `${(pu.y / GH) * 100}%`,
                  width:  `${((POWERUP_RADIUS * 2 + 10) / GW) * 100}%`,
                  height: `${((POWERUP_RADIUS * 2 + 10) / GH) * 100}%`,
                  transform: `translate(-50%,-50%) scale(${1 + Math.sin(pu.pulse) * 0.12})`,
                  background: `${m.color}22`,
                  border: `2px solid ${m.color}66`,
                  boxShadow: `0 0 20px ${m.color}55, 0 0 40px ${m.color}22`,
                }}>
                <span className="text-2xl leading-none">{m.icon}</span>
              </div>
            );
          })}

          {/* Floating texts */}
          {floatingTexts.map(ft => (
            <div key={ft.id} className="absolute pointer-events-none font-black text-sm whitespace-nowrap"
              style={{
                left:    `${(ft.x / GW) * 100}%`,
                top:     `${(ft.y / GH) * 100}%`,
                color:   ft.color,
                opacity: ft.life,
                transform: 'translate(-50%,-50%)',
                textShadow: `0 0 10px ${ft.color}`,
              }}>
              {ft.text}
            </div>
          ))}

          {/* Player */}
          <div className="absolute"
            style={{
              left:   `${(player.x / GW) * 100}%`,
              top:    `${(player.y / GH) * 100}%`,
              width:  `${(displayR * 2 / GW) * 100}%`,
              height: `${(displayR * 2 / GH) * 100}%`,
              transform: 'translate(-50%,-50%)',
              transition: shrinkActive ? 'width 0.3s, height 0.3s' : undefined,
            }}>
            {/* Shield aura */}
            {activeShield && (
              <div className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  transform: 'scale(1.55)',
                  background: 'radial-gradient(circle, rgba(96,165,250,0.35) 0%, transparent 70%)',
                  boxShadow: '0 0 28px rgba(96,165,250,0.7), inset 0 0 18px rgba(96,165,250,0.25)',
                }} />
            )}

            {/* Dash flames */}
            {dashActive && (
              <>
                <div className="absolute inset-0 rounded-full bg-yellow-400/25 blur-md animate-ping" style={{ animationDuration: '0.45s' }} />
                <div className="absolute inset-0 rounded-full bg-yellow-400/15 blur-xl" style={{ transform: 'scale(1.35)' }} />
              </>
            )}

            {/* Freeze crystal ring */}
            {freezeActive && (
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/80 animate-spin"
                style={{ transform: 'scale(1.4)', boxShadow: '0 0 20px rgba(103,232,249,0.6)' }} />
            )}

            {/* Avatar */}
            <div className="w-full h-full rounded-full overflow-hidden border-4"
              style={{
                borderColor: activeShield ? '#60A5FA' : dashActive ? '#FBBF24' : freezeActive ? '#67E8F9' : shrinkActive ? '#A855F7' : '#e2e8f0',
                boxShadow: `0 0 14px ${activeShield ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.25)'}`,
                background: '#1a1a2e',
              }}>
              {avatarSrc
                ? <img src={avatarSrc} alt="Player" className="w-full h-full object-cover" draggable={false} />
                : <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500 to-pink-500">😎</div>
              }
            </div>
          </div>

          {/* Milestone announcement */}
          <AnimatePresence>
            {milestone && (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                <div className="text-center drop-shadow-2xl">
                  <div className="text-7xl mb-1">{milestone.icon}</div>
                  <div className="text-4xl font-black text-white tracking-tight"
                    style={{ textShadow: `0 0 30px ${milestone.color}` }}>
                    {milestone.label.toUpperCase()}!
                  </div>
                  <div className="text-white/70 text-lg font-bold mt-1">{milestone.seconds} seconds survived</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Idle overlay */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/55 backdrop-blur-sm">
              <div className="text-7xl mb-4">🥎</div>
              <h3 className="text-3xl font-black text-white mb-2">Dodgeball Frenzy</h3>
              <p className="text-purple-200 mb-2 max-w-sm text-sm leading-relaxed">
                Use <strong className="text-white">WASD</strong> or <strong className="text-white">Arrow Keys</strong> to move.<br />
                On mobile: <strong className="text-white">drag</strong> anywhere to control your player.
              </p>
              <p className="text-purple-400 text-sm mb-6">Dodge the balls · collect power-ups · earn near-miss bonuses!</p>
              <button onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all animate-pulse">
                🚀 Start Game
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Trophy row ── */}
      <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-purple-400 font-bold uppercase tracking-widest">Trophies:</span>
        {trophyProgress.map(t => (
          <div key={t.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              t.current  ? 'border-yellow-400/60 bg-yellow-500/20 text-yellow-300 scale-105' :
              t.unlocked ? 'border-white/20 bg-white/10 text-white/70' :
                           'border-white/10 bg-transparent text-white/30 grayscale'
            }`}>
            <span className={t.unlocked ? '' : 'opacity-40'}>{t.icon}</span>
            <span>{t.label}</span>
            <span className="opacity-60">{t.seconds}s</span>
          </div>
        ))}
        {bestScore > 0 && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-bold">
            🏅 Best: {bestScore.toLocaleString()}
          </div>
        )}
      </div>

      {/* ── Game Over modal ── */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl p-4">
            <motion.div
              initial={{ scale: 0.75, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 border border-purple-500/30 rounded-3xl p-7 max-w-md w-full shadow-2xl text-center">

              {/* Trophy / icon */}
              {lastTrophy
                ? <div className="text-7xl mb-2">{lastTrophy.icon}</div>
                : <div className="text-7xl mb-2">💥</div>
              }

              <h3 className="text-3xl font-black text-white mb-1">
                {lastTrophy ? `${lastTrophy.label} Achieved!` : 'Game Over!'}
              </h3>
              <p className="text-purple-300 text-sm mb-5">
                {lastTrophy ? 'Incredible survival skills!' : 'Keep dodging — you\'ll get there!'}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { val: score.toLocaleString(),    label: 'Score',      color: 'text-purple-300' },
                  { val: `${fmt(elapsedMs)}s`,       label: 'Survived',   color: 'text-cyan-300'   },
                  { val: balls.length,               label: 'Balls',      color: 'text-orange-300' },
                  { val: `×${nearMissStreak}`,       label: 'Best Streak',color: 'text-amber-300'  },
                ].map(s => (
                  <div key={s.label} className="bg-white/8 border border-white/10 rounded-2xl p-3">
                    <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
                    <div className="text-xs text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Personal best comparison */}
              <div className="flex justify-center gap-6 py-3 bg-white/5 rounded-2xl border border-white/10 mb-5 text-sm">
                <div>
                  <div className="text-green-300 font-black text-lg">{bestScore.toLocaleString()}</div>
                  <div className="text-white/40 text-xs">Best Score</div>
                </div>
                <div className="w-px bg-white/10" />
                <div>
                  <div className="text-cyan-300 font-black text-lg">{fmt(bestMs)}s</div>
                  <div className="text-white/40 text-xs">Best Time</div>
                </div>
              </div>

              {/* New best indicator */}
              {score >= bestScore && score > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
                  className="mb-4 text-amber-400 font-black text-sm flex items-center justify-center gap-1">
                  🏆 New personal best!
                </motion.div>
              )}

              <div className="flex gap-3">
                <button onClick={startGame}
                  className="flex-1 py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95">
                  🎮 Play Again
                </button>
                <button onClick={() => setGameState('idle')}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-white/8 border border-white/10 text-white/70 hover:bg-white/15 transition-all active:scale-95">
                  ← Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DodgeballGame;
