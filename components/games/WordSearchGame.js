import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_THEMES = {
  animals:   { name: 'Animals',   emoji: '🦁', bg: 'from-amber-500 to-orange-600',   words: ['LION','TIGER','BEAR','ZEBRA','WOLF','EAGLE','SHARK','WHALE','SNAKE','FROG'] },
  space:     { name: 'Space',     emoji: '🚀', bg: 'from-indigo-500 to-purple-700',   words: ['STAR','PLANET','MOON','COMET','ORBIT','ROCKET','GALAXY','NEBULA','MARS','SUN'] },
  school:    { name: 'School',    emoji: '📚', bg: 'from-blue-500 to-cyan-600',       words: ['BOOK','DESK','PENCIL','RULER','PAPER','MATH','CLASS','TEST','STUDY','READ'] },
  fruit:     { name: 'Fruits',    emoji: '🍎', bg: 'from-green-500 to-emerald-600',   words: ['APPLE','BANANA','GRAPE','ORANGE','LEMON','LIME','MELON','BERRY','PEACH','PEAR'] },
  colors:    { name: 'Colors',    emoji: '🎨', bg: 'from-pink-500 to-rose-600',       words: ['RED','BLUE','GREEN','YELLOW','PINK','PURPLE','ORANGE','BLACK','WHITE','BROWN'] },
  countries: { name: 'Countries', emoji: '🌍', bg: 'from-teal-500 to-cyan-600',       words: ['USA','CANADA','CHINA','INDIA','BRAZIL','JAPAN','FRANCE','SPAIN','ITALY','EGYPT'] },
};

const DIFFICULTY_SETTINGS = {
  easy:   { size: 8,  directions: [[0,1],[1,0]],                                              label: 'Easy',   desc: '8×8 · H & V only',           coins: 2  },
  medium: { size: 12, directions: [[0,1],[1,0],[1,1],[1,-1]],                                 label: 'Medium', desc: '12×12 · + Diagonals',         coins: 5  },
  hard:   { size: 15, directions: [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]],   label: 'Hard',   desc: '15×15 · + Backwards',         coins: 10 },
};

// Bright highlight colours for found words — bg hex + matching dark text hex
const WORD_COLORS = [
  { bg: '#fbbf24', text: '#78350f' }, // amber
  { bg: '#f472b6', text: '#500724' }, // pink
  { bg: '#60a5fa', text: '#172554' }, // blue
  { bg: '#34d399', text: '#022c22' }, // emerald
  { bg: '#a78bfa', text: '#2e1065' }, // violet
  { bg: '#fb923c', text: '#431407' }, // orange
  { bg: '#2dd4bf', text: '#042f2e' }, // teal
  { bg: '#f87171', text: '#450a0a' }, // red
  { bg: '#818cf8', text: '#1e1b4b' }, // indigo
  { bg: '#a3e635', text: '#1a2e05' }, // lime
];

const fmt   = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
const stars = (s, n) => { const a = s / n; return a < 12 ? 3 : a < 28 ? 2 : 1; };

// ── Component ────────────────────────────────────────────────────────────────

const WordSearchGame = ({ showToast, user, classData, saveClassData, studentData, updateStudentData }) => {

  // Core game state
  const [gameState,  setGameState]  = useState('menu');   // menu | playing | won | printing
  const [grid,       setGrid]       = useState([]);
  const [words,      setWords]      = useState([]);
  const [foundData,  setFoundData]  = useState([]);       // { word, cells:[{r,c}], colorIdx }[]
  const [sel,        setSel]        = useState({ start: null, cells: [] });
  const [difficulty, setDifficulty] = useState('medium');
  const [themeId,    setThemeId]    = useState(null);

  // HUD
  const [timer,       setTimer]       = useState(0);
  const [streak,      setStreak]      = useState(0);
  const [lastFoundMs, setLastFoundMs] = useState(null);
  const [flashWord,   setFlashWord]   = useState(null);

  // Custom lists / teacher
  const [customLists,   setCustomLists]   = useState({});
  const [editingList,   setEditingList]   = useState(false);
  const [newListName,   setNewListName]   = useState('');
  const [newListWords,  setNewListWords]  = useState('');

  const gridRef = useRef(null);

  // Stable decorative star positions so they don't re-randomise on each render
  const starDots = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      left:  `${((i * 137.5) % 100).toFixed(1)}%`,
      top:   `${((i * 97.3)  % 100).toFixed(1)}%`,
      delay: `${((i * 0.4)   % 3).toFixed(1)}s`,
      size:  i % 5 === 0 ? 2 : 1,
    })), []
  );

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (classData?.wordSearchLists) setCustomLists(classData.wordSearchLists);
  }, [classData]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [gameState]);

  // Award daily coins when puzzle is won
  useEffect(() => {
    if (gameState !== 'won' || !studentData || !updateStudentData) return;
    const today = new Date().toISOString().split('T')[0];
    const last  = (studentData.gameProgress?.wordSearch?.lastRewardDate || '').split('T')[0];
    if (last !== today) {
      const coins = DIFFICULTY_SETTINGS[difficulty].coins;
      updateStudentData({
        currency: (studentData.currency || 0) + coins,
        gameProgress: {
          ...studentData.gameProgress,
          wordSearch: {
            ...(studentData.gameProgress?.wordSearch || {}),
            lastRewardDate: today,
          },
        },
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // ── Derived ────────────────────────────────────────────────────────────────

  const foundWords = useMemo(() => foundData.map(d => d.word), [foundData]);

  const foundCellMap = useMemo(() => {
    const m = new Map();
    foundData.forEach(({ cells, colorIdx }) =>
      cells.forEach(({ r, c }) => m.set(`${r}-${c}`, colorIdx))
    );
    return m;
  }, [foundData]);

  const allThemes = useMemo(() => ({ ...DEFAULT_THEMES, ...customLists }), [customLists]);

  // ── Puzzle Generation ──────────────────────────────────────────────────────

  const canPlace = (g, word, row, col, [dr, dc], size) => {
    const er = row + (word.length - 1) * dr;
    const ec = col + (word.length - 1) * dc;
    if (er < 0 || er >= size || ec < 0 || ec >= size) return false;
    for (let i = 0; i < word.length; i++) {
      const cell = g[row + i * dr][col + i * dc];
      if (cell && cell !== word[i]) return false;
    }
    return true;
  };

  const doPlace = (g, word, row, col, [dr, dc]) => {
    for (let i = 0; i < word.length; i++) g[row + i * dr][col + i * dc] = word[i];
  };

  const attemptGen = (wordList, key) => {
    const { size, directions } = DIFFICULTY_SETTINGS[key];
    const clean = (Array.isArray(wordList) ? wordList : [])
      .map(w => w.toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(w => w.length > 0 && w.length <= size)
      .slice(0, 15);

    const g = Array(size).fill(null).map(() => Array(size).fill(''));
    const placed = [];

    [...clean].sort((a, b) => b.length - a.length).forEach(word => {
      let ok = false, tries = 0;
      while (!ok && tries++ < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const r   = Math.floor(Math.random() * size);
        const c   = Math.floor(Math.random() * size);
        if (canPlace(g, word, r, c, dir, size)) { doPlace(g, word, r, c, dir); ok = true; placed.push(word); }
      }
    });

    const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!g[r][c]) g[r][c] = ALPHA[Math.floor(Math.random() * 26)];

    return { grid: g, placed, total: clean.length };
  };

  const generatePuzzle = (wordList, diffKey, targetState = 'playing') => {
    let key = diffKey;
    let res = attemptGen(wordList, key);

    if (res.placed.length < res.total && key !== 'hard') {
      if (key === 'easy') { key = 'medium'; res = attemptGen(wordList, key); }
      if (res.placed.length < res.total) { key = 'hard'; res = attemptGen(wordList, key); }
      if (res.placed.length === res.total) showToast?.('Difficulty upgraded to fit all words', 'info');
    }
    if (res.placed.length < res.total)
      showToast?.(`Placed ${res.placed.length}/${res.total} words`, 'warning');

    setDifficulty(key);
    setWords(res.placed);
    setGrid(res.grid);
    setFoundData([]);
    setTimer(0);
    setStreak(0);
    setLastFoundMs(null);
    setFlashWord(null);
    setSel({ start: null, cells: [] });
    setGameState(targetState);
  };

  // ── Interaction ────────────────────────────────────────────────────────────

  const getLineCells = (start, end) => {
    const dr = end.r - start.r, dc = end.c - start.c;
    const count = Math.max(Math.abs(dr), Math.abs(dc));
    if (count === 0) return [start];
    let rStep = 0, cStep = 0;
    if (Math.abs(dr) >= Math.abs(dc) / 2 && Math.abs(dr) <= Math.abs(dc) * 2) {
      rStep = dr > 0 ? 1 : -1; cStep = dc > 0 ? 1 : -1;
    } else if (Math.abs(dr) > Math.abs(dc)) {
      rStep = dr > 0 ? 1 : -1;
    } else {
      cStep = dc > 0 ? 1 : -1;
    }
    const cells = [];
    let r = start.r, c = start.c;
    for (let i = 0; i <= count; i++) {
      if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) break;
      cells.push({ r, c });
      r += rStep; c += cStep;
    }
    return cells;
  };

  const handleStart = (r, c) => setSel({ start: { r, c }, cells: [{ r, c }] });
  const handleMove  = (r, c) => {
    if (!sel.start) return;
    setSel(prev => ({ ...prev, cells: getLineCells(prev.start, { r, c }) }));
  };

  const handleEnd = () => {
    if (!sel.start || sel.cells.length === 0) { setSel({ start: null, cells: [] }); return; }

    const word = sel.cells.map(p => grid[p.r][p.c]).join('');
    const rev  = word.split('').reverse().join('');
    const alreadyFound = foundData.map(d => d.word);

    let hit = null;
    let hitCells = sel.cells;
    if (words.includes(word) && !alreadyFound.includes(word))       { hit = word; }
    else if (words.includes(rev) && !alreadyFound.includes(rev))    { hit = rev;  hitCells = [...sel.cells].reverse(); }

    if (hit) {
      const colorIdx     = foundData.length % WORD_COLORS.length;
      const newEntry     = { word: hit, cells: hitCells, colorIdx };
      const newFoundData = [...foundData, newEntry];
      setFoundData(newFoundData);

      // Celebrate the found word briefly
      setFlashWord(hit);
      setTimeout(() => setFlashWord(null), 700);

      // Streak logic: < 15 s since last find = streak continues
      const now = Date.now();
      const newStreak = lastFoundMs && (now - lastFoundMs < 15_000) ? streak + 1 : 1;
      setStreak(newStreak);
      setLastFoundMs(now);

      if (newStreak >= 3) showToast?.(`🔥 ${newStreak}× streak!`, 'success');

      if (newFoundData.length === words.length) setGameState('won');
    }

    setSel({ start: null, cells: [] });
  };

  // Touch
  const handleTouchStart = (e) => {
    if (e.cancelable && e.target.closest('[data-gp]')) e.preventDefault();
    const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)?.closest('[data-gp]');
    if (el) { const [r, c] = el.dataset.gp.split('-').map(Number); handleStart(r, c); }
  };
  const handleTouchMove = (e) => {
    if (e.cancelable) e.preventDefault();
    const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)?.closest('[data-gp]');
    if (el) { const [r, c] = el.dataset.gp.split('-').map(Number); handleMove(r, c); }
  };

  // ── Teacher ────────────────────────────────────────────────────────────────

  const handleSaveList = () => {
    const name = newListName.trim();
    if (!name) { showToast?.('Enter a list name', 'error'); return; }
    const wds = newListWords.split(',')
      .map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(Boolean);
    if (wds.length < 5) { showToast?.('Add at least 5 words', 'error'); return; }
    const id   = `custom_${Date.now()}`;
    const list = { ...customLists, [id]: { name, words: wds } };
    setCustomLists(list);
    saveClassData?.({ wordSearchLists: list });
    showToast?.('Word list saved!', 'success');
    setEditingList(false); setNewListName(''); setNewListWords('');
  };

  const handleDeleteList = (id) => {
    if (!window.confirm('Delete this list?')) return;
    const list = { ...customLists }; delete list[id];
    setCustomLists(list); saveClassData?.({ wordSearchLists: list });
    showToast?.('List deleted', 'success');
  };

  // ── Print ──────────────────────────────────────────────────────────────────

  const printStyle = `
    @media print {
      body * { visibility: hidden }
      .print-area, .print-area * { visibility: visible }
      .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white; padding: 20px }
      .no-print { display: none !important }
    }
  `;

  if (gameState === 'printing') {
    return (
      <div className="bg-white min-h-screen p-8 print-area text-black">
        <style>{printStyle}</style>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-1">WORD SEARCH</h1>
          <h2 className="text-xl mb-8 border-b-2 border-black pb-4 uppercase tracking-widest">
            {allThemes[themeId]?.name || 'Puzzle'}
          </h2>
          <div className="flex flex-col items-center mb-8">
            <div className="grid border-2 border-black"
              style={{ gridTemplateColumns: `repeat(${grid.length}, 2rem)`, gap: 0 }}>
              {grid.map((row, r) => row.map((char, c) => (
                <div key={`${r}-${c}`}
                  className="w-8 h-8 flex items-center justify-center font-serif text-base border border-gray-200">
                  {char}
                </div>
              )))}
            </div>
          </div>
          <h3 className="font-bold text-lg mb-4 text-left">Find these words:</h3>
          <div className="grid grid-cols-4 gap-3 text-sm text-left">
            {words.map(w => (
              <div key={w} className="flex items-center gap-2">
                <div className="w-4 h-4 border border-black flex-shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => setGameState('menu')}
          className="fixed bottom-8 right-8 no-print bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black">
          ← Close Print View
        </button>
      </div>
    );
  }

  // ── Menu ───────────────────────────────────────────────────────────────────

  if (gameState === 'menu') {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 overflow-hidden relative">

        {/* Decorative star field */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {starDots.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-pulse"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.25, animationDelay: s.delay }} />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6">

          {/* Title */}
          <div className="text-center pt-2">
            <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300">
              WORD HUNT
            </h1>
            <p className="text-blue-300 mt-1 text-sm">Find all the hidden words in the grid</p>
          </div>

          {/* Difficulty selector */}
          <div className="flex justify-center gap-3">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, d]) => (
              <button key={key} onClick={() => setDifficulty(key)}
                className={`px-5 py-3 rounded-2xl font-bold transition-all text-sm border-2 ${
                  difficulty === key
                    ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/30 scale-105'
                    : 'bg-white/10 border-white/20 text-blue-200 hover:bg-white/20'
                }`}>
                <div className="font-black">{d.label}</div>
                <div className="text-xs font-normal opacity-70 mt-0.5">{d.desc}</div>
              </button>
            ))}
          </div>

          {/* Theme grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user?.email && (
              <button onClick={() => setEditingList(true)}
                className="p-5 rounded-2xl border-2 border-dashed border-white/25 text-white/50 hover:border-teal-400 hover:text-teal-300 transition-all flex flex-col items-center justify-center gap-2 group min-h-[120px]">
                <span className="text-4xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-bold text-sm">New Word List</span>
              </button>
            )}

            {Object.entries(allThemes).map(([id, theme]) => (
              <motion.button key={id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setThemeId(id); generatePuzzle(theme.words, difficulty); }}
                className={`bg-gradient-to-br ${theme.bg || 'from-gray-500 to-gray-700'} p-5 rounded-2xl shadow-xl cursor-pointer relative overflow-hidden group text-left min-h-[120px] flex flex-col justify-between`}>
                <div>
                  <div className="text-4xl mb-1 drop-shadow">{theme.emoji || '📝'}</div>
                  <div className="font-black text-white text-xl leading-tight">{theme.name}</div>
                  <div className="text-white/70 text-xs mt-0.5">{(theme.words || []).length} words · {DIFFICULTY_SETTINGS[difficulty].label}</div>
                </div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest">Tap to play →</div>

                {/* Hover shimmer */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-2xl transition-all" />

                {/* Teacher controls */}
                {user?.email && (
                  <button onClick={(e) => {
                      e.stopPropagation();
                      setThemeId(id);
                      generatePuzzle(theme.words, difficulty, 'printing');
                      setTimeout(() => window.print(), 400);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-lg flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="Print puzzle">🖨️</button>
                )}
                {customLists[id] && user?.email && (
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteList(id); }}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-black/20 hover:bg-red-500/70 rounded-lg flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete list">🗑️</button>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Create list modal */}
        <AnimatePresence>
          {editingList && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                <h3 className="text-2xl font-black mb-5 text-gray-800">Create Word List</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">List Name</label>
                    <input value={newListName} onChange={e => setNewListName(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 outline-none transition-colors"
                      placeholder="e.g. Science Vocab" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Words (comma separated)</label>
                    <textarea value={newListWords} onChange={e => setNewListWords(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl h-28 focus:border-teal-400 outline-none resize-none transition-colors"
                      placeholder="ATOM, ENERGY, FORCE, GRAVITY, MAGNET..." />
                    <p className="text-xs text-gray-400 mt-1">At least 5 words required.</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setEditingList(false); setNewListName(''); setNewListWords(''); }}
                    className="flex-1 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSaveList}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-teal-500/30 transition-all">
                    Save List
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Playing (+ Won overlay) ────────────────────────────────────────────────

  // Responsive cell size based on difficulty
  const cellPx = difficulty === 'easy' ? 46 : difficulty === 'medium' ? 36 : 28;

  const starCount = stars(timer, words.length || 1);

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden">
      <style>{printStyle}</style>

      {/* Decorative stars (playing screen) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {starDots.slice(0, 20).map((s, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.15, animationDelay: s.delay }} />
        ))}
      </div>

      {/* ── HUD ── */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between mb-3">
        <button onClick={() => setGameState('menu')}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all border border-white/10">
          ← Menu
        </button>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {streak >= 3 && (
              <motion.div key="streak"
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="bg-orange-500/20 border border-orange-500/40 text-orange-300 font-black text-sm px-3 py-1.5 rounded-xl">
                🔥 {streak}×
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-white/10 border border-white/10 text-teal-300 font-mono font-bold px-4 py-1.5 rounded-xl text-sm">
            ⏱ {fmt(timer)}
          </div>
          <div className="bg-white/10 border border-white/10 text-blue-300 font-bold px-4 py-1.5 rounded-xl text-sm">
            {foundWords.length} / {words.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-full max-w-5xl mb-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full"
          animate={{ width: words.length ? `${(foundWords.length / words.length) * 100}%` : '0%' }}
          transition={{ type: 'spring', stiffness: 120 }} />
      </div>

      {/* ── Main game area ── */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-5 items-start justify-center w-full max-w-5xl">

        {/* Grid */}
        <div ref={gridRef}
          className="bg-slate-800/70 backdrop-blur border border-white/10 p-3 rounded-2xl shadow-2xl select-none touch-none"
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchEnd={handleEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}>
          <div className="grid"
            style={{ gridTemplateColumns: `repeat(${grid.length}, ${cellPx}px)`, gap: 2 }}>
            {grid.map((row, r) => row.map((char, c) => {
              const key       = `${r}-${c}`;
              const isActive  = sel.cells.some(p => p.r === r && p.c === c);
              const colorIdx  = foundCellMap.get(key);
              const isFound   = colorIdx !== undefined;
              const color     = WORD_COLORS[colorIdx];

              return (
                <div key={key}
                  onMouseDown={() => handleStart(r, c)}
                  onMouseEnter={() => handleMove(r, c)}
                  data-gp={key}
                  style={{
                    width:  cellPx,
                    height: cellPx,
                    fontSize: Math.floor(cellPx * 0.42),
                    borderRadius: 5,
                    background: isActive ? '#fde047' : isFound ? color.bg : undefined,
                    color:      isActive ? '#713f12' : isFound ? color.text : '#cbd5e1',
                    fontWeight: isFound || isActive ? 900 : 700,
                    transition: 'background 0.1s, color 0.1s',
                  }}
                  className={`flex items-center justify-center cursor-pointer
                    ${!isFound && !isActive ? 'hover:bg-white/10' : ''}`}>
                  {char}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Word Bank */}
        <div className="bg-slate-800/70 backdrop-blur border border-white/10 p-4 rounded-2xl shadow-2xl w-full lg:w-52 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black text-sm uppercase tracking-wider">Word Bank</h3>
            <span className="text-blue-400 text-xs font-bold">{foundWords.length}/{words.length} found</span>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2">
            {words.map(word => {
              const fIdx  = foundData.findIndex(d => d.word === word);
              const found = fIdx !== -1;
              const color = found ? WORD_COLORS[foundData[fIdx].colorIdx] : null;
              const flash = flashWord === word;

              return (
                <motion.div key={word}
                  animate={flash ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  style={found ? { background: color.bg, color: color.text } : {}}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all duration-300
                    ${found ? 'line-through' : 'bg-white/10 text-slate-300'}`}>
                  {found && <span className="text-xs">✓</span>}
                  {word}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Win Modal ── */}
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="bg-gradient-to-br from-slate-800 to-blue-900 border border-white/20 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative overflow-hidden">

              {/* Glow ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/10 to-blue-500/10" />

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="text-7xl mb-3">🏆</motion.div>

                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-300 mb-1">
                  PUZZLE COMPLETE!
                </h2>
                <p className="text-blue-300 text-sm mb-5">You found all {words.length} words!</p>

                {/* Stars */}
                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3].map(n => (
                    <motion.span key={n}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + n * 0.12, type: 'spring', stiffness: 300 }}
                      className={`text-4xl ${n <= starCount ? 'opacity-100' : 'opacity-20'}`}>⭐</motion.span>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-teal-300">{fmt(timer)}</div>
                    <div className="text-xs text-blue-300 mt-0.5 uppercase tracking-wider">Time</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <div className="text-3xl font-black text-amber-300">
                      {DIFFICULTY_SETTINGS[difficulty].coins} 🪙
                    </div>
                    <div className="text-xs text-blue-300 mt-0.5 uppercase tracking-wider">Coins</div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => themeId && allThemes[themeId] && generatePuzzle(allThemes[themeId].words, difficulty)}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-lg hover:shadow-teal-500/30 transition-all active:scale-95">
                    Play Again
                  </button>
                  <button onClick={() => setGameState('menu')}
                    className="flex-1 py-3 rounded-xl font-bold bg-white/10 text-blue-200 hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                    Menu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordSearchGame;
