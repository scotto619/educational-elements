// pages/api/create-checkout-session.js - FIXED VERSION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        userEmail, 
        userId, 
        trialSubscription = false,
        successUrl = `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl = `${req.headers.origin}/signup`
      } = req.body;

      // Validate required fields
      if (!userEmail || !userId) {
        return res.status(400).json({ error: 'Missing required fields: userEmail and userId' });
      }

      // Use the same price ID for both trial and regular subscriptions
      const priceId = process.env.STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS;

      if (!priceId) {
        console.error('Missing Stripe Price ID for Educational Elements');
        return res.status(500).json({ error: 'Pricing configuration error' });
      }

      // Create or retrieve customer
      let customer;
      try {
        const customers = await stripe.customers.list({
          email: userEmail,
          limit: 1
        });

        if (customers.data.length > 0) {
          customer = customers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              firebaseUserId: userId
            }
          });
        }
      } catch (error) {
        console.error('Error handling customer:', error);
        return res.status(500).json({ error: 'Failed to create customer' });
      }

      // Create checkout session
      const sessionConfig = {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          firebaseUserId: userId,
          planType: 'educational-elements',
          trialSubscription: trialSubscription.toString()
        },
        subscription_data: {
          metadata: {
            firebaseUserId: userId,
            planType: 'educational-elements',
            trialSubscription: trialSubscription.toString()
          }
        },
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      };

      // Handle trial subscriptions with 100% discount until Jan 2026
      if (trialSubscription) {
        sessionConfig.subscription_data.trial_period_days = 365; // ~1 year trial
        sessionConfig.subscription_data.description = 'Educational Elements - Free until January 31, 2026';
        
        // Allow promotion codes (this enables LAUNCH2025 if configured as promotion code)
        sessionConfig.allow_promotion_codes = true;
        
        // Custom text to explain the trial
        sessionConfig.custom_text = {
          submit: {
            message: 'You will get free access until January 31, 2026. Enter LAUNCH2025 for extended trial.'
          }
        };
      } else {
        // For regular subscriptions, still allow promotion codes
        sessionConfig.allow_promotion_codes = true;
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.status(200).json({ url: session.url, sessionId: session.id });

    } catch (error) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}