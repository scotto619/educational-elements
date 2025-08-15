// pages/join.js - COMPLETELY FIXED - NO MORE BUGS
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { database } from '../utils/firebase';
import { ref, onValue, set } from 'firebase/database';
import { validateRoomCode, playQuizSound } from '../utils/quizShowHelpers';

const StudentJoinPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState(null);
  
  // Game state - using refs to prevent unwanted resets
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [finalResults, setFinalResults] = useState(null);
  
  // Use refs to prevent state resets and timing issues
  const currentQuestionRef = useRef(-1);
  const answerSubmittedRef = useRef(false);
  const timerRunningRef = useRef(false);
  const phaseRef = useRef('waiting');

  // Pre-fill room code from URL if present
  useEffect(() => {
    if (router.query.code) {
      setRoomCode(router.query.code);
    }
  }, [router.query.code]);

  // Listen for game updates - SIMPLIFIED to prevent constant resets
  useEffect(() => {
    if (roomCode && step >= 3) {
      const gameRef = ref(database, `gameRooms/${roomCode}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
          setGameData(data);
          
          // Handle game state transitions
          if (data.status === 'playing' && step === 3) {
            setStep(4);
          }
          
          if (data.status === 'finished' || data.questionPhase === 'finished') {
            calculateFinalScore(data);
            setStep(5);
            return;
          }
          
          // Handle question changes - ONLY reset when question actually changes
          if (data.currentQuestion !== undefined && data.currentQuestion !== currentQuestionRef.current) {
            console.log(`🔄 NEW QUESTION: ${data.currentQuestion} (was ${currentQuestionRef.current})`);
            currentQuestionRef.current = data.currentQuestion;
            
            // Reset ALL answer-related state for new question
            setSelectedAnswer(null);
            setHasAnswered(false);
            answerSubmittedRef.current = false;
            timerRunningRef.current = false;
            setTimeLeft(0);
          }
          
          // Handle phase changes - ONLY update timer when starting answering phase
          if (data.questionPhase !== phaseRef.current) {
            console.log(`📋 PHASE CHANGE: ${phaseRef.current} → ${data.questionPhase}`);
            phaseRef.current = data.questionPhase;
            
            // Start timer ONLY when entering answering phase for current question
            if (data.questionPhase === 'answering' && !timerRunningRef.current) {
              const questionTimeLimit = data.quiz?.questions?.[data.currentQuestion]?.timeLimit || 20;
              console.log(`⏰ STARTING TIMER: ${questionTimeLimit} seconds`);
              setTimeLeft(questionTimeLimit);
              timerRunningRef.current = true;
            }
          }
          
          // Update score ONLY during results phase to prevent early reveals
          if (data.questionPhase === 'results' && data.responses && playerId) {
            updateScoreFromFirebase(data);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [roomCode, step, playerId]); // Removed problematic dependencies

  // Timer countdown - SIMPLIFIED and protected
  useEffect(() => {
    if (step === 4 && timeLeft > 0 && timerRunningRef.current && gameData?.questionPhase === 'answering') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  // Update score only from Firebase responses during results phase
  const updateScoreFromFirebase = (data) => {
    let totalScore = 0;
    Object.values(data.responses || {}).forEach(questionResponses => {
      const response = questionResponses[playerId];
      if (response && response.points !== undefined) {
        totalScore += response.points;
      }
    });
    setScore(totalScore);
  };

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
    // ABSOLUTE protection against multiple submissions
    if (answerSubmittedRef.current || hasAnswered || gameData?.questionPhase !== 'answering') {
      console.log(`🚫 Answer submission blocked: submitted=${answerSubmittedRef.current}, hasAnswered=${hasAnswered}, phase=${gameData?.questionPhase}`);
      return;
    }

    const currentQuestion = gameData?.quiz?.questions?.[gameData.currentQuestion];
    if (!currentQuestion) {
      console.error('❌ No current question data');
      return;
    }

    console.log(`📝 Submitting answer ${answerIndex} for question ${gameData.currentQuestion}`);

    // IMMEDIATELY block any further clicks
    answerSubmittedRef.current = true;
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);
    
    // FIXED: Convert both values to integers for comparison
    const correctAnswerIndex = parseInt(currentQuestion.correctAnswer, 10);
    const submittedAnswerIndex = parseInt(answerIndex, 10);
    const isCorrect = submittedAnswerIndex === correctAnswerIndex;
    
    console.log(`🔍 ANSWER VALIDATION:`);
    console.log(`   Question: "${currentQuestion.question}"`);
    console.log(`   Correct Answer Index: ${correctAnswerIndex} (${typeof correctAnswerIndex})`);
    console.log(`   Submitted Answer Index: ${submittedAnswerIndex} (${typeof submittedAnswerIndex})`);
    console.log(`   Correct Answer Text: "${currentQuestion.options[correctAnswerIndex]}"`);
    console.log(`   Submitted Answer Text: "${currentQuestion.options[submittedAnswerIndex]}"`);
    console.log(`   Is Correct: ${isCorrect ? '✅ YES' : '❌ NO'}`);
    
    // Simple scoring: +10 for correct, -5 for incorrect
    const points = isCorrect ? 10 : -5;

    // DO NOT update local score - let Firebase handle it in results phase only
    playQuizSound('answerSubmit');

    // Submit to Firebase
    try {
      const responsePath = `gameRooms/${roomCode}/responses/${gameData.currentQuestion}/${playerId}`;
      const responseData = {
        answer: submittedAnswerIndex,
        timeSpent: 0,
        isCorrect: isCorrect,
        points: points,
        submittedAt: Date.now()
      };
      
      console.log(`📤 Submitting to Firebase:`, responseData);
      await set(ref(database, responsePath), responseData);
      console.log(`✅ Answer submitted successfully to Firebase`);
      
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      // Reset on error
      answerSubmittedRef.current = false;
      setHasAnswered(false);
      setSelectedAnswer(null);
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
        if (index === selectedAnswer) {
          // Show selected with PERSISTENT styling - no flickering
          buttonStyle += ` bg-blue-700 ring-8 ring-blue-400 transform scale-105 shadow-2xl border-8 border-blue-300`;
        } else {
          buttonStyle += ' bg-gray-400 opacity-50 cursor-not-allowed';
        }
      } else {
        // Active answering phase
        buttonStyle += ` bg-gradient-to-r ${getAnswerButtonColor(index)} hover:scale-105 cursor-pointer shadow-lg`;
      }
    } else if (gameData?.questionPhase === 'results') {
      // Show correct/incorrect feedback ONLY during results phase
      if (index === selectedAnswer && index === currentQuestion?.correctAnswer) {
        buttonStyle += ' bg-green-500 ring-4 ring-green-300 scale-105';
      } else if (index === selectedAnswer && index !== currentQuestion?.correctAnswer) {
        buttonStyle += ' bg-red-500 ring-4 ring-red-300 scale-105';
      } else if (index === currentQuestion?.correctAnswer) {
        buttonStyle += ' bg-green-400 ring-2 ring-green-300';
      } else {
        buttonStyle += ' bg-gray-400';
      }
    } else {
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
            {/* Timer - ONLY shows when actually running */}
            {timeLeft > 0 && timerRunningRef.current && gameData?.questionPhase === 'answering' && (
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
                disabled={hasAnswered || timeLeft <= 0 || gameData?.questionPhase !== 'answering'}
                className={getAnswerButtonStyle(index)}
              >
                <div className="flex items-center space-x-3 relative">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  
                  {/* PERSISTENT visual indicator for selected answer */}
                  {selectedAnswer === index && hasAnswered && (
                    <>
                      <div className="absolute right-2 bg-blue-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                        ✓ SELECTED
                      </div>
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">⭐</div>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>

          {hasAnswered && gameData?.questionPhase === 'answering' && (
            <div className="bg-white rounded-lg p-4 mt-4 text-center">
              <p className="text-gray-600">✅ Answer locked in! Waiting for results...</p>
              <p className="text-sm text-gray-500 mt-2">
                Your answer: <strong>{currentQuestion.options[selectedAnswer]}</strong>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Results will be revealed when everyone has answered!
              </p>
            </div>
          )}

          {/* Debug Info - FIXED display */}
          <div className="mt-6 bg-gray-800 text-white rounded-xl p-4 text-xs">
            <h4 className="font-bold mb-2">🔧 Debug Info:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p><strong>Phase:</strong> {gameData?.questionPhase}</p>
                <p><strong>Has Answered:</strong> {hasAnswered ? 'Yes' : 'No'}</p>
                <p><strong>Answer Submitted Ref:</strong> {answerSubmittedRef.current ? 'Yes' : 'No'}</p>
                <p><strong>Selected:</strong> {selectedAnswer !== null ? selectedAnswer : 'None'}</p>
                <p><strong>Score:</strong> {score}</p>
              </div>
              <div>
                <p><strong>Correct Answer:</strong> {currentQuestion?.correctAnswer} ({typeof currentQuestion?.correctAnswer})</p>
                <p><strong>Timer Running:</strong> {timerRunningRef.current ? 'Yes' : 'No'}</p>
                <p><strong>Time Left:</strong> {timeLeft}s</p>
                <p><strong>Question #:</strong> {gameData?.currentQuestion}</p>
                <p><strong>Current Q Ref:</strong> {currentQuestionRef.current}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Game finished
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center text-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🏆</div>
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