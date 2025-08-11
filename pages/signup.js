import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Dynamic import for Firebase to prevent SSR issues
let auth = null;
let createUserWithEmailAndPassword = null;
let firestore = null;
let doc = null;
let setDoc = null;

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const router = useRouter();

  // Load Firebase only on client side
  useEffect(() => {
    const loadFirebase = async () => {
      if (typeof window !== 'undefined') {
        try {
          const firebaseModule = await import('../utils/firebase');
          const firebaseAuthModule = await import('firebase/auth');
          const firestoreModule = await import('firebase/firestore');
          
          auth = firebaseModule.auth;
          firestore = firebaseModule.firestore;
          createUserWithEmailAndPassword = firebaseAuthModule.createUserWithEmailAndPassword;
          doc = firestoreModule.doc;
          setDoc = firestoreModule.setDoc;
          
          setFirebaseLoaded(true);
        } catch (error) {
          console.error('Error loading Firebase:', error);
        }
      }
    };

    loadFirebase();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!firebaseLoaded || !auth || !createUserWithEmailAndPassword) {
      alert('Firebase is still loading. Please try again in a moment.');
      return;
    }

    setIsLoading(true);

    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        classes: [],
        subscription: null,
        stripeCustomerId: null,
        trialUntil: '2026-01-31T23:59:59.999Z', // Track trial end date
        planType: 'educational-elements'
      });

      // Redirect to Stripe checkout with trial
      await redirectToStripeCheckout(user);

    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        alert('An account with this email already exists. Please try logging in instead.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Please enter a valid email address.');
      } else {
        alert('Error creating account: ' + error.message);
      }
      setIsLoading(false);
    }
  };

  const redirectToStripeCheckout = async (user) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user.email,
          userId: user.uid,
          trialSubscription: true // Flag for trial subscription
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(error);
        setIsLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error setting up payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-12 w-12 mr-3"
            />
            <div className="text-2xl font-bold">Educational Elements</div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Start Your Free Trial</h1>
          <p className="text-purple-100">Free until January 2026, then $5.99/month</p>
        </div>

        {/* Trial Info Banner */}
        <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">FREE Trial Until January 2026!</p>
              <p className="text-sm opacity-90">No charges until trial ends</p>
            </div>
            <span className="text-2xl">🎉</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="p-8 space-y-6">
          {/* Firebase Loading Message */}
          {!firebaseLoaded && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700">Loading Educational Elements...</span>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="your.email@school.edu"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Trial Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-3">🎯 What happens next:</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-0.5">1.</span>Enter your payment details (secure)</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-0.5">2.</span>Start using Educational Elements immediately</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-0.5">3.</span>No charges until January 31, 2026</li>
              <li className="flex items-start"><span className="text-blue-500 mr-2 mt-0.5">4.</span>Cancel anytime before trial ends</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !firebaseLoaded}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {!firebaseLoaded ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Setting up trial...</span>
              </div>
            ) : (
              '🚀 Start FREE Trial'
            )}
          </button>

          {/* Value Proposition */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">✨ Complete Platform Includes:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Classroom Champions Gamification</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Professional Teaching Tools</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Curriculum Resources & Games</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to 2 Classrooms</li>
              <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Unlimited Students</li>
            </ul>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login">
                <span className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                  Sign in here
                </span>
              </Link>
            </p>
          </div>
        </form>

        {/* Security Notice */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            Secure payment processing by Stripe. Cancel anytime before January 31, 2026.
          </p>
        </div>
      </div>

      {/* Additional Info */}
      <div className="hidden lg:block ml-12 max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Start Your Trial Today?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🆓</div>
              <div>
                <h4 className="font-bold text-gray-700">Risk-Free Trial</h4>
                <p className="text-gray-600 text-sm">Full access until January 2026 - cancel anytime with no charges</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="font-bold text-gray-700">Instant Access</h4>
                <p className="text-gray-600 text-sm">Start transforming your classroom immediately after setup</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🔒</div>
              <div>
                <h4 className="font-bold text-gray-700">Secure & Simple</h4>
                <p className="text-gray-600 text-sm">Payment details stored securely by Stripe - never charged until trial ends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}