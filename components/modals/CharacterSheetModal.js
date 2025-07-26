// components/CharacterSheetModal.js - COMPLETE CHARACTER SHEET IMPLEMENTATION
import React, { useState, useEffect } from 'react';

// ===============================================
// HARDCODED DATA AND UTILITIES
// ===============================================

// All available avatars
const ALL_AVATARS = [
  'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Assassin F', 'Assassin M',
  'Barbarian F', 'Barbarian M', 'Cleric F', 'Cleric M', 'Fighter F', 'Fighter M',
  'Mage F', 'Mage M', 'Paladin F', 'Paladin M', 'Ranger F', 'Ranger M',
  'Rogue F', 'Rogue M', 'Sorcerer F', 'Sorcerer M', 'Warlock F', 'Warlock M',
  'Wizard F', 'Wizard M'
];

// Available pets
const ALL_PETS = [
  { id: 'goblin', name: 'Goblin Pet', image: '/shop/BasicPets/GoblinPet.png', speed: 3, rarity: 'common' },
  { id: 'soccer', name: 'Soccer Pet', image: '/shop/BasicPets/SoccerPet.png', speed: 4, rarity: 'common' },
  { id: 'unicorn', name: 'Unicorn Pet', image: '/shop/BasicPets/UnicornPet.png', speed: 5, rarity: 'uncommon' }
];

// Utility functions
const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) return '/Avatars/Wizard F/Level 1.png';
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  return `/Avatars/${avatarBase}/Level ${validLevel}.png`;
};

const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;
  if (totalXP >= 200) return 3;  
  if (totalXP >= 100) return 2;
  return 1;
};

const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / 5);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

// ===============================================
// MAIN CHARACTER SHEET MODAL COMPONENT
// ===============================================

const CharacterSheetModal = ({ 
  student, 
  isOpen, 
  onClose, 
  onUpdateStudent,
  showToast = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAvatar, setSelectedAvatar] = useState(student?.avatarBase || 'Wizard F');
  const [selectedPet, setSelectedPet] = useState(student?.ownedPets?.[0]?.id || null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [hoverPreview, setHoverPreview] = useState({ show: false, image: '', name: '', x: 0, y: 0 });

  // Update selected items when student changes
  useEffect(() => {
    if (student) {
      setSelectedAvatar(student.avatarBase || 'Wizard F');
      setSelectedPet(student.ownedPets?.[0]?.id || null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  // ===============================================
  // CALCULATED VALUES
  // ===============================================

  const currentLevel = calculateAvatarLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const progressToNext = (student.totalPoints || 0) % 100;
  const progressPercentage = (progressToNext / 100) * 100;
  const equippedPet = student.ownedPets?.find(pet => pet.id === selectedPet) || student.ownedPets?.[0];

  // ===============================================
  // EVENT HANDLERS
  // ===============================================

  const handleImageHover = (e, imageData) => {
    const rect = e.target.getBoundingClientRect();
    setHoverPreview({
      show: true,
      image: imageData.image,
      name: imageData.name,
      x: rect.right + 10,
      y: rect.top
    });
  };

  const hidePreview = () => {
    setHoverPreview({ show: false, image: '', name: '', x: 0, y: 0 });
  };

  const handleAvatarChange = (newAvatarBase) => {
    const updatedStudent = {
      ...student,
      avatarBase: newAvatarBase,
      avatar: getAvatarImage(newAvatarBase, currentLevel),
      ownedAvatars: student.ownedAvatars?.includes(newAvatarBase) 
        ? student.ownedAvatars 
        : [...(student.ownedAvatars || []), newAvatarBase]
    };
    
    onUpdateStudent(updatedStudent);
    setSelectedAvatar(newAvatarBase);
    setShowAvatarSelector(false);
    showToast(`Avatar changed to ${newAvatarBase}!`);
  };

  const handlePetChange = (petId) => {
    const pet = ALL_PETS.find(p => p.id === petId);
    if (!pet) return;

    // Check if student owns this pet
    const ownsPet = student.ownedPets?.some(ownedPet => ownedPet.id === petId);
    if (!ownsPet) {
      showToast('Student does not own this pet!');
      return;
    }

    setSelectedPet(petId);
    setShowPetSelector(false);
    showToast(`Equipped ${pet.name}!`);
  };

  // ===============================================
  // TAB CONTENT COMPONENTS
  // ===============================================

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Character Info */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">👤</span>
          Character Info
        </h3>
        
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="relative cursor-pointer"
            onMouseEnter={(e) => handleImageHover(e, {
              image: getAvatarImage(selectedAvatar, currentLevel),
              name: `${selectedAvatar} (Level ${currentLevel})`
            })}
            onMouseLeave={hidePreview}
          >
            <img 
              src={getAvatarImage(selectedAvatar, currentLevel)}
              alt={`${student.firstName}'s Avatar`}
              className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg hover:border-blue-600 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              L{currentLevel}
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="text-2xl font-bold text-gray-800">{student.firstName}</h4>
            <p className="text-gray-600">{selectedAvatar}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                ⭐ {student.totalPoints || 0} XP
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                🪙 {coins} Coins
              </span>
            </div>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {currentLevel + 1}</span>
            <span>{progressToNext}/100 XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => setShowAvatarSelector(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            🎭 Change Avatar
          </button>
          {student.ownedPets?.length > 0 && (
            <button
              onClick={() => setShowPetSelector(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🐾 Change Pet
            </button>
          )}
        </div>
      </div>

      {/* Stats & Categories */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Behavior Stats
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {['Respectful', 'Responsible', 'Safe', 'Learner'].map(category => {
            const categoryXP = student.categoryTotal?.[category] || 0;
            const weeklyXP = student.categoryWeekly?.[category] || 0;
            const icon = {
              'Respectful': '🤝',
              'Responsible': '✅', 
              'Safe': '🛡️',
              'Learner': '📚'
            }[category];
            
            return (
              <div key={category} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <h4 className="font-bold text-gray-800 text-sm">{category}</h4>
                </div>
                <div className="space-y-1">
                  <div className="text-xl font-bold text-gray-900">{categoryXP}</div>
                  <div className="text-xs text-gray-600">Total Points</div>
                  <div className="text-xs text-blue-600">+{weeklyXP} this week</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pet Info */}
      {equippedPet && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🐾</span>
            Companion Pet
          </h3>
          
          <div className="flex items-center space-x-4">
            <div 
              className="cursor-pointer"
              onMouseEnter={(e) => handleImageHover(e, {
                image: equippedPet.image,
                name: equippedPet.name
              })}
              onMouseLeave={hidePreview}
            >
              <img
                src={equippedPet.image}
                alt={equippedPet.name}
                className="w-16 h-16 rounded-lg border-2 border-purple-300 hover:border-purple-500 transition-colors"
              />
            </div>
            
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-800">{equippedPet.name}</h4>
              <p className="text-gray-600 capitalize">{equippedPet.rarity || 'Common'} Pet</p>
              <div className="flex space-x-2 mt-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  Speed: {equippedPet.speed || 5}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                  Loyal
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📝</span>
          Recent Activity
        </h3>
        
        {student.logs && student.logs.length > 0 ? (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {student.logs.slice(-5).reverse().map((log, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-orange-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {log.type === 'Respectful' ? '🤝' : 
                       log.type === 'Responsible' ? '✅' : 
                       log.type === 'Safe' ? '🛡️' : 
                       log.type === 'Learner' ? '📚' : 
                       log.type === 'Coin Award' ? '🪙' : '⭐'}
                    </span>
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{log.type}</div>
                      <div className="text-xs text-gray-600">{log.reason || 'No reason provided'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-blue-600">
                      +{log.points} {log.type === 'Coin Award' ? 'coins' : 'XP'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-600">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const InventoryTab = () => (
    <div className="space-y-6">
      {/* Owned Avatars */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">👤</span>
          Owned Avatars ({student.ownedAvatars?.length || 1})
        </h3>
        
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {(student.ownedAvatars || [selectedAvatar]).map((avatarBase, index) => (
            <div 
              key={index}
              className={`relative cursor-pointer group ${selectedAvatar === avatarBase ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleAvatarChange(avatarBase)}
              onMouseEnter={(e) => handleImageHover(e, {
                image: getAvatarImage(avatarBase, currentLevel),
                name: `${avatarBase} (Level ${currentLevel})`
              })}
              onMouseLeave={hidePreview}
            >
              <img 
                src={getAvatarImage(avatarBase, currentLevel)}
                alt={avatarBase}
                className="w-16 h-16 rounded-lg border-2 border-gray-300 group-hover:border-blue-400 transition-colors"
              />
              {selectedAvatar === avatarBase && (
                <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded-full">
                  ✓
                </div>
              )}
              <div className="text-xs text-center mt-1 text-gray-600 truncate">
                {avatarBase.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owned Pets */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🐾</span>
          Owned Pets ({student.ownedPets?.length || 0})
        </h3>
        
        {student.ownedPets && student.ownedPets.length > 0 ? (
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {student.ownedPets.map((pet, index) => (
              <div 
                key={index}
                className={`relative cursor-pointer group ${selectedPet === pet.id ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => handlePetChange(pet.id)}
                onMouseEnter={(e) => handleImageHover(e, {
                  image: pet.image,
                  name: pet.name
                })}
                onMouseLeave={hidePreview}
              >
                <img 
                  src={pet.image}
                  alt={pet.name}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 group-hover:border-purple-400 transition-colors"
                />
                {selectedPet === pet.id && (
                  <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs px-1 py-0.5 rounded-full">
                    ✓
                  </div>
                )}
                <div className="text-xs text-center mt-1 text-gray-600 truncate">
                  {pet.name.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🐾</div>
            <p className="text-gray-600">No pets owned yet</p>
            <p className="text-sm text-gray-500">Earn 50+ XP to unlock your first pet!</p>
          </div>
        )}
      </div>

      {/* Inventory Items */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🎒</span>
          Inventory Items ({student.inventory?.length || 0})
        </h3>
        
        {student.inventory && student.inventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.inventory.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🎁</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <div className="text-sm text-gray-600">
                      From: {item.source || 'Shop'}
                    </div>
                    {item.acquired && (
                      <div className="text-xs text-gray-500">
                        {new Date(item.acquired).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎒</div>
            <p className="text-gray-600">Inventory is empty</p>
            <p className="text-sm text-gray-500">Purchase items from the shop to fill your inventory!</p>
          </div>
        )}
      </div>
    </div>
  );

  // ===============================================
  // MAIN RENDER
  // ===============================================

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-6xl w-full mx-4 max-h-screen overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              {student.firstName}'s Character Sheet
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 font-semibold ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`py-4 px-6 font-semibold ${
                activeTab === 'inventory'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎒 Inventory
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'inventory' && <InventoryTab />}
          </div>
        </div>
      </div>

      {/* Hover Preview */}
      {hoverPreview.show && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: `${hoverPreview.x}px`, 
            top: `${hoverPreview.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 max-w-xs">
            <img 
              src={hoverPreview.image}
              alt={hoverPreview.name}
              className="w-32 h-32 mx-auto rounded-lg border border-gray-300 mb-2"
            />
            <h4 className="text-center font-bold text-gray-800">{hoverPreview.name}</h4>
          </div>
        </div>
      )}

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Choose Avatar</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {ALL_AVATARS.map((avatarBase) => (
                <div 
                  key={avatarBase}
                  className="cursor-pointer group text-center"
                  onClick={() => handleAvatarChange(avatarBase)}
                >
                  <img 
                    src={getAvatarImage(avatarBase, currentLevel)}
                    alt={avatarBase}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 group-hover:border-blue-400 transition-colors mx-auto"
                  />
                  <div className="text-xs mt-1 text-gray-600 truncate">
                    {avatarBase}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pet Selector Modal */}
      {showPetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Choose Pet</h3>
              <button
                onClick={() => setShowPetSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {(student.ownedPets || []).map((pet) => (
                <div 
                  key={pet.id}
                  className="cursor-pointer group text-center"
                  onClick={() => handlePetChange(pet.id)}
                >
                  <img 
                    src={pet.image}
                    alt={pet.name}
                    className="w-16 h-16 rounded-lg border-2 border-gray-300 group-hover:border-purple-400 transition-colors mx-auto"
                  />
                  <div className="text-xs mt-1 text-gray-600 truncate">
                    {pet.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CharacterSheetModal;