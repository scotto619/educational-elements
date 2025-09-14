// components/games/BattleRoyaleGame.js - COMPLETE REWRITE - SIMPLIFIED AND WORKING
import React, { useState, useEffect, useCallback } from 'react';

const BattleRoyaleGame = ({ gameMode, showToast, students = [], onAwardXP, onAwardCoins, classData }) => {
  // Firebase setup
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  // Game states
  const [gamePhase, setGamePhase] = useState('menu'); // 'menu', 'waiting', 'playing', 'finished'
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

  // Teacher info (for creating games)
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
        
        return () => off(testRef, 'value', connectionListener);
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
      }
    };
    
    initFirebase();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Generate a question based on category and difficulty
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

    // Generate wrong answers
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 11) {
      let wrong;
      if (selectedCategory === 'multiplication') {
        // For multiplication, generate answers close to correct
        wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
      } else {
        // For addition/subtraction, generate random nearby answers
        wrong = correctAnswer + Math.floor(Math.random() * 10) - 5;
      }
      
      if (wrong > 0 && wrong !== correctAnswer) {
        wrongAnswers.add(wrong);
      }
    }

    // Create answer options (correct + 11 wrong, shuffled)
    const allAnswers = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

    return {
      id: Date.now(),
      question,
      correctAnswer,
      answers: allAnswers.slice(0, 12), // Show 12 answer options
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
        responses: {},
        startedAt: Date.now()
      });
      
      showToast('Battle started!', 'success');
    } catch (error) {
      console.error('Error starting battle:', error);
      showToast('Failed to start battle', 'error');
    }
  };

  // Send next question (Teacher only)
  const sendNextQuestion = async () => {
    if (!firebase || !gameCode) return;
    
    try {
      const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
      const nextQuestion = generateQuestion();
      
      await firebase.update(gameRef, {
        currentQuestion: nextQuestion,
        questionNumber: questionNumber + 1,
        responses: {}, // Clear previous responses
        questionSentAt: Date.now()
      });
      
      console.log('📤 Next question sent:', nextQuestion.question, '=', nextQuestion.correctAnswer);
    } catch (error) {
      console.error('Error sending next question:', error);
    }
  };

  // Process student answer and update game state (Teacher only)
  const processAnswer = async (playerId, answer) => {
    if (!firebase || !gameCode || !currentQuestion) return;
    
    const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
    const player = players[playerId];
    
    if (!player || player.lives <= 0) return;
    
    try {
      const isCorrect = answer === currentQuestion.correctAnswer;
      const updatedPlayers = { ...players };
      
      if (isCorrect) {
        // Correct answer: find a random opponent to lose a life
        const alivePlayers = Object.values(players).filter(p => p.id !== playerId && p.lives > 0);
        
        if (alivePlayers.length > 0) {
          const randomOpponent = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
          updatedPlayers[randomOpponent.id] = {
            ...randomOpponent,
            lives: Math.max(0, randomOpponent.lives - 1)
          };
          console.log(`⚔️ ${player.name} correct! ${randomOpponent.name} loses a life`);
        }
        
        // Award XP to correct student
        if (onAwardXP && player.actualStudentId) {
          onAwardXP(player.actualStudentId, 2, 'Battle Royale Correct Answer');
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
      } else {
        // Send next question after a short delay
        setTimeout(() => {
          sendNextQuestion();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error processing answer:', error);
    }
  };

  // Listen for game updates
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameCode) return;

    const gameRef = firebase.ref(firebase.database, `battle_royale/${gameCode}`);
    
    const handleGameUpdate = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      
      setGameData(data);
      setPlayers(data.players || {});
      setCurrentQuestion(data.currentQuestion);
      setQuestionNumber(data.questionNumber || 0);
      setGamePhase(data.phase);
      
      if (data.winner) {
        setWinner(data.winner);
      }
      
      // Reset answer state when new question arrives
      if (data.currentQuestion && (!currentQuestion || data.currentQuestion.id !== currentQuestion.id)) {
        setHasAnswered(false);
        setSelectedAnswer(null);
      }
    };
    
    const unsubscribe = firebase.onValue(gameRef, handleGameUpdate);
    
    return () => {
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameCode, currentQuestion]);

  // Listen for responses (Teacher only)
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameCode || !isTeacher) return;

    const responsesRef = firebase.ref(firebase.database, `battle_royale/${gameCode}/responses`);
    
    const handleResponse = (snapshot) => {
      const responses = snapshot.val();
      if (!responses) return;
      
      // Process the first response received for each question
      Object.entries(responses).forEach(([playerId, response]) => {
        if (currentQuestion && response.questionId === currentQuestion.id) {
          processAnswer(playerId, response.answer);
        }
      });
    };
    
    const unsubscribe = firebase.onValue(responsesRef, handleResponse);
    
    return () => {
      firebase.off(responsesRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameCode, isTeacher, currentQuestion, players]);

  // Submit answer (Student only)
  const submitAnswer = async (answer) => {
    if (!firebase || !gameCode || !currentQuestion || hasAnswered) return;
    
    setHasAnswered(true);
    setSelectedAnswer(answer);
    
    try {
      const responsesRef = firebase.ref(firebase.database, `battle_royale/${gameCode}/responses`);
      
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

  // Reset game
  const resetGame = () => {
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

  // RENDER: Menu (Teacher - Create Game)
  if (gamePhase === 'menu' && isTeacher) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚔️ Battle Royale Learning
          </h2>
          <p className="text-gray-600">Create a multiplayer learning battle where students compete to be the last survivor!</p>
        </div>

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
              <li>• New question appears immediately after each answer</li>
              <li>• Last survivor wins! 🏆</li>
            </ul>
          </div>

          <button
            onClick={createGame}
            disabled={loading || !firebaseReady}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Battle Arena'}
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Waiting Room (Teacher)
  if (gamePhase === 'waiting' && isTeacher) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚔️ Battle Arena Created!</h2>
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 inline-block">
            <div className="text-sm text-red-700 mb-1">Game Code</div>
            <div className="text-3xl font-bold text-red-800 tracking-wider">{gameCode}</div>
          </div>
          <p className="text-gray-600 mt-4">Students join at: <strong>student portal</strong></p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Warriors Joined ({Object.keys(players).length})</h3>
            <div className="text-sm text-gray-600">
              {CATEGORIES[selectedCategory].icon} {CATEGORIES[selectedCategory].name} - {CATEGORIES[selectedCategory].difficulties[difficulty].name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.values(players).map(player => (
              <div key={player.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="font-semibold text-red-800">{player.name}</div>
                <div className="text-sm text-red-600">❤️ {player.lives || 10} lives</div>
                <div className="text-xs text-gray-500">Ready for battle</div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={startBattle}
              disabled={Object.keys(players).length < 2}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
            >
              START BATTLE ({Object.keys(players).length} players)
            </button>
            <button
              onClick={resetGame}
              className="px-6 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Game Playing (Teacher View)
  if (gamePhase === 'playing' && isTeacher) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Battle Royale</h2>
              <div className="text-red-200">Question #{questionNumber} • {Object.values(players).filter(p => p.lives > 0).length} survivors</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">Code: {gameCode}</div>
            </div>
          </div>
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="text-5xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </div>
            <div className="text-lg text-gray-600">
              Students are answering on their devices...
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Correct answer: {currentQuestion.correctAnswer}
            </div>
          </div>
        )}

        {/* Player Status Grid */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Battle Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(players)
              .sort((a, b) => (b.lives || 0) - (a.lives || 0))
              .map(player => (
              <div 
                key={player.id} 
                className={`border-2 rounded-lg p-4 ${
                  (player.lives || 0) > 0 
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-400 bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800 truncate">{player.name}</div>
                  {(player.lives || 0) <= 0 && <div className="text-red-500 text-xl">💀</div>}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Lives:</span>
                    <span className="font-bold">❤️ {player.lives || 0}</span>
                  </div>
                </div>

                {/* Lives Visualization */}
                <div className="mt-2">
                  <div className="text-lg">
                    {'❤️'.repeat(Math.max(0, player.lives || 0))}
                    {'💀'.repeat(Math.max(0, 10 - (player.lives || 0)))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Game in progress...
            </div>
            <button
              onClick={resetGame}
              className="px-6 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
            >
              End Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Game Finished (Teacher)
  if (gamePhase === 'finished' && isTeacher) {
    const winnerPlayer = winner ? players[winner] : null;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-3xl font-bold mb-2">CHAMPION!</h2>
          <div className="text-2xl font-bold">{winnerPlayer?.name || 'No survivors'}</div>
          <div className="mt-4 text-yellow-200">
            Survived {questionNumber} questions!
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Final Results</h3>
          <div className="space-y-3">
            {Object.values(players)
              .sort((a, b) => (b.lives || 0) - (a.lives || 0))
              .map((player, index) => (
              <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.id === winner ? 'WINNER!' : `${player.lives || 0} lives remaining`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">❤️ {player.lives || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={resetGame}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          Create New Battle
        </button>
      </div>
    );
  }

  // RENDER: Not available message (for students accessing from teacher tab)
  return (
    <div className="max-w-2xl mx-auto text-center p-8">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="text-4xl mb-4">⚔️</div>
        <h2 className="text-2xl font-bold mb-4">Battle Royale Learning</h2>
        <p className="text-gray-600 mb-6">
          {isTeacher ? (
            "This is the teacher control panel for Battle Royale games."
          ) : (
            "Students join Battle Royale games through the student portal using the game code provided by their teacher."
          )}
        </p>
        
        {!firebaseReady && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-600 text-sm">Connecting to multiplayer services...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleRoyaleGame;