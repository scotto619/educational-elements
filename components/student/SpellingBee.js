// components/student/SpellingBee.js
// 🐝 Audio Spelling Bee — a REAL spelling test. The browser speaks each word
// aloud (SpeechSynthesis) and the student types it with the word hidden.
// Renders as modal content; parent handles opening/closing and saving results.
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

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

// Homophone / easily-confused lists can't be tested by audio alone —
// "cheque" and "check" sound identical.
export const isBeeCompatible = (list) =>
  !/homophone|often confused/i.test(`${list?.name || ''} ${list?.feature || ''}`);

export const getStars = (score, total) => {
  if (!total) return 0;
  const pct = score / total;
  if (pct >= 1) return 3;
  if (pct >= 0.8) return 2;
  if (pct >= 0.6) return 1;
  return 0;
};

export const BEE_PASS_PERCENT = 0.8;

const SpellingBee = ({ list, previousBest, onFinished, onExit }) => {
  const words = useMemo(() => shuffle((list?.words || []).map(cleanWord).filter(Boolean)), [list]);
  const [phase, setPhase] = useState('intro'); // intro | testing | reveal | results
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState(null); // { correct, word, typed }
  const [wrongWords, setWrongWords] = useState([]);
  const [ttsReady, setTtsReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);
  const reportedRef = useRef(false);

  const total = words.length;
  const word = words[index];

  // ── Speech setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      voiceRef.current =
        voices.find(v => v.lang === 'en-AU') ||
        voices.find(v => (v.lang || '').startsWith('en-GB')) ||
        voices.find(v => (v.lang || '').startsWith('en')) ||
        voices[0];
      setTtsReady(true);
    };

    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text, rate = 0.85) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    if (voiceRef.current) utterance.voice = voiceRef.current;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakCurrentWord = useCallback((rate = 0.85, withPreamble = false) => {
    if (!word) return;
    speak(withPreamble ? `Your word is: ${word}. ${word}.` : word, rate);
  }, [word, speak]);

  // Speak each new word automatically during the test
  useEffect(() => {
    if (phase === 'testing') {
      const timer = setTimeout(() => speakCurrentWord(0.85, true), 350);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase, index, speakCurrentWord]);

  // Report results to parent exactly once
  useEffect(() => {
    if (phase === 'results' && !reportedRef.current) {
      reportedRef.current = true;
      if (onFinished) {
        onFinished({
          listId: list.id,
          score,
          total,
          percent: total ? Math.round((score / total) * 100) : 0,
          stars: getStars(score, total),
          passed: total > 0 && score / total >= BEE_PASS_PERCENT,
          wrongWords
        });
      }
    }
  }, [phase, score, total, wrongWords, list, onFinished]);

  const startTest = () => {
    reportedRef.current = false;
    setIndex(0);
    setScore(0);
    setWrongWords([]);
    setTyped('');
    setLastResult(null);
    setPhase('testing');
  };

  const submit = () => {
    if (!typed.trim() || !word) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    const correct = same(typed, word);
    setLastResult({ correct, word, typed: typed.trim() });
    if (correct) {
      setScore(s => s + 1);
    } else {
      setWrongWords(prev => [...prev, word]);
    }
    setTyped('');
    setPhase('reveal');
  };

  const nextWord = () => {
    if (index + 1 >= total) {
      setPhase('results');
    } else {
      setIndex(i => i + 1);
      setPhase('testing');
    }
  };

  // Auto-advance after a short pause on the reveal screen
  useEffect(() => {
    if (phase !== 'reveal') return undefined;
    const timer = setTimeout(nextWord, lastResult?.correct ? 1100 : 2600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const ttsSupported = typeof window !== 'undefined' && !!window.speechSynthesis;

  /* ── INTRO ── */
  if (phase === 'intro') {
    return (
      <div className="text-center py-4">
        <div className="text-6xl mb-3">🐝</div>
        <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Spelling Bee Challenge</h3>
        <p className="text-gray-600 mb-1">
          I'll <strong>say each word out loud</strong> — you type it. No peeking, this is the real test!
        </p>
        <p className="text-sm text-gray-500 mb-4">{total} words · pass with {Math.round(BEE_PASS_PERCENT * 100)}% · 3 stars for a perfect round</p>
        {previousBest ? (
          <div className="inline-block bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mb-4">
            <span className="text-sm font-bold text-amber-700">
              🏅 Your best: {previousBest.best}/{previousBest.total} {'⭐'.repeat(previousBest.stars || 0)}
            </span>
          </div>
        ) : null}
        {!ttsSupported ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 font-semibold text-sm">
            😢 Your browser can't speak words aloud. Try Chrome, Edge or Safari to play the Spelling Bee.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => speak('Hello! I will be your spelling bee announcer today. Good luck!')}
              className="px-5 py-2.5 rounded-xl font-bold border-2 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
            >
              🔊 Test the voice
            </button>
            <button
              onClick={startTest}
              disabled={!ttsReady && !ttsSupported}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg font-extrabold rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              🐝 Start the Bee!
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ── TESTING ── */
  if (phase === 'testing') {
    return (
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-4">
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-700 font-extrabold text-sm">Word {index + 1} of {total}</span>
          <span className="px-3 py-1.5 rounded-xl bg-green-100 text-green-700 font-extrabold text-sm">✓ {score}</span>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200 rounded-2xl py-8 px-4 mb-4">
          <div className={`text-6xl mb-3 transition-transform ${speaking ? 'animate-bounce' : ''}`}>🐝</div>
          <p className="text-amber-700 font-bold mb-4">Listen carefully… then type the word!</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => speakCurrentWord(0.85)}
              className="px-4 py-2 rounded-xl font-bold bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition"
            >
              🔊 Say it again
            </button>
            <button
              onClick={() => speakCurrentWord(0.5)}
              className="px-4 py-2 rounded-xl font-bold bg-white border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition"
            >
              🐢 Say it slowly
            </button>
          </div>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); submit(); }}
          className="flex flex-col sm:flex-row gap-2 justify-center items-stretch"
        >
          <input
            type="text"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            placeholder="Type what you heard…"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            className="border-2 border-amber-300 rounded-xl px-4 py-3 text-lg text-center font-bold tracking-wider focus:outline-none focus:ring-4 focus:ring-amber-200 focus:border-amber-500 w-full sm:w-72"
          />
          <button
            type="submit"
            disabled={!typed.trim()}
            className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-40 transition"
          >
            Submit ✔
          </button>
        </form>
      </div>
    );
  }

  /* ── REVEAL (between words) ── */
  if (phase === 'reveal' && lastResult) {
    return (
      <div className="text-center py-8">
        {lastResult.correct ? (
          <>
            <div className="text-6xl mb-3">✅</div>
            <h3 className="text-2xl font-extrabold text-green-600 mb-1">Correct!</h3>
            <p className="text-xl font-bold text-gray-700 tracking-widest">{lastResult.word}</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-3">❌</div>
            <h3 className="text-xl font-extrabold text-red-500 mb-3">Not quite…</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              <div>
                <div className="text-xs text-gray-500 font-semibold">You typed</div>
                <div className="text-xl font-extrabold text-red-500 line-through">{lastResult.typed}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-semibold">Correct spelling</div>
                <div className="text-xl font-extrabold text-green-600 tracking-widest">{lastResult.word}</div>
              </div>
            </div>
          </>
        )}
        <button onClick={nextWord} className="mt-6 px-6 py-2.5 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 transition">
          {index + 1 >= total ? 'See my results →' : 'Next word →'}
        </button>
      </div>
    );
  }

  /* ── RESULTS ── */
  const stars = getStars(score, total);
  const passed = total > 0 && score / total >= BEE_PASS_PERCENT;
  return (
    <div className="text-center py-4">
      <div className="text-6xl mb-2">{stars === 3 ? '🏆' : passed ? '🎉' : '🐝'}</div>
      <h3 className="text-2xl font-extrabold text-gray-800 mb-1">
        {stars === 3 ? 'PERFECT ROUND!' : passed ? 'You passed the Bee!' : 'Good try — the Bee is tough!'}
      </h3>
      <div className="text-4xl my-3">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <div className="text-2xl font-extrabold text-amber-700">{score}/{total}</div>
          <div className="text-xs text-amber-500 font-semibold">Words correct</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3">
          <div className="text-2xl font-extrabold text-amber-700">{total ? Math.round((score / total) * 100) : 0}%</div>
          <div className="text-xs text-amber-500 font-semibold">Score</div>
        </div>
      </div>
      {wrongWords.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 max-w-md mx-auto">
          <div className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1.5">Words to practise</div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {wrongWords.map(w => (
              <span key={w} className="px-2.5 py-1 bg-white border border-red-200 rounded-lg text-sm font-bold text-red-600">{w}</span>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-center gap-3 flex-wrap">
        <button onClick={startTest} className="px-6 py-2.5 rounded-xl font-bold border-2 border-amber-300 bg-white text-amber-700 hover:bg-amber-50 transition">
          🔁 Try again
        </button>
        <button onClick={onExit} className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold rounded-xl shadow hover:scale-105 transition-transform">
          Done 🌟
        </button>
      </div>
    </div>
  );
};

export default SpellingBee;
