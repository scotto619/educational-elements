// components/curriculum/mathematics/MathWarmup.js
// DAILY 10 STYLE MATH WARMUP WITH GRADE LEVELS AND CATEGORIES
// COMPLETE REDESIGN TO MATCH TOPMARKS DAILY 10 APP STRUCTURE
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// GRADE LEVEL CONFIGURATION
// ===============================================
const GRADE_LEVELS = {
  prep: {
    name: "Prep",
    description: "Foundation mathematics",
    categories: {
      counting: {
        name: "Counting",
        icon: "🔢",
        subcategories: {
          "count-to-10": { name: "Count to 10", questions: "generateCountingQuestions" },
          "count-to-20": { name: "Count to 20", questions: "generateCountingQuestions" },
          "one-more": { name: "One More", questions: "generateOneMoreQuestions" },
          "one-less": { name: "One Less", questions: "generateOneLessQuestions" }
        }
      },
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-to-5": { name: "Add to 5", questions: "generateAdditionQuestions" },
          "add-to-10": { name: "Add to 10", questions: "generateAdditionQuestions" },
          "doubles": { name: "Doubles", questions: "generateDoublesQuestions" }
        }
      },
      shapes: {
        name: "Shapes",
        icon: "🔷",
        subcategories: {
          "basic-shapes": { name: "Basic Shapes", questions: "generateShapeQuestions" },
          "shape-properties": { name: "Shape Properties", questions: "generateShapePropertiesQuestions" }
        }
      }
    }
  },
  grade1: {
    name: "Grade 1",
    description: "Year 1 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "bonds-to-10": { name: "Bonds to Make 10", questions: "generateBondsQuestions" },
          "add-to-20": { name: "Add to 20", questions: "generateAdditionQuestions" },
          "one-more": { name: "One More", questions: "generateOneMoreQuestions" },
          "missing-numbers": { name: "Missing Numbers", questions: "generateMissingNumberQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-from-10": { name: "Subtract from 10", questions: "generateSubtractionQuestions" },
          "subtract-from-20": { name: "Subtract from 20", questions: "generateSubtractionQuestions" },
          "one-less": { name: "One Less", questions: "generateOneLessQuestions" }
        }
      },
      ordering: {
        name: "Ordering",
        icon: "📊",
        subcategories: {
          "order-to-20": { name: "Order to 20", questions: "generateOrderingQuestions" },
          "before-after": { name: "Before and After", questions: "generateBeforeAfterQuestions" }
        }
      }
    }
  },
  grade2: {
    name: "Grade 2",
    description: "Year 2 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-to-50": { name: "Add to 50", questions: "generateAdditionQuestions" },
          "add-to-100": { name: "Add to 100", questions: "generateAdditionQuestions" },
          "doubles-near": { name: "Doubles and Near Doubles", questions: "generateDoublesQuestions" },
          "three-numbers": { name: "Three Numbers", questions: "generateThreeNumberQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-to-50": { name: "Subtract to 50", questions: "generateSubtractionQuestions" },
          "subtract-to-100": { name: "Subtract to 100", questions: "generateSubtractionQuestions" },
          "difference": { name: "Find the Difference", questions: "generateDifferenceQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-2": { name: "2 Times Table", questions: "generateTimesTableQuestions" },
          "times-5": { name: "5 Times Table", questions: "generateTimesTableQuestions" },
          "times-10": { name: "10 Times Table", questions: "generateTimesTableQuestions" }
        }
      }
    }
  },
  grade3: {
    name: "Grade 3",
    description: "Year 3 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-hundreds": { name: "Add Hundreds", questions: "generateAdditionQuestions" },
          "mental-add": { name: "Mental Addition", questions: "generateMentalMathQuestions" },
          "column-add": { name: "Column Addition", questions: "generateColumnAdditionQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-hundreds": { name: "Subtract Hundreds", questions: "generateSubtractionQuestions" },
          "mental-subtract": { name: "Mental Subtraction", questions: "generateMentalMathQuestions" },
          "column-subtract": { name: "Column Subtraction", questions: "generateColumnSubtractionQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-3": { name: "3 Times Table", questions: "generateTimesTableQuestions" },
          "times-4": { name: "4 Times Table", questions: "generateTimesTableQuestions" },
          "times-6": { name: "6 Times Table", questions: "generateTimesTableQuestions" },
          "times-8": { name: "8 Times Table", questions: "generateTimesTableQuestions" },
          "mixed-tables": { name: "Mixed Tables", questions: "generateMixedTablesQuestions" }
        }
      },
      division: {
        name: "Division",
        icon: "➗",
        subcategories: {
          "divide-by-2": { name: "Divide by 2", questions: "generateDivisionQuestions" },
          "divide-by-5": { name: "Divide by 5", questions: "generateDivisionQuestions" },
          "divide-by-10": { name: "Divide by 10", questions: "generateDivisionQuestions" }
        }
      }
    }
  },
  grade4: {
    name: "Grade 4",
    description: "Year 4 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-thousands": { name: "Add Thousands", questions: "generateAdditionQuestions" },
          "decimal-add": { name: "Decimal Addition", questions: "generateDecimalQuestions" },
          "word-problems": { name: "Word Problems", questions: "generateWordProblemQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-7": { name: "7 Times Table", questions: "generateTimesTableQuestions" },
          "times-9": { name: "9 Times Table", questions: "generateTimesTableQuestions" },
          "times-11": { name: "11 Times Table", questions: "generateTimesTableQuestions" },
          "times-12": { name: "12 Times Table", questions: "generateTimesTableQuestions" },
          "all-tables": { name: "All Tables", questions: "generateMixedTablesQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "simple-fractions": { name: "Simple Fractions", questions: "generateFractionQuestions" },
          "equivalent": { name: "Equivalent Fractions", questions: "generateEquivalentFractionQuestions" },
          "compare-fractions": { name: "Compare Fractions", questions: "generateCompareFractionQuestions" }
        }
      }
    }
  },
  grade5: {
    name: "Grade 5",
    description: "Year 5 mathematics",
    categories: {
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "multiply-decimals": { name: "Multiply Decimals", questions: "generateDecimalMultiplicationQuestions" },
          "large-numbers": { name: "Large Numbers", questions: "generateLargeNumberQuestions" },
          "factors": { name: "Factors", questions: "generateFactorQuestions" }
        }
      },
      division: {
        name: "Division",
        icon: "➗",
        subcategories: {
          "long-division": { name: "Long Division", questions: "generateLongDivisionQuestions" },
          "divide-decimals": { name: "Divide Decimals", questions: "generateDecimalDivisionQuestions" },
          "remainders": { name: "Remainders", questions: "generateRemainderQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "add-fractions": { name: "Add Fractions", questions: "generateFractionAdditionQuestions" },
          "subtract-fractions": { name: "Subtract Fractions", questions: "generateFractionSubtractionQuestions" },
          "mixed-numbers": { name: "Mixed Numbers", questions: "generateMixedNumberQuestions" }
        }
      },
      percentages: {
        name: "Percentages",
        icon: "%",
        subcategories: {
          "simple-percentages": { name: "Simple Percentages", questions: "generatePercentageQuestions" },
          "percentage-of": { name: "Percentage Of", questions: "generatePercentageOfQuestions" }
        }
      }
    }
  },
  grade6: {
    name: "Grade 6",
    description: "Year 6 mathematics",
    categories: {
      decimals: {
        name: "Decimals",
        icon: ".",
        subcategories: {
          "decimal-places": { name: "Decimal Places", questions: "generateDecimalPlaceQuestions" },
          "rounding-decimals": { name: "Rounding Decimals", questions: "generateRoundingDecimalQuestions" },
          "decimal-operations": { name: "Decimal Operations", questions: "generateDecimalOperationQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "multiply-fractions": { name: "Multiply Fractions", questions: "generateFractionMultiplicationQuestions" },
          "divide-fractions": { name: "Divide Fractions", questions: "generateFractionDivisionQuestions" },
          "fraction-decimals": { name: "Fractions to Decimals", questions: "generateFractionDecimalQuestions" }
        }
      },
      percentages: {
        name: "Percentages",
        icon: "%",
        subcategories: {
          "percentage-increase": { name: "Percentage Increase", questions: "generatePercentageIncreaseQuestions" },
          "percentage-decrease": { name: "Percentage Decrease", questions: "generatePercentageDecreaseQuestions" },
          "percentage-problems": { name: "Percentage Problems", questions: "generatePercentageProblemQuestions" }
        }
      },
      algebra: {
        name: "Algebra",
        icon: "x",
        subcategories: {
          "simple-equations": { name: "Simple Equations", questions: "generateSimpleEquationQuestions" },
          "substitution": { name: "Substitution", questions: "generateSubstitutionQuestions" }
        }
      }
    }
  }
};

// ===============================================
// QUESTION GENERATORS
// ===============================================
const questionGenerators = {
  generateCountingQuestions: (subcategory) => {
    const questions = [];
    const max = subcategory === "count-to-10" ? 10 : 20;
    
    for (let i = 0; i < 10; i++) {
      const start = Math.floor(Math.random() * (max - 5)) + 1;
      const end = start + Math.floor(Math.random() * 5) + 2;
      questions.push({
        question: `Count from ${start} to ${end}`,
        answer: Array.from({length: end - start + 1}, (_, i) => start + i).join(', '),
        type: 'counting'
      });
    }
    return questions;
  },

  generateOneMoreQuestions: () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const num = Math.floor(Math.random() * 19) + 1;
      questions.push({
        question: `What is one more than ${num}?`,
        answer: num + 1,
        type: 'one-more'
      });
    }
    return questions;
  },

  generateOneLessQuestions: () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const num = Math.floor(Math.random() * 19) + 2;
      questions.push({
        question: `What is one less than ${num}?`,
        answer: num - 1,
        type: 'one-less'
      });
    }
    return questions;
  },

  generateAdditionQuestions: (subcategory) => {
    const questions = [];
    let maxNum = 10;
    
    if (subcategory.includes('20')) maxNum = 20;
    else if (subcategory.includes('50')) maxNum = 50;
    else if (subcategory.includes('100')) maxNum = 100;
    else if (subcategory.includes('hundreds')) maxNum = 500;
    else if (subcategory.includes('thousands')) maxNum = 1000;
    
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * (maxNum - a)) + 1;
      questions.push({
        question: `${a} + ${b} = ?`,
        answer: a + b,
        type: 'addition'
      });
    }
    return questions;
  },

  generateSubtractionQuestions: (subcategory) => {
    const questions = [];
    let maxNum = 10;
    
    if (subcategory.includes('20')) maxNum = 20;
    else if (subcategory.includes('50')) maxNum = 50;
    else if (subcategory.includes('100')) maxNum = 100;
    else if (subcategory.includes('hundreds')) maxNum = 500;
    
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * maxNum) + 5;
      const b = Math.floor(Math.random() * a) + 1;
      questions.push({
        question: `${a} - ${b} = ?`,
        answer: a - b,
        type: 'subtraction'
      });
    }
    return questions;
  },

  generateTimesTableQuestions: (subcategory) => {
    const questions = [];
    const table = parseInt(subcategory.split('-')[1]);
    
    for (let i = 0; i < 10; i++) {
      const multiplier = Math.floor(Math.random() * 12) + 1;
      questions.push({
        question: `${table} × ${multiplier} = ?`,
        answer: table * multiplier,
        type: 'multiplication'
      });
    }
    return questions;
  },

  generateMixedTablesQuestions: () => {
    const questions = [];
    const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    
    for (let i = 0; i < 10; i++) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const multiplier = Math.floor(Math.random() * 12) + 1;
      questions.push({
        question: `${table} × ${multiplier} = ?`,
        answer: table * multiplier,
        type: 'multiplication'
      });
    }
    return questions;
  },

  generateDivisionQuestions: (subcategory) => {
    const questions = [];
    const divisor = parseInt(subcategory.split('-')[2]);
    
    for (let i = 0; i < 10; i++) {
      const quotient = Math.floor(Math.random() * 12) + 1;
      const dividend = divisor * quotient;
      questions.push({
        question: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        type: 'division'
      });
    }
    return questions;
  },

  generateBondsQuestions: () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = 10 - a;
      questions.push({
        question: `${a} + ? = 10`,
        answer: b,
        type: 'bonds'
      });
    }
    return questions;
  },

  generateDoublesQuestions: () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const num = Math.floor(Math.random() * 10) + 1;
      questions.push({
        question: `Double ${num}`,
        answer: num * 2,
        type: 'doubles'
      });
    }
    return questions;
  },

  generateOrderingQuestions: () => {
    const questions = [];
    for (let i = 0; i < 10; i++) {
      const nums = Array.from({length: 4}, () => Math.floor(Math.random() * 20) + 1);
      questions.push({
        question: `Order these numbers: ${nums.join(', ')}`,
        answer: nums.sort((a, b) => a - b).join(', '),
        type: 'ordering'
      });
    }
    return questions;
  },

  generateFractionQuestions: () => {
    const questions = [];
    const fractions = ['1/2', '1/3', '1/4', '2/3', '3/4', '2/4', '3/6', '4/8'];
    
    for (let i = 0; i < 10; i++) {
      const fraction = fractions[Math.floor(Math.random() * fractions.length)];
      const [num, den] = fraction.split('/').map(Number);
      const whole = Math.floor(Math.random() * 5) + 2;
      const answer = (whole * num / den).toFixed(2);
      
      questions.push({
        question: `What is ${fraction} of ${whole}?`,
        answer: answer,
        type: 'fractions'
      });
    }
    return questions;
  },

  generatePercentageQuestions: () => {
    const questions = [];
    const percentages = [10, 20, 25, 50, 75];
    
    for (let i = 0; i < 10; i++) {
      const percent = percentages[Math.floor(Math.random() * percentages.length)];
      const number = Math.floor(Math.random() * 100) + 10;
      const answer = (number * percent / 100);
      
      questions.push({
        question: `What is ${percent}% of ${number}?`,
        answer: answer,
        type: 'percentage'
      });
    }
    return questions;
  },

  generateDecimalQuestions: () => {
    const questions = [];
    
    for (let i = 0; i < 10; i++) {
      const a = (Math.random() * 10).toFixed(1);
      const b = (Math.random() * 10).toFixed(1);
      const answer = (parseFloat(a) + parseFloat(b)).toFixed(1);
      
      questions.push({
        question: `${a} + ${b} = ?`,
        answer: answer,
        type: 'decimals'
      });
    }
    return questions;
  }
};

// Default generator for missing subcategories
Object.keys(GRADE_LEVELS).forEach(gradeKey => {
  Object.values(GRADE_LEVELS[gradeKey].categories).forEach(category => {
    Object.values(category.subcategories).forEach(subcategory => {
      if (!questionGenerators[subcategory.questions]) {
        questionGenerators[subcategory.questions] = () => {
          return Array.from({length: 10}, (_, i) => ({
            question: `Sample question ${i + 1}`,
            answer: "Sample answer",
            type: 'sample'
          }));
        };
      }
    });
  });
});

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
    const grade = GRADE_LEVELS[currentGrade];
    const category = grade.categories[currentCategory];
    const subcategory = category.subcategories[subcategoryKey];
    
    setCurrentSubcategory(subcategoryKey);
    
    const generatorName = subcategory.questions;
    const generator = questionGenerators[generatorName];
    
    if (generator) {
      const generatedQuestions = generator(subcategoryKey);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setIsQuizActive(true);
      
      if (isTimerMode) {
        setTimeLeft(10); // 10 seconds per question
      }
      
      showToast(`Starting ${subcategory.name} quiz!`, 'success');
    }
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
              🔢 Daily 10 Math Challenge
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