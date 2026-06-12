// components/games/BrainBlitzGame.js — Brain Blitz ⚡🧠
// A fast-paced trivia quiz-show arcade. Pick a category (or Mixed),
// race the timer, build a streak multiplier, use lifelines, and chase
// a high score. Daily coin reward for strong runs.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Reward / tuning ──────────────────────────────────────────────────────────
const QUESTION_TIME = 15; // seconds per question
const LIVES_START = 3;
const BASE_POINTS = 100; // per correct answer (before time/streak bonus)
const REWARD_SCORE = 1500; // score needed for daily coin reward
const REWARD_COINS = 5;

// ── Question bank ────────────────────────────────────────────────────────────
// Each: { q, choices:[4], answer:index, cat }
const QUESTIONS = [
  // 🔬 Science
  { cat: 'science', q: 'What gas do plants take in from the air to make food?', choices: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'], answer: 1 },
  { cat: 'science', q: 'How many legs does an insect have?', choices: ['6', '8', '4', '10'], answer: 0 },
  { cat: 'science', q: 'What is the closest planet to the Sun?', choices: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 },
  { cat: 'science', q: 'Which part of the body pumps blood?', choices: ['Lungs', 'Brain', 'Heart', 'Liver'], answer: 2 },
  { cat: 'science', q: 'What do we call animals that eat only plants?', choices: ['Carnivores', 'Herbivores', 'Omnivores', 'Predators'], answer: 1 },
  { cat: 'science', q: 'What state of matter is ice?', choices: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 0 },
  { cat: 'science', q: 'Which planet is known as the Red Planet?', choices: ['Jupiter', 'Mars', 'Saturn', 'Neptune'], answer: 1 },
  { cat: 'science', q: 'What force pulls objects toward the Earth?', choices: ['Magnetism', 'Friction', 'Gravity', 'Tension'], answer: 2 },
  { cat: 'science', q: 'How many bones does an adult human have?', choices: ['106', '206', '306', '156'], answer: 1 },
  { cat: 'science', q: 'What do bees collect from flowers to make honey?', choices: ['Pollen', 'Nectar', 'Sap', 'Dew'], answer: 1 },
  { cat: 'science', q: 'What is H₂O more commonly known as?', choices: ['Salt', 'Water', 'Air', 'Acid'], answer: 1 },
  { cat: 'science', q: 'Which of these is a reptile?', choices: ['Frog', 'Crocodile', 'Dolphin', 'Penguin'], answer: 1 },
  { cat: 'science', q: 'What is the largest planet in our solar system?', choices: ['Saturn', 'Earth', 'Jupiter', 'Uranus'], answer: 2 },
  { cat: 'science', q: 'What do caterpillars turn into?', choices: ['Spiders', 'Butterflies', 'Bees', 'Beetles'], answer: 1 },
  { cat: 'science', q: 'Which sense do you use your nose for?', choices: ['Taste', 'Smell', 'Touch', 'Hearing'], answer: 1 },

  // 🌍 Geography
  { cat: 'geography', q: 'What is the largest ocean on Earth?', choices: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], answer: 2 },
  { cat: 'geography', q: 'Which continent is the Sahara Desert in?', choices: ['Asia', 'Africa', 'Australia', 'Europe'], answer: 1 },
  { cat: 'geography', q: 'What is the capital city of France?', choices: ['London', 'Rome', 'Paris', 'Berlin'], answer: 2 },
  { cat: 'geography', q: 'Which is the longest river in the world?', choices: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 1 },
  { cat: 'geography', q: 'What is the largest country by land area?', choices: ['China', 'USA', 'Canada', 'Russia'], answer: 3 },
  { cat: 'geography', q: 'Mount Everest is the tallest mountain. Which continent is it on?', choices: ['Asia', 'South America', 'Africa', 'Europe'], answer: 0 },
  { cat: 'geography', q: 'Which country is home to the kangaroo?', choices: ['India', 'Brazil', 'Australia', 'Kenya'], answer: 2 },
  { cat: 'geography', q: 'How many continents are there on Earth?', choices: ['5', '6', '7', '8'], answer: 2 },
  { cat: 'geography', q: 'What is the capital of Japan?', choices: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], answer: 2 },
  { cat: 'geography', q: 'Which ocean is on the east coast of the USA?', choices: ['Pacific', 'Atlantic', 'Indian', 'Arctic'], answer: 1 },
  { cat: 'geography', q: 'The pyramids of Giza are found in which country?', choices: ['Mexico', 'Greece', 'Egypt', 'Peru'], answer: 2 },
  { cat: 'geography', q: 'What is the smallest planet... wait — smallest continent?', choices: ['Europe', 'Australia', 'Antarctica', 'Asia'], answer: 1 },

  // 🔢 Math
  { cat: 'math', q: 'What is 7 × 8?', choices: ['54', '56', '64', '49'], answer: 1 },
  { cat: 'math', q: 'How many sides does a hexagon have?', choices: ['5', '6', '7', '8'], answer: 1 },
  { cat: 'math', q: 'What is 144 ÷ 12?', choices: ['10', '11', '12', '14'], answer: 2 },
  { cat: 'math', q: 'What is half of 250?', choices: ['100', '115', '125', '150'], answer: 2 },
  { cat: 'math', q: 'Which number is a prime number?', choices: ['9', '15', '21', '17'], answer: 3 },
  { cat: 'math', q: 'What is 25% of 80?', choices: ['15', '20', '25', '40'], answer: 1 },
  { cat: 'math', q: 'A triangle has angles that add up to how many degrees?', choices: ['90', '180', '270', '360'], answer: 1 },
  { cat: 'math', q: 'What is 9 squared (9²)?', choices: ['18', '72', '81', '99'], answer: 2 },
  { cat: 'math', q: 'What comes next: 2, 4, 8, 16, ___?', choices: ['18', '24', '32', '20'], answer: 2 },
  { cat: 'math', q: 'How many minutes are in 2 hours?', choices: ['100', '120', '60', '90'], answer: 1 },
  { cat: 'math', q: 'What is the value of π (pi) rounded to 2 decimals?', choices: ['3.41', '3.14', '3.12', '3.16'], answer: 1 },
  { cat: 'math', q: 'What is 1000 − 365?', choices: ['635', '645', '735', '625'], answer: 0 },

  // 📖 Words & English
  { cat: 'words', q: 'Which word is a synonym for "happy"?', choices: ['Gloomy', 'Joyful', 'Tired', 'Angry'], answer: 1 },
  { cat: 'words', q: 'What is the plural of "mouse"?', choices: ['Mouses', 'Mice', 'Meese', 'Mouse'], answer: 1 },
  { cat: 'words', q: 'Which word is a verb (action word)?', choices: ['Quickly', 'Jump', 'Blue', 'Tall'], answer: 1 },
  { cat: 'words', q: 'What is the opposite (antonym) of "ancient"?', choices: ['Old', 'Modern', 'Tired', 'Huge'], answer: 1 },
  { cat: 'words', q: 'Which word is spelled correctly?', choices: ['Freind', 'Frend', 'Friend', 'Freynd'], answer: 2 },
  { cat: 'words', q: 'A word that describes a noun is called a(n)...', choices: ['Adverb', 'Adjective', 'Pronoun', 'Conjunction'], answer: 1 },
  { cat: 'words', q: 'Which is a proper noun?', choices: ['City', 'River', 'London', 'Dog'], answer: 2 },
  { cat: 'words', q: 'What punctuation ends a question?', choices: ['Period .', 'Question mark ?', 'Comma ,', 'Exclamation !'], answer: 1 },
  { cat: 'words', q: 'Which word rhymes with "light"?', choices: ['Loot', 'Night', 'Late', 'Lift'], answer: 1 },
  { cat: 'words', q: '"They\'re", "their", and "there" are examples of...', choices: ['Synonyms', 'Homophones', 'Antonyms', 'Verbs'], answer: 1 },
  { cat: 'words', q: 'What is the past tense of "run"?', choices: ['Runned', 'Ran', 'Running', 'Runs'], answer: 1 },

  // 🎨 General Knowledge
  { cat: 'general', q: 'How many colours are in a rainbow?', choices: ['5', '6', '7', '8'], answer: 2 },
  { cat: 'general', q: 'How many days are there in a leap year?', choices: ['364', '365', '366', '360'], answer: 2 },
  { cat: 'general', q: 'What is the hardest natural substance on Earth?', choices: ['Gold', 'Iron', 'Diamond', 'Granite'], answer: 2 },
  { cat: 'general', q: 'Which animal is known as the "King of the Jungle"?', choices: ['Tiger', 'Lion', 'Elephant', 'Bear'], answer: 1 },
  { cat: 'general', q: 'How many strings does a standard guitar have?', choices: ['4', '5', '6', '7'], answer: 2 },
  { cat: 'general', q: 'What colour do you get mixing blue and yellow?', choices: ['Purple', 'Green', 'Orange', 'Brown'], answer: 1 },
  { cat: 'general', q: 'How many players are on a soccer team on the field?', choices: ['9', '10', '11', '12'], answer: 2 },
  { cat: 'general', q: 'What is the first month of the year?', choices: ['December', 'June', 'January', 'March'], answer: 2 },
  { cat: 'general', q: 'Which of these is NOT a primary colour?', choices: ['Red', 'Green', 'Blue', 'Yellow'], answer: 1 },
  { cat: 'general', q: 'How many sides does a stop sign have?', choices: ['6', '7', '8', '4'], answer: 2 },
  { cat: 'general', q: 'What do you call a baby kangaroo?', choices: ['Cub', 'Joey', 'Kit', 'Calf'], answer: 1 },
  { cat: 'general', q: 'How many wheels does a tricycle have?', choices: ['2', '3', '4', '1'], answer: 1 },
];

const CATEGORIES = [
  { id: 'mixed', name: 'Mixed', emoji: '🎲', color: 'from-purple-500 to-pink-600', desc: 'A bit of everything!' },
  { id: 'science', name: 'Science', emoji: '🔬', color: 'from-emerald-500 to-teal-600', desc: 'Nature, space & the body' },
  { id: 'geography', name: 'Geography', emoji: '🌍', color: 'from-blue-500 to-cyan-600', desc: 'Countries, oceans & maps' },
  { id: 'math', name: 'Math', emoji: '🔢', color: 'from-indigo-500 to-blue-600', desc: 'Numbers & problem solving' },
  { id: 'words', name: 'Words', emoji: '📖', color: 'from-orange-500 to-amber-600', desc: 'Grammar & vocabulary' },
  { id: 'general', name: 'General', emoji: '🧠', color: 'from-rose-500 to-fuchsia-600', desc: 'Fun facts & trivia' },
];

const CAT_META = CATEGORIES.reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Shuffle a question's choices while keeping the correct index pointed right.
const prepareQuestion = (item) => {
  const indexed = item.choices.map((text, i) => ({ text, correct: i === item.answer }));
  const mixed = shuffle(indexed);
  return {
    q: item.q,
    cat: item.cat,
    choices: mixed.map((c) => c.text),
    answer: mixed.findIndex((c) => c.correct),
  };
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
    correct: (streak = 1) => {
      const base = 523;
      const n = Math.min(4, 1 + Math.floor(streak / 2));
      for (let i = 0; i < n; i++) tone(base * Math.pow(1.26, i), 0.16, 'triangle', 0.1, i * 0.08);
    },
    wrong: () => {
      tone(196, 0.3, 'sawtooth', 0.12, 0, -60);
      tone(155, 0.3, 'sawtooth', 0.1, 0.04, -40);
    },
    tick: () => tone(880, 0.05, 'square', 0.05),
    lifeline: () => {
      [659, 784, 988].forEach((f, i) => tone(f, 0.14, 'sine', 0.09, i * 0.05));
    },
    select: () => tone(440, 0.07, 'sine', 0.06),
    gameOver: () => {
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.28, 'triangle', 0.1, i * 0.16));
    },
    win: () => {
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, i * 0.1));
    },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const BrainBlitzGame = ({ studentData, updateStudentData, showToast }) => {
  const synthRef = useRef(null);
  const mutedRef = useRef(false);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [category, setCategory] = useState('mixed');
  const [muted, setMuted] = useState(false);

  const [deck, setDeck] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null); // chosen index
  const [locked, setLocked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [eliminated, setEliminated] = useState([]); // indexes removed by 50/50

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(LIVES_START);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [lifelines, setLifelines] = useState({ fifty: true, skip: true, freeze: true });
  const [frozen, setFrozen] = useState(false);

  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [highScore, setHighScore] = useState(0);

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('brainblitz_highscore') || '0', 10));
      const m = localStorage.getItem('brainblitz_muted') === '1';
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
        localStorage.setItem('brainblitz_muted', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  const multiplier = 1 + Math.min(streak, 8) * 0.5; // up to 5x

  // ── Timer control ──
  const stopTimer = () => clearInterval(timerRef.current);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(QUESTION_TIME);
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

  // ── Load a question ──
  const loadQuestion = useCallback(
    (index, currentDeck) => {
      const d = currentDeck || deck;
      const raw = d[index % d.length];
      setCurrent(prepareQuestion(raw));
      setSelected(null);
      setLocked(false);
      setRevealed(false);
      setEliminated([]);
      setFrozen(false);
      startTimer();
    },
    [deck, startTimer]
  );

  // ── Start game ──
  const startGame = (catId) => {
    let pool = catId === 'mixed' ? QUESTIONS : QUESTIONS.filter((q) => q.cat === catId);
    if (pool.length < 4) pool = QUESTIONS;
    const newDeck = shuffle(pool);
    setDeck(newDeck);
    setCategory(catId);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(LIVES_START);
    setLifelines({ fifty: true, skip: true, freeze: true });
    setQIndex(0);
    setFinalStats(null);
    setRewardMsg('');
    setScreen('playing');
    synthRef.current?.ensure();
    loadQuestion(0, newDeck);
  };

  // ── End game ──
  const endGame = useCallback(
    (finalScore, finalBestStreak, answered) => {
      stopTimer();
      const reachedReward = finalScore >= REWARD_SCORE;
      synthRef.current?.[reachedReward ? 'win' : 'gameOver']?.();

      setHighScore((prev) => {
        if (finalScore > prev) {
          try {
            localStorage.setItem('brainblitz_highscore', String(finalScore));
          } catch {}
          return finalScore;
        }
        return prev;
      });

      setFinalStats({ score: finalScore, bestStreak: finalBestStreak, answered, category });

      setRewardMsg('');
      if (reachedReward && studentData && updateStudentData) {
        const today = new Date().toDateString();
        const last = studentData?.gameProgress?.brainBlitz?.lastRewardDate;
        if (last !== today) {
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              brainBlitz: {
                ...studentData.gameProgress?.brainBlitz,
                lastRewardDate: today,
                bestScore: Math.max(finalScore, studentData.gameProgress?.brainBlitz?.bestScore || 0),
              },
            },
          })
            .then(() => {
              setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
              showToast?.(`🧠 Brain Blitz reward: +${REWARD_COINS} coins!`, 'success');
            })
            .catch((err) => console.error('Error awarding coins:', err));
        } else {
          setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
        }
      } else if (!reachedReward) {
        setRewardMsg(`Score ${REWARD_SCORE.toLocaleString()}+ to earn a daily coin reward!`);
      }

      setScreen('over');
    },
    [category, studentData, updateStudentData, showToast]
  );

  // ── Handle answer ──
  const handleAnswer = (choiceIndex, timedOut = false) => {
    if (locked || !current) return;
    setLocked(true);
    setRevealed(true);
    stopTimer();
    setSelected(timedOut ? null : choiceIndex);

    const correct = !timedOut && choiceIndex === current.answer;

    if (correct) {
      const timeBonus = Math.round(timeLeft * 5 * multiplier);
      const gained = Math.round(BASE_POINTS * multiplier) + timeBonus;
      const newScore = score + gained;
      const newStreak = streak + 1;
      const newBest = Math.max(bestStreak, newStreak);
      setScore(newScore);
      setStreak(newStreak);
      setBestStreak(newBest);
      synthRef.current?.correct(newStreak);
      advance(newScore, newBest);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      synthRef.current?.wrong();
      if (newLives <= 0) {
        setTimeout(() => endGame(score, bestStreak, qIndex + 1), 1400);
      } else {
        advance(score, bestStreak);
      }
    }
  };

  // Move to next question after a short reveal
  const advance = (carryScore, carryBest) => {
    setTimeout(() => {
      const next = qIndex + 1;
      // Reshuffle deck when exhausted so questions keep flowing
      if (next % deck.length === 0) {
        setDeck((d) => shuffle(d));
      }
      setQIndex(next);
      loadQuestion(next, null);
    }, 1300);
  };

  // ── Timeout → counts as wrong ──
  useEffect(() => {
    if (screen === 'playing' && timeLeft === 0 && !locked && current) {
      handleAnswer(-1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen, locked, current]);

  // ── Lifelines ──
  const useFifty = () => {
    if (!lifelines.fifty || locked || !current) return;
    const wrongs = current.choices
      .map((_, i) => i)
      .filter((i) => i !== current.answer);
    const toRemove = shuffle(wrongs).slice(0, 2);
    setEliminated(toRemove);
    setLifelines((l) => ({ ...l, fifty: false }));
    synthRef.current?.lifeline();
  };

  const useFreeze = () => {
    if (!lifelines.freeze || locked || frozen) return;
    setFrozen(true);
    stopTimer();
    setLifelines((l) => ({ ...l, freeze: false }));
    synthRef.current?.lifeline();
  };

  const useSkip = () => {
    if (!lifelines.skip || locked || !current) return;
    setLifelines((l) => ({ ...l, skip: false }));
    synthRef.current?.lifeline();
    stopTimer();
    const next = qIndex + 1;
    if (next % deck.length === 0) setDeck((d) => shuffle(d));
    setQIndex(next);
    loadQuestion(next, null);
  };

  const quitToMenu = () => {
    stopTimer();
    setScreen('menu');
  };

  // ── Render helpers ──
  const choiceLabels = ['A', 'B', 'C', 'D'];
  const choiceColors = [
    'from-rose-500 to-pink-600',
    'from-blue-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
  ];

  // ── UI ──
  return (
    <div className="max-w-3xl mx-auto">
      {/* MENU */}
      {screen === 'menu' && (
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl md:text-7xl mb-2 animate-bounce">🧠</div>
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Brain <span className="text-yellow-300">Blitz</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto mt-2">
            Answer fast, build a streak, and use your lifelines! The quicker you answer, the more points you score. ⚡
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90 mt-4">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">⏱️ {QUESTION_TIME}s per question</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🔥 Streaks multiply points</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">❤️ {LIVES_START} lives</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">💡 3 lifelines</span>
          </div>

          <h3 className="text-white font-bold text-lg mt-6 mb-3">Pick a category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => startGame(c.id)}
                className={`bg-gradient-to-r ${c.color} text-white rounded-2xl p-4 text-left hover:scale-105 hover:shadow-2xl transition-all`}
              >
                <div className="text-3xl">{c.emoji}</div>
                <div className="font-black text-lg leading-tight mt-1">{c.name}</div>
                <div className="text-white/80 text-xs">{c.desc}</div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-white/70 text-sm mt-6">
            <span>🏆 High score: <strong className="text-yellow-300">{highScore.toLocaleString()}</strong></span>
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
          </div>
        </div>
      )}

      {/* PLAYING */}
      {screen === 'playing' && current && (
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-4 md:p-6">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="bg-black/30 rounded-xl px-3 py-2 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/60">Score</div>
              <div className="font-black text-lg md:text-xl leading-none">{score.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-white/60">Streak</div>
                <div className="font-black text-lg leading-none text-orange-300">
                  🔥{streak} <span className="text-xs text-yellow-300">{multiplier}x</span>
                </div>
              </div>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-lg tracking-wider">
                {Array.from({ length: LIVES_START }).map((_, i) => (
                  <span key={i} className={i < lives ? '' : 'opacity-25 grayscale'}>
                    ❤️
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={quitToMenu}
              className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/20 transition-all text-sm"
            >
              ✕
            </button>
          </div>

          {/* Timer bar */}
          <div className="h-3 rounded-full bg-black/30 overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                frozen ? 'bg-cyan-400' : timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-yellow-400'
              }`}
              style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-white/60 mb-4">
            <span>
              {CAT_META[current.cat]?.emoji} {CAT_META[current.cat]?.name} · Question {qIndex + 1}
            </span>
            <span className={frozen ? 'text-cyan-300 font-bold' : timeLeft <= 5 ? 'text-red-300 font-bold' : ''}>
              {frozen ? '❄️ Frozen' : `⏱️ ${timeLeft}s`}
            </span>
          </div>

          {/* Question */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-5 md:p-6 mb-4 min-h-[96px] flex items-center justify-center">
            <p className="text-white text-lg md:text-2xl font-bold text-center leading-snug">{current.q}</p>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {current.choices.map((choice, i) => {
              const isAnswer = i === current.answer;
              const isPicked = i === selected;
              const isGone = eliminated.includes(i);
              let cls = `bg-gradient-to-r ${choiceColors[i]} hover:scale-[1.02] hover:shadow-xl`;
              if (revealed) {
                if (isAnswer) cls = 'bg-gradient-to-r from-emerald-500 to-green-600 ring-4 ring-white/70';
                else if (isPicked) cls = 'bg-gradient-to-r from-red-600 to-rose-700 opacity-90';
                else cls = 'bg-white/10 opacity-50';
              }
              return (
                <button
                  key={i}
                  disabled={locked || isGone}
                  onClick={() => handleAnswer(i)}
                  className={`relative text-left text-white font-semibold rounded-2xl px-4 py-4 transition-all ${cls} ${
                    isGone ? 'opacity-20 line-through cursor-not-allowed' : ''
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-black/25 font-black mr-2 text-sm">
                    {choiceLabels[i]}
                  </span>
                  {choice}
                  {revealed && isAnswer && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">✓</span>}
                  {revealed && isPicked && !isAnswer && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lifelines */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={useFifty}
              disabled={!lifelines.fifty || locked}
              className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all ${
                lifelines.fifty && !locked
                  ? 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">✂️</span>
              <span className="text-[11px] font-semibold">50/50</span>
            </button>
            <button
              onClick={useFreeze}
              disabled={!lifelines.freeze || locked || frozen}
              className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all ${
                lifelines.freeze && !locked && !frozen
                  ? 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">❄️</span>
              <span className="text-[11px] font-semibold">Freeze</span>
            </button>
            <button
              onClick={useSkip}
              disabled={!lifelines.skip || locked}
              className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all ${
                lifelines.skip && !locked
                  ? 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                  : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span className="text-xl">⏭️</span>
              <span className="text-[11px] font-semibold">Skip</span>
            </button>
            <button
              onClick={toggleMute}
              className="flex flex-col items-center px-4 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <span className="text-xl">{muted ? '🔇' : '🔊'}</span>
              <span className="text-[11px] font-semibold">Sound</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {screen === 'over' && finalStats && (
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl mb-2">{finalStats.score >= REWARD_SCORE ? '🏆' : '🧠'}</div>
          <h3 className="text-white text-3xl md:text-4xl font-black">
            {finalStats.score >= REWARD_SCORE ? 'Brilliant!' : 'Game Over!'}
          </h3>
          <div className="text-yellow-300 text-5xl font-black drop-shadow mt-2">{finalStats.score.toLocaleString()}</div>
          {finalStats.score >= highScore && finalStats.score > 0 && (
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse mt-2">
              🎉 NEW HIGH SCORE!
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 text-white/90 text-sm mt-5">
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{finalStats.answered}</div>
              <div className="text-white/60 text-xs">Questions</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black text-orange-300">🔥{finalStats.bestStreak}</div>
              <div className="text-white/60 text-xs">Best streak</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{CAT_META[finalStats.category]?.emoji}</div>
              <div className="text-white/60 text-xs">{CAT_META[finalStats.category]?.name}</div>
            </div>
          </div>
          {rewardMsg && <div className="text-emerald-300 text-sm font-semibold mt-4">{rewardMsg}</div>}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() => startGame(finalStats.category)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={quitToMenu}
              className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all"
            >
              🏠 Categories
            </button>
          </div>
        </div>
      )}

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Be quick!</strong> Answer faster for a bigger time bonus.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Streaks</strong> multiply your points — up to 5×.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">💡</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Lifelines:</strong> 50/50, Freeze time, or Skip — one use each.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600">
            <strong className="text-gray-800">Score {REWARD_SCORE.toLocaleString()}+</strong> to earn {REWARD_COINS} coins once a day!
          </span>
        </div>
      </div>
    </div>
  );
};

export default BrainBlitzGame;
