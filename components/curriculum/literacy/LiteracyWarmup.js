// components/curriculum/literacy/LiteracyWarmup.js
// LITERACY WARMUP COMPONENT - SEPARATED FOR MODULARITY
import React, { useState, useEffect, useRef } from 'react';
import { literacyWarmupContent } from './data/literacy-warmup-content';

// ===============================================
// INTERACTIVE TOOL COMPONENTS
// ===============================================

const GraphReviewTool = ({ title, items, words }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const intervalRef = useRef(null);

    const startHighlighting = () => {
        stopHighlighting();
        intervalRef.current = setInterval(() => {
            setHighlightedIndex(prev => (prev + 1) % items.length);
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
                    <button onClick={startHighlighting} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">Start Random Highlight</button>
                    <button onClick={stopHighlighting} className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors">Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-800 mb-2">Read these words:</h4>
                <div className="flex flex-wrap gap-3 text-xl mb-4">
                    {words.map((word, i) => <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold border">{word}</span>)}
                </div>
                <p className="text-green-700 font-semibold">Now, can you write 3 of your own words?</p>
            </div>
        </div>
    );
};

const SoundOfTheWeekTool = ({ content }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-purple-800 mb-4">
                Focus Sound: 
                <span className="text-5xl font-mono bg-white px-4 py-2 ml-3 rounded-lg border-2 border-purple-300">
                    {content.focusSound}
                </span>
            </h3>
            <h4 className="font-bold text-lg text-purple-700 mb-2">Sound Words:</h4>
            <div className="flex flex-wrap gap-2 text-lg mb-6">
                {content.soundWords.map((word, i) => (
                    <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold border border-purple-200">
                        {word}
                    </span>
                ))}
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
                        h3 { text-align: center; color: #333; margin-bottom: 20px; }
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
                <button 
                    onClick={handlePrint} 
                    className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 shadow-lg transition-colors"
                >
                    🖨️ Print Passage
                </button>
            </div>
        </div>
    );
};

const LanguageTool = ({ language }) => (
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

const WritingTool = ({ prompt }) => (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-bold text-orange-800 mb-4">✍️ Writing Prompt</h3>
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-md">
            <p className="text-xl text-orange-700 font-semibold">{prompt}</p>
        </div>
        <p className="text-orange-600 mt-4">Students can write on paper or in their exercise books</p>
    </div>
);

// ===============================================
// MAIN LITERACY WARMUP COMPONENT
// ===============================================
const LiteracyWarmup = ({ showToast = () => {}, students = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  const WARMUP_STEPS = [
    { id: 'graph_review', title: 'Graph Review', icon: '🔤' },
    { id: 'sound_of_week', title: 'Sound of the Week', icon: '🔊' },
    { id: 'reading', title: 'Reading Passage', icon: '📖' },
    { id: 'language', title: 'Language Activities', icon: '📝' },
    { id: 'writing', title: 'Writing Prompt', icon: '✍️' }
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

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (fullscreenRef.current.requestFullscreen) {
          await fullscreenRef.current.requestFullscreen();
        } else if (fullscreenRef.current.webkitRequestFullscreen) {
          await fullscreenRef.current.webkitRequestFullscreen();
        } else if (fullscreenRef.current.msRequestFullscreen) {
          await fullscreenRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
        showToast('Entered fullscreen mode - perfect for classroom display!', 'success');
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
        setIsFullscreen(false);
        showToast('Exited fullscreen mode', 'info');
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes (e.g., ESC key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const goToNextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, WARMUP_STEPS.length - 1));
  const goToPrevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, 0));
  const goToStep = (stepIndex) => setCurrentStepIndex(stepIndex);

  const renderCurrentStep = () => {
    switch(currentStep.id) {
        case 'graph_review':
            return <GraphReviewTool title="Review Digraphs" items={weeklyContent.graphReview.digraphs} words={weeklyContent.soundWords} isFullscreen={isFullscreen} />;
        case 'sound_of_week':
            return <SoundOfTheWeekTool content={weeklyContent} isFullscreen={isFullscreen} />;
        case 'reading':
            return <ReadingPassageTool passage={weeklyContent.readingPassage} isFullscreen={isFullscreen} />;
        case 'language':
            return <LanguageTool language={weeklyContent.language} isFullscreen={isFullscreen} />;
        case 'writing':
            return <WritingTool prompt={weeklyContent.writingPrompt} isFullscreen={isFullscreen} />;
        default:
            return <div className="text-center text-gray-500 p-8">Step not found</div>;
    }
  };

  return (
    <div 
      ref={fullscreenRef}
      className={`space-y-6 ${isFullscreen ? 'bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen p-8' : ''}`}
    >
      {/* Warmup Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isFullscreen ? 'text-4xl' : 'text-3xl'}`}>
              <span className="mr-3">🔥</span>
              Literacy Warmup
            </h3>
            <p className={`opacity-90 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>Interactive phonics and literacy lessons</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isFullscreen ? 'px-8 py-4 text-xl' : 'px-6 py-3'}`}
          >
            {isFullscreen ? '🔲 Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* Week Selection */}
      {!isFullscreen && (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <h4 className="text-xl font-bold text-gray-800">Select Teaching Week</h4>
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

      {/* Fullscreen Week Display */}
      {isFullscreen && (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <h4 className="text-2xl font-bold text-gray-800">
            Week {selectedWeek.replace('week', '')} - Focus Sound: 
            <span className="text-4xl font-mono bg-purple-100 px-4 py-2 ml-3 rounded-lg text-purple-700">
              {weeklyContent.focusSound.toUpperCase()}
            </span>
          </h4>
        </div>
      )}

      {/* Lesson Steps Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className={`font-bold text-gray-800 mb-4 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Lesson Steps</h4>
        <div className={`flex flex-wrap gap-3 ${isFullscreen ? 'gap-4' : ''}`}>
          {WARMUP_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
                currentStepIndex === index
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isFullscreen ? 'px-6 py-4 text-xl' : 'px-4 py-2'}`}
            >
              <span>{step.icon}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 ${isFullscreen ? 'p-8' : 'p-6'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`font-bold text-blue-600 flex items-center gap-2 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isFullscreen ? 'text-xl' : ''}`}>
                        Step {currentStepIndex + 1} of {WARMUP_STEPS.length} • Focus Sound: 
                        <span className="font-bold text-purple-600 ml-1">{weeklyContent.focusSound.toUpperCase()}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-gray-500 ${isFullscreen ? 'text-lg' : 'text-sm'}`}>Week {selectedWeek.replace('week', '')}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isFullscreen ? 'gap-2' : ''}`}>
                        {WARMUP_STEPS.map((_, index) => (
                            <div 
                                key={index} 
                                className={`rounded-full transition-colors ${
                                    currentStepIndex === index ? 'bg-blue-500' : 
                                    currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                                } ${isFullscreen ? 'w-4 h-4' : 'w-3 h-3'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className={`${isFullscreen ? 'p-12' : 'p-6'}`}>
            {renderCurrentStep()}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className={`flex justify-between items-center bg-white rounded-xl shadow-lg ${isFullscreen ? 'p-8' : 'p-6'}`}>
        <button 
          onClick={goToPrevStep} 
          disabled={currentStepIndex === 0} 
          className={`flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all ${isFullscreen ? 'px-10 py-6 text-2xl' : 'px-6 py-3'}`}
        >
          <span>⬅️</span>
          Previous
        </button>
        
        <div className="text-center">
          <p className={`text-gray-600 mb-2 ${isFullscreen ? 'text-xl' : 'text-sm'}`}>Lesson Progress</p>
          <div className={`flex items-center gap-2 ${isFullscreen ? 'gap-3' : ''}`}>
              {WARMUP_STEPS.map((step, index) => (
                  <div 
                      key={step.id} 
                      className={`rounded-full transition-colors ${
                          currentStepIndex === index ? 'bg-blue-500' : 
                          currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                      } ${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`}
                  ></div>
              ))}
          </div>
        </div>
        
        <button 
          onClick={goToNextStep} 
          disabled={currentStepIndex === WARMUP_STEPS.length - 1} 
          className={`flex items-center gap-2 bg-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all ${isFullscreen ? 'px-10 py-6 text-2xl' : 'px-6 py-3'}`}
        >
          Next
          <span>➡️</span>
        </button>
      </div>

      {/* Teaching Tips - Hidden in fullscreen for cleaner display */}
      {!isFullscreen && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-green-800 mb-2">Teaching Tip</h4>
              <p className="text-green-700">
                Use the step-by-step approach to guide your literacy lesson. Click the fullscreen button for an immersive classroom experience!
                Each step builds on the previous one to reinforce phonics learning.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Exit Notice */}
      {isFullscreen && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
          Press ESC or click Exit Fullscreen to return
        </div>
      )}
    </div>
  );
};

export default LiteracyWarmup;