import React, { useState, useEffect, useRef, useCallback } from 'react';

const SpeedChallenge = ({ onComplete, duration }) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          const success = clicks >= 25; // Need 25 clicks in 5 seconds
          onComplete(success);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clicks, onComplete]);

  const handleClick = () => {
    if (isActive) {
      setClicks(prev => prev + 1);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click as fast as you can!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-lg font-semibold text-blue-600">Clicks: {clicks}</div>
        <div className="text-sm text-gray-600">Target: 25 clicks</div>
      </div>

      <button
        onClick={handleClick}
        disabled={!isActive}
        className="w-32 h-32 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full font-bold text-xl transition-all active:scale-95"
      >
        {isActive ? 'CLICK!' : 'Done!'}
      </button>

      <div className="mt-4">
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (clicks / 25) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// NEW: Inline Skill Test Component

export default SpeedChallenge;
