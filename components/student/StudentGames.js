// components/student/StudentGames.js - MOBILE OPTIMIZED WITH CLICKER GAME
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
import ClickerGame from '../games/ClickerGame'; // NEW IMPORT

const StudentGames = ({ studentData, showToast, updateStudentData }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const availableGames = [
    {
      id: 'clicker',
      name: 'Hero Forge',
      icon: '⚔️',
      description: 'Build your fantasy empire in this epic incremental adventure!',
      component: ClickerGame,
      color: 'from-yellow-500 to-orange-600',
      difficulty: 'Easy',
      time: 'Unlimited',
      multiplayer: false,
      special: true
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
      multiplayer: true
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
      multiplayer: true
    },
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
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${selectedGame.color} flex items-center justify-center text-lg md:text-2xl flex-shrink-0`}>
                  {selectedGame.icon}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{selectedGame.name}</h2>
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
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🎮 Play Games
          </h2>
          <p className="text-gray-600 text-sm md:text-base">Choose a game to play and have fun learning!</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {availableGames.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className={`group cursor-pointer rounded-xl p-4 md:p-6 border-2 border-transparent hover:shadow-lg transition-all duration-200 active:scale-95 relative ${
                game.special 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-orange-300 ring-2 ring-yellow-400 ring-opacity-50' 
                  : 'bg-gray-50 hover:border-gray-300'
              }`}
            >
              {game.special && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  NEW!
                </div>
              )}
              <div className="flex items-center space-x-3 mb-3 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform flex-shrink-0 ${game.special ? 'animate-pulse' : ''}`}>
                  {game.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {game.name}
                    {game.special && <span className="ml-2 text-yellow-600">⭐</span>}
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
                    <span className="font-medium text-purple-600">Multiplayer</span>
                  </div>
                )}
                {game.special && (
                  <div className="flex justify-between">
                    <span>💾 Saves:</span>
                    <span className="font-medium text-green-600">Progress Saved</span>
                  </div>
                )}
              </div>

              <div className="pt-3 md:pt-4 border-t border-gray-200">
                <div className={`w-full py-2 md:py-3 px-4 rounded-lg bg-gradient-to-r ${game.color} text-white text-center font-semibold group-hover:shadow-md transition-all text-sm md:text-base`}>
                  {game.special ? '⚔️ Start Adventure' : game.multiplayer ? '👥 Play vs Friend' : '🎮 Play Game'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentGames;