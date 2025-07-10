// DiceRoller.js - Advanced Multi-Dice Rolling System
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
        ? { ...dice, isRolling: true, result: null }
        : dice
    ));

    setTimeout(() => {
      setDiceConfigs(prev => prev.map(dice => {
        if (dice.id === diceId) {
          const result = dice.values[Math.floor(Math.random() * dice.values.length)];
          return { ...dice, isRolling: false, result };
        }
        return dice;
      }));
    }, 800);
  };

  // Roll all dice
  const rollAllDice = () => {
    // Start rolling animation for all dice
    setDiceConfigs(prev => prev.map(dice => ({ ...dice, isRolling: true, result: null })));

    setTimeout(() => {
      const newResults = {};
      setDiceConfigs(prev => prev.map(dice => {
        const result = dice.values[Math.floor(Math.random() * dice.values.length)];
        newResults[dice.id] = { type: dice.type, result, values: dice.values };
        return { ...dice, isRolling: false, result };
      }));

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date(),
        results: newResults,
        total: calculateTotal(newResults)
      };
      
      setRollHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50 rolls
      updateStatistics(newResults);
      
      playRollSound();
      showToast(`Rolled! Total: ${historyEntry.total}`);
    }, 800);
  };

  // Calculate total (for numeric dice)
  const calculateTotal = (results) => {
    return Object.values(results).reduce((sum, { result }) => {
      const num = parseInt(result);
      return isNaN(num) ? sum : sum + num;
    }, 0);
  };

  // Update statistics
  const updateStatistics = (results) => {
    setStatistics(prev => {
      const newStats = { ...prev };
      
      Object.entries(results).forEach(([diceId, { result, type }]) => {
        if (!newStats[type]) {
          newStats[type] = {};
        }
        if (!newStats[type][result]) {
          newStats[type][result] = 0;
        }
        newStats[type][result]++;
      });
      
      return newStats;
    });
  };

  // Play roll sound
  const playRollSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.type = 'sawtooth';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Custom dice modal
  const CustomDiceModal = () => {
    const [customValues, setCustomValues] = useState('');
    const [customName, setCustomName] = useState('');

    const handleSaveCustomDice = () => {
      const values = customValues.split('\n').map(v => v.trim()).filter(v => v.length > 0);
      if (values.length < 2) {
        showToast('Please enter at least 2 values!');
        return;
      }

      if (editingDice) {
        // Edit existing dice
        setDiceConfigs(prev => prev.map(dice =>
          dice.id === editingDice.id
            ? { ...dice, values, type: 'custom' }
            : dice
        ));
        showToast('Dice updated!');
      } else {
        // Create new custom dice
        const newDice = {
          id: Date.now(),
          type: 'custom',
          values,
          result: null,
          isRolling: false
        };
        setDiceConfigs(prev => [...prev, newDice]);
        showToast(`Added custom dice with ${values.length} sides!`);
      }

      setCustomDiceModal(false);
      setEditingDice(null);
      setCustomValues('');
      setCustomName('');
    };

    useEffect(() => {
      if (editingDice) {
        setCustomValues(editingDice.values.join('\n'));
      }
    }, [editingDice]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingDice ? 'Edit Custom Dice' : 'Create Custom Dice'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dice Values (one per line)
              </label>
              <textarea
                value={customValues}
                onChange={(e) => setCustomValues(e.target.value)}
                placeholder="Red&#10;Blue&#10;Green&#10;Yellow"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each possible result on a new line
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setCustomDiceModal(false);
                setEditingDice(null);
                setCustomValues('');
              }}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustomDice}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {editingDice ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Get dice shape class
  const getDiceShapeClass = (diceType) => {
    const preset = dicePresets[diceType];
    if (!preset) return '';
    
    switch (preset.shape) {
      case 'circle': return 'rounded-full';
      case 'triangle': return 'dice-triangle';
      case 'octagon': return 'dice-octagon';
      default: return 'rounded-xl';
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all history and statistics?')) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎲 Advanced Dice Roller</h2>
        <p className="text-gray-600">Roll multiple dice with custom values and detailed statistics</p>
      </div>

      {/* Dice Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800">Dice Setup</h3>
          <div className="flex flex-wrap gap-2">
            <select
              onChange={(e) => e.target.value && addDice(e.target.value)}
              value=""
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="text-xs font-semibold text-gray-700 mb-1">
                {dicePresets[dice.type]?.name || 'Custom'}
              </div>
              
              {dice.type === 'custom' && (
                <button
                  onClick={() => {
                    setEditingDice(dice);
                    setCustomDiceModal(true);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Roll Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={rollAllDice}
            disabled={diceConfigs.some(dice => dice.isRolling)}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
          >
            🎲 Roll All Dice
          </button>
          <button
            onClick={clearAllData}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            🗑️ Clear Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roll History */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Roll History</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showHistory}
                onChange={(e) => setShowHistory(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">Show</span>
            </label>
          </div>

          {showHistory && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {rollHistory.length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No rolls yet. Start rolling!</p>
              ) : (
                rollHistory.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(entry.results).map(([diceId, { result, type }]) => (
                          <span
                            key={diceId}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold"
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                      {entry.total > 0 && (
                        <span className="font-bold text-green-600">
                          Total: {entry.total}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Statistics</h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showStatistics}
                onChange={(e) => setShowStatistics(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">Show</span>
            </label>
          </div>

          {showStatistics && (
            <div className="max-h-96 overflow-y-auto">
              {Object.keys(statistics).length === 0 ? (
                <p className="text-gray-500 italic text-center py-8">No statistics yet. Start rolling!</p>
              ) : (
                Object.entries(statistics).map(([diceType, results]) => {
                  const preset = dicePresets[diceType];
                  const total = Object.values(results).reduce((sum, count) => sum + count, 0);
                  
                  return (
                    <div key={diceType} className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {preset?.name || 'Custom Dice'} ({total} rolls)
                      </h4>
                      
                      <div className="space-y-2">
                        {Object.entries(results)
                          .sort(([a], [b]) => {
                            const numA = parseInt(a);
                            const numB = parseInt(b);
                            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                            return a.localeCompare(b);
                          })
                          .map(([result, count]) => {
                            const percentage = ((count / total) * 100).toFixed(1);
                            return (
                              <div key={result} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{result}</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-600 w-12 text-right">
                                    {count} ({percentage}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Dice Modal */}
      {customDiceModal && <CustomDiceModal />}

      <style jsx>{`
        .dice-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
        
        .dice-octagon {
          clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
        }
        
        .user-select-none {
          user-select: none;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin {
          animation: spin 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DiceRoller;