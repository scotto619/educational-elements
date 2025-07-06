// ShopTab.js - Complete Shop Component with Working Student Selection
import React, { useState } from 'react';

export default function ShopTab({
  students,
  selectedStudent,
  setSelectedStudent,
  handleShopPurchase,
  handleLootBoxPurchase,
  calculateCoins,
  canAfford,
  SHOP_ITEMS,
  ITEM_RARITIES,
  CurrencyDisplay,
  showToast
}) {
  const [activeCategory, setActiveCategory] = useState('accessories');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);

  // Fixed: Proper student selection for shop
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    console.log('Shop: Selected student:', student.firstName);
  };

  const categories = [
    { id: 'accessories', name: 'Accessories', icon: '👑' },
    { id: 'powerups', name: 'Power-ups', icon: '⚡' },
    { id: 'lootboxes', name: 'Loot Boxes', icon: '📦' },
    { id: 'trophies', name: 'Trophies', icon: '🏆' }
  ];

  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

  const handlePurchase = (item) => {
    if (!selectedStudent) {
      alert('Please select a student first!');
      return;
    }

    if (item.type === 'lootbox') {
      handleLootBoxPurchase(selectedStudent, item);
    } else {
      handleShopPurchase(selectedStudent, item);
    }
    setShowPurchaseModal(null);
  };

  const getRarityStyles = (rarity) => {
    const rarityInfo = ITEM_RARITIES[rarity];
    return {
      bg: rarityInfo.bgColor,
      text: rarityInfo.textColor,
      border: rarityInfo.borderColor
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏪 Classroom Shop</h2>
        <p className="text-gray-600">Spend your hard-earned coins on amazing rewards!</p>
      </div>

      {/* Student Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">👤 Select Student</h3>
        
        {students.length === 0 ? (
          <p className="text-gray-500 italic">No students available</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {students.map(student => {
              const coins = calculateCoins(student.totalPoints || 0);
              const isSelected = selectedStudent?.id === student.id;
              
              return (
                <button
                  key={student.id}
                  onClick={() => handleStudentSelect(student)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-100 transform scale-105' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {student.avatar && (
                      <img 
                        src={student.avatar} 
                        alt={student.firstName}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{student.firstName}</p>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-600 font-bold">🪙</span>
                        <span className="text-yellow-800 font-bold text-sm">{coins}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Student Display */}
        {selectedStudent && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-300">
            <h4 className="font-bold text-blue-800 mb-2">Shopping for: {selectedStudent.firstName}</h4>
            <CurrencyDisplay student={selectedStudent} />
          </div>
        )}
      </div>

      {/* Category Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-md transition-all flex items-center space-x-2 ${
                activeCategory === category.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span>{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shop Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const rarity = getRarityStyles(item.rarity);
          const canBuy = selectedStudent ? canAfford(selectedStudent, item.price) : false;
          
          return (
            <div
              key={item.id}
              className={`${rarity.bg} border-2 ${rarity.border} rounded-xl p-6 transition-all hover:transform hover:scale-105 hover:shadow-lg`}
            >
              {/* Item Header */}
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${rarity.text} bg-white bg-opacity-70`}>
                  {ITEM_RARITIES[item.rarity].name}
                </span>
              </div>

              {/* Item Description */}
              <p className="text-gray-700 text-center mb-4 text-sm">{item.description}</p>

              {/* Price and Purchase */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span className="text-yellow-600 text-xl">🪙</span>
                  <span className="text-2xl font-bold text-yellow-800">{item.price}</span>
                </div>

                <button
                  onClick={() => setShowPurchaseModal(item)}
                  disabled={!selectedStudent || !canBuy}
                  className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                    !selectedStudent
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : !canBuy
                      ? 'bg-red-100 text-red-600 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {!selectedStudent 
                    ? 'Select Student' 
                    : !canBuy 
                    ? 'Not Enough Coins' 
                    : 'Purchase'
                  }
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items available in this category yet!</p>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="text-6xl mb-4">{showPurchaseModal.icon}</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Confirm Purchase</h2>
              <p className="text-gray-600 mb-2">
                <strong>{selectedStudent?.firstName}</strong> wants to buy:
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">{showPurchaseModal.name}</p>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="text-yellow-600 text-2xl">🪙</span>
                <span className="text-2xl font-bold text-yellow-800">{showPurchaseModal.price}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(showPurchaseModal)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}