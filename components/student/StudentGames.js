// components/student/StudentGames.js - FIXED EXPORT
import React, { useState } from 'react';

// Import existing game components (they should work as-is)
import BoggleGame from '../games/BoggleGame';
import MathRaceGame from '../games/MathRaceGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import NoggleGame from '../games/NoggleGame';
import WordSearchGame from '../games/WordSearchGame';
import CrosswordGame from '../games/CrosswordGame';

const StudentGames = ({ studentData, showToast }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const availableGames = [
    {
      id: 'crossword',
      name: 'Crossword Puzzle',
      icon: '🧩',
      description: 'Solve crossword puzzles and expand your vocabulary',
      component: CrosswordGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '10-30 minutes'
    },
    {
      id: 'word-search',
      name: 'Word Search',
      icon: '🔍',
      description: 'Find hidden words in the letter grid',
      component: WordSearchGame,
      color: 'from-blue-500 to-blue-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes'
    },
    {
      id: 'math-race',
      name: 'Math Race',
      icon: '🧮',
      description: 'Solve math problems as fast as you can',
      component: MathRaceGame,
      color: 'from-green-500 to-green-600',
      difficulty: 'Easy - Hard',
      time: '2-5 minutes'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Test your memory with card matching',
      component: MemoryMatchGame,
      color: 'from-purple-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '3-8 minutes'
    },
    {
      id: 'boggle',
      name: 'Word Boggle',
      icon: '🔤',
      description: 'Create words by connecting letters',
      component: BoggleGame,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes'
    },
    {
      id: 'noggle',
      name: 'Number Noggle',
      icon: '🔢',
      description: 'Connect numbers to create target sums',
      component: NoggleGame,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Medium - Hard',
      time: '3-5 minutes'
    }
  ];

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedGame(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <GameComponent 
            gameMode="digital"
            showToast={showToast}
            students={[studentData]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Play Games
          </h2>
          <p className="text-gray-600">Choose a game to play and have fun learning!</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="group cursor-pointer bg-gray-50 rounded-xl p-6 border-2 border-transparent hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
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

              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {game.description}
              </p>

              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>⚡ Difficulty:</span>
                  <span className="font-medium">{game.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>⏱️ Duration:</span>
                  <span className="font-medium">{game.time}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all`}>
                  🎮 Play Game
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// FIXED: Use default export to match other components
export default StudentGames;