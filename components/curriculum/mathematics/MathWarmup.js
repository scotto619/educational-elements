// components/curriculum/mathematics/MathWarmup.js
// SIMPLIFIED MATH WARMUP - 20 QUESTIONS PER GRADE
import React, { useState, useEffect, useRef } from 'react';
import { grade5MathQuestions } from './data/grade5-math-data';

// Available grades (will expand as we add more)
const AVAILABLE_GRADES = {
  grade5: {
    name: "Grade 5",
    description: "Year 5 mathematics",
    questions: grade5MathQuestions
  }
  // Add more grades here as we create them
};

const MathWarmup = ({ showToast = () => {}, students = [] }) => {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    if (isTimerMode && timeLeft > 0 && isQuizActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            nextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerMode, timeLeft, isQuizActive]);

  const startQuiz = (gradeKey) => {
    const grade = AVAILABLE_GRADES[gradeKey];
    if (!grade) return;
    
    setSelectedGrade(gradeKey);
    setQuestions(grade.questions);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setIsQuizActive(true);
    
    if (isTimerMode) {
      setTimeLeft(15); // 15 seconds per question for mental math
    }
    
    showToast(`Starting ${grade.name} Math Warmup!`, 'success');
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if (isTimerMode) {
        setTimeLeft(15);
      }
    } else {
      // Quiz finished
      setIsQuizActive(false);
      showToast('Math Warmup completed! Well done!', 'success');
    }
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      if (isTimerMode) {
        setTimeLeft(15);
      }
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setSelectedGrade(null);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setTimeLeft(0);
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowAnswer(false);
    if (isTimerMode) {
      setTimeLeft(15);
    }
  };

  // Render grade selection
  if (!selectedGrade || !isQuizActive) {
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="text-center">
            <h1 className={`font-bold mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
              🔢 Math Warmup
            </h1>
            <p className={`opacity-90 mb-6 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
              20 mental math questions to start your day
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

        {/* Timer Mode Toggle */}
        <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-12' : 'p-6'}`}>
          <div className="flex items-center justify-center space-x-6">
            <span className={`font-semibold text-gray-700 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              Timer Mode:
            </span>
            <button
              onClick={() => setIsTimerMode(!isTimerMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isTimerMode ? 'bg-indigo-600' : 'bg-gray-200'
              } ${isPresentationMode ? 'transform scale-150' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isTimerMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
              {isTimerMode ? '⏰ 15 seconds per question' : '⏱️ Manual timing'}
            </span>
          </div>
        </div>

        {/* Grade Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(AVAILABLE_GRADES).map(([gradeKey, grade]) => (
            <button
              key={gradeKey}
              onClick={() => startQuiz(gradeKey)}
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
                  ✓ 10 Number Facts Questions
                </p>
                <p className={`text-green-800 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                  ✓ 10 Mixed Math Questions
                </p>
              </div>
              <div className={`text-blue-500 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                Start Warmup →
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

  // Render quiz
  const currentQuestion = questions[currentQuestionIndex];
  const grade = AVAILABLE_GRADES[selectedGrade];
  const isNumberFact = currentQuestionIndex < 10; // First 10 are number facts

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
              {grade.name} • Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            {isTimerMode && (
              <div className={`bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-3 ${isPresentationMode ? 'px-8 py-4' : ''}`}>
                <div className={`font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'} ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                  ⏰ {timeLeft}s
                </div>
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

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
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