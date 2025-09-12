// scripts/run-migration.js - SIMPLIFIED MIGRATION SCRIPT
import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
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

    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    process.exit(1);
  }
}

const firestore = admin.firestore();

// ===============================================
// STEP 1: CREATE BACKUP
// ===============================================

async function createBackup() {
  console.log('🔄 Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/migration-${timestamp}`;
  
  // Create backup directory
  mkdirSync(backupDir, { recursive: true });
  
  try {
    // Backup users collection
    const usersSnapshot = await firestore.collection('users').get();
    const usersData = {};
    let totalUsers = 0;
    let totalClasses = 0;
    let totalStudents = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      usersData[doc.id] = userData;
      totalUsers++;
      
      if (userData.classes) {
        totalClasses += userData.classes.length;
        userData.classes.forEach(cls => {
          if (cls.students) {
            totalStudents += cls.students.length;
          }
        });
      }
    });
    
    // Save backup
    writeFileSync(
      join(backupDir, 'users-backup.json'), 
      JSON.stringify(usersData, null, 2)
    );
    
    // Save stats
    const stats = {
      totalUsers,
      totalClasses,
      totalStudents,
      backupTimestamp: new Date().toISOString(),
      backupLocation: backupDir
    };
    
    writeFileSync(
      join(backupDir, 'backup-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
    console.log('✅ Backup completed:', stats);
    return { backupDir, stats };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// ===============================================
// STEP 2: MIGRATE DATA
// ===============================================

async function migrateData(backupDir) {
  console.log('🔄 Starting migration...');
  
  // Load backup data
  const backupData = JSON.parse(
    require('fs').readFileSync(`${backupDir}/users-backup.json`, 'utf8')
  );
  
  let processedUsers = 0;
  const errors = [];
  
  for (const [userId, userData] of Object.entries(backupData)) {
    try {
      console.log(`Processing user ${processedUsers + 1}: ${userId.substring(0, 10)}...`);
      
      await migrateUserToV2(userId, userData);
      processedUsers++;
      
      // Progress update every 5 users
      if (processedUsers % 5 === 0) {
        console.log(`✅ Progress: ${processedUsers}/${Object.keys(backupData).length} users migrated`);
      }
      
      // Rate limiting - small delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Error migrating user ${userId}:`, error.message);
      errors.push({ userId, error: error.message });
      
      // Continue with next user
      if (errors.length > 5) {
        console.error('🛑 Too many errors, stopping migration');
        break;
      }
    }
  }
  
  console.log(`✅ Migration completed: ${processedUsers} users processed, ${errors.length} errors`);
  return { processedUsers, errors };
}

async function migrateUserToV2(userId, userData) {
  return await firestore.runTransaction(async (transaction) => {
    
    // 1. Create clean user document
    const userRef = firestore.collection('users').doc(userId);
    const cleanUserData = {
      email: userData.email,
      displayName: userData.displayName || null,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Preserve important user data
      subscription: userData.subscription || null,
      subscriptionStatus: userData.subscriptionStatus || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      planType: userData.planType || null,
      currentPeriodEnd: userData.currentPeriodEnd || null,
      discountCodeUsed: userData.discountCodeUsed || null,
      freeAccessUntil: userData.freeAccessUntil || null,
      
      // Widget settings
      widgetSettings: userData.widgetSettings || {
        showTimer: true,
        showNamePicker: true
      },
      
      // Migration metadata
      migratedAt: new Date().toISOString(),
      migratedFrom: 'v1-monolithic',
      version: '2.0'
    };
    
    // 2. Migrate classes if they exist
    let firstClassId = null;
    if (userData.classes && userData.classes.length > 0) {
      for (const classData of userData.classes) {
        const classId = await migrateClass(userId, classData, transaction);
        if (!firstClassId) firstClassId = classId;
      }
    }
    
    // Set active class
    if (firstClassId) {
      cleanUserData.activeClassId = firstClassId;
    }
    
    transaction.set(userRef, cleanUserData);
  });
}

async function migrateClass(teacherId, classData, transaction) {
  const classId = classData.id || `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create class document
  const classRef = firestore.collection('classes').doc(classId);
  const newClassData = {
    id: classId,
    teacherId: teacherId,
    name: classData.name || 'Untitled Class',
    classCode: classData.classCode || generateClassCode(),
    createdAt: classData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Preserve class data
    xpCategories: classData.xpCategories || getDefaultXPCategories(),
    classRewards: classData.classRewards || [],
    activeQuests: classData.activeQuests || [],
    attendanceData: classData.attendanceData || {},
    toolkitData: classData.toolkitData || {},
    
    // Metadata
    studentCount: (classData.students || []).length,
    lastActivity: new Date().toISOString(),
    archived: false,
    migratedAt: new Date().toISOString()
  };
  
  transaction.set(classRef, newClassData);
  
  // Migrate students
  const studentIds = [];
  if (classData.students && classData.students.length > 0) {
    for (const studentData of classData.students) {
      const studentId = await migrateStudent(classId, studentData, transaction);
      studentIds.push(studentId);
    }
  }
  
  // Create class membership
  const membershipRef = firestore.collection('class_memberships').doc(classId);
  const membershipData = {
    classId: classId,
    teacherId: teacherId,
    students: studentIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    migratedAt: new Date().toISOString()
  };
  
  transaction.set(membershipRef, membershipData);
  
  return classId;
}

async function migrateStudent(classId, studentData, transaction) {
  const studentId = studentData.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const studentRef = firestore.collection('students').doc(studentId);
  const newStudentData = {
    id: studentId,
    classId: classId,
    firstName: studentData.firstName || 'Unknown',
    lastName: studentData.lastName || '',
    
    // Clean and validate numeric data
    totalPoints: Math.max(0, Number(studentData.totalPoints) || 0),
    currency: Math.max(0, Number(studentData.currency) || 0),
    coinsSpent: Math.max(0, Number(studentData.coinsSpent) || 0),
    
    // Avatar & pets
    avatarBase: studentData.avatarBase || 'Wizard F',
    avatarLevel: studentData.avatarLevel || 1,
    ownedAvatars: studentData.ownedAvatars || ['Wizard F'],
    ownedPets: studentData.ownedPets || [],
    
    // Game data
    clickerGameData: studentData.clickerGameData || null,
    mathMentalsProgress: studentData.mathMentalsProgress || null,
    gameProgress: studentData.gameProgress || {},
    achievements: studentData.achievements || [],
    rewardsPurchased: studentData.rewardsPurchased || [],
    
    // Metadata
    createdAt: studentData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    archived: false,
    migratedAt: new Date().toISOString()
  };
  
  transaction.set(studentRef, newStudentData);
  return studentId;
}

// ===============================================
// STEP 3: VERIFY MIGRATION
// ===============================================

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  const errors = [];
  let usersChecked = 0;
  let classesChecked = 0;
  let studentsChecked = 0;
  
  try {
    // Check a sample of migrated users
    const usersSnapshot = await firestore.collection('users').limit(10).get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      usersChecked++;
      
      if (!userData.email) {
        errors.push(`User ${userDoc.id} missing email`);
      }
      
      if (userData.version !== '2.0') {
        errors.push(`User ${userDoc.id} not marked as migrated`);
      }
      
      // Check their active class exists
      if (userData.activeClassId) {
        const classDoc = await firestore.collection('classes').doc(userData.activeClassId).get();
        if (!classDoc.exists()) {
          errors.push(`User ${userDoc.id} references non-existent class`);
        } else {
          classesChecked++;
          
          // Check class membership
          const membershipDoc = await firestore.collection('class_memberships').doc(userData.activeClassId).get();
          if (membershipDoc.exists()) {
            const studentIds = membershipDoc.data().students || [];
            studentsChecked += studentIds.length;
            
            // Verify a few students exist
            const sampleSize = Math.min(2, studentIds.length);
            for (let i = 0; i < sampleSize; i++) {
              const studentId = studentIds[i];
              const studentDoc = await firestore.collection('students').doc(studentId).get();
              if (!studentDoc.exists()) {
                errors.push(`Missing student: ${studentId}`);
              }
            }
          }
        }
      }
    }
    
    const result = {
      success: errors.length === 0,
      errors: errors,
      verified: {
        users: usersChecked,
        classes: classesChecked,
        students: studentsChecked
      }
    };
    
    if (result.success) {
      console.log('✅ Verification passed:', result.verified);
    } else {
      console.log('⚠️ Verification found issues:', errors);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return { success: false, errors: [error.message], verified: { users: usersChecked, classes: classesChecked, students: studentsChecked } };
  }
}

// ===============================================
// MAIN MIGRATION RUNNER
// ===============================================

async function runMigration() {
  console.log('🚀 Educational Elements Migration Starting...');
  console.log('⚠️  This will modify your database structure');
  console.log('');
  
  try {
    // Step 1: Backup
    const backupResult = await createBackup();
    
    // Step 2: Migrate
    const migrationResult = await migrateData(backupResult.backupDir);
    
    // Step 3: Verify
    const verificationResult = await verifyMigration();
    
    // Summary
    console.log('');
    console.log('🎉 MIGRATION COMPLETED!');
    console.log('📊 Summary:');
    console.log(`   Backup: ${backupResult.stats.totalUsers} users, ${backupResult.stats.totalClasses} classes, ${backupResult.stats.totalStudents} students`);
    console.log(`   Migrated: ${migrationResult.processedUsers} users`);
    console.log(`   Errors: ${migrationResult.errors.length}`);
    console.log(`   Verification: ${verificationResult.success ? 'PASSED' : 'FAILED'}`);
    console.log('');
    
    if (migrationResult.errors.length > 0) {
      console.log('⚠️ Migration errors:');
      migrationResult.errors.forEach(err => console.log(`   - ${err.userId}: ${err.error}`));
    }
    
    if (!verificationResult.success) {
      console.log('❌ Verification errors:');
      verificationResult.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    console.log('');
    console.log('Next Steps:');
    console.log('1. Test your application thoroughly');
    console.log('2. Update your Firebase security rules');
    console.log('3. Deploy the updated application');
    console.log('4. Monitor for any issues');
    console.log(`5. Backup location: ${backupResult.backupDir}`);
    
    return {
      success: verificationResult.success && migrationResult.errors.length === 0,
      backup: backupResult,
      migration: migrationResult,
      verification: verificationResult
    };
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

// Utility functions
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

// Run migration if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigration };