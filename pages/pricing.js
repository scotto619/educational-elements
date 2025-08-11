import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Pricing() {
  const [daysUntilJan1, setDaysUntilJan1] = useState(0);

  useEffect(() => {
    // Calculate days until January 1, 2026
    const calculateDaysUntilJan1 = () => {
      const now = new Date();
      const targetDate = new Date('2026-01-01T00:00:00.000Z');
      const timeDifference = targetDate.getTime() - now.getTime();
      const days = Math.max(1, Math.ceil(timeDifference / (1000 * 60 * 60 * 24)));
      setDaysUntilJan1(days);
    };

    calculateDaysUntilJan1();
    const interval = setInterval(calculateDaysUntilJan1, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header with Logo */}
      <div className="flex items-center mb-8">
        <img 
          src="/Logo/LOGO_NoBG.png" 
          alt="Educational Elements Logo" 
          className="h-16 w-16 mr-4"
        />
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Educational Elements
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-4 text-gray-800">Simple, Transparent Pricing</h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl">
        Start your free trial today. No hidden fees, no complicated tiers.
      </p>

      {/* Trial Banner */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl mb-12 shadow-2xl max-w-4xl text-center">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-4xl">⏰</span>
          <div>
            <p className="font-bold text-2xl mb-2">{daysUntilJan1} Days FREE Trial!</p>
            <p className="text-lg opacity-90">Get complete access until January 1st, 2026</p>
            <p className="text-sm opacity-75 mt-2">Payment details required • No charges during trial • Cancel anytime</p>
          </div>
          <span className="text-4xl">⏰</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Single Plan */}
        <div className="bg-gradient-to-b from-purple-600 to-indigo-600 shadow-2xl rounded-2xl p-10 border-4 border-purple-400 transform scale-105 relative">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-full text-lg font-bold shadow-lg">
              🌟 COMPLETE PLATFORM
            </span>
          </div>
          
          <div className="text-center mb-10 pt-6">
            <h2 className="text-3xl font-bold text-white mb-4">Educational Elements</h2>
            <div className="mb-6">
              <div className="text-6xl font-bold text-white mb-3">$5.99</div>
              <div className="text-purple-200 text-xl mb-3">per month</div>
              <div className="bg-green-400 text-green-900 px-6 py-3 rounded-xl text-lg font-bold">
                🎁 FREE for {daysUntilJan1} days!
              </div>
            </div>
          </div>
          
          <div className="space-y-5 mb-10">
            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <h3 className="text-white font-bold text-lg mb-3">🏆 Classroom Champions Gamification</h3>
              <ul className="space-y-2 text-white text-sm">
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>RPG Avatars & Leveling System</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Pet Companions & Racing</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>XP & Coin Economy</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Quest System & Rewards</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <h3 className="text-white font-bold text-lg mb-3">🛠️ Professional Teaching Tools</h3>
              <ul className="space-y-2 text-white text-sm">
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Classroom Jobs & Management</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Group Maker & Name Picker</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Timer Tools & Attendance</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Advanced Analytics</li>
              </ul>
            </div>

            <div className="bg-white bg-opacity-10 rounded-xl p-4">
              <h3 className="text-white font-bold text-lg mb-3">📚 Curriculum & Content</h3>
              <ul className="space-y-2 text-white text-sm">
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Writing Prompts & Resources</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Math Warm-ups & Activities</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Interactive Learning Games</li>
                <li className="flex items-center"><span className="text-green-300 mr-2">✓</span>Curriculum Corner Library</li>
              </ul>
            </div>

            <div className="border-t border-purple-300 pt-4">
              <ul className="space-y-3">
                <li className="flex items-center text-white">
                  <span className="text-yellow-300 mr-3 text-lg">⭐</span>
                  <span className="font-semibold">Up to 2 Classrooms</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-yellow-300 mr-3 text-lg">⭐</span>
                  <span className="font-semibold">Unlimited Students</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-yellow-300 mr-3 text-lg">⭐</span>
                  <span className="font-semibold">Priority Support</span>
                </li>
                <li className="flex items-center text-white">
                  <span className="text-yellow-300 mr-3 text-lg">⭐</span>
                  <span className="font-semibold">Regular Updates & New Features</span>
                </li>
              </ul>
            </div>
          </div>
          
          <Link href="/signup">
            <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-5 rounded-xl hover:from-yellow-500 hover:to-orange-600 font-bold text-xl transition-all shadow-xl transform hover:scale-105">
              🚀 Start {daysUntilJan1}-Day FREE Trial
            </button>
          </Link>
          <p className="text-center text-purple-200 text-sm mt-4">
            FREE for {daysUntilJan1} days • Payment details required • Cancel anytime
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16 max-w-4xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">How Your Free Trial Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h4 className="font-bold text-gray-800 mb-2">Sign Up</h4>
            <p className="text-gray-600 text-sm">Create account and enter payment details (required for trial verification)</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h4 className="font-bold text-gray-800 mb-2">Start Using</h4>
            <p className="text-gray-600 text-sm">Immediate access to all features and tools</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-xl shadow-lg text-center">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h4 className="font-bold text-gray-800 mb-2">Free Until Jan 1st</h4>
            <p className="text-gray-600 text-sm">No charges for {daysUntilJan1} days</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
            <h4 className="font-bold text-gray-800 mb-2">Continue or Cancel</h4>
            <p className="text-gray-600 text-sm">$5.99/month after trial or cancel anytime before</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">Why do you need payment details for a free trial?</h4>
            <p className="text-gray-600">Payment details prevent trial abuse and ensure a smooth transition after your trial ends. You won't be charged until January 1st, 2026.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">How many students can I have?</h4>
            <p className="text-gray-600">Unlimited students across up to 2 classrooms. Perfect for teachers who have multiple classes or want to separate subjects.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">Can I cancel anytime?</h4>
            <p className="text-gray-600">Yes! Cancel anytime before January 1st, 2026 with no charges. After your trial, you can cancel anytime and your subscription ends at the current billing period.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">What happens to my data if I cancel?</h4>
            <p className="text-gray-600">Your classroom data is safely stored and you can reactivate anytime. We believe in data portability and will never hold your information hostage.</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl max-w-4xl">
        <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Classroom?</h3>
        <p className="text-xl mb-6">Join educators already using Educational Elements</p>
        <Link href="/signup">
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl">
            Start Your {daysUntilJan1}-Day FREE Trial
          </button>
        </Link>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Questions? <a href="mailto:support@educationalelements.com" className="text-blue-600 hover:underline">Contact our support team</a></p>
      </div>
    </div>
  );
}