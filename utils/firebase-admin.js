// utils/firebase-admin.js - Firebase Admin SDK configuration for Educational Elements
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
const apps = getApps();
let adminApp;

if (apps.length === 0) {
  try {
    // Parse the private key (handle newlines properly)
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
} else {
  adminApp = apps[0];
}

// Export Firebase Admin services
export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);

// Helper functions for Educational Elements

/**
 * Create a new user document with Educational Elements structure
 */
export async function createUserDocument(userId, userData) {
  const userRef = adminFirestore.collection('users').doc(userId);
  
  const defaultUserData = {
    email: userData.email,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    classes: [],
    subscription: null,
    subscriptionStatus: null,
    stripeCustomerId: null,
    discountCodeUsed: null,
    freeAccessUntil: null,
    activeClassId: null,
    planType: null,
    currentPeriodEnd: null,
    ...userData
  };

  await userRef.set(defaultUserData);
  return defaultUserData;
}

/**
 * Get user data with subscription and access status
 */
export async function getUserWithAccessStatus(userId) {
  const userRef = adminFirestore.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  const now = new Date();
  
  // Check if user has active access
  const hasFreeAccess = userData.freeAccessUntil && new Date(userData.freeAccessUntil) > now;
  const hasActiveSubscription = userData.subscription && userData.subscription !== 'cancelled';
  
  return {
    ...userData,
    hasAccess: hasFreeAccess || hasActiveSubscription,
    accessType: hasFreeAccess ? 'free' : hasActiveSubscription ? 'subscription' : 'none',
    accessExpiresAt: hasFreeAccess ? userData.freeAccessUntil : userData.currentPeriodEnd
  };
}

/**
 * Apply discount code to user
 */
export async function applyDiscountCodeToUser(userId, discountCode) {
  const validCodes = {
    'LAUNCH2025': {
      type: 'free_access',
      expiresAt: '2026-01-31T23:59:59.999Z',
      description: 'Free access until January 31, 2026'
    }
  };

  const code = discountCode.toUpperCase();
  const codeInfo = validCodes[code];

  if (!codeInfo) {
    throw new Error('Invalid discount code');
  }

  const userRef = adminFirestore.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const userData = userDoc.data();

  // Check if code already used
  if (userData.discountCodeUsed === code) {
    throw new Error('Discount code already applied');
  }

  // Check if user has active subscription
  if (userData.subscription && userData.subscription !== 'cancelled') {
    throw new Error('Cannot apply discount to account with active subscription');
  }

  // Apply the discount
  const updateData = {
    discountCodeUsed: code,
    freeAccessUntil: codeInfo.expiresAt,
    discountAppliedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Clear cancelled subscription status if present
  if (userData.subscription === 'cancelled') {
    updateData.subscription = null;
    updateData.subscriptionStatus = null;
  }

  await userRef.update(updateData);

  // Log usage
  await adminFirestore.collection('discount_code_usage').add({
    userId: userId,
    userEmail: userData.email,
    discountCode: code,
    appliedAt: new Date().toISOString(),
    expiresAt: codeInfo.expiresAt,
    type: codeInfo.type
  });

  return {
    success: true,
    message: codeInfo.description,
    expiresAt: codeInfo.expiresAt
  };
}

/**
 * Update user subscription status from Stripe webhook
 */
export async function updateUserSubscription(userId, subscriptionData) {
  const userRef = adminFirestore.collection('users').doc(userId);
  
  const updateData = {
    stripeCustomerId: subscriptionData.customerId,
    subscription: subscriptionData.status === 'active' ? 'educational-elements' : 'cancelled',
    subscriptionId: subscriptionData.subscriptionId,
    subscriptionStatus: subscriptionData.status,
    planType: 'educational-elements',
    currentPeriodEnd: subscriptionData.currentPeriodEnd,
    updatedAt: new Date().toISOString()
  };

  // Clear free access if they now have a paid subscription
  if (subscriptionData.status === 'active') {
    updateData.freeAccessUntil = null;
  }

  await userRef.update(updateData);
  return updateData;
}

/**
 * Get user's active class
 */
export async function getUserActiveClass(userId) {
  const userData = await getUserWithAccessStatus(userId);
  
  if (!userData || !userData.hasAccess) {
    return null;
  }

  const activeClassId = userData.activeClassId;
  if (!activeClassId || !userData.classes) {
    return null;
  }

  const activeClass = userData.classes.find(cls => cls.id === activeClassId);
  return activeClass || null;
}

/**
 * Cleanup expired free access accounts (run this periodically)
 */
export async function cleanupExpiredAccess() {
  const now = new Date().toISOString();
  
  const expiredUsersQuery = adminFirestore.collection('users')
    .where('freeAccessUntil', '<', now)
    .where('subscription', '==', null);

  const expiredUsers = await expiredUsersQuery.get();
  
  const batch = adminFirestore.batch();
  let count = 0;

  expiredUsers.forEach(doc => {
    const userRef = doc.ref;
    batch.update(userRef, {
      freeAccessUntil: null,
      accessExpiredAt: now,
      updatedAt: now
    });
    count++;
  });

  if (count > 0) {
    await batch.commit();
    console.log(`✅ Cleaned up ${count} expired free access accounts`);
  }

  return count;
}

// Export the app for other uses
export default adminApp;