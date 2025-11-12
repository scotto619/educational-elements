// components/curriculum/mathematics/NumbersBoard.js
import React, { useEffect, useMemo, useState } from 'react';

const getRowLabel = (row) => {
  const start = (row - 1) * 10 + 1;
  return `${start}-${start + 9}`;
};

const ROW_OPTIONS = Array.from({ length: 10 }, (_, index) => ({
  row: index + 1,
  label: getRowLabel(index + 1)
}));

const COLUMN_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

const NumbersBoard = ({ showToast = () => {}, students = [] }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [highlightPattern, setHighlightPattern] = useState([]);
  const [currentPattern, setCurrentPattern] = useState('');
  const [customMultiple, setCustomMultiple] = useState('');
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [activeRow, setActiveRow] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [boardSize, setBoardSize] = useState('cozy');
  const [searchValue, setSearchValue] = useState('');
  const [foundNumber, setFoundNumber] = useState(null);

  // Generate numbers 1-100
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

  // Helper functions for number properties
  const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  };

  const isSquare = (num) => {
    const sqrt = Math.sqrt(num);
    return sqrt === Math.floor(sqrt);
  };

  const isCube = (num) => {
    const cbrt = Math.cbrt(num);
    return Math.abs(cbrt - Math.round(cbrt)) < 1e-10;
  };

  const getFactors = (num) => {
    const factors = [];
    for (let i = 1; i <= num; i++) {
      if (num % i === 0) factors.push(i);
    }
    return factors;
  };

  // Pattern highlighting functions
  const setPatternHighlight = (patternType, value = null) => {
    let pattern = [];
    let patternName = '';

    switch (patternType) {
      case 'even':
        pattern = numbers.filter(n => n % 2 === 0);
        patternName = 'Even Numbers';
        break;
      case 'odd':
        pattern = numbers.filter(n => n % 2 === 1);
        patternName = 'Odd Numbers';
        break;
      case 'primes':
        pattern = numbers.filter(isPrime);
        patternName = 'Prime Numbers';
        break;
      case 'squares':
        pattern = numbers.filter(isSquare);
        patternName = 'Perfect Squares';
        break;
      case 'cubes':
        pattern = numbers.filter(isCube);
        patternName = 'Perfect Cubes';
        break;
      case 'multiples':
        if (value && !isNaN(value) && value > 0) {
          pattern = numbers.filter(n => n % value === 0);
          patternName = `Multiples of ${value}`;
        }
        break;
      case 'fibonacci':
        const fib = [1, 1];
        while (fib[fib.length - 1] <= 100) {
          fib.push(fib[fib.length - 1] + fib[fib.length - 2]);
        }
        pattern = fib.filter(n => n <= 100);
        patternName = 'Fibonacci Sequence';
        break;
      case 'triangular':
        pattern = numbers.filter(n => {
          const discriminant = 1 + 8 * n;
          const sqrt = Math.sqrt(discriminant);
          return sqrt === Math.floor(sqrt) && (sqrt - 1) % 2 === 0;
        });
        patternName = 'Triangular Numbers';
        break;
    }

    // Set the full pattern immediately
    setHighlightPattern(pattern);
    setCurrentPattern(patternName);
    
    setActiveRow(null);
    setActiveColumn(null);
  };

  // Skip counting exercise
  const skipCount = (step) => {
    setShowingSequence(true);
    const sequence = [];
    for (let i = step; i <= 100; i += step) {
      sequence.push(i);
    }
    
    setHighlightPattern(sequence);
    setCurrentPattern(`Skip counting by ${step}`);
    setActiveRow(null);
    setActiveColumn(null);

    setTimeout(() => {
      setShowingSequence(false);
    }, 1000);
  };

  // Game modes
  const startChallenge = (type) => {
    setGameMode(type);
    setScore(0);
    setHighlightPattern([]);
    setSelectedNumbers([]);

    switch (type) {
      case 'find-multiples':
        const randomMultiple = Math.floor(Math.random() * 9) + 2;
        setChallenge({
          type: 'find-multiples',
          number: randomMultiple,
          target: numbers.filter(n => n % randomMultiple === 0),
          found: []
        });
        setCurrentPattern(`Find all multiples of ${randomMultiple}`);
        break;
      case 'find-primes':
        setChallenge({
          type: 'find-primes',
          target: numbers.filter(isPrime),
          found: []
        });
        setCurrentPattern('Find all prime numbers');
        break;
      case 'pattern-race':
        const patterns = ['even', 'odd', 'squares'];
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        setChallenge({
          type: 'pattern-race',
          pattern: randomPattern,
          target: randomPattern === 'even' ? numbers.filter(n => n % 2 === 0) :
                  randomPattern === 'odd' ? numbers.filter(n => n % 2 === 1) :
                  numbers.filter(isSquare),
          found: []
        });
        setCurrentPattern(`Find all ${randomPattern} numbers`);
        break;
    }
  };

  const handleNumberClick = (number) => {
    if (gameMode && challenge) {
      const isCorrect = challenge.target.includes(number) && !challenge.found.includes(number);
      
      if (isCorrect) {
        const newFound = [...challenge.found, number];
        setChallenge(prev => ({ ...prev, found: newFound }));
        setScore(prev => prev + 10);
        
        if (newFound.length === challenge.target.length) {
          setGameMode('');
          setCurrentPattern(`Challenge complete! Final score: ${score + 10}`);
        }
      } else if (!challenge.target.includes(number)) {
        setScore(prev => Math.max(0, prev - 5));
      }
    } else {
      // Regular selection mode
      setSelectedNumbers(prev => 
        prev.includes(number) 
          ? prev.filter(n => n !== number)
          : [...prev, number]
      );
    }
  };

  const clearAll = () => {
    setSelectedNumbers([]);
    setHighlightPattern([]);
    setCurrentPattern('');
    setGameMode('');
    setChallenge(null);
    setScore(0);
    setShowingSequence(false);
    setActiveRow(null);
    setActiveColumn(null);
    setSearchValue('');
    setFoundNumber(null);
  };

  const highlightSet = useMemo(() => new Set(highlightPattern), [highlightPattern]);
  const sizeClass = boardSize === 'focus'
    ? 'text-xl sm:text-2xl'
    : boardSize === 'comfy'
      ? 'text-lg sm:text-xl'
      : 'text-base sm:text-lg';

  const getNumberStyle = (number) => {
    const isSelected = selectedNumbers.includes(number);
    const isHighlighted = highlightSet.has(number);
    const isChallengeFound = challenge?.found.includes(number);
    const isSpotlight = foundNumber === number;

    const baseClass = `${sizeClass} font-bold rounded-lg flex items-center justify-center transition-all duration-200 border-2`;

    if (isChallengeFound) {
      return `${baseClass} bg-green-500 text-white shadow-lg scale-110 border-green-600`;
    }
    if (isSpotlight) {
      return `${baseClass} bg-amber-300 text-slate-900 shadow-lg border-amber-500 animate-pulse`;
    }
    if (isSelected) {
      return `${baseClass} bg-blue-600 text-white shadow-lg scale-105 border-blue-700`;
    }
    if (isHighlighted && !gameMode) {
      const palette = currentPattern.includes('Prime')
        ? 'bg-purple-500 text-white border-purple-600'
        : currentPattern.includes('Even')
          ? 'bg-blue-400 text-white border-blue-500'
          : currentPattern.includes('Odd')
            ? 'bg-red-400 text-white border-red-500'
            : currentPattern.includes('Square')
              ? 'bg-yellow-300 text-slate-900 border-yellow-400'
              : currentPattern.includes('Cube')
                ? 'bg-orange-400 text-white border-orange-500'
                : currentPattern.includes('Fibonacci')
                  ? 'bg-green-400 text-white border-green-500'
                  : 'bg-indigo-400 text-white border-indigo-500';
      return `${baseClass} ${palette}`;
    }

    return `${baseClass} bg-white text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-blue-200`;
  };

  const applyRowFocus = (row) => {
    const start = (row - 1) * 10 + 1;
    const values = Array.from({ length: 10 }, (_, index) => start + index);
    setHighlightPattern(values);
    setCurrentPattern(`Row ${start}-${start + 9}`);
    setActiveRow(row);
    setActiveColumn(null);
    setGameMode('');
    setChallenge(null);
  };

  const applyColumnFocus = (column) => {
    const values = Array.from({ length: 10 }, (_, index) => column + index * 10);
    setHighlightPattern(values);
    setCurrentPattern(`Column ${column}`);
    setActiveColumn(column);
    setActiveRow(null);
    setGameMode('');
    setChallenge(null);
  };

  const handleNumberSearch = () => {
    const parsed = parseInt(searchValue, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
      showToast('Enter a number between 1 and 100');
      setFoundNumber(null);
      return;
    }
    setFoundNumber(parsed);
    setCurrentPattern(`Number ${parsed}`);
    setHighlightPattern(prev => (prev.includes(parsed) ? prev : [...prev, parsed]));
    setGameMode('');
    setChallenge(null);
    setSelectedNumbers([parsed]);
  };

  useEffect(() => {
    if (!searchValue) {
      setFoundNumber(null);
    }
  }, [searchValue]);

  const boardSizeOptions = [
    { id: 'cozy', label: 'Fit board' },
    { id: 'comfy', label: 'Comfy' },
    { id: 'focus', label: 'Zoom' }
  ];

  const boardWrapperClass = boardSize === 'focus' ? 'max-w-5xl' : 'max-w-4xl';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-bold mb-3 flex items-center">
            <span className="mr-4 text-5xl">💯</span>
            Interactive Numbers Board
            <span className="ml-4 text-5xl">🔢</span>
          </h3>
          <p className="text-xl opacity-90">Explore patterns, relationships, and number properties</p>
          {gameMode && (
            <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 flex justify-between items-center">
              <span className="font-bold">🎮 Game Mode: {challenge?.type.replace('-', ' ')}</span>
              <span className="font-bold">Score: {score}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Pattern Tools */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎨</span>Pattern Explorer
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPatternHighlight('even')} className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm font-semibold">Even</button>
              <button onClick={() => setPatternHighlight('odd')} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-semibold">Odd</button>
              <button onClick={() => setPatternHighlight('primes')} className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-all text-sm font-semibold">Primes</button>
              <button onClick={() => setPatternHighlight('squares')} className="bg-yellow-500 text-black px-3 py-2 rounded-lg hover:bg-yellow-600 transition-all text-sm font-semibold">Squares</button>
              <button onClick={() => setPatternHighlight('cubes')} className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-all text-sm font-semibold">Cubes</button>
              <button onClick={() => setPatternHighlight('fibonacci')} className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all text-sm font-semibold">Fibonacci</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={customMultiple}
                onChange={(e) => setCustomMultiple(e.target.value)}
                placeholder="Enter number"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const num = parseInt(customMultiple);
                  if (num && num > 0) {
                    setPatternHighlight('multiples', num);
                    setCustomMultiple('');
                  }
                }}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all font-semibold"
              >
                Multiples
              </button>
            </div>
          </div>
        </div>

        {/* Skip Counting */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🔄</span>Skip Counting
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(step => (
              <button
                key={step}
                onClick={() => skipCount(step)}
                disabled={showingSequence}
                className="bg-teal-500 text-white px-3 py-2 rounded-lg hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {step}s
              </button>
            ))}
          </div>
          {showingSequence && (
            <div className="mt-3 text-center text-teal-600 font-semibold animate-pulse">
              ⏳ Counting in progress...
            </div>
          )}
        </div>

        {/* Focus Tools */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎯</span>Focus Tools
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Row highlights</p>
              <div className="flex flex-wrap gap-2">
                {ROW_OPTIONS.map(({ row, label }) => {
                  const isActive = activeRow === row;
                  return (
                    <button
                      key={row}
                      onClick={() => applyRowFocus(row)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                        isActive
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Column focus</p>
              <div className="flex flex-wrap gap-2">
                {COLUMN_OPTIONS.map(column => {
                  const isActive = activeColumn === column;
                  return (
                    <button
                      key={column}
                      onClick={() => applyColumnFocus(column)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold border transition-colors ${
                        isActive
                          ? 'bg-sky-500 text-white border-sky-600'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-sky-300'
                      }`}
                    >
                      Col {column}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-600">Find a number</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Enter 1-100"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleNumberSearch}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600"
                >
                  Spotlight
                </button>
              </div>
              {foundNumber && (
                <p className="text-sm text-emerald-600 font-semibold">Spotlighting {foundNumber}</p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">Board zoom</p>
              <div className="flex flex-wrap gap-2">
                {boardSizeOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setBoardSize(option.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                      boardSize === option.id
                        ? 'bg-indigo-500 text-white border-indigo-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Games & Challenges */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎮</span>Games & Challenges
          </h4>
          <div className="space-y-2">
            <button onClick={() => startChallenge('find-multiples')} className="w-full bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-all font-semibold">Find Multiples</button>
            <button onClick={() => startChallenge('find-primes')} className="w-full bg-violet-500 text-white px-3 py-2 rounded-lg hover:bg-violet-600 transition-all font-semibold">Find Primes</button>
            <button onClick={() => startChallenge('pattern-race')} className="w-full bg-cyan-500 text-white px-3 py-2 rounded-lg hover:bg-cyan-600 transition-all font-semibold">Pattern Race</button>
            <button onClick={clearAll} className="w-full bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-all font-semibold">Clear All</button>
          </div>
        </div>
      </div>

      {/* Current Pattern Info */}
      {currentPattern && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-blue-800 text-lg">{currentPattern}</h4>
              {!gameMode && (
                <p className="text-blue-700">Numbers highlighted: {highlightPattern.length}</p>
              )}
              {gameMode && challenge && (
                <div className="text-blue-700">
                  <p>Progress: {challenge.found.length} / {challenge.target.length}</p>
                  <p>Click the correct numbers to find them all!</p>
                </div>
              )}
              {(activeRow || activeColumn) && !gameMode && (
                <p className="text-sm text-blue-600 mt-2">
                  {activeRow && `Row focus: ${getRowLabel(activeRow)} `}
                  {activeColumn && `Column focus: ${activeColumn}`}
                </p>
              )}
              {foundNumber && !gameMode && (
                <p className="text-sm text-emerald-600 mt-1">Spotlight locked on {foundNumber}</p>
              )}
            </div>
            <div className="text-4xl animate-bounce">
              {gameMode ? '🎮' : '✨'}
            </div>
          </div>
        </div>
      )}

      {/* Numbers Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className={`grid grid-cols-10 gap-1 ${boardWrapperClass} mx-auto`}>
          {numbers.map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className={`aspect-square hover:scale-105 active:scale-95 ${getNumberStyle(number)}`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      {/* Number Properties Panel */}
      {selectedNumbers.length > 0 && !gameMode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-xl font-bold text-gray-800 mb-4">🔍 Selected Numbers Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedNumbers.slice(0, 3).map(num => (
              <div key={num} className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 mb-2">{num}</div>
                <div className="text-sm space-y-1">
                  <p><span className="font-semibold">Type:</span> {num % 2 === 0 ? 'Even' : 'Odd'}</p>
                  <p><span className="font-semibold">Prime:</span> {isPrime(num) ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold">Perfect Square:</span> {isSquare(num) ? 'Yes' : 'No'}</p>
                  <p><span className="font-semibold">Factors:</span> {getFactors(num).length}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedNumbers.length > 3 && (
            <p className="text-gray-600 mt-2">... and {selectedNumbers.length - 3} more selected</p>
          )}
        </div>
      )}

      {/* Teaching Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-4xl">💡</span>
          <div>
            <h4 className="font-bold text-green-800 text-lg mb-2">Teaching Tips & Activities</h4>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• Use patterns to introduce concepts like even/odd, multiples, and prime numbers</li>
              <li>• Have students predict which numbers will light up before revealing patterns</li>
              <li>• Practice skip counting with visual feedback and rhythm</li>
              <li>• Use games to make number recognition fun and competitive</li>
              <li>• Analyze selected numbers to explore mathematical properties</li>
              <li>• Create custom challenges based on your lesson objectives</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumbersBoard;