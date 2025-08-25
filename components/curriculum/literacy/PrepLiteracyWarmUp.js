// components/curriculum/literacy/PrepLiteracyWarmUp.js
// PREP LEVEL LITERACY WARMUP COMPONENT - UPDATED WITH ALL 4 TERMS
import React, { useState, useEffect, useRef } from 'react';

// Import all term content
import { prepTerm1Content, getPrepSoundImagePath as getTerm1Image, getPrepSoundWords as getTerm1Words } from './data/prep-term1-content';
import { prepTerm2Content, getPrepTerm2SoundImagePath as getTerm2Image, getPrepTerm2SoundWords as getTerm2Words } from './data/prep-term2-content';
import { prepTerm3Content, getPrepTerm3SoundImagePath as getTerm3Image, getPrepTerm3SoundWords as getTerm3Words } from './data/prep-term3-content';
import { prepTerm4Content, getPrepTerm4SoundImagePath as getTerm4Image, getPrepTerm4SoundWords as getTerm4Words } from './data/prep-term4-content';

// ===============================================
// TERM CONTENT MAPPING
// ===============================================
const TERM_CONTENT = {
  term1: {
    content: prepTerm1Content,
    getImagePath: getTerm1Image,
    getSoundWords: getTerm1Words
  },
  term2: {
    content: prepTerm2Content,
    getImagePath: getTerm2Image,
    getSoundWords: getTerm2Words
  },
  term3: {
    content: prepTerm3Content,
    getImagePath: getTerm3Image,
    getSoundWords: getTerm3Words
  },
  term4: {
    content: prepTerm4Content,
    getImagePath: getTerm4Image,
    getSoundWords: getTerm4Words
  }
};

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
const PrepSoundReview = ({ selectedTerm, week, day, isPresentationMode, onShowToast }) => {
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [dailySounds, setDailySounds] = useState([]);

  const termData = TERM_CONTENT[selectedTerm];
  if (!termData) {
    return <div className="text-center p-8 text-red-600">Term not found!</div>;
  }

  // Get today's sounds
  useEffect(() => {
    const weekData = termData.content.weeks[`week${week}`];
    if (weekData && weekData.dailySounds && weekData.dailySounds[day]) {
      setDailySounds(weekData.dailySounds[day]);
      setCurrentSoundIndex(0);
    }
  }, [selectedTerm, week, day, termData]);

  const currentSound = dailySounds[currentSoundIndex];
  const soundWords = currentSound ? termData.getSoundWords(currentSound) : [];
  const imagePath = currentSound ? termData.getImagePath(currentSound) : "";

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
            <span className={`font-mono font-bold text-purple-700 ${isPresentationMode ? 'text-9xl' : 'text-8xl'}`} style={{ fontSize: isPresentationMode ? '12rem' : '8rem', lineHeight: '1' }}>
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
// PICTURE WORD MATCHING GAME - UPDATED FOR ALL TERMS
// ===============================================
const PictureWordMatching = ({ selectedTerm, content, isPresentationMode, currentDay = 0 }) => {
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [matches, setMatches] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Enhanced daily pairs that progress with each term
  const getTermBasedPairs = (term, day) => {
    const termPairs = {
      term1: [
        // Week 1-10: Basic CVC and simple sounds
        [
          { id: 1, word: "cat", image: "/SoundPictures/C_Cat.png" },
          { id: 2, word: "dog", image: "/SoundPictures/D_Dog.png" },
          { id: 3, word: "sun", image: "/SoundPictures/S_Snake.png" },
          { id: 4, word: "apple", image: "/SoundPictures/A_Apple.png" }
        ],
        [
          { id: 1, word: "pig", image: "/SoundPictures/P_Puppy.png" },
          { id: 2, word: "net", image: "/SoundPictures/N_Ninja.png" },
          { id: 3, word: "top", image: "/SoundPictures/T_Turtle.png" },
          { id: 4, word: "map", image: "/SoundPictures/M_Monkey.png" }
        ],
        [
          { id: 1, word: "goat", image: "/SoundPictures/G_Goat.png" },
          { id: 2, word: "octopus", image: "/SoundPictures/O_Octopus.png" },
          { id: 3, word: "igloo", image: "/SoundPictures/I_Igloo.png" },
          { id: 4, word: "hat", image: "/SoundPictures/H_Happy.png" }
        ],
        [
          { id: 1, word: "lion", image: "/SoundPictures/L_Lion.png" },
          { id: 2, word: "rabbit", image: "/SoundPictures/R_Rabbit.png" },
          { id: 3, word: "umbrella", image: "/SoundPictures/U_Umbrella.png" },
          { id: 4, word: "violin", image: "/SoundPictures/V_Violin.png" }
        ],
        [
          { id: 1, word: "whale", image: "/SoundPictures/WH_Whale.png" },
          { id: 2, word: "elephant", image: "/SoundPictures/E_Elephant.png" },
          { id: 3, word: "frog", image: "/SoundPictures/F_Frog.png" },
          { id: 4, word: "ball", image: "/SoundPictures/ALL_Ball.png" }
        ]
      ],
      term2: [
        // Week 11-20: More letters b, c, e, f, h, l, r, u, v, w
        [
          { id: 1, word: "banana", image: "/SoundPictures/B_Banana.png" },
          { id: 2, word: "chair", image: "/SoundPictures/CH_Chair.png" },
          { id: 3, word: "egg", image: "/SoundPictures/E_Elephant.png" },
          { id: 4, word: "fish", image: "/SoundPictures/F_Frog.png" }
        ],
        [
          { id: 1, word: "house", image: "/SoundPictures/OUS_House.png" },
          { id: 2, word: "light", image: "/SoundPictures/IGH_Light.png" },
          { id: 3, word: "robot", image: "/SoundPictures/R_Rabbit.png" },
          { id: 4, word: "unicorn", image: "/SoundPictures/U_Umbrella.png" }
        ],
        [
          { id: 1, word: "vase", image: "/SoundPictures/V_Violin.png" },
          { id: 2, word: "water", image: "/SoundPictures/WH_Whale.png" },
          { id: 3, word: "boat", image: "/SoundPictures/OA_Boat.png" },
          { id: 4, word: "tree", image: "/SoundPictures/TR_Tree.png" }
        ],
        [
          { id: 1, word: "flower", image: "/SoundPictures/FL_Flower.png" },
          { id: 2, word: "star", image: "/SoundPictures/ST_Star.png" },
          { id: 3, word: "brush", image: "/SoundPictures/BR_Brush.png" },
          { id: 4, word: "clock", image: "/SoundPictures/CL_Clock.png" }
        ],
        [
          { id: 1, word: "crown", image: "/SoundPictures/CR_Crab.png" },
          { id: 2, word: "dragon", image: "/SoundPictures/DR_Dragon.png" },
          { id: 3, word: "glass", image: "/SoundPictures/GL_Glass.png" },
          { id: 4, word: "grass", image: "/SoundPictures/GR_Grass.png" }
        ]
      ],
      term3: [
        // Week 21-30: Final letters and simple blends j, k, q, x, y, z, st, nd, mp, nk
        [
          { id: 1, word: "jump", image: "/SoundPictures/J_Jump.png" },
          { id: 2, word: "kangaroo", image: "/SoundPictures/K_Kangaroo.png" },
          { id: 3, word: "queen", image: "/SoundPictures/Q_Queen.png" },
          { id: 4, word: "box", image: "/SoundPictures/X_Exit.png" }
        ],
        [
          { id: 1, word: "yellow", image: "/SoundPictures/Y_Puppy.png" },
          { id: 2, word: "zebra", image: "/SoundPictures/Z_Zebra.png" },
          { id: 3, word: "star", image: "/SoundPictures/ST_Star.png" },
          { id: 4, word: "hand", image: "/SoundPictures/END_Hand.png" }
        ],
        [
          { id: 1, word: "lamp", image: "/SoundPictures/AMP_Lamp.png" },
          { id: 2, word: "pink", image: "/SoundPictures/INK_Pink.png" },
          { id: 3, word: "plant", image: "/SoundPictures/PL_Plant.png" },
          { id: 4, word: "snake", image: "/SoundPictures/SN_Snake.png" }
        ],
        [
          { id: 1, word: "spider", image: "/SoundPictures/SP_Spider.png" },
          { id: 2, word: "smile", image: "/SoundPictures/SM_Smile.png" },
          { id: 3, word: "slide", image: "/SoundPictures/SL_Slide.png" },
          { id: 4, word: "swing", image: "/SoundPictures/SW_Swan.png" }
        ],
        [
          { id: 1, word: "twins", image: "/SoundPictures/TW_Twins.png" },
          { id: 2, word: "princess", image: "/SoundPictures/PR_Princess.png" },
          { id: 3, word: "scarf", image: "/SoundPictures/SC_Scarf.png" },
          { id: 4, word: "skunk", image: "/SoundPictures/SK_Skunk.png" }
        ]
      ],
      term4: [
        // Week 31-40: Digraphs and complex sounds ch, sh, th, wh, ck, qu, ll, ss, ff, zz
        [
          { id: 1, word: "chair", image: "/SoundPictures/CH_Chair.png" },
          { id: 2, word: "ship", image: "/SoundPictures/SH_Ship.png" },
          { id: 3, word: "thumb", image: "/SoundPictures/TH_Thumb.png" },
          { id: 4, word: "whale", image: "/SoundPictures/WH_Whale.png" }
        ],
        [
          { id: 1, word: "duck", image: "/SoundPictures/CK_Duck.png" },
          { id: 2, word: "queen", image: "/SoundPictures/Q_Queen.png" },
          { id: 3, word: "ball", image: "/SoundPictures/ALL_Ball.png" },
          { id: 4, word: "dress", image: "/SoundPictures/LESS_Dress.png" }
        ],
        [
          { id: 1, word: "cliff", image: "/SoundPictures/OFF_Cliff.png" },
          { id: 2, word: "buzz", image: "/SoundPictures/IZZY_Buzz.png" },
          { id: 3, word: "watch", image: "/SoundPictures/TCH_Watch.png" },
          { id: 4, word: "table", image: "/SoundPictures/ABLE_Table.png" }
        ],
        [
          { id: 1, word: "phone", image: "/SoundPictures/PH_Phone.png" },
          { id: 2, word: "cheese", image: "/SoundPictures/EE_Bee.png" },
          { id: 3, word: "block", image: "/SoundPictures/BL_Block.png" },
          { id: 4, word: "crab", image: "/SoundPictures/CR_Crab.png" }
        ],
        [
          { id: 1, word: "three", image: "/SoundPictures/THR_Three.png" },
          { id: 2, word: "splash", image: "/SoundPictures/SPL_Splash.png" },
          { id: 3, word: "spring", image: "/SoundPictures/SPR_Spring.png" },
          { id: 4, word: "string", image: "/SoundPictures/STR_String.png" }
        ]
      ]
    };

    return termPairs[term]?.[day] || termPairs.term1[0];
  };

  // Get pairs for current term and day, with randomized positions
  const [gamePairs, setGamePairs] = useState([]);
  const [shuffledPictures, setShuffledPictures] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);

  // Initialize game when component mounts or term/day changes
  useEffect(() => {
    const dayPairs = getTermBasedPairs(selectedTerm, currentDay);
    const pairs = dayPairs.map((pair, index) => ({ ...pair, id: index, matched: false }));
    setGamePairs(pairs);
    
    // Create shuffled arrays for pictures and words separately
    const pictures = [...pairs].sort(() => 0.5 - Math.random());
    const words = [...pairs].sort(() => 0.5 - Math.random());
    
    setShuffledPictures(pictures);
    setShuffledWords(words);
    
    // Reset game state
    setMatches([]);
    setSelectedPicture(null);
    setSelectedWord(null);
    setShowCelebration(false);
  }, [selectedTerm, currentDay]);

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
    // Re-shuffle the positions
    const pictures = [...gamePairs].sort(() => 0.5 - Math.random());
    const words = [...gamePairs].sort(() => 0.5 - Math.random());
    
    setShuffledPictures(pictures);
    setShuffledWords(words);
    setMatches([]);
    setSelectedPicture(null);
    setSelectedWord(null);
    setShowCelebration(false);
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const termNames = {
    term1: 'Single Letter Sounds',
    term2: 'More Letter Sounds', 
    term3: 'Final Letters & Blends',
    term4: 'Digraphs & Complex Sounds'
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>
          🎯 Picture Word Matching
        </h3>
        <p className={`text-green-600 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
          Match each picture with its word! ({termNames[selectedTerm]} - {dayNames[currentDay]} Set)
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
        {/* Pictures Column - Randomized positions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className={`font-bold text-blue-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            📸 Pictures
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {shuffledPictures.map((pair, position) => (
              <button
                key={`pic-${pair.id}-${position}`}
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

        {/* Words Column - Randomized positions */}
        <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
          <h4 className={`font-bold text-pink-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
            🔤 Words
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {shuffledWords.map((pair, position) => (
              <button
                key={`word-${pair.id}-${position}`}
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
        {matches.length === gamePairs.length && (
          <div className="mt-4">
            <p className={`text-green-600 font-bold ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
              🌟 Amazing work! You matched them all! 🌟
            </p>
          </div>
        )}
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
  
  if (!language.rhymingWords || language.rhymingWords.length === 0) {
    return <div className="text-center p-8 text-red-600">No rhyming words available</div>;
  }
  
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
  
  if (!language.letterRecognition || language.letterRecognition.length === 0) {
    return <div className="text-center p-8 text-red-600">No letter recognition activities available</div>;
  }
  
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

  if (!riddles || riddles.length === 0) {
    return <div className="text-center p-8 text-red-600">No riddles available</div>;
  }

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
  if (!funFacts || funFacts.length === 0) {
    return <div className="text-center p-8 text-red-600">No fun facts available</div>;
  }

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
        🤔 That's so cool!
      </p>
    </div>
  );
};

// ===============================================
// MAIN PREP LITERACY WARMUP COMPONENT
// ===============================================
const PrepLiteracyWarmup = ({ showToast = () => {}, students = [], saveData = () => {}, loadedData = {} }) => {
  const [selectedTerm, setSelectedTerm] = useState('term1');
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

  const termData = TERM_CONTENT[selectedTerm];
  const weeklyContent = termData?.content.weeks[selectedWeek];
  
  if (!termData || !weeklyContent) {
    return (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold text-red-600">Error: Term or Week not found.</h3>
            <p className="text-gray-600">Please select a different term or week.</p>
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
                     selectedTerm={selectedTerm}
                     week={weekNumber}
                     day={currentDay}
                     isPresentationMode={isPresentationMode} 
                     onShowToast={showToast}
                   />;
        case 'picture_matching':
            return <PictureWordMatching 
                     selectedTerm={selectedTerm}
                     content={weeklyContent} 
                     isPresentationMode={isPresentationMode}
                     currentDay={currentDay}
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
              {termData.content.name} • {termData.content.description}
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

      {/* Term, Week and Day Selection */}
      {!isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <h4 className="text-2xl font-bold text-gray-800">📅 Choose Term, Week & Day</h4>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="term-select" className="font-semibold text-gray-700 text-lg">Term:</label>
                <select 
                  id="term-select" 
                  value={selectedTerm} 
                  onChange={e => { 
                    setSelectedTerm(e.target.value); 
                    setSelectedWeek('week1'); // Reset to week 1 of new term
                    setCurrentStepIndex(0); 
                    const newTermData = TERM_CONTENT[e.target.value];
                    if (newTermData) {
                      showToast(`Switched to ${newTermData.content.name}`, 'info');
                    }
                  }} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm text-lg"
                >
                  {Object.entries(TERM_CONTENT).map(([termKey, termInfo]) => (
                    <option key={termKey} value={termKey}>
                      {termKey.replace('term', 'Term ')} - {termInfo.content.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="week-select" className="font-semibold text-gray-700 text-lg">Week:</label>
                <select 
                  id="week-select" 
                  value={selectedWeek} 
                  onChange={e => { 
                    setSelectedWeek(e.target.value); 
                    setCurrentStepIndex(0); 
                    const weekData = termData.content.weeks[e.target.value];
                    if (weekData) {
                      showToast(`Switched to ${e.target.value.replace('week', 'Week ')} - Letter: ${weekData.focusSound.toUpperCase()}`, 'info');
                    }
                  }} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm text-lg"
                >
                  {Object.keys(termData.content.weeks).map(weekKey => {
                    const weekData = termData.content.weeks[weekKey];
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
            🔤 {selectedTerm.replace('term', 'Term ')} - {selectedWeek.replace('week', 'Week ')} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
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
                      {selectedTerm.replace('term', 'Term ')} - {selectedWeek.replace('week', 'Week ')}
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
          <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-base'}`}>📈 Progress</p>
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
              <h4 className="font-bold text-green-800 mb-2">🌟 Complete 4-Term Prep System!</h4>
              <p className="text-green-700 text-lg">
                **Full 40-Week Progression**: Term 1 (SATPIN basics), Term 2 (remaining alphabet), 
                Term 3 (final letters + simple blends), Term 4 (digraphs + complex sounds). Each term builds 
                perfectly on the last with age-appropriate activities, daily riddles, fun facts, and engaging 
                picture-matching games. Perfect for 4-6 year olds starting their literacy journey!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepLiteracyWarmup;