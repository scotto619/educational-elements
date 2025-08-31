// utils/firebase-admin.js - UPDATED with Math Mentals support
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Parse the private key (handle newlines properly)
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Export Firebase Admin services
export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();

// Helper functions for Educational Elements

/**
 * Create a new user document with Educational Elements structure
 */
export async function createUserDocument(userId, userData) {
  const userRef = adminFirestore.collection('users').doc(userId);
  
  const defaultUserData = {
    email: userData.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    classes: [],
    subscription: null,
    subscriptionStatus: null,
    stripeCustomerId: null,
    discountCodeUsed: null,
    freeAccessUntil: null,
    activeClassId: null,
    planType: null,
    currentPeriodEnd: null,
    // NEW: Widget settings for floating widgets
    widgetSettings: {
      showTimer: true,
      showNamePicker: true
    },
    ...userData
  };

  await userRef.set(defaultUserData);
  return defaultUserData;
}

/**
 * Get user data with subscription and access status
 */
export async function getUserWithAccessStatus(userId) {
  const userRef = adminFirestore.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  const now = new Date();
  
  // Check if user has active access
  const hasFreeAccess = userData.freeAccessUntil && new Date(userData.freeAccessUntil) > now;
  const hasActiveSubscription = userData.subscription && userData.subscription !== 'cancelled';
  
  return {
    ...userData,
    hasAccess: hasFreeAccess || hasActiveSubscription,
    accessType: hasFreeAccess ? 'free' : hasActiveSubscription ? 'subscription' : 'none',
    accessExpiresAt: hasFreeAccess ? userData.freeAccessUntil : userData.currentPeriodEnd
  };
}

/**
 * Apply discount code to user
 */
export async function applyDiscountCodeToUser(userId, discountCode) {
  const validCodes = {
    'LAUNCH2025': {
      type: 'free_access',
      expiresAt: '2026-01-01T23:59:59.999Z',
      description: 'Free access until January 1, 2026'
    }
  };

  const code = discountCode.toUpperCase();
  const codeInfo = validCodes[code];

  if (!codeInfo) {
    throw new Error('Invalid discount code');
  }

  const userRef = adminFirestore.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();

  // Check if code already used
  if (userData.discountCodeUsed === code) {
    throw new Error('Discount code already applied');
  }

  // Check if user has active subscription
  if (userData.subscription && userData.subscription !== 'cancelled') {
    throw new Error('Cannot apply discount to account with active subscription');
  }

  // Apply the discount
  const updateData = {
    discountCodeUsed: code,
    freeAccessUntil: codeInfo.expiresAt,
    discountAppliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Clear cancelled subscription status if present
  if (userData.subscription === 'cancelled') {
    updateData.subscription = null;
    updateData.subscriptionStatus = null;
  }

  await userRef.update(updateData);

  // Log usage
  await adminFirestore.collection('discount_code_usage').add({
    userId: userId,
    userEmail: userData.email,
    discountCode: code,
    appliedAt: new Date().toISOString(),
    expiresAt: codeInfo.expiresAt,
    type: codeInfo.type
  });

  return {
    success: true,
    message: codeInfo.description,
    expiresAt: codeInfo.expiresAt
  };
}

/**
 * Update user subscription status from Stripe webhook
 */
export async function updateUserSubscription(userId, subscriptionData) {
  const userRef = adminFirestore.collection('users').doc(userId);
  
  const updateData = {
    stripeCustomerId: subscriptionData.customerId,
    subscription: subscriptionData.status === 'active' ? 'educational-elements' : 'cancelled',
    subscriptionId: subscriptionData.subscriptionId,
    subscriptionStatus: subscriptionData.status,
    planType: 'educational-elements',
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    updatedAt: new Date().toISOString()
  };

  // Clear free access if they now have a paid subscription
  if (subscriptionData.status === 'active') {
    updateData.freeAccessUntil = null;
  }

  await userRef.update(updateData);
  return updateData;
}

// ===============================================
// MATH MENTALS HELPER FUNCTIONS - NEW
// ===============================================

/**
 * Get Math Mentals progress for a specific student across all their classes
 */
export async function getMathMentalsProgress(teacherUserId, studentId) {
  try {
    const teacherRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists) {
      throw new Error('Teacher not found');
    }
    
    const teacherData = teacherDoc.data();
    let studentProgress = null;
    
    // Find the student across all classes
    for (const classDoc of teacherData.classes || []) {
      const student = classDoc.students?.find(s => s.id === studentId);
      if (student?.mathMentalsProgress) {
        studentProgress = {
          classId: classDoc.id,
          className: classDoc.name,
          studentName: `${student.firstName} ${student.lastName}`,
          progress: student.mathMentalsProgress
        };
        break;
      }
    }
    
    return studentProgress;
  } catch (error) {
    console.error('Error getting Math Mentals progress:', error);
    throw error;
  }
}

/**
 * Get Math Mentals statistics for a class
 */
export async function getMathMentalsClassStats(teacherUserId, classId) {
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
    
    const mathGroups = targetClass.toolkitData?.mathMentalsData?.groups || [];
    const stats = {
      totalStudents: 0,
      studentsWithProgress: 0,
      averageStreak: 0,
      levelDistribution: {},
      dailyActivity: {}
    };
    
    // Analyze each math group
    mathGroups.forEach(group => {
      group.students.forEach(student => {
        stats.totalStudents++;
        
        if (student.progress && Object.keys(student.progress).length > 0) {
          stats.studentsWithProgress++;
          stats.averageStreak += student.streak || 0;
          
          // Count level distribution
          const level = student.currentLevel;
          stats.levelDistribution[level] = (stats.levelDistribution[level] || 0) + 1;
          
          // Count daily activity (last 7 days)
          Object.keys(student.progress).forEach(date => {
            const testDate = new Date(date);
            const daysDiff = Math.floor((new Date() - testDate) / (1000 * 60 * 60 * 24));
            if (daysDiff <= 7) {
              stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
            }
          });
        }
      });
    });
    
    if (stats.studentsWithProgress > 0) {
      stats.averageStreak = Math.round(stats.averageStreak / stats.studentsWithProgress * 10) / 10;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting Math Mentals class stats:', error);
    throw error;
  }
}

/**
 * Reset Math Mentals progress for a student (admin function)
 */
export async function resetMathMentalsProgress(teacherUserId, classId, studentId) {
  try {
    const teacherRef = adminFirestore.collection('users').doc(teacherUserId);
    const teacherDoc = await teacherRef.get();
    
    if (!teacherDoc.exists) {
      throw new Error('Teacher not found');
    }
    
    const teacherData = teacherDoc.data();
    const updatedClasses = teacherData.classes.map(cls => {
      if (cls.id === classId) {
        const updatedStudents = cls.students.map(student => {
          if (student.id === studentId) {
            // Reset Math Mentals progress but keep other data
            const updatedStudent = { ...student };
            delete updatedStudent.mathMentalsProgress;
            updatedStudent.lastUpdated = new Date().toISOString();
            return updatedStudent;
          }
          return student;
        });
        
        // Also reset in math groups
        const updatedClass = { ...cls, students: updatedStudents };
        if (updatedClass.toolkitData?.mathMentalsData?.groups) {
          updatedClass.toolkitData.mathMentalsData.groups.forEach(group => {
            group.students.forEach(groupStudent => {
              if (groupStudent.id === studentId) {
                groupStudent.progress = {};
                groupStudent.streak = 0;
                // Keep currentLevel as starting point
              }
            });
          });
          updatedClass.toolkitData.mathMentalsData.lastUpdated = new Date().toISOString();
        }
        
        return updatedClass;
      }
      return cls;
    });
    
    await teacherRef.update({ classes: updatedClasses });
    
    console.log('Math Mentals progress reset for student:', studentId);
    return { success: true, message: 'Math Mentals progress reset successfully' };
  } catch (error) {
    console.error('Error resetting Math Mentals progress:', error);
    throw error;
  }
}

// Export the admin app
export default admin;