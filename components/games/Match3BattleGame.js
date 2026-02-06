// components/games/Match3BattleGame.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// CONSTANTS & CONFIGURATION
// ==========================================
const GRID_SIZE = 8;
const MIN_MATCH = 3;

// Tile Definitions
const TILE_TYPES = {
  SWORD: { id: 'sword', emoji: '⚔️', color: 'bg-red-500', label: 'Attack' },
  SHIELD: { id: 'shield', emoji: '🛡️', color: 'bg-blue-500', label: 'Block' },
  POTION: { id: 'potion', emoji: '🧪', color: 'bg-green-500', label: 'Heal' },
  MANA: { id: 'mana', emoji: '✨', color: 'bg-purple-500', label: 'Mana' },
  COIN: { id: 'coin', emoji: '💰', color: 'bg-yellow-500', label: 'Gold' },
  SKULL: { id: 'skull', emoji: '💀', color: 'bg-gray-800', label: 'Curse' }, // Enemy specific or special
};

const TILE_KEYS = ['SWORD', 'SHIELD', 'POTION', 'MANA', 'COIN', 'SKULL'];

// Shop Items
const SHOP_ITEMS = {
  WEAPONS: [
    { id: 'wood_sword', name: 'Wooden Sword', cost: 0, damage: 5, desc: 'Basic starter weapon.' },
    { id: 'iron_sword', name: 'Iron Sword', cost: 100, damage: 8, desc: 'Sturdy and reliable.' },
    { id: 'steel_sword', name: 'Steel Blade', cost: 250, damage: 12, desc: 'Sharp and deadly.' },
    { id: 'mithril_sword', name: 'Mithril Edge', cost: 600, damage: 18, desc: 'Lightweight and powerful.' },
    { id: 'dragon_blade', name: 'Dragon Slayer', cost: 1500, damage: 25, desc: 'Forged in dragon fire.' },
  ],
  ARMOR: [
    { id: 'cloth_tunic', name: 'Cloth Tunic', cost: 0, hp: 50, desc: 'Offers minimal protection.' },
    { id: 'leather_armor', name: 'Leather Armor', cost: 100, hp: 80, desc: 'Decent protection.' },
    { id: 'chainmail', name: 'Chainmail', cost: 250, hp: 120, desc: 'Strong against cuts.' },
    { id: 'plate_armor', name: 'Plate Armor', cost: 600, hp: 180, desc: 'Heavy protection.' },
    { id: 'enchanted_plate', name: 'Enchanted Plate', cost: 1500, hp: 250, desc: 'Magically reinforced.' },
  ]
};

// Enemy Definitions
const ENEMIES = [
  { name: 'Slime', hp: 30, dmg: 4, xp: 10, gold: 5, emoji: '🟢' },
  { name: 'Rat', hp: 45, dmg: 6, xp: 15, gold: 8, emoji: '🐀' },
  { name: 'Goblin', hp: 60, dmg: 8, xp: 25, gold: 12, emoji: '👺' },
  { name: 'Wolf', hp: 80, dmg: 10, xp: 35, gold: 18, emoji: '🐺' },
  { name: 'Skeleton', hp: 100, dmg: 12, xp: 50, gold: 25, emoji: '💀' },
  { name: 'Orc', hp: 150, dmg: 15, xp: 75, gold: 40, emoji: '👹' },
  { name: 'Troll', hp: 200, dmg: 20, xp: 100, gold: 60, emoji: '' }, // Placeholder emoji
  { name: 'Dragon', hp: 500, dmg: 35, xp: 500, gold: 200, emoji: '🐲', boss: true },
];


// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const getRandomTile = () => {
  const key = TILE_KEYS[Math.floor(Math.random() * TILE_KEYS.length)];
  return { ...TILE_TYPES[key], uid: Math.random().toString(36).substr(2, 9) };
};

const createBoard = () => {
  const board = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      row.push(getRandomTile());
    }
    board.push(row);
  }
  // Simple check to remove initial matches (optional but good for UX)
  // For now, let's keep it simple; if there are initial matches, the player gets a free combo!
  return board;
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const Match3BattleGame = ({ studentData, updateStudentData }) => {
  // Game State
  const [board, setBoard] = useState(createBoard());
  const [selectedTile, setSelectedTile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animatingTiles, setAnimatingTiles] = useState([]);
  const [comboCount, setComboCount] = useState(0);

  // Player State
  const [player, setPlayer] = useState({
    hp: 100,
    maxHp: 100,
    mana: 0,
    maxMana: 100,
    shield: 0,
    gold: studentData?.gameProgress?.match3?.gold || 0,
    level: studentData?.gameProgress?.match3?.level || 1,
    xp: studentData?.gameProgress?.match3?.xp || 0,
    weaponId: studentData?.gameProgress?.match3?.weaponId || 'wood_sword',
    armorId: studentData?.gameProgress?.match3?.armorId || 'cloth_tunic',
    highestLevel: studentData?.gameProgress?.match3?.highestLevel || 1,
  });

  // Enemy State
  const [currentLevel, setCurrentLevel] = useState(1);
  const [enemy, setEnemy] = useState(null);
  const [turn, setTurn] = useState('player'); // 'player', 'enemy'
  const [notifications, setNotifications] = useState([]);

  // Refs for animations
  const boardRef = useRef(null);

  // Initialize or Load Game
  useEffect(() => {
    // Generate first enemy based on level
    if (!enemy) {
      spawnEnemy(currentLevel);
    }
  }, [currentLevel]);

  // Update Max HP/Damage based on Equipment
  useEffect(() => {
    const weapon = SHOP_ITEMS.WEAPONS.find(w => w.id === player.weaponId) || SHOP_ITEMS.WEAPONS[0];
    const armor = SHOP_ITEMS.ARMOR.find(a => a.id === player.armorId) || SHOP_ITEMS.ARMOR[0];

    setPlayer(prev => ({
      ...prev,
      maxHp: armor.hp + (prev.level * 10), // Base HP increases with level
      // HP is capped at maxHp when healing, handled there.
      // Current HP not automatically healed on equip change to avoid exploit, but maxHp updates.
    }));
  }, [player.weaponId, player.armorId, player.level]);


  const spawnEnemy = (level) => {
    const enemyIndex = (level - 1) % ENEMIES.length;
    const baseEnemy = ENEMIES[enemyIndex];
    const scalingFactor = Math.floor((level - 1) / ENEMIES.length) + 1; // 1, 1, ..., 2, 2...

    setEnemy({
      ...baseEnemy,
      maxHp: baseEnemy.hp * scalingFactor,
      hp: baseEnemy.hp * scalingFactor,
      dmg: Math.floor(baseEnemy.dmg * scalingFactor),
      xp: baseEnemy.xp * scalingFactor,
      gold: baseEnemy.gold * scalingFactor,
      turnTimer: 3, // Initial turns before attack
    });
  };

  const addNotification = (text, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 2000);
  };

  // ==========================================
  // GAME LOGIC: MATCHING
  // ==========================================
  const checkForMatches = (currentBoard) => {
    const matches = [];
    // Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        const t1 = currentBoard[r][c];
        const t2 = currentBoard[r][c + 1];
        const t3 = currentBoard[r][c + 2];
        if (t1.id === t2.id && t1.id === t3.id) {
          matches.push({ r, c }, { r, c: c + 1 }, { r, c: c + 2 });
        }
      }
    }
    // Vertical
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        const t1 = currentBoard[r][c];
        const t2 = currentBoard[r + 1][c];
        const t3 = currentBoard[r + 2][c];
        if (t1.id === t2.id && t1.id === t3.id) {
          matches.push({ r, c }, { r: r + 1, c }, { r: r + 2, c });
        }
      }
    }
    // Dedup
    const uniqueMatches = Array.from(new Set(matches.map(m => `${m.r},${m.c}`)))
      .map(s => {
        const [r, c] = s.split(',').map(Number);
        return { r, c, tile: currentBoard[r][c] };
      });

    return uniqueMatches;
  };

  const processMatches = async (matches) => {
    if (matches.length === 0) return;

    // Calculate Effects
    let damage = 0;
    let block = 0;
    let heal = 0;
    let mana = 0;
    let gold = 0;

    const weapon = SHOP_ITEMS.WEAPONS.find(w => w.id === player.weaponId);
    const baseDmg = weapon ? weapon.damage : 5;

    matches.forEach(m => {
      switch (m.tile.id) {
        case 'sword': damage += baseDmg; break;
        case 'shield': block += 5; break;
        case 'potion': heal += 5; break;
        case 'mana': mana += 10; break;
        case 'coin': gold += 1; break;
        case 'skull': damage += 2; break; // Skulls also deal small damage
        default: break;
      }
    });

    // Apply Effects
    if (damage > 0 && enemy) {
      setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
      addNotification(`-${damage} HP`, 'damage');
    }
    if (heal > 0) {
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + heal) }));
      addNotification(`+${heal} HP`, 'heal');
    }
    if (block > 0) {
      setPlayer(prev => ({ ...prev, shield: prev.shield + block }));
      addNotification(`+${block} Shield`, 'neutral');
    }
    if (mana > 0) {
      setPlayer(prev => ({ ...prev, mana: Math.min(prev.maxMana, prev.mana + mana) }));
    }
    if (gold > 0) {
      setPlayer(prev => ({ ...prev, gold: prev.gold + gold }));
      addNotification(`+${gold} Gold`, 'gold');
    }

    // Remove Matched Tiles & Animation
    setAnimatingTiles(matches.map(m => `${m.r},${m.c}`));
    await new Promise(r => setTimeout(r, 300)); // Wait for animation

    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      matches.forEach(m => {
        newBoard[m.r][m.c] = null;
      });
      return newBoard;
    });

    await new Promise(r => setTimeout(r, 100)); // Small delay before drop

    // Apply Gravity
    applyGravity();
  };

  const applyGravity = async () => {
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      // For each column
      for (let c = 0; c < GRID_SIZE; c++) {
        let emptySlots = 0;
        for (let r = GRID_SIZE - 1; r >= 0; r--) {
          if (newBoard[r][c] === null) {
            emptySlots++;
          } else if (emptySlots > 0) {
            // Move tile down
            newBoard[r + emptySlots][c] = newBoard[r][c];
            newBoard[r][c] = null;
          }
        }
        // Fill top with new tiles
        for (let r = 0; r < emptySlots; r++) {
          newBoard[r][c] = getRandomTile();
        }
      }
      return newBoard;
    });

    // Recursively check for new matches (Cascades)
    setTimeout(() => {
      setBoard(currentBoard => {
        const newMatches = checkForMatches(currentBoard);
        if (newMatches.length > 0) {
          setComboCount(c => c + 1);
          processMatches(newMatches); // Recursion
        } else {
          setIsProcessing(false);
          setComboCount(0);
          // End of Player Turn Logic
          checkTurnEnd();
        }
        return currentBoard;
      });
    }, 400); // Delay to let tiles "fall" visually
  };

  // ==========================================
  // TURN & ENEMY LOGIC
  // ==========================================
  const checkTurnEnd = () => {
    // If enemy dead, handle victory
    // If player matched, turn passes to enemy IF not cascade? 
    // For Match-3, usually player takes action, then enemy takes action.
    // Let's say every swap counts as a turn.

    // We check enemy health in useEffect, but here we trigger enemy turn.
    setTimeout(() => {
      if (enemy && enemy.hp > 0) {
        enemyTurn();
      }
    }, 1000);
  };

  useEffect(() => {
    if (enemy && enemy.hp <= 0) {
      handleVictory();
    }
  }, [enemy]);

  const handleVictory = async () => {
    if (!enemy) return;
    addNotification(`Victory! +${enemy.xp} XP, +${enemy.gold} Gold`, 'success');

    // Update Player Stats
    const newXp = player.xp + enemy.xp;
    const newGold = player.gold + enemy.gold;
    const levelUp = newXp >= (player.level * 100);
    const newLevel = levelUp ? player.level + 1 : player.level;
    const adjustedXp = levelUp ? newXp - (player.level * 100) : newXp;

    const newPlayerState = {
      ...player,
      xp: adjustedXp,
      level: newLevel,
      gold: newGold,
      highestLevel: Math.max(player.highestLevel, currentLevel + 1),
    };

    setPlayer(newPlayerState);
    if (levelUp) addNotification("LEVEL UP!", 'success');

    // Save Progress
    if (updateStudentData) {
      await updateStudentData({
        gameProgress: {
          ...(studentData.gameProgress || {}),
          match3: {
            level: newPlayerState.level,
            xp: newPlayerState.xp,
            gold: newPlayerState.gold,
            highestLevel: newPlayerState.highestLevel,
            weaponId: newPlayerState.weaponId,
            armorId: newPlayerState.armorId
          }
        }
      });
    }

    // Next Level
    setTimeout(() => {
      setCurrentLevel(l => l + 1);
      spawnEnemy(currentLevel + 1);
    }, 2000);
  };

  const enemyTurn = () => {
    if (!enemy) return;

    // Simple AI: Tick down timer, then attack
    setEnemy(prev => {
      const newTimer = prev.turnTimer - 1;
      if (newTimer <= 0) {
        // Attack!
        let damage = prev.dmg;
        // Apply mitigation
        let shield = player.shield;
        if (shield > 0) {
          const blocked = Math.min(shield, damage);
          shield -= blocked;
          damage -= blocked;
          setPlayer(p => ({ ...p, shield }));
        }
        if (damage > 0) {
          setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - damage) }));
          addNotification(`Enemy attacks for ${damage}!`, 'danger');
        } else {
          addNotification('Blocked!', 'neutral');
        }
        return { ...prev, turnTimer: 3 }; // Reset timer
      } else {
        return { ...prev, turnTimer: newTimer };
      }
    });
  };

  // Check Player Death
  useEffect(() => {
    if (player.hp <= 0) {
      // Game Over
      addNotification("Defeated...", 'danger');
      // Reset Level or penalty?
      setTimeout(() => {
        // Simple respawn for now logic
        setPlayer(p => ({ ...p, hp: p.maxHp }));
      }, 2000);
    }
  }, [player.hp]);

  // ==========================================
  // INPUT HANDLING
  // ==========================================
  const handleTileClick = (r, c) => {
    if (isProcessing) return;
    if (!selectedTile) {
      setSelectedTile({ r, c });
    } else {
      // Attempt Swap
      const isAdjacent =
        (Math.abs(selectedTile.r - r) === 1 && selectedTile.c === c) ||
        (Math.abs(selectedTile.c - c) === 1 && selectedTile.r === r);

      if (isAdjacent) {
        swapTiles(selectedTile, { r, c });
      }
      setSelectedTile(null);
    }
  };

  const swapTiles = (pos1, pos2) => {
    setIsProcessing(true);
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      const t1 = newBoard[pos1.r][pos1.c];
      const t2 = newBoard[pos2.r][pos2.c];
      newBoard[pos1.r][pos1.c] = t2;
      newBoard[pos2.r][pos2.c] = t1;

      // Check for validity
      const matches = checkForMatches(newBoard);
      if (matches.length > 0) {
        setTimeout(() => processMatches(matches), 300);
        return newBoard;
      } else {
        // Invalid swap, revert visual (simplified: just don't swap)
        addNotification("No Match!", 'warning');
        setIsProcessing(false);
        return prev;
      }
    });
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans select-none">
      {/* Header / Stats */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase">Player</span>
            <span className="font-bold text-xl">Lvl {player.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs uppercase">Gold</span>
            <span className="font-bold text-yellow-400 flex items-center gap-1">
              💰 {player.gold}
            </span>
          </div>
        </div>

        {/* Health Bar */}
        <div className="flex-1 max-w-md mx-4">
          <div className="flex justify-between text-xs mb-1">
            <span>HP {player.hp}/{player.maxHp}</span>
            <span>Shield {player.shield}</span>
          </div>
          <div className="h-4 bg-slate-950 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
            />
            {player.shield > 0 && (
              <div
                className="h-full bg-blue-400/50 absolute top-0 left-0 transition-all"
                style={{ width: `${Math.min(100, (player.shield / player.maxHp) * 100)}%` }}
              />
            )}
          </div>
        </div>

        <button onClick={() => setCurrentLevel(1)} className="text-xs text-gray-500 hover:text-white">
          Reset
        </button>
      </div>

      {/* Main Battle Area */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Panel: Enemy */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
          {enemy ? (
            <>
              <div className="absolute top-2 right-2 text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded">
                Floor {currentLevel}
              </div>
              <div className="text-8xl mb-4 transform hover:scale-110 transition-transform cursor-pointer">
                {enemy.emoji}
              </div>
              <h2 className="text-2xl font-bold mb-2">{enemy.name}</h2>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
              <div className="text-center text-sm text-gray-300">
                <p className="mb-1">❤️ {enemy.hp} / {enemy.maxHp}</p>
                <p className="mb-4">⚔️ {enemy.dmg} Dmg</p>

                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 uppercase mb-1">Next Action</p>
                  <p className="font-bold text-red-400">
                    {enemy.turnTimer <= 1 ? "Attacking!" : `Attacks in ${enemy.turnTimer} turns`}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500">Searching for foe...</div>
          )}
        </div>

        {/* Middle Panel: Grid */}
        <div className="col-span-1 md:col-span-2 bg-slate-900/50 flex justify-center items-center">
          <div
            className="grid gap-1 bg-slate-700 p-2 rounded-xl shadow-2xl"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          >
            {board.map((row, r) => (
              row.map((tile, c) => {
                const isSelected = selectedTile?.r === r && selectedTile?.c === c;
                return (
                  <div
                    key={`${r}-${c}-${tile.uid}`}
                    onClick={() => handleTileClick(r, c)}
                    className={`
                               w-10 h-10 md:w-12 md:h-12 
                               rounded-lg flex items-center justify-center text-2xl
                               cursor-pointer transition-all duration-200
                               ${tile.color} hover:brightness-110
                               ${isSelected ? 'ring-4 ring-white z-10 scale-110' : 'ring-1 ring-black/20'}
                            `}
                  >
                    {tile.emoji}
                  </div>
                );
              })
            ))}
          </div>
        </div>

      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-4 flex flex-col gap-2 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`
                px-4 py-2 rounded-lg shadow-lg text-sm font-bold animate-fade-in
                ${n.type === 'damage' ? 'bg-red-500 text-white' :
              n.type === 'heal' ? 'bg-green-500 text-white' :
                n.type === 'gold' ? 'bg-yellow-500 text-black' :
                  'bg-slate-700 text-white'}
             `}>
            {n.text}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Match3BattleGame;