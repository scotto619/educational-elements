// components/tabs/ShopTab.js - MOBILE-OPTIMIZED SHOP WITH MYSTERY BOX AND SELLING FEATURE - FIXED PURCHASE FUNCTIONS
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

// Helper function to find the original price of an item
const findOriginalPrice = (itemName, type, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  let originalPrice = 0;
  
  if (type === 'avatar') {
    const avatar = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS].find(a => a.name === itemName);
    originalPrice = avatar?.price || 10;
  } else if (type === 'pet') {
    const pet = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].find(p => p.name === itemName);
    originalPrice = pet?.price || 10;
  } else if (type === 'reward') {
    const reward = currentRewards.find(r => r.name === itemName);
    originalPrice = reward?.price || 10;
  }
  
  return originalPrice;
};

// Calculate sell price (50% of original)
const calculateSellPrice = (originalPrice) => {
  return Math.max(1, Math.floor(originalPrice * 0.5));
};

// ===============================================
// DAILY FEATURED ITEMS GENERATOR - TRULY CHANGES DAILY
// ===============================================
export const getDailyFeaturedItems = (SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  const allShopItems = [
    ...SHOP_BASIC_AVATARS.map(item => ({ ...item, category: 'basic_avatars', type: 'avatar' })),
    ...SHOP_PREMIUM_AVATARS.map(item => ({ ...item, category: 'premium_avatars', type: 'avatar' })),
    ...SHOP_BASIC_PETS.map(item => ({ ...item, category: 'basic_pets', type: 'pet' })),
    ...SHOP_PREMIUM_PETS.map(item => ({ ...item, category: 'premium_pets', type: 'pet' })),
    ...currentRewards.map(item => ({ ...item, category: 'rewards', type: 'reward' }))
  ];

  if (allShopItems.length > 0) {
    // Use full date (year + month + day) as seed for consistent daily featured items
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Create a seeded random function for consistent results throughout the day
    const seededRandom = (index) => {
      const x = Math.sin(seed + index) * 10000;
      return x - Math.floor(x);
    };
    
    // Shuffle array using seeded random
    const shuffled = [...allShopItems].sort((a, b) => {
      const indexA = allShopItems.indexOf(a);
      const indexB = allShopItems.indexOf(b);
      return seededRandom(indexA) - seededRandom(indexB);
    });
    
    const featured = shuffled.slice(0, 3).map(item => ({
      ...item,
      originalPrice: item.price,
      price: Math.max(1, Math.floor(item.price * 0.7)), // 30% discount
      salePercentage: 30
    }));
    
    return featured;
  }
  
  return [];
};

const ShopTab = ({ 
  students = [], 
  selectedStudent, 
  onSelectStudent, 
  onUpdateStudent, 
  getAvatarImage, 
  getPetImage, 
  calculateCoins,
  calculateAvatarLevel,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  showToast = () => {}
}) => {
  const [activeCategory, setActiveCategory] = useState('basic_avatars');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });
  const [featuredItems, setFeaturedItems] = useState([]);
  const [currentRewards, setCurrentRewards] = useState(DEFAULT_TEACHER_REWARDS);
  const [showRewardManager, setShowRewardManager] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [mysteryBoxModal, setMysteryBoxModal] = useState({ visible: false, stage: 'confirm' });
  const [mysteryBoxPrize, setMysteryBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSellMode, setShowSellMode] = useState(false);
  const [sellModal, setSellModal] = useState({ visible: false, item: null, type: null, price: 0 });

  // Load teacher rewards from localStorage
  useEffect(() => {
    const savedRewards = localStorage.getItem('teacherRewards');
    if (savedRewards) {
      setCurrentRewards(JSON.parse(savedRewards));
    }
  }, []);

  // Save rewards when they change
  const saveRewards = (rewards) => {
    setCurrentRewards(rewards);
    localStorage.setItem('teacherRewards', JSON.stringify(rewards));
  };

  // Generate featured items daily - UPDATED TO USE NEW FUNCTION
  useEffect(() => {
    const featured = getDailyFeaturedItems(SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    setFeaturedItems(featured);
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
    
    // Deduct coins first - FIXED: Pass studentId and updates separately
    const updates = { 
      coinsSpent: (selectedStudent.coinsSpent || 0) + MYSTERY_BOX_PRICE 
    };
    onUpdateStudent(selectedStudent.id, updates);
    
    // Start the opening sequence
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // Get all possible prizes
    const allPrizes = getMysteryBoxPrizes(
      SHOP_BASIC_AVATARS, 
      SHOP_PREMIUM_AVATARS, 
      SHOP_BASIC_PETS, 
      SHOP_PREMIUM_PETS, 
      currentRewards
    );
    
    // Select random prize
    const selectedPrize = selectRandomPrize(allPrizes);
    setMysteryBoxPrize(selectedPrize);
    
    // Spinning animation (3 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setMysteryBoxModal({ visible: true, stage: 'reveal' });
      
      // Award the prize - pass the updated student with the coins already deducted
      const updatedStudent = { ...selectedStudent, coinsSpent: (selectedStudent.coinsSpent || 0) + MYSTERY_BOX_PRICE };
      awardMysteryBoxPrize(selectedPrize, updatedStudent);
    }, 3000);
  };
  
  const awardMysteryBoxPrize = (prize, student) => {
    let updates = {};
    let message = '';
    
    switch (prize.type) {
      case 'avatar':
        if (!student.ownedAvatars?.includes(prize.item.name)) {
          updates.ownedAvatars = [...new Set([...(student.ownedAvatars || []), prize.item.name])];
          message = `${student.firstName} won the ${prize.item.name} avatar!`;
        } else {
          // Already owned, give coins instead
          updates.currency = (student.currency || 0) + 5;
          message = `${student.firstName} already had the ${prize.item.name} avatar, so got 5 bonus coins instead!`;
        }
        break;
        
      case 'pet':
        const newPet = { ...prize.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(student.ownedPets || []), newPet];
        message = `${student.firstName} won a ${prize.item.name}!`;
        break;
        
      case 'reward':
        updates.rewardsPurchased = [...(student.rewardsPurchased || []), { 
          ...prize.item, 
          purchasedAt: new Date().toISOString() 
        }];
        message = `${student.firstName} won ${prize.item.name}!`;
        break;
        
      case 'xp':
        updates.totalPoints = (student.totalPoints || 0) + prize.amount;
        message = `${student.firstName} won ${prize.amount} bonus XP!`;
        break;
        
      case 'coins':
        updates.currency = (student.currency || 0) + prize.amount;
        message = `${student.firstName} won ${prize.amount} bonus coins!`;
        break;
    }
    
    // FIXED: Pass studentId and updates separately
    onUpdateStudent(student.id, updates);
    showToast(message, 'success');
  };
  
  const closeMysteryBoxModal = () => {
    setMysteryBoxModal({ visible: false, stage: 'confirm' });
    setMysteryBoxPrize(null);
    setIsSpinning(false);
  };

  // ===============================================
  // NEW: SELLING FUNCTIONS
  // ===============================================
  
  const handleSellItem = (item, type) => {
    if (!selectedStudent) return;
    
    let itemName = '';
    let canSell = true;
    let reason = '';
    
    if (type === 'avatar') {
      itemName = item;
      // Check if this is the currently equipped avatar
      if (selectedStudent.avatarBase === item) {
        canSell = false;
        reason = 'Cannot sell currently equipped avatar';
      }
      // Check if this is the only avatar owned
      if (selectedStudent.ownedAvatars?.length <= 1) {
        canSell = false;
        reason = 'Cannot sell your last avatar';
      }
    } else if (type === 'pet') {
      itemName = item.name;
      // Check if this is the active pet (first in list)
      if (selectedStudent.ownedPets?.[0]?.id === item.id) {
        // Allow selling active pet, but show warning in modal
      }
    } else if (type === 'reward') {
      itemName = item.name;
      // Rewards can always be sold
    }
    
    if (!canSell) {
      showToast(reason, 'error');
      return;
    }
    
    const originalPrice = findOriginalPrice(itemName, type, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    const sellPrice = calculateSellPrice(originalPrice);
    
    setSellModal({ 
      visible: true, 
      item: item, 
      type: type, 
      price: sellPrice,
      originalPrice: originalPrice 
    });
  };
  
  const confirmSell = () => {
    if (!selectedStudent || !sellModal.item) return;
    
    let updates = {
      currency: (selectedStudent.currency || 0) + sellModal.price
    };
    
    // Remove the item from inventory
    if (sellModal.type === 'avatar') {
      updates.ownedAvatars = selectedStudent.ownedAvatars.filter(a => a !== sellModal.item);
    } else if (sellModal.type === 'pet') {
      updates.ownedPets = selectedStudent.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
      // For rewards, find by name and remove first match
      const rewardIndex = selectedStudent.rewardsPurchased?.findIndex(r => 
        r.name === sellModal.item.name && r.purchasedAt === sellModal.item.purchasedAt
      );
      if (rewardIndex >= 0) {
        updates.rewardsPurchased = [
          ...selectedStudent.rewardsPurchased.slice(0, rewardIndex),
          ...selectedStudent.rewardsPurchased.slice(rewardIndex + 1)
        ];
      }
    }
    
    onUpdateStudent(selectedStudent.id, updates);
    showToast(`Sold ${sellModal.item.name || sellModal.item} for ${sellModal.price} coins!`, 'success');
    
    setSellModal({ visible: false, item: null, type: null, price: 0 });
  };

  // ===============================================
  // PURCHASE HANDLERS
  // ===============================================

  const handlePurchaseClick = (item, type) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }
    setPurchaseModal({ visible: true, item, type });
  };

  const handlePurchase = () => {
    if (!selectedStudent) return;

    const { item, type } = purchaseModal;
    const studentCoins = calculateCoins(selectedStudent);

    if (studentCoins < item.price) {
      showToast(`${selectedStudent.firstName} needs ${item.price - studentCoins} more coins!`, 'error');
      return;
    }

    let updates = {
      coinsSpent: (selectedStudent.coinsSpent || 0) + item.price
    };

    if (type === 'avatar') {
      if (selectedStudent.ownedAvatars?.includes(item.name)) {
        showToast(`${selectedStudent.firstName} already owns this avatar!`, 'error');
        setPurchaseModal({ visible: false, item: null, type: null });
        return;
      }
      updates.ownedAvatars = [...new Set([...(selectedStudent.ownedAvatars || []), item.name])];
      showToast(`${selectedStudent.firstName} purchased ${item.name}!`, 'success');
    } else if (type === 'pet') {
      const newPet = { ...item, id: `pet_${Date.now()}` };
      updates.ownedPets = [...(selectedStudent.ownedPets || []), newPet];
      showToast(`${selectedStudent.firstName} purchased ${item.name}!`, 'success');
    } else if (type === 'reward') {
      updates.rewardsPurchased = [...(selectedStudent.rewardsPurchased || []), { 
        ...item, 
        purchasedAt: new Date().toISOString() 
      }];
      showToast(`${selectedStudent.firstName} earned ${item.name}!`, 'success');
    }

    onUpdateStudent(selectedStudent.id, updates);
    setPurchaseModal({ visible: false, item: null, type: null });
  };

  const handleEquip = (type, itemId) => {
    if (!selectedStudent) return;
    
    let updates = {};
    if (type === 'avatar') {
      updates.avatarBase = itemId;
      showToast(`${selectedStudent.firstName} equipped ${itemId}!`, 'success');
    } else if (type === 'pet') {
      const petToEquip = selectedStudent.ownedPets.find(p => p.id === itemId);
      if (petToEquip) {
        const otherPets = selectedStudent.ownedPets.filter(p => p.id !== itemId);
        updates.ownedPets = [petToEquip, ...otherPets];
        showToast(`${selectedStudent.firstName} equipped ${petToEquip.name}!`, 'success');
      }
    }
    
    onUpdateStudent(selectedStudent.id, updates);
  };

  // ===============================================
  // REWARD MANAGEMENT
  // ===============================================

  const handleAddReward = () => {
    setEditingReward({
      id: `reward_${Date.now()}`,
      name: '',
      price: 10,
      category: 'privileges',
      icon: '🎁'
    });
  };

  const handleEditReward = (reward) => {
    setEditingReward({ ...reward });
  };

  const handleSaveReward = () => {
    if (!editingReward.name.trim()) {
      showToast('Please enter a reward name!', 'error');
      return;
    }

    if (editingReward.price < 1) {
      showToast('Price must be at least 1 coin!', 'error');
      return;
    }

    const existingIndex = currentRewards.findIndex(r => r.id === editingReward.id);
    let updatedRewards;
    
    if (existingIndex >= 0) {
      updatedRewards = [...currentRewards];
      updatedRewards[existingIndex] = editingReward;
      showToast('Reward updated!', 'success');
    } else {
      updatedRewards = [...currentRewards, editingReward];
      showToast('Reward added!', 'success');
    }

    saveRewards(updatedRewards);
    setEditingReward(null);
  };

  const handleDeleteReward = (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      const updatedRewards = currentRewards.filter(r => r.id !== rewardId);
      saveRewards(updatedRewards);
      showToast('Reward deleted!', 'success');
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all rewards to defaults? This cannot be undone.')) {
      saveRewards(DEFAULT_TEACHER_REWARDS);
      showToast('Rewards reset to defaults!', 'success');
    }
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  const renderShopItems = () => {
    let items = [];
    
    switch (activeCategory) {
      case 'basic_avatars':
        items = SHOP_BASIC_AVATARS.map(item => ({ ...item, type: 'avatar' }));
        break;
      case 'premium_avatars':
        items = SHOP_PREMIUM_AVATARS.map(item => ({ ...item, type: 'avatar' }));
        break;
      case 'basic_pets':
        items = SHOP_BASIC_PETS.map(item => ({ ...item, type: 'pet' }));
        break;
      case 'premium_pets':
        items = SHOP_PREMIUM_PETS.map(item => ({ ...item, type: 'pet' }));
        break;
      case 'rewards':
        items = currentRewards.map(item => ({ ...item, type: 'reward' }));
        break;
      case 'featured':
        items = featuredItems;
        break;
      case 'mysterybox':
        return renderMysteryBox();
      default:
        return null;
    }

    if (items.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="text-4xl mb-4">🛒</div>
          <p className="text-gray-500">No items available in this category</p>
        </div>
      );
    }

    return items.map((item) => (
      <div
        key={item.id || item.name}
        className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-blue-400 transition-all hover:shadow-lg cursor-pointer"
        onClick={() => handlePurchaseClick(item, item.type)}
      >
        {/* MOBILE-RESPONSIVE Item Display */}
        <div className="flex flex-col items-center text-center">
          {item.type === 'reward' ? (
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3">
              {item.icon}
            </div>
          ) : (
            <img
              src={item.path}
              alt={item.name}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg mb-2 sm:mb-3 object-contain"
            />
          )}
          <h3 className="font-bold text-sm sm:text-base mb-1 line-clamp-2">{item.name}</h3>
          {item.originalPrice && (
            <div className="flex items-center gap-1 sm:gap-2 mb-1">
              <span className="text-xs sm:text-sm text-gray-500 line-through">💰{item.originalPrice}</span>
              <span className="bg-red-500 text-white px-1 sm:px-2 py-0.5 rounded text-xs font-bold">
                -{item.salePercentage}%
              </span>
            </div>
          )}
          <p className="text-base sm:text-lg md:text-xl font-bold text-yellow-600">💰 {item.price}</p>
        </div>
      </div>
    ));
  };

  const renderMysteryBox = () => {
    return (
      <div className="col-span-full">
        <div className="max-w-2xl mx-auto">
          {/* Mystery Box Card */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-6 sm:p-8 text-center shadow-xl">
            <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-3">Mystery Box</h2>
            <p className="text-base sm:text-lg text-purple-600 mb-6">
              Take a chance and discover amazing surprises! You could win avatars, pets, rewards, XP, or coins!
            </p>
            
            {/* Price Display */}
            <div className="bg-white rounded-xl p-4 mb-6 inline-block">
              <p className="text-3xl sm:text-4xl font-bold text-yellow-600">💰 {MYSTERY_BOX_PRICE} Coins</p>
            </div>

            {/* Possible Rewards Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">👤</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Avatars</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">🐾</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Pets</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">🎁</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Rewards</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">⭐</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">XP Boosts</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">💰</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Bonus Coins</p>
              </div>
              <div className="bg-white rounded-lg p-3 sm:p-4">
                <div className="text-2xl sm:text-3xl mb-2">✨</div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">Rare Items</p>
              </div>
            </div>

            {/* Rarity Info */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-sm sm:text-base">Prize Rarity</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm font-semibold">Common</span>
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs sm:text-sm font-semibold">Uncommon</span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs sm:text-sm font-semibold">Rare</span>
                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs sm:text-sm font-semibold">Epic</span>
                <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs sm:text-sm font-semibold">Legendary</span>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handleMysteryBoxPurchase}
              disabled={!selectedStudent}
              className={`text-lg sm:text-xl font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all ${
                selectedStudent
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedStudent ? '🎁 Open Mystery Box!' : '⚠️ Select a Student First'}
            </button>
            
            {selectedStudent && (
              <p className="mt-4 text-sm sm:text-base text-purple-600">
                {selectedStudent.firstName} has <span className="font-bold">💰 {calculateCoins(selectedStudent)} coins</span>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMysteryBoxModal = () => {
    if (mysteryBoxModal.stage === 'confirm') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Open Mystery Box?</h2>
            <p className="text-base sm:text-lg mb-2">Cost: <span className="font-bold text-yellow-600">💰 {MYSTERY_BOX_PRICE} coins</span></p>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              You'll receive a random prize from avatars, pets, rewards, XP, or coins!
            </p>
            <div className="flex gap-4">
              <button 
                onClick={closeMysteryBoxModal}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMysteryBoxPurchase}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 text-sm sm:text-base"
              >
                Open Box!
              </button>
            </div>
          </div>
        </div>
      );
    } else if (mysteryBoxModal.stage === 'opening') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8">
            <div className={`text-8xl mb-4 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Opening Mystery Box...</h2>
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      );
    } else if (mysteryBoxModal.stage === 'reveal' && mysteryBoxPrize) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-gradient-to-br ${getRarityBg(mysteryBoxPrize.rarity)} rounded-2xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8 border-4 ${getRarityColor(mysteryBoxPrize.rarity).split(' ')[1]}`}>
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">You Won!</h2>
            <div className={`inline-block px-4 py-1 rounded-full mb-4 ${getRarityColor(mysteryBoxPrize.rarity).split(' ')[0]} font-bold text-sm sm:text-base uppercase`}>
              {mysteryBoxPrize.rarity}
            </div>
            
            {/* Display the prize */}
            <div className="bg-white rounded-xl p-6 mb-6">
              {mysteryBoxPrize.type === 'xp' || mysteryBoxPrize.type === 'coins' ? (
                <div className="text-6xl mb-4">{mysteryBoxPrize.icon}</div>
              ) : mysteryBoxPrize.type === 'reward' ? (
                <div className="text-6xl mb-4">{mysteryBoxPrize.item.icon}</div>
              ) : (
                <img 
                  src={mysteryBoxPrize.item.path} 
                  alt={mysteryBoxPrize.displayName}
                  className="w-32 h-32 mx-auto mb-4 rounded-lg"
                />
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{mysteryBoxPrize.displayName}</h3>
            </div>

            <button 
              onClick={closeMysteryBoxModal}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 text-base sm:text-lg"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      );
    }
  };

  const renderSellModal = () => {
    const itemName = sellModal.type === 'pet' ? sellModal.item.name : 
                     sellModal.type === 'reward' ? sellModal.item.name : 
                     sellModal.item;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6 sm:p-8">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Sell Item?</h2>
          <p className="text-base sm:text-lg mb-2">
            Sell <span className="font-bold">{itemName}</span>?
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Original Price: <span className="font-semibold">💰 {sellModal.originalPrice}</span>
          </p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mb-6">
            You'll receive: 💰 {sellModal.price} coins
          </p>
          {sellModal.type === 'pet' && selectedStudent?.ownedPets?.[0]?.id === sellModal.item.id && (
            <p className="text-sm text-orange-600 mb-4">
              ⚠️ This is your active pet. Selling it will unequip it.
            </p>
          )}
          <div className="flex gap-4">
            <button 
              onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })}
              className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-100 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button 
              onClick={confirmSell}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 text-sm sm:text-base"
            >
              Sell Item
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
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold">Manage Class Rewards</h2>
            <button 
              onClick={() => {
                setShowRewardManager(false);
                setEditingReward(null);
              }}
              className="text-2xl font-bold hover:text-red-500"
            >
              ×
            </button>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {/* Add New Reward Button */}
            <button
              onClick={handleAddReward}
              className="w-full mb-4 sm:mb-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-base sm:text-lg hover:from-green-600 hover:to-blue-600 transition-all"
            >
              ➕ Add New Reward
            </button>

            {/* Editing Form */}
            {editingReward && (
              <div className="mb-6 p-4 sm:p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="text-lg sm:text-xl font-bold mb-4">
                  {currentRewards.find(r => r.id === editingReward.id) ? 'Edit Reward' : 'New Reward'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Reward Name</label>
                    <input
                      type="text"
                      value={editingReward.name}
                      onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm sm:text-base"
                      placeholder="Enter reward name..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Price (coins)</label>
                    <input
                      type="number"
                      value={editingReward.price}
                      onChange={(e) => setEditingReward({ ...editingReward, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm sm:text-base"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Icon</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {REWARD_ICONS.map(icon => (
                        <button
                          key={icon}
                          onClick={() => setEditingReward({ ...editingReward, icon })}
                          className={`text-2xl sm:text-3xl p-2 rounded-lg border-2 ${
                            editingReward.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingReward(null)}
                      className="flex-1 py-2 sm:py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveReward}
                      className="flex-1 py-2 sm:py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 text-sm sm:text-base"
                    >
                      Save Reward
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Current Rewards List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold">Current Rewards ({currentRewards.length})</h3>
                <button
                  onClick={handleResetToDefaults}
                  className="text-sm sm:text-base text-red-600 hover:text-red-700 font-semibold"
                >
                  Reset to Defaults
                </button>
              </div>

              {currentRewards.map(reward => (
                <div key={reward.id} className="bg-white border-2 border-gray-200 rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl">{reward.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm sm:text-base truncate">{reward.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600">💰 {reward.price} coins</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReward(reward)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600"
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

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* MOBILE-OPTIMIZED Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 sm:p-6 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">🛒 Champion Shop</h1>
        <p className="text-sm sm:text-base text-purple-100">Purchase awesome avatars, pets, and rewards!</p>
      </div>

      {/* MOBILE-OPTIMIZED Student Selector & Info */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
          <div className="w-full sm:w-auto">
            <label className="block text-sm font-semibold mb-2">Shopping for:</label>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const student = students.find(s => s.id === e.target.value);
                onSelectStudent(student);
              }}
              className="w-full sm:w-64 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 outline-none text-sm sm:text-base"
            >
              <option value="">Select a champion...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="bg-yellow-100 px-3 sm:px-4 py-2 rounded-lg">
                <span className="text-xs sm:text-sm text-gray-600">Balance:</span>
                <span className="ml-1 sm:ml-2 font-bold text-base sm:text-lg text-yellow-600">💰 {calculateCoins(selectedStudent)}</span>
              </div>
              <button
                onClick={() => setInventoryModal({ visible: true })}
                className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 text-sm sm:text-base"
              >
                👜 View Inventory
              </button>
              <button
                onClick={() => setShowSellMode(!showSellMode)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                  showSellMode 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {showSellMode ? '❌ Exit Sell Mode' : '💰 Sell Items'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE-RESPONSIVE Category Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'featured', label: '⭐ Daily Specials', color: 'from-red-500 to-orange-500' },
            { id: 'basic_avatars', label: '👤 Basic Avatars', color: 'from-blue-500 to-cyan-500' },
            { id: 'premium_avatars', label: '✨ Premium Avatars', color: 'from-purple-500 to-pink-500' },
            { id: 'basic_pets', label: '🐾 Basic Pets', color: 'from-green-500 to-emerald-500' },
            { id: 'premium_pets', label: '🌟 Premium Pets', color: 'from-yellow-500 to-amber-500' },
            { id: 'mysterybox', label: '🎁 Mystery Box', color: 'from-purple-500 to-pink-500' },
            { id: 'rewards', label: '🎁 Class Rewards', color: 'from-orange-500 to-red-500' },
          ].map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-shrink-0 px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Manage Rewards Button (shown only in rewards category) */}
        {activeCategory === 'rewards' && (
          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <button
              onClick={() => setShowRewardManager(true)}
              className="w-full py-2 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 text-sm sm:text-base"
            >
              ⚙️ Manage Rewards
            </button>
          </div>
        )}
      </div>

      {/* Shop Content */}
      {!selectedStudent ? (
        <div className="bg-white rounded-xl p-6 sm:p-12 text-center shadow-lg">
          <div className="text-5xl sm:text-6xl mb-4">🛒</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Select a Champion</h2>
          <p className="text-sm sm:text-base text-gray-600">Choose a student from the dropdown above to start shopping!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            {/* Special Header for Featured Section */}
            {activeCategory === 'featured' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg border-2 border-red-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⭐</div>
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