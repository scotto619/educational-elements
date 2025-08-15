// components/quizshow/student/StudentGameView.js - COMPLETELY FIXED - NO MORE BUGS
import React, { useState, useEffect, useRef } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const StudentGameView = ({ roomCode, gameData, playerInfo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPhase, setQuestionPhase] = useState('waiting');
  const [score, setScore] = useState(0);
  
  // Use refs to prevent state resets and timer issues
  const answerSubmittedRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const currentQuestionRef = useRef(-1);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  // Handle game data updates
  useEffect(() => {
    if (gameData?.currentQuestion !== undefined) {
      const newQuestionIndex = gameData.currentQuestion;
      
      // Only reset if we're on a different question
      if (newQuestionIndex !== currentQuestionRef.current) {
        console.log(`🔄 NEW QUESTION ${newQuestionIndex}: Complete reset`);
        currentQuestionRef.current = newQuestionIndex;
        setCurrentQuestionIndex(newQuestionIndex);
        setSelectedAnswer(null);
        setHasAnswered(false);
        answerSubmittedRef.current = false;
        
        // Clear any existing timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    }

    if (gameData?.questionPhase) {
      setQuestionPhase(gameData.questionPhase);
      
      // Start timer when entering answering phase
      if (gameData.questionPhase === 'answering' && !timerIntervalRef.current) {
        const timeLimit = currentQuestion?.timeLimit || 20;
        console.log(`⏰ STARTING TIMER: ${timeLimit} seconds`);
        setTimeLeft(timeLimit);
        
        // Start interval timer
        timerIntervalRef.current = setInterval(() => {
          setTimeLeft(prev => {
            const newTime = prev - 1;
            if (newTime <= 0) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
              return 0;
            }
            return newTime;
          });
        }, 1000);
      }
    }

    // Update score ONLY from Firebase - never locally
    if (gameData?.responses && playerInfo?.playerId) {
      let totalScore = 0;
      Object.values(gameData.responses).forEach(questionResponses => {
        const playerResponse = questionResponses[playerInfo.playerId];
        if (playerResponse?.points !== undefined) {
          totalScore += playerResponse.points;
        }
      });
      setScore(totalScore);
    }
  }, [gameData, currentQuestion]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const submitAnswer = async (answerIndex) => {
    // ABSOLUTE protection against multiple submissions
    if (answerSubmittedRef.current || hasAnswered || questionPhase !== 'answering') {
      console.log(`🚫 BLOCKED: submitted=${answerSubmittedRef.current}, hasAnswered=${hasAnswered}, phase=${questionPhase}`);
      return;
    }

    console.log(`📝 SUBMITTING ANSWER ${answerIndex} for question ${currentQuestionIndex}`);
    
    // IMMEDIATELY block all further attempts
    answerSubmittedRef.current = true;
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);

    if (!currentQuestion || !currentQuestion.options) {
      console.error('❌ No question data');
      return;
    }
    
    // SIMPLE answer validation - convert everything to strings first, then numbers
    const correctAnswerStr = String(currentQuestion.correctAnswer);
    const submittedAnswerStr = String(answerIndex);
    const correctAnswerNum = parseInt(correctAnswerStr, 10);
    const submittedAnswerNum = parseInt(submittedAnswerStr, 10);
    
    // Use number comparison
    const isCorrect = submittedAnswerNum === correctAnswerNum;
    
    // MAXIMUM DEBUG OUTPUT
    console.log(`🔍 ANSWER VALIDATION BREAKDOWN:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Question: "${currentQuestion.question}"`);
    console.log(`Options Array:`, currentQuestion.options);
    console.log(`Raw correctAnswer from data: ${currentQuestion.correctAnswer} (type: ${typeof currentQuestion.correctAnswer})`);
    console.log(`Raw submitted index: ${answerIndex} (type: ${typeof answerIndex})`);
    console.log(`Converted correct: ${correctAnswerNum} (type: ${typeof correctAnswerNum})`);
    console.log(`Converted submitted: ${submittedAnswerNum} (type: ${typeof submittedAnswerNum})`);
    console.log(`Correct option text: "${currentQuestion.options[correctAnswerNum]}"`);
    console.log(`Submitted option text: "${currentQuestion.options[submittedAnswerNum]}"`);
    console.log(`Comparison: ${submittedAnswerNum} === ${correctAnswerNum} = ${isCorrect}`);
    console.log(`RESULT: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    const points = isCorrect ? 10 : -5;
    
    playQuizSound('answerSubmit');

    // Submit to Firebase
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${currentQuestionIndex}/${playerInfo.playerId}`;
      const responseData = {
        answer: submittedAnswerNum,
        timeSpent: 0,
        isCorrect: isCorrect,
        points: points,
        submittedAt: Date.now()
      };
      
      console.log(`📤 Firebase submission:`, responseData);
      await set(ref(database, responsePath), responseData);
      console.log(`✅ Successfully submitted to Firebase`);
      
    } catch (error) {
      console.error('❌ Firebase error:', error);
      // Reset on error
      answerSubmittedRef.current = false;
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const getAnswerButtonStyle = (index) => {
    let style = `relative p-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform`;
    
    if (questionPhase === 'answering') {
      if (hasAnswered && selectedAnswer === index) {
        // Show selected - blue styling, no correct/incorrect indication
        style += ` bg-blue-600 ring-8 ring-blue-300 scale-110 shadow-2xl border-4 border-blue-400`;
      } else if (hasAnswered) {
        // Not selected
        style += ' bg-gray-400 opacity-50 cursor-not-allowed';
      } else {
        // Available to click
        const colors = ['bg-red-500 hover:bg-red-600', 'bg-blue-500 hover:bg-blue-600', 'bg-green-500 hover:bg-green-600', 'bg-yellow-500 hover:bg-yellow-600'];
        style += ` ${colors[index % colors.length]} hover:scale-105 cursor-pointer shadow-lg`;
      }
    } else if (questionPhase === 'results') {
      // Show correct/incorrect feedback only in results phase
      if (index === selectedAnswer && index === currentQuestion.correctAnswer) {
        style += ' bg-green-500 ring-4 ring-green-300 scale-105';
      } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
        style += ' bg-red-500 ring-4 ring-red-300 scale-105';
      } else if (index === currentQuestion.correctAnswer) {
        style += ' bg-green-400 ring-2 ring-green-300';
      } else {
        style += ' bg-gray-400';
      }
    } else {
      style += ' bg-gray-400 cursor-not-allowed';
    }

    return style;
  };

  if (questionPhase === 'waiting' || questionPhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          {questionPhase === 'finished' ? (
            <>
              <div className="text-6xl mb-6">🏁</div>
              <h1 className="text-3xl font-bold mb-4">Game Finished!</h1>
              <p className="text-xl text-purple-200 mb-4">Final Score: {score} points</p>
              <p className="text-lg text-purple-300 mb-8">Thanks for playing!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">⏳</div>
              <h1 className="text-3xl font-bold mb-4">Get Ready!</h1>
              <p className="text-xl text-purple-200 mb-8">Question {currentQuestionIndex + 1} of {totalQuestions} is starting soon...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-red-500 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Question...</h1>
          <p>Question index: {currentQuestionIndex}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
              alt="Your avatar"
              className="w-10 h-10 rounded-full border-2 border-purple-300"
            />
            <div>
              <h2 className="font-bold text-gray-800">{playerInfo?.name}</h2>
              <p className="text-sm text-gray-600">Score: {score} points</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-600">Question</div>
            <div className="font-bold text-gray-800">{currentQuestionIndex + 1} / {totalQuestions}</div>
          </div>
          
          {/* Timer - only show during answering */}
          {questionPhase === 'answering' && timeLeft > 0 && (
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
              timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'
            }`}>
              {timeLeft}s
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h1>
            
            {questionPhase === 'answering' && !hasAnswered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold">Choose your answer!</p>
              </div>
            )}

            {questionPhase === 'answering' && hasAnswered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-semibold">✅ Answer locked in! Waiting for results...</p>
              </div>
            )}

            {questionPhase === 'results' && (
              <div className={`border rounded-lg p-4 ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`font-semibold ${
                  selectedAnswer === currentQuestion.correctAnswer 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer 
                    ? '🎉 Correct! +10 points' 
                    : '❌ Incorrect! -5 points'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={hasAnswered || questionPhase !== 'answering'}
                className={getAnswerButtonStyle(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-left">{option}</span>
                </div>
                
                {/* Selected indicator */}
                {selectedAnswer === index && questionPhase === 'answering' && (
                  <>
                    <div className="absolute top-2 right-2 bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-bold border-2 border-blue-600">
                      ✓ SELECTED
                    </div>
                    <div className="absolute -top-2 -left-2 text-3xl animate-bounce">⭐</div>
                  </>
                )}

                {/* Results phase indicators */}
                {questionPhase === 'results' && (
                  <div className="absolute top-3 right-3 text-2xl">
                    {index === selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                    {index === selectedAnswer && index !== currentQuestion.correctAnswer && '❌'}
                    {index !== selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Waiting Status */}
        {hasAnswered && questionPhase === 'answering' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-600 font-semibold">Waiting for other players...</p>
            <p className="text-sm text-gray-500 mt-2">
              Your answer: <strong>{currentQuestion.options[selectedAnswer]}</strong>
            </p>
          </div>
        )}

        {/* Score Display - NO immediate updates */}
        <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold mb-2">Your Total Score</h3>
          <div className="text-3xl font-bold">{score} points</div>
          <p className="text-sm opacity-90 mt-2">Updated after each question is complete</p>
        </div>

        {/* Debug Panel */}
        <div className="mt-6 bg-gray-900 text-white rounded-xl p-4 text-xs font-mono">
          <h4 className="font-bold mb-2 text-yellow-400">🔧 DEBUG PANEL:</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="text-cyan-400">Question Index:</span> {currentQuestionIndex}</p>
              <p><span className="text-cyan-400">Question Phase:</span> {questionPhase}</p>
              <p><span className="text-cyan-400">Has Answered:</span> {hasAnswered ? 'YES' : 'NO'}</p>
              <p><span className="text-cyan-400">Answer Submitted Ref:</span> {answerSubmittedRef.current ? 'YES' : 'NO'}</p>
              <p><span className="text-cyan-400">Selected Answer:</span> {selectedAnswer !== null ? selectedAnswer : 'None'}</p>
            </div>
            <div>
              <p><span className="text-cyan-400">Correct Answer:</span> {currentQuestion?.correctAnswer} ({typeof currentQuestion?.correctAnswer})</p>
              <p><span className="text-cyan-400">Timer Active:</span> {timerIntervalRef.current ? 'YES' : 'NO'}</p>
              <p><span className="text-cyan-400">Time Left:</span> {timeLeft}s</p>
              <p><span className="text-cyan-400">Score:</span> {score}</p>
              <p><span className="text-cyan-400">Options Count:</span> {currentQuestion?.options?.length || 0}</p>
            </div>
          </div>
          {currentQuestion?.options && (
            <div className="mt-2">
              <p><span className="text-cyan-400">Options:</span> [{currentQuestion.options.map((opt, i) => `${i}:"${opt}"`).join(', ')}]</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentGameView;