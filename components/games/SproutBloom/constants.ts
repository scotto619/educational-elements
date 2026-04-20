import { FurnitureItem, Fish } from './types';

export const GRID_SIZE = 40;
export const HOUSE_INITIAL_WIDTH = 8;
export const HOUSE_INITIAL_HEIGHT = 8;
export const GARDEN_INITIAL_WIDTH = 6;
export const GARDEN_INITIAL_HEIGHT = 4;
export const FOREST_WIDTH = 25;
export const FOREST_HEIGHT = 15;
export const POND_WIDTH = 14;
export const POND_HEIGHT = 12;
export const HOUSE_EXPAND_COST = 1000; // Harder
export const HOUSE_EXPAND_WOOD_COST = 500; // Harder
export const GARDEN_EXPAND_COST = 500;
export const GARDEN_EXPAND_WOOD_COST = 20;
export const DAY_LENGTH = 2400; // 2400 units per day
export const PLANT_DEATH_TIME = 1200; // Units of time (half a day) without water

export const STAMINA_MAX = 100;
export const STAMINA_CHOP_COST = 10;
export const STAMINA_FISH_COST = 1;
export const STAMINA_GARDEN_COST = 1;
export const STAMINA_COOK_COST = 1;
export const STAMINA_WORK_COST = 5;
export const TREE_REGROW_TIME = 2400; // 1 day
export const FISHING_ROD_PRICE = 150;
export const AXE_PRICE = 200;
export const HUNTING_BOW_PRICE = 250;
export const STAMINA_HUNT_COST = 15;
export const DEER_HUNT_DURATION_MIN = 3; // seconds
export const DEER_HUNT_DURATION_MAX = 6; // seconds
export const DEER_MOVE_INTERVAL = 1200; // ms between deer steps (smooth glide)
export const DEER_APPEAR_CHANCE = 0.6; // 60% chance deer appear each day

// Foraging
export const FORAGE_STAMINA_COST = 5;
export const FORAGE_BASE_DURATION = 4; // seconds at level 0
export const FORAGE_MIN_DURATION = 1;  // seconds floor
export const MUSHROOM_COUNT_MIN = 3;
export const MUSHROOM_COUNT_MAX = 8;
export const BUSH_COUNT = 5;

// ── Hunger & Thirst ──────────────────────────────────────────────────────────
export const HUNGER_MAX = 100;
export const THIRST_MAX = 100;
/** Per-tick drain (1 tick = 1 real second). Full drain in 1 in-game day (2400s). */
export const HUNGER_DRAIN_RATE = 100 / 2400;  // ≈ 0.042 per second
export const THIRST_DRAIN_RATE = 100 / 1600;  // ≈ 0.063 per second (faster)

// ── Weather ──────────────────────────────────────────────────────────────────
/** Min/max ticks (seconds) between weather changes */
export const WEATHER_CHANGE_MIN = 240;   // ~10% of a day
export const WEATHER_CHANGE_MAX = 720;   // ~30% of a day
/** Probability weights for each weather type [sunny, cloudy, rainy, stormy] */
export const WEATHER_WEIGHTS = [0.50, 0.25, 0.18, 0.07];

// ── Skill XP per level thresholds ───────────────────────────────────────────
/** XP needed to reach each unlock tier (levels 2, 5, 10, 15, 20) */
export const SKILL_UNLOCK_LEVELS = [2, 5, 10, 15, 20];
/** XP required to reach a given skill level: level² × 50 */
export const skillXpForLevel = (level: number) => level * level * 50;

export const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'f1', type: 'bed', name: 'Cozy Bed', description: 'A soft bed for sleeping and restoring stamina.', price: 200, icon: '/games/cozy-cottage/House/bed.svg', width: 2, height: 2, color: '#ffb7b2', comfort: 10 },
  { id: 'f2', type: 'table', name: 'Wooden Table', description: 'A sturdy table for your home.', price: 100, icon: '/games/cozy-cottage/House/table.svg', width: 2, height: 2, color: '#e2b49a', comfort: 2 },
  { id: 'f3', type: 'chair', name: 'Soft Chair', description: 'A comfortable chair to relax in.', price: 50, icon: '/games/cozy-cottage/House/sofa.svg', width: 1, height: 1, color: '#b2e2f2', comfort: 5 },
  { id: 'f4', type: 'plant', name: 'Potted Fern', description: 'Brings a bit of nature indoors.', price: 30, icon: '/games/cozy-cottage/House/pot-plant.svg', width: 1, height: 1, color: '#b2f2bb', comfort: 3 },
  { id: 'f5', type: 'stove', name: 'Little Stove', description: 'Used for cooking delicious meals.', price: 150, icon: '/games/cozy-cottage/House/stove.svg', width: 1, height: 1, color: '#f2b2b2', comfort: 1 },
  { id: 'f6', type: 'rug', name: 'Fluffy Mat', description: 'A soft mat that makes the floor much cozier.', price: 80, icon: '/games/cozy-cottage/House/rug.svg', width: 3, height: 2, color: '#f2e2b2', comfort: 4 },
  { id: 'f7', type: 'lamp', name: 'Warm Lamp', description: 'Provides light during the night.', price: 40, icon: '/games/cozy-cottage/House/bedside-lamp.svg', width: 1, height: 1, color: '#fff9c4', comfort: 2 },
  { id: 'f8', type: 'window', name: 'Sunny Window', description: 'Lets in the beautiful sunlight.', price: 120, icon: 'Window', width: 2, height: 1, color: '#e3f2fd', comfort: 3 },
  { id: 'f9', type: 'garden_patch', name: 'Garden Patch', description: 'Place in the garden to plant seeds.', price: 60, icon: '/games/cozy-cottage/Farm/plot.svg', width: 1, height: 1, color: '#795548', comfort: 0 },
  { id: 'f10', type: 'pet_bed', name: 'Pet Bed', description: 'A cozy spot for your pet to sleep.', price: 150, icon: '/games/cozy-cottage/Pets/pet-bed.svg', width: 1, height: 1, color: '#ffccbc', comfort: 2 },
  { id: 'f11', type: 'pet_bowl', name: 'Pet Bowl', description: 'Fill with pet food to feed your pet.', price: 50, icon: '/games/cozy-cottage/Pets/pet-bowl-full.svg', width: 1, height: 1, color: '#cfd8dc', comfort: 0 },
  { id: 'f12', type: 'water_bowl', name: 'Water Bowl', description: 'Fill with water for your pet to drink.', price: 50, icon: '/games/cozy-cottage/Pets/pet-water.svg', width: 1, height: 1, color: '#bbdefb', comfort: 0 },
  { id: 'f14', type: 'sofa', name: 'Loveseat', description: 'A cozy two-seater sofa for relaxing.', price: 180, icon: '/games/cozy-cottage/House/sofa2.svg', width: 2, height: 1, color: '#ce93d8', comfort: 7 },
  { id: 'f15', type: 'box', name: 'Wooden Chest', description: 'A sturdy chest — click to store ingredients, seeds, and more.', price: 130, icon: '/games/cozy-cottage/House/chest.svg', width: 1, height: 1, color: '#a0522d', comfort: 0 },
  { id: 'f16', type: 'bookshelf', name: 'Bookshelf', description: 'A cozy shelf lined with well-loved books.', price: 80, icon: '/games/cozy-cottage/House/bookshelf.svg', width: 1, height: 1, color: '#bcaaa4', comfort: 2 },
  { id: 'f17', type: 'cupboard', name: 'Cupboard', description: 'A spacious cupboard for your home.', price: 150, icon: '/games/cozy-cottage/House/cupboard.svg', width: 1, height: 1, color: '#8d6e4a', comfort: 1 },
];

export const PET_CATALOG = [
  { id: 'p1', type: 'cat', name: 'Calico Cat', price: 1000, icon: '/games/cozy-cottage/Pets/cat.svg' },
  { id: 'p2', type: 'dog', name: 'Golden Pup', price: 1500, icon: '/games/cozy-cottage/Pets/corgi.svg' },
  { id: 'p3', type: 'rabbit', name: 'Lop Rabbit', price: 800, icon: '/games/cozy-cottage/Pets/pug.svg' },
  { id: 'p4', type: 'kintamani', name: 'Kintamani Dog', price: 1200, icon: '/games/cozy-cottage/Pets/kintamani.svg' },
];

export const SEEDS = [
  { id: 's1', name: 'Carrot Seeds', price: 10, type: 'carrot', growthTime: 30 },
  { id: 's2', name: 'Tomato Seeds', price: 15, type: 'tomato', growthTime: 45 },
  { id: 's3', name: 'Herb Seeds', price: 5, type: 'herb', growthTime: 20 },
  { id: 's4', name: 'Golden Seeds', price: 100, type: 'special', growthTime: 120 },
  { id: 's5', name: 'Potato Seeds', price: 12, type: 'potato', growthTime: 35 },
  { id: 's6', name: 'Radish Seeds', price: 8, type: 'radish', growthTime: 25 },
];

export const FISH_CATALOG: Fish[] = [
  { id: 'fi1', name: 'Minnow', rarity: 'common', price: 10, icon: '/games/cozy-cottage/Fishing/capelin.svg' },
  { id: 'fi2', name: 'Bass', rarity: 'common', price: 25, icon: '/games/cozy-cottage/Fishing/tilapia.svg' },
  { id: 'fi3', name: 'Trout', rarity: 'uncommon', price: 50, icon: '/games/cozy-cottage/Fishing/nasus-fish.svg' },
  { id: 'fi4', name: 'Salmon', rarity: 'uncommon', price: 75, icon: '/games/cozy-cottage/Fishing/red-snapper-fish.svg' },
  { id: 'fi5', name: 'Koi', rarity: 'rare', price: 200, icon: '/games/cozy-cottage/Fishing/tarpon.svg' },
  { id: 'fi6', name: 'Golden Carp', rarity: 'legendary', price: 1000, icon: '/games/cozy-cottage/Fishing/blue-marlin.svg' },
];

export const RECIPES = [
  { id: 'r1', name: 'Veggie Soup', ingredients: { carrot: 2, herb: 1 }, sellPrice: 120, minLevel: 1 },
  { id: 'r2', name: 'Tomato Pasta', ingredients: { tomato: 2, herb: 1 }, sellPrice: 150, minLevel: 1 },
  { id: 'r3', name: 'Grilled Fish', ingredients: { bass: 1, herb: 1 }, sellPrice: 200, minLevel: 2 },
  { id: 'r4', name: 'Salmon Salad', ingredients: { salmon: 1, tomato: 1, herb: 1 }, sellPrice: 350, minLevel: 3 },
  { id: 'r5', name: 'Royal Feast', ingredients: { koi: 1, carrot: 2, tomato: 2 }, sellPrice: 800, minLevel: 5 },
  { id: 'r6', name: 'Fruit Salad', ingredients: { apple: 2, orange: 1 }, sellPrice: 180, minLevel: 1 },
  { id: 'r7', name: 'Apple Crumble', ingredients: { apple: 3, herb: 1 }, sellPrice: 280, minLevel: 2 },
  { id: 'r8', name: 'Orange Glazed Fish', ingredients: { orange: 1, bass: 1 }, sellPrice: 320, minLevel: 3 },
  { id: 'r9', name: 'Olive Bread', ingredients: { olive: 2, herb: 2 }, sellPrice: 220, minLevel: 2 },
  { id: 'r10', name: 'Forest Harvest Bowl', ingredients: { apple: 1, orange: 1, olive: 1, herb: 1 }, sellPrice: 500, minLevel: 4 },
  { id: 'r11', name: 'Mushroom Soup', ingredients: { mushroom: 2, herb: 1 }, sellPrice: 160, minLevel: 1 },
  { id: 'r12', name: 'Berry Jam', ingredients: { berry: 3 }, sellPrice: 140, minLevel: 1 },
  { id: 'r13', name: 'Wild Forage Salad', ingredients: { mushroom: 1, berry: 1, herb: 1 }, sellPrice: 250, minLevel: 2 },
  { id: 'r14', name: 'Stuffed Mushrooms', ingredients: { mushroom: 3, tomato: 1 }, sellPrice: 320, minLevel: 3 },
];
