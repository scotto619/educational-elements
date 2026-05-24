// pages/index.js - Redesigned Landing Page (Pastel Theme)
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

// ── Resource gallery images (auto-scrolling showcase) ──
const GALLERY_ROW_1 = [
  { src: '/Displays/English/Writing/Narrative/Narrative Writing Structure.png', alt: 'Narrative Writing Structure' },
  { src: '/Displays/English/Phonics/Blends/BL Blend.png', alt: 'BL Blend Phonics' },
  { src: '/Displays/English/Phonics/Blends/BR Blend.png', alt: 'BR Blend Phonics' },
  { src: '/Displays/English/Writing/Persuasive/Persuasive Writing Structure.png', alt: 'Persuasive Writing Structure' },
  { src: '/Displays/English/Worksheets/Grammar/VerbsWorksheet.png', alt: 'Verbs Worksheet' },
  { src: '/Displays/English/Writing/Informative/Informative Writing Structure.png', alt: 'Informative Writing Structure' },
  { src: '/Displays/English/Worksheets/Writing/PersuasiveWritingWorksheet.png', alt: 'Persuasive Writing Worksheet' },
  { src: '/Displays/English/Worksheets/Writing/TEELParagraphWorksheet.png', alt: 'TEEL Worksheet' },
];

const GALLERY_ROW_2 = [
  { src: '/Displays/Maths/Worksheets/AustralianCurrencyWorksheet.png', alt: 'Australian Currency' },
  { src: '/Displays/Maths/Number/Addition.png', alt: 'Addition' },
  { src: '/Displays/Science/Space/SolarSystem.png', alt: 'Solar System' },
  { src: '/Displays/English/Worksheets/Comprehension/Ancient History/ComprehensionWorksheet4.png', alt: 'Reading Comprehension' },
  { src: '/Displays/English/Worksheets/Comprehension/Young Readers/ComprehensionWorksheet.png', alt: 'Reading Comprehension' },
  { src: '/Displays/Maths/Worksheets/CountingWorksheet.png', alt: 'Counting Worksheet' },
  { src: '/Displays/Science/Space/Earth.png', alt: 'Earth Our Blue Marble' },
  { src: '/Displays/English/Worksheets/Comprehension/Ancient History/ComprehensionWorksheet5.png', alt: 'Comprehension' },
];

const GALLERY_ROW_3 = [
  { src: '/Displays/English/Phonics/Blends/SH Blend.png', alt: 'SH Blend' },
  { src: '/Displays/Maths/Worksheets/Multiplication Worksheet.png', alt: 'Multiplication Worksheet' },
  { src: '/Displays/English/Phonics/Blends/TR Blend.png', alt: 'TR Blend' },
  { src: '/Displays/Maths/Worksheets/SkipCountingWorksheet.png', alt: 'Skip Counting Worksheet' },
  { src: '/Displays/English/Writing/Poetry/Poetry Writing Structure.png', alt: 'Poetry Structure' },
  { src: '/Displays/Maths/Worksheets/PlaceValueWorksheet.png', alt: 'Place Value' },
  { src: '/Displays/English/Worksheets/Comprehension/Young Readers/ComprehensionWorksheet2.png', alt: 'Comprehension Worksheet' },
  { src: '/Displays/English/Worksheets/Writing/NarrativeWritingWorksheet.png', alt: 'Narrative Worksheet' },
];

// ── Avatar showcase for Classroom Champions ──
const CHAMPION_AVATARS = [
  { src: '/avatars/Knight F/Level 2.png', name: 'Knight' },
  { src: '/avatars/Wizard M/Level 3.png', name: 'Wizard' },
  { src: '/avatars/Druid F/Level 2.png', name: 'Druid' },
  { src: '/avatars/Paladin M/Level 2.png', name: 'Paladin' },
  { src: '/avatars/Bard F/Level 2.png', name: 'Bard' },
  { src: '/avatars/Rogue M/Level 3.png', name: 'Rogue' },
  { src: '/avatars/Necromancer F/Level 2.png', name: 'Necromancer' },
  { src: '/avatars/Monk M/Level 2.png', name: 'Monk' },
];

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
    bg: '#F3E8FF',
    border: '#E9D5FF',
    avatarBg: '#C4B5E8',
  },
  {
    quote: "I've tried so many behaviour management apps. This is the only one where the kids genuinely care about their progress. XP and avatars are genius.",
    name: "James T.",
    role: "Primary School Teacher, Brisbane",
    initials: "JT",
    bg: '#EFF6FF',
    border: '#BFDBFE',
    avatarBg: '#93C5FD',
  },
  {
    quote: "The free resources alone saved me hours of prep every week. The full platform is an absolute no-brainer for the price.",
    name: "Priya K.",
    role: "Year 3 Teacher, Sydney",
    initials: "PK",
    bg: '#FFF0F5',
    border: '#FBCFE8',
    avatarBg: '#F9A8D4',
  },
];

// ── Reusable marquee row ──
function MarqueeRow({ images, reverse = false, cardW = 220, cardH = 290 }) {
  const doubled = [...images, ...images];
  return (
    <div className="overflow-hidden w-full">
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `${reverse ? 'marqueeReverse' : 'marquee'} ${42 + cardW / 10}s linear infinite`,
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={i}
            style={{
              flexShrink: 0,
              width: cardW,
              height: cardH,
              margin: '0 8px',
              borderRadius: 16,
              overflow: 'hidden',
              border: '2px solid rgba(196,181,253,0.25)',
              boxShadow: '0 4px 20px rgba(139,92,246,0.08)',
              background: '#fff',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marqueeReverse {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-pause:hover > div {
            animation-play-state: paused !important;
          }
          @keyframes blobFloat {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33%       { transform: translate(20px, -20px) scale(1.05); }
            66%       { transform: translate(-15px, 10px) scale(0.97); }
          }
          .blob { animation: blobFloat 12s ease-in-out infinite; }
          .blob-delay { animation-delay: -5s; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .fade-up { animation: fadeUp 0.7s ease both; }
          .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
          .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
          html { scroll-behavior: smooth; }
        `}</style>
      </Head>

      <div style={{ backgroundColor: '#FDFCF8', fontFamily: 'Inter, sans-serif' }} className="overflow-x-hidden">

        {/* ══════════════════════ NAVIGATION ══════════════════════ */}
        <nav style={{ backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F3E8FF' }}
          className="fixed w-full top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">

              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="relative w-9 h-9">
                  <Image src="/Logo/LOGO_NoBG.png" alt="Educational Elements" fill className="object-contain" />
                </div>
                <span className="text-lg font-extrabold tracking-tight"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Educational Elements
                </span>
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-7">
                {[['Features', 'features'], ['Resources', 'resources'], ['Champions', 'champions'], ['Pricing', 'pricing']].map(([label, id]) => (
                  <button key={id} onClick={() => scrollToSection(id)}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                    {label}
                  </button>
                ))}
                <Link href="/student"
                  style={{ color: '#8B5CF6', backgroundColor: '#F5F0FF', border: '1.5px solid #E9D5FF' }}
                  className="text-sm font-bold px-3 py-1.5 rounded-full transition-all hover:shadow-md">
                  🎓 Student Portal
                </Link>
                <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link href="/signup"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                  className="text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:opacity-90">
                  Start for $1
                </Link>
              </div>

              {/* Mobile toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 rounded-lg hover:bg-purple-50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white border-t shadow-lg" style={{ borderColor: '#F3E8FF' }}>
              <div className="px-6 py-6 flex flex-col space-y-4">
                {[['Features', 'features'], ['Resources', 'resources'], ['Champions', 'champions'], ['Pricing', 'pricing']].map(([label, id]) => (
                  <button key={id} onClick={() => scrollToSection(id)}
                    className="text-base font-semibold text-gray-700 text-left py-1">
                    {label}
                  </button>
                ))}
                <div className="border-t pt-4 space-y-3" style={{ borderColor: '#F3E8FF' }}>
                  <Link href="/student"
                    style={{ color: '#8B5CF6', backgroundColor: '#F5F0FF', border: '1.5px solid #E9D5FF' }}
                    className="flex items-center justify-center gap-2 text-base font-bold px-4 py-3 rounded-xl">
                    🎓 Student Portal
                  </Link>
                  <Link href="/login" className="flex items-center justify-center text-base font-semibold text-gray-700 py-2">
                    Log in
                  </Link>
                  <Link href="/signup"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                    className="flex items-center justify-center text-white px-6 py-3 rounded-xl font-bold text-base">
                    Start for $1
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* ══════════════════════ HERO ══════════════════════ */}
        <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #FDF4FF 0%, #EEF2FF 45%, #FFF0F9 100%)' }}>

          {/* Background blobs */}
          <div className="blob absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-50"
            style={{ background: 'radial-gradient(circle at 40% 40%, #E9D5FF, #BFDBFE 60%, transparent)' }} />
          <div className="blob blob-delay absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle at 60% 60%, #FCE7F3, #DDD6FE 60%, transparent)' }} />

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Live badge */}
            <div className="fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm mb-8"
              style={{ borderColor: '#E9D5FF' }}>
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold" style={{ color: '#7C3AED' }}>Join thousands of happy teachers 🚀</span>
            </div>

            {/* Main title banner */}
            <div className="fade-up-2 relative w-full mx-auto h-36 sm:h-56 md:h-64 lg:h-72 mb-6">
              <Image
                src="/Displays/Banners/Educational Elements.png"
                alt="Educational Elements"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="fade-up-2 text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]">
              Where Teaching Meets<br />
              <span style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Magic &amp; Adventure
              </span>
            </h1>

            <p className="fade-up-3 text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              The all-in-one platform for classroom gamification, curriculum resources, and teacher productivity.
            </p>

            <div className="fade-up-3 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
                className="w-full sm:w-auto px-9 py-4 text-white rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:scale-105 flex items-center justify-center gap-2">
                Start for $1
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button onClick={() => scrollToSection('resources')}
                className="w-full sm:w-auto px-9 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2">
                🎁 Browse Free Resources
              </button>
            </div>

            <p className="mt-5 text-sm text-gray-400 font-medium">
              First month just $1 · Cancel anytime · No credit card needed for free resources
            </p>
          </div>
        </section>

        {/* ══════════════════════ STATS BAR ══════════════════════ */}
        <section className="py-10 bg-white border-b" style={{ borderColor: '#F3E8FF' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl md:text-4xl font-extrabold"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ RESOURCE GALLERY (MARQUEE) ══════════════════════ */}
        <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FAF5FF 0%, #EEF2FF 50%, #FFF0F9 100%)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
            <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#8B5CF6' }}>
              Hundreds of beautiful resources
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ready-to-Use Classroom Materials
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Professionally designed across every subject and year level — English, Maths, Science, HASS and more.
            </p>
          </div>

          {/* Three marquee rows */}
          <div className="marquee-pause space-y-4">
            <MarqueeRow images={GALLERY_ROW_1} reverse={false} cardW={210} cardH={285} />
            <MarqueeRow images={GALLERY_ROW_2} reverse={true}  cardW={260} cardH={195} />
            <MarqueeRow images={GALLERY_ROW_3} reverse={false} cardW={210} cardH={280} />
          </div>

          <div className="text-center mt-12">
            <Link href="/signup"
              className="inline-flex items-center gap-2 font-bold text-base transition-all group"
              style={{ color: '#8B5CF6' }}>
              Unlock 500+ resources in the Resource Hub
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ══════════════════════ THREE PILLARS ══════════════════════ */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#8B5CF6' }}>Everything in one place</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">The Complete Ecosystem</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Everything you need to run a modern, engaging, stress-free classroom.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  banner: '/Displays/Banners/ClassroomChampions.png',
                  icon: '🎮',
                  title: 'Gamification',
                  desc: 'Transform behaviour management into an RPG adventure your students will love.',
                  features: ['Students earn XP & level up', 'Unlock & customise avatars', 'Magical pets & collectibles', 'Live class leaderboards'],
                  cardBg: '#FDF4FF',
                  bannerBg: '#F3E8FF',
                  border: '#E9D5FF',
                  checkBg: '#F5F0FF',
                  checkColor: '#8B5CF6',
                },
                {
                  banner: '/Displays/Banners/TeacherToolkit.png',
                  icon: '🛠️',
                  title: 'Teacher Tools',
                  desc: 'Essential classroom tools at your fingertips — built by teachers, for teachers.',
                  features: ['Random group maker', 'Noise meter & class timer', 'Seating chart builder', 'Student analytics dashboard'],
                  cardBg: '#EFF6FF',
                  bannerBg: '#DBEAFE',
                  border: '#BFDBFE',
                  checkBg: '#EFF6FF',
                  checkColor: '#3B82F6',
                },
                {
                  banner: '/Displays/Banners/CurriculumCorner.png',
                  icon: '📚',
                  title: 'Curriculum Resources',
                  desc: 'A constantly growing library of high-quality, classroom-ready materials.',
                  features: ['Printable worksheets & displays', 'Lesson starters & games', 'Aligned to curriculum', 'New resources added weekly'],
                  cardBg: '#F0FDF4',
                  bannerBg: '#D1FAE5',
                  border: '#A7F3D0',
                  checkBg: '#ECFDF5',
                  checkColor: '#10B981',
                },
              ].map((p, i) => (
                <div key={i}
                  style={{ backgroundColor: p.cardBg, border: `1.5px solid ${p.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  className="group rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative h-36 rounded-2xl overflow-hidden mb-6 flex items-center justify-center"
                    style={{ backgroundColor: p.bannerBg }}>
                    <Image src={p.banner} alt={p.title} fill className="object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="text-center mb-4">
                    <span className="inline-block text-3xl mb-2">{p.icon}</span>
                    <h3 className="text-xl font-extrabold text-gray-900">{p.title}</h3>
                  </div>
                  <p className="text-gray-500 text-center text-sm leading-relaxed mb-5">{p.desc}</p>
                  <ul className="space-y-2">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: p.checkBg, color: p.checkColor }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ CLASSROOM CHAMPIONS ══════════════════════ */}
        <section id="champions" className="py-24 overflow-hidden relative"
          style={{ background: 'linear-gradient(155deg, #1E1B4B 0%, #312E81 45%, #4C1D95 100%)' }}>

          {/* Decorative glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-16">
              <div className="relative inline-block h-16 w-72 mb-4">
                <Image src="/Displays/Banners/ClassroomChampions.png" alt="Classroom Champions" fill className="object-contain" />
              </div>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: '#C4B5E8' }}>
                Transform your classroom into an epic RPG adventure. Students choose their hero, earn XP, level up, unlock pets, and compete on the leaderboard.
              </p>
            </div>

            {/* Content: features + avatar grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-16">

              {/* Feature list */}
              <div className="space-y-7">
                {[
                  { icon: '⚔️', title: 'Hero Classes & Avatars', text: 'Students choose from dozens of unique RPG heroes — Knights, Wizards, Druids, Bards and more — each with beautiful levelled-up artwork.' },
                  { icon: '⭐', title: 'XP & Levelling System', text: 'Award XP for great work, positive behaviour, and class participation. Watch students race to reach the next level.' },
                  { icon: '🐾', title: 'Pets & Companions', text: 'Students earn and collect magical pets that appear on their champion card, adding a personal touch to their journey.' },
                  { icon: '🏆', title: 'Live Class Leaderboard', text: 'Real-time rankings keep the whole class excited and motivated — even students who usually disengage get hooked.' },
                  { icon: '🛍️', title: 'Classroom Shop & Coins', text: 'Students earn coins for great behaviour and spend them on rewards, consumables, and accessories in the class shop.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: 'rgba(196,181,253,0.15)', border: '1px solid rgba(196,181,253,0.2)' }}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1 text-base">{item.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: '#A5B4FC' }}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Avatar showcase grid */}
              <div>
                <p className="text-center text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#C4B5E8' }}>
                  Choose from 100+ unique hero avatars
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {CHAMPION_AVATARS.map((av, i) => (
                    <div key={i}
                      style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(196,181,253,0.2)', borderRadius: 16 }}
                      className="p-3 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-default">
                      <div className="relative w-full aspect-square">
                        <Image src={av.src} alt={av.name} fill className="object-contain" />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#C4B5E8' }}>{av.name}</span>
                    </div>
                  ))}
                </div>

                {/* Sub-banners */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {['/Displays/Banners/Shop.png', '/Displays/Banners/Quests.png', '/Displays/Banners/PetRace.png'].map((src, i) => (
                    <div key={i}
                      style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.15)', borderRadius: 12, overflow: 'hidden' }}>
                      <Image src={src} alt="" width={200} height={100} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/signup"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
                className="inline-block text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 hover:scale-105">
                Set Up Your Class for Free →
              </Link>
              <p className="mt-3 text-sm" style={{ color: 'rgba(196,181,253,0.6)' }}>First month just $1 · No lock-in</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ ENGAGEMENT FEATURES ══════════════════════ */}
        <section className="py-24 overflow-hidden relative"
          style={{ background: 'linear-gradient(155deg, #0F172A 0%, #1E293B 100%)' }}>

          <div className="absolute top-10 left-10 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }} />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              <div className="lg:w-1/2">
                <span className="text-xs font-bold tracking-widest uppercase block mb-4" style={{ color: '#A78BFA' }}>
                  Student engagement
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight tracking-tight">
                  Make Learning<br />
                  <span style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Irresistibly Fun
                  </span>
                </h2>
                <div className="space-y-6">
                  {[
                    { icon: '🛍️', bg: 'rgba(139,92,246,0.2)', title: 'Classroom Shop', text: 'Students earn coins for great behaviour and spend them on fun, engaging items and rewards.' },
                    { icon: '👾', bg: 'rgba(59,130,246,0.2)',  title: 'Epic Quests',    text: 'Turn assignments into Quests that students are excited to complete and hand in early.' },
                    { icon: '🏁', bg: 'rgba(16,185,129,0.2)', title: 'Pet Races',       text: 'Run thrilling whole-class pet races as brain breaks — students cheer for their champions.' },
                    { icon: '🎲', bg: 'rgba(236,72,153,0.2)',  title: 'Interactive Games', text: 'Dozens of curriculum-linked games to run in minutes with zero preparation needed.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div style={{ backgroundColor: item.bg }} className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-0.5">{item.title}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  {['/Displays/Banners/Shop.png', '/Displays/Banners/Quests.png'].map((src, i) => (
                    <div key={i}
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 8 }}
                      className="hover:scale-105 transition-transform duration-300">
                      <Image src={src} alt="" width={400} height={200} className="w-full h-auto rounded-xl object-contain" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {['/Displays/Banners/PetRace.png', '/Displays/Banners/Games.png'].map((src, i) => (
                    <div key={i}
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: 8 }}
                      className="hover:scale-105 transition-transform duration-300">
                      <Image src={src} alt="" width={400} height={200} className="w-full h-auto rounded-xl object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#8B5CF6' }}>Teacher stories</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Loved by Teachers</h2>
              <p className="text-lg text-gray-500">Real feedback from real classrooms across Australia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.name}
                  style={{ backgroundColor: t.bg, border: `1.5px solid ${t.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                  className="rounded-3xl p-8 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed flex-1 text-sm italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: t.avatarBg }}>
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

        {/* ══════════════════════ FREE RESOURCES ══════════════════════ */}
        <section id="resources" className="py-24"
          style={{ background: 'linear-gradient(180deg, #FAF5FF 0%, #EEF2FF 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#3B82F6' }}>No login needed</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Free Resource Library</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                High-quality, classroom-ready resources to make your week easier — completely free.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Integer Ocean',
                  subtitle: 'Math Adventure',
                  desc: 'A deep dive into integers! Solve math mysteries in the ocean depths.',
                  gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                  icon: '🌊',
                  file: '/free-resources/Integer_Ocean_Adventure.pdf',
                  bg: '#EFF6FF',
                  border: '#BFDBFE',
                },
                {
                  title: 'Paint With Words',
                  subtitle: 'Creative Writing',
                  desc: 'Unlock creativity with descriptive writing prompts and imaginary worlds.',
                  gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  icon: '🎨',
                  file: '/free-resources/Paint_Worlds_With_Words.pdf',
                  bg: '#FDF4FF',
                  border: '#E9D5FF',
                },
                {
                  title: 'Game History',
                  subtitle: 'Reading Comprehension',
                  desc: 'Level up reading skills with passages about the history of video games.',
                  gradient: 'linear-gradient(135deg, #10B981, #3B82F6)',
                  icon: '🎮',
                  file: '/free-resources/Video_Game_Comprehension.pdf',
                  bg: '#F0FDF4',
                  border: '#A7F3D0',
                },
                {
                  title: 'Zones of Regulation',
                  subtitle: 'Social-Emotional Learning',
                  desc: 'Help students identify and manage their emotions using the four colour zones framework.',
                  gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                  icon: '🧠',
                  file: '/free-resources/Zones_of_Regulation.pdf',
                  bg: '#FFFBEB',
                  border: '#FDE68A',
                },
              ].map((resource, i) => (
                <div key={i}
                  style={{ backgroundColor: resource.bg, border: `1.5px solid ${resource.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                  className="group rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="h-32 flex items-center justify-center" style={{ background: resource.gradient }}>
                    <span className="text-6xl">{resource.icon}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 self-start"
                      style={{ background: resource.gradient }}>
                      {resource.subtitle}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">{resource.desc}</p>
                    <a href={resource.file} download target="_blank" rel="noopener noreferrer"
                      style={{ backgroundColor: 'white', color: '#8B5CF6', border: '1.5px solid #E9D5FF' }}
                      className="w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 hover:text-white hover:border-transparent"
                      onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg,#8B5CF6,#EC4899)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'transparent'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#8B5CF6'; e.currentTarget.style.borderColor = '#E9D5FF'; }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Free PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/signup"
                className="inline-flex items-center gap-2 text-base font-bold transition-all group"
                style={{ color: '#8B5CF6' }}>
                Unlock 500+ more resources in the Resource Hub
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════ PRICING CTA ══════════════════════ */}
        <section id="pricing" className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #1E1B4B 0%, #312E81 50%, #4C1D95 100%)' }}>

          <div className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167,139,250,0.3), transparent)' }} />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <span className="text-xs font-bold tracking-widest uppercase mb-4 block" style={{ color: '#C4B5E8' }}>Simple pricing</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Ready to Transform Your Classroom?
            </h2>
            <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#A5B4FC' }}>
              Start for just $1 for your first month, then $5.99/month. Full access, no hidden fees, cancel anytime.
            </p>

            <div className="max-w-2xl mx-auto rounded-3xl p-px shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #A78BFA, #EC4899, #60A5FA)' }}>
              <div className="rounded-[22px] p-8 md:p-10"
                style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.95), rgba(157,23,77,0.95))' }}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-left">
                    <div className="inline-block text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider"
                      style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                      Limited Time Offer
                    </div>
                    <h3 className="text-4xl font-extrabold text-white mb-1">
                      $1 <span className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>/ first month</span>
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      Then just $5.99/month. Full access. No surprises.
                    </p>
                    <ul className="space-y-2">
                      {['All gamification features', 'Complete resource library', 'All teacher tools', 'Unlimited students'].map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                          <svg className="w-4 h-4 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <Link href="/signup"
                      className="inline-block bg-white text-gray-900 px-8 py-4 rounded-2xl font-extrabold text-lg hover:bg-gray-50 transition-all shadow-xl hover:scale-105 whitespace-nowrap">
                      Start for $1 →
                    </Link>
                    <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>Cancel anytime. No lock-in.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ FOOTER ══════════════════════ */}
        <footer className="py-10 border-t" style={{ backgroundColor: '#0A0714', borderColor: '#1E1B4B' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Image src="/Logo/LOGO_NoBG.png" alt="Logo" width={28} height={28} className="opacity-30 grayscale" />
              <span className="text-sm text-gray-600">© 2026 Educational Elements. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
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
