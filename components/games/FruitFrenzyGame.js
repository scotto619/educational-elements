// components/games/FruitFrenzyGame.js — Fruit Frenzy 🍉
// A juicy slice-em-up arcade game: swipe to slice fruit, dodge bombs,
// chain combos, and grab power-ups. Classic (3 lives) and Blitz (60s) modes.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning constants ───────────────────────────────────────────────────────────
const CLASSIC_LIVES = 3;
const BLITZ_DURATION = 60; // seconds
const COMBO_WINDOW = 350; // ms between slices to keep a combo alive
const FREEZE_DURATION = 5000; // ms of slow motion
const REWARD_SCORE = 200; // minimum score for the daily coin reward
const REWARD_COINS = 5;

const FRUITS = [
  { emoji: '🍉', points: 10, juice: '#fb7185' },
  { emoji: '🍎', points: 10, juice: '#ef4444' },
  { emoji: '🍊', points: 10, juice: '#fb923c' },
  { emoji: '🍋', points: 10, juice: '#facc15' },
  { emoji: '🍌', points: 10, juice: '#fde047' },
  { emoji: '🍇', points: 10, juice: '#a78bfa' },
  { emoji: '🍓', points: 10, juice: '#f87171' },
  { emoji: '🥝', points: 10, juice: '#84cc16' },
  { emoji: '🍑', points: 10, juice: '#fdba74' },
  { emoji: '🍍', points: 10, juice: '#fbbf24' },
];

const SPECIALS = {
  golden: { emoji: '⭐', juice: '#fbbf24', chance: 0.05 },
  freeze: { emoji: '❄️', juice: '#7dd3fc', chance: 0.04 },
  frenzy: { emoji: '🌈', juice: '#f0abfc', chance: 0.03 },
};
const BOMB_EMOJI = '💣';

// ── Emoji sprite cache ─────────────────────────────────────────────────────────
const spriteCache = new Map();
function getEmojiSprite(emoji, size) {
  const key = `${emoji}@${size}`;
  if (spriteCache.has(key)) return spriteCache.get(key);
  const pad = Math.ceil(size * 0.25);
  const c = document.createElement('canvas');
  c.width = c.height = size + pad * 2;
  const ctx = c.getContext('2d');
  ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, c.width / 2, c.height / 2 + size * 0.04);
  spriteCache.set(key, c);
  return c;
}

// Create the two halves of an emoji split along `angle` (radians).
function makeHalfSprites(emoji, size, angle) {
  const sprite = getEmojiSprite(emoji, size);
  const S = sprite.width;
  const halves = [];
  for (let side = 0; side < 2; side++) {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    ctx.save();
    ctx.translate(S / 2, S / 2);
    ctx.rotate(-angle);
    ctx.beginPath();
    if (side === 0) ctx.rect(-S, -S, S * 2, S); // above the slice line
    else ctx.rect(-S, 0, S * 2, S); // below the slice line
    ctx.clip();
    ctx.rotate(angle);
    ctx.drawImage(sprite, -S / 2, -S / 2);
    ctx.restore();
    halves.push(c);
  }
  return halves;
}

// Distance from point to line segment (for slice detection)
function pointSegDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq ? ((px - ax) * dx + (py - ay) * dy) / lenSq : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// ── Tiny WebAudio synth (no asset files needed) ────────────────────────────────
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
  const tone = (freq, dur, type = 'sine', vol = 0.12, when = 0, slide = 0) => {
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
  const noise = (dur, vol = 0.1, filterFreq = 1800) => {
    if (mutedRef.current) return;
    const ac = ensure();
    if (!ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = ac.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  };
  return {
    ensure,
    slice: () => {
      noise(0.09, 0.14, 2200);
      tone(300 + Math.random() * 250, 0.12, 'triangle', 0.08, 0, 180);
    },
    swoosh: () => noise(0.06, 0.05, 900),
    bomb: () => {
      tone(110, 0.45, 'sawtooth', 0.2, 0, -70);
      noise(0.35, 0.22, 500);
    },
    combo: (n) => {
      const base = 420;
      for (let i = 0; i < Math.min(n, 5); i++) tone(base * Math.pow(1.2, i), 0.12, 'square', 0.07, i * 0.06);
    },
    golden: () => {
      [880, 1175, 1568].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, i * 0.07));
    },
    freeze: () => tone(900, 0.5, 'sine', 0.1, 0, -550),
    frenzy: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'triangle', 0.09, i * 0.05));
    },
    lifeLost: () => tone(220, 0.4, 'sawtooth', 0.12, 0, -100),
    gameOver: () => {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.1, i * 0.18));
    },
  };
}

// ── Component ──────────────────────────────────────────────────────────────────
const FruitFrenzyGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const synthRef = useRef(null);
  const mutedRef = useRef(false);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [mode, setMode] = useState('classic'); // classic | blitz
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(CLASSIC_LIVES);
  const [timeLeft, setTimeLeft] = useState(BLITZ_DURATION);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [best, setBest] = useState({ classic: 0, blitz: 0 });

  // The whole simulation lives in a mutable ref so the RAF loop never re-renders React.
  const g = useRef({
    running: false,
    paused: false,
    mode: 'classic',
    W: 800,
    H: 520,
    dpr: 1,
    fruits: [],
    halves: [],
    particles: [],
    popups: [],
    trail: [],
    pointerDown: false,
    lastPointer: null,
    score: 0,
    lives: CLASSIC_LIVES,
    startTime: 0,
    elapsed: 0,
    lastFrame: 0,
    nextSpawn: 0,
    slowUntil: 0,
    flashUntil: 0,
    flashColor: 'rgba(248,113,113,0.35)',
    shakeUntil: 0,
    stroke: { count: 0, lastSliceT: 0, points: 0 },
    stats: { sliced: 0, bestCombo: 0, bombsHit: 0, golden: 0 },
    frenzyQueue: 0,
    nextFrenzySpawn: 0,
    idSeq: 1,
  });

  // ── Persistence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      setBest({
        classic: parseInt(localStorage.getItem('fruitfrenzy_best_classic') || '0', 10),
        blitz: parseInt(localStorage.getItem('fruitfrenzy_best_blitz') || '0', 10),
      });
      const m = localStorage.getItem('fruitfrenzy_muted') === '1';
      setMuted(m);
      mutedRef.current = m;
    } catch {}
    synthRef.current = createSynth(mutedRef);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try {
        localStorage.setItem('fruitfrenzy_muted', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  // ── Canvas sizing ────────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const width = wrap.clientWidth;
    const height = Math.max(380, Math.min(620, Math.round(width * 0.62)));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const s = g.current;
    s.W = width;
    s.H = height;
    s.dpr = dpr;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Auto-pause when the tab is hidden
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

  // ── Spawning ─────────────────────────────────────────────────────────────────
  const spawnFruit = useCallback((opts = {}) => {
    const s = g.current;
    const { W, H } = s;
    const minutes = s.elapsed / 60000;
    let type = 'fruit';
    if (!opts.noBomb) {
      const bombChance = Math.min(0.16, 0.05 + minutes * 0.05);
      const roll = Math.random();
      if (roll < bombChance) type = 'bomb';
      else if (roll < bombChance + SPECIALS.golden.chance) type = 'golden';
      else if (roll < bombChance + SPECIALS.golden.chance + SPECIALS.freeze.chance) type = 'freeze';
      else if (roll < bombChance + SPECIALS.golden.chance + SPECIALS.freeze.chance + SPECIALS.frenzy.chance) type = 'frenzy';
    }
    const fruitDef = FRUITS[Math.floor(Math.random() * FRUITS.length)];
    const emoji =
      type === 'bomb' ? BOMB_EMOJI : type === 'fruit' ? fruitDef.emoji : SPECIALS[type].emoji;
    const juice = type === 'fruit' ? fruitDef.juice : type === 'bomb' ? '#94a3b8' : SPECIALS[type].juice;

    const size = Math.max(46, Math.min(72, W * 0.075)) * (type === 'golden' ? 0.9 : 1);
    const x = W * (0.12 + Math.random() * 0.76);
    const peak = H * (0.55 + Math.random() * 0.38); // how high it flies
    const gravity = H * 1.9;
    const vy = -Math.sqrt(2 * gravity * peak);
    const vx = (W / 2 - x) * (0.25 + Math.random() * 0.55) * (1 / 1.2) * 0.0016 * H + (Math.random() - 0.5) * W * 0.08;

    s.fruits.push({
      id: s.idSeq++,
      type,
      emoji,
      juice,
      points: type === 'golden' ? 50 : fruitDef.points,
      x,
      y: H + size,
      vx,
      vy,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 5,
      radius: size * 0.55,
      size,
      sliced: false,
    });
  }, []);

  const spawnWave = useCallback(() => {
    const s = g.current;
    const minutes = s.elapsed / 60000;
    const count = 1 + Math.floor(Math.random() * Math.min(4, 1.6 + minutes * 1.4));
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        if (g.current.running && !g.current.paused) spawnFruit();
      }, i * 130);
    }
  }, [spawnFruit]);

  // ── Effects helpers ──────────────────────────────────────────────────────────
  const addPopup = (text, x, y, color = '#fff', sizePx = 22) => {
    g.current.popups.push({ text, x, y, t: 0, color, size: sizePx });
  };

  const addJuice = (x, y, color, big = false) => {
    const s = g.current;
    const n = big ? 22 : 12;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (big ? 1.5 : 1) * (60 + Math.random() * 240);
      s.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        r: 2 + Math.random() * (big ? 7 : 5),
        color,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.4,
      });
    }
  };

  // ── Combo handling ───────────────────────────────────────────────────────────
  const finalizeStroke = useCallback(() => {
    const s = g.current;
    const { count } = s.stroke;
    if (count >= 3) {
      const bonus = count * 10;
      s.score += bonus;
      setScore(s.score);
      s.stats.bestCombo = Math.max(s.stats.bestCombo, count);
      addPopup(`COMBO x${count}  +${bonus}`, s.W / 2, s.H * 0.3, '#fbbf24', 34);
      synthRef.current?.combo(count);
    } else if (count >= 2) {
      s.stats.bestCombo = Math.max(s.stats.bestCombo, count);
    }
    s.stroke = { count: 0, lastSliceT: 0, points: 0 };
  }, []);

  // ── Game over ────────────────────────────────────────────────────────────────
  const endGame = useCallback(() => {
    const s = g.current;
    if (!s.running) return;
    s.running = false;
    synthRef.current?.gameOver();
    const finalScore = s.score;
    const m = s.mode;

    // High score
    setBest((prev) => {
      const next = { ...prev };
      if (finalScore > (prev[m] || 0)) {
        next[m] = finalScore;
        try {
          localStorage.setItem(`fruitfrenzy_best_${m}`, String(finalScore));
        } catch {}
      }
      return next;
    });

    setFinalStats({
      score: finalScore,
      sliced: s.stats.sliced,
      bestCombo: s.stats.bestCombo,
      golden: s.stats.golden,
      mode: m,
    });

    // Daily coin reward
    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const lastRewardDate = studentData?.gameProgress?.fruitFrenzy?.lastRewardDate;
      if (lastRewardDate !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            fruitFrenzy: {
              ...studentData.gameProgress?.fruitFrenzy,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.fruitFrenzy?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🍉 Fruit Frenzy reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
    }

    setScreen('over');
  }, [studentData, updateStudentData, showToast]);

  // ── Slicing ──────────────────────────────────────────────────────────────────
  const sliceFruit = useCallback(
    (fruit, angle) => {
      const s = g.current;
      if (fruit.sliced) return;
      fruit.sliced = true;
      const now = performance.now();

      if (fruit.type === 'bomb') {
        s.stats.bombsHit++;
        synthRef.current?.bomb();
        s.flashUntil = now + 280;
        s.flashColor = 'rgba(248,113,113,0.4)';
        s.shakeUntil = now + 350;
        addJuice(fruit.x, fruit.y, '#f97316', true);
        addJuice(fruit.x, fruit.y, '#64748b', true);
        s.stroke = { count: 0, lastSliceT: 0, points: 0 };
        if (s.mode === 'classic') {
          s.lives -= 1;
          setLives(s.lives);
          addPopup('💥 -1 LIFE', fruit.x, fruit.y, '#f87171', 30);
          synthRef.current?.lifeLost();
          if (s.lives <= 0) {
            endGame();
            return;
          }
        } else {
          s.score = Math.max(0, s.score - 20);
          setScore(s.score);
          addPopup('💥 -20', fruit.x, fruit.y, '#f87171', 30);
        }
        return;
      }

      // Juicy fruit / special
      s.stats.sliced++;
      const halves = makeHalfSprites(fruit.emoji, fruit.size, angle);
      const nX = -Math.sin(angle);
      const nY = Math.cos(angle);
      const sep = 140;
      for (let i = 0; i < 2; i++) {
        const dir = i === 0 ? -1 : 1;
        s.halves.push({
          sprite: halves[i],
          x: fruit.x,
          y: fruit.y,
          vx: fruit.vx + nX * sep * dir,
          vy: fruit.vy * 0.4 + nY * sep * dir - 40,
          rot: fruit.rot,
          vrot: fruit.vrot + dir * 3,
          size: fruit.size,
          life: 0,
        });
      }
      addJuice(fruit.x, fruit.y, fruit.juice, fruit.type !== 'fruit');

      if (fruit.type === 'golden') {
        s.stats.golden++;
        s.score += 50;
        addPopup('⭐ +50', fruit.x, fruit.y, '#fbbf24', 28);
        synthRef.current?.golden();
      } else if (fruit.type === 'freeze') {
        s.slowUntil = now + FREEZE_DURATION;
        s.score += 15;
        addPopup('❄️ SLOW-MO! +15', fruit.x, fruit.y, '#7dd3fc', 28);
        s.flashUntil = now + 220;
        s.flashColor = 'rgba(125,211,252,0.25)';
        synthRef.current?.freeze();
      } else if (fruit.type === 'frenzy') {
        s.frenzyQueue += 9;
        s.score += 15;
        addPopup('🌈 FRENZY!! +15', fruit.x, fruit.y, '#f0abfc', 30);
        s.flashUntil = now + 220;
        s.flashColor = 'rgba(240,171,252,0.25)';
        synthRef.current?.frenzy();
      } else {
        s.score += fruit.points;
        addPopup(`+${fruit.points}`, fruit.x, fruit.y, '#fff', 22);
        synthRef.current?.slice();
      }
      setScore(s.score);

      // Combo tracking
      if (now - s.stroke.lastSliceT > COMBO_WINDOW) {
        finalizeStroke();
      }
      s.stroke.count += 1;
      s.stroke.lastSliceT = now;
    },
    [endGame, finalizeStroke]
  );

  // ── Pointer events ───────────────────────────────────────────────────────────
  const getPointerPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e) => {
    const s = g.current;
    synthRef.current?.ensure();
    if (!s.running || s.paused) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    s.pointerDown = true;
    const p = getPointerPos(e);
    s.lastPointer = p;
    s.trail.push({ ...p, t: performance.now() });
  };

  const onPointerMove = (e) => {
    const s = g.current;
    if (!s.running || s.paused || !s.pointerDown) return;
    e.preventDefault();
    const p = getPointerPos(e);
    const prev = s.lastPointer || p;
    const now = performance.now();
    s.trail.push({ ...p, t: now });
    if (s.trail.length > 40) s.trail.shift();

    const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
    if (dist > 4) {
      if (dist > 30) synthRef.current?.swoosh();
      const angle = Math.atan2(p.y - prev.y, p.x - prev.x);
      for (const fruit of s.fruits) {
        if (!fruit.sliced && pointSegDist(fruit.x, fruit.y, prev.x, prev.y, p.x, p.y) < fruit.radius + 6) {
          sliceFruit(fruit, angle);
        }
      }
      s.fruits = s.fruits.filter((f) => !f.sliced);
    }
    s.lastPointer = p;
  };

  const onPointerUp = () => {
    const s = g.current;
    s.pointerDown = false;
    s.lastPointer = null;
    finalizeStroke();
  };

  // ── Main loop ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const s = g.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { W, H, dpr } = s;

      const rawDt = s.lastFrame ? Math.min(0.05, (now - s.lastFrame) / 1000) : 0.016;
      s.lastFrame = now;
      const slow = s.running && now < s.slowUntil;
      const dt = s.paused || !s.running ? 0 : rawDt * (slow ? 0.42 : 1);
      if (s.running && !s.paused) s.elapsed += rawDt * 1000;

      // ── Update ──
      if (s.running && !s.paused) {
        // Blitz timer
        if (s.mode === 'blitz') {
          const remaining = Math.max(0, BLITZ_DURATION - s.elapsed / 1000);
          const shown = Math.ceil(remaining);
          setTimeLeft((prev) => (prev !== shown ? shown : prev));
          if (remaining <= 0) {
            endGame();
          }
        }

        // Stroke timeout → finalize combos
        if (s.stroke.count > 0 && now - s.stroke.lastSliceT > COMBO_WINDOW) {
          finalizeStroke();
        }

        // Wave spawner
        const minutes = s.elapsed / 60000;
        if (now >= s.nextSpawn) {
          spawnWave();
          const interval = Math.max(650, 1350 - minutes * 420);
          s.nextSpawn = now + interval * (slow ? 1.6 : 1);
        }

        // Frenzy burst spawner
        if (s.frenzyQueue > 0 && now >= s.nextFrenzySpawn) {
          spawnFruit({ noBomb: true });
          s.frenzyQueue--;
          s.nextFrenzySpawn = now + 90;
        }

        const gravity = H * 1.9;

        // Fruits
        for (const f of s.fruits) {
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.vy += gravity * dt;
          f.rot += f.vrot * dt;
        }
        // Missed fruit → lose life in classic
        const fellOff = s.fruits.filter((f) => f.y > H + f.size * 1.5 && f.vy > 0);
        if (fellOff.length) {
          s.fruits = s.fruits.filter((f) => !(f.y > H + f.size * 1.5 && f.vy > 0));
          if (s.mode === 'classic') {
            const missedFruit = fellOff.filter((f) => f.type === 'fruit' || f.type === 'golden');
            for (const f of missedFruit) {
              s.lives -= 1;
              setLives(Math.max(0, s.lives));
              addPopup('MISS ✖', Math.max(40, Math.min(W - 40, f.x)), H - 40, '#f87171', 24);
              synthRef.current?.lifeLost();
              if (s.lives <= 0) {
                endGame();
                break;
              }
            }
          }
        }

        // Halves
        for (const h of s.halves) {
          h.x += h.vx * dt;
          h.y += h.vy * dt;
          h.vy += gravity * dt;
          h.rot += h.vrot * dt;
          h.life += dt;
        }
        s.halves = s.halves.filter((h) => h.y < H + 120 && h.life < 3);

        // Particles
        for (const p of s.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += gravity * 0.6 * dt;
          p.life += dt;
        }
        s.particles = s.particles.filter((p) => p.life < p.maxLife);

        // Popups
        for (const p of s.popups) p.t += rawDt;
        s.popups = s.popups.filter((p) => p.t < 1);
      }

      // Trail decay (always, so it fades after release)
      s.trail = s.trail.filter((pt) => now - pt.t < 160);

      // ── Render ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Screen shake
      if (now < s.shakeUntil) {
        const mag = 6 * ((s.shakeUntil - now) / 350);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#1e1b4b');
      bg.addColorStop(0.55, '#312e81');
      bg.addColorStop(1, '#4c1d95');
      ctx.fillStyle = bg;
      ctx.fillRect(-10, -10, W + 20, H + 20);

      // Subtle vignette stars
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i < 24; i++) {
        const sx = ((i * 211.7) % W);
        const sy = ((i * 137.3) % (H * 0.7));
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Slow-mo tint
      if (slow) {
        ctx.fillStyle = 'rgba(125,211,252,0.08)';
        ctx.fillRect(0, 0, W, H);
      }

      // Particles (juice)
      for (const p of s.particles) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a + 1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Halves
      for (const h of s.halves) {
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.globalAlpha = Math.max(0, 1 - h.life / 3);
        ctx.drawImage(h.sprite, -h.sprite.width / 2, -h.sprite.height / 2);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Fruits
      for (const f of s.fruits) {
        const sprite = getEmojiSprite(f.emoji, f.size);
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        if (f.type === 'golden') {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 24;
        } else if (f.type === 'bomb') {
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 12 + 8 * Math.sin(now / 90);
        } else if (f.type === 'freeze' || f.type === 'frenzy') {
          ctx.shadowColor = f.juice;
          ctx.shadowBlur = 18;
        }
        ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
        ctx.restore();
      }

      // Blade trail
      if (s.trail.length > 1) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          ctx.moveTo(s.trail[0].x, s.trail[0].y);
          for (let i = 1; i < s.trail.length; i++) ctx.lineTo(s.trail[i].x, s.trail[i].y);
          if (pass === 0) {
            ctx.strokeStyle = 'rgba(103,232,249,0.45)';
            ctx.lineWidth = 12;
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 16;
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.95)';
            ctx.lineWidth = 4;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // Popups
      for (const p of s.popups) {
        const a = 1 - p.t;
        ctx.globalAlpha = a;
        ctx.font = `900 ${p.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.fillText(p.text, p.x, p.y - p.t * 50);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // Flash overlay
      if (now < s.flashUntil) {
        ctx.fillStyle = s.flashColor;
        ctx.fillRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [endGame, finalizeStroke, spawnFruit, spawnWave]);

  // ── Start / restart ──────────────────────────────────────────────────────────
  const startGame = (selectedMode) => {
    const s = g.current;
    resizeCanvas();
    s.running = true;
    s.paused = false;
    s.mode = selectedMode;
    s.fruits = [];
    s.halves = [];
    s.particles = [];
    s.popups = [];
    s.trail = [];
    s.score = 0;
    s.lives = CLASSIC_LIVES;
    s.elapsed = 0;
    s.lastFrame = 0;
    s.nextSpawn = performance.now() + 500;
    s.slowUntil = 0;
    s.flashUntil = 0;
    s.shakeUntil = 0;
    s.stroke = { count: 0, lastSliceT: 0, points: 0 };
    s.stats = { sliced: 0, bestCombo: 0, bombsHit: 0, golden: 0 };
    s.frenzyQueue = 0;
    setMode(selectedMode);
    setScore(0);
    setLives(CLASSIC_LIVES);
    setTimeLeft(BLITZ_DURATION);
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

  // ── UI ───────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto">
      <div
        ref={wrapRef}
        className="relative rounded-2xl overflow-hidden shadow-2xl select-none"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full cursor-crosshair"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        />

        {/* HUD */}
        {screen === 'playing' && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-3 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm text-white font-black text-xl md:text-2xl px-4 py-2 rounded-xl">
                🍉 {score}
              </div>
              {mode === 'classic' ? (
                <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl text-lg tracking-wider">
                  {Array.from({ length: CLASSIC_LIVES }).map((_, i) => (
                    <span key={i} className={i < lives ? '' : 'opacity-25 grayscale'}>
                      ❤️
                    </span>
                  ))}
                </div>
              ) : (
                <div
                  className={`bg-black/40 backdrop-blur-sm font-black text-xl px-4 py-2 rounded-xl ${
                    timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}
                >
                  ⏱️ {timeLeft}s
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-xl hover:bg-black/60 transition-all text-lg"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={togglePause}
                className="bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-xl hover:bg-black/60 transition-all text-lg"
                title="Pause"
              >
                {paused ? '▶️' : '⏸️'}
              </button>
            </div>

            {paused && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
                <div className="text-5xl">⏸️</div>
                <h3 className="text-white text-3xl font-black">Paused</h3>
                <div className="flex gap-3">
                  <button
                    onClick={togglePause}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                  >
                    ▶️ Resume
                  </button>
                  <button
                    onClick={quitToMenu}
                    className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all"
                  >
                    🏠 Menu
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Menu */}
        {screen === 'menu' && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-purple-950/70 to-fuchsia-950/80 flex flex-col items-center justify-center gap-4 p-4 text-center overflow-y-auto">
            <div className="text-6xl md:text-7xl animate-bounce">🍉</div>
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
              Fruit <span className="text-yellow-300">Frenzy</span>
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Swipe to slice flying fruit! Chain combos, grab power-ups, and{' '}
              <span className="text-red-300 font-bold">never slice the bombs 💣</span>
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">⭐ Golden = +50</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">❄️ Slow-mo</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🌈 Fruit storm</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">3+ in one swipe = COMBO</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => startGame('classic')}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                ❤️ Classic
                <div className="text-xs font-semibold text-white/80 mt-1">3 lives · don't drop fruit!</div>
              </button>
              <button
                onClick={() => startGame('blitz')}
                className="bg-gradient-to-r from-orange-500 to-pink-600 text-white font-black text-lg px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                ⚡ Blitz
                <div className="text-xs font-semibold text-white/80 mt-1">60 seconds · go wild!</div>
              </button>
            </div>
            <div className="flex gap-4 text-white/70 text-sm mt-1">
              <span>🏆 Classic best: <strong className="text-yellow-300">{best.classic}</strong></span>
              <span>🏆 Blitz best: <strong className="text-yellow-300">{best.blitz}</strong></span>
            </div>
            <button onClick={toggleMute} className="text-white/60 text-sm hover:text-white transition-colors">
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
          </div>
        )}

        {/* Game over */}
        {screen === 'over' && finalStats && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center overflow-y-auto">
            <div className="text-5xl">{finalStats.score >= REWARD_SCORE ? '🏆' : '🍉'}</div>
            <h3 className="text-white text-3xl md:text-4xl font-black">
              {finalStats.mode === 'blitz' ? "Time's Up!" : 'Game Over!'}
            </h3>
            <div className="text-yellow-300 text-5xl font-black drop-shadow">{finalStats.score}</div>
            {finalStats.score >= (best[finalStats.mode] || 0) && finalStats.score > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse">
                🎉 NEW HIGH SCORE!
              </div>
            )}
            <div className="grid grid-cols-3 gap-3 text-white/90 text-sm">
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <div className="text-xl font-black">{finalStats.sliced}</div>
                <div className="text-white/60 text-xs">Fruit sliced</div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <div className="text-xl font-black">x{finalStats.bestCombo}</div>
                <div className="text-white/60 text-xs">Best combo</div>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2">
                <div className="text-xl font-black">{finalStats.golden}</div>
                <div className="text-white/60 text-xs">⭐ Golden</div>
              </div>
            </div>
            {rewardMsg && <div className="text-emerald-300 text-sm font-semibold">{rewardMsg}</div>}
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => startGame(finalStats.mode)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                🔄 Play Again
              </button>
              <button
                onClick={quitToMenu}
                className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all"
              >
                🏠 Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">👆</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Swipe</strong> across fruit to slice it — works with mouse or touch.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">💣</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Avoid bombs!</strong> They cost a life (Classic) or points (Blitz).
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Combos:</strong> slice 3+ fruit in one swipe for bonus points.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Score {REWARD_SCORE}+</strong> to earn {REWARD_COINS} coins once per day!
          </span>
        </div>
      </div>
    </div>
  );
};

export default FruitFrenzyGame;
