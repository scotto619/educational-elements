// components/tabs/ShopTab.js - MOBILE-OPTIMIZED SHOP WITH MYSTERY BOX AND SELLING FEATURE - FIXED DAILY SPECIALS
import React, { useState, useEffect } from 'react';

// ===============================================
// DEFAULT TEACHER REWARDS (Starting Template)
// ===============================================
const DEFAULT_TEACHER_REWARDS = [
  { id: 'reward_1', name: 'Extra Computer Time', price: 20, category: 'technology', icon: '💻' },
  { id: 'reward_2', name: 'Class Game Session', price: 30, category: 'fun', icon: '🎮' },
  { id: 'reward_3', name: 'No Homework Pass', price: 25, category: 'privileges', icon: '📝' },
  { id: 'reward_4', name: 'Choose Class Music', price: 15, category: 'privileges', icon: '🎵' },
  { id: 'reward_5', name: 'Line Leader for a Week', price: 10, category: 'privileges', icon: '🎯' },
  { id: 'reward_6', name: 'Sit Anywhere Day', price: 12, category: 'privileges', icon: '💺' },
  { id: 'reward_7', name: 'Extra Recess Time', price: 18, category: 'fun', icon: '⏰' },
  { id: 'reward_8', name: 'Teach the Class', price: 35, category: 'special', icon: '🎓' },
];

// Available icons for new rewards
const REWARD_ICONS = ['💻', '🎮', '📝', '🎵', '🎯', '💺', '⏰', '🎓', '🏆', '⭐', '🎨', '📚', '🏃‍♂️', '🎁', '🎭', '🎪', '🎯', '🎲', '🎊', '🎉', '👑', '🏅', '🥇', '🎀', '🌟', '✨', '🔮', '🎈', '🎂', '🍕', '🍪', '🧸', '🚀', '🌈', '⚡', '🔥', '💎', '🍭'];

// ===============================================
// DAILY FEATURED ITEMS SYSTEM
// ===============================================

// Function to generate daily featured items - EXPORTED for use in DashboardTab
export const getDailyFeaturedItems = (SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  const allShopItems = [
    ...SHOP_BASIC_AVATARS.map(item => ({ ...item, category: 'basic_avatars', type: 'Basic Avatar' })),
    ...SHOP_PREMIUM_AVATARS.map(item => ({ ...item, category: 'premium_avatars', type: 'Premium Avatar' })),
    ...SHOP_BASIC_PETS.map(item => ({ ...item, category: 'basic_pets', type: 'Basic Pet' })),
    ...SHOP_PREMIUM_PETS.map(item => ({ ...item, category: 'premium_pets', type: 'Premium Pet' })),
    ...currentRewards.map(item => ({ ...item, category: 'rewards', type: 'reward' }))
  ];

  if (allShopItems.length === 0) return [];

  // Use date as seed for consistent daily featured items
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Create a simple seeded random function
  const seededRandom = (seed) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Convert date string to a number for seeding
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed += dateString.charCodeAt(i);
  }
  
  // Shuffle items using seeded random
  const shuffled = [...allShopItems];
  for (let i = shuffled.length - 1; i > 0; i--) {
    seed = seed * 9301 + 49297; // Linear congruential generator
    const j = Math.floor(seededRandom(seed) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Get 3 featured items with 30% discount
  const featured = shuffled.slice(0, 3).map(item => ({
    ...item,
    originalPrice: item.price,
    price: Math.max(1, Math.floor(item.price * 0.7)), // 30% discount
    salePercentage: 30
  }));
  
  return featured;
};

// ===============================================
// MYSTERY BOX SYSTEM
// ===============================================

const MYSTERY_BOX_PRICE = 10;

// Define rarity weights (higher = more common)
const RARITY_WEIGHTS = {
  common: 50,     // 50% base chance
  uncommon: 30,   // 30% base chance  
  rare: 15,       // 15% base chance
  epic: 4,        // 4% base chance
  legendary: 1    // 1% base chance
};

// Define XP and Coin rewards by rarity
const MYSTERY_REWARDS = {
  xp: {
    common: [3, 5, 8],
    uncommon: [10, 12, 15],
    rare: [18, 20, 25],
    epic: [30, 35, 40],
    legendary: [50, 75, 100]
  },
  coins: {
    common: [2, 3, 5],
    uncommon: [8, 10, 12],
    rare: [15, 18, 20],
    epic: [25, 30, 35],
    legendary: [40, 50, 60]
  }
};

// Function to determine item rarity based on price
const getItemRarity = (price) => {
  if (price <= 12) return 'common';
  if (price <= 20) return 'uncommon';
  if (price <= 30) return 'rare';
  if (price <= 45) return 'epic';
  return 'legendary';
};

// Function to get all possible mystery box prizes
const getMysteryBoxPrizes = (SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  const prizes = [];
  
  // Add shop avatars
  [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS].forEach(avatar => {
    prizes.push({
      type: 'avatar',
      item: avatar,
      rarity: getItemRarity(avatar.price),
      name: avatar.name,
      displayName: avatar.name
    });
  });
  
  // Add shop pets
  [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].forEach(pet => {
    prizes.push({
      type: 'pet',
      item: pet,
      rarity: getItemRarity(pet.price),
      name: pet.name,
      displayName: pet.name
    });
  });
  
  // Add class rewards
  currentRewards.forEach(reward => {
    prizes.push({
      type: 'reward',
      item: reward,
      rarity: getItemRarity(reward.price),
      name: reward.name,
      displayName: reward.name
    });
  });
  
  // Add XP rewards
  Object.entries(MYSTERY_REWARDS.xp).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({
        type: 'xp',
        amount: amount,
        rarity: rarity,
        name: `${amount} XP`,
        displayName: `${amount} XP Boost`,
        icon: '⭐'
      });
    });
  });
  
  // Add coin rewards
  Object.entries(MYSTERY_REWARDS.coins).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({
        type: 'coins',
        amount: amount,
        rarity: rarity,
        name: `${amount} Coins`,
        displayName: `${amount} Bonus Coins`,
        icon: '💰'
      });
    });
  });
  
  return prizes;
};

// Weighted random selection function
const selectRandomPrize = (prizes) => {
  // Create weighted array
  const weightedPrizes = [];
  prizes.forEach(prize => {
    const weight = RARITY_WEIGHTS[prize.rarity] || 1;
    for (let i = 0; i < weight; i++) {
      weightedPrizes.push(prize);
    }
  });
  
  // Select random prize
  const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
  return weightedPrizes[randomIndex];
};

// Get rarity color
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 border-gray-300';
    case 'uncommon': return 'text-green-600 border-green-300';
    case 'rare': return 'text-blue-600 border-blue-300';
    case 'epic': return 'text-purple-600 border-purple-300';
    case 'legendary': return 'text-yellow-600 border-yellow-300';
    default: return 'text-gray-600 border-gray-300';
  }
};

const getRarityBg = (rarity) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100';
    case 'uncommon': return 'bg-green-100';
    case 'rare': return 'bg-blue-100';
    case 'epic': return 'bg-purple-100';
    case 'legendary': return 'bg-yellow-100';
    default: return 'bg-gray-100';
  }
};

// ===============================================
// SELLING SYSTEM - NEW FEATURE
// ===============================================

// Helper function to calculate sell price (50% of original price)
const calculateSellPrice = (itemName, itemType, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  let originalPrice = 10; // Default fallback

  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    originalPrice = basicAvatar?.price || premiumAvatar?.price || 15;
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName || p.species === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName || p.species === itemName);
    originalPrice = basicPet?.price || premiumPet?.price || 15;
  } else if (itemType === 'reward') {
    const reward = currentRewards.find(r => r.id === itemName || r.name === itemName);
    originalPrice = reward?.price || 10;
  }

  return Math.floor(originalPrice * 0.5); // 50% of original price
};

// ===============================================
// MOBILE-OPTIMIZED SHOP TAB COMPONENT
// ===============================================
const ShopTab = ({ 
    students = [], 
    onUpdateStudent, 
    SHOP_BASIC_AVATARS = [],
    SHOP_PREMIUM_AVATARS = [],
    SHOP_BASIC_PETS = [],
    SHOP_PREMIUM_PETS = [],
    showToast = () => {},
    getAvatarImage,
    getPetImage,
    calculateCoins,
    calculateAvatarLevel,
    // New props for reward management
    classRewards = [],
    onUpdateRewards = () => {},
    saveRewards = () => {}
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('featured');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });
  const [featuredItems, setFeaturedItems] = useState([]);
  
  // Mystery Box states
  const [mysteryBoxModal, setMysteryBoxModal] = useState({ visible: false, stage: 'confirm' }); // confirm, opening, reveal
  const [mysteryBoxPrize, setMysteryBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // NEW: Selling states
  const [sellModal, setSellModal] = useState({ visible: false, item: null, type: null, price: 0 });
  const [showSellMode, setShowSellMode] = useState(false);
  
  // Reward Management States
  const [showRewardManager, setShowRewardManager] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [newReward, setNewReward] = useState({
    name: '',
    price: 10,
    category: 'privileges',
    icon: '🏆'
  });

  // Initialize rewards if none exist
  const currentRewards = classRewards.length > 0 ? classRewards : DEFAULT_TEACHER_REWARDS;

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Generate featured items daily - UPDATED TO USE NEW FUNCTION
  useEffect(() => {
    if (SHOP_BASIC_AVATARS.length > 0 || SHOP_PREMIUM_AVATARS.length > 0 || SHOP_BASIC_PETS.length > 0 || SHOP_PREMIUM_PETS.length > 0 || currentRewards.length > 0) {
      const featured = getDailyFeaturedItems(
        SHOP_BASIC_AVATARS, 
        SHOP_PREMIUM_AVATARS, 
        SHOP_BASIC_PETS, 
        SHOP_PREMIUM_PETS, 
        currentRewards
      );
      setFeaturedItems(featured);
    }
  }, [SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards]);

  // ===============================================
  // MYSTERY BOX FUNCTIONS
  // ===============================================
  
  const handleMysteryBoxPurchase = () => {
    if (!selectedStudent) return;
    
    const studentCoins = calculateCoins(selectedStudent);
    if (studentCoins < MYSTERY_BOX_PRICE) {
      showToast(`${selectedStudent.firstName} needs ${MYSTERY_BOX_PRICE - studentCoins} more coins for a Mystery Box!`, 'error');
      return;
    }
    
    setMysteryBoxModal({ visible: true, stage: 'confirm' });
  };
  
  const confirmMysteryBoxPurchase = async () => {
    if (!selectedStudent) return;
    
    // Deduct coins first
    const updatedStudent = { 
      ...selectedStudent, 
      coinsSpent: (selectedStudent.coinsSpent || 0) + MYSTERY_BOX_PRICE 
    };
    
    // Get all possible prizes
    const allPrizes = getMysteryBoxPrizes(SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    
    // Select random prize
    const prize = selectRandomPrize(allPrizes);
    setMysteryBoxPrize(prize);
    
    // Update student with purchase
    await onUpdateStudent(updatedStudent);
    
    // Show opening animation
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // After animation, award the prize
    setTimeout(() => {
      awardMysteryBoxPrize(updatedStudent, prize);
    }, 3000);
  };
  
  const awardMysteryBoxPrize = async (student, prize) => {
    let finalStudent = { ...student };
    
    switch (prize.type) {
      case 'avatar':
        const avatarBase = prize.item.base || prize.item.name;
        if (!finalStudent.ownedAvatars.includes(avatarBase)) {
          finalStudent.ownedAvatars = [...finalStudent.ownedAvatars, avatarBase];
        }
        break;
        
      case 'pet':
        const newPet = {
          id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: prize.item.name,
          image: prize.item.image,
          species: prize.item.species || prize.item.name,
          speed: prize.item.speed || 1.0,
          wins: 0,
          level: 1,
          type: 'mystery_box',
          dateObtained: new Date().toISOString()
        };
        finalStudent.ownedPets = [...(finalStudent.ownedPets || []), newPet];
        break;
        
      case 'reward':
        finalStudent.rewardsPurchased = [...(finalStudent.rewardsPurchased || []), {
          ...prize.item,
          purchasedAt: new Date().toISOString(),
          source: 'mystery_box'
        }];
        break;
        
      case 'xp':
        finalStudent.totalPoints = (finalStudent.totalPoints || 0) + prize.amount;
        break;
        
      case 'coins':
        finalStudent.currency = (finalStudent.currency || 0) + prize.amount;
        break;
    }
    
    // Update student and show reward
    await onUpdateStudent(finalStudent);
    setIsSpinning(false);
    setMysteryBoxModal({ visible: true, stage: 'reveal' });
  };

  // ===============================================
  // SELLING FUNCTIONS - NEW FEATURE
  // ===============================================
  
  const handleSellItem = (item, type) => {
    if (!selectedStudent) return;
    
    let itemName, sellPrice;
    
    if (type === 'avatar') {
      itemName = item;
      sellPrice = calculateSellPrice(itemName, 'avatar', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    } else if (type === 'pet') {
      itemName = item.name || item.species;
      sellPrice = calculateSellPrice(itemName, 'pet', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    } else if (type === 'reward') {
      itemName = item.name;
      sellPrice = calculateSellPrice(item.id || item.name, 'reward', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    }
    
    setSellModal({
      visible: true,
      item: item,
      type: type,
      price: sellPrice
    });
  };
  
  const confirmSell = async () => {
    if (!selectedStudent || !sellModal.item) return;
    
    let updatedStudent = { ...selectedStudent };
    
    if (sellModal.type === 'avatar') {
      // Remove avatar from owned avatars
      updatedStudent.ownedAvatars = updatedStudent.ownedAvatars.filter(a => a !== sellModal.item);
      
      // If selling equipped avatar, revert to default
      if (updatedStudent.avatarBase === sellModal.item) {
        updatedStudent.avatarBase = updatedStudent.ownedAvatars[0] || 'Wizard F';
      }
    } else if (sellModal.type === 'pet') {
      // Remove pet from owned pets
      updatedStudent.ownedPets = updatedStudent.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
      // Remove reward from purchased rewards
      updatedStudent.rewardsPurchased = updatedStudent.rewardsPurchased.filter(r => 
        r.id !== sellModal.item.id || r.purchasedAt !== sellModal.item.purchasedAt
      );
    }
    
    // Add coins from sale
    updatedStudent.currency = (updatedStudent.currency || 0) + sellModal.price;
    
    await onUpdateStudent(updatedStudent);
    showToast(`Sold for ${sellModal.price} coins!`, 'success');
    setSellModal({ visible: false, item: null, type: null, price: 0 });
  };

  // ===============================================
  // EQUIPMENT FUNCTIONS
  // ===============================================
  
  const handleEquip = async (type, itemId) => {
    if (!selectedStudent) return;
    
    let updatedStudent = { ...selectedStudent };
    
    if (type === 'avatar') {
      updatedStudent.avatarBase = itemId;
    } else if (type === 'pet') {
      // Move selected pet to front of array
      const petIndex = updatedStudent.ownedPets.findIndex(p => p.id === itemId);
      if (petIndex > -1) {
        const [selectedPet] = updatedStudent.ownedPets.splice(petIndex, 1);
        updatedStudent.ownedPets.unshift(selectedPet);
      }
    }
    
    await onUpdateStudent(updatedStudent);
    showToast(`${type === 'avatar' ? 'Avatar' : 'Pet'} equipped!`, 'success');
  };

  // ===============================================
  // PURCHASE FUNCTIONS
  // ===============================================
  
  const handlePurchase = async () => {
    if (!selectedStudent || !purchaseModal.item) return;
    
    const studentCoins = calculateCoins(selectedStudent);
    if (studentCoins < purchaseModal.item.price) {
      showToast(`${selectedStudent.firstName} needs ${purchaseModal.item.price - studentCoins} more coins!`, 'error');
      return;
    }
    
    let updatedStudent = { ...selectedStudent };
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + purchaseModal.item.price;
    
    if (purchaseModal.item.category === 'basic_avatars' || purchaseModal.item.category === 'premium_avatars') {
      // Handle avatar purchase
      const avatarBase = purchaseModal.item.base || purchaseModal.item.name;
      if (!updatedStudent.ownedAvatars.includes(avatarBase)) {
        updatedStudent.ownedAvatars = [...updatedStudent.ownedAvatars, avatarBase];
      }
      showToast(`${purchaseModal.item.name} avatar purchased!`, 'success');
    } else if (purchaseModal.item.category === 'basic_pets' || purchaseModal.item.category === 'premium_pets') {
      // Handle pet purchase
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: purchaseModal.item.name,
        image: purchaseModal.item.image,
        species: purchaseModal.item.species || purchaseModal.item.name,
        speed: purchaseModal.item.speed || 1.0,
        wins: 0,
        level: 1,
        type: 'purchased',
        dateObtained: new Date().toISOString()
      };
      
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      showToast(`${purchaseModal.item.name} pet purchased!`, 'success');
    } else if (purchaseModal.item.category === 'rewards') {
      // Handle teacher reward purchase
      updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), {
        ...purchaseModal.item,
        purchasedAt: new Date().toISOString()
      }];
      showToast(`${purchaseModal.item.name} reward purchased!`, 'success');
    }
    
    await onUpdateStudent(updatedStudent);
    setPurchaseModal({ visible: false, item: null, type: null });
  };

  // ===============================================
  // REWARD MANAGEMENT FUNCTIONS
  // ===============================================
  
  const handleSaveReward = () => {
    if (!newReward.name.trim()) return;
    
    const reward = {
      id: `reward_${Date.now()}`,
      ...newReward
    };
    
    const updatedRewards = [...currentRewards, reward];
    onUpdateRewards(updatedRewards);
    saveRewards();
    
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward added successfully!', 'success');
  };
  
  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward({ ...reward });
  };
  
  const handleUpdateReward = () => {
    if (!newReward.name.trim() || !editingReward) return;
    
    const updatedRewards = currentRewards.map(r => 
      r.id === editingReward.id ? { ...newReward } : r
    );
    
    onUpdateRewards(updatedRewards);
    saveRewards();
    
    setEditingReward(null);
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward updated successfully!', 'success');
  };
  
  const handleDeleteReward = (rewardId) => {
    const updatedRewards = currentRewards.filter(r => r.id !== rewardId);
    onUpdateRewards(updatedRewards);
    saveRewards();
    showToast('Reward deleted successfully!', 'success');
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  const renderShopItems = () => {
    let items = [];
    
    switch (activeCategory) {
      case 'featured':
        items = featuredItems;
        break;
      case 'basic_avatars':
        items = SHOP_BASIC_AVATARS.map(item => ({ ...item, type: 'Basic Avatar' }));
        break;
      case 'premium_avatars':
        items = SHOP_PREMIUM_AVATARS.map(item => ({ ...item, type: 'Premium Avatar' }));
        break;
      case 'basic_pets':
        items = SHOP_BASIC_PETS.map(item => ({ ...item, type: 'Basic Pet' }));
        break;
      case 'premium_pets':
        items = SHOP_PREMIUM_PETS.map(item => ({ ...item, type: 'Premium Pet' }));
        break;
      case 'rewards':
        items = currentRewards.map(item => ({ ...item, type: 'reward' }));
        break;
      case 'mysterybox':
        return (
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 sm:p-8 text-center border-4 border-purple-300 shadow-2xl max-w-md">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6 animate-bounce">🎁</div>
              <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-3 sm:mb-4">Mystery Box</h3>
              <p className="text-sm sm:text-base text-purple-600 mb-4 sm:mb-6">
                Take a chance! You could win amazing avatars, pets, XP, coins, or special rewards!
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-4 sm:mb-6">💰 {MYSTERY_BOX_PRICE} coins</div>
              <button
                onClick={handleMysteryBoxPurchase}
                disabled={!selectedStudent || calculateCoins(selectedStudent) < MYSTERY_BOX_PRICE}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-400 font-bold shadow-lg text-sm sm:text-base transform hover:scale-105 transition-all"
              >
                🎲 Try Your Luck!
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛍️</div>
          <p className="text-base sm:text-lg text-gray-600">No items available in this category</p>
        </div>
      );
    }

    return items.map((item, index) => {
      const canAfford = selectedStudent ? calculateCoins(selectedStudent) >= item.price : false;
      const isOwned = selectedStudent && (
        (item.type?.includes('Avatar') && selectedStudent.ownedAvatars?.includes(item.base || item.name)) ||
        (item.type?.includes('Pet') && selectedStudent.ownedPets?.some(pet => pet.species === (item.species || item.name)))
      );

      return (
        <div key={index} className={`
          border-2 rounded-xl p-3 sm:p-4 text-center shadow-lg transition-all hover:shadow-xl
          ${canAfford ? 'hover:border-green-400' : 'hover:border-red-400'}
          ${isOwned ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
          ${item.originalPrice ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300' : ''}
        `}>
          {/* Sale Badge */}
          {item.originalPrice && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              SALE!
            </div>
          )}
          
          {/* Item Image/Icon */}
          <div className="relative mb-2 sm:mb-3">
            {item.type === 'reward' ? (
              <div className="text-3xl sm:text-4xl mb-2">{item.icon}</div>
            ) : (
              <img 
                src={item.path} 
                alt={item.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto rounded-lg shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            {isOwned && (
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-1 py-0.5 rounded-full">
                ✓
              </div>
            )}
          </div>
          
          {/* Item Name */}
          <h4 className="text-sm sm:text-base font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">{item.name}</h4>
          
          {/* Item Type */}
          <p className="text-xs text-gray-600 mb-2 sm:mb-3 capitalize">{item.type}</p>
          
          {/* Price Display */}
          <div className="mb-3 sm:mb-4">
            {item.originalPrice ? (
              <div className="space-y-1">
                <div className="text-sm text-gray-500 line-through">💰{item.originalPrice}</div>
                <div className="text-lg sm:text-xl font-bold text-green-600">💰{item.price}</div>
                <div className="text-xs text-red-600 font-bold">Save {item.salePercentage}%!</div>
              </div>
            ) : (
              <div className="text-lg sm:text-xl font-bold text-yellow-600">💰{item.price}</div>
            )}
          </div>
          
          {/* Purchase Button */}
          <button
            onClick={() => setPurchaseModal({ visible: true, item, type: item.type })}
            disabled={!selectedStudent || !canAfford || isOwned}
            className={`w-full py-2 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
              isOwned 
                ? 'bg-green-500 text-white cursor-not-allowed' 
                : canAfford 
                  ? item.originalPrice 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOwned ? 'Owned' : canAfford ? (item.originalPrice ? 'Buy Now - SALE!' : 'Purchase') : 'Not Enough Coins'}
          </button>
        </div>
      );
    });
  };

  const renderMysteryBoxModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8">
          {mysteryBoxModal.stage === 'confirm' && (
            <>
              <div className="text-6xl mb-4 animate-bounce">🎁</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Mystery Box Adventure!</h2>
              <p className="mb-6 text-sm sm:text-base">
                Open a Mystery Box for 💰{MYSTERY_BOX_PRICE} coins?<br/>
                You could win avatars, pets, XP, coins, or rewards!
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setMysteryBoxModal({ visible: false, stage: 'confirm' })} 
                  className="flex-1 py-3 border rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmMysteryBoxPurchase} 
                  className="flex-1 py-3 bg-purple-500 text-white rounded-lg text-sm sm:text-base hover:bg-purple-600"
                >
                  Open Box!
                </button>
              </div>
            </>
          )}
          
          {mysteryBoxModal.stage === 'opening' && (
            <>
              <div className={`text-8xl mb-6 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Opening Mystery Box...</h2>
              <div className="text-purple-600 font-semibold">
                {isSpinning ? 'Spinning...' : 'Get ready!'}
              </div>
            </>
          )}
          
          {mysteryBoxModal.stage === 'reveal' && mysteryBoxPrize && (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">You Won!</h2>
              <div className={`p-4 rounded-xl mb-4 ${getRarityBg(mysteryBoxPrize.rarity)} border-2 ${getRarityColor(mysteryBoxPrize.rarity)}`}>
                <div className="text-3xl mb-2">
                  {mysteryBoxPrize.icon || (mysteryBoxPrize.item?.icon) || '🏆'}
                </div>
                <h3 className="font-bold text-lg">{mysteryBoxPrize.displayName}</h3>
                <p className={`text-sm font-semibold uppercase ${getRarityColor(mysteryBoxPrize.rarity)}`}>
                  {mysteryBoxPrize.rarity}
                </p>
              </div>
              <button 
                onClick={() => setMysteryBoxModal({ visible: false, stage: 'confirm' })} 
                className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Awesome!
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSellModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-6">
          <h2 className="text-xl font-bold mb-4">Sell Item</h2>
          <div className="text-4xl mb-4">💰</div>
          <p className="mb-4 text-sm">
            Sell {sellModal.type === 'pet' ? sellModal.item.name : sellModal.type === 'avatar' ? sellModal.item : sellModal.item.name} for 💰{sellModal.price} coins?
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })} 
              className="flex-1 py-3 border rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={confirmSell} 
              className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRewardManager = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Class Rewards</h2>
            <button onClick={() => setShowRewardManager(false)} className="text-2xl font-bold">×</button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Add/Edit Reward Form */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">{editingReward ? 'Edit Reward' : 'Add New Reward'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Reward Name"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Price in Coins"
                  value={newReward.price}
                  onChange={(e) => setNewReward({ ...newReward, price: parseInt(e.target.value) || 10 })}
                  className="px-4 py-2 border rounded-lg"
                />
                <select
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="privileges">Privileges</option>
                  <option value="technology">Technology</option>
                  <option value="fun">Fun</option>
                  <option value="special">Special</option>
                </select>
                <select
                  value={newReward.icon}
                  onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  {REWARD_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon} {icon}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={editingReward ? handleUpdateReward : handleSaveReward}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingReward ? 'Update Reward' : 'Add Reward'}
                </button>
                {editingReward && (
                  <button
                    onClick={() => {
                      setEditingReward(null);
                      setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
                    }}
                    className="px-6 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Existing Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRewards.map(reward => (
                <div key={reward.id} className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="text-center mb-3">
                    <div className="text-3xl mb-2">{reward.icon}</div>
                    <h4 className="font-bold">{reward.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{reward.category}</p>
                    <p className="text-lg font-bold text-yellow-600 mt-2">💰{reward.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReward(reward)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // MAIN COMPONENT RENDER
  // ===============================================

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE-OPTIMIZED Header with Student Selector */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">🛍️ Classroom Shop</h1>
              <p className="text-xs sm:text-sm text-purple-100">Purchase avatars, pets, and classroom rewards!</p>
            </div>
            <div className="text-3xl sm:text-4xl opacity-20">💰</div>
          </div>
          
          {/* Student Selector */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
            <label className="text-sm sm:text-base font-semibold whitespace-nowrap">Select Student:</label>
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2 rounded-lg text-gray-800 text-sm sm:text-base min-w-0"
            >
              <option value="">Choose a student...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} (💰{calculateCoins(student)})
                </option>
              ))}
            </select>
            
            {/* Inventory and Sell Mode Buttons */}
            {selectedStudent && (
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setInventoryModal({ visible: true })}
                  className="px-3 sm:px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-semibold text-xs sm:text-sm whitespace-nowrap"
                >
                  🎒 Inventory
                </button>
                <button
                  onClick={() => setShowSellMode(!showSellMode)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap ${
                    showSellMode ? 'bg-red-500 text-white' : 'bg-white text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  💸 {showSellMode ? 'Exit Sell' : 'Sell Mode'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student Selection Notice */}
      {!selectedStudent && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 text-center">
          <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">👆</div>
          <h3 className="text-lg sm:text-xl font-bold text-yellow-800 mb-1 sm:mb-2">Select a Student</h3>
          <p className="text-sm sm:text-base text-yellow-700">Choose a student above to start shopping for their character!</p>
        </div>
      )}

      {/* MOBILE-OPTIMIZED Shop Content */}
      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            {/* Category Navigation - MOBILE RESPONSIVE */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                {[
                  { id: 'featured', name: 'Daily Specials', shortName: 'Specials' },
                  { id: 'basic_avatars', name: 'Basic Avatars', shortName: 'Basic' },
                  { id: 'premium_avatars', name: 'Premium Avatars', shortName: 'Premium' },
                  { id: 'basic_pets', name: 'Basic Pets', shortName: 'Pets' },
                  { id: 'premium_pets', name: 'Premium Pets', shortName: 'Premium' },
                  { id: 'rewards', name: 'Class Rewards', shortName: 'Rewards' },
                  { id: 'mysterybox', name: 'Mystery Box', shortName: 'Mystery' }
                ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-2 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                        activeCategory === cat.id 
                          ? cat.id === 'featured' 
                            ? 'bg-red-500 text-white' 
                            : cat.id === 'mysterybox'
                            ? 'bg-purple-500 text-white'
                            : 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <span className="sm:hidden">{cat.shortName}</span>
                      <span className="hidden sm:inline">{cat.name}</span>
                    </button>
                ))}
                
                {/* Manage Rewards Button - Only show when in rewards category */}
                {activeCategory === 'rewards' && (
                  <button 
                    onClick={() => setShowRewardManager(true)}
                    className="px-2 sm:px-4 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 ml-2 sm:ml-4 text-xs sm:text-sm whitespace-nowrap"
                  >
                    🛠️ <span className="hidden sm:inline">Manage</span>
                  </button>
                )}
            </div>
            
            {/* Special Header for Featured Section */}
            {activeCategory === 'featured' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">🔥</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-800">Daily Special Offers!</h3>
                    <p className="text-sm sm:text-base text-red-600">Limited time discounts - Save up to 30%!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Special Header for Mystery Box Section */}
            {activeCategory === 'mysterybox' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">🎁</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-purple-800">Mystery Box Adventure!</h3>
                    <p className="text-sm sm:text-base text-purple-600">Take a chance and discover amazing surprises!</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* MOBILE-RESPONSIVE Shop Grid */}
            <div className={`grid gap-3 sm:gap-4 ${
              activeCategory === 'rewards' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : activeCategory === 'featured'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  : activeCategory === 'mysterybox'
                    ? 'grid-cols-1'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            }`}>
              {renderShopItems()}
            </div>
        </div>
      )}

      {/* MOBILE-OPTIMIZED Purchase Modal */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Confirm Purchase</h2>
                {purchaseModal.item.originalPrice && (
                  <div className="mb-2">
                    <span className="text-base sm:text-lg text-gray-500 line-through">💰{purchaseModal.item.originalPrice}</span>
                    <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-bold">
                      SALE!
                    </span>
                  </div>
                )}
                <p className="mb-3 sm:mb-4 text-sm sm:text-base">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
                <div className="flex gap-3 sm:gap-4">
                    <button onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} className="flex-1 py-2 sm:py-3 border rounded-lg text-sm sm:text-base">Cancel</button>
                    <button onClick={handlePurchase} className="flex-1 py-2 sm:py-3 bg-green-500 text-white rounded-lg text-sm sm:text-base">Confirm</button>
                </div>
            </div>
        </div>
      )}

      {/* Mystery Box Modal */}
      {mysteryBoxModal.visible && renderMysteryBoxModal()}

      {/* NEW: Sell Confirmation Modal */}
      {sellModal.visible && renderSellModal()}

      {/* MOBILE-OPTIMIZED Inventory Modal - UPDATED WITH SELLING FEATURE */}
      {inventoryModal.visible && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 sm:p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg sm:text-2xl font-bold">{selectedStudent.firstName}'s Inventory</h2>
                    <div className="flex items-center gap-2">
                      {showSellMode && (
                        <span className="text-xs sm:text-sm bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                          Sell Mode
                        </span>
                      )}
                      <button onClick={() => setInventoryModal({ visible: false })} className="text-xl sm:text-2xl font-bold">×</button>
                    </div>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-2">Owned Avatars</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
                            {selectedStudent.ownedAvatars?.map(avatarName => (
                                <div key={avatarName} className={`border-2 rounded-lg p-2 text-center ${selectedStudent.avatarBase === avatarName ? 'border-blue-500' : ''}`}>
                                    <img src={getAvatarImage(avatarName, calculateAvatarLevel(selectedStudent.totalPoints))} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-1"/>
                                    <p className="text-xs font-semibold truncate">{avatarName}</p>
                                    {selectedStudent.avatarBase === avatarName ? (
                                        <p className="text-xs text-blue-600 font-bold">Equipped</p>
                                    ) : showSellMode ? (
                                        <button 
                                          onClick={() => handleSellItem(avatarName, 'avatar')} 
                                          className="text-xs bg-red-500 text-white px-1 sm:px-2 py-0.5 rounded mt-1 hover:bg-red-600"
                                        >
                                          Sell
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEquip('avatar', avatarName)} className="text-xs bg-gray-200 px-1 sm:px-2 py-0.5 rounded mt-1">Equip</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg mb-2">Owned Pets</h3>
                        {selectedStudent.ownedPets?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-4">
                                {selectedStudent.ownedPets.map((pet, index) => (
                                    <div key={pet.id} className={`border-2 rounded-lg p-2 text-center ${index === 0 ? 'border-blue-500' : ''}`}>
                                        <img src={getPetImage(pet)} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-1"/>
                                        <p className="text-xs font-semibold truncate">{pet.name}</p>
                                        {index === 0 ? (
                                            <p className="text-xs text-blue-600 font-bold">Following</p>
                                        ) : showSellMode ? (
                                            <button 
                                              onClick={() => handleSellItem(pet, 'pet')} 
                                              className="text-xs bg-red-500 text-white px-1 sm:px-2 py-0.5 rounded mt-1 hover:bg-red-600"
                                            >
                                              Sell
                                            </button>
                                        ) : (
                                            <button onClick={() => handleEquip('pet', pet.id)} className="text-xs bg-gray-200 px-1 sm:px-2 py-0.5 rounded mt-1">Equip</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (<p className="text-gray-500 text-sm sm:text-base">No pets yet!</p>)}
                    </div>
                    
                    {/* Purchased Rewards */}
                    {selectedStudent.rewardsPurchased?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-base sm:text-lg mb-2">Earned Rewards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                          {selectedStudent.rewardsPurchased.map((reward, index) => {
                            // Find the reward in current rewards to get the icon
                            const rewardDetails = currentRewards.find(r => r.id === reward.id) || reward;
                            return (
                              <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-2 sm:p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                  <div className="text-xl sm:text-2xl">{rewardDetails.icon || '🎁'}</div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm sm:text-base truncate">{reward.name}</p>
                                    <p className="text-xs text-gray-600">Earned: {new Date(reward.purchasedAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {showSellMode && (
                                  <button 
                                    onClick={() => handleSellItem(reward, 'reward')} 
                                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex-shrink-0"
                                  >
                                    Sell
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Reward Manager Modal */}
      {showRewardManager && renderRewardManager()}
    </div>
  );
};

export default ShopTab;