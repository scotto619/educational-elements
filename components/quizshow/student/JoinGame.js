// components/quizshow/student/JoinGame.js - STUDENT GAME JOIN INTERFACE
import React, { useState, useEffect } from 'react';
import { validateRoomCode, playQuizSound } from '../../../utils/quizShowHelpers';

const JoinGame = ({ 
  students, 
  onJoinGame, 
  onCancel, 
  getAvatarImage, 
  calculateAvatarLevel, 
  loading 
}) => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [customName, setCustomName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter code, 2: Select student/avatar
  const [error, setError] = useState('');

  // Auto-focus on room code input
  useEffect(() => {
    const input = document.getElementById('roomCodeInput');
    if (input) input.focus();
  }, []);

  const handleRoomCodeChange = (value) => {
    // Only allow numbers and limit to 6 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setRoomCode(cleaned);
    setError('');
  };

  const handleRoomCodeSubmit = (e) => {
    e.preventDefault();
    
    if (!validateRoomCode(roomCode)) {
      setError('Please enter a valid 6-digit room code');
      return;
    }
    
    setStep(2);
    playQuizSound('join');
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setUseCustomName(false);
    setCustomName('');
  };

  const handleJoinGame = () => {
    if (useCustomName && !customName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!useCustomName && !selectedStudent) {
      setError('Please select your character or enter a custom name');
      return;
    }

    let studentInfo;
    if (useCustomName) {
      studentInfo = {
        name: customName.trim(),
        studentId: null,
        avatar: {
          base: 'Wizard F',
          level: 1,
          image: getAvatarImage('Wizard F', 1)
        }
      };
    } else {
      const level = calculateAvatarLevel(selectedStudent.totalPoints || 0);
      studentInfo = {
        name: `${selectedStudent.firstName} ${selectedStudent.lastName || ''}`.trim(),
        studentId: selectedStudent.id,
        avatar: {
          base: selectedStudent.avatarBase || 'Wizard F',
          level: level,
          image: getAvatarImage(selectedStudent.avatarBase, level)
        }
      };
    }

    onJoinGame(roomCode, studentInfo);
  };

  const StudentCard = ({ student, isSelected, onClick }) => {
    const level = calculateAvatarLevel(student.totalPoints || 0);
    const avatarImage = getAvatarImage(student.avatarBase, level);
    
    return (
      <div 
        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-105 ${
          isSelected 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl scale-105' 
            : 'bg-white text-gray-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-purple-300'
        }`}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="relative mb-3">
            <img 
              src={avatarImage} 
              alt={`${student.firstName}'s avatar`}
              className="w-16 h-16 mx-auto rounded-full border-4 border-white shadow-lg"
            />
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isSelected ? 'bg-yellow-400 text-purple-800' : 'bg-purple-500 text-white'
            }`}>
              {level}
            </div>
          </div>
          <h3 className="font-bold text-lg">{student.firstName}</h3>
          <p className={`text-sm ${isSelected ? 'text-purple-100' : 'text-gray-600'}`}>
            Level {level} Champion
          </p>
          <p className={`text-xs mt-1 ${isSelected ? 'text-purple-200' : 'text-gray-500'}`}>
            {student.totalPoints || 0} XP
          </p>
        </div>
      </div>
    );
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Quiz Show!</h1>
            <p className="text-gray-600">Enter the room code to join the game</p>
          </div>

          {/* Room Code Form */}
          <form onSubmit={handleRoomCodeSubmit} className="space-y-6">
            <div>
              <label htmlFor="roomCodeInput" className="block text-sm font-semibold text-gray-700 mb-2">
                Room Code
              </label>
              <input
                id="roomCodeInput"
                type="text"
                value={roomCode}
                onChange={(e) => handleRoomCodeChange(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-4 text-2xl text-center font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ask your teacher for the 6-digit room code
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={roomCode.length !== 6}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">Choose Your Character!</h1>
            <p className="text-purple-100">Room Code: <span className="font-bold text-yellow-300">{roomCode}</span></p>
          </div>
        </div>

        {/* Character Selection */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Select Your Champion</h2>
              <button
                onClick={() => setStep(1)}
                className="text-purple-600 hover:text-purple-800 font-semibold"
              >
                ← Change Room Code
              </button>
            </div>
            <p className="text-gray-600">Choose your classroom champion avatar or enter a custom name</p>
          </div>

          {/* Toggle for custom name */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setUseCustomName(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  !useCustomName 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Use My Champion
              </button>
              <button
                onClick={() => setUseCustomName(true)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  useCustomName 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Custom Name
              </button>
            </div>
          </div>

          {useCustomName ? (
            /* Custom Name Input */
            <div className="space-y-6">
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your name here..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
                  maxLength={20}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will be shown to other players
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-6 max-w-xs mx-auto">
                  <img 
                    src={getAvatarImage('Wizard F', 1)} 
                    alt="Default avatar"
                    className="w-16 h-16 mx-auto rounded-full border-4 border-white shadow-lg mb-2"
                  />
                  <p className="font-semibold text-gray-700">Default Character</p>
                  <p className="text-sm text-gray-500">Level 1 Wizard</p>
                </div>
              </div>
            </div>
          ) : (
            /* Student Selection Grid */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  isSelected={selectedStudent?.id === student.id}
                  onClick={() => handleStudentSelect(student)}
                />
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-semibold">{error}</p>
            </div>
          )}

          {/* Join Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleJoinGame}
              disabled={loading || (!useCustomName && !selectedStudent) || (useCustomName && !customName.trim())}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Join Game!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Card */}
        {(selectedStudent || (useCustomName && customName.trim())) && (
          <div className="mt-6 max-w-sm mx-auto">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6 text-center shadow-xl">
              <h3 className="font-bold text-lg mb-2">Ready to Play!</h3>
              <div className="flex items-center justify-center space-x-3">
                <img 
                  src={useCustomName 
                    ? getAvatarImage('Wizard F', 1)
                    : getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints || 0))
                  }
                  alt="Selected avatar"
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <p className="font-semibold">
                    {useCustomName 
                      ? customName.trim() 
                      : `${selectedStudent.firstName} ${selectedStudent.lastName || ''}`.trim()
                    }
                  </p>
                  <p className="text-sm text-purple-100">
                    Level {useCustomName ? 1 : calculateAvatarLevel(selectedStudent.totalPoints || 0)} Champion
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGame;