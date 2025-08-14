// components/quizshow/teacher/QuizLibrary.js - QUIZ MANAGEMENT INTERFACE
import React, { useState, useEffect } from 'react';
import { QUESTION_CATEGORIES, createQuizFromPreset, playQuizSound } from '../../../utils/quizShowHelpers';

const QuizLibrary = ({ 
  quizzes, 
  onSelectQuiz, 
  onStartGame, 
  onEditQuiz, 
  onDeleteQuiz,
  onBack 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [showPresets, setShowPresets] = useState(true);

  useEffect(() => {
    let filtered = [...quizzes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // Sort quizzes
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'questions':
        filtered.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
        break;
      case 'category':
        filtered.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        break;
    }

    setFilteredQuizzes(filtered);
  }, [quizzes, searchTerm, selectedCategory, sortBy]);

  const handleQuickStart = (category) => {
    try {
      const quiz = createQuizFromPreset(category, 10);
      playQuizSound('gameStart');
      onStartGame(quiz);
    } catch (error) {
      console.error('Error creating preset quiz:', error);
      alert('Error creating quiz. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const QuizCard = ({ quiz }) => {
    const categoryData = QUESTION_CATEGORIES[quiz.category] || QUESTION_CATEGORIES.general;
    
    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 transform hover:scale-105">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: categoryData.color }}
              >
                {categoryData.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{quiz.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{quiz.category || 'general'}</p>
              </div>
            </div>
            {quiz.isPreset && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                Preset
              </span>
            )}
          </div>

          {/* Description */}
          {quiz.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-xl font-bold text-purple-600">{quiz.questions?.length || 0}</div>
              <div className="text-xs text-gray-500">Questions</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-600">
                {Math.ceil(((quiz.questions?.length || 0) * (quiz.defaultTimeLimit || 20)) / 60)}m
              </div>
              <div className="text-xs text-gray-500">Duration</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-600">
                {((quiz.questions || []).reduce((sum, q) => sum + (q.points || 1000), 0) / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-500">Max Points</div>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <span>Created: {formatDate(quiz.createdAt)}</span>
            {quiz.updatedAt && quiz.updatedAt !== quiz.createdAt && (
              <span>Updated: {formatDate(quiz.updatedAt)}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onStartGame(quiz)}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-1"
            >
              <span>🚀</span>
              <span>Play</span>
            </button>
            
            {!quiz.isPreset && (
              <button
                onClick={() => onEditQuiz(quiz)}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                title="Edit Quiz"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            
            {!quiz.isPreset && onDeleteQuiz && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
                    onDeleteQuiz(quiz.id);
                  }
                }}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                title="Delete Quiz"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PresetCard = ({ category, categoryData }) => (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
      <div className="text-center">
        <div 
          className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-2xl text-white"
          style={{ backgroundColor: categoryData.color }}
        >
          {categoryData.icon}
        </div>
        <h3 className="font-bold text-gray-800 mb-2">{categoryData.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{categoryData.description}</p>
        <button
          onClick={() => handleQuickStart(category)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Quick Start (10 Questions)
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quiz Library</h1>
              <p className="text-gray-600">Browse and manage your quiz collection</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showPresets 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showPresets ? 'Hide' : 'Show'} Quick Start
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          >
            <option value="recent">Most Recent</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="questions">Most Questions</option>
            <option value="category">By Category</option>
          </select>
        </div>
      </div>

      {/* Quick Start Presets */}
      {showPresets && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🚀 Quick Start Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(QUESTION_CATEGORIES).map(([category, categoryData]) => (
              <PresetCard key={category} category={category} categoryData={categoryData} />
            ))}
          </div>
        </div>
      )}

      {/* Quiz Collection */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Your Quizzes ({filteredQuizzes.length})
          </h2>
          
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Clear Search
            </button>
          )}
        </div>

        {filteredQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {searchTerm || selectedCategory !== 'all' ? '🔍' : '📝'}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No quizzes found' 
                : 'No quizzes yet'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first quiz or try a quick start game'
              }
            </p>
            
            {!(searchTerm || selectedCategory !== 'all') && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => onBack()}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Create New Quiz
                </button>
                <button
                  onClick={() => handleQuickStart('mathematics')}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Try Quick Start
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Library Stats */}
      {quizzes.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4">📊 Library Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{quizzes.length}</div>
              <div className="text-sm opacity-90">Total Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0)}
              </div>
              <div className="text-sm opacity-90">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(quizzes.map(q => q.category)).size}
              </div>
              <div className="text-sm opacity-90">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.ceil(quizzes.reduce((sum, q) => 
                  sum + ((q.questions?.length || 0) * (q.defaultTimeLimit || 20)), 0
                ) / 60)}m
              </div>
              <div className="text-sm opacity-90">Total Content</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizLibrary;