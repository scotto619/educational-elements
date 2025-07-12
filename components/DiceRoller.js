// DiceRoller.js - Advanced Multi-Dice Rolling System (FIXED CONTRAST)
import React, { useState, useEffect, useRef } from 'react';

const DiceRoller = ({ showToast }) => {
  const [diceConfigs, setDiceConfigs] = useState([
    { id: 1, type: 'standard', values: ['1', '2', '3', '4', '5', '6'], result: null, isRolling: false }
  ]);
  const [rollHistory, setRollHistory] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showStatistics, setShowStatistics] = useState(true);
  const [showHistory, setShowHistory] = useState(true);
  const [customDiceModal, setCustomDiceModal] = useState(false);
  const [editingDice, setEditingDice] = useState(null);
  const [customValues, setCustomValues] = useState('');
  const [customName, setCustomName] = useState('');
  
  // Dice presets
  const dicePresets = {
    standard: { name: 'D6 Standard', values: ['1', '2', '3', '4', '5', '6'], shape: 'square' },
    d4: { name: 'D4', values: ['1', '2', '3', '4'], shape: 'triangle' },
    d8: { name: 'D8', values: ['1', '2', '3', '4', '5', '6', '7', '8'], shape: 'octagon' },
    d10: { name: 'D10', values: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], shape: 'square' },
    d12: { name: 'D12', values: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], shape: 'square' },
    d20: { name: 'D20', values: Array.from({length: 20}, (_, i) => (i + 1).toString()), shape: 'square' },
    d100: { name: 'D100', values: Array.from({length: 100}, (_, i) => (i + 1).toString()), shape: 'square' },
    coin: { name: 'Coin', values: ['Heads', 'Tails'], shape: 'circle' },
    yesno: { name: 'Yes/No', values: ['Yes', 'No', 'Maybe'], shape: 'square' },
    colors: { name: 'Colors', values: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'], shape: 'square' },
    directions: { name: 'Directions', values: ['North', 'South', 'East', 'West'], shape: 'square' }
  };

  // Sound effects
  const audioRef = useRef(null);
  
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');
  }, []);

  const playRollSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Add new dice
  const addDice = (preset = 'standard') => {
    const newDice = {
      id: Date.now(),
      type: preset,
      values: [...dicePresets[preset].values],
      result: null,
      isRolling: false
    };
    setDiceConfigs(prev => [...prev, newDice]);
    showToast(`Added ${dicePresets[preset].name}!`);
  };

  // Remove dice
  const removeDice = (diceId) => {
    if (diceConfigs.length === 1) {
      showToast('You must have at least one dice!');
      return;
    }
    setDiceConfigs(prev => prev.filter(dice => dice.id !== diceId));
    showToast('Dice removed!');
  };

  // Roll single dice
  const rollSingleDice = (diceId) => {
    setDiceConfigs(prev => prev.map(dice => 
      dice.id === diceId 
        ? { ...dice, isRolling: true }
        : dice
    ));

    playRollSound();

    setTimeout(() => {
      setDiceConfigs(prev => prev.map(dice => {
        if (dice.id === diceId) {
          const randomIndex = Math.floor(Math.random() * dice.values.length);
          const result = dice.values[randomIndex];
          
          // Add to history
          addToHistory({
            diceId: dice.id,
            diceType: dice.type,
            result: result,
            timestamp: new Date()
          });

          return {
            ...dice,
            result: result,
            isRolling: false
          };
        }
        return dice;
      }));
    }, 1000 + Math.random() * 1000); // Variable roll time
  };

  // Roll all dice
  const rollAllDice = () => {
    setDiceConfigs(prev => prev.map(dice => ({ ...dice, isRolling: true })));
    playRollSound();

    setTimeout(() => {
      const rollResults = [];
      
      setDiceConfigs(prev => prev.map(dice => {
        const randomIndex = Math.floor(Math.random() * dice.values.length);
        const result = dice.values[randomIndex];
        
        rollResults.push({
          diceId: dice.id,
          diceType: dice.type,
          result: result,
          timestamp: new Date()
        });

        return {
          ...dice,
          result: result,
          isRolling: false
        };
      }));

      // Add all results to history as a group
      addToHistory(rollResults);
      
    }, 1000 + Math.random() * 1000);
  };

  // Add to roll history
  const addToHistory = (rollData) => {
    const historyEntry = {
      id: Date.now(),
      rolls: Array.isArray(rollData) ? rollData : [rollData],
      timestamp: new Date()
    };
    
    setRollHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 rolls
    updateStatistics(historyEntry.rolls);
  };

  // Update statistics
  const updateStatistics = (rolls) => {
    setStatistics(prev => {
      const newStats = { ...prev };
      
      rolls.forEach(roll => {
        const key = `${roll.diceType}-${roll.result}`;
        newStats[key] = (newStats[key] || 0) + 1;
      });
      
      return newStats;
    });
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Clear all roll history and statistics?')) {
      setRollHistory([]);
      setStatistics({});
      showToast('All data cleared!');
    }
  };

  // Get color for dice based on type
  const getDiceColor = (diceType, index) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  // Get dice shape class
  const getDiceShapeClass = (diceType) => {
    const shapes = {
      circle: 'rounded-full',
      triangle: 'rounded-lg transform rotate-45',
      octagon: 'rounded-xl',
      square: 'rounded-lg'
    };
    
    const preset = dicePresets[diceType];
    return shapes[preset?.shape] || shapes.square;
  };

  // Create custom dice
  const createCustomDice = () => {
    if (!customName.trim() || !customValues.trim()) {
      showToast('Please enter both name and values!', 'error');
      return;
    }

    const values = customValues.split(',').map(v => v.trim()).filter(v => v);
    if (values.length < 2) {
      showToast('Please enter at least 2 values!', 'error');
      return;
    }

    const newDice = {
      id: Date.now(),
      type: 'custom',
      name: customName,
      values: values,
      result: null,
      isRolling: false
    };

    setDiceConfigs(prev => [...prev, newDice]);
    setCustomDiceModal(false);
    setCustomName('');
    setCustomValues('');
    showToast(`Created custom dice: ${customName}!`);
  };

  // Calculate sum of numeric results
  const calculateSum = () => {
    return diceConfigs.reduce((sum, dice) => {
      const numResult = parseInt(dice.result);
      return sum + (isNaN(numResult) ? 0 : numResult);
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎲 Advanced Dice Roller</h2>
        <p className="text-gray-700">Roll multiple dice with custom values and detailed statistics</p>
      </div>

      {/* Dice Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800">Dice Setup</h3>
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => e.target.value && addDice(e.target.value)}
              value=""
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800"
            >
              <option value="">Add Dice...</option>
              {Object.entries(dicePresets).map(([key, preset]) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>
            <button
              onClick={() => setCustomDiceModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
            >
              + Custom Dice
            </button>
          </div>
        </div>

        {/* Dice Display */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          {diceConfigs.map((dice, index) => (
            <div key={dice.id} className="text-center">
              <div className="relative mb-2">
                <div
                  onClick={() => rollSingleDice(dice.id)}
                  className={`
                    w-20 h-20 mx-auto flex items-center justify-center cursor-pointer
                    text-white font-bold text-lg transition-all duration-200
                    hover:scale-105 hover:shadow-lg user-select-none
                    ${getDiceColor(dice.type, index)} ${getDiceShapeClass(dice.type)}
                    ${dice.isRolling ? 'animate-spin' : ''}
                  `}
                >
                  {dice.isRolling ? '🎲' : (dice.result || '?')}
                </div>
                
                <button
                  onClick={() => removeDice(dice.id)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="text-xs text-gray-700 font-semibold">
                {dice.name || dicePresets[dice.type]?.name || dice.type}
              </div>
              <div className="text-xs text-gray-600">
                {dice.values.length} sides
              </div>
            </div>
          ))}
        </div>

        {/* Roll Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={rollAllDice}
            disabled={diceConfigs.some(d => d.isRolling)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
          >
            🎲 Roll All Dice
          </button>
          
          <div className="text-lg font-bold text-gray-800">
            Sum: {calculateSum()}
          </div>
          
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roll History */}
        {showHistory && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Roll History ({rollHistory.length})
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-600 hover:text-gray-800 font-semibold"
              >
                Hide
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rollHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-4xl mb-2">🎲</div>
                  <p className="italic">No rolls yet</p>
                </div>
              ) : (
                rollHistory.map((entry) => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 font-semibold">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-sm text-gray-600">
                        {entry.rolls.length} dice
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {entry.rolls.map((roll, index) => (
                        <div key={index} className="px-2 py-1 bg-blue-100 rounded text-sm">
                          <span className="font-semibold text-gray-800">{roll.result}</span>
                          <span className="text-gray-600 ml-1">
                            ({dicePresets[roll.diceType]?.name || roll.diceType})
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {entry.rolls.length > 1 && (
                      <div className="mt-2 text-sm text-gray-700 font-semibold">
                        Sum: {entry.rolls.reduce((sum, roll) => {
                          const num = parseInt(roll.result);
                          return sum + (isNaN(num) ? 0 : num);
                        }, 0)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStatistics && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Statistics</h3>
              <button
                onClick={() => setShowStatistics(false)}
                className="text-gray-600 hover:text-gray-800 font-semibold"
              >
                Hide
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.keys(statistics).length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="italic">No statistics yet</p>
                </div>
              ) : (
                Object.entries(statistics)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([key, count]) => {
                    const [diceType, result] = key.split('-');
                    const diceName = dicePresets[diceType]?.name || diceType;
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-800">{result}</span>
                          <span className="text-xs text-gray-600">({diceName})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-200 rounded-full h-2 flex-1 min-w-16">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${(count / Math.max(...Object.values(statistics))) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-800 min-w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toggle Panels */}
      <div className="flex justify-center gap-4">
        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            📜 Show History
          </button>
        )}
        {!showStatistics && (
          <button
            onClick={() => setShowStatistics(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
          >
            📊 Show Statistics
          </button>
        )}
      </div>

      {/* Custom Dice Modal */}
      {customDiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Custom Dice</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Dice Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Action Dice"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Values (comma-separated)
                </label>
                <textarea
                  value={customValues}
                  onChange={(e) => setCustomValues(e.target.value)}
                  placeholder="e.g., Run, Jump, Hide, Attack, Defend, Rest"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 text-gray-800"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter at least 2 values separated by commas
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={createCustomDice}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Create Dice
              </button>
              <button
                onClick={() => {
                  setCustomDiceModal(false);
                  setCustomName('');
                  setCustomValues('');
                }}
                className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-select-none {
          user-select: none;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default DiceRoller;