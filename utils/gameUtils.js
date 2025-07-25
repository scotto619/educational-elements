// utils/gameUtils.js - ENHANCED with Complete Shop System Functions

import { 
  GAME_CONFIG, 
  PET_SPECIES, 
  PET_NAMES, 
  AVAILABLE_AVATARS,
  BASIC_PETS,
  EXISTING_PETS,
  PREMIUM_PETS,
  PREMIUM_BASIC_AVATARS,
  THEMED_AVATARS,
  SOUND_FILES
} from '../constants/gameData';

// ===============================================
// CONSTANTS FOR GAME CALCULATIONS
// ===============================================

const { MAX_LEVEL, COINS_PER_XP, RACE_DISTANCE, PET_UNLOCK_XP, XP_THRESHOLDS } = GAME_CONFIG;

// ===============================================
// STUDENT DATA UTILITIES
// ===============================================

export const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    currency: student.currency || 0,
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null,
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : []),
    ownedPets: student.ownedPets || [],
    rewardsPurchased: student.rewardsPurchased || [],
    questsCompleted: student.questsCompleted || [],
    behaviorPoints: student.behaviorPoints || {
      respectful: 0,
      responsible: 0,
      safe: 0,
      learner: 0
    },
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

export const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

export const canAfford = (student, cost) => {
  const availableCoins = calculateCoins(student);
  return availableCoins >= cost;
};

// ===============================================
// GRID LAYOUT UTILITIES - FOR STUDENTSTAB
// ===============================================

export const calculateOptimalGrid = (studentCount) => {
  if (studentCount <= 4) return { cols: 2, lgCols: 4, gap: 'gap-4' };
  if (studentCount <= 8) return { cols: 2, lgCols: 4, gap: 'gap-3' };
  if (studentCount <= 12) return { cols: 3, lgCols: 6, gap: 'gap-3' };
  if (studentCount <= 20) return { cols: 4, lgCols: 8, gap: 'gap-2' };
  return { cols: 5, lgCols: 10, gap: 'gap-1' };
};

export const getGridClasses = (studentCount) => {
  const config = calculateOptimalGrid(studentCount);
  return `grid grid-cols-${config.cols} lg:grid-cols-${config.lgCols} ${config.gap}`;
};

// ===============================================
// PET SYSTEM UTILITIES
// ===============================================

export const getRandomPet = () => {
  return PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
};

export const getRandomPetName = () => {
  return PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
};

export const calculatePetSpeed = (pet) => {
  const baseSpeed = pet?.speed || 1.0;
  const bonusSpeed = (pet?.wins || 0) * 0.1;
  const randomFactor = 0.8 + (Math.random() * 0.4);
  return Math.max(0.5, baseSpeed + bonusSpeed) * randomFactor;
};

export const createNewPet = (petSpecies = null, customName = null) => {
  const species = petSpecies || getRandomPet();
  const name = customName || getRandomPetName();
  
  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    image: species.image,
    species: species.name,
    speed: species.speed || 1.0,
    wins: 0,
    level: 1,
    type: 'earned',
    dateObtained: new Date().toISOString()
  };
};

export const shouldReceivePet = (student) => {
  const hasReachedXP = (student?.totalPoints || 0) >= PET_UNLOCK_XP;
  const hasNoPets = !student?.ownedPets || student.ownedPets.length === 0;
  return hasReachedXP && hasNoPets;
};

// ===============================================
// AVATAR SYSTEM UTILITIES
// ===============================================

export const getRandomAvatar = () => {
  return AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
};

export const studentOwnsAvatar = (student, avatarBase) => {
  return student?.ownedAvatars?.includes(avatarBase) || false;
};

export const getAvatarLevel = (student) => {
  const xp = student?.totalPoints || 0;
  if (xp >= XP_THRESHOLDS.LEVEL_4) return 4;
  if (xp >= XP_THRESHOLDS.LEVEL_3) return 3;
  if (xp >= XP_THRESHOLDS.LEVEL_2) return 2;
  return 1;
};

export const getNextLevelXP = (currentXP) => {
  if (currentXP < XP_THRESHOLDS.LEVEL_2) return XP_THRESHOLDS.LEVEL_2;
  if (currentXP < XP_THRESHOLDS.LEVEL_3) return XP_THRESHOLDS.LEVEL_3;
  if (currentXP < XP_THRESHOLDS.LEVEL_4) return XP_THRESHOLDS.LEVEL_4;
  return null; // Max level reached
};

// ===============================================
// SHOP SYSTEM UTILITIES
// ===============================================

export const generateLootBoxRewards = (boxType = 'common_box') => {
  const rewards = [];
  const numRewards = boxType === 'legendary_box' ? 3 : boxType === 'premium_box' ? 5 : 3;
  
  for (let i = 0; i < numRewards; i++) {
    const randomNum = Math.random();
    let rarity = 'common';
    
    // Determine rarity based on box type
    if (boxType === 'legendary_box') {
      rarity = randomNum < 0.1 ? 'legendary' : randomNum < 0.4 ? 'epic' : 'rare';
    } else if (boxType === 'premium_box') {
      rarity = randomNum < 0.05 ? 'legendary' : randomNum < 0.2 ? 'epic' : 'rare';
    } else {
      rarity = randomNum < 0.2 ? 'rare' : 'common';
    }
    
    const isAvatar = Math.random() < 0.6; // 60% chance for avatar, 40% for pet
    
    if (isAvatar && rarity !== 'common') {
      // Add premium avatar
      const premiumAvatars = PREMIUM_BASIC_AVATARS.filter(a => a.rarity === rarity);
      if (premiumAvatars.length > 0) {
        const randomAvatar = premiumAvatars[Math.floor(Math.random() * premiumAvatars.length)];
        rewards.push({
          ...randomAvatar,
          type: 'avatar'
        });
      }
    } else {
      // Add pet
      const petPool = rarity === 'common' ? BASIC_PETS : PREMIUM_PETS.filter(p => p.rarity === rarity);
      
      if (petPool.length === 0 && rarity !== 'common') {
        // Fallback to existing pets for common rarity
        const fallbackPets = EXISTING_PETS;
        if (fallbackPets.length > 0) {
          const randomPet = fallbackPets[Math.floor(Math.random() * fallbackPets.length)];
          rewards.push({
            ...randomPet,
            type: 'pet',
            rarity: 'common'
          });
        }
      } else if (petPool.length > 0) {
        const randomPet = petPool[Math.floor(Math.random() * petPool.length)];
        rewards.push({
          ...randomPet,
          type: 'pet'
        });
      }
    }
  }
  
  return rewards;
};

export const getShopItemById = (itemId) => {
  // Search through all shop categories
  const allAvatars = [...BASIC_AVATARS, ...PREMIUM_BASIC_AVATARS, ...THEMED_AVATARS];
  const allPets = [...BASIC_PETS, ...EXISTING_PETS, ...PREMIUM_PETS];
  
  return allAvatars.find(item => item.id === itemId) || 
         allPets.find(item => item.id === itemId) || 
         null;
};

export const getItemRarity = (item) => {
  if (item.rarity) return item.rarity;
  if (item.price >= 50) return 'legendary';
  if (item.price >= 30) return 'epic';
  if (item.price >= 20) return 'rare';
  return 'common';
};

// ===============================================
// SOUND UTILITIES
// ===============================================

export const playSound = (soundPath, volume = 1.0) => {
  if (typeof window === 'undefined') return;
  
  try {
    const audio = new Audio(soundPath);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(error => {
      // Silently fail if sound can't play (user hasn't interacted with page yet)
      console.debug('Sound play failed:', error);
    });
  } catch (error) {
    console.debug('Sound creation failed:', error);
  }
};

export const playXPSound = (volume = 0.5) => {
  playSound(SOUND_FILES.XP_AWARD, volume);
};

export const playLevelUpSound = (volume = 0.7) => {
  playSound(SOUND_FILES.LEVEL_UP, volume);
};

export const playPetUnlockSound = (volume = 0.6) => {
  playSound(SOUND_FILES.PET_UNLOCK, volume);
};

export const playCoinSound = (volume = 0.4) => {
  playSound(SOUND_FILES.COIN_COLLECT, volume);
};

export const playSuccessSound = (volume = 0.5) => {
  playSound(SOUND_FILES.SUCCESS, volume);
};

export const playErrorSound = (volume = 0.3) => {
  playSound(SOUND_FILES.ERROR, volume);
};

// ===============================================
// STATISTICS UTILITIES
// ===============================================

export const calculateStudentStats = (student) => {
  const totalXP = student?.totalPoints || 0;
  const level = getAvatarLevel(student);
  const coins = calculateCoins(student);
  const coinsSpent = student?.coinsSpent || 0;
  const totalCoinsEarned = coins + coinsSpent;
  
  return {
    level,
    totalXP,
    coins,
    coinsSpent,
    totalCoinsEarned,
    ownedAvatars: student?.ownedAvatars?.length || 0,
    ownedPets: student?.ownedPets?.length || 0,
    questsCompleted: student?.questsCompleted?.length || 0,
    rewardsPurchased: student?.rewardsPurchased?.length || 0
  };
};

export const calculateClassStats = (students) => {
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      averageXP: 0,
      totalXP: 0,
      highestLevel: 1,
      totalCoins: 0,
      studentsWithPets: 0
    };
  }
  
  const totalXP = students.reduce((sum, student) => sum + (student?.totalPoints || 0), 0);
  const totalCoins = students.reduce((sum, student) => sum + calculateCoins(student), 0);
  const highestLevel = Math.max(...students.map(student => Math.min(4, Math.floor(((student?.totalPoints || 0) / 100) + 1))));
  const studentsWithPets = students.filter(student => student.ownedPets?.length > 0).length;
  
  return {
    totalStudents: students.length,
    averageXP: Math.round(totalXP / students.length),
    totalXP,
    highestLevel: Math.min(4, highestLevel),
    totalCoins,
    studentsWithPets
  };
};

// ===============================================
// VALIDATION UTILITIES
// ===============================================

export const validateStudentData = (student) => {
  const errors = [];
  
  if (!student.id) errors.push('Student ID is required');
  if (!student.firstName?.trim()) errors.push('Student first name is required');
  if (typeof student.totalPoints !== 'number') errors.push('Total points must be a number');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePurchase = (student, item) => {
  const errors = [];
  
  if (!student) errors.push('Student is required');
  if (!item) errors.push('Item is required');
  if (!canAfford(student, item.price)) errors.push('Insufficient coins');
  
  // Check if student already owns the item
  if (item.type === 'avatar' && student.ownedAvatars?.includes(item.base)) {
    errors.push('Student already owns this avatar');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===============================================
// DATA FORMATTING UTILITIES
// ===============================================

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatXP = (xp) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
};

export const formatCoins = (coins) => {
  if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}k`;
  }
  return coins.toString();
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (error) {
    return '';
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  } catch (error) {
    return '';
  }
};

// ===============================================
// ARRAY UTILITIES
// ===============================================

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomItems = (array, count) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

export const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// ===============================================
// XP AND LEVEL UTILITIES
// ===============================================

export const calculateXPForLevel = (level) => {
  const levels = {
    1: XP_THRESHOLDS.LEVEL_1,
    2: XP_THRESHOLDS.LEVEL_2,
    3: XP_THRESHOLDS.LEVEL_3,
    4: XP_THRESHOLDS.LEVEL_4
  };
  return levels[level] || 0;
};

export const getXPProgress = (student) => {
  const currentXP = student?.totalPoints || 0;
  const currentLevel = getAvatarLevel(student);
  const nextLevelXP = getNextLevelXP(currentXP);
  
  if (!nextLevelXP) {
    return { progress: 100, isMaxLevel: true };
  }
  
  const currentLevelXP = calculateXPForLevel(currentLevel);
  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpProgress = currentXP - currentLevelXP;
  const progress = Math.floor((xpProgress / xpNeeded) * 100);
  
  return {
    progress: Math.max(0, Math.min(100, progress)),
    isMaxLevel: false,
    currentXP,
    nextLevelXP,
    xpNeeded: Math.max(0, nextLevelXP - currentXP)
  };
};

// ===============================================
// CURRENCY UTILITIES
// ===============================================

export const calculatePurchasingPower = (student) => {
  const coins = calculateCoins(student);
  const affordableBasicAvatars = BASIC_AVATARS.filter(avatar => avatar.price <= coins).length;
  const affordableBasicPets = BASIC_PETS.filter(pet => pet.price <= coins).length;
  const affordableExistingPets = EXISTING_PETS.filter(pet => pet.price <= coins).length;
  
  return {
    totalCoins: coins,
    affordableBasicAvatars,
    affordableBasicPets,
    affordableExistingPets,
    canAffordLootBox: coins >= 25, // Basic loot box price
    canAffordPremiumBox: coins >= 50,
    canAffordLegendaryBox: coins >= 100
  };
};

export const getRecommendedPurchases = (student) => {
  const coins = calculateCoins(student);
  const recommendations = [];
  
  // Recommend based on what student doesn't have
  if (!student.ownedPets || student.ownedPets.length === 0) {
    const affordablePets = [...BASIC_PETS, ...EXISTING_PETS]
      .filter(pet => pet.price <= coins)
      .sort((a, b) => a.price - b.price);
    
    if (affordablePets.length > 0) {
      recommendations.push({
        type: 'pet',
        item: affordablePets[0],
        reason: 'Get your first pet companion!'
      });
    }
  }
  
  if (student.ownedAvatars?.length <= 2) {
    const affordableAvatars = BASIC_AVATARS
      .filter(avatar => avatar.price <= coins && !student.ownedAvatars?.includes(avatar.base))
      .sort((a, b) => a.price - b.price);
    
    if (affordableAvatars.length > 0) {
      recommendations.push({
        type: 'avatar',
        item: affordableAvatars[0],
        reason: 'Expand your avatar collection!'
      });
    }
  }
  
  if (coins >= 25 && recommendations.length === 0) {
    recommendations.push({
      type: 'lootbox',
      item: { name: 'Basic Loot Box', price: 25 },
      reason: 'Try your luck with a mystery box!'
    });
  }
  
  return recommendations.slice(0, 3); // Limit to 3 recommendations
};

// ===============================================
// ACHIEVEMENT UTILITIES
// ===============================================

export const checkShopAchievements = (student) => {
  const achievements = [];
  const ownedAvatars = student?.ownedAvatars?.length || 0;
  const ownedPets = student?.ownedPets?.length || 0;
  const coinsSpent = student?.coinsSpent || 0;
  
  if (ownedAvatars >= 5) achievements.push('Avatar Collector');
  if (ownedAvatars >= 10) achievements.push('Avatar Master');
  if (ownedPets >= 3) achievements.push('Pet Trainer');
  if (ownedPets >= 6) achievements.push('Pet Master');
  if (coinsSpent >= 100) achievements.push('Big Spender');
  if (coinsSpent >= 500) achievements.push('Shopping Champion');
  
  return achievements;
};

// ===============================================
// INVENTORY MANAGEMENT
// ===============================================

export const organizeInventory = (student) => {
  const avatars = student?.ownedAvatars || [];
  const pets = student?.ownedPets || [];
  const rewards = student?.rewardsPurchased || [];
  
  return {
    avatars: {
      count: avatars.length,
      active: student?.avatarBase || null,
      collection: avatars
    },
    pets: {
      count: pets.length,
      active: student?.pet || null,
      collection: pets
    },
    rewards: {
      count: rewards.length,
      recent: rewards.slice(-5),
      collection: rewards
    }
  };
};

export const getInventoryValue = (student) => {
  let totalValue = 0;
  
  // Calculate avatar values
  const avatars = student?.ownedAvatars || [];
  avatars.forEach(avatarBase => {
    const avatar = [...BASIC_AVATARS, ...PREMIUM_BASIC_AVATARS, ...THEMED_AVATARS]
      .find(a => a.base === avatarBase);
    if (avatar) totalValue += avatar.price;
  });
  
  // Calculate pet values (estimated)
  const pets = student?.ownedPets || [];
  pets.forEach(pet => {
    const petItem = [...BASIC_PETS, ...EXISTING_PETS, ...PREMIUM_PETS]
      .find(p => p.name === pet.name || p.species === pet.species);
    if (petItem) {
      totalValue += petItem.price;
    } else {
      totalValue += 15; // Default pet value
    }
  });
  
  return totalValue;
};