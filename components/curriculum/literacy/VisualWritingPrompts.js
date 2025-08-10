// components/curriculum/literacy/VisualWritingPrompts.js
// VISUAL WRITING PROMPTS COMPONENT - ENGAGING IMAGE-BASED WRITING ACTIVITIES
import React, { useState, useRef } from 'react';

// ===============================================
// VISUAL WRITING PROMPTS DATA
// ===============================================
const TOTAL_PROMPTS = 20; // 20 image prompts (1, 3, 5, 7... up to 39)

// Generate the list of prompts with their corresponding word lists
const generatePrompts = () => {
  const prompts = [];
  for (let i = 1; i <= TOTAL_PROMPTS; i++) {
    const promptNumber = (i * 2) - 1; // 1, 3, 5, 7, 9, etc.
    const wordsNumber = i * 2; // 2, 4, 6, 8, 10, etc.
    
    prompts.push({
      id: i,
      title: `Writing Prompt ${i}`,
      imagePath: `/Curriculum/Literacy/VisualPrompts/${promptNumber}.png`,
      wordsPath: `/Curriculum/Literacy/VisualPrompts/${wordsNumber}.png`,
      promptNumber,
      wordsNumber
    });
  }
  return prompts;
};

const WRITING_PROMPTS = generatePrompts();

// ===============================================
// WRITING TIMER COMPONENT
// ===============================================
const WritingTimer = ({ isPresentationMode }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(0);
  const intervalRef = useRef(null);

  const startTimer = (duration) => {
    setTimeLeft(duration);
    setInitialTime(duration);
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
    setInitialTime(0);
  };

  React.useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
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
    if (timeLeft === 0 && !isRunning && initialTime > 0) return 'text-red-600';
    if (timeLeft <= 30) return 'text-red-500';
    if (timeLeft <= 60) return 'text-yellow-500';
    return 'text-green-600';
  };

  const getProgressPercentage = () => {
    if (initialTime === 0) return 0;
    return ((initialTime - timeLeft) / initialTime) * 100;
  };

  return (
    <div className={`bg-purple-50 border border-purple-300 rounded-lg p-4 ${isPresentationMode ? 'p-8' : ''}`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className={`${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>✏️</span>
          <div>
            <h4 className={`font-bold text-purple-800 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>Writing Timer</h4>
            <p className={`font-mono font-bold ${getTimerColor()} ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
              {formatTime(timeLeft)}
              {timeLeft === 0 && !isRunning && initialTime > 0 && <span className="text-red-600 ml-2 animate-pulse">✅</span>}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        {initialTime > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        )}
        
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            onClick={() => startTimer(300)} // 5 minutes
            disabled={isRunning}
            className={`bg-green-500 text-white rounded font-bold hover:bg-green-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-sm'}`}
          >
            5 min
          </button>
          <button 
            onClick={() => startTimer(600)} // 10 minutes
            disabled={isRunning}
            className={`bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-sm'}`}
          >
            10 min
          </button>
          <button 
            onClick={() => startTimer(900)} // 15 minutes
            disabled={isRunning}
            className={`bg-purple-500 text-white rounded font-bold hover:bg-purple-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-sm'}`}
          >
            15 min
          </button>
          <button 
            onClick={() => startTimer(1200)} // 20 minutes
            disabled={isRunning}
            className={`bg-indigo-500 text-white rounded font-bold hover:bg-indigo-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-sm'}`}
          >
            20 min
          </button>
          <button 
            onClick={isRunning ? stopTimer : resetTimer}
            className={`bg-gray-500 text-white rounded font-bold hover:bg-gray-600 transition-all ${isPresentationMode ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-sm'}`}
          >
            {isRunning ? '⏸️' : '🔄'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// WRITING TECHNIQUES HELPER
// ===============================================
const WritingTechniques = ({ isPresentationMode }) => {
  const [showTechniques, setShowTechniques] = useState(false);

  const techniques = [
    { name: "5 W's + H", description: "Who, What, Where, When, Why, How", icon: "❓" },
    { name: "Show Don't Tell", description: "Use actions and senses instead of stating facts", icon: "👁️" },
    { name: "Dialogue", description: "Make characters talk to bring your story to life", icon: "💬" },
    { name: "Sensory Details", description: "What do you see, hear, smell, taste, feel?", icon: "👃" },
    { name: "Beginning-Middle-End", description: "Structure your story with clear parts", icon: "📖" },
    { name: "Character Feelings", description: "How do characters feel? Show their emotions", icon: "😊" }
  ];

  return (
    <div className={`bg-yellow-50 border border-yellow-300 rounded-lg p-4 ${isPresentationMode ? 'p-8' : ''}`}>
      <button
        onClick={() => setShowTechniques(!showTechniques)}
        className={`w-full flex items-center justify-between font-bold text-yellow-800 hover:text-yellow-900 transition-colors ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}
      >
        <span className="flex items-center gap-2">
          <span className={`${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>💡</span>
          Writing Techniques Helper
        </span>
        <span>{showTechniques ? '▼' : '▶'}</span>
      </button>
      
      {showTechniques && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {techniques.map((technique, index) => (
            <div key={index} className={`bg-white p-3 rounded-lg border border-yellow-200 ${isPresentationMode ? 'p-6' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>{technique.icon}</span>
                <h5 className={`font-bold text-yellow-800 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>{technique.name}</h5>
              </div>
              <p className={`text-yellow-700 ${isPresentationMode ? 'text-xl' : 'text-xs'}`}>{technique.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===============================================
// MAIN VISUAL WRITING PROMPTS COMPONENT
// ===============================================
const VisualWritingPrompts = ({ showToast = () => {}, students = [] }) => {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showWords, setShowWords] = useState(true);
  const [viewMode, setViewMode] = useState('single'); // 'single', 'gallery'
  const [imageError, setImageError] = useState({});

  const currentPrompt = WRITING_PROMPTS[currentPromptIndex];

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode - perfect for classroom display!', 
      'success'
    );
  };

  const goToNext = () => {
    setCurrentPromptIndex(prev => (prev + 1) % WRITING_PROMPTS.length);
    setImageError({}); // Reset image errors when changing prompts
  };

  const goToPrevious = () => {
    setCurrentPromptIndex(prev => prev === 0 ? WRITING_PROMPTS.length - 1 : prev - 1);
    setImageError({}); // Reset image errors when changing prompts
  };

  const goToPrompt = (index) => {
    setCurrentPromptIndex(index);
    setImageError({}); // Reset image errors when changing prompts
  };

  const handleImageError = (imageType) => {
    setImageError(prev => ({ ...prev, [imageType]: true }));
  };

  const printPrompt = () => {
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Writing Prompt ${currentPrompt.id}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              text-align: center;
            }
            .prompt-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .prompt-image {
              max-width: 100%;
              height: auto;
              border: 3px solid #333;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .words-image {
              max-width: 100%;
              height: auto;
              border: 2px solid #666;
              border-radius: 8px;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            .instructions {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <div class="prompt-container">
            <h1>Writing Prompt ${currentPrompt.id}</h1>
            <img src="${currentPrompt.imagePath}" alt="Writing Prompt" class="prompt-image" onerror="this.style.display='none';" />
            <div class="instructions">
              <h3>Writing Instructions:</h3>
              <p>📝 Look at the image and let your imagination run wild!</p>
              <p>🤔 Think about: Who? What? Where? When? Why? How?</p>
              <p>✍️ Write a story, description, or poem inspired by this image</p>
              <p>🎯 Use the word bank below to help you get started</p>
            </div>
            ${!imageError.words ? `<img src="${currentPrompt.wordsPath}" alt="Word Bank" class="words-image" onerror="this.style.display='none';" />` : ''}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Gallery View
  if (viewMode === 'gallery') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-4xl font-bold mb-2 flex items-center">
                <span className="mr-3">🖼️</span>
                Visual Writing Prompts Gallery
              </h3>
              <p className="text-xl opacity-90">Choose from {WRITING_PROMPTS.length} inspiring visual prompts</p>
            </div>
            <button
              onClick={() => setViewMode('single')}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-30 transition-all"
            >
              📝 Single View
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {WRITING_PROMPTS.map((prompt, index) => (
            <button
              key={prompt.id}
              onClick={() => {
                setCurrentPromptIndex(index);
                setViewMode('single');
              }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-300"
            >
              <div className="aspect-square relative">
                <img
                  src={prompt.imagePath}
                  alt={`Writing Prompt ${prompt.id}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(`prompt-${prompt.id}`)}
                />
                {imageError[`prompt-${prompt.id}`] && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl">🖼️</span>
                      <p className="text-sm font-semibold">Prompt {prompt.id}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-bold text-gray-800 text-sm">Prompt {prompt.id}</h4>
                <p className="text-xs text-gray-600">Click to use</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Single View (Default)
  return (
    <div className={`space-y-6 ${isPresentationMode ? 'bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen' : ''}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 shadow-lg ${isPresentationMode ? 'p-12' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-4xl'}`}>
              <span className="mr-3">📝</span>
              Visual Writing Prompts
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>Inspire creativity through visual storytelling</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode('gallery')}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-4 py-2'}`}
            >
              🖼️ Gallery
            </button>
            <button
              onClick={togglePresentationMode}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Tools - Sticky */}
      {!isPresentationMode && (
        <div className="sticky top-4 z-50 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 mb-6 backdrop-blur-sm bg-opacity-95">
          <h4 className="font-bold text-gray-800 mb-3 text-center text-sm">🛠️ Writing Tools</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <WritingTimer isPresentationMode={isPresentationMode} />
            <WritingTechniques isPresentationMode={isPresentationMode} />
          </div>
        </div>
      )}

      {/* Prompt Navigation */}
      {!isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold text-gray-800">Navigate Prompts</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Prompt {currentPrompt.id} of {WRITING_PROMPTS.length}</span>
            </div>
          </div>
          
          {/* Quick navigation buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {WRITING_PROMPTS.map((prompt, index) => (
              <button
                key={prompt.id}
                onClick={() => goToPrompt(index)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${
                  currentPromptIndex === index
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {prompt.id}
              </button>
            ))}
          </div>

          {/* Word bank toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showWords}
                onChange={(e) => setShowWords(e.target.checked)}
                className="rounded"
              />
              <span className="font-semibold text-gray-700">Show Word Bank</span>
            </label>
            <button
              onClick={printPrompt}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
            >
              🖨️ Print Prompt
            </button>
          </div>
        </div>
      )}

      {/* Current Prompt Display */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 ${isPresentationMode ? 'p-10' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-bold text-purple-600 flex items-center gap-2 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                <span>🎨</span>
                Writing Prompt {currentPrompt.id}
              </h4>
              <p className={`text-gray-600 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                Let your imagination flow and create an amazing story!
              </p>
            </div>
            {!isPresentationMode && (
              <div className="text-right">
                <p className="text-gray-500 text-base">{currentPrompt.id} of {WRITING_PROMPTS.length}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: Math.min(10, WRITING_PROMPTS.length) }, (_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-3 rounded-full transition-colors ${
                        i < currentPromptIndex + 1 ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                  {WRITING_PROMPTS.length > 10 && <span className="text-gray-400 ml-1">...</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={`${isPresentationMode ? 'p-12' : 'p-6'}`}>
          <div className={`grid gap-8 ${isPresentationMode ? 'grid-cols-1' : showWords ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Main Prompt Image */}
            <div className="space-y-4">
              <h5 className={`font-bold text-gray-800 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>✨ Your Writing Inspiration</h5>
              <div className="relative">
                {!imageError.prompt ? (
                  <img
                    src={currentPrompt.imagePath}
                    alt={`Writing Prompt ${currentPrompt.id}`}
                    className="w-full rounded-lg shadow-lg border-4 border-purple-200"
                    onError={() => handleImageError('prompt')}
                  />
                ) : (
                  <div className="w-full aspect-video bg-gray-200 rounded-lg shadow-lg border-4 border-purple-200 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-6xl">🖼️</span>
                      <p className="text-xl font-semibold text-gray-600 mt-2">Writing Prompt {currentPrompt.id}</p>
                      <p className="text-sm text-gray-500">Image not found at: {currentPrompt.imagePath}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Word Bank */}
            {showWords && (
              <div className="space-y-4">
                <h5 className={`font-bold text-gray-800 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📚 Word Bank</h5>
                <div className="relative">
                  {!imageError.words ? (
                    <img
                      src={currentPrompt.wordsPath}
                      alt={`Word Bank for Prompt ${currentPrompt.id}`}
                      className="w-full rounded-lg shadow-lg border-4 border-pink-200"
                      onError={() => handleImageError('words')}
                    />
                  ) : (
                    <div className="w-full aspect-video bg-gray-100 rounded-lg shadow-lg border-4 border-pink-200 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-6xl">📝</span>
                        <p className="text-xl font-semibold text-gray-600 mt-2">Word Bank {currentPrompt.id}</p>
                        <p className="text-sm text-gray-500">Image not found at: {currentPrompt.wordsPath}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Writing Instructions */}
          <div className={`mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6 ${isPresentationMode ? 'p-12' : ''}`}>
            <h5 className={`font-bold text-purple-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📝 Writing Challenge</h5>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${isPresentationMode ? 'text-2xl gap-8' : 'text-lg'}`}>
              <div className="text-center">
                <span className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>🤔</span>
                <p className="font-semibold text-purple-700">Think about the 5 W's: Who, What, Where, When, Why?</p>
              </div>
              <div className="text-center">
                <span className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>👁️</span>
                <p className="font-semibold text-purple-700">Use your senses! What do you see, hear, smell, feel?</p>
              </div>
              <div className="text-center">
                <span className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>✨</span>
                <p className="font-semibold text-purple-700">Let your imagination run wild and create something amazing!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className={`flex justify-between items-center bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-10' : 'p-6'}`}>
        <button 
          onClick={goToPrevious}
          className={`flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold hover:bg-gray-50 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3'}`}
        >
          <span>⬅️</span>
          Previous Prompt
        </button>
        
        <div className="text-center">
          <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-sm'}`}>📊 Prompt Progress</p>
          <div className={`flex items-center gap-2 ${isPresentationMode ? 'gap-4' : ''}`}>
            {Array.from({ length: Math.min(10, WRITING_PROMPTS.length) }, (_, index) => (
              <div 
                key={index} 
                className={`rounded-full transition-colors ${
                  currentPromptIndex === index ? 'bg-purple-500' : 
                  currentPromptIndex > index ? 'bg-pink-500' : 'bg-gray-300'
                } ${isPresentationMode ? 'w-10 h-10' : 'w-4 h-4'}`}
              ></div>
            ))}
            {WRITING_PROMPTS.length > 10 && (
              <span className={`text-gray-400 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>...</span>
            )}
          </div>
        </div>
        
        <button 
          onClick={goToNext}
          className={`flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow font-semibold hover:from-purple-600 hover:to-pink-600 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3'}`}
        >
          Next Prompt
          <span>➡️</span>
        </button>
      </div>

      {/* Teaching Tips */}
      {!isPresentationMode && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-purple-800 mb-2">🎯 Teaching Tip</h4>
              <p className="text-purple-700">
                Visual Writing Prompts spark creativity and help students overcome writer's block! Use the word banks to 
                scaffold vocabulary, set writing timers to create focused writing sessions, and encourage students to share 
                their unique interpretations of each image. Remember: there are no wrong answers in creative writing!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualWritingPrompts;