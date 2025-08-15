// components/quizshow/student/StudentGameView.js - FINAL FIX - NO IMMEDIATE SCORE UPDATES
import React, { useState, useEffect } from 'react';
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
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false); // Track if timer has started for this question

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  useEffect(() => {
    if (gameData?.currentQuestion !== undefined) {
      const newQuestionIndex = gameData.currentQuestion;
      
      // Only reset if we're on a different question
      if (newQuestionIndex !== currentQuestionIndex) {
        console.log(`🔄 New question ${newQuestionIndex}: Resetting answer state`);
        setCurrentQuestionIndex(newQuestionIndex);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setAnswerStartTime(null);
        setTimerStarted(false); // Reset timer flag
      }
    }

    if (gameData?.questionPhase) {
      setQuestionPhase(gameData.questionPhase);
      
      // Start timer when entering answering phase - but only once per question
      if (gameData.questionPhase === 'answering' && !timerStarted) {
        const timeLimit = currentQuestion?.timeLimit || 20;
        console.log(`⏰ Starting timer for ${timeLimit} seconds`);
        setAnswerStartTime(Date.now());
        setTimeLeft(timeLimit);
        setTimerStarted(true); // Mark timer as started
      }
    }

    // Update score from Firebase responses ONLY
    updatePlayerScore();
  }, [gameData, currentQuestionIndex, timerStarted]); // Fixed dependencies

  // FIXED: Timer logic - only runs when timer is started and phase is answering
  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0 && timerStarted && answerStartTime) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase, timerStarted, answerStartTime]); // Removed hasAnswered completely

  const updatePlayerScore = () => {
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
  };

  const submitAnswer = async (answerIndex) => {
    // Prevent multiple submissions
    if (hasAnswered || questionPhase !== 'answering') {
      console.log(`🚫 Answer submission blocked: hasAnswered=${hasAnswered}, phase=${questionPhase}`);
      return;
    }

    console.log(`📝 Submitting answer ${answerIndex} for question ${currentQuestionIndex}`);
    
    // IMMEDIATELY block any further clicks
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);

    const timeSpent = answerStartTime ? (Date.now() - answerStartTime) / 1000 : 0;
    
    if (!currentQuestion || !currentQuestion.options || answerIndex >= currentQuestion.options.length) {
      console.error('❌ Invalid question or answer index');
      setHasAnswered(false);
      setSelectedAnswer(null);
      return;
    }
    
    // ENSURE BOTH VALUES ARE NUMBERS FOR COMPARISON
    const correctAnswerIndex = Number(currentQuestion.correctAnswer);
    const submittedAnswerIndex = Number(answerIndex);
    const isAnswerCorrect = submittedAnswerIndex === correctAnswerIndex;
    
    // ULTRA DETAILED DEBUG LOGGING
    console.log(`🔍 ULTRA DETAILED ANSWER VALIDATION:`);
    console.log(`   Question Text: "${currentQuestion.question}"`);
    console.log(`   All Options: [${currentQuestion.options.map((opt, i) => `${i}:"${opt}"`).join(', ')}]`);
    console.log(`   Raw Submitted Index: ${answerIndex} (type: ${typeof answerIndex})`);
    console.log(`   Raw Correct Index: ${currentQuestion.correctAnswer} (type: ${typeof currentQuestion.correctAnswer})`);
    console.log(`   Converted Submitted: ${submittedAnswerIndex} (type: ${typeof submittedAnswerIndex})`);
    console.log(`   Converted Correct: ${correctAnswerIndex} (type: ${typeof correctAnswerIndex})`);
    console.log(`   Submitted Answer Text: "${currentQuestion.options[submittedAnswerIndex]}"`);
    console.log(`   Correct Answer Text: "${currentQuestion.options[correctAnswerIndex]}"`);
    console.log(`   Comparison Result: ${submittedAnswerIndex} === ${correctAnswerIndex} = ${isAnswerCorrect}`);
    console.log(`   ✅ FINAL ANSWER: ${isAnswerCorrect ? 'CORRECT' : 'INCORRECT'}`);
    
    // Simple scoring: +10 for correct, -5 for incorrect
    const points = isAnswerCorrect ? 10 : -5;

    // Play submission sound ONLY - no score feedback
    playQuizSound('answerSubmit');

    // Submit to Firebase - NO LOCAL SCORE UPDATE AT ALL
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${currentQuestionIndex}/${playerInfo.playerId}`;
      const responseData = {
        answer: submittedAnswerIndex,
        timeSpent: timeSpent,
        isCorrect: isAnswerCorrect,
        points: points,
        submittedAt: Date.now()
      };
      
      console.log(`📤 Submitting to Firebase:`, responseData);
      await set(ref(database, responsePath), responseData);
      
      console.log(`✅ Answer submitted successfully to Firebase`);
      
      // DO NOT UPDATE LOCAL SCORE - Let Firebase handle everything
      
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      // Reset state if submission failed
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const getTimeColor = () => {
    if (timeLeft <= 5) return 'text-red-500';
    if (timeLeft <= 10) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getAnswerButtonColor = (index) => {
    const colors = [
      'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
    ];
    return colors[index] || colors[0];
  };

  const getAnswerButtonStyle = (index) => {
    let buttonStyle = `relative p-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform`;
    
    if (questionPhase === 'answering') {
      if (hasAnswered) {
        if (index === selectedAnswer) {
          // Show selected but no correct/incorrect feedback yet
          buttonStyle += ` bg-gray-700 ring-8 ring-blue-400 ring-opacity-90 transform scale-110 shadow-2xl border-8 border-blue-300`;
        } else {
          buttonStyle += ' bg-gray-400 opacity-30';
        }
      } else {
        // Active answering phase
        buttonStyle += ` bg-gradient-to-r ${getAnswerButtonColor(index)} hover:scale-105 cursor-pointer shadow-lg`;
      }
    } else if (questionPhase === 'results') {
      // Show correct/incorrect feedback ONLY during results phase
      if (index === selectedAnswer && index === currentQuestion.correctAnswer) {
        buttonStyle += ' bg-green-500 ring-4 ring-green-300 transform scale-105';
      } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
        buttonStyle += ' bg-red-500 ring-4 ring-red-300 transform scale-105';
      } else if (index === currentQuestion.correctAnswer) {
        buttonStyle += ' bg-green-400 ring-2 ring-green-300';
      } else {
        buttonStyle += ' bg-gray-400';
      }
    } else {
      buttonStyle += ' bg-gray-400 cursor-not-allowed';
    }

    return buttonStyle;
  };

  if (questionPhase === 'waiting' || questionPhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          {questionPhase === 'finished' ? (
            <>
              <div className="text-6xl mb-6">🏁</div>
              <h1 className="text-3xl font-bold mb-4">Game Finished!</h1>
              <p className="text-xl text-purple-200 mb-4">
                Final Score: {score} points
              </p>
              <p className="text-lg text-purple-300 mb-8">
                Thanks for playing! Check with your teacher for final results.
              </p>
              <div className="bg-white bg-opacity-20 rounded-xl p-6 max-w-md mx-auto">
                <h3 className="text-lg font-bold mb-2">Your Performance</h3>
                <div className="text-2xl font-bold text-yellow-300">{score} points</div>
                <p className="text-sm opacity-90 mt-2">
                  {score >= 0 ? 'Great job! 🎉' : 'Better luck next time! 💪'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">⏳</div>
              <h1 className="text-3xl font-bold mb-4">Get Ready!</h1>
              <p className="text-xl text-purple-200 mb-8">
                Question {currentQuestionIndex + 1} of {totalQuestions} is starting soon...
              </p>
              <div className="animate-pulse">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Game Error</h1>
          <p className="text-xl">No question data available</p>
          <p className="text-sm mt-2">Question index: {currentQuestionIndex}</p>
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
            <div className="font-bold text-gray-800">
              {currentQuestionIndex + 1} / {totalQuestions}
            </div>
          </div>
          
          {/* FIXED: Timer shows during answering phase and never resets */}
          {questionPhase === 'answering' && timerStarted && (
            <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getTimeColor()}`}>
              {timeLeft}s
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-600 mb-2">
              +10 points for correct • -5 points for incorrect
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h1>
            
            {questionPhase === 'answering' && !hasAnswered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-semibold">
                  Choose your answer!
                </p>
              </div>
            )}

            {questionPhase === 'answering' && hasAnswered && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 font-semibold">
                  ✅ Answer submitted! Waiting for results...
                </p>
              </div>
            )}

            {/* ONLY show correct/incorrect feedback during results phase */}
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
                
                {/* Answer Status Icons - ONLY show during results phase */}
                {questionPhase === 'results' && (
                  <div className="absolute top-3 right-3 text-2xl">
                    {index === selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                    {index === selectedAnswer && index !== currentQuestion.correctAnswer && '❌'}
                    {index !== selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                  </div>
                )}
                
                {/* Visual indicator for selected answer - but no correct/incorrect feedback */}
                {selectedAnswer === index && questionPhase === 'answering' && (
                  <>
                    <div className="absolute inset-0 border-8 border-blue-400 rounded-xl pointer-events-none animate-pulse"></div>
                    <div className="absolute inset-0 bg-blue-400 bg-opacity-30 rounded-xl pointer-events-none"></div>
                    <div className="absolute top-2 right-2 bg-blue-400 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                      ✓ SELECTED
                    </div>
                    <div className="absolute -top-3 -left-3 text-4xl animate-bounce">⭐</div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Waiting Status */}
        {hasAnswered && questionPhase === 'answering' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
            <div className="animate-pulse">
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-gray-600">Waiting for other players to answer...</p>
              <p className="text-sm text-gray-500 mt-2">
                Your answer: <strong>{currentQuestion.options[selectedAnswer]}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Results will be revealed when everyone has answered!
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Game Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Score Display - Only shows Firebase score, never immediate updates */}
        <div className={`mt-6 rounded-xl p-6 text-center text-white ${
          score >= 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <h3 className="text-lg font-bold mb-2">Your Total Score</h3>
          <div className="text-3xl font-bold">{score} points</div>
          <p className="text-sm opacity-90 mt-2">
            Score updates after each question!
          </p>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 text-white rounded-xl p-4 text-xs">
          <h4 className="font-bold mb-2">🔧 Debug Info:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p><strong>Question:</strong> {currentQuestionIndex}</p>
              <p><strong>Phase:</strong> {questionPhase}</p>
              <p><strong>Has Answered:</strong> {hasAnswered ? 'Yes' : 'No'}</p>
              <p><strong>Selected:</strong> {selectedAnswer !== null ? selectedAnswer : 'None'}</p>
              <p><strong>Timer Started:</strong> {timerStarted ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Correct Answer:</strong> {currentQuestion?.correctAnswer} (type: {typeof currentQuestion?.correctAnswer})</p>
              <p><strong>Time Left:</strong> {timeLeft}s</p>
              <p><strong>Score:</strong> {score}</p>
              <p><strong>Question Options:</strong> {currentQuestion?.options?.length || 0}</p>
              <p><strong>Answer Start:</strong> {answerStartTime ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGameView;