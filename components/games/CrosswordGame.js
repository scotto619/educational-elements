// components/games/CrosswordGame.js - Interactive Crossword Puzzle Generator
import React, { useState, useEffect, useCallback } from 'react';

const CrosswordGame = ({ gameMode, showToast, students }) => {
  // Game State
  const [grid, setGrid] = useState([]);
  const [gridSize, setGridSize] = useState(15);
  const [placedWords, setPlacedWords] = useState([]);
  const [clues, setClues] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState('across');
  const [selectedClue, setSelectedClue] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Teacher Mode States
  const [showClueEditor, setShowClueEditor] = useState(false);
  const [editingClues, setEditingClues] = useState([]);
  const [newClue, setNewClue] = useState({ question: '', answer: '', category: '' });
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [printWithAnswers, setPrintWithAnswers] = useState(false);

  // Sample starter clues for demo
  const starterClues = [
    { question: "The largest planet in our solar system", answer: "JUPITER", category: "Science" },
    { question: "Capital of France", answer: "PARIS", category: "Geography" },
    { question: "Author of Romeo and Juliet", answer: "SHAKESPEARE", category: "Literature" },
    { question: "Chemical symbol for water", answer: "H2O", category: "Science" },
    { question: "Opposite of hot", answer: "COLD", category: "General" },
    { question: "Number of sides in a triangle", answer: "THREE", category: "Math" },
    { question: "First president of the United States", answer: "WASHINGTON", category: "History" },
    { question: "Planet closest to the Sun", answer: "MERCURY", category: "Science" }
  ];

  // Initialize with starter clues
  useEffect(() => {
    if (editingClues.length === 0) {
      setEditingClues([...starterClues]);
    }
  }, []);

  // Crossword Generation Algorithm - COMPLETELY REWRITTEN
  const generateCrossword = useCallback(() => {
    if (editingClues.length < 3) {
      showToast('Need at least 3 clues to generate a crossword!', 'error');
      return;
    }

    // Prepare words
    const words = editingClues
      .filter(clue => clue.answer && clue.question)
      .map(clue => ({
        ...clue,
        answer: clue.answer.toUpperCase().replace(/[^A-Z]/g, ''),
        length: clue.answer.toUpperCase().replace(/[^A-Z]/g, '').length
      }))
      .filter(word => word.length >= 3 && word.length <= gridSize - 2)
      .sort((a, b) => b.length - a.length);

    if (words.length < 3) {
      showToast('Need at least 3 valid answers (3+ letters each)!', 'error');
      return;
    }

    console.log('Starting crossword generation with', words.length, 'words:', words.map(w => w.answer));

    // Initialize empty grid
    const newGrid = Array(gridSize).fill().map(() => Array(gridSize).fill(null));
    const placed = [];
    const centerRow = Math.floor(gridSize / 2);
    const centerCol = Math.floor(gridSize / 2);

    // Place first word horizontally in center
    const firstWord = words[0];
    const startCol = Math.max(1, centerCol - Math.floor(firstWord.length / 2));
    
    console.log('Placing first word:', firstWord.answer, 'at row', centerRow, 'col', startCol);
    
    // Place first word
    for (let i = 0; i < firstWord.length; i++) {
      newGrid[centerRow][startCol + i] = firstWord.answer[i];
    }

    placed.push({
      id: `word_0`,
      word: firstWord.answer,
      clue: firstWord.question,
      category: firstWord.category,
      row: centerRow,
      col: startCol,
      direction: 'across',
      length: firstWord.length,
      number: 1
    });

    console.log('First word placed successfully');

    // Try to place remaining words
    for (let wordIndex = 1; wordIndex < Math.min(words.length, 10); wordIndex++) {
      const currentWord = words[wordIndex];
      console.log(`\nTrying to place word ${wordIndex}:`, currentWord.answer);
      
      let bestPlacement = null;
      let bestScore = -1;

      // Try to intersect with each placed word
      for (const placedWord of placed) {
        console.log(`  Checking intersections with placed word:`, placedWord.word);
        
        // Find letter intersections
        for (let currentIndex = 0; currentIndex < currentWord.answer.length; currentIndex++) {
          for (let placedIndex = 0; placedIndex < placedWord.word.length; placedIndex++) {
            
            if (currentWord.answer[currentIndex] === placedWord.word[placedIndex]) {
              console.log(`    Found intersection: ${currentWord.answer[currentIndex]} at current[${currentIndex}] placed[${placedIndex}]`);
              
              // Try both directions
              const directions = placedWord.direction === 'across' ? ['down'] : ['across'];
              
              for (const direction of directions) {
                let newRow, newCol;
                
                if (direction === 'across') {
                  // Place current word horizontally, intersecting with vertical placed word
                  newRow = placedWord.row + placedIndex;
                  newCol = placedWord.col - currentIndex;
                } else {
                  // Place current word vertically, intersecting with horizontal placed word
                  newRow = placedWord.row - currentIndex;
                  newCol = placedWord.col + placedIndex;
                }
                
                console.log(`      Trying ${direction} placement at row ${newRow}, col ${newCol}`);
                
                // Check if placement is valid
                if (canPlaceWordAt(newGrid, currentWord.answer, newRow, newCol, direction)) {
                  const score = 100 + Math.random() * 10; // Simple scoring for now
                  console.log(`      Valid placement found with score ${score}`);
                  
                  if (score > bestScore) {
                    bestScore = score;
                    bestPlacement = {
                      row: newRow,
                      col: newCol,
                      direction: direction
                    };
                  }
                }
              }
            }
          }
        }
      }

      // Place the word if we found a valid placement
      if (bestPlacement) {
        console.log(`  Placing word at:`, bestPlacement);
        
        // Place word in grid
        for (let i = 0; i < currentWord.answer.length; i++) {
          const row = bestPlacement.direction === 'across' ? bestPlacement.row : bestPlacement.row + i;
          const col = bestPlacement.direction === 'across' ? bestPlacement.col + i : bestPlacement.col;
          newGrid[row][col] = currentWord.answer[i];
        }

        placed.push({
          id: `word_${wordIndex}`,
          word: currentWord.answer,
          clue: currentWord.question,
          category: currentWord.category,
          row: bestPlacement.row,
          col: bestPlacement.col,
          direction: bestPlacement.direction,
          length: currentWord.length,
          number: placed.length + 1
        });
        
        console.log(`  Word placed successfully! Total placed: ${placed.length}`);
      } else {
        console.log(`  Could not place word: ${currentWord.answer}`);
      }
    }

    // Assign proper numbering
    assignNumbers(placed);

    console.log('Final placed words:', placed.length);
    console.log('Placed words:', placed.map(p => `${p.word} (${p.direction})`));

    setGrid(newGrid);
    setPlacedWords(placed);
    setClues(editingClues.filter(clue => 
      placed.some(p => p.word === clue.answer.toUpperCase().replace(/[^A-Z]/g, ''))
    ));
    setUserAnswers({});
    setGameComplete(false);
    setSelectedCell(null);
    setSelectedClue(null);

    showToast(`Generated crossword with ${placed.length} words!`, 'success');
  }, [editingClues, gridSize, showToast]);

  // Simple helper function to check if word can be placed
  const canPlaceWordAt = (grid, word, row, col, direction) => {
    // Check bounds
    if (direction === 'across') {
      if (col < 0 || col + word.length > gridSize || row < 0 || row >= gridSize) {
        return false;
      }
    } else {
      if (row < 0 || row + word.length > gridSize || col < 0 || col >= gridSize) {
        return false;
      }
    }

    // Check each cell
    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      
      const existingLetter = grid[r][c];
      
      // If cell is occupied, it must match our letter
      if (existingLetter && existingLetter !== word[i]) {
        return false;
      }
      
      // Check for adjacent letters (only if this is an empty cell)
      if (!existingLetter) {
        // Check cells above and below (for across words) or left and right (for down words)
        if (direction === 'across') {
          // Check above
          if (r > 0 && grid[r - 1][c]) return false;
          // Check below
          if (r < gridSize - 1 && grid[r + 1][c]) return false;
        } else {
          // Check left
          if (c > 0 && grid[r][c - 1]) return false;
          // Check right
          if (c < gridSize - 1 && grid[r][c + 1]) return false;
        }
      }
    }
    
    // Check that the word doesn't extend into existing letters
    if (direction === 'across') {
      // Check letter before start
      if (col > 0 && grid[row][col - 1]) return false;
      // Check letter after end
      if (col + word.length < gridSize && grid[row][col + word.length]) return false;
    } else {
      // Check letter before start
      if (row > 0 && grid[row - 1][col]) return false;
      // Check letter after end
      if (row + word.length < gridSize && grid[row + word.length][col]) return false;
    }
    
    return true;
  };

  const assignNumbers = (placed) => {
    // Sort by position (top to bottom, left to right) for proper numbering
    const positions = new Map();
    let number = 1;

    // First, find all starting positions
    placed.forEach(word => {
      const key = `${word.row}-${word.col}`;
      if (!positions.has(key)) {
        positions.set(key, { row: word.row, col: word.col, number });
        number++;
      }
    });

    // Sort positions by row, then by column
    const sortedPositions = Array.from(positions.values()).sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    // Reassign numbers based on sorted order
    sortedPositions.forEach((pos, index) => {
      pos.number = index + 1;
    });

    // Update word numbers
    placed.forEach(word => {
      const key = `${word.row}-${word.col}`;
      const position = positions.get(key);
      if (position) {
        word.number = position.number;
      }
    });
  };

  // Handle user input
  const handleCellClick = (row, col) => {
    if (gameMode !== 'digital' || !isActive) return;

    // Only allow clicking on cells that are part of words
    if (!isCellPartOfWord(row, col)) return;

    setSelectedCell({ row, col });
    
    // Find words that include this cell
    const wordsAtCell = placedWords.filter(word => {
      if (word.direction === 'across') {
        return word.row === row && col >= word.col && col < word.col + word.length;
      } else {
        return word.col === col && row >= word.row && row < word.row + word.length;
      }
    });

    if (wordsAtCell.length > 0) {
      // Toggle between words if multiple
      const currentWordIndex = wordsAtCell.findIndex(w => w.id === selectedClue?.id);
      const nextWord = wordsAtCell[(currentWordIndex + 1) % wordsAtCell.length];
      setSelectedClue(nextWord);
      setSelectedDirection(nextWord.direction);
    }
  };

  const handleKeyPress = (e) => {
    if (!selectedCell || !selectedClue || gameMode !== 'digital' || !isActive) return;

    const { row, col } = selectedCell;
    const letter = e.key.toUpperCase();

    if (/^[A-Z]$/.test(letter)) {
      const wordKey = `${selectedClue.id}`;
      const cellIndex = selectedClue.direction === 'across' 
        ? col - selectedClue.col 
        : row - selectedClue.row;

      setUserAnswers(prev => ({
        ...prev,
        [wordKey]: {
          ...prev[wordKey],
          [cellIndex]: letter
        }
      }));

      // Move to next cell
      moveToNextCell();
    } else if (e.key === 'Backspace') {
      const wordKey = `${selectedClue.id}`;
      const cellIndex = selectedClue.direction === 'across' 
        ? col - selectedClue.col 
        : row - selectedClue.row;

      setUserAnswers(prev => ({
        ...prev,
        [wordKey]: {
          ...prev[wordKey],
          [cellIndex]: ''
        }
      }));
    }
  };

  const moveToNextCell = () => {
    if (!selectedCell || !selectedClue) return;

    const { row, col } = selectedCell;
    let nextRow = row;
    let nextCol = col;

    if (selectedClue.direction === 'across') {
      nextCol += 1;
      if (nextCol >= selectedClue.col + selectedClue.length) return;
    } else {
      nextRow += 1;
      if (nextRow >= selectedClue.row + selectedClue.length) return;
    }

    setSelectedCell({ row: nextRow, col: nextCol });
  };

  // Check if crossword is complete
  useEffect(() => {
    if (placedWords.length === 0) return;

    const allComplete = placedWords.every(word => {
      const userWord = userAnswers[word.id];
      if (!userWord) return false;

      for (let i = 0; i < word.length; i++) {
        if (!userWord[i] || userWord[i] !== word.word[i]) {
          return false;
        }
      }
      return true;
    });

    if (allComplete && !gameComplete) {
      setGameComplete(true);
      setIsActive(false);
      showToast('Congratulations! Crossword completed!', 'success');
    }
  }, [userAnswers, placedWords, gameComplete, showToast]);

  // Clue management
  const addClue = () => {
    if (!newClue.question.trim() || !newClue.answer.trim()) {
      showToast('Please enter both question and answer!', 'error');
      return;
    }

    const clue = {
      question: newClue.question.trim(),
      answer: newClue.answer.trim().toUpperCase(),
      category: newClue.category.trim() || 'General',
      id: Date.now()
    };

    setEditingClues(prev => [...prev, clue]);
    setNewClue({ question: '', answer: '', category: '' });
    showToast('Clue added successfully!', 'success');
  };

  const removeClue = (index) => {
    setEditingClues(prev => prev.filter((_, i) => i !== index));
    showToast('Clue removed!', 'info');
  };

  const clearAllClues = () => {
    setEditingClues([]);
    showToast('All clues cleared!', 'info');
  };

  const loadStarterClues = () => {
    setEditingClues([...starterClues]);
    showToast('Starter clues loaded!', 'success');
  };

  // Game controls
  const startGame = () => {
    if (placedWords.length === 0) {
      showToast('Generate a crossword first!', 'error');
      return;
    }
    setIsActive(true);
    setUserAnswers({});
    setGameComplete(false);
    setSelectedCell(null);
    setSelectedClue(null);
  };

  const stopGame = () => {
    setIsActive(false);
  };

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Crossword Puzzle</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .puzzle-container { display: flex; justify-content: center; margin: 20px 0; }
            .grid { display: grid; grid-template-columns: repeat(${gridSize}, 25px); gap: 1px; border: 2px solid #333; background: #333; }
            .cell { width: 25px; height: 25px; background: white; border: 1px solid #ccc; position: relative; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
            .cell.filled { background: ${printWithAnswers ? '#f0f0f0' : 'white'}; }
            .cell.blocked { background: #333; }
            .cell-number { position: absolute; top: 1px; left: 2px; font-size: 8px; font-weight: bold; }
            .clues { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
            .clue-section h3 { border-bottom: 1px solid #333; padding-bottom: 5px; }
            .clue-item { margin: 5px 0; font-size: 14px; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const generatePrintContent = () => {
    const date = new Date().toLocaleDateString();
    
    let gridHTML = '';
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const isPartOfWord = isCellPartOfWord(row, col);

        if (!isPartOfWord) {
          // This is a blocked cell - should be black
          gridHTML += `<div class="cell blocked"></div>`;
        } else {
          // This is an answer cell - should be white
          const startWord = placedWords.find(word => word.row === row && word.col === col);
          const cellContent = printWithAnswers ? (grid[row][col] || '') : '';
          const numberContent = startWord ? startWord.number : '';
          
          gridHTML += `
            <div class="cell filled">
              ${numberContent ? `<div class="cell-number">${numberContent}</div>` : ''}
              ${cellContent}
            </div>
          `;
        }
      }
    }

    const acrossClues = placedWords
      .filter(word => word.direction === 'across')
      .sort((a, b) => a.number - b.number)
      .map(word => `<div class="clue-item"><strong>${word.number}.</strong> ${word.clue}</div>`)
      .join('');

    const downClues = placedWords
      .filter(word => word.direction === 'down')
      .sort((a, b) => a.number - b.number)
      .map(word => `<div class="clue-item"><strong>${word.number}.</strong> ${word.clue}</div>`)
      .join('');

    return `
      <div class="header">
        <h1>Crossword Puzzle</h1>
        <p>Created on ${date} • ${placedWords.length} words</p>
      </div>
      
      <div class="puzzle-container">
        <div class="grid">${gridHTML}</div>
      </div>
      
      <div class="clues">
        <div class="clue-section">
          <h3>Across</h3>
          ${acrossClues || '<div class="clue-item">No across clues</div>'}
        </div>
        <div class="clue-section">
          <h3>Down</h3>
          ${downClues || '<div class="clue-item">No down clues</div>'}
        </div>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        Created with Classroom Champions Crossword Generator
      </div>
    `;
  };

  // Get cell style
  const getCellStyle = (row, col) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isPartOfWord = isCellPartOfWord(row, col);
    const isInSelectedWord = selectedClue && placedWords.some(word => {
      if (word.id === selectedClue.id) {
        if (word.direction === 'across') {
          return word.row === row && col >= word.col && col < word.col + word.length;
        } else {
          return word.col === col && row >= word.row && row < word.row + word.length;
        }
      }
      return false;
    });

    let className = "w-8 h-8 border border-gray-400 flex items-center justify-center text-sm font-bold relative transition-all ";

    if (!isPartOfWord) {
      className += "bg-gray-800"; // Blocked cell
    } else if (isSelected) {
      className += "bg-blue-200 border-blue-500 cursor-pointer";
    } else if (isInSelectedWord) {
      className += "bg-blue-100 border-blue-300 cursor-pointer";
    } else {
      className += "bg-white hover:bg-gray-50 cursor-pointer";
    }

    return className;
  };

  // Get user letter for cell
  const getUserLetter = (row, col) => {
    // Find any word that includes this cell
    const word = placedWords.find(word => {
      if (word.direction === 'across') {
        return word.row === row && col >= word.col && col < word.col + word.length;
      } else {
        return word.col === col && row >= word.row && row < word.row + word.length;
      }
    });

    if (!word) return '';

    const cellIndex = word.direction === 'across' ? col - word.col : row - word.row;
    const userWord = userAnswers[word.id];
    
    return userWord?.[cellIndex] || '';
  };

  // Get cell number
  const getCellNumber = (row, col) => {
    const startWord = placedWords.find(word => word.row === row && word.col === col);
    return startWord?.number || '';
  };

  // Check if cell is part of any word
  const isCellPartOfWord = (row, col) => {
    return placedWords.some(word => {
      if (word.direction === 'across') {
        return word.row === row && col >= word.col && col < word.col + word.length;
      } else {
        return word.col === col && row >= word.row && row < word.row + word.length;
      }
    });
  };

  // Event listener for keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isActive && selectedCell) {
        handleKeyPress(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, selectedCell, selectedClue, userAnswers]);

  return (
    <div className="space-y-6">
      {/* Game Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status */}
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
          }`}>
            {gameComplete ? '🏆 COMPLETE' : isActive ? '🧩 PLAYING' : '⏸️ READY'}
          </div>
          {placedWords.length > 0 && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-semibold">
              📝 {placedWords.length} words
            </div>
          )}
        </div>

        {/* Progress */}
        {isActive && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-semibold">
              ✅ {Object.keys(userAnswers).length}/{placedWords.length} started
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowClueEditor(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            📝 Edit Clues
          </button>

          <button
            onClick={generateCrossword}
            disabled={isActive}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            🔄 Generate
          </button>

          <button
            onClick={() => setShowPrintOptions(true)}
            disabled={placedWords.length === 0}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
          >
            🖨️ Print
          </button>

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
              disabled={placedWords.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
            >
              ▶️ Start
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Crossword Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800">🧩 Crossword Puzzle</h3>
              {gameMode === 'digital' && placedWords.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Click on a cell and type to fill in answers
                </p>
              )}
            </div>

            {placedWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧩</div>
                <h4 className="text-xl font-bold text-gray-700 mb-2">No Crossword Generated</h4>
                <p className="text-gray-600 mb-6">Add your clues and click Generate to create a crossword puzzle!</p>
                <button
                  onClick={() => setShowClueEditor(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  📝 Add Clues
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div 
                  className="grid gap-0 border-2 border-gray-800"
                  style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                >
                  {Array.from({ length: gridSize }, (_, row) =>
                    Array.from({ length: gridSize }, (_, col) => {
                      const cellNumber = getCellNumber(row, col);
                      const userLetter = getUserLetter(row, col);
                      const isPartOfWord = isCellPartOfWord(row, col);
                      
                      return (
                        <div
                          key={`${row}-${col}`}
                          onClick={() => handleCellClick(row, col)}
                          className={getCellStyle(row, col)}
                        >
                          {cellNumber && (
                            <div className="absolute top-0 left-0 text-xs font-bold text-gray-600 leading-none">
                              {cellNumber}
                            </div>
                          )}
                          {isPartOfWord && gameMode === 'digital' && isActive ? userLetter : ''}
                        </div>
                      );
                    })
                  ).flat()}
                </div>
              </div>
            )}

            {gameComplete && (
              <div className="mt-6 text-center">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 border-2 border-green-300">
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-2xl font-bold text-green-800 mb-2">Crossword Complete!</div>
                  <div className="text-lg text-green-700">All words filled correctly!</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clues Sidebar */}
        <div className="space-y-6">
          {/* Current Clue */}
          {selectedClue && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">
                {selectedClue.number} {selectedClue.direction === 'across' ? 'Across' : 'Down'}
              </h4>
              <p className="text-blue-700">{selectedClue.clue}</p>
              <div className="text-xs text-blue-600 mt-2">
                {selectedClue.category} • {selectedClue.length} letters
              </div>
            </div>
          )}

          {/* Clues List */}
          {placedWords.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-bold text-gray-800 mb-4">📝 Clues</h4>
              
              {/* Across Clues */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-700 mb-2">Across</h5>
                <div className="space-y-1">
                  {placedWords
                    .filter(word => word.direction === 'across')
                    .sort((a, b) => a.number - b.number)
                    .map(word => (
                      <div
                        key={word.id}
                        onClick={() => setSelectedClue(word)}
                        className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                          selectedClue?.id === word.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <strong>{word.number}.</strong> {word.clue}
                      </div>
                    ))}
                </div>
              </div>

              {/* Down Clues */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Down</h5>
                <div className="space-y-1">
                  {placedWords
                    .filter(word => word.direction === 'down')
                    .sort((a, b) => a.number - b.number)
                    .map(word => (
                      <div
                        key={word.id}
                        onClick={() => setSelectedClue(word)}
                        className={`text-sm p-2 rounded cursor-pointer transition-colors ${
                          selectedClue?.id === word.id
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <strong>{word.number}.</strong> {word.clue}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="font-bold text-yellow-800 mb-2">📋 How to Play</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click on a cell to select it</li>
              <li>• Type letters to fill in answers</li>
              <li>• Use Backspace to delete letters</li>
              <li>• Click clues to jump to words</li>
              <li>• Complete all words to win!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Clue Editor Modal */}
      {showClueEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">📝 Crossword Clue Editor</h3>

            {/* Add New Clue */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-bold mb-3">Add New Clue</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question/Clue</label>
                  <input
                    type="text"
                    value={newClue.question}
                    onChange={(e) => setNewClue(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="e.g., Capital of France"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                  <input
                    type="text"
                    value={newClue.answer}
                    onChange={(e) => setNewClue(prev => ({ ...prev, answer: e.target.value }))}
                    placeholder="e.g., PARIS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newClue.category}
                    onChange={(e) => setNewClue(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Geography"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={addClue}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ➕ Add Clue
              </button>
            </div>

            {/* Current Clues */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold">Current Clues ({editingClues.length})</h4>
                <div className="space-x-2">
                  <button
                    onClick={loadStarterClues}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📚 Load Examples
                  </button>
                  <button
                    onClick={clearAllClues}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    🗑️ Clear All
                  </button>
                </div>
              </div>

              {editingClues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No clues added yet. Add some clues above or load example clues.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {editingClues.map((clue, index) => (
                    <div key={index} className="bg-white border rounded-lg p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium">{clue.question}</div>
                        <div className="text-sm text-gray-600">
                          Answer: <span className="font-mono">{clue.answer}</span> • Category: {clue.category}
                        </div>
                      </div>
                      <button
                        onClick={() => removeClue(index)}
                        className="ml-3 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h5 className="font-bold text-blue-800 mb-2">💡 Tips for Good Crosswords</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use answers between 3-15 letters for best results</li>
                <li>• Include a mix of short and long words</li>
                <li>• Avoid special characters and numbers in answers</li>
                <li>• Add at least 5-8 clues for a good puzzle</li>
                <li>• Make clues clear and educational</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowClueEditor(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowClueEditor(false);
                  generateCrossword();
                }}
                disabled={editingClues.length < 3}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                🔄 Generate Crossword
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Options Modal */}
      {showPrintOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🖨️ Print Crossword</h3>
            
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
                  • Words: {placedWords.length} total
                  • Clues: {placedWords.filter(w => w.direction === 'across').length} across, {placedWords.filter(w => w.direction === 'down').length} down
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

export default CrosswordGame;