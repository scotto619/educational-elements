// pages/login.js - FIXED PASSWORD RESET (No Firestore logging when unauthenticated)
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

// Dynamic import for Firebase to prevent SSR issues
let auth = null;
let firestoreDb = null;
let signInWithEmailAndPassword = null;
let sendPasswordResetEmail = null;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const firestoreHelpers = useRef({});
  const router = useRouter();

  // Load Firebase only on client side
  useEffect(() => {
    const loadFirebase = async () => {
      if (typeof window !== 'undefined') {
        try {
          const firebaseModule = await import('../utils/firebase');
          const firebaseAuthModule = await import('firebase/auth');
          const firebaseFirestoreModule = await import('firebase/firestore');

          auth = firebaseModule.auth;
          firestoreDb = firebaseModule.firestore;
          signInWithEmailAndPassword = firebaseAuthModule.signInWithEmailAndPassword;
          sendPasswordResetEmail = firebaseAuthModule.sendPasswordResetEmail;
          
          firestoreHelpers.current = {
            collection: firebaseFirestoreModule.collection,
            query: firebaseFirestoreModule.query,
            where: firebaseFirestoreModule.where,
            getDocs: firebaseFirestoreModule.getDocs,
            doc: firebaseFirestoreModule.doc,
            getDoc: firebaseFirestoreModule.getDoc,
            updateDoc: firebaseFirestoreModule.updateDoc
          };
          setFirebaseLoaded(true);
        } catch (error) {
          console.error('Error loading Firebase:', error);
        }
      }
    };

    loadFirebase();
  }, []);

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!firebaseLoaded || !auth || !signInWithEmailAndPassword) {
    alert('Firebase is still loading. Please try again in a moment.');
    return;
  }

  setIsLoading(true);

  if (!email || !password) {
    alert("Please fill in all fields");
    setIsLoading(false);
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // FIXED: Check account status, but allow canceled accounts to log back in
    const helpers = firestoreHelpers.current;
    if (helpers?.collection && firestoreDb) {
      try {
        const { collection, query, where, getDocs } = helpers;
        const userQuery = query(
          collection(firestoreDb, 'users'),
          where('email', '==', normalizedEmail)
        );
        const snapshot = await getDocs(userQuery);
        
        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          const data = userDoc.data();
          
          // CHANGED: Only block if loginDisabled is explicitly true
          // Canceled accounts (accountStatus: 'canceled') are allowed to log in
          if (data?.loginDisabled === true) {
            alert('Your account has been disabled. Please contact support to restore access.');
            setIsLoading(false);
            return;
          }
          
          // REMOVED: The accountStatus === 'deleted' check
          // Users with canceled subscriptions can now log in to resubscribe
        }
      } catch (checkError) {
        console.warn('Skipping pre-login status check:', checkError);
      }
    }

    // Attempt to sign in
    await signInWithEmailAndPassword(auth, normalizedEmail, password);

    // Check subscription status after login
    if (auth.currentUser && firestoreDb && firestoreHelpers.current?.doc) {
      const { doc, getDoc } = firestoreHelpers.current;
      const userDoc = await getDoc(doc(firestoreDb, 'users', auth.currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;
      
      // Only block if explicitly disabled
      if (userData?.loginDisabled === true) {
        alert('Your account has been disabled. Please contact support.');
        await auth.signOut();
        setIsLoading(false);
        return;
      }
      
      // ADDED: Check if user needs to resubscribe
      const hasActiveSubscription = userData?.subscription && userData.subscription !== 'cancelled';
      const hasFreeAccess = userData?.freeAccessUntil && new Date(userData.freeAccessUntil) > new Date();
      
      if (!hasActiveSubscription && !hasFreeAccess) {
        // User needs to subscribe/resubscribe
        console.log('⚠️ User needs subscription, redirecting to checkout');
        router.push('/checkout');
        return;
      }
    }

    // All checks passed - go to dashboard
    router.push('/dashboard');

  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      alert('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      alert('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      alert('Please enter a valid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      alert('Too many failed login attempts. Please try again later.');
    } else {
      alert('Error signing in: ' + error.message);
    }
    setIsLoading(false);
  }
};

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!firebaseLoaded || !auth || !sendPasswordResetEmail) {
      alert('Firebase is still loading. Please try again in a moment.');
      return;
    }

    const targetEmail = (resetEmail || email || '').trim().toLowerCase();

    if (!targetEmail) {
      alert('Please enter your email address to reset your password.');
      return;
    }

    setIsSendingReset(true);
    setResetStatus(null);

    try {
      // FIXED: Just send the reset email - don't try to log to Firestore
      // since the user isn't authenticated yet
      await sendPasswordResetEmail(auth, targetEmail);

      console.log('✅ Password reset email sent to:', targetEmail);
      
      setResetStatus({ 
        type: 'success', 
        message: 'Password reset link sent! Please check your email (including spam folder).' 
      });
      
      // Clear the form after successful send
      setTimeout(() => {
        setShowResetForm(false);
        setResetEmail('');
        setResetStatus(null);
      }, 5000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setResetStatus({ type: 'error', message: 'No account found with this email.' });
      } else if (error.code === 'auth/invalid-email') {
        setResetStatus({ type: 'error', message: 'Please enter a valid email address.' });
      } else if (error.code === 'auth/too-many-requests') {
        setResetStatus({ 
          type: 'error', 
          message: 'Too many reset attempts. Please wait a few minutes and try again.' 
        });
      } else {
        setResetStatus({ type: 'error', message: 'Unable to send reset link. Please try again.' });
      }
    }

    setIsSendingReset(false);
  };

  return (
    <>
      <Head>
        <title>Teacher Login | Educational Elements</title>
        <meta name="description" content="Log in to Educational Elements to manage classroom gamification, curriculum resources, and teacher tools." />
        <link rel="canonical" href="https://educational-elements.com/login" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Image src="/Logo/LOGO_NoBG.png" alt="Educational Elements logo" width={48} height={48} className="h-12 w-12 mr-3" />
              <div className="text-2xl font-bold">Educational Elements</div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-blue-100">Sign in to your teacher dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                placeholder="your.email@school.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => setShowResetForm((prev) => !prev)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Password Reset Form */}
            {showResetForm && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Email for Password Reset
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isSendingReset || !firebaseLoaded}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSendingReset ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </span>
                  ) : (
                    '📧 Send Password Reset Link'
                  )}
                </button>
                {resetStatus && (
                  <div className={`p-3 rounded-lg ${
                    resetStatus.type === 'success' 
                      ? 'bg-green-100 border border-green-300' 
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className={`text-sm ${
                      resetStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {resetStatus.message}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !firebaseLoaded}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {!firebaseLoaded ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                '🚀 Sign In'
              )}
            </button>

            {/* Signup Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup">
                  <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                    Sign up here
                  </span>
                </Link>
              </p>
            </div>
          </form>

          {/* Security Notice */}
          <div className="bg-gray-50 px-8 py-4 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? <a href="mailto:admin@educational-elements.com" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="hidden lg:block ml-12 max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back to Educational Elements</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <h4 className="font-bold text-gray-700">Your Classroom Champions</h4>
                  <p className="text-gray-600 text-sm">Continue managing your gamified classroom where students level up through learning</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">📊</div>
                <div>
                  <h4 className="font-bold text-gray-700">Analytics & Progress</h4>
                  <p className="text-gray-600 text-sm">Track student engagement and academic progress with detailed insights</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🛠️</div>
                <div>
                  <h4 className="font-bold text-gray-700">Teaching Tools</h4>
                  <p className="text-gray-600 text-sm">Access your complete suite of classroom management and curriculum tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}