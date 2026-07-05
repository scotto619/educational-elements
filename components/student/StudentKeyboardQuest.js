// components/student/StudentKeyboardQuest.js — Keyboard Quest (student experience)
// Touch-typing adventure: 5 belt stages × 8 lessons with live WPM/accuracy,
// a colour-coded on-screen keyboard that shows which finger to use, star
// ratings, belt tests, and XP/coin rewards.
//
// Reads assignment from classData.toolkitData.keyboardQuest (teacher side).
// Writes progress to studentData.keyboardQuestProgress via updateStudentData.
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  KQ_STAGES, KQ_STAGE_IDS, KQ_LESSON_MAP, getLessonsForStage,
  generateLessonText, generateBeltTest,
  calcWpm, calcAccuracy, starsFor, beltPassed,
  lessonsPassedInStage, bestWpm, avgAccuracy, totalStars,
  FINGERS, fingerForKey, KEYBOARD_ROWS, needsShift, baseKeyFor,
  KQ_REWARDS, defaultKqProgress,
} from '../../utils/keyboardQuestEngine';

const STAGE_THEMES = {
  1: { grad: 'from-amber-400 to-yellow-500', soft: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  2: { grad: 'from-orange-400 to-red-400', soft: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  3: { grad: 'from-emerald-400 to-teal-500', soft: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  4: { grad: 'from-sky-400 to-blue-500', soft: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  5: { grad: 'from-violet-500 to-purple-600', soft: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700' },
};

// Firestore-safe clean
const cleanProgress = (p) => ({
  completedLessons: Object.fromEntries(
    Object.entries(p.completedLessons || {}).map(([id, r]) => [id, {
      bestWpm: Number(r?.bestWpm) || 0,
      bestAcc: Number(r?.bestAcc) || 0,
      stars: Number(r?.stars) || 0,
      passed: !!r?.passed,
      attempts: Number(r?.attempts) || 0,
      timestamp: r?.timestamp || new Date().toISOString(),
    }])
  ),
  belts: Object.fromEntries(
    Object.entries(p.belts || {}).map(([stage, b]) => [stage, {
      wpm: Number(b?.wpm) || 0,
      acc: Number(b?.acc) || 0,
      timestamp: b?.timestamp || new Date().toISOString(),
    }])
  ),
  unlockedStage: Number(p.unlockedStage) || 1,
  totalKeys: Number(p.totalKeys) || 0,
  totalSeconds: Number(p.totalSeconds) || 0,
  lastPractice: p.lastPractice || null,
});

// ─── On-screen keyboard ───────────────────────────────────────────────────────
const OnScreenKeyboard = ({ nextChar }) => {
  const targetKey = nextChar ? baseKeyFor(nextChar) : null;
  const shiftNeeded = nextChar ? needsShift(nextChar) : false;
  const isSpace = nextChar === ' ';

  const keyCls = (k) => {
    const finger = fingerForKey(k);
    const base = finger ? FINGERS[finger].color : 'bg-gray-200';
    const active = targetKey === k && !isSpace;
    return `${base} ${active ? 'ring-4 ring-gray-800 scale-110 z-10 font-extrabold shadow-lg' : 'opacity-80'} `;
  };

  return (
    <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm p-4 select-none">
      <div className="space-y-1.5 max-w-2xl mx-auto">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1.5" style={{ paddingLeft: ri * 12 }}>
            {ri === 3 && (
              <span className={`h-9 px-3 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-600 transition-all ${shiftNeeded ? 'bg-gray-800 text-white ring-4 ring-gray-800 scale-105' : 'bg-gray-200 opacity-80'}`}>
                SHIFT
              </span>
            )}
            {row.map((k) => (
              <span
                key={k}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-gray-700 transition-all ${keyCls(k)}`}
              >
                {k === ' ' ? '' : k.toUpperCase()}
              </span>
            ))}
          </div>
        ))}
        <div className="flex justify-center">
          <span className={`h-8 w-72 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-500 transition-all ${isSpace ? 'bg-gray-800 text-white ring-4 ring-gray-800' : 'bg-gray-200 opacity-80'}`}>
            SPACE
          </span>
        </div>
      </div>
      {/* finger legend + hint */}
      <div className="flex flex-wrap justify-center gap-2 mt-3">
        {nextChar && fingerForKey(baseKeyFor(nextChar)) && (
          <span className="text-xs font-bold text-gray-700 bg-gray-100 rounded-full px-3 py-1">
            👉 Use your {FINGERS[fingerForKey(baseKeyFor(nextChar))].name.toLowerCase()}{shiftNeeded ? ' + SHIFT (other pinky)' : ''}
          </span>
        )}
        {Object.entries(FINGERS).filter(([id]) => id !== 'th').map(([id, f]) => (
          <span key={id} className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${f.color} ${f.text}`}>{f.name}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Typing runner (lessons + belt tests) ─────────────────────────────────────
const TypingRunner = ({ mode, currency, onFinish, onExit }) => {
  // mode: { kind: 'lesson', lesson } | { kind: 'belt', stage }
  const stage = mode.kind === 'lesson' ? KQ_STAGES[mode.lesson.stage] : KQ_STAGES[mode.stage];
  const theme = STAGE_THEMES[stage.id];
  const [text] = useState(() => mode.kind === 'lesson' ? generateLessonText(mode.lesson.id) : generateBeltTest(mode.stage));
  const [pos, setPos] = useState(0);
  const [errors, setErrors] = useState(0);
  const [errorFlash, setErrorFlash] = useState(false);
  const [started, setStarted] = useState(null); // timestamp
  const [, setTick] = useState(0);              // re-render for live WPM
  const [done, setDone] = useState(null);       // { wpm, acc, stars }
  const wrapRef = useRef(null);
  const posRef = useRef(0); posRef.current = pos;
  const errRef = useRef(0); errRef.current = errors;
  const startRef = useRef(null); startRef.current = started;
  const doneRef = useRef(false);

  // live WPM ticker
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(t);
  }, []);

  const finish = useCallback((finalErrors) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const seconds = (Date.now() - (startRef.current || Date.now())) / 1000;
    const wpm = calcWpm(text.length, seconds);
    const acc = calcAccuracy(finalErrors, text.length);
    const stars = mode.kind === 'lesson' ? starsFor(mode.lesson, wpm, acc) : (beltPassed(mode.stage, wpm, acc) ? 1 : 0);
    setDone({ wpm, acc, stars, seconds });
    onFinish({ wpm, acc, stars, seconds, chars: text.length });
  }, [text, mode, onFinish]);

  const handleKey = useCallback((e) => {
    if (doneRef.current) return;
    if (e.key === 'Escape') { onExit(); return; }
    if (e.key === 'Shift' || e.key === 'CapsLock' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) { if (e.key === 'Backspace') e.preventDefault(); return; }
    e.preventDefault();
    if (startRef.current === null) { setStarted(Date.now()); startRef.current = Date.now(); }
    const expected = text[posRef.current];
    if (e.key === expected) {
      const nextPos = posRef.current + 1;
      setPos(nextPos);
      if (nextPos >= text.length) finish(errRef.current);
    } else {
      setErrors((x) => x + 1);
      setErrorFlash(true);
      setTimeout(() => setErrorFlash(false), 150);
    }
  }, [text, finish, onExit]);

  useEffect(() => {
    const el = wrapRef.current;
    if (el) el.focus();
  }, []);

  const liveSeconds = started ? (Date.now() - started) / 1000 : 0;
  const liveWpm = started ? calcWpm(pos, liveSeconds) : 0;
  const liveAcc = calcAccuracy(errors, Math.max(1, pos + errors === 0 ? 1 : pos));
  const pct = Math.round((pos / text.length) * 100);
  const nextChar = text[pos];

  // Results overlay handled by parent — runner shows its own summary card
  if (done) {
    const passed = done.stars >= 1;
    return (
      <div className="space-y-4">
        <div className={`bg-white rounded-2xl shadow-lg p-8 text-center border-t-8 ${passed ? 'border-emerald-400' : 'border-orange-400'}`}>
          <div className="text-6xl mb-2">{mode.kind === 'belt' ? (passed ? stage.beltIcon : '🥋') : passed ? '🎉' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-800">
            {mode.kind === 'belt'
              ? passed ? `${stage.belt} EARNED!` : 'Belt test failed — train and retry!'
              : passed ? `${'⭐'.repeat(done.stars)} ${done.stars}-Star Pass!` : 'So close — try again!'}
          </h2>
          <div className="flex justify-center gap-6 mt-4">
            <div><p className="text-3xl font-bold text-indigo-600">{done.wpm}</p><p className="text-xs font-bold text-gray-400">WPM</p></div>
            <div><p className="text-3xl font-bold text-emerald-600">{done.acc}%</p><p className="text-xs font-bold text-gray-400">ACCURACY</p></div>
            <div><p className="text-3xl font-bold text-gray-700">{Math.round(done.seconds)}s</p><p className="text-xs font-bold text-gray-400">TIME</p></div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Target: {stage.targetWpm}+ WPM at {(mode.kind === 'lesson' && mode.lesson.minAcc) || stage.targetAcc}%+ accuracy
          </p>
          <div className="flex justify-center gap-2 mt-5">
            <button onClick={onExit} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 transition">
              ← Back to map
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* HUD */}
      <div className={`bg-gradient-to-r ${theme.grad} rounded-2xl p-4 text-white shadow-lg`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold">
            {mode.kind === 'lesson' ? `${mode.lesson.icon} ${mode.lesson.name}` : `🥋 ${stage.belt} Test — ${stage.name}`}
          </p>
          <div className="flex items-center gap-4 text-sm font-bold">
            <span>🏎️ {liveWpm} WPM</span>
            <span>🎯 {liveAcc}%</span>
            <span>{pct}%</span>
            <button onClick={onExit} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1.5 text-xs transition">Exit (Esc)</button>
          </div>
        </div>
        <div className="w-full bg-white/25 rounded-full h-2 mt-2">
          <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Text panel — click to focus, listens for keys */}
      <div
        ref={wrapRef}
        tabIndex={0}
        onKeyDown={handleKey}
        className={`bg-white rounded-2xl border-2 shadow-sm p-6 outline-none cursor-text transition-colors focus:border-indigo-400 ${errorFlash ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
      >
        {started === null && (
          <p className="text-center text-sm font-bold text-indigo-500 mb-3 animate-pulse">
            Click here, place your fingers on the home row, and start typing to begin!
          </p>
        )}
        <p className="font-mono text-xl md:text-2xl leading-relaxed break-words text-center">
          {[...text].map((ch, i) => (
            <span
              key={i}
              className={
                i < pos ? 'text-emerald-500'
                  : i === pos ? `bg-indigo-500 text-white rounded px-0.5 ${errorFlash ? 'bg-red-500' : ''}`
                    : 'text-gray-400'
              }
            >
              {ch === ' ' && i === pos ? '␣' : ch}
            </span>
          ))}
        </p>
        {mode.kind === 'lesson' && mode.lesson.tip && started === null && (
          <p className="text-center text-xs text-gray-400 mt-4">💡 {mode.lesson.tip}</p>
        )}
      </div>

      <OnScreenKeyboard nextChar={nextChar} />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
const StudentKeyboardQuest = ({ studentData, classData, showToast = () => {}, updateStudentData }) => {
  const assignment = classData?.toolkitData?.keyboardQuest?.students?.[studentData?.id];
  const [progress, setProgress] = useState(() => ({
    ...defaultKqProgress(),
    ...(studentData?.keyboardQuestProgress || {}),
  }));
  const [mode, setMode] = useState(null); // null | {kind:'lesson',lesson} | {kind:'belt',stage}
  const progressRef = useRef(progress); progressRef.current = progress;

  const maxStage = useMemo(() => {
    if (!assignment?.assignedStage) return 0;
    return Math.min(5, Math.max(assignment.assignedStage, progress.unlockedStage || 1));
  }, [assignment, progress.unlockedStage]);

  const save = useCallback(async (next, rewards) => {
    const cleaned = cleanProgress(next);
    setProgress(cleaned);
    const updates = { keyboardQuestProgress: cleaned };
    if (rewards && (rewards.xp || rewards.coins)) {
      updates.totalPoints = (studentData?.totalPoints || 0) + (rewards.xp || 0);
      updates.currency = (studentData?.currency || 0) + (rewards.coins || 0);
    }
    const ok = await updateStudentData(updates);
    if (!ok) showToast('Could not save your progress — check your connection.', 'error');
  }, [studentData, updateStudentData, showToast]);

  // ── Handle a finished run ───────────────────────────────────────────────────
  const handleFinish = useCallback(async (result) => {
    const cur = cleanProgress(progressRef.current);
    cur.totalKeys += result.chars;
    cur.totalSeconds += Math.round(result.seconds);
    cur.lastPractice = new Date().toISOString();
    let rewards = { xp: 0, coins: 0 };

    if (mode.kind === 'lesson') {
      const prev = cur.completedLessons[mode.lesson.id];
      const passed = result.stars >= 1;
      const firstPass = passed && !prev?.passed;
      const firstThreeStar = result.stars === 3 && (prev?.stars || 0) < 3;
      cur.completedLessons[mode.lesson.id] = {
        bestWpm: Math.max(result.wpm, prev?.bestWpm || 0),
        bestAcc: Math.max(result.acc, prev?.bestAcc || 0),
        stars: Math.max(result.stars, prev?.stars || 0),
        passed: passed || !!prev?.passed,
        attempts: (prev?.attempts || 0) + 1,
        timestamp: new Date().toISOString(),
      };
      if (firstPass) {
        rewards = { xp: KQ_REWARDS.LESSON_XP, coins: KQ_REWARDS.LESSON_COINS };
        showToast(`🎉 Lesson passed! +${KQ_REWARDS.LESSON_XP} XP, +${KQ_REWARDS.LESSON_COINS} coin!`, 'success');
      }
      if (firstThreeStar) {
        rewards.xp += KQ_REWARDS.THREE_STAR_XP;
        showToast(`⭐⭐⭐ Three stars! +${KQ_REWARDS.THREE_STAR_XP} bonus XP!`, 'success');
      }
    } else {
      const stageId = mode.stage;
      const passed = beltPassed(stageId, result.wpm, result.acc);
      const firstBelt = passed && !cur.belts[stageId];
      if (passed) {
        cur.belts[stageId] = {
          wpm: Math.max(result.wpm, cur.belts[stageId]?.wpm || 0),
          acc: Math.max(result.acc, cur.belts[stageId]?.acc || 0),
          timestamp: new Date().toISOString(),
        };
        if (stageId < 5 && cur.unlockedStage < stageId + 1) cur.unlockedStage = stageId + 1;
      }
      if (firstBelt) {
        rewards = { xp: KQ_REWARDS.BELT_XP, coins: KQ_REWARDS.BELT_COINS };
        showToast(
          stageId < 5
            ? `${KQ_STAGES[stageId].beltIcon} ${KQ_STAGES[stageId].belt} earned! Stage ${stageId + 1} unlocked! +${KQ_REWARDS.BELT_XP} XP!`
            : `⚫ BLACK BELT! You are a Speed Legend! +${KQ_REWARDS.BELT_XP} XP!`,
          'success'
        );
      }
    }
    await save(cur, rewards);
  }, [mode, save, showToast]);

  // ── Not assigned ────────────────────────────────────────────────────────────
  if (!assignment?.assignedStage) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8 text-center">
        <div className="text-4xl md:text-6xl mb-4">⌨️</div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Keyboard Quest</h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Your teacher hasn’t assigned you a typing stage yet.
        </p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-6">
          <p className="text-indigo-800 text-sm">
            Ask your teacher to assign you a Keyboard Quest stage in the Resources tab — then start earning belts!
          </p>
        </div>
      </div>
    );
  }

  // ── Active run ──────────────────────────────────────────────────────────────
  if (mode) {
    return (
      <TypingRunner
        key={`${mode.kind}_${mode.kind === 'lesson' ? mode.lesson.id : mode.stage}_${Date.now()}`}
        mode={mode}
        onFinish={handleFinish}
        onExit={() => setMode(null)}
      />
    );
  }

  // ── Quest map ───────────────────────────────────────────────────────────────
  const myBestWpm = bestWpm(progress);
  const myAcc = avgAccuracy(progress);
  const stars = totalStars(progress);
  const beltCount = Object.keys(progress.belts).length;
  const minutes = Math.round(progress.totalSeconds / 60);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-indigo-700 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">⌨️ Keyboard Quest</h1>
            <p className="text-indigo-200 text-sm mt-1">Master touch typing · earn all five belts · become a Speed Legend</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{myBestWpm}</p>
              <p className="text-[10px] font-bold text-indigo-200">BEST WPM</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">{myAcc ?? '—'}{myAcc !== null ? '%' : ''}</p>
              <p className="text-[10px] font-bold text-indigo-200">ACCURACY</p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold">⭐ {stars}</p>
              <p className="text-[10px] font-bold text-indigo-200">STARS</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
          {KQ_STAGE_IDS.map((sid) => (
            <span
              key={sid}
              className={`rounded-full px-3 py-1 font-bold ${progress.belts[sid] ? 'bg-white text-indigo-800' : 'bg-white/15 text-indigo-200'}`}
              title={progress.belts[sid] ? `Earned at ${progress.belts[sid].wpm} WPM` : `Complete Stage ${sid} to earn`}
            >
              {KQ_STAGES[sid].beltIcon} {KQ_STAGES[sid].belt}{progress.belts[sid] ? ' ✓' : ''}
            </span>
          ))}
          {minutes > 0 && <span className="bg-white/15 rounded-full px-3 py-1">⏱️ {minutes} min practised</span>}
        </div>
      </div>

      {/* Stage map */}
      {KQ_STAGE_IDS.map((sid) => {
        const info = KQ_STAGES[sid];
        const theme = STAGE_THEMES[sid];
        const unlocked = sid <= maxStage;
        const lessons = getLessonsForStage(sid);
        const passedCount = lessonsPassedInStage(progress, sid);
        const beltEarned = !!progress.belts[sid];
        const beltReady = passedCount === lessons.length;

        if (!unlocked) {
          return (
            <div key={sid} className="bg-gray-100 rounded-2xl p-5 border border-gray-200 opacity-70">
              <p className="font-bold text-gray-500">🔒 Stage {sid}: {info.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                {sid === maxStage + 1 ? `Earn the ${KQ_STAGES[sid - 1].belt} to unlock this stage!` : 'Locked for now — keep training!'}
              </p>
            </div>
          );
        }

        return (
          <div key={sid} className={`bg-white rounded-2xl border-2 ${beltEarned ? theme.border : 'border-gray-200'} shadow-sm overflow-hidden`}>
            <div className={`bg-gradient-to-r ${theme.grad} px-5 py-4 text-white`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-lg">{info.icon} Stage {sid}: {info.name} {beltEarned && info.beltIcon}</h3>
                  <p className="text-xs opacity-90">{info.description}</p>
                </div>
                <span className="bg-white/25 rounded-full px-3 py-1 text-xs font-bold">
                  {passedCount}/{lessons.length} · {info.targetWpm}+ WPM
                </span>
              </div>
            </div>
            <div className="p-4 grid sm:grid-cols-3 lg:grid-cols-3 gap-2.5">
              {lessons.map((lesson) => {
                const rec = progress.completedLessons[lesson.id];
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setMode({ kind: 'lesson', lesson })}
                    className={`text-left rounded-xl border-2 p-3 transition hover:shadow-md ${
                      rec?.passed ? `${theme.soft} ${theme.border}` : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{lesson.icon} {lesson.name}</p>
                    <p className="text-xs mt-1 font-medium text-gray-500">
                      {rec?.passed
                        ? <>{'⭐'.repeat(rec.stars)}{'☆'.repeat(3 - rec.stars)} · {rec.bestWpm} WPM</>
                        : rec ? `Best ${rec.bestWpm} WPM — not passed yet` : lesson.newKeys.length > 0 ? `New keys: ${lesson.newKeys.join(' ')}` : 'Not started'}
                    </p>
                  </button>
                );
              })}
              {/* Belt test */}
              <button
                onClick={() => {
                  if (!beltReady) return showToast(`Pass all ${lessons.length} lessons first to attempt the belt test!`, 'info');
                  setMode({ kind: 'belt', stage: sid });
                }}
                className={`text-left rounded-xl border-2 p-3 transition ${
                  beltEarned
                    ? 'border-yellow-400 bg-yellow-50'
                    : beltReady
                      ? 'border-gray-800 bg-gray-900 text-white hover:shadow-lg'
                      : 'border-dashed border-gray-300 bg-gray-50 text-gray-400'
                }`}
              >
                <p className={`font-bold text-sm ${beltEarned ? 'text-yellow-700' : ''}`}>
                  {beltEarned ? `${info.beltIcon} ${info.belt} Earned!` : `🥋 ${info.belt} Test`}
                </p>
                <p className={`text-xs mt-1 font-medium ${beltEarned ? 'text-yellow-600' : beltReady ? 'text-gray-300' : 'text-gray-400'}`}>
                  {beltEarned
                    ? `${progress.belts[sid].wpm} WPM at ${progress.belts[sid].acc}% — retake any time!`
                    : beltReady
                      ? `Long text · ${info.targetWpm}+ WPM at ${info.targetAcc}%+ to earn the belt`
                      : `Unlocks after all ${lessons.length} lessons`}
                </p>
              </button>
            </div>
          </div>
        );
      })}

      {/* Posture tips */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">🧘 Typing Champion Checklist</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
          <p>🪑 Sit tall, feet flat on the floor</p>
          <p>🖐️ Fingers resting on the home row bumps (F and J)</p>
          <p>👀 Eyes on the screen — never the keyboard</p>
          <p>🎵 Steady rhythm beats bursts of speed</p>
        </div>
      </div>
    </div>
  );
};

export default StudentKeyboardQuest;
