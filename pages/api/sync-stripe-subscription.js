// pages/api/sync-stripe-subscription.js - FIXED version
// Fixes:
// 1. Stripe client now has a hard 10s timeout + 1 retry. This endpoint was
//    hitting Vercel's 300-second function timeout (visible as 504s in the
//    logs), which left users staring at "Signing In..." for 5 minutes.
// 2. Customer lookup falls back to Stripe *search by firebaseUserId metadata*
//    if the email lookup finds nothing (covers users who paid in Stripe
//    Checkout with a different email than their login email).
// 3. User doc write uses set(..., { merge: true }) instead of update(), so a
//    missing/partial user doc is repaired instead of throwing.
import Stripe from 'stripe';
import { adminFirestore } from '../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  timeout: 10000,        // 10s per request — fail fast instead of hanging login
  maxNetworkRetries: 1
});

// Cap the whole function at 30s so it can never hold a login hostage
export const config = {
  maxDuration: 30
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail } = req.body || {};

    if (!userId || !userEmail) {
      return res.status(400).json({ error: 'Missing userId or userEmail' });
    }

    // 1) Find the Stripe customer by email
    let customer = null;
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (customers.data.length) {
      customer = customers.data[0];
    } else {
      // 2) Fall back to searching by the Firebase user ID we stamp into
      //    customer metadata at checkout-session creation time.
      try {
        const found = await stripe.customers.search({
          query: `metadata['firebaseUserId']:'${userId}'`,
          limit: 1
        });
        if (found.data.length) {
          customer = found.data[0];
        }
      } catch (searchError) {
        console.warn('Stripe customer metadata search failed:', searchError.message);
      }
    }

    if (!customer) {
      return res.status(200).json({ updated: false, reason: 'no_customer' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10
    });

    const activeSubscription = subscriptions.data.find((subscription) =>
      ['active', 'trialing', 'trial'].includes(subscription.status)
    );

    if (!activeSubscription) {
      return res.status(200).json({ updated: false, reason: 'no_active_subscription' });
    }

    // FIXED: set + merge repairs a missing/partial user doc instead of throwing
    await adminFirestore.collection('users').doc(userId).set({
      email: userEmail,
      stripeCustomerId: customer.id,
      subscription: 'educational-elements',
      subscriptionId: activeSubscription.id,
      subscriptionStatus: activeSubscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({ updated: true });
  } catch (error) {
    console.error('Stripe subscription sync failed:', error);
    return res.status(500).json({ error: 'Failed to sync subscription' });
  }
}
