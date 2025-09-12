// pages/index.js - Mobile-Optimized Landing Page with Backend Update Notice
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PropTypes from 'prop-types'; // Add if you want to use prop validation

export default function Home() {
  const router = useRouter();
  const [hoveredImage, setHoveredImage] = useState(null);
  const [daysUntilJan1, setDaysUntilJan1] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    
    // Update the countdown every hour
    const interval = setInterval(calculateDaysUntilJan1, 1000 * 60 * 60);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const goToStudentPortal = () => {
    window.open('https://educational-elements.com/student', '_blank');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Error handling for image loading
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
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
        {/* Navigation - Mobile Optimized */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo and Brand */}
              <div className="flex items-center flex-shrink-0">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements Logo" 
                  className="h-8 w-8 md:h-12 md:w-12 mr-2 md:mr-3"
                />
                <div className="text-lg md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Educational Elements
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Features</button>
                <button onClick={() => scrollToSection('story')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">About</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Pricing</button>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <button onClick={() => router.push('/login')} className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm lg:text-base">
                  Login
                </button>
                <button onClick={() => router.push('/signup')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg text-sm lg:text-base">
                  Start FREE Trial
                </button>
                <button 
                  onClick={goToStudentPortal}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md text-xs lg:text-sm"
                >
                  🎓 Portal
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 p-2"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                <div className="px-4 py-4 space-y-4">
                  <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                    Features
                  </button>
                  <button onClick={() => scrollToSection('story')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                    About
                  </button>
                  <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                    Pricing
                  </button>
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <button onClick={() => router.push('/login')} className="block w-full bg-gray-100 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-center">
                      Login
                    </button>
                    <button onClick={() => router.push('/signup')} className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg text-center">
                      Start FREE Trial
                    </button>
                    <button 
                      onClick={goToStudentPortal}
                      className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md text-center"
                    >
                      🎓 Student Portal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Backend Update Notice Banner - Mobile Optimized */}
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden mt-16 md:mt-20">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] animate-pulse" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            <div className="text-center">
              {/* Icon and Status */}
              <div className="flex items-center justify-center mb-4 md:mb-6">
                <div className="bg-white/20 rounded-full p-3 md:p-4 mr-4 md:mr-5">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Major Platform Enhancement In Progress</h3>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping mr-2"></div>
                    <span className="text-sm md:text-lg text-white/90 font-medium">Live Backend Upgrade</span>
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="max-w-5xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20">
                  <p className="text-lg md:text-xl leading-relaxed mb-4 md:mb-5 text-white">
                    We're currently implementing <strong className="text-yellow-300">major backend improvements</strong> that will make Educational Elements <strong className="text-green-300">faster, more reliable, and significantly improve data saving success rates</strong>. This comprehensive upgrade will enhance your entire classroom experience!
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-5 md:mb-6">
                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                      <div className="text-2xl md:text-3xl mb-2">⚡</div>
                      <h4 className="font-bold text-base md:text-lg mb-1">Faster Performance</h4>
                      <p className="text-sm md:text-base text-white/90">Lightning-fast loading times and smoother interactions</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                      <div className="text-2xl md:text-3xl mb-2">💾</div>
                      <h4 className="font-bold text-base md:text-lg mb-1">Better Data Saving</h4>
                      <p className="text-sm md:text-base text-white/90">More reliable data persistence and backup systems</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 md:p-4 border border-white/10">
                      <div className="text-2xl md:text-3xl mb-2">🎯</div>
                      <h4 className="font-bold text-base md:text-lg mb-1">Enhanced Experience</h4>
                      <p className="text-sm md:text-base text-white/90">Smoother workflows and improved user interface</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4 md:p-5 mb-4 md:mb-5">
                    <div className="flex items-start">
                      <div className="text-2xl md:text-3xl mr-3 md:mr-4">⚠️</div>
                      <div className="text-left">
                        <h4 className="font-bold text-base md:text-lg text-yellow-200 mb-2">Temporary Impact Notice</h4>
                        <p className="text-sm md:text-base text-white/95 leading-relaxed">
                          During this upgrade process, you may experience minimal issues with class data loading or saving. We're working hard to keep any disruptions to an absolute minimum, and most users should see no impact at all.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-base md:text-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-green-300 font-semibold">Estimated completion: Within 48 hours</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-blue-300 font-semibold">Platform remains fully operational</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm md:text-base text-white/80 mt-4 md:mt-5">
                  Thank you for your patience as we make Educational Elements better than ever! 🚀
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section - Mobile Optimized */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-200 pt-12 pb-12 md:pt-20 md:pb-20 lg:pt-32 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                  Your Complete
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent block mt-1 md:mt-2">
                    Teaching Platform
                  </span>
                </h1>
                
                <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 leading-relaxed px-4 lg:px-0">
                  From RPG gamification to professional tools and curriculum resources - everything you need to transform your modern classroom in one comprehensive platform.
                </p>
                
                {/* CTA Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 lg:px-0">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    🚀 Start {daysUntilJan1}-Day FREE Trial
                  </button>
                  <button 
                    onClick={() => scrollToSection('features')} 
                    className="bg-white hover:bg-gray-100 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-semibold transition-all border border-gray-200"
                  >
                    Explore Platform
                  </button>
                </div>

                <p className="text-gray-500 mt-4 text-xs md:text-sm px-4 lg:px-0">
                  ✨ FREE until January 1st, 2026 • Setup in minutes • No charges during trial
                </p>
              </div>
              
              {/* Right Side - Dashboard Screenshot */}
              <div className="relative order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-2xl p-3 md:p-4 border border-gray-200 mx-4 lg:mx-0">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <img 
                      src="/Screenshots/dashboard.png" 
                      alt="Educational Elements Dashboard" 
                      className="rounded-lg object-cover w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/dashboard.png')}
                      onMouseLeave={() => setHoveredImage(null)}
                      onError={handleImageError}
                    />
                    <div className="hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 w-full h-full items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl md:text-4xl mb-2">📊</div>
                        <p className="text-gray-600 font-semibold text-sm md:text-base">Platform Dashboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features - Mobile Optimized */}
        <section id="features" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Everything Your Modern Classroom Needs</h2>
              <p className="text-lg md:text-xl text-gray-600">A comprehensive platform built for today's educators</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">{feature.icon}</div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Classroom Champions Deep Dive Section - Mobile Optimized */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-purple-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                🏆 <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Classroom Champions</span> - Where Learning Becomes an Adventure
              </h2>
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Transform your classroom into an epic RPG where students earn XP, unlock avatars, and gain companions through positive behavior and academic achievement.
              </p>
            </div>

            {/* Three Feature Showcase - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16">
              
              {/* XP Awards */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-4 md:mb-6">
                    <img 
                      src="/Screenshots/xpaward.PNG" 
                      alt="XP Award System" 
                      className="rounded-xl w-full h-32 md:h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/xpaward.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">⭐</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Earn XP & Coins</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Students gain experience points and coins for positive behavior, participation, completing assignments, and classroom contributions. Watch engagement soar as learning becomes rewarding!
                  </p>
                </div>
              </div>

              {/* Level Up */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-4 md:mb-6">
                    <img 
                      src="/Screenshots/levelup.PNG" 
                      alt="Level Up System" 
                      className="rounded-xl w-full h-32 md:h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/levelup.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">📈</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Level Up & Evolve</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    Every 100 XP, students level up and their avatar evolves! From Level 1 to Level 4, each transformation brings excitement and celebrates their growth and achievements.
                  </p>
                </div>
              </div>

              {/* Pet Unlock */}
              <div className="text-center group">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-purple-100 group-hover:shadow-2xl transition-all duration-300">
                  <div className="mb-4 md:mb-6">
                    <img 
                      src="/Screenshots/petunlock.PNG" 
                      alt="Pet Unlock System" 
                      className="rounded-xl w-full h-32 md:h-48 object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/petunlock.PNG')}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <div className="text-3xl md:text-5xl mb-3 md:mb-4">🐾</div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Unlock Companions</h3>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                    At 50 XP, students unlock their first magical pet companion! From dragons to unicorns, these companions accompany students on their learning journey.
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 border border-purple-200">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-8">How Classroom Champions Works</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold">1</div>
                  <h4 className="font-bold text-base md:text-lg mb-2">Positive Actions</h4>
                  <p className="text-gray-600 text-xs md:text-sm">Students demonstrate good behavior, participate in class, complete tasks, and help others.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold">2</div>
                  <h4 className="font-bold text-base md:text-lg mb-2">Instant Rewards</h4>
                  <p className="text-gray-600 text-xs md:text-sm">Teachers award XP and coins instantly with satisfying sound effects and visual celebrations.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold">3</div>
                  <h4 className="font-bold text-base md:text-lg mb-2">Epic Progression</h4>
                  <p className="text-gray-600 text-xs md:text-sm">Avatars evolve at each level, pets unlock at milestones, creating anticipation and excitement.</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-lg md:text-2xl font-bold">4</div>
                  <h4 className="font-bold text-base md:text-lg mb-2">Continued Engagement</h4>
                  <p className="text-gray-600 text-xs md:text-sm">Students stay motivated, classroom culture improves, and learning becomes an adventure they want to continue.</p>
                </div>
              </div>

              <div className="mt-8 md:mt-12 text-center">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 md:p-6 rounded-xl border border-purple-200">
                  <p className="text-base md:text-lg text-gray-700 mb-3 md:mb-4">
                    <strong>Over 40 unique avatars</strong> to unlock, <strong>dozens of magical pets</strong> to discover, and <strong>endless possibilities</strong> for classroom engagement.
                  </p>
                  <p className="text-purple-600 font-semibold text-sm md:text-base">
                    Turn your classroom into the most exciting place your students want to be! 🚀
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features Showcase - Mobile Optimized */}
        <section id="screenshots" className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">One Platform, Endless Possibilities</h2>
              <p className="text-base md:text-xl text-gray-600">From gamification to professional tools - everything your classroom needs.</p>
            </div>
            
            {/* Screenshots Grid with Hover Effect - Mobile Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
              {[
                { src: '/Screenshots/students.png', title: 'Classroom Champions Gamification', desc: 'RPG-style student management with avatars, XP, and leveling' },
                { src: '/Screenshots/teachertools.png', title: 'Professional Teaching Tools', desc: 'Comprehensive toolkit for classroom management' },
                { src: '/Screenshots/shop.png', title: 'Reward System & Shop', desc: 'Motivate students with unlockable rewards and achievements' },
                { src: '/Screenshots/games.png', title: 'Interactive Learning Games', desc: 'Engaging educational games and activities' },
                { src: '/Screenshots/writingprompts.png', title: 'Curriculum Resources', desc: 'Rich content library for all subjects' },
                { src: '/Screenshots/petrace.png', title: 'Engagement Activities', desc: 'Fun classroom activities like pet racing and competitions' }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-3 md:p-4 border border-gray-100 group hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-w-16 aspect-h-10 mb-3 md:mb-4">
                    <img 
                      src={item.src} 
                      alt={item.title}
                      className="rounded-lg w-full h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredImage(item.src)}
                      onMouseLeave={() => setHoveredImage(null)}
                      onError={handleImageError}
                    />
                    <div className="hidden rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 w-full h-32 md:h-48 items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl mb-2">📱</div>
                        <p className="text-gray-600 font-semibold text-sm md:text-base">{item.title}</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section - Mobile Optimized */}
        <section id="story" className="py-12 md:py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements Logo" 
                  className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-4 md:mb-6 rounded-full shadow-2xl"
                />
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Built by Teachers, for Teachers</h2>
                <p className="text-base md:text-xl text-gray-600">The story behind Educational Elements</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-12 border border-purple-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    Educational Elements was born from real classroom experience. As practicing educators, we saw the need for a comprehensive platform that could handle everything from student engagement to professional development.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 md:p-6 rounded-xl my-6 md:my-8 border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium italic text-sm md:text-base">
                      "We needed more than just a behavior management system. We needed a complete educational ecosystem that could grow with our teaching practice and engage students in meaningful ways."
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    Our <strong>Classroom Champions gamification system</strong> became the breakthrough that transformed student engagement. But we didn't stop there. We built a complete platform with professional tools, curriculum resources, and analytics that support every aspect of modern teaching.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-4 md:mb-6 text-sm md:text-base">
                    Every feature has been tested in real classrooms with real students. From the RPG-style progression system to the comprehensive teacher toolkit, Educational Elements is designed to make teaching more effective and learning more engaging.
                  </p>
                </div>

                <div className="mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="text-2xl md:text-4xl">🎯</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base md:text-lg">Our Commitment</h4>
                      <p className="text-gray-700 text-sm md:text-base">Educational Elements is designed to grow with your teaching practice. We're committed to providing ongoing updates, new features, and support that helps you succeed in the modern classroom.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Mobile Optimized */}
        <section id="pricing" className="py-12 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Simple, Affordable Pricing</h2>
              <p className="text-base md:text-xl text-gray-600">Everything you need in one comprehensive platform.</p>
            </div>
            
            {/* Trial Offer Banner - Mobile Optimized */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 md:px-8 py-4 md:py-6 rounded-2xl mb-8 md:mb-12 shadow-2xl text-center max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <span className="text-2xl md:text-4xl">⏰</span>
                <div>
                  <p className="font-bold text-lg md:text-2xl mb-1 md:mb-2">{daysUntilJan1} Days FREE Trial!</p>
                  <p className="text-sm md:text-lg opacity-90">Get complete access to Educational Elements at no cost until January 1st, 2026</p>
                </div>
                <span className="text-2xl md:text-4xl hidden sm:block">⏰</span>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              {/* Single Plan - Mobile Optimized */}
              <div className="bg-gradient-to-b from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-purple-500 relative transform scale-100 md:scale-105">
                <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 md:px-6 py-1 md:py-2 rounded-full text-xs md:text-sm font-bold shadow-lg">
                    🌟 COMPLETE PLATFORM
                  </span>
                </div>
                
                <div className="text-center mb-6 md:mb-8 pt-3 md:pt-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Educational Elements</h3>
                  <div className="mb-3 md:mb-4">
                    <div className="text-3xl md:text-5xl font-bold text-white mb-1 md:mb-2">$5.99</div>
                    <div className="text-purple-200 text-base md:text-lg">per month</div>
                    <div className="text-green-300 font-bold text-sm md:text-lg mt-1 md:mt-2">Currently FREE for {daysUntilJan1} days!</div>
                  </div>
                </div>
                
                <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <li className="flex items-center"><div className="bg-green-200 text-green-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">✓</div><span className="text-white font-semibold text-sm md:text-base">Up to 2 Classrooms</span></li>
                  <li className="flex items-center"><div className="bg-green-200 text-green-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">✓</div><span className="text-white text-sm md:text-base">Unlimited Students</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Classroom Champions Gamification</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Professional Teaching Tools</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Curriculum Resources</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Advanced Analytics</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Interactive Learning Games</span></li>
                  <li className="flex items-center"><div className="bg-yellow-200 text-yellow-700 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-2 md:mr-3 text-xs md:text-sm">★</div><span className="text-white text-sm md:text-base">Priority Support</span></li>
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 md:px-6 py-3 md:py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-base md:text-lg shadow-xl transform hover:scale-105"
                >
                  Start {daysUntilJan1}-Day FREE Trial
                </button>
                <p className="text-center text-purple-200 text-xs md:text-sm mt-2 md:mt-3">FREE for {daysUntilJan1} days • Payment details required • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Mobile Optimized */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">Ready to Transform Your Teaching?</h2>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto">
              Join educators who are already using Educational Elements to create engaging, effective, and modern classroom experiences.
            </p>
            
            <div className="flex justify-center">
              <button 
                onClick={() => router.push('/signup')} 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Start {daysUntilJan1}-Day FREE Trial
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-white/80 mt-6 md:mt-8 text-sm md:text-base">
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>FREE for {daysUntilJan1} days</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>Setup in 5 minutes</span></div>
              <div className="flex items-center"><span className="text-green-400 mr-2">✓</span><span>Cancel anytime</span></div>
            </div>
          </div>
        </section>

        {/* Footer - Mobile Optimized */}
        <footer className="bg-gray-900 text-white py-10 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center mb-3 md:mb-4">
                  <img 
                    src="/Logo/LOGO_NoBG.png" 
                    alt="Educational Elements Logo" 
                    className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3"
                  />
                  <div className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Educational Elements
                  </div>
                </div>
                <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
                  The complete digital learning platform for modern classrooms. From gamification to professional tools - everything you need in one place.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 md:mb-6 text-base md:text-lg">Platform</h4>
                <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Login</button></li>
                  <li><button onClick={() => router.push('/signup')} className="hover:text-white transition-colors">Sign Up</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 md:mb-6 text-base md:text-lg">Support</h4>
                <ul className="space-y-2 md:space-y-3 text-gray-400 text-sm md:text-base">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="mailto:support@educationalelements.com" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
              <p className="text-gray-400 text-sm md:text-base">
                © 2025 Educational Elements. Built with ❤️ for educators everywhere.
              </p>
            </div>
          </div>
        </footer>

        {/* Enlarged Image Preview Overlay - Mobile Optimized */}
        {hoveredImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] pointer-events-none p-4">
            <div className="relative max-w-6xl max-h-[90vh] mx-auto">
              <img 
                src={hoveredImage} 
                alt="Enlarged Preview" 
                className="rounded-2xl shadow-2xl max-w-full max-h-full object-contain"
              />
              <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-white text-gray-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg">
                Hover to preview
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Error boundaries
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap your export with the ErrorBoundary
export default function HomeWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Home />
    </ErrorBoundary>
  );
}

// Add PropTypes if you're using them
Home.propTypes = {
  // Add any props you might use in the future
};