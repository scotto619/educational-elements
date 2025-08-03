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
  const [raceWinner, setRaceWinner] = useState(null);
  const [isRacing, setIsRacing] = useState(false);
  const [raceProgress, setRaceProgress] = useState(0);
  
  // Track and Animation
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const raceDataRef = useRef({});
  const [trackWidth, setTrackWidth] = useState(800);
  
  // Get students with pets (current pets only)
  const studentsWithPets = students.filter(student => {
    // Make sure student has a pet with proper image data
    return student.pet && 
           (student.pet.image || student.pet.path || student.pet.name) &&
           student.pet.name; // Must have a name
  });
  
  console.log('Students with valid pets:', studentsWithPets.map(s => ({
    name: s.firstName,
    pet: s.pet
  })));

  // Track resize handling
  useEffect(() => {
    const updateTrackWidth = () => {
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        setTrackWidth(rect.width - 160); // Account for padding and finish line
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

  // Get pet image with fallback
  const getPetImage = (pet) => {
    if (!pet) return '/Pets/Wizard.png';
    
    // Direct path first
    if (pet.image) return pet.image;
    if (pet.path) return pet.path;
    
    // Fallback based on pet name/type
    const petName = (pet.name || pet.type || 'wizard').toLowerCase();
    const petMap = {
      'wizard': '/Pets/Wizard.png',
      'knight': '/Pets/Knight.png',
      'rogue': '/Pets/Rogue.png',
      'barbarian': '/Pets/Barbarian.png',
      'cleric': '/Pets/Cleric.png',
      'alchemist': '/Pets/Alchemist.png',
      'bard': '/Pets/Bard.png',
      'monk': '/Pets/Monk.png',
      'engineer': '/Pets/Engineer.png',
      'necromancer': '/Pets/Necromancer.png'
    };
    
    return petMap[petName] || '/Pets/Wizard.png';
  };

  // Start Race with Smooth Animation
  const startRace = () => {
    if (!prizeAmount || prizeAmount < 1) {
      showToast('Please set a valid prize amount!', 'warning');
      return;
    }
    
    // Validate selected pets still exist
    const validSelectedPets = selectedPets.filter(petId => {
      const student = studentsWithPets.find(s => s.id === petId);
      return student && student.pet;
    });
    
    if (validSelectedPets.length < 2) {
      showToast('Some selected pets are no longer available. Please reselect.', 'error');
      setSelectedPets(validSelectedPets);
      return;
    }
    
    setRacePhase('racing');
    setIsRacing(true);
    setRaceProgress(0);
    setRaceWinner(null);
    
    // Initialize race data
    const raceData = {};
    const initialPositions = {};
    
    validSelectedPets.forEach(petId => {
      initialPositions[petId] = 0;
      raceData[petId] = {
        speed: 0.5 + Math.random() * 1.0, // Random speed between 0.5 and 1.5
        position: 0,
        finished: false
      };
    });
    
    setRacePositions(initialPositions);
    raceDataRef.current = raceData;
    
    // Start smooth animation
    runSmoothRace(validSelectedPets);
    showToast('🏁 Race Started! Go pets go!', 'success');
  };

  // Smooth Race Animation using requestAnimationFrame
  const runSmoothRace = (racingPets) => {
    const startTime = Date.now();
    const raceDuration = 6000; // 6 seconds
    const finishLine = trackWidth * 0.85; // 85% of track width
    let winner = null;
    let raceCompleted = false;
    
    const animate = () => {
      if (raceCompleted) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / raceDuration, 1);
      
      setRaceProgress(progress);
      
      const newPositions = {};
      let maxPosition = 0;
      let leadingPet = null;
      
      racingPets.forEach(petId => {
        const raceData = raceDataRef.current[petId];
        if (!raceData || raceData.finished) return;
        
        // Add some randomness to make it exciting
        const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
        const basePosition = progress * raceData.speed * finishLine * randomFactor;
        
        // Ensure pets don't go past finish line until one wins
        const position = Math.min(basePosition, finishLine);
        newPositions[petId] = position;
        raceData.position = position;
        
        // Check if this pet crossed the finish line first
        if (position >= finishLine && !winner && !raceCompleted) {
          winner = students.find(s => s.id === petId);
          raceCompleted = true;
          raceData.finished = true;
          
          // Stop all other pets from advancing
          racingPets.forEach(id => {
            if (id !== petId) {
              raceDataRef.current[id].finished = true;
            }
          });
        }
        
        if (position > maxPosition) {
          maxPosition = position;
          leadingPet = students.find(s => s.id === petId);
        }
      });
      
      setRacePositions(newPositions);
      
      // Continue animation until race is complete or time is up
      if (!raceCompleted && progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Race finished
        if (!winner && leadingPet) {
          winner = leadingPet; // Fallback to leading pet if no clear winner
        }
        
        if (winner) {
          finishRace(winner);
        } else {
          // Fallback - pick random winner if something goes wrong
          const randomWinner = students.find(s => racingPets.includes(s.id));
          if (randomWinner) finishRace(randomWinner);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Finish Race and Award Prize
  const finishRace = (winner) => {
    setIsRacing(false);
    setRaceWinner(winner);
    setRacePhase('finished');
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Update winner's pet wins
    const updatedWinnerData = {
      pet: {
        ...winner.pet,
        wins: (winner.pet.wins || 0) + 1
      }
    };
    
    // Award prize to winner
    if (prizeType === 'xp') {
      const currentXP = winner.xp?.[prizeCategory] || 0;
      updatedWinnerData.xp = {
        ...winner.xp,
        [prizeCategory]: currentXP + prizeAmount
      };
      updatedWinnerData.totalXP = (winner.totalXP || 0) + prizeAmount;
      updatedWinnerData.totalPoints = (winner.totalPoints || 0) + prizeAmount;
    } else if (prizeType === 'coins') {
      updatedWinnerData.coins = (winner.coins || 0) + prizeAmount;
      updatedWinnerData.currency = (winner.currency || 0) + prizeAmount;
    }
    
    // Update student in the system
    updateStudent(winner.id, updatedWinnerData);
    
    // Show celebration
    showToast(
      `🎉 ${winner.firstName} wins with ${winner.pet.name}! Prize awarded!`, 
      'success'
    );
  };

  // Reset Race
  const resetRace = () => {
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setRacePhase('setup');
    setSelectedPets([]);
    setRacePositions({});
    setRaceProgress(0);
    setRaceWinner(null);
    setIsRacing(false);
    setPrizeAmount(10);
    setCustomPrize('');
    raceDataRef.current = {};
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
          <p className="text-xl text-gray-500 mb-2">Students need pets to participate in races.</p>
          <p className="text-lg text-gray-500">Students can get pets by reaching 50 XP or purchasing them in the shop!</p>
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
                      src={getPetImage(student.pet)} 
                      alt={student.pet.name}
                      className={`w-16 h-16 rounded-full border-3 object-cover ${
                        selectedPets.includes(student.id) ? 'border-green-400' : 'border-gray-300'
                      }`}
                      onError={(e) => {
                        console.log(`Failed to load pet image for ${student.firstName}:`, student.pet);
                        e.target.src = '/Pets/Wizard.png';
                      }}
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
            <div className="mt-4 bg-white bg-opacity-20 rounded-full h-4">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-300"
                style={{ width: `${raceProgress * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Race Track */}
          <div 
            ref={trackRef}
            className="relative bg-gradient-to-r from-green-200 via-green-100 to-green-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-inner"
            style={{ height: `${selectedPets.length * 90 + 40}px`, minHeight: '250px' }}
          >
            {/* Track Lanes */}
            {selectedPets.map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b border-gray-300 ${
                  index % 2 === 0 ? 'bg-white bg-opacity-20' : 'bg-green-50 bg-opacity-40'
                }`}
                style={{
                  top: `${index * 90 + 20}px`,
                  height: '90px'
                }}
              />
            ))}

            {/* Start Line */}
            <div className="absolute top-0 bottom-0 left-8 w-4 bg-green-600 rounded shadow-lg">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded shadow text-sm font-bold text-green-800">
                START
              </div>
            </div>

            {/* Progress Markers */}
            {[0.25, 0.5, 0.75].map((percent, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-1 bg-gray-400 opacity-60"
                style={{ left: `${8 + (trackWidth * 0.85 * percent) + 32}px` }}
              />
            ))}

            {/* Finish Line */}
            <div 
              className="absolute top-0 bottom-0 w-4 bg-gradient-to-b from-red-500 via-white to-red-500 rounded shadow-lg z-10"
              style={{ left: `${trackWidth * 0.85 + 40}px` }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded shadow text-sm font-bold text-red-800">
                FINISH
              </div>
            </div>

            {/* Racing Pets */}
            {selectedPets.map((petId, index) => {
              const student = studentsWithPets.find(s => s.id === petId);
              if (!student) return null;
              
              const position = racePositions[petId] || 0;
              
              return (
                <div
                  key={petId}
                  className="absolute flex items-center space-x-3 z-20"
                  style={{
                    top: `${index * 90 + 50}px`,
                    left: `${40 + position}px`,
                    transform: 'translateY(-50%)',
                    transition: isRacing ? 'none' : 'left 0.3s ease-out'
                  }}
                >
                  <img 
                    src={getPetImage(student.pet)}
                    alt={student.pet.name}
                    className={`w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover ${
                      isRacing ? 'animate-bounce' : ''
                    }`}
                    style={{
                      animationDuration: isRacing ? '0.6s' : '0s'
                    }}
                    onError={(e) => {
                      e.target.src = '/Pets/Wizard.png';
                    }}
                  />
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold min-w-0">
                    <div className="truncate">{student.firstName}</div>
                    <div className="text-xs text-gray-500 truncate">{student.pet.name}</div>
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
                      src={getPetImage(student.pet)} 
                      alt={student.pet.name}
                      className="w-14 h-14 rounded-full border-3 border-purple-300 shadow-lg object-cover"
                      onError={(e) => {
                        e.target.src = '/Pets/Wizard.png';
                      }}
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