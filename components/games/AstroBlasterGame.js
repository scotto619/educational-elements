// components/games/AstroBlasterGame.js — Astro Blaster 🚀
// A neon asteroids-style space shooter. Rotate your ship, thrust through space,
// and blast asteroids that split into smaller chunks. Chain hits for combo
// multipliers, grab power-ups (shield / triple shot / rapid fire), survive the
// UFO that shows up in later waves, and climb the wave counter as long as your
// three lives last. Keyboard + on-screen touch controls, WebAudio sound,
// local best score, and a once-a-day coin reward.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const VIEW_W = 640;
const VIEW_H = 480;
const SHIP_R = 12;             // ship collision radius
const TURN_SPEED = 4.2;        // rad/s
const THRUST = 260;            // px/s^2
const FRICTION = 0.35;         // velocity damping per second
const MAX_SPEED = 340;
const BULLET_SPEED = 460;
const BULLET_LIFE = 0.9;       // seconds
const FIRE_COOLDOWN = 0.28;    // seconds between shots
const RAPID_COOLDOWN = 0.12;
const POWERUP_TIME = 8;        // seconds a power-up lasts
const POWERUP_CHANCE = 0.14;   // chance an asteroid drops one
const INVINCIBLE_TIME = 2.5;   // seconds after respawn
const COMBO_WINDOW = 2.0;      // seconds to keep a combo alive
const START_LIVES = 3;
const REWARD_SCORE = 1500;     // score needed for the daily coin reward
const REWARD_COINS = 5;
const BEST_KEY = 'astroBlasterBestScore';

const AST_SIZES = {
  3: { r: 42, score: 20, speed: [40, 80], next: 2, count: 2 },
  2: { r: 24, score: 50, speed: [70, 130], next: 1, count: 2 },
  1: { r: 13, score: 100, speed: [110, 190], next: 0, count: 0 },
};
const HUES = [175, 200, 260, 300, 330, 20, 45];
const rand = (min, max) => min + Math.random() * (max - min);
const wrap = (v, max) => ((v % max) + max) % max;
const dist2 = (a, b) => {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
};

// ── Tiny WebAudio synth (same approach as other games) ────────────────────────
function createSynth(mutedRef) {
  let ctx = null;
  const ensure = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
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
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };
  const noise = (dur, vol = 0.12, when = 0) => {
    if (mutedRef.current) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(gain).connect(ac.destination);
    src.start(t0);
  };
  return {
    shoot: () => tone(760, 0.09, 'square', 0.05, 0, -420),
    hitSmall: () => { noise(0.12, 0.08); tone(320, 0.1, 'triangle', 0.07, 0, -140); },
    hitBig: () => { noise(0.25, 0.14); tone(140, 0.22, 'sawtooth', 0.09, 0, -80); },
    explode: () => { noise(0.5, 0.2); tone(90, 0.45, 'sawtooth', 0.12, 0, -55); },
    powerup: () => { tone(520, 0.09, 'sine', 0.09); tone(660, 0.09, 'sine', 0.09, 0.08); tone(880, 0.14, 'sine', 0.09, 0.16); },
    wave: () => { tone(440, 0.12, 'triangle', 0.08); tone(660, 0.18, 'triangle', 0.08, 0.12); },
    ufo: () => tone(980, 0.2, 'sine', 0.04, 0, -300),
    reward: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.09, i * 0.1)); },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const AstroBlasterGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [screen, setScreen] = useState('menu'); // menu | playing | paused | gameover
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(START_LIVES);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const screenRef = useRef('menu');
  const keysRef = useRef({});
  const touchRef = useRef({ left: false, right: false, thrust: false, fire: false });
  const gameRef = useRef(null);
  const rafRef = useRef(0);
  const rewardedRef = useRef(false);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { screenRef.current = screen; }, [screen]);

  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try { setBest(parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0); } catch { /* ignore */ }
  }, []);

  // ── Daily coin reward ───────────────────────────────────────────────────────
  const maybeAwardCoins = useCallback((finalScore) => {
    if (rewardedRef.current) return;
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.astroBlaster?.lastRewardDate;
      if (last !== today) {
        rewardedRef.current = true;
        Promise.resolve(
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              astroBlaster: {
                ...studentData.gameProgress?.astroBlaster,
                bestScore: Math.max(finalScore, studentData.gameProgress?.astroBlaster?.bestScore || 0),
                lastRewardDate: today,
              },
            },
          })
        )
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🚀 Astro Blaster reward: +${REWARD_COINS} coins!`, 'success');
            synthRef.current?.reward();
          })
          .catch((err) => console.error('Error awarding coins:', err));
      }
    }
  }, [studentData, updateStudentData, showToast]);

  // ── Game object factories ───────────────────────────────────────────────────
  const makeAsteroid = useCallback((size, x, y) => {
    const def = AST_SIZES[size];
    const verts = [];
    const n = 9 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) verts.push(rand(0.72, 1.12));
    const ang = rand(0, Math.PI * 2);
    const spd = rand(def.speed[0], def.speed[1]);
    return {
      x, y, size, r: def.r, verts,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      rot: rand(0, Math.PI * 2), rotSpd: rand(-1.4, 1.4),
      hue: HUES[Math.floor(Math.random() * HUES.length)],
    };
  }, []);

  const spawnWave = useCallback((g, waveNum) => {
    const count = Math.min(3 + waveNum, 9);
    for (let i = 0; i < count; i++) {
      // spawn along an edge so nothing appears on top of the ship
      let x, y;
      if (Math.random() < 0.5) { x = Math.random() < 0.5 ? -50 : VIEW_W + 50; y = rand(0, VIEW_H); }
      else { x = rand(0, VIEW_W); y = Math.random() < 0.5 ? -50 : VIEW_H + 50; }
      g.asteroids.push(makeAsteroid(3, x, y));
    }
    g.waveBanner = 2.2;
    if (waveNum >= 3) g.ufoTimer = rand(6, 14);
    synthRef.current?.wave();
  }, [makeAsteroid]);

  const freshGame = useCallback(() => ({
    ship: { x: VIEW_W / 2, y: VIEW_H / 2, vx: 0, vy: 0, angle: -Math.PI / 2 },
    bullets: [], asteroids: [], particles: [], powerups: [], ufoBullets: [],
    ufo: null, ufoTimer: 0,
    score: 0, wave: 1, lives: START_LIVES,
    fireCd: 0, invincible: INVINCIBLE_TIME,
    combo: 0, comboTimer: 0,
    power: { shield: 0, triple: 0, rapid: 0 },
    waveBanner: 0, shake: 0,
    stars: Array.from({ length: 70 }, () => ({
      x: rand(0, VIEW_W), y: rand(0, VIEW_H), z: rand(0.3, 1), tw: rand(0, Math.PI * 2),
    })),
  }), []);

  const boom = (g, x, y, hue, n, spd = 160) => {
    for (let i = 0; i < n; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(spd * 0.3, spd);
      g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.3, 0.8), max: 0.8, hue });
    }
  };

  const addScore = useCallback((g, base) => {
    g.combo += 1;
    g.comboTimer = COMBO_WINDOW;
    const mult = Math.min(1 + Math.floor((g.combo - 1) / 3) * 0.5, 4); // x1, x1.5, x2 ... x4
    g.score += Math.round(base * mult);
    setScore(g.score);
  }, []);

  // ── Game over / life lost ───────────────────────────────────────────────────
  const shipHit = useCallback((g) => {
    if (g.invincible > 0) return;
    if (g.power.shield > 0) {
      g.power.shield = 0;
      g.invincible = 1.2;
      boom(g, g.ship.x, g.ship.y, 190, 22, 220);
      synthRef.current?.hitBig();
      return;
    }
    g.lives -= 1;
    setLives(g.lives);
    boom(g, g.ship.x, g.ship.y, 15, 40, 260);
    g.shake = 0.5;
    synthRef.current?.explode();
    if (g.lives <= 0) {
      setScreen('gameover');
      const s = g.score;
      setBest((prev) => {
        const nb = Math.max(prev, s);
        try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
        return nb;
      });
      maybeAwardCoins(s);
    } else {
      g.ship = { x: VIEW_W / 2, y: VIEW_H / 2, vx: 0, vy: 0, angle: -Math.PI / 2 };
      g.invincible = INVINCIBLE_TIME;
      g.power = { shield: 0, triple: 0, rapid: 0 };
    }
  }, [maybeAwardCoins]);

  // ── Main loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let last = performance.now();
    let running = true;

    const fitCanvas = () => {
      const w = wrapRef.current?.clientWidth || VIEW_W;
      const scale = Math.min(w / VIEW_W, 1.25);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = VIEW_W * scale * dpr;
      canvas.height = VIEW_H * scale * dpr;
      canvas.style.width = `${VIEW_W * scale}px`;
      canvas.style.height = `${VIEW_H * scale}px`;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    };
    fitCanvas();
    window.addEventListener('resize', fitCanvas);

    const update = (g, dt) => {
      const keys = keysRef.current;
      const touch = touchRef.current;
      const s = g.ship;

      // steering + thrust
      const left = keys.ArrowLeft || keys.a || keys.A || touch.left;
      const right = keys.ArrowRight || keys.d || keys.D || touch.right;
      const thrust = keys.ArrowUp || keys.w || keys.W || touch.thrust;
      const firing = keys[' '] || keys.Spacebar || touch.fire;
      if (left) s.angle -= TURN_SPEED * dt;
      if (right) s.angle += TURN_SPEED * dt;
      if (thrust) {
        s.vx += Math.cos(s.angle) * THRUST * dt;
        s.vy += Math.sin(s.angle) * THRUST * dt;
        if (Math.random() < 0.6) {
          g.particles.push({
            x: s.x - Math.cos(s.angle) * 14, y: s.y - Math.sin(s.angle) * 14,
            vx: -Math.cos(s.angle) * 90 + rand(-25, 25), vy: -Math.sin(s.angle) * 90 + rand(-25, 25),
            life: 0.3, max: 0.3, hue: 28,
          });
        }
      }
      const sp = Math.hypot(s.vx, s.vy);
      if (sp > MAX_SPEED) { s.vx *= MAX_SPEED / sp; s.vy *= MAX_SPEED / sp; }
      const damp = Math.max(0, 1 - FRICTION * dt);
      s.vx *= damp; s.vy *= damp;
      s.x = wrap(s.x + s.vx * dt, VIEW_W);
      s.y = wrap(s.y + s.vy * dt, VIEW_H);

      // firing
      g.fireCd -= dt;
      if (firing && g.fireCd <= 0) {
        g.fireCd = g.power.rapid > 0 ? RAPID_COOLDOWN : FIRE_COOLDOWN;
        const angles = g.power.triple > 0 ? [-0.22, 0, 0.22] : [0];
        angles.forEach((off) => {
          g.bullets.push({
            x: s.x + Math.cos(s.angle) * 16, y: s.y + Math.sin(s.angle) * 16,
            vx: Math.cos(s.angle + off) * BULLET_SPEED + s.vx * 0.4,
            vy: Math.sin(s.angle + off) * BULLET_SPEED + s.vy * 0.4,
            life: BULLET_LIFE,
          });
        });
        synthRef.current?.shoot();
      }

      // timers
      g.invincible = Math.max(0, g.invincible - dt);
      g.shake = Math.max(0, g.shake - dt);
      g.waveBanner = Math.max(0, g.waveBanner - dt);
      ['shield', 'triple', 'rapid'].forEach((k) => { g.power[k] = Math.max(0, g.power[k] - dt); });
      g.comboTimer -= dt;
      if (g.comboTimer <= 0) g.combo = 0;

      // bullets
      g.bullets = g.bullets.filter((b) => {
        b.life -= dt;
        b.x = wrap(b.x + b.vx * dt, VIEW_W);
        b.y = wrap(b.y + b.vy * dt, VIEW_H);
        return b.life > 0;
      });

      // asteroids
      g.asteroids.forEach((a) => {
        a.x = wrap(a.x + a.vx * dt, VIEW_W);
        a.y = wrap(a.y + a.vy * dt, VIEW_H);
        a.rot += a.rotSpd * dt;
      });

      // bullet ↔ asteroid
      for (let i = g.asteroids.length - 1; i >= 0; i--) {
        const a = g.asteroids[i];
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          const b = g.bullets[j];
          if (dist2(a, b) < a.r * a.r) {
            g.bullets.splice(j, 1);
            g.asteroids.splice(i, 1);
            const def = AST_SIZES[a.size];
            addScore(g, def.score);
            boom(g, a.x, a.y, a.hue, a.size * 8);
            if (a.size > 1) {
              synthRef.current?.hitBig();
              for (let k = 0; k < def.count; k++) g.asteroids.push(makeAsteroid(def.next, a.x, a.y));
            } else {
              synthRef.current?.hitSmall();
            }
            if (Math.random() < POWERUP_CHANCE) {
              const types = ['shield', 'triple', 'rapid'];
              g.powerups.push({
                x: a.x, y: a.y, vx: rand(-35, 35), vy: rand(-35, 35),
                type: types[Math.floor(Math.random() * types.length)], life: 9, pulse: 0,
              });
            }
            break;
          }
        }
      }

      // UFO
      if (g.ufoTimer > 0 && !g.ufo) {
        g.ufoTimer -= dt;
        if (g.ufoTimer <= 0) {
          const fromLeft = Math.random() < 0.5;
          g.ufo = {
            x: fromLeft ? -40 : VIEW_W + 40, y: rand(60, VIEW_H - 60),
            vx: (fromLeft ? 1 : -1) * rand(60, 95), wob: rand(0, Math.PI * 2),
            fireCd: 1.6, hp: 3,
          };
          synthRef.current?.ufo();
        }
      }
      if (g.ufo) {
        const u = g.ufo;
        u.wob += dt * 2.2;
        u.x += u.vx * dt;
        u.y += Math.sin(u.wob) * 34 * dt;
        u.fireCd -= dt;
        if (u.fireCd <= 0) {
          u.fireCd = rand(1.4, 2.2);
          const ang = Math.atan2(s.y - u.y, s.x - u.x) + rand(-0.25, 0.25);
          g.ufoBullets.push({ x: u.x, y: u.y, vx: Math.cos(ang) * 190, vy: Math.sin(ang) * 190, life: 3 });
          synthRef.current?.ufo();
        }
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          if (dist2(u, g.bullets[j]) < 22 * 22) {
            g.bullets.splice(j, 1);
            u.hp -= 1;
            boom(g, u.x, u.y, 130, 8);
            synthRef.current?.hitSmall();
            if (u.hp <= 0) {
              addScore(g, 250);
              boom(g, u.x, u.y, 130, 30, 240);
              synthRef.current?.explode();
              g.ufo = null;
              g.ufoTimer = rand(12, 22);
              break;
            }
          }
        }
        if (g.ufo && (g.ufo.x < -60 || g.ufo.x > VIEW_W + 60)) { g.ufo = null; g.ufoTimer = rand(10, 18); }
      }
      g.ufoBullets = g.ufoBullets.filter((b) => {
        b.life -= dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.life <= 0) return false;
        if (dist2(b, s) < (SHIP_R + 4) * (SHIP_R + 4)) { shipHit(g); return false; }
        return true;
      });

      // power-ups
      g.powerups = g.powerups.filter((p) => {
        p.life -= dt; p.pulse += dt * 5;
        p.x = wrap(p.x + p.vx * dt, VIEW_W);
        p.y = wrap(p.y + p.vy * dt, VIEW_H);
        if (dist2(p, s) < (SHIP_R + 13) * (SHIP_R + 13)) {
          g.power[p.type] = POWERUP_TIME;
          synthRef.current?.powerup();
          boom(g, p.x, p.y, p.type === 'shield' ? 190 : p.type === 'triple' ? 300 : 55, 14);
          return false;
        }
        return p.life > 0;
      });

      // ship ↔ asteroid
      for (const a of g.asteroids) {
        if (dist2(a, s) < (a.r * 0.82 + SHIP_R) * (a.r * 0.82 + SHIP_R)) { shipHit(g); break; }
      }

      // particles
      g.particles = g.particles.filter((p) => {
        p.life -= dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.985; p.vy *= 0.985;
        return p.life > 0;
      });

      // next wave
      if (g.asteroids.length === 0 && screenRef.current === 'playing') {
        g.wave += 1;
        setWave(g.wave);
        spawnWave(g, g.wave);
      }
    };

    const draw = (g, t) => {
      ctx.save();
      if (g.shake > 0) ctx.translate(rand(-1, 1) * g.shake * 10, rand(-1, 1) * g.shake * 10);

      // background
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#0b0620');
      grad.addColorStop(0.55, '#120a33');
      grad.addColorStop(1, '#050211');
      ctx.fillStyle = grad;
      ctx.fillRect(-12, -12, VIEW_W + 24, VIEW_H + 24);
      g.stars.forEach((st) => {
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.001 * st.z + st.tw));
        ctx.fillStyle = `rgba(200,215,255,${a * st.z})`;
        ctx.fillRect(st.x, st.y, st.z * 1.8, st.z * 1.8);
      });

      // particles
      g.particles.forEach((p) => {
        const a = Math.max(0, p.life / p.max);
        ctx.fillStyle = `hsla(${p.hue},95%,65%,${a})`;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      });

      // asteroids
      g.asteroids.forEach((a) => {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rot);
        ctx.beginPath();
        a.verts.forEach((v, i) => {
          const ang = (i / a.verts.length) * Math.PI * 2;
          const px = Math.cos(ang) * a.r * v;
          const py = Math.sin(ang) * a.r * v;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fillStyle = `hsla(${a.hue},60%,14%,0.9)`;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsl(${a.hue},95%,62%)`;
        ctx.shadowColor = `hsl(${a.hue},95%,62%)`;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      });

      // power-ups
      g.powerups.forEach((p) => {
        const hue = p.type === 'shield' ? 190 : p.type === 'triple' ? 300 : 55;
        const r = 11 + Math.sin(p.pulse) * 2;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue},95%,60%,0.18)`;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = `hsl(${hue},95%,65%)`;
        ctx.shadowColor = `hsl(${hue},95%,65%)`;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `hsl(${hue},95%,80%)`;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.type === 'shield' ? 'S' : p.type === 'triple' ? '3' : 'R', 0, 1);
        ctx.restore();
      });

      // bullets
      g.bullets.forEach((b) => {
        ctx.fillStyle = '#7df9ff';
        ctx.shadowColor = '#7df9ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      g.ufoBullets.forEach((b) => {
        ctx.fillStyle = '#ff5f7a';
        ctx.shadowColor = '#ff5f7a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // UFO
      if (g.ufo) {
        const u = g.ufo;
        ctx.save();
        ctx.translate(u.x, u.y);
        ctx.strokeStyle = '#a78bfa';
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 14;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 4, 22, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, -2, 9, Math.PI, 0);
        ctx.stroke();
        ctx.restore();
      }

      // ship
      const s = g.ship;
      const blink = g.invincible > 0 && Math.floor(t / 120) % 2 === 0;
      if (!blink && screenRef.current !== 'gameover') {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-11, 10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-11, -10);
        ctx.closePath();
        ctx.fillStyle = 'rgba(125,249,255,0.12)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7df9ff';
        ctx.shadowColor = '#7df9ff';
        ctx.shadowBlur = 14;
        ctx.stroke();
        if (g.power.shield > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, 22, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(190,95%,65%,${0.4 + 0.3 * Math.sin(t * 0.01)})`;
          ctx.stroke();
        }
        ctx.restore();
      }

      // combo indicator
      if (g.combo >= 4) {
        const mult = Math.min(1 + Math.floor((g.combo - 1) / 3) * 0.5, 4);
        ctx.fillStyle = `hsla(${(t * 0.15) % 360},95%,65%,0.95)`;
        ctx.font = 'bold 15px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`COMBO x${mult}`, VIEW_W / 2, 30);
      }

      // wave banner
      if (g.waveBanner > 0) {
        const a = Math.min(1, g.waveBanner);
        ctx.fillStyle = `rgba(167,139,250,${a})`;
        ctx.font = 'bold 30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${g.wave}`, VIEW_W / 2, VIEW_H / 2 - 60);
      }

      // active power-up timers
      let py = 14;
      [['shield', '🛡️', 190], ['triple', '✨x3', 300], ['rapid', '⚡', 55]].forEach(([k, label, hue]) => {
        if (g.power[k] > 0) {
          ctx.fillStyle = `hsl(${hue},95%,65%)`;
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${label} ${g.power[k].toFixed(0)}s`, VIEW_W - 12, py);
          py += 16;
        }
      });

      ctx.restore();
    };

    const loop = (t) => {
      if (!running) return;
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      const g = gameRef.current;
      if (g) {
        if (screenRef.current === 'playing') update(g, dt);
        draw(g, t);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', fitCanvas);
    };
  }, [addScore, makeAsteroid, shipHit, spawnWave]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      keysRef.current[e.key] = true;
      if ((e.key === 'p' || e.key === 'P') && (screenRef.current === 'playing' || screenRef.current === 'paused')) {
        setScreen((prev) => (prev === 'playing' ? 'paused' : 'playing'));
      }
    };
    const up = (e) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // ── Start ──────────────────────────────────────────────────────────────────
  const startGame = useCallback(() => {
    const g = freshGame();
    gameRef.current = g;
    rewardedRef.current = false;
    setScore(0);
    setWave(1);
    setLives(START_LIVES);
    setRewardMsg('');
    spawnWave(g, 1);
    setScreen('playing');
  }, [freshGame, spawnWave]);

  // draw an idle background on the menu too
  useEffect(() => {
    if (!gameRef.current) {
      const g = freshGame();
      g.asteroids = [makeAsteroid(3, 90, 100), makeAsteroid(2, 520, 350), makeAsteroid(2, 320, 420)];
      gameRef.current = g;
    }
  }, [freshGame, makeAsteroid]);

  const touchBtn = (key) => ({
    onTouchStart: (e) => { e.preventDefault(); touchRef.current[key] = true; },
    onTouchEnd: (e) => { e.preventDefault(); touchRef.current[key] = false; },
    onMouseDown: () => { touchRef.current[key] = true; },
    onMouseUp: () => { touchRef.current[key] = false; },
    onMouseLeave: () => { touchRef.current[key] = false; },
  });

  const alreadyRewardedToday =
    studentData?.gameProgress?.astroBlaster?.lastRewardDate === new Date().toDateString();

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-cyan-300 font-bold">SCORE {score}</span>
          <span className="text-purple-300">WAVE {wave}</span>
          <span className="text-pink-300">{'❤️'.repeat(Math.max(0, lives))}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-300 font-mono text-sm">BEST {best}</span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      {/* Canvas + overlays */}
      <div ref={wrapRef} className="relative w-full max-w-2xl rounded-2xl overflow-hidden ring-2 ring-purple-500/40 shadow-2xl shadow-purple-900/40">
        <canvas ref={canvasRef} className="block w-full touch-none" />

        {screen === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-center p-6">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 mb-2">
              🚀 ASTRO BLASTER
            </h2>
            <p className="text-purple-200 max-w-md mb-4 text-sm">
              Blast asteroids before they smash your ship! Big rocks split into smaller (faster) ones.
              Chain hits for combo multipliers, grab power-ups, and watch out for the UFO...
            </p>
            <div className="text-xs text-white/60 font-mono mb-5 space-y-1">
              <p>⬅️➡️ / A D — rotate &nbsp;&nbsp; ⬆️ / W — thrust</p>
              <p>SPACE — fire &nbsp;&nbsp; P — pause</p>
            </div>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition-transform shadow-lg shadow-purple-800/50"
            >
              LAUNCH 🚀
            </button>
            <p className="text-xs text-white/50 mt-4">
              Score <b className="text-white/80">{REWARD_SCORE}+</b> to earn {REWARD_COINS} coins once a day!
              {alreadyRewardedToday && ' (already earned today ✅)'}
            </p>
          </div>
        )}

        {screen === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <p className="text-3xl font-black text-white mb-4">⏸️ PAUSED</p>
            <button
              onClick={() => setScreen('playing')}
              className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition-transform"
            >
              Resume
            </button>
          </div>
        )}

        {screen === 'gameover' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-center p-6">
            <p className="text-3xl font-black text-pink-300 mb-1">💥 SHIP DESTROYED</p>
            <p className="text-white/90 font-mono mb-1">Score: <b className="text-cyan-300">{score}</b> · Wave {wave}</p>
            {score >= best && score > 0 && <p className="text-yellow-300 font-bold mb-1">🏆 NEW BEST!</p>}
            {rewardMsg && <p className="text-yellow-300 font-bold mb-1">{rewardMsg}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={startGame}
                className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition-transform"
              >
                Play Again 🚀
              </button>
              <button
                onClick={() => setScreen('menu')}
                className="px-6 py-2 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch controls */}
      {screen === 'playing' && (
        <div className="flex md:hidden items-center justify-between w-full max-w-2xl px-2 pb-1">
          <div className="flex gap-2">
            <button {...touchBtn('left')} className="w-14 h-14 rounded-full bg-purple-600/40 active:bg-purple-500/70 text-2xl">⬅️</button>
            <button {...touchBtn('right')} className="w-14 h-14 rounded-full bg-purple-600/40 active:bg-purple-500/70 text-2xl">➡️</button>
          </div>
          <div className="flex gap-2">
            <button {...touchBtn('thrust')} className="w-14 h-14 rounded-full bg-cyan-600/40 active:bg-cyan-500/70 text-2xl">🔥</button>
            <button {...touchBtn('fire')} className="w-16 h-16 rounded-full bg-pink-600/50 active:bg-pink-500/80 text-2xl font-bold">💥</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AstroBlasterGame;
