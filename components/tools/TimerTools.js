// TimerTools.js - Exciting, Colorful Classroom Timer
import React, { useState, useEffect, useRef } from 'react';

const TimerTools = ({ showToast, students = [], timerState, setTimerState }) => {
  const [time, setTime] = useState(timerState?.time || 300);
  const [isRunning, setIsRunning] = useState(timerState?.isRunning || false);
  const [isPaused, setIsPaused] = useState(timerState?.isPaused || false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [originalTime, setOriginalTime] = useState(300);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('rainbow');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  
  const intervalRef = useRef(null);
  const confettiRef = useRef(null);

  // Timer themes with exciting colors and effects
  const themes = {
    rainbow: {
      name: 'Rainbow Magic',
      gradient: 'from-pink-400 via-purple-500 via-blue-500 via-green-500 to-yellow-400',
      bgGradient: 'from-purple-100 via-pink-50 to-blue-100',
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      icon: '🌈'
    },
    ocean: {
      name: 'Ocean Adventure',
      gradient: 'from-blue-400 via-cyan-500 to-teal-600',
      bgGradient: 'from-blue-50 via-cyan-50 to-teal-50',
      primaryColor: '#0ea5e9',
      secondaryColor: '#06b6d4',
      icon: '🌊'
    },
    sunset: {
      name: 'Sunset Vibes',
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      bgGradient: 'from-orange-50 via-red-50 to-pink-50',
      primaryColor: '#f97316',
      secondaryColor: '#ef4444',
      icon: '🌅'
    },
    forest: {
      name: 'Magical Forest',
      gradient: 'from-green-400 via-emerald-500 to-teal-600',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
      primaryColor: '#22c55e',
      secondaryColor: '#10b981',
      icon: '🌲'
    },
    galaxy: {
      name: 'Space Explorer',
      gradient: 'from-purple-600 via-indigo-600 to-blue-700',
      bgGradient: 'from-purple-100 via-indigo-50 to-blue-100',
      primaryColor: '#7c3aed',
      secondaryColor: '#4f46e5',
      icon: '🚀'
    },
    fire: {
      name: 'Fire Power',
      gradient: 'from-red-500 via-orange-500 to-yellow-500',
      bgGradient: 'from-red-50 via-orange-50 to-yellow-50',
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      icon: '🔥'
    }
  };

  const currentTheme = themes[selectedTheme];

  // Sync with persistent timer state
  useEffect(() => {
    if (timerState) {
      setTime(timerState.time || 300);
      setIsRunning(timerState.isRunning || false);
      setIsPaused(timerState.isPaused || false);
      setOriginalTime(timerState.originalTime || 300);
      setSelectedTheme(timerState.theme || 'rainbow');
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
        theme: selectedTheme,
        type: 'countdown'
      });
    }
  }, [time, isRunning, isPaused, originalTime, selectedTheme, setTimerState]);

  // Timer presets with fun names
  const presets = [
    { name: 'Quick Flash', emoji: '⚡', seconds: 30 },
    { name: 'Brain Break', emoji: '🧠', seconds: 60 },
    { name: 'Mini Mission', emoji: '🎯', seconds: 120 },
    { name: 'Focus Time', emoji: '🔥', seconds: 300 },
    { name: 'Power Hour', emoji: '💪', seconds: 600 },
    { name: 'Challenge', emoji: '🏆', seconds: 900 },
    { name: 'Epic Quest', emoji: '⚔️', seconds: 1200 },
    { name: 'Mega Mission', emoji: '🚀', seconds: 1800 }
  ];

  // Play exciting completion sound
  const playCompletionSound = () => {
    try {
      const audio = new Audio('/sounds/ding.wav');
      audio.volume = 0.8;
      audio.play().catch(() => {
        console.log('Sound not available');
      });
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Create confetti effect
  const createConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Timer completion with celebration
  const triggerCompletion = () => {
    playCompletionSound();
    createConfetti();
    setShowPulse(true);
    setTimeout(() => setShowPulse(false), 2000);
    
    if (showToast) {
      const title = customTitle || 'Timer';
      showToast(`🎉 ${title} completed! Amazing work! 🎉`, 'success');
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

  // Confetti Component
  const Confetti = () => {
    if (!showConfetti) return null;
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {['🎉', '✨', '🌟', '💫', '🎊', '🎈'][Math.floor(Math.random() * 6)]}
          </div>
        ))}
      </div>
    );
  };

  // Animated Progress Ring
  const AnimatedProgressRing = ({ size = 300, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = getProgress();
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    const getTimeColor = () => {
      if (time <= 10) return '#ef4444'; // Red for urgency
      if (time <= 60) return '#f59e0b'; // Amber for warning
      return currentTheme.primaryColor; // Theme color for normal
    };

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id={`gradient-${selectedTheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.primaryColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={currentTheme.secondaryColor} stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={`progress-gradient-${selectedTheme}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.primaryColor} />
              <stop offset="50%" stopColor={currentTheme.secondaryColor} />
              <stop offset="100%" stopColor={currentTheme.primaryColor} />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#gradient-${selectedTheme})`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={time <= 10 ? '#ef4444' : time <= 60 ? '#f59e0b' : `url(#progress-gradient-${selectedTheme})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-in-out ${time <= 10 ? 'animate-pulse' : ''}`}
            filter={time <= 10 ? 'drop-shadow(0 0 10px #ef4444)' : ''}
          />
        </svg>
        
        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`text-center ${showPulse ? 'animate-pulse' : ''}`}>
            <div className={`font-mono font-black ${
              size > 400 ? 'text-8xl' : size > 300 ? 'text-6xl' : size > 200 ? 'text-4xl' : 'text-2xl'
            } ${
              time <= 10 ? 'text-red-600 animate-bounce' : 
              time <= 60 ? 'text-amber-600' : 
              'text-transparent bg-clip-text bg-gradient-to-r ' + currentTheme.gradient
            } drop-shadow-lg`}>
              {formatTime(time)}
            </div>
            {time === 0 && (
              <div className={`${size > 300 ? 'text-4xl' : 'text-2xl'} animate-bounce mt-2`}>
                🎉 TIME'S UP! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Fullscreen Mode with Extreme Visual Appeal
  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br ${currentTheme.bgGradient} z-50 flex flex-col overflow-hidden`}>
        <Confetti />
        
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div 
                className="w-2 h-2 rounded-full opacity-30"
                style={{ backgroundColor: currentTheme.primaryColor }}
              ></div>
            </div>
          ))}
        </div>

        {/* Header with title and exit */}
        <div className="flex justify-between items-center p-8 relative z-10">
          <div className="flex-1">
            {customTitle && (
              <div className="text-center">
                <h1 className={`text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.gradient} drop-shadow-2xl animate-pulse`}>
                  {currentTheme.icon} {customTitle} {currentTheme.icon}
                </h1>
                <div className="text-2xl md:text-4xl mt-4 font-bold text-gray-700">
                  {isRunning ? (isPaused ? '⏸️ Paused' : '🔥 In Progress') : '⭐ Ready to Start!'}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsFullscreen(false)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-2xl transform hover:scale-105"
          >
            ← Exit Magic Mode
          </button>
        </div>

        {/* Main timer display */}
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className={time <= 10 ? 'animate-bounce' : ''}>
            <AnimatedProgressRing size={500} strokeWidth={20} />
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 flex justify-center space-x-8 relative z-10">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            disabled={time === 0}
            className={`px-12 py-6 rounded-2xl font-black text-2xl transition-all duration-300 transform hover:scale-110 shadow-2xl ${
              time === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isRunning 
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white' 
                  : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white animate-pulse'
            }`}
          >
            {isRunning ? (isPaused ? '▶️ RESUME' : '⏸️ PAUSE') : '🚀 START'}
          </button>
          
          <button
            onClick={stopTimer}
            className="px-12 py-6 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-2xl font-black text-2xl hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-2xl transform hover:scale-110"
          >
            ⏹️ STOP
          </button>
          
          <button
            onClick={resetTimer}
            className="px-12 py-6 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-black text-2xl hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-2xl transform hover:scale-110"
          >
            🔄 RESET
          </button>
        </div>

        {/* Completion celebration overlay */}
        {time === 0 && !isRunning && (
          <div className="fixed inset-0 bg-gradient-to-r from-green-400 to-blue-500 bg-opacity-30 animate-pulse pointer-events-none flex items-center justify-center">
            <div className="text-8xl md:text-9xl animate-bounce">
              🎉 AMAZING! 🎉
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular Mode with Enhanced Visuals
  return (
    <div className={`space-y-6 min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} p-4`}>
      <Confetti />
      
      {/* Header */}
      <div className={`text-center bg-gradient-to-r ${currentTheme.gradient} text-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-all duration-300`}>
        <h2 className="text-5xl font-black mb-4 drop-shadow-lg">
          ⏰ SUPER TIMER {currentTheme.icon}
        </h2>
        <p className="text-2xl font-bold opacity-90">
          The most exciting timer in the universe!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timer Display */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center transform hover:scale-105 transition-all duration-300">
          <div className="mb-8">
            <AnimatedProgressRing size={350} strokeWidth={16} />
          </div>

          {/* Status Message */}
          <div className="mb-6">
            <div className={`text-2xl font-bold ${
              isRunning ? (isPaused ? 'text-amber-600' : 'text-green-600 animate-pulse') : 'text-gray-600'
            }`}>
              {isRunning ? (isPaused ? '⏸️ Paused - Ready to Resume!' : '🔥 Time is Ticking!') : '⭐ Ready for Action!'}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              disabled={time === 0}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-110 shadow-lg ${
                time === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : isRunning 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white' 
                    : 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white animate-pulse'
              }`}
            >
              {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '🚀 Start'}
            </button>
            
            <button
              onClick={stopTimer}
              className="px-8 py-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-2xl font-bold text-lg hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg transform hover:scale-110"
            >
              ⏹️ Stop
            </button>
            
            <button
              onClick={resetTimer}
              className="px-8 py-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-2xl font-bold text-lg hover:from-purple-500 hover:to-purple-600 transition-all duration-300 shadow-lg transform hover:scale-110"
            >
              🔄 Reset
            </button>
          </div>

          <button
            onClick={() => setIsFullscreen(true)}
            className={`w-full px-8 py-4 bg-gradient-to-r ${currentTheme.gradient} text-white rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl animate-pulse`}
          >
            ✨ MAGIC FULLSCREEN MODE ✨
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          {/* Theme Selector */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">🎨 Choose Your Magic Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={`p-4 rounded-2xl font-bold text-center transition-all duration-300 transform hover:scale-105 ${
                    selectedTheme === key 
                      ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg scale-105` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{theme.icon}</div>
                  <div className="text-sm">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Title */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📝 Activity Name</h3>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Brain Break, Reading Time, Math Challenge..."
              className="w-full px-4 py-3 border-2 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 text-lg font-semibold text-center"
            />
          </div>

          {/* Quick Presets */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">⚡ Quick Missions</h3>
            <div className="grid grid-cols-2 gap-3">
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setCustomTime(Math.floor(preset.seconds / 60), preset.seconds % 60)}
                  className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 rounded-2xl hover:from-blue-200 hover:to-purple-200 transition-all duration-300 font-bold text-sm transform hover:scale-105 shadow-md"
                >
                  <div className="text-lg mb-1">{preset.emoji}</div>
                  <div>{preset.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">⏱️ Custom Mission Time</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={Math.floor(originalTime / 60)}
                  onChange={(e) => setCustomTime(parseInt(e.target.value || 0), originalTime % 60)}
                  className="w-full px-3 py-3 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 text-lg font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 text-center">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={originalTime % 60}
                  onChange={(e) => setCustomTime(Math.floor(originalTime / 60), parseInt(e.target.value || 0))}
                  className="w-full px-3 py-3 border-2 border-blue-300 rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 text-lg font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📊 Mission Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">⏰ Time Left:</span>
                <span className="font-mono font-black text-xl text-gray-800">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">📈 Progress:</span>
                <span className="font-black text-xl text-gray-800">{Math.round(getProgress())}% Complete</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">🎯 Status:</span>
                <span className={`font-black text-lg ${
                  isRunning ? (isPaused ? 'text-amber-600' : 'text-green-600') : 'text-gray-600'
                }`}>
                  {isRunning ? (isPaused ? '⏸️ Paused' : '🔥 Active') : '⭐ Ready'}
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