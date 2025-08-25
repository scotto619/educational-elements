// components/games/Match3BattleGame.js - Enhanced Epic Fantasy Match-3 Battle Arena
import React, { useState, useEffect, useRef, useCallback } from 'react';

const Match3BattleGame = ({ studentData, updateStudentData, showToast }) => {
  const GRID_SIZE = 8;
  
  const TILE_TYPES = {
    SWORD: { id: 'sword', emoji: '⚔️', color: '#ff6b6b', name: 'Sword', effect: 'damage' },
    SHIELD: { id: 'shield', emoji: '🛡️', color: '#4dabf7', name: 'Shield', effect: 'block' },
    POTION: { id: 'potion', emoji: '🧪', color: '#51cf66', name: 'Health Potion', effect: 'heal' },
    MANA: { id: 'mana', emoji: '✨', color: '#845ef7', name: 'Mana Crystal', effect: 'mana' },
    FIRE: { id: 'fire', emoji: '🔥', color: '#ff922b', name: 'Fire Rune', effect: 'burn' },
    ICE: { id: 'ice', emoji: '❄️', color: '#74c0fc', name: 'Ice Shard', effect: 'freeze' },
    LIGHTNING: { id: 'lightning', emoji: '⚡', color: '#ffd43b', name: 'Lightning Bolt', effect: 'shock' },
    CURSE: { id: 'curse', emoji: '☠️', color: '#9775fa', name: 'Curse', effect: 'curse' }
  };

  const ENEMIES = [
    { 
      id: 1, name: 'Goblin Scout', emoji: '👹', hp: 60, damage: 8, 
      abilities: ['steal_gold'], 
      description: 'A sneaky goblin that steals gold when it attacks',
      rewards: { xp: 25, gold: 50 },
      loot: { weapon: null, chance: 0.1 }
    },
    { 
      id: 2, name: 'Orc Warrior', emoji: '🧌', hp: 90, damage: 12, 
      abilities: ['rage'], 
      description: 'A fierce orc that gets stronger as it takes damage',
      rewards: { xp: 40, gold: 80 },
      loot: { weapon: 'Iron Sword', chance: 0.15 }
    },
    { 
      id: 3, name: 'Frost Troll', emoji: '🧊', hp: 120, damage: 15, 
      abilities: ['freeze_tiles'], 
      description: 'An icy troll that can freeze your tiles',
      rewards: { xp: 75, gold: 150 },
      loot: { weapon: 'Frost Blade', chance: 0.2 }
    },
    { 
      id: 4, name: 'Fire Drake', emoji: '🐉', hp: 160, damage: 18, 
      abilities: ['burn_attack'], 
      description: 'A fierce drake that inflicts burning damage',
      rewards: { xp: 100, gold: 200 },
      loot: { weapon: 'Flame Sword', chance: 0.25 }
    },
    { 
      id: 5, name: 'Shadow Wraith', emoji: '👻', hp: 100, damage: 20, 
      abilities: ['curse_tiles'], 
      description: 'A dark wraith that curses the battlefield',
      rewards: { xp: 125, gold: 250 },
      loot: { weapon: 'Shadow Blade', chance: 0.3 }
    },
    { 
      id: 6, name: 'Lightning Elemental', emoji: '⚡', hp: 140, damage: 22, 
      abilities: ['chain_lightning'], 
      description: 'An elemental that can chain lightning attacks',
      rewards: { xp: 150, gold: 300 },
      loot: { weapon: 'Storm Sword', chance: 0.35 }
    },
    { 
      id: 7, name: 'Ancient Dragon', emoji: '🐲', hp: 300, damage: 35, 
      abilities: ['dragon_breath', 'treasure_hoard'], 
      description: 'The ultimate challenge - an ancient dragon with immense power',
      rewards: { xp: 500, gold: 1000 },
      loot: { weapon: 'Dragon Slayer', chance: 0.5 }
    }
  ];

  const UPGRADES = [
    {
      id: 'sword_master',
      name: 'Sword Mastery',
      description: '+50% sword damage',
      cost: 100,
      effect: { type: 'damage_multiplier', value: 1.5 },
      tier: 1
    },
    {
      id: 'shield_expert',
      name: 'Shield Expert',
      description: '+75% shield effectiveness',
      cost: 150,
      effect: { type: 'shield_multiplier', value: 1.75 },
      tier: 1
    },
    {
      id: 'potion_brewer',
      name: 'Master Alchemist',
      description: '+60% healing from potions',
      cost: 120,
      effect: { type: 'heal_multiplier', value: 1.6 },
      tier: 1
    },
    {
      id: 'mana_well',
      name: 'Mana Well',
      description: '+3 mana per crystal',
      cost: 200,
      effect: { type: 'mana_bonus', value: 3 },
      tier: 1
    },
    {
      id: 'fire_lord',
      name: 'Fire Lord',
      description: 'Fire deals +8 burn damage',
      cost: 250,
      effect: { type: 'burn_bonus', value: 8 },
      tier: 2
    },
    {
      id: 'frost_armor',
      name: 'Frost Armor',
      description: 'Immunity to freeze + reflect ice damage',
      cost: 300,
      effect: { type: 'freeze_immunity', value: true },
      tier: 2
    },
    {
      id: 'lightning_rod',
      name: 'Lightning Rod',
      description: 'Lightning chains to deal 2x damage',
      cost: 350,
      effect: { type: 'chain_lightning', value: true },
      tier: 2
    },
    {
      id: 'curse_ward',
      name: 'Curse Ward',
      description: 'Convert curse damage to healing',
      cost: 400,
      effect: { type: 'curse_immunity', value: true },
      tier: 2
    },
    {
      id: 'berserker',
      name: 'Berserker Rage',
      description: '+100% damage when below 30% HP',
      cost: 600,
      effect: { type: 'berserker', value: 2 },
      tier: 3
    },
    {
      id: 'phoenix_heart',
      name: 'Phoenix Heart',
      description: 'Revive once per battle with 50% HP',
      cost: 800,
      effect: { type: 'revive', value: 0.5 },
      tier: 3
    }
  ];

  const WEAPONS = {
    'basic': { name: 'Rusty Sword', damage: 0, description: 'A worn blade, but it gets the job done' },
    'Iron Sword': { name: 'Iron Sword', damage: 2, description: '+2 base damage per sword match' },
    'Frost Blade': { name: 'Frost Blade', damage: 3, description: '+3 base damage, chance to freeze enemies' },
    'Flame Sword': { name: 'Flame Sword', damage: 4, description: '+4 base damage, burn effect on crits' },
    'Shadow Blade': { name: 'Shadow Blade', damage: 5, description: '+5 base damage, ignores 25% enemy defense' },
    'Storm Sword': { name: 'Storm Sword', damage: 6, description: '+6 base damage, lightning chains on combo' },
    'Dragon Slayer': { name: 'Dragon Slayer', damage: 10, description: '+10 base damage, massive crit chance vs dragons' }
  };

  // Game State
  const [gameState, setGameState] = useState({
    mode: 'menu', // 'menu', 'singleplayer', 'multiplayer', 'lobby', 'pvp'
    player: {
      level: 1,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      mana: 0,
      maxMana: 100,
      shield: 0,
      gold: 0,
      upgrades: [],
      statusEffects: {},
      weapon: 'basic',
      inventory: [],
      wins: 0,
      losses: 0
    },
    enemy: null,
    opponent: null, // For PVP
    currentLevel: 1,
    board: [],
    selectedTile: null,
    animatingTiles: new Set(),
    turnPhase: 'player', // 'player', 'resolving', 'enemy', 'waiting'
    combo: 0,
    matchedTiles: new Set(),
    isGameOver: false,
    victory: false,
    multiplayerData: null,
    roomCode: '',
    isHost: false
  });

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const gameLoopRef = useRef();
  const lastUpdateRef = useRef(Date.now());
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
    
    if (showToast) {
      showToast(message, type);
    }
  }, [showToast]);

  const formatNumber = useCallback((num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  // Initialize Board
  const createRandomTile = useCallback(() => {
    const types = Object.values(TILE_TYPES).filter(t => t.id !== 'curse');
    return types[Math.floor(Math.random() * types.length)];
  }, []);

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
    let burn = 0;
    let freeze = 0;
    let shock = 0;
    
    const comboMultiplier = 1 + (combo * 0.3);
    const upgrades = gameState.player.upgrades || [];
    const hasUpgrade = (id) => upgrades.includes(id);
    const weapon = WEAPONS[gameState.player.weapon] || WEAPONS['basic'];
    
    // Berserker rage check
    const berserkerBonus = hasUpgrade('berserker') && 
      (gameState.player.hp / gameState.player.maxHp) < 0.3 ? 2 : 1;
    
    Object.entries(effects).forEach(([tileType, count]) => {
      switch (tileType) {
        case 'sword':
          const baseDamage = 15 + weapon.damage;
          damage += count * baseDamage * comboMultiplier * berserkerBonus *
            (hasUpgrade('sword_master') ? 1.5 : 1);
          
          // Critical hit chance (10% base + 5% per combo)
          if (Math.random() < 0.1 + (combo * 0.05)) {
            damage *= 2;
            addFloatingText('CRITICAL!', 200, 100, '#ff0000', 'text-2xl');
            playSound('coins');
          }
          break;
          
        case 'shield':
          shieldGain += count * 12 * comboMultiplier * (hasUpgrade('shield_expert') ? 1.75 : 1);
          break;
          
        case 'potion':
          healing += count * 15 * comboMultiplier * (hasUpgrade('potion_brewer') ? 1.6 : 1);
          break;
          
        case 'mana':
          manaGain += count * (10 + (hasUpgrade('mana_well') ? 3 : 0)) * comboMultiplier;
          break;
          
        case 'fire':
          burn += count * (4 + (hasUpgrade('fire_lord') ? 8 : 0)) * comboMultiplier;
          if (weapon.name === 'Flame Sword' && Math.random() < 0.3) {
            burn += count * 5; // Bonus burn from weapon
          }
          break;
          
        case 'ice':
          freeze += count * 3 * comboMultiplier;
          if (!hasUpgrade('freeze_immunity')) {
            // Enemy gets frozen
          }
          break;
          
        case 'lightning':
          let lightningDamage = count * 10 * comboMultiplier;
          if (hasUpgrade('chain_lightning')) {
            lightningDamage *= 2;
          }
          shock += lightningDamage;
          break;
          
        case 'curse':
          if (hasUpgrade('curse_ward')) {
            healing += count * 8; // Convert curse to healing
            addFloatingText('Curse Warded!', 150, 120, '#51cf66');
          } else {
            damage -= count * 10; // Curse reduces our own damage
            addFloatingText('Cursed!', 150, 120, '#9775fa');
          }
          break;
      }
    });
    
    return { damage: Math.max(0, damage), healing, manaGain, shieldGain, burn, freeze, shock };
  }, [gameState.player, addFloatingText, playSound]);

  const processPlayerTurn = useCallback((effects) => {
    setGameState(prev => {
      const newState = { ...prev };
      
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
        newState.player.shield += effects.shieldGain;
        addFloatingText(`+${effects.shieldGain} Shield`, 50, 100, '#4dabf7');
        playSound('ding');
      }
      
      // Apply damage to enemy
      if (effects.damage > 0 && newState.enemy) {
        let finalDamage = effects.damage;
        
        // Apply weapon special effects
        const weapon = WEAPONS[newState.player.weapon];
        if (weapon.name === 'Shadow Blade') {
          finalDamage *= 1.25; // Ignores some defense
        }
        if (weapon.name === 'Dragon Slayer' && newState.enemy.name.includes('Dragon')) {
          finalDamage *= 2; // Bonus vs dragons
        }
        
        newState.enemy.hp = Math.max(0, newState.enemy.hp - finalDamage);
        addFloatingText(`-${Math.floor(finalDamage)}`, 400, 200, '#ff6b6b', 'text-2xl');
        playSound('coins');
        
        // Apply status effects
        if (effects.burn > 0) {
          newState.enemy.statusEffects = { 
            ...newState.enemy.statusEffects, 
            burn: (newState.enemy.statusEffects.burn || 0) + effects.burn 
          };
        }
        if (effects.freeze > 0) {
          newState.enemy.statusEffects = { 
            ...newState.enemy.statusEffects, 
            freeze: (newState.enemy.statusEffects.freeze || 0) + effects.freeze 
          };
        }
        if (effects.shock > 0) {
          newState.enemy.statusEffects = { 
            ...newState.enemy.statusEffects, 
            shock: (newState.enemy.statusEffects.shock || 0) + effects.shock 
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
        
        // Check for loot drop
        if (newState.enemy.loot && Math.random() < newState.enemy.loot.chance) {
          if (newState.enemy.loot.weapon && !newState.player.inventory.includes(newState.enemy.loot.weapon)) {
            newState.player.inventory.push(newState.enemy.loot.weapon);
            addNotification(`Found ${newState.enemy.loot.weapon}!`, 'success');
          }
        }
        
        // Level up check
        while (newState.player.xp >= newState.player.xpToNext) {
          newState.player.xp -= newState.player.xpToNext;
          newState.player.level++;
          newState.player.xpToNext = Math.floor(newState.player.xpToNext * 1.2);
          newState.player.maxHp += 25;
          newState.player.hp = newState.player.maxHp; // Full heal on level up
          newState.player.maxMana += 10;
          addFloatingText('LEVEL UP!', 200, 150, '#ffd43b', 'text-3xl');
          addNotification(`Level Up! Now level ${newState.player.level}`, 'success');
          playSound('ding');
        }
        
        setTimeout(() => setShowLevelComplete(true), 1000);
      }
      
      return newState;
    });
  }, [addFloatingText, addNotification, playSound]);

  const processEnemyTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev.enemy || prev.enemy.hp <= 0) return prev;
      
      const newState = { ...prev };
      let damage = newState.enemy.damage;
      
      // Apply status effects to enemy first
      if (newState.enemy.statusEffects.burn > 0) {
        const burnDamage = newState.enemy.statusEffects.burn * 3;
        newState.enemy.hp = Math.max(0, newState.enemy.hp - burnDamage);
        addFloatingText(`-${burnDamage} Burn`, 400, 180, '#ff922b');
        newState.enemy.statusEffects.burn = Math.max(0, newState.enemy.statusEffects.burn - 1);
        
        if (newState.enemy.hp <= 0) {
          newState.victory = true;
          newState.isGameOver = true;
          return newState;
        }
      }
      
      if (newState.enemy.statusEffects.freeze > 0) {
        damage *= 0.4; // Heavily reduced damage when frozen
        newState.enemy.statusEffects.freeze = Math.max(0, newState.enemy.statusEffects.freeze - 1);
        addFloatingText('Frozen!', 400, 220, '#74c0fc');
      }
      
      if (newState.enemy.statusEffects.shock > 0) {
        damage *= 0.7; // Reduced damage when shocked
        newState.enemy.statusEffects.shock = Math.max(0, newState.enemy.statusEffects.shock - 1);
        addFloatingText('Shocked!', 400, 240, '#ffd43b');
      }
      
      // Enemy attacks (if not dead from burn)
      if (damage > 0 && newState.enemy.hp > 0) {
        // Apply damage to shield first
        if (newState.player.shield > 0) {
          const shieldDamage = Math.min(newState.player.shield, damage);
          newState.player.shield -= shieldDamage;
          damage -= shieldDamage;
          addFloatingText(`-${shieldDamage} Shield`, 100, 180, '#4dabf7');
        }
        
        // Apply remaining damage to HP
        if (damage > 0) {
          newState.player.hp = Math.max(0, newState.player.hp - damage);
          addFloatingText(`-${damage} HP`, 100, 150, '#ff6b6b', 'text-xl');
          playSound('ding');
        }
        
        // Enemy special abilities
        if (newState.enemy.abilities.includes('curse_tiles') && Math.random() < 0.25) {
          // Add curse tiles to board
          for (let i = 0; i < 3; i++) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            newState.board[row][col] = TILE_TYPES.CURSE;
          }
          addFloatingText('Board Cursed!', 300, 200, '#9775fa');
        }
        
        if (newState.enemy.abilities.includes('steal_gold') && Math.random() < 0.3) {
          const stolenGold = Math.min(newState.player.gold, Math.floor(newState.player.gold * 0.1));
          newState.player.gold -= stolenGold;
          addFloatingText(`-${stolenGold} Gold`, 100, 200, '#ffd43b');
        }
      }
      
      // Check for defeat
      if (newState.player.hp <= 0) {
        // Phoenix Heart revival check
        if (newState.player.upgrades.includes('phoenix_heart') && 
            !newState.player.statusEffects.phoenixUsed) {
          newState.player.hp = Math.floor(newState.player.maxHp * 0.5);
          newState.player.statusEffects.phoenixUsed = true;
          addFloatingText('PHOENIX REVIVAL!', 150, 100, '#ff6b00', 'text-3xl');
          addNotification('Phoenix Heart activated! You have been revived!', 'success');
          playSound('ding');
        } else {
          newState.isGameOver = true;
          newState.victory = false;
        }
      }
      
      return newState;
    });
  }, [addFloatingText, addNotification, playSound]);

  // Tile Swapping
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

  // Game Initialization
  const startSinglePlayer = useCallback(() => {
    const enemyTemplate = ENEMIES[(gameState.currentLevel - 1) % ENEMIES.length];
    const levelMultiplier = Math.floor((gameState.currentLevel - 1) / ENEMIES.length) + 1;
    const difficultyScale = Math.pow(1.15, gameState.currentLevel - 1);
    
    setGameState(prev => ({
      ...prev,
      mode: 'singleplayer',
      enemy: {
        ...enemyTemplate,
        hp: Math.floor(enemyTemplate.hp * difficultyScale),
        maxHp: Math.floor(enemyTemplate.hp * difficultyScale),
        damage: Math.floor(enemyTemplate.damage * difficultyScale),
        statusEffects: {},
        rewards: {
          xp: Math.floor(enemyTemplate.rewards.xp * levelMultiplier),
          gold: Math.floor(enemyTemplate.rewards.gold * levelMultiplier)
        }
      },
      board: initializeBoard(),
      turnPhase: 'player',
      isGameOver: false,
      victory: false,
      combo: 0,
      matchedTiles: new Set(),
      // Reset phoenix heart usage
      player: {
        ...prev.player,
        statusEffects: {}
      }
    }));
    
    addNotification(`Entering battle with ${enemyTemplate.name}!`, 'info');
  }, [gameState.currentLevel, initializeBoard, addNotification]);

  const nextLevel = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentLevel: prev.currentLevel + 1
    }));
    setShowLevelComplete(false);
    startSinglePlayer();
  }, [startSinglePlayer]);

  const returnToMenu = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      mode: 'menu',
      isGameOver: false,
      victory: false,
      enemy: null,
      opponent: null
    }));
    setShowLevelComplete(false);
    setShowUpgrades(false);
    setShowInventory(false);
  }, []);

  // Purchase Upgrade
  const purchaseUpgrade = useCallback((upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    
    setGameState(prev => {
      if (prev.player.gold < upgrade.cost || prev.player.upgrades.includes(upgradeId)) {
        return prev;
      }
      
      const newState = {
        ...prev,
        player: {
          ...prev.player,
          gold: prev.player.gold - upgrade.cost,
          upgrades: [...prev.player.upgrades, upgradeId]
        }
      };
      
      addNotification(`Purchased ${upgrade.name}!`, 'success');
      playSound('ding');
      
      return newState;
    });
  }, [addNotification, playSound]);

  // Weapon Management
  const equipWeapon = useCallback((weaponName) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        weapon: weaponName
      }
    }));
    addNotification(`Equipped ${weaponName}!`, 'success');
  }, [addNotification]);

  // Save/Load Game
  const saveGameData = useCallback(async () => {
    if (!studentData || !updateStudentData) return;
    
    try {
      const saveData = {
        match3BattleData: {
          player: gameState.player,
          currentLevel: gameState.currentLevel,
          lastSave: Date.now(),
          version: '2.0'
        }
      };
      
      await updateStudentData(saveData);
      console.log('✅ Match-3 Battle game saved');
    } catch (error) {
      console.error('❌ Error saving Match-3 Battle game:', error);
    }
  }, [gameState.player, gameState.currentLevel, studentData, updateStudentData]);

  const loadGameData = useCallback(() => {
    if (!studentData?.match3BattleData) return;
    
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
          mana: 0,
          maxMana: 100,
          shield: 0,
          gold: 0,
          upgrades: [],
          statusEffects: {},
          weapon: 'basic',
          inventory: [],
          wins: 0,
          losses: 0,
          ...saveData.player
        },
        currentLevel: saveData.currentLevel || 1
      }));
      
      console.log('✅ Match-3 Battle game loaded');
      addNotification('Game progress loaded!', 'info');
    } catch (error) {
      console.error('❌ Error loading Match-3 Battle game:', error);
    }
  }, [studentData, addNotification]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autosaveIntervalRef.current = setInterval(() => {
      if (gameState.mode !== 'menu') {
        saveGameData();
      }
    }, 30000);
    
    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [saveGameData, gameState.mode]);

  // Load on mount
  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

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

  // Tile click handler
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

  // Render Functions
  const renderBoard = () => (
    <div className="grid grid-cols-8 gap-1 bg-gray-800 p-2 rounded-xl shadow-inner">
      {gameState.board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const isSelected = gameState.selectedTile && 
            gameState.selectedTile[0] === rowIndex && 
            gameState.selectedTile[1] === colIndex;
          const isMatched = gameState.matchedTiles.has(`${rowIndex}-${colIndex}`);
          
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                w-8 h-8 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-lg md:text-2xl cursor-pointer
                transition-all duration-200 shadow-md
                ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-80 scale-110' : ''}
                ${isMatched ? 'animate-pulse scale-105' : ''}
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
              onClick={() => handleTileClick(rowIndex, colIndex)}
            >
              <span className="drop-shadow-lg">{tile?.emoji}</span>
            </div>
          );
        })
      )}
    </div>
  );

  const renderPlayerStats = () => (
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
          <p className="text-sm opacity-75">
            {WEAPONS[gameState.player.weapon]?.name || 'Basic Weapon'}
          </p>
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
      
      {/* Mana Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span>✨ Mana</span>
          <span>{gameState.player.mana}/{gameState.player.maxMana}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(gameState.player.mana / gameState.player.maxMana) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Shield & Gold */}
      <div className="flex justify-between text-sm mb-3">
        <div className="flex items-center space-x-1">
          <span>🛡️</span>
          <span>{gameState.player.shield}</span>
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
      
      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => setShowInventory(true)}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
        >
          🎒 Inventory
        </button>
        <button
          onClick={() => setShowUpgrades(true)}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
        >
          ⭐ Upgrades
        </button>
      </div>
    </div>
  );

  const renderEnemyStats = () => {
    if (!gameState.enemy) return null;
    
    return (
      <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-3xl animate-bounce">{gameState.enemy.emoji}</span>
          <div>
            <h3 className="font-bold text-lg">{gameState.enemy.name}</h3>
            <p className="text-sm opacity-75">Floor {gameState.currentLevel}</p>
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
        
        {/* Status Effects */}
        {gameState.enemy.statusEffects && Object.keys(gameState.enemy.statusEffects).length > 0 && (
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
            {gameState.enemy.statusEffects.shock > 0 && (
              <div className="bg-yellow-600 px-2 py-1 rounded">
                ⚡ {gameState.enemy.statusEffects.shock}
              </div>
            )}
          </div>
        )}
        
        <p className="text-xs opacity-75 leading-relaxed">{gameState.enemy.description}</p>
        
        {/* Rewards Preview */}
        <div className="mt-3 pt-3 border-t border-red-700">
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
      {/* Title */}
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
            <div className="text-2xl font-bold text-purple-600">{gameState.currentLevel}</div>
            <div className="text-sm text-gray-600">Current Floor</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{gameState.player.upgrades.length}</div>
            <div className="text-sm text-gray-600">Upgrades</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{gameState.player.inventory.length}</div>
            <div className="text-sm text-gray-600">Weapons</div>
          </div>
        </div>
      </div>
      
      {/* Game Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={startSinglePlayer}
          className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <div className="text-4xl mb-2">⚔️</div>
          <div className="text-xl font-bold">Tower Challenge</div>
          <div className="text-sm opacity-90">Climb the tower and face increasingly powerful enemies!</div>
          <div className="text-xs mt-2 bg-black bg-opacity-20 rounded px-2 py-1">
            Start at Floor {gameState.currentLevel}
          </div>
        </button>
        
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setShowUpgrades(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-lg font-bold">Upgrades Shop</div>
            <div className="text-sm opacity-90">Enhance your battle abilities!</div>
          </button>
          
          <button
            onClick={() => setShowInventory(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            <div className="text-3xl mb-2">🎒</div>
            <div className="text-lg font-bold">Inventory</div>
            <div className="text-sm opacity-90">Manage your weapons and equipment!</div>
          </button>
        </div>
      </div>
      
      {/* Enhanced Tutorial */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">🎯 How to Battle</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div className="text-center">
            <div className="text-2xl mb-1">⚔️</div>
            <div className="font-semibold">Swords</div>
            <div className="text-gray-600">Deal damage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🛡️</div>
            <div className="font-semibold">Shields</div>
            <div className="text-gray-600">Block damage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🧪</div>
            <div className="font-semibold">Potions</div>
            <div className="text-gray-600">Restore HP</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">✨</div>
            <div className="font-semibold">Mana</div>
            <div className="text-gray-600">Power spells</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">🔥</div>
            <div className="font-semibold">Fire</div>
            <div className="text-gray-600">Burn over time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">❄️</div>
            <div className="font-semibold">Ice</div>
            <div className="text-gray-600">Freeze enemy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <div className="font-semibold">Lightning</div>
            <div className="text-gray-600">Shock damage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">☠️</div>
            <div className="font-semibold">Curse</div>
            <div className="text-gray-600">Dangerous!</div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-sm font-semibold text-blue-800 mb-1">💡 Pro Tips:</div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Create combos for massive damage bonuses!</li>
            <li>• Upgrade your abilities to become stronger</li>
            <li>• Collect weapons from defeated enemies</li>
            <li>• Your progress saves automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderUpgrades = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">⭐ Upgrade Forge</h2>
        <button
          onClick={() => setShowUpgrades(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-center space-x-4 text-lg">
          <span>💰</span>
          <span className="font-bold">{formatNumber(gameState.player.gold)} Gold</span>
          <div className="text-sm text-gray-500">
            Level {gameState.player.level} • {gameState.player.upgrades.length} Upgrades Owned
          </div>
        </div>
      </div>
      
      {/* Group upgrades by tier */}
      {[1, 2, 3].map(tier => (
        <div key={tier} className="space-y-4">
          <h3 className="text-xl font-bold flex items-center">
            <span className={`mr-2 ${tier === 1 ? 'text-blue-600' : tier === 2 ? 'text-purple-600' : 'text-yellow-600'}`}>
              {tier === 1 ? '🥉' : tier === 2 ? '🥈' : '🥇'}
            </span>
            Tier {tier} Upgrades
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UPGRADES.filter(u => u.tier === tier).map(upgrade => {
              const owned = gameState.player.upgrades.includes(upgrade.id);
              const canAfford = gameState.player.gold >= upgrade.cost;
              
              return (
                <div
                  key={upgrade.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    owned 
                      ? 'bg-green-50 border-green-300 opacity-80' 
                      : canAfford 
                        ? 'bg-white border-blue-300 hover:shadow-lg cursor-pointer hover:scale-102' 
                        : 'bg-gray-50 border-gray-300 opacity-60'
                  }`}
                  onClick={() => !owned && canAfford && purchaseUpgrade(upgrade.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{upgrade.name}</h3>
                    <div className="text-right">
                      <div className={`font-bold ${owned ? 'text-green-600' : canAfford ? 'text-blue-600' : 'text-gray-400'}`}>
                        {owned ? '✅ Owned' : `💰 ${formatNumber(upgrade.cost)}`}
                      </div>
                      <div className={`text-xs ${tier === 1 ? 'text-blue-500' : tier === 2 ? 'text-purple-500' : 'text-yellow-500'}`}>
                        Tier {tier}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{upgrade.description}</p>
                  
                  {owned && (
                    <div className="mt-2 text-xs text-green-600 font-semibold">
                      ✨ Active Effect
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🎒 Weapon Arsenal</h2>
        <button
          onClick={() => setShowInventory(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="text-center">
          <div className="text-lg font-bold">Currently Equipped:</div>
          <div className="text-2xl font-bold text-blue-600">
            {WEAPONS[gameState.player.weapon]?.name || 'Basic Weapon'}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Always show basic weapon */}
        <div
          className={`p-4 rounded-xl border-2 transition-all ${
            gameState.player.weapon === 'basic'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300' 
              : 'bg-white border-gray-300 hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => gameState.player.weapon !== 'basic' && equipWeapon('basic')}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg">{WEAPONS['basic'].name}</h3>
            <div className="text-right">
              <div className="text-sm text-blue-600">Starter Weapon</div>
              {gameState.player.weapon === 'basic' && (
                <div className="text-xs text-green-600 font-bold">✅ EQUIPPED</div>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm">{WEAPONS['basic'].description}</p>
          <div className="mt-2 text-sm font-semibold">
            Base Damage: +{WEAPONS['basic'].damage}
          </div>
        </div>
        
        {/* Show inventory weapons */}
        {gameState.player.inventory.map(weaponName => {
          const weapon = WEAPONS[weaponName];
          if (!weapon) return null;
          
          const isEquipped = gameState.player.weapon === weaponName;
          
          return (
            <div
              key={weaponName}
              className={`p-4 rounded-xl border-2 transition-all ${
                isEquipped
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300' 
                  : 'bg-white border-gray-300 hover:shadow-lg cursor-pointer hover:scale-102'
              }`}
              onClick={() => !isEquipped && equipWeapon(weaponName)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{weapon.name}</h3>
                <div className="text-right">
                  <div className="text-sm text-purple-600">Legendary</div>
                  {isEquipped && (
                    <div className="text-xs text-green-600 font-bold">✅ EQUIPPED</div>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm">{weapon.description}</p>
              <div className="mt-2 text-sm font-semibold">
                Base Damage: +{weapon.damage}
              </div>
              {!isEquipped && (
                <div className="mt-2">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    ⚔️ Equip Weapon
                  </button>
                </div>
              )}
            </div>
          );
        })}
        
        {gameState.player.inventory.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚔️</div>
            <div>No legendary weapons found yet!</div>
            <div className="text-sm mt-2">Defeat enemies to collect powerful weapons</div>
          </div>
        )}
      </div>
    </div>
  );

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
              notification.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Menu */}
      {gameState.mode === 'menu' && (
        <div className="max-w-4xl mx-auto">
          {renderMenu()}
        </div>
      )}

      {/* Upgrades */}
      {showUpgrades && (
        <div className="max-w-6xl mx-auto">
          {renderUpgrades()}
        </div>
      )}

      {/* Inventory */}
      {showInventory && (
        <div className="max-w-4xl mx-auto">
          {renderInventory()}
        </div>
      )}

      {/* Single Player Game */}
      {gameState.mode === 'singleplayer' && (
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-2">⚔️</span>
              Floor {gameState.currentLevel}
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
                onClick={saveGameData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                💾 Save
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
              
              {/* Enhanced Legend */}
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-bold mb-3 text-center">⚡ Battle Elements</h4>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
                  {Object.values(TILE_TYPES).map(tile => (
                    <div key={tile.id} className="flex flex-col items-center p-2 rounded-lg bg-gray-50">
                      <div className="text-lg mb-1">{tile.emoji}</div>
                      <div className="font-semibold text-xs">{tile.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enemy Stats */}
            <div className="lg:col-span-1">
              {renderEnemyStats()}
            </div>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">Victory!</h2>
            <p className="text-gray-600 mb-4">
              You defeated the {gameState.enemy?.name}!
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
              <div className="text-sm space-y-2">
                <div>⭐ XP Gained: +{gameState.enemy?.rewards.xp}</div>
                <div>💰 Gold Earned: +{gameState.enemy?.rewards.gold}</div>
                {gameState.player.inventory.length > 0 && (
                  <div className="text-purple-600 font-semibold">
                    🗡️ Check your inventory for new weapons!
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={returnToMenu}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                🏠 Menu
              </button>
              <button
                onClick={nextLevel}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg hover:shadow-lg"
              >
                ⬆️ Next Floor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState.isGameOver && !gameState.victory && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
            <div className="text-6xl mb-4">💀</div>
            <h2 className="text-2xl font-bold mb-4">Defeated!</h2>
            <p className="text-gray-600 mb-4">
              The {gameState.enemy?.name} proved too powerful this time.
            </p>
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">
                Don't give up! Use your gold to purchase upgrades and try again with better equipment.
              </div>
            </div>
            <button
              onClick={returnToMenu}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-3 rounded-lg hover:shadow-lg font-bold"
            >
              ⚔️ Return & Upgrade
            </button>
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
        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Match3BattleGame;