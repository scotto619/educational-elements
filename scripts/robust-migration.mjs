// scripts/robust-migration.mjs - Step-by-step migration with progress tracking
import { config } from 'dotenv';
config({ path: '.env.local' });

import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  });

  console.log('✅ Firebase Admin SDK initialized');
}

const firestore = admin.firestore();

// Progress tracking
let totalUsers = 0;
let processedUsers = 0;
let totalClasses = 0;
let processedClasses = 0;
let totalStudents = 0;
let processedStudents = 0;
let errors = [];

async function createBackup() {
  console.log('\n🔄 Step 1: Creating backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/migration-${timestamp}`;
  
  try {
    mkdirSync(backupDir, { recursive: true });
    
    console.log('📦 Fetching all users...');
    const usersSnapshot = await firestore.collection('users').get();
    const usersData = {};
    
    let userCount = 0;
    usersSnapshot.forEach(doc => {
      usersData[doc.id] = doc.data();
      userCount++;
      
      if (userCount % 5 === 0) {
        console.log(`   Backed up ${userCount}/${usersSnapshot.size} users...`);
      }
    });
    
    writeFileSync(
      join(backupDir, 'users-backup.json'),
      JSON.stringify(usersData, null, 2)
    );
    
    const stats = {
      totalUsers: usersSnapshot.size,
      backupTimestamp: new Date().toISOString(),
      backupLocation: backupDir
    };
    
    writeFileSync(
      join(backupDir, 'backup-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
    console.log(`✅ Backup completed: ${usersSnapshot.size} users backed up`);
    console.log(`📁 Backup location: ${backupDir}`);
    
    return { backupDir, stats };
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

async function analyzeData() {
  console.log('\n🔄 Step 2: Analyzing data for migration...');
  
  try {
    const usersSnapshot = await firestore.collection('users').get();
    totalUsers = usersSnapshot.size;
    
    let usersWithClasses = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      
      if (userData.classes && userData.classes.length > 0) {
        usersWithClasses++;
        totalClasses += userData.classes.length;
        
        userData.classes.forEach(cls => {
          if (cls.students && cls.students.length > 0) {
            totalStudents += cls.students.length;
          }
        });
      }
    });
    
    console.log(`📊 Migration scope:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with classes: ${usersWithClasses}`);
    console.log(`   Total classes: ${totalClasses}`);
    console.log(`   Total students: ${totalStudents}`);
    
    const estimatedTime = Math.ceil(totalUsers * 0.3 + totalClasses * 0.2 + totalStudents * 0.1);
    console.log(`⏱️  Estimated time: ${estimatedTime} seconds`);
    
    return { totalUsers, usersWithClasses, totalClasses, totalStudents };
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    throw error;
  }
}

async function migrateUsersInBatches() {
  console.log('\n🔄 Step 3: Migrating users (in batches)...');
  
  try {
    const usersSnapshot = await firestore.collection('users').get();
    const users = usersSnapshot.docs;
    
    // Process in batches of 3 to avoid overwhelming Firestore
    const batchSize = 3;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}...`);
      
      // Process batch in parallel
      await Promise.all(batch.map(userDoc => migrateUser(userDoc)));
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`✅ Migration completed: ${processedUsers}/${totalUsers} users processed`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

async function migrateUser(userDoc) {
  const userId = userDoc.id;
  const userData = userDoc.data();
  
  try {
    console.log(`👤 Migrating user: ${userData.email || userId.substring(0, 10)}...`);
    
    return await firestore.runTransaction(async (transaction) => {
      // Create clean user document
      const userRef = firestore.collection('users').doc(userId);
      const cleanUserData = {
        email: userData.email || null,
        displayName: userData.displayName || null,
        createdAt: userData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Preserve subscription data
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
      
      // Migrate classes
      let firstClassId = null;
      if (userData.classes && userData.classes.length > 0) {
        for (let i = 0; i < userData.classes.length; i++) {
          const classData = userData.classes[i];
          console.log(`  📚 Migrating class ${i + 1}/${userData.classes.length}: ${classData.name}...`);
          
          const classId = await migrateClass(userId, classData, transaction);
          if (!firstClassId) firstClassId = classId;
        }
      }
      
      // Set active class
      if (firstClassId) {
        cleanUserData.activeClassId = firstClassId;
      }
      
      transaction.set(userRef, cleanUserData);
      
      processedUsers++;
      console.log(`✅ User migrated: ${userData.email || userId.substring(0, 10)} (${processedUsers}/${totalUsers})`);
    });
    
  } catch (error) {
    const errorMsg = `User ${userId}: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    errors.push(errorMsg);
    
    // Don't fail entire migration for individual user errors
    processedUsers++;
  }
}

async function migrateClass(teacherId, classData, transaction) {
  const classId = classData.id || 
                 classData.classId || 
                 `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // Create class document
    const classRef = firestore.collection('classes').doc(classId);
    const newClassData = {
      id: classId,
      teacherId: teacherId,
      name: classData.name || 'Untitled Class',
      classCode: classData.classCode || generateClassCode(),
      createdAt: classData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Preserve all class data
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
    processedClasses++;
    
    // Migrate students
    const studentIds = [];
    if (classData.students && classData.students.length > 0) {
      for (let i = 0; i < classData.students.length; i++) {
        const studentData = classData.students[i];
        const studentId = await migrateStudent(classId, studentData, transaction);
        studentIds.push(studentId);
      }
      
      console.log(`    👥 Migrated ${studentIds.length} students`);
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
    
  } catch (error) {
    console.error(`    ❌ Error migrating class ${classData.name}: ${error.message}`);
    throw error;
  }
}

async function migrateStudent(classId, studentData, transaction) {
  const studentId = studentData.id || 
                   studentData.studentId || 
                   `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const studentRef = firestore.collection('students').doc(studentId);
    
    // Clean and validate data
    const newStudentData = {
      id: studentId,
      classId: classId,
      firstName: studentData.firstName || 'Unknown',
      lastName: studentData.lastName || '',
      
      // Clean numeric data (fix the currency issues we found)
      totalPoints: Math.max(0, Number(studentData.totalPoints) || 0),
      currency: Math.max(0, Number(studentData.currency) || 0),
      coinsSpent: Math.max(0, Number(studentData.coinsSpent) || 0),
      
      // Avatar & pets
      avatarBase: studentData.avatarBase || 'Wizard F',
      avatarLevel: studentData.avatarLevel || 1,
      ownedAvatars: studentData.ownedAvatars || ['Wizard F'],
      ownedPets: studentData.ownedPets || [],
      
      // Game data (preserve existing)
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
    processedStudents++;
    
    return studentId;
    
  } catch (error) {
    console.error(`      ❌ Error migrating student ${studentData.firstName}: ${error.message}`);
    throw error;
  }
}

async function verifyMigration() {
  console.log('\n🔄 Step 4: Verifying migration...');
  
  try {
    // Check V2 collections exist
    const collections = await firestore.listCollections();
    const collectionIds = collections.map(c => c.id);
    
    console.log('📋 Collections found:', collectionIds);
    
    const requiredCollections = ['users', 'classes', 'students', 'class_memberships'];
    const missingCollections = requiredCollections.filter(c => !collectionIds.includes(c));
    
    if (missingCollections.length > 0) {
      console.log('⚠️ Missing collections:', missingCollections);
    } else {
      console.log('✅ All required collections exist');
    }
    
    // Sample data verification
    const usersCount = (await firestore.collection('users').get()).size;
    const classesCount = (await firestore.collection('classes').get()).size;
    const studentsCount = (await firestore.collection('students').get()).size;
    
    console.log('📊 Verification counts:');
    console.log(`   Users: ${usersCount}`);
    console.log(`   Classes: ${classesCount}`);
    console.log(`   Students: ${studentsCount}`);
    
    const success = usersCount > 0 && classesCount === processedClasses && studentsCount === processedStudents;
    
    if (success) {
      console.log('✅ Migration verification passed');
    } else {
      console.log('⚠️ Migration verification found discrepancies');
    }
    
    return { success, counts: { usersCount, classesCount, studentsCount } };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return { success: false, error: error.message };
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

// Main migration function
async function runMigration() {
  const startTime = new Date();
  
  console.log('🚀 Educational Elements Migration Starting...');
  console.log('=============================================');
  
  try {
    // Step 1: Create backup
    const backupResult = await createBackup();
    
    // Step 2: Analyze data
    const analysisResult = await analyzeData();
    
    // Step 3: Migrate data
    await migrateUsersInBatches();
    
    // Step 4: Verify migration
    const verificationResult = await verifyMigration();
    
    // Summary
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 MIGRATION COMPLETED!');
    console.log('========================');
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log(`👥 Users processed: ${processedUsers}/${totalUsers}`);
    console.log(`📚 Classes migrated: ${processedClasses}`);
    console.log(`👨‍🎓 Students migrated: ${processedStudents}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`✅ Verification: ${verificationResult.success ? 'PASSED' : 'FAILED'}`);
    
    if (errors.length > 0) {
      console.log('\n⚠️ Migration errors:');
      errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 5) {
        console.log(`   - ... and ${errors.length - 5} more errors`);
      }
    }
    
    console.log(`\n📁 Backup location: ${backupResult.backupDir}`);
    
    console.log('\n🎯 Next steps:');
    console.log('1. Restart your application: npm run dev');
    console.log('2. Test XP awarding - it should now work reliably');
    console.log('3. Look for "V2" architecture indicators in console');
    console.log('4. Monitor for any issues over the next 24 hours');
    
    if (verificationResult.success && errors.length < totalUsers * 0.1) {
      console.log('\n✅ MIGRATION SUCCESSFUL!');
      console.log('Your XP awarding issues should now be resolved.');
    } else {
      console.log('\n⚠️ Migration completed with issues');
      console.log('Some manual cleanup may be required');
    }
    
  } catch (error) {
    console.error('\n💥 MIGRATION FAILED');
    console.error('Error:', error.message);
    console.error('\nThe migration was aborted to prevent data corruption');
    console.error('Your original data is safe and unchanged');
    throw error;
  }
}

// Run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration crashed:', error);
    process.exit(1);
  });