// components/quizshow/teacher/QuizDashboard.js - MAIN TEACHER DASHBOARD
import React, { useState, useEffect } from 'react';
import { QUESTION_CATEGORIES, createQuizFromPreset, playQuizSound } from '../../../utils/quizShowHelpers';

const QuizDashboard = ({ 
  quizzes, 
  onCreateQuiz, 
  onEditQuiz, 
  onStartGame, 
  onViewLibrary, 
  loading 
}) => {
  const [recentGames, setRecentGames] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalGames: 0,
    totalPlayers: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Calculate stats from quizzes data
    setStats({
      totalQuizzes: quizzes.length,
      totalGames: recentGames.length,
      totalPlayers: recentGames.reduce((sum, game) => sum + (game.playerCount || 0), 0),
      averageScore: recentGames.length > 0 
        ? recentGames.reduce((sum, game) => sum + (game.averageScore || 0), 0) / recentGames.length 
        : 0
    });
  }, [quizzes, recentGames]);

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

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  const QuickStartCard = ({ category, categoryData }) => (
    <div 
      className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-300"
      onClick={() => handleQuickStart(category)}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl text-white"
          style={{ backgroundColor: categoryData.color }}
        >
          {categoryData.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{categoryData.name}</h3>
          <p className="text-sm text-gray-600">{categoryData.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Quick Start • 10 Questions</span>
        <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
          Start Game
        </div>
      </div>
    </div>
  );

  const RecentQuizCard = ({ quiz }) => (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 truncate">{quiz.title}</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditQuiz(quiz)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit Quiz"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onStartGame(quiz)}
            className="text-green-600 hover:text-green-800 p-1"
            title="Start Game"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{quiz.questions?.length || 0} questions</span>
        <span className="capitalize">{quiz.category || 'general'}</span>
      </div>
    </div>
  );

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Quizzes" 
          value={stats.totalQuizzes} 
          icon="📝" 
          color="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Games Played" 
          value={stats.totalGames} 
          icon="🎮" 
          color="from-green-500 to-green-600"
        />
        <StatCard 
          title="Total Players" 
          value={stats.totalPlayers} 
          icon="👥" 
          color="from-purple-500 to-purple-600"
        />
        <StatCard 
          title="Avg Score" 
          value={`${Math.round(stats.averageScore)}%`} 
          icon="⭐" 
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <div className="flex space-x-4">
            <button
              onClick={onCreateQuiz}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Custom Quiz</span>
            </button>
            <button
              onClick={onViewLibrary}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Browse Library</span>
            </button>
          </div>
        </div>

        {/* Quick Start Categories */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">🚀 Quick Start Games</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(QUESTION_CATEGORIES).map(([category, categoryData]) => (
              <QuickStartCard 
                key={category} 
                category={category} 
                categoryData={categoryData} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Recent Quizzes</h2>
          <button
            onClick={onViewLibrary}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </button>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.slice(0, 6).map((quiz) => (
              <RecentQuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Quizzes Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first quiz or try a quick start game to get started!
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onCreateQuiz}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
              >
                Create Your First Quiz
              </button>
              <button
                onClick={() => handleQuickStart('mathematics')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Try Quick Start
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Games History */}
      {recentGames.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Game Sessions</h2>
          <div className="space-y-4">
            {recentGames.slice(0, 5).map((game, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">{game.quizTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {game.playerCount} players • {game.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{game.averageScore}% avg score</p>
                  <p className="text-sm text-gray-500">{game.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Creating Game...</p>
            <p className="text-sm text-gray-500 mt-2">Setting up your quiz show experience</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDashboard;