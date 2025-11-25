export const CARD_EFFECTS = [
  {
    id: 'frost-glow',
    name: 'Frost Glow',
    rarity: 'rare',
    description: 'An icy shimmer dances around your student card.',
    colors: ['#a5f3fc', '#38bdf8'],
    preview: {
      auraClass: 'bg-cyan-200/40 from-cyan-100/60 via-white/40 to-blue-200/40',
      ringClass: 'shadow-[0_0_18px_rgba(56,189,248,0.55)]',
      animationClass: 'animate-pulse'
    }
  },
  {
    id: 'ember-flare',
    name: 'Ember Flare',
    rarity: 'epic',
    description: 'Fiery sparks orbit your card with a warm glow.',
    colors: ['#fb923c', '#f97316', '#facc15'],
    preview: {
      auraClass: 'bg-amber-200/40 from-amber-200/50 via-orange-200/40 to-yellow-200/40',
      ringClass: 'shadow-[0_0_22px_rgba(251,146,60,0.6)]',
      animationClass: 'animate-[spin_12s_linear_infinite]'
    }
  },
  {
    id: 'starlit-rain',
    name: 'Starlit Rain',
    rarity: 'epic',
    description: 'Twinkling stars fall softly around your card.',
    colors: ['#c4b5fd', '#f5d0fe', '#e0f2fe'],
    preview: {
      auraClass: 'bg-gradient-to-br from-indigo-200/50 via-fuchsia-100/50 to-blue-200/50',
      ringClass: 'shadow-[0_0_26px_rgba(129,140,248,0.5)]',
      animationClass: 'animate-bounce'
    }
  },
  {
    id: 'aurora-veil',
    name: 'Aurora Veil',
    rarity: 'legendary',
    description: 'A silky aurora curtain wraps your student card.',
    colors: ['#a855f7', '#22d3ee', '#34d399'],
    preview: {
      auraClass: 'bg-gradient-to-r from-purple-300/50 via-cyan-200/50 to-emerald-200/50',
      ringClass: 'shadow-[0_0_30px_rgba(168,85,247,0.55)]',
      animationClass: 'animate-[spin_16s_linear_infinite]'
    }
  },
  {
    id: 'neon-wave',
    name: 'Neon Wave',
    rarity: 'rare',
    description: 'Electric lines pulse around your profile.',
    colors: ['#22d3ee', '#a855f7'],
    preview: {
      auraClass: 'bg-gradient-to-br from-cyan-200/60 via-white/40 to-fuchsia-200/60',
      ringClass: 'shadow-[0_0_24px_rgba(34,211,238,0.6)]',
      animationClass: 'animate-pulse'
    }
  }
];

export const CARD_EFFECT_MAP = Object.fromEntries(CARD_EFFECTS.map(effect => [effect.id, effect]));
