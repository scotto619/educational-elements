// RaceSetupModal.js - Enhanced with Comprehensive Prize Selection
import React, { useState, useEffect } from 'react';

const RaceSetupModal = ({
  students,
  selectedPets,
  setSelectedPets,
  selectedPrize,
  setSelectedPrize,
  prizeDetails,
  setPrizeDetails,
  onStartRace,
  onClose,
  SHOP_ITEMS,
  LOOT_BOX_ITEMS,
  teacherRewards = []
}) => {
  const [activeTab, setActiveTab] = useState('pets');
  const [showPrizePreview, setShowPrizePreview] = useState(false);

  // Default classroom rewards if none provided
  const DEFAULT_CLASSROOM_REWARDS = [
    { id: 'tech_time', name: 'Technology Time', description: '10 minutes of educational technology', icon: '💻', category: 'privileges' },
    { id: 'move_seat', name: 'Move Seat for a Day', description: 'Choose where to sit for one day', icon: '🪑', category: 'privileges' },
    { id: 'homework_pass', name: 'Homework Pass', description: 'Skip one homework assignment', icon: '📝', category: 'privileges' },
    { id: 'line_leader', name: 'Line Leader', description: 'Be the line leader for a week', icon: '👑', category: 'privileges' },
    { id: 'extra_play', name: 'Extra Playtime', description: '5 minutes extra recess', icon: '⚽', category: 'privileges' },
    { id: 'teacher_helper', name: 'Teacher Helper', description: 'Be the teacher\'s special helper for a day', icon: '🌟', category: 'privileges' },
    { id: 'free_draw', name: 'Free Drawing Time', description: '15 minutes of free drawing', icon: '🎨', category: 'activities' },
    { id: 'sweet_treat', name: 'Sweet Treat', description: 'A special sweet treat', icon: '🍭', category: 'treats' }
  ];

  const classroomRewards = teacherRewards.length > 0 ? teacherRewards : DEFAULT_CLASSROOM_REWARDS;

  // Loot boxes
  const LOOT_BOXES = [
    {
      id: 'basic_box',
      name: 'Basic Loot Box',
      description: 'Contains 3 random items',
      image: '📦',
      contents: { count: 3, guaranteedRare: false }
    },
    {
      id: 'premium_box',
      name: 'Premium Loot Box',
      description: 'Contains 5 items with guaranteed rare+',
      image: '✨',
      contents: { count: 5, guaranteedRare: true }
    },
    {
      id: 'legendary_box',
      name: 'Legendary Loot Box',
      description: 'Contains 3 rare+ items with chance of legendary',
      image: '🏆',
      contents: { count: 3, guaranteedRare: true, legendaryChance: true }
    }
  ];

  // Initialize default prize details
  useEffect(() => {
    if (!prizeDetails) {
      setPrizeDetails({
        amount: 5,
        category: 'Respectful'
      });
    }
  }, [prizeDetails, setPrizeDetails]);

  // Handle pet selection
  const handlePetToggle = (studentId) => {
    setSelectedPets(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        if (prev.length >= 6) {
          alert('Maximum 6 pets can race at once!');
          return prev;
        }
        return [...prev, studentId];
      }
    });
  };

  // Handle prize selection
  const handlePrizeChange = (prizeType, details = {}) => {
    setSelectedPrize(prizeType);
    setPrizeDetails(details);
    setShowPrizePreview(true);
    setTimeout(() => setShowPrizePreview(false), 2000);
  };

  // Get students with pets
  const studentsWithPets = students.filter(s => s.pet?.image);

  const handleStartRace = () => {
    if (selectedPets.length < 2) {
      alert('Please select at least 2 pets to race!');
      return;
    }
    
    if (!selectedPrize || !prizeDetails) {
      alert('Please select a prize for the winner!');
      return;
    }
    
    onStartRace();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">🏁 Epic Race Setup</h2>
              <p className="text-blue-100">Configure your championship race!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-300 text-3xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Prize Preview Notification */}
        {showPrizePreview && (
          <div className="absolute top-20 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-bounce">
            Prize Selected! ✅
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pets')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'pets'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">🐾</span>
            Select Racers ({selectedPets.length}/6)
          </button>
          <button
            onClick={() => setActiveTab('prizes')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'prizes'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <span className="mr-2">🎁</span>
            Choose Prize
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Pet Selection Tab */}
          {activeTab === 'pets' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select Racing Pets</h3>
                <p className="text-gray-600">Choose 2-6 pets to compete in the championship race!</p>
              </div>

              {studentsWithPets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🐾</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Pets Available</h3>
                  <p className="text-gray-600">Students unlock pets at 50 XP!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {studentsWithPets.map(student => {
                    const isSelected = selectedPets.includes(student.id);
                    const wins = student.pet?.wins || 0;
                    const speed = ((student.pet?.speed || 1) * 10).toFixed(1);

                    return (
                      <button
                        key={student.id}
                        onClick={() => handlePetToggle(student.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-center hover:scale-105 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                        }`}
                      >
                        {/* Pet Image */}
                        <div className="relative mb-3">
                          <img
                            src={student.pet.image}
                            alt="Pet"
                            className={`w-16 h-16 rounded-full mx-auto border-3 ${
                              isSelected ? 'border-blue-400' : 'border-gray-300'
                            }`}
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}
                          {wins > 0 && (
                            <div className="absolute -top-2 -left-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {wins}
                            </div>
                          )}
                        </div>

                        {/* Student & Pet Info */}
                        <div className="font-bold text-gray-800">{student.firstName}</div>
                        <div className="text-sm text-gray-600 mb-2">{student.pet.name}</div>
                        
                        {/* Pet Stats */}
                        <div className="flex justify-center space-x-3 text-xs">
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            Speed: {speed}
                          </div>
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Wins: {wins}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Prize Selection Tab */}
          {activeTab === 'prizes' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Victory Prize</h3>
                <p className="text-gray-600">Select an awesome reward for the race winner!</p>
              </div>

              {/* Current Prize Display */}
              {selectedPrize && prizeDetails && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🏆</div>
                    <div>
                      <div className="font-bold text-green-800">Current Prize:</div>
                      <div className="text-gray-700">
                        {selectedPrize === 'xp' && `${prizeDetails.amount} ${prizeDetails.category} XP`}
                        {selectedPrize === 'coins' && `${prizeDetails.amount} Coins 💰`}
                        {selectedPrize === 'shop_item' && `${prizeDetails.item?.name} from shop`}
                        {selectedPrize === 'loot_box' && `${prizeDetails.lootBox?.name}`}
                        {selectedPrize === 'classroom_reward' && `${prizeDetails.reward?.name}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Prize Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* XP Prizes */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">⭐</span>
                    XP Rewards
                  </h4>
                  <div className="space-y-2">
                    {[
                      { amount: 5, category: 'Respectful' },
                      { amount: 5, category: 'Responsible' },
                      { amount: 5, category: 'Learner' },
                      { amount: 10, category: 'Respectful' },
                      { amount: 15, category: 'Learner' }
                    ].map((xp, index) => (
                      <button
                        key={index}
                        onClick={() => handlePrizeChange('xp', xp)}
                        className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedPrize === 'xp' && prizeDetails?.amount === xp.amount && prizeDetails?.category === xp.category
                            ? 'border-blue-500 bg-blue-100'
                            : 'border-blue-200 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="font-semibold">{xp.amount} {xp.category} XP</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coin Prizes */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
                    <span className="mr-2">💰</span>
                    Coin Rewards
                  </h4>
                  <div className="space-y-2">
                    {[10, 15, 25, 50, 100].map(amount => (
                      <button
                        key={amount}
                        onClick={() => handlePrizeChange('coins', { amount })}
                        className={`w-full p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedPrize === 'coins' && prizeDetails?.amount === amount
                            ? 'border-yellow-500 bg-yellow-100'
                            : 'border-yellow-200 bg-white hover:border-yellow-400'
                        }`}
                      >
                        <div className="font-semibold">{amount} Coins 💰</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shop Item Prizes */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                    <span className="mr-2">🏪</span>
                    Shop Items
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {/* Avatar Prizes */}
                    {SHOP_ITEMS.avatars?.slice(0, 3).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handlePrizeChange('shop_item', { item })}
                        className={`w-full p-2 rounded-lg border-2 transition-all text-left flex items-center space-x-2 hover:scale-105 ${
                          selectedPrize === 'shop_item' && prizeDetails?.item?.id === item.id
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-purple-200 bg-white hover:border-purple-400'
                        }`}
                      >
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded" />
                        <div className="text-sm font-semibold">{item.name}</div>
                      </button>
                    ))}
                    
                    {/* Pet Prizes */}
                    {SHOP_ITEMS.pets?.slice(0, 2).map(item => (
                      <button
                        key={item.id}
                        onClick={() => handlePrizeChange('shop_item', { item })}
                        className={`w-full p-2 rounded-lg border-2 transition-all text-left flex items-center space-x-2 hover:scale-105 ${
                          selectedPrize === 'shop_item' && prizeDetails?.item?.id === item.id
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-purple-200 bg-white hover:border-purple-400'
                        }`}
                      >
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded" />
                        <div className="text-sm font-semibold">{item.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Loot Box Prizes */}
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                    <span className="mr-2">📦</span>
                    Loot Boxes
                  </h4>
                  <div className="space-y-2">
                    {LOOT_BOXES.map(lootBox => (
                      <button
                        key={lootBox.id}
                        onClick={() => handlePrizeChange('loot_box', { lootBox })}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                          selectedPrize === 'loot_box' && prizeDetails?.lootBox?.id === lootBox.id
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-orange-200 bg-white hover:border-orange-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{lootBox.image}</span>
                          <div>
                            <div className="font-semibold">{lootBox.name}</div>
                            <div className="text-xs text-gray-600">{lootBox.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Classroom Reward Prizes */}
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 md:col-span-2">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">🎁</span>
                    Classroom Rewards
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {classroomRewards.slice(0, 8).map(reward => (
                      <button
                        key={reward.id}
                        onClick={() => handlePrizeChange('classroom_reward', { reward })}
                        className={`p-3 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                          selectedPrize === 'classroom_reward' && prizeDetails?.reward?.id === reward.id
                            ? 'border-green-500 bg-green-100'
                            : 'border-green-200 bg-white hover:border-green-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{reward.icon}</div>
                        <div className="text-xs font-semibold">{reward.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedPets.length} pets selected • Prize: {selectedPrize ? '✅' : '❌'}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={selectedPets.length < 2 || !selectedPrize}
              onClick={handleStartRace}
              className="px-8 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg transform hover:scale-105"
            >
              🚀 Start Epic Race!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceSetupModal;