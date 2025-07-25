// components/tabs/ShopTab.js - Enhanced Shop with Constants Integration
import React, { useState, useEffect } from 'react';

// Import constants and utilities
import { 
  GAME_CONFIG,
  SHOP_ITEMS,
  BASIC_AVATARS,
  BASIC_PETS,
  EXISTING_PETS,
  PREMIUM_PETS,
  PREMIUM_BASIC_AVATARS,
  THEMED_AVATARS,
  LOOT_BOXES,
  DEFAULT_TEACHER_REWARDS,
  RARITY_STYLES,
  SOUND_FILES,
  UI_THEMES
} from '../../constants/gameData';

import { 
  calculateCoins,
  canAfford,
  updateStudentWithCurrency,
  playSound
} from '../../utils/gameUtils';

import { 
  showToast, 
  showSuccessToast, 
  showErrorToast, 
  withAsyncErrorHandling 
} from '../../utils/errorHandling';

const ShopTab = ({ 
  students, 
  setStudents, 
  showToast,
  saveStudentsToFirebase,
  currentClassId,
  userData,
  user,
  firestore
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeSection, setActiveSection] = useState('champions'); // 'champions' or 'rewards'
  const [activeChampsCategory, setActiveChampsCategory] = useState('avatars');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(null);
  const [showRewardEditor, setShowRewardEditor] = useState(false);
  const [teacherRewards, setTeacherRewards] = useState([]);
  const [newReward, setNewReward] = useState({ name: '', description: '', price: 5, category: 'privileges' });
  const [editingReward, setEditingReward] = useState(null);
  const [featuredItem, setFeaturedItem] = useState(null);
  
  // Hover preview state
  const [hoverPreview, setHoverPreview] = useState({ show: false, image: '', name: '', x: 0, y: 0 });
  
  // Pet renaming state
  const [showPetRenameModal, setShowPetRenameModal] = useState(null);
  const [newPetName, setNewPetName] = useState('');

  // ===============================================
  // FIREBASE OPERATIONS - TEACHER REWARDS
  // ===============================================

  const saveTeacherRewardsToFirebase = withAsyncErrorHandling(async (rewards) => {
    if (!user || !currentClassId || !firestore) return;

    try {
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                teacherRewards: rewards,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving teacher rewards:", error);
      showErrorToast("Failed to save classroom rewards");
    }
  }, 'saveTeacherRewardsToFirebase');

  const loadTeacherRewardsFromFirebase = withAsyncErrorHandling(async () => {
    if (!user || !currentClassId || !firestore) return;

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const currentClass = data.classes?.find(cls => cls.id === currentClassId);
        
        if (currentClass?.teacherRewards) {
          setTeacherRewards(currentClass.teacherRewards);
        } else {
          // Initialize with defaults if no saved rewards
          setTeacherRewards(DEFAULT_TEACHER_REWARDS);
          saveTeacherRewardsToFirebase(DEFAULT_TEACHER_REWARDS);
        }
      }
    } catch (error) {
      console.error("Error loading teacher rewards:", error);
      setTeacherRewards(DEFAULT_TEACHER_REWARDS);
    }
  }, 'loadTeacherRewardsFromFirebase');

  // ===============================================
  // COMPONENT INITIALIZATION
  // ===============================================

  useEffect(() => {
    loadTeacherRewardsFromFirebase();
    generateDailyFeaturedItem();
  }, [currentClassId]);

  // ===============================================
  // HOVER PREVIEW HANDLERS
  // ===============================================

  const handleMouseEnter = (e, item) => {
    if (!item.image || item.image.includes('📦') || item.image.includes('✨') || item.image.includes('🏆')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPreview({
      show: true,
      image: item.image,
      name: item.name,
      x: rect.right + 10,
      y: rect.top + (rect.height / 2)
    });
  };

  const handleMouseLeave = () => {
    setHoverPreview({ show: false, image: '', name: '', x: 0, y: 0 });
  };

  // ===============================================
  // FEATURED ITEM SYSTEM
  // ===============================================

  const generateDailyFeaturedItem = () => {
    const today = new Date().toDateString();
    const savedFeature = localStorage.getItem('dailyFeaturedItem');
    
    if (savedFeature) {
      const parsed = JSON.parse(savedFeature);
      if (parsed.date === today) {
        setFeaturedItem(parsed.item);
        return;
      }
    }

    // Generate new featured item
    const allItems = [
      ...BASIC_AVATARS.map(item => ({ ...item, type: 'avatar' })),
      ...BASIC_PETS.map(item => ({ ...item, type: 'pet' })),
      ...EXISTING_PETS.map(item => ({ ...item, type: 'pet' }))
    ];

    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    const featuredPrice = Math.floor(randomItem.price * 0.8); // 20% discount

    const featured = {
      ...randomItem,
      originalPrice: randomItem.price,
      price: featuredPrice,
      isFeatured: true
    };

    setFeaturedItem(featured);
    localStorage.setItem('dailyFeaturedItem', JSON.stringify({
      date: today,
      item: featured
    }));
  };

  // ===============================================
  // PURCHASE HANDLERS
  // ===============================================

  const handlePurchase = withAsyncErrorHandling(async (item) => {
    if (!selectedStudent || !canAfford(selectedStudent, item.price)) {
      showErrorToast('Not enough coins for this purchase!');
      return;
    }

    let updatedStudent = updateStudentWithCurrency(selectedStudent);
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + item.price;

    if (item.type === 'avatar' || item.base) {
      // Handle avatar purchase
      const avatarBase = item.base || item.name;
      if (!updatedStudent.ownedAvatars.includes(avatarBase)) {
        updatedStudent.ownedAvatars = [...updatedStudent.ownedAvatars, avatarBase];
      }
      showSuccessToast(`${item.name} avatar purchased!`);
    } else if (item.type === 'pet' || item.species) {
      // Handle pet purchase
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        image: item.image,
        species: item.species || item.name,
        speed: item.speed || 1.0,
        wins: 0,
        level: 1,
        type: item.type || 'purchased',
        dateObtained: new Date().toISOString()
      };
      
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      showSuccessToast(`${item.name} pet purchased!`);
    } else if (item.id && teacherRewards.find(r => r.id === item.id)) {
      // Handle teacher reward purchase
      updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), {
        ...item,
        datePurchased: new Date().toISOString()
      }];
      showSuccessToast(`${item.name} reward purchased!`);
    }

    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    setShowPurchaseModal(null);

    // Play purchase sound
    playSound(SOUND_FILES.COIN_COLLECT, 0.3);
  }, 'handlePurchase');

  const handleLootBoxPurchase = withAsyncErrorHandling(async (lootBox) => {
    if (!selectedStudent || !canAfford(selectedStudent, lootBox.price)) {
      showErrorToast('Not enough coins for this loot box!');
      return;
    }

    let updatedStudent = updateStudentWithCurrency(selectedStudent);
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + lootBox.price;

    // Generate random rewards based on loot box type
    const rewards = generateLootBoxRewards(lootBox.id);
    
    rewards.forEach(reward => {
      if (reward.type === 'avatar') {
        const avatarBase = reward.base || reward.name;
        if (!updatedStudent.ownedAvatars.includes(avatarBase)) {
          updatedStudent.ownedAvatars = [...updatedStudent.ownedAvatars, avatarBase];
        }
      } else if (reward.type === 'pet') {
        const newPet = {
          id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: reward.name,
          image: reward.image,
          species: reward.species || reward.name,
          speed: reward.speed || 1.0,
          wins: 0,
          level: 1,
          type: 'lootbox',
          rarity: reward.rarity,
          dateObtained: new Date().toISOString()
        };
        updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      }
    });

    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    setShowPurchaseModal(null);

    showSuccessToast(`Opened ${lootBox.name} and got ${rewards.length} items!`);
    playSound(SOUND_FILES.SUCCESS, 0.5);
  }, 'handleLootBoxPurchase');

  // ===============================================
  // AVATAR & PET MANAGEMENT
  // ===============================================

  const handleSwitchAvatar = (avatarBase) => {
    const updatedStudent = { ...selectedStudent, avatarBase };
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    showSuccessToast('Avatar changed!');
  };

  const handlePetRename = (pet) => {
    setShowPetRenameModal(pet);
    setNewPetName(pet.name);
  };

  const handlePetRenameConfirm = () => {
    if (!newPetName.trim()) return;

    const updatedStudent = { ...selectedStudent };
    const updatedPets = updatedStudent.ownedPets.map(pet => 
      pet.id === showPetRenameModal.id 
        ? { ...pet, name: newPetName.trim() }
        : pet
    );
    updatedStudent.ownedPets = updatedPets;

    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showSuccessToast('Pet renamed successfully!');
    setShowPetRenameModal(null);
    setNewPetName('');
  };

  const handleEquipPet = (pet) => {
    const updatedStudent = { 
      ...selectedStudent, 
      pet: {
        image: pet.image,
        name: pet.name,
        level: 1,
        speed: 1,
        wins: 0
      }
    };

    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showSuccessToast(`${pet.name} is now your active pet!`);
  };

  // ===============================================
  // TEACHER REWARD MANAGEMENT
  // ===============================================

  const handleAddReward = () => {
    if (!newReward.name.trim()) return;
    
    const reward = {
      ...newReward,
      id: `reward_${Date.now()}`,
      icon: newReward.icon || '🎁'
    };
    
    const updatedRewards = [...teacherRewards, reward];
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showSuccessToast('Reward added!');
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward(reward);
    setShowRewardEditor(true);
  };

  const handleUpdateReward = () => {
    const updatedRewards = teacherRewards.map(r => 
      r.id === editingReward.id ? { ...newReward, id: editingReward.id } : r
    );
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
    setEditingReward(null);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showSuccessToast('Reward updated successfully!');
  };

  const handleDeleteReward = (rewardId) => {
    const updatedRewards = teacherRewards.filter(r => r.id !== rewardId);
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
    showSuccessToast('Reward deleted!');
  };

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================

  const generateLootBoxRewards = (boxType) => {
    // This should ideally be in gameUtils.js, but implementing here for now
    const rewardCount = boxType === 'legendary_box' ? 3 : boxType === 'premium_box' ? 5 : 3;
    const rewards = [];
    
    for (let i = 0; i < rewardCount; i++) {
      const randomNum = Math.random();
      let rarity = 'common';
      
      if (boxType === 'legendary_box') {
        rarity = randomNum < 0.1 ? 'legendary' : randomNum < 0.4 ? 'epic' : 'rare';
      } else if (boxType === 'premium_box') {
        rarity = randomNum < 0.05 ? 'legendary' : randomNum < 0.2 ? 'epic' : 'rare';
      } else {
        rarity = randomNum < 0.2 ? 'rare' : 'common';
      }
      
      const isAvatar = Math.random() < 0.6;
      
      if (isAvatar && rarity !== 'common') {
        // Add premium avatar
        const premiumAvatars = PREMIUM_BASIC_AVATARS.filter(a => a.rarity === rarity);
        if (premiumAvatars.length > 0) {
          rewards.push(premiumAvatars[Math.floor(Math.random() * premiumAvatars.length)]);
        }
      } else {
        // Add pet
        const pets = rarity === 'common' ? BASIC_PETS : PREMIUM_PETS;
        if (pets.length > 0) {
          rewards.push(pets[Math.floor(Math.random() * pets.length)]);
        }
      }
    }
    
    return rewards;
  };

  const getAvatarPreview = (avatarBase, studentLevel) => {
    const level = Math.min(studentLevel || 1, 4);
    return `/avatars/${avatarBase.replaceAll(" ", "%20")}/Level%20${level}.png`;
  };

  // ===============================================
  // CURRENCY DISPLAY COMPONENT
  // ===============================================

  const CurrencyDisplay = ({ student }) => {
    const coins = calculateCoins(student);
    const coinsSpent = student?.coinsSpent || 0;
    const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
    const bonusCoins = student?.coins || 0;

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800 font-bold text-lg">💰 Available Coins</span>
          <span className="text-2xl font-bold text-yellow-900">{coins}</span>
        </div>
        <div className="text-sm text-yellow-700 mt-1">
          From XP: {xpCoins} • Bonus: {bonusCoins} • Spent: {coinsSpent}
        </div>
      </div>
    );
  };

  // ===============================================
  // MAIN RENDER
  // ===============================================

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to the Shop!</h2>
        <p className="text-gray-600">Add some students to start shopping for avatars and pets!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Hover Preview */}
      {hoverPreview.show && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: hoverPreview.x, 
            top: hoverPreview.y,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl border-2 border-purple-300 p-3 max-w-xs">
            <img 
              src={hoverPreview.image} 
              alt={hoverPreview.name}
              className="w-20 h-20 object-contain mx-auto mb-2"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <p className="text-sm font-bold text-center text-gray-800">{hoverPreview.name}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
          🏪 Classroom Champions Shop
        </h1>
        <p className="text-gray-600 text-lg">Spend your hard-earned coins on amazing rewards!</p>
      </div>

      {/* Student Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">👤 Select a Student</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedStudent?.id === student.id
                  ? 'border-purple-500 bg-purple-100 shadow-lg transform scale-105'
                  : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <div className="text-center">
                <div className="text-sm font-bold text-gray-800">{student.firstName}</div>
                <div className="text-xs text-purple-600 font-semibold">
                  💰 {calculateCoins(student)} coins
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Currency Display */}
          <div className="mb-8">
            <CurrencyDisplay student={selectedStudent} />
          </div>

          {/* Main Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-lg p-1 flex">
              <button
                onClick={() => setActiveSection('champions')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  activeSection === 'champions'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-purple-500 hover:bg-purple-100'
                }`}
              >
                🎭 Champions & Pets
              </button>
              <button
                onClick={() => setActiveSection('rewards')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                  activeSection === 'rewards'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-purple-500 hover:bg-purple-100'
                }`}
              >
                🎁 Classroom Rewards
              </button>
            </div>
          </div>

          {/* Champions & Pets Section */}
          {activeSection === 'champions' && (
            <div className="space-y-8">
              {/* Champions Category Navigation */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow-lg p-1 flex flex-wrap">
                  {[
                    { id: 'avatars', label: '🎭 Avatars', icon: '🎭' },
                    { id: 'pets', label: '🐾 Pets', icon: '🐾' },
                    { id: 'lootboxes', label: '📦 Loot Boxes', icon: '📦' },
                    { id: 'inventory', label: '🎒 Inventory', icon: '🎒' }
                  ].map(category => (
                    <button
                      key={category.id}
                      onClick={() => setActiveChampsCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        activeChampsCategory === category.id
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'text-blue-500 hover:bg-blue-100'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Daily Item */}
              {featuredItem && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-6 shadow-lg">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-yellow-800 mb-4">⭐ Daily Featured Item! ⭐</h3>
                    <div className="bg-white rounded-xl p-4 shadow-lg inline-block">
                      <img 
                        src={featuredItem.image} 
                        alt={featuredItem.name}
                        className="w-24 h-24 object-contain mx-auto mb-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{featuredItem.name}</h4>
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <span className="text-gray-500 line-through">{featuredItem.originalPrice} 💰</span>
                        <span className="text-xl font-bold text-green-600">{featuredItem.price} 💰</span>
                      </div>
                      <button
                        onClick={() => setShowPurchaseModal(featuredItem)}
                        disabled={!canAfford(selectedStudent, featuredItem.price)}
                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 font-bold shadow-lg"
                      >
                        Get Daily Deal!
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Avatars Category */}
              {activeChampsCategory === 'avatars' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎭 Avatar Collection</h3>
                  
                  {/* Basic Avatars */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-blue-600 mb-4">✨ Basic Avatars</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {BASIC_AVATARS.map(avatar => (
                        <div 
                          key={avatar.id} 
                          className="bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl p-4 text-center border-2 border-blue-200 hover:border-blue-400 transition-all duration-200"
                          onMouseEnter={(e) => handleMouseEnter(e, avatar)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <img 
                            src={avatar.image} 
                            alt={avatar.name}
                            className="w-16 h-16 object-contain mx-auto mb-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <h5 className="text-sm font-bold text-gray-800 mb-2">{avatar.name}</h5>
                          <div className="text-lg font-bold text-blue-600 mb-3">{avatar.price} 💰</div>
                          <button
                            onClick={() => setShowPurchaseModal(avatar)}
                            disabled={
                              !canAfford(selectedStudent, avatar.price) || 
                              selectedStudent.ownedAvatars?.includes(avatar.base)
                            }
                            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 text-sm font-bold"
                          >
                            {selectedStudent.ownedAvatars?.includes(avatar.base) ? 'Owned' : 'Buy'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Themed Avatars */}
                  <div>
                    <h4 className="text-lg font-semibold text-purple-600 mb-4">🏰 Themed Collections</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {THEMED_AVATARS.map(avatar => {
                        const rarity = RARITY_STYLES[avatar.rarity] || RARITY_STYLES.common;
                        return (
                          <div 
                            key={avatar.id} 
                            className={`rounded-xl p-4 text-center border-2 transition-all duration-200 hover:shadow-lg ${rarity.bgColor} ${rarity.borderColor}`}
                            onMouseEnter={(e) => handleMouseEnter(e, avatar)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className={`text-xs font-bold mb-2 ${rarity.textColor}`}>
                              {rarity.name}
                            </div>
                            <img 
                              src={avatar.image} 
                              alt={avatar.name}
                              className="w-16 h-16 object-contain mx-auto mb-3"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <h5 className="text-sm font-bold text-gray-800 mb-2">{avatar.name}</h5>
                            <div className="text-lg font-bold text-purple-600 mb-3">{avatar.price} 💰</div>
                            <button
                              onClick={() => setShowPurchaseModal(avatar)}
                              disabled={
                                !canAfford(selectedStudent, avatar.price) || 
                                selectedStudent.ownedAvatars?.includes(avatar.base)
                              }
                              className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 text-sm font-bold"
                            >
                              {selectedStudent.ownedAvatars?.includes(avatar.base) ? 'Owned' : 'Buy'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Pets Category */}
              {activeChampsCategory === 'pets' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🐾 Pet Collection</h3>
                  
                  {/* Basic Pets */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-green-600 mb-4">🐕 Basic Pets</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {BASIC_PETS.map(pet => (
                        <div 
                          key={pet.id} 
                          className="bg-gradient-to-b from-green-50 to-blue-50 rounded-xl p-4 text-center border-2 border-green-200 hover:border-green-400 transition-all duration-200"
                          onMouseEnter={(e) => handleMouseEnter(e, pet)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <img 
                            src={pet.image} 
                            alt={pet.name}
                            className="w-16 h-16 object-contain mx-auto mb-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <h5 className="text-sm font-bold text-gray-800 mb-2">{pet.name}</h5>
                          <div className="text-lg font-bold text-green-600 mb-3">{pet.price} 💰</div>
                          <button
                            onClick={() => setShowPurchaseModal(pet)}
                            disabled={!canAfford(selectedStudent, pet.price)}
                            className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 text-sm font-bold"
                          >
                            Buy Pet
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classic Game Pets */}
                  <div>
                    <h4 className="text-lg font-semibold text-orange-600 mb-4">⚔️ Classic Companions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {EXISTING_PETS.map(pet => (
                        <div 
                          key={pet.id} 
                          className="bg-gradient-to-b from-orange-50 to-red-50 rounded-xl p-4 text-center border-2 border-orange-200 hover:border-orange-400 transition-all duration-200"
                          onMouseEnter={(e) => handleMouseEnter(e, pet)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <img 
                            src={pet.image} 
                            alt={pet.name}
                            className="w-16 h-16 object-contain mx-auto mb-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <h5 className="text-sm font-bold text-gray-800 mb-2">{pet.name}</h5>
                          <div className="text-lg font-bold text-orange-600 mb-3">{pet.price} 💰</div>
                          <button
                            onClick={() => setShowPurchaseModal(pet)}
                            disabled={!canAfford(selectedStudent, pet.price)}
                            className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 text-sm font-bold"
                          >
                            Buy Pet
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loot Boxes Category */}
              {activeChampsCategory === 'lootboxes' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📦 Mystery Loot Boxes</h3>
                  <p className="text-center text-gray-600 mb-6">
                    Take a chance! Each loot box contains random avatars and pets with different rarities!
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {LOOT_BOXES.map(box => (
                      <div key={box.id} className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl p-6 text-center border-2 border-purple-200">
                        <div className="text-4xl mb-4">{box.image}</div>
                        <h4 className="text-xl font-bold text-purple-800 mb-2">{box.name}</h4>
                        <p className="text-sm text-gray-600 mb-4">{box.description}</p>
                        <div className="text-2xl font-bold text-purple-600 mb-4">{box.price} 💰</div>
                        <button
                          onClick={() => setShowPurchaseModal(box)}
                          disabled={!canAfford(selectedStudent, box.price)}
                          className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 font-bold"
                        >
                          Open Box
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Category */}
              {activeChampsCategory === 'inventory' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎒 My Inventory</h3>
                  
                  {/* Owned Avatars */}
                  {selectedStudent.ownedAvatars?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-blue-600 mb-4">🎭 Owned Avatars</h4>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {selectedStudent.ownedAvatars.map(avatarBase => {
                          const studentLevel = selectedStudent.avatarLevel || 1;
                          const previewImage = getAvatarPreview(avatarBase, studentLevel);
                          const isActive = selectedStudent.avatarBase === avatarBase;
                          
                          // Check if this is a premium avatar to show rarity
                          const premiumAvatar = PREMIUM_BASIC_AVATARS.find(pa => pa.base === avatarBase);
                          
                          return (
                            <div key={avatarBase} className={`text-center ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
                              <div className={`bg-white rounded-lg p-3 border-2 transition-all duration-200 ${
                                isActive ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                              }`}>
                                {premiumAvatar && (
                                  <div className={`text-xs font-bold mb-1 ${RARITY_STYLES[premiumAvatar.rarity]?.textColor || 'text-gray-600'}`}>
                                    {RARITY_STYLES[premiumAvatar.rarity]?.name || 'Standard'}
                                  </div>
                                )}
                                <img 
                                  src={previewImage} 
                                  alt={avatarBase}
                                  className="w-12 h-12 object-contain mx-auto mb-2"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div className="text-xs font-bold text-gray-800">{avatarBase}</div>
                                {!isActive && (
                                  <button
                                    onClick={() => handleSwitchAvatar(avatarBase)}
                                    className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    Equip
                                  </button>
                                )}
                                {isActive && (
                                  <div className="mt-2 text-xs font-bold text-blue-600">Active</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Owned Pets */}
                  {selectedStudent.ownedPets?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-green-600 mb-4">🐾 Owned Pets</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedStudent.ownedPets.map(pet => {
                          const rarity = pet.rarity ? RARITY_STYLES[pet.rarity] : null;
                          
                          return (
                            <div key={pet.id} className={`rounded-lg p-4 border-2 transition-all duration-200 ${
                              rarity ? `${rarity.bgColor} ${rarity.borderColor}` : 'bg-green-50 border-green-200'
                            }`}>
                              {rarity && (
                                <div className={`text-xs font-bold mb-2 text-center ${rarity.textColor}`}>
                                  {rarity.name}
                                </div>
                              )}
                              <img 
                                src={pet.image} 
                                alt={pet.name}
                                className="w-16 h-16 object-contain mx-auto mb-3"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <h5 className="text-sm font-bold text-center text-gray-800 mb-2">{pet.name}</h5>
                              <div className="text-xs text-center text-gray-600 mb-3">{pet.species}</div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEquipPet(pet)}
                                  className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                >
                                  Equip
                                </button>
                                <button
                                  onClick={() => handlePetRename(pet)}
                                  className="flex-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                  Rename
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty inventory message */}
                  {(!selectedStudent.ownedAvatars || selectedStudent.ownedAvatars.length === 0) && 
                   (!selectedStudent.ownedPets || selectedStudent.ownedPets.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">Inventory is Empty</h3>
                      <p className="text-gray-500">Start shopping to fill up your collection!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Classroom Rewards Section */}
          {activeSection === 'rewards' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">🎁 Classroom Rewards</h3>
                {userData?.plan === 'pro' && (
                  <button
                    onClick={() => setShowRewardEditor(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
                  >
                    + Add Reward
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherRewards.map(reward => (
                  <div key={reward.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <div className="text-center">
                      <div className="text-3xl mb-3">{reward.icon}</div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">{reward.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                      <div className="text-xl font-bold text-indigo-600 mb-4">{reward.price} 💰</div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowPurchaseModal(reward)}
                          disabled={!canAfford(selectedStudent, reward.price)}
                          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-400 font-bold"
                        >
                          Purchase
                        </button>
                        
                        {userData?.plan === 'pro' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditReward(reward)}
                              className="flex-1 px-2 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Purchase</h3>
              
              {showPurchaseModal.image && !showPurchaseModal.image.includes('📦') && !showPurchaseModal.image.includes('✨') && !showPurchaseModal.image.includes('🏆') && (
                <img 
                  src={showPurchaseModal.image} 
                  alt={showPurchaseModal.name}
                  className="w-24 h-24 object-contain mx-auto mb-4"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              
              <h4 className="text-xl font-bold text-gray-800 mb-2">{showPurchaseModal.name}</h4>
              {showPurchaseModal.description && (
                <p className="text-gray-600 mb-4">{showPurchaseModal.description}</p>
              )}
              
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <div className="text-lg font-bold text-gray-800">
                  Cost: {showPurchaseModal.price} 💰
                </div>
                <div className="text-sm text-gray-600">
                  Your coins: {calculateCoins(selectedStudent)} 💰
                </div>
                <div className="text-sm text-gray-600">
                  After purchase: {calculateCoins(selectedStudent) - showPurchaseModal.price} 💰
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowPurchaseModal(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showPurchaseModal.contents) {
                      handleLootBoxPurchase(showPurchaseModal);
                    } else {
                      handlePurchase(showPurchaseModal);
                    }
                  }}
                  disabled={!canAfford(selectedStudent, showPurchaseModal.price)}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold"
                >
                  {!canAfford(selectedStudent, showPurchaseModal.price) ? 'Not Enough Coins' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pet Rename Modal */}
      {showPetRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Rename Pet</h3>
              <img 
                src={showPetRenameModal.image} 
                alt={showPetRenameModal.name}
                className="w-24 h-24 object-contain mx-auto mb-4"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="Enter new pet name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-6 text-center text-lg font-bold"
                maxLength={20}
              />

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowPetRenameModal(null);
                    setNewPetName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePetRenameConfirm}
                  disabled={!newPetName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-bold"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reward Editor Modal */}
      {showRewardEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {editingReward ? 'Edit Reward' : 'Add New Reward'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reward Name"
                value={newReward.name}
                onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
              />
              
              <textarea
                placeholder="Description"
                value={newReward.description}
                onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                rows="3"
              />
              
              <input
                type="number"
                placeholder="Price in coins"
                value={newReward.price}
                onChange={(e) => setNewReward({...newReward, price: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                min="1"
              />
              
              <select
                value={newReward.category}
                onChange={(e) => setNewReward({...newReward, category: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
              >
                <option value="privileges">Privileges</option>
                <option value="treats">Treats</option>
                <option value="activities">Activities</option>
                <option value="supplies">Supplies</option>
              </select>

              <input
                type="text"
                placeholder="Icon (emoji)"
                value={newReward.icon}
                onChange={(e) => setNewReward({...newReward, icon: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
                maxLength="2"
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowRewardEditor(false);
                  setEditingReward(null);
                  setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
              >
                Cancel
              </button>
              <button
                onClick={editingReward ? handleUpdateReward : handleAddReward}
                disabled={!newReward.name.trim()}
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 font-bold"
              >
                {editingReward ? 'Update' : 'Add'} Reward
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;