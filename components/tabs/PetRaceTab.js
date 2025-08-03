// components/tabs/PetRaceTab.js - COMPLETELY FIXED PET RACE SYSTEM
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
  
  // FIXED: Get students with pets (from ownedPets array, not pet property)
  const studentsWithPets = students.filter(student => {
    // Check if student has any pets in ownedPets array
    const firstPet = student.ownedPets?.[0];
    return firstPet && firstPet.name; // Must have a pet with a name
  });
  
  console.log('Students with valid pets:', studentsWithPets.map(s => ({
    name: s.firstName,
    pet: s.ownedPets?.[0]
  })));

  // Track resize handling
  useEffect(() => {
    const updateTrackWidth = () => {
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        setTrackWidth(rect.width - 100); // Account for padding and finish line
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

  // FIXED: Get pet image with proper fallback using ownedPets
  const getPetImage = (student) => {
    const pet = student.ownedPets?.[0];
    if (!pet) return '/Pets/Wizard.png';
    
    // Direct path first (for shop pets)
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
      'necromancer': '/Pets/Necromancer.png',
      'beastmaster': '/Pets/Beastmaster.png',
      'crystal knight': '/Pets/Crystal Knight.png',
      'crystal sage': '/Pets/Crystal Sage.png',
      'frost mage': '/Pets/Frost Mage.png',
      'illusionist': '/Pets/Illusionist.png',
      'lightning': '/Pets/Lightning.png',
      'stealth': '/Pets/Stealth.png',
      'time knight': '/Pets/Time Knight.png',
      'warrior': '/Pets/Warrior.png',
      // Common pet type mappings
      'dragon': '/Pets/Lightning.png',
      'phoenix': '/Pets/Crystal Sage.png',
      'unicorn': '/Pets/Time Knight.png',
      'wolf': '/Pets/Warrior.png',
      'owl': '/Pets/Wizard.png',
      'cat': '/Pets/Rogue.png',
      'tiger': '/Pets/Barbarian.png',
      'bear': '/Pets/Beastmaster.png',
      'lion': '/Pets/Knight.png',
      'eagle': '/Pets/Stealth.png'
    };
    
    return petMap[petName] || '/Pets/Wizard.png';
  };

  // FIXED: Start Race with Proper Smooth Animation
  const startRace = () => {
    if (!prizeAmount || prizeAmount < 1) {
      showToast('Please set a valid prize amount!', 'warning');
      return;
    }
    
    // Validate selected pets still exist
    const validSelectedPets = selectedPets.filter(petId => {
      const student = studentsWithPets.find(s => s.id === petId);
      return student && student.ownedPets?.[0];
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
        speed: 0.3 + Math.random() * 0.4, // Random speed between 0.3 and 0.7 (slower)
        position: 0,
        finished: false,
        progress: 0
      };
    });
    
    setRacePositions(initialPositions);
    raceDataRef.current = raceData;
    
    // Start smooth animation
    runSmoothRace(validSelectedPets);
    showToast('🏁 Race Started! Go pets go!', 'success');
  };

  // FIXED: Smooth Race Animation with proper finish line
  const runSmoothRace = (racingPets) => {
    const startTime = Date.now();
    const raceDuration = 12000; // 12 seconds for slower, more exciting race
    const finishLine = trackWidth * 0.92; // FIXED: 92% instead of 85% to reach actual end
    let winner = null;
    let raceCompleted = false;
    
    const animate = () => {
      if (raceCompleted) return;
      
      const elapsed = Date.now() - startTime;
      const baseProgress = Math.min(elapsed / raceDuration, 1);
      
      setRaceProgress(baseProgress);
      
      const newPositions = {};
      let maxPosition = 0;
      let leadingPet = null;
      
      racingPets.forEach(petId => {
        const raceData = raceDataRef.current[petId];
        if (!raceData || raceData.finished) return;
        
        // Add gentle randomness and variance for exciting race
        const speedVariance = 0.85 + Math.random() * 0.3; // 0.85 to 1.15
        const progressWithVariance = baseProgress * raceData.speed * speedVariance;
        
        // Calculate position but don't let pets cross finish line until one wins
        let position = progressWithVariance * finishLine;
        
        // Add small random movements for liveliness
        position += Math.sin(elapsed * 0.01) * 2;
        
        // Ensure no negative positions
        position = Math.max(0, position);
        
        // Check if this pet crossed the finish line first
        if (position >= finishLine && !winner && !raceCompleted) {
          winner = students.find(s => s.id === petId);
          raceCompleted = true;
          raceData.finished = true;
          position = finishLine; // Set exactly at finish line
          
          // Stop all other pets from advancing past their current position
          racingPets.forEach(id => {
            if (id !== petId) {
              const otherData = raceDataRef.current[id];
              if (otherData) {
                otherData.finished = true;
                // Keep other pets slightly behind
                if (newPositions[id] >= finishLine) {
                  newPositions[id] = finishLine - 10;
                }
              }
            }
          });
        } else if (raceCompleted && petId !== winner?.id) {
          // Keep non-winners behind the finish line
          position = Math.min(position, finishLine - 5);
        }
        
        newPositions[petId] = position;
        raceData.position = position;
        
        if (position > maxPosition) {
          maxPosition = position;
          leadingPet = students.find(s => s.id === petId);
        }
      });
      
      setRacePositions(newPositions);
      
      // Continue animation until race is complete or max time is reached
      if (!raceCompleted && baseProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Race finished - ensure we have a winner
        if (!winner && leadingPet) {
          winner = leadingPet; // Fallback to leading pet
        }
        
        if (winner) {
          setTimeout(() => finishRace(winner), 500); // Small delay for dramatic effect
        } else {
          // Ultimate fallback - pick random winner
          const randomWinner = students.find(s => racingPets.includes(s.id));
          if (randomWinner) setTimeout(() => finishRace(randomWinner), 500);
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

  // FIXED: Finish Race and Award Prize (using proper pet structure)
  const finishRace = (winner) => {
    setIsRacing(false);
    setRaceWinner(winner);
    setRacePhase('finished');
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // FIXED: Update winner's pet wins (using ownedPets structure)
    const winnerPet = winner.ownedPets?.[0];
    if (winnerPet) {
      const updatedOwnedPets = [...(winner.ownedPets || [])];
      updatedOwnedPets[0] = {
        ...winnerPet,
        wins: (winnerPet.wins || 0) + 1
      };
      
      const updatedWinnerData = {
        ownedPets: updatedOwnedPets
      };
      
      // Award prize to winner
      if (prizeType === 'xp') {
        const currentPoints = winner.totalPoints || 0;
        updatedWinnerData.totalPoints = currentPoints + prizeAmount;
      } else if (prizeType === 'coins') {
        updatedWinnerData.currency = (winner.currency || 0) + prizeAmount;
      }
      
      // Update student in the system
      updateStudent(winner.id, updatedWinnerData);
    }
    
    // Show celebration
    showToast(
      `🎉 ${winner.firstName} wins with ${winnerPet?.name || 'their pet'}! Prize awarded!`, 
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
      return `${prizeAmount} XP Points`;
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
              {studentsWithPets.map(student => {
                const pet = student.ownedPets[0];
                return (
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
                        src={getPetImage(student)} 
                        alt={pet.name}
                        className={`w-16 h-16 rounded-full border-3 object-cover ${
                          selectedPets.includes(student.id) ? 'border-green-400' : 'border-gray-300'
                        }`}
                        onError={(e) => {
                          console.log(`Failed to load pet image for ${student.firstName}:`, pet);
                          e.target.src = '/Pets/Wizard.png';
                        }}
                      />
                      <div className="text-left">
                        <h4 className="font-bold text-lg text-gray-800">{student.firstName}</h4>
                        <p className="text-gray-600">{pet.name || 'Unnamed Pet'}</p>
                        <p className="text-sm text-gray-500">
                          🏆 {pet.wins || 0} wins
                        </p>
                      </div>
                      {selectedPets.includes(student.id) && (
                        <div className="ml-auto text-green-500 text-2xl">✓</div>
                      )}
                    </div>
                  </button>
                );
              })}
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
            <p className="text-sm mt-2 opacity-75">Race Progress: {Math.round(raceProgress * 100)}%</p>
          </div>

          {/* Race Track */}
          <div 
            ref={trackRef}
            className="relative bg-gradient-to-r from-green-200 via-green-100 to-green-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-inner"
            style={{ height: `${selectedPets.length * 100 + 40}px`, minHeight: '300px' }}
          >
            {/* Track Lanes */}
            {selectedPets.map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b border-gray-300 ${
                  index % 2 === 0 ? 'bg-white bg-opacity-20' : 'bg-green-50 bg-opacity-40'
                }`}
                style={{
                  top: `${index * 100 + 20}px`,
                  height: '100px'
                }}
              />
            ))}

            {/* Start Line */}
            <div className="absolute top-0 bottom-0 left-6 w-4 bg-green-600 rounded shadow-lg z-10">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded shadow text-sm font-bold text-green-800">
                START
              </div>
            </div>

            {/* Progress Markers */}
            {[0.25, 0.5, 0.75].map((percent, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-1 bg-gray-400 opacity-60"
                style={{ left: `${20 + (trackWidth * 0.92 * percent)}px` }}
              />
            ))}

            {/* FIXED: Finish Line at the actual end */}
            <div 
              className="absolute top-0 bottom-0 w-4 bg-gradient-to-b from-red-500 via-white to-red-500 rounded shadow-lg z-10"
              style={{ left: `${trackWidth * 0.92 + 20}px` }}
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
              const pet = student.ownedPets[0];
              
              return (
                <div
                  key={petId}
                  className="absolute flex items-center space-x-3 z-20 transition-all duration-100"
                  style={{
                    top: `${index * 100 + 70}px`,
                    left: `${30 + position}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <img 
                    src={getPetImage(student)}
                    alt={pet.name}
                    className={`w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover ${
                      isRacing ? 'animate-bounce' : ''
                    }`}
                    style={{
                      animationDuration: isRacing ? '0.8s' : '0s'
                    }}
                    onError={(e) => {
                      e.target.src = '/Pets/Wizard.png';
                    }}
                  />
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold min-w-0">
                    <div className="truncate">{student.firstName}</div>
                    <div className="text-xs text-gray-500 truncate">{pet.name}</div>
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
              <strong>{raceWinner.firstName}</strong> wins with <strong>{raceWinner.ownedPets[0]?.name || 'their pet'}!</strong>
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
              .filter(student => (student.ownedPets[0]?.wins || 0) > 0)
              .sort((a, b) => (b.ownedPets[0]?.wins || 0) - (a.ownedPets[0]?.wins || 0))
              .slice(0, 6)
              .map((student, index) => {
                const pet = student.ownedPets[0];
                return (
                  <div key={student.id} className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200 transform hover:scale-105 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏆'}
                      </div>
                      <img 
                        src={getPetImage(student)} 
                        alt={pet.name}
                        className="w-14 h-14 rounded-full border-3 border-purple-300 shadow-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/Pets/Wizard.png';
                        }}
                      />
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{student.firstName}</h4>
                        <p className="text-gray-600">{pet.name}</p>
                        <p className="text-purple-600 font-semibold">{pet.wins || 0} wins</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {studentsWithPets.filter(s => (s.ownedPets[0]?.wins || 0) > 0).length === 0 && (
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