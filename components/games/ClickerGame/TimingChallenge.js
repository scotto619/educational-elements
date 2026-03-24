import React, { useState, useEffect, useRef, useCallback } from 'react';

const TimingChallenge = ({ onComplete, duration }) => {
  const [indicator, setIndicator] = useState(0);
  const [direction, setDirection] = useState(1);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicator(prev => {
        const newVal = prev + direction * 2;
        if (newVal >= 100) {
          setDirection(-1);
          return 100;
        }
        if (newVal <= 0) {
          setDirection(1);
          return 0;
        }
        return newVal;
      });
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1 && !hasClicked) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [direction, onComplete, hasClicked]);

  const handleClick = () => {
    if (hasClicked) return;
    setHasClicked(true);

    const success = indicator >= 40 && indicator <= 60;
    onComplete(success);
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click when the indicator is in the green zone!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
      </div>

      <div className="relative w-full h-8 bg-gray-300 rounded-lg mb-4">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 rounded-lg"></div>
        <div className="absolute left-[35%] top-0 w-[30%] h-full bg-green-400 rounded-lg"></div>
        <div
          className="absolute top-0 w-2 h-full bg-blue-600 rounded-lg transition-all duration-100"
          style={{ left: `${indicator}%` }}
        ></div>
      </div>

      <button
        onClick={handleClick}
        disabled={hasClicked}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
      >
        {hasClicked ? 'Clicked!' : 'Click Now!'}
      </button>
    </div>
  );
};

// Sequence Challenge Component

export default TimingChallenge;
