// components/games/NumberCrunchGame.js — Number Crunch 🎯
// A Countdown-style mental math puzzle: combine number tiles with
// + − × ÷ to hit the target before the clock runs out. Every puzzle
// is generated from the tiles themselves, so an exact solution always exists.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 5;
const REWARD_SCORE = 400;
const REWARD_COINS = 5;

const DIFFICULTIES = {
  easy: {
    name: 'Rookie',
    emoji: '🐣',
    color: 'from-emerald-500 to-teal-600',
    desc: 'Small numbers · 90s',
    time: 90,
    smallCount: 6,
    largeCount: 0,
    smallMax: 10,
    steps: 2, // ops used to build the target
    targetMin: 11,
    targetMax: 60,
  },
  medium: {
    name: 'Challenger',
    emoji: '⚡',
    color: 'from-blue-500 to-indigo-600',
    desc: 'One big number · 75s',
    time: 75,
    smallCount: 5,
    largeCount: 1,
    smallMax: 10,
    steps: 3,
    targetMin: 40,
    targetMax: 300,
  },
  hard: {
    name: 'Mastermind',
    emoji: '🔥',
    color: 'from-rose-500 to-orange-600',
    desc: 'Classic rules · 60s',
    time: 60,
    smallCount: 4,
    largeCount: 2,
    smallMax: 10,
    steps: 4,
    targetMin: 100,
    targetMax: 999,
  },
};

const LARGE_NUMBERS = [25, 50, 75, 100];
const OPS = [
  { sym: '+', label: '+' },
  { sym: '-', label: '−' },
  { sym: '*', label: '×' },
  { sym: '/', label: '÷' },
];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const applyOp = (a, op, b) => {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b !== 0 && a % b === 0 ? a / b : null;
    default:
      return null;
  }
};

// Generate tiles + a target guaranteed to be reachable from those tiles.
function generatePuzzle(diff) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const tiles = [];
    for (let i = 0; i < diff.smallCount; i++) tiles.push(randInt(1, diff.smallMax));
    const largePool = shuffle(LARGE_NUMBERS);
    for (let i = 0; i < diff.largeCount; i++) tiles.push(largePool[i]);

    // Build a target by actually combining a random subset of the tiles.
    const pool = shuffle(tiles.map((v) => v));
    let value = pool.pop();
    let steps = 0;
    const wanted = diff.steps;
    while (pool.length && steps < wanted) {
      const next = pool.pop();
      const op = OPS[randInt(0, 3)].sym;
      let result = applyOp(value, op, next);
      if (result === null || result <= 0 || !Number.isInteger(result) || result > 9999) {
        // fall back to an op that always works
        result = value + next;
      }
      value = result;
      steps++;
    }

    const target = value;
    if (
      target >= diff.targetMin &&
      target <= diff.targetMax &&
      !tiles.includes(target) // don't hand the answer over for free
    ) {
      return { tiles, target };
    }
  }
  // Extremely unlikely fallback: simple sum puzzle
  const tiles = [2, 3, 4, 5, 6, 7].slice(0, diff.smallCount + diff.largeCount);
  return { tiles, target: tiles[0] + tiles[1] + tiles[2] };
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
  return {
    ensure,
    select: () => tone(523, 0.07, 'sine', 0.07),
    merge: () => {
      tone(440, 0.1, 'triangle', 0.09);
      tone(660, 0.12, 'triangle', 0.08, 0.06);
    },
    error: () => tone(180, 0.2, 'sawtooth', 0.1, 0, -40),
    undo: () => tone(330, 0.1, 'sine', 0.07, 0, -80),
    tick: () => tone(880, 0.05, 'square', 0.05),
    exact: () => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.11, i * 0.09));
    },
    close: () => {
      [523, 659, 784].forEach((f, i) => tone(f, 0.16, 'triangle', 0.09, i * 0.08));
    },
    miss: () => {
      tone(262, 0.3, 'sawtooth', 0.1, 0, -60);
    },
    gameOver: () => {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.1, i * 0.12));
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const NumberCrunchGame = ({ studentData, updateStudentData, showToast }) => {
  const synthRef = useRef(null);
  const mutedRef = useRef(false);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('menu'); // menu | playing | roundEnd | over
  const [diffId, setDiffId] = useState('easy');
  const [muted, setMuted] = useState(false);

  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(0);
  const [tiles, setTiles] = useState([]); // {id, value}
  const [history, setHistory] = useState([]); // snapshots for undo: {tiles, expr}
  const [exprLog, setExprLog] = useState([]); // human-readable steps
  const [firstTile, setFirstTile] = useState(null); // tile id
  const [op, setOp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shakeTile, setShakeTile] = useState(null);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundResult, setRoundResult] = useState(null); // {type, diff, points, best}
  const [exactCount, setExactCount] = useState(0);

  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [highScore, setHighScore] = useState(0);

  const idSeq = useRef(1);

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('numbercrunch_highscore') || '0', 10));
      const m = localStorage.getItem('numbercrunch_muted') === '1';
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
        localStorage.setItem('numbercrunch_muted', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  const diff = DIFFICULTIES[diffId];

  // ── Timer ──
  const stopTimer = () => clearInterval(timerRef.current);
  const startTimer = useCallback((seconds) => {
    stopTimer();
    setTimeLeft(seconds);
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
    (roundNum, difficulty) => {
      const d = DIFFICULTIES[difficulty];
      const { tiles: values, target: tgt } = generatePuzzle(d);
      setTiles(values.map((v) => ({ id: idSeq.current++, value: v })));
      setTarget(tgt);
      setHistory([]);
      setExprLog([]);
      setFirstTile(null);
      setOp(null);
      setRound(roundNum);
      setRoundResult(null);
      setScreen('playing');
      startTimer(d.time);
    },
    [startTimer]
  );

  const startGame = (difficulty) => {
    setDiffId(difficulty);
    setScore(0);
    setStreak(0);
    setExactCount(0);
    setFinalStats(null);
    setRewardMsg('');
    synthRef.current?.ensure();
    beginRound(1, difficulty);
  };

  // ── Round scoring ──
  const finishRound = useCallback(
    (closest) => {
      stopTimer();
      const distance = Math.abs(closest - target);
      let points = 0;
      let type = 'miss';
      if (distance === 0) {
        points = 100 + timeLeft * 2 + streak * 20;
        type = 'exact';
        synthRef.current?.exact();
      } else if (distance <= 5) {
        points = 40;
        type = 'close';
        synthRef.current?.close();
      } else if (distance <= 10) {
        points = 20;
        type = 'near';
        synthRef.current?.close();
      } else {
        synthRef.current?.miss();
      }

      const newStreak = type === 'exact' ? streak + 1 : 0;
      setStreak(newStreak);
      if (type === 'exact') setExactCount((c) => c + 1);
      setScore((s) => s + points);
      setRoundResult({ type, distance, points, closest });
      setScreen('roundEnd');
    },
    [target, timeLeft, streak]
  );

  // Time out → score the closest remaining tile
  useEffect(() => {
    if (screen === 'playing' && timeLeft === 0) {
      const closest = tiles.reduce(
        (best, t) => (Math.abs(t.value - target) < Math.abs(best - target) ? t.value : best),
        tiles[0]?.value ?? 0
      );
      finishRound(closest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen]);

  // ── Game over ──
  const endGame = useCallback(
    (finalScore, exacts) => {
      synthRef.current?.gameOver();
      setHighScore((prev) => {
        if (finalScore > prev) {
          try {
            localStorage.setItem('numbercrunch_highscore', String(finalScore));
          } catch {}
          return finalScore;
        }
        return prev;
      });
      setFinalStats({ score: finalScore, exacts, diffId });

      setRewardMsg('');
      if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
        const today = new Date().toDateString();
        const last = studentData?.gameProgress?.numberCrunch?.lastRewardDate;
        if (last !== today) {
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              numberCrunch: {
                ...studentData.gameProgress?.numberCrunch,
                lastRewardDate: today,
                bestScore: Math.max(finalScore, studentData.gameProgress?.numberCrunch?.bestScore || 0),
              },
            },
          })
            .then(() => {
              setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
              showToast?.(`🎯 Number Crunch reward: +${REWARD_COINS} coins!`, 'success');
            })
            .catch((err) => console.error('Error awarding coins:', err));
        } else {
          setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
        }
      } else if (finalScore < REWARD_SCORE) {
        setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
      }
      setScreen('over');
    },
    [diffId, studentData, updateStudentData, showToast]
  );

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      endGame(score, exactCount);
    } else {
      beginRound(round + 1, diffId);
    }
  };

  // ── Tile interaction ──
  const triggerShake = (id) => {
    setShakeTile(id);
    setTimeout(() => setShakeTile(null), 400);
  };

  const onTileClick = (tile) => {
    if (screen !== 'playing') return;
    if (firstTile === null) {
      setFirstTile(tile.id);
      synthRef.current?.select();
      return;
    }
    if (firstTile === tile.id) {
      // deselect
      setFirstTile(null);
      setOp(null);
      synthRef.current?.undo();
      return;
    }
    if (!op) {
      // switch selection
      setFirstTile(tile.id);
      synthRef.current?.select();
      return;
    }
    // Combine!
    const a = tiles.find((t) => t.id === firstTile);
    const b = tile;
    const result = applyOp(a.value, op, b.value);
    if (result === null || result <= 0 || !Number.isInteger(result)) {
      synthRef.current?.error();
      triggerShake(tile.id);
      return;
    }
    const opLabel = OPS.find((o) => o.sym === op)?.label || op;
    setHistory((h) => [...h, { tiles, exprLog }]);
    const newTile = { id: idSeq.current++, value: result, fresh: true };
    const newTiles = tiles.filter((t) => t.id !== a.id && t.id !== b.id).concat(newTile);
    setTiles(newTiles);
    setExprLog((log) => [...log, `${a.value} ${opLabel} ${b.value} = ${result}`]);
    setFirstTile(null);
    setOp(null);
    synthRef.current?.merge();

    if (result === target) {
      setTimeout(() => finishRound(result), 350);
    }
  };

  const onOpClick = (sym) => {
    if (screen !== 'playing' || firstTile === null) return;
    setOp((prev) => (prev === sym ? null : sym));
    synthRef.current?.select();
  };

  const undo = () => {
    if (!history.length || screen !== 'playing') return;
    const last = history[history.length - 1];
    setTiles(last.tiles);
    setExprLog(last.exprLog);
    setHistory((h) => h.slice(0, -1));
    setFirstTile(null);
    setOp(null);
    synthRef.current?.undo();
  };

  const resetRound = () => {
    if (!history.length || screen !== 'playing') return;
    const first = history[0];
    setTiles(first.tiles);
    setExprLog([]);
    setHistory([]);
    setFirstTile(null);
    setOp(null);
    synthRef.current?.undo();
  };

  const quitToMenu = () => {
    stopTimer();
    setScreen('menu');
  };

  const closestNow = tiles.length
    ? tiles.reduce((best, t) => (Math.abs(t.value - target) < Math.abs(best - target) ? t.value : best), tiles[0].value)
    : 0;

  // ── UI ──
  return (
    <div className="max-w-3xl mx-auto">
      {/* MENU */}
      {screen === 'menu' && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl md:text-7xl mb-2 animate-bounce">🎯</div>
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Number <span className="text-cyan-300">Crunch</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto mt-2">
            Combine the number tiles with <strong>+ − × ÷</strong> to hit the target! Every puzzle has an exact
            solution — can you find it before the clock runs out?
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90 mt-4">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🎯 Exact answer = big points</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🔥 Exact streaks stack bonuses</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">↩️ Undo any step</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">{TOTAL_ROUNDS} rounds per game</span>
          </div>

          <h3 className="text-white font-bold text-lg mt-6 mb-3">Choose your level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(DIFFICULTIES).map(([id, d]) => (
              <button
                key={id}
                onClick={() => startGame(id)}
                className={`bg-gradient-to-r ${d.color} text-white rounded-2xl p-4 hover:scale-105 hover:shadow-2xl transition-all`}
              >
                <div className="text-3xl">{d.emoji}</div>
                <div className="font-black text-lg mt-1">{d.name}</div>
                <div className="text-white/80 text-xs">{d.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-white/70 text-sm mt-6">
            <span>🏆 High score: <strong className="text-cyan-300">{highScore.toLocaleString()}</strong></span>
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
          </div>
        </div>
      )}

      {/* PLAYING + ROUND END share the board */}
      {(screen === 'playing' || screen === 'roundEnd') && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl shadow-2xl p-4 md:p-6 relative">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 mb-4">
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
                className={`bg-black/30 rounded-xl px-3 py-2 text-center font-black text-lg ${
                  timeLeft <= 10 && screen === 'playing' ? 'text-red-400 animate-pulse' : ''
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

          {/* Target */}
          <div className="text-center mb-5">
            <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Target</div>
            <div className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-4xl md:text-5xl font-black px-8 py-3 rounded-2xl shadow-lg ring-4 ring-cyan-400/30">
              {target}
            </div>
            <div className="text-white/50 text-xs mt-2">
              Closest so far: <strong className="text-white/80">{closestNow}</strong>{' '}
              {closestNow === target ? '🎯' : `(${Math.abs(closestNow - target)} away)`}
            </div>
          </div>

          {/* Tiles */}
          <div className="flex flex-wrap justify-center gap-3 mb-5 min-h-[72px]">
            {tiles.map((t) => (
              <button
                key={t.id}
                onClick={() => onTileClick(t)}
                disabled={screen !== 'playing'}
                className={`min-w-[64px] px-4 py-4 rounded-2xl font-black text-2xl md:text-3xl transition-all shadow-lg ${
                  firstTile === t.id
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white scale-110 ring-4 ring-yellow-300/60'
                    : 'bg-white text-slate-800 hover:scale-105 hover:shadow-xl'
                } ${shakeTile === t.id ? 'animate-pulse ring-4 ring-red-500' : ''} ${
                  t.fresh ? 'ring-2 ring-cyan-400/60' : ''
                }`}
              >
                {t.value}
              </button>
            ))}
          </div>

          {/* Operators */}
          <div className="flex justify-center gap-3 mb-5">
            {OPS.map((o) => (
              <button
                key={o.sym}
                onClick={() => onOpClick(o.sym)}
                disabled={screen !== 'playing' || firstTile === null}
                className={`w-14 h-14 rounded-2xl font-black text-2xl transition-all shadow-lg ${
                  op === o.sym
                    ? 'bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white scale-110 ring-4 ring-fuchsia-300/60'
                    : firstTile !== null && screen === 'playing'
                      ? 'bg-white/15 border border-white/30 text-white hover:bg-white/25'
                      : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Controls + steps */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={undo}
              disabled={!history.length || screen !== 'playing'}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                history.length && screen === 'playing'
                  ? 'bg-white/15 border border-white/30 text-white hover:bg-white/25'
                  : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              ↩️ Undo
            </button>
            <button
              onClick={resetRound}
              disabled={!history.length || screen !== 'playing'}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                history.length && screen === 'playing'
                  ? 'bg-white/15 border border-white/30 text-white hover:bg-white/25'
                  : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              🔄 Reset tiles
            </button>
            <button
              onClick={toggleMute}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          {exprLog.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 text-xs text-white/70">
              {exprLog.map((e, i) => (
                <span key={i} className="bg-black/30 rounded-full px-3 py-1">{e}</span>
              ))}
            </div>
          )}

          {/* Round result overlay */}
          {screen === 'roundEnd' && roundResult && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center gap-3 p-6 text-center z-10">
              <div className="text-6xl">
                {roundResult.type === 'exact' ? '🎯' : roundResult.type === 'close' ? '👏' : roundResult.type === 'near' ? '🙂' : '😅'}
              </div>
              <h3 className="text-white text-3xl font-black">
                {roundResult.type === 'exact'
                  ? 'BULLSEYE!'
                  : roundResult.type === 'close'
                    ? 'So close!'
                    : roundResult.type === 'near'
                      ? 'Not bad!'
                      : 'Tough one!'}
              </h3>
              <p className="text-white/80 text-sm">
                Target was <strong className="text-cyan-300">{target}</strong> — you reached{' '}
                <strong className="text-white">{roundResult.closest}</strong>
                {roundResult.distance > 0 && <> ({roundResult.distance} away)</>}
              </p>
              <div className="text-yellow-300 text-4xl font-black">+{roundResult.points}</div>
              {roundResult.type === 'exact' && streak > 1 && (
                <div className="text-orange-300 text-sm font-bold">🔥 {streak} exact in a row!</div>
              )}
              <button
                onClick={nextRound}
                className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
              >
                {round >= TOTAL_ROUNDS ? '🏁 See Results' : `▶️ Round ${round + 1}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME OVER */}
      {screen === 'over' && finalStats && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl mb-2">{finalStats.score >= REWARD_SCORE ? '🏆' : '🎯'}</div>
          <h3 className="text-white text-3xl md:text-4xl font-black">
            {finalStats.exacts === TOTAL_ROUNDS ? 'PERFECT GAME!' : finalStats.score >= REWARD_SCORE ? 'Great Crunching!' : 'Game Complete!'}
          </h3>
          <div className="text-cyan-300 text-5xl font-black drop-shadow mt-2">{finalStats.score.toLocaleString()}</div>
          {finalStats.score >= highScore && finalStats.score > 0 && (
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse mt-2">
              🎉 NEW HIGH SCORE!
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 text-white/90 text-sm mt-5">
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{TOTAL_ROUNDS}</div>
              <div className="text-white/60 text-xs">Rounds</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black text-cyan-300">🎯 {finalStats.exacts}</div>
              <div className="text-white/60 text-xs">Bullseyes</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{DIFFICULTIES[finalStats.diffId]?.emoji}</div>
              <div className="text-white/60 text-xs">{DIFFICULTIES[finalStats.diffId]?.name}</div>
            </div>
          </div>
          {rewardMsg && <div className="text-emerald-300 text-sm font-semibold mt-4">{rewardMsg}</div>}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() => startGame(finalStats.diffId)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={quitToMenu}
              className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all"
            >
              🏠 Levels
            </button>
          </div>
        </div>
      )}

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">👆</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Tap</strong> a number, an operation, then another number to combine them.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Hit the target exactly</strong> for 100+ points plus a time bonus.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">➗</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Rules:</strong> no fractions and no negatives — division must be exact!
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

export default NumberCrunchGame;
