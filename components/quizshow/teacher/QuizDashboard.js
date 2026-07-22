// components/quizshow/teacher/QuizDashboard.js — QUIZ SHOW COMMAND CENTRE
// Self-contained dark "game show arena" theme: every panel carries its own
// background so text stays readable no matter what page it sits on.
import React, { useState } from 'react';
import { GAME_MODES } from '../../../utils/quizShowHelpers';

const QuizDashboard = ({
  quizzes = [],
  onCreateQuiz,
  onEditQuiz,
  onDeleteQuiz,
  onDuplicateQuiz,
  onStartGame,
  onOpenLibrary,
  onCreatePreset,
  loading = false,
  QUESTION_CATEGORIES = {}
}) => {
  const [presetCategory, setPresetCategory] = useState('general');
  const [presetCount, setPresetCount] = useState(10);

  // ===============================================
  // QUIZ CARD
  // ===============================================
  const QuizCard = ({ quiz }) => {
    const categoryInfo = QUESTION_CATEGORIES[quiz.category] || QUESTION_CATEGORIES.general || {};
    const questionCount = quiz.questions?.length || 0;
    const estimatedDuration = Math.ceil(questionCount * (quiz.settings?.timePerQuestion || 20) / 60);

    return (
      <div className="bg-slate-800/80 rounded-2xl border border-white/10 hover:border-fuchsia-400/40 transition-all overflow-hidden group flex flex-col">
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-fuchsia-300 transition">
              {quiz.title}
            </h3>
            {quiz.isPreset && (
              <span className="bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                PRESET
              </span>
            )}
          </div>
          {quiz.description && (
            <p className="text-slate-400 text-sm line-clamp-2 mb-3">{quiz.description}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: categoryInfo.color || '#6B7280' }}
            >
              <span>{categoryInfo.icon}</span>
              {categoryInfo.name || 'General'}
            </span>
            <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
              {questionCount} questions
            </span>
            <span className="text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-full">
              ~{estimatedDuration} min
            </span>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => onStartGame(quiz)}
            disabled={questionCount === 0}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 px-4 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            🎬 Host Live Game
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onEditQuiz(quiz)}
              className="bg-white/10 text-slate-200 py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors" title="Edit Quiz">
              ✏️ Edit
            </button>
            <button onClick={() => onDuplicateQuiz(quiz)}
              className="bg-white/10 text-slate-200 py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-white/20 transition-colors" title="Duplicate Quiz">
              📋 Copy
            </button>
            <button onClick={() => onDeleteQuiz(quiz.id)}
              className="bg-rose-500/15 text-rose-300 py-1.5 px-2 rounded-lg text-xs font-semibold hover:bg-rose-500/30 transition-colors" title="Delete Quiz">
              🗑️ Delete
            </button>
          </div>

          <div className="text-[11px] text-slate-500 pt-1">
            {quiz.updatedAt
              ? <>Updated {new Date(quiz.updatedAt).toLocaleDateString()}</>
              : quiz.createdAt
                ? <>Created {new Date(quiz.createdAt).toLocaleDateString()}</>
                : <>Recently created</>}
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // LOADING
  // ===============================================
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center rounded-3xl bg-slate-950 border border-white/10 p-10">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-fuchsia-500/60 border-t-transparent"></div>
          <p className="text-lg font-bold text-white">Loading your quizzes…</p>
        </div>
      </div>
    );
  }

  // ===============================================
  // MAIN RENDER
  // ===============================================
  return (
    <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 px-6 md:px-10 pt-10 pb-8 text-center overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-fuchsia-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-20 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow">
            🎪 Quiz Show Arena
          </h1>
          <p className="mx-auto max-w-2xl text-slate-300">
            Host live game shows with four game modes, power-ups, emoji reactions and dramatic leaderboard reveals.
          </p>

          {/* Mode chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {Object.values(GAME_MODES).map(mode => (
              <span key={mode.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-slate-200">
                <span>{mode.icon}</span>{mode.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-8">
        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={onOpenLibrary}
            className="group text-left rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-600 p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="text-4xl mb-2">📚</div>
            <div className="font-black text-lg">Premade Library</div>
            <div className="text-sky-100 text-sm mt-1">Ready-to-play quizzes for every subject</div>
          </button>

          <button onClick={onCreateQuiz}
            className="group text-left rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-600 p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
            <div className="text-4xl mb-2">🎨</div>
            <div className="font-black text-lg">Build a Quiz</div>
            <div className="text-fuchsia-100 text-sm mt-1">Multiple choice, pictures & Closest-Wins questions</div>
          </button>

          {/* Instant preset launcher */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-lg">
            <div className="text-4xl mb-2">⚡</div>
            <div className="font-black text-lg">Instant Game</div>
            <div className="flex gap-2 mt-3">
              <select value={presetCategory} onChange={e => setPresetCategory(e.target.value)}
                className="flex-1 min-w-0 bg-black/25 border border-white/25 rounded-lg px-2 py-1.5 text-sm font-semibold text-white focus:outline-none">
                {Object.entries(QUESTION_CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key} className="text-gray-900">{cat.icon} {cat.name}</option>
                ))}
              </select>
              <select value={presetCount} onChange={e => setPresetCount(parseInt(e.target.value))}
                className="bg-black/25 border border-white/25 rounded-lg px-2 py-1.5 text-sm font-semibold text-white focus:outline-none">
                {[5, 10, 15].map(n => <option key={n} value={n} className="text-gray-900">{n} Qs</option>)}
              </select>
            </div>
            <button onClick={() => onCreatePreset?.(presetCategory, presetCount)}
              className="mt-2 w-full bg-white text-emerald-800 rounded-lg py-1.5 text-sm font-black hover:bg-emerald-50 transition">
              ▶ Launch Now
            </button>
          </div>
        </div>

        {/* Saved quizzes */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>🗂️</span> My Quizzes
              </h2>
              <p className="text-sm text-slate-400">Your saved quizzes — edit, duplicate or host them live.</p>
            </div>
            {quizzes.length > 0 && (
              <button onClick={onCreateQuiz}
                className="self-start sm:self-auto rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-5 py-2 text-sm font-bold text-fuchsia-200 transition hover:bg-fuchsia-500/30">
                ➕ New Quiz
              </button>
            )}
          </div>

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.firestoreId || quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-white/15 bg-white/5 p-10 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-black text-white mb-2">Your stage is set!</h3>
              <p className="mx-auto max-w-lg text-sm text-slate-400 mb-6">
                Build your first quiz, grab one from the library, or fire off an instant preset game — your class is three clicks from showtime.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={onCreateQuiz}
                  className="rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5">
                  ✨ Create Your First Quiz
                </button>
                <button onClick={onOpenLibrary}
                  className="rounded-full border border-sky-400/40 bg-sky-500/15 px-6 py-3 font-bold text-sky-200 transition hover:bg-sky-500/30">
                  📚 Browse Library
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;
