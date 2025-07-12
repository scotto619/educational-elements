// HundredsBoard.js - Interactive Number Board Teaching Tool (FIXED CONTRAST)
import React, { useState, useEffect } from 'react';

const HundredsBoard = ({ showToast }) => {
  const [highlightedNumbers, setHighlightedNumbers] = useState(new Set());
  const [showPrimes, setShowPrimes] = useState(false);
  const [showEvens, setShowEvens] = useState(false);
  const [showOdds, setShowOdds] = useState(false);
  const [hiddenNumbers, setHiddenNumbers] = useState(new Set());
  const [showAll, setShowAll] = useState(true);
  const [selectedRange, setSelectedRange] = useState(null);
  const [patternMode, setPatternMode] = useState(null);
  const [skipCounting, setSkipCounting] = useState(null);

  // Generate prime numbers up to 100
  const generatePrimes = (max) => {
    const primes = new Set();
    const sieve = new Array(max + 1).fill(true);
    sieve[0] = sieve[1] = false;
    
    for (let i = 2; i <= Math.sqrt(max); i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= max; j += i) {
          sieve[j] = false;
        }
      }
    }
    
    for (let i = 2; i <= max; i++) {
      if (sieve[i]) primes.add(i);
    }
    
    return primes;
  };

  const primes = generatePrimes(100);

  // Check if number is prime
  const isPrime = (num) => primes.has(num);

  // Toggle number highlight
  const toggleHighlight = (num) => {
    setHighlightedNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
      } else {
        newSet.add(num);
      }
      return newSet;
    });
  };

  // Apply skip counting pattern
  const applySkipCounting = (step) => {
    const newHighlighted = new Set();
    for (let i = step; i <= 100; i += step) {
      newHighlighted.add(i);
    }
    setHighlightedNumbers(newHighlighted);
    setSkipCounting(step);
    showToast(`Skip counting by ${step}s applied!`);
  };

  // Apply number patterns
  const applyPattern = (pattern) => {
    const newHighlighted = new Set();
    
    switch (pattern) {
      case 'squares':
        for (let i = 1; i <= 10; i++) {
          newHighlighted.add(i * i);
        }
        showToast('Perfect squares highlighted!');
        break;
      case 'triangular':
        for (let i = 1; i <= 13; i++) {
          const triangular = (i * (i + 1)) / 2;
          if (triangular <= 100) newHighlighted.add(triangular);
        }
        showToast('Triangular numbers highlighted!');
        break;
      case 'fibonacci':
        let a = 1, b = 1;
        newHighlighted.add(1);
        while (b <= 100) {
          newHighlighted.add(b);
          [a, b] = [b, a + b];
        }
        showToast('Fibonacci sequence highlighted!');
        break;
      case 'palindromes':
        for (let i = 1; i <= 100; i++) {
          const str = i.toString();
          if (str === str.split('').reverse().join('')) {
            newHighlighted.add(i);
          }
        }
        showToast('Palindromic numbers highlighted!');
        break;
    }
    
    setHighlightedNumbers(newHighlighted);
    setPatternMode(pattern);
  };

  // Range selection
  const selectRange = (start, end) => {
    const newHighlighted = new Set();
    for (let i = start; i <= end; i++) {
      newHighlighted.add(i);
    }
    setHighlightedNumbers(newHighlighted);
    showToast(`Range ${start}-${end} selected!`);
  };

  // Clear all selections
  const clearAll = () => {
    setHighlightedNumbers(new Set());
    setShowPrimes(false);
    setShowEvens(false);
    setShowOdds(false);
    setHiddenNumbers(new Set());
    setSelectedRange(null);
    setPatternMode(null);
    setSkipCounting(null);
    showToast('All selections cleared!');
  };

  // Toggle number visibility
  const toggleVisibility = (num) => {
    setHiddenNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
      } else {
        newSet.add(num);
      }
      return newSet;
    });
  };

  // Get cell class for styling
  const getCellClass = (num) => {
    let classes = ['cell'];
    
    if (hiddenNumbers.has(num)) classes.push('hidden');
    else if (highlightedNumbers.has(num)) classes.push('highlighted');
    else if (showPrimes && isPrime(num)) classes.push('prime');
    else if (showEvens && num % 2 === 0) classes.push('even');
    else if (showOdds && num % 2 === 1) classes.push('odd');
    
    return classes.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔢 Interactive Number Board</h2>
        <p className="text-gray-700">Explore number patterns, skip counting, and mathematical concepts</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Pattern Highlighting */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Number Patterns</h3>
            <div className="space-y-2">
              <button
                onClick={() => applyPattern('squares')}
                className={`w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
                  patternMode === 'squares' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Perfect Squares
              </button>
              <button
                onClick={() => applyPattern('triangular')}
                className={`w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
                  patternMode === 'triangular' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Triangular Numbers
              </button>
              <button
                onClick={() => applyPattern('fibonacci')}
                className={`w-full px-3 py-2 rounded-lg font-semibold transition-colors ${
                  patternMode === 'fibonacci' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Fibonacci Sequence
              </button>
            </div>
          </div>

          {/* Skip Counting */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Skip Counting</h3>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(step => (
                <button
                  key={step}
                  onClick={() => applySkipCounting(step)}
                  className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
                    skipCounting === step 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {step}s
                </button>
              ))}
            </div>
          </div>

          {/* Range Selection */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Quick Ranges</h3>
            <div className="space-y-2">
              <button
                onClick={() => selectRange(1, 25)}
                className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
              >
                1-25
              </button>
              <button
                onClick={() => selectRange(26, 50)}
                className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
              >
                26-50
              </button>
              <button
                onClick={() => selectRange(51, 75)}
                className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
              >
                51-75
              </button>
              <button
                onClick={() => selectRange(76, 100)}
                className="w-full px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
              >
                76-100
              </button>
            </div>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setShowPrimes(!showPrimes)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showPrimes 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {showPrimes ? 'Hide Primes' : 'Show Primes'}
            </button>
            <button
              onClick={() => setShowEvens(!showEvens)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showEvens 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {showEvens ? 'Hide Evens' : 'Show Evens'}
            </button>
            <button
              onClick={() => setShowOdds(!showOdds)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showOdds 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {showOdds ? 'Hide Odds' : 'Show Odds'}
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              {showAll ? 'Show All' : 'Hide All'}
            </button>
          </div>
        </div>
      </div>

      {/* Number Board */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="number-board grid grid-cols-10 gap-2 max-w-4xl mx-auto">
          {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
            <div
              key={num}
              onClick={() => toggleHighlight(num)}
              onDoubleClick={() => toggleVisibility(num)}
              className={getCellClass(num)}
            >
              {showAll || !hiddenNumbers.has(num) ? num : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-400 rounded border"></div>
            <span className="text-gray-800 font-semibold">Highlighted</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-teal-600 rounded border"></div>
            <span className="text-gray-800 font-semibold">Prime Numbers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded border"></div>
            <span className="text-gray-800 font-semibold">Even Numbers</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-600 rounded border"></div>
            <span className="text-gray-800 font-semibold">Odd Numbers</span>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-gray-700 text-sm">
            <strong>Click</strong> to highlight numbers • <strong>Double-click</strong> to hide/show numbers
          </p>
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
          min-height: 40px;
          color: #1f2937;
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