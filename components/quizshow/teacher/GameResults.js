// components/quizshow/teacher/GameResults.js - FINAL RESULTS & LEADERBOARD
import React, { useState, useEffect } from 'react';
import { formatScore, triggerConfetti, playQuizSound } from '../../../utils/quizShowHelpers';

const GameResults = ({ results, onNewGame, getAvatarImage }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    // Trigger celebration effects
    setTimeout(() => {
      triggerConfetti();
      playQuizSound('gameEnd');
      setShowConfetti(true);
    }, 500);

    // Animate scores after a delay
    setTimeout(() => {
      setAnimateScores(true);
    }, 1000);
  }, []);

  const getPlacement = (rank) => {
    if (rank === 1) return { emoji: '🥇', label: 'Champion!', color: 'from-yellow-400 to-orange-500' };
    if (rank === 2) return { emoji: '🥈', label: '2nd Place', color: 'from-gray-300 to-gray-400' };
    if (rank === 3) return { emoji: '🥉', label: '3rd Place', color: 'from-amber-600 to-amber-700' };
    return { emoji: `#${rank}`, label: `${rank}th Place`, color: 'from-blue-500 to-blue-600' };
  };

  const calculateStats = () => {
    if (!results || results.length === 0) return {};
    
    const totalQuestions = results[0]?.totalQuestions || 0;
    const averageScore = results.reduce((sum, r) => sum + r.totalScore, 0) / results.length;
    const averageCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0) / results.length;
    const perfectScores = results.filter(r => r.correctAnswers === totalQuestions).length;
    
    return {
      totalPlayers: results.length,
      totalQuestions,
      averageScore: Math.round(averageScore),
      averageCorrect: Math.round(averageCorrect * 10) / 10,
      perfectScores,
      perfectPercentage: Math.round((perfectScores / results.length) * 100)
    };
  };

  const stats = calculateStats();

  const LeaderboardCard = ({ player, rank, animate = false }) => {
    const placement = getPlacement(rank);
    const isTopThree = rank <= 3;
    
    return (
      <div 
        className={`relative rounded-2xl p-6 shadow-2xl transition-all duration-500 transform ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${
          isTopThree ? `bg-gradient-to-r ${placement.color} text-white` : 'bg-white border-2 border-gray-200'
        }`}
        style={{ 
          animationDelay: `${rank * 100}ms`,
          animation: animate ? 'slideInUp 0.6s ease-out forwards' : 'none'
        }}
      >
        {/* Rank Badge */}
        <div className="absolute -top-4 -left-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
            isTopThree ? 'bg-white text-gray-800' : 'bg-purple-500 text-white'
          }`}>
            {placement.emoji}
          </div>
        </div>

        {/* Confetti for winner */}
        {rank === 1 && showConfetti && (
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
            🎉
          </div>
        )}

        <div className="flex items-center space-x-6 ml-8">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={player.avatar?.image || getAvatarImage?.('Wizard F', 1) || '/avatars/Wizard F/Level 1.png'} 
              alt={`${player.name}'s avatar`}
              className={`w-16 h-16 rounded-full border-4 shadow-lg ${
                isTopThree ? 'border-white' : 'border-purple-300'
              }`}
            />
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isTopThree ? 'bg-white text-gray-800' : 'bg-purple-500 text-white'
            }`}>
              {player.avatar?.level || 1}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-xl font-bold truncate ${isTopThree ? 'text-white' : 'text-gray-800'}`}>
              {player.name}
            </h3>
            <p className={`text-sm ${isTopThree ? 'text-white opacity-90' : 'text-gray-600'}`}>
              {placement.label}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`text-sm ${isTopThree ? 'text-white opacity-75' : 'text-gray-500'}`}>
                {player.correctAnswers} / {player.totalQuestions} correct
              </span>
              {player.correctAnswers === player.totalQuestions && (
                <span className="text-yellow-300 text-sm font-bold">PERFECT! ⭐</span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className={`text-3xl font-bold ${isTopThree ? 'text-white' : 'text-gray-800'}`}>
              {formatScore(player.totalScore)}
            </div>
            <div className={`text-sm ${isTopThree ? 'text-white opacity-75' : 'text-gray-500'}`}>
              points
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mt-4 flex flex-wrap gap-2 ml-8">
          {player.correctAnswers === player.totalQuestions && (
            <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              🎯 Perfect Score
            </span>
          )}
          {rank === 1 && (
            <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full text-xs font-bold">
              👑 Champion
            </span>
          )}
          {player.totalScore > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isTopThree ? 'bg-white text-gray-800' : 'bg-purple-100 text-purple-800'
            }`}>
              🏆 Top Performer
            </span>
          )}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`bg-gradient-to-r ${color} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-3xl font-bold mb-4">No Results Available</h1>
          <p className="text-xl text-purple-200 mb-8">No players participated in this game.</p>
          <button
            onClick={onNewGame}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Create New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto text-center px-6">
          <div className="text-6xl mb-6">🎊</div>
          <h1 className="text-5xl font-bold mb-4">Game Complete!</h1>
          <p className="text-2xl text-purple-100 mb-8">
            Congratulations to all participants!
          </p>
          
          {/* Top 3 Podium */}
          {results.length >= 3 && (
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gray-300 text-gray-800 rounded-t-lg p-4 mb-2" style={{ height: '80px' }}>
                  <div className="text-2xl font-bold">2nd</div>
                </div>
                <img 
                  src={results[1]?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                  className="w-16 h-16 rounded-full border-4 border-white mx-auto mb-2"
                  alt="2nd place"
                />
                <div className="text-sm font-semibold">{results[1]?.name}</div>
                <div className="text-xs opacity-75">{formatScore(results[1]?.totalScore)}</div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-yellow-400 text-yellow-900 rounded-t-lg p-4 mb-2" style={{ height: '120px' }}>
                  <div className="text-3xl font-bold">1st</div>
                  <div className="text-lg">👑</div>
                </div>
                <img 
                  src={results[0]?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                  className="w-20 h-20 rounded-full border-4 border-yellow-300 mx-auto mb-2"
                  alt="1st place"
                />
                <div className="text-lg font-bold">{results[0]?.name}</div>
                <div className="text-sm opacity-75">{formatScore(results[0]?.totalScore)}</div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-amber-600 text-white rounded-t-lg p-4 mb-2" style={{ height: '60px' }}>
                  <div className="text-xl font-bold">3rd</div>
                </div>
                <img 
                  src={results[2]?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                  className="w-14 h-14 rounded-full border-4 border-white mx-auto mb-2"
                  alt="3rd place"
                />
                <div className="text-sm font-semibold">{results[2]?.name}</div>
                <div className="text-xs opacity-75">{formatScore(results[2]?.totalScore)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Game Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Players" 
            value={stats.totalPlayers} 
            icon="👥" 
            color="from-blue-500 to-blue-600"
          />
          <StatCard 
            title="Average Score" 
            value={formatScore(stats.averageScore)} 
            icon="📊" 
            color="from-green-500 to-green-600"
          />
          <StatCard 
            title="Average Correct" 
            value={`${stats.averageCorrect}/${stats.totalQuestions}`} 
            subtitle={`${Math.round((stats.averageCorrect / stats.totalQuestions) * 100)}%`}
            icon="🎯" 
            color="from-purple-500 to-purple-600"
          />
          <StatCard 
            title="Perfect Scores" 
            value={stats.perfectScores} 
            subtitle={`${stats.perfectPercentage}% of players`}
            icon="⭐" 
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Final Leaderboard */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Final Leaderboard</h2>
            <button
              onClick={onNewGame}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              🎪 New Game
            </button>
          </div>

          <div className="space-y-6">
            {results.map((player, index) => (
              <LeaderboardCard 
                key={player.playerId || index} 
                player={player} 
                rank={index + 1}
                animate={animateScores}
              />
            ))}
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Game Highlights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Highest Score */}
            {results.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="font-bold text-lg mb-1">Highest Score</h4>
                <p className="text-2xl font-bold">{formatScore(results[0].totalScore)}</p>
                <p className="text-sm opacity-90">by {results[0].name}</p>
              </div>
            )}

            {/* Most Improved (if we had previous data) */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-bold text-lg mb-1">Great Participation</h4>
              <p className="text-2xl font-bold">{stats.totalPlayers}</p>
              <p className="text-sm opacity-90">students played</p>
            </div>

            {/* Knowledge Champions */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-bold text-lg mb-1">Knowledge Champions</h4>
              <p className="text-2xl font-bold">{stats.perfectScores}</p>
              <p className="text-sm opacity-90">perfect scores</p>
            </div>
          </div>
        </div>

        {/* Teacher Actions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">What's Next?</h3>
            <p className="text-purple-100 mb-6">
              Ready for another round? Create a new quiz or play again!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNewGame}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors"
              >
                🎪 New Quiz Show
              </button>
              <button
                onClick={() => window.print()}
                className="bg-purple-400 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-500 transition-colors"
              >
                🖨️ Print Results
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default GameResults;