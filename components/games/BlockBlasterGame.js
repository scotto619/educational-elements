// components/games/BlockBlasterGame.js — Block Blaster 🧱💥
// A neon breakout arcade: bounce the ball, smash brick patterns, and catch
// falling power-ups (multiball, wide paddle, lasers, slow-mo, extra life).
// Endless levels with new patterns, 3 lives, high score, daily coin reward.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const LIVES_START = 3;
const REWARD_SCORE = 800;
const REWARD_COINS = 5;
const POWERUP_CHANCE = 0.16;
const LEVEL_BONUS = 200;

const BRICK_COLORS = {
  1: { fill: '#22d3ee', glow: 'rgba(34,211,238,0.6)' }, // cyan
  2: { fill: '#a78bfa', glow: 'rgba(167,139,250,0.6)' }, // violet
  3: { fill: '#fb7185', glow: 'rgba(251,113,133,0.6)' }, // rose
  4: { fill: '#fbbf24', glow: 'rgba(251,191,36,0.7)' }, // amber (toughest)
};

const POWERUPS = {
  expand: { emoji: '🟢', label: 'WIDE', color: '#34d399', duration: 10000 },
  multi: { emoji: '🔵', label: 'MULTI', color: '#60a5fa', duration: 0 },
  laser: { emoji: '🟣', label: 'LASER', color: '#c084fc', duration: 8000 },
  slow: { emoji: '🟡', label: 'SLOW', color: '#fde047', duration: 8000 },
  life: { emoji: '❤️', label: '+LIFE', color: '#fb7185', duration: 0 },
};
const POWERUP_KEYS = ['expand', 'multi', 'laser', 'slow', 'life'];
const POWERUP_WEIGHTS = [0.28, 0.27, 0.2, 0.17, 0.08];

function pickPowerup() {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < POWERUP_KEYS.length; i++) {
    acc += POWERUP_WEIGHTS[i];
    if (r < acc) return POWERUP_KEYS[i];
  }
  return 'expand';
}

// ── Level patterns ───────────────────────────────────────────────────────────
// Each returns a rows×cols matrix of brick HP (0 = empty). HP scales with level.
const PATTERNS = [
  // Solid block
  (rows, cols, lvl) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, () => Math.min(4, 1 + Math.floor(r / 2) + Math.floor(lvl / 4)))
    ),
  // Checkerboard
  (rows, cols, lvl) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ((r + c) % 2 === 0 ? Math.min(4, 1 + (r % 3) + Math.floor(lvl / 5)) : 0))
    ),
  // Pyramid
  (rows, cols, lvl) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const mid = (cols - 1) / 2;
        return Math.abs(c - mid) <= r ? Math.min(4, 1 + Math.floor((rows - r) / 2) + Math.floor(lvl / 5)) : 0;
      })
    ),
  // Side towers
  (rows, cols, lvl) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) =>
        c < 2 || c >= cols - 2 || r < 2 ? Math.min(4, 2 + Math.floor(lvl / 5)) : (r + c) % 3 === 0 ? 1 : 0
      )
    ),
  // Zigzag stripes
  (rows, cols, lvl) =>
    Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ((c + r * 2) % 4 < 2 ? Math.min(4, 1 + (r % 2) + Math.floor(lvl / 4)) : 0))
    ),
];

// roundRect polyfill for older browsers (pre-2023)
function ensureRoundRect() {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rad = Math.min(typeof r === 'number' ? r : 4, w / 2, h / 2);
      this.moveTo(x + rad, y);
      this.arcTo(x + w, y, x + w, y + h, rad);
      this.arcTo(x + w, y + h, x, y + h, rad);
      this.arcTo(x, y + h, x, y, rad);
      this.arcTo(x, y, x + w, y, rad);
      this.closePath();
      return this;
    };
  }
}

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
    paddle: () => tone(220, 0.06, 'square', 0.07),
    wall: () => tone(330, 0.05, 'square', 0.05),
    brick: (hp) => tone(440 + hp * 110, 0.08, 'triangle', 0.09),
    breakBrick: () => {
      tone(587, 0.1, 'triangle', 0.1);
      tone(880, 0.12, 'triangle', 0.08, 0.04);
    },
    powerup: () => {
      [659, 880, 1175].forEach((f, i) => tone(f, 0.12, 'sine', 0.09, i * 0.05));
    },
    laser: () => tone(1200, 0.08, 'sawtooth', 0.06, 0, -700),
    lifeLost: () => {
      tone(220, 0.35, 'sawtooth', 0.12, 0, -120);
    },
    levelUp: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'triangle', 0.1, i * 0.08));
    },
    gameOver: () => {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, 'triangle', 0.1, i * 0.16));
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const BlockBlasterGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const synthRef = useRef(null);
  const mutedRef = useRef(false);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [levelBanner, setLevelBanner] = useState(null);

  const g = useRef({
    running: false,
    paused: false,
    W: 800,
    H: 520,
    dpr: 1,
    paddle: { x: 400, w: 110, h: 14, baseW: 110 },
    balls: [], // {x,y,vx,vy,r,stuck}
    bricks: [], // {x,y,w,h,hp,maxHp}
    drops: [], // {x,y,vy,kind}
    bolts: [], // {x,y}
    particles: [],
    popups: [],
    effects: { expandUntil: 0, laserUntil: 0, slowUntil: 0 },
    nextLaserShot: 0,
    score: 0,
    lives: LIVES_START,
    level: 1,
    ballSpeed: 380,
    lastFrame: 0,
    shakeUntil: 0,
    flashUntil: 0,
    keys: { left: false, right: false },
    pointerX: null,
    levelClearing: false,
  });

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('blockblaster_highscore') || '0', 10));
      const m = localStorage.getItem('blockblaster_muted') === '1';
      setMuted(m);
      mutedRef.current = m;
    } catch {}
    ensureRoundRect();
    synthRef.current = createSynth(mutedRef);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try {
        localStorage.setItem('blockblaster_muted', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  // ── Canvas sizing ──
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const width = wrap.clientWidth;
    const height = Math.max(420, Math.min(640, Math.round(width * 0.68)));
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

  // Keyboard
  useEffect(() => {
    const down = (e) => {
      const s = g.current;
      if (e.key === 'ArrowLeft') s.keys.left = true;
      if (e.key === 'ArrowRight') s.keys.right = true;
      if ((e.key === ' ' || e.key === 'ArrowUp') && s.running) {
        e.preventDefault();
        launchBalls();
      }
      if (e.key === 'p' || e.key === 'P') togglePause();
    };
    const up = (e) => {
      const s = g.current;
      if (e.key === 'ArrowLeft') s.keys.left = false;
      if (e.key === 'ArrowRight') s.keys.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──
  const addPopup = (text, x, y, color = '#fff', size = 20) => {
    g.current.popups.push({ text, x, y, t: 0, color, size });
  };

  const addBurst = (x, y, color, n = 10) => {
    const s = g.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 200;
      s.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: 1.5 + Math.random() * 3.5,
        color,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.35,
      });
    }
  };

  // ── Level construction ──
  const buildLevel = useCallback((lvl) => {
    const s = g.current;
    const { W } = s;
    const cols = 10;
    const rows = 6;
    const margin = W * 0.04;
    const gap = 4;
    const bw = (W - margin * 2 - gap * (cols - 1)) / cols;
    const bh = Math.max(16, s.H * 0.035);
    const topOffset = s.H * 0.09;
    const pattern = PATTERNS[(lvl - 1) % PATTERNS.length](rows, cols, lvl);
    s.bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hp = pattern[r][c];
        if (hp > 0) {
          s.bricks.push({
            x: margin + c * (bw + gap),
            y: topOffset + r * (bh + gap),
            w: bw,
            h: bh,
            hp,
            maxHp: hp,
          });
        }
      }
    }
    s.ballSpeed = Math.min(560, 360 + (lvl - 1) * 22);
    s.levelClearing = false;
  }, []);

  const resetBallOnPaddle = useCallback(() => {
    const s = g.current;
    s.balls = [
      {
        x: s.paddle.x,
        y: s.H - 46 - 10,
        vx: 0,
        vy: 0,
        r: Math.max(7, s.W * 0.011),
        stuck: true,
      },
    ];
    s.effects = { expandUntil: 0, laserUntil: 0, slowUntil: 0 };
    s.paddle.w = s.paddle.baseW;
    s.drops = [];
    s.bolts = [];
  }, []);

  const launchBalls = () => {
    const s = g.current;
    if (s.paused) return;
    for (const b of s.balls) {
      if (b.stuck) {
        b.stuck = false;
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
        b.vx = Math.cos(angle) * s.ballSpeed;
        b.vy = Math.sin(angle) * s.ballSpeed;
      }
    }
  };

  // ── Game over ──
  const endGame = useCallback(() => {
    const s = g.current;
    if (!s.running) return;
    s.running = false;
    synthRef.current?.gameOver();
    const finalScore = s.score;

    setHighScore((prev) => {
      if (finalScore > prev) {
        try {
          localStorage.setItem('blockblaster_highscore', String(finalScore));
        } catch {}
        return finalScore;
      }
      return prev;
    });

    setFinalStats({ score: finalScore, level: s.level });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.blockBlaster?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            blockBlaster: {
              ...studentData.gameProgress?.blockBlaster,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.blockBlaster?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🧱 Block Blaster reward: +${REWARD_COINS} coins!`, 'success');
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

  // ── Start game ──
  const startGame = () => {
    const s = g.current;
    resizeCanvas();
    s.running = true;
    s.paused = false;
    s.score = 0;
    s.lives = LIVES_START;
    s.level = 1;
    s.particles = [];
    s.popups = [];
    s.paddle.baseW = Math.max(90, s.W * 0.14);
    s.paddle.w = s.paddle.baseW;
    s.paddle.x = s.W / 2;
    s.lastFrame = 0;
    buildLevel(1);
    resetBallOnPaddle();
    setScore(0);
    setLives(LIVES_START);
    setLevel(1);
    setPaused(false);
    setFinalStats(null);
    setRewardMsg('');
    setLevelBanner(null);
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

  // ── Pointer control ──
  const onPointerMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    g.current.pointerX = e.clientX - rect.left;
  };
  const onPointerDown = (e) => {
    synthRef.current?.ensure();
    onPointerMove(e);
    launchBalls();
  };

  // ── Main loop ──
  useEffect(() => {
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const s = g.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { W, H, dpr } = s;

      const rawDt = s.lastFrame ? Math.min(0.04, (now - s.lastFrame) / 1000) : 0.016;
      s.lastFrame = now;
      const slow = now < s.effects.slowUntil;
      const dt = s.paused || !s.running ? 0 : rawDt * (slow ? 0.55 : 1);

      // ── Update ──
      if (s.running && !s.paused) {
        // Paddle: pointer takes priority, else keyboard
        const expand = now < s.effects.expandUntil;
        const targetW = expand ? s.paddle.baseW * 1.55 : s.paddle.baseW;
        s.paddle.w += (targetW - s.paddle.w) * Math.min(1, dt * 10);
        if (s.pointerX !== null) {
          s.paddle.x += (s.pointerX - s.paddle.x) * Math.min(1, dt * 18);
        }
        if (s.keys.left) s.paddle.x -= 520 * dt;
        if (s.keys.right) s.paddle.x += 520 * dt;
        s.paddle.x = Math.max(s.paddle.w / 2, Math.min(W - s.paddle.w / 2, s.paddle.x));
        const padY = H - 46;

        // Laser auto-fire
        if (now < s.effects.laserUntil && now >= s.nextLaserShot) {
          s.bolts.push({ x: s.paddle.x - s.paddle.w * 0.4, y: padY - 10 });
          s.bolts.push({ x: s.paddle.x + s.paddle.w * 0.4, y: padY - 10 });
          synthRef.current?.laser();
          s.nextLaserShot = now + 320;
        }

        // Bolts
        for (const bolt of s.bolts) bolt.y -= 720 * dt;
        for (const bolt of s.bolts) {
          for (const brick of s.bricks) {
            if (
              brick.hp > 0 &&
              bolt.x > brick.x &&
              bolt.x < brick.x + brick.w &&
              bolt.y < brick.y + brick.h &&
              bolt.y > brick.y - 6
            ) {
              bolt.dead = true;
              hitBrick(brick, bolt.x, bolt.y, now);
              break;
            }
          }
        }
        s.bolts = s.bolts.filter((b) => !b.dead && b.y > -20);

        // Balls
        for (const b of s.balls) {
          if (b.stuck) {
            b.x = s.paddle.x;
            b.y = padY - b.r - s.paddle.h / 2 - 1;
            continue;
          }
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Walls
          if (b.x - b.r < 0) {
            b.x = b.r;
            b.vx = Math.abs(b.vx);
            synthRef.current?.wall();
          } else if (b.x + b.r > W) {
            b.x = W - b.r;
            b.vx = -Math.abs(b.vx);
            synthRef.current?.wall();
          }
          if (b.y - b.r < 0) {
            b.y = b.r;
            b.vy = Math.abs(b.vy);
            synthRef.current?.wall();
          }

          // Paddle
          if (
            b.vy > 0 &&
            b.y + b.r >= padY - s.paddle.h / 2 &&
            b.y + b.r <= padY + s.paddle.h &&
            b.x >= s.paddle.x - s.paddle.w / 2 - b.r &&
            b.x <= s.paddle.x + s.paddle.w / 2 + b.r
          ) {
            const rel = (b.x - s.paddle.x) / (s.paddle.w / 2); // -1..1
            const angle = -Math.PI / 2 + rel * 1.05;
            const speed = Math.hypot(b.vx, b.vy);
            b.vx = Math.cos(angle) * speed;
            b.vy = Math.sin(angle) * speed;
            b.y = padY - s.paddle.h / 2 - b.r;
            synthRef.current?.paddle();
          }

          // Bricks
          for (const brick of s.bricks) {
            if (brick.hp <= 0) continue;
            const nearX = Math.max(brick.x, Math.min(b.x, brick.x + brick.w));
            const nearY = Math.max(brick.y, Math.min(b.y, brick.y + brick.h));
            const dx = b.x - nearX;
            const dy = b.y - nearY;
            if (dx * dx + dy * dy <= b.r * b.r) {
              // Bounce: pick dominant axis
              if (Math.abs(dx) > Math.abs(dy)) {
                b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx);
              } else {
                b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy);
              }
              hitBrick(brick, b.x, b.y, now);
              break;
            }
          }
        }

        // Ball lost
        const before = s.balls.length;
        s.balls = s.balls.filter((b) => b.y - b.r < H + 10);
        if (before > 0 && s.balls.length === 0) {
          s.lives -= 1;
          setLives(Math.max(0, s.lives));
          synthRef.current?.lifeLost();
          s.shakeUntil = now + 320;
          s.flashUntil = now + 220;
          if (s.lives <= 0) {
            endGame();
          } else {
            addPopup('BALL LOST!', W / 2, H * 0.55, '#f87171', 28);
            resetBallOnPaddle();
          }
        }

        // Drops
        for (const d of s.drops) d.y += 170 * dt;
        for (const d of s.drops) {
          if (
            d.y > padY - s.paddle.h &&
            d.y < padY + 24 &&
            d.x > s.paddle.x - s.paddle.w / 2 - 14 &&
            d.x < s.paddle.x + s.paddle.w / 2 + 14
          ) {
            d.dead = true;
            applyPowerup(d.kind, now);
          }
        }
        s.drops = s.drops.filter((d) => !d.dead && d.y < H + 30);

        // Particles & popups
        for (const p of s.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 500 * dt;
          p.life += dt;
        }
        s.particles = s.particles.filter((p) => p.life < p.maxLife);
        for (const p of s.popups) p.t += rawDt;
        s.popups = s.popups.filter((p) => p.t < 1);

        // Level clear
        if (!s.levelClearing && s.bricks.every((b) => b.hp <= 0)) {
          s.levelClearing = true;
          s.score += LEVEL_BONUS;
          setScore(s.score);
          synthRef.current?.levelUp();
          const nextLvl = s.level + 1;
          setLevelBanner(`Level ${s.level} clear! +${LEVEL_BONUS}`);
          setTimeout(() => {
            if (!g.current.running) return;
            g.current.level = nextLvl;
            setLevel(nextLvl);
            setLevelBanner(null);
            buildLevel(nextLvl);
            resetBallOnPaddle();
          }, 1600);
        }
      }

      // ── Brick hit logic (closure) ──
      function hitBrick(brick, x, y, t) {
        brick.hp -= 1;
        if (brick.hp <= 0) {
          const pts = brick.maxHp * 10;
          s.score += pts;
          setScore(s.score);
          const col = BRICK_COLORS[Math.min(4, brick.maxHp)].fill;
          addBurst(x, y, col, 12);
          addPopup(`+${pts}`, brick.x + brick.w / 2, brick.y, '#fff', 16);
          synthRef.current?.breakBrick();
          if (Math.random() < POWERUP_CHANCE) {
            s.drops.push({ x: brick.x + brick.w / 2, y: brick.y + brick.h, kind: pickPowerup() });
          }
        } else {
          synthRef.current?.brick(brick.hp);
          addBurst(x, y, BRICK_COLORS[Math.min(4, brick.hp)].fill, 4);
        }
      }

      function applyPowerup(kind, t) {
        const def = POWERUPS[kind];
        synthRef.current?.powerup();
        addPopup(`${def.emoji} ${def.label}!`, s.paddle.x, H - 80, def.color, 22);
        if (kind === 'expand') {
          s.effects.expandUntil = t + def.duration;
        } else if (kind === 'slow') {
          s.effects.slowUntil = t + def.duration;
        } else if (kind === 'laser') {
          s.effects.laserUntil = t + def.duration;
          s.nextLaserShot = t;
        } else if (kind === 'life') {
          if (s.lives < 5) {
            s.lives += 1;
            setLives(s.lives);
          } else {
            s.score += 50;
            setScore(s.score);
          }
        } else if (kind === 'multi') {
          const src = s.balls.filter((b) => !b.stuck);
          const base = src.length ? src : s.balls;
          const extras = [];
          for (const b of base.slice(0, 2)) {
            for (const da of [-0.5, 0.5]) {
              const speed = Math.max(s.ballSpeed * 0.9, Math.hypot(b.vx, b.vy)) || s.ballSpeed;
              const ang = Math.atan2(b.vy || -1, b.vx || 0.1) + da;
              extras.push({ x: b.x, y: b.y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, r: b.r, stuck: false });
            }
          }
          s.balls.push(...extras.slice(0, 4));
        }
      }

      // ── Render ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (now < s.shakeUntil) {
        const mag = 5 * ((s.shakeUntil - now) / 320);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f172a');
      bg.addColorStop(0.6, '#1e1b4b');
      bg.addColorStop(1, '#312e81');
      ctx.fillStyle = bg;
      ctx.fillRect(-10, -10, W + 20, H + 20);

      // faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Bricks
      for (const brick of s.bricks) {
        if (brick.hp <= 0) continue;
        const col = BRICK_COLORS[Math.min(4, brick.hp)];
        ctx.fillStyle = col.fill;
        ctx.shadowColor = col.glow;
        ctx.shadowBlur = 10;
        const r = 4;
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, r);
        ctx.fill();
        ctx.shadowBlur = 0;
        // damage shine
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h * 0.35, r);
        ctx.fill();
      }

      // Drops
      for (const d of s.drops) {
        const def = POWERUPS[d.kind];
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 12;
        ctx.fillText(def.emoji, d.x, d.y);
        ctx.shadowBlur = 0;
      }

      // Bolts
      ctx.fillStyle = '#e879f9';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 8;
      for (const bolt of s.bolts) {
        ctx.fillRect(bolt.x - 2, bolt.y - 10, 4, 12);
      }
      ctx.shadowBlur = 0;

      // Paddle
      if (s.running) {
        const padY = H - 46;
        const laserOn = now < s.effects.laserUntil;
        const grad = ctx.createLinearGradient(s.paddle.x - s.paddle.w / 2, 0, s.paddle.x + s.paddle.w / 2, 0);
        grad.addColorStop(0, laserOn ? '#c084fc' : '#22d3ee');
        grad.addColorStop(1, laserOn ? '#e879f9' : '#3b82f6');
        ctx.fillStyle = grad;
        ctx.shadowColor = laserOn ? 'rgba(192,132,252,0.8)' : 'rgba(34,211,238,0.7)';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.roundRect(s.paddle.x - s.paddle.w / 2, padY - s.paddle.h / 2, s.paddle.w, s.paddle.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Balls
      for (const b of s.balls) {
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

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
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 6;
        ctx.fillText(p.text, p.x, p.y - p.t * 40);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // Active effect indicators
      if (s.running) {
        const labels = [];
        if (now < s.effects.expandUntil) labels.push('🟢 WIDE');
        if (now < s.effects.laserUntil) labels.push('🟣 LASER');
        if (now < s.effects.slowUntil) labels.push('🟡 SLOW');
        if (labels.length) {
          ctx.font = '700 13px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.fillText(labels.join('   '), W / 2, H - 14);
        }
        // Serve hint
        if (s.balls.some((b) => b.stuck) && !s.paused) {
          ctx.font = '700 15px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText('Click / tap / space to launch!', W / 2, H * 0.6);
        }
      }

      // Flash
      if (now < s.flashUntil) {
        ctx.fillStyle = 'rgba(248,113,113,0.25)';
        ctx.fillRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildLevel, endGame, resetBallOnPaddle]);

  // ── UI ──
  return (
    <div className="max-w-5xl mx-auto">
      <div ref={wrapRef} className="relative rounded-2xl overflow-hidden shadow-2xl select-none" style={{ touchAction: 'none' }}>
        <canvas
          ref={canvasRef}
          className="block w-full cursor-pointer"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />

        {/* HUD */}
        {screen === 'playing' && (
          <>
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-sm text-white font-black text-lg md:text-xl px-4 py-2 rounded-xl">
                🧱 {score.toLocaleString()}
              </div>
              <div className="bg-black/40 backdrop-blur-sm text-white font-bold text-sm px-3 py-2 rounded-xl">
                Lv {level}
              </div>
              <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl text-base tracking-wider">
                {Array.from({ length: Math.max(LIVES_START, lives) }).map((_, i) => (
                  <span key={i} className={i < lives ? '' : 'opacity-25 grayscale'}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-xl hover:bg-black/60 transition-all"
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={togglePause}
                className="bg-black/40 backdrop-blur-sm text-white px-3 py-2 rounded-xl hover:bg-black/60 transition-all"
              >
                {paused ? '▶️' : '⏸️'}
              </button>
            </div>

            {levelBanner && (
              <div className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl md:text-2xl px-6 py-3 rounded-2xl shadow-2xl animate-bounce">
                  🎉 {levelBanner}
                </div>
              </div>
            )}

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

        {/* MENU */}
        {screen === 'menu' && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-indigo-950/80 to-purple-950/85 flex flex-col items-center justify-center gap-4 p-4 text-center overflow-y-auto">
            <div className="text-6xl md:text-7xl animate-bounce">🧱</div>
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
              Block <span className="text-cyan-300">Blaster</span>
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-md">
              Bounce the ball, smash the bricks, and catch falling power-ups! New patterns every level — how far can you
              blast?
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90">
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🔵 Multiball</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🟢 Wide paddle</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🟣 Lasers</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🟡 Slow-mo</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">❤️ Extra life</span>
            </div>
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xl px-10 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all mt-2"
            >
              🚀 Start Blasting
            </button>
            <div className="flex gap-4 text-white/70 text-sm">
              <span>🏆 High score: <strong className="text-cyan-300">{highScore.toLocaleString()}</strong></span>
              <button onClick={toggleMute} className="hover:text-white transition-colors">
                {muted ? '🔇 Sound off' : '🔊 Sound on'}
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER */}
        {screen === 'over' && finalStats && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center overflow-y-auto">
            <div className="text-5xl">{finalStats.score >= REWARD_SCORE ? '🏆' : '🧱'}</div>
            <h3 className="text-white text-3xl md:text-4xl font-black">Game Over!</h3>
            <div className="text-cyan-300 text-5xl font-black drop-shadow">{finalStats.score.toLocaleString()}</div>
            {finalStats.score >= highScore && finalStats.score > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse">
                🎉 NEW HIGH SCORE!
              </div>
            )}
            <div className="bg-white/10 rounded-xl px-6 py-3 text-white/90 text-sm">
              Reached <strong className="text-white text-lg">Level {finalStats.level}</strong>
            </div>
            {rewardMsg && <div className="text-emerald-300 text-sm font-semibold">{rewardMsg}</div>}
            <div className="flex gap-3 mt-1">
              <button
                onClick={startGame}
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
          <span className="text-2xl">🖱️</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Move</strong> with mouse, touch, or arrow keys. Click or space to launch.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🎁</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Catch power-ups</strong> with your paddle — multiball is the best!
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Aim with your paddle</strong> — the edge sends the ball at sharp angles.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Score {REWARD_SCORE}+</strong> to earn {REWARD_COINS} coins once a day!
          </span>
        </div>
      </div>
    </div>
  );
};

export default BlockBlasterGame;
