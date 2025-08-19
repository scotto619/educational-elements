// TimerTools.js - Clean, Simple Classroom Timer
import React, { useState, useEffect, useRef } from 'react';

const TimerTools = ({ showToast, students = [], timerState, setTimerState }) => {
  const [time, setTime] = useState(timerState?.time || 300);
  const [isRunning, setIsRunning] = useState(timerState?.isRunning || false);
  const [isPaused, setIsPaused] = useState(timerState?.isPaused || false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [originalTime, setOriginalTime] = useState(300);
  const [customTitle, setCustomTitle] = useState('');
  
  const intervalRef = useRef(null);

  // Sync with persistent timer state
  useEffect(() => {
    if (timerState) {
      setTime(timerState.time || 300);
      setIsRunning(timerState.isRunning || false);
      setIsPaused(timerState.isPaused || false);
      setOriginalTime(timerState.originalTime || 300);
    }
  }, [timerState]);

  // Update persistent timer state
  useEffect(() => {
    if (setTimerState) {
      setTimerState({
        isActive: isRunning || time > 0,
        time,
        originalTime,
        isRunning,
        isPaused,
        type: 'countdown'
      });
    }
  }, [time, isRunning, isPaused, originalTime, setTimerState]);

  // Timer presets
  const presets = [
    { name: '30s', seconds: 30 },
    { name: '1m', seconds: 60 },
    { name: '2m', seconds: 120 },
    { name: '5m', seconds: 300 },
    { name: '10m', seconds: 600 },
    { name: '15m', seconds: 900 },
    { name: '20m', seconds: 1200 },
    { name: '30m', seconds: 1800 }
  ];

  // Play completion sound
  const playCompletionSound = () => {
    try {
      const audio = new Audio('/sounds/ding.wav');
      audio.volume = 0.7;
      audio.play().catch(() => {
        console.log('Sound not available');
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Timer completion
  const triggerCompletion = () => {
    playCompletionSound();
    if (showToast) {
      const title = customTitle || 'Timer';
      showToast(`⏰ ${title} completed! Time's up!`, 'success');
    }
  };

  // Main timer logic
  useEffect(() => {
    if (isRunning && !isPaused && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            triggerCompletion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, time]);

  // Timer controls
  const startTimer = () => {
    if (time > 0) {
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(originalTime);
  };

  const setCustomTime = (minutes, seconds = 0) => {
    const totalSeconds = minutes * 60 + seconds;
    setTime(totalSeconds);
    setOriginalTime(totalSeconds);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const getProgress = () => {
    if (originalTime === 0) return 0;
    return ((originalTime - time) / originalTime) * 100;
  };

  // Circular Progress Component
  const CircularProgress = ({ size = 200, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress();
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={time <= 10 ? "#ef4444" : time <= 60 ? "#f59e0b" : "#10b981"}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`font-mono font-bold ${
              size > 300 ? 'text-6xl' : size > 200 ? 'text-4xl' : 'text-2xl'
            } ${
              time <= 10 ? 'text-red-600' : time <= 60 ? 'text-amber-600' : 'text-gray-800'
            }`}>
              {formatTime(time)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fullscreen Mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100 to-slate-200 z-50 flex flex-col">
        {/* Header with title and exit */}
        <div className="flex justify-between items-center p-8">
          <div className="flex-1">
            {customTitle && (
              <h1 className="text-4xl md:text-6xl font-bold text-slate-800 text-center">
                {customTitle}
              </h1>
            )}
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
          >
            Exit Fullscreen
          </button>
        </div>

        {/* Main timer display */}
        <div className="flex-1 flex items-center justify-center">
          <CircularProgress size={400} strokeWidth={12} />
        </div>

        {/* Controls */}
        <div className="p-8 flex justify-center space-x-6">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={time === 0}
            className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-200 ${
              time === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isRunning 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' 
                  : 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
            }`}
          >
            {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
          </button>
          
          <button
            onClick={stopTimer}
            className="px-8 py-4 bg-red-500 text-white rounded-lg font-bold text-xl hover:bg-red-600 transition-all duration-200 shadow-lg"
          >
            ⏹️ Stop
          </button>
          
          <button
            onClick={resetTimer}
            className="px-8 py-4 bg-slate-500 text-white rounded-lg font-bold text-xl hover:bg-slate-600 transition-all duration-200 shadow-lg"
          >
            🔄 Reset
          </button>
        </div>

        {/* Timer completion flash effect */}
        {time === 0 && !isRunning && (
          <div className="fixed inset-0 bg-green-500 bg-opacity-20 animate-pulse pointer-events-none"></div>
        )}
      </div>
    );
  }

  // Regular Mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">⏰ Classroom Timer</h2>
        <p className="text-slate-600">Simple, clean timing for classroom activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Display */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="mb-6">
            <CircularProgress size={280} strokeWidth={10} />
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3 mb-4">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              disabled={time === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                time === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isRunning 
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md' 
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
              }`}
            >
              {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
            </button>
            
            <button
              onClick={stopTimer}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md"
            >
              ⏹️ Stop
            </button>
            
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-slate-500 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all duration-200 shadow-md"
            >
              🔄 Reset
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md"
          >
            📺 Fullscreen Presentation
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* Custom Title */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">📝 Activity Title</h3>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Brain Break, Reading Time, Math Quiz..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <p className="text-sm text-slate-500 mt-2">
              This title will appear in fullscreen mode to show students what activity they're doing
            </p>
          </div>

          {/* Quick Presets */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">⚡ Quick Times</h3>
            <div className="grid grid-cols-4 gap-2">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setCustomTime(Math.floor(preset.seconds / 60), preset.seconds % 60)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-semibold text-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">⏱️ Custom Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={Math.floor(originalTime / 60)}
                  onChange={(e) => setCustomTime(parseInt(e.target.value || 0), originalTime % 60)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={originalTime % 60}
                  onChange={(e) => setCustomTime(Math.floor(originalTime / 60), parseInt(e.target.value || 0))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Time:</span>
                <span className="font-mono font-bold text-slate-800">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Progress:</span>
                <span className="font-bold text-slate-800">{Math.round(getProgress())}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className={`font-bold ${
                  isRunning ? (isPaused ? 'text-amber-600' : 'text-green-600') : 'text-slate-600'
                }`}>
                  {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerTools;