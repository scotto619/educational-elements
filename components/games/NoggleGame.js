// components/games/NoggleGame.js - Number Noggle Game Component
import React, { useState, useEffect, useCallback } from 'react';

const NoggleGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(5);
  const [target, setTarget] = useState(50);
  const [currentSum, setCurrentSum] = useState(0);
  const [selectedPath, setSelectedPath] = useState([]);
  const [foundSums, setFoundSums] = useState([]);
  const [timer, setTimer] = useState(180); // 3 minutes
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStats, setGameStats] = useState({ totalSums: 0, perfectHits: 0, points: 0 });

  // Difficulty settings
  const difficultySettings = {
    easy: { numberRange: [1, 10], targetRange: [20, 40] },
    medium: { numberRange: [1, 15], targetRange: [30, 70] },
    hard: { numberRange: [1, 20], targetRange: [50, 100] }
  };

  // Generate Noggle Grid
  const generateGrid = useCallback(() => {
    const { numberRange, targetRange } = difficultySettings[difficulty];
    const totalCells = gridSize * gridSize;
    const [minNum, maxNum] = numberRange;
    const [minTarget, maxTarget] = targetRange;
    
    // Generate grid with weighted distribution
    const numbers = [];
    
    // Add some smaller numbers (30% of grid)
    const smallCount = Math.floor(totalCells * 0.3);
    for (let i = 0; i < smallCount; i++) {
      numbers.push(Math.floor(Math.random() * Math.floor((maxNum - minNum) / 2)) + minNum);
    }
    
    // Add medium numbers (50% of grid)
    const mediumCount = Math.floor(totalCells * 0.5);
    for (let i = 0; i < mediumCount; i++) {
      numbers.push(Math.floor(Math.random() * Math.floor((maxNum - minNum) / 2)) + Math.floor((maxNum - minNum) / 2) + minNum);
    }
    
    // Add larger numbers (20% of grid)
    const largeCount = totalCells - smallCount - mediumCount;
    for (let i = 0; i < largeCount; i++) {
      numbers.push(Math.floor(Math.random() * (maxNum - Math.floor(maxNum * 0.7))) + Math.floor(maxNum * 0.7));
    }
    
    // Shuffle the numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // Convert to 2D array
    const gridArray = [];
    for (let i = 0; i < gridSize; i++) {
      gridArray[i] = numbers.slice(i * gridSize, (i + 1) * gridSize);
    }
    
    // Generate achievable target
    const newTarget = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
    
    setGrid(gridArray);
    setTarget(newTarget);
    setFoundSums([]);
    setSelectedPath([]);
    setCurrentSum(0);
    setGameStats({ totalSums: 0, perfectHits: 0, points: 0 });
  }, [gridSize, difficulty]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      showToast(`Game Over! Found ${gameStats.perfectHits} perfect targets!`, 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, timer, gameStats.perfectHits, showToast]);

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
    const cellValue = grid[row][col];
    
    // Check if cell is already in path
    const existingIndex = selectedPath.findIndex(p => p.row === row && p.col === col);
    if (existingIndex !== -1) {
      // If it's the last cell, remove it (backtrack)
      if (existingIndex === selectedPath.length - 1) {
        const newPath = selectedPath.slice(0, -1);
        setSelectedPath(newPath);
        setCurrentSum(newPath.reduce((sum, p) => sum + grid[p.row][p.col], 0));
      }
      return;
    }

    // Check adjacency (only if not first cell)
    if (selectedPath.length > 0) {
      const lastCell = selectedPath[selectedPath.length - 1];
      if (!areAdjacent(lastCell, newCell)) {
        showToast('Cells must be adjacent!', 'error');
        return;
      }
    }

    // Add cell to path
    const newPath = [...selectedPath, newCell];
    const newSum = currentSum + cellValue;
    
    setSelectedPath(newPath);
    setCurrentSum(newSum);

    // Auto-submit if we hit the target exactly
    if (newSum === target) {
      setTimeout(() => submitSum(newPath, newSum), 200); // Small delay for visual feedback
    } else if (newSum > target) {
      showToast(`Sum ${newSum} exceeds target ${target}!`, 'warning');
    }
  };

  // Submit sum
  const submitSum = (pathToSubmit = selectedPath, sumToSubmit = currentSum) => {
    if (pathToSubmit.length < 2) {
      showToast('Need at least 2 numbers!', 'error');
      return;
    }

    const pathStr = pathToSubmit.map(p => `${p.row}-${p.col}`).join(',');
    const existingSum = foundSums.find(sum => sum.path === pathStr);
    
    if (existingSum) {
      showToast('Path already used!', 'error');
    } else {
      const numbers = pathToSubmit.map(p => grid[p.row][p.col]);
      const isPerfect = sumToSubmit === target;
      const points = isPerfect ? numbers.length * 20 : Math.max(5, numbers.length * 5);
      
      const newSum = {
        sum: sumToSubmit,
        path: pathStr,
        numbers: numbers,
        isPerfect,
        points
      };

      const newFoundSums = [...foundSums, newSum];
      setFoundSums(newFoundSums);

      // Update stats
      const totalPoints = newFoundSums.reduce((sum, s) => sum + s.points, 0);
      const perfectHits = newFoundSums.filter(s => s.isPerfect).length;
      
      setGameStats({
        totalSums: newFoundSums.length,
        perfectHits,
        points: totalPoints
      });

      if (isPerfect) {
        showToast(`Perfect! Hit target ${target} - ${points} points!`, 'success');
      } else {
        showToast(`Sum ${sumToSubmit} recorded - ${points} points`, 'info');
      }
    }
    
    // Reset selection
    setSelectedPath([]);
    setCurrentSum(0);
  };

  // Clear current selection
  const clearSelection = () => {
    setSelectedPath([]);
    setCurrentSum(0);
  };

  // Generate new target
  const generateNewTarget = () => {
    if (isActive) {
      const { targetRange } = difficultySettings[difficulty];
      const [minTarget, maxTarget] = targetRange;
      const newTarget = Math.floor(Math.random() * (maxTarget - minTarget + 1)) + minTarget;
      setTarget(newTarget);
      showToast(`New target: ${newTarget}!`, 'info');
    }
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

  // Get cell style
  const getCellStyle = (row, col) => {
    const isSelected = selectedPath.some(p => p.row === row && p.col === col);
    const isInUsedPath = foundSums.some(sum => 
      sum.path.split(',').includes(`${row}-${col}`)
    );

    if (isSelected) {
      return 'bg-blue-500 text-white border-blue-600 shadow-lg scale-110';
    } else if (isInUsedPath) {
      return 'bg-gray-200 text-gray-600 border-gray-400';
    } else if (gameMode === 'digital' && isActive) {
      return 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-300 cursor-pointer';
    } else {
      return 'bg-white text-gray-800 border-gray-300';
    }
  };

  // Get sum status color
  const getSumStatusColor = () => {
    if (currentSum === target) {
      return 'text-green-600 bg-green-100';
    } else if (currentSum > target) {
      return 'text-red-600 bg-red-100';
    } else if (currentSum > target * 0.8) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-blue-600 bg-blue-100';
    }
  };

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
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-bold text-xl">
            🎯 Target: {target}
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            📝 Sums: {gameStats.totalSums}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
            🎯 Perfect: {gameStats.perfectHits}
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-semibold">
            🏆 Points: {gameStats.points}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isActive}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="easy">Easy (1-10, Target: 20-40)</option>
            <option value="medium">Medium (1-15, Target: 30-70)</option>
            <option value="hard">Hard (1-20, Target: 50-100)</option>
          </select>

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

          {isActive && (
            <button
              onClick={generateNewTarget}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🎯 New Target
            </button>
          )}

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
            <h3 className="text-2xl font-bold text-gray-800">🔢 Number Grid</h3>
            <div className="mt-2 text-xl font-bold text-purple-600">
              🎯 Current Target: {target}
            </div>
            {gameMode === 'digital' && (
              <p className="text-sm text-gray-600 mt-2">
                Click adjacent numbers to create sums that equal the target
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
                row.map((number, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={gameMode !== 'digital' || !isActive}
                    className={`w-12 h-12 text-lg font-bold rounded-lg border-2 transition-all ${getCellStyle(rowIndex, colIndex)}`}
                  >
                    {number}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Current Sum & Actions */}
          {gameMode === 'digital' && (
            <div className="mt-6 text-center">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Current Sum:</div>
                <div className={`text-3xl font-bold min-h-[3rem] flex items-center justify-center rounded-lg p-2 ${getSumStatusColor()}`}>
                  {currentSum || '-'}
                  {selectedPath.length > 0 && (
                    <span className="text-sm ml-2">
                      ({selectedPath.map(p => grid[p.row][p.col]).join(' + ')})
                    </span>
                  )}
                </div>
                {currentSum > 0 && (
                  <div className="text-sm mt-2">
                    {currentSum === target ? (
                      <span className="text-green-600 font-bold">🎯 Perfect Match!</span>
                    ) : currentSum > target ? (
                      <span className="text-red-600">⚠️ Over target by {currentSum - target}</span>
                    ) : (
                      <span className="text-blue-600">Need {target - currentSum} more</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => submitSum()}
                  disabled={selectedPath.length < 2 || !isActive}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Submit Sum
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

        {/* Found Sums Sidebar */}
        <div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Found Sums</h4>
            {foundSums.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sums recorded yet!</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {foundSums.map((sumData, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded border ${
                      sumData.isPerfect 
                        ? 'bg-green-100 border-green-300' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">
                        {sumData.isPerfect ? '🎯' : '📝'} {sumData.sum}
                      </span>
                      <span className="text-sm text-blue-600">{sumData.points}pts</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {sumData.numbers.join(' + ')} = {sumData.sum}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Final Score Display */}
            {!isActive && foundSums.length > 0 && (
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-800">🏆 Final Score</div>
                  <div className="text-2xl font-bold text-purple-600">{gameStats.points} points</div>
                  <div className="text-sm text-purple-700 mt-1">
                    {gameStats.totalSums} sums • {gameStats.perfectHits} perfect targets
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Accuracy: {gameStats.totalSums > 0 ? Math.round((gameStats.perfectHits / gameStats.totalSums) * 100) : 0}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 Instructions</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click adjacent numbers to create sums</li>
              <li>• Try to reach the exact target number</li>
              <li>• Perfect targets earn bonus points</li>
              <li>• Each path can only be used once</li>
              <li>• Use at least 2 numbers per sum</li>
              <li>• Click the last number again to backtrack</li>
            </ul>
          </div>

          {/* Strategy Tips */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-bold text-blue-800 mb-2">💡 Strategy Tips</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Look for combinations that add to the target</li>
              <li>• Save large numbers for when you need them</li>
              <li>• Perfect targets give 4x points!</li>
              <li>• Try different path lengths</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoggleGame;