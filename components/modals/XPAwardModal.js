// components/modals/XPAwardModal.js - XP Award Modal Component
import React from 'react';

const XPAwardModal = ({
  isOpen = false,
  onClose = () => {},
  student = null,
  students = [],
  isBulk = false,
  onAwardXP = () => {},
  categories = [
    { 
      id: 1, 
      label: 'Respectful', 
      amount: 1, 
      color: 'bg-blue-500', 
      icon: '🤝',
      description: 'Showing respect to others and the classroom'
    },
    { 
      id: 2, 
      label: 'Responsible', 
      amount: 1, 
      color: 'bg-green-500', 
      icon: '✅',
      description: 'Taking responsibility for actions and tasks'
    },
    { 
      id: 3, 
      label: 'Safe', 
      amount: 1, 
      color: 'bg-yellow-500', 
      icon: '🛡️',
      description: 'Following safety rules and helping others stay safe'
    },
    { 
      id: 4, 
      label: 'Learner', 
      amount: 1, 
      color: 'bg-purple-500', 
      icon: '📚',
      description: 'Actively participating in learning activities'
    },
    { 
      id: 5, 
      label: 'Star Award', 
      amount: 5, 
      color: 'bg-yellow-600', 
      icon: '⭐',
      description: 'Outstanding achievement or exceptional behavior'
    }
  ]
}) => {
  if (!isOpen) return null;

  const handleCategoryClick = (category) => {
    if (isBulk) {
      onAwardXP(students, category.amount, category.label);
    } else {
      onAwardXP(student.id, category.amount, category.label);
    }
    onClose();
  };

  const title = isBulk 
    ? `Award XP to ${students.length} Students` 
    : `Award XP to ${student?.firstName || 'Student'}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Select the reason for awarding XP:
          </p>
          
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              className={`w-full p-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all duration-200 hover:scale-105 flex items-center space-x-3 ${category.color}`}
            >
              <span className="text-2xl">{category.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-bold">{category.label}</div>
                <div className="text-sm opacity-90">{category.description}</div>
              </div>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
                +{category.amount} XP
              </div>
            </button>
          ))}
        </div>

        {/* Custom XP Input */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Custom Award</h4>
          <div className="flex space-x-2">
            <input
              type="number"
              min="1"
              max="20"
              placeholder="XP"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const amount = parseInt(e.target.value) || 1;
                  if (isBulk) {
                    onAwardXP(students, amount, 'Custom');
                  } else {
                    onAwardXP(student.id, amount, 'Custom');
                  }
                  onClose();
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                const amount = parseInt(input.value) || 1;
                if (isBulk) {
                  onAwardXP(students, amount, 'Custom');
                } else {
                  onAwardXP(student.id, amount, 'Custom');
                }
                onClose();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Award
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Press Enter or click Award to give custom XP</p>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default XPAwardModal;