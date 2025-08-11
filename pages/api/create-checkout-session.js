// pages/api/create-checkout-session.js - DYNAMIC TRIAL VERSION
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        userEmail, 
        userId, 
        successUrl = `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl = `${req.headers.origin}/signup`
      } = req.body;

      // Validate required fields
      if (!userEmail || !userId) {
        return res.status(400).json({ error: 'Missing required fields: userEmail and userId' });
      }

      // Calculate days until January 1, 2026
      const now = new Date();
      const targetDate = new Date('2026-01-01T00:00:00.000Z');
      const timeDifference = targetDate.getTime() - now.getTime();
      const daysUntilJan1 = Math.max(1, Math.ceil(timeDifference / (1000 * 60 * 60 * 24)));

      console.log(`Calculated trial days: ${daysUntilJan1} days until January 1, 2026`);

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

      // Create checkout session with dynamic trial period
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
          trialDays: daysUntilJan1.toString()
        },
        subscription_data: {
          trial_period_days: daysUntilJan1,
          metadata: {
            firebaseUserId: userId,
            planType: 'educational-elements',
            trialEndDate: targetDate.toISOString()
          }
        },
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      };

      // Custom text explaining the trial
      sessionConfig.custom_text = {
        submit: {
          message: `You'll get free access until January 1, 2026. Billing starts automatically after your trial ends (${daysUntilJan1} days from now).`
        }
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.status(200).json({ 
        url: session.url, 
        sessionId: session.id,
        trialDays: daysUntilJan1
      });

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