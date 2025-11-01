// components/tabs/GamesTab.js - WITH MAZE GAME
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
import BingoGame from '../games/BingoGame';
import MazeGame from '../games/MazeGame';
import DailyWordleChallenge from '../games/DailyWordleChallenge';
import AmazingTypingAdventure from '../games/AmazingTypingAdventure';

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
  const [selectedCategory, setSelectedCategory] = useState('daily');

  const availableGames = [
    {
      id: 'daily-word-challenge',
      name: 'Daily Word Challenge',
      icon: '🗓️',
      description: 'A Wordle-style puzzle that unlocks a new word every day. Perfect as a quick warm-up or class challenge!',
      component: DailyWordleChallenge,
      color: 'from-purple-500 to-indigo-600',
      difficulty: 'All Levels',
      time: '5 minutes',
      category: 'daily',
      featured: true,
      storageKeySuffix: 'teacher',
      logo: '/logos/game-logos/daily-word-challenge.svg'
    },
    {
      id: 'amazing-typing-adventure',
      name: 'Typing Legends Academy',
      icon: '⌨️',
      description: 'Launch cinematic typing missions with live accuracy, combo streaks, and storytelling power-ups.',
      component: AmazingTypingAdventure,
      color: 'from-indigo-600 to-fuchsia-500',
      difficulty: 'All Levels',
      time: '5-10 minutes',
      category: 'educational',
      featured: true,
      storageKeySuffix: 'teacher-typing',
      logo: '/logos/game-logos/typing-legends.svg'
    },
    // Featured/New Games
    {
      id: 'maze',
      name: 'Maze Runner',
      icon: '🧩',
      description: 'Navigate through randomly generated mazes! Share seeds with students to race on the same maze.',
      component: MazeGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      category: 'featured',
      logo: '/logos/game-logos/maze-runner.svg'
    },
    {
      id: 'bingo',
      name: 'Educational BINGO',
      icon: '🎲',
      description: 'Classic BINGO with educational content! Choose from times tables, vocabulary, science, history, or geography.',
      component: BingoGame,
      color: 'from-pink-500 to-purple-600',
      difficulty: 'Easy - Medium',
      time: '15-30 minutes',
      multiplayer: true,
      featured: true,
      category: 'featured',
      teacherMode: true,
      logo: '/logos/game-logos/educational-bingo.svg'
    },
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
      teacherMode: true,
      logo: '/logos/game-logos/battle-royale.svg'
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
      teacherMode: true,
      logo: '/logos/game-logos/cell-battle.svg'
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
      category: 'featured',
      logo: '/logos/game-logos/math-space-invaders.svg'
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
      category: 'multiplayer',
      logo: '/logos/game-logos/battleships.svg'
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
      category: 'multiplayer',
      logo: '/logos/game-logos/tic-tac-toe.svg'
    },

    // Educational Games  
    {
      id: 'bingo-edu',
      name: 'Classroom BINGO',
      icon: '🎲',
      description: 'Call out questions and students mark their BINGO cards. Perfect for review sessions!',
      component: BingoGame,
      color: 'from-pink-500 to-purple-600',
      difficulty: 'Easy - Medium',
      time: '15-30 minutes',
      multiplayer: true,
      category: 'educational',
      teacherMode: true,
      logo: '/logos/game-logos/classroom-bingo.svg'
    },
    {
      id: 'math-race',
      name: 'Math Race Challenge',
      icon: '🧮',
      description: 'Display timed math challenges for the whole class to solve together.',
      component: MathRaceGame,
      color: 'from-green-500 to-green-600',
      difficulty: 'Easy - Hard',
      time: '2-5 minutes',
      category: 'educational',
      logo: '/logos/game-logos/math-race.svg'
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
      category: 'educational',
      logo: '/logos/game-logos/crossword.svg'
    },
    {
      id: 'word-search',
      name: 'Giant Word Search',
      icon: '📝',
      description: 'Project word searches for the class to solve together.',
      component: WordSearchGame,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      category: 'educational',
      logo: '/logos/game-logos/word-search.svg'
    },
    {
      id: 'boggle',
      name: 'Class Boggle Challenge',
      icon: '📤',
      description: 'Display boggle grids for students to find words collaboratively.',
      component: BoggleGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational',
      logo: '/logos/game-logos/boggle.svg'
    },
    {
      id: 'noggle',
      name: 'Number Noggle Challenge',
      icon: '📢',
      description: 'Project number puzzles for mathematical problem-solving.',
      component: NoggleGame,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes',
      category: 'educational',
      logo: '/logos/game-logos/noggle.svg'
    },

    // Brain Games
    {
      id: 'maze-brain',
      name: 'Maze Challenge',
      icon: '🧩',
      description: 'Challenge students with procedurally generated mazes. Perfect for spatial reasoning and problem-solving!',
      component: MazeGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      category: 'brain',
      logo: '/logos/game-logos/maze-runner.svg'
    },
    {
      id: 'memory-match',
      name: 'Memory Challenge',
      icon: '🧠',
      description: 'Display memory games for class brain training sessions.',
      component: MemoryMatchGame,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '3-8 minutes',
      category: 'brain',
      logo: '/logos/game-logos/memory-challenge.svg'
    },

    // Adventure Games
    {
      id: 'match3battle',
      name: 'Match-3 Adventure Display',
      icon: '⚔️',
      description: 'Project epic RPG match-3 battles for students to watch and strategize together.',
      component: Match3BattleGame,
      color: 'from-red-500 to-purple-600',
      difficulty: 'Medium - Expert',
      time: '5-30 minutes',
      category: 'adventure',
      logo: '/logos/game-logos/match3-adventure.svg'
    },
    {
      id: 'clicker',
      name: 'Hero Forge Display',
      icon: '⚡',
      description: 'Display an idle clicker game where students can watch progress build over time.',
      component: ClickerGame,
      color: 'from-yellow-500 to-orange-600',
      difficulty: 'Easy',
      time: 'Unlimited',
      category: 'adventure',
      logo: '/logos/game-logos/hero-forge.svg'
    }
  ];

  const categories = [
    { id: 'daily', name: 'Daily Challenges', icon: '📅' },
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

    if (selectedGame.storageKeySuffix) {
      gameProps.storageKeySuffix = selectedGame.storageKeySuffix;
    }

    if (selectedGame.teacherMode) {
      gameProps.gameMode = 'teacher';
      gameProps.students = students;
      gameProps.isTeacher = true;
    } else {
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

      {/* Games Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {getGamesInCategory(selectedCategory).map((game) => (
          <div
            key={game.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedGame(game)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedGame(game);
              }
            }}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative md:w-56 lg:w-60 h-44 md:h-auto overflow-hidden">
                <img
                  src={game.logo || '/Logo/placeholder-game.svg'}
                  alt={`${game.name} logo`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.fallback) {
                      e.currentTarget.dataset.fallback = 'true';
                      e.currentTarget.src = '/Logo/placeholder-game.svg';
                    }
                  }}
                />
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 text-gray-800">
                  <span className="text-lg">{game.icon}</span>
                  <span>{game.category === 'daily' ? 'Daily' : 'Play'}</span>
                </div>
                {game.featured && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ⭐ Featured
                  </div>
                )}
                {game.teacherMode && (
                  <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    👨‍🏫 Host Mode
                  </div>
                )}
              </div>
              <div className="flex-1 p-4 md:p-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1 min-w-0">
                    <span className="truncate block group-hover:text-blue-600 transition-colors">{game.name}</span>
                  </h3>
                  {game.new && (
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">NEW</span>
                  )}
                  {game.daily && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">Daily</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {game.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-600">
                  {game.multiplayer && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Multiplayer</span>}
                  {game.educational && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Curriculum Friendly</span>}
                  {game.featured && <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full">Staff Pick</span>}
                </div>

                <div className="flex justify-between text-xs md:text-sm text-gray-500">
                  <span>⚡ Difficulty: <strong className="text-gray-700">{game.difficulty}</strong></span>
                  <span>⏱️ Time: <strong className="text-gray-700">{game.time}</strong></span>
                </div>

                <div className="pt-2 md:pt-4">
                  <div className={`inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded-full bg-gradient-to-r ${game.color} text-white font-semibold text-sm md:text-base shadow-sm group-hover:shadow-lg transition-all`}>
                    {game.teacherMode ? '🎯 Launch for Class' : '🎮 Start Experience'}
                  </div>
                </div>
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
            <div className="font-semibold text-indigo-700 mb-1">🧩 Maze Runner</div>
            <div className="text-gray-600">Generate mazes and share the seed number with students - they can race to solve the same maze!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-pink-700 mb-1">🎲 Educational BINGO</div>
            <div className="text-gray-600">Call out questions in 5 categories - students mark their cards to win!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⚔️ Battle Royale</div>
            <div className="text-gray-600">Create a game code, students join via student portal, and watch the battle unfold!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">👨‍🏫 Host Mode Games</div>
            <div className="text-gray-600">These games create codes for students to join from their devices.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;