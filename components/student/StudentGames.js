// components/student/StudentGames.js - WITH MAZE GAME
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
import StudentBattleRoyale from '../student/StudentBattleRoyale';
import EducationalMemoryGame from '../games/EducationalMemoryGame';
import StudentBingo from '../student/StudentBingo';
import MazeGame from '../games/MazeGame';

const StudentGames = ({ studentData, showToast, updateStudentData, classData }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('featured');

  const availableGames = [
    // Featured/New Games
    {
      id: 'maze',
      name: 'Maze Runner',
      icon: '🧩',
      description: 'Race through randomly generated mazes! Get a seed from your teacher to compete with friends on the same maze.',
      component: MazeGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      category: 'featured'
    },
    {
      id: 'bingo',
      name: 'Educational BINGO',
      icon: '🎲',
      description: 'Play BINGO with your class! Choose the same category as your teacher and mark off squares to win.',
      component: StudentBingo,
      color: 'from-pink-500 to-purple-600',
      difficulty: 'Easy',
      time: '15-30 minutes',
      multiplayer: true,
      featured: true,
      new: true,
      category: 'featured',
      educational: true,
      requiresTeacher: true
    },
    {
      id: 'educational-memory',
      name: 'Memory Masters',
      icon: '🧩',
      description: 'Match educational content! Play solo or challenge up to 3 friends with custom themes like math, reading, and more.',
      component: EducationalMemoryGame,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Easy - Hard',
      time: '5-15 minutes',
      multiplayer: true,
      featured: true,
      category: 'featured',
      educational: true
    },
    {
      id: 'battle-royale',
      name: 'Battle Royale Learning',
      icon: '⚔️',
      description: 'Epic multiplayer battle! Answer math questions to survive and be the last champion standing.',
      component: StudentBattleRoyale,
      color: 'from-red-600 to-orange-600',
      difficulty: 'Easy - Hard',
      time: '10-20 minutes',
      multiplayer: true,
      featured: true,
      category: 'featured',
      requiresClassCode: true
    },
    {
      id: 'math-space-invaders',
      name: 'Math Space Invaders',
      icon: '🚀',
      description: 'Fly through space solving math problems and unlock new ships!',
      component: MathSpaceInvadersGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '5-30 minutes',
      featured: true,
      category: 'featured'
    },
    
    // Multiplayer Games
    {
      id: 'multiplayer-agar',
      name: 'Cell Battle Arena',
      icon: '🔴',
      description: 'Battle classmates in real-time! Eat food and smaller players to grow bigger.',
      component: MultiplayerAgarGame,
      color: 'from-red-500 to-pink-600',
      difficulty: 'Medium',
      time: '5-20 minutes',
      multiplayer: true,
      category: 'multiplayer',
      requiresClassCode: true
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
      category: 'multiplayer'
    },
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      icon: '🎯',
      description: 'Challenge a friend to this classic strategy game!',
      component: TicTacToeGame,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Easy',
      time: '2-5 minutes',
      multiplayer: true,
      category: 'multiplayer'
    },

    // Adventure Games  
    {
      id: 'match3battle',
      name: 'Match-3 Battle Arena',
      icon: '⚔️',
      description: 'Epic fantasy RPG adventure with strategic match-3 combat!',
      component: Match3BattleGame,
      color: 'from-red-500 to-purple-600',
      difficulty: 'Medium - Expert',
      time: '5-30 minutes',
      category: 'adventure'
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
      category: 'adventure'
    },

    // Educational Games
    {
      id: 'bingo-edu',
      name: 'Classroom BINGO',
      icon: '🎲',
      description: 'Join your class BINGO game! Listen for questions and mark your card.',
      component: StudentBingo,
      color: 'from-pink-500 to-purple-600',
      difficulty: 'Easy',
      time: '15-30 minutes',
      category: 'educational',
      educational: true,
      requiresTeacher: true
    },
    {
      id: 'math-race',
      name: 'Math Race',
      icon: '🧮',
      description: 'Solve math problems as fast as you can!',
      component: MathRaceGame,
      color: 'from-green-500 to-green-600',
      difficulty: 'Easy - Hard',
      time: '2-5 minutes',
      category: 'educational'
    },
    {
      id: 'crossword',
      name: 'Crossword Puzzle',
      icon: '🧩',
      description: 'Solve crossword puzzles and expand your vocabulary.',
      component: CrosswordGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '10-30 minutes',
      category: 'educational'
    },
    {
      id: 'word-search',
      name: 'Word Search',
      icon: '📝',
      description: 'Find hidden words in the letter grid.',
      component: WordSearchGame,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      category: 'educational'
    },
    {
      id: 'boggle',
      name: 'Boggle Challenge',
      icon: '📤',
      description: 'Find as many words as you can in the letter grid.',
      component: BoggleGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational'
    },
    {
      id: 'noggle',
      name: 'Number Noggle',
      icon: '📢',
      description: 'Solve mathematical puzzles and equations!',
      component: NoggleGame,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational'
    },

    // Brain Games
    {
      id: 'maze-brain',
      name: 'Maze Challenge',
      icon: '🧩',
      description: 'Navigate through randomly generated mazes! Share seeds to race with friends on the same maze.',
      component: MazeGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      category: 'brain'
    },
    {
      id: 'memory-match',
      name: 'Memory Game',
      icon: '🧠',
      description: 'Test your memory by matching pairs of cards.',
      component: MemoryMatchGame,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '3-8 minutes',
      category: 'brain'
    }
  ];

  const categories = [
    { id: 'featured', name: '⭐ Featured', icon: '⭐' },
    { id: 'multiplayer', name: 'Multiplayer', icon: '🎮' },
    { id: 'educational', name: 'Educational', icon: '📚' },
    { id: 'brain', name: 'Brain Games', icon: '🧠' },
    { id: 'adventure', name: 'Adventure', icon: '⚔️' }
  ];

  const getGamesInCategory = (categoryId) => {
    if (categoryId === 'featured') {
      return availableGames.filter(g => g.featured);
    }
    return availableGames.filter(g => g.category === categoryId);
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;

    return (
      <div className="space-y-4 md:space-y-6">
        {/* Game Header */}
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
                  selectedGame.new ? 'ring-4 ring-yellow-400 ring-opacity-60' : ''
                } ${selectedGame.multiplayer && selectedGame.requiresClassCode ? 'ring-4 ring-red-400 ring-opacity-60' : ''}`}>
                  {selectedGame.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate flex items-center">
                    {selectedGame.name}
                    {selectedGame.new && <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">NEW!</span>}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base hidden md:block">{selectedGame.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Component */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-6">
          <GameComponent 
            gameMode="digital"
            showToast={showToast}
            students={[studentData]}
            studentData={studentData}
            updateStudentData={updateStudentData}
            classData={classData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Clean Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Game Center
          </h2>
          <p className="text-gray-600 text-sm md:text-base">Choose your adventure and have fun learning!</p>
          {classData?.classCode && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Multiplayer Ready: {classData.classCode}
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex overflow-x-auto gap-2">
          {categories.map((category) => {
            const gamesCount = getGamesInCategory(category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-w-[80px] ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl mb-1">{category.icon}</span>
                <span className="text-xs font-semibold text-center">{category.name}</span>
                <span className="text-xs opacity-75">{gamesCount} games</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* No class code warning for multiplayer */}
      {selectedCategory === 'multiplayer' && !classData?.classCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Multiplayer Games Unavailable</h3>
          <p className="text-orange-700 text-sm">
            Ask your teacher to set up a class code to unlock multiplayer games!
          </p>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {getGamesInCategory(selectedCategory)
          .filter(game => selectedCategory !== 'multiplayer' || classData?.classCode || !game.requiresClassCode)
          .map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="group cursor-pointer rounded-xl p-4 md:p-6 border-2 border-transparent hover:shadow-lg transition-all duration-200 active:scale-95 relative bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 hover:border-blue-200"
          >
            {/* New Badge */}
            {game.new && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-bounce">
                NEW!
              </div>
            )}
            
            {/* Featured Badge */}
            {game.featured && !game.new && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                ⭐ HOT
              </div>
            )}
            
            <div className="flex items-center space-x-3 mb-3 md:mb-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform flex-shrink-0`}>
                {game.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {game.name}
                </h4>
                <div className="flex items-center space-x-2 text-xs">
                  {game.multiplayer && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      🔥 Multiplayer
                    </span>
                  )}
                  {game.educational && (
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      📚 Educational
                    </span>
                  )}
                  {game.requiresTeacher && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      👨‍🏫 Class Game
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-3 md:mb-4">
              {game.description}
            </p>

            <div className="space-y-1 text-xs text-gray-500 mb-3 md:mb-4">
              <div className="flex justify-between">
                <span>⚡ Difficulty:</span>
                <span className="font-medium">{game.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span>⏱️ Time:</span>
                <span className="font-medium">{game.time}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className={`w-full py-2 md:py-3 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all text-sm md:text-base`}>
                {game.requiresTeacher ? '🔥 Join Game' :
                 game.multiplayer && game.requiresClassCode ? '🧬 Join Battle' :
                 game.multiplayer ? '🔥 Play vs Friend' : 
                 '🎮 Play Game'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Gaming Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-indigo-700 mb-1">🧩 Maze Runner</div>
            <div className="text-gray-600">Enter a seed from your teacher to race them on the same maze! Or generate your own and challenge friends.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-pink-700 mb-1">🎲 Educational BINGO</div>
            <div className="text-gray-600">Select the same category as your teacher to get your BINGO card! Listen carefully and mark your squares to win.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">🧩 Memory Masters</div>
            <div className="text-gray-600">Educational memory matching! Choose themes like math, reading, or create custom pairs. Play solo or with friends!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">🚀 Adventure Games</div>
            <div className="text-gray-600">Your progress saves automatically - come back anytime to continue!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGames;