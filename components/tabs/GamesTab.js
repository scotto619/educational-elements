// components/tabs/GamesTab.js - Educational Games Collection
import React, { useState, useEffect } from 'react';

// ===============================================
// GAMES TAB COMPONENT
// ===============================================

const GamesTab = ({ showToast = () => {} }) => {
  const [activeGame, setActiveGame] = useState(null);
  const [gameTimer, setGameTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setGameTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && gameTimer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, gameTimer]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start game
  const startGame = (gameId) => {
    setActiveGame(gameId);
    setGameTimer(0);
    setIsTimerRunning(true);
    showToast(`Started ${games.find(g => g.id === gameId)?.name}!`, 'success');
  };

  // Stop game
  const stopGame = () => {
    setIsTimerRunning(false);
    showToast(`Game stopped! Time: ${formatTime(gameTimer)}`, 'info');
    setActiveGame(null);
    setGameTimer(0);
  };

  // Pause/Resume game
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Available games
  const games = [
    {
      id: 'word-search',
      name: 'Word Search',
      icon: '🔍',
      description: 'Find hidden words in the grid',
      category: 'Language Arts',
      difficulty: 'Easy',
      timeLimit: 300, // 5 minutes
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'math-race',
      name: 'Math Race',
      icon: '🏁',
      description: 'Solve math problems as quickly as possible',
      category: 'Mathematics',
      difficulty: 'Medium',
      timeLimit: 180, // 3 minutes
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Match pairs of cards to test your memory',
      category: 'Logic',
      difficulty: 'Easy',
      timeLimit: 240, // 4 minutes
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'spelling-bee',
      name: 'Spelling Challenge',
      icon: '🐝',
      description: 'Spell words correctly to advance',
      category: 'Language Arts',
      difficulty: 'Medium',
      timeLimit: 600, // 10 minutes
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'geography-quiz',
      name: 'Geography Quest',
      icon: '🌍',
      description: 'Test your knowledge of world geography',
      category: 'Social Studies',
      difficulty: 'Hard',
      timeLimit: 480, // 8 minutes
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'science-lab',
      name: 'Virtual Science Lab',
      icon: '🔬',
      description: 'Conduct virtual experiments safely',
      category: 'Science',
      difficulty: 'Hard',
      timeLimit: 900, // 15 minutes
      color: 'from-red-500 to-red-600'
    }
  ];

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Language Arts': return 'bg-blue-100 text-blue-800';
      case 'Mathematics': return 'bg-green-100 text-green-800';
      case 'Science': return 'bg-red-100 text-red-800';
      case 'Social Studies': return 'bg-purple-100 text-purple-800';
      case 'Logic': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Timer (when active) */}
      {activeGame && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">
                {games.find(g => g.id === activeGame)?.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {games.find(g => g.id === activeGame)?.name}
                </h3>
                <p className="text-orange-100">Game in Progress</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-mono font-bold mb-2">
                {formatTime(gameTimer)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleTimer}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
                >
                  {isTimerRunning ? '⏸️ Pause' : '▶️ Resume'}
                </button>
                <button
                  onClick={stopGame}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all"
                >
                  🛑 Stop
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar for time limit */}
          {games.find(g => g.id === activeGame)?.timeLimit && (
            <div className="mt-4">
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min((gameTimer / games.find(g => g.id === activeGame).timeLimit) * 100, 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-orange-100 mt-1">
                {games.find(g => g.id === activeGame).timeLimit - gameTimer > 0 
                  ? `${games.find(g => g.id === activeGame).timeLimit - gameTimer} seconds remaining`
                  : 'Time\'s up!'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Games Grid */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">🎮 Educational Games</h3>
          <div className="text-sm text-gray-600">
            {games.length} games available
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map(game => (
            <div
              key={game.id}
              className={`border-2 rounded-xl p-6 transition-all duration-300 ${
                activeGame === game.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-3">{game.icon}</div>
                <h4 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h4>
                <p className="text-gray-600 text-sm">{game.description}</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(game.category)}`}>
                    {game.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(game.difficulty)}`}>
                    {game.difficulty}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 text-center">
                  ⏱️ {Math.floor(game.timeLimit / 60)} minutes
                </div>
              </div>

              <button
                onClick={() => startGame(game.id)}
                disabled={activeGame === game.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  activeGame === game.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : `bg-gradient-to-r ${game.color} text-white hover:shadow-lg`
                }`}
              >
                {activeGame === game.id ? '🎮 Playing' : '🚀 Start Game'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Game Instructions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 How to Play</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-800">Choose a Game</h4>
                <p className="text-sm text-gray-600">Select any game from the collection above</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-800">Start the Timer</h4>
                <p className="text-sm text-gray-600">Click "Start Game" to begin the timer and activity</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-800">Play & Learn</h4>
                <p className="text-sm text-gray-600">Engage students with the educational content</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-800">Track Progress</h4>
                <p className="text-sm text-gray-600">Use the timer to manage game sessions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => showToast('Random team generator coming soon!', 'info')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <div className="text-2xl mb-2">🎲</div>
            <p className="font-semibold text-sm">Random Teams</p>
          </button>
          
          <button
            onClick={() => showToast('Name picker coming soon!', 'info')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
          >
            <div className="text-2xl mb-2">🎯</div>
            <p className="font-semibold text-sm">Pick a Name</p>
          </button>
          
          <button
            onClick={() => showToast('Class timer coming soon!', 'info')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
          >
            <div className="text-2xl mb-2">⏰</div>
            <p className="font-semibold text-sm">Class Timer</p>
          </button>
          
          <button
            onClick={() => showToast('Noise meter coming soon!', 'info')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <div className="text-2xl mb-2">🔊</div>
            <p className="font-semibold text-sm">Noise Meter</p>
          </button>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Session Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-sm text-gray-600">Games Played Today</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">00:00</div>
            <p className="text-sm text-gray-600">Total Play Time</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">N/A</div>
            <p className="text-sm text-gray-600">Favorite Game</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;