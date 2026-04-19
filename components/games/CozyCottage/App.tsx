// CozyCottage/App.tsx
// A cozy life-sim focused on decorating, farming, fishing, cooking & foraging.
// No survival stats (hunger/thirst/stamina) — just pure cozy fun!

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FURNITURE_CATALOG, SEEDS, FISH_CATALOG, RECIPES, INGREDIENT_SELL_PRICES,
  INGREDIENT_EMOJI, COLOR_PRESETS, PET_CATALOG, FORAGE_LOOT, HUNT_LOOT,
  FISH_RARITY_CHANCES, DAY_LENGTH, TREE_REGROW_TIME,
} from './constants';
import {
  GameState, FurnitureItem, PlacedFurniture, GardenPlant, GardenPlot,
  ForestTree, ForestBush, ForestMushroom, Deer,
} from './types';

// ── Firebase / student data props (optional) ──────────────────────────────────
interface AppProps {
  studentData?: Record<string, any>;
  updateStudentData?: (data: Record<string, any>) => Promise<void>;
  showToast?: (msg: string, type?: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

function weightedRandom<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function formatTime(t: number): string {
  const h = Math.floor(t / 100);
  const m = t % 100;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function pluralLabel(key: string): string {
  const map: Record<string, string> = {
    carrot: 'Carrot', tomato: 'Tomato', herb: 'Herb', potato: 'Potato',
    radish: 'Radish', corn: 'Corn', pumpkin: 'Pumpkin', strawberry: 'Strawberry',
    blueberry: 'Blueberry', pea: 'Pea', onion: 'Onion', garlic: 'Garlic',
    pepper: 'Pepper', wheat: 'Wheat', lettuce: 'Lettuce', eggplant: 'Eggplant',
    spinach: 'Spinach', beet: 'Beet', zucchini: 'Zucchini', cucumber: 'Cucumber',
    apple: 'Apple', orange: 'Orange', olive: 'Olive', cherry: 'Cherry',
    pear: 'Pear', lemon: 'Lemon', fig: 'Fig', plum: 'Plum',
    mushroom: 'Mushroom', berry: 'Berry', truffle: 'Truffle', pine_nut: 'Pine Nut',
    honey: 'Honey', nettle: 'Nettle', wild_ginger: 'Wild Ginger', acorn: 'Acorn',
    chestnut: 'Chestnut', rose_hip: 'Rose Hip', dandelion: 'Dandelion', clover: 'Clover',
    venison: 'Venison', duck: 'Duck', rabbit_meat: 'Rabbit Meat',
    wild_boar: 'Wild Boar', pheasant: 'Pheasant',
    minnow: 'Minnow', bass: 'Bass', trout: 'Trout', salmon: 'Salmon',
    koi: 'Koi', golden_carp: 'Golden Carp', catfish: 'Catfish', perch: 'Perch',
    pike: 'Pike', eel: 'Eel', crab: 'Crab', shrimp: 'Shrimp',
    clam: 'Clam', lobster: 'Lobster', tuna: 'Tuna', cod: 'Cod',
    anchovy: 'Anchovy', mackerel: 'Mackerel',
    wood: 'Wood',
  };
  return map[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Forest generators ─────────────────────────────────────────────────────────
function genTrees(): ForestTree[] {
  const TYPES: ForestTree['type'][] = ['normal', 'apple', 'orange', 'olive', 'cherry', 'pear', 'lemon', 'fig', 'plum'];
  const trees: ForestTree[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 20; i++) {
    let x: number, y: number;
    let tries = 0;
    do {
      x = 1 + Math.floor(Math.random() * 12);
      y = 1 + Math.floor(Math.random() * 8);
      tries++;
    } while (used.has(`${x},${y}`) && tries < 30);
    used.add(`${x},${y}`);
    const type = TYPES[Math.floor(Math.random() * TYPES.length)];
    trees.push({ id: uid(), x, y, type, isCut: false, regrowsAt: null, hasFruit: type !== 'normal' });
  }
  return trees;
}

function genBushes(): ForestBush[] {
  const positions = [
    { x: 3, y: 4 }, { x: 7, y: 2 }, { x: 10, y: 6 },
    { x: 5, y: 9 }, { x: 12, y: 7 }, { x: 2, y: 7 }, { x: 9, y: 3 },
  ];
  return positions.map((p, i) => ({ id: `bush-${i}`, ...p, hasBerries: true }));
}

function genMushrooms(): ForestMushroom[] {
  const mushrooms: ForestMushroom[] = [];
  const count = 4 + Math.floor(Math.random() * 5);
  const used = new Set<string>();
  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let tries = 0;
    do {
      x = 1 + Math.floor(Math.random() * 13);
      y = 1 + Math.floor(Math.random() * 9);
      tries++;
    } while (used.has(`${x},${y}`) && tries < 20);
    used.add(`${x},${y}`);
    mushrooms.push({ id: `mush-${i}`, x, y, type: 'mushroom' });
  }
  return mushrooms;
}

function genDeer(): Deer[] {
  if (Math.random() > 0.65) return [];
  const count = 1 + Math.floor(Math.random() * 3);
  const deer: Deer[] = [];
  for (let i = 0; i < count; i++) {
    deer.push({
      id: uid(),
      x: 2 + Math.floor(Math.random() * 10),
      y: 1 + Math.floor(Math.random() * 7),
      facingLeft: Math.random() > 0.5,
      isHunted: false,
    });
  }
  return deer;
}

// ── Garden plots ──────────────────────────────────────────────────────────────
function genGardenPlots(): GardenPlot[] {
  const plots: GardenPlot[] = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 4; x++) {
      plots.push({ id: `plot-${x}-${y}`, x, y });
    }
  }
  return plots;
}

// ── Initial state ─────────────────────────────────────────────────────────────
function createInitialState(sprite: 'man' | 'woman'): GameState {
  return {
    currency: 500,
    seeds: { herb: 3, carrot: 2 },
    ingredients: {},
    cookedFood: {},
    wood: 0,
    placedFurniture: [],
    houseGrid: { width: 6, height: 5 },
    gardenPlots: genGardenPlots(),
    gardenPlants: [],
    forestTrees: genTrees(),
    forestBushes: genBushes(),
    forestMushrooms: genMushrooms(),
    harvestedTreeFruits: [],
    deer: genDeer(),
    fishingActive: false,
    fishingProgress: 0,
    tools: { fishingRod: false, axe: false, huntingBow: false, wateringCan: true },
    discoveredRecipes: [],
    stoveSlots: [],
    timeOfDay: 700,
    day: 1,
    marketSeeds: SEEDS.reduce((a, s) => ({ ...a, [s.type]: 15 }), {}),
    playerSprite: sprite,
    pets: [],
    petFood: 0,
    lastMessage: 'Welcome to your cozy cottage! 🏡',
    selectedFurnitureId: null,
    furnitureInventory: [],
    currentArea: 'home',
  };
}

const SAVE_KEY = 'cozyCottageSaveV2';

// ── Component ─────────────────────────────────────────────────────────────────
export default function CozyCottageApp({ showToast }: AppProps) {
  const [screen, setScreen] = useState<'menu' | 'charSelect' | 'game'>('menu');
  const [hasSave] = useState(() => !!localStorage.getItem(SAVE_KEY));
  const [state, setState] = useState<GameState>(() => createInitialState('woman'));
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const msgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fishTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Message helper ─────────────────────────────────────────────────────────
  const notify = useCallback((msg: string) => {
    setMessage(msg);
    setShowMessage(true);
    if (msgTimerRef.current) clearTimeout(msgTimerRef.current);
    msgTimerRef.current = setTimeout(() => setShowMessage(false), 3000);
  }, []);

  // ── Save / load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 'game') {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }
  }, [state, screen]);

  const startNew = (sprite: 'man' | 'woman') => {
    localStorage.removeItem(SAVE_KEY);
    const s = createInitialState(sprite);
    setState(s);
    setScreen('game');
    notify('Welcome to your cozy cottage! 🏡');
  };

  const continueGame = () => {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as GameState;
      // Fill in any missing fields from new versions
      if (!saved.deer) saved.deer = genDeer();
      if (!saved.forestMushrooms) saved.forestMushrooms = genMushrooms();
      if (!saved.forestBushes) saved.forestBushes = genBushes();
      if (!saved.gardenPlots) saved.gardenPlots = genGardenPlots();
      if (!saved.stoveSlots) saved.stoveSlots = [];
      if (!saved.furnitureInventory) saved.furnitureInventory = [];
      if (!saved.tools) saved.tools = { fishingRod: false, axe: false, huntingBow: false, wateringCan: true };
      setState(saved);
      setScreen('game');
      notify('Welcome back! 🌿');
    } catch {
      startNew('woman');
    }
  };

  // ── Day / time tick ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game') return;
    gameTimerRef.current = setInterval(() => {
      setState(prev => {
        const newTime = prev.timeOfDay + 10;
        if (newTime >= 2400) {
          // New day!
          const newPlants = prev.gardenPlants.map(p => {
            const seed = SEEDS.find(s => s.type === p.type);
            if (!seed || p.isDead) return p;
            const elapsed = (Date.now() - p.plantedAt) / 1000;
            const growStages = [0, seed.growthTime / 3, seed.growthTime * 2 / 3, seed.growthTime];
            let stage = p.growthStage;
            if (!p.isWatered && p.growthStage > 0) return { ...p, isDead: true };
            if (elapsed >= growStages[3]) stage = 3;
            else if (elapsed >= growStages[2]) stage = Math.max(p.growthStage, 2);
            else if (elapsed >= growStages[1]) stage = Math.max(p.growthStage, 1);
            return { ...p, growthStage: stage, isWatered: false };
          });
          const newTrees = prev.forestTrees.map(t => {
            if (t.isCut && t.regrowsAt && Date.now() >= t.regrowsAt) {
              return { ...t, isCut: false, regrowsAt: null, hasFruit: t.type !== 'normal' };
            }
            return t;
          });
          return {
            ...prev,
            timeOfDay: 600,
            day: prev.day + 1,
            gardenPlants: newPlants,
            forestTrees: newTrees,
            forestBushes: prev.forestBushes.map(b => ({ ...b, hasBerries: true })),
            forestMushrooms: genMushrooms(),
            deer: genDeer(),
            harvestedTreeFruits: [],
          };
        }
        // Update plant growth during day
        const now = Date.now();
        const newPlants = prev.gardenPlants.map(p => {
          if (p.isDead || p.growthStage >= 3) return p;
          const seed = SEEDS.find(s => s.type === p.type);
          if (!seed) return p;
          const elapsed = (now - p.plantedAt) / 1000;
          let stage = p.growthStage;
          if (elapsed >= seed.growthTime) stage = 3;
          else if (elapsed >= seed.growthTime * 2 / 3) stage = Math.max(stage, 2);
          else if (elapsed >= seed.growthTime / 3) stage = Math.max(stage, 1);
          return stage !== p.growthStage ? { ...p, growthStage: stage } : p;
        });
        return { ...prev, timeOfDay: newTime, gardenPlants: newPlants };
      });
    }, (DAY_LENGTH * 1000) / 240); // Advance 10 units per tick; 240 ticks = full day

    return () => { if (gameTimerRef.current) clearInterval(gameTimerRef.current); };
  }, [screen]);

  // ── Fishing tick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'game') return;
    if (!state.fishingActive) return;
    fishTimerRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.fishingActive) return prev;
        const newProgress = prev.fishingProgress + 4 + Math.random() * 3;
        if (newProgress >= 100) {
          // Catch a fish!
          const rarity = Object.entries(FISH_RARITY_CHANCES).find(
            ([, chance]) => Math.random() < chance
          )?.[0] as 'common' | 'uncommon' | 'rare' | 'legendary' ?? 'common';
          const pool = FISH_CATALOG.filter(f => f.rarity === rarity);
          const caught = pool[Math.floor(Math.random() * pool.length)];
          notify(`You caught a ${caught.name}! ${caught.rarity === 'legendary' ? '✨🎉' : '🎣'}`);
          return {
            ...prev,
            fishingActive: false,
            fishingProgress: 0,
            ingredients: {
              ...prev.ingredients,
              [caught.type]: (prev.ingredients[caught.type] ?? 0) + 1,
            },
          };
        }
        return { ...prev, fishingProgress: newProgress };
      });
    }, 300);
    return () => { if (fishTimerRef.current) clearInterval(fishTimerRef.current); };
  }, [state.fishingActive, screen, notify]);

  // ── Helper: add currency ───────────────────────────────────────────────────
  const earn = (amount: number, msg: string) => {
    setState(prev => ({ ...prev, currency: prev.currency + amount }));
    notify(msg);
  };

  // ── Area navigation ────────────────────────────────────────────────────────
  const goTo = (area: GameState['currentArea']) => {
    setState(prev => ({ ...prev, currentArea: area }));
  };

  // ==========================================================================
  //  GARDEN
  // ==========================================================================
  const plantSeed = (plotId: string, seedType: string) => {
    setState(prev => {
      if ((prev.seeds[seedType] ?? 0) < 1) { notify('No seeds of that type!'); return prev; }
      if (prev.gardenPlants.find(p => p.plotId === plotId && !p.isDead && p.growthStage < 3)) {
        notify('That plot already has a plant!'); return prev;
      }
      return {
        ...prev,
        seeds: { ...prev.seeds, [seedType]: (prev.seeds[seedType] ?? 0) - 1 },
        gardenPlants: [...prev.gardenPlants.filter(p => p.plotId !== plotId), {
          id: uid(), plotId, type: seedType as any,
          growthStage: 0, plantedAt: Date.now(),
          lastWateredAt: Date.now(), isWatered: true, isDead: false,
        }],
      };
    });
    notify('Seed planted! 🌱 Water it to help it grow.');
  };

  const waterPlant = (plotId: string) => {
    setState(prev => {
      const plant = prev.gardenPlants.find(p => p.plotId === plotId);
      if (!plant || plant.isDead) { notify('Nothing to water here!'); return prev; }
      if (plant.isWatered) { notify('Already watered today!'); return prev; }
      notify('Watered! 💧 Keep it up!');
      return {
        ...prev,
        gardenPlants: prev.gardenPlants.map(p =>
          p.plotId === plotId ? { ...p, isWatered: true, lastWateredAt: Date.now() } : p
        ),
      };
    });
  };

  const harvestPlant = (plotId: string) => {
    setState(prev => {
      const plant = prev.gardenPlants.find(p => p.plotId === plotId);
      if (!plant || plant.growthStage < 3) { notify('Not ready to harvest yet!'); return prev; }
      const amount = 2 + Math.floor(Math.random() * 3);
      notify(`Harvested ${amount}× ${plant.type}! 🌿`);
      return {
        ...prev,
        gardenPlants: prev.gardenPlants.filter(p => p.plotId !== plotId),
        ingredients: {
          ...prev.ingredients,
          [plant.type]: (prev.ingredients[plant.type] ?? 0) + amount,
        },
      };
    });
  };

  const removePlant = (plotId: string) => {
    setState(prev => ({
      ...prev,
      gardenPlants: prev.gardenPlants.filter(p => p.plotId !== plotId),
    }));
  };

  // ==========================================================================
  //  FOREST
  // ==========================================================================
  const chopTree = (treeId: string) => {
    setState(prev => {
      if (!prev.tools.axe) { notify('You need an Axe to chop trees! Buy one in the Shop.'); return prev; }
      const tree = prev.forestTrees.find(t => t.id === treeId);
      if (!tree || tree.isCut) { notify('Already chopped!'); return prev; }
      const wood = 3 + Math.floor(Math.random() * 4);
      notify(`Chopped tree for ${wood} wood! 🪓`);
      return {
        ...prev,
        wood: prev.wood + wood,
        forestTrees: prev.forestTrees.map(t =>
          t.id === treeId ? { ...t, isCut: true, regrowsAt: Date.now() + TREE_REGROW_TIME * 1000, hasFruit: false } : t
        ),
      };
    });
  };

  const harvestFruit = (treeId: string) => {
    setState(prev => {
      const tree = prev.forestTrees.find(t => t.id === treeId);
      if (!tree || !tree.hasFruit || tree.isCut || prev.harvestedTreeFruits.includes(treeId)) {
        notify('No fruit to harvest here!'); return prev;
      }
      const fruitMap: Record<string, string> = {
        apple: 'apple', orange: 'orange', olive: 'olive', cherry: 'cherry',
        pear: 'pear', lemon: 'lemon', fig: 'fig', plum: 'plum',
      };
      const fruit = fruitMap[tree.type];
      if (!fruit) return prev;
      const amount = 2 + Math.floor(Math.random() * 3);
      notify(`Picked ${amount}× ${fruit}! 🍎`);
      return {
        ...prev,
        ingredients: { ...prev.ingredients, [fruit]: (prev.ingredients[fruit] ?? 0) + amount },
        harvestedTreeFruits: [...prev.harvestedTreeFruits, treeId],
      };
    });
  };

  const forageItem = (type: string, sourceId?: string) => {
    setState(prev => {
      const amount = 1 + Math.floor(Math.random() * 2);
      const emoji = INGREDIENT_EMOJI[type] ?? '🌿';
      notify(`Found ${amount}× ${pluralLabel(type)}! ${emoji}`);
      const newMushrooms = sourceId
        ? prev.forestMushrooms.filter(m => m.id !== sourceId)
        : prev.forestMushrooms;
      const newBushes = sourceId
        ? prev.forestBushes.map(b => b.id === sourceId ? { ...b, hasBerries: false } : b)
        : prev.forestBushes;
      return {
        ...prev,
        ingredients: { ...prev.ingredients, [type]: (prev.ingredients[type] ?? 0) + amount },
        forestMushrooms: newMushrooms,
        forestBushes: newBushes,
      };
    });
  };

  const huntDeer = (deerId: string) => {
    setState(prev => {
      if (!prev.tools.huntingBow) { notify('You need a Hunting Bow! Buy one in the Shop.'); return prev; }
      const loot = weightedRandom(HUNT_LOOT);
      const amount = 1 + Math.floor(Math.random() * 2);
      notify(`Hunted! Got ${amount}× ${pluralLabel(loot.type)}! ${loot.emoji}`);
      return {
        ...prev,
        ingredients: { ...prev.ingredients, [loot.type]: (prev.ingredients[loot.type] ?? 0) + amount },
        deer: prev.deer.map(d => d.id === deerId ? { ...d, isHunted: true } : d),
      };
    });
  };

  // ==========================================================================
  //  FISHING
  // ==========================================================================
  const castLine = () => {
    setState(prev => {
      if (!prev.tools.fishingRod) { notify('You need a Fishing Rod! Buy one in the Shop.'); return prev; }
      if (prev.fishingActive) return prev;
      notify('Line cast! Watch the progress bar...');
      return { ...prev, fishingActive: true, fishingProgress: 0 };
    });
  };

  const cancelFishing = () => {
    setState(prev => ({ ...prev, fishingActive: false, fishingProgress: 0 }));
  };

  // ==========================================================================
  //  COOKING / STOVE
  // ==========================================================================
  const addToStove = (ingredient: string) => {
    setState(prev => {
      if (prev.stoveSlots.length >= 4) { notify('Stove is full! (max 4 ingredients)'); return prev; }
      if ((prev.ingredients[ingredient] ?? 0) < 1) { notify('No more of that ingredient!'); return prev; }
      return {
        ...prev,
        stoveSlots: [...prev.stoveSlots, ingredient],
        ingredients: { ...prev.ingredients, [ingredient]: prev.ingredients[ingredient] - 1 },
      };
    });
  };

  const removeFromStove = (index: number) => {
    setState(prev => {
      const ingredient = prev.stoveSlots[index];
      const newSlots = [...prev.stoveSlots];
      newSlots.splice(index, 1);
      return {
        ...prev,
        stoveSlots: newSlots,
        ingredients: { ...prev.ingredients, [ingredient]: (prev.ingredients[ingredient] ?? 0) + 1 },
      };
    });
  };

  const cook = () => {
    setState(prev => {
      if (prev.stoveSlots.length === 0) { notify('Add ingredients to the stove first!'); return prev; }
      // Check if slots match a known recipe
      const slotCounts: Record<string, number> = {};
      prev.stoveSlots.forEach(s => { slotCounts[s] = (slotCounts[s] ?? 0) + 1; });
      const matchedRecipe = RECIPES.find(r => {
        const rk = Object.keys(r.ingredients);
        const sk = Object.keys(slotCounts);
        if (rk.length !== sk.length) return false;
        return rk.every(k => (r.ingredients[k] ?? 0) === (slotCounts[k] ?? 0));
      });
      if (matchedRecipe) {
        const isNew = !prev.discoveredRecipes.includes(matchedRecipe.id);
        const newDiscovered = isNew
          ? [...prev.discoveredRecipes, matchedRecipe.id]
          : prev.discoveredRecipes;
        notify(isNew
          ? `✨ New recipe discovered: ${matchedRecipe.name}! ${matchedRecipe.emoji}`
          : `Cooked ${matchedRecipe.name}! ${matchedRecipe.emoji}`
        );
        return {
          ...prev,
          stoveSlots: [],
          discoveredRecipes: newDiscovered,
          cookedFood: {
            ...prev.cookedFood,
            [matchedRecipe.id]: (prev.cookedFood[matchedRecipe.id] ?? 0) + 1,
          },
        };
      }
      // No recipe found — consume ingredients with small loot
      notify('Hmm, that combination didn\'t work... try different ingredients! 🤔');
      return { ...prev, stoveSlots: [] };
    });
  };

  const sellDish = (recipeId: string) => {
    setState(prev => {
      if ((prev.cookedFood[recipeId] ?? 0) < 1) return prev;
      const recipe = RECIPES.find(r => r.id === recipeId)!;
      notify(`Sold ${recipe.name} for ${recipe.sellPrice}🪙!`);
      return {
        ...prev,
        currency: prev.currency + recipe.sellPrice,
        cookedFood: { ...prev.cookedFood, [recipeId]: prev.cookedFood[recipeId] - 1 },
      };
    });
  };

  const sellIngredient = (key: string, qty: number = 1) => {
    setState(prev => {
      const have = prev.ingredients[key] ?? 0;
      if (have < qty) { notify('Not enough to sell!'); return prev; }
      const price = (INGREDIENT_SELL_PRICES[key] ?? 5) * qty;
      notify(`Sold ${qty}× ${pluralLabel(key)} for ${price}🪙!`);
      return {
        ...prev,
        currency: prev.currency + price,
        ingredients: { ...prev.ingredients, [key]: have - qty },
      };
    });
  };

  // ==========================================================================
  //  SHOP
  // ==========================================================================
  const buySeed = (seedType: string) => {
    const seed = SEEDS.find(s => s.type === seedType);
    if (!seed) return;
    setState(prev => {
      if (prev.currency < seed.price) { notify('Not enough coins! 🪙'); return prev; }
      notify(`Bought ${seed.name}! 🌱`);
      return {
        ...prev,
        currency: prev.currency - seed.price,
        seeds: { ...prev.seeds, [seedType]: (prev.seeds[seedType] ?? 0) + 3 },
      };
    });
  };

  const buyTool = (tool: keyof GameState['tools']) => {
    const prices: Record<string, number> = {
      fishingRod: 150, axe: 200, huntingBow: 250,
    };
    const names: Record<string, string> = {
      fishingRod: 'Fishing Rod', axe: 'Axe', huntingBow: 'Hunting Bow',
    };
    const emojis: Record<string, string> = {
      fishingRod: '🎣', axe: '🪓', huntingBow: '🏹',
    };
    const price = prices[tool];
    setState(prev => {
      if (prev.tools[tool]) { notify('You already have this!'); return prev; }
      if (prev.currency < price) { notify('Not enough coins! 🪙'); return prev; }
      notify(`Bought ${names[tool]}! ${emojis[tool]}`);
      return {
        ...prev,
        currency: prev.currency - price,
        tools: { ...prev.tools, [tool]: true },
      };
    });
  };

  const buyFurniture = (furnitureId: string, colorFilter?: string) => {
    const item = FURNITURE_CATALOG.find(f => f.id === furnitureId);
    if (!item) return;
    setState(prev => {
      if (prev.currency < item.price) { notify('Not enough coins! 🪙'); return prev; }
      notify(`Bought ${item.name}! Place it in your home. 🏠`);
      return {
        ...prev,
        currency: prev.currency - item.price,
        furnitureInventory: [...prev.furnitureInventory, {
          instanceId: uid(),
          furnitureId: item.id,
          colorFilter,
        }],
      };
    });
  };

  const buyPet = (petId: string) => {
    const pet = PET_CATALOG.find(p => p.id === petId);
    if (!pet) return;
    setState(prev => {
      if (prev.currency < pet.price) { notify('Not enough coins! 🪙'); return prev; }
      if (prev.pets.length >= 3) { notify('You already have 3 pets!'); return prev; }
      notify(`${pet.name} is your new companion! ${pet.emoji}`);
      return {
        ...prev,
        currency: prev.currency - pet.price,
        pets: [...prev.pets, {
          id: uid(),
          type: pet.type,
          name: pet.name,
          x: 2,
          y: 2,
        }],
      };
    });
  };

  // ==========================================================================
  //  DECORATION / FURNITURE PLACEMENT
  // ==========================================================================
  const placeFurniture = (instanceId: string, x: number, y: number, location: 'inside' | 'outside') => {
    setState(prev => {
      const inv = prev.furnitureInventory.find(f => f.instanceId === instanceId);
      if (!inv) return prev;
      const newPlaced: PlacedFurniture = {
        id: uid(),
        furnitureId: inv.furnitureId,
        x, y,
        flipped: false,
        colorFilter: inv.colorFilter,
        location,
      };
      return {
        ...prev,
        furnitureInventory: prev.furnitureInventory.filter(f => f.instanceId !== instanceId),
        placedFurniture: [...prev.placedFurniture, newPlaced],
        selectedFurnitureId: null,
      };
    });
    notify('Furniture placed! ✨');
  };

  const removeFurniture = (placedId: string) => {
    setState(prev => {
      const placed = prev.placedFurniture.find(p => p.id === placedId);
      if (!placed) return prev;
      return {
        ...prev,
        placedFurniture: prev.placedFurniture.filter(p => p.id !== placedId),
        furnitureInventory: [...prev.furnitureInventory, {
          instanceId: uid(),
          furnitureId: placed.furnitureId,
          colorFilter: placed.colorFilter,
        }],
      };
    });
    notify('Furniture returned to inventory!');
  };

  // ==========================================================================
  //  SELL WOOD
  // ==========================================================================
  const sellWood = (qty: number) => {
    setState(prev => {
      if (prev.wood < qty) { notify('Not enough wood!'); return prev; }
      const price = qty * 8;
      notify(`Sold ${qty} wood for ${price}🪙!`);
      return { ...prev, wood: prev.wood - qty, currency: prev.currency + price };
    });
  };

  // ==========================================================================
  //  RENDER HELPERS
  // ==========================================================================
  const isDaytime = state.timeOfDay >= 600 && state.timeOfDay < 2000;
  const timeIcon = isDaytime ? '☀️' : '🌙';

  const totalIngredientCount = Object.values(state.ingredients).reduce((a, b) => a + b, 0);
  const discoveredCount = state.discoveredRecipes.length;

  // ── SCREENS ────────────────────────────────────────────────────────────────

  if (screen === 'menu') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 48, maxWidth: 480, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: 80, marginBottom: 8 }}>🏡</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: '#4a3728', margin: '0 0 8px' }}>Cozy Cottage</h1>
          <p style={{ color: '#8d6e63', marginBottom: 32, fontSize: 15 }}>
            Decorate your home, grow a garden, fish, forage &amp; discover delicious recipes!
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {hasSave && (
              <button onClick={continueGame} style={btnStyle('#4caf50')}>
                🌿 Continue Game
              </button>
            )}
            <button onClick={() => setScreen('charSelect')} style={btnStyle('#7c4dff')}>
              ✨ New Game
            </button>
          </div>
          <p style={{ marginTop: 24, fontSize: 12, color: '#bbb' }}>
            {discoveredCount > 0 ? `${discoveredCount} recipes in your cookbook` : 'Collect ingredients · Experiment at the stove · Discover 70 recipes!'}
          </p>
        </div>
      </div>
    );
  }

  if (screen === 'charSelect') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8c471 0%, #f0956e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 24, padding: 40, maxWidth: 500, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>👤</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#4a3728', marginBottom: 8 }}>Choose Your Farmer</h2>
          <p style={{ color: '#8d6e63', marginBottom: 32, fontSize: 14 }}>Who will tend this cozy cottage?</p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(['woman', 'man'] as const).map(sprite => (
              <button key={sprite} onClick={() => startNew(sprite)} style={{
                background: 'white', border: '3px solid #e8d5c4', borderRadius: 20,
                padding: '20px 32px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <img
                  src={`/games/cozy-cottage/Player/${sprite}.svg`}
                  alt={sprite}
                  style={{ width: 80, height: 80, objectFit: 'contain', display: 'block', margin: '0 auto 12px' }}
                />
                <div style={{ fontSize: 15, fontWeight: 700, color: '#4a3728' }}>
                  {sprite === 'woman' ? '🌸 She/Her' : '🌿 He/Him'}
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setScreen('menu')} style={{ marginTop: 24, background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: 14 }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN GAME ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: isDaytime ? '#fef9f0' : '#1a1a2e', fontFamily: 'system-ui, sans-serif', transition: 'background 2s' }}>
      {/* HUD */}
      <div style={{
        background: isDaytime ? 'rgba(255,248,235,0.97)' : 'rgba(30,20,60,0.97)',
        borderBottom: `2px solid ${isDaytime ? '#f0d5a0' : '#3d2d6e'}`,
        padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: 'wrap', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{ fontSize: 22 }}>🏡</span>
        <span style={{ fontWeight: 800, fontSize: 16, color: isDaytime ? '#4a3728' : '#c9b8e8' }}>Cozy Cottage</span>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginLeft: 'auto', alignItems: 'center' }}>
          <Chip icon="🪙" label={state.currency.toLocaleString()} />
          <Chip icon="🌾" label={totalIngredientCount.toString()} title="Ingredients" />
          <Chip icon="🪵" label={state.wood.toString()} title="Wood" />
          <Chip icon="📖" label={`${discoveredCount}/70`} title="Recipes discovered" />
          <Chip icon={timeIcon} label={`Day ${state.day} · ${formatTime(state.timeOfDay)}`} />
          <button onClick={() => setScreen('menu')} style={{ fontSize: 11, background: '#f5f0e8', border: '1px solid #ddd', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: '#888' }}>
            Menu
          </button>
        </div>
      </div>

      {/* Message toast */}
      {showMessage && (
        <div style={{
          position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(50,30,10,0.88)', color: 'white', borderRadius: 12,
          padding: '10px 20px', zIndex: 200, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
          maxWidth: '90vw', textAlign: 'center',
        }}>
          {message}
        </div>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `2px solid ${isDaytime ? '#f0d5a0' : '#3d2d6e'}`, background: isDaytime ? '#fff9ef' : '#16103a', overflowX: 'auto' }}>
        {NAV_TABS.map(tab => (
          <button key={tab.id} onClick={() => goTo(tab.id as any)} style={{
            flex: '0 0 auto',
            padding: '10px 18px', border: 'none', cursor: 'pointer',
            fontWeight: state.currentArea === tab.id ? 800 : 500,
            fontSize: 13,
            background: state.currentArea === tab.id
              ? (isDaytime ? '#fff3e0' : '#2d1f5e')
              : 'transparent',
            color: state.currentArea === tab.id
              ? (isDaytime ? '#e65100' : '#c9b8e8')
              : (isDaytime ? '#888' : '#7a6aaa'),
            borderBottom: state.currentArea === tab.id ? `3px solid ${isDaytime ? '#ff9800' : '#9c6fff'}` : '3px solid transparent',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Area content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        {state.currentArea === 'home'    && <HomeArea    state={state} onPlace={placeFurniture} onRemove={removeFurniture} notify={notify} setState={setState} />}
        {state.currentArea === 'garden'  && <GardenArea  state={state} onPlant={plantSeed} onWater={waterPlant} onHarvest={harvestPlant} onRemove={removePlant} />}
        {state.currentArea === 'forest'  && <ForestArea  state={state} onChop={chopTree} onHarvestFruit={harvestFruit} onForage={forageItem} onHunt={huntDeer} />}
        {state.currentArea === 'pond'    && <PondArea    state={state} onCast={castLine} onCancel={cancelFishing} />}
        {state.currentArea === 'kitchen' && <KitchenArea state={state} onAdd={addToStove} onRemove={removeFromStove} onCook={cook} onSellDish={sellDish} onSellIngredient={sellIngredient} />}
        {state.currentArea === 'shop'    && <ShopArea    state={state} onBuySeed={buySeed} onBuyTool={buyTool} onBuyFurniture={buyFurniture} onBuyPet={buyPet} onSellWood={sellWood} />}
      </div>
    </div>
  );
}

// ── Shared style helpers ───────────────────────────────────────────────────────
const btnStyle = (bg: string): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 14,
  padding: '14px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s',
  boxShadow: `0 4px 16px ${bg}88`,
});

const NAV_TABS = [
  { id: 'home',    icon: '🏠', label: 'Home'    },
  { id: 'garden',  icon: '🌿', label: 'Garden'  },
  { id: 'forest',  icon: '🌲', label: 'Forest'  },
  { id: 'pond',    icon: '🎣', label: 'Pond'    },
  { id: 'kitchen', icon: '🍳', label: 'Kitchen' },
  { id: 'shop',    icon: '🛒', label: 'Shop'    },
];

function Chip({ icon, label, title }: { icon: string; label: string; title?: string }) {
  return (
    <div title={title} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 20, padding: '3px 10px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span>{icon}</span><span>{label}</span>
    </div>
  );
}

// =============================================================================
//  HOME AREA — Decoration & furniture placement
// =============================================================================
function HomeArea({ state, onPlace, onRemove, notify, setState }: {
  state: GameState;
  onPlace: (instanceId: string, x: number, y: number, location: 'inside' | 'outside') => void;
  onRemove: (id: string) => void;
  notify: (msg: string) => void;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}) {
  const [selectedInv, setSelectedInv] = useState<string | null>(null);
  const [placingLocation, setPlacingLocation] = useState<'inside' | 'outside'>('inside');
  const [colorFilter, setColorFilter] = useState<string | undefined>();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const COLS = 6;
  const ROWS = 5;

  const handleGridClick = (x: number, y: number) => {
    if (!selectedInv) return;
    const occupied = state.placedFurniture.some(p => p.x === x && p.y === y && p.location === placingLocation);
    if (occupied) { notify('That spot is taken!'); return; }
    onPlace(selectedInv, x, y, placingLocation);
    setSelectedInv(null);
  };

  const getFurnitureName = (furnitureId: string) =>
    FURNITURE_CATALOG.find(f => f.id === furnitureId)?.name ?? '?';
  const getFurnitureIcon = (furnitureId: string) =>
    FURNITURE_CATALOG.find(f => f.id === furnitureId)?.icon ?? '';

  const placedInside = state.placedFurniture.filter(p => p.location === 'inside');

  return (
    <div>
      <SectionHeader icon="🏠" title="Your Cottage" subtitle="Decorate your home with furniture!" />

      {/* Placed furniture display */}
      <div style={{ background: 'linear-gradient(135deg, #fff9ef, #fef3da)', borderRadius: 16, padding: 20, marginBottom: 20, border: '2px solid #f0d5a0' }}>
        <div style={{ fontWeight: 700, color: '#6d4c41', marginBottom: 12, fontSize: 15 }}>
          🛋️ Inside ({placedInside.length} items placed)
        </div>
        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gap: 4,
          background: '#e8cfa0',
          borderRadius: 12,
          padding: 8,
          maxWidth: 420,
        }}>
          {Array.from({ length: ROWS }).map((_, y) =>
            Array.from({ length: COLS }).map((_, x) => {
              const placed = placedInside.find(p => p.x === x && p.y === y);
              const isEmpty = !placed;
              const isSelecting = !!selectedInv && placingLocation === 'inside';
              return (
                <div key={`${x}-${y}`}
                  onClick={() => isEmpty ? handleGridClick(x, y) : undefined}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 8,
                    background: placed ? '#fff9ef' : (isSelecting ? '#c8f7c5' : '#d4b483'),
                    border: placed ? '2px solid #f0d5a0' : (isSelecting ? '2px dashed #4caf50' : '1px solid #c4a060'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isEmpty && isSelecting ? 'crosshair' : (placed ? 'pointer' : 'default'),
                    fontSize: 20, transition: 'background 0.2s',
                    position: 'relative',
                    minWidth: 40, minHeight: 40,
                  }}
                >
                  {placed && (
                    <div onClick={() => onRemove(placed.id)} title={`Remove ${getFurnitureName(placed.furnitureId)}`}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <img
                        src={getFurnitureIcon(placed.furnitureId)}
                        alt=""
                        style={{ width: 28, height: 28, objectFit: 'contain', filter: placed.colorFilter }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <p style={{ fontSize: 11, color: '#a08060', marginTop: 8 }}>
          {selectedInv ? '✅ Click a green cell to place · or cancel below' : 'Click a placed item to remove it'}
        </p>
      </div>

      {/* Pets */}
      {state.pets.length > 0 && (
        <div style={{ background: '#fff9ef', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #f0d5a0' }}>
          <div style={{ fontWeight: 700, color: '#6d4c41', marginBottom: 8 }}>🐾 Your Pets</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {state.pets.map(pet => {
              const petDef = PET_CATALOG.find(p => p.type === pet.type);
              return (
                <div key={pet.id} style={{ textAlign: 'center' }}>
                  {petDef && <img src={petDef.icon} alt={pet.name} style={{ width: 48, height: 48, objectFit: 'contain' }} />}
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6d4c41' }}>{pet.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Furniture Inventory */}
      <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 700, color: '#555', marginBottom: 12 }}>🎒 Furniture Inventory</div>
        {state.furnitureInventory.length === 0
          ? <p style={{ color: '#bbb', fontSize: 14 }}>No furniture yet — visit the Shop to buy some! 🛒</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {state.furnitureInventory.map(inv => {
                const def = FURNITURE_CATALOG.find(f => f.id === inv.furnitureId);
                if (!def) return null;
                const isSelected = selectedInv === inv.instanceId;
                return (
                  <button key={inv.instanceId}
                    onClick={() => {
                      setSelectedInv(isSelected ? null : inv.instanceId);
                      setPlacingLocation('inside');
                    }}
                    style={{
                      background: isSelected ? '#e8f5e9' : '#fafafa',
                      border: `2px solid ${isSelected ? '#4caf50' : '#ddd'}`,
                      borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    <img src={def.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain', filter: inv.colorFilter }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    {def.name}
                    {isSelected && <span style={{ color: '#4caf50' }}>✓ Selected</span>}
                  </button>
                );
              })}
            </div>
          )
        }
        {selectedInv && (
          <button onClick={() => setSelectedInv(null)} style={{ marginTop: 12, fontSize: 12, background: '#fee', border: '1px solid #fcc', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', color: '#c00' }}>
            ✕ Cancel placement
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
//  GARDEN AREA
// =============================================================================
function GardenArea({ state, onPlant, onWater, onHarvest, onRemove }: {
  state: GameState;
  onPlant: (plotId: string, seedType: string) => void;
  onWater: (plotId: string) => void;
  onHarvest: (plotId: string) => void;
  onRemove: (plotId: string) => void;
}) {
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const availableSeeds = SEEDS.filter(s => (state.seeds[s.type] ?? 0) > 0);

  const getPlant = (plotId: string) => state.gardenPlants.find(p => p.plotId === plotId && !p.isDead);
  const getDeadPlant = (plotId: string) => state.gardenPlants.find(p => p.plotId === plotId && p.isDead);

  const growthEmoji = (stage: number) => ['🌱', '🌿', '🌾', '✅'][stage] ?? '🌱';
  const seedDef = (type: string) => SEEDS.find(s => s.type === type);

  const handlePlotClick = (plotId: string) => {
    const plant = getPlant(plotId);
    const dead = getDeadPlant(plotId);
    if (dead) { onRemove(plotId); return; }
    if (!plant && selectedSeed) { onPlant(plotId, selectedSeed); return; }
    if (plant?.growthStage === 3) { onHarvest(plotId); return; }
    if (plant && !plant.isWatered) { onWater(plotId); return; }
  };

  return (
    <div>
      <SectionHeader icon="🌿" title="Garden" subtitle="Plant seeds, water crops, and harvest fresh ingredients!" />

      {/* Seed selector */}
      <div style={{ background: '#f9fbe7', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid #e6ee9c' }}>
        <div style={{ fontWeight: 700, color: '#558b2f', marginBottom: 10 }}>🌱 Select a seed to plant:</div>
        {availableSeeds.length === 0
          ? <p style={{ color: '#aaa', fontSize: 13 }}>No seeds in your inventory — buy some in the Shop!</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableSeeds.map(s => (
                <button key={s.type}
                  onClick={() => setSelectedSeed(selectedSeed === s.type ? null : s.type)}
                  style={{
                    background: selectedSeed === s.type ? '#c5e1a5' : 'white',
                    border: `2px solid ${selectedSeed === s.type ? '#7cb342' : '#ddd'}`,
                    borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6, fontWeight: selectedSeed === s.type ? 700 : 400,
                  }}
                >
                  {s.seedEmoji} {s.name} <span style={{ color: '#888', fontSize: 11 }}>({state.seeds[s.type] ?? 0})</span>
                </button>
              ))}
            </div>
          )
        }
      </div>

      {/* Plot grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, maxWidth: 560 }}>
        {state.gardenPlots.map(plot => {
          const plant = getPlant(plot.id);
          const dead = getDeadPlant(plot.id);
          const def = plant ? seedDef(plant.type) : null;
          const isReady = plant?.growthStage === 3;
          const needsWater = plant && !plant.isWatered && plant.growthStage < 3;

          return (
            <div key={plot.id}
              onClick={() => handlePlotClick(plot.id)}
              style={{
                background: dead ? '#ffebee'
                  : isReady ? '#e8f5e9'
                    : plant ? '#fff9c4'
                      : (selectedSeed ? '#f1f8e9' : '#efebe9'),
                border: `2px dashed ${dead ? '#ef9a9a' : isReady ? '#a5d6a7' : plant ? '#fff176' : '#bcaaa4'}`,
                borderRadius: 14, padding: 16, cursor: 'pointer', textAlign: 'center',
                transition: 'transform 0.15s, box-shadow 0.15s',
                minHeight: 90,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
            >
              {dead && <>
                <div style={{ fontSize: 28 }}>💀</div>
                <div style={{ fontSize: 11, color: '#e57373', fontWeight: 600 }}>Withered<br /><span style={{ color: '#aaa' }}>Click to remove</span></div>
              </>}
              {!dead && !plant && (
                <>
                  <img src="/games/cozy-cottage/Farm/plot.svg" alt="" style={{ width: 40, height: 40, objectFit: 'contain', opacity: 0.5 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <div style={{ fontSize: 11, color: '#a1887f' }}>{selectedSeed ? '🌱 Click to plant' : 'Empty plot'}</div>
                </>
              )}
              {plant && !dead && (
                <>
                  <div style={{ fontSize: 36 }}>{isReady ? (def?.produceEmoji ?? '🌿') : growthEmoji(plant.growthStage)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>
                    {def?.name ?? plant.type}
                  </div>
                  <div style={{ fontSize: 10, color: isReady ? '#4caf50' : needsWater ? '#ef5350' : '#888' }}>
                    {isReady ? '✅ Ready! Click to harvest'
                      : needsWater ? '💧 Needs water! Click'
                        : `Growing... (stage ${plant.growthStage}/3)`}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>
        💡 Click empty plots to plant · Click growing plants to water · Click ready plants to harvest
      </p>
    </div>
  );
}

// =============================================================================
//  FOREST AREA
// =============================================================================
function ForestArea({ state, onChop, onHarvestFruit, onForage, onHunt }: {
  state: GameState;
  onChop: (id: string) => void;
  onHarvestFruit: (id: string) => void;
  onForage: (type: string, sourceId?: string) => void;
  onHunt: (id: string) => void;
}) {
  const treeIcons: Record<string, string> = {
    normal: '/games/cozy-cottage/Forest/tree.svg',
    apple: '/games/cozy-cottage/Forest/apple-tree.svg',
    orange: '/games/cozy-cottage/Forest/orange-tree.svg',
    olive: '/games/cozy-cottage/Forest/olive-tree.svg',
    cherry: '/games/cozy-cottage/Forest/apple-tree.svg',
    pear: '/games/cozy-cottage/Forest/apple-tree.svg',
    lemon: '/games/cozy-cottage/Forest/orange-tree.svg',
    fig: '/games/cozy-cottage/Forest/apple-tree.svg',
    plum: '/games/cozy-cottage/Forest/apple-tree.svg',
  };

  const treeFruitEmoji: Record<string, string> = {
    apple: '🍎', orange: '🍊', olive: '🫒', cherry: '🍒', pear: '🍐', lemon: '🍋', fig: '🟤', plum: '🟣',
  };

  return (
    <div>
      <SectionHeader icon="🌲" title="Forest" subtitle="Chop wood, pick fruit, forage wild ingredients, and hunt!" />

      {/* Tool warnings */}
      {(!state.tools.axe || !state.tools.huntingBow) && (
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#f57c00' }}>
          {!state.tools.axe && <span>🪓 Buy an Axe in the Shop to chop trees! · </span>}
          {!state.tools.huntingBow && <span>🏹 Buy a Hunting Bow to hunt deer!</span>}
        </div>
      )}

      {/* Trees grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, color: '#4a3728', marginBottom: 10 }}>🌳 Trees</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 }}>
          {state.forestTrees.map(tree => {
            const isFruitTree = tree.type !== 'normal';
            const harvested = state.harvestedTreeFruits.includes(tree.id);
            const canHarvest = isFruitTree && tree.hasFruit && !tree.isCut && !harvested;
            const canChop = !tree.isCut;
            return (
              <div key={tree.id} style={{ textAlign: 'center' }}>
                {tree.isCut
                  ? (
                    <div style={{ background: '#f5f5f5', borderRadius: 10, padding: 10, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                      <div style={{ fontSize: 28 }}>🪵</div>
                      <div style={{ fontSize: 10, color: '#bbb' }}>Regrowing...</div>
                    </div>
                  )
                  : (
                    <div style={{ background: '#e8f5e9', borderRadius: 10, padding: 8, cursor: 'pointer', position: 'relative' }}
                      title={isFruitTree ? `${canHarvest ? 'Click to pick fruit · ' : ''}Chop for wood` : 'Chop for wood'}
                    >
                      <img
                        src={treeIcons[tree.type] ?? treeIcons.normal}
                        alt={tree.type}
                        style={{ width: 48, height: 48, objectFit: 'contain' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      {isFruitTree && canHarvest && (
                        <div style={{ fontSize: 16, position: 'absolute', top: 2, right: 2 }}>{treeFruitEmoji[tree.type] ?? '🍎'}</div>
                      )}
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
                        {canHarvest && (
                          <button onClick={() => onHarvestFruit(tree.id)} style={smallBtnStyle('#f9a825')}>
                            {treeFruitEmoji[tree.type] ?? '🍎'} Pick
                          </button>
                        )}
                        {harvested && isFruitTree && <div style={{ fontSize: 10, color: '#bbb' }}>Picked ✓</div>}
                        {canChop && (
                          <button onClick={() => onChop(tree.id)} style={smallBtnStyle('#795548')}>
                            🪓
                          </button>
                        )}
                      </div>
                    </div>
                  )
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* Bushes */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, color: '#4a3728', marginBottom: 10 }}>🫐 Berry Bushes</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {state.forestBushes.map(bush => (
            <div key={bush.id} style={{
              background: bush.hasBerries ? '#e8f5e9' : '#f5f5f5',
              border: `2px solid ${bush.hasBerries ? '#a5d6a7' : '#eee'}`,
              borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 70,
            }}>
              <img src="/games/cozy-cottage/Forest/bush.svg" alt="bush" style={{ width: 40, height: 40, objectFit: 'contain', filter: bush.hasBerries ? undefined : 'grayscale(1)' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              {bush.hasBerries
                ? <button onClick={() => { onForage('berry', bush.id); }} style={{ ...smallBtnStyle('#4caf50'), marginTop: 4 }}>🫐 Pick</button>
                : <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>Empty</div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Mushrooms */}
      {state.forestMushrooms.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: '#4a3728', marginBottom: 10 }}>🍄 Mushrooms & Forage</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {state.forestMushrooms.map(m => (
              <button key={m.id} onClick={() => onForage('mushroom', m.id)}
                style={{ background: '#fff9ef', border: '2px solid #f0d5a0', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 22 }}
                title="Click to forage"
              >
                🍄
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Forage extras */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, color: '#4a3728', marginBottom: 10 }}>🌿 Forage Wildcrafts</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { type: 'nettle', emoji: '🌿', label: 'Nettles' },
            { type: 'dandelion', emoji: '🌼', label: 'Dandelion' },
            { type: 'clover', emoji: '🍀', label: 'Clover' },
            { type: 'wild_ginger', emoji: '🫚', label: 'Wild Ginger' },
            { type: 'acorn', emoji: '🌰', label: 'Acorns' },
            { type: 'rose_hip', emoji: '🌹', label: 'Rose Hip' },
          ].map(item => (
            <button key={item.type} onClick={() => onForage(item.type)}
              style={{ background: '#f9fbe7', border: '1px solid #c5e1a5', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span> {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Deer hunting */}
      <div>
        <div style={{ fontWeight: 700, color: '#4a3728', marginBottom: 10 }}>🦌 Deer</div>
        {state.deer.length === 0
          ? <p style={{ color: '#bbb', fontSize: 13 }}>No deer today — check back tomorrow!</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {state.deer.map(d => (
                <div key={d.id} style={{ background: d.isHunted ? '#f5f5f5' : '#fff9ef', border: `2px solid ${d.isHunted ? '#eee' : '#f0d5a0'}`, borderRadius: 12, padding: 16, textAlign: 'center', minWidth: 90 }}>
                  <img
                    src="/games/cozy-cottage/Forest/deer.svg"
                    alt="deer"
                    style={{ width: 48, height: 48, objectFit: 'contain', filter: d.facingLeft ? 'scaleX(-1)' : undefined, opacity: d.isHunted ? 0.3 : 1 }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  {d.isHunted
                    ? <div style={{ fontSize: 10, color: '#bbb', marginTop: 6 }}>Hunted ✓</div>
                    : <button onClick={() => onHunt(d.id)} style={{ ...smallBtnStyle('#795548'), marginTop: 6 }}>🏹 Hunt</button>
                  }
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Wood count */}
      <div style={{ marginTop: 20, background: '#efebe9', borderRadius: 10, padding: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <img src="/games/cozy-cottage/Forest/wood.svg" alt="wood" style={{ width: 28, height: 28, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        <span style={{ fontWeight: 700, color: '#5d4037' }}>Wood: {state.wood}</span>
      </div>
    </div>
  );
}

// =============================================================================
//  POND AREA — Fishing
// =============================================================================
function PondArea({ state, onCast, onCancel }: {
  state: GameState;
  onCast: () => void;
  onCancel: () => void;
}) {
  const fish = FISH_CATALOG;
  return (
    <div>
      <SectionHeader icon="🎣" title="Pond" subtitle="Cast your line to catch fish for cooking!" />

      {!state.tools.fishingRod && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14, color: '#e65100' }}>
          🎣 You need a <strong>Fishing Rod</strong> to fish! Buy one in the Shop for 150🪙.
        </div>
      )}

      {/* Pond visual */}
      <div style={{ background: 'linear-gradient(135deg, #b3e5fc, #81d4fa)', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden', minHeight: 180 }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>🌊</div>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🐟 🐡 🦀</div>

        {state.fishingActive ? (
          <div>
            <div style={{ fontWeight: 700, color: '#01579b', marginBottom: 8 }}>Fishing... 🎣</div>
            <div style={{ background: 'rgba(255,255,255,0.5)', borderRadius: 20, height: 18, maxWidth: 240, margin: '0 auto 12px', overflow: 'hidden' }}>
              <div style={{ background: '#0288d1', height: '100%', width: `${state.fishingProgress}%`, transition: 'width 0.3s', borderRadius: 20 }} />
            </div>
            <button onClick={onCancel} style={{ background: '#ef5350', color: 'white', border: 'none', borderRadius: 10, padding: '8px 20px', cursor: 'pointer', fontWeight: 700 }}>
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={onCast} disabled={!state.tools.fishingRod}
            style={{ background: state.tools.fishingRod ? '#0288d1' : '#bbb', color: 'white', border: 'none', borderRadius: 14, padding: '12px 28px', cursor: state.tools.fishingRod ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 16 }}>
            🎣 Cast Line
          </button>
        )}
      </div>

      {/* Fish caught so far */}
      {Object.keys(state.ingredients).some(k => fish.find(f => f.type === k)) && (
        <div style={{ background: '#e3f2fd', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: '#0277bd', marginBottom: 8 }}>🐟 Fish in inventory:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fish.filter(f => (state.ingredients[f.type] ?? 0) > 0).map(f => (
              <div key={f.type} style={{ background: 'white', borderRadius: 8, padding: '6px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <img src={f.icon} alt={f.name} style={{ width: 24, height: 24, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                {f.name} × {state.ingredients[f.type]}
                <span style={{ fontSize: 10, color: '#888', background: f.rarity === 'legendary' ? '#fff9c4' : '#f5f5f5', borderRadius: 6, padding: '1px 5px' }}>
                  {f.rarity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fish guide */}
      <div style={{ background: '#fafafa', borderRadius: 12, padding: 16, border: '1px solid #eee' }}>
        <div style={{ fontWeight: 700, color: '#555', marginBottom: 10 }}>🗺️ Fish Guide</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {fish.map(f => (
            <div key={f.type} style={{ background: 'white', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #eee' }}>
              <img src={f.icon} alt={f.name} style={{ width: 24, height: 24, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{f.name}</div>
                <div style={{ fontSize: 10, color: f.rarity === 'legendary' ? '#ff8f00' : f.rarity === 'rare' ? '#7b1fa2' : f.rarity === 'uncommon' ? '#1565c0' : '#757575' }}>
                  {f.rarity} · {f.sellPrice}🪙
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
//  KITCHEN AREA — Stove, recipe discovery, sell food
// =============================================================================
function KitchenArea({ state, onAdd, onRemove, onCook, onSellDish, onSellIngredient }: {
  state: GameState;
  onAdd: (ingredient: string) => void;
  onRemove: (index: number) => void;
  onCook: () => void;
  onSellDish: (recipeId: string) => void;
  onSellIngredient: (key: string, qty: number) => void;
}) {
  const [tab, setTab] = useState<'stove' | 'recipes' | 'pantry'>('stove');

  const allIngredients = Object.entries(state.ingredients).filter(([, v]) => v > 0);

  const discoveredRecipes = RECIPES.filter(r => state.discoveredRecipes.includes(r.id));
  const totalRecipes = RECIPES.length;

  return (
    <div>
      <SectionHeader icon="🍳" title="Kitchen" subtitle="Experiment at the stove to discover new recipes!" />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '2px solid #eee' }}>
        {[
          { id: 'stove', label: '🔥 Stove', bg: '#fff3e0' },
          { id: 'recipes', label: `📖 Recipes (${discoveredRecipes.length}/${totalRecipes})`, bg: '#e8f5e9' },
          { id: 'pantry', label: '🧺 Sell Pantry', bg: '#f3e5f5' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? t.bg : 'white',
            borderBottom: tab === t.id ? '3px solid #ff9800' : '3px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── STOVE ── */}
      {tab === 'stove' && (
        <div>
          {/* Stove visual */}
          <div style={{ background: 'linear-gradient(135deg, #fff9ef, #fef3da)', borderRadius: 20, padding: 24, marginBottom: 20, border: '2px solid #f0d5a0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <img src="/games/cozy-cottage/House/stove.svg" alt="stove" style={{ width: 60, height: 60, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#4a3728' }}>🔥 The Stove</div>
                <div style={{ fontSize: 13, color: '#8d6e63' }}>Add up to 4 ingredients and cook to discover a recipe!</div>
              </div>
            </div>

            {/* Slots */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => {
                const ing = state.stoveSlots[i];
                return (
                  <div key={i} onClick={() => ing && onRemove(i)} style={{
                    width: 72, height: 72, background: ing ? '#fff9ef' : '#f5f5f5',
                    border: `2px dashed ${ing ? '#ff9800' : '#ddd'}`,
                    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: ing ? 'pointer' : 'default', fontSize: 30,
                    flexShrink: 0,
                  }} title={ing ? `Click to remove ${pluralLabel(ing)}` : 'Empty slot'}>
                    {ing ? (INGREDIENT_EMOJI[ing] ?? '🍽️') : (
                      <span style={{ fontSize: 24, color: '#ccc' }}>+</span>
                    )}
                  </div>
                );
              })}
              <button onClick={onCook} style={{
                background: state.stoveSlots.length > 0 ? '#ff7043' : '#ddd',
                color: 'white', border: 'none', borderRadius: 14,
                padding: '12px 20px', cursor: state.stoveSlots.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: 15, alignSelf: 'center',
              }}>
                🍳 Cook!
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#bbb' }}>Click a slot to remove the ingredient · Click Cook to try the combination</p>
          </div>

          {/* Ingredients available */}
          <div style={{ fontWeight: 700, color: '#555', marginBottom: 10 }}>🧺 Your Ingredients — click to add to stove:</div>
          {allIngredients.length === 0
            ? <p style={{ color: '#bbb', fontSize: 14 }}>No ingredients yet! Farm, fish, and forage to collect some.</p>
            : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allIngredients.map(([key, qty]) => (
                  <button key={key} onClick={() => onAdd(key)} style={{
                    background: '#fafafa', border: '2px solid #eee', borderRadius: 10,
                    padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#ff9800')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#eee')}
                  >
                    <span style={{ fontSize: 20 }}>{INGREDIENT_EMOJI[key] ?? '🍽️'}</span>
                    <span>{pluralLabel(key)}</span>
                    <span style={{ color: '#888', fontSize: 11 }}>×{qty}</span>
                  </button>
                ))}
              </div>
            )
          }

          {/* Recipe hint */}
          <div style={{ marginTop: 20, background: '#e8f5e9', borderRadius: 10, padding: 12, fontSize: 13, color: '#388e3c' }}>
            💡 <strong>How to discover recipes:</strong> Put ingredients in the stove and cook! Match the right combination to unlock a new dish. There are <strong>70 recipes</strong> to find!
          </div>
        </div>
      )}

      {/* ── RECIPES ── */}
      {tab === 'recipes' && (
        <div>
          {discoveredRecipes.length === 0
            ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>
                <div style={{ fontSize: 60, marginBottom: 12 }}>📖</div>
                <div style={{ fontSize: 16 }}>No recipes discovered yet!</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Head to the Stove tab and experiment with ingredients.</div>
              </div>
            )
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {discoveredRecipes.map(recipe => {
                  const has = (state.cookedFood[recipe.id] ?? 0) > 0;
                  return (
                    <div key={recipe.id} style={{ background: 'white', border: '2px solid #e8f5e9', borderRadius: 14, padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 32 }}>{recipe.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: '#4a3728', fontSize: 14 }}>{recipe.name}</div>
                          <div style={{ fontSize: 11, color: '#8d6e63' }}>{recipe.description}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
                        Ingredients: {Object.entries(recipe.ingredients).map(([k, v]) => `${v}×${pluralLabel(k)}`).join(', ')}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#ff9800', fontWeight: 600 }}>Sells for {recipe.sellPrice}🪙</span>
                        {has
                          ? <button onClick={() => onSellDish(recipe.id)} style={smallBtnStyle('#4caf50')}>
                              Sell × {state.cookedFood[recipe.id]} ({recipe.sellPrice * (state.cookedFood[recipe.id] ?? 0)}🪙)
                            </button>
                          : <span style={{ fontSize: 11, color: '#bbb' }}>Cook at the stove to make this!</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }

          <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 10, fontSize: 12, color: '#888' }}>
            Discovered: {discoveredRecipes.length} / {totalRecipes} recipes
          </div>
        </div>
      )}

      {/* ── PANTRY / SELL ── */}
      {tab === 'pantry' && (
        <div>
          <div style={{ fontWeight: 700, color: '#555', marginBottom: 12 }}>Sell ingredients for quick coins:</div>
          {allIngredients.length === 0
            ? <p style={{ color: '#bbb', fontSize: 14 }}>Nothing to sell yet!</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {allIngredients.map(([key, qty]) => {
                  const price = INGREDIENT_SELL_PRICES[key] ?? 5;
                  return (
                    <div key={key} style={{ background: 'white', border: '1px solid #eee', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 24 }}>{INGREDIENT_EMOJI[key] ?? '🍽️'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{pluralLabel(key)} ×{qty}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{price}🪙 each</div>
                      </div>
                      <button onClick={() => onSellIngredient(key, 1)} style={smallBtnStyle('#ff9800')}>Sell 1</button>
                    </div>
                  );
                })}
              </div>
            )
          }

          {/* Sell cooked food */}
          {Object.keys(state.cookedFood).some(k => (state.cookedFood[k] ?? 0) > 0) && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 700, color: '#555', marginBottom: 10 }}>🍽️ Sell Cooked Dishes:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {RECIPES.filter(r => (state.cookedFood[r.id] ?? 0) > 0).map(recipe => (
                  <button key={recipe.id} onClick={() => onSellDish(recipe.id)} style={{
                    background: '#fff9ef', border: '2px solid #f0d5a0', borderRadius: 10,
                    padding: '8px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    {recipe.emoji} {recipe.name} ×{state.cookedFood[recipe.id]} — {recipe.sellPrice}🪙
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
//  SHOP AREA
// =============================================================================
function ShopArea({ state, onBuySeed, onBuyTool, onBuyFurniture, onBuyPet, onSellWood }: {
  state: GameState;
  onBuySeed: (type: string) => void;
  onBuyTool: (tool: keyof GameState['tools']) => void;
  onBuyFurniture: (id: string, colorFilter?: string) => void;
  onBuyPet: (id: string) => void;
  onSellWood: (qty: number) => void;
}) {
  const [tab, setTab] = useState<'seeds' | 'tools' | 'furniture' | 'pets'>('seeds');
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  return (
    <div>
      <SectionHeader icon="🛒" title="Shop" subtitle={`Balance: ${state.currency.toLocaleString()}🪙`} />

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 12, overflow: 'hidden', border: '2px solid #eee' }}>
        {[
          { id: 'seeds', label: '🌱 Seeds' },
          { id: 'tools', label: '🛠️ Tools' },
          { id: 'furniture', label: '🛋️ Furniture' },
          { id: 'pets', label: '🐾 Pets' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
            flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? '#fff9ef' : 'white',
            borderBottom: tab === t.id ? '3px solid #ff9800' : '3px solid transparent',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sell wood banner */}
      {state.wood > 0 && (
        <div style={{ background: '#efebe9', borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/games/cozy-cottage/Forest/wood.svg" alt="wood" style={{ width: 32, height: 32, objectFit: 'contain' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <span style={{ fontWeight: 600, color: '#5d4037' }}>Wood: {state.wood} — sell at 8🪙 each</span>
          <button onClick={() => onSellWood(1)} style={smallBtnStyle('#795548')}>Sell 1</button>
          <button onClick={() => onSellWood(Math.min(10, state.wood))} style={smallBtnStyle('#5d4037')}>Sell 10</button>
          <button onClick={() => onSellWood(state.wood)} style={smallBtnStyle('#4e342e')}>Sell All</button>
        </div>
      )}

      {/* ── SEEDS ── */}
      {tab === 'seeds' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {SEEDS.map(seed => {
            const inInventory = state.seeds[seed.type] ?? 0;
            const canAfford = state.currency >= seed.price;
            return (
              <div key={seed.type} style={{ background: 'white', border: '2px solid #e8f5e9', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 32 }}>{seed.seedEmoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{seed.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>Grows: {seed.produceEmoji} · In bag: {inInventory}</div>
                  </div>
                </div>
                <button onClick={() => onBuySeed(seed.type)} disabled={!canAfford}
                  style={{ ...smallBtnStyle(canAfford ? '#4caf50' : '#bbb'), width: '100%', opacity: canAfford ? 1 : 0.6 }}>
                  Buy ×3 — {seed.price}🪙
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TOOLS ── */}
      {tab === 'tools' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { key: 'fishingRod' as const, name: 'Fishing Rod', emoji: '🎣', price: 150, desc: 'Catch fish at the Pond!' },
            { key: 'axe' as const,        name: 'Axe',          emoji: '🪓', price: 200, desc: 'Chop trees in the Forest.' },
            { key: 'huntingBow' as const, name: 'Hunting Bow',  emoji: '🏹', price: 250, desc: 'Hunt deer for wild meat.' },
          ].map(tool => {
            const owned = state.tools[tool.key];
            const canAfford = state.currency >= tool.price;
            return (
              <div key={tool.key} style={{ background: owned ? '#e8f5e9' : 'white', border: `2px solid ${owned ? '#a5d6a7' : '#eee'}`, borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>{tool.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{tool.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>{tool.desc}</div>
                {owned
                  ? <div style={{ color: '#4caf50', fontWeight: 700 }}>✓ Owned</div>
                  : <button onClick={() => onBuyTool(tool.key)} disabled={!canAfford}
                      style={{ ...smallBtnStyle(canAfford ? '#0288d1' : '#bbb'), opacity: canAfford ? 1 : 0.6 }}>
                      Buy — {tool.price}🪙
                    </button>
                }
              </div>
            );
          })}
          {/* Watering can always owned */}
          <div style={{ background: '#e3f2fd', border: '2px solid #90caf9', borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🪣</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Watering Can</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>Water your garden crops.</div>
            <div style={{ color: '#4caf50', fontWeight: 700 }}>✓ Already owned</div>
          </div>
        </div>
      )}

      {/* ── FURNITURE ── */}
      {tab === 'furniture' && (
        <div>
          {/* Color picker */}
          <div style={{ background: '#fafafa', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#555', marginBottom: 8 }}>Pick a colour theme:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map(cp => (
                <button key={cp.name} onClick={() => setSelectedColor(cp.filter)}
                  title={cp.name}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: cp.swatch,
                    border: selectedColor === cp.filter ? '3px solid #333' : '3px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {FURNITURE_CATALOG.map(item => {
              const canAfford = state.currency >= item.price;
              return (
                <div key={item.id} style={{ background: 'white', border: '2px solid #f5ebe0', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <img
                      src={item.icon}
                      alt={item.name}
                      style={{ width: 44, height: 44, objectFit: 'contain', filter: selectedColor }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{item.description}</div>
                    </div>
                  </div>
                  <button onClick={() => onBuyFurniture(item.id, selectedColor)} disabled={!canAfford}
                    style={{ ...smallBtnStyle(canAfford ? '#7c4dff' : '#bbb'), width: '100%', opacity: canAfford ? 1 : 0.6 }}>
                    Buy — {item.price}🪙
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PETS ── */}
      {tab === 'pets' && (
        <div>
          {state.pets.length >= 3 && (
            <div style={{ background: '#fff3e0', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: '#e65100' }}>
              You have 3 pets already! That&apos;s the maximum.
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {PET_CATALOG.map(pet => {
              const owned = state.pets.some(p => p.type === pet.type);
              const canAfford = state.currency >= pet.price;
              return (
                <div key={pet.id} style={{ background: owned ? '#f3e5f5' : 'white', border: `2px solid ${owned ? '#ce93d8' : '#f5ebe0'}`, borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <img src={pet.icon} alt={pet.name} style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 8px' }} onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{pet.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>{pet.emoji}</div>
                  {owned
                    ? <div style={{ color: '#ab47bc', fontWeight: 700 }}>✓ Already yours</div>
                    : <button onClick={() => onBuyPet(pet.id)} disabled={!canAfford || state.pets.length >= 3}
                        style={{ ...smallBtnStyle(canAfford ? '#ab47bc' : '#bbb'), opacity: canAfford ? 1 : 0.6 }}>
                        Adopt — {pet.price}🪙
                      </button>
                  }
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared UI components ───────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#4a3728', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span> {title}
      </h2>
      <p style={{ color: '#8d6e63', margin: '4px 0 0', fontSize: 13 }}>{subtitle}</p>
    </div>
  );
}

const smallBtnStyle = (bg: string): React.CSSProperties => ({
  background: bg, color: 'white', border: 'none', borderRadius: 8,
  padding: '5px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer',
  whiteSpace: 'nowrap',
});
