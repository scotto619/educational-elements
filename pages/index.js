// pages/index.js - Redesigned Landing Page
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

const STATS = [
  { value: '10,000+', label: 'Happy Teachers' },
  { value: '500+', label: 'Curriculum Resources' },
  { value: '50+', label: 'Interactive Tools' },
  { value: '4.9★', label: 'Average Rating' },
];

const TESTIMONIALS = [
  {
    quote: "My students actually ask to come inside at lunch now. The quests and pet races have completely transformed how they engage with learning.",
    name: "Sarah M.",
    role: "Year 5 Teacher, Melbourne",
    initials: "SM",
    color: "from-purple-500 to-indigo-500",
  },
  {
    quote: "I've tried so many behaviour management apps. This is the only one where the kids genuinely care about their progress. XP and avatars are genius.",
    name: "James T.",
    role: "Primary School Teacher, Brisbane",
    initials: "JT",
    color: "from-blue-500 to-cyan-500",
  },
  {
    quote: "The free resources alone saved me hours of prep every week. The full platform is an absolute no-brainer for the price.",
    name: "Priya K.",
    role: "Year 3 Teacher, Sydney",
    initials: "PK",
    color: "from-pink-500 to-rose-500",
  },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Head>
        <title>Educational Elements | The Complete Classroom Platform</title>
        <meta name="description" content="Gamify your classroom, manage behaviour, and access thousands of curriculum resources with Educational Elements." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Logo/LOGO_NoBG.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>

      <div className="bg-white overflow-x-hidden font-sans selection:bg-purple-200 selection:text-purple-900">

        {/* ── Navigation ── */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-18 py-3">

              {/* Logo */}
              <div className="flex items-center cursor-pointer gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="relative w-9 h-9">
                  <Image src="/Logo/LOGO_NoBG.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  Educational Elements
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center gap-8">
                <button onClick={() => scrollToSection('features')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Features</button>
                <button onClick={() => scrollToSection('resources')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Free Resources</button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">Pricing</button>
                <Link href="/student" className="text-sm font-bold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100 hover:bg-purple-100">
                  🎓 Student Portal
                </Link>
                <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:shadow-purple-200"
                >
                  Start for $1
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
              <div className="px-6 py-6 space-y-4 flex flex-col">
                <button onClick={() => scrollToSection('features')} className="text-base font-semibold text-gray-700 text-left py-1">Features</button>
                <button onClick={() => scrollToSection('resources')} className="text-base font-semibold text-gray-700 text-left py-1">Free Resources</button>
                <button onClick={() => scrollToSection('pricing')} className="text-base font-semibold text-gray-700 text-left py-1">Pricing</button>
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <Link href="/student" className="flex items-center justify-center gap-2 text-base font-bold text-purple-600 bg-purple-50 px-4 py-3 rounded-xl border border-purple-100">🎓 Student Portal</Link>
                  <Link href="/login" className="flex items-center justify-center text-base font-semibold text-gray-700 py-2">Log in</Link>
                  <Link href="/signup" className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-base">Start for $1</Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ── Hero ── */}
        <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          {/* Background blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full opacity-30 blur-3xl animate-blob" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200 rounded-full opacity-30 blur-3xl animate-blob animation-delay-2000" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-5xl mx-auto">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-bold text-purple-700">Join thousands of happy teachers 🚀</span>
              </div>

              {/* Brand banner image */}
              <div className="relative w-full mx-auto h-40 sm:h-64 md:h-72 lg:h-80 mb-6">
                <Image
                  src="/Displays/Banners/Educational Elements.png"
                  alt="Educational Elements"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
                Where Teaching Meets <br />
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                  Magic & Adventure
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                The all-in-one platform for classroom gamification, curriculum resources, and teacher productivity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl hover:shadow-purple-300 flex items-center justify-center gap-2"
                >
                  Start for $1
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </Link>
                <button
                  onClick={() => scrollToSection('resources')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  🎁 Get Free Resources
                </button>
              </div>

              <p className="mt-5 text-sm text-gray-400 font-medium">
                First month just $1 · Cancel anytime · No credit card needed for free resources
              </p>
            </div>
          </div>
        </section>

        {/* ── Social Proof Stats ── */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Three Pillars ── */}
        <section id="features" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-purple-600 font-bold tracking-wider uppercase text-xs mb-3 block">Everything in one place</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">The Complete Ecosystem</h2>
              <p className="text-xl text-gray-500 max-w-xl mx-auto">Everything you need to run a modern, engaging classroom.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Pillar 1 */}
              <div className="group bg-white rounded-3xl p-8 border border-purple-100 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 transition-all duration-300 hover:-translate-y-1">
                <div className="h-36 w-full relative mb-6">
                  <Image src="/Displays/Banners/ClassroomChampions.png" alt="Classroom Champions" fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="text-center mb-4">
                  <span className="inline-block text-3xl mb-2">🎮</span>
                  <h3 className="text-xl font-extrabold text-gray-900">Gamification</h3>
                </div>
                <p className="text-gray-500 text-center text-sm leading-relaxed mb-5">
                  Transform behaviour management into an RPG adventure.
                </p>
                <ul className="space-y-2">
                  {['Students earn XP & level up', 'Unlock & customise avatars', 'Magical pets & collectibles', 'Class leaderboards'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 2 */}
              <div className="group bg-white rounded-3xl p-8 border border-blue-100 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 hover:-translate-y-1">
                <div className="h-36 w-full relative mb-6">
                  <Image src="/Displays/Banners/TeacherToolkit.png" alt="Teacher Toolkit" fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="text-center mb-4">
                  <span className="inline-block text-3xl mb-2">🛠️</span>
                  <h3 className="text-xl font-extrabold text-gray-900">Productivity</h3>
                </div>
                <p className="text-gray-500 text-center text-sm leading-relaxed mb-5">
                  Essential tools at your fingertips, built for the classroom.
                </p>
                <ul className="space-y-2">
                  {['Random group maker', 'Noise meter & timer', 'Seating chart builder', 'Student analytics'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="group bg-white rounded-3xl p-8 border border-green-100 hover:border-green-300 hover:shadow-2xl hover:shadow-green-100 transition-all duration-300 hover:-translate-y-1">
                <div className="h-36 w-full relative mb-6">
                  <Image src="/Displays/Banners/CurriculumCorner.png" alt="Resource Hub" fill className="object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="text-center mb-4">
                  <span className="inline-block text-3xl mb-2">📚</span>
                  <h3 className="text-xl font-extrabold text-gray-900">Resources</h3>
                </div>
                <p className="text-gray-500 text-center text-sm leading-relaxed mb-5">
                  A growing library of high-quality, classroom-ready materials.
                </p>
                <ul className="space-y-2">
                  {['Printable worksheets & displays', 'Lesson starters & games', 'Aligned to curriculum', 'New resources weekly'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* ── Visual Showcase — Make it Fun ── */}
        <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-blob animation-delay-2000" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              <div className="lg:w-1/2">
                <span className="text-purple-400 font-bold tracking-wider uppercase text-xs mb-4 block">Student engagement</span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight tracking-tight">
                  Make Learning <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                    Irresistibly Fun
                  </span>
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: '🛍️', color: 'bg-purple-500/20', title: 'Classroom Shop', text: 'Students earn coins for good behaviour and spend them on fun, engaging items.' },
                    { icon: '👾', color: 'bg-blue-500/20', title: 'Epic Quests', text: 'Turn assignments into Quests that students actually rush to complete.' },
                    { icon: '🏁', color: 'bg-green-500/20', title: 'Interactive Games', text: 'Run brain breaks with Pet Races and whole-class competitions.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${item.color} flex items-center justify-center text-xl`}>{item.icon}</div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-10">
                  <div className="bg-gray-800/80 rounded-2xl p-2 hover:scale-105 transition-transform duration-500 shadow-2xl ring-1 ring-white/5">
                    <Image src="/Displays/Banners/Shop.png" alt="Shop" width={400} height={150} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                  <div className="bg-gray-800/80 rounded-2xl p-2 hover:scale-105 transition-transform duration-500 shadow-2xl ring-1 ring-white/5">
                    <Image src="/Displays/Banners/Quests.png" alt="Quests" width={400} height={400} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-800/80 rounded-2xl p-2 hover:scale-105 transition-transform duration-500 shadow-2xl ring-1 ring-white/5">
                    <Image src="/Displays/Banners/PetRace.png" alt="Pet Race" width={400} height={400} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                  <div className="bg-gray-800/80 rounded-2xl p-2 hover:scale-105 transition-transform duration-500 shadow-2xl ring-1 ring-white/5">
                    <Image src="/Displays/Banners/Games.png" alt="Games" width={400} height={150} className="w-full h-auto rounded-xl object-contain" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-purple-600 font-bold tracking-wider uppercase text-xs mb-3 block">Teacher stories</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Loved by Teachers</h2>
              <p className="text-xl text-gray-500">Real feedback from real classrooms.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1 text-sm">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Free Resources ── */}
        <section id="resources" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-blue-600 font-bold tracking-wider uppercase text-xs mb-3 block">No login needed</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Free Resource Library</h2>
              <p className="text-xl text-gray-500 max-w-xl mx-auto">
                High-quality, classroom-ready resources to make your week easier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Integer Ocean",
                  subtitle: "Math Adventure",
                  desc: "A deep dive into integers! Solve math mysteries in the ocean depths.",
                  gradient: "from-blue-500 to-cyan-500",
                  icon: "🌊",
                  file: "/free-resources/Integer_Ocean_Adventure.pdf"
                },
                {
                  title: "Paint With Words",
                  subtitle: "Creative Writing",
                  desc: "Unlock creativity with descriptive writing prompts and imaginary worlds.",
                  gradient: "from-purple-500 to-pink-500",
                  icon: "🎨",
                  file: "/free-resources/Paint_Worlds_With_Words.pdf"
                },
                {
                  title: "Game History",
                  subtitle: "Reading Comprehension",
                  desc: "Level up reading skills with passages about video game design.",
                  gradient: "from-green-500 to-emerald-500",
                  icon: "🎮",
                  file: "/free-resources/Video_Game_Comprehension.pdf"
                }
              ].map((resource, i) => (
                <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className={`h-32 bg-gradient-to-br ${resource.gradient} flex items-center justify-center`}>
                    <span className="text-6xl">{resource.icon}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${resource.gradient} mb-3 self-start`}>
                      {resource.subtitle}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">{resource.desc}</p>
                    <a
                      href={resource.file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-800 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-gray-900 group-hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Free PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-base font-bold text-purple-600 hover:text-purple-800 transition-colors group"
              >
                Unlock 500+ more resources in the Resource Hub
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing CTA ── */}
        <section id="pricing" className="py-24 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-purple-400 font-bold tracking-wider uppercase text-xs mb-4 block">Simple pricing</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Ready to Transform Your Classroom?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">Start for just $1 for your first month, then $5.99/month. Full access, no hidden fees, cancel anytime.</p>

            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-1 shadow-2xl shadow-purple-900/50 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-[22px] p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-left">
                    <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">Limited Time Offer</div>
                    <h3 className="text-4xl font-extrabold text-white mb-1">$1 <span className="text-lg font-semibold text-white/70">/ first month</span></h3>
                    <p className="text-white/80 text-sm">Then just $5.99/month. Full access. No surprises.</p>
                    <ul className="mt-4 space-y-1.5">
                      {['All gamification features', 'Complete resource library', 'All teacher tools', 'Unlimited students'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-white/90 text-sm">
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      href="/signup"
                      className="inline-block bg-white text-gray-900 px-8 py-4 rounded-2xl font-extrabold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap"
                    >
                      Start for $1 →
                    </Link>
                    <p className="text-white/50 text-xs mt-2 text-center">Cancel anytime. No lock-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-gray-950 text-gray-500 py-10 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/Logo/LOGO_NoBG.png" alt="Logo" width={28} height={28} className="opacity-40 grayscale" />
              <span className="text-sm">© 2026 Educational Elements. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm">
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
