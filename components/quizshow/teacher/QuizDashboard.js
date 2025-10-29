// components/quizshow/teacher/QuizDashboard.js - COMPLETE QUIZ MANAGEMENT DASHBOARD
import React, { useState } from 'react';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const QuizDashboard = ({ 
  quizzes = [], 
  onCreateQuiz, 
  onEditQuiz, 
  onDeleteQuiz,
  onDuplicateQuiz,
  onStartGame, 
  onCreatePreset,
  loading = false,
  QUESTION_CATEGORIES = {}
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPresetModal, setShowPresetModal] = useState(false);

  // ===============================================
  // PRESET QUIZ CREATION
  // ===============================================
  const handleCreatePreset = (category, questionCount) => {
    onCreatePreset(category, questionCount);
    setShowPresetModal(false);
    playQuizSound('gameStart');
  };

  // ===============================================
  // QUIZ CARD COMPONENT
  // ===============================================
  const QuizCard = ({ quiz }) => {
    const categoryInfo = QUESTION_CATEGORIES[quiz.category] || QUESTION_CATEGORIES.general;
    const questionCount = quiz.questions?.length || 0;
    const estimatedDuration = Math.ceil(questionCount * (quiz.settings?.timePerQuestion || 20) / 60);

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {quiz.title}
              </h3>
              {quiz.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {quiz.description}
                </p>
              )}
            </div>
            {quiz.isPreset && (
              <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full ml-3">
                PRESET
              </span>
            )}
          </div>

          {/* Category Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: categoryInfo.color }}
            >
              <span className="mr-1">{categoryInfo.icon}</span>
              {categoryInfo.name}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{questionCount}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{estimatedDuration}</div>
              <div className="text-xs text-gray-500">Minutes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {quiz.settings?.showCorrectAnswers ? '✓' : '✗'}
              </div>
              <div className="text-xs text-gray-500">Show Answers</div>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="p-4 bg-gray-50 space-y-2">
          {/* Primary Action - Start Game */}
          <button
            onClick={() => onStartGame(quiz)}
            disabled={questionCount === 0}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <span>🎮</span>
            <span>Start Game</span>
          </button>

          {/* Secondary Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onEditQuiz(quiz)}
              className="bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
              title="Edit Quiz"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
            
            <button
              onClick={() => onDuplicateQuiz(quiz)}
              className="bg-yellow-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center space-x-1"
              title="Duplicate Quiz"
            >
              <span>📋</span>
              <span>Copy</span>
            </button>
            
            <button
              onClick={() => onDeleteQuiz(quiz.id)}
              className="bg-red-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
              title="Delete Quiz"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Updated/Created Info */}
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-400">
            {quiz.updatedAt ? (
              <>Updated {new Date(quiz.updatedAt).toLocaleDateString()}</>
            ) : quiz.createdAt ? (
              <>Created {new Date(quiz.createdAt).toLocaleDateString()}</>
            ) : (
              <>Recently created</>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // PRESET CATEGORY CARD
  // ===============================================
  const PresetCategoryCard = ({ category, categoryData }) => (
    <div 
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-gray-300 hover:border-purple-400 cursor-pointer group p-6"
      onClick={() => {
        setSelectedCategory(category);
        setShowPresetModal(true);
      }}
    >
      <div className="text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl text-white mx-auto mb-4 group-hover:scale-110 transition-transform"
          style={{ backgroundColor: categoryData.color }}
        >
          {categoryData.icon}
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{categoryData.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{categoryData.description}</p>
        <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
          Quick Start • 5 Questions
        </div>
      </div>
    </div>
  );

  // ===============================================
  // MAIN RENDER
  // ===============================================
  if (loading) {
    return (
      <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-10 shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(192,132,252,0.2),_transparent_65%)]"></div>
        <div className="text-center text-purple-100">
          <div className="mx-auto mb-6 h-20 w-20 animate-spin rounded-full border-4 border-purple-400/60 border-t-transparent"></div>
          <p className="text-lg font-semibold tracking-wider uppercase">Summoning your quiz arsenal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </div>

      <div className="space-y-10">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/70 via-indigo-900/60 to-slate-900/80 p-8 text-center shadow-[0_40px_120px_-60px_rgba(79,70,229,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_60%)]"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-white to-sky-200 mb-4">
              🎪 Quiz Show Command Center
            </h1>
            <p className="mx-auto max-w-3xl text-base md:text-lg text-purple-100/80">
              Forge epic quiz battles, ignite classroom excitement, and lead your learners to glory with cinematic live gameplay.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-sm text-purple-100/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <span className="block text-xs uppercase tracking-widest text-purple-200/70">Total Quizzes</span>
                <span className="mt-2 block text-2xl font-black text-white">{quizzes.length}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <span className="block text-xs uppercase tracking-widest text-purple-200/70">Preset Categories</span>
                <span className="mt-2 block text-2xl font-black text-white">{Object.keys(QUESTION_CATEGORIES).length}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <span className="block text-xs uppercase tracking-widest text-purple-200/70">Instant Launch</span>
                <span className="mt-2 block text-2xl font-black text-white">Ready in 3 Clicks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-purple-500/20"></div>
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl text-left">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    Launch a New Experience
                  </h2>
                  <p className="mt-3 text-sm text-purple-100/70">
                    Choose your mission: craft a bespoke challenge or deploy an instant preset. Either way, your class is moments away from an electrifying showdown.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:max-w-md">
                  <button
                    onClick={onCreateQuiz}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 px-5 py-4 text-left font-semibold text-white shadow-lg shadow-purple-900/40 transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">✨</span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs tracking-widest">Custom</span>
                      </div>
                      <div className="mt-4 text-lg">Build Legendary Quiz</div>
                      <p className="mt-2 text-xs text-purple-100/80">Full creative control with animated previews and instant validation.</p>
                    </div>
                    <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-tr from-white/20 via-transparent to-white/10"></span>
                  </button>

                  <button
                    onClick={() => setShowPresetModal(true)}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 px-5 py-4 text-left font-semibold text-white shadow-lg shadow-cyan-900/40 transition-all hover:-translate-y-0.5"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">🚀</span>
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs tracking-widest">Instant</span>
                      </div>
                      <div className="mt-4 text-lg">Deploy Preset Quiz</div>
                      <p className="mt-2 text-xs text-sky-100/80">Auto-generates balanced questions with one click.</p>
                    </div>
                    <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-tr from-white/20 via-transparent to-white/10"></span>
                  </button>
                </div>
              </div>
            </div>

            {quizzes.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-purple-100/80 backdrop-blur">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <span>📣</span>
                  Pro tip
                </h3>
                <p>
                  Invite students instantly with the Join button above and use the leaderboard reveal between questions to build suspense.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-sm text-purple-100/80 backdrop-blur">
            <h3 className="text-lg font-semibold text-white mb-3">Game Show Checklist</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="mt-1 text-green-300">✔</span>
                <span>Choose or craft a quiz with at least five high-energy questions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-green-300">✔</span>
                <span>Share the room code or QR for quick student entry.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 text-green-300">✔</span>
                <span>Use XP + coins rewards to crown your champions.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Saved Quizzes */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span>📚</span>
                Your Quiz Vault
              </h2>
              <p className="text-sm text-purple-100/70">Curated shows ready for takeoff. Duplicate, edit, or launch straight into the arena.</p>
            </div>

            {quizzes.length > 0 && (
              <button
                onClick={onCreateQuiz}
                className="rounded-full border border-purple-300/40 bg-purple-500/20 px-5 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-500/30"
              >
                ➕ Create New Quiz
              </button>
            )}
          </div>

          {quizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-dashed border-purple-300/40 bg-purple-500/10 p-10 text-center text-purple-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_70%)]"></div>
              <div className="relative">
                <div className="text-6xl mb-6">🎯</div>
                <h3 className="text-2xl font-bold mb-2">Your stage is set!</h3>
                <p className="mx-auto max-w-lg text-sm">
                  Start with a custom creation or let our presets warm up the crowd. Every quiz saved here is battle-ready for your next class showdown.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={onCreateQuiz}
                    className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:-translate-y-0.5"
                  >
                    ✨ Create Your First Quiz
                  </button>
                  <button
                    onClick={() => setShowPresetModal(true)}
                    className="rounded-full border border-sky-200/60 bg-sky-500/20 px-6 py-3 font-semibold text-sky-100 transition hover:bg-sky-500/30"
                  >
                    🚀 Generate a Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      {/* Preset Selection Modal */}
      {showPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Choose a Preset Quiz</h2>
                  <p className="text-blue-100 mt-1">Select a category to create an instant quiz</p>
                </div>
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="text-white hover:text-blue-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(QUESTION_CATEGORIES).map(([category, categoryData]) => (
                  <PresetCategoryCard 
                    key={category} 
                    category={category} 
                    categoryData={categoryData} 
                  />
                ))}
              </div>
              
              {selectedCategory && (
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Create {QUESTION_CATEGORIES[selectedCategory]?.name} Quiz
                  </h3>
                  <p className="text-gray-600 mb-6">
                    How many questions would you like in your quiz?
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[5, 10, 15, 20].map((count) => (
                      <button
                        key={count}
                        onClick={() => handleCreatePreset(selectedCategory, count)}
                        className="bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 p-4 rounded-lg text-center transition-all duration-200"
                      >
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                        <div className="text-sm text-gray-600">Questions</div>
                        <div className="text-xs text-gray-500">~{Math.ceil(count * 20 / 60)} min</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboard;