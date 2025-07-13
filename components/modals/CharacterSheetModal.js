// CharacterSheetModal.js - FIXED: Coin display and real-time updates + Full Screen Image Preview
import React, { useState } from 'react';

const CharacterSheetModal = ({ 
  selectedStudent, 
  setSelectedStudent, 
  handleAvatarClick,
  calculateCoins 
}) => {
  const [hoveredImage, setHoveredImage] = useState(null);

  if (!selectedStudent) return null;

  const student = selectedStudent;
  const coins = calculateCoins(student); // FIXED: Use the proper coin calculation

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

  // FIXED: Calculate coin breakdown
  const xpCoins = Math.floor((student.totalPoints || 0) / 5); // 1 coin per 5 XP
  const bonusCoins = student.coins || 0; // Bonus coins from quests/other sources

  return (
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
              <img
                src={student.avatar}
                alt={student.firstName}
                className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-105"
                onClick={() => handleAvatarClick(student.id)}
                onMouseEnter={() => setHoveredImage({ src: student.avatar, alt: `${student.firstName}'s Avatar`, type: 'avatar' })}
                onMouseLeave={() => setHoveredImage(null)}
              />
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
              <img
                src={student.pet.image}
                alt="Pet"
                className="w-12 h-12 absolute -top-2 -left-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-110"
                onMouseEnter={() => setHoveredImage({ src: student.pet.image, alt: `${student.pet.name || 'Pet'} - ${student.firstName}'s Companion`, type: 'pet' })}
                onMouseLeave={() => setHoveredImage(null)}
              />
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
            <div className="text-sm text-yellow-700">Coins Available</div>
          </div>
        </div>

        {/* FIXED: Enhanced Coin Breakdown */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">💰 Coin Breakdown</h4>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-800">{xpCoins}</div>
                <div className="text-sm text-yellow-700">From XP</div>
                <div className="text-xs text-yellow-600">(1 per 5 XP)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-800">{bonusCoins}</div>
                <div className="text-sm text-yellow-700">Bonus Coins</div>
                <div className="text-xs text-yellow-600">(Quests/Rewards)</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">-{student.coinsSpent || 0}</div>
                <div className="text-sm text-red-700">Coins Spent</div>
                <div className="text-xs text-red-600">(Shop Purchases)</div>
              </div>
            </div>
            <div className="text-center border-t border-yellow-300 pt-3">
              <div className="text-2xl font-bold text-yellow-800 flex items-center justify-center">
                <span className="mr-2">💰</span>
                {coins} Total Available
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Level {currentLevel} Progress
            </span>
            <span className="text-sm text-gray-500">
              {student.totalPoints || 0} / {nextLevelXP} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
          {currentLevel < 4 && (
            <p className="text-xs text-gray-500 mt-1">
              {nextLevelXP - (student.totalPoints || 0)} XP needed for next level
            </p>
          )}
        </div>

        {/* Category Progress */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">📊 Category Breakdown</h4>
          <div className="space-y-3">
            {['Respectful', 'Responsible', 'Learner'].map(category => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category === 'Respectful' ? '👍 Respectful' : 
                     category === 'Responsible' ? '💼 Responsible' : 
                     '📚 Learner'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {categoryTotals[category] || 0} XP ({categoryPercentages[category]}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      category === 'Respectful' ? 'bg-green-500' : 
                      category === 'Responsible' ? 'bg-blue-500' : 
                      'bg-purple-500'
                    }`}
                    style={{ width: `${categoryPercentages[category]}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pet Information */}
        {student.pet?.image && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🐾 Pet Companion</h4>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-4">
                <img 
                  src={student.pet.image} 
                  alt="Pet" 
                  className="w-16 h-16 rounded-full border-4 border-purple-300 shadow-lg cursor-pointer hover:shadow-xl transition-all transform hover:scale-110"
                  onMouseEnter={() => setHoveredImage({ src: student.pet.image, alt: `${student.pet.name || 'Pet'} - ${student.firstName}'s Companion`, type: 'pet' })}
                  onMouseLeave={() => setHoveredImage(null)}
                />
                <div>
                  <h5 className="text-lg font-bold text-purple-800">
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
            <h4 className="text-lg font-semibold text-gray-800 mb-3">🎒 Inventory Highlights</h4>
            <div className="grid grid-cols-4 gap-2">
              {[...(student.inventory || []), ...(student.lootBoxes || [])].slice(0, 8).map((item, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded-lg text-center">
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
            <h4 className="text-lg font-semibold text-gray-800 mb-3">📋 Recent Activity</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {student.logs.slice(-5).reverse().map((log, index) => (
                <div key={index} className="text-sm p-2 bg-gray-50 rounded flex justify-between items-center">
                  <span className="text-gray-700">
                    {log.type === 'purchase' ? '🛒 Shop Purchase' : 
                     log.type === 'quest_coins' ? '💰 Quest Reward' :
                     log.type === 'reset' ? '🔄 Points Reset' : 
                     `${log.type === 'Respectful' ? '👍' : log.type === 'Responsible' ? '💼' : log.type === 'Learner' ? '📚' : '⭐'} ${log.type}`}
                    {log.item && ` - ${log.item}`}
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

        {/* FIXED: Financial Summary with proper coin icon */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
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

      {/* Full Screen Image Preview Overlay */}
      {hoveredImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] pointer-events-none"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          <div className="relative">
            <img 
              src={hoveredImage.src} 
              alt={hoveredImage.alt}
              className={`max-w-[80vw] max-h-[80vh] object-contain shadow-2xl ${
                hoveredImage.type === 'avatar' ? 'rounded-2xl' : 'rounded-full'
              }`}
              style={{ 
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                transform: 'scale(1.05)'
              }}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-center">{hoveredImage.alt}</p>
                <p className="text-xs text-gray-300 text-center mt-1">
                  {hoveredImage.type === 'avatar' ? '🎭 Character Avatar' : '🐾 Pet Companion'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSheetModal;