// components/games/MathRaceGame.js - Fast Math Problem Solving Game
import React, { useState, useEffect, useCallback } from 'react';

const MathRaceGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [problemsAttempted, setProblemsAttempted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timer, setTimer] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [operation, setOperation] = useState('mixed');
  const [answerHistory, setAnswerHistory] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);

  // Difficulty settings
  const difficultySettings = {
    easy: {
      addition: { min: 1, max: 20 },
      subtraction: { min: 1, max: 20 },
      multiplication: { min: 1, max: 5 },
      division: { min: 1, max: 5 }
    },
    medium: {
      addition: { min: 10, max: 50 },
      subtraction: { min: 10, max: 50 },
      multiplication: { min: 2, max: 12 },
      division: { min: 2, max: 12 }
    },
    hard: {
      addition: { min: 25, max: 100 },
      subtraction: { min: 25, max: 100 },
      multiplication: { min: 6, max: 25 },
      division: { min: 6, max: 25 }
    }
  };

  // Generate math problem
  const generateProblem = useCallback(() => {
    const settings = difficultySettings[difficulty];
    const operations = operation === 'mixed' ? ['addition', 'subtraction', 'multiplication', 'division'] : [operation];
    const selectedOp = operations[Math.floor(Math.random() * operations.length)];
    
    let problem = {};
    
    switch (selectedOp) {
      case 'addition':
        const addA = Math.floor(Math.random() * (settings.addition.max - settings.addition.min + 1)) + settings.addition.min;
        const addB = Math.floor(Math.random() * (settings.addition.max - settings.addition.min + 1)) + settings.addition.min;
        problem = {
          question: `${addA} + ${addB}`,
          answer: addA + addB,
          operation: 'addition'
        };
        break;
        
      case 'subtraction':
        const subA = Math.floor(Math.random() * (settings.subtraction.max - settings.subtraction.min + 1)) + settings.subtraction.min;
        const subB = Math.floor(Math.random() * subA) + settings.subtraction.min; // Ensure positive result
        problem = {
          question: `${subA} - ${subB}`,
          answer: subA - subB,
          operation: 'subtraction'
        };
        break;
        
      case 'multiplication':
        const mulA = Math.floor(Math.random() * (settings.multiplication.max - settings.multiplication.min + 1)) + settings.multiplication.min;
        const mulB = Math.floor(Math.random() * (settings.multiplication.max - settings.multiplication.min + 1)) + settings.multiplication.min;
        problem = {
          question: `${mulA} × ${mulB}`,
          answer: mulA * mulB,
          operation: 'multiplication'
        };
        break;
        
      case 'division':
        const divB = Math.floor(Math.random() * (settings.division.max - settings.division.min + 1)) + settings.division.min;
        const divAnswer = Math.floor(Math.random() * (settings.division.max - settings.division.min + 1)) + settings.division.min;
        const divA = divB * divAnswer; // Ensure clean division
        problem = {
          question: `${divA} ÷ ${divB}`,
          answer: divAnswer,
          operation: 'division'
        };
        break;
        
      default:
        problem = generateProblem(); // Fallback
    }
    
    setCurrentProblem(problem);
  }, [difficulty, operation]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      const accuracy = problemsAttempted > 0 ? Math.round((correctAnswers / problemsAttempted) * 100) : 0;
      showToast(`Time's up! Score: ${score} | Accuracy: ${accuracy}% | Best streak: ${longestStreak}`, 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, timer, score, correctAnswers, problemsAttempted, longestStreak, showToast]);

  // Handle answer submission
  const submitAnswer = () => {
    if (!currentProblem || userAnswer === '') return;
    
    const numericAnswer = parseInt(userAnswer);
    const isCorrect = numericAnswer === currentProblem.answer;
    
    setProblemsAttempted(prev => prev + 1);
    
    if (isCorrect) {
      const points = calculatePoints();
      setScore(prev => prev + points);
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > longestStreak) {
          setLongestStreak(newStreak);
        }
        return newStreak;
      });
      
      setShowFeedback({ type: 'correct', points });
      showToast(`Correct! +${points} points`, 'success');
    } else {
      setStreak(0);
      setShowFeedback({ type: 'incorrect', correctAnswer: currentProblem.answer });
      showToast(`Incorrect. Answer was ${currentProblem.answer}`, 'error');
    }
    
    // Add to history
    setAnswerHistory(prev => [...prev.slice(-9), {
      problem: currentProblem.question,
      userAnswer: numericAnswer,
      correctAnswer: currentProblem.answer,
      isCorrect,
      points: isCorrect ? calculatePoints() : 0
    }]);
    
    // Clear feedback after delay
    setTimeout(() => setShowFeedback(null), 1500);
    
    // Generate next problem
    setUserAnswer('');
    generateProblem();
  };

  // Calculate points based on streak and difficulty
  const calculatePoints = () => {
    const basePoints = {
      easy: 10,
      medium: 15,
      hard: 25
    };
    
    const streakMultiplier = Math.min(1 + (streak * 0.1), 3); // Max 3x multiplier
    return Math.round(basePoints[difficulty] * streakMultiplier);
  };

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameMode === 'digital' && isActive) {
      submitAnswer();
    }
  };

  // Start game
  const startGame = () => {
    setIsActive(true);
    setTimer(120);
    setScore(0);
    setStreak(0);
    setLongestStreak(0);
    setProblemsAttempted(0);
    setCorrectAnswers(0);
    setAnswerHistory([]);
    setUserAnswer('');
    setShowFeedback(null);
    generateProblem();
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

  // Get operation symbol
  const getOperationSymbol = (op) => {
    const symbols = {
      addition: '+',
      subtraction: '-',
      multiplication: '×',
      division: '÷'
    };
    return symbols[op] || '?';
  };

  // Initialize first problem
  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const accuracy = problemsAttempted > 0 ? Math.round((correctAnswers / problemsAttempted) * 100) : 0;
  const timeLeft = formatTime(timer);

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timer & Status */}
        <div className="flex items-center space-x-4">
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
            isActive ? (timer <= 10 ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-green-100 text-green-800') : 'bg-gray-100 text-gray-600'
          }`}>
            ⏰ {timeLeft}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {isActive ? '🏃 RACING' : '⏸️ PAUSED'}
          </div>
        </div>

        {/* Game Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            🏆 Score: {score}
          </div>
          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-semibold">
            🔥 Streak: {streak}
          </div>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
            📊 {accuracy}% Accuracy
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
            <option value="easy">Easy (1-20)</option>
            <option value="medium">Medium (up to 50)</option>
            <option value="hard">Hard (up to 100)</option>
          </select>

          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            disabled={isActive}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="mixed">Mixed Operations</option>
            <option value="addition">Addition Only</option>
            <option value="subtraction">Subtraction Only</option>
            <option value="multiplication">Multiplication Only</option>
            <option value="division">Division Only</option>
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
              🏁 Start Race
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Math Problem */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🧮 Solve the Problem</h3>
            
            {currentProblem && (
              <div className="space-y-6">
                {/* Problem Display */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-blue-200">
                  <div className="text-5xl font-bold text-gray-800 mb-4">
                    {currentProblem.question}
                  </div>
                  <div className="text-3xl font-bold text-blue-600">= ?</div>
                </div>

                {/* Answer Input */}
                {gameMode === 'digital' && (
                  <div className="space-y-4">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isActive}
                      placeholder="Enter your answer"
                      className="w-full text-3xl font-bold text-center p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
                      autoFocus
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!isActive || userAnswer === ''}
                      className="w-full px-6 py-3 bg-blue-600 text-white text-xl font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer ⚡
                    </button>
                  </div>
                )}

                {/* Feedback */}
                {showFeedback && (
                  <div className={`p-4 rounded-lg border-2 ${
                    showFeedback.type === 'correct' 
                      ? 'bg-green-100 border-green-300 text-green-800' 
                      : 'bg-red-100 border-red-300 text-red-800'
                  }`}>
                    {showFeedback.type === 'correct' ? (
                      <div>
                        <div className="text-xl font-bold">✅ Correct!</div>
                        <div>+{showFeedback.points} points</div>
                        {streak > 1 && <div className="text-sm">🔥 {streak} in a row!</div>}
                      </div>
                    ) : (
                      <div>
                        <div className="text-xl font-bold">❌ Incorrect</div>
                        <div>The answer was {showFeedback.correctAnswer}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Indicators */}
                <div className="flex justify-center space-x-6 text-lg">
                  <div className={`px-4 py-2 rounded-lg ${
                    currentProblem.operation === 'addition' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    + Addition
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    currentProblem.operation === 'subtraction' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    - Subtraction
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    currentProblem.operation === 'multiplication' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    × Multiplication
                  </div>
                  <div className={`px-4 py-2 rounded-lg ${
                    currentProblem.operation === 'division' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    ÷ Division
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats & History Sidebar */}
        <div className="space-y-6">
          {/* Current Game Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Game Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Problems Attempted:</span>
                <span className="font-bold">{problemsAttempted}</span>
              </div>
              <div className="flex justify-between">
                <span>Correct Answers:</span>
                <span className="font-bold text-green-600">{correctAnswers}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Streak:</span>
                <span className="font-bold text-purple-600">{streak}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Streak:</span>
                <span className="font-bold text-orange-600">{longestStreak}</span>
              </div>
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <span className="font-bold text-blue-600">{accuracy}%</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Score:</span>
                <span className="font-bold text-xl text-gray-800">{score}</span>
              </div>
            </div>
          </div>

          {/* Recent Problems */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📝 Recent Problems</h4>
            {answerHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No problems solved yet!</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {answerHistory.slice().reverse().map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded text-sm ${
                      item.isCorrect 
                        ? 'bg-green-100 border border-green-300' 
                        : 'bg-red-100 border border-red-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono">{item.problem}</span>
                      <span className={`font-bold ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {item.isCorrect ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Your answer: {item.userAnswer}</span>
                      {item.isCorrect ? (
                        <span className="text-green-600">+{item.points}pts</span>
                      ) : (
                        <span className="text-red-600">Answer: {item.correctAnswer}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 How to Play</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Solve math problems as quickly as possible</li>
              <li>• Build streaks for bonus points</li>
              <li>• Higher difficulty = more points</li>
              <li>• Press Enter to submit answers</li>
              <li>• Race against the clock!</li>
            </ul>
          </div>

          {/* Final Score */}
          {!isActive && problemsAttempted > 0 && (
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border-2 border-blue-300">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-800">🏁 Race Complete!</div>
                <div className="text-3xl font-bold text-blue-600 my-2">{score} points</div>
                <div className="text-sm text-blue-700">
                  {problemsAttempted} problems • {accuracy}% accuracy
                </div>
                <div className="text-sm text-blue-700">
                  Best streak: {longestStreak}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MathRaceGame;