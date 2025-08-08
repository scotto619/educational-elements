// components/tabs/GamesTab.js - Main Games Hub with Multiple Game Options
import React, { useState } from 'react';

// Import all individual game components
import BoggleGame from '../games/BoggleGame';
import MathRaceGame from '../games/MathRaceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import NoggleGame from '../games/NoggleGame';
import WordSearchGame from '../games/WordSearchGame';

// ===============================================
// GAME DEFINITIONS
// ===============================================
const AVAILABLE_GAMES = [
  {
    id: 'word-search',
    name: 'Word Search',
    icon: '🔍',
    description: 'Find hidden words in the grid with custom word lists and printing options',
    component: WordSearchGame,
    color: 'from-blue-500 to-blue-600',
    difficulty: 'Easy - Medium',
    players: '1-30 students',
    time: '5-15 minutes'
  },
  {
    id: 'math-race',
    name: 'Math Race',
    icon: '🧮',
    description: 'Fast-paced math problem solving with different difficulty levels',
    component: MathRaceGame,
    color: 'from-green-500 to-green-600',
    difficulty: 'Easy - Hard',
    players: '1-30 students',
    time: '2-5 minutes'
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    icon: '🧠',
    description: 'Classic memory card matching game with multiple themes',
    component: MemoryMatchGame,
    color: 'from-purple-500 to-purple-600',
    difficulty: 'Easy - Expert',
    players: '1-10 students',
    time: '3-8 minutes'
  },
  {
    id: 'boggle',
    name: 'Word Boggle',
    icon: '🔤',
    description: 'Form words by connecting adjacent letters in the grid',
    component: BoggleGame,
    color: 'from-yellow-500 to-orange-500',
    difficulty: 'Medium - Hard',
    players: '1-30 students',
    time: '3-5 minutes'
  },
  {
    id: 'noggle',
    name: 'Number Noggle',
    icon: '🔢',
    description: 'Create sums by connecting adjacent numbers to hit target values',
    component: NoggleGame,
    color: 'from-red-500 to-pink-500',
    difficulty: 'Medium - Hard',
    players: '1-30 students',
    time: '3-5 minutes'
  }
];

// ===============================================
// MAIN GAMES TAB COMPONENT
// ===============================================
const GamesTab = ({ students = [], showToast = () => {} }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState('digital'); // 'digital' or 'projector'

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  // Render individual game
  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToMenu}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Games
              </button>
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedGame.color} flex items-center justify-center text-2xl`}>
                  {selectedGame.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedGame.name}</h2>
                  <p className="text-gray-600">{selectedGame.description}</p>
                </div>
              </div>
            </div>

            {/* Game Mode Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Mode:</span>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="digital">🖥️ Digital (Interactive)</option>
                  <option value="projector">📽️ Projector (Display Only)</option>
                </select>
              </div>

              <div className="text-sm text-gray-500">
                👥 {students.length} students connected
              </div>
            </div>
          </div>

          {/* Game Info Bar */}
          <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <span className="font-medium">⚡ Difficulty:</span>
              <span className="text-gray-600">{selectedGame.difficulty}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">👥 Players:</span>
              <span className="text-gray-600">{selectedGame.players}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">⏱️ Duration:</span>
              <span className="text-gray-600">{selectedGame.time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">📱 Mode:</span>
              <span className="text-gray-600">{gameMode === 'digital' ? 'Interactive' : 'Display Only'}</span>
            </div>
          </div>
        </div>

        {/* Game Component */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <GameComponent 
            gameMode={gameMode}
            showToast={showToast}
            students={students}
          />
        </div>
      </div>
    );
  }

  // Game Selection Menu
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Classroom Games
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Engage your students with fun, educational games. Perfect for brain breaks, reward time, or interactive learning sessions.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>👥</span>
              <span>{students.length} students ready</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>🎯</span>
              <span>{AVAILABLE_GAMES.length} games available</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>⚡</span>
              <span>Quick setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Mode Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🖥️ Choose Game Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setGameMode('digital')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              gameMode === 'digital' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🖥️</div>
            <h4 className="font-bold text-gray-800">Digital Mode</h4>
            <p className="text-sm text-gray-600">Students interact directly with the game. Perfect for individual or small group play.</p>
          </div>
          <div 
            onClick={() => setGameMode('projector')}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              gameMode === 'projector' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📽️</div>
            <h4 className="font-bold text-gray-800">Projector Mode</h4>
            <p className="text-sm text-gray-600">Display on projector for whole class participation. Teacher controls the game.</p>
          </div>
        </div>
      </div>

      {/* Available Games */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 Select a Game</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameSelect(game)}
              className="group cursor-pointer bg-gray-50 rounded-xl p-6 border-2 border-transparent hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              {/* Game Icon & Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                  {game.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {game.name}
                  </h4>
                </div>
              </div>

              {/* Game Description */}
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {game.description}
              </p>

              {/* Game Details */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>⚡ Difficulty:</span>
                  <span className="font-medium">{game.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>👥 Players:</span>
                  <span className="font-medium">{game.players}</span>
                </div>
                <div className="flex justify-between">
                  <span>⏱️ Duration:</span>
                  <span className="font-medium">{game.time}</span>
                </div>
              </div>

              {/* Play Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all`}>
                  🎮 Play Game
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Game Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">🖥️ Digital Mode</div>
            <div className="text-gray-600">Best for individual practice and small groups</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">📽️ Projector Mode</div>
            <div className="text-gray-600">Perfect for whole class activities and competitions</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700 mb-1">⏱️ Quick Games</div>
            <div className="text-gray-600">Great for brain breaks and transitions</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-orange-700 mb-1">🏆 Rewards</div>
            <div className="text-gray-600">Use as classroom rewards or celebration activities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;