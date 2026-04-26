// constants/cardEffects.js
// All purchasable & loot-able special effects for student avatar cards.
//
// preview fields:
//   borderClass    – Tailwind border applied to the card div itself
//   bgClass        – card background (light mode)
//   darkBgClass    – card background (dark mode)
//   auraClass      – Tailwind gradient stops for the inner colour-wash div
//   glowStyle      – Raw CSS box-shadow for the outer glow wrapper (bright state)
//   glowStyleDim   – Raw CSS box-shadow for the outer glow wrapper (dim state, used in pulse keyframe)
//   animDuration   – Duration of the glow pulse animation (default '2.5s')
//   spinGradient   – conic-gradient() string for the spinning inner overlay (optional)
//   spinSpeed      – duration of the spin (default '5s')

export const CARD_EFFECTS = [

  // ─── CLASSIC EFFECTS ─────────────────────────────────────────────────────────
  {
    id: 'frost-glow',
    name: 'Frost Glow',
    price: 100,
    rarity: 'rare',
    category: 'glow',
    description: 'An icy shimmer dances around your student card.',
    colors: ['#a5f3fc', '#38bdf8'],
    preview: {
      auraClass: 'from-cyan-200/50 via-sky-100/40 to-blue-200/50',
      glowStyle: '0 0 18px rgba(56,189,248,0.75), 0 0 40px rgba(56,189,248,0.35)',
      glowStyleDim: '0 0 8px rgba(56,189,248,0.25)',
      animDuration: '2s',
    }
  },
  {
    id: 'ember-flare',
    name: 'Ember Flare',
    price: 120,
    rarity: 'epic',
    category: 'fire',
    description: 'Fiery sparks orbit your card with a warm glow.',
    colors: ['#fb923c', '#f97316', '#facc15'],
    preview: {
      auraClass: 'from-amber-200/50 via-orange-200/40 to-yellow-200/40',
      glowStyle: '0 0 22px rgba(251,146,60,0.85), 0 0 50px rgba(249,115,22,0.4)',
      glowStyleDim: '0 0 10px rgba(251,146,60,0.3)',
      animDuration: '1.8s',
      spinGradient: 'conic-gradient(from 0deg, #ef4444, #f97316, #facc15, #f97316, #ef4444, #f97316, #facc15)',
      spinSpeed: '4s',
    }
  },
  {
    id: 'starlit-rain',
    name: 'Starlit Rain',
    price: 120,
    rarity: 'epic',
    category: 'special',
    description: 'Twinkling stars fall softly around your card.',
    colors: ['#c4b5fd', '#f5d0fe', '#e0f2fe'],
    preview: {
      auraClass: 'from-indigo-200/50 via-fuchsia-100/50 to-blue-200/50',
      glowStyle: '0 0 25px rgba(129,140,248,0.75), 0 0 55px rgba(196,181,253,0.3)',
      glowStyleDim: '0 0 10px rgba(129,140,248,0.25)',
      animDuration: '3s',
    }
  },
  {
    id: 'aurora-veil',
    name: 'Aurora Veil',
    price: 175,
    rarity: 'legendary',
    category: 'special',
    description: 'A silky aurora curtain wraps your student card.',
    colors: ['#a855f7', '#22d3ee', '#34d399'],
    preview: {
      auraClass: 'from-purple-300/50 via-cyan-200/50 to-emerald-200/50',
      glowStyle: '0 0 28px rgba(168,85,247,0.8), 0 0 60px rgba(34,211,238,0.35)',
      glowStyleDim: '0 0 12px rgba(168,85,247,0.3)',
      animDuration: '3s',
      spinGradient: 'conic-gradient(from 0deg, #a855f7, #22d3ee, #34d399, #f0abfc, #a855f7)',
      spinSpeed: '6s',
    }
  },
  {
    id: 'neon-wave',
    name: 'Neon Wave',
    price: 100,
    rarity: 'rare',
    category: 'glow',
    description: 'Electric lines pulse around your profile.',
    colors: ['#22d3ee', '#a855f7'],
    preview: {
      auraClass: 'from-cyan-200/60 via-white/30 to-fuchsia-200/60',
      glowStyle: '0 0 22px rgba(34,211,238,0.8), 0 0 50px rgba(168,85,247,0.3)',
      glowStyleDim: '0 0 10px rgba(34,211,238,0.25)',
      animDuration: '2s',
    }
  },

  // ─── COLOURED BORDERS ────────────────────────────────────────────────────────
  {
    id: 'crimson-border',
    name: 'Crimson Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A vivid crimson border frames your card with fiery intensity.',
    colors: ['#ef4444', '#dc2626'],
    preview: {
      borderClass: 'border-4 border-red-500',
      auraClass: 'from-red-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(239,68,68,0.65), 0 0 35px rgba(239,68,68,0.25)',
      glowStyleDim: '0 0 6px rgba(239,68,68,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'sapphire-border',
    name: 'Sapphire Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A deep sapphire border gleams with oceanic brilliance.',
    colors: ['#3b82f6', '#2563eb'],
    preview: {
      borderClass: 'border-4 border-blue-500',
      auraClass: 'from-blue-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(59,130,246,0.65), 0 0 35px rgba(59,130,246,0.25)',
      glowStyleDim: '0 0 6px rgba(59,130,246,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'emerald-border',
    name: 'Emerald Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A lush emerald border shimmers like a forest gem.',
    colors: ['#10b981', '#059669'],
    preview: {
      borderClass: 'border-4 border-emerald-500',
      auraClass: 'from-emerald-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(16,185,129,0.65), 0 0 35px rgba(16,185,129,0.25)',
      glowStyleDim: '0 0 6px rgba(16,185,129,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'amethyst-border',
    name: 'Amethyst Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A rich amethyst border radiates mystic purple energy.',
    colors: ['#8b5cf6', '#7c3aed'],
    preview: {
      borderClass: 'border-4 border-violet-500',
      auraClass: 'from-violet-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(139,92,246,0.65), 0 0 35px rgba(139,92,246,0.25)',
      glowStyleDim: '0 0 6px rgba(139,92,246,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'obsidian-border',
    name: 'Obsidian Border',
    price: 110,
    rarity: 'epic',
    category: 'border',
    description: 'A dark obsidian border gives your card a shadowy power.',
    colors: ['#374151', '#1f2937'],
    preview: {
      borderClass: 'border-4 border-gray-700',
      auraClass: 'from-gray-400/25 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(75,85,99,0.7), 0 0 35px rgba(55,65,81,0.35)',
      glowStyleDim: '0 0 6px rgba(75,85,99,0.2)',
      animDuration: '3s',
    }
  },
  {
    id: 'rose-border',
    name: 'Rose Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A delicate rose-pink border blooms with floral charm.',
    colors: ['#f43f5e', '#e11d48'],
    preview: {
      borderClass: 'border-4 border-rose-500',
      auraClass: 'from-rose-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(244,63,94,0.65), 0 0 35px rgba(244,63,94,0.25)',
      glowStyleDim: '0 0 6px rgba(244,63,94,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'teal-border',
    name: 'Teal Border',
    price: 100,
    rarity: 'epic',
    category: 'border',
    description: 'A cool teal border ripples with oceanic calm.',
    colors: ['#14b8a6', '#0d9488'],
    preview: {
      borderClass: 'border-4 border-teal-500',
      auraClass: 'from-teal-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(20,184,166,0.65), 0 0 35px rgba(20,184,166,0.25)',
      glowStyleDim: '0 0 6px rgba(20,184,166,0.2)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'coral-border',
    name: 'Coral Border',
    price: 110,
    rarity: 'epic',
    category: 'border',
    description: 'A warm coral border glows with tropical energy.',
    colors: ['#f97316', '#ea580c'],
    preview: {
      borderClass: 'border-4 border-orange-500',
      auraClass: 'from-orange-200/35 via-transparent to-transparent',
      glowStyle: '0 0 16px rgba(249,115,22,0.65), 0 0 35px rgba(249,115,22,0.25)',
      glowStyleDim: '0 0 6px rgba(249,115,22,0.2)',
      animDuration: '2.5s',
    }
  },

  // ─── GLOW EFFECTS ────────────────────────────────────────────────────────────
  {
    id: 'azure-glow',
    name: 'Azure Glow',
    price: 130,
    rarity: 'epic',
    category: 'glow',
    description: 'A pulsating azure aura brightens your card like a beacon.',
    colors: ['#38bdf8', '#0ea5e9'],
    preview: {
      auraClass: 'from-sky-300/55 via-sky-100/35 to-blue-200/45',
      glowStyle: '0 0 25px rgba(56,189,248,0.85), 0 0 55px rgba(14,165,233,0.4)',
      glowStyleDim: '0 0 10px rgba(56,189,248,0.25)',
      animDuration: '2s',
    }
  },
  {
    id: 'magenta-glow',
    name: 'Magenta Glow',
    price: 130,
    rarity: 'epic',
    category: 'glow',
    description: 'A vibrant magenta aura pulses with pop-art energy.',
    colors: ['#ec4899', '#d946ef'],
    preview: {
      auraClass: 'from-pink-300/55 via-fuchsia-100/35 to-rose-200/45',
      glowStyle: '0 0 25px rgba(236,72,153,0.85), 0 0 55px rgba(217,70,239,0.4)',
      glowStyleDim: '0 0 10px rgba(236,72,153,0.25)',
      animDuration: '2s',
    }
  },
  {
    id: 'jade-glow',
    name: 'Jade Glow',
    price: 130,
    rarity: 'epic',
    category: 'glow',
    description: 'A mystical jade glow emanates ancient forest energy.',
    colors: ['#22c55e', '#16a34a'],
    preview: {
      auraClass: 'from-green-300/55 via-emerald-100/35 to-teal-200/45',
      glowStyle: '0 0 25px rgba(34,197,94,0.85), 0 0 55px rgba(22,163,74,0.4)',
      glowStyleDim: '0 0 10px rgba(34,197,94,0.25)',
      animDuration: '2s',
    }
  },
  {
    id: 'solar-glow',
    name: 'Solar Glow',
    price: 140,
    rarity: 'epic',
    category: 'glow',
    description: 'A blazing solar aura shines like a miniature sun.',
    colors: ['#facc15', '#f59e0b'],
    preview: {
      auraClass: 'from-yellow-300/55 via-amber-100/35 to-orange-200/45',
      glowStyle: '0 0 28px rgba(250,204,21,0.9), 0 0 60px rgba(245,158,11,0.4)',
      glowStyleDim: '0 0 12px rgba(250,204,21,0.25)',
      animDuration: '1.8s',
    }
  },

  // ─── BACKGROUND EFFECTS ───────────────────────────────────────────────────────
  {
    id: 'starfield-bg',
    name: 'Starfield',
    price: 150,
    rarity: 'legendary',
    category: 'background',
    description: 'A deep cosmic starfield background for your card.',
    colors: ['#1e1b4b', '#312e81'],
    preview: {
      bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
      darkBgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
      auraClass: 'from-indigo-400/25 via-purple-300/15 to-blue-400/25',
      glowStyle: '0 0 28px rgba(99,102,241,0.7), 0 0 60px rgba(99,102,241,0.25)',
      glowStyleDim: '0 0 12px rgba(99,102,241,0.25)',
      animDuration: '3s',
    }
  },
  {
    id: 'ocean-mist-bg',
    name: 'Ocean Mist',
    price: 140,
    rarity: 'epic',
    category: 'background',
    description: 'A serene ocean mist drifts across your card background.',
    colors: ['#bae6fd', '#7dd3fc'],
    preview: {
      bgClass: 'bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100',
      darkBgClass: 'bg-gradient-to-br from-sky-900 via-blue-900 to-cyan-900',
      auraClass: 'from-sky-200/45 via-blue-100/35 to-cyan-200/45',
      glowStyle: '0 0 22px rgba(125,211,252,0.7), 0 0 50px rgba(125,211,252,0.3)',
      glowStyleDim: '0 0 10px rgba(125,211,252,0.2)',
      animDuration: '3s',
    }
  },
  {
    id: 'twilight-bg',
    name: 'Twilight',
    price: 140,
    rarity: 'epic',
    category: 'background',
    description: 'A stunning twilight gradient sweeps across your card.',
    colors: ['#7c3aed', '#db2777', '#f97316'],
    preview: {
      bgClass: 'bg-gradient-to-br from-violet-100 via-pink-50 to-orange-100',
      darkBgClass: 'bg-gradient-to-br from-violet-900 via-pink-900 to-orange-900',
      auraClass: 'from-violet-300/40 via-pink-200/35 to-orange-200/40',
      glowStyle: '0 0 22px rgba(124,58,237,0.7), 0 0 50px rgba(219,39,119,0.3)',
      glowStyleDim: '0 0 10px rgba(124,58,237,0.2)',
      animDuration: '3s',
    }
  },
  {
    id: 'prism-light-bg',
    name: 'Prism Light',
    price: 175,
    rarity: 'legendary',
    category: 'background',
    description: 'A shimmering prism splits light into dazzling hues.',
    colors: ['#f43f5e', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'],
    preview: {
      bgClass: 'bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100',
      darkBgClass: 'bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900',
      auraClass: 'from-pink-200/45 via-yellow-100/30 to-blue-200/45',
      glowStyle: '0 0 28px rgba(168,85,247,0.7), 0 0 60px rgba(244,63,94,0.3)',
      glowStyleDim: '0 0 12px rgba(168,85,247,0.2)',
      animDuration: '2.5s',
      spinGradient: 'conic-gradient(from 0deg, #f43f5e, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6, #f43f5e)',
      spinSpeed: '6s',
    }
  },

  // ─── GOLDEN EFFECTS ───────────────────────────────────────────────────────────
  {
    id: 'golden-frame',
    name: 'Golden Frame',
    price: 175,
    rarity: 'legendary',
    category: 'golden',
    description: 'A majestic golden frame dripping with royalty and prestige.',
    colors: ['#f59e0b', '#d97706', '#fbbf24'],
    preview: {
      borderClass: 'border-4 border-amber-400',
      auraClass: 'from-amber-200/55 via-yellow-100/40 to-amber-300/55',
      glowStyle: '0 0 28px rgba(245,158,11,0.85), 0 0 60px rgba(251,191,36,0.4)',
      glowStyleDim: '0 0 12px rgba(245,158,11,0.3)',
      animDuration: '2.5s',
    }
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    price: 175,
    rarity: 'legendary',
    category: 'golden',
    description: 'A radiant solar flare erupts with the power of the sun itself.',
    colors: ['#f97316', '#facc15', '#fbbf24'],
    preview: {
      borderClass: 'border-4 border-yellow-500',
      auraClass: 'from-orange-300/55 via-yellow-200/40 to-amber-200/55',
      glowStyle: '0 0 35px rgba(249,115,22,0.9), 0 0 70px rgba(250,204,21,0.4)',
      glowStyleDim: '0 0 14px rgba(249,115,22,0.3)',
      animDuration: '1.5s',
      spinGradient: 'conic-gradient(from 0deg, #ef4444, #f97316, #facc15, #fbbf24, #f97316, #ef4444)',
      spinSpeed: '3s',
    }
  },

  // ─── FIRE EFFECTS ─────────────────────────────────────────────────────────────
  {
    id: 'inferno-aura',
    name: 'Inferno Aura',
    price: 175,
    rarity: 'legendary',
    category: 'fire',
    description: 'Blazing inferno energy erupts around your card in waves of flame.',
    colors: ['#ef4444', '#f97316', '#facc15'],
    preview: {
      borderClass: 'border-4 border-orange-500',
      auraClass: 'from-red-300/55 via-orange-200/45 to-yellow-200/40',
      glowStyle: '0 0 35px rgba(239,68,68,0.9), 0 0 70px rgba(249,115,22,0.4)',
      glowStyleDim: '0 0 14px rgba(239,68,68,0.3)',
      animDuration: '1.2s',
      spinGradient: 'conic-gradient(from 0deg, #dc2626, #f97316, #facc15, #f97316, #dc2626, #f97316, #facc15)',
      spinSpeed: '2.5s',
    }
  },
  {
    id: 'magma-core',
    name: 'Magma Core',
    price: 160,
    rarity: 'legendary',
    category: 'fire',
    description: 'Molten magma churns with volcanic power around your card.',
    colors: ['#dc2626', '#9a3412', '#f97316'],
    preview: {
      borderClass: 'border-4 border-red-600',
      bgClass: 'bg-gradient-to-br from-red-100 via-orange-50 to-yellow-100',
      darkBgClass: 'bg-gradient-to-br from-red-950 via-orange-950 to-yellow-950',
      auraClass: 'from-red-400/50 via-orange-300/35 to-red-300/45',
      glowStyle: '0 0 30px rgba(220,38,38,0.85), 0 0 65px rgba(249,115,22,0.35)',
      glowStyleDim: '0 0 12px rgba(220,38,38,0.3)',
      animDuration: '1.5s',
      spinGradient: 'conic-gradient(from 0deg, #7f1d1d, #dc2626, #f97316, #dc2626, #7f1d1d)',
      spinSpeed: '3s',
    }
  },

  // ─── LIGHTNING EFFECTS ────────────────────────────────────────────────────────
  {
    id: 'thunder-strike',
    name: 'Thunder Strike',
    price: 175,
    rarity: 'legendary',
    category: 'lightning',
    description: 'Crackling electric lightning storms around your card.',
    colors: ['#facc15', '#a3e635', '#38bdf8'],
    preview: {
      borderClass: 'border-4 border-yellow-400',
      auraClass: 'from-yellow-200/55 via-white/35 to-blue-200/45',
      glowStyle: '0 0 35px rgba(250,204,21,0.95), 0 0 70px rgba(163,230,53,0.4)',
      glowStyleDim: '0 0 8px rgba(250,204,21,0.2)',
      animDuration: '0.8s',
      spinGradient: 'conic-gradient(from 0deg, #facc15, #ffffff, #a3e635, #ffffff, #38bdf8, #ffffff, #facc15)',
      spinSpeed: '1.5s',
    }
  },
  {
    id: 'plasma-storm',
    name: 'Plasma Storm',
    price: 175,
    rarity: 'legendary',
    category: 'lightning',
    description: 'Superheated plasma swirls in electric storms across your card.',
    colors: ['#c084fc', '#818cf8', '#67e8f9'],
    preview: {
      borderClass: 'border-4 border-purple-400',
      auraClass: 'from-purple-200/55 via-blue-200/35 to-cyan-200/45',
      glowStyle: '0 0 35px rgba(192,132,252,0.9), 0 0 70px rgba(129,140,248,0.4)',
      glowStyleDim: '0 0 12px rgba(192,132,252,0.25)',
      animDuration: '1s',
      spinGradient: 'conic-gradient(from 0deg, #c084fc, #818cf8, #67e8f9, #818cf8, #c084fc)',
      spinSpeed: '2s',
    }
  },

  // ─── LEGENDARY SPECIALS ───────────────────────────────────────────────────────
  {
    id: 'diamond-edge',
    name: 'Diamond Edge',
    price: 200,
    rarity: 'legendary',
    category: 'special',
    description: 'Crystal-clear diamond edges dazzle with pure perfection.',
    colors: ['#e2e8f0', '#cbd5e1', '#94a3b8'],
    preview: {
      borderClass: 'border-4 border-slate-300',
      auraClass: 'from-white/65 via-slate-100/50 to-blue-100/45',
      glowStyle: '0 0 30px rgba(226,232,240,0.95), 0 0 65px rgba(148,163,184,0.5)',
      glowStyleDim: '0 0 12px rgba(226,232,240,0.35)',
      animDuration: '3s',
      spinGradient: 'conic-gradient(from 0deg, #e2e8f0, #94a3b8, #ffffff, #94a3b8, #e2e8f0)',
      spinSpeed: '8s',
    }
  },
  {
    id: 'rainbow-prism',
    name: 'Rainbow Prism',
    price: 200,
    rarity: 'legendary',
    category: 'special',
    description: 'A full rainbow prism cascades every colour across your card.',
    colors: ['#f43f5e', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'],
    preview: {
      borderClass: 'border-4 border-pink-400',
      auraClass: 'from-pink-200/45 via-yellow-100/35 to-blue-200/45',
      glowStyle: '0 0 35px rgba(244,63,94,0.7), 0 0 70px rgba(99,102,241,0.35)',
      glowStyleDim: '0 0 12px rgba(244,63,94,0.2)',
      animDuration: '2s',
      spinGradient: 'conic-gradient(from 0deg, #f43f5e, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6, #f43f5e)',
      spinSpeed: '4s',
    }
  },
  {
    id: 'void-aura',
    name: 'Void Aura',
    price: 175,
    rarity: 'legendary',
    category: 'special',
    description: 'An eerie void darkness swallows the space around your card.',
    colors: ['#0f172a', '#1e1b4b', '#312e81'],
    preview: {
      borderClass: 'border-4 border-indigo-900',
      bgClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
      darkBgClass: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950',
      auraClass: 'from-indigo-600/40 via-purple-900/25 to-slate-900/45',
      glowStyle: '0 0 30px rgba(79,70,229,0.8), 0 0 65px rgba(79,70,229,0.3)',
      glowStyleDim: '0 0 10px rgba(79,70,229,0.2)',
      animDuration: '3s',
      spinGradient: 'conic-gradient(from 0deg, #1e1b4b, #4f46e5, #312e81, #4f46e5, #1e1b4b)',
      spinSpeed: '7s',
    }
  },
  {
    id: 'crystal-ice',
    name: 'Crystal Ice',
    price: 175,
    rarity: 'legendary',
    category: 'special',
    description: 'Icy crystals encrust your card in frozen, shimmering beauty.',
    colors: ['#e0f2fe', '#bae6fd', '#7dd3fc'],
    preview: {
      borderClass: 'border-4 border-cyan-300',
      bgClass: 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100',
      darkBgClass: 'bg-gradient-to-br from-cyan-900 via-sky-900 to-blue-900',
      auraClass: 'from-cyan-200/55 via-sky-100/40 to-blue-200/50',
      glowStyle: '0 0 30px rgba(125,211,252,0.85), 0 0 65px rgba(56,189,248,0.35)',
      glowStyleDim: '0 0 12px rgba(125,211,252,0.25)',
      animDuration: '2.5s',
      spinGradient: 'conic-gradient(from 0deg, #e0f2fe, #38bdf8, #bae6fd, #7dd3fc, #e0f2fe)',
      spinSpeed: '8s',
    }
  },
  {
    id: 'shadow-realm',
    name: 'Shadow Realm',
    price: 150,
    rarity: 'legendary',
    category: 'special',
    description: 'Dark shadows swirl from another dimension around your card.',
    colors: ['#1f2937', '#374151', '#6b7280'],
    preview: {
      borderClass: 'border-4 border-gray-600',
      bgClass: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      darkBgClass: 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950',
      auraClass: 'from-gray-500/30 via-gray-700/20 to-gray-900/35',
      glowStyle: '0 0 25px rgba(107,114,128,0.7), 0 0 55px rgba(55,65,81,0.3)',
      glowStyleDim: '0 0 8px rgba(107,114,128,0.2)',
      animDuration: '3.5s',
    }
  },
];

export const CARD_EFFECT_MAP = Object.fromEntries(CARD_EFFECTS.map(effect => [effect.id, effect]));
