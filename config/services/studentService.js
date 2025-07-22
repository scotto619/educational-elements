// services/studentService.js - Centralized Student Management
// This service handles all student-related operations and data management

import { 
  getAllAvatars, 
  getAvatarImagePath, 
  getRandomPetName 
} from '../config/assets.js';
import { 
  GAME_CONFIG, 
  calculateLevel, 
  calculateCoins 
} from '../config/gameData.js';
import gameLogic from './gameLogic.js';
import firebaseService from './firebaseService.js';
import soundService from './soundService.js';

class StudentService {
  constructor() {
    this.eventListeners = {
      studentAdded: [],
      studentUpdated: [],
      studentRemoved: [],
      xpAwarded: [],
      levelUp: [],
      petUnlocked: []
    };
  }

  // ===============================================
  // STUDENT CREATION AND MANAGEMENT
  // ===============================================

  /**
   * Create a new student with default values
   * @param {string} firstName - Student's first name
   * @param {string} lastName - Student's last name (optional)
   * @param {string} avatarBase - Selected avatar base (optional)
   * @returns {Object} New student object
   */
  createStudent(firstName, lastName = '', avatarBase = null) {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }

    // Select random avatar if none provided
    const availableAvatars = getAllAvatars();
    const selectedAvatar = avatarBase || availableAvatars[Math.floor(Math.random() * availableAvatars.length)].base;

    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      
      // Avatar and appearance
      avatarBase: selectedAvatar,
      avatarLevel: 1,
      avatar: getAvatarImagePath(selectedAvatar, 1),
      
      // XP and progression
      totalPoints: 0,
      weeklyPoints: 0,
      level: 1,
      
      // Category tracking
      categoryTotal: {
        Respectful: 0,
        Responsible: 0,
        Learner: 0
      },
      categoryWeekly: {
        Respectful: 0,
        Responsible: 0,
        Learner: 0
      },
      
      // Currency and inventory
      coins: 0,
      coinsSpent: 0,
      inventory: [],
      
      // Collections
      ownedAvatars: [selectedAvatar],
      ownedPets: [],
      rewardsPurchased: [],
      achievements: [],
      
      // Pet system
      pet: null,
      
      // Activity tracking
      logs: [],
      questsCompleted: 0,
      loginStreak: 0,
      lastLoginDate: null,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      lastXpDate: null,
      lastUpdated: new Date().toISOString(),
      
      // Settings
      isActive: true,
      notes: '',
      
      // Statistics
      purchaseHistory: [],
      itemUsageHistory: [],
      lootBoxHistory: [],
      attendanceRecord: []
    };

    return gameLogic.validateStudentData(newStudent);
  }

  /**
   * Create multiple students from a list of names
   * @param {string} nameList - Newline-separated list of student names
   * @returns {Array} Array of new student objects
   */
  createStudentsFromList(nameList) {
    if (!nameList || nameList.trim().length === 0) {
      throw new Error('Name list cannot be empty');
    }

    const names = nameList
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) {
      throw new Error('No valid names found in list');
    }

    return names.map(name => {
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      return this.createStudent(firstName, lastName);
    });
  }

  /**
   * Update student data with validation
   * @param {Object} student - Current student data
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated student data
   */
  updateStudent(student, updates) {
    if (!student || !student.id) {
      throw new Error('Invalid student data');
    }

    const updatedStudent = {
      ...student,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // Validate and correct data
    return gameLogic.validateStudentData(updatedStudent);
  }

  /**
   * Award XP to a student and handle all side effects
   * @param {Object} student - Student to award XP to
   * @param {string} category - XP category
   * @param {number} amount - XP amount
   * @param {string} source - Source of XP (manual, quest, etc.)
   * @returns {Object} Updated student with XP changes
   */
  async awardXP(student, category, amount, source = 'manual') {
    if (!student || !category || !amount) {
      throw new Error('Invalid XP award parameters');
    }

    try {
      // Use game logic to award XP
      const updatedStudent = gameLogic.awardXP(student, category, amount);
      
      // Add source to the latest log entry
      if (updatedStudent.logs.length > 0) {
        const latestLog = updatedStudent.logs[updatedStudent.logs.length - 1];
        latestLog.source = source;
      }

      // Trigger events
      this.emit('xpAwarded', {
        studentId: student.id,
        category,
        amount,
        source,
        student: updatedStudent
      });

      // Check for level up
      const oldLevel = calculateLevel(student.totalPoints || 0);
      const newLevel = calculateLevel(updatedStudent.totalPoints);
      if (newLevel > oldLevel) {
        this.emit('levelUp', {
          studentId: student.id,
          oldLevel,
          newLevel,
          student: updatedStudent
        });
      }

      // Check for pet unlock
      if (!student.pet?.image && updatedStudent.pet?.image) {
        this.emit('petUnlocked', {
          studentId: student.id,
          pet: updatedStudent.pet,
          student: updatedStudent
        });
      }

      return updatedStudent;
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw new Error(`Failed to award XP: ${error.message}`);
    }
  }

  /**
   * Bulk award XP to multiple students
   * @param {Array} students - Array of all students
   * @param {Array} selectedIds - IDs of students to award XP to
   * @param {string} category - XP category
   * @param {number} amount - XP amount per student
   * @param {string} source - Source of XP
   * @returns {Array} Updated students array
   */
  async bulkAwardXP(students, selectedIds, category, amount, source = 'manual') {
    if (!Array.isArray(students) || !Array.isArray(selectedIds)) {
      throw new Error('Invalid bulk XP parameters');
    }

    const updatedStudents = [];
    
    for (const student of students) {
      if (selectedIds.includes(student.id)) {
        try {
          const updated = await this.awardXP(student, category, amount, source);
          updatedStudents.push(updated);
        } catch (error) {
          console.error(`Error awarding XP to student ${student.id}:`, error);
          updatedStudents.push(student); // Keep original on error
        }
      } else {
        updatedStudents.push(student);
      }
    }

    return updatedStudents;
  }

  // ===============================================
  // AVATAR AND APPEARANCE MANAGEMENT
  // ===============================================

  /**
   * Change student's avatar
   * @param {Object} student - Student to update
   * @param {string} newAvatarBase - New avatar base name
   * @returns {Object} Updated student with new avatar
   */
  changeAvatar(student, newAvatarBase) {
    if (!student || !newAvatarBase) {
      throw new Error('Invalid avatar change parameters');
    }

    const currentLevel = calculateLevel(student.totalPoints || 0);
    const newAvatar = getAvatarImagePath(newAvatarBase, currentLevel);

    const updatedStudent = {
      ...student,
      avatarBase: newAvatarBase,
      avatar: newAvatar,
      lastUpdated: new Date().toISOString()
    };

    // Add to owned avatars if not already owned
    if (!student.ownedAvatars?.includes(newAvatarBase)) {
      updatedStudent.ownedAvatars = [
        ...(student.ownedAvatars || []),
        newAvatarBase
      ];
    }

    return updatedStudent;
  }

  /**
   * Assign pet to student
   * @param {Object} student - Student to update
   * @param {Object} pet - Pet to assign
   * @param {string} customName - Custom name for the pet (optional)
   * @returns {Object} Updated student with pet
   */
  assignPet(student, pet, customName = null) {
    if (!student || !pet) {
      throw new Error('Invalid pet assignment parameters');
    }

    const petName = customName || pet.name || getRandomPetName();
    const assignedPet = {
      ...pet,
      name: petName,
      assignedAt: new Date().toISOString()
    };

    const updatedStudent = {
      ...student,
      pet: assignedPet,
      lastUpdated: new Date().toISOString()
    };

    // Add to owned pets if not already owned
    const isAlreadyOwned = student.ownedPets?.some(ownedPet => 
      ownedPet.id === pet.id || ownedPet.name === pet.name
    );

    if (!isAlreadyOwned) {
      updatedStudent.ownedPets = [
        ...(student.ownedPets || []),
        assignedPet
      ];
    }

    return updatedStudent;
  }

  // ===============================================
  // STATISTICS AND REPORTING
  // ===============================================

  /**
   * Get comprehensive student statistics
   * @param {Object} student - Student to analyze
   * @returns {Object} Detailed statistics
   */
  getStudentStatistics(student) {
    if (!student) return null;

    const baseStats = gameLogic.getStudentStats(student);
    
    // Add additional statistics
    const additionalStats = {
      // Time-based stats
      daysSinceCreated: Math.floor(
        (new Date() - new Date(student.createdAt)) / (1000 * 60 * 60 * 24)
      ),
      daysSinceLastXP: student.lastXpDate ? Math.floor(
        (new Date() - new Date(student.lastXpDate)) / (1000 * 60 * 60 * 24)
      ) : null,
      
      // Activity stats
      totalLogEntries: student.logs?.length || 0,
      averageXPPerLog: student.logs?.length > 0 ? 
        Math.round((student.totalPoints || 0) / student.logs.length) : 0,
      
      // Spending stats
      coinsEarned: Math.floor((student.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student.coins || 0),
      coinsSpent: student.coinsSpent || 0,
      coinsAvailable: calculateCoins(student),
      spendingRate: (student.coinsSpent || 0) > 0 ? 
        Math.round(((student.coinsSpent || 0) / (Math.floor((student.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student.coins || 0))) * 100) : 0,
      
      // Collection stats
      itemsPurchased: student.purchaseHistory?.length || 0,
      itemsUsed: student.itemUsageHistory?.length || 0,
      lootBoxesOpened: student.lootBoxHistory?.length || 0,
      
      // Engagement stats
      categoriesActive: Object.values(student.categoryTotal || {}).filter(xp => xp > 0).length,
      mostActiveCategory: this.getMostActiveCategory(student),
      xpPerCategory: student.categoryTotal || {},
      
      // Attendance
      attendanceRate: this.calculateAttendanceRate(student),
      recentActivity: this.getRecentActivity(student)
    };

    return { ...baseStats, ...additionalStats };
  }

  /**
   * Get student's most active XP category
   * @param {Object} student - Student to analyze
   * @returns {string|null} Most active category name
   */
  getMostActiveCategory(student) {
    if (!student.categoryTotal) return null;

    let maxCategory = null;
    let maxXP = 0;

    Object.entries(student.categoryTotal).forEach(([category, xp]) => {
      if (xp > maxXP) {
        maxXP = xp;
        maxCategory = category;
      }
    });

    return maxCategory;
  }

  /**
   * Calculate student's attendance rate
   * @param {Object} student - Student to analyze
   * @returns {number} Attendance rate percentage
   */
  calculateAttendanceRate(student) {
    if (!student.attendanceRecord || student.attendanceRecord.length === 0) {
      return 0;
    }

    const totalDays = student.attendanceRecord.length;
    const presentDays = student.attendanceRecord.filter(record => record.status === 'present').length;
    
    return Math.round((presentDays / totalDays) * 100);
  }

  /**
   * Get recent activity summary
   * @param {Object} student - Student to analyze
   * @param {number} days - Number of days to look back (default 7)
   * @returns {Object} Recent activity summary
   */
  getRecentActivity(student, days = 7) {
    if (!student.logs) return { xpEarned: 0, logCount: 0, categories: {} };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = student.logs.filter(log => 
      new Date(log.date) >= cutoffDate
    );

    const xpEarned = recentLogs.reduce((total, log) => total + log.amount, 0);
    const categories = {};

    recentLogs.forEach(log => {
      categories[log.type] = (categories[log.type] || 0) + log.amount;
    });

    return {
      xpEarned,
      logCount: recentLogs.length,
      categories
    };
  }

  // ===============================================
  // DATA MANAGEMENT
  // ===============================================

  /**
   * Reset student's weekly points
   * @param {Object} student - Student to reset
   * @returns {Object} Updated student with reset weekly points
   */
  resetWeeklyPoints(student) {
    return gameLogic.resetWeeklyPoints(student);
  }

  /**
   * Reset all student progress (careful!)
   * @param {Object} student - Student to reset
   * @param {Object} options - Reset options
   * @returns {Object} Reset student data
   */
  resetStudentProgress(student, options = {}) {
    if (!student) throw new Error('Student is required');

    const resetData = {
      totalPoints: options.keepXP ? student.totalPoints : 0,
      weeklyPoints: 0,
      level: options.keepXP ? student.level : 1,
      categoryTotal: options.keepXP ? student.categoryTotal : { Respectful: 0, Responsible: 0, Learner: 0 },
      categoryWeekly: { Respectful: 0, Responsible: 0, Learner: 0 },
      coins: options.keepCoins ? student.coins : 0,
      coinsSpent: options.keepCoins ? student.coinsSpent : 0,
      inventory: options.keepInventory ? student.inventory : [],
      ownedAvatars: options.keepAvatars ? student.ownedAvatars : [student.avatarBase],
      ownedPets: options.keepPets ? student.ownedPets : [],
      achievements: options.keepAchievements ? student.achievements : [],
      logs: options.keepLogs ? student.logs : [],
      questsCompleted: options.keepQuests ? student.questsCompleted : 0,
      resetAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    if (!options.keepXP) {
      resetData.avatar = getAvatarImagePath(student.avatarBase, 1);
      resetData.pet = null;
    }

    return { ...student, ...resetData };
  }

  /**
   * Export student data for backup or transfer
   * @param {Object} student - Student to export
   * @returns {Object} Exportable student data
   */
  exportStudentData(student) {
    if (!student) return null;

    return {
      ...student,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  /**
   * Import student data from backup
   * @param {Object} exportedData - Previously exported student data
   * @returns {Object} Imported and validated student data
   */
  importStudentData(exportedData) {
    if (!exportedData || !exportedData.id) {
      throw new Error('Invalid import data');
    }

    // Remove export metadata
    const { exportedAt, version, ...studentData } = exportedData;
    
    // Update import timestamp
    studentData.importedAt = new Date().toISOString();
    studentData.lastUpdated = new Date().toISOString();

    // Validate and return
    return gameLogic.validateStudentData(studentData);
  }

  // ===============================================
  // EVENT SYSTEM
  // ===============================================

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.eventListeners[event] && typeof callback === 'function') {
      this.eventListeners[event].push(callback);
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }

  // ===============================================
  // INTEGRATION WITH OTHER SERVICES
  // ===============================================

  /**
   * Save student data to Firebase
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} students - Array of students to save
   */
  async saveToFirebase(userId, classId, students) {
    try {
      await firebaseService.saveStudents(userId, classId, students);
    } catch (error) {
      console.error('Error saving students to Firebase:', error);
      throw new Error('Failed to save students');
    }
  }

  /**
   * Process shop purchase for student
   * @param {Object} student - Student making purchase
   * @param {Object} item - Item to purchase
   * @returns {Object} Updated student after purchase
   */
  processPurchase(student, item) {
    try {
      const updatedStudent = gameLogic.processPurchase(student, item);
      
      this.emit('studentUpdated', {
        studentId: student.id,
        student: updatedStudent,
        action: 'purchase',
        item: item
      });

      return updatedStudent;
    } catch (error) {
      console.error('Error processing purchase:', error);
      throw error;
    }
  }

  /**
   * Use consumable item for student
   * @param {Object} student - Student using item
   * @param {Object} item - Consumable item
   * @returns {Object} Updated student after using item
   */
  useConsumable(student, item) {
    try {
      const updatedStudent = gameLogic.useConsumable(student, item);
      
      this.emit('studentUpdated', {
        studentId: student.id,
        student: updatedStudent,
        action: 'use_item',
        item: item
      });

      return updatedStudent;
    } catch (error) {
      console.error('Error using consumable:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const studentService = new StudentService();

export default studentService;