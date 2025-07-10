// TimerTools.js - Comprehensive Classroom Timer System
import React, { useState, useEffect, useRef, useCallback } from 'react';

const TimerTools = ({ showToast }) => {
  const [activeTimer, setActiveTimer] = useState('countdown');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [initialTime, setInitialTime] = useState(300);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Interval timer state
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes
  const [currentCycle, setCurrentCycle] = useState('work'); // 'work' or 'break'
  const [cycleCount, setCycleCount] = useState(0);
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState('bell');
  
  const intervalRef = useRef(null);
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Sound effects
  const playAlert = useCallback((type = 'bell') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      switch (type) {
        case 'bell':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
          break;
        case 'chime':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.4);
          break;
        case 'beep':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          break;
        default:
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      }
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
      console.log('Audio not supported');
    }
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (activeTimer === 'countdown' || activeTimer === 'interval') {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Timer finished
              setIsRunning(false);
              playAlert(selectedAlert);
              
              if (activeTimer === 'interval') {
                // Handle interval timer cycle
                if (currentCycle === 'work') {
                  setCurrentCycle('break');
                  setTimeLeft(breakDuration);
                  setInitialTime(breakDuration);
                  showToast('Work time finished! Break time starts now. 🌟');
                } else {
                  setCurrentCycle('work');
                  setTimeLeft(workDuration);
                  setInitialTime(workDuration);
                  setCycleCount(prev => prev + 1);
                  showToast('Break time finished! Back to work. 💪');
                }
                setIsRunning(true); // Auto-start next cycle
              } else {
                showToast('Timer finished! ⏰');
              }
              
              return 0;
            }
            return prev - 1;
          });
        } else if (activeTimer === 'stopwatch') {
          setElapsedTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, activeTimer, selectedAlert, playAlert, currentCycle, workDuration, breakDuration, showToast]);

  // Format time display
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Control functions
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
    if (activeTimer === 'countdown' || activeTimer === 'interval') {
      setTimeLeft(initialTime);
    } else {
      setElapsedTime(0);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (activeTimer === 'countdown' || activeTimer === 'interval') {
      setTimeLeft(initialTime);
    } else {
      setElapsedTime(0);
    }
    if (activeTimer === 'interval') {
      setCurrentCycle('work');
      setCycleCount(0);
    }
  };

  // Preset timer functions
  const setPresetTime = (minutes) => {
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setInitialTime(seconds);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Custom time input
  const [customMinutes, setCustomMinutes] = useState(5);
  const [customSeconds, setCustomSeconds] = useState(0);

  const setCustomTime = () => {
    const totalSeconds = (customMinutes * 60) + customSeconds;
    setTimeLeft(totalSeconds);
    setInitialTime(totalSeconds);
    setIsRunning(false);
    setIsPaused(false);
  };

  // Progress calculation
  const getProgress = () => {
    if (activeTimer === 'countdown' || activeTimer === 'interval') {
      if (initialTime === 0) return 0;
      return ((initialTime - timeLeft) / initialTime) * 100;
    }
    return 0; // Stopwatch doesn't have progress
  };

  // Timer presets
  const presets = [
    { name: '1 min', minutes: 1, icon: '⚡' },
    { name: '2 min', minutes: 2, icon: '🏃' },
    { name: '5 min', minutes: 5, icon: '📝' },
    { name: '10 min', minutes: 10, icon: '📚' },
    { name: '15 min', minutes: 15, icon: '🎯' },
    { name: '20 min', minutes: 20, icon: '💡' },
    { name: '30 min', minutes: 30, icon: '📖' },
    { name: '45 min', minutes: 45, icon: '🎓' }
  ];

  const timerTypes = [
    { id: 'countdown', name: 'Countdown', icon: '⏰', description: 'Count down from a set time' },
    { id: 'stopwatch', name: 'Stopwatch', icon: '⏱️', description: 'Count up from zero' },
    { id: 'interval', name: 'Interval', icon: '🔄', description: 'Work/break cycles (Pomodoro)' }
  ];

  const TimerDisplay = () => {
    const displayTime = activeTimer === 'stopwatch' ? elapsedTime : timeLeft;
    const progress = getProgress();
    
    return (
      <div className={`relative ${isFullscreen ? 'w-full h-full flex items-center justify-center bg-black text-white' : ''}`}>
        {/* Progress Circle */}
        {(activeTimer === 'countdown' || activeTimer === 'interval') && (
          <div className="relative inline-block">
            <svg 
              className={`transform -rotate-90 ${isFullscreen ? 'w-96 h-96' : 'w-64 h-64'}`} 
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`font-mono font-bold ${isFullscreen ? 'text-8xl' : 'text-4xl'}`}>
                  {formatTime(displayTime)}
                </div>
                {activeTimer === 'interval' && (
                  <div className={`mt-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                    {currentCycle === 'work' ? '💼 Work Time' : '☕ Break Time'}
                    <div className="text-sm opacity-75">Cycle {cycleCount + 1}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stopwatch Display */}
        {activeTimer === 'stopwatch' && (
          <div className="text-center">
            <div className={`font-mono font-bold ${isFullscreen ? 'text-8xl' : 'text-6xl'} text-blue-600`}>
              {formatTime(displayTime)}
            </div>
            <div className={`mt-2 ${isFullscreen ? 'text-2xl' : 'text-lg'} text-gray-600`}>
              ⏱️ Stopwatch
            </div>
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
        <p className="text-gray-600">Professional classroom timing solutions</p>
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
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <span className="font-bold text-lg">{type.name}</span>
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
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
                    <div className="text-lg">{preset.icon}</div>
                    <div className="text-xs font-semibold text-blue-800">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Time Input */}
          {activeTimer === 'countdown' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Custom Time</h3>
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  min="0"
                  max="999"
                />
                <span className="text-gray-600 font-semibold">min</span>
                <input
                  type="number"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                  min="0"
                  max="59"
                />
                <span className="text-gray-600 font-semibold">sec</span>
              </div>
              <button
                onClick={setCustomTime}
                disabled={isRunning}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Work Duration (minutes)</label>
                  <input
                    type="number"
                    value={Math.floor(workDuration / 60)}
                    onChange={(e) => setWorkDuration((parseInt(e.target.value) || 25) * 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="120"
                    disabled={isRunning}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Break Duration (minutes)</label>
                  <input
                    type="number"
                    value={Math.floor(breakDuration / 60)}
                    onChange={(e) => setBreakDuration((parseInt(e.target.value) || 5) * 60)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                    max="60"
                    disabled={isRunning}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  Current: {formatTime(currentCycle === 'work' ? workDuration : breakDuration)} 
                  ({currentCycle === 'work' ? 'Work' : 'Break'})
                  <br />
                  Completed cycles: {cycleCount}
                </div>
              </div>
            </div>
          )}

          {/* Audio Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Audio Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Enable sound alerts</span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alert Sound</label>
                <select
                  value={selectedAlert}
                  onChange={(e) => setSelectedAlert(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="bell">🔔 Bell</option>
                  <option value="chime">🎵 Chime</option>
                  <option value="beep">📢 Beep</option>
                </select>
              </div>

              <button
                onClick={() => playAlert(selectedAlert)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                🎵 Test Sound
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerTools;