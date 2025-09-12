// scripts/backup-before-migration.js - COMPREHENSIVE BACKUP SYSTEM
import admin from 'firebase-admin';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin (use your existing credentials)
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

async function createCompleteBackup() {
  console.log('🚀 Starting comprehensive backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = `backups/migration-${timestamp}`;
  
  // Create backup directory
  mkdirSync(backupDir, { recursive: true });
  
  try {
    // 1. Backup all users
    console.log('📦 Backing up users collection...');
    const usersSnapshot = await firestore.collection('users').get();
    const usersData = {};
    const userStats = {
      totalUsers: 0,
      usersWithClasses: 0,
      totalClasses: 0,
      totalStudents: 0,
      usersWithSubscriptions: 0
    };
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      usersData[doc.id] = userData;
      
      userStats.totalUsers++;
      if (userData.classes && userData.classes.length > 0) {
        userStats.usersWithClasses++;
        userStats.totalClasses += userData.classes.length;
        
        userData.classes.forEach(classData => {
          if (classData.students) {
            userStats.totalStudents += classData.students.length;
          }
        });
      }
      
      if (userData.subscription && userData.subscription !== 'cancelled') {
        userStats.usersWithSubscriptions++;
      }
    });
    
    // Save users backup
    writeFileSync(
      join(backupDir, 'users-backup.json'), 
      JSON.stringify(usersData, null, 2)
    );
    
    // Save statistics
    writeFileSync(
      join(backupDir, 'backup-stats.json'),
      JSON.stringify({
        ...userStats,
        backupTimestamp: new Date().toISOString(),
        totalDocumentSize: JSON.stringify(usersData).length,
        backupLocation: backupDir
      }, null, 2)
    );
    
    // 2. Create detailed analysis report
    console.log('📊 Creating analysis report...');
    const analysisReport = await createAnalysisReport(usersData);
    writeFileSync(
      join(backupDir, 'migration-analysis.json'),
      JSON.stringify(analysisReport, null, 2)
    );
    
    // 3. Backup any existing collections that might exist
    console.log('🔍 Checking for existing collections...');
    const collections = await firestore.listCollections();
    for (const collection of collections) {
      if (collection.id !== 'users') {
        console.log(`📦 Backing up collection: ${collection.id}`);
        const snapshot = await collection.get();
        const data = {};
        snapshot.forEach(doc => {
          data[doc.id] = doc.data();
        });
        writeFileSync(
          join(backupDir, `${collection.id}-backup.json`),
          JSON.stringify(data, null, 2)
        );
      }
    }
    
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📊 Stats:`, userStats);
    
    return {
      success: true,
      backupDir,
      stats: userStats,
      analysisReport
    };
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function createAnalysisReport(usersData) {
  const report = {
    potentialIssues: [],
    dataIntegrity: {
      usersWithoutEmail: 0,
      classesWithoutId: 0,
      studentsWithoutId: 0,
      duplicateStudentIds: [],
      duplicateClassIds: [],
      orphanedData: []
    },
    migrationComplexity: {
      largestClassSize: 0,
      usersWithComplexToolkitData: 0,
      clickerGameUsers: 0,
      mathMentalsUsers: 0
    },
    recommendations: []
  };
  
  const allStudentIds = new Set();
  const allClassIds = new Set();
  const duplicateStudents = new Set();
  const duplicateClasses = new Set();
  
  Object.entries(usersData).forEach(([userId, userData]) => {
    // Check user integrity
    if (!userData.email) {
      report.dataIntegrity.usersWithoutEmail++;
    }
    
    if (userData.classes) {
      userData.classes.forEach(classData => {
        // Check class integrity
        if (!classData.id) {
          report.dataIntegrity.classesWithoutId++;
        } else {
          if (allClassIds.has(classData.id)) {
            duplicateClasses.add(classData.id);
          }
          allClassIds.add(classData.id);
        }
        
        // Track complexity indicators
        if (classData.students && classData.students.length > report.migrationComplexity.largestClassSize) {
          report.migrationComplexity.largestClassSize = classData.students.length;
        }
        
        if (classData.toolkitData && Object.keys(classData.toolkitData).length > 0) {
          report.migrationComplexity.usersWithComplexToolkitData++;
        }
        
        // Check students
        if (classData.students) {
          classData.students.forEach(student => {
            if (!student.id) {
              report.dataIntegrity.studentsWithoutId++;
            } else {
              if (allStudentIds.has(student.id)) {
                duplicateStudents.add(student.id);
              }
              allStudentIds.add(student.id);
            }
            
            if (student.clickerGameData) {
              report.migrationComplexity.clickerGameUsers++;
            }
            
            if (student.mathMentalsProgress) {
              report.migrationComplexity.mathMentalsUsers++;
            }
          });
        }
      });
    }
  });
  
  report.dataIntegrity.duplicateStudentIds = Array.from(duplicateStudents);
  report.dataIntegrity.duplicateClassIds = Array.from(duplicateClasses);
  
  // Generate recommendations
  if (report.dataIntegrity.duplicateStudentIds.length > 0) {
    report.recommendations.push('Resolve duplicate student IDs before migration');
    report.potentialIssues.push(`Found ${report.dataIntegrity.duplicateStudentIds.length} duplicate student IDs`);
  }
  
  if (report.migrationComplexity.largestClassSize > 50) {
    report.recommendations.push('Consider batch processing for large classes');
    report.potentialIssues.push(`Largest class has ${report.migrationComplexity.largestClassSize} students`);
  }
  
  return report;
}

// Verification function to ensure backup integrity
async function verifyBackup(backupDir) {
  try {
    console.log('🔍 Verifying backup integrity...');
    
    const backupData = JSON.parse(
      require('fs').readFileSync(join(backupDir, 'users-backup.json'), 'utf8')
    );
    
    const stats = JSON.parse(
      require('fs').readFileSync(join(backupDir, 'backup-stats.json'), 'utf8')
    );
    
    // Verify data counts match
    const actualUserCount = Object.keys(backupData).length;
    if (actualUserCount !== stats.totalUsers) {
      throw new Error(`User count mismatch: expected ${stats.totalUsers}, got ${actualUserCount}`);
    }
    
    // Verify random samples
    const userIds = Object.keys(backupData);
    const sampleSize = Math.min(5, userIds.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const liveDoc = await firestore.collection('users').doc(randomUserId).get();
      
      if (!liveDoc.exists) {
        throw new Error(`User ${randomUserId} exists in backup but not in live database`);
      }
      
      const liveData = liveDoc.data();
      const backupUser = backupData[randomUserId];
      
      // Quick integrity checks
      if (liveData.email !== backupUser.email) {
        throw new Error(`Email mismatch for user ${randomUserId}`);
      }
      
      if (liveData.classes?.length !== backupUser.classes?.length) {
        throw new Error(`Classes count mismatch for user ${randomUserId}`);
      }
    }
    
    console.log('✅ Backup verification passed');
    return { success: true, verified: true };
    
  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    throw error;
  }
}

export { createCompleteBackup, verifyBackup };