// components/games/NeonSerpentGame.js — Neon Serpent 🐍
// A polished neon snake arcade: smooth interpolated movement, juicy
// power-ups (golden apple, ghost berry, slow-mo, shrink), eat-combos,
// and two modes — Classic (walls bite back) and Portal (wrap around).
// Keyboard, swipe, and on-screen controls. High scores + daily coins.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const COLS = 24;
const ROWS = 16;
const START_LEN = 4;
const TICK_START = 165; // ms per move
const TICK_MIN = 78;
const TICK_DECAY = 2.2; // ms faster per food eaten
const COMBO_WINDOW = 5000; // ms between eats to keep combo
const REWARD_SCORE = 150;
const REWARD_COINS = 5;

const SPECIALS = {
  golden: { emoji: '⭐', points: 50, life: 6500, chance: 0.1, color: '#fbbf24' },
  ghost: { emoji: '🫐', points: 15, life: 8000, chance: 0.07, color: '#818cf8', duration: 8000 },
  slow: { emoji: '⏰', points: 15, life: 8000, chance: 0.07, color: '#34d399', duration: 5000 },
  shrink: { emoji: '✂️', points: 15, life: 8000, chance: 0.06, color: '#f472b6' },
};

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Tiny WebAudio synth ──────────────────────────────────────────────────────
function createSynth(mutedRef) {
  let ctx = null;
  const ensure = () => {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const tone = (freq, dur, type = 'sine', vol = 0.1, when = 0, slide = 0) => {
    if (mutedRef.current) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };
  return {
    ensure,
    eat: (combo = 0) => tone(440 + Math.min(combo, 8) * 60, 0.1, 'triangle', 0.1, 0, 120),
    special: () => { [659, 880, 1175].forEach((f, i) => tone(f, 0.12, 'sine', 0.09, i * 0.05)); },
    turn: () => tone(330, 0.04, 'square', 0.03),
    portal: () => tone(523, 0.1, 'sine', 0.07, 0, 300),
    powerDown: () => tone(700, 0.25, 'sine', 0.08, 0, -350),
    die: () => {
      tone(330, 0.25, 'sawtooth', 0.12, 0, -120);
      tone(220, 0.35, 'sawtooth', 0.12, 0.12, -100);
      tone(110, 0.5, 'sawtooth', 0.12, 0.25, -50);
    },
    gameOver: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'triangle', 0.1, i * 0.15)); },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const NeonSerpentGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const synthRef = useRef(null);
  const mutedRef = useRef(false);
  const touchStart = useRef(null);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [mode, setMode] = useState('classic'); // classic | portal
  const [score, setScore] = useState(0);
  const [length, setLength] = useState(START_LEN);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [best, setBest] = useState({ classic: 0, portal: 0 });
  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');

  const g = useRef({
    running: false,
    paused: false,
    mode: 'classic',
    W: 720,
    H: 480,
    dpr: 1,
    cell: 30,
    snake: [], // [{x,y}] head first
    prevSnake: [],
    dir: 'right',
    dirQueue: [],
    food: null, // {x,y}
    special: null, // {x,y,kind,expires}
    tick: TICK_START,
    lastTick: 0,
    score: 0,
    eaten: 0,
    combo: 0,
    lastEatAt: 0,
    ghostUntil: 0,
    slowUntil: 0,
    particles: [],
    popups: [],
    flashUntil: 0,
    shakeUntil: 0,
    deadAt: 0,
    maxCombo: 0,
    specialsEaten: 0,
  });

  // ── Persistence ──
  useEffect(() => {
    try {
      setBest({
        classic: parseInt(localStorage.getItem('serpent_best_classic') || '0', 10),
        portal: parseInt(localStorage.getItem('serpent_best_portal') || '0', 10),
      });
      const m = localStorage.getItem('serpent_muted') === '1';
      setMuted(m);
      mutedRef.current = m;
    } catch {}
    synthRef.current = createSynth(mutedRef);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem('serpent_muted', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // ── Sizing ──
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const width = wrap.clientWidth;
    const cell = Math.floor(width / COLS);
    const w = cell * COLS;
    const h = cell * ROWS;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const s = g.current;
    s.W = w;
    s.H = h;
    s.cell = cell;
    s.dpr = dpr;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Auto-pause on tab hide
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && g.current.running) {
        g.current.paused = true;
        setPaused(true);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // ── Helpers ──
  const cellFree = (s, x, y) => !s.snake.some((seg) => seg.x === x && seg.y === y);

  const spawnFood = (s) => {
    for (let tries = 0; tries < 500; tries++) {
      const x = randInt(0, COLS - 1);
      const y = randInt(0, ROWS - 1);
      if (cellFree(s, x, y) && !(s.special && s.special.x === x && s.special.y === y)) {
        s.food = { x, y };
        return;
      }
    }
    s.food = null;
  };

  const maybeSpawnSpecial = (s, now) => {
    if (s.special) return;
    const roll = Math.random();
    let acc = 0;
    for (const [kind, def] of Object.entries(SPECIALS)) {
      acc += def.chance;
      if (roll < acc) {
        for (let tries = 0; tries < 200; tries++) {
          const x = randInt(0, COLS - 1);
          const y = randInt(0, ROWS - 1);
          if (cellFree(s, x, y) && !(s.food && s.food.x === x && s.food.y === y)) {
            s.special = { x, y, kind, expires: now + def.life };
            return;
          }
        }
        return;
      }
    }
  };

  const addPopup = (text, x, y, color = '#fff', size = 16) => {
    g.current.popups.push({ text, x, y, t: 0, color, size });
  };

  const addBurst = (x, y, color, n = 10) => {
    const s = g.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 140;
      s.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 1.5 + Math.random() * 3,
        color,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.3,
      });
    }
  };

  // ── Direction input ──
  const queueDir = useCallback((dir) => {
    const s = g.current;
    if (!s.running || s.paused) return;
    const last = s.dirQueue.length ? s.dirQueue[s.dirQueue.length - 1] : s.dir;
    if (dir === last || dir === OPPOSITE[last]) return;
    if (s.dirQueue.length < 3) {
      s.dirQueue.push(dir);
      synthRef.current?.turn();
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const map = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
        W: 'up', S: 'down', A: 'left', D: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        queueDir(dir);
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueDir]);

  // Swipe controls
  const onPointerDown = (e) => {
    synthRef.current?.ensure();
    touchStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const st = touchStart.current;
    touchStart.current = null;
    if (!st) return;
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) queueDir(dx > 0 ? 'right' : 'left');
    else queueDir(dy > 0 ? 'down' : 'up');
  };

  // ── Game over ──
  const endGame = useCallback(() => {
    const s = g.current;
    if (!s.running) return;
    s.running = false;
    synthRef.current?.gameOver();
    const finalScore = s.score;
    const m = s.mode;

    setBest((prev) => {
      const next = { ...prev };
      if (finalScore > (prev[m] || 0)) {
        next[m] = finalScore;
        try { localStorage.setItem(`serpent_best_${m}`, String(finalScore)); } catch {}
      }
      return next;
    });

    setFinalStats({
      score: finalScore,
      length: s.snake.length,
      eaten: s.eaten,
      maxCombo: s.maxCombo,
      mode: m,
    });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.neonSerpent?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            neonSerpent: {
              ...studentData.gameProgress?.neonSerpent,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.neonSerpent?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🐍 Neon Serpent reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
    }

    setTimeout(() => setScreen('over'), 700);
  }, [studentData, updateStudentData, showToast]);

  // ── Tick (one grid move) ──
  const doTick = useCallback(
    (now) => {
      const s = g.current;
      if (s.dirQueue.length) s.dir = s.dirQueue.shift();
      const d = DIRS[s.dir];
      const head = s.snake[0];
      let nx = head.x + d.x;
      let ny = head.y + d.y;

      // Walls
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
        if (s.mode === 'portal') {
          nx = (nx + COLS) % COLS;
          ny = (ny + ROWS) % ROWS;
          synthRef.current?.portal();
        } else {
          s.deadAt = now;
          s.flashUntil = now + 350;
          s.shakeUntil = now + 400;
          synthRef.current?.die();
          addBurst((head.x + 0.5) * s.cell, (head.y + 0.5) * s.cell, '#22d3ee', 24);
          endGame();
          return;
        }
      }

      // Self collision (ghost mode passes through)
      const ghost = now < s.ghostUntil;
      const willEat = s.food && s.food.x === nx && s.food.y === ny;
      const bodyToCheck = willEat ? s.snake : s.snake.slice(0, -1); // tail moves unless growing
      if (!ghost && bodyToCheck.some((seg) => seg.x === nx && seg.y === ny)) {
        s.deadAt = now;
        s.flashUntil = now + 350;
        s.shakeUntil = now + 400;
        synthRef.current?.die();
        addBurst((nx + 0.5) * s.cell, (ny + 0.5) * s.cell, '#f472b6', 24);
        endGame();
        return;
      }

      s.prevSnake = s.snake.map((seg) => ({ ...seg }));
      s.snake.unshift({ x: nx, y: ny });

      // Eat food
      if (willEat) {
        const comboAlive = now - s.lastEatAt < COMBO_WINDOW;
        s.combo = comboAlive ? s.combo + 1 : 0;
        s.maxCombo = Math.max(s.maxCombo, s.combo);
        s.lastEatAt = now;
        const bonus = Math.min(s.combo, 5) * 2;
        const pts = 10 + bonus;
        s.score += pts;
        s.eaten += 1;
        s.tick = Math.max(TICK_MIN, TICK_START - s.eaten * TICK_DECAY);
        setScore(s.score);
        setLength(s.snake.length);
        synthRef.current?.eat(s.combo);
        addBurst((nx + 0.5) * s.cell, (ny + 0.5) * s.cell, '#f87171', 12);
        addPopup(`+${pts}${s.combo > 0 ? ` x${s.combo + 1}` : ''}`, (nx + 0.5) * s.cell, ny * s.cell, s.combo > 2 ? '#fbbf24' : '#fff', s.combo > 2 ? 19 : 15);
        spawnFood(s);
        maybeSpawnSpecial(s, now);
      } else {
        s.snake.pop();
      }

      // Eat special
      if (s.special && s.special.x === nx && s.special.y === ny) {
        const def = SPECIALS[s.special.kind];
        s.score += def.points;
        s.specialsEaten += 1;
        setScore(s.score);
        synthRef.current?.special();
        addBurst((nx + 0.5) * s.cell, (ny + 0.5) * s.cell, def.color, 16);
        if (s.special.kind === 'golden') {
          addPopup('⭐ +50', (nx + 0.5) * s.cell, ny * s.cell, def.color, 19);
        } else if (s.special.kind === 'ghost') {
          s.ghostUntil = now + def.duration;
          addPopup('🫐 GHOST! +15', (nx + 0.5) * s.cell, ny * s.cell, def.color, 17);
        } else if (s.special.kind === 'slow') {
          s.slowUntil = now + def.duration;
          addPopup('⏰ SLOW-MO! +15', (nx + 0.5) * s.cell, ny * s.cell, def.color, 17);
        } else if (s.special.kind === 'shrink') {
          const cut = Math.min(3, s.snake.length - START_LEN);
          if (cut > 0) s.snake.splice(s.snake.length - cut, cut);
          setLength(s.snake.length);
          addPopup('✂️ SNIP! +15', (nx + 0.5) * s.cell, ny * s.cell, def.color, 17);
        }
        s.special = null;
      }

      // Expire special
      if (s.special && now > s.special.expires) s.special = null;
      // Combo decay popup-free
      if (s.combo > 0 && now - s.lastEatAt > COMBO_WINDOW) s.combo = 0;
    },
    [endGame]
  );

  // ── Main loop ──
  useEffect(() => {
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const s = g.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { W, H, dpr, cell } = s;

      // Ticks
      if (s.running && !s.paused) {
        const tickLen = now < s.slowUntil ? s.tick * 1.6 : s.tick;
        if (!s.lastTick) s.lastTick = now;
        while (now - s.lastTick >= tickLen && s.running) {
          s.lastTick += tickLen;
          doTick(now);
        }
      } else {
        s.lastTick = now;
      }

      // Particles & popups
      const dt = 1 / 60;
      if (s.running && !s.paused) {
        for (const p of s.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life += dt;
        }
        s.particles = s.particles.filter((p) => p.life < p.maxLife);
        for (const p of s.popups) p.t += dt;
        s.popups = s.popups.filter((p) => p.t < 1);
      }

      // ── Render ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (now < s.shakeUntil) {
        const mag = 5 * ((s.shakeUntil - now) / 400);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f172a');
      bg.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bg;
      ctx.fillRect(-8, -8, W + 16, H + 16);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 1; x < COLS; x++) {
        ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, H); ctx.stroke();
      }
      for (let y = 1; y < ROWS; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(W, y * cell); ctx.stroke();
      }

      // Portal mode edge glow
      if (s.mode === 'portal' && s.running) {
        ctx.strokeStyle = 'rgba(129,140,248,0.35)';
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
      }

      const tickLen = now < s.slowUntil ? s.tick * 1.6 : s.tick;
      const t = s.running && !s.paused ? Math.min(1, (now - s.lastTick) / tickLen) : 1;

      // Food
      if (s.food) {
        const fx = (s.food.x + 0.5) * cell;
        const fy = (s.food.y + 0.5) * cell;
        const pulse = 1 + 0.08 * Math.sin(now / 180);
        ctx.font = `${Math.round(cell * 0.78 * pulse)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#f87171';
        ctx.shadowBlur = 12;
        ctx.fillText('🍎', fx, fy + 1);
        ctx.shadowBlur = 0;
      }

      // Special
      if (s.special) {
        const def = SPECIALS[s.special.kind];
        const sx = (s.special.x + 0.5) * cell;
        const sy = (s.special.y + 0.5) * cell;
        const remaining = s.special.expires - now;
        const blink = remaining < 2000 && Math.floor(now / 180) % 2 === 0;
        if (!blink) {
          ctx.font = `${Math.round(cell * 0.78)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = def.color;
          ctx.shadowBlur = 16;
          ctx.fillText(def.emoji, sx, sy + 1);
          ctx.shadowBlur = 0;
        }
      }

      // Snake (interpolated)
      const ghost = now < s.ghostUntil;
      const ghostBlink = ghost && s.ghostUntil - now < 2000 && Math.floor(now / 160) % 2 === 0;
      const n = s.snake.length;
      for (let i = n - 1; i >= 0; i--) {
        const cur = s.snake[i];
        const prev = s.prevSnake[i] || cur;
        // Skip interpolation across portal wraps
        const jump = Math.abs(cur.x - prev.x) > 1 || Math.abs(cur.y - prev.y) > 1;
        const ix = jump ? cur.x : prev.x + (cur.x - prev.x) * t;
        const iy = jump ? cur.y : prev.y + (cur.y - prev.y) * t;
        const px = (ix + 0.5) * cell;
        const py = (iy + 0.5) * cell;
        const isHead = i === 0;
        const hue = (185 + i * 6) % 360;
        const radius = isHead ? cell * 0.46 : Math.max(cell * 0.26, cell * 0.42 - i * 0.3);

        ctx.globalAlpha = ghost ? (ghostBlink ? 0.25 : 0.55) : 1;
        ctx.fillStyle = isHead ? '#22d3ee' : `hsl(${hue}, 85%, ${Math.max(45, 62 - i * 0.8)}%)`;
        ctx.shadowColor = isHead ? '#22d3ee' : `hsla(${hue}, 85%, 60%, 0.8)`;
        ctx.shadowBlur = isHead ? 16 : 8;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Eyes on head
        if (isHead) {
          const d = DIRS[s.dir];
          const ex = px + d.x * cell * 0.18;
          const ey = py + d.y * cell * 0.18;
          const perpX = -d.y * cell * 0.15;
          const perpY = d.x * cell * 0.15;
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(ex + perpX, ey + perpY, cell * 0.075, 0, Math.PI * 2);
          ctx.arc(ex - perpX, ey - perpY, cell * 0.075, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Particles
      for (const p of s.particles) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Popups
      for (const p of s.popups) {
        ctx.globalAlpha = 1 - p.t;
        ctx.font = `900 ${p.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 5;
        ctx.fillText(p.text, p.x, p.y - p.t * 30);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // Effect labels
      if (s.running) {
        const labels = [];
        if (now < s.ghostUntil) labels.push('🫐 GHOST');
        if (now < s.slowUntil) labels.push('⏰ SLOW');
        if (s.combo > 1) labels.push(`🔥 COMBO x${s.combo + 1}`);
        if (labels.length) {
          ctx.font = '700 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillText(labels.join('   '), W / 2, H - 10);
        }
      }

      // Flash
      if (now < s.flashUntil) {
        ctx.fillStyle = 'rgba(248,113,113,0.3)';
        ctx.fillRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [doTick]);

  // ── Start / controls ──
  const startGame = (selectedMode) => {
    const s = g.current;
    resizeCanvas();
    const midY = Math.floor(ROWS / 2);
    s.snake = Array.from({ length: START_LEN }, (_, i) => ({ x: 6 - i, y: midY }));
    s.prevSnake = s.snake.map((seg) => ({ ...seg }));
    s.dir = 'right';
    s.dirQueue = [];
    s.tick = TICK_START;
    s.lastTick = 0;
    s.score = 0;
    s.eaten = 0;
    s.combo = 0;
    s.maxCombo = 0;
    s.specialsEaten = 0;
    s.lastEatAt = 0;
    s.ghostUntil = 0;
    s.slowUntil = 0;
    s.special = null;
    s.particles = [];
    s.popups = [];
    s.mode = selectedMode;
    s.running = true;
    s.paused = false;
    spawnFood(s);
    setMode(selectedMode);
    setScore(0);
    setLength(START_LEN);
    setPaused(false);
    setFinalStats(null);
    setRewardMsg('');
    setScreen('playing');
    synthRef.current?.ensure();
  };

  const togglePause = () => {
    const s = g.current;
    if (!s.running) return;
    s.paused = !s.paused;
    setPaused(s.paused);
  };

  const quitToMenu = () => {
    g.current.running = false;
    g.current.paused = false;
    setPaused(false);
    setScreen('menu');
  };

  // ── UI ──
  const DPad = () => (
    <div className="md:hidden mt-3 flex justify-center select-none">
      <div className="grid grid-cols-3 gap-1.5">
        <div />
        <button onPointerDown={(e) => { e.preventDefault(); queueDir('up'); }} className="w-14 h-14 bg-white/10 border border-white/25 rounded-xl text-2xl text-white active:bg-white/25">▲</button>
        <div />
        <button onPointerDown={(e) => { e.preventDefault(); queueDir('left'); }} className="w-14 h-14 bg-white/10 border border-white/25 rounded-xl text-2xl text-white active:bg-white/25">◀</button>
        <button onPointerDown={(e) => { e.preventDefault(); togglePause(); }} className="w-14 h-14 bg-white/10 border border-white/25 rounded-xl text-xl text-white active:bg-white/25">{paused ? '▶' : '❚❚'}</button>
        <button onPointerDown={(e) => { e.preventDefault(); queueDir('right'); }} className="w-14 h-14 bg-white/10 border border-white/25 rounded-xl text-2xl text-white active:bg-white/25">▶</button>
        <div />
        <button onPointerDown={(e) => { e.preventDefault(); queueDir('down'); }} className="w-14 h-14 bg-white/10 border border-white/25 rounded-xl text-2xl text-white active:bg-white/25">▼</button>
        <div />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-slate-950 to-indigo-950 rounded-2xl shadow-2xl p-3 md:p-4">
        <div ref={wrapRef} className="relative mx-auto" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            className="block mx-auto rounded-xl"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          />

          {/* HUD */}
          {screen === 'playing' && (
            <>
              <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm text-white font-black text-base md:text-lg px-3 py-1.5 rounded-lg">
                  🍎 {score}
                </div>
                <div className="bg-black/50 backdrop-blur-sm text-white/90 font-bold text-xs md:text-sm px-2.5 py-1.5 rounded-lg">
                  🐍 {length}
                </div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button onClick={toggleMute} className="bg-black/50 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg hover:bg-black/70 text-sm">
                  {muted ? '🔇' : '🔊'}
                </button>
                <button onClick={togglePause} className="bg-black/50 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg hover:bg-black/70 text-sm">
                  {paused ? '▶️' : '⏸️'}
                </button>
              </div>

              {paused && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-3 z-10">
                  <h3 className="text-white text-2xl font-black">⏸️ Paused</h3>
                  <div className="flex gap-2">
                    <button onClick={togglePause} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg">▶️ Resume</button>
                    <button onClick={quitToMenu} className="bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/25">🏠 Menu</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* MENU */}
          {screen === 'menu' && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 to-indigo-950/85 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center overflow-y-auto">
              <div className="text-5xl md:text-6xl animate-bounce">🐍</div>
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                Neon <span className="text-cyan-300">Serpent</span>
              </h2>
              <p className="text-white/80 text-xs md:text-sm max-w-sm">
                Eat apples, grow long, and don't bite yourself! Chain quick eats for combos and grab glowing power-ups.
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 text-[11px] md:text-xs text-white/90">
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">⭐ +50</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🫐 Ghost mode</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">⏰ Slow-mo</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">✂️ Shrink</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🔥 Quick eats = combos</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
                <button
                  onClick={() => startGame('classic')}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base px-7 py-3 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  🧱 Classic
                  <div className="text-[10px] font-semibold text-white/80">walls end the run</div>
                </button>
                <button
                  onClick={() => startGame('portal')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-base px-7 py-3 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
                >
                  🌀 Portal
                  <div className="text-[10px] font-semibold text-white/80">wrap through the edges</div>
                </button>
              </div>
              <div className="flex gap-4 text-white/70 text-xs md:text-sm">
                <span>🏆 Classic: <strong className="text-cyan-300">{best.classic}</strong></span>
                <span>🏆 Portal: <strong className="text-cyan-300">{best.portal}</strong></span>
                <button onClick={toggleMute} className="hover:text-white transition-colors">{muted ? '🔇' : '🔊'}</button>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {screen === 'over' && finalStats && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2.5 p-4 text-center overflow-y-auto">
              <div className="text-4xl md:text-5xl">{finalStats.score >= REWARD_SCORE ? '🏆' : '🐍'}</div>
              <h3 className="text-white text-2xl md:text-3xl font-black">Game Over!</h3>
              <div className="text-cyan-300 text-4xl md:text-5xl font-black drop-shadow">{finalStats.score}</div>
              {finalStats.score >= (best[finalStats.mode] || 0) && finalStats.score > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                  🎉 NEW HIGH SCORE!
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-white/90 text-xs md:text-sm">
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">{finalStats.length}</div>
                  <div className="text-white/60 text-[10px]">Length</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">{finalStats.eaten}</div>
                  <div className="text-white/60 text-[10px]">Apples</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">x{finalStats.maxCombo + 1}</div>
                  <div className="text-white/60 text-[10px]">Best combo</div>
                </div>
              </div>
              {rewardMsg && <div className="text-emerald-300 text-xs md:text-sm font-semibold">{rewardMsg}</div>}
              <div className="flex gap-2.5 mt-1">
                <button onClick={() => startGame(finalStats.mode)} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                  🔄 Play Again
                </button>
                <button onClick={quitToMenu} className="bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all">
                  🏠 Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile D-pad */}
        {screen === 'playing' && <DPad />}
      </div>

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">⌨️</span>
          <span className="text-gray-600"><strong className="text-gray-800">Steer</strong> with arrow keys / WASD, swipe, or the on-screen pad.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-gray-600"><strong className="text-gray-800">Combos:</strong> eat the next apple within 5 seconds for bonus points.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🫐</span>
          <span className="text-gray-600"><strong className="text-gray-800">Ghost berry</strong> lets you pass through your own tail — briefly!</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600"><strong className="text-gray-800">Score {REWARD_SCORE}+</strong> to earn {REWARD_COINS} coins once a day!</span>
        </div>
      </div>
    </div>
  );
};

export default NeonSerpentGame;
