// components/curriculum/literacy/PrepLiteracyWarmup.js
// PREP LEVEL LITERACY WARMUP COMPONENT
import React, { useState, useEffect, useRef } from 'react';
import { prepTerm1Content, getPrepSoundImagePath, getPrepSoundWords } from './data/prep-term1-content';

// ===============================================
// SIMPLE NAME PICKER FOR PREP LEVEL
// ===============================================
const PrepNamePicker = ({ students, isPresentationMode }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const startNameSpin = () => {
    if (students.length === 0) return;
    
    setIsSpinning(true);
    setSelectedStudent(null);
    
    let currentIdx = Math.floor(Math.random() * students.length);
    setCurrentIndex(currentIdx);
    
    let spins = 0;
    const maxSpins = Math.floor(Math.random() * 8) + 5; // 5-12 spins

    intervalRef.current = setInterval(() => {
      currentIdx = (currentIdx + 1) % students.length;
      setCurrentIndex(currentIdx);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(intervalRef.current);
        setIsSpinning(false);
        setSelectedStudent(students[currentIdx]);
      }
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 ${isPresentationMode ? 'p-8' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>🎯</span>
          <div>
            <h4 className={`font-bold text-yellow-800 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>Pick a Friend</h4>
            <p className={`text-yellow-700 font-bold ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>
              {isSpinning ? (
                <span className="animate-bounce text-blue-600">{students[currentIndex]?.firstName}...</span>
              ) : selectedStudent ? (
                <span className="text-green-600">✨ {selectedStudent.firstName}</span>
              ) : (
                <span className="text-gray-500">Who's turn?</span>
              )}
            </p>
          </div>
        </div>
        <button 
          onClick={startNameSpin}
          disabled={isSpinning || students.length === 0}
          className={`bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all disabled:opacity-50 shadow-lg ${isPresentationMode ? 'px-10 py-6 text-3xl' : 'px-6 py-3 text-xl'}`}
        >
          {isSpinning ? '🎲' : '🎯 Pick Me!'}
        </button>
      </div>
    </div>
  );
};

// ===============================================
// SIMPLE TIMER FOR PREP LEVEL
// ===============================================
const PrepTimer = ({ isPresentationMode }) => {
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
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 15) return 'text-yellow-500';
    return 'text-green-600';
  };

  return (
    <div className={`bg-blue-50 border-2 border-blue-400 rounded-xl p-4 ${isPresentationMode ? 'p-8' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className={`${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>⏰</span>
          <div>
            <h4 className={`font-bold text-blue-800 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>Timer</h4>
            <p className={`font-mono font-bold ${getTimerColor()} ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>
              {formatTime(timeLeft)}
              {timeLeft === 0 && !isRunning && <span className="text-red-600 ml-2 animate-pulse">⏰</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => startTimer(30)}
            disabled={isRunning}
            className={`bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-3 text-lg'}`}
          >
            30s
          </button>
          <button 
            onClick={() => startTimer(60)}
            disabled={isRunning}
            className={`bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all disabled:opacity-50 ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-3 text-lg'}`}
          >
            1m
          </button>
          <button 
            onClick={resetTimer}
            className={`bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-all ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-3 text-lg'}`}
          >
            🔄
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// SOUND REVIEW TOOL FOR PREP
// ===============================================
const PrepSoundReview = ({ week, day, isPresentationMode, onShowToast }) => {
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [dailySounds, setDailySounds] = useState([]);

  // Get today's sounds
  useEffect(() => {
    const weekData = prepTerm1Content.weeks[`week${week}`];
    if (weekData && weekData.dailySounds && weekData.dailySounds[day]) {
      setDailySounds(weekData.dailySounds[day]);
      setCurrentSoundIndex(0);
    }
  }, [week, day]);

  const currentSound = dailySounds[currentSoundIndex];
  const soundWords = currentSound ? getPrepSoundWords(currentSound) : [];
  const imagePath = currentSound ? getPrepSoundImagePath(currentSound) : "";

  const nextSound = () => {
    setCurrentSoundIndex((prev) => (prev + 1) % dailySounds.length);
  };

  const prevSound = () => {
    setCurrentSoundIndex((prev) => (prev - 1 + dailySounds.length) % dailySounds.length);
  };

  if (!currentSound) {
    return (
      <div className="text-center p-8">
        <h3 className="text-xl font-bold text-red-600">Loading sounds...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-gray-800 mb-6 ${isPresentationMode ? 'text-8xl animate-pulse' : 'text-5xl'}`}>
          🔊 Letter Sounds
        </h3>
        <p className={`text-gray-600 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
          Sound {currentSoundIndex + 1} of {dailySounds.length}
        </p>
      </div>

      {/* Main Sound Display */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-4 border-purple-300 rounded-3xl p-8 text-center shadow-lg">
        {/* Sound Image */}
        <div className={`mb-8 ${isPresentationMode ? 'mb-12' : ''}`}>
          <img 
            src={imagePath} 
            alt={`${currentSound} sound`}
            className={`mx-auto rounded-xl border-4 border-purple-400 shadow-lg ${isPresentationMode ? 'w-96 h-96' : 'w-60 h-60'}`}
            onError={(e) => {
              e.target.src = "/SoundPictures/default.png";
            }}
          />
        </div>

        {/* Current Sound */}
        <div className={`mb-8 ${isPresentationMode ? 'mb-16' : ''}`}>
          <h4 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
            Letter Sound:
          </h4>
          <div className={`inline-block bg-white px-12 py-8 rounded-2xl border-4 border-purple-500 shadow-lg ${isPresentationMode ? 'px-20 py-12' : ''}`}>
            <span className={`font-mono font-bold text-purple-700 ${isPresentationMode ? 'text-16xl' : 'text-12xl'}`}>
              {currentSound.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Sound Words */}
        <div className={`mb-8 ${isPresentationMode ? 'mb-16' : ''}`}>
          <h4 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
            📚 Words that start with {currentSound.toUpperCase()}:
          </h4>
          <div className={`flex justify-center gap-6 ${isPresentationMode ? 'gap-12' : ''}`}>
            {soundWords.slice(0, 3).map((word, i) => (
              <div 
                key={i} 
                className={`bg-white px-8 py-6 rounded-xl border-4 border-blue-300 shadow-md hover:shadow-lg transition-all hover:scale-105 ${isPresentationMode ? 'px-16 py-12' : ''}`}
              >
                <span className={`font-bold text-blue-700 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-6">
          <button 
            onClick={prevSound}
            className={`bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-lg ${isPresentationMode ? 'px-16 py-8 text-4xl' : 'px-8 py-4 text-2xl'}`}
          >
            ⬅️ Back
          </button>
          
          <div className="flex flex-col items-center gap-3">
            <div className={`flex gap-2 ${isPresentationMode ? 'gap-3' : ''}`}>
              {dailySounds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSoundIndex(index)}
                  className={`rounded-full transition-all ${
                    currentSoundIndex === index 
                      ? 'bg-purple-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  } ${isPresentationMode ? 'w-8 h-8' : 'w-6 h-6'}`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={nextSound}
            className={`bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all shadow-lg ${isPresentationMode ? 'px-16 py-8 text-4xl' : 'px-8 py-4 text-2xl'}`}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// PICTURE WORD MATCHING GAME
// ===============================================
const PictureWordMatching = ({ content, isPresentationMode }) => {
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Create picture-word pairs for the focus sound
  const soundWords = getPrepSoundWords(content.focusSound);
  const gamePairs = soundWords.slice(0, 4).map((word, index) => ({
    id: index,
    word: word,
    image: getPrepSoundImagePath(content.focusSound), // Using same image for simplicity
    matched: false
  }));

  const handlePictureClick = (pairId) => {
    if (matches.includes(pairId)) return;
    setSelectedPicture(pairId);
    
    if (selectedWord === pairId) {
      // Match found!
      setMatches([...matches, pairId]);
      setSelectedPicture(null);
      setSelectedWord(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const handleWordClick = (pairId) => {
    if (matches.includes(pairId)) return;
    setSelectedWord(pairId);
    
    if (selectedPicture === pairId) {
      // Match found!
      setMatches([...matches, pairId]);
      setSelectedPicture(null);
      setSelectedWord(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const resetGame = () => {
    setMatches([]);
    setSelectedPicture(null);
    setSelectedWord(null);
    setShowCelebration(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>
          🎯 Picture Word Matching
        </h3>
        <p className={`text-green-600 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
          Match the pictures with words that start with "{content.focusSound.toUpperCase()}"
        </p>
      </div>

      {showCelebration && (
        <div className="text-center animate-bounce">
          <div className={`text-6xl ${isPresentationMode ? 'text-8xl' : ''}`}>🎉</div>
          <p className={`font-bold text-green-600 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            Great Match!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pictures Column */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className={`font-bold text-blue-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            📸 Pictures
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {gamePairs.map(pair => (
              <button
                key={`pic-${pair.id}`}
                onClick={() => handlePictureClick(pair.id)}
                disabled={matches.includes(pair.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  matches.includes(pair.id) 
                    ? 'bg-green-100 border-green-500 opacity-75' 
                    : selectedPicture === pair.id
                    ? 'bg-yellow-100 border-yellow-500 scale-105'
                    : 'bg-white border-blue-300 hover:border-blue-500 hover:scale-105'
                }`}
              >
                <img 
                  src={pair.image}
                  alt={pair.word}
                  className={`w-full h-20 object-contain ${isPresentationMode ? 'h-32' : ''}`}
                  onError={(e) => {
                    e.target.src = "/SoundPictures/default.png";
                  }}
                />
                {matches.includes(pair.id) && (
                  <div className="mt-2 text-green-600 font-bold">✅</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Words Column */}
        <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
          <h4 className={`font-bold text-pink-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            📝 Words
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {gamePairs.map(pair => (
              <button
                key={`word-${pair.id}`}
                onClick={() => handleWordClick(pair.id)}
                disabled={matches.includes(pair.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  matches.includes(pair.id) 
                    ? 'bg-green-100 border-green-500 opacity-75' 
                    : selectedWord === pair.id
                    ? 'bg-yellow-100 border-yellow-500 scale-105'
                    : 'bg-white border-pink-300 hover:border-pink-500 hover:scale-105'
                } ${isPresentationMode ? 'p-8' : ''}`}
              >
                <span className={`font-bold text-pink-700 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                  {pair.word}
                </span>
                {matches.includes(pair.id) && (
                  <div className="mt-2 text-green-600 font-bold">✅</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
          Matches: {matches.length} / {gamePairs.length}
        </p>
        <button 
          onClick={resetGame}
          className={`bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3 text-xl'}`}
        >
          🔄 Play Again
        </button>
      </div>
    </div>
  );
};

// ===============================================
// READING PASSAGE TOOL FOR PREP
// ===============================================
const PrepReadingPassage = ({ passage, isPresentationMode, currentDay = 0 }) => {
  return (
    <div className="space-y-6">
      <div className={`bg-white p-8 rounded-xl border-2 border-gray-200 shadow-lg ${isPresentationMode ? 'text-3xl leading-loose p-12' : 'text-xl leading-relaxed'}`}>
        <h3 className={`font-bold text-center text-gray-800 mb-6 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
          📖 {passage.title}
        </h3>
        <p className="text-gray-700">{passage.text}</p>
      </div>
      
      {/* Daily Activities */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6">
        <h4 className={`font-bold text-orange-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-2xl'}`}>
          📅 Daily Activities
        </h4>
        <div className="space-y-3">
          {passage.dailyActivities.map((activity, index) => (
            <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
              index === currentDay 
                ? 'bg-orange-100 border-orange-400 font-bold' 
                : 'bg-white border-orange-200'
            } ${isPresentationMode ? 'text-xl p-6' : 'text-base'}`}>
              {activity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// RHYMING WORDS TOOL
// ===============================================
const RhymingWordsTool = ({ language, isPresentationMode }) => {
  const [currentRhyme, setCurrentRhyme] = useState(0);
  
  const rhymeData = language.rhymingWords[currentRhyme];

  const nextRhyme = () => {
    setCurrentRhyme((prev) => (prev + 1) % language.rhymingWords.length);
  };

  const prevRhyme = () => {
    setCurrentRhyme((prev) => (prev - 1 + language.rhymingWords.length) % language.rhymingWords.length);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-indigo-800 mb-4 ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>
          🎵 Rhyming Words
        </h3>
        <p className={`text-indigo-600 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
          Words that sound the same at the end!
        </p>
      </div>

      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-8 text-center">
        <div className={`mb-8 ${isPresentationMode ? 'mb-12' : ''}`}>
          <h4 className={`font-bold text-indigo-800 mb-6 ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>
            Base Word:
          </h4>
          <div className={`inline-block bg-white px-8 py-4 rounded-xl border-4 border-indigo-500 shadow-lg ${isPresentationMode ? 'px-16 py-8' : ''}`}>
            <span className={`font-bold text-indigo-700 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
              {rhymeData.base}
            </span>
          </div>
        </div>

        <div className={`mb-8 ${isPresentationMode ? 'mb-12' : ''}`}>
          <h4 className={`font-bold text-indigo-800 mb-6 ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>
            Rhyming Words:
          </h4>
          <div className={`flex justify-center gap-6 ${isPresentationMode ? 'gap-12' : ''}`}>
            {rhymeData.rhymes.map((word, i) => (
              <div 
                key={i} 
                className={`bg-white px-6 py-4 rounded-xl border-3 border-pink-300 shadow-md hover:shadow-lg transition-all hover:scale-105 ${isPresentationMode ? 'px-12 py-8' : ''}`}
              >
                <span className={`font-bold text-pink-700 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                  {word}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center items-center gap-6">
          <button 
            onClick={prevRhyme}
            className={`bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3 text-lg'}`}
          >
            ⬅️ Previous
          </button>
          
          <div className={`flex gap-2 ${isPresentationMode ? 'gap-3' : ''}`}>
            {language.rhymingWords.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentRhyme(index)}
                className={`rounded-full transition-all ${
                  currentRhyme === index 
                    ? 'bg-indigo-500 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                } ${isPresentationMode ? 'w-6 h-6' : 'w-4 h-4'}`}
              />
            ))}
          </div>
          
          <button 
            onClick={nextRhyme}
            className={`bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3 text-lg'}`}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// LETTER RECOGNITION TOOL
// ===============================================
const LetterRecognitionTool = ({ language, isPresentationMode }) => {
  const [currentTask, setCurrentTask] = useState(0);
  
  const nextTask = () => {
    setCurrentTask((prev) => (prev + 1) % language.letterRecognition.length);
  };

  const prevTask = () => {
    setCurrentTask((prev) => (prev - 1 + language.letterRecognition.length) % language.letterRecognition.length);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>
          🔤 Letter Fun
        </h3>
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
        <div className={`mb-8 ${isPresentationMode ? 'mb-12' : ''}`}>
          <div className={`bg-white px-8 py-6 rounded-xl border-4 border-green-500 shadow-lg ${isPresentationMode ? 'px-16 py-12' : ''}`}>
            <p className={`font-bold text-green-700 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
              {language.letterRecognition[currentTask]}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6">
          <button 
            onClick={prevTask}
            className={`bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3 text-lg'}`}
          >
            ⬅️ Back
          </button>
          
          <div className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
            {currentTask + 1} of {language.letterRecognition.length}
          </div>
          
          <button 
            onClick={nextTask}
            className={`bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3 text-lg'}`}
          >
            Next ➡️
          </button>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// SIMPLE RIDDLE TOOL FOR PREP
// ===============================================
const PrepRiddleTool = ({ riddles, isPresentationMode, currentDay = 0 }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentRiddle = riddles[currentDay] || riddles[0];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center">
      <h3 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>
        🧩 Riddle Time
      </h3>
      
      <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 mb-4">
        <h4 className={`font-bold text-yellow-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
          {currentRiddle.day}
        </h4>
      </div>
      
      <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md mb-6">
        <p className={`text-purple-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-xl'}`}>
          {currentRiddle.riddle}
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button 
          onClick={() => setShowHint(!showHint)}
          className={`bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
        >
          💡 {showHint ? 'Hide Hint' : 'Need Help?'}
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
            💡 {currentRiddle.hint}
          </p>
        </div>
      )}

      {showAnswer && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 animate-pulse">
          <p className={`text-green-700 font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            🎉 {currentRiddle.answer}
          </p>
        </div>
      )}
    </div>
  );
};

// ===============================================
// SIMPLE FUN FACT TOOL FOR PREP
// ===============================================
const PrepFunFactTool = ({ funFacts, isPresentationMode, currentDay = 0 }) => {
  const currentFact = funFacts[currentDay] || funFacts[0];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 text-center">
      <h3 className={`font-bold text-blue-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>
        🌟 Cool Fact
      </h3>
      
      <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
        <h4 className={`font-bold text-blue-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
          {dayNames[currentDay] || 'Monday'}
        </h4>
      </div>
      
      <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md">
        <p className={`text-blue-700 font-semibold ${isPresentationMode ? 'text-3xl leading-relaxed' : 'text-xl'}`}>
          {currentFact}
        </p>
      </div>

      <p className={`text-blue-600 mt-4 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
        🤓 That's so cool!
      </p>
    </div>
  );
};

// ===============================================
// MAIN PREP LITERACY WARMUP COMPONENT
// ===============================================
const PrepLiteracyWarmup = ({ showToast = () => {}, students = [], saveData = () => {}, loadedData = {} }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentDay, setCurrentDay] = useState(0); // 0=Monday, 1=Tuesday, etc.

  const WARMUP_STEPS = [
    { id: 'sound_review', title: 'Letter Sounds', icon: '🔊' },
    { id: 'picture_matching', title: 'Picture Matching', icon: '🎯' },
    { id: 'reading', title: 'Story Time', icon: '📖' },
    { id: 'rhyming', title: 'Rhyming Words', icon: '🎵' },
    { id: 'letter_fun', title: 'Letter Fun', icon: '🔤' },
    { id: 'riddle', title: 'Riddle Time', icon: '🧩' },
    { id: 'fun_fact', title: 'Cool Fact', icon: '🌟' }
  ];

  const weeklyContent = prepTerm1Content.weeks[selectedWeek];
  
  if (!weeklyContent) {
    return (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold text-red-600">Error: Week not found.</h3>
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
    const weekNumber = parseInt(selectedWeek.replace('week', ''));
    
    switch(currentStep.id) {
        case 'sound_review':
            return <PrepSoundReview 
                     week={weekNumber}
                     day={currentDay}
                     isPresentationMode={isPresentationMode} 
                     onShowToast={showToast}
                   />;
        case 'picture_matching':
            return <PictureWordMatching 
                     content={weeklyContent} 
                     isPresentationMode={isPresentationMode} 
                   />;
        case 'reading':
            return <PrepReadingPassage 
                     passage={weeklyContent.readingPassage} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'rhyming':
            return <RhymingWordsTool 
                     language={weeklyContent.language} 
                     isPresentationMode={isPresentationMode}
                   />;
        case 'letter_fun':
            return <LetterRecognitionTool 
                     language={weeklyContent.language} 
                     isPresentationMode={isPresentationMode}
                   />;
        case 'riddle':
            return <PrepRiddleTool 
                     riddles={weeklyContent.riddleOfTheDay} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'fun_fact':
            return <PrepFunFactTool 
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
      <div className={`bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-6 shadow-lg ${isPresentationMode ? 'p-12' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-8xl animate-pulse' : 'text-5xl'}`}>
              <span className="mr-3">🌟</span>
              Prep Literacy Fun
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
              {prepTerm1Content.name} • Learning letter sounds!
            </p>
          </div>
          <button
            onClick={togglePresentationMode}
            className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
          >
            {isPresentationMode ? '📺 Exit Big Screen' : '🎭 Big Screen'}
          </button>
        </div>
      </div>

      {/* Week and Day Selection */}
      {!isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <h4 className="text-2xl font-bold text-gray-800">📅 Choose Week & Day</h4>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="week-select" className="font-semibold text-gray-700 text-lg">Week:</label>
                <select 
                  id="week-select" 
                  value={selectedWeek} 
                  onChange={e => { 
                    setSelectedWeek(e.target.value); 
                    setCurrentStepIndex(0); 
                    const weekData = prepTerm1Content.weeks[e.target.value];
                    if (weekData) {
                      showToast(`Switched to ${e.target.value.replace('week', 'Week ')} - Letter: ${weekData.focusSound.toUpperCase()}`, 'info');
                    }
                  }} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm text-lg"
                >
                  {Object.keys(prepTerm1Content.weeks).map(weekKey => {
                    const weekData = prepTerm1Content.weeks[weekKey];
                    return (
                      <option key={weekKey} value={weekKey}>
                        {weekKey.replace('week', 'Week ')} - Letter: {weekData.focusSound.toUpperCase()}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="day-select" className="font-semibold text-gray-700 text-lg">Day:</label>
                <select 
                  id="day-select" 
                  value={currentDay} 
                  onChange={e => setCurrentDay(parseInt(e.target.value))} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm text-lg"
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

      {/* Classroom Tools */}
      <div className={`sticky top-4 z-50 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 mb-6 backdrop-blur-sm bg-opacity-95 ${isPresentationMode ? 'p-6 top-6' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-3 text-center ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>🛠️ Classroom Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <PrepNamePicker students={students} isPresentationMode={isPresentationMode} />
          <PrepTimer isPresentationMode={isPresentationMode} />
        </div>
      </div>

      {/* Presentation Mode Focus Display */}
      {isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h4 className="text-6xl font-bold text-gray-800 mb-4">
            🔤 {selectedWeek.replace('week', 'Week ')} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
          </h4>
          <div className="text-12xl font-mono bg-green-100 px-8 py-4 rounded-lg text-green-700 animate-pulse inline-block">
            Letter: {weeklyContent.focusSound.toUpperCase()}
          </div>
        </div>
      )}

      {/* Activity Steps */}
      <div className={`bg-white rounded-xl shadow-lg p-6 ${isPresentationMode ? 'p-10' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>🎯 Learning Activities</h4>
        <div className={`flex flex-wrap gap-3 ${isPresentationMode ? 'gap-6 justify-center' : ''}`}>
          {WARMUP_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
                currentStepIndex === index
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform hover:scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-2'}`}
            >
              <span>{step.icon}</span>
              <span>{step.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Activity Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 ${isPresentationMode ? 'p-10' : 'p-6'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`font-bold text-green-600 flex items-center gap-2 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
                        Activity {currentStepIndex + 1} of {WARMUP_STEPS.length} • Letter: 
                        <span className="font-bold text-green-600 ml-1">{weeklyContent.focusSound.toUpperCase()}</span>
                        • {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
                    </p>
                </div>
                <div className="text-right">
                    <p className={`text-gray-500 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                      {selectedWeek.replace('week', 'Week ')}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 ${isPresentationMode ? 'gap-3' : ''}`}>
                        {WARMUP_STEPS.map((_, index) => (
                            <div 
                                key={index} 
                                className={`rounded-full transition-colors ${
                                    currentStepIndex === index ? 'bg-green-500' : 
                                    currentStepIndex > index ? 'bg-blue-500' : 'bg-gray-300'
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
      
      {/* Navigation */}
      <div className={`flex justify-between items-center bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-10' : 'p-6'}`}>
        <button 
          onClick={goToPrevStep} 
          disabled={currentStepIndex === 0} 
          className={`flex items-center gap-2 bg-white border-2 border-gray-300 rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3 text-lg'}`}
        >
          <span>⬅️</span>
          Back
        </button>
        
        <div className="text-center">
          <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-base'}`}>📍 Progress</p>
          <div className={`flex items-center gap-2 ${isPresentationMode ? 'gap-4' : ''}`}>
              {WARMUP_STEPS.map((step, index) => (
                  <div 
                      key={step.id} 
                      className={`rounded-full transition-colors ${
                          currentStepIndex === index ? 'bg-green-500' : 
                          currentStepIndex > index ? 'bg-blue-500' : 'bg-gray-300'
                      } ${isPresentationMode ? 'w-10 h-10' : 'w-4 h-4'}`}
                  ></div>
              ))}
          </div>
        </div>
        
        <button 
          onClick={goToNextStep} 
          disabled={currentStepIndex === WARMUP_STEPS.length - 1} 
          className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3 text-lg'}`}
        >
          Next
          <span>➡️</span>
        </button>
      </div>

      {/* Teaching Tips */}
      {!isPresentationMode && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-4xl">👩‍🏫</span>
            <div>
              <h4 className="font-bold text-green-800 mb-2">🌟 Perfect for Prep Level!</h4>
              <p className="text-green-700 text-lg">
                **SATPIN Progression**: Starting with the most important letter sounds (S-A-T-P-I-N), 
                then building up with M, D, G, O. Picture matching games, simple rhyming activities, 
                and age-appropriate riddles make learning fun! Great for 4-6 year olds just starting 
                their literacy journey.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepLiteracyWarmup;