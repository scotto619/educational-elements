// components/curriculum/literacy/PoetryCorner.js
// Interactive Poetry Corner for primary students (ages 5–12)
// Teaches poetry forms, lets students write guided poems, and includes a quiz
import React, { useState, useCallback, useRef } from 'react';

// ─── Poetry form definitions ────────────────────────────────────────────────
const POETRY_FORMS = [
  {
    id: 'haiku',
    name: 'Haiku',
    icon: '🌸',
    colour: { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'from-pink-500 to-rose-500', text: 'text-pink-700', light: 'bg-pink-100', ring: 'ring-pink-400' },
    ageRange: 'Ages 7–12',
    description: 'A traditional Japanese poem with exactly three lines following a 5-7-5 syllable pattern. Haiku often focus on nature and seasons.',
    structure: [
      { label: 'Line 1', syllables: 5, placeholder: 'e.g. The old silent pond' },
      { label: 'Line 2', syllables: 7, placeholder: 'e.g. A frog jumps into the pond' },
      { label: 'Line 3', syllables: 5, placeholder: 'e.g. Splash! Silence again' },
    ],
    tips: ['Focus on a single moment in nature', 'Use sensory details — what you see, hear, or feel', 'The last line often has a surprise or twist'],
    examples: [
      { lines: ['An old silent pond', 'A frog jumps into the pond—', 'Splash! Silence again.'], author: 'Matsuo Bashō (translated)' },
      { lines: ['Over the wintry', 'Forest, winds howl in rage with', 'No leaves to blow.'], author: 'Natsume Sōseki (translated)' },
    ],
  },
  {
    id: 'acrostic',
    name: 'Acrostic',
    icon: '🔤',
    colour: { bg: 'bg-blue-50', border: 'border-blue-200', accent: 'from-blue-500 to-indigo-500', text: 'text-blue-700', light: 'bg-blue-100', ring: 'ring-blue-400' },
    ageRange: 'Ages 5–12',
    description: 'A poem where the first letter of each line spells out a word or name when read from top to bottom.',
    structureType: 'acrostic',
    defaultWord: 'STAR',
    tips: ['Choose a short word to start (3–6 letters)', 'Each line should describe or relate to the word', 'Lines can be single words, phrases, or full sentences'],
    examples: [
      { word: 'RAIN', lines: ['Running down the window pane', 'A puddle forms outside my door', 'I splash and dance in rubber boots', 'Nothing stops my rainy fun!'], author: '' },
    ],
  },
  {
    id: 'limerick',
    name: 'Limerick',
    icon: '😂',
    colour: { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'from-amber-500 to-orange-500', text: 'text-amber-700', light: 'bg-amber-100', ring: 'ring-amber-400' },
    ageRange: 'Ages 7–12',
    description: 'A funny five-line poem with a bouncy rhythm. Lines 1, 2, and 5 rhyme with each other, and lines 3 and 4 rhyme with each other (AABBA pattern).',
    structure: [
      { label: 'Line 1 (A)', syllables: '7–10', placeholder: 'e.g. There once was a cat from the coast' },
      { label: 'Line 2 (A)', syllables: '7–10', placeholder: 'e.g. Who loved eating jam on his toast' },
      { label: 'Line 3 (B)', syllables: '5–7', placeholder: 'e.g. He ate it each day' },
      { label: 'Line 4 (B)', syllables: '5–7', placeholder: 'e.g. In every which way' },
      { label: 'Line 5 (A)', syllables: '7–10', placeholder: 'e.g. That hungry old cat from the coast' },
    ],
    tips: ['Start with "There once was a..." for an easy beginning', 'Make it silly or funny — limericks are meant to be humorous!', 'Read it aloud to check the rhythm bounces along'],
    examples: [
      { lines: ['There once was a man from Peru', 'Who dreamed he was eating his shoe', 'He woke with a fright', 'In the middle of night', 'And found that his dream had come true!'], author: 'Traditional' },
    ],
  },
  {
    id: 'cinquain',
    name: 'Cinquain',
    icon: '⭐',
    colour: { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'from-purple-500 to-violet-500', text: 'text-purple-700', light: 'bg-purple-100', ring: 'ring-purple-400' },
    ageRange: 'Ages 6–12',
    description: 'A five-line poem that follows a specific word-count pattern: 1 word, 2 words, 3 words, 4 words, 1 word. It paints a picture using very few words.',
    structure: [
      { label: 'Line 1 — Title (1 word)', words: 1, placeholder: 'e.g. Ocean' },
      { label: 'Line 2 — Describe it (2 words)', words: 2, placeholder: 'e.g. Deep, blue' },
      { label: 'Line 3 — Action (3 words)', words: 3, placeholder: 'e.g. Waves crash loudly' },
      { label: 'Line 4 — Feeling (4 words)', words: 4, placeholder: 'e.g. I feel so small' },
      { label: 'Line 5 — Synonym/Summary (1 word)', words: 1, placeholder: 'e.g. Mighty' },
    ],
    tips: ['Pick one topic or object for the whole poem', 'Use strong, descriptive words', 'The last line should summarise or give a new name to the topic'],
    examples: [
      { lines: ['Snow', 'Soft, white', 'Falling down gently', 'Covering the sleeping ground', 'Blanket'], author: '' },
    ],
  },
  {
    id: 'diamante',
    name: 'Diamante',
    icon: '💎',
    colour: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'from-teal-500 to-cyan-500', text: 'text-teal-700', light: 'bg-teal-100', ring: 'ring-teal-400' },
    ageRange: 'Ages 8–12',
    description: 'A diamond-shaped poem with seven lines that either describes one topic or transitions between two opposite topics. Uses nouns, adjectives, and verbs.',
    structure: [
      { label: 'Line 1 — Subject noun (1 word)', words: 1, placeholder: 'e.g. Sun' },
      { label: 'Line 2 — Adjectives (2 words)', words: 2, placeholder: 'e.g. Bright, warm' },
      { label: 'Line 3 — Verbs/"-ing" words (3 words)', words: 3, placeholder: 'e.g. Shining, glowing, burning' },
      { label: 'Line 4 — Nouns (4 words, transition)', words: 4, placeholder: 'e.g. Rays, light, shadows, darkness' },
      { label: 'Line 5 — Verbs/"-ing" words (3 words)', words: 3, placeholder: 'e.g. Twinkling, hiding, fading' },
      { label: 'Line 6 — Adjectives (2 words)', words: 2, placeholder: 'e.g. Cool, silver' },
      { label: 'Line 7 — Opposite noun (1 word)', words: 1, placeholder: 'e.g. Moon' },
    ],
    tips: ['Choose two opposite things (day/night, summer/winter, happy/sad)', 'Line 4 is the pivot — the first two nouns relate to the top word, the last two to the bottom word', 'The shape of the poem should look like a diamond!'],
    examples: [
      { lines: ['Summer', 'Hot, sunny', 'Swimming, playing, laughing', 'Beach, ice cream, blankets, cocoa', 'Snowing, shivering, sleeping', 'Cold, dark', 'Winter'], author: '' },
    ],
  },
  {
    id: 'freeverse',
    name: 'Free Verse',
    icon: '🌊',
    colour: { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'from-emerald-500 to-green-500', text: 'text-emerald-700', light: 'bg-emerald-100', ring: 'ring-emerald-400' },
    ageRange: 'Ages 5–12',
    description: 'A poem with no set rules for rhyme, rhythm, or line length. Free verse lets you express your thoughts and feelings naturally.',
    structureType: 'freeform',
    tips: ['Write about something you feel strongly about', 'Use line breaks to create pauses and emphasis', 'Read it aloud — does it sound the way you want it to feel?', 'Try using a simile (like/as) or a metaphor to make images vivid'],
    examples: [
      { lines: ['The fog comes', 'on little cat feet.', 'It sits looking', 'over harbor and city', 'on silent haunches', 'and then moves on.'], author: 'Carl Sandburg' },
    ],
  },
];

// ─── Quiz questions ──────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: 'How many lines does a haiku have?', options: ['2', '3', '5', '7'], answer: 1 },
  { q: 'What syllable pattern does a haiku follow?', options: ['3-5-3', '5-7-5', '7-5-7', '4-6-4'], answer: 1 },
  { q: 'In an acrostic poem, the first letters of each line spell out a…', options: ['Rhyme', 'Word or name', 'Sentence', 'Number'], answer: 1 },
  { q: 'A limerick has how many lines?', options: ['3', '4', '5', '6'], answer: 2 },
  { q: 'What is the rhyme scheme of a limerick?', options: ['ABAB', 'AABB', 'AABBA', 'ABCAB'], answer: 2 },
  { q: 'What shape does a diamante poem look like?', options: ['Circle', 'Triangle', 'Diamond', 'Square'], answer: 2 },
  { q: 'In a cinquain, how many words are in the first line?', options: ['1', '2', '3', '4'], answer: 0 },
  { q: 'Which poetry form is known for being funny and bouncy?', options: ['Haiku', 'Diamante', 'Limerick', 'Acrostic'], answer: 2 },
  { q: 'Free verse poetry does NOT require…', options: ['Words', 'Line breaks', 'Rhyme and set rhythm', 'Feelings'], answer: 2 },
  { q: 'A diamante poem transitions between two…', options: ['Similar things', 'Rhyming words', 'Opposite things', 'Long sentences'], answer: 2 },
  { q: 'Which poetry form originated in Japan?', options: ['Limerick', 'Cinquain', 'Free Verse', 'Haiku'], answer: 3 },
  { q: 'The word count pattern for a cinquain is…', options: ['1-2-3-4-1', '2-4-6-4-2', '1-1-1-1-1', '1-3-5-3-1'], answer: 0 },
];

// ─── Shuffle helper ──────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Simple syllable estimator ──────────────────────────────────────────────
function estimateSyllables(text) {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/);
  let total = 0;
  for (const word of words) {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) continue;
    let count = 0;
    let prevVowel = false;
    for (let i = 0; i < w.length; i++) {
      const isVowel = 'aeiouy'.includes(w[i]);
      if (isVowel && !prevVowel) count++;
      prevVowel = isVowel;
    }
    if (w.endsWith('e') && count > 1) count--;
    if (w.endsWith('le') && w.length > 2 && !'aeiou'.includes(w[w.length - 3])) count++;
    total += Math.max(1, count);
  }
  return total;
}

function countWords(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// ─── Tab Button ──────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'
        : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-slate-200'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

// ─── Learn Tab ───────────────────────────────────────────────────────────────
const LearnTab = ({ form, onTryIt }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className={`${form.colour.bg} ${form.colour.border} border rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-4xl">{form.icon}</span>
        <div>
          <h3 className={`text-2xl font-bold ${form.colour.text}`}>{form.name}</h3>
          <span className="text-sm text-slate-500">{form.ageRange}</span>
        </div>
      </div>
      <p className="text-slate-700 leading-relaxed">{form.description}</p>
    </div>

    {/* Structure */}
    {form.structure && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="font-bold text-slate-800 mb-4 text-lg">Structure</h4>
        <div className="space-y-2">
          {form.structure.map((line, i) => (
            <div key={i} className={`flex items-center gap-3 ${form.colour.light} rounded-lg px-4 py-2.5`}>
              <span className={`font-mono font-bold text-sm ${form.colour.text} w-6 text-center`}>{i + 1}</span>
              <span className="text-slate-700 font-medium">{line.label}</span>
              {line.syllables && <span className="ml-auto text-xs bg-white rounded-full px-3 py-1 text-slate-500 font-medium">{typeof line.syllables === 'number' ? `${line.syllables} syllables` : `${line.syllables} syllables`}</span>}
              {line.words && <span className="ml-auto text-xs bg-white rounded-full px-3 py-1 text-slate-500 font-medium">{line.words} word{line.words > 1 ? 's' : ''}</span>}
            </div>
          ))}
        </div>
      </div>
    )}

    {form.structureType === 'acrostic' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="font-bold text-slate-800 mb-3 text-lg">Structure</h4>
        <p className="text-slate-600">The first letter of each line spells out a chosen word. Each line relates to that word.</p>
      </div>
    )}

    {form.structureType === 'freeform' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="font-bold text-slate-800 mb-3 text-lg">Structure</h4>
        <p className="text-slate-600">No fixed rules! Write as many lines as you like, in any length. Focus on expressing your feelings and creating vivid images.</p>
      </div>
    )}

    {/* Tips */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h4 className="font-bold text-slate-800 mb-4 text-lg">Tips for Writing</h4>
      <div className="space-y-3">
        {form.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${form.colour.accent} text-white text-xs flex items-center justify-center font-bold mt-0.5`}>{i + 1}</span>
            <p className="text-slate-600">{tip}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Examples */}
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h4 className="font-bold text-slate-800 mb-4 text-lg">Examples</h4>
      <div className="space-y-4">
        {form.examples.map((example, i) => (
          <div key={i} className={`${form.colour.bg} ${form.colour.border} border rounded-xl p-5`}>
            {example.word && <p className={`font-bold ${form.colour.text} text-sm mb-2`}>Word: {example.word}</p>}
            <div className="space-y-1 font-serif italic text-slate-700 text-lg leading-relaxed">
              {example.lines.map((line, j) => (
                <p key={j}>{example.word ? <span className={`font-bold ${form.colour.text} not-italic`}>{line[0]}</span> : null}{example.word ? line.slice(1) : line}</p>
              ))}
            </div>
            {example.author && <p className="text-sm text-slate-400 mt-3">— {example.author}</p>}
          </div>
        ))}
      </div>
    </div>

    {/* Try it button */}
    <button
      onClick={onTryIt}
      className={`w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r ${form.colour.accent} hover:shadow-lg transition-all text-lg`}
    >
      Write Your Own {form.name}! ✏️
    </button>
  </div>
);

// ─── Write Tab ───────────────────────────────────────────────────────────────
const WriteTab = ({ form }) => {
  const [lines, setLines] = useState(() => {
    if (form.structure) return form.structure.map(() => '');
    if (form.structureType === 'acrostic') return form.defaultWord.split('').map(() => '');
    return [''];
  });
  const [acrosticWord, setAcrosticWord] = useState(form.defaultWord || 'STAR');
  const [saved, setSaved] = useState(false);

  const updateLine = useCallback((idx, value) => {
    setLines(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
    setSaved(false);
  }, []);

  const handleAcrosticWordChange = useCallback((value) => {
    const word = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
    setAcrosticWord(word);
    setLines(word.split('').map((_, i) => (lines[i] || '')));
    setSaved(false);
  }, [lines]);

  const addLine = useCallback(() => { setLines(prev => [...prev, '']); setSaved(false); }, []);
  const removeLine = useCallback((idx) => { setLines(prev => prev.filter((_, i) => i !== idx)); setSaved(false); }, []);

  const isAcrostic = form.structureType === 'acrostic';
  const isFreeform = form.structureType === 'freeform';
  const activeLines = isAcrostic ? acrosticWord.split('') : (form.structure || lines);

  const handleSave = () => setSaved(true);

  return (
    <div className="space-y-6">
      <div className={`${form.colour.bg} ${form.colour.border} border rounded-2xl p-5`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{form.icon}</span>
          <h3 className={`text-xl font-bold ${form.colour.text}`}>Write Your {form.name}</h3>
        </div>
        <p className="text-slate-500 text-sm">{form.description}</p>
      </div>

      {/* Acrostic word input */}
      {isAcrostic && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <label className="block font-bold text-slate-700 mb-2">Choose your word:</label>
          <input
            type="text"
            value={acrosticWord}
            onChange={(e) => handleAcrosticWordChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border-2 ${form.colour.border} focus:outline-none focus:${form.colour.ring} text-2xl font-bold tracking-widest text-center ${form.colour.text}`}
            maxLength={10}
            placeholder="STAR"
          />
        </div>
      )}

      {/* Line inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        {(isAcrostic ? acrosticWord.split('') : (form.structure || lines)).map((item, i) => {
          const structLine = form.structure ? form.structure[i] : null;
          const syllableCount = structLine && typeof structLine.syllables === 'number' ? estimateSyllables(lines[i]) : null;
          const wordCount = structLine && structLine.words ? countWords(lines[i]) : null;

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-600">
                  {isAcrostic ? `Line starting with "${item}"` : (structLine ? structLine.label : `Line ${i + 1}`)}
                </label>
                {syllableCount !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${syllableCount === structLine.syllables ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {syllableCount}/{structLine.syllables} syllables
                  </span>
                )}
                {wordCount !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wordCount === structLine.words ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {wordCount}/{structLine.words} word{structLine.words > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isAcrostic && (
                  <span className={`text-2xl font-bold ${form.colour.text} w-8 text-center flex-shrink-0`}>{item}</span>
                )}
                <input
                  type="text"
                  value={lines[i] || ''}
                  onChange={(e) => updateLine(i, e.target.value)}
                  placeholder={isAcrostic ? `Write a line starting with ${item}...` : (structLine ? structLine.placeholder : 'Write your line...')}
                  className={`flex-1 px-4 py-3 rounded-xl border ${form.colour.border} focus:outline-none focus:ring-2 ${form.colour.ring} text-slate-700 bg-slate-50`}
                />
                {isFreeform && lines.length > 1 && (
                  <button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600 text-lg flex-shrink-0" title="Remove line">✕</button>
                )}
              </div>
            </div>
          );
        })}
        {isFreeform && (
          <button onClick={addLine} className="text-sm text-purple-600 hover:text-purple-800 font-medium">+ Add another line</button>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><span>📜</span> Preview</h4>
        <div className={`bg-white rounded-xl p-6 border ${form.colour.border} min-h-[120px]`}>
          {lines.some(l => l && l.trim()) ? (
            <div className="space-y-1.5 font-serif text-lg text-slate-800 leading-relaxed italic">
              {(isAcrostic ? acrosticWord.split('') : (form.structure || lines)).map((item, i) => {
                const text = lines[i] || '';
                if (!text.trim() && !isAcrostic) return <p key={i} className="text-slate-300">...</p>;
                return (
                  <p key={i}>
                    {isAcrostic && <span className={`font-bold ${form.colour.text} not-italic`}>{item}</span>}
                    {isAcrostic ? text : text}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400 italic text-center">Start writing above to see your poem here...</p>
          )}
        </div>
      </div>

      {/* Save / Copy */}
      <button
        onClick={handleSave}
        className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${form.colour.accent} hover:shadow-lg transition-all`}
      >
        {saved ? 'Poem Saved! ✅' : 'Save My Poem 💾'}
      </button>
    </div>
  );
};

// ─── Quiz Tab ────────────────────────────────────────────────────────────────
const QuizTab = ({ showToast }) => {
  const [questions] = useState(() => shuffle(QUIZ_QUESTIONS).slice(0, 8));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const timeoutRef = useRef(null);

  const handleAnswer = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[current].answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) { setScore(s => s + 1); setStreak(s => s + 1); }
    else { setStreak(0); }

    timeoutRef.current = setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  }, [selected, current, questions]);

  const restart = () => {
    setCurrent(0); setScore(0); setSelected(null); setFeedback(null); setDone(false); setStreak(0);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '📚';
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-6">
        <div className="text-6xl">{emoji}</div>
        <h3 className="text-3xl font-bold text-slate-800">Quiz Complete!</h3>
        <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{score}/{questions.length}</div>
        <p className="text-lg text-slate-600">{pct}% correct — {pct >= 80 ? 'Poetry expert!' : pct >= 60 ? 'Great work, keep practising!' : 'Keep learning — you\'ll get there!'}</p>
        <button onClick={restart} className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg transition-all">
          Try Again
        </button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">Question {current + 1} of {questions.length}</span>
        <div className="flex items-center gap-3">
          {streak >= 2 && <span className="text-sm font-bold text-orange-500">🔥 {streak} streak!</span>}
          <span className="text-sm font-bold text-purple-600">{score} pts</span>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h4 className="text-xl font-bold text-slate-800 mb-6">{q.q}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options.map((opt, i) => {
            let cls = 'border-slate-200 hover:border-purple-300 hover:bg-purple-50';
            if (selected !== null) {
              if (i === q.answer) cls = 'border-green-400 bg-green-50 ring-2 ring-green-400';
              else if (i === selected) cls = 'border-red-400 bg-red-50 ring-2 ring-red-400';
              else cls = 'border-slate-200 opacity-50';
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selected !== null}
                className={`border-2 rounded-xl px-5 py-4 text-left font-medium transition-all ${cls}`}
              >
                <span className="text-sm text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                <span className="text-slate-700">{opt}</span>
              </button>
            );
          })}
        </div>
        {feedback && (
          <div className={`mt-4 text-center font-bold text-lg ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
            {feedback === 'correct' ? '✅ Correct!' : `❌ The answer was: ${q.options[q.answer]}`}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const PoetryCorner = ({ showToast = () => {}, students, saveData, loadedData }) => {
  const [tab, setTab] = useState('explore'); // 'explore' | 'write' | 'quiz'
  const [selectedForm, setSelectedForm] = useState(null);
  const [writeForm, setWriteForm] = useState(null);

  const handleSelectForm = (form) => {
    setSelectedForm(form);
    setTab('learn');
  };

  const handleTryIt = () => {
    setWriteForm(selectedForm);
    setTab('write');
  };

  const handleBackToExplore = () => {
    setSelectedForm(null);
    setWriteForm(null);
    setTab('explore');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">
          Poetry Corner
        </h2>
        <p className="text-slate-500 mt-1">Explore poetry forms, write your own poems, and test your knowledge!</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        <TabButton active={tab === 'explore' || tab === 'learn'} onClick={handleBackToExplore} icon="📚" label="Explore" />
        <TabButton active={tab === 'write'} onClick={() => { if (!writeForm && selectedForm) setWriteForm(selectedForm); if (writeForm || selectedForm) setTab('write'); }} icon="✏️" label="Write" />
        <TabButton active={tab === 'quiz'} onClick={() => setTab('quiz')} icon="🧠" label="Quiz" />
      </div>

      {/* ── Explore tab ─────────────────────────────────────────────── */}
      {tab === 'explore' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POETRY_FORMS.map((form) => (
            <button
              key={form.id}
              onClick={() => handleSelectForm(form)}
              className={`${form.colour.bg} ${form.colour.border} border-2 rounded-2xl p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all group`}
            >
              <div className="text-4xl mb-3">{form.icon}</div>
              <h3 className={`text-lg font-bold ${form.colour.text} group-hover:underline`}>{form.name}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{form.description}</p>
              <span className="inline-block mt-3 text-xs font-semibold bg-white rounded-full px-3 py-1 text-slate-500">{form.ageRange}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Learn tab (detail view of a form) ────────────────────── */}
      {tab === 'learn' && selectedForm && (
        <div>
          <button onClick={handleBackToExplore} className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-4 flex items-center gap-1">
            <span>←</span> Back to all forms
          </button>
          <LearnTab form={selectedForm} onTryIt={handleTryIt} />
        </div>
      )}

      {/* ── Write tab ────────────────────────────────────────────── */}
      {tab === 'write' && writeForm && (
        <div>
          <button onClick={handleBackToExplore} className="text-sm text-purple-600 hover:text-purple-800 font-medium mb-4 flex items-center gap-1">
            <span>←</span> Back to all forms
          </button>
          <WriteTab form={writeForm} />
        </div>
      )}

      {tab === 'write' && !writeForm && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 text-center border border-purple-200">
          <p className="text-lg text-purple-700 font-medium mb-4">Choose a poetry form first!</p>
          <button onClick={() => setTab('explore')} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:shadow-lg transition-all">
            Explore Poetry Forms
          </button>
        </div>
      )}

      {/* ── Quiz tab ─────────────────────────────────────────────── */}
      {tab === 'quiz' && (
        <QuizTab showToast={showToast} />
      )}
    </div>
  );
};

export default PoetryCorner;
