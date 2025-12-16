// pages/index.js - Mobile-Optimized Landing Page
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const displayHighlights = [
    {
      subject: 'English • Alphabet',
      title: 'Alphabet Lettering',
      image: '/Displays/English/Alphabet/Alphabet.png',
      description: 'A full A–Z set ready for phonics walls, literacy rotations, and bulletin boards.'
    },
    {
      subject: 'English • Spelling',
      title: 'Sound It Out Strategies',
      image: '/Displays/English/Spelling/SoundItOut.png',
      description: 'Printable strategy cards that help learners break down tricky words with confidence.'
    },
    {
      subject: 'Maths • Core Operations',
      title: 'Addition Anchor Chart',
      image: '/Displays/Maths/Addition.png',
      description: 'Bright anchor posters that keep addition steps visible during warm-ups and centres.'
    },
    {
      subject: 'Science • Space',
      title: 'Solar System Posters',
      image: '/Displays/Science/Space/SolarSystem.png',
      description: 'Planet visuals that turn your science corner into a mini observatory.'
    },
    {
      subject: 'Behaviour • Zones',
      title: 'Colour Zones & Cues',
      image: '/Displays/Behaviour/Colours.png',
      description: 'Calming colour prompts to support expectations, routines, and regulation.'
    },
    {
      subject: 'Brain Breaks • Games',
      title: 'Secret Leader Game',
      image: '/Displays/Games/SecretLeader.png',
      description: 'Ready-to-print instructions for quick movement breaks that reset focus.'
    }
  ];

  return (
    <>
      <Head>
        <title>Educational Elements | Classroom Gamification & Teacher Tools Platform</title>
        <meta
          name="description"
          content="Educational Elements combines classroom gamification, curriculum resources, and teacher productivity tools into one platform so you can motivate students and streamline lesson planning."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Logo/LOGO_NoBG.png" />
        <link rel="canonical" href="https://educational-elements.com/" />
        <meta name="robots" content="index,follow" />
        <meta name="keywords" content="classroom gamification, teacher tools, student engagement software, curriculum resources for teachers" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Educational Elements | Classroom Gamification & Teacher Tools" />
        <meta
          property="og:description"
          content="Motivate students with RPG-style rewards and manage your classroom with curriculum resources, analytics, and productivity tools. Start your extended free trial."
        />
        <meta property="og:url" content="https://educational-elements.com/" />
        <meta property="og:image" content="https://educational-elements.com/Logo/LOGO_NoBG.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Educational Elements | Classroom Gamification & Teacher Tools" />
        <meta
          name="twitter:description"
          content="All-in-one platform for teachers featuring gamified rewards, curriculum resources, and classroom analytics."
        />
        <meta name="twitter:image" content="https://educational-elements.com/Logo/LOGO_NoBG.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'Educational Elements',
              url: 'https://educational-elements.com/',
              logo: 'https://educational-elements.com/Logo/LOGO_NoBG.png',
              sameAs: [
                'https://www.facebook.com/EducationalElements',
                'https://www.instagram.com/EducationalElements',
                'https://www.youtube.com/@EducationalElements'
              ],
              description:
                'Educational Elements provides classroom gamification, curriculum content, and teacher productivity tools for modern classrooms.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Philadelphia',
                addressRegion: 'PA',
                addressCountry: 'US'
              },
              makesOffer: {
                '@type': 'Offer',
                price: '5.99',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: 'https://educational-elements.com/pricing'
              },
              hasCourse: [
                {
                  '@type': 'Course',
                  name: 'Classroom Champions Gamification',
                  description: 'RPG-inspired student engagement framework with XP, coins, and classroom quests.'
                },
                {
                  '@type': 'Course',
                  name: 'Curriculum Corner Resources',
                  description: 'Library of lesson plans, writing prompts, and math warm-ups for grades 3-8.'
                }
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Educational Elements Classroom Platform',
              applicationCategory: 'EducationApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '5.99',
                priceCurrency: 'USD',
                availability: 'https://schema.org/PreOrder'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '128'
              }
            })
          }}
        />
      </Head>

      <div className="bg-gray-50">
        {/* Navigation - Mobile Optimized */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo and Brand */}
              <div className="flex items-center flex-shrink-0">
                <Link href="/">
                  <Image
                    src="/Logo/LOGO_NoBG.png"
                    alt="Educational Elements logo"
                    width={48}
                    height={48}
                    className="h-8 w-8 md:h-12 md:w-12 mr-2 md:mr-3"
                    priority
                  />
                </Link>
                <div className="text-lg md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Educational Elements
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Features</button>
                <button onClick={() => scrollToSection('story')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">About</button>
                <Link href="/notice-board" className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">
                  Notice Board
                </Link>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium text-lg">Pricing</button>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/login" className="bg-gray-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm lg:text-base">
                  Login
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg text-sm lg:text-base">
                  Start FREE Trial
                </Link>
                <a
                  href="https://educational-elements.com/student"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md text-xs lg:text-sm"
                >
                  🎓 Portal
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 p-2"
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
                  <Link href="/notice-board" className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                    Notice Board
                  </Link>
                  <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-gray-700 hover:text-purple-600 transition-colors font-medium py-2">
                    Pricing
                  </button>
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <Link href="/login" className="block w-full bg-gray-100 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-medium text-center">
                      Login
                    </Link>
                    <Link href="/signup" className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-lg text-center">
                      Start FREE Trial
                    </Link>
                    <a
                      href="https://educational-elements.com/student"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md text-center"
                    >
                      🎓 Student Portal
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section - Mobile Optimized */}
        <section className="relative bg-gradient-to-br from-blue-50 to-indigo-200 pt-20 pb-12 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32">
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
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-center"
                  >
                    🚀 Start {daysUntilJan1}-Day FREE Trial
                  </Link>
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
                    <Image
                      src="/Screenshots/dashboard.png"
                      alt="Educational Elements teacher dashboard overview"
                      width={960}
                      height={540}
                      className="rounded-lg object-cover w-full h-full cursor-pointer transition-transform duration-300 hover:scale-105"
                      onMouseEnter={() => setHoveredImage('/Screenshots/dashboard.png')}
                      onMouseLeave={() => setHoveredImage(null)}
                      priority
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
                    <div className="relative w-full h-32 md:h-48">
                      <Image
                        src="/Screenshots/xpaward.PNG"
                        alt="Classroom Champions XP award celebration"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="rounded-xl object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        onMouseEnter={() => setHoveredImage('/Screenshots/xpaward.PNG')}
                        onMouseLeave={() => setHoveredImage(null)}
                      />
                    </div>
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
                    <div className="relative w-full h-32 md:h-48">
                      <Image
                        src="/Screenshots/levelup.PNG"
                        alt="Student avatar leveling up inside Educational Elements"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="rounded-xl object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        onMouseEnter={() => setHoveredImage('/Screenshots/levelup.PNG')}
                        onMouseLeave={() => setHoveredImage(null)}
                      />
                    </div>
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
                    <div className="relative w-full h-32 md:h-48">
                      <Image
                        src="/Screenshots/petunlock.PNG"
                        alt="Unlocking classroom companion pets"
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="rounded-xl object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                        onMouseEnter={() => setHoveredImage('/Screenshots/petunlock.PNG')}
                        onMouseLeave={() => setHoveredImage(null)}
                      />
                    </div>
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
                  <div className="relative aspect-w-16 aspect-h-10 mb-3 md:mb-4 overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                      className="rounded-lg object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredImage(item.src)}
                      onMouseLeave={() => setHoveredImage(null)}
                    />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900 mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-xs md:text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Displays & Curriculum Corner Preview */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-start gap-10 md:gap-12 mb-10 md:mb-14">
              <div className="lg:w-1/2 space-y-4 md:space-y-6">
                <p className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs md:text-sm uppercase tracking-[0.2em]">
                  New in Curriculum Corner
                </p>
                <h2 className="text-2xl md:text-4xl font-bold leading-tight">
                  Fresh printable displays ready to download, laminate, and brighten your classroom.
                </h2>
                <p className="text-sm md:text-base text-indigo-100 leading-relaxed">
                  Build beautiful bulletin boards in minutes with alphabet lettering, spelling strategies, maths anchors, science posters, behaviour cues, and brain break games—curated from our newest Curriculum Corner uploads.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["Instant download", "High-res for printing", "Sorted by subject", "New assets weekly"].map((item) => (
                    <div key={item} className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg shadow-indigo-900/30">
                      <span className="text-lg md:text-xl mr-2">✨</span>
                      <span className="text-sm md:text-base text-indigo-50">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
                  <Link
                    href="/signup"
                    className="bg-white text-indigo-900 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold shadow-2xl shadow-indigo-900/40 hover:-translate-y-0.5 transition transform"
                  >
                    Browse Curriculum Corner
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white/10 border border-white/20 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-white/15 backdrop-blur"
                  >
                    Already a member? Login
                  </Link>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {displayHighlights.map((item, index) => (
                    <div
                      key={item.title}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/40 backdrop-blur"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="px-4 pt-4 flex items-center justify-between">
                        <span className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-indigo-100 font-semibold">{item.subject}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.25)]" aria-hidden />
                      </div>
                      <div className="relative aspect-[4/3] mx-4 my-3 overflow-hidden rounded-xl border border-white/10 bg-indigo-900/40">
                        <Image
                          src={item.image}
                          alt={`${item.title} display`}
                          fill
                          sizes="(min-width: 1024px) 45vw, (min-width: 768px) 40vw, 90vw"
                          className="object-cover transition duration-500 hover:scale-105"
                        />
                      </div>
                      <div className="px-4 pb-5">
                        <h3 className="font-semibold text-lg md:text-xl text-white mb-1">{item.title}</h3>
                        <p className="text-xs md:text-sm text-indigo-100 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section - Mobile Optimized */}
        <section id="story" className="py-12 md:py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 md:mb-12">
                <div className="mx-auto mb-4 md:mb-6 w-20 h-20 md:w-32 md:h-32 relative">
                  <Image
                    src="/Logo/LOGO_NoBG.png"
                    alt="Educational Elements logo mark"
                    fill
                    sizes="128px"
                    className="rounded-full shadow-2xl object-contain"
                  />
                </div>
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

                <Link
                  href="/signup"
                  className="inline-flex w-full justify-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 md:px-6 py-3 md:py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-base md:text-lg shadow-xl transform hover:scale-105"
                >
                  Start {daysUntilJan1}-Day FREE Trial
                </Link>
                <p className="text-center text-purple-200 text-xs md:text-sm mt-2 md:mt-3">FREE for {daysUntilJan1} days • Payment details required • Cancel anytime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Free Resources Section - Mobile Optimized */}
        <section id="free-resources" className="py-12 md:py-20 bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10 md:mb-16">
              <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-4">
                Free Downloads
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
                Free Teacher Resources
              </h2>
              <p className="text-base md:text-xl text-cyan-100 max-w-2xl mx-auto leading-relaxed">
                Download premium quality classroom materials, slides, and templates completely free. No sign-up required.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Classroom Management Tips",
                  type: "PDF Guide",
                  icon: "📋",
                  color: "from-emerald-400 to-teal-500",
                  desc: "Essential strategies for maintaining a positive and productive classroom environment.",
                  file: "/free-resources/Classroom_Management_Tips.pdf"
                },
                {
                  title: "Math Warmup Slides",
                  type: "PowerPoint",
                  icon: "📊",
                  color: "from-orange-400 to-red-500",
                  desc: "Ready-to-use daily math activation slides to get students thinking immediately.",
                  file: "/free-resources/Math_Warmup_Slides.pptx"
                },
                {
                  title: "Lettering Template Pack",
                  type: "Display Assets",
                  icon: "🎨",
                  color: "from-pink-400 to-purple-500",
                  desc: "Beautiful printable lettering sets for your bulletin boards and displays.",
                  file: "/free-resources/Lettering_Template.zip"
                }
              ].map((resource, index) => (
                <div key={index} className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 md:p-8 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20">
                  <div className={`absolute inset-0 bg-gradient-to-br ${resource.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center text-2xl md:text-3xl shadow-lg`}>
                      {resource.icon}
                    </div>
                    <span className="bg-white/10 text-white/80 text-xs font-semibold px-2 py-1 rounded-lg border border-white/10">
                      {resource.type}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
                    {resource.title}
                  </h3>

                  <p className="text-cyan-100/70 text-sm md:text-base leading-relaxed mb-6">
                    {resource.desc}
                  </p>

                  <a
                    href={resource.file}
                    download
                    className="flex items-center justify-center w-full py-3 md:py-4 bg-white/10 hover:bg-white text-white hover:text-cyan-900 border border-white/20 hover:border-white rounded-xl font-bold transition-all duration-300 group-hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Now
                  </a>
                </div>
              ))}
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
              <Link
                href="/signup"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 md:px-10 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Start {daysUntilJan1}-Day FREE Trial
              </Link>
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
                  <Image
                    src="/Logo/LOGO_NoBG.png"
                    alt="Educational Elements logo"
                    width={32}
                    height={32}
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
                  <li>
                    <Link href="/login" className="hover:text-white transition-colors">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="hover:text-white transition-colors">
                      Sign Up
                    </Link>
                  </li>
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
              <Image
                src={hoveredImage}
                alt="Enlarged preview of Educational Elements interface"
                width={1280}
                height={720}
                className="rounded-2xl shadow-2xl max-w-full h-auto object-contain"
                sizes="100vw"
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