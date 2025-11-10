// components/student/StudentMaths.js - COMPREHENSIVE MATHS TAB FOR STUDENT PORTAL
import React, { useMemo, useState } from 'react';
import StudentMathMentals from './StudentMathMentals';
import InteractiveAngles from '../curriculum/mathematics/InteractiveAngles';
import StudentMathChallenge from './StudentMathChallenge';
import { DAILY_MATH_CHALLENGES } from '../curriculum/mathematics/data/dailyChallenges';

// Simple Calculator Component
const SimpleCalculator = ({ showToast }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return secondValue !== 0 ? firstValue / secondValue : 0;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border max-w-sm mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Calculator</h3>
      
      {/* Display */}
      <div className="bg-gray-900 text-white text-right p-4 rounded-lg mb-4 text-2xl font-mono">
        {display}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={clear} className="col-span-2 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 font-bold">Clear</button>
        <button onClick={() => inputOperation('÷')} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 font-bold">÷</button>
        <button onClick={() => inputOperation('×')} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 font-bold">×</button>
        
        <button onClick={() => inputNumber(7)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">7</button>
        <button onClick={() => inputNumber(8)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">8</button>
        <button onClick={() => inputNumber(9)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">9</button>
        <button onClick={() => inputOperation('-')} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 font-bold">-</button>
        
        <button onClick={() => inputNumber(4)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">4</button>
        <button onClick={() => inputNumber(5)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">5</button>
        <button onClick={() => inputNumber(6)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">6</button>
        <button onClick={() => inputOperation('+')} className="bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 font-bold">+</button>
        
        <button onClick={() => inputNumber(1)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">1</button>
        <button onClick={() => inputNumber(2)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">2</button>
        <button onClick={() => inputNumber(3)} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">3</button>
        <button onClick={performCalculation} className="row-span-2 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 font-bold">=</button>
        
        <button onClick={() => inputNumber(0)} className="col-span-2 bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">0</button>
        <button onClick={() => inputNumber('.')} className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 font-bold">.</button>
      </div>
    </div>
  );
};

// Times Tables Practice Component
const TimesTablesPractice = ({ showToast }) => {
  const [selectedTable, setSelectedTable] = useState(2);
  const [showAnswers, setShowAnswers] = useState(false);

  const generateTable = (number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      question: `${i + 1} × ${number}`,
      answer: (i + 1) * number
    }));
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-bold mb-4 text-center">Times Tables Practice</h3>
      
      <div className="flex justify-center space-x-2 mb-6 flex-wrap">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => setSelectedTable(num)}
            className={`px-3 py-2 rounded-lg font-bold mb-2 ${
              selectedTable === num 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {num}x
          </button>
        ))}
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => setShowAnswers(!showAnswers)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          {showAnswers ? 'Hide' : 'Show'} Answers
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {generateTable(selectedTable).map((item, index) => (
          <div
            key={index}
            className="bg-gray-50 border rounded-lg p-3 text-center hover:bg-gray-100 transition-colors"
          >
            <div className="font-semibold text-gray-800">{item.question}</div>
            <div className="text-blue-600 font-bold text-lg">
              {showAnswers ? `= ${item.answer}` : '= ?'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Number Facts Practice Component
const NumberFactsPractice = ({ showToast }) => {
  const [currentFact, setCurrentFact] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const generateFact = () => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, answer;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      default:
        num1 = 2; num2 = 2; answer = 4;
    }

    return { num1, num2, operation, answer, question: `${num1} ${operation} ${num2}` };
  };

  const startNewFact = () => {
    setCurrentFact(generateFact());
    setUserAnswer('');
    setShowResult(false);
  };

  const checkAnswer = () => {
    if (!currentFact) return;
    
    const isCorrect = parseInt(userAnswer) === currentFact.answer;
    setShowResult(true);
    setAttempts(attempts + 1);
    
    if (isCorrect) {
      setScore(score + 1);
      showToast('Correct! Well done!', 'success');
    } else {
      showToast(`Not quite! The answer is ${currentFact.answer}`, 'error');
    }

    setTimeout(() => {
      startNewFact();
    }, 1500);
  };

  // Initialize first fact
  React.useEffect(() => {
    if (!currentFact) startNewFact();
  }, []);

  if (!currentFact) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Quick Number Facts</h3>
      
      <div className="text-center mb-6">
        <div className="text-sm text-gray-600 mb-2">
          Score: {score}/{attempts}
        </div>
        
        <div className="text-3xl font-bold text-gray-800 mb-4">
          {currentFact.question} = ?
        </div>

        {!showResult && (
          <div className="space-y-3">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
              placeholder="Your answer"
              className="w-32 px-3 py-2 border rounded-lg text-center text-xl font-bold"
              autoFocus
            />
            <div>
              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                Check Answer
              </button>
            </div>
          </div>
        )}

        {showResult && (
          <div className="space-y-3">
            <div className={`text-xl font-bold ${
              parseInt(userAnswer) === currentFact.answer ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseInt(userAnswer) === currentFact.answer ? 'Correct!' : `Answer: ${currentFact.answer}`}
            </div>
            <div className="text-sm text-gray-600">Next question coming up...</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main StudentMaths Component
const StudentMaths = ({
  studentData,
  classData,
  showToast,
  updateStudentData
}) => {
  const [activeActivity, setActiveActivity] = useState('overview');

  const challengeAssignment = classData?.toolkitData?.mathDailyChallenges;

  const assignedChallenge = useMemo(() => {
    if (!challengeAssignment?.assignedChallengeId) {
      return null;
    }

    return (
      DAILY_MATH_CHALLENGES.find(
        (challenge) => challenge.id === challengeAssignment.assignedChallengeId
      ) || null
    );
  }, [challengeAssignment?.assignedChallengeId]);

  const assignedDueDate = useMemo(() => {
    if (!challengeAssignment?.dueDate) {
      return null;
    }

    const parsed = new Date(challengeAssignment.dueDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString();
  }, [challengeAssignment?.dueDate]);

  const mathActivities = useMemo(() => [
    {
      id: 'daily-challenge',
      name: 'Daily Challenge',
      icon: '🎯',
      description: assignedChallenge
        ? `Work on “${assignedChallenge.title}”`
        : 'See if your teacher has posted a challenge for today',
      color: 'from-rose-500 to-red-500',
      component: StudentMathChallenge
    },
    {
      id: 'math-mentals',
      name: 'Math Mentals',
      icon: '🧮',
      description: 'Daily math facts practice - your assigned level',
      color: 'from-blue-500 to-blue-600',
      component: StudentMathMentals
    },
    {
      id: 'interactive-angles',
      name: 'Learn About Angles',
      icon: '📐',
      description: 'Explore angles - learn, measure, create, identify & play!',
      color: 'from-purple-500 to-purple-600',
      component: InteractiveAngles
    },
    {
      id: 'times-tables',
      name: 'Times Tables',
      icon: '✖️',
      description: 'Practice multiplication tables 1-12',
      color: 'from-green-500 to-green-600',
      component: TimesTablesPractice
    },
    {
      id: 'number-facts',
      name: 'Quick Number Facts',
      icon: '⚡',
      description: 'Speed practice for addition, subtraction & multiplication',
      color: 'from-orange-500 to-orange-600',
      component: NumberFactsPractice
    },
    {
      id: 'calculator',
      name: 'Calculator',
      icon: '🔢',
      description: 'A handy calculator for your math work',
      color: 'from-gray-500 to-gray-600',
      component: SimpleCalculator
    }
  ], [assignedChallenge]);

  const renderActivity = () => {
    if (activeActivity === 'overview') {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <span className="mr-3">🔢</span>
              Maths Corner
              <span className="ml-3">📊</span>
            </h1>
            <p className="text-xl opacity-90">Your personal math practice zone!</p>
          </div>

          {assignedChallenge && (
            <div className="bg-white border border-rose-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-rose-500 font-semibold">Teacher Challenge</p>
                <h2 className="text-2xl font-bold text-rose-600 mt-1">{assignedChallenge.title}</h2>
                <p className="text-slate-600 mt-2">{assignedChallenge.headline}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-500">
                  <span className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full">{assignedChallenge.strand}</span>
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{assignedChallenge.estimatedMinutes} min</span>
                  {assignedDueDate && (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Due {assignedDueDate}</span>
                  )}
                </div>
                {challengeAssignment?.customMessage && (
                  <p className="text-sm text-rose-500 italic mt-3">“{challengeAssignment.customMessage}”</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveActivity('daily-challenge')}
                className="bg-rose-500 text-white font-semibold px-5 py-3 rounded-xl shadow hover:bg-rose-600 transition-colors"
              >
                Open Challenge →
              </button>
            </div>
          )}

          {/* Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mathActivities.map(activity => (
              <button
                key={activity.id}
                onClick={() => setActiveActivity(activity.id)}
                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300 hover:scale-105 text-left group"
              >
                <div className={`text-center p-4 rounded-lg bg-gradient-to-r ${activity.color} text-white mb-4`}>
                  <div className="text-4xl mb-2">{activity.icon}</div>
                  <h3 className="font-bold text-lg">{activity.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                <div className="flex justify-center">
                  <span className="text-blue-500 font-semibold group-hover:text-blue-600">
                    Start Activity →
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Math Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Math Tips for Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Daily Practice:</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• Do Math Mentals every day</li>
                  <li>• Practice times tables regularly</li>
                  <li>• Challenge yourself with quick facts</li>
                  <li>• Use the calculator to check your work</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">Problem Solving:</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• Read questions carefully</li>
                  <li>• Look for patterns in numbers</li>
                  <li>• Draw pictures to help visualize</li>
                  <li>• Check your answers make sense</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const activity = mathActivities.find(a => a.id === activeActivity);
    if (!activity) return null;

    const ActivityComponent = activity.component;
    
    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <button 
              onClick={() => setActiveActivity('overview')} 
              className="hover:text-blue-600 transition-colors"
            >
              Maths Corner
            </button>
            <span>→</span>
            <span className="font-semibold text-gray-800">{activity.name}</span>
          </div>
          <button 
            onClick={() => setActiveActivity('overview')} 
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Activities
          </button>
        </div>

        {/* Activity Content */}
        <ActivityComponent 
          studentData={studentData}
          classData={classData}
          showToast={showToast}
          updateStudentData={updateStudentData}
        />
      </div>
    );
  };

  return renderActivity();
};

export default StudentMaths;