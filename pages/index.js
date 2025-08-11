import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [hoveredImage, setHoveredImage] = useState(null);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Educational Elements - Complete Digital Learning Platform for Modern Classrooms</title>
        <meta name="description" content="Transform your classroom with our comprehensive digital learning platform featuring RPG gamification, professional teaching tools, curriculum resources, and advanced analytics." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Logo/LOGO_NoBG.png" />
      </Head>

      <div className="bg-gray-50">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements Logo" 
                  className="h-12 w-12 mr-3"
                />
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Educational Elements
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Features</button>
                <button onClick={() => scrollToSection('story')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">About</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Pricing</button>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={() => router.push('/login')} className="hidden sm:block bg-gray-100 text-blue-600 px-5 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium">Login</button>
                <button onClick={() => router.push('/signup')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg">Start FREE Trial</button>
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
                  Your Complete
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                    Teaching Platform
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  From RPG gamification to professional tools and curriculum resources - everything you need to transform your modern classroom in one comprehensive platform.
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    🚀 Start FREE Until 2026
                  </button>
                  <button 
                    onClick={() => scrollToSection('features')} 
                    className="bg-white hover:bg-gray-100 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-gray-200"
                  >
                    Explore Platform
                  </button>
                </div>

                <p className="text-gray-500 mt-4 text-sm">
                  ✨ FREE access until January 2026 • Setup in minutes • No contracts
                </p>
              </div>
              
              {/* Right Side - Dashboard Screenshot */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-200">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src="/Screenshots/dashboard.png" 
                      alt="Educational Elements Dashboard" 
                      className="rounded-lg object-cover w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/dashboard.png')}
                      onMouseLeave={() => setHoveredImage(null)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 w-full h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-gray-600 font-semibold">Platform Dashboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - MOVED UP */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything Your Modern Classroom Needs</h2>
              <p className="text-xl text-gray-600">A comprehensive platform built for today's educators</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🏆",
                  title: "Classroom Champions Gamification",
                  description: "Transform student engagement with RPG-style avatars, XP systems, pet companions, and epic quests that make learning an adventure."
                },
                {
                  icon: "🛠️",
                  title: "Professional Teaching Tools",
                  description: "Complete toolkit including group makers, timers, attendance tracking, analytics, and classroom management systems."
                },
                {
                  icon: "📚",
                  title: "Curriculum Resources",
                  description: "Rich library of educational content, writing prompts, math warm-ups, and subject-specific resources aligned to standards."
                },
                {
                  icon: "🎮",
                  title: "Interactive Learning Games",
                  description: "Engaging educational games and activities that reinforce learning objectives while keeping students motivated."
                },
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description: "Track student progress, behavior patterns, engagement metrics, and learning outcomes with comprehensive reporting."
                },
                {
                  icon: "🎯",
                  title: "Behavior Management",
                  description: "Positive reinforcement systems, digital rewards, classroom jobs, and behavior tracking tools that actually work."
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

        {/* Classroom Champions Deep Dive Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                🏆 <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Classroom Champions</span> - Where Learning Becomes an Adventure
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your classroom into an epic RPG where students earn XP, unlock avatars, and gain companions through positive behavior and academic achievement.
              </p>
            </div>

            {/* Three Feature Showcase */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
              
              {/* XP Awards */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-6">
                    <img 
                      src="/Screenshots/xpaward.PNG" 
                      alt="XP Award System" 
                      className="rounded-xl w-full h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/xpaward.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Earn XP & Coins</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Students gain experience points and coins for positive behavior, participation, completing assignments, and classroom contributions. Watch engagement soar as learning becomes rewarding!
                  </p>
                </div>
              </div>

              {/* Level Up */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-6">
                    <img 
                      src="/Screenshots/levelup.PNG" 
                      alt="Level Up System" 
                      className="rounded-xl w-full h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/levelup.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-5xl mb-4">🆙</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Level Up & Evolve</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every 100 XP, students level up and their avatar evolves! From Level 1 to Level 4, each transformation brings excitement and celebrates their growth and achievements.
                  </p>
                </div>
              </div>

              {/* Pet Unlock */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-6">
                    <img 
                      src="/Screenshots/petunlock.PNG" 
                      alt="Pet Unlock System" 
                      className="rounded-xl w-full h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/petunlock.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-5xl mb-4">🐾</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlock Companions</h3>
                  <p className="text-gray-600 leading-relaxed">
                    At 50 XP, students unlock their first magical pet companion! From dragons to unicorns, these companions accompany students on their learning journey.
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-200">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">How Classroom Champions Works</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                  <h4 className="font-bold text-lg mb-2">Positive Actions</h4>
                  <p className="text-gray-600 text-sm">Students demonstrate good behavior, participate in class, complete tasks, and help others.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                  <h4 className="font-bold text-lg mb-2">Instant Rewards</h4>
                  <p className="text-gray-600 text-sm">Teachers award XP and coins instantly with satisfying sound effects and visual celebrations.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                  <h4 className="font-bold text-lg mb-2">Epic Progression</h4>
                  <p className="text-gray-600 text-sm">Avatars evolve at each level, pets unlock at milestones, creating anticipation and excitement.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
                  <h4 className="font-bold text-lg mb-2">Continued Engagement</h4>
                  <p className="text-gray-600 text-sm">Students stay motivated, classroom culture improves, and learning becomes an adventure they want to continue.</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-xl border border-purple-200">
                  <p className="text-lg text-gray-700 mb-4">
                    <strong>Over 40 unique avatars</strong> to unlock, <strong>dozens of magical pets</strong> to discover, and <strong>endless possibilities</strong> for classroom engagement.
                  </p>
                  <p className="text-purple-600 font-semibold">
                    Turn your classroom into the most exciting place your students want to be! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Showcase - MOVED DOWN */}
        <section id="screenshots" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">One Platform, Endless Possibilities</h2>
              <p className="text-xl text-gray-600">From gamification to professional tools - everything your classroom needs.</p>
            </div>
            
            {/* Screenshots Grid with Hover Effect */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                { src: '/Screenshots/students.png', title: 'Classroom Champions Gamification', desc: 'RPG-style student management with avatars, XP, and leveling' },
                { src: '/Screenshots/teachertools.png', title: 'Professional Teaching Tools', desc: 'Comprehensive toolkit for classroom management' },
                { src: '/Screenshots/shop.png', title: 'Reward System & Shop', desc: 'Motivate students with unlockable rewards and achievements' },
                { src: '/Screenshots/games.png', title: 'Interactive Learning Games', desc: 'Engaging educational games and activities' },
                { src: '/Screenshots/writingprompts.png', title: 'Curriculum Resources', desc: 'Rich content library for all subjects' },
                { src: '/Screenshots/petrace.png', title: 'Engagement Activities', desc: 'Fun classroom activities like pet racing and competitions' }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100 group hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-w-16 aspect-h-10 mb-4">
                    <img 
                      src={item.src} 
                      alt={item.title}
                      className="rounded-lg w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredImage(item.src)}
                      onMouseLeave={() => setHoveredImage(null)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 w-full h-48 items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2">📱</div>
                        <p className="text-gray-600 font-semibold">{item.title}</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section id="story" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements Logo" 
                  className="w-32 h-32 mx-auto mb-6 rounded-full shadow-2xl"
                />
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by Teachers, for Teachers</h2>
                <p className="text-xl text-gray-600">The story behind Educational Elements</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Educational Elements was born from real classroom experience. As practicing educators, we saw the need for a comprehensive platform that could handle everything from student engagement to professional development.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl my-8 border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium italic">
                      "We needed more than just a behavior management system. We needed a complete educational ecosystem that could grow with our teaching practice and engage students in meaningful ways."
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Our <strong>Classroom Champions gamification system</strong> became the breakthrough that transformed student engagement. But we didn't stop there. We built a complete platform with professional tools, curriculum resources, and analytics that support every aspect of modern teaching.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Every feature has been tested in real classrooms with real students. From the RPG-style progression system to the comprehensive teacher toolkit, Educational Elements is designed to make teaching more effective and learning more engaging.
                  </p>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Our Commitment</h4>
                      <p className="text-gray-700">Educational Elements is designed to grow with your teaching practice. We're committed to providing ongoing updates, new features, and support that helps you succeed in the modern classroom.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Affordable Pricing</h2>
              <p className="text-xl text-gray-600">Everything you need in one comprehensive platform.</p>
            </div>
            
            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-6 rounded-2xl mb-12 shadow-2xl text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-4">
                <span className="text-4xl">🎉</span>
                <div>
                  <p className="font-bold text-2xl mb-2">Limited Time: FREE Until January 2026!</p>
                  <p className="text-lg opacity-90">Get complete access to Educational Elements at no cost. Use code <span className="bg-white text-green-600 px-3 py-1 rounded font-mono font-bold">LAUNCH2025</span></p>
                </div>
                <span className="text-4xl">🎉</span>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Single Plan */}
              <div className="bg-gradient-to-b from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-500 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🌟 COMPLETE PLATFORM
                  </span>
                </div>
                
                <div className="text-center mb-8 pt-4">
                  <h3 className="text-3xl font-bold text-white mb-4">Educational Elements</h3>
                  <div className="mb-4">
                    <div className="text-5xl font-bold text-white mb-2">$5.99</div>
                    <div className="text-purple-200 text-lg">per month</div>
                    <div className="text-green-300 font-bold text-lg mt-2">Currently FREE until Jan 2026!</div>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center"><div className="bg-green-200 text-green-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</div><span className="text-white font-semibold">Up to 2 Classrooms</span></li>
                  <li className="flex items-center"><div className="bg-green-200 text-green-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</div><span className="text-white">Unlimited Students</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Classroom Champions Gamification</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Professional Teaching Tools</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Curriculum Resources</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Advanced Analytics</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Interactive Learning Games</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-6 h-6 flex items-center justify-center mr-3">★</div><span className="text-white">Priority Support</span></li>
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  Start FREE Trial
                </button>
                <p className="text-center text-purple-200 text-sm mt-3">FREE until January 2026 • No contracts • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Teaching?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join educators who are already using Educational Elements to create engaging, effective, and modern classroom experiences.
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={() => router.push('/signup')} 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-5 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Start FREE Until 2026
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-white/80 mt-8">
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>FREE until January 2026</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>Setup in 5 minutes</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>No contracts</span></div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <img 
                    src="/Logo/LOGO_NoBG.png" 
                    alt="Educational Elements Logo" 
                    className="h-8 w-8 mr-3"
                  />
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Educational Elements
                  </div>
                </div>
                <p className="text-gray-400 mb-4">
                  The complete digital learning platform for modern classrooms. From gamification to professional tools - everything you need in one place.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-lg">Platform</h4>
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
                  <li><a href="mailto:support@educationalelements.com" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 Educational Elements. Built with ❤️ for educators everywhere.
              </p>
            </div>
          </div>
        </footer>

        {/* Enlarged Image Preview Overlay */}
        {hoveredImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] pointer-events-none">
            <div className="relative max-w-6xl max-h-[90vh] mx-4">
              <img 
                src={hoveredImage} 
                alt="Enlarged Preview" 
                className="rounded-2xl shadow-2xl max-w-full max-h-full object-contain"
              />
              <div className="absolute top-4 right-4 bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                Hover to preview
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}