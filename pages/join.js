// pages/join.js - WITH STUDENT AVATAR SELECTION
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { database, firestore } from '../utils/firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
  
  // New states for student selection
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
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

  // Helper functions for avatar and level calculation
  const getAvatarImage = (avatarBase, level) => {
    // Shop avatar mappings (Basic + Premium)
    const SHOP_AVATARS = {
      // Basic Avatars
      'banana': '/shop/Basic/Banana.png',
      'basketball': '/shop/Basic/Basketball.png',
      'basketballgirl': '/shop/Basic/BasketballGirl.png',
      'farmerboy': '/shop/Basic/FarmerBoy.png',
      'farmergirl': '/shop/Basic/FarmerGirl.png',
      'goblin1': '/shop/Basic/Goblin1.png',
      'goblingirl1': '/shop/Basic/GoblinGirl1.png',
      'guard1': '/shop/Basic/Guard1.png',
      'guardgirl1': '/shop/Basic/GuardGirl1.png',
      'pirateboy': '/shop/Basic/PirateBoy.png',
      'pirategirl': '/shop/Basic/PirateGirl.png',
      'roboknight': '/shop/Basic/RoboKnight.png',
      'robotboy': '/shop/Basic/RobotBoy.png',
      'robotgirl': '/shop/Basic/RobotGirl.png',
      'soccerboy': '/shop/Basic/SoccerBoy.png',
      'soccerboy2': '/shop/Basic/SoccerBoy2.png',
      'soccergirl': '/shop/Basic/SoccerGirl.png',
      'streetboy1': '/shop/Basic/Streetboy1.png',
      'streetgirl1': '/shop/Basic/Streetgirl1.png',
      'vampire1': '/shop/Basic/Vampire1.png',
      // Premium Avatars
      'dwarf': '/shop/Premium/Dwarf.png',
      'dwarf2': '/shop/Premium/Dwarf2.png',
      'farmerboy premium': '/shop/Premium/FarmerBoy.png',
      'farmergirl premium': '/shop/Premium/FarmerGirl.png',
      'goblin2': '/shop/Premium/Goblin2.png',
      'goblingirl2': '/shop/Premium/GoblinGirl2.png',
      'king': '/shop/Premium/King.png',
      'mechanicgirl': '/shop/Premium/MechanicGirl.png',
      'pirateboy premium': '/shop/Premium/PirateBoy.png',
      'pirategirl premium': '/shop/Premium/PirateGirl.png',
      'queen': '/shop/Premium/Queen.png',
      'robotboy premium': '/shop/Premium/RobotBoy.png',
      'robotgirl premium': '/shop/Premium/RobotGirl.png',
      'vampire2': '/shop/Premium/Vampire2.png',
      'vampiregirl2': '/shop/Premium/VampireGirl2.png'
    };

    // Check if it's a shop avatar first
    const shopPath = SHOP_AVATARS[avatarBase?.toLowerCase()];
    if (shopPath) {
      return shopPath;
    }

    // Fall back to standard level-based avatars
    return `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;
  };

  const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);

  // Load students from the class when game room is found
  const loadClassStudents = async (gameRoomData) => {
    if (!gameRoomData?.hostId) return;

    setLoadingStudents(true);
    try {
      // Find the teacher's document and get their active class students.
      // We read by document id rather than running a where() query so the
      // call works under stricter Firestore rules where unauthenticated
      // clients can't list the `users` collection.
      const teacherDoc = await getDoc(doc(firestore, 'users', gameRoomData.hostId));

      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();

        // V2 architecture: classes live in their own top-level collection,
        // students live in `students`, and class membership is tracked in
        // `class_memberships`. Try this first because new accounts default
        // to V2 (and older accounts that have migrated use it too).
        const activeClassId = teacherData.activeClassId
          || (Array.isArray(teacherData.classes) && teacherData.classes[0]?.id);

        const isV2 = teacherData.version === '2.0' || teacherData.migratedAt;
        let v2StudentsLoaded = false;

        if (isV2 && activeClassId) {
          try {
            const membershipDoc = await getDoc(doc(firestore, 'class_memberships', activeClassId));
            if (membershipDoc.exists()) {
              const studentIds = membershipDoc.data().students || [];
              if (studentIds.length > 0) {
                const studentDocs = await Promise.all(
                  studentIds.map(id => getDoc(doc(firestore, 'students', id)).catch(() => null))
                );
                const v2Students = studentDocs
                  .filter(d => d && d.exists())
                  .map(d => ({ id: d.id, ...d.data() }));
                if (v2Students.length > 0) {
                  setAvailableStudents(v2Students);
                  v2StudentsLoaded = true;
                }
              }
            }
          } catch (v2Err) {
            console.warn('⚠️ V2 student lookup failed, falling back to V1:', v2Err?.message || v2Err);
          }
        }

        // V1 fallback: students embedded directly inside the user document.
        if (!v2StudentsLoaded && Array.isArray(teacherData.classes) && activeClassId) {
          const activeClass = teacherData.classes.find(cls => cls && cls.id === activeClassId);
          if (activeClass && Array.isArray(activeClass.students)) {
            setAvailableStudents(activeClass.students);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading class students:', error);
      // Continue without student data - allow manual name entry
    }
    setLoadingStudents(false);
  };

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
            phaseRef.current = data.questionPhase;
            
            // Start timer ONLY when entering answering phase for current question
            if (data.questionPhase === 'answering' && !timerRunningRef.current) {
              const questionTimeLimit =
                data.quiz?.questions?.[data.currentQuestion]?.timeLimit ||
                data.settings?.timePerQuestion ||
                20;
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
  }, [roomCode, step, playerId]);

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
      const snapshot = await get(gameRef);

      if (!snapshot.exists()) {
        throw new Error('Game not found. Check your room code.');
      }

      const data = snapshot.val();
      if (data.status === 'finished') {
        throw new Error('This game has already finished.');
      }

      setGameData(data);
      
      // Load class students for avatar selection
      await loadClassStudents(data);
      
      setStep(2);
      playQuizSound('join');
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!selectedStudent && !playerName.trim()) {
      setError('Please select a student or enter your name');
      return;
    }

    if (!roomCode || !/^\d{6}$/.test(roomCode)) {
      setError('Invalid room code. Please go back and try again.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Re-verify the room still exists before trying to write to it.
      // If the teacher closed the room between step 1 and now, an
      // outright .set() would still succeed and create a dangling record,
      // so we read first and abort cleanly if the game is gone.
      const roomSnapshot = await get(ref(database, `gameRooms/${roomCode}`));
      if (!roomSnapshot.exists()) {
        setError('This game has ended or no longer exists. Ask your teacher for a new code.');
        setLoading(false);
        return;
      }

      const newPlayerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Build playerData defensively. Firebase Realtime Database rejects
      // any value of `undefined`, so every field below must resolve to a
      // concrete primitive even if the underlying student record is
      // missing data.
      let playerData;
      if (selectedStudent) {
        const level = calculateAvatarLevel(selectedStudent.totalPoints || 0);
        const baseAvatar = selectedStudent.avatarBase || 'Wizard F';
        const firstName = (selectedStudent.firstName || '').toString();
        const lastName = (selectedStudent.lastName || '').toString();
        const fullName = `${firstName} ${lastName}`.trim() || 'Player';
        playerData = {
          name: fullName,
          studentId: selectedStudent.id || '',
          avatar: {
            base: baseAvatar,
            level: level,
            image: getAvatarImage(baseAvatar, level)
          },
          score: 0,
          joinedAt: Date.now(),
          isReady: true
        };
      } else {
        playerData = {
          name: playerName.trim(),
          studentId: '',
          avatar: {
            base: 'Wizard F',
            level: 1,
            image: getAvatarImage('Wizard F', 1)
          },
          score: 0,
          joinedAt: Date.now(),
          isReady: true
        };
      }

      await set(ref(database, `gameRooms/${roomCode}/players/${newPlayerId}`), playerData);
      setPlayerId(newPlayerId);
      setStep(3);
      playQuizSound('join');
    } catch (error) {
      // Surface the real reason in the console so it can be diagnosed in
      // dev tools (permission denied, network error, etc.) instead of
      // silently swallowing it.
      console.error('❌ Error joining game:', error);
      const message = error?.code === 'PERMISSION_DENIED'
        ? 'Permission denied joining this game. Please refresh and try again.'
        : `Failed to join game: ${error?.message || 'Please try again.'}`;
      setError(message);
    }
    setLoading(false);
  };

  const submitAnswer = async (answerIndex) => {
    // ABSOLUTE protection against multiple submissions
    if (answerSubmittedRef.current || hasAnswered || gameData?.questionPhase !== 'answering') {
      return;
    }

    const currentQuestion = gameData?.quiz?.questions?.[gameData.currentQuestion];
    if (!currentQuestion) {
      console.error('❌ No current question data');
      return;
    }


    // IMMEDIATELY block any further clicks
    answerSubmittedRef.current = true;
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);
    
    // FIXED: Convert both values to integers for comparison
    const correctAnswerIndex = parseInt(currentQuestion.correctAnswer, 10);
    const submittedAnswerIndex = parseInt(answerIndex, 10);
    const isCorrect = submittedAnswerIndex === correctAnswerIndex;
    
    
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
      
      await set(ref(database, responsePath), responseData);
      
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

  // Step 2: Select Student or Enter Name
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Who are you?</h1>
            <p className="text-gray-600">Room: <span className="font-bold">{roomCode}</span></p>
          </div>

          {loadingStudents ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Loading class students...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {availableStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Select your profile:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                    {availableStudents.map((student) => {
                      const level = calculateAvatarLevel(student.totalPoints || 0);
                      return (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            selectedStudent?.id === student.id
                              ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          <img
                            src={getAvatarImage(student.avatarBase || 'Wizard F', level)}
                            alt={student.firstName}
                            className="w-12 h-12 mx-auto rounded-full mb-2 border-2 border-gray-300"
                          />
                          <div className="text-sm font-semibold text-gray-800">
                            {student.firstName}
                          </div>
                          <div className="text-xs text-gray-500">
                            Level {level}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="text-center my-4">
                    <span className="text-gray-500 text-sm">or</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  {availableStudents.length > 0 ? 'Enter a different name:' : 'Enter your name:'}
                </h3>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    setPlayerName(e.target.value);
                    if (e.target.value.trim()) {
                      setSelectedStudent(null);
                    }
                  }}
                  placeholder="Enter your name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  maxLength={20}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <button
                onClick={handleJoinGame}
                disabled={(!selectedStudent && !playerName.trim()) || loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Joining...' : 'Join Game!'}
              </button>
            </div>
          )}
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
                      <img 
                        src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                        alt={player.name}
                        className="w-6 h-6 rounded-full border border-gray-300"
                      />
                      <span className={player.name === (selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName || ''}`.trim() : playerName) ? 'font-bold text-purple-600' : ''}>
                        {player.name} {player.name === (selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName || ''}`.trim() : playerName) ? '(You)' : ''}
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

  // Step 4: Playing - Show Questions (same as before)
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
            <div className="flex items-center space-x-3">
              <img 
                src={(selectedStudent ? getAvatarImage(selectedStudent.avatarBase || 'Wizard F', calculateAvatarLevel(selectedStudent.totalPoints || 0)) : '/avatars/Wizard F/Level 1.png')}
                alt="Your avatar"
                className="w-10 h-10 rounded-full border-2 border-purple-300"
              />
              <div>
                <h2 className="font-bold text-gray-800">
                  {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName || ''}`.trim() : playerName}
                </h2>
                <p className="text-sm text-gray-600">Score: {score}</p>
              </div>
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