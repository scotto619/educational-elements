// components/quizshow/teacher/GamePresentation.js - SIMPLIFIED VERSION FOR IMMEDIATE FIX
import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const GamePresentation = ({ roomCode, gameData, onEndGame }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionPhase, setQuestionPhase] = useState('showing'); // 'showing', 'answering', 'results'

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQuestionPhase('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase]);

  const startQuestion = async () => {
    setTimeLeft(currentQuestion?.timeLimit || 20);
    setQuestionPhase('answering');
    playQuizSound('questionReveal');
  };

  const showResults = () => {
    setQuestionPhase('results');
    playQuizSound('correct');
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionPhase('showing');
    } else {
      // Game finished
      onEndGame();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Questions Found</h1>
          <button onClick={onEndGame} className="bg-white text-red-600 px-6 py-3 rounded-lg">
            End Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </h1>
          <div className="flex items-center space-x-4">
            {timeLeft > 0 && questionPhase === 'answering' && (
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {timeLeft}s
              </div>
            )}
            <button onClick={onEndGame} className="bg-red-500 text-white px-4 py-2 rounded-lg">
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Question Display */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </h2>
            <div className="text-gray-600">
              {currentQuestion.points || 1000} Points • {currentQuestion.timeLimit || 20} Seconds
            </div>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border-2 ${
                  questionPhase === 'results' && index === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-semibold">{option}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 text-center">
          <div className="flex justify-center space-x-4">
            {questionPhase === 'showing' && (
              <button
                onClick={startQuestion}
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg"
              >
                🚀 Start Question
              </button>
            )}
            
            {questionPhase === 'answering' && (
              <button
                onClick={showResults}
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-bold text-lg"
              >
                📊 Show Results
              </button>
            )}
            
            {questionPhase === 'results' && (
              <button
                onClick={nextQuestion}
                className="bg-purple-500 text-white px-8 py-3 rounded-lg font-bold text-lg"
              >
                {currentQuestionIndex < totalQuestions - 1 ? '➡️ Next Question' : '🏁 Finish Game'}
              </button>
            )}
          </div>
          
          <div className="mt-4 text-gray-600">
            Phase: <span className="font-semibold capitalize">{questionPhase}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePresentation;