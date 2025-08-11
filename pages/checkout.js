// pages/checkout.js - Updated for trial subscriptions
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleTrialSubscription = async () => {
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
          trialSubscription: true
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

  const handleRegularSubscription = async () => {
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
          trialSubscription: false
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Subscription</h1>
          <p className="text-gray-600">Start transforming your classroom today</p>
        </div>

        {/* Free Trial Option - Primary */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-green-800 px-4 py-2 rounded-bl-lg font-bold">
            🔥 RECOMMENDED
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">FREE Trial Until January 2026!</h2>
            <p className="text-green-100 text-lg">Complete access with payment details secured for seamless transition</p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-xl mb-4">What You Get:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Classroom Champions Gamification</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Professional Teaching Tools</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Curriculum Resources</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Interactive Learning Games</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Up to 2 Classrooms</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">✓</span>Unlimited Students</div>
            </div>
          </div>

          <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-lg mb-2">🎯 How It Works:</h4>
            <ol className="text-sm space-y-1">
              <li>1. Enter payment details (secure with Stripe)</li>
              <li>2. Get immediate full access to Educational Elements</li>
              <li>3. Use completely FREE until January 31, 2026</li>
              <li>4. Billing starts at $5.99/month after trial (cancel anytime)</li>
            </ol>
          </div>

          <button
            onClick={handleTrialSubscription}
            disabled={isProcessing}
            className="w-full bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up trial...</span>
              </div>
            ) : (
              '🚀 Start FREE Trial'
            )}
          </button>
        </div>

        {/* Regular Subscription Option */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Immediately</h2>
            <div className="text-4xl font-bold text-purple-600 mb-2">$5.99</div>
            <p className="text-gray-600">per month • Cancel anytime</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-purple-800 mb-3">Perfect if you:</h3>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Want to start paying immediately</li>
              <li>• Don't want to provide payment details for future billing</li>
              <li>• Prefer to manage subscription month-to-month</li>
              <li>• Want to support the platform from day one</li>
            </ul>
          </div>

          <button
            onClick={handleRegularSubscription}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              '💳 Subscribe & Start Today'
            )}
          </button>
        </div>

        {/* Security & Support */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>🔒 Secure payment processing by Stripe • ✉️ Email support • 📱 Works on all devices</p>
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