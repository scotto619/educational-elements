import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Predefined word themes
const THEMES = {
  animals: ['LION', 'TIGER', 'BEAR', 'ZEBRA', 'WOLF', 'EAGLE', 'SHARK', 'WHALE', 'SNAKE', 'FROG'],
  space: ['STAR', 'PLANET', 'MOON', 'COMET', 'ORBIT', 'ROCKET', 'GALAXY', 'NEBULA', 'MARS', 'SUN'],
  school: ['BOOK', 'DESK', 'PENCIL', 'RULER', 'PAPER', 'MATH', 'CLASS', 'TEST', 'STUDY', 'READ']
};

const WordSearchGame = ({ showToast }) => {
  const [grid, setGrid] = useState([]);
  const [theme, setTheme] = useState('animals');
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState({ start: null, end: null, cells: [] });
  const [gameState, setGameState] = useState('menu');
  const [gridSize, setGridSize] = useState(10);
  const gridRef = useRef(null);

  // Generate puzzle
  const generatePuzzle = () => {
    const wordList = THEMES[theme];
    setWords(wordList);
    setFoundWords([]);

    // Initialize empty grid
    let newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    const placedWords = [];

    // Place words
    wordList.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 2); // 0: horizontal, 1: vertical (keep it simple for now)
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);

        if (canPlaceWord(newGrid, word, row, col, direction)) {
          placeWord(newGrid, word, row, col, direction);
          placed = true;
          placedWords.push(word);
        }
        attempts++;
      }
    });

    // Fill empty cells
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setGameState('playing');
  };

  const canPlaceWord = (grid, word, row, col, direction) => {
    if (direction === 0) { // Horizontal
      if (col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) return false;
      }
    } else { // Vertical
      if (row + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== '' && grid[row + i][col] !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (grid, word, row, col, direction) => {
    for (let i = 0; i < word.length; i++) {
      if (direction === 0) grid[row][col + i] = word[i];
      else grid[row + i][col] = word[i];
    }
  };

  // Interaction handlers
  const getCellFromTouch = (e) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element?.dataset?.row) {
      return { r: parseInt(element.dataset.row), c: parseInt(element.dataset.col) };
    }
    return null;
  };

  const handleStart = (r, c) => {
    setSelection({ start: { r, c }, end: { r, c }, cells: [{ r, c }] });
  };

  const handleMove = (r, c) => {
    if (!selection.start) return;

    // Calculate line
    const start = selection.start;
    const cells = getLineCells(start, { r, c });
    setSelection(prev => ({ ...prev, end: { r, c }, cells }));
  };

  const handleEnd = () => {
    if (!selection.start || !selection.end) {
      setSelection({ start: null, end: null, cells: [] });
      return;
    }

    // Check word
    const word = selection.cells.map(pos => grid[pos.r][pos.c]).join('');
    // Check forward and reverse
    if (words.includes(word) && !foundWords.includes(word)) {
      setFoundWords(prev => [...prev, word]);
      showToast('Found ' + word + '!', 'success');
    } else if (words.includes(word.split('').reverse().join('')) && !foundWords.includes(word.split('').reverse().join(''))) {
      setFoundWords(prev => [...prev, word.split('').reverse().join('')]);
      showToast('Found ' + word.split('').reverse().join('') + '!', 'success');
    }

    setSelection({ start: null, end: null, cells: [] });
  };

  // Helper handling diagonal selection logic simply
  const getLineCells = (start, end) => {
    const cells = [];
    const dr = end.r - start.r;
    const dc = end.c - start.c;
    const steps = Math.max(Math.abs(dr), Math.abs(dc));

    // Force straight lines (horizontal, vertical, diagonal)
    if (steps === 0) return [{ r: start.r, c: start.c }];

    const rStep = dr === 0 ? 0 : dr > 0 ? 1 : -1;
    const cStep = dc === 0 ? 0 : dc > 0 ? 1 : -1;

    // Only allow 8 directions
    if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) {
      // Snap to closest valid line? For now just use end cell directly
      return [{ r: start.r, c: start.c }]; // Invalid selection cancel visualization
    }

    let r = start.r;
    let c = start.c;
    for (let i = 0; i <= steps; i++) {
      cells.push({ r, c });
      r += rStep;
      c += cStep;
    }
    return cells;
  };

  const isSelected = (r, c) => {
    // Check if in current selection
    if (selection.cells.some(cell => cell.r === r && cell.c === c)) return true;
    // Check if in found words
    // (Advanced: Need to store found word coordinates to highlight permanently)
    // For simplicity in this version, we won't highlight found words on grid permanently, just list them.
    return false;
  };

  return (
    <div className="min-h-[600px] flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
      {gameState === 'menu' && (
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-black text-teal-800">WORD HUNT</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.keys(THEMES).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-4 rounded-xl border-2 font-bold capitalize transition-all ${theme === t ? 'bg-teal-500 text-white border-teal-600' : 'bg-white text-gray-500 border-gray-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={generatePuzzle}
            className="px-12 py-4 bg-teal-600 text-white rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition-all"
          >
            Create Puzzle
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div
            className="bg-white p-4 rounded-xl shadow-xl select-none touch-none"
            onMouseUp={handleEnd}
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
            >
              {grid.map((row, r) => (
                row.map((char, c) => (
                  <div
                    key={`${r}-${c}`}
                    data-row={r}
                    data-col={c}
                    onMouseDown={() => handleStart(r, c)}
                    onMouseEnter={() => handleMove(r, c)}
                    className={`
                                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-lg rounded-md
                                    ${isSelected(r, c) ? 'bg-yellow-300 text-yellow-900 scale-110 shadow-lg z-10' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                                    transition-all cursor-pointer
                                `}
                  >
                    {char}
                  </div>
                ))
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg w-64">
            <h3 className="text-xl font-bold mb-4 text-teal-800">Word List</h3>
            <div className="flex flex-wrap gap-2">
              {words.map(word => (
                <div
                  key={word}
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${foundWords.includes(word)
                      ? 'bg-green-100 text-green-700 border-green-200 line-through opacity-50'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                >
                  {word}
                </div>
              ))}
            </div>
            {foundWords.length === words.length && (
              <div className="mt-8 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-bold text-green-600 mb-4">Puzzle Complete!</div>
                <button
                  onClick={() => setGameState('menu')}
                  className="w-full py-2 bg-teal-600 text-white rounded-lg font-bold"
                >
                  New Puzzle
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;