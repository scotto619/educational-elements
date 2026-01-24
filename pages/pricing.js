import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
export default function Pricing() {
  const introBannerVisible = true;

  const faqSchema = [
    {
      question: 'Why do you need payment details for the $1 intro month?',
      answer:
        "Payment details keep your subscription active and apply the $1 introductory month. After the first month, the plan renews at $5.99/month."
    },
    {
      question: 'How many students can I have?',
      answer:
        'Unlimited students across up to 2 classrooms. Perfect for teachers who have multiple classes or want to separate subjects.'
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes! Cancel anytime and your subscription ends at the current billing period.'
    },
    {
      question: 'What happens to my data if I cancel?',
      answer:
        'Your classroom data is safely stored and you can reactivate anytime. We believe in data portability and will never hold your information hostage.'
    }
  ];

  return (
    <>
      <Head>
        <title>Educational Elements Pricing | $1 First Month</title>
        <meta
          name="description"
          content="Compare Educational Elements pricing, start your first month for $1, and discover everything included in the classroom gamification platform."
        />
        <link rel="canonical" href="https://educational-elements.com/pricing" />
        <meta name="robots" content="index,follow" />
        <meta name="keywords" content="teacher software pricing, classroom management intro month, educational elements cost" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Simple, Transparent Pricing | Educational Elements" />
        <meta
          property="og:description"
          content="Start your first month for $1 and unlock classroom gamification, curriculum resources, and teaching tools."
        />
        <meta property="og:url" content="https://educational-elements.com/pricing" />
        <meta property="og:image" content="https://educational-elements.com/Logo/LOGO_NoBG.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Educational Elements Pricing" />
        <meta
          name="twitter:description"
          content="See how affordable it is to bring classroom gamification and curriculum resources to your students."
        />
        <meta name="twitter:image" content="https://educational-elements.com/Logo/LOGO_NoBG.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqSchema.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: faq.answer
                }
              })),
              mainEntityOfPage: 'https://educational-elements.com/pricing'
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Offer',
              url: 'https://educational-elements.com/pricing',
              price: '5.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: 'Educational Elements'
              }
            })
          }}
        />
      </Head>

      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        {/* Header with Logo */}
        <div className="flex items-center mb-8">
          <Image src="/Logo/LOGO_NoBG.png" alt="Educational Elements logo" width={64} height={64} className="h-16 w-16 mr-4" />
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Educational Elements
          </div>
        </div>

        <h1 className="text-5xl font-bold mb-4 text-gray-800">Simple, Transparent Pricing</h1>
      <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl">
        Start your first month for $1. No hidden fees, no complicated tiers.
      </p>

      {/* Intro Offer Banner */}
      {introBannerVisible && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl mb-12 shadow-2xl max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-4xl">✨</span>
            <div>
              <p className="font-bold text-2xl mb-2">$1 Introductory Month</p>
              <p className="text-lg opacity-90">Then $5.99/month after your first month</p>
              <p className="text-sm opacity-75 mt-2">Cancel anytime • Secure Stripe checkout</p>
            </div>
            <span className="text-4xl">✨</span>
          </div>
        </div>
      )}

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
                🎁 $1 for your first month!
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
              🚀 Start for $1
            </button>
          </Link>
          <p className="text-center text-purple-200 text-sm mt-4">
            $1 for your first month • Then $5.99/month • Cancel anytime
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-16 max-w-4xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">How the Intro Offer Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
            <h4 className="font-bold text-gray-800 mb-2">Sign Up</h4>
            <p className="text-gray-600 text-sm">Create account and enter payment details</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
            <h4 className="font-bold text-gray-800 mb-2">Start Using</h4>
            <p className="text-gray-600 text-sm">Immediate access to all features and tools</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-xl shadow-lg text-center">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
            <h4 className="font-bold text-gray-800 mb-2">$1 First Month</h4>
            <p className="text-gray-600 text-sm">You pay $1 today for your first month</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
            <h4 className="font-bold text-gray-800 mb-2">Continue or Cancel</h4>
            <p className="text-gray-600 text-sm">$5.99/month after your first month or cancel anytime</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h3>
        <div className="space-y-6">
          {faqSchema.map((faq) => (
            <div key={faq.question} className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="font-bold text-gray-800 mb-2">{faq.question}</h4>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl max-w-4xl">
        <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Classroom?</h3>
        <p className="text-xl mb-6">Join educators already using Educational Elements</p>
        <Link href="/signup">
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl">
            Start for $1
          </button>
        </Link>
      </div>

        <div className="mt-12 text-center text-gray-500">
          <p>
            Questions?{' '}
            <a href="mailto:support@educationalelements.com" className="text-blue-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </div>
      </main>
    </>
  );
}
