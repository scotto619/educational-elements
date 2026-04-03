// components/curriculum/mathematics/TimesTablesMaster.js
// Interactive Times Tables tool for primary students (ages 6–12)
import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Colour palette per table number ────────────────────────────────────────
const TABLE_COLOURS = {
  1:  { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-300',     highlight: 'bg-red-400',     ring: 'ring-red-400'     },
  2:  { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-300',  highlight: 'bg-orange-400',  ring: 'ring-orange-400'  },
  3:  { bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300',   highlight: 'bg-amber-400',   ring: 'ring-amber-400'   },
  4:  { bg: 'bg-yellow-100',  text: 'text-yellow-700',  border: 'border-yellow-300',  highlight: 'bg-yellow-400',  ring: 'ring-yellow-400'  },
  5:  { bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-300',    highlight: 'bg-lime-400',    ring: 'ring-lime-400'    },
  6:  { bg: 'bg-green-100',   text: 'text-green-700',   border: 'border-green-300',   highlight: 'bg-green-400',   ring: 'ring-green-400'   },
  7:  { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-300',    highlight: 'bg-teal-400',    ring: 'ring-teal-400'    },
  8:  { bg: 'bg-cyan-100',    text: 'text-cyan-700',    border: 'border-cyan-300',    highlight: 'bg-cyan-400',    ring: 'ring-cyan-400'    },
  9:  { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300',    highlight: 'bg-blue-400',    ring: 'ring-blue-400'    },
  10: { bg: 'bg-indigo-100',  text: 'text-indigo-700',  border: 'border-indigo-300',  highlight: 'bg-indigo-400',  ring: 'ring-indigo-400'  },
  11: { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-300',  highlight: 'bg-violet-400',  ring: 'ring-violet-400'  },
  12: { bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-300',  highlight: 'bg-purple-400',  ring: 'ring-purple-400'  },
};

const GRID_MAX = 12;

// ─── Generate all facts for a table ─────────────────────────────────────────
function factsForTable(t) {
  return Array.from({ length: GRID_MAX }, (_, i) => ({
    a: t, b: i + 1, answer: t * (i + 1)
  }));
}

// ─── Shuffle helper ──────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Generate a quiz question ─────────────────────────────────────────────
function makeQuestion(tables) {
  const t = tables[Math.floor(Math.random() * tables.length)];
  const b = Math.floor(Math.random() * GRID_MAX) + 1;
  const correct = t * b;
  const wrongSet = new Set();
  while (wrongSet.size < 3) {
    const w = Math.max(1, correct + (Math.floor(Math.random() * 9) - 4) * t);
    if (w !== correct) wrongSet.add(w);
  }
  const choices = shuffle([correct, ...wrongSet]);
  return { a: t, b, correct, choices };
}

// ─── Main Component ──────────────────────────────────────────────────────────
const TimesTablesMaster = ({ showToast = () => {} }) => {
  // Tab: 'explore' | 'grid' | 'quiz'
  const [tab, setTab] = useState('explore');

  // ── Explore tab state ──
  const [selectedTable, setSelectedTable] = useState(2);
  const [revealedFacts, setRevealedFacts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // ── Grid tab state ──
  const [hoveredCell, setHoveredCell] = useState(null); // { row, col }
  const [pinnedTable, setPinnedTable] = useState(null);

  // ── Quiz tab state ──
  const [quizTables, setQuizTables] = useState([2, 5, 10]);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState(null); // 'correct' | 'wrong'
  const [quizChosen, setQuizChosen] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [quizTarget, setQuizTarget] = useState(10);
  const answerTimeout = useRef(null);

  // ── Explore: reset revealed when table changes ──
  useEffect(() => {
    setRevealedFacts([]);
    setShowAll(false);
  }, [selectedTable]);

  const facts = factsForTable(selectedTable);
  const colours = TABLE_COLOURS[selectedTable];

  // Reveal fact one-by-one
  const revealNext = () => {
    if (showAll) return;
    if (revealedFacts.length < facts.length) {
      setRevealedFacts(prev => [...prev, prev.length]);
    }
  };
  const revealAllFacts = () => {
    setRevealedFacts(facts.map((_, i) => i));
    setShowAll(true);
  };

  // ── Quiz helpers ──
  const startQuiz = useCallback(() => {
    setQuizScore(0);
    setQuizTotal(0);
    setQuizStreak(0);
    setQuizFeedback(null);
    setQuizChosen(null);
    setQuizDone(false);
    setQuizQuestion(makeQuestion(quizTables));
    setQuizActive(true);
  }, [quizTables]);

  const handleAnswer = (choice) => {
    if (quizFeedback) return; // already answered
    clearTimeout(answerTimeout.current);
    const correct = choice === quizQuestion.correct;
    setQuizChosen(choice);
    setQuizFeedback(correct ? 'correct' : 'wrong');
    const newScore = quizScore + (correct ? 1 : 0);
    const newTotal = quizTotal + 1;
    const newStreak = correct ? quizStreak + 1 : 0;
    setQuizScore(newScore);
    setQuizTotal(newTotal);
    setQuizStreak(newStreak);

    if (correct && newStreak > 0 && newStreak % 5 === 0) {
      showToast(`🔥 ${newStreak} in a row! Keep it up!`, 'success');
    }

    answerTimeout.current = setTimeout(() => {
      if (newTotal >= quizTarget) {
        setQuizDone(true);
        setQuizActive(false);
      } else {
        setQuizQuestion(makeQuestion(quizTables));
        setQuizFeedback(null);
        setQuizChosen(null);
      }
    }, 900);
  };

  // Toggle table in quiz selection
  const toggleQuizTable = (t) => {
    setQuizTables(prev => {
      if (prev.includes(t)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter(x => x !== t);
      }
      return [...prev, t].sort((a, b) => a - b);
    });
  };

  // ── Grid: compute cell highlight ──
  const getCellStyle = (row, col) => {
    const value = row * col;
    if (pinnedTable) {
      if (row === pinnedTable || col === pinnedTable) return 'bg-indigo-500 text-white font-bold scale-105 shadow-md';
    }
    if (hoveredCell) {
      if (row === hoveredCell.row && col === hoveredCell.col) return 'bg-purple-600 text-white font-bold ring-2 ring-purple-400 scale-110 shadow-lg z-10';
      if (row === hoveredCell.row || col === hoveredCell.col) return 'bg-purple-200 text-purple-800 font-semibold';
    }
    // Diagonal (square numbers)
    if (row === col) return 'bg-amber-100 text-amber-800 font-semibold';
    return 'bg-white text-slate-700 hover:bg-slate-50';
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-5xl">✖️</div>
          <div>
            <h2 className="text-2xl font-bold">Times Tables Master</h2>
            <p className="opacity-90 text-sm mt-1">
              Explore, visualise, and practise your multiplication tables — Years 2–6
            </p>
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-2 border border-slate-200">
        {[
          { id: 'explore', label: '📖 Explore', desc: 'Learn a table' },
          { id: 'grid',    label: '🔢 Grid',    desc: 'Full 12×12 grid' },
          { id: 'quiz',    label: '🎯 Quiz',    desc: 'Test yourself' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div>{t.label}</div>
            <div className={`text-xs font-normal mt-0.5 ${tab === t.id ? 'text-purple-100' : 'text-slate-400'}`}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ── EXPLORE TAB ── */}
      {tab === 'explore' && (
        <div className="space-y-5">
          {/* Table selector */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-3">Choose a times table:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: GRID_MAX }, (_, i) => i + 1).map(t => {
                const c = TABLE_COLOURS[t];
                return (
                  <button
                    key={t}
                    onClick={() => setSelectedTable(t)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm border-2 transition-all
                      ${selectedTable === t
                        ? `${c.highlight} text-white border-transparent shadow-md scale-110`
                        : `${c.bg} ${c.text} ${c.border} hover:scale-105`}`}
                  >
                    {t}×
                  </button>
                );
              })}
            </div>
          </div>

          {/* Facts display */}
          <div className={`rounded-2xl p-5 border-2 ${colours.bg} ${colours.border}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold ${colours.text}`}>
                The {selectedTable}× Table
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={revealNext}
                  disabled={showAll || revealedFacts.length === facts.length}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all
                    ${colours.highlight} text-white disabled:opacity-40 hover:opacity-90`}
                >
                  Reveal Next
                </button>
                <button
                  onClick={revealAllFacts}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-600 text-white hover:bg-slate-700 transition-all"
                >
                  Show All
                </button>
                <button
                  onClick={() => { setRevealedFacts([]); setShowAll(false); }}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {facts.map((fact, idx) => {
                const revealed = revealedFacts.includes(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!revealed) setRevealedFacts(prev => [...new Set([...prev, idx])]);
                    }}
                    className={`rounded-xl p-3 text-center cursor-pointer transition-all border-2 select-none
                      ${revealed
                        ? `bg-white ${colours.border} shadow-sm`
                        : `bg-white/50 border-dashed ${colours.border} hover:bg-white/80`}
                    `}
                  >
                    <div className={`text-xs font-semibold mb-1 ${colours.text} opacity-70`}>
                      {fact.a} × {fact.b}
                    </div>
                    {revealed ? (
                      <div className={`text-2xl font-bold ${colours.text}`}>
                        {fact.answer}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-slate-300">?</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold mb-1" style={{}}>
                <span className={colours.text}>{revealedFacts.length} / {facts.length} revealed</span>
                {revealedFacts.length === facts.length && (
                  <span className={`${colours.text} font-bold`}>🎉 Complete!</span>
                )}
              </div>
              <div className="h-2 rounded-full bg-white/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${colours.highlight}`}
                  style={{ width: `${(revealedFacts.length / facts.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tips panel */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200">
            <h4 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
              <span>💡</span> Tips for the {selectedTable}× table
            </h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              {getTips(selectedTable).map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── GRID TAB ── */}
      {tab === 'grid' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="text-sm text-slate-600 font-semibold">Highlight a table:</div>
              {Array.from({ length: GRID_MAX }, (_, i) => i + 1).map(t => {
                const c = TABLE_COLOURS[t];
                return (
                  <button
                    key={t}
                    onClick={() => setPinnedTable(pinnedTable === t ? null : t)}
                    className={`w-9 h-9 rounded-lg font-bold text-sm border-2 transition-all
                      ${pinnedTable === t
                        ? 'bg-indigo-600 text-white border-transparent shadow'
                        : `${c.bg} ${c.text} ${c.border} hover:scale-105`}`}
                  >
                    {t}
                  </button>
                );
              })}
              {pinnedTable && (
                <button
                  onClick={() => setPinnedTable(null)}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Hover over any cell to highlight its row & column. Gold cells are square numbers.</p>
          </div>

          {/* Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-auto p-2">
            <table className="text-xs sm:text-sm border-collapse w-full" style={{ minWidth: 340 }}>
              <thead>
                <tr>
                  <th className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-tl-lg" />
                  {Array.from({ length: GRID_MAX }, (_, i) => i + 1).map(col => (
                    <th
                      key={col}
                      className="w-9 h-9 text-center font-bold text-white bg-gradient-to-b from-purple-600 to-indigo-600"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: GRID_MAX }, (_, ri) => ri + 1).map(row => (
                  <tr key={row}>
                    <td className="w-8 text-center font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 h-9">
                      {row}
                    </td>
                    {Array.from({ length: GRID_MAX }, (_, ci) => ci + 1).map(col => (
                      <td
                        key={col}
                        onMouseEnter={() => setHoveredCell({ row, col })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-9 h-9 text-center cursor-default transition-all duration-100 rounded ${getCellStyle(row, col)}`}
                      >
                        {row * col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── QUIZ TAB ── */}
      {tab === 'quiz' && (
        <div className="space-y-5">
          {!quizActive && !quizDone && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              {/* Table picker */}
              <div>
                <p className="font-semibold text-slate-700 mb-3">Choose which tables to practise:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: GRID_MAX }, (_, i) => i + 1).map(t => {
                    const c = TABLE_COLOURS[t];
                    const on = quizTables.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleQuizTable(t)}
                        className={`w-11 h-11 rounded-xl font-bold text-sm border-2 transition-all
                          ${on
                            ? `${c.highlight} text-white border-transparent shadow-md`
                            : `${c.bg} ${c.text} ${c.border} opacity-60 hover:opacity-90`}`}
                      >
                        {t}×
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {quizTables.length} table{quizTables.length > 1 ? 's' : ''} selected: {quizTables.join(', ')}
                </p>
              </div>

              {/* Question count */}
              <div>
                <p className="font-semibold text-slate-700 mb-3">Number of questions:</p>
                <div className="flex gap-3">
                  {[5, 10, 20, 30].map(n => (
                    <button
                      key={n}
                      onClick={() => setQuizTarget(n)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all
                        ${quizTarget === n
                          ? 'bg-indigo-600 text-white border-transparent shadow'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xl font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
              >
                🚀 Start Quiz!
              </button>
            </div>
          )}

          {/* Active quiz */}
          {quizActive && quizQuestion && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="bg-white rounded-xl shadow-sm p-3 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-600">
                    {quizTotal}/{quizTarget}
                  </span>
                  <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${(quizTotal / quizTarget) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 font-bold">✓ {quizScore}</span>
                  <span className="text-red-500 font-bold">✗ {quizTotal - quizScore}</span>
                  {quizStreak >= 3 && (
                    <span className="text-orange-500 font-bold">🔥 {quizStreak}</span>
                  )}
                </div>
              </div>

              {/* Question card */}
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-center text-white shadow-xl">
                <p className="text-lg opacity-80 mb-2">What is</p>
                <p className="text-6xl font-black tracking-tight mb-2">
                  {quizQuestion.a} × {quizQuestion.b}
                </p>
                <p className="text-lg opacity-80">?</p>
              </div>

              {/* Answer choices */}
              <div className="grid grid-cols-2 gap-3">
                {quizQuestion.choices.map((choice, i) => {
                  let style = 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50';
                  if (quizChosen !== null) {
                    if (choice === quizQuestion.correct) {
                      style = 'bg-green-500 border-2 border-green-500 text-white';
                    } else if (choice === quizChosen) {
                      style = 'bg-red-500 border-2 border-red-500 text-white';
                    } else {
                      style = 'bg-white border-2 border-slate-100 text-slate-400 opacity-50';
                    }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(choice)}
                      disabled={quizChosen !== null}
                      className={`py-5 rounded-2xl text-3xl font-black transition-all shadow-sm hover:shadow-md ${style}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div className={`text-center py-3 rounded-xl font-bold text-lg
                  ${quizFeedback === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {quizFeedback === 'correct'
                    ? ['Great job! ✅', 'Correct! 🌟', 'Nailed it! 🎯', 'Awesome! 🏆'][Math.floor(Math.random() * 4)]
                    : `The answer was ${quizQuestion.correct} ❌`}
                </div>
              )}
            </div>
          )}

          {/* Results screen */}
          {quizDone && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
              <div className="text-7xl">
                {quizScore / quizTarget >= 0.9 ? '🏆' : quizScore / quizTarget >= 0.7 ? '🌟' : quizScore / quizTarget >= 0.5 ? '👍' : '💪'}
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-800 mb-1">Quiz Complete!</h3>
                <p className="text-slate-500">
                  {quizScore / quizTarget >= 0.9 ? 'Outstanding work!' :
                   quizScore / quizTarget >= 0.7 ? 'Great effort!' :
                   quizScore / quizTarget >= 0.5 ? 'Keep practising!' : 'Practice makes perfect!'}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                  <div className="text-3xl font-black text-green-600">{quizScore}</div>
                  <div className="text-xs text-green-500 font-semibold mt-1">Correct</div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="text-3xl font-black text-slate-600">{quizTarget}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Total</div>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                  <div className="text-3xl font-black text-indigo-600">{Math.round((quizScore / quizTarget) * 100)}%</div>
                  <div className="text-xs text-indigo-500 font-semibold mt-1">Score</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-4 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    quizScore / quizTarget >= 0.9 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                    quizScore / quizTarget >= 0.7 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                    'bg-gradient-to-r from-orange-400 to-red-400'
                  }`}
                  style={{ width: `${(quizScore / quizTarget) * 100}%` }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startQuiz}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:opacity-90 transition-all"
                >
                  Try Again 🔄
                </button>
                <button
                  onClick={() => { setQuizDone(false); setQuizActive(false); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Change Settings ⚙️
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Tips per table ───────────────────────────────────────────────────────────
function getTips(t) {
  const tips = {
    1:  ['Anything multiplied by 1 stays the same — 1 × 7 = 7.',
         'The 1× table is the identity: the number never changes.'],
    2:  ['The 2× table is just doubling — add the number to itself.',
         'All answers are even numbers: 2, 4, 6, 8…',
         'Skip-count in twos on a number line to check your answers.'],
    3:  ['The digit sum of each answer is always divisible by 3.',
         'Try: 3 × 6 = 18, and 1 + 8 = 9, which is divisible by 3.',
         'Count in threes: 3, 6, 9, 12, 15…'],
    4:  ['The 4× table is double the 2× table — double twice!',
         '4 × 7: first do 2 × 7 = 14, then double it to get 28.',
         'All answers are even, and every second one ends in 0 or 8.'],
    5:  ['Answers always end in 0 or 5 — easy to spot!',
         'Half the 10× table: 5 × 8 = 40, which is 80 ÷ 2.',
         'Think of clock minutes: 1 minute = 5 seconds… wait, 5 mins = 25!'],
    6:  ['The 6× table doubles the 3× table.',
         'Even × 6: the units digit of the answer matches the multiplier (e.g. 6 × 4 = 24).',
         'Skip-count: 6, 12, 18, 24, 30, 36…'],
    7:  ['The trickiest table — practice makes perfect!',
         'Use the commutative law: if you know 7 × 3 = 21, you know 3 × 7 = 21.',
         'A rhyme: "5, 6, 7, 8 — 56 = 7 × 8."'],
    8:  ['The 8× table triples the doubling trick — double, double, double!',
         '8 × 6: do 4 × 6 = 24, then double to get 48.',
         'All answers are even; the units digits cycle: 8, 6, 4, 2, 0.'],
    9:  ['The digits of each answer add up to 9 (up to 9 × 10).',
         'The tens digit is one less than the multiplier: 9 × 7 = 63 (tens = 6 = 7 − 1).',
         'Use the finger trick: hold up 10 fingers, fold the 7th — you get 6 and 3 = 63!'],
    10: ['Just add a zero to the number: 10 × 6 = 60.',
         'All answers end in 0.',
         'The 10× table is the foundation for all other tables!'],
    11: ['Up to 9, just repeat the digit: 11 × 7 = 77.',
         '11 × 11 = 121, 11 × 12 = 132 — look for the pattern.',
         'For 2-digit multiples, add the digits of the multiplier: 11 × 15 = 165.'],
    12: ['The 12× table is the 10× plus the 2× table.',
         '12 × 8: do 10 × 8 = 80, then add 2 × 8 = 16 → 96.',
         'Useful for time (12 months) and measurement (12 inches in a foot).'],
  };
  return tips[t] || [];
}

export default TimesTablesMaster;
