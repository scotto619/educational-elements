// pages/api/webhooks/stripe.js - FIXED VERSION with consistent imports
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { firestore } = require('../../../utils/firebase');
const { doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');

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
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
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
  const firebaseUid = session.metadata.firebaseUid;
  const plan = session.metadata.plan;

  if (!firebaseUid) {
    console.error('No Firebase UID in session metadata');
    return;
  }

  try {
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Update user record in Firebase
    const userDocRef = doc(firestore, 'users', firebaseUid);
    const userDoc = await getDoc(userDocRef);
    
    const userData = userDoc.exists() ? userDoc.data() : { classes: [] };
    
    await setDoc(userDocRef, {
      ...userData,
      subscription: plan,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      subscriptionStarted: new Date(),
      lastPayment: new Date()
    }, { merge: true });

    console.log(`✅ Subscription activated for user ${firebaseUid}: ${plan}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const firebaseUid = subscription.metadata.firebaseUid;

  if (!firebaseUid) return;

  try {
    const userDocRef = doc(firestore, 'users', firebaseUid);
    await updateDoc(userDocRef, {
      subscriptionStatus: 'active',
      lastPayment: new Date(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });

    console.log(`✅ Payment succeeded for user ${firebaseUid}`);
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const firebaseUid = subscription.metadata.firebaseUid;

  if (!firebaseUid) return;

  try {
    const userDocRef = doc(firestore, 'users', firebaseUid);
    await updateDoc(userDocRef, {
      subscriptionStatus: 'past_due',
      paymentFailed: new Date()
    });

    console.log(`❌ Payment failed for user ${firebaseUid}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const firebaseUid = subscription.metadata.firebaseUid;

  if (!firebaseUid) return;

  try {
    // Determine plan from price ID
    let plan = 'basic';
    if (subscription.items.data[0]) {
      const priceId = subscription.items.data[0].price.id;
      // Update with your actual Pro price ID
      if (priceId === 'price_1RhLfRCkfn6vIQTWRXsduvSu') {
        plan = 'pro';
      }
    }

    const userDocRef = doc(firestore, 'users', firebaseUid);
    await updateDoc(userDocRef, {
      subscription: plan,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });

    console.log(`🔄 Subscription updated for user ${firebaseUid}: ${plan}`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  const firebaseUid = subscription.metadata.firebaseUid;

  if (!firebaseUid) return;

  try {
    const userDocRef = doc(firestore, 'users', firebaseUid);
    await updateDoc(userDocRef, {
      subscription: 'cancelled',
      subscriptionStatus: 'canceled',
      cancelledAt: new Date()
    });

    console.log(`🚫 Subscription cancelled for user ${firebaseUid}`);
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}