// ShopTab.js - Complete Working Shop with Inventory System
import React, { useState } from 'react';

// Shop Items Configuration
const SHOP_ITEMS = [
  // Accessories
  {
    id: 'crown_gold',
    name: 'Golden Crown',
    description: 'A magnificent golden crown for true champions',
    icon: '👑',
    price: 25,
    category: 'accessories',
    rarity: 'epic',
    type: 'accessory'
  },
  {
    id: 'glasses_cool',
    name: 'Cool Sunglasses',
    description: 'Look stylish with these awesome shades',
    icon: '🕶️',
    price: 15,
    category: 'accessories',
    rarity: 'rare',
    type: 'accessory'
  },
  {
    id: 'hat_wizard',
    name: 'Wizard Hat',
    description: 'Channel your inner wizard with this magical hat',
    icon: '🧙‍♂️',
    price: 20,
    category: 'accessories',
    rarity: 'rare',
    type: 'accessory'
  },
  {
    id: 'cape_hero',
    name: 'Hero Cape',
    description: 'Every hero needs a cape!',
    icon: '🦸‍♂️',
    price: 30,
    category: 'accessories',
    rarity: 'epic',
    type: 'accessory'
  },

  // Power-ups
  {
    id: 'boost_xp',
    name: 'XP Boost',
    description: 'Double XP for your next achievement!',
    icon: '⚡',
    price: 20,
    category: 'powerups',
    rarity: 'rare',
    type: 'powerup'
  },
  {
    id: 'luck_charm',
    name: 'Lucky Charm',
    description: 'Increases your luck in everything!',
    icon: '🍀',
    price: 15,
    category: 'powerups',
    rarity: 'common',
    type: 'powerup'
  },
  {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Stop time for 10 seconds during activities',
    icon: '⏰',
    price: 35,
    category: 'powerups',
    rarity: 'legendary',
    type: 'powerup'
  },

  // Trophies
  {
    id: 'trophy_bronze',
    name: 'Bronze Trophy',
    description: 'A shiny bronze trophy for your achievements',
    icon: '🥉',
    price: 10,
    category: 'trophies',
    rarity: 'common',
    type: 'trophy'
  },
  {
    id: 'trophy_silver',
    name: 'Silver Trophy',
    description: 'A gleaming silver trophy',
    icon: '🥈',
    price: 20,
    category: 'trophies',
    rarity: 'rare',
    type: 'trophy'
  },
  {
    id: 'trophy_gold',
    name: 'Gold Trophy',
    description: 'The ultimate golden trophy!',
    icon: '🥇',
    price: 35,
    category: 'trophies',
    rarity: 'epic',
    type: 'trophy'
  },

  // Loot Boxes
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 3 random items of various rarities',
    icon: '📦',
    price: 25,
    category: 'lootboxes',
    rarity: 'common',
    type: 'lootbox',
    contents: {
      count: 3,
      rarityBonus: 0,
      guaranteedRare: false
    }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 5 random items with guaranteed rare+',
    icon: '✨',
    price: 50,
    category: 'lootboxes',
    rarity: 'epic',
    type: 'lootbox',
    contents: {
      count: 5,
      rarityBonus: 10,
      guaranteedRare: true
    }
  }
];

// Item Rarities
const ITEM_RARITIES = {
  common: {
    name: 'Common',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    chance: 60
  },
  rare: {
    name: 'Rare',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    chance: 25
  },
  epic: {
    name: 'Epic',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    chance: 10
  },
  legendary: {
    name: 'Legendary',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    chance: 5
  }
};

// Loot Box Items Pool
const LOOT_BOX_ITEMS = [
  // Common items
  { id: 'sticker_star', name: 'Star Sticker', icon: '⭐', rarity: 'common', type: 'collectible' },
  { id: 'sticker_heart', name: 'Heart Sticker', icon: '💖', rarity: 'common', type: 'collectible' },
  { id: 'badge_good', name: 'Good Student Badge', icon: '😊', rarity: 'common', type: 'badge' },
  
  // Rare items
  { id: 'gem_blue', name: 'Blue Gem', icon: '💎', rarity: 'rare', type: 'collectible' },
  { id: 'medal_bronze', name: 'Bronze Medal', icon: '🏅', rarity: 'rare', type: 'award' },
  { id: 'book_magic', name: 'Magic Book', icon: '📚', rarity: 'rare', type: 'accessory' },
  
  // Epic items
  { id: 'sword_hero', name: 'Hero Sword', icon: '⚔️', rarity: 'epic', type: 'accessory' },
  { id: 'shield_knight', name: 'Knight Shield', icon: '🛡️', rarity: 'epic', type: 'accessory' },
  
  // Legendary items
  { id: 'crown_diamond', name: 'Diamond Crown', icon: '💎👑', rarity: 'legendary', type: 'accessory' },
  { id: 'staff_wizard', name: 'Wizard Staff', icon: '🔮', rarity: 'legendary', type: 'accessory' }
];

const ShopTab = ({ 
  students, 
  setStudents, 
  showToast,
  saveStudentsToFirebase 
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('accessories');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(null);

  // Constants
  const COINS_PER_XP = 5; // 5 XP = 1 coin

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

    // Generate loot box rewards
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
    showToast(`${selectedStudent.firstName} opened ${lootBox.name} and got: ${rewardNames}! 🎁`);
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
  const filteredItems = SHOP_ITEMS.filter(item => item.category === activeCategory);

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
                    if (showPurchaseModal.type === 'lootbox') {
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

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                🎒 {showInventoryModal.firstName}'s Inventory
              </h2>
              <CurrencyDisplay student={showInventoryModal} />
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {(showInventoryModal.inventory || []).length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500 italic">No items in inventory yet!</p>
                  <p className="text-gray-400 text-sm">Purchase items from the shop to fill your inventory.</p>
                </div>
              ) : (
                (showInventoryModal.inventory || []).map((item, index) => {
                  const rarity = getRarityStyles(item.rarity);
                  return (
                    <div key={index} className={`${rarity.bg} border-2 ${rarity.border} rounded-lg p-3 text-center`}>
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-semibold text-gray-800">{item.name}</div>
                      <div className={`text-xs ${rarity.text}`}>{ITEM_RARITIES[item.rarity].name}</div>
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