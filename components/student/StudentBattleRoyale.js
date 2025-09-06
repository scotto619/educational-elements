// components/student/StudentBattleRoyale.js - COMPLETELY REWRITTEN - SIMPLIFIED STUDENT BATTLE ROYALE
import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../utils/firebase';
import { ref, onValue, update, push, set, off } from 'firebase/database';

const StudentBattleRoyale = ({ studentData, classData, showToast }) => {
  const [gameState, setGameState] = useState('join'); // 'join', 'waiting', 'playing', 'finished'
  const [gameCode, setGameCode] = useState('');
  const [playerData, setPlayerData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [gameInfo, setGameInfo] = useState(null);
  const [otherPlayers, setOtherPlayers] = useState({});
  const [winner, setWinner] = useState(null);

  // Refs for cleanup
  const gameRef = useRef(null);

  // Join game with code
  const joinGame = async () => {
    if (!gameCode.trim()) {
      showToast('Please enter a game code!', 'error');
      return;
    }

    const code = gameCode.trim().toUpperCase();
    
    try {
      console.log('Trying to join game:', code);
      
      // Check if game exists
      const gameRefPath = ref(database, `battleRoyale/${code}`);
      const gameSnapshot = await new Promise((resolve, reject) => {
        onValue(gameRefPath, resolve, { onlyOnce: true });
      });

      if (!gameSnapshot.exists()) {
        showToast('Game not found! Check your code.', 'error');
        return;
      }

      const gameData = gameSnapshot.val();
      console.log('Game found:', gameData.state);
      
      if (gameData.state === 'finished') {
        showToast('This game has already finished!', 'error');
        return;
      }

      // Join the game
      const playerId = `${studentData.id}_${Date.now()}`;
      const playerInfo = {
        id: playerId,
        name: `${studentData.firstName} ${studentData.lastName || ''}`.trim(),
        studentId: studentData.id,
        lives: 10,
        correctAnswers: 0,
        wrongAnswers: 0,
        joinTime: Date.now(),
        active: true
      };

      await update(ref(database, `battleRoyale/${code}/players/${playerId}`), playerInfo);
      console.log('Successfully joined game as:', playerInfo.name);

      setPlayerData(playerInfo);
      setGameInfo(gameData);
      gameRef.current = gameRefPath;

      // Listen for all game updates
      onValue(gameRef.current, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          console.log('Game update received:', data.state);
          setGameInfo(data);
          setGameState(data.state === 'playing' && data.currentQuestion ? 'playing' : data.state);
          
          // Handle new questions
          if (data.currentQuestion && data.currentQuestion.id !== currentQuestion?.id) {
            console.log('New question received:', data.currentQuestion.question);
            setCurrentQuestion(data.currentQuestion);
            setHasAnswered(false);
            setSelectedAnswer(null);
          }

          if (data.winner) {
            setWinner(data.winner);
          }

          // Update player data
          if (data.players) {
            const others = { ...data.players };
            delete others[playerId];
            setOtherPlayers(others);
            
            // Update own player data to see health changes
            if (data.players[playerId]) {
              const updatedPlayerData = data.players[playerId];
              if (updatedPlayerData.lives !== playerData?.lives) {
                console.log(`Health update: ${playerData?.lives || 0} → ${updatedPlayerData.lives}`);
                
                // Show feedback for life changes
                if (playerData && updatedPlayerData.lives < playerData.lives) {
                  showToast(`Lost a life! ${updatedPlayerData.lives} lives remaining`, 'error');
                } else if (playerData && updatedPlayerData.lives > playerData.lives) {
                  showToast(`Life restored! ${updatedPlayerData.lives} lives`, 'success');
                }
              }
              setPlayerData(updatedPlayerData);
            }
          }
        }
      });

      setGameState('waiting');
      showToast(`Joined battle arena: ${code}!`, 'success');

    } catch (error) {
      console.error('Error joining game:', error);
      showToast('Failed to join game. Try again!', 'error');
    }
  };

  // Submit answer immediately - SIMPLIFIED
  const submitAnswer = async (answer) => {
    if (hasAnswered || !currentQuestion || !gameRef.current || !playerData) {
      console.log('Cannot submit answer:', { 
        hasAnswered, 
        hasQuestion: !!currentQuestion, 
        hasGameRef: !!gameRef.current, 
        hasPlayerData: !!playerData
      });
      return;
    }

    setSelectedAnswer(answer);
    setHasAnswered(true);

    try {
      console.log('Submitting answer:', answer, 'for question:', currentQuestion.question, 'correct:', currentQuestion.correctAnswer);
      
      const responseData = {
        answer: answer,
        timestamp: Date.now(),
        playerId: playerData.id,
        playerName: playerData.name,
        questionId: currentQuestion.id
      };
      
      await update(ref(database, `battleRoyale/${gameCode}/responses/${playerData.id}`), responseData);
      console.log('Answer submitted successfully');

      // Immediate visual feedback
      if (answer === currentQuestion.correctAnswer) {
        showToast('✅ CORRECT! You are safe!', 'success');
        console.log('Correct answer submitted');
      } else {
        showToast('❌ Wrong answer! You may lose a life...', 'error');
        console.log('Wrong answer submitted');
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      showToast('Failed to submit answer! Try again!', 'error');
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  // Leave game
  const leaveGame = async () => {
    try {
      if (gameRef.current && playerData) {
        await update(ref(database, `battleRoyale/${gameCode}/players/${playerData.id}`), {
          active: false,
          leftTime: Date.now()
        });
      }
      cleanup();
      setGameState('join');
      setGameCode('');
      showToast('Left the battle', 'info');
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (gameRef.current) {
      off(gameRef.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // Join screen
  if (gameState === 'join') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            ⚡ Battle Royale Learning
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
              disabled={!gameCode.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⚡ Join Battle
            </button>
          </div>

          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">⚡ Battle Rules</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• You start with 10 lives ❤️</li>
              <li>• <strong>Correct answer = you're safe!</strong></li>
              <li>• Wrong answer = lose 1 life</li>
              <li>• No timers - answer when ready!</li>
              <li>• Be the last survivor to win! 🏆</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Waiting for game to start
  if (gameState === 'waiting') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚡ Joined Battle!</h2>
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
            <h4 className="font-bold mb-2">Other Warriors ({Object.keys(otherPlayers).length})</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(otherPlayers).slice(0, 10).map(player => (
                <div key={player.id} className="bg-gray-50 rounded p-2 text-sm">
                  {player.name}
                </div>
              ))}
              {Object.keys(otherPlayers).length > 10 && (
                <div className="bg-gray-50 rounded p-2 text-sm text-gray-600">
                  +{Object.keys(otherPlayers).length - 10} more...
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

  // Active question
  if (gameState === 'playing' && currentQuestion) {
    return (
      <div className="space-y-4">
        {/* Status Bar */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">{playerData?.name}</div>
              <div className="text-red-200">
                ❤️ {playerData?.lives} lives • ✅ {playerData?.correctAnswers || 0} correct
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">No Timer!</div>
              <div className="text-red-200 text-sm">Answer when ready</div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <div className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            {currentQuestion.question}
          </div>
          
          <div className="text-lg font-bold text-blue-600 mb-4">
            Choose your answer below!
          </div>

          {hasAnswered && (
            <div className="text-lg font-bold mb-4">
              {selectedAnswer === currentQuestion.correctAnswer ? (
                <div className="text-green-600">✅ CORRECT! You are safe!</div>
              ) : (
                <div className="text-red-600">❌ Wrong! Waiting for results...</div>
              )}
              <div className="text-sm text-gray-600 mt-2">
                Waiting for next question...
              </div>
            </div>
          )}
        </div>

        {/* Answer Grid */}
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

        {/* Lives indicator */}
        {playerData && (
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="text-center">
              <div className="text-sm font-bold text-gray-700 mb-2">Your Lives</div>
              <div className="text-xl">
                {'❤️'.repeat(Math.max(0, playerData.lives))}
                {'💀'.repeat(Math.max(0, 10 - playerData.lives))}
              </div>
              {playerData.lives <= 3 && playerData.lives > 0 && (
                <div className="mt-2 text-red-600 font-bold">
                  ⚠️ WARNING: Only {playerData.lives} lives left!
                </div>
              )}
              {playerData.lives <= 0 && (
                <div className="mt-2 text-red-600 font-bold">
                  💀 ELIMINATED! Watch the battle continue...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Survivors count */}
        <div className="bg-white rounded-xl p-4 shadow-lg text-center">
          <div className="text-sm text-gray-600">
            Survivors: {Object.values(otherPlayers).filter(p => p.lives > 0).length + (playerData?.lives > 0 ? 1 : 0)}
          </div>
        </div>
      </div>
    );
  }

  // Game finished
  if (gameState === 'finished') {
    const isWinner = winner && winner.id === playerData?.id;
    
    return (
      <div className="space-y-6">
        <div className={`${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-gray-600 to-gray-700'} text-white rounded-xl p-8 text-center`}>
          <div className="text-6xl mb-4">{isWinner ? '🏆' : '💀'}</div>
          <h2 className="text-3xl font-bold mb-2">
            {isWinner ? 'CHAMPION!' : 'BATTLE OVER'}
          </h2>
          <div className="text-xl">
            {isWinner 
              ? 'You survived the battle!' 
              : winner 
                ? `${winner.name} is the champion!`
                : 'Battle completed!'
            }
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Your Battle Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{playerData?.correctAnswers || 0}</div>
              <div className="text-sm text-green-700">Correct Answers</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{playerData?.wrongAnswers || 0}</div>
              <div className="text-sm text-red-700">Wrong Answers</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{Math.max(0, playerData?.lives || 0)}</div>
              <div className="text-sm text-blue-700">Lives Remaining</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(otherPlayers).filter(p => p.lives > 0).length + (playerData?.lives > 0 ? 1 : 0)}
              </div>
              <div className="text-sm text-purple-700">Final Survivors</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            cleanup();
            setGameState('join');
            setGameCode('');
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg"
        >
          ⚡ Play Again
        </button>
      </div>
    );
  }

  // Default state (game starting)
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h2 className="text-3xl font-bold mb-2">BATTLE STARTING!</h2>
        <div className="text-xl">Get ready for the learning battle...</div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-2">Your Status</div>
          <div className="bg-green-100 rounded-lg p-4 inline-block">
            <div className="font-bold text-green-800">{playerData?.name}</div>
            <div className="text-green-600">❤️ {playerData?.lives} lives</div>
            <div className="text-green-600">✅ {playerData?.correctAnswers || 0} correct</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentBattleRoyale;