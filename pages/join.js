// pages/join.js - FIXED GAME END STATE & SCORING
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { database } from '../utils/firebase';
import { ref, onValue, set } from 'firebase/database';
import { validateRoomCode, playQuizSound } from '../utils/quizShowHelpers';

const StudentJoinPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter code, 2: Enter name, 3: Lobby, 4: Playing, 5: Finished
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
  const [score, setScore] = useState(0);
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

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
        console.log('Game data update:', data); // Debug log
        
        if (data) {
          setGameData(data);
          
          // Handle game state changes
          if (data.status === 'playing' && step === 3) {
            setStep(4); // Move to playing
          }
          
          // Handle game finished
          if (data.status === 'finished' || data.questionPhase === 'finished') {
            calculateFinalScore(data);
            setStep(5); // Move to finished state
          }
          
          // Reset answer state when question changes
          if (data.currentQuestion !== undefined) {
            const currentQ = data.currentQuestion;
            setSelectedAnswer(null);
            setHasAnswered(false);
            setAnswerStartTime(null);
            
            // Start timer when question phase is 'answering'
            if (data.questionPhase === 'answering') {
              setAnswerStartTime(Date.now());
              const questionTimeLimit = data.quiz?.questions?.[currentQ]?.timeLimit || 20;
              setTimeLeft(questionTimeLimit);
            }
          }
        }
      });
      return () => unsubscribe();
    }
  }, [roomCode, step]);

  // Calculate final score from responses
  const calculateFinalScore = (data) => {
    if (!data?.responses || !playerId) return;
    
    let totalScore = 0;
    let correctAnswers = 0;
    let totalAnswered = 0;
    
    Object.values(data.responses).forEach(questionResponses => {
      const response = questionResponses[playerId];
      if (response && response.points !== undefined) {
        totalScore += response.points;
        totalAnswered++;
        if (response.isCorrect) {
          correctAnswers++;
        }
      }
    });
    
    setScore(totalScore);
    setFinalResults({
      totalScore,
      correctAnswers,
      totalAnswered,
      totalQuestions: data.quiz?.questions?.length || 0,
      accuracy: totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0
    });
  };

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

    const currentQuestion = gameData?.quiz?.questions?.[gameData.currentQuestion];
    if (!currentQuestion) return;

    const timeSpent = answerStartTime ? (Date.now() - answerStartTime) / 1000 : 0;
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    // Simple scoring: +10 for correct, -5 for incorrect
    const points = isCorrect ? 10 : -5;

    setSelectedAnswer(answerIndex);
    setHasAnswered(true);
    
    // Update local score immediately
    setScore(prev => prev + points);

    // Play submission sound (not result sound yet)
    playQuizSound('answerSubmit');

    // Submit to Firebase
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${gameData.currentQuestion}/${playerId}`;
      await set(ref(database, responsePath), {
        answer: answerIndex,
        timeSpent: timeSpent,
        isCorrect: isCorrect,
        points: points,
        submittedAt: Date.now()
      });
      
      console.log(`✅ Answer submitted: ${isCorrect ? 'CORRECT' : 'INCORRECT'} (${points} points)`);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const getAnswerButtonColor = (index) => {
    const colors = [
      'from-red-500 to-red-600',
      'from-blue-500 to-blue-600', 
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600'
    ];
    return colors[index] || colors[0];
  };

  const getAnswerButtonStyle = (index) => {
    const currentQuestion = gameData?.quiz?.questions?.[gameData?.currentQuestion];
    let buttonStyle = `w-full p-4 rounded-xl text-white font-bold text-left transition-all duration-200 transform`;
    
    if (gameData?.questionPhase === 'answering') {
      if (hasAnswered) {
        // Show selected answer but no correct/incorrect feedback yet
        if (index === selectedAnswer) {
          buttonStyle += ` bg-gray-600 ring-4 ring-white transform scale-105`;
        } else {
          buttonStyle += ' bg-gray-400 opacity-50';
        }
      } else {
        // Active answering phase
        buttonStyle += ` bg-gradient-to-r ${getAnswerButtonColor(index)} hover:scale-105 cursor-pointer`;
      }
    } else if (gameData?.questionPhase === 'results') {
      // Show correct/incorrect feedback
      if (index === selectedAnswer && index === currentQuestion?.correctAnswer) {
        // Selected and correct
        buttonStyle += ' bg-green-500 ring-4 ring-green-300';
      } else if (index === selectedAnswer && index !== currentQuestion?.correctAnswer) {
        // Selected but wrong
        buttonStyle += ' bg-red-500 ring-4 ring-red-300';
      } else if (index === currentQuestion?.correctAnswer) {
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

  // Step 4: Playing - Show Questions
  if (step === 4) {
    const currentQuestion = gameData?.quiz?.questions?.[gameData?.currentQuestion];
    const totalQuestions = gameData?.quiz?.questions?.length || 0;
    const questionNumber = (gameData?.currentQuestion || 0) + 1;

    // Debug info
    console.log('Current game phase:', gameData?.questionPhase);
    console.log('Current question:', currentQuestion);
    console.log('Question index:', gameData?.currentQuestion);

    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-red-500 text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading question...</h1>
            <p>Game phase: {gameData?.questionPhase}</p>
            <p>Question index: {gameData?.currentQuestion}</p>
          </div>
        </div>
      );
    }

    // Waiting for teacher to start question (showing phase)
    if (gameData?.questionPhase === 'showing') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-3xl font-bold mb-4">Get Ready!</h1>
            <p className="text-xl mb-2">Question {questionNumber} of {totalQuestions}</p>
            <p className="text-lg opacity-90">Look at the main screen...</p>
          </div>
        </div>
      );
    }

    // Show results (results phase)
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
                <p className="text-xl mb-2">+10 points! Great job! 🌟</p>
                <p className="text-lg">Your Score: {score}</p>
              </div>
            ) : (
              <div>
                <p className="text-xl mb-2">-5 points. Better luck next time!</p>
                <p className="text-lg">
                  Correct: {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
                <p className="text-lg">Your Score: {score}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Active answering phase - SHOW THE QUESTION!
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800">{playerName}</h2>
              <p className="text-sm text-gray-600">Score: {score}</p>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Question</div>
              <div className="font-bold">{questionNumber}/{totalQuestions}</div>
            </div>
            {timeLeft > 0 && !hasAnswered && (
              <div className={`text-2xl font-bold px-3 py-1 rounded ${
                timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'
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
              +10 points for correct • -5 points for incorrect
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={hasAnswered || timeLeft <= 0}
                className={getAnswerButtonStyle(index)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
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
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🏁</div>
          <h1 className="text-3xl font-bold mb-4">Game Finished!</h1>
          
          {finalResults && (
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Results</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-yellow-300">{finalResults.totalScore}</div>
                  <div className="text-sm">Final Score</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-lg font-bold">{finalResults.correctAnswers}</div>
                    <div>Correct</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{finalResults.accuracy}%</div>
                    <div>Accuracy</div>
                  </div>
                </div>
                <div className="text-xs opacity-75">
                  {finalResults.correctAnswers} of {finalResults.totalQuestions} questions correct
                </div>
              </div>
            </div>
          )}
          
          <p className="text-xl mb-4">Thanks for playing!</p>
          <p className="text-lg opacity-75">Ask your teacher about the final leaderboard!</p>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentJoinPage;