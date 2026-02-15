// components/tabs/GamesTab.js - UPDATED: Added Multiplication Grid and Precision Timer
import React, { useState } from 'react';
import { getGameLogo, DEFAULT_LOGO as DEFAULT_GAME_LOGO } from '../../utils/gameLogos';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';

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
import MultiplicationGridGame from '../games/MultiplicationGridGame';
import CoordinateQuestGame from '../games/CoordinateQuestGame';
import PrecisionTimerGame from '../games/PrecisionTimerGame';
import DodgeballGame from '../games/DodgeballGame';
import ZTypeGame from '../games/ZTypeGame';

const logoErrorHandler = createImageErrorHandler(DEFAULT_GAME_LOGO);

const resolveLogoSource = (logo) => normalizeImageSource(logo, DEFAULT_GAME_LOGO);

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
  user,
  saveClassData
}) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Mock student data for teacher preview (no saving)
  const mockTeacherData = {
    firstName: 'Teacher',
    lastName: 'Preview',
    totalPoints: 0,
    gameProgress: {}
  };

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
      logo: getGameLogo('daily-word-challenge')
    },
    {
      id: 'type-defender',
      name: 'Type Defender',
      icon: '🚀',
      description: 'Display a space shooter typing game where students destroy enemies by typing words.',
      component: ZTypeGame,
      color: 'from-cyan-500 to-indigo-600',
      difficulty: 'Easy - Expert',
      time: '5-15 minutes',
      category: 'educational',
      featured: true,
      new: true,
      logo: getGameLogo('type-defender')
    },
    // Featured/New Games
    {
      id: 'multiplication-grid',
      name: 'Math Facts Grid',
      icon: '🔢',
      description: 'Complete multiplication, addition, or subtraction grids as fast as possible! Students can compete for best times.',
      component: MultiplicationGridGame,
      color: 'from-blue-500 to-cyan-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'featured',
      educational: true,
      logo: getGameLogo('math-grid')
    },
    {
      id: 'coordinate-quest',
      name: 'Coordinate Quest',
      icon: '🌌',
      description: 'Master the Cartesian plane! Locate targets in space using X and Y coordinates.',
      component: CoordinateQuestGame,
      color: 'from-cyan-500 to-blue-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'featured',
      educational: true,
      logo: getGameLogo('coordinate-quest')
    },
    {
      id: 'precision-timer',
      name: 'Precision Timer Challenge',
      icon: '⏱️',
      description: 'Test timing skills! Stop the timer as close to the target time as possible. Great for focus and concentration.',
      component: PrecisionTimerGame,
      color: 'from-red-500 to-orange-600',
      difficulty: 'All Levels',
      time: '2-5 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('precision-timer')
    },
    {
      id: 'dodgeball-frenzy',
      name: 'Dodgeball Frenzy',
      icon: '🥎',
      description: 'Show students the new arena dodge challenge with power-ups and trophies for long survival streaks.',
      component: DodgeballGame,
      color: 'from-orange-500 to-red-500',
      difficulty: 'All Levels',
      time: '2-8 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('dodgeball-frenzy'),
      storageKeySuffix: 'teacher-dodgeball'
    },
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
      category: 'fun',
      logo: getGameLogo('maze-runner')
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
      logo: getGameLogo('educational-bingo')
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
      logo: getGameLogo('math-space-invaders')
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
      logo: getGameLogo('battleships')
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
      logo: getGameLogo('tic-tac-toe')
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
      logo: getGameLogo('classroom-bingo')
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
      logo: getGameLogo('crossword')
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
      logo: getGameLogo('word-search')
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
      logo: getGameLogo('boggle')
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
      logo: getGameLogo('noggle')
    },

    // Brain Games
    {
      id: 'memory-match',
      name: 'Memory Match Challenge',
      icon: '🎴',
      description: 'Classic memory game to display for the class.',
      component: MemoryMatchGame,
      color: 'from-pink-500 to-rose-500',
      difficulty: 'Easy - Medium',
      time: '5-10 minutes',
      category: 'brain',
      logo: getGameLogo('memory-match')
    },
    {
      id: 'clicker',
      name: 'Hero Forge Display',
      icon: '⚡',
      description: 'Display incremental game progress as a relaxing visual.',
      component: ClickerGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Easy',
      time: '10+ minutes',
      category: 'fun',
      logo: getGameLogo('clicker')
    }
  ];

  const categorizeGame = (game) => {
    if (game.multiplayer) return 'multiplayer';
    if (game.educational || game.category === 'educational' || game.category === 'featured' || game.category === 'daily') {
      return 'educational';
    }

    return 'fun';
  };

  const categorizedGames = availableGames.map((game) => ({
    ...game,
    displayCategory: categorizeGame(game)
  }));

  const categories = [
    {
      id: 'educational',
      name: 'Educational',
      icon: '📚',
      description: 'Teacher-led literacy, numeracy and logic games'
    },
    {
      id: 'fun',
      name: 'Fun',
      icon: '🎉',
      description: 'Quick brain breaks and single-player challenges'
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer',
      icon: '👥',
      description: 'Host class tournaments and live battles'
    }
  ];

  const getGamesInCategory = (categoryId) => {
    return categorizedGames.filter(game => game.displayCategory === categoryId);
  };

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-6">
        {/* Game Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedGame(null)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                ← Back to Games
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">{selectedGame.icon}</span>
                  {selectedGame.name}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">{selectedGame.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="max-w-7xl mx-auto">
          <GameComponent
            students={students}
            showToast={showToast}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
            onAwardXP={onAwardXP}
            onAwardCoins={onAwardCoins}
            currentClassData={currentClassData}
            user={user}
            studentData={mockTeacherData}
            updateStudentData={() => { }} // No saving for teacher preview
            classData={currentClassData}
            storageKeySuffix={selectedGame.storageKeySuffix || ''}
            saveClassData={saveClassData}
          />
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-xl text-center">
          <h2 className="text-3xl font-bold mb-2">🎮 Teacher Game Library</h2>
          <p className="text-white/90 text-sm md:text-base">Choose a category to browse and launch games for your class.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-left hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-opacity"></div>
              <div className="relative z-10 space-y-3">
                <div className="text-4xl">{category.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                  <span>{getGamesInCategory(category.id).length} games</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-1">🎮 {categories.find((cat) => cat.id === selectedCategory)?.name} Games</h2>
            <p className="text-white/90 text-sm md:text-base">
              Preview and display games for your classroom. Your students can access these in their student portal!
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="bg-white/15 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition-all"
          >
            ← All Categories
          </button>
        </div>
      </div>

      {/* Games Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {getGamesInCategory(selectedCategory).map((game) => {
          const buttonLabel = game.teacherMode
            ? '🎓 Launch for Class'
            : game.multiplayer
              ? '🎮 Host Game'
              : '👁️ Preview Game';

          return (
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
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
            >
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-56 h-44 md:h-auto overflow-hidden bg-white flex items-center justify-center">
                  {(() => {
                    const logoSource = resolveLogoSource(game.logo);
                    return (
                      <img
                        src={logoSource.src}
                        alt={`${game.name} logo`}
                        className="max-w-full max-h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                        data-fallbacks={serializeFallbacks(logoSource.fallbacks)}
                        data-fallback-index="0"
                        onError={logoErrorHandler}
                      />
                    );
                  })()}
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 text-gray-800">
                    <span className="text-lg">{game.icon}</span>
                    <span>{game.displayCategory === 'educational' ? 'Educational' : game.displayCategory === 'multiplayer' ? 'Multiplayer' : 'Fun'}</span>
                  </div>
                  {game.new && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-bounce">
                      NEW
                    </div>
                  )}
                  {!game.new && game.featured && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                      ⭐ Featured
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 md:p-6 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1 min-w-0">
                      <span className="truncate block group-hover:text-purple-600 transition-colors">{game.name}</span>
                    </h3>
                    {game.daily && (
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">Daily</span>
                    )}
                    {game.teacherMode && (
                      <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">Teacher Mode</span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    {game.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-600">
                    {game.multiplayer && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Multiplayer</span>}
                    {game.educational && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Educational</span>}
                  </div>

                  <div className="flex justify-between text-xs md:text-sm text-gray-500">
                    <span>⚡ Difficulty: <strong className="text-gray-700">{game.difficulty}</strong></span>
                    <span>⏱️ Time: <strong className="text-gray-700">{game.time}</strong></span>
                  </div>

                  <div className="pt-2 md:pt-4">
                    <div className={`inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded-full bg-gradient-to-r ${game.color} text-white font-semibold text-sm md:text-base shadow-sm group-hover:shadow-lg transition-all`}>
                      {buttonLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Teacher Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">🔢 Math Facts Grid</div>
            <div className="text-gray-600">Students race to complete grids and compete for the fastest times. Great for daily math practice!</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⏱️ Precision Timer</div>
            <div className="text-gray-600">Test focus and timing skills. Perfect for brain breaks and concentration training.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-purple-700 mb-1">🎲 Educational BINGO</div>
            <div className="text-gray-600">Create custom BINGO games for any subject! Perfect for review sessions.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-orange-700 mb-1">⚔️ Battle Royale</div>
            <div className="text-gray-600">Host epic multiplayer math battles! Students love the competitive element.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;