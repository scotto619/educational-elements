// components/curriculum/mathematics/MathWarmup.js
// MATH WARMUP WITH GRADE LEVELS AND CATEGORIES
import React, { useState, useEffect, useRef } from 'react';
import { GRADE_LEVELS, questionGenerators, getQuestionsForSubcategory } from './data/math-warmup-content';

// ===============================================
// MAIN COMPONENT
// ===============================================
const MathWarmup = ({ showToast = () => {}, students = [] }) => {
  const [currentGrade, setCurrentGrade] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
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

  const startQuiz = (subcategoryKey) => {
    const questions = getQuestionsForSubcategory(currentGrade, currentCategory, subcategoryKey);
    
    setCurrentSubcategory(subcategoryKey);
    setQuestions(questions);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setIsQuizActive(true);
    
    if (isTimerMode) {
      setTimeLeft(10); // 10 seconds per question
    }
    
    const grade = GRADE_LEVELS[currentGrade];
    const category = grade.categories[currentCategory];
    const subcategory = category.subcategories[subcategoryKey];
    
    showToast(`Starting ${subcategory.name} quiz!`, 'success');
  };

  const nextQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      if (isTimerMode) {
        setTimeLeft(10);
      }
    } else {
      // Quiz finished
      setIsQuizActive(false);
      showToast('Quiz completed! Well done!', 'success');
    }
  };

  const prevQuestion = () => {
    setShowAnswer(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      if (isTimerMode) {
        setTimeLeft(10);
      }
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const resetQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestionIndex(0);
    setShowAnswer(false);
    setTimeLeft(0);
  };

  // Render grade selection
  if (!currentGrade) {
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="text-center">
            <h1 className={`font-bold mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
              🔢 Math Warmup Challenge
            </h1>
            <p className={`opacity-90 ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
              Choose your grade level to begin
            </p>
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
          </div>
        </div>

        {/* Grade Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(GRADE_LEVELS).map(([gradeKey, grade]) => (
            <button
              key={gradeKey}
              onClick={() => setCurrentGrade(gradeKey)}
              className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 ${isPresentationMode ? 'p-12' : 'p-8'}`}
            >
              <h3 className={`font-bold text-blue-600 mb-3 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
                📚 {grade.name}
              </h3>
              <p className={`text-gray-600 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                {grade.description}
              </p>
              <div className={`text-blue-500 font-semibold ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                {Object.keys(grade.categories).length} categories available →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render category selection
  if (!currentCategory) {
    const grade = GRADE_LEVELS[currentGrade];
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header with back button */}
        <div className={`bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
                📚 {grade.name}
              </h1>
              <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                Choose a math category
              </p>
            </div>
            <button
              onClick={() => setCurrentGrade(null)}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              ← Back to Grades
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grade.categories).map(([categoryKey, category]) => (
            <button
              key={categoryKey}
              onClick={() => setCurrentCategory(categoryKey)}
              className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 ${isPresentationMode ? 'p-12' : 'p-8'}`}
            >
              <div className={`text-center mb-4 ${isPresentationMode ? 'text-8xl' : 'text-5xl'}`}>
                {category.icon}
              </div>
              <h3 className={`font-bold text-green-600 mb-3 text-center ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
                {category.name}
              </h3>
              <div className={`text-green-500 font-semibold text-center ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                {Object.keys(category.subcategories).length} topics →
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render subcategory selection or quiz
  if (!isQuizActive) {
    const grade = GRADE_LEVELS[currentGrade];
    const category = grade.categories[currentCategory];
    
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-7xl' : 'text-4xl'}`}>
                {category.icon} {category.name}
              </h1>
              <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                {grade.name} • Choose a topic
              </p>
            </div>
            <button
              onClick={() => setCurrentCategory(null)}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
            >
              ← Back to Categories
            </button>
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
              {isTimerMode ? '⏰ 10 seconds per question' : '⏱️ Manual timing'}
            </span>
          </div>
        </div>

        {/* Subcategory Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(category.subcategories).map(([subcategoryKey, subcategory]) => (
            <button
              key={subcategoryKey}
              onClick={() => startQuiz(subcategoryKey)}
              className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border-2 border-gray-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300 text-left transform hover:scale-105 ${isPresentationMode ? 'p-16' : 'p-8'}`}
            >
              <h3 className={`font-bold text-purple-600 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
                {subcategory.name}
              </h3>
              <div className={`flex items-center justify-between ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                <span className="text-gray-600">10 Questions</span>
                <span className="text-purple-500 font-semibold">Start →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render quiz
  const currentQuestion = questions[currentQuestionIndex];
  const grade = GRADE_LEVELS[currentGrade];
  const category = grade.categories[currentCategory];
  const subcategory = category.subcategories[currentSubcategory];

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8' : ''}`}>
      {/* Quiz Header */}
      <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg ${isPresentationMode ? 'p-16' : 'p-8'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold mb-2 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
              {category.icon} {subcategory.name}
            </h1>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-right">
            {isTimerMode && (
              <div className={`bg-white bg-opacity-20 rounded-lg px-4 py-2 mb-3 ${isPresentationMode ? 'px-8 py-4' : ''}`}>
                <div className={`font-bold ${isPresentationMode ? 'text-4xl' : 'text-2xl'} ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
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

      {/* Progress Bar */}
      <div className={`bg-white rounded-xl shadow-lg ${isPresentationMode ? 'p-8' : 'p-4'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-semibold text-gray-700 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>Progress</span>
          <span className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full ${isPresentationMode ? 'h-6' : 'h-3'}`}>
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Display */}
      <div className={`bg-white rounded-xl shadow-lg text-center ${isPresentationMode ? 'p-24' : 'p-12'}`}>
        <div className={`font-bold text-gray-800 mb-8 ${isPresentationMode ? 'text-8xl leading-relaxed' : 'text-4xl md:text-6xl'}`}>
          {currentQuestion.question}
        </div>
        
        {showAnswer && (
          <div className={`bg-green-50 border-2 border-green-200 rounded-xl p-8 mb-8 ${isPresentationMode ? 'p-16' : ''}`}>
            <div className={`text-green-700 font-bold ${isPresentationMode ? 'text-6xl' : 'text-3xl md:text-5xl'}`}>
              Answer: {currentQuestion.answer}
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
    </div>
  );
};

export default MathWarmup;