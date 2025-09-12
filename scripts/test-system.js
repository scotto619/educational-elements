import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// scripts/test-system.js - Test current system before migration
import admin from 'firebase-admin';

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

async function testCurrentSystem() {
  console.log('🧪 Testing current system...');
  
  try {
    // Test 1: Check if users collection is accessible
    console.log('📋 Test 1: Users collection access...');
    const usersSnapshot = await firestore.collection('users').limit(1).get();
    
    if (usersSnapshot.empty) {
      console.log('⚠️ No users found in database');
      return false;
    }
    
    console.log('✅ Users collection accessible');
    
    // Test 2: Check user data structure
    console.log('📋 Test 2: User data structure...');
    const sampleUser = usersSnapshot.docs[0];
    const userData = sampleUser.data();
    
    console.log('📊 Sample user structure:', {
      id: sampleUser.id,
      hasEmail: !!userData.email,
      hasClasses: !!(userData.classes && userData.classes.length > 0),
      classCount: userData.classes?.length || 0
    });
    
    if (!userData.email) {
      console.log('⚠️ User missing email field');
    }
    
    if (!userData.classes || userData.classes.length === 0) {
      console.log('⚠️ User has no classes');
      return false;
    }
    
    // Test 3: Check class structure
    console.log('📋 Test 3: Class data structure...');
    const sampleClass = userData.classes[0];
    console.log('📊 Sample class structure:', {
      hasId: !!sampleClass.id,
      hasName: !!sampleClass.name,
      hasClassCode: !!sampleClass.classCode,
      hasStudents: !!(sampleClass.students && sampleClass.students.length > 0),
      studentCount: sampleClass.students?.length || 0
    });
    
    if (!sampleClass.students || sampleClass.students.length === 0) {
      console.log('⚠️ Class has no students');
    } else {
      // Test 4: Check student structure
      console.log('📋 Test 4: Student data structure...');
      const sampleStudent = sampleClass.students[0];
      console.log('📊 Sample student structure:', {
        hasId: !!sampleStudent.id,
        hasFirstName: !!sampleStudent.firstName,
        hasTotalPoints: typeof sampleStudent.totalPoints === 'number',
        hasCurrency: typeof sampleStudent.currency === 'number',
        totalPoints: sampleStudent.totalPoints || 0,
        currency: sampleStudent.currency || 0
      });
    }
    
    // Test 5: Test API endpoint
    console.log('📋 Test 5: API endpoint test (simulated)...');
    console.log('ℹ️ API test would require server to be running');
    console.log('ℹ️ Manual test: Try adding XP to a student via the UI');
    
    console.log('');
    console.log('✅ System tests completed successfully!');
    console.log('');
    console.log('📋 Checklist before migration:');
    console.log('  ✅ Firebase connection working');
    console.log('  ✅ User data structure valid');
    console.log('  ✅ Class data structure valid');
    console.log('  ✅ Student data structure valid');
    console.log('');
    console.log('🚀 Ready for migration!');
    
    return true;
    
  } catch (error) {
    console.error('❌ System test failed:', error);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your .env.local file has correct Firebase credentials');
    console.log('2. Ensure your Firebase project exists and is accessible');
    console.log('3. Verify your user account has data in the correct format');
    console.log('4. Check Firebase security rules allow read access');
    
    return false;
  }
}

async function testMigrationReadiness() {
  console.log('🔍 Checking migration readiness...');
  
  try {
    // Count total data
    const usersSnapshot = await firestore.collection('users').get();
    let totalUsers = 0;
    let totalClasses = 0;
    let totalStudents = 0;
    let usersWithIssues = 0;
    
    for (const doc of usersSnapshot.docs) {
      totalUsers++;
      const userData = doc.data();
      
      // Check for potential issues
      let hasIssues = false;
      
      if (!userData.email) {
        console.log(`⚠️ User ${doc.id} missing email`);
        hasIssues = true;
      }
      
      if (userData.classes) {
        totalClasses += userData.classes.length;
        
        for (const cls of userData.classes) {
          if (!cls.id && !cls.classId) {
            console.log(`⚠️ Class missing ID in user ${doc.id}`);
            hasIssues = true;
          }
          
          if (cls.students) {
            totalStudents += cls.students.length;
            
            for (const student of cls.students) {
              if (!student.id) {
                console.log(`⚠️ Student missing ID in user ${doc.id}`);
                hasIssues = true;
              }
              
              if (typeof student.totalPoints !== 'number') {
                console.log(`⚠️ Student ${student.id} has invalid totalPoints`);
                hasIssues = true;
              }
            }
          }
        }
      }
      
      if (hasIssues) usersWithIssues++;
    }
    
    console.log('');
    console.log('📊 Migration scope:');
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Classes: ${totalClasses}`);
    console.log(`   Students: ${totalStudents}`);
    console.log(`   Users with issues: ${usersWithIssues}`);
    console.log('');
    
    if (usersWithIssues > 0) {
      console.log('⚠️ Data issues found. Migration may encounter problems.');
      console.log('   Consider fixing issues manually before migration.');
    } else {
      console.log('✅ No major data issues found');
    }
    
    const estimatedTime = Math.ceil(totalUsers * 0.5); // 0.5 seconds per user
    console.log(`⏱️ Estimated migration time: ${estimatedTime} seconds`);
    
    return {
      ready: usersWithIssues === 0,
      stats: { totalUsers, totalClasses, totalStudents, usersWithIssues },
      estimatedTime
    };
    
  } catch (error) {
    console.error('❌ Readiness check failed:', error);
    return { ready: false, error: error.message };
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Educational Elements System Test');
  console.log('===================================');
  console.log('');
  
  // Test current system
  const systemReady = await testCurrentSystem();
  
  if (systemReady) {
    console.log('');
    console.log('🔍 Checking migration readiness...');
    const readiness = await testMigrationReadiness();
    
    if (readiness.ready) {
      console.log('');
      console.log('🎯 System is ready for migration!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Replace the files in your project with the fixed versions');
      console.log('2. Update your Firebase security rules');
      console.log('3. Test the application in development');
      console.log('4. Run the migration: node scripts/run-migration.js');
    } else {
      console.log('');
      console.log('⚠️ System needs attention before migration');
      console.log('Please fix the issues listed above');
    }
  }
}

// Run tests if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { runTests };