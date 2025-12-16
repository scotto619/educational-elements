import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const adminAuth = getAuth();

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    console.log('🚫 Processing full account deletion for user:', userId);

    // Pull the user's subscription metadata
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;
    const subscriptionId = userData.subscriptionId;

    console.log('📋 Account data:', {
      stripeCustomerId,
      subscriptionId,
      currentStatus: userData.subscriptionStatus,
    });

    // Cancel any active Stripe subscription
    let stripeCanceled = false;
    if (subscriptionId) {
      try {
        console.log('🔄 Canceling Stripe subscription:', subscriptionId);
        const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
        console.log('✅ Stripe subscription canceled:', canceledSubscription.id);
        stripeCanceled = true;
      } catch (stripeError) {
        console.error('⚠️ Error canceling Stripe subscription:', stripeError.message);
      }
    }

    // Persist cancellation details in Firestore so the user can come back later
    const updateData = {
      accountStatus: 'canceled',
      subscriptionStatus: 'canceled',
      subscription: 'cancelled',
      subscriptionId: null,
      loginDisabled: false,
      canceledAt: new Date().toISOString(),
      cancelReason: reason || null,
      updatedAt: new Date().toISOString(),
      isTrialUser: false,
      freeAccessUntil: null,
      trialUntil: null,
    };

    await userRef.update(updateData);
    console.log('✅ Firestore cancellation recorded for user:', userId);

    // NOTE: We do NOT delete the Firebase Auth user here.
    // This allows the user to log back in and resubscribe to regain access to their classes.
    // Access control is handled by checking subscriptionStatus in the dashboard.
    console.log('ℹ️ Firebase Auth user preserved - user can log in and resubscribe');

    return res.status(200).json({
      success: true,
      stripeCanceled,
      message: 'Subscription canceled. You can resubscribe anytime to regain access.',
    });
  } catch (error) {
    console.error('❌ Error in delete-account:', error);
    return res.status(500).json({
      error: 'Failed to delete account',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
    });
  }
}
