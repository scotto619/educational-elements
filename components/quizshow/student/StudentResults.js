// components/quizshow/student/StudentResults.js - STUDENT RESULTS SCREEN
import React, { useState, useEffect } from 'react';
import { formatScore, triggerConfetti, playQuizSound } from '../../../utils/quizShowHelpers';

const StudentResults = ({ 
  results, 
  playerInfo, 
  onPlayAgain, 
  onLeaveGame,
  getAvatarImage 
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [personalStats, setPersonalStats] = useState(null);
  const [rank, setRank] = useState(0);
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    if (!results || !playerInfo) return;

    // Find player's results and rank
    const playerResult = results.find(r => r.playerId === playerInfo.playerId);
    const playerRank = results.findIndex(r => r.playerId === playerInfo.playerId) + 1;
    
    setPersonalStats(playerResult);
    setRank(playerRank);

    // Trigger celebration for top performers
    if (playerRank <= 3) {
      setTimeout(() => {
        triggerConfetti();
        playQuizSound('gameEnd');
        setShowCelebration(true);
      }, 500);
    }

    // Animate score
    setTimeout(() => {
      setAnimateScore(true);
    }, 1000);
  }, [results, playerInfo]);

  if (!personalStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-3xl font-bold mb-4">Results Not Found</h1>
          <p className="text-xl text-purple-200 mb-8">
            Unable to load your game results.
          </p>
          <button
            onClick={onLeaveGame}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getRankDisplay = () => {
    if (rank === 1) return { emoji: '🥇', text: 'Champion!', color: 'from-yellow-400 to-orange-500' };
    if (rank === 2) return { emoji: '🥈', text: '2nd Place!', color: 'from-gray-300 to-gray-400' };
    if (rank === 3) return { emoji: '🥉', text: '3rd Place!', color: 'from-amber-600 to-amber-700' };
    if (rank <= 10) return { emoji: '🏆', text: `${rank}th Place`, color: 'from-purple-500 to-indigo-500' };
    return { emoji: '🎯', text: `${rank}th Place`, color: 'from-blue-500 to-blue-600' };
  };

  const getEncouragement = () => {
    const percentage = (personalStats.correctAnswers / personalStats.totalQuestions) * 100;
    
    if (percentage === 100) return "Perfect score! You're a quiz master! 🎯";
    if (percentage >= 80) return "Excellent work! You really know your stuff! 🌟";
    if (percentage >= 60) return "Great job! Keep up the good work! 👏";
    if (percentage >= 40) return "Good effort! Practice makes perfect! 💪";
    return "Nice try! Every question is a learning opportunity! 📚";
  };

  const rankDisplay = getRankDisplay();
  const accuracyPercentage = Math.round((personalStats.correctAnswers / personalStats.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${rankDisplay.color} text-white py-16 relative overflow-hidden`}>
        {showCelebration && rank <= 3 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 text-4xl animate-bounce">🎉</div>
            <div className="absolute top-20 right-20 text-4xl animate-bounce delay-300">🎊</div>
            <div className="absolute bottom-20 left-20 text-4xl animate-bounce delay-500">✨</div>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <div className="text-8xl mb-6">{rankDisplay.emoji}</div>
          <h1 className="text-5xl font-bold mb-4">{rankDisplay.text}</h1>
          <p className="text-2xl mb-8 opacity-90">
            {getEncouragement()}
          </p>
          
          {/* Player Avatar and Info */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <div className="relative">
              <img 
                src={playerInfo?.avatar?.image || getAvatarImage?.('Wizard F', 1) || '/avatars/Wizard F/Level 1.png'} 
                alt="Your avatar"
                className="w-24 h-24 rounded-full border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white text-gray-800 rounded-full flex items-center justify-center text-sm font-bold">
                {playerInfo?.avatar?.level || 1}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold">{playerInfo?.name}</h2>
              <p className="text-xl opacity-90">Level {playerInfo?.avatar?.level || 1} Champion</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Score Display */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Final Score</h3>
            <div className={`text-6xl font-bold text-purple-600 mb-4 transition-all duration-1000 ${
              animateScore ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            }`}>
              {formatScore(personalStats.totalScore)}
            </div>
            <p className="text-xl text-gray-600">Points Earned</p>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-green-600 mb-2">{personalStats.correctAnswers}</div>
            <div className="text-gray-600">Correct Answers</div>
            <div className="text-sm text-gray-500 mt-1">
              out of {personalStats.totalQuestions}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{accuracyPercentage}%</div>
            <div className="text-gray-600">Accuracy</div>
            <div className="text-sm text-gray-500 mt-1">
              {accuracyPercentage >= 80 ? 'Excellent!' : accuracyPercentage >= 60 ? 'Good!' : 'Keep practicing!'}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🏅</div>
            <div className="text-3xl font-bold text-purple-600 mb-2">#{rank}</div>
            <div className="text-gray-600">Ranking</div>
            <div className="text-sm text-gray-500 mt-1">
              out of {results.length} players
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {personalStats.correctAnswers === personalStats.totalQuestions && (
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                <span>🎯</span>
                <span>Perfect Score!</span>
              </div>
            )}
            
            {rank === 1 && (
              <div className="bg-gold-100 text-yellow-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                <span>👑</span>
                <span>Quiz Champion</span>
              </div>
            )}
            
            {rank <= 3 && (
              <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                <span>🏆</span>
                <span>Top 3 Finisher</span>
              </div>
            )}
            
            {accuracyPercentage >= 80 && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                <span>🌟</span>
                <span>High Achiever</span>
              </div>
            )}
            
            {personalStats.totalScore > 0 && (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
                <span>🎓</span>
                <span>Knowledge Seeker</span>
              </div>
            )}
            
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold flex items-center space-x-2">
              <span>⚡</span>
              <span>Quiz Participant</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🏅 Final Leaderboard</h3>
          <div className="space-y-3">
            {results.slice(0, 5).map((player, index) => {
              const isMe = player.playerId === playerInfo.playerId;
              return (
                <div 
                  key={player.playerId}
                  className={`flex items-center space-x-4 p-3 rounded-lg transition-all ${
                    isMe 
                      ? 'bg-purple-100 border-2 border-purple-300 transform scale-105' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-bold w-8 text-center">
                    {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : `#${index + 1}`}
                  </div>
                  <img 
                    src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                    alt={`${player.name}'s avatar`}
                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${isMe ? 'text-purple-800' : 'text-gray-800'}`}>
                      {player.name} {isMe && '(You)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {player.correctAnswers}/{player.totalQuestions} correct
                    </div>
                  </div>
                  <div className={`font-bold ${isMe ? 'text-purple-600' : 'text-gray-700'}`}>
                    {formatScore(player.totalScore)}
                  </div>
                </div>
              );
            })}
            
            {results.length > 5 && (
              <div className="text-center text-gray-500 text-sm pt-2">
                ... and {results.length - 5} more players
              </div>
            )}
          </div>
        </div>

        {/* Rewards Information */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🎁 Rewards Earned</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">+{10 + (personalStats.correctAnswers * 5) + (rank <= 3 ? [25, 15, 10][rank - 1] : 0)} XP</div>
              <div className="text-sm opacity-90">Experience Points</div>
              <div className="text-xs opacity-75 mt-1">
                Participation + Correct Answers + Ranking Bonus
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-2xl font-bold">+{Math.floor(personalStats.totalScore / 100)} Coins</div>
              <div className="text-sm opacity-90">Game Currency</div>
              <div className="text-xs opacity-75 mt-1">
                Based on your total score
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>🎮</span>
            <span>Play Another Game</span>
          </button>
          
          <button
            onClick={onLeaveGame}
            className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🏠</span>
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Motivational Quote */}
        <div className="text-center py-8">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="text-3xl mb-3">💡</div>
            <p className="text-indigo-800 font-semibold text-lg mb-2">
              "Every expert was once a beginner!"
            </p>
            <p className="text-indigo-600 text-sm">
              Keep playing and learning to improve your skills and climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;