import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Default Word Lists ---
const DEFAULT_THEMES = {
  animals: {
    name: 'Animals',
    words: ['LION', 'TIGER', 'BEAR', 'ZEBRA', 'WOLF', 'EAGLE', 'SHARK', 'WHALE', 'SNAKE', 'FROG']
  },
  space: {
    name: 'Space',
    words: ['STAR', 'PLANET', 'MOON', 'COMET', 'ORBIT', 'ROCKET', 'GALAXY', 'NEBULA', 'MARS', 'SUN']
  },
  school: {
    name: 'School',
    words: ['BOOK', 'DESK', 'PENCIL', 'RULER', 'PAPER', 'MATH', 'CLASS', 'TEST', 'STUDY', 'READ']
  },
  fruit: {
    name: 'Fruits',
    words: ['APPLE', 'BANANA', 'GRAPE', 'ORANGE', 'LEMON', 'LIME', 'MELON', 'BERRY', 'PEACH', 'PEAR']
  },
  colors: {
    name: 'Colors',
    words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'PURPLE', 'ORANGE', 'BLACK', 'WHITE', 'BROWN']
  },
  countries: {
    name: 'Countries',
    words: ['USA', 'CANADA', 'CHINA', 'INDIA', 'BRAZIL', 'JAPAN', 'FRANCE', 'SPAIN', 'ITALY', 'EGYPT']
  }
};

const DIFFICULTY_SETTINGS = {
  easy: { size: 8, directions: [[0, 1], [1, 0]], label: 'Easy (8x8)' }, // Horizontal, Vertical
  medium: { size: 12, directions: [[0, 1], [1, 0], [1, 1], [1, -1]], label: 'Medium (12x12)' }, // + Diagonals
  hard: { size: 15, directions: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]], label: 'Hard (15x15 + Backwards)' }
};

const WordSearchGame = ({ showToast, user, classData, saveClassData }) => {
  // Game State
  const [gameState, setGameState] = useState('menu'); // menu, playing, teacher, printing
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState({ start: null, end: null, cells: [] });
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedThemeId, setSelectedThemeId] = useState(null);
  const [customLists, setCustomLists] = useState({});

  // Teacher Mode State
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const [newListWords, setNewListWords] = useState('');

  // Load custom lists from classData
  useEffect(() => {
    if (classData?.wordSearchLists) {
      setCustomLists(classData.wordSearchLists);
    }
  }, [classData]);

  // Combined Themes
  const allThemes = useMemo(() => {
    return { ...DEFAULT_THEMES, ...customLists };
  }, [customLists]);

  // --- Logic: Generator ---

  const generatePuzzle = (wordListStr, difficultyKey) => {
    const settings = DIFFICULTY_SETTINGS[difficultyKey];
    const size = settings.size;
    const directions = settings.directions;

    // Normalize words
    const wordList = Array.isArray(wordListStr) ? wordListStr : wordListStr;
    const cleanWords = wordList
      .map(w => w.toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(w => w.length > 0 && w.length <= size)
      .slice(0, 15); // Cap at 15 words max

    setWords(cleanWords);
    setFoundWords([]);

    // Init Grid
    let newGrid = Array(size).fill().map(() => Array(size).fill(''));
    const placedWords = [];

    // Place Words
    // Sort by length desc to place hardest first
    const sortedWords = [...cleanWords].sort((a, b) => b.length - a.length);

    sortedWords.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);

        if (canPlaceWord(newGrid, word, row, col, dir, size)) {
          placeWord(newGrid, word, row, col, dir);
          placed = true;
          placedWords.push(word);
        }
        attempts++;
      }
    });

    // Fill Empty
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGrid(newGrid);
    setGameState('playing');
  };

  const canPlaceWord = (grid, word, row, col, [dRow, dCol], size) => {
    // Check bounds
    const endRow = row + (word.length - 1) * dRow;
    const endCol = col + (word.length - 1) * dCol;

    if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) return false;

    // Check collisions
    for (let i = 0; i < word.length; i++) {
      const r = row + i * dRow;
      const c = col + i * dCol;
      const cell = grid[r][c];
      if (cell !== '' && cell !== word[i]) return false;
    }
    return true;
  };

  const placeWord = (grid, word, row, col, [dRow, dCol]) => {
    for (let i = 0; i < word.length; i++) {
      grid[row + i * dRow][col + i * dCol] = word[i];
    }
  };

  // --- Interaction ---

  const handleStart = (r, c) => {
    setSelection({ start: { r, c }, end: { r, c }, cells: [{ r, c }] });
  };

  const handleMove = (r, c) => {
    if (!selection.start) return;
    const start = selection.start;
    const cells = getLineCells(start, { r, c });
    setSelection(prev => ({ ...prev, end: { r, c }, cells }));
  };

  const handleEnd = () => {
    if (!selection.start || !selection.end) {
      setSelection({ start: null, end: null, cells: [] });
      return;
    }

    const word = selection.cells.map(pos => grid[pos.r][pos.c]).join('');
    const reversed = word.split('').reverse().join('');

    let found = null;
    if (words.includes(word) && !foundWords.includes(word)) found = word;
    else if (words.includes(reversed) && !foundWords.includes(reversed)) found = reversed;

    if (found) {
      setFoundWords(prev => [...prev, found]);
      showToast(`Found ${found}!`, 'success');
      if (foundWords.length + 1 === words.length) {
        setTimeout(() => showToast('🎉 PUZZLE COMPLETE! 🎉', 'success'), 500);
      }
    }

    setSelection({ start: null, end: null, cells: [] });
  };

  const getLineCells = (start, end) => {
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    if (steps === 0) return [{ r: start.r, c: start.c }];

    // Enforce 8-way movement
    // Calculate normalized direction step
    let rStep = 0;
    let cStep = 0;

    if (Math.abs(dr) >= Math.abs(dc) / 2 && Math.abs(dr) <= Math.abs(dc) * 2) {
      // Diagonalish
      rStep = dr > 0 ? 1 : -1;
      cStep = dc > 0 ? 1 : -1;
    } else if (Math.abs(dr) > Math.abs(dc)) {
      // Verticalish
      rStep = dr > 0 ? 1 : -1;
      cStep = 0;
    } else {
      // Horizontalish
      rStep = 0;
      cStep = dc > 0 ? 1 : -1;
    }

    // Re-calculate cells based on forced direction
    const cells = [];
    let r = start.r;
    let c = start.c;
    // Don't go past the actual end point visually, but lock to axis
    // Just use 'steps' count from the primary axis
    const count = Math.max(Math.abs(end.r - start.r), Math.abs(end.c - start.c)); // Rough approx

    for (let i = 0; i <= count; i++) {
      // Stop if out of bounds (shouldn't happen with logic below but safe)
      if (r < 0 || r >= grid.length || c < 0 || c >= grid.length) break;
      cells.push({ r, c });
      r += rStep;
      c += cStep;
    }
    return cells;
  };

  const isSelected = (r, c) => {
    return selection.cells.some(cell => cell.r === r && cell.c === c);
  };

  // --- Teacher Functions ---

  const handleSaveList = () => {
    if (!saveClassData) {
      showToast('Error: Cannot save (No permission)', 'error');
      return;
    }

    const cleanName = newListName.trim();
    if (!cleanName) {
      showToast('Please enter a list name', 'error');
      return;
    }

    const cleanWords = newListWords.split(',')
      .map(w => w.trim().toUpperCase().replace(/[^A-Z]/g, ''))
      .filter(w => w.length > 0);

    if (cleanWords.length < 5) {
      showToast('Please add at least 5 words', 'error');
      return;
    }

    const newListId = `custom_${Date.now()}`;
    const newLists = {
      ...customLists,
      [newListId]: {
        name: cleanName,
        words: cleanWords
      }
    };

    setCustomLists(newLists);
    saveClassData({ wordSearchLists: newLists });
    showToast('Word list saved!', 'success');
    setEditingList(null);
    setNewListName('');
    setNewListWords('');
  };

  const handleDeleteList = (id) => {
    if (!window.confirm('Are you sure you want to delete this list?')) return;

    const newLists = { ...customLists };
    delete newLists[id];

    setCustomLists(newLists);
    saveClassData({ wordSearchLists: newLists });
    showToast('List deleted', 'success');
  };

  const handlePrint = (themeId) => {
    const theme = allThemes[themeId];
    // Generate a fresh puzzle for printing (always printable size/difficulty - let's default to Medium for print)
    // Actually, let's use current selected difficulty or default to Medium

    // To print we need to generate state but NOT switch game view, just open print window?
    // Better: Render a specific "Print View" component then window.print()

    setSelectedThemeId(themeId);
    // Generate grid specifically for print
    // Reuse generate logic but store in a temp variable? 
    // Simplified: Just switch to playing state with that theme, then user hits "Print" button in game HUD?
    // Requirement says "Options on main tab to print a neat one page copy"

    // Let's generate it now
    generatePuzzle(theme.words, difficulty);
    setGameState('printing');
    // After render, we trigger print
    setTimeout(() => {
      window.print();
      // optionally go back
      // setGameState('menu'); 
    }, 500);
  };


  // --- Render Helpers ---

  // PRINT STYLE
  const printStyle = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-area, .print-area * {
        visibility: visible;
      }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: white;
        padding: 20px;
        z-index: 9999;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  if (gameState === 'printing') {
    return (
      <div className="bg-white min-h-screen p-8 print-area text-black">
        <style>{printStyle}</style>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2 text-black">WORD SEARCH</h1>
          <h2 className="text-xl mb-8 border-b-2 border-black pb-4 text-black uppercase tracking-widest">
            {allThemes[selectedThemeId]?.name || 'Puzzle'}
          </h2>

          <div className="flex flex-col items-center mb-8">
            <div
              className="grid gap-0 border-2 border-black"
              style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
            >
              {grid.map((row, r) =>
                row.map((char, c) => (
                  <div key={`${r}-${c}`} className="w-8 h-8 flex items-center justify-center font-serif text-lg border border-gray-300">
                    {char}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-left">
            <h3 className="font-bold text-lg mb-4 text-black">Find these words:</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              {words.map(w => (
                <div key={w} className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-black"></div>
                  <span className="text-black">{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed bottom-8 right-8 no-print">
          <button
            onClick={() => setGameState('menu')}
            className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
          >
            Close Print View
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] flex flex-col items-center bg-white/50 rounded-xl relative overflow-hidden">
      <style>{printStyle}</style>

      {gameState === 'menu' && (
        <div className="w-full max-w-5xl p-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
              WORD HUNT
            </h2>
            <p className="text-gray-500">Find the hidden words across the grid!</p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(DIFFICULTY_SETTINGS).map(([key, setting]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${difficulty === key
                    ? 'bg-teal-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {setting.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New List Button for Teachers */}
            {(user?.email || isTeacherMode) && (
              <button
                onClick={() => { setIsTeacherMode(true); setEditingList(true); }}
                className="p-6 border-2 border-dashed border-teal-300 bg-teal-50 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-teal-100 transition-all text-teal-700 group"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">➕</span>
                <span className="font-bold">Create New List</span>
              </button>
            )}

            {Object.entries(allThemes).map(([id, theme]) => (
              <div key={id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-all relative group">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{theme.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{theme.words.length} words</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedThemeId(id); generatePuzzle(theme.words, difficulty); }}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-2 rounded-lg font-bold shadow hover:shadow-lg transition-all"
                  >
                    Play
                  </button>
                  {(user?.email || isTeacherMode) && (
                    <button
                      onClick={() => handlePrint(id)}
                      className="px-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                      title="Print Puzzle"
                    >
                      🖨️
                    </button>
                  )}
                </div>

                {customLists[id] && (user?.email || isTeacherMode) && (
                  <button
                    onClick={() => handleDeleteList(id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teacher: Create List Modal */}
      {editingList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Create Word List</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">List Name</label>
                <input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl"
                  placeholder="e.g. Science Vocab"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Words (comma separated)</label>
                <textarea
                  value={newListWords}
                  onChange={(e) => setNewListWords(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl h-32"
                  placeholder="ATOM, ENERGY, FORCE, GRAVITY, MAGNET..."
                />
                <p className="text-xs text-gray-500 mt-1">At least 5 words required.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingList(false)}
                className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveList}
                className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700"
              >
                Save List
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col items-center w-full max-w-6xl p-4">
          <div className="w-full flex justify-between items-center mb-6">
            <button
              onClick={() => setGameState('menu')}
              className="px-4 py-2 bg-white rounded-lg shadow text-gray-600 hover:text-gray-900 font-bold"
            >
              ← Back to Menu
            </button>
            <div className="text-xl font-bold text-teal-800">
              {foundWords.length} / {words.length} Found
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            {/* Grid */}
            <div
              className="bg-white p-4 rounded-xl shadow-2xl select-none touch-none border-4 border-teal-100"
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
            >
              <div
                className="grid gap-0"
                style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
              >
                {grid.map((row, r) =>
                  row.map((char, c) => {
                    const active = isSelected(r, c);
                    return (
                      <div
                        key={`${r}-${c}`}
                        onMouseDown={() => handleStart(r, c)}
                        onMouseEnter={() => handleMove(r, c)}
                        className={`
                                    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center 
                                    font-bold text-lg sm:text-xl rounded-sm cursor-pointer transition-colors duration-75
                                    ${active ? 'bg-yellow-300 text-yellow-900' : 'hover:bg-teal-50 text-gray-700'}
                                `}
                      >
                        {char}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Word Bank */}
            <div className="bg-white p-6 rounded-xl shadow-lg w-full lg:w-64 border border-gray-100">
              <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Word Bank</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {words.map(word => (
                  <div
                    key={word}
                    className={`
                                px-3 py-2 rounded-lg text-sm font-bold transition-all
                                ${foundWords.includes(word)
                        ? 'bg-green-100 text-green-700 line-through opacity-70 order-last'
                        : 'bg-gray-50 text-gray-700'}
                            `}
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;