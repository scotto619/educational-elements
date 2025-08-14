// components/quizshow/shared/QuestionTimer.js - REUSABLE COUNTDOWN TIMER
import React, { useState, useEffect } from 'react';
import { playQuizSound } from '../../../utils/quizShowHelpers';

export const QuestionTimer = ({ 
  duration, 
  isActive, 
  onTimeUp, 
  onTick,
  showWarning = true,
  warningThreshold = 5 
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
    setHasWarned(false);
  }, [duration]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      const newTime = timeLeft - 1;
      setTimeLeft(newTime);
      
      if (onTick) onTick(newTime);

      // Warning sound
      if (showWarning && newTime <= warningThreshold && !hasWarned) {
        playQuizSound('timeWarning');
        setHasWarned(true);
      }

      // Time up
      if (newTime <= 0) {
        if (onTimeUp) onTimeUp();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isActive, onTimeUp, onTick, showWarning, warningThreshold, hasWarned]);

  const getColorClass = () => {
    if (timeLeft <= 3) return 'text-red-500 animate-pulse';
    if (timeLeft <= warningThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressPercentage = () => {
    return Math.max(0, (timeLeft / duration) * 100);
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold mb-2 transition-colors duration-300 ${getColorClass()}`}>
        {timeLeft}s
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
            timeLeft <= 3 ? 'bg-red-500' : 
            timeLeft <= warningThreshold ? 'bg-yellow-500' : 
            'bg-green-500'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      <div className="text-sm text-gray-600">
        {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
      </div>
    </div>
  );
};