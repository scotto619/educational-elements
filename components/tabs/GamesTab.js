// components/tabs/GamesTab.js - Updated to pass required props
import React, { useState } from 'react';

// Import all individual game components
import BoggleGame from '../games/BoggleGame';
import MathRaceGame from '../games/MathRaceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import NoggleGame from '../games/NoggleGame';
import WordSearchGame from '../games/WordSearchGame';
import CrosswordGame from '../games/CrosswordGame';
import Match3BattleGame from '../games/Match3BattleGame';
import BattleRoyaleGame from '../games/BattleRoyaleGame'; // NEW BATTLE ROYALE!

// ===============================================
// GAME DEFINITIONS (same as before)
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
  // ... rest of games remain the same
];

// ===============================================
// MAIN GAMES TAB COMPONENT - UPDATED PROPS
// ===============================================
const GamesTab = ({ 
  students = [], 
  showToast = () => {},
  onAwardXP = null,          // NEW: XP awarding function
  onAwardCoins = null,       // NEW: Coin awarding function  
  currentClassData = null,   // NEW: Class data with class code
  user = null                // NEW: User data
}) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState('digital');

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

        {/* Game Component - UPDATED WITH ALL REQUIRED PROPS */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <GameComponent 
            gameMode={selectedGame.id === 'match3battle' || selectedGame.id === 'battle-royale' ? 'digital' : gameMode}
            showToast={showToast}
            students={students}
            studentData={students.length > 0 ? students[0] : null}
            updateStudentData={null}
            
            // NEW: Additional props for Battle Royale and other advanced games
            onAwardXP={onAwardXP}
            onAwardCoins={onAwardCoins}
            classData={currentClassData}
            user={user}
          />
        </div>
      </div>
    );
  }

  // Rest of the component remains exactly the same...
  // Game Selection Menu, Featured Game Spotlight, etc.
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
            {/* Show class code status */}
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
            
            {/* Show class code requirement */}
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

      {/* Rest of the game selection interface remains the same... */}
      {/* Game Mode Selection, Available Games grid, Tips, etc. */}
      
    </div>
  );
};

export default GamesTab;