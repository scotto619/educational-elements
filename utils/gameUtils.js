// utils/gameUtils.js - ENHANCED with Missing Functions for StudentsTab

// ===============================================
// CONSTANTS FOR GAME CALCULATIONS
// ===============================================

const GAME_CONFIG = {
  MAX_LEVEL: 4,
  COINS_PER_XP: 5,
  RACE_DISTANCE: 0.8,
  PET_UNLOCK_XP: 50,
  XP_THRESHOLDS: {
    LEVEL_1: 0,
    LEVEL_2: 100,
    LEVEL_3: 200,
    LEVEL_4: 300
  }
};

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
  const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

export const canAfford = (student, cost) => {
  const availableCoins = calculateCoins(student);
  return availableCoins >= cost;
};

// ===============================================
// GRID LAYOUT UTILITIES - NEW FOR STUDENTSTAB
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

const PET_SPECIES = [
  { name: 'Dragon', image: '/Pets/Dragon.png', speed: 1.2 },
  { name: 'Phoenix', image: '/Pets/Phoenix.png', speed: 1.5 },
  { name: 'Wolf', image: '/Pets/Wolf.png', speed: 1.3 },
  { name: 'Cat', image: '/Pets/Cat.png', speed: 1.0 },
  { name: 'Owl', image: '/Pets/Owl.png', speed: 1.1 },
  { name: 'Bear', image: '/Pets/Bear.png', speed: 0.9 },
  { name: 'Eagle', image: '/Pets/Eagle.png', speed: 1.4 },
  { name: 'Lion', image: '/Pets/Lion.png', speed: 1.3 }
];

const PET_NAMES = [
  'Buddy', 'Shadow', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky',
  'Zoe', 'Jack', 'Molly', 'Duke', 'Sadie', 'Bear', 'Maggie', 'Zeus',
  'Lucy', 'Cooper', 'Sophie', 'Tucker', 'Chloe', 'Oliver', 'Lola', 'Oscar'
];

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
  const hasReachedXP = (student?.totalPoints || 0) >= GAME_CONFIG.PET_UNLOCK_XP;
  const hasNoPets = !student?.ownedPets || student.ownedPets.length === 0;
  return hasReachedXP && hasNoPets;
};

// ===============================================
// AVATAR SYSTEM UTILITIES
// ===============================================

const AVAILABLE_AVATARS = [
  'Alchemist F', 'Archer F', 'Barbarian F', 'Bard F', 'Beastmaster F', 'Cleric F', 
  'Crystal Sage F', 'Druid F', 'Engineer F', 'Ice Mage F', 'Illusionist F', 'Knight F', 
  'Monk F', 'Necromancer F', 'Orc F', 'Paladin F', 'Rogue F', 'Sky Knight F', 
  'Time Mage F', 'Wizard F',
  'Alchemist M', 'Archer M', 'Barbarian M', 'Bard M', 'Beastmaster M', 'Cleric M',
  'Crystal Sage M', 'Druid M', 'Engineer M', 'Ice Mage M', 'Illusionist M', 'Knight M',
  'Monk M', 'Necromancer M', 'Orc M', 'Paladin M', 'Rogue M', 'Sky Knight M', 
  'Time Mage M', 'Wizard M'
];

export const getRandomAvatar = () => {
  return AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
};

export const studentOwnsAvatar = (student, avatarBase) => {
  // Check direct ownership
  if (student?.ownedAvatars?.includes(avatarBase)) {
    return true;
  }
  
  // Check inventory for shop purchases
  if (student?.inventory) {
    return student.inventory.some(item => 
      item.avatarBase === avatarBase || 
      item.id?.includes(avatarBase?.toLowerCase())
    );
  }
  
  return false;
};

// ===============================================
// SOUND SYSTEM UTILITIES
// ===============================================

export const playSound = (soundType, volume = 0.7) => {
  try {
    const soundFiles = {
      XP_AWARD: '/sounds/xp-award.wav',
      LEVEL_UP: '/sounds/level-up.wav',
      COIN_COLLECT: '/sounds/coin.wav',
      PET_UNLOCK: '/sounds/pet-unlock.wav',
      SUCCESS: '/sounds/success.wav',
      ERROR: '/sounds/error.wav',
      BUTTON_CLICK: '/sounds/click.wav'
    };

    const soundFile = soundFiles[soundType];
    if (!soundFile) {
      console.warn(`Sound type ${soundType} not found`);
      return;
    }

    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(error => {
      console.log(`Could not play ${soundType} sound:`, error);
      playSystemBeep();
    });
  } catch (error) {
    console.log('Audio not supported:', error);
    playSystemBeep();
  }
};

export const playXPSound = () => {
  try {
    // Create and play XP award sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Sound not available:', error);
  }
};

export const playPetUnlockSound = () => {
  try {
    playSound('PET_UNLOCK', 0.8);
  } catch (error) {
    console.log('Pet unlock sound not available:', error);
  }
};

const playSystemBeep = () => {
  // Fallback system beep
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('System beep not available:', error);
  }
};

// ===============================================
// STUDENT STATISTICS
// ===============================================

export const calculateStudentStats = (student) => {
  const totalXP = student?.totalPoints || 0;
  const availableCoins = calculateCoins(student);
  const coinsSpent = student?.coinsSpent || 0;
  const totalCoinsEarned = availableCoins + coinsSpent;
  
  return {
    totalXP,
    availableCoins,
    coinsSpent,
    totalCoinsEarned,
    level: Math.max(1, Math.min(4, Math.floor(totalXP / 100) + 1)),
    progressToNextLevel: totalXP % 100,
    questsCompleted: student?.questsCompleted?.length || 0,
    petsOwned: student?.ownedPets?.length || 0,
    avatarsOwned: student?.ownedAvatars?.length || 0
  };
};

export const calculateClassStats = (students) => {
  if (!students?.length) {
    return {
      totalStudents: 0,
      averageXP: 0,
      totalXP: 0,
      highestLevel: 0,
      totalCoins: 0,
      studentsWithPets: 0
    };
  }

  const totalXP = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
  const totalCoins = students.reduce((sum, student) => sum + calculateCoins(student), 0);
  const highestLevel = Math.max(...students.map(student => Math.floor((student.totalPoints || 0) / 100) + 1));
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

// ===============================================
// SHOP SYSTEM UTILITIES
// ===============================================

export const generateLootBoxRewards = (boxType = 'common_box') => {
  const rewards = [];
  const numRewards = boxType === 'legendary_box' ? 3 : boxType === 'rare_box' ? 2 : 1;
  
  const lootBoxItems = {
    avatars: [
      { id: 'rare_wizard', name: 'Mystic Wizard', type: 'avatar', rarity: 'rare' },
      { id: 'rare_knight', name: 'Golden Knight', type: 'avatar', rarity: 'rare' },
      { id: 'legendary_dragon', name: 'Dragon Lord', type: 'avatar', rarity: 'legendary' }
    ],
    pets: [
      { id: 'rare_phoenix', name: 'Fire Phoenix', type: 'pet', rarity: 'rare' },
      { id: 'rare_unicorn', name: 'Rainbow Unicorn', type: 'pet', rarity: 'rare' },
      { id: 'legendary_griffin', name: 'Golden Griffin', type: 'pet', rarity: 'legendary' }
    ]
  };
  
  for (let i = 0; i < numRewards; i++) {
    const allItems = [...lootBoxItems.avatars, ...lootBoxItems.pets];
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    rewards.push(item);
  }
  
  return rewards;
};