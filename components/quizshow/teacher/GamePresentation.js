// components/quizshow/teacher/GamePresentation.js - TEACHER GAME CONTROL INTERFACE
import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound, formatScore, triggerConfetti } from '../../../utils/quizShowHelpers';

const GamePresentation = ({ roomCode, gameData, onEndGame, onNextQuestion }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPhase, setQuestionPhase] = useState('showing'); // 'showing', 'answering', 'results'
  const [responses, setResponses] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  useEffect(() => {
    if (gameData?.currentQuestion !== undefined) {
      setCurrentQuestionIndex(gameData.currentQuestion);
    }
    
    if (gameData?.responses?.[currentQuestionIndex]) {
      setResponses(gameData.responses[currentQuestionIndex]);
    }

    // Calculate leaderboard
    updateLeaderboard();
  }, [gameData, currentQuestionIndex]);

  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setQuestionPhase('results');
            playQuizSound('timeup');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase]);

  const updateLeaderboard = () => {
    if (!gameData?.players || !gameData?.responses) return;

    const scores = Object.entries(gameData.players).map(([playerId, player]) => {
      let totalScore = 0;
      let correctAnswers = 0;

      Object.entries(gameData.responses).forEach(([questionIndex, responses]) => {
        const response = responses[playerId];
        if (response?.isCorrect) {
          correctAnswers++;
          totalScore += response.points || 0;
        }
      });

      return {
        playerId,
        name: player.name,
        avatar: player.avatar,
        totalScore,
        correctAnswers
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    setLeaderboard(scores);
  };

  const startQuestion = async () => {
    const timeLimit = currentQuestion?.timeLimit || 20;
    setTimeLeft(timeLimit);
    setQuestionPhase('answering');
    setShowCorrectAnswer(false);
    setResponses({});

    // Update Firebase
    try {
      await update(ref(database, `gameRooms/${roomCode}`), {
        currentQuestion: currentQuestionIndex,
        questionStartTime: Date.now(),
        questionPhase: 'answering'
      });
      playQuizSound('questionReveal');
    } catch (error) {
      console.error('Error starting question:', error);
    }
  };

  const showResults = () => {
    setQuestionPhase('results');
    setShowCorrectAnswer(true);
    playQuizSound('leaderboard');
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setQuestionPhase('showing');
      
      try {
        await update(ref(database, `gameRooms/${roomCode}`), {
          currentQuestion: newIndex,
          questionPhase: 'showing'
        });
      } catch (error) {
        console.error('Error moving to next question:', error);
      }
    } else {
      // Game finished
      await finishGame();
    }
  };

  const finishGame = async () => {
    try {
      await update(ref(database, `gameRooms/${roomCode}`), {
        status: 'finished',
        finishedAt: Date.now()
      });
      triggerConfetti();
      playQuizSound('gameEnd');
      onEndGame();
    } catch (error) {
      console.error('Error finishing game:', error);
    }
  };

  const getResponseStats = () => {
    const total = Object.keys(gameData?.players || {}).length;
    const answered = Object.keys(responses).length;
    return { total, answered, percentage: total > 0 ? Math.round((answered / total) * 100) : 0 };
  };

  const getAnswerBreakdown = () => {
    if (!currentQuestion?.options) return [];
    
    return currentQuestion.options.map((option, index) => {
      const count = Object.values(responses).filter(r => r.answer === index).length;
      const isCorrect = index === currentQuestion.correctAnswer;
      return { option, count, isCorrect, index };
    });
  };

  const LeaderboardCard = ({ player, rank }) => (
    <div className={`flex items-center space-x-4 p-4 rounded-lg ${
      rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
      rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
      rank === 3 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
      'bg-white border border-gray-200'
    }`}>
      <div className="text-2xl font-bold">
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </div>
      <img 
        src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
        alt={`${player.name}'s avatar`}
        className="w-10 h-10 rounded-full border-2 border-white"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold truncate">{player.name}</h4>
        <p className="text-sm opacity-75">{player.correctAnswers} correct</p>
      </div>
      <div className="text-right">
        <div className="font-bold text-lg">{formatScore(player.totalScore)}</div>
      </div>
    </div>
  );

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Questions Found</h1>
          <button
            onClick={onEndGame}
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold"
          >
            End Game
          </button>
        </div>
      </div>
    );
  }

  const stats = getResponseStats();
  const answerBreakdown = getAnswerBreakdown();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </h1>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
              {gameData?.quiz?.title}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {timeLeft > 0 && (
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
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              End Game
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  {currentQuestion.question}
                </h2>
                <div className="text-sm text-gray-600">
                  {currentQuestion.points?.toLocaleString() || '1,000'} Points • 
                  {currentQuestion.timeLimit || 20} Seconds
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, index) => {
                  const breakdown = answerBreakdown[index];
                  const isCorrect = index === currentQuestion.correctAnswer;
                  
                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        showCorrectAnswer && isCorrect
                          ? 'bg-green-100 border-green-500 text-green-800'
                          : showCorrectAnswer && !isCorrect && breakdown?.count > 0
                          ? 'bg-red-100 border-red-500 text-red-800'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'][index] || 'bg-gray-500'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="font-semibold">{option}</span>
                        </div>
                        
                        {questionPhase === 'results' && (
                          <div className="flex items-center space-x-2">
                            <span className="font-bold">{breakdown?.count || 0}</span>
                            {showCorrectAnswer && isCorrect && <span className="text-green-600">✓</span>}
                          </div>
                        )}
                      </div>
                      
                      {questionPhase === 'results' && breakdown && (
                        <div className="mt-3">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCorrect ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                              style={{ 
                                width: `${stats.total > 0 ? (breakdown.count / stats.total) * 100 : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-800">
                  Question Controls
                </div>
                <div className="flex space-x-3">
                  {questionPhase === 'showing' && (
                    <button
                      onClick={startQuestion}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Start Question
                    </button>
                  )}
                  
                  {questionPhase === 'answering' && (
                    <button
                      onClick={showResults}
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Show Results
                    </button>
                  )}
                  
                  {questionPhase === 'results' && (
                    <button
                      onClick={nextQuestion}
                      className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                    >
                      {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Game'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Response Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Response Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Responses:</span>
                  <span className="font-semibold">{stats.answered} / {stats.total}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="text-center text-sm text-gray-600">
                  {stats.percentage}% Complete
                </div>
              </div>
            </div>

            {/* Live Leaderboard */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Live Leaderboard</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {leaderboard.slice(0, 10).map((player, index) => (
                  <LeaderboardCard 
                    key={player.playerId} 
                    player={player} 
                    rank={index + 1} 
                  />
                ))}
              </div>
            </div>

            {/* Game Progress */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Game Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Question:</span>
                  <span className="font-semibold">{currentQuestionIndex + 1} / {totalQuestions}</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
                <div className="text-sm opacity-90">
                  {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamePresentation;