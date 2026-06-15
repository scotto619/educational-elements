// components/games/PlaceValuePopGame.js — Place Value Pop 🫧
// A bubble-popping place-value game. A question appears (e.g. "Pop the VALUE of
// the underlined digit"), four answer bubbles drift upward, and the student taps
// the correct one before the timer runs out. Question types mix digit value,
// place name, and expanded form so it stretches real place-value understanding.
// Combo multiplier, lives, three difficulty levels, high score, sound, and a
// daily coin reward — matching the conventions of the other educational games.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const TOTAL_LIVES = 3;
const REWARD_SCORE = 400;
const REWARD_COINS = 5;

const DIFFICULTIES = {
  easy: {
    name: 'Rookie',
    emoji: '🐣',
    color: 'from-emerald-500 to-teal-600',
    desc: 'Tens & hundreds · 14s',
    time: 14,
    minDigits: 2,
    maxDigits: 3,
    decimals: false,
  },
  medium: {
    name: 'Challenger',
    emoji: '⚡',
    color: 'from-blue-500 to-indigo-600',
    desc: 'Up to thousands · 12s',
    time: 12,
    minDigits: 3,
    maxDigits: 4,
    decimals: false,
  },
  hard: {
    name: 'Master',
    emoji: '🔥',
    color: 'from-fuchsia-500 to-purple-600',
    desc: 'Big numbers & tenths · 10s',
    time: 10,
    minDigits: 4,
    maxDigits: 6,
    decimals: true,
  },
};

// Place names from ones upward, plus a decimal branch.
const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
const PLACE_VALUES = [1, 10, 100, 1000, 10000, 100000];
const DECIMAL_NAMES = ['tenths', 'hundredths'];

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const fmt = (n) => {
  // Group whole part with commas; keep up to 2 decimals without trailing zeros.
  const [whole, dec] = String(n).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec ? `${grouped}.${dec}` : grouped;
};

// Build a number string with a chosen digit highlighted, plus metadata.
function makeNumber(cfg) {
  const digitsCount = randInt(cfg.minDigits, cfg.maxDigits);
  let digits = [];
  digits.push(randInt(1, 9)); // leading digit never 0
  for (let i = 1; i < digitsCount; i++) digits.push(randInt(0, 9));

  const useDecimal = cfg.decimals && Math.random() < 0.4;
  let decDigits = [];
  if (useDecimal) {
    const dCount = randInt(1, 2);
    for (let i = 0; i < dCount; i++) decDigits.push(randInt(0, 9));
    if (decDigits.every((d) => d === 0)) decDigits[0] = randInt(1, 9);
  }

  const wholeStr = digits.join('');
  const numStr = useDecimal ? `${wholeStr}.${decDigits.join('')}` : wholeStr;
  const numValue = parseFloat(numStr);

  return { digits, decDigits, useDecimal, wholeStr, numStr, numValue };
}

// Generate one question with 4 options (one correct).
function generateQuestion(cfg) {
  const num = makeNumber(cfg);
  const type = ['value', 'place', 'expanded'][randInt(0, 2)];

  // Pick a target digit position. wholePos counts from the right (0 = ones).
  const wholeLen = num.digits.length;
  // choose whether to target a whole or decimal digit
  const targetDecimal = num.useDecimal && Math.random() < 0.35;

  let highlightIndex; // index within the full numStr (string position)
  let digitChar;
  let placeName;
  let placeValue; // numeric value of that digit in the number

  if (targetDecimal) {
    const dPos = randInt(0, num.decDigits.length - 1); // 0 = tenths
    digitChar = String(num.decDigits[dPos]);
    placeName = DECIMAL_NAMES[dPos];
    placeValue = num.decDigits[dPos] / Math.pow(10, dPos + 1);
    highlightIndex = num.wholeStr.length + 1 + dPos; // after the dot
  } else {
    const wholePos = randInt(0, wholeLen - 1); // 0 = ones
    const idxFromLeft = wholeLen - 1 - wholePos;
    digitChar = String(num.digits[idxFromLeft]);
    placeName = PLACE_NAMES[wholePos];
    placeValue = num.digits[idxFromLeft] * PLACE_VALUES[wholePos];
    highlightIndex = idxFromLeft;
  }

  let prompt, correct, options;

  if (type === 'value' && !targetDecimal) {
    prompt = 'Pop the VALUE of the underlined digit';
    correct = fmt(placeValue);
    const wrong = new Set();
    const digitNum = parseInt(digitChar, 10) || randInt(1, 9);
    // plausible distractors: same digit at other places + the bare digit
    const candidates = [
      String(digitNum),
      fmt(digitNum * 10),
      fmt(digitNum * 100),
      fmt(digitNum * 1000),
      fmt(digitNum * 10000),
    ];
    shuffle(candidates).forEach((c) => { if (c !== correct && wrong.size < 3) wrong.add(c); });
    options = shuffle([correct, ...wrong]);
  } else if (type === 'place') {
    prompt = `Pop the PLACE of the underlined digit`;
    correct = placeName;
    const pool = (targetDecimal ? DECIMAL_NAMES : PLACE_NAMES.slice(0, Math.max(3, wholeLen + 1)))
      .filter((p) => p !== correct);
    const extra = [...PLACE_NAMES, ...DECIMAL_NAMES].filter((p) => p !== correct && !pool.includes(p));
    const wrongs = shuffle([...pool, ...extra]).slice(0, 3);
    options = shuffle([correct, ...wrongs]);
  } else {
    // expanded form of the whole number
    prompt = `Pop the expanded form of ${fmt(num.numValue)}`;
    const parts = num.digits
      .map((d, i) => d * PLACE_VALUES[wholeLen - 1 - i])
      .filter((v) => v !== 0);
    correct = parts.map(fmt).join(' + ');
    const wrongs = new Set();
    let guard = 0;
    while (wrongs.size < 3 && guard < 40) {
      guard++;
      const mutated = parts.map((v) => {
        if (Math.random() < 0.4) {
          const factor = Math.random() < 0.5 ? 10 : 0.1;
          const nv = Math.round(v * factor);
          return nv > 0 ? nv : v;
        }
        return v;
      });
      const str = mutated.map(fmt).join(' + ');
      if (str !== correct) wrongs.add(str);
    }
    // ensure we have 3 distractors
    while (wrongs.size < 3) wrongs.add(fmt(num.numValue + randInt(1, 9) * 10));
    options = shuffle([correct, ...Array.from(wrongs).slice(0, 3)]);
  }

  // Build display string with highlight marker for the targeted digit
  const display = num.numStr;
  return { prompt, correct, options, display, highlightIndex, type };
}

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
    pop: (n = 0) => { tone(560 + n * 30, 0.09, 'sine', 0.08, 0, 220); tone(880 + n * 30, 0.1, 'triangle', 0.05, 0.05); },
    combo: (n = 0) => { [660, 880, 1175].forEach((f, i) => tone(f + n * 10, 0.1, 'triangle', 0.07, i * 0.05)); },
    miss: () => tone(200, 0.3, 'sawtooth', 0.09, 0, -120),
    gameOver: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'triangle', 0.1, i * 0.14)); },
  };
}

const BUBBLE_COLORS = ['#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa'];

// ── Component ────────────────────────────────────────────────────────────────
const PlaceValuePopGame = ({ studentData, updateStudentData, showToast }) => {
  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('start'); // start | playing | over
  const [difficultyKey, setDifficultyKey] = useState('easy');
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(TOTAL_LIVES);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(12);
  const [feedback, setFeedback] = useState(null); // { ok, correct }
  const [locked, setLocked] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const [finalStats, setFinalStats] = useState({ score: 0, best: 0, round: 0 });
  const [rewardMsg, setRewardMsg] = useState('');

  const stateRef = useRef({ score: 0, combo: 0, lives: TOTAL_LIVES, round: 0, difficultyKey: 'easy' });

  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try {
      setHighScore(parseInt(localStorage.getItem('placevaluepop_highscore') || '0', 10));
      const m = localStorage.getItem('placevaluepop_muted') === '1';
      setMuted(m); mutedRef.current = m;
    } catch {}
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem('placevaluepop_muted', next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);

  const stopTimer = useCallback(() => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }, []);

  const endGame = useCallback(() => {
    stopTimer();
    synthRef.current?.gameOver();
    const finalScore = stateRef.current.score;
    const finalRound = stateRef.current.round;

    setHighScore((prev) => {
      const best = Math.max(prev, finalScore);
      if (finalScore > prev) { try { localStorage.setItem('placevaluepop_highscore', String(finalScore)); } catch {} }
      setFinalStats({ score: finalScore, best, round: finalRound });
      return best;
    });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.placeValuePop?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            placeValuePop: {
              ...studentData.gameProgress?.placeValuePop,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.placeValuePop?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🫧 Place Value Pop reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
    }

    setScreen('over');
  }, [stopTimer, studentData, updateStudentData, showToast]);

  const nextQuestion = useCallback(() => {
    const cfg = DIFFICULTIES[stateRef.current.difficultyKey];
    const q = generateQuestion(cfg);
    setQuestion(q);
    setFeedback(null);
    setLocked(false);
    stateRef.current.round += 1;
    setRound(stateRef.current.round);

    setMaxTime(cfg.time);
    setTimeLeft(cfg.time);
    stopTimer();
    let remaining = cfg.time;
    timerRef.current = setInterval(() => {
      remaining -= 0.1;
      if (remaining <= 0) {
        setTimeLeft(0);
        // time out = a miss
        handleTimeout();
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
  }, [stopTimer]);

  // Use refs to call handlers from the interval safely
  const handleTimeoutRef = useRef(() => {});
  const handleTimeout = useCallback(() => handleTimeoutRef.current(), []);

  const registerMiss = useCallback((correctText) => {
    stopTimer();
    setLocked(true);
    setCombo(0);
    stateRef.current.combo = 0;
    synthRef.current?.miss();
    setFeedback({ ok: false, correct: correctText });
    stateRef.current.lives -= 1;
    setLives(stateRef.current.lives);
    setTimeout(() => {
      if (stateRef.current.lives <= 0) endGame();
      else nextQuestion();
    }, 1300);
  }, [stopTimer, endGame, nextQuestion]);

  // keep timeout handler current
  useEffect(() => {
    handleTimeoutRef.current = () => {
      if (locked) return;
      registerMiss(question?.correct);
    };
  }, [locked, question, registerMiss]);

  const startGame = useCallback((key) => {
    synthRef.current?.ensure();
    stateRef.current = { score: 0, combo: 0, lives: TOTAL_LIVES, round: 0, difficultyKey: key };
    setDifficultyKey(key);
    setScore(0);
    setCombo(0);
    setLives(TOTAL_LIVES);
    setRound(0);
    setScreen('playing');
    setTimeout(() => nextQuestion(), 0);
  }, [nextQuestion]);

  const pickAnswer = useCallback((option) => {
    if (locked || !question) return;
    if (option === question.correct) {
      stopTimer();
      setLocked(true);
      const newCombo = stateRef.current.combo + 1;
      stateRef.current.combo = newCombo;
      setCombo(newCombo);
      // points: base + speed bonus + combo multiplier
      const speedBonus = Math.round((timeLeft / maxTime) * 50);
      const gained = (100 + speedBonus) * Math.min(5, newCombo);
      stateRef.current.score += gained;
      setScore(stateRef.current.score);
      if (newCombo > 1) synthRef.current?.combo(newCombo); else synthRef.current?.pop(newCombo);
      setFeedback({ ok: true, gained });
      setTimeout(() => nextQuestion(), 750);
    } else {
      registerMiss(question.correct);
    }
  }, [locked, question, timeLeft, maxTime, stopTimer, nextQuestion, registerMiss]);

  // Render the number with the highlighted digit underlined
  const renderNumber = () => {
    if (!question) return null;
    const chars = question.display.split('');
    return (
      <span className="font-black tracking-wide">
        {chars.map((ch, i) => (
          <span
            key={i}
            className={i === question.highlightIndex
              ? 'text-yellow-300 underline decoration-4 underline-offset-4'
              : 'text-white'}
          >
            {ch}
          </span>
        ))}
      </span>
    );
  };

  const diff = DIFFICULTIES[difficultyKey];

  // ═══════════════════════ START SCREEN ═══════════════════════
  if (screen === 'start') {
    return (
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-5 md:p-8 shadow-2xl">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-2">🫧</div>
          <h1 className="text-3xl font-black text-white">Place Value Pop</h1>
          <p className="text-white/70 text-sm mt-2 mb-6">
            Read the number, then pop the bubble with the right answer — the value of a digit,
            its place, or the expanded form. Be quick and keep your combo alive!
          </p>

          <p className="text-white/60 text-xs font-bold uppercase tracking-wide mb-2">Choose your level</p>
          <div className="space-y-2.5">
            {Object.entries(DIFFICULTIES).map(([key, d]) => (
              <button
                key={key}
                onClick={() => startGame(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r ${d.color} text-white font-bold shadow-lg hover:scale-[1.02] transition`}
              >
                <span className="text-2xl">{d.emoji}</span>
                <span className="text-left flex-1">
                  <span className="block text-lg leading-none">{d.name}</span>
                  <span className="block text-white/80 text-xs mt-0.5">{d.desc}</span>
                </span>
                <span className="text-xl">▶</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-center gap-4 text-white/60 text-sm">
            <span>🏆 Best: <b className="text-cyan-300">{highScore.toLocaleString()}</b></span>
            <button onClick={toggleMute} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition text-lg">{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════ GAME OVER SCREEN ═══════════════════════
  if (screen === 'over') {
    return (
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-5 md:p-8 shadow-2xl">
        <div className="max-w-md mx-auto text-center">
          <div className="text-5xl mb-2">{finalStats.score >= highScore && finalStats.score > 0 ? '🏆' : '🫧'}</div>
          <h2 className="text-2xl font-black text-white mb-1">
            {finalStats.score >= highScore && finalStats.score > 0 ? 'New Best!' : 'Bubbles Popped!'}
          </h2>
          <div className="flex gap-3 my-4 justify-center">
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <div className="text-2xl font-black text-cyan-300">{finalStats.score.toLocaleString()}</div>
              <div className="text-white/50 text-[10px] uppercase">Score</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <div className="text-2xl font-black text-yellow-300">{finalStats.round}</div>
              <div className="text-white/50 text-[10px] uppercase">Questions</div>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2">
              <div className="text-2xl font-black text-purple-300">{finalStats.best.toLocaleString()}</div>
              <div className="text-white/50 text-[10px] uppercase">Best</div>
            </div>
          </div>
          {rewardMsg && <div className="text-sm font-semibold text-emerald-300 mb-3">{rewardMsg}</div>}
          <div className="flex gap-2 justify-center">
            <button onClick={() => startGame(difficultyKey)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-extrabold shadow-lg hover:scale-105 transition">🔁 Play Again</button>
            <button onClick={() => setScreen('start')} className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition">Change Level</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════ PLAYING SCREEN ═══════════════════════
  const timeFrac = maxTime > 0 ? Math.max(0, timeLeft / maxTime) : 0;

  return (
    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-4 md:p-6 shadow-2xl">
      <div className="max-w-md mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between text-white mb-3">
          <div className="flex items-center gap-1 text-lg" title="Lives">
            {Array.from({ length: TOTAL_LIVES }).map((_, i) => (
              <span key={i} className={i < lives ? '' : 'opacity-20 grayscale'}>❤️</span>
            ))}
          </div>
          <div className="text-center">
            <div className="text-xl font-black tabular-nums leading-none">{score.toLocaleString()}</div>
            <div className="text-white/50 text-[10px] uppercase tracking-wide">Score</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${diff.color}`}>{diff.emoji} {diff.name}</span>
            <button onClick={toggleMute} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 transition text-lg">{muted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        {/* Combo */}
        {combo > 1 && (
          <div className="text-center mb-1">
            <span className="inline-block px-3 py-0.5 rounded-full bg-yellow-400 text-purple-900 font-black text-sm animate-pulse">🔥 Combo x{Math.min(5, combo)}</span>
          </div>
        )}

        {/* Timer bar */}
        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${timeFrac > 0.5 ? 'bg-emerald-400' : timeFrac > 0.25 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${timeFrac * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center mb-4">
          <p className="text-cyan-300 font-bold text-sm uppercase tracking-wide mb-2">{question?.prompt}</p>
          <div className="text-4xl md:text-5xl">{renderNumber()}</div>
        </div>

        {/* Answer bubbles */}
        <div className="grid grid-cols-2 gap-3">
          {(question?.options || []).map((opt, i) => {
            const isCorrect = feedback && opt === question.correct;
            const isWrongPick = feedback && !feedback.ok && opt === question.correct;
            return (
              <button
                key={i}
                disabled={locked}
                onClick={() => pickAnswer(opt)}
                style={{ '--bubble': BUBBLE_COLORS[i % BUBBLE_COLORS.length] }}
                className={`relative rounded-full aspect-[2/1] flex items-center justify-center font-black text-lg md:text-xl px-2 text-center transition-all
                  ${feedback
                    ? (isCorrect ? 'bg-emerald-400 text-emerald-950 scale-105' : 'bg-white/10 text-white/40')
                    : 'text-white hover:scale-105 active:scale-95'}
                `}
              >
                {!feedback && (
                  <span
                    className="absolute inset-0 rounded-full shadow-lg"
                    style={{ background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.5), var(--bubble) 60%)' }}
                  />
                )}
                <span className="relative z-10 break-words leading-tight">{opt}</span>
                {isWrongPick && <span className="absolute -top-1 -right-1 z-20 text-xl">✅</span>}
              </button>
            );
          })}
        </div>

        {/* Feedback line */}
        <div className="h-6 mt-3 text-center">
          {feedback?.ok && <span className="text-emerald-300 font-bold">+{feedback.gained} {combo > 1 ? `(combo x${Math.min(5, combo)})` : ''} 🎉</span>}
          {feedback && !feedback.ok && <span className="text-red-300 font-semibold">Answer: <b className="text-white">{feedback.correct}</b></span>}
        </div>
      </div>
    </div>
  );
};

export default PlaceValuePopGame;
