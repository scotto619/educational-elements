const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, promoCode, customerEmail, customerId } = req.body;

  // UPDATED PRICE IDs - Replace with your actual Stripe Price IDs
  const prices = {
    basic: prod_ScGCcdmVgOoAh4,    // Replace with actual price ID for $6.99
    pro: prod_ScGDMTmqQUYcYG         // Replace with actual price ID for $11.99
  };

  // Discount codes mapping
  const promoCoupons = {
    'WELCOME1': promo_1Rh1m0EN0uIK7BDCCsj1rVsa,  // Replace with actual coupon ID
    'LAUNCH1': promo_1Rh1lOEN0uIK7BDCriJw1EGh      // Replace with actual coupon ID  
  };

  const priceId = prices[plan];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  try {
    // Create or retrieve Stripe customer
    let customer;
    try {
      // Try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            firebaseUid: customerId
          }
        });
      }
    } catch (error) {
      console.error('Customer creation error:', error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }

    // Prepare session configuration
    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      metadata: {
        firebaseUid: customerId,
        plan: plan
      },
      subscription_data: {
        metadata: {
          firebaseUid: customerId,
          plan: plan
        }
      }
    };

    // Apply discount if valid promo code provided
    if (promoCode && promoCoupons[promoCode.toUpperCase()]) {
      sessionConfig.discounts = [{
        coupon: promoCoupons[promoCode.toUpperCase()]
      }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ sessionId: session.id });

  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
}