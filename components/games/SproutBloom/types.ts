export type FurnitureType = 'bed' | 'table' | 'chair' | 'plant' | 'stove' | 'rug' | 'lamp' | 'window' | 'garden_patch' | 'pet_bed' | 'pet_bowl' | 'water_bowl' | 'cabinet' | 'sofa' | 'chest' | 'box' | 'cupboard' | 'bookshelf';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  name: string;
  description: string;
  price: number;
  icon: string;
  width: number;
  height: number;
  color: string;
  comfort: number;
}

/** One slot in the player's unplaced inventory */
export interface InventorySlot {
  id: string;           // FurnitureItem.id
  colorFilter?: string; // CSS filter string, e.g. 'hue-rotate(180deg) saturate(1.3)'
}

export interface PlacedFurniture {
  id: string;
  furnitureId: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  flipped?: boolean;
  location: 'inside' | 'outside';
  colorFilter?: string; // CSS filter applied when rendering
}

export interface GardenPlant {
  id: string;
  furnitureId: string; // The garden patch it's on
  type: 'carrot' | 'tomato' | 'herb' | 'special' | 'potato' | 'radish';
  growthStage: number; // 0 to 3
  plantedAt: number;
  lastWateredAt: number;
  isWatered: boolean;
  isDead: boolean;
}

export interface Fish {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  price: number;
  icon: string;
}

/** Original skills — kept for backward compat with existing XP tracking */
export type SkillType =
  'cooking' | 'fishing' | 'gardening' | 'bartering' | 'strength' | 'foraging'
  // New skills (XP starts at 0, gains wired progressively)
  | 'firecraft' | 'crafting' | 'building' | 'engineering' | 'navigation' | 'weatherResistance';

/** Passive core attributes — separate XP pool from skills */
export type AttributeType = 'agility' | 'endurance' | 'intelligence' | 'perception';

/** Current weather state */
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

export interface ForestMushroom {
  id: string;
  x: number;
  y: number;
}

export interface ForestBush {
  id: string;
  x: number;
  y: number;
  hasBerries: boolean;
}

export interface ForestTree {
  id: string;
  x: number;
  y: number;
  health: number; // 0 to 100
  isCut: boolean;
  regrowsAt: number | null;
  type?: 'normal' | 'olive' | 'orange' | 'apple';
}

export interface FishingSpot {
  id: string;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  shade: 'light' | 'medium' | 'dark';
  skillRequired: number; // minimum fishing level to use
}

export interface Pet {
  id: string;
  name: string;
  type: 'cat' | 'dog' | 'rabbit' | 'kintamani';
  x: number;
  y: number;
  hunger: number;
  thirst: number;
  health: number;
  lastMove: number;
}

export interface Deer {
  id: string;
  x: number;
  y: number;
  lastMove: number; // timestamp ms
  facingLeft: boolean;
}

export interface BowlState {
  furnitureId: string; // ID of the placed furniture
  type: 'food' | 'water';
  amount: number; // 0 to 100
}

export interface GameState {
  currency: number;
  inventory: InventorySlot[]; // Furniture owned but NOT placed
  inventorySize: number;
  placedFurniture: PlacedFurniture[];
  houseSize: { width: number; height: number };
  gardenSize: { width: number; height: number };
  playerPosition: { x: number; y: number };
  playerLocation: 'inside' | 'outside' | 'pond' | 'forest';
  workTimer: number | null; // Seconds remaining
  fishingTimer: number | null;
  timeOfDay: number; // 0 to 2400 (minutes in day)
  ingredients: Record<string, number>;
  cookedFood: Record<string, number>;
  gardenPlants: GardenPlant[];
  forestTrees: ForestTree[];
  unlockedRecipes: string[];
  dailyMarketItem: { id: string; price: number; type: 'seed' | 'ingredient' } | null;
  dailyShopItem: { id: string; price: number; type: 'furniture' } | null;
  marketSeeds: Record<string, number>; // type -> stock
  seeds: Record<string, number>; // type -> count
  caughtFish: string[]; // List of fish IDs caught
  lastMarketUpdate: number; // Day count
  lastWorkDay: number; // Day count
  pets: Pet[];
  petFood: number;
  bowlStates: BowlState[];
  xp: number;
  level: number;
  skills: Record<SkillType, number>;
  stamina: number;
  maxStamina: number;
  wood: number;
  isRelaxing: boolean;
  fishingRod: boolean;
  hasAxe: boolean;
  playerSprite: 'man' | 'woman';
  fishingSpots: FishingSpot[];
  activeFishingSpot: string | null; // id of spot being fished
  fishingDuration: number; // seconds until fish is caught (5–10)
  /** Maps placed-furniture id → { resourceKey: amount } for storage boxes */
  boxContents: Record<string, Record<string, number>>;
  rations: number;
  explorationTimer: number | null; // Seconds remaining
  explorationRations: number; // Rations committed to current exploration
  forestDeer: Deer[];
  huntingBow: boolean;
  huntingTimer: number | null; // Seconds remaining
  activeDeer: string | null; // ID of deer being hunted
  forestMushrooms: ForestMushroom[];
  forestBushes: ForestBush[];
  foragingTimer: number | null; // Seconds remaining
  foragingTarget: { id: string; kind: 'mushroom' | 'bush' | 'fruit' } | null;
  harvestedTreeFruits: string[]; // tree IDs harvested today

  // ── New systems ─────────────────────────────────────────────────────────────
  /** Passive core attributes XP (strength uses skills.strength) */
  attributes: Record<AttributeType, number>;
  /** Current weather */
  weather: WeatherType;
  /** Game-time ticks until next weather roll */
  weatherTimer: number;
  /** Player hunger 0-100 (drains over time, food restores it) */
  hunger: number;
  /** Player thirst 0-100 (drains faster than hunger) */
  thirst: number;
  /** Areas the player has visited at least once */
  exploredAreas: string[];
}
