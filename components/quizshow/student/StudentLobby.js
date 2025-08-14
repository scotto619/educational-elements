// components/quizshow/student/StudentLobby.js - STUDENT WAITING ROOM
import React, { useState, useEffect } from 'react';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const StudentLobby = ({ roomCode, gameData, playerInfo, onLeaveGame }) => {
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (gameData?.players) {
      const playerList = Object.entries(gameData.players).map(([id, player]) => ({
        id,
        ...player
      }));
      setPlayers(playerList);
    }

    // Check if game is starting
    if (gameData?.status === 'playing') {
      startCountdown();
    }
  }, [gameData]);

  const startCountdown = () => {
    setShowAnimation(true);
    playQuizSound('gameStart');
    
    let count = 3;
    setCountdown(count);
    
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playQuizSound('tick');
      } else {
        setCountdown('GO!');
        playQuizSound('gameStart');
        clearInterval(timer);
        
        setTimeout(() => {
          // Game will transition to StudentGameView
          setShowAnimation(false);
        }, 1000);
      }
    }, 1000);
  };

  const PlayerAvatar = ({ player, isMe = false }) => (
    <div className={`relative ${isMe ? 'transform scale-110' : ''}`}>
      <div className={`rounded-xl p-4 transition-all duration-300 ${
        isMe 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-2xl ring-4 ring-yellow-300' 
          : 'bg-white shadow-lg hover:shadow-xl'
      }`}>
        <div className="text-center">
          <div className="relative mb-3">
            <img 
              src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
              alt={`${player.name}'s avatar`}
              className={`w-16 h-16 mx-auto rounded-full border-4 ${
                isMe ? 'border-yellow-200' : 'border-purple-300'
              } shadow-lg`}
            />
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isMe ? 'bg-white text-orange-600' : 'bg-purple-500 text-white'
            }`}>
              {player.avatar?.level || 1}
            </div>
            {isMe && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                  YOU
                </div>
              </div>
            )}
          </div>
          <h3 className={`font-bold text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>
            {player.name}
          </h3>
          <p className={`text-xs ${isMe ? 'text-yellow-100' : 'text-gray-600'}`}>
            Level {player.avatar?.level || 1}
          </p>
        </div>
      </div>
      
      {isMe && (
        <div className="absolute -top-2 -left-2 animate-bounce">
          <div className="text-2xl">⭐</div>
        </div>
      )}
    </div>
  );

  if (showAnimation && countdown !== null) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-pulse mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">Get Ready!</h1>
            <p className="text-2xl text-purple-200">The game is starting...</p>
          </div>
          
          <div className="text-center">
            {countdown === 'GO!' ? (
              <div className="animate-bounce">
                <div className="text-8xl font-bold text-green-400 mb-4">{countdown}</div>
                <div className="text-4xl">🎉</div>
              </div>
            ) : (
              <div className="text-9xl font-bold text-white animate-pulse">
                {countdown}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎪 Waiting for Game to Start</h1>
              <h2 className="text-xl text-purple-100 mb-2">{gameData?.quiz?.title}</h2>
              <div className="flex items-center space-x-4 text-purple-100 text-sm">
                <span>📝 {gameData?.quiz?.questions?.length || 0} Questions</span>
                <span>⏱️ {gameData?.settings?.timePerQuestion || 20}s each</span>
                <span>🏆 {gameData?.quiz?.category || 'General'}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-400 text-purple-900 px-4 py-3 rounded-xl shadow-lg">
                <p className="text-xs font-semibold mb-1">ROOM</p>
                <p className="text-2xl font-bold">{roomCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Character Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Character</h2>
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img 
                  src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                  alt="Your avatar"
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 text-orange-800 rounded-full flex items-center justify-center text-sm font-bold">
                  {playerInfo?.avatar?.level || 1}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{playerInfo?.name}</h3>
                <p className="text-lg text-gray-600">Level {playerInfo?.avatar?.level || 1} Champion</p>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-semibold">Ready to play!</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Players */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Other Players ({players.length - 1})
            </h2>
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">Waiting for teacher to start...</span>
            </div>
          </div>

          {players.length > 1 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {players
                .filter(p => p.id !== playerInfo?.playerId)
                .map((player) => (
                  <PlayerAvatar key={player.id} player={player} />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                You're the first player!
              </h3>
              <p className="text-gray-500">
                Waiting for other students to join...
              </p>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 How to Play</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-600">1.</span>
                <span>Read each question carefully</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-600">2.</span>
                <span>Select your answer before time runs out</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-600">3.</span>
                <span>Faster correct answers earn more points</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-bold text-purple-600">4.</span>
                <span>Compete for the top spot on the leaderboard!</span>
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Scoring</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Correct Answer:</span>
                <span className="font-semibold text-green-600">+1000 points</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Speed Bonus:</span>
                <span className="font-semibold text-blue-600">Up to +500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wrong Answer:</span>
                <span className="font-semibold text-red-600">0 points</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Per Question:</span>
                  <span className="font-bold text-purple-600">1500 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Waiting Elements */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-8">
          <div className="text-center">
            <div className="text-4xl mb-3">🎮</div>
            <h3 className="text-xl font-bold mb-2">Get Ready to Play!</h3>
            <p className="text-purple-100 mb-4">
              Your teacher will start the game when everyone is ready.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <span>Be quick to earn bonus points</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧠</span>
                <span>Think carefully before answering</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <span>Have fun learning!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Game Button */}
        <div className="text-center">
          <button
            onClick={onLeaveGame}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLobby;