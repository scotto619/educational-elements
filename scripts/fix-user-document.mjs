// scripts/fix-user-document.mjs - Fix your user document data
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

async function fixUserDocument() {
  console.log('🔧 Fixing your user document...\n');
  
  const YOUR_USER_ID = 'rSMUzgSQcoMDLKCouKNzN8a2NCt2';
  const YOUR_EMAIL = 'scotto6190@gmail.com';
  const YOUR_CLASS_NAME = '5B 2025';
  
  try {
    // Step 1: Find your class ID
    console.log('📚 Step 1: Finding your class...');
    const classesSnapshot = await db.collection('classes').get();
    let yourClassId = null;
    
    for (const doc of classesSnapshot.docs) {
      const classData = doc.data();
      if (classData.name === YOUR_CLASS_NAME && classData.teacherId === YOUR_USER_ID) {
        yourClassId = doc.id;
        console.log(`✅ Found your class: ${YOUR_CLASS_NAME}`);
        console.log(`   Class ID: ${yourClassId}`);
        console.log(`   Students: ${classData.studentCount}`);
        console.log(`   Class Code: ${classData.classCode}`);
        break;
      }
    }
    
    if (!yourClassId) {
      console.log(`❌ Could not find your class "${YOUR_CLASS_NAME}"`);
      return;
    }
    
    // Step 2: Check current user document
    console.log('\n👤 Step 2: Checking your user document...');
    const userRef = db.collection('users').doc(YOUR_USER_ID);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ User document not found!');
      return;
    }
    
    const currentData = userDoc.data();
    console.log('Current user data:');
    console.log(`   Email: ${currentData.email}`);
    console.log(`   Active Class: ${currentData.activeClassId}`);
    console.log(`   Version: ${currentData.version}`);
    
    // Step 3: Update user document
    console.log('\n🔄 Step 3: Updating user document...');
    
    const updates = {
      email: YOUR_EMAIL, // Fix email
      activeClassId: yourClassId, // Set correct active class
      updatedAt: new Date().toISOString()
    };
    
    await userRef.update(updates);
    console.log('✅ User document updated successfully!');
    
    // Step 4: Verify the fix
    console.log('\n🔍 Step 4: Verifying the fix...');
    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data();
    
    console.log('Updated user data:');
    console.log(`   Email: ${updatedData.email}`);
    console.log(`   Active Class: ${updatedData.activeClassId}`);
    console.log(`   Version: ${updatedData.version}`);
    
    console.log('\n🎉 SUCCESS!');
    console.log('Your user document has been fixed. Now:');
    console.log('1. Refresh your dashboard page');
    console.log('2. Your "5B 2025" class should appear!');
    console.log('3. All 28 students should be there');
    
  } catch (error) {
    console.error('❌ Error fixing user document:', error.message);
  }
}

fixUserDocument()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });