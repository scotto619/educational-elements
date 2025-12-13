// pages/api/cancel-subscription.js - NEW API to properly cancel Stripe subscriptions

import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    console.log('🚫 Processing cancellation for user:', userId);

    // Get user's Stripe customer and subscription info from Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;
    const subscriptionId = userData.subscriptionId;

    console.log('📋 User data:', { 
      stripeCustomerId, 
      subscriptionId,
      currentStatus: userData.subscriptionStatus 
    });

    // Cancel Stripe subscription if it exists
    let stripeCanceled = false;
    if (subscriptionId) {
      try {
        console.log('🔄 Canceling Stripe subscription:', subscriptionId);
        
        // Cancel subscription immediately (change to cancel_at_period_end: true if you want them to keep access until period ends)
        const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
        
        console.log('✅ Stripe subscription canceled:', canceledSubscription.id);
        stripeCanceled = true;
      } catch (stripeError) {
        console.error('⚠️ Error canceling Stripe subscription:', stripeError.message);
        // Continue anyway - we still want to update Firestore
      }
    } else {
      console.log('ℹ️ No active subscription ID found');
    }

    // Update Firestore with cancellation details
    const updateData = {
      accountStatus: 'canceled', // Changed from 'deleted' to 'canceled'
      subscriptionStatus: 'canceled',
      subscription: 'cancelled',
      loginDisabled: false, // IMPORTANT: Don't disable login - allow them to resubscribe
      canceledAt: new Date().toISOString(),
      cancelReason: reason || null,
      updatedAt: new Date().toISOString(),
      // Clear trial data
      isTrialUser: false,
      freeAccessUntil: null,
      trialUntil: null
    };

    await userRef.update(updateData);

    console.log('✅ Firestore updated for user:', userId);

    return res.status(200).json({ 
      success: true,
      stripeCanceled,
      message: stripeCanceled 
        ? 'Subscription canceled successfully' 
        : 'Account marked as canceled (no active subscription found)'
    });

  } catch (error) {
    console.error('❌ Error in cancel-subscription:', error);
    return res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
}