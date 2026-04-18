// components/games/SimonSaysGame.js — Simon Says Memory Game
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Audio engine (Web Audio API, no external deps) ────────────────────────────
const BUTTON_FREQS = {
  red:    329.63, // E4
  blue:   261.63, // C4
  green:  392.00, // G4
  yellow: 220.00, // A3
};
const ERROR_FREQ = 110.00; // low buzz

function playTone(freq, duration = 0.4, type = 'sine') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {
    // audio not available — silently skip
  }
}

function playErrorSound() {
  playTone(ERROR_FREQ, 0.6, 'sawtooth');
}

function playSuccessSound() {
  // ascending arpeggio
  [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.18), i * 80);
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────
const BUTTONS = [
  {
    id: 'red',
    label: '🔴',
    active: 'bg-red-400',
    inactive: 'bg-red-600',
    border: 'border-red-800',
    glow: 'shadow-red-400/80',
    text: 'Red',
  },
  {
    id: 'blue',
    label: '🔵',
    active: 'bg-blue-300',
    inactive: 'bg-blue-600',
    border: 'border-blue-900',
    glow: 'shadow-blue-400/80',
    text: 'Blue',
  },
  {
    id: 'green',
    label: '🟢',
    active: 'bg-green-400',
    inactive: 'bg-green-600',
    border: 'border-green-900',
    glow: 'shadow-green-400/80',
    text: 'Green',
  },
  {
    id: 'yellow',
    label: '🟡',
    active: 'bg-yellow-300',
    inactive: 'bg-yellow-500',
    border: 'border-yellow-700',
    glow: 'shadow-yellow-300/80',
    text: 'Yellow',
  },
];

const LS_KEY = 'simon-says-high-score';

function getHighScore() {
  try {
    return parseInt(localStorage.getItem(LS_KEY) || '0', 10);
  } catch (_) {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    localStorage.setItem(LS_KEY, String(score));
  } catch (_) {}
}

// How long each button lights up (ms), decreases with level
function flashDuration(level) {
  return Math.max(250, 700 - level * 30);
}
// Gap between flashes (ms)
function gapDuration(level) {
  return Math.max(100, 300 - level * 12);
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SimonSaysGame() {
  // 'start' | 'playing' | 'result' | 'gameover'
  const [phase, setPhase] = useState('start');
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activeButton, setActiveButton] = useState(null); // id of lit button
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(getHighScore);
  const [wrongButton, setWrongButton] = useState(null);
  const [correctFlash, setCorrectFlash] = useState(false); // green flash on round complete
  const [difficulty, setDifficulty] = useState('normal'); // 'easy' | 'normal' | 'hard'
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const timeoutRefs = useRef([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  const scheduleTimeout = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutRefs.current.push(id);
    return id;
  }, []);

  // ── Sequence playback ───────────────────────────────────────────────────────
  const playSequence = useCallback((seq, level) => {
    setIsShowingSequence(true);
    setPlayerIndex(0);
    setActiveButton(null);

    const flash = flashDuration(level);
    const gap = gapDuration(level);
    const step = flash + gap;

    seq.forEach((btnId, i) => {
      // light up
      scheduleTimeout(() => {
        setActiveButton(btnId);
        playTone(BUTTON_FREQS[btnId], flash / 1000);
      }, i * step + 300);
      // turn off
      scheduleTimeout(() => {
        setActiveButton(null);
      }, i * step + 300 + flash);
    });

    // After all flashes, enable player input
    scheduleTimeout(() => {
      setIsShowingSequence(false);
    }, seq.length * step + 300 + flash + 100);
  }, [scheduleTimeout]);

  // ── Start a new round (extend sequence by 1) ────────────────────────────────
  const startRound = useCallback((prevSeq, level) => {
    const btnIds = BUTTONS.map(b => b.id);
    const next = btnIds[Math.floor(Math.random() * btnIds.length)];
    const newSeq = [...prevSeq, next];
    setSequence(newSeq);
    playSequence(newSeq, level);
  }, [playSequence]);

  // ── Countdown then start first round ───────────────────────────────────────
  const beginGame = useCallback(() => {
    clearAllTimeouts();
    setScore(0);
    setSequence([]);
    setPlayerIndex(0);
    setActiveButton(null);
    setWrongButton(null);
    setIsShowingSequence(false);
    setShowCountdown(true);
    setCountdown(3);

    let count = 3;
    const tick = () => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        scheduleTimeout(tick, 700);
      } else {
        setShowCountdown(false);
        setPhase('playing');
        scheduleTimeout(() => startRound([], 1), 400);
      }
    };
    scheduleTimeout(tick, 700);
  }, [clearAllTimeouts, scheduleTimeout, startRound]);

  // ── Handle player pressing a button ────────────────────────────────────────
  const handleButtonPress = useCallback((btnId) => {
    if (isShowingSequence || phase !== 'playing') return;

    setActiveButton(btnId);
    playTone(BUTTON_FREQS[btnId], 0.35);
    scheduleTimeout(() => setActiveButton(null), 200);

    const expected = sequence[playerIndex];

    if (btnId !== expected) {
      // Wrong!
      setWrongButton(btnId);
      playErrorSound();
      scheduleTimeout(() => setWrongButton(null), 600);

      const newScore = sequence.length - 1; // rounds completed before this mistake
      setScore(newScore);
      const hs = getHighScore();
      if (newScore > hs) {
        saveHighScore(newScore);
        setHighScore(newScore);
      }
      scheduleTimeout(() => setPhase('gameover'), 800);
      return;
    }

    const nextIndex = playerIndex + 1;

    if (nextIndex === sequence.length) {
      // Completed the round!
      const newScore = sequence.length;
      setScore(newScore);
      setCorrectFlash(true);
      playSuccessSound();
      scheduleTimeout(() => setCorrectFlash(false), 500);

      const level = Math.floor(sequence.length / 3) + 1;
      scheduleTimeout(() => startRound(sequence, level), 900);
      setPlayerIndex(0);
    } else {
      setPlayerIndex(nextIndex);
    }
  }, [isShowingSequence, phase, sequence, playerIndex, scheduleTimeout, startRound]);

  // ── Keyboard support ────────────────────────────────────────────────────────
  useEffect(() => {
    const keyMap = { r: 'red', b: 'blue', g: 'green', y: 'yellow' };
    const handler = (e) => {
      const btnId = keyMap[e.key.toLowerCase()];
      if (btnId) handleButtonPress(btnId);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleButtonPress]);

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  // ── Derived state ───────────────────────────────────────────────────────────
  const currentLevel = Math.floor(sequence.length / 3) + 1;
  const isNewHighScore = score > 0 && score >= highScore && phase === 'gameover';

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderButton = (btn) => {
    const isActive = activeButton === btn.id;
    const isWrong = wrongButton === btn.id;

    return (
      <motion.button
        key={btn.id}
        whileTap={!isShowingSequence ? { scale: 0.93 } : {}}
        animate={
          isActive
            ? { scale: 1.08, filter: 'brightness(1.6)' }
            : isWrong
            ? { scale: [1, 1.1, 0.95, 1], filter: 'brightness(1.3)' }
            : { scale: 1, filter: 'brightness(1)' }
        }
        transition={{ duration: 0.15 }}
        onClick={() => handleButtonPress(btn.id)}
        disabled={isShowingSequence}
        aria-label={btn.text}
        className={`
          relative flex items-center justify-center rounded-2xl border-4
          ${btn.border}
          ${isActive ? btn.active : btn.inactive}
          ${isActive ? `shadow-2xl ${btn.glow}` : 'shadow-md'}
          ${isWrong ? 'ring-4 ring-white' : ''}
          ${isShowingSequence ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:brightness-110 active:brightness-90'}
          transition-colors duration-100
          w-full aspect-square max-w-[160px] sm:max-w-[180px] md:max-w-[200px]
          text-4xl select-none
        `}
        style={{ minHeight: '120px' }}
      >
        <span className="drop-shadow-md text-5xl">{btn.label}</span>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-white"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.button>
    );
  };

  // ── Screens ─────────────────────────────────────────────────────────────────

  // Start screen
  if (phase === 'start') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[520px] px-4 py-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="text-7xl mb-4 drop-shadow-xl">🧠</div>
          <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            Simon Says
          </h1>
          <p className="text-purple-200 text-lg mb-8 max-w-sm mx-auto">
            Watch the colours light up, then repeat the sequence. Each round adds one more — how far can you go?
          </p>

          {/* Demo buttons preview */}
          <div className="grid grid-cols-2 gap-3 max-w-[220px] mx-auto mb-8">
            {BUTTONS.map(btn => (
              <div
                key={btn.id}
                className={`${btn.inactive} rounded-xl h-16 w-16 mx-auto flex items-center justify-center text-2xl shadow-md border-2 ${btn.border}`}
              >
                {btn.label}
              </div>
            ))}
          </div>

          {/* High score */}
          {highScore > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 px-5 py-2 bg-white/10 rounded-full text-purple-200 text-sm font-semibold"
            >
              🏆 Best: Round {highScore}
            </motion.div>
          )}

          {/* Difficulty */}
          <div className="flex gap-3 justify-center mb-8">
            {[
              { key: 'easy',   label: '🐢 Easy',   desc: 'Slow flashes' },
              { key: 'normal', label: '⚡ Normal',  desc: 'Standard speed' },
              { key: 'hard',   label: '🔥 Hard',    desc: 'Fast!' },
            ].map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`px-3 py-2 rounded-xl text-sm font-bold border-2 transition-all
                  ${difficulty === d.key
                    ? 'bg-white text-purple-900 border-white shadow-lg scale-105'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setPhase('countdown-prep');
              beginGame();
            }}
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xl rounded-2xl shadow-2xl shadow-purple-500/50 transition-all"
          >
            ▶ Start Game
          </motion.button>

          <p className="text-purple-400 text-xs mt-6">
            Keyboard: <kbd className="bg-white/10 px-1 rounded">R</kbd> Red &nbsp;
            <kbd className="bg-white/10 px-1 rounded">B</kbd> Blue &nbsp;
            <kbd className="bg-white/10 px-1 rounded">G</kbd> Green &nbsp;
            <kbd className="bg-white/10 px-1 rounded">Y</kbd> Yellow
          </p>
        </motion.div>
      </div>
    );
  }

  // Countdown overlay (shown before game starts)
  if (showCountdown) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[520px] bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            className="text-9xl font-black text-white drop-shadow-2xl"
          >
            {countdown}
          </motion.div>
        </AnimatePresence>
        <p className="text-purple-300 mt-4 text-lg font-semibold">Get ready…</p>
      </div>
    );
  }

  // Game over screen
  if (phase === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[520px] px-4 py-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 rounded-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <div className="text-7xl mb-3">
            {score >= 15 ? '🤩' : score >= 10 ? '😎' : score >= 5 ? '😄' : '😅'}
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-1">
            {score === 0 ? 'So close!' : 'Game Over!'}
          </h2>

          <AnimatePresence>
            {isNewHighScore && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 text-yellow-300 font-bold text-xl"
              >
                🏆 New High Score!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-8 justify-center my-6">
            <div className="text-center">
              <div className="text-5xl font-black text-white">{score}</div>
              <div className="text-purple-300 text-sm font-semibold mt-1">Rounds</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-5xl font-black text-yellow-300">{Math.max(score, highScore)}</div>
              <div className="text-purple-300 text-sm font-semibold mt-1">Best</div>
            </div>
          </div>

          {/* Show what the correct sequence was */}
          {sequence.length > 0 && (
            <div className="mb-6">
              <p className="text-purple-300 text-sm mb-2">The sequence was:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xs mx-auto">
                {sequence.slice(0, 20).map((btnId, i) => {
                  const btn = BUTTONS.find(b => b.id === btnId);
                  return (
                    <span
                      key={i}
                      className={`${btn.inactive} rounded-lg px-2 py-1 text-sm border ${btn.border}
                        ${i === playerIndex ? 'ring-2 ring-white' : ''}`}
                    >
                      {btn.label}
                    </span>
                  );
                })}
                {sequence.length > 20 && <span className="text-purple-400 text-sm">…</span>}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setPhase('countdown-prep');
                beginGame();
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-lg rounded-2xl shadow-xl transition-all"
            >
              🔄 Play Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                clearAllTimeouts();
                setPhase('start');
                setSequence([]);
                setScore(0);
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/20 transition-all"
            >
              🏠 Menu
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main playing screen
  const diffMultiplier = difficulty === 'easy' ? 1.5 : difficulty === 'hard' ? 0.6 : 1;

  return (
    <div
      className={`flex flex-col items-center min-h-[520px] px-4 py-6 rounded-2xl transition-colors duration-300
        ${correctFlash
          ? 'bg-gradient-to-br from-green-800 via-emerald-900 to-green-900'
          : 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800'}`}
    >
      {/* Header */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <button
          onClick={() => { clearAllTimeouts(); setPhase('start'); }}
          className="text-purple-400 hover:text-white text-sm font-semibold transition-colors"
        >
          ← Menu
        </button>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-black text-white">{score}</div>
            <div className="text-purple-400 text-xs">Round</div>
          </div>
          <div>
            <div className="text-2xl font-black text-yellow-300">{highScore}</div>
            <div className="text-purple-400 text-xs">Best</div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-300">{currentLevel}</div>
            <div className="text-purple-400 text-xs">Level</div>
          </div>
        </div>
        <div className="w-12" />
      </div>

      {/* Status banner */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isShowingSequence ? 'watch' : 'your-turn'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className={`mb-5 px-6 py-2 rounded-full font-bold text-sm
            ${isShowingSequence
              ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
              : 'bg-purple-500/30 text-purple-200 border border-purple-400/40'}`}
        >
          {isShowingSequence
            ? `👀 Watch the sequence… (${sequence.length} step${sequence.length !== 1 ? 's' : ''})`
            : `🎮 Your turn! (${playerIndex + 1} / ${sequence.length})`}
        </motion.div>
      </AnimatePresence>

      {/* 2×2 Button Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[420px] mx-auto mb-6">
        {BUTTONS.map(btn => renderButton(btn))}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
        {sequence.map((btnId, i) => {
          const btn = BUTTONS.find(b => b.id === btnId);
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-3 h-3 rounded-full border border-white/20
                ${i < playerIndex ? btn.inactive : i === playerIndex && !isShowingSequence ? 'bg-white animate-pulse' : 'bg-white/20'}`}
            />
          );
        })}
      </div>

      {/* Keyboard hint */}
      <p className="text-purple-600 text-xs mt-auto pt-4">
        Keys: R · B · G · Y
      </p>
    </div>
  );
}
