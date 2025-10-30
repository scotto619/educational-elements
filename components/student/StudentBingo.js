// components/student/StudentBingo.js - Student BINGO Card Component
import React, { useMemo, useState } from 'react';
import BINGO_CATEGORIES, {
  getBingoCategoryAnswers,
  listBingoCategories
} from '../../constants/bingoCategories';

const shuffleArray = (values) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const StudentBingo = ({ studentData, showToast, classData }) => {
  const categoryCards = useMemo(() => listBingoCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [bingoCard, setBingoCard] = useState([]);
  const [markedSquares, setMarkedSquares] = useState(new Set());
  const [hasBingo, setHasBingo] = useState(false);
  const [bingoPattern, setBingoPattern] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const selectedCategoryConfig = useMemo(
    () => (selectedCategory ? BINGO_CATEGORIES[selectedCategory] : null),
    [selectedCategory]
  );

  const generateBingoCard = (categoryKey) => {
    const rawAnswers = getBingoCategoryAnswers(categoryKey).map((answer) => `${answer}`.trim());
    const uniqueAnswers = Array.from(new Set(rawAnswers));

    if (uniqueAnswers.length === 0) {
      return Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => ({
          value: row === 2 && col === 2 ? 'FREE' : '',
          isFree: row === 2 && col === 2,
          id: `${row}-${col}`
        }))
      );
    }

    const pool = [...uniqueAnswers];
    while (pool.length < 24) {
      pool.push(uniqueAnswers[pool.length % uniqueAnswers.length]);
    }

    const selections = shuffleArray(pool).slice(0, 24);
    let selectionIndex = 0;

    const card = [];
    for (let row = 0; row < 5; row++) {
      const rowValues = [];
      for (let col = 0; col < 5; col++) {
        if (row === 2 && col === 2) {
          rowValues.push({ value: 'FREE', isFree: true, id: `${row}-${col}` });
        } else {
          const value = selections[selectionIndex] ?? '';
          rowValues.push({
            value,
            isFree: false,
            id: `${row}-${col}`
          });
          selectionIndex += 1;
        }
      }
      card.push(rowValues);
    }

    return card;
  };

  const handleCategorySelect = (categoryKey) => {
    setSelectedCategory(categoryKey);
    const newCard = generateBingoCard(categoryKey);
    setBingoCard(newCard);
    setMarkedSquares(new Set(['2-2']));
    setHasBingo(false);
    setBingoPattern(null);
    const category = BINGO_CATEGORIES[categoryKey];
    showToast(`${category.name} BINGO card generated!`, 'success');
  };

  const handleSquareClick = (rowIndex, colIndex, square) => {
    if (square.isFree) return;
    
    const squareId = `${rowIndex}-${colIndex}`;
    const newMarkedSquares = new Set(markedSquares);
    
    if (newMarkedSquares.has(squareId)) {
      newMarkedSquares.delete(squareId);
    } else {
      newMarkedSquares.add(squareId);
    }
    
    setMarkedSquares(newMarkedSquares);
    checkForBingo(newMarkedSquares);
  };

  const checkForBingo = (marked) => {
    // Check rows
    for (let row = 0; row < 5; row++) {
      let rowComplete = true;
      const rowSquares = [];
      for (let col = 0; col < 5; col++) {
        const squareId = `${row}-${col}`;
        rowSquares.push(squareId);
        if (!marked.has(squareId)) {
          rowComplete = false;
          break;
        }
      }
      if (rowComplete) {
        triggerBingo('row', row, rowSquares);
        return;
      }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
      let colComplete = true;
      const colSquares = [];
      for (let row = 0; row < 5; row++) {
        const squareId = `${row}-${col}`;
        colSquares.push(squareId);
        if (!marked.has(squareId)) {
          colComplete = false;
          break;
        }
      }
      if (colComplete) {
        triggerBingo('column', col, colSquares);
        return;
      }
    }
    
    // Check diagonal (top-left to bottom-right)
    let diag1Complete = true;
    const diag1Squares = [];
    for (let i = 0; i < 5; i++) {
      const squareId = `${i}-${i}`;
      diag1Squares.push(squareId);
      if (!marked.has(squareId)) {
        diag1Complete = false;
        break;
      }
    }
    if (diag1Complete) {
      triggerBingo('diagonal', 1, diag1Squares);
      return;
    }
    
    // Check diagonal (top-right to bottom-left)
    let diag2Complete = true;
    const diag2Squares = [];
    for (let i = 0; i < 5; i++) {
      const squareId = `${i}-${4 - i}`;
      diag2Squares.push(squareId);
      if (!marked.has(squareId)) {
        diag2Complete = false;
        break;
      }
    }
    if (diag2Complete) {
      triggerBingo('diagonal', 2, diag2Squares);
      return;
    }
    
    // No bingo
    setHasBingo(false);
    setBingoPattern(null);
  };

  const triggerBingo = (type, index, squares) => {
    setHasBingo(true);
    setBingoPattern({ type, index, squares });
    setShowCelebration(true);
    showToast('🎉 BINGO! You won!', 'success');
    
    // Play celebration for 5 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const handleReset = () => {
    if (selectedCategory) {
      const newCard = generateBingoCard(selectedCategory);
      setBingoCard(newCard);
      setMarkedSquares(new Set(['2-2'])); // Reset with center marked
      setHasBingo(false);
      setBingoPattern(null);
      showToast('New BINGO card generated!', 'info');
    }
  };

  const isSquareInPattern = (squareId) => {
    return bingoPattern && bingoPattern.squares.includes(squareId);
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎲</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Choose Your BINGO Game
          </h2>
          <p className="text-gray-600">Select the same category as your teacher</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryCards.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategorySelect(category.key)}
              className="group relative overflow-hidden rounded-2xl p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                    {category.icon}
                  </span>
                  <span className="text-xs uppercase tracking-wide bg-white/15 px-3 py-1 rounded-full font-semibold text-white">
                    {category.type === 'math' ? 'Math Focus' : 'Curriculum'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{category.name}</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  {category.description}
                </p>
                <div className="mt-4 inline-flex items-center text-white font-semibold">
                  <span>Get My Card</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Play BINGO
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-purple-600 mr-2">1.</span>
              <span>Choose the same category your teacher is using</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-purple-600 mr-2">2.</span>
              <span>You'll get a random BINGO card with 25 squares</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-purple-600 mr-2">3.</span>
              <span>Listen to your teacher call out questions and answers</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-purple-600 mr-2">4.</span>
              <span>Click on squares that match the called answers</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-purple-600 mr-2">5.</span>
              <span>Get 5 in a row (horizontal, vertical, or diagonal) to win!</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-12 text-center transform animate-bounce-in max-w-2xl">
            <div className="text-9xl mb-6 animate-spin-slow">🎉</div>
            <h2 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
              BINGO!
            </h2>
            <p className="text-3xl font-bold text-gray-800 mb-6">
              You Won!
            </p>
            <p className="text-xl text-gray-600">
              {bingoPattern?.type === 'row' && `Row ${bingoPattern.index + 1} Complete!`}
              {bingoPattern?.type === 'column' && `Column ${bingoPattern.index + 1} Complete!`}
              {bingoPattern?.type === 'diagonal' && `Diagonal Complete!`}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-6xl animate-bounce">
              <span>🏆</span>
              <span>✨</span>
              <span>🎊</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${selectedCategoryConfig.color} rounded-2xl p-6 text-white shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{selectedCategoryConfig.icon}</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{selectedCategoryConfig.name} BINGO</h2>
              <p className="text-white text-opacity-90 text-sm md:text-base">
                {studentData.firstName}'s Card • {Math.max(markedSquares.size - 1, 0)} marked
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base"
            >
              📄 New Card
            </button>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setBingoCard([]);
                setMarkedSquares(new Set());
                setHasBingo(false);
                setBingoPattern(null);
              }}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* BINGO Status */}
      {hasBingo && (
        <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-2xl p-6 text-white text-center shadow-xl animate-pulse">
          <div className="text-6xl mb-2">🏆</div>
          <h3 className="text-3xl font-bold">BINGO! You Won!</h3>
          <p className="text-xl mt-2">Tell your teacher you got BINGO!</p>
        </div>
      )}

      {/* BINGO Card */}
      <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8">
        <div className="mb-6 flex items-center justify-center space-x-4">
          <div className={`text-4xl md:text-6xl font-bold bg-gradient-to-r ${selectedCategoryConfig.color} bg-clip-text text-transparent`}>
            {'BINGO'.split('').map((letter, i) => (
              <span key={i} className="inline-block mx-1 md:mx-2">{letter}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 md:gap-3 max-w-3xl mx-auto">
          {bingoCard.map((row, rowIndex) => (
            row.map((square, colIndex) => {
              const isMarked = markedSquares.has(square.id);
              const isInPattern = isSquareInPattern(square.id);
              
              return (
                <button
                  key={square.id}
                  onClick={() => handleSquareClick(rowIndex, colIndex, square)}
                  disabled={square.isFree}
                  className={`
                    aspect-square rounded-xl font-bold text-xs md:text-sm lg:text-base
                    transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${square.isFree
                      ? `bg-gradient-to-br ${selectedCategoryConfig.color} text-white cursor-default shadow-lg`
                      : isMarked
                        ? isInPattern
                          ? 'bg-gradient-to-br from-yellow-400 to-pink-500 text-white shadow-2xl scale-110'
                          : `bg-gradient-to-br ${selectedCategoryConfig.color} text-white shadow-lg`
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-2 border-gray-300'
                    }
                    ${isMarked && !square.isFree ? 'ring-4 ring-opacity-50' : ''}
                    ${isInPattern ? 'animate-glow' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full p-1 md:p-2">
                    {isMarked && !square.isFree && <div className="text-2xl mb-1">✓</div>}
                    {square.isFree && <div className="text-2xl md:text-3xl mb-1">⭐</div>}
                    <div className={`leading-tight text-center ${square.value.length > 10 ? 'text-xs' : ''}`}>
                      {square.value}
                    </div>
                  </div>
                </button>
              );
            })
          ))}
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm md:text-base">
            👉 Click squares to mark them when your teacher calls the answer
          </p>
          <p className="text-xs md:text-sm mt-2 text-gray-500">
            Need 5 in a row to win! (horizontal, vertical, or diagonal)
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-blue-600">{Math.max(markedSquares.size - 1, 0)}</div>
          <div className="text-sm text-gray-600">Marked</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">⬜</div>
          <div className="text-2xl font-bold text-purple-600">{Math.max(25 - markedSquares.size, 0)}</div>
          <div className="text-sm text-gray-600">Remaining</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">{hasBingo ? '🏆' : '⏱️'}</div>
          <div className="text-2xl font-bold text-green-600">{hasBingo ? 'WON!' : 'Playing'}</div>
          <div className="text-sm text-gray-600">Status</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.8); }
          50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.8); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-glow { animation: glow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default StudentBingo;