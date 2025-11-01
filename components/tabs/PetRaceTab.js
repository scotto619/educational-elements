// components/tabs/PetRaceTab.js - FIXED: pets now move (raceDataRef + animation loop)
// REBUILT PET RACE SYSTEM WITH CLIENT-SIDE CSS
'use client'; // Mark as client-side component

import React, { useEffect, useMemo, useRef, useState } from 'react';

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
  const [customPrize, setCustomPrize] = useState('');

  // Race Animation States
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [activeRacePets, setActiveRacePets] = useState([]);
  const [countdownValue, setCountdownValue] = useState(3);
  const [finishResults, setFinishResults] = useState([]);

  // Track and Animation Refs
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);

  // IMPORTANT: persistent race data ref (speeds, etc.)
  const raceDataRef = useRef({});
  const finishTimesRef = useRef({});

  // Filter students with valid pets
  const studentsWithPets = students.filter(student => {
    const firstPet = student.ownedPets?.[0];
    return firstPet && firstPet.name && firstPet.name.trim().length > 0;
  });

  const currentLeader = useMemo(() => {
    if (racePhase !== 'racing' || !activeRacePets.length) return null;

    let leaderId = null;
    let leaderPosition = -Infinity;

    activeRacePets.forEach(petId => {
      const position = racePositions[petId] ?? 0;
      if (position > leaderPosition) {
        leaderPosition = position;
        leaderId = petId;
      }
    });

    return studentsWithPets.find(student => student.id === leaderId) || null;
  }, [racePhase, activeRacePets, racePositions, studentsWithPets]);

  // Track resize handling
  useEffect(() => {
    const updateTrackWidth = () => {
      if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        setTrackWidth(Math.max(300, rect.width - 100)); // Account for padding and finish line
      }
    };
    updateTrackWidth();
    window.addEventListener('resize', updateTrackWidth);
    return () => window.removeEventListener('resize', updateTrackWidth);
  }, []);

  // Cleanup any running animation if the component unmounts
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
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

    setSelectedPets(validSelectedPets);

    const duration = 22000 + Math.random() * 5000;
    const finishLine = trackWidth * 0.9;

    raceDataRef.current = {
      meta: { duration, finishLine }
    };

    validSelectedPets.forEach(petId => {
      raceDataRef.current[petId] = {
        speed: 0.75 + Math.random() * 0.5
      };
    });

    const initialPositions = {};
    validSelectedPets.forEach(petId => { initialPositions[petId] = 0; });

    setActiveRacePets(validSelectedPets);
    setRacePositions(initialPositions);
    setRaceProgress(0);
    setRaceWinner(null);
    setFinishResults([]);
    finishTimesRef.current = {};
    setIsRacing(false);
    setRacePhase('countdown');
    setCountdownValue(3);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    showToast('🎬 Race starting! Get ready...', 'info');
  };

  // Smooth Race Animation with Easing (fixed to use raceDataRef)
  const runSmoothRace = (racingPets, startTime) => {
    const { duration = 20000, finishLine = trackWidth * 0.9 } = raceDataRef.current.meta || {};

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress < 1 ? (1 - Math.pow(1 - progress, 2)) : 1; // ease-out

      setRaceProgress(easedProgress);

      const newPositions = {};

      for (const petId of racingPets) {
        const student = studentsWithPets.find(s => s.id === petId);
        if (!student) continue;

        const data = raceDataRef.current[petId] || { speed: 1 };
        const wobble = Math.sin((elapsed / 250) + parseInt(petId, 36)) * 6;
        const rawPosition = easedProgress * data.speed * finishLine + wobble;
        const clampedPosition = Math.min(rawPosition, finishLine);

        newPositions[petId] = clampedPosition;

        if (!finishTimesRef.current[petId] && clampedPosition >= finishLine) {
          finishTimesRef.current[petId] = { time: elapsed, position: clampedPosition };
        }
      }

      setRacePositions(newPositions);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setTimeout(() => finishRace(duration), 800);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // Finish Race and Award Prize
  const finishRace = (totalDuration) => {
    setIsRacing(false);
    setRacePhase('finished');

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const finishLine = raceDataRef.current?.meta?.finishLine ?? trackWidth * 0.9;

    const results = activeRacePets.map(petId => {
      const student = studentsWithPets.find(s => s.id === petId);
      if (!student) return null;

      const finishInfo = finishTimesRef.current[petId];
      const finalPosition = racePositions[petId] ?? 0;
      const finishTime = finishInfo?.time ?? (totalDuration + Math.max(0, finishLine - finalPosition));

      return {
        id: petId,
        student,
        pet: student.ownedPets?.[0],
        finishTime,
        finalPosition
      };
    }).filter(Boolean).sort((a, b) => {
      if (a.finishTime !== b.finishTime) return a.finishTime - b.finishTime;
      return b.finalPosition - a.finalPosition;
    });

    setFinishResults(results);

    const winnerEntry = results[0] || null;
    setRaceWinner(winnerEntry?.student || null);

    if (winnerEntry?.student && winnerEntry.pet) {
      const winner = winnerEntry.student;
      const winnerPet = winnerEntry.pet;
      const updatedOwnedPets = [...(winner.ownedPets || [])];
      const petIndex = updatedOwnedPets.findIndex(p => p.id === winnerPet.id);

      if (petIndex >= 0) {
        updatedOwnedPets[petIndex] = {
          ...updatedOwnedPets[petIndex],
          wins: (updatedOwnedPets[petIndex].wins || 0) + 1
        };
      } else if (updatedOwnedPets.length > 0) {
        updatedOwnedPets[0] = {
          ...updatedOwnedPets[0],
          wins: (updatedOwnedPets[0].wins || 0) + 1
        };
      }

      const updatedWinnerData = { ownedPets: updatedOwnedPets };
      if (prizeType === 'xp') {
        updatedWinnerData.totalPoints = (winner.totalPoints || 0) + prizeAmount;
      } else if (prizeType === 'coins') {
        updatedWinnerData.currency = (winner.currency || 0) + prizeAmount;
      }

      updateStudent(winner.id, updatedWinnerData);
    }

    const summary = results.slice(0, 3).map((entry, index) => {
      const name = entry.student?.firstName || 'Unknown';
      return `${index + 1}. ${name}`;
    }).join(' • ');

    const winnerPetName = winnerEntry?.pet?.name || 'their pet';
    showToast(`🎉 ${winnerEntry?.student?.firstName || 'Winner'} wins with ${winnerPetName}!${summary ? ` Results: ${summary}` : ''}`, 'success');
  };

  useEffect(() => {
    if (racePhase !== 'countdown') return;

    setIsRacing(false);
    setCountdownValue(3);
    let value = 3;

    const interval = setInterval(() => {
      value -= 1;
      if (value <= 0) {
        setCountdownValue('GO!');
        clearInterval(interval);
        setTimeout(() => {
          if (activeRacePets.length < 2) {
            showToast('Not enough pets to race. Returning to setup.', 'warning');
            setRacePhase('setup');
            return;
          }

          setRacePhase('racing');
          setIsRacing(true);

          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          animationRef.current = requestAnimationFrame((t) => runSmoothRace(activeRacePets, t));
          showToast('🏁 Go! The pets are racing!', 'success');
        }, 700);
      } else {
        setCountdownValue(value);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [racePhase, activeRacePets, showToast]);

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
    setActiveRacePets([]);
    setFinishResults([]);
    setCountdownValue(3);
    setPrizeAmount(10);
    setCustomPrize('');
    raceDataRef.current = {};
    finishTimesRef.current = {};
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
                    className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedPets.includes(student.id)
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getPetImage(student)} 
                        alt={pet.name}
                        className={`w-16 h-16 rounded-full border-2 object-cover ${
                          selectedPets.includes(student.id) ? 'border-green-400' : 'border-gray-300'
                        } animate-pulse`}
                        onError={(e) => { e.currentTarget.src = '/Pets/Wizard.png'; }}
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

      {/* Countdown Phase */}
      {racePhase === 'countdown' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white rounded-xl p-6 text-center shadow-lg">
            <h3 className="text-3xl font-bold mb-2">Ready... Set...</h3>
            <p className="text-lg">Race begins in just a moment! Pump up your class and cheer on the pets!</p>
          </div>

          <div
            className="relative bg-gradient-to-b from-emerald-300 via-green-200 to-lime-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-2xl"
            style={{ height: `${Math.max(activeRacePets.length, 2) * 120 + 120}px`, minHeight: '420px' }}
          >
            <div className="absolute inset-0 bg-[url('/images/grass-pattern.png')] bg-repeat opacity-20 animate-pan-left"></div>
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-purple-900/70 via-purple-700/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-orange-500/70 via-orange-400/30 to-transparent pointer-events-none"></div>

            {activeRacePets.map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b-2 border-gray-300 ${index % 2 === 0 ? 'bg-white/20' : 'bg-emerald-200/30'}`}
                style={{ top: `${index * 120 + 60}px`, height: '120px' }}
              />
            ))}

            <div className="absolute top-0 bottom-0 left-6 w-6 bg-green-700 rounded-l-lg shadow-lg z-10"></div>
            <div
              className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-red-500 via-white to-red-500 rounded-r-lg shadow-lg"
              style={{ left: `${(raceDataRef.current?.meta?.finishLine || trackWidth * 0.9) + 20}px` }}
            ></div>

            {activeRacePets.map((petId, index) => {
              const student = studentsWithPets.find(s => s.id === petId);
              if (!student) return null;

              const pet = student.ownedPets[0];

              return (
                <div
                  key={petId}
                  className="absolute flex items-center space-x-4 z-20 transition-all"
                  style={{
                    top: `${index * 120 + 120}px`,
                    left: '50px'
                  }}
                >
                  <img
                    src={getPetImage(student)}
                    alt={pet.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => { e.currentTarget.src = '/Pets/Wizard.png'; }}
                  />
                  <div className="bg-white px-4 py-2 rounded-lg shadow text-sm font-bold min-w-0 flex items-center">
                    <span className="truncate mr-2">{student.firstName}</span>
                    <span className="text-xs text-gray-500 truncate">({pet.name})</span>
                  </div>
                </div>
              );
            })}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white bg-opacity-80 rounded-full px-10 py-6 shadow-2xl border-4 border-purple-400">
                <span className="text-5xl sm:text-6xl font-extrabold text-purple-600 animate-pulse">{countdownValue}</span>
              </div>
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

          {currentLeader && (
            <div className="bg-white border border-yellow-200 rounded-xl p-4 shadow-md text-center">
              <p className="text-xs uppercase text-yellow-500 tracking-widest">Current Leader</p>
              <p className="text-lg font-bold text-gray-800">
                {currentLeader.firstName} &amp; {currentLeader.ownedPets?.[0]?.name || 'Pet'}
              </p>
            </div>
          )}

          {/* Race Track */}
          <div
            ref={trackRef}
            className="relative bg-gradient-to-b from-green-200 via-green-100 to-emerald-200 border-4 border-gray-400 rounded-xl overflow-hidden shadow-xl"
            style={{ height: `${Math.max(activeRacePets.length, selectedPets.length) * 120 + 60}px`, minHeight: '420px' }}
          >
            <div className="absolute inset-0 bg-[url('/images/grass-pattern.png')] bg-repeat opacity-30 animate-pan-left"></div>
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-purple-900/70 via-purple-700/30 to-transparent pointer-events-none"></div>
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-orange-500/70 via-orange-400/30 to-transparent pointer-events-none"></div>

            {(activeRacePets.length ? activeRacePets : selectedPets).map((_, index) => (
              <div
                key={index}
                className={`absolute w-full border-b-2 border-gray-300 ${index % 2 === 0 ? 'bg-white/15' : 'bg-emerald-200/30'}`}
                style={{ top: `${index * 120 + 30}px`, height: '120px' }}
              />
            ))}

            <div className="absolute top-0 bottom-0 left-6 w-6 bg-green-700 rounded-l-lg shadow-lg z-10">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-sm font-bold text-green-800">
                START
              </div>
            </div>

            {[0.25, 0.5, 0.75].map((percent, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 w-1 bg-white/60"
                style={{ left: `${20 + ((raceDataRef.current?.meta?.finishLine || trackWidth * 0.9) * percent)}px` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded text-xs text-gray-700">
                  {Math.round(percent * 100)}%
                </div>
              </div>
            ))}

            <div
              className="absolute top-0 bottom-0 w-6 bg-gradient-to-r from-red-500 via-white to-red-500 rounded-r-lg shadow-lg z-10"
              style={{ left: `${(raceDataRef.current?.meta?.finishLine || trackWidth * 0.9) + 20}px` }}
            >
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow text-sm font-bold text-red-800">
                FINISH
              </div>
            </div>

            {(activeRacePets.length ? activeRacePets : selectedPets).map((petId, index) => {
              const student = studentsWithPets.find(s => s.id === petId);
              if (!student) return null;

              const position = racePositions[petId] || 0;
              const pet = student.ownedPets[0];

              return (
                <div
                  key={petId}
                  className="absolute flex items-center space-x-4 z-20 transition-transform duration-150 ease-out"
                  style={{
                    top: `${index * 120 + 90}px`,
                    left: `${30 + position}px`,
                    transform: 'translateY(-50%)'
                  }}
                >
                  <img 
                    src={getPetImage(student)}
                    alt={pet.name}
                    className={`w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover`}
                    onError={(e) => { e.currentTarget.src = '/Pets/Wizard.png'; }}
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
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <p className="text-xl">Prize: {getPrizeDescription()}</p>
              </div>
            </div>
          </div>

          {finishResults.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                🏅 Final Standings
              </h4>
              <ol className="space-y-2">
                {finishResults.map((result, index) => (
                  <li
                    key={result.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      index === 0
                        ? 'bg-yellow-50 border-yellow-200'
                        : index === 1
                        ? 'bg-gray-100 border-gray-200'
                        : index === 2
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-orange-600' : 'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{result.student?.firstName}</p>
                        <p className="text-xs text-gray-500">
                          {result.pet?.name || 'Pet'} • {(result.finishTime / 1000).toFixed(1)}s
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Final distance: {Math.round(result.finalPosition)}px</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={resetRace}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            >
              Set Up Another Race
            </button>
            <button
              onClick={() => setRacePhase('setup')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              New Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetRaceTab;
