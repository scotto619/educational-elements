// XPAwardPopup.js - Animated XP Award Notification with Sound
import React, { useEffect, useState } from 'react';

const XPAwardPopup = ({ 
  show, 
  studentName, 
  xpAmount, 
  category, 
  onClose,
  playSound = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Play sound effect
  const playXPSound = () => {
    if (playSound) {
      try {
        const audio = new Audio('/sounds/ding.wav');
        audio.volume = 0.5; // Adjust volume (0.0 to 1.0)
        audio.play().catch(error => {
          console.log('Could not play sound:', error);
          // Fallback - try different file extensions
          const audioMp3 = new Audio('/sounds/ding.mp3');
          audioMp3.volume = 0.5;
          audioMp3.play().catch(err => console.log('Audio playback failed:', err));
        });
      } catch (error) {
        console.log('Audio not supported:', error);
      }
    }
  };

  // Category colors and emojis
  const categoryConfig = {
    'Respectful': { color: 'blue', emoji: '👍', bgColor: 'from-blue-500 to-blue-600' },
    'Responsible': { color: 'green', emoji: '💼', bgColor: 'from-green-500 to-green-600' },
    'Learner': { color: 'purple', emoji: '📚', bgColor: 'from-purple-500 to-purple-600' }
  };

  const config = categoryConfig[category] || categoryConfig['Respectful'];

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      playXPSound();

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        // Small delay for exit animation
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
        isAnimating ? 'opacity-30' : 'opacity-0'
      }`}></div>

      {/* Popup content */}
      <div className={`relative z-10 transform transition-all duration-500 ${
        isAnimating 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-75 opacity-0 translate-y-8'
      }`}>
        <div className={`bg-gradient-to-r ${config.bgColor} rounded-2xl p-8 shadow-2xl border-4 border-white relative overflow-hidden`}>
          {/* Sparkle effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-4 text-yellow-300 text-2xl animate-pulse">✨</div>
            <div className="absolute top-4 right-6 text-yellow-300 text-xl animate-bounce">⭐</div>
            <div className="absolute bottom-4 left-6 text-yellow-300 text-lg animate-ping">💫</div>
            <div className="absolute bottom-2 right-4 text-yellow-300 text-2xl animate-pulse">✨</div>
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center text-white">
            {/* XP Amount - Large and prominent */}
            <div className="mb-4">
              <div className="text-6xl font-bold text-yellow-300 drop-shadow-lg animate-bounce">
                +{xpAmount}
              </div>
              <div className="text-2xl font-bold">XP EARNED!</div>
            </div>

            {/* Category info */}
            <div className="mb-4">
              <div className="text-4xl mb-2">{config.emoji}</div>
              <div className="text-xl font-bold">{category}</div>
            </div>

            {/* Student name */}
            <div className="bg-white/20 backdrop-blur rounded-lg p-3">
              <div className="text-lg font-bold">🏆 {studentName}</div>
              <div className="text-sm opacity-90">Great job, hero!</div>
            </div>
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl border-4 border-yellow-400 animate-pulse opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default XPAwardPopup;