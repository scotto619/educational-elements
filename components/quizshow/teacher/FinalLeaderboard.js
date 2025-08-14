// components/quizshow/teacher/FinalLeaderboard.js - END GAME PODIUM & LEADERBOARD
import React, { useState, useEffect } from 'react';
import { triggerConfetti, playQuizSound, calculateFinalLeaderboard } from '../../../utils/quizShowHelpers';

const FinalLeaderboard = ({ gameData, onNewGame, onBackToDashboard }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [animateScores, setAnimateScores] = useState(false);

  useEffect(() => {
    if (gameData) {
      const results = calculateFinalLeaderboard(gameData);
      setLeaderboard(results);
      
      // Trigger celebration effects
      setTimeout(() => {
        triggerConfetti();
        playQuizSound('gameEnd');
        setShowCelebration(true);
      }, 500);

      // Animate scores
      setTimeout(() => {
        setAnimateScores(true);
      }, 1000);
    }
  }, [gameData]);

  const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: '🥇', label: 'CHAMPION!', color: 'from-yellow-400 to-orange-500', text: 'text-yellow-900' };
    if (rank === 2) return { emoji: '🥈', label: '2nd Place', color: 'from-gray-300 to-gray-400', text: 'text-gray-800' };
    if (rank === 3) return { emoji: '🥉', label: '3rd Place', color: 'from-amber-600 to-amber-700', text: 'text-amber-900' };
    return { emoji: `#${rank}`, label: `${rank}th Place`, color: 'from-blue-500 to-blue-600', text: 'text-blue-900' };
  };

  const getGameStats = () => {
    if (leaderboard.length === 0) return {};
    
    const totalQuestions = gameData?.quiz?.questions?.length || 0;
    const averageScore = leaderboard.reduce((sum, p) => sum + p.totalScore, 0) / leaderboard.length;
    const averageAccuracy = leaderboard.reduce((sum, p) => sum + p.accuracy, 0) / leaderboard.length;
    const perfectScores = leaderboard.filter(p => p.accuracy === 100).length;
    
    return {
      totalPlayers: leaderboard.length,
      totalQuestions,
      averageScore: Math.round(averageScore),
      averageAccuracy: Math.round(averageAccuracy),
      perfectScores,
      highestScore: leaderboard[0]?.totalScore || 0,
      champion: leaderboard[0]?.name || 'No one'
    };
  };

  const stats = getGameStats();

  const LeaderboardEntry = ({ player, rank }) => {
    const badge = getRankBadge(rank);
    const isTopThree = rank <= 3;
    
    return (
      <div 
        className={`relative rounded-2xl p-6 shadow-2xl transition-all duration-500 transform ${
          animateScores ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${
          isTopThree 
            ? `bg-gradient-to-r ${badge.color} text-white` 
            : 'bg-white border-2 border-gray-200'
        }`}
        style={{ 
          animationDelay: `${rank * 100}ms`,
          animation: animateScores ? 'slideInUp 0.6s ease-out forwards' : 'none'
        }}
      >
        {/* Rank Badge */}
        <div className="absolute -top-4 -left-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
            isTopThree ? 'bg-white text-gray-800' : 'bg-purple-500 text-white'
          }`}>
            {badge.emoji}
          </div>
        </div>

        {/* Winner Celebration */}
        {rank === 1 && showCelebration && (
          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
            🎉
          </div>
        )}

        <div className="flex items-center space-x-6 ml-8">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
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
              {badge.label}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`text-sm ${isTopThree ? 'text-white opacity-75' : 'text-gray-500'}`}>
                {player.correctAnswers} correct • {player.accuracy}% accuracy
              </span>
              {player.accuracy === 100 && (
                <span className="text-yellow-300 text-sm font-bold">PERFECT! ⭐</span>
              )}
            </div>
          </div>

          {/* Score */}
          <div className="text-right">
            <div className={`text-3xl font-bold ${isTopThree ? 'text-white' : 'text-gray-800'}`}>
              {player.totalScore}
            </div>
            <div className={`text-sm ${isTopThree ? 'text-white opacity-75' : 'text-gray-500'}`}>
              points
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mt-4 flex flex-wrap gap-2 ml-8">
          {player.accuracy === 100 && (
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
          {player.correctAnswers >= Math.round(player.totalQuestions * 0.8) && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              isTopThree ? 'bg-white text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}>
              🧠 Knowledge Master
            </span>
          )}
        </div>
      </div>
    );
  };

  const PodiumDisplay = () => {
    if (leaderboard.length < 1) return null;

    return (
      <div className="flex justify-center items-end space-x-8 mb-12">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="text-center">
            <div className="bg-gray-300 text-gray-800 rounded-t-lg p-4 mb-4 shadow-lg" style={{ height: '100px' }}>
              <div className="text-3xl font-bold">2nd</div>
              <div className="text-lg">🥈</div>
            </div>
            <img 
              src={leaderboard[1].avatar?.image || '/avatars/Wizard F/Level 1.png'} 
              className="w-20 h-20 rounded-full border-4 border-white mx-auto mb-3 shadow-lg"
              alt="2nd place"
            />
            <div className="text-lg font-bold text-white">{leaderboard[1].name}</div>
            <div className="text-sm text-gray-300">{leaderboard[1].totalScore} points</div>
          </div>
        )}

        {/* 1st Place */}
        <div className="text-center transform scale-110">
          <div className="bg-yellow-400 text-yellow-900 rounded-t-lg p-6 mb-4 shadow-2xl relative" style={{ height: '140px' }}>
            <div className="text-4xl font-bold">1st</div>
            <div className="text-2xl">🥇</div>
            <div className="absolute -top-3 -left-3 text-2xl animate-bounce">🎉</div>
            <div className="absolute -top-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</div>
          </div>
          <img 
            src={leaderboard[0]?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
            className="w-24 h-24 rounded-full border-4 border-yellow-300 mx-auto mb-3 shadow-2xl"
            alt="1st place"
          />
          <div className="text-xl font-bold text-white">{leaderboard[0]?.name}</div>
          <div className="text-lg text-yellow-300 font-bold">👑 CHAMPION</div>
          <div className="text-sm text-gray-300">{leaderboard[0]?.totalScore} points</div>
        </div>

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="text-center">
            <div className="bg-amber-600 text-white rounded-t-lg p-3 mb-4 shadow-lg" style={{ height: '80px' }}>
              <div className="text-2xl font-bold">3rd</div>
              <div className="text-lg">🥉</div>
            </div>
            <img 
              src={leaderboard[2].avatar?.image || '/avatars/Wizard F/Level 1.png'} 
              className="w-18 h-18 rounded-full border-4 border-white mx-auto mb-3 shadow-lg"
              alt="3rd place"
            />
            <div className="text-lg font-bold text-white">{leaderboard[2].name}</div>
            <div className="text-sm text-gray-300">{leaderboard[2].totalScore} points</div>
          </div>
        )}
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

  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-3xl font-bold mb-4">No Results Available</h1>
          <p className="text-xl text-purple-200 mb-8">No players participated in this game.</p>
          <button
            onClick={onBackToDashboard}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            Back to Dashboard
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
          <h2 className="text-3xl font-bold text-yellow-300 mb-4">
            🏆 {stats.champion} is the Champion! 🏆
          </h2>
          <p className="text-2xl text-purple-100 mb-8">
            Congratulations to all {stats.totalPlayers} participants!
          </p>
          
          {/* Winner's Podium */}
          <PodiumDisplay />
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
            title="Highest Score" 
            value={stats.highestScore} 
            subtitle="points"
            icon="🎯" 
            color="from-green-500 to-green-600"
          />
          <StatCard 
            title="Average Score" 
            value={stats.averageScore} 
            subtitle={`${stats.averageAccuracy}% accuracy`}
            icon="📊" 
            color="from-purple-500 to-purple-600"
          />
          <StatCard 
            title="Perfect Scores" 
            value={stats.perfectScores} 
            subtitle={`${Math.round((stats.perfectScores / stats.totalPlayers) * 100)}% of players`}
            icon="⭐" 
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* Final Leaderboard */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">🏆 Final Leaderboard</h2>
            <div className="flex space-x-4">
              <button
                onClick={onNewGame}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🎪 New Game
              </button>
              <button
                onClick={onBackToDashboard}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                📊 Dashboard
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {leaderboard.map((player, index) => (
              <LeaderboardEntry 
                key={player.playerId || index} 
                player={player} 
                rank={index + 1}
              />
            ))}
          </div>
        </div>

        {/* Quiz Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">📝 Quiz Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Quiz Details</h4>
              <div className="space-y-2 text-gray-600">
                <p><strong>Title:</strong> {gameData?.quiz?.title}</p>
                <p><strong>Category:</strong> {gameData?.quiz?.category}</p>
                <p><strong>Questions:</strong> {stats.totalQuestions}</p>
                <p><strong>Players:</strong> {stats.totalPlayers}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Performance Highlights</h4>
              <div className="space-y-2 text-gray-600">
                <p><strong>Champion:</strong> {stats.champion} ({stats.highestScore} points)</p>
                <p><strong>Perfect Scores:</strong> {stats.perfectScores} players</p>
                <p><strong>Average Accuracy:</strong> {stats.averageAccuracy}%</p>
                <p><strong>Scoring:</strong> +10 correct, -5 incorrect</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">What's Next?</h3>
            <p className="text-purple-100 mb-6">
              Ready for another round? Create a new quiz or play again!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNewGame}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🎪</span>
                <span>New Quiz Show</span>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-purple-400 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-500 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🖨️</span>
                <span>Print Results</span>
              </button>
              <button
                onClick={onBackToDashboard}
                className="bg-purple-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-800 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🏠</span>
                <span>Dashboard</span>
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

export default FinalLeaderboard;