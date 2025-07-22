// components/features/fishing/index.js - Fishing Game Components
// These focused components handle the fishing mini-game

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  SelectField,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents } from '../../../hooks';
import soundService from '../../../services/soundService';

// ===============================================
// FISH DATA AND CONFIGURATION
// ===============================================

const FISH_TYPES = [
  { 
    id: 'common', 
    name: 'Goldfish', 
    emoji: '🐠', 
    rarity: 'common', 
    prize: { type: 'coins', value: 5 },
    speed: 2,
    size: 30
  },
  { 
    id: 'uncommon', 
    name: 'Clownfish', 
    emoji: '🐡', 
    rarity: 'uncommon', 
    prize: { type: 'coins', value: 10 },
    speed: 3,
    size: 35
  },
  { 
    id: 'rare', 
    name: 'Angelfish', 
    emoji: '🐟', 
    rarity: 'rare', 
    prize: { type: 'xp', value: 5 },
    speed: 4,
    size: 40
  },
  { 
    id: 'epic', 
    name: 'Shark', 
    emoji: '🦈', 
    rarity: 'epic', 
    prize: { type: 'xp', value: 10 },
    speed: 5,
    size: 50
  },
  { 
    id: 'legendary', 
    name: 'Rainbow Fish', 
    emoji: '🌈', 
    rarity: 'legendary', 
    prize: { type: 'both', coins: 20, xp: 10 },
    speed: 6,
    size: 45
  }
];

const GAME_CONFIG = {
  POND_WIDTH: 800,
  POND_HEIGHT: 400,
  LURE_SIZE: 20,
  FISHING_DURATION: 30000, // 30 seconds
  FISH_SPAWN_RATE: 2000, // Every 2 seconds
  MAX_FISH: 8
};

// ===============================================
// FISH COMPONENT
// ===============================================

/**
 * Individual animated fish in the pond
 */
const Fish = ({ 
  fish, 
  pondWidth, 
  pondHeight, 
  onCatch,
  isActive = true 
}) => {
  const [position, setPosition] = useState({
    x: Math.random() * (pondWidth - fish.size),
    y: Math.random() * (pondHeight - fish.size)
  });
  const [direction, setDirection] = useState({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2
  });

  const animationFrameRef = useRef();

  const moveFish = useCallback(() => {
    if (!isActive) return;

    setPosition(prevPos => {
      let newX = prevPos.x + direction.x * fish.speed;
      let newY = prevPos.y + direction.y * fish.speed;
      let newDirectionX = direction.x;
      let newDirectionY = direction.y;

      // Bounce off walls
      if (newX <= 0 || newX >= pondWidth - fish.size) {
        newDirectionX = -direction.x;
        newX = Math.max(0, Math.min(pondWidth - fish.size, newX));
      }
      if (newY <= 0 || newY >= pondHeight - fish.size) {
        newDirectionY = -direction.y;
        newY = Math.max(0, Math.min(pondHeight - fish.size, newY));
      }

      // Update direction for next frame
      setDirection({ x: newDirectionX, y: newDirectionY });

      return { x: newX, y: newY };
    });

    animationFrameRef.current = requestAnimationFrame(moveFish);
  }, [fish.speed, fish.size, pondWidth, pondHeight, direction, isActive]);

  useEffect(() => {
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(moveFish);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [moveFish, isActive]);

  const handleClick = () => {
    if (isActive) {
      onCatch(fish);
    }
  };

  return (
    <div
      className={`
        absolute cursor-pointer transition-transform hover:scale-110
        ${fish.rarity === 'legendary' ? 'animate-pulse' : ''}
        ${fish.rarity === 'epic' ? 'drop-shadow-lg' : ''}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${fish.size}px`,
        zIndex: fish.rarity === 'legendary' ? 10 : 5
      }}
      onClick={handleClick}
      title={`${fish.name} - ${fish.rarity}`}
    >
      {fish.emoji}
    </div>
  );
};

// ===============================================
// FISHING LURE COMPONENT
// ===============================================

/**
 * Animated fishing lure that drops down
 */
const FishingLure = ({ 
  isDropping, 
  position, 
  pondHeight,
  onReachBottom 
}) => {
  const [lureY, setLureY] = useState(0);
  const animationFrameRef = useRef();

  const dropLure = useCallback(() => {
    if (!isDropping) return;

    setLureY(prevY => {
      const newY = prevY + 8; // Drop speed
      
      if (newY >= pondHeight - GAME_CONFIG.LURE_SIZE) {
        onReachBottom();
        return pondHeight - GAME_CONFIG.LURE_SIZE;
      }
      
      return newY;
    });

    animationFrameRef.current = requestAnimationFrame(dropLure);
  }, [isDropping, pondHeight, onReachBottom]);

  useEffect(() => {
    if (isDropping) {
      setLureY(0);
      animationFrameRef.current = requestAnimationFrame(dropLure);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dropLure, isDropping]);

  if (!isDropping && lureY === 0) return null;

  return (
    <div
      className="absolute z-20 transition-all duration-100"
      style={{
        left: `${position.x - GAME_CONFIG.LURE_SIZE / 2}px`,
        top: `${lureY}px`,
        width: `${GAME_CONFIG.LURE_SIZE}px`,
        height: `${GAME_CONFIG.LURE_SIZE}px`
      }}
    >
      {/* Fishing Line */}
      <div 
        className="absolute bg-black"
        style={{
          left: `${GAME_CONFIG.LURE_SIZE / 2 - 1}px`,
          top: `${-lureY}px`,
          width: '2px',
          height: `${lureY}px`
        }}
      />
      
      {/* Lure */}
      <div className="w-full h-full bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center text-xs">
        🎣
      </div>
    </div>
  );
};

// ===============================================
// FISHING POND COMPONENT
// ===============================================

/**
 * Main fishing pond with fish and interaction
 */
export const FishingPond = ({ 
  selectedStudent,
  isPlaying,
  onCatch,
  onGameEnd 
}) => {
  const [fish, setFish] = useState([]);
  const [lure, setLure] = useState({ isDropping: false, position: { x: 0, y: 0 } });
  const [timeLeft, setTimeLeft] = useState(GAME_CONFIG.FISHING_DURATION / 1000);
  const [score, setScore] = useState({ coins: 0, xp: 0, fish: [] });

  const pondRef = useRef(null);
  const gameTimerRef = useRef(null);
  const fishSpawnRef = useRef(null);

  // Spawn new fish periodically
  const spawnFish = useCallback(() => {
    if (!isPlaying || fish.length >= GAME_CONFIG.MAX_FISH) return;

    const fishType = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
    const newFish = {
      ...fishType,
      id: Date.now() + Math.random(),
      spawnTime: Date.now()
    };

    setFish(prevFish => [...prevFish, newFish]);
  }, [fish.length, isPlaying]);

  // Handle clicking on the pond to drop lure
  const handlePondClick = (event) => {
    if (!isPlaying || lure.isDropping) return;

    const rect = pondRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setLure({
      isDropping: true,
      position: { x, y: 0 }
    });

    soundService.playClickSound();
  };

  // Handle lure reaching bottom
  const handleLureReachBottom = () => {
    setLure(prev => ({ ...prev, isDropping: false }));
    
    // Check for fish catches
    const caughtFish = fish.filter(f => {
      const fishCenterX = f.x + f.size / 2;
      const fishCenterY = f.y + f.size / 2;
      const lureCenterX = lure.position.x;
      const lureCenterY = GAME_CONFIG.POND_HEIGHT - GAME_CONFIG.LURE_SIZE / 2;
      
      const distance = Math.sqrt(
        Math.pow(fishCenterX - lureCenterX, 2) + 
        Math.pow(fishCenterY - lureCenterY, 2)
      );
      
      return distance < (f.size / 2 + GAME_CONFIG.LURE_SIZE / 2);
    });

    if (caughtFish.length > 0) {
      handleFishCatch(caughtFish[0]);
    }
  };

  // Handle catching a fish
  const handleFishCatch = (caughtFish) => {
    soundService.playFishingCatchSound();
    
    // Remove caught fish
    setFish(prevFish => prevFish.filter(f => f.id !== caughtFish.id));
    
    // Update score
    setScore(prevScore => {
      const newScore = {
        coins: prevScore.coins + (caughtFish.prize.value || caughtFish.prize.coins || 0),
        xp: prevScore.xp + (caughtFish.prize.xp || 0),
        fish: [...prevScore.fish, caughtFish]
      };
      
      onCatch?.(caughtFish, newScore);
      return newScore;
    });
  };

  // Start game
  useEffect(() => {
    if (isPlaying) {
      setTimeLeft(GAME_CONFIG.FISHING_DURATION / 1000);
      setScore({ coins: 0, xp: 0, fish: [] });
      setFish([]);
      
      // Game timer
      gameTimerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onGameEnd?.(score);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Fish spawning
      fishSpawnRef.current = setInterval(spawnFish, GAME_CONFIG.FISH_SPAWN_RATE);
      
      // Spawn initial fish
      spawnFish();
    } else {
      clearInterval(gameTimerRef.current);
      clearInterval(fishSpawnRef.current);
    }

    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(fishSpawnRef.current);
    };
  }, [isPlaying, spawnFish, onGameEnd, score]);

  if (!selectedStudent) {
    return (
      <Card title="Fishing Pond">
        <EmptyState
          icon="🎣"
          title="Select a Student"
          description="Choose a student to start fishing!"
        />
      </Card>
    );
  }

  return (
    <Card title={`${selectedStudent.firstName}'s Fishing Adventure`}>
      <div className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{timeLeft}s</div>
            <div className="text-sm text-blue-700">Time Left</div>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{score.coins}</div>
            <div className="text-sm text-yellow-700">Coins Earned</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{score.xp}</div>
            <div className="text-sm text-purple-700">XP Earned</div>
          </div>
        </div>

        {/* Fishing Pond */}
        <div className="relative">
          <div
            ref={pondRef}
            className="relative bg-gradient-to-b from-blue-200 to-blue-400 rounded-lg border-4 border-blue-300 cursor-crosshair overflow-hidden"
            style={{ 
              width: `${GAME_CONFIG.POND_WIDTH}px`, 
              height: `${GAME_CONFIG.POND_HEIGHT}px`,
              maxWidth: '100%',
              margin: '0 auto'
            }}
            onClick={handlePondClick}
          >
            {/* Water effect */}
            <div className="absolute inset-0 bg-blue-300 opacity-30 animate-pulse" />
            
            {/* Fish */}
            {fish.map(f => (
              <Fish
                key={f.id}
                fish={f}
                pondWidth={GAME_CONFIG.POND_WIDTH}
                pondHeight={GAME_CONFIG.POND_HEIGHT}
                onCatch={handleFishCatch}
                isActive={isPlaying}
              />
            ))}

            {/* Fishing Lure */}
            <FishingLure
              isDropping={lure.isDropping}
              position={lure.position}
              pondHeight={GAME_CONFIG.POND_HEIGHT}
              onReachBottom={handleLureReachBottom}
            />

            {/* Game over overlay */}
            {!isPlaying && timeLeft === 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    Fishing Complete!
                  </div>
                  <div className="text-gray-600">
                    Final Score: {score.fish.length} fish caught
                  </div>
                </div>
              </div>
            )}

            {/* Instructions overlay */}
            {!isPlaying && timeLeft > 0 && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="bg-white/90 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-gray-800 mb-2">
                    🎣 How to Fish 🎣
                  </div>
                  <div className="text-sm text-gray-600">
                    Click anywhere in the pond to drop your lure!
                    <br />
                    Try to hit the swimming fish to catch them.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Caught Fish Display */}
        {score.fish.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-bold text-green-800 mb-2">Fish Caught:</h4>
            <div className="flex flex-wrap gap-2">
              {score.fish.map((fish, index) => (
                <div 
                  key={index}
                  className={`
                    flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium
                    ${fish.rarity === 'legendary' ? 'bg-yellow-200 text-yellow-800' :
                      fish.rarity === 'epic' ? 'bg-purple-200 text-purple-800' :
                      fish.rarity === 'rare' ? 'bg-blue-200 text-blue-800' :
                      fish.rarity === 'uncommon' ? 'bg-green-200 text-green-800' :
                      'bg-gray-200 text-gray-800'}
                  `}
                >
                  <span>{fish.emoji}</span>
                  <span>{fish.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// STUDENT SELECTOR FOR FISHING
// ===============================================

/**
 * Interface for selecting which student goes fishing
 */
export const FishingStudentSelector = ({ 
  students, 
  selectedStudent, 
  onStudentSelect 
}) => {
  return (
    <Card title="Select Fisher">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Choose which student will go fishing today!
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map(student => (
            <button
              key={student.id}
              onClick={() => onStudentSelect(student)}
              className={`
                p-3 rounded-lg border-2 transition-all text-center
                ${selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <img
                src={student.avatar}
                alt={`${student.firstName}'s avatar`}
                className="w-12 h-12 mx-auto rounded-full border-2 border-white mb-2"
                onError={(e) => {
                  e.target.src = '/Avatars/Wizard F/Level 1.png';
                }}
              />
              
              <div className="font-medium text-sm">
                {student.firstName}
              </div>
              <div className="text-xs text-gray-600">
                Level {student.level || 1}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// MAIN FISHING TAB COMPONENT
// ===============================================

/**
 * Complete Fishing Game tab using smaller components
 */
export const FishingTab = ({ userId, classId }) => {
  const { students, loading } = useStudents(userId, classId);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  const startFishing = () => {
    if (!selectedStudent) return;
    setIsPlaying(true);
    setGameResults(null);
  };

  const handleGameEnd = (finalScore) => {
    setIsPlaying(false);
    setGameResults(finalScore);
    
    // Here you would integrate with your student service to award prizes
    console.log('Game ended with score:', finalScore);
  };

  const handleCatch = (fish, currentScore) => {
    console.log('Caught fish:', fish, 'Current score:', currentScore);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Classroom Fishing Adventure! 🎣
        </h1>
        <p className="text-gray-600 mt-2">
          Cast your line and catch some prizes!
        </p>
      </div>

      {/* Student Selection */}
      <FishingStudentSelector
        students={students}
        selectedStudent={selectedStudent}
        onStudentSelect={setSelectedStudent}
      />

      {/* Game Controls */}
      {selectedStudent && (
        <Card title="Game Controls">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">
                {selectedStudent.firstName} is ready to fish!
              </h3>
              <p className="text-blue-700 text-sm">
                Click "Start Fishing" to begin the 30-second challenge.
                Click anywhere in the pond to drop your lure and try to catch fish!
              </p>
            </div>

            <Button
              onClick={startFishing}
              disabled={isPlaying}
              className="bg-blue-500 hover:bg-blue-600"
              size="lg"
            >
              {isPlaying ? 'Fishing in Progress...' : 'Start Fishing!'}
            </Button>
          </div>
        </Card>
      )}

      {/* Fishing Pond */}
      <FishingPond
        selectedStudent={selectedStudent}
        isPlaying={isPlaying}
        onCatch={handleCatch}
        onGameEnd={handleGameEnd}
      />

      {/* Game Results */}
      {gameResults && (
        <Card title="Fishing Results">
          <div className="text-center space-y-4">
            <div className="text-6xl">🏆</div>
            <h3 className="text-xl font-bold text-gray-800">
              Great Fishing, {selectedStudent.firstName}!
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {gameResults.fish.length}
                </div>
                <div className="text-sm text-yellow-700">Fish Caught</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {gameResults.coins}
                </div>
                <div className="text-sm text-blue-700">Coins Earned</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {gameResults.xp}
                </div>
                <div className="text-sm text-purple-700">XP Earned</div>
              </div>
            </div>

            <Button
              onClick={() => {
                setGameResults(null);
                setSelectedStudent(null);
              }}
              variant="secondary"
            >
              Fish Again
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// Export all components
