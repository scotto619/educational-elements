// components/shared/LevelProgressBar.js - Student Level Progress Visualization
import React from 'react';

const LevelProgressBar = ({ 
  currentXP = 0, 
  currentLevel = 1, 
  showLabel = true,
  size = 'medium',
  animated = true,
  color = 'blue'
}) => {
  // Calculate XP thresholds (every 100 XP = 1 level)
  const xpPerLevel = 100;
  const maxLevel = 4;
  
  // Calculate current level progress
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const progressPercentage = (xpInCurrentLevel / xpPerLevel) * 100;
  
  // Calculate next level XP requirement
  const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
  const nextLevel = Math.min(currentLevel + 1, maxLevel);
  
  // Size variations
  const sizeClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };
  
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  // Color variations
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-500',
          bgLight: 'bg-green-100',
          text: 'text-green-700'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100',
          text: 'text-blue-700'
        };
      case 'purple':
        return {
          bg: 'bg-purple-500',
          bgLight: 'bg-purple-100',
          text: 'text-purple-700'
        };
      case 'gold':
        return {
          bg: 'bg-yellow-500',
          bgLight: 'bg-yellow-100',
          text: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-100',
          text: 'text-blue-700'
        };
    }
  };

  const colors = getColorClasses();
  
  // Max level reached
  if (currentLevel >= maxLevel) {
    return (
      <div className="w-full">
        {showLabel && (
          <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}>
            <span className="font-bold text-gold-600">MAX LEVEL! 🏆</span>
            <span className="text-gold-500 font-semibold">Level {currentLevel}</span>
          </div>
        )}
        <div className={`w-full ${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-gold-500 rounded-full overflow-hidden relative shadow-inner`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
        </div>
        {showLabel && (
          <div className={`text-center mt-1 ${textSizeClasses[size]} text-gold-600 font-medium`}>
            Champion Status! ⭐
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between items-center mb-1 ${textSizeClasses[size]}`}>
          <span className={`font-bold ${colors.text}`}>
            Level {currentLevel}
          </span>
          <span className="text-gray-500 font-medium">
            {xpToNextLevel} XP to Level {nextLevel}
          </span>
        </div>
      )}
      
      <div className={`w-full ${sizeClasses[size]} ${colors.bgLight} rounded-full overflow-hidden relative shadow-inner`}>
        {/* Progress fill */}
        <div 
          className={`${sizeClasses[size]} ${colors.bg} rounded-full ${animated ? 'transition-all duration-700 ease-out' : ''} relative overflow-hidden`}
          style={{ width: `${progressPercentage}%` }}
        >
          {/* Animated shimmer effect */}
          {animated && progressPercentage > 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-shimmer"></div>
          )}
        </div>
        
        {/* XP text overlay for larger sizes */}
        {size !== 'small' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${textSizeClasses[size]} font-bold text-gray-700 drop-shadow-sm`}>
              {xpInCurrentLevel}/{xpPerLevel} XP
            </span>
          </div>
        )}
      </div>
      
      {/* Additional info for larger sizes */}
      {showLabel && size === 'large' && (
        <div className={`flex justify-between mt-1 ${textSizeClasses[size]} text-gray-600`}>
          <span>Total XP: {currentXP}</span>
          <span>{progressPercentage.toFixed(0)}% Complete</span>
        </div>
      )}
      
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LevelProgressBar;