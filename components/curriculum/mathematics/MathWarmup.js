// components/curriculum/mathematics/MathWarmup.js
// COMPREHENSIVE MATH WARMUP - 50 DAILY SETS (10 WEEKS × 5 DAYS)
import React, { useState, useEffect, useRef } from 'react';
import { generateDailyQuestions, grade5Config } from './data/grade5-comprehensive-data';

// Available grades (will expand as we add more)
const AVAILABLE_GRADES = {
  grade5: grade5Config
  // Add more grades here as we create them
};

// Days of the week
const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const DAY_NAMES = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday'
};

const MathWarmup = ({ showToast = () => {}, students = [] }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [isAutoRun, setIsAutoRun] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const timerRef = useRef(null);

  // Enhanced timer logic with auto-run support
  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (isAutoRun) {
              // Auto-advance to next question
              setTimeout(() => {
                nextQuestion();
              }, 100);
            } else if (isTimerMode) {
              // Just advance in timer mode
              nextQuestion();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isQuizActive, timeLeft, isAutoRun, isTimerMode]);

  // Auto-show answer in auto-run mode after 15 seconds
  useEffect(() => {
    if (isAutoRun && isQuizActive && timeLeft === 15 && !showAnswer) {
      setShowAnswer(true);
    }
  }, [timeLeft, isAutoRun, isQuizActive, showAnswer]);

  const startQuiz = (gradeKey, week, day) => {
    const grade = AVAILABLE_GRADES[gradeKey];
    if (!grade) return;
    
    // Generate questions for the selected week and day
    const dailyQuestions = generateDailyQuestions(week, day);
    
    setSelectedGrade(gradeKey);
    setSelectedWeek(week);
    setSelectedDay(day);
    setQuestions(dailyQuestions);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setIsQuizActive(true);
    
    // Set timer based on mode
    if (isAutoRun) {
      setTimeLeft(30); // 30 seconds for auto-run
    } else if (isTimerMode) {
      setTimeLeft(15); // 15 seconds for manual timer mode
    }
    
    showToast(`Starting ${grade.name} - Week ${week.replace('week', '')} ${DAY_NAMES[day]}!`, 'success');
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if (isAutoRun) {
        setTimeLeft(30);
      } else if (isTimerMode) {
        setTimeLeft(15);
      }
    } else {
      // Quiz finished
      setIsQuizActive(false);
      setIsAutoRun(false);
      showToast('Math Warmup completed! Well done!', 'success');
    }
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      if (isAutoRun) {
        setTimeLeft(30);
      } else if (isTimerMode) {
        setTimeLeft(15);
      }
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setIsAutoRun(false);
    setSelectedGrade(null);
    setSelectedWeek(null);
    setSelectedDay(null);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setTimeLeft(0);
  };

  const backToWeekSelection = () => {
    setSelectedWeek(null);
    setSelectedDay(null);
    setIsQuizActive(false);
    setIsAutoRun(false);
  };

  const backToGradeSelection = () => {
    setSelectedGrade(null);
    setSelectedWeek(null);
    setSelectedDay(null);
    setIsQuizActive(false);
    setIsAutoRun(false);
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowAnswer(false);
    if (isAutoRun) {
      setTimeLeft(30);
    } else if (isTimerMode) {
      setTimeLeft(15);
    }
  };

  const toggleAutoRun = () => {
    const newAutoRun = !isAutoRun;
    setIsAutoRun(newAutoRun);
    
    if (newAutoRun) {
      setIsTimerMode(true); // Auto-enable timer mode
      if (isQuizActive) {
        setTimeLeft(30);
        setShowAnswer(false);
      }
      showToast('Auto-run enabled! Questions will advance automatically every 30 seconds', 'success');
    } else {
      if (isQuizActive) {
        setTimeLeft(isTimerMode ? 15 : 0);
      }
      showToast('Auto-run disabled', 'info');
    }
  };

  const pauseAutoRun = () => {
    if (isAutoRun) {
      setIsAutoRun(false);
      clearInterval(timerRef.current);
      showToast('Auto-run paused', 'info');
    }
  };

  // Render grade selection
  if (!selectedGrade) {
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="text-center">
            <h1 className={`font-bold mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
              🔢 Math Warmup
            </h1>
            <p className={`opacity-90 mb-6 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
              Daily mental math practice • 10 weeks • 50 different sets
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setIsPresentationMode(!isPresentationMode)}
                className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
              >
                {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Feature Notice */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🔢</span>
            <div>
              <h4 className="font-bold text-green-800 mb-2">✨ Comprehensive Math Warmup System!</h4>
              <p className="text-green-700 mb-4">
                The Grade 5 Math Warmup now includes 50 different daily sets across 10 weeks! Each day features 10 number fact questions (randomized from large pools) and 10 mixed math questions covering percentages, fractions, decimals, algebra, and more.
              </p>
              <div className="bg-green-100 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-2">🎯 What's Included:</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• 10 weeks × 5 days = 50 different daily warmups</li>
                  <li>• Number facts: multiplication, division, squares, addition, subtraction, doubling, halving</li>
                  <li>• Mixed questions: percentages, fractions, decimals, rounding, basic algebra, estimation, word problems</li>
                  <li>• Advanced anti-repetition system ensures variety within each session</li>
                  <li>• All questions designed for mental math (no written working required)</li>
                  <li>• Presentation mode for classroom display with large text</li>
                  <li>• Timer mode (15 seconds per question) + Auto-run mode (30 seconds)</li>
                  <li>• Progress tracking and quick question navigation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-12' : 'p-6'}`}>
          <h3 className={`font-bold text-gray-800 mb-6 text-center ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
            Choose Your Mode
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manual Mode */}
            <div className={`border-2 rounded-xl p-6 text-center transition-all ${!isTimerMode && !isAutoRun ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'} ${isPresentationMode ? 'p-12' : ''}`}>
              <div className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'} mb-4`}>⚡</div>
              <h4 className={`font-bold text-gray-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Manual Mode</h4>
              <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>Control timing manually, perfect for discussion</p>
              <button
                onClick={() => {
                  setIsTimerMode(false);
                  setIsAutoRun(false);
                }}
                className={`rounded-lg font-semibold transition-all ${!isTimerMode && !isAutoRun ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${isPresentationMode ? 'px-8 py-4 text-xl' : 'px-4 py-2'}`}
              >
                {!isTimerMode && !isAutoRun ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Timer Mode */}
            <div className={`border-2 rounded-xl p-6 text-center transition-all ${isTimerMode && !isAutoRun ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'} ${isPresentationMode ? 'p-12' : ''}`}>
              <div className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'} mb-4`}>⏰</div>
              <h4 className={`font-bold text-gray-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Timer Mode</h4>
              <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>15 seconds per question, manual advance</p>
              <button
                onClick={() => {
                  setIsTimerMode(true);
                  setIsAutoRun(false);
                }}
                className={`rounded-lg font-semibold transition-all ${isTimerMode && !isAutoRun ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${isPresentationMode ? 'px-8 py-4 text-xl' : 'px-4 py-2'}`}
              >
                {isTimerMode && !isAutoRun ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Auto-Run Mode */}
            <div className={`border-2 rounded-xl p-6 text-center transition-all ${isAutoRun ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'} ${isPresentationMode ? 'p-12' : ''}`}>
              <div className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'} mb-4`}>🚀</div>
              <h4 className={`font-bold text-gray-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Auto-Run Mode</h4>
              <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>30 seconds per question, auto-advance</p>
              <button
                onClick={() => {
                  setIsTimerMode(true);
                  setIsAutoRun(true);
                }}
                className={`rounded-lg font-semibold transition-all ${isAutoRun ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} ${isPresentationMode ? 'px-8 py-4 text-xl' : 'px-4 py-2'}`}
              >
                {isAutoRun ? 'Selected' : 'Select'}
              </button>
            </div>
          </div>

          <div className={`mt-6 text-center text-gray-600 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
            <p className="font-semibold mb-2">Mode Descriptions:</p>
            <p><strong>Manual:</strong> You control when to show answers and move to next questions</p>
            <p><strong>Timer:</strong> 15-second countdown, but you click to advance questions</p>
            <p><strong>Auto-Run:</strong> 30 seconds per question, shows answer at 15s, auto-advances</p>
          </div>
        </div>

        {/* Grade Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(AVAILABLE_GRADES).map(([gradeKey, grade]) => (
            <button
              key={gradeKey}
              onClick={() => setSelectedGrade(gradeKey)}
              className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 ${isPresentationMode ? 'p-12' : 'p-8'}`}
            >
              <h3 className={`font-bold text-blue-600 mb-3 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                📚 {grade.name}
              </h3>
              <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                {grade.description}
              </p>
              <div className={`bg-green-100 rounded-lg p-3 mb-4 ${isPresentationMode ? 'p-6' : ''}`}>
                <p className={`text-green-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ {grade.totalWeeks} weeks of content
                </p>
                <p className={`text-green-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ {grade.totalWeeks * grade.daysPerWeek} different daily sets
                </p>
                <p className={`text-green-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ {grade.questionsPerDay} questions per day
                </p>
                <p className={`text-green-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ No repeated questions per session
                </p>
              </div>
              <div className={`text-blue-500 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                Select Grade →
              </div>
            </button>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">🚧</span>
            <div>
              <h4 className="font-bold text-yellow-800 mb-2">More Grades Coming Soon!</h4>
              <p className="text-yellow-700">
                Additional grade levels (Prep through Grade 6) will be added once Grade 5 is tested and approved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render week selection
  if (selectedGrade && !selectedWeek) {
    const grade = AVAILABLE_GRADES[selectedGrade];
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
                📚 {grade.name}
              </h1>
              <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                Choose a week (1-{grade.totalWeeks})
              </p>
            </div>
            <button
              onClick={backToGradeSelection}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              ← Back to Grades
            </button>
          </div>
        </div>

        {/* Current Mode Display */}
        <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-8' : 'p-4'}`}>
          <div className="text-center">
            <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Current Mode:</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${isPresentationMode ? 'px-8 py-4 text-2xl' : ''} ${
              isAutoRun ? 'bg-green-100 text-green-800' : 
              isTimerMode ? 'bg-orange-100 text-orange-800' : 
              'bg-blue-100 text-blue-800'
            }`}>
              <span>{isAutoRun ? '🚀' : isTimerMode ? '⏰' : '⚡'}</span>
              {isAutoRun ? 'Auto-Run Mode (30s)' : isTimerMode ? 'Timer Mode (15s)' : 'Manual Mode'}
            </div>
          </div>
        </div>

        {/* Week Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {Array.from({ length: grade.totalWeeks }, (_, i) => {
            const weekNumber = i + 1;
            const weekKey = `week${weekNumber}`;
            return (
              <button
                key={weekKey}
                onClick={() => setSelectedWeek(weekKey)}
                className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 ${isPresentationMode ? 'p-12' : 'p-8'}`}
              >
                <div className={`text-center mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
                  📅
                </div>
                <h3 className={`font-bold text-green-600 mb-3 text-center ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
                  Week {weekNumber}
                </h3>
                <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  5 daily warmups
                </p>
                <div className={`text-green-500 font-semibold text-center ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                  Select Week →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Render day selection
  if (selectedGrade && selectedWeek && !isQuizActive) {
    const grade = AVAILABLE_GRADES[selectedGrade];
    const weekNumber = selectedWeek.replace('week', '');
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
                📅 Week {weekNumber}
              </h1>
              <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                {grade.name} • Choose a day
              </p>
            </div>
            <button
              onClick={backToWeekSelection}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              ← Back to Weeks
            </button>
          </div>
        </div>

        {/* Current Mode Display */}
        <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-8' : 'p-4'}`}>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className={`text-gray-600 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Current Mode:</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${isPresentationMode ? 'px-8 py-4 text-2xl' : ''} ${
                isAutoRun ? 'bg-green-100 text-green-800' : 
                isTimerMode ? 'bg-orange-100 text-orange-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                <span>{isAutoRun ? '🚀' : isTimerMode ? '⏰' : '⚡'}</span>
                {isAutoRun ? 'Auto-Run Mode (30s)' : isTimerMode ? 'Timer Mode (15s)' : 'Manual Mode'}
              </div>
            </div>
            <button
              onClick={backToGradeSelection}
              className={`bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all ${isPresentationMode ? 'px-8 py-4 text-xl' : 'px-4 py-2'}`}
            >
              Change Mode
            </button>
          </div>
        </div>

        {/* Day Selection */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {DAYS_OF_WEEK.map((day, index) => (
            <button
              key={day}
              onClick={() => startQuiz(selectedGrade, selectedWeek, day)}
              className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105 ${isPresentationMode ? 'p-16' : 'p-8'}`}
            >
              <div className={`text-center mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
                {['📝', '📚', '🧮', '🎯', '🏆'][index]}
              </div>
              <h3 className={`font-bold text-purple-600 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
                {DAY_NAMES[day]}
              </h3>
              <div className={`bg-purple-100 rounded-lg p-3 mb-4 ${isPresentationMode ? 'p-6' : ''}`}>
                <p className={`text-purple-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ 10 Number Facts
                </p>
                <p className={`text-purple-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ 10 Mixed Questions
                </p>
                <p className={`text-purple-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ No Repeated Questions
                </p>
              </div>
              <div className={`text-purple-500 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                Start Warmup →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render quiz
  const currentQuestion = questions[currentQuestionIndex];
  const grade = AVAILABLE_GRADES[selectedGrade];
  const isNumberFact = currentQuestionIndex < 10; // First 10 are number facts
  const weekNumber = selectedWeek.replace('week', '');

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
      {/* Quiz Header */}
      <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
              {isNumberFact ? '🔢 Number Facts' : '🎯 Mixed Math'}
            </h1>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              {grade.name} • Week {weekNumber} • {DAY_NAMES[selectedDay]} • Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            {(isTimerMode || isAutoRun) && (
              <div className={`bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-3 ${isPresentationMode ? 'px-8 py-4' : ''}`}>
                <div className={`font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'} ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  ⏰ {timeLeft}s
                </div>
              </div>
            )}
            {isAutoRun && (
              <div className="flex gap-2 mb-3">
                <button
                  onClick={pauseAutoRun}
                  className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-8 py-3 text-xl' : 'px-4 py-2 text-sm'}`}
                >
                  ⏸️ Pause
                </button>
                <button
                  onClick={toggleAutoRun}
                  className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-8 py-3 text-xl' : 'px-4 py-2 text-sm'}`}
                >
                  🚀 Resume
                </button>
              </div>
            )}
            <button
              onClick={resetQuiz}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-8' : 'p-4'}`}>
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className={`font-semibold text-gray-700 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Progress</span>
          <span className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full ${isPresentationMode ? 'h-6' : 'h-3'} mb-4`}>
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>

        {/* Section Indicator */}
        <div className="flex gap-2">
          <div className={`flex-1 rounded-lg p-2 text-center ${isPresentationMode ? 'p-4' : ''} ${isNumberFact ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'}`}>
            <div className={`font-semibold ${isPresentationMode ? 'text-xl' : 'text-sm'} ${isNumberFact ? 'text-blue-600' : 'text-gray-600'}`}>
              Number Facts (1-10)
            </div>
          </div>
          <div className={`flex-1 rounded-lg p-2 text-center ${isPresentationMode ? 'p-4' : ''} ${!isNumberFact ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-100'}`}>
            <div className={`font-semibold ${isPresentationMode ? 'text-xl' : 'text-sm'} ${!isNumberFact ? 'text-purple-600' : 'text-gray-600'}`}>
              Mixed Math (11-20)
            </div>
          </div>
        </div>

        {/* Current Mode and Auto-Run Controls */}
        {isAutoRun && (
          <div className={`mt-4 text-center ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
              <span>🚀</span>
              Auto-Run Active - Answer will show at 15s, next question at 0s
            </div>
          </div>
        )}
      </div>

      {/* Question Display */}
      <div className={`bg-white rounded-xl shadow-lg text-center ${isPresentationMode ? 'p-24 flex-grow flex flex-col justify-center' : 'p-12'}`}>
        <div className={`font-bold text-gray-800 mb-8 ${isPresentationMode ? 'text-9xl leading-relaxed' : 'text-5xl md:text-7xl'}`}>
          {currentQuestion.question}
        </div>
        
        {showAnswer && (
          <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-8 mb-8 ${isPresentationMode ? 'p-16' : ''}`}>
            <div className={`text-green-700 font-bold ${isPresentationMode ? 'text-7xl' : 'text-4xl md:text-6xl'}`}>
              {currentQuestion.answer}
            </div>
          </div>
        )}

        {/* Control Buttons - Hide in auto-run mode except for manual override */}
        <div className={`flex justify-center space-x-4 mt-8 ${isAutoRun ? 'opacity-50' : ''}`}>
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl' : 'px-8 py-4 text-xl'}`}
          >
            ← Previous
          </button>
          
          <button
            onClick={toggleAnswer}
            className={`bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl' : 'px-8 py-4 text-xl'}`}
          >
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${isPresentationMode ? 'px-16 py-8 text-4xl' : 'px-8 py-4 text-xl'}`}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next →'}
          </button>
        </div>

        {isAutoRun && (
          <p className={`mt-4 text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
            Auto-Run is active. Use buttons above to override if needed.
          </p>
        )}
      </div>

      {/* Question Navigator (for easy jumping) */}
      <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-8' : 'p-6'}`}>
        <h4 className={`font-bold text-gray-800 mb-4 text-center ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
          Quick Jump to Question
        </h4>
        <div className="grid grid-cols-10 gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`rounded-lg font-semibold transition-all ${isPresentationMode ? 'px-4 py-3 text-xl' : 'px-3 py-2 text-sm'} ${
                currentQuestionIndex === index
                  ? index < 10 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-purple-500 text-white'
                  : index < 10
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div className={`text-center mt-4 text-gray-600 ${isPresentationMode ? 'text-lg' : 'text-sm'}`}>
          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded mr-2">Blue = Number Facts</span>
          <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded">Purple = Mixed Math</span>
        </div>
      </div>
    </div>
  );
};

export default MathWarmup;