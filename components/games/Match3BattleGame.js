// Enhanced Match-3 Battle Arena - Complete Fantasy Combat Experience
import React, { useState, useEffect, useRef, useCallback } from 'react';

const Match3BattleGame = ({ studentData, updateStudentData }) => {
  const GRID_SIZE = 8;
  
  const TILE_TYPES = {
    SWORD: { id: 'sword', emoji: '⚔️', color: '#ff6b6b', name: 'Sword', effect: 'damage' },
    SHIELD: { id: 'shield', emoji: '🛡️', color: '#4dabf7', name: 'Shield', effect: 'block' },
    POTION: { id: 'potion', emoji: '🧪', color: '#51cf66', name: 'Health Potion', effect: 'heal' },
    MANA: { id: 'mana', emoji: '✨', color: '#845ef7', name: 'Mana Crystal', effect: 'mana' },
    FIRE: { id: 'fire', emoji: '🔥', color: '#ff922b', name: 'Fire Rune', effect: 'burn' },
    ICE: { id: 'ice', emoji: '❄️', color: '#74c0fc', name: 'Ice Shard', effect: 'freeze' },
    LIGHTNING: { id: 'lightning', emoji: '⚡', color: '#ffd43b', name: 'Lightning Bolt', effect: 'shock' },
    CURSE: { id: 'curse', emoji: '☠️', color: '#9775fa', name: 'Curse', effect: 'curse' },
    TREASURE: { id: 'treasure', emoji: '💎', color: '#ffd700', name: 'Treasure', effect: 'loot' }
  };

  const WEAPONS = [
    { id: 'rusty_sword', name: 'Rusty Sword', damage: 0, description: 'A worn blade, but it gets the job done', rarity: 'common' },
    { id: 'iron_sword', name: 'Iron Sword', damage: 2, description: '+2 base damage per sword match', rarity: 'common' },
    { id: 'steel_blade', name: 'Steel Blade', damage: 3, description: '+3 base damage, improved durability', rarity: 'uncommon' },
    { id: 'silver_sword', name: 'Silver Sword', damage: 4, description: '+4 base damage, extra damage vs undead', rarity: 'uncommon' },
    { id: 'frost_blade', name: 'Frost Blade', damage: 5, description: '+5 base damage, chance to freeze enemies', rarity: 'rare' },
    { id: 'flame_sword', name: 'Flame Sword', damage: 6, description: '+6 base damage, burn effect on crits', rarity: 'rare' },
    { id: 'shadow_blade', name: 'Shadow Blade', damage: 7, description: '+7 base damage, ignores 25% enemy defense', rarity: 'epic' },
    { id: 'storm_sword', name: 'Storm Sword', damage: 8, description: '+8 base damage, lightning chains on combo', rarity: 'epic' },
    { id: 'dragon_slayer', name: 'Dragon Slayer', damage: 12, description: '+12 base damage, massive crit chance vs dragons', rarity: 'legendary' },
    { id: 'void_reaper', name: 'Void Reaper', damage: 15, description: '+15 base damage, steals enemy health', rarity: 'legendary' },
    { id: 'excalibur', name: 'Excalibur', damage: 20, description: '+20 base damage, chosen one\'s blade', rarity: 'mythic' }
  ];

  const ARMOR = [
    { id: 'cloth_armor', name: 'Cloth Armor', defense: 0, hp: 0, description: 'Basic protection', rarity: 'common' },
    { id: 'leather_armor', name: 'Leather Armor', defense: 2, hp: 10, description: '+2 defense, +10 max HP', rarity: 'common' },
    { id: 'chain_mail', name: 'Chain Mail', defense: 4, hp: 20, description: '+4 defense, +20 max HP', rarity: 'uncommon' },
    { id: 'plate_armor', name: 'Plate Armor', defense: 6, hp: 30, description: '+6 defense, +30 max HP', rarity: 'rare' },
    { id: 'dragon_scale', name: 'Dragon Scale Armor', defense: 10, hp: 50, description: '+10 defense, +50 max HP, fire resistance', rarity: 'epic' },
    { id: 'void_armor', name: 'Void Armor', defense: 15, hp: 75, description: '+15 defense, +75 max HP, magic resistance', rarity: 'legendary' }
  ];

  const ENEMIES = [
    { 
      id: 1, name: 'Goblin Scout', emoji: '👹', hp: 40, damage: 6, defense: 0,
      abilities: ['steal_gold'], 
      description: 'A sneaky goblin that steals gold when it attacks',
      rewards: { xp: 15, gold: 30 },
      loot: [
        { item: 'iron_sword', chance: 0.15, type: 'weapon' },
        { item: 'leather_armor', chance: 0.10, type: 'armor' }
      ]
    },
    { 
      id: 2, name: 'Orc Warrior', emoji: '🧌', hp: 70, damage: 10, defense: 2,
      abilities: ['rage'], 
      description: 'A fierce orc that gets stronger as it takes damage',
      rewards: { xp: 25, gold: 50 },
      loot: [
        { item: 'steel_blade', chance: 0.20, type: 'weapon' },
        { item: 'chain_mail', chance: 0.15, type: 'armor' }
      ]
    },
    { 
      id: 3, name: 'Frost Troll', emoji: '🧊', hp: 100, damage: 15, defense: 4,
      abilities: ['freeze_tiles'], 
      description: 'An icy troll that can freeze your tiles',
      rewards: { xp: 40, gold: 80 },
      loot: [
        { item: 'frost_blade', chance: 0.25, type: 'weapon' },
        { item: 'plate_armor', chance: 0.20, type: 'armor' }
      ]
    },
    { 
      id: 4, name: 'Fire Drake', emoji: '🐉', hp: 140, damage: 20, defense: 6,
      abilities: ['burn_attack'], 
      description: 'A fierce drake that inflicts burning damage',
      rewards: { xp: 60, gold: 120 },
      loot: [
        { item: 'flame_sword', chance: 0.30, type: 'weapon' },
        { item: 'dragon_scale', chance: 0.15, type: 'armor' }
      ]
    },
    { 
      id: 5, name: 'Shadow Wraith', emoji: '👻', hp: 90, damage: 25, defense: 0,
      abilities: ['curse_tiles'], 
      description: 'A dark wraith that curses the battlefield',
      rewards: { xp: 75, gold: 150 },
      loot: [
        { item: 'shadow_blade', chance: 0.35, type: 'weapon' },
        { item: 'void_armor', chance: 0.10, type: 'armor' }
      ]
    },
    { 
      id: 6, name: 'Lightning Elemental', emoji: '⚡', hp: 120, damage: 18, defense: 3,
      abilities: ['chain_lightning'], 
      description: 'An elemental that can chain lightning attacks',
      rewards: { xp: 90, gold: 180 },
      loot: [
        { item: 'storm_sword', chance: 0.40, type: 'weapon' }
      ]
    },
    { 
      id: 7, name: 'Ancient Dragon', emoji: '🐲', hp: 250, damage: 35, defense: 10,
      abilities: ['dragon_breath', 'treasure_hoard'], 
      description: 'The ultimate challenge - an ancient dragon with immense power',
      rewards: { xp: 200, gold: 500 },
      loot: [
        { item: 'dragon_slayer', chance: 0.50, type: 'weapon' },
        { item: 'excalibur', chance: 0.05, type: 'weapon' },
        { item: 'void_reaper', chance: 0.10, type: 'weapon' }
      ]
    }
  ];

  // Game State
  const [gameState, setGameState] = useState({
    mode: 'menu', // 'menu', 'singleplayer'
    player: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      baseMaxHp: 100,
      mana: 0,
      maxMana: 100,
      shield: 0,
      gold: 0,
      statusEffects: { burn: 0, freeze: 0 },
      weapon: 'rusty_sword',
      armor: 'cloth_armor',
      inventory: { weapons: [], armor: [] },
      runs: 0,
      totalKills: 0
    },
    enemy: null,
    enemyTurnTimer: 3, // Enemy waits 3 turns before attacking
    currentFloor: 1,
    runStartFloor: 1,
    board: [],
    selectedTile: null,
    draggedTile: null,
    animatingTiles: new Set(),
    turnPhase: 'player', // 'player', 'resolving', 'enemy'
    combo: 0,
    matchedTiles: new Set(),
    isGameOver: false,
    victory: false,
    showDeathModal: false
  });

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showInventory, setShowInventory] = useState(false);

  const gameLoopRef = useRef();
  const autosaveIntervalRef = useRef();

  // Helper Functions
  const playSound = useCallback((sound) => {
    try {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  const addFloatingText = useCallback((text, x, y, color = '#ffd700', size = 'text-lg') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, x, y, color, size }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 2000);
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const formatNumber = useCallback((num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const getItemByType = useCallback((id, type) => {
    return type === 'weapon' ? WEAPONS.find(w => w.id === id) : ARMOR.find(a => a.id === id);
  }, []);

  // Initialize Board
  const createRandomTile = useCallback(() => {
    const rand = Math.random();
    
    // 5% chance for treasure tile
    if (rand < 0.05) return TILE_TYPES.TREASURE;
    
    // 3% chance for curse tile (appears more in later floors)
    if (rand < 0.03 + (gameState.currentFloor * 0.01)) return TILE_TYPES.CURSE;
    
    const commonTypes = [
      TILE_TYPES.SWORD, TILE_TYPES.SHIELD, TILE_TYPES.POTION, 
      TILE_TYPES.MANA, TILE_TYPES.FIRE, TILE_TYPES.ICE, TILE_TYPES.LIGHTNING
    ];
    
    return commonTypes[Math.floor(Math.random() * commonTypes.length)];
  }, [gameState.currentFloor]);

  const initializeBoard = useCallback(() => {
    const board = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => createRandomTile())
    );
    
    // Ensure no initial matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let attempts = 0;
        while (attempts < 10) {
          const tile = createRandomTile();
          board[row][col] = tile;
          
          // Check for matches
          let hasMatch = false;
          if (col >= 2 && board[row][col-1].id === tile.id && board[row][col-2].id === tile.id) hasMatch = true;
          if (row >= 2 && board[row-1][col].id === tile.id && board[row-2][col].id === tile.id) hasMatch = true;
          
          if (!hasMatch) break;
          attempts++;
        }
      }
    }
    
    return board;
  }, [createRandomTile]);

  // Enhanced Match Detection
  const findMatches = useCallback((board) => {
    const matches = new Set();
    
    // Horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const tile = board[row][col];
        if (tile && board[row][col + 1]?.id === tile.id && board[row][col + 2]?.id === tile.id) {
          matches.add(`${row}-${col}`);
          matches.add(`${row}-${col + 1}`);
          matches.add(`${row}-${col + 2}`);
          
          // Check for longer matches
          for (let k = col + 3; k < GRID_SIZE && board[row][k]?.id === tile.id; k++) {
            matches.add(`${row}-${k}`);
          }
        }
      }
    }
    
    // Vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const tile = board[row][col];
        if (tile && board[row + 1][col]?.id === tile.id && board[row + 2][col]?.id === tile.id) {
          matches.add(`${row}-${col}`);
          matches.add(`${row + 1}-${col}`);
          matches.add(`${row + 2}-${col}`);
          
          // Check for longer matches
          for (let k = row + 3; k < GRID_SIZE && board[k][col]?.id === tile.id; k++) {
            matches.add(`${k}-${col}`);
          }
        }
      }
    }
    
    return matches;
  }, []);

  // Enhanced Combat System
  const applyMatchEffects = useCallback((matchedTiles, board, combo) => {
    const effects = {};
    
    // Count matched tiles by type
    matchedTiles.forEach(tileKey => {
      const [row, col] = tileKey.split('-').map(Number);
      const tile = board[row][col];
      if (tile) {
        effects[tile.id] = (effects[tile.id] || 0) + 1;
      }
    });
    
    let damage = 0;
    let healing = 0;
    let manaGain = 0;
    let shieldGain = 0;
    let burnDamage = 0;
    let freezeTurns = 0;
    let lightningDamage = 0;
    let curseDamage = 0;
    let goldGain = 0;
    
    const comboMultiplier = 1 + (combo * 0.25);
    const weapon = getItemByType(gameState.player.weapon, 'weapon');
    const armor = getItemByType(gameState.player.armor, 'armor');
    
    Object.entries(effects).forEach(([tileType, count]) => {
      const baseAmount = count * comboMultiplier;
      
      switch (tileType) {
        case 'sword':
          damage += Math.floor((15 + (weapon?.damage || 0)) * baseAmount);
          // Critical hit chance (10% base + 5% per combo)
          if (Math.random() < 0.1 + (combo * 0.05)) {
            damage *= 1.5;
            addFloatingText('CRITICAL!', 200, 100, '#ff0000', 'text-2xl');
            playSound('coins');
          }
          break;
          
        case 'shield':
          shieldGain += Math.floor(10 * baseAmount);
          break;
          
        case 'potion':
          healing += Math.floor(20 * baseAmount);
          break;
          
        case 'mana':
          manaGain += Math.floor(15 * baseAmount);
          break;
          
        case 'fire':
          burnDamage += Math.floor(8 * baseAmount); // Burn damage over time
          break;
          
        case 'ice':
          freezeTurns += Math.floor(2 * count); // Freeze enemy turns
          break;
          
        case 'lightning':
          lightningDamage += Math.floor(12 * baseAmount); // Direct lightning damage
          break;
          
        case 'curse':
          curseDamage += Math.floor(15 * baseAmount); // Hurts the player!
          break;
          
        case 'treasure':
          goldGain += Math.floor((50 + gameState.currentFloor * 10) * baseAmount);
          // Chance for rare loot
          if (Math.random() < 0.15 * count) {
            const lootRoll = Math.random();
            let lootItem = null;
            let lootType = null;
            
            if (lootRoll < 0.6) { // Weapon
              const availableWeapons = WEAPONS.filter(w => !gameState.player.inventory.weapons.includes(w.id));
              if (availableWeapons.length > 0) {
                lootItem = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
                lootType = 'weapon';
              }
            } else { // Armor
              const availableArmor = ARMOR.filter(a => !gameState.player.inventory.armor.includes(a.id));
              if (availableArmor.length > 0) {
                lootItem = availableArmor[Math.floor(Math.random() * availableArmor.length)];
                lootType = 'armor';
              }
            }
            
            if (lootItem) {
              setGameState(prev => ({
                ...prev,
                player: {
                  ...prev.player,
                  inventory: {
                    ...prev.player.inventory,
                    [lootType === 'weapon' ? 'weapons' : 'armor']: [
                      ...prev.player.inventory[lootType === 'weapon' ? 'weapons' : 'armor'],
                      lootItem.id
                    ]
                  }
                }
              }));
              addNotification(`Found ${lootItem.name} in treasure!`, 'success');
            }
          }
          break;
      }
    });
    
    return { damage, healing, manaGain, shieldGain, burnDamage, freezeTurns, lightningDamage, curseDamage, goldGain };
  }, [gameState.player, gameState.currentFloor, getItemByType, addFloatingText, addNotification, playSound]);

  // Process Player Turn
  const processPlayerTurn = useCallback((effects) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Apply curse damage first (hurts player)
      if (effects.curseDamage > 0) {
        newState.player.hp = Math.max(0, prev.player.hp - effects.curseDamage);
        addFloatingText(`-${effects.curseDamage} Cursed!`, 100, 120, '#9775fa', 'text-xl');
        playSound('ding');
      }
      
      // Apply healing
      if (effects.healing > 0) {
        const healAmount = Math.min(effects.healing, prev.player.maxHp - prev.player.hp);
        newState.player.hp = prev.player.hp + healAmount;
        addFloatingText(`+${healAmount} HP`, 100, 100, '#51cf66', 'text-xl');
        playSound('ding');
      }
      
      // Apply mana gain
      if (effects.manaGain > 0) {
        const manaAmount = Math.min(effects.manaGain, prev.player.maxMana - prev.player.mana);
        newState.player.mana = prev.player.mana + manaAmount;
        addFloatingText(`+${manaAmount} MP`, 150, 100, '#845ef7');
      }
      
      // Apply shield
      if (effects.shieldGain > 0) {
        newState.player.shield = Math.min(prev.player.shield + effects.shieldGain, 100); // Shield cap
        addFloatingText(`+${effects.shieldGain} Shield`, 50, 100, '#4dabf7');
        playSound('ding');
      }
      
      // Apply gold gain
      if (effects.goldGain > 0) {
        newState.player.gold += effects.goldGain;
        addFloatingText(`+${effects.goldGain} Gold`, 200, 120, '#ffd700');
      }
      
      // Apply damage to enemy
      let totalDamage = effects.damage + effects.lightningDamage;
      
      if (totalDamage > 0 && newState.enemy) {
        const enemy = newState.enemy;
        const finalDamage = Math.max(1, totalDamage - (enemy.defense || 0));
        
        newState.enemy.hp = Math.max(0, enemy.hp - finalDamage);
        addFloatingText(`-${finalDamage}`, 400, 200, '#ff6b6b', 'text-2xl');
        playSound('coins');
        
        // Apply status effects to enemy
        if (effects.burnDamage > 0) {
          newState.enemy.statusEffects = { 
            ...newState.enemy.statusEffects, 
            burn: (newState.enemy.statusEffects.burn || 0) + effects.burnDamage 
          };
        }
        if (effects.freezeTurns > 0) {
          newState.enemy.statusEffects = { 
            ...newState.enemy.statusEffects, 
            freeze: (newState.enemy.statusEffects.freeze || 0) + effects.freezeTurns 
          };
        }
      }
      
      // Check for victory
      if (newState.enemy && newState.enemy.hp <= 0) {
        newState.victory = true;
        newState.isGameOver = true;
        
        // Award rewards
        const rewards = newState.enemy.rewards;
        newState.player.xp += rewards.xp;
        newState.player.gold += rewards.gold;
        newState.player.totalKills++;
        
        // Check for loot drop
        newState.enemy.loot?.forEach(loot => {
          if (Math.random() < loot.chance) {
            const item = getItemByType(loot.item, loot.type);
            if (item && !newState.player.inventory[loot.type + 's'].includes(loot.item)) {
              newState.player.inventory[loot.type + 's'].push(loot.item);
              addNotification(`Found ${item.name}!`, 'success');
            }
          }
        });
        
        // Level up check
        while (newState.player.xp >= newState.player.xpToNext) {
          newState.player.xp -= newState.player.xpToNext;
          newState.player.level++;
          newState.player.xpToNext = Math.floor(newState.player.xpToNext * 1.15);
          newState.player.baseMaxHp += 20;
          newState.player.maxHp = newState.player.baseMaxHp + (getItemByType(newState.player.armor, 'armor')?.hp || 0);
          newState.player.hp = newState.player.maxHp; // Full heal on level up
          newState.player.maxMana += 10;
          addFloatingText('LEVEL UP!', 200, 150, '#ffd43b', 'text-3xl');
          addNotification(`Level Up! Now level ${newState.player.level}`, 'success');
          playSound('ding');
        }
        
        setTimeout(() => nextFloor(), 1500);
      }
      
      return newState;
    });
  }, [getItemByType, addFloatingText, addNotification, playSound]);

  // Process Enemy Turn
  const processEnemyTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev.enemy || prev.enemy.hp <= 0) return prev;
      
      const newState = { ...prev };
      
      // Process enemy status effects first
      if (newState.enemy.statusEffects.burn > 0) {
        const burnDamage = Math.floor(newState.enemy.statusEffects.burn * 2);
        newState.enemy.hp = Math.max(0, newState.enemy.hp - burnDamage);
        addFloatingText(`-${burnDamage} Burn`, 400, 180, '#ff922b');
        newState.enemy.statusEffects.burn = Math.max(0, newState.enemy.statusEffects.burn - 3);
        
        if (newState.enemy.hp <= 0) {
          newState.victory = true;
          newState.isGameOver = true;
          return newState;
        }
      }
      
      // Check if enemy is frozen
      if (newState.enemy.statusEffects.freeze > 0) {
        addFloatingText('Frozen!', 400, 220, '#74c0fc');
        newState.enemy.statusEffects.freeze = Math.max(0, newState.enemy.statusEffects.freeze - 1);
        return newState; // Skip enemy turn
      }
      
      // Enemy turn timer - wait 3 turns before first attack
      if (newState.enemyTurnTimer > 0) {
        newState.enemyTurnTimer--;
        addFloatingText(`Enemy attacks in ${newState.enemyTurnTimer}`, 400, 160, '#ffaa00');
        return newState;
      }
      
      // Enemy attacks
      let damage = newState.enemy.damage;
      const armor = getItemByType(newState.player.armor, 'armor');
      const defense = armor?.defense || 0;
      
      // Apply damage to shield first
      if (newState.player.shield > 0) {
        const shieldBlock = Math.min(newState.player.shield, damage);
        newState.player.shield -= shieldBlock;
        damage -= shieldBlock;
        addFloatingText(`-${shieldBlock} Shield`, 100, 180, '#4dabf7');
        
        if (damage <= 0) {
          addFloatingText('Blocked!', 100, 160, '#4dabf7', 'text-xl');
          return newState;
        }
      }
      
      // Apply armor defense
      damage = Math.max(1, damage - defense);
      
      // Apply remaining damage to HP
      if (damage > 0) {
        newState.player.hp = Math.max(0, newState.player.hp - damage);
        addFloatingText(`-${damage} HP`, 100, 150, '#ff6b6b', 'text-xl');
        playSound('ding');
      }
      
      // Check for defeat
      if (newState.player.hp <= 0) {
        newState.isGameOver = true;
        newState.victory = false;
        newState.showDeathModal = true;
      }
      
      return newState;
    });
  }, [getItemByType, addFloatingText, playSound]);

  // Tile Interaction
  const canSwapTiles = useCallback((pos1, pos2, board) => {
    const [r1, c1] = pos1;
    const [r2, c2] = pos2;
    
    // Must be adjacent
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return false;
    
    // Try the swap
    const testBoard = board.map(row => [...row]);
    [testBoard[r1][c1], testBoard[r2][c2]] = [testBoard[r2][c2], testBoard[r1][c1]];
    
    // Check if swap creates matches
    const matches = findMatches(testBoard);
    return matches.size > 0;
  }, [findMatches]);

  const swapTiles = useCallback((pos1, pos2) => {
    setGameState(prev => {
      if (prev.turnPhase !== 'player') return prev;
      
      const [r1, c1] = pos1;
      const [r2, c2] = pos2;
      
      if (!canSwapTiles(pos1, pos2, prev.board)) {
        addFloatingText('Invalid Move!', 200, 300, '#ff6b6b');
        return prev;
      }
      
      const newBoard = prev.board.map(row => [...row]);
      [newBoard[r1][c1], newBoard[r2][c2]] = [newBoard[r2][c2], newBoard[r1][c1]];
      
      return {
        ...prev,
        board: newBoard,
        turnPhase: 'resolving',
        selectedTile: null,
        draggedTile: null,
        combo: 0
      };
    });
  }, [canSwapTiles, addFloatingText]);

  // Board Physics
  const applyGravity = useCallback((board) => {
    const newBoard = board.map(row => [...row]);
    
    for (let col = 0; col < GRID_SIZE; col++) {
      let writePos = GRID_SIZE - 1;
      
      // Move existing tiles down
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        if (newBoard[row][col] !== null) {
          if (writePos !== row) {
            newBoard[writePos][col] = newBoard[row][col];
            newBoard[row][col] = null;
          }
          writePos--;
        }
      }
      
      // Fill empty spaces with new tiles
      for (let row = writePos; row >= 0; row--) {
        newBoard[row][col] = createRandomTile();
      }
    }
    
    return newBoard;
  }, [createRandomTile]);

  // Game Flow Functions
  const startNewRun = useCallback(() => {
    const weapon = getItemByType(gameState.player.weapon, 'weapon');
    const armor = getItemByType(gameState.player.armor, 'armor');
    
    setGameState(prev => ({
      ...prev,
      mode: 'singleplayer',
      currentFloor: 1,
      runStartFloor: 1,
      player: {
        ...prev.player,
        hp: prev.player.baseMaxHp + (armor?.hp || 0),
        maxHp: prev.player.baseMaxHp + (armor?.hp || 0),
        shield: 0,
        statusEffects: { burn: 0, freeze: 0 },
        runs: prev.player.runs + 1
      },
      enemy: null,
      enemyTurnTimer: 3,
      board: initializeBoard(),
      turnPhase: 'player',
      isGameOver: false,
      victory: false,
      showDeathModal: false,
      combo: 0,
      matchedTiles: new Set(),
      selectedTile: null,
      draggedTile: null
    }));
    
    // Generate first enemy
    setTimeout(generateEnemy, 500);
    addNotification(`Starting Run #${gameState.player.runs + 1}`, 'info');
  }, [gameState.player, initializeBoard, getItemByType]);

  const generateEnemy = useCallback(() => {
    const enemyIndex = ((gameState.currentFloor - 1) % ENEMIES.length);
    const tierMultiplier = Math.floor((gameState.currentFloor - 1) / ENEMIES.length) + 1;
    const difficultyScale = Math.pow(1.12, gameState.currentFloor - 1);
    
    const enemyTemplate = ENEMIES[enemyIndex];
    const scaledEnemy = {
      ...enemyTemplate,
      hp: Math.floor(enemyTemplate.hp * difficultyScale * tierMultiplier),
      maxHp: Math.floor(enemyTemplate.hp * difficultyScale * tierMultiplier),
      damage: Math.floor(enemyTemplate.damage * difficultyScale * tierMultiplier),
      defense: Math.floor((enemyTemplate.defense || 0) * difficultyScale),
      statusEffects: { burn: 0, freeze: 0 },
      rewards: {
        xp: Math.floor(enemyTemplate.rewards.xp * tierMultiplier),
        gold: Math.floor(enemyTemplate.rewards.gold * tierMultiplier)
      }
    };
    
    setGameState(prev => ({
      ...prev,
      enemy: scaledEnemy,
      enemyTurnTimer: 3
    }));
    
    addNotification(`Floor ${gameState.currentFloor}: ${enemyTemplate.name} appears!`, 'info');
  }, [gameState.currentFloor]);

  const nextFloor = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentFloor: prev.currentFloor + 1,
      isGameOver: false,
      victory: false,
      board: initializeBoard(),
      combo: 0,
      matchedTiles: new Set(),
      selectedTile: null,
      draggedTile: null
    }));
    
    setTimeout(generateEnemy, 500);
  }, [initializeBoard, generateEnemy]);

  const returnToMenu = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      mode: 'menu',
      isGameOver: false,
      victory: false,
      enemy: null,
      showDeathModal: false
    }));
    setShowInventory(false);
  }, []);

  const equipItem = useCallback((itemId, itemType) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      if (itemType === 'weapon') {
        newState.player.weapon = itemId;
      } else if (itemType === 'armor') {
        newState.player.armor = itemId;
        const armor = getItemByType(itemId, 'armor');
        newState.player.maxHp = prev.player.baseMaxHp + (armor?.hp || 0);
        newState.player.hp = Math.min(newState.player.hp, newState.player.maxHp);
      }
      
      return newState;
    });
    
    const item = getItemByType(itemId, itemType);
    addNotification(`Equipped ${item?.name}!`, 'success');
  }, [getItemByType, addNotification]);

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, row, col) => {
    if (gameState.turnPhase !== 'player' || gameState.isGameOver) return;
    
    setGameState(prev => ({
      ...prev,
      draggedTile: [row, col],
      selectedTile: [row, col]
    }));
  }, [gameState.turnPhase, gameState.isGameOver]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, row, col) => {
    e.preventDefault();
    
    if (gameState.draggedTile) {
      const [dragRow, dragCol] = gameState.draggedTile;
      if (dragRow !== row || dragCol !== col) {
        swapTiles([dragRow, dragCol], [row, col]);
      }
    }
    
    setGameState(prev => ({
      ...prev,
      draggedTile: null,
      selectedTile: null
    }));
  }, [gameState.draggedTile, swapTiles]);

  const handleTileClick = useCallback((row, col) => {
    if (gameState.turnPhase !== 'player' || gameState.isGameOver) return;
    
    const tilePos = [row, col];
    
    if (!gameState.selectedTile) {
      setGameState(prev => ({
        ...prev,
        selectedTile: tilePos
      }));
    } else {
      const [selectedRow, selectedCol] = gameState.selectedTile;
      if (selectedRow === row && selectedCol === col) {
        // Deselect
        setGameState(prev => ({
          ...prev,
          selectedTile: null
        }));
      } else {
        // Try to swap
        swapTiles(gameState.selectedTile, tilePos);
      }
    }
  }, [gameState.turnPhase, gameState.isGameOver, gameState.selectedTile, swapTiles]);

  // Game Loop
  useEffect(() => {
    const gameLoop = () => {
      if (gameState.turnPhase === 'resolving') {
        const matches = findMatches(gameState.board);
        
        if (matches.size > 0) {
          setGameState(prev => {
            const newBoard = prev.board.map(row => [...row]);
            
            // Remove matched tiles
            matches.forEach(tileKey => {
              const [row, col] = tileKey.split('-').map(Number);
              newBoard[row][col] = null;
            });
            
            // Apply gravity
            const gravityBoard = applyGravity(newBoard);
            
            // Apply match effects
            const effects = applyMatchEffects(matches, prev.board, prev.combo);
            processPlayerTurn(effects);
            
            return {
              ...prev,
              board: gravityBoard,
              combo: prev.combo + 1,
              matchedTiles: matches
            };
          });
        } else {
          // No more matches, end turn
          setTimeout(() => {
            if (!gameState.isGameOver) {
              setGameState(prev => ({
                ...prev,
                turnPhase: 'enemy',
                combo: 0
              }));
              
              // Process enemy turn
              setTimeout(() => {
                processEnemyTurn();
                setTimeout(() => {
                  setGameState(prev => ({
                    ...prev,
                    turnPhase: 'player'
                  }));
                }, 1000);
              }, 500);
            }
          }, 500);
        }
      }
    };
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.turnPhase, gameState.board, gameState.isGameOver, findMatches, applyGravity, applyMatchEffects, processPlayerTurn, processEnemyTurn]);

  // Auto-save
  useEffect(() => {
    const saveData = async () => {
      if (!studentData || !updateStudentData) return;
      
      try {
        const saveData = {
          match3BattleData: {
            player: gameState.player,
            currentFloor: gameState.currentFloor,
            lastSave: Date.now()
          }
        };
        
        await updateStudentData(saveData);
      } catch (error) {
        console.error('Error saving game:', error);
      }
    };
    
    autosaveIntervalRef.current = setInterval(saveData, 30000);
    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [gameState.player, gameState.currentFloor, studentData, updateStudentData]);

  // Load on mount
  useEffect(() => {
    if (studentData?.match3BattleData) {
      try {
        const saveData = studentData.match3BattleData;
        setGameState(prev => ({
          ...prev,
          player: {
            level: 1,
            xp: 0,
            xpToNext: 100,
            hp: 100,
            maxHp: 100,
            baseMaxHp: 100,
            mana: 0,
            maxMana: 100,
            shield: 0,
            gold: 0,
            statusEffects: { burn: 0, freeze: 0 },
            weapon: 'rusty_sword',
            armor: 'cloth_armor',
            inventory: { weapons: [], armor: [] },
            runs: 0,
            totalKills: 0,
            ...saveData.player
          },
          currentFloor: saveData.currentFloor || 1
        }));
        addNotification('Game progress loaded!', 'info');
      } catch (error) {
        console.error('Error loading game:', error);
      }
    }
  }, [studentData, addNotification]);

  // Render Functions
  const renderBoard = () => (
    <div className="grid grid-cols-8 gap-1 bg-gray-800 p-3 rounded-xl shadow-inner">
      {gameState.board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const isSelected = gameState.selectedTile && 
            gameState.selectedTile[0] === rowIndex && 
            gameState.selectedTile[1] === colIndex;
          const isMatched = gameState.matchedTiles.has(`${rowIndex}-${colIndex}`);
          const isDragged = gameState.draggedTile &&
            gameState.draggedTile[0] === rowIndex &&
            gameState.draggedTile[1] === colIndex;
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-xl md:text-2xl cursor-pointer
                transition-all duration-300 shadow-md select-none
                ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-80 scale-110' : ''}
                ${isMatched ? 'animate-pulse scale-105' : ''}
                ${isDragged ? 'opacity-50 scale-95' : ''}
                hover:scale-110 active:scale-95
              `}
              style={{
                backgroundColor: tile?.color || '#374151',
                boxShadow: isSelected 
                  ? '0 0 20px rgba(255, 255, 0, 0.8), inset 0 0 10px rgba(255, 255, 0, 0.3)' 
                  : isMatched
                    ? '0 0 15px rgba(255, 255, 255, 0.6)'
                    : '0 4px 8px rgba(0,0,0,0.3)'
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              <span className="drop-shadow-lg filter">{tile?.emoji}</span>
            </div>
          );
        })
      )}
    </div>
  );

  const renderPlayerStats = () => {
    const weapon = getItemByType(gameState.player.weapon, 'weapon');
    const armor = getItemByType(gameState.player.armor, 'armor');
    
    return (
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="font-bold text-lg flex items-center">
              {studentData?.firstName || 'Hero'}
              <span className="ml-2 text-sm bg-yellow-600 px-2 py-1 rounded-full">
                Lv.{gameState.player.level}
              </span>
            </h3>
            <div className="text-xs opacity-75">
              Run #{gameState.player.runs} • Floor {gameState.currentFloor}
            </div>
          </div>
        </div>
        
        {/* Equipment */}
        <div className="text-xs mb-3 space-y-1">
          <div className="flex justify-between">
            <span>⚔️ {weapon?.name || 'No Weapon'}</span>
            <span>+{weapon?.damage || 0} DMG</span>
          </div>
          <div className="flex justify-between">
            <span>🛡️ {armor?.name || 'No Armor'}</span>
            <span>+{armor?.defense || 0} DEF</span>
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span>❤️ HP</span>
            <span>{gameState.player.hp}/{gameState.player.maxHp}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                gameState.player.hp / gameState.player.maxHp > 0.6 
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : gameState.player.hp / gameState.player.maxHp > 0.3
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${(gameState.player.hp / gameState.player.maxHp) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Shield & Gold */}
        <div className="flex justify-between text-sm mb-2">
          <div className="flex items-center space-x-1">
            <span>🛡️</span>
            <span>{gameState.player.shield}/100</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>💰</span>
            <span>{formatNumber(gameState.player.gold)}</span>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs">
            <span>⭐ XP</span>
            <span>{gameState.player.xp}/{gameState.player.xpToNext}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.player.xp / gameState.player.xpToNext) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Quick Action */}
        <button
          onClick={() => setShowInventory(true)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
        >
          🎒 Inventory
        </button>
      </div>
    );
  };

  const renderEnemyStats = () => {
    if (!gameState.enemy) return null;
    
    return (
      <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-3xl animate-bounce">{gameState.enemy.emoji}</span>
          <div>
            <h3 className="font-bold text-lg">{gameState.enemy.name}</h3>
            <div className="text-sm opacity-75">
              Floor {gameState.currentFloor}
              {gameState.enemyTurnTimer > 0 && (
                <span className="ml-2 text-yellow-300">
                  • Attacks in {gameState.enemyTurnTimer}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Enemy HP Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span>💀 HP</span>
            <span>{gameState.enemy.hp}/{gameState.enemy.maxHp}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-700 h-4 rounded-full transition-all duration-300"
              style={{ width: `${(gameState.enemy.hp / gameState.enemy.maxHp) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Enemy Stats */}
        <div className="text-sm mb-3 space-y-1">
          <div className="flex justify-between">
            <span>⚔️ Damage</span>
            <span>{gameState.enemy.damage}</span>
          </div>
          <div className="flex justify-between">
            <span>🛡️ Defense</span>
            <span>{gameState.enemy.defense || 0}</span>
          </div>
        </div>
        
        {/* Status Effects */}
        {gameState.enemy.statusEffects && (
          <div className="flex flex-wrap gap-1 text-xs mb-3">
            {gameState.enemy.statusEffects.burn > 0 && (
              <div className="bg-orange-600 px-2 py-1 rounded">
                🔥 {gameState.enemy.statusEffects.burn}
              </div>
            )}
            {gameState.enemy.statusEffects.freeze > 0 && (
              <div className="bg-blue-600 px-2 py-1 rounded">
                ❄️ {gameState.enemy.statusEffects.freeze}
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs opacity-75 leading-relaxed mb-3">{gameState.enemy.description}</p>
        
        {/* Rewards Preview */}
        <div className="pt-3 border-t border-red-700">
          <div className="text-xs opacity-75">Rewards:</div>
          <div className="flex justify-between text-sm">
            <span>⭐ {gameState.enemy.rewards.xp} XP</span>
            <span>💰 {gameState.enemy.rewards.gold} Gold</span>
          </div>
        </div>
      </div>
    );
  };

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4">
          ⚔️ Match-3 Battle Arena
        </h1>
        <p className="text-gray-600 text-lg">Epic fantasy combat meets strategic matching!</p>
      </div>
      
      {/* Player Stats Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{gameState.player.level}</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{formatNumber(gameState.player.gold)}</div>
            <div className="text-sm text-gray-600">Gold</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{gameState.player.runs}</div>
            <div className="text-sm text-gray-600">Runs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{gameState.player.totalKills}</div>
            <div className="text-sm text-gray-600">Enemies Defeated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{gameState.player.inventory.weapons.length + gameState.player.inventory.armor.length}</div>
            <div className="text-sm text-gray-600">Items Found</div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={startNewRun}
          className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-4xl mb-2">⚔️</div>
          <div className="text-xl font-bold">Start New Run</div>
          <div className="text-sm opacity-90">Begin a fresh dungeon crawl adventure!</div>
        </button>
        
        <button
          onClick={() => setShowInventory(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-4xl mb-2">🎒</div>
          <div className="text-xl font-bold">Inventory</div>
          <div className="text-sm opacity-90">Manage your weapons and armor!</div>
        </button>
      </div>
      
      {/* Enhanced Tutorial */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">🎯 How to Battle</h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-sm mb-4">
          {Object.values(TILE_TYPES).map(tile => (
            <div key={tile.id} className="text-center p-2 bg-white rounded-lg">
              <div className="text-xl mb-1">{tile.emoji}</div>
              <div className="text-xs font-semibold">{tile.name}</div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-800 mb-2">💡 Combat Tips:</div>
            <ul className="text-gray-700 space-y-1">
              <li>• Enemies wait 3 turns before attacking</li>
              <li>• Shields block damage before HP</li>
              <li>• Fire causes burn damage over time</li>
              <li>• Ice freezes enemies for turns</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-800 mb-2">⚡ Special Tiles:</div>
            <ul className="text-gray-700 space-y-1">
              <li>• Lightning deals instant shock damage</li>
              <li>• Curse tiles hurt YOU - avoid them!</li>
              <li>• Treasure gives gold and rare loot</li>
              <li>• Create combos for damage bonuses</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-blue-800 mb-2">🏃 Progression:</div>
            <ul className="text-gray-700 space-y-1">
              <li>• Keep weapons/armor between runs</li>
              <li>• Floors get progressively harder</li>
              <li>• Defeat enemies for better loot</li>
              <li>• Drag tiles or click to match</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => {
    const currentWeapon = getItemByType(gameState.player.weapon, 'weapon');
    const currentArmor = getItemByType(gameState.player.armor, 'armor');
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🎒 Equipment Arsenal</h2>
          <button
            onClick={() => setShowInventory(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back
          </button>
        </div>
        
        {/* Currently Equipped */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-bold text-lg mb-3">Currently Equipped</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="font-semibold">⚔️ Weapon: {currentWeapon?.name}</div>
              <div className="text-sm text-gray-600">+{currentWeapon?.damage || 0} Base Damage</div>
              <div className="text-xs text-gray-500 mt-1">{currentWeapon?.description}</div>
            </div>
            <div className="border rounded-lg p-3">
              <div className="font-semibold">🛡️ Armor: {currentArmor?.name}</div>
              <div className="text-sm text-gray-600">+{currentArmor?.defense || 0} Defense, +{currentArmor?.hp || 0} Max HP</div>
              <div className="text-xs text-gray-500 mt-1">{currentArmor?.description}</div>
            </div>
          </div>
        </div>
        
        {/* Weapons */}
        <div>
          <h3 className="font-bold text-xl mb-3">⚔️ Weapons ({gameState.player.inventory.weapons.length + 1})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Always show starter weapon */}
            {WEAPONS.filter(w => w.id === 'rusty_sword' || gameState.player.inventory.weapons.includes(w.id)).map(weapon => {
              const isEquipped = gameState.player.weapon === weapon.id;
              const rarityColors = {
                common: 'border-gray-300',
                uncommon: 'border-green-400',
                rare: 'border-blue-400',
                epic: 'border-purple-400',
                legendary: 'border-yellow-400',
                mythic: 'border-pink-400'
              };
              
              return (
                <div
                  key={weapon.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isEquipped
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                      : `bg-white ${rarityColors[weapon.rarity]} hover:shadow-lg cursor-pointer hover:scale-102`
                  }`}
                  onClick={() => !isEquipped && equipItem(weapon.id, 'weapon')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{weapon.name}</h4>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        weapon.rarity === 'mythic' ? 'text-pink-600' :
                        weapon.rarity === 'legendary' ? 'text-yellow-600' :
                        weapon.rarity === 'epic' ? 'text-purple-600' :
                        weapon.rarity === 'rare' ? 'text-blue-600' :
                        weapon.rarity === 'uncommon' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {weapon.rarity.charAt(0).toUpperCase() + weapon.rarity.slice(1)}
                      </div>
                      {isEquipped && (
                        <div className="text-xs text-green-600 font-bold">✅ EQUIPPED</div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{weapon.description}</p>
                  <div className="text-sm font-semibold">
                    Base Damage: +{weapon.damage}
                  </div>
                  {!isEquipped && (
                    <div className="mt-2">
                      <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        ⚔️ Equip Weapon
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Armor */}
        <div>
          <h3 className="font-bold text-xl mb-3">🛡️ Armor ({gameState.player.inventory.armor.length + 1})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARMOR.filter(a => a.id === 'cloth_armor' || gameState.player.inventory.armor.includes(a.id)).map(armor => {
              const isEquipped = gameState.player.armor === armor.id;
              const rarityColors = {
                common: 'border-gray-300',
                uncommon: 'border-green-400',
                rare: 'border-blue-400',
                epic: 'border-purple-400',
                legendary: 'border-yellow-400'
              };
              
              return (
                <div
                  key={armor.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isEquipped
                      ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                      : `bg-white ${rarityColors[armor.rarity]} hover:shadow-lg cursor-pointer hover:scale-102`
                  }`}
                  onClick={() => !isEquipped && equipItem(armor.id, 'armor')}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{armor.name}</h4>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        armor.rarity === 'legendary' ? 'text-yellow-600' :
                        armor.rarity === 'epic' ? 'text-purple-600' :
                        armor.rarity === 'rare' ? 'text-blue-600' :
                        armor.rarity === 'uncommon' ? 'text-green-600' :
                        'text-gray-600'
                      }`}>
                        {armor.rarity.charAt(0).toUpperCase() + armor.rarity.slice(1)}
                      </div>
                      {isEquipped && (
                        <div className="text-xs text-green-600 font-bold">✅ EQUIPPED</div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{armor.description}</p>
                  <div className="text-sm font-semibold">
                    Defense: +{armor.defense} • Max HP: +{armor.hp}
                  </div>
                  {!isEquipped && (
                    <div className="mt-2">
                      <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        🛡️ Equip Armor
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative">
      {/* Floating Texts */}
      {floatingTexts.map(text => (
        <div
          key={text.id}
          className={`absolute ${text.size} font-bold text-center pointer-events-none z-50`}
          style={{
            left: text.x,
            top: text.y,
            color: text.color,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            animation: 'float-up 2s ease-out forwards'
          }}
        >
          {text.text}
        </div>
      ))}

      {/* Notification System */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-lg text-white font-semibold max-w-sm transition-all ${
              notification.type === 'success' ? 'bg-green-500' : 
              notification.type === 'error' ? 'bg-red-500' : 
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Menu */}
      {gameState.mode === 'menu' && !showInventory && (
        <div className="max-w-6xl mx-auto">
          {renderMenu()}
        </div>
      )}

      {/* Inventory */}
      {showInventory && (
        <div className="max-w-6xl mx-auto">
          {renderInventory()}
        </div>
      )}

      {/* Single Player Game */}
      {gameState.mode === 'singleplayer' && !showInventory && (
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">⚔️</span>
              Floor {gameState.currentFloor}
              {gameState.combo > 0 && (
                <span className="ml-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-lg font-bold animate-pulse">
                  🔥 COMBO x{gameState.combo + 1}
                </span>
              )}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={returnToMenu}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                🏠 Menu
              </button>
              <button
                onClick={() => setShowInventory(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                🎒 Equipment
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Player Stats */}
            <div className="lg:col-span-1">
              {renderPlayerStats()}
            </div>

            {/* Game Board */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-center mb-4">
                  <div className={`inline-block px-4 py-2 rounded-lg text-white font-semibold ${
                    gameState.turnPhase === 'player' ? 'bg-green-600' : 
                    gameState.turnPhase === 'enemy' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {gameState.turnPhase === 'player' ? '⚔️ Your Turn - Make a Match!' : 
                     gameState.turnPhase === 'enemy' ? '🔥 Enemy Turn' : '⚡ Resolving Matches...'}
                  </div>
                </div>
                {renderBoard()}
              </div>
            </div>

            {/* Enemy Stats */}
            <div className="lg:col-span-1">
              {renderEnemyStats()}
            </div>
          </div>
        </div>
      )}

      {/* Death Modal */}
      {gameState.showDeathModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-bold mb-4">Defeated!</h2>
            <p className="text-gray-600 mb-4">
              You were defeated on Floor {gameState.currentFloor} by the {gameState.enemy?.name}.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
              <div className="text-sm space-y-2">
                <div>🏃 Run #{gameState.player.runs} Complete</div>
                <div>📊 Floors Reached: {gameState.currentFloor}</div>
                <div className="text-green-600 font-semibold">
                  ⚔️ Your equipment has been preserved!
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={returnToMenu}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-bold"
              >
                🏠 Main Menu
              </button>
              <button
                onClick={startNewRun}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg font-bold"
              >
                🔄 Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-80px);
          }
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Match3BattleGame;