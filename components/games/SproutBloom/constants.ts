import { CropType, CropData, SprinklerType, FoodItem } from './types';

export const CROPS: Record<CropType, CropData> = {
  [CropType.WHEAT]: {
    type: CropType.WHEAT,
    name: 'Wheat',
    growthStages: 3,
    growthTimePerStage: 5,
    buyPrice: 2,
    sellPrice: 5,
    icon: 'Wheat',
    color: '#F5DEB3',
    minLevel: 1,
    xpGain: 10,
  },
  [CropType.CARROT]: {
    type: CropType.CARROT,
    name: 'Carrot',
    growthStages: 3,
    growthTimePerStage: 8,
    buyPrice: 5,
    sellPrice: 12,
    icon: 'Carrot',
    color: '#FF8C00',
    minLevel: 2,
    xpGain: 25,
  },
  [CropType.TOMATO]: {
    type: CropType.TOMATO,
    name: 'Tomato',
    growthStages: 4,
    growthTimePerStage: 12,
    buyPrice: 10,
    sellPrice: 25,
    icon: 'Leaf',
    color: '#FF6347',
    minLevel: 3,
    xpGain: 50,
  },
  [CropType.STRAWBERRY]: {
    type: CropType.STRAWBERRY,
    name: 'Strawberry',
    growthStages: 4,
    growthTimePerStage: 15,
    buyPrice: 15,
    sellPrice: 40,
    icon: 'Heart',
    color: '#FF2E63',
    minLevel: 4,
    xpGain: 80,
  },
  [CropType.PUMPKIN]: {
    type: CropType.PUMPKIN,
    name: 'Pumpkin',
    growthStages: 4,
    growthTimePerStage: 20,
    buyPrice: 20,
    sellPrice: 55,
    icon: 'Citrus',
    color: '#FF4500',
    minLevel: 5,
    xpGain: 120,
  },
  [CropType.BLUEBERRY]: {
    type: CropType.BLUEBERRY,
    name: 'Blueberry',
    growthStages: 5,
    growthTimePerStage: 25,
    buyPrice: 30,
    sellPrice: 85,
    icon: 'Circle',
    color: '#4D80E4',
    minLevel: 6,
    xpGain: 200,
  },
  [CropType.SUNFLOWER]: {
    type: CropType.SUNFLOWER,
    name: 'Sunflower',
    growthStages: 5,
    growthTimePerStage: 30,
    buyPrice: 40,
    sellPrice: 120,
    icon: 'Flower2',
    color: '#FFD700',
    minLevel: 8,
    xpGain: 300,
  },
};

export const INITIAL_MONEY = 50;
export const INITIAL_ENERGY = 100;
export const PLOT_COUNT = 9;

export const WATERING_CAN_UPGRADES = [
  { level: 1, cost: 0, range: 1, name: 'Basic Can' },
  { level: 2, cost: 150, range: 3, name: 'Copper Can' },
  { level: 3, cost: 500, range: 9, name: 'Golden Can' },
];

export const ENERGY_COSTS = {
  PLANT: 3,
  WATER: 5,
  HARVEST: 2,
  FERTILIZE: 4,
};

export const FERTILIZER_COST = 15;
export const FERTILIZER_GROWTH_BOOST = 0.5; // 50% faster

export const SPRINKLERS = {
  [SprinklerType.BASIC]: {
    name: 'Basic Sprinkler',
    cost: 50,
    range: 'cross', // N, S, E, W
    color: '#90A4AE',
  },
  [SprinklerType.QUALITY]: {
    name: 'Quality Sprinkler',
    cost: 150,
    range: 'square', // 3x3
    color: '#FFD54F',
  },
};

export const RECIPES: FoodItem[] = [
  {
    id: 'bread',
    name: 'Wheat Bread',
    energyRestore: 25,
    ingredients: { [CropType.WHEAT]: 2 },
  },
  {
    id: 'soup',
    name: 'Veggie Soup',
    energyRestore: 45,
    ingredients: { [CropType.CARROT]: 2, [CropType.TOMATO]: 1 },
  },
  {
    id: 'salad',
    name: 'Summer Salad',
    energyRestore: 60,
    ingredients: { [CropType.TOMATO]: 2, [CropType.SUNFLOWER]: 1 },
  },
];

export const KITCHEN_COST = 250;
