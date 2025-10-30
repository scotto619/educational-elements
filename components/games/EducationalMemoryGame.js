// components/games/EducationalMemoryGame.js - INTEGRATED WITH MAIN APP ARCHITECTURE
import React, { useState, useEffect, useCallback } from 'react';

const EducationalMemoryGame = ({
  studentData,
  showToast,
  classData,
  updateStudentData,
  students = [],
  onAwardXP,
  onAwardCoins,
  allowRewards = false
}) => {
  // Firebase setup for multiplayer coordination only (not student data)
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Game states
  const [gameMode, setGameMode] = useState('menu');
  const [gameRoom, setGameRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Game settings
  const [selectedTheme, setSelectedTheme] = useState('addition');
  const [boardSize, setBoardSize] = useState('4x4');
  const [customPairs, setCustomPairs] = useState([]);
  const [showCustomEditor, setShowCustomEditor] = useState(false);

  // Game play states
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameScores, setGameScores] = useState({}); // Temporary game scores
  const [totalMatches, setTotalMatches] = useState(0); // Track total matches made

  // Player info - integrate with actual student data
  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Anonymous',
    avatar: studentData?.avatarBase || 'Wizard F',
    studentData: studentData, // Include full student data
    color: getPlayerColor(0)
  };

  // Preset themes with educational content
  const PRESET_THEMES = {
    addition: {
      name: 'Addition Facts',
      description: 'Match math problems with their answers',
      color: 'from-green-500 to-emerald-600',
      pairs: [
        ['2 + 3', '5'], ['4 + 6', '10'], ['7 + 8', '15'], ['9 + 4', '13'],
        ['5 + 7', '12'], ['8 + 6', '14'], ['3 + 9', '12'], ['6 + 7', '13'],
        ['4 + 8', '12'], ['9 + 6', '15'], ['7 + 5', '12'], ['8 + 9', '17'],
        ['6 + 8', '14'], ['5 + 9', '14'], ['7 + 7', '14'], ['8 + 8', '16']
      ]
    },
    subtraction: {
      name: 'Subtraction Facts',
      description: 'Match subtraction problems with answers',
      color: 'from-red-500 to-pink-600',
      pairs: [
        ['10 - 3', '7'], ['15 - 8', '7'], ['12 - 5', '7'], ['14 - 6', '8'],
        ['16 - 9', '7'], ['13 - 7', '6'], ['11 - 4', '7'], ['18 - 9', '9'],
        ['17 - 8', '9'], ['14 - 8', '6'], ['15 - 7', '8'], ['12 - 6', '6'],
        ['16 - 7', '9'], ['13 - 5', '8'], ['11 - 5', '6'], ['17 - 9', '8']
      ]
    },
    multiplication: {
      name: 'Times Tables',
      description: 'Match multiplication problems with answers',
      color: 'from-purple-500 to-indigo-600',
      pairs: [
        ['2 × 3', '6'], ['3 × 4', '12'], ['5 × 2', '10'], ['4 × 4', '16'],
        ['3 × 5', '15'], ['6 × 2', '12'], ['4 × 5', '20'], ['3 × 6', '18'],
        ['7 × 2', '14'], ['5 × 5', '25'], ['4 × 6', '24'], ['8 × 3', '24'],
        ['6 × 5', '30'], ['7 × 4', '28'], ['8 × 4', '32'], ['9 × 3', '27']
      ]
    },
    reading_animals: {
      name: 'Animal Words',
      description: 'Match animal words with emojis',
      color: 'from-orange-500 to-yellow-600',
      pairs: [
        ['Dog', '🐶'], ['Cat', '🐱'], ['Bird', '🦅'], ['Fish', '🐠'],
        ['Lion', '🦁'], ['Tiger', '🐅'], ['Bear', '🐻'], ['Fox', '🦊'],
        ['Elephant', '🐘'], ['Monkey', '🐵'], ['Rabbit', '🐰'], ['Frog', '🐸'],
        ['Cow', '🐄'], ['Pig', '🐷'], ['Horse', '🐴'], ['Sheep', '🐑']
      ]
    },
    shapes: {
      name: 'Shapes & Colors',
      description: 'Match shape names with symbols',
      color: 'from-blue-500 to-cyan-600',
      pairs: [
        ['Circle', '⭕'], ['Square', '⬛'], ['Triangle', '🔺'], ['Star', '⭐'],
        ['Heart', '💗'], ['Diamond', '💎'], ['Rectangle', '⬜'], ['Oval', '🥚'],
        ['Red', '🔴'], ['Blue', '🔵'], ['Yellow', '🟡'], ['Green', '🟢'],
        ['Purple', '🟣'], ['Orange', '🟠'], ['Pink', '🩷'], ['Black', '⚫']
      ]
    }
  };

  // Board size options
  const BOARD_SIZES = {
    '3x4': { rows: 3, cols: 4, pairs: 6, name: 'Small (3×4)' },
    '4x4': { rows: 4, cols: 4, pairs: 8, name: 'Medium (4×4)' },
    '4x5': { rows: 4, cols: 5, pairs: 10, name: 'Large (4×5)' },
    '5x6': { rows: 5, cols: 6, pairs: 15, name: 'Extra Large (5×6)' }
  };

  function getPlayerColor(index) {
    const colors = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500'
    ];
    return colors[index % colors.length];
  }

  // Initialize Firebase for multiplayer coordination only
  useEffect(() => {
    let mounted = true;
    
    const initFirebase = async () => {
      try {
        console.log('🔄 Initializing Firebase for Memory Game coordination...');
        
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
          const connected = snapshot.val();
          if (mounted) {
            setConnectionStatus(connected ? 'connected' : 'error');
            
            if (connected && !firebaseReady) {
              setFirebase({ database, ref, onValue, set, update, remove, off });
              setFirebaseReady(true);
              console.log('✅ Firebase ready for Memory Game coordination');
            }
          }
        });
        
        return () => {
          off(testRef, 'value', connectionListener);
        };
        
      } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        if (mounted) {
          setConnectionStatus('error');
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

  // Generate cards from theme and board size
  const generateCards = useCallback(() => {
    const { pairs: maxPairs } = BOARD_SIZES[boardSize];
    const theme = PRESET_THEMES[selectedTheme];
    let availablePairs = [];

    if (selectedTheme === 'custom' && customPairs.length > 0) {
      availablePairs = customPairs;
    } else if (theme) {
      availablePairs = theme.pairs;
    } else {
      availablePairs = PRESET_THEMES.addition.pairs;
    }

    // Randomly select pairs for this game
    const selectedPairs = availablePairs
      .sort(() => Math.random() - 0.5)
      .slice(0, maxPairs);

    // Create card objects
    const gameCards = [];
    selectedPairs.forEach((pair, pairIndex) => {
      gameCards.push({
        id: `card_${pairIndex}_0`,
        pairId: pairIndex,
        content: pair[0],
        type: 'question',
        isFlipped: false,
        isMatched: false
      });
      gameCards.push({
        id: `card_${pairIndex}_1`,
        pairId: pairIndex,
        content: pair[1],
        type: 'answer',
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle cards
    return gameCards.sort(() => Math.random() - 0.5);
  }, [selectedTheme, boardSize, customPairs]);

  // Start single player game
  const startSinglePlayer = () => {
    const newCards = generateCards();
    setCards(newCards);
    setGamePlayers([{ ...playerInfo, score: 0 }]);
    setGameScores({ [playerInfo.id]: 0 });
    setGameStarted(true);
    setGameMode('single');
    setFlippedCards([]);
    setMatchedCards([]);
    setTotalMatches(0);
    setWinner(null);
    showToast('Memory game started! Find all the matches!', 'success');
  };

  // Award XP to student using main app's system
  const awardStudentXP = useCallback(async (studentId, amount, reason) => {
    if (!allowRewards) {
      return;
    }

    if (gameMode === 'single' && studentId === studentData?.id) {
      if (updateStudentData) {
        try {
          await updateStudentData({
            totalPoints: (studentData.totalPoints || 0) + amount
          });
          console.log(`✅ Awarded ${amount} XP to ${studentData.firstName} for ${reason}`);
        } catch (error) {
          console.error('Error awarding XP:', error);
        }
      }
    } else if (gameMode === 'multiplayer' && onAwardXP) {
      try {
        await onAwardXP(studentId, amount, reason);
        console.log(`✅ Awarded ${amount} XP to student ${studentId} for ${reason}`);
      } catch (error) {
        console.error('Error awarding XP in multiplayer:', error);
      }
    }
  }, [allowRewards, gameMode, studentData, updateStudentData, onAwardXP]);

  // Create multiplayer game
  const createMultiplayerGame = async () => {
    if (!firebaseReady || !firebase) {
      showToast('Connection not ready. Please wait or try single player.', 'error');
      return;
    }

    if (!classData?.classCode) {
      showToast('Class code required for multiplayer games.', 'error');
      return;
    }

    setLoading(true);
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      const gameRef = firebase.ref(firebase.database, `memory_game/${newRoomCode}`);
      const initialData = {
        roomCode: newRoomCode,
        gameType: 'memory',
        classCode: classData.classCode,
        host: playerInfo.id,
        players: {
          [playerInfo.id]: { 
            ...playerInfo, 
            score: 0, 
            ready: false,
            actualStudentId: studentData?.id // Track actual student ID
          }
        },
        settings: {
          theme: selectedTheme,
          boardSize: boardSize,
          customPairs: selectedTheme === 'custom' ? customPairs : []
        },
        phase: 'waiting',
        currentTurn: 0,
        cards: [],
        flippedCards: [],
        matchedCards: [],
        gameScores: { [playerInfo.id]: 0 },
        createdAt: Date.now()
      };
      
      await firebase.set(gameRef, initialData);
      
      setGameRoom(newRoomCode);
      setRoomCode(newRoomCode);
      setPlayerId(playerInfo.id);
      setGameMode('multiplayer');
      showToast(`Game created! Share code: ${newRoomCode}`, 'success');
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  // Join multiplayer game
  const joinMultiplayerGame = async () => {
    if (!firebaseReady || !firebase) {
      showToast('Connection not ready. Please wait.', 'error');
      return;
    }

    if (!joinCode.trim()) {
      showToast('Please enter a room code', 'error');
      return;
    }

    if (!classData?.classCode) {
      showToast('Class code required for multiplayer games.', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const gameRef = firebase.ref(firebase.database, `memory_game/${joinCode.toUpperCase()}`);
      
      const snapshot = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        firebase.onValue(gameRef, (snap) => {
          clearTimeout(timeout);
          resolve(snap);
        }, { onlyOnce: true });
      });
      
      const gameData = snapshot.val();
      
      if (!gameData) {
        showToast('Game not found', 'error');
        setLoading(false);
        return;
      }

      // Check if game is from same class
      if (gameData.classCode !== classData.classCode) {
        showToast('This game is from a different class', 'error');
        setLoading(false);
        return;
      }
      
      if (Object.keys(gameData.players || {}).length >= 4) {
        showToast('Game is full (max 4 players)', 'error');
        setLoading(false);
        return;
      }
      
      // Join the game
      const playerCount = Object.keys(gameData.players || {}).length;
      const newPlayer = { 
        ...playerInfo, 
        score: 0, 
        ready: false,
        actualStudentId: studentData?.id
      };
      newPlayer.color = getPlayerColor(playerCount);
      
      await firebase.update(gameRef, {
        [`players/${playerInfo.id}`]: newPlayer,
        [`gameScores/${playerInfo.id}`]: 0
      });
      
      setGameRoom(joinCode.toUpperCase());
      setPlayerId(playerInfo.id);
      setGameMode('multiplayer');
      showToast('Joined game successfully!', 'success');
    } catch (error) {
      console.error('Error joining game:', error);
      showToast('Failed to join game. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  // Firebase listener for multiplayer
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom || gameMode !== 'multiplayer') return;

    let listenerActive = true;
    const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
    
    const handleDataUpdate = (snapshot) => {
      if (!listenerActive) return;
      
      const data = snapshot.val();
      if (!data) {
        if (gameMode === 'multiplayer') {
          resetGame();
          showToast('Game ended or connection lost', 'info');
        }
        return;
      }
      
      setGameData(data);
      setGamePlayers(Object.values(data.players || {}));
      setGameScores(data.gameScores || {});
      setCards(data.cards || []);
      setFlippedCards(data.flippedCards || []);
      setMatchedCards(data.matchedCards || []);
      setCurrentTurn(data.currentTurn || 0);
      
      // Check if game has started
      if (data.phase === 'playing' && !gameStarted) {
        setGameStarted(true);
        showToast('Game started! Find the matches!', 'success');
      }
      
      // Check for winner
      if (data.winner) {
        setWinner(data.winner);
        const winnerPlayer = Object.values(data.players).find(p => p.id === data.winner);
        showToast(data.winner === playerInfo.id ? 'You won!' : `${winnerPlayer?.name} won!`, 'success');
      }
    };
    
    const unsubscribe = firebase.onValue(gameRef, handleDataUpdate);
    
    return () => {
      listenerActive = false;
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameRoom, gameMode, gameStarted, playerInfo.id]);

  // Handle card flip
  const flipCard = async (cardIndex) => {
    const card = cards[cardIndex];
    
    if (!card || card.isMatched || flippedCards.includes(cardIndex) || flippedCards.length >= 2) {
      return;
    }
    
    if (gameMode === 'multiplayer') {
      // Check if it's player's turn
      const currentPlayer = gamePlayers[currentTurn];
      if (currentPlayer?.id !== playerInfo.id) {
        showToast("Not your turn!", 'warning');
        return;
      }
      
      // Update Firebase
      if (firebase && gameRoom) {
        const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
        const newFlippedCards = [...flippedCards, cardIndex];
        
        await firebase.update(gameRef, {
          flippedCards: newFlippedCards
        });
      }
    } else {
      // Single player
      setFlippedCards(prev => [...prev, cardIndex]);
    }
  };

  // Check for matches - FIXED with proper player identification and XP awarding
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      if (firstCard && secondCard) {
        const isMatch = firstCard.pairId === secondCard.pairId;
        
        setTimeout(async () => {
          if (isMatch) {
            // Handle match
            const newMatchedCards = [...matchedCards, firstIndex, secondIndex];
            const pointsEarned = 2; // XP for educational match
            
            if (gameMode === 'multiplayer' && firebase && gameRoom) {
              // Get current player info
              const currentPlayer = gamePlayers[currentTurn];
              const currentPlayerId = currentPlayer?.id;
              const actualStudentId = currentPlayer?.actualStudentId;
              
              console.log(`🎯 Match found! Current player: ${currentPlayer?.name} (${currentPlayerId}), Student ID: ${actualStudentId}`);
              
              if (currentPlayerId && actualStudentId) {
                // Update game state
                const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
                const newGameScores = { ...gameScores };
                newGameScores[currentPlayerId] = (newGameScores[currentPlayerId] || 0) + 1;
                
                const updatedCards = cards.map((card, index) => {
                  if (index === firstIndex || index === secondIndex) {
                    return { ...card, isMatched: true };
                  }
                  return card;
                });
                
                const updates = {
                  cards: updatedCards,
                  matchedCards: newMatchedCards,
                  flippedCards: [],
                  gameScores: newGameScores,
                  currentTurn: (currentTurn + 1) % gamePlayers.length
                };
                
                if (allowRewards) {
                  try {
                    await awardStudentXP(actualStudentId, pointsEarned, 'Memory Match');
                    showToast(`${currentPlayer.name} found a match! +${pointsEarned} XP`, 'success');
                  } catch (error) {
                    console.error('Error awarding XP:', error);
                  }
                } else {
                  showToast(`${currentPlayer.name} found a match!`, 'success');
                }
                
                // Check for win condition
                if (newMatchedCards.length === cards.length) {
                  const winnerPlayerId = Object.entries(newGameScores).reduce((a, b) => 
                    newGameScores[a[0]] > newGameScores[b[0]] ? a : b
                  )[0];
                  updates.winner = winnerPlayerId;
                  updates.phase = 'finished';
                  
                  // Award bonus XP to winner
                  const winnerPlayer = gamePlayers.find(p => p.id === winnerPlayerId);
                  if (allowRewards && winnerPlayer?.actualStudentId) {
                    await awardStudentXP(winnerPlayer.actualStudentId, 5, 'Memory Game Winner');
                    showToast(`${winnerPlayer.name} wins the match! +5 bonus XP`, 'success');
                  } else if (winnerPlayer) {
                    showToast(`${winnerPlayer.name} wins the match!`, 'success');
                  }
                }
                
                await firebase.update(gameRef, updates);
              }
            } else {
              // Single player
              const updatedCards = cards.map((card, index) => {
                if (index === firstIndex || index === secondIndex) {
                  return { ...card, isMatched: true };
                }
                return card;
              });
              
              setCards(updatedCards);
              setMatchedCards(newMatchedCards);
              setGameScores(prev => ({ ...prev, [playerInfo.id]: (prev[playerInfo.id] || 0) + 1 }));
              setFlippedCards([]);
              setTotalMatches(prev => prev + 1);
              
              // Award XP using main app's system
              if (allowRewards) {
                await awardStudentXP(studentData?.id, pointsEarned, 'Memory Match');
                showToast(`Great match! +${pointsEarned} XP`, 'success');
              } else {
                showToast('Great match!', 'success');
              }
              
              // Check win condition
              if (newMatchedCards.length === cards.length) {
                setWinner(playerInfo.id);
                // Award bonus XP for completing the game
                if (allowRewards) {
                  await awardStudentXP(studentData?.id, 5, 'Memory Game Complete');
                  showToast('Congratulations! You found all matches! +5 bonus XP', 'success');
                } else {
                  showToast('Congratulations! You found all matches!', 'success');
                }
              }
            }
            
            playSound('match');
          } else {
            // No match
            if (gameMode === 'multiplayer' && firebase && gameRoom) {
              const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
              await firebase.update(gameRef, {
                flippedCards: [],
                currentTurn: (currentTurn + 1) % gamePlayers.length
              });
            } else {
              setFlippedCards([]);
              playSound('miss');
            }
          }
        }, 1500);
      }
    }
  }, [flippedCards, cards, matchedCards, gameMode, currentTurn, gamePlayers, gameScores, firebase, gameRoom, playerInfo.id, awardStudentXP, studentData]);

  // Play sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    
    try {
      const audio = new Audio(`/sounds/${type === 'match' ? 'success' : 'click'}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(e => {});
    } catch (e) {}
  };

  // Ready up for multiplayer
  const toggleReady = async () => {
    if (!firebase || !gameRoom) return;
    
    const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
    const currentPlayer = gamePlayers.find(p => p.id === playerInfo.id);
    await firebase.update(gameRef, {
      [`players/${playerInfo.id}/ready`]: !currentPlayer?.ready
    });
  };

  // Start multiplayer game when all ready
  const startMultiplayerGame = async () => {
    if (!firebase || !gameRoom) return;
    
    const gameRef = firebase.ref(firebase.database, `memory_game/${gameRoom}`);
    const newCards = generateCards();
    
    await firebase.update(gameRef, {
      phase: 'playing',
      cards: newCards,
      flippedCards: [],
      matchedCards: [],
      currentTurn: 0
    });
  };

  // Reset game
  const resetGame = () => {
    setGameMode('menu');
    setGameRoom(null);
    setRoomCode('');
    setJoinCode('');
    setPlayerId(null);
    setGameData(null);
    setCards([]);
    setFlippedCards([]);
    setMatchedCards([]);
    setCurrentTurn(0);
    setGamePlayers([]);
    setGameScores({});
    setGameStarted(false);
    setWinner(null);
    setTotalMatches(0);
  };

  // Render card
  const renderCard = (card, index) => {
    const isFlipped = flippedCards.includes(index) || card.isMatched;
    const { rows, cols } = BOARD_SIZES[boardSize];
    
    let emojiSize = 'text-4xl';
    if (cols <= 4) {
      emojiSize = 'text-5xl';
    } else if (cols === 5) {
      emojiSize = 'text-3xl';
    } else {
      emojiSize = 'text-2xl';
    }
    
    let textSize = 'text-lg';
    if (cols <= 4) {
      textSize = card.content.length > 8 ? 'text-base' : 'text-xl';
    } else if (cols === 5) {
      textSize = card.content.length > 8 ? 'text-sm' : 'text-lg';
    } else {
      textSize = card.content.length > 8 ? 'text-xs' : 'text-base';
    }
    
    const isEmoji = card.content.length <= 2 || /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(card.content);
    
    return (
      <div
        key={card.id}
        onClick={() => flipCard(index)}
        className={`
          aspect-square border-2 rounded-xl transition-all duration-300 transform
          hover:scale-105 active:scale-95 flex items-center justify-center text-center p-3
          ${isFlipped 
            ? card.isMatched 
              ? 'bg-green-100 border-green-400 text-green-800' 
              : 'bg-blue-100 border-blue-400 text-blue-800'
            : 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-300 text-white hover:from-purple-500 hover:to-pink-600'
          }
          ${card.isMatched ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
          font-bold
        `}
      >
        {isFlipped ? (
          <div className={`leading-tight text-center max-w-full overflow-hidden ${isEmoji ? emojiSize : textSize}`}>
            {card.content}
          </div>
        ) : (
          <div className="text-4xl">🧩</div>
        )}
      </div>
    );
  };

  // Loading state
  if (connectionStatus === 'connecting') {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Memory Masters...</p>
      </div>
    );
  }

  // Custom Theme Editor Modal
  if (showCustomEditor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Create Custom Theme</h2>
              <button
                onClick={() => setShowCustomEditor(false)}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Create your own matching pairs! Add questions/words on the left and their matches on the right.
              </p>
              
              {customPairs.map((pair, index) => (
                <div key={index} className="flex space-x-2 items-center">
                  <input
                    type="text"
                    value={pair[0]}
                    onChange={(e) => {
                      const newPairs = [...customPairs];
                      newPairs[index][0] = e.target.value;
                      setCustomPairs(newPairs);
                    }}
                    placeholder="Question/Word"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-purple-500 font-bold">↔</span>
                  <input
                    type="text"
                    value={pair[1]}
                    onChange={(e) => {
                      const newPairs = [...customPairs];
                      newPairs[index][1] = e.target.value;
                      setCustomPairs(newPairs);
                    }}
                    placeholder="Answer/Match"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      const newPairs = customPairs.filter((_, i) => i !== index);
                      setCustomPairs(newPairs);
                    }}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => setCustomPairs([...customPairs, ['', '']])}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 font-semibold"
              >
                + Add Pair
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCustomEditor(false)}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const validPairs = customPairs.filter(pair => pair[0].trim() && pair[1].trim());
                  if (validPairs.length < 3) {
                    showToast('Please add at least 3 complete pairs', 'warning');
                    return;
                  }
                  setCustomPairs(validPairs);
                  setSelectedTheme('custom');
                  setShowCustomEditor(false);
                  showToast(`Custom theme created with ${validPairs.length} pairs!`, 'success');
                }}
                className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600"
              >
                Save Theme
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Menu state
  if (gameMode === 'menu') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Memory Masters
          </h2>
          <p className="text-gray-600">Match educational content and challenge your memory!</p>
          {studentData && (
            <p className="text-sm text-blue-600 mt-2">
              Playing as: {studentData.firstName} • Level {Math.floor((studentData.totalPoints || 0) / 100) + 1}
            </p>
          )}
        </div>

        {/* Theme Selection */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Choose Your Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PRESET_THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setSelectedTheme(key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTheme === key 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-white text-sm mb-2 bg-gradient-to-r ${theme.color}`}>
                  {theme.name}
                </div>
                <p className="text-gray-600 text-sm">{theme.description}</p>
              </button>
            ))}
            
            <button
              onClick={() => setShowCustomEditor(true)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedTheme === 'custom' 
                  ? 'border-purple-400 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="inline-block px-3 py-1 rounded-full text-white text-sm mb-2 bg-gradient-to-r from-gray-500 to-gray-600">
                Custom Theme
              </div>
              <p className="text-gray-600 text-sm">Create your own matching pairs</p>
            </button>
          </div>
        </div>

        {/* Board Size Selection */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold mb-4">Board Size</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(BOARD_SIZES).map(([key, size]) => (
              <button
                key={key}
                onClick={() => setBoardSize(key)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  boardSize === key 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-lg">{size.name}</div>
                <div className="text-gray-600 text-sm">{size.pairs} pairs</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Single Player</h3>
            <p className="text-gray-600 mb-4">Practice your memory skills and earn XP!</p>
            <button
              onClick={startSinglePlayer}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Start Solo Game
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4">Multiplayer</h3>
            <p className="text-gray-600 mb-4">Challenge up to 3 classmates!</p>
            
            {!classData?.classCode ? (
              <div className="text-center py-4 bg-orange-50 rounded-lg">
                <p className="text-orange-600 text-sm">Class code required for multiplayer</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={createMultiplayerGame}
                  disabled={loading || !firebaseReady}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter game code"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center font-mono tracking-wider"
                  maxLength="6"
                />
                <button
                  onClick={joinMultiplayerGame}
                  disabled={loading || !joinCode.trim() || !firebaseReady}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join Game'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multiplayer waiting room
  if (gameMode === 'multiplayer' && !gameStarted) {
    const allPlayersReady = gamePlayers.length > 1 && gamePlayers.every(p => p.ready);
    const isHost = playerInfo.id === gameData?.host;
    
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Game Lobby</h2>
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="text-gray-600 mb-2">Share this code with classmates:</p>
            <div className="font-mono text-3xl font-bold tracking-wider text-purple-600">
              {roomCode}
            </div>
          </div>
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(roomCode);
              showToast('Code copied!', 'success');
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 mb-6"
          >
            Copy Code
          </button>

          {/* Players List */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {gamePlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl border-2 ${
                  player.ready ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${player.color || getPlayerColor(index)} mx-auto mb-2`}></div>
                <div className="font-semibold">{player.name}</div>
                <div className="text-sm text-gray-600">
                  {player.ready ? '✅ Ready' : '⏳ Not Ready'}
                </div>
                {player.id === gameData?.host && (
                  <div className="text-xs text-purple-600 font-semibold">HOST</div>
                )}
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: 4 - gamePlayers.length }, (_, i) => (
              <div key={`empty-${i}`} className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gray-300 mx-auto mb-2"></div>
                <div className="text-gray-500">Waiting...</div>
              </div>
            ))}
          </div>

          {/* Game Settings */}
          <div className="bg-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Game Settings</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Theme: {PRESET_THEMES[gameData?.settings?.theme]?.name || 'Custom'}</div>
              <div>Board Size: {BOARD_SIZES[gameData?.settings?.boardSize]?.name}</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
            >
              Leave Game
            </button>
            <button
              onClick={toggleReady}
              className={`flex-1 py-3 rounded-lg font-semibold ${
                gamePlayers.find(p => p.id === playerInfo.id)?.ready
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {gamePlayers.find(p => p.id === playerInfo.id)?.ready ? 'Not Ready' : 'Ready Up!'}
            </button>
            {isHost && allPlayersReady && (
              <button
                onClick={startMultiplayerGame}
                className="flex-1 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 font-semibold animate-pulse"
              >
                Start Game!
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single player game
  if (gameMode === 'single') {
    const { rows, cols } = BOARD_SIZES[boardSize];
    const progress = cards.length > 0 ? (matchedCards.length / cards.length) * 100 : 0;
    
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Game Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetGame}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                ← Menu
              </button>
              <div>
                <h2 className="text-2xl font-bold">Memory Masters</h2>
                <p className="text-gray-600">
                  {PRESET_THEMES[selectedTheme]?.name || 'Custom Theme'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {gameScores[playerInfo.id] || 0} matches
              </div>
              <div className="text-gray-600">
                {matchedCards.length / 2} / {cards.length / 2}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div 
            className="grid gap-3 mx-auto max-w-2xl"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cards.map((card, index) => renderCard(card, index))}
          </div>
        </div>

        {/* Winner Modal */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-4">
                You found all {cards.length / 2} matches!
              </p>
              <div className="text-4xl font-bold text-purple-600 mb-6">
                {gameScores[playerInfo.id]} points
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  New Game
                </button>
                <button
                  onClick={() => {
                    setWinner(null);
                    startSinglePlayer();
                  }}
                  className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multiplayer game
  if (gameMode === 'multiplayer' && gameStarted) {
    const { rows, cols } = BOARD_SIZES[gameData?.settings?.boardSize || boardSize];
    const currentPlayer = gamePlayers[currentTurn];
    const isMyTurn = currentPlayer?.id === playerInfo.id;
    const progress = cards.length > 0 ? (matchedCards.length / cards.length) * 100 : 0;
    
    return (
      <div className="max-w-4xl mx-auto space-y-4 p-4">
        {/* Game Header */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={resetGame}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                ← Leave
              </button>
              <div>
                <h2 className="text-2xl font-bold">Memory Masters</h2>
                <p className="text-gray-600">Room: {roomCode}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              isMyTurn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isMyTurn ? '🎯 Your Turn!' : `🔄 ${currentPlayer?.name}'s Turn`}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Player Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gamePlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-3 rounded-lg text-center ${
                  currentTurn === index 
                    ? 'bg-purple-100 border-2 border-purple-400' 
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${player.color || getPlayerColor(index)} mx-auto mb-1`}></div>
                <div className="font-semibold text-sm">{player.name}</div>
                <div className="text-2xl font-bold text-purple-600">
                  {gameScores[player.id] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div 
            className="grid gap-3 mx-auto max-w-3xl"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cards.map((card, index) => renderCard(card, index))}
          </div>
        </div>

        {/* Winner Modal */}
        {winner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center max-w-md">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold mb-2">
                {winner === playerInfo.id ? 'You Won!' : `${gamePlayers.find(p => p.id === winner)?.name} Wins!`}
              </h2>
              
              {/* Game Results */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-3">Game Results</h3>
                <div className="space-y-2">
                  {gamePlayers
                    .sort((a, b) => (gameScores[b.id] || 0) - (gameScores[a.id] || 0))
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'}</span>
                          <span className={player.id === winner ? 'font-bold' : ''}>
                            {player.name}
                          </span>
                        </div>
                        <span className="font-bold">{gameScores[player.id] || 0} matches</span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Leave Game
                </button>
                <button
                  onClick={() => {
                    setWinner(null);
                    setGameStarted(false);
                    setCards([]);
                    setMatchedCards([]);
                    setFlippedCards([]);
                    setGameScores({});
                  }}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
                >
                  🔄 Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default EducationalMemoryGame;