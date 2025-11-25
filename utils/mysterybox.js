// utils/mysteryBox.js - REUSABLE MYSTERY BOX SYSTEM
// This can be used throughout your application for mystery boxes, prizes, etc.

import { PET_EGG_TYPES, createPetEgg, getEggTypeById } from './gameHelpers';
import { CARD_EFFECTS } from '../constants/cardEffects';

export const MYSTERY_BOX_PRICE = 10;

// Define rarity weights (higher = more common)
export const RARITY_WEIGHTS = {
  common: 50,     // 50% base chance
  uncommon: 30,   // 30% base chance
  rare: 15,       // 15% base chance
  epic: 4,        // 4% base chance
  legendary: 1    // 1% base chance
};

export const EGG_RARITY_WEIGHT_BOOST = 3;

// Define XP and Coin rewards by rarity
export const MYSTERY_REWARDS = {
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

// Rarity colors and backgrounds
export const RARITY_STYLES = {
  common: { 
    color: 'text-gray-600 border-gray-300', 
    bg: 'bg-gray-100',
    gradient: 'from-gray-100 to-gray-200'
  },
  uncommon: { 
    color: 'text-green-600 border-green-300', 
    bg: 'bg-green-100',
    gradient: 'from-green-100 to-green-200'
  },
  rare: { 
    color: 'text-blue-600 border-blue-300', 
    bg: 'bg-blue-100',
    gradient: 'from-blue-100 to-blue-200'
  },
  epic: { 
    color: 'text-purple-600 border-purple-300', 
    bg: 'bg-purple-100',
    gradient: 'from-purple-100 to-purple-200'
  },
  legendary: { 
    color: 'text-yellow-600 border-yellow-300', 
    bg: 'bg-yellow-100',
    gradient: 'from-yellow-100 to-yellow-200'
  }
};

/**
 * Determine item rarity based on price
 */
export const getItemRarity = (price) => {
  if (price <= 12) return 'common';
  if (price <= 20) return 'uncommon';
  if (price <= 30) return 'rare';
  if (price <= 45) return 'epic';
  return 'legendary';
};

/**
 * Get rarity styling
 */
export const getRarityColor = (rarity) => {
  return RARITY_STYLES[rarity]?.color || RARITY_STYLES.common.color;
};

export const getRarityBg = (rarity) => {
  return RARITY_STYLES[rarity]?.bg || RARITY_STYLES.common.bg;
};

export const getRarityGradient = (rarity) => {
  return RARITY_STYLES[rarity]?.gradient || RARITY_STYLES.common.gradient;
};

/**
 * Get all possible mystery box prizes
 * Can be customized with different item pools
 */
export const getMysteryBoxPrizes = ({
  avatars = [],
  pets = [],
  rewards = [],
  includeXP = true,
  includeCurrency = true,
  customPrizes = [],
  eggs = PET_EGG_TYPES,
  effects = CARD_EFFECTS
}) => {
  const prizes = [];
  
  // Add avatars
  avatars.forEach(avatar => {
    prizes.push({
      type: 'avatar',
      item: avatar,
      rarity: getItemRarity(avatar.price),
      name: avatar.name,
      displayName: avatar.name,
      description: `Unlock the ${avatar.name} avatar!`
    });
  });
  
  // Add pets
  pets.forEach(pet => {
    prizes.push({
      type: 'pet',
      item: pet,
      rarity: getItemRarity(pet.price),
      name: pet.name,
      displayName: pet.name,
      description: `Adopt a ${pet.name}!`
    });
  });

  // Add eggs
  (eggs || []).forEach((eggType) => {
    prizes.push({
      type: 'egg',
      eggTypeId: eggType.id,
      eggType,
      rarity: eggType.rarity,
      name: `${eggType.name} Egg`,
      displayName: `${eggType.name} Egg`,
      description: eggType.description || 'This egg will hatch into a surprise pet!',
      icon: '🥚'
    });
  });
  
  // Add rewards
  rewards.forEach(reward => {
    prizes.push({
      type: 'reward',
      item: reward,
      rarity: getItemRarity(reward.price),
      name: reward.name,
      displayName: reward.name,
      description: `Earn ${reward.name}!`
    });
  });
  
  // Add XP rewards
  if (includeXP) {
    Object.entries(MYSTERY_REWARDS.xp).forEach(([rarity, amounts]) => {
      amounts.forEach(amount => {
        prizes.push({
          type: 'xp',
          amount: amount,
          rarity: rarity,
          name: `${amount} XP`,
          displayName: `${amount} XP Boost`,
          description: `Gain ${amount} experience points!`,
          icon: '⭐'
        });
      });
    });
  }
  
  // Add coin rewards
  if (includeCurrency) {
    Object.entries(MYSTERY_REWARDS.coins).forEach(([rarity, amounts]) => {
      amounts.forEach(amount => {
        prizes.push({
          type: 'coins',
          amount: amount,
          rarity: rarity,
          name: `${amount} Coins`,
          displayName: `${amount} Bonus Coins`,
          description: `Receive ${amount} coins!`,
          icon: '💰'
        });
      });
    });
  }

  // Add rare cosmetic card effects (only from boxes and special events)
  (effects || []).forEach(effect => {
    prizes.push({
      type: 'card_effect',
      effectId: effect.id,
      rarity: effect.rarity,
      name: effect.name,
      displayName: effect.name,
      description: effect.description,
      icon: '✨'
    });
  });
  
  // Add custom prizes
  customPrizes.forEach(prize => {
    prizes.push({
      ...prize,
      rarity: prize.rarity || getItemRarity(prize.value || 10)
    });
  });
  
  return prizes;
};

/**
 * Weighted random selection function
 */
export const selectRandomPrize = (prizes, customWeights = null) => {
  const weights = customWeights || RARITY_WEIGHTS;
  
  // Create weighted array
  const weightedPrizes = [];
  prizes.forEach(prize => {
    const baseWeight = weights[prize.rarity] || 1;
    const weightBoost = prize.type === 'egg' ? EGG_RARITY_WEIGHT_BOOST : 1;
    const weight = Math.max(1, Math.round(baseWeight * weightBoost));
    for (let i = 0; i < weight; i++) {
      weightedPrizes.push(prize);
    }
  });
  
  // Select random prize
  const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
  return weightedPrizes[randomIndex];
};

/**
 * Create a mystery box configuration
 */
export const createMysteryBox = ({
  id = 'default',
  name = 'Mystery Box',
  description = 'A magical box containing random prizes!',
  price = MYSTERY_BOX_PRICE,
  icon = '🎁',
  prizePool = {},
  customWeights = null,
  theme = 'default'
}) => {
  return {
    id,
    name,
    description,
    price,
    icon,
    theme,
    getPrizes: () => getMysteryBoxPrizes(prizePool),
    selectPrize: () => {
      const prizes = getMysteryBoxPrizes(prizePool);
      return selectRandomPrize(prizes, customWeights);
    }
  };
};

/**
 * Award mystery box prize to student
 */
export const awardMysteryBoxPrize = (prize, student, onUpdateStudent, showToast) => {
  let updatedStudent = { ...student };
  let message = '';
  
  switch (prize.type) {
    case 'avatar':
      if (!student.ownedAvatars?.includes(prize.item.name)) {
        updatedStudent.ownedAvatars = [...new Set([...(student.ownedAvatars || []), prize.item.name])];
        message = `${student.firstName} won the ${prize.item.name} avatar!`;
      } else {
        // Already owned, give coins instead
        updatedStudent.currency = (student.currency || 0) + 5;
        message = `${student.firstName} already had the ${prize.item.name} avatar, so got 5 bonus coins instead!`;
      }
      break;
      
    case 'pet':
      const newPet = { ...prize.item, id: `pet_${Date.now()}` };
      updatedStudent.ownedPets = [...(student.ownedPets || []), newPet];
      message = `${student.firstName} won a ${prize.item.name}!`;
      break;

    case 'egg': {
      const eggType = prize.eggType || getEggTypeById(prize.eggTypeId);
      const newEgg = createPetEgg(eggType);
      updatedStudent.petEggs = [...(student.petEggs || []), newEgg];
      const rarityLabel = (newEgg.rarity || '').toUpperCase();
      message = `${student.firstName} discovered a ${rarityLabel ? `${rarityLabel} ` : ''}${newEgg.name}!`;
      break;
    }
      
    case 'reward':
      updatedStudent.rewardsPurchased = [...(student.rewardsPurchased || []), { 
        ...prize.item, 
        purchasedAt: new Date().toISOString() 
      }];
      message = `${student.firstName} won ${prize.item.name}!`;
      break;
      
    case 'xp':
      updatedStudent.totalPoints = (student.totalPoints || 0) + prize.amount;
      message = `${student.firstName} won ${prize.amount} bonus XP!`;
      break;
      
    case 'coins':
      updatedStudent.currency = (student.currency || 0) + prize.amount;
      message = `${student.firstName} won ${prize.amount} bonus coins!`;
      break;
      
    default:
      // Handle custom prize types
      if (prize.onAward) {
        const result = prize.onAward(student);
        updatedStudent = { ...updatedStudent, ...result.updates };
        message = result.message || `${student.firstName} won ${prize.displayName}!`;
      }
      break;
  }
  
  if (onUpdateStudent) {
    onUpdateStudent(updatedStudent);
  }
  
  if (showToast) {
    showToast(message, 'success');
  }
  
  return { updatedStudent, message };
};

/**
 * Mystery Box React Hook for managing state
 */
export const useMysteryBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState('confirm'); // confirm, opening, reveal
  const [prize, setPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const openBox = () => {
    setIsOpen(true);
    setStage('confirm');
  };
  
  const startOpening = (selectedPrize) => {
    setStage('opening');
    setIsSpinning(true);
    setPrize(selectedPrize);
    
    // Animation duration
    setTimeout(() => {
      setIsSpinning(false);
      setStage('reveal');
    }, 3000);
  };
  
  const close = () => {
    setIsOpen(false);
    setStage('confirm');
    setPrize(null);
    setIsSpinning(false);
  };
  
  return {
    isOpen,
    stage,
    prize,
    isSpinning,
    openBox,
    startOpening,
    close
  };
};

/**
 * Predefined Mystery Box Types
 */
export const MYSTERY_BOX_TYPES = {
  STANDARD: {
    id: 'standard',
    name: 'Mystery Box',
    description: 'A magical box containing random prizes!',
    price: 10,
    icon: '🎁',
    theme: 'purple'
  },
  
  RARE: {
    id: 'rare',
    name: 'Rare Mystery Box',
    description: 'A special box with better chances for rare items!',
    price: 25,
    icon: '🎁✨',
    theme: 'blue',
    customWeights: {
      common: 30,
      uncommon: 35,
      rare: 25,
      epic: 8,
      legendary: 2
    }
  },
  
  EPIC: {
    id: 'epic',
    name: 'Epic Mystery Box',
    description: 'A legendary box with guaranteed epic or better!',
    price: 50,
    icon: '🎁💎',
    theme: 'gold',
    customWeights: {
      common: 0,
      uncommon: 0,
      rare: 40,
      epic: 50,
      legendary: 10
    }
  }
};

// Export default mystery box configuration
export default {
  MYSTERY_BOX_PRICE,
  RARITY_WEIGHTS,
  MYSTERY_REWARDS,
  RARITY_STYLES,
  getItemRarity,
  getRarityColor,
  getRarityBg,
  getRarityGradient,
  getMysteryBoxPrizes,
  selectRandomPrize,
  createMysteryBox,
  awardMysteryBoxPrize,
  useMysteryBox,
  MYSTERY_BOX_TYPES
};