import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const router = useRouter();
  const { plan } = router.query;

  useEffect(() => {
    if (!plan) return;

    const createCheckoutSession = async () => {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });

      const { sessionId } = await res.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    };

    createCheckoutSession();
  }, [plan]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-gray-600">Redirecting to Stripe Checkout...</p>
    </div>
  );
}
