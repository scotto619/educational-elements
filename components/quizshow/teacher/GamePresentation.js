// components/quizshow/teacher/GamePresentation.js - FIXED VERSION WITH FIREBASE SYNC
import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound } from '../../../utils/quizShowHelpers';

const GamePresentation = ({ roomCode, gameData, onEndGame }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionPhase, setQuestionPhase] = useState('showing'); // 'showing', 'answering', 'results'
  const [isUpdating, setIsUpdating] = useState(false);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  // Sync with Firebase data
  useEffect(() => {
    if (gameData) {
      setCurrentQuestionIndex(gameData.currentQuestion || 0);
      setQuestionPhase(gameData.questionPhase || 'showing');
    }
  }, [gameData]);

  // Timer logic
  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-show results when time runs out
            showResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase]);

  // Update Firebase with new game state
  const updateGameState = async (updates) => {
    if (!roomCode || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await update(ref(database, `gameRooms/${roomCode}`), updates);
      console.log('✅ Game state updated:', updates);
    } catch (error) {
      console.error('❌ Error updating game state:', error);
    }
    setIsUpdating(false);
  };

  const startQuestion = async () => {
    const questionTimeLimit = currentQuestion?.timeLimit || 20;
    setTimeLeft(questionTimeLimit);
    
    const updates = {
      questionPhase: 'answering',
      currentQuestion: currentQuestionIndex
    };
    
    await updateGameState(updates);
    playQuizSound('questionReveal');
  };

  const showResults = async () => {
    const updates = {
      questionPhase: 'results'
    };
    
    await updateGameState(updates);
    playQuizSound('correct');
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const updates = {
        currentQuestion: nextIndex,
        questionPhase: 'showing'
      };
      
      await updateGameState(updates);
    } else {
      // Game finished
      const updates = {
        status: 'finished',
        questionPhase: 'finished'
      };
      
      await updateGameState(updates);
      onEndGame();
    }
  };

  const getPlayerCount = () => {
    return gameData?.players ? Object.keys(gameData.players).length : 0;
  };

  const getResponseCount = () => {
    const responses = gameData?.responses?.[currentQuestionIndex];
    return responses ? Object.keys(responses).length : 0;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-500 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Questions Found</h1>
          <p className="text-xl mb-6">Unable to load question data</p>
          <button 
            onClick={onEndGame} 
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
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
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h1>
            <div className="text-sm text-gray-600">
              Phase: <span className="font-semibold capitalize text-purple-600">{questionPhase}</span>
            </div>
            <div className="text-sm text-gray-600">
              Players: <span className="font-semibold text-blue-600">{getPlayerCount()}</span>
            </div>
            {questionPhase === 'answering' && (
              <div className="text-sm text-gray-600">
                Responses: <span className="font-semibold text-green-600">{getResponseCount()}/{getPlayerCount()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {timeLeft > 0 && questionPhase === 'answering' && (
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 
                timeLeft <= 10 ? 'bg-yellow-500 text-white' : 
                'bg-green-500 text-white'
              }`}>
                {timeLeft}s
              </div>
            )}
            <button 
              onClick={onEndGame} 
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              End Game
            </button>
          </div>
        </div>
      </div>

      {/* Question Display */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-600 mb-2">
              {currentQuestion.points?.toLocaleString() || '1,000'} Points
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>
            
            {questionPhase === 'showing' && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-semibold">
                  📱 Students are waiting - click "Start Question" when ready!
                </p>
              </div>
            )}
            
            {questionPhase === 'answering' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800 font-semibold">
                  ⏰ Students are answering - {getResponseCount()} of {getPlayerCount()} have responded
                </p>
              </div>
            )}
            
            {questionPhase === 'results' && (
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-4">
                <p className="text-purple-800 font-semibold">
                  📊 Showing results - click "Next Question" to continue
                </p>
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options?.map((option, index) => {
              let buttonStyle = `p-6 rounded-xl border-2 transition-all duration-300`;
              
              if (questionPhase === 'results') {
                if (index === currentQuestion.correctAnswer) {
                  buttonStyle += ' bg-green-100 border-green-500 text-green-800';
                } else {
                  buttonStyle += ' bg-gray-100 border-gray-300 text-gray-600';
                }
              } else {
                buttonStyle += ' bg-gray-50 border-gray-300 hover:border-purple-400 hover:bg-purple-50';
              }

              return (
                <div key={index} className={buttonStyle}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      questionPhase === 'results' && index === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-500 text-white'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-semibold text-lg">{option}</span>
                  </div>
                  
                  {questionPhase === 'results' && index === currentQuestion.correctAnswer && (
                    <div className="mt-2 flex items-center text-green-600">
                      <span className="text-xl mr-2">✓</span>
                      <span className="font-semibold">Correct Answer</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center space-x-4">
            {questionPhase === 'showing' && (
              <button
                onClick={startQuestion}
                disabled={isUpdating}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Start Question</span>
                  </>
                )}
              </button>
            )}
            
            {questionPhase === 'answering' && (
              <div className="flex space-x-4">
                <button
                  onClick={showResults}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>📊</span>
                      <span>Show Results</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>Waiting for responses...</span>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            
            {questionPhase === 'results' && (
              <button
                onClick={nextQuestion}
                disabled={isUpdating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{currentQuestionIndex < totalQuestions - 1 ? '➡️' : '🏁'}</span>
                    <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Game'}</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          <div className="mt-4 text-center text-gray-600">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <span>Room Code: <strong className="text-purple-600">{roomCode}</strong></span>
              <span>•</span>
              <span>Phase: <strong className="capitalize text-blue-600">{questionPhase}</strong></span>
              <span>•</span>
              <span>Players: <strong className="text-green-600">{getPlayerCount()}</strong></span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
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

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 bg-gray-800 text-white rounded-xl p-4 text-sm">
            <h3 className="font-bold mb-2">🔧 Debug Info:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Current Question:</strong> {currentQuestionIndex}</p>
                <p><strong>Question Phase:</strong> {questionPhase}</p>
                <p><strong>Time Left:</strong> {timeLeft}s</p>
              </div>
              <div>
                <p><strong>Players:</strong> {getPlayerCount()}</p>
                <p><strong>Responses:</strong> {getResponseCount()}</p>
                <p><strong>Updating:</strong> {isUpdating ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePresentation;