// GamesTab.js - Modular Educational Games Container
import React, { useState, Suspense } from 'react';

// Game Components (lazy loaded for performance)
const BoggleGame = React.lazy(() => import('../games/BoggleGame'));
const NoggleGame = React.lazy(() => import('../games/NoggleGame'));
const WordSearchGame = React.lazy(() => import('../games/WordSearchGame'));
const MathRaceGame = React.lazy(() => import('../games/MathRaceGame'));
const MemoryMatchGame = React.lazy(() => import('../games/MemoryMatchGame'));

const GamesTab = ({ showToast, students }) => {
  const [activeGame, setActiveGame] = useState('boggle');
  const [gameMode, setGameMode] = useState('digital'); // 'digital' or 'classroom'

  // Game Registry - Easy to add new games!
  const availableGames = [
    { 
      id: 'boggle', 
      name: 'Word Boggle', 
      icon: '🔤', 
      description: 'Find words in the letter grid',
      component: BoggleGame,
      category: 'language',
      difficulty: 'medium'
    },
    { 
      id: 'noggle', 
      name: 'Number Noggle', 
      icon: '🔢', 
      description: 'Create sums to reach target numbers',
      component: NoggleGame,
      category: 'math',
      difficulty: 'medium'
    },
    { 
      id: 'wordsearch', 
      name: 'Word Search', 
      icon: '🔍', 
      description: 'Find hidden words in the grid',
      component: WordSearchGame,
      category: 'language',
      difficulty: 'easy'
    },
    { 
      id: 'mathrace', 
      name: 'Math Race', 
      icon: '🏁', 
      description: 'Solve math problems as fast as you can',
      component: MathRaceGame,
      category: 'math',
      difficulty: 'hard'
    },
    { 
      id: 'memory', 
      name: 'Memory Match', 
      icon: '🧠', 
      description: 'Match pairs to test your memory',
      component: MemoryMatchGame,
      category: 'logic',
      difficulty: 'easy'
    }
  ];

  const currentGame = availableGames.find(game => game.id === activeGame);

  // Game Loading Component
  const GameLoadingSpinner = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading {currentGame?.name}...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-4xl font-bold mb-2">🎮 Educational Games</h2>
        <p className="text-lg opacity-90">Engage your students with fun learning challenges</p>
        <div className="mt-4 flex justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span>📚</span>
            <span>Language Arts</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔢</span>
            <span>Mathematics</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🧠</span>
            <span>Logic & Memory</span>
          </div>
        </div>
      </div>

      {/* Game Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Choose Your Game</h3>
        
        {/* Game Categories */}
        <div className="space-y-6">
          {['language', 'math', 'logic'].map(category => {
            const categoryGames = availableGames.filter(game => game.category === category);
            const categoryNames = {
              language: '📚 Language Arts',
              math: '🔢 Mathematics', 
              logic: '🧠 Logic & Memory'
            };

            return (
              <div key={category}>
                <h4 className="text-lg font-semibold text-gray-700 mb-3">{categoryNames[category]}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryGames.map(game => {
                    const difficultyColors = {
                      easy: 'bg-green-100 text-green-700',
                      medium: 'bg-yellow-100 text-yellow-700',
                      hard: 'bg-red-100 text-red-700'
                    };

                    return (
                      <button
                        key={game.id}
                        onClick={() => setActiveGame(game.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                          activeGame === game.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-3xl">{game.icon}</div>
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${difficultyColors[game.difficulty]}`}>
                            {game.difficulty}
                          </span>
                        </div>
                        <div className="font-bold text-lg mb-1">{game.name}</div>
                        <div className="text-sm opacity-75">{game.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Game Mode Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📱 Game Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setGameMode('digital')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              gameMode === 'digital'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💻</span>
              <div>
                <div className="font-bold">Digital Interactive Mode</div>
                <div className="text-sm">Students can click and interact with the game</div>
              </div>
            </div>
          </button>
          <button
            onClick={() => setGameMode('classroom')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              gameMode === 'classroom'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏫</span>
              <div>
                <div className="font-bold">Classroom Display Mode</div>
                <div className="text-sm">Display for whole class, students write answers</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Current Game Display */}
      {currentGame && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Game Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{currentGame.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{currentGame.name}</h3>
                  <p className="text-sm text-gray-600">{currentGame.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                  gameMode === 'digital' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {gameMode === 'digital' ? '💻 Interactive' : '🏫 Display'}
                </span>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="p-6">
            <Suspense fallback={<GameLoadingSpinner />}>
              <currentGame.component 
                gameMode={gameMode}
                showToast={showToast}
                students={students}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Quick Add Game Instructions */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Developer Note: Adding New Games</h4>
            <p className="text-yellow-700 text-sm">
              To add a new game, simply create a new component in `/components/games/` and add it to the 
              `availableGames` array above. Each game component receives `gameMode`, `showToast`, and `students` as props.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;