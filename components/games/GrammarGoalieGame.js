// components/games/GrammarGoalieGame.js — Grammar Goalie ⚽🧤
// A penalty-shootout grammar game: each "shot" is a sentence with a blank.
// Pick the correct word before the striker shoots to SAVE it — wrong answer
// (or too slow) and it's a goal against you. Covers homophones, contractions,
// a/an, verb tense, plurals, and comparatives, with teaching feedback.
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const SHOT_TIME = 10; // seconds to answer
const GOALS_ALLOWED = 3; // game ends after conceding this many
const TOTAL_SHOTS = 15;
const REWARD_SCORE = 800;
const REWARD_COINS = 5;

// ── Question bank ────────────────────────────────────────────────────────────
// {s: sentence with ___, c: choices, a: correct index, why: teaching note, cat}
const QUESTIONS = [
  // Homophones — their/there/they're
  { cat: 'homophones', s: '___ going to the park after school.', c: ["They're", 'Their', 'There'], a: 0, why: "They're = they are. 'They are going' makes sense!" },
  { cat: 'homophones', s: 'The dogs wagged ___ tails.', c: ['there', "they're", 'their'], a: 2, why: 'Their shows belonging — the tails belong to the dogs.' },
  { cat: 'homophones', s: 'Put the box over ___ by the door.', c: ['their', 'there', "they're"], a: 1, why: 'There tells you a place — over there!' },
  // your/you're
  { cat: 'homophones', s: "___ the best player on the team!", c: ['Your', "You're"], a: 1, why: "You're = you are. 'You are the best' makes sense!" },
  { cat: 'homophones', s: 'Is this ___ pencil?', c: ['your', "you're"], a: 0, why: 'Your shows belonging — the pencil belongs to you.' },
  // its/it's
  { cat: 'homophones', s: "___ raining outside today.", c: ["It's", 'Its'], a: 0, why: "It's = it is. 'It is raining' makes sense!" },
  { cat: 'homophones', s: 'The bird flapped ___ wings.', c: ["it's", 'its'], a: 1, why: 'Its shows belonging — no apostrophe needed.' },
  // to/too/two
  { cat: 'homophones', s: 'Can I come ___?', c: ['to', 'two', 'too'], a: 2, why: "Too means 'also' or 'as well'." },
  { cat: 'homophones', s: 'She has ___ brothers.', c: ['too', 'two', 'to'], a: 1, why: 'Two is the number 2.' },
  { cat: 'homophones', s: 'We walked ___ the shops.', c: ['too', 'two', 'to'], a: 2, why: "To shows direction — going 'to' a place." },
  // were/where/we're
  { cat: 'homophones', s: '___ did you put my hat?', c: ['Were', "We're", 'Where'], a: 2, why: 'Where asks about a place.' },
  { cat: 'homophones', s: '___ having pizza for dinner tonight!', c: ["We're", 'Were', 'Where'], a: 0, why: "We're = we are. 'We are having pizza' makes sense!" },
  // hear/here, see/sea, etc.
  { cat: 'homophones', s: 'Did you ___ that loud noise?', c: ['here', 'hear'], a: 1, why: "Hear is what you do with your ears — 'hear' has 'ear' inside it!" },
  { cat: 'homophones', s: 'Come over ___ and sit down.', c: ['hear', 'here'], a: 1, why: 'Here is a place — like there, but closer.' },
  { cat: 'homophones', s: 'The pirate sailed across the ___.', c: ['see', 'sea'], a: 1, why: 'The sea is the ocean. See is what you do with your eyes.' },

  // Contractions
  { cat: 'contractions', s: '"Do not run!" is the same as "___ run!"', c: ["Don't", "Doesn't", "Didn't"], a: 0, why: "Do + not = don't." },
  { cat: 'contractions', s: 'She ___ like broccoli. (does not)', c: ["don't", "doesn't", "isn't"], a: 1, why: "Does + not = doesn't." },
  { cat: 'contractions', s: 'I ___ believe we won! (cannot)', c: ["can't", "couldn't", "won't"], a: 0, why: "Cannot = can't." },
  { cat: 'contractions', s: 'We ___ going to be late. (are not)', c: ["isn't", "aren't", "wasn't"], a: 1, why: "Are + not = aren't." },
  { cat: 'contractions', s: '___ my favourite song! (That is)', c: ["That's", "There's", "This's"], a: 0, why: "That + is = that's." },
  { cat: 'contractions', s: 'He ___ finished his homework yet. (has not)', c: ["haven't", "hadn't", "hasn't"], a: 2, why: "Has + not = hasn't." },

  // a / an
  { cat: 'a-an', s: 'I saw ___ elephant at the zoo.', c: ['a', 'an'], a: 1, why: "Use 'an' before vowel sounds — e-le-phant starts with 'e'." },
  { cat: 'a-an', s: 'She ate ___ banana for lunch.', c: ['an', 'a'], a: 1, why: "Use 'a' before consonant sounds — b-anana." },
  { cat: 'a-an', s: 'It took ___ hour to get there.', c: ['a', 'an'], a: 1, why: "Hour sounds like 'our' — it starts with a vowel SOUND, so use 'an'." },
  { cat: 'a-an', s: 'He wants to be ___ astronaut.', c: ['a', 'an'], a: 1, why: "Astronaut starts with the vowel sound 'a', so use 'an'." },
  { cat: 'a-an', s: 'We watched ___ unicorn movie.', c: ['an', 'a'], a: 1, why: "Unicorn sounds like 'YOO-nicorn' — a consonant sound, so use 'a'!" },

  // Verb tense
  { cat: 'tense', s: 'Yesterday, I ___ to the beach.', c: ['go', 'went', 'gone'], a: 1, why: "Past tense of 'go' is 'went'." },
  { cat: 'tense', s: 'She ___ her lunch already.', c: ['has eaten', 'has ate', 'have eaten'], a: 0, why: "With 'has', use 'eaten' — she has eaten." },
  { cat: 'tense', s: 'Last week we ___ a movie.', c: ['see', 'seen', 'saw'], a: 2, why: "Past tense of 'see' is 'saw'. 'Seen' needs a helper like 'have'." },
  { cat: 'tense', s: 'Tomorrow I ___ visit grandma.', c: ['will', 'did', 'was'], a: 0, why: "'Will' talks about the future." },
  { cat: 'tense', s: 'The dog ___ in the garden right now.', c: ['played', 'is playing', 'plays yesterday'], a: 1, why: "'Right now' needs the present continuous — is playing." },
  { cat: 'tense', s: 'He ___ his bike to school every day.', c: ['rides', 'rode', 'ridden'], a: 0, why: "'Every day' means present tense — he rides." },
  { cat: 'tense', s: 'They ___ swimming last summer.', c: ['go', 'went', 'goes'], a: 1, why: "'Last summer' is the past — they went swimming." },

  // was/were
  { cat: 'tense', s: 'We ___ at the museum on Friday.', c: ['was', 'were'], a: 1, why: "Use 'were' with we, you, and they." },
  { cat: 'tense', s: 'She ___ very happy with her present.', c: ['were', 'was'], a: 1, why: "Use 'was' with I, he, she, and it." },

  // Plurals
  { cat: 'plurals', s: 'Three ___ flew over the lake.', c: ['gooses', 'geese', 'goose'], a: 1, why: 'Goose → geese. Some plurals change completely!' },
  { cat: 'plurals', s: 'The ___ are playing in the yard.', c: ['childs', 'children', 'childrens'], a: 1, why: 'Child → children. A tricky irregular plural!' },
  { cat: 'plurals', s: 'I packed two ___ for the trip.', c: ['boxs', 'boxies', 'boxes'], a: 2, why: "Words ending in x add 'es' — boxes." },
  { cat: 'plurals', s: 'Five ___ were nibbling cheese.', c: ['mouses', 'mice', 'mousies'], a: 1, why: 'Mouse → mice. Another shape-shifter plural!' },
  { cat: 'plurals', s: 'The bakery sells fresh ___.', c: ['loafs', 'loaves', 'loafes'], a: 1, why: 'Loaf → loaves. F often becomes VES.' },
  { cat: 'plurals', s: 'Both ___ scored a goal.', c: ['teams', 'teames', "team's"], a: 0, why: "Just add 's' — team's with an apostrophe shows owning, not more than one." },

  // Comparatives & superlatives
  { cat: 'compare', s: 'A cheetah is ___ than a horse.', c: ['fastest', 'faster', 'more fast'], a: 1, why: "Comparing TWO things uses '-er' — faster." },
  { cat: 'compare', s: 'Mount Everest is the ___ mountain on Earth.', c: ['higher', 'most high', 'highest'], a: 2, why: "Comparing against ALL uses '-est' — highest." },
  { cat: 'compare', s: 'This is the ___ pizza I have ever eaten!', c: ['better', 'best', 'goodest'], a: 1, why: 'Good → better → best. No "goodest"!' },
  { cat: 'compare', s: 'My bag is ___ than yours.', c: ['heavier', 'heaviest', 'more heavy'], a: 0, why: 'Heavy → heavier when comparing two things. Y becomes I.' },
  { cat: 'compare', s: 'That was the ___ day of the whole year.', c: ['worse', 'worst', 'baddest'], a: 1, why: 'Bad → worse → worst. No "baddest"!' },

  // Subject-verb agreement
  { cat: 'agreement', s: 'The pack of wolves ___ through the forest.', c: ['move', 'moves'], a: 1, why: "The pack (one group) moves — match the verb to 'pack', not 'wolves'." },
  { cat: 'agreement', s: 'My friends ___ football after school.', c: ['plays', 'play'], a: 1, why: 'Friends (more than one) play — no s on the verb.' },
  { cat: 'agreement', s: 'Everyone ___ invited to the party.', c: ['are', 'is'], a: 1, why: "'Everyone' counts as one person — everyone IS invited." },
  { cat: 'agreement', s: 'There ___ five cookies left in the jar.', c: ['is', 'are'], a: 1, why: 'Five cookies (plural) — there ARE five.' },
];

const CATEGORIES = [
  { id: 'mixed', name: 'Mixed Bag', emoji: '🎲', desc: 'Everything!' },
  { id: 'homophones', name: 'Homophones', emoji: '👂', desc: "their / there / they're" },
  { id: 'contractions', name: 'Contractions', emoji: '✂️', desc: "don't, can't, it's" },
  { id: 'tense', name: 'Verb Tense', emoji: '⏰', desc: 'was / were / went' },
  { id: 'plurals', name: 'Plurals', emoji: '🐭', desc: 'mice, geese, boxes' },
  { id: 'compare', name: 'Comparing', emoji: '📏', desc: 'faster, fastest, best' },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const prepareQuestion = (q) => {
  const indexed = q.c.map((text, i) => ({ text, correct: i === q.a }));
  const mixed = shuffle(indexed);
  return { ...q, c: mixed.map((x) => x.text), a: mixed.findIndex((x) => x.correct) };
};

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
    save: (streak = 0) => {
      const base = 523;
      for (let i = 0; i < Math.min(4, 2 + Math.floor(streak / 2)); i++) tone(base * Math.pow(1.25, i), 0.14, 'triangle', 0.1, i * 0.07);
    },
    goal: () => {
      tone(220, 0.3, 'sawtooth', 0.11, 0, -60);
      tone(165, 0.4, 'sawtooth', 0.1, 0.12, -50);
    },
    whistle: () => { tone(2200, 0.12, 'sine', 0.08); tone(2200, 0.25, 'sine', 0.08, 0.18); },
    tick: () => tone(880, 0.05, 'square', 0.05),
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, i * 0.1)); },
    gameOver: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'triangle', 0.1, i * 0.15)); },
  };
}

// ── Component ────────────────────────────────────────────────────────────────
const GrammarGoalieGame = ({ studentData, updateStudentData, showToast }) => {
  const synthRef = useRef(null);
  const mutedRef = useRef(false);
  const timerRef = useRef(null);

  const [screen, setScreen] = useState('menu'); // menu | playing | over
  const [category, setCategory] = useState('mixed');
  const [muted, setMuted] = useState(false);

  const [deck, setDeck] = useState([]);
  const [shotNum, setShotNum] = useState(0);
  const [current, setCurrent] = useState(null);
  const [picked, setPicked] = useState(null);
  const [phase, setPhase] = useState('aim'); // aim | saved | goal
  const [timeLeft, setTimeLeft] = useState(SHOT_TIME);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [saves, setSaves] = useState(0);
  const [goals, setGoals] = useState(0);

  const [finalStats, setFinalStats] = useState(null);
  const [rewardMsg, setRewardMsg] = useState('');
  const [highScore, setHighScore] = useState(0);

  // ── Persistence ──
  useEffect(() => {
    try {
      setHighScore(parseInt(localStorage.getItem('grammargoalie_highscore') || '0', 10));
      const m = localStorage.getItem('grammargoalie_muted') === '1';
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
      try { localStorage.setItem('grammargoalie_muted', next ? '1' : '0'); } catch {}
      return next;
    });
  };

  const stopTimer = () => clearInterval(timerRef.current);
  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(SHOT_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        if (t <= 4) synthRef.current?.tick();
        return t - 1;
      });
    }, 1000);
  }, []);

  // ── Flow ──
  const loadShot = useCallback((index, d) => {
    const list = d || deck;
    setCurrent(prepareQuestion(list[index % list.length]));
    setPicked(null);
    setPhase('aim');
    startTimer();
  }, [deck, startTimer]);

  const startGame = (catId) => {
    let pool = catId === 'mixed' ? QUESTIONS : QUESTIONS.filter((q) => q.cat === catId || (catId === 'tense' && q.cat === 'agreement'));
    if (catId === 'mixed') pool = QUESTIONS;
    if (pool.length < 5) pool = QUESTIONS;
    const newDeck = shuffle(pool);
    setDeck(newDeck);
    setCategory(catId);
    setScore(0);
    setStreak(0);
    setSaves(0);
    setGoals(0);
    setShotNum(1);
    setFinalStats(null);
    setRewardMsg('');
    setScreen('playing');
    synthRef.current?.ensure();
    synthRef.current?.whistle();
    loadShot(0, newDeck);
  };

  const endGame = useCallback((finalScore, finalSaves, finalGoals, shotsFaced) => {
    stopTimer();
    const cleanSheet = finalGoals === 0 && shotsFaced >= TOTAL_SHOTS;
    synthRef.current?.[finalScore >= REWARD_SCORE ? 'win' : 'gameOver']?.();

    setHighScore((prev) => {
      if (finalScore > prev) {
        try { localStorage.setItem('grammargoalie_highscore', String(finalScore)); } catch {}
        return finalScore;
      }
      return prev;
    });

    setFinalStats({ score: finalScore, saves: finalSaves, goals: finalGoals, cleanSheet, category });

    setRewardMsg('');
    if (finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.grammarGoalie?.lastRewardDate;
      if (last !== today) {
        updateStudentData({
          ...studentData,
          currency: (studentData.currency || 0) + REWARD_COINS,
          gameProgress: {
            ...studentData.gameProgress,
            grammarGoalie: {
              ...studentData.gameProgress?.grammarGoalie,
              lastRewardDate: today,
              bestScore: Math.max(finalScore, studentData.gameProgress?.grammarGoalie?.bestScore || 0),
            },
          },
        })
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🧤 Grammar Goalie reward: +${REWARD_COINS} coins!`, 'success');
          })
          .catch((err) => console.error('Error awarding coins:', err));
      } else {
        setRewardMsg('✅ Daily coin reward already collected today — come back tomorrow!');
      }
    } else if (finalScore < REWARD_SCORE) {
      setRewardMsg(`Score ${REWARD_SCORE}+ to earn a daily coin reward!`);
    }

    setScreen('over');
  }, [category, studentData, updateStudentData, showToast]);

  const resolveShot = (choiceIndex, timedOut = false) => {
    if (phase !== 'aim' || !current) return;
    stopTimer();
    setPicked(timedOut ? -1 : choiceIndex);
    const correct = !timedOut && choiceIndex === current.a;

    if (correct) {
      const pts = 50 + timeLeft * 5 + streak * 10;
      const newScore = score + pts;
      const newStreak = streak + 1;
      const newSaves = saves + 1;
      setScore(newScore);
      setStreak(newStreak);
      setSaves(newSaves);
      setPhase('saved');
      synthRef.current?.save(newStreak);
      setTimeout(() => advance(newScore, newSaves, goals), 2100);
    } else {
      const newGoals = goals + 1;
      setGoals(newGoals);
      setStreak(0);
      setPhase('goal');
      synthRef.current?.goal();
      setTimeout(() => {
        if (newGoals >= GOALS_ALLOWED) {
          endGame(score, saves, newGoals, shotNum);
        } else {
          advance(score, saves, newGoals);
        }
      }, 2400);
    }
  };

  const advance = (curScore, curSaves, curGoals) => {
    if (shotNum >= TOTAL_SHOTS) {
      endGame(curScore, curSaves, curGoals, shotNum);
    } else {
      setShotNum((n) => n + 1);
      loadShot(shotNum, null);
    }
  };

  // Timeout = goal conceded
  useEffect(() => {
    if (screen === 'playing' && timeLeft === 0 && phase === 'aim' && current) {
      resolveShot(-1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen, phase, current]);

  const quitToMenu = () => {
    stopTimer();
    setScreen('menu');
  };

  // ── UI ──
  return (
    <div className="max-w-3xl mx-auto">
      {/* MENU */}
      {screen === 'menu' && (
        <div className="bg-gradient-to-b from-sky-700 via-emerald-800 to-emerald-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl md:text-7xl mb-2">🧤</div>
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Grammar <span className="text-yellow-300">Goalie</span>
          </h2>
          <p className="text-white/85 text-sm md:text-base max-w-md mx-auto mt-2">
            Every shot is a sentence with a missing word. Pick the right one before the striker shoots to make the SAVE!
            ⚽ {GOALS_ALLOWED} goals against you and it's full time.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90 mt-4">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">⏱️ {SHOT_TIME}s per shot</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🔥 Save streaks = bonus</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">🥅 {TOTAL_SHOTS} shots per match</span>
          </div>

          <h3 className="text-white font-bold text-lg mt-6 mb-3">Pick your match</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => startGame(c.id)}
                className="bg-white/10 border border-white/25 hover:bg-white/20 text-white rounded-2xl p-4 text-left hover:scale-105 transition-all"
              >
                <div className="text-3xl">{c.emoji}</div>
                <div className="font-black text-base leading-tight mt-1">{c.name}</div>
                <div className="text-white/70 text-xs">{c.desc}</div>
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
        <div className="bg-gradient-to-b from-sky-700 via-emerald-800 to-emerald-900 rounded-3xl shadow-2xl p-4 md:p-6 overflow-hidden">
          {/* Scoreboard */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="bg-black/30 rounded-xl px-3 py-2 text-white">
              <div className="text-[10px] uppercase tracking-wide text-white/60">Score</div>
              <div className="font-black text-lg leading-none">{score.toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center text-white">
                <div className="text-[10px] uppercase tracking-wide text-white/60">Shot</div>
                <div className="font-black text-lg leading-none">{shotNum}<span className="text-white/50 text-sm">/{TOTAL_SHOTS}</span></div>
              </div>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] uppercase tracking-wide text-white/60">Streak</div>
                <div className="font-black text-lg leading-none text-orange-300">🔥{streak}</div>
              </div>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center text-lg tracking-wide">
                {Array.from({ length: GOALS_ALLOWED }).map((_, i) => (
                  <span key={i} className={i < GOALS_ALLOWED - goals ? '' : 'opacity-25 grayscale'}>🧤</span>
                ))}
              </div>
            </div>
            <button onClick={quitToMenu} className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-xl hover:bg-white/20 text-sm">✕</button>
          </div>

          {/* Pitch scene */}
          <div className="relative bg-gradient-to-b from-emerald-600 to-emerald-700 rounded-2xl border border-white/10 px-4 pt-5 pb-3 mb-4 text-center overflow-hidden">
            {/* Goal frame */}
            <div className="mx-auto max-w-xs border-4 border-white/80 border-b-0 rounded-t-xl h-20 relative flex items-center justify-center"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 9px), repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 1px, transparent 1px 9px)' }}
            >
              <div className={`text-4xl transition-all duration-500 ${phase === 'saved' ? 'scale-125' : phase === 'goal' ? 'opacity-40' : ''}`}>
                {phase === 'goal' ? '😱' : '🧤'}
              </div>
              {/* Ball */}
              <div
                className={`absolute text-3xl transition-all duration-500 ${
                  phase === 'aim'
                    ? 'bottom-[-44px] left-1/2 -translate-x-1/2'
                    : phase === 'saved'
                      ? 'bottom-10 left-[12%] rotate-[220deg] opacity-90'
                      : 'bottom-6 left-1/2 -translate-x-1/2 scale-90'
                }`}
              >
                ⚽
              </div>
            </div>
            <div className="text-3xl -mt-1">🏃</div>
            {phase !== 'aim' && (
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                <span className={`font-black text-3xl md:text-4xl px-6 py-2 rounded-2xl shadow-2xl ${phase === 'saved' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'} animate-bounce`}>
                  {phase === 'saved' ? '🧤 SAVED!' : '⚽ GOAL CONCEDED'}
                </span>
              </div>
            )}
          </div>

          {/* Timer bar */}
          <div className="h-2.5 rounded-full bg-black/30 overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-rose-500' : 'bg-gradient-to-r from-yellow-300 to-emerald-400'}`}
              style={{ width: `${(timeLeft / SHOT_TIME) * 100}%` }}
            />
          </div>

          {/* Sentence */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 md:p-5 mb-4 min-h-[72px] flex items-center justify-center">
            <p className="text-white text-lg md:text-2xl font-bold text-center leading-snug">
              {current.s.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block min-w-[70px] border-b-4 border-yellow-300 text-yellow-300 mx-1 px-1">
                      {phase !== 'aim' ? current.c[current.a] : '____'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* Choices */}
          <div className={`grid gap-3 ${current.c.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {current.c.map((choice, i) => {
              const isAnswer = i === current.a;
              const isPicked = i === picked;
              let cls = 'bg-white text-emerald-900 hover:scale-[1.03] hover:shadow-xl';
              if (phase !== 'aim') {
                if (isAnswer) cls = 'bg-emerald-400 text-emerald-950 ring-4 ring-white/60';
                else if (isPicked) cls = 'bg-rose-500 text-white opacity-90';
                else cls = 'bg-white/20 text-white/50';
              }
              return (
                <button
                  key={i}
                  disabled={phase !== 'aim'}
                  onClick={() => resolveShot(i)}
                  className={`rounded-2xl px-4 py-3.5 font-black text-lg md:text-xl transition-all shadow ${cls}`}
                >
                  {choice}
                  {phase !== 'aim' && isAnswer && ' ✓'}
                </button>
              );
            })}
          </div>

          {/* Teaching feedback */}
          {phase !== 'aim' && (
            <div className={`mt-4 rounded-xl p-3 text-sm font-semibold text-center ${phase === 'saved' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/30' : 'bg-rose-500/20 text-rose-100 border border-rose-300/30'}`}>
              💡 {current.why}
            </div>
          )}

          <div className="flex justify-center mt-3">
            <button onClick={toggleMute} className="text-white/50 text-xs hover:text-white transition-colors">
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER */}
      {screen === 'over' && finalStats && (
        <div className="bg-gradient-to-b from-sky-700 via-emerald-800 to-emerald-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl mb-2">{finalStats.cleanSheet ? '🏆' : finalStats.score >= REWARD_SCORE ? '🥇' : '🧤'}</div>
          <h3 className="text-white text-3xl md:text-4xl font-black">
            {finalStats.cleanSheet ? 'CLEAN SHEET!' : 'Full Time!'}
          </h3>
          <div className="text-yellow-300 text-5xl font-black drop-shadow mt-2">{finalStats.score.toLocaleString()}</div>
          {finalStats.score >= highScore && finalStats.score > 0 && (
            <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-black px-4 py-1 rounded-full animate-pulse mt-2">
              🎉 NEW HIGH SCORE!
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 text-white/90 text-sm mt-5">
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black text-emerald-300">🧤 {finalStats.saves}</div>
              <div className="text-white/60 text-xs">Saves</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black text-rose-300">⚽ {finalStats.goals}</div>
              <div className="text-white/60 text-xs">Goals against</div>
            </div>
            <div className="bg-white/10 rounded-xl px-3 py-3">
              <div className="text-xl font-black">{CATEGORIES.find((c) => c.id === finalStats.category)?.emoji}</div>
              <div className="text-white/60 text-xs">{CATEGORIES.find((c) => c.id === finalStats.category)?.name}</div>
            </div>
          </div>
          {rewardMsg && <div className="text-emerald-300 text-sm font-semibold mt-4">{rewardMsg}</div>}
          <div className="flex justify-center gap-3 mt-5">
            <button
              onClick={() => startGame(finalStats.category)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              🔄 Rematch
            </button>
            <button
              onClick={quitToMenu}
              className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all"
            >
              🏠 Matches
            </button>
          </div>
        </div>
      )}

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">🧤</span>
          <span className="text-gray-600"><strong className="text-gray-800">Pick the right word</strong> to save the shot — wrong or too slow concedes a goal.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-gray-600"><strong className="text-gray-800">Answer fast</strong> for a time bonus on every save.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">💡</span>
          <span className="text-gray-600"><strong className="text-gray-800">Learn from misses</strong> — every shot explains the rule.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪙</span>
          <span className="text-gray-600"><strong className="text-gray-800">Score {REWARD_SCORE}+</strong> to earn {REWARD_COINS} coins once a day!</span>
        </div>
      </div>
    </div>
  );
};

export default GrammarGoalieGame;
