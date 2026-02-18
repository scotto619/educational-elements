// components/games/SinMinerGame.js - Sin Miner: Roguelike Clicker Game Prototype
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';

// ============ CONSTANTS & DATA ============

const CHARACTERS = {
    pride: {
        id: 'pride', name: 'Pride', emoji: '👑', color: '#FFD700', desc: 'High damage scaling. Gets buffs when alone. Refuses help.',
        passive: 'Solo Power: +50% damage with no allies, -30% ally effectiveness',
        stats: { baseAtk: 12, baseDef: 3, baseHp: 80, atkGrowth: 2.5, defGrowth: 0.5, hpGrowth: 8 },
        bonuses: { soloDmgMult: 1.5, allyPenalty: 0.7 }
    },
    greed: {
        id: 'greed', name: 'Greed', emoji: '💰', color: '#50C878', desc: 'Extra gold drops. Shop discounts. Takes more damage if rich.',
        passive: 'Gold Rush: +25% gold, 15% shop discount, +1% damage taken per 100 gold',
        stats: { baseAtk: 8, baseDef: 4, baseHp: 100, atkGrowth: 1.5, defGrowth: 0.8, hpGrowth: 12 },
        bonuses: { goldMult: 1.25, shopDiscount: 0.85, dmgPerGold: 0.01 }
    },
    wrath: {
        id: 'wrath', name: 'Wrath', emoji: '🔥', color: '#FF4444', desc: 'Damage increases when injured. Faster attacks.',
        passive: 'Berserker: Up to +100% damage at low HP, +20% click speed',
        stats: { baseAtk: 14, baseDef: 2, baseHp: 90, atkGrowth: 3, defGrowth: 0.3, hpGrowth: 10 },
        bonuses: { rageMult: 2.0, clickSpeedMult: 1.2 }
    },
    envy: {
        id: 'envy', name: 'Envy', emoji: '💚', color: '#00CED1', desc: 'Copies enemy abilities. Gains bonuses near allies.',
        passive: 'Mimic: 20% chance to copy enemy attack, +15% damage with allies',
        stats: { baseAtk: 10, baseDef: 4, baseHp: 95, atkGrowth: 2, defGrowth: 0.7, hpGrowth: 11 },
        bonuses: { copyChance: 0.2, allyDmgMult: 1.15 }
    },
    lust: {
        id: 'lust', name: 'Lust', emoji: '💜', color: '#FF69B4', desc: 'Charm mechanics. Converts enemies to allies temporarily.',
        passive: 'Charm: 10% chance to charm enemy (skip turn), familiar focused',
        stats: { baseAtk: 7, baseDef: 5, baseHp: 85, atkGrowth: 1.5, defGrowth: 1, hpGrowth: 9 },
        bonuses: { charmChance: 0.1, familiarBoost: 1.3 }
    },
    gluttony: {
        id: 'gluttony', name: 'Gluttony', emoji: '🍖', color: '#FF8C00', desc: 'Eats items for buffs. Larger inventory. Health regen focus.',
        passive: 'Devour: Can consume items for buffs, +5 inventory slots, passive regen',
        stats: { baseAtk: 6, baseDef: 6, baseHp: 130, atkGrowth: 1, defGrowth: 1.2, hpGrowth: 15 },
        bonuses: { extraSlots: 5, regenPerSec: 0.5, canEatItems: true }
    },
    sloth: {
        id: 'sloth', name: 'Sloth', emoji: '🦥', color: '#9370DB', desc: 'Slow but powerful hits. Idle bonuses. Defensive tank.',
        passive: 'Heavy Strikes: 2x damage but 50% slower, idle gold bonus',
        stats: { baseAtk: 20, baseDef: 8, baseHp: 120, atkGrowth: 4, defGrowth: 1.5, hpGrowth: 14 },
        bonuses: { dmgMult: 2.0, speedMult: 0.5, idleGoldPerSec: 0.5 }
    }
};

const ENEMIES = [
    { id: 'rockling', name: 'Rockling', emoji: '🪨', hp: 30, atk: 3, def: 8, gold: 15, xp: 5, tier: 1, desc: 'Living chunk of ore' },
    { id: 'tunnel_rat', name: 'Tunnel Rat', emoji: '🐀', hp: 20, atk: 6, def: 2, gold: 10, xp: 4, tier: 1, desc: 'Quick attacker, steals gold', special: 'steal' },
    { id: 'cave_spider', name: 'Cave Spider', emoji: '🕷️', hp: 25, atk: 5, def: 3, gold: 12, xp: 5, tier: 1, desc: 'Applies poison', special: 'poison' },
    { id: 'dust_wisp', name: 'Dust Wisp', emoji: '👻', hp: 15, atk: 4, def: 1, gold: 8, xp: 3, tier: 1, desc: 'Hard to see, annoying' },
    { id: 'shard_beetle', name: 'Shard Beetle', emoji: '🪲', hp: 22, atk: 7, def: 4, gold: 14, xp: 6, tier: 1, desc: 'Explodes on death', special: 'explode' },
    { id: 'gold_hoarder', name: 'Gold Hoarder', emoji: '🧟', hp: 50, atk: 8, def: 6, gold: 40, xp: 12, tier: 2, desc: 'Greed-corrupted miner' },
    { id: 'rage_shade', name: 'Rage Shade', emoji: '😡', hp: 45, atk: 12, def: 3, gold: 25, xp: 10, tier: 2, desc: 'Faster when hurt', special: 'enrage' },
    { id: 'mirror_phantom', name: 'Mirror Phantom', emoji: '🪞', hp: 40, atk: 6, def: 5, gold: 30, xp: 11, tier: 2, desc: 'Copies player damage', special: 'mirror' },
    { id: 'sloth_golem', name: 'Sloth Golem', emoji: '🗿', hp: 80, atk: 15, def: 12, gold: 35, xp: 14, tier: 2, desc: 'Very slow, massive hits' },
    { id: 'crystal_sentinel', name: 'Crystal Sentinel', emoji: '💎', hp: 60, atk: 10, def: 10, gold: 30, xp: 13, tier: 2, desc: 'Reflects some damage', special: 'reflect' },
    { id: 'magma_crawler', name: 'Magma Crawler', emoji: '🌋', hp: 55, atk: 9, def: 7, gold: 28, xp: 11, tier: 2, desc: 'Damage over time aura', special: 'dot' },
    { id: 'corruption_spawn', name: 'Corruption Spawn', emoji: '🟣', hp: 100, atk: 14, def: 8, gold: 50, xp: 20, tier: 3, desc: 'Spawns at high corruption' },
    { id: 'golden_mimic', name: 'Golden Mimic', emoji: '📦', hp: 70, atk: 11, def: 9, gold: 60, xp: 18, tier: 3, desc: 'Looks like treasure' },
    { id: 'forgotten_miner', name: 'Forgotten Miner', emoji: '⛏️', hp: 90, atk: 13, def: 7, gold: 45, xp: 22, tier: 3, desc: 'Drops relics' },
];

const BOSSES = [
    {
        id: 'humility', name: 'Humility, The Monk', emoji: '🧘', baseHp: 200, atk: 10, def: 5, gold: 100, hour: 1,
        mechanic: 'Less clicking = more effective hits', phases: ['Meditation Stance', 'Void Step', 'Final Clarity']
    },
    {
        id: 'charity', name: 'Charity, The Keeper', emoji: '🏛️', baseHp: 300, atk: 12, def: 7, gold: 150, hour: 2,
        mechanic: 'Gold slowly drains during battle', phases: ['Generous Offering', 'Cursed Gifts', 'Vault Sealed']
    },
    {
        id: 'patience', name: 'Patience, The Sentinel', emoji: '🗻', baseHp: 400, atk: 18, def: 10, gold: 200, hour: 3,
        mechanic: 'Punishes spam clicking', phases: ['Quiet Watch', 'Slow Retribution', 'Immovable']
    },
    {
        id: 'contentment', name: 'Contentment, The Twin', emoji: '☯️', baseHp: 500, atk: 14, def: 8, gold: 250, hour: 4,
        mechanic: 'Copies your stats', phases: ['Mirror Form', 'Balanced Strike', 'Inner Peace']
    },
    {
        id: 'purity', name: 'Purity, The Guardian', emoji: '✨', baseHp: 600, atk: 16, def: 9, gold: 300, hour: 5,
        mechanic: 'Immune to charm, converts familiars', phases: ['Holy Shield', 'Purifying Light', 'Judgment']
    },
    {
        id: 'temperance', name: 'Temperance, The Bearer', emoji: '⚖️', baseHp: 700, atk: 15, def: 11, gold: 350, hour: 6,
        mechanic: 'Excess healing becomes damage', phases: ['Balanced Scales', 'Overflow', 'Measure']
    },
    {
        id: 'diligence', name: 'Diligence, The Miner', emoji: '⛏️', baseHp: 800, atk: 17, def: 8, gold: 400, hour: 7,
        mechanic: 'Constant pressure attacks', phases: ['Work Ethic', 'Relentless', 'Breakthrough']
    },
    {
        id: 'hope', name: 'Hope, The Light', emoji: '🌟', baseHp: 900, atk: 14, def: 12, gold: 450, hour: 8,
        mechanic: 'Revives once at 30% HP', phases: ['Guiding Light', 'Resurrection', 'Last Hope']
    },
    {
        id: 'faith', name: 'Faith, The Illusionist', emoji: '🔮', baseHp: 1000, atk: 16, def: 10, gold: 500, hour: 9,
        mechanic: 'Illusion phases - find real boss', phases: ['True Form', 'Illusions', 'Revelation']
    },
    {
        id: 'justice', name: 'Justice, The Judge', emoji: '⚔️', baseHp: 1200, atk: 20, def: 12, gold: 600, hour: 10,
        mechanic: 'Punishes exploitative builds', phases: ['Verdict', 'Sentence', 'Execution']
    },
    {
        id: 'mercy', name: 'Mercy, The Compassionate', emoji: '🕊️', baseHp: 1400, atk: 18, def: 14, gold: 700, hour: 11,
        mechanic: 'Offers chance to retreat', phases: ['Open Arms', 'Gentle Warning', 'Forgiveness']
    },
    {
        id: 'god', name: 'GOD, The Divine Judge', emoji: '👁️', baseHp: 2000, atk: 25, def: 15, gold: 1500, hour: 12,
        mechanic: 'Adapts to your playstyle', phases: ['Light Form', 'Judgment Form', 'Mercy Form', 'True Divine']
    },
];

const ITEMS = [
    { id: 'rusty_pick', name: 'Rusty Pickaxe', type: 'weapon', emoji: '⛏️', rarity: 'common', stats: { atk: 3 }, desc: 'A worn mining tool', value: 10 },
    { id: 'iron_sword', name: 'Iron Sword', type: 'weapon', emoji: '⚔️', rarity: 'common', stats: { atk: 5 }, desc: 'Simple but effective', value: 25 },
    { id: 'steel_blade', name: 'Steel Blade', type: 'weapon', emoji: '🗡️', rarity: 'uncommon', stats: { atk: 10 }, desc: 'Well-forged steel', value: 60 },
    { id: 'flame_axe', name: 'Flame Axe', type: 'weapon', emoji: '🪓', rarity: 'rare', stats: { atk: 18, bonusDmg: 5 }, desc: 'Burns with inner fire', value: 150 },
    { id: 'leather_vest', name: 'Leather Vest', type: 'armor', emoji: '🦺', rarity: 'common', stats: { def: 3, hp: 10 }, desc: 'Basic protection', value: 15 },
    { id: 'chainmail', name: 'Chainmail', type: 'armor', emoji: '🛡️', rarity: 'uncommon', stats: { def: 7, hp: 20 }, desc: 'Linked metal rings', value: 50 },
    { id: 'plate_armor', name: 'Plate Armor', type: 'armor', emoji: '🏋️', rarity: 'rare', stats: { def: 15, hp: 40 }, desc: 'Heavy but strong', value: 120 },
    { id: 'hp_potion', name: 'Health Potion', type: 'consumable', emoji: '🧪', rarity: 'common', stats: { heal: 30 }, desc: 'Restores 30 HP', value: 8, stackable: true },
    { id: 'big_hp_potion', name: 'Great Potion', type: 'consumable', emoji: '🧪', rarity: 'uncommon', stats: { heal: 80 }, desc: 'Restores 80 HP', value: 25, stackable: true },
    { id: 'atk_scroll', name: 'Attack Scroll', type: 'consumable', emoji: '📜', rarity: 'uncommon', stats: { tempAtk: 10, duration: 60 }, desc: '+10 ATK for 60s', value: 20, stackable: true },
    { id: 'lucky_coin', name: 'Lucky Coin', type: 'trinket', emoji: '🪙', rarity: 'uncommon', stats: { goldMult: 1.1 }, desc: '+10% gold find', value: 40 },
    { id: 'miners_lamp', name: "Miner's Lamp", type: 'trinket', emoji: '🔦', rarity: 'common', stats: { mineSpeed: 1.15 }, desc: '+15% mining speed', value: 30 },
    { id: 'corruption_ward', name: 'Corruption Ward', type: 'trinket', emoji: '🛡️', rarity: 'rare', stats: { corruptionReduce: 0.2 }, desc: '-20% corruption gain', value: 80 },
    { id: 'ancient_relic', name: 'Ancient Relic', type: 'trinket', emoji: '🏺', rarity: 'epic', stats: { allStats: 5 }, desc: '+5 to all stats', value: 200 },
    { id: 'golden_idol', name: 'Golden Idol', type: 'trinket', emoji: '🗿', rarity: 'epic', stats: { goldMult: 1.3, corruptionGain: 1.2 }, desc: '+30% gold, +20% corruption', value: 250 },
];

const SHOP_ITEMS = ['rusty_pick', 'iron_sword', 'leather_vest', 'hp_potion', 'big_hp_potion', 'atk_scroll', 'lucky_coin', 'miners_lamp', 'corruption_ward'];

const EVENTS = [
    {
        id: 'rich_vein', name: 'Rich Vein Surge', emoji: '💎', desc: 'A vein of pure gold glimmers before you!',
        choices: [{ text: 'Mine it greedily (+gold, +corr)', effect: 'richVeinGreedy' }, { text: 'Mine carefully (+small gold)', effect: 'richVeinCareful' }]
    },
    {
        id: 'cave_in', name: 'Cave-In Warning', emoji: '⚠️', desc: 'Rumbling overhead! The ceiling is unstable!',
        choices: [{ text: 'Stay for bonus ore (risky)', effect: 'caveInStay' }, { text: 'Escape safely', effect: 'caveInEscape' }]
    },
    {
        id: 'ancient_relic', name: 'Ancient Relic Found', emoji: '🏺', desc: 'A glowing artifact pulses with strange energy...',
        choices: [{ text: 'Take it (item, maybe cursed)', effect: 'relicTake' }, { text: 'Leave it alone', effect: 'relicLeave' }]
    },
    {
        id: 'wandering_merchant', name: 'Wandering Merchant', emoji: '🧙', desc: 'A hooded figure offers rare wares at a price.',
        choices: [{ text: 'Browse shop', effect: 'merchantShop' }, { text: 'No thanks', effect: 'nothing' }]
    },
    {
        id: 'golden_idol_event', name: 'Golden Idol', emoji: '🗿', desc: 'A golden statue whispers promises of power...',
        choices: [{ text: 'Sacrifice HP for gold', effect: 'idolSacrifice' }, { text: 'Sacrifice gold for blessing', effect: 'idolBless' }, { text: 'Walk away', effect: 'nothing' }]
    },
    {
        id: 'whispering_voice', name: 'The Whispering Voice', emoji: '😈', desc: 'A sinister voice offers you a deal...',
        choices: [{ text: 'Accept power boost (+ATK, +corr)', effect: 'whisperAccept' }, { text: 'Refuse the temptation', effect: 'whisperRefuse' }]
    },
    {
        id: 'lost_miner', name: 'Lost Miner', emoji: '👷', desc: 'A trembling miner begs for help finding the exit.',
        choices: [{ text: 'Help them (costs time, reward)', effect: 'helpMiner' }, { text: 'Ignore them', effect: 'nothing' }]
    },
    {
        id: 'dice_demon', name: 'Dice Demon', emoji: '🎲', desc: 'A cackling imp offers to roll the dice of fate!',
        choices: [{ text: 'Roll! (random outcome)', effect: 'diceRoll' }, { text: 'Too risky', effect: 'nothing' }]
    },
    {
        id: 'underground_spring', name: 'Underground Spring', emoji: '💧', desc: 'Crystal clear water flows from the rock wall.',
        choices: [{ text: 'Drink deeply (full heal)', effect: 'springHeal' }, { text: 'Fill bottles (heal item)', effect: 'springBottle' }]
    },
    {
        id: 'glowing_crystal', name: 'Glowing Crystal Cluster', emoji: '✨', desc: 'Pulsing crystals offer a random enhancement.',
        choices: [{ text: 'Touch the crystals', effect: 'crystalTouch' }, { text: 'Admire from afar', effect: 'nothing' }]
    },
];

const GAME_HOUR_REAL_MS = 150000; // 2.5 min real = 1 game hour
const MINE_CLICK_BASE_GOLD = 1;
const ENEMY_SPAWN_CHANCE = 0.08;
const EVENT_SPAWN_CHANCE = 0.04;
const CORRUPTION_PER_CLICK = 0.15;
const MAX_CORRUPTION = 100;
const INVENTORY_SIZE = 15;

const getDefaultSaveData = () => ({
    unlockedCharacters: ['pride', 'greed', 'wrath'],
    permanentInventory: [],
    completedRuns: 0,
    totalBossesDefeated: 0,
    bestRunHour: 0,
    homeUpgrades: { inventorySize: 0, mineSpeed: 0, shopQuality: 0 },
    allTimeGold: 0,
    characterCompletions: {},
});

const getDefaultRunState = () => ({
    active: false,
    characterId: null,
    currentHour: 1, // Start at hour 1
    gold: 0,
    hp: 0,
    maxHp: 0,
    atk: 0,
    def: 0,
    corruption: 0,
    inventory: [],
    clicks: 0,
    totalDamageDealt: 0,
    enemiesKilled: 0,
    bossesDefeatedThisRun: [],
    activeBuffs: [],
    hourStartTime: 0,
    screen: 'mine', // mine, battle, boss, event, shop
    currentEnemy: null,
    currentBoss: null,
    currentEvent: null,
    bossDefeatedThisHour: false,
    runStartTime: 0,
    lastClickTime: 0,
    clickCombo: 0,
    poisoned: false,
    poisonDmg: 0,
    poisonTicks: 0,
});

// ============ MAIN COMPONENT ============

const SinMinerGame = ({ studentData, updateStudentData, showToast }) => {
    // Global State
    const [saveData, setSaveData] = useState(getDefaultSaveData());
    const [runState, setRunState] = useState(getDefaultRunState());
    const [gameState, setGameState] = useState('menu'); // menu, select, home, play, dead, win

    // UI State
    const [toasts, setToasts] = useState([]);
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [shopOpen, setShopOpen] = useState(false);
    const [inventoryOpen, setInventoryOpen] = useState(false);

    // Refs
    const runTimerRef = useRef(null);
    const clickComboTimerRef = useRef(null);
    const gameLoopRef = useRef(null);

    // Load Data
    useEffect(() => {
        if (studentData?.sinMinerData) {
            setSaveData({ ...getDefaultSaveData(), ...studentData.sinMinerData });
            if (studentData.sinMinerData.activeRun) {
                setRunState(studentData.sinMinerData.activeRun);
                setGameState('play');
                startRunTimer();
            }
        }
    }, [studentData]);

    // Save Data
    const saveGame = useCallback((newSaveData, newRunState) => {
        const dataToSave = {
            ...(newSaveData || saveData),
            activeRun: (newRunState || runState).active ? (newRunState || runState) : null
        };
        updateStudentData({ sinMinerData: dataToSave });
    }, [saveData, runState, updateStudentData]);

    // Timer System
    const startRunTimer = () => {
        if (runTimerRef.current) clearInterval(runTimerRef.current);
        runTimerRef.current = setInterval(() => {
            setRunState(prev => {
                if (!prev.active || prev.screen === 'boss') return prev;

                const now = Date.now();
                const timeInHour = now - prev.hourStartTime;

                // Hour complete -> Boss Spawn
                if (timeInHour >= GAME_HOUR_REAL_MS && !prev.currentBoss) {
                    showToast('The hour is late... a boss approaches!', 'warning');
                    return initiateBossFight(prev);
                }

                return prev;
            });
        }, 1000);
    };

    const initiateBossFight = (state) => {
        const bossTemplate = BOSSES.find(b => b.hour === state.currentHour) || BOSSES[BOSSES.length - 1];

        // Scale boss based on corruption
        const corruptionMult = 1 + (state.corruption / 200);
        const bossHp = Math.floor(bossTemplate.baseHp * corruptionMult);

        return {
            ...state,
            screen: 'boss',
            currentBoss: {
                ...bossTemplate,
                hp: bossHp,
                maxHp: bossHp,
                phaseIndex: 0
            }
        };
    };

    // Combat Logic
    const calculateDamage = (attacker, defender, isPlayerAttacking) => {
        let damage = attacker.atk - (defender.def / 2);

        if (isPlayerAttacking) {
            // Apply character passives
            if (runState.characterId === 'pride') damage *= 1.5;
            if (runState.characterId === 'wrath') {
                const hpMissing = 1 - (runState.hp / runState.maxHp);
                damage *= (1 + hpMissing);
            }
            if (runState.characterId === 'sloth') damage *= 2;

            // Crit chance
            if (Math.random() < 0.1) damage *= 1.5;
        } else {
            // Enemy attacking player
            if (runState.characterId === 'greed') {
                damage *= (1 + (runState.gold / 10000));
            }
        }

        return Math.max(1, Math.floor(damage));
    };

    const handleAttack = () => {
        if (!runState.currentEnemy && !runState.currentBoss) return;

        const target = runState.currentBoss || runState.currentEnemy;
        const damage = calculateDamage(runState, target, true);

        // Deal Damage
        const newHp = Math.max(0, target.hp - damage);

        // Floating Text
        addFloatingText(damage, 'damage');

        // Handle Kill
        if (newHp <= 0) {
            if (runState.currentBoss) {
                handleBossDefeat(runState.currentBoss);
            } else {
                handleEnemyDefeat(runState.currentEnemy);
            }
        } else {
            // Update Target HP
            if (runState.currentBoss) {
                // Boss Phase Checks
                const hpPercent = newHp / target.maxHp;
                const phaseIdx = Math.floor((1 - hpPercent) * 3);

                setRunState(prev => ({
                    ...prev,
                    currentBoss: { ...prev.currentBoss, hp: newHp, phaseIndex: phaseIdx }
                }));
            } else {
                setRunState(prev => ({
                    ...prev,
                    currentEnemy: { ...prev.currentEnemy, hp: newHp }
                }));
            }

            // Counter-attack chance
            if (Math.random() < 0.3) {
                const enemyDmg = calculateDamage(target, runState, false);
                takeDamage(enemyDmg);
            }
        }
    };

    const takeDamage = (amount) => {
        setRunState(prev => {
            const newHp = Math.max(0, prev.hp - amount);
            if (newHp <= 0) {
                endRun(false); // Death
                return { ...prev, hp: 0, active: false };
            }
            return { ...prev, hp: newHp };
        });
        addFloatingText(`-${amount} HP`, 'damage-player');
    };

    // Event Logic
    const triggerRandomEvent = () => {
        const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        setRunState(prev => ({
            ...prev,
            screen: 'event',
            currentEvent: event
        }));
    };

    const handleEventChoice = (choice) => {
        // Process effects
        switch (choice.effect) {
            case 'richVeinGreedy':
                setRunState(prev => ({ ...prev, gold: prev.gold + 50, corruption: Math.min(100, prev.corruption + 15), screen: 'mine' }));
                showToast('Greed fills your pockets... and your soul.', 'success');
                break;
            case 'richVeinCareful':
                setRunState(prev => ({ ...prev, gold: prev.gold + 15, screen: 'mine' }));
                break;
            case 'springHeal':
                setRunState(prev => ({ ...prev, hp: prev.maxHp, screen: 'mine' }));
                showToast('Refreshed!', 'success');
                break;
            // ... Add more cases as needed
            default:
                setRunState(prev => ({ ...prev, screen: 'mine' }));
        }
    };

    // Mining Logic
    const handleMineClick = (e) => {
        if (runState.screen !== 'mine') return;

        // Sloth penalty
        if (runState.characterId === 'sloth') {
            const now = Date.now();
            if (now - runState.lastClickTime < 800) return; // Slow attack speed
        }

        const baseGold = MINE_CLICK_BASE_GOLD;
        const goldGain = Math.floor(baseGold * (1 + runState.gold / 1000)); // Simple scaling

        setRunState(prev => ({
            ...prev,
            gold: prev.gold + goldGain,
            clicks: prev.clicks + 1,
            corruption: Math.min(MAX_CORRUPTION, prev.corruption + CORRUPTION_PER_CLICK),
            lastClickTime: Date.now()
        }));

        addFloatingText(`+${goldGain}g`, 'gold', e.clientX, e.clientY);

        // Random Encounters
        if (Math.random() < ENEMY_SPAWN_CHANCE * (1 + runState.corruption / 100)) {
            spawnEnemy();
        } else if (Math.random() < EVENT_SPAWN_CHANCE) {
            triggerRandomEvent();
        }
    };

    const spawnEnemy = () => {
        // Select enemy based on tier/corruption
        const validEnemies = ENEMIES.filter(e => e.tier <= (runState.corruption > 50 ? 2 : 1));
        const enemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];

        setRunState(prev => ({
            ...prev,
            screen: 'battle',
            currentEnemy: { ...enemy, maxHp: enemy.hp }
        }));
    };

    const handleEnemyDefeat = (enemy) => {
        setRunState(prev => ({
            ...prev,
            gold: prev.gold + enemy.gold,
            enemiesKilled: prev.enemiesKilled + 1,
            screen: 'mine',
            currentEnemy: null
        }));
        showToast(`Defeated ${enemy.name}! +${enemy.gold}g`, 'success');
    };

    const handleBossDefeat = (boss) => {
        setRunState(prev => ({
            ...prev,
            gold: prev.gold + boss.gold,
            bossesDefeatedThisRun: [...prev.bossesDefeatedThisRun, boss.id],
            screen: 'mine',
            currentBoss: null,
            currentHour: prev.currentHour + 1,
            hourStartTime: Date.now() // Reset hour timer
        }));

        if (boss.id === 'god') {
            endRun(true); // Victory
        } else {
            showToast('Boss Defeated! Proceeding to next hour...', 'success');
            // Offer extraction?
        }
    };

    // Run Management
    const startRun = (charId) => {
        const char = CHARACTERS[charId];
        const newState = {
            ...getDefaultRunState(),
            active: true,
            characterId: charId,
            hp: char.stats.baseHp,
            maxHp: char.stats.baseHp,
            atk: char.stats.baseAtk,
            def: char.stats.baseDef,
            hourStartTime: Date.now(),
            runStartTime: Date.now(),
            inventory: [...saveData.permanentInventory] // Load perm items
        };

        setRunState(newState);
        setGameState('play');
        startRunTimer();
        saveGame(null, newState);
    };

    const endRun = (victory) => {
        setGameState(victory ? 'win' : 'dead');
        clearInterval(runTimerRef.current);

        // Update Perm Save Data
        setSaveData(prev => {
            const newData = {
                ...prev,
                allTimeGold: prev.allTimeGold + runState.gold,
                completedRuns: victory ? prev.completedRuns + 1 : prev.completedRuns,
                // If victory, keep inventory (simplified)
                permanentInventory: victory ? runState.inventory : prev.permanentInventory
            };

            saveGame(newData, getDefaultRunState()); // Reset active run
            return newData;
        });
    };

    // Helper UI Components
    const addFloatingText = (text, type, x, y) => {
        const id = Date.now();
        setFloatingTexts(prev => [...prev, { id, text, type, x: x || window.innerWidth / 2, y: y || window.innerHeight / 2 }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 1000);
    };

    // RENDERERS

    const renderCharacterSelect = () => (
        <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(CHARACTERS).map(char => {
                const isLocked = !saveData.unlockedCharacters.includes(char.id);
                return (
                    <div key={char.id} className={`bg-gray-800 rounded-xl p-6 border-2 ${isLocked ? 'border-gray-700 opacity-50' : 'border-gray-600 hover:border-white'} transition-all`}>
                        <div className="text-4xl mb-4">{char.emoji}</div>
                        <h3 className="text-2xl font-bold text-white mb-2" style={{ color: char.color }}>{char.name}</h3>
                        <p className="text-gray-400 text-sm mb-4 h-12">{char.desc}</p>
                        <div className="space-y-2 mb-6 text-sm text-gray-300">
                            <div className="flex justify-between"><span>ATK</span><span>{char.stats.baseAtk}</span></div>
                            <div className="flex justify-between"><span>DEF</span><span>{char.stats.baseDef}</span></div>
                            <div className="flex justify-between"><span>HP</span><span>{char.stats.baseHp}</span></div>
                        </div>
                        <button
                            onClick={() => !isLocked && startRun(char.id)}
                            disabled={isLocked}
                            className={`w-full py-3 rounded-lg font-bold ${isLocked ? 'bg-gray-700 text-gray-500' : 'bg-gradient-to-r from-red-600 to-purple-600 text-white hover:scale-105'} transition-all`}
                        >
                            {isLocked ? 'Locked' : 'Select'}
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderGameScreen = () => {
        const char = CHARACTERS[runState.characterId];

        return (
            <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden font-sans select-none">

                {/* Backdrop */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <img src="/sin/backdrop.jpg" className="w-full h-full object-cover" alt="Mine" />
                </div>

                {/* HUD */}
                <div className="relative z-10 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl border-2 border-[${char.color}] bg-gray-800`}>
                            {char.emoji}
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white mb-1">{char.name}</div>
                            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-red-500 transition-all duration-300"
                                    style={{ width: `${(runState.hp / runState.maxHp) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-xs text-red-300 mt-1">{Math.round(runState.hp)} / {runState.maxHp} HP</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="text-2xl font-mono text-yellow-400">Hour {runState.currentHour} / 12</div>
                        <div className="text-xs text-gray-400">Next Boss in: {Math.max(0, Math.floor((GAME_HOUR_REAL_MS - (Date.now() - runState.hourStartTime)) / 1000))}s</div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xl text-yellow-500 font-bold">{Math.floor(runState.gold)}g</div>
                            <div className="text-xs text-purple-400">Run Earnings</div>
                        </div>
                    </div>
                </div>

                {/* Main Play Area */}
                <div className="relative z-10 flex-1 h-[60vh] flex flex-col items-center justify-center">

                    {runState.screen === 'mine' && (
                        <div
                            className="group cursor-pointer transform active:scale-95 transition-all"
                            onClick={handleMineClick}
                        >
                            <div className="text-9xl animate-pulse group-hover:drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                                ⛏️
                            </div>
                            <div className="mt-8 text-center bg-black/50 p-4 rounded-xl backdrop-blur-sm">
                                <div className="text-sm text-gray-300 mb-1">Items in Inv: {runState.inventory.length}/{INVENTORY_SIZE}</div>
                                <div className="w-48 h-2 bg-gray-700 rounded-full mx-auto mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-purple-600 transition-all"
                                        style={{ width: `${runState.corruption}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-purple-300 mt-1 uppercase tracking-widest">Corruption Level</div>
                            </div>
                        </div>
                    )}

                    {(runState.screen === 'battle' || runState.screen === 'boss') && (
                        <div className="w-full max-w-2xl text-center">
                            <div className="mb-4">
                                <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${runState.screen === 'boss' ? 'bg-red-900 text-red-100 animate-pulse' : 'bg-gray-700 text-gray-300'}`}>
                                    {runState.screen === 'boss' ? '⚠️ Boss Encounter' : '⚔️ Enemy Encounter'}
                                </span>
                            </div>

                            <div className="flex justify-center items-center gap-12">
                                {/* Enemy Sprite */}
                                <div
                                    className="transform hover:scale-105 active:scale-95 transition-all cursor-crosshair"
                                    onClick={handleAttack}
                                >
                                    <div className="text-9xl filter drop-shadow-2xl">
                                        {runState.currentBoss?.emoji || runState.currentEnemy?.emoji}
                                    </div>
                                    <div className="mt-4">
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            {runState.currentBoss?.name || runState.currentEnemy?.name}
                                        </h2>
                                        <div className="w-64 h-4 bg-gray-700 rounded-full mx-auto overflow-hidden relative border border-gray-600">
                                            <div
                                                className="h-full bg-red-600 transition-all duration-200"
                                                style={{ width: `${((runState.currentBoss?.hp || runState.currentEnemy?.hp) / (runState.currentBoss?.maxHp || runState.currentEnemy?.maxHp)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-sm font-mono mt-1 text-gray-400">
                                            {runState.currentBoss?.hp || runState.currentEnemy?.hp} HP
                                        </div>

                                        {runState.screen === 'boss' && (
                                            <div className="text-sm text-yellow-300 mt-2 font-serif italic">
                                                "{runState.currentBoss.phases[runState.currentBoss.phaseIndex || 0]}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {runState.screen === 'event' && (
                        <div className="bg-gray-800 p-8 rounded-2xl max-w-lg shadow-2xl border border-gray-600 text-center animate-fade-in-up">
                            <div className="text-6xl mb-4">{runState.currentEvent.emoji}</div>
                            <h2 className="text-2xl font-bold mb-2">{runState.currentEvent.name}</h2>
                            <p className="text-gray-300 mb-6">{runState.currentEvent.desc}</p>
                            <div className="space-y-3">
                                {runState.currentEvent.choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleEventChoice(choice)}
                                        className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors flex justify-between items-center group"
                                    >
                                        <span className="font-semibold">{choice.text}</span>
                                        <span className="opacity-0 group-hover:opacity-100 text-gray-400">➔</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Floating Text Overlay */}
                {floatingTexts.map(activeText => (
                    <div
                        key={activeText.id}
                        className="pointer-events-none fixed text-2xl font-bold animate-float-up z-50 filter drop-shadow-md"
                        style={{
                            left: activeText.x,
                            top: activeText.y,
                            color: activeText.type === 'damage' ? '#ff4444' :
                                activeText.type === 'gold' ? '#ffd700' :
                                    activeText.type === 'damage-player' ? '#aa0000' : '#ffffff'
                        }}
                    >
                        {activeText.text}
                    </div>
                ))}
            </div>
        );
    };

    const renderMainMenu = () => (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center p-6 bg-[url('/sin/backdrop.jpg')] bg-cover bg-blend-overlay">
            <div className="mb-12 animate-fade-in">
                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-purple-800 filter drop-shadow-lg mb-4">
                    SIN MINER
                </h1>
                <p className="text-gray-300 text-lg uppercase tracking-widest">A Roguelike Clicker Adventure</p>
            </div>

            <div className="space-y-4 w-full max-w-md z-1">
                <button
                    onClick={() => setGameState('select')}
                    className="w-full py-4 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
                >
                    START NEW RUN
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/50 p-4 rounded-lg backdrop-blur">
                        <div className="text-sm text-gray-400">Total Bosses Defeated</div>
                        <div className="text-2xl font-bold text-white">{saveData.totalBossesDefeated}</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg backdrop-blur">
                        <div className="text-sm text-gray-400">Best Run</div>
                        <div className="text-2xl font-bold text-white">Hour {saveData.bestRunHour}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDeathScreen = () => (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 text-white">
            <div className="text-9xl mb-6">💀</div>
            <h2 className="text-5xl font-bold text-red-600 mb-4">YOU DIED</h2>
            <p className="text-gray-400 text-xl max-w-lg mb-8">
                Your sin consumed you. The mine claims another soul.
                But your greed leaves a legacy...
            </p>

            <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Gold Collected</span>
                    <span className="text-yellow-400 font-mono">{runState.gold}g</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Hour Reached</span>
                    <span className="text-blue-400 font-mono">{runState.currentHour}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Enemies Defeated</span>
                    <span className="text-red-400 font-mono">{runState.enemiesKilled}</span>
                </div>
            </div>

            <button
                onClick={() => setGameState('menu')}
                className="px-8 py-3 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors"
            >
                RETURN TO VOID
            </button>
        </div>
    );

    return (
        <div className="font-sans antialiased">
            {gameState === 'menu' && renderMainMenu()}
            {gameState === 'select' && (
                <div className="min-h-screen bg-gray-900 p-6">
                    <button onClick={() => setGameState('menu')} className="text-white mb-6">← Back</button>
                    <h2 className="text-3xl text-white font-bold text-center mb-8">Choose Your Sin</h2>
                    {renderCharacterSelect()}
                </div>
            )}
            {gameState === 'play' && renderGameScreen()}
            {gameState === 'dead' && renderDeathScreen()}
            {gameState === 'win' && renderDeathScreen()}

            {/* Toast Container */}
            {/* ... Toasts logic simplified ... */}
        </div>
    );
};

export default SinMinerGame;
