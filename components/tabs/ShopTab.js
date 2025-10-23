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

// Calculate sell price (50% of original purchase price)
const calculateSellPrice = (item, type, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards) => {
  let originalPrice = 0;
  
  if (type === 'avatar') {
    const shopAvatar = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS].find(a => a.name === item);
    originalPrice = shopAvatar?.price || 10;
  } else if (type === 'pet') {
    const shopPet = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].find(p => p.name === item.name);
    originalPrice = shopPet?.price || 10;
  } else if (type === 'reward') {
    const reward = currentRewards.find(r => r.id === item.id);
    originalPrice = reward?.price || 5;
  }
  
  return Math.floor(originalPrice * 0.5);
};

// ===============================================
// MAIN COMPONENT
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
      // FIXED: Create proper daily seed that changes each day
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      // Create a unique seed for each day using year, month, and day
      const dailySeed = year * 10000 + month * 100 + day;
      
      // Seeded random function using the daily seed
      const seededRandom = (seed) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };
      
      // Shuffle array using seeded random
      const shuffled = [...allShopItems].sort((a, b) => {
        const aHash = (a.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const bHash = (b.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return seededRandom(dailySeed + aHash) - seededRandom(dailySeed + bHash);
      });
      
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
    
    // Get all possible prizes
    const allPrizes = getMysteryBoxPrizes(SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    
    // Deduct coins
    const updatedStudent = {
      ...selectedStudent,
      coinsSpent: (selectedStudent.coinsSpent || 0) + MYSTERY_BOX_PRICE
    };
    
    // Show opening animation
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // Wait 2 seconds then reveal prize
    setTimeout(() => {
      const prize = selectRandomPrize(allPrizes);
      setMysteryBoxPrize(prize);
      setIsSpinning(false);
      setMysteryBoxModal({ visible: true, stage: 'reveal' });
      
      // Award the prize
      awardMysteryPrize(updatedStudent, prize);
    }, 2000);
  };
  
  const awardMysteryPrize = async (student, prize) => {
    let updatedStudent = { ...student };
    
    if (prize.type === 'avatar') {
      if (!updatedStudent.ownedAvatars.includes(prize.item.name)) {
        updatedStudent.ownedAvatars = [...updatedStudent.ownedAvatars, prize.item.name];
      }
    } else if (prize.type === 'pet') {
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: prize.item.name,
        image: prize.item.path,
        species: prize.item.name,
        speed: 1.0,
        wins: 0,
        level: 1,
        type: 'mystery_box',
        dateObtained: new Date().toISOString()
      };
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
    } else if (prize.type === 'reward') {
      updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), {
        ...prize.item,
        purchasedAt: new Date().toISOString()
      }];
    } else if (prize.type === 'xp') {
      updatedStudent.totalPoints = (updatedStudent.totalPoints || 0) + prize.amount;
    } else if (prize.type === 'coins') {
      updatedStudent.coinsEarned = (updatedStudent.coinsEarned || 0) + prize.amount;
    }
    
    await onUpdateStudent(updatedStudent);
  };
  
  const closeMysteryBoxModal = () => {
    setMysteryBoxModal({ visible: false, stage: 'confirm' });
    setMysteryBoxPrize(null);
    setIsSpinning(false);
  };

  // ===============================================
  // SELLING FUNCTIONS - NEW FEATURE
  // ===============================================
  
  const handleSellItem = (item, type) => {
    const sellPrice = calculateSellPrice(item, type, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, currentRewards);
    setSellModal({ 
      visible: true, 
      item, 
      type, 
      price: sellPrice 
    });
  };
  
  const confirmSell = async () => {
    if (!selectedStudent || !sellModal.item) return;
    
    let updatedStudent = { ...selectedStudent };
    const { item, type, price } = sellModal;
    
    if (type === 'avatar') {
      // Don't allow selling currently equipped avatar
      if (updatedStudent.avatarBase === item) {
        showToast('Cannot sell equipped avatar!', 'error');
        setSellModal({ visible: false, item: null, type: null, price: 0 });
        return;
      }
      updatedStudent.ownedAvatars = updatedStudent.ownedAvatars.filter(a => a !== item);
    } else if (type === 'pet') {
      // Don't allow selling first pet (equipped pet)
      if (updatedStudent.ownedPets[0]?.id === item.id) {
        showToast('Cannot sell equipped pet!', 'error');
        setSellModal({ visible: false, item: null, type: null, price: 0 });
        return;
      }
      updatedStudent.ownedPets = updatedStudent.ownedPets.filter(p => p.id !== item.id);
    } else if (type === 'reward') {
      updatedStudent.rewardsPurchased = updatedStudent.rewardsPurchased.filter(r => 
        !(r.id === item.id && r.purchasedAt === item.purchasedAt)
      );
    }
    
    // Add coins from sale
    updatedStudent.coinsEarned = (updatedStudent.coinsEarned || 0) + price;
    
    await onUpdateStudent(updatedStudent);
    showToast(`Sold for ${price} coins!`, 'success');
    setSellModal({ visible: false, item: null, type: null, price: 0 });
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
      id: `reward_${Date.now()}`,
      ...newReward,
      name: newReward.name.trim()
    };
    
    const updatedRewards = [...currentRewards, reward];
    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);
    
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward added successfully!', 'success');
  };
  
  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward({
      name: reward.name,
      price: reward.price,
      category: reward.category,
      icon: reward.icon
    });
  };
  
  const handleUpdateReward = () => {
    if (!newReward.name.trim() || !editingReward) {
      showToast('Please enter a reward name', 'error');
      return;
    }
    
    const updatedRewards = currentRewards.map(r => 
      r.id === editingReward.id 
        ? { ...r, ...newReward, name: newReward.name.trim() }
        : r
    );
    
    onUpdateRewards(updatedRewards);
    saveRewards(updatedRewards);
    
    setEditingReward(null);
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
    showToast('Reward updated successfully!', 'success');
  };
  
  const handleDeleteReward = (rewardId) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      const updatedRewards = currentRewards.filter(r => r.id !== rewardId);
      onUpdateRewards(updatedRewards);
      saveRewards(updatedRewards);
      showToast('Reward deleted successfully!', 'success');
    }
  };
  
  const cancelEdit = () => {
    setEditingReward(null);
    setNewReward({ name: '', price: 10, category: 'privileges', icon: '🏆' });
  };

  // ===============================================
  // PURCHASE FUNCTIONS
  // ===============================================
  
  const handlePurchase = async () => {
    if (!selectedStudent || !purchaseModal.item) return;

    const studentCoins = calculateCoins(selectedStudent);
    const itemPrice = purchaseModal.item.price;

    if (studentCoins < itemPrice) {
      showToast(`${selectedStudent.firstName} needs ${itemPrice - studentCoins} more coins!`, 'error');
      setPurchaseModal({ visible: false, item: null, type: null });
      return;
    }

    let updatedStudent = { ...selectedStudent };
    updatedStudent.coinsSpent = (updatedStudent.coinsSpent || 0) + itemPrice;

    // Handle different purchase types
    if (purchaseModal.type === 'avatar') {
      const avatarName = purchaseModal.item.name;
      if (!updatedStudent.ownedAvatars.includes(avatarName)) {
        updatedStudent.ownedAvatars = [...updatedStudent.ownedAvatars, avatarName];
        showToast(`${avatarName} avatar purchased!`, 'success');
      } else {
        showToast('Already owned!', 'error');
        setPurchaseModal({ visible: false, item: null, type: null });
        return;
      }
    } else if (purchaseModal.type === 'pet') {
      const newPet = {
        id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: purchaseModal.item.name,
        image: purchaseModal.item.path,
        species: purchaseModal.item.name,
        speed: 1.0,
        wins: 0,
        level: 1,
        type: 'purchased',
        dateObtained: new Date().toISOString()
      };
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      showToast(`${purchaseModal.item.name} pet purchased!`, 'success');
    } else if (purchaseModal.type === 'reward') {
      updatedStudent.rewardsPurchased = [...(updatedStudent.rewardsPurchased || []), {
        ...purchaseModal.item,
        purchasedAt: new Date().toISOString()
      }];
      showToast(`${purchaseModal.item.name} reward purchased!`, 'success');
    }

    await onUpdateStudent(updatedStudent);
    setPurchaseModal({ visible: false, item: null, type: null });
  };

  const handleEquip = async (type, itemIdentifier) => {
    if (!selectedStudent) return;

    let updatedStudent = { ...selectedStudent };

    if (type === 'avatar') {
      updatedStudent.avatarBase = itemIdentifier;
      showToast(`Equipped ${itemIdentifier} avatar!`, 'success');
    } else if (type === 'pet') {
      const petIndex = updatedStudent.ownedPets.findIndex(p => p.id === itemIdentifier);
      if (petIndex > 0) {
        const newPets = [...updatedStudent.ownedPets];
        const [equippedPet] = newPets.splice(petIndex, 1);
        newPets.unshift(equippedPet);
        updatedStudent.ownedPets = newPets;
        showToast(`Equipped ${equippedPet.name} pet!`, 'success');
      }
    }

    await onUpdateStudent(updatedStudent);
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  const renderShopItems = () => {
    let items = [];
    
    if (activeCategory === 'featured') {
      items = featuredItems;
    } else if (activeCategory === 'avatars_basic') {
      items = SHOP_BASIC_AVATARS.map(item => ({ ...item, type: 'avatar' }));
    } else if (activeCategory === 'avatars_premium') {
      items = SHOP_PREMIUM_AVATARS.map(item => ({ ...item, type: 'avatar' }));
    } else if (activeCategory === 'pets_basic') {
      items = SHOP_BASIC_PETS.map(item => ({ ...item, type: 'pet' }));
    } else if (activeCategory === 'pets_premium') {
      items = SHOP_PREMIUM_PETS.map(item => ({ ...item, type: 'pet' }));
    } else if (activeCategory === 'rewards') {
      items = currentRewards.map(item => ({ ...item, type: 'reward' }));
    } else if (activeCategory === 'mysterybox') {
      return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-4 border-purple-300 rounded-2xl p-4 sm:p-8 text-center max-w-2xl mx-auto">
          <div className="text-6xl sm:text-8xl mb-4">🎁</div>
          <h3 className="text-2xl sm:text-3xl font-bold text-purple-800 mb-3">Mystery Box</h3>
          <p className="text-base sm:text-lg text-gray-700 mb-4">
            Take a chance and win amazing prizes!<br/>
            <span className="text-sm text-gray-600">Items, Pets, Avatars, XP, or Bonus Coins!</span>
          </p>
          <div className="bg-white rounded-xl p-4 mb-4 border-2 border-purple-200">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">💰 {MYSTERY_BOX_PRICE} Coins</p>
          </div>
          {!selectedStudent && (
            <p className="text-red-600 mb-4 text-sm sm:text-base">Select a student first!</p>
          )}
          <button 
            onClick={handleMysteryBoxPurchase}
            disabled={!selectedStudent || calculateCoins(selectedStudent) < MYSTERY_BOX_PRICE}
            className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition-all ${
              selectedStudent && calculateCoins(selectedStudent) >= MYSTERY_BOX_PRICE
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Open Mystery Box! 🎁
          </button>
          {selectedStudent && (
            <p className="mt-4 text-sm text-gray-600">
              {selectedStudent.firstName} has 💰 {calculateCoins(selectedStudent)} coins
            </p>
          )}
        </div>
      );
    }

    if (items.length === 0) {
      return <p className="text-center text-gray-500 py-8 text-sm sm:text-base">No items available</p>;
    }

    return items.map((item, index) => {
      const isOwned = selectedStudent && (
        (item.type === 'avatar' && selectedStudent.ownedAvatars?.includes(item.name)) ||
        (item.type === 'pet' && selectedStudent.ownedPets?.some(p => p.name === item.name))
      );

      return (
        <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all relative">
          {item.originalPrice && (
            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-red-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold z-10">
              -{item.salePercentage}%
            </div>
          )}
          {item.type === 'reward' ? (
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">{item.icon || '🎁'}</div>
          ) : (
            <img 
              src={item.type === 'avatar' ? item.path : item.path} 
              alt={item.name} 
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-full object-cover"
            />
          )}
          <h4 className="font-bold text-xs sm:text-sm mb-1 truncate">{item.name}</h4>
          {item.originalPrice && (
            <p className="text-xs sm:text-sm text-gray-500 line-through">💰{item.originalPrice}</p>
          )}
          <p className="text-base sm:text-lg font-bold text-green-600 mb-2">💰{item.price}</p>
          {isOwned && <p className="text-xs text-blue-600 mb-2">✓ Owned</p>}
          <button 
            onClick={() => setPurchaseModal({ visible: true, item, type: item.type })}
            disabled={!selectedStudent || isOwned}
            className={`w-full py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm ${
              isOwned ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
              !selectedStudent ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
              'bg-gradient-to-r from-green-400 to-blue-500 text-white hover:scale-105'
            }`}
          >
            {isOwned ? 'Owned' : 'Buy'}
          </button>
        </div>
      );
    });
  };

  const renderMysteryBoxModal = () => {
    const { stage } = mysteryBoxModal;
    
    if (stage === 'confirm') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h2 className="text-2xl font-bold mb-4">Open Mystery Box?</h2>
            <p className="text-lg mb-6">
              Spend <span className="font-bold text-purple-600">💰 {MYSTERY_BOX_PRICE} coins</span> for a chance to win amazing prizes!
            </p>
            <div className="flex gap-4">
              <button 
                onClick={closeMysteryBoxModal}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMysteryBoxPurchase}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:scale-105"
              >
                Open Box!
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (stage === 'opening') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className={`text-8xl mb-4 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-2xl font-bold mb-2">Opening...</h2>
            <p className="text-gray-600">Revealing your prize!</p>
          </div>
        </div>
      );
    }
    
    if (stage === 'reveal' && mysteryBoxPrize) {
      const { rarity, type, displayName, icon, item, amount } = mysteryBoxPrize;
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border-4 ${getRarityColor(rarity).split(' ')[1]}`}>
            <div className={`inline-block px-4 py-2 rounded-full ${getRarityBg(rarity)} mb-4`}>
              <span className={`font-bold uppercase text-sm ${getRarityColor(rarity).split(' ')[0]}`}>
                {rarity}
              </span>
            </div>
            
            {type === 'xp' || type === 'coins' ? (
              <div className="text-8xl mb-4">{icon}</div>
            ) : type === 'reward' ? (
              <div className="text-8xl mb-4">{item.icon || '🎁'}</div>
            ) : (
              <img 
                src={item.path} 
                alt={displayName}
                className="w-32 h-32 mx-auto mb-4 rounded-full object-cover"
              />
            )}
            
            <h2 className="text-3xl font-bold mb-2">🎉 You Won! 🎉</h2>
            <p className="text-xl font-semibold mb-6">{displayName}</p>
            
            <button 
              onClick={closeMysteryBoxModal}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:scale-105"
            >
              Awesome!
            </button>
          </div>
        </div>
      );
    }
  };

  const renderSellModal = () => {
    const { item, type, price } = sellModal;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Sell Item?</h2>
          
          {type === 'avatar' && (
            <img 
              src={getAvatarImage(item, 1)}
              alt={item}
              className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
            />
          )}
          {type === 'pet' && (
            <img 
              src={getPetImage(item)}
              alt={item.name}
              className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
            />
          )}
          {type === 'reward' && (
            <div className="text-6xl mb-4">{item.icon || '🎁'}</div>
          )}
          
          <p className="text-lg mb-2">
            Sell <span className="font-bold">{type === 'avatar' ? item : type === 'pet' ? item.name : item.name}</span>?
          </p>
          <p className="text-2xl font-bold text-green-600 mb-6">
            You'll receive 💰 {price} coins
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={confirmSell}
              className="flex-1 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
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
            <button 
              onClick={() => {
                setShowRewardManager(false);
                cancelEdit();
              }}
              className="text-2xl font-bold hover:text-red-600"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            {/* Add/Edit Form */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-lg mb-4">
                {editingReward ? 'Edit Reward' : 'Add New Reward'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Reward Name</label>
                  <input 
                    type="text"
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                    placeholder="e.g., Extra Recess"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Price (Coins)</label>
                  <input 
                    type="number"
                    value={newReward.price}
                    onChange={(e) => setNewReward({ ...newReward, price: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Category</label>
                  <select 
                    value={newReward.category}
                    onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
                    className="w-full p-2 border-2 border-gray-300 rounded-lg"
                  >
                    <option value="privileges">Privileges</option>
                    <option value="fun">Fun</option>
                    <option value="technology">Technology</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Icon</label>
                  <div className="flex gap-2">
                    <div className="text-3xl border-2 border-gray-300 rounded-lg p-2">
                      {newReward.icon}
                    </div>
                    <select 
                      value={newReward.icon}
                      onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                      className="flex-1 p-2 border-2 border-gray-300 rounded-lg"
                    >
                      {REWARD_ICONS.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {editingReward && (
                  <button 
                    onClick={cancelEdit}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  onClick={editingReward ? handleUpdateReward : handleAddReward}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                >
                  {editingReward ? 'Update Reward' : 'Add Reward'}
                </button>
              </div>
            </div>
            
            {/* Current Rewards List */}
            <div>
              <h3 className="font-bold text-lg mb-4">Current Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentRewards.map(reward => (
                  <div key={reward.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-3xl">{reward.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{reward.name}</p>
                        <p className="text-sm text-gray-600">💰 {reward.price} coins</p>
                        <p className="text-xs text-gray-500 capitalize">{reward.category}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleEditReward(reward)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteReward(reward.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
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
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* MOBILE-OPTIMIZED Header */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Champions Shop
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Purchase avatars, pets, and rewards with coins!</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {selectedStudent && (
              <>
                <button 
                  onClick={() => setInventoryModal({ visible: true })}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold text-sm sm:text-base hover:scale-105 transition-transform"
                >
                  📦 {selectedStudent.firstName}'s Inventory
                </button>
                <button 
                  onClick={() => setShowSellMode(!showSellMode)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-all ${
                    showSellMode 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  💰 {showSellMode ? 'Exit Sell Mode' : 'Sell Items'}
                </button>
              </>
            )}
            <button 
              onClick={() => setShowRewardManager(true)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold text-sm sm:text-base hover:scale-105 transition-transform"
            >
              ⚙️ Manage Rewards
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED Student Selector */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Select a Student</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`p-2 sm:p-3 rounded-xl border-2 transition-all ${
                selectedStudentId === student.id 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <img 
                src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                alt={student.firstName}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-1 sm:mb-2"
              />
              <p className="font-semibold text-xs sm:text-sm truncate">{student.firstName}</p>
              <p className="text-xs text-green-600">💰 {calculateCoins(student)}</p>
            </button>
          ))}
        </div>
        {selectedStudent && (
          <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-base sm:text-lg font-semibold text-center">
              {selectedStudent.firstName} has <span className="text-green-600 font-bold">💰 {calculateCoins(selectedStudent)} coins</span>
            </p>
          </div>
        )}
      </div>

      {/* MOBILE-OPTIMIZED Shop Categories */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory('featured')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'featured' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⭐ Featured Sales
          </button>
          <button 
            onClick={() => setActiveCategory('mysterybox')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'mysterybox' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎁 Mystery Box
          </button>
          <button 
            onClick={() => setActiveCategory('avatars_basic')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'avatars_basic' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👤 Basic Avatars
          </button>
          <button 
            onClick={() => setActiveCategory('avatars_premium')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'avatars_premium' 
                ? 'bg-purple-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✨ Premium Avatars
          </button>
          <button 
            onClick={() => setActiveCategory('pets_basic')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'pets_basic' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🐾 Basic Pets
          </button>
          <button 
            onClick={() => setActiveCategory('pets_premium')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'pets_premium' 
                ? 'bg-pink-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💎 Premium Pets
          </button>
          <button 
            onClick={() => setActiveCategory('rewards')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap transition-all ${
              activeCategory === 'rewards' 
                ? 'bg-yellow-500 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎁 Class Rewards
          </button>
        </div>

        {/* Shop Items Display */}
        {!selectedStudent && activeCategory !== 'mysterybox' ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-lg sm:text-xl text-gray-500">Please select a student to shop!</p>
          </div>
        ) : (
          <div>
            {/* Special Header for Featured Items */}
            {activeCategory === 'featured' && featuredItems.length > 0 && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">⭐</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-orange-800">Daily Special Deals!</h3>
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
    </div>
  );
};

export default ShopTab;