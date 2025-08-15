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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl">Loading your quizzes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎪 Welcome to Quiz Show! 🎪
        </h1>
        <p className="text-xl text-purple-100 max-w-2xl mx-auto">
          Create engaging quiz games for your students with real-time gameplay, 
          avatar integration, and exciting rewards!
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3">⚡</span>
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Custom Quiz */}
          <button
            onClick={onCreateQuiz}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">✨</div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                CUSTOM
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Create Custom Quiz</h3>
            <p className="text-purple-100">
              Build your own quiz with custom questions, multiple choice answers, and personalized settings.
            </p>
          </button>

          {/* Browse Presets */}
          <button
            onClick={() => setShowPresetModal(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🚀</div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                INSTANT
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2">Quick Start Preset</h3>
            <p className="text-blue-100">
              Choose from pre-made quizzes in Math, Science, Geography and more. Ready to play instantly!
            </p>
          </button>
        </div>
      </div>

      {/* Saved Quizzes */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">📚</span>
            Your Quiz Library ({quizzes.length})
          </h2>
          
          {quizzes.length > 0 && (
            <button
              onClick={onCreateQuiz}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>New Quiz</span>
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
          <div className="text-center py-12">
            <div className="text-6xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Quizzes Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Get started by creating your first custom quiz or choosing from our preset categories.
            </p>
            <div className="space-y-4">
              <button
                onClick={onCreateQuiz}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors font-semibold mr-4"
              >
                ✨ Create Your First Quiz
              </button>
              <button
                onClick={() => setShowPresetModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                🚀 Try a Preset Quiz
              </button>
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