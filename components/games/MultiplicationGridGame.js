// components/games/MultiplicationGridGame.js - COMPLETE OVERHAUL
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================
// CONSTANTS
// ============================================
const GRID_SIZES = [5, 7, 10];
const OPERATIONS = ['multiply', 'add', 'subtract'];
const OPERATION_SYMBOLS = { multiply: '×', add: '+', subtract: '−' };
const OPERATION_NAMES = { multiply: 'Multiplication', add: 'Addition', subtract: 'Subtraction' };
const OPERATION_COLORS = {
  multiply: { from: '#8B5CF6', to: '#7C3AED', bg: 'from-violet-500 to-purple-600' },
  add: { from: '#10B981', to: '#059669', bg: 'from-emerald-500 to-green-600' },
  subtract: { from: '#F59E0B', to: '#D97706', bg: 'from-amber-500 to-orange-600' }
};
const SCOREBOARD_SIZE = 10;
const CLASS_LEADERBOARD_SIZE = 10;

// ============================================
// UTILITY FUNCTIONS  
// ============================================
const getStudentIdentifier = (student) =>
  student?.id || student?.studentId || student?.uid || student?.userId || student?.email || null;

const formatTime = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
};

const formatTimeShort = (seconds) => {
  if (seconds == null || !Number.isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
};

// Generate unique random numbers
const generateUniqueNumbers = (count, min, max) => {
  const numbers = [];
  const available = [];
  for (let i = min; i <= max; i++) available.push(i);

  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    numbers.push(available.splice(idx, 1)[0]);
  }
  return numbers;
};

// Calculate answer based on operation
const calculateAnswer = (topNum, sideNum, operation) => {
  switch (operation) {
    case 'multiply': return topNum * sideNum;
    case 'add': return topNum + sideNum;
    case 'subtract': return Math.abs(topNum - sideNum);
    default: return topNum * sideNum;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
const MultiplicationGridGame = ({
  studentData,
  updateStudentData,
  showToast = () => { },
  classmates = []
}) => {
  // Settings
  const [gridSize, setGridSize] = useState(5);
  const [operation, setOperation] = useState('multiply');

  // Grid data - all computed together to prevent desync
  const [gridData, setGridData] = useState(null);

  // Game state
  const [answers, setAnswers] = useState({});
  const [gameState, setGameState] = useState('idle'); // idle, playing, complete
  const [timer, setTimer] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  // Saved progress
  const [bestTimes, setBestTimes] = useState({});
  const [scoreboard, setScoreboard] = useState([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for timer
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const inputRefs = useRef({});

  // ============================================
  // GRID GENERATION
  // ============================================
  const generateGrid = useCallback(() => {
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Generate numbers based on size and operation
    // For larger grids, we need a bigger number pool
    const maxNumber = gridSize <= 5 ? 10 : 12;
    const minNumber = operation === 'subtract' ? 2 : 1;

    // Generate top and side numbers INDEPENDENTLY
    // This allows the same numbers to appear on both axes (like a real multiplication table)
    // and ensures we always have enough numbers for any grid size
    const topNums = generateUniqueNumbers(gridSize, minNumber, maxNumber).sort((a, b) => a - b);
    const sideNums = generateUniqueNumbers(gridSize, minNumber, maxNumber).sort((a, b) => a - b);

    // Build grid cells with correct answers
    const cells = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const correctAnswer = calculateAnswer(topNums[col], sideNums[row], operation);
        cells.push({
          row,
          col,
          key: `${row}-${col}`,
          topNum: topNums[col],
          sideNum: sideNums[row],
          correctAnswer
        });
      }
    }

    // Set all state at once
    setGridData({
      topNumbers: topNums,
      sideNumbers: sideNums,
      cells,
      size: gridSize,
      operation
    });
    setAnswers({});
    setTimer(0);
    setGameState('idle');
    setShowCelebration(false);
    startTimeRef.current = null;
  }, [gridSize, operation]);

  // Generate grid on mount and when settings change
  useEffect(() => {
    generateGrid();
  }, [gridSize, operation]);

  // ============================================
  // TIMER
  // ============================================
  useEffect(() => {
    if (gameState === 'playing' && startTimeRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((Date.now() - startTimeRef.current) / 1000);
      }, 100);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return undefined;
  }, [gameState]);

  // ============================================
  // LOAD SAVED DATA
  // ============================================
  useEffect(() => {
    const saved = studentData?.gameProgress?.multiplicationGrid;
    if (!saved) {
      setBestTimes({});
      setScoreboard([]);
      setAttemptCount(0);
      return;
    }

    if (saved.bestTimes) setBestTimes(saved.bestTimes);

    if (Array.isArray(saved.scoreboard)) {
      const normalized = saved.scoreboard
        .filter(e => e && typeof e.timeSeconds === 'number')
        .sort((a, b) => a.timeSeconds - b.timeSeconds)
        .slice(0, SCOREBOARD_SIZE);
      setScoreboard(normalized);
    }

    setAttemptCount(saved.attemptCount || 0);
  }, [studentData?.gameProgress?.multiplicationGrid]);

  // ============================================
  // INPUT HANDLING
  // ============================================
  const handleInputChange = useCallback((key, value) => {
    // Start timer on first input
    if (gameState === 'idle') {
      setGameState('playing');
      startTimeRef.current = Date.now();
    }

    setAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  }, [gameState]);

  const handleKeyDown = useCallback((e, row, col) => {
    const size = gridData?.size || 5;
    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case 'ArrowUp':
        nextRow = Math.max(0, row - 1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        nextRow = Math.min(size - 1, row + 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        nextCol = Math.max(0, col - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'Tab':
        if (!e.shiftKey) {
          nextCol = col + 1;
          if (nextCol >= size) {
            nextCol = 0;
            nextRow = row + 1;
          }
          if (nextRow >= size) {
            nextRow = 0;
            nextCol = 0;
          }
          if (e.key === 'Tab') e.preventDefault();
        }
        break;
      case 'Enter':
        // Move to next empty cell
        nextCol = col + 1;
        if (nextCol >= size) {
          nextCol = 0;
          nextRow = row + 1;
        }
        e.preventDefault();
        break;
      default:
        return;
    }

    const nextKey = `${nextRow}-${nextCol}`;
    if (inputRefs.current[nextKey]) {
      inputRefs.current[nextKey].focus();
      inputRefs.current[nextKey].select();
    }
  }, [gridData]);

  // ============================================
  // CHECK COMPLETION
  // ============================================
  const completedCells = useMemo(() => {
    if (!gridData?.cells) return new Set();
    const completed = new Set();

    gridData.cells.forEach(cell => {
      const userAnswer = parseInt(answers[cell.key], 10);
      if (userAnswer === cell.correctAnswer) {
        completed.add(cell.key);
      }
    });

    return completed;
  }, [gridData, answers]);

  const progressPercent = useMemo(() => {
    if (!gridData?.cells) return 0;
    return Math.round((completedCells.size / gridData.cells.length) * 100);
  }, [completedCells, gridData]);

  // ============================================
  // GAME COMPLETION
  // ============================================
  const saveProgress = useCallback(async (newBestTimes, newScoreboard, newAttemptCount) => {
    if (!updateStudentData || !studentData) return;

    setIsSaving(true);
    try {
      await updateStudentData({
        gameProgress: {
          ...(studentData.gameProgress || {}),
          multiplicationGrid: {
            bestTimes: newBestTimes,
            scoreboard: newScoreboard.slice(0, SCOREBOARD_SIZE),
            attemptCount: newAttemptCount,
            lastPlayed: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
      showToast?.('Could not save progress. Try again later.');
    } finally {
      setIsSaving(false);
    }
  }, [updateStudentData, studentData, showToast]);

  useEffect(() => {
    if (!gridData?.cells || gameState !== 'playing') return;

    // Check if all cells are complete
    if (completedCells.size === gridData.cells.length) {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const finalTime = (Date.now() - startTimeRef.current) / 1000;
      setTimer(finalTime);
      setGameState('complete');
      setShowCelebration(true);

      // Update best times
      const timeKey = `${gridData.operation}-${gridData.size}`;
      const isNewBest = !bestTimes[timeKey] || finalTime < bestTimes[timeKey];

      const newBestTimes = { ...bestTimes };
      if (isNewBest) {
        newBestTimes[timeKey] = finalTime;
        setBestTimes(newBestTimes);
      }

      // Update scoreboard
      const newAttempt = {
        id: `attempt-${Date.now()}`,
        timeSeconds: finalTime,
        gridSize: gridData.size,
        operation: gridData.operation,
        createdAt: new Date().toISOString()
      };

      const newScoreboard = [...scoreboard, newAttempt]
        .sort((a, b) => a.timeSeconds - b.timeSeconds)
        .slice(0, SCOREBOARD_SIZE);
      setScoreboard(newScoreboard);

      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      // Save to Firebase
      saveProgress(newBestTimes, newScoreboard, newAttemptCount);

      // Show toast
      if (isNewBest) {
        showToast?.(`🎉 New Best Time! ${formatTimeShort(finalTime)} for ${gridData.size}×${gridData.size} ${OPERATION_NAMES[gridData.operation]}!`);
      } else {
        showToast?.(`✅ Completed in ${formatTimeShort(finalTime)}!`);
      }
    }
  }, [completedCells, gridData, gameState, bestTimes, scoreboard, attemptCount, saveProgress, showToast]);

  // ============================================
  // CLASS LEADERBOARD - Filter by same settings
  // ============================================
  const classLeaderboard = useMemo(() => {
    if (!classmates?.length) return [];

    const timeKey = `${operation}-${gridSize}`;
    const currentStudentId = getStudentIdentifier(studentData);

    const entries = classmates
      .map(student => {
        const id = getStudentIdentifier(student);
        if (!id) return null;

        const progress = student.gameProgress?.multiplicationGrid;
        const time = progress?.bestTimes?.[timeKey];
        if (!time || typeof time !== 'number') return null;

        const name = [student.firstName, student.lastName?.[0] ? `${student.lastName[0]}.` : null]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Student';

        return {
          id,
          name,
          time,
          attemptCount: progress?.attemptCount || 0,
          lastPlayed: progress?.lastPlayed,
          isCurrentStudent: id === currentStudentId
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time)
      .slice(0, CLASS_LEADERBOARD_SIZE);

    return entries;
  }, [classmates, operation, gridSize, studentData]);

  // ============================================
  // CURRENT BEST TIME
  // ============================================
  const currentBestTime = useMemo(() => {
    const timeKey = `${operation}-${gridSize}`;
    return bestTimes[timeKey];
  }, [bestTimes, operation, gridSize]);

  // ============================================
  // RENDER
  // ============================================
  const opColor = OPERATION_COLORS[operation];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 backdrop-blur-sm border-b border-white/10 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">🔢</span>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-white">Math Facts Grid</h1>
                  <p className="text-purple-300 text-sm">Complete the grid as fast as you can!</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-emerald-500/30">
                <div className="text-xs text-emerald-300 uppercase tracking-wide">Time</div>
                <div className="text-xl font-bold text-white font-mono">{formatTime(timer)}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-violet-500/30">
                <div className="text-xs text-violet-300 uppercase tracking-wide">Progress</div>
                <div className="text-xl font-bold text-white">{progressPercent}%</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border border-amber-500/30">
                <div className="text-xs text-amber-300 uppercase tracking-wide">Best</div>
                <div className="text-xl font-bold text-amber-400 font-mono">
                  {currentBestTime ? formatTimeShort(currentBestTime) : '--:--'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-purple-300">Size:</label>
              <div className="flex gap-1">
                {GRID_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    disabled={gameState === 'playing'}
                    className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all ${gridSize === size
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      } ${gameState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-purple-300">Operation:</label>
              <div className="flex gap-1">
                {OPERATIONS.map(op => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    disabled={gameState === 'playing'}
                    className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all flex items-center gap-1 ${operation === op
                      ? `bg-gradient-to-r ${OPERATION_COLORS[op].bg} text-white shadow-lg`
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                      } ${gameState === 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>{OPERATION_SYMBOLS[op]}</span>
                    <span className="hidden sm:inline">{OPERATION_NAMES[op]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateGrid}
              className="ml-auto px-5 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/30 transition-all active:scale-95"
            >
              {gameState === 'complete' ? '🔄 New Grid' : '🎲 New Grid'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Grid Area */}
          <div className="flex-1">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${opColor.bg} transition-all duration-300`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Grid */}
              {gridData && (
                <div className="flex justify-center overflow-x-auto pb-4">
                  <div
                    className="inline-grid gap-1 bg-black/30 p-2 rounded-xl"
                    style={{
                      gridTemplateColumns: `repeat(${gridData.size + 1}, minmax(44px, 1fr))`
                    }}
                  >
                    {/* Corner cell */}
                    <div className={`bg-gradient-to-br ${opColor.bg} text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg h-11`}>
                      {OPERATION_SYMBOLS[operation]}
                    </div>

                    {/* Top header row */}
                    {gridData.topNumbers.map((num, idx) => (
                      <div
                        key={`top-${idx}`}
                        className={`bg-gradient-to-br ${opColor.bg} text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg h-11`}
                      >
                        {num}
                      </div>
                    ))}

                    {/* Data rows */}
                    {gridData.sideNumbers.map((sideNum, row) => (
                      <React.Fragment key={`row-${row}`}>
                        {/* Side header */}
                        <div className={`bg-gradient-to-br ${opColor.bg} text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-lg h-11`}>
                          {sideNum}
                        </div>

                        {/* Input cells */}
                        {gridData.topNumbers.map((_, col) => {
                          const key = `${row}-${col}`;
                          const isComplete = completedCells.has(key);
                          const userValue = answers[key] || '';

                          return (
                            <div
                              key={key}
                              className={`rounded-lg transition-all duration-200 h-11 ${isComplete
                                ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30 scale-105'
                                : 'bg-white/90 hover:bg-white'
                                }`}
                            >
                              <input
                                ref={el => { inputRefs.current[key] = el; }}
                                type="number"
                                inputMode="numeric"
                                value={userValue}
                                onChange={e => handleInputChange(key, e.target.value)}
                                onKeyDown={e => handleKeyDown(e, row, col)}
                                disabled={isComplete || gameState === 'complete'}
                                className={`w-full h-full text-center font-bold text-lg bg-transparent outline-none rounded-lg ${isComplete ? 'text-white' : 'text-gray-800'
                                  } focus:ring-2 focus:ring-violet-400`}
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
              )}

              {/* Celebration overlay */}
              {showCelebration && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-gradient-to-br from-violet-900 to-fuchsia-900 rounded-3xl p-8 max-w-md w-full text-center border border-white/20 shadow-2xl">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h2 className="text-3xl font-black text-white mb-2">Complete!</h2>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mb-4">
                      {formatTime(timer)}
                    </p>
                    <p className="text-purple-300 mb-6">
                      {gridData?.size}×{gridData?.size} {OPERATION_NAMES[gridData?.operation || 'multiply']} Grid
                    </p>
                    {currentBestTime && timer <= currentBestTime && (
                      <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3 mb-4">
                        <span className="text-yellow-300 font-bold">🏆 New Personal Best!</span>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setShowCelebration(false);
                        generateGrid();
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 text-center text-sm text-gray-400">
                <p>Type the answer in each cell • Use Arrow Keys or Tab to navigate • Timer starts on first input</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-4">
            {/* Class Leaderboard */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-violet-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🏆</span> Class Leaderboard
                </h3>
                <span className="text-xs text-violet-300 bg-violet-500/20 px-2 py-1 rounded-full">
                  {gridSize}×{gridSize} {OPERATION_SYMBOLS[operation]}
                </span>
              </div>

              {classLeaderboard.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  No times recorded yet for this grid size and operation. Be the first!
                </p>
              ) : (
                <div className="space-y-2">
                  {classLeaderboard.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${entry.isCurrentStudent
                        ? 'bg-emerald-500/20 border border-emerald-400/40'
                        : 'bg-white/5 border border-transparent'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500 text-yellow-900' :
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                          idx === 2 ? 'bg-amber-600 text-amber-100' :
                            'bg-white/10 text-white/70'
                        }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {entry.name}
                          {entry.isCurrentStudent && <span className="text-emerald-400 text-xs ml-1">(You)</span>}
                        </div>
                        <div className="text-xs text-gray-400">
                          {entry.attemptCount} attempts
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-400">
                          {formatTimeShort(entry.time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Personal Best Times */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-violet-500/20">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Your Best Times
              </h3>

              <div className="space-y-3">
                {OPERATIONS.map(op => (
                  <div key={op} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gradient-to-r ${OPERATION_COLORS[op].bg} text-white`}>
                        {OPERATION_SYMBOLS[op]}
                      </span>
                      <span className="text-sm font-semibold text-white">{OPERATION_NAMES[op]}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {GRID_SIZES.map(size => {
                        const timeKey = `${op}-${size}`;
                        const time = bestTimes[timeKey];
                        const isCurrentSettings = op === operation && size === gridSize;

                        return (
                          <div
                            key={timeKey}
                            className={`text-center p-2 rounded-lg transition-all ${isCurrentSettings
                              ? 'bg-violet-500/30 border border-violet-400/40'
                              : 'bg-black/20'
                              }`}
                          >
                            <div className="text-xs text-gray-400">{size}×{size}</div>
                            <div className={`font-mono font-bold text-sm ${time ? 'text-emerald-400' : 'text-gray-500'}`}>
                              {time ? formatTimeShort(time) : '--:--'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-violet-500/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>📜</span> Recent Attempts
                </h3>
                <span className="text-xs text-gray-400">{attemptCount} total</span>
              </div>

              {scoreboard.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-2">
                  Complete a grid to see your history
                </p>
              ) : (
                <div className="space-y-1">
                  {scoreboard.slice(0, 5).map((entry, idx) => (
                    <div key={entry.id} className="flex items-center justify-between text-sm py-1">
                      <span className="text-gray-400">
                        {entry.gridSize}×{entry.gridSize} {OPERATION_SYMBOLS[entry.operation]}
                      </span>
                      <span className="font-mono text-emerald-400">
                        {formatTimeShort(entry.timeSeconds)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {isSaving && (
                <div className="text-xs text-amber-300 text-center mt-2">Saving...</div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-4 border border-violet-500/20">
              <h4 className="text-sm font-bold text-violet-300 mb-2">💡 Tips</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Use number keys for fast input</li>
                <li>• Arrow keys move between cells</li>
                <li>• Compete with classmates on the same settings!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplicationGridGame;