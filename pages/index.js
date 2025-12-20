// pages/index.js - Redesigned Landing Page
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

  return (
    <>
      <Head>
        <title>Educational Elements | The Complete Classroom Platform</title>
        <meta name="description" content="Gamify your classroom, manage behaviour, and access thousands of curriculum resources with Educational Elements." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Logo/LOGO_NoBG.png" />
      </Head>

      <div className="bg-gray-50 overflow-x-hidden font-sans selection:bg-purple-200 selection:text-purple-900">

        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                <div className="relative w-10 h-10 mr-3">
                  <Image src="/Logo/LOGO_NoBG.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Educational Elements
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-8">
                <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Features</button>
                <button onClick={() => scrollToSection('resources')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Free Resources</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Pricing</button>
                <Link href="/login" className="text-gray-900 font-bold hover:text-purple-700 transition-colors">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-bold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button onClick={toggleMobileMenu} className="p-2 text-gray-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-gray-100">
              <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                <button onClick={() => scrollToSection('features')} className="text-lg font-medium text-gray-800">Features</button>
                <button onClick={() => scrollToSection('resources')} className="text-lg font-medium text-gray-800">Free Resources</button>
                <button onClick={() => scrollToSection('pricing')} className="text-lg font-medium text-gray-800">Pricing</button>
                <Link href="/login" className="text-lg font-bold text-blue-600">Login</Link>
                <Link href="/signup" className="w-full text-center bg-gray-900 text-white px-6 py-3 rounded-xl font-bold">Start Free Trial</Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/50 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-purple-100/50 to-transparent blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                <span className="text-sm font-bold text-gray-600 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                  Join thousands of happy teachers 🚀
                </span>
              </div>

              {/* Main Banner Title */}
              <div className="relative w-full max-w-4xl mx-auto h-24 sm:h-32 md:h-48 mb-6 transition-transform hover:scale-105 duration-700">
                <Image
                  src="/Displays/Banners/Educational Elements.png"
                  alt="Educational Elements"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
                Where Teaching Meets <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Magic & Adventure
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                The all-in-one platform for classroom gamification, curriculum resources, and teacher productivity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all transform hover:scale-105 hover:shadow-2xl flex items-center justify-center"
                >
                  Start {daysUntilJan1}-Day Free Trial
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <button
                  onClick={() => scrollToSection('resources')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all hover:shadow-lg flex items-center justify-center group"
                >
                  <span className="mr-2">🎁</span> Get Free Resources
                </button>
              </div>

              <p className="mt-6 text-sm text-gray-500 font-medium">
                Try it free until 2026 • No credit card required for free resources
              </p>
            </div>
          </div>
        </section>

        {/* The Three Pillars Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">The Complete Ecosystem</h2>
              <p className="text-xl text-gray-600">Everything you need to run a modern, engaging classroom.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Pillar 1: Classroom Champions */}
              <div className="group relative bg-gradient-to-b from-purple-50 to-white rounded-3xl p-6 border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="h-40 w-full relative mb-6 transform group-hover:scale-105 transition-transform duration-300">
                  <Image src="/Displays/Banners/ClassroomChampions.png" alt="Classroom Champions" fill className="object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Gamification</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Transform behaviour management into an RPG adventure. Students earn XP, level up avatars, and unlock magical pets.
                </p>
              </div>

              {/* Pillar 2: Teacher Toolkit */}
              <div className="group relative bg-gradient-to-b from-blue-50 to-white rounded-3xl p-6 border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="h-40 w-full relative mb-6 transform group-hover:scale-105 transition-transform duration-300">
                  <Image src="/Displays/Banners/TeacherToolkit.png" alt="Teacher Toolkit" fill className="object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Productivity</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Essential tools at your fingertips. Group makers, noise meters, timers, and comprehensive student analytics.
                </p>
              </div>

              {/* Pillar 3: Curriculum Corner */}
              <div className="group relative bg-gradient-to-b from-green-50 to-white rounded-3xl p-6 border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="h-40 w-full relative mb-6 transform group-hover:scale-105 transition-transform duration-300">
                  <Image src="/Displays/Banners/CurriculumCorner.png" alt="Curriculum Corner" fill className="object-contain" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Resources</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  A growing library of high-quality printable displays, worksheets, games, and lesson starters.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Showcase - "Make it Fun" */}
        <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full bg-blend-multiply blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full bg-blend-multiply blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                  Make Learning <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    Irresistibly Fun
                  </span>
                </h2>
                <div className="space-y-6 text-lg text-gray-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mr-4">🛍️</div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Classroom Shop</h4>
                      <p>Use existing banners like <span className="text-yellow-400 font-bold">Shop.png</span> to create an immersive economy.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mr-4">👾</div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Epic Quests</h4>
                      <p>Turn assignments into <span className="text-blue-400 font-bold">Quests</span> that students rush to complete.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-2xl mr-4">🏁</div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Interactive Games</h4>
                      <p>Run brain breaks with <span className="text-green-400 font-bold">Pet Races</span> and class competitions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-gray-800 rounded-2xl p-2 transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                    <Image src="/Displays/Banners/Shop.png" alt="Shop" width={400} height={150} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-2 transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                    <Image src="/Displays/Banners/Quests.png" alt="Quests" width={400} height={400} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-800 rounded-2xl p-2 transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                    <Image src="/Displays/Banners/PetRace.png" alt="Pet Race" width={400} height={400} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-2 transform hover:scale-105 transition-transform duration-500 shadow-2xl">
                    <Image src="/Displays/Banners/Games.png" alt="Games" width={400} height={150} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free Resources Section */}
        <section id="resources" className="py-24 bg-gradient-to-b from-blue-50 to-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-2 block">Available Now</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Free Resource Library</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                No login required. Just high-quality, classroom-ready resources to make your week easier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Integer Ocean",
                  subtitle: "Math Adventure",
                  desc: "A deep dive into integers! Solve math mysteries in the ocean depths.",
                  color: "bg-blue-500",
                  image: "/Displays/Maths/Addition.png", // Fallback representative image
                  file: "/free-resources/Integer_Ocean_Adventure.pdf"
                },
                {
                  title: "Paint With Words",
                  subtitle: "Creative Writing",
                  desc: "Unlock creativity with descriptive writing prompts and imaginary worlds.",
                  color: "bg-purple-500",
                  image: "/Displays/English/Alphabet/Alphabet.png", // Fallback representative image
                  file: "/free-resources/Paint_Worlds_With_Words.pdf"
                },
                {
                  title: "Game History",
                  subtitle: "Reading Comprehension",
                  desc: "Level up reading skills with passages about video game design.",
                  color: "bg-green-500",
                  image: "/Displays/Games/SecretLeader.png", // Fallback representative image
                  file: "/free-resources/Video_Game_Comprehension.pdf"
                }
              ].map((resource, i) => (
                <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className={`h-2 w-full ${resource.color}`} />
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${resource.color} opacity-80 uppercase tracking-wide`}>
                        {resource.subtitle}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-gray-600 mb-6 flex-1">
                      {resource.desc}
                    </p>

                    <a
                      href={resource.file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative z-10 w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-xl font-bold transition-colors flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center text-lg font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Unlock 500+ more resources in Curriculum Corner
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="py-20 bg-gray-900 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-white mb-8">Join the Classroom Revolution</h2>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 transform hover:scale-105 transition-transform duration-300 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left">
                  <p className="text-blue-200 font-bold uppercase tracking-wider mb-2">Limited Time Offer</p>
                  <h3 className="text-3xl font-bold text-white mb-1">Free until 2026</h3>
                  <p className="text-white/80">Full access. No hidden fees.</p>
                </div>
                <div className="flex-shrink-0">
                  <Link
                    href="/signup"
                    className="inline-block bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow"
                  >
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <Image src="/Logo/LOGO_NoBG.png" alt="Logo" width={32} height={32} className="mr-3 filter grayscale opacity-50" />
              <span className="text-sm">© 2025 Educational Elements</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}