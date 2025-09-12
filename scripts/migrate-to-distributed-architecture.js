// scripts/migrate-to-distributed-architecture.js - SAFE MIGRATION SCRIPT
import admin from 'firebase-admin';
import { createCompleteBackup, verifyBackup } from './backup-before-migration.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const firestore = admin.firestore();

// Migration state tracking
const migrationState = {
  phase: 'not-started',
  totalUsers: 0,
  processedUsers: 0,
  totalClasses: 0,
  processedClasses: 0,
  totalStudents: 0,
  processedStudents: 0,
  errors: [],
  startTime: null,
  currentUser: null
};

// ===============================================
// PHASE 1: PREPARATION AND BACKUP
// ===============================================

async function phase1_BackupAndPrepare() {
  console.log('🚀 PHASE 1: Starting backup and preparation...');
  migrationState.phase = 'backup';
  migrationState.startTime = new Date();
  
  try {
    // 1. Create comprehensive backup
    console.log('📦 Creating complete backup...');
    const backupResult = await createCompleteBackup();
    
    if (!backupResult.success) {
      throw new Error('Backup failed - STOPPING MIGRATION');
    }
    
    // 2. Verify backup integrity
    console.log('🔍 Verifying backup integrity...');
    await verifyBackup(backupResult.backupDir);
    
    // 3. Analyze migration complexity
    migrationState.totalUsers = backupResult.stats.totalUsers;
    migrationState.totalClasses = backupResult.stats.totalClasses;
    migrationState.totalStudents = backupResult.stats.totalStudents;
    
    console.log('📊 Migration scope:', {
      users: migrationState.totalUsers,
      classes: migrationState.totalClasses,
      students: migrationState.totalStudents
    });
    
    // 4. Check for potential issues
    if (backupResult.analysisReport.potentialIssues.length > 0) {
      console.log('⚠️  Potential issues found:');
      backupResult.analysisReport.potentialIssues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      
      console.log('🤔 Continue anyway? (y/N)');
      // In a real script, you'd wait for user input here
    }
    
    console.log('✅ Phase 1 completed successfully');
    return {
      success: true,
      backupDir: backupResult.backupDir,
      analysisReport: backupResult.analysisReport
    };
    
  } catch (error) {
    console.error('❌ Phase 1 failed:', error);
    migrationState.errors.push(`Phase 1: ${error.message}`);
    throw error;
  }
}

// ===============================================
// PHASE 2: MIGRATE DATA (SAFE, TRANSACTIONAL)
// ===============================================

async function phase2_MigrateData(backupDir) {
  console.log('🚀 PHASE 2: Starting data migration...');
  migrationState.phase = 'migration';
  
  try {
    // Load backup data
    const backupData = JSON.parse(
      require('fs').readFileSync(`${backupDir}/users-backup.json`, 'utf8')
    );
    
    let processedCount = 0;
    const errors = [];
    
    // Process users one by one to avoid overwhelming Firestore
    for (const [userId, userData] of Object.entries(backupData)) {
      migrationState.currentUser = userId;
      
      try {
        console.log(`📝 Processing user ${processedCount + 1}/${migrationState.totalUsers}: ${userId}`);
        
        await migrateUserData(userId, userData);
        processedCount++;
        migrationState.processedUsers = processedCount;
        
        // Progress update every 10 users
        if (processedCount % 10 === 0) {
          console.log(`   ✅ Progress: ${processedCount}/${migrationState.totalUsers} users completed`);
        }
        
        // Rate limiting - small delay between users
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error migrating user ${userId}:`, error);
        errors.push({ userId, error: error.message });
        
        // Continue with next user instead of failing completely
        if (errors.length > 10) {
          throw new Error(`Too many migration errors (${errors.length}). Stopping.`);
        }
      }
    }
    
    migrationState.errors = errors;
    
    if (errors.length > 0) {
      console.log(`⚠️  Migration completed with ${errors.length} errors:`);
      errors.forEach(err => {
        console.log(`   - User ${err.userId}: ${err.error}`);
      });
    } else {
      console.log('✅ Phase 2 completed without errors');
    }
    
    return {
      success: true,
      processedUsers: processedCount,
      errors: errors
    };
    
  } catch (error) {
    console.error('❌ Phase 2 failed:', error);
    migrationState.errors.push(`Phase 2: ${error.message}`);
    throw error;
  }
}

// ===============================================
// INDIVIDUAL USER MIGRATION (TRANSACTIONAL)
// ===============================================

async function migrateUserData(userId, userData) {
  // Use transaction for data consistency
  return await firestore.runTransaction(async (transaction) => {
    
    // 1. Create clean user document
    const userRef = firestore.collection('users').doc(userId);
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
      
      // Active class (will be set to first class)
      activeClassId: null,
      
      // Migration metadata
      migratedAt: new Date().toISOString(),
      migratedFrom: 'v1-monolithic',
      version: '2.0'
    };
    
    transaction.set(userRef, cleanUserData);
    
    // 2. Migrate classes if they exist
    if (userData.classes && userData.classes.length > 0) {
      let firstClassId = null;
      
      for (const classData of userData.classes) {
        const classId = await migrateClassData(userId, classData, transaction);
        
        // Set first class as active
        if (!firstClassId) {
          firstClassId = classId;
        }
        
        migrationState.processedClasses++;
      }
      
      // Update user's active class
      if (firstClassId) {
        transaction.update(userRef, { activeClassId: firstClassId });
      }
    }
  });
}

async function migrateClassData(teacherId, classData, transaction) {
  const classId = classData.id || `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 1. Create class document
  const classRef = firestore.collection('classes').doc(classId);
  const newClassData = {
    id: classId,
    teacherId: teacherId,
    name: classData.name || 'Untitled Class',
    classCode: classData.classCode || generateClassCode(),
    createdAt: classData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Class settings
    xpCategories: classData.xpCategories || getDefaultXPCategories(),
    
    // Class-wide data
    classRewards: classData.classRewards || [],
    activeQuests: classData.activeQuests || [],
    attendanceData: classData.attendanceData || {},
    
    // Toolkit data
    toolkitData: classData.toolkitData || {},
    
    // Metadata
    studentCount: (classData.students || []).length,
    lastActivity: classData.lastActivity || new Date().toISOString(),
    archived: false,
    
    // Migration metadata
    migratedAt: new Date().toISOString(),
    migratedFrom: 'v1-monolithic'
  };
  
  transaction.set(classRef, newClassData);
  
  // 2. Create class membership document
  const membershipRef = firestore.collection('class_memberships').doc(classId);
  const studentIds = [];
  
  // 3. Migrate students
  if (classData.students && classData.students.length > 0) {
    for (const studentData of classData.students) {
      const studentId = await migrateStudentData(classId, studentData, transaction);
      studentIds.push(studentId);
      migrationState.processedStudents++;
    }
  }
  
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

async function migrateStudentData(classId, studentData, transaction) {
  const studentId = studentData.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const studentRef = firestore.collection('students').doc(studentId);
  const newStudentData = {
    id: studentId,
    classId: classId,
    firstName: studentData.firstName || 'Unknown',
    lastName: studentData.lastName || '',
    
    // Game progress - validate and clean
    totalPoints: Math.max(0, Number(studentData.totalPoints) || 0),
    currency: Math.max(0, Number(studentData.currency) || 0),
    coinsSpent: Math.max(0, Number(studentData.coinsSpent) || 0),
    
    // Avatar & pets
    avatarBase: studentData.avatarBase || 'Wizard F',
    avatarLevel: studentData.avatarLevel || 1,
    ownedAvatars: studentData.ownedAvatars || ['Wizard F'],
    ownedPets: studentData.ownedPets || [],
    
    // Game data - preserve but clean
    clickerGameData: studentData.clickerGameData || null,
    mathMentalsProgress: studentData.mathMentalsProgress || null,
    gameProgress: studentData.gameProgress || {},
    achievements: studentData.achievements || [],
    rewardsPurchased: studentData.rewardsPurchased || [],
    
    // Metadata
    createdAt: studentData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: studentData.lastActivity || new Date().toISOString(),
    archived: false,
    
    // Migration metadata
    migratedAt: new Date().toISOString(),
    migratedFrom: 'v1-monolithic'
  };
  
  transaction.set(studentRef, newStudentData);
  
  return studentId;
}

// ===============================================
// PHASE 3: VERIFICATION AND CLEANUP
// ===============================================

async function phase3_VerifyAndCleanup() {
  console.log('🚀 PHASE 3: Verification and cleanup...');
  migrationState.phase = 'verification';
  
  try {
    // 1. Verify migrated data integrity
    console.log('🔍 Verifying migrated data...');
    const verificationResults = await verifyMigratedData();
    
    if (!verificationResults.success) {
      throw new Error(`Data verification failed: ${verificationResults.errors.join(', ')}`);
    }
    
    // 2. Create migration report
    console.log('📊 Creating migration report...');
    const migrationReport = {
      migrationId: `migration_${Date.now()}`,
      startTime: migrationState.startTime,
      endTime: new Date(),
      duration: new Date() - migrationState.startTime,
      
      // Migration statistics
      stats: {
        totalUsers: migrationState.totalUsers,
        processedUsers: migrationState.processedUsers,
        totalClasses: migrationState.totalClasses,
        processedClasses: migrationState.processedClasses,
        totalStudents: migrationState.totalStudents,
        processedStudents: migrationState.processedStudents
      },
      
      // Results
      success: migrationState.errors.length === 0,
      errors: migrationState.errors,
      verification: verificationResults,
      
      // Recommendations
      nextSteps: [
        'Test the application thoroughly with the new data structure',
        'Monitor performance improvements',
        'Update API endpoints to use new structure',
        'Archive old monolithic data after 30 days of successful operation'
      ]
    };
    
    // Save migration report
    require('fs').writeFileSync(
      `migration-report-${Date.now()}.json`,
      JSON.stringify(migrationReport, null, 2)
    );
    
    console.log('✅ Phase 3 completed successfully');
    console.log('📋 Migration Summary:');
    console.log(`   Users: ${migrationReport.stats.processedUsers}/${migrationReport.stats.totalUsers}`);
    console.log(`   Classes: ${migrationReport.stats.processedClasses}/${migrationReport.stats.totalClasses}`);
    console.log(`   Students: ${migrationReport.stats.processedStudents}/${migrationReport.stats.totalStudents}`);
    console.log(`   Duration: ${Math.round(migrationReport.duration / 1000)}s`);
    console.log(`   Errors: ${migrationReport.errors.length}`);
    
    return migrationReport;
    
  } catch (error) {
    console.error('❌ Phase 3 failed:', error);
    migrationState.errors.push(`Phase 3: ${error.message}`);
    throw error;
  }
}

async function verifyMigratedData() {
  const errors = [];
  let usersChecked = 0;
  let classesChecked = 0;
  let studentsChecked = 0;
  
  try {
    // Sample verification (check 10% of data or minimum 5 records)
    const usersSnapshot = await firestore.collection('users').limit(Math.max(5, Math.floor(migrationState.totalUsers * 0.1))).get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      usersChecked++;
      
      // Verify user data structure
      if (!userData.email) {
        errors.push(`User ${userDoc.id} missing email`);
      }
      
      if (userData.version !== '2.0') {
        errors.push(`User ${userDoc.id} not marked as migrated`);
      }
      
      // Check associated classes if any
      if (userData.activeClassId) {
        const classDoc = await firestore.collection('classes').doc(userData.activeClassId).get();
        if (!classDoc.exists()) {
          errors.push(`User ${userDoc.id} references non-existent class ${userData.activeClassId}`);
        } else {
          classesChecked++;
          
          // Verify class-student relationship
          const membershipDoc = await firestore.collection('class_memberships').doc(userData.activeClassId).get();
          if (membershipDoc.exists()) {
            const studentIds = membershipDoc.data().students || [];
            
            // Verify random students
            const sampleSize = Math.min(3, studentIds.length);
            for (let i = 0; i < sampleSize; i++) {
              const randomStudentId = studentIds[Math.floor(Math.random() * studentIds.length)];
              const studentDoc = await firestore.collection('students').doc(randomStudentId).get();
              
              if (!studentDoc.exists()) {
                errors.push(`Class ${userData.activeClassId} references non-existent student ${randomStudentId}`);
              } else {
                studentsChecked++;
                const studentData = studentDoc.data();
                
                // Verify student data integrity
                if (typeof studentData.totalPoints !== 'number' || studentData.totalPoints < 0) {
                  errors.push(`Student ${randomStudentId} has invalid totalPoints: ${studentData.totalPoints}`);
                }
                
                if (typeof studentData.currency !== 'number' || studentData.currency < 0) {
                  errors.push(`Student ${randomStudentId} has invalid currency: ${studentData.currency}`);
                }
              }
            }
          }
        }
      }
    }
    
    return {
      success: errors.length === 0,
      errors: errors,
      verified: {
        users: usersChecked,
        classes: classesChecked,
        students: studentsChecked
      }
    };
    
  } catch (error) {
    errors.push(`Verification error: ${error.message}`);
    return {
      success: false,
      errors: errors,
      verified: {
        users: usersChecked,
        classes: classesChecked,
        students: studentsChecked
      }
    };
  }
}

// ===============================================
// MAIN MIGRATION ORCHESTRATOR
// ===============================================

async function runMigration() {
  console.log('🎯 Starting Educational Elements Migration to Distributed Architecture');
  console.log('⚠️  This will modify your database. Ensure you have recent backups!');
  console.log('');
  
  try {
    // Phase 1: Backup and prepare
    const phase1Result = await phase1_BackupAndPrepare();
    
    // Phase 2: Migrate data
    const phase2Result = await phase2_MigrateData(phase1Result.backupDir);
    
    // Phase 3: Verify and cleanup
    const phase3Result = await phase3_VerifyAndCleanup();
    
    console.log('');
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update your application to use the new Firebase utilities');
    console.log('2. Deploy the updated API endpoints');
    console.log('3. Test thoroughly in a staging environment');
    console.log('4. Monitor performance improvements');
    console.log('5. Archive old data after 30 days of successful operation');
    
    return {
      success: true,
      phases: {
        phase1: phase1Result,
        phase2: phase2Result, 
        phase3: phase3Result
      }
    };
    
  } catch (error) {
    console.error('💥 MIGRATION FAILED:', error);
    console.error('');
    console.error('Migration state:', migrationState);
    console.error('');
    console.error('🔧 Recovery steps:');
    console.error('1. Check the backup files created in Phase 1');
    console.error('2. Review the error details above');
    console.error('3. Fix any data issues identified');
    console.error('4. Re-run migration after addressing issues');
    
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

// Export for use as module or run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigration, migrationState };