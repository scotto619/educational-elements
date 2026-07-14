// components/games/SpellCasterGame.js — Spell Caster 🧙‍♂️
// A spelling battle game! Monsters march toward your wizard, and the only way
// to stop them is to SPELL. Each word is read aloud (text-to-speech) and the
// student types it — correct spelling casts a lightning bolt, a typo lets the
// monster creep closer and shows the correct spelling to learn from. Words are
// recycled until mastered, missed words return more often, and the end screen
// lists "words to practise". Uses the student's ACTUAL assigned spelling words
// (from their class spelling group) when available, otherwise the built-in
// Level 1-4 spelling program lists. Streaks, boss rounds, hints, daily coins.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SPELLING_LISTS } from '../curriculum/literacy/SpellingProgram';

// ── Tuning ───────────────────────────────────────────────────────────────────
const START_HEARTS = 3;
const BASE_WALK_TIME = 26;      // seconds for a monster to cross at wave 1
const MIN_WALK_TIME = 11;
const BOSS_EVERY = 5;           // every Nth monster is a boss
const REWARD_CORRECT = 10;      // correct words needed for daily coins
const REWARD_COINS = 5;
const BEST_KEY = 'spellCasterBestScore';

const MONSTERS = ['👾', '🧟', '👹', '👻', '🦇', '🧌', '🐺', '💀', '🐍', '🕷️'];
const BOSSES = ['🐉', '👿', '🤖', '🦖'];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ── Tiny WebAudio synth ───────────────────────────────────────────────────────
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
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };
  return {
    zap: () => { tone(880, 0.08, 'square', 0.08, 0, -500); tone(1400, 0.15, 'sawtooth', 0.06, 0.04, -900); },
    wrong: () => { tone(220, 0.18, 'triangle', 0.1, 0, -60); tone(160, 0.25, 'triangle', 0.09, 0.12, -40); },
    hurt: () => { tone(120, 0.35, 'sawtooth', 0.12, 0, -50); },
    boss: () => { tone(90, 0.4, 'sawtooth', 0.1); tone(70, 0.5, 'sawtooth', 0.1, 0.2); },
    streak: () => { [660, 880, 1100].forEach((f, i) => tone(f, 0.1, 'sine', 0.08, i * 0.06)); },
    reward: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.09, i * 0.1)); },
    gameover: () => { [400, 320, 240, 160].forEach((f, i) => tone(f, 0.25, 'triangle', 0.1, i * 0.18)); },
  };
}

// ── Text-to-speech ────────────────────────────────────────────────────────────
const speakWord = (word, slow = false) => {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = slow ? 0.45 : 0.8;
    u.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find((v) => v.lang?.startsWith('en-AU'))
      || voices.find((v) => v.lang?.startsWith('en-GB'))
      || voices.find((v) => v.lang?.startsWith('en'));
    if (en) u.voice = en;
    window.speechSynthesis.speak(u);
  } catch { /* speech not available */ }
};

// ── Component ─────────────────────────────────────────────────────────────────
const SpellCasterGame = ({ studentData, updateStudentData, showToast, classData }) => {
  const [screen, setScreen] = useState('menu'); // menu | battle | gameover
  const [wordBankName, setWordBankName] = useState('');
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(START_HEARTS);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [monsterNum, setMonsterNum] = useState(1);
  const [monster, setMonster] = useState('👾');
  const [isBoss, setIsBoss] = useState(false);
  const [monsterPos, setMonsterPos] = useState(100); // 100 = right edge, 0 = reached wizard
  const [currentWord, setCurrentWord] = useState('');
  const [typed, setTyped] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // {type:'correct'|'wrong'|'hurt', text}
  const [zapAnim, setZapAnim] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const queueRef = useRef([]);       // upcoming words
  const wordRef = useRef('');
  const posRef = useRef(100);
  const frozenRef = useRef(false);   // pause monster while feedback shows
  const walkTimeRef = useRef(BASE_WALK_TIME);
  const attemptsRef = useRef({});    // word -> {right, wrong}
  const rewardedRef = useRef(false);
  const inputRef = useRef(null);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try { setBest(parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0); } catch { /* ignore */ }
    // warm up the voice list (loads async in some browsers)
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.getVoices();
    return () => { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
  }, []);

  // ── Word banks ──────────────────────────────────────────────────────────────
  const assignedWords = useMemo(() => {
    const groups = Array.isArray(classData?.toolkitData?.spellingGroups)
      ? classData.toolkitData.spellingGroups
      : [];
    const myGroup = groups.find((g) =>
      Array.isArray(g?.students) && g.students.some((s) => s.id === studentData?.id)
    );
    const words = (myGroup?.assignedLists || [])
      .flatMap((listId) => SPELLING_LISTS.find((l) => l.id === listId)?.words || []);
    return [...new Set(words.map((w) => String(w).toLowerCase().trim()).filter(Boolean))];
  }, [classData, studentData]);

  const levelWords = useCallback((level) => {
    const words = SPELLING_LISTS
      .filter((l) => l.id.startsWith(`${level}.`))
      .flatMap((l) => l.words);
    return [...new Set(words.map((w) => String(w).toLowerCase().trim()).filter(Boolean))];
  }, []);

  // ── Battle flow ─────────────────────────────────────────────────────────────
  const nextMonster = useCallback((num) => {
    if (queueRef.current.length === 0) return; // shouldn't happen (words recycle)
    const word = queueRef.current.shift();
    wordRef.current = word;
    setCurrentWord(word);
    const boss = num % BOSS_EVERY === 0;
    setIsBoss(boss);
    setMonster(boss
      ? BOSSES[Math.floor(Math.random() * BOSSES.length)]
      : MONSTERS[Math.floor(Math.random() * MONSTERS.length)]);
    setMonsterNum(num);
    setMonsterPos(100);
    posRef.current = 100;
    walkTimeRef.current = Math.max(MIN_WALK_TIME, (BASE_WALK_TIME - num * 0.5) * (boss ? 0.8 : 1));
    setTyped('');
    setHintUsed(false);
    setShowHint(false);
    setFeedback(null);
    frozenRef.current = false;
    if (boss) synthRef.current?.boss();
    setTimeout(() => speakWord(word), 350);
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const startGame = useCallback((words, bankName) => {
    if (!words || words.length < 3) return;
    queueRef.current = shuffle(words);
    attemptsRef.current = {};
    rewardedRef.current = false;
    setWordBankName(bankName);
    setScore(0);
    setHearts(START_HEARTS);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setWrongWords([]);
    setRewardMsg('');
    setScreen('battle');
    nextMonster(1);
  }, [nextMonster]);

  const recycleWord = useCallback((word, missed) => {
    // Missed words come back soon; mastered words go to the back of the queue.
    const q = queueRef.current;
    if (missed) q.splice(Math.min(2, q.length), 0, word);
    else q.push(word);
  }, []);

  const maybeAwardCoins = useCallback((finalCorrect, finalScore) => {
    if (rewardedRef.current) return;
    if (finalCorrect >= REWARD_CORRECT && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.spellCaster?.lastRewardDate;
      if (last !== today) {
        rewardedRef.current = true;
        Promise.resolve(
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              spellCaster: {
                ...studentData.gameProgress?.spellCaster,
                bestScore: Math.max(finalScore, studentData.gameProgress?.spellCaster?.bestScore || 0),
                lastRewardDate: today,
              },
            },
          })
        )
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🧙 Spell Caster reward: +${REWARD_COINS} coins!`, 'success');
            synthRef.current?.reward();
          })
          .catch((err) => console.error('Error awarding coins:', err));
      }
    }
  }, [studentData, updateStudentData, showToast]);

  const endGame = useCallback((finalCorrect, finalScore) => {
    setScreen('gameover');
    synthRef.current?.gameover();
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setBest((prev) => {
      const nb = Math.max(prev, finalScore);
      try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
      return nb;
    });
    maybeAwardCoins(finalCorrect, finalScore);
  }, [maybeAwardCoins]);

  const loseHeart = useCallback(() => {
    synthRef.current?.hurt();
    setFeedback({ type: 'hurt', text: `The monster got through! The word was "${wordRef.current}".` });
    frozenRef.current = true;
    recycleWord(wordRef.current, true);
    setWrongWords((prev) => (prev.includes(wordRef.current) ? prev : [...prev, wordRef.current]));
    setStreak(0);
    setHearts((h) => {
      const nh = h - 1;
      if (nh <= 0) {
        setTimeout(() => {
          setCorrectCount((c) => { setScore((s) => { endGame(c, s); return s; }); return c; });
        }, 1400);
      } else {
        setMonsterNum((n) => { setTimeout(() => nextMonster(n + 1), 2200); return n; });
      }
      return nh;
    });
  }, [endGame, nextMonster, recycleWord]);

  // monster walking (rAF)
  useEffect(() => {
    if (screen !== 'battle') return undefined;
    let raf;
    let last = performance.now();
    const step = (t) => {
      const dt = (t - last) / 1000;
      last = t;
      if (!frozenRef.current) {
        posRef.current -= (100 / walkTimeRef.current) * dt;
        if (posRef.current <= 0) {
          posRef.current = 100;
          loseHeart();
        }
        setMonsterPos(Math.max(0, posRef.current));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [screen, loseHeart]);

  // ── Casting (submitting a spelling) ────────────────────────────────────────
  const castSpell = useCallback(() => {
    const guess = typed.trim().toLowerCase();
    if (!guess || frozenRef.current) return;
    const word = wordRef.current;
    const stats = attemptsRef.current[word] || { right: 0, wrong: 0 };

    if (guess === word) {
      stats.right += 1;
      attemptsRef.current[word] = stats;
      synthRef.current?.zap();
      setZapAnim(true);
      setTimeout(() => setZapAnim(false), 450);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((b) => Math.max(b, newStreak));
      if (newStreak > 0 && newStreak % 5 === 0) synthRef.current?.streak();
      let pts = 10 + word.length * 2;
      pts = Math.round(pts * (1 + Math.min(newStreak, 10) * 0.1));
      if (isBoss) pts *= 3;
      if (hintUsed) pts = Math.ceil(pts / 2);
      setScore((s) => s + pts);
      setCorrectCount((c) => c + 1);
      setFeedback({ type: 'correct', text: `⚡ ZAP! +${pts} points${isBoss ? ' (BOSS x3!)' : ''}` });
      frozenRef.current = true;
      recycleWord(word, false);
      setMonsterNum((n) => { setTimeout(() => nextMonster(n + 1), 1100); return n; });
    } else {
      stats.wrong += 1;
      attemptsRef.current[word] = stats;
      synthRef.current?.wrong();
      setStreak(0);
      setWrongWords((prev) => (prev.includes(word) ? prev : [...prev, word]));
      // monster lunges forward as a penalty
      posRef.current = Math.max(6, posRef.current - 22);
      setMonsterPos(posRef.current);
      setFeedback({ type: 'wrong', text: `Not quite! It's spelled "${word}" — it'll be back, get it next time!` });
      setTyped('');
      frozenRef.current = true;
      setTimeout(() => {
        setFeedback(null);
        frozenRef.current = false;
        speakWord(word); // hear it again before it returns later
        // move on to a different word so they don't just copy the answer
        recycleWord(word, true);
        setMonsterNum((n) => { nextMonster(n + 1); return n; });
      }, 2600);
    }
  }, [typed, streak, isBoss, hintUsed, nextMonster, recycleWord]);

  const hintText = useMemo(() => {
    if (!currentWord) return '';
    return currentWord
      .split('')
      .map((ch, i) => (i === 0 || ch === ' ' ? ch : '_'))
      .join(' ');
  }, [currentWord]);

  const alreadyRewardedToday =
    studentData?.gameProgress?.spellCaster?.lastRewardDate === new Date().toDateString();

  const heartsDisplay = '❤️'.repeat(Math.max(0, hearts)) + '🖤'.repeat(Math.max(0, START_HEARTS - hearts));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-purple-600 font-bold">SCORE {score}</span>
          <span className="text-orange-500 font-bold">{streak > 1 ? `🔥x${streak}` : ''}</span>
          <span>{screen === 'battle' ? heartsDisplay : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 font-mono text-sm">BEST {best}</span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-sm"
            title={muted ? 'Unmute effects' : 'Mute effects'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden ring-2 ring-purple-400/50 shadow-xl bg-gradient-to-b from-indigo-950 via-purple-900 to-indigo-950 min-h-96">
        {/* MENU */}
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-96">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300 mb-2">
              🧙‍♂️ SPELL CASTER
            </h2>
            <p className="text-purple-200 max-w-md mb-1 text-sm">
              Monsters are coming — and only correct SPELLING can stop them!
              Listen to the word 🔊, type it, and press Enter to cast your lightning bolt.
            </p>
            <p className="text-purple-300/70 text-xs mb-5">
              Typos let the monster lunge closer. Missed words come back until you beat them!
            </p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {assignedWords.length >= 3 && (
                <button
                  onClick={() => startGame(assignedWords, 'My Spelling Words')}
                  className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-pink-600 hover:scale-105 transition-transform shadow-lg"
                >
                  ⭐ My Spelling Words ({assignedWords.length})
                </button>
              )}
              {[1, 2, 3, 4, 5, 6].map((lvl) => {
                const words = levelWords(lvl);
                if (words.length < 3) return null;
                return (
                  <button
                    key={lvl}
                    onClick={() => startGame(words, `Level ${lvl}`)}
                    className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
                  >
                    Level {lvl} {'⭐'.repeat(lvl)}
                  </button>
                );
              })}
            </div>
            {assignedWords.length < 3 && (
              <p className="text-purple-300/60 text-xs mt-3">
                Tip: when your teacher assigns you a spelling group, a ⭐ My Spelling Words mode appears here!
              </p>
            )}
            <p className="text-xs text-white/50 mt-4">
              Spell <b className="text-white/80">{REWARD_CORRECT}+</b> words correctly to earn {REWARD_COINS} coins once a day!
              {alreadyRewardedToday && ' (already earned today ✅)'}
            </p>
          </div>
        )}

        {/* BATTLE */}
        {screen === 'battle' && (
          <div className="flex flex-col min-h-96 p-4">
            <div className="text-center text-purple-300/80 text-xs font-mono mb-2">
              {wordBankName} · Monster #{monsterNum} {isBoss && <span className="text-red-300 font-bold">👑 BOSS — TRIPLE POINTS!</span>}
            </div>

            {/* Arena */}
            <div className="relative h-32 mb-3">
              {/* ground */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500/40 rounded" />
              {/* wizard */}
              <div className={`absolute bottom-1 left-2 text-5xl transition-transform ${zapAnim ? 'scale-125' : ''}`}>🧙‍♂️</div>
              {/* lightning bolt */}
              {zapAnim && (
                <div className="absolute bottom-8 left-16 right-8 flex items-center">
                  <div className="w-full text-2xl tracking-widest text-yellow-300 animate-pulse overflow-hidden whitespace-nowrap">
                    ⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡
                  </div>
                </div>
              )}
              {/* monster */}
              <div
                className={`absolute bottom-1 ${isBoss ? 'text-6xl' : 'text-5xl'} ${zapAnim ? 'opacity-0 -translate-y-8 rotate-45' : ''} transition-all`}
                style={{ left: `calc(3.5rem + ${monsterPos}% * 0.82)` }}
              >
                {monster}
              </div>
              {/* danger indicator */}
              {monsterPos < 25 && !zapAnim && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-red-400 font-bold text-sm animate-pulse">
                  ⚠️ IT&apos;S GETTING CLOSE!
                </div>
              )}
            </div>

            {/* word controls */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                onClick={() => speakWord(wordRef.current)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
              >
                🔊 Hear word
              </button>
              <button
                onClick={() => speakWord(wordRef.current, true)}
                className="px-3 py-2 rounded-xl bg-purple-700/70 hover:bg-purple-600 text-white text-sm"
              >
                🐢 Slow
              </button>
              <button
                onClick={() => { setShowHint(true); setHintUsed(true); }}
                disabled={showHint}
                className="px-3 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 disabled:opacity-40 text-white text-sm"
              >
                💡 Hint (½ points)
              </button>
            </div>

            {showHint && (
              <p className="text-center font-mono text-xl text-amber-300 tracking-widest mb-2">{hintText}</p>
            )}

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); castSpell(); }}
              className="flex items-center justify-center gap-2 mb-3"
            >
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type the word..."
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={!!feedback}
                className="px-4 py-3 rounded-xl bg-white/95 text-gray-900 font-bold text-lg text-center w-56 outline-none ring-2 ring-purple-400 focus:ring-amber-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!!feedback || !typed.trim()}
                className="px-5 py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:scale-105 transition-transform disabled:opacity-40"
              >
                ⚡ CAST
              </button>
            </form>

            {/* feedback */}
            <div className="min-h-8 text-center">
              {feedback && (
                <p className={`font-bold ${
                  feedback.type === 'correct' ? 'text-green-300'
                    : feedback.type === 'wrong' ? 'text-amber-300'
                      : 'text-red-300'
                }`}>
                  {feedback.text}
                </p>
              )}
            </div>

            <p className="text-center text-purple-300/50 text-xs mt-auto">
              ✅ {correctCount} spelled correctly {correctCount < REWARD_CORRECT ? `· ${REWARD_CORRECT - correctCount} to go for daily coins` : '· daily goal reached! 🪙'}
            </p>
          </div>
        )}

        {/* GAME OVER */}
        {screen === 'gameover' && (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-96">
            <p className="text-3xl font-black text-pink-300 mb-1">🏰 THE MONSTERS WON... THIS TIME!</p>
            <p className="text-white/90 font-mono mb-1">
              Score: <b className="text-amber-300">{score}</b> · {correctCount} words spelled · best streak 🔥{bestStreak}
            </p>
            {score >= best && score > 0 && <p className="text-yellow-300 font-bold mb-1">🏆 NEW BEST!</p>}
            {rewardMsg && <p className="text-yellow-300 font-bold mb-1">{rewardMsg}</p>}

            {wrongWords.length > 0 && (
              <div className="mt-3 max-w-md">
                <p className="text-purple-200 font-bold text-sm mb-2">📚 Words to practise:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {wrongWords.map((w) => (
                    <button
                      key={w}
                      onClick={() => speakWord(w)}
                      title="Tap to hear"
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 font-mono text-sm"
                    >
                      🔊 {w}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {wrongWords.length === 0 && correctCount > 0 && (
              <p className="text-green-300 font-bold mt-2">💯 Perfect spelling — not a single miss!</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setScreen('menu')}
                className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-pink-600 hover:scale-105 transition-transform"
              >
                Play Again 🧙‍♂️
              </button>
            </div>
          </div>
        )}
      </div>

      {screen === 'battle' && (
        <p className="text-xs text-gray-400 text-center px-4">
          Listen 🔊 → type the word → press <b>Enter</b> to cast. Streaks boost your points — bosses are worth triple!
        </p>
      )}
    </div>
  );
};

export default SpellCasterGame;
