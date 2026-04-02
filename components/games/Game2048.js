// components/games/Game2048.js - 2048 Puzzle Game
import React, { useState, useEffect, useCallback, useRef } from 'react';

const Game2048 = () => {
  // Game constants
  const GRID_SIZE = 4;
  const INITIAL_TILES = 2;

  // Tile colors by value
  const getTileColor = (value) => {
    const colors = {
      2: 'bg-yellow-100 text-yellow-900',
      4: 'bg-yellow-200 text-yellow-900',
      8: 'bg-orange-200 text-orange-900',
      16: 'bg-orange-300 text-orange-900',
      32: 'bg-red-200 text-red-900',
      64: 'bg-red-300 text-red-900',
      128: 'bg-purple-300 text-purple-900 font-bold text-lg',
      256: 'bg-purple-400 text-white font-bold text-lg',
      512: 'bg-indigo-400 text-white font-bold text-lg',
      1024: 'bg-indigo-500 text-white font-bold',
      2048: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold',
      4096: 'bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold',
      8192: 'bg-gradient-to-br from-red-500 to-pink-600 text-white font-bold',
    };
    return colors[value] || 'bg-gray-200 text-gray-900';
  };

  // Initialize empty grid
  const createEmptyGrid = () => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  };

  // Add random tile
  const addRandomTile = (grid) => {
    const newGrid = grid.map(row => [...row]);
    const emptyTiles = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === 0) {
          emptyTiles.push({ row: i, col: j });
        }
      }
    }

    if (emptyTiles.length === 0) return newGrid;

    const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    newGrid[randomTile.row][randomTile.col] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    let grid = createEmptyGrid();
    for (let i = 0; i < INITIAL_TILES; i++) {
      grid = addRandomTile(grid);
    }
    setGrid(grid);
    setScore(0);
    setHighScore(parseInt(localStorage.getItem('2048-high-score') || '0'));
    setGameOver(false);
    setWon(false);
    setMoveCount(0);
    setShowWinModal(false);
  }, []);

  // State
  const [grid, setGrid] = useState(createEmptyGrid());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [showWinModal, setShowWinModal] = useState(false);

  // Check if any moves are possible
  const canMove = (testGrid) => {
    // Check for empty tiles
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (testGrid[i][j] === 0) return true;
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = testGrid[i][j];
        if (current === 0) continue;

        if ((j < GRID_SIZE - 1 && current === testGrid[i][j + 1]) ||
            (i < GRID_SIZE - 1 && current === testGrid[i + 1][j])) {
          return true;
        }
      }
    }
    return false;
  };

  // Move and merge tiles
  const move = useCallback((direction) => {
    if (gameOver || won) return;

    setGrid(prevGrid => {
      let newGrid = prevGrid.map(row => [...row]);
      let moved = false;
      let newScore = score;

      if (direction === 'left' || direction === 'right') {
        for (let i = 0; i < GRID_SIZE; i++) {
          let row = newGrid[i];
          if (direction === 'right') row = row.reverse();

          // Compress and merge
          row = row.filter(val => val !== 0);
          for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
              row[j] *= 2;
              newScore += row[j];
              row.splice(j + 1, 1);
            }
          }

          // Pad with zeros
          while (row.length < GRID_SIZE) row.push(0);
          if (direction === 'right') row.reverse();

          if (JSON.stringify(newGrid[i]) !== JSON.stringify(row)) moved = true;
          newGrid[i] = row;
        }
      } else {
        // Up/Down - transpose, move, transpose back
        newGrid = newGrid[0].map((_, i) => newGrid.map(row => row[i]));

        for (let i = 0; i < GRID_SIZE; i++) {
          let col = newGrid[i];
          if (direction === 'down') col = col.reverse();

          col = col.filter(val => val !== 0);
          for (let j = 0; j < col.length - 1; j++) {
            if (col[j] === col[j + 1]) {
              col[j] *= 2;
              newScore += col[j];
              col.splice(j + 1, 1);
            }
          }

          while (col.length < GRID_SIZE) col.push(0);
          if (direction === 'down') col.reverse();

          if (JSON.stringify(newGrid[i]) !== JSON.stringify(col)) moved = true;
          newGrid[i] = col;
        }

        // Transpose back
        newGrid = newGrid[0].map((_, i) => newGrid.map(row => row[i]));
      }

      if (!moved) return prevGrid;

      // Add new tile
      newGrid = addRandomTile(newGrid);
      setScore(newScore);
      setMoveCount(mc => mc + 1);

      // Check for 2048
      if (!won) {
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (newGrid[i][j] === 2048) {
              setWon(true);
              setShowWinModal(true);
              return newGrid;
            }
          }
        }
      }

      // Check for game over
      if (!canMove(newGrid)) {
        setGameOver(true);
        const finalScore = newScore;
        const currentHigh = parseInt(localStorage.getItem('2048-high-score') || '0');
        if (finalScore > currentHigh) {
          localStorage.setItem('2048-high-score', finalScore.toString());
          setHighScore(finalScore);
        }
      }

      return newGrid;
    });
  }, [score, gameOver, won]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const directionMap = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right'
        };
        move(directionMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch controls
  const handleTouchStart = useRef(null);
  const handleTouchMove = useCallback((e) => {
    if (!handleTouchStart.current) return;

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = handleTouchStart.current.x - endX;
    const diffY = handleTouchStart.current.y - endY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      move(diffX > 0 ? 'left' : 'right');
    } else {
      move(diffY > 0 ? 'up' : 'down');
    }
    handleTouchStart.current = null;
  }, [move]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
    setHighScore(parseInt(localStorage.getItem('2048-high-score') || '0'));
  }, [initializeGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <style>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .tile-enter {
          animation: slideIn 0.15s ease-out;
        }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                2048
              </h1>
              <p className="text-gray-600 text-sm mt-1">Merge tiles to reach 2048!</p>
            </div>
            <button
              onClick={initializeGame}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              New Game
            </button>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide">Score</p>
              <p className="text-3xl font-bold text-blue-600">{score.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-200">
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide">Best</p>
              <p className="text-3xl font-bold text-purple-600">{highScore.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div
          className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-4 shadow-xl mb-6 select-none"
          onTouchStart={(e) => {
            handleTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          }}
          onTouchEnd={handleTouchMove}
        >
          <div className="grid grid-cols-4 gap-3">
            {grid.map((row, i) =>
              row.map((value, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`
                    aspect-square flex items-center justify-center rounded-lg font-bold text-2xl
                    transition-all duration-100 ${getTileColor(value)}
                    ${value !== 0 ? 'tile-enter shadow-lg' : 'bg-gray-100'}
                  `}
                >
                  {value !== 0 && value}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex gap-3 md:hidden mb-6">
          <button
            onClick={() => move('up')}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            ↑
          </button>
          <button
            onClick={() => move('down')}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            ↓
          </button>
          <button
            onClick={() => move('left')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            ←
          </button>
          <button
            onClick={() => move('right')}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            →
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex gap-2">
              <span className="text-purple-600 font-bold">⌨️</span>
              <span>Use arrow keys or swipe to move tiles</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600 font-bold">🎯</span>
              <span>Merge same numbers to create larger tiles</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600 font-bold">🏆</span>
              <span>Reach 2048 to win!</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-600 font-bold">📊</span>
              <span>Moves: <span className="font-bold text-purple-600">{moveCount}</span></span>
            </li>
          </ul>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-bounce">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Game Over!</h2>
              <p className="text-gray-600 mb-6">No more moves available</p>
              <div className="space-y-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Final Score</p>
                  <p className="text-3xl font-bold text-blue-600">{score.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Best Score</p>
                  <p className="text-3xl font-bold text-purple-600">{highScore.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Total Moves</p>
                  <p className="text-3xl font-bold text-indigo-600">{moveCount}</p>
                </div>
              </div>
              <button
                onClick={initializeGame}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Win Modal */}
        {showWinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-purple-600 mb-2">You Won!</h2>
              <p className="text-gray-600 mb-6">You reached 2048! Keep playing to reach higher scores.</p>
              <div className="space-y-3 mb-6">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Current Score</p>
                  <p className="text-3xl font-bold text-purple-600">{score.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-gray-700 text-sm">Total Moves</p>
                  <p className="text-3xl font-bold text-indigo-600">{moveCount}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWinModal(false)}
                  className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Keep Playing
                </button>
                <button
                  onClick={initializeGame}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
