// utils/gameHelpers.js - Game Helper Functions for Educational Elements
export const GAME_CONFIG = { MAX_LEVEL: 4, COINS_PER_XP: 5, PET_UNLOCK_XP: 50 };

// ===============================================
// LEVEL CALCULATION
// ===============================================
export const calculateAvatarLevel = (totalPoints) => {
  if (totalPoints >= 300) return 4;
  if (totalPoints >= 200) return 3;
  if (totalPoints >= 100) return 2;
  return 1;
};

// ===============================================
// COINS CALCULATION
// ===============================================
export const calculateCoins = (student) => {
  if (!student) return 0;
  const totalEarned = Math.floor((student.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student.currency || 0);
  const totalSpent = student.coinsSpent || 0;
  return Math.max(0, totalEarned - totalSpent);
};

// ===============================================
// AVATAR IMAGE PATHS
// ===============================================
export const getAvatarImage = (avatarBase, level = 1) => {
  if (!avatarBase) return '/images/avatars/Wizard F/Wizard F.png';
  
  const basePath = '/images/avatars';
  const levelSuffix = level > 1 ? ` L${level}` : '';
  return `${basePath}/${avatarBase}/${avatarBase}${levelSuffix}.png`;
};

// ===============================================
// PET IMAGE PATHS
// ===============================================
export const getPetImage = (pet) => {
  if (!pet || !pet.name) return '/images/pets/default.png';
  return `/images/pets/${pet.name}.png`;
};

// ===============================================
// SHOP DATA
// ===============================================
export const SHOP_BASIC_AVATARS = [
  { name: 'Alchemist F', price: 50, path: '/images/avatars/Alchemist F/Alchemist F.png' },
  { name: 'Alchemist M', price: 50, path: '/images/avatars/Alchemist M/Alchemist M.png' },
  { name: 'Archer F', price: 45, path: '/images/avatars/Archer F/Archer F.png' },
  { name: 'Archer M', price: 45, path: '/images/avatars/Archer M/Archer M.png' },
  { name: 'Barbarian F', price: 55, path: '/images/avatars/Barbarian F/Barbarian F.png' },
  { name: 'Barbarian M', price: 55, path: '/images/avatars/Barbarian M/Barbarian M.png' },
  { name: 'Bard F', price: 40, path: '/images/avatars/Bard F/Bard F.png' },
  { name: 'Bard M', price: 40, path: '/images/avatars/Bard M/Bard M.png' },
  { name: 'Cleric F', price: 60, path: '/images/avatars/Cleric F/Cleric F.png' },
  { name: 'Cleric M', price: 60, path: '/images/avatars/Cleric M/Cleric M.png' },
  { name: 'Druid F', price: 65, path: '/images/avatars/Druid F/Druid F.png' },
  { name: 'Druid M', price: 65, path: '/images/avatars/Druid M/Druid M.png' },
  { name: 'Knight F', price: 70, path: '/images/avatars/Knight F/Knight F.png' },
  { name: 'Knight M', price: 70, path: '/images/avatars/Knight M/Knight M.png' },
  { name: 'Monk F', price: 50, path: '/images/avatars/Monk F/Monk F.png' },
  { name: 'Monk M', price: 50, path: '/images/avatars/Monk M/Monk M.png' },
  { name: 'Rogue F', price: 55, path: '/images/avatars/Rogue F/Rogue F.png' },
  { name: 'Rogue M', price: 55, path: '/images/avatars/Rogue M/Rogue M.png' },
  { name: 'Wizard F', price: 75, path: '/images/avatars/Wizard F/Wizard F.png' },
  { name: 'Wizard M', price: 75, path: '/images/avatars/Wizard M/Wizard M.png' }
];

export const SHOP_PREMIUM_AVATARS = [
  { name: 'Beastmaster F', price: 100, path: '/images/avatars/Beastmaster F/Beastmaster F.png' },
  { name: 'Beastmaster M', price: 100, path: '/images/avatars/Beastmaster M/Beastmaster M.png' },
  { name: 'Crystal Sage F', price: 150, path: '/images/avatars/Crystal Sage F/Crystal Sage F.png' },
  { name: 'Crystal Sage M', price: 150, path: '/images/avatars/Crystal Sage M/Crystal Sage M.png' },
  { name: 'Engineer F', price: 120, path: '/images/avatars/Engineer F/Engineer F.png' },
  { name: 'Engineer M', price: 120, path: '/images/avatars/Engineer M/Engineer M.png' },
  { name: 'Ice Mage F', price: 130, path: '/images/avatars/Ice Mage F/Ice Mage F.png' },
  { name: 'Ice Mage M', price: 130, path: '/images/avatars/Ice Mage M/Ice Mage M.png' },
  { name: 'Illusionist F', price: 140, path: '/images/avatars/Illusionist F/Illusionist F.png' },
  { name: 'Illusionist M', price: 140, path: '/images/avatars/Illusionist M/Illusionist M.png' },
  { name: 'Necromancer F', price: 160, path: '/images/avatars/Necromancer F/Necromancer F.png' },
  { name: 'Necromancer M', price: 160, path: '/images/avatars/Necromancer M/Necromancer M.png' },
  { name: 'Orc F', price: 110, path: '/images/avatars/Orc F/Orc F.png' },
  { name: 'Orc M', price: 110, path: '/images/avatars/Orc M/Orc M.png' },
  { name: 'Paladin F', price: 180, path: '/images/avatars/Paladin F/Paladin F.png' },
  { name: 'Paladin M', price: 180, path: '/images/avatars/Paladin M/Paladin M.png' },
  { name: 'Sky Knight F', price: 200, path: '/images/avatars/Sky Knight F/Sky Knight F.png' },
  { name: 'Sky Knight M', price: 200, path: '/images/avatars/Sky Knight M/Sky Knight M.png' },
  { name: 'Time Mage F', price: 250, path: '/images/avatars/Time Mage F/Time Mage F.png' },
  { name: 'Time Mage M', price: 250, path: '/images/avatars/Time Mage M/Time Mage M.png' }
];

export const SHOP_BASIC_PETS = [
  { name: 'Alchemist', price: 30, path: '/images/pets/Alchemist.png', rarity: 'common' },
  { name: 'Barbarian', price: 35, path: '/images/pets/Barbarian.png', rarity: 'common' },
  { name: 'Bard', price: 25, path: '/images/pets/Bard.png', rarity: 'common' },
  { name: 'Cleric', price: 40, path: '/images/pets/Cleric.png', rarity: 'common' },
  { name: 'Knight', price: 45, path: '/images/pets/Knight.png', rarity: 'common' },
  { name: 'Monk', price: 30, path: '/images/pets/Monk.png', rarity: 'common' },
  { name: 'Rogue', price: 35, path: '/images/pets/Rogue.png', rarity: 'common' },
  { name: 'Warrior', price: 40, path: '/images/pets/Warrior.png', rarity: 'common' },
  { name: 'Wizard', price: 50, path: '/images/pets/Wizard.png', rarity: 'common' }
];

export const SHOP_PREMIUM_PETS = [
  { name: 'Beastmaster', price: 80, path: '/images/pets/Beastmaster.png', rarity: 'rare' },
  { name: 'Crystal Sage', price: 120, path: '/images/pets/Crystal Sage.png', rarity: 'epic' },
  { name: 'Engineer', price: 90, path: '/images/pets/Engineer.png', rarity: 'rare' },
  { name: 'Frost Mage', price: 100, path: '/images/pets/Frost Mage.png', rarity: 'rare' },
  { name: 'Illusionist', price: 130, path: '/images/pets/Illusionist.png', rarity: 'epic' },
  { name: 'Lightning', price: 200, path: '/images/pets/Lightning.png', rarity: 'legendary' },
  { name: 'Necromancer', price: 140, path: '/images/pets/Necromancer.png', rarity: 'epic' },
  { name: 'Stealth', price: 110, path: '/images/pets/Stealth.png', rarity: 'rare' },
  { name: 'Time Knight', price: 250, path: '/images/pets/Time Knight.png', rarity: 'legendary' }
];

// ===============================================
// PET GENERATION SYSTEM
// ===============================================
const PET_SPECIES = [
  { name: 'Alchemist', type: 'alchemist', rarity: 'common' },
  { name: 'Barbarian', type: 'barbarian', rarity: 'common' },
  { name: 'Bard', type: 'bard', rarity: 'common' },
  { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' },
  { name: 'Cleric', type: 'cleric', rarity: 'common' },
  { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' },
  { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' },
  { name: 'Engineer', type: 'engineer', rarity: 'rare' },
  { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' },
  { name: 'Illusionist', type: 'illusionist', rarity: 'epic' },
  { name: 'Knight', type: 'knight', rarity: 'common' },
  { name: 'Lightning', type: 'lightning', rarity: 'legendary' },
  { name: 'Monk', type: 'monk', rarity: 'common' },
  { name: 'Necromancer', type: 'necromancer', rarity: 'epic' },
  { name: 'Rogue', type: 'rogue', rarity: 'common' },
  { name: 'Stealth', type: 'stealth', rarity: 'rare' },
  { name: 'Time Knight', type: 'time knight', rarity: 'legendary' },
  { name: 'Warrior', type: 'warrior', rarity: 'common' },
  { name: 'Wizard', type: 'wizard', rarity: 'common' }
];

export const getRandomPet = () => {
  const randomSpecies = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: randomSpecies.name,
    type: randomSpecies.type,
    rarity: randomSpecies.rarity,
    level: 1,
    experience: 0,
    unlocked: new Date().toISOString()
  };
};

export const shouldReceivePet = (student) => {
  const totalPoints = student.totalPoints || 0;
  const ownedPets = student.ownedPets || [];
  
  // Give first pet at 50 XP
  if (totalPoints >= GAME_CONFIG.PET_UNLOCK_XP && ownedPets.length === 0) {
    return true;
  }
  
  // Give additional pets every 100 XP after first
  if (totalPoints >= 50 && (totalPoints - 50) % 100 === 0 && ownedPets.length < Math.floor((totalPoints - 50) / 100) + 1) {
    return true;
  }
  
  return false;
};

// ===============================================
// SOUND SYSTEM
// ===============================================
export const playSound = (soundType, volume = 0.5) => {
  try {
    const soundMap = {
      'ding': '/sounds/ding.mp3',
      'coins': '/sounds/coins.mp3',
      'levelup': '/sounds/levelup.mp3',
      'pet': '/sounds/pet.mp3',
      'purchase': '/sounds/purchase.mp3',
      'error': '/sounds/error.mp3'
    };
    
    const soundPath = soundMap[soundType];
    if (soundPath) {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch(e => {
        console.warn('Could not play sound:', soundType, e);
      });
    }
  } catch (error) {
    console.warn('Sound system error:', error);
  }
};