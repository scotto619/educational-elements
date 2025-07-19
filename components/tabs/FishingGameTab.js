// FishingGameTab.js - Epic Fishing Mini-Game Reward System (FIXED VERSION)
import React, { useState, useEffect } from 'react';

const FishingGameTab = ({
  students = [],
  showToast = () => {},
  SHOP_ITEMS = {},
  LOOT_BOX_ITEMS = {},
  teacherRewards = [],
  setStudents = () => {},
  saveStudentsToFirebase = () => {},
  checkForLevelUp = (student) => student,
  generateLootBoxRewards = () => [],
  calculateCoins = () => 0
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFishingGame, setShowFishingGame] = useState(false);
  const [fishingStats, setFishingStats] = useState({});
  const [showPrizeEditor, setShowPrizeEditor] = useState(false);
  const [customPrizes, setCustomPrizes] = useState([]);

  // Load fishing stats from students
  useEffect(() => {
    if (!students || !Array.isArray(students) || students.length === 0) {
      setFishingStats({});
      return;
    }
    
    const stats = {};
    students.forEach(student => {
      if (student && student.id) {
        stats[student.id] = {
          gamesPlayed: student.fishingStats?.gamesPlayed || 0,
          totalCatches: student.fishingStats?.totalCatches || 0,
          bestCatch: student.fishingStats?.bestCatch || null,
          totalValue: student.fishingStats?.totalValue || 0
        };
      }
    });
    setFishingStats(stats);
  }, [students]);

  // Default classroom rewards for fishing
  const DEFAULT_FISHING_REWARDS = [
    { id: 'extra_time', name: 'Extra Computer Time', description: '15 minutes extra computer time', icon: '💻', category: 'privileges', difficulty: 'easy' },
    { id: 'treasure_box', name: 'Treasure Box Visit', description: 'Choose from the class treasure box', icon: '📦', category: 'treats', difficulty: 'easy' },
    { id: 'lunch_buddy', name: 'Lunch with Teacher', description: 'Have lunch with the teacher', icon: '🍎', category: 'privileges', difficulty: 'medium' },
    { id: 'class_helper', name: 'VIP Class Helper', description: 'Be the special class helper for a day', icon: '⭐', category: 'privileges', difficulty: 'medium' },
    { id: 'free_homework', name: 'Homework Free Pass', description: 'Skip one homework assignment', icon: '📝', category: 'privileges', difficulty: 'hard' },
    { id: 'principal_visit', name: 'Principal\'s Office Visit', description: 'Visit the principal to share good news!', icon: '🏫', category: 'privileges', difficulty: 'hard' }
  ];

  const fishingRewards = [...DEFAULT_FISHING_REWARDS, ...customPrizes];

  // Prize fish configuration - organized by difficulty/rarity
  const PRIZE_FISH = [
    // Common Fish (70% spawn rate)
    {
      id: 'school_fish',
      name: 'School Fish',
      emoji: '🐟',
      color: '#10B981',
      size: 'medium',
      speed: 1.5,
      catchChance: 0.9,
      spawnRate: 0.4,
      prize: { type: 'xp', amount: 3, category: 'Learner' },
      description: '3 Learner XP'
    },
    {
      id: 'kindness_carp',
      name: 'Kindness Carp',
      emoji: '🐠',
      color: '#3B82F6',
      size: 'medium',
      speed: 1.2,
      catchChance: 0.85,
      spawnRate: 0.3,
      prize: { type: 'xp', amount: 3, category: 'Respectful' },
      description: '3 Respectful XP'
    },

    // Uncommon Fish (20% spawn rate)
    {
      id: 'wisdom_whale',
      name: 'Wisdom Whale',
      emoji: '🐋',
      color: '#8B5CF6',
      size: 'large',
      speed: 0.8,
      catchChance: 0.7,
      spawnRate: 0.15,
      prize: { type: 'xp', amount: 8, category: 'Learner' },
      description: '8 Learner XP'
    },
    {
      id: 'coin_fish',
      name: 'Golden Fish',
      emoji: '🐡',
      color: '#F59E0B',
      size: 'small',
      speed: 2.0,
      catchChance: 0.6,
      spawnRate: 0.1,
      prize: { type: 'coins', amount: 25 },
      description: '25 Coins'
    },

    // Rare Fish (8% spawn rate)
    {
      id: 'treasure_trout',
      name: 'Treasure Trout',
      emoji: '🎣',
      color: '#F97316',
      size: 'medium',
      speed: 1.8,
      catchChance: 0.5,
      spawnRate: 0.05,
      prize: { type: 'classroom_reward', difficulty: 'easy' },
      description: 'Easy Classroom Reward'
    },
    {
      id: 'mystery_manta',
      name: 'Mystery Manta',
      emoji: '🐙',
      color: '#EC4899',
      size: 'large',
      speed: 1.0,
      catchChance: 0.4,
      spawnRate: 0.03,
      prize: { type: 'loot_box', box: 'basic' },
      description: 'Basic Loot Box'
    },

    // Ultra Rare Fish (2% spawn rate)
    {
      id: 'legendary_leviathan',
      name: 'Legendary Leviathan',
      emoji: '🦈',
      color: '#DC2626',
      size: 'huge',
      speed: 0.5,
      catchChance: 0.2,
      spawnRate: 0.008,
      prize: { type: 'shop_item', category: 'avatars' },
      description: 'Rare Avatar!'
    },
    {
      id: 'dragon_fish',
      name: 'Dragon Fish',
      emoji: '🐲',
      color: '#7C2D12',
      size: 'huge',
      speed: 0.6,
      catchChance: 0.15,
      spawnRate: 0.005,
      prize: { type: 'shop_item', category: 'pets' },
      description: 'Epic Pet!'
    }
  ];

  // Rest of the component logic stays the same...
  const selectRandomStudent = () => {
    if (!students || students.length === 0) {
      showToast('No students available!', 'error');
      return;
    }
    const randomIndex = Math.floor(Math.random() * students.length);
    setSelectedStudent(students[randomIndex]);
  };

  const startFishingGame = () => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }
    setShowFishingGame(true);
  };

  const handleFishingComplete = (caughtFish, prize) => {
    if (!selectedStudent || !prize) return;

    // Update student stats
    setStudents(prev => {
      if (!Array.isArray(prev)) return prev;
      
      const updatedStudents = prev.map(student => {
        if (!student || student.id !== selectedStudent.id) return student;

        let updated = {
          ...student,
          fishingStats: {
            gamesPlayed: (student.fishingStats?.gamesPlayed || 0) + 1,
            totalCatches: (student.fishingStats?.totalCatches || 0) + (caughtFish ? 1 : 0),
            bestCatch: !student.fishingStats?.bestCatch || (caughtFish && prize.value > (student.fishingStats.bestCatch?.value || 0))
              ? { name: caughtFish?.name || 'Unknown', value: prize.value || 0, date: new Date().toISOString() }
              : student.fishingStats.bestCatch,
            totalValue: (student.fishingStats?.totalValue || 0) + (prize.value || 0)
          }
        };

        // Award the prize
        switch (prize.type) {
          case 'xp':
            updated.totalPoints = (updated.totalPoints || 0) + prize.amount;
            updated.categoryTotal = {
              ...updated.categoryTotal,
              [prize.category]: (updated.categoryTotal?.[prize.category] || 0) + prize.amount
            };
            updated.logs = [
              ...(updated.logs || []),
              {
                type: prize.category,
                amount: prize.amount,
                date: new Date().toISOString(),
                source: 'fishing_game'
              }
            ];
            updated = checkForLevelUp(updated);
            break;

          case 'coins':
            updated.coins = (updated.coins || 0) + prize.amount;
            updated.logs = [
              ...(updated.logs || []),
              {
                type: 'bonus_coins',
                amount: prize.amount,
                date: new Date().toISOString(),
                source: 'fishing_game'
              }
            ];
            break;

          case 'shop_item':
            if (prize.item && prize.item.category === 'avatars') {
              updated.ownedAvatars = [...(updated.ownedAvatars || []), prize.item.id];
            } else if (prize.item && prize.item.category === 'pets') {
              updated.ownedPets = [...(updated.ownedPets || []), {
                id: `pet_${Date.now()}`,
                name: prize.item.name || 'Mystery Pet',
                image: prize.item.image || '',
                type: 'fishing_prize'
              }];
            } else if (prize.item) {
              updated.inventory = [...(updated.inventory || []), {
                id: `item_${Date.now()}`,
                name: prize.item.name || 'Mystery Item',
                description: prize.item.description || 'Item from fishing',
                source: 'fishing_game',
                acquired: new Date().toISOString()
              }];
            }
            break;

          case 'loot_box':
            const rewards = generateLootBoxRewards(prize.lootBox);
            updated.inventory = [...(updated.inventory || []), ...rewards];
            break;

          case 'classroom_reward':
            if (prize.reward) {
              updated.inventory = [...(updated.inventory || []), {
                id: `reward_${Date.now()}`,
                name: prize.reward.name || 'Special Reward',
                description: prize.reward.description || 'Classroom reward from fishing',
                source: 'fishing_game',
                acquired: new Date().toISOString(),
                category: 'classroom_reward'
              }];
            }
            break;
        }

        return updated;
      });

      if (typeof saveStudentsToFirebase === 'function') {
        saveStudentsToFirebase(updatedStudents);
      }
      return updatedStudents;
    });

    // Show success message
    if (caughtFish) {
      showToast(`🎣 ${selectedStudent.firstName} caught a ${caughtFish.name} and won ${prize.description}!`, 'success');
    } else {
      showToast(`🎣 ${selectedStudent.firstName} didn't catch anything this time. Better luck next time!`, 'info');
    }

    setShowFishingGame(false);
  };

  const getLeaderboard = () => {
    if (!students || !Array.isArray(students)) return [];
    
    return students
      .filter(s => s && s.fishingStats && (s.fishingStats.totalCatches || 0) > 0)
      .sort((a, b) => (b.fishingStats?.totalValue || 0) - (a.fishingStats?.totalValue || 0))
      .slice(0, 5);
  };

  const leaderboard = getLeaderboard();

  // Loading state
  if (!students) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading fishing adventure...</p>
        </div>
      </div>
    );
  }

  // No students state
  if (!Array.isArray(students) || students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎣</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Epic Fishing Adventure</h2>
        <p className="text-gray-700">Add students to your class to start the fishing adventure!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-blue-500 via-teal-500 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">🎣</span>
            Epic Fishing Adventure
            <span className="text-4xl ml-4 animate-bounce">🐟</span>
          </h2>
          <p className="text-xl opacity-90">Cast your line and reel in amazing rewards!</p>
        </div>
        
        {/* Floating fish decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🐠</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🐟</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🦈</div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-3">👤</span>
          Choose Your Angler
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Selection Grid */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-700">Select Student</h4>
              <button
                onClick={selectRandomStudent}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                🎲 Random Student
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {students.map(student => {
                if (!student || !student.id) return null;
                
                const stats = fishingStats[student.id] || { totalCatches: 0, gamesPlayed: 0 };
                const isSelected = selectedStudent?.id === student.id;
                
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-3 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 bg-white'
                    }`}
                  >
                    {/* Student Avatar */}
                    <div className="relative mb-2">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.firstName || 'Student'}
                          className={`w-12 h-12 rounded-full mx-auto border-2 ${
                            isSelected ? 'border-blue-400' : 'border-gray-300'
                          }`}
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full mx-auto border-2 bg-gray-100 flex items-center justify-center text-2xl ${
                          isSelected ? 'border-blue-400' : 'border-gray-300'
                        }`}>
                          👤
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    {/* Student Info */}
                    <div className="font-bold text-gray-800 text-sm">{student.firstName || 'Student'}</div>
                    <div className="text-xs text-gray-600">
                      {stats.totalCatches} catches
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Student Info */}
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border border-blue-200">
            {selectedStudent ? (
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Ready to Fish!</h4>
                
                {/* Selected Student Display */}
                <div className="mb-6">
                  {selectedStudent.avatar ? (
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.firstName || 'Student'}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-blue-400 shadow-lg mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto border-4 border-blue-400 bg-gray-100 flex items-center justify-center text-4xl mb-3">
                      👤
                    </div>
                  )}
                  <div className="text-2xl font-bold text-gray-800">{selectedStudent.firstName || 'Student'}</div>
                  <div className="text-gray-600">the Angler</div>
                </div>

                {/* Fishing Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-blue-600 font-bold text-lg">{fishingStats[selectedStudent.id]?.gamesPlayed || 0}</div>
                    <div className="text-gray-600">Games Played</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-green-600 font-bold text-lg">{fishingStats[selectedStudent.id]?.totalCatches || 0}</div>
                    <div className="text-gray-600">Total Catches</div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={startFishingGame}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  🎣 Start Fishing Adventure!
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎣</div>
                <h4 className="text-xl font-bold text-gray-600 mb-2">Select an Angler</h4>
                <p className="text-gray-500">Choose a student to start the fishing adventure!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-3">🏆</span>
          Legendary Catches & Prizes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRIZE_FISH.filter(fish => ['legendary_leviathan', 'dragon_fish', 'mystery_manta', 'treasure_trout'].includes(fish.id)).map(fish => (
            <div key={fish.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-3xl mb-2">{fish.emoji}</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{fish.name}</div>
                <div className="text-xs text-purple-600 mb-2">{fish.description}</div>
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  {fish.spawnRate < 0.01 ? 'Ultra Rare' : 'Rare'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-3">🏅</span>
            Top Anglers Hall of Fame
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {leaderboard.map((student, index) => (
              <div key={student.id} className={`rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300 ${
                index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-500 text-yellow-900' :
                index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-400 text-gray-800' :
                index === 2 ? 'bg-gradient-to-b from-orange-400 to-orange-500 text-orange-900' :
                'bg-gradient-to-b from-blue-100 to-blue-200 text-blue-800'
              }`}>
                <div className="text-3xl mb-2">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎣'}
                </div>
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.firstName || 'Student'}
                    className="w-12 h-12 rounded-full mx-auto border-2 border-white shadow-lg mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mx-auto border-2 border-white bg-gray-100 flex items-center justify-center text-xl mb-2">
                    👤
                  </div>
                )}
                <div className="font-bold text-sm">{student.firstName || 'Student'}</div>
                <div className="text-xs opacity-90">{student.fishingStats?.totalCatches || 0} catches</div>
                <div className="text-xs font-bold">Value: {student.fishingStats?.totalValue || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fishing Game Modal */}
      {showFishingGame && selectedStudent && (
        <ImprovedFishingGameModal
          student={selectedStudent}
          prizeFish={PRIZE_FISH}
          shopItems={SHOP_ITEMS}
          fishingRewards={fishingRewards}
          onComplete={handleFishingComplete}
          onClose={() => setShowFishingGame(false)}
        />
      )}
    </div>
  );
};

// COMPLETELY REWRITTEN FISHING GAME MODAL WITH PROPER MECHANICS
const ImprovedFishingGameModal = ({ 
  student, 
  prizeFish = [], 
  shopItems = {}, 
  fishingRewards = [], 
  onComplete = () => {}, 
  onClose = () => {} 
}) => {
  const [gameState, setGameState] = useState('ready'); // ready, casting, fishing, catching, caught, missed, finished
  const [currentFish, setCurrentFish] = useState([]);
  const [hookPosition, setHookPosition] = useState({ x: 50, y: 15 });
  const [lineLength, setLineLength] = useState(0);
  const [caughtFish, setCaughtFish] = useState(null);
  const [turnsLeft, setTurnsLeft] = useState(3);
  const [fishingResult, setFishingResult] = useState(null);

  // Initialize fish when game starts
  useEffect(() => {
    generateNewFishSchool();
  }, []);

  // Generate multiple fish swimming around
  const generateNewFishSchool = () => {
    const newFish = [];
    const fishCount = 8 + Math.floor(Math.random() * 6); // 8-13 fish

    for (let i = 0; i < fishCount; i++) {
      // Pick random fish type based on spawn rates
      let selectedFishType = null;
      const rand = Math.random();
      let cumulativeRate = 0;

      for (const fishType of prizeFish) {
        cumulativeRate += fishType.spawnRate;
        if (rand <= cumulativeRate) {
          selectedFishType = fishType;
          break;
        }
      }

      if (!selectedFishType) {
        selectedFishType = prizeFish[0]; // Fallback to first fish
      }

      const fish = {
        id: `fish_${i}_${Date.now()}`,
        ...selectedFishType,
        x: Math.random() * 80 + 10, // 10-90% of screen width
        y: 40 + Math.random() * 40, // Swimming in middle-bottom area
        direction: Math.random() < 0.5 ? 1 : -1, // Random initial direction
        baseSpeed: selectedFishType.speed || 1,
        currentSpeed: (selectedFishType.speed || 1) * (0.5 + Math.random() * 0.5), // Vary speed
        depth: Math.random() * 3 + 1, // For layering effect
        bobOffset: Math.random() * Math.PI * 2 // For natural swimming motion
      };

      newFish.push(fish);
    }

    setCurrentFish(newFish);
  };

  // Fish swimming animation
  useEffect(() => {
    if (gameState === 'fishing' || gameState === 'ready') {
      const interval = setInterval(() => {
        setCurrentFish(prev => prev.map(fish => {
          let newX = fish.x + fish.direction * fish.currentSpeed * 0.3;
          let newDirection = fish.direction;
          
          // Bounce off walls
          if (newX <= 5) {
            newX = 5;
            newDirection = 1;
          } else if (newX >= 95) {
            newX = 95;
            newDirection = -1;
          }

          // Occasionally change direction randomly
          if (Math.random() < 0.005) {
            newDirection = -newDirection;
          }

          // Natural bobbing motion
          const bobY = Math.sin(Date.now() * 0.001 + fish.bobOffset) * 2;

          return {
            ...fish,
            x: newX,
            y: fish.y + bobY * 0.1,
            direction: newDirection
          };
        }));
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Cast fishing line
  const castLine = () => {
    if (gameState !== 'ready' || turnsLeft <= 0) return;

    setGameState('casting');
    setLineLength(0);

    // Animate line going down
    const castInterval = setInterval(() => {
      setLineLength(prev => {
        const newLength = prev + 3;
        if (newLength >= 250) { // Full line length
          clearInterval(castInterval);
          setGameState('fishing');
          
          // Auto check for catch after 2 seconds
          setTimeout(() => {
            checkForCatch();
          }, 2000);
        }
        return newLength;
      });
    }, 30);
  };

  // Check if hook caught any fish
  const checkForCatch = () => {
    const hookX = hookPosition.x;
    const hookY = 15 + (lineLength / 250) * 60; // Convert line length to Y position

    // Find fish within catching distance
    const nearbyFish = currentFish.filter(fish => {
      const distance = Math.sqrt(
        Math.pow(fish.x - hookX, 2) + Math.pow(fish.y - hookY, 2)
      );
      return distance < 8; // Catch radius
    });

    if (nearbyFish.length > 0) {
      // Try to catch the closest fish
      const targetFish = nearbyFish[0];
      const catchSuccess = Math.random() < targetFish.catchChance;

      if (catchSuccess) {
        setGameState('catching');
        setCaughtFish(targetFish);
        
        // Generate prize
        const prize = generatePrize(targetFish);
        setFishingResult({ success: true, fish: targetFish, prize });

        // Reel in animation
        setTimeout(() => {
          setGameState('caught');
        }, 1500);

        // Auto-complete after showing result
        setTimeout(() => {
          onComplete(targetFish, prize);
        }, 4000);

      } else {
        // Fish got away
        setGameState('missed');
        setTurnsLeft(prev => prev - 1);
        setTimeout(() => {
          if (turnsLeft - 1 <= 0) {
            onComplete(null, null);
          } else {
            resetForNextTurn();
          }
        }, 2000);
      }
    } else {
      // No fish nearby
      setGameState('missed');
      setTurnsLeft(prev => prev - 1);
      setTimeout(() => {
        if (turnsLeft - 1 <= 0) {
          onComplete(null, null);
        } else {
          resetForNextTurn();
        }
      }, 2000);
    }
  };

  // Reset for next turn
  const resetForNextTurn = () => {
    setGameState('ready');
    setLineLength(0);
    setCaughtFish(null);
    generateNewFishSchool(); // New fish for next attempt
  };

  // Generate prize from fish
  const generatePrize = (fish) => {
    if (!fish || !fish.prize) {
      return { type: 'coins', amount: 5, description: '5 Coins', value: 5 };
    }

    const prizeData = fish.prize;
    let prize = { ...prizeData, value: 0 };

    switch (prizeData.type) {
      case 'xp':
        prize.description = `${prizeData.amount} ${prizeData.category} XP`;
        prize.value = (prizeData.amount || 1) * 10;
        break;
      
      case 'coins':
        prize.description = `${prizeData.amount} Coins`;
        prize.value = prizeData.amount || 10;
        break;
      
      case 'shop_item':
        const items = shopItems[prizeData.category] || [];
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          prize.item = randomItem;
          prize.description = randomItem.name || 'Mystery Item';
          prize.value = randomItem.price || 50;
        } else {
          prize = { type: 'coins', amount: 20, description: '20 Coins', value: 20 };
        }
        break;
      
      case 'loot_box':
        prize.lootBox = { 
          id: `${prizeData.box || 'basic'}_box`, 
          name: `${(prizeData.box || 'basic').charAt(0).toUpperCase() + (prizeData.box || 'basic').slice(1)} Loot Box` 
        };
        prize.description = prize.lootBox.name;
        prize.value = prizeData.box === 'basic' ? 25 : prizeData.box === 'premium' ? 50 : 100;
        break;
      
      case 'classroom_reward':
        const rewards = fishingRewards.filter(r => r && r.difficulty === prizeData.difficulty);
        if (rewards.length > 0) {
          const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
          prize.reward = randomReward;
          prize.description = randomReward.name || 'Special Reward';
          prize.value = prizeData.difficulty === 'easy' ? 15 : prizeData.difficulty === 'medium' ? 30 : 50;
        } else {
          prize = { type: 'coins', amount: 15, description: '15 Coins', value: 15 };
        }
        break;

      default:
        prize = { type: 'coins', amount: 10, description: '10 Coins', value: 10 };
        break;
    }

    return prize;
  };

  // Move boat/hook left/right
  const moveHook = (direction) => {
    if (gameState !== 'ready') return;
    
    setHookPosition(prev => ({
      ...prev,
      x: Math.max(10, Math.min(90, prev.x + direction * 5))
    }));
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveHook(-1);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveHook(1);
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        castLine();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {student.avatar ? (
              <img src={student.avatar} alt={student.firstName || 'Student'} className="w-12 h-12 rounded-full border-2 border-white" />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <h3 className="text-xl font-bold">{student.firstName || 'Student'}'s Fishing Adventure</h3>
              <p className="text-blue-100">Turns left: {turnsLeft} • {gameState.charAt(0).toUpperCase() + gameState.slice(1)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-300 text-3xl">×</button>
        </div>

        {/* Game Area */}
        <div className="relative h-full bg-gradient-to-b from-blue-300 via-blue-400 to-blue-800 overflow-hidden">
          {/* Water surface animation */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-200 to-blue-400 opacity-80">
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          </div>

          {/* Boat */}
          <div 
            className="absolute transition-all duration-300 z-20"
            style={{ left: `${hookPosition.x}%`, top: '20px', transform: 'translateX(-50%)' }}
          >
            <div className="text-6xl">🚤</div>
          </div>

          {/* Fishing Line */}
          <div 
            className="absolute bg-gray-800 z-10"
            style={{
              left: `${hookPosition.x}%`,
              top: '60px',
              width: '3px',
              height: `${lineLength}px`,
              transform: 'translateX(-50%)',
              transition: gameState === 'catching' ? 'height 1.5s ease-in-out' : 'none'
            }}
          >
            {/* Fishing Hook */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg">
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full"></div>
            </div>
          </div>

          {/* Fish Swimming */}
          {currentFish.map(fish => (
            <div
              key={fish.id}
              className="absolute transition-all duration-100 z-5"
              style={{
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                transform: `translateX(-50%) scaleX(${fish.direction > 0 ? 1 : -1})`,
                fontSize: fish.size === 'small' ? '20px' : 
                          fish.size === 'medium' ? '30px' :
                          fish.size === 'large' ? '40px' : '50px',
                opacity: fish.depth > 2 ? 0.7 : 1,
                filter: `drop-shadow(2px 2px 4px rgba(0,0,0,0.3)) brightness(${0.8 + fish.depth * 0.1})`
              }}
            >
              {fish.emoji}
            </div>
          ))}

          {/* Caught Fish Animation */}
          {caughtFish && gameState === 'catching' && (
            <div 
              className="absolute text-6xl z-30 animate-bounce"
              style={{
                left: `${hookPosition.x}%`,
                top: '100px',
                transform: 'translateX(-50%)',
                animation: 'float-up 1.5s ease-out forwards'
              }}
            >
              {caughtFish.emoji}
            </div>
          )}

          {/* Game State Messages */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-40">
            {gameState === 'ready' && (
              <div className="bg-white bg-opacity-95 rounded-xl p-6 shadow-lg max-w-md">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Cast!</h4>
                <p className="text-gray-600 mb-4">Use arrow keys or A/D to move your hook, then press SPACE to cast!</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => moveHook(-1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                  >
                    ← Left
                  </button>
                  <button
                    onClick={castLine}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                  >
                    🎣 Cast Line!
                  </button>
                  <button
                    onClick={() => moveHook(1)}
                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-bold"
                  >
                    Right →
                  </button>
                </div>
              </div>
            )}
            
            {gameState === 'casting' && (
              <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-blue-600">Casting line...</h4>
                <div className="text-blue-500">🎣</div>
              </div>
            )}
            
            {gameState === 'fishing' && (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-yellow-600">Waiting for a bite...</h4>
                <div className="text-yellow-500 animate-pulse">🐟</div>
              </div>
            )}

            {gameState === 'catching' && (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-green-600">Fish on the line!</h4>
                <div className="text-green-500 animate-bounce">🎣</div>
              </div>
            )}
            
            {gameState === 'caught' && caughtFish && fishingResult && (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 shadow-lg">
                <h4 className="text-3xl font-bold text-green-600 mb-2">🎉 Amazing Catch! 🎉</h4>
                <div className="text-4xl mb-2">{caughtFish.emoji}</div>
                <p className="text-xl text-gray-800 mb-2">You caught a {caughtFish.name}!</p>
                <p className="text-lg text-green-600 font-semibold">{fishingResult.prize.description}</p>
              </div>
            )}
            
            {gameState === 'missed' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-red-600">No luck this time!</h4>
                <p className="text-gray-600">
                  {turnsLeft > 1 ? `${turnsLeft - 1} turns left` : 'Last chance!'}
                </p>
                <div className="text-red-500">😔</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls Hint */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm">
        <div className="font-bold mb-2">🎮 Controls:</div>
        <div>← → or A/D: Move hook</div>
        <div>Space/Enter: Cast line</div>
        <div>Watch the fish swim and try to get your hook near them!</div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateX(-50%) translateY(0);
          }
          100% {
            transform: translateX(-50%) translateY(-150px);
          }
        }
      `}</style>
    </div>
  );
};

export default FishingGameTab;