import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Classroom Champions - Turn Your Classroom Into an Epic RPG Adventure</title>
        <meta name="description" content="Transform student engagement with RPG avatars, XP quests, pet companions, and professional teaching tools. Gamify your classroom and inspire your students." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* You can add a link to your logo/favicon here */}
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <div className="bg-gray-50">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  🏆 Classroom Champions
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Features</button>
                <button onClick={() => scrollToSection('story')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">My Story</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Pricing</button>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/login')} className="hidden sm:block bg-gray-100 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">Login</button>
                <button onClick={() => router.push('/signup')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg">Start for $1</button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-200 pt-32 pb-20 lg:pt-48 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Unlock The Hero
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                    In Every Student
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  The ultimate classroom management tool that turns learning into an adventure. Engage your students with RPG-style quests, character progression, and exciting rewards.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    🚀 Start Your $1 Trial
                  </button>
                  <button 
                    onClick={() => scrollToSection('features')} 
                    className="bg-white hover:bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-gray-200"
                  >
                    Explore Features
                  </button>
                </div>

                <p className="text-gray-500 mt-4 text-sm">
                  ✨ Full access for your first month • Setup in minutes • Cancel anytime
                </p>
              </div>
              
              {/* Right Side - Screenshot Placeholder */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        {/* Replace this div with an <Image> or <img> tag for your screenshot */}
                        <img src="/screenshot-placeholder-1.png" alt="Classroom Champions Dashboard Screenshot" className="rounded-lg object-cover"/>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshot/App Preview Section */}
        <section id="screenshots" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">A Classroom Transformed</h2>
              <p className="text-xl text-gray-600">From behavior tracking to epic quests, everything you need is here.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-xl p-3 border border-gray-100">
                <img src="/screenshot-placeholder-2.png" alt="Student view with avatars" className="rounded-lg w-full"/>
              </div>
              <div className="bg-white rounded-2xl shadow-xl p-3 border border-gray-100 md:col-span-2">
                <img src="/screenshot-placeholder-3.png" alt="Quests tab" className="rounded-lg w-full"/>
              </div>
            </div>
          </div>
        </section>

        {/* My Story Section */}
        <section id="story" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl shadow-2xl">
                  👨‍🏫
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">From a Teacher's Notebook to Your Screen</h2>
                <p className="text-xl text-gray-600">Why I built Classroom Champions</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    As a Grade 5 teacher, I've always been passionate about making students genuinely excited to come to school every day. I tried <em>countless</em> classroom management strategies, but none created the lasting engagement I was dreaming of.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl my-8 border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium italic">
                      "I wanted my students to feel the same excitement about learning that I felt about teaching. I wanted them to rush into class asking 'What's next?' instead of dragging their feet."
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The breakthrough came when I introduced <strong>RPG-style character progression</strong> to my classroom. Students weren't just earning points anymore - they were leveling up their avatars, unlocking new abilities, and going on epic quests. The transformation was <em>magical</em>.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    After seeing the incredible impact, I knew I had to share this with other teachers. That's when I decided to put all my tools and games into <strong>one comprehensive app</strong> - Classroom Champions. Every feature has been battle-tested in a real classroom. It's a system built to bring joy and engagement back into learning.
                  </p>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">My Promise to You</h4>
                      <p className="text-gray-700">If Classroom Champions doesn't dramatically improve your student engagement, simply cancel your subscription. I'm confident this system will transform your classroom just like it did mine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Transform Your Classroom</h2>
              <p className="text-xl text-gray-600">A complete toolkit for the modern, engaged classroom</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎭",
                  title: "RPG Character Evolution",
                  description: "Students choose from over 34 unique fantasy avatars that evolve through 4 levels as they demonstrate good behavior and achieve goals."
                },
                {
                  icon: "⚔️",
                  title: "Epic Quest System",
                  description: "Assign daily, weekly, and custom quests. Students complete real learning objectives to earn XP and unlock rewards."
                },
                {
                  icon: "🐾",
                  title: "Pet Companions & Racing",
                  description: "With over 19 adorable pet companions to unlock and collect, you can host thrilling pet racing championships for the ultimate engagement boost!"
                },
                {
                  icon: "🛒",
                  title: "Classroom Shop System",
                  description: "Students earn coins to spend on new avatars, accessories, and real-world privileges, teaching valuable economic skills."
                },
                {
                  icon: "🛠️",
                  title: "Professional Teacher Tools",
                  description: "A complete suite including a Group Maker, Name Picker, Timer Tools, and more to streamline your classroom management."
                },
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description: "Track student progress, behavior patterns, and quest completion rates with data-driven insights to optimize your approach."
                },
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Teacher-Friendly Pricing</h2>
              <p className="text-xl text-gray-600">Start your classroom transformation today.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">$6.99</div>
                  <div className="text-gray-500 mb-4">per month</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {["1 Classroom", "Unlimited Students", "All Avatar Classes", "Complete Quest System", "All Pet Companions", "Pet Racing", "Classroom Shop", "Basic Analytics"].map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                >
                  Start for $1
                </button>
                <p className="text-center text-gray-500 text-sm mt-3">$1 for your first month • Cancel anytime</p>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-500 relative transform md:scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 MOST POPULAR
                  </span>
                </div>
                
                <div className="text-center mb-8 pt-4">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                  <div className="text-5xl font-bold text-white mb-2">$11.99</div>
                  <div className="text-purple-200 mb-4">per month</div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center"><div className="bg-green-200 text-green-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</div><span className="text-white font-semibold">Everything in Basic, plus:</span></li>
                  {["Up to 5 Classrooms", "Professional Teaching Tools", "Advanced Analytics & Reports", "Attendance Tracker", "Priority Support", "Early Access to New Features"].map((feature) => (
                     <li key={feature} className="flex items-center">
                      <div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div>
                      <span className="text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  Start for $1
                </button>
                <p className="text-center text-purple-200 text-sm mt-3">$1 for your first month • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Classroom?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join the teachers who've already turned their classrooms into epic adventures. 
              Your students are waiting for their next quest!
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={() => router.push('/signup')} 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-5 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Start Your Epic Journey - $1 First Month
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-white/80 mt-8">
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>$1 for first month</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>Setup in 5 minutes</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>Cancel anytime</span></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  🏆 Classroom Champions
                </div>
                <p className="text-gray-400 mb-4">
                  The ultimate classroom management tool for turning learning into an adventure your students will love.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-lg">Product</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Login</button></li>
                  <li><button onClick={() => router.push('/signup')} className="hover:text-white transition-colors">Sign Up</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-lg">Support</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="mailto:support@classroomchampions.com" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Classroom Champions. Built with ❤️ for teachers everywhere.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}