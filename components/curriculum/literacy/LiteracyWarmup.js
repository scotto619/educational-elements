// components/curriculum/literacy/LiteracyWarmup.js
// UPDATED LITERACY WARMUP COMPONENT WITH RANDOM NAME PICKER AND TIMER
import React, { useState, useEffect, useRef } from 'react';
import { literacyWarmupContent, getRandomGraphsForPractice } from './data/literacy-warmup-content';

// ===============================================
// COMPACT NAME PICKER WIDGET - FASTER SELECTION
// ===============================================
const CompactNamePicker = ({ students, isPresentationMode }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const startNameSpin = () => {
    if (students.length === 0) return;
    
    setIsSpinning(true);
    setSelectedStudent(null);
    let spins = 0;
    const maxSpins = Math.floor(Math.random() * 8) + 5; // 5-12 spins (much faster)

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % students.length);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(intervalRef.current);
        setIsSpinning(false);
        setSelectedStudent(students[currentIndex]);
        // Play celebration sound
        try {
          const audio = new Audio('/sounds/ding.mp3');
          audio.volume = 0.3;
          audio.play().catch(e => {});
        } catch(e) {}
      }
    }, 80); // Faster interval
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-yellow-50 border border-yellow-300 rounded-lg p-3 ${isPresentationMode ? 'p-6' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>🎯</span>
          <div>
            <h4 className={`font-bold text-yellow-800 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Name Picker</h4>
            <p className={`text-yellow-600 ${isPresentationMode ? 'text-lg' : 'text-xs'}`}>
              {isSpinning ? (
                <span className="animate-bounce font-bold">{students[currentIndex]?.firstName}...</span>
              ) : selectedStudent ? (
                <span className="font-bold text-green-600">✅ {selectedStudent.firstName}</span>
              ) : (
                'Select a student'
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={startNameSpin}
          disabled={isSpinning || students.length === 0}
          className={`bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-1 text-sm'}`}
        >
          {isSpinning ? '🎲' : '🎯'}
        </button>
      </div>
    </div>
  );
};

// ===============================================
// COMPACT TIMER WIDGET
// ===============================================
const CompactTimer = ({ isPresentationMode }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = (duration) => {
    setTimeLeft(duration);
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeLeft(0);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            // Play alarm sound
            try {
              const audio = new Audio('/sounds/ding.mp3');
              audio.volume = 0.5;
              audio.play().catch(e => {});
            } catch(e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft === 0 && !isRunning) return 'text-red-600';
    if (timeLeft <= 10) return 'text-red-500';
    if (timeLeft <= 30) return 'text-yellow-500';
    return 'text-green-600';
  };

  return (
    <div className={`bg-blue-50 border border-blue-300 rounded-lg p-3 ${isPresentationMode ? 'p-6' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>⏰</span>
          <div>
            <h4 className={`font-bold text-blue-800 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Timer</h4>
            <p className={`font-mono font-bold ${getTimerColor()} ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
              {formatTime(timeLeft)}
              {timeLeft === 0 && !isRunning && timeLeft !== 0 && <span className="text-red-600 ml-2 animate-pulse">⏰</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={() => startTimer(30)}
            disabled={isRunning}
            className={`bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs'}`}
          >
            30s
          </button>
          <button 
            onClick={() => startTimer(60)}
            disabled={isRunning}
            className={`bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs'}`}
          >
            1m
          </button>
          <button 
            onClick={() => startTimer(120)}
            disabled={isRunning}
            className={`bg-purple-500 text-white rounded font-bold hover:bg-purple-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs'}`}
          >
            2m
          </button>
          <button 
            onClick={resetTimer}
            className={`bg-gray-500 text-white rounded font-bold hover:bg-gray-600 transition-all ${isPresentationMode ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-xs'}`}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// GRAPH REVIEW TOOL - WITH SEQUENTIAL WORD HIGHLIGHTING
// ===============================================
const GraphReviewTool = ({ title, items, words, isPresentationMode }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [wordHighlightIndex, setWordHighlightIndex] = useState(-1);
    const [isWordHighlighting, setIsWordHighlighting] = useState(false);
    const intervalRef = useRef(null);
    const wordIntervalRef = useRef(null);

    const startHighlighting = () => {
        stopHighlighting();
        intervalRef.current = setInterval(() => {
            // Truly random index each time
            const randomIndex = Math.floor(Math.random() * items.length);
            setHighlightedIndex(randomIndex);
        }, 1500);
    };

    const stopHighlighting = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHighlightedIndex(-1);
    };

    const startWordHighlighting = () => {
        stopWordHighlighting();
        setIsWordHighlighting(true);
        setWordHighlightIndex(0);
        
        let currentWordIndex = 0;
        wordIntervalRef.current = setInterval(() => {
            currentWordIndex = (currentWordIndex + 1) % words.length;
            setWordHighlightIndex(currentWordIndex);
        }, 1000); // 1 second per word
    };

    const stopWordHighlighting = () => {
        clearInterval(wordIntervalRef.current);
        wordIntervalRef.current = null;
        setIsWordHighlighting(false);
        setWordHighlightIndex(-1);
    };

    useEffect(() => () => {
        stopHighlighting();
        stopWordHighlighting();
    }, []);

    return (
        <div className="space-y-6">
            <h3 className={`font-bold text-center text-gray-800 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className={`grid gap-3 mb-4 ${isPresentationMode ? 'grid-cols-5 text-6xl p-8' : 'grid-cols-5 text-4xl p-3'}`}>
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center font-bold rounded-lg transition-all duration-500 aspect-square ${highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg animate-pulse' : 'bg-white text-gray-800 hover:bg-gray-50'} ${isPresentationMode ? 'min-h-32' : 'min-h-20'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className={`text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors bg-blue-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}>🎯 Start Random Highlight</button>
                    <button onClick={stopHighlighting} className={`text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors bg-gray-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}>⏹️ Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📖 Read these words:</h4>
                <div className={`flex flex-wrap gap-4 justify-center ${isPresentationMode ? 'text-4xl gap-6' : 'text-2xl'}`}>
                    {words.map((word, i) => (
                        <span 
                            key={i} 
                            className={`px-4 py-3 rounded-lg shadow-md font-semibold border-2 transition-all duration-500 ${
                                wordHighlightIndex === i && isWordHighlighting
                                    ? 'bg-yellow-400 text-black border-yellow-600 scale-110 animate-pulse' 
                                    : 'bg-white text-green-700 border-green-200 hover:shadow-lg'
                            }`}
                        >
                            {word}
                        </span>
                    ))}
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <button 
                        onClick={startWordHighlighting}
                        disabled={isWordHighlighting}
                        className={`bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                    >
                        ➡️ Highlight Words in Order
                    </button>
                    <button 
                        onClick={stopWordHighlighting}
                        disabled={!isWordHighlighting}
                        className={`bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                    >
                        ⏹️ Stop
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// SOUND OF THE WEEK TOOL - WITH LARGER FONTS
// ===============================================
const SoundOfTheWeekTool = ({ content, isPresentationMode }) => {
    // Generate a proper 5x5 Boggle board with strategic sound placement
    const generateBoggleBoard = () => {
        const vowels = ['a', 'e', 'i', 'o', 'u'];
        const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
        const board = [];
        
        // Create 25 squares for 5x5 board
        for (let i = 0; i < 25; i++) {
            if (i === 4 || i === 12 || i === 20) {
                // Place focus sound in strategic positions (corners and center)
                board.push(content.focusSound);
            } else if (i % 3 === 0) {
                // Add vowels every 3rd position for better word formation
                board.push(vowels[Math.floor(Math.random() * vowels.length)]);
            } else {
                // Fill with random consonants
                board.push(consonants[Math.floor(Math.random() * consonants.length)]);
            }
        }
        
        return board;
    };

    const [boggleBoard] = useState(generateBoggleBoard());

    return (
        <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 lg:grid-cols-2 p-8' : 'grid-cols-1 lg:grid-cols-2'}`}>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className={`font-bold text-purple-800 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>
                    🔊 Focus Sound: 
                    <span className={`font-mono bg-white px-4 py-2 ml-3 rounded-lg border-2 border-purple-300 ${isPresentationMode ? 'text-8xl animate-pulse' : 'text-6xl'}`}>
                        {content.focusSound}
                    </span>
                </h3>
                <h4 className={`font-bold text-purple-700 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-2xl'}`}>📚 Sound Words:</h4>
                <div className={`flex flex-wrap gap-4 mb-6 ${isPresentationMode ? 'text-3xl gap-4' : 'text-xl'}`}>
                    {content.soundWords.map((word, i) => (
                        <span key={i} className="bg-white px-4 py-3 rounded-lg shadow-md font-semibold border-2 border-purple-200">{word}</span>
                    ))}
                </div>
                <h4 className={`font-bold text-purple-700 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-2xl'}`}>🎯 Extra Activities:</h4>
                <ul className={`list-disc list-inside space-y-2 text-purple-700 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                    {content.extraActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                </ul>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <h3 className={`font-bold text-yellow-800 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>🎲 Boggle Challenge</h3>
                <div className={`grid grid-cols-5 gap-2 max-w-lg mx-auto mb-4 ${isPresentationMode ? 'text-4xl gap-3 max-w-2xl' : 'text-3xl'}`}>
                    {boggleBoard.map((letter, i) => (
                        <div key={i} className={`flex items-center justify-center font-bold rounded-lg shadow-md aspect-square border-2 transition-all hover:scale-105 ${
                            letter === content.focusSound 
                                ? 'bg-gradient-to-br from-red-400 to-red-500 text-white border-red-600 animate-pulse' 
                                : 'bg-white text-gray-800 border-yellow-200 hover:bg-yellow-100'
                        }`}>
                            {letter.toUpperCase()}
                        </div>
                    ))}
                </div>
                <p className={`text-yellow-700 font-semibold ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                    🎯 Find words containing "{content.focusSound.toUpperCase()}" sound!
                </p>
                <p className={`text-yellow-600 mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                    Red squares contain the focus sound
                </p>
            </div>
        </div>
    );
};

// ===============================================
// READING PASSAGE TOOL - WITH DAILY ACTIVITIES AND 4 COPIES
// ===============================================
const ReadingPassageTool = ({ passage, isPresentationMode, currentDay = 0 }) => {
    const printableRef = useRef(null);
    
    const handlePrint = () => {
        const printWindow = window.open('', 'Print', 'height=800,width=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${passage.title} - Reading Passages</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 10px; 
                            line-height: 1.6; 
                            font-size: 16px;
                        }
                        .passage {
                            margin-bottom: 20px;
                            padding: 15px;
                            border: 2px solid #333;
                            page-break-inside: avoid;
                        }
                        .passage h3 { 
                            text-align: center; 
                            color: #333; 
                            margin-bottom: 15px; 
                            font-size: 20px;
                            border-bottom: 2px solid #666;
                            padding-bottom: 8px;
                        }
                        .passage p { 
                            font-size: 16px; 
                            margin-bottom: 10px;
                            line-height: 1.6;
                        }
                        .cut-line {
                            border-top: 2px dashed #999;
                            margin: 15px 0;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            padding-top: 5px;
                        }
                        @media print {
                            .cut-line { 
                                page-break-after: avoid; 
                            }
                        }
                    </style>
                </head>
                <body>
                    ${Array.from({ length: 4 }, (_, i) => `
                        <div class="passage">
                            <h3>${passage.title}</h3>
                            <p>${passage.text}</p>
                        </div>
                        ${i < 3 ? '<div class="cut-line">✂️ Cut along this line ✂️</div>' : ''}
                    `).join('')}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="space-y-6">
            <div ref={printableRef} className={`bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg ${isPresentationMode ? 'text-4xl leading-loose p-12' : 'text-2xl leading-relaxed'}`}>
                <h3 className={`font-bold text-center text-gray-800 mb-6 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>📖 {passage.title}</h3>
                <p className="text-gray-700">{passage.text}</p>
            </div>
            
            {/* Daily Reading Activities */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6">
                <h4 className={`font-bold text-orange-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📅 Daily Reading Activities</h4>
                <div className="space-y-3">
                    {passage.dailyActivities.map((activity, index) => (
                        <div key={index} className={`p-4 rounded-lg border-2 transition-all ${index === currentDay ? 'bg-orange-100 border-orange-400 font-bold' : 'bg-white border-orange-200'} ${isPresentationMode ? 'text-2xl p-6' : 'text-lg'}`}>
                            {activity}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <button 
                    onClick={handlePrint} 
                    className={`bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 shadow-lg transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                >
                    🖨️ Print 4 Copies (with cut lines)
                </button>
            </div>
        </div>
    );
};

// ===============================================
// LANGUAGE TOOL - WITH DAILY DIFFERENT SYNONYMS/ANTONYMS
// ===============================================
const LanguageTool = ({ language, isPresentationMode, currentDay = 0 }) => {
    const todaysSynonyms = language.dailySynonyms[currentDay] || language.dailySynonyms[0];
    const todaysAntonyms = language.dailyAntonyms[currentDay] || language.dailyAntonyms[0];
    const todaysTask = language.dailyTasks[currentDay] || language.dailyTasks[0];

    return (
        <div className="space-y-6">
            <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                    <h3 className={`font-bold text-indigo-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>🔄 Synonyms (Same Meaning)</h3>
                    <div className="space-y-3">
                        {/* Complete examples */}
                        {todaysSynonyms.complete.map(([word1, word2], i) => (
                            <div key={i} className={`bg-white p-3 rounded-lg text-center border-2 border-indigo-200 ${isPresentationMode ? 'text-3xl p-4' : 'text-xl'}`}>
                                <span className="font-semibold text-indigo-600">{word1}</span>
                                <span className="mx-3 text-gray-500">=</span>
                                <span className="font-semibold text-indigo-600">{word2}</span>
                            </div>
                        ))}
                        
                        {/* Incomplete examples for students to complete */}
                        {todaysSynonyms.incomplete.map((word, i) => (
                            <div key={`incomplete-syn-${i}`} className={`bg-yellow-50 p-3 rounded-lg text-center border-2 border-yellow-300 ${isPresentationMode ? 'text-3xl p-4' : 'text-xl'}`}>
                                <span className="font-semibold text-indigo-600">{word}</span>
                                <span className="mx-3 text-gray-500">=</span>
                                <span className="font-semibold text-yellow-600 bg-yellow-200 px-3 py-1 rounded">?</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
                    <h3 className={`font-bold text-pink-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>↔️ Antonyms (Opposite Meaning)</h3>
                    <div className="space-y-3">
                        {/* Complete examples */}
                        {todaysAntonyms.complete.map(([word1, word2], i) => (
                            <div key={i} className={`bg-white p-3 rounded-lg text-center border-2 border-pink-200 ${isPresentationMode ? 'text-3xl p-4' : 'text-xl'}`}>
                                <span className="font-semibold text-pink-600">{word1}</span>
                                <span className="mx-3 text-gray-500">≠</span>
                                <span className="font-semibold text-pink-600">{word2}</span>
                            </div>
                        ))}
                        
                        {/* Incomplete examples for students to complete */}
                        {todaysAntonyms.incomplete.map((word, i) => (
                            <div key={`incomplete-ant-${i}`} className={`bg-yellow-50 p-3 rounded-lg text-center border-2 border-yellow-300 ${isPresentationMode ? 'text-3xl p-4' : 'text-xl'}`}>
                                <span className="font-semibold text-pink-600">{word}</span>
                                <span className="mx-3 text-gray-500">≠</span>
                                <span className="font-semibold text-yellow-600 bg-yellow-200 px-3 py-1 rounded">?</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Daily Grammar & Punctuation Task */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h3 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📝 Today's Grammar & Punctuation Task</h3>
                <div className={`p-4 rounded-lg bg-green-100 border-2 border-green-400 font-bold ${isPresentationMode ? 'text-2xl p-6' : 'text-lg'}`}>
                    <p className="text-green-700">{todaysTask}</p>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// RIDDLE OF THE DAY TOOL
// ===============================================
const RiddleOfTheDayTool = ({ riddles, isPresentationMode, currentDay = 0 }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const currentRiddle = riddles[currentDay] || riddles[0];

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center">
            <h3 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>🧩 Riddle of the Day</h3>
            
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                <h4 className={`font-bold text-yellow-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>{currentRiddle.day}</h4>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md mb-6">
                <p className={`text-purple-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-2xl'}`}>{currentRiddle.riddle}</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
                <button 
                    onClick={() => setShowHint(!showHint)}
                    className={`bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                >
                    💡 {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className={`bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                >
                    🎯 {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
            </div>

            {showHint && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                    <p className={`text-yellow-700 font-semibold ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                        💡 Hint: {currentRiddle.hint}
                    </p>
                </div>
            )}

            {showAnswer && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 animate-pulse">
                    <p className={`text-green-700 font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
                        🎉 Answer: {currentRiddle.answer}
                    </p>
                </div>
            )}
        </div>
    );
};

// ===============================================
// FUN FACT OF THE DAY TOOL
// ===============================================
const FunFactOfTheDayTool = ({ funFacts, isPresentationMode, currentDay = 0 }) => {
    const currentFact = funFacts[currentDay] || funFacts[0];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className={`font-bold text-blue-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>🌟 Fun Fact of the Day</h3>
            
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <h4 className={`font-bold text-blue-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>{dayNames[currentDay] || 'Monday'}</h4>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md">
                <p className={`text-blue-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-2xl'}`}>{currentFact}</p>
            </div>

            <p className={`text-blue-600 mt-4 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                🧠 Share this amazing fact with someone today!
            </p>
        </div>
    );
};

// ===============================================
// MAIN LITERACY WARMUP COMPONENT
// ===============================================
const LiteracyWarmup = ({ showToast = () => {}, students = [], saveData = () => {}, loadedData = {} }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentDay, setCurrentDay] = useState(0); // 0=Monday, 1=Tuesday, etc.

  const WARMUP_STEPS = [
    { id: 'graph_review', title: 'Graph Review', icon: '🔤' },
    { id: 'sound_of_week', title: 'Sound of the Week', icon: '🔊' },
    { id: 'reading', title: 'Reading Passage', icon: '📖' },
    { id: 'language', title: 'Language Activities', icon: '📝' },
    { id: 'riddle', title: 'Riddle of the Day', icon: '🧩' },
    { id: 'fun_fact', title: 'Fun Fact of the Day', icon: '🌟' }
  ];

  const weeklyContent = literacyWarmupContent[selectedWeek];
  if (!weeklyContent) {
    return (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold text-red-600">Error: Content for {selectedWeek} not found.</h3>
            <p className="text-gray-600">Please select a different week.</p>
        </div>
    );
  }
  
  const currentStep = WARMUP_STEPS[currentStepIndex];

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode - perfect for classroom display!', 
      'success'
    );
  };

  const goToNextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, WARMUP_STEPS.length - 1));
  const goToPrevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  const goToStep = (stepIndex) => setCurrentStepIndex(stepIndex);

  const renderCurrentStep = () => {
    const randomGraphs = getRandomGraphsForPractice(selectedWeek);
    
    switch(currentStep.id) {
        case 'graph_review':
            return <GraphReviewTool 
                     title="📚 Review Letters, Digraphs & More" 
                     items={randomGraphs} 
                     words={weeklyContent.soundWords} 
                     isPresentationMode={isPresentationMode} 
                   />;
        case 'sound_of_week':
            return <SoundOfTheWeekTool content={weeklyContent} isPresentationMode={isPresentationMode} />;
        case 'reading':
            return <ReadingPassageTool 
                     passage={weeklyContent.readingPassage} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'language':
            return <LanguageTool 
                     language={weeklyContent.language} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'riddle':
            return <RiddleOfTheDayTool 
                     riddles={weeklyContent.riddleOfTheDay} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'fun_fact':
            return <FunFactOfTheDayTool 
                     funFacts={weeklyContent.funFactOfTheDay} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        default:
            return <div className="text-center text-gray-500 p-8">Step not found</div>;
    }
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen' : ''}`}>
      {/* Warmup Header */}
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg ${isPresentationMode ? 'p-12' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-4xl'}`}>
              <span className="mr-3">🔥</span>
              Literacy Warmup
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>Interactive phonics and literacy lessons</p>
          </div>
          <button
            onClick={togglePresentationMode}
            className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
          >
            {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
          </button>
        </div>
      </div>

      {/* Week and Day Selection */}
      {!isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-gray-800">📅 Select Teaching Week & Day</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="week-select" className="font-semibold text-gray-700">Week:</label>
                <select 
                  id="week-select" 
                  value={selectedWeek} 
                  onChange={e => { 
                    setSelectedWeek(e.target.value); 
                    setCurrentStepIndex(0); 
                    showToast(`Switched to ${e.target.value.replace('week', 'Week ')} - Focus: ${literacyWarmupContent[e.target.value].focusSound.toUpperCase()}`, 'info');
                  }} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm"
                >
                  {Object.keys(literacyWarmupContent).map(weekKey => (
                    <option key={weekKey} value={weekKey}>
                      {weekKey.replace('week', 'Week ')} - Focus: {literacyWarmupContent[weekKey].focusSound.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="day-select" className="font-semibold text-gray-700">Day:</label>
                <select 
                  id="day-select" 
                  value={currentDay} 
                  onChange={e => setCurrentDay(parseInt(e.target.value))} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm"
                >
                  <option value={0}>Monday</option>
                  <option value={1}>Tuesday</option>
                  <option value={2}>Wednesday</option>
                  <option value={3}>Thursday</option>
                  <option value={4}>Friday</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Classroom Tools - Always Available */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>🛠️ Quick Classroom Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CompactNamePicker students={students} isPresentationMode={isPresentationMode} />
          <CompactTimer isPresentationMode={isPresentationMode} />
        </div>
      </div>

      {/* Presentation Mode Week & Day Display */}
      {isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h4 className="text-5xl font-bold text-gray-800 mb-4">
            📚 Week {selectedWeek.replace('week', '')} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
          </h4>
          <div className="text-8xl font-mono bg-purple-100 px-6 py-3 rounded-lg text-purple-700 animate-pulse inline-block">
            Focus Sound: {weeklyContent.focusSound.toUpperCase()}
          </div>
        </div>
      )}

      {/* Lesson Steps Navigation */}
      <div className={`bg-white rounded-xl shadow-lg p-6 ${isPresentationMode ? 'p-10' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>🎯 Lesson Steps</h4>
        <div className={`flex flex-wrap gap-3 ${isPresentationMode ? 'gap-6 justify-center' : ''}`}>
          {WARMUP_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
                currentStepIndex === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-2'}`}
            >
              <span>{step.icon}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 ${isPresentationMode ? 'p-10' : 'p-6'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`font-bold text-blue-600 flex items-center gap-2 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                        Step {currentStepIndex + 1} of {WARMUP_STEPS.length} • Focus Sound: 
                        <span className="font-bold text-purple-600 ml-1">{weeklyContent.focusSound.toUpperCase()}</span>
                        • {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-gray-500 ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>Week {selectedWeek.replace('week', '')}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isPresentationMode ? 'gap-3' : ''}`}>
                        {WARMUP_STEPS.map((_, index) => (
                            <div 
                                key={index} 
                                className={`rounded-full transition-colors ${
                                    currentStepIndex === index ? 'bg-blue-500' : 
                                    currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                                } ${isPresentationMode ? 'w-8 h-8' : 'w-4 h-4'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className={`${isPresentationMode ? 'p-12' : 'p-6'}`}>
            {renderCurrentStep()}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className={`flex justify-between items-center bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-10' : 'p-6'}`}>
        <button 
          onClick={goToPrevStep} 
          disabled={currentStepIndex === 0} 
          className={`flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3'}`}
        >
          <span>⬅️</span>
          Previous
        </button>
        
        <div className="text-center">
          <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-sm'}`}>📊 Lesson Progress</p>
          <div className={`flex items-center gap-2 ${isPresentationMode ? 'gap-4' : ''}`}>
              {WARMUP_STEPS.map((step, index) => (
                  <div 
                      key={step.id} 
                      className={`rounded-full transition-colors ${
                          currentStepIndex === index ? 'bg-blue-500' : 
                          currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                      } ${isPresentationMode ? 'w-10 h-10' : 'w-4 h-4'}`}
                  ></div>
              ))}
          </div>
        </div>
        
        <button 
          onClick={goToNextStep} 
          disabled={currentStepIndex === WARMUP_STEPS.length - 1} 
          className={`flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3'}`}
        >
          Next
          <span>➡️</span>
        </button>
      </div>

      {/* Teaching Tips - Hidden in presentation mode for cleaner display */}
      {!isPresentationMode && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-green-800 mb-2">🎯 Teaching Tip</h4>
              <p className="text-green-700">
                New features: Compact name picker and timer tools available on every lesson, sequential word highlighting, 
                daily different synonyms/antonyms, 4-copy printing, and complete 10-week curriculum! 
                Use the day selector to match your weekly schedule.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteracyWarmup;