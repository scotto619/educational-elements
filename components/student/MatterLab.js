// components/student/MatterLab.js — Matter Lab 🧪
// A hands-on states-of-matter simulator for Learning → Science.
// Sixty water particles live inside a beaker on a canvas. Slide the
// temperature from -20°C to 120°C and watch the particles behave exactly like
// the real thing: locked in a vibrating lattice as ICE, sliding over each
// other as WATER, and flying free as STEAM — with melting / freezing /
// boiling / condensing callouts as you cross 0°C and 100°C.
// Lab Challenges turn it into a learning quest: 8 tasks (do-it experiments +
// quick questions) that earn badges, persisted to gameProgress.matterLab.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const VIEW_W = 640;
const VIEW_H = 340;
const N_PARTICLES = 60;
const MIN_TEMP = -20;
const MAX_TEMP = 120;
const PARTICLE_R = 7;

const stateForTemp = (t) => (t < 0 ? 'solid' : t <= 100 ? 'liquid' : 'gas');

const STATE_INFO = {
  solid: {
    label: 'SOLID — Ice', emoji: '🧊', hue: 200,
    facts: 'The particles are LOCKED in a neat pattern called a lattice. They cannot move around — they can only vibrate on the spot. That is why solids keep their shape!',
  },
  liquid: {
    label: 'LIQUID — Water', emoji: '💧', hue: 215,
    facts: 'The particles are close together but can SLIDE past each other. That is why liquids flow, and take the shape of their container.',
  },
  gas: {
    label: 'GAS — Steam', emoji: '💨', hue: 0,
    facts: 'The particles have so much energy they fly around FREELY in all directions, spreading out to fill the whole container!',
  },
};

const TRANSITIONS = {
  'solid>liquid': { text: '🌡️ MELTING at 0°C!', color: '#38bdf8' },
  'liquid>solid': { text: '❄️ FREEZING at 0°C!', color: '#93c5fd' },
  'liquid>gas': { text: '♨️ BOILING at 100°C — evaporation!', color: '#fb923c' },
  'gas>liquid': { text: '💧 CONDENSING back into water!', color: '#38bdf8' },
};

// ── Challenges ────────────────────────────────────────────────────────────────
const CHALLENGES = [
  { id: 'freeze', type: 'do', badge: '🧊', title: 'Deep Freeze', task: 'Cool the lab below 0°C and hold it there to make a SOLID.', check: (s) => s.state === 'solid', hold: 2 },
  { id: 'q_solid', type: 'quiz', badge: '🔬', title: 'Solid Science', task: 'In a solid, the particles are...', options: ['flying around freely', 'locked in place, vibrating', 'sliding past each other'], answer: 1 },
  { id: 'melt', type: 'do', badge: '💧', title: 'The Big Melt', task: 'Warm the ice into a LIQUID (between 0°C and 100°C).', check: (s) => s.state === 'liquid', hold: 2 },
  { id: 'q_melt', type: 'quiz', badge: '🌡️', title: 'Melting Point', task: 'At what temperature does ice melt into water?', options: ['0°C', '50°C', '100°C'], answer: 0 },
  { id: 'boil', type: 'do', badge: '♨️', title: 'Full Boil', task: 'Heat the water past 100°C to make a GAS.', check: (s) => s.state === 'gas', hold: 2 },
  { id: 'q_evap', type: 'quiz', badge: '💨', title: 'Name That Change', task: 'When a liquid turns into a gas, it is called...', options: ['condensation', 'freezing', 'evaporation'], answer: 2 },
  { id: 'condense', type: 'do', badge: '🌧️', title: 'Cloud Maker', task: 'Turn the steam BACK into liquid water (this is condensation!).', check: (s) => s.state === 'liquid' && s.cameFrom === 'gas', hold: 1.5 },
  { id: 'q_gas', type: 'quiz', badge: '🎈', title: 'Space Filler', task: 'Which state of matter spreads out to fill its whole container?', options: ['solid', 'liquid', 'gas'], answer: 2 },
];

const rand = (min, max) => min + Math.random() * (max - min);

// ── Component ─────────────────────────────────────────────────────────────────
const MatterLab = ({ studentData, showToast, updateStudentData }) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [temp, setTemp] = useState(20);
  const [stateName, setStateName] = useState('liquid');
  const [flash, setFlash] = useState(null);       // transition callout
  const [completed, setCompleted] = useState([]); // challenge ids
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [holdPct, setHoldPct] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null);

  const tempRef = useRef(20);
  const stateRef = useRef('liquid');
  const cameFromRef = useRef(null);
  const particlesRef = useRef([]);
  const holdRef = useRef(0);
  const challengeRef = useRef(null);
  const completedRef = useRef([]);

  useEffect(() => { tempRef.current = temp; }, [temp]);
  useEffect(() => { challengeRef.current = activeChallenge; }, [activeChallenge]);
  useEffect(() => { completedRef.current = completed; }, [completed]);

  // load saved badges
  useEffect(() => {
    const saved = studentData?.gameProgress?.matterLab?.completed;
    if (Array.isArray(saved)) setCompleted(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persistence ─────────────────────────────────────────────────────────────
  const persist = useCallback((ids) => {
    if (!studentData || !updateStudentData) return;
    Promise.resolve(
      updateStudentData({
        ...studentData,
        gameProgress: {
          ...studentData.gameProgress,
          matterLab: {
            ...studentData.gameProgress?.matterLab,
            completed: ids,
            lastVisited: new Date().toISOString(),
          },
        },
      })
    ).catch((err) => console.error('MatterLab: save failed', err));
  }, [studentData, updateStudentData]);

  const completeChallenge = useCallback((id) => {
    if (completedRef.current.includes(id)) return;
    const ids = [...completedRef.current, id];
    setCompleted(ids);
    persist(ids);
    const ch = CHALLENGES.find((c) => c.id === id);
    showToast?.(`${ch?.badge || '🏅'} Challenge complete: ${ch?.title}!`, 'success');
    if (ids.length === CHALLENGES.length) {
      setTimeout(() => showToast?.('🏆 MATTER MASTER — all lab challenges complete!', 'success'), 900);
    }
    setActiveChallenge(null);
    setHoldPct(0);
    holdRef.current = 0;
  }, [persist, showToast]);

  // ── Particle initialisation ─────────────────────────────────────────────────
  useEffect(() => {
    particlesRef.current = Array.from({ length: N_PARTICLES }, (_, i) => ({
      x: rand(30, VIEW_W - 30),
      y: rand(30, VIEW_H - 30),
      vx: rand(-40, 40),
      vy: rand(-40, 40),
      // lattice slot (8 columns near the bottom-centre)
      lx: VIEW_W / 2 - 4 * 2.6 * PARTICLE_R + (i % 8) * 2.6 * PARTICLE_R + (Math.floor(i / 8) % 2) * PARTICLE_R,
      ly: VIEW_H - 24 - Math.floor(i / 8) * 2.3 * PARTICLE_R,
      jitter: rand(0, Math.PI * 2),
    }));
  }, []);

  // ── Simulation + drawing loop ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf;
    let last = performance.now();
    let running = true;

    const fit = () => {
      const w = wrapRef.current?.clientWidth || VIEW_W;
      const scale = Math.min(w / VIEW_W, 1.2);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = VIEW_W * scale * dpr;
      canvas.height = VIEW_H * scale * dpr;
      canvas.style.width = `${VIEW_W * scale}px`;
      canvas.style.height = `${VIEW_H * scale}px`;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
    };
    fit();
    window.addEventListener('resize', fit);

    const step = (t) => {
      if (!running) return;
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      const T = tempRef.current;
      const state = stateForTemp(T);

      // state-change detection → flash + cameFrom tracking
      if (state !== stateRef.current) {
        const key = `${stateRef.current}>${state}`;
        const tr = TRANSITIONS[key];
        cameFromRef.current = stateRef.current;
        stateRef.current = state;
        setStateName(state);
        if (tr) {
          setFlash(tr);
          setTimeout(() => setFlash(null), 2200);
        }
      }

      // challenge "hold" detection
      const ch = challengeRef.current;
      if (ch && ch.type === 'do') {
        const ok = ch.check({ state, temp: T, cameFrom: cameFromRef.current });
        if (ok) {
          holdRef.current += dt;
          setHoldPct(Math.min(100, (holdRef.current / ch.hold) * 100));
          if (holdRef.current >= ch.hold) completeChallenge(ch.id);
        } else if (holdRef.current > 0) {
          holdRef.current = 0;
          setHoldPct(0);
        }
      }

      // ── physics per state ──
      const ps = particlesRef.current;
      ps.forEach((p) => {
        if (state === 'solid') {
          // spring toward lattice slot + temperature jitter
          p.jitter += dt * (4 + Math.max(0, T + 20) * 0.25);
          const amp = 1 + Math.max(0, T + 20) * 0.06;
          const tx = p.lx + Math.sin(p.jitter) * amp;
          const ty = p.ly + Math.cos(p.jitter * 1.3) * amp;
          p.x += (tx - p.x) * Math.min(1, dt * 6);
          p.y += (ty - p.y) * Math.min(1, dt * 6);
          p.vx = 0; p.vy = 0;
        } else if (state === 'liquid') {
          const speed = 25 + T * 0.9;
          p.vx += rand(-speed, speed) * dt * 3;
          p.vy += (80 * dt) + rand(-speed, speed) * dt * 2; // gravity + wander
          const cap = speed;
          p.vx = Math.max(-cap, Math.min(cap, p.vx));
          p.vy = Math.max(-cap, Math.min(cap, p.vy));
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          // keep liquid pooled in the lower half
          if (p.y < VIEW_H * 0.45) { p.y = VIEW_H * 0.45; p.vy = Math.abs(p.vy) * 0.4; }
        } else {
          const speed = 60 + (T - 100) * 4 + 60;
          const mag = Math.hypot(p.vx, p.vy) || 1;
          p.vx = (p.vx / mag) * speed + rand(-20, 20) * dt;
          p.vy = (p.vy / mag) * speed + rand(-20, 20) * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
        // walls
        if (p.x < PARTICLE_R + 6) { p.x = PARTICLE_R + 6; p.vx = Math.abs(p.vx); }
        if (p.x > VIEW_W - PARTICLE_R - 6) { p.x = VIEW_W - PARTICLE_R - 6; p.vx = -Math.abs(p.vx); }
        if (p.y < PARTICLE_R + 6) { p.y = PARTICLE_R + 6; p.vy = Math.abs(p.vy); }
        if (p.y > VIEW_H - PARTICLE_R - 6) { p.y = VIEW_H - PARTICLE_R - 6; p.vy = -Math.abs(p.vy); }
      });

      // simple particle separation for solid/liquid so they do not overlap
      if (state !== 'gas') {
        for (let i = 0; i < ps.length; i++) {
          for (let j = i + 1; j < ps.length; j++) {
            const a = ps[i], b = ps[j];
            const dx = b.x - a.x, dy = b.y - a.y;
            const d2 = dx * dx + dy * dy;
            const min = PARTICLE_R * 2 * 0.9;
            if (d2 > 0 && d2 < min * min) {
              const d = Math.sqrt(d2);
              const push = (min - d) / 2;
              const ux = dx / d, uy = dy / d;
              if (state === 'liquid') {
                a.x -= ux * push; a.y -= uy * push;
                b.x += ux * push; b.y += uy * push;
              }
            }
          }
        }
      }

      // ── draw ──
      const info = STATE_INFO[state];
      const bgTop = state === 'gas' ? '#2b1512' : state === 'solid' ? '#0c1f33' : '#0e1a2e';
      const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      grad.addColorStop(0, bgTop);
      grad.addColorStop(1, '#060b14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // beaker walls
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 4;
      ctx.strokeRect(3, 3, VIEW_W - 6, VIEW_H - 6);

      // particles
      ps.forEach((p) => {
        const hue = state === 'gas' ? 14 : info.hue;
        const light = state === 'solid' ? 75 : state === 'liquid' ? 62 : 60;
        ctx.beginPath();
        ctx.arc(p.x, p.y, PARTICLE_R, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 85%, ${light}%, 0.9)`;
        ctx.shadowColor = `hsl(${hue}, 85%, ${light}%)`;
        ctx.shadowBlur = state === 'gas' ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
    };
  }, [completeChallenge]);

  // ── Quiz answers ────────────────────────────────────────────────────────────
  const answerQuiz = (idx) => {
    const ch = activeChallenge;
    if (!ch || ch.type !== 'quiz') return;
    if (idx === ch.answer) {
      setQuizFeedback({ ok: true, text: '✅ Correct!' });
      setTimeout(() => { setQuizFeedback(null); completeChallenge(ch.id); }, 700);
    } else {
      setQuizFeedback({ ok: false, text: '❌ Not quite — watch the particles and try again!' });
      setTimeout(() => setQuizFeedback(null), 1500);
    }
  };

  const info = STATE_INFO[stateName];
  const allDone = completed.length === CHALLENGES.length;
  const nextChallenge = useMemo(
    () => CHALLENGES.find((c) => !completed.includes(c.id)),
    [completed]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-500 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h2 className="text-2xl font-bold">Matter Lab</h2>
              <p className="text-sky-100 text-sm">Heat and cool real particles — watch matter change state!</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {CHALLENGES.map((c) => (
              <span
                key={c.id}
                title={c.title}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  completed.includes(c.id) ? 'bg-white/90' : 'bg-white/15 grayscale opacity-50'
                }`}
              >
                {c.badge}
              </span>
            ))}
            {allDone && <span className="ml-1 text-xl" title="Matter Master!">🏆</span>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Simulator */}
        <div className="lg:col-span-2 space-y-3" ref={wrapRef}>
          <div className="relative rounded-2xl overflow-hidden ring-2 ring-sky-400/40 shadow-xl">
            <canvas ref={canvasRef} className="block w-full" />
            {/* state chip */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur rounded-xl px-3 py-1.5">
              <p className="text-white font-black text-sm">{info.emoji} {info.label}</p>
            </div>
            {/* temp chip */}
            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur rounded-xl px-3 py-1.5">
              <p className="text-white font-black text-sm">🌡️ {temp}°C</p>
            </div>
            {/* transition flash */}
            {flash && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                <span
                  className="inline-block bg-black/60 backdrop-blur rounded-2xl px-5 py-2 text-lg font-black animate-bounce"
                  style={{ color: flash.color }}
                >
                  {flash.text}
                </span>
              </div>
            )}
          </div>

          {/* Temperature controls */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTemp((t) => Math.max(MIN_TEMP, t - 10))}
                className="px-4 py-2 rounded-xl font-black text-white bg-sky-500 hover:bg-sky-600 transition"
              >
                ❄️ Cool
              </button>
              <input
                type="range"
                min={MIN_TEMP}
                max={MAX_TEMP}
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <button
                onClick={() => setTemp((t) => Math.min(MAX_TEMP, t + 10))}
                className="px-4 py-2 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 transition"
              >
                🔥 Heat
              </button>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1 px-1">
              <span>-20°C</span>
              <span className="text-sky-500">0°C melts</span>
              <span className="text-orange-500">100°C boils</span>
              <span>120°C</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-3">
          {/* particle facts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="font-black text-gray-800 mb-1">{info.emoji} What is happening?</p>
            <p className="text-sm text-gray-600 leading-snug">{info.facts}</p>
          </div>

          {/* challenge card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 text-white shadow">
            <p className="font-black mb-1">🏅 Lab Challenges ({completed.length}/{CHALLENGES.length})</p>
            {allDone ? (
              <p className="text-sm text-indigo-100">🏆 You are a certified MATTER MASTER! Every badge earned.</p>
            ) : activeChallenge ? (
              <div>
                <p className="text-sm font-bold text-yellow-300">{activeChallenge.badge} {activeChallenge.title}</p>
                <p className="text-sm text-indigo-100 mt-1">{activeChallenge.task}</p>
                {activeChallenge.type === 'do' && (
                  <div className="mt-2 h-2.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-300 transition-all" style={{ width: `${holdPct}%` }} />
                  </div>
                )}
                {activeChallenge.type === 'quiz' && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {activeChallenge.options.map((opt, i) => (
                      <button
                        key={opt}
                        onClick={() => answerQuiz(i)}
                        className="text-left text-sm font-semibold bg-white/15 hover:bg-white/30 rounded-lg px-3 py-1.5 transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {quizFeedback && (
                  <p className={`text-sm font-bold mt-2 ${quizFeedback.ok ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {quizFeedback.text}
                  </p>
                )}
                <button
                  onClick={() => { setActiveChallenge(null); setHoldPct(0); holdRef.current = 0; }}
                  className="text-xs text-indigo-200 hover:text-white mt-2"
                >
                  ✕ cancel challenge
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-indigo-100 mb-2">
                  Next up: <b className="text-white">{nextChallenge.badge} {nextChallenge.title}</b>
                </p>
                <button
                  onClick={() => { setActiveChallenge(nextChallenge); setQuizFeedback(null); holdRef.current = 0; setHoldPct(0); }}
                  className="w-full bg-yellow-400 text-indigo-900 font-black rounded-xl px-4 py-2 hover:bg-yellow-300 transition"
                >
                  Start challenge →
                </button>
              </div>
            )}
          </div>

          {/* change-of-state cheat sheet */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-xs text-gray-600 space-y-1">
            <p className="font-black text-gray-800 text-sm mb-1">🔁 Changes of state</p>
            <p>🧊 → 💧 Melting (at 0°C)</p>
            <p>💧 → 🧊 Freezing (at 0°C)</p>
            <p>💧 → 💨 Evaporating / boiling (at 100°C)</p>
            <p>💨 → 💧 Condensing (cooling below 100°C)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterLab;
