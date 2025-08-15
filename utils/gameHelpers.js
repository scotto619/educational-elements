// utils/gameHelpers.js - Shared game calculation and avatar functions
export const GAME_CONFIG = { MAX_LEVEL: 4, COINS_PER_XP: 5, PET_UNLOCK_XP: 50 };

// Standard Level-Up Avatars
export const AVAILABLE_AVATARS = [ 
  'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M', 
  'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M', 
  'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M', 
  'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M', 
  'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M', 
  'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M', 
  'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M' 
];

// Shop Items - Basic Avatars
export const SHOP_BASIC_AVATARS = [ 
  { name: 'Banana', price: 10, path: '/shop/Basic/Banana.png' }, 
  { name: 'Basketball', price: 12, path: '/shop/Basic/Basketball.png' }, 
  { name: 'BasketballGirl', price: 12, path: '/shop/Basic/BasketballGirl.png' }, 
  { name: 'FarmerBoy', price: 15, path: '/shop/Basic/FarmerBoy.png' }, 
  { name: 'FarmerGirl', price: 15, path: '/shop/Basic/FarmerGirl.png' }, 
  { name: 'Goblin1', price: 15, path: '/shop/Basic/Goblin1.png' }, 
  { name: 'GoblinGirl1', price: 15, path: '/shop/Basic/GoblinGirl1.png' }, 
  { name: 'Guard1', price: 20, path: '/shop/Basic/Guard1.png' }, 
  { name: 'GuardGirl1', price: 20, path: '/shop/Basic/GuardGirl1.png' }, 
  { name: 'PirateBoy', price: 18, path: '/shop/Basic/PirateBoy.png' }, 
  { name: 'PirateGirl', price: 18, path: '/shop/Basic/PirateGirl.png' }, 
  { name: 'RoboKnight', price: 25, path: '/shop/Basic/RoboKnight.png' }, 
  { name: 'RobotBoy', price: 22, path: '/shop/Basic/RobotBoy.png' }, 
  { name: 'RobotGirl', price: 22, path: '/shop/Basic/RobotGirl.png' }, 
  { name: 'SoccerBoy', price: 10, path: '/shop/Basic/SoccerBoy.png' }, 
  { name: 'SoccerBoy2', price: 10, path: '/shop/Basic/SoccerBoy2.png' }, 
  { name: 'SoccerGirl', price: 10, path: '/shop/Basic/SoccerGirl.png' }, 
  { name: 'StreetBoy1', price: 15, path: '/shop/Basic/Streetboy1.png' }, 
  { name: 'StreetGirl1', price: 15, path: '/shop/Basic/Streetgirl1.png' }, 
  { name: 'Vampire1', price: 20, path: '/shop/Basic/Vampire1.png' } 
];

// Shop Items - Premium Avatars
export const SHOP_PREMIUM_AVATARS = [ 
  { name: 'Dwarf', price: 45, path: '/shop/Premium/Dwarf.png' }, 
  { name: 'Dwarf2', price: 45, path: '/shop/Premium/Dwarf2.png' }, 
  { name: 'FarmerBoy Premium', price: 35, path: '/shop/Premium/FarmerBoy.png' }, 
  { name: 'FarmerGirl Premium', price: 35, path: '/shop/Premium/FarmerGirl.png' }, 
  { name: 'Goblin2', price: 30, path: '/shop/Premium/Goblin2.png' }, 
  { name: 'GoblinGirl2', price: 30, path: '/shop/Premium/GoblinGirl2.png' }, 
  { name: 'King', price: 60, path: '/shop/Premium/King.png' }, 
  { name: 'MechanicGirl', price: 40, path: '/shop/Premium/MechanicGirl.png' }, 
  { name: 'PirateBoy Premium', price: 42, path: '/shop/Premium/PirateBoy.png' }, 
  { name: 'PirateGirl Premium', price: 42, path: '/shop/Premium/PirateGirl.png' }, 
  { name: 'Queen', price: 60, path: '/shop/Premium/Queen.png' }, 
  { name: 'RobotBoy Premium', price: 38, path: '/shop/Premium/RobotBoy.png' }, 
  { name: 'RobotGirl Premium', price: 38, path: '/shop/Premium/RobotGirl.png' }, 
  { name: 'Vampire2', price: 40, path: '/shop/Premium/Vampire2.png' }, 
  { name: 'VampireGirl2', price: 40, path: '/shop/Premium/VampireGirl2.png' } 
];

// Shop Items - Basic Pets
export const SHOP_BASIC_PETS = [
  { name: 'Alchemist Pet', price: 25, path: '/shop/BasicPets/Alchemist.png' },
  { name: 'Barbarian Pet', price: 30, path: '/shop/BasicPets/Barbarian.png' },
  { name: 'Bard Pet', price: 25, path: '/shop/BasicPets/Bard.png' },
  { name: 'Beastmaster Pet', price: 35, path: '/shop/BasicPets/Beastmaster.png' },
  { name: 'Cleric Pet', price: 25, path: '/shop/BasicPets/Cleric.png' },
  { name: 'Crystal Knight Pet', price: 45, path: '/shop/BasicPets/Crystal Knight.png' },
  { name: 'Crystal Sage Pet', price: 45, path: '/shop/BasicPets/Crystal Sage.png' },
  { name: 'Dragon Pet', price: 50, path: '/shop/BasicPets/DragonPet.png' },
  { name: 'Dream Pet', price: 40, path: '/shop/BasicPets/Dream.png' },
  { name: 'Druid Pet', price: 35, path: '/shop/BasicPets/Druid.png' },
  { name: 'Engineer Pet', price: 30, path: '/shop/BasicPets/Engineer.png' },
  { name: 'Farm Pet 1', price: 20, path: '/shop/BasicPets/FarmPet1.png' },
  { name: 'Farm Pet 2', price: 20, path: '/shop/BasicPets/FarmPet2.png' },
  { name: 'Farm Pet 3', price: 20, path: '/shop/BasicPets/FarmPet3.png' },
  { name: 'Frost Mage Pet', price: 35, path: '/shop/BasicPets/Frost Mage.png' },
  { name: 'Goblin Pet', price: 25, path: '/shop/BasicPets/GoblinPet.png' },
  { name: 'Illusionist Pet', price: 40, path: '/shop/BasicPets/Illusionist.png' },
  { name: 'Knight Pet', price: 30, path: '/shop/BasicPets/Knight.png' },
  { name: 'Lightning Pet', price: 50, path: '/shop/BasicPets/Lightning.png' },
  { name: 'Monk Pet', price: 25, path: '/shop/BasicPets/Monk.png' },
  { name: 'Necromancer Pet', price: 40, path: '/shop/BasicPets/Necromancer.png' },
  { name: 'Orc Pet', price: 30, path: '/shop/BasicPets/Orc.png' },
  { name: 'Paladin Pet', price: 35, path: '/shop/BasicPets/Paladin.png' },
  { name: 'Pirate Pet 1', price: 25, path: '/shop/BasicPets/PiratePet1.png' },
  { name: 'Pirate Pet 2', price: 25, path: '/shop/BasicPets/PiratePet2.png' },
  { name: 'Pirate Pet 3', price: 25, path: '/shop/BasicPets/PiratePet3.png' },
  { name: 'Rabbit Pet', price: 20, path: '/shop/BasicPets/RabbitPet.png' },
  { name: 'Robot Boy Pet', price: 30, path: '/shop/BasicPets/RobotBoyPet.png' },
  { name: 'Robot Girl Pet', price: 30, path: '/shop/BasicPets/RobotGirlPet.png' },
  { name: 'Robot Pet 1', price: 30, path: '/shop/BasicPets/RobotPet1.png' },
  { name: 'Robot Pet 2', price: 30, path: '/shop/BasicPets/RobotPet2.png' },
  { name: 'Rogue Pet', price: 25, path: '/shop/BasicPets/Rogue.png' },
  { name: 'Soccer Pet', price: 20, path: '/shop/BasicPets/SoccerPet.png' },
  { name: 'Stealth Pet', price: 35, path: '/shop/BasicPets/Stealth.png' },
  { name: 'Time Knight Pet', price: 50, path: '/shop/BasicPets/Time Knight.png' },
  { name: 'Unicorn Pet', price: 35, path: '/shop/BasicPets/UnicornPet.png' },
  { name: 'Warrior Pet', price: 30, path: '/shop/BasicPets/Warrior.png' },
  { name: 'Wizard Pet', price: 25, path: '/shop/BasicPets/Wizard.png' }
];

// Shop Items - Premium Pets
export const SHOP_PREMIUM_PETS = [
  { name: 'Lion Pet', price: 60, path: '/shop/PremiumPets/LionPet.png' },
  { name: 'Snake Pet', price: 50, path: '/shop/PremiumPets/SnakePet.png' },
  { name: 'Vampire Pet', price: 50, path: '/shop/PremiumPets/VampirePet.png' }
];

// ===============================================
// HELPER FUNCTIONS
// ===============================================

export const getAvatarImage = (avatarBase, level) => {
  const shopItem = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS].find(a => a.name.toLowerCase() === avatarBase?.toLowerCase());
  if (shopItem) return shopItem.path;
  return `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;
};

export const getPetImage = (pet) => {
  if (!pet || !pet.name) return '/Pets/Wizard.png';

  // First, check if pet has a direct path (for shop pets)
  if (pet.path) return pet.path;

  // Then, check shop items (case insensitive)
  const shopItem = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].find(p => p.name.toLowerCase() === pet.name.toLowerCase());
  if (shopItem) return shopItem.path;

  // For standard pets
  const key = (pet.type || pet.name || '').toLowerCase();
  const map = { 
    'alchemist': '/Pets/Alchemist.png', 
    'barbarian': '/Pets/Barbarian.png', 
    'bard': '/Pets/Bard.png', 
    'beastmaster': '/Pets/Beastmaster.png', 
    'cleric': '/Pets/Cleric.png', 
    'crystal knight': '/Pets/Crystal Knight.png', 
    'crystal sage': '/Pets/Crystal Sage.png', 
    'engineer': '/Pets/Engineer.png', 
    'frost mage': '/Pets/Frost Mage.png', 
    'illusionist': '/Pets/Illusionist.png', 
    'knight': '/Pets/Knight.png', 
    'lightning': '/Pets/Lightning.png', 
    'monk': '/Pets/Monk.png', 
    'necromancer': '/Pets/Necromancer.png', 
    'rogue': '/Pets/Rogue.png', 
    'stealth': '/Pets/Stealth.png', 
    'time knight': '/Pets/Time Knight.png', 
    'warrior': '/Pets/Warrior.png', 
    'wizard': '/Pets/Wizard.png', 
    'dragon': '/Pets/Lightning.png', 
    'phoenix': '/Pets/Crystal Sage.png', 
    'unicorn': '/Pets/Time Knight.png', 
    'wolf': '/Pets/Warrior.png', 
    'owl': '/Pets/Wizard.png', 
    'cat': '/Pets/Rogue.png', 
    'tiger': '/Pets/Barbarian.png', 
    'bear': '/Pets/Beastmaster.png', 
    'lion': '/Pets/Knight.png', 
    'eagle': '/Pets/Stealth.png' 
  };
  return map[key] || '/Pets/Wizard.png';
};

export const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);

export const calculateCoins = (student) => Math.max(0, Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student?.currency || 0) - (student?.coinsSpent || 0));

export const playSound = (sound = 'ding') => { 
  try { 
    const audio = new Audio(`/sounds/${sound}.mp3`); 
    audio.volume = 0.3; 
    audio.play().catch(e => {}); 
  } catch(e) {} 
};

// Student utility functions
export const shouldReceivePet = (student) => (student?.totalPoints || 0) >= GAME_CONFIG.PET_UNLOCK_XP && (!student?.ownedPets || student.ownedPets.length === 0);

export const getRandomPet = () => {
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

  try {
    const pet = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
    return { 
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, 
      name: pet.name, 
      type: pet.type, 
      rarity: pet.rarity, 
      displayName: pet.name, 
      imageType: pet.type 
    };
  } catch (error) {
    return { 
      id: `pet_${Date.now()}_failsafe`, 
      name: 'Wizard', 
      type: 'wizard', 
      rarity: 'common', 
      displayName: 'Wizard', 
      imageType: 'wizard' 
    };
  }
};

// Student data update helper for Firebase
export const updateStudentInFirebase = async (firestore, teacherUserId, classId, studentId, updates) => {
  try {
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    
    const teacherDocRef = doc(firestore, 'users', teacherUserId);
    const teacherDocSnap = await getDoc(teacherDocRef);
    
    if (!teacherDocSnap.exists()) {
      throw new Error('Teacher document not found');
    }
    
    const teacherData = teacherDocSnap.data();
    const updatedClasses = teacherData.classes.map(cls => {
      if (cls.id === classId) {
        return {
          ...cls,
          students: cls.students.map(student => 
            student.id === studentId ? { ...student, ...updates } : student
          )
        };
      }
      return cls;
    });

    await updateDoc(teacherDocRef, { classes: updatedClasses });
    return true;
  } catch (error) {
    console.error('Error updating student in Firebase:', error);
    return false;
  }
};