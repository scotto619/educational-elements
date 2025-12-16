import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { adminAuth, adminFirestore } from '../../utils/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: true,
  },
};

// Send admin notification email
async function sendAdminNotification(userEmail, userId, stripeCustomerId, subscriptionId, stripeCanceled, reason) {
  try {
    // Create transporter using Gmail (you can change to your email provider)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'scotto6190@gmail.com',
        pass: process.env.EMAIL_PASSWORD // App password for Gmail
      }
    });

    const emailContent = `
Account Deletion Request

User Details:
- Email: ${userEmail}
- User ID: ${userId}
- Stripe Customer ID: ${stripeCustomerId || 'NOT SET'}
- Subscription ID: ${subscriptionId || 'NOT SET'}

Cancellation Result:
- Stripe Subscription Canceled: ${stripeCanceled ? '✅ YES' : '❌ NO - MANUAL ACTION REQUIRED'}

${reason ? `Reason given: ${reason}` : 'No reason provided'}

${!stripeCanceled ? `
⚠️ IMPORTANT: The Stripe subscription was NOT canceled automatically.
Please manually cancel the subscription in Stripe Dashboard:
https://dashboard.stripe.com/search?query=${stripeCustomerId || userEmail}
` : ''}

Time: ${new Date().toISOString()}
    `.trim();

    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'scotto6190@gmail.com',
      to: 'scotto6190@gmail.com',
      subject: `[Educational Elements] Account Deletion: ${userEmail}${!stripeCanceled ? ' ⚠️ MANUAL ACTION NEEDED' : ''}`,
      text: emailContent
    });

    console.log('✅ Admin notification email sent');
    return true;
  } catch (emailError) {
    console.error('⚠️ Failed to send admin notification email:', emailError.message);
    // Don't fail the whole request if email fails
    return false;
  }
}

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
    const userRef = adminFirestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    const userEmail = userData.email;
    const stripeCustomerId = userData.stripeCustomerId;
    const subscriptionId = userData.subscriptionId;

    console.log('📋 Account data:', {
      email: userEmail,
      stripeCustomerId,
      subscriptionId,
      currentStatus: userData.subscriptionStatus,
      subscription: userData.subscription
    });

    // Cancel any active Stripe subscription
    let stripeCanceled = false;
    let subscriptionToCancel = subscriptionId;
    let cancellationDetails = { method: 'none', subscriptionId: null, error: null };

    // If no subscriptionId stored, try to find subscription by customer ID
    if (!subscriptionToCancel && stripeCustomerId) {
      try {
        console.log('🔍 No subscriptionId stored, looking up subscriptions by customer:', stripeCustomerId);
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'all',
          limit: 10
        });

        console.log('📋 Found subscriptions:', subscriptions.data.map(s => ({
          id: s.id,
          status: s.status,
          created: new Date(s.created * 1000).toISOString()
        })));

        // Find the first active/trialing subscription
        const activeSub = subscriptions.data.find(sub =>
          ['active', 'trialing', 'past_due'].includes(sub.status)
        );

        if (activeSub) {
          subscriptionToCancel = activeSub.id;
          cancellationDetails.method = 'customer_lookup';
          console.log('✅ Found active subscription via customer lookup:', subscriptionToCancel);
        } else if (subscriptions.data.length > 0) {
          console.log('ℹ️ Customer has subscriptions but none are active');
          cancellationDetails.method = 'none_active';
        } else {
          console.log('ℹ️ No subscriptions found for customer');
          cancellationDetails.method = 'no_subscriptions';
        }
      } catch (lookupError) {
        console.error('⚠️ Error looking up subscriptions by customer:', lookupError.message);
        cancellationDetails.error = lookupError.message;
      }
    } else if (subscriptionToCancel) {
      cancellationDetails.method = 'stored_id';
    }

    if (subscriptionToCancel) {
      try {
        console.log('🔄 Canceling Stripe subscription:', subscriptionToCancel);

        // First, retrieve the subscription to check its current status
        const subStatus = await stripe.subscriptions.retrieve(subscriptionToCancel);
        console.log('📋 Current subscription status:', subStatus.status);

        if (subStatus.status === 'canceled') {
          console.log('ℹ️ Subscription is already canceled');
          stripeCanceled = true;
          cancellationDetails.subscriptionId = subscriptionToCancel;
        } else {
          const canceledSubscription = await stripe.subscriptions.cancel(subscriptionToCancel);
          console.log('✅ Stripe subscription canceled:', canceledSubscription.id, 'New Status:', canceledSubscription.status);
          stripeCanceled = true;
          cancellationDetails.subscriptionId = subscriptionToCancel;
        }
      } catch (stripeError) {
        console.error('⚠️ Error canceling Stripe subscription:', stripeError.message);
        console.error('⚠️ Full error:', JSON.stringify(stripeError, null, 2));
        cancellationDetails.error = stripeError.message;

        // If subscription is already canceled or doesn't exist, that's ok
        if (stripeError.message.includes('No such subscription') ||
          stripeError.message.includes('already been canceled') ||
          stripeError.code === 'resource_missing') {
          console.log('ℹ️ Subscription was already canceled or not found - marking as handled');
          stripeCanceled = true;
        }
      }
    } else {
      console.log('⚠️ No subscription ID found to cancel');
      cancellationDetails.method = stripeCustomerId ? 'no_sub_found' : 'no_customer_id';
    }

    // Persist cancellation details in Firestore
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
      currentPeriodEnd: null,
      // Store cancellation details for debugging
      cancellationDetails: {
        stripeCanceled,
        cancellationMethod: cancellationDetails.method,
        canceledSubscriptionId: cancellationDetails.subscriptionId,
        error: cancellationDetails.error,
        timestamp: new Date().toISOString()
      }
    };

    await userRef.update(updateData);
    console.log('✅ Firestore cancellation recorded for user:', userId);

    // Send admin notification email
    await sendAdminNotification(
      userEmail,
      userId,
      stripeCustomerId,
      subscriptionToCancel,
      stripeCanceled,
      reason
    );

    console.log('ℹ️ Firebase Auth user preserved - user can log in and resubscribe');

    return res.status(200).json({
      success: true,
      stripeCanceled,
      cancellationDetails,
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
