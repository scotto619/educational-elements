// components/tabs/ShopTab.js - MOBILE-OPTIMIZED SHOP WITH HALLOWEEN SECTION, MYSTERY BOX AND SELLING FEATURE
import React, { useMemo, useState } from 'react';
import { DEFAULT_TEACHER_REWARDS, buildShopInventory, getDailySpecials } from '../../utils/shopSpecials';

// ===============================================
// HALLOWEEN THEMED ITEMS - LIMITED TIME!
// ===============================================
const HALLOWEEN_BASIC_AVATARS = [
  { name: 'Demi', price: 15, path: '/shop/Themed/Halloween/Basic/Demi.png', theme: 'halloween' },
  { name: 'Jason', price: 18, path: '/shop/Themed/Halloween/Basic/Jason.png', theme: 'halloween' },
  { name: 'PumpkinKing', price: 20, path: '/shop/Themed/Halloween/Basic/PumpkinKing.png', theme: 'halloween' },
  { name: 'Skeleton', price: 15, path: '/shop/Themed/Halloween/Basic/Skeleton.png', theme: 'halloween' },
  { name: 'Witch', price: 18, path: '/shop/Themed/Halloween/Basic/Witch.png', theme: 'halloween' },
  { name: 'Zombie', price: 16, path: '/shop/Themed/Halloween/Basic/Zombie.png', theme: 'halloween' }
];

const HALLOWEEN_PREMIUM_AVATARS = [
  { name: 'Pumpkin', price: 35, path: '/shop/Themed/Halloween/Premium/Pumpkin.png', theme: 'halloween' },
  { name: 'Skeleton1', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton1.png', theme: 'halloween' },
  { name: 'Skeleton2', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton2.png', theme: 'halloween' },
  { name: 'Skeleton3', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton3.png', theme: 'halloween' },
  { name: 'Witch1', price: 42, path: '/shop/Themed/Halloween/Premium/Witch1.png', theme: 'halloween' },
  { name: 'Witch2', price: 42, path: '/shop/Themed/Halloween/Premium/Witch2.png', theme: 'halloween' },
  { name: 'Witch3', price: 42, path: '/shop/Themed/Halloween/Premium/Witch3.png', theme: 'halloween' },
  { name: 'Witch4', price: 42, path: '/shop/Themed/Halloween/Premium/Witch4.png', theme: 'halloween' },
  { name: 'Zombie1', price: 38, path: '/shop/Themed/Halloween/Premium/Zombie1.png', theme: 'halloween' }
];

const HALLOWEEN_PETS = [
  { name: 'Spooky Cat', price: 25, path: '/shop/Themed/Halloween/Pets/Pet.png', theme: 'halloween' },
  { name: 'Pumpkin Cat', price: 28, path: '/shop/Themed/Halloween/Pets/Pet2.png', theme: 'halloween' }
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

// Function to get all possible mystery box prizes - UPDATED TO INCLUDE HALLOWEEN
const getMysteryBoxPrizes = (SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  const prizes = [];
  
  // Add shop avatars INCLUDING HALLOWEEN
  [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS, ...HALLOWEEN_BASIC_AVATARS, ...HALLOWEEN_PREMIUM_AVATARS].forEach(avatar => {
    prizes.push({
      type: 'avatar',
      item: avatar,
      rarity: getItemRarity(avatar.price),
      name: avatar.name,
      displayName: avatar.name
    });
  });
  
  // Add shop pets INCLUDING HALLOWEEN
  [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS].forEach(pet => {
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
// SELLING SYSTEM - UPDATED TO INCLUDE HALLOWEEN
// ===============================================

// Calculate sell price (25% of original cost)
const calculateSellPrice = (originalPrice) => {
  return Math.max(1, Math.floor(originalPrice * 0.25));
};

// Find original item price from shop data - UPDATED TO INCLUDE HALLOWEEN
const findOriginalPrice = (itemName, itemType, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    const halloweenBasic = HALLOWEEN_BASIC_AVATARS.find(a => a.name === itemName);
    const halloweenPremium = HALLOWEEN_PREMIUM_AVATARS.find(a => a.name === itemName);
    return basicAvatar?.price || premiumAvatar?.price || halloweenBasic?.price || halloweenPremium?.price || 10;
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName);
    const halloweenPet = HALLOWEEN_PETS.find(p => p.name === itemName);
    return basicPet?.price || premiumPet?.price || halloweenPet?.price || 15;
  } else if (itemType === 'reward') {
    const reward = currentRewards.find(r => r.id === itemName || r.name === itemName);
    return reward?.price || 10;
  }
  return 10;
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
    saveRewards = () => {},
    dailySpecials = []
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('halloween'); // DEFAULT TO HALLOWEEN!
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });
  
  // Mystery Box states
  const [mysteryBoxModal, setMysteryBoxModal] = useState({ visible: false, stage: 'confirm' });
  const [mysteryBoxPrize, setMysteryBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Selling states
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

  const seasonalItems = useMemo(() => ([
    ...HALLOWEEN_BASIC_AVATARS.map(item => ({ ...item, category: 'halloween', type: 'avatar' })),
    ...HALLOWEEN_PREMIUM_AVATARS.map(item => ({ ...item, category: 'halloween', type: 'avatar' })),
    ...HALLOWEEN_PETS.map(item => ({ ...item, category: 'halloween', type: 'pet' }))
  ]), []);

  const featuredItems = useMemo(() => {
    if (dailySpecials.length > 0) {
      return dailySpecials;
    }

    const inventory = buildShopInventory({
      basicAvatars: SHOP_BASIC_AVATARS,
      premiumAvatars: SHOP_PREMIUM_AVATARS,
      basicPets: SHOP_BASIC_PETS,
      premiumPets: SHOP_PREMIUM_PETS,
      rewards: currentRewards,
      extraItems: seasonalItems
    });

    return getDailySpecials(inventory);
  }, [
    dailySpecials,
    SHOP_BASIC_AVATARS,
    SHOP_PREMIUM_AVATARS,
    SHOP_BASIC_PETS,
    SHOP_PREMIUM_PETS,
    currentRewards,
    seasonalItems
  ]);

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
      
      // Award the prize
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
    
    onUpdateStudent(student.id, updates);
    showToast(message, 'success');
  };
  
  const closeMysteryBoxModal = () => {
    setMysteryBoxModal({ visible: false, stage: 'confirm' });
    setMysteryBoxPrize(null);
    setIsSpinning(false);
  };

  // ===============================================
  // SELLING FUNCTIONS
  // ===============================================
  
  const handleSellItem = (item, type) => {
    if (!selectedStudent) return;

    if (type === 'reward') {
      showToast('Classroom rewards cannot be sold.', 'warning');
      return;
    }

    let itemName = '';
    let canSell = true;
    let reason = '';

    if (type === 'avatar') {
      itemName = item;
      if (selectedStudent.avatarBase === item) {
        canSell = false;
        reason = 'Cannot sell currently equipped avatar';
      }
      if (selectedStudent.ownedAvatars?.length <= 1) {
        canSell = false;
        reason = 'Cannot sell your last avatar';
      }
    } else if (type === 'pet') {
      itemName = item.name;
    } else if (type === 'reward') {
      itemName = item.name;
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
    
    if (sellModal.type === 'avatar') {
      updates.ownedAvatars = selectedStudent.ownedAvatars.filter(a => a !== sellModal.item);
    } else if (sellModal.type === 'pet') {
      updates.ownedPets = selectedStudent.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
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
    setSellModal({ visible: false, item: null, type: null, price: 0 });
    
    const itemDisplayName = sellModal.type === 'pet' ? sellModal.item.name : 
                           sellModal.type === 'avatar' ? sellModal.item :
                           sellModal.item.name;
    
    showToast(`${selectedStudent.firstName} sold ${itemDisplayName} for ${sellModal.price} coins!`, 'success');
  };

  // ===============================================
  // REWARD MANAGEMENT FUNCTIONS
  // ===============================================
  
  const handleAddReward = () => {
    if (!newReward.name.trim()) {
      showToast('Please enter a reward name', 'error');
      return;
    }

    const reward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newReward.name.trim(),
      price: Math.max(1, newReward.price),
      category: newReward.category,
      icon: newReward.icon
    };

    const updatedRewards = [...currentRewards, reward];
    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);

    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward added successfully!', 'success');
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward({ ...reward });
  };

  const handleUpdateReward = () => {
    if (!newReward.name.trim()) {
      showToast('Please enter a reward name', 'error');
      return;
    }

    const updatedRewards = currentRewards.map(reward =>
      reward.id === editingReward.id
        ? { ...reward, name: newReward.name.trim(), price: Math.max(1, newReward.price), category: newReward.category, icon: newReward.icon }
        : reward
    );

    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);

    setEditingReward(null);
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward updated successfully!', 'success');
  };

  const handleDeleteReward = (rewardId) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      const updatedRewards = currentRewards.filter(reward => reward.id !== rewardId);
      onUpdateRewards(updatedRewards);
      saveRewards(updatedRewards);
      showToast('Reward deleted successfully!', 'success');
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset to default rewards? This will replace all custom rewards.')) {
      onUpdateRewards(DEFAULT_TEACHER_REWARDS);
      saveRewards(DEFAULT_TEACHER_REWARDS);
      showToast('Rewards reset to defaults!', 'success');
    }
  };

  // ===============================================
  // PURCHASE LOGIC
  // ===============================================

  const handlePurchase = () => {
    if (!selectedStudent || !purchaseModal.item) return;

    const studentCoins = calculateCoins(selectedStudent);
    if (studentCoins < purchaseModal.item.price) {
      showToast(`${selectedStudent.firstName} needs ${purchaseModal.item.price - studentCoins} more coins!`, 'error');
      return;
    }

    let updates = {
      coinsSpent: (selectedStudent.coinsSpent || 0) + purchaseModal.item.price
    };

    switch (purchaseModal.type) {
      case 'avatar':
        updates.ownedAvatars = [...new Set([...(selectedStudent.ownedAvatars || []), purchaseModal.item.name])];
        showToast(`${selectedStudent.firstName} bought the ${purchaseModal.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...purchaseModal.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(selectedStudent.ownedPets || []), newPet];
        showToast(`${selectedStudent.firstName} adopted a ${purchaseModal.item.name}!`, 'success');
        break;
      case 'reward':
        updates.rewardsPurchased = [...(selectedStudent.rewardsPurchased || []), { 
          ...purchaseModal.item, 
          purchasedAt: new Date().toISOString() 
        }];
        showToast(`${selectedStudent.firstName} earned ${purchaseModal.item.name}!`, 'success');
        break;
      default: return;
    }

    onUpdateStudent(selectedStudent.id, updates);
    setPurchaseModal({ visible: false, item: null, type: null });
  };
  
  const handleEquip = (type, value) => {
    if (!selectedStudent) return;
    
    let updates = {};

    if (type === 'avatar') {
      updates.avatarBase = value;
      showToast('Avatar equipped!', 'success');
    } else if (type === 'pet') {
      const petToEquip = selectedStudent.ownedPets.find(p => p.id === value);
      const otherPets = selectedStudent.ownedPets.filter(p => p.id !== value);
      updates.ownedPets = [petToEquip, ...otherPets];
      showToast('Pet equipped!', 'success');
    }
    
    onUpdateStudent(selectedStudent.id, updates);
  };

  // UPDATED SHOP CATEGORIES TO INCLUDE HALLOWEEN FIRST
  const SHOP_CATEGORIES = [
      { id: 'halloween', name: '🎃 Halloween Special', shortName: '🎃 Halloween' },
      { id: 'featured', name: '⭐ Featured Items', shortName: 'Featured' },
      { id: 'mysterybox', name: '🎁 Mystery Box', shortName: 'Mystery' },
      { id: 'basic_avatars', name: 'Basic Avatars', shortName: 'Basic' },
      { id: 'premium_avatars', name: 'Premium Avatars', shortName: 'Premium' },
      { id: 'basic_pets', name: 'Basic Pets', shortName: 'Pets' },
      { id: 'premium_pets', name: 'Premium Pets', shortName: 'Pets+' },
      { id: 'rewards', name: 'Class Rewards', shortName: 'Rewards' }
  ];

  const renderFeaturedItems = () => {
    return featuredItems.map(item => {
      const isAvatar = item.type === 'avatar';
      const isPet = item.type === 'pet';
      const isReward = item.type === 'reward';
      const owned = isAvatar ? selectedStudent?.ownedAvatars?.includes(item.name) : 
                    isPet ? selectedStudent?.ownedPets?.some(p => p.name === item.name) : false;
      
      return (
        <div key={item.name || item.id} className={`border-2 rounded-lg p-3 sm:p-4 text-center flex flex-col justify-between relative ${owned ? 'border-green-400 bg-green-50' : 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'}`}>
          {/* Sale Badge */}
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg">
            -{item.salePercentage}%
          </div>
          
          {isReward ? (
              <>
                  <div className="text-3xl sm:text-4xl">{item.icon}</div>
                  <p className="font-semibold mt-1 sm:mt-2 text-xs sm:text-sm">{item.name}</p>
              </>
          ) : (
              <img src={item.path} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-full mx-auto mb-1 sm:mb-2"/>
          )}

          {!isReward && <p className="font-semibold text-xs sm:text-sm">{item.name}</p>}
          
          {/* Price Display */}
          <div className="mt-1 sm:mt-2">
            <div className="text-xs sm:text-sm text-gray-500 line-through">💰 {item.originalPrice}</div>
            <div className="text-sm sm:text-lg font-bold text-red-600">💰 {item.price}</div>
          </div>

          {owned ? (
              <p className="font-bold text-green-600 mt-1 sm:mt-2 text-xs sm:text-sm">Owned</p>
          ) : (
              <button 
                onClick={() => setPurchaseModal({ visible: true, item: item, type: item.type })} 
                disabled={calculateCoins(selectedStudent) < item.price} 
                className="mt-1 sm:mt-2 w-full bg-red-500 text-white text-xs sm:text-sm py-1 sm:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 font-semibold"
              >
                🔥 Buy Now!
              </button>
          )}
        </div>
      );
    });
  };

  const renderMysteryBox = () => {
    return (
      <div className="text-center max-w-xs sm:max-w-md mx-auto">
        <div className="border-4 border-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-4 sm:p-8 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
          <div className="text-6xl sm:text-8xl mb-3 sm:mb-4 animate-pulse">🎁</div>
          <h3 className="text-xl sm:text-2xl font-bold text-purple-800 mb-2">Mystery Box</h3>
          <p className="text-sm sm:text-base text-purple-600 mb-3 sm:mb-4">
            A magical box containing random prizes! You might get avatars, pets, rewards, XP, or coins!
          </p>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">Possible Rarities:</h4>
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-400 rounded-full"></span>
                <span>Common (50%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></span>
                <span>Uncommon (30%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></span>
                <span>Rare (15%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full"></span>
                <span>Epic (4%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></span>
                <span>Legendary (1%)</span>
              </div>
            </div>
          </div>
          
          <div className="text-xl sm:text-2xl font-bold text-purple-800 mb-3 sm:mb-4">💰 {MYSTERY_BOX_PRICE} Coins</div>
          
          <button
            onClick={handleMysteryBoxPurchase}
            disabled={!selectedStudent || calculateCoins(selectedStudent) < MYSTERY_BOX_PRICE}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-bold text-sm sm:text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all"
          >
            🎲 Open Mystery Box!
          </button>
        </div>
      </div>
    );
  };

  // UPDATED RENDER SHOP ITEMS TO INCLUDE HALLOWEEN SECTION
  const renderShopItems = () => {
      if (activeCategory === 'featured') {
        return renderFeaturedItems();
      }
      
      if (activeCategory === 'mysterybox') {
        return renderMysteryBox();
      }
      
      let items;
      let type;
      switch(activeCategory) {
          case 'halloween':
            // Combine all Halloween items
            items = [...HALLOWEEN_BASIC_AVATARS, ...HALLOWEEN_PREMIUM_AVATARS, ...HALLOWEEN_PETS];
            type = 'mixed';
            break;
          case 'basic_avatars': items = SHOP_BASIC_AVATARS; type = 'avatar'; break;
          case 'premium_avatars': items = SHOP_PREMIUM_AVATARS; type = 'avatar'; break;
          case 'basic_pets': items = SHOP_BASIC_PETS; type = 'pet'; break;
          case 'premium_pets': items = SHOP_PREMIUM_PETS; type = 'pet'; break;
          case 'rewards': items = currentRewards; type = 'reward'; break;
          default: items = [];
      }
      
      return items.map(item => {
          // Determine actual type for mixed Halloween items
          let actualType = type;
          if (type === 'mixed') {
            if (item.name.toLowerCase().includes('cat') || item.name.toLowerCase().includes('pet')) {
              actualType = 'pet';
            } else {
              actualType = 'avatar';
            }
          }
          
          const isAvatar = actualType === 'avatar';
          const isPet = actualType === 'pet';
          const isReward = actualType === 'reward';
          const owned = isAvatar ? selectedStudent?.ownedAvatars?.includes(item.name) : 
                        isPet ? selectedStudent?.ownedPets?.some(p => p.name === item.name) : false;
          
          return (
            <div key={item.name || item.id} className={`border-2 rounded-lg p-3 sm:p-4 text-center flex flex-col justify-between ${
              owned ? 'border-green-400 bg-green-50' : 
              activeCategory === 'halloween' ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-purple-50' :
              'border-gray-200'
            }`}>
                {isReward ? (
                    <>
                        <div className="text-3xl sm:text-4xl">{item.icon}</div>
                        <p className="font-semibold mt-1 sm:mt-2 text-xs sm:text-sm">{item.name}</p>
                    </>
                ) : (
                    <img src={item.path} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-full mx-auto mb-1 sm:mb-2"/>
                )}

                {!isReward && <p className="font-semibold text-xs sm:text-sm">{item.name}</p>}

                {owned ? (
                    <p className="font-bold text-green-600 mt-1 sm:mt-2 text-xs sm:text-sm">Owned</p>
                ) : (
                    <button 
                      onClick={() => setPurchaseModal({ visible: true, item: item, type: actualType })} 
                      disabled={calculateCoins(selectedStudent) < item.price} 
                      className="mt-1 sm:mt-2 w-full bg-blue-500 text-white text-xs sm:text-sm py-1 sm:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
                    >
                      💰 {item.price}
                    </button>
                )}
            </div>
          );
      });
  };

  // ===============================================
  // MOBILE-OPTIMIZED MYSTERY BOX MODAL
  // ===============================================
  const renderMysteryBoxModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center relative overflow-hidden">
        {mysteryBoxModal.stage === 'confirm' && (
          <div className="p-4 sm:p-6">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🎁</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Open Mystery Box?</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Cost: 💰 {MYSTERY_BOX_PRICE} coins<br/>
              You'll get a random surprise!
            </p>
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={() => setMysteryBoxModal({ visible: false, stage: 'confirm' })}
                className="flex-1 py-2 sm:py-3 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMysteryBoxPurchase}
                className="flex-1 py-2 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold text-sm sm:text-base"
              >
                Open Box! 🎲
              </button>
            </div>
          </div>
        )}
        
        {mysteryBoxModal.stage === 'opening' && (
          <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-400 to-pink-400 text-white">
            <div className={`text-6xl sm:text-8xl mb-3 sm:mb-4 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Opening Mystery Box...</h2>
            <div className="text-sm sm:text-lg">
              {isSpinning ? 'Finding your prize...' : 'Almost ready...'}
            </div>
            <div className="mt-3 sm:mt-4 flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
        
        {mysteryBoxModal.stage === 'reveal' && mysteryBoxPrize && (
          <div className={`p-6 sm:p-8 ${getRarityBg(mysteryBoxPrize.rarity)}`}>
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Congratulations!</h2>
            <div className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 border-2 ${getRarityColor(mysteryBoxPrize.rarity)}`}>
              {mysteryBoxPrize.rarity.toUpperCase()}
            </div>
            
            {mysteryBoxPrize.type === 'avatar' || mysteryBoxPrize.type === 'pet' ? (
              <img 
                src={mysteryBoxPrize.item.path} 
                className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full mx-auto mb-3 sm:mb-4 border-4 border-white shadow-lg" 
              />
            ) : (
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">{mysteryBoxPrize.icon}</div>
            )}
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
              {mysteryBoxPrize.displayName}
            </h3>
            
            <button 
              onClick={closeMysteryBoxModal}
              className="w-full bg-green-500 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-green-600 text-sm sm:text-base"
            >
              Awesome! 🎊
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ===============================================
  // SELL CONFIRMATION MODAL
  // ===============================================
  const renderSellModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-4 sm:p-6">
        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">💰</div>
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Sell Item?</h2>
        
        {sellModal.type === 'pet' && selectedStudent?.ownedPets?.[0]?.id === sellModal.item?.id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">⚠️ This is your active companion pet</p>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-sm sm:text-base mb-2">
            Sell {sellModal.type === 'pet' ? sellModal.item?.name : 
                 sellModal.type === 'avatar' ? sellModal.item :
                 sellModal.item?.name}
          </p>
          <div className="text-xs sm:text-sm text-gray-600 mb-1">
            Original price: 💰{sellModal.originalPrice}
          </div>
          <div className="text-lg sm:text-xl font-bold text-green-600">
            Sell for: 💰{sellModal.price} (25% value)
          </div>
        </div>
        
        <div className="flex gap-3 sm:gap-4">
          <button 
            onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })}
            className="flex-1 py-2 sm:py-3 border rounded-lg hover:bg-gray-50 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button 
            onClick={confirmSell}
            className="flex-1 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm sm:text-base"
          >
            Sell Item
          </button>
        </div>
      </div>
    </div>
  );

  // ===============================================
  // MOBILE-OPTIMIZED REWARD MANAGER MODAL
  // ===============================================
  const renderRewardManager = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold">🏆 Manage Class Rewards</h2>
          <button onClick={() => setShowRewardManager(false)} className="text-xl sm:text-2xl font-bold hover:text-red-600">×</button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Add/Edit Reward Form */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{editingReward ? 'Edit Reward' : 'Add New Reward'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1">Reward Name</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  placeholder="e.g., Extra Computer Time"
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1">Price (Coins)</label>
                <input
                  type="number"
                  min="1"
                  value={newReward.price}
                  onChange={(e) => setNewReward({ ...newReward, price: parseInt(e.target.value) || 1 })}
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1">Category</label>
                <select
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="privileges">Privileges</option>
                  <option value="technology">Technology</option>
                  <option value="fun">Fun</option>
                  <option value="special">Special</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-1">Icon</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">{newReward.icon}</span>
                  <select
                    value={newReward.icon}
                    onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-sm sm:text-base"
                  >
                    {REWARD_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {editingReward ? (
                <>
                  <button onClick={handleUpdateReward} className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 text-sm sm:text-base">
                    Update Reward
                  </button>
                  <button onClick={() => { setEditingReward(null); setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' }); }} className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={handleAddReward} className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base">
                  Add Reward
                </button>
              )}
            </div>
          </div>

          {/* Current Rewards List */}
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-bold">Current Rewards ({currentRewards.length})</h3>
              <button onClick={resetToDefaults} className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-orange-600">
                Reset to Defaults
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {currentRewards.map(reward => (
                <div key={reward.id} className="border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-2xl sm:text-3xl">{reward.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{reward.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">💰 {reward.price} coins</p>
                        <p className="text-xs text-gray-500 capitalize">{reward.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <button 
                        onClick={() => handleEditReward(reward)}
                        className="bg-yellow-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteReward(reward.id)}
                        className="bg-red-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE-OPTIMIZED Student Selector */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🛒 Select a Champion to Shop</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
          {students.map(student => (
            <button key={student.id} onClick={() => setSelectedStudentId(student.id)} className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${selectedStudentId === student.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <img src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} alt={student.firstName} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-1 sm:mb-2"/>
              <p className="text-xs sm:text-sm font-semibold truncate">{student.firstName}</p>
              <p className="text-xs text-yellow-600">💰 {calculateCoins(student)}</p>
            </button>
          ))}
        </div>
        {selectedStudent && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
                <img src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))} className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-white shadow-lg"/>
                <div className="text-center sm:text-left">
                    <h4 className="text-base sm:text-lg font-bold text-gray-800">{selectedStudent.firstName} is shopping</h4>
                    <p className="font-semibold text-yellow-700 text-sm sm:text-base">💰 {calculateCoins(selectedStudent)} coins available</p>
                </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setInventoryModal({ visible: true })} className="bg-purple-600 text-white font-semibold px-4 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-purple-700 shadow-md text-sm sm:text-base">View Inventory</button>
              <button 
                onClick={() => setShowSellMode(!showSellMode)} 
                className={`font-semibold px-3 sm:px-4 py-2 sm:py-3 rounded-lg shadow-md text-sm sm:text-base transition-all ${showSellMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {showSellMode ? '❌ Cancel Sell' : '💸 Sell Mode'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE-OPTIMIZED Shop Interface */}
      {selectedStudent && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
            {/* Sell Mode Banner */}
            {showSellMode && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg border-2 border-green-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">💸</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-green-800">Sell Mode Active!</h3>
                    <p className="text-sm sm:text-base text-green-600">Click "View Inventory" to sell items for 25% of their value</p>
                  </div>
                </div>
              </div>
            )}

            {/* MOBILE-FRIENDLY Category Tabs */}
            <div className="flex space-x-1 sm:space-x-2 border-b pb-3 sm:pb-4 mb-4 overflow-x-auto">
                {SHOP_CATEGORIES.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setActiveCategory(cat.id)} 
                      className={`px-2 sm:px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-xs sm:text-sm ${
                        activeCategory === cat.id 
                          ? cat.id === 'halloween'
                            ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                            : cat.id === 'featured' 
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
                
                {/* Manage Rewards Button */}
                {activeCategory === 'rewards' && (
                  <button 
                    onClick={() => setShowRewardManager(true)}
                    className="px-2 sm:px-4 py-2 rounded-lg font-semibold bg-green-500 text-white hover:bg-green-600 ml-2 sm:ml-4 text-xs sm:text-sm whitespace-nowrap"
                  >
                    🛠️ <span className="hidden sm:inline">Manage</span>
                  </button>
                )}
            </div>
            
            {/* SPECIAL HEADER FOR HALLOWEEN SECTION */}
            {activeCategory === 'halloween' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-100 via-purple-100 to-orange-100 rounded-lg border-2 border-orange-400">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl animate-bounce">🎃</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-orange-800">🎃 Halloween Special Collection! 🎃</h3>
                    <p className="text-sm sm:text-base text-purple-700 font-semibold">Limited time spooky avatars and pets - Get them before they're gone!</p>
                  </div>
                </div>
              </div>
            )}
            
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

      {/* Sell Confirmation Modal */}
      {sellModal.visible && renderSellModal()}

      {/* MOBILE-OPTIMIZED Inventory Modal */}
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
                                  <span className="text-xs sm:text-sm text-gray-500 font-semibold">
                                    Rewards can't be sold
                                  </span>
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