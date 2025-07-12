// components/quest/QuestProgressBar.js - Animated Quest Progress Visualization
import React from 'react';

const QuestProgressBar = ({ 
  completed, 
  total, 
  showPercentage = true, 
  showNumbers = true,
  height = 'h-4',
  animated = true,
  color = 'blue'
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'blue':
        return 'bg-blue-500';
      case 'purple':
        return 'bg-purple-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getBackgroundColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-100';
      case 'blue':
        return 'bg-blue-100';
      case 'purple':
        return 'bg-purple-100';
      case 'yellow':
        return 'bg-yellow-100';
      case 'red':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className="w-full">
      <div className={`w-full ${height} ${getBackgroundColorClasses()} rounded-full overflow-hidden relative`}>
        <div 
          className={`${height} ${getColorClasses()} rounded-full ${animated ? 'transition-all duration-500 ease-out' : ''} relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          )}
        </div>
        
        {/* Percentage overlay */}
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">
              {percentage}%
            </span>
          </div>
        )}
      </div>
      
      {/* Numbers below */}
      {showNumbers && (
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{completed} completed</span>
          <span>{total} total</span>
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

export default QuestProgressBar;