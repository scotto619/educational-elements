// components/student/SpellingActivities.js
// Interactive, on-site spelling activities. Every game receives { words, onComplete }
// and calls onComplete() exactly once when the student finishes the whole activity.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/* ═══════════════════════════ Shared helpers ═══════════════════════════ */

const cleanWord = (w = '') => String(w).trim();
const foldWord = (w = '') => cleanWord(w).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const same = (a = '', b = '') => foldWord(a) === foldWord(b);

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickWords = (words, max) => {
  const unique = [...new Set(words.map(cleanWord).filter(Boolean))];
  if (unique.length <= max) return shuffle(unique);
  return shuffle(unique).slice(0, max);
};

const RAINBOW = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const countVowels = (word) => [...word.toLowerCase()].filter(ch => VOWELS.has(ch)).length;
const letterCount = (word) => [...word].filter(ch => /[a-z]/i.test(ch)).length;

/* Small building blocks */

const ProgressPills = ({ total, current }) => (
  <div className="flex flex-wrap justify-center gap-1.5 mb-4">
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`h-2.5 rounded-full transition-all duration-300 ${
          i < current ? 'w-6 bg-green-500' : i === current ? 'w-6 bg-indigo-500 animate-pulse' : 'w-2.5 bg-gray-200'
        }`}
      />
    ))}
  </div>
);

const BigFeedback = ({ status }) => {
  if (!status) return null;
  return (
    <div className={`text-center text-lg font-bold mb-2 ${status === 'correct' ? 'text-green-600' : 'text-red-500'}`}>
      {status === 'correct' ? '✅ Brilliant!' : '❌ Not quite — try again!'}
    </div>
  );
};

const CelebrationPanel = ({ title = 'Activity Complete!', subtitle, onExit, stats }) => (
  <div className="text-center py-8 px-4">
    <div className="flex justify-center gap-3 text-5xl mb-4">
      <span className="animate-bounce">🎉</span>
      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>⭐</span>
      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏆</span>
      <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>⭐</span>
      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎉</span>
    </div>
    <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{title}</h3>
    {subtitle && <p className="text-gray-600 mb-2">{subtitle}</p>}
    {stats && (
      <div className="flex justify-center gap-3 my-4 flex-wrap">
        {stats.map((s, i) => (
          <div key={i} className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
            <div className="text-xl font-extrabold text-indigo-700">{s.value}</div>
            <div className="text-xs text-indigo-500 font-semibold">{s.label}</div>
          </div>
        ))}
      </div>
    )}
    <button
      onClick={onExit}
      className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform"
    >
      Awesome! 🌟
    </button>
  </div>
);

const SpellingInput = ({ value, onChange, onSubmit, placeholder = 'Type the word…', autoFocus = true, disabled }) => (
  <form
    onSubmit={e => { e.preventDefault(); onSubmit(); }}
    className="flex flex-col sm:flex-row gap-2 justify-center items-stretch"
  >
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      className="border-2 border-indigo-300 rounded-xl px-4 py-3 text-lg text-center font-bold tracking-wider focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-500 disabled:bg-gray-100 w-full sm:w-72"
    />
    <button
      type="submit"
      disabled={disabled || !value.trim()}
      className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition"
    >
      Check ✔
    </button>
  </form>
);

/* ═══════════════════ 1. Rainbow Words 🌈 ═══════════════════ */

const RainbowWords = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 12), [words]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState(null);
  const [done, setDone] = useState(false);

  const word = list[index];

  const submit = () => {
    if (same(typed, word)) {
      setStatus('correct');
      setTimeout(() => {
        setStatus(null);
        setTyped('');
        if (index + 1 >= list.length) {
          setDone(true);
          onComplete();
        } else {
          setIndex(i => i + 1);
        }
      }, 700);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 900);
    }
  };

  if (done) return <CelebrationPanel title="Rainbow Master! 🌈" subtitle={`You painted all ${list.length} words in rainbow colours!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Copy the word below — watch your letters turn into a rainbow!</p>
      <ProgressPills total={list.length} current={index} />
      <div className="text-3xl font-extrabold text-gray-400 tracking-widest mb-4 select-none">{word}</div>
      <div className="min-h-[3.5rem] flex justify-center items-center gap-0.5 mb-4 flex-wrap">
        {typed.length === 0 ? (
          <span className="text-gray-300 text-2xl">🌈 start typing…</span>
        ) : (
          [...typed].map((ch, i) => (
            <span
              key={i}
              className="text-4xl font-extrabold animate-bounce"
              style={{ color: RAINBOW[i % RAINBOW.length], animationDuration: '1.2s', animationDelay: `${i * 0.05}s` }}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))
        )}
      </div>
      <BigFeedback status={status} />
      <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} />
    </div>
  );
};

/* ═══════════════ 2. Look, Cover, Write, Check 👀 ═══════════════ */

const LookCoverWriteCheck = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 10), [words]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('look'); // look | write | wrong
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  const word = list[index];

  const submit = () => {
    if (same(typed, word)) {
      setTyped('');
      if (index + 1 >= list.length) {
        setDone(true);
        onComplete();
      } else {
        setIndex(i => i + 1);
        setPhase('look');
      }
    } else {
      setPhase('wrong');
    }
  };

  if (done) return <CelebrationPanel title="Memory Champion! 🧠" subtitle={`You spelled all ${list.length} words from memory!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">LOOK at the word, COVER it, WRITE it from memory, then CHECK!</p>
      <ProgressPills total={list.length} current={index} />

      {phase === 'look' && (
        <>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-indigo-200 rounded-2xl py-8 mb-4">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">👀 Look carefully…</div>
            <div className="text-5xl font-extrabold text-indigo-700 tracking-widest">{word}</div>
          </div>
          <button
            onClick={() => { setPhase('write'); setTyped(''); }}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            🙈 Got it — cover the word!
          </button>
        </>
      )}

      {phase === 'write' && (
        <>
          <div className="bg-gray-800 rounded-2xl py-8 mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">✋ Word is covered!</div>
            <div className="text-5xl font-extrabold text-gray-600 tracking-widest select-none">{'●'.repeat(Math.min(letterCount(word), 12))}</div>
          </div>
          <p className="text-gray-600 font-semibold mb-3">✍️ Now write it from memory:</p>
          <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} />
        </>
      )}

      {phase === 'wrong' && (
        <>
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl py-6 px-4 mb-4">
            <div className="text-lg font-bold text-red-600 mb-2">Almost! Let's compare:</div>
            <div className="flex justify-center gap-6 flex-wrap">
              <div>
                <div className="text-xs text-gray-500 font-semibold">You wrote</div>
                <div className="text-2xl font-extrabold text-red-500 line-through">{typed || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Correct spelling</div>
                <div className="text-2xl font-extrabold text-green-600">{word}</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setPhase('look'); setTyped(''); }}
            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
          >
            🔁 Look again and retry
          </button>
        </>
      )}
    </div>
  );
};

/* ═══════════════════ 3. Word Sorting 📊 ═══════════════════ */

const buildSortBuckets = (list) => {
  const lengths = [...new Set(list.map(letterCount))].sort((a, b) => a - b);
  if (lengths.length >= 2 && lengths.length <= 4) {
    return lengths.map(len => ({
      id: `len-${len}`,
      label: `${len} letters`,
      icon: '🔢',
      test: w => letterCount(w) === len
    }));
  }
  if (lengths.length > 4) {
    const min = lengths[0];
    const max = lengths[lengths.length - 1];
    const third = Math.max(1, Math.round((max - min) / 3));
    const shortMax = min + third - 1;
    const medMax = min + third * 2 - 1;
    return [
      { id: 'short', label: `Short (${min}–${shortMax} letters)`, icon: '🐭', test: w => letterCount(w) <= shortMax },
      { id: 'medium', label: `Medium (${shortMax + 1}–${medMax} letters)`, icon: '🐱', test: w => letterCount(w) > shortMax && w && letterCount(w) <= medMax },
      { id: 'long', label: `Long (${medMax + 1}+ letters)`, icon: '🐘', test: w => letterCount(w) > medMax }
    ];
  }
  // All words same length → sort by vowel count instead
  const vowelCounts = [...new Set(list.map(countVowels))].sort((a, b) => a - b);
  return vowelCounts.map(v => ({
    id: `vow-${v}`,
    label: `${v} vowel${v !== 1 ? 's' : ''}`,
    icon: '🔤',
    test: w => countVowels(w) === v
  }));
};

const WordSorting = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 12), [words]);
  const buckets = useMemo(() => buildSortBuckets(list), [list]);
  const [remaining, setRemaining] = useState(list);
  const [placed, setPlaced] = useState({});
  const [selected, setSelected] = useState(null);
  const [shakeBucket, setShakeBucket] = useState(null);
  const [done, setDone] = useState(false);

  const dropInBucket = (bucket) => {
    if (!selected) return;
    if (bucket.test(selected)) {
      setPlaced(prev => ({ ...prev, [bucket.id]: [...(prev[bucket.id] || []), selected] }));
      const next = remaining.filter(w => w !== selected);
      setRemaining(next);
      setSelected(null);
      if (next.length === 0) {
        setDone(true);
        onComplete();
      }
    } else {
      setShakeBucket(bucket.id);
      setTimeout(() => setShakeBucket(null), 600);
    }
  };

  if (done) return <CelebrationPanel title="Sorting Superstar! 📊" subtitle="Every word found its perfect home!" onExit={onExit} />;

  return (
    <div>
      <p className="text-gray-600 text-center mb-3">Tap a word, then tap the group it belongs in!</p>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 mb-4 min-h-[4rem]">
        <div className="flex flex-wrap gap-2 justify-center">
          {remaining.map(w => (
            <button
              key={w}
              onClick={() => setSelected(prev => prev === w ? null : w)}
              className={`px-3 py-1.5 rounded-xl font-bold text-sm border-2 transition-all ${
                selected === w
                  ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg'
                  : 'bg-white text-gray-700 border-amber-300 hover:border-indigo-400'
              }`}
            >
              {w}
            </button>
          ))}
          {remaining.length === 0 && <span className="text-amber-500 text-sm font-semibold">All sorted! 🎊</span>}
        </div>
      </div>
      <div className={`grid gap-3 ${buckets.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {buckets.map(bucket => (
          <button
            key={bucket.id}
            onClick={() => dropInBucket(bucket)}
            className={`text-left border-2 rounded-2xl p-3 min-h-[7rem] transition-all ${
              shakeBucket === bucket.id
                ? 'border-red-400 bg-red-50 animate-pulse'
                : selected
                  ? 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100 cursor-pointer'
                  : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="font-bold text-gray-700 text-sm mb-2">{bucket.icon} {bucket.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {(placed[bucket.id] || []).map(w => (
                <span key={w} className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-300 rounded-lg text-xs font-bold">✓ {w}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════ 4. Pyramid Builder 🔺 ═══════════════════ */

const PyramidBuilder = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 4).sort((a, b) => a.length - b.length), [words]);
  const [wordIndex, setWordIndex] = useState(0);
  const [row, setRow] = useState(0);
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState(null);
  const [done, setDone] = useState(false);

  const word = list[wordIndex];
  const target = word ? word.slice(0, row + 1) : '';

  const submit = () => {
    if (same(typed, target)) {
      setTyped('');
      setStatus('correct');
      setTimeout(() => setStatus(null), 500);
      if (row + 1 >= word.length) {
        if (wordIndex + 1 >= list.length) {
          setDone(true);
          onComplete();
        } else {
          setWordIndex(i => i + 1);
          setRow(0);
        }
      } else {
        setRow(r => r + 1);
      }
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 900);
    }
  };

  if (done) return <CelebrationPanel title="Pyramid Architect! 🔺" subtitle={`You built ${list.length} word pyramids, brick by brick!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Build the word one letter at a time — like a pyramid!</p>
      <ProgressPills total={list.length} current={wordIndex} />
      <div className="text-sm font-bold text-gray-500 mb-3">Word {wordIndex + 1} of {list.length}: <span className="text-indigo-600 text-lg">{word}</span></div>
      <div className="bg-gradient-to-b from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-2xl py-4 px-2 mb-4">
        {Array.from({ length: word.length }, (_, i) => (
          <div key={i} className="leading-relaxed">
            {i < row ? (
              <span className="text-xl font-extrabold text-orange-600 tracking-[0.3em]">{word.slice(0, i + 1)}</span>
            ) : i === row ? (
              <span className="text-xl font-extrabold text-gray-400 tracking-[0.3em]">
                {'_ '.repeat(i + 1).trim()}
              </span>
            ) : (
              <span className="text-xl font-extrabold text-gray-200 tracking-[0.3em]">{'· '.repeat(i + 1).trim()}</span>
            )}
          </div>
        ))}
      </div>
      <BigFeedback status={status} />
      <p className="text-gray-600 font-semibold mb-2">Type the first <span className="text-indigo-600 font-extrabold">{row + 1}</span> letter{row > 0 ? 's' : ''}:</p>
      <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} placeholder={`${row + 1} letter${row > 0 ? 's' : ''}…`} />
    </div>
  );
};

/* ═══════════════════ 5. Word Unscramble 🔀 ═══════════════════ */

const scrambleWord = (word) => {
  const letters = [...word];
  if (letters.length < 2) return letters;
  let attempt = shuffle(letters);
  let tries = 0;
  while (attempt.join('') === word && tries < 10) {
    attempt = shuffle(letters);
    tries++;
  }
  return attempt;
};

const WordUnscramble = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 10), [words]);
  const [index, setIndex] = useState(0);
  const [tiles, setTiles] = useState(() => scrambleWord(list[0] || '').map((ch, i) => ({ ch, id: i, used: false })));
  const [answer, setAnswer] = useState([]);
  const [status, setStatus] = useState(null);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);

  const word = list[index];

  useEffect(() => {
    if (!word) return;
    setTiles(scrambleWord(word).map((ch, i) => ({ ch, id: i, used: false })));
    setAnswer([]);
    setHint(false);
  }, [index, word]);

  useEffect(() => {
    if (!word || answer.length !== [...word].length) return;
    const built = answer.map(t => t.ch).join('');
    if (built.toLowerCase() === word.toLowerCase()) {
      setStatus('correct');
      setTimeout(() => {
        setStatus(null);
        if (index + 1 >= list.length) {
          setDone(true);
          onComplete();
        } else {
          setIndex(i => i + 1);
        }
      }, 700);
    } else {
      setStatus('wrong');
      setTimeout(() => {
        setStatus(null);
        setAnswer([]);
        setTiles(prev => prev.map(t => ({ ...t, used: false })));
      }, 900);
    }
  }, [answer, word, index, list.length, onComplete]);

  const pickTile = (tile) => {
    if (tile.used || status) return;
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: true } : t));
    setAnswer(prev => [...prev, tile]);
  };

  const undoTile = (i) => {
    if (status) return;
    const tile = answer[i];
    setAnswer(prev => prev.filter((_, idx) => idx !== i));
    setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, used: false } : t));
  };

  if (done) return <CelebrationPanel title="Unscramble Genius! 🔀" subtitle={`You untangled all ${list.length} mixed-up words!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">The letters got mixed up! Tap them in the right order.</p>
      <ProgressPills total={list.length} current={index} />
      <div className="flex justify-center gap-1.5 flex-wrap mb-4 min-h-[3.5rem]">
        {[...word].map((_, i) => (
          <button
            key={i}
            onClick={() => i < answer.length && undoTile(i)}
            className={`w-11 h-12 rounded-xl border-2 text-2xl font-extrabold flex items-center justify-center transition-all ${
              status === 'correct' ? 'bg-green-100 border-green-400 text-green-700' :
              status === 'wrong' ? 'bg-red-100 border-red-300 text-red-600' :
              i < answer.length ? 'bg-indigo-100 border-indigo-400 text-indigo-700 hover:bg-red-50' : 'bg-white border-dashed border-gray-300 text-gray-300'
            }`}
          >
            {answer[i] ? answer[i].ch : ''}
          </button>
        ))}
      </div>
      <BigFeedback status={status} />
      <div className="flex justify-center gap-2 flex-wrap mb-4">
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => pickTile(tile)}
            disabled={tile.used}
            className={`w-12 h-13 py-3 rounded-xl border-2 text-2xl font-extrabold transition-all ${
              tile.used
                ? 'bg-gray-100 border-gray-200 text-gray-200'
                : 'bg-gradient-to-b from-yellow-100 to-amber-200 border-amber-400 text-amber-800 hover:scale-110 shadow-sm'
            }`}
          >
            {tile.ch}
          </button>
        ))}
      </div>
      <button
        onClick={() => setHint(true)}
        disabled={hint}
        className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 disabled:text-gray-400"
      >
        {hint ? `💡 Hint: starts with "${word[0]}"` : '💡 Need a hint?'}
      </button>
    </div>
  );
};

/* ═══════════════════ 6. Missing Letters 🕳️ ═══════════════════ */

const maskWord = (word) => {
  const letters = [...word];
  const indexes = letters.map((ch, i) => (/[a-zA-Z]/.test(ch) && i !== 0 ? i : null)).filter(i => i !== null);
  const hideCount = Math.max(1, Math.round(indexes.length * 0.45));
  const hidden = new Set(shuffle(indexes).slice(0, hideCount));
  return letters.map((ch, i) => (hidden.has(i) ? '_' : ch)).join('');
};

const MissingLetters = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 10), [words]);
  const [index, setIndex] = useState(0);
  const [masked, setMasked] = useState(() => (list[0] ? maskWord(list[0]) : ''));
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState(null);
  const [done, setDone] = useState(false);

  const word = list[index];

  useEffect(() => {
    if (word) setMasked(maskWord(word));
    setTyped('');
  }, [index, word]);

  const submit = () => {
    if (same(typed, word)) {
      setStatus('correct');
      setTimeout(() => {
        setStatus(null);
        if (index + 1 >= list.length) {
          setDone(true);
          onComplete();
        } else {
          setIndex(i => i + 1);
        }
      }, 700);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 900);
    }
  };

  if (done) return <CelebrationPanel title="Letter Detective! 🕳️" subtitle={`You repaired all ${list.length} broken words!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Some letters fell out! Type the complete word.</p>
      <ProgressPills total={list.length} current={index} />
      <div className="bg-gradient-to-br from-cyan-50 to-blue-100 border-2 border-blue-200 rounded-2xl py-8 mb-4">
        <div className="text-5xl font-extrabold text-blue-700 tracking-[0.3em]">{masked}</div>
      </div>
      <BigFeedback status={status} />
      <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} placeholder="Type the whole word…" />
    </div>
  );
};

/* ═══════════════════ 7. Speed Spell ⏱️ ═══════════════════ */

const SpeedSpell = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 20), [words]);
  const goal = Math.min(list.length, 8);
  const [phase, setPhase] = useState('ready'); // ready | playing | finished
  const [timeLeft, setTimeLeft] = useState(60);
  const [queue, setQueue] = useState([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState(null);
  const completedRef = useRef(false);
  const timerRef = useRef(null);

  const start = () => {
    setQueue(shuffle(list));
    setScore(0);
    setTyped('');
    setTimeLeft(60);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const word = queue[0];

  const submit = () => {
    if (!word) return;
    if (same(typed, word)) {
      const newScore = score + 1;
      setScore(newScore);
      setTyped('');
      setStatus('correct');
      setTimeout(() => setStatus(null), 300);
      setQueue(q => q.slice(1).length ? q.slice(1) : shuffle(list));
      if (newScore >= goal) {
        clearInterval(timerRef.current);
        setPhase('finished');
      }
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 500);
    }
  };

  useEffect(() => {
    if (phase === 'finished' && score >= goal && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [phase, score, goal, onComplete]);

  if (phase === 'finished') {
    return score >= goal ? (
      <CelebrationPanel
        title="Lightning Speller! ⚡"
        subtitle={`You hit the goal with ${timeLeft} seconds to spare!`}
        stats={[{ value: score, label: 'Words spelled' }, { value: `${60 - timeLeft}s`, label: 'Time taken' }]}
        onExit={onExit}
      />
    ) : (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">⏰</div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-1">Time's up!</h3>
        <p className="text-gray-600 mb-4">You spelled <strong>{score}</strong> of {goal} words. So close — try again!</p>
        <button onClick={start} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">🔁 Try Again</button>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">⏱️</div>
        <h3 className="text-xl font-extrabold text-gray-800 mb-1">Speed Spell Challenge</h3>
        <p className="text-gray-600 mb-4">Spell <strong>{goal} words</strong> correctly before the 60-second timer runs out!</p>
        <button onClick={start} className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:scale-105 transition-transform">
          🚀 Start the Clock!
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className={`px-4 py-2 rounded-xl font-extrabold text-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-100 text-indigo-700'}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="px-4 py-2 rounded-xl font-extrabold text-xl bg-green-100 text-green-700">
          ⭐ {score}/{goal}
        </div>
      </div>
      <div className={`rounded-2xl py-6 mb-4 border-2 transition-colors ${status === 'correct' ? 'bg-green-50 border-green-300' : status === 'wrong' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-200'}`}>
        <div className="text-4xl font-extrabold text-gray-800 tracking-widest">{word}</div>
      </div>
      <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} placeholder="Quick — type it!" />
    </div>
  );
};

/* ═══════════════════ 8. Silly Sentences 😄 ═══════════════════ */

const SillySentences = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 4), [words]);
  const [index, setIndex] = useState(0);
  const [sentence, setSentence] = useState('');
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [finished, setFinished] = useState([]);

  const word = list[index];

  const submit = () => {
    const trimmed = sentence.trim();
    const wordRegex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (!wordRegex.test(trimmed)) {
      setError(`Your sentence needs to include the word "${word}"!`);
      return;
    }
    if (trimmed.split(/\s+/).length < 5) {
      setError('Make it longer — at least 5 words. The sillier the better! 🤪');
      return;
    }
    setError(null);
    setFinished(prev => [...prev, { word, sentence: trimmed }]);
    setSentence('');
    if (index + 1 >= list.length) {
      setDone(true);
      onComplete();
    } else {
      setIndex(i => i + 1);
    }
  };

  if (done) {
    return (
      <div>
        <CelebrationPanel title="Sentence Superstar! 😄" subtitle="Your silly sentences are complete!" onExit={onExit} />
        <div className="mt-2 space-y-2">
          {finished.map((f, i) => (
            <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-gray-700">
              <span className="font-bold text-green-700">{f.word}:</span> {f.sentence}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Write the <strong>silliest sentence</strong> you can using each word!</p>
      <ProgressPills total={list.length} current={index} />
      <div className="bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 rounded-2xl py-5 mb-4">
        <div className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-1">Your word is</div>
        <div className="text-4xl font-extrabold text-pink-600">{word}</div>
      </div>
      <textarea
        value={sentence}
        onChange={e => { setSentence(e.target.value); setError(null); }}
        placeholder={`e.g. "The dancing pineapple shouted ${word} at the moon!"`}
        rows={3}
        className="w-full border-2 border-pink-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 mb-2"
      />
      {error && <div className="text-red-500 font-semibold text-sm mb-2">⚠️ {error}</div>}
      <button
        onClick={submit}
        disabled={!sentence.trim()}
        className="px-6 py-3 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 disabled:opacity-40 transition"
      >
        Submit my silly sentence 🤪
      </button>
    </div>
  );
};

/* ═══════════════════ 9. Backwards Spelling 🔄 ═══════════════════ */

const BackwardsSpelling = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 8), [words]);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState(null);
  const [done, setDone] = useState(false);

  const word = list[index];
  const reversed = word ? [...word].reverse().join('') : '';

  const submit = () => {
    if (same(typed, reversed)) {
      setStatus('correct');
      setTimeout(() => {
        setStatus(null);
        setTyped('');
        if (index + 1 >= list.length) {
          setDone(true);
          onComplete();
        } else {
          setIndex(i => i + 1);
        }
      }, 700);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 900);
    }
  };

  if (done) return <CelebrationPanel title="!gnillepS gnizamA 🔄" subtitle={`You spelled all ${list.length} words backwards — tricky stuff!`} onExit={onExit} />;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Mirror mode! Type each word <strong>backwards</strong>.</p>
      <ProgressPills total={list.length} current={index} />
      <div className="bg-gradient-to-br from-violet-50 to-purple-100 border-2 border-purple-200 rounded-2xl py-8 mb-4 relative overflow-hidden">
        <div className="text-5xl font-extrabold text-purple-700 tracking-widest">{word}</div>
        <div className="text-xs font-bold text-purple-400 mt-2">e.g. "cat" becomes "tac"</div>
      </div>
      <BigFeedback status={status} />
      <SpellingInput value={typed} onChange={setTyped} onSubmit={submit} placeholder="Type it backwards…" />
    </div>
  );
};

/* ═══════════════════ 10. Word Detective 🕵️ ═══════════════════ */

const buildDetectiveQuestion = (word) => {
  const types = ['vowels', 'letters', 'position'];
  const type = types[Math.floor(Math.random() * types.length)];
  if (type === 'vowels') {
    return { prompt: `How many vowels (a, e, i, o, u) are in "${word}"?`, answer: String(countVowels(word)), kind: 'number' };
  }
  if (type === 'letters') {
    return { prompt: `How many letters are in "${word}"?`, answer: String(letterCount(word)), kind: 'number' };
  }
  const letters = [...word].filter(ch => /[a-zA-Z]/.test(ch));
  const pos = Math.floor(Math.random() * letters.length);
  const ordinal = n => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`);
  return { prompt: `What is the ${ordinal(pos + 1)} letter of "${word}"?`, answer: letters[pos].toLowerCase(), kind: 'letter' };
};

const WordDetective = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 6), [words]);
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(() => (list[0] ? buildDetectiveQuestion(list[0]) : null));
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [done, setDone] = useState(false);
  const CLUES_PER_WORD = 2;

  const word = list[index];

  const submit = () => {
    const guess = typed.trim().toLowerCase();
    if (guess === question.answer) {
      setStatus('correct');
      setTimeout(() => {
        setStatus(null);
        setTyped('');
        const nextSolved = solvedCount + 1;
        if (nextSolved >= CLUES_PER_WORD) {
          if (index + 1 >= list.length) {
            setDone(true);
            onComplete();
          } else {
            setIndex(i => i + 1);
            setSolvedCount(0);
            setQuestion(buildDetectiveQuestion(list[index + 1]));
          }
        } else {
          setSolvedCount(nextSolved);
          setQuestion(buildDetectiveQuestion(word));
        }
      }, 700);
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus(null), 900);
    }
  };

  if (done) return <CelebrationPanel title="Case Closed, Detective! 🕵️" subtitle={`You investigated all ${list.length} words and cracked every clue!`} onExit={onExit} />;
  if (!question) return null;

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-1">Investigate each word and answer the clues!</p>
      <ProgressPills total={list.length} current={index} />
      <div className="bg-gradient-to-br from-slate-50 to-slate-200 border-2 border-slate-300 rounded-2xl py-6 px-4 mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">🔍 Under investigation · Clue {solvedCount + 1} of {CLUES_PER_WORD}</div>
        <div className="text-4xl font-extrabold text-slate-700 tracking-widest mb-3">{word}</div>
        <div className="text-lg font-bold text-slate-600 bg-white rounded-xl py-3 px-4 inline-block shadow-sm">🕵️ {question.prompt}</div>
      </div>
      <BigFeedback status={status} />
      <SpellingInput
        value={typed}
        onChange={setTyped}
        onSubmit={submit}
        placeholder={question.kind === 'number' ? 'Type a number…' : 'Type a letter…'}
      />
    </div>
  );
};

/* ═══════════════════ 11. Memory Match 🃏 ═══════════════════ */

const MemoryMatch = ({ words, onComplete, onExit }) => {
  const list = useMemo(() => pickWords(words, 8), [words]);
  const [cards, setCards] = useState(() =>
    shuffle(list.flatMap(w => [{ word: w, key: `${w}-a` }, { word: w, key: `${w}-b` }]))
  );
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (list.length > 0 && matched.size === list.length && !done) {
      setDone(true);
      onComplete();
    }
  }, [matched, list.length, done, onComplete]);

  const flip = (card) => {
    if (lockRef.current || matched.has(card.word) || flipped.some(f => f.key === card.key)) return;
    const next = [...flipped, card];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      lockRef.current = true;
      if (next[0].word === next[1].word) {
        setTimeout(() => {
          setMatched(prev => new Set([...prev, next[0].word]));
          setFlipped([]);
          lockRef.current = false;
        }, 500);
      } else {
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 900);
      }
    }
  };

  if (done) {
    return (
      <CelebrationPanel
        title="Memory Master! 🃏"
        subtitle="You found every matching pair!"
        stats={[{ value: list.length, label: 'Pairs found' }, { value: moves, label: 'Moves used' }]}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-600 mb-3">Find the matching pairs of spelling words! <span className="font-bold text-indigo-600">Moves: {moves}</span></p>
      <div className={`grid gap-2 ${cards.length <= 12 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-4'}`}>
        {cards.map(card => {
          const isUp = matched.has(card.word) || flipped.some(f => f.key === card.key);
          return (
            <button
              key={card.key}
              onClick={() => flip(card)}
              className={`h-16 sm:h-20 rounded-xl border-2 font-extrabold text-xs sm:text-sm px-1 transition-all duration-300 ${
                matched.has(card.word)
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : isUp
                    ? 'bg-white border-indigo-400 text-indigo-700 scale-105 shadow'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-600 text-white hover:scale-105'
              }`}
            >
              {isUp ? card.word : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════ Activity registry ═══════════════════ */

export const INTERACTIVE_ACTIVITIES = [
  { id: 'rainbow_words', name: 'Rainbow Words', icon: '🌈', tagline: 'Type words in magic colours', gradient: 'from-red-400 via-yellow-400 to-purple-500', component: RainbowWords },
  { id: 'look_cover_write', name: 'Look, Cover, Write, Check', icon: '👀', tagline: 'Spell from memory', gradient: 'from-blue-400 to-indigo-600', component: LookCoverWriteCheck },
  { id: 'word_sorting', name: 'Word Sorting', icon: '📊', tagline: 'Sort words into groups', gradient: 'from-orange-400 to-amber-500', component: WordSorting },
  { id: 'spelling_pyramid', name: 'Pyramid Builder', icon: '🔺', tagline: 'Build words brick by brick', gradient: 'from-yellow-400 to-orange-500', component: PyramidBuilder },
  { id: 'word_unscramble', name: 'Word Unscramble', icon: '🔀', tagline: 'Untangle the mixed-up letters', gradient: 'from-amber-400 to-yellow-600', component: WordUnscramble },
  { id: 'missing_letters', name: 'Missing Letters', icon: '🕳️', tagline: 'Fix the broken words', gradient: 'from-cyan-400 to-blue-500', component: MissingLetters },
  { id: 'speed_spell', name: 'Speed Spell', icon: '⏱️', tagline: 'Beat the 60-second clock', gradient: 'from-orange-500 to-red-500', component: SpeedSpell },
  { id: 'silly_sentences', name: 'Silly Sentences', icon: '😄', tagline: 'Write wacky sentences', gradient: 'from-pink-400 to-rose-500', component: SillySentences },
  { id: 'backwards_spelling', name: 'Backwards Spelling', icon: '🔄', tagline: 'Spell words in reverse', gradient: 'from-violet-400 to-purple-600', component: BackwardsSpelling },
  { id: 'word_detective', name: 'Word Detective', icon: '🕵️', tagline: 'Crack the word clues', gradient: 'from-slate-500 to-slate-700', component: WordDetective },
  { id: 'memory_match', name: 'Memory Match', icon: '🃏', tagline: 'Find the word pairs', gradient: 'from-indigo-500 to-purple-600', component: MemoryMatch }
]