// components/games/BattleRoyaleGame.js - COMPLETELY REWRITTEN - SIMPLIFIED BATTLE ROYALE
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../utils/firebase';
import { ref, push, set, onValue, update, remove, off } from 'firebase/database';

const BattleRoyaleGame = ({ gameMode, showToast, students = [] }) => {
  // Game state
  const [gameState, setGameState] = useState('setup'); // 'setup', 'waiting', 'playing', 'finished'
  const [gameCode, setGameCode] = useState('');
  const [players, setPlayers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [category, setCategory] = useState('times-tables');
  const [difficulty, setDifficulty] = useState('easy');
  const [questionCount, setQuestionCount] = useState(0);
  const [winner, setWinner] = useState(null);

  // Refs for cleanup
  const gameRef = useRef(null);
  const playersRef = useRef(null);
  const responsesRef = useRef(null);

  // Game categories and difficulties
  const categories = {
    'times-tables': {
      name: 'Times Tables',
      icon: '✖️',
      difficulties: {
        easy: { range: [1, 5], name: 'Easy (1-5)' },
        medium: { range: [1, 10], name: 'Medium (1-10)' },
        hard: { range: [1, 12], name: 'Hard (1-12)' }
      }
    },
    'addition': {
      name: 'Addition',
      icon: '➕',
      difficulties: {
        easy: { range: [1, 20], name: 'Easy (1-20)' },
        medium: { range: [1, 50], name: 'Medium (1-50)' },
        hard: { range: [1, 100], name: 'Hard (1-100)' }
      }
    },
    'subtraction': {
      name: 'Subtraction',
      icon: '➖',
      difficulties: {
        easy: { range: [1, 20], name: 'Easy (1-20)' },
        medium: { range: [1, 50], name: 'Medium (1-50)' },
        hard: { range: [1, 100], name: 'Hard (1-100)' }
      }
    }
  };

  // Generate random game code
  const generateGameCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Generate question based on category and difficulty
  const generateQuestion = () => {
    const cat = categories[category];
    const diff = cat.difficulties[difficulty];
    let question, correctAnswer, num1, num2;

    switch (category) {
      case 'times-tables':
        num1 = Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1)) + diff.range[0];
        num2 = Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1)) + diff.range[0];
        question = `${num1} × ${num2}`;
        correctAnswer = num1 * num2;
        break;
      case 'addition':
        num1 = Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1)) + diff.range[0];
        num2 = Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1)) + diff.range[0];
        question = `${num1} + ${num2}`;
        correctAnswer = num1 + num2;
        break;
      case 'subtraction':
        num1 = Math.floor(Math.random() * (diff.range[1] - diff.range[0] + 1)) + diff.range[0];
        num2 = Math.floor(Math.random() * num1) + 1;
        question = `${num1} - ${num2}`;
        correctAnswer = num1 - num2;
        break;
      default:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        question = `${num1} × ${num2}`;
        correctAnswer = num1 * num2;
    }

    // Generate wrong answers
    const wrongAnswers = [];
    while (wrongAnswers.length < 11) {
      let wrong;
      if (category === 'times-tables') {
        wrong = Math.floor(Math.random() * (correctAnswer * 2)) + 1;
      } else {
        wrong = Math.floor(Math.random() * (correctAnswer + 20)) + 1;
      }
      
      if (wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }

    // Mix correct answer with wrong answers
    const allAnswers = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    return {
      id: Date.now(),
      question,
      correctAnswer,
      answers: allAnswers,
      timestamp: Date.now()
    };
  };

  // Start new game
  const startGame = async () => {
    const code = generateGameCode();
    setGameCode(code);
    
    try {
      gameRef.current = ref(database, `battleRoyale/${code}`);
      playersRef.current = ref(database, `battleRoyale/${code}/players`);
      responsesRef.current = ref(database, `battleRoyale/${code}/responses`);

      const initialGameData = {
        gameCode: code,
        state: 'waiting',
        host: 'teacher',
        category,
        difficulty,
        createdAt: Date.now(),
        settings: {
          maxLives: 10
        }
      };

      await set(gameRef.current, initialGameData);

      // Listen for players joining
      onValue(playersRef.current, (snapshot) => {
        const playersData = snapshot.val() || {};
        console.log('Players updated:', Object.keys(playersData).length);
        setPlayers(playersData);
      });

      setGameState('waiting');
      showToast(`Game created! Code: ${code}`, 'success');
    } catch (error) {
      console.error('Error starting game:', error);
      showToast('Failed to create game', 'error');
    }
  };

  // Start actual battle
  const startBattle = async () => {
    if (Object.keys(players).length < 2) {
      showToast('Need at least 2 players to start!', 'error');
      return;
    }

    try {
      await update(gameRef.current, {
        state: 'playing',
        startTime: Date.now()
      });

      setGameState('playing');
      setQuestionCount(0);
      
      // Start first question immediately
      setTimeout(() => {
        nextQuestion();
      }, 1000);

      showToast('Battle Royale Started!', 'success');
    } catch (error) {
      console.error('Error starting battle:', error);
      showToast('Failed to start battle', 'error');
    }
  };

  // Generate and send next question
  const nextQuestion = async () => {
    console.log('Generating next question...');
    
    const question = generateQuestion();
    setCurrentQuestion(question);
    setQuestionCount(prev => prev + 1);

    try {
      // Clear previous responses and set new question
      await update(gameRef.current, {
        currentQuestion: question,
        state: 'playing',
        responses: null, // Clear previous responses
        questionStartTime: Date.now()
      });

      console.log('Question sent:', question.question, '=', question.correctAnswer);

      // Set up real-time response listener
      if (responsesRef.current) {
        off(responsesRef.current);
      }
      responsesRef.current = ref(database, `battleRoyale/${gameCode}/responses`);
      
      onValue(responsesRef.current, (snapshot) => {
        const responsesData = snapshot.val() || {};
        console.log('Responses received:', Object.keys(responsesData).length);
        
        // Process any responses immediately
        processResponses(responsesData);
      });

    } catch (error) {
      console.error('Error sending question:', error);
    }
  };

  // Process responses immediately - SIMPLIFIED LOGIC
  const processResponses = async (responses = {}) => {
    if (!currentQuestion) return;

    const correctAnswer = currentQuestion.correctAnswer;
    console.log('Processing responses. Correct answer:', correctAnswer);
    
    let hasCorrectAnswer = false;
    let correctPlayerId = null;
    const playerUpdates = {};

    // Initialize all player updates
    Object.keys(players).forEach(playerId => {
      playerUpdates[playerId] = { ...players[playerId] };
    });

    // Check each response
    for (const [playerId, response] of Object.entries(responses)) {
      if (!players[playerId] || players[playerId].lives <= 0) continue;
      
      if (response.answer === correctAnswer && !hasCorrectAnswer) {
        // First correct answer - this player is safe
        hasCorrectAnswer = true;
        correctPlayerId = playerId;
        playerUpdates[playerId].correctAnswers = (playerUpdates[playerId].correctAnswers || 0) + 1;
        console.log(`Correct answer from ${players[playerId].name}`);
      } else if (response.answer !== correctAnswer) {
        // Wrong answer - lose a life
        playerUpdates[playerId].lives = Math.max(0, playerUpdates[playerId].lives - 1);
        playerUpdates[playerId].wrongAnswers = (playerUpdates[playerId].wrongAnswers || 0) + 1;
        console.log(`Wrong answer from ${players[playerId].name}, lives: ${playerUpdates[playerId].lives}`);
      }
    }

    // If someone got it right, one random other player loses a life
    if (hasCorrectAnswer && correctPlayerId) {
      const otherAlivePlayers = Object.keys(playerUpdates).filter(id => 
        id !== correctPlayerId && playerUpdates[id].lives > 0
      );
      
      if (otherAlivePlayers.length > 0) {
        const randomTarget = otherAlivePlayers[Math.floor(Math.random() * otherAlivePlayers.length)];
        playerUpdates[randomTarget].lives = Math.max(0, playerUpdates[randomTarget].lives - 1);
        console.log(`${players[correctPlayerId].name} attacks ${players[randomTarget].name}!`);
        showToast(`${players[correctPlayerId].name} attacks ${players[randomTarget].name}!`, 'success');
      }
    }

    // Update Firebase with new player states
    await update(ref(database, `battleRoyale/${gameCode}/players`), playerUpdates);
    setPlayers(playerUpdates);

    // Check for winner
    const alivePlayers = Object.values(playerUpdates).filter(p => p.lives > 0);
    console.log('Players alive:', alivePlayers.length);
    
    if (alivePlayers.length <= 1) {
      // Game over!
      const gameWinner = alivePlayers[0] || null;
      console.log('Winner:', gameWinner?.name || 'No one');
      
      setWinner(gameWinner);
      setGameState('finished');
      
      await update(gameRef.current, {
        state: 'finished',
        winner: gameWinner,
        endTime: Date.now()
      });
      
      showToast(`${gameWinner?.name || 'Someone'} wins the Battle Royale!`, 'success');
    } else if (hasCorrectAnswer || Object.keys(responses).length > 0) {
      // Continue to next question after a short delay
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    }
  };

  // End game
  const endGame = async () => {
    try {
      if (gameRef.current) {
        await update(gameRef.current, { state: 'finished', endTime: Date.now() });
      }
      cleanup();
      setGameState('setup');
      showToast('Game ended', 'info');
    } catch (error) {
      console.error('Error ending game:', error);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (playersRef.current) {
      off(playersRef.current);
    }
    if (responsesRef.current) {
      off(responsesRef.current);
    }
    if (gameRef.current) {
      off(gameRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // Setup screen
  if (gameState === 'setup') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚔️ Battle Royale Learning
          </h2>
          <p className="text-gray-600 mb-6">Create a multiplayer learning battle where students compete to be the last survivor!</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Game Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {Object.entries(categories[category].difficulties).map(([key, diff]) => (
                  <option key={key} value={key}>{diff.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">⚡ Battle Rules</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Students start with 10 lives</li>
              <li>• <strong>Correct answer = safe + random opponent loses 1 life</strong></li>
              <li>• Wrong answer = lose 1 life</li>
              <li>• No timers - instant responses!</li>
              <li>• Last survivor wins!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
          >
            ⚔️ Create Battle Arena
          </button>
        </div>
      </div>
    );
  }

  // Waiting for players
  if (gameState === 'waiting') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-2">⚔️ Battle Arena Created!</h2>
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 inline-block">
            <div className="text-sm text-red-700 mb-2">Game Code</div>
            <div className="text-4xl font-bold text-red-800 tracking-wider">{gameCode}</div>
          </div>
          <p className="text-gray-600 mt-4">Students can join at: <strong>educational-elements.com/student</strong></p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Warriors Joined ({Object.keys(players).length})</h3>
            <div className="text-sm text-gray-600">
              {categories[category].icon} {categories[category].name} - {categories[category].difficulties[difficulty].name}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.values(players).map(player => (
              <div key={player.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="font-semibold text-red-800">{player.name}</div>
                <div className="text-sm text-red-600">❤️ {player.lives} lives</div>
                <div className="text-xs text-gray-500">Joined {new Date(player.joinTime).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={startBattle}
              disabled={Object.keys(players).length < 2}
              className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ START BATTLE ({Object.keys(players).length}/30)
            </button>
            <button
              onClick={endGame}
              className="px-6 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game playing
  if (gameState === 'playing') {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">⚡ Battle Royale</h2>
              <div className="text-red-200">Question #{questionCount} • {Object.values(players).filter(p => p.lives > 0).length} survivors</div>
            </div>
            <div className="text-right">
              <div className="text-red-200">Instant responses!</div>
              <div className="text-red-200">No timers!</div>
            </div>
          </div>
        </div>

        {/* Current Question Display */}
        {currentQuestion && (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="text-6xl font-bold text-gray-800 mb-4">
              {currentQuestion.question}
            </div>
            <div className="text-lg text-gray-600">
              Students answer on their devices • First correct answer wins!
            </div>
          </div>
        )}

        {/* Player Status Grid */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">🏆 Battle Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(players)
              .sort((a, b) => b.lives - a.lives || (b.correctAnswers || 0) - (a.correctAnswers || 0))
              .map(player => (
              <div 
                key={player.id} 
                className={`border-2 rounded-lg p-4 ${
                  player.lives > 0 
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-400 bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-gray-800 truncate">{player.name}</div>
                  {player.lives <= 0 && <div className="text-red-500 text-xl">💀</div>}
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Lives:</span>
                    <span className="font-bold">
                      {'❤️'.repeat(Math.max(0, player.lives))}
                      {'🖤'.repeat(Math.max(0, 10 - player.lives))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Correct:</span>
                    <span className="text-green-600 font-bold">{player.correctAnswers || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wrong:</span>
                    <span className="text-red-600 font-bold">{player.wrongAnswers || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex space-x-4">
          <button
            onClick={endGame}
            className="px-6 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
          >
            End Game
          </button>
        </div>
      </div>
    );
  }

  // Winner Display
  if (gameState === 'finished') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl font-bold mb-2">CHAMPION!</h2>
          <div className="text-2xl font-bold">{winner?.name || 'No survivors'}</div>
          <div className="mt-4 text-yellow-200">
            Survived {questionCount} questions with {winner?.lives || 0} lives remaining!
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Final Standings</h3>
          <div className="space-y-3">
            {Object.values(players)
              .sort((a, b) => b.lives - a.lives || (b.correctAnswers || 0) - (a.correctAnswers || 0))
              .map((player, index) => (
              <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold">#{index + 1}</div>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-gray-600">
                      {player.correctAnswers || 0} correct • {player.wrongAnswers || 0} wrong
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">❤️ {player.lives}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            cleanup();
            setGameState('setup');
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          Create New Game
        </button>
      </div>
    );
  }

  return null;
};

export default BattleRoyaleGame;