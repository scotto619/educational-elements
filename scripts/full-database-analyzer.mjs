// scripts/full-database-analyzer.js - Analyze all users and their data
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from 'firebase-admin';

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

async function analyzeAllUsers() {
  console.log('🔍 Analyzing Educational Elements database...\n');
  
  try {
    // Get all users
    console.log('📋 Fetching all users...');
    const usersSnapshot = await firestore.collection('users').get();
    console.log(`✅ Found ${usersSnapshot.size} total users\n`);
    
    // Statistics
    let totalUsers = 0;
    let usersWithClasses = 0;
    let totalClasses = 0;
    let totalStudents = 0;
    let usersWithIssues = 0;
    const userSummaries = [];
    
    // Process each user
    usersSnapshot.docs.forEach((userDoc, index) => {
      const userData = userDoc.data();
      const userId = userDoc.id;
      totalUsers++;
      
      const userSummary = {
        id: userId,
        email: userData.email || 'No email',
        classCount: userData.classes?.length || 0,
        studentCount: 0,
        issues: []
      };
      
      // Check for user-level issues
      if (!userData.email) {
        userSummary.issues.push('Missing email');
        usersWithIssues++;
      }
      
      // Process classes
      if (userData.classes && userData.classes.length > 0) {
        usersWithClasses++;
        totalClasses += userData.classes.length;
        
        userData.classes.forEach((cls, clsIndex) => {
          // Count students
          if (cls.students && cls.students.length > 0) {
            userSummary.studentCount += cls.students.length;
            totalStudents += cls.students.length;
            
            // Check student data integrity
            cls.students.forEach((student, stuIndex) => {
              if (!student.id) {
                userSummary.issues.push(`Class ${clsIndex + 1}, Student ${stuIndex + 1}: Missing ID`);
              }
              if (typeof student.totalPoints !== 'number') {
                userSummary.issues.push(`Class ${clsIndex + 1}, Student ${stuIndex + 1}: Invalid totalPoints`);
              }
              if (typeof student.currency !== 'number') {
                userSummary.issues.push(`Class ${clsIndex + 1}, Student ${stuIndex + 1}: Invalid currency`);
              }
            });
          }
          
          // Check class data
          if (!cls.id && !cls.classId) {
            userSummary.issues.push(`Class ${clsIndex + 1}: Missing ID`);
          }
          if (!cls.name) {
            userSummary.issues.push(`Class ${clsIndex + 1}: Missing name`);
          }
        });
      }
      
      userSummaries.push(userSummary);
    });
    
    // Sort users by most data first (classes + students)
    userSummaries.sort((a, b) => {
      const aTotal = a.classCount + a.studentCount;
      const bTotal = b.classCount + b.studentCount;
      return bTotal - aTotal;
    });
    
    // Display summary
    console.log('📊 DATABASE SUMMARY:');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with classes: ${usersWithClasses}`);
    console.log(`   Total classes: ${totalClasses}`);
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Users with data issues: ${usersWithIssues}`);
    
    // Show top users with most data
    console.log('\n👥 USERS WITH MOST DATA:');
    const topUsers = userSummaries.filter(u => u.classCount > 0).slice(0, 10);
    
    if (topUsers.length === 0) {
      console.log('   ⚠️ No users have any classes created');
    } else {
      topUsers.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email}`);
        console.log(`      Classes: ${user.classCount}, Students: ${user.studentCount}`);
        if (user.issues.length > 0) {
          console.log(`      Issues: ${user.issues.length} found`);
        }
        console.log();
      });
    }
    
    // Show users with issues
    const usersWithDataIssues = userSummaries.filter(u => u.issues.length > 0);
    if (usersWithDataIssues.length > 0) {
      console.log('⚠️ USERS WITH DATA ISSUES:');
      usersWithDataIssues.slice(0, 5).forEach(user => {
        console.log(`   ${user.email}:`);
        user.issues.slice(0, 3).forEach(issue => {
          console.log(`     - ${issue}`);
        });
        if (user.issues.length > 3) {
          console.log(`     - ... and ${user.issues.length - 3} more issues`);
        }
        console.log();
      });
      
      if (usersWithDataIssues.length > 5) {
        console.log(`   ... and ${usersWithDataIssues.length - 5} more users with issues\n`);
      }
    }
    
    // Migration assessment
    console.log('🚀 MIGRATION ASSESSMENT:');
    
    if (totalStudents === 0) {
      console.log('   ❌ No students found in any classes');
      console.log('   🎯 RECOMMENDATION: No migration needed - create some test data first');
      
    } else if (usersWithIssues > totalUsers * 0.1) {
      console.log(`   ⚠️ High number of users with issues (${usersWithIssues}/${totalUsers})`);
      console.log('   🎯 RECOMMENDATION: Fix critical issues before migration');
      
    } else {
      console.log('   ✅ Database structure looks good for migration!');
      
      const estimatedTime = Math.ceil(totalUsers * 0.5 + totalClasses * 0.2 + totalStudents * 0.1);
      console.log(`   ⏱️ Estimated migration time: ${estimatedTime} seconds`);
      console.log(`   📦 Will create: ${totalClasses} class documents, ${totalStudents} student documents`);
      
      console.log('\n🎯 MIGRATION READINESS:');
      console.log(`   Users to migrate: ${usersWithClasses}/${totalUsers}`);
      console.log(`   Classes to migrate: ${totalClasses}`);
      console.log(`   Students to migrate: ${totalStudents}`);
      
      if (usersWithDataIssues.length === 0) {
        console.log('   ✅ No critical data issues found');
        console.log('   ✅ READY TO MIGRATE!');
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('   1. Test your application works (try adding XP to students)');
        console.log('   2. Run migration: node scripts/run-migration.js');
        console.log('   3. Test application after migration');
        
      } else {
        console.log(`   ⚠️ ${usersWithDataIssues.length} users have minor issues`);
        console.log('   🎯 Consider fixing issues or proceed with caution');
        
        console.log('\n🔧 OPTIONS:');
        console.log('   1. Proceed with migration (minor issues will be cleaned up)');
        console.log('   2. Fix issues manually first (safer)');
        console.log('   3. Test with a subset of users first');
      }
    }
    
    console.log('\n✅ Full database analysis completed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the analysis
analyzeAllUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script crashed:', error);
    process.exit(1);
  });