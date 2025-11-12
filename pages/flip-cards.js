import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const STORAGE_KEY = 'flip-card-sets-v1';

const themePalettes = {
  aurora: {
    name: 'Aurora Sky',
    frontGradient: ['#2563eb', '#7c3aed'],
    backGradient: ['#9333ea', '#db2777'],
    accent: '#22d3ee',
    glow: 'rgba(56, 189, 248, 0.45)',
    text: '#f8fafc',
    ring: 'rgba(14, 165, 233, 0.35)'
  },
  sunrise: {
    name: 'Sunrise Burst',
    frontGradient: ['#f97316', '#ef4444'],
    backGradient: ['#ec4899', '#a855f7'],
    accent: '#fde68a',
    glow: 'rgba(251, 191, 36, 0.45)',
    text: '#fff7ed',
    ring: 'rgba(251, 146, 60, 0.35)'
  },
  rainforest: {
    name: 'Rainforest Bloom',
    frontGradient: ['#22c55e', '#0ea5e9'],
    backGradient: ['#14b8a6', '#6366f1'],
    accent: '#bbf7d0',
    glow: 'rgba(45, 212, 191, 0.45)',
    text: '#f0fdf4',
    ring: 'rgba(74, 222, 128, 0.35)'
  },
  nebula: {
    name: 'Cosmic Nebula',
    frontGradient: ['#7c3aed', '#312e81'],
    backGradient: ['#1f2937', '#0f172a'],
    accent: '#f472b6',
    glow: 'rgba(168, 85, 247, 0.45)',
    text: '#fdf4ff',
    ring: 'rgba(147, 51, 234, 0.35)'
  }
};

const cloneTheme = (paletteKey = 'aurora') => {
  const palette = themePalettes[paletteKey] ?? themePalettes.aurora;
  return {
    id: paletteKey,
    name: palette.name,
    frontGradient: [...palette.frontGradient],
    backGradient: [...palette.backGradient],
    accent: palette.accent,
    glow: palette.glow,
    text: palette.text,
    ring: palette.ring
  };
};

const defaultCardSets = [
  {
    id: 'times-tables',
    title: 'Times Tables Lightning Round',
    topic: 'Math Mastery',
    description:
      'Rapid-fire multiplication facts to energize warm-ups and sharpen number sense in minutes.',
    theme: cloneTheme('aurora'),
    isDefault: true,
    cards: [
      { front: '7 × 8', back: '56' },
      { front: '6 × 9', back: '54' },
      { front: '12 × 12', back: '144' },
      { front: '8 × 7', back: '56' },
      { front: '11 × 6', back: '66' },
      { front: '9 × 9', back: '81' }
    ]
  },
  {
    id: 'world-history',
    title: 'World History Spotlight',
    topic: 'History & Social Studies',
    description:
      'Key moments and voices from around the world that spark curiosity and classroom discussion.',
    theme: cloneTheme('sunrise'),
    isDefault: true,
    cards: [
      {
        front: 'What year did the Berlin Wall fall?',
        back: '1989 — A pivotal moment that symbolized the end of the Cold War.'
      },
      {
        front: 'Who was Mansa Musa?',
        back: 'The emperor of Mali (1312-1337) famed for his wealth, scholarship, and epic pilgrimage to Mecca.'
      },
      {
        front: 'Why is the Magna Carta significant?',
        back: 'Signed in 1215, it limited the English monarchy and laid groundwork for constitutional law.'
      },
      {
        front: 'What sparked the Boston Tea Party?',
        back: 'Colonists protesting taxation without representation dumped tea into Boston Harbor in 1773.'
      }
    ]
  },
  {
    id: 'science-sparks',
    title: 'Science Sparks',
    topic: 'STEM Explorations',
    description:
      'High-energy science prompts that connect concepts to real-world wonders and experiments.',
    theme: cloneTheme('rainforest'),
    isDefault: true,
    cards: [
      {
        front: 'What planet has the most moons?',
        back: 'Saturn — astronomers have confirmed over 80 moons orbiting the ringed planet.'
      },
      {
        front: 'Define photosynthesis.',
        back: 'The process plants use to convert sunlight, water, and carbon dioxide into glucose and oxygen.'
      },
      {
        front: 'Why do we see lightning before thunder?',
        back: 'Light travels faster than sound, so the flash reaches our eyes before the thunder reaches our ears.'
      },
      {
        front: 'What is a hypothesis?',
        back: 'A testable prediction that guides scientific investigation and experimentation.'
      }
    ]
  },
  {
    id: 'wellbeing-wisdom',
    title: 'Wellbeing Wisdom',
    topic: 'SEL & Mindfulness',
    description:
      'Mindful prompts and actionable strategies to build resilient, empathetic classroom communities.',
    theme: cloneTheme('nebula'),
    isDefault: true,
    cards: [
      {
        front: 'Name one strategy to reset when you feel overwhelmed.',
        back: 'Take three slow belly breaths while counting to five on each inhale and exhale.'
      },
      {
        front: 'How can you show empathy today?',
        back: 'Listen with your whole body and repeat back what you heard before sharing your perspective.'
      },
      {
        front: 'What is a growth mindset?',
        back: 'Believing abilities improve through effort, practice, and feedback — mistakes are data, not defeat.'
      },
      {
        front: 'Share one affirmation for the class.',
        back: '“We are capable learners who support one another and celebrate every win.”'
      }
    ]
  }
];

const paletteOptions = Object.entries(themePalettes).map(([id, palette]) => ({
  id,
  name: palette.name,
  frontGradient: palette.frontGradient,
  backGradient: palette.backGradient
}));

const getCardProgress = (cards = [], index = 0) => {
  if (!cards.length) return 0;
  return Math.round(((index + 1) / cards.length) * 100);
};

const CardBadge = ({ children, color }) => (
  <span
    className="text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-white/10 border border-white/20"
    style={{ color: color ?? '#f1f5f9' }}
  >
    {children}
  </span>
);

const TopicBadge = ({ topic, accent }) => (
  <div
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs uppercase tracking-wider font-semibold"
    style={{
      borderColor: accent ?? 'rgba(255,255,255,0.4)',
      color: accent ?? '#e2e8f0',
      background: 'rgba(255,255,255,0.08)'
    }}
  >
    <span className="text-base">✨</span>
    {topic}
  </div>
);

const CreateButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-purple-500/20 via-fuchsia-500/20 to-sky-500/20 px-6 py-4 text-base font-semibold text-white shadow-xl transition-all hover:-translate-y-1 hover:border-white/40 hover:shadow-purple-500/30"
  >
    <span className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-sky-500/40 opacity-0 transition-opacity group-hover:opacity-100" />
    <span className="relative z-10 flex items-center gap-3">
      <SparkIcon className="h-5 w-5" />
      Build a New Card Set
    </span>
  </button>
);

const SparkIcon = ({ className = 'h-6 w-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z"
      fill="currentColor"
      opacity="0.85"
    />
  </svg>
);

const BackIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 19l-7-7 7-7" />
  </svg>
);

const ArrowIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 5l7 7-7 7" />
  </svg>
);

const ShuffleIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17 3l3 3-3 3M4 6h7l2 3m-2 3l-2 3H4m13 0l3 3-3 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ResetIcon = ({ className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-7-5 8 8 0 00-6 3M4 15a8 8 0 007 5 8 8 0 006-3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardSetCreator = ({ onCancel, onCreate }) => {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState([
    { id: 1, front: '', back: '' },
    { id: 2, front: '', back: '' }
  ]);
  const [selectedPaletteId, setSelectedPaletteId] = useState('aurora');
  const [error, setError] = useState('');

  const handleCardChange = (cardId, side, value) => {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [side]: value } : card)));
  };

  const handleAddCard = () => {
    setCards((prev) => [...prev, { id: Date.now(), front: '', back: '' }]);
  };

  const handleRemoveCard = (cardId) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedTopic = topic.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError('Give your card set a motivating title.');
      return;
    }

    const preparedCards = cards
      .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
      .filter((card) => card.front && card.back);

    if (!preparedCards.length) {
      setError('Add at least one card with both sides completed.');
      return;
    }

    const palette = cloneTheme(selectedPaletteId);

    onCreate({
      id: `custom-${Date.now()}`,
      title: trimmedTitle,
      topic: trimmedTopic || 'Custom Study Focus',
      description:
        trimmedDescription || 'A personalized Flip Cards deck designed for your class goals.',
      cards: preparedCards,
      theme: palette,
      isDefault: false,
      createdAt: new Date().toISOString()
    });

    setTitle('');
    setTopic('');
    setDescription('');
    setCards([
      { id: 1, front: '', back: '' },
      { id: 2, front: '', back: '' }
    ]);
    setSelectedPaletteId('aurora');
  };

  return (
    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Design a Custom Deck</h3>
          <p className="mt-1 text-sm text-slate-200/70">
            Craft your own study prompts, vocabulary sets, or quick checks for understanding.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-slate-200/80 transition hover:text-white"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-slate-100/90">
            Deck title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
              placeholder="e.g. Geometry Formulas Showdown"
            />
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-100/90">
            Topic or subject
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="mt-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
              placeholder="e.g. Civil Rights Leaders"
            />
          </label>
        </div>

        <label className="flex flex-col text-sm font-medium text-slate-100/90">
          Description for your class
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
            placeholder="Share how students should use this deck or what mastery looks like."
          />
        </label>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-200/80">Pick a vibe</span>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {paletteOptions.map((palette) => {
              const isSelected = palette.id === selectedPaletteId;
              return (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setSelectedPaletteId(palette.id)}
                  className={`group relative flex h-24 flex-col justify-between overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all ${
                    isSelected ? 'border-white/80 shadow-2xl ring-2 ring-white/60' : 'border-white/20 hover:border-white/50'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${palette.frontGradient[0]}, ${palette.backGradient[1]})`
                  }}
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {palette.name}
                  </span>
                  <span className="text-sm font-bold text-white">{isSelected ? 'Selected ✨' : 'Choose theme'}</span>
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-30" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-200/80">
              Flip cards
            </span>
            <button
              type="button"
              onClick={handleAddCard}
              className="text-sm font-semibold text-slate-100 transition hover:text-white"
            >
              + Add another card
            </button>
          </div>

          <div className="space-y-3">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg transition hover:border-white/30"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-200/70">
                  Card {index + 1}
                  {cards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                      className="text-slate-200/80 transition hover:text-white"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col text-sm font-medium text-slate-100/90">
                    Front — prompt
                    <textarea
                      rows={2}
                      value={card.front}
                      onChange={(event) => handleCardChange(card.id, 'front', event.target.value)}
                      className="mt-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
                      placeholder="Question, concept, or cue"
                    />
                  </label>
                  <label className="flex flex-col text-sm font-medium text-slate-100/90">
                    Back — reveal
                    <textarea
                      rows={2}
                      value={card.back}
                      onChange={(event) => handleCardChange(card.id, 'back', event.target.value)}
                      className="mt-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none"
                      placeholder="Answer, explanation, or extension"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-rose-200">{error}</p>}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-xl transition-all hover:border-white/70 hover:bg-white/20"
          >
            <SparkIcon className="h-5 w-5" />
            Save deck to library
          </button>
          <p className="text-xs text-slate-200/60">
            Saved decks live in your browser. Revisit anytime to keep the learning momentum going.
          </p>
        </div>
      </form>
    </div>
  );
};

export default function FlipCardsPage() {
  const [cardSets, setCardSets] = useState(defaultCardSets);
  const [activeSetId, setActiveSetId] = useState(defaultCardSets[0]?.id ?? null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [cardOrderMap, setCardOrderMap] = useState({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedRaw = window.localStorage.getItem(STORAGE_KEY);
      if (!storedRaw) {
        setHydrated(true);
        return;
      }

      const storedSets = JSON.parse(storedRaw);
      if (!Array.isArray(storedSets)) {
        setHydrated(true);
        return;
      }

      const storedMap = new Map(storedSets.map((set) => [set.id, set]));
      const mergedDefaults = defaultCardSets.map((defaultSet) => {
        const storedMatch = storedMap.get(defaultSet.id);
        if (!storedMatch) return defaultSet;
        return {
          ...defaultSet,
          ...storedMatch,
          theme: cloneTheme(defaultSet.theme?.id ?? defaultSet.id ?? 'aurora'),
          isDefault: true
        };
      });

      const customSets = storedSets
        .filter((set) => !defaultCardSets.some((defaultSet) => defaultSet.id === set.id))
        .map((set) => ({
          ...set,
          theme: set.theme ? { ...set.theme, frontGradient: [...(set.theme.frontGradient ?? [])], backGradient: [...(set.theme.backGradient ?? [])] } : cloneTheme('aurora'),
          isDefault: Boolean(set.isDefault) && !set.id.startsWith('custom-') ? set.isDefault : false
        }));

      const merged = [...mergedDefaults, ...customSets];
      setCardSets(merged.length ? merged : defaultCardSets);
      setActiveSetId((merged[0] ?? defaultCardSets[0])?.id ?? null);
    } catch (error) {
      console.error('Failed to load Flip Cards from storage', error);
      setCardSets(defaultCardSets);
      setActiveSetId(defaultCardSets[0]?.id ?? null);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cardSets));
    } catch (error) {
      console.error('Failed to save Flip Cards to storage', error);
    }
  }, [cardSets, hydrated]);

  useEffect(() => {
    if (!cardSets.length) return;
    if (!cardSets.some((set) => set.id === activeSetId)) {
      const fallback = cardSets[0];
      setActiveSetId(fallback?.id ?? null);
      setActiveCardIndex(0);
      setIsFlipped(false);
    }
  }, [cardSets, activeSetId]);

  const activeSet = useMemo(
    () => cardSets.find((set) => set.id === activeSetId) ?? cardSets[0],
    [cardSets, activeSetId]
  );

  const orderedCards = useMemo(() => {
    if (!activeSet) return [];
    const order = cardOrderMap[activeSet.id];
    if (!order) return activeSet.cards;
    return order.map((index) => activeSet.cards[index]).filter(Boolean);
  }, [activeSet, cardOrderMap]);

  useEffect(() => {
    setActiveCardIndex(0);
    setIsFlipped(false);
  }, [activeSet?.id]);

  const handleSelectSet = (setId) => {
    setActiveSetId(setId);
  };

  const handleNextCard = () => {
    if (!orderedCards.length) return;
    setActiveCardIndex((prev) => (prev + 1) % orderedCards.length);
    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    if (!orderedCards.length) return;
    setActiveCardIndex((prev) => (prev - 1 + orderedCards.length) % orderedCards.length);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const handleShuffle = () => {
    if (!activeSet || !activeSet.cards?.length) return;
    setCardOrderMap((prev) => {
      const newOrder = Array.from({ length: activeSet.cards.length }, (_, index) => index).sort(
        () => Math.random() - 0.5
      );
      return { ...prev, [activeSet.id]: newOrder };
    });
    setActiveCardIndex(0);
    setIsFlipped(false);
  };

  const handleCreateSet = (newSet) => {
    setCardSets((prev) => [...prev, newSet]);
    setActiveSetId(newSet.id);
    setActiveCardIndex(0);
    setIsFlipped(false);
    setShowCreator(false);
  };

  const progress = getCardProgress(orderedCards, activeCardIndex);
  const activeCard = orderedCards[activeCardIndex] ?? null;
  const accentColor = activeSet?.theme?.accent ?? '#38bdf8';
  const cardGlow = activeSet?.theme?.glow ?? 'rgba(56, 189, 248, 0.4)';
  const frontGradient = activeSet?.theme?.frontGradient;
  const backGradient = activeSet?.theme?.backGradient;
  const textColor = activeSet?.theme?.text ?? '#f8fafc';

  return (
    <>
      <Head>
        <title>Flip Cards | Immersive Study Decks for Curious Classrooms</title>
        <meta
          name="description"
          content="Flip Cards transforms study prompts into full-screen, flippable cards with vibrant themes. Launch ready-made decks or craft your own in seconds."
        />
      </Head>
      <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-500/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-sky-500/30 blur-3xl" />
          <div className="absolute bottom-12 right-12 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-lg">
                  🎴
                </span>
                Flip Cards Studio
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ignite recall with immersive, full-screen study decks.
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-200/80 sm:text-lg">
                Launch dazzling, responsive flashcards that flip with a tap. Use curated decks for math, history, science, and SEL or build
                your own themed sets in moments — everything saves automatically in your browser.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200/70">
                <CardBadge color={accentColor}>Fullscreen &amp; touch-friendly</CardBadge>
                <CardBadge color={accentColor}>Auto-saves locally</CardBadge>
                <CardBadge color={accentColor}>Ready-to-teach decks</CardBadge>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-200/80">
              <Link
                href="/"
                className="inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                <BackIcon className="h-4 w-4" /> Back to site
              </Link>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-200/60">Featured decks</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {defaultCardSets.map((set) => (
                    <li key={set.id} className="flex items-center gap-3 text-slate-200/80">
                      <span className="text-base">•</span>
                      <span>
                        <span className="font-semibold text-white">{set.title}</span>
                        <span className="ml-1 text-slate-300/70">{set.topic}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <main className="mt-12 grid flex-1 gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="flex flex-col gap-6">
              <CreateButton onClick={() => setShowCreator(true)} />

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-white/10 px-6 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-200/70">Deck Library</p>
                </div>
                <div className="max-h-[420px] space-y-2 overflow-y-auto px-3 py-4">
                  {cardSets.map((set) => {
                    const isActive = set.id === activeSet?.id;
                    const setProgress =
                      activeSet?.id === set.id ? getCardProgress(orderedCards, activeCardIndex) : 0;
                    return (
                      <button
                        key={set.id}
                        onClick={() => handleSelectSet(set.id)}
                        className={`group relative flex w-full flex-col gap-2 rounded-2xl border px-4 py-4 text-left transition-all ${
                          isActive
                            ? 'border-white/70 bg-white/15 shadow-xl'
                            : 'border-white/10 bg-white/5 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{set.title}</span>
                          {set.isDefault ? (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-200/70">Featured</span>
                          ) : (
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-200/70">Saved</span>
                          )}
                        </span>
                        <span className="text-xs text-slate-200/70">{set.topic}</span>
                        <p className="text-xs text-slate-200/60">{set.description}</p>
                        {isActive && orderedCards.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-200/70">
                              <span>Progress</span>
                              <span>{setProgress}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${setProgress}%`, background: accentColor }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {showCreator && <CardSetCreator onCancel={() => setShowCreator(false)} onCreate={handleCreateSet} />}
            </aside>

            <section className="flex flex-col gap-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <TopicBadge topic={activeSet?.topic ?? 'Flip Cards Deck'} accent={accentColor} />
                    <h2 className="text-2xl font-bold text-white sm:text-3xl">{activeSet?.title}</h2>
                    <p className="max-w-2xl text-sm text-slate-200/75">{activeSet?.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200/70">
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold uppercase tracking-wide">
                        {activeSet?.cards?.length ?? 0} Cards
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold uppercase tracking-wide">
                        {activeCardIndex + 1} / {orderedCards.length || 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button
                      type="button"
                      onClick={handleShuffle}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/50 hover:bg-white/15"
                    >
                      <ShuffleIcon className="h-4 w-4" />
                      Shuffle deck
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/50 hover:bg-white/15"
                    >
                      <ResetIcon className="h-4 w-4" />
                      Reset card
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative flex flex-1 flex-col">
                <div className="relative mx-auto flex h-[420px] w-full max-w-3xl flex-1 items-center justify-center sm:h-[520px]">
                  <div
                    className="absolute inset-0 rounded-[36px] opacity-70 blur-3xl"
                    style={{
                      background: `radial-gradient(circle at top, ${accentColor}22, transparent 70%)`
                    }}
                  />
                  <div
                    className="relative h-full w-full rounded-[36px]"
                    style={{ perspective: '2000px' }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setIsFlipped((prev) => !prev)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setIsFlipped((prev) => !prev);
                        }
                      }}
                      className="relative h-full w-full cursor-pointer select-none"
                      style={{
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.6s ease',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-[32px] border border-white/20 p-10 shadow-[0_25px_70px_rgba(15,23,42,0.45)]"
                        style={{
                          backfaceVisibility: 'hidden',
                          color: textColor,
                          background: frontGradient
                            ? `linear-gradient(135deg, ${frontGradient[0]}, ${frontGradient[1]})`
                            : 'linear-gradient(135deg, #2563eb, #7c3aed)',
                          boxShadow: `0 25px 70px ${cardGlow}`
                        }}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
                            prompt
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            <p className="text-balance text-2xl font-bold leading-snug sm:text-3xl">
                              {activeCard?.front ?? 'Add cards to bring this deck to life!'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm opacity-80">
                            <span>Tap to reveal the answer</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                              Front
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 rounded-[32px] border border-white/20 p-10 shadow-[0_25px_70px_rgba(15,23,42,0.45)]"
                        style={{
                          backfaceVisibility: 'hidden',
                          color: textColor,
                          background: backGradient
                            ? `linear-gradient(135deg, ${backGradient[0]}, ${backGradient[1]})`
                            : 'linear-gradient(135deg, #9333ea, #db2777)',
                          boxShadow: `0 25px 70px ${cardGlow}`,
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
                            reveal
                          </div>
                          <div className="flex-1 overflow-y-auto">
                            <p className="text-balance text-2xl font-semibold leading-snug sm:text-3xl">
                              {activeCard?.back ?? 'Create a response to unlock the back of this card.'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm opacity-80">
                            <span>Tap to flip back</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                              Back
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-200/70">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5">
                      {progress}%
                    </span>
                    Study streak in motion
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handlePreviousCard}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/20"
                    >
                      <BackIcon className="h-5 w-5" /> Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFlipped((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
                    >
                      Flip card
                    </button>
                    <button
                      type="button"
                      onClick={handleNextCard}
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/20"
                    >
                      Next <ArrowIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
