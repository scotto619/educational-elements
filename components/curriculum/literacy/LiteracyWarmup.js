// components/curriculum/literacy/LiteracyWarmup.js
// GREATLY IMPROVED LITERACY WARMUP COMPONENT WITH PROGRESSIVE COMPLEXITY
import React, { useState, useEffect, useRef } from 'react';
import { literacyWarmupContent, getProgressiveGraphs } from './data/literacy-warmup-content';

// ===============================================
// GRAPH REVIEW TOOL - WITH TRUE RANDOM HIGHLIGHTING
// ===============================================
const GraphReviewTool = ({ title, items, words, isPresentationMode }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const intervalRef = useRef(null);

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

    useEffect(() => () => stopHighlighting(), []);

    return (
        <div className="space-y-6">
            <h3 className={`font-bold text-center text-gray-800 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-2xl'}`}>{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className={`grid gap-2 mb-4 ${isPresentationMode ? 'grid-cols-6 text-4xl p-8' : 'grid-cols-8 text-xl p-3'}`}>
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center font-bold rounded-lg transition-all duration-500 aspect-square ${highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg animate-pulse' : 'bg-white text-gray-800 hover:bg-gray-50'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className={`text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors bg-blue-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : ''}`}>🎯 Start Random Highlight</button>
                    <button onClick={stopHighlighting} className={`text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors bg-gray-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : ''}`}>⏹️ Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className={`font-bold text-green-800 mb-2 ${isPresentationMode ? 'text-4xl' : 'text-lg'}`}>📖 Read these words:</h4>
                <div className={`flex flex-wrap gap-3 mb-4 ${isPresentationMode ? 'text-4xl gap-6' : 'text-xl'}`}>
                    {words.map((word, i) => <span key={i} className="bg-white px-4 py-3 rounded-lg shadow-md font-semibold border-2 border-green-200 hover:shadow-lg transition-shadow">{word}</span>)}
                </div>
                <p className={`text-green-700 font-semibold ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>✍️ Now, can you write 3 of your own words?</p>
            </div>
        </div>
    );
};

// ===============================================
// SOUND OF THE WEEK TOOL - WITH PROPER BOGGLE BOARD
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
                <h3 className={`font-bold text-purple-800 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
                    🔊 Focus Sound: 
                    <span className={`font-mono bg-white px-4 py-2 ml-3 rounded-lg border-2 border-purple-300 ${isPresentationMode ? 'text-8xl animate-pulse' : 'text-5xl'}`}>
                        {content.focusSound}
                    </span>
                </h3>
                <h4 className={`font-bold text-purple-700 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>📚 Sound Words:</h4>
                <div className={`flex flex-wrap gap-3 mb-6 ${isPresentationMode ? 'text-3xl gap-4' : 'text-lg'}`}>
                    {content.soundWords.map((word, i) => (
                        <span key={i} className="bg-white px-4 py-2 rounded-lg shadow-md font-semibold border-2 border-purple-200">{word}</span>
                    ))}
                </div>
                <h4 className={`font-bold text-purple-700 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>🎯 Extra Activities:</h4>
                <ul className={`list-disc list-inside space-y-2 text-purple-700 ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                    {content.extraActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                </ul>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <h3 className={`font-bold text-yellow-800 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>🎲 Boggle Challenge</h3>
                <div className={`grid grid-cols-5 gap-2 max-w-lg mx-auto mb-4 ${isPresentationMode ? 'text-4xl gap-3 max-w-2xl' : 'text-2xl'}`}>
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
                <p className={`text-yellow-700 font-semibold ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                    🎯 Find words containing "{content.focusSound.toUpperCase()}" sound!
                </p>
                <p className={`text-yellow-600 mt-2 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                    Red squares contain the focus sound
                </p>
            </div>
        </div>
    );
};

// ===============================================
// READING PASSAGE TOOL - WITH IMPROVED PRINTING
// ===============================================
const ReadingPassageTool = ({ passage, isPresentationMode }) => {
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
                            line-height: 1.4; 
                            font-size: 14px;
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
                            font-size: 18px;
                            border-bottom: 2px solid #666;
                            padding-bottom: 8px;
                        }
                        .passage p { 
                            font-size: 14px; 
                            margin-bottom: 10px;
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
                    ${Array.from({ length: 5 }, (_, i) => `
                        <div class="passage">
                            <h3>${passage.title}</h3>
                            <p>${passage.text}</p>
                        </div>
                        ${i < 4 ? '<div class="cut-line">✂️ Cut along this line ✂️</div>' : ''}
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
        <div>
            <div ref={printableRef} className={`bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg ${isPresentationMode ? 'text-3xl leading-loose p-12' : 'text-lg leading-relaxed'}`}>
                <h3 className={`font-bold text-center text-gray-800 mb-6 ${isPresentationMode ? 'text-6xl' : 'text-2xl'}`}>📖 {passage.title}</h3>
                <p className="text-gray-700">{passage.text}</p>
            </div>
            <div className="text-center mt-6">
                <button 
                    onClick={handlePrint} 
                    className={`bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 shadow-lg transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl transform hover:scale-105' : ''}`}
                >
                    🖨️ Print 5 Copies (with cut lines)
                </button>
            </div>
        </div>
    );
};

// ===============================================
// LANGUAGE TOOL - WITH INCOMPLETE EXAMPLES
// ===============================================
const LanguageTool = ({ language, isPresentationMode }) => (
    <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
            <h3 className={`font-bold text-indigo-800 mb-3 ${isPresentationMode ? 'text-4xl' : 'text-lg'}`}>🔄 Synonyms (Same Meaning)</h3>
            <div className="space-y-3">
                {/* Complete examples */}
                {language.synonyms.map(([word1, word2], i) => (
                    <div key={i} className={`bg-white p-3 rounded-lg text-center border-2 border-indigo-200 ${isPresentationMode ? 'text-2xl p-4' : ''}`}>
                        <span className="font-semibold text-indigo-600">{word1}</span>
                        <span className="mx-3 text-gray-500">=</span>
                        <span className="font-semibold text-indigo-600">{word2}</span>
                    </div>
                ))}
                
                {/* Incomplete examples for students to complete */}
                {language.incompleteSynonyms.map((word, i) => (
                    <div key={`incomplete-syn-${i}`} className={`bg-yellow-50 p-3 rounded-lg text-center border-2 border-yellow-300 ${isPresentationMode ? 'text-2xl p-4' : ''}`}>
                        <span className="font-semibold text-indigo-600">{word}</span>
                        <span className="mx-3 text-gray-500">=</span>
                        <span className="font-semibold text-yellow-600 bg-yellow-200 px-3 py-1 rounded">?</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
            <h3 className={`font-bold text-pink-800 mb-3 ${isPresentationMode ? 'text-4xl' : 'text-lg'}`}>↔️ Antonyms (Opposite Meaning)</h3>
            <div className="space-y-3">
                {/* Complete examples */}
                {language.antonyms.map(([word1, word2], i) => (
                    <div key={i} className={`bg-white p-3 rounded-lg text-center border-2 border-pink-200 ${isPresentationMode ? 'text-2xl p-4' : ''}`}>
                        <span className="font-semibold text-pink-600">{word1}</span>
                        <span className="mx-3 text-gray-500">≠</span>
                        <span className="font-semibold text-pink-600">{word2}</span>
                    </div>
                ))}
                
                {/* Incomplete examples for students to complete */}
                {language.incompleteAntonyms.map((word, i) => (
                    <div key={`incomplete-ant-${i}`} className={`bg-yellow-50 p-3 rounded-lg text-center border-2 border-yellow-300 ${isPresentationMode ? 'text-2xl p-4' : ''}`}>
                        <span className="font-semibold text-pink-600">{word}</span>
                        <span className="mx-3 text-gray-500">≠</span>
                        <span className="font-semibold text-yellow-600 bg-yellow-200 px-3 py-1 rounded">?</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:col-span-2">
            <h3 className={`font-bold text-green-800 mb-3 ${isPresentationMode ? 'text-4xl' : 'text-lg'}`}>📝 Grammar & Punctuation Tasks</h3>
            <div className="space-y-4">
                <div className={`bg-white p-4 rounded-lg border-2 border-green-200 ${isPresentationMode ? 'text-2xl p-6' : ''}`}>
                    <p className="font-semibold text-green-700 mb-2">🎯 Grammar Task:</p>
                    <p className="text-gray-700">{language.grammarTask}</p>
                </div>
                <div className={`bg-white p-4 rounded-lg border-2 border-green-200 ${isPresentationMode ? 'text-2xl p-6' : ''}`}>
                    <p className="font-semibold text-green-700 mb-2">✏️ Punctuation Task:</p>
                    <p className="text-gray-700">{language.punctuationTask}</p>
                </div>
            </div>
        </div>
    </div>
);

// ===============================================
// WRITING TOOL
// ===============================================
const WritingTool = ({ prompt, isPresentationMode }) => (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
        <h3 className={`font-bold text-orange-800 mb-4 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-2xl'}`}>✍️ Writing Prompt</h3>
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-md">
            <p className={`text-orange-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-xl'}`}>{prompt}</p>
        </div>
        <p className={`text-orange-600 mt-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>📝 Students can write on paper or in their exercise books</p>
    </div>
);

// ===============================================
// NEW LESSON STEPS
// ===============================================

// Riddle of the Week Tool
const RiddleOfTheWeekTool = ({ riddle, isPresentationMode }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center">
            <h3 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-2xl'}`}>🧩 Riddle of the Week</h3>
            
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md mb-6">
                <p className={`text-purple-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-xl'}`}>{riddle.riddle}</p>
            </div>

            <div className="flex justify-center gap-4 mb-6">
                <button 
                    onClick={() => setShowHint(!showHint)}
                    className={`bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : ''}`}
                >
                    💡 {showHint ? 'Hide Hint' : 'Show Hint'}
                </button>
                <button 
                    onClick={() => setShowAnswer(!showAnswer)}
                    className={`bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : ''}`}
                >
                    🎯 {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </button>
            </div>

            {showHint && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                    <p className={`text-yellow-700 font-semibold ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                        💡 Hint: {riddle.hint}
                    </p>
                </div>
            )}

            {showAnswer && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 animate-pulse">
                    <p className={`text-green-700 font-bold ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
                        🎉 Answer: {riddle.answer}
                    </p>
                </div>
            )}
        </div>
    );
};

// Fun Fact of the Week Tool
const FunFactOfTheWeekTool = ({ funFact, isPresentationMode }) => (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 text-center">
        <h3 className={`font-bold text-blue-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-2xl'}`}>🌟 Fun Fact of the Week</h3>
        
        <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md">
            <p className={`text-blue-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-xl'}`}>{funFact}</p>
        </div>

        <p className={`text-blue-600 mt-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
            🧠 Share this amazing fact with someone today!
        </p>
    </div>
);

// Focus Words Tool (Teacher Editable)
const FocusWordsOfTheWeekTool = ({ focusWords, onUpdateWords, isPresentationMode }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedWords, setEditedWords] = useState([...focusWords]);

    const handleSaveWords = () => {
        onUpdateWords(editedWords);
        setIsEditing(false);
    };

    const handleWordChange = (index, newWord) => {
        const updated = [...editedWords];
        updated[index] = newWord;
        setEditedWords(updated);
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className={`font-bold text-emerald-800 ${isPresentationMode ? 'text-6xl' : 'text-2xl'}`}>📝 Focus Words of the Week</h3>
                {!isPresentationMode && (
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-all"
                    >
                        {isEditing ? '❌ Cancel' : '✏️ Edit Words'}
                    </button>
                )}
            </div>

            <div className={`grid gap-4 ${isPresentationMode ? 'grid-cols-2 md:grid-cols-3 text-4xl' : 'grid-cols-3 md:grid-cols-5 text-xl'}`}>
                {isEditing ? (
                    editedWords.map((word, index) => (
                        <input
                            key={index}
                            value={word}
                            onChange={(e) => handleWordChange(index, e.target.value)}
                            className="bg-white px-3 py-2 rounded-lg shadow-md font-semibold border-2 border-emerald-200 text-center focus:border-emerald-500 focus:outline-none"
                        />
                    ))
                ) : (
                    focusWords.map((word, index) => (
                        <div key={index} className="bg-white px-4 py-3 rounded-lg shadow-md font-semibold border-2 border-emerald-200 text-center hover:shadow-lg transition-shadow">
                            {word}
                        </div>
                    ))
                )}
            </div>

            {isEditing && (
                <div className="text-center mt-6">
                    <button 
                        onClick={handleSaveWords}
                        className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 shadow-lg transition-all"
                    >
                        💾 Save Words
                    </button>
                </div>
            )}

            <p className={`text-emerald-600 mt-4 text-center ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                🎯 Practice reading and spelling these important words!
            </p>
        </div>
    );
};

// ===============================================
// MAIN LITERACY WARMUP COMPONENT
// ===============================================
const LiteracyWarmup = ({ showToast = () => {}, students = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [customFocusWords, setCustomFocusWords] = useState({});

  const WARMUP_STEPS = [
    { id: 'graph_review', title: 'Graph Review', icon: '🔤' },
    { id: 'sound_of_week', title: 'Sound of the Week', icon: '🔊' },
    { id: 'reading', title: 'Reading Passage', icon: '📖' },
    { id: 'language', title: 'Language Activities', icon: '📝' },
    { id: 'writing', title: 'Writing Prompt', icon: '✍️' },
    { id: 'riddle', title: 'Riddle of the Week', icon: '🧩' },
    { id: 'fun_fact', title: 'Fun Fact', icon: '🌟' },
    { id: 'focus_words', title: 'Focus Words', icon: '📝' }
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

  const handleUpdateFocusWords = (newWords) => {
    setCustomFocusWords(prev => ({
      ...prev,
      [selectedWeek]: newWords
    }));
    showToast('Focus words updated!', 'success');
  };

  const getCurrentFocusWords = () => {
    return customFocusWords[selectedWeek] || weeklyContent.focusWords;
  };

  const renderCurrentStep = () => {
    const progressiveGraphs = getProgressiveGraphs(selectedWeek);
    
    switch(currentStep.id) {
        case 'graph_review':
            return <GraphReviewTool title="📚 Review Letters, Digraphs & More" items={progressiveGraphs} words={weeklyContent.soundWords} isPresentationMode={isPresentationMode} />;
        case 'sound_of_week':
            return <SoundOfTheWeekTool content={weeklyContent} isPresentationMode={isPresentationMode} />;
        case 'reading':
            return <ReadingPassageTool passage={weeklyContent.readingPassage} isPresentationMode={isPresentationMode} />;
        case 'language':
            return <LanguageTool language={weeklyContent.language} isPresentationMode={isPresentationMode} />;
        case 'writing':
            return <WritingTool prompt={weeklyContent.writingPrompt} isPresentationMode={isPresentationMode} />;
        case 'riddle':
            return <RiddleOfTheWeekTool riddle={weeklyContent.riddleOfTheWeek} isPresentationMode={isPresentationMode} />;
        case 'fun_fact':
            return <FunFactOfTheWeekTool funFact={weeklyContent.funFact} isPresentationMode={isPresentationMode} />;
        case 'focus_words':
            return <FocusWordsOfTheWeekTool focusWords={getCurrentFocusWords()} onUpdateWords={handleUpdateFocusWords} isPresentationMode={isPresentationMode} />;
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
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-3xl'}`}>
              <span className="mr-3">🔥</span>
              Literacy Warmup
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>Interactive phonics and literacy lessons</p>
          </div>
          <button
            onClick={togglePresentationMode}
            className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
          >
            {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
          </button>
        </div>
      </div>

      {/* Week Selection */}
      {!isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h4 className="text-xl font-bold text-gray-800">📅 Select Teaching Week</h4>
          <div className="flex items-center gap-4">
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
        </div>
      )}

      {/* Presentation Mode Week Display */}
      {isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h4 className="text-5xl font-bold text-gray-800">
            📚 Week {selectedWeek.replace('week', '')} - Focus Sound: 
            <span className="text-8xl font-mono bg-purple-100 px-6 py-3 ml-4 rounded-lg text-purple-700 animate-pulse">
              {weeklyContent.focusSound.toUpperCase()}
            </span>
          </h4>
        </div>
      )}

      {/* Lesson Steps Navigation */}
      <div className={`bg-white rounded-xl shadow-lg p-6 ${isPresentationMode ? 'p-10' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-lg'}`}>🎯 Lesson Steps</h4>
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
                    <h4 className={`font-bold text-blue-600 flex items-center gap-2 ${isPresentationMode ? 'text-6xl' : 'text-2xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isPresentationMode ? 'text-3xl' : 'text-base'}`}>
                        Step {currentStepIndex + 1} of {WARMUP_STEPS.length} • Focus Sound: 
                        <span className="font-bold text-purple-600 ml-1">{weeklyContent.focusSound.toUpperCase()}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-gray-500 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Week {selectedWeek.replace('week', '')}</p>
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
                The lesson complexity increases with each week! Notice how more graph types are introduced progressively. 
                Use "Presentation Mode" for an immersive classroom experience with 8 engaging activities!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteracyWarmup;