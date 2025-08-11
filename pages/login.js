import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Dynamic import for Firebase to prevent SSR issues
let auth = null;
let signInWithEmailAndPassword = null;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
          
          auth = firebaseModule.auth;
          signInWithEmailAndPassword = firebaseAuthModule.signInWithEmailAndPassword;
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

    try {
      await signInWithEmailAndPassword(auth, email, password);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-12 w-12 mr-3"
            />
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
          </div>

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
            Having trouble? <a href="mailto:support@educationalelements.com" className="text-blue-600 hover:underline">Contact Support</a>
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
  );
}