// components/quizshow/shared/LiveLeaderboard.js - REAL-TIME LEADERBOARD
// ===============================================
import React, { useState, useEffect } from 'react';
import { formatScore } from '../../../utils/quizShowHelpers';

export const LiveLeaderboard = ({ 
  players, 
  responses, 
  currentQuestion,
  maxPlayers = 10,
  showScores = true,
  showAvatars = true 
}) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!players) return;

    const scores = Object.entries(players).map(([playerId, player]) => {
      let totalScore = 0;
      let correctAnswers = 0;

      if (responses) {
        Object.entries(responses).forEach(([questionIndex, questionResponses]) => {
          const response = questionResponses[playerId];
          if (response?.isCorrect) {
            correctAnswers++;
            totalScore += response.points || 0;
          }
        });
      }

      return {
        playerId,
        name: player.name,
        avatar: player.avatar,
        totalScore,
        correctAnswers,
        isOnline: true // Could be extended with real presence detection
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    setLeaderboard(scores.slice(0, maxPlayers));
  }, [players, responses, currentQuestion, maxPlayers]);

  const LeaderboardEntry = ({ player, rank }) => {
    const getRankIcon = () => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return `#${rank}`;
    };

    const getRankColor = () => {
      if (rank === 1) return 'text-yellow-600 bg-yellow-50';
      if (rank === 2) return 'text-gray-600 bg-gray-50';
      if (rank === 3) return 'text-amber-600 bg-amber-50';
      return 'text-gray-700 bg-white';
    };

    return (
      <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${getRankColor()}`}>
        <div className="text-lg font-bold w-8 text-center">
          {getRankIcon()}
        </div>
        
        {showAvatars && (
          <div className="relative">
            <img 
              src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
              alt={`${player.name}'s avatar`}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
            {player.isOnline && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
            )}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate text-sm">{player.name}</div>
          <div className="text-xs opacity-75">{player.correctAnswers} correct</div>
        </div>
        
        {showScores && (
          <div className="text-right">
            <div className="font-bold text-sm">{formatScore(player.totalScore)}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">🏆 Leaderboard</h3>
        <div className="text-sm text-gray-600">{leaderboard.length} players</div>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {leaderboard.map((player, index) => (
          <LeaderboardEntry 
            key={player.playerId} 
            player={player} 
            rank={index + 1} 
          />
        ))}
      </div>
      
      {leaderboard.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm">No players yet</p>
        </div>
      )}
    </div>
  );
};