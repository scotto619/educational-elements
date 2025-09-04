// pages/api/mystery-box.js - API ENDPOINT FOR MYSTERY BOX OPERATIONS
import { adminFirestore } from '../utils/firebase-admin';
import { 
  getMysteryBoxPrizes, 
  selectRandomPrize, 
  getItemRarity,
  MYSTERY_BOX_PRICE 
} from '../utils/mysteryBox';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      action,
      teacherUserId,
      classId,
      studentId,
      boxType = 'standard',
      classCode
    } = req.body;

    // Validate required fields
    if (!teacherUserId || !classId || !studentId || !action) {
      return res.status(400).json({ 
        error: 'Missing required fields: teacherUserId, classId, studentId, action' 
      });
    }

    // Get teacher data
    const teacherRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherRef.get();

    if (!teacherDoc.exists) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherData = teacherDoc.data();
    const targetClass = teacherData.classes?.find(cls => cls.id === classId);

    if (!targetClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Verify class code if provided
    if (classCode && targetClass.classCode !== classCode) {
      return res.status(403).json({ error: 'Invalid class code' });
    }

    // Find student
    const student = targetClass.students?.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    switch (action) {
      case 'open':
        return await handleOpenMysteryBox(req, res, {
          teacherRef,
          teacherData,
          targetClass,
          student,
          boxType
        });
        
      case 'award':
        return await handleAwardMysteryBox(req, res, {
          teacherRef,
          teacherData,
          targetClass,
          student,
          prizeData: req.body.prizeData
        });
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Mystery Box API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Handle opening a mystery box and selecting a prize
 */
async function handleOpenMysteryBox(req, res, { teacherRef, teacherData, targetClass, student, boxType }) {
  try {
    // Define box configurations
    const boxConfigs = {
      standard: {
        price: 10,
        name: 'Mystery Box'
      },
      rare: {
        price: 25,
        name: 'Rare Mystery Box',
        customWeights: {
          common: 30,
          uncommon: 35,
          rare: 25,
          epic: 8,
          legendary: 2
        }
      },
      epic: {
        price: 50,
        name: 'Epic Mystery Box',
        customWeights: {
          common: 0,
          uncommon: 0,
          rare: 40,
          epic: 50,
          legendary: 10
        }
      }
    };

    const boxConfig = boxConfigs[boxType] || boxConfigs.standard;
    
    // Calculate student's current coins
    const studentCoins = Math.max(0, 
      Math.floor((student?.totalPoints || 0) / 5) + 
      (student?.currency || 0) - 
      (student?.coinsSpent || 0)
    );

    // Check if student has enough coins
    if (studentCoins < boxConfig.price) {
      return res.status(400).json({ 
        error: 'Insufficient coins',
        required: boxConfig.price,
        available: studentCoins
      });
    }

    // Get prize pool from shop items and rewards
    const shopAvatars = [
      // Add your SHOP_BASIC_AVATARS and SHOP_PREMIUM_AVATARS here
      // For brevity, using a simplified list - you should import from your constants
    ];
    
    const shopPets = [
      // Add your SHOP_BASIC_PETS and SHOP_PREMIUM_PETS here
    ];

    // Get class rewards
    const classRewards = targetClass.classRewards || [];

    // Generate prize pool
    const prizes = getMysteryBoxPrizes({
      avatars: shopAvatars,
      pets: shopPets,
      rewards: classRewards,
      includeXP: true,
      includeCurrency: true
    });

    // Select random prize
    let selectedPrize;
    if (boxConfig.customWeights) {
      // Use custom weights for special boxes
      const weightedPrizes = [];
      prizes.forEach(prize => {
        const weight = boxConfig.customWeights[prize.rarity] || 1;
        for (let i = 0; i < weight; i++) {
          weightedPrizes.push(prize);
        }
      });
      const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
      selectedPrize = weightedPrizes[randomIndex];
    } else {
      selectedPrize = selectRandomPrize(prizes);
    }

    // Update student data - deduct coins
    const updatedStudents = targetClass.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          coinsSpent: (s.coinsSpent || 0) + boxConfig.price,
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    });

    const updatedClasses = teacherData.classes.map(cls =>
      cls.id === targetClass.id 
        ? { ...cls, students: updatedStudents }
        : cls
    );

    await teacherRef.update({ classes: updatedClasses });

    return res.status(200).json({
      success: true,
      prize: selectedPrize,
      boxType: boxType,
      coinsDeducted: boxConfig.price,
      remainingCoins: studentCoins - boxConfig.price
    });

  } catch (error) {
    console.error('Error opening mystery box:', error);
    throw error;
  }
}

/**
 * Handle awarding a mystery box prize to a student
 */
async function handleAwardMysteryBox(req, res, { teacherRef, teacherData, targetClass, student, prizeData }) {
  try {
    let updatedStudent = { ...student };
    let message = '';

    switch (prizeData.type) {
      case 'avatar':
        if (!student.ownedAvatars?.includes(prizeData.item.name)) {
          updatedStudent.ownedAvatars = [...new Set([...(student.ownedAvatars || []), prizeData.item.name])];
          message = `Won the ${prizeData.item.name} avatar!`;
        } else {
          // Already owned, give coins instead
          updatedStudent.currency = (student.currency || 0) + 5;
          message = `Already had the ${prizeData.item.name} avatar, got 5 bonus coins instead!`;
        }
        break;
        
      case 'pet':
        const newPet = { 
          ...prizeData.item, 
          id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
        };
        updatedStudent.ownedPets = [...(student.ownedPets || []), newPet];
        message = `Won a ${prizeData.item.name}!`;
        break;
        
      case 'reward':
        updatedStudent.rewardsPurchased = [...(student.rewardsPurchased || []), { 
          ...prizeData.item, 
          purchasedAt: new Date().toISOString() 
        }];
        message = `Won ${prizeData.item.name}!`;
        break;
        
      case 'xp':
        updatedStudent.totalPoints = (student.totalPoints || 0) + prizeData.amount;
        message = `Won ${prizeData.amount} bonus XP!`;
        break;
        
      case 'coins':
        updatedStudent.currency = (student.currency || 0) + prizeData.amount;
        message = `Won ${prizeData.amount} bonus coins!`;
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid prize type' });
    }

    updatedStudent.lastUpdated = new Date().toISOString();

    // Update student in class
    const updatedStudents = targetClass.students.map(s => 
      s.id === studentId ? updatedStudent : s
    );

    const updatedClasses = teacherData.classes.map(cls =>
      cls.id === targetClass.id 
        ? { ...cls, students: updatedStudents }
        : cls
    );

    await teacherRef.update({ classes: updatedClasses });

    return res.status(200).json({
      success: true,
      student: updatedStudent,
      message: message,
      prize: prizeData
    });

  } catch (error) {
    console.error('Error awarding mystery box prize:', error);
    throw error;
  }
}

/**
 * Utility function to get mystery box statistics for a class
 */
export async function getMysteryBoxStats(teacherUserId, classId) {
  try {
    const teacherRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists) {
      throw new Error('Teacher not found');
    }
    
    const teacherData = teacherDoc.data();
    const targetClass = teacherData.classes?.find(cls => cls.id === classId);
    
    if (!targetClass) {
      throw new Error('Class not found');
    }
    
    // Calculate statistics
    const stats = {
      totalBoxesOpened: 0,
      totalCoinsSpent: 0,
      prizeDistribution: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      },
      mostPopularStudent: null,
      topPrizes: []
    };
    
    // You could track mystery box usage in student data or a separate collection
    // For now, we'll estimate based on coins spent vs items owned
    
    return stats;
    
  } catch (error) {
    console.error('Error getting mystery box stats:', error);
    throw error;
  }
}