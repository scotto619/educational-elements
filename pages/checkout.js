// pages/checkout.js - Simple checkout page for Educational Elements
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('LAUNCH2025');
  const [showDiscountSuccess, setShowDiscountSuccess] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleDiscountCodeChange = (e) => {
    const code = e.target.value;
    setDiscountCode(code);
    setShowDiscountSuccess(code.toUpperCase() === 'LAUNCH2025');
  };

  const handleFreeAccess = async () => {
    if (discountCode.toUpperCase() !== 'LAUNCH2025') {
      alert('Please enter a valid discount code');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/apply-discount-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discountCode: discountCode.toUpperCase(),
          userId: user.uid,
          userEmail: user.email
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('🎉 Congratulations! You now have free access until January 2026!');
        router.push('/dashboard?free_access=true');
      } else {
        alert(result.message || 'Failed to apply discount code');
      }
    } catch (error) {
      console.error('Error applying discount code:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaidSubscription = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userId: user.uid,
          discountCode: null // No discount for paid subscription
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-16 w-16 mr-4"
            />
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Educational Elements
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Access</h1>
          <p className="text-gray-600">Get started with Educational Elements today</p>
        </div>

        {/* Free Access Option */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-green-800 px-4 py-2 rounded-bl-lg font-bold">
            🔥 LIMITED TIME
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">FREE Until January 2026!</h2>
            <p className="text-green-100 text-lg">Get complete access to Educational Elements at no cost</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-xl mb-4">What's Included:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Classroom Champions Gamification</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Professional Teaching Tools</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Curriculum Resources</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Interactive Learning Games</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Up to 2 Classrooms</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Unlimited Students</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-green-100 text-sm font-medium mb-2">Enter Discount Code:</label>
              <input
                type="text"
                value={discountCode}
                onChange={handleDiscountCodeChange}
                className={`w-full px-4 py-3 rounded-lg text-gray-800 font-medium transition-all ${
                  showDiscountSuccess 
                    ? 'border-2 border-yellow-400 bg-yellow-50' 
                    : 'border border-gray-300'
                }`}
                placeholder="Enter LAUNCH2025"
              />
              {showDiscountSuccess && (
                <p className="text-yellow-200 text-sm mt-2">✅ Valid code! You'll get free access until January 31, 2026</p>
              )}
            </div>

            <button
              onClick={handleFreeAccess}
              disabled={isProcessing || !showDiscountSuccess}
              className="w-full bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Activating...</span>
                </div>
              ) : (
                '🎁 Claim FREE Access'
              )}
            </button>
          </div>
        </div>

        {/* Paid Subscription Option */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Standard Subscription</h2>
            <div className="text-4xl font-bold text-purple-600 mb-2">$5.99</div>
            <p className="text-gray-600">per month • Cancel anytime</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-purple-800 mb-3">Perfect if you:</h3>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Prefer to support the platform directly</li>
              <li>• Want guaranteed long-term access</li>
              <li>• Need immediate access without codes</li>
              <li>• Want to help fund future development</li>
            </ul>
          </div>

          <button
            onClick={handlePaidSubscription}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              '💳 Subscribe Now'
            )}
          </button>
        </div>

        {/* Security & Support */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🔒 Secure payment processing • ✉️ Email support • 📱 Works on all devices</p>
          <p className="mt-2">
            Questions? <a href="mailto:support@educationalelements.com" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}