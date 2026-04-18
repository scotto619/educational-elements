// components/curriculum/literacy/PartnerReadingPassages.js
import React, { useState, useRef } from 'react';

// ─── Passage Data ─────────────────────────────────────────────────────────────
const passages = [
  {
    id: 'octopus',
    title: 'The Secret Life of the Octopus',
    icon: '🐙',
    subject: 'Ocean Science',
    palette: {
      bg: 'from-cyan-600 to-blue-700',
      light: 'bg-cyan-50',
      border: 'border-cyan-200',
      badge: 'bg-cyan-100 text-cyan-800',
      accent: 'text-cyan-700',
      star: '#0e7490',
      moon: '#1d4ed8',
      headerText: 'text-white',
    },
    illustration: '🦑',
    paragraphs: [
      {
        partner: 'star',
        text: 'Deep beneath the ocean waves, in rocky caves and coral reefs, lives one of the most intelligent creatures on Earth — the octopus. With eight long, flexible arms covered in hundreds of suckers, the octopus is built for survival. Each sucker can taste and smell, helping the octopus explore its world in a way that\'s completely different from us.',
      },
      {
        partner: 'moon',
        text: 'One of the most amazing things about the octopus is its ability to change colour and texture in less than a second. Tiny cells in its skin, called chromatophores, expand and contract to create dazzling patterns. Whether hiding from a shark or sneaking up on a crab, the octopus is a master of disguise.',
      },
      {
        partner: 'star',
        text: 'Octopuses are surprisingly clever problem-solvers. Scientists have watched them open jars, escape from tanks, and even carry coconut shells to use as portable shelters. Some octopuses have been seen collecting rocks and arranging them outside their dens — a sign of planning ahead, something very few animals can do.',
      },
      {
        partner: 'moon',
        text: 'If an octopus is grabbed by a predator, it has a spectacular escape plan. It squirts a cloud of dark ink to confuse the attacker, then rockets backwards using jets of water. In a final twist, a caught arm can be shed like a lizard\'s tail — and slowly, a new one will grow back in its place.',
      },
      {
        partner: 'star',
        text: 'Despite being so impressive, an octopus lives a short and mostly solitary life, rarely more than two years. After a female lays her eggs, she guards them tirelessly for weeks, gently fanning them with fresh water, never leaving to eat. When the tiny hatchlings finally emerge, a new generation of ocean geniuses begins its journey.',
      },
    ],
  },
  {
    id: 'volcano',
    title: 'Fire Mountains: The Story of Volcanoes',
    icon: '🌋',
    subject: 'Earth Science',
    palette: {
      bg: 'from-orange-600 to-red-700',
      light: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      accent: 'text-orange-700',
      star: '#c2410c',
      moon: '#9f1239',
      headerText: 'text-white',
    },
    illustration: '⛰️',
    paragraphs: [
      {
        partner: 'star',
        text: 'Far beneath your feet, the Earth is not solid rock all the way through. Deep underground, rock becomes so hot that it melts into a thick, slow-moving liquid called magma. When pressure builds up and magma finds a weak spot in the Earth\'s crust, it bursts upward through an opening called a vent — and a volcano is born.',
      },
      {
        partner: 'moon',
        text: 'When a volcano erupts, the magma that reaches the surface is given a new name: lava. Lava can flow as slowly as a person walking, or shoot out as fast as a racing car. Along with lava, volcanoes launch enormous clouds of ash and gas into the sky, which can travel thousands of kilometres and block sunlight for months.',
      },
      {
        partner: 'star',
        text: 'Not all volcanoes look the same. Some are wide and gently sloping, built by thin, runny lava that spreads far before cooling. Others are steep and cone-shaped, created by thick lava and explosive eruptions that pile up material around the vent. The famous Mount Fuji in Japan and Mauna Loa in Hawaii are both volcanoes, yet they look completely different.',
      },
      {
        partner: 'moon',
        text: 'As frightening as volcanoes can be, they are also creators. The lava and ash they release slowly break down into some of the most fertile soil on the planet. Communities have lived near volcanoes for thousands of years because the land grows food so well. Ancient Romans built cities near Mount Vesuvius for exactly this reason.',
      },
      {
        partner: 'star',
        text: 'Today, scientists called volcanologists work to monitor and predict volcanic eruptions. They measure tiny earthquakes, track changes in the shape of the volcano, and study the gases it releases. Their work helps communities prepare and evacuate in time. While no volcano can be perfectly predicted, modern science saves thousands of lives every year.',
      },
    ],
  },
  {
    id: 'space',
    title: 'Reaching for the Stars: A History of Space Exploration',
    icon: '🚀',
    subject: 'Space & History',
    palette: {
      bg: 'from-indigo-700 to-purple-800',
      light: 'bg-indigo-50',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800',
      accent: 'text-indigo-700',
      star: '#4338ca',
      moon: '#7e22ce',
      headerText: 'text-white',
    },
    illustration: '🌌',
    paragraphs: [
      {
        partner: 'star',
        text: 'For thousands of years, humans gazed up at the night sky with wonder. The stars and planets seemed impossibly far away — beautiful, mysterious, and unreachable. Then, in the mid-twentieth century, everything changed. Scientists and engineers began designing machines powerful enough to break free from Earth\'s gravity and travel into the vast darkness of space.',
      },
      {
        partner: 'moon',
        text: 'The space race began in 1957, when the Soviet Union launched Sputnik — a small metal sphere about the size of a beach ball — into orbit around Earth. It beeped as it circled the globe, and the world listened in amazement. Just four years later, Soviet cosmonaut Yuri Gagarin became the first human to travel to space, completing one full orbit of Earth.',
      },
      {
        partner: 'star',
        text: 'The United States was determined to go further. On 20 July 1969, the Apollo 11 mission landed on the Moon. Neil Armstrong became the first person to walk on another world, leaving behind a famous message: "That\'s one small step for man, one giant leap for mankind." Over 600 million people — the largest television audience ever at the time — watched live.',
      },
      {
        partner: 'moon',
        text: 'Since then, space exploration has continued to push boundaries. Robotic rovers have trundled across the surface of Mars, sending back stunning photographs of an alien landscape. Space telescopes like the Hubble have peered billions of light-years into the universe, capturing images of galaxies being born and dying in spectacular explosions called supernovae.',
      },
      {
        partner: 'star',
        text: 'Today, astronauts from many nations live and work together aboard the International Space Station, orbiting Earth at 28,000 kilometres per hour. Private companies are now building their own rockets and spacecraft, dreaming of sending people to Mars within your lifetime. The universe is enormous, and humanity has only just taken its first steps into the dark.',
      },
    ],
  },
  {
    id: 'rainforest',
    title: 'Journey into the Rainforest',
    icon: '🌿',
    subject: 'Environment & Nature',
    palette: {
      bg: 'from-emerald-600 to-green-700',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
      accent: 'text-emerald-700',
      star: '#065f46',
      moon: '#166534',
      headerText: 'text-white',
    },
    illustration: '🦜',
    paragraphs: [
      {
        partner: 'star',
        text: 'Rainforests are among the most extraordinary places on our planet. Found near the equator where rainfall is heavy and temperatures stay warm all year, they burst with more life per square metre than almost anywhere else on Earth. The Amazon Rainforest in South America alone is home to more than three million species of plants, animals, and insects.',
      },
      {
        partner: 'moon',
        text: 'A rainforest is not one single place — it is a layered world stacked on top of itself. At the very top, tall trees called emergents poke above the rest, catching sunlight. Below sits the canopy, a thick ceiling of leaves where monkeys swing and birds nest. Further down in the dim understorey, jaguars prowl, and on the dark forest floor, fungi and insects do vital work recycling nutrients.',
      },
      {
        partner: 'star',
        text: 'Rainforests act like the lungs of our planet. Their billions of trees absorb carbon dioxide from the atmosphere and release oxygen, helping to keep our air clean. They also play a huge role in weather patterns, releasing so much water vapour that they essentially create their own rainfall — feeding rivers that supply fresh water to millions of people.',
      },
      {
        partner: 'moon',
        text: 'Many of the medicines we use today were discovered in rainforest plants. Indigenous peoples who have lived in these forests for thousands of years hold deep knowledge about which plants can heal wounds, treat fevers, or ease pain. Scientists work alongside these communities to understand this knowledge before it is lost forever.',
      },
      {
        partner: 'star',
        text: 'Sadly, rainforests are disappearing at an alarming rate. Every minute, an area the size of several football fields is cut down. The good news is that people around the world are fighting to protect these vital ecosystems. By reducing deforestation, replanting trees, and supporting sustainable farming, we can help ensure that rainforests continue to thrive for generations to come.',
      },
    ],
  },
  {
    id: 'olympics',
    title: 'The Ancient Olympics: Glory, Sweat & Olive Wreaths',
    icon: '🏅',
    subject: 'History & Sport',
    palette: {
      bg: 'from-amber-500 to-yellow-600',
      light: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      accent: 'text-amber-700',
      star: '#92400e',
      moon: '#78350f',
      headerText: 'text-white',
    },
    illustration: '🏛️',
    paragraphs: [
      {
        partner: 'star',
        text: 'More than 2,700 years ago, in the small city of Olympia in ancient Greece, something remarkable began. In 776 BCE, Greek athletes gathered to compete in honour of Zeus, the king of the gods. These were the first Olympic Games, and they would be held every four years without fail for nearly twelve centuries. Wars were paused, and rival city-states set aside their disputes so athletes could travel safely to compete.',
      },
      {
        partner: 'moon',
        text: 'The events of the ancient Olympics were very different from today. Athletes competed in the stadion — a running race of about 192 metres — as well as wrestling, discus, javelin, and long jump. There was even a terrifying event called the pankration, which combined boxing and wrestling with almost no rules at all. Only free Greek men were allowed to compete, and many athletes competed in the nude.',
      },
      {
        partner: 'star',
        text: 'Winning at the ancient Olympics was one of the greatest honours a Greek man could achieve. The prize was not gold or silver, but a simple wreath of olive leaves — cut from a sacred tree near the Temple of Zeus. Yet winners were treated like heroes when they returned home. Poets wrote odes in their honour, cities built statues of them, and some were given free meals for life.',
      },
      {
        partner: 'moon',
        text: 'The ancient Games finally ended in 393 CE when the Roman Emperor Theodosius banned all pagan festivals. For more than 1,500 years, the Olympics were forgotten. It was a French educator named Pierre de Coubertin who revived them. In 1896, the first modern Olympic Games were held in Athens, Greece, with 14 nations sending 241 athletes to compete in 43 events.',
      },
      {
        partner: 'star',
        text: 'Today the Olympic Games are the world\'s largest sporting event, with over 200 nations and thousands of athletes competing every four years. While the prizes are now gold, silver, and bronze medals rather than olive wreaths, the spirit remains the same — the pursuit of excellence, the celebration of human achievement, and the hope that sport can bring the world together in peace.',
      },
    ],
  },
];

// ─── Print Styles ─────────────────────────────────────────────────────────────
const PrintStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden !important; }
      #partner-reading-print-area,
      #partner-reading-print-area * { visibility: visible !important; }
      #partner-reading-print-area {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 99999 !important;
        background: white !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `}</style>
);

// ─── Partner Key Badge ────────────────────────────────────────────────────────
const PartnerKey = ({ palette }) => (
  <div
    style={{
      display: 'flex',
      gap: '24px',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px 20px',
      background: 'rgba(255,255,255,0.18)',
      borderRadius: '999px',
      border: '1.5px solid rgba(255,255,255,0.35)',
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13px', color: 'white' }}>
      <span style={{ fontSize: '17px' }}>⭐</span> Partner 1
    </span>
    <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.4)' }} />
    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13px', color: 'white' }}>
      <span style={{ fontSize: '17px' }}>🌙</span> Partner 2
    </span>
  </div>
);

// ─── Printable Passage View ───────────────────────────────────────────────────
const PrintView = ({ passage, onClose }) => {
  const handlePrint = () => window.print();

  const gradientStart = passage.id === 'octopus' ? '#0e7490' :
    passage.id === 'volcano' ? '#c2410c' :
    passage.id === 'space' ? '#4338ca' :
    passage.id === 'rainforest' ? '#065f46' : '#92400e';

  const gradientEnd = passage.id === 'octopus' ? '#1d4ed8' :
    passage.id === 'volcano' ? '#9f1239' :
    passage.id === 'space' ? '#7e22ce' :
    passage.id === 'rainforest' ? '#166534' : '#78350f';

  const accentLight = passage.id === 'octopus' ? '#e0f2fe' :
    passage.id === 'volcano' ? '#fff7ed' :
    passage.id === 'space' ? '#eef2ff' :
    passage.id === 'rainforest' ? '#ecfdf5' : '#fffbeb';

  const borderColor = passage.id === 'octopus' ? '#bae6fd' :
    passage.id === 'volcano' ? '#fed7aa' :
    passage.id === 'space' ? '#c7d2fe' :
    passage.id === 'rainforest' ? '#a7f3d0' : '#fde68a';

  return (
    <div>
      <PrintStyles />

      {/* Screen controls — hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-5 flex-wrap gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
        >
          ← Back to Passages
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save as PDF
          </button>
        </div>
      </div>

      {/* The printable A4 page */}
      <div
        id="partner-reading-print-area"
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          margin: '0 auto',
          background: 'white',
          boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
          fontFamily: '"Georgia", "Times New Roman", serif',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            padding: '18px 28px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '4px',
              }}>
                Partner Reading · {passage.subject}
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'white',
                margin: 0,
                lineHeight: 1.15,
                fontFamily: 'Arial Black, Arial, sans-serif',
              }}>
                {passage.title}
              </h1>
            </div>
            <div style={{ fontSize: '52px', lineHeight: 1, opacity: 0.9 }}>
              {passage.illustration}
            </div>
          </div>
          <PartnerKey />
        </div>

        {/* Decorative divider */}
        <div style={{
          height: '5px',
          background: `repeating-linear-gradient(90deg, ${gradientStart} 0, ${gradientStart} 10px, ${gradientEnd} 10px, ${gradientEnd} 20px)`,
          opacity: 0.25,
        }} />

        {/* Passages */}
        <div style={{
          flex: 1,
          padding: '16px 28px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '11px',
          background: accentLight,
        }}>
          {passage.paragraphs.map((para, index) => {
            const isStar = para.partner === 'star';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  background: 'white',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Symbol column */}
                <div style={{
                  flexShrink: 0,
                  width: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '1px',
                  gap: '3px',
                }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>
                    {isStar ? '⭐' : '🌙'}
                  </span>
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: isStar ? gradientStart : gradientEnd,
                    fontFamily: 'Arial, sans-serif',
                    whiteSpace: 'nowrap',
                  }}>
                    P{isStar ? '1' : '2'}
                  </span>
                </div>
                {/* Text */}
                <p style={{
                  margin: 0,
                  fontSize: '11.5px',
                  lineHeight: 1.65,
                  color: '#1e293b',
                  textAlign: 'justify',
                  fontFamily: 'Georgia, serif',
                }}>
                  {para.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 28px',
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial, sans-serif', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Educational Elements · Partner Reading
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Arial, sans-serif' }}>⭐ = Partner 1</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Arial, sans-serif' }}>🌙 = Partner 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Passage Card ─────────────────────────────────────────────────────────────
const PassageCard = ({ passage, onSelect }) => {
  const gradientClass = `bg-gradient-to-br ${passage.palette.bg}`;
  return (
    <button
      onClick={() => onSelect(passage)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border border-slate-100"
    >
      {/* Colour header */}
      <div className={`${gradientClass} p-5 flex items-center justify-between`}>
        <div>
          <span className={`inline-block text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-2 ${passage.palette.badge}`}>
            {passage.subject}
          </span>
          <h3 className="text-white font-black text-base leading-snug pr-2" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
            {passage.title}
          </h3>
        </div>
        <span className="text-5xl opacity-90 flex-shrink-0 ml-2">{passage.illustration}</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
          {passage.paragraphs[0].text}
        </p>

        {/* Partner key */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-base">⭐</span> Partner 1
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-base">🌙</span> Partner 2
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {passage.paragraphs.length} paragraphs
            </span>
          </div>
        </div>

        <div className={`w-full py-2.5 rounded-xl text-white text-sm font-bold text-center bg-gradient-to-r ${passage.palette.bg} group-hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Open &amp; Print
        </div>
      </div>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PartnerReadingPassages = ({ showToast }) => {
  const [selectedPassage, setSelectedPassage] = useState(null);

  if (selectedPassage) {
    return (
      <PrintView
        passage={selectedPassage}
        onClose={() => setSelectedPassage(null)}
      />
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-700 px-8 py-9 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="text-6xl">🤝</div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-violet-300 mb-1">English · Reading</div>
            <h2 className="text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
              Partner Reading Passages
            </h2>
            <p className="text-violet-200 text-sm mt-1.5 max-w-xl leading-relaxed">
              Beautifully designed, printable passages for two readers. Each paragraph is labelled
              with&nbsp;<strong>⭐ Partner 1</strong>&nbsp;or&nbsp;<strong>🌙 Partner 2</strong>&nbsp;so partners take turns reading aloud.
            </p>
          </div>
        </div>

        {/* How to use strip */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          {[
            { icon: '🖨️', label: 'Print-ready — fits one A4 page' },
            { icon: '📄', label: 'Save as PDF from print dialog' },
            { icon: '🤝', label: '5 engaging topics included' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Passage cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {passages.map(passage => (
          <PassageCard key={passage.id} passage={passage} onSelect={setSelectedPassage} />
        ))}
      </div>

      {/* Tip */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-violet-800 font-bold text-sm">How to use these passages</p>
          <p className="text-violet-600 text-sm mt-0.5">
            Pair students up and open a passage. The student who reads ⭐ paragraphs is Partner 1, and the student reading 🌙 paragraphs is Partner 2. They take turns reading each paragraph aloud to each other. Use the <strong>Print</strong> button to print, or <strong>Save as PDF</strong> (choose "Save as PDF" from the print dialog) for digital use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerReadingPassages;
