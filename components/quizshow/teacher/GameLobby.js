// components/quizshow/teacher/GameLobby.js - TEACHER GAME WAITING ROOM
import React, { useState, useEffect } from 'react';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const GameLobby = ({ roomCode, gameData, onStartGame, onEndGame, loading }) => {
  const [players, setPlayers] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    showLeaderboard: true,
    allowLateJoin: false,
    timePerQuestion: 20,
    showCorrectAnswers: true
  });

  useEffect(() => {
    if (gameData?.players) {
      const playerList = Object.entries(gameData.players).map(([id, player]) => ({
        id,
        ...player
      }));
      setPlayers(playerList);
      
      // Play join sound when new player joins
      if (playerList.length > players.length) {
        playQuizSound('join');
      }
    }

    if (gameData?.settings) {
      setGameSettings(gameData.settings);
    }
  }, [gameData]);

  const canStartGame = players.length > 0 && gameData?.quiz?.questions?.length > 0;

  const PlayerCard = ({ player }) => (
    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 transform hover:scale-105">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img 
            src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
            alt={`${player.name}'s avatar`}
            className="w-12 h-12 rounded-full border-2 border-purple-300"
          />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{player.avatar?.level || 1}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{player.name}</h3>
          <p className="text-sm text-gray-600">
            Level {player.avatar?.level || 1} Champion
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-semibold">Ready</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🎪 Game Lobby</h1>
              <h2 className="text-2xl text-purple-100 mb-4">{gameData?.quiz?.title}</h2>
              <div className="flex items-center space-x-6 text-purple-100">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📝</span>
                  <span>{gameData?.quiz?.questions?.length || 0} Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏱️</span>
                  <span>{gameSettings.timePerQuestion}s per question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <span>{gameData?.quiz?.category || 'General'}</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-400 text-purple-900 px-6 py-4 rounded-xl shadow-lg">
                <p className="text-sm font-semibold mb-1">ROOM CODE</p>
                <p className="text-4xl font-bold tracking-wider">{roomCode}</p>
              </div>
              <p className="text-purple-100 text-sm mt-2">
                Students enter this code to join
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Players Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Players ({players.length})
                </h2>
                <div className="flex items-center space-x-2 text-green-600">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Waiting for players...</span>
                </div>
              </div>

              {players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Waiting for players to join...
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Share the room code <strong>{roomCode}</strong> with your students
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Tip:</strong> Students can join by clicking "Join as Student" 
                      button in the Quiz Show tab and entering the room code.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Game Controls */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Game Controls</h3>
              
              <div className="space-y-4">
                <button
                  onClick={onStartGame}
                  disabled={!canStartGame || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>Start Game</span>
                    </>
                  )}
                </button>

                {!canStartGame && (
                  <p className="text-sm text-gray-500 text-center">
                    {players.length === 0 
                      ? "Need at least 1 player to start" 
                      : "Loading quiz data..."
                    }
                  </p>
                )}

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Game Settings</span>
                </button>

                <button
                  onClick={onEndGame}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>🛑</span>
                  <span>End Game</span>
                </button>
              </div>
            </div>

            {/* Game Settings Panel */}
            {showSettings && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Show Leaderboard</span>
                    <input
                      type="checkbox"
                      checked={gameSettings.showLeaderboard}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        showLeaderboard: e.target.checked 
                      }))}
                      className="text-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Allow Late Join</span>
                    <input
                      type="checkbox"
                      checked={gameSettings.allowLateJoin}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        allowLateJoin: e.target.checked 
                      }))}
                      className="text-purple-600 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Show Correct Answers</span>
                    <input
                      type="checkbox"
                      checked={gameSettings.showCorrectAnswers}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        showCorrectAnswers: e.target.checked 
                      }))}
                      className="text-purple-600 rounded"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Time per Question: {gameSettings.timePerQuestion}s
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={gameSettings.timePerQuestion}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        timePerQuestion: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Preview</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-semibold">{gameData?.quiz?.questions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-semibold capitalize">{gameData?.quiz?.category || 'General'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-semibold">
                    {Math.ceil(((gameData?.quiz?.questions?.length || 0) * gameSettings.timePerQuestion) / 60)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Points:</span>
                  <span className="font-semibold">
                    {((gameData?.quiz?.questions || []).reduce((sum, q) => sum + (q.points || 1000), 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {gameData?.quiz?.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">{gameData.quiz.description}</p>
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-3">🔗 Share Room Code</h3>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <p className="text-sm opacity-90 mb-2">Room Code</p>
                <p className="text-3xl font-bold tracking-wider">{roomCode}</p>
              </div>
              <p className="text-sm opacity-90 mt-3 text-center">
                Students enter this code to join the game
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Bar */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">ℹ️</div>
            <div>
              <h3 className="font-bold text-blue-800 mb-1">How to Start</h3>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Share room code <strong>{roomCode}</strong> with students</li>
                <li>2. Wait for students to join using their avatars</li>
                <li>3. Adjust game settings if needed</li>
                <li>4. Click "Start Game" when ready!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;