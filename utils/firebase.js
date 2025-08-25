// utils/firebase.js - FIXED Firebase Configuration with Database URL
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Firebase configuration - these should be set in your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // CRITICAL FIX: Added missing databaseURL for Realtime Database
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate critical configuration before initialization
if (typeof window !== 'undefined') {
  const requiredConfig = {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    databaseURL: firebaseConfig.databaseURL  // REQUIRED for Realtime Database
  };

  const missingConfig = Object.entries(requiredConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingConfig.length > 0) {
    console.error('❌ Missing required Firebase configuration:', missingConfig);
    console.error('Please add these environment variables to your .env.local file:');
    missingConfig.forEach(key => {
      const envVar = `NEXT_PUBLIC_FIREBASE_${key.toUpperCase().replace('URL', '_URL')}`;
      console.error(`- ${envVar}`);
    });
  }
}

let app;
let auth;
let firestore;
let database;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);
  
  // Initialize Cloud Firestore and get a reference to the service
  firestore = getFirestore(app);
  
  // Initialize Realtime Database and get a reference to the service
  database = getDatabase(app);
  
  console.log('✅ Firebase initialized successfully');
  
  // Log database URL for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 Database URL:', firebaseConfig.databaseURL || 'NOT SET');
  }
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export { auth, firestore, database };
export default app;