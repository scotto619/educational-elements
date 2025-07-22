// services/gameLogic.js - Centralized Game Logic and Calculations
// This service handles XP, levels, achievements, rewards, and game mechanics

import { 
  GAME_CONFIG, 
  RARITY_CONFIG, 
  calculateLevel, 
  getXPForNextLevel, 
  calculateCoins,
  ACHIEVEMENTS,
  generateLootBoxRewards
} from '../config/gameData.js';
import { 
  getAvatarImagePath, 
  getRandomPetName, 
  getAllPets 
} from '../config/assets.js';
import soundService from './soundService.js';

class GameLogicService {
  constructor() {
    this.levelUpCallbacks = [];
    this.petUnlockCallbacks = [];
    this.achievementCallbacks = [];
  }

  // ===============================================
  // XP AND LEVELING SYSTEM
  // ===============================================

  /**
   * Award XP to a student
   * @param {Object} student - Student object
   * @param {string} category - XP category ('Respectful', 'Responsible', 'Learner')
   * @param {number} amount - XP amount to award
   * @returns {Object} Updated student with XP and level changes
   */
  awardXP(student, category, amount) {
    if (!student || !category || !amount || amount <= 0) {
      throw new Error('Invalid XP award parameters');
    }

    // Validate category
    if (!GAME_CONFIG.XP_CATEGORIES.includes(category)) {
      throw new Error(`Invalid XP category: ${category}`);
    }

    // Calculate new totals
    const oldTotalXP = student.totalPoints || 0;
    const newTotalXP = oldTotalXP + amount;
    const oldLevel = calculateLevel(oldTotalXP);
    const newLevel = calculateLevel(newTotalXP);

    // Create XP log entry
    const logEntry = {
      type: category,
      amount: amount,
      date: new Date().toISOString(),
      source: "manual",
      oldTotal: oldTotalXP,
      newTotal: newTotalXP
    };

    // Update student data
    const updatedStudent = {
      ...student,
      totalPoints: newTotalXP,
      weeklyPoints: (student.weeklyPoints || 0) + amount,
      lastXpDate: new Date().toISOString(),
      categoryTotal: {
        ...student.categoryTotal,
        [category]: (student.categoryTotal?.[category] || 0) + amount,
      },
      categoryWeekly: {
        ...student.categoryWeekly,
        [category]: (student.categoryWeekly?.[category] || 0) + amount,
      },
      logs: [
        ...(student.logs || []),
        logEntry
      ]
    };

    // Handle level up
    if (newLevel > oldLevel) {
      updatedStudent.level = newLevel;
      updatedStudent.avatar = getAvatarImagePath(student.avatarBase, newLevel);
      
      // Play level up sound
      soundService.playLevelUpSound();
      
      // Trigger level up callbacks
      this.levelUpCallbacks.forEach(callback => {
        try {
          callback({
            studentId: student.id,
            oldLevel,
            newLevel,
            student: updatedStudent
          });
        } catch (error) {
          console.error('Level up callback error:', error);
        }
      });
    }

    // Check for pet unlock at configured XP threshold
    if (!student.pet?.image && newTotalXP >= GAME_CONFIG.PET_UNLOCK_XP) {
      const randomPet = this.getRandomPet();
      updatedStudent.pet = {
        ...randomPet,
        name: getRandomPetName(),
        unlockedAt: new Date().toISOString()
      };

      // Add to owned pets
      updatedStudent.ownedPets = [
        ...(student.ownedPets || []),
        updatedStudent.pet
      ];

      // Play pet unlock sound
      soundService.playPetUnlockSound();

      // Trigger pet unlock callbacks
      this.petUnlockCallbacks.forEach(callback => {
        try {
          callback({
            studentId: student.id,
            pet: updatedStudent.pet,
            student: updatedStudent
          });
        } catch (error) {
          console.error('Pet unlock callback error:', error);
        }
      });
    }

    // Check for achievements
    this.checkAchievements(updatedStudent, student);

    // Play XP sound
    soundService.playSuccessSound();

    return updatedStudent;
  }

  /**
   * Bulk award XP to multiple students
   * @param {Array} students - Array of student objects
   * @param {Array} studentIds - Array of student IDs to award XP to
   * @param {string} category - XP category
   * @param {number} amount - XP amount per student
   * @returns {Array} Updated students array
   */
  bulkAwardXP(students, studentIds, category, amount) {
    if (!Array.isArray(students) || !Array.isArray(studentIds)) {
      throw new Error('Invalid bulk XP parameters');
    }

    return students.map(student => {
      if (studentIds.includes(student.id)) {
        return this.awardXP(student, category, amount);
      }
      return student;
    });
  }

  /**
   * Calculate level progress percentage
   * @param {Object} student - Student object
   * @returns {Object} Level progress data
   */
  getLevelProgress(student) {
    const currentXP = student.totalPoints || 0;
    const currentLevel = calculateLevel(currentXP);
    const xpForNextLevel = getXPForNextLevel(currentXP);
    
    if (currentLevel >= GAME_CONFIG.MAX_LEVEL) {
      return {
        currentLevel,
        maxLevel: true,
        progressPercent: 100,
        xpForNext: 0,
        xpInCurrentLevel: 0
      };
    }

    const currentLevelStartXP = GAME_CONFIG.LEVEL_THRESHOLDS[currentLevel - 1];
    const nextLevelXP = GAME_CONFIG.LEVEL_THRESHOLDS[currentLevel];
    const xpInCurrentLevel = currentXP - currentLevelStartXP;
    const xpNeededForLevel = nextLevelXP - currentLevelStartXP;
    const progressPercent = Math.round((xpInCurrentLevel / xpNeededForLevel) * 100);

    return {
      currentLevel,
      maxLevel: false,
      progressPercent,
      xpForNext: xpForNextLevel,
      xpInCurrentLevel,
      xpNeededForLevel
    };
  }

  // ===============================================
  // PET SYSTEM
  // ===============================================

  /**
   * Get a random pet for unlocking
   * @returns {Object} Random pet data
   */
  getRandomPet() {
    const allPets = getAllPets();
    return allPets[Math.floor(Math.random() * allPets.length)];
  }

  /**
   * Calculate pet race speed including bonuses
   * @param {Object} pet - Pet object
   * @param {Object} student - Student who owns the pet
   * @returns {number} Final speed value
   */
  calculatePetSpeed(pet, student = null) {
    if (!pet) return 1.0;

    let baseSpeed = pet.speed || 1.0;
    let speedBonus = 0;

    // Add win bonuses (0.1 per win, max 5 wins)
    if (pet.wins) {
      speedBonus += Math.min(pet.wins * 0.1, 0.5);
    }

    // Add item bonuses from student inventory
    if (student?.inventory) {
      student.inventory.forEach(item => {
        if (item.effect && item.effect.includes('Pet') && item.effect.includes('Speed')) {
          const speedMatch = item.effect.match(/\+(\d+\.?\d*)/);
          if (speedMatch) {
            speedBonus += parseFloat(speedMatch[1]);
          }
        }
      });
    }

    return Math.round((baseSpeed + speedBonus) * 100) / 100; // Round to 2 decimals
  }

  /**
   * Award pet race win
   * @param {Object} pet - Winning pet
   * @param {Object} prize - Prize data
   * @returns {Object} Updated pet with win record
   */
  awardPetRaceWin(pet, prize) {
    if (!pet) return pet;

    return {
      ...pet,
      wins: (pet.wins || 0) + 1,
      lastWin: new Date().toISOString(),
      totalPrizes: (pet.totalPrizes || 0) + (prize?.coinValue || 0)
    };
  }

  // ===============================================
  // ACHIEVEMENT SYSTEM
  // ===============================================

  /**
   * Check and award achievements for a student
   * @param {Object} newStudent - Updated student data
   * @param {Object} oldStudent - Previous student data
   * @returns {Array} Newly unlocked achievements
   */
  checkAchievements(newStudent, oldStudent) {
    const newAchievements = [];

    ACHIEVEMENTS.forEach(achievement => {
      // Skip if already earned
      if (newStudent.achievements?.some(a => a.id === achievement.id)) {
        return;
      }

      let earned = false;

      switch (achievement.requirement.type) {
        case 'level':
          earned = calculateLevel(newStudent.totalPoints) >= achievement.requirement.value;
          break;

        case 'pet_unlock':
          earned = (newStudent.ownedPets?.length || 0) >= achievement.requirement.value;
          break;

        case 'quests_completed':
          const completedQuests = newStudent.questsCompleted || 0;
          earned = completedQuests >= achievement.requirement.value;
          break;

        case 'category_xp':
          const categoryXP = newStudent.categoryTotal?.[achievement.requirement.category] || 0;
          earned = categoryXP >= achievement.requirement.value;
          break;

        case 'total_xp':
          earned = (newStudent.totalPoints || 0) >= achievement.requirement.value;
          break;

        case 'login_streak':
          const loginStreak = newStudent.loginStreak || 0;
          earned = loginStreak >= achievement.requirement.value;
          break;
      }

      if (earned) {
        const unlockedAchievement = {
          ...achievement,
          unlockedAt: new Date().toISOString()
        };

        newAchievements.push(unlockedAchievement);

        // Add to student achievements
        newStudent.achievements = [
          ...(newStudent.achievements || []),
          unlockedAchievement
        ];

        // Award achievement rewards
        if (achievement.reward?.coins) {
          newStudent.coins = (newStudent.coins || 0) + achievement.reward.coins;
        }

        if (achievement.reward?.xp) {
          // Award bonus XP (recursive call, but safe since achievements don't unlock more achievements)
          Object.assign(newStudent, this.awardXP(newStudent, 'Learner', achievement.reward.xp));
        }

        // Trigger achievement callbacks
        this.achievementCallbacks.forEach(callback => {
          try {
            callback({
              studentId: newStudent.id,
              achievement: unlockedAchievement,
              student: newStudent
            });
          } catch (error) {
            console.error('Achievement callback error:', error);
          }
        });
      }
    });

    return newAchievements;
  }

  // ===============================================
  // SHOP AND INVENTORY SYSTEM
  // ===============================================

  /**
   * Process shop purchase
   * @param {Object} student - Student making purchase
   * @param {Object} item - Item being purchased
   * @returns {Object} Updated student after purchase
   */
  processPurchase(student, item) {
    const availableCoins = calculateCoins(student);
    
    if (availableCoins < item.price) {
      throw new Error('Insufficient coins for purchase');
    }

    const updatedStudent = { ...student };
    
    // Deduct coins
    updatedStudent.coinsSpent = (student.coinsSpent || 0) + item.price;

    // Add to inventory based on item type
    switch (item.category) {
      case 'avatars':
        updatedStudent.ownedAvatars = [
          ...(student.ownedAvatars || []),
          item.base || item.id
        ];
        // Immediately equip if it's their first avatar change
        if (!student.avatarBase || student.avatarBase === 'Wizard F') {
          updatedStudent.avatarBase = item.base || item.id;
          updatedStudent.avatar = getAvatarImagePath(item.base || item.id, student.level || 1);
        }
        break;

      case 'pets':
        const newPet = {
          id: item.id,
          name: item.name,
          image: item.imagePath || item.image,
          speed: item.speed || 1.0,
          wins: 0,
          level: 1,
          purchasedAt: new Date().toISOString()
        };
        
        updatedStudent.ownedPets = [
          ...(student.ownedPets || []),
          newPet
        ];

        // Set as active pet if they don't have one
        if (!student.pet?.image) {
          updatedStudent.pet = newPet;
        }
        break;

      case 'consumables':
        updatedStudent.inventory = [
          ...(student.inventory || []),
          {
            ...item,
            purchasedAt: new Date().toISOString(),
            quantity: 1
          }
        ];
        break;

      case 'rewards':
        updatedStudent.rewardsPurchased = [
          ...(student.rewardsPurchased || []),
          {
            ...item,
            purchasedAt: new Date().toISOString()
          }
        ];
        break;

      case 'lootboxes':
        // Generate loot box contents
        const lootRewards = generateLootBoxRewards(item);
        
        // Add each reward to appropriate inventory
        lootRewards.forEach(reward => {
          if (reward.category === 'pets') {
            const lootPet = {
              id: reward.id,
              name: reward.name,
              image: reward.imagePath || reward.image,
              speed: reward.speed || 1.0,
              wins: 0,
              level: 1,
              fromLootBox: true,
              unlockedAt: new Date().toISOString()
            };
            
            updatedStudent.ownedPets = [
              ...(updatedStudent.ownedPets || []),
              lootPet
            ];
          } else if (reward.category === 'avatars') {
            updatedStudent.ownedAvatars = [
              ...(updatedStudent.ownedAvatars || []),
              reward.base || reward.id
            ];
          } else {
            updatedStudent.inventory = [
              ...(updatedStudent.inventory || []),
              {
                ...reward,
                fromLootBox: true,
                unlockedAt: new Date().toISOString()
              }
            ];
          }
        });

        // Store loot box opening for history
        updatedStudent.lootBoxHistory = [
          ...(student.lootBoxHistory || []),
          {
            boxType: item.id,
            rewards: lootRewards,
            openedAt: new Date().toISOString()
          }
        ];
        break;
    }

    // Add purchase to history
    updatedStudent.purchaseHistory = [
      ...(student.purchaseHistory || []),
      {
        itemId: item.id,
        itemName: item.name,
        price: item.price,
        category: item.category,
        purchasedAt: new Date().toISOString()
      }
    ];

    // Play purchase sound
    soundService.playPurchaseSound();

    return updatedStudent;
  }

  /**
   * Use consumable item
   * @param {Object} student - Student using item
   * @param {Object} item - Consumable item
   * @returns {Object} Updated student after using item
   */
  useConsumable(student, item) {
    if (item.category !== 'consumables') {
      throw new Error('Item is not consumable');
    }

    const updatedStudent = { ...student };

    // Apply item effects
    if (item.effect.includes('XP')) {
      const xpMatch = item.effect.match(/\+(\d+)/);
      if (xpMatch) {
        const xpAmount = parseInt(xpMatch[1]);
        Object.assign(updatedStudent, this.awardXP(updatedStudent, 'Learner', xpAmount));
      }
    } else if (item.effect.includes('Coins')) {
      const coinMatch = item.effect.match(/\+(\d+)/);
      if (coinMatch) {
        const coinAmount = parseInt(coinMatch[1]);
        updatedStudent.coins = (student.coins || 0) + coinAmount;
      }
    } else if (item.effect.includes('Pet') && item.effect.includes('Speed')) {
      // Speed boosts are permanent and tracked in inventory
      // No need to apply here, already handled in calculatePetSpeed
    }

    // Remove item from inventory (or decrease quantity)
    updatedStudent.inventory = student.inventory.filter((invItem, index) => {
      if (invItem.id === item.id) {
        // Remove first occurrence
        return false;
      }
      return true;
    });

    // Add to usage history
    updatedStudent.itemUsageHistory = [
      ...(student.itemUsageHistory || []),
      {
        itemId: item.id,
        itemName: item.name,
        effect: item.effect,
        usedAt: new Date().toISOString()
      }
    ];

    return updatedStudent;
  }

  // ===============================================
  // CALLBACK SYSTEM
  // ===============================================

  /**
   * Register callback for level up events
   * @param {Function} callback - Callback function
   */
  onLevelUp(callback) {
    if (typeof callback === 'function') {
      this.levelUpCallbacks.push(callback);
    }
  }

  /**
   * Register callback for pet unlock events
   * @param {Function} callback - Callback function
   */
  onPetUnlock(callback) {
    if (typeof callback === 'function') {
      this.petUnlockCallbacks.push(callback);
    }
  }

  /**
   * Register callback for achievement unlock events
   * @param {Function} callback - Callback function
   */
  onAchievement(callback) {
    if (typeof callback === 'function') {
      this.achievementCallbacks.push(callback);
    }
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================

  /**
   * Reset student weekly points
   * @param {Object} student - Student to reset
   * @returns {Object} Updated student
   */
  resetWeeklyPoints(student) {
    return {
      ...student,
      weeklyPoints: 0,
      categoryWeekly: {},
      weeklyResetAt: new Date().toISOString()
    };
  }

  /**
   * Calculate student statistics
   * @param {Object} student - Student object
   * @returns {Object} Student statistics
   */
  getStudentStats(student) {
    const totalXP = student.totalPoints || 0;
    const level = calculateLevel(totalXP);
    const coins = calculateCoins(student);
    const levelProgress = this.getLevelProgress(student);

    return {
      totalXP,
      level,
      coins,
      levelProgress,
      achievements: student.achievements?.length || 0,
      ownedPets: student.ownedPets?.length || 0,
      ownedAvatars: student.ownedAvatars?.length || 0,
      questsCompleted: student.questsCompleted || 0,
      petWins: student.pet?.wins || 0,
      categoryBreakdown: student.categoryTotal || {},
      weeklyBreakdown: student.categoryWeekly || {}
    };
  }

  /**
   * Validate student data integrity
   * @param {Object} student - Student to validate
   * @returns {Object} Validated and corrected student data
   */
  validateStudentData(student) {
    const validated = { ...student };

    // Ensure required fields exist
    validated.totalPoints = validated.totalPoints || 0;
    validated.weeklyPoints = validated.weeklyPoints || 0;
    validated.categoryTotal = validated.categoryTotal || {};
    validated.categoryWeekly = validated.categoryWeekly || {};
    validated.coins = validated.coins || 0;
    validated.coinsSpent = validated.coinsSpent || 0;
    validated.inventory = validated.inventory || [];
    validated.ownedPets = validated.ownedPets || [];
    validated.ownedAvatars = validated.ownedAvatars || [];
    validated.logs = validated.logs || [];
    validated.achievements = validated.achievements || [];

    // Ensure level matches XP
    const correctLevel = calculateLevel(validated.totalPoints);
    if (validated.level !== correctLevel) {
      validated.level = correctLevel;
      validated.avatar = getAvatarImagePath(validated.avatarBase, correctLevel);
    }

    return validated;
  }
}

// Create and export singleton instance
const gameLogic = new GameLogicService();

export default gameLogic;