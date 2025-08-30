// components/widgets/FloatingTimer.js - Persistent floating timer widget
import React, { useState, useEffect, useRef } from 'react';

const FloatingTimer = ({ showToast, playSound }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [time, setTime] = useState(0);
  const [originalTime, setOriginalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerType, setTimerType] = useState('countdown'); // countdown or stopwatch
  const [customTitle, setCustomTitle] = useState('');
  
  const intervalRef = useRef(null);

  // Timer effect - continues across tab changes
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (timerType === 'countdown') {
            if (prevTime <= 1) {
              setIsRunning(false);
              setIsPaused(false);
              playSound('alarm');
              showToast('⏰ Timer finished!', 'success');
              return 0;
            }
            return prevTime - 1;
          } else {
            // Stopwatch - count up
            return prevTime + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, timerType, playSound, showToast]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (timerType === 'countdown' && time === 0) {
      showToast('Please set a time first', 'error');
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    playSound('start');
  };

  const pauseTimer = () => {
    setIsPaused(true);
    playSound('pause');
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerType === 'countdown') {
      setTime(originalTime);
    } else {
      setTime(0);
    }
    playSound('stop');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerType === 'countdown') {
      setTime(originalTime);
    } else {
      setTime(0);
    }
  };

  const setCustomTime = (minutes, seconds) => {
    const totalSeconds = (minutes * 60) + seconds;
    setTime(totalSeconds);
    setOriginalTime(totalSeconds);
  };

  const quickTimes = [
    { name: '1m', seconds: 60 },
    { name: '5m', seconds: 300 },
    { name: '10m', seconds: 600 },
    { name: '15m', seconds: 900 }
  ];

  const getProgressPercentage = () => {
    if (timerType === 'countdown' && originalTime > 0) {
      return ((originalTime - time) / originalTime) * 100;
    }
    return 0;
  };

  const isUrgent = timerType === 'countdown' && time <= 10 && time > 0;

  return (
    <>
      {/* Floating Button */}
      <div 
        className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
          isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center text-white font-bold ${
            isUrgent 
              ? 'bg-red-500 animate-pulse hover:bg-red-600' 
              : isRunning 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
          }`}
          title="Timer"
        >
          <div className="text-center">
            <div className="text-lg">⏰</div>
            {time > 0 && (
              <div className="text-xs leading-none">
                {time < 60 ? `${time}s` : `${Math.floor(time/60)}m`}
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Expanded Timer Panel */}
      {isExpanded && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 w-80 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⏰</span>
              <h3 className="font-bold">Quick Timer</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Timer Display */}
          <div className="p-4 text-center bg-gray-50">
            <div className={`text-4xl font-mono font-bold mb-2 ${
              isUrgent ? 'text-red-600 animate-pulse' : 
              isRunning ? 'text-green-600' : 'text-gray-700'
            }`}>
              {formatTime(time)}
            </div>

            {customTitle && (
              <div className="text-sm font-semibold text-gray-600 mb-2">
                {customTitle}
              </div>
            )}

            <div className="text-xs text-gray-500 mb-3">
              {isRunning 
                ? isPaused 
                  ? '⏸️ Paused' 
                  : '▶️ Running'
                : '⏹️ Stopped'
              }
            </div>

            {/* Progress Bar for Countdown */}
            {timerType === 'countdown' && originalTime > 0 && (
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isUrgent ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 space-y-3">
            {/* Timer Type Toggle */}
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => {setTimerType('countdown'); setTime(0); setOriginalTime(0); resetTimer();}}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-colors ${
                  timerType === 'countdown' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⏱️ Countdown
              </button>
              <button
                onClick={() => {setTimerType('stopwatch'); setTime(0); setOriginalTime(0); resetTimer();}}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-colors ${
                  timerType === 'stopwatch' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⏲️ Stopwatch
              </button>
            </div>

            {/* Quick Time Buttons for Countdown */}
            {timerType === 'countdown' && (
              <div className="grid grid-cols-4 gap-2">
                {quickTimes.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setCustomTime(Math.floor(preset.seconds / 60), preset.seconds % 60)}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors font-semibold"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Time Input for Countdown */}
            {timerType === 'countdown' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={Math.floor(originalTime / 60)}
                    onChange={(e) => setCustomTime(parseInt(e.target.value || 0), originalTime % 60)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Seconds</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={originalTime % 60}
                    onChange={(e) => setCustomTime(Math.floor(originalTime / 60), parseInt(e.target.value || 0))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Activity Title */}
            <div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Activity name (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Control Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                disabled={timerType === 'countdown' && time === 0}
                className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  (timerType === 'countdown' && time === 0)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isRunning 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isRunning ? (isPaused ? '▶️' : '⏸️') : '▶️'}
              </button>
              
              <button
                onClick={stopTimer}
                className="px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
              >
                ⏹️
              </button>
              
              <button
                onClick={resetTimer}
                className="px-3 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingTimer;