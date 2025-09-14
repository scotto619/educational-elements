// components/tabs/GamesTab.js - Complete Working Version with Battle Royale
import React, { useState } from 'react';

// Import all individual game components
import BoggleGame from '../games/BoggleGame';
import MathRaceGame from '../games/MathRaceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import NoggleGame from '../games/NoggleGame';
import WordSearchGame from '../games/WordSearchGame';
import CrosswordGame from '../games/CrosswordGame';
import Match3BattleGame from '../games/Match3BattleGame';
import BattleRoyaleGame from '../games/BattleRoyaleGame';

// ===============================================
// COMPLETE GAME DEFINITIONS
// ===============================================
const AVAILABLE_GAMES = [
  {
    id: 'battle-royale',
    name: 'Battle Royale Learning',
    icon: '⚔️',
    description: 'Epic multiplayer battle where students compete to be the last survivor! Answer math questions to attack and defend!',
    component: BattleRoyaleGame,
    color: 'from-red-600 to-orange-600',
    difficulty: 'Easy - Hard',
    players: '2-30 students',
    time: '10-20 minutes',
    special: true,
    featured: true,
    multiplayer: true,
    realtime: true
  },
  {
    id: 'match3battle',
    name: 'Match-3 Battle Arena',
    icon: '⚔️',
    description: 'Epic fantasy RPG match-3 combat! Battle enemies, collect upgrades, and climb the tower of challenges!',
    component: Match3BattleGame,
    color: 'from-red-500 to-purple-600',
    difficulty: 'Medium - Expert',
    players: '1 player (Multiplayer coming)',
    time: '5-30 minutes',
    special: true,
    featured: false
  },
  {
    id: 'crossword',
    name: 'Crossword Puzzle',
    icon: '🧩',
    description: 'Create custom crossword puzzles with your own clues and print them for class use',
    component: CrosswordGame,
    color: 'from-indigo-500 to-purple-600',
    difficulty: 'Easy - Hard',
    players: '1-30 students',
    time: '10-30 minutes'
  },
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
const GamesTab = ({ 
  students = [], 
  showToast = () => {},
  onAwardXP = null,
  onAwardCoins = null,
  currentClassData = null,
  user = null
}) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState('digital');

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const handleBackToMenu = () => {
    setSelectedGame(null);
  };

  console.log('🎮 GamesTab loaded - Students:', students.length, 'ClassCode:', currentClassData?.classCode);

  // Render individual game
  if (selectedGame) {
    const GameComponent = selectedGame.component;
    
    console.log('🎮 Loading game:', selectedGame.name, 'Mode:', gameMode);
    
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
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${selectedGame.color} flex items-center justify-center text-2xl ${
                  selectedGame.special ? 'ring-4 ring-yellow-400 ring-opacity-60 animate-pulse' : ''
                } ${selectedGame.realtime ? 'ring-4 ring-red-400 ring-opacity-60 animate-pulse' : ''}`}>
                  {selectedGame.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    {selectedGame.name}
                    {selectedGame.featured && <span className="ml-2 text-yellow-500">⭐</span>}
                    {selectedGame.special && <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">NEW!</span>}
                    {selectedGame.realtime && <span className="ml-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-bold">🔴 LIVE</span>}
                  </h2>
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
                  disabled={selectedGame.id === 'match3battle' || selectedGame.id === 'battle-royale'}
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
              <span className="text-gray-600">
                {selectedGame.id === 'battle-royale' ? 'Multiplayer Battle' :
                 selectedGame.id === 'match3battle' ? 'Adventure RPG' : 
                 gameMode === 'digital' ? 'Interactive' : 'Display Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Game Component - WITH ALL REQUIRED PROPS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <GameComponent 
            gameMode={selectedGame.id === 'match3battle' || selectedGame.id === 'battle-royale' ? 'digital' : gameMode}
            showToast={showToast}
            students={students}
            studentData={students.length > 0 ? students[0] : null}
            updateStudentData={null}
            
            // Battle Royale specific props
            onAwardXP={onAwardXP}
            onAwardCoins={onAwardCoins}
            classData={currentClassData}
            user={user}
          />
        </div>
      </div>
    );
  }

  // Game Selection Menu
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
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
            {currentClassData?.classCode && (
              <div className="flex items-center space-x-1">
                <span>🔴</span>
                <span>Multiplayer Ready</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Game Spotlight - Battle Royale Learning */}
      {AVAILABLE_GAMES.find(g => g.featured) && (
        <div className="bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900 rounded-xl shadow-lg p-8 text-white">
          <div className="text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              🌟 NEW: Battle Royale Learning! 🌟
            </h3>
            <p className="text-xl mb-4 text-orange-100">
              Epic multiplayer learning battle! Students compete to be the last survivor by answering math questions correctly. First correct answer protects you and attacks another player!
            </p>
            
            {!currentClassData?.classCode && (
              <div className="bg-orange-100 text-orange-800 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <p className="text-sm font-semibold">⚠️ Class code required for multiplayer battles</p>
                <p className="text-xs mt-1">Generate a class code in Settings to enable Battle Royale</p>
              </div>
            )}
            
            <div className="flex justify-center items-center space-x-8 text-sm mb-6">
              <div className="flex items-center space-x-2">
                <span>⚔️</span>
                <span>Battle System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔴</span>
                <span>Real-time Multiplayer</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🧮</span>
                <span>Math Learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏆</span>
                <span>Survival Challenge</span>
              </div>
            </div>
            <button
              onClick={() => handleGameSelect(AVAILABLE_GAMES.find(g => g.featured))}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              ⚔️ START EPIC BATTLE!
            </button>
          </div>
        </div>
      )}

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

      {/* Available Games Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🎯 Select a Game</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameSelect(game)}
              className={`group cursor-pointer rounded-xl p-6 border-2 border-transparent hover:border-gray-300 hover:shadow-lg transition-all duration-200 relative ${
                game.special 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 ring-2 ring-yellow-400 ring-opacity-50' 
                  : game.realtime
                  ? 'bg-gradient-to-br from-red-50 to-pink-50 ring-2 ring-red-400 ring-opacity-50'
                  : 'bg-gray-50'
              }`}
            >
              {game.special && !game.realtime && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 animate-bounce">
                  NEW!
                </div>
              )}
              
              {game.realtime && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                  🔴 LIVE
                </div>
              )}
              
              {/* Game Icon & Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${
                  game.special || game.realtime ? 'animate-pulse' : ''
                }`}>
                  {game.icon}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center">
                    {game.name}
                    {game.featured && <span className="ml-2 text-yellow-500">⭐</span>}
                    {game.realtime && <span className="ml-2 text-red-500">🔴</span>}
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
                {game.multiplayer && (
                  <div className="flex justify-between">
                    <span>🎮 Type:</span>
                    <span className="font-medium text-purple-600">
                      {game.realtime ? 'Real-time Battle' : 'Multiplayer'}
                    </span>
                  </div>
                )}
              </div>

              {/* Play Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all ${
                  game.special || game.realtime ? 'animate-pulse' : ''
                }`}>
                  {game.realtime ? '⚔️ HOST BATTLE' : 
                   game.special ? '⚔️ PLAY EPIC GAME' : 
                   '🎮 Play Game'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Game Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⚔️ Battle Royale</div>
            <div className="text-gray-600">Host epic multiplayer math battles with up to 30 students competing to survive!</div>
          </div>
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
        </div>
        
        {/* Special tip for Battle Royale */}
        <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg border border-red-300">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h4 className="font-bold text-red-800 mb-1">Battle Royale Setup Tips</h4>
              <p className="text-red-700 text-sm">
                Create a 6-character game code that students enter at educational-elements.com/student. 
                Choose math category and difficulty, then watch the epic battles unfold! Perfect for review sessions and competitive learning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;