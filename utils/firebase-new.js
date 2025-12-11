// utils/firebase-new.js - FIXED DISTRIBUTED ARCHITECTURE UTILS
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  increment // FIXED: Import increment from firestore
} from 'firebase/firestore';
import { firestore } from './firebase';

// ===============================================
// CORE USER OPERATIONS
// ===============================================

/**
 * Create or update basic user document (no class data)
 */
export async function createUserDocument(userId, userData) {
  const userRef = doc(firestore, 'users', userId);
  
  const cleanUserData = {
    email: userData.email,
    displayName: userData.displayName || null,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Subscription info
    subscription: userData.subscription || null,
    subscriptionStatus: userData.subscriptionStatus || null,
    stripeCustomerId: userData.stripeCustomerId || null,
    planType: userData.planType || null,
    currentPeriodEnd: userData.currentPeriodEnd || null,
    
    // Access control
    discountCodeUsed: userData.discountCodeUsed || null,
    freeAccessUntil: userData.freeAccessUntil || null,
    
    // User preferences
    widgetSettings: userData.widgetSettings || {
      showTimer: true,
      showNamePicker: true
    },
    
    // Active class (single class ID)
    activeClassId: userData.activeClassId || null,
    
    // Metadata
    lastLogin: new Date().toISOString(),
    version: '2.0' // New architecture version
  };

  await setDoc(userRef, cleanUserData);
  console.log('✅ User document created/updated:', userId);
  return cleanUserData;
}

/**
 * Get user data with access status
 */
export async function getUserData(userId) {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    const now = new Date();
    
    // Check access status
    const hasFreeAccess = userData.freeAccessUntil && new Date(userData.freeAccessUntil) > now;
    const hasActiveSubscription = userData.subscription && userData.subscription !== 'cancelled';
    
    return {
      ...userData,
      hasAccess: hasFreeAccess || hasActiveSubscription,
      accessType: hasFreeAccess ? 'free' : hasActiveSubscription ? 'subscription' : 'none',
      accessExpiresAt: hasFreeAccess ? userData.freeAccessUntil : userData.currentPeriodEnd
    };
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    throw error;
  }
}

/**
 * Update user preferences (widget settings, etc.)
 */
export async function updateUserPreferences(userId, preferences) {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    await updateDoc(userRef, {
      ...preferences,
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ User preferences updated:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error updating user preferences:', error);
    throw error;
  }
}

// ===============================================
// CLASS OPERATIONS
// ===============================================

/**
 * Create a new class
 */
export async function createClass(teacherUserId, classData) {
  const batch = writeBatch(firestore);
  
  try {
    const classId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const classRef = doc(firestore, 'classes', classId);
    const membershipRef = doc(firestore, 'class_memberships', classId);
    
    const newClassData = {
      id: classId,
      teacherId: teacherUserId,
      name: classData.name,
      classCode: classData.classCode || generateClassCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Class settings
      xpCategories: classData.xpCategories || getDefaultXPCategories(),
      
      // Class-wide data
      classRewards: classData.classRewards || [],
      activeQuests: classData.activeQuests || [],
      attendanceData: classData.attendanceData || {},
      
      // Toolkit data (organized by tool)
      toolkitData: classData.toolkitData || {},
      
      // Metadata
      studentCount: 0,
      lastActivity: new Date().toISOString(),
      archived: false
    };
    
    const membershipData = {
      classId: classId,
      teacherId: teacherUserId,
      students: [], // Array of student IDs
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    batch.set(classRef, newClassData);
    batch.set(membershipRef, membershipData);
    
    // Update user's active class
    const userRef = doc(firestore, 'users', teacherUserId);
    batch.update(userRef, { 
      activeClassId: classId,
      updatedAt: new Date().toISOString()
    });
    
    await batch.commit();
    
    console.log('✅ Class created successfully:', classId);
    return { classId, ...newClassData };
  } catch (error) {
    console.error('❌ Error creating class:', error);
    throw error;
  }
}

/**
 * Get class data by ID
 */
export async function getClassData(classId) {
  try {
    const classRef = doc(firestore, 'classes', classId);
    const classDoc = await getDoc(classRef);
    
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    
    return classDoc.data();
  } catch (error) {
    console.error('❌ Error getting class data:', error);
    throw error;
  }
}

/**
 * Get classes for a teacher
 */
export async function getTeacherClasses(teacherUserId) {
  try {
    const classesQuery = query(
      collection(firestore, 'classes'),
      where('teacherId', '==', teacherUserId),
      where('archived', '==', false)
    );
    
    const querySnapshot = await getDocs(classesQuery);
    const classes = [];
    
    querySnapshot.forEach(doc => {
      classes.push({ id: doc.id, ...doc.data() });
    });
    
    return classes;
  } catch (error) {
    console.error('❌ Error getting teacher classes:', error);
    throw error;
  }
}

/**
 * Update class data (transactional)
 */
export async function updateClassData(classId, updates) {
  return await runTransaction(firestore, async (transaction) => {
    const classRef = doc(firestore, 'classes', classId);
    const classDoc = await transaction.get(classRef);
    
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    transaction.update(classRef, updatedData);
    
    console.log('✅ Class data updated:', classId);
    return updatedData;
  });
}

// ===============================================
// STUDENT OPERATIONS
// ===============================================

/**
 * Create a new student
 */
export async function createStudent(classId, studentData) {
  const batch = writeBatch(firestore);
  
  try {
    const studentId = `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const studentRef = doc(firestore, 'students', studentId);
    const membershipRef = doc(firestore, 'class_memberships', classId);
    
    const newStudentData = {
      id: studentId,
      classId: classId,
      firstName: studentData.firstName,
      lastName: studentData.lastName || '',
      
      // Game progress
      totalPoints: 0,
      currency: 0,
      coinsSpent: 0,
      
      // Avatar & pets
      avatarBase: 'Wizard F',
      avatarLevel: 1,
      ownedAvatars: ['Wizard F'],
      ownedPets: [],
      
      // Game data
      clickerGameData: null,
      mathMentalsProgress: null,
      gameProgress: {},
      achievements: [],
      rewardsPurchased: [],
      
      // Metadata
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      archived: false
    };
    
    batch.set(studentRef, newStudentData);
    
    // Add student to class membership
    const membershipDoc = await getDoc(membershipRef);
    if (membershipDoc.exists()) {
      const membershipData = membershipDoc.data();
      const updatedStudents = [...membershipData.students, studentId];
      
      batch.update(membershipRef, {
        students: updatedStudents,
        updatedAt: new Date().toISOString()
      });
      
      // Update class student count
      const classRef = doc(firestore, 'classes', classId);
      batch.update(classRef, {
        studentCount: updatedStudents.length,
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
    }
    
    await batch.commit();
    
    console.log('✅ Student created successfully:', studentId);
    return { studentId, ...newStudentData };
  } catch (error) {
    console.error('❌ Error creating student:', error);
    throw error;
  }
}

/**
 * Get student data by ID
 */
export async function getStudentData(studentId) {
  try {
    const studentRef = doc(firestore, 'students', studentId);
    const studentDoc = await getDoc(studentRef);
    
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    return studentDoc.data();
  } catch (error) {
    console.error('❌ Error getting student data:', error);
    throw error;
  }
}

/**
 * Get all students for a class
 */
export async function getClassStudents(classId) {
  try {
    // Get student IDs from class membership
    const membershipRef = doc(firestore, 'class_memberships', classId);
    const membershipDoc = await getDoc(membershipRef);
    
    if (!membershipDoc.exists()) {
      return [];
    }
    
    const studentIds = membershipDoc.data().students || [];
    
    if (studentIds.length === 0) {
      return [];
    }
    
    // Get all student documents in parallel
    const studentPromises = studentIds.map(studentId => 
      getStudentData(studentId)
    );
    
    const students = await Promise.all(studentPromises);
    
    // Filter out any failed fetches and sort by creation date
    return students
      .filter(student => student !== null)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
  } catch (error) {
    console.error('❌ Error getting class students:', error);
    throw error;
  }
}

/**
 * Update student data (transactional, prevents race conditions)
 */
export async function updateStudentData(studentId, updates, reason = 'Update') {
  return await runTransaction(firestore, async (transaction) => {
    const studentRef = doc(firestore, 'students', studentId);
    const studentDoc = await transaction.get(studentRef);
    
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    const currentData = studentDoc.data();
    
    // Validate numeric fields to prevent corruption
    const validatedUpdates = { ...updates };
    
    if (validatedUpdates.totalPoints !== undefined) {
      validatedUpdates.totalPoints = Math.max(0, Number(validatedUpdates.totalPoints) || 0);
    }
    
    if (validatedUpdates.currency !== undefined) {
      validatedUpdates.currency = Math.max(0, Number(validatedUpdates.currency) || 0);
    }
    
    if (validatedUpdates.coinsSpent !== undefined) {
      validatedUpdates.coinsSpent = Math.max(0, Number(validatedUpdates.coinsSpent) || 0);
    }
    
    const updatedData = {
      ...validatedUpdates,
      updatedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    transaction.update(studentRef, updatedData);
    
    console.log(`✅ Student updated (${reason}):`, studentId, Object.keys(validatedUpdates));
    return { ...currentData, ...updatedData };
  });
}

/**
 * Remove a student from a class (membership + student document)
 */
export async function removeStudentFromClass(classId, studentId) {
  return await runTransaction(firestore, async (transaction) => {
    const membershipRef = doc(firestore, 'class_memberships', classId);
    const classRef = doc(firestore, 'classes', classId);
    const studentRef = doc(firestore, 'students', studentId);

    const membershipDoc = await transaction.get(membershipRef);

    // Support both legacy object-based memberships and current string IDs
    const currentStudents = membershipDoc.exists() ? (membershipDoc.data().students || []) : [];
    const normalizeId = (entry) => {
      if (typeof entry === 'string') return entry;
      if (entry?.id) return entry.id;
      if (entry?.studentId) return entry.studentId;
      return null;
    };

    const currentStudentIds = currentStudents
      .map(normalizeId)
      .filter(Boolean);

    const updatedStudents = currentStudentIds.filter(id => id !== studentId);

    if (membershipDoc.exists()) {
      transaction.set(membershipRef, {
        ...membershipDoc.data(),
        students: updatedStudents,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    const classDoc = await transaction.get(classRef);
    if (classDoc.exists()) {
      const classData = classDoc.data();
      const updatedOrder = (classData.studentOrder || []).filter(id => id !== studentId);

      transaction.update(classRef, {
        studentCount: updatedStudents.length || Math.max((classData.studentCount || 1) - 1, 0),
        studentOrder: updatedOrder,
        updatedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
    }

    transaction.delete(studentRef);

    console.log('🗑️ Student removed from class:', { classId, studentId });
    return updatedStudents;
  });
}

/**
 * Award XP to student (prevents race conditions)
 */
export async function awardXPToStudent(studentId, amount, reason = 'XP Award') {
  return await updateStudentData(studentId, {
    totalPoints: increment(amount)
  }, reason);
}

/**
 * Award coins to student (prevents race conditions)  
 */
export async function awardCoinsToStudent(studentId, amount, reason = 'Coin Award') {
  return await updateStudentData(studentId, {
    currency: increment(amount)
  }, reason);
}

/**
 * Bulk award to multiple students (batched for performance)
 */
export async function bulkAwardStudents(studentIds, updates, reason = 'Bulk Award') {
  const batch = writeBatch(firestore);
  const results = [];
  
  try {
    // Process in chunks of 500 (Firestore batch limit)
    const chunks = [];
    for (let i = 0; i < studentIds.length; i += 500) {
      chunks.push(studentIds.slice(i, i + 500));
    }
    
    for (const chunk of chunks) {
      const chunkBatch = writeBatch(firestore);
      
      chunk.forEach(studentId => {
        const studentRef = doc(firestore, 'students', studentId);
        const updateData = {
          ...updates,
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        chunkBatch.update(studentRef, updateData);
        results.push(studentId);
      });
      
      await chunkBatch.commit();
    }
    
    console.log(`✅ Bulk award completed (${reason}):`, results.length, 'students');
    return results;
  } catch (error) {
    console.error('❌ Error in bulk award:', error);
    throw error;
  }
}

// ===============================================
// REAL-TIME LISTENERS
// ===============================================

/**
 * Listen to class data changes
 */
export function listenToClassData(classId, callback, errorCallback) {
  const classRef = doc(firestore, 'classes', classId);
  
  return onSnapshot(classRef, 
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Class listener error:', error);
      errorCallback && errorCallback(error);
    }
  );
}

/**
 * Listen to class students changes
 */
export function listenToClassStudents(classId, callback, errorCallback) {
  const membershipRef = doc(firestore, 'class_memberships', classId);
  
  return onSnapshot(membershipRef,
    async (doc) => {
      if (doc.exists()) {
        try {
          const membershipData = doc.data();
          const students = await getClassStudents(classId);
          callback(students);
        } catch (error) {
          console.error('❌ Error loading students in listener:', error);
          errorCallback && errorCallback(error);
        }
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('❌ Students listener error:', error);
      errorCallback && errorCallback(error);
    }
  );
}

/**
 * Listen to individual student changes
 */
export function listenToStudentData(studentId, callback, errorCallback) {
  const studentRef = doc(firestore, 'students', studentId);
  
  return onSnapshot(studentRef,
    (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Student listener error:', error);
      errorCallback && errorCallback(error);
    }
  );
}

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

function generateClassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getDefaultXPCategories() {
  return [
    { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
    { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
    { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
    { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
    { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' }
  ];
}

// ===============================================
// MIGRATION HELPERS
// ===============================================

/**
 * Verify data integrity for a student
 */
export async function verifyStudentIntegrity(studentId) {
  try {
    const studentData = await getStudentData(studentId);
    
    const issues = [];
    
    // Check required fields
    if (!studentData.firstName) issues.push('Missing firstName');
    if (!studentData.classId) issues.push('Missing classId');
    
    // Check numeric fields
    if (typeof studentData.totalPoints !== 'number' || studentData.totalPoints < 0) {
      issues.push('Invalid totalPoints');
    }
    
    if (typeof studentData.currency !== 'number' || studentData.currency < 0) {
      issues.push('Invalid currency');
    }
    
    return {
      studentId,
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    return {
      studentId,
      valid: false,
      issues: [`Error accessing student: ${error.message}`]
    };
  }
}

export {
  // Re-export firestore for direct use
  firestore
};