import React, { useState, useEffect, useRef, useCallback } from 'react';

const SequenceChallenge = ({ onComplete, duration }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [currentShow, setCurrentShow] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    // Generate random sequence
    const newSequence = [];
    for (let i = 0; i < 5; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);

    // Show sequence
    let showIndex = 0;
    const showInterval = setInterval(() => {
      if (showIndex < newSequence.length) {
        setCurrentShow(newSequence[showIndex]);
        showIndex++;
      } else {
        setShowingSequence(false);
        clearInterval(showInterval);
      }
    }, 800);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(showInterval);
      clearInterval(timer);
    };
  }, [onComplete]);

  const handleButtonClick = (index) => {
    if (showingSequence) return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      onComplete(false);
    } else if (newPlayerSequence.length === sequence.length) {
      onComplete(true);
    }
  };

  const buttons = [
    { color: 'bg-red-500', activeColor: 'bg-red-300', icon: '??' },
    { color: 'bg-blue-500', activeColor: 'bg-blue-300', icon: '??' },
    { color: 'bg-green-500', activeColor: 'bg-green-300', icon: '??' },
    { color: 'bg-yellow-500', activeColor: 'bg-yellow-300', icon: '?' }
  ];

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">
          {showingSequence ? 'Memorize the symbols...' : 'Repeat the sequence!'}
        </div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-sm text-gray-600">Progress: {playerSequence.length}/{sequence.length}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={showingSequence}
            className={`w-20 h-20 rounded-lg font-bold text-3xl text-white transition-all transform duration-100 ${showingSequence && currentShow === index
              ? `${button.activeColor} scale-110 ring-4 ring-white shadow-xl`
              : button.color
              } ${!showingSequence ? 'hover:opacity-80 active:scale-95' : ''
              }`}
          >
            {button.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// Speed Challenge Component

export default SequenceChallenge;
