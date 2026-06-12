// components/games/FoodChainFrenzyGame.js — Food Chain Frenzy 🌿🦊
// Build the food chain! Drag (or tap) organism cards into order from
// producer → top predator. Spot the decoy that doesn't belong, beat the
// clock, build streaks. Covers real ecosystems with the "energy flows
// from the eaten to the eater" rule.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 6;
const ROUND_TIME = 30; // seconds
const REWARD_SCORE = 600;
const REWARD_COINS = 5;

// Role legend (energy flows upward: producer → apex)
const ROLES = [
  { key: 'producer', label: 'Producer', emoji: '🌱', color: '#22c55e' },
  { key: 'primary', label: 'Primary consumer', emoji: '🐛', color: '#84cc16' },
  { key: 'secondary', label: 'Secondary consumer', emoji: '🐸', color: '#06b6d4' },
  { key: 'tertiary', label: 'Tertiary consumer', emoji: '🦅', color: '#a855f7' },
  { key: 'apex', label: 'Apex predator', emoji: '👑', color: '#f59e0b' },
];

// Each chain: ordered list (producer first → apex last) + a decoy that
// belongs to that ecosystem but NOT this particular chain.
const CHAINS = [
  {
    biome: 'African Savanna',
    emoji: '🦁',
    chain: [
      { name: 'Grass', emoji: '🌾' },
      { name: 'Zebra', emoji: '🦓' },
      { name: 'Lion', emoji: '🦁' },
    ],
    decoy: { name: 'Vulture', emoji: '🦅' },
    fact: 'A lion is an apex predator — nothing in the savanna hunts a healthy adult lion.',
  },
  {
    biome: 'Ocean',
    emoji: '🐋',
    chain: [
      { name: 'Algae', emoji: '🦠' },
      { name: 'Krill', emoji: '🦐' },
      { name: 'Herring', emoji: '🐟' },
      { name: 'Seal', emoji: '🦭' },
      { name: 'Orca', emoji: '🐋' },
    ],
    decoy: { name: 'Seagull', emoji: '🐦' },
    fact: 'Tiny algae power the entire ocean — even the giant orca depends on them!',
  },
  {
    biome: 'Forest',
    emoji: '🦉',
    chain: [
      { name: 'Acorn', emoji: '🌰' },
      { name: 'Mouse', emoji: '🐭' },
      { name: 'Snake', emoji: '🐍' },
      { name: 'Owl', emoji: '🦉' },
    ],
    decoy: { name: 'Deer', emoji: '🦌' },
    fact: 'Owls are top predators of the night, hunting snakes and small mammals.',
  },
  {
    biome: 'Pond',
    emoji: '🐸',
    chain: [
      { name: 'Pondweed', emoji: '🌿' },
      { name: 'Tadpole', emoji: '🐛' },
      { name: 'Frog', emoji: '🐸' },
      { name: 'Heron', emoji: '🦩' },
    ],
    decoy: { name: 'Dragonfly', emoji: '🦋' },
    fact: 'Tadpoles eat pondweed, frogs eat insects, and herons eat the frogs.',
  },
  {
    biome: 'Arctic',
    emoji: '🐻‍❄️',
    chain: [
      { name: 'Phytoplankton', emoji: '🦠' },
      { name: 'Cod', emoji: '🐟' },
      { name: 'Seal', emoji: '🦭' },
      { name: 'Polar Bear', emoji: '🐻‍❄️' },
    ],
    decoy: { name: 'Penguin', emoji: '🐧' },
    fact: 'Polar bears live in the Arctic — penguins live in the Antarctic, so they never meet!',
  },
  {
    biome: 'Grassland',
    emoji: '🦅',
    chain: [
      { name: 'Wheat', emoji: '🌾' },
      { name: 'Grasshopper', emoji: '🦗' },
      { name: 'Frog', emoji: '🐸' },
      { name: 'Hawk', emoji: '🦅' },
    ],
    decoy: { name: 'Cow', emoji: '🐄' },
    fact: 'Energy flows from wheat to grasshopper to frog to hawk — four links!',
  },
  {
    biome: 'Rainforest',
    emoji: '🐆',
    chain: [
      { name: 'Fruit', emoji: '🍌' },
      { name: 'Monkey', emoji: '🐒' },
      { name: 'Jaguar', emoji: '🐆' },
    ],
    decoy: { name: 'Parrot', emoji: '🦜' },
    fact: 'The jaguar is the top predator of the rainforest floor.',
  },
  {
    biome: 'Desert',
    emoji: '🦂',
    chain: [
      { name: 'Cactus', emoji: '🌵' },
      { name: 'Beetle', emoji: '🪲' },
      { name: 'Scorpion', emoji: '🦂' },
      { name: 'Roadrunner', emoji: '🐦' },
    ],
    decoy: { name: 'Camel', emoji: '🐪' },
    fact: 'Roadrunners are fast enough to hunt and eat scorpions!',
  },
  {
    biome: 'Antarctic',
    emoji: '🐧',
    chain: [
      { name: 'Phytoplankton', emoji: '🦠' },
      { name: 'Krill', emoji: '🦐' },
      { name: 'Penguin', emoji: '🐧' },
      { name: 'Leopard Seal', emoji: '🦭' },
    ],
    decoy: { name: 'Polar Bear', emoji: '🐻‍❄️' },
    fact: 'Leopard seals are fierce predators that hunt penguins in the Antarctic.',
  },
  {
    biome: 'River',
    emoji: '🐻',
    chain: [
      { name: 'River Algae', emoji: '🟢' },
      { name: 'Mayfly', emoji: '🦟' },
      { name: 'Salmon', emoji: '🐟' },
      { name: 'Bear', emoji: '🐻' },
    ],
    decoy: { name: 'Otter', emoji: '🦦' },
    fact: 'Bears famously catch salmon swimming upstream in rivers.',
  },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

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
    place: (slot = 0) => tone(440 + slot * 80, 0.1, 'triangle', 0.08),
    pick: () => tone(523, 0.06, 'sine', 0.06),
    remove: () => tone(330, 0.08, 'sine', 0.06, 0, -60),
    tick: () => tone(880, 0.05, 'square', 0.05),
    correct: (streak = 1) => {
      const base = 523;
      const n = Math.min(4, 1 + Math.floor(streak / 2));
      for (let i = 0; i < n; i++) tone(base * Math.pow(1.26, i), 0.18, 'triangle', 0.1, i * 0.09);
    },
    wrong: () => {
      tone(220, 0.25, 'sawtooth', 0.1, 0, -50);
      tone(175, 0.28, 'sawtooth', 0.09, 0.05, -40);
    },
    gameOver: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.12));
    },
    win: () => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, i * 0.1));
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const FoodChainFrenzyGame = ({ studentData, updateStudentData, showToast }) => {
  const synthRef = useRef(null);
  const mutedRef = useRef(false);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('menu'); // menu | playing | roundEnd | over
  const [muted, setMuted] = useState(false);

  const [deck, setDeck] = useState([]); // shuffled chain order for the game
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState(null); // current chain object
  const [tray, setTray] = useState([]); // available cards {id, name, emoji, isDecoy}
  const [slots, setSlots] = useState([]); // placed cards (null = empty)
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [checked, setChecked] = useState(false);
  const [correctness, setCorrectness] = useState([]); // per-slot bool after check
  const [wobble, setWobble] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundResult, setRoundResult] = useState(null);
  const [perfectCount, setPerfectCount] = useState(0);

  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [highScore, setHighScore] = useState(0);

  const idSeq = useRef(1);
  const dragId = useRef(null);

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('foodchain_highscore') || '0', 10));
      const m = localStorage.getItem('foodchain_muted') === '1';
      setMuted(m);
      mutedRef.current = m;
    } catch {}
    synthRef.current = createSynth(mutedRef);
    return () => clearInterval(timerRef.current);
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try {
        localStorage.setItem('foodchain_muted', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  // ── Timer ──
  const stopTimer = () => clearInterval(timerRef.current);
  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(ROUND_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        if (t <= 6) synthRef.current?.tick();
        return t - 1;
      });
    }, 1000);
  }, []);

  // ── Round setup ──
  const beginRound = useCallback(
    (roundNum, currentDeck) => {
      const d = currentDeck || deck;
      const p = d[(roundNum - 1) % d.length];
      const chainCards = p.chain.map((c) => ({ id: idSeq.current++, ...c, isDecoy: false }));
      const decoyCard = { id: idSeq.current++, ...p.decoy, isDecoy: true };
      setPuzzle(p);
      setTray(shuffle([...chainCards, decoyCard]));
      setSlots(new Array(p.chain.length).fill(null));
      setChecked(false);
      setCorrectness([]);
      setRound(roundNum);
      setRoundResult(null);
      setScreen('playing');
      startTimer();
    },
    [deck, startTimer]
  );

  const startGame = () => {
    const newDeck = shuffle(CHAINS);
    setDeck(newDeck);
    setScore(0);
    setStreak(0);
    setPerfectCount(0);
    setFinalStats(null);
    setRewardMsg('');
    synthRef.current?.ensure();
    beginRound(1, newDeck);
  };

  // ── Place / remove cards ──
  const placeInFirstEmpty = (card) => {
    if (checked || screen !== 'playing') return;
    const idx = slots.findIndex((s) => s === null);
    if (idx === -1) return;
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = card;
      return next;
    });
    setTray((prev) => prev.filter((c) => c.id !== card.id));
    synthRef.current?.place(idx);
  };

  const placeInSlot = (card, slotIdx) => {
    if (checked || screen !== 'playing') return;
    setSlots((prev) => {
      const next = [...prev];
      const displaced = next[slotIdx];
      // remove card from any slot it currently occupies
      for (let i = 0; i < next.length; i++) if (next[i] && next[i].id === card.id) next[i] = null;
      next[slotIdx] = card;
      if (displaced && displaced.id !== card.id) {
        setTray((t) => (t.some((c) => c.id === displaced.id) ? t : [...t, displaced]));
      }
      return next;
    });
    setTray((prev) => prev.filter((c) => c.id !== card.id));
    synthRef.current?.place(slotIdx);
  };

  const removeFromSlot = (slotIdx) => {
    if (checked || screen !== 'playing') return;
    const card = slots[slotIdx];
    if (!card) return;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
    setTray((prev) => (prev.some((c) => c.id === card.id) ? prev : [...prev, card]));
    synthRef.current?.remove();
  };

  // ── Drag handlers (HTML5 DnD; tap fallback handled by onClick) ──
  const onDragStart = (card) => {
    dragId.current = card;
  };
  const onDropSlot = (slotIdx) => {
    if (dragId.current) {
      placeInSlot(dragId.current, slotIdx);
      dragId.current = null;
    }
  };
  const onDropTray = () => {
    const card = dragId.current;
    if (card) {
      // if it was in a slot, pull it back to tray
      const inSlot = slots.findIndex((s) => s && s.id === card.id);
      if (inSlot !== -1) removeFromSlot(inSlot);
      dragId.current = null;
    }
  };

  // ── Check answer ──
  const allFilled = slots.length > 0 && slots.every((s) => s !== null);

  const checkChain = useCallback(() => {
    if (!allFilled || checked || !puzzle) return;
    stopTimer();
    setChecked(true);
    // Correct order: slots[i].name should equal puzzle.chain[i].name and not be decoy
    const result = slots.map((card, i) => card && !card.isDecoy && card.name === puzzle.chain[i].name);
    setCorrectness(result);
    const allRight = result.every(Boolean);

    if (allRight) {
      const points = 100 + timeLeft * 5 + streak * 25;
      const newStreak = streak + 1;
      setScore((s) => s + points);
      setStreak(newStreak);
      setPerfectCount((c) => c + 1);
      synthRef.current?.correct(newStreak);
      setRoundResult({ type: 'perfect', points });
    } else {
      const rightCount = result.filter(Boolean).length;
      const points = rightCount * 15;
      setScore((s) => s + points);
      setStreak(0);
      synthRef.current?.wrong();
      setWobble(true);
      setTimeout(() => setWobble(false), 500);
      setRoundResult({ type: 'partial', points, rightCount, total: slots.length });
    }
    setTimeout(() => setScreen('roundEnd'), 900);
  }, [allFilled, checked, puzzle, slots, timeLeft, streak]);

  // Time out → auto check (or zero if empty)
  useEffect(() => {
    if (screen === 'playing' && timeLeft === 0 && !checked && puzzle) {
      if (allFilled) {
        checkChain();
      } else {
        stopTimer();
        setChecked(true);
        setStreak(0);
        synthRef.current?.wrong();
        setRoundResult({ type: 'timeout', points: 0 });
        setTimeout(() => setScreen('roundEnd'), 700);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen, checked, puzzle, allFilled]);

  // ── Game over ──
  const endGame = useCallback(
    (finalScore, perfects) => {
      const reachedReward = finalScore >= REWARD_SCORE;
      synthRef.current?.[reachedReward ? 'win' : 'gameOver']?.();
      setHighScore((prev) => {
        if (finalScore > prev) {
          try {
            localStorage.setItem('foodchain_highscore', String(finalScore));
          } catch {}
          return finalScore;
        }
        return prev;
      });
      setFinalStats({ score: finalScore, perfects });

      setRewardMsg('');
      if (reachedReward && studentData && updateStudentData) {
        const today = new Date().toDateString();
        const last = studentData?.gameProgress?.foodChain?.lastRewardDate;
        if (last !== today) {
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              foodChain: {
                ...studentData.gameProgress?.foodChain,
                lastRewardDate: today,
                bestScore: Math.max(finalScore, studentData.gameProgress?.foodChain?.bestScore || 0),
              },
            },
          })
            .then(() => {
              setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
              showToast?.(`🌿 Food Chain Frenzy reward: +${REWARD_COINS} coins!`, 'success');
            })
            .catch((err) => console.error('Error awarding coins:', err));
        } else {
          setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
        }
      } else if (!reachedReward) {
        setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
      }
      setScreen('over');
    },
    [studentData, updateStudentData, showToast]
  );

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      endGame(score, perfectCount);
    } else {
      beginRound(round + 1, null);
    }
  };

  const quitToMenu = () => {
    stopTimer();
    setScreen('menu');
  };

  // ── UI ──
  return (
    <div className="max-w-3xl mx-auto">
      {/* MENU */}
      {screen === 'menu' && (
        <div className="bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl md:text-7xl mb-2 animate-bounce">🌿</div>
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Food Chain <span className="text-lime-300">Frenzy</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto mt-2">
            Put the organisms in order so energy flows from the <strong>producer</strong> all the way up to the{' '}
            <strong>top predator</strong> — and watch out for the sneaky decoy that doesn't belong!
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90 mt-4">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🌱 Start with the producer</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">⏱️ {ROUND_TIME}s per chain</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🕵️ Leave out the decoy</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">{TOTAL_ROUNDS} ecosystems</span>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-black text-xl px-10 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all mt-6"
          >
            🌎 Start Exploring
          </button>

          <div className="flex items-center justify-center gap-4 text-white/70 text-sm mt-6">
            <span>🏆 High score: <strong className="text-lime-300">{highScore.toLocaleString()}</strong></span>
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
          </div>
        </div>
      )}

      {/* PLAYING + ROUND END */}
      {(screen === 'playing' || screen === 'roundEnd') && puzzle && (
        <div className="bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 rounded-3xl shadow-2xl p-4 md:p-6 relative">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="bg-black/30 rounded-xl px-3 py-2 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/60">Score</div>
              <div className="font-black text-lg leading-none">{score.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-white/60">Round</div>
                <div className="font-black text-lg leading-none">
                  {round}<span className="text-white/50 text-sm">/{TOTAL_ROUNDS}</span>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-white/60">Streak</div>
                <div className="font-black text-lg leading-none text-orange-300">🔥{streak}</div>
              </div>
              <div
                className={`bg-black/30 rounded-xl px-3 py-2 font-black text-lg ${
                  timeLeft <= 6 && screen === 'playing' ? 'text-red-400 animate-pulse' : ''
                }`}
              >
                ⏱️ {timeLeft}s
              </div>
            </div>
            <button
              onClick={quitToMenu}
              className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition-all text-sm"
            >
              ✕
            </button>
          </div>

          {/* Biome banner */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-white">
              <span className="text-2xl">{puzzle.emoji}</span>
              <span className="font-bold">{puzzle.biome}</span>
            </div>
            <p className="text-white/60 text-xs mt-2">Drag or tap cards into order: producer first → top predator last.</p>
          </div>

          {/* Chain slots */}
          <div className={`flex flex-wrap items-stretch justify-center gap-2 mb-5 ${wobble ? 'animate-pulse' : ''}`}>
            {slots.map((card, i) => {
              const isRight = checked && correctness[i];
              const isWrong = checked && !correctness[i];
              return (
                <React.Fragment key={i}>
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => removeFromSlot(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropSlot(i)}
                      className={`w-20 h-24 md:w-24 md:h-28 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isRight
                          ? 'bg-emerald-500/30 border-emerald-400'
                          : isWrong
                            ? 'bg-red-500/25 border-red-400'
                            : card
                              ? 'bg-white/15 border-white/40'
                              : 'bg-black/20 border-dashed border-white/25'
                      }`}
                    >
                      {card ? (
                        <>
                          <span className="text-3xl md:text-4xl">{card.emoji}</span>
                          <span className="text-white text-[11px] md:text-xs font-semibold mt-1 text-center px-1 leading-tight">
                            {card.name}
                          </span>
                          {checked && (
                            <span className="text-sm">{isRight ? '✅' : '❌'}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-white/40 text-2xl font-black">{i + 1}</span>
                      )}
                    </div>
                    <span className="text-white/50 text-[10px] mt-1">
                      {i === 0 ? '🌱 Producer' : i === slots.length - 1 ? '👑 Top' : `Level ${i + 1}`}
                    </span>
                  </div>
                  {i < slots.length - 1 && (
                    <div className="flex items-center text-lime-300 text-2xl font-black self-start mt-8 md:mt-9">→</div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Tray */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDropTray}
            className="bg-black/25 rounded-2xl p-3 min-h-[96px] flex flex-wrap items-center justify-center gap-2 mb-4"
          >
            {tray.length === 0 && <span className="text-white/40 text-sm">All cards placed — hit Check!</span>}
            {tray.map((card) => (
              <button
                key={card.id}
                draggable={!checked}
                onDragStart={() => onDragStart(card)}
                onClick={() => placeInFirstEmpty(card)}
                disabled={checked}
                className="w-20 h-24 md:w-24 md:h-28 rounded-2xl bg-white text-slate-800 flex flex-col items-center justify-center shadow-lg hover:scale-105 hover:shadow-xl transition-all cursor-grab active:cursor-grabbing"
              >
                <span className="text-3xl md:text-4xl">{card.emoji}</span>
                <span className="text-[11px] md:text-xs font-bold mt-1 text-center px-1 leading-tight">{card.name}</span>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <button
              onClick={checkChain}
              disabled={!allFilled || checked}
              className={`px-8 py-3 rounded-xl font-black text-lg transition-all ${
                allFilled && !checked
                  ? 'bg-gradient-to-r from-lime-500 to-emerald-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              ✅ Check Chain
            </button>
            <button
              onClick={toggleMute}
              className="px-4 py-3 rounded-xl bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Round result overlay */}
          {screen === 'roundEnd' && roundResult && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
              <div className="text-6xl">
                {roundResult.type === 'perfect' ? '🎉' : roundResult.type === 'timeout' ? '⏰' : '🤔'}
              </div>
              <h3 className="text-white text-3xl font-black">
                {roundResult.type === 'perfect'
                  ? 'Perfect Chain!'
                  : roundResult.type === 'timeout'
                    ? "Time's up!"
                    : 'Almost!'}
              </h3>
              {roundResult.type === 'partial' && (
                <p className="text-white/80 text-sm">
                  You got <strong className="text-lime-300">{roundResult.rightCount}/{roundResult.total}</strong> in the
                  right spot.
                </p>
              )}
              <div className="text-yellow-300 text-4xl font-black">+{roundResult.points}</div>
              {roundResult.type === 'perfect' && streak > 1 && (
                <div className="text-orange-300 text-sm font-bold">🔥 {streak} perfect in a row!</div>
              )}
              <div className="bg-white/10 rounded-xl px-4 py-3 text-white/85 text-sm max-w-sm">
                <span className="font-bold text-lime-300">{puzzle.biome}:</span> {puzzle.fact}
              </div>
              <button
                onClick={nextRound}
                className="mt-1 bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                {round >= TOTAL_ROUNDS ? '🏁 See Results' : `▶️ Next Ecosystem`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME OVER */}
      {screen === 'over' && finalStats && (
        <div className="bg-gradient-to-br from-emerald-950 via-green-900 to-teal-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl mb-2">{finalStats.score >= REWARD_SCORE ? '🏆' : '🌿'}</div>
          <h3 className="text-white text-3xl md:text-4xl font-black">
            {finalStats.perfects === TOTAL_ROUNDS ? 'ECOSYSTEM MASTER!' : finalStats.score >= REWARD_SCORE ? 'Great Work!' : 'Game Complete!'}
          </h3>
          <div className="text-lime-300 text-5xl font-black drop-shadow mt-2">{finalStats.score.toLocaleString()}</div>
          {finalStats.score >= highScore && finalStats.score > 0 && (
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse mt-2">
              🎉 NEW HIGH SCORE!
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 text-white/90 text-sm mt-5">
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{TOTAL_ROUNDS}</div>
              <div className="text-white/60 text-xs">Ecosystems</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black text-lime-300">🎉 {finalStats.perfects}</div>
              <div className="text-white/60 text-xs">Perfect chains</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">🏆</div>
              <div className="text-white/60 text-xs">{highScore.toLocaleString()} best</div>
            </div>
          </div>
          {rewardMsg && <div className="text-emerald-300 text-sm font-semibold mt-4">{rewardMsg}</div>}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-lime-500 to-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
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

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">🌱</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Producers first.</strong> Plants and algae make their own food using the sun.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">➡️</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Energy flows up</strong> — each animal eats the one before it.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🕵️</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Spot the decoy!</strong> One card belongs to the biome but not this chain.
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

export default FoodChainFrenzyGame;
