// components/curriculum/literacy/LiteracyWarmup.js
// ENHANCED LITERACY WARMUP COMPONENT WITH FIXED FULLSCREEN AND IMPROVED ENGAGEMENT
import React, { useState, useEffect, useRef } from 'react';
import { literacyWarmupContent } from './data/literacy-warmup-content';

const GraphReviewTool = ({ title, items, words, isFullscreen }) => {
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
            <h3 className={`font-bold text-center text-gray-800 ${isFullscreen ? 'text-4xl animate-pulse' : 'text-2xl'}`}>{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className={`grid gap-2 mb-4 ${isFullscreen ? 'grid-cols-4 text-4xl p-6' : 'grid-cols-8 text-2xl p-3'}`}>
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center font-bold rounded-lg transition-all duration-500 ${highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg' : 'bg-white text-gray-800'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className={`text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors bg-blue-500 ${isFullscreen ? 'px-8 py-4 text-xl transform hover:scale-105' : ''}`}>Start Random Highlight</button>
                    <button onClick={stopHighlighting} className={`text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors bg-gray-500 ${isFullscreen ? 'px-8 py-4 text-xl transform hover:scale-105' : ''}`}>Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className={`font-bold text-green-800 mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Read these words:</h4>
                <div className={`flex flex-wrap gap-3 mb-4 ${isFullscreen ? 'text-2xl' : 'text-xl'}`}>
                    {words.map((word, i) => <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold border animate-bounce">{word}</span>)}
                </div>
                <p className={`text-green-700 font-semibold ${isFullscreen ? 'text-xl' : ''}`}>Now, can you write 3 of your own words?</p>
            </div>
        </div>
    );
};

const SoundOfTheWeekTool = ({ content, isFullscreen }) => (
    <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 lg:grid-cols-2 p-8' : 'grid-cols-1 lg:grid-cols-2'}`}>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className={`font-bold text-purple-800 mb-4 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                Focus Sound: 
                <span className={`font-mono bg-white px-4 py-2 ml-3 rounded-lg border-2 border-purple-300 ${isFullscreen ? 'text-6xl animate-pulse' : 'text-5xl'}`}>
                    {content.focusSound}
                </span>
            </h3>
            <h4 className={`font-bold text-purple-700 mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Sound Words:</h4>
            <div className={`flex flex-wrap gap-2 mb-6 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                {content.soundWords.map((word, i) => (
                    <span key={i} className="bg-white px-3 py-2 rounded shadow-sm font-semibold border border-purple-200 animate-bounce">{word}</span>
                ))}
            </div>
            <h4 className={`font-bold text-purple-700 mb-2 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Extra Activities:</h4>
            <ul className={`list-disc list-inside space-y-1 text-purple-700 ${isFullscreen ? 'text-xl' : ''}`}>
                {content.extraActivities.map((activity, i) => <li key={i}>{activity}</li>)}
            </ul>
        </div>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
            <h3 className={`font-bold text-yellow-800 mb-4 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>Boggle Challenge</h3>
            <div className={`grid grid-cols-4 gap-3 max-w-xs mx-auto mb-4 ${isFullscreen ? 'text-5xl gap-6 max-w-md' : 'text-4xl'}`}>
                {content.boggleLetters.map((letter, i) => (
                    <div key={i} className="flex items-center justify-center bg-white font-bold rounded-lg shadow-md aspect-square border-2 border-yellow-200 animate-pulse">
                        {letter.toUpperCase()}
                    </div>
                ))}
            </div>
            <p className={`text-yellow-700 font-semibold ${isFullscreen ? 'text-2xl' : ''}`}>How many words can you make using the focus sound?</p>
        </div>
    </div>
);

const ReadingPassageTool = ({ passage, isFullscreen }) => {
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
            <div ref={printableRef} className={`bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg ${isFullscreen ? 'text-2xl leading-loose' : 'text-lg leading-relaxed'}`}>
                <h3 className={`font-bold text-center text-gray-800 mb-6 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>{passage.title}</h3>
                <p className="text-gray-700">{passage.text}</p>
            </div>
            <div className="text-center mt-6">
                <button 
                    onClick={handlePrint} 
                    className={`bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 shadow-lg transition-colors ${isFullscreen ? 'px-12 py-5 text-2xl transform hover:scale-105' : ''}`}
                >
                    🖨️ Print Passage
                </button>
            </div>
        </div>
    );
};

const LanguageTool = ({ language, isFullscreen }) => (
    <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
            <h3 className={`font-bold text-indigo-800 mb-3 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Synonyms (Same Meaning)</h3>
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
            <h3 className={`font-bold text-pink-800 mb-3 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Antonyms (Opposite Meaning)</h3>
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
            <h3 className={`font-bold text-green-800 mb-3 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Grammar & Punctuation Tasks</h3>
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

const WritingTool = ({ prompt, isFullscreen }) => (
    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
        <h3 className={`font-bold text-orange-800 mb-4 ${isFullscreen ? 'text-4xl animate-pulse' : 'text-2xl'}`}>✍️ Writing Prompt</h3>
        <div className="bg-white p-6 rounded-lg border-2 border-orange-200 shadow-md">
            <p className={`text-orange-700 font-semibold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>{prompt}</p>
        </div>
        <p className={`text-orange-600 mt-4 ${isFullscreen ? 'text-2xl' : ''}`}>Students can write on paper or in their exercise books</p>
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

  // Improved Fullscreen functionality with better error handling and compatibility
  const toggleFullscreen = async () => {
    const element = fullscreenRef.current;
    if (!element) return;

    if (!isFullscreen) {
      // Enter fullscreen
      try {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Safari
          await element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (element.msRequestFullscreen) { // IE11
          await element.msRequestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
          await element.mozRequestFullScreen();
        }
        setIsFullscreen(true);
        showToast('Entered fullscreen mode - perfect for classroom display!', 'success');
      } catch (error) {
        console.error('Fullscreen request failed:', error);
        showToast('Unable to enter fullscreen. Please try again or check browser permissions.', 'error');
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        }
        setIsFullscreen(false);
        showToast('Exited fullscreen mode', 'info');
      } catch (error) {
        console.error('Exit fullscreen failed:', error);
        setIsFullscreen(false); // Force state reset
      }
    }
  };

  // Listen for fullscreen changes (e.g., ESC key) with multi-browser support
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
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
      className={`space-y-6 ${isFullscreen ? 'bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex flex-col' : ''}`}
    >
      {/* Warmup Header */}
      <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg flex-shrink-0 ${isFullscreen ? 'p-8' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isFullscreen ? 'text-5xl animate-pulse' : 'text-3xl'}`}>
              <span className="mr-3">🔥</span>
              Literacy Warmup
            </h3>
            <p className={`opacity-90 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>Interactive phonics and literacy lessons</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isFullscreen ? 'px-10 py-5 text-2xl transform hover:scale-105' : 'px-6 py-3'}`}
          >
            {isFullscreen ? '🔲 Exit Fullscreen' : '⛶ Fullscreen'}
          </button>
        </div>
      </div>

      {/* Week Selection */}
      {!isFullscreen && (
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
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
        <div className="bg-white rounded-xl shadow-lg p-6 text-center flex-shrink-0">
          <h4 className="text-3xl font-bold text-gray-800">
            Week {selectedWeek.replace('week', '')} - Focus Sound: 
            <span className="text-5xl font-mono bg-purple-100 px-4 py-2 ml-3 rounded-lg text-purple-700 animate-pulse">
              {weeklyContent.focusSound.toUpperCase()}
            </span>
          </h4>
        </div>
      )}

      {/* Lesson Steps Navigation */}
      <div className={`bg-white rounded-xl shadow-lg p-6 flex-shrink-0 ${isFullscreen ? 'p-8' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-4 ${isFullscreen ? 'text-3xl' : 'text-lg'}`}>Lesson Steps</h4>
        <div className={`flex flex-wrap gap-3 ${isFullscreen ? 'gap-4 justify-center' : ''}`}>
          {WARMUP_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
                currentStepIndex === index
                  ? 'bg-blue-500 text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isFullscreen ? 'px-8 py-5 text-2xl' : 'px-4 py-2'}`}
            >
              <span>{step.icon}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Step Content - Flex-grow to fill space */}
      <div className={`bg-white rounded-xl shadow-lg flex-grow ${isFullscreen ? 'flex flex-col justify-center' : ''}`}>
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 ${isFullscreen ? 'p-8' : 'p-6'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`font-bold text-blue-600 flex items-center gap-2 ${isFullscreen ? 'text-5xl' : 'text-2xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isFullscreen ? 'text-2xl' : ''}`}>
                        Step {currentStepIndex + 1} of {WARMUP_STEPS.length} • Focus Sound: 
                        <span className="font-bold text-purple-600 ml-1">{weeklyContent.focusSound.toUpperCase()}</span>
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-gray-500 ${isFullscreen ? 'text-2xl' : 'text-sm'}`}>Week {selectedWeek.replace('week', '')}</p>
                    <div className={`flex items-center gap-1 mt-1 ${isFullscreen ? 'gap-2' : ''}`}>
                        {WARMUP_STEPS.map((_, index) => (
                            <div 
                                key={index} 
                                className={`rounded-full transition-colors ${
                                    currentStepIndex === index ? 'bg-blue-500' : 
                                    currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                                } ${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'}`}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        <div className={`${isFullscreen ? 'p-12 flex-grow flex flex-col justify-center' : 'p-6'}`}>
            {renderCurrentStep()}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className={`flex justify-between items-center bg-white rounded-xl shadow-lg ${isFullscreen ? 'p-8 flex-shrink-0' : 'p-6'}`}>
        <button 
          onClick={goToPrevStep} 
          disabled={currentStepIndex === 0} 
          className={`flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all ${isFullscreen ? 'px-12 py-8 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
        >
          <span>⬅️</span>
          Previous
        </button>
        
        <div className="text-center">
          <p className={`text-gray-600 mb-2 ${isFullscreen ? 'text-2xl' : 'text-sm'}`}>Lesson Progress</p>
          <div className={`flex items-center gap-2 ${isFullscreen ? 'gap-4' : ''}`}>
              {WARMUP_STEPS.map((step, index) => (
                  <div 
                      key={step.id} 
                      className={`rounded-full transition-colors ${
                          currentStepIndex === index ? 'bg-blue-500' : 
                          currentStepIndex > index ? 'bg-green-500' : 'bg-gray-300'
                      } ${isFullscreen ? 'w-8 h-8' : 'w-4 h-4'}`}
                  ></div>
              ))}
          </div>
        </div>
        
        <button 
          onClick={goToNextStep} 
          disabled={currentStepIndex === WARMUP_STEPS.length - 1} 
          className={`flex items-center gap-2 bg-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-all ${isFullscreen ? 'px-12 py-8 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
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
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
          Press ESC or click Exit Fullscreen to return
        </div>
      )}
    </div>
  );
};

export default LiteracyWarmup;