// pages/api/strip-webhook.js - FIXED version
import { buffer } from 'micro';
import Stripe from 'stripe';
import { adminAuth, adminFirestore } from '../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  console.log(`Received Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session) {
  const firebaseUserId = session.metadata?.firebaseUserId;
  const customerId = session.customer;

  if (!firebaseUserId) {
    console.error('No Firebase user ID in checkout session metadata');
    return;
  }

  try {
    // Get customer and subscription details
    const customer = await stripe.customers.retrieve(customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      console.error('No active subscription found for customer');
      return;
    }

    const subscription = subscriptions.data[0];
    
    // Update user document in Firestore
    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    await userRef.update({
      stripeCustomerId: customerId,
      subscription: 'educational-elements',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date().toISOString(),
      freeAccessUntil: null // Clear any free access since they now have a paid subscription
    });

    console.log(`✅ Updated user ${firebaseUserId} with Educational Elements subscription`);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
    throw error;
  }
}

async function handleSubscriptionCreated(subscription) {
  const firebaseUserId = subscription.metadata?.firebaseUserId;
  const customerId = subscription.customer;

  if (!firebaseUserId) {
    console.error('No Firebase user ID in subscription metadata');
    return;
  }

  try {
    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    await userRef.update({
      stripeCustomerId: customerId,
      subscription: 'educational-elements',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Created subscription for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  let firebaseUserId = subscription.metadata?.firebaseUserId; // FIXED: Changed from const to let

  if (!firebaseUserId) {
    // Try to find user by customer ID
    try {
      const usersSnapshot = await adminFirestore.collection('users')
        .where('stripeCustomerId', '==', subscription.customer)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        console.error('No user found for customer ID:', subscription.customer);
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      firebaseUserId = userDoc.id; // Now this works because firebaseUserId is let, not const
    } catch (error) {
      console.error('Error finding user by customer ID:', error);
      return;
    }
  }

  try {
    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    const updateData = {
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date().toISOString()
    };

    // Handle subscription status changes
    if (subscription.status === 'active') {
      updateData.subscription = 'educational-elements';
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      updateData.subscription = 'cancelled';
    }

    await userRef.update(updateData);

    console.log(`✅ Updated subscription for user ${firebaseUserId}, status: ${subscription.status}`);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  let firebaseUserId = subscription.metadata?.firebaseUserId; // FIXED: Changed from const to let

  if (!firebaseUserId) {
    // Try to find user by customer ID
    try {
      const usersSnapshot = await adminFirestore.collection('users')
        .where('stripeCustomerId', '==', subscription.customer)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        console.error('No user found for customer ID:', subscription.customer);
        return;
      }

      const userDoc = usersSnapshot.docs[0];
      firebaseUserId = userDoc.id; // Now this works because firebaseUserId is let, not const
    } catch (error) {
      console.error('Error finding user by customer ID:', error);
      return;
    }
  }

  try {
    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    await userRef.update({
      subscription: 'cancelled',
      subscriptionStatus: 'canceled',
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Cancelled subscription for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    console.log('Invoice not associated with subscription, skipping');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const firebaseUserId = subscription.metadata?.firebaseUserId;

    if (!firebaseUserId) {
      console.error('No Firebase user ID in subscription metadata');
      return;
    }

    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    await userRef.update({
      subscriptionStatus: 'active',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      lastPaymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✅ Payment succeeded for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  
  if (!subscriptionId) {
    console.log('Invoice not associated with subscription, skipping');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const firebaseUserId = subscription.metadata?.firebaseUserId;

    if (!firebaseUserId) {
      console.error('No Firebase user ID in subscription metadata');
      return;
    }

    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    await userRef.update({
      subscriptionStatus: 'past_due',
      lastFailedPaymentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`⚠️ Payment failed for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}