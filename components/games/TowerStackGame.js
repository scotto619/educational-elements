// components/games/TowerStackGame.js — Tower Stack 🏗️
// A one-tap timing game: a glowing block slides back and forth above your tower.
// Tap / click / press Space to drop it. Any overhang is sliced off and falls away,
// so each block gets narrower unless you nail a PERFECT stack (which regrows it a
// little and builds a combo). The camera climbs as your tower grows. Miss the
// stack entirely and it's game over. Sleek neon aesthetic, sound, daily coins.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const BASE_W = 150;          // starting block width (px, in world units)
const BLOCK_H = 34;          // block height
const START_SPEED = 150;     // px/s horizontal slide
const SPEED_STEP = 8;        // speed added per block placed
const MAX_SPEED = 460;
const PERFECT_TOL = 6;       // px overlap diff counted as "perfect"
const PERFECT_REGROW = 12;   // px width regained on a perfect drop
const VIEW_W = 360;          // logical canvas width
const VIEW_H = 540;          // logical canvas height
const REWARD_SCORE = 15;     // blocks stacked to earn the daily reward
const REWARD_COINS = 5;

const HUES = [180, 200, 220, 260, 290, 320, 340, 10, 40, 90, 140]; // neon cycle
const rand = (min, max) => min + Math.random() * (max - min);

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
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  };
  return {
    ensure,
    place: (n = 0) => tone(360 + n * 20, 0.1, 'square', 0.06, 0, 120),
    perfect: (n = 0) => { [660, 880, 1175].forEach((f, i) => tone(f + n * 12, 0.12, 'triangle', 0.08, i * 0.05)); },
    slice: () => tone(240, 0.16, 'sawtooth', 0.06, 0, -120),
    gameOver: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'triangle', 0.1, i * 0.14)); },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const TowerStackGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const mutedRef = useRef(false);
  const synthRef = useRef(null);

  const [screen, setScreen] = useState('start'); // start | playing | over
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [finalStats, setFinalStats] = useState({ score: 0, best: 0, perfects: 0 });
  const [rewardMsg, setRewardMsg] = useState('');

  // Mutable game world (kept in a ref so the RAF loop doesn't re-create)
  const g = useRef({
    running: false,
    blocks: [],        // placed blocks: { x, w, hue } (y derived from index)
    current: null,     // moving block: { x, w, hue, dir }
    speed: START_SPEED,
    camY: 0,           // camera vertical offset (world units)
    targetCamY: 0,
    perfects: 0,
    debris: [],        // sliced pieces falling away: { x, y, w, hue, vy, vx, life }
    flashes: [],       // perfect-hit ring flashes: { x, y, life }
    score: 0,
    combo: 0,
  });

  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try {
      setHighScore(parseInt(localStorage.getItem('towerstack_highscore') || '0', 10));
      const m = localStorage.getItem('towerstack_muted') === '1';
      setMuted(m); mutedRef.current = m;
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem('towerstack_muted', next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);

  // ── Game setup ──
  const startGame = useCallback(() => {
    synthRef.current?.ensure();
    const s = g.current;
    const baseX = (VIEW_W - BASE_W) / 2;
    s.blocks = [{ x: baseX, w: BASE_W, hue: HUES[0] }];
    s.speed = START_SPEED;
    s.camY = 0;
    s.targetCamY = 0;
    s.perfects = 0;
    s.debris = [];
    s.flashes = [];
    s.score = 0;
    s.combo = 0;
    s.current = { x: 0, w: BASE_W, hue: HUES[1], dir: 1 };
    s.running = true;
    setScore(0);
    setCombo(0);
    setScreen('playing');
    lastTsRef.current = 0;
  }, []);

  // ── World Y for a block at stack index i (0 = base, on the ground) ──
  const blockTopY = useCallback((index) => VIEW_H - 90 - index * BLOCK_H, []);

  const endGame = useCallback(() => {
    const s = g.current;
    if (!s.running) return;
    s.running = false;
    synthRef.current?.gameOver();
    const finalScore = s.score;

    setHighScore((prev) => {
      const best = Math.max(prev, finalScore);
      if (finalScore > prev) { try { localStorage.setItem('towerstack_highscore', String(finalScore)); } catch {} }
      setFinalStats({ score: finalScore, best, perfects: s.perfects });
      return best;
    });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.towerStack?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            towerStack: {
              ...studentData.gameProgress?.towerStack,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.towerStack?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🏗️ Tower Stack reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Stack ${REWARD_SCORE}+ blocks to earn a daily coin reward!`);
    }

    setTimeout(() => setScreen('over'), 500);
  }, [studentData, updateStudentData, showToast]);

  // ── Drop the current block ──
  const dropBlock = useCallback(() => {
    const s = g.current;
    if (!s.running || !s.current) return;
    const top = s.blocks[s.blocks.length - 1];
    const cur = s.current;

    const left = Math.max(cur.x, top.x);
    const right = Math.min(cur.x + cur.w, top.x + top.w);
    const overlap = right - left;

    if (overlap <= 0) {
      // Missed entirely — the whole block tumbles away.
      s.debris.push({ x: cur.x, y: blockTopY(s.blocks.length), w: cur.w, hue: cur.hue, vy: -40, vx: cur.dir * 60, life: 1.4 });
      endGame();
      return;
    }

    const diff = (cur.x + cur.w / 2) - (top.x + top.w / 2);
    const isPerfect = Math.abs(diff) <= PERFECT_TOL;

    let newX = left;
    let newW = overlap;

    if (isPerfect) {
      // Snap perfectly aligned and regrow a little (capped at base width).
      newX = top.x;
      newW = Math.min(BASE_W, top.w + PERFECT_REGROW);
      s.perfects += 1;
      s.combo += 1;
      synthRef.current?.perfect(s.combo);
      s.flashes.push({ x: top.x + top.w / 2, y: blockTopY(s.blocks.length), life: 0.5 });
    } else {
      // Slice off the overhang as falling debris.
      s.combo = 0;
      const overhangW = cur.w - overlap;
      if (overhangW > 0.5) {
        const debrisX = (cur.x < top.x) ? cur.x : right;
        s.debris.push({ x: debrisX, y: blockTopY(s.blocks.length), w: overhangW, hue: cur.hue, vy: -20, vx: (cur.x < top.x ? -1 : 1) * 50, life: 1.2 });
        synthRef.current?.slice();
      } else {
        synthRef.current?.place(s.score);
      }
    }

    s.blocks.push({ x: newX, w: newW, hue: cur.hue });
    s.score += 1;
    setScore(s.score);
    setCombo(s.combo);

    // Climb the camera so the new top stays in view.
    s.targetCamY = Math.max(0, (s.blocks.length - 6) * BLOCK_H);

    // Next moving block: alternate the start side, ramp the speed.
    s.speed = Math.min(MAX_SPEED, START_SPEED + s.blocks.length * SPEED_STEP);
    const fromLeft = s.blocks.length % 2 === 0;
    s.current = {
      x: fromLeft ? -newW : VIEW_W,
      w: newW,
      hue: HUES[s.blocks.length % HUES.length],
      dir: fromLeft ? 1 : -1,
    };
  }, [endGame, blockTopY]);

  // ── Main loop ──
  useEffect(() => {
    if (screen !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const step = (ts) => {
      const s = g.current;
      if (!lastTsRef.current) lastTsRef.current = ts;
      let dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (dt > 0.05) dt = 0.05;

      // Move current block
      if (s.current && s.running) {
        s.current.x += s.current.dir * s.speed * dt;
        if (s.current.x <= -s.current.w) { s.current.x = -s.current.w; s.current.dir = 1; }
        if (s.current.x >= VIEW_W) { s.current.x = VIEW_W; s.current.dir = -1; }
      }

      // Ease camera
      s.camY += (s.targetCamY - s.camY) * Math.min(1, dt * 6);

      // Update debris & flashes
      s.debris.forEach((d) => { d.vy += 900 * dt; d.y += d.vy * dt; d.x += d.vx * dt; d.life -= dt; });
      s.debris = s.debris.filter((d) => d.life > 0 && d.y < VIEW_H + 200);
      s.flashes.forEach((f) => { f.life -= dt; });
      s.flashes = s.flashes.filter((f) => f.life > 0);

      // ── Render ──
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, '#0b1026');
      grad.addColorStop(1, '#1a0f2e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // subtle starfield
      ctx.save();
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 28; i++) {
        const sx = (i * 53) % VIEW_W;
        const sy = ((i * 97) + s.camY * 0.3) % VIEW_H;
        ctx.fillStyle = i % 3 === 0 ? '#8b5cf6' : '#334155';
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.restore();

      const worldToScreenY = (worldY) => worldY + s.camY;

      const drawBlock = (x, worldY, w, hue, alpha = 1) => {
        const y = worldToScreenY(worldY);
        if (y > VIEW_H + BLOCK_H || y < -BLOCK_H) return;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = `hsl(${hue}, 90%, 60%)`;
        ctx.shadowBlur = 18;
        const bg = ctx.createLinearGradient(x, y, x, y + BLOCK_H);
        bg.addColorStop(0, `hsl(${hue}, 85%, 62%)`);
        bg.addColorStop(1, `hsl(${hue}, 80%, 46%)`);
        ctx.fillStyle = bg;
        roundRect(ctx, x, y, w, BLOCK_H - 3, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = `hsla(${hue}, 100%, 85%, 0.55)`;
        roundRect(ctx, x + 3, y + 3, Math.max(0, w - 6), 5, 3);
        ctx.fill();
        ctx.restore();
      };

      // placed tower
      s.blocks.forEach((b, i) => drawBlock(b.x, blockTopY(i), b.w, b.hue));
      // debris
      s.debris.forEach((d) => drawBlock(d.x, d.y - s.camY, d.w, d.hue, Math.max(0, Math.min(1, d.life))));
      // moving block
      if (s.current && s.running) drawBlock(s.current.x, blockTopY(s.blocks.length), s.current.w, s.current.hue);
      // perfect flashes
      s.flashes.forEach((f) => {
        const y = worldToScreenY(f.y);
        const p = 1 - f.life / 0.5;
        ctx.save();
        ctx.globalAlpha = f.life * 2;
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, y + BLOCK_H / 2, 14 + p * 36, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, blockTopY]);

  // ── Input ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
        e.preventDefault();
        if (screen === 'playing') dropBlock();
        else if (screen !== 'playing') startGame();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, dropBlock, startGame]);

  const handleTap = useCallback(() => {
    if (screen === 'playing') dropBlock();
  }, [screen, dropBlock]);

  return (
    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-6 shadow-2xl">
      <div className="max-w-md mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between mb-3 text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <div>
              <div className="font-extrabold leading-none">Tower Stack</div>
              <div className="text-white/50 text-xs">Stack it sky-high</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xl font-black tabular-nums leading-none">{score}</div>
              <div className="text-white/50 text-[10px] uppercase tracking-wide">Height</div>
            </div>
            <button onClick={toggleMute} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition text-lg" title={muted ? 'Unmute' : 'Mute'}>
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* Canvas stage */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 select-none" style={{ touchAction: 'none' }}>
          <canvas
            ref={canvasRef}
            width={VIEW_W}
            height={VIEW_H}
            onPointerDown={(e) => { e.preventDefault(); handleTap(); }}
            className="w-full h-auto block cursor-pointer bg-slate-900"
            style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          />

          {/* Combo badge */}
          {screen === 'playing' && combo > 1 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-yellow-400 text-purple-900 font-black text-sm shadow-lg animate-pulse">
              🔥 PERFECT x{combo}
            </div>
          )}

          {/* Start overlay */}
          {screen === 'start' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <div className="text-6xl mb-3">🏗️</div>
              <h2 className="text-2xl font-black text-white mb-1">Tower Stack</h2>
              <p className="text-white/70 text-sm mb-5 max-w-xs">
                Tap, click, or press <b className="text-white">Space</b> to drop each block.
                Line it up perfectly to keep your width and build a combo. Miss completely and it&apos;s game over!
              </p>
              <button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-extrabold text-lg shadow-lg hover:scale-105 transition">
                ▶ Play
              </button>
              <div className="mt-4 text-white/60 text-sm">🏆 Best: <b className="text-cyan-300">{highScore}</b></div>
            </div>
          )}

          {/* Game over overlay */}
          {screen === 'over' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              <div className="text-5xl mb-2">{finalStats.score >= highScore && finalStats.score > 0 ? '🏆' : '🧱'}</div>
              <h2 className="text-2xl font-black text-white mb-1">
                {finalStats.score >= highScore && finalStats.score > 0 ? 'New Best!' : 'Tower Toppled!'}
              </h2>
              <div className="flex gap-3 my-4">
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <div className="text-2xl font-black text-cyan-300">{finalStats.score}</div>
                  <div className="text-white/50 text-[10px] uppercase">Height</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <div className="text-2xl font-black text-yellow-300">{finalStats.perfects}</div>
                  <div className="text-white/50 text-[10px] uppercase">Perfects</div>
                </div>
                <div className="bg-white/10 rounded-xl px-4 py-2">
                  <div className="text-2xl font-black text-purple-300">{finalStats.best}</div>
                  <div className="text-white/50 text-[10px] uppercase">Best</div>
                </div>
              </div>
              {rewardMsg && <div className="text-sm font-semibold text-emerald-300 mb-3">{rewardMsg}</div>}
              <button onClick={startGame} className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-extrabold text-lg shadow-lg hover:scale-105 transition">
                🔁 Play Again
              </button>
            </div>
          )}
        </div>

        {/* Footer tip */}
        <div className="mt-3 flex items-center justify-center gap-2 text-center">
          <span className="text-white/50 text-xs">
            <b className="text-white/80">Stack {REWARD_SCORE}+</b> blocks to earn {REWARD_COINS} coins once a day!
          </span>
        </div>
      </div>
    </div>
  );
};

// Rounded-rect helper (older canvas engines lack ctx.roundRect)
function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export default TowerStackGame;
