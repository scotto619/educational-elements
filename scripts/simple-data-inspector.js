// scripts/simple-data-inspector.js - Simple, robust data analysis
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

async function inspectData() {
  console.log('🔍 Inspecting your Educational Elements data...\n');
  
  try {
    // Get the single user
    console.log('📋 Step 1: Getting user data...');
    const usersSnapshot = await firestore.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No users found');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    console.log(`✅ Found user: ${userId.substring(0, 10)}...`);
    
    // Inspect user structure safely
    console.log('\n📋 Step 2: User data structure analysis...');
    console.log(`   Has email: ${!!userData.email}`);
    console.log(`   Email: ${userData.email || 'Missing'}`);
    console.log(`   Has classes: ${!!(userData.classes && userData.classes.length > 0)}`);
    console.log(`   Class count: ${userData.classes?.length || 0}`);
    
    if (!userData.email) {
      console.log('⚠️ WARNING: User missing email field');
    }
    
    if (!userData.classes || userData.classes.length === 0) {
      console.log('⚠️ WARNING: User has no classes');
      console.log('\n🎯 RECOMMENDATION: Create a class in your application first');
      console.log('   1. Log into your application');
      console.log('   2. Create a class with some students');
      console.log('   3. Add some XP to test the system');
      console.log('   4. Then run this analysis again');
      return;
    }
    
    // Inspect classes safely
    console.log('\n📋 Step 3: Class data analysis...');
    let totalClasses = 0;
    let totalStudents = 0;
    let classesWithIssues = 0;
    
    for (let i = 0; i < userData.classes.length; i++) {
      const cls = userData.classes[i];
      totalClasses++;
      
      console.log(`\n   Class ${i + 1}:`);
      console.log(`     Name: ${cls.name || 'Unnamed Class'}`);
      console.log(`     ID: ${cls.id || cls.classId || 'Missing ID'}`);
      console.log(`     Code: ${cls.classCode || 'No class code'}`);
      console.log(`     Students: ${cls.students?.length || 0}`);
      
      // Check for issues
      if (!cls.id && !cls.classId) {
        console.log('     ⚠️ Issue: Missing class ID');
        classesWithIssues++;
      }
      
      if (!cls.name) {
        console.log('     ⚠️ Issue: Missing class name');
        classesWithIssues++;
      }
      
      // Inspect students safely
      if (cls.students && cls.students.length > 0) {
        totalStudents += cls.students.length;
        
        const sampleStudent = cls.students[0];
        console.log(`\n     Sample Student:`);
        console.log(`       Name: ${sampleStudent.firstName || 'No name'} ${sampleStudent.lastName || ''}`);
        console.log(`       ID: ${sampleStudent.id || 'Missing ID'}`);
        console.log(`       XP: ${sampleStudent.totalPoints ?? 'Not set'}`);
        console.log(`       Coins: ${sampleStudent.currency ?? 'Not set'}`);
        console.log(`       Avatar: ${sampleStudent.avatarBase || 'Not set'}`);
        
        // Check student data integrity
        if (!sampleStudent.id) {
          console.log('       ⚠️ Issue: Student missing ID');
        }
        
        if (typeof sampleStudent.totalPoints !== 'number') {
          console.log('       ⚠️ Issue: totalPoints is not a number');
        }
        
        if (typeof sampleStudent.currency !== 'number') {
          console.log('       ⚠️ Issue: currency is not a number');
        }
      }
    }
    
    // Summary
    console.log('\n📊 DATA SUMMARY:');
    console.log(`   Total users: 1`);
    console.log(`   Total classes: ${totalClasses}`);
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Classes with issues: ${classesWithIssues}`);
    
    // Migration assessment
    console.log('\n🚀 MIGRATION ASSESSMENT:');
    
    if (classesWithIssues === 0 && totalStudents > 0) {
      console.log('   ✅ Data structure looks good!');
      console.log('   ✅ Ready for migration');
      
      const estimatedTime = Math.ceil(totalClasses * 0.5 + totalStudents * 0.1);
      console.log(`   ⏱️ Estimated migration time: ${estimatedTime} seconds`);
      
      console.log('\n🎯 NEXT STEPS:');
      console.log('   1. Test your current application (add XP to students)');
      console.log('   2. If everything works, run: node scripts/run-migration.js');
      console.log('   3. After migration, test again to verify improvements');
      
    } else {
      console.log('   ⚠️ Issues found that should be addressed:');
      
      if (classesWithIssues > 0) {
        console.log(`     - ${classesWithIssues} classes have data issues`);
        console.log('     - Consider recreating classes or fixing manually');
      }
      
      if (totalStudents === 0) {
        console.log('     - No students found');
        console.log('     - Add some students to your classes first');
      }
      
      console.log('\n🔧 RECOMMENDATIONS:');
      console.log('   1. Fix the issues listed above');
      console.log('   2. Test your application works correctly');
      console.log('   3. Run this analysis again');
      console.log('   4. Proceed with migration when issues are resolved');
    }
    
    console.log('\n✅ Analysis completed');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    
    if (error.message.includes('permission')) {
      console.log('\n🔧 Possible solutions:');
      console.log('   1. Check your Firebase security rules');
      console.log('   2. Ensure your service account has proper permissions');
      console.log('   3. Verify your project ID is correct');
    }
  }
}

// Run the analysis
inspectData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script crashed:', error);
    process.exit(1);
  });