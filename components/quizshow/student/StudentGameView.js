// components/quizshow/student/StudentGameView.js - FIXED SYNC & TIMING
import React, { useState, useEffect } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound } from '../../../utils/quizShowHelpers';

// SIMPLE SCORING SYSTEM - USED EVERYWHERE
const calculateSimpleScore = (isCorrect) => {
  return isCorrect ? 10 : -5; // +10 for correct, -5 for incorrect
};

const StudentGameView = ({ roomCode, gameData, playerInfo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPhase, setQuestionPhase] = useState('waiting'); // 'waiting', 'answering', 'results'
  const [score, setScore] = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState(null);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  useEffect(() => {
    if (gameData?.currentQuestion !== undefined) {
      const newQuestionIndex = gameData.currentQuestion;
      
      // Only reset if we're on a different question
      if (newQuestionIndex !== currentQuestionIndex) {
        setCurrentQuestionIndex(newQuestionIndex);
        setSelectedAnswer(null);
        setHasAnswered(false);
      }
    }

    if (gameData?.questionPhase) {
      setQuestionPhase(gameData.questionPhase);
      
      if (gameData.questionPhase === 'answering' && !answerStartTime) {
        setAnswerStartTime(Date.now());
        const timeLimit = currentQuestion?.timeLimit || 20;
        setTimeLeft(timeLimit);
      }
    }

    // Update score from Firebase responses
    updatePlayerScore();
  }, [gameData]);

  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0 && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase, hasAnswered]);

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
    if (hasAnswered || questionPhase !== 'answering') return;

    const timeSpent = answerStartTime ? (Date.now() - answerStartTime) / 1000 : 0;
    
    // Calculate if correct
    const isAnswerCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Simple scoring system
    const points = calculateSimpleScore(isAnswerCorrect);

    // Update local state immediately to prevent double-clicking
    setSelectedAnswer(answerIndex);
    setHasAnswered(true);

    // Play submission sound (not correct/incorrect yet)
    playQuizSound('answerSubmit');

    // Submit to Firebase
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${currentQuestionIndex}/${playerInfo.playerId}`;
      await set(ref(database, responsePath), {
        answer: answerIndex,
        timeSpent: timeSpent,
        isCorrect: isAnswerCorrect,
        points: points,
        submittedAt: Date.now()
      });
      
      console.log(`✅ Answer submitted: ${answerIndex} (${isAnswerCorrect ? 'correct' : 'incorrect'}) = ${points} points`);
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Reset local state if submission failed
      setSelectedAnswer(null);
      setHasAnswered(false);
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
        // Show selected answer but no correct/incorrect feedback yet
        if (index === selectedAnswer) {
          buttonStyle += ` bg-gray-600 ring-4 ring-white transform scale-105`;
        } else {
          buttonStyle += ' bg-gray-400 opacity-50';
        }
      } else {
        // Active answering phase
        buttonStyle += ` bg-gradient-to-r ${getAnswerButtonColor(index)} hover:scale-105 cursor-pointer shadow-lg`;
      }
    } else if (questionPhase === 'results') {
      // NOW show correct/incorrect feedback
      if (index === selectedAnswer && index === currentQuestion.correctAnswer) {
        // Selected and correct
        buttonStyle += ' bg-green-500 ring-4 ring-green-300 transform scale-105';
      } else if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
        // Selected but wrong
        buttonStyle += ' bg-red-500 ring-4 ring-red-300 transform scale-105';
      } else if (index === currentQuestion.correctAnswer) {
        // Correct answer (not selected by user)
        buttonStyle += ' bg-green-400 ring-2 ring-green-300';
      } else {
        // Other options
        buttonStyle += ' bg-gray-400';
      }
    } else {
      // Disabled state
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
          
          {questionPhase === 'answering' && !hasAnswered && (
            <div className={`text-3xl font-bold ${getTimeColor()}`}>
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 font-semibold">
                  ✅ Answer submitted! Waiting for results...
                </p>
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
                
                {/* Answer Status Icons - ONLY show during results phase */}
                {questionPhase === 'results' && (
                  <div className="absolute top-3 right-3 text-2xl">
                    {index === selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                    {index === selectedAnswer && index !== currentQuestion.correctAnswer && '❌'}
                    {index !== selectedAnswer && index === currentQuestion.correctAnswer && '✅'}
                  </div>
                )}
                
                {/* Selected Indicator - show during answering phase */}
                {selectedAnswer === index && questionPhase === 'answering' && (
                  <div className="absolute inset-0 border-4 border-white rounded-xl pointer-events-none opacity-50"></div>
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

        {/* Score Display */}
        <div className={`mt-6 rounded-xl p-6 text-center text-white ${
          score >= 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <h3 className="text-lg font-bold mb-2">Your Total Score</h3>
          <div className="text-3xl font-bold">{score} points</div>
          <p className="text-sm opacity-90 mt-2">
            {score >= 0 ? 'Keep it up! 🚀' : 'You can come back! 💪'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentGameView;