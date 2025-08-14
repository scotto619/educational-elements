// components/quizshow/shared/AnswerButtons.js - REUSABLE ANSWER BUTTONS
// ===============================================
import React from 'react';

export const AnswerButtons = ({ 
  options, 
  onSelect, 
  selectedAnswer, 
  correctAnswer, 
  showResults = false, 
  disabled = false,
  layout = 'grid' // 'grid' or 'list'
}) => {
  const getButtonColor = (index) => {
    const colors = [
      'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
    ];
    return colors[index] || colors[0];
  };

  const getButtonStyle = (index) => {
    let baseStyle = 'relative p-4 rounded-xl text-white font-bold transition-all duration-300 transform';
    
    if (disabled) {
      baseStyle += ' cursor-not-allowed opacity-50';
    } else {
      baseStyle += ' cursor-pointer hover:scale-105 hover:shadow-lg';
    }

    if (showResults) {
      if (index === correctAnswer) {
        baseStyle += ' bg-green-500 ring-4 ring-green-300';
      } else if (index === selectedAnswer && index !== correctAnswer) {
        baseStyle += ' bg-red-500 ring-4 ring-red-300';
      } else {
        baseStyle += ' bg-gray-400';
      }
    } else if (selectedAnswer === index) {
      baseStyle += ' ring-4 ring-blue-300 scale-105';
      baseStyle += ` bg-gradient-to-r ${getButtonColor(index)}`;
    } else {
      baseStyle += ` bg-gradient-to-r ${getButtonColor(index)}`;
    }

    return baseStyle;
  };

  const gridClass = layout === 'grid' ? 
    `grid ${options.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-4` :
    'space-y-4';

  return (
    <div className={gridClass}>
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !disabled && onSelect && onSelect(index)}
          disabled={disabled}
          className={getButtonStyle(index)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-sm">
              {String.fromCharCode(65 + index)}
            </div>
            <span className="flex-1 text-left">{option}</span>
          </div>
          
          {showResults && (
            <div className="absolute top-2 right-2 text-lg">
              {index === correctAnswer ? '✓' : index === selectedAnswer ? '✗' : ''}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
