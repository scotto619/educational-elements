// TimerTools.js - Professional Classroom Timing Solutions (FIXED CONTRAST)
import React, { useState, useEffect, useRef } from 'react';

const TimerTools = ({ showToast }) => {
  const [activeTimer, setActiveTimer] = useState('countdown');
  const [time, setTime] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interval timer specific
  const [currentCycle, setCurrentCycle] = useState('work'); // 'work' or 'break'
  const [workDuration, setWorkDuration] = useState(1500); // 25 minutes
  const [breakDuration, setBreakDuration] = useState(300); // 5 minutes
  const [cycleCount, setCycleCount] = useState(0);

  // Stopwatch specific
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
  // Audio and visual effects
  const [showVisualAlert, setShowVisualAlert] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Timer presets
  const presets = [
    { name: '1 min', minutes: 1 },
    { name: '2 min', minutes: 2 },
    { name: '5 min', minutes: 5 },
    { name: '10 min', minutes: 10 },
    { name: '15 min', minutes: 15 },
    { name: '20 min', minutes: 20 },
    { name: '25 min', minutes: 25 },
    { name: '30 min', minutes: 30 }
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

  useEffect(() => {
    // Create audio for timer completion
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (activeTimer === 'countdown' || activeTimer === 'interval') {
          setTime(prev => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
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
  }, [isRunning, isPaused, activeTimer]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Play completion sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show visual alert
    setShowVisualAlert(true);
    setTimeout(() => setShowVisualAlert(false), 3000);

    if (activeTimer === 'interval') {
      // Handle interval cycling
      if (currentCycle === 'work') {
        setCurrentCycle('break');
        setTime(breakDuration);
        setCycleCount(prev => prev + 1);
        showToast('Work period complete! Break time!');
        
        // Auto-start break if enabled
        setTimeout(() => {
          setIsRunning(true);
        }, 1000);
      } else {
        setCurrentCycle('work');
        setTime(workDuration);
        showToast('Break complete! Back to work!');
        
        // Auto-start work if enabled
        setTimeout(() => {
          setIsRunning(true);
        }, 1000);
      }
    } else {
      showToast('Timer complete!');
    }
  };

  const startTimer = () => {
    if (activeTimer === 'countdown' && time === 0) {
      showToast('Please set a time first!', 'error');
      return;
    }
    
    setIsRunning(true);
    setIsPaused(false);
    showToast('Timer started!');
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    showToast(isPaused ? 'Timer resumed!' : 'Timer paused!');
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    showToast('Timer stopped!');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    if (activeTimer === 'countdown') {
      setTime(300); // Reset to 5 minutes
    } else if (activeTimer === 'stopwatch') {
      setStopwatchTime(0);
    } else if (activeTimer === 'interval') {
      setCurrentCycle('work');
      setTime(workDuration);
      setCycleCount(0);
    }
    
    showToast('Timer reset!');
  };

  const setPresetTime = (minutes) => {
    const seconds = minutes * 60;
    setTime(seconds);
    showToast(`Timer set to ${minutes} minute${minutes !== 1 ? 's' : ''}!`);
  };

  const setCustomTime = () => {
    const minutes = prompt('Enter minutes:');
    const seconds = prompt('Enter seconds (optional):') || 0;
    
    if (minutes !== null && !isNaN(minutes) && minutes >= 0) {
      const totalSeconds = (parseInt(minutes) * 60) + parseInt(seconds);
      setTime(totalSeconds);
      showToast(`Timer set to ${minutes}:${seconds.toString().padStart(2, '0')}!`);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    switch (activeTimer) {
      case 'countdown':
      case 'interval':
        return time;
      case 'stopwatch':
        return stopwatchTime;
      default:
        return 0;
    }
  };

  const TimerDisplay = () => {
    const currentTime = getCurrentTime();
    const isWarning = activeTimer === 'countdown' && currentTime <= 60 && currentTime > 0;
    const isComplete = activeTimer === 'countdown' && currentTime === 0;
    
    return (
      <div className={`text-center transition-all duration-300 ${showVisualAlert ? 'animate-pulse' : ''}`}>
        <div className={`text-8xl font-mono font-bold mb-4 ${
          isComplete ? 'text-red-600' : 
          isWarning ? 'text-orange-500' : 
          'text-gray-800'
        }`}>
          {formatTime(currentTime)}
        </div>
        
        {activeTimer === 'interval' && (
          <div className={`text-3xl font-bold mb-2 ${
            currentCycle === 'work' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {currentCycle === 'work' ? '💼 Work Time' : '☕ Break Time'}
          </div>
        )}
        
        {activeTimer === 'interval' && (
          <div className="text-xl text-gray-700 mb-2">
            Cycle: {cycleCount + 1}
          </div>
        )}
        
        {isRunning && !isPaused && (
          <div className="text-lg text-gray-700">
            ▶️ Running
          </div>
        )}
        
        {isPaused && (
          <div className="text-lg text-gray-700">
            ⏸️ Paused
          </div>
        )}
        
        {activeTimer === 'stopwatch' && !isRunning && (
          <div className={`text-2xl ${isFullscreen ? 'text-2xl' : 'text-lg'} text-gray-700`}>
            ⏱️ Stopwatch
          </div>
        )}
      </div>
    );
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black text-white z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <TimerDisplay />
        </div>
        
        {/* Fullscreen Controls */}
        <div className="p-8 flex justify-center space-x-4">
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className={`px-8 py-4 rounded-lg font-bold text-2xl ${
              isRunning 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white transition-colors`}
          >
            {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
          </button>
          
          <button
            onClick={stopTimer}
            className="px-8 py-4 bg-red-600 text-white rounded-lg font-bold text-2xl hover:bg-red-700 transition-colors"
          >
            ⏹️ Stop
          </button>
          
          <button
            onClick={() => setIsFullscreen(false)}
            className="px-8 py-4 bg-gray-600 text-white rounded-lg font-bold text-2xl hover:bg-gray-700 transition-colors"
          >
            🔙 Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⏰ Timer Tools</h2>
        <p className="text-gray-700">Professional classroom timing solutions</p>
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
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                activeTimer === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-bold text-lg">{type.name}</span>
              </div>
              <p className="text-sm text-gray-700">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="text-center mb-6">
            <TimerDisplay />
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3 mb-4">
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`px-6 py-3 rounded-lg font-bold ${
                isRunning 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white transition-colors`}
            >
              {isRunning ? (isPaused ? '▶️ Resume' : '⏸️ Pause') : '▶️ Start'}
            </button>
            
            <button
              onClick={stopTimer}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              ⏹️ Stop
            </button>
            
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-colors"
            >
              🔄 Reset
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
            >
              🔍 Fullscreen
            </button>
          </div>
        </div>

        {/* Settings and Presets */}
        <div className="space-y-6">
          {/* Quick Presets */}
          {(activeTimer === 'countdown' || activeTimer === 'interval') && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Presets</h3>
              <div className="grid grid-cols-4 gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setPresetTime(preset.minutes)}
                    disabled={isRunning}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors text-center"
                  >
                    <div className="font-bold text-blue-800">{preset.name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={setCustomTime}
                disabled={isRunning}
                className="w-full mt-3 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-gray-800 font-semibold transition-colors"
              >
                Set Custom Time
              </button>
            </div>
          )}

          {/* Interval Timer Settings */}
          {activeTimer === 'interval' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Interval Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Work Duration (minutes)</label>
                  <input
                    type="number"
                    value={Math.floor(workDuration / 60)}
                    onChange={(e) => setWorkDuration((parseInt(e.target.value) || 25) * 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                    min="1"
                    max="120"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={Math.floor(breakDuration / 60)}
                    onChange={(e) => setBreakDuration((parseInt(e.target.value) || 5) * 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                    min="1"
                    max="60"
                    disabled={isRunning}
                  />
                </div>
                <div className="text-sm text-gray-700">
                  Current: {formatTime(currentCycle === 'work' ? workDuration : breakDuration)} 
                  ({currentCycle === 'work' ? 'Work' : 'Break'} Period)
                </div>
              </div>
            </div>
          )}

          {/* Timer Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Session Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Timer Type:</span>
                <span className="text-gray-800 font-bold">
                  {timerTypes.find(t => t.id === activeTimer)?.name}
                </span>
              </div>
              
              {activeTimer === 'interval' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Cycles Completed:</span>
                    <span className="text-gray-800 font-bold">{cycleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Current Phase:</span>
                    <span className={`font-bold ${
                      currentCycle === 'work' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {currentCycle === 'work' ? 'Work' : 'Break'}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-700 font-semibold">Status:</span>
                <span className={`font-bold ${
                  isRunning 
                    ? isPaused 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                    : 'text-gray-600'
                }`}>
                  {isRunning ? (isPaused ? 'Paused' : 'Running') : 'Stopped'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Alert Overlay */}
      {showVisualAlert && (
        <div className="fixed inset-0 bg-red-600 bg-opacity-75 flex items-center justify-center z-40 animate-pulse">
          <div className="text-white text-6xl font-bold">
            ⏰ TIME'S UP! ⏰
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerTools;