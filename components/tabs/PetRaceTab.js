// PetRaceTab.js - Complete with Working Race Animation System
import React, { useRef, useEffect, useState } from 'react';

const PetRaceTab = ({
  students,
  raceInProgress,
  setRaceInProgress,
  raceFinished,
  setRaceFinished,
  racePositions,
  setRacePositions,
  raceWinner,
  setRaceWinner,
  selectedPrize,
  setSelectedPrize,
  prizeDetails,
  setPrizeDetails,
  selectedPets,
  setSelectedPets,
  showRaceSetup,
  setShowRaceSetup,
  calculateSpeed,
  awardRacePrize,
  showToast
}) => {
  const raceTrackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);
  const [raceInterval, setRaceInterval] = useState(null);

  // Calculate track dimensions on mount and resize
  useEffect(() => {
    const updateTrackDimensions = () => {
      if (raceTrackRef.current) {
        const rect = raceTrackRef.current.getBoundingClientRect();
        setTrackWidth(rect.width - 100); // Account for padding and finish line
      }
    };

    updateTrackDimensions();
    window.addEventListener('resize', updateTrackDimensions);
    return () => window.removeEventListener('resize', updateTrackDimensions);
  }, []);

  // Race animation system
  useEffect(() => {
    if (raceInProgress && selectedPets.length > 0 && !raceInterval) {
      console.log('Starting race animation...');
      
      // Initialize race positions
      const initialPositions = {};
      selectedPets.forEach(id => {
        initialPositions[id] = 0;
      });
      setRacePositions(initialPositions);

      // Start race animation
      const intervalId = setInterval(() => {
        setRacePositions(prev => {
          const newPositions = { ...prev };
          let raceComplete = false;
          let winner = null;
          const finishLinePosition = trackWidth * 0.85; // 85% of track width

          selectedPets.forEach(petId => {
            const student = students.find(s => s.id === petId);
            if (student?.pet && newPositions[petId] !== undefined) {
              const speed = calculateSpeed(student.pet);
              const movement = speed * 2 + (Math.random() * 1.5); // Add some randomness
              newPositions[petId] = Math.min(newPositions[petId] + movement, finishLinePosition);

              // Check if this pet wins
              if (newPositions[petId] >= finishLinePosition && !raceComplete) {
                raceComplete = true;
                winner = student;
              }
            }
          });

          if (raceComplete && winner) {
            console.log('Race completed! Winner:', winner.firstName);
            clearInterval(intervalId);
            setRaceInterval(null);
            setRaceInProgress(false);
            setRaceFinished(true);
            setRaceWinner(winner);
            
            // Award prize
            if (awardRacePrize) {
              awardRacePrize(winner);
            }
            
            // Update pet wins
            const updatedStudents = students.map(s => 
              s.id === winner.id && s.pet
                ? { ...s, pet: { ...s.pet, wins: (s.pet.wins || 0) + 1 } }
                : s
            );
          }

          return newPositions;
        });
      }, 100); // Update every 100ms for smooth animation

      setRaceInterval(intervalId);
    }

    // Cleanup interval on unmount or when race stops
    return () => {
      if (raceInterval) {
        clearInterval(raceInterval);
        setRaceInterval(null);
      }
    };
  }, [raceInProgress, selectedPets, trackWidth]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (raceInterval) {
        clearInterval(raceInterval);
      }
    };
  }, []);

  const resetRace = () => {
    setRaceInProgress(false);
    setRaceFinished(false);
    setRaceWinner(null);
    setRacePositions({});
    setSelectedPets([]);
    if (raceInterval) {
      clearInterval(raceInterval);
      setRaceInterval(null);
    }
  };

  const studentsWithPets = students.filter(s => s.pet?.image);

  return (
    <div className="animate-fade-in">
      <div className="text-center relative">
        <h2 className="text-4xl font-bold mb-8 text-gray-800 flex items-center justify-center">
          <span className="text-4xl mr-4 animate-bounce">🏁</span>
          Pet Race Championship
          <span className="text-4xl ml-4 animate-bounce">🐾</span>
        </h2>

        {/* Race Status Indicator */}
        {raceInProgress && (
          <div className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-3xl animate-bounce">🏃‍♂️</div>
              <span className="text-xl font-bold">RACE IN PROGRESS!</span>
              <div className="text-3xl animate-bounce">🏃‍♀️</div>
            </div>
          </div>
        )}

        {/* Quick Prize Settings - Only show when not racing */}
        {!raceInProgress && (
          <div className="flex items-center justify-center gap-8 mb-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl shadow-md">
            <div className="flex items-center gap-3">
              <label className="font-bold text-gray-700 text-lg">🎁 Quick Prize:</label>
              <select
                value={selectedPrize}
                onChange={(e) => setSelectedPrize(e.target.value)}
                className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-colors text-gray-900 font-medium bg-white shadow-sm text-lg"
              >
                <option value="xp">XP Points</option>
                <option value="coins">Bonus Coins</option>
                <option value="reward">Classroom Reward</option>
              </select>
            </div>

            {selectedPrize === 'xp' && (
              <div className="flex items-center gap-3">
                <label className="font-bold text-gray-700">Amount:</label>
                <input
                  type="number"
                  value={prizeDetails.amount || 5}
                  onChange={(e) => setPrizeDetails(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  className="w-20 px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-colors text-gray-900 font-medium bg-white shadow-sm text-center"
                  min="1"
                  max="100"
                />
                <select
                  value={prizeDetails.category || 'Respectful'}
                  onChange={(e) => setPrizeDetails(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-colors text-gray-900 font-medium bg-white shadow-sm"
                >
                  <option value="Respectful">Respectful</option>
                  <option value="Responsible">Responsible</option>
                  <option value="Learner">Learner</option>
                </select>
              </div>
            )}

            {selectedPrize === 'coins' && (
              <div className="flex items-center gap-3">
                <label className="font-bold text-gray-700">💰 Coins:</label>
                <input
                  type="number"
                  value={prizeDetails.amount || 10}
                  onChange={(e) => setPrizeDetails(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                  className="w-20 px-3 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 transition-colors text-gray-900 font-medium bg-white shadow-sm text-center"
                  min="1"
                  max="100"
                />
              </div>
            )}
          </div>
        )}

        {/* Race Control Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {!raceInProgress && !raceFinished && (
            <button
              onClick={() => setShowRaceSetup(true)}
              disabled={studentsWithPets.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
            >
              🏁 Setup New Race
            </button>
          )}

          {raceFinished && (
            <button
              onClick={resetRace}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-2xl hover:from-green-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
            >
              🔄 Reset Race
            </button>
          )}
        </div>

        {/* Race Track */}
        <div 
          ref={raceTrackRef}
          className="race-track-container relative h-80 border-4 border-gray-400 bg-gradient-to-r from-green-100 via-yellow-50 to-green-200 overflow-hidden rounded-2xl shadow-inner mb-8"
          style={{ minHeight: '320px' }}
        >
          {/* Track lanes with better visual separation */}
          {Array.from({ length: 5 }, (_, i) => (
            <div 
              key={i} 
              className={`absolute w-full border-b border-gray-300 ${
                i % 2 === 0 ? 'bg-white bg-opacity-30' : 'bg-green-50 bg-opacity-50'
              }`}
              style={{ 
                top: `${i * 64}px`, 
                height: '64px' 
              }} 
            />
          ))}
          
          {/* Starting line */}
          <div className="absolute top-0 bottom-0 left-8 w-3 bg-gradient-to-b from-green-600 to-green-800 shadow-lg z-20 rounded">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-green-800 bg-white px-2 py-1 rounded shadow">
              START
            </div>
          </div>

          {/* Progress markers */}
          {[0.25, 0.5, 0.75].map((percent, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 w-1 bg-gray-400 z-10 opacity-60"
              style={{ left: `${8 + (trackWidth - 80) * percent}px` }}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 bg-white px-1 rounded shadow">
                {Math.round(percent * 100)}%
              </div>
            </div>
          ))}

          {/* Finish line */}
          <div 
            className="absolute top-0 bottom-0 w-4 bg-gradient-to-b from-red-500 via-white to-red-500 z-20 rounded shadow-lg"
            style={{ left: `${trackWidth * 0.85 + 8}px` }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-800 bg-white px-2 py-1 rounded shadow">
              FINISH
            </div>
          </div>

          {/* Racing pets */}
          {selectedPets.map((id, i) => {
            const student = students.find(stu => stu.id === id);
            if (!student?.pet) return null;
            
            const position = racePositions[id] || 0;
            const speed = calculateSpeed ? calculateSpeed(student.pet) : 1;

            return (
              <div
                key={id}
                className="absolute flex items-center space-x-3 z-30"
                style={{
                  top: `${i * 64 + 16}px`,
                  left: `${8 + position}px`,
                  transform: raceInProgress ? 'translateX(0)' : 'translateX(0)',
                  transition: raceInProgress ? 'none' : 'left 0.3s ease-out',
                }}
              >
                <div className="relative">
                  <img 
                    src={student.pet.image} 
                    alt={student.pet.name || 'Pet'}
                    className={`w-16 h-16 rounded-full border-3 border-white shadow-xl ${
                      raceInProgress ? 'animate-bounce' : 'hover:animate-pulse'
                    }`}
                    style={{ 
                      filter: raceInProgress ? 'brightness(1.1)' : 'brightness(1)',
                    }}
                  />
                  
                  {/* Speed indicator during race */}
                  {raceInProgress && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg animate-pulse">
                      {speed.toFixed(1)}
                    </div>
                  )}
                  
                  {/* Position indicator */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                    {i + 1}
                  </div>
                </div>
                
                <div className="bg-white px-3 py-2 rounded-xl text-sm font-bold text-gray-700 shadow-lg border border-gray-200">
                  <div>{student.firstName}</div>
                  <div className="text-xs text-gray-500">{student.pet.name || 'Unnamed'}</div>
                </div>
              </div>
            );
          })}

          {/* Race completed overlay */}
          {raceFinished && raceWinner && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
              <div className="bg-white p-8 rounded-2xl shadow-2xl text-center transform animate-bounce">
                <div className="text-8xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-green-600 mb-4">Race Complete!</h3>
                <p className="text-xl text-gray-700 mb-4">
                  🎉 <strong>{raceWinner.firstName}</strong> wins with <strong>{raceWinner.pet.name}</strong>!
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="font-semibold text-yellow-800">
                    Prize: {selectedPrize === 'xp' 
                      ? `${prizeDetails.amount || 5} ${prizeDetails.category || 'Respectful'} XP`
                      : selectedPrize === 'coins'
                      ? `${prizeDetails.amount || 10} bonus coins`
                      : prizeDetails.description || 'Classroom reward'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No pets message */}
        {studentsWithPets.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Racing Pets Yet!</h3>
            <p className="text-gray-500 text-lg">Students unlock pets when they reach 50 total XP points.</p>
            <p className="text-gray-500">Award XP in the Students tab to help them unlock their companions!</p>
          </div>
        )}
        
        {/* Pet Champions Hall of Fame */}
        {studentsWithPets.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl shadow-lg border border-yellow-200">
            <h3 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <span className="text-3xl mr-3">🏅</span>
              Pet Champions Hall of Fame
              <span className="text-3xl ml-3">🏅</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {students
                .filter((s) => s.pet?.wins > 0)
                .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
                .slice(0, 3)
                .map((s, i) => (
                  <div key={s.id} className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-4 transform hover:scale-105 transition-all duration-300 border-2 border-yellow-300">
                    <div className="text-4xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                    <img src={s.pet.image} className="w-16 h-16 rounded-full border-3 border-yellow-400 shadow-lg" />
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg">{s.firstName}</div>
                      <div className="text-gray-600">{s.pet.name}</div>
                      <div className="text-yellow-600 font-semibold">{s.pet.wins} wins</div>
                    </div>
                  </div>
                ))}
            </div>
            
            {students.filter((s) => s.pet?.wins > 0).length === 0 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏁</div>
                <p className="text-gray-500 text-xl italic">No races completed yet. Start your first race to crown a champion!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PetRaceTab;