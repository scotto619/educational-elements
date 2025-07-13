// GamesTab.js - Educational Word and Number Games
import React, { useState, useEffect, useCallback } from 'react';

const GamesTab = ({ showToast }) => {
  const [activeGame, setActiveGame] = useState('boggle');
  const [gameMode, setGameMode] = useState('digital'); // 'digital' or 'classroom'
  
  // Boggle State
  const [boggleGrid, setBoggleGrid] = useState([]);
  const [boggleGridSize, setBoggleGridSize] = useState(5);
  const [boggleWords, setBoggleWords] = useState([]);
  const [boggleCurrentWord, setBoggleCurrentWord] = useState('');
  const [boggleSelectedPath, setBoggleSelectedPath] = useState([]);
  const [boggleFoundWords, setBoggleFoundWords] = useState([]);
  const [boggleTimer, setBoggleTimer] = useState(180); // 3 minutes
  const [boggleIsActive, setBoggleIsActive] = useState(false);
  
  // Noggle State
  const [noggleGrid, setNoggleGrid] = useState([]);
  const [noggleGridSize, setNoggleGridSize] = useState(5);
  const [noggleTarget, setNoggleTarget] = useState(50);
  const [noggleCurrentSum, setNoggleCurrentSum] = useState(0);
  const [noggleSelectedPath, setNoggleSelectedPath] = useState([]);
  const [noggleFoundSums, setNoggleFoundSums] = useState([]);
  const [noggleTimer, setNoggleTimer] = useState(180);
  const [noggleIsActive, setNoggleIsActive] = useState(false);

  const games = [
    { id: 'boggle', name: 'Boggle', icon: '🔤', description: 'Find words in the letter grid' },
    { id: 'noggle', name: 'Noggle', icon: '🔢', description: 'Create sums to reach target numbers' }
  ];

  // Vowels for ensuring minimum in Boggle
  const vowels = ['A', 'E', 'I', 'O', 'U'];
  const consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

  // Generate Boggle Grid
  const generateBoggleGrid = useCallback(() => {
    const totalCells = boggleGridSize * boggleGridSize;
    const minVowels = Math.max(4, Math.floor(totalCells * 0.3)); // At least 4 vowels or 30%
    const grid = [];
    
    // Add required vowels
    for (let i = 0; i < minVowels; i++) {
      grid.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    
    // Fill remaining with mix of vowels and consonants
    for (let i = minVowels; i < totalCells; i++) {
      const useVowel = Math.random() < 0.2; // 20% chance for additional vowels
      if (useVowel) {
        grid.push(vowels[Math.floor(Math.random() * vowels.length)]);
      } else {
        grid.push(consonants[Math.floor(Math.random() * consonants.length)]);
      }
    }
    
    // Shuffle the grid
    for (let i = grid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [grid[i], grid[j]] = [grid[j], grid[i]];
    }
    
    // Convert to 2D array
    const grid2D = [];
    for (let i = 0; i < boggleGridSize; i++) {
      grid2D.push(grid.slice(i * boggleGridSize, (i + 1) * boggleGridSize));
    }
    
    setBoggleGrid(grid2D);
    setBoggleFoundWords([]);
    setBoggleSelectedPath([]);
    setBoggleCurrentWord('');
  }, [boggleGridSize]);

  // Generate Noggle Grid
  const generateNoggleGrid = useCallback(() => {
    const grid = [];
    for (let i = 0; i < noggleGridSize; i++) {
      const row = [];
      for (let j = 0; j < noggleGridSize; j++) {
        // Generate numbers 1-9 with occasional larger numbers
        const num = Math.random() < 0.8 ? Math.floor(Math.random() * 9) + 1 : Math.floor(Math.random() * 20) + 10;
        row.push(num);
      }
      grid.push(row);
    }
    
    setNoggleGrid(grid);
    // Generate target based on grid values
    const avgValue = grid.flat().reduce((sum, val) => sum + val, 0) / (noggleGridSize * noggleGridSize);
    const target = Math.floor(avgValue * (2 + Math.random() * 3)); // 2-5x average
    setNoggleTarget(target);
    setNoggleFoundSums([]);
    setNoggleSelectedPath([]);
    setNoggleCurrentSum(0);
  }, [noggleGridSize]);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (activeGame === 'boggle' && boggleIsActive && boggleTimer > 0) {
      interval = setInterval(() => {
        setBoggleTimer(prev => {
          if (prev <= 1) {
            setBoggleIsActive(false);
            showToast('Time\'s up! Game over.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (activeGame === 'noggle' && noggleIsActive && noggleTimer > 0) {
      interval = setInterval(() => {
        setNoggleTimer(prev => {
          if (prev <= 1) {
            setNoggleIsActive(false);
            showToast('Time\'s up! Game over.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeGame, boggleIsActive, noggleIsActive, boggleTimer, noggleTimer, showToast]);

  // Check if cells are adjacent
  const areAdjacent = (row1, col1, row2, col2) => {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
  };

  // Boggle cell click handler
  const handleBoggleCellClick = (row, col) => {
    if (!boggleIsActive || gameMode === 'classroom') return;
    
    const cellKey = `${row}-${col}`;
    const lastPath = boggleSelectedPath[boggleSelectedPath.length - 1];
    
    // If first cell or adjacent to last selected cell
    if (boggleSelectedPath.length === 0 || 
        (lastPath && areAdjacent(lastPath.row, lastPath.col, row, col) && 
         !boggleSelectedPath.some(p => p.row === row && p.col === col))) {
      
      const newPath = [...boggleSelectedPath, { row, col }];
      setBoggleSelectedPath(newPath);
      setBoggleCurrentWord(prev => prev + boggleGrid[row][col]);
    }
  };

  // Noggle cell click handler
  const handleNoggleCellClick = (row, col) => {
    if (!noggleIsActive || gameMode === 'classroom') return;
    
    const cellKey = `${row}-${col}`;
    const lastPath = noggleSelectedPath[noggleSelectedPath.length - 1];
    
    // If first cell or adjacent to last selected cell
    if (noggleSelectedPath.length === 0 || 
        (lastPath && areAdjacent(lastPath.row, lastPath.col, row, col) && 
         !noggleSelectedPath.some(p => p.row === row && p.col === col))) {
      
      const newPath = [...noggleSelectedPath, { row, col }];
      setNoggleSelectedPath(newPath);
      setNoggleCurrentSum(prev => prev + noggleGrid[row][col]);
    }
  };

  // Submit Boggle word
  const submitBoggleWord = () => {
    if (boggleCurrentWord.length < 3) {
      showToast('Words must be at least 3 letters long!', 'error');
      return;
    }
    
    if (boggleFoundWords.includes(boggleCurrentWord)) {
      showToast('Word already found!', 'error');
    } else {
      setBoggleFoundWords(prev => [...prev, boggleCurrentWord]);
      showToast(`Great! Found "${boggleCurrentWord}"`, 'success');
    }
    
    // Reset selection
    setBoggleSelectedPath([]);
    setBoggleCurrentWord('');
  };

  // Submit Noggle sum
  const submitNoggleSum = () => {
    if (noggleSelectedPath.length < 2) {
      showToast('Need at least 2 numbers!', 'error');
      return;
    }
    
    const pathStr = noggleSelectedPath.map(p => `${p.row}-${p.col}`).join(',');
    if (noggleFoundSums.some(sum => sum.path === pathStr)) {
      showToast('Path already used!', 'error');
    } else if (noggleCurrentSum === noggleTarget) {
      setNoggleFoundSums(prev => [...prev, { sum: noggleCurrentSum, path: pathStr, numbers: noggleSelectedPath.map(p => noggleGrid[p.row][p.col]) }]);
      showToast(`Perfect! Found target ${noggleTarget}!`, 'success');
    } else {
      showToast(`Sum is ${noggleCurrentSum}, target is ${noggleTarget}`, 'info');
    }
    
    // Reset selection
    setNoggleSelectedPath([]);
    setNoggleCurrentSum(0);
  };

  // Clear current selection
  const clearSelection = () => {
    if (activeGame === 'boggle') {
      setBoggleSelectedPath([]);
      setBoggleCurrentWord('');
    } else {
      setNoggleSelectedPath([]);
      setNoggleCurrentSum(0);
    }
  };

  // Start game
  const startGame = () => {
    if (activeGame === 'boggle') {
      setBoggleIsActive(true);
      setBoggleTimer(180);
      generateBoggleGrid();
    } else {
      setNoggleIsActive(true);
      setNoggleTimer(180);
      generateNoggleGrid();
    }
  };

  // Stop game
  const stopGame = () => {
    if (activeGame === 'boggle') {
      setBoggleIsActive(false);
    } else {
      setNoggleIsActive(false);
    }
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize grids on component mount
  useEffect(() => {
    generateBoggleGrid();
    generateNoggleGrid();
  }, [generateBoggleGrid, generateNoggleGrid]);

  const isGameActive = activeGame === 'boggle' ? boggleIsActive : noggleIsActive;
  const currentTimer = activeGame === 'boggle' ? boggleTimer : noggleTimer;
  const currentGrid = activeGame === 'boggle' ? boggleGrid : noggleGrid;
  const currentGridSize = activeGame === 'boggle' ? boggleGridSize : noggleGridSize;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-2">🎮 Educational Games</h2>
        <p className="text-gray-700">Engage your students with fun word and number challenges</p>
      </div>

      {/* Game Selection & Mode Toggle */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Choose Game</h3>
            <div className="flex gap-4">
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(game.id)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    activeGame === game.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{game.icon}</div>
                  <div className="font-bold">{game.name}</div>
                  <div className="text-sm">{game.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">📱 Game Mode</h3>
            <div className="space-y-3">
              <button
                onClick={() => setGameMode('digital')}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  gameMode === 'digital'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300'
                }`}
              >
                <div className="font-bold">💻 Digital Mode</div>
                <div className="text-sm">Play interactively on screen - click cells to select</div>
              </button>
              <button
                onClick={() => setGameMode('classroom')}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  gameMode === 'classroom'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                <div className="font-bold">🏫 Classroom Mode</div>
                <div className="text-sm">Display only - students write answers on paper</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Timer & Status */}
          <div className="flex items-center space-x-4">
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
              isGameActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              ⏰ {formatTime(currentTimer)}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              isGameActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
            }`}>
              {isGameActive ? '🎮 ACTIVE' : '⏸️ PAUSED'}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              gameMode === 'digital' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'
            }`}>
              {gameMode === 'digital' ? '💻 Digital' : '🏫 Classroom'}
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex items-center space-x-2">
            {/* Grid Size Control */}
            <select
              value={currentGridSize}
              onChange={(e) => {
                const size = parseInt(e.target.value);
                if (activeGame === 'boggle') {
                  setBoggleGridSize(size);
                } else {
                  setNoggleGridSize(size);
                }
              }}
              disabled={isGameActive}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={4}>4×4 Grid</option>
              <option value={5}>5×5 Grid</option>
              <option value={6}>6×6 Grid</option>
              <option value={7}>7×7 Grid</option>
            </select>

            {isGameActive ? (
              <button
                onClick={stopGame}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                ⏹️ Stop Game
              </button>
            ) : (
              <button
                onClick={startGame}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                ▶️ Start Game
              </button>
            )}

            <button
              onClick={activeGame === 'boggle' ? generateBoggleGrid : generateNoggleGrid}
              disabled={isGameActive}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              🔄 New Grid
            </button>
          </div>
        </div>
      </div>

      {/* Game Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">
                {activeGame === 'boggle' ? '🔤 Letter Grid' : '🔢 Number Grid'}
              </h3>
              {activeGame === 'noggle' && (
                <div className="mt-2 text-xl font-bold text-blue-600">
                  🎯 Target: {noggleTarget}
                </div>
              )}
            </div>

            {/* Grid Display */}
            <div className="flex justify-center">
              <div 
                className="grid gap-2 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                style={{ 
                  gridTemplateColumns: `repeat(${currentGridSize}, 1fr)`,
                  maxWidth: '500px'
                }}
              >
                {currentGrid.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = activeGame === 'boggle' 
                      ? boggleSelectedPath.some(p => p.row === rowIndex && p.col === colIndex)
                      : noggleSelectedPath.some(p => p.row === rowIndex && p.col === colIndex);
                    
                    const isClickable = gameMode === 'digital' && isGameActive;
                    
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => activeGame === 'boggle' ? handleBoggleCellClick(rowIndex, colIndex) : handleNoggleCellClick(rowIndex, colIndex)}
                        disabled={!isClickable}
                        className={`aspect-square flex items-center justify-center text-lg font-bold rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-500 text-white border-blue-600 transform scale-105 shadow-lg'
                            : isClickable
                            ? 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                            : 'bg-white text-gray-800 border-gray-300'
                        }`}
                        style={{ minWidth: '50px', minHeight: '50px' }}
                      >
                        {cell}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Current Selection Display */}
            {gameMode === 'digital' && isGameActive && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    {activeGame === 'boggle' ? 'Current Word:' : 'Current Sum:'}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 mb-3">
                    {activeGame === 'boggle' ? boggleCurrentWord || '(select letters)' : noggleCurrentSum || '(select numbers)'}
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={activeGame === 'boggle' ? submitBoggleWord : submitNoggleSum}
                      disabled={activeGame === 'boggle' ? boggleCurrentWord.length < 3 : noggleSelectedPath.length < 2}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      ✅ Submit
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      🔄 Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Results & Instructions */}
        <div className="space-y-6">
          {/* Found Items */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {activeGame === 'boggle' ? '📝 Found Words' : '🎯 Found Solutions'}
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeGame === 'boggle' ? (
                boggleFoundWords.length > 0 ? (
                  boggleFoundWords.map((word, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded flex justify-between items-center">
                      <span className="font-medium text-green-800">{word}</span>
                      <span className="text-sm text-green-600">{word.length} letters</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-center py-4">No words found yet</div>
                )
              ) : (
                noggleFoundSums.length > 0 ? (
                  noggleFoundSums.map((solution, index) => (
                    <div key={index} className="p-2 bg-green-50 border border-green-200 rounded">
                      <div className="font-medium text-green-800">{solution.numbers.join(' + ')} = {solution.sum}</div>
                      <div className="text-sm text-green-600">{solution.numbers.length} numbers</div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic text-center py-4">No solutions found yet</div>
                )
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="text-center font-bold text-gray-800">
                Score: {activeGame === 'boggle' ? boggleFoundWords.length : noggleFoundSums.length}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📋 How to Play</h3>
            
            {activeGame === 'boggle' ? (
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Click adjacent letters to form words</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Letters must touch horizontally, vertically, or diagonally</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Words must be at least 3 letters long</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Can't reuse the same letter position</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>Find as many words as possible before time runs out!</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>Click adjacent numbers to create sums</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span>Numbers must touch horizontally, vertically, or diagonally</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span>Try to make sums that equal the target number</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span>Can't reuse the same number position in one sum</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">5.</span>
                  <span>Find as many solutions as possible!</span>
                </div>
              </div>
            )}
          </div>

          {/* Game Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Game Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Grid Size:</span>
                <span className="font-bold">{currentGridSize}×{currentGridSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Remaining:</span>
                <span className="font-bold">{formatTime(currentTimer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {activeGame === 'boggle' ? 'Words Found:' : 'Solutions Found:'}
                </span>
                <span className="font-bold">
                  {activeGame === 'boggle' ? boggleFoundWords.length : noggleFoundSums.length}
                </span>
              </div>
              {activeGame === 'boggle' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Letters:</span>
                  <span className="font-bold">
                    {boggleFoundWords.reduce((sum, word) => sum + word.length, 0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamesTab;