const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { plan } = req.body;

  const prices = {
    basic: 'price_1RfYigEN0uIK7BDCB3JgFOSK',
    pro: 'price_1RfYj6EN0uIK7BDCpLONtRUe'
  };

  const priceId = prices[plan];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${req.headers.origin}/dashboard`,
    cancel_url: `${req.headers.origin}/pricing`,
  });

  res.status(200).json({ sessionId: session.id });
}
