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

// Calculate sell price (25% of original cost)
const calculateSellPrice = (originalPrice) => {
  return Math.max(1, Math.floor(originalPrice * 0.25));
};

// Find original item price from shop data
const findOriginalPrice = (itemName, itemType, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    return basicAvatar?.price || premiumAvatar?.price || 10; // Default if not found
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName);
    return basicPet?.price || premiumPet?.price || 15; // Default if not found
  } else if (itemType === 'reward') {
    const reward = currentRewards.find(r => r.id === itemName || r.name === itemName);
    return reward?.price || 10; // Default if not found
  }
  return 10; // Fallback default
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

  // Generate featured items (3 random items on sale) - FIXED TO CHANGE DAILY
  useEffect(() => {
    const allShopItems = [
      ...SHOP_BASIC_AVATARS.map(item => ({ ...item, category: 'basic_avatars', type: 'avatar' })),
      ...SHOP_PREMIUM_AVATARS.map(item => ({ ...item, category: 'premium_avatars', type: 'avatar' })),
      ...SHOP_BASIC_PETS.map(item => ({ ...item, category: 'basic_pets', type: 'pet' })),
      ...SHOP_PREMIUM_PETS.map(item => ({ ...item, category: 'premium_pets', type: 'pet' })),
      ...currentRewards.map(item => ({ ...item, category: 'rewards', type: 'reward' }))
    ];

    if (allShopItems.length > 0) {
      // Create a proper daily seed using year, month, and day
      const now = new Date();
      const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
      
      // Seeded random function for consistent daily results
      const seededRandom = (s) => {
        const x = Math.sin(s) * 10000;
        return x - Math.floor(x);
      };
      
      // Shuffle array using seeded random
      const shuffled = [...allShopItems];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Take first 3 items and apply discount
      const featured = shuffled.slice(0, 3).map(item => ({
        ...item,
        originalPrice: item.price,
        price: Math.max(1, Math.floor(item.price * 0.7)), // 30% discount
        salePercentage: 30
      }));
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
    
    // Deduct coins
    const updatedStudent = {
      ...selectedStudent,
      coinsSpent: (selectedStudent.coinsSpent || 0) + MYSTERY_BOX_PRICE
    };
    
    // Move to opening stage
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // Determine prize
    const allPrizes = getMysteryBoxPrizes(SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    const prize = selectRandomPrize(allPrizes);
    
    // Wait for animation
    setTimeout(() => {
      setIsSpinning(false);
      setMysteryBoxPrize(prize);
      setMysteryBoxModal({ visible: true, stage: 'reveal' });
      
      // Award prize to student
      let finalStudent = { ...updatedStudent };
      
      if (prize.type === 'xp') {
        finalStudent.totalPoints = (finalStudent.totalPoints || 0) + prize.amount;
        showToast(`🎉 ${selectedStudent.firstName} won ${prize.amount} XP!`, 'success');
      } else if (prize.type === 'coins') {
        finalStudent.coinsEarned = (finalStudent.coinsEarned || 0) + prize.amount;
        showToast(`🎉 ${selectedStudent.firstName} won ${prize.amount} coins!`, 'success');
      } else if (prize.type === 'avatar') {
        if (!finalStudent.ownedAvatars) finalStudent.ownedAvatars = [];
        if (!finalStudent.ownedAvatars.includes(prize.item.name)) {
          finalStudent.ownedAvatars.push(prize.item.name);
          showToast(`🎉 ${selectedStudent.firstName} won the ${prize.name} avatar!`, 'success');
        } else {
          // Already owned - give coin refund
          const refund = Math.floor(prize.item.price * 0.5);
          finalStudent.coinsEarned = (finalStudent.coinsEarned || 0) + refund;
          showToast(`✨ Already owned! ${selectedStudent.firstName} received ${refund} coins instead!`, 'success');
        }
      } else if (prize.type === 'pet') {
        if (!finalStudent.ownedPets) finalStudent.ownedPets = [];
        const newPet = {
          id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: prize.item.name,
          image: prize.item.image,
          species: prize.item.species || prize.item.name,
          speed: prize.item.speed || 1.0,
          wins: 0,
          level: 1,
          dateObtained: new Date().toISOString()
        };
        finalStudent.ownedPets.push(newPet);
        showToast(`🎉 ${selectedStudent.firstName} won a ${prize.name} pet!`, 'success');
      } else if (prize.type === 'reward') {
        if (!finalStudent.rewardsPurchased) finalStudent.rewardsPurchased = [];
        finalStudent.rewardsPurchased.push({
          ...prize.item,
          purchasedAt: new Date().toISOString()
        });
        showToast(`🎉 ${selectedStudent.firstName} won ${prize.name}!`, 'success');
      }
      
      onUpdateStudent(finalStudent);
    }, 3000);
  };
  
  const closeMysteryBoxModal = () => {
    setMysteryBoxModal({ visible: false, stage: 'confirm' });
    setMysteryBoxPrize(null);
    setIsSpinning(false);
  };
  
  const renderMysteryBoxModal = () => {
    const { stage } = mysteryBoxModal;
    
    if (stage === 'confirm') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-4 sm:p-6">
            <div className="text-5xl sm:text-6xl mb-4">🎁</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Mystery Box</h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Take a chance and win amazing prizes!<br/>
              Cost: 💰{MYSTERY_BOX_PRICE} coins
            </p>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-4 text-xs sm:text-sm text-left">
              <p className="font-bold mb-2">Possible Prizes:</p>
              <ul className="space-y-1">
                <li>⭐ XP Boosts (3-100 XP)</li>
                <li>💰 Bonus Coins (2-60 coins)</li>
                <li>🎭 Exclusive Avatars</li>
                <li>🐾 Rare Pets</li>
                <li>🎁 Special Rewards</li>
              </ul>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={closeMysteryBoxModal} className="flex-1 py-2 sm:py-3 border rounded-lg text-sm sm:text-base">Cancel</button>
              <button onClick={confirmMysteryBoxPurchase} className="flex-1 py-2 sm:py-3 bg-purple-500 text-white rounded-lg text-sm sm:text-base font-bold">
                Open Box! 🎁
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (stage === 'opening') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-6 sm:p-8">
            <div className={`text-7xl sm:text-8xl mb-6 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Opening Mystery Box...</h2>
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      );
    }
    
    if (stage === 'reveal' && mysteryBoxPrize) {
      const rarityColor = getRarityColor(mysteryBoxPrize.rarity);
      const rarityBg = getRarityBg(mysteryBoxPrize.rarity);
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-4 sm:p-6">
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">You Won!</h2>
            
            <div className={`${rarityBg} border-2 ${rarityColor} rounded-xl p-4 sm:p-6 mb-4`}>
              {mysteryBoxPrize.type === 'avatar' && (
                <img 
                  src={getAvatarImage(mysteryBoxPrize.item.name, 1)} 
                  alt={mysteryBoxPrize.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-3"
                />
              )}
              {mysteryBoxPrize.type === 'pet' && (
                <img 
                  src={getPetImage({ image: mysteryBoxPrize.item.image })} 
                  alt={mysteryBoxPrize.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-3"
                />
              )}
              {(mysteryBoxPrize.type === 'xp' || mysteryBoxPrize.type === 'coins' || mysteryBoxPrize.type === 'reward') && (
                <div className="text-5xl sm:text-6xl mb-3">{mysteryBoxPrize.icon || '🎁'}</div>
              )}
              
              <h3 className="text-lg sm:text-xl font-bold mb-2">{mysteryBoxPrize.displayName}</h3>
              <p className={`text-xs sm:text-sm font-bold ${rarityColor} uppercase tracking-wide`}>
                {mysteryBoxPrize.rarity}
              </p>
            </div>
            
            <button 
              onClick={closeMysteryBoxModal}
              className="w-full py-2 sm:py-3 bg-green-500 text-white rounded-lg text-sm sm:text-base font-bold"
            >
              Awesome! ✨
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // ===============================================
  // SELLING FUNCTIONS
  // ===============================================
  
  const handleSellItem = (item, type) => {
    let itemName, originalPrice;
    
    if (type === 'avatar') {
      itemName = item; // Just the name string
      originalPrice = findOriginalPrice(item, 'avatar', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    } else if (type === 'pet') {
      itemName = item.name;
      originalPrice = findOriginalPrice(item.name, 'pet', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    } else if (type === 'reward') {
      itemName = item.name;
      originalPrice = findOriginalPrice(item.id, 'reward', SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    }
    
    const sellPrice = calculateSellPrice(originalPrice);
    
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
    
    // Give coins for selling
    updatedStudent.coinsEarned = (updatedStudent.coinsEarned || 0) + sellModal.price;
    
    // Remove item from inventory
    if (sellModal.type === 'avatar') {
      updatedStudent.ownedAvatars = updatedStudent.ownedAvatars.filter(a => a !== sellModal.item);
      // If selling equipped avatar, reset to first available
      if (updatedStudent.avatarBase === sellModal.item && updatedStudent.ownedAvatars.length > 0) {
        updatedStudent.avatarBase = updatedStudent.ownedAvatars[0];
      }
    } else if (sellModal.type === 'pet') {
      updatedStudent.ownedPets = updatedStudent.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
      updatedStudent.rewardsPurchased = updatedStudent.rewardsPurchased.filter(r => 
        r.id !== sellModal.item.id || r.purchasedAt !== sellModal.item.purchasedAt
      );
    }
    
    await onUpdateStudent(updatedStudent);
    showToast(`Sold for 💰${sellModal.price} coins!`, 'success');
    setSellModal({ visible: false, item: null, type: null, price: 0 });
  };
  
  const renderSellModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md text-center p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Confirm Sale</h2>
          <p className="mb-3 sm:mb-4 text-sm sm:text-base">
            Sell {sellModal.type === 'pet' ? sellModal.item.name : sellModal.type === 'reward' ? sellModal.item.name : sellModal.item} for 💰{sellModal.price} coins?
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mb-4">This action cannot be undone.</p>
          <div className="flex gap-3 sm:gap-4">
            <button 
              onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })} 
              className="flex-1 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
            >
              Cancel
            </button>
            <button 
              onClick={confirmSell} 
              className="flex-1 py-2 sm:py-3 bg-green-500 text-white rounded-lg text-sm sm:text-base"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // PURCHASE AND EQUIP FUNCTIONS
  // ===============================================

  const handlePurchaseClick = (item, type) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }

    const studentCoins = calculateCoins(selectedStudent);
    if (studentCoins < item.price) {
      showToast(`${selectedStudent.firstName} needs ${item.price - studentCoins} more coins!`, 'error');
      return;
    }

    setPurchaseModal({ visible: true, item, type });
  };

  const handlePurchase = async () => {
    if (!selectedStudent) return;

    const item = purchaseModal.item;
    const type = purchaseModal.type;

    let updatedStudent = { ...selectedStudent };
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + item.price;

    if (type === 'avatar') {
      if (!updatedStudent.ownedAvatars) updatedStudent.ownedAvatars = [];
      if (!updatedStudent.ownedAvatars.includes(item.name)) {
        updatedStudent.ownedAvatars.push(item.name);
        showToast(`${item.name} avatar purchased!`, 'success');
      } else {
        showToast(`${selectedStudent.firstName} already owns this avatar!`, 'error');
        setPurchaseModal({ visible: false, item: null, type: null });
        return;
      }
    } else if (type === 'pet') {
      if (!updatedStudent.ownedPets) updatedStudent.ownedPets = [];
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        image: item.image,
        species: item.species || item.name,
        speed: item.speed || 1.0,
        wins: 0,
        level: 1,
        dateObtained: new Date().toISOString()
      };
      updatedStudent.ownedPets.push(newPet);
      showToast(`${item.name} pet purchased!`, 'success');
    } else if (type === 'reward') {
      if (!updatedStudent.rewardsPurchased) updatedStudent.rewardsPurchased = [];
      updatedStudent.rewardsPurchased.push({
        ...item,
        purchasedAt: new Date().toISOString()
      });
      showToast(`${item.name} reward earned!`, 'success');
    }

    await onUpdateStudent(updatedStudent);
    setPurchaseModal({ visible: false, item: null, type: null });
  };

  const handleEquip = async (type, itemId) => {
    if (!selectedStudent) return;

    let updatedStudent = { ...selectedStudent };

    if (type === 'avatar') {
      updatedStudent.avatarBase = itemId;
      showToast(`Avatar equipped!`, 'success');
    } else if (type === 'pet') {
      const petIndex = updatedStudent.ownedPets.findIndex(p => p.id === itemId);
      if (petIndex > 0) {
        const [pet] = updatedStudent.ownedPets.splice(petIndex, 1);
        updatedStudent.ownedPets.unshift(pet);
        showToast(`Pet equipped!`, 'success');
      }
    }

    await onUpdateStudent(updatedStudent);
  };

  // ===============================================
  // REWARD MANAGEMENT FUNCTIONS
  // ===============================================
  
  const handleAddReward = () => {
    if (!newReward.name.trim()) {
      showToast('Please enter a reward name!', 'error');
      return;
    }
    
    const rewardToAdd = {
      id: `reward_${Date.now()}`,
      name: newReward.name,
      price: newReward.price,
      category: newReward.category,
      icon: newReward.icon
    };
    
    const updatedRewards = [...currentRewards, rewardToAdd];
    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);
    
    setNewReward({
      name: '',
      price: 10,
      category: 'privileges',
      icon: '🏆'
    });
    
    showToast('Reward added successfully!', 'success');
  };
  
  const handleEditReward = (reward) => {
    setEditingReward({ ...reward });
  };
  
  const handleSaveEdit = () => {
    if (!editingReward.name.trim()) {
      showToast('Please enter a reward name!', 'error');
      return;
    }
    
    const updatedRewards = currentRewards.map(r => 
      r.id === editingReward.id ? editingReward : r
    );
    
    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);
    setEditingReward(null);
    showToast('Reward updated successfully!', 'success');
  };
  
  const handleDeleteReward = (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      const updatedRewards = currentRewards.filter(r => r.id !== rewardId);
      onUpdateRewards(updatedRewards);
      saveRewards(updatedRewards);
      showToast('Reward deleted successfully!', 'success');
    }
  };
  
  const renderRewardManager = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="p-4 sm:p-6 border-b flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-bold">Manage Classroom Rewards</h2>
            <button 
              onClick={() => setShowRewardManager(false)} 
              className="text-xl sm:text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
            {/* Add New Reward Section */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <h3 className="text-base sm:text-lg font-bold mb-3">Add New Reward</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Reward name"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={newReward.price}
                  onChange={(e) => setNewReward({ ...newReward, price: parseInt(e.target.value) || 10 })}
                  className="px-3 py-2 border rounded-lg text-sm sm:text-base"
                />
                <select
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm sm:text-base"
                >
                  <option value="privileges">Privileges</option>
                  <option value="technology">Technology</option>
                  <option value="fun">Fun</option>
                  <option value="special">Special</option>
                </select>
                <select
                  value={newReward.icon}
                  onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                  className="px-3 py-2 border rounded-lg text-sm sm:text-base"
                >
                  {REWARD_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon} {icon}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleAddReward}
                className="w-full mt-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 text-sm sm:text-base"
              >
                ✅ Add Reward
              </button>
            </div>
            
            {/* Existing Rewards List */}
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3">Current Rewards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentRewards.map(reward => (
                  <div key={reward.id} className="bg-white border-2 border-gray-200 rounded-lg p-3">
                    {editingReward?.id === reward.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingReward.name}
                          onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingReward.price}
                            onChange={(e) => setEditingReward({ ...editingReward, price: parseInt(e.target.value) || 10 })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                          <select
                            value={editingReward.icon}
                            onChange={(e) => setEditingReward({ ...editingReward, icon: e.target.value })}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          >
                            {REWARD_ICONS.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEdit}
                            className="flex-1 py-1 bg-green-500 text-white rounded text-xs font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingReward(null)}
                            className="flex-1 py-1 bg-gray-300 rounded text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl sm:text-2xl">{reward.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base truncate">{reward.name}</p>
                            <p className="text-xs text-gray-600">💰{reward.price} coins</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReward(reward)}
                            className="flex-1 py-1 bg-blue-500 text-white rounded text-xs font-semibold"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReward(reward.id)}
                            className="flex-1 py-1 bg-red-500 text-white rounded text-xs font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // RENDER SHOP ITEMS
  // ===============================================
  
  const renderShopItems = () => {
    let itemsToRender = [];

    if (activeCategory === 'featured') {
      itemsToRender = featuredItems;
    } else if (activeCategory === 'mysterybox') {
      return (
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-purple-300 rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎁</div>
            <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-2">Mystery Box</h3>
            <p className="text-xs sm:text-sm text-purple-600 mb-3 sm:mb-4">
              Win random prizes! Avatars, pets, coins, XP, and more!
            </p>
            
            {/* Rarity Preview */}
            <div className="bg-white bg-opacity-50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-left">
              <p className="font-bold text-xs sm:text-sm mb-1 sm:mb-2 text-purple-800">Prize Rarities:</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>Common (50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Uncommon (30%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Rare (15%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Epic (4%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Legendary (1%)</span>
                </div>
              </div>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-purple-800 mb-3 sm:mb-4">
              💰{MYSTERY_BOX_PRICE}
            </div>
            
            <button
              onClick={handleMysteryBoxPurchase}
              disabled={!selectedStudent || calculateCoins(selectedStudent) < MYSTERY_BOX_PRICE}
              className={`w-full py-2 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all ${
                selectedStudent && calculateCoins(selectedStudent) >= MYSTERY_BOX_PRICE
                  ? 'bg-purple-500 text-white hover:bg-purple-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {selectedStudent ? 'Open Mystery Box! 🎁' : 'Select a student first'}
            </button>
            
            {selectedStudent && calculateCoins(selectedStudent) < MYSTERY_BOX_PRICE && (
              <p className="text-xs text-red-600 mt-2">
                Need {MYSTERY_BOX_PRICE - calculateCoins(selectedStudent)} more coins!
              </p>
            )}
          </div>
        </div>
      );
    } else if (activeCategory === 'basic_avatars') {
      itemsToRender = SHOP_BASIC_AVATARS.map(item => ({ ...item, type: 'avatar' }));
    } else if (activeCategory === 'premium_avatars') {
      itemsToRender = SHOP_PREMIUM_AVATARS.map(item => ({ ...item, type: 'avatar' }));
    } else if (activeCategory === 'basic_pets') {
      itemsToRender = SHOP_BASIC_PETS.map(item => ({ ...item, type: 'pet' }));
    } else if (activeCategory === 'premium_pets') {
      itemsToRender = SHOP_PREMIUM_PETS.map(item => ({ ...item, type: 'pet' }));
    } else if (activeCategory === 'rewards') {
      itemsToRender = currentRewards.map(item => ({ ...item, type: 'reward' }));
    }

    return itemsToRender.map((item, index) => {
      const isOwned = selectedStudent && (
        (item.type === 'avatar' && selectedStudent.ownedAvatars?.includes(item.name)) ||
        (item.type === 'pet' && selectedStudent.ownedPets?.some(p => p.name === item.name))
      );

      return (
        <div key={`${item.name}-${index}`} className={`bg-white border-2 rounded-2xl p-3 sm:p-4 text-center shadow-md hover:shadow-lg transition-shadow ${
          item.originalPrice ? 'border-red-300 bg-red-50' : 'border-gray-200'
        } ${isOwned ? 'opacity-60' : ''}`}>
          {item.originalPrice && (
            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
              {item.salePercentage}% OFF
            </div>
          )}
          
          {item.type === 'avatar' && (
            <img src={getAvatarImage(item.name, 1)} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 border-2 border-gray-300" />
          )}
          {item.type === 'pet' && (
            <img src={getPetImage({ image: item.image })} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 border-2 border-gray-300" />
          )}
          {item.type === 'reward' && (
            <div className="text-3xl sm:text-4xl mb-2">{item.icon || '🎁'}</div>
          )}
          
          <h3 className="font-bold text-xs sm:text-sm mb-1 truncate">{item.name}</h3>
          
          {item.originalPrice && (
            <p className="text-xs sm:text-sm text-gray-500 line-through mb-1">💰{item.originalPrice}</p>
          )}
          
          <p className="text-base sm:text-lg font-bold text-purple-600 mb-2">💰{item.price}</p>
          
          {isOwned && (
            <p className="text-xs text-green-600 font-semibold mb-2">✓ Owned</p>
          )}
          
          <button
            onClick={() => handlePurchaseClick(item, item.type)}
            disabled={!selectedStudent || isOwned}
            className={`w-full py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm ${
              selectedStudent && !isOwned
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOwned ? 'Owned' : selectedStudent ? 'Buy' : 'Select Student'}
          </button>
        </div>
      );
    });
  };

  // ===============================================
  // MAIN RENDER
  // ===============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 text-purple-800">🏪 Champion Shop</h1>

        {/* Student Selector and Action Buttons - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={selectedStudentId || ''}
              onChange={(e) => setSelectedStudentId(e.target.value || null)}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-base"
            >
              <option value="">Select a Student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} (💰{calculateCoins(student)})
                </option>
              ))}
            </select>
            
            {selectedStudent && (
              <>
                <button
                  onClick={() => setInventoryModal({ visible: true })}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 text-sm sm:text-base whitespace-nowrap"
                >
                  🎒 Inventory
                </button>
                <button
                  onClick={() => setShowSellMode(!showSellMode)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base whitespace-nowrap ${
                    showSellMode 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {showSellMode ? '❌ Cancel Sell' : '💰 Sell Items'}
                </button>
              </>
            )}
          </div>
          
          {selectedStudent && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-50 rounded-lg">
              <p className="text-xs sm:text-sm text-center">
                <span className="font-semibold">{selectedStudent.firstName}'s Balance:</span> 
                <span className="text-base sm:text-lg font-bold text-purple-600 ml-2">💰{calculateCoins(selectedStudent)} coins</span>
              </p>
            </div>
          )}
        </div>

        {/* Category Navigation - Mobile Responsive */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2 justify-center mb-4 sm:mb-6">
            {[
              { id: 'featured', name: '⭐ Daily Specials', shortName: '⭐ Daily' },
              { id: 'mysterybox', name: '🎁 Mystery Box', shortName: '🎁 Box' },
              { id: 'basic_avatars', name: '🎭 Basic Avatars', shortName: '🎭 Basic' },
              { id: 'premium_avatars', name: '👑 Premium Avatars', shortName: '👑 Premium' },
              { id: 'basic_pets', name: '🐾 Basic Pets', shortName: '🐾 Basic' },
              { id: 'premium_pets', name: '✨ Premium Pets', shortName: '✨ Premium' },
              { id: 'rewards', name: '🎁 Classroom Rewards', shortName: '🎁 Rewards' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm whitespace-nowrap ${
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
    </div>
  );

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