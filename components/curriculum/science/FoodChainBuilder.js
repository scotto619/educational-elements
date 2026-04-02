// components/curriculum/science/FoodChainBuilder.js
// Interactive Food Chain Builder for primary science (ages 6–12)
import React, { useState, useCallback } from 'react';

// ─── Ecosystem & Organism Data ────────────────────────────────────────────────

const ECOSYSTEMS = [
  {
    id: 'grassland',
    name: 'Grassland',
    icon: '🌾',
    colour: 'from-green-500 to-emerald-600',
    lightBg: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    bg: 'bg-gradient-to-br from-green-100 to-emerald-100',
    organisms: [
      { id: 'sun',      name: 'Sun',        icon: '☀️', role: 'energy',      level: 0, fact: 'The Sun provides the energy that powers all food chains.' },
      { id: 'grass',    name: 'Grass',      icon: '🌿', role: 'producer',    level: 1, fact: 'Grass uses sunlight to make food through photosynthesis.' },
      { id: 'grasshopper', name: 'Grasshopper', icon: '🦗', role: 'primary',  level: 2, fact: 'Grasshoppers eat grass and are a primary consumer (herbivore).' },
      { id: 'frog',     name: 'Frog',       icon: '🐸', role: 'secondary',   level: 3, fact: 'Frogs eat insects like grasshoppers and are secondary consumers.' },
      { id: 'snake',    name: 'Snake',      icon: '🐍', role: 'tertiary',    level: 4, fact: 'Snakes eat frogs and are tertiary consumers (carnivores).' },
      { id: 'eagle',    name: 'Eagle',      icon: '🦅', role: 'apex',        level: 5, fact: 'Eagles are apex predators — nothing hunts them in this chain.' },
      { id: 'mushroom', name: 'Mushroom',   icon: '🍄', role: 'decomposer',  level: 6, fact: 'Mushrooms are decomposers — they break down dead things and return nutrients to the soil.' },
    ],
    chains: [
      { name: 'Classic Grassland Chain', ids: ['sun', 'grass', 'grasshopper', 'frog', 'snake', 'eagle'] },
      { name: 'Short Chain', ids: ['sun', 'grass', 'grasshopper', 'eagle'] },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    colour: 'from-blue-500 to-cyan-600',
    lightBg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-200',
    bg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    organisms: [
      { id: 'sun',        name: 'Sun',           icon: '☀️', role: 'energy',     level: 0, fact: 'Sunlight penetrates the ocean surface and powers photosynthesis.' },
      { id: 'phyto',      name: 'Phytoplankton', icon: '🦠', role: 'producer',   level: 1, fact: 'Microscopic phytoplankton make half the world\'s oxygen through photosynthesis.' },
      { id: 'zooplankton',name: 'Zooplankton',   icon: '🔬', role: 'primary',    level: 2, fact: 'Zooplankton are tiny animals that eat phytoplankton.' },
      { id: 'fish',       name: 'Small Fish',    icon: '🐟', role: 'secondary',  level: 3, fact: 'Small fish like sardines eat zooplankton and are secondary consumers.' },
      { id: 'tuna',       name: 'Tuna',          icon: '🐠', role: 'tertiary',   level: 4, fact: 'Tuna are powerful swimmers that hunt smaller fish.' },
      { id: 'shark',      name: 'Shark',         icon: '🦈', role: 'apex',       level: 5, fact: 'Sharks are apex predators that keep ocean populations balanced.' },
      { id: 'bacteria',   name: 'Bacteria',      icon: '🧫', role: 'decomposer', level: 6, fact: 'Ocean bacteria decompose dead organisms, recycling nutrients back into the water.' },
    ],
    chains: [
      { name: 'Classic Ocean Chain', ids: ['sun', 'phyto', 'zooplankton', 'fish', 'tuna', 'shark'] },
      { name: 'Short Chain', ids: ['sun', 'phyto', 'fish', 'shark'] },
    ],
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: '🌲',
    colour: 'from-emerald-600 to-teal-700',
    lightBg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-200',
    bg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
    organisms: [
      { id: 'sun',    name: 'Sun',        icon: '☀️', role: 'energy',     level: 0, fact: 'Sunlight powers photosynthesis in forest plants.' },
      { id: 'oak',    name: 'Oak Tree',   icon: '🌳', role: 'producer',   level: 1, fact: 'Oak trees produce acorns and leaves that feed many animals.' },
      { id: 'squirrel', name: 'Squirrel', icon: '🐿️', role: 'primary',   level: 2, fact: 'Squirrels eat acorns and nuts — they are herbivores (primary consumers).' },
      { id: 'fox',    name: 'Fox',        icon: '🦊', role: 'secondary',  level: 3, fact: 'Foxes are omnivores that eat squirrels and other small animals.' },
      { id: 'wolf',   name: 'Wolf',       icon: '🐺', role: 'tertiary',   level: 4, fact: 'Wolves are apex predators that hunt foxes and deer.' },
      { id: 'owl',    name: 'Owl',        icon: '🦉', role: 'apex',       level: 5, fact: 'Owls hunt at night and eat mice, squirrels, and other small creatures.' },
      { id: 'worm',   name: 'Earthworm',  icon: '🪱', role: 'decomposer', level: 6, fact: 'Earthworms decompose leaf litter and enrich forest soil.' },
    ],
    chains: [
      { name: 'Classic Forest Chain', ids: ['sun', 'oak', 'squirrel', 'fox', 'wolf'] },
      { name: 'Night Chain', ids: ['sun', 'oak', 'squirrel', 'owl'] },
    ],
  },
  {
    id: 'desert',
    name: 'Desert',
    icon: '🏜️',
    colour: 'from-amber-500 to-orange-600',
    lightBg: 'from-amber-50 to-orange-50',
    border: 'border-amber-200',
    bg: 'bg-gradient-to-br from-amber-100 to-orange-100',
    organisms: [
      { id: 'sun',     name: 'Sun',        icon: '☀️', role: 'energy',     level: 0, fact: 'The desert sun provides intense heat and light energy.' },
      { id: 'cactus',  name: 'Cactus',     icon: '🌵', role: 'producer',   level: 1, fact: 'Cacti store water and use sunlight to produce food in harsh conditions.' },
      { id: 'mouse',   name: 'Desert Mouse', icon: '🐭', role: 'primary',  level: 2, fact: 'Desert mice eat cactus seeds and fruits to survive.' },
      { id: 'lizard',  name: 'Lizard',     icon: '🦎', role: 'secondary',  level: 3, fact: 'Lizards are reptiles that eat insects and small rodents.' },
      { id: 'hawk',    name: 'Hawk',       icon: '🦅', role: 'tertiary',   level: 4, fact: 'Hawks are skilled hunters that soar on desert thermals.' },
      { id: 'scorpion',name: 'Scorpion',   icon: '🦂', role: 'apex',       level: 5, fact: 'Scorpions are venomous predators that eat insects and small lizards.' },
      { id: 'beetle',  name: 'Dung Beetle',icon: '🪲', role: 'decomposer', level: 6, fact: 'Dung beetles recycle animal waste and organic material in the desert.' },
    ],
    chains: [
      { name: 'Classic Desert Chain', ids: ['sun', 'cactus', 'mouse', 'lizard', 'hawk'] },
      { name: 'Short Chain', ids: ['sun', 'cactus', 'mouse', 'hawk'] },
    ],
  },
];

const ROLE_META = {
  energy:    { label: 'Energy Source', colour: 'bg-yellow-100 text-yellow-800 border-yellow-300', arrow: false },
  producer:  { label: 'Producer',      colour: 'bg-green-100 text-green-800 border-green-300',   arrow: true  },
  primary:   { label: 'Primary Consumer (Herbivore)', colour: 'bg-lime-100 text-lime-800 border-lime-300', arrow: true },
  secondary: { label: 'Secondary Consumer',           colour: 'bg-orange-100 text-orange-800 border-orange-300', arrow: true },
  tertiary:  { label: 'Tertiary Consumer',            colour: 'bg-red-100 text-red-800 border-red-300', arrow: true },
  apex:      { label: 'Apex Predator',                colour: 'bg-purple-100 text-purple-800 border-purple-300', arrow: true },
  decomposer:{ label: 'Decomposer',                   colour: 'bg-stone-100 text-stone-700 border-stone-300', arrow: false },
};

// ─── Quiz Questions ───────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: 'What is a producer in a food chain?',
    options: ['An animal that eats plants', 'A plant that makes its own food', 'An animal that eats other animals', 'A decomposer'],
    answer: 1,
    explanation: 'Producers (like plants) make their own food using sunlight through photosynthesis.',
  },
  {
    q: 'What do we call an animal that eats ONLY plants?',
    options: ['Carnivore', 'Omnivore', 'Herbivore', 'Decomposer'],
    answer: 2,
    explanation: 'A herbivore eats only plants. It is usually a primary consumer in a food chain.',
  },
  {
    q: 'In a food chain, which direction does energy flow?',
    options: ['From consumers to producers', 'From decomposers to the sun', 'From the sun through producers to consumers', 'From apex predators to plants'],
    answer: 2,
    explanation: 'Energy flows from the Sun → producers → consumers. Each arrow in a food chain shows where energy goes.',
  },
  {
    q: 'What is the role of decomposers in a food chain?',
    options: ['They hunt other animals', 'They produce their own food', 'They break down dead organisms and return nutrients to the soil', 'They eat only plants'],
    answer: 2,
    explanation: 'Decomposers like fungi and bacteria recycle dead material, returning vital nutrients to the soil.',
  },
  {
    q: 'Which of these is an example of a food chain?',
    options: ['Eagle → Snake → Frog → Grass', 'Grass → Grasshopper → Frog → Snake', 'Frog → Grasshopper → Grass → Sun', 'Sun → Snake → Frog → Grass'],
    answer: 1,
    explanation: 'Energy flows from grass (producer) → grasshopper → frog → snake. The arrow means "is eaten by".',
  },
  {
    q: 'What is an apex predator?',
    options: ['An animal at the bottom of the food chain', 'A type of plant', 'An animal at the top with no natural predators', 'A decomposer'],
    answer: 2,
    explanation: 'An apex predator sits at the top of the food chain and is not hunted by any other animal in that ecosystem.',
  },
  {
    q: 'If all the frogs disappeared from a grassland, what would most likely happen?',
    options: ['Snake populations would grow', 'Grasshopper numbers would increase rapidly', 'More grass would grow', 'Grasshopper numbers would decrease'],
    answer: 1,
    explanation: 'Without frogs eating them, grasshopper populations would grow rapidly — showing how food chains are interconnected.',
  },
  {
    q: 'What is a carnivore?',
    options: ['An animal that eats only plants', 'An animal that eats both plants and animals', 'An animal that eats only other animals', 'A plant that traps insects'],
    answer: 2,
    explanation: 'A carnivore eats only other animals. Wolves, sharks, and eagles are examples of carnivores.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const FoodChainBuilder = ({ showToast = () => {} }) => {
  const [view, setView] = useState('ecosystems'); // 'ecosystems' | 'build' | 'quiz' | 'learn'
  const [selectedEco, setSelectedEco] = useState(null);
  const [chain, setChain] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [factCard, setFactCard] = useState(null);

  // Quiz state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);

  // ── Chain building helpers ──────────────────────────────────────────────────
  const toggleOrganism = useCallback((org) => {
    setFeedback(null);
    setChain(prev => {
      const already = prev.find(o => o.id === org.id);
      if (already) return prev.filter(o => o.id !== org.id);
      return [...prev, org];
    });
  }, []);

  const checkChain = useCallback(() => {
    if (chain.length < 2) {
      setFeedback({ ok: false, msg: 'Add at least 2 organisms to your chain!' });
      return;
    }
    // Sort by level to see if chain is in correct order
    const sorted = [...chain].sort((a, b) => a.level - b.level);
    const levels = sorted.map(o => o.level);
    // Levels must be consecutive starting at 0 or 1 (sun optional)
    const hasGap = levels.some((l, i) => i > 0 && l - levels[i - 1] > 1);
    // Must start with energy (0) or producer (1)
    const startsOk = levels[0] === 0 || levels[0] === 1;
    // Must not have two of same level
    const hasDupe = levels.length !== new Set(levels).size;
    // Decomposer (level 6) is ok at end or alone
    const chainWithoutDecomp = sorted.filter(o => o.role !== 'decomposer');

    if (hasDupe) {
      setFeedback({ ok: false, msg: '⚠️ You have two organisms at the same level. Each position can only have one organism.' });
      return;
    }
    if (!startsOk) {
      setFeedback({ ok: false, msg: '⚠️ Your chain should start with the Sun or a Producer (plant). Energy flows from the Sun!' });
      return;
    }
    if (hasGap && chainWithoutDecomp.length > 1) {
      setFeedback({ ok: false, msg: '⚠️ There\'s a gap in your chain! Make sure your organisms are in the right order — producers first, then consumers.' });
      return;
    }
    if (chainWithoutDecomp.length < 2) {
      setFeedback({ ok: false, msg: '⚠️ Add at least a producer and one consumer to make a food chain.' });
      return;
    }
    const stars = chainWithoutDecomp.length >= 4 ? '⭐⭐⭐' : chainWithoutDecomp.length === 3 ? '⭐⭐' : '⭐';
    const hasDecomp = chain.some(o => o.role === 'decomposer');
    const decomMsg = hasDecomp ? ' Great job including a decomposer — they recycle nutrients!' : '';
    setFeedback({
      ok: true,
      msg: `${stars} Excellent! Your food chain is correct!${decomMsg} Energy flows: ${sorted.filter(o => o.role !== 'decomposer').map(o => o.name).join(' → ')}${hasDecomp ? ' (+ decomposer recycling nutrients)' : ''}`,
    });
    showToast('Great food chain! 🎉');
  }, [chain, showToast]);

  const resetChain = useCallback(() => {
    setChain([]);
    setFeedback(null);
  }, []);

  const loadExample = useCallback((example) => {
    if (!selectedEco) return;
    const orgs = example.ids.map(id => selectedEco.organisms.find(o => o.id === id)).filter(Boolean);
    setChain(orgs);
    setFeedback(null);
  }, [selectedEco]);

  // ── Quiz helpers ────────────────────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    setQuizIdx(0);
    setQuizSelected(null);
    setQuizScore(0);
    setQuizDone(false);
    setQuizAnswers([]);
    setView('quiz');
  }, []);

  const handleQuizAnswer = useCallback((idx) => {
    if (quizSelected !== null) return;
    setQuizSelected(idx);
    const correct = idx === QUIZ_QUESTIONS[quizIdx].answer;
    if (correct) setQuizScore(s => s + 1);
    setQuizAnswers(prev => [...prev, { selected: idx, correct }]);
  }, [quizSelected, quizIdx]);

  const nextQuestion = useCallback(() => {
    if (quizIdx + 1 >= QUIZ_QUESTIONS.length) {
      setQuizDone(true);
    } else {
      setQuizIdx(i => i + 1);
      setQuizSelected(null);
    }
  }, [quizIdx]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (view === 'learn') return <LearnView onBack={() => setView('ecosystems')} />;
  if (view === 'quiz') {
    return (
      <QuizView
        quizIdx={quizIdx}
        quizSelected={quizSelected}
        quizScore={quizScore}
        quizDone={quizDone}
        quizAnswers={quizAnswers}
        onAnswer={handleQuizAnswer}
        onNext={nextQuestion}
        onBack={() => setView('ecosystems')}
        onRestart={startQuiz}
      />
    );
  }

  if (view === 'build' && selectedEco) {
    const sortedChain = [...chain].sort((a, b) => a.level - b.level);
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => { setView('ecosystems'); setSelectedEco(null); resetChain(); }}
              className="text-slate-500 hover:text-purple-600 text-sm font-medium">← Back</button>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span>{selectedEco.icon}</span> {selectedEco.name} Food Chain Builder
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={resetChain} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-200">🔄 Reset</button>
            <button onClick={checkChain} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90">✓ Check Chain</button>
          </div>
        </div>

        {/* Example chains */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Example Chains</p>
          <div className="flex flex-wrap gap-2">
            {selectedEco.chains.map(ex => (
              <button key={ex.name} onClick={() => loadExample(ex)}
                className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-sm hover:bg-purple-100">
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chain display */}
        <div className={`rounded-xl p-5 ${selectedEco.bg} border ${selectedEco.border}`}>
          <p className="text-sm font-semibold text-slate-600 mb-3">Your Food Chain</p>
          {sortedChain.length === 0 ? (
            <div className="text-center text-slate-400 py-6 text-sm">
              Click organisms below to add them to your chain
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {sortedChain.map((org, i) => (
                <React.Fragment key={org.id}>
                  <div className="flex flex-col items-center">
                    <div className="text-4xl">{org.icon}</div>
                    <span className="text-xs font-semibold text-slate-700 mt-1">{org.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border mt-0.5 ${ROLE_META[org.role].colour}`}>
                      {ROLE_META[org.role].label.split(' ')[0]}
                    </span>
                  </div>
                  {i < sortedChain.length - 1 && (
                    <div className="text-2xl text-slate-400 font-bold">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl p-4 text-sm font-medium ${feedback.ok ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
            {feedback.msg}
          </div>
        )}

        {/* Organism picker */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">Select Organisms</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {selectedEco.organisms.map(org => {
              const inChain = chain.some(o => o.id === org.id);
              return (
                <button key={org.id}
                  onClick={() => toggleOrganism(org)}
                  className={`rounded-xl p-3 border-2 text-center transition-all hover:scale-105 ${inChain ? `${selectedEco.bg} border-purple-400 shadow-md` : 'bg-white border-slate-200 hover:border-purple-300'}`}>
                  <div className="text-3xl mb-1">{org.icon}</div>
                  <div className="text-xs font-bold text-slate-700">{org.name}</div>
                  <div className={`text-xs mt-1 px-1.5 py-0.5 rounded-full border inline-block ${ROLE_META[org.role].colour}`}>
                    {ROLE_META[org.role].label.split('(')[0].trim()}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFactCard(org); }}
                    className="block w-full text-center text-purple-500 text-xs mt-1.5 hover:text-purple-700">
                    ℹ️ Info
                  </button>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fact card modal */}
        {factCard && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setFactCard(null)}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="text-6xl text-center mb-3">{factCard.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 text-center mb-1">{factCard.name}</h3>
              <div className={`text-sm text-center px-3 py-1 rounded-full border inline-block mb-4 mx-auto block w-fit ${ROLE_META[factCard.role].colour}`}>
                {ROLE_META[factCard.role].label}
              </div>
              <p className="text-slate-600 text-center text-sm leading-relaxed">{factCard.fact}</p>
              <button onClick={() => setFactCard(null)} className="mt-5 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 rounded-xl font-semibold text-sm hover:opacity-90">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Ecosystem selection screen ────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🦁</span>
          <div>
            <h2 className="text-2xl font-bold">Food Chain Builder</h2>
            <p className="text-green-100 text-sm">Explore how energy flows through ecosystems</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => setView('learn')}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/30 transition-all">
            📖 Learn First
          </button>
          <button onClick={startQuiz}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm border border-white/30 transition-all">
            🧪 Take the Quiz
          </button>
        </div>
      </div>

      {/* Key concepts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '🌿', label: 'Producers', desc: 'Make their own food using sunlight', colour: 'from-green-400 to-emerald-500' },
          { icon: '🐛', label: 'Consumers', desc: 'Eat other organisms for energy', colour: 'from-orange-400 to-amber-500' },
          { icon: '⚡', label: 'Energy Flow', desc: 'Moves from sun → plants → animals', colour: 'from-yellow-400 to-orange-500' },
          { icon: '🍄', label: 'Decomposers', desc: 'Break down dead matter for nutrients', colour: 'from-stone-400 to-slate-500' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.colour} rounded-xl p-3 text-white text-center shadow-sm`}>
            <div className="text-3xl mb-1">{c.icon}</div>
            <div className="font-bold text-sm">{c.label}</div>
            <div className="text-xs opacity-90 mt-0.5 leading-snug">{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Ecosystem chooser */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3">Choose an Ecosystem to Explore</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ECOSYSTEMS.map(eco => (
            <button key={eco.id}
              onClick={() => { setSelectedEco(eco); setView('build'); resetChain(); }}
              className="bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-purple-300">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{eco.icon}</span>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{eco.name}</h4>
                  <p className="text-slate-500 text-sm">{eco.organisms.filter(o => o.role !== 'energy').length} organisms to explore</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {eco.organisms.filter(o => o.role !== 'energy').map(org => (
                  <span key={org.id} className="text-xl" title={org.name}>{org.icon}</span>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <span className={`bg-gradient-to-r ${eco.colour} text-white px-3 py-1 rounded-lg text-sm font-semibold`}>
                  Build a Chain →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Learn View ───────────────────────────────────────────────────────────────
const LearnView = ({ onBack }) => {
  const [tab, setTab] = useState('what');
  const tabs = [
    { id: 'what', label: '🌿 What is a Food Chain?' },
    { id: 'roles', label: '🦁 Roles in a Chain' },
    { id: 'energy', label: '⚡ Energy Flow' },
    { id: 'importance', label: '🌍 Why It Matters' },
  ];
  const content = {
    what: {
      heading: 'What is a Food Chain?',
      body: `A food chain shows how energy and nutrients pass from one living thing to another in an ecosystem. It starts with the Sun, which gives energy to plants. Plants are eaten by animals, and those animals may be eaten by other animals.

Every arrow in a food chain means "is eaten by" or "provides energy for." For example:

🌿 Grass → 🦗 Grasshopper → 🐸 Frog → 🐍 Snake → 🦅 Eagle

This means: grass is eaten by the grasshopper, the grasshopper is eaten by the frog, and so on.`,
    },
    roles: {
      heading: 'Roles in a Food Chain',
      body: `**Producers** are usually plants. They make their own food using sunlight through a process called photosynthesis. Examples: grass, trees, seaweed, phytoplankton.

**Primary Consumers** (Herbivores) eat only plants. Examples: grasshoppers, rabbits, cows, caterpillars.

**Secondary Consumers** eat primary consumers. They may be carnivores or omnivores. Examples: frogs, foxes, small fish.

**Tertiary Consumers** eat secondary consumers. Examples: snakes, tuna, wolves.

**Apex Predators** are at the top of the food chain and have no natural predators. Examples: eagles, sharks, lions.

**Decomposers** break down dead organisms and return nutrients to the soil and water. Examples: mushrooms, earthworms, bacteria.`,
    },
    energy: {
      heading: 'How Energy Flows',
      body: `Energy enters most ecosystems from the Sun. Plants capture this energy and store it in their leaves, stems, and roots.

When a herbivore eats a plant, it gets some of that energy. However, only about 10% of the energy is passed on at each step — the rest is used up by the organism for moving, growing, and staying warm.

This is why food chains rarely have more than 5 or 6 links — by the time you get to an apex predator, very little of the original energy remains.

This is called the 10% Rule or the Energy Pyramid.`,
    },
    importance: {
      heading: 'Why Food Chains Matter',
      body: `Every organism in a food chain plays an important role. If one organism is removed, the whole chain can be disrupted — this is called a trophic cascade.

For example: if wolves are removed from a grassland, deer populations explode, which causes overgrazing, which destroys plant life, which harms all the other animals that depend on those plants.

Keeping ecosystems balanced means protecting every link in the food chain — from the smallest decomposer to the mightiest apex predator!`,
    },
  };
  const c = content[tab];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <span className="font-bold text-slate-800 text-lg">📖 Food Chain Learning Guide</span>
        <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm">← Back</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{c.heading}</h3>
        <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{c.body}</div>
      </div>
    </div>
  );
};

// ─── Quiz View ────────────────────────────────────────────────────────────────
const QuizView = ({ quizIdx, quizSelected, quizScore, quizDone, quizAnswers, onAnswer, onNext, onBack, onRestart }) => {
  if (quizDone) {
    const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
    const grade = pct >= 85 ? '🌟 Outstanding!' : pct >= 60 ? '👍 Good work!' : '📚 Keep practising!';
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <span className="font-bold text-slate-800">Quiz Results</span>
          <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm">← Back</button>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border border-green-200">
          <div className="text-6xl mb-3">
            {pct >= 85 ? '🏆' : pct >= 60 ? '🥈' : '📘'}
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{grade}</h3>
          <p className="text-slate-600 mb-4">
            You scored <span className="font-bold text-green-700">{quizScore}</span> out of <span className="font-bold">{QUIZ_QUESTIONS.length}</span> ({pct}%)
          </p>
          <div className="grid grid-cols-8 gap-1 max-w-xs mx-auto mb-6">
            {quizAnswers.map((a, i) => (
              <div key={i} className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold ${a.correct ? 'bg-green-500 text-white' : 'bg-red-400 text-white'}`}>
                {a.correct ? '✓' : '✗'}
              </div>
            ))}
          </div>
          <button onClick={onRestart} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:opacity-90">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = QUIZ_QUESTIONS[quizIdx];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <span className="font-bold text-slate-800">🧪 Food Chain Quiz</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{quizIdx + 1} / {QUIZ_QUESTIONS.length}</span>
          <button onClick={onBack} className="bg-slate-500 text-white px-3 py-1.5 rounded-lg hover:bg-slate-600 text-sm">← Back</button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="bg-slate-200 rounded-full h-2">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all" style={{ width: `${((quizIdx) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Question {quizIdx + 1}</p>
        <h3 className="text-lg font-bold text-slate-800 mb-5">{q.q}</h3>
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            let cls = 'bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-400';
            if (quizSelected !== null) {
              if (i === q.answer) cls = 'bg-green-100 border-2 border-green-500 text-green-800';
              else if (i === quizSelected) cls = 'bg-red-100 border-2 border-red-400 text-red-800';
              else cls = 'bg-white border-2 border-slate-200 text-slate-400';
            }
            return (
              <button key={i} onClick={() => onAnswer(i)} disabled={quizSelected !== null}
                className={`w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all ${cls} disabled:cursor-default`}>
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
              </button>
            );
          })}
        </div>
        {quizSelected !== null && (
          <div className={`mt-4 p-3 rounded-xl text-sm ${quizSelected === q.answer ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <span className="font-bold">{quizSelected === q.answer ? '✅ Correct! ' : '❌ Not quite. '}</span>
            {q.explanation}
          </div>
        )}
        {quizSelected !== null && (
          <button onClick={onNext} className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90">
            {quizIdx + 1 >= QUIZ_QUESTIONS.length ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodChainBuilder;
