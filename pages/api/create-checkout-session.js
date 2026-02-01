// pages/api/create-checkout-session.js - UPDATED to handle returning users
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        userEmail, 
        userId,
        isReturningUser = false, // NEW: Flag for returning users
        successUrl = `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl = `${req.headers.origin}/signup`
      } = req.body;

      // Validate required fields
      if (!userEmail || !userId) {
        return res.status(400).json({ error: 'Missing required fields: userEmail and userId' });
      }

      const priceId = process.env.STRIPE_PRICE_ID_EDUCATIONAL_ELEMENTS;
      const introCouponId = process.env.STRIPE_INTRO_COUPON_ID;

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
          console.log('📋 Found existing Stripe customer:', customer.id);
        } else {
          customer = await stripe.customers.create({
            email: userEmail,
            metadata: {
              firebaseUserId: userId
            }
          });
          console.log('✨ Created new Stripe customer:', customer.id);
        }
      } catch (error) {
        console.error('Error handling customer:', error);
        return res.status(500).json({ error: 'Failed to create customer' });
      }

      // UPDATED: Different logic for returning vs new users
      let sessionConfig;

      if (isReturningUser) {
        // Returning user - NO trial, start billing immediately
        console.log('🔄 Creating resubscription for returning user (no trial)');
        
        sessionConfig = {
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
            isReturningUser: 'true',
            introOffer: 'false'
          },
          subscription_data: {
            metadata: {
              firebaseUserId: userId,
              planType: 'educational-elements',
              isReturningUser: 'true',
              introOffer: 'false'
            }
          },
          billing_address_collection: 'required',
          customer_update: {
            address: 'auto',
            name: 'auto'
          }
        };

        sessionConfig.custom_text = {
          submit: {
            message: 'Welcome back! Your subscription will start immediately at $5.99/month.'
          }
        };

      } else {
        if (!introCouponId) {
          console.error('Missing Stripe intro coupon ID for first-month offer');
          return res.status(500).json({ error: 'Pricing configuration error' });
        }

        console.log('💸 Creating subscription for new user with $1 first-month offer');

        sessionConfig = {
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          discounts: [
            {
              coupon: introCouponId
            }
          ],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            firebaseUserId: userId,
            planType: 'educational-elements',
            introOffer: 'true'
          },
          subscription_data: {
            metadata: {
              firebaseUserId: userId,
              planType: 'educational-elements',
              introOffer: 'true'
            }
          },
          billing_address_collection: 'required',
          customer_update: {
            address: 'auto',
            name: 'auto'
          }
        };

        sessionConfig.custom_text = {
          submit: {
            message: 'Pay $1 today for your first month. Then $5.99/month after your intro period.'
          }
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      res.status(200).json({ 
        url: session.url, 
        sessionId: session.id,
        isReturningUser
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
