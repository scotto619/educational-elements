// FishingGameTab.js - Epic Fishing Mini-Game Reward System
import React, { useState, useEffect } from 'react';

const FishingGameTab = ({
  students,
  showToast,
  SHOP_ITEMS,
  LOOT_BOX_ITEMS,
  teacherRewards = [],
  setStudents,
  saveStudentsToFirebase,
  checkForLevelUp,
  generateLootBoxRewards,
  calculateCoins
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFishingGame, setShowFishingGame] = useState(false);
  const [fishingStats, setFishingStats] = useState({});
  const [showPrizeEditor, setShowPrizeEditor] = useState(false);
  const [customPrizes, setCustomPrizes] = useState([]);

  // Load fishing stats from students
  useEffect(() => {
    const stats = {};
    students.forEach(student => {
      stats[student.id] = {
        gamesPlayed: student.fishingStats?.gamesPlayed || 0,
        totalCatches: student.fishingStats?.totalCatches || 0,
        bestCatch: student.fishingStats?.bestCatch || null,
        totalValue: student.fishingStats?.totalValue || 0
      };
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
    // Easy Catches (60% spawn rate) - XP and Small Coins
    {
      id: 'xp_fish_small',
      name: 'School Fish',
      color: '#10B981', // Green
      size: 'large',
      speed: 'slow',
      depth: 'shallow',
      catchChance: 0.8,
      spawnRate: 0.25,
      prize: { type: 'xp', amount: 3, category: 'Learner' },
      description: '3 Learner XP'
    },
    {
      id: 'xp_fish_respect',
      name: 'Kindness Carp',
      color: '#3B82F6', // Blue
      size: 'large',
      speed: 'slow',
      depth: 'shallow',
      catchChance: 0.8,
      spawnRate: 0.2,
      prize: { type: 'xp', amount: 3, category: 'Respectful' },
      description: '3 Respectful XP'
    },
    {
      id: 'coin_fish_small',
      name: 'Penny Perch',
      color: '#F59E0B', // Yellow/Gold
      size: 'medium',
      speed: 'medium',
      depth: 'shallow',
      catchChance: 0.7,
      spawnRate: 0.15,
      prize: { type: 'coins', amount: 10 },
      description: '10 Coins'
    },

    // Medium Catches (25% spawn rate) - Better XP, Classroom Rewards
    {
      id: 'xp_fish_big',
      name: 'Wisdom Whale',
      color: '#8B5CF6', // Purple
      size: 'large',
      speed: 'medium',
      depth: 'medium',
      catchChance: 0.6,
      spawnRate: 0.08,
      prize: { type: 'xp', amount: 8, category: 'Learner' },
      description: '8 Learner XP'
    },
    {
      id: 'coin_fish_medium',
      name: 'Silver Salmon',
      color: '#6B7280', // Silver
      size: 'medium',
      speed: 'fast',
      depth: 'medium',
      catchChance: 0.5,
      spawnRate: 0.1,
      prize: { type: 'coins', amount: 25 },
      description: '25 Coins'
    },
    {
      id: 'classroom_reward_easy',
      name: 'Treasure Trout',
      color: '#F97316', // Orange
      size: 'medium',
      speed: 'medium',
      depth: 'medium',
      catchChance: 0.6,
      spawnRate: 0.07,
      prize: { type: 'classroom_reward', difficulty: 'easy' },
      description: 'Easy Classroom Reward'
    },

    // Hard Catches (12% spawn rate) - Shop Items, Better Rewards
    {
      id: 'loot_fish',
      name: 'Mystery Manta',
      color: '#EC4899', // Pink
      size: 'large',
      speed: 'fast',
      depth: 'deep',
      catchChance: 0.4,
      spawnRate: 0.04,
      prize: { type: 'loot_box', box: 'basic' },
      description: 'Basic Loot Box'
    },
    {
      id: 'shop_item_consumable',
      name: 'Potion Pike',
      color: '#06B6D4', // Cyan
      size: 'small',
      speed: 'fast',
      depth: 'deep',
      catchChance: 0.3,
      spawnRate: 0.03,
      prize: { type: 'shop_item', category: 'consumables' },
      description: 'Shop Consumable'
    },
    {
      id: 'classroom_reward_medium',
      name: 'Royal Ray',
      color: '#7C3AED', // Violet
      size: 'large',
      speed: 'medium',
      depth: 'deep',
      catchChance: 0.45,
      spawnRate: 0.05,
      prize: { type: 'classroom_reward', difficulty: 'medium' },
      description: 'Medium Classroom Reward'
    },

    // Ultra Rare Catches (3% spawn rate) - Avatars, Pets, Best Rewards
    {
      id: 'avatar_fish',
      name: 'Legendary Leviathan',
      color: '#DC2626', // Red
      size: 'huge',
      speed: 'very_fast',
      depth: 'very_deep',
      catchChance: 0.15,
      spawnRate: 0.008,
      prize: { type: 'shop_item', category: 'avatars' },
      description: 'Rare Avatar!'
    },
    {
      id: 'pet_fish',
      name: 'Dragon Fish',
      color: '#7C2D12', // Dark Red
      size: 'huge',
      speed: 'very_fast',
      depth: 'very_deep',
      catchChance: 0.1,
      spawnRate: 0.005,
      prize: { type: 'shop_item', category: 'pets' },
      description: 'Epic Pet!'
    },
    {
      id: 'premium_loot',
      name: 'Cosmic Coelacanth',
      color: '#1F2937', // Dark Gray with shimmer
      size: 'huge',
      speed: 'very_fast',
      depth: 'very_deep',
      catchChance: 0.12,
      spawnRate: 0.003,
      prize: { type: 'loot_box', box: 'premium' },
      description: 'Premium Loot Box!'
    },
    {
      id: 'classroom_reward_hard',
      name: 'Phoenix Fish',
      color: '#B91C1C', // Dark Red
      size: 'huge',
      speed: 'fast',
      depth: 'very_deep',
      catchChance: 0.2,
      spawnRate: 0.004,
      prize: { type: 'classroom_reward', difficulty: 'hard' },
      description: 'Epic Classroom Reward!'
    }
  ];

  // Select random student
  const selectRandomStudent = () => {
    if (students.length === 0) return;
    const randomIndex = Math.floor(Math.random() * students.length);
    setSelectedStudent(students[randomIndex]);
  };

  // Start fishing game
  const startFishingGame = () => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }
    setShowFishingGame(true);
  };

  // Handle fishing game completion
  const handleFishingComplete = (caughtFish, prize) => {
    if (!selectedStudent || !prize) return;

    // Update student stats
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== selectedStudent.id) return student;

        let updated = {
          ...student,
          fishingStats: {
            gamesPlayed: (student.fishingStats?.gamesPlayed || 0) + 1,
            totalCatches: (student.fishingStats?.totalCatches || 0) + (caughtFish ? 1 : 0),
            bestCatch: !student.fishingStats?.bestCatch || (caughtFish && prize.value > student.fishingStats.bestCatch.value) 
              ? { name: caughtFish?.name, value: prize.value || 0, date: new Date().toISOString() }
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
              [prize.category]: (updated.categoryTotal[prize.category] || 0) + prize.amount
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
            if (prize.item.category === 'avatars') {
              updated.ownedAvatars = [...(updated.ownedAvatars || []), prize.item.id];
            } else if (prize.item.category === 'pets') {
              updated.ownedPets = [...(updated.ownedPets || []), {
                id: `pet_${Date.now()}`,
                name: prize.item.name,
                image: prize.item.image,
                type: 'fishing_prize'
              }];
            } else {
              updated.inventory = [...(updated.inventory || []), {
                id: `item_${Date.now()}`,
                name: prize.item.name,
                description: prize.item.description,
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
            updated.inventory = [...(updated.inventory || []), {
              id: `reward_${Date.now()}`,
              name: prize.reward.name,
              description: prize.reward.description,
              source: 'fishing_game',
              acquired: new Date().toISOString(),
              category: 'classroom_reward'
            }];
            break;
        }

        return updated;
      });

      saveStudentsToFirebase(updatedStudents);
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

  // Get leaderboard
  const getLeaderboard = () => {
    return students
      .filter(s => s.fishingStats?.totalCatches > 0)
      .sort((a, b) => (b.fishingStats?.totalValue || 0) - (a.fishingStats?.totalValue || 0))
      .slice(0, 5);
  };

  const leaderboard = getLeaderboard();

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
                const stats = fishingStats[student.id];
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
                          alt={student.firstName}
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
                    <div className="font-bold text-gray-800 text-sm">{student.firstName}</div>
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
                      alt={selectedStudent.firstName}
                      className="w-20 h-20 rounded-full mx-auto border-4 border-blue-400 shadow-lg mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full mx-auto border-4 border-blue-400 bg-gray-100 flex items-center justify-center text-4xl mb-3">
                      👤
                    </div>
                  )}
                  <div className="text-2xl font-bold text-gray-800">{selectedStudent.firstName}</div>
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
          {PRIZE_FISH.filter(fish => ['avatar_fish', 'pet_fish', 'premium_loot', 'classroom_reward_hard'].includes(fish.id)).map(fish => (
            <div key={fish.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="text-center">
                <div className="text-3xl mb-2">🐟</div>
                <div className="font-bold text-gray-800 text-sm mb-1">{fish.name}</div>
                <div className="text-xs text-purple-600 mb-2">{fish.description}</div>
                <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                  Ultra Rare
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
                    alt={student.firstName}
                    className="w-12 h-12 rounded-full mx-auto border-2 border-white shadow-lg mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mx-auto border-2 border-white bg-gray-100 flex items-center justify-center text-xl mb-2">
                    👤
                  </div>
                )}
                <div className="font-bold text-sm">{student.firstName}</div>
                <div className="text-xs opacity-90">{student.fishingStats?.totalCatches} catches</div>
                <div className="text-xs font-bold">Value: {student.fishingStats?.totalValue || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fishing Game Modal */}
      {showFishingGame && selectedStudent && (
        <FishingGameModal
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

// Separate Fishing Game Modal Component
const FishingGameModal = ({ 
  student, 
  prizeFish, 
  shopItems, 
  fishingRewards, 
  onComplete, 
  onClose 
}) => {
  const [gameState, setGameState] = useState('waiting'); // waiting, casting, fishing, caught, missed
  const [turnsLeft, setTurnsLeft] = useState(3);
  const [caughtFish, setCaughtFish] = useState(null);
  const [currentFish, setCurrentFish] = useState([]);
  const [hookPosition, setHookPosition] = useState({ x: 50, y: 10 });
  const [boatPosition, setBoatPosition] = useState(50);
  const [showCelebration, setShowCelebration] = useState(false);

  // Generate random fish for this round
  const generateFish = () => {
    const fish = [];
    prizeFish.forEach(fishType => {
      if (Math.random() < fishType.spawnRate) {
        fish.push({
          ...fishType,
          id: `${fishType.id}_${Date.now()}_${Math.random()}`,
          x: Math.random() * 80 + 10, // 10-90% of screen width
          y: fishType.depth === 'shallow' ? 30 + Math.random() * 20 :
              fishType.depth === 'medium' ? 40 + Math.random() * 25 :
              fishType.depth === 'deep' ? 55 + Math.random() * 25 : 70 + Math.random() * 20,
          direction: Math.random() < 0.5 ? 1 : -1,
          speed: fishType.speed === 'slow' ? 0.3 : 
                 fishType.speed === 'medium' ? 0.6 :
                 fishType.speed === 'fast' ? 1.2 : 2.0
        });
      }
    });
    return fish;
  };

  // Start new round
  useEffect(() => {
    if (gameState === 'waiting') {
      setCurrentFish(generateFish());
    }
  }, [gameState]);

  // Fish movement animation
  useEffect(() => {
    if (gameState === 'fishing') {
      const interval = setInterval(() => {
        setCurrentFish(prev => prev.map(fish => ({
          ...fish,
          x: fish.x + fish.speed * fish.direction,
          direction: fish.x <= 5 || fish.x >= 95 ? -fish.direction : fish.direction
        })));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Cast line
  const castLine = () => {
    if (gameState !== 'waiting' || turnsLeft <= 0) return;
    
    setGameState('casting');
    setHookPosition({ x: boatPosition, y: 10 });
    
    // Animate hook going down
    const dropInterval = setInterval(() => {
      setHookPosition(prev => {
        const newY = prev.y + 2;
        if (newY >= 80) {
          clearInterval(dropInterval);
          setGameState('fishing');
          
          // Check for catch after a delay
          setTimeout(() => {
            checkForCatch();
          }, 2000);
        }
        return { ...prev, y: newY };
      });
    }, 50);
  };

  // Check if fish is caught
  const checkForCatch = () => {
    const hookX = hookPosition.x;
    const hookY = hookPosition.y;
    
    // Find fish within catch range
    const catchablefish = currentFish.filter(fish => {
      const distance = Math.sqrt(
        Math.pow(fish.x - hookX, 2) + Math.pow(fish.y - hookY, 2)
      );
      return distance < 8; // Catch radius
    });

    if (catchablefish.length > 0) {
      // Determine if catch is successful based on fish catch chance
      const targetFish = catchablefish[0];
      const catchSuccess = Math.random() < targetFish.catchChance;
      
      if (catchSuccess) {
        setCaughtFish(targetFish);
        setGameState('caught');
        setShowCelebration(true);
        
        // Award prize
        const prize = generatePrize(targetFish);
        setTimeout(() => {
          onComplete(targetFish, prize);
        }, 3000);
      } else {
        setGameState('missed');
        setTurnsLeft(prev => prev - 1);
        
        setTimeout(() => {
          if (turnsLeft - 1 <= 0) {
            onComplete(null, null);
          } else {
            setGameState('waiting');
            setHookPosition({ x: 50, y: 10 });
          }
        }, 2000);
      }
    } else {
      setGameState('missed');
      setTurnsLeft(prev => prev - 1);
      
      setTimeout(() => {
        if (turnsLeft - 1 <= 0) {
          onComplete(null, null);
        } else {
          setGameState('waiting');
          setHookPosition({ x: 50, y: 10 });
        }
      }, 2000);
    }
  };

  // Generate prize based on fish
  const generatePrize = (fish) => {
    const prizeData = fish.prize;
    let prize = { ...prizeData, value: 0 };

    switch (prizeData.type) {
      case 'xp':
        prize.description = `${prizeData.amount} ${prizeData.category} XP`;
        prize.value = prizeData.amount * 10;
        break;
      
      case 'coins':
        prize.description = `${prizeData.amount} Coins`;
        prize.value = prizeData.amount;
        break;
      
      case 'shop_item':
        const items = shopItems[prizeData.category] || [];
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          prize.item = randomItem;
          prize.description = randomItem.name;
          prize.value = randomItem.price || 50;
        }
        break;
      
      case 'loot_box':
        prize.lootBox = { 
          id: `${prizeData.box}_box`, 
          name: `${prizeData.box.charAt(0).toUpperCase() + prizeData.box.slice(1)} Loot Box` 
        };
        prize.description = prize.lootBox.name;
        prize.value = prizeData.box === 'basic' ? 25 : prizeData.box === 'premium' ? 50 : 100;
        break;
      
      case 'classroom_reward':
        const rewards = fishingRewards.filter(r => r.difficulty === prizeData.difficulty);
        if (rewards.length > 0) {
          const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
          prize.reward = randomReward;
          prize.description = randomReward.name;
          prize.value = prizeData.difficulty === 'easy' ? 15 : prizeData.difficulty === 'medium' ? 30 : 50;
        }
        break;
    }

    return prize;
  };

  // Move boat left/right
  const moveBoat = (direction) => {
    if (gameState !== 'waiting') return;
    
    setBoatPosition(prev => {
      const newPos = prev + (direction * 10);
      return Math.max(15, Math.min(85, newPos));
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {/* Celebration Effect */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              {['🎉', '🎊', '🐟', '⭐', '💫', '🎁', '👑', '🌟'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-5/6 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {student.avatar ? (
              <img src={student.avatar} alt={student.firstName} className="w-12 h-12 rounded-full border-2 border-white" />
            ) : (
              <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-2xl">👤</div>
            )}
            <div>
              <h3 className="text-xl font-bold">{student.firstName}'s Fishing Adventure</h3>
              <p className="text-blue-100">Turns left: {turnsLeft} • {gameState.charAt(0).toUpperCase() + gameState.slice(1)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-red-300 text-3xl">×</button>
        </div>

        {/* Game Area */}
        <div className="relative h-full bg-gradient-to-b from-blue-300 via-blue-400 to-blue-800 overflow-hidden">
          {/* Water surface */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-blue-200 to-blue-400 opacity-80"></div>
          
          {/* Boat */}
          <div 
            className="absolute transition-all duration-300"
            style={{ left: `${boatPosition}%`, top: '40px', transform: 'translateX(-50%)' }}
          >
            <div className="text-6xl">🚤</div>
          </div>

          {/* Fishing Line */}
          {gameState !== 'waiting' && (
            <div className="absolute bg-gray-800" style={{
              left: `${hookPosition.x}%`,
              top: '80px',
              width: '2px',
              height: `${hookPosition.y * 4}px`,
              transform: 'translateX(-50%)'
            }}>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
          )}

          {/* Fish */}
          {currentFish.map(fish => (
            <div
              key={fish.id}
              className="absolute transition-all duration-100"
              style={{
                left: `${fish.x}%`,
                top: `${fish.y}%`,
                transform: 'translateX(-50%)',
                fontSize: fish.size === 'small' ? '20px' : 
                          fish.size === 'medium' ? '30px' :
                          fish.size === 'large' ? '40px' : '50px',
                color: fish.color,
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
              }}
            >
              🐟
            </div>
          ))}

          {/* Game State Messages */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            {gameState === 'waiting' && (
              <div className="bg-white bg-opacity-90 rounded-xl p-6 shadow-lg">
                <h4 className="text-2xl font-bold text-gray-800 mb-4">Ready to Cast!</h4>
                <p className="text-gray-600 mb-4">Use arrow keys to move your boat, then click to cast your line!</p>
                <button
                  onClick={castLine}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                >
                  🎣 Cast Line!
                </button>
              </div>
            )}
            
            {gameState === 'casting' && (
              <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-blue-600">Casting line...</h4>
              </div>
            )}
            
            {gameState === 'fishing' && (
              <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-blue-600">Waiting for a bite...</h4>
              </div>
            )}
            
            {gameState === 'caught' && caughtFish && (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 shadow-lg">
                <h4 className="text-3xl font-bold text-green-600 mb-2">🎉 Amazing Catch! 🎉</h4>
                <p className="text-xl text-gray-800 mb-2">You caught a {caughtFish.name}!</p>
                <p className="text-lg text-green-600 font-semibold">{generatePrize(caughtFish).description}</p>
              </div>
            )}
            
            {gameState === 'missed' && (
              <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 shadow-lg">
                <h4 className="text-xl font-bold text-red-600">No luck this time!</h4>
                <p className="text-gray-600">
                  {turnsLeft > 1 ? `${turnsLeft - 1} turns left` : 'Last chance!'}
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          {gameState === 'waiting' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={() => moveBoat(-1)}
                className="px-4 py-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 font-bold"
              >
                ← Move Left
              </button>
              <button
                onClick={() => moveBoat(1)}
                className="px-4 py-2 bg-white bg-opacity-90 rounded-lg hover:bg-opacity-100 font-bold"
              >
                Move Right →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard controls */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
        <div className="text-sm">
          <div>🎮 Controls:</div>
          <div>← → : Move boat</div>
          <div>Click: Cast line</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default FishingGameTab;