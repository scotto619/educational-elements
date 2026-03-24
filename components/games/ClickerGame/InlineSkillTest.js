import React, { useState, useEffect, useRef, useCallback } from 'react';

const InlineSkillTest = ({ testName, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [isActive, setIsActive] = useState(true);

  const getTestConfig = () => {
    switch (testName) {
      case 'Quick Click': return { goal: 5, move: false, timeout: 4000 };
      case 'Split Target': return { goal: 4, move: true, timeout: 5000 };
      case 'Poison Spores': return { goal: 6, move: true, timeout: 5500 };
      case 'Erratic Orbit': return { goal: 8, move: true, timeout: 6000, fast: true };
      case 'Ambush': return { goal: 3, move: true, timeout: 3000 };
      case 'Brute Force': return { goal: 12, move: false, timeout: 5000 };
      case 'Shield Block': return { goal: 1, move: false, timeout: 2000 };
      case 'Combo Sequence': return { goal: 5, move: true, timeout: 5000 };
      case 'Gold Rush': return { goal: 10, move: true, timeout: 6000 };
      case 'Inferno': return { goal: 15, move: true, fast: true, timeout: 6000 };
      default: return { goal: 4, move: false, timeout: 4000 };
    }
  };

  const config = getTestConfig();

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete(false);
    }, config.timeout);

    let moveInterval;
    if (config.move) {
      moveInterval = setInterval(() => {
        setTargetPos({
          top: `${15 + Math.random() * 70}%`,
          left: `${15 + Math.random() * 70}%`
        });
      }, config.fast ? 600 : 1000);
    }

    return () => {
      clearTimeout(timer);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [isActive, onComplete, config.timeout, config.move, config.fast]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isActive) return;
    const newProgress = progress + 1;
    setProgress(newProgress);
    if (newProgress >= config.goal) {
      setIsActive(false);
      onComplete(true);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/50 rounded-3xl overflow-hidden pointer-events-auto backdrop-blur-sm">
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-2 rounded-full text-base font-bold border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] text-center whitespace-nowrap animate-pulse">
        Defend: {testName} ({progress}/{config.goal})
      </div>

      <button
        onClick={handleClick}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-3xl"
        style={{ ...targetPos, transition: config.move ? 'all 0.2s ease-out' : 'none' }}
      >
        ??
      </button>
    </div>
  );
};

export default ClickerGame;

export default InlineSkillTest;
