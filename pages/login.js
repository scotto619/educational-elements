// pages/api/create-checkout-session.js - Updated for Educational Elements single plan
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        userEmail, 
        userId, 
        discountCode, 
        successUrl = `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl = `${req.headers.origin}/pricing`
      } = req.body;

      // Validate required fields
      if (!userEmail || !userId) {
        return res.status(400).json({ error: 'Missing required fields: userEmail and userId' });
      }

      // Check for valid discount code - LAUNCH2025 gives free access until Jan 2026
      if (discountCode && discountCode.toUpperCase() === 'LAUNCH2025') {
        // For the free promotion, redirect directly to dashboard with free access
        return res.status(200).json({ 
          url: `${req.headers.origin}/dashboard?free_access=true`,
          freeAccess: true,
          message: 'Free access granted until January 2026!'
        });
      }

      // Educational Elements - Single Plan: $5.99/month
      const priceId = process.env.STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS; // Set this in your environment

      if (!priceId) {
        console.error('Missing Stripe Price ID');
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
      const session = await stripe.checkout.sessions.create({
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
          planType: 'educational-elements'
        },
        subscription_data: {
          metadata: {
            firebaseUserId: userId,
            planType: 'educational-elements'
          }
        },
        allow_promotion_codes: true, // Allow Stripe promotion codes
        billing_address_collection: 'required',
        customer_update: {
          address: 'auto',
          name: 'auto'
        }
      });

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