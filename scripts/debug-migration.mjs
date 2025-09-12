import { config } from 'dotenv';
config({ path: '.env.local' });

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

async function debugMigrationSteps() {
  console.log('🔍 Testing migration steps one by one...');
  
  try {
    // Step 1: Test basic collection access
    console.log('📋 Step 1: Testing basic collection access...');
    const collections = await firestore.listCollections();
    console.log('✅ Collections accessible:', collections.map(c => c.id));
    
    // Step 2: Test users collection read
    console.log('📋 Step 2: Testing users collection read...');
    const usersSnapshot = await firestore.collection('users').limit(1).get();
    console.log('✅ Users collection readable, size:', usersSnapshot.size);
    
    // Step 3: Test transaction capability
    console.log('📋 Step 3: Testing transaction capability...');
    const result = await firestore.runTransaction(async (transaction) => {
      console.log('  🔄 Inside transaction...');
      const testRef = firestore.collection('users').limit(1);
      const testSnapshot = await transaction.get(testRef.limit(1));
      console.log('  ✅ Transaction read successful');
      return { success: true, count: testSnapshot.size };
    });
    console.log('✅ Transaction test passed:', result);
    
    // Step 4: Test write capability (non-destructive)
    console.log('📋 Step 4: Testing write capability...');
    const testRef = firestore.collection('_migration_test').doc('test');
    await testRef.set({ 
      testData: true, 
      timestamp: new Date().toISOString() 
    });
    console.log('✅ Write test successful');
    
    // Clean up test
    await testRef.delete();
    console.log('✅ Cleanup successful');
    
    console.log('\n🎯 All migration prerequisites passed!');
    console.log('The migration script should work. Let me check the migration logic...');
    
  } catch (error) {
    console.error('❌ Debug step failed:', error.message);
    console.error('Full error:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n🔧 Permission issue detected:');
      console.log('1. Check your Firebase security rules');
      console.log('2. Ensure your service account has Firestore permissions');
      console.log('3. Try updating your security rules to allow admin access');
    }
  }
}

debugMigrationSteps()
  .then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });