// CharacterSheetModal.js - Enhanced with Full Screen Image Viewing
import React, { useState } from 'react';
import FullScreenImageViewer from '../FullScreenImageViewer';

const CharacterSheetModal = ({ 
  selectedStudent, 
  setSelectedStudent, 
  handleAvatarClick,
  calculateCoins 
}) => {
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  if (!selectedStudent) return null;

  const student = selectedStudent;
  const coins = calculateCoins(student);

  // Calculate category percentages
  const categoryTotals = student.categoryTotal || {};
  const totalCategoryXP = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
  
  const categoryPercentages = {
    Respectful: totalCategoryXP > 0 ? Math.round((categoryTotals.Respectful || 0) / totalCategoryXP * 100) : 0,
    Responsible: totalCategoryXP > 0 ? Math.round((categoryTotals.Responsible || 0) / totalCategoryXP * 100) : 0,
    Learner: totalCategoryXP > 0 ? Math.round((categoryTotals.Learner || 0) / totalCategoryXP * 100) : 0
  };

  // Calculate XP needed for next level
  const currentLevel = student.avatarLevel;
  const nextLevelXP = currentLevel * 100;
  const xpProgress = Math.min((student.totalPoints || 0) / nextLevelXP * 100, 100);

  // Calculate coin breakdown
  const xpCoins = Math.floor((student.totalPoints || 0) / 5);
  const bonusCoins = student.coins || 0;

  // Handle hover for full screen viewing
  const handleImageHover = (imageSrc, title, subtitle) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    const timeout = setTimeout(() => {
      setFullScreenImage({
        src: imageSrc,
        title,
        subtitle
      });
    }, 500); // 500ms delay before showing full screen

    setHoverTimeout(timeout);
  };

  const handleImageLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Character Sheet</h2>
            <button
              onClick={() => setSelectedStudent(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Avatar and Basic Info */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {student.avatar ? (
                <div className="relative group">
                  <img
                    src={student.avatar}
                    alt={student.firstName}
                    className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-400"
                    onClick={() => handleAvatarClick(student.id)}
                    onMouseEnter={() => handleImageHover(
                      student.avatar, 
                      `${student.firstName}'s Avatar`,
                      `Level ${student.avatarLevel} Champion`
                    )}
                    onMouseLeave={handleImageLeave}
                  />
                  {/* Hover indicator */}
                  <div className="absolute inset-0 rounded-full bg-blue-500 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-bold bg-black bg-opacity-50 px-2 py-1 rounded">
                      🔍 Full View
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => handleAvatarClick(student.id)}
                >
                  {student.firstName.charAt(0)}
                </div>
              )}
              
              {/* Pet in corner */}
              {student.pet?.image && (
                <div className="absolute -top-2 -left-2 group">
                  <img
                    src={student.pet.image}
                    alt="Pet"
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-110 hover:border-purple-400"
                    onMouseEnter={() => handleImageHover(
                      student.pet.image,
                      `${student.pet.name || 'Pet Companion'}`,
                      `Level ${student.pet.level || 1} • Speed: ${(student.pet.speed || 1).toFixed(2)} • 🏆 ${student.pet.wins || 0} wins`
                    )}
                    onMouseLeave={handleImageLeave}
                  />
                  {/* Pet hover indicator */}
                  <div className="absolute inset-0 rounded-full bg-purple-500 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-bold bg-black bg-opacity-70 px-1 py-0.5 rounded whitespace-nowrap">
                      🔍 View Pet
                    </div>
                  </div>
                </div>
              )}
              
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-lg font-bold px-3 py-1 rounded-full shadow-lg">
                ⭐{student.avatarLevel}
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mt-4">{student.firstName}</h3>
            <p className="text-gray-600">Level {student.avatarLevel} Champion</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{student.totalPoints || 0}</div>
              <div className="text-sm text-green-700">Total XP</div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center">
                <span className="mr-1">💰</span>
                {coins}
              </div>
              <div className="text-sm text-yellow-700">Coins</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Level Progress</span>
              <span className="text-sm text-gray-600">
                {Math.round(xpProgress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            {currentLevel < 4 && (
              <p className="text-xs text-gray-500 mt-1">
                {nextLevelXP - (student.totalPoints || 0)} XP needed for Level {currentLevel + 1}
              </p>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">XP Breakdown</h4>
            <div className="space-y-3">
              {[
                { key: 'Respectful', icon: '👍', color: 'blue' },
                { key: 'Responsible', icon: '💼', color: 'green' },
                { key: 'Learner', icon: '📚', color: 'purple' }
              ].map((category) => (
                <div key={category.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="font-medium text-gray-800">{category.key}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-${category.color}-600`}>
                      {categoryTotals[category.key] || 0} XP
                    </div>
                    <div className="text-xs text-gray-500">
                      {categoryPercentages[category.key]}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pet Information */}
          {student.pet?.image && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Pet Companion</h4>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="group relative">
                    <img 
                      src={student.pet.image} 
                      alt="Pet" 
                      className="w-16 h-16 rounded-full border-2 border-purple-300 cursor-pointer hover:border-purple-500 transition-all duration-300 hover:scale-110"
                      onMouseEnter={() => handleImageHover(
                        student.pet.image,
                        `${student.pet.name || 'Pet Companion'}`,
                        `Level ${student.pet.level || 1} • Speed: ${(student.pet.speed || 1).toFixed(2)} • 🏆 ${student.pet.wins || 0} wins`
                      )}
                      onMouseLeave={handleImageLeave}
                    />
                    {/* Pet hover indicator */}
                    <div className="absolute inset-0 rounded-full bg-purple-500 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-bold bg-black bg-opacity-70 px-1 py-0.5 rounded">
                        🔍
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-purple-800">
                      {student.pet.name || 'Unnamed Pet'}
                    </h5>
                    <p className="text-sm text-purple-600">
                      Level {student.pet.level || 1} • Speed: {(student.pet.speed || 1).toFixed(2)}
                    </p>
                    <p className="text-sm text-purple-600">
                      🏆 {student.pet.wins || 0} race wins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Preview */}
          {(student.inventory?.length > 0 || student.lootBoxes?.length > 0) && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Inventory Highlights</h4>
              <div className="grid grid-cols-4 gap-2">
                {[...(student.inventory || []), ...(student.lootBoxes || [])].slice(0, 8).map((item, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded-lg text-center hover:bg-gray-100 transition-colors">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-xs text-gray-600">{item.name}</div>
                  </div>
                ))}
              </div>
              {(student.inventory?.length + student.lootBoxes?.length) > 8 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  +{(student.inventory?.length || 0) + (student.lootBoxes?.length || 0) - 8} more items
                </p>
              )}
            </div>
          )}

          {/* Recent Activity */}
          {student.logs && student.logs.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {student.logs.slice(-5).reverse().map((log, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded flex justify-between items-center">
                    <span className="text-gray-700">
                      {log.type === 'purchase' ? '🛒 Shop Purchase' : 
                       log.type === 'quest_coins' ? '💰 Quest Reward' :
                       log.type === 'reset' ? '🔄 Points Reset' : 
                       `${log.type === 'Respectful' ? '👍' : log.type === 'Responsible' ? '💼' : log.type === 'Learner' ? '📚' : '⭐'} ${log.type}`}
                    </span>
                    <span className={`font-medium ${
                      log.amount > 0 ? 'text-green-600' : 
                      log.amount < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {log.amount > 0 ? '+' : ''}{log.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💰 Financial Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-yellow-700">Total XP Earned:</span>
                <span className="font-semibold ml-2 text-yellow-800">{student.totalPoints || 0}</span>
              </div>
              <div>
                <span className="text-yellow-700">Coins Available:</span>
                <span className="font-semibold ml-2 text-yellow-800 flex items-center">
                  <span className="mr-1">💰</span>
                  {coins}
                </span>
              </div>
              <div>
                <span className="text-yellow-700">Coins Spent:</span>
                <span className="font-semibold ml-2 text-yellow-800">{student.coinsSpent || 0}</span>
              </div>
              <div>
                <span className="text-yellow-700">Shopping Power:</span>
                <span className="font-semibold ml-2 text-yellow-800">
                  {coins === 0 ? 'Save more XP!' : 
                   coins < 5 ? 'Basic items' : 
                   coins < 10 ? 'Good selection' : 'Premium items!'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => handleAvatarClick(student.id)}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Change Avatar
            </button>
            <button
              onClick={() => setSelectedStudent(null)}
              className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer */}
      <FullScreenImageViewer
        src={fullScreenImage?.src}
        alt={fullScreenImage?.title || 'Character Image'}
        title={fullScreenImage?.title}
        subtitle={fullScreenImage?.subtitle}
        isVisible={!!fullScreenImage}
        onClose={closeFullScreen}
      />
    </>
  );
};

export default CharacterSheetModal;