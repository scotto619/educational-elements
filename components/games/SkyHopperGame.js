// components/games/SkyHopperGame.js — Sky Hopper 🐸
// A doodle-jump style vertical platformer: bounce ever higher on static,
// moving, crumbly, and spring platforms; grab coins and stars; don't fall!
// Keyboard (arrows/AD) + touch (hold left/right half) controls.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const GRAVITY = 1500; // px/s²
const JUMP_VY = -640;
const SPRING_VY = -1050;
const MOVE_SPEED = 330;
const PLATFORM_W = 72;
const PLATFORM_H = 14;
const REWARD_SCORE = 300;
const REWARD_COINS = 5;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const rand = (min, max) => min + Math.random() * (max - min);

// ── Tiny WebAudio synth ──────────────────────────────────────────────────────
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
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };
  return {
    ensure,
    jump: () => tone(420, 0.1, 'sine', 0.07, 0, 200),
    spring: () => tone(500, 0.22, 'sine', 0.11, 0, 600),
    crumble: () => tone(220, 0.15, 'sawtooth', 0.07, 0, -100),
    coin: () => { tone(988, 0.08, 'square', 0.06); tone(1319, 0.12, 'square', 0.06, 0.06); },
    star: () => { [880, 1175, 1568].forEach((f, i) => tone(f, 0.15, 'sine', 0.09, i * 0.06)); },
    milestone: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.12, 'triangle', 0.08, i * 0.05)); },
    fall: () => tone(600, 0.6, 'sawtooth', 0.1, 0, -520),
    gameOver: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, i * 0.14)); },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const SkyHopperGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);
  const synthRef = useRef(null);
  const mutedRef = useRef(false);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');

  const g = useRef({
    running: false,
    paused: false,
    W: 400,
    H: 600,
    dpr: 1,
    player: { x: 200, y: 500, vx: 0, vy: 0, w: 34, h: 34, facing: 1 },
    platforms: [], // {x,y,type,phase,broken,vx}
    pickups: [], // {x,y,kind,taken}
    particles: [],
    popups: [],
    cameraY: 0, // world y of canvas top
    maxHeight: 0, // climbed height in px
    coins: 0,
    stars: 0,
    score: 0,
    nextPlatformY: 0,
    nextMilestone: 100,
    keys: { left: false, right: false },
    touchDir: 0,
    lastFrame: 0,
    deadAt: 0,
  });

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('skyhopper_highscore') || '0', 10));
      const m = localStorage.getItem('skyhopper_muted') === '1';
      setMuted(m);
      mutedRef.current = m;
    } catch {}
    synthRef.current = createSynth(mutedRef);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem('skyhopper_muted', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  // ── Sizing (portrait playfield) ──
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const width = Math.min(430, wrap.clientWidth);
    const height = Math.round(Math.min(640, Math.max(480, width * 1.45)));
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

  // ── Keyboard ──
  useEffect(() => {
    const down = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) { e.preventDefault(); g.current.keys.left = true; }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) { e.preventDefault(); g.current.keys.right = true; }
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') { e.preventDefault(); togglePause(); }
    };
    const up = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) g.current.keys.left = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) g.current.keys.right = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch: hold left/right half of canvas
  const onPointerDown = (e) => {
    synthRef.current?.ensure();
    const rect = canvasRef.current.getBoundingClientRect();
    g.current.touchDir = e.clientX - rect.left < rect.width / 2 ? -1 : 1;
  };
  const onPointerUp = () => { g.current.touchDir = 0; };

  // ── World generation ──
  const platformTypeFor = (height) => {
    // difficulty scales with climbed height
    const r = Math.random();
    if (height > 1200 && r < 0.16) return 'crumble';
    if (height > 600 && r < 0.3) return 'moving';
    if (r < 0.38) return 'spring' === 'never' ? 'spring' : r < 0.085 ? 'spring' : 'static';
    return 'static';
  };

  const addPlatform = (s, y) => {
    const type = platformTypeFor(s.maxHeight);
    const p = {
      x: rand(10, s.W - PLATFORM_W - 10),
      y,
      type,
      phase: rand(0, Math.PI * 2),
      vx: type === 'moving' ? (Math.random() < 0.5 ? -1 : 1) * rand(60, 120) : 0,
      broken: false,
    };
    s.platforms.push(p);
    // Pickups above some platforms
    const pr = Math.random();
    if (pr < 0.1) s.pickups.push({ x: p.x + PLATFORM_W / 2, y: y - 26, kind: 'star', taken: false });
    else if (pr < 0.32) s.pickups.push({ x: p.x + PLATFORM_W / 2, y: y - 24, kind: 'coin', taken: false });
  };

  const gapFor = (height) => {
    const min = 52 + Math.min(38, height / 90);
    const max = 78 + Math.min(52, height / 70);
    return rand(min, max);
  };

  const ensurePlatforms = (s) => {
    // generate up to one screen above the camera
    while (s.nextPlatformY > s.cameraY - s.H) {
      s.nextPlatformY -= gapFor(s.maxHeight);
      addPlatform(s, s.nextPlatformY);
    }
    // prune below the screen
    const cutoff = s.cameraY + s.H + 80;
    s.platforms = s.platforms.filter((p) => p.y < cutoff);
    s.pickups = s.pickups.filter((p) => !p.taken && p.y < cutoff);
  };

  // ── Effects ──
  const addPopup = (text, x, y, color = '#fff', size = 15) => {
    g.current.popups.push({ text, x, y, t: 0, color, size });
  };
  const addBurst = (x, y, color, n = 8) => {
    const s = g.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 130;
      s.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1.5 + Math.random() * 3, color, life: 0, maxLife: 0.35 + Math.random() * 0.3 });
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
        try { localStorage.setItem('skyhopper_highscore', String(finalScore)); } catch {}
        return finalScore;
      }
      return prev;
    });

    setFinalStats({
      score: finalScore,
      heightM: Math.round(s.maxHeight / 10),
      coins: s.coins,
      stars: s.stars,
    });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.skyHopper?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            skyHopper: {
              ...studentData.gameProgress?.skyHopper,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.skyHopper?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🐸 Sky Hopper reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
    }

    setTimeout(() => setScreen('over'), 600);
  }, [studentData, updateStudentData, showToast]);

  // ── Main loop ──
  useEffect(() => {
    const loop = (now) => {
      rafRef.current = requestAnimationFrame(loop);
      const s = g.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const { W, H, dpr } = s;

      const rawDt = s.lastFrame ? Math.min(0.035, (now - s.lastFrame) / 1000) : 0.016;
      s.lastFrame = now;
      const dt = s.running && !s.paused ? rawDt : 0;

      // ── Update ──
      if (dt > 0) {
        const pl = s.player;

        // Horizontal control
        const dir = (s.keys.left ? -1 : 0) + (s.keys.right ? 1 : 0) + s.touchDir;
        const clamped = Math.max(-1, Math.min(1, dir));
        pl.vx = clamped * MOVE_SPEED;
        if (clamped !== 0) pl.facing = clamped;
        pl.x += pl.vx * dt;
        // wrap horizontally
        if (pl.x < -pl.w / 2) pl.x = W + pl.w / 2;
        if (pl.x > W + pl.w / 2) pl.x = -pl.w / 2;

        // Vertical physics
        pl.vy += GRAVITY * dt;
        const prevY = pl.y;
        pl.y += pl.vy * dt;

        // Platform updates + collision (only while falling)
        for (const p of s.platforms) {
          if (p.type === 'moving') {
            p.x += p.vx * dt;
            if (p.x < 6) { p.x = 6; p.vx = Math.abs(p.vx); }
            if (p.x > W - PLATFORM_W - 6) { p.x = W - PLATFORM_W - 6; p.vx = -Math.abs(p.vx); }
          }
          if (p.broken) continue;
          if (pl.vy > 0) {
            const footPrev = prevY + pl.h / 2;
            const footNow = pl.y + pl.h / 2;
            if (footPrev <= p.y && footNow >= p.y && pl.x + pl.w * 0.32 > p.x && pl.x - pl.w * 0.32 < p.x + PLATFORM_W) {
              if (p.type === 'spring') {
                pl.vy = SPRING_VY;
                synthRef.current?.spring();
                addBurst(pl.x, p.y, '#fbbf24', 12);
                addPopup('BOING!', pl.x, p.y - 14, '#fbbf24', 16);
              } else {
                pl.vy = JUMP_VY;
                synthRef.current?.jump();
              }
              if (p.type === 'crumble') {
                p.broken = true;
                synthRef.current?.crumble();
                addBurst(p.x + PLATFORM_W / 2, p.y + 6, '#b45309', 10);
              }
              pl.y = p.y - pl.h / 2;
            }
          }
        }

        // Pickups
        for (const pk of s.pickups) {
          if (pk.taken) continue;
          if (Math.abs(pl.x - pk.x) < 26 && Math.abs(pl.y - pk.y) < 28) {
            pk.taken = true;
            if (pk.kind === 'coin') {
              s.coins += 1;
              s.score += 5;
              synthRef.current?.coin();
              addBurst(pk.x, pk.y, '#fbbf24', 8);
              addPopup('+5', pk.x, pk.y - 8, '#fde047', 14);
            } else {
              s.stars += 1;
              s.score += 25;
              synthRef.current?.star();
              addBurst(pk.x, pk.y, '#f0abfc', 14);
              addPopup('⭐ +25', pk.x, pk.y - 8, '#f0abfc', 17);
            }
            setScore(s.score);
          }
        }

        // Camera follows upward only
        const targetCam = pl.y - H * 0.45;
        if (targetCam < s.cameraY) s.cameraY = targetCam;

        // Height score
        const climbed = Math.max(0, -(pl.y - 500));
        if (climbed > s.maxHeight) {
          const gained = Math.floor(climbed / 10) - Math.floor(s.maxHeight / 10);
          if (gained > 0) {
            s.score += gained;
            setScore(s.score);
          }
          s.maxHeight = climbed;
          const meters = Math.round(s.maxHeight / 10);
          if (meters >= s.nextMilestone) {
            addPopup(`${s.nextMilestone}m! 🎉`, W / 2, s.cameraY + 80, '#a5f3fc', 22);
            synthRef.current?.milestone();
            s.nextMilestone += 100;
          }
        }

        ensurePlatforms(s);

        // Fell off the bottom
        if (pl.y - s.cameraY > H + 60 && !s.deadAt) {
          s.deadAt = now;
          synthRef.current?.fall();
          endGame();
        }

        // Particles & popups
        for (const p of s.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 500 * dt;
          p.life += dt;
        }
        s.particles = s.particles.filter((p) => p.life < p.maxLife);
        for (const p of s.popups) p.t += rawDt;
        s.popups = s.popups.filter((p) => p.t < 1.1);
      }

      // ── Render ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Sky gradient shifts with altitude
      const alt = Math.min(1, s.maxHeight / 6000);
      const topColor = `rgb(${Math.round(125 - alt * 110)}, ${Math.round(195 - alt * 160)}, ${Math.round(245 - alt * 170)})`;
      const botColor = `rgb(${Math.round(190 - alt * 140)}, ${Math.round(230 - alt * 150)}, ${Math.round(250 - alt * 130)})`;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, topColor);
      bgGrad.addColorStop(1, botColor);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Parallax clouds / stars
      ctx.fillStyle = alt > 0.6 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 7; i++) {
        const cy = ((i * 977 - s.cameraY * 0.35) % (H + 120)) - 60;
        const cx2 = (i * 173) % W;
        if (alt > 0.6) {
          ctx.fillRect(cx2, cy, 2.5, 2.5); // stars up high
        } else {
          ctx.beginPath();
          ctx.ellipse(cx2, cy, 30, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const toScreen = (y) => y - s.cameraY;

      // Platforms
      for (const p of s.platforms) {
        if (p.broken) continue;
        const sy = toScreen(p.y);
        if (sy < -30 || sy > H + 30) continue;
        const colors = {
          static: ['#22c55e', '#15803d'],
          moving: ['#38bdf8', '#0369a1'],
          crumble: ['#d97706', '#92400e'],
          spring: ['#22c55e', '#15803d'],
        };
        const [fill, edge] = colors[p.type] || colors.static;
        ctx.fillStyle = fill;
        ctx.strokeStyle = edge;
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p.x, sy, PLATFORM_W, PLATFORM_H, 7);
        else ctx.rect(p.x, sy, PLATFORM_W, PLATFORM_H);
        ctx.fill();
        ctx.stroke();
        if (p.type === 'crumble') {
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath();
          ctx.moveTo(p.x + 18, sy + 3);
          ctx.lineTo(p.x + 30, sy + 11);
          ctx.moveTo(p.x + 44, sy + 2);
          ctx.lineTo(p.x + 52, sy + 12);
          ctx.stroke();
        }
        if (p.type === 'spring') {
          ctx.font = '14px serif';
          ctx.textAlign = 'center';
          ctx.fillText('🌀', p.x + PLATFORM_W / 2, sy - 2);
        }
      }

      // Pickups
      for (const pk of s.pickups) {
        if (pk.taken) continue;
        const sy = toScreen(pk.y);
        if (sy < -30 || sy > H + 30) continue;
        const bob = Math.sin(now / 250 + pk.x) * 3;
        ctx.font = `${pk.kind === 'star' ? 22 : 18}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pk.kind === 'star' ? '⭐' : '🪙', pk.x, sy + bob);
      }

      // Player
      if (s.running || s.deadAt) {
        const pl = s.player;
        const sy = toScreen(pl.y);
        ctx.save();
        ctx.translate(pl.x, sy);
        ctx.scale(pl.facing, 1);
        const squash = pl.vy < -200 ? 1.12 : pl.vy > 300 ? 0.92 : 1;
        ctx.scale(1 / squash, squash);
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🐸', 0, 0);
        ctx.restore();
      }

      // Particles
      for (const p of s.particles) {
        const a = 1 - p.life / p.maxLife;
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, toScreen(p.y), p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Popups (world-anchored)
      for (const p of s.popups) {
        ctx.globalAlpha = Math.max(0, 1 - p.t);
        ctx.font = `900 ${p.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(p.text, p.x, toScreen(p.y) - p.t * 28);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [endGame]);

  // ── Start ──
  const startGame = () => {
    const s = g.current;
    resizeCanvas();
    const { W, H } = s;
    s.player = { x: W / 2, y: 500, vx: 0, vy: JUMP_VY, w: 34, h: 34, facing: 1 };
    s.platforms = [{ x: W / 2 - PLATFORM_W / 2, y: 540, type: 'static', phase: 0, vx: 0, broken: false }];
    s.pickups = [];
    s.particles = [];
    s.popups = [];
    s.cameraY = 540 + PLATFORM_H - H;
    s.maxHeight = 0;
    s.coins = 0;
    s.stars = 0;
    s.score = 0;
    s.nextMilestone = 100;
    s.nextPlatformY = 540;
    s.deadAt = 0;
    s.lastFrame = 0;
    // seed initial platforms
    while (s.nextPlatformY > s.cameraY - H) {
      s.nextPlatformY -= rand(55, 80);
      addPlatform(s, s.nextPlatformY);
    }
    s.running = true;
    s.paused = false;
    setScore(0);
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
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-sky-900 to-indigo-950 rounded-2xl shadow-2xl p-3 md:p-4">
        <div ref={wrapRef} className="relative mx-auto flex justify-center" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            className="block rounded-xl"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onPointerCancel={onPointerUp}
          />

          {/* HUD */}
          {screen === 'playing' && (
            <>
              <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-sm text-white font-black text-base px-3 py-1.5 rounded-lg">⭐ {score}</div>
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button onClick={toggleMute} className="bg-black/40 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg hover:bg-black/60 text-sm">{muted ? '🔇' : '🔊'}</button>
                <button onClick={togglePause} className="bg-black/40 backdrop-blur-sm text-white px-2.5 py-1.5 rounded-lg hover:bg-black/60 text-sm">{paused ? '▶️' : '⏸️'}</button>
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
            <div className="absolute inset-0 bg-gradient-to-b from-sky-900/80 to-indigo-950/85 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center overflow-y-auto">
              <div className="text-5xl md:text-6xl animate-bounce">🐸</div>
              <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                Sky <span className="text-lime-300">Hopper</span>
              </h2>
              <p className="text-white/80 text-xs md:text-sm max-w-xs">
                Bounce from platform to platform and climb as high as you can — but one missed jump and it's a long way down!
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 text-[11px] md:text-xs text-white/90">
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🌀 Springs launch you</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🟫 Crumbly breaks</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🟦 Movers slide</span>
                <span className="bg-white/10 border border-white/20 rounded-full px-2.5 py-1">🪙⭐ Collect!</span>
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-black text-lg px-9 py-3.5 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all mt-1"
              >
                🚀 Jump In!
              </button>
              <div className="flex gap-4 text-white/70 text-xs md:text-sm">
                <span>🏆 High score: <strong className="text-lime-300">{highScore.toLocaleString()}</strong></span>
                <button onClick={toggleMute} className="hover:text-white transition-colors">{muted ? '🔇' : '🔊'}</button>
              </div>
            </div>
          )}

          {/* GAME OVER */}
          {screen === 'over' && finalStats && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2.5 p-4 text-center overflow-y-auto">
              <div className="text-4xl md:text-5xl">{finalStats.score >= REWARD_SCORE ? '🏆' : '🐸'}</div>
              <h3 className="text-white text-2xl md:text-3xl font-black">Splat!</h3>
              <div className="text-lime-300 text-4xl md:text-5xl font-black drop-shadow">{finalStats.score.toLocaleString()}</div>
              {finalStats.score >= highScore && finalStats.score > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                  🎉 NEW HIGH SCORE!
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-white/90 text-xs md:text-sm">
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">{finalStats.heightM}m</div>
                  <div className="text-white/60 text-[10px]">Height</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">🪙 {finalStats.coins}</div>
                  <div className="text-white/60 text-[10px]">Coins</div>
                </div>
                <div className="bg-white/10 rounded-lg px-3 py-2">
                  <div className="text-lg font-black">⭐ {finalStats.stars}</div>
                  <div className="text-white/60 text-[10px]">Stars</div>
                </div>
              </div>
              {rewardMsg && <div className="text-emerald-300 text-xs md:text-sm font-semibold">{rewardMsg}</div>}
              <div className="flex gap-2.5 mt-1">
                <button onClick={startGame} className="bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                  🔄 Play Again
                </button>
                <button onClick={quitToMenu} className="bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/25 transition-all">
                  🏠 Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">⌨️</span>
          <span className="text-gray-600"><strong className="text-gray-800">Move</strong> with ←/→ or A/D — or hold the left/right side of the screen.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🌀</span>
          <span className="text-gray-600"><strong className="text-gray-800">Spring pads</strong> launch you sky-high. Crumbly brown ones break!</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🌍</span>
          <span className="text-gray-600"><strong className="text-gray-800">Wrap around:</strong> run off one side and appear on the other.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600"><strong className="text-gray-800">Score {REWARD_SCORE}+</strong> to earn {REWARD_COINS} coins once a day!</span>
        </div>
      </div>
    </div>
  );
};

export default SkyHopperGame;
