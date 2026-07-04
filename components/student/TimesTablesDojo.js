// components/student/TimesTablesDojo.js — Times Tables Dojo 🥋
// A multiplication MASTERY tool for the Learning → Maths section (a trainer,
// not a game). Every times-table fact the student ever answers is tracked, and
// the dojo shows exactly where they stand:
//
//   • A 12×12 heatmap — every fact coloured by mastery (grey = not yet seen,
//     red/amber = still learning, green = mastered, dark green = super solid).
//   • Smart Practice — automatically serves the facts the student is weakest
//     at (unseen facts first, then lowest accuracy).
//   • Table Focus — drill any single table, and Sprint — a 60-second blitz.
//   • A belt system (white → black) earned by mastering facts, just like a
//     real dojo. A fact is "mastered" after 3+ correct with 80%+ accuracy.
//
// Progress persists to studentData.gameProgress.timesTablesDojo, so the belt
// and heatmap follow the student across devices.
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── Tuning ───────────────────────────────────────────────────────────────────
const MAX_TABLE = 12;
const SESSION_QUESTIONS = 12;
const SPRINT_SECONDS = 60;
const MASTERY_MIN_CORRECT = 3;
const MASTERY_MIN_ACCURACY = 0.8;

// 78 unique facts (3x7 and 7x3 count as the same fact)
const ALL_FACTS = [];
for (let a = 1; a <= MAX_TABLE; a++) {
  for (let b = a; b <= MAX_TABLE; b++) ALL_FACTS.push(`${a}x${b}`);
}

const BELTS = [
  { name: 'White Belt', color: 'bg-gray-100 text-gray-700 border-gray-300', bar: 'bg-gray-400', need: 0 },
  { name: 'Yellow Belt', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', bar: 'bg-yellow-400', need: 8 },
  { name: 'Orange Belt', color: 'bg-orange-100 text-orange-700 border-orange-300', bar: 'bg-orange-400', need: 18 },
  { name: 'Green Belt', color: 'bg-green-100 text-green-700 border-green-300', bar: 'bg-green-500', need: 30 },
  { name: 'Blue Belt', color: 'bg-blue-100 text-blue-700 border-blue-300', bar: 'bg-blue-500', need: 44 },
  { name: 'Purple Belt', color: 'bg-purple-100 text-purple-700 border-purple-300', bar: 'bg-purple-500', need: 56 },
  { name: 'Brown Belt', color: 'bg-amber-200 text-amber-900 border-amber-400', bar: 'bg-amber-700', need: 68 },
  { name: 'Black Belt', color: 'bg-gray-900 text-white border-gray-900', bar: 'bg-gray-900', need: 78 },
];

const factKey = (a, b) => `${Math.min(a, b)}x${Math.max(a, b)}`;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const factStats = (facts, key) => {
  const f = facts[key] || { c: 0, w: 0 };
  const total = f.c + f.w;
  const acc = total > 0 ? f.c / total : 0;
  const mastered = f.c >= MASTERY_MIN_CORRECT && acc >= MASTERY_MIN_ACCURACY;
  return { ...f, total, acc, mastered };
};

const cellColor = (stats) => {
  if (stats.total === 0) return 'bg-slate-100 hover:bg-slate-200';
  if (stats.mastered) return stats.c >= 6 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-300 hover:bg-emerald-400';
  if (stats.acc < 0.5) return 'bg-rose-300 hover:bg-rose-400';
  return 'bg-amber-300 hover:bg-amber-400';
};

// ── Component ─────────────────────────────────────────────────────────────────
const TimesTablesDojo = ({ studentData, showToast, updateStudentData }) => {
  const [view, setView] = useState('dojo');       // dojo | session | done
  const [facts, setFacts] = useState({});         // { "3x7": {c, w} }
  const [selectedCell, setSelectedCell] = useState(null); // "3x7"
  const [mode, setMode] = useState(null);         // smart | table | sprint
  const [tablePick, setTablePick] = useState(null);
  // session state
  const [queue, setQueue] = useState([]);         // [{a, b}]
  const [qIndex, setQIndex] = useState(0);
  const [current, setCurrent] = useState(null);   // {a, b}
  const [typed, setTyped] = useState('');
  const [flash, setFlash] = useState(null);       // 'right' | 'wrong'
  const [sessionLog, setSessionLog] = useState([]); // [{key, right}]
  const [sprintLeft, setSprintLeft] = useState(SPRINT_SECONDS);
  const [beltUp, setBeltUp] = useState(null);
  const inputRef = useRef(null);
  const savingRef = useRef(false);

  // load persisted mastery
  useEffect(() => {
    const saved = studentData?.gameProgress?.timesTablesDojo?.facts;
    if (saved && typeof saved === 'object') setFacts(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived mastery info ────────────────────────────────────────────────────
  const masteredCount = useMemo(
    () => ALL_FACTS.filter((k) => factStats(facts, k).mastered).length,
    [facts]
  );
  const belt = useMemo(() => {
    let b = BELTS[0];
    for (const candidate of BELTS) if (masteredCount >= candidate.need) b = candidate;
    return b;
  }, [masteredCount]);
  const nextBelt = BELTS[BELTS.indexOf(belt) + 1] || null;

  // ── Question picking ────────────────────────────────────────────────────────
  const weakestFacts = useCallback((count) => {
    const scored = ALL_FACTS.map((k) => {
      const s = factStats(facts, k);
      // lower score = weaker → unseen first, then low accuracy, then few reps
      const score = s.total === 0 ? -1 : s.acc * 10 + Math.min(s.c, 6) * 0.5;
      return { k, score };
    });
    scored.sort((x, y) => x.score - y.score || Math.random() - 0.5);
    return scored.slice(0, count).map(({ k }) => {
      const [a, b] = k.split('x').map(Number);
      return Math.random() < 0.5 ? { a, b } : { a: b, b: a };
    });
  }, [facts]);

  const startSession = useCallback((newMode, table = null) => {
    let qs;
    if (newMode === 'table') {
      qs = shuffle(Array.from({ length: MAX_TABLE }, (_, i) => (
        Math.random() < 0.5 ? { a: table, b: i + 1 } : { a: i + 1, b: table }
      )));
    } else if (newMode === 'smart') {
      qs = shuffle(weakestFacts(SESSION_QUESTIONS));
    } else {
      qs = shuffle(weakestFacts(30)); // sprint pool — refilled as needed
    }
    setMode(newMode);
    setTablePick(table);
    setQueue(qs);
    setQIndex(0);
    setCurrent(qs[0]);
    setTyped('');
    setSessionLog([]);
    setFlash(null);
    setBeltUp(null);
    setSprintLeft(SPRINT_SECONDS);
    setView('session');
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [weakestFacts]);

  // sprint countdown
  useEffect(() => {
    if (view !== 'session' || mode !== 'sprint') return undefined;
    if (sprintLeft <= 0) { endSession(); return undefined; }
    const t = setTimeout(() => setSprintLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, mode, sprintLeft]);

  // ── Persist mastery ─────────────────────────────────────────────────────────
  const saveFacts = useCallback((updatedFacts, newMastered) => {
    if (!studentData || !updateStudentData || savingRef.current) return;
    savingRef.current = true;
    Promise.resolve(
      updateStudentData({
        ...studentData,
        gameProgress: {
          ...studentData.gameProgress,
          timesTablesDojo: {
            ...studentData.gameProgress?.timesTablesDojo,
            facts: updatedFacts,
            masteredCount: newMastered,
            lastPractised: new Date().toISOString(),
          },
        },
      })
    )
      .catch((err) => console.error('Dojo: error saving progress', err))
      .finally(() => { savingRef.current = false; });
  }, [studentData, updateStudentData]);

  const endSession = useCallback(() => {
    setView('done');
    const newMastered = ALL_FACTS.filter((k) => factStats(facts, k).mastered).length;
    // belt-up detection: compare against saved masteredCount
    const prevSaved = studentData?.gameProgress?.timesTablesDojo?.masteredCount || 0;
    const prevBelt = BELTS.reduce((acc, b) => (prevSaved >= b.need ? b : acc), BELTS[0]);
    const nowBelt = BELTS.reduce((acc, b) => (newMastered >= b.need ? b : acc), BELTS[0]);
    if (nowBelt.need > prevBelt.need) {
      setBeltUp(nowBelt);
      showToast?.(`🥋 Belt up! You earned your ${nowBelt.name}!`, 'success');
    }
    saveFacts(facts, newMastered);
  }, [facts, saveFacts, studentData, showToast]);

  // ── Answering ───────────────────────────────────────────────────────────────
  const submit = () => {
    if (!current || flash) return;
    const guess = Number(typed.trim());
    if (typed.trim() === '' || Number.isNaN(guess)) return;
    const right = guess === current.a * current.b;
    const key = factKey(current.a, current.b);

    setFacts((prev) => {
      const f = prev[key] || { c: 0, w: 0 };
      return { ...prev, [key]: right ? { ...f, c: f.c + 1 } : { ...f, w: f.w + 1 } };
    });
    setSessionLog((log) => [...log, { key, a: current.a, b: current.b, right }]);
    setFlash(right ? 'right' : 'wrong');

    const delay = right ? 350 : 1500; // linger on mistakes so the answer sinks in
    setTimeout(() => {
      setFlash(null);
      setTyped('');
      const next = qIndex + 1;
      if (mode !== 'sprint' && next >= queue.length) {
        endSession();
        return;
      }
      if (mode === 'sprint' && next >= queue.length) {
        // refill the sprint pool
        const more = shuffle(weakestFacts(30));
        setQueue((q) => [...q, ...more]);
      }
      setQIndex(next);
      setCurrent((mode === 'sprint' && next >= queue.length) ? queue[queue.length - 1] : queue[next] || queue[0]);
      setTimeout(() => inputRef.current?.focus(), 40);
    }, delay);
  };

  // done-screen stats
  const rightCount = sessionLog.filter((l) => l.right).length;
  const accuracy = sessionLog.length > 0 ? Math.round((rightCount / sessionLog.length) * 100) : 0;
  const missedFacts = [...new Set(sessionLog.filter((l) => !l.right).map((l) => l.key))];

  const selectedStats = selectedCell ? factStats(facts, selectedCell) : null;

  // ── Render: DOJO OVERVIEW ───────────────────────────────────────────────────
  if (view === 'dojo') {
    return (
      <div className="space-y-5">
        {/* Belt banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🥋</span>
              <div>
                <h2 className="text-2xl font-bold">Times Tables Dojo</h2>
                <p className="text-slate-300 text-sm">Master all 78 facts to earn your black belt</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-xl border-2 font-black ${belt.color}`}>
              {belt.name}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>{masteredCount} / 78 facts mastered</span>
              {nextBelt && <span>{nextBelt.need - masteredCount} more for {nextBelt.name}</span>}
            </div>
            <div className="h-3 bg-slate-600 rounded-full overflow-hidden">
              <div
                className={`h-full ${belt.bar} transition-all duration-700`}
                style={{ width: `${(masteredCount / 78) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Practice modes */}
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={() => startSession('smart')}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow"
          >
            <p className="text-2xl mb-1">🧠</p>
            <p className="font-black">Smart Practice</p>
            <p className="text-xs opacity-80 mt-0.5">Trains your 12 weakest facts — the fastest way to your next belt</p>
          </button>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl mb-1">🎯</p>
            <p className="font-black text-gray-800">Table Focus</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from({ length: MAX_TABLE }, (_, i) => i + 1).map((t) => (
                <button
                  key={t}
                  onClick={() => startSession('table', t)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-indigo-500 hover:text-white font-bold text-sm transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => startSession('sprint')}
            className="bg-gradient-to-br from-orange-500 to-rose-500 text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow"
          >
            <p className="text-2xl mb-1">⚡</p>
            <p className="font-black">60-Second Sprint</p>
            <p className="text-xs opacity-80 mt-0.5">How many can you answer before the timer runs out?</p>
          </button>
        </div>

        {/* Heatmap */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-black text-gray-800">📊 Your Mastery Map</h3>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> new</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-300" /> tricky</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300" /> learning</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-300" /> mastered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> super solid</span>
            </div>
          </div>
          <div className="inline-block min-w-full">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${MAX_TABLE + 1}, minmax(0, 1fr))` }}>
              <div />
              {Array.from({ length: MAX_TABLE }, (_, i) => (
                <div key={`h${i}`} className="text-center text-[10px] font-black text-gray-400 py-0.5">×{i + 1}</div>
              ))}
              {Array.from({ length: MAX_TABLE }, (_, r) => {
                const row = r + 1;
                return (
                  <React.Fragment key={`r${row}`}>
                    <div className="text-center text-[10px] font-black text-gray-400 flex items-center justify-center">{row}</div>
                    {Array.from({ length: MAX_TABLE }, (_, c) => {
                      const col = c + 1;
                      const key = factKey(row, col);
                      const stats = factStats(facts, key);
                      return (
                        <button
                          key={`${row}-${col}`}
                          onClick={() => setSelectedCell(selectedCell === key ? null : key)}
                          title={`${row} × ${col}`}
                          className={`aspect-square rounded transition-colors ${cellColor(stats)} ${selectedCell === key ? 'ring-2 ring-indigo-500' : ''}`}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* selected fact detail */}
          {selectedStats && selectedCell && (
            <div className="mt-3 bg-indigo-50 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-indigo-800">
                <b className="font-black">{selectedCell.replace('x', ' × ')}</b>
                {selectedStats.total === 0
                  ? ' — you have not practised this fact yet!'
                  : ` — ${selectedStats.c} correct, ${selectedStats.w} wrong (${Math.round(selectedStats.acc * 100)}%)${selectedStats.mastered ? ' · MASTERED ✅' : ''}`}
              </p>
              <button
                onClick={() => startSession('table', Number(selectedCell.split('x')[0]))}
                className="text-xs font-bold bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition"
              >
                Practise the {selectedCell.split('x')[0]}s →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: SESSION ─────────────────────────────────────────────────────────
  if (view === 'session' && current) {
    const progressPct = mode === 'sprint'
      ? (sprintLeft / SPRINT_SECONDS) * 100
      : ((qIndex) / queue.length) * 100;
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={endSession} className="text-sm font-bold text-gray-400 hover:text-gray-600">← End session</button>
          <p className="text-sm font-mono text-gray-500">
            {mode === 'sprint'
              ? `⚡ ${sprintLeft}s left`
              : mode === 'table'
                ? `🎯 ${tablePick}s table · ${qIndex + 1}/${queue.length}`
                : `🧠 Smart Practice · ${qIndex + 1}/${queue.length}`}
          </p>
          <p className="text-sm font-mono text-emerald-600 font-bold">✅ {rightCount}</p>
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${mode === 'sprint' ? 'bg-orange-400' : 'bg-indigo-500'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className={`rounded-3xl p-10 text-center shadow-lg transition-colors ${
          flash === 'right' ? 'bg-emerald-50 ring-4 ring-emerald-300'
            : flash === 'wrong' ? 'bg-rose-50 ring-4 ring-rose-300'
              : 'bg-white ring-1 ring-gray-200'
        }`}>
          <p className="text-6xl font-black text-gray-800 tracking-wide">
            {current.a} × {current.b}
          </p>
          {flash === 'wrong' && (
            <p className="text-rose-500 font-bold mt-3">= {current.a * current.b} — you will get it next time!</p>
          )}
          {flash === 'right' && <p className="text-emerald-500 font-black mt-3">✓ Correct!</p>}

          <form
            onSubmit={(e) => { e.preventDefault(); submit(); }}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="?"
              inputMode="numeric"
              autoComplete="off"
              disabled={!!flash}
              className="w-32 text-center text-3xl font-black bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-indigo-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!!flash || typed.trim() === ''}
              className="px-6 py-4 rounded-2xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-40"
            >
              GO
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Render: SESSION DONE ────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto text-center space-y-4 py-6">
      {beltUp ? (
        <>
          <p className="text-6xl">🥋</p>
          <h3 className="text-3xl font-black text-gray-800">BELT UP!</h3>
          <div className={`inline-block px-5 py-2 rounded-xl border-2 font-black text-lg ${beltUp.color}`}>
            {beltUp.name}
          </div>
        </>
      ) : (
        <>
          <p className="text-5xl">{accuracy >= 90 ? '🌟' : accuracy >= 70 ? '💪' : '🥷'}</p>
          <h3 className="text-2xl font-black text-gray-800">Session complete!</h3>
        </>
      )}
      <p className="text-gray-600 font-mono">
        {rightCount}/{sessionLog.length} correct · {accuracy}% accuracy
      </p>
      {missedFacts.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-500 mb-1.5">Facts to sharpen:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {missedFacts.map((k) => (
              <span key={k} className="text-sm font-bold bg-rose-50 text-rose-600 rounded-full px-3 py-1">
                {k.replace('x', ' × ')} = {k.split('x').map(Number).reduce((x, y) => x * y, 1)}
              </span>
            ))}
          </div>
        </div>
      )}
      {missedFacts.length === 0 && sessionLog.length > 0 && (
        <p className="text-emerald-600 font-bold">💯 Perfect session!</p>
      )}
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={() => startSession(mode, tablePick)}
          className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
        >
          Go again 🔁
        </button>
        <button
          onClick={() => setView('dojo')}
          className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
        >
          Back to dojo
        </button>
      </div>
    </div>
  );
};

export default TimesTablesDojo;
