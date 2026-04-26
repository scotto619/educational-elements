// constants/cardEffects.js
// All purchasable & loot-able special effects for student avatar cards.
// Each effect has:
//   price         – coin cost to buy from the Effects shop (100-200)
//   rarity        – 'rare' | 'epic' | 'legendary'
//   category      – 'border' | 'glow' | 'fire' | 'lightning' | 'golden' | 'background' | 'special'
//   preview       – CSS classes applied to the card in StudentsTab
//     .borderClass  – overrides the default rarity border (optional)
//     .bgClass      – card background in light mode (optional)
//     .darkBgClass  – card background in dark mode (optional)
//     .auraClass    – blurred gradient layer behind content
//     .ringClass    – shadow/glow ring layer
//     .animationClass – Tailwind animation applied to the ring layer

export const CARD_EFFECTS = [

  // ────────────────────────────────────────────────────────────────
  // CLASSIC EFFECTS  (kept for backwards compatibility)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'frost-glow',
    name: 'Frost Glow',
    price: 100,
    rarity: 'rare',
    category: 'glow',
    description: 'An icy shimmer dances around your student card.',
    colors: ['#a5f3fc', '#38bdf8'],
    preview: {
      auraClass: 'from-cyan-100/60 via-white/40 to-blue-200/40',
      ringClass: 'shadow-[0_0_18px_rgba(56,189,248,0.55)]',
      animationClass: 'animate-pulse'
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
      ringClass: 'shadow-[0_0_22px_rgba(251,146,60,0.6)]',
      animationClass: 'animate-[spin_12s_linear_infinite]'
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
      ringClass: 'shadow-[0_0_26px_rgba(129,140,248,0.5)]',
      animationClass: 'animate-bounce'
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
      ringClass: 'shadow-[0_0_30px_rgba(168,85,247,0.55)]',
      animationClass: 'animate-[spin_16s_linear_infinite]'
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
      auraClass: 'from-cyan-200/60 via-white/40 to-fuchsia-200/60',
      ringClass: 'shadow-[0_0_24px_rgba(34,211,238,0.6)]',
      animationClass: 'animate-pulse'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // COLOURED BORDERS  (epic, 100–110 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-red-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(239,68,68,0.5)]',
      animationClass: ''
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
      auraClass: 'from-blue-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(59,130,246,0.5)]',
      animationClass: ''
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
      auraClass: 'from-emerald-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(16,185,129,0.5)]',
      animationClass: ''
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
      auraClass: 'from-violet-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(139,92,246,0.5)]',
      animationClass: ''
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
      auraClass: 'from-gray-400/20 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(55,65,81,0.7)]',
      animationClass: ''
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
      auraClass: 'from-rose-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(244,63,94,0.5)]',
      animationClass: ''
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
      auraClass: 'from-teal-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(20,184,166,0.5)]',
      animationClass: ''
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
      auraClass: 'from-orange-200/30 via-transparent to-transparent',
      ringClass: 'shadow-[0_0_18px_rgba(249,115,22,0.5)]',
      animationClass: ''
    }
  },

  // ────────────────────────────────────────────────────────────────
  // GLOW EFFECTS  (epic, 120–140 coins)
  // ────────────────────────────────────────────────────────────────
  {
    id: 'azure-glow',
    name: 'Azure Glow',
    price: 130,
    rarity: 'epic',
    category: 'glow',
    description: 'A pulsating azure aura brightens your card like a beacon.',
    colors: ['#38bdf8', '#0ea5e9'],
    preview: {
      auraClass: 'from-sky-300/60 via-sky-100/40 to-blue-200/50',
      ringClass: 'shadow-[0_0_28px_rgba(56,189,248,0.7)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-pink-300/60 via-fuchsia-100/40 to-rose-200/50',
      ringClass: 'shadow-[0_0_28px_rgba(236,72,153,0.7)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-green-300/60 via-emerald-100/40 to-teal-200/50',
      ringClass: 'shadow-[0_0_28px_rgba(34,197,94,0.7)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-yellow-300/60 via-amber-100/40 to-orange-200/50',
      ringClass: 'shadow-[0_0_30px_rgba(250,204,21,0.75)]',
      animationClass: 'animate-pulse'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // BACKGROUND EFFECTS  (epic / legendary, 140–175 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-indigo-400/20 via-purple-300/10 to-blue-400/20',
      ringClass: 'shadow-[0_0_25px_rgba(99,102,241,0.5)]',
      animationClass: ''
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
      auraClass: 'from-sky-200/50 via-blue-100/40 to-cyan-200/50',
      ringClass: 'shadow-[0_0_20px_rgba(125,211,252,0.5)]',
      animationClass: ''
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
      auraClass: 'from-violet-300/40 via-pink-200/40 to-orange-200/40',
      ringClass: 'shadow-[0_0_22px_rgba(124,58,237,0.5)]',
      animationClass: ''
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
      auraClass: 'from-pink-200/50 via-yellow-100/40 to-blue-200/50',
      ringClass: 'shadow-[0_0_28px_rgba(168,85,247,0.5)]',
      animationClass: 'animate-[spin_20s_linear_infinite]'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // GOLDEN EFFECTS  (legendary, 175 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-amber-200/60 via-yellow-100/50 to-amber-300/60',
      ringClass: 'shadow-[0_0_32px_rgba(245,158,11,0.75)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-orange-300/60 via-yellow-200/50 to-amber-200/60',
      ringClass: 'shadow-[0_0_45px_rgba(249,115,22,0.8)]',
      animationClass: 'animate-[spin_8s_linear_infinite]'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // FIRE EFFECTS  (legendary, 175 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-red-300/60 via-orange-200/50 to-yellow-200/40',
      ringClass: 'shadow-[0_0_35px_rgba(239,68,68,0.7)]',
      animationClass: 'animate-[spin_8s_linear_infinite]'
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
      auraClass: 'from-red-400/50 via-orange-300/40 to-red-300/50',
      ringClass: 'shadow-[0_0_40px_rgba(220,38,38,0.75)]',
      animationClass: 'animate-pulse'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // LIGHTNING EFFECTS  (legendary, 175 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-yellow-200/60 via-white/50 to-blue-200/50',
      ringClass: 'shadow-[0_0_40px_rgba(250,204,21,0.8)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-purple-200/60 via-blue-200/40 to-cyan-200/50',
      ringClass: 'shadow-[0_0_40px_rgba(192,132,252,0.75)]',
      animationClass: 'animate-[spin_6s_linear_infinite]'
    }
  },

  // ────────────────────────────────────────────────────────────────
  // LEGENDARY SPECIALS  (legendary, 175–200 coins)
  // ────────────────────────────────────────────────────────────────
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
      auraClass: 'from-white/70 via-slate-100/60 to-blue-100/50',
      ringClass: 'shadow-[0_0_35px_rgba(148,163,184,0.8)]',
      animationClass: 'animate-[spin_20s_linear_infinite]'
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
      auraClass: 'from-pink-200/50 via-yellow-100/40 to-blue-200/50',
      ringClass: 'shadow-[0_0_40px_rgba(244,63,94,0.6)]',
      animationClass: 'animate-[spin_10s_linear_infinite]'
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
      auraClass: 'from-indigo-600/40 via-purple-900/30 to-slate-900/50',
      ringClass: 'shadow-[0_0_35px_rgba(79,70,229,0.7)]',
      animationClass: 'animate-pulse'
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
      auraClass: 'from-cyan-200/60 via-sky-100/50 to-blue-200/50',
      ringClass: 'shadow-[0_0_35px_rgba(125,211,252,0.75)]',
      animationClass: 'animate-[spin_18s_linear_infinite]'
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
      auraClass: 'from-gray-500/30 via-gray-700/20 to-gray-900/40',
      ringClass: 'shadow-[0_0_30px_rgba(107,114,128,0.6)]',
      animationClass: 'animate-pulse'
    }
  },
];

export const CARD_EFFECT_MAP = Object.fromEntries(CARD_EFFECTS.map(effect => [effect.id, effect]));
