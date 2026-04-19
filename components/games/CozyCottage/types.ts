// CozyCottage/types.ts

export type FurnitureType =
  | 'bed' | 'table' | 'chair' | 'plant' | 'stove' | 'rug' | 'lamp'
  | 'window' | 'garden_patch' | 'cabinet' | 'sofa' | 'chest'
  | 'bookshelf' | 'cupboard' | 'pet_bed' | 'pet_bowl';

export interface FurnitureItem {
  id: string;
  type: FurnitureType;
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
}

export interface PlacedFurniture {
  id: string; // unique placed instance id
  furnitureId: string; // catalog id
  x: number;
  y: number;
  flipped: boolean;
  colorFilter?: string;
  location: 'inside' | 'outside';
}

export type PlantType =
  | 'carrot' | 'tomato' | 'herb' | 'potato' | 'radish'
  | 'corn' | 'pumpkin' | 'strawberry' | 'blueberry' | 'pea'
  | 'onion' | 'garlic' | 'pepper' | 'wheat' | 'lettuce'
  | 'eggplant' | 'spinach' | 'beet' | 'zucchini' | 'cucumber';

export interface GardenPlant {
  id: string;
  plotId: string;
  type: PlantType;
  growthStage: number; // 0=seeded 1=sprout 2=growing 3=ready
  plantedAt: number;
  lastWateredAt: number;
  isWatered: boolean;
  isDead: boolean;
}

export interface GardenPlot {
  id: string;
  x: number; // col 0-based
  y: number; // row 0-based
}

export type FishType =
  | 'minnow' | 'bass' | 'trout' | 'salmon' | 'koi' | 'golden_carp'
  | 'catfish' | 'perch' | 'pike' | 'eel' | 'crab' | 'shrimp'
  | 'clam' | 'lobster' | 'tuna' | 'cod' | 'anchovy' | 'mackerel';

export interface FishDef {
  type: FishType;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  sellPrice: number;
  icon: string;
}

export type ForageType =
  | 'mushroom' | 'berry' | 'truffle' | 'pine_nut' | 'honey'
  | 'nettle' | 'wild_ginger' | 'acorn' | 'chestnut' | 'rose_hip'
  | 'dandelion' | 'clover';

export type TreeFruitType = 'apple' | 'orange' | 'olive' | 'cherry' | 'pear' | 'lemon' | 'fig' | 'plum';

export type HuntType = 'venison' | 'duck' | 'rabbit_meat' | 'wild_boar' | 'pheasant';

export interface ForestTree {
  id: string;
  x: number;
  y: number;
  type: 'normal' | 'apple' | 'orange' | 'olive' | 'cherry' | 'pear' | 'lemon' | 'fig' | 'plum';
  isCut: boolean;
  regrowsAt: number | null;
  hasFruit: boolean;
}

export interface ForestBush {
  id: string;
  x: number;
  y: number;
  hasBerries: boolean;
}

export interface ForestMushroom {
  id: string;
  x: number;
  y: number;
  type: ForageType;
}

export interface Deer {
  id: string;
  x: number;
  y: number;
  facingLeft: boolean;
  isHunted: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Record<string, number>;
  sellPrice: number;
  emoji: string;
  description: string;
}

export interface SeedDef {
  id: string;
  type: PlantType;
  name: string;
  price: number;
  growthTime: number; // in game seconds
  produceEmoji: string;
  seedEmoji: string;
}

export type ToolType = 'fishingRod' | 'axe' | 'huntingBow' | 'wateringCan';

export interface GameState {
  // Economy
  currency: number;
  // Inventory
  seeds: Record<string, number>;
  ingredients: Record<string, number>;
  cookedFood: Record<string, number>;
  wood: number;
  // House / garden
  placedFurniture: PlacedFurniture[];
  houseGrid: { width: number; height: number };
  gardenPlots: GardenPlot[];
  gardenPlants: GardenPlant[];
  // Forest
  forestTrees: ForestTree[];
  forestBushes: ForestBush[];
  forestMushrooms: ForestMushroom[];
  harvestedTreeFruits: string[]; // tree ids harvested this day
  deer: Deer[];
  // Pond
  fishingActive: boolean;
  fishingProgress: number; // 0–100
  // Tools
  tools: Record<ToolType, boolean>;
  // Recipes
  discoveredRecipes: string[]; // recipe ids
  // Cooking
  stoveSlots: string[]; // ingredient keys in stove (max 4)
  // Day cycle
  timeOfDay: number; // 0–2400
  day: number;
  // Market
  marketSeeds: Record<string, number>;
  // Player
  playerSprite: 'man' | 'woman';
  // Pets
  pets: Array<{ id: string; type: string; name: string; x: number; y: number }>;
  petFood: number;
  // Messages / notifications
  lastMessage: string;
  // Furniture in hand (for placement)
  selectedFurnitureId: string | null;
  // Inventory for shop (furniture to place)
  furnitureInventory: Array<{ instanceId: string; furnitureId: string; colorFilter?: string }>;
  // Current area
  currentArea: 'home' | 'garden' | 'forest' | 'pond' | 'kitchen' | 'shop';
}
