// components/games/WhackAMoleGame.js — Whack-a-Mole
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────
const GRID_COLS = 4;
const GRID_ROWS = 3;
const HOLE_COUNT = GRID_COLS * GRID_ROWS; // 12 holes
const GAME_DURATION = 60; // seconds

// How long each mole stays visible (decreases with level)
const getMoleDuration = (level) => Math.max(600, 1500 - level * 80);
// How often new moles appear (ms between spawns)
const getSpawnInterval = (level) => Math.max(400, 900 - level * 40);

const MOLE_TYPES = {
  normal:  { points: 10,  prob: 0.70, emoji: '🐹', color: '#a78bfa', glow: 'rgba(167,139,250,0.5)',  label: '+10' },
  fast:    { points: 15,  prob: 0.15, emoji: '🐭', color: '#60a5fa', glow: 'rgba(96,165,250,0.5)',   label: '+15' },
  golden:  { points: 50,  prob: 0.08, emoji: '⭐', color: '#fbbf24', glow: 'rgba(251,191,36,0.7)',   label: '+50' },
  bomb:    { points: -20, prob: 0.07, emoji: '💣', color: '#f87171', glow: 'rgba(248,113,113,0.5)',  label: '-20' },
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1800];

function pickMoleType() {
  const r = Math.random();
  let cumulative = 0;
  for (const [key, cfg] of Object.entries(MOLE_TYPES)) {
    cumulative += cfg.prob;
    if (r < cumulative) return key;
  }
  return 'normal';
}

// ── Particle Effect Component ──────────────────────────────────────────────────
const ScorePopup = ({ value, x, y, id, onDone }) => {
  const isPositive = value > 0;
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.4 }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
      className="pointer-events-none absolute z-50 font-black text-xl select-none"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        color: isPositive ? '#fbbf24' : '#f87171',
        textShadow: isPositive
          ? '0 0 8px rgba(251,191,36,0.9), 0 2px 4px rgba(0,0,0,0.8)'
          : '0 0 8px rgba(248,113,113,0.9), 0 2px 4px rgba(0,0,0,0.8)',
      }}
    >
      {isPositive ? `+${value}` : value}
    </motion.div>
  );
};

// ── Mole Hole Component ────────────────────────────────────────────────────────
const MoleHole = ({ hole, onWhack }) => {
  const { active, moleType, hitAt } = hole;
  const cfg = moleType ? MOLE_TYPES[moleType] : null;
  const isHit = !!hitAt;

  const handleClick = (e) => {
    e.preventDefault();
    if (active && !isHit) {
      onWhack(hole.id);
    }
  };

  return (
    <div
      className="relative flex flex-col items-center justify-end select-none"
      style={{ height: 110 }}
    >
      {/* Dirt mound / hole base */}
      <div
        className="absolute bottom-0 w-full"
        style={{ height: 38, zIndex: 1 }}
      >
        {/* Hole shadow */}
        <div
          className="absolute left-1/2 bottom-2"
          style={{
            transform: 'translateX(-50%)',
            width: '78%',
            height: 22,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 75%)',
          }}
        />
        {/* Dirt mound */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{
            height: 28,
            background: 'linear-gradient(180deg, #92400e 0%, #78350f 100%)',
            borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.25)',
          }}
        />
        {/* Hole opening */}
        <div
          className="absolute left-1/2"
          style={{
            transform: 'translateX(-50%)',
            bottom: 14,
            width: '60%',
            height: 18,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, #1c0a00 30%, #3d1a00 100%)',
            zIndex: 2,
          }}
        />
      </div>

      {/* Mole — slides up/down from behind the mound */}
      <AnimatePresence>
        {active && (
          <motion.button
            key={`mole-${hole.id}-${hole.spawnAt}`}
            initial={{ y: 60, opacity: 0 }}
            animate={isHit ? { y: 60, opacity: 0, scale: 0.6 } : { y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.8 }}
            transition={
              isHit
                ? { duration: 0.18, ease: 'easeIn' }
                : { type: 'spring', stiffness: 320, damping: 22 }
            }
            onClick={handleClick}
            onTouchEnd={handleClick}
            className="absolute cursor-pointer focus:outline-none"
            style={{
              bottom: 22,
              zIndex: 3,
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            aria-label={`Whack the ${moleType} mole`}
          >
            <div
              className="flex flex-col items-center justify-center rounded-full"
              style={{
                width: 66,
                height: 66,
                background: `radial-gradient(circle at 38% 38%, ${cfg?.color || '#a78bfa'}, #312e81)`,
                boxShadow: `0 0 18px ${cfg?.glow || 'rgba(167,139,250,0.5)'}, 0 4px 8px rgba(0,0,0,0.5)`,
                border: `3px solid ${cfg?.color || '#a78bfa'}`,
                fontSize: 30,
                transition: 'transform 0.08s',
                transform: isHit ? 'scale(0.75) rotate(-15deg)' : 'scale(1)',
              }}
            >
              {cfg?.emoji || '🐹'}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main Game Component ────────────────────────────────────────────────────────
const WhackAMoleGame = () => {
  const [phase, setPhase] = useState('start'); // 'start' | 'countdown' | 'playing' | 'gameover'
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('wam_highscore') || '0', 10); } catch { return 0; }
  });
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [holes, setHoles] = useState(() =>
    Array.from({ length: HOLE_COUNT }, (_, i) => ({
      id: i,
      active: false,
      moleType: null,
      spawnAt: 0,
      hitAt: null,
    }))
  );
  const [combo, setCombo] = useState(0);
  const [popups, setPopups] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);
  const [level, setLevel] = useState(1);

  const scoreRef = useRef(0);
  const holesRef = useRef(holes);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const comboTimerRef = useRef(null);
  const popupIdRef = useRef(0);
  const containerRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { holesRef.current = holes; }, [holes]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Level based on score
  useEffect(() => {
    const lv = LEVEL_THRESHOLDS.findLastIndex((t) => score >= t) + 1;
    setLevel(Math.min(lv, 7));
  }, [score]);

  // ── Whack handler ────────────────────────────────────────────────────────────
  const handleWhack = useCallback((holeId) => {
    const hole = holesRef.current[holeId];
    if (!hole?.active || hole.hitAt) return;

    const cfg = MOLE_TYPES[hole.moleType];
    const newCombo = hole.moleType === 'bomb' ? 0 : combo + 1;
    const comboMultiplier = hole.moleType === 'bomb' ? 1 : Math.min(newCombo, 5);
    const earned = hole.moleType === 'bomb' ? cfg.points : cfg.points * comboMultiplier;

    // Update score
    setScore((s) => Math.max(0, s + earned));

    // Update holes (mark as hit)
    setHoles((prev) =>
      prev.map((h) => (h.id === holeId ? { ...h, hitAt: Date.now() } : h))
    );

    // Update combo
    if (hole.moleType === 'bomb') {
      setCombo(0);
    } else {
      setCombo(newCombo);
      clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setCombo(0), 1200);
    }

    // Track hits/misses
    setTotalHits((h) => h + 1);

    // Score popup — figure out position from container
    const container = containerRef.current;
    const col = holeId % GRID_COLS;
    const row = Math.floor(holeId / GRID_COLS);
    if (container) {
      const rect = container.getBoundingClientRect();
      const holeW = rect.width / GRID_COLS;
      const holeH = 110;
      const px = (col + 0.5) * holeW;
      const py = row * holeH + 30;
      const pid = ++popupIdRef.current;
      setPopups((p) => [...p, { id: pid, value: earned, x: px, y: py }]);
    }
  }, [combo]);

  // ── Spawn moles ──────────────────────────────────────────────────────────────
  const spawnMole = useCallback(() => {
    const cur = holesRef.current;
    const inactive = cur.filter((h) => !h.active);
    if (inactive.length === 0) return;

    const hole = inactive[Math.floor(Math.random() * inactive.length)];
    const type = pickMoleType();
    const duration = getMoleDuration(level);

    setHoles((prev) =>
      prev.map((h) =>
        h.id === hole.id
          ? { ...h, active: true, moleType: type, spawnAt: Date.now(), hitAt: null }
          : h
      )
    );

    // Auto-hide mole after duration if not whacked
    setTimeout(() => {
      setHoles((prev) =>
        prev.map((h) => {
          if (h.id !== hole.id || !h.active) return h;
          // Mole escaped (not hit) → increment misses
          if (!h.hitAt && h.moleType !== 'bomb') {
            setTotalMisses((m) => m + 1);
          }
          return { ...h, active: false, moleType: null, hitAt: null };
        })
      );
    }, duration);
  }, [level]);

  // ── Start game sequence ──────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        startGame();
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startGame = useCallback(() => {
    setPhase('playing');
    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setTotalHits(0);
    setTotalMisses(0);
    setLevel(1);
    setPopups([]);
    setHoles(Array.from({ length: HOLE_COUNT }, (_, i) => ({
      id: i, active: false, moleType: null, spawnAt: 0, hitAt: null,
    })));
  }, []);

  // ── Spawn loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    const scheduleNext = () => {
      const delay = getSpawnInterval(level);
      spawnTimerRef.current = setTimeout(() => {
        spawnMole();
        scheduleNext();
      }, delay);
    };

    // Initial spawns
    spawnMole();
    spawnMole();
    scheduleNext();

    return () => clearTimeout(spawnTimerRef.current);
  }, [phase, level, spawnMole]);

  // ── Game countdown timer ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(gameTimerRef.current);
          clearTimeout(spawnTimerRef.current);
          // End game
          setTimeout(() => {
            const finalScore = scoreRef.current;
            setHighScore((hs) => {
              const newHs = Math.max(hs, finalScore);
              try { localStorage.setItem('wam_highscore', String(newHs)); } catch {}
              return newHs;
            });
            setHoles(Array.from({ length: HOLE_COUNT }, (_, i) => ({
              id: i, active: false, moleType: null, spawnAt: 0, hitAt: null,
            })));
            setPhase('gameover');
          }, 200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(gameTimerRef.current);
  }, [phase]);

  // ── Keyboard hit (spacebar = whack any visible mole) ─────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        const visible = holesRef.current.filter((h) => h.active && !h.hitAt);
        if (visible.length > 0) {
          handleWhack(visible[Math.floor(Math.random() * visible.length)].id);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleWhack]);

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(spawnTimerRef.current);
      clearInterval(gameTimerRef.current);
      clearTimeout(comboTimerRef.current);
    };
  }, []);

  // Derived values
  const accuracy = totalHits + totalMisses > 0
    ? Math.round((totalHits / (totalHits + totalMisses)) * 100)
    : 0;

  const timerPercent = (timeLeft / GAME_DURATION) * 100;
  const timerColor = timeLeft > 20 ? '#818cf8' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

  // ── RENDER ────────────────────────────────────────────────────────────────────

  // Start screen
  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center max-w-lg w-full"
        >
          <div className="text-8xl mb-4 animate-bounce">🔨</div>
          <h1 className="text-5xl font-black text-white mb-2" style={{ textShadow: '0 0 30px rgba(167,139,250,0.8)' }}>
            Whack-a-Mole!
          </h1>
          <p className="text-indigo-300 text-lg mb-8">
            Tap or click the moles before they hide! Watch out for bombs 💣
          </p>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {Object.entries(MOLE_TYPES).map(([key, cfg]) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${cfg.color}44` }}
              >
                <span className="text-3xl">{cfg.emoji}</span>
                <div>
                  <div className="text-white font-bold capitalize">{key} Mole</div>
                  <div className="font-semibold" style={{ color: cfg.points > 0 ? '#86efac' : '#fca5a5' }}>
                    {cfg.points > 0 ? `+${cfg.points}` : cfg.points} pts
                  </div>
                </div>
              </div>
            ))}
          </div>

          {highScore > 0 && (
            <div className="mb-6 text-indigo-300 font-semibold text-lg">
              🏆 High Score: <span className="text-yellow-400 font-black">{highScore}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={startCountdown}
            className="px-12 py-4 rounded-2xl text-white text-2xl font-black shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 0 30px rgba(124,58,237,0.5)',
            }}
          >
            Play Now! 🎮
          </motion.button>

          <p className="mt-4 text-indigo-400 text-sm">
            You have <strong className="text-indigo-200">60 seconds</strong> — build combos for bigger scores!
          </p>
        </motion.div>
      </div>
    );
  }

  // Countdown screen
  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.45, type: 'spring', stiffness: 300 }}
            className="text-center"
          >
            <div
              className="font-black"
              style={{ fontSize: 120, color: '#a78bfa', textShadow: '0 0 60px rgba(167,139,250,0.9)' }}
            >
              {countdown === 0 ? 'GO!' : countdown}
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="text-indigo-300 text-xl mt-4">Get ready to whack! 🔨</p>
      </div>
    );
  }

  // Game over screen
  if (phase === 'gameover') {
    const isNewHigh = score >= highScore && score > 0;
    const grade =
      score >= 1000 ? { label: 'LEGENDARY', color: '#fbbf24', emoji: '👑' }
      : score >= 700 ? { label: 'AMAZING', color: '#a78bfa', emoji: '🌟' }
      : score >= 400 ? { label: 'GREAT', color: '#60a5fa', emoji: '🎉' }
      : score >= 200 ? { label: 'GOOD', color: '#86efac', emoji: '👍' }
      : { label: 'KEEP TRYING!', color: '#f9a8d4', emoji: '💪' };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-7xl mb-3">{grade.emoji}</div>
          <h2 className="font-black text-4xl mb-1" style={{ color: grade.color, textShadow: `0 0 20px ${grade.color}88` }}>
            {grade.label}
          </h2>
          {isNewHigh && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-yellow-400 font-bold text-lg mb-2"
            >
              🏆 New High Score!
            </motion.div>
          )}

          <div
            className="rounded-2xl p-6 mb-6 mt-4"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(167,139,250,0.3)' }}
          >
            <div className="text-6xl font-black text-white mb-1">{score}</div>
            <div className="text-indigo-300 text-sm mb-4">points scored</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{totalHits}</div>
                <div className="text-xs text-indigo-300">Hits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">{totalMisses}</div>
                <div className="text-xs text-indigo-300">Misses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{accuracy}%</div>
                <div className="text-xs text-indigo-300">Accuracy</div>
              </div>
            </div>
            {highScore > 0 && (
              <div className="mt-3 text-indigo-400 text-sm">
                Best: <span className="text-yellow-400 font-bold">{highScore}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCountdown}
              className="px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
            >
              Play Again 🔨
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('start')}
              className="px-8 py-3 rounded-xl font-bold text-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.4)' }}
            >
              Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Playing ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 select-none overflow-hidden"
      style={{ paddingTop: 12, paddingBottom: 12 }}
    >
      {/* HUD */}
      <div className="w-full max-w-2xl px-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Score */}
          <div className="text-center">
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Score</div>
            <motion.div
              key={score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.15 }}
              className="text-3xl font-black text-white"
            >
              {score}
            </motion.div>
          </div>

          {/* Timer ring */}
          <div className="flex flex-col items-center">
            <svg width={72} height={72} viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
              <circle
                cx={36} cy={36} r={30}
                fill="none"
                stroke={timerColor}
                strokeWidth={6}
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - timerPercent / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
              />
            </svg>
            <div
              className="absolute font-black text-xl"
              style={{ color: timerColor, marginTop: 24, textShadow: `0 0 10px ${timerColor}88` }}
            >
              {timeLeft}
            </div>
          </div>

          {/* Best / Level */}
          <div className="text-center">
            <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Best</div>
            <div className="text-2xl font-black text-yellow-400">{highScore}</div>
            <div className="text-xs text-indigo-400">Lv {level}</div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${timerColor}, #818cf8)`, width: `${timerPercent}%`, transition: 'width 0.9s linear' }}
          />
        </div>

        {/* Combo banner */}
        <AnimatePresence>
          {combo >= 2 && (
            <motion.div
              key={combo}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 text-center font-black text-sm"
              style={{ color: combo >= 5 ? '#fbbf24' : '#c4b5fd', textShadow: '0 0 8px currentColor' }}
            >
              {combo >= 5 ? '🔥 MAX COMBO x5!' : `⚡ ${combo}x Combo!`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Game Grid */}
      <div
        ref={containerRef}
        className="relative w-full max-w-2xl px-4"
        style={{ userSelect: 'none' }}
      >
        {/* Popups */}
        <AnimatePresence>
          {popups.map((p) => (
            <ScorePopup
              key={p.id}
              id={p.id}
              value={p.value}
              x={p.x}
              y={p.y}
              onDone={() => setPopups((prev) => prev.filter((pp) => pp.id !== p.id))}
            />
          ))}
        </AnimatePresence>

        {/* Grass / ground */}
        <div
          className="absolute inset-x-4 bottom-0 rounded-b-2xl"
          style={{
            height: '60%',
            background: 'linear-gradient(180deg, #166534 0%, #14532d 100%)',
            borderRadius: 16,
            zIndex: 0,
          }}
        />

        {/* Grid */}
        <div
          className="relative grid gap-2 z-10"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        >
          {holes.map((hole) => (
            <MoleHole key={hole.id} hole={hole} onWhack={handleWhack} />
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="mt-4 text-indigo-400 text-xs text-center px-4">
        Click / tap moles to whack them! Avoid 💣 bombs. Build combos for bonus points!
      </p>
    </div>
  );
};

export default WhackAMoleGame;
