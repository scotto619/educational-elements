import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
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
  } catch (error) {
    console.error('❌ Init failed:', error);
    process.exit(1);
  }
}

const firestore = admin.firestore();

async function testConnection() {
  console.log('🔍 Testing Firestore connection...');
  
  try {
    // Test 1: List collections
    console.log('📋 Listing collections...');
    const collections = await firestore.listCollections();
    console.log('✅ Collections found:', collections.map(c => c.id));
    
    // Test 2: Try to read users collection
    console.log('📋 Testing users collection access...');
    const usersRef = firestore.collection('users');
    const snapshot = await usersRef.limit(1).get();
    
    console.log('✅ Users collection accessible');
    console.log('📊 Users found:', snapshot.size);
    
    if (snapshot.empty) {
      console.log('⚠️ No users in database - this might be expected if you haven\'t created any yet');
    } else {
      console.log('📄 Sample user ID:', snapshot.docs[0].id);
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('🔍 Full error:', error);
  }
}

testConnection().then(() => {
  console.log('✅ Connection test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});