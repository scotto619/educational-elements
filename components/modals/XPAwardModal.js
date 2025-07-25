// components/modals/XPAwardModal.js - XP Criteria Selection Modal
import React, { useState, useEffect } from 'react';
import { DEFAULT_XP_CATEGORIES } from '../../constants/gameData';

const XPAwardModal = ({ 
  isOpen, 
  onClose, 
  onAward, 
  selectedStudents = [], 
  students = [],
  customCategories = null 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [customAmount, setCustomAmount] = useState(1);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [xpCategories, setXpCategories] = useState(customCategories || DEFAULT_XP_CATEGORIES);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(null);
      setCustomAmount(1);
      setShowCustomAmount(false);
      setXpCategories(customCategories || DEFAULT_XP_CATEGORIES);
    }
  }, [isOpen, customCategories]);

  if (!isOpen) return null;

  const handleAward = () => {
    if (!selectedCategory) {
      alert('Please select an XP category first!');
      return;
    }

    const amount = showCustomAmount ? customAmount : selectedCategory.amount;
    
    if (selectedStudents.length > 0) {
      // Bulk award
      onAward(selectedStudents, amount, selectedCategory.label);
    } else {
      // Single student award (shouldn't happen in this modal, but safety check)
      console.warn('No students selected for XP award');
    }
    
    onClose();
  };

  const getStudentNames = () => {
    if (selectedStudents.length === 0) return 'No students selected';
    if (selectedStudents.length === 1) {
      const student = students.find(s => s.id === selectedStudents[0]);
      return student?.firstName || 'Unknown Student';
    }
    return `${selectedStudents.length} students`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-modal-appear">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Award XP Points</h2>
              <p className="text-blue-100 mt-1">To: {getStudentNames()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What is this XP for? 🌟
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {xpCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left
                    ${selectedCategory?.id === category.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4 w-full">
                    <div className="text-3xl">{category.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{category.label}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className={`
                      ${category.color} text-white px-3 py-1 rounded-full text-sm font-bold
                    `}>
                      +{category.amount} XP
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Option */}
          <div className="border-t pt-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showCustomAmount}
                onChange={(e) => setShowCustomAmount(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Use custom amount</span>
            </label>
            
            {showCustomAmount && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom XP Amount:
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
                  placeholder="Enter amount"
                />
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedCategory && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-bold text-green-800 mb-2">Award Summary:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Students:</strong> {getStudentNames()}</p>
                <p><strong>Category:</strong> {selectedCategory.label}</p>
                <p><strong>XP Amount:</strong> {showCustomAmount ? customAmount : selectedCategory.amount} per student</p>
                <p><strong>Total XP:</strong> {(showCustomAmount ? customAmount : selectedCategory.amount) * selectedStudents.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAward}
            disabled={!selectedCategory}
            className="flex-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedStudents.length === 1 ? 'Award XP' : `Award XP to ${selectedStudents.length} Students`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for editing XP categories (optional advanced feature)
export const XPCategoryEditor = ({ 
  categories, 
  onUpdateCategories, 
  isOpen, 
  onClose 
}) => {
  const [editingCategories, setEditingCategories] = useState(categories);

  useEffect(() => {
    if (isOpen) {
      setEditingCategories([...categories]);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleCategoryChange = (index, field, value) => {
    const updated = [...editingCategories];
    updated[index] = { ...updated[index], [field]: value };
    setEditingCategories(updated);
  };

  const handleSave = () => {
    onUpdateCategories(editingCategories);
    onClose();
  };

  const addNewCategory = () => {
    const newCategory = {
      id: Date.now(),
      label: 'New Category',
      amount: 1,
      color: 'bg-gray-500',
      icon: '⭐',
      description: 'Custom XP category'
    };
    setEditingCategories([...editingCategories, newCategory]);
  };

  const removeCategory = (index) => {
    const updated = editingCategories.filter((_, i) => i !== index);
    setEditingCategories(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Edit XP Categories</h2>
          <p className="text-purple-100 mt-1">Customize your classroom's reward system</p>
        </div>

        <div className="p-6 space-y-4">
          {editingCategories.map((category, index) => (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800">Category {index + 1}</h4>
                {editingCategories.length > 1 && (
                  <button
                    onClick={() => removeCategory(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label:
                  </label>
                  <input
                    type="text"
                    value={category.label}
                    onChange={(e) => handleCategoryChange(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    XP Amount:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={category.amount}
                    onChange={(e) => handleCategoryChange(index, 'amount', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon:
                  </label>
                  <input
                    type="text"
                    value={category.icon}
                    onChange={(e) => handleCategoryChange(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="🌟"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color:
                  </label>
                  <select
                    value={category.color}
                    onChange={(e) => handleCategoryChange(index, 'color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-pink-500">Pink</option>
                    <option value="bg-indigo-500">Indigo</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description:
                </label>
                <textarea
                  value={category.description}
                  onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Describe what this category represents..."
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={addNewCategory}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            + Add New Category
          </button>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Save Categories
          </button>
        </div>
      </div>
    </div>
  );
};

export default XPAwardModal;