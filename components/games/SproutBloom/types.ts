export enum CropType {
  WHEAT = 'WHEAT',
  CARROT = 'CARROT',
  TOMATO = 'TOMATO',
  STRAWBERRY = 'STRAWBERRY',
  PUMPKIN = 'PUMPKIN',
  BLUEBERRY = 'BLUEBERRY',
  SUNFLOWER = 'SUNFLOWER',
}

export enum WeatherType {
  SUNNY = 'SUNNY',
  RAINY = 'RAINY',
  CLOUDY = 'CLOUDY',
}

export interface Order {
  id: string;
  cropType: CropType;
  amount: number;
  reward: number;
  xpReward: number;
}

export interface CropData {
  type: CropType;
  name: string;
  growthStages: number;
  growthTimePerStage: number;
  buyPrice: number;
  sellPrice: number;
  icon: string;
  color: string;
  minLevel: number;
  xpGain: number;
}

export interface PlotState {
  id: number;
  cropType: CropType | null;
  growthStage: number;
  lastWatered: number | null;
  plantedAt: number | null;
  isWatered: boolean;
  isFertilized: boolean;
}

export enum SprinklerType {
  BASIC = 'BASIC',
  QUALITY = 'QUALITY',
  IRIDIUM = 'IRIDIUM',
}

export interface FoodItem {
  id: string;
  name: string;
  energyRestore: number;
  ingredients: { [key in CropType]?: number };
}

export interface GameState {
  money: number;
  energy: number;
  maxEnergy: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  inventory: {
    [key in CropType]?: {
      seeds: number;
      harvested: number;
    };
  } & {
    fertilizer?: number;
    food?: { [key: string]: number };
  };
  plots: PlotState[];
  sprinklers: { [plotId: number]: SprinklerType };
  day: number;
  weather: WeatherType;
  selectedTool: 'HOE' | 'WATER' | 'HARVEST' | 'FERTILIZER' | 'SPRINKLER' | CropType | null;
  upgrades: {
    wateringCanLevel: number;
    hasKitchen: boolean;
  };
  orders: Order[];
}
