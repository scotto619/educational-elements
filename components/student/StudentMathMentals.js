// components/student/StudentMathMentals.js - FIXED WITH PROPER DATA VALIDATION FOR FIRESTORE
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';

// Math Mentals levels, sublevels, and question generation now live in
// utils/mathMentalsEngine.js — a single robust engine that implements ALL
// question types (the old inline generator only implemented 7 of 49 types and
// silently returned "2 + 2" for everything else).
// Re-exported here so existing imports keep working.
import {
  MATH_LEVELS,
  MATH_SUBLEVELS,
  generateQuestion,
  generateQuestionSet,
  getNextSublevel,
  checkAnswer as engineCheckAnswer,
} from '../../utils/mathMentalsEngine';

export { MATH_LEVELS, MATH_SUBLEVELS, generateQuestion };

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
  const [architectureVersion, setArchitectureVersion] = useState('unknown');
  const [teacherUserId, setTeacherUserId] = useState(null);

  useEffect(() => {
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

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testStarted && !showResults) {
      finishTest(userAnswers);
    }
  }, [timeLeft, testStarted, showResults, userAnswers]);

  const findStudentAssignment = () => {
    const mathGroups = classData?.toolkitData?.mathMentalsGroups || [];
    
    const studentGroup = mathGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      const studentInfo = studentGroup.students.find(s => s.id === studentData.id);
      const today = new Date().toISOString().split('T')[0];
      
      const studentMainProgress = studentData.mathMentalsProgress?.progress || {};
      const groupProgress = studentInfo.progress || {};
      const combinedProgress = { ...groupProgress, ...studentMainProgress };
      const todayAttempt = combinedProgress[today];
      
      setStudentAssignment({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        currentLevel: studentData.mathMentalsProgress?.currentLevel || studentInfo.currentLevel,
        progress: combinedProgress,
        streak: studentData.mathMentalsProgress?.streak ?? studentInfo.streak ?? 0,
        studentInfo: studentInfo
      });

      setHasAttemptedToday(!!todayAttempt);
    } else {
      setStudentAssignment(null);
    }
  };

  // FIXED: Direct database update with deep data validation
  const updateStudentDataDirect = async (updatedStudentData) => {
    if (!teacherUserId || !classData || !studentData) {
      console.error('❌ Missing required data for student update');
      showToast('Unable to save changes. Please try logging in again.', 'error');
      return false;
    }

    try {
      
      // CRITICAL FIX: Deep clean all data to prevent undefined values
      const cleanMathProgress = {};
      if (updatedStudentData.mathMentalsProgress) {
        const mp = updatedStudentData.mathMentalsProgress;
        
        // Clean primitive values
        if (mp.currentLevel !== undefined && mp.currentLevel !== null) {
          cleanMathProgress.currentLevel = mp.currentLevel;
        }
        
        if (mp.streak !== undefined && mp.streak !== null) {
          cleanMathProgress.streak = mp.streak;
        }
        
        if (mp.lastAttempt !== undefined && mp.lastAttempt !== null) {
          cleanMathProgress.lastAttempt = mp.lastAttempt;
        }
        
        // Deep clean progress object (contains daily results)
        if (mp.progress !== undefined && mp.progress !== null && typeof mp.progress === 'object') {
          cleanMathProgress.progress = {};
          
          // Clean each date entry
          for (const [date, result] of Object.entries(mp.progress)) {
            if (result && typeof result === 'object') {
              cleanMathProgress.progress[date] = {
                level: result.level || '',
                score: result.score || 0,
                totalQuestions: result.totalQuestions || 10,
                timestamp: result.timestamp || new Date().toISOString(),
                // Clean answers array if it exists
                answers: Array.isArray(result.answers) ? result.answers.map(a => ({
                  question: a?.question || '',
                  userAnswer: a?.userAnswer || '',
                  correctAnswer: a?.correctAnswer || 0,
                  isCorrect: a?.isCorrect || false,
                  display: a?.display || ''
                })) : []
              };
            }
          }
        }
      }
      
      if (architectureVersion === 'v2') {
        const studentRef = doc(firestore, 'students', studentData.id);
        
        const updates = {
          mathMentalsProgress: cleanMathProgress,
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        
        await updateDoc(studentRef, updates);
        
      } else {
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
                      mathMentalsProgress: cleanMathProgress,
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
        }
      }

      // Update session storage with cleaned data
      try {
        const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
        if (session.studentData) {
          session.studentData = { 
            ...session.studentData, 
            mathMentalsProgress: cleanMathProgress 
          };
          sessionStorage.setItem('studentSession', JSON.stringify(session));
        }
      } catch (sessionError) {
        console.warn('Could not update session storage:', sessionError);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Direct math progress update error:', error);
      console.error('Error details:', error.message);
      showToast('Failed to save progress: ' + error.message, 'error');
      return false;
    }
  };

  const startTest = () => {
    if (!studentAssignment || hasAttemptedToday) {
      return;
    }

    const levelConfig = MATH_SUBLEVELS[studentAssignment.currentLevel];
    if (!levelConfig) {
      console.error('❌ Invalid level config:', studentAssignment.currentLevel);
      showToast('Error: Invalid level configuration', 'error');
      return;
    }

    // Engine guarantees 10 questions with no duplicate question text
    const newQuestions = generateQuestionSet(studentAssignment.currentLevel, 10)
      .map((question, i) => ({ ...question, id: i + 1 }));

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
      isCorrect: engineCheckAnswer(questions[currentQuestionIndex], currentAnswer),
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

  const finishTest = async (finalAnswers) => {
    setShowResults(true);
    setCurrentTest(false);
    setTestStarted(false);

    const score = finalAnswers.filter(a => a.isCorrect).length;
    const today = new Date().toISOString().split('T')[0];


    // CRITICAL FIX: Clean answers to remove any undefined values
    const cleanAnswers = finalAnswers.map(answer => ({
      question: answer.question || '',
      userAnswer: answer.userAnswer || '',
      correctAnswer: answer.correctAnswer || 0,
      isCorrect: answer.isCorrect || false,
      display: answer.display || ''
    }));

    const updatedProgress = {
      ...studentAssignment.progress,
      [today]: {
        level: studentAssignment.currentLevel,
        score: score,
        totalQuestions: 10,
        timestamp: new Date().toISOString(),
        answers: cleanAnswers  // Use cleaned answers
      }
    };

    let newStreak = studentAssignment.streak;
    let newCurrentLevel = studentAssignment.currentLevel;
    let shouldAdvance = false;

    if (score === 10) {
      newStreak += 1;
      
      if (newStreak >= 3) {
        // Uses proper numeric ordering (1.2 after 1.1 — not the old
        // alphabetical sort that jumped from 1.1 straight to 1.10!)
        const next = getNextSublevel(studentAssignment.currentLevel);
        if (next) {
          newCurrentLevel = next;
          newStreak = 0;
          shouldAdvance = true;
        }
      }
    } else {
      newStreak = 0;
    }

    try {
      
      const success = await updateStudentDataDirect({
        mathMentalsProgress: {
          currentLevel: newCurrentLevel,
          progress: updatedProgress,
          streak: newStreak,
          lastAttempt: today
        }
      });

      if (success) {
        
        const newAssignment = {
          ...studentAssignment,
          currentLevel: newCurrentLevel,
          progress: updatedProgress,
          streak: newStreak
        };
        
        setStudentAssignment(newAssignment);
        setHasAttemptedToday(true);
        
        if (shouldAdvance) {
          showToast(`Amazing! You've advanced to ${newCurrentLevel}!`, 'success');
        } else if (score === 10) {
          const remainingForAdvance = 3 - newStreak;
          showToast(`Perfect score! ${remainingForAdvance} more perfect day${remainingForAdvance !== 1 ? 's' : ''} to advance!`, 'success');
        } else {
          showToast(`You scored ${score}/10. Keep practicing!`, 'info');
        }
      } else {
        console.error('❌ Save failed');
        showToast('Error saving results. Please try again.', 'error');
      }
    } catch (error) {
      console.error('❌ Error saving progress:', error);
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

  // [REST OF RENDERING CODE - keeping exactly the same as original...]
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
            Ask your teacher to assign you to a math group in the Resource Hub!
          </p>
        </div>
      </div>
    );
  }

  if (currentTest && !showResults) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="space-y-6">
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

  if (showResults) {
    const score = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((score / userAnswers.length) * 100);

    return (
      <div className="space-y-6">
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

  return (
    <div className="space-y-6">
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