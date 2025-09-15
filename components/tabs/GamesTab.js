// components/tabs/GamesTab.js - FIXED BATTLE ROYALE TEACHER INTERFACE
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
import BattleRoyaleGame from '../games/BattleRoyaleGame';

const GamesTab = ({ 
  students, 
  showToast, 
  getAvatarImage, 
  getPetImage, 
  calculateCoins, 
  calculateAvatarLevel,
  onAwardXP,
  onAwardCoins,
  currentClassData,
  user
}) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('featured');

  const availableGames = [
    // Featured/New Games
    {
      id: 'battle-royale',
      name: 'Battle Royale Learning',
      icon: '⚔️',
      description: 'Epic multiplayer battle! Create a game code for students to join and answer math questions to survive.',
      component: BattleRoyaleGame,
      color: 'from-red-600 to-orange-600',
      difficulty: 'Easy - Hard',
      time: '10-20 minutes',
      multiplayer: true,
      featured: true,
      category: 'featured',
      teacherMode: true // CRITICAL: This marks it as a teacher game
    },
    {
      id: 'multiplayer-agar',
      name: 'Cell Battle Arena',
      icon: '🔴',
      description: 'Host a real-time battle arena where students control cells and compete to grow bigger.',
      component: MultiplayerAgarGame,
      color: 'from-red-500 to-pink-600',
      difficulty: 'Medium',
      time: '5-20 minutes',
      multiplayer: true,
      category: 'featured',
      teacherMode: true
    },
    {
      id: 'math-space-invaders',
      name: 'Math Space Invaders',
      icon: '🚀',
      description: 'Display this space shooter game where students solve math problems to defeat invaders.',
      component: MathSpaceInvadersGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '5-30 minutes',
      featured: true,
      category: 'featured'
    },
    
    // Multiplayer Games
    {
      id: 'battleships',
      name: 'Battleships Tournament',
      icon: '🚢',
      description: 'Host battleships tournaments for your class with bracketed matches.',
      component: BattleshipsGame,
      color: 'from-blue-600 to-cyan-600',
      difficulty: 'Medium',
      time: '10-20 minutes',
      multiplayer: true,
      category: 'multiplayer'
    },
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe Tournament',
      icon: '🎯',
      description: 'Organize class-wide tic tac toe tournaments with live displays.',
      component: TicTacToeGame,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Easy',
      time: '2-5 minutes',
      multiplayer: true,
      category: 'multiplayer'
    },

    // Educational Games  
    {
      id: 'math-race',
      name: 'Math Race Challenge',
      icon: '🧮',
      description: 'Display timed math challenges for the whole class to solve together.',
      component: MathRaceGame,
      color: 'from-green-500 to-green-600',
      difficulty: 'Easy - Hard',
      time: '2-5 minutes',
      category: 'educational'
    },
    {
      id: 'crossword',
      name: 'Classroom Crossword',
      icon: '🧩',
      description: 'Display crossword puzzles on the big screen for collaborative solving.',
      component: CrosswordGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '10-30 minutes',
      category: 'educational'
    },
    {
      id: 'word-search',
      name: 'Giant Word Search',
      icon: '🔍',
      description: 'Project word searches for the class to solve together.',
      component: WordSearchGame,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      category: 'educational'
    },
    {
      id: 'boggle',
      name: 'Class Boggle Challenge',
      icon: '🔤',
      description: 'Display boggle grids for students to find words collaboratively.',
      component: BoggleGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational'
    },
    {
      id: 'noggle',
      name: 'Number Noggle Challenge',
      icon: '🔢',
      description: 'Project number puzzles for mathematical problem-solving.',
      component: NoggleGame,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational'
    },

    // Brain Games
    {
      id: 'memory-match',
      name: 'Memory Challenge',
      icon: '🧠',
      description: 'Display memory games for class brain training sessions.',
      component: MemoryMatchGame,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '3-8 minutes',
      category: 'brain'
    },

    // Adventure Games
    {
      id: 'match3battle',
      name: 'Match-3 Adventure Display',
      icon: '⚔️',
      description: 'Show epic match-3 RPG gameplay on the big screen.',
      component: Match3BattleGame,
      color: 'from-red-500 to-purple-600',
      difficulty: 'Medium - Expert',
      time: '5-30 minutes',
      category: 'adventure'
    },
    {
      id: 'clicker',
      name: 'Hero Forge Display',
      icon: '⚡',
      description: 'Display incremental game progress for class engagement.',
      component: ClickerGame,
      color: 'from-yellow-500 to-orange-600',
      difficulty: 'Easy',
      time: 'Unlimited',
      category: 'adventure'
    }
  ];

  const categories = [
    { id: 'featured', name: 'Featured', icon: '⭐', description: 'Popular teacher games' },
    { id: 'multiplayer', name: 'Multiplayer', icon: '👥', description: 'Host competitions' },
    { id: 'educational', name: 'Educational', icon: '📚', description: 'Learning activities' },
    { id: 'adventure', name: 'Adventure', icon: '🏰', description: 'Epic displays' },
    { id: 'brain', name: 'Brain Training', icon: '🧠', description: 'Memory and logic' }
  ];

  const getGamesInCategory = (categoryId) => {
    return availableGames.filter(game => game.category === categoryId);
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    
    // CRITICAL FIX: Pass correct props based on game type
    const gameProps = {
      showToast,
      getAvatarImage,
      getPetImage,
      calculateCoins,
      calculateAvatarLevel,
      onAwardXP,
      onAwardCoins,
      currentClassData,
      classData: currentClassData,
      user
    };

    // For teacher games (like Battle Royale), pass teacher-specific props
    if (selectedGame.teacherMode) {
      gameProps.gameMode = 'teacher';
      gameProps.students = students; // Full students array
      gameProps.isTeacher = true;
    } else {
      // For display games, use presentation mode
      gameProps.gameMode = 'presentation';
      gameProps.students = students;
    }

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
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${selectedGame.color} flex items-center justify-center text-lg md:text-2xl flex-shrink-0`}>
                  {selectedGame.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                    {selectedGame.name}
                    {selectedGame.teacherMode && <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">TEACHER MODE</span>}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base hidden md:block">{selectedGame.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Component */}
        <div className="bg-white rounded-xl shadow-lg p-3 md:p-6">
          <GameComponent {...gameProps} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Teacher Game Center
          </h2>
          <p className="text-gray-600 text-sm md:text-base">Host interactive games and activities for your class!</p>
          {currentClassData?.classCode && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Class Ready: {currentClassData.classCode}
            </div>
          )}
          {!currentClassData?.classCode && (
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Generate a class code in Settings for multiplayer games
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

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {getGamesInCategory(selectedCategory).map((game) => (
          <div
            key={game.id}
            onClick={() => setSelectedGame(game)}
            className="group cursor-pointer rounded-xl p-4 md:p-6 border-2 border-transparent hover:shadow-lg transition-all duration-200 active:scale-95 relative bg-gradient-to-br from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 hover:border-blue-200"
          >
            {/* Teacher Mode Badge */}
            {game.teacherMode && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                👨‍🏫 HOST
              </div>
            )}
            
            {/* Featured Badge */}
            {game.featured && !game.teacherMode && (
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
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">👥 Multiplayer</span>
                  )}
                  {game.teacherMode && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">👨‍🏫 Host Mode</span>
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
                {game.teacherMode ? '🎯 Host Game' : '📺 Display Game'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Teacher Game Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⚔️ Battle Royale</div>
            <div className="text-gray-600">Create a game code, students join via student portal, and watch the battle unfold!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">👨‍🏫 Host Mode Games</div>
            <div className="text-gray-600">These games create codes for students to join from their devices.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">📺 Display Games</div>
            <div className="text-gray-600">Perfect for projecting on the big screen for whole-class activities.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-green-700 mb-1">🎯 Pro Tip</div>
            <div className="text-gray-600">Make sure you have a class code set up in Settings for multiplayer games!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;