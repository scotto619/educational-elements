// components/curriculum/mathematics/NumbersBoard.js — Hundreds Board v2
// A modern, interactive hundreds board: pattern overlays (find common
// multiples!), animated skip counting, hide & reveal, free painting,
// a number detective panel, and built-in games including Number Hunt.
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';

// ── Number property helpers ──────────────────────────────────────────────────
const isPrime = (num) => {
  if (num < 2) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};
const isSquare = (num) => num > 0 && Number.isInteger(Math.sqrt(num));
const isCube = (num) => num > 0 && Math.abs(Math.cbrt(num) - Math.round(Math.cbrt(num))) < 1e-9;
const isTriangular = (num) => {
  if (num < 1) return false;
  const s = Math.sqrt(1 + 8 * num);
  return Number.isInteger(s) && (s - 1) % 2 === 0;
};
const isFib = (() => {
  const fibs = new Set();
  let a = 1, b = 1;
  while (a <= 1000) { fibs.add(a); [a, b] = [b, a + b]; }
  return (num) => fibs.has(num);
})();
const getFactors = (num) => {
  const f = [];
  for (let i = 1; i <= num; i++) if (num % i === 0) f.push(i);
  return f;
};
const digitSum = (num) => String(Math.abs(num)).split('').reduce((a, d) => a + Number(d), 0);

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ── Pattern definitions ──────────────────────────────────────────────────────
const PATTERNS = {
  even: { name: 'Even', test: (n) => n % 2 === 0 && n !== 0 },
  odd: { name: 'Odd', test: (n) => Math.abs(n % 2) === 1 },
  primes: { name: 'Primes', test: isPrime },
  squares: { name: 'Square numbers', test: isSquare },
  cubes: { name: 'Cube numbers', test: isCube },
  triangular: { name: 'Triangular', test: isTriangular },
  fibonacci: { name: 'Fibonacci', test: isFib },
};

// Slot colors for overlay: A, B, and the overlap
const SLOT_STYLES = {
  A: { cell: 'bg-sky-500 text-white border-sky-600', chip: 'bg-sky-500' },
  B: { cell: 'bg-amber-400 text-slate-900 border-amber-500', chip: 'bg-amber-400' },
  AB: { cell: 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300', chip: 'bg-emerald-500' },
};

const PAINT_COLORS = [
  { id: 'yellow', cls: 'bg-yellow-300 text-slate-900 border-yellow-400', swatch: 'bg-yellow-300' },
  { id: 'sky', cls: 'bg-sky-400 text-white border-sky-500', swatch: 'bg-sky-400' },
  { id: 'rose', cls: 'bg-rose-400 text-white border-rose-500', swatch: 'bg-rose-400' },
  { id: 'green', cls: 'bg-emerald-400 text-white border-emerald-500', swatch: 'bg-emerald-400' },
  { id: 'purple', cls: 'bg-violet-400 text-white border-violet-500', swatch: 'bg-violet-400' },
];

const RANGES = [
  { id: '1-100', start: 1, label: '1 – 100' },
  { id: '0-99', start: 0, label: '0 – 99' },
  { id: '101-200', start: 101, label: '101 – 200' },
  { id: '201-300', start: 201, label: '201 – 300' },
];

const TOOLS = [
  { id: 'explore', name: 'Explore', icon: '🔍' },
  { id: 'patterns', name: 'Patterns', icon: '🎨' },
  { id: 'skip', name: 'Skip Count', icon: '🔄' },
  { id: 'hide', name: 'Hide & Seek', icon: '🙈' },
  { id: 'paint', name: 'Paint', icon: '🖌️' },
  { id: 'games', name: 'Games', icon: '🎮' },
];

const NumbersBoard = ({ showToast = () => {}, students = [] }) => {
  // ── Core state ──
  const [tool, setTool] = useState('explore');
  const [rangeId, setRangeId] = useState('1-100');
  const [boardSize, setBoardSize] = useState('cozy');

  // Explore
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Patterns: two overlay slots
  const [patternA, setPatternA] = useState(null); // {key, value?, label}
  const [patternB, setPatternB] = useState(null);
  const [customMultipleA, setCustomMultipleA] = useState('');
  const [customMultipleB, setCustomMultipleB] = useState('');

  // Skip counting
  const [skipStep, setSkipStep] = useState(2);
  const [skipStart, setSkipStart] = useState('');
  const [skipSpeed, setSkipSpeed] = useState(600); // ms per step
  const [skipSeq, setSkipSeq] = useState([]); // revealed so far
  const [skipPlaying, setSkipPlaying] = useState(false);
  const skipTimerRef = useRef(null);
  const skipIndexRef = useRef(0);
  const skipFullSeqRef = useRef([]);

  // Hide & seek
  const [hiddenSet, setHiddenSet] = useState(new Set());
  const [revealedSet, setRevealedSet] = useState(new Set());

  // Paint
  const [paintColor, setPaintColor] = useState('yellow'); // color id or 'eraser'
  const [paintMap, setPaintMap] = useState({}); // num -> color id
  const paintingRef = useRef(false);

  // Games
  const [game, setGame] = useState(null); // {type, ...}
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [gameMistakes, setGameMistakes] = useState(0);
  const [gameFlash, setGameFlash] = useState(null); // {num, ok}
  const [elapsed, setElapsed] = useState(0);
  const gameTimerRef = useRef(null);

  // ── Range / board numbers ──
  const range = RANGES.find((r) => r.id === rangeId) || RANGES[0];
  const numbers = useMemo(() => Array.from({ length: 100 }, (_, i) => range.start + i), [range.start]);
  const inRange = useCallback((n) => n >= range.start && n <= range.start + 99, [range.start]);

  // ── Pattern sets ──
  const computePattern = useCallback(
    (slot) => {
      if (!slot) return new Set();
      if (slot.key === 'multiples') return new Set(numbers.filter((n) => n !== 0 && n % slot.value === 0));
      const def = PATTERNS[slot.key];
      return def ? new Set(numbers.filter(def.test)) : new Set();
    },
    [numbers]
  );
  const setA = useMemo(() => computePattern(patternA), [computePattern, patternA]);
  const setB = useMemo(() => computePattern(patternB), [computePattern, patternB]);
  const overlapCount = useMemo(() => [...setA].filter((n) => setB.has(n)).length, [setA, setB]);

  const choosePattern = (slot, key, value = null) => {
    const label = key === 'multiples' ? `Multiples of ${value}` : PATTERNS[key].name;
    const next = { key, value, label };
    if (slot === 'A') setPatternA((prev) => (prev && prev.key === key && prev.value === value ? null : next));
    else setPatternB((prev) => (prev && prev.key === key && prev.value === value ? null : next));
  };

  // ── Skip counting ──
  const stopSkip = useCallback(() => {
    clearInterval(skipTimerRef.current);
    setSkipPlaying(false);
  }, []);

  const buildSkipSeq = useCallback(() => {
    const startVal = skipStart === '' ? null : parseInt(skipStart, 10);
    const first = startVal !== null && !Number.isNaN(startVal) && inRange(startVal)
      ? startVal
      : (range.start === 0 ? skipStep : range.start - 1 + skipStep);
    const seq = [];
    for (let n = first; n <= range.start + 99; n += skipStep) {
      if (n >= range.start) seq.push(n);
    }
    return seq;
  }, [skipStart, skipStep, range.start, inRange]);

  const playSkip = () => {
    stopSkip();
    const full = buildSkipSeq();
    if (!full.length) return;
    skipFullSeqRef.current = full;
    skipIndexRef.current = 0;
    setSkipSeq([]);
    setSkipPlaying(true);
    skipTimerRef.current = setInterval(() => {
      const i = skipIndexRef.current;
      if (i >= skipFullSeqRef.current.length) {
        stopSkip();
        return;
      }
      skipIndexRef.current = i + 1;
      setSkipSeq(skipFullSeqRef.current.slice(0, i + 1));
    }, skipSpeed);
  };

  const showSkipAll = () => {
    stopSkip();
    setSkipSeq(buildSkipSeq());
  };

  useEffect(() => () => { clearInterval(skipTimerRef.current); clearInterval(gameTimerRef.current); }, []);
  useEffect(() => { stopSkip(); setSkipSeq([]); }, [rangeId, stopSkip]);

  const skipSet = useMemo(() => new Set(skipSeq), [skipSeq]);
  const skipCurrent = skipSeq.length ? skipSeq[skipSeq.length - 1] : null;

  // ── Hide & seek ──
  const hideRandom = (count) => {
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setHiddenSet(new Set(shuffled.slice(0, count)));
    setRevealedSet(new Set());
  };
  const hideAll = () => { setHiddenSet(new Set(numbers)); setRevealedSet(new Set()); };
  const showAllHidden = () => { setHiddenSet(new Set()); setRevealedSet(new Set()); };

  // ── Games ──
  const stopGameTimer = () => clearInterval(gameTimerRef.current);
  const startGameTimer = () => {
    stopGameTimer();
    setElapsed(0);
    gameTimerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
  };

  const makeHuntQuestion = useCallback(() => {
    const ops = [
      { d: 1, text: '1 more than' }, { d: -1, text: '1 less than' },
      { d: 10, text: '10 more than' }, { d: -10, text: '10 less than' },
      { d: 11, text: '11 more than' }, { d: -11, text: '11 less than' },
      { d: 9, text: '9 more than' }, { d: -9, text: '9 less than' },
      { d: 20, text: '20 more than' }, { d: -20, text: '20 less than' },
    ];
    for (let tries = 0; tries < 50; tries++) {
      const op = ops[randInt(0, ops.length - 1)];
      const base = numbers[randInt(0, 99)];
      const target = base + op.d;
      if (inRange(target)) return { text: `Find the number that is ${op.text} ${base}`, target };
    }
    return { text: `Find the number ${numbers[50]}`, target: numbers[50] };
  }, [numbers, inRange]);

  const startGame = (type) => {
    setGameScore(0);
    setGameStreak(0);
    setGameMistakes(0);
    setGameFlash(null);
    startGameTimer();
    if (type === 'hunt') {
      setGame({ type, qNum: 1, total: 10, question: makeHuntQuestion() });
    } else if (type === 'multiples') {
      const m = randInt(2, 9);
      setGame({ type, m, target: new Set(numbers.filter((n) => n !== 0 && n % m === 0)), found: new Set() });
    } else if (type === 'primes') {
      setGame({ type, target: new Set(numbers.filter(isPrime)), found: new Set() });
    }
  };

  const endGame = (message) => {
    stopGameTimer();
    setGame(null);
    if (message) showToast(message, 'success');
  };

  const flashCell = (num, ok) => {
    setGameFlash({ num, ok });
    setTimeout(() => setGameFlash(null), 450);
  };

  const handleGameClick = (num) => {
    if (!game) return;
    if (game.type === 'hunt') {
      if (num === game.question.target) {
        const pts = 10 + gameStreak * 2;
        setGameScore((s) => s + pts);
        setGameStreak((s) => s + 1);
        flashCell(num, true);
        if (game.qNum >= game.total) {
          endGame(`🏹 Number Hunt complete! Score: ${gameScore + pts} in ${elapsed}s`);
        } else {
          setTimeout(() => setGame((g) => g && { ...g, qNum: g.qNum + 1, question: makeHuntQuestion() }), 350);
        }
      } else {
        setGameStreak(0);
        setGameMistakes((m) => m + 1);
        flashCell(num, false);
      }
      return;
    }
    // find-all games
    if (game.target.has(num) && !game.found.has(num)) {
      const newFound = new Set(game.found);
      newFound.add(num);
      setGame({ ...game, found: newFound });
      setGameScore((s) => s + 10);
      setGameStreak((s) => s + 1);
      flashCell(num, true);
      if (newFound.size === game.target.size) {
        const acc = Math.round((newFound.size / (newFound.size + gameMistakes)) * 100);
        endGame(`🎉 All found in ${elapsed}s with ${acc}% accuracy!`);
      }
    } else if (!game.target.has(num)) {
      setGameScore((s) => Math.max(0, s - 5));
      setGameStreak(0);
      setGameMistakes((m) => m + 1);
      flashCell(num, false);
    }
  };

  // ── Cell click routing ──
  const handleCellClick = (num) => {
    if (game) { handleGameClick(num); return; }
    if (tool === 'hide') {
      if (hiddenSet.has(num) && !revealedSet.has(num)) {
        setRevealedSet((prev) => new Set(prev).add(num));
      }
      return;
    }
    if (tool === 'paint') {
      paintCell(num);
      return;
    }
    setSelectedNumber((prev) => (prev === num ? null : num));
  };

  const paintCell = (num) => {
    setPaintMap((prev) => {
      const next = { ...prev };
      if (paintColor === 'eraser') delete next[num];
      else next[num] = paintColor;
      return next;
    });
  };

  // ── Cell styling ──
  const sizeClass = boardSize === 'focus' ? 'text-lg sm:text-2xl' : boardSize === 'comfy' ? 'text-base sm:text-xl' : 'text-sm sm:text-lg';

  const getCellClass = (num) => {
    const base = `${sizeClass} font-bold rounded-lg flex items-center justify-center transition-all duration-150 border-2 select-none`;

    // Game flash takes priority
    if (gameFlash?.num === num) {
      return `${base} ${gameFlash.ok ? 'bg-emerald-500 text-white border-emerald-600 scale-110' : 'bg-rose-500 text-white border-rose-600 animate-pulse'}`;
    }
    if (game && game.found?.has?.(num)) {
      return `${base} bg-emerald-500 text-white border-emerald-600`;
    }

    // Hidden cells
    if (tool === 'hide' || hiddenSet.size > 0) {
      if (hiddenSet.has(num) && !revealedSet.has(num)) {
        return `${base} bg-slate-300 text-slate-300 border-slate-400 hover:bg-slate-200 cursor-pointer`;
      }
      if (revealedSet.has(num)) {
        return `${base} bg-emerald-100 text-emerald-800 border-emerald-300`;
      }
    }

    // Paint
    const painted = paintMap[num];
    if (painted) {
      const pc = PAINT_COLORS.find((c) => c.id === painted);
      if (pc) return `${base} ${pc.cls}`;
    }

    // Skip counting
    if (skipSet.has(num)) {
      return `${base} ${num === skipCurrent ? 'bg-fuchsia-500 text-white border-fuchsia-600 scale-110 shadow-lg' : 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-300'}`;
    }

    // Pattern overlays
    const inA = setA.has(num);
    const inB = setB.has(num);
    if (inA && inB) return `${base} ${SLOT_STYLES.AB.cell}`;
    if (inA) return `${base} ${SLOT_STYLES.A.cell}`;
    if (inB) return `${base} ${SLOT_STYLES.B.cell}`;

    // Selection
    if (selectedNumber === num) {
      return `${base} bg-indigo-600 text-white border-indigo-700 scale-105 shadow-lg`;
    }

    return `${base} bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50`;
  };

  const clearBoard = () => {
    setPatternA(null);
    setPatternB(null);
    setSelectedNumber(null);
    setSkipSeq([]);
    stopSkip();
    setHiddenSet(new Set());
    setRevealedSet(new Set());
    setPaintMap({});
    setGame(null);
    stopGameTimer();
  };

  // ── Detective facts for a selected number ──
  const detective = useMemo(() => {
    const n = selectedNumber;
    if (n === null) return null;
    const factors = n > 0 ? getFactors(n) : [];
    const props = [];
    if (n !== 0) props.push(n % 2 === 0 ? 'Even' : 'Odd');
    if (isPrime(n)) props.push('Prime');
    else if (n > 1) props.push('Composite');
    if (isSquare(n)) props.push(`Square (${Math.sqrt(n)}²)`);
    if (isCube(n)) props.push(`Cube (${Math.round(Math.cbrt(n))}³)`);
    if (isTriangular(n)) props.push('Triangular');
    if (isFib(n)) props.push('Fibonacci');
    return {
      n,
      props,
      factors,
      digitSum: digitSum(n),
      neighbors: [
        { label: '−10', value: n - 10 }, { label: '−1', value: n - 1 },
        { label: '+1', value: n + 1 }, { label: '+10', value: n + 10 },
      ].filter((x) => inRange(x.value)),
      multiples: n > 0 ? Array.from({ length: 5 }, (_, i) => n * (i + 1)) : [],
    };
  }, [selectedNumber, inRange]);

  // ── Pattern picker UI (shared by slot A and B) ──
  const PatternPicker = ({ slot, active, customValue, setCustomValue }) => (
    <div className="flex-1 min-w-[240px]">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-3.5 h-3.5 rounded-full ${SLOT_STYLES[slot].chip}`}></span>
        <span className="text-sm font-bold text-slate-700">Pattern {slot}</span>
        {active && (
          <button
            onClick={() => (slot === 'A' ? setPatternA(null) : setPatternB(null))}
            className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
          >
            ✕ clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(PATTERNS).map(([key, def]) => {
          const isOn = active?.key === key;
          return (
            <button
              key={key}
              onClick={() => choosePattern(slot, key)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isOn ? `${SLOT_STYLES[slot].chip} text-white border-transparent shadow` : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {def.name}
            </button>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-2">
        <input
          type="number" min="2" max="50" value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Multiples of…"
          className="w-28 px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button
          onClick={() => {
            const v = parseInt(customValue, 10);
            if (v >= 2) { choosePattern(slot, 'multiples', v); setCustomValue(''); }
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white ${SLOT_STYLES[slot].chip} hover:opacity-90`}
        >
          Go
        </button>
      </div>
    </div>
  );

  // ── Tool panels ──
  const renderToolPanel = () => {
    switch (tool) {
      case 'explore':
        return (
          <div className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
            <span className="text-xl">🔍</span>
            <span>Click any number to open the <strong>Number Detective</strong> — factors, properties, and board neighbours.</span>
          </div>
        );

      case 'patterns':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-6">
              <PatternPicker slot="A" active={patternA} customValue={customMultipleA} setCustomValue={setCustomMultipleA} />
              <PatternPicker slot="B" active={patternB} customValue={customMultipleB} setCustomValue={setCustomMultipleB} />
            </div>
            {(patternA || patternB) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                {patternA && (
                  <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>{patternA.label} ({setA.size})
                  </span>
                )}
                {patternB && (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>{patternB.label} ({setB.size})
                  </span>
                )}
                {patternA && patternB && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Both! ({overlapCount}) {patternA.key === 'multiples' && patternB.key === 'multiples' ? '— common multiples!' : ''}
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-slate-400">💡 Tip: turn on TWO patterns to discover where they overlap — try multiples of 3 and multiples of 4!</p>
          </div>
        );

      case 'skip':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Count by</label>
                <div className="flex flex-wrap gap-1.5">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSkipStep(s)}
                      className={`w-9 h-9 rounded-lg text-sm font-bold border transition-all ${
                        skipStep === s ? 'bg-fuchsia-500 text-white border-fuchsia-600 shadow' : 'bg-white text-slate-600 border-slate-200 hover:border-fuchsia-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Start at (optional)</label>
                <input
                  type="number" value={skipStart}
                  onChange={(e) => setSkipStart(e.target.value)}
                  placeholder="auto"
                  className="w-24 px-2 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Speed</label>
                <select
                  value={skipSpeed}
                  onChange={(e) => setSkipSpeed(parseInt(e.target.value, 10))}
                  className="px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value={1000}>🐢 Slow</option>
                  <option value={600}>🚶 Medium</option>
                  <option value={300}>🏃 Fast</option>
                </select>
              </div>
              <div className="flex gap-2">
                {!skipPlaying ? (
                  <button onClick={playSkip} className="bg-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-fuchsia-600 shadow">
                    ▶ Play
                  </button>
                ) : (
                  <button onClick={stopSkip} className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700">
                    ⏸ Pause
                  </button>
                )}
                <button onClick={showSkipAll} className="bg-white border border-fuchsia-300 text-fuchsia-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-fuchsia-50">
                  Show all
                </button>
                <button onClick={() => { stopSkip(); setSkipSeq([]); }} className="bg-white border border-slate-200 text-slate-500 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">
                  Reset
                </button>
              </div>
            </div>
            {skipCurrent !== null && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-fuchsia-600">{skipCurrent}</span>
                <span className="text-sm text-slate-500">
                  {skipSeq.length} number{skipSeq.length === 1 ? '' : 's'} so far — say them out loud as they light up!
                </span>
              </div>
            )}
          </div>
        );

      case 'hide':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => hideRandom(10)} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">Hide 10</button>
              <button onClick={() => hideRandom(25)} className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">Hide 25</button>
              <button onClick={hideAll} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black">Hide everything</button>
              <button onClick={showAllHidden} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50">Show all</button>
            </div>
            <p className="text-xs text-slate-400">
              💡 Ask "what number is hiding here?" before clicking a grey square to reveal it. Hide everything for a memory challenge!
              {hiddenSet.size > 0 && ` (${hiddenSet.size - revealedSet.size} still hidden)`}
            </p>
          </div>
        );

      case 'paint':
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-600 mr-1">Brush:</span>
              {PAINT_COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPaintColor(c.id)}
                  className={`w-9 h-9 rounded-lg ${c.swatch} border-2 transition-all ${paintColor === c.id ? 'border-slate-800 scale-110 shadow' : 'border-transparent hover:scale-105'}`}
                  title={c.id}
                />
              ))}
              <button
                onClick={() => setPaintColor('eraser')}
                className={`w-9 h-9 rounded-lg bg-white border-2 flex items-center justify-center text-lg transition-all ${paintColor === 'eraser' ? 'border-slate-800 scale-110 shadow' : 'border-slate-300 hover:scale-105'}`}
                title="Eraser"
              >
                🧽
              </button>
              <button
                onClick={() => setPaintMap({})}
                className="ml-2 bg-white border border-slate-300 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-50"
              >
                Clear paint
              </button>
            </div>
            <p className="text-xs text-slate-400">💡 Click or drag across the board to paint. Great for marking your own patterns and puzzles!</p>
          </div>
        );

      case 'games':
        return game ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {game.type === 'hunt' ? (
                <>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-1 rounded-full">Q {game.qNum}/{game.total}</span>
                  <span className="text-base md:text-lg font-bold text-slate-800">🏹 {game.question.text}</span>
                </>
              ) : (
                <>
                  <span className="text-base md:text-lg font-bold text-slate-800">
                    {game.type === 'multiples' ? `✖️ Find all multiples of ${game.m}` : '🔮 Find all the prime numbers'}
                  </span>
                  <div className="w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(game.found.size / game.target.size) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{game.found.size}/{game.target.size}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="text-indigo-700">⭐ {gameScore}</span>
              {gameStreak > 1 && <span className="text-orange-500">🔥{gameStreak}</span>}
              <span className="text-slate-500">⏱ {elapsed}s</span>
              <button onClick={() => endGame()} className="bg-white border border-slate-300 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50">
                End
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => startGame('hunt')} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
              🏹 Number Hunt
              <span className="block text-[10px] font-normal opacity-80">10 more, 1 less…</span>
            </button>
            <button onClick={() => startGame('multiples')} className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
              ✖️ Find Multiples
              <span className="block text-[10px] font-normal opacity-80">race the clock</span>
            </button>
            <button onClick={() => startGame('primes')} className="bg-gradient-to-r from-violet-500 to-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:shadow-lg transition-all">
              🔮 Prime Detective
              <span className="block text-[10px] font-normal opacity-80">find every prime</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // ── Render ──
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-2xl md:text-4xl font-bold flex items-center">
              <span className="mr-3 text-3xl md:text-5xl">💯</span>
              Hundreds Board
            </h3>
            <p className="text-base md:text-lg opacity-90 mt-1">Patterns, skip counting, games & number detective work</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRangeId(r.id); clearBoard(); }}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition-all ${
                  rangeId === r.id ? 'bg-white text-teal-700 border-white shadow' : 'bg-white/15 text-white border-white/30 hover:bg-white/25'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 md:px-5 py-3 text-sm font-bold transition-all ${
                tool === t.id ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/60' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="hidden sm:inline">{t.name}</span>
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 px-3">
            {['cozy', 'comfy', 'focus'].map((s) => (
              <button
                key={s}
                onClick={() => setBoardSize(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  boardSize === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
              >
                {s === 'cozy' ? 'S' : s === 'comfy' ? 'M' : 'L'}
              </button>
            ))}
            <button
              onClick={clearBoard}
              className="ml-1 px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
            >
              Clear all
            </button>
          </div>
        </div>
        <div className="p-4">{renderToolPanel()}</div>
      </div>

      {/* Board */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
        <div
          className={`grid grid-cols-10 gap-1 md:gap-1.5 mx-auto ${boardSize === 'focus' ? 'max-w-5xl' : boardSize === 'comfy' ? 'max-w-4xl' : 'max-w-3xl'}`}
          onPointerDown={() => { if (tool === 'paint') paintingRef.current = true; }}
          onPointerUp={() => { paintingRef.current = false; }}
          onPointerLeave={() => { paintingRef.current = false; }}
        >
          {numbers.map((num) => {
            const hiddenNow = (tool === 'hide' || hiddenSet.size > 0) && hiddenSet.has(num) && !revealedSet.has(num);
            return (
              <button
                key={num}
                onClick={() => handleCellClick(num)}
                onPointerEnter={() => { if (tool === 'paint' && paintingRef.current) paintCell(num); }}
                className={`aspect-square hover:scale-105 active:scale-95 ${getCellClass(num)}`}
              >
                {hiddenNow ? '?' : num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Number Detective */}
      {detective && !game && tool === 'explore' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-5">
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl px-8 py-5 shadow">
              <div className="text-5xl font-black">{detective.n}</div>
              <div className="text-xs font-semibold opacity-80 mt-1">Number Detective 🕵️</div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-bold text-slate-700 mb-1.5">Properties</h5>
                <div className="flex flex-wrap gap-1.5">
                  {detective.props.length ? detective.props.map((p) => (
                    <span key={p} className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">{p}</span>
                  )) : <span className="text-slate-400 text-xs">Zero is a special number!</span>}
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">Digit sum: {detective.digitSum}</span>
                </div>
                {detective.factors.length > 0 && (
                  <p className="mt-2 text-slate-600">
                    <strong>{detective.factors.length} factor{detective.factors.length === 1 ? '' : 's'}:</strong>{' '}
                    {detective.factors.join(', ')}
                  </p>
                )}
                {detective.multiples.length > 0 && (
                  <p className="mt-1 text-slate-600">
                    <strong>First multiples:</strong> {detective.multiples.join(', ')}…
                  </p>
                )}
              </div>
              <div>
                <h5 className="font-bold text-slate-700 mb-1.5">Board neighbours</h5>
                <div className="flex flex-wrap gap-2">
                  {detective.neighbors.map((nb) => (
                    <button
                      key={nb.label}
                      onClick={() => setSelectedNumber(nb.value)}
                      className="bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl px-3 py-2 text-center transition-all"
                    >
                      <div className="text-lg font-black text-slate-800">{nb.value}</div>
                      <div className="text-[10px] font-bold text-slate-400">{nb.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">💡 Up/down a row = ±10, left/right = ±1. Click a neighbour to jump to it!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teaching tips */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-5">
        <h4 className="font-bold text-teal-800 mb-2 flex items-center"><span className="mr-2">💡</span>Classroom Ideas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-teal-800">
          <p>• Overlay multiples of 3 and 4, then ask: "what's special about the green numbers?"</p>
          <p>• Play skip counting slowly and have the class chant each number as it lights up.</p>
          <p>• Hide everything and ask students to find a number using only ±1/±10 moves.</p>
          <p>• Use Paint to build pattern puzzles for a partner to describe in words.</p>
        </div>
      </div>
    </div>
  );
};

export default NumbersBoard;
