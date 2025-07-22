// services/firebaseService.js - Centralized Firebase Operations
// This service handles all Firebase database operations

import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';

class FirebaseService {
  constructor() {
    this.isSaving = false;
  }

  // ===============================================
  // CORE USER OPERATIONS
  // ===============================================

  /**
   * Get user document from Firestore
   * @param {string} userId - User ID
   * @returns {Object|null} User data or null if not found
   */
  async getUserData(userId) {
    if (!userId) return null;

    try {
      const docRef = doc(firestore, 'users', userId);
      const snap = await getDoc(docRef);
      
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to fetch user data');
    }
  }

  /**
   * Update user document in Firestore
   * @param {string} userId - User ID
   * @param {Object} userData - Data to update
   */
  async updateUserData(userId, userData) {
    if (!userId || this.isSaving) return;

    try {
      this.isSaving = true;
      const docRef = doc(firestore, 'users', userId);
      await setDoc(docRef, userData, { merge: true });
    } catch (error) {
      console.error('Error updating user data:', error);
      throw new Error('Failed to update user data');
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Create new user document
   * @param {string} userId - User ID
   * @param {Object} initialData - Initial user data
   */
  async createUser(userId, initialData) {
    if (!userId) return;

    const defaultUserData = {
      email: initialData.email || '',
      subscription: 'basic',
      classes: [],
      activeClassId: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        soundEnabled: true,
        theme: 'default',
        notifications: true
      },
      ...initialData
    };

    try {
      const docRef = doc(firestore, 'users', userId);
      await setDoc(docRef, defaultUserData);
      return defaultUserData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // ===============================================
  // CLASS OPERATIONS
  // ===============================================

  /**
   * Get specific class data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @returns {Object|null} Class data or null if not found
   */
  async getClassData(userId, classId) {
    if (!userId || !classId) return null;

    try {
      const userData = await this.getUserData(userId);
      if (!userData?.classes) return null;

      return userData.classes.find(cls => cls.id === classId) || null;
    } catch (error) {
      console.error('Error fetching class data:', error);
      throw new Error('Failed to fetch class data');
    }
  }

  /**
   * Update specific class data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} classData - Updated class data
   */
  async updateClassData(userId, classId, classData) {
    if (!userId || !classId || this.isSaving) return;

    try {
      this.isSaving = true;
      const userData = await this.getUserData(userId);
      if (!userData) throw new Error('User not found');

      const updatedClasses = userData.classes.map(cls => 
        cls.id === classId 
          ? { 
              ...cls, 
              ...classData,
              lastUpdated: new Date().toISOString()
            }
          : cls
      );

      await this.updateUserData(userId, { classes: updatedClasses });
    } catch (error) {
      console.error('Error updating class data:', error);
      throw new Error('Failed to update class data');
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Create new class
   * @param {string} userId - User ID
   * @param {Object} classData - New class data
   * @returns {Object} Created class data
   */
  async createClass(userId, classData) {
    if (!userId) throw new Error('User ID required');

    try {
      const newClass = {
        id: `class_${Date.now()}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        students: [],
        activeQuests: [],
        questTemplates: [],
        attendanceData: {},
        teacherRewards: [],
        groupData: {},
        classroomData: {},
        vocabularyData: [],
        ...classData
      };

      const userData = await this.getUserData(userId);
      if (!userData) throw new Error('User not found');

      const updatedClasses = [...(userData.classes || []), newClass];
      await this.updateUserData(userId, { 
        classes: updatedClasses,
        activeClassId: newClass.id 
      });

      return newClass;
    } catch (error) {
      console.error('Error creating class:', error);
      throw new Error('Failed to create class');
    }
  }

  /**
   * Delete class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID to delete
   */
  async deleteClass(userId, classId) {
    if (!userId || !classId) return;

    try {
      const userData = await this.getUserData(userId);
      if (!userData) throw new Error('User not found');

      const updatedClasses = userData.classes.filter(cls => cls.id !== classId);
      const updateData = { classes: updatedClasses };

      // If deleting active class, clear activeClassId
      if (userData.activeClassId === classId) {
        updateData.activeClassId = updatedClasses.length > 0 ? updatedClasses[0].id : null;
      }

      await this.updateUserData(userId, updateData);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw new Error('Failed to delete class');
    }
  }

  // ===============================================
  // STUDENT OPERATIONS
  // ===============================================

  /**
   * Save students to specific class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} students - Student data array
   */
  async saveStudents(userId, classId, students) {
    if (!userId || !classId || !Array.isArray(students)) return;

    try {
      await this.updateClassData(userId, classId, { students });
    } catch (error) {
      console.error('Error saving students:', error);
      throw new Error('Failed to save students');
    }
  }

  /**
   * Add new student to class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} studentData - New student data
   */
  async addStudent(userId, classId, studentData) {
    if (!userId || !classId || !studentData) return;

    try {
      const classData = await this.getClassData(userId, classId);
      if (!classData) throw new Error('Class not found');

      const newStudent = {
        id: `student_${Date.now()}`,
        createdAt: new Date().toISOString(),
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        coins: 0,
        coinsSpent: 0,
        inventory: [],
        ownedPets: [],
        ownedAvatars: [],
        rewardsPurchased: [],
        logs: [],
        ...studentData
      };

      const updatedStudents = [...(classData.students || []), newStudent];
      await this.saveStudents(userId, classId, updatedStudents);
      
      return newStudent;
    } catch (error) {
      console.error('Error adding student:', error);
      throw new Error('Failed to add student');
    }
  }

  /**
   * Update specific student
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID
   * @param {Object} studentData - Updated student data
   */
  async updateStudent(userId, classId, studentId, studentData) {
    if (!userId || !classId || !studentId) return;

    try {
      const classData = await this.getClassData(userId, classId);
      if (!classData) throw new Error('Class not found');

      const updatedStudents = classData.students.map(student =>
        student.id === studentId
          ? { ...student, ...studentData, lastUpdated: new Date().toISOString() }
          : student
      );

      await this.saveStudents(userId, classId, updatedStudents);
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Failed to update student');
    }
  }

  /**
   * Remove student from class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {string} studentId - Student ID to remove
   */
  async removeStudent(userId, classId, studentId) {
    if (!userId || !classId || !studentId) return;

    try {
      const classData = await this.getClassData(userId, classId);
      if (!classData) throw new Error('Class not found');

      const updatedStudents = classData.students.filter(student => student.id !== studentId);
      await this.saveStudents(userId, classId, updatedStudents);
    } catch (error) {
      console.error('Error removing student:', error);
      throw new Error('Failed to remove student');
    }
  }

  // ===============================================
  // QUEST OPERATIONS
  // ===============================================

  /**
   * Save quest data to class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} questData - Quest data including activeQuests, questTemplates, etc.
   */
  async saveQuestData(userId, classId, questData) {
    if (!userId || !classId) return;

    try {
      await this.updateClassData(userId, classId, questData);
    } catch (error) {
      console.error('Error saving quest data:', error);
      throw new Error('Failed to save quest data');
    }
  }

  /**
   * Save active quests
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} activeQuests - Active quests array
   */
  async saveActiveQuests(userId, classId, activeQuests) {
    if (!userId || !classId || !Array.isArray(activeQuests)) return;

    try {
      await this.updateClassData(userId, classId, { activeQuests });
    } catch (error) {
      console.error('Error saving active quests:', error);
      throw new Error('Failed to save active quests');
    }
  }

  /**
   * Save quest templates
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} questTemplates - Quest templates array
   */
  async saveQuestTemplates(userId, classId, questTemplates) {
    if (!userId || !classId || !Array.isArray(questTemplates)) return;

    try {
      await this.updateClassData(userId, classId, { questTemplates });
    } catch (error) {
      console.error('Error saving quest templates:', error);
      throw new Error('Failed to save quest templates');
    }
  }

  // ===============================================
  // OTHER CLASS DATA OPERATIONS
  // ===============================================

  /**
   * Save teacher rewards
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} teacherRewards - Teacher rewards array
   */
  async saveTeacherRewards(userId, classId, teacherRewards) {
    if (!userId || !classId || !Array.isArray(teacherRewards)) return;

    try {
      await this.updateClassData(userId, classId, { teacherRewards });
    } catch (error) {
      console.error('Error saving teacher rewards:', error);
      throw new Error('Failed to save teacher rewards');
    }
  }

  /**
   * Save attendance data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} attendanceData - Attendance data object
   */
  async saveAttendanceData(userId, classId, attendanceData) {
    if (!userId || !classId) return;

    try {
      await this.updateClassData(userId, classId, { attendanceData });
    } catch (error) {
      console.error('Error saving attendance data:', error);
      throw new Error('Failed to save attendance data');
    }
  }

  /**
   * Save group data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} groupData - Group data object
   */
  async saveGroupData(userId, classId, groupData) {
    if (!userId || !classId) return;

    try {
      await this.updateClassData(userId, classId, { groupData });
    } catch (error) {
      console.error('Error saving group data:', error);
      throw new Error('Failed to save group data');
    }
  }

  /**
   * Save classroom layout data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} classroomData - Classroom layout data
   */
  async saveClassroomData(userId, classId, classroomData) {
    if (!userId || !classId) return;

    try {
      await this.updateClassData(userId, classId, { classroomData });
    } catch (error) {
      console.error('Error saving classroom data:', error);
      throw new Error('Failed to save classroom data');
    }
  }

  /**
   * Save vocabulary data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Array} vocabularyData - Vocabulary data array
   */
  async saveVocabularyData(userId, classId, vocabularyData) {
    if (!userId || !classId || !Array.isArray(vocabularyData)) return;

    try {
      await this.updateClassData(userId, classId, { vocabularyData });
    } catch (error) {
      console.error('Error saving vocabulary data:', error);
      throw new Error('Failed to save vocabulary data');
    }
  }

  // ===============================================
  // SUBSCRIPTION OPERATIONS
  // ===============================================

  /**
   * Update user subscription status
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   */
  async updateSubscription(userId, subscriptionData) {
    if (!userId) return;

    try {
      await this.updateUserData(userId, {
        subscription: subscriptionData.status,
        subscriptionId: subscriptionData.subscriptionId,
        stripeCustomerId: subscriptionData.customerId,
        planType: subscriptionData.planType,
        subscriptionUpdatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Set active class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID to set as active
   */
  async setActiveClass(userId, classId) {
    if (!userId || !classId) return;

    try {
      await this.updateUserData(userId, { activeClassId: classId });
    } catch (error) {
      console.error('Error setting active class:', error);
      throw new Error('Failed to set active class');
    }
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   */
  async updatePreferences(userId, preferences) {
    if (!userId) return;

    try {
      const userData = await this.getUserData(userId);
      const updatedPreferences = { ...userData.preferences, ...preferences };
      await this.updateUserData(userId, { preferences: updatedPreferences });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================

  /**
   * Check if service is currently saving data
   * @returns {boolean} True if saving operation in progress
   */
  isSavingData() {
    return this.isSaving;
  }

  /**
   * Get last updated timestamp for class
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @returns {string|null} Last updated timestamp or null
   */
  async getLastUpdated(userId, classId) {
    try {
      const classData = await this.getClassData(userId, classId);
      return classData?.lastUpdated || null;
    } catch (error) {
      console.error('Error getting last updated:', error);
      return null;
    }
  }

  /**
   * Backup class data
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @returns {Object} Class data backup
   */
  async backupClassData(userId, classId) {
    try {
      const classData = await this.getClassData(userId, classId);
      if (!classData) throw new Error('Class not found');

      return {
        ...classData,
        backupTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error backing up class data:', error);
      throw new Error('Failed to backup class data');
    }
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();

export default firebaseService;