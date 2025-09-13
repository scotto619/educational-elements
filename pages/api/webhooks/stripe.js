// pages/api/webhooks/stripe.js - FIXED VERSION for V2 trial format
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Use Firebase Admin SDK for server-side operations
let adminFirestore;
try {
  const admin = require('firebase-admin');
  
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
  
  adminFirestore = admin.firestore();
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to get raw body
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  let event;

  try {
    // Get raw body buffer
    const buf = await getRawBody(req);
    const sig = req.headers['stripe-signature'];

    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Processing webhook event:', event.type);

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
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session) {
  // FIXED: Use correct field name that matches create-checkout-session.js
  const firebaseUserId = session.metadata?.firebaseUserId;
  const customerId = session.customer;

  if (!firebaseUserId) {
    console.error('No Firebase user ID in checkout session metadata');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user record in Firebase with V2 trial format
    const userRef = adminFirestore.collection('users').doc(firebaseUserId);
    
    const updateData = {
      stripeCustomerId: customerId,
      subscription: 'educational-elements',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date().toISOString(),
      lastPayment: new Date().toISOString()
    };

    // FIXED: Set V2 trial format that dashboard expects
    if (subscription.status === 'trialing' && subscription.trial_end) {
      updateData.freeAccessUntil = new Date(subscription.trial_end * 1000).toISOString();
      updateData.isTrialUser = true;
      updateData.trialUntil = new Date(subscription.trial_end * 1000).toISOString(); // Keep V1 for compatibility
      console.log(`🆓 Trial subscription created for user ${firebaseUserId} until ${updateData.freeAccessUntil}`);
    }

    await userRef.update(updateData);

    console.log(`✅ Subscription activated for user ${firebaseUserId}: educational-elements`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
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
    
    const updateData = {
      stripeCustomerId: customerId,
      subscription: 'educational-elements',
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      planType: 'educational-elements',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date().toISOString()
    };

    // FIXED: Handle trial subscriptions with V2 format
    if (subscription.status === 'trialing' && subscription.trial_end) {
      updateData.freeAccessUntil = new Date(subscription.trial_end * 1000).toISOString();
      updateData.isTrialUser = true;
      updateData.trialUntil = new Date(subscription.trial_end * 1000).toISOString(); // Keep V1 for compatibility
      console.log(`🆓 Trial user created: ${firebaseUserId} until ${updateData.freeAccessUntil}`);
    }

    await userRef.update(updateData);

    console.log(`✅ Created subscription for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  let firebaseUserId = subscription.metadata?.firebaseUserId;

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
      firebaseUserId = userDoc.id;
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

    // Handle subscription status changes with V2 trial format
    if (subscription.status === 'active') {
      updateData.subscription = 'educational-elements';
      
      // If transitioning from trial to active, clear trial data
      if (subscription.trial_end && new Date() > new Date(subscription.trial_end * 1000)) {
        updateData.isTrialUser = false;
        updateData.freeAccessUntil = null;
        updateData.trialUntil = null; // Clear V1 field too
        console.log(`🔄 User ${firebaseUserId} trial ended, now active subscriber`);
      }
    } else if (subscription.status === 'trialing') {
      updateData.subscription = 'educational-elements';
      updateData.isTrialUser = true;
      updateData.freeAccessUntil = new Date(subscription.trial_end * 1000).toISOString();
      updateData.trialUntil = new Date(subscription.trial_end * 1000).toISOString(); // Keep V1 for compatibility
      console.log(`🆓 User ${firebaseUserId} in trial until ${updateData.freeAccessUntil}`);
    } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
      updateData.subscription = 'cancelled';
      updateData.isTrialUser = false;
      updateData.freeAccessUntil = null;
      updateData.trialUntil = null;
    }

    await userRef.update(updateData);

    console.log(`✅ Updated subscription for user ${firebaseUserId}, status: ${subscription.status}`);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  let firebaseUserId = subscription.metadata?.firebaseUserId;

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
      firebaseUserId = userDoc.id;
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
      isTrialUser: false,
      freeAccessUntil: null,
      trialUntil: null,
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`🚫 Subscription cancelled for user ${firebaseUserId}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
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
  }
}