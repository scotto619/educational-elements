// components/games/WordSearchGame.js - Enhanced Word Search with Custom Lists & Printing
import React, { useState, useEffect, useCallback, useRef } from 'react';

const WordSearchGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(15);
  const [wordList, setWordList] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Custom word list features
  const [useCustomWords, setUseCustomWords] = useState(false);
  const [customWordInput, setCustomWordInput] = useState('');
  const [customWords, setCustomWords] = useState([]);
  const [showWordListEditor, setShowWordListEditor] = useState(false);
  
  // Print features
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printWithAnswers, setPrintWithAnswers] = useState(false);
  const printRef = useRef();

  // Default word lists by difficulty
  const defaultWordLists = {
    easy: ['CAT', 'DOG', 'SUN', 'FUN', 'RUN', 'EAT', 'PLAY', 'JUMP', 'BOOK', 'STAR'],
    medium: ['HAPPY', 'MUSIC', 'SMILE', 'FRIEND', 'SCHOOL', 'GARDEN', 'BRIGHT', 'FAMILY', 'NATURE', 'PURPLE'],
    hard: ['ELEPHANT', 'BUTTERFLY', 'ADVENTURE', 'KNOWLEDGE', 'BEAUTIFUL', 'WONDERFUL', 'CELEBRATE', 'FANTASTIC', 'RAINBOW', 'SUNSHINE']
  };

  // Get current word source
  const getCurrentWords = useCallback(() => {
    if (useCustomWords && customWords.length > 0) {
      return customWords.slice(0, Math.min(15, customWords.length)); // Max 15 words
    }
    return defaultWordLists[difficulty].slice(0, Math.min(10, defaultWordLists[difficulty].length));
  }, [useCustomWords, customWords, difficulty]);

  // Validate custom words
  const validateCustomWords = (words) => {
    const validated = words
      .map(word => word.toUpperCase().trim())
      .filter(word => {
        if (word.length < 3) return false;
        if (word.length > gridSize) return false;
        if (!/^[A-Z]+$/.test(word)) return false;
        return true;
      });
    
    return [...new Set(validated)]; // Remove duplicates
  };

  // Add custom words from input
  const handleAddCustomWords = () => {
    const words = customWordInput
      .split(/[\n,]+/)
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    const validatedWords = validateCustomWords(words);
    
    if (validatedWords.length === 0) {
      showToast('Please enter valid words (3+ letters, no numbers/symbols)', 'error');
      return;
    }
    
    if (validatedWords.length > 15) {
      showToast(`Only first 15 words will be used (${validatedWords.length} entered)`, 'warning');
    }
    
    setCustomWords(validatedWords);
    setCustomWordInput('');
    showToast(`Added ${validatedWords.length} words to custom list`, 'success');
  };

  // Generate grid with hidden words
  const generateGrid = useCallback(() => {
    const size = gridSize;
    const words = getCurrentWords();
    
    if (words.length === 0) {
      showToast('No words available to generate grid', 'error');
      return;
    }
    
    // Create empty grid
    const newGrid = Array(size).fill().map(() => Array(size).fill(''));
    const placedWords = [];

    // Place words in grid
    words.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 8); // 8 directions
        const startRow = Math.floor(Math.random() * size);
        const startCol = Math.floor(Math.random() * size);
        
        if (canPlaceWord(newGrid, word, startRow, startCol, direction, size)) {
          placeWord(newGrid, word, startRow, startCol, direction);
          placedWords.push({
            word,
            startRow,
            startCol,
            direction,
            cells: getWordCells(word, startRow, startCol, direction)
          });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (newGrid[row][col] === '') {
          newGrid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(newGrid);
    setWordList(placedWords);
    setFoundWords([]);
    setSelectedCells([]);
    
    if (placedWords.length < words.length) {
      showToast(`Placed ${placedWords.length}/${words.length} words (some didn't fit)`, 'warning');
    }
  }, [gridSize, getCurrentWords, showToast]);

  // Check if word can be placed
  const canPlaceWord = (grid, word, startRow, startCol, direction, size) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1], // Up-left, up, up-right
      [0, -1],           [0, 1],  // Left, right
      [1, -1],  [1, 0],  [1, 1]   // Down-left, down, down-right
    ];
    
    const [rowDelta, colDelta] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * rowDelta;
      const col = startCol + i * colDelta;
      
      if (row < 0 || row >= size || col < 0 || col >= size) {
        return false;
      }
      
      if (grid[row][col] !== '' && grid[row][col] !== word[i]) {
        return false;
      }
    }
    
    return true;
  };

  // Place word in grid
  const placeWord = (grid, word, startRow, startCol, direction) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    const [rowDelta, colDelta] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * rowDelta;
      const col = startCol + i * colDelta;
      grid[row][col] = word[i];
    }
  };

  // Get cells for a word
  const getWordCells = (word, startRow, startCol, direction) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    const [rowDelta, colDelta] = directions[direction];
    const cells = [];
    
    for (let i = 0; i < word.length; i++) {
      const row = startRow + i * rowDelta;
      const col = startCol + i * colDelta;
      cells.push(`${row}-${col}`);
    }
    
    return cells;
  };

  // Handle cell selection
  const handleCellSelect = (row, col) => {
    if (gameMode !== 'digital' || !isActive) return;

    const cellKey = `${row}-${col}`;
    
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedCells([cellKey]);
    } else {
      // Check if forming a line
      if (selectedCells.length === 1) {
        setSelectedCells([selectedCells[0], cellKey]);
      } else {
        // Complete selection
        checkForWord();
        setIsSelecting(false);
        setSelectedCells([]);
      }
    }
  };

  // Check if selected cells form a word
  const checkForWord = () => {
    if (selectedCells.length < 2) return;

    const foundWord = wordList.find(wordData => {
      const wordCells = wordData.cells;
      return (
        wordCells.length === selectedCells.length &&
        wordCells.every(cell => selectedCells.includes(cell))
      ) || (
        wordCells.length === selectedCells.length &&
        wordCells.slice().reverse().every((cell, index) => selectedCells[index] === cell)
      );
    });

    if (foundWord && !foundWords.includes(foundWord.word)) {
      setFoundWords(prev => [...prev, foundWord.word]);
      showToast(`Found "${foundWord.word}"!`, 'success');
      
      // Check if all words found
      if (foundWords.length + 1 === wordList.length) {
        setIsActive(false);
        showToast('Congratulations! All words found!', 'success');
      }
    } else {
      showToast('No word found in selection', 'error');
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      showToast(`Time's up! Found ${foundWords.length}/${wordList.length} words`, 'info');
    }
    return () => clearInterval(interval);
  }, [isActive, timer, foundWords.length, wordList.length, showToast]);

  // Start game
  const startGame = () => {
    setIsActive(true);
    setTimer(300);
    generateGrid();
  };

  // Stop game
  const stopGame = () => {
    setIsActive(false);
  };

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Word Search - ${useCustomWords ? 'Custom' : difficulty} Level</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px;
            }
            .grid-container { 
              display: flex; 
              justify-content: center; 
              margin: 20px 0;
            }
            .grid { 
              display: grid; 
              grid-template-columns: repeat(${gridSize}, 25px);
              gap: 1px; 
              border: 2px solid #333;
              background: #333;
            }
            .cell { 
              width: 25px; 
              height: 25px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              font-weight: bold; 
              font-size: 12px;
              background: white;
            }
            .found-cell { 
              background: #ffeb3b !important; 
            }
            .word-list { 
              columns: 3; 
              column-gap: 30px;
              margin-top: 20px;
            }
            .word-item { 
              margin: 5px 0; 
              break-inside: avoid;
            }
            .found { 
              text-decoration: line-through; 
              color: #666;
            }
            .answer-key {
              margin-top: 30px;
              border-top: 2px solid #333;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = () => {
    const title = useCustomWords ? 'Custom Word Search' : `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Word Search`;
    const date = new Date().toLocaleDateString();
    
    let gridHTML = '';
    grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const cellKey = `${rowIndex}-${colIndex}`;
        const isPartOfFoundWord = printWithAnswers && foundWords.some(word => {
          const wordData = wordList.find(w => w.word === word);
          return wordData?.cells.includes(cellKey);
        });
        
        gridHTML += `<div class="cell ${isPartOfFoundWord ? 'found-cell' : ''}">${letter}</div>`;
      });
    });
    
    let wordListHTML = '';
    wordList.forEach(wordData => {
      const isFound = foundWords.includes(wordData.word);
      wordListHTML += `<div class="word-item ${isFound && printWithAnswers ? 'found' : ''}">${wordData.word}</div>`;
    });
    
    let answerKeyHTML = '';
    if (printWithAnswers) {
      answerKeyHTML = `
        <div class="answer-key">
          <h3>Answer Key</h3>
          <div style="columns: 2; column-gap: 30px;">
            ${wordList.map(wordData => `
              <div style="margin: 5px 0; break-inside: avoid;">
                <strong>${wordData.word}</strong> - 
                Row ${wordData.startRow + 1}, Col ${wordData.startCol + 1}, 
                Direction: ${getDirectionName(wordData.direction)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    return `
      <div class="header">
        <h1>${title}</h1>
        <p>Find all ${wordList.length} hidden words in the grid below</p>
        <p style="font-size: 12px;">Generated on ${date} • Grid Size: ${gridSize}×${gridSize}</p>
      </div>
      
      <div class="grid-container">
        <div class="grid">
          ${gridHTML}
        </div>
      </div>
      
      <div>
        <h3>Words to Find (${wordList.length} total):</h3>
        <div class="word-list">
          ${wordListHTML}
        </div>
      </div>
      
      ${answerKeyHTML}
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        Created with Classroom Champions Word Search Generator
      </div>
    `;
  };

  const getDirectionName = (direction) => {
    const names = ['↖', '↑', '↗', '←', '→', '↙', '↓', '↘'];
    return names[direction] || '?';
  };

  // Initialize grid
  useEffect(() => {
    generateGrid();
  }, [generateGrid]);

  // Get cell style
  const getCellStyle = (row, col) => {
    const cellKey = `${row}-${col}`;
    const isSelected = selectedCells.includes(cellKey);
    const isPartOfFoundWord = foundWords.some(word => {
      const wordData = wordList.find(w => w.word === word);
      return wordData?.cells.includes(cellKey);
    });

    if (isPartOfFoundWord) {
      return 'bg-green-200 text-green-800 border-green-400';
    } else if (isSelected) {
      return 'bg-blue-200 text-blue-800 border-blue-400';
    } else {
      return 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timer & Status */}
        <div className="flex items-center space-x-4">
          <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            ⏰ {formatTime(timer)}
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {isActive ? '🎮 ACTIVE' : '⏸️ PAUSED'}
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
            📝 Found: {foundWords.length}/{wordList.length}
          </div>
          {useCustomWords && (
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-semibold">
              📝 Custom Words
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowWordListEditor(true)}
            disabled={isActive}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50"
          >
            📝 Custom Words
          </button>

          <button
            onClick={() => setShowPrintOptions(true)}
            disabled={wordList.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
          >
            🖨️ Print
          </button>

          {!useCustomWords && (
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={isActive}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="easy">Easy (3-4 letters)</option>
              <option value="medium">Medium (5-6 letters)</option>
              <option value="hard">Hard (7+ letters)</option>
            </select>
          )}

          <select
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            disabled={isActive}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value={12}>12×12 Grid</option>
            <option value={15}>15×15 Grid</option>
            <option value={18}>18×18 Grid</option>
            <option value={20}>20×20 Grid</option>
          </select>

          {isActive ? (
            <button
              onClick={stopGame}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              ⏹️ Stop
            </button>
          ) : (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              ▶️ Start
            </button>
          )}

          <button
            onClick={generateGrid}
            disabled={isActive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            🔄 New Grid
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Grid */}
        <div className="lg:col-span-3">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">🔍 Word Search Grid</h3>
            {gameMode === 'digital' && (
              <p className="text-sm text-gray-600 mt-2">
                Click and drag to select words in any direction
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <div 
              className="grid gap-1 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 overflow-auto"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                maxWidth: '600px',
                maxHeight: '600px'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((letter, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellSelect(rowIndex, colIndex)}
                    disabled={gameMode !== 'digital' || !isActive}
                    className={`w-6 h-6 text-xs font-bold border transition-all ${getCellStyle(rowIndex, colIndex)} ${
                      gameMode === 'digital' && isActive ? 'cursor-pointer' : ''
                    }`}
                  >
                    {letter}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Word List Sidebar */}
        <div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-800 mb-4">📝 Find These Words</h4>
            <div className="space-y-2">
              {wordList.map((wordData, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded border text-center font-semibold ${
                    foundWords.includes(wordData.word)
                      ? 'bg-green-100 text-green-800 border-green-300 line-through'
                      : 'bg-white text-gray-800 border-gray-300'
                  }`}
                >
                  {wordData.word}
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">Progress:</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(foundWords.length / wordList.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {foundWords.length} of {wordList.length} words found
              </div>
            </div>

            {/* Completion Message */}
            {foundWords.length === wordList.length && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                <div className="text-lg font-bold text-green-800">🏆 Completed!</div>
                <div className="text-sm text-green-700">All words found!</div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 Instructions</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Find all hidden words in the grid</li>
              <li>• Words can be horizontal, vertical, or diagonal</li>
              <li>• Words can be spelled forwards or backwards</li>
              <li>• Click and drag to select words</li>
              <li>• Found words will be highlighted in green</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Word List Editor Modal */}
      {showWordListEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">📝 Custom Word List Editor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter words (one per line or comma-separated):
                </label>
                <textarea
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value)}
                  placeholder="math&#10;science&#10;reading&#10;writing&#10;history"
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                  rows="6"
                />
                <div className="text-xs text-gray-500 mt-1">
                  • Words must be 3+ letters • No numbers or symbols • Max 15 words • Max {gridSize} letters per word
                </div>
              </div>

              <button
                onClick={handleAddCustomWords}
                disabled={!customWordInput.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Words to List
              </button>

              {/* Current Custom Words */}
              {customWords.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Current Custom Words ({customWords.length}):</h4>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                    {customWords.map((word, index) => (
                      <div key={index} className="text-sm bg-white p-1 rounded text-center">
                        {word}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setCustomWords([])}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All Custom Words
                  </button>
                </div>
              )}

              {/* Mode Selection */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Word Source:</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useCustomWords}
                      onChange={() => setUseCustomWords(false)}
                      className="mr-2"
                    />
                    Use default word lists (Easy/Medium/Hard)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useCustomWords}
                      onChange={() => setUseCustomWords(true)}
                      disabled={customWords.length === 0}
                      className="mr-2"
                    />
                    Use my custom word list ({customWords.length} words)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowWordListEditor(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowWordListEditor(false);
                  if (!isActive) generateGrid();
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Apply & Generate Grid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Options Modal */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🖨️ Print Options</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Print Settings:</h4>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={printWithAnswers}
                    onChange={(e) => setPrintWithAnswers(e.target.checked)}
                  />
                  <span>Include answer key</span>
                </label>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h5 className="font-semibold mb-1">Print Preview:</h5>
                <div className="text-sm text-gray-600">
                  • Grid: {gridSize}×{gridSize}
                  • Words: {wordList.length} total
                  • Source: {useCustomWords ? 'Custom words' : `${difficulty} difficulty`}
                  • Date: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowPrintOptions(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handlePrint();
                  setShowPrintOptions(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearchGame;