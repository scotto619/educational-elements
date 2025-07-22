// components/features/race/index.js - Pet Race Game Components
// These focused components handle the pet racing mini-game

import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  SelectField,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents } from '../../../hooks';
import { GAME_CONFIG } from '../../../config/gameData';
import gameLogic from '../../../services/gameLogic';
import soundService from '../../../services/soundService';

// ===============================================
// RACE TRACK COMPONENT
// ===============================================

/**
 * Animated race track with pets racing
 */
export const RaceTrack = ({ 
  racingPets, 
  isRacing, 
  raceProgress, 
  onRaceComplete 
}) => {
  const trackRef = useRef(null);
  const [trackWidth, setTrackWidth] = useState(800);

  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  const finishLine = trackWidth * GAME_CONFIG.RACE_DISTANCE;

  return (
    <Card>
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-center text-gray-800">
          🏁 Pet Race Track 🏁
        </h3>
        
        <div 
          ref={trackRef}
          className="relative bg-green-100 border-2 border-green-300 rounded-lg p-4 min-h-64"
          style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 40px)' }}
        >
          {/* Starting Line */}
          <div className="absolute left-4 top-0 bottom-0 w-1 bg-white border-l-2 border-dashed border-gray-400">
            <div className="absolute -left-6 top-2 text-xs font-bold text-gray-600 transform -rotate-90">
              START
            </div>
          </div>

          {/* Finish Line */}
          <div 
            className="absolute top-0 bottom-0 w-2 bg-yellow-400 border-2 border-yellow-600"
            style={{ left: `${finishLine}px` }}
          >
            <div className="absolute -left-8 top-2 text-xs font-bold text-yellow-800 transform -rotate-90">
              FINISH
            </div>
          </div>

          {/* Racing Pets */}
          <div className="space-y-3 pt-8">
            {racingPets.map((pet, index) => {
              const progress = raceProgress[pet.id] || 0;
              const position = Math.min(progress * finishLine, finishLine);
              
              return (
                <div key={pet.id} className="relative h-12 flex items-center">
                  {/* Lane */}
                  <div className="absolute inset-0 bg-white/20 rounded border border-white/40" />
                  
                  {/* Pet */}
                  <div
                    className={`
                      absolute transition-all duration-200 flex items-center space-x-2 z-10
                      ${isRacing ? 'animate-bounce' : ''}
                    `}
                    style={{ 
                      left: `${Math.max(20, position)}px`,
                      transform: isRacing ? 'translateX(0)' : 'translateX(0)'
                    }}
                  >
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className={`w-10 h-10 rounded-full border-2 border-white ${isRacing ? 'animate-pulse' : ''}`}
                      onError={(e) => {
                        e.target.src = '/Pets/Wizard.png';
                      }}
                    />
                    
                    {/* Pet info bubble */}
                    <div className="bg-white/90 rounded px-2 py-1 text-xs font-medium">
                      {pet.name}
                    </div>
                  </div>

                  {/* Student Name */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-700">
                    {pet.ownerName}
                  </div>

                  {/* Speed indicator */}
                  <div className="absolute left-2 bottom-1 text-xs text-gray-600">
                    Speed: {pet.speed?.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Race status overlay */}
          {isRacing && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="bg-white/90 px-6 py-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-800">Racing!</div>
                <div className="text-sm text-gray-600">Pets are running...</div>
              </div>
            </div>
          )}
        </div>

        {/* Race Progress Bar */}
        {isRacing && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Overall Progress</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.max(...Object.values(raceProgress)) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// PET SELECTION COMPONENT
// ===============================================

/**
 * Interface for selecting pets for the race
 */
export const PetSelection = ({ 
  students, 
  selectedPets, 
  onPetSelect, 
  maxPets = 6 
}) => {
  const studentsWithPets = students.filter(student => student.pet?.image);

  if (studentsWithPets.length === 0) {
    return (
      <Card title="Select Racing Pets">
        <EmptyState
          icon="🐾"
          title="No Pets Available"
          description="Students need to unlock pets before they can race!"
        />
      </Card>
    );
  }

  return (
    <Card title="Select Racing Pets">
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          Choose up to {maxPets} pets to race. Selected: {selectedPets.length}/{maxPets}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {studentsWithPets.map(student => {
            const isSelected = selectedPets.some(pet => pet.id === student.id);
            const canSelect = selectedPets.length < maxPets || isSelected;
            
            return (
              <button
                key={student.id}
                onClick={() => canSelect && onPetSelect(student)}
                disabled={!canSelect}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-800' 
                    : canSelect
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={student.pet.image}
                    alt={student.pet.name}
                    className="w-12 h-12 rounded-full border-2 border-white"
                    onError={(e) => {
                      e.target.src = '/Pets/Wizard.png';
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {student.pet.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Owner: {student.firstName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Speed: {gameLogic.calculatePetSpeed(student.pet, student).toFixed(1)}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="text-blue-500">✓</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {selectedPets.length > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Selected for Race:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedPets.map(pet => (
                <span 
                  key={pet.id}
                  className="bg-white text-blue-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {pet.pet.name} ({pet.firstName})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// RACE PRIZES COMPONENT
// ===============================================

/**
 * Prize selection and distribution interface
 */
export const RacePrizes = ({ 
  prizes, 
  onPrizeChange, 
  winnerPet,
  onDistributePrize 
}) => {
  const [selectedPrize, setSelectedPrize] = useState(prizes[0] || null);

  const defaultPrizes = [
    { id: 'xp5', name: '5 XP Boost', type: 'xp', value: 5, icon: '⭐' },
    { id: 'xp10', name: '10 XP Boost', type: 'xp', value: 10, icon: '🌟' },
    { id: 'coins10', name: '10 Coins', type: 'coins', value: 10, icon: '🪙' },
    { id: 'coins20', name: '20 Coins', type: 'coins', value: 20, icon: '💰' },
    { id: 'speed', name: 'Pet Speed Boost', type: 'speed', value: 0.2, icon: '⚡' }
  ];

  const availablePrizes = prizes.length > 0 ? prizes : defaultPrizes;

  return (
    <Card title="Race Prizes">
      <div className="space-y-4">
        {/* Prize Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Prize for Winner
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availablePrizes.map(prize => (
              <button
                key={prize.id}
                onClick={() => {
                  setSelectedPrize(prize);
                  onPrizeChange(prize);
                }}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${selectedPrize?.id === prize.id
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-800'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-2xl mb-1">{prize.icon}</div>
                <div className="text-sm font-medium">{prize.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Winner Display */}
        {winnerPet && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-center space-y-3">
              <div className="text-2xl">🏆</div>
              <h3 className="text-lg font-bold text-yellow-800">
                Winner: {winnerPet.pet.name}!
              </h3>
              <div className="text-yellow-700">
                Owner: {winnerPet.firstName} {winnerPet.lastName}
              </div>
              
              {selectedPrize && (
                <div className="bg-white p-3 rounded border">
                  <div className="text-sm text-gray-600 mb-1">Prize:</div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xl">{selectedPrize.icon}</span>
                    <span className="font-medium">{selectedPrize.name}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => onDistributePrize(winnerPet, selectedPrize)}
                disabled={!selectedPrize}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Award Prize
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// RACE CONTROLLER COMPONENT
// ===============================================

/**
 * Main race control logic and state management
 */
export const RaceController = ({ 
  selectedPets, 
  selectedPrize,
  onRaceComplete 
}) => {
  const [isRacing, setIsRacing] = useState(false);
  const [raceProgress, setRaceProgress] = useState({});
  const [winner, setWinner] = useState(null);
  const [raceHistory, setRaceHistory] = useState([]);

  const raceIntervalRef = useRef(null);

  const startRace = () => {
    if (selectedPets.length < 2) {
      alert('Need at least 2 pets to race!');
      return;
    }

    setIsRacing(true);
    setWinner(null);
    setRaceProgress({});
    
    // Play race start sound
    soundService.playRaceStartSound();

    // Initialize progress for all pets
    const initialProgress = {};
    selectedPets.forEach(pet => {
      initialProgress[pet.id] = 0;
    });
    setRaceProgress(initialProgress);

    // Start race simulation
    raceIntervalRef.current = setInterval(() => {
      setRaceProgress(prevProgress => {
        const newProgress = { ...prevProgress };
        let raceFinished = false;
        let currentWinner = null;

        selectedPets.forEach(pet => {
          if (newProgress[pet.id] < 1) {
            // Calculate progress increment based on pet speed
            const petSpeed = gameLogic.calculatePetSpeed(pet.pet, pet);
            const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
            const increment = (petSpeed / 100) * randomFactor;
            
            newProgress[pet.id] = Math.min(
              (newProgress[pet.id] || 0) + increment, 
              1
            );

            // Check if this pet won
            if (newProgress[pet.id] >= 1 && !currentWinner) {
              currentWinner = pet;
              raceFinished = true;
            }
          }
        });

        if (raceFinished && currentWinner) {
          setIsRacing(false);
          setWinner(currentWinner);
          
          // Play victory sound
          soundService.playRaceWinSound();
          
          // Add to race history
          setRaceHistory(prev => [
            {
              id: Date.now(),
              winner: currentWinner,
              participants: selectedPets,
              timestamp: new Date().toISOString(),
              prize: selectedPrize
            },
            ...prev.slice(0, 9) // Keep last 10 races
          ]);

          // Clear interval
          clearInterval(raceIntervalRef.current);
          
          // Notify parent component
          onRaceComplete?.(currentWinner);
        }

        return newProgress;
      });
    }, 100); // Update every 100ms
  };

  const resetRace = () => {
    setIsRacing(false);
    setWinner(null);
    setRaceProgress({});
    clearInterval(raceIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      clearInterval(raceIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Race Controls */}
      <Card title="Race Controls">
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={startRace}
            disabled={isRacing || selectedPets.length < 2}
            className="bg-green-500 hover:bg-green-600"
            size="lg"
          >
            {isRacing ? 'Racing...' : 'Start Race!'}
          </Button>
          
          <Button
            onClick={resetRace}
            variant="secondary"
            size="lg"
          >
            Reset
          </Button>
        </div>
        
        {selectedPets.length < 2 && (
          <div className="text-center text-sm text-gray-600 mt-2">
            Select at least 2 pets to start racing
          </div>
        )}
      </Card>

      {/* Race Track */}
      <RaceTrack
        racingPets={selectedPets}
        isRacing={isRacing}
        raceProgress={raceProgress}
        onRaceComplete={onRaceComplete}
      />

      {/* Race History */}
      {raceHistory.length > 0 && (
        <Card title="Recent Race Results">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {raceHistory.map(race => (
              <div key={race.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span>🏆</span>
                  <span className="font-medium">{race.winner.pet.name}</span>
                  <span className="text-sm text-gray-600">
                    ({race.winner.firstName})
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(race.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ===============================================
// MAIN PET RACE TAB COMPONENT
// ===============================================

/**
 * Complete Pet Race tab using smaller components
 */
export const PetRaceTab = ({ userId, classId }) => {
  const { students, loading } = useStudents(userId, classId);
  const [selectedPets, setSelectedPets] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [winner, setWinner] = useState(null);

  const handlePetSelect = (student) => {
    setSelectedPets(prev => {
      const isSelected = prev.some(pet => pet.id === student.id);
      if (isSelected) {
        return prev.filter(pet => pet.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleRaceComplete = (winnerPet) => {
    setWinner(winnerPet);
  };

  const handleDistributePrize = async (winnerPet, prize) => {
    // Here you would integrate with your student service to award the prize
    console.log('Awarding prize:', prize, 'to:', winnerPet);
    
    // Reset for next race
    setWinner(null);
    setSelectedPets([]);
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
      <div className="text-center py-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Pet Racing Championship! 🏁
        </h1>
        <p className="text-gray-600 mt-2">
          Select pets and watch them race for prizes!
        </p>
      </div>

      {/* Pet Selection */}
      <PetSelection
        students={students}
        selectedPets={selectedPets}
        onPetSelect={handlePetSelect}
        maxPets={6}
      />

      {/* Race Controller */}
      {selectedPets.length > 0 && (
        <RaceController
          selectedPets={selectedPets}
          selectedPrize={selectedPrize}
          onRaceComplete={handleRaceComplete}
        />
      )}

      {/* Prize System */}
      <RacePrizes
        prizes={[]}
        onPrizeChange={setSelectedPrize}
        winnerPet={winner}
        onDistributePrize={handleDistributePrize}
      />
    </div>
  );
};

// Export all components
export {
  RaceTrack,
  PetSelection,
  RacePrizes,
  RaceController,
  PetRaceTab
};