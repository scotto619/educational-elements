// pages/join.js - STUDENT QUIZ SHOW JOIN PAGE (NO LOGIN REQUIRED)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { database } from '../utils/firebase';
import { ref, onValue, set } from 'firebase/database';
import { validateRoomCode, playQuizSound } from '../utils/quizShowHelpers';

const StudentJoinPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter code, 2: Select character, 3: In game
  const [roomCode, setRoomCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [playerId, setPlayerId] = useState(null);

  // Pre-fill room code from URL if present
  useEffect(() => {
    if (router.query.code) {
      setRoomCode(router.query.code);
    }
  }, [router.query.code]);

  // Listen for game updates when in game
  useEffect(() => {
    if (roomCode && step >= 2) {
      const gameRef = ref(database, `gameRooms/${roomCode}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setGameData(data);
          // Check if game started
          if (data.status === 'playing' && step === 2) {
            setStep(3);
          }
        } else if (step > 1) {
          // Game ended
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
  }, [roomCode, step]);

  const handleRoomCodeSubmit = async (e) => {
    e.preventDefault();
    if (!validateRoomCode(roomCode)) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if game exists
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
        studentId: selectedStudent?.id || null,
        avatar: selectedStudent ? {
          base: selectedStudent.avatarBase || 'Wizard F',
          level: calculateAvatarLevel(selectedStudent.totalPoints || 0),
          image: getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints || 0))
        } : {
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
      playQuizSound('join');
    } catch (error) {
      setError('Failed to join game. Please try again.');
    }
    setLoading(false);
  };

  // Helper functions (simplified versions)
  const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);
  const getAvatarImage = (avatarBase, level) => `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;

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
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Ask your teacher for the 6-digit room code
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Character Selection & Waiting
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">🎪 Quiz Show Lobby</h1>
            <p className="text-purple-100">Room: <span className="font-bold">{roomCode}</span></p>
            <p className="text-sm text-purple-200">{gameData?.quiz?.title}</p>
          </div>

          {/* Name Input */}
          {!playerId && (
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Enter Your Name</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  maxLength={20}
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
          )}

          {/* Waiting for Game */}
          {playerId && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">You're In!</h2>
              <p className="text-gray-600 mb-6">
                Waiting for your teacher to start the game...
              </p>
              
              {/* Show other players */}
              {gameData?.players && (
                <div className="text-left">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Players in game ({Object.keys(gameData.players).length}):
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
          )}
        </div>
      </div>
    );
  }

  // Step 3: Game Started
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-4xl font-bold mb-4">Game Started!</h1>
          <p className="text-xl">Look at the main screen and get ready to answer questions!</p>
        </div>
      </div>
    );
  }
};

export default StudentJoinPage;