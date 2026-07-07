// pages/index.js - Landing Page v3 (GSAP-powered, evolved pastel brand)
import { useState, useEffect, useRef } from 'react';
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
  { end: 10000, suffix: '+', label: 'Happy Teachers', format: (v) => Math.round(v).toLocaleString() },
  { end: 500, suffix: '+', label: 'Curriculum Resources', format: (v) => Math.round(v) },
  { end: 50, suffix: '+', label: 'Interactive Tools', format: (v) => Math.round(v) },
  { end: 4.9, suffix: '★', label: 'Average Rating', format: (v) => v.toFixed(1) },
];

const TESTIMONIALS = [
  {
    quote: "My students actually ask to come inside at lunch now. The quests and pet races have completely transformed how they engage with learning.",
    name: 'Sarah M.', role: 'Year 5 Teacher, Melbourne', initials: 'SM',
    bg: '#F3E8FF', border: '#E9D5FF', avatarBg: '#C4B5E8',
  },
  {
    quote: "I've tried so many behaviour management apps. This is the only one where the kids genuinely care about their progress. XP and avatars are genius.",
    name: 'James T.', role: 'Primary School Teacher, Brisbane', initials: 'JT',
    bg: '#EFF6FF', border: '#BFDBFE', avatarBg: '#93C5FD',
  },
  {
    quote: "The free resources alone saved me hours of prep every week. The full platform is an absolute no-brainer for the price.",
    name: 'Priya K.', role: 'Year 3 Teacher, Sydney', initials: 'PK',
    bg: '#FFF0F5', border: '#FBCFE8', avatarBg: '#F9A8D4',
  },
];

const FREE_RESOURCES = [
  { title: 'Mood Modes', subtitle: 'Behaviour & Wellbeing', desc: 'A friendly self-regulation display for middle primary — Recharge, Ready, Alert and Overload modes help students name and manage how they feel.',
    gradient: 'linear-gradient(135deg, #10B981, #3B82F6)', icon: '🦊', file: '/free-resources/Mood_Modes_Middle_Primary.pdf', bg: '#F0FDF4', border: '#A7F3D0' },
  { title: 'Information Report', subtitle: 'Writing Bundle', desc: 'A complete information report pack — structure, examples, templates and checklists to take students from plan to polished report.',
    gradient: 'linear-gradient(135deg, #3B82F6, #06B6D4)', icon: '📰', file: '/free-resources/Information_Report.pdf', bg: '#EFF6FF', border: '#BFDBFE' },
  { title: 'Maths Anchor Charts', subtitle: 'Mathematics', desc: 'Nine bold anchor charts covering fractions, place value, multiplication, measurement, graphs and more — print and display.',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', icon: '⚓', file: '/free-resources/Maths_Anchor_Charts.pdf', bg: '#FFFBEB', border: '#FDE68A' },
  { title: 'Watercolour Decor', subtitle: 'Classroom Decor', desc: 'A soft watercolour-themed classroom decor set — beautiful coordinated posters to refresh your room in one afternoon.',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)', icon: '🎨', file: '/free-resources/Watercolour_Theme_Decor.pdf', bg: '#FDF4FF', border: '#E9D5FF' },
  { title: 'Cleopatra', subtitle: 'HASS · Ancient History', desc: 'Power, propaganda and legacy — a rich ancient history unit exploring one of history’s most fascinating rulers.',
    gradient: 'linear-gradient(135deg, #D97706, #92400E)', icon: '🐍', file: '/free-resources/Cleopatra_Power_Propaganda_Legacy.pdf', bg: '#FFF7ED', border: '#FED7AA' },
  { title: 'Our Solar System Tour', subtitle: 'Science · Space', desc: 'Blast off on a guided tour of the solar system — stunning visuals and fascinating facts about every planet along the way.',
    gradient: 'linear-gradient(135deg, #6366F1, #0EA5E9)', icon: '🪐', file: '/free-resources/Our_Solar_System_Tour.pdf', bg: '#EEF2FF', border: '#C7D2FE' },
];

// ── Reusable marquee row (CSS-driven for perf; GSAP adds scroll-velocity skew) ──
function MarqueeRow({ images, reverse = false, cardW = 220, cardH = 290 }) {
  const doubled = [...images, ...images];
  return (
    <div className="overflow-hidden w-full">
      <div
        className="marquee-track"
        style={{
          display: 'flex',
          width: 'max-content',
          animation: `${reverse ? 'marqueeReverse' : 'marquee'} ${42 + cardW / 10}s linear infinite`,
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={i}
            className="marquee-card"
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
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Split a string into animatable word spans ──
function Words({ text, className = '' }) {
  return text.split(' ').map((w, i) => (
    <span key={i} className="hero-word-mask" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
      <span className={`hero-word inline-block ${className}`}>{w}&nbsp;</span>
    </span>
  ));
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  // ══════════════ Aurora particle canvas (hero) ══════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let raf, w, h, dpr;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const isMobile = window.innerWidth < 768;

    const PALETTE = ['#C4B5FD', '#F9A8D4', '#93C5FD', '#FCD34D', '#A7F3D0'];
    const ORB_COLORS = ['rgba(196,181,253,', 'rgba(249,168,212,', 'rgba(147,197,253,'];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Large soft aurora orbs
    const orbs = Array.from({ length: isMobile ? 3 : 5 }, (_, i) => ({
      x: Math.random(), y: Math.random(),
      r: (isMobile ? 130 : 230) + Math.random() * 120,
      c: ORB_COLORS[i % ORB_COLORS.length],
      sp: 0.0002 + Math.random() * 0.0004,
      ph: Math.random() * Math.PI * 2,
    }));
    // Small floating sparkles
    const sparks = Array.from({ length: isMobile ? 18 : 42 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 1 + Math.random() * 2.4,
      c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      vx: (Math.random() - 0.5) * 0.0004,
      vy: -0.0002 - Math.random() * 0.0005,
      tw: Math.random() * Math.PI * 2,
      twSp: 0.01 + Math.random() * 0.03,
    }));

    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
    };

    let t = 0;
    const draw = () => {
      t += 1;
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      ctx.clearRect(0, 0, w, h);

      orbs.forEach((o, i) => {
        const ox = (o.x + Math.sin(t * o.sp * 10 + o.ph) * 0.08 + (mouse.x - 0.5) * 0.05 * (i % 2 ? 1 : -1)) * w;
        const oy = (o.y + Math.cos(t * o.sp * 8 + o.ph) * 0.07 + (mouse.y - 0.5) * 0.04) * h;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c + '0.35)');
        g.addColorStop(1, o.c + '0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      sparks.forEach((s) => {
        s.x += s.vx; s.y += s.vy; s.tw += s.twSp;
        if (s.y < -0.02) { s.y = 1.02; s.x = Math.random(); }
        if (s.x < -0.02) s.x = 1.02;
        if (s.x > 1.02) s.x = -0.02;
        const a = 0.35 + Math.sin(s.tw) * 0.3;
        ctx.globalAlpha = Math.max(a, 0.05);
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    if (reduced) {
      // Static single frame for reduced-motion users
      draw(); cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
      window.addEventListener('pointermove', onMove, { passive: true });
    }
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ══════════════ GSAP scroll experience ══════════════
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let ctx;
    let cleanupFns = [];
    let alive = true;

    (async () => {
      const gsapModule = await import('gsap');
      const stModule = await import('gsap/dist/ScrollTrigger');
      if (!alive) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = stModule.ScrollTrigger || stModule.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // ── Hero entrance timeline ──
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.hero-badge', { y: 24, autoAlpha: 0, duration: 0.7 })
          .from('.hero-banner', { scale: 0.85, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.4)' }, '-=0.35')
          .from('.hero-word', { yPercent: 110, duration: 0.85, stagger: 0.05 }, '-=0.5')
          .from('.hero-sub', { y: 28, autoAlpha: 0, duration: 0.7 }, '-=0.4')
          .from('.hero-cta', { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
          .from('.hero-trust', { autoAlpha: 0, duration: 0.6 }, '-=0.2')
          .from('.stat-card', { y: 32, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, '-=0.4');

        // ── Animated stat counters ──
        document.querySelectorAll('.stat-value').forEach((el) => {
          const end = parseFloat(el.dataset.end);
          const suffix = el.dataset.suffix || '';
          const isDecimal = el.dataset.decimal === '1';
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end,
            duration: 1.8,
            ease: 'power2.out',
            delay: 0.6,
            onUpdate: () => {
              el.textContent = (isDecimal ? obj.v.toFixed(1) : Math.round(obj.v).toLocaleString()) + suffix;
            },
          });
        });

        // ── Hero parallax out on scroll ──
        gsap.to('.hero-inner', {
          yPercent: -12, autoAlpha: 0.25, ease: 'none',
          scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true },
        });

        // ── Generic reveals: anything with data-reveal ──
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 48, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
        });

        // ── Staggered card groups: data-stagger-group > data-stagger-item ──
        gsap.utils.toArray('[data-stagger-group]').forEach((group) => {
          const items = group.querySelectorAll('[data-stagger-item]');
          gsap.from(items, {
            y: 56, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: { trigger: group, start: 'top 85%' },
          });
        });

        // ── Champions avatars pop-in ──
        gsap.from('.champ-avatar', {
          scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'back.out(1.8)', stagger: { each: 0.06, from: 'random' },
          scrollTrigger: { trigger: '.champ-grid', start: 'top 82%' },
        });

        // ── Marquee skew responds to scroll velocity ──
        const tracks = gsap.utils.toArray('.marquee-track');
        const proxySkew = { v: 0 };
        ScrollTrigger.create({
          trigger: '.marquee-zone', start: 'top bottom', end: 'bottom top',
          onUpdate: (self) => {
            const target = gsap.utils.clamp(-4, 4, self.getVelocity() / -350);
            gsap.to(proxySkew, {
              v: target, duration: 0.4, overwrite: true,
              onUpdate: () => tracks.forEach((tr) => gsap.set(tr, { skewY: proxySkew.v * 0.4, rotate: proxySkew.v * 0.1 })),
            });
            gsap.to(proxySkew, { v: 0, duration: 0.8, delay: 0.1 });
          },
        });

        // ── Floating decorative blobs (continuous) ──
        gsap.utils.toArray('.gsap-blob').forEach((blob, i) => {
          gsap.to(blob, {
            x: i % 2 ? -30 : 30, y: i % 2 ? 24 : -24, scale: 1.06,
            duration: 7 + i * 2, ease: 'sine.inOut', yoyo: true, repeat: -1,
          });
        });

        // ── Section background parallax glows ──
        gsap.utils.toArray('.parallax-slow').forEach((el) => {
          gsap.to(el, {
            yPercent: -22, ease: 'none',
            scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
        });

        // ── Pricing card dramatic entrance ──
        gsap.from('.pricing-card', {
          scale: 0.9, y: 60, autoAlpha: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.pricing-card', start: 'top 85%' },
        });

        // ── Nav: shadow + compact after scroll ──
        ScrollTrigger.create({
          start: 'top -60',
          onToggle: (self) => {
            const nav = document.querySelector('.main-nav');
            if (nav) nav.classList.toggle('nav-scrolled', self.isActive);
          },
        });
      }, rootRef);

      // ── Magnetic buttons (fine pointers only) ──
      if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach((btn) => {
          const onMove = (e) => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - (r.left + r.width / 2);
            const y = e.clientY - (r.top + r.height / 2);
            gsap.to(btn, { x: x * 0.18, y: y * 0.22, duration: 0.4, ease: 'power2.out' });
          };
          const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
          btn.addEventListener('mousemove', onMove);
          btn.addEventListener('mouseleave', onLeave);
          cleanupFns.push(() => { btn.removeEventListener('mousemove', onMove); btn.removeEventListener('mouseleave', onLeave); });
        });
      }
    })();

    return () => {
      alive = false;
      cleanupFns.forEach((fn) => fn());
      if (ctx) ctx.revert();
    };
  }, []);

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
          .marquee-pause:hover .marquee-track {
            animation-play-state: paused !important;
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50%      { background-position: 100% 50%; }
          }
          .animated-gradient-text {
            background: linear-gradient(120deg, #8B5CF6, #EC4899, #3B82F6, #8B5CF6);
            background-size: 280% 280%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: gradientShift 7s ease infinite;
          }
          @keyframes shimmerSweep {
            0%   { transform: translateX(-150%) skewX(-20deg); }
            100% { transform: translateX(280%) skewX(-20deg); }
          }
          .btn-shimmer { position: relative; overflow: hidden; }
          .btn-shimmer::after {
            content: '';
            position: absolute; top: 0; left: 0; height: 100%; width: 40%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
            animation: shimmerSweep 3.2s ease-in-out infinite;
            pointer-events: none;
          }
          .main-nav { transition: box-shadow .35s ease, background-color .35s ease; }
          .nav-scrolled {
            box-shadow: 0 8px 32px rgba(139,92,246,0.12) !important;
            background-color: rgba(255,255,255,0.92) !important;
          }
          .tilt-card { transition: transform .45s cubic-bezier(.2,.8,.25,1), box-shadow .45s ease; will-change: transform; }
          .tilt-card:hover { transform: translateY(-10px) rotate(-0.5deg) scale(1.015); box-shadow: 0 28px 60px rgba(139,92,246,0.18) !important; }
          .avatar-card { transition: transform .35s cubic-bezier(.2,.8,.25,1), border-color .35s ease, background-color .35s ease; }
          .avatar-card:hover { transform: translateY(-6px) scale(1.06) rotate(1.5deg); border-color: rgba(252,211,77,0.7) !important; background-color: rgba(255,255,255,0.14) !important; }
          html { scroll-behavior: smooth; }
          @media (prefers-reduced-motion: reduce) {
            .marquee-track, .btn-shimmer::after, .animated-gradient-text { animation: none !important; }
            html { scroll-behavior: auto; }
          }
        `}</style>
      </Head>

      <div ref={rootRef} style={{ backgroundColor: '#FDFCF8', fontFamily: 'Inter, sans-serif' }} className="overflow-x-hidden">

        {/* ══════════════════════ NAVIGATION ══════════════════════ */}
        <nav style={{ backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #F3E8FF' }}
          className="main-nav fixed w-full top-0 z-50 shadow-sm">
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
                  className="magnetic btn-shimmer text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg">
                  Start for $1
                </Link>
              </div>

              {/* Mobile toggle */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
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
        <section className="hero-section relative pt-28 pb-16 lg:pt-36 lg:pb-20 overflow-hidden"
          style={{ background: 'linear-gradient(155deg, #FDF4FF 0%, #EEF2FF 45%, #FFF0F9 100%)' }}>

          {/* Aurora particle canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />

          <div className="hero-inner relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

            {/* Live badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border shadow-sm mb-8"
              style={{ borderColor: '#E9D5FF' }}>
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-bold" style={{ color: '#7C3AED' }}>Join thousands of happy teachers 🚀</span>
            </div>

            {/* Main title banner */}
            <div className="hero-banner relative w-full mx-auto h-32 sm:h-48 md:h-56 lg:h-64 mb-6">
              <Image
                src="/Displays/Banners/Educational Elements.png"
                alt="Educational Elements"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.08]">
              <Words text="Where Teaching Meets" />
              <br />
              <Words text="Magic & Adventure" className="animated-gradient-text" />
            </h1>

            <p className="hero-sub text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              The all-in-one platform for classroom gamification, curriculum resources, and teacher productivity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.35)' }}
                className="hero-cta magnetic btn-shimmer w-full sm:w-auto px-9 py-4 text-white rounded-2xl font-bold text-lg transition-shadow hover:shadow-2xl flex items-center justify-center gap-2">
                Start for $1
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button onClick={() => scrollToSection('resources')}
                className="hero-cta magnetic w-full sm:w-auto px-9 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                🎁 Browse Free Resources
              </button>
            </div>

            <p className="hero-trust mt-5 text-sm text-gray-400 font-medium">
              First month just $1 · Cancel anytime · No credit card needed for free resources
            </p>

            {/* Animated stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-3xl mx-auto">
              {STATS.map((stat) => (
                <div key={stat.label}
                  className="stat-card rounded-2xl px-4 py-5 bg-white/70 backdrop-blur-md border shadow-sm"
                  style={{ borderColor: '#F3E8FF' }}>
                  <div className="stat-value text-2xl md:text-3xl font-extrabold"
                    data-end={stat.end}
                    data-suffix={stat.suffix}
                    data-decimal={stat.end % 1 !== 0 ? '1' : '0'}
                    style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {stat.format(stat.end)}{stat.suffix}
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ RESOURCE GALLERY (MARQUEE) ══════════════════════ */}
        <section className="marquee-zone py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FAF5FF 0%, #EEF2FF 50%, #FFF0F9 100%)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14" data-reveal>
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

          <div className="text-center mt-12" data-reveal>
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
            <div className="text-center mb-16" data-reveal>
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#8B5CF6' }}>Everything in one place</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">The Complete Ecosystem</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">Everything you need to run a modern, engaging, stress-free classroom.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-stagger-group>
              {[
                {
                  banner: '/Displays/Banners/ClassroomChampions.png',
                  icon: '🎮',
                  title: 'Gamification',
                  desc: 'Transform behaviour management into an RPG adventure your students will love.',
                  features: ['Students earn XP & level up', 'Unlock & customise avatars', 'Magical pets & collectibles', 'Live class leaderboards'],
                  cardBg: '#FDF4FF', bannerBg: '#F3E8FF', border: '#E9D5FF', checkBg: '#F5F0FF', checkColor: '#8B5CF6',
                },
                {
                  banner: '/Displays/Banners/TeacherToolkit.png',
                  icon: '🛠️',
                  title: 'Teacher Tools',
                  desc: 'Essential classroom tools at your fingertips — built by teachers, for teachers.',
                  features: ['Random group maker', 'Noise meter & class timer', 'Seating chart builder', 'Student analytics dashboard'],
                  cardBg: '#EFF6FF', bannerBg: '#DBEAFE', border: '#BFDBFE', checkBg: '#EFF6FF', checkColor: '#3B82F6',
                },
                {
                  banner: '/Displays/Banners/CurriculumCorner.png',
                  icon: '📚',
                  title: 'Curriculum Resources',
                  desc: 'A constantly growing library of high-quality, classroom-ready materials.',
                  features: ['Printable worksheets & displays', 'Lesson starters & games', 'Aligned to curriculum', 'New resources added weekly'],
                  cardBg: '#F0FDF4', bannerBg: '#D1FAE5', border: '#A7F3D0', checkBg: '#ECFDF5', checkColor: '#10B981',
                },
              ].map((p, i) => (
                <div key={i} data-stagger-item
                  style={{ backgroundColor: p.cardBg, border: `1.5px solid ${p.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}
                  className="tilt-card group rounded-3xl p-8">
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

        {/* ══════════════════════ CLASSROOM CHAMPIONS (merged showcase) ══════════════════════ */}
        <section id="champions" className="py-24 overflow-hidden relative"
          style={{ background: 'linear-gradient(155deg, #1E1B4B 0%, #312E81 45%, #4C1D95 100%)' }}>

          {/* Decorative glow */}
          <div className="parallax-slow absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #A78BFA, transparent)' }} />
          <div className="parallax-slow absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #EC4899, transparent)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-16" data-reveal>
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
              <div className="space-y-6" data-stagger-group>
                {[
                  { icon: '⚔️', title: 'Hero Classes & Avatars', text: 'Students choose from dozens of unique RPG heroes — Knights, Wizards, Druids, Bards and more — each with beautiful levelled-up artwork.' },
                  { icon: '⭐', title: 'XP & Levelling System', text: 'Award XP for great work, positive behaviour, and class participation. Watch students race to reach the next level.' },
                  { icon: '🛍️', title: 'Classroom Shop & Coins', text: 'Students earn coins for great behaviour and spend them on rewards, consumables, and accessories in the class shop.' },
                  { icon: '👾', title: 'Epic Quests', text: 'Turn assignments into Quests that students are excited to complete and hand in early.' },
                  { icon: '🏁', title: 'Pet Races & Companions', text: 'Students collect magical pets and cheer them on in thrilling whole-class pet races — the perfect brain break.' },
                  { icon: '🏆', title: 'Live Class Leaderboard', text: 'Real-time rankings keep the whole class excited and motivated — even students who usually disengage get hooked.' },
                ].map(item => (
                  <div key={item.title} data-stagger-item className="flex items-start gap-4">
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
                <p className="text-center text-xs font-bold tracking-widest uppercase mb-5" style={{ color: '#C4B5E8' }} data-reveal>
                  Choose from 100+ unique hero avatars
                </p>
                <div className="champ-grid grid grid-cols-4 gap-3">
                  {CHAMPION_AVATARS.map((av, i) => (
                    <div key={i}
                      style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(196,181,253,0.2)', borderRadius: 16 }}
                      className="champ-avatar avatar-card p-3 flex flex-col items-center gap-2 cursor-default">
                      <div className="relative w-full aspect-square">
                        <Image src={av.src} alt={av.name} fill className="object-contain" />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: '#C4B5E8' }}>{av.name}</span>
                    </div>
                  ))}
                </div>

                {/* Sub-banners */}
                <div className="grid grid-cols-2 gap-3 mt-4" data-stagger-group>
                  {['/Displays/Banners/Shop.png', '/Displays/Banners/Quests.png', '/Displays/Banners/PetRace.png', '/Displays/Banners/Games.png'].map((src, i) => (
                    <div key={i} data-stagger-item
                      style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(196,181,253,0.15)', borderRadius: 12, overflow: 'hidden' }}
                      className="hover:scale-105 transition-transform duration-300">
                      <Image src={src} alt="" width={300} height={150} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center" data-reveal>
              <Link href="/signup"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}
                className="magnetic btn-shimmer inline-block text-white px-10 py-4 rounded-2xl font-bold text-lg transition-shadow hover:shadow-2xl">
                Set Up Your Class for Free →
              </Link>
              <p className="mt-3 text-sm" style={{ color: 'rgba(196,181,253,0.6)' }}>First month just $1 · No lock-in</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-reveal>
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#8B5CF6' }}>Teacher stories</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Loved by Teachers</h2>
              <p className="text-lg text-gray-500">Real feedback from real classrooms across Australia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-stagger-group>
              {TESTIMONIALS.map((t) => (
                <div key={t.name} data-stagger-item
                  style={{ backgroundColor: t.bg, border: `1.5px solid ${t.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                  className="tilt-card rounded-3xl p-8 flex flex-col">
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
        <section id="resources" className="py-24 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #FAF5FF 0%, #EEF2FF 100%)' }}>

          <div className="gsap-blob absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle at 40% 40%, #E9D5FF, #BFDBFE 60%, transparent)' }} />
          <div className="gsap-blob absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle at 60% 60%, #FCE7F3, #DDD6FE 60%, transparent)' }} />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16" data-reveal>
              <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: '#3B82F6' }}>No login needed</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Free Resource Library</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                High-quality, classroom-ready resources to make your week easier — completely free.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-stagger-group>
              {FREE_RESOURCES.map((resource, i) => (
                <div key={i} data-stagger-item
                  style={{ backgroundColor: resource.bg, border: `1.5px solid ${resource.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                  className="tilt-card group rounded-3xl overflow-hidden flex flex-col">
                  <div className="h-32 flex items-center justify-center" style={{ background: resource.gradient }}>
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{resource.icon}</span>
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

            <div className="mt-20 text-center" data-reveal>
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

          <div className="parallax-slow absolute inset-0 pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167,139,250,0.3), transparent)' }} />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <div data-reveal>
              <span className="text-xs font-bold tracking-widest uppercase mb-4 block" style={{ color: '#C4B5E8' }}>Simple pricing</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: '#A5B4FC' }}>
                Start for just $1 for your first month, then $5.99/month. Full access, no hidden fees, cancel anytime.
              </p>
            </div>

            <div className="pricing-card max-w-2xl mx-auto rounded-3xl p-px shadow-2xl"
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
                      className="magnetic btn-shimmer inline-block bg-white text-gray-900 px-8 py-4 rounded-2xl font-extrabold text-lg hover:bg-gray-50 transition-colors shadow-xl whitespace-nowrap">
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
