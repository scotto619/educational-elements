// PersistentTimer.js - Persistent Timer for Tab Switching
import React, { useState, useEffect, useRef } from 'react';

const PersistentTimer = ({ 
  isVisible, 
  timerData, 
  onTimerComplete, 
  onTimerUpdate,
  onShowFullTimer 
}) => {
  const [time, setTime] = useState(timerData?.time || 0);
  const [isRunning, setIsRunning] = useState(timerData?.isRunning || false);
  const [isPaused, setIsPaused] = useState(timerData?.isPaused || false);
  const [timerType, setTimerType] = useState(timerData?.type || 'countdown');
  const [isMinimized, setIsMinimized] = useState(false);
  const intervalRef = useRef(null);

  // Sync with external timer data
  useEffect(() => {
    if (timerData) {
      setTime(timerData.time || 0);
      setIsRunning(timerData.isRunning || false);
      setIsPaused(timerData.isPaused || false);
      setTimerType(timerData.type || 'countdown');
    }
  }, [timerData]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          let newTime;
          if (timerType === 'countdown') {
            newTime = Math.max(0, prevTime - 1);
            if (newTime === 0) {
              setIsRunning(false);
              playTimerSound();
              onTimerComplete?.();
            }
          } else {
            newTime = prevTime + 1;
          }
          
          // Update parent component
          onTimerUpdate?.({
            time: newTime,
            isRunning: newTime === 0 ? false : isRunning,
            isPaused,
            type: timerType
          });
          
          return newTime;
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
  }, [isRunning, isPaused, timerType, onTimerComplete, onTimerUpdate]);

  // Play timer completion sound
  const playTimerSound = () => {
    try {
      const audio = new Audio('/sounds/timer.wav');
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.log('Could not play timer sound:', error);
        // Fallback to ding sound
        const fallbackAudio = new Audio('/sounds/ding.wav');
        fallbackAudio.volume = 0.7;
        fallbackAudio.play().catch(err => console.log('Fallback audio failed:', err));
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const toggleTimer = () => {
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    onTimerUpdate?.({
      time,
      isRunning,
      isPaused: newPausedState,
      type: timerType
    });
  };

  const stopTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    onTimerUpdate?.({
      time,
      isRunning: false,
      isPaused: false,
      type: timerType
    });
  };

  if (!isVisible || (!isRunning && time === 0)) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
      isMinimized ? 'scale-75' : 'scale-100'
    }`}>
      <div className={`bg-gradient-to-r ${
        timerType === 'countdown' 
          ? time <= 60 
            ? 'from-red-500 to-red-600' 
            : 'from-blue-500 to-blue-600'
          : 'from-green-500 to-green-600'
      } text-white rounded-2xl shadow-2xl border-4 border-white overflow-hidden`}>
        
        {/* Timer Header */}
        <div className="px-4 py-2 bg-black bg-opacity-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">
              {timerType === 'countdown' ? '⏰' : '⏱️'}
            </span>
            <span className="font-bold text-sm">
              {timerType === 'countdown' ? 'Timer' : 'Stopwatch'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:text-yellow-300 transition-colors text-xs"
            >
              {isMinimized ? '🔼' : '🔽'}
            </button>
            <button
              onClick={stopTimer}
              className="text-white hover:text-red-300 transition-colors text-xs"
            >
              ✖️
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Timer Display */}
            <div className="px-6 py-4 text-center">
              <div className={`text-3xl font-bold font-mono mb-2 ${
                timerType === 'countdown' && time <= 10 ? 'animate-pulse' : ''
              }`}>
                {formatTime(time)}
              </div>
              
              {/* Status */}
              <div className="text-xs opacity-90 mb-3">
                {isRunning 
                  ? isPaused 
                    ? '⏸️ Paused' 
                    : '▶️ Running'
                  : '⏹️ Stopped'
                }
              </div>

              {/* Progress Bar for Countdown */}
              {timerType === 'countdown' && timerData?.originalTime && (
                <div className="w-full h-2 bg-white bg-opacity-30 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ 
                      width: `${((timerData.originalTime - time) / timerData.originalTime) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="px-4 py-3 bg-black bg-opacity-20 flex justify-center space-x-2">
              <button
                onClick={toggleTimer}
                className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-xs font-bold"
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
              
              <button
                onClick={stopTimer}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-lg transition-all text-xs font-bold"
              >
                ⏹️
              </button>
              
              <button
                onClick={onShowFullTimer}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 rounded-lg transition-all text-xs font-bold"
              >
                🔍
              </button>
            </div>
          </>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="px-4 py-2 text-center">
            <div className="text-lg font-bold font-mono">
              {formatTime(time)}
            </div>
          </div>
        )}

        {/* Urgent Alert for Low Time */}
        {timerType === 'countdown' && time <= 10 && time > 0 && (
          <div className="absolute inset-0 border-4 border-red-400 rounded-2xl animate-pulse pointer-events-none"></div>
        )}
      </div>

      {/* Click to expand hint */}
      {isMinimized && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          Click to expand
        </div>
      )}
    </div>
  );
};

export default PersistentTimer;