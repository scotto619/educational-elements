// components/student/StudentGames.js - UPDATED WITH BATTLE ROYALE LEARNING GAME
import React, { useState } from 'react';

// Import existing game components
import BoggleGame from '../games/BoggleGame';
import MathRaceGame from '../games/MathRaceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import NoggleGame from '../games/NoggleGame';
import WordSearchGame from '../games/WordSearchGame';
import CrosswordGame from '../games/CrosswordGame';
import TicTacToeGame from '../games/TicTacToeGame';
import BattleshipsGame from '../games/BattleshipsGame';
import ClickerGame from '../games/ClickerGame';
import Match3BattleGame from '../games/Match3BattleGame';
import MathSpaceInvadersGame from '../games/MathSpaceInvadersGame';
import MultiplayerAgarGame from '../games/MultiplayerAgarGame';
import StudentBattleRoyale from '../student/StudentBattleRoyale'; // NEW BATTLE ROYALE!

const StudentGames = ({ studentData, showToast, updateStudentData, classData }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const availableGames = [
    {
      id: 'battle-royale',
      name: 'Battle Royale Learning',
      icon: '⚔️',
      description: 'Epic multiplayer battle! Be the last survivor by answering math questions correctly. First correct answer protects you and attacks others!',
      component: StudentBattleRoyale,
      color: 'from-red-600 to-orange-600',
      difficulty: 'Easy - Hard',
      time: '10-20 minutes',
      multiplayer: true,
      realtime: true,
      featured: true,
      category: 'multiplayer',
      requiresClassCode: true
    },
    {
      id: 'math-space-invaders',
      name: 'Math Space Invaders',
      icon: '🚀',
      description: 'Fly through space solving math problems! Unlock ships as you level up!',
      component: MathSpaceInvadersGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '5-30 minutes',
      multiplayer: false,
      special: true,
      featured: false,
      category: 'arcade',
      collectibles: true,
      progressSaves: true
    },
    {
      id: 'multiplayer-agar',
      name: 'Cell Battle Arena',
      icon: '🔴',
      description: 'Battle your classmates in real-time! Eat food and smaller players to grow bigger!',
      component: MultiplayerAgarGame,
      color: 'from-red-500 to-pink-600',
      difficulty: 'Medium',
      time: '5-20 minutes',
      multiplayer: true,
      realtime: true,
      featured: false,
      category: 'multiplayer',
      requiresClassCode: true
    },
    {
      id: 'match3battle',
      name: 'Match-3 Battle Arena',
      icon: '⚔️',
      description: 'Epic fantasy RPG adventure! Battle enemies with strategic match-3 combat!',
      component: Match3BattleGame,
      color: 'from-red-500 to-purple-600',
      difficulty: 'Medium - Expert',
      time: '5-30 minutes',
      multiplayer: false,
      special: true,
      featured: false,
      category: 'rpg'
    },
    {
      id: 'clicker',
      name: 'Hero Forge',
      icon: '⚡',
      description: 'Build your fantasy empire in this epic incremental adventure!',
      component: ClickerGame,
      color: 'from-yellow-500 to-orange-600',
      difficulty: 'Easy',
      time: 'Unlimited',
      multiplayer: false,
      special: true,
      category: 'idle'
    },
    {
      id: 'battleships',
      name: 'Battleships',
      icon: '🚢',
      description: 'Sink your opponent\'s fleet in this classic naval battle!',
      component: BattleshipsGame,
      color: 'from-blue-600 to-cyan-600',
      difficulty: 'Medium',
      time: '10-20 minutes',
      multiplayer: true,
      category: 'strategy'
    },
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      icon: '🎯',
      description: 'Challenge a friend to a classic strategy game!',
      component: TicTacToeGame,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Easy',
      time: '2-5 minutes',
      multiplayer: true,
      category: 'strategy'
    },
    {
      id: 'crossword',
      name: 'Crossword Puzzle',
      icon: '🧩',
      description: 'Solve crossword puzzles and expand your vocabulary',
      component: CrosswordGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '10-30 minutes',
      category: 'word'
    },
    {
      id: 'word-search',
      name: 'Word Search',
      icon: '🔍',
      description: 'Find hidden words in the letter grid',
      component: WordSearchGame,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      category: 'word'
    },
    {
      id: 'math-race',
      name: 'Math Race',
      icon: '🧮',
      description: 'Solve math problems as fast as you can',
      component: MathRaceGame,
      color: 'from-green-500 to-green-600',
      difficulty: 'Easy - Hard',
      time: '2-5 minutes',
      category: 'math'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Test your memory with card matching',
      component: MemoryMatchGame,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '3-8 minutes',
      category: 'memory'
    },
    {
      id: 'boggle',
      name: 'Word Boggle',
      icon: '🔤',
      description: 'Create words by connecting letters',
      component: BoggleGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'word'
    },
    {
      id: 'noggle',
      name: 'Number Noggle',
      icon: '🔢',
      description: 'Connect numbers to create target sums',
      component: NoggleGame,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'math'
    }
  ];

  // Group games by category for better organization
  const gamesByCategory = {
    multiplayer: availableGames.filter(g => g.category === 'multiplayer'),
    arcade: availableGames.filter(g => g.category === 'arcade'),
    rpg: availableGames.filter(g => g.category === 'rpg'),
    idle: availableGames.filter(g => g.category === 'idle'),
    strategy: availableGames.filter(g => g.category === 'strategy'),
    word: availableGames.filter(g => g.category === 'word'),
    math: availableGames.filter(g => g.category === 'math'),
    memory: availableGames.filter(g => g.category === 'memory')
  };

  const categoryInfo = {
    multiplayer: { name: 'Multiplayer Arena', icon: '👥', description: 'Battle your classmates in real-time' },
    arcade: { name: 'Arcade Adventures', icon: '🚀', description: 'Action-packed educational games' },
    rpg: { name: 'RPG Adventures', icon: '⚔️', description: 'Epic fantasy role-playing games' },
    idle: { name: 'Idle Games', icon: '🗝️', description: 'Build and grow your empire' },
    strategy: { name: 'Strategy Games', icon: '🎯', description: 'Test your tactical skills' },
    word: { name: 'Word Games', icon: '🔍', description: 'Expand your vocabulary' },
    math: { name: 'Math Games', icon: '🔢', description: 'Sharpen your number skills' },
    memory: { name: 'Memory Games', icon: '🧠', description: 'Train your brain power' }
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setSelectedGame(null)}
                className="bg-gray-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-600 text-sm md:text-base flex-shrink-0"
              >
                ← Back
              </button>
              <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${selectedGame.color} flex items-center justify-center text-lg md:text-2xl flex-shrink-0 ${
                  selectedGame.special ? 'ring-4 ring-yellow-400 ring-opacity-60 animate-pulse' : ''
                } ${selectedGame.realtime ? 'ring-4 ring-red-400 ring-opacity-60 animate-pulse' : ''}`}>
                  {selectedGame.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate flex items-center">
                    {selectedGame.name}
                    {selectedGame.featured && <span className="ml-1 text-yellow-500">⭐</span>}
                    {selectedGame.realtime && <span className="ml-1 text-red-500">🔴</span>}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base hidden md:block">{selectedGame.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 md:p-6">
          <GameComponent 
            gameMode="digital"
            showToast={showToast}
            students={[studentData]}
            studentData={studentData}
            updateStudentData={updateStudentData}
            classData={classData} // Pass classData for multiplayer games
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Play Games
          </h2>
          <p className="text-gray-600 text-sm md:text-base">Choose a game to play and have fun learning!</p>
          {classData?.classCode && (
            <div className="mt-2 text-sm text-green-600 font-semibold">
              🌟 Multiplayer games available with class code: {classData.classCode}
            </div>
          )}
        </div>
      </div>

      {/* Featured NEW Battle Royale Game */}
      {availableGames.find(g => g.featured) && classData?.classCode && (
        <div className="bg-gradient-to-r from-red-900 via-orange-900 to-yellow-900 rounded-xl shadow-lg p-6 md:p-8 text-white">
          <div className="text-center">
            <div className="text-4xl md:text-6xl mb-4 relative">
              ⚔️
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              🌟 NEW: Battle Royale Learning! 🌟
            </h3>
            <p className="text-sm md:text-xl mb-4 text-orange-100">
              Epic multiplayer learning battle! Be the last survivor by answering math questions correctly. First correct answer protects you and attacks another player!
            </p>
            <div className="grid grid-cols-2 md:flex md:justify-center md:items-center md:space-x-8 gap-2 text-xs md:text-sm mb-6">
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <span>⚔️</span>
                <span>Battle System</span>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <span>🔴</span>
                <span>Real-time</span>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <span>🧮</span>
                <span>Math Learning</span>
              </div>
              <div className="flex items-center justify-center space-x-1 md:space-x-2">
                <span>🏆</span>
                <span>Last Survivor Wins</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedGame(availableGames.find(g => g.featured))}
              className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              ⚔️ JOIN EPIC BATTLE!
            </button>
          </div>
        </div>
      )}

      {/* Math Space Invaders Featured Game */}
      <div className="bg-gradient-to-r from-cyan-900 via-blue-900 to-purple-900 rounded-xl shadow-lg p-6 md:p-8 text-white">
        <div className="text-center">
          <div className="text-4xl md:text-6xl mb-4 relative">
            🚀
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🌟 NEW: Math Space Invaders! 🌟
          </h3>
          <p className="text-sm md:text-xl mb-4 text-blue-100">
            Fly through space solving math problems! Unlock new ships as you progress through levels!
          </p>
          <div className="grid grid-cols-2 md:flex md:justify-center md:items-center md:space-x-8 gap-2 text-xs md:text-sm mb-6">
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span>🚀</span>
              <span>Space Adventure</span>
            </div>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span>🧮</span>
              <span>Math Practice</span>
            </div>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span>🎮</span>
              <span>Arcade Action</span>
            </div>
            <div className="flex items-center justify-center space-x-1 md:space-x-2">
              <span>🏆</span>
              <span>Ship Collection</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedGame(availableGames.find(g => g.id === 'math-space-invaders'))}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            🚀 LAUNCH INTO SPACE!
          </button>
        </div>
      </div>

      {/* No class code warning for multiplayer games */}
      {!classData?.classCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Multiplayer Games Unavailable</h3>
          <p className="text-orange-700 text-sm">
            Ask your teacher to set up a class code to unlock multiplayer games including Battle Royale Learning!
          </p>
        </div>
      )}

      {/* Games by Category */}
      <div className="space-y-6">
        {Object.entries(gamesByCategory).map(([categoryKey, games]) => {
          if (games.length === 0) return null;
          
          // Skip multiplayer category if no class code
          if (categoryKey === 'multiplayer' && !classData?.classCode) return null;
          
          const category = categoryInfo[categoryKey];
          
          return (
            <div key={categoryKey} className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                {categoryKey === 'multiplayer' && (
                  <div className="ml-auto">
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                      🔴 LIVE
                    </span>
                  </div>
                )}
                {categoryKey === 'arcade' && (
                  <div className="ml-auto">
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-semibold px-2 py-1 rounded-full">
                      🚀 NEW
                    </span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game)}
                    className={`group cursor-pointer rounded-xl p-4 md:p-6 border-2 border-transparent hover:shadow-lg transition-all duration-200 active:scale-95 relative ${
                      game.special 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-orange-300 ring-2 ring-yellow-400 ring-opacity-50' 
                        : game.realtime
                        ? 'bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-300 ring-2 ring-red-400 ring-opacity-50'
                        : 'bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {game.special && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-bounce">
                        NEW!
                      </div>
                    )}
                    
                    {game.realtime && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        <span className="animate-pulse">🔴</span> LIVE
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-3 md:mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform flex-shrink-0 ${game.special || game.realtime ? 'animate-pulse' : ''}`}>
                        {game.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate flex items-center">
                          {game.name}
                          {game.featured && <span className="ml-2 text-yellow-600">⭐</span>}
                          {game.realtime && <span className="ml-2 text-red-600">🔴</span>}
                        </h4>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-3 md:mb-4">
                      {game.description}
                    </p>

                    <div className="space-y-1 md:space-y-2 text-xs text-gray-500 mb-3 md:mb-4">
                      <div className="flex justify-between">
                        <span>⚡ Difficulty:</span>
                        <span className="font-medium">{game.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⏱️ Duration:</span>
                        <span className="font-medium">{game.time}</span>
                      </div>
                      {game.multiplayer && (
                        <div className="flex justify-between">
                          <span>👥 Mode:</span>
                          <span className="font-medium text-purple-600">
                            {game.realtime ? 'Live Multiplayer' : 'Multiplayer'}
                          </span>
                        </div>
                      )}
                      {game.special && (
                        <div className="flex justify-between">
                          <span>💾 Saves:</span>
                          <span className="font-medium text-green-600">Progress Saved</span>
                        </div>
                      )}
                      {game.collectibles && (
                        <div className="flex justify-between">
                          <span>🚀 Ships:</span>
                          <span className="font-medium text-cyan-600">Collectible</span>
                        </div>
                      )}
                      {game.realtime && (
                        <div className="flex justify-between">
                          <span>🔴 Status:</span>
                          <span className="font-medium text-red-600">Real-time</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 md:pt-4 border-t border-gray-200">
                      <div className={`w-full py-2 md:py-3 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all text-sm md:text-base`}>
                        {game.realtime ? '🔴 Join Live Game' :
                         game.id === 'math-space-invaders' ? '🚀 Launch Game' :
                         game.special && game.category === 'rpg' ? '⚔️ Start Quest' : 
                         game.special && game.category === 'idle' ? '🗝️ Build Empire' : 
                         game.multiplayer ? '👥 Play vs Friend' : '🎮 Play Game'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gaming Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">🎮 Gaming Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⚔️ Battle Royale Learning</div>
            <div className="text-gray-600">Answer math questions correctly to stay alive! First correct answer protects you and attacks another player.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-cyan-700 mb-1">🚀 Math Space Invaders</div>
            <div className="text-gray-600">Use arrow keys or WASD to move. Fly into correct answers to progress. Unlock new ships by reaching higher levels!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">🔴 Multiplayer Games</div>
            <div className="text-gray-600">Battle your classmates in real-time! Your class code connects you to the same game room.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">⚔️ RPG Games</div>
            <div className="text-gray-600">Your progress automatically saves! Come back anytime to continue your adventure.</div>
          </div>
        </div>
        
        {/* Special Battle Royale tip */}
        <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg border border-red-300">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h4 className="font-bold text-red-800 mb-1">Battle Royale Pro Tips</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Everyone starts with 10 lives ❤️</li>
                <li>• First correct answer saves you and attacks another player</li>
                <li>• Wrong answers or timeouts cost 1 life</li>
                <li>• Get 3 correct answers in a row for double damage (2 lives) 🔥</li>
                <li>• Be the last survivor to win the crown! 👑</li>
                <li>• Quick thinking is key - speed matters for attacks!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGames;