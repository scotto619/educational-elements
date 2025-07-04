import Link from 'next/link';
import { useState } from 'react';

export default function Pricing() {
  const [showDiscount, setShowDiscount] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Promotional Banner */}
      {showDiscount && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg mb-8 shadow-lg relative max-w-4xl text-center">
          <button 
            onClick={() => setShowDiscount(false)}
            className="absolute top-2 right-4 text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold text-lg">Limited Time: First Month for Just $1!</p>
              <p className="text-sm opacity-90">Use code <span className="bg-white text-green-600 px-2 py-1 rounded font-mono font-bold">WELCOME1</span> at checkout</p>
            </div>
            <span className="text-2xl">🎉</span>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4 text-gray-800">Choose Your Plan</h1>
      <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl">
        Transform your classroom with gamified learning. Start building student engagement today!
      </p>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 max-w-4xl">
        {/* Basic Plan */}
        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100 transform hover:scale-105 transition-all duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-blue-600">$6.99</span>
              <span className="text-gray-500">/month</span>
            </div>
            {showDiscount && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                First month just $1 with WELCOME1
              </div>
            )}
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>1 Classroom</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Unlimited Students</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>RPG Avatars & Leveling</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Pet System & Racing</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>XP Tracking & Analytics</span>
            </li>
          </ul>
          
          <Link href="/checkout/basic">
            <button className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors shadow-lg">
              Start Basic Plan
            </button>
          </Link>
        </div>

        {/* Pro Plan - Featured */}
        <div className="bg-white shadow-xl rounded-xl p-8 border-2 border-purple-500 transform hover:scale-105 transition-all duration-300 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">MOST POPULAR</span>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Pro</h2>
            <div className="mb-4">
              <span className="text-4xl font-bold text-purple-600">$11.99</span>
              <span className="text-gray-500">/month</span>
            </div>
            {showDiscount && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                First month just $1 with LAUNCH1
              </div>
            )}
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="font-semibold">Up to 5 Classrooms</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Unlimited Students</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>RPG Avatars & Leveling</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Pet System & Racing</span>
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span>Advanced Analytics</span>
            </li>
            <li className="flex items-center">
              <span className="text-purple-500 mr-3">★</span>
              <span className="font-semibold text-purple-600">Priority Support</span>
            </li>
          </ul>
          
          <Link href="/checkout/pro">
            <button className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 font-semibold text-lg transition-colors shadow-lg">
              Start Pro Plan
            </button>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-2xl">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">Can I upgrade or downgrade anytime?</h4>
            <p className="text-gray-600">Yes! You can change your plan anytime in your account settings. Changes take effect immediately.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">What happens to my data if I cancel?</h4>
            <p className="text-gray-600">Your classroom data is safely stored. You can always reactivate your account later and continue where you left off.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="font-bold text-gray-800 mb-2">Is there a free trial?</h4>
            <p className="text-gray-600">Even better! Get your first month for just $1 with code WELCOME1 or LAUNCH1. Cancel anytime.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500">
        <p>Questions? <a href="mailto:support@classroomchampions.com" className="text-blue-600 hover:underline">Contact our support team</a></p>
      </div>
    </div>
  );
}