// components/student/StudentMathMentals.js - FIXED FOR V2 ARCHITECTURE WITH DIRECT FIRESTORE UPDATES
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';

// [Include all the constants from before - keeping them exactly the same]
const MATH_LEVELS = {
  1: {
    name: "Level 1 - Prep/Grade 1",
    description: "Basic number facts and counting (Ages 5-7)",
    color: "from-green-400 to-green-600",
    icon: "🌱"
  },
  2: {
    name: "Level 2 - Grade 1/2", 
    description: "Early addition and subtraction (Ages 6-8)",
    color: "from-blue-400 to-blue-600",
    icon: "📚"
  },
  3: {
    name: "Level 3 - Grade 2/3",
    description: "Multiplication and division basics (Ages 7-9)", 
    color: "from-purple-400 to-purple-600",
    icon: "🚀"
  },
  4: {
    name: "Level 4 - Grade 3/4",
    description: "Advanced number operations (Ages 8-10)",
    color: "from-red-400 to-red-600", 
    icon: "⭐"
  }
};

const MATH_SUBLEVELS = {
  // LEVEL 1 - PREP/GRADE 1
  "1.1": { name: "Counting 0-5", type: "counting", max: 5 },
  "1.2": { name: "Counting 0-10", type: "counting", max: 10 },
  "1.3": { name: "Add 1", type: "add_one", max: 10 },
  "1.4": { name: "Subtract 1", type: "subtract_one", max: 10 },
  "1.5": { name: "Add 2", type: "add_two", max: 8 },
  "1.6": { name: "Number Before", type: "number_before", max: 10 },
  "1.7": { name: "Number After", type: "number_after", max: 9 },
  "1.8": { name: "Doubles to 5", type: "doubles", max: 5 },
  "1.9": { name: "Add to 5", type: "add_to_target", target: 5 },
  "1.10": { name: "Subtract from 5", type: "subtract_from_target", target: 5 },
  "1.11": { name: "Count by 2s", type: "skip_count", step: 2, max: 10 },
  "1.12": { name: "Add to 10", type: "add_to_target", target: 10 },
  "1.13": { name: "Subtract from 10", type: "subtract_from_target", target: 10 },
  "1.14": { name: "Doubles to 10", type: "doubles", max: 10 },
  "1.15": { name: "Which is More?", type: "compare", max: 10 },
  "1.16": { name: "Which is Less?", type: "compare_less", max: 10 },
  "1.17": { name: "Missing Numbers", type: "missing_number", max: 10 },
  "1.18": { name: "Count Forward 3", type: "count_forward", steps: 3, max: 7 },
  "1.19": { name: "Count Backward 3", type: "count_backward", steps: 3, max: 10 },
  "1.20": { name: "Mixed to 10", type: "mixed_basic", max: 10 },

  // LEVEL 2 - GRADE 1/2
  "2.1": { name: "Add to 15", type: "addition", max: 15 },
  "2.2": { name: "Subtract from 15", type: "subtraction", max: 15 },
  "2.3": { name: "Add to 20", type: "addition", max: 20 },
  "2.4": { name: "Subtract from 20", type: "subtraction", max: 20 },
  "2.5": { name: "Doubles to 20", type: "doubles", max: 20 },
  "2.6": { name: "Near Doubles", type: "near_doubles", max: 20 },
  "2.7": { name: "Count by 5s", type: "skip_count", step: 5, max: 50 },
  "2.8": { name: "Count by 10s", type: "skip_count", step: 10, max: 100 },
  "2.9": { name: "2 Times Table", type: "times_table", table: 2 },
  "2.10": { name: "5 Times Table", type: "times_table", table: 5 },
  "2.11": { name: "10 Times Table", type: "times_table", table: 10 },
  "2.12": { name: "Half of Even Numbers", type: "halving", max: 20 },
  "2.13": { name: "Add 10", type: "add_ten", max: 90 },
  "2.14": { name: "Subtract 10", type: "subtract_ten", max: 100 },
  "2.15": { name: "Bridging 10", type: "bridging_ten", max: 20 },
  "2.16": { name: "Teen Numbers", type: "teen_numbers", max: 19 },
  "2.17": { name: "Place Value Tens", type: "place_value_tens", max: 99 },
  "2.18": { name: "Round to 10", type: "rounding", target: 10 },
  "2.19": { name: "Mixed Addition 20", type: "mixed_addition", max: 20 },
  "2.20": { name: "Mixed Subtraction 20", type: "mixed_subtraction", max: 20 },

  // LEVEL 3 - GRADE 2/3  
  "3.1": { name: "Add to 50", type: "addition", max: 50 },
  "3.2": { name: "Subtract from 50", type: "subtraction", max: 50 },
  "3.3": { name: "Add to 100", type: "addition", max: 100 },
  "3.4": { name: "Subtract from 100", type: "subtraction", max: 100 },
  "3.5": { name: "3 Times Table", type: "times_table", table: 3 },
  "3.6": { name: "4 Times Table", type: "times_table", table: 4 },
  "3.7": { name: "6 Times Table", type: "times_table", table: 6 },
  "3.8": { name: "7 Times Table", type: "times_table", table: 7 },
  "3.9": { name: "8 Times Table", type: "times_table", table: 8 },
  "3.10": { name: "9 Times Table", type: "times_table", table: 9 },
  "3.11": { name: "Division by 2", type: "division", table: 2 },
  "3.12": { name: "Division by 5", type: "division", table: 5 },
  "3.13": { name: "Division by 10", type: "division", table: 10 },
  "3.14": { name: "Mixed Times Tables", type: "mixed_tables", tables: [2,3,4,5,10] },
  "3.15": { name: "Add 3 Numbers", type: "add_three", max: 30 },
  "3.16": { name: "Round to 100", type: "rounding", target: 100 },
  "3.17": { name: "Place Value 100s", type: "place_value_hundreds", max: 999 },
  "3.18": { name: "Missing Addend", type: "missing_addend", max: 50 },
  "3.19": { name: "Fraction Halves", type: "fractions_half", max: 20 },
  "3.20": { name: "Mixed Operations 100", type: "mixed_all", max: 100 },

  // LEVEL 4 - GRADE 3/4
  "4.1": { name: "Add to 200", type: "addition", max: 200 },
  "4.2": { name: "Subtract from 200", type: "subtraction", max: 200 },
  "4.3": { name: "Add to 1000", type: "addition", max: 1000 },
  "4.4": { name: "Subtract from 1000", type: "subtraction", max: 1000 },
  "4.5": { name: "11 Times Table", type: "times_table", table: 11 },
  "4.6": { name: "12 Times Table", type: "times_table", table: 12 },
  "4.7": { name: "Mixed Division", type: "mixed_division", tables: [2,3,4,5,6,7,8,9,10] },
  "4.8": { name: "Multiply by 10", type: "multiply_ten", max: 99 },
  "4.9": { name: "Multiply by 100", type: "multiply_hundred", max: 99 },
  "4.10": { name: "Divide by 10", type: "divide_ten", max: 990 },
  "4.11": { name: "Decimals Add", type: "decimal_add", max: 10 },
  "4.12": { name: "Decimals Subtract", type: "decimal_subtract", max: 10 },
  "4.13": { name: "Fraction Quarters", type: "fractions_quarter", max: 16 },
  "4.14": { name: "Percentage 10s", type: "percentage_tens", max: 100 },
  "4.15": { name: "Square Numbers", type: "squares", max: 10 },
  "4.16": { name: "Double & Half", type: "double_half", max: 100 },
  "4.17": { name: "Add Hundreds", type: "add_hundreds", max: 900 },
  "4.18": { name: "Subtract Hundreds", type: "subtract_hundreds", max: 1000 },
  "4.19": { name: "Round to 1000", type: "rounding", target: 1000 },
  "4.20": { name: "Mixed Advanced", type: "mixed_advanced", max: 1000 }
};

// IMPROVED Question generator (keeping same logic)
const generateQuestion = (sublevel, config, seed = 0) => {
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  switch (config.type) {
    case "counting":
      const count = randomInt(1, config.max);
      return {
        question: `Count the dots:`,
        answer: count,
        display: "•".repeat(count),
        uniqueId: `count_${count}_${Date.now()}_${Math.random()}`
      };

    case "add_one":
      const num1 = randomInt(0, config.max);
      return {
        question: `${num1} + 1 = ?`,
        answer: num1 + 1,
        uniqueId: `add1_${num1}_${Date.now()}_${Math.random()}`
      };

    case "subtract_one":
      const num2 = randomInt(1, config.max);
      return {
        question: `${num2} - 1 = ?`,
        answer: num2 - 1,
        uniqueId: `sub1_${num2}_${Date.now()}_${Math.random()}`
      };

    case "times_table":
      const multiplier = randomInt(1, 12);
      return {
        question: `${multiplier} × ${config.table} = ?`,
        answer: multiplier * config.table,
        uniqueId: `times_${multiplier}_${config.table}_${Date.now()}_${Math.random()}`
      };

    case "division":
      const quotient = randomInt(1, 12);
      const dividend = quotient * config.table;
      return {
        question: `${dividend} ÷ ${config.table} = ?`,
        answer: quotient,
        uniqueId: `div_${dividend}_${config.table}_${Date.now()}_${Math.random()}`
      };

    case "addition":
      const addA = randomInt(1, Math.floor(config.max * 0.6));
      const addB = randomInt(1, config.max - addA);
      return {
        question: `${addA} + ${addB} = ?`,
        answer: addA + addB,
        uniqueId: `add_${addA}_${addB}_${Date.now()}_${Math.random()}`
      };

    case "subtraction":
      const subResult = randomInt(1, config.max - 1);
      const subAmount = randomInt(1, config.max - subResult);
      return {
        question: `${subResult + subAmount} - ${subAmount} = ?`,
        answer: subResult,
        uniqueId: `sub_${subResult + subAmount}_${subAmount}_${Date.now()}_${Math.random()}`
      };

    default:
      return {
        question: "2 + 2 = ?",
        answer: 4,
        uniqueId: `default_${Date.now()}_${Math.random()}`
      };
  }
};

const StudentMathMentals = ({ 
  studentData, 
  classData, 
  showToast
}) => {
  const [studentAssignment, setStudentAssignment] = useState(null);
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [hasAttemptedToday, setHasAttemptedToday] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  // Detect architecture version from session storage
  const [architectureVersion, setArchitectureVersion] = useState('unknown');
  const [teacherUserId, setTeacherUserId] = useState(null);

  useEffect(() => {
    // Get architecture info from session
    try {
      const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
      setArchitectureVersion(session.architectureVersion || 'unknown');
      setTeacherUserId(session.teacherUserId);
    } catch (error) {
      console.warn('Could not parse session storage:', error);
    }

    if (studentData && classData) {
      findStudentAssignment();
    }
  }, [studentData, classData]);

  // Timer effect (keeping same)
  useEffect(() => {
    if (testStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testStarted && !showResults) {
      finishTest(userAnswers);
    }
  }, [timeLeft, testStarted, showResults, userAnswers]);

  const findStudentAssignment = () => {
    // Get math groups from class data (keeping same logic)
    const mathGroups = classData?.toolkitData?.mathMentalsGroups || [];
    
    // Find which group this student belongs to
    const studentGroup = mathGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      const studentInfo = studentGroup.students.find(s => s.id === studentData.id);
      
      // CRITICAL FIX: Prioritize student's main progress data over group data
      const today = new Date().toISOString().split('T')[0];
      
      // Use student's main progress as the authoritative source
      const studentMainProgress = studentData.mathMentalsProgress?.progress || {};
      const groupProgress = studentInfo.progress || {};
      
      // Prioritize student main progress, fallback to group progress
      const combinedProgress = { ...groupProgress, ...studentMainProgress };
      
      const todayAttempt = combinedProgress[today];
      
      console.log('📅 FIXED Date check:', {
        today,
        hasAttempt: !!todayAttempt,
        studentMainProgressKeys: Object.keys(studentMainProgress),
        groupProgressKeys: Object.keys(groupProgress),
        combinedProgressKeys: Object.keys(combinedProgress),
        studentName: studentInfo.firstName,
        todayAttempt,
        usingMainProgress: Object.keys(studentMainProgress).length > 0
      });
      
      setStudentAssignment({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        // PRIORITIZE student main data over group data
        currentLevel: studentData.mathMentalsProgress?.currentLevel || studentInfo.currentLevel,
        progress: combinedProgress,
        streak: studentData.mathMentalsProgress?.streak ?? studentInfo.streak ?? 0,
        studentInfo: studentInfo
      });

      setHasAttemptedToday(!!todayAttempt);
    } else {
      console.log('❌ Student not found in any math group');
      setStudentAssignment(null);
    }
  };

  // FIXED: Direct database update function (no API calls)
  const updateStudentDataDirect = async (updatedStudentData) => {
    if (!teacherUserId || !classData || !studentData) {
      console.error('❌ Missing required data for student update');
      showToast('Unable to save changes. Please try logging in again.', 'error');
      return false;
    }

    try {
      console.log('💾 DIRECT: Updating student math progress (no API):', studentData.firstName);
      
      if (architectureVersion === 'v2') {
        // DIRECT V2 UPDATE - bypassing problematic APIs (same as XP system)
        const studentRef = doc(firestore, 'students', studentData.id);
        const updates = {
          ...updatedStudentData,
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        
        await updateDoc(studentRef, updates);
        console.log('✅ V2 direct math progress update completed');
        
      } else {
        // DIRECT V1 UPDATE - update in user document (same as XP system)
        const userRef = doc(firestore, 'users', teacherUserId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedClasses = userData.classes.map(cls => {
            if (cls.classCode?.toUpperCase() === classData.classCode?.toUpperCase()) {
              return {
                ...cls,
                students: cls.students.map(s => {
                  if (s.id === studentData.id) {
                    return { 
                      ...s, 
                      ...updatedStudentData,
                      updatedAt: new Date().toISOString() 
                    };
                  }
                  return s;
                })
              };
            }
            return cls;
          });
          
          await updateDoc(userRef, { classes: updatedClasses });
          console.log('✅ V1 direct math progress update completed');
        }
      }

      // Update session storage if it exists
      try {
        const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
        if (session.studentData) {
          session.studentData = { ...session.studentData, ...updatedStudentData };
          sessionStorage.setItem('studentSession', JSON.stringify(session));
        }
      } catch (sessionError) {
        console.warn('Could not update session storage:', sessionError);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Direct math progress update error:', error);
      showToast('Failed to save progress. Please try again.', 'error');
      return false;
    }
  };

  const startTest = () => {
    if (!studentAssignment || hasAttemptedToday) {
      console.log('⚠️ Cannot start test:', { hasAssignment: !!studentAssignment, hasAttemptedToday });
      return;
    }

    const levelConfig = MATH_SUBLEVELS[studentAssignment.currentLevel];
    if (!levelConfig) {
      console.error('❌ Invalid level config:', studentAssignment.currentLevel);
      showToast('Error: Invalid level configuration', 'error');
      return;
    }

    // Generate 10 truly unique questions (keeping same logic)
    const newQuestions = [];
    const usedQuestionIds = new Set();
    const maxAttempts = 100;
    let attempts = 0;
    
    while (newQuestions.length < 10 && attempts < maxAttempts) {
      const question = generateQuestion(studentAssignment.currentLevel, levelConfig, attempts);
      
      if (!usedQuestionIds.has(question.uniqueId)) {
        usedQuestionIds.add(question.uniqueId);
        newQuestions.push({
          ...question,
          id: newQuestions.length + 1
        });
      }
      attempts++;
    }
    
    // Fill remaining if needed
    while (newQuestions.length < 10) {
      const question = generateQuestion(studentAssignment.currentLevel, levelConfig, Date.now() + newQuestions.length);
      newQuestions.push({
        ...question,
        id: newQuestions.length + 1
      });
    }

    console.log('🎯 Generated questions:', newQuestions.map(q => ({ question: q.question, answer: q.answer })));

    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setUserInput('');
    setTimeLeft(120);
    setCurrentTest(true);
    setShowResults(false);
    setTestStarted(true);
  };

  const handleSubmitAnswer = () => {
    if (!testStarted) return;
    
    const currentAnswer = userInput.trim();
    const correctAnswer = questions[currentQuestionIndex].answer;
    
    const newAnswers = [...userAnswers, {
      question: questions[currentQuestionIndex].question,
      userAnswer: currentAnswer,
      correctAnswer: correctAnswer,
      isCorrect: parseFloat(currentAnswer) === correctAnswer,
      display: questions[currentQuestionIndex].display
    }];

    setUserAnswers(newAnswers);
    setUserInput('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  // FIXED: Direct database saving in finishTest
  const finishTest = async (finalAnswers) => {
    setShowResults(true);
    setCurrentTest(false);
    setTestStarted(false);

    const score = finalAnswers.filter(a => a.isCorrect).length;
    const today = new Date().toISOString().split('T')[0];

    console.log('🏆 Test completed:', { score, today, totalQuestions: finalAnswers.length });

    // Calculate new progress data (keeping same logic)
    const updatedProgress = {
      ...studentAssignment.progress,
      [today]: {
        level: studentAssignment.currentLevel,
        score: score,
        totalQuestions: 10,
        timestamp: new Date().toISOString(),
        answers: finalAnswers
      }
    };

    let newStreak = studentAssignment.streak;
    let newCurrentLevel = studentAssignment.currentLevel;
    let shouldAdvance = false;

    // Streak and advancement logic (keeping same)
    if (score === 10) {
      newStreak += 1;
      
      if (newStreak >= 3) {
        const allLevels = Object.keys(MATH_SUBLEVELS).sort();
        const currentIndex = allLevels.indexOf(studentAssignment.currentLevel);
        
        if (currentIndex < allLevels.length - 1) {
          newCurrentLevel = allLevels[currentIndex + 1];
          newStreak = 0;
          shouldAdvance = true;
        }
      }
    } else {
      newStreak = 0;
    }

    // FIXED: Use direct database update instead of broken API
    try {
      console.log('💾 Saving progress to database directly (no API)...');
      
      const success = await updateStudentDataDirect({
        mathMentalsProgress: {
          currentLevel: newCurrentLevel,
          progress: updatedProgress,
          streak: newStreak,
          lastAttempt: today
        }
      });

      if (success) {
        console.log('✅ Progress saved successfully via direct database update');
        
        // Update local assignment state immediately 
        const newAssignment = {
          ...studentAssignment,
          currentLevel: newCurrentLevel,
          progress: updatedProgress,
          streak: newStreak
        };
        
        setStudentAssignment(newAssignment);
        setHasAttemptedToday(true);
        
        // Show success message
        if (shouldAdvance) {
          showToast(`Amazing! You've advanced to ${newCurrentLevel}!`, 'success');
        } else if (score === 10) {
          const remainingForAdvance = 3 - newStreak;
          showToast(`Perfect score! ${remainingForAdvance} more perfect day${remainingForAdvance !== 1 ? 's' : ''} to advance!`, 'success');
        } else {
          showToast(`You scored ${score}/10. Keep practicing!`, 'info');
        }
      } else {
        console.error('❌ Direct database update failed');
        showToast('Error saving results. Please try again.', 'error');
      }
    } catch (error) {
      console.error('❌ Network error saving progress via direct update:', error);
      showToast('Error saving results. Please check your internet connection.', 'error');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userInput.trim() && testStarted) {
      handleSubmitAnswer();
    }
  };

  const resetTest = () => {
    setCurrentTest(false);
    setShowResults(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setUserInput('');
    setTimeLeft(120);
    setTestStarted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // REST OF COMPONENT RENDERING (keeping exactly the same)
  if (!studentAssignment) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8 text-center">
        <div className="text-4xl md:text-6xl mb-4">🧮</div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Math Assignment</h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Your teacher hasn't assigned you to a math group yet.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm">
            Ask your teacher to assign you to a math group in the Curriculum Corner!
          </p>
        </div>
      </div>
    );
  }

  // Test interface
  if (currentTest && !showResults) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Math Mentals Test</h1>
              <p className="text-sm text-gray-600">{studentAssignment.groupName} • {studentAssignment.currentLevel}</p>
            </div>
            <button
              onClick={resetTest}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Exit Test
            </button>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className={`font-bold text-lg ${timeLeft <= 30 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              Time: {formatTime(timeLeft)}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {timeLeft <= 30 && (
            <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-2 text-center">
              <p className="text-red-800 font-semibold text-sm">⏰ Less than 30 seconds remaining!</p>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </h2>
          
          {currentQuestion.display && (
            <div className="text-6xl text-blue-600 mb-6 font-mono">
              {currentQuestion.display}
            </div>
          )}

          <div className="max-w-xs mx-auto">
            <input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your answer..."
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <button
              onClick={handleSubmitAnswer}
              disabled={!userInput.trim()}
              className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Test' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    const score = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / userAnswers.length) * 100);

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-green-500">
          <div className="text-6xl mb-4">
            {score === 10 ? '🏆' : score >= 7 ? '⭐' : '📈'}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Test Complete!</h1>
          <div className="text-2xl font-bold text-blue-600">
            {score} / {userAnswers.length} ({percentage}%)
          </div>
          {score === 10 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800">Perfect Score! 🎉</p>
              <p className="text-sm text-green-700">
                Streak: {studentAssignment.streak + 1} perfect day{(studentAssignment.streak + 1) !== 1 ? 's' : ''}
              </p>
              {studentAssignment.streak + 1 >= 3 && (
                <p className="text-sm text-green-700 mt-1">Ready to advance to next level!</p>
              )}
            </div>
          )}
        </div>

        {/* Answer Review */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Review Your Answers</h2>
          <div className="space-y-4">
            {userAnswers.map((answer, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                answer.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold">Q{index + 1}: {answer.question}</span>
                    {answer.display && (
                      <div className="text-lg text-blue-600 mt-1 font-mono">{answer.display}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      answer.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {answer.isCorrect ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Your answer: {answer.userAnswer}
                    </div>
                    {!answer.isCorrect && (
                      <div className="text-sm text-gray-600">
                        Correct: {answer.correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowResults(false)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            Back to Math Mentals
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center text-gray-800">
            <span className="mr-3">🧮</span>
            Math Mentals
          </h1>
          <div className="text-lg md:text-xl text-blue-600 font-semibold">
            {studentAssignment.groupName}
          </div>
          <div className="text-sm md:text-base text-gray-600 mt-2">
            Current Level: {studentAssignment.currentLevel} - {MATH_SUBLEVELS[studentAssignment.currentLevel]?.name}
          </div>
        </div>
      </div>

      {/* Current Level Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {studentAssignment.currentLevel}: {MATH_SUBLEVELS[studentAssignment.currentLevel]?.name}
          </h2>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full">
              Streak: {studentAssignment.streak} perfect day{studentAssignment.streak !== 1 ? 's' : ''}
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full">
              Need {Math.max(0, 3 - studentAssignment.streak)} more perfect scores to advance
            </div>
          </div>
        </div>

        {/* Daily Test Button */}
        <div className="text-center">
          {hasAttemptedToday ? (
            <div className="bg-gray-50 rounded-xl p-8">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Test Complete for Today!</h3>
              <p className="text-gray-600 mb-4">
                Come back tomorrow for your next math mentals challenge.
              </p>
              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Today's result: {studentAssignment.progress?.[new Date().toISOString().split('T')[0]]?.score || 0}/10
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Ready for Today's Test?</h3>
              <p className="text-gray-600 mb-6">
                10 questions • 2 minutes total • One attempt per day
              </p>
              <button
                onClick={startTest}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                🚀 Start Test
              </button>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⏰ You have 2 minutes to answer all 10 questions. Ready when you are!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(studentAssignment.progress || {})
            .slice(-7)
            .map(([date, result]) => (
              <div key={date} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className={`text-lg font-bold ${
                  result.score === 10 ? 'text-green-600' : 
                  result.score >= 7 ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {result.score}/10
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">💡 Tips for Success</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">🎯 Test Strategy:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Work quickly but carefully</li>
              <li>• Skip hard questions and come back</li>
              <li>• Use mental math strategies</li>
              <li>• Watch the timer</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">🚀 Level Up:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Get 10/10 three days in a row</li>
              <li>• Advance automatically</li>
              <li>• Master each level completely</li>
              <li>• Build number fact fluency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMathMentals;