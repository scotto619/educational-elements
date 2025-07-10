// HundredsBoard.js - Interactive 100 Board Tool for Mathematics
import React, { useState, useCallback } from 'react';

const HundredsBoard = ({ showToast }) => {
  const [cellStates, setCellStates] = useState({});
  const [isAllHidden, setIsAllHidden] = useState(false);
  const [boardRange, setBoardRange] = useState({ start: 1, end: 100 });
  const [customMultiple, setCustomMultiple] = useState('');

  // Generate numbers array based on range
  const generateNumbers = useCallback(() => {
    const numbers = [];
    for (let i = boardRange.start; i <= boardRange.end; i++) {
      numbers.push(i);
    }
    return numbers;
  }, [boardRange]);

  const numbers = generateNumbers();
  const gridSize = Math.ceil(Math.sqrt(numbers.length));

  // Check if number is prime
  const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  // Handle cell click
  const handleCellClick = (num, isShiftClick) => {
    setCellStates(prev => {
      const current = prev[num] || {};
      if (isShiftClick) {
        return {
          ...prev,
          [num]: { ...current, hidden: !current.hidden }
        };
      } else {
        return {
          ...prev,
          [num]: { ...current, highlighted: !current.highlighted }
        };
      }
    });
  };

  // Clear all highlights and effects
  const clearHighlights = () => {
    setCellStates(prev => {
      const newStates = {};
      Object.keys(prev).forEach(num => {
        if (prev[num].hidden) {
          newStates[num] = { hidden: true };
        }
      });
      return newStates;
    });
    showToast('Highlights cleared!');
  };

  // Highlight multiples
  const highlightMultiples = (multiplier) => {
    if (!multiplier || multiplier <= 0) return;
    
    setCellStates(prev => {
      const newStates = { ...prev };
      numbers.forEach(num => {
        if (num % multiplier === 0) {
          newStates[num] = { 
            ...newStates[num], 
            highlighted: true, 
            multiple: true 
          };
        } else {
          const current = newStates[num] || {};
          delete current.highlighted;
          delete current.multiple;
          delete current.prime;
          if (Object.keys(current).length === 0) {
            delete newStates[num];
          } else {
            newStates[num] = current;
          }
        }
      });
      return newStates;
    });
    showToast(`Highlighted multiples of ${multiplier}!`);
  };

  // Highlight prime numbers
  const highlightPrimes = () => {
    setCellStates(prev => {
      const newStates = { ...prev };
      numbers.forEach(num => {
        if (isPrime(num)) {
          newStates[num] = { 
            ...newStates[num], 
            prime: true 
          };
        } else {
          const current = newStates[num] || {};
          delete current.prime;
          delete current.highlighted;
          delete current.multiple;
          if (Object.keys(current).length === 0) {
            delete newStates[num];
          } else {
            newStates[num] = current;
          }
        }
      });
      return newStates;
    });
    showToast('Prime numbers highlighted!');
  };

  // Toggle hide/show all
  const toggleHideAll = () => {
    const newHiddenState = !isAllHidden;
    setIsAllHidden(newHiddenState);
    
    setCellStates(prev => {
      const newStates = {};
      numbers.forEach(num => {
        const current = prev[num] || {};
        if (newHiddenState) {
          newStates[num] = { ...current, hidden: true };
        } else {
          delete current.hidden;
          if (Object.keys(current).length === 0) {
            // Don't add empty objects
          } else {
            newStates[num] = current;
          }
        }
      });
      return newStates;
    });
    
    showToast(newHiddenState ? 'All numbers hidden!' : 'All numbers revealed!');
  };

  // Highlight even numbers
  const highlightEvens = () => {
    setCellStates(prev => {
      const newStates = { ...prev };
      numbers.forEach(num => {
        if (num % 2 === 0) {
          newStates[num] = { 
            ...newStates[num], 
            highlighted: true, 
            even: true 
          };
        } else {
          const current = newStates[num] || {};
          delete current.highlighted;
          delete current.even;
          delete current.odd;
          delete current.prime;
          delete current.multiple;
          if (Object.keys(current).length === 0) {
            delete newStates[num];
          } else {
            newStates[num] = current;
          }
        }
      });
      return newStates;
    });
    showToast('Even numbers highlighted!');
  };

  // Highlight odd numbers
  const highlightOdds = () => {
    setCellStates(prev => {
      const newStates = { ...prev };
      numbers.forEach(num => {
        if (num % 2 === 1) {
          newStates[num] = { 
            ...newStates[num], 
            highlighted: true, 
            odd: true 
          };
        } else {
          const current = newStates[num] || {};
          delete current.highlighted;
          delete current.odd;
          delete current.even;
          delete current.prime;
          delete current.multiple;
          if (Object.keys(current).length === 0) {
            delete newStates[num];
          } else {
            newStates[num] = current;
          }
        }
      });
      return newStates;
    });
    showToast('Odd numbers highlighted!');
  };

  // Handle custom multiple input
  const handleCustomMultiple = () => {
    const num = parseInt(customMultiple);
    if (num && num > 0 && num <= 100) {
      highlightMultiples(num);
      setCustomMultiple('');
    } else {
      showToast('Please enter a valid number between 1 and 100');
    }
  };

  // Change board range
  const setBoardTo50 = () => {
    setBoardRange({ start: 1, end: 50 });
    setCellStates({});
    setIsAllHidden(false);
    showToast('Board set to 1-50!');
  };

  const setBoardTo100 = () => {
    setBoardRange({ start: 1, end: 100 });
    setCellStates({});
    setIsAllHidden(false);
    showToast('Board set to 1-100!');
  };

  const setBoardTo200 = () => {
    setBoardRange({ start: 1, end: 200 });
    setCellStates({});
    setIsAllHidden(false);
    showToast('Board set to 1-200!');
  };

  // Get cell style classes
  const getCellClasses = (num) => {
    const state = cellStates[num] || {};
    let classes = 'cell';
    
    if (state.hidden) {
      classes += ' hidden';
    } else if (state.prime) {
      classes += ' prime';
    } else if (state.highlighted) {
      if (state.even) {
        classes += ' even';
      } else if (state.odd) {
        classes += ' odd';
      } else {
        classes += ' highlighted';
      }
    }
    
    return classes;
  };

  if (numbers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔢</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Numbers to Display</h2>
        <p className="text-gray-600">
          Please check your board range settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔢 Interactive Number Board</h2>
        <p className="text-gray-600">Explore patterns, multiples, and prime numbers</p>
        <p className="text-sm text-gray-500 mt-2">
          Click to highlight • Shift+Click to hide • Current range: {boardRange.start}-{boardRange.end}
        </p>
      </div>

      {/* Board Range Controls */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Board Size</h3>
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={setBoardTo50}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              boardRange.end === 50 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            1-50 Board
          </button>
          <button
            onClick={setBoardTo100}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              boardRange.end === 100 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            1-100 Board
          </button>
          <button
            onClick={setBoardTo200}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              boardRange.end === 200 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            1-200 Board
          </button>
        </div>
      </div>

      {/* Number Board */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div 
          className="number-board"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(gridSize, 10)}, 1fr)`,
            gap: '4px',
            maxHeight: '70vh',
            overflow: 'auto'
          }}
        >
          {numbers.map(num => (
            <div
              key={num}
              className={getCellClasses(num)}
              onClick={(e) => handleCellClick(num, e.shiftKey)}
              style={{
                aspectRatio: '1',
                minHeight: '40px'
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Pattern Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Number Patterns</h3>
          <div className="flex justify-center gap-2 flex-wrap mb-4">
            <button
              onClick={highlightPrimes}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-semibold"
            >
              Prime Numbers
            </button>
            <button
              onClick={highlightEvens}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Even Numbers
            </button>
            <button
              onClick={highlightOdds}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Odd Numbers
            </button>
          </div>
          
          {/* Custom Multiple Input */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <label className="text-sm font-semibold text-gray-700">Custom Multiple:</label>
            <input
              type="number"
              value={customMultiple}
              onChange={(e) => setCustomMultiple(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomMultiple()}
              placeholder="Enter number"
              className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm"
              min="1"
              max="200"
            />
            <button
              onClick={handleCustomMultiple}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              Highlight
            </button>
          </div>
        </div>

        {/* Multiplication Tables */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Multiplication Tables</h3>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
              <button
                key={num}
                onClick={() => highlightMultiples(num)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                ×{num}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Actions</h3>
          <div className="flex justify-center gap-3 flex-wrap">
            <button
              onClick={clearHighlights}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Clear Highlights
            </button>
            <button
              onClick={toggleHideAll}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
            >
              {isAllHidden ? 'Show All' : 'Hide All'}
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 rounded border"></div>
            <span>Highlighted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-teal-600 rounded border"></div>
            <span>Prime Numbers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded border"></div>
            <span>Even Numbers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-600 rounded border"></div>
            <span>Odd Numbers</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cell {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          border: 2px solid transparent;
          font-size: 16px;
        }

        .cell:hover {
          background: #e3f2fd;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .cell.highlighted {
          background: #ffeb3b;
          color: #000;
          box-shadow: 0 4px 10px rgba(255, 235, 59, 0.6);
          border-color: #fbc02d;
        }

        .cell.prime {
          background: #26a69a;
          color: #fff;
          box-shadow: 0 4px 10px rgba(38, 166, 154, 0.6);
          border-color: #00796b;
        }

        .cell.even {
          background: #9c27b0;
          color: #fff;
          box-shadow: 0 4px 10px rgba(156, 39, 176, 0.6);
          border-color: #7b1fa2;
        }

        .cell.odd {
          background: #ff9800;
          color: #fff;
          box-shadow: 0 4px 10px rgba(255, 152, 0, 0.6);
          border-color: #f57c00;
        }

        .cell.hidden {
          color: transparent;
          background: #cfd8dc;
          box-shadow: none;
          border-color: #90a4ae;
        }

        .number-board {
          user-select: none;
        }

        @media (max-width: 768px) {
          .cell {
            font-size: 14px;
            min-height: 35px;
          }
        }
      `}</style>
    </div>
  );
};

export default HundredsBoard;