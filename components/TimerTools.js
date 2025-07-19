// TimerTools.js - Epic Enhanced Classroom Timer with Bouncing Avatars
import React, { useState, useEffect, useRef } from 'react';

const TimerTools = ({ showToast, students = [], timerState, setTimerState }) => {
  const [activeTimer, setActiveTimer] = useState(timerState?.type || 'countdown');
  const [time, setTime] = useState(timerState?.time || 300);
  const [isRunning, setIsRunning] = useState(timerState?.isRunning || false);
  const [isPaused, setIsPaused] = useState(timerState?.isPaused || false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interval timer specific
  const [currentCycle, setCurrentCycle] = useState('work'); // 'work' or 'break'
  const [workDuration, setWorkDuration] = useState(1500); // 25 minutes
  const [breakDuration, setBreakDuration] = useState(300); // 5 minutes
  const [cycleCount, setCycleCount] = useState(0);

  // Stopwatch specific
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
  // Avatar animation states
  const [bouncingAvatars, setBouncingAvatars] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Effects and sounds
  const [showVisualAlert, setShowVisualAlert] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const intervalRef = useRef(null);
  const animationRef = useRef(null);

  // Timer presets
  const presets = [
    { name: '30 sec', seconds: 30 },
    { name: '1 min', seconds: 60 },
    { name: '2 min', seconds: 120 },
    { name: '5 min', seconds: 300 },
    { name: '10 min', seconds: 600 },
    { name: '15 min', seconds: 900 },
    { name: '20 min', seconds: 1200 },
    { name: '25 min', seconds: 1500 },
    { name: '30 min', seconds: 1800 }
  ];

  // Timer themes
  const themes = [
    { id: 'default', name: 'Classic', colors: 'from-blue-500 to-blue-600', textColor: 'text-blue-600' },
    { id: 'focus', name: 'Focus Mode', colors: 'from-purple-500 to-purple-600', textColor: 'text-purple-600' },
    { id: 'energy', name: 'High Energy', colors: 'from-orange-500 to-red-500', textColor: 'text-orange-600' },
    { id: 'calm', name: 'Calm & Cool', colors: 'from-green-500 to-blue-500', textColor: 'text-green-600' },
    { id: 'party', name: 'Party Time', colors: 'from-pink-500 to-yellow-500', textColor: 'text-pink-600' }
  ];

  // Timer types
  const timerTypes = [
    {
      id: 'countdown',
      name: 'Countdown Timer',
      icon: '⏰',
      description: 'Set a specific time and count down to zero'
    },
    {
      id: 'stopwatch',
      name: 'Stopwatch',
      icon: '⏱️',
      description: 'Count up from zero to track elapsed time'
    },
    {
      id: 'interval',
      name: 'Interval Timer',
      icon: '🔄',
      description: 'Alternate between work and break periods'
    }
  ];

  // Sync with persistent timer state
  useEffect(() => {
    if (timerState) {
      setActiveTimer(timerState.type || 'countdown');
      setTime(timerState.time || 300);
      setIsRunning(timerState.isRunning || false);
      setIsPaused(timerState.isPaused || false);
    }
  }, [timerState]);

  // Update persistent timer when local state changes
  useEffect(() => {
    if (setTimerState) {
      setTimerState({
        isActive: isRunning || time > 0,
        time,
        originalTime: activeTimer === 'countdown' ? 300 : 0, // Store original time for progress bar
        isRunning,
        isPaused,
        type: activeTimer
      });
    }
  }, [time, isRunning, isPaused, activeTimer, setTimerState]);
  useEffect(() => {
    if (students.length > 0 && isFullscreen && isRunning) {
      const avatars = students.slice(0, Math.min(12, students.length)).map((student, index) => ({
        id: student.id,
        name: student.firstName,
        avatar: student.avatar,
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 200),
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        rotation: Math.random() * 360,
        scale: 0.8 + Math.random() * 0.4,
        bounce: 0
      }));
      setBouncingAvatars(avatars);
    } else {
      setBouncingAvatars([]);
    }
  }, [students, isFullscreen, isRunning]);

  // Animation loop for bouncing avatars
  useEffect(() => {
    if (bouncingAvatars.length > 0 && isRunning && !isPaused) {
      const animate = () => {
        setBouncingAvatars(prevAvatars => 
          prevAvatars.map(avatar => {
            let newX = avatar.x + avatar.vx;
            let newY = avatar.y + avatar.vy;
            let newVx = avatar.vx;
            let newVy = avatar.vy;

            // Bounce off walls
            if (newX <= 0 || newX >= window.innerWidth - 80) {
              newVx = -newVx;
              newX = Math.max(0, Math.min(window.innerWidth - 80, newX));
            }
            if (newY <= 80 || newY >= window.innerHeight - 150) {
              newVy = -newVy;
              newY = Math.max(80, Math.min(window.innerHeight - 150, newY));
            }

            return {
              ...avatar,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy,
              rotation: avatar.rotation + 2,
              bounce: Math.sin(Date.now() * 0.01 + avatar.id) * 10
            };
          })
        );
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [bouncingAvatars, isRunning, isPaused]);

  // Play timer completion sound
  const playTimerSound = () => {
    try {
      const audio = new Audio('/sounds/timer.wav');
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.log('Could not play timer sound:', error);
        // Fallback to XP sound
        const fallbackAudio = new Audio('/sounds/ding.wav');
        fallbackAudio.volume = 0.7;
        fallbackAudio.play().catch(err => console.log('Fallback audio failed:', err));
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Timer completion effects
  const triggerCompletion = () => {
    playTimerSound();
    setShowVisualAlert(true);
    setShowCelebration(true);
    
    // Show celebration effects
    setTimeout(() => {
      setShowVisualAlert(false);
    }, 3000);
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);

    if (showToast) {
      showToast('⏰ Timer Completed! Time\'s up!', 'success');
    }
  };

  // Main timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (activeTimer === 'countdown' || activeTimer === 'interval') {
          setTime(prevTime => {
            if (prevTime <= 1) {
              setIsRunning(false);
              triggerCompletion();
              
              // Handle interval cycling
              if (activeTimer === 'interval') {
                if (currentCycle === 'work') {
                  setCurrentCycle('break');
                  setTime(breakDuration);
                  setCycleCount(prev => prev + 1);
                  setTimeout(() => setIsRunning(true), 2000);
                } else {
                  setCurrentCycle('work');
                  setTime(workDuration);
                  setTimeout(() => setIsRunning(true), 2000);
                }
              }
              return 0;
            }
            return prevTime - 1;
          });
        } else if (activeTimer === 'stopwatch') {
          setStopwatchTime(prev => prev + 1);
        }
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
  }, [isRunning, isPaused, activeTimer, currentCycle, workDuration, breakDuration]);

  // Timer control functions
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    resetTimer();
  };

  const resetTimer = () => {
    if (activeTimer === 'countdown') {
      setTime(300); // Default 5 minutes
    } else if (activeTimer === 'stopwatch') {
      setStopwatchTime(0);
    } else if (activeTimer === 'interval') {
      setTime(workDuration);
      setCurrentCycle('work');
      setCycleCount(0);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    if (activeTimer === 'stopwatch') return stopwatchTime;
    return time;
  };

  const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];

  // Timer Display Component
  const TimerDisplay = ({ isLarge = false }) => {
    const timeValue = getCurrentTime();
    const displayTime = formatTime(timeValue);
    
    return (
      <div className={`text-center ${isLarge ? 'mb-8' : 'mb-4'}`}>
        <div className={`${isLarge ? 'text-9xl' : 'text-6xl'} font-bold ${currentThemeData.textColor} mb-4 font-mono tracking-wider drop-shadow-lg`}>
          {displayTime}
        </div>
        
        {activeTimer === 'interval' && (
          <div className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-bold mb-2`}>
            <span className={`px-6 py-2 rounded-full ${
              currentCycle === 'work' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentCycle === 'work' ? '💼 Work Time' : '☕ Break Time'}
            </span>
          </div>
        )}
        
        {activeTimer === 'interval' && (
          <div className={`${isLarge ? 'text-2xl' : 'text-lg'} text-gray-600`}>
            Cycle {cycleCount + 1}
          </div>
        )}
      </div>
    );
  };

  // Celebration effects
  const CelebrationEffects = () => (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Confetti */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            fontSize: '2rem'
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '⭐'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className={`fixed inset-0 bg-gradient-to-br ${currentThemeData.colors} text-white z-50 flex flex-col overflow-hidden`}>
        {/* Bouncing Avatars */}
        {bouncingAvatars.map(avatar => (
          <div
            key={avatar.id}
            className="absolute transition-all duration-75 pointer-events-none"
            style={{
              left: `${avatar.x}px`,
              top: `${avatar.y + avatar.bounce}px`,
              transform: `rotate(${avatar.rotation}deg) scale(${avatar.scale})`,
              zIndex: 10
            }}
          >
            {avatar.avatar ? (
              <div className="relative">
                <img
                  src={avatar.avatar}
                  alt={avatar.name}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                  {avatar.name}
                </div>
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shadow-lg">
                <span className="text-2xl">👤</span>
              </div>
            )}
          </div>
        ))}

        {/* Timer Display */}
        <div className="flex-1 flex items-center justify-center relative z-20">
          <div className="text-center">
            <TimerDisplay isLarge={true} />
            
            {/* Progress Bar */}
            {activeTimer === 'countdown' && (
              <div className="w-96 h-4 bg-white bg-opacity-30 rounded-full overflow-hidden mx-auto mb-8">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ 
                    width: `${((300 - time) / 300) * 100}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Fullscreen Controls */}
        <div className="p-8 flex justify-center space-x-6 relative z-20">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`px-12 py-6 rounded-2xl font-bold text-3xl shadow-2xl transition-all duration-200 transform hover:scale-105 ${
              isRunning 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' 
                : 'bg-green-500 hover:bg-green-600 text-green-900'
            }`}
          >
            {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
          </button>
          
          <button
            onClick={stopTimer}
            className="px-12 py-6 bg-red-500 text-red-900 rounded-2xl font-bold text-3xl hover:bg-red-600 transition-all duration-200 shadow-2xl transform hover:scale-105"
          >
            ⏹️ Stop
          </button>
          
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-12 py-6 bg-gray-600 text-gray-100 rounded-2xl font-bold text-3xl hover:bg-gray-700 transition-all duration-200 shadow-2xl transform hover:scale-105"
          >
            🔙 Exit
          </button>
        </div>

        {/* Celebration Effects */}
        {showCelebration && <CelebrationEffects />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⏰ Epic Timer Tools</h2>
        <p className="text-gray-700">Engaging classroom timing with student avatar animations!</p>
      </div>

      {/* Timer Type Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Timer Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timerTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setActiveTimer(type.id);
                resetTimer();
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                activeTimer === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-lg'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-bold text-lg">{type.name}</span>
              </div>
              <p className="text-sm">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <TimerDisplay />

          {/* Controls */}
          <div className="flex justify-center space-x-3 mb-6">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 ${
                isRunning 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' 
                  : 'bg-green-500 hover:bg-green-600 text-green-900'
              }`}
            >
              {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
            </button>
            
            <button
              onClick={stopTimer}
              className="px-6 py-3 bg-red-500 text-red-900 rounded-lg font-bold hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
            >
              ⏹️ Stop
            </button>
            
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-500 text-gray-100 rounded-lg font-bold hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
            >
              🔄 Reset
            </button>
          </div>

          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              🎮 Epic Fullscreen
            </button>
          </div>
        </div>

        {/* Settings and Presets */}
        <div className="space-y-6">
          {/* Theme Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🎨 Timer Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentTheme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-full h-8 bg-gradient-to-r ${theme.colors} rounded mb-2`}></div>
                  <div className="text-xs font-bold text-gray-800">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets */}
          {(activeTimer === 'countdown' || activeTimer === 'interval') && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Quick Presets</h3>
              <div className="grid grid-cols-3 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setTime(preset.seconds)}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors font-bold text-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Time Input */}
          {activeTimer === 'countdown' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⏱️ Custom Time</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={Math.floor(time / 60)}
                    onChange={(e) => setTime(parseInt(e.target.value || 0) * 60 + (time % 60))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={time % 60}
                    onChange={(e) => setTime(Math.floor(time / 60) * 60 + parseInt(e.target.value || 0))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Student Avatar Preview */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🎭 Avatar Preview</h3>
              <p className="text-sm text-gray-600 mb-3">
                {students.length} student avatars will bounce around in fullscreen mode!
              </p>
              <div className="flex flex-wrap gap-2">
                {students.slice(0, 8).map(student => (
                  <div key={student.id} className="text-center">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-xs">
                        👤
                      </div>
                    )}
                  </div>
                ))}
                {students.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                    +{students.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Alert Overlay */}
      {showVisualAlert && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center z-40 animate-pulse">
          <div className="text-white text-6xl font-bold text-center">
            <div className="mb-4">⏰ TIME'S UP! ⏰</div>
            <div className="text-3xl">🎉 Great job, everyone! 🎉</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerTools;