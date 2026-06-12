// components/games/CritterSortGame.js — Critter Sort: Animal Kingdom classification game
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = {
  mammal: {
    label: 'Mammal',
    icon: '🐾',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.55)',
    fact: 'Mammals are warm-blooded, usually have fur or hair, and feed their babies milk.',
  },
  bird: {
    label: 'Bird',
    icon: '🪶',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.55)',
    fact: 'Birds are warm-blooded, have feathers and wings, and almost all lay eggs.',
  },
  reptile: {
    label: 'Reptile',
    icon: '🦎',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.55)',
    fact: 'Reptiles are cold-blooded with dry, scaly skin, and most hatch from eggs on land.',
  },
  amphibian: {
    label: 'Amphibian',
    icon: '🐸',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.55)',
    fact: 'Amphibians start life in water (often as tadpoles) and many move onto land as adults.',
  },
  fish: {
    label: 'Fish',
    icon: '🐟',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.55)',
    fact: 'Fish are cold-blooded animals that live underwater and breathe through gills.',
  },
  insect: {
    label: 'Insect',
    icon: '🐝',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.55)',
    fact: 'Insects have six legs, three main body parts, and often have antennae or wings.',
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

const CREATURES = [
  // Mammals
  { name: 'Lion', emoji: '🦁', category: 'mammal' },
  { name: 'Elephant', emoji: '🐘', category: 'mammal' },
  { name: 'Giraffe', emoji: '🦒', category: 'mammal' },
  { name: 'Zebra', emoji: '🦓', category: 'mammal' },
  { name: 'Kangaroo', emoji: '🦘', category: 'mammal' },
  { name: 'Bat', emoji: '🦇', category: 'mammal' },
  { name: 'Dolphin', emoji: '🐬', category: 'mammal' },
  { name: 'Koala', emoji: '🐨', category: 'mammal' },
  { name: 'Panda', emoji: '🐼', category: 'mammal' },
  { name: 'Camel', emoji: '🐪', category: 'mammal' },
  // Birds
  { name: 'Eagle', emoji: '🦅', category: 'bird' },
  { name: 'Owl', emoji: '🦉', category: 'bird' },
  { name: 'Penguin', emoji: '🐧', category: 'bird' },
  { name: 'Parrot', emoji: '🦜', category: 'bird' },
  { name: 'Flamingo', emoji: '🦩', category: 'bird' },
  { name: 'Peacock', emoji: '🦚', category: 'bird' },
  { name: 'Duck', emoji: '🦆', category: 'bird' },
  { name: 'Chicken', emoji: '🐔', category: 'bird' },
  { name: 'Turkey', emoji: '🦃', category: 'bird' },
  { name: 'Swan', emoji: '🦢', category: 'bird' },
  // Reptiles
  { name: 'Snake', emoji: '🐍', category: 'reptile' },
  { name: 'Crocodile', emoji: '🐊', category: 'reptile' },
  { name: 'Alligator', emoji: '🐊', category: 'reptile' },
  { name: 'Lizard', emoji: '🦎', category: 'reptile' },
  { name: 'Iguana', emoji: '🦎', category: 'reptile' },
  { name: 'Gecko', emoji: '🦎', category: 'reptile' },
  { name: 'Turtle', emoji: '🐢', category: 'reptile' },
  { name: 'Tortoise', emoji: '🐢', category: 'reptile' },
  // Amphibians
  { name: 'Frog', emoji: '🐸', category: 'amphibian' },
  { name: 'Toad', emoji: '🐸', category: 'amphibian' },
  { name: 'Tree Frog', emoji: '🐸', category: 'amphibian' },
  { name: 'Bullfrog', emoji: '🐸', category: 'amphibian' },
  { name: 'Poison Dart Frog', emoji: '🐸', category: 'amphibian' },
  { name: 'Tadpole', emoji: '🐸', category: 'amphibian' },
  // Fish
  { name: 'Salmon', emoji: '🐟', category: 'fish' },
  { name: 'Tuna', emoji: '🐟', category: 'fish' },
  { name: 'Goldfish', emoji: '🐠', category: 'fish' },
  { name: 'Clownfish', emoji: '🐠', category: 'fish' },
  { name: 'Pufferfish', emoji: '🐡', category: 'fish' },
  { name: 'Shark', emoji: '🦈', category: 'fish' },
  { name: 'Catfish', emoji: '🐟', category: 'fish' },
  { name: 'Swordfish', emoji: '🐟', category: 'fish' },
  // Insects
  { name: 'Bee', emoji: '🐝', category: 'insect' },
  { name: 'Butterfly', emoji: '🦋', category: 'insect' },
  { name: 'Ladybug', emoji: '🐞', category: 'insect' },
  { name: 'Ant', emoji: '🐜', category: 'insect' },
  { name: 'Cricket', emoji: '🦗', category: 'insect' },
  { name: 'Beetle', emoji: '🪲', category: 'insect' },
  { name: 'Mosquito', emoji: '🦟', category: 'insect' },
  { name: 'Caterpillar', emoji: '🐛', category: 'insect' },
  { name: 'Grasshopper', emoji: '🦗', category: 'insect' },
  { name: 'Moth', emoji: '🦋', category: 'insect' },
];

const MAX_LIVES = 3;
const LEVEL_UP_EVERY = 6; // correct answers per level
const MAX_LEVEL = 8;

const getTimeLimit = (level) => Math.max(2200, 6500 - (level - 1) * 500);

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const HIGH_SCORE_KEY = 'critter_sort_highscore';

// ── Score popup ──────────────────────────────────────────────────────────────
const ScorePopup = ({ value, id, onDone }) => {
  const positive = value > 0;
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      key={id}
      initial={{ opacity: 1, y: 0, scale: 0.8 }}
      animate={{ opacity: 0, y: -50, scale: 1.3 }}
      transition={{ duration: 0.85, ease: 'easeOut' }}
      className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 font-black text-2xl select-none"
      style={{
        color: positive ? '#86efac' : '#fca5a5',
        textShadow: positive
          ? '0 0 10px rgba(134,239,172,0.9), 0 2px 4px rgba(0,0,0,0.8)'
          : '0 0 10px rgba(252,165,165,0.9), 0 2px 4px rgba(0,0,0,0.8)',
      }}
    >
      {positive ? `+${value}` : value}
    </motion.div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const CritterSortGame = () => {
  const [phase, setPhase] = useState('start'); // start | countdown | playing | gameover
  const [countdown, setCountdown] = useState(3);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10); } catch { return 0; }
  });
  const [lives, setLives] = useState(MAX_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [categoryStats, setCategoryStats] = useState(() =>
    CATEGORY_KEYS.reduce((acc, key) => ({ ...acc, [key]: { correct: 0, total: 0 } }), {})
  );

  const [currentCreature, setCurrentCreature] = useState(null);
  const [buttonOrder, setButtonOrder] = useState(CATEGORY_KEYS);
  const [timeLimit, setTimeLimit] = useState(getTimeLimit(1));
  const [timeLeft, setTimeLeft] = useState(getTimeLimit(1));
  const [feedback, setFeedback] = useState(null);
  const [shake, setShake] = useState(false);
  const [popups, setPopups] = useState([]);
  const [roundId, setRoundId] = useState(0);

  // Refs mirroring state for use inside stable callbacks
  const levelRef = useRef(1);
  const streakRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const scoreRef = useRef(0);
  const currentCreatureRef = useRef(null);
  const timeLimitRef = useRef(getTimeLimit(1));
  const settledRef = useRef(false);
  const popupIdRef = useRef(0);
  const intervalRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { streakRef.current = streak; }, [streak]);
  useEffect(() => { livesRef.current = lives; }, [lives]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { currentCreatureRef.current = currentCreature; }, [currentCreature]);
  useEffect(() => { timeLimitRef.current = timeLimit; }, [timeLimit]);

  // ── Round management ─────────────────────────────────────────────────────
  const startRound = useCallback(() => {
    clearTimeout(feedbackTimeoutRef.current);
    setFeedback(null);
    setShake(false);

    const prev = currentCreatureRef.current;
    let next = CREATURES[Math.floor(Math.random() * CREATURES.length)];
    // Avoid immediate repeats of the exact same creature
    let attempts = 0;
    while (prev && next.name === prev.name && attempts < 10) {
      next = CREATURES[Math.floor(Math.random() * CREATURES.length)];
      attempts++;
    }

    const lvl = levelRef.current;
    const tLimit = getTimeLimit(lvl);

    settledRef.current = false;
    setCurrentCreature(next);
    setButtonOrder(shuffle(CATEGORY_KEYS));
    setTimeLimit(tLimit);
    setTimeLeft(tLimit);
    setRoundId((id) => id + 1);
  }, []);

  // ── Answer handling ───────────────────────────────────────────────────────
  const handleAnswer = useCallback((chosenKey) => {
    if (settledRef.current) return;
    const creature = currentCreatureRef.current;
    if (!creature) return;
    settledRef.current = true;
    clearInterval(intervalRef.current);

    const correct = chosenKey === creature.category;
    const lvl = levelRef.current;
    const tLimit = timeLimitRef.current;

    setTotalAnswered((c) => c + 1);
    setCategoryStats((prev) => ({
      ...prev,
      [creature.category]: {
        correct: prev[creature.category].correct + (correct ? 1 : 0),
        total: prev[creature.category].total + 1,
      },
    }));

    if (correct) {
      const newStreak = streakRef.current + 1;
      const speedBonus = timeLeft / tLimit > 0.5 ? 5 : 0;
      const streakBonus = Math.min(newStreak - 1, 9) * 2;
      const milestoneBonus = newStreak > 0 && newStreak % 5 === 0 ? 15 : 0;
      const earned = 10 + (lvl - 1) * 2 + streakBonus + speedBonus + milestoneBonus;

      setScore((s) => s + earned);
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      setTotalCorrect((c) => {
        const newTotal = c + 1;
        const newLevel = Math.min(MAX_LEVEL, Math.floor(newTotal / LEVEL_UP_EVERY) + 1);
        setLevel(newLevel);
        return newTotal;
      });

      const pid = ++popupIdRef.current;
      setPopups((p) => [...p, { id: pid, value: earned }]);

      setFeedback({
        type: 'correct',
        category: creature.category,
        creature,
        milestone: milestoneBonus > 0 ? newStreak : 0,
        earned,
      });
    } else {
      setStreak(0);
      setShake(true);
      setLives((l) => {
        const remaining = Math.max(0, l - 1);
        livesRef.current = remaining;
        return remaining;
      });

      setFeedback({
        type: chosenKey ? 'wrong' : 'timeout',
        category: creature.category,
        creature,
        chosen: chosenKey,
      });
    }
  }, [timeLeft]);

  // ── Countdown ─────────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    setCountdown(3);
    let c = 3;
    const iv = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(iv);
        beginGame();
      }
    }, 800);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const beginGame = useCallback(() => {
    setScore(0);
    setLives(MAX_LIVES);
    livesRef.current = MAX_LIVES;
    setStreak(0);
    setBestStreak(0);
    setLevel(1);
    setTotalCorrect(0);
    setTotalAnswered(0);
    setCategoryStats(CATEGORY_KEYS.reduce((acc, key) => ({ ...acc, [key]: { correct: 0, total: 0 } }), {}));
    setPopups([]);
    setCurrentCreature(null);
    setPhase('playing');
    setTimeout(() => startRound(), 50);
  }, [startRound]);

  // ── Game over check ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    if (lives <= 0) {
      clearInterval(intervalRef.current);
      clearTimeout(feedbackTimeoutRef.current);
      const finalScore = scoreRef.current;
      setHighScore((hs) => {
        const newHs = Math.max(hs, finalScore);
        try { localStorage.setItem(HIGH_SCORE_KEY, String(newHs)); } catch {}
        return newHs;
      });
      const t = setTimeout(() => setPhase('gameover'), feedback ? 1500 : 0);
      return () => clearTimeout(t);
    }
  }, [lives, phase, feedback]);

  // ── Advance to next round after feedback ────────────────────────────────
  useEffect(() => {
    if (!feedback || phase !== 'playing') return;
    if (livesRef.current <= 0) return; // game over effect handles this
    feedbackTimeoutRef.current = setTimeout(() => {
      startRound();
    }, feedback.type === 'correct' ? 1300 : 1900);
    return () => clearTimeout(feedbackTimeoutRef.current);
  }, [feedback, phase, startRound]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing' || !currentCreature) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const next = t - 100;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          handleAnswer(null);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [phase, currentCreature, roundId, handleAnswer]);

  // ── Keyboard support (desktop) ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKey = (e) => {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < buttonOrder.length && !feedback) {
        handleAnswer(buttonOrder[idx]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, buttonOrder, feedback, handleAnswer]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const timerPercent = timeLimit > 0 ? (timeLeft / timeLimit) * 100 : 0;
  const timerColor = timerPercent > 50 ? '#4ade80' : timerPercent > 25 ? '#fbbf24' : '#f87171';

  // ── START SCREEN ─────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-center max-w-xl w-full"
        >
          <div className="text-7xl mb-3 animate-bounce">🦁</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2" style={{ textShadow: '0 0 30px rgba(45,212,191,0.7)' }}>
            Critter Sort
          </h1>
          <p className="text-emerald-200 text-base sm:text-lg mb-6">
            Sort each creature into its animal class before the timer runs out!
          </p>

          {/* Category legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 text-left">
            {CATEGORY_KEYS.map((key) => {
              const cfg = CATEGORIES[key];
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-xl p-2.5"
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${cfg.color}55` }}
                >
                  <span className="text-2xl">{cfg.icon}</span>
                  <div className="text-white font-bold text-sm">{cfg.label}</div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(45,212,191,0.3)' }}>
            <div className="text-emerald-300 font-bold text-sm mb-1">🎮 How to play</div>
            <ul className="text-emerald-100 text-sm space-y-1 list-disc list-inside">
              <li>Tap the correct animal class for each creature</li>
              <li>You have {MAX_LIVES} lives — wrong guesses or timeouts cost one</li>
              <li>Build a streak for bonus points, and answer fast for a speed bonus!</li>
              <li>The clock gets faster as you level up</li>
            </ul>
          </div>

          {highScore > 0 && (
            <div className="mb-6 text-emerald-300 font-semibold text-lg">
              🏆 High Score: <span className="text-yellow-400 font-black">{highScore}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={startCountdown}
            className="px-12 py-4 rounded-2xl text-white text-2xl font-black shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #0d9488, #059669)',
              boxShadow: '0 0 30px rgba(13,148,136,0.5)',
            }}
          >
            Play Now! 🌿
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── COUNTDOWN SCREEN ─────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
            className="text-center"
          >
            <div className="font-black" style={{ fontSize: 120, color: '#2dd4bf', textShadow: '0 0 60px rgba(45,212,191,0.9)' }}>
              {countdown <= 0 ? 'GO!' : countdown}
            </div>
          </motion.div>
        </AnimatePresence>
        <p className="text-emerald-300 text-xl mt-4">Get ready to sort! 🦋</p>
      </div>
    );
  }

  // ── GAME OVER SCREEN ─────────────────────────────────────────────────────
  if (phase === 'gameover') {
    const isNewHigh = score >= highScore && score > 0;
    const grade =
      score >= 600 ? { label: 'LEGENDARY', color: '#fbbf24', emoji: '👑' }
      : score >= 400 ? { label: 'AMAZING', color: '#a78bfa', emoji: '🌟' }
      : score >= 250 ? { label: 'GREAT', color: '#60a5fa', emoji: '🎉' }
      : score >= 120 ? { label: 'GOOD', color: '#86efac', emoji: '👍' }
      : { label: 'KEEP TRYING!', color: '#f9a8d4', emoji: '💪' };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-7xl mb-2">{grade.emoji}</div>
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

          <div className="rounded-2xl p-5 mb-4 mt-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(45,212,191,0.3)' }}>
            <div className="text-6xl font-black text-white mb-1">{score}</div>
            <div className="text-emerald-300 text-sm mb-4">points scored</div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">{totalCorrect}</div>
                <div className="text-xs text-emerald-300">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{accuracy}%</div>
                <div className="text-xs text-emerald-300">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">{bestStreak}</div>
                <div className="text-xs text-emerald-300">Best Streak</div>
              </div>
            </div>
            {highScore > 0 && (
              <div className="mt-3 text-emerald-400 text-sm">
                Best: <span className="text-yellow-400 font-bold">{highScore}</span>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl p-4 mb-6 text-left" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="text-emerald-300 font-bold text-xs uppercase tracking-wider mb-2">Class Breakdown</div>
            <div className="space-y-1.5">
              {CATEGORY_KEYS.map((key) => {
                const stat = categoryStats[key];
                const cfg = CATEGORIES[key];
                const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-lg w-6 text-center">{cfg.icon}</span>
                    <span className="text-white text-xs w-20 flex-shrink-0">{cfg.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct ?? 0}%`, background: cfg.color, transition: 'width 0.6s ease-out' }}
                      />
                    </div>
                    <span className="text-xs text-emerald-200 w-16 text-right flex-shrink-0">
                      {stat.total > 0 ? `${stat.correct}/${stat.total}` : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCountdown}
              className="px-8 py-3 rounded-xl text-white font-bold text-lg shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0d9488, #059669)', boxShadow: '0 0 20px rgba(13,148,136,0.4)' }}
            >
              Play Again 🌿
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase('start')}
              className="px-8 py-3 rounded-xl font-bold text-lg"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#99f6e4', border: '1px solid rgba(45,212,191,0.4)' }}
            >
              Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING SCREEN ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 select-none overflow-hidden px-4 py-4">
      {/* HUD */}
      <div className="w-full max-w-xl mb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Lives */}
          <div className="flex flex-col items-start">
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Lives</div>
            <div className="text-xl">
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <span key={i}>{i < lives ? '❤️' : '🤍'}</span>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Score</div>
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

          {/* Level / Best */}
          <div className="text-right">
            <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Level</div>
            <div className="text-xl font-black text-teal-300">{level}</div>
            <div className="text-xs text-emerald-400">Best: {highScore}</div>
          </div>
        </div>

        {/* Streak banner */}
        <AnimatePresence>
          {streak >= 2 && !feedback && (
            <motion.div
              key={streak}
              initial={{ opacity: 0, y: -8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-center font-black text-sm mb-1"
              style={{ color: streak >= 5 ? '#fbbf24' : '#5eead4', textShadow: '0 0 8px currentColor' }}
            >
              {streak >= 5 ? `🔥 ${streak} in a row! Bonus points!` : `⚡ ${streak} streak!`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer bar */}
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{ background: timerColor, width: `${Math.max(0, timerPercent)}%`, transition: 'width 0.1s linear, background 0.3s' }}
          />
        </div>
      </div>

      {/* Creature card */}
      <div className="relative w-full max-w-xl flex-1 flex flex-col items-center justify-center">
        <AnimatePresence>
          {popups.map((p) => (
            <ScorePopup key={p.id} id={p.id} value={p.value} onDone={() => setPopups((prev) => prev.filter((pp) => pp.id !== p.id))} />
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {currentCreature && !feedback && (
            <motion.div
              key={roundId}
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={shake
                ? { scale: 1, opacity: 1, rotate: 0, x: [0, -12, 12, -8, 8, 0] }
                : { scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={shake ? { duration: 0.4 } : { type: 'spring', stiffness: 260, damping: 18 }}
              className="flex flex-col items-center justify-center rounded-3xl mb-6"
              style={{
                width: 220,
                height: 220,
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(45,212,191,0.35)',
                boxShadow: '0 0 40px rgba(45,212,191,0.25)',
              }}
            >
              <div style={{ fontSize: 92, lineHeight: 1 }}>{currentCreature.emoji}</div>
              <div className="text-white font-black text-xl mt-3 px-2 text-center">{currentCreature.name}</div>
            </motion.div>
          )}

          {feedback && (
            <motion.div
              key="feedback"
              initial={{ scale: 0.85, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex flex-col items-center justify-center rounded-3xl mb-6 px-5 py-6 text-center"
              style={{
                width: '100%',
                maxWidth: 360,
                minHeight: 220,
                background: feedback.type === 'correct' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `2px solid ${feedback.type === 'correct' ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)'}`,
                boxShadow: feedback.type === 'correct' ? '0 0 40px rgba(74,222,128,0.25)' : '0 0 40px rgba(248,113,113,0.25)',
              }}
            >
              <div style={{ fontSize: 56 }}>{feedback.creature.emoji}</div>
              <div className="font-black text-lg mt-2" style={{ color: feedback.type === 'correct' ? '#86efac' : '#fca5a5' }}>
                {feedback.type === 'correct' && '✅ Correct!'}
                {feedback.type === 'wrong' && '❌ Not quite!'}
                {feedback.type === 'timeout' && "⏰ Time's up!"}
              </div>
              <div className="text-white font-bold mt-1">
                {feedback.creature.name} is {feedback.type === 'correct' ? 'a' : 'actually a'}{' '}
                <span style={{ color: CATEGORIES[feedback.category].color }}>
                  {CATEGORIES[feedback.category].icon} {CATEGORIES[feedback.category].label}
                </span>
              </div>
              <div className="text-emerald-100 text-sm mt-2 leading-relaxed">
                {CATEGORIES[feedback.category].fact}
              </div>
              {feedback.milestone > 0 && (
                <div className="mt-2 text-yellow-300 font-bold text-sm">🔥 {feedback.milestone} streak bonus! +15</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
          {buttonOrder.map((key, idx) => {
            const cfg = CATEGORIES[key];
            const disabled = !!feedback;
            return (
              <motion.button
                key={key}
                whileHover={!disabled ? { scale: 1.04 } : {}}
                whileTap={!disabled ? { scale: 0.96 } : {}}
                onClick={() => !disabled && handleAnswer(key)}
                disabled={disabled}
                className="flex items-center justify-center gap-2 rounded-xl px-3 py-3.5 font-bold text-base touch-manipulation"
                style={{
                  background: disabled ? 'rgba(255,255,255,0.04)' : `${cfg.color}22`,
                  border: `2px solid ${disabled ? 'rgba(255,255,255,0.08)' : cfg.color}`,
                  color: disabled ? 'rgba(255,255,255,0.35)' : '#ffffff',
                  opacity: disabled ? 0.6 : 1,
                  transition: 'background 0.2s, opacity 0.2s',
                }}
              >
                <span className="text-2xl">{cfg.icon}</span>
                <span>{cfg.label}</span>
                <span className="hidden sm:inline text-xs opacity-50 ml-auto">{idx + 1}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <p className="text-emerald-400 text-xs text-center mt-3 px-4">
        Tap the animal class this creature belongs to. Streaks of 5 earn bonus points — keep it going!
      </p>
    </div>
  );
};

export default CritterSortGame;
