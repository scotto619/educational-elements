// components/games/MemoryMatchGame.js - Classic Memory Card Matching Game
import React, { useState, useEffect, useCallback } from 'react';

const MemoryMatchGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [theme, setTheme] = useState('emojis');
  const [gameComplete, setGameComplete] = useState(false);
  const [perfectBonus, setPerfectBonus] = useState(false);

  // Difficulty settings
  const difficultySettings = {
    easy: { rows: 3, cols: 4, timeLimit: 120 }, // 6 pairs
    medium: { rows: 4, cols: 4, timeLimit: 180 }, // 8 pairs
    hard: { rows: 4, cols: 5, timeLimit: 240 }, // 10 pairs
    expert: { rows: 5, cols: 6, timeLimit: 300 } // 15 pairs
  };

  // Theme collections
  const themes = {
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
    animals: ['Dog', 'Cat', 'Mouse', 'Bird', 'Fish', 'Lion', 'Tiger', 'Bear', 'Fox', 'Wolf', 'Deer', 'Rabbit', 'Frog', 'Monkey', 'Elephant', 'Giraffe', 'Zebra', 'Panda', 'Koala', 'Penguin'],
    colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🩷', '🩵', '🩶', '💚', '💙', '💜', '🤍', '🖤', '🤎', '💛', '🧡'],
    shapes: ['●', '▲', '■', '♦', '★', '♠', '♥', '♣', '◆', '▼', '◄', '►', '♪', '♫', '☀', '☽', '☆', '✦', '✧', '❋'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T']
  };

  // Generate card deck
  const generateCards = useCallback(() => {
    const { rows, cols } = difficultySettings[difficulty];
    const totalCards = rows * cols;
    const pairs = totalCards / 2;
    
    // Get theme items
    const themeItems = themes[theme].slice(0, pairs);
    
    // Create pairs
    const cardPairs = [];
    themeItems.forEach((item, index) => {
      cardPairs.push(
        { id: `${index}-a`, value: item, isFlipped: false, isMatched: false },
        { id: `${index}-b`, value: item, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle cards
    for (let i = cardPairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
    }
    
    setCards(cardPairs);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setScore(0);
    setGameComplete(false);
    setPerfectBonus(false);
  }, [difficulty, theme]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && !gameComplete) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, gameComplete]);

  // Check for matches when 2 cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      
      if (cards[first].value === cards[second].value) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map((card, index) => 
            index === first || index === second 
              ? { ...card, isMatched: true, isFlipped: false }
              : card
          ));
          setMatchedCards(prev => [...prev, first, second]);
          
          // Calculate score
          const basePoints = 100;
          const timeBonus = Math.max(0, 50 - Math.floor(timer / 10)); // Less time = more bonus
          const moveBonus = Math.max(0, 25 - moves); // Fewer moves = more bonus
          const points = basePoints + timeBonus + moveBonus;
          
          setScore(prev => prev + points);
          setFlippedCards([]);
          
          showToast(`Match found! +${points} points`, 'success');
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map((card, index) => 
            index === first || index === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1200);
      }
      
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards, timer, moves, showToast]);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && matchedCards.length === cards.length) {
      setGameComplete(true);
      setIsActive(false);
      
      // Calculate final bonus
      const { timeLimit } = difficultySettings[difficulty];
      const timeRemaining = Math.max(0, timeLimit - timer);
      const efficiencyBonus = timeRemaining * 10;
      
      // Perfect game bonus (minimal moves)
      const minPossibleMoves = cards.length / 2;
      const perfectGame = moves <= minPossibleMoves + 2;
      const perfectBonus = perfectGame ? 500 : 0;
      
      if (perfectBonus > 0) {
        setPerfectBonus(true);
      }
      
      const finalBonus = efficiencyBonus + perfectBonus;
      setScore(prev => prev + finalBonus);
      
      showToast(`Game Complete! Final Score: ${score + finalBonus}`, 'success');
    }
  }, [matchedCards, cards.length, timer, moves, score, difficulty, showToast]);

  // Handle card click
  const handleCardClick = (index) => {
    if (
      gameMode !== 'digital' || 
      !isActive || 
      gameComplete ||
      cards[index].isFlipped || 
      cards[index].isMatched || 
      flippedCards.length >= 2
    ) {
      return;
    }

    // Flip the card
    setCards(prev => prev.map((card, i) => 
      i === index ? { ...card, isFlipped: true } : card
    ));
    
    setFlippedCards(prev => [...prev, index]);
  };

  // Start game
  const startGame = () => {
    setIsActive(true);
    setTimer(0);
    generateCards();
  };

  // Stop game
  const stopGame = () => {
    setIsActive(false);
  };

  // Reset game
  const resetGame = () => {
    setIsActive(false);
    generateCards();
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get card style
  const getCardStyle = (card, index) => {
    const baseStyle = "w-full h-20 rounded-lg border-2 transition-all duration-300 transform";
    
    if (card.isMatched) {
      return `${baseStyle} bg-green-100 border-green-400 text-green-800 scale-95 opacity-75`;
    } else if (card.isFlipped || flippedCards.includes(index)) {
      return `${baseStyle} bg-blue-100 border-blue-400 text-blue-800 scale-105`;
    } else {
      return `${baseStyle} bg-gray-200 border-gray-400 text-gray-600 hover:bg-gray-300 cursor-pointer hover:scale-105`;
    }
  };

  // Initialize game
  useEffect(() => {
    generateCards();
  }, [generateCards]);

  const { rows, cols, timeLimit } = difficultySettings[difficulty];
  const progress = cards.length > 0 ? (matchedCards.length / cards.length) * 100 : 0;
  const efficiency = moves > 0 ? Math.round((matchedCards.length / 2) / moves * 100) : 0;

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
            {gameComplete ? '🏆 COMPLETE' : isActive ? '🧠 THINKING' : '⏸️ PAUSED'}
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            🎯 {matchedCards.length / 2}/{cards.length / 2} pairs
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-semibold">
            👆 Moves: {moves}
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg font-semibold">
            🏆 Score: {score}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
            📊 {efficiency}% Efficiency
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
            <option value="easy">Easy (3×4)</option>
            <option value="medium">Medium (4×4)</option>
            <option value="hard">Hard (4×5)</option>
            <option value="expert">Expert (5×6)</option>
          </select>

          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={isActive}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="emojis">Emojis 🐶</option>
            <option value="animals">Animals</option>
            <option value="colors">Colors 🔴</option>
            <option value="shapes">Shapes ●</option>
            <option value="numbers">Numbers</option>
            <option value="letters">Letters</option>
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
              🎮 Start Game
            </button>
          )}

          <button
            onClick={resetGame}
            disabled={isActive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Game Progress</span>
          <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">🧠 Memory Match</h3>
              <p className="text-gray-600 mt-2">
                {gameMode === 'digital' ? 'Click cards to flip and find matching pairs' : 'Find all the matching pairs'}
              </p>
            </div>

            {/* Card Grid */}
            <div className="flex justify-center">
              <div 
                className="grid gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                style={{ 
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  maxWidth: '600px'
                }}
              >
                {cards.map((card, index) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    disabled={gameMode !== 'digital' || !isActive || gameComplete}
                    className={getCardStyle(card, index)}
                  >
                    <div className="flex items-center justify-center h-full text-lg font-bold">
                      {card.isFlipped || card.isMatched || flippedCards.includes(index) ? (
                        <span className="text-2xl">{card.value}</span>
                      ) : (
                        <span className="text-3xl">❓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Completion */}
            {gameComplete && (
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 border-2 border-green-300">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-2xl font-bold text-green-800 mb-2">Congratulations!</div>
                  <div className="text-lg text-green-700 mb-4">All pairs found!</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-gray-600">Time</div>
                      <div className="text-xl font-bold text-blue-600">{formatTime(timer)}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-gray-600">Moves</div>
                      <div className="text-xl font-bold text-purple-600">{moves}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-gray-600">Efficiency</div>
                      <div className="text-xl font-bold text-green-600">{efficiency}%</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-gray-600">Final Score</div>
                      <div className="text-xl font-bold text-yellow-600">{score}</div>
                    </div>
                  </div>
                  {perfectBonus && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                      <div className="text-lg font-bold text-yellow-800">⭐ Perfect Game Bonus!</div>
                      <div className="text-sm text-yellow-700">Exceptional memory skills!</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Current Game Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Game Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Pairs Found:</span>
                <span className="font-bold text-green-600">{matchedCards.length / 2}</span>
              </div>
              <div className="flex justify-between">
                <span>Pairs Remaining:</span>
                <span className="font-bold text-blue-600">{(cards.length - matchedCards.length) / 2}</span>
              </div>
              <div className="flex justify-between">
                <span>Moves Made:</span>
                <span className="font-bold text-purple-600">{moves}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Elapsed:</span>
                <span className="font-bold text-gray-800">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className="font-bold text-yellow-600">{efficiency}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Score:</span>
                <span className="font-bold text-xl text-gray-800">{score}</span>
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-bold text-blue-800 mb-2">🎯 Current Game</h5>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Grid: {rows}×{cols} ({cards.length / 2} pairs)</div>
              <div>Theme: {theme}</div>
              <div>Difficulty: {difficulty}</div>
              <div>Target Time: {Math.floor(timeLimit / 60)}m</div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 How to Play</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click cards to flip them over</li>
              <li>• Find matching pairs</li>
              <li>• Remember card positions</li>
              <li>• Complete in fewer moves for higher scores</li>
              <li>• Faster completion = time bonus</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-bold text-green-800 mb-2">💡 Memory Tips</h5>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Start from corners and edges</li>
              <li>• Create mental patterns</li>
              <li>• Focus on card positions</li>
              <li>• Take your time to memorize</li>
              <li>• Practice regularly to improve</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatchGame;