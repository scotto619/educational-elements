// components/tabs/PetRaceTab.js - Completely Redesigned Pet Race System
import React, { useState, useEffect, useRef } from 'react';

const PetRaceTab = ({ 
  students, 
  updateStudent, 
  showToast 
}) => {
  // Race States
  const [racePhase, setRacePhase] = useState('setup'); // 'setup', 'prize', 'racing', 'finished'
  const [selectedPets, setSelectedPets] = useState([]);
  const [prizeType, setPrizeType] = useState('xp');
  const [prizeAmount, setPrizeAmount] = useState(10);
  const [prizeCategory, setPrizeCategory] = useState('Respectful');
  const [customPrize, setCustomPrize] = useState('');
  
  // Race Animation States
  const [racePositions, setRacePositions] = useState({});
  const [raceProgress, setRaceProgress] = useState(0);
  const [raceWinner, setRaceWinner] = useState(null);
  const [isRacing, setIsRacing] = useState(false);
  
  // Track Dimensions
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);
  
  // Get students with pets
  const studentsWithPets = students.filter(student => student.pet?.image);
  
  // Track resize handling
  useEffect(() => {
    const updateTrackWidth = () => {
      if (trackRef.current) {
        setTrackWidth(trackRef.current.offsetWidth - 120); // Account for padding and finish line
      }
    };
    
    updateTrackWidth();
    window.addEventListener('resize', updateTrackWidth);
    return () => window.removeEventListener('resize', updateTrackWidth);
  }, []);

  // Pet Selection Handlers
  const togglePetSelection = (studentId) => {
    setSelectedPets(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else if (prev.length < 5) { // Max 5 pets per race
        return [...prev, studentId];
      } else {
        showToast('Maximum 5 pets can race at once!', 'warning');
        return prev;
      }
    });
  };

  // Prize Setup Handlers
  const handlePrizeSetup = () => {
    if (selectedPets.length < 2) {
      showToast('Select at least 2 pets to race!', 'warning');
      return;
    }
    setRacePhase('prize');
  };

  // Start Race Handler
  const startRace = () => {
    if (!prizeAmount || prizeAmount < 1) {
      showToast('Please set a valid prize amount!', 'warning');
      return;
    }
    
    setRacePhase('racing');
    setIsRacing(true);
    setRaceProgress(0);
    setRaceWinner(null);
    
    // Initialize random positions and speeds for each pet
    const initialPositions = {};
    const speeds = {};
    
    selectedPets.forEach(petId => {
      initialPositions[petId] = 0;
      speeds[petId] = 0.8 + Math.random() * 0.4; // Random speed between 0.8 and 1.2
    });
    
    setRacePositions(initialPositions);
    
    // Run race animation
    runRaceAnimation(speeds);
    showToast('🏁 Race Started! Go pets go!', 'success');
  };

  // Race Animation System
  const runRaceAnimation = (speeds) => {
    let progress = 0;
    const animationDuration = 5000; // 5 seconds race
    const updateInterval = 50; // Update every 50ms
    const steps = animationDuration / updateInterval;
    
    const interval = setInterval(() => {
      progress += 1;
      setRaceProgress(progress / steps);
      
      setRacePositions(prev => {
        const newPositions = {};
        let winner = null;
        let maxPosition = 0;
        
        selectedPets.forEach(petId => {
          // Add some randomness to make race exciting
          const randomFactor = 0.95 + Math.random() * 0.1;
          const baseProgress = (progress / steps) * speeds[petId] * randomFactor;
          newPositions[petId] = Math.min(baseProgress * trackWidth * 0.85, trackWidth * 0.85);
          
          if (newPositions[petId] > maxPosition) {
            maxPosition = newPositions[petId];
            const student = students.find(s => s.id === petId);
            if (student) winner = student;
          }
        });
        
        return newPositions;
      });
      
      // Check if race is finished
      if (progress >= steps) {
        clearInterval(interval);
        setIsRacing(false);
        
        // Determine winner (pet with highest position)
        let winner = null;
        let maxPosition = 0;
        
        selectedPets.forEach(petId => {
          const position = racePositions[petId] || 0;
          if (position > maxPosition) {
            maxPosition = position;
            winner = students.find(s => s.id === petId);
          }
        });
        
        if (winner) {
          finishRace(winner);
        }
      }
    }, updateInterval);
  };

  // Finish Race and Award Prize
  const finishRace = (winner) => {
    setRaceWinner(winner);
    setRacePhase('finished');
    
    // Update winner's pet wins
    const updatedWinner = {
      ...winner,
      pet: {
        ...winner.pet,
        wins: (winner.pet.wins || 0) + 1
      }
    };
    
    // Award prize to winner
    let updatedStudent = { ...updatedWinner };
    
    if (prizeType === 'xp') {
      const currentXP = updatedStudent.xp?.[prizeCategory] || 0;
      updatedStudent.xp = {
        ...updatedStudent.xp,
        [prizeCategory]: currentXP + prizeAmount
      };
      updatedStudent.totalXP = (updatedStudent.totalXP || 0) + prizeAmount;
    } else if (prizeType === 'coins') {
      updatedStudent.coins = (updatedStudent.coins || 0) + prizeAmount;
    }
    
    // Update student in the system
    updateStudent(updatedStudent.id, updatedStudent);
    
    // Show celebration
    showToast(
      `🎉 ${winner.firstName} wins with ${winner.pet.name}! Prize awarded!`, 
      'success'
    );
  };

  // Reset Race
  const resetRace = () => {
    setRacePhase('setup');
    setSelectedPets([]);
    setRacePositions({});
    setRaceProgress(0);
    setRaceWinner(null);
    setIsRacing(false);
    setPrizeAmount(10);
    setCustomPrize('');
  };

  // Get prize description
  const getPrizeDescription = () => {
    if (prizeType === 'xp') {
      return `${prizeAmount} ${prizeCategory} XP`;
    } else if (prizeType === 'coins') {
      return `${prizeAmount} Coins`;
    } else {
      return customPrize || 'Custom Reward';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
          <span className="mr-4 animate-bounce">🏁</span>
          Pet Race Championship
          <span className="ml-4 animate-bounce">🏆</span>
        </h2>
        <p className="text-xl opacity-90">
          Fair and exciting pet races with random outcomes!
        </p>
      </div>

      {/* No Pets Available */}
      {studentsWithPets.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-8xl mb-6">🐾</div>
          <h3 className="text-3xl font-bold text-gray-600 mb-4">No Racing Pets Available!</h3>
          <p className="text-xl text-gray-500 mb-2">Students need to reach 50 total XP to unlock their pets.</p>
          <p className="text-lg text-gray-500">Award XP in the Students tab to help them get their companions!</p>
        </div>
      )}

      {/* Setup Phase - Pet Selection */}
      {studentsWithPets.length > 0 && racePhase === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              🎯 Select Racing Pets (2-5 pets)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentsWithPets.map(student => (
                <button
                  key={student.id}
                  onClick={() => togglePetSelection(student.id)}
                  className={`p-6 rounded-xl border-3 transition-all duration-300 transform hover:scale-105 ${
                    selectedPets.includes(student.id)
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={student.pet.image} 
                      alt={student.pet.name}
                      className={`w-16 h-16 rounded-full border-3 ${
                        selectedPets.includes(student.id) ? 'border-green-400' : 'border-gray-300'
                      }`}
                    />
                    <div className="text-left">
                      <h4 className="font-bold text-lg text-gray-800">{student.firstName}</h4>
                      <p className="text-gray-600">{student.pet.name || 'Unnamed Pet'}</p>
                      <p className="text-sm text-gray-500">
                        🏆 {student.pet.wins || 0} wins
                      </p>
                    </div>
                    {selectedPets.includes(student.id) && (
                      <div className="ml-auto text-green-500 text-2xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                Selected: {selectedPets.length}/5 pets
              </p>
              <button
                onClick={handlePrizeSetup}
                disabled={selectedPets.length < 2}
                className={`px-8 py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                  selectedPets.length >= 2
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: Set Prize 🎁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prize Setup Phase */}
      {racePhase === 'prize' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            🎁 Set Winner's Prize
          </h3>
          
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Prize Type Selection */}
            <div>
              <label className="block text-lg font-bold text-gray-700 mb-3">Prize Type:</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'xp', label: 'XP Points', icon: '⭐' },
                  { value: 'coins', label: 'Coins', icon: '💰' },
                  { value: 'custom', label: 'Custom Reward', icon: '🎁' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setPrizeType(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      prizeType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="font-semibold">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prize Details */}
            {prizeType === 'xp' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">XP Amount:</label>
                  <input
                    type="number"
                    value={prizeAmount}
                    onChange={(e) => setPrizeAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">XP Category:</label>
                  <select
                    value={prizeCategory}
                    onChange={(e) => setPrizeCategory(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  >
                    <option value="Respectful">Respectful</option>
                    <option value="Responsible">Responsible</option>
                    <option value="Learner">Learner</option>
                  </select>
                </div>
              </div>
            )}

            {prizeType === 'coins' && (
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Coin Amount:</label>
                <input
                  type="number"
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                  min="1"
                  max="100"
                />
              </div>
            )}

            {prizeType === 'custom' && (
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">Custom Reward Description:</label>
                <input
                  type="text"
                  value={customPrize}
                  onChange={(e) => setCustomPrize(e.target.value)}
                  placeholder="e.g., 'Extra 5 minutes of free time'"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                />
              </div>
            )}

            {/* Prize Preview */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-lg font-semibold text-yellow-800">
                🏆 Winner will receive: {getPrizeDescription()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setRacePhase('setup')}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
              >
                ← Back to Pet Selection
              </button>
              <button
                onClick={startRace}
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-xl transform hover:scale-105"
              >
                Start Race! 🏁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Racing Phase */}
      {racePhase === 'racing' && (
        <div className="space-y-6">
          {/* Race Status */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl p-6 text-center">
            <h3 className="text-3xl font-bold mb-2 animate-pulse">🏃‍♂️ RACE IN PROGRESS! 🏃‍♀️</h3>
            <p className="text-xl">Winner gets: {getPrizeDescription()}</p>
          </div>

          {/* Race Track */}
          <div 
            ref={trackRef}
            className="relative bg-gradient-to-r from-green-200 via-green-100 to-green-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-inner"
            style={{ height: `${selectedPets.length * 80 + 40}px`, minHeight: '200px' }}
          >
            {/* Track Lanes */}
            {selectedPets.map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b border-gray-300 ${
                  index % 2 === 0 ? 'bg-white bg-opacity-20' : 'bg-green-50 bg-opacity-40'
                }`}
                style={{
                  top: `${index * 80 + 20}px`,
                  height: '80px'
                }}
              />
            ))}

            {/* Start Line */}
            <div className="absolute top-0 bottom-0 left-4 w-3 bg-green-600 rounded">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold text-green-800">
                START
              </div>
            </div>

            {/* Finish Line */}
            <div 
              className="absolute top-0 bottom-0 w-4 bg-gradient-to-b from-red-500 via-white to-red-500 rounded"
              style={{ left: `${trackWidth * 0.85 + 20}px` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold text-red-800">
                FINISH
              </div>
            </div>

            {/* Racing Pets */}
            {selectedPets.map((petId, index) => {
              const student = students.find(s => s.id === petId);
              const position = racePositions[petId] || 0;
              
              return (
                <div
                  key={petId}
                  className="absolute flex items-center space-x-3 transition-all duration-100"
                  style={{
                    top: `${index * 80 + 40}px`,
                    left: `${20 + position}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <img 
                    src={student.pet.image}
                    alt={student.pet.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg animate-bounce"
                  />
                  <div className="bg-white px-3 py-1 rounded-lg shadow-lg text-sm font-bold">
                    {student.firstName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Finished Phase */}
      {racePhase === 'finished' && raceWinner && (
        <div className="space-y-6">
          {/* Winner Celebration */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white rounded-xl p-8 text-center">
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            <h3 className="text-4xl font-bold mb-4">🎉 RACE COMPLETE! 🎉</h3>
            <div className="text-2xl mb-4">
              <strong>{raceWinner.firstName}</strong> wins with <strong>{raceWinner.pet.name}!</strong>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-4 text-xl font-semibold">
              Prize Awarded: {getPrizeDescription()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetRace}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xl transform hover:scale-105"
            >
              🔄 New Race
            </button>
          </div>
        </div>
      )}

      {/* Pet Champions Leaderboard */}
      {studentsWithPets.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8">
          <h3 className="text-3xl font-bold text-center text-purple-800 mb-6 flex items-center justify-center">
            <span className="mr-3">🏅</span>
            Pet Champions Hall of Fame
            <span className="ml-3">🏅</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentsWithPets
              .filter(student => student.pet.wins > 0)
              .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
              .slice(0, 6)
              .map((student, index) => (
                <div key={student.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 transform hover:scale-105 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                    </div>
                    <img 
                      src={student.pet.image} 
                      alt={student.pet.name}
                      className="w-14 h-14 rounded-full border-3 border-purple-300 shadow-lg"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{student.firstName}</h4>
                      <p className="text-gray-600">{student.pet.name}</p>
                      <p className="text-purple-600 font-semibold">{student.pet.wins} wins</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {studentsWithPets.filter(s => s.pet.wins > 0).length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏁</div>
              <p className="text-gray-500 text-xl italic">No champions yet! Start racing to see winners here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PetRaceTab;