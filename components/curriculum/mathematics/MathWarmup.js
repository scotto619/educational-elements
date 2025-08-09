// components/curriculum/mathematics/MathWarmup.js
// MATH WARMUP COMPONENT WITH NUMBER OF THE DAY AND PROGRESSIVE ACTIVITIES
import React, { useState, useEffect, useRef } from 'react';
import { mathWarmupContent, getRandomNumbersForPractice } from './data/math-warmup-content';

// ===============================================
// COMPACT NAME PICKER WIDGET - REUSED FROM LITERACY
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
    const maxSpins = Math.floor(Math.random() * 8) + 5; // 5-12 spins

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % students.length);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(intervalRef.current);
        setIsSpinning(false);
        setSelectedStudent(students[currentIndex]);
        try {
          const audio = new Audio('/sounds/ding.mp3');
          audio.volume = 0.3;
          audio.play().catch(e => {});
        } catch(e) {}
      }
    }, 80);
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
// COMPACT TIMER WIDGET - REUSED FROM LITERACY
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
// NUMBER PRACTICE TOOL - WITH RANDOM HIGHLIGHTING
// ===============================================
const NumberPracticeTool = ({ title, numbers, focusNumber, isPresentationMode }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const intervalRef = useRef(null);

    const startHighlighting = () => {
        stopHighlighting();
        intervalRef.current = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            setHighlightedIndex(randomIndex);
        }, 1500);
    };

    const stopHighlighting = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setHighlightedIndex(-1);
    };

    useEffect(() => () => {
        stopHighlighting();
    }, []);

    return (
        <div className="space-y-6">
            <h3 className={`font-bold text-center text-gray-800 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className={`grid gap-3 mb-4 ${isPresentationMode ? 'grid-cols-5 text-6xl p-8' : 'grid-cols-5 text-4xl p-3'}`}>
                    {numbers.map((number, index) => (
                        <div key={index} className={`flex items-center justify-center font-bold rounded-lg transition-all duration-500 aspect-square ${
                            highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg animate-pulse' : 
                            number === focusNumber ? 'bg-green-400 text-white' :
                            'bg-white text-gray-800 hover:bg-gray-50'
                        } ${isPresentationMode ? 'min-h-32' : 'min-h-20'}`}>
                            {number}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className={`text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors bg-blue-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}>🎯 Start Random Highlight</button>
                    <button onClick={stopHighlighting} className={`text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors bg-gray-500 ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}>⏹️ Stop</button>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// NUMBER OF THE DAY TOOL
// ===============================================
const NumberOfTheDayTool = ({ content, isPresentationMode }) => {
    const printableRef = useRef(null);
    
    const handlePrint = () => {
        const printWindow = window.open('', 'Print', 'height=800,width=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Number of the Day: ${content.focusNumber}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 10px; 
                            line-height: 1.6; 
                            font-size: 16px;
                        }
                        .number-sheet {
                            margin-bottom: 20px;
                            padding: 15px;
                            border: 2px solid #333;
                            page-break-inside: avoid;
                        }
                        .number-sheet h3 { 
                            text-align: center; 
                            color: #333; 
                            margin-bottom: 15px; 
                            font-size: 24px;
                            border-bottom: 2px solid #666;
                            padding-bottom: 8px;
                        }
                        .number-display { 
                            font-size: 48px; 
                            font-weight: bold;
                            text-align: center;
                            margin: 20px 0;
                            padding: 20px;
                            border: 3px solid #4F46E5;
                            border-radius: 10px;
                        }
                        .activities { 
                            font-size: 16px; 
                            margin-bottom: 10px;
                            line-height: 2;
                        }
                        .cut-line {
                            border-top: 2px dashed #999;
                            margin: 15px 0;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                            padding-top: 5px;
                        }
                    </style>
                </head>
                <body>
                    ${Array.from({ length: 4 }, (_, i) => `
                        <div class="number-sheet">
                            <h3>Number of the Day</h3>
                            <div class="number-display">${content.focusNumber}</div>
                            <div class="activities">
                                ${content.activities.map(activity => `<p>• ${activity}</p>`).join('')}
                            </div>
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
            <div className={`bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-8 text-center ${isPresentationMode ? 'p-16' : ''}`}>
                <h3 className={`font-bold text-indigo-800 mb-6 ${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>🔢 Number of the Day</h3>
                
                <div className={`bg-white rounded-xl border-4 border-indigo-400 shadow-lg mb-8 ${isPresentationMode ? 'p-16 mx-8' : 'p-8'}`}>
                    <div className={`font-bold text-indigo-600 ${isPresentationMode ? 'text-8xl animate-pulse' : 'text-6xl'}`}>
                        {content.focusNumber}
                    </div>
                </div>
                
                <div className={`bg-white rounded-lg border-2 border-indigo-200 p-6 text-left ${isPresentationMode ? 'p-12 text-3xl' : 'text-xl'}`}>
                    <h4 className={`font-bold text-indigo-800 mb-4 text-center ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>📝 Today's Number Activities</h4>
                    <div className="space-y-3">
                        {content.activities.map((activity, index) => (
                            <div key={index} className={`p-3 rounded-lg bg-indigo-50 border border-indigo-200 ${isPresentationMode ? 'p-6' : ''}`}>
                                <span className="font-semibold text-indigo-700">•</span> {activity}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button 
                    onClick={handlePrint} 
                    className={`bg-indigo-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-600 shadow-lg transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl transform hover:scale-105' : 'text-xl'}`}
                >
                    🖨️ Print 4 Copies (with cut lines)
                </button>
            </div>
        </div>
    );
};

// ===============================================
// MENTAL MATH TOOL
// ===============================================
const MentalMathTool = ({ mentalMath, isPresentationMode, currentDay = 0 }) => {
    const [showAnswers, setShowAnswers] = useState({});
    const todaysProblems = mentalMath.dailyProblems[currentDay] || mentalMath.dailyProblems[0];
    const todaysStrategy = mentalMath.dailyStrategies[currentDay] || mentalMath.dailyStrategies[0];

    const toggleAnswer = (index) => {
        setShowAnswers(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <div className="space-y-6">
            <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className={`font-bold text-green-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>🧠 Mental Math Practice</h3>
                    <div className="space-y-4">
                        {todaysProblems.map((problem, index) => (
                            <div key={index} className={`bg-white p-4 rounded-lg border-2 border-green-200 text-center ${isPresentationMode ? 'p-8 text-4xl' : 'text-2xl'}`}>
                                <div className="font-bold text-green-700 mb-2">{problem.question}</div>
                                {showAnswers[index] ? (
                                    <div className="text-green-600 font-bold animate-pulse">
                                        = {problem.answer}
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => toggleAnswer(index)}
                                        className={`bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-4 py-2'}`}
                                    >
                                        Show Answer
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                    <h3 className={`font-bold text-orange-800 mb-4 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>💡 Mental Math Strategy</h3>
                    <div className={`bg-white p-6 rounded-lg border-2 border-orange-200 ${isPresentationMode ? 'text-3xl p-12' : 'text-xl'}`}>
                        <h4 className={`font-bold text-orange-700 mb-3 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>{todaysStrategy.name}</h4>
                        <p className="text-orange-600 mb-4">{todaysStrategy.explanation}</p>
                        <div className="bg-orange-100 p-4 rounded-lg">
                            <p className={`font-semibold text-orange-800 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                                Example: {todaysStrategy.example}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// MATH PROBLEM OF THE DAY TOOL
// ===============================================
const MathProblemOfTheDayTool = ({ problems, isPresentationMode, currentDay = 0 }) => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);

    const currentProblem = problems[currentDay] || problems[0];

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 text-center">
            <h3 className={`font-bold text-purple-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>🔢 Math Problem of the Day</h3>
            
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
                <h4 className={`font-bold text-purple-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay] || 'Monday'}
                </h4>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md mb-6">
                <p className={`text-purple-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-2xl'}`}>{currentProblem.problem}</p>
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
                        💡 Hint: {currentProblem.hint}
                    </p>
                </div>
            )}

            {showAnswer && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 animate-pulse">
                    <p className={`text-green-700 font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
                        🎉 Answer: {currentProblem.answer}
                    </p>
                    {currentProblem.explanation && (
                        <p className={`text-green-600 mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                            {currentProblem.explanation}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

// ===============================================
// MATH FACT OF THE DAY TOOL
// ===============================================
const MathFactOfTheDayTool = ({ mathFacts, isPresentationMode, currentDay = 0 }) => {
    const currentFact = mathFacts[currentDay] || mathFacts[0];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <h3 className={`font-bold text-blue-800 mb-6 ${isPresentationMode ? 'text-6xl animate-pulse' : 'text-3xl'}`}>🎊 Math Fact of the Day</h3>
            
            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <h4 className={`font-bold text-blue-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>{dayNames[currentDay] || 'Monday'}</h4>
            </div>
            
            <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md">
                <p className={`text-blue-700 font-semibold ${isPresentationMode ? 'text-4xl leading-relaxed' : 'text-2xl'}`}>{currentFact}</p>
            </div>

            <p className={`text-blue-600 mt-4 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                🤓 Share this amazing math fact with someone today!
            </p>
        </div>
    );
};

// ===============================================
// MAIN MATH WARMUP COMPONENT
// ===============================================
const MathWarmup = ({ showToast = () => {}, students = [], saveData = () => {}, loadedData = {} }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentDay, setCurrentDay] = useState(0); // 0=Monday, 1=Tuesday, etc.

  const WARMUP_STEPS = [
    { id: 'number_practice', title: 'Number Practice', icon: '🔢' },
    { id: 'number_of_day', title: 'Number of the Day', icon: '📅' },
    { id: 'mental_math', title: 'Mental Math', icon: '🧠' },
    { id: 'math_problem', title: 'Problem of the Day', icon: '❓' },
    { id: 'math_fact', title: 'Math Fact of the Day', icon: '🎊' }
  ];

  const weeklyContent = mathWarmupContent[selectedWeek];
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
    const randomNumbers = getRandomNumbersForPractice(selectedWeek);
    
    switch(currentStep.id) {
        case 'number_practice':
            return <NumberPracticeTool 
                     title="🔢 Number Recognition & Practice" 
                     numbers={randomNumbers} 
                     focusNumber={weeklyContent.focusNumber}
                     isPresentationMode={isPresentationMode} 
                   />;
        case 'number_of_day':
            return <NumberOfTheDayTool content={weeklyContent} isPresentationMode={isPresentationMode} />;
        case 'mental_math':
            return <MentalMathTool 
                     mentalMath={weeklyContent.mentalMath} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'math_problem':
            return <MathProblemOfTheDayTool 
                     problems={weeklyContent.mathProblemOfTheDay} 
                     isPresentationMode={isPresentationMode} 
                     currentDay={currentDay}
                   />;
        case 'math_fact':
            return <MathFactOfTheDayTool 
                     mathFacts={weeklyContent.mathFactOfTheDay} 
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
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-4xl'}`}>
              <span className="mr-3">🔥</span>
              Math Warmup
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>Daily number activities and mathematical thinking</p>
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
                    showToast(`Switched to ${e.target.value.replace('week', 'Week ')} - Focus Number: ${mathWarmupContent[e.target.value].focusNumber}`, 'info');
                  }} 
                  className="p-3 border-2 border-gray-300 rounded-lg font-semibold bg-white shadow-sm"
                >
                  {Object.keys(mathWarmupContent).map(weekKey => (
                    <option key={weekKey} value={weekKey}>
                      {weekKey.replace('week', 'Week ')} - Focus: {mathWarmupContent[weekKey].focusNumber}
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

      {/* Compact Classroom Tools - Always Available & Sticky */}
      <div className={`sticky top-4 z-50 bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4 mb-6 backdrop-blur-sm bg-opacity-95 ${isPresentationMode ? 'p-6 top-6' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-3 text-center ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>🛠️ Quick Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CompactNamePicker students={students} isPresentationMode={isPresentationMode} />
          <CompactTimer isPresentationMode={isPresentationMode} />
        </div>
      </div>

      {/* Presentation Mode Week & Day Display */}
      {isPresentationMode && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h4 className="text-5xl font-bold text-gray-800 mb-4">
            🔢 Week {selectedWeek.replace('week', '')} - {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][currentDay]}
          </h4>
          <div className="text-8xl font-mono bg-green-100 px-6 py-3 rounded-lg text-green-700 animate-pulse inline-block">
            Focus Number: {weeklyContent.focusNumber}
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

      {/* Current Step Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className={`border-b-2 border-gray-100 bg-gradient-to-r from-green-50 to-blue-50 ${isPresentationMode ? 'p-10' : 'p-6'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <h4 className={`font-bold text-green-600 flex items-center gap-2 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                        <span>{currentStep.icon}</span>
                        {currentStep.title}
                    </h4>
                    <p className={`text-gray-600 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                        Step {currentStepIndex + 1} of {WARMUP_STEPS.length} • Focus Number: 
                        <span className="font-bold text-green-600 ml-1">{weeklyContent.focusNumber}</span>
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
          className={`flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl transform hover:scale-105' : 'px-6 py-3'}`}
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
                New Math Warmup features: **Number of the Day** activities with progressive difficulty, 
                mental math strategies that build over 10 weeks, daily problem solving with hints, 
                and interactive number practice tools. Activities increase in complexity from basic operations in early weeks to fractions and decimals in later weeks!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathWarmup;