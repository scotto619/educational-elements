// scripts/quick-debug.mjs - Quick debug of your specific issue
import { config } from 'dotenv';
config({ path: '.env.local' });

import admin from 'firebase-admin';

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
}

const db = admin.firestore();

async function quickDebug() {
  console.log('🔍 Quick debug of your dashboard issue...\n');
  
  try {
    // Check what's in each collection
    const usersSnap = await db.collection('users').get();
    const classesSnap = await db.collection('classes').get();
    const studentsSnap = await db.collection('students').get();
    
    console.log(`📊 Collection counts:`);
    console.log(`   Users: ${usersSnap.size}`);
    console.log(`   V2 Classes: ${classesSnap.size}`);
    console.log(`   V2 Students: ${studentsSnap.size}\n`);
    
    // Find your user account and show details
    let yourUser = null;
    usersSnap.docs.forEach(doc => {
      const userData = doc.data();
      console.log(`👤 User: ${userData.email || doc.id.substring(0, 10)}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   V2 Migrated: ${userData.version === '2.0' ? 'YES' : 'NO'}`);
      console.log(`   V1 Classes: ${userData.classes?.length || 0}`);
      console.log(`   Active Class: ${userData.activeClassId || 'None'}\n`);
      
      if (userData.classes && userData.classes.length > 0) {
        yourUser = doc.id;
      }
    });
    
    // Check V2 classes
    if (classesSnap.size > 0) {
      console.log(`📚 V2 Classes found:`);
      classesSnap.docs.forEach(doc => {
        const classData = doc.data();
        console.log(`   ${classData.name}`);
        console.log(`     Teacher ID: ${classData.teacherId}`);
        console.log(`     Class Code: ${classData.classCode || 'None'}`);
        console.log(`     Students: ${classData.studentCount || 0}\n`);
      });
    } else {
      console.log(`❌ No V2 classes found - this is the problem!`);
      console.log(`   Your migration may not have completed properly.\n`);
    }
    
    // Recommendation
    console.log(`🎯 DIAGNOSIS:`);
    if (classesSnap.size === 0) {
      console.log(`❌ No V2 classes exist - migration incomplete`);
      console.log(`   Your dashboard tries V2 first, fails, then falls back to V1`);
      console.log(`   But your V1 data shows 0 classes too\n`);
      
      console.log(`🔧 SOLUTIONS:`);
      console.log(`   1. Re-run the migration script`);
      console.log(`   2. OR temporarily force V1 mode in dashboard.js`);
      console.log(`   3. OR create a new class to test\n`);
      
      if (yourUser) {
        console.log(`✅ Your V1 data exists, so re-migration should work`);
      } else {
        console.log(`❌ No V1 data found either - may need to create classes first`);
      }
    } else {
      console.log(`✅ V2 classes exist - rules issue`);
      console.log(`   Wait 2-3 minutes for rules to propagate, then refresh browser`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

quickDebug()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });