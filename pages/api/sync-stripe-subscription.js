import Stripe from 'stripe';
import { adminFirestore } from '../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (!customers.data.length) {
      return res.status(200).json({ updated: false, reason: 'no_customer' });
    }

    const customer = customers.data[0];
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

    await adminFirestore.collection('users').doc(userId).update({
      stripeCustomerId: customer.id,
      subscription: 'educational-elements',
      subscriptionId: activeSubscription.id,
      subscriptionStatus: activeSubscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ updated: true });
  } catch (error) {
    console.error('Stripe subscription sync failed:', error);
    return res.status(500).json({ error: 'Failed to sync subscription' });
  }
}
