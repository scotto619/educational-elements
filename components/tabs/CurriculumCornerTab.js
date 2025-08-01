// components/tabs/CurriculumCornerTab.js - FIXED WITH PROPER LITERACY CONTENT INTEGRATION
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// LITERACY CONTENT DATA (Embedded to avoid import issues)
// ===============================================
const literacyContent = {
  "week1": {
    "focusSound": "sh",
    "graphReview": {
      "graphs": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      "digraphs": ["sh", "ch", "th", "wh", "ph", "ck", "ng"],
      "trigraphs": ["tch", "dge", "igh", "sch"],
      "quadgraphs": ["ough", "eigh", "augh", "tion"]
    },
    "soundWords": ["fish", "ship", "brush", "crash", "fresh"],
    "boggleLetters": ["h", "i", "a", "u", "s", "l", "n"],
    "extraActivities": [
      "Write 3 more words with 'sh'",
      "Highlight the 'sh' in each word",
      "Find 5 things in the room that start with 'sh'"
    ],
    "readingPassage": {
      "title": "The Fish and the Ship",
      "text": "Once upon a time, there was a little fish who lived near a big ship. The fish would splash and dash around the ship every day. The ship's crew would wash the deck and brush away the salt. They used a fresh cloth to shine the ship until it would flash in the sunlight."
    },
    "language": {
      "synonyms": [["happy", "joyful"], ["big", "large"]],
      "antonyms": [["hot", "cold"], ["fast", "slow"]],
      "grammarTask": "Underline the verbs in the passage.",
      "punctuationTask": "Fix the punctuation in: 'can we go now she asked'"
    },
    "writingPrompt": "Write a story using at least three words that include the sound 'sh'."
  },
  "week2": {
    "focusSound": "ch",
    "graphReview": {
      "graphs": ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
      "digraphs": ["sh", "ch", "th", "wh", "ph", "ck", "ng"],
      "trigraphs": ["tch", "dge", "igh", "sch"],
      "quadgraphs": ["ough", "eigh", "augh", "tion"]
    },
    "soundWords": ["chair", "cheese", "church", "beach", "lunch"],
    "boggleLetters": ["h", "i", "a", "u", "s", "l", "c"],
    "extraActivities": [
      "Write 3 more words with 'ch'",
      "Highlight the 'ch' in each word",
      "Find 5 things in the room that start with 'ch'"
    ],
    "readingPassage": {
      "title": "Charlie's Choice",
      "text": "Charlie had to choose between chocolate cake and cherry pie for lunch. He sat in his chair and thought carefully. Finally, he chose the chocolate cake because it was his favorite. He took a big chunk and ate it with a cheerful smile."
    },
    "language": {
      "synonyms": [["choose", "pick"], ["cheerful", "happy"]],
      "antonyms": [["big", "small"], ["favorite", "least liked"]],
      "grammarTask": "Circle all the nouns in the passage.",
      "punctuationTask": "Add commas where needed: 'Charlie ate cake pie and cookies'"
    },
    "writingPrompt": "Write about a time you had to make a difficult choice using words with 'ch'."
  }
};

// Add more weeks as needed - this is just a sample with week1 and week2

// ===============================================
// HELPER & SUB-COMPONENTS
// ===============================================

// Tool for reviewing graphs, digraphs, etc.
const GraphReviewTool = ({ title, items, words }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const intervalRef = useRef(null);

    const startHighlighting = () => {
        stopHighlighting(); // Clear any existing timer
        intervalRef.current = setInterval(() => {
            setHighlightedIndex(prev => (prev + 1) % items.length);
        }, 1500); // Highlight a new item every 1.5 seconds
    };

    const stopHighlighting = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHighlightedIndex(-1);
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => stopHighlighting();
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800">{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="grid grid-cols-8 gap-2 mb-4">
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center p-3 text-2xl font-bold rounded-lg transition-all duration-500 ${highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg' : 'bg-white text-gray-800'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">Start Random Highlight</button>
                    <button onClick={stopHighlighting} className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600">Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-800 mb-2">Read these words:</h4>
                <div className="flex flex-wrap gap-3 text-xl mb-4">
                    {words.map((word, i) => <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold">{word}</span>)}
                </div>
                <p className="text-green-700 font-semibold">Now, can you write 3 of your own words?</p>
            </div>
        </div>
    );
};

// Tool for the Sound of the Week
const SoundOfTheWeekTool = ({ content }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">Focus Sound: <span className="text-5xl font-mono bg-white px-4 py-2 rounded-lg border-2 border-purple-300">{content.focusSound}</span></h3>
                <h4 className="font-bold text-lg text-purple-700 mb-2">Sound Words:</h4>
                <div className="flex flex-wrap gap-2 text-lg mb-6">
                    {content.soundWords.map((word, i) => <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold">{word}</span>)}
                </div>
                <h4 className="font-bold text-lg text-purple-700 mb-2">Extra Activities:</h4>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                    {content.extraActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                </ul>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4">Boggle Challenge</h3>
                <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-4">
                    {content.boggleLetters.map((letter, i) => (
                        <div key={i} className="flex items-center justify-center bg-white text-4xl font-bold rounded-lg shadow-md aspect-square border-2 border-yellow-200">
                            {letter.toUpperCase()}
                        </div>
                    ))}
                </div>
                <p className="text-yellow-700 font-semibold">How many words can you make using the focus sound?</p>
            </div>
        </div>
    );
};

// Tool for the Reading Passage
const ReadingPassageTool = ({ passage }) => {
    const printableRef = useRef(null);

    const handlePrint = () => {
        const printContent = printableRef.current.innerHTML;
        const printWindow = window.open('', 'Print', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Passage</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        h3 { text-align: center; color: #333; }
                        p { font-size: 16px; }
                    </style>
                </head>
                <body>${printContent}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div>
            <div ref={printableRef} className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">{passage.title}</h3>
                <p className="text-lg leading-relaxed text-gray-700">{passage.text}</p>
            </div>
            <div className="text-center mt-6">
                <button onClick={handlePrint} className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 shadow-lg">🖨️ Print Passage</button>
            </div>
        </div>
    );
};

// Tool for Language Activities
const LanguageTool = ({ language }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-indigo-800 mb-3">Synonyms (Same Meaning)</h3>
                <div className="space-y-2">
                    {language.synonyms.map(([word1, word2], i) => (
                        <div key={i} className="bg-white p-3 rounded-lg text-center border">
                            <span className="font-semibold text-indigo-600">{word1}</span>
                            <span className="mx-2 text-gray-500">=</span>
                            <span className="font-semibold text-indigo-600">{word2}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-pink-800 mb-3">Antonyms (Opposite Meaning)</h3>
                <div className="space-y-2">
                    {language.antonyms.map(([word1, word2], i) => (
                        <div key={i} className="bg-white p-3 rounded-lg text-center border">
                            <span className="font-semibold text-pink-600">{word1}</span>
                            <span className="mx-2 text-gray-500">≠</span>
                            <span className="font-semibold text-pink-600">{word2}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold text-lg text-green-800 mb-3">Grammar & Punctuation Tasks</h3>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border">
                        <p className="font-semibold text-green-700">Grammar Task:</p>
                        <p className="text-gray-700">{language.grammarTask}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <p className="font-semibold text-green-700">Punctuation Task:</p>
                        <p className="text-gray-700">{language.punctuationTask}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tool for Writing Prompt
const WritingTool = ({ prompt }) => {
    return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">✍️ Writing Prompt</h3>
            <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-md">
                <p className="text-xl text-orange-700 font-semibold">{prompt}</p>
            </div>
            <p className="text-orange-600 mt-4">Students can write on paper or in their exercise books</p>
        </div>
    );
};

// ===============================================
// MAIN CURRICULUM CORNER COMPONENT
// ===============================================
const CurriculumCornerTab = ({ students = [], showToast = () => {} }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const LITERACY_LESSON_STEPS = [
    { id: 'graph_review', title: 'Graph Review', icon: '🔤' },
    { id: 'sound_of_week', title: 'Sound of the Week', icon: '🔊' },
    { id: 'reading', title: 'Reading Passage', icon: '📖' },
    { id: 'language', title: 'Language Activities', icon: '📝' },
    { id: 'writing', title: 'Writing Prompt', icon: '✍️' }
  ];

  const weeklyContent = literacyContent[selectedWeek];
  if (!weeklyContent) {
    return (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold text-red-600">Error: Content for {selectedWeek} not found.</h3>
            <p className="text-gray-600">Please select a different week.</p>
        </div>
    );
  }
  
  const currentStep = LITERACY_LESSON_STEPS[currentStepIndex];

  const goToNextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, LITERACY_LESSON_STEPS.length - 1));
  const goToPrevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  const goToStep = (stepIndex) => setCurrentStepIndex(stepIndex);

  const renderCurrentStep = () => {
    switch(currentStep.id) {
        case 'graph_review':
            return <GraphReviewTool title="Review Digraphs" items={weeklyContent.graphReview.digraphs} words={weeklyContent.soundWords} />;
        case 'sound_of_week':
            return <SoundOfTheWeekTool content={weeklyContent} />;
        case 'reading':
            return <ReadingPassageTool passage={weeklyContent.readingPassage} />;
        case 'language':
            return <LanguageTool language={weeklyContent.language} />;
        case 'writing':
            return <WritingTool prompt={weeklyContent.writingPrompt} />;
        default:
            return <div className="text-center text-gray-500 p-8">Step not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <span className="text-3xl mr-3 animate-bounce">📚</span>
            Literacy Companion
            <span className="text-3xl ml-3 animate-bounce">✨</span>
          </h2>
          <p className="text-xl opacity-90">Interactive phonics and literacy lessons</p>
        </div>
        
        {/* Floating decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔤</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>📖</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>✍️</div>
      </div>

      {/* Week Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-gray-800">Select Teaching Week</h3>
        <div className="flex items-center gap-4">
          <label htmlFor="week-select" className="font-semibold text-gray-700">Week:</label>
          <select 
            id="week-select" 
            value={selectedWeek} 
            onChange={e => { 
              setSelectedWeek(e.target.value); 
              setCurrentStepIndex(0); 
              showToast(`Switched to ${e.target.value.replace('week', 'Week ')}`, 'info');
            }} 
            className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm"
          >
            {Object.keys(literacyContent).map(weekKey => (
              <option key={weekKey} value={weekKey}>
                {weekKey.replace('week', 'Week ')} - Focus: {literacyContent[weekKey].focusSound.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lesson Steps Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Lesson Steps</h3>
        <div className="flex flex-wrap gap-2">
          {LITERACY_LESSON_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                currentStepIndex === index
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{step.icon}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h3>
                    <p className="text-gray-600">Step {currentStepIndex + 1} of {LITERACY_LESSON_STEPS.length} • Focus Sound: <span className="font-bold text-purple-600">{weeklyContent.focusSound.toUpperCase()}</span></p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Week {selectedWeek.replace('week', '')}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {LITERACY_LESSON_STEPS.map((_, index) => (
                            <div key={index} className={`w-3 h-3 rounded-full transition-colors ${currentStepIndex === index ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className="p-6 bg-gray-50">
            {renderCurrentStep()}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex justify-between items-center bg-white rounded-xl shadow-lg p-6">
        <button 
          onClick={goToPrevStep} 
          disabled={currentStepIndex === 0} 
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
        >
          <span>⬅️</span>
          Previous
        </button>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Lesson Progress</p>
          <div className="flex items-center gap-2">
              {LITERACY_LESSON_STEPS.map((step, index) => (
                  <div key={step.id} className={`w-4 h-4 rounded-full transition-colors ${currentStepIndex === index ? 'bg-blue-500' : currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              ))}
          </div>
        </div>
        
        <button 
          onClick={goToNextStep} 
          disabled={currentStepIndex === LITERACY_LESSON_STEPS.length - 1} 
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all"
        >
          Next
          <span>➡️</span>
        </button>
      </div>

      {/* Teaching Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-bold text-green-800 mb-2">Teaching Tip</h4>
            <p className="text-green-700">
              Use the step-by-step approach to guide your literacy lesson. Each step builds on the previous one to reinforce phonics learning.
              Students can participate by calling out answers, writing on whiteboards, or working in pairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;