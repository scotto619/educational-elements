// pages/api/create-checkout-session.js - Updated for trial subscriptions
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

      // Use trial price ID if this is a trial subscription, otherwise use regular price
      const priceId = trialSubscription 
        ? process.env.STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS_TRIAL 
        : process.env.STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS;

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

      // Calculate trial end date (January 31, 2026)
      const trialEndDate = new Date('2026-01-31T23:59:59.999Z');
      const trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);

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

      // Add coupon for trial subscriptions
      if (trialSubscription) {
        sessionConfig.discounts = [{
          coupon: 'TRIAL2026' // Your coupon ID from Stripe
        }];
        
        sessionConfig.subscription_data.description = 'Educational Elements - Free until January 31, 2026';
        
        // Custom text to explain the trial
        sessionConfig.custom_text = {
          submit: {
            message: 'Your subscription includes 100% discount until January 31, 2026. Full billing starts after discount expires.'
          }
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.status(200).json({ url: session.url, sessionId: session.id });

    } catch (error) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        error: 'Failed to create checkout session',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}