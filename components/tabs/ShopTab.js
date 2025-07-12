// ShopTab.js - Complete Shop & Sell System with Full UI Integration
import React, { useState } from 'react';

const ShopTab = ({ students, setStudents, saveStudentsToFirebase, showToast }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('accessories');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(null);

  // Constants
  const COINS_PER_XP = 5; // 5 XP = 1 coin
  
  // Sell values based on rarity
  const SELL_VALUES = {
    common: 1,
    rare: 5,
    epic: 10,
    legendary: 15
  };

  // Item rarities with styles
  const ITEM_RARITIES = {
    common: {
      name: 'Common',
      chance: 60,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    },
    rare: {
      name: 'Rare',
      chance: 25,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300'
    },
    epic: {
      name: 'Epic',
      chance: 10,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300'
    },
    legendary: {
      name: 'Legendary',
      chance: 5,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300'
    }
  };

  // Shop items
  const SHOP_ITEMS = [
    // Accessories
    { id: 'crown', name: 'Golden Crown', icon: '👑', price: 15, rarity: 'epic', category: 'accessories', description: 'Majestic crown fit for a classroom champion!' },
    { id: 'cape', name: 'Hero Cape', icon: '🦸', price: 10, rarity: 'rare', category: 'accessories', description: 'Every hero needs a cape!' },
    { id: 'medal', name: 'Bronze Medal', icon: '🥉', price: 3, rarity: 'common', category: 'accessories', description: 'Your first step to greatness!' },
    { id: 'glasses', name: 'Smart Glasses', icon: '🤓', price: 8, rarity: 'rare', category: 'accessories', description: 'Intelligence +10!' },
    { id: 'hat', name: 'Wizard Hat', icon: '🧙', price: 12, rarity: 'epic', category: 'accessories', description: 'Magical wisdom awaits!' },
    
    // Power-ups
    { id: 'lightning', name: 'Lightning Bolt', icon: '⚡', price: 6, rarity: 'rare', category: 'powerups', description: 'Instant energy boost!' },
    { id: 'star', name: 'Power Star', icon: '⭐', price: 20, rarity: 'legendary', category: 'powerups', description: 'Ultimate power boost!' },
    { id: 'shield', name: 'Protection Shield', icon: '🛡️', price: 8, rarity: 'rare', category: 'powerups', description: 'Protects from point loss!' },
    { id: 'rocket', name: 'Speed Rocket', icon: '🚀', price: 15, rarity: 'epic', category: 'powerups', description: 'Zoom past the competition!' },
    
    // Trophies
    { id: 'trophy_gold', name: 'Golden Trophy', icon: '🏆', price: 25, rarity: 'legendary', category: 'trophies', description: 'The ultimate achievement!' },
    { id: 'trophy_silver', name: 'Silver Trophy', icon: '🥈', price: 12, rarity: 'epic', category: 'trophies', description: 'Outstanding performance!' },
    { id: 'trophy_bronze', name: 'Bronze Trophy', icon: '🥉', price: 5, rarity: 'rare', category: 'trophies', description: 'Great job!' },
    { id: 'ribbon', name: 'Achievement Ribbon', icon: '🎗️', price: 3, rarity: 'common', category: 'trophies', description: 'Recognition of effort!' }
  ];

  // Loot boxes
  const LOOT_BOXES = [
    {
      id: 'basic_box',
      name: 'Basic Loot Box',
      icon: '📦',
      price: 10,
      rarity: 'common',
      category: 'lootboxes',
      description: 'Contains 3 random items',
      contents: { count: 3, rarityBonus: 0, guaranteedRare: false }
    },
    {
      id: 'premium_box',
      name: 'Premium Loot Box',
      icon: '🎁',
      price: 20,
      rarity: 'rare',
      category: 'lootboxes',
      description: 'Contains 5 random items with better chances',
      contents: { count: 5, rarityBonus: 15, guaranteedRare: true }
    },
    {
      id: 'legendary_box',
      name: 'Legendary Loot Box',
      icon: '💎',
      price: 35,
      rarity: 'legendary',
      category: 'lootboxes',
      description: 'Contains 7 random items with premium chances',
      contents: { count: 7, rarityBonus: 30, guaranteedRare: true }
    }
  ];

  // Loot box possible items
  const LOOT_BOX_ITEMS = [
    ...SHOP_ITEMS,
    // Additional exclusive loot box items
    { id: 'gem_red', name: 'Ruby Gem', icon: '💎', rarity: 'legendary' },
    { id: 'gem_blue', name: 'Sapphire Gem', icon: '💠', rarity: 'epic' },
    { id: 'gem_green', name: 'Emerald Gem', icon: '💚', rarity: 'rare' },
    { id: 'coin_stack', name: 'Coin Stack', icon: '🪙', rarity: 'common' }
  ];

  // Categories
  const categories = [
    { id: 'accessories', name: 'Accessories', icon: '👑' },
    { id: 'powerups', name: 'Power-ups', icon: '⚡' },
    { id: 'trophies', name: 'Trophies', icon: '🏆' },
    { id: 'lootboxes', name: 'Loot Boxes', icon: '📦' }
  ];

  // Calculate coins for a student
  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  // Check if student can afford an item
  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    showToast(`Selected ${student.firstName} for shopping!`);
  };

  // Handle purchase
  const handlePurchase = (item) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }

    const cost = item.price;
    const currentCoins = calculateCoins(selectedStudent);

    if (!canAfford(selectedStudent, cost)) {
      showToast(`${selectedStudent.firstName} needs ${cost} coins but only has ${currentCoins}!`, 'error');
      return;
    }

    // Update student with purchase
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id !== selectedStudent.id) return student;

        const newItem = {
          ...item,
          id: `${item.id}_${Date.now()}`,
          purchasedAt: new Date().toISOString()
        };

        const updatedStudent = {
          ...student,
          coinsSpent: (student.coinsSpent || 0) + cost,
          inventory: [...(student.inventory || []), newItem],
          logs: [
            ...(student.logs || []),
            {
              type: 'purchase',
              amount: -cost,
              date: new Date().toISOString(),
              source: 'shop_purchase',
              item: item.name
            }
          ]
        };

        return updatedStudent;
      });

      // Save to Firebase
      if (saveStudentsToFirebase) {
        saveStudentsToFirebase(updatedStudents);
      }

      return updatedStudents;
    });

    // Update selected student state
    setSelectedStudent(prev => ({
      ...prev,
      coinsSpent: (prev.coinsSpent || 0) + cost,
      inventory: [...(prev.inventory || []), {
        ...item,
        id: `${item.id}_${Date.now()}`,
        purchasedAt: new Date().toISOString()
      }]
    }));

    setShowPurchaseModal(null);
    showToast(`${selectedStudent.firstName} purchased ${item.name}! 🎉`);
  };

  // Handle loot box purchase
  const handleLootBoxPurchase = (lootBox) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }

    const cost = lootBox.price;
    const currentCoins = calculateCoins(selectedStudent);

    if (!canAfford(selectedStudent, cost)) {
      showToast(`${selectedStudent.firstName} needs ${cost} coins but only has ${currentCoins}!`, 'error');
      return;
    }

    const rewards = generateLootBoxRewards(lootBox);

    // Update student with loot box purchase
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id !== selectedStudent.id) return student;

        const updatedStudent = {
          ...student,
          coinsSpent: (student.coinsSpent || 0) + cost,
          inventory: [...(student.inventory || []), ...rewards],
          logs: [
            ...(student.logs || []),
            {
              type: 'purchase',
              amount: -cost,
              date: new Date().toISOString(),
              source: 'lootbox_purchase',
              item: lootBox.name
            }
          ]
        };

        return updatedStudent;
      });

      // Save to Firebase
      if (saveStudentsToFirebase) {
        saveStudentsToFirebase(updatedStudents);
      }

      return updatedStudents;
    });

    // Update selected student state
    setSelectedStudent(prev => ({
      ...prev,
      coinsSpent: (prev.coinsSpent || 0) + cost,
      inventory: [...(prev.inventory || []), ...rewards]
    }));

    setShowPurchaseModal(null);
    const rewardNames = rewards.map(r => r.name).join(', ');
    showToast(`${selectedStudent.firstName} opened ${lootBox.name} and got: ${rewardNames}! 🎉`);
  };

  // Handle selling an item - UPDATED WITH PROPER UI INTEGRATION
  const handleSellItem = (student, item, itemIndex) => {
    const sellValue = SELL_VALUES[item.rarity] || 1;
    
    if (window.confirm(`Sell ${item.name} for ${sellValue} coins?`)) {
      // Update student with sold item
      setStudents(prevStudents => {
        const updatedStudents = prevStudents.map(s => {
          if (s.id !== student.id) return s;

          // Remove item from inventory
          const newInventory = [...(s.inventory || [])];
          newInventory.splice(itemIndex, 1);

          const updatedStudent = {
            ...s,
            inventory: newInventory,
            coins: (s.coins || 0) + sellValue, // Add coins as bonus coins
            logs: [
              ...(s.logs || []),
              {
                type: 'sale',
                amount: sellValue,
                date: new Date().toISOString(),
                source: 'item_sale',
                item: item.name
              }
            ]
          };

          return updatedStudent;
        });

        // Save to Firebase
        if (saveStudentsToFirebase) {
          saveStudentsToFirebase(updatedStudents);
        }

        return updatedStudents;
      });

      // Update inventory modal state if it's the same student
      if (showInventoryModal?.id === student.id) {
        setShowInventoryModal(prev => {
          const newInventory = [...(prev.inventory || [])];
          newInventory.splice(itemIndex, 1);
          return {
            ...prev,
            inventory: newInventory,
            coins: (prev.coins || 0) + sellValue
          };
        });
      }

      // Update selected student if it's the same
      if (selectedStudent?.id === student.id) {
        setSelectedStudent(prev => ({
          ...prev,
          coins: (prev.coins || 0) + sellValue
        }));
      }

      showToast(`Sold ${item.name} for ${sellValue} coins! 💰`);
    }
  };

  // Generate loot box rewards
  const generateLootBoxRewards = (lootBox) => {
    const rewards = [];
    const { count, rarityBonus, guaranteedRare } = lootBox.contents;

    for (let i = 0; i < count; i++) {
      let rarity = 'common';
      const roll = Math.random() * 100;
      const adjustedRoll = roll - (rarityBonus || 0);

      if (adjustedRoll <= ITEM_RARITIES.legendary.chance) {
        rarity = 'legendary';
      } else if (adjustedRoll <= ITEM_RARITIES.epic.chance) {
        rarity = 'epic';
      } else if (adjustedRoll <= ITEM_RARITIES.rare.chance) {
        rarity = 'rare';
      } else {
        rarity = 'common';
      }

      // Guarantee at least one rare+ item for premium boxes
      if (guaranteedRare && i === 0 && rarity === 'common') {
        rarity = 'rare';
      }

      const availableItems = LOOT_BOX_ITEMS.filter(item => item.rarity === rarity);
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];

      rewards.push({
        ...randomItem,
        id: `${randomItem.id}_${Date.now()}_${i}`,
        obtainedAt: new Date().toISOString()
      });
    }

    return rewards;
  };

  // Get filtered items
  const filteredItems = activeCategory === 'lootboxes' 
    ? LOOT_BOXES 
    : SHOP_ITEMS.filter(item => item.category === activeCategory);

  // Get rarity styles
  const getRarityStyles = (rarity) => {
    const rarityInfo = ITEM_RARITIES[rarity];
    return {
      bg: rarityInfo.bgColor,
      text: rarityInfo.textColor,
      border: rarityInfo.borderColor
    };
  };

  // Currency Display Component
  const CurrencyDisplay = ({ student }) => {
    const coins = calculateCoins(student);
    const coinsSpent = student?.coinsSpent || 0;
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-yellow-700 font-semibold">Available Coins:</span>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-600 text-xl">🪙</span>
            <span className="text-yellow-800 font-bold text-lg">{coins}</span>
          </div>
        </div>
        <div className="text-xs text-yellow-600 mt-1">
          From XP: {xpCoins} • Bonus: {bonusCoins} • Spent: {coinsSpent}
        </div>
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Classroom Shop</h2>
        <p className="text-gray-700">
          Add students to your class to start shopping!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🏪 Classroom Shop</h2>
        <p className="text-gray-700">Spend your hard-earned coins on amazing rewards!</p>
      </div>

      {/* Student Selection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-4">👤 Select Student to Shop</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map(student => {
            const coins = calculateCoins(student);
            const isSelected = selectedStudent?.id === student.id;
            
            return (
              <button
                key={student.id}
                onClick={() => handleStudentSelect(student)}
                className={`p-3 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-100 transform scale-105 shadow-lg' 
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
                    <p className="font-semibold text-gray-900 truncate">{student.firstName}</p>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-600 font-bold">🪙</span>
                      <span className="text-yellow-800 font-bold text-sm">{coins}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInventoryModal(student);
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm"
                    title="View Inventory"
                  >
                    🎒
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Student Display */}
        {selectedStudent && (
          <div className="mt-4">
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
                  : 'text-gray-700 hover:text-blue-600'
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

              <div className="bg-gray-50 p-3 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Current Balance:</p>
                <p className="text-lg font-bold text-yellow-800 flex items-center justify-center">
                  <span className="mr-1">🪙</span>
                  {calculateCoins(selectedStudent)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPurchaseModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showPurchaseModal.category === 'lootboxes') {
                      handleLootBoxPurchase(showPurchaseModal);
                    } else {
                      handlePurchase(showPurchaseModal);
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Inventory Modal with Selling Functionality */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-96 overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎒 {showInventoryModal.firstName}'s Inventory
              </h2>
              <CurrencyDisplay student={showInventoryModal} />
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-semibold">Sell Values:</span> 
                <span className="ml-2 text-gray-500">Common: 1🪙</span>
                <span className="ml-2 text-blue-600">Rare: 5🪙</span>
                <span className="ml-2 text-purple-600">Epic: 10🪙</span>
                <span className="ml-2 text-yellow-600">Legendary: 15🪙</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {(showInventoryModal.inventory || []).length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 italic">No items in inventory yet!</p>
                  <p className="text-gray-400 text-sm">Purchase items from the shop to fill your inventory.</p>
                </div>
              ) : (
                (showInventoryModal.inventory || []).map((item, index) => {
                  const rarity = getRarityStyles(item.rarity);
                  const sellValue = SELL_VALUES[item.rarity] || 1;
                  
                  return (
                    <div key={index} className={`${rarity.bg} border-2 ${rarity.border} rounded-lg p-3 text-center relative group hover:shadow-lg transition-all`}>
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="text-sm font-semibold text-gray-800 mb-1">{item.name}</div>
                      <div className={`text-xs ${rarity.text} mb-2`}>{ITEM_RARITIES[item.rarity].name}</div>
                      
                      {/* Sell Button */}
                      <button
                        onClick={() => handleSellItem(showInventoryModal, item, index)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded transition-colors font-semibold"
                        title={`Sell for ${sellValue} coins`}
                      >
                        Sell {sellValue}🪙
                      </button>
                      
                      {/* Purchase date tooltip */}
                      {item.purchasedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(item.purchasedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowInventoryModal(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;