// components/curriculum/mathematics/NumbersBoard.js
import React, { useState, useEffect } from 'react';

const NumbersBoard = ({ showToast = () => {}, students = [] }) => {
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [highlightPattern, setHighlightPattern] = useState([]);
  const [currentPattern, setCurrentPattern] = useState('');
  const [customMultiple, setCustomMultiple] = useState('');
  const [showingSequence, setShowingSequence] = useState(false);
  const [gameMode, setGameMode] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
    setIsAnimating(true);
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

    setHighlightPattern(pattern);
    setCurrentPattern(patternName);
    
    // Animate the highlighting
    pattern.forEach((num, index) => {
      setTimeout(() => {
        setHighlightPattern(prev => [...prev.slice(0, index + 1)]);
      }, index * 50);
    });

    setTimeout(() => {
      setIsAnimating(false);
      if (pattern.length > 0) {
        showToast(`✨ Highlighted ${pattern.length} ${patternName.toLowerCase()}!`, 'success');
      }
    }, pattern.length * 50 + 500);
  };

  // Skip counting exercise
  const skipCount = (step) => {
    setShowingSequence(true);
    const sequence = [];
    for (let i = step; i <= 100; i += step) {
      sequence.push(i);
    }
    
    setHighlightPattern([]);
    sequence.forEach((num, index) => {
      setTimeout(() => {
        setHighlightPattern(prev => [...prev, num]);
        // Play sound effect would go here
      }, index * 300);
    });

    setTimeout(() => {
      setShowingSequence(false);
      showToast(`🎯 Skip counting by ${step} complete!`, 'success');
    }, sequence.length * 300 + 1000);
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
        showToast(`🎮 Find all multiples of ${randomMultiple}!`, 'info');
        break;
      case 'find-primes':
        setChallenge({
          type: 'find-primes',
          target: numbers.filter(isPrime),
          found: []
        });
        showToast('🎮 Find all prime numbers!', 'info');
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
        showToast(`🏁 Quick! Click all ${randomPattern} numbers!`, 'info');
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
          showToast(`🎉 Challenge complete! Score: ${score + 10}`, 'success');
        }
      } else if (!challenge.target.includes(number)) {
        setScore(prev => Math.max(0, prev - 5));
        showToast('❌ Try again!', 'error');
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
  };

  const getNumberStyle = (number) => {
    const isSelected = selectedNumbers.includes(number);
    const isHighlighted = highlightPattern.includes(number);
    const isChallengeTarget = challenge?.target.includes(number);
    const isChallengeFound = challenge?.found.includes(number);

    if (isChallengeFound) {
      return 'bg-green-500 text-white shadow-lg scale-110 animate-pulse';
    }
    if (isSelected) {
      return 'bg-blue-600 text-white shadow-lg scale-110';
    }
    if (isHighlighted) {
      return currentPattern.includes('Prime') ? 'bg-purple-400 text-white' :
             currentPattern.includes('Even') ? 'bg-blue-400 text-white' :
             currentPattern.includes('Odd') ? 'bg-red-400 text-white' :
             currentPattern.includes('Square') ? 'bg-yellow-400 text-black' :
             currentPattern.includes('Cube') ? 'bg-orange-400 text-white' :
             currentPattern.includes('Fibonacci') ? 'bg-green-400 text-white' :
             'bg-indigo-400 text-white';
    }
    if (gameMode && isChallengeTarget) {
      return 'bg-yellow-100 border-2 border-yellow-400 text-black hover:bg-yellow-200';
    }

    return 'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-md';
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <h4 className="font-bold text-blue-800 text-lg">Currently Showing: {currentPattern}</h4>
              <p className="text-blue-700">Numbers highlighted: {highlightPattern.length}</p>
            </div>
            <div className="text-4xl animate-bounce">✨</div>
          </div>
        </div>
      )}

      {/* Numbers Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-10 gap-1 max-w-4xl mx-auto">
          {numbers.map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className={`aspect-square flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${getNumberStyle(number)}`}
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