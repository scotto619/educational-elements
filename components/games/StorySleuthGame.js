// components/games/StorySleuthGame.js — Story Sleuth 🕵️
// A two-phase reading detective game built on the school's own fluency
// passages (READING_PASSAGES) and spelling lists (SPELLING_LISTS):
//
//   Phase 1 — WORD HUNT: a real fluency passage appears and the student must
//   find all the hidden spelling words by tapping them in the text. Mis-taps
//   shake and cost points; fast, clean sleuthing earns bonuses.
//
//   Phase 2 — FILL THE GAPS: the same passage returns with the target words
//   blanked out. The student rebuilds the story by placing each word into the
//   right gap — reading for meaning, not just word-spotting.
//
// When the student's teacher has assigned them a spelling group, the game
// automatically uses THEIR list's matching passage (passage ids mirror
// spelling list ids). Otherwise they can free-play any level. Star ratings,
// streak bonuses, local best score, and a daily coin reward.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { READING_PASSAGES, SPELLING_LISTS } from '../curriculum/literacy/SpellingProgram';

// ── Tuning ───────────────────────────────────────────────────────────────────
const HUNT_FIND_POINTS = 20;
const HUNT_MISS_PENALTY = 5;
const CLOZE_FIRST_TRY = 30;
const CLOZE_RETRY = 10;
const REWARD_SCORE = 250;      // daily-coin threshold
const REWARD_COINS = 5;
const BEST_KEY = 'storySleuthBestScore';

const TEXT_TYPE_META = {
  narrative: { label: 'Story', emoji: '📖' },
  informational: { label: 'Facts', emoji: '🔬' },
  persuasive: { label: 'Persuade', emoji: '📣' },
  poetry: { label: 'Poem', emoji: '🪶' },
};

const cleanWord = (token) => token.replace(/[^a-zA-Z']/g, '').toLowerCase();

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
    found: () => { tone(700, 0.09, 'sine', 0.09); tone(1050, 0.13, 'sine', 0.09, 0.07); },
    miss: () => tone(180, 0.18, 'sawtooth', 0.09, 0, -60),
    place: () => { tone(520, 0.08, 'triangle', 0.09); tone(780, 0.1, 'triangle', 0.08, 0.06); },
    phase: () => { [523, 659, 784].forEach((f, i) => tone(f, 0.14, 'sine', 0.09, i * 0.09)); },
    win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, i * 0.1)); },
    reward: () => { [659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'sine', 0.09, i * 0.1)); },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const StorySleuthGame = ({ studentData, updateStudentData, showToast, classData }) => {
  const [screen, setScreen] = useState('menu');   // menu | hunt | cloze | results
  const [passage, setPassage] = useState(null);   // { listId, levelName, text:{title,type,content}, targets:[...] }
  const [tokens, setTokens] = useState([]);       // [{ raw, clean, isTarget, targetIndex? }]
  const [foundSet, setFoundSet] = useState(new Set());   // clean target words found in hunt
  const [misses, setMisses] = useState(0);
  const [shakeIdx, setShakeIdx] = useState(null);
  const [score, setScore] = useState(0);
  const [huntStart, setHuntStart] = useState(0);
  const [huntTime, setHuntTime] = useState(0);
  // cloze state
  const [blanks, setBlanks] = useState([]);       // [{ word, filled:false, tries:0 }]
  const [activeBlank, setActiveBlank] = useState(0);
  const [bank, setBank] = useState([]);           // shuffled remaining words
  const [clozeWrong, setClozeWrong] = useState(null); // word chip that shook
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const rewardedRef = useRef(false);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try { setBest(parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0); } catch { /* ignore */ }
  }, []);

  // hunt timer
  useEffect(() => {
    if (screen !== 'hunt') return undefined;
    const t = setInterval(() => setHuntTime(Math.floor((Date.now() - huntStart) / 1000)), 500);
    return () => clearInterval(t);
  }, [screen, huntStart]);

  // ── Which passages belong to this student's assigned spelling lists? ───────
  const assignedPassages = useMemo(() => {
    const groups = Array.isArray(classData?.toolkitData?.spellingGroups)
      ? classData.toolkitData.spellingGroups
      : [];
    const myGroup = groups.find((g) =>
      Array.isArray(g?.students) && g.students.some((s) => s.id === studentData?.id)
    );
    const listIds = myGroup?.assignedLists || [];
    return READING_PASSAGES.filter((p) => listIds.includes(p.id));
  }, [classData, studentData]);

  const passagesForLevel = useCallback((level) =>
    READING_PASSAGES.filter((p) => String(p.id).startsWith(`${level}.`)), []);

  // ── Start a round ───────────────────────────────────────────────────────────
  const startRound = useCallback((pool, poolName) => {
    if (!pool || pool.length === 0) return;
    // pick a passage + text; only keep target words that actually appear
    for (let attempt = 0; attempt < 25; attempt++) {
      const p = pool[Math.floor(Math.random() * pool.length)];
      const texts = p.texts || [];
      if (texts.length === 0) continue;
      const text = texts[Math.floor(Math.random() * texts.length)];
      const words = String(text.content || '').split(/(\s+)/);
      const targetList = [...new Set((p.targetWords || []).map((w) => String(w).toLowerCase()))];
      const present = new Set();
      const toks = words.map((raw) => {
        const clean = cleanWord(raw);
        const isTarget = clean.length > 0 && targetList.includes(clean);
        if (isTarget) present.add(clean);
        return { raw, clean, isTarget };
      });
      const targets = targetList.filter((w) => present.has(w));
      if (targets.length < 4) continue; // need a decent hunt
      setPassage({ listId: p.id, levelName: p.level, poolName, text, targets });
      setTokens(toks);
      setFoundSet(new Set());
      setMisses(0);
      setScore(0);
      setRewardMsg('');
      rewardedRef.current = false;
      setHuntStart(Date.now());
      setHuntTime(0);
      setScreen('hunt');
      return;
    }
    showToast?.('Could not find a suitable passage — try another level!', 'error');
  }, [showToast]);

  // ── Phase 1: word hunt ──────────────────────────────────────────────────────
  const tapToken = (tok, idx) => {
    if (screen !== 'hunt') return;
    if (tok.isTarget && !foundSet.has(tok.clean)) {
      const next = new Set(foundSet);
      next.add(tok.clean);
      setFoundSet(next);
      setScore((s) => s + HUNT_FIND_POINTS);
      synthRef.current?.found();
      if (next.size >= passage.targets.length) {
        // hunt complete → speed bonus, then set up cloze
        const secs = Math.floor((Date.now() - huntStart) / 1000);
        const speedBonus = Math.max(0, 60 - secs);
        setScore((s) => s + speedBonus);
        synthRef.current?.phase();
        setTimeout(() => setupCloze(), 800);
      }
    } else if (tok.clean.length > 0 && (!tok.isTarget || foundSet.has(tok.clean))) {
      setMisses((m) => m + 1);
      setScore((s) => Math.max(0, s - HUNT_MISS_PENALTY));
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 400);
      synthRef.current?.miss();
    }
  };

  // ── Phase 2: cloze setup + play ─────────────────────────────────────────────
  const setupCloze = useCallback(() => {
    setBlanks((prev) => prev); // no-op keeps linter calm about ordering
    setPassage((p) => {
      const blanked = new Set();
      // rebuild tokens: first occurrence of each target becomes a blank
      setTokens((toks) => toks.map((tok) => {
        if (tok.isTarget && !blanked.has(tok.clean)) {
          blanked.add(tok.clean);
          return { ...tok, blankWord: tok.clean };
        }
        return { ...tok, blankWord: undefined };
      }));
      const order = [];
      const seen = new Set();
      // blanks in reading order
      String(p.text.content).split(/(\s+)/).forEach((raw) => {
        const c = cleanWord(raw);
        if (c && p.targets.includes(c) && !seen.has(c)) { seen.add(c); order.push(c); }
      });
      setBlanks(order.map((w) => ({ word: w, filled: false, tries: 0 })));
      setBank(shuffle(order));
      setActiveBlank(0);
      setScreen('cloze');
      return p;
    });
  }, []);

  const finishRound = useCallback((finalScore) => {
    setScreen('results');
    synthRef.current?.win();
    setBest((prev) => {
      const nb = Math.max(prev, finalScore);
      try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
      return nb;
    });
    if (!rewardedRef.current && finalScore >= REWARD_SCORE && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.storySleuth?.lastRewardDate;
      if (last !== today) {
        rewardedRef.current = true;
        Promise.resolve(
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              storySleuth: {
                ...studentData.gameProgress?.storySleuth,
                bestScore: Math.max(finalScore, studentData.gameProgress?.storySleuth?.bestScore || 0),
                lastRewardDate: today,
              },
            },
          })
        )
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🕵️ Story Sleuth reward: +${REWARD_COINS} coins!`, 'success');
            synthRef.current?.reward();
          })
          .catch((err) => console.error('Error awarding coins:', err));
      }
    }
  }, [studentData, updateStudentData, showToast]);

  const pickBankWord = (word) => {
    if (screen !== 'cloze') return;
    const blank = blanks[activeBlank];
    if (!blank || blank.filled) return;
    if (word === blank.word) {
      const pts = blank.tries === 0 ? CLOZE_FIRST_TRY : CLOZE_RETRY;
      const newScore = score + pts;
      setScore(newScore);
      synthRef.current?.place();
      const nextBlanks = blanks.map((b, i) => (i === activeBlank ? { ...b, filled: true } : b));
      setBlanks(nextBlanks);
      setBank((prev) => {
        const i = prev.indexOf(word);
        return prev.filter((_, idx) => idx !== i);
      });
      const nextIdx = nextBlanks.findIndex((b) => !b.filled);
      if (nextIdx === -1) {
        const cleanBonus = misses === 0 && nextBlanks.every((b) => b.tries === 0) ? 50 : 0;
        setTimeout(() => finishRound(newScore + cleanBonus), 600);
        if (cleanBonus) setScore(newScore + cleanBonus);
      } else {
        setActiveBlank(nextIdx);
      }
    } else {
      setBlanks((prev) => prev.map((b, i) => (i === activeBlank ? { ...b, tries: b.tries + 1 } : b)));
      setClozeWrong(word);
      setTimeout(() => setClozeWrong(null), 400);
      synthRef.current?.miss();
    }
  };

  // ── Star rating ─────────────────────────────────────────────────────────────
  const stars = useMemo(() => {
    if (!passage) return 0;
    const maxHunt = passage.targets.length * HUNT_FIND_POINTS;
    const maxCloze = passage.targets.length * CLOZE_FIRST_TRY;
    const ratio = score / Math.max(1, maxHunt + maxCloze);
    return ratio >= 0.95 ? 3 : ratio >= 0.7 ? 2 : 1;
  }, [score, passage]);

  const alreadyRewardedToday =
    studentData?.gameProgress?.storySleuth?.lastRewardDate === new Date().toDateString();

  const typeMeta = TEXT_TYPE_META[passage?.text?.type] || { label: 'Text', emoji: '📄' };

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderHuntText = () => (
    <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
      {tokens.map((tok, i) => {
        if (!tok.clean) return <span key={i}>{tok.raw}</span>;
        const found = tok.isTarget && foundSet.has(tok.clean);
        return (
          <span
            key={i}
            onClick={() => tapToken(tok, i)}
            className={`cursor-pointer rounded px-0.5 transition-colors ${
              found
                ? 'bg-emerald-200 text-emerald-900 font-bold'
                : 'hover:bg-indigo-100'
            } ${shakeIdx === i ? 'bg-red-200 animate-pulse' : ''}`}
          >
            {tok.raw}
          </span>
        );
      })}
    </p>
  );

  const renderClozeText = () => {
    let blankCounter = -1;
    return (
      <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
        {tokens.map((tok, i) => {
          if (tok.blankWord) {
            blankCounter += 1;
            const bIdx = blankCounter;
            const blank = blanks[bIdx];
            if (!blank) return <span key={i}>{tok.raw}</span>;
            return (
              <span
                key={i}
                onClick={() => !blank.filled && setActiveBlank(bIdx)}
                className={`inline-block min-w-16 text-center rounded-lg px-1.5 mx-0.5 font-bold cursor-pointer border-b-4 transition ${
                  blank.filled
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                    : bIdx === activeBlank
                      ? 'bg-amber-100 border-amber-400 text-amber-500 animate-pulse'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {blank.filled ? blank.word : `${bIdx + 1}`}
              </span>
            );
          }
          return <span key={i}>{tok.raw}</span>;
        })}
      </p>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-3xl px-2">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-indigo-600 font-bold">SCORE {score}</span>
          {screen === 'hunt' && (
            <>
              <span className="text-emerald-600 font-bold">🔍 {foundSet.size}/{passage?.targets.length}</span>
              <span className="text-gray-500">⏱️ {huntTime}s</span>
            </>
          )}
          {screen === 'cloze' && (
            <span className="text-amber-600 font-bold">✏️ {blanks.filter((b) => b.filled).length}/{blanks.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 font-mono text-sm">BEST {best}</span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-2 py-1 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-sm"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="w-full max-w-3xl rounded-2xl ring-2 ring-indigo-300/60 shadow-xl bg-white overflow-hidden min-h-96">
        {/* MENU */}
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-96 bg-gradient-to-b from-indigo-50 to-white">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 mb-2">
              🕵️ STORY SLEUTH
            </h2>
            <p className="text-gray-600 max-w-md mb-1 text-sm">
              A reading detective challenge in two rounds! First, HUNT the hidden spelling words
              inside a real story. Then the words vanish — rebuild the story by filling every gap.
            </p>
            <p className="text-gray-400 text-xs mb-5">Careless taps cost points. Sharp eyes and smart reading earn stars!</p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {assignedPassages.length > 0 && (
                <button
                  onClick={() => startRound(assignedPassages, 'My Spelling Words')}
                  className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform shadow-lg"
                >
                  ⭐ My Spelling Stories ({assignedPassages.length} passage{assignedPassages.length !== 1 ? 's' : ''})
                </button>
              )}
              {[1, 2, 3, 4].map((lvl) => {
                const pool = passagesForLevel(lvl);
                if (pool.length === 0) return null;
                return (
                  <button
                    key={lvl}
                    onClick={() => startRound(pool, `Level ${lvl}`)}
                    className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-indigo-500 hover:to-purple-600 hover:scale-105 transition-all"
                  >
                    Level {lvl} {'⭐'.repeat(lvl)}
                  </button>
                );
              })}
            </div>
            {assignedPassages.length === 0 && (
              <p className="text-gray-400 text-xs mt-3">
                Tip: when your teacher assigns your spelling group, your own ⭐ spelling stories appear here!
              </p>
            )}
            <p className="text-xs text-gray-400 mt-4">
              Score <b className="text-gray-600">{REWARD_SCORE}+</b> to earn {REWARD_COINS} coins once a day!
              {alreadyRewardedToday && ' (already earned today ✅)'}
            </p>
          </div>
        )}

        {/* HUNT + CLOZE share the passage layout */}
        {(screen === 'hunt' || screen === 'cloze') && passage && (
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <p className="text-xs font-mono text-gray-400">{passage.levelName} · {passage.poolName}</p>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-600 rounded-full px-2.5 py-0.5">
                {typeMeta.emoji} {typeMeta.label}
              </span>
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-3">{passage.text.title}</h3>

            {screen === 'hunt' && (
              <>
                <div className="bg-indigo-50 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-sm font-bold text-indigo-700">
                    🔍 Find the {passage.targets.length} hidden spelling words!
                  </p>
                  <p className="text-xs text-indigo-400">{misses > 0 && `${misses} mis-tap${misses !== 1 ? 's' : ''}`}</p>
                </div>
                {renderHuntText()}
                {/* found chips */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {passage.targets.map((w) => (
                    <span
                      key={w}
                      className={`text-xs font-bold rounded-full px-2.5 py-1 transition ${
                        foundSet.has(w)
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-300'
                      }`}
                    >
                      {foundSet.has(w) ? w : '?'.repeat(Math.min(w.length, 8))}
                    </span>
                  ))}
                </div>
              </>
            )}

            {screen === 'cloze' && (
              <>
                <div className="bg-amber-50 rounded-xl px-4 py-2.5 mb-4">
                  <p className="text-sm font-bold text-amber-700">
                    ✏️ The words vanished! Tap a numbered gap, then tap the right word below.
                  </p>
                </div>
                {renderClozeText()}
                {/* word bank */}
                <div className="flex flex-wrap gap-2 mt-5 justify-center bg-gray-50 rounded-2xl p-3">
                  {bank.map((w) => (
                    <button
                      key={w}
                      onClick={() => pickBankWord(w)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-sm border-2 transition hover:scale-105 ${
                        clozeWrong === w
                          ? 'bg-red-100 border-red-300 text-red-600 animate-pulse'
                          : 'bg-white border-indigo-200 text-indigo-700 hover:border-indigo-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* RESULTS */}
        {screen === 'results' && passage && (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-96 bg-gradient-to-b from-indigo-50 to-white">
            <p className="text-5xl mb-2">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</p>
            <p className="text-3xl font-black text-indigo-600 mb-1">CASE CLOSED!</p>
            <p className="text-gray-600 font-mono mb-1">
              Score <b className="text-indigo-600">{score}</b> · {passage.targets.length} words · {misses} mis-tap{misses !== 1 ? 's' : ''}
            </p>
            {score >= best && score > 0 && <p className="text-amber-500 font-bold mb-1">🏆 NEW BEST!</p>}
            {rewardMsg && <p className="text-amber-500 font-bold mb-1">{rewardMsg}</p>}
            <div className="flex flex-wrap gap-1.5 mt-3 justify-center max-w-md">
              {passage.targets.map((w) => (
                <span key={w} className="text-xs font-bold rounded-full px-2.5 py-1 bg-emerald-100 text-emerald-700">
                  ✓ {w}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setScreen('menu')}
                className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 transition-transform"
              >
                New Case 🕵️
              </button>
            </div>
          </div>
        )}
      </div>

      {screen === 'hunt' && (
        <p className="text-xs text-gray-400 text-center px-4">
          Tap the spelling words hidden in the passage. The mystery chips below show how many letters each word has!
        </p>
      )}
    </div>
  );
};

export default StorySleuthGame;
