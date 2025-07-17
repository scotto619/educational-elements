// components/games/BoggleGame.js - Word Boggle Game Component
import React, { useState, useEffect, useCallback } from 'react';

const BoggleGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [selectedPath, setSelectedPath] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isActive, setIsActive] = useState(false);
  const [gameStats, setGameStats] = useState({ totalWords: 0, longestWord: '', points: 0 });

  // Vowels and consonants for grid generation
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Generate Boggle Grid
  const generateGrid = useCallback(() => {
    const totalCells = gridSize * gridSize;
    const minVowels = Math.max(4, Math.floor(totalCells * 0.3)); // At least 4 vowels or 30%
    const grid = [];
    
    // Add required vowels
    for (let i = 0; i < minVowels; i++) {
      grid.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    
    // Fill remaining with mix of vowels and consonants
    for (let i = minVowels; i < totalCells; i++) {
      const useVowel = Math.random() < 0.4; // 40% chance for additional vowels
      const letterArray = useVowel ? vowels : consonants;
      grid.push(letterArray[Math.floor(Math.random() * letterArray.length)]);
    }
    
    // Shuffle the array
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    
    // Convert to 2D array
    const gridArray = [];
    for (let i = 0; i < gridSize; i++) {
      gridArray[i] = grid.slice(i * gridSize, (i + 1) * gridSize);
    }
    
    setGrid(gridArray);
    setFoundWords([]);
    setSelectedPath([]);
    setCurrentWord('');
    setGameStats({ totalWords: 0, longestWord: '', points: 0 });
  }, [gridSize]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      showToast(`Game Over! Found ${foundWords.length} words!`, 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, timer, foundWords.length, showToast]);

  // Check if two cells are adjacent
  const areAdjacent = (cell1, cell2) => {
    const rowDiff = Math.abs(cell1.row - cell2.row);
    const colDiff = Math.abs(cell1.col - cell2.col);
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);
  };

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (gameMode !== 'digital' || !isActive) return;

    const newCell = { row, col };
    
    // Check if cell is already in path
    if (selectedPath.some(p => p.row === row && p.col === col)) {
      // If it's the last cell, remove it (backtrack)
      if (selectedPath.length > 0 && 
          selectedPath[selectedPath.length - 1].row === row && 
          selectedPath[selectedPath.length - 1].col === col) {
        const newPath = selectedPath.slice(0, -1);
        setSelectedPath(newPath);
        setCurrentWord(newPath.map(p => grid[p.row][p.col]).join(''));
      }
      return;
    }

    // Check adjacency
    if (selectedPath.length > 0) {
      const lastCell = selectedPath[selectedPath.length - 1];
      if (!areAdjacent(lastCell, newCell)) {
        return;
      }
    }

    // Add cell to path
    const newPath = [...selectedPath, newCell];
    setSelectedPath(newPath);
    setCurrentWord(newPath.map(p => grid[p.row][p.col]).join(''));
  };

  // Submit word
  const submitWord = () => {
    if (currentWord.length < 3) {
      showToast('Words must be at least 3 letters long!', 'error');
      return;
    }

    const pathStr = selectedPath.map(p => `${p.row}-${p.col}`).join(',');
    const wordExists = foundWords.some(word => word.path === pathStr);
    
    if (wordExists) {
      showToast('Word already found!', 'error');
    } else {
      const points = currentWord.length * 10; // 10 points per letter
      const newWord = { word: currentWord, path: pathStr, points };
      const newFoundWords = [...foundWords, newWord];
      
      setFoundWords(newFoundWords);
      
      // Update stats
      const totalPoints = newFoundWords.reduce((sum, w) => sum + w.points, 0);
      const longestWord = newFoundWords.reduce((longest, w) => 
        w.word.length > longest.length ? w.word : longest, '');
      
      setGameStats({
        totalWords: newFoundWords.length,
        longestWord,
        points: totalPoints
      });
      
      showToast(`Found "${currentWord}" - ${points} points!`, 'success');
    }
    
    // Reset selection
    setSelectedPath([]);
    setCurrentWord('');
  };

  // Clear current selection
  const clearSelection = () => {
    setSelectedPath([]);
    setCurrentWord('');
  };

  // Start game
  const startGame = () => {
    setIsActive(true);
    setTimer(180);
    generateGrid();
  };

  // Stop game
  const stopGame = () => {
    setIsActive(false);
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize grid on component mount
  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timer & Status */}
        <div className="flex items-center space-x-4">
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            ⏰ {formatTime(timer)}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {isActive ? '🎮 ACTIVE' : '⏸️ PAUSED'}
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            📝 Words: {gameStats.totalWords}
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-semibold">
            🏆 Points: {gameStats.points}
          </div>
          {gameStats.longestWord && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-semibold">
              📏 Longest: {gameStats.longestWord}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            disabled={isActive}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={4}>4×4 Grid</option>
            <option value={5}>5×5 Grid</option>
            <option value={6}>6×6 Grid</option>
            <option value={7}>7×7 Grid</option>
          </select>

          {isActive ? (
            <button
              onClick={stopGame}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              ⏹️ Stop
            </button>
          ) : (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              ▶️ Start
            </button>
          )}

          <button
            onClick={generateGrid}
            disabled={isActive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            🔄 New Grid
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">🔤 Letter Grid</h3>
            {gameMode === 'digital' && (
              <p className="text-sm text-gray-600 mt-2">
                Click adjacent letters to form words (minimum 3 letters)
              </p>
            )}
          </div>

          {/* Grid Display */}
          <div className="flex justify-center">
            <div 
              className="grid gap-2 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                maxWidth: '500px'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => {
                  const isSelected = selectedPath.some(p => p.row === rowIndex && p.col === colIndex);
                  const isClickable = gameMode === 'digital' && isActive;
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={!isClickable}
                      className={`w-12 h-12 text-xl font-bold rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-blue-500 text-white border-blue-600 shadow-lg scale-110'
                          : isClickable
                          ? 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                          : 'bg-white text-gray-800 border-gray-300'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Current Word & Actions */}
          {gameMode === 'digital' && (
            <div className="mt-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Current Word:</div>
                <div className="text-2xl font-bold text-blue-600 min-h-[2rem]">
                  {currentWord || '-'}
                </div>
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={submitWord}
                  disabled={currentWord.length < 3 || !isActive}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Submit Word
                </button>
                <button
                  onClick={clearSelection}
                  disabled={selectedPath.length === 0 || !isActive}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗑️ Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Found Words Sidebar */}
        <div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📝 Found Words</h4>
            {foundWords.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No words found yet!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {foundWords.map((wordData, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                    <span className="font-semibold">{wordData.word}</span>
                    <span className="text-sm text-blue-600">{wordData.points}pts</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Final Score Display */}
            {!isActive && foundWords.length > 0 && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-800">🏆 Final Score</div>
                  <div className="text-2xl font-bold text-blue-600">{gameStats.points} points</div>
                  <div className="text-sm text-blue-700 mt-1">
                    {gameStats.totalWords} words • Longest: {gameStats.longestWord}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 Instructions</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Form words by connecting adjacent letters</li>
              <li>• Words must be at least 3 letters long</li>
              <li>• Each letter can only be used once per word</li>
              <li>• Diagonal connections are allowed</li>
              <li>• Longer words earn more points!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoggleGame;