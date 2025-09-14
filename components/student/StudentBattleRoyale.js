// components/student/StudentBattleRoyale.js - SIMPLIFIED STUDENT BATTLE ROYALE
import React, { useState, useEffect, useRef } from 'react';

const StudentBattleRoyale = ({ studentData, classData, showToast }) => {
  // Firebase setup
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  // Game states
  const [gameState, setGameState] = useState('join'); // 'join', 'waiting', 'playing', 'finished'
  const [gameCode, setGameCode] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [gameData, setGameData] = useState(null);
  
  // Question and answer states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  
  // Other players and game info
  const [allPlayers, setAllPlayers] = useState({});
  const [winner, setWinner] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);

  // Firebase refs for cleanup
  const gameRef = useRef(null);
  const cleanupRef = useRef(null);

  // Initialize Firebase
  useEffect(() => {
    let mounted = true;
    
    const initFirebase = async () => {
      try {
        const [
          { database }, 
          { ref, onValue, set, update, remove, off }
        ] = await Promise.all([
          import('../../utils/firebase'),
          import('firebase/database')
        ]);

        if (!mounted) return;
        
        const testRef = ref(database, '.info/connected');
        const connectionListener = onValue(testRef, (snapshot) => {
          if (mounted && snapshot.val()) {
            setFirebase({ database, ref, onValue, set, update, remove, off });
            setFirebaseReady(true);
            console.log('✅ Firebase ready for student Battle Royale');
          }
        });
        
        return () => off(testRef, 'value', connectionListener);
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        if (mounted) {
          showToast('Connection error. Please refresh the page.', 'error');
        }
      }
    };
    
    const cleanup = initFirebase();
    
    return () => {
      mounted = false;
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, []);

  // Join game with code
  const joinGame = async () => {
    if (!gameCode.trim()) {
      showToast('Please enter a game code!', 'error');
      return;
    }

    if (!firebaseReady || !firebase) {
      showToast('Connection not ready. Please wait and try again.', 'error');
      return;
    }

    const code = gameCode.trim().toUpperCase();
    
    try {
      console.log('🔍 Trying to join battle royale:', code);
      
      gameRef.current = firebase.ref(firebase.database, `battle_royale/${code}`);
      
      // Check if game exists
      const gameSnapshot = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        firebase.onValue(gameRef.current, (snap) => {
          clearTimeout(timeout);
          resolve(snap);
        }, { onlyOnce: true });
      });

      if (!gameSnapshot.exists()) {
        showToast('Game not found! Check your code.', 'error');
        return;
      }

      const gameData = gameSnapshot.val();
      console.log('🎯 Battle royale found:', gameData.phase);
      
      if (gameData.phase === 'finished') {
        showToast('This battle has already finished!', 'error');
        return;
      }

      // Check if game is from same class
      if (gameData.classCode !== classData?.classCode) {
        showToast('This battle is from a different class!', 'error');
        return;
      }

      // Check if already too many players (optional limit)
      const playerCount = Object.keys(gameData.players || {}).length;
      if (playerCount >= 30) { // Max 30 players
        showToast('Battle is full! Try joining another battle.', 'error');
        return;
      }

      // Create player info
      const playerId = `${studentData.id}_${Date.now()}`;
      const playerInfo = {
        id: playerId,
        name: `${studentData.firstName} ${studentData.lastName || ''}`.trim(),
        actualStudentId: studentData.id, // For XP awarding
        lives: 10,
        joinTime: Date.now(),
        active: true
      };

      // Join the game
      await firebase.update(firebase.ref(firebase.database, `battle_royale/${code}/players/${playerId}`), playerInfo);
      console.log('✅ Successfully joined battle as:', playerInfo.name);

      setPlayerData(playerInfo);
      setGameData(gameData);
      setGameState('waiting');
      
      // Set up game listener
      setupGameListener(code);
      
      showToast(`Joined Battle Arena: ${code}!`, 'success');

    } catch (error) {
      console.error('❌ Error joining battle:', error);
      showToast('Failed to join battle. Try again!', 'error');
    }
  };

  // Set up game listener
  const setupGameListener = (code) => {
    if (!firebase || !gameRef.current) return;

    const unsubscribe = firebase.onValue(gameRef.current, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log('🔄 Battle update received:', data.phase);
        
        setGameData(data);
        setAllPlayers(data.players || {});
        setQuestionNumber(data.questionNumber || 0);
        
        // Handle phase changes
        if (data.phase === 'playing' && gameState !== 'playing') {
          setGameState('playing');
          showToast('⚔️ Battle has begun!', 'success');
        } else if (data.phase === 'finished') {
          setGameState('finished');
          setWinner(data.winner);
        }
        
        // Handle new questions
        if (data.currentQuestion && (!currentQuestion || data.currentQuestion.id !== currentQuestion.id)) {
          console.log('❓ New question:', data.currentQuestion.question, '=', data.currentQuestion.correctAnswer);
          setCurrentQuestion(data.currentQuestion);
          setHasAnswered(false);
          setSelectedAnswer(null);
        }

        // Update own player data to see health changes
        if (data.players && playerData) {
          const updatedPlayerData = data.players[playerData.id];
          if (updatedPlayerData && updatedPlayerData.lives !== playerData.lives) {
            console.log(`💓 Health update: ${playerData.lives} → ${updatedPlayerData.lives}`);
            
            if (updatedPlayerData.lives < playerData.lives) {
              showToast(`💔 Lost a life! ${updatedPlayerData.lives} lives remaining`, 'error');
            }
            
            setPlayerData(updatedPlayerData);
          }
        }
      }
    });

    cleanupRef.current = unsubscribe;
  };

  // Submit answer
  const submitAnswer = async (answer) => {
    if (hasAnswered || !currentQuestion || !gameRef.current || !playerData) {
      return;
    }

    if (!firebase) {
      showToast('Connection lost. Please refresh and rejoin.', 'error');
      return;
    }

    setHasAnswered(true);
    setSelectedAnswer(answer);

    try {
      console.log('📤 Submitting answer:', answer, 'for question:', currentQuestion.question);
      
      const responseData = {
        answer: answer,
        questionId: currentQuestion.id,
        timestamp: Date.now(),
        playerId: playerData.id
      };
      
      // Submit to responses node
      await firebase.update(
        firebase.ref(firebase.database, `battle_royale/${gameCode}/responses/${playerData.id}`), 
        responseData
      );

      console.log('✅ Answer submitted successfully');

      // Show immediate feedback
      const isCorrect = answer === currentQuestion.correctAnswer;
      if (isCorrect) {
        showToast('🎯 CORRECT! You are safe!', 'success');
        console.log('✅ Correct answer submitted');
      } else {
        showToast('❌ Wrong answer! You lose a life...', 'error');
        console.log('❌ Wrong answer submitted');
      }

    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      showToast('Failed to submit answer! Try again!', 'error');
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  // Leave game
  const leaveGame = async () => {
    try {
      if (firebase && gameRef.current && playerData) {
        await firebase.update(
          firebase.ref(firebase.database, `battle_royale/${gameCode}/players/${playerData.id}`), 
          { active: false, leftTime: Date.now() }
        );
      }
    } catch (error) {
      console.error('❌ Error leaving battle:', error);
    }
    
    cleanup();
    resetToJoin();
  };

  // Cleanup listeners
  const cleanup = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (gameRef.current && firebase) {
      firebase.off(gameRef.current);
      gameRef.current = null;
    }
  };

  // Reset to join screen
  const resetToJoin = () => {
    setGameState('join');
    setGameCode('');
    setPlayerData(null);
    setGameData(null);
    setCurrentQuestion(null);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setAllPlayers({});
    setWinner(null);
    setQuestionNumber(0);
  };

  // Clean up on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  // RENDER: Join screen
  if (gameState === 'join') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚔️ Battle Royale Learning
          </h2>
          <p className="text-gray-600 mb-6">Enter the game code to join the learning battle!</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Game Code
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-center text-xl font-bold tracking-wider uppercase"
                maxLength="6"
              />
            </div>

            <button
              onClick={joinGame}
              disabled={!gameCode.trim() || !firebaseReady}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!firebaseReady ? 'Connecting...' : '⚔️ Join Battle'}
            </button>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">⚔️ Battle Rules</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• You start with 10 lives ❤️</li>
              <li>• <strong>First correct answer = random opponent loses 1 life</strong></li>
              <li>• Wrong answer = you lose 1 life</li>
              <li>• No timers - answer when ready!</li>
              <li>• Be the last survivor to win! 🏆</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Waiting for game to start
  if (gameState === 'waiting') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚔️ Joined Battle!</h2>
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 inline-block">
            <div className="text-sm text-red-700 mb-1">Game Code</div>
            <div className="text-2xl font-bold text-red-800 tracking-wider">{gameCode}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Your Warrior Status</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="font-bold text-green-800">{playerData?.name}</div>
            <div className="text-green-600">❤️ {playerData?.lives} lives</div>
            <div className="text-sm text-gray-600">Ready for battle!</div>
          </div>

          <div className="mb-4">
            <h4 className="font-bold mb-2">Other Warriors ({Object.keys(allPlayers).length - 1})</h4>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {Object.values(allPlayers)
                .filter(player => player.id !== playerData?.id)
                .slice(0, 20) // Show max 20 other players
                .map(player => (
                <div key={player.id} className="bg-gray-50 rounded p-2 text-sm">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-gray-600">❤️ {player.lives} lives</div>
                </div>
              ))}
              {Object.keys(allPlayers).length > 21 && (
                <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
                  +{Object.keys(allPlayers).length - 21} more warriors...
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-lg font-bold text-orange-600 mb-4">
            ⏳ Waiting for teacher to start the battle...
          </div>

          <button
            onClick={leaveGame}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Leave Arena
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Active battle
  if (gameState === 'playing' && currentQuestion) {
    const myPlayer = allPlayers[playerData?.id];
    const isEliminated = myPlayer && myPlayer.lives <= 0;
    
    return (
      <div className="space-y-4">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">{playerData?.name}</div>
              <div className="text-red-200">
                ❤️ {myPlayer?.lives || 0} lives • Question #{questionNumber}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {Object.values(allPlayers).filter(p => p.lives > 0).length} Survivors
              </div>
              <div className="text-red-200 text-sm">Battle in progress</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </div>
          
          {!isEliminated ? (
            <div className="text-lg font-bold text-blue-600 mb-4">
              Choose your answer below!
            </div>
          ) : (
            <div className="text-lg font-bold text-red-600 mb-4">
              💀 You've been eliminated! Watch the battle continue...
            </div>
          )}

          {hasAnswered && !isEliminated && (
            <div className="text-lg font-bold mb-4">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="text-green-600">✅ CORRECT! You are safe!</div>
              ) : (
                <div className="text-red-600">❌ Wrong! You lose a life...</div>
              )}
              <div className="text-sm text-gray-600 mt-2">
                Waiting for next question...
              </div>
            </div>
          )}
        </div>

        {/* Answer Grid */}
        {!isEliminated && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {currentQuestion.answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => submitAnswer(answer)}
                disabled={hasAnswered}
                className={`
                  p-4 rounded-xl text-lg font-bold transition-all transform active:scale-95
                  ${hasAnswered 
                    ? selectedAnswer === answer
                      ? selectedAnswer === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white border-4 border-green-600'
                        : 'bg-red-500 text-white border-4 border-red-600'
                      : 'bg-gray-200 text-gray-600 border-2 border-gray-300'
                    : 'bg-blue-500 text-white border-2 border-blue-600 hover:bg-blue-600 hover:scale-105 shadow-lg'
                  }
                  ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {answer}
              </button>
            ))}
          </div>
        )}

        {/* Lives indicator */}
        {myPlayer && (
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700 mb-2">Your Lives</div>
              <div className="text-xl">
                {'❤️'.repeat(Math.max(0, myPlayer.lives))}
                {'💀'.repeat(Math.max(0, 10 - myPlayer.lives))}
              </div>
              {myPlayer.lives <= 3 && myPlayer.lives > 0 && (
                <div className="mt-2 text-red-600 font-bold">
                  ⚠️ WARNING: Only {myPlayer.lives} lives left!
                </div>
              )}
              {myPlayer.lives <= 0 && (
                <div className="mt-2 text-red-600 font-bold">
                  💀 ELIMINATED! Watch the battle continue...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick survivors count */}
        <div className="bg-white rounded-xl p-4 shadow-lg text-center">
          <div className="text-sm text-gray-600">
            {Object.values(allPlayers).filter(p => p.lives > 0).length} warriors still fighting
          </div>
        </div>

        {/* Leave button */}
        <div className="text-center">
          <button
            onClick={leaveGame}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Leave Battle
          </button>
        </div>
      </div>
    );
  }

  // RENDER: Game finished
  if (gameState === 'finished') {
    const winnerPlayer = winner ? allPlayers[winner] : null;
    const isWinner = winner && winner === playerData?.id;
    const myPlayer = allPlayers[playerData?.id];
    
    return (
      <div className="space-y-6">
        <div className={`${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} text-white rounded-xl p-8 text-center`}>
          <div className="text-6xl mb-4">{isWinner ? '🏆' : '⚔️'}</div>
          <h2 className="text-3xl font-bold mb-2">
            {isWinner ? 'CHAMPION!' : 'BATTLE OVER'}
          </h2>
          <div className="text-xl">
            {isWinner 
              ? 'You survived the battle!' 
              : winnerPlayer 
                ? `${winnerPlayer.name} is the champion!`
                : 'Battle completed!'
            }
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Battle Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{Math.max(0, myPlayer?.lives || 0)}</div>
              <div className="text-sm text-blue-700">Lives Remaining</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">{questionNumber}</div>
              <div className="text-sm text-purple-700">Questions Faced</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 col-span-2">
              <div className="text-2xl font-bold text-green-600">
                {isWinner ? 'WINNER!' : myPlayer && myPlayer.lives > 0 ? 'SURVIVOR!' : 'ELIMINATED'}
              </div>
              <div className="text-sm text-green-700">Final Result</div>
            </div>
          </div>
        </div>

        <button
          onClick={resetToJoin}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          ⚔️ Join Another Battle
        </button>
      </div>
    );
  }

  // RENDER: Default state
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚔️</div>
        <h2 className="text-3xl font-bold mb-2">Battle Royale</h2>
        <div className="text-xl">Loading battle system...</div>
      </div>

      {!firebaseReady && (
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Connecting to battle servers...</div>
        </div>
      )}
    </div>
  );
};

export default StudentBattleRoyale;