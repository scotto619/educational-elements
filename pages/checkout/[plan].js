import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { auth } from '../../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Checkout() {
  const router = useRouter();
  const { plan } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleCheckout = async () => {
    if (!plan || !user) return;

    setLoading(true);

    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan,
          promoCode: promoCode.trim(),
          customerEmail: user.email,
          customerId: user.uid
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error: ' + error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  const planDetails = {
    basic: { name: 'Basic', price: '$6.99', features: '1 Classroom' },
    pro: { name: 'Pro', price: '$11.99', features: 'Up to 5 Classrooms' }
  };

  const currentPlan = planDetails[plan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">You're about to subscribe to our {currentPlan?.name} plan</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-800">{currentPlan?.name} Plan</span>
            <span className="text-lg font-bold text-blue-600">{currentPlan?.price}/month</span>
          </div>
          <p className="text-gray-600 text-sm">{currentPlan?.features}</p>
          
          {promoCode && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Promo: {promoCode.toUpperCase()}</span>
                <span className="text-green-600 font-bold">First month $1!</span>
              </div>
            </div>
          )}
        </div>

        {!showPromoInput ? (
          <button
            onClick={() => setShowPromoInput(true)}
            className="w-full mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            Have a promo code? Click here
          </button>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter WELCOME1 or LAUNCH1"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowPromoInput(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Subscribe to ${currentPlan?.name}`}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>
      </div>
    </div>
  );
}