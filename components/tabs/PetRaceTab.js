// components/tabs/PetRaceTab.js - REBUILT PET RACE SYSTEM WITH SMOOTH ANIMATION AND ENGAGING DESIGN
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
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);

  // Track and Animation Refs
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);

  // Filter students with valid pets
  const studentsWithPets = students.filter(student => {
    const firstPet = student.ownedPets?.[0];
    return firstPet && firstPet.name && firstPet.name.trim().length > 0;
  });

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

  // Pet Selection Handler
  const togglePetSelection = (studentId) => {
    setSelectedPets(prev => {
      if (prev.includes(studentId)) return prev.filter(id => id !== studentId);
      if (prev.length < 5) return [...prev, studentId];
      showToast('Maximum 5 pets can race at once!', 'warning');
      return prev;
    });
  };

  // Prize Setup Handler
  const handlePrizeSetup = () => {
    if (selectedPets.length < 2) {
      showToast('Select at least 2 pets to race!', 'warning');
      return;
    }
    setRacePhase('prize');
  };

  // Get Pet Image with Fallback
  const getPetImage = (student) => {
    const pet = student.ownedPets?.[0];
    if (!pet) return '/Pets/Wizard.png';
    if (pet.image) return pet.image;
    if (pet.path) return pet.path;
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

  // Start Race with Smooth Animation
  const startRace = () => {
    if (!prizeAmount || prizeAmount < 1) {
      showToast('Please set a valid prize amount!', 'warning');
      return;
    }

    const validSelectedPets = selectedPets.filter(petId => 
      studentsWithPets.some(s => s.id === petId && s.ownedPets?.[0])
    );

    if (validSelectedPets.length < 2) {
      showToast('Some selected pets are no longer available. Please reselect.', 'error');
      setSelectedPets(validSelectedPets);
      return;
    }

    setRacePhase('racing');
    setIsRacing(true);
    setRaceProgress(0);
    setRaceWinner(null);

    const raceData = {};
    const initialPositions = {};
    validSelectedPets.forEach(petId => {
      initialPositions[petId] = 0;
      raceData[petId] = {
        speed: 0.2 + Math.random() * 0.3, // Slower base speed with variance
        position: 0,
        finished: false,
      };
    });

    setRacePositions(initialPositions);
    animationRef.current = requestAnimationFrame(() => runSmoothRace(validSelectedPets));
    showToast('🏁 Race Started! Go pets go!', 'success');
  };

  // Smooth Race Animation with Easing
  const runSmoothRace = (racingPets) => {
    const startTime = performance.now();
    const raceDuration = 15000 + Math.random() * 5000; // 15-20 seconds for excitement
    const finishLine = trackWidth * 0.95; // 95% of track width
    let winner = null;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / raceDuration, 1);
      const easedProgress = progress < 1 ? progress * progress : 1; // Quadratic ease-out

      setRaceProgress(easedProgress);

      const newPositions = {};
      let maxPosition = 0;
      let leadingPetId = null;

      racingPets.forEach(petId => {
        const student = studentsWithPets.find(s => s.id === petId);
        if (!student || !student.ownedPets?.[0]) return;

        const raceData = raceDataRef.current[petId] || { speed: 0.2 + Math.random() * 0.3, position: 0, finished: false };
        const position = easedProgress * raceData.speed * finishLine;

        if (!raceDataRef.current[petId]) raceDataRef.current[petId] = raceData;

        if (position >= finishLine && !winner) {
          winner = student;
          raceData.finished = true;
        }

        newPositions[petId] = Math.min(position, finishLine); // Cap at finish line
        if (position > maxPosition && !winner) {
          maxPosition = position;
          leadingPetId = petId;
        }
      });

      setRacePositions(newPositions);

      if (progress < 1 && !winner) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (!winner && leadingPetId) winner = studentsWithPets.find(s => s.id === leadingPetId);
        if (winner) setTimeout(() => finishRace(winner), 1000); // 1-second delay for drama
        else setTimeout(() => finishRace(studentsWithPets[Math.floor(Math.random() * studentsWithPets.length)]), 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Finish Race and Award Prize
  const finishRace = (winner) => {
    setIsRacing(false);
    setRaceWinner(winner);
    setRacePhase('finished');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const winnerPet = winner.ownedPets?.[0];
    if (winnerPet) {
      const updatedOwnedPets = [...(winner.ownedPets || [])];
      updatedOwnedPets[0] = {
        ...winnerPet,
        wins: (winnerPet.wins || 0) + 1
      };

      const updatedWinnerData = { ownedPets: updatedOwnedPets };
      if (prizeType === 'xp') {
        updatedWinnerData.totalPoints = (winner.totalPoints || 0) + prizeAmount;
      } else if (prizeType === 'coins') {
        updatedWinnerData.currency = (winner.currency || 0) + prizeAmount;
      }

      updateStudent(winner.id, updatedWinnerData);
    }

    showToast(`🎉 ${winner.firstName} wins with ${winnerPet?.name || 'their pet'}! Prize awarded!`, 'success');
  };

  // Reset Race
  const resetRace = () => {
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

  // Get Prize Description
  const getPrizeDescription = () => {
    if (prizeType === 'xp') return `${prizeAmount} XP Points`;
    if (prizeType === 'coins') return `${prizeAmount} Coins`;
    return customPrize || 'Custom Reward';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="mr-4 animate-bounce">🏁</span>
            Pet Race Championship
            <span className="ml-4 animate-bounce">🏆</span>
          </h2>
          <p className="text-xl opacity-90">Watch your pets race for glory and prizes!</p>
        </div>
        <div className="absolute top-4 left-4 text-3xl animate-pulse" style={{ animationDelay: '0.5s' }}>🐾</div>
        <div className="absolute bottom-4 right-4 text-3xl animate-pulse" style={{ animationDelay: '1s' }}>🎉</div>
      </div>

      {/* No Pets Available */}
      {studentsWithPets.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-8xl mb-6 animate-bounce">🐾</div>
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
                        } animate-pulse`}
                        onError={(e) => { e.target.src = '/Pets/Wizard.png'; }}
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
            <div className="mt-4 w-full bg-white bg-opacity-20 rounded-full h-4">
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
            className="relative bg-gradient-to-b from-green-200 via-green-100 to-emerald-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-xl"
            style={{ height: `${selectedPets.length * 120 + 60}px`, minHeight: '400px' }}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-[url('/images/grass-pattern.png')] bg-repeat opacity-30 animate-pan-left"></div>

            {/* Track Lanes */}
            {selectedPets.map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b-2 border-gray-300 ${index % 2 === 0 ? 'bg-white bg-opacity-10' : 'bg-emerald-50 bg-opacity-20'}`}
                style={{ top: `${index * 120 + 30}px`, height: '120px' }}
              />
            ))}

            {/* Start Line */}
            <div className="absolute top-0 bottom-0 left-6 w-6 bg-green-600 rounded-l-lg shadow-lg z-10">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-sm font-bold text-green-800">
                START
              </div>
            </div>

            {/* Progress Markers */}
            {[0.25, 0.5, 0.75].map((percent, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-1 bg-gray-400 opacity-60"
                style={{ left: `${20 + (trackWidth * 0.95 * percent)}px` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs text-gray-700">
                  {Math.round(percent * 100)}%
                </div>
              </div>
            ))}

            {/* Finish Line */}
            <div 
              className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-red-500 via-white to-red-500 rounded-r-lg shadow-lg z-10"
              style={{ left: `${trackWidth * 0.95 + 20}px` }}
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-sm font-bold text-red-800">
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
                  className="absolute flex items-center space-x-4 z-20 transition-all duration-200 ease-out"
                  style={{
                    top: `${index * 120 + 90}px`,
                    left: `${30 + position}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <img 
                    src={getPetImage(student)}
                    alt={pet.name}
                    className={`w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover animate-run ${
                      raceWinner && raceWinner.id === petId ? 'border-yellow-400 animate-winner' : ''
                    }`}
                    style={{ animationDuration: '0.6s' }}
                    onError={(e) => { e.target.src = '/Pets/Wizard.png'; }}
                  />
                  <div className="bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold min-w-0 flex items-center">
                    <span className="truncate mr-2">{student.firstName}</span>
                    <span className="text-xs text-gray-500 truncate">({pet.name})</span>
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
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white rounded-xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/confetti.png')] bg-repeat opacity-20 animate-spin-slow"></div>
            <div className="relative z-10">
              <div className="text-8xl mb-4 animate-bounce">🏆</div>
              <h3 className="text-4xl font-bold mb-4">🎉 RACE COMPLETE! 🎉</h3>
              <div className="text-2xl mb-4">
                <strong>{raceWinner.firstName}</strong> wins with <strong>{raceWinner.ownedPets[0]?.name || 'their pet'}!</strong>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4 text-xl font-semibold">
                Prize Awarded: {getPrizeDescription()}
              </div>
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
                        className="w-14 h-14 rounded-full border-3 border-purple-300 shadow-lg object-cover animate-pulse"
                        onError={(e) => { e.target.src = '/Pets/Wizard.png'; }}
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

// CSS Animations
const styles = `
  @keyframes run {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  @keyframes winner {
    0%, 100% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.2) rotate(10deg); }
  }
  @keyframes pan-left {
    from { background-position: 0 0; }
    to { background-position: -200px 0; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-run { animation: run 0.6s infinite; }
  .animate-winner { animation: winner 1s infinite; }
  .animate-pan-left { animation: pan-left 10s infinite linear; }
  .animate-pulse { animation: pulse 2s infinite; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .animate-bounce { animation: bounce 1s infinite; }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-spin-slow { animation: spin-slow 10s linear infinite; }
`;

const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(styles);
document.adoptedStyleSheets = [styleSheet];

export default PetRaceTab;