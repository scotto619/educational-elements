// components/student/StudentShop.js - UPDATED WITH MYSTERY BOX AND SELLING FEATURES
import React, { useState } from 'react';

// ===============================================
// MYSTERY BOX SYSTEM (SHARED WITH TEACHER SHOP)
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
const getMysteryBoxPrizes = (SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, classRewards) => {
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
  (classRewards || []).forEach(reward => {
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
// NEW: SELLING SYSTEM
// ===============================================

// Calculate sell price (25% of original cost)
const calculateSellPrice = (originalPrice) => {
  return Math.max(1, Math.floor(originalPrice * 0.25));
};

// Find original item price from shop data
const findOriginalPrice = (itemName, itemType, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, classRewards) => {
  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    return basicAvatar?.price || premiumAvatar?.price || 10; // Default if not found
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName);
    return basicPet?.price || premiumPet?.price || 15; // Default if not found
  } else if (itemType === 'reward') {
    const reward = (classRewards || []).find(r => r.id === itemName || r.name === itemName);
    return reward?.price || 10; // Default if not found
  }
  return 10; // Fallback default
};

const StudentShop = ({ 
  studentData,
  updateStudentData,
  showToast,
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  classRewards
}) => {
  const [activeCategory, setActiveCategory] = useState('mysterybox'); // Start with Mystery Box
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });

  // Mystery Box states
  const [mysteryBoxModal, setMysteryBoxModal] = useState({ visible: false, stage: 'confirm' }); // confirm, opening, reveal
  const [mysteryBoxPrize, setMysteryBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // NEW: Selling states
  const [sellModal, setSellModal] = useState({ visible: false, item: null, type: null, price: 0 });
  const [showSellMode, setShowSellMode] = useState(false);

  const currentCoins = calculateCoins(studentData);

  // ===============================================
  // MYSTERY BOX FUNCTIONS
  // ===============================================
  
  const handleMysteryBoxPurchase = () => {
    if (currentCoins < MYSTERY_BOX_PRICE) {
      showToast(`You need ${MYSTERY_BOX_PRICE - currentCoins} more coins for a Mystery Box!`, 'error');
      return;
    }
    
    setMysteryBoxModal({ visible: true, stage: 'confirm' });
  };
  
  const confirmMysteryBoxPurchase = async () => {
    // Deduct coins first
    const updatedData = { 
      coinsSpent: (studentData.coinsSpent || 0) + MYSTERY_BOX_PRICE 
    };
    
    const success = await updateStudentData(updatedData);
    if (!success) {
      showToast('Failed to purchase Mystery Box. Please try again.', 'error');
      return;
    }
    
    // Start the opening sequence
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // Get all possible prizes
    const allPrizes = getMysteryBoxPrizes(
      SHOP_BASIC_AVATARS, 
      SHOP_PREMIUM_AVATARS, 
      SHOP_BASIC_PETS, 
      SHOP_PREMIUM_PETS, 
      classRewards
    );
    
    // Select random prize
    const selectedPrize = selectRandomPrize(allPrizes);
    setMysteryBoxPrize(selectedPrize);
    
    // Spinning animation (3 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setMysteryBoxModal({ visible: true, stage: 'reveal' });
      
      // Award the prize
      awardMysteryBoxPrize(selectedPrize);
    }, 3000);
  };
  
  const awardMysteryBoxPrize = async (prize) => {
    let updates = {};
    let message = '';
    
    switch (prize.type) {
      case 'avatar':
        if (!studentData.ownedAvatars?.includes(prize.item.name)) {
          updates.ownedAvatars = [...new Set([...(studentData.ownedAvatars || []), prize.item.name])];
          message = `You won the ${prize.item.name} avatar!`;
        } else {
          // Already owned, give coins instead
          updates.currency = (studentData.currency || 0) + 5;
          message = `You already had the ${prize.item.name} avatar, so got 5 bonus coins instead!`;
        }
        break;
        
      case 'pet':
        const newPet = { ...prize.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        message = `You won a ${prize.item.name}!`;
        break;
        
      case 'reward':
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), { 
          ...prize.item, 
          purchasedAt: new Date().toISOString() 
        }];
        message = `You won ${prize.item.name}!`;
        break;
        
      case 'xp':
        updates.totalPoints = (studentData.totalPoints || 0) + prize.amount;
        message = `You won ${prize.amount} bonus XP!`;
        break;
        
      case 'coins':
        updates.currency = (studentData.currency || 0) + prize.amount;
        message = `You won ${prize.amount} bonus coins!`;
        break;
    }
    
    const success = await updateStudentData(updates);
    if (success) {
      showToast(message, 'success');
    } else {
      showToast('There was an issue awarding your prize. Please contact your teacher.', 'error');
    }
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
    let itemName = '';
    let canSell = true;
    let reason = '';
    
    if (type === 'avatar') {
      itemName = item;
      // Check if this is the currently equipped avatar
      if (studentData.avatarBase === item) {
        canSell = false;
        reason = 'Cannot sell currently equipped avatar';
      }
      // Check if this is the only avatar owned
      if (studentData.ownedAvatars?.length <= 1) {
        canSell = false;
        reason = 'Cannot sell your last avatar';
      }
    } else if (type === 'pet') {
      itemName = item.name;
      // Check if this is the active pet (first in list) - allow but show warning
    } else if (type === 'reward') {
      itemName = item.name;
      // Rewards can always be sold
    }
    
    if (!canSell) {
      showToast(reason, 'error');
      return;
    }
    
    const originalPrice = findOriginalPrice(itemName, type, SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS, classRewards);
    const sellPrice = calculateSellPrice(originalPrice);
    
    setSellModal({ 
      visible: true, 
      item: item, 
      type: type, 
      price: sellPrice,
      originalPrice: originalPrice 
    });
  };
  
  const confirmSell = async () => {
    if (!sellModal.item) return;
    
    let updates = {
      currency: (studentData.currency || 0) + sellModal.price
    };
    
    // Remove the item from inventory
    if (sellModal.type === 'avatar') {
      updates.ownedAvatars = studentData.ownedAvatars.filter(a => a !== sellModal.item);
    } else if (sellModal.type === 'pet') {
      updates.ownedPets = studentData.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
      // For rewards, find by name and remove first match
      const rewardIndex = studentData.rewardsPurchased?.findIndex(r => 
        r.name === sellModal.item.name && r.purchasedAt === sellModal.item.purchasedAt
      );
      if (rewardIndex >= 0) {
        updates.rewardsPurchased = [
          ...studentData.rewardsPurchased.slice(0, rewardIndex),
          ...studentData.rewardsPurchased.slice(rewardIndex + 1)
        ];
      }
    }
    
    const success = await updateStudentData(updates);
    if (success) {
      setSellModal({ visible: false, item: null, type: null, price: 0 });
      
      const itemDisplayName = sellModal.type === 'pet' ? sellModal.item.name : 
                             sellModal.type === 'avatar' ? sellModal.item :
                             sellModal.item.name;
      
      showToast(`You sold ${itemDisplayName} for ${sellModal.price} coins!`, 'success');
    } else {
      showToast('Failed to sell item. Please try again.', 'error');
    }
  };

  // ===============================================
  // PURCHASE LOGIC
  // ===============================================

  const handlePurchase = async () => {
    if (!purchaseModal.item) return;

    if (currentCoins < purchaseModal.item.price) {
      showToast(`You need ${purchaseModal.item.price - currentCoins} more coins!`, 'error');
      return;
    }

    let updates = {
      coinsSpent: (studentData.coinsSpent || 0) + purchaseModal.item.price
    };

    switch (purchaseModal.type) {
      case 'avatar':
        updates.ownedAvatars = [...new Set([...(studentData.ownedAvatars || []), purchaseModal.item.name])];
        showToast(`You bought the ${purchaseModal.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...purchaseModal.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        showToast(`You adopted a ${purchaseModal.item.name}!`, 'success');
        break;
      case 'reward':
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), { 
          ...purchaseModal.item, 
          purchasedAt: new Date().toISOString() 
        }];
        showToast(`You earned ${purchaseModal.item.name}!`, 'success');
        break;
    }

    const success = await updateStudentData(updates);
    if (success) {
      setPurchaseModal({ visible: false, item: null, type: null });
    } else {
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  const handleEquip = async (type, value) => {
    let updates = {};
    
    if (type === 'avatar') {
      updates.avatarBase = value;
      showToast('Avatar equipped!', 'success');
    } else if (type === 'pet') {
      const petToEquip = studentData.ownedPets.find(p => p.id === value);
      const otherPets = studentData.ownedPets.filter(p => p.id !== value);
      updates.ownedPets = [petToEquip, ...otherPets];
      showToast('Pet equipped!', 'success');
    }
    
    await updateStudentData(updates);
  };

  const categories = [
    { id: 'mysterybox', name: '🎁 Mystery Box', shortName: 'Mystery' },
    { id: 'basic_avatars', name: 'Basic Avatars', shortName: 'Basic' },
    { id: 'premium_avatars', name: 'Premium Avatars', shortName: 'Premium' },
    { id: 'basic_pets', name: 'Basic Pets', shortName: 'Pets' },
    { id: 'premium_pets', name: 'Premium Pets', shortName: 'Rare Pets' },
    { id: 'rewards', name: 'Class Rewards', shortName: 'Rewards' }
  ];

  const renderMysteryBox = () => {
    return (
      <div className="text-center max-w-lg mx-auto">
        <div className="border-4 border-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-6 md:p-8 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
          <div className="text-6xl md:text-8xl mb-4 animate-pulse">🎁</div>
          <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-2">Mystery Box</h3>
          <p className="text-purple-600 mb-4 text-sm md:text-base">
            A magical box containing random prizes! You might get avatars, pets, rewards, XP, or coins!
          </p>
          
          <div className="bg-white rounded-lg p-3 md:p-4 mb-4 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-2 text-sm md:text-base">Possible Rarities:</h4>
            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded-full"></span>
                <span>Common (50%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></span>
                <span>Uncommon (30%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"></span>
                <span>Rare (15%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full"></span>
                <span>Epic (4%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></span>
                <span>Legendary (1%)</span>
              </div>
            </div>
          </div>
          
          <div className="text-xl md:text-2xl font-bold text-purple-800 mb-4">💰 {MYSTERY_BOX_PRICE} Coins</div>
          
          <button
            onClick={handleMysteryBoxPurchase}
            disabled={currentCoins < MYSTERY_BOX_PRICE}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-bold text-base md:text-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 transition-all active:scale-95"
          >
            🎲 Open Mystery Box!
          </button>
          
          {currentCoins < MYSTERY_BOX_PRICE && (
            <p className="text-red-600 text-xs md:text-sm mt-2 font-semibold">
              You need {MYSTERY_BOX_PRICE - currentCoins} more coins!
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderShopItems = () => {
    if (activeCategory === 'mysterybox') {
      return renderMysteryBox();
    }

    let items, type;
    switch(activeCategory) {
      case 'basic_avatars': items = SHOP_BASIC_AVATARS; type = 'avatar'; break;
      case 'premium_avatars': items = SHOP_PREMIUM_AVATARS; type = 'avatar'; break;
      case 'basic_pets': items = SHOP_BASIC_PETS; type = 'pet'; break;
      case 'premium_pets': items = SHOP_PREMIUM_PETS; type = 'pet'; break;
      case 'rewards': items = classRewards || []; type = 'reward'; break;
      default: items = [];
    }

    if (!items || items.length === 0) {
      return (
        <div className="col-span-full text-center py-6 md:py-8">
          <div className="text-3xl md:text-4xl mb-2">📦</div>
          <p className="text-gray-500 text-sm md:text-base">No items available in this category yet.</p>
        </div>
      );
    }

    return items.map(item => {
      const isAvatar = type === 'avatar';
      const isPet = type === 'pet';
      const isReward = type === 'reward';
      const owned = isAvatar ? studentData?.ownedAvatars?.includes(item.name) : 
                    isPet ? studentData?.ownedPets?.some(p => p.name === item.name) : false;
      
      return (
        <div key={item.name || item.id} className={`border-2 rounded-lg p-3 md:p-4 text-center ${owned ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
          {isReward ? (
            <div className="text-3xl md:text-4xl mb-2">{item.icon || '🎁'}</div>
          ) : (
            <img 
              src={item.path} 
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-full mx-auto mb-2"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
          )}
          
          <p className="font-semibold mt-2 text-sm md:text-base">{item.name}</p>
          
          {owned ? (
            <p className="font-bold text-green-600 mt-2 text-sm">Owned ✓</p>
          ) : (
            <button 
              onClick={() => setPurchaseModal({ visible: true, item: item, type: type })} 
              disabled={currentCoins < item.price} 
              className="mt-2 w-full bg-blue-500 text-white text-xs md:text-sm py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-95 transition-all"
            >
              💰 {item.price} coins
            </button>
          )}
        </div>
      );
    });
  };

  // ===============================================
  // MYSTERY BOX MODAL
  // ===============================================
  const renderMysteryBoxModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden">
        {mysteryBoxModal.stage === 'confirm' && (
          <div className="p-6">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-2xl font-bold mb-4">Open Mystery Box?</h2>
            <p className="text-gray-600 mb-6">
              Cost: 💰 {MYSTERY_BOX_PRICE} coins<br/>
              You'll get a random surprise!
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setMysteryBoxModal({ visible: false, stage: 'confirm' })}
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMysteryBoxPurchase}
                className="flex-1 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold"
              >
                Open Box! 🎲
              </button>
            </div>
          </div>
        )}
        
        {mysteryBoxModal.stage === 'opening' && (
          <div className="p-8 bg-gradient-to-br from-purple-400 to-pink-400 text-white">
            <div className={`text-8xl mb-4 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-2xl font-bold mb-2">Opening Mystery Box...</h2>
            <div className="text-lg">
              {isSpinning ? 'Finding your prize...' : 'Almost ready...'}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
        
        {mysteryBoxModal.stage === 'reveal' && mysteryBoxPrize && (
          <div className={`p-8 ${getRarityBg(mysteryBoxPrize.rarity)}`}>
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 border-2 ${getRarityColor(mysteryBoxPrize.rarity)}`}>
              {mysteryBoxPrize.rarity.toUpperCase()}
            </div>
            
            {mysteryBoxPrize.type === 'avatar' || mysteryBoxPrize.type === 'pet' ? (
              <img 
                src={mysteryBoxPrize.item.path} 
                className="w-24 h-24 object-contain rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                onError={(e) => {
                  e.target.src = mysteryBoxPrize.type === 'avatar' ? '/shop/Basic/Banana.png' : '/shop/BasicPets/Wizard.png';
                }}
              />
            ) : (
              <div className="text-6xl mb-4">{mysteryBoxPrize.icon}</div>
            )}
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {mysteryBoxPrize.displayName}
            </h3>
            
            <button 
              onClick={closeMysteryBoxModal}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600"
            >
              Awesome! 🎊
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ===============================================
  // NEW: SELL CONFIRMATION MODAL
  // ===============================================
  const renderSellModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6">
        <div className="text-5xl mb-4">💰</div>
        <h2 className="text-2xl font-bold mb-4">Sell Item?</h2>
        
        {sellModal.type === 'pet' && studentData?.ownedPets?.[0]?.id === sellModal.item?.id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">⚠️ This is your active companion pet</p>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-base mb-2">
            Sell {sellModal.type === 'pet' ? sellModal.item?.name : 
                 sellModal.type === 'avatar' ? sellModal.item :
                 sellModal.item?.name}
          </p>
          <div className="text-sm text-gray-600 mb-1">
            Original price: 💰{sellModal.originalPrice}
          </div>
          <div className="text-xl font-bold text-green-600">
            Sell for: 💰{sellModal.price} (25% value)
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })}
            className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={confirmSell}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
          >
            Sell Item
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Student Info Header - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <img 
              src={getAvatarImage(studentData.avatarBase, calculateAvatarLevel(studentData.totalPoints))} 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-blue-300 shadow-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 truncate">{studentData.firstName}'s Shop</h2>
              <p className="text-base md:text-lg font-semibold text-yellow-600">💰 {currentCoins} coins available</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setInventoryModal({ visible: true })}
              className="bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 text-sm md:text-base flex-shrink-0"
            >
              Inventory
            </button>
            <button 
              onClick={() => setShowSellMode(!showSellMode)} 
              className={`font-semibold px-3 md:px-4 py-2 rounded-lg text-sm md:text-base flex-shrink-0 transition-all ${
                showSellMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {showSellMode ? '❌' : '💸'}
            </button>
          </div>
        </div>
        
        {/* NEW: Sell Mode Banner */}
        {showSellMode && (
          <div className="mt-4 p-3 md:p-4 bg-gradient-to-r from-green-100 to-yellow-100 rounded-lg border-2 border-green-300">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">💸</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-green-800">Sell Mode Active!</h3>
                <p className="text-sm md:text-base text-green-600">Open your inventory to sell items for 25% of their value</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shop Categories - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex space-x-1 md:space-x-2 border-b pb-3 md:pb-4 mb-4 md:mb-6 overflow-x-auto">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className={`px-2 md:px-4 py-2 rounded-lg font-semibold whitespace-nowrap text-xs md:text-sm ${
                activeCategory === cat.id 
                  ? cat.id === 'mysterybox'
                    ? 'bg-purple-500 text-white' 
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="md:hidden">{cat.shortName}</span>
              <span className="hidden md:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Special Header for Mystery Box Section */}
        {activeCategory === 'mysterybox' && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">🎁</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-purple-800">Mystery Box Adventure!</h3>
                <p className="text-purple-600 text-sm md:text-base">Take a chance and discover amazing surprises!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`grid gap-3 md:gap-4 ${
          activeCategory === 'mysterybox'
            ? 'grid-cols-1'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {renderShopItems()}
        </div>
      </div>

      {/* Purchase Modal - Mobile Optimized */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Confirm Purchase</h2>
            <p className="mb-4 text-sm md:text-base">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} 
                className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                className="flex-1 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base"
              >
                Buy Now!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mystery Box Modal */}
      {mysteryBoxModal.visible && renderMysteryBoxModal()}

      {/* NEW: Sell Confirmation Modal */}
      {sellModal.visible && renderSellModal()}

      {/* Inventory Modal - Mobile Optimized - UPDATED WITH SELLING FEATURE */}
      {inventoryModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-bold">My Inventory</h2>
              <div className="flex items-center gap-2">
                {showSellMode && (
                  <span className="text-xs md:text-sm bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                    Sell Mode
                  </span>
                )}
                <button 
                  onClick={() => setInventoryModal({ visible: false })} 
                  className="text-2xl font-bold hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
              {/* Owned Avatars */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Avatars</h3>
                {studentData.ownedAvatars && studentData.ownedAvatars.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                    {studentData.ownedAvatars.map(avatarName => (
                      <div key={avatarName} className={`border-2 rounded-lg p-2 md:p-3 text-center ${studentData.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <img 
                          src={getAvatarImage(avatarName, calculateAvatarLevel(studentData.totalPoints))} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
                          onError={(e) => {
                            e.target.src = '/shop/Basic/Banana.png';
                          }}
                        />
                        <p className="text-xs font-semibold truncate">{avatarName}</p>
                        {studentData.avatarBase === avatarName ? (
                          <p className="text-xs text-blue-600 font-bold">Equipped</p>
                        ) : showSellMode ? (
                          <button 
                            onClick={() => handleSellItem(avatarName, 'avatar')} 
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1 hover:bg-red-600 active:scale-95"
                          >
                            Sell
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleEquip('avatar', avatarName)} 
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1 hover:bg-blue-600 active:scale-95"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No avatars owned yet. Visit the shop to buy some!</p>
                )}
              </div>

              {/* Owned Pets */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Pets</h3>
                {studentData.ownedPets?.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                    {studentData.ownedPets.map((pet, index) => (
                      <div key={pet.id} className={`border-2 rounded-lg p-2 md:p-3 text-center ${index === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        <img 
                          src={getPetImage(pet)} 
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
                          onError={(e) => {
                            e.target.src = '/shop/BasicPets/Wizard.png';
                          }}
                        />
                        <p className="text-xs font-semibold truncate">{pet.name}</p>
                        {index === 0 ? (
                          <p className="text-xs text-purple-600 font-bold">Active</p>
                        ) : showSellMode ? (
                          <button 
                            onClick={() => handleSellItem(pet, 'pet')} 
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded mt-1 hover:bg-red-600 active:scale-95"
                          >
                            Sell
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleEquip('pet', pet.id)} 
                            className="text-xs bg-purple-500 text-white px-2 py-1 rounded mt-1 hover:bg-purple-600 active:scale-95"
                          >
                            Equip
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No pets yet! Get 50 XP to unlock your first pet.</p>
                )}
              </div>

              {/* Purchased Rewards */}
              {studentData.rewardsPurchased?.length > 0 && (
                <div>
                  <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {studentData.rewardsPurchased.map((reward, index) => (
                      <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-xl md:text-2xl">{reward.icon || '🎁'}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm md:text-base">{reward.name}</p>
                            <p className="text-xs text-gray-600">Earned: {new Date(reward.purchasedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {showSellMode && (
                          <button 
                            onClick={() => handleSellItem(reward, 'reward')} 
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex-shrink-0 active:scale-95"
                          >
                            Sell
                          </button>
                        )}
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

export default StudentShop;