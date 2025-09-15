// components/games/BattleRoyaleGame.js - PERFORMANCE FIXED VERSION
import React, { useState, useEffect, useCallback, useRef } from 'react';

const BattleRoyaleGame = ({ gameMode, showToast, students = [], onAwardXP, onAwardCoins, classData }) => {
  // Firebase setup
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  // Game states
  const [gamePhase, setGamePhase] = useState('menu');
  const [gameCode, setGameCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Game settings
  const [selectedCategory, setSelectedCategory] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');

  // Current question and game state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [players, setPlayers] = useState({});
  const [winner, setWinner] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  // PERFORMANCE FIXES: Add refs to prevent infinite loops
  const processedResponses = useRef(new Set());
  const questionTimeout = useRef(null);
  const isProcessingAnswer = useRef(false);
  const cleanupFunctions = useRef([]);

  // Teacher info
  const isTeacher = gameMode === 'teacher' && students && students.length > 0;

  // Question categories
  const CATEGORIES = {
    addition: {
      name: 'Addition',
      icon: '➕',
      difficulties: {
        easy: { range: [1, 10], name: 'Easy (1-10)' },
        medium: { range: [1, 20], name: 'Medium (1-20)' },
        hard: { range: [1, 50], name: 'Hard (1-50)' }
      }
    },
    subtraction: {
      name: 'Subtraction', 
      icon: '➖',
      difficulties: {
        easy: { range: [1, 10], name: 'Easy (1-10)' },
        medium: { range: [1, 20], name: 'Medium (1-20)' },
        hard: { range: [1, 50], name: 'Hard (1-50)' }
      }
    },
    multiplication: {
      name: 'Times Tables',
      icon: '✖️',
      difficulties: {
        easy: { range: [1, 5], name: 'Easy (1-5)' },
        medium: { range: [1, 10], name: 'Medium (1-10)' },
        hard: { range: [1, 12], name: 'Hard (1-12)' }
      }
    }
  };

  // Initialize Firebase
  useEffect(() => {
    let mounted = true;
    
    const initFirebase = async () => {
      try {
        const [
          { database }, 
          { ref, onValue, set, update, remove, off, push }
        ] = await Promise.all([
          import('../../utils/firebase'),
          import('firebase/database')
        ]);

        if (!mounted) return;
        
        const testRef = ref(database, '.info/connected');
        const connectionListener = onValue(testRef, (snapshot) => {
          if (mounted && snapshot.val()) {
            setFirebase({ database, ref, onValue, set, update, remove, off, push });
            setFirebaseReady(true);
            console.log('✅ Firebase ready for Battle Royale');
          }
        });
        
        cleanupFunctions.current.push(() => off(testRef, 'value', connectionListener));
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    };
    
    initFirebase();
    
    return () => {
      mounted = false;
      cleanupFunctions.current.forEach(cleanup => cleanup());
    };
  }, []);

  // PERFORMANCE FIX: Memoized question generator
  const generateQuestion = useCallback(() => {
    const cat = CATEGORIES[selectedCategory];
    const diff = cat.difficulties[difficulty];
    let question, correctAnswer, num1, num2;

    switch (selectedCategory) {
      case 'addition':
        num1 = Math.floor(Math.random() * diff.range[1]) + 1;
        num2 = Math.floor(Math.random() * diff.range[1]) + 1;
        question = `${num1} + ${num2}`;
        correctAnswer = num1 + num2;
        break;
      case 'subtraction':
        num1 = Math.floor(Math.random() * diff.range[1]) + diff.range[0];
        num2 = Math.floor(Math.random() * num1) + 1;
        question = `${num1} - ${num2}`;
        correctAnswer = num1 - num2;
        break;
      case 'multiplication':
        num1 = Math.floor(Math.random() * diff.range[1]) + 1;
        num2 = Math.floor(Math.random() * diff.range[1]) + 1;
        question = `${num1} × ${num2}`;
        correctAnswer = num1 * num2;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        question = `${num1} + ${num2}`;
        correctAnswer = num1 + num2;
    }

    const wrongAnswers = new Set();
    while (wrongAnswers.size < 11) {
      let wrong;
      if (selectedCategory === 'multiplication') {
        wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
      } else {
        wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
      }
      
      if (wrong > 0 && wrong !== correctAnswer) {
        wrongAnswers.add(wrong);
      }
    }

    const allAnswers = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

    return {
      id: Date.now() + Math.random(), // More unique ID
      question,
      correctAnswer,
      answers: allAnswers.slice(0, 12),
      category: selectedCategory,
      difficulty: difficulty
    };
  }, [selectedCategory, difficulty]);

  // Create game (Teacher only)
  const createGame = async () => {
    if (!firebaseReady || !firebase || !classData?.classCode) {
      showToast('Unable to create game. Check connection and class code.', 'error');
      return;
    }

    setLoading(true);
    const newGameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const gameRef = firebase.ref(firebase.database, `battle_royale/${newGameCode}`);
      
      const initialData = {
        gameCode: newGameCode,
        classCode: classData.classCode,
        host: 'teacher',
        phase: 'waiting',
        settings: {
          category: selectedCategory,
          difficulty: difficulty
        },
        players: {},
        currentQuestion: null,
        questionNumber: 0,
        responses: {},
        winner: null,
        createdAt: Date.now()
      };
      
      await firebase.set(gameRef, initialData);
      
      setGameCode(newGameCode);
      setGamePhase('waiting');
      
      // Clear any existing processed responses
      processedResponses.current.clear();
      
      showToast(`Battle Royale created! Code: ${newGameCode}`, 'success');
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game', 'error');
    }
    
    setLoading(false);
  };

  // Start the battle (Teacher only)
  const startBattle = async () => {
    if (!firebase || !gameCode) return;
    
    const playerCount = Object.keys(players).length;
    if (playerCount < 2) {
      showToast('Need at least 2 players to start!', 'error');
      return;
    }

    try {
      const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
      const firstQuestion = generateQuestion();
      
      await firebase.update(gameRef, {
        phase: 'playing',
        currentQuestion: firstQuestion,
        questionNumber: 1,
        responses: {}, // Clear responses
        startedAt: Date.now()
      });
      
      // Clear processed responses for new game
      processedResponses.current.clear();
      
      showToast('Battle started!', 'success');
    } catch (error) {
      console.error('Error starting battle:', error);
      showToast('Failed to start battle', 'error');
    }
  };

  // PERFORMANCE FIX: Debounced next question sender
  const sendNextQuestion = useCallback(async () => {
    if (!firebase || !gameCode || isProcessingAnswer.current) return;
    
    // Clear any existing timeout
    if (questionTimeout.current) {
      clearTimeout(questionTimeout.current);
      questionTimeout.current = null;
    }
    
    // Debounce to prevent rapid-fire questions
    questionTimeout.current = setTimeout(async () => {
      try {
        const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
        const nextQuestion = generateQuestion();
        
        await firebase.update(gameRef, {
          currentQuestion: nextQuestion,
          questionNumber: questionNumber + 1,
          responses: {}, // Clear previous responses
          questionSentAt: Date.now()
        });
        
        // Clear processed responses for new question
        processedResponses.current.clear();
        
        console.log('📤 Next question sent:', nextQuestion.question);
      } catch (error) {
        console.error('Error sending next question:', error);
      }
    }, 1500); // 1.5 second delay between questions
    
  }, [firebase, gameCode, questionNumber, generateQuestion]);

  // PERFORMANCE FIX: Optimized answer processing
  const processAnswer = useCallback(async (playerId, answer, responseId) => {
    if (!firebase || !gameCode || !currentQuestion || isProcessingAnswer.current) return;
    
    // Prevent duplicate processing
    if (processedResponses.current.has(responseId)) {
      console.log('⚠️ Duplicate response ignored:', responseId);
      return;
    }
    
    processedResponses.current.add(responseId);
    isProcessingAnswer.current = true;
    
    const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
    const player = players[playerId];
    
    if (!player || player.lives <= 0) {
      isProcessingAnswer.current = false;
      return;
    }
    
    try {
      const isCorrect = answer === currentQuestion.correctAnswer;
      const updatedPlayers = { ...players };
      
      if (isCorrect) {
        // Award XP for correct answer
        if (onAwardXP && player.actualStudentId) {
          onAwardXP(player.actualStudentId, 2, 'Battle Royale Correct Answer');
        }
        
        // Find random opponent to lose life
        const alivePlayers = Object.values(players).filter(p => p.id !== playerId && p.lives > 0);
        
        if (alivePlayers.length > 0) {
          const randomOpponent = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          updatedPlayers[randomOpponent.id] = {
            ...randomOpponent,
            lives: Math.max(0, randomOpponent.lives - 1)
          };
          console.log(`⚔️ ${player.name} correct! ${randomOpponent.name} loses a life`);
        }
      } else {
        // Wrong answer: player loses a life
        updatedPlayers[playerId] = {
          ...player,
          lives: Math.max(0, player.lives - 1)
        };
        console.log(`❌ ${player.name} wrong answer, loses a life`);
      }
      
      // Update Firebase with new player states
      await firebase.update(gameRef, {
        players: updatedPlayers
      });
      
      // Check for winner
      const alivePlayers = Object.values(updatedPlayers).filter(p => p.lives > 0);
      
      if (alivePlayers.length <= 1) {
        // Game over!
        const winner = alivePlayers[0] || null;
        await firebase.update(gameRef, {
          phase: 'finished',
          winner: winner?.id,
          endedAt: Date.now()
        });
        
        // Award bonus XP to winner
        if (winner && onAwardXP && winner.actualStudentId) {
          onAwardXP(winner.actualStudentId, 10, 'Battle Royale Winner');
        }
        
        console.log('🏆 Game Over! Winner:', winner?.name || 'None');
      } else if (isCorrect) {
        // Only send next question if someone got it right
        sendNextQuestion();
      }
      
    } catch (error) {
      console.error('Error processing answer:', error);
    }
    
    isProcessingAnswer.current = false;
  }, [firebase, gameCode, currentQuestion, players, onAwardXP, sendNextQuestion]);

  // PERFORMANCE FIX: Optimized game update listener
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameCode) return;

    const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
    
    const handleGameUpdate = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      setGameData(data);
      setPlayers(data.players || {});
      setQuestionNumber(data.questionNumber || 0);
      setGamePhase(data.phase);
      
      // Only update current question if it's actually different
      if (data.currentQuestion && 
          (!currentQuestion || data.currentQuestion.id !== currentQuestion.id)) {
        console.log('📝 New question received:', data.currentQuestion.question);
        setCurrentQuestion(data.currentQuestion);
        setHasAnswered(false);
        setSelectedAnswer(null);
        
        // Clear processed responses for new question
        processedResponses.current.clear();
      }
      
      if (data.winner) {
        setWinner(data.winner);
      }
    };
    
    const unsubscribe = firebase.onValue(gameRef, handleGameUpdate);
    cleanupFunctions.current.push(() => firebase.off(gameRef, 'value', unsubscribe));
    
    return () => {
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameCode, currentQuestion]);

  // PERFORMANCE FIX: Optimized response listener (Teacher only)
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameCode || !isTeacher || !currentQuestion) return;

    const responsesRef = firebase.ref(firebase.database, `battle_royale/${gameCode}/responses`);
    
    const handleResponse = (snapshot) => {
      const responses = snapshot.val();
      if (!responses) return;
      
      // Process only new responses for current question
      Object.entries(responses).forEach(([playerId, response]) => {
        if (response.questionId === currentQuestion.id) {
          const responseId = `${playerId}_${response.questionId}_${response.timestamp}`;
          
          // Only process if not already processed
          if (!processedResponses.current.has(responseId)) {
            console.log('🎯 Processing response from:', playerId, 'Answer:', response.answer);
            processAnswer(playerId, response.answer, responseId);
          }
        }
      });
    };
    
    const unsubscribe = firebase.onValue(responsesRef, handleResponse);
    cleanupFunctions.current.push(() => firebase.off(responsesRef, 'value', unsubscribe));
    
    return () => {
      firebase.off(responsesRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameCode, isTeacher, currentQuestion, processAnswer]);

  // Submit answer (Student only)
  const submitAnswer = async (answer) => {
    if (!firebase || !gameCode || !currentQuestion || hasAnswered) return;
    
    setHasAnswered(true);
    setSelectedAnswer(answer);
    
    try {
      const responsesRef = firebase.ref(firebase.database, `battle_royale/${gameCode}/responses`);
      const responseId = `${gameData?.studentId || 'anonymous'}_${currentQuestion.id}_${Date.now()}`;
      
      await firebase.update(responsesRef, {
        [gameData?.studentId || 'anonymous']: {
          answer: answer,
          questionId: currentQuestion.id,
          timestamp: Date.now()
        }
      });
      
      console.log('📤 Answer submitted:', answer);
      
      // Show immediate feedback
      const isCorrect = answer === currentQuestion.correctAnswer;
      showToast(isCorrect ? '✅ Correct!' : '❌ Wrong!', isCorrect ? 'success' : 'error');
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  // PERFORMANCE FIX: Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any timeouts
      if (questionTimeout.current) {
        clearTimeout(questionTimeout.current);
      }
      
      // Run all cleanup functions
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  // Reset game
  const resetGame = () => {
    // Clear timeouts
    if (questionTimeout.current) {
      clearTimeout(questionTimeout.current);
      questionTimeout.current = null;
    }
    
    // Clear processed responses
    processedResponses.current.clear();
    isProcessingAnswer.current = false;
    
    setGamePhase('menu');
    setGameCode('');
    setGameData(null);
    setCurrentQuestion(null);
    setPlayers({});
    setHasAnswered(false);
    setSelectedAnswer(null);
    setWinner(null);
    setQuestionNumber(0);
  };

  // Rest of the component remains the same...
  // [Include all the render methods from the original component]

  // RENDER: Menu (Teacher - Create Game)
  if (isTeacher && gamePhase === 'menu') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚔️ Battle Royale Learning
          </h2>
          <p className="text-gray-600">Create a multiplayer learning battle where students compete to be the last survivor!</p>
          
          {classData?.classCode ? (
            <div className="mt-4 inline-block bg-green-100 border border-green-300 rounded-lg px-4 py-2">
              <span className="text-green-700 font-semibold">✅ Class Code Ready: {classData.classCode}</span>
            </div>
          ) : (
            <div className="mt-4 inline-block bg-orange-100 border border-orange-300 rounded-lg px-4 py-2">
              <span className="text-orange-700 font-semibold">⚠️ No class code - generate one in Settings</span>
            </div>
          )}
        </div>

        {!firebaseReady && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-orange-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-orange-600 text-sm">Connecting to battle servers...</p>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Game Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              >
                {Object.entries(CATEGORIES[selectedCategory].difficulties).map(([key, diff]) => (
                  <option key={key} value={key}>{diff.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">⚔️ Battle Rules</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Students start with 10 lives ❤️</li>
              <li>• <strong>First correct answer = random opponent loses 1 life</strong></li>
              <li>• Wrong answer = you lose 1 life</li>
              <li>• New question appears after each answer</li>
              <li>• Last survivor wins! 🏆</li>
            </ul>
          </div>

          <button
            onClick={createGame}
            disabled={loading || !firebaseReady || !classData?.classCode}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Battle Arena...' : 
             !firebaseReady ? 'Connecting to Battle Servers...' :
             !classData?.classCode ? 'Class Code Required - Check Settings' :
             'Create Battle Arena'}
          </button>
        </div>
      </div>
    );
  }

  // [Include all other render methods from original component - waiting room, playing, finished, etc.]
  // For brevity, I'm showing just the menu. The other render methods remain exactly the same.

  // RENDER: Default fallback
  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-4xl mb-4">⚔️</div>
        <h2 className="text-2xl font-bold mb-4">Battle Royale Learning</h2>
        <p className="text-gray-600 mb-4">
          Debug Info: gameMode={gameMode}, students={students?.length || 0}, isTeacher={isTeacher}
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-600 text-sm">Loading battle system...</p>
        </div>
      </div>
    </div>
  );
};

export default BattleRoyaleGame;