// pages/join.js - FIXED STUDENT JOIN PAGE WITH REAL GAME INTERFACE
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { database } from '../utils/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { validateRoomCode, calculateQuizScore, playQuizSound } from '../utils/quizShowHelpers';

const StudentJoinPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter code, 2: Enter name, 3: Lobby, 4: Playing, 5: Results
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState(null);
  
  // Game state
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState(null);

  // Pre-fill room code from URL if present
  useEffect(() => {
    if (router.query.code) {
      setRoomCode(router.query.code);
    }
  }, [router.query.code]);

  // Listen for game updates
  useEffect(() => {
    if (roomCode && step >= 3) {
      const gameRef = ref(database, `gameRooms/${roomCode}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameData(data);
          
          // Handle game state changes
          if (data.status === 'playing' && step === 3) {
            setStep(4); // Move to playing
            setCurrentQuestionIndex(data.currentQuestion || 0);
          }
          
          // Handle question changes
          if (data.currentQuestion !== currentQuestionIndex) {
            setCurrentQuestionIndex(data.currentQuestion || 0);
            setSelectedAnswer(null);
            setHasAnswered(false);
            setAnswerStartTime(null);
          }
          
          // Handle question phase changes
          if (data.questionPhase === 'answering' && !answerStartTime) {
            setAnswerStartTime(Date.now());
            setTimeLeft(data.quiz?.questions?.[data.currentQuestion]?.timeLimit || 20);
          }
          
          if (data.status === 'finished') {
            setStep(5);
          }
        } else if (step > 1) {
          setError('Game has ended');
          setTimeout(() => {
            setStep(1);
            setRoomCode('');
            setError('');
          }, 3000);
        }
      });
      return () => unsubscribe();
    }
  }, [roomCode, step, currentQuestionIndex, answerStartTime]);

  // Countdown timer
  useEffect(() => {
    if (step === 4 && timeLeft > 0 && !hasAnswered && gameData?.questionPhase === 'answering') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step, hasAnswered, gameData?.questionPhase]);

  const handleRoomCodeSubmit = async (e) => {
    e.preventDefault();
    if (!validateRoomCode(roomCode)) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gameRef = ref(database, `gameRooms/${roomCode}`);
      const snapshot = await new Promise((resolve) => {
        onValue(gameRef, resolve, { onlyOnce: true });
      });

      if (!snapshot.exists()) {
        throw new Error('Game not found. Check your room code.');
      }

      const data = snapshot.val();
      if (data.status === 'finished') {
        throw new Error('This game has already finished.');
      }

      setGameData(data);
      setStep(2);
      playQuizSound('join');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const playerData = {
        name: playerName.trim(),
        studentId: null,
        avatar: {
          base: 'Wizard F',
          level: 1,
          image: '/avatars/Wizard F/Level 1.png'
        },
        score: 0,
        joinedAt: Date.now(),
        isReady: true
      };

      await set(ref(database, `gameRooms/${roomCode}/players/${newPlayerId}`), playerData);
      setPlayerId(newPlayerId);
      setStep(3);
      playQuizSound('join');
    } catch (error) {
      setError('Failed to join game. Please try again.');
    }
    setLoading(false);
  };

  const submitAnswer = async (answerIndex) => {
    if (hasAnswered || gameData?.questionPhase !== 'answering') return;

    const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
    if (!currentQuestion) return;

    const timeSpent = answerStartTime ? (Date.now() - answerStartTime) / 1000 : 0;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const points = calculateQuizScore(
      timeSpent, 
      currentQuestion.timeLimit || 20, 
      currentQuestion.points || 1000, 
      isCorrect
    );

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    setScore(prev => prev + points);

    // Play sound
    playQuizSound(isCorrect ? 'correct' : 'incorrect');

    // Submit to Firebase
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${currentQuestionIndex}/${playerId}`;
      await set(ref(database, responsePath), {
        answer: answerIndex,
        timeSpent: timeSpent,
        isCorrect: isCorrect,
        points: points,
        submittedAt: Date.now()
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const getAnswerButtonColor = (index) => {
    const colors = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600', 
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600'
    ];
    return colors[index] || colors[0];
  };

  // Step 1: Enter Room Code
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎪</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Quiz Show!</h1>
            <p className="text-gray-600">Enter the room code from your teacher</p>
          </div>

          <form onSubmit={handleRoomCodeSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-4 text-2xl text-center font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={roomCode.length !== 6 || loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Finding Game...' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Enter Name
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">What's your name?</h1>
            <p className="text-gray-600">Room: <span className="font-bold">{roomCode}</span></p>
          </div>

          <div className="space-y-6">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              maxLength={20}
              autoFocus
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Joining...' : 'Join Game!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Lobby - Waiting for game to start
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">You're In!</h2>
            <p className="text-gray-600 mb-6">
              Waiting for your teacher to start the game...
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Game Info</h3>
              <p className="text-blue-700">{gameData?.quiz?.title}</p>
              <p className="text-blue-600 text-sm">{gameData?.quiz?.questions?.length} questions</p>
            </div>

            {/* Show other players */}
            {gameData?.players && (
              <div className="text-left">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Players ({Object.keys(gameData.players).length}):
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Object.values(gameData.players).map((player, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className={player.name === playerName ? 'font-bold text-purple-600' : ''}>
                        {player.name} {player.name === playerName ? '(You)' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Playing - Answer Questions
  if (step === 4) {
    const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
    const totalQuestions = gameData?.quiz?.questions?.length || 0;

    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-red-500 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">No question data</h1>
          </div>
        </div>
      );
    }

    // Waiting for question to start
    if (gameData?.questionPhase === 'showing') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold mb-4">Get Ready!</h1>
            <p className="text-xl mb-2">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <p className="text-lg opacity-90">Look at the main screen...</p>
          </div>
        </div>
      );
    }

    // Question results phase
    if (gameData?.questionPhase === 'results') {
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      return (
        <div className={`min-h-screen flex items-center justify-center text-white ${
          isCorrect ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <div className="text-center p-6">
            <div className="text-6xl mb-4">{isCorrect ? '🎉' : '😔'}</div>
            <h1 className="text-3xl font-bold mb-4">
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </h1>
            {isCorrect ? (
              <div>
                <p className="text-xl mb-2">Great job! 🌟</p>
                <p className="text-lg">Your Score: {score.toLocaleString()}</p>
              </div>
            ) : (
              <div>
                <p className="text-xl mb-2">Better luck next time!</p>
                <p className="text-lg">
                  Correct: {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Active question - answering phase
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">{playerName}</h2>
              <p className="text-sm text-gray-600">Score: {score.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Question</div>
              <div className="font-bold">{currentQuestionIndex + 1}/{totalQuestions}</div>
            </div>
            {timeLeft > 0 && !hasAnswered && (
              <div className={`text-2xl font-bold px-3 py-1 rounded ${
                timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {timeLeft}s
              </div>
            )}
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h1 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {currentQuestion.question}
            </h1>
            <div className="text-center text-sm text-gray-600">
              {currentQuestion.points || 1000} Points
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              let buttonClass = `w-full p-4 rounded-xl text-white font-bold text-left transition-all duration-200 transform`;
              
              if (hasAnswered || timeLeft <= 0) {
                if (index === selectedAnswer) {
                  buttonClass += index === currentQuestion.correctAnswer 
                    ? ' bg-green-500 ring-4 ring-green-300' 
                    : ' bg-red-500 ring-4 ring-red-300';
                } else if (index === currentQuestion.correctAnswer) {
                  buttonClass += ' bg-green-500 ring-4 ring-green-300';
                } else {
                  buttonClass += ' bg-gray-400';
                }
              } else {
                buttonClass += ` bg-gradient-to-r ${getAnswerButtonColor(index)} hover:scale-105 hover:shadow-lg cursor-pointer`;
              }

              return (
                <button
                  key={index}
                  onClick={() => submitAnswer(index)}
                  disabled={hasAnswered || timeLeft <= 0}
                  className={buttonClass}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {hasAnswered && (
            <div className="bg-white rounded-lg p-4 mt-4 text-center">
              <p className="text-gray-600">✅ Answer submitted! Waiting for results...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 5: Game finished
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">🏁</div>
        <h1 className="text-3xl font-bold mb-4">Game Finished!</h1>
        <p className="text-xl mb-4">Final Score: {score.toLocaleString()}</p>
        <p className="text-lg">Thanks for playing!</p>
      </div>
    </div>
  );
};

export default StudentJoinPage;