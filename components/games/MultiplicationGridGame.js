// components/games/MultiplicationGridGame.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';

const MIN_GRID_SIZE = 5;
const MAX_GRID_SIZE = 10;
const GRID_SIZES = [5, 7, 10];
const OPERATIONS = ['multiply', 'add', 'subtract'];
const OPERATION_SYMBOLS = { multiply: '×', add: '+', subtract: '−' };
const OPERATION_NAMES = { multiply: 'Multiplication', add: 'Addition', subtract: 'Subtraction' };
const SCOREBOARD_SIZE = 5;
const CLASS_LEADERBOARD_SIZE = 5;

const getStudentIdentifier = (student) =>
  student?.id ||
  student?.studentId ||
  student?.uid ||
  student?.userId ||
  student?.email ||
  null;

const parseNumber = (value) => {
  if (value == null) return null;
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStoredAttempt = (attempt, index) => {
  if (!attempt) return null;

  const timeSeconds = parseNumber(attempt.timeSeconds);
  const gridSize = parseNumber(attempt.gridSize);
  
  if (!Number.isFinite(timeSeconds) || !Number.isFinite(gridSize)) {
    return null;
  }

  return {
    id: attempt.id || `attempt-${index}`,
    timeSeconds,
    gridSize: gridSize,
    operation: attempt.operation || 'multiply',
    createdAt: attempt.createdAt || attempt.timestamp || null
  };
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const MultiplicationGridGame = ({
  studentData,
  updateStudentData,
  showToast = () => {},
  classmates = []
}) => {
  // Game state
  const [currentSize, setCurrentSize] = useState(5);
  const [currentOperation, setCurrentOperation] = useState('multiply');
  const [grid, setGrid] = useState({});
  const [topNumbers, setTopNumbers] = useState([]);
  const [sideNumbers, setSideNumbers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timerInterval, setTimerIntervalState] = useState(null);
  
  // Progress tracking
  const [bestTimes, setBestTimes] = useState({});
  const [scoreboard, setScoreboard] = useState([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [completionMessage, setCompletionMessage] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Load saved data from Firebase
  useEffect(() => {
    const saved = studentData?.gameProgress?.multiplicationGrid;

    if (!saved) {
      setBestTimes({});
      setScoreboard([]);
      setAttemptCount(0);
      setLastSavedAt(null);
      return;
    }

    // Load best times
    if (saved.bestTimes) {
      setBestTimes(saved.bestTimes);
    }

    // Load scoreboard
    const normalizedAttempts = Array.isArray(saved.scoreboard)
      ? saved.scoreboard
          .map((entry, index) => normalizeStoredAttempt(entry, index))
          .filter(Boolean)
          .sort((a, b) => a.timeSeconds - b.timeSeconds)
          .slice(0, SCOREBOARD_SIZE)
      : [];

    setScoreboard(normalizedAttempts);
    setAttemptCount(saved.attemptCount || normalizedAttempts.length || 0);

    if (saved.lastPlayed) {
      const timestamp = new Date(saved.lastPlayed);
      if (!Number.isNaN(timestamp.getTime())) {
        setLastSavedAt(timestamp);
      }
    }
  }, [studentData?.gameProgress?.multiplicationGrid]);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameCompleted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setTimerIntervalState(interval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [gameStarted, gameCompleted]);

  // Generate random unique numbers
  const getRandomUniqueNumbers = useCallback((count, min, max) => {
    const numbers = [];
    const available = [];
    
    for (let i = min; i <= max; i++) {
      available.push(i);
    }
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      numbers.push(available.splice(randomIndex, 1)[0]);
    }
    
    return numbers;
  }, []);

  // Generate random numbers for grid
  const generateRandomNumbers = useCallback(() => {
    const maxNumber = currentSize === 5 ? 10 : currentSize === 7 ? 12 : 12;
    
    if (currentOperation === 'subtract') {
      const allNumbers = getRandomUniqueNumbers(currentSize * 2, 5, maxNumber);
      setTopNumbers(allNumbers.slice(0, currentSize).sort((a, b) => b - a));
      setSideNumbers(allNumbers.slice(currentSize).sort((a, b) => b - a));
    } else {
      const allNumbers = getRandomUniqueNumbers(currentSize * 2, 1, maxNumber);
      setTopNumbers(allNumbers.slice(0, currentSize));
      setSideNumbers(allNumbers.slice(currentSize));
    }
  }, [currentSize, currentOperation, getRandomUniqueNumbers]);

  // Calculate answer for a cell
  const calculateAnswer = useCallback((row, col) => {
    const topNum = topNumbers[col];
    const sideNum = sideNumbers[row];
    
    switch (currentOperation) {
      case 'multiply':
        return topNum * sideNum;
      case 'add':
        return topNum + sideNum;
      case 'subtract':
        return topNum - sideNum;
      default:
        return topNum * sideNum;
    }
  }, [topNumbers, sideNumbers, currentOperation]);

  // Initialize grid
  const initializeGrid = useCallback(() => {
    const newGrid = {};
    for (let row = 0; row < currentSize; row++) {
      for (let col = 0; col < currentSize; col++) {
        const key = `${row}-${col}`;
        newGrid[key] = {
          answer: calculateAnswer(row, col),
          completed: false,
          userAnswer: ''
        };
      }
    }
    setGrid(newGrid);
  }, [currentSize, calculateAnswer]);

  // Generate new grid
  const generateGrid = useCallback(() => {
    setTimer(0);
    setGameStarted(false);
    setGameCompleted(false);
    setShowCompletion(false);
    setCompletionMessage('');
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerIntervalState(null);
    }
    generateRandomNumbers();
  }, [generateRandomNumbers, timerInterval]);

  // Initialize grid when numbers change
  useEffect(() => {
    if (topNumbers.length > 0 && sideNumbers.length > 0) {
      initializeGrid();
    }
  }, [topNumbers, sideNumbers, initializeGrid]);

  // Initial grid generation
  useEffect(() => {
    generateRandomNumbers();
  }, []);

  // Handle input change
  const handleInputChange = useCallback((row, col, value) => {
    const key = `${row}-${col}`;
    const numValue = parseInt(value, 10);
    
    setGrid((prevGrid) => {
      const newGrid = { ...prevGrid };
      newGrid[key] = { ...newGrid[key], userAnswer: value };
      
      if (numValue === newGrid[key].answer) {
        newGrid[key].completed = true;
      }
      
      return newGrid;
    });
  }, []);

  // Start timer on first input
  const handleFirstInput = useCallback(() => {
    if (!gameStarted && !gameCompleted) {
      setGameStarted(true);
    }
  }, [gameStarted, gameCompleted]);

  // Check completion
  const checkCompletion = useCallback(() => {
    return Object.values(grid).every((cell) => cell.completed);
  }, [grid]);

  // Save progress to Firebase
  const persistProgress = useCallback(
    async (newBestTimes, newScoreboard, totalAttempts) => {
      if (!updateStudentData || !studentData) {
        return;
      }

      const sanitizedScoreboard = newScoreboard.map((entry, index) => ({
        id: entry.id || `attempt-${index}`,
        timeSeconds: entry.timeSeconds,
        gridSize: entry.gridSize,
        operation: entry.operation,
        createdAt: entry.createdAt || new Date().toISOString()
      }));

      const payload = {
        bestTimes: newBestTimes,
        scoreboard: sanitizedScoreboard,
        attemptCount: totalAttempts,
        lastPlayed: new Date().toISOString()
      };

      try {
        setIsSaving(true);
        await updateStudentData({
          gameProgress: {
            ...(studentData.gameProgress || {}),
            multiplicationGrid: payload
          }
        });
        setLastSavedAt(new Date(payload.lastPlayed));
      } catch (error) {
        console.error('Failed to save Multiplication Grid progress:', error);
        showToast('Could not save your progress. Please try again.', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [studentData, updateStudentData, showToast]
  );

  // Complete game
  const completeGame = useCallback(async () => {
    setGameCompleted(true);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerIntervalState(null);
    }
    
    const timeKey = `${currentOperation}-${currentSize}`;
    const currentTime = timer;
    const isNewBest = !bestTimes[timeKey] || currentTime < bestTimes[timeKey];
    
    // Update best times
    const newBestTimes = { ...bestTimes };
    if (isNewBest) {
      newBestTimes[timeKey] = currentTime;
    }
    setBestTimes(newBestTimes);
    
    // Update scoreboard
    const newAttempt = {
      id: `attempt-${Date.now()}`,
      timeSeconds: currentTime,
      gridSize: currentSize,
      operation: currentOperation,
      createdAt: new Date().toISOString()
    };
    
    const newScoreboard = [...scoreboard, newAttempt]
      .sort((a, b) => a.timeSeconds - b.timeSeconds)
      .slice(0, SCOREBOARD_SIZE);
    
    setScoreboard(newScoreboard);
    
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);
    
    // Save to Firebase
    await persistProgress(newBestTimes, newScoreboard, newAttemptCount);
    
    // Show completion message
    if (isNewBest) {
      setCompletionMessage(
        `🎉 Congratulations! New Best Time! 🎉\n${formatTime(currentTime)} for ${currentSize}×${currentSize} ${OPERATION_NAMES[currentOperation]}`
      );
    } else {
      setCompletionMessage(
        `✅ Grid Complete! ✅\nTime: ${formatTime(currentTime)} | Best: ${formatTime(bestTimes[timeKey])}`
      );
    }
    setShowCompletion(true);
  }, [timer, currentOperation, currentSize, bestTimes, scoreboard, attemptCount, persistProgress, timerInterval]);

  // Check for completion after each update
  useEffect(() => {
    if (gameStarted && !gameCompleted && Object.keys(grid).length > 0) {
      if (checkCompletion()) {
        completeGame();
      }
    }
  }, [grid, gameStarted, gameCompleted, checkCompletion, completeGame]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    if (Object.keys(grid).length === 0) return 0;
    const totalCells = currentSize * currentSize;
    const completedCells = Object.values(grid).filter((cell) => cell.completed).length;
    return Math.round((completedCells / totalCells) * 100);
  }, [grid, currentSize]);

  // Get current best time display
  const currentBestTime = useMemo(() => {
    const timeKey = `${currentOperation}-${currentSize}`;
    return bestTimes[timeKey] ? formatTime(bestTimes[timeKey]) : '--:--';
  }, [bestTimes, currentOperation, currentSize]);

  // Class leaderboard
  const classLeaderboard = useMemo(() => {
    if (!classmates || classmates.length === 0) {
      return [];
    }

    const entries = classmates
      .map((student) => {
        const identifier = getStudentIdentifier(student);
        if (!identifier) return null;

        const progress = student.gameProgress?.multiplicationGrid;
        if (!progress || !progress.bestTimes) return null;

        // Get best overall time
        const allTimes = Object.entries(progress.bestTimes || {})
          .map(([key, time]) => ({ key, time }))
          .sort((a, b) => a.time - b.time);

        if (allTimes.length === 0) return null;

        const bestEntry = allTimes[0];
        const [operation, size] = bestEntry.key.split('-');

        const name = [student.firstName, student.lastName ? `${student.lastName[0]}.` : null]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Student';

        return {
          id: identifier,
          name,
          bestTime: bestEntry.time,
          gridSize: parseInt(size, 10),
          operation,
          attemptCount: progress.attemptCount || 0,
          lastPlayed: progress.lastPlayed || null,
          isCurrent: studentData && identifier === getStudentIdentifier(studentData)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.bestTime - b.bestTime)
      .slice(0, CLASS_LEADERBOARD_SIZE);

    return entries;
  }, [classmates, studentData]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Game Area */}
      <div className="flex-1">
        <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              Math Facts Grid Game
            </h1>
            <p className="text-gray-600">Complete the grid as fast as you can!</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-bold text-gray-700">Grid Size</label>
              <select
                value={currentSize}
                onChange={(e) => {
                  setCurrentSize(parseInt(e.target.value, 10));
                  generateGrid();
                }}
                className="px-4 py-2 border-2 border-blue-400 rounded-lg font-bold bg-white text-gray-700"
                disabled={gameStarted && !gameCompleted}
              >
                {GRID_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}×{size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-bold text-gray-700">Operation</label>
              <select
                value={currentOperation}
                onChange={(e) => {
                  setCurrentOperation(e.target.value);
                  generateGrid();
                }}
                className="px-4 py-2 border-2 border-blue-400 rounded-lg font-bold bg-white text-gray-700"
                disabled={gameStarted && !gameCompleted}
              >
                {OPERATIONS.map((op) => (
                  <option key={op} value={op}>
                    {OPERATION_NAMES[op]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateGrid}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg transition-all hover:-translate-y-1"
              >
                New Grid
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white px-5 py-3 rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-bold">{formatTime(timer)}</div>
              <div className="text-sm opacity-90">Time</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-5 py-3 rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <div className="text-sm opacity-90">Progress</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white px-5 py-3 rounded-2xl shadow-lg text-center">
              <div className="text-2xl font-bold">{currentBestTime}</div>
              <div className="text-sm opacity-90">Best Time</div>
            </div>
          </div>

          {/* Grid */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-grid gap-1 bg-gray-200 p-3 rounded-2xl shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${currentSize + 1}, minmax(40px, 50px))`
              }}
            >
              {/* Corner cell */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md h-12">
                {OPERATION_SYMBOLS[currentOperation]}
              </div>

              {/* Top header row */}
              {topNumbers.map((num, idx) => (
                <div
                  key={`top-${idx}`}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md h-12"
                >
                  {num}
                </div>
              ))}

              {/* Data rows */}
              {sideNumbers.map((sideNum, row) => (
                <React.Fragment key={`row-${row}`}>
                  {/* Side header */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md h-12">
                    {sideNum}
                  </div>

                  {/* Input cells */}
                  {topNumbers.map((_, col) => {
                    const key = `${row}-${col}`;
                    const cell = grid[key];
                    const isCompleted = cell?.completed || false;
                    
                    return (
                      <div
                        key={key}
                        className={`rounded-lg border-2 flex items-center justify-center transition-all h-12 ${
                          isCompleted
                            ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-500 shadow-lg'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <input
                          type="number"
                          value={cell?.userAnswer || ''}
                          onChange={(e) => handleInputChange(row, col, e.target.value)}
                          onFocus={handleFirstInput}
                          disabled={isCompleted}
                          className={`w-full h-full text-center font-bold text-base bg-transparent outline-none ${
                            isCompleted ? 'text-white' : 'text-gray-700'
                          }`}
                          style={{
                            WebkitAppearance: 'none',
                            MozAppearance: 'textfield'
                          }}
                        />
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Completion Message */}
          {showCompletion && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 text-center font-bold text-lg shadow-lg animate-bounce mb-4">
              {completionMessage}
            </div>
          )}
        </div>
      </div>

      {/* Sidebars */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Personal Best Times */}
        <div className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🏆 Best Times
            </h2>
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500 mb-3">
            <span>Saved {scoreboard.length}</span>
            <span>Total {attemptCount}</span>
          </div>

          {isSaving ? (
            <div className="text-xs text-amber-300 mb-3">Saving progress...</div>
          ) : (
            lastSavedAt && (
              <div className="text-xs text-gray-500 mb-3">Updated {formatTimestamp(lastSavedAt)}</div>
            )
          )}

          {scoreboard.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Complete a grid to see your best times here!
            </p>
          ) : (
            <div className="space-y-3">
              {scoreboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    index === 0
                      ? 'bg-emerald-500/10 border-emerald-400/40 shadow-lg'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-semibold text-white">#{index + 1}</span>
                    <span className="text-gray-400">
                      {entry.gridSize}×{entry.gridSize} {OPERATION_SYMBOLS[entry.operation]}
                    </span>
                  </div>
                  <div className="text-2xl font-mono text-emerald-300">
                    {formatTime(entry.timeSeconds)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class Leaderboard */}
        <div className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🎯 Class Leaderboard
            </h2>
            {classLeaderboard.length > 0 && (
              <span className="text-xs uppercase tracking-wide text-gray-400">
                Top {classLeaderboard.length}
              </span>
            )}
          </div>

          {classLeaderboard.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Your class has no saved times yet. Be the first to set a record!
            </p>
          ) : (
            <div className="space-y-3">
              {classLeaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    entry.isCurrent
                      ? 'bg-emerald-500/10 border-emerald-400/40 shadow-lg'
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="text-lg font-bold text-emerald-300">#{index + 1}</div>
                      <div>
                        <div className="font-semibold text-white">{entry.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {entry.gridSize}×{entry.gridSize} {OPERATION_SYMBOLS[entry.operation]}
                        </div>
                        {entry.lastPlayed && (
                          <div className="text-xs uppercase tracking-wide text-gray-500 mt-2">
                            {formatTimestamp(entry.lastPlayed)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-300">
                        {formatTime(entry.bestTime)}
                      </div>
                      {entry.isCurrent && (
                        <div className="text-xs uppercase text-emerald-400 tracking-wide mt-1">
                          You
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Best Times Grid */}
        <div className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 border border-gray-800">
          <h3 className="text-lg font-bold mb-4 text-center">📊 All Personal Bests</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {OPERATIONS.map((op) =>
              GRID_SIZES.map((size) => {
                const timeKey = `${op}-${size}`;
                const time = bestTimes[timeKey];
                return (
                  <div
                    key={timeKey}
                    className="bg-gray-800 rounded-lg p-2 text-center border border-gray-700"
                  >
                    <div className="font-semibold text-gray-300">
                      {size}×{size} {OPERATION_SYMBOLS[op]}
                    </div>
                    <div className="text-emerald-400 font-mono mt-1">
                      {time ? formatTime(time) : '--:--'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplicationGridGame;