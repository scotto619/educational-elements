// components/tabs/ShopTab.js - Avatar and Pet Marketplace
import React, { useState } from 'react';

// ===============================================
// SHOP DATA
// ===============================================

const AVAILABLE_AVATARS = [
  'Alchemist F', 'Archer F', 'Archer M', 'Bard F', 'Bard M', 'Druid F', 'Druid M',
  'Knight F', 'Knight M', 'Mage F', 'Mage M', 'Paladin F', 'Paladin M', 
  'Ranger F', 'Ranger M', 'Rogue F', 'Rogue M', 'Warrior F', 'Warrior M', 'Wizard F', 'Wizard M'
];

const PET_SPECIES = [
  { name: 'Dragon', emoji: '🐉', rarity: 'rare', price: 25 },
  { name: 'Phoenix', emoji: '🔥', rarity: 'epic', price: 40 },
  { name: 'Unicorn', emoji: '🦄', rarity: 'legendary', price: 60 },
  { name: 'Wolf', emoji: '🐺', rarity: 'common', price: 15 },
  { name: 'Owl', emoji: '🦉', rarity: 'common', price: 15 },
  { name: 'Cat', emoji: '🐱', rarity: 'common', price: 15 },
  { name: 'Tiger', emoji: '🐅', rarity: 'rare', price: 25 },
  { name: 'Bear', emoji: '🐻', rarity: 'common', price: 15 },
  { name: 'Lion', emoji: '🦁', rarity: 'rare', price: 25 },
  { name: 'Eagle', emoji: '🦅', rarity: 'rare', price: 25 }
];

const TEACHER_REWARDS = [
  { id: 1, name: 'Extra Computer Time', price: 20, category: 'technology', icon: '💻' },
  { id: 2, name: 'Class Game Session', price: 30, category: 'fun', icon: '🎮' },
  { id: 3, name: 'No Homework Pass', price: 25, category: 'privileges', icon: '📝' },
  { id: 4, name: 'Choose Class Music', price: 15, category: 'privileges', icon: '🎵' },
  { id: 5, name: 'Line Leader for Week', price: 10, category: 'privileges', icon: '👑' },
  { id: 6, name: 'Special Snack', price: 12, category: 'treats', icon: '🍪' }
];

// ===============================================
// SHOP TAB COMPONENT
// ===============================================

const ShopTab = ({ 
  students = [], 
  updateStudent,
  showToast = () => {} 
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('avatars');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  // Utility functions
  const getAvatarImage = (avatarBase, level = 1) => {
    if (!avatarBase) return '/avatars/Wizard F/Level 1.png';
    const validLevel = Math.max(1, Math.min(level || 1, 4));
    return `/avatars/${avatarBase}/Level ${validLevel}.png`;
  };

  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / 5);
    const bonusCoins = student?.currency || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  const generatePetName = (species) => {
    const prefixes = ['Shadow', 'Storm', 'Fire', 'Swift', 'Noble', 'Brave', 'Mystic', 'Golden'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix} ${species}`;
  };

  // Handle purchases
  const handlePurchase = (item, type) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }

    const student = students.find(s => s.id === selectedStudent.id);
    const studentCoins = calculateCoins(student);
    const itemPrice = type === 'pet' ? item.price : 20; // Avatars cost 20 coins

    if (studentCoins < itemPrice) {
      showToast(`${student.firstName} needs ${itemPrice - studentCoins} more coins!`, 'error');
      return;
    }

    // Check if student already owns this item
    if (type === 'avatar' && student.ownedAvatars?.includes(item)) {
      showToast(`${student.firstName} already owns this avatar!`, 'error');
      return;
    }

    // Process purchase
    const updatedStudent = { ...student };
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + itemPrice;

    if (type === 'avatar') {
      updatedStudent.ownedAvatars = [...(updatedStudent.ownedAvatars || []), item];
      updatedStudent.avatarBase = item;
      updatedStudent.avatar = getAvatarImage(item, updatedStudent.avatarLevel || 1);
      showToast(`${student.firstName} bought ${item} avatar!`, 'success');
    } else if (type === 'pet') {
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: generatePetName(item.name),
        emoji: item.emoji,
        type: item.name.toLowerCase(),
        rarity: item.rarity,
        speed: Math.random() * 0.5 + 0.5
      };
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      showToast(`${student.firstName} adopted ${newPet.name}!`, 'success');
    } else if (type === 'reward') {
      updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), {
        ...item,
        purchasedAt: new Date().toISOString()
      }];
      showToast(`${student.firstName} earned ${item.name}!`, 'success');
    }

    updateStudent(updatedStudent);
    setShowPurchaseModal(null);
  };

  // Categories
  const categories = [
    { id: 'avatars', name: 'Avatars', icon: '🧙‍♂️' },
    { id: 'pets', name: 'Pets', icon: '🐾' },
    { id: 'rewards', name: 'Class Rewards', icon: '🎁' }
  ];

  return (
    <div className="space-y-6">
      {/* Student Selector */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🛒 Select a Champion to Shop</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={getAvatarImage(student.avatarBase || 'Wizard F', student.avatarLevel || 1)}
                alt={`${student.firstName}'s Avatar`}
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
              <p className="text-sm font-semibold">{student.firstName}</p>
              <p className="text-xs text-yellow-600">🪙 {calculateCoins(student)}</p>
            </button>
          ))}
        </div>

        {selectedStudent && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={getAvatarImage(selectedStudent.avatarBase || 'Wizard F', selectedStudent.avatarLevel || 1)}
                  alt={`${selectedStudent.firstName}'s Avatar`}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h4>
                  <p className="text-yellow-600 font-semibold">
                    🪙 {calculateCoins(selectedStudent)} coins available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInventoryModal(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                View Inventory
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && (
        <>
          {/* Category Selector */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex space-x-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeCategory === category.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Shop Items */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            {activeCategory === 'avatars' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🧙‍♂️ Avatar Collection</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {AVAILABLE_AVATARS.map(avatar => {
                    const owned = selectedStudent.ownedAvatars?.includes(avatar);
                    const canAfford = calculateCoins(selectedStudent) >= 20;

                    return (
                      <div
                        key={avatar}
                        className={`border-2 rounded-lg p-4 text-center transition-all ${
                          owned 
                            ? 'border-green-500 bg-green-50'
                            : canAfford
                            ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
                            : 'border-gray-200 opacity-50'
                        }`}
                        onClick={() => !owned && canAfford && setShowPurchaseModal({ item: avatar, type: 'avatar', price: 20 })}
                      >
                        <img 
                          src={getAvatarImage(avatar, 1)}
                          alt={avatar}
                          className="w-16 h-16 rounded-full mx-auto mb-2"
                          onError={(e) => {
                            e.target.src = '/avatars/Wizard F/Level 1.png';
                          }}
                        />
                        <p className="text-sm font-semibold text-gray-800">{avatar}</p>
                        {owned ? (
                          <p className="text-xs text-green-600 font-bold">✅ Owned</p>
                        ) : (
                          <p className="text-xs text-yellow-600">🪙 20 coins</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === 'pets' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🐾 Pet Companions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {PET_SPECIES.map(pet => {
                    const canAfford = calculateCoins(selectedStudent) >= pet.price;
                    const rarityColors = {
                      common: 'border-gray-300',
                      rare: 'border-blue-400',
                      epic: 'border-purple-400',
                      legendary: 'border-yellow-400'
                    };

                    return (
                      <div
                        key={pet.name}
                        className={`border-2 rounded-lg p-4 text-center transition-all ${
                          rarityColors[pet.rarity]
                        } ${canAfford ? 'hover:shadow-lg cursor-pointer' : 'opacity-50'}`}
                        onClick={() => canAfford && setShowPurchaseModal({ item: pet, type: 'pet', price: pet.price })}
                      >
                        <div className="text-4xl mb-2">{pet.emoji}</div>
                        <p className="text-sm font-semibold text-gray-800">{pet.name}</p>
                        <p className="text-xs text-gray-500 capitalize mb-1">{pet.rarity}</p>
                        <p className="text-xs text-yellow-600">🪙 {pet.price} coins</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCategory === 'rewards' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎁 Class Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TEACHER_REWARDS.map(reward => {
                    const canAfford = calculateCoins(selectedStudent) >= reward.price;

                    return (
                      <div
                        key={reward.id}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          canAfford 
                            ? 'border-gray-200 hover:border-blue-300 cursor-pointer hover:shadow-lg' 
                            : 'border-gray-200 opacity-50'
                        }`}
                        onClick={() => canAfford && setShowPurchaseModal({ item: reward, type: 'reward', price: reward.price })}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{reward.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{reward.name}</h4>
                            <p className="text-xs text-gray-500 capitalize">{reward.category}</p>
                            <p className="text-sm text-yellow-600 font-semibold">🪙 {reward.price} coins</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Confirm Purchase</h2>
            </div>
            
            <div className="p-6 text-center">
              {showPurchaseModal.type === 'avatar' && (
                <>
                  <img 
                    src={getAvatarImage(showPurchaseModal.item, 1)}
                    alt={showPurchaseModal.item}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-200"
                  />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {showPurchaseModal.item} Avatar
                  </h3>
                </>
              )}
              
              {showPurchaseModal.type === 'pet' && (
                <>
                  <div className="text-6xl mb-4">{showPurchaseModal.item.emoji}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {showPurchaseModal.item.name} Pet
                  </h3>
                  <p className="text-sm text-gray-500 capitalize mb-2">
                    {showPurchaseModal.item.rarity} companion
                  </p>
                </>
              )}
              
              {showPurchaseModal.type === 'reward' && (
                <>
                  <div className="text-6xl mb-4">{showPurchaseModal.item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {showPurchaseModal.item.name}
                  </h3>
                </>
              )}
              
              <p className="text-yellow-600 font-semibold text-lg mb-4">
                🪙 {showPurchaseModal.price} coins
              </p>
              
              <p className="text-gray-600">
                {selectedStudent?.firstName} will have{' '}
                <span className="font-semibold">
                  {calculateCoins(selectedStudent) - showPurchaseModal.price} coins
                </span>{' '}
                remaining.
              </p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(showPurchaseModal.item, showPurchaseModal.type)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {selectedStudent.firstName}'s Inventory
                </h2>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-white hover:text-red-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Owned Avatars */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🧙‍♂️ Owned Avatars</h3>
                <div className="grid grid-cols-4 gap-3">
                  {(selectedStudent.ownedAvatars || ['Wizard F']).map(avatar => (
                    <div key={avatar} className="text-center">
                      <img 
                        src={getAvatarImage(avatar, 1)}
                        alt={avatar}
                        className={`w-16 h-16 rounded-full mx-auto mb-2 border-2 ${
                          selectedStudent.avatarBase === avatar 
                            ? 'border-blue-500' 
                            : 'border-gray-200'
                        }`}
                      />
                      <p className="text-xs font-medium">{avatar}</p>
                      {selectedStudent.avatarBase === avatar && (
                        <p className="text-xs text-blue-600">Active</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Owned Pets */}
              {selectedStudent.ownedPets && selectedStudent.ownedPets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">🐾 Pet Companions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedStudent.ownedPets.map(pet => (
                      <div key={pet.id} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-3xl mb-2">{pet.emoji}</div>
                        <p className="text-sm font-semibold">{pet.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{pet.rarity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchased Rewards */}
              {selectedStudent.rewardsPurchased && selectedStudent.rewardsPurchased.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">🎁 Earned Rewards</h3>
                  <div className="space-y-2">
                    {selectedStudent.rewardsPurchased.map((reward, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl">{reward.icon}</div>
                        <div className="flex-1">
                          <p className="font-semibold">{reward.name}</p>
                          <p className="text-xs text-gray-500">
                            Earned: {new Date(reward.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;