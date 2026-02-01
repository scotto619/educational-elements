// pages/checkout.js - UPDATED to handle returning/resubscribing users
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // ADDED: Check if user is returning (previously had a subscription)
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);

            // Check if they're a returning (canceled) user who needs to resubscribe
            const isCanceledUser =
              data.accountStatus === 'canceled' ||
              data.subscriptionStatus === 'canceled' ||
              (data.stripeCustomerId && data.subscription === 'cancelled');
            setIsReturningUser(isCanceledUser);

            console.log('User subscription status:', {
              hasCustomerId: !!data.stripeCustomerId,
              subscription: data.subscription,
              status: data.subscriptionStatus,
              isReturning: isCanceledUser
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  const handleStartIntroOffer = async () => {
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
          isReturningUser: isReturningUser
        }),
      });

      const result = await response.json();

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        console.error('Checkout error:', result);
        alert(result.error || 'Failed to create checkout session');
      }
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isReturningUser ? 'Welcome Back!' : 'Start for $1'}
          </h1>
          <p className="text-gray-600">
            {isReturningUser
              ? 'Resubscribe to regain full access to all features'
              : '$1 for your first month, then $5.99/month'
            }
          </p>
        </div>

        {/* Returning User Notice */}
        {isReturningUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">👋</span>
              <div>
                <h3 className="font-bold text-blue-800 mb-2">Welcome back to Educational Elements!</h3>
                <p className="text-blue-700 text-sm">
                  We're excited to have you back. Your classes and student data are still here and will be
                  fully accessible once you resubscribe.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Countdown Banner */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-2xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-yellow-400 text-green-800 px-4 py-2 rounded-bl-lg font-bold">
            {isReturningUser ? '🎉 RETURNING USER' : '🔥 INTRO OFFER'}
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-4xl font-bold mb-2">
              {isReturningUser ? 'Resubscribe Now' : '$1 First Month'}
            </h2>
            <p className="text-green-100 text-lg">
              {isReturningUser
                ? '$5.99/month • Cancel anytime'
                : 'Then $5.99/month • Cancel anytime'
              }
            </p>
          </div>

          <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-xl mb-4">
              {isReturningUser ? 'All Your Features Are Waiting:' : 'Complete Platform Access:'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center"><span className="text-yellow-300 mr-2">🏆</span>Classroom Champions Gamification</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">🛠️</span>Professional Teaching Tools</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">📚</span>Curriculum Resources</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">🎮</span>Interactive Learning Games</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">🏫</span>Up to 2 Classrooms</div>
              <div className="flex items-center"><span className="text-yellow-300 mr-2">👥</span>Unlimited Students</div>
            </div>
          </div>

          <button
            onClick={handleStartIntroOffer}
            disabled={isProcessing}
            className="w-full bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              isReturningUser
                ? '🚀 Resubscribe Now'
                : '🚀 Start for $1'
            )}
          </button>

          <div className="text-center mt-4 text-green-100 text-sm">
            {isReturningUser ? (
              <>
                <p>💳 Billing starts immediately</p>
                <p>✨ Your classes and data are preserved • Cancel anytime</p>
              </>
            ) : (
              <>
                <p>💳 Pay $1 today for full access</p>
                <p>✨ Full access starts immediately • Cancel anytime</p>
              </>
            )}
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {isReturningUser ? 'Resubscription Details' : 'How the Intro Offer Works'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
              <h4 className="font-bold text-gray-700 mb-2">
                {isReturningUser ? 'Enter Payment Details' : 'Enter Payment Details'}
              </h4>
              <p className="text-gray-600 text-sm">
                {isReturningUser
                  ? 'Secure checkout powered by Stripe'
                  : 'Secure checkout powered by Stripe'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
              <h4 className="font-bold text-gray-700 mb-2">
                {isReturningUser ? 'Instant Access' : 'Start Using Immediately'}
              </h4>
              <p className="text-gray-600 text-sm">
                {isReturningUser
                  ? 'Access all your classes and students right away'
                  : 'Full access to all features right away'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
              <h4 className="font-bold text-gray-700 mb-2">
                {isReturningUser ? 'Monthly Billing' : '$1 First Month'}
              </h4>
              <p className="text-gray-600 text-sm">
                {isReturningUser
                  ? '$5.99/month, billed monthly'
                  : '$1 today, $5.99/month after your first month'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
              <h4 className="font-bold text-gray-700 mb-2">Cancel Anytime</h4>
              <p className="text-gray-600 text-sm">
                {isReturningUser
                  ? 'No long-term commitment required'
                  : 'No long-term commitment required'
                }
              </p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h4 className="font-bold text-blue-800 mb-2">
                  {isReturningUser ? 'Subscription Details' : 'Intro Offer Details'}
                </h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  {isReturningUser ? (
                    <>
                      <li>• Billing starts immediately at $5.99/month</li>
                      <li>• All your previous classes and students are preserved</li>
                      <li>• Cancel anytime in your account settings</li>
                      <li>• No long-term contracts or hidden fees</li>
                    </>
                  ) : (
                    <>
                      <li>• Payment method required to activate your subscription</li>
                      <li>• First month is $1, billed today</li>
                      <li>• $5.99/month billing starts after your first month</li>
                      <li>• Cancel anytime in your account settings</li>
                      <li>• No long-term contracts or hidden fees</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
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
