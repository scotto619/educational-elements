// services/questService.js - Centralized Quest Management
// This service handles quest creation, completion, tracking, and quest giver interactions

import { QUEST_GIVERS, DEFAULT_QUEST_TEMPLATES } from '../gameData.js';
import studentService from './studentService.js';
import firebaseService from './firebaseService.js';
import soundService from './soundService.js';

class QuestService {
  constructor() {
    this.eventListeners = {
      questCreated: [],
      questCompleted: [],
      questExpired: [],
      questUpdated: []
    };
  }

  // ===============================================
  // QUEST CREATION AND MANAGEMENT
  // ===============================================

  /**
   * Create a new quest
   * @param {Object} questData - Quest creation data
   * @returns {Object} New quest object
   */
  createQuest(questData) {
    const {
      title,
      description,
      type = 'custom',
      xpReward = 5,
      coinReward = 0,
      category = 'Learner',
      questGiverId = 'guide1',
      targetStudents = [],
      duration = 24, // hours
      isClassQuest = false,
      requirements = {},
      difficulty = 'easy'
    } = questData;

    if (!title || !description) {
      throw new Error('Quest title and description are required');
    }

    const questGiver = this.getQuestGiver(questGiverId);
    if (!questGiver) {
      throw new Error('Invalid quest giver ID');
    }

    const newQuest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      type,
      
      // Rewards
      xpReward: Math.max(1, parseInt(xpReward)),
      coinReward: Math.max(0, parseInt(coinReward)),
      category,
      
      // Quest giver
      questGiverId,
      questGiverName: questGiver.name,
      questGiverImage: questGiver.imagePath || questGiver.image,
      
      // Targeting
      targetStudents: Array.isArray(targetStudents) ? targetStudents : [],
      isClassQuest,
      
      // Timing
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (duration * 60 * 60 * 1000)).toISOString(),
      duration,
      
      // Status tracking
      status: 'active',
      completedBy: [],
      startedBy: [],
      
      // Configuration
      requirements,
      difficulty,
      autoComplete: false,
      allowPartialCredit: false,
      
      // Statistics
      timesCompleted: 0,
      averageCompletionTime: 0,
      
      // Metadata
      tags: [],
      notes: '',
      lastUpdated: new Date().toISOString()
    };

    this.emit('questCreated', { quest: newQuest });
    return newQuest;
  }

  /**
   * Create quest from template
   * @param {Object} template - Quest template
   * @param {Object} overrides - Values to override from template
   * @returns {Object} New quest based on template
   */
  createQuestFromTemplate(template, overrides = {}) {
    if (!template) {
      throw new Error('Quest template is required');
    }

    const questData = {
      ...template,
      ...overrides,
      // Remove template-specific fields
      id: undefined,
      createdAt: undefined,
      lastUpdated: undefined
    };

    return this.createQuest(questData);
  }

  /**
   * Update existing quest
   * @param {Object} quest - Quest to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated quest
   */
  updateQuest(quest, updates) {
    if (!quest || !quest.id) {
      throw new Error('Invalid quest data');
    }

    const updatedQuest = {
      ...quest,
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    // Validate quest giver if changed
    if (updates.questGiverId && updates.questGiverId !== quest.questGiverId) {
      const questGiver = this.getQuestGiver(updates.questGiverId);
      if (questGiver) {
        updatedQuest.questGiverName = questGiver.name;
        updatedQuest.questGiverImage = questGiver.imagePath || questGiver.image;
      }
    }

    this.emit('questUpdated', { quest: updatedQuest, oldQuest: quest });
    return updatedQuest;
  }

  /**
   * Delete quest
   * @param {Array} activeQuests - Array of active quests
   * @param {string} questId - ID of quest to delete
   * @returns {Array} Updated quests array without deleted quest
   */
  deleteQuest(activeQuests, questId) {
    if (!Array.isArray(activeQuests) || !questId) {
      throw new Error('Invalid delete quest parameters');
    }

    return activeQuests.filter(quest => quest.id !== questId);
  }

  // ===============================================
  // QUEST COMPLETION
  // ===============================================

  /**
   * Complete quest for a student
   * @param {Object} quest - Quest to complete
   * @param {Object} student - Student completing quest
   * @param {Object} completionData - Additional completion data
   * @returns {Object} Completion result with updated student and quest
   */
  completeQuest(quest, student, completionData = {}) {
    if (!quest || !student) {
      throw new Error('Quest and student are required');
    }

    // Check if quest is still active
    if (quest.status !== 'active') {
      throw new Error('Quest is not active');
    }

    // Check if student already completed this quest
    if (quest.completedBy.some(completion => completion.studentId === student.id)) {
      throw new Error('Student has already completed this quest');
    }

    // Check if quest has expired
    if (new Date() > new Date(quest.expiresAt)) {
      throw new Error('Quest has expired');
    }

    const completionTime = new Date().toISOString();
    
    // Award XP and coins to student
    let updatedStudent = { ...student };
    
    if (quest.xpReward > 0) {
      updatedStudent = studentService.awardXP(
        updatedStudent, 
        quest.category, 
        quest.xpReward, 
        'quest'
      );
    }
    
    if (quest.coinReward > 0) {
      updatedStudent.coins = (updatedStudent.coins || 0) + quest.coinReward;
    }

    // Update quest completion count
    updatedStudent.questsCompleted = (updatedStudent.questsCompleted || 0) + 1;

    // Create completion record
    const completion = {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      completedAt: completionTime,
      xpAwarded: quest.xpReward,
      coinsAwarded: quest.coinReward,
      completionNotes: completionData.notes || '',
      completionTime: this.calculateCompletionTime(quest.createdAt, completionTime)
    };

    // Update quest
    const updatedQuest = {
      ...quest,
      completedBy: [...quest.completedBy, completion],
      timesCompleted: quest.timesCompleted + 1,
      lastUpdated: new Date().toISOString()
    };

    // Update average completion time
    const totalCompletionTime = updatedQuest.completedBy.reduce(
      (sum, c) => sum + c.completionTime, 0
    );
    updatedQuest.averageCompletionTime = Math.round(
      totalCompletionTime / updatedQuest.completedBy.length
    );

    // Play completion sound
    soundService.playQuestCompleteSound();

    // Emit completion event
    this.emit('questCompleted', {
      quest: updatedQuest,
      student: updatedStudent,
      completion
    });

    return {
      quest: updatedQuest,
      student: updatedStudent,
      completion
    };
  }

  /**
   * Complete quest for multiple students (class quest)
   * @param {Object} quest - Quest to complete
   * @param {Array} students - Students completing quest
   * @param {Object} completionData - Additional completion data
   * @returns {Object} Completion results
   */
  completeQuestForClass(quest, students, completionData = {}) {
    if (!quest || !Array.isArray(students)) {
      throw new Error('Quest and students array are required');
    }

    const results = {
      updatedQuest: { ...quest },
      updatedStudents: [],
      completions: [],
      errors: []
    };

    // Complete quest for each student
    students.forEach(student => {
      try {
        const result = this.completeQuest(results.updatedQuest, student, completionData);
        results.updatedQuest = result.quest;
        results.updatedStudents.push(result.student);
        results.completions.push(result.completion);
      } catch (error) {
        results.errors.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          error: error.message
        });
      }
    });

    return results;
  }

  /**
   * Mark quest as started by student
   * @param {Object} quest - Quest to start
   * @param {Object} student - Student starting quest
   * @returns {Object} Updated quest with started record
   */
  startQuest(quest, student) {
    if (!quest || !student) {
      throw new Error('Quest and student are required');
    }

    // Check if already started
    if (quest.startedBy.some(start => start.studentId === student.id)) {
      return quest; // Already started
    }

    const startRecord = {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      startedAt: new Date().toISOString()
    };

    return {
      ...quest,
      startedBy: [...quest.startedBy, startRecord],
      lastUpdated: new Date().toISOString()
    };
  }

  // ===============================================
  // QUEST TEMPLATES
  // ===============================================

  /**
   * Create new quest template
   * @param {Object} templateData - Template data
   * @returns {Object} New quest template
   */
  createQuestTemplate(templateData) {
    const {
      title,
      description,
      type = 'custom',
      xpReward = 5,
      coinReward = 0,
      category = 'Learner',
      questGiverId = 'guide1',
      duration = 24,
      difficulty = 'easy',
      tags = []
    } = templateData;

    if (!title || !description) {
      throw new Error('Template title and description are required');
    }

    return {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      type,
      xpReward: Math.max(1, parseInt(xpReward)),
      coinReward: Math.max(0, parseInt(coinReward)),
      category,
      questGiverId,
      duration,
      difficulty,
      tags: Array.isArray(tags) ? tags : [],
      isTemplate: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      lastUsed: null
    };
  }

  /**
   * Update quest template
   * @param {Object} template - Template to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Updated template
   */
  updateQuestTemplate(template, updates) {
    if (!template || !template.id) {
      throw new Error('Invalid template data');
    }

    return {
      ...template,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Delete quest template
   * @param {Array} templates - Array of templates
   * @param {string} templateId - ID of template to delete
   * @returns {Array} Updated templates array
   */
  deleteQuestTemplate(templates, templateId) {
    if (!Array.isArray(templates) || !templateId) {
      throw new Error('Invalid delete template parameters');
    }

    return templates.filter(template => template.id !== templateId);
  }

  /**
   * Use quest template (increment usage count)
   * @param {Object} template - Template being used
   * @returns {Object} Updated template with usage stats
   */
  useQuestTemplate(template) {
    if (!template) return template;

    return {
      ...template,
      usageCount: (template.usageCount || 0) + 1,
      lastUsed: new Date().toISOString()
    };
  }

  // ===============================================
  // QUEST GIVERS
  // ===============================================

  /**
   * Get quest giver by ID
   * @param {string} questGiverId - Quest giver ID
   * @returns {Object|null} Quest giver data or null if not found
   */
  getQuestGiver(questGiverId) {
    return QUEST_GIVERS.find(giver => giver.id === questGiverId) || null;
  }

  /**
   * Get all available quest givers
   * @returns {Array} Array of quest givers
   */
  getAllQuestGivers() {
    return QUEST_GIVERS;
  }

  /**
   * Get random quest giver greeting
   * @param {string} questGiverId - Quest giver ID
   * @returns {string} Random greeting message
   */
  getRandomGreeting(questGiverId) {
    const giver = this.getQuestGiver(questGiverId);
    if (!giver || !giver.greetings) {
      return "Welcome, brave adventurer!";
    }

    const greetings = giver.greetings;
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  /**
   * Get random quest giver tip
   * @param {string} questGiverId - Quest giver ID
   * @returns {string} Random tip message
   */
  getRandomTip(questGiverId) {
    const giver = this.getQuestGiver(questGiverId);
    if (!giver || !giver.tips) {
      return "💡 Tip: Stay focused and do your best!";
    }

    const tips = giver.tips;
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // ===============================================
  // QUEST FILTERING AND SEARCHING
  // ===============================================

  /**
   * Get quests available to a student
   * @param {Array} activeQuests - All active quests
   * @param {Object} student - Student to check
   * @returns {Array} Quests available to the student
   */
  getAvailableQuests(activeQuests, student) {
    if (!Array.isArray(activeQuests) || !student) {
      return [];
    }

    return activeQuests.filter(quest => {
      // Check if quest is active
      if (quest.status !== 'active') return false;

      // Check if quest has expired
      if (new Date() > new Date(quest.expiresAt)) return false;

      // Check if student already completed
      if (quest.completedBy.some(c => c.studentId === student.id)) return false;

      // Check targeting
      if (quest.isClassQuest) return true;
      if (quest.targetStudents.length === 0) return true;
      if (quest.targetStudents.includes(student.id)) return true;

      return false;
    });
  }

  /**
   * Get completed quests for a student
   * @param {Array} activeQuests - All active quests
   * @param {Object} student - Student to check
   * @returns {Array} Completed quests with completion data
   */
  getCompletedQuests(activeQuests, student) {
    if (!Array.isArray(activeQuests) || !student) {
      return [];
    }

    const completed = [];

    activeQuests.forEach(quest => {
      const completion = quest.completedBy.find(c => c.studentId === student.id);
      if (completion) {
        completed.push({
          ...quest,
          completion
        });
      }
    });

    return completed.sort((a, b) => 
      new Date(b.completion.completedAt) - new Date(a.completion.completedAt)
    );
  }

  /**
   * Filter quests by criteria
   * @param {Array} quests - Quests to filter
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered quests
   */
  filterQuests(quests, filters = {}) {
    if (!Array.isArray(quests)) return [];

    let filtered = [...quests];

    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(quest => quest.status === filters.status);
    }

    // Filter by quest giver
    if (filters.questGiverId) {
      filtered = filtered.filter(quest => quest.questGiverId === filters.questGiverId);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(quest => quest.category === filters.category);
    }

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(quest => quest.type === filters.type);
    }

    // Filter by difficulty
    if (filters.difficulty) {
      filtered = filtered.filter(quest => quest.difficulty === filters.difficulty);
    }

    // Filter by expiration
    if (filters.hideExpired) {
      const now = new Date();
      filtered = filtered.filter(quest => new Date(quest.expiresAt) > now);
    }

    // Filter by completion status
    if (filters.studentId) {
      if (filters.completed === true) {
        filtered = filtered.filter(quest => 
          quest.completedBy.some(c => c.studentId === filters.studentId)
        );
      } else if (filters.completed === false) {
        filtered = filtered.filter(quest => 
          !quest.completedBy.some(c => c.studentId === filters.studentId)
        );
      }
    }

    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(quest => 
        quest.title.toLowerCase().includes(searchTerm) ||
        quest.description.toLowerCase().includes(searchTerm) ||
        quest.questGiverName.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }

  // ===============================================
  // QUEST ANALYTICS
  // ===============================================

  /**
   * Get quest completion statistics
   * @param {Array} activeQuests - All active quests
   * @returns {Object} Quest completion statistics
   */
  getQuestStatistics(activeQuests) {
    if (!Array.isArray(activeQuests)) {
      return { totalQuests: 0, completedQuests: 0, activeQuests: 0, expiredQuests: 0 };
    }

    const now = new Date();
    const stats = {
      totalQuests: activeQuests.length,
      completedQuests: 0,
      activeQuests: 0,
      expiredQuests: 0,
      totalCompletions: 0,
      averageCompletionTime: 0,
      categoryCounts: {},
      questGiverCounts: {},
      difficultyCounts: {}
    };

    let totalCompletionTime = 0;
    let totalCompletions = 0;

    activeQuests.forEach(quest => {
      // Count by status
      if (quest.status === 'active' && new Date(quest.expiresAt) > now) {
        stats.activeQuests++;
      } else if (new Date(quest.expiresAt) <= now) {
        stats.expiredQuests++;
      }

      // Count completions
      const completions = quest.completedBy.length;
      totalCompletions += completions;
      
      if (completions > 0) {
        stats.completedQuests++;
        totalCompletionTime += quest.averageCompletionTime * completions;
      }

      // Count by category
      stats.categoryCounts[quest.category] = (stats.categoryCounts[quest.category] || 0) + 1;

      // Count by quest giver
      stats.questGiverCounts[quest.questGiverName] = (stats.questGiverCounts[quest.questGiverName] || 0) + 1;

      // Count by difficulty
      stats.difficultyCounts[quest.difficulty] = (stats.difficultyCounts[quest.difficulty] || 0) + 1;
    });

    stats.totalCompletions = totalCompletions;
    stats.averageCompletionTime = totalCompletions > 0 ? 
      Math.round(totalCompletionTime / totalCompletions) : 0;

    return stats;
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================

  /**
   * Calculate completion time in minutes
   * @param {string} createdAt - Quest creation timestamp
   * @param {string} completedAt - Quest completion timestamp
   * @returns {number} Completion time in minutes
   */
  calculateCompletionTime(createdAt, completedAt) {
    const created = new Date(createdAt);
    const completed = new Date(completedAt);
    return Math.round((completed - created) / (1000 * 60)); // Convert to minutes
  }

  /**
   * Check if quest has expired
   * @param {Object} quest - Quest to check
   * @returns {boolean} True if quest has expired
   */
  isQuestExpired(quest) {
    return quest && new Date() > new Date(quest.expiresAt);
  }

  /**
   * Extend quest expiration time
   * @param {Object} quest - Quest to extend
   * @param {number} additionalHours - Hours to add to expiration
   * @returns {Object} Updated quest with new expiration
   */
  extendQuest(quest, additionalHours) {
    if (!quest || additionalHours <= 0) {
      throw new Error('Invalid quest extension parameters');
    }

    const newExpirationTime = new Date(quest.expiresAt);
    newExpirationTime.setHours(newExpirationTime.getHours() + additionalHours);

    return {
      ...quest,
      expiresAt: newExpirationTime.toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get default quest templates
   * @returns {Array} Default quest templates
   */
  getDefaultTemplates() {
    return DEFAULT_QUEST_TEMPLATES;
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
  // FIREBASE INTEGRATION
  // ===============================================

  /**
   * Save quest data to Firebase
   * @param {string} userId - User ID
   * @param {string} classId - Class ID
   * @param {Object} questData - Quest data to save
   */
  async saveToFirebase(userId, classId, questData) {
    try {
      await firebaseService.saveQuestData(userId, classId, questData);
    } catch (error) {
      console.error('Error saving quest data to Firebase:', error);
      throw new Error('Failed to save quest data');
    }
  }
}

// Create and export singleton instance
const questService = new QuestService();

export default questService;