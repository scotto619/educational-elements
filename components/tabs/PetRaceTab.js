// PetRaceTab.js - Epic Enhanced Pet Racing with Proper Positioning & Awesome Prizes
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
  saveStudentsToFirebase,
  showToast,
  checkForLevelUp,
  SHOP_ITEMS,
  LOOT_BOX_ITEMS,
  generateLootBoxRewards
}) => {
  const raceTrackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);
  const [raceStarted, setRaceStarted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [raceProgress, setRaceProgress] = useState(0);
  const [crowdCheering, setCrowdCheering] = useState(false);
  const [photoFinish, setPhotoFinish] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Track dimensions - start 10% from left, finish 90% of track width
  const START_POSITION_PERCENT = 0.1;
  const FINISH_POSITION_PERCENT = 0.9;
  const RACE_DISTANCE = FINISH_POSITION_PERCENT - START_POSITION_PERCENT; // 80% of track

  // Award prizes to winner (defined early for useEffect dependency)
  const awardPrize = async (winner) => {
    let prizeAwarded = '';
    
    const updatedStudents = students.map(student => {
      if (student.id !== winner.id) return student;

      let updated = {
        ...student,
        pet: {
          ...student.pet,
          wins: (student.pet.wins || 0) + 1
          // Removed speed increase
        }
      };

      switch (selectedPrize) {
        case 'xp':
          updated.totalPoints = (updated.totalPoints || 0) + prizeDetails.amount;
          updated.categoryTotal = {
            ...updated.categoryTotal,
            [prizeDetails.category]: (updated.categoryTotal[prizeDetails.category] || 0) + prizeDetails.amount
          };
          updated.logs = [
            ...(updated.logs || []),
            {
              type: prizeDetails.category,
              amount: prizeDetails.amount,
              date: new Date().toISOString(),
              source: 'race_win'
            }
          ];
          prizeAwarded = `${prizeDetails.amount} ${prizeDetails.category} XP`;
          updated = checkForLevelUp(updated);
          break;

        case 'coins':
          updated.coins = (updated.coins || 0) + prizeDetails.amount;
          updated.logs = [
            ...(updated.logs || []),
            {
              type: 'bonus_coins',
              amount: prizeDetails.amount,
              date: new Date().toISOString(),
              source: 'race_win'
            }
          ];
          prizeAwarded = `${prizeDetails.amount} coins`;
          break;

        case 'shop_item':
          if (prizeDetails.item.category === 'avatars') {
            updated.ownedAvatars = [...(updated.ownedAvatars || []), prizeDetails.item.id];
          } else if (prizeDetails.item.category === 'pets') {
            updated.ownedPets = [...(updated.ownedPets || []), {
              id: `pet_${Date.now()}`,
              name: prizeDetails.item.name,
              image: prizeDetails.item.image,
              type: 'race_prize'
            }];
          } else {
            updated.inventory = [...(updated.inventory || []), {
              id: `item_${Date.now()}`,
              name: prizeDetails.item.name,
              description: prizeDetails.item.description,
              source: 'race_win',
              acquired: new Date().toISOString()
            }];
          }
          prizeAwarded = prizeDetails.item.name;
          break;

        case 'loot_box':
          const rewards = generateLootBoxRewards(prizeDetails.lootBox);
          updated.inventory = [...(updated.inventory || []), ...rewards];
          prizeAwarded = `${prizeDetails.lootBox.name} with ${rewards.length} items`;
          break;

        case 'classroom_reward':
          updated.inventory = [...(updated.inventory || []), {
            id: `reward_${Date.now()}`,
            name: prizeDetails.reward.name,
            description: prizeDetails.reward.description,
            source: 'race_win',
            acquired: new Date().toISOString(),
            category: 'classroom_reward'
          }];
          prizeAwarded = prizeDetails.reward.name;
          break;
      }

      return updated;
    });

    await saveStudentsToFirebase(updatedStudents);
    showToast(`🏆 ${winner.firstName} wins and earns ${prizeAwarded}!`, 'success');
  };

  // Race animation logic - this updates pet positions during the race
  useEffect(() => {
    if (!raceInProgress || !raceStarted) return;

    const raceInterval = setInterval(() => {
      setRacePositions(currentPositions => {
        const newPositions = { ...currentPositions };
        let raceComplete = false;
        let winner = null;

        selectedPets.forEach(petId => {
          const student = students.find(s => s.id === petId);
          if (!student?.pet) return;

          // Calculate pet speed - increased base speed for better movement
          const basePetSpeed = (student.pet.speed || 1) * 2; // Increased multiplier
          const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
          const currentSpeed = (basePetSpeed * randomVariation) / 80; // Adjusted for better movement

          // Update position
          const currentPosition = newPositions[petId] || 0;
          const newPosition = Math.min(currentPosition + currentSpeed, RACE_DISTANCE);
          newPositions[petId] = newPosition;

          // Check if this pet finished the race
          if (newPosition >= RACE_DISTANCE && !raceComplete) {
            raceComplete = true;
            winner = student;
          }
        });

        // End race if someone won
        if (raceComplete && winner) {
          setTimeout(() => {
            setRaceInProgress(false);
            setRaceFinished(true);
            setRaceWinner(winner);
            awardPrize(winner);
            
            // Reset after showing results
            setTimeout(() => {
              setRaceFinished(false);
              setRaceWinner(null);
              setRaceStarted(false);
            }, 4000);
          }, 100);
        }

        return newPositions;
      });
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(raceInterval);
  }, [raceInProgress, raceStarted, selectedPets, students, RACE_DISTANCE]);

  // Calculate track dimensions on mount and resize
  useEffect(() => {
    const updateTrackDimensions = () => {
      if (raceTrackRef.current) {
        const rect = raceTrackRef.current.getBoundingClientRect();
        setTrackWidth(rect.width);
      }
    };

    updateTrackDimensions();
    window.addEventListener('resize', updateTrackDimensions);
    return () => window.removeEventListener('resize', updateTrackDimensions);
  }, []);

  // Race countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        if (countdown === 1) {
          setRaceStarted(true);
          setRaceInProgress(true);
          setCrowdCheering(true);
          setTimeout(() => setCrowdCheering(false), 3000);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, setRaceInProgress]);

  // Calculate race progress
  useEffect(() => {
    if (raceInProgress && Object.keys(racePositions).length > 0) {
      const maxProgress = Math.max(...Object.values(racePositions));
      const progressPercent = (maxProgress / RACE_DISTANCE) * 100;
      setRaceProgress(progressPercent);

      // Update leaderboard
      const currentStandings = selectedPets
        .map(id => {
          const student = students.find(s => s.id === id);
          return {
            id,
            name: student?.firstName,
            petName: student?.pet?.name,
            petImage: student?.pet?.image,
            position: racePositions[id] || 0,
            progress: ((racePositions[id] || 0) / RACE_DISTANCE) * 100
          };
        })
        .sort((a, b) => b.position - a.position);
      
      setLeaderboard(currentStandings);

      // Check for photo finish (within 5% of each other)
      if (progressPercent > 90) {
        const positions = Object.values(racePositions);
        const maxPos = Math.max(...positions);
        const minPos = Math.min(...positions);
        if ((maxPos - minPos) / RACE_DISTANCE < 0.05) {
          setPhotoFinish(true);
        }
      }
    }
  }, [racePositions, raceInProgress, selectedPets, students, RACE_DISTANCE]);

  // Start race with countdown
  const handleStartRace = () => {
    setCountdown(3);
    setRaceStarted(false);
    setRaceProgress(0);
    setPhotoFinish(false);
    setLeaderboard([]);
    
    // Initialize positions at start line
    const initialPositions = {};
    selectedPets.forEach(id => {
      initialPositions[id] = 0;
    });
    setRacePositions(initialPositions);
  };

  // Convert race position to screen position
  const getScreenPosition = (racePosition) => {
    const startPixel = trackWidth * START_POSITION_PERCENT;
    const finishPixel = trackWidth * FINISH_POSITION_PERCENT;
    const raceDistance = finishPixel - startPixel;
    
    return startPixel + (racePosition / RACE_DISTANCE) * raceDistance;
  };



  return (
    <div className="animate-fade-in space-y-6">
      {/* Epic Header */}
      <div className="text-center relative bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white rounded-2xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">🏁</span>
            Epic Pet Race Championship
            <span className="text-4xl ml-4 animate-bounce">🏆</span>
          </h2>
          <p className="text-xl opacity-90">Where legends are born and champions are made!</p>
        </div>
        
        {/* Crowd cheering effect */}
        {crowdCheering && (
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: '1s'
                }}
              >
                {['🎉', '🎊', '👏', '🔥', '⭐', '💫'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Race Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-3">🎁 Victory Prize</h3>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="font-semibold text-yellow-800">
                {selectedPrize === 'xp' && `${prizeDetails?.amount} ${prizeDetails?.category} XP`}
                {selectedPrize === 'coins' && `${prizeDetails?.amount} Coins`}
                {selectedPrize === 'shop_item' && prizeDetails?.item?.name}
                {selectedPrize === 'loot_box' && prizeDetails?.lootBox?.name}
                {selectedPrize === 'classroom_reward' && prizeDetails?.reward?.name}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              disabled={raceInProgress || countdown > 0}
              onClick={() => setShowRaceSetup(true)}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              {raceInProgress || countdown > 0 ? 'Race in Progress...' : '⚙️ Setup Race'}
            </button>

            {selectedPets.length >= 2 && !raceInProgress && countdown === 0 && (
              <button
                onClick={handleStartRace}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                🚀 Start Race!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-9xl font-bold text-white mb-4 animate-pulse">
              {countdown}
            </div>
            <div className="text-3xl text-yellow-400 font-bold">
              {countdown === 3 ? 'Get Ready!' : countdown === 2 ? 'Set!' : 'GO!'}
            </div>
          </div>
        </div>
      )}

      {/* Race Progress Bar */}
      {raceInProgress && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-800">📊 Race Progress</h3>
            <div className="text-lg font-bold text-blue-600">{Math.round(raceProgress)}%</div>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${raceProgress}%` }}
            ></div>
          </div>
          {photoFinish && (
            <div className="mt-2 text-center text-red-600 font-bold animate-pulse">
              📸 PHOTO FINISH! 📸
            </div>
          )}
        </div>
      )}

      {/* Epic Race Track */}
      <div className="bg-white rounded-xl shadow-2xl p-6">
        <div 
          ref={raceTrackRef}
          className="relative h-96 border-4 border-gray-400 bg-gradient-to-r from-green-200 via-yellow-100 to-green-300 overflow-hidden rounded-xl shadow-inner"
          style={{
            background: 'linear-gradient(90deg, #10B981 0%, #34D399 10%, #FEF3C7 20%, #FDE68A 80%, #34D399 90%, #10B981 100%)'
          }}
        >
          {/* Sky background with clouds */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-transparent opacity-30"></div>
          
          {/* Crowd in grandstands */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-purple-600 to-purple-400 opacity-80">
            <div className="flex justify-around items-center h-full text-white text-xs">
              {[...Array(20)].map((_, i) => (
                <div key={i} className={`${crowdCheering ? 'animate-bounce' : ''} text-lg`}>
                  👥
                </div>
              ))}
            </div>
          </div>

          {/* Track lanes with dynamic heights */}
          {Array.from({ length: Math.min(6, Math.max(2, selectedPets.length)) }, (_, i) => {
            const laneHeight = (350 - 50) / Math.min(6, Math.max(2, selectedPets.length));
            const isOddLane = i % 2 === 1;
            
            return (
              <div 
                key={i} 
                className={`absolute w-full border-b-2 border-white border-opacity-50 ${
                  isOddLane ? 'bg-green-100 bg-opacity-30' : 'bg-yellow-50 bg-opacity-30'
                }`}
                style={{ 
                  top: `${50 + i * laneHeight}px`,
                  height: `${laneHeight}px`
                }}
              >
                {/* Lane numbers */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-700 shadow">
                  {i + 1}
                </div>
              </div>
            );
          })}
          
          {/* Starting line - Enhanced */}
          <div 
            className="absolute top-12 bottom-0 w-4 bg-gradient-to-b from-white via-red-500 to-white shadow-lg z-20 rounded"
            style={{ left: `${trackWidth * START_POSITION_PERCENT - 8}px` }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              START
            </div>
          </div>

          {/* Progress markers */}
          {[0.25, 0.5, 0.75].map((percent, index) => (
            <div
              key={index}
              className="absolute top-12 bottom-0 w-1 bg-gray-400 z-10"
              style={{ 
                left: `${trackWidth * START_POSITION_PERCENT + (trackWidth * RACE_DISTANCE * percent)}px` 
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-600 text-xs font-bold bg-white px-1 rounded shadow">
                {Math.round(percent * 100)}%
              </div>
            </div>
          ))}

          {/* Finish line - Enhanced */}
          <div 
            className="absolute top-12 bottom-0 w-6 z-20 rounded shadow-lg"
            style={{ 
              left: `${trackWidth * FINISH_POSITION_PERCENT - 12}px`,
              background: 'repeating-linear-gradient(90deg, black 0px, black 10px, white 10px, white 20px)'
            }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
              FINISH
            </div>
            {/* Checkered flag */}
            <div className="absolute -top-6 -right-8 text-2xl animate-wave">🏁</div>
          </div>

          {/* Racing pets with enhanced animations */}
          {selectedPets.map((id, i) => {
            const student = students.find(stu => stu.id === id);
            if (!student?.pet) return null;
            
            const racePosition = racePositions[id] || 0;
            const screenPosition = getScreenPosition(racePosition);
            const laneHeight = (350 - 50) / Math.min(6, Math.max(2, selectedPets.length));
            const laneTop = 50 + i * laneHeight;
            const isLeading = leaderboard[0]?.id === id;
            const position = leaderboard.findIndex(p => p.id === id) + 1;

            return (
              <div
                key={id}
                className="absolute flex items-center transition-all duration-200 z-30"
                style={{
                  top: `${laneTop + laneHeight/2 - 20}px`,
                  left: `${screenPosition - 20}px`,
                  transform: raceInProgress ? 'translateX(0)' : 'translateX(-10px)'
                }}
              >
                {/* Pet with enhanced effects */}
                <div className="relative">
                  <img 
                    src={student.pet.image} 
                    alt="Racing Pet" 
                    className={`w-12 h-12 rounded-full border-3 shadow-lg transition-all duration-200 ${
                      raceInProgress 
                        ? `animate-bounce ${isLeading ? 'border-yellow-400 shadow-yellow-400' : 'border-white'}` 
                        : 'border-gray-300'
                    }`}
                    style={{
                      filter: raceInProgress ? 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' : 'none',
                      transform: raceInProgress ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  
                  {/* Speed trail effect */}
                  {raceInProgress && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
                  )}
                  
                  {/* Position indicator */}
                  {raceInProgress && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      position === 1 ? 'bg-yellow-500' : 
                      position === 2 ? 'bg-gray-400' : 
                      position === 3 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {position}
                    </div>
                  )}
                  
                  {/* Leading indicator */}
                  {isLeading && raceInProgress && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <span className="text-yellow-400 text-lg">👑</span>
                    </div>
                  )}
                </div>

                {/* Student name tag */}
                <div className="ml-2 bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-md border">
                  {student.firstName}
                </div>
              </div>
            );
          })}

          {/* Race completion overlay */}
          {raceFinished && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
              <div className="bg-white p-8 rounded-xl shadow-2xl text-center transform animate-bounce">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-green-600 mb-2">Race Complete!</h3>
                <p className="text-gray-600 text-lg">Checking the photo finish...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Leaderboard */}
      {raceInProgress && leaderboard.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏃‍♂️</span>
            Live Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((racer, index) => (
              <div key={racer.id} className={`flex items-center p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border-2 border-yellow-300' :
                index === 1 ? 'bg-gray-50 border-2 border-gray-300' :
                index === 2 ? 'bg-orange-50 border-2 border-orange-300' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-600' :
                  'bg-blue-500'
                }`}>
                  {index + 1}
                </div>
                
                <img src={racer.petImage} alt="Pet" className="w-10 h-10 rounded-full border-2 border-white shadow mr-3" />
                
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{racer.name}</div>
                  <div className="text-sm text-gray-600">{racer.petName}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">{Math.round(racer.progress)}%</div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${racer.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hall of Fame */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <span className="text-3xl mr-3">🏅</span>
          Hall of Fame
          <span className="text-3xl ml-3">🏅</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {students
            .filter((s) => s.pet?.wins > 0)
            .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
            .slice(0, 3)
            .map((s, i) => (
              <div key={s.id} className={`rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 ${
                i === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 text-yellow-900' :
                i === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-800' :
                'bg-gradient-to-b from-orange-400 to-orange-500 text-orange-900'
              }`}>
                <div className="text-4xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <img src={s.pet.image} className="w-16 h-16 rounded-full border-4 border-white shadow-lg mx-auto mb-3" />
                <div className="font-bold text-lg">{s.firstName}</div>
                <div className="text-sm opacity-90">{s.pet.name}</div>
                <div className="text-xl font-bold mt-2">{s.pet.wins} Victories</div>
                <div className="text-sm">Speed: {((s.pet.speed || 1) * 10).toFixed(1)}</div>
              </div>
            ))}
        </div>
        
        {students.filter((s) => s.pet?.wins > 0).length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏁</div>
            <p className="text-gray-500 text-lg italic">No champions yet. Start your first epic race!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetRaceTab;