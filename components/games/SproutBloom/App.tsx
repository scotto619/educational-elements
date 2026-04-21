import React, { useState, useEffect, useCallback, ReactNode, useRef, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Home, 
  ChefHat, 
  Settings, 
  Coins, 
  Plus, 
  RotateCw,
  FlipHorizontal2,
  Trash2,
  Check,
  X,
  Bed,
  Table as TableIcon,
  Armchair,
  Leaf,
  Flame,
  Square,
  Lamp,
  Layout,
  Sprout,
  Briefcase,
  Sun,
  Moon,
  Store,
  Droplets,
  Maximize,
  ArrowLeftRight,
  Fish as FishIcon,
  Sparkles,
  Zap,
  Trees,
  Axe,
  HelpCircle,
  Hammer,
  Carrot,
  Apple,
  Cat,
  Dog,
  PawPrint,
  Circle,
  Package,
  Info,
  Compass,
  Backpack
} from 'lucide-react';
import {
  FURNITURE_CATALOG,
  PET_CATALOG,
  GRID_SIZE,
  HOUSE_INITIAL_WIDTH,
  HOUSE_INITIAL_HEIGHT,
  GARDEN_INITIAL_WIDTH,
  GARDEN_INITIAL_HEIGHT,
  FOREST_WIDTH,
  FOREST_HEIGHT,
  POND_WIDTH,
  POND_HEIGHT,
  HOUSE_EXPAND_COST,
  HOUSE_EXPAND_WOOD_COST,
  GARDEN_EXPAND_COST,
  GARDEN_EXPAND_WOOD_COST,
  DAY_LENGTH,
  SEEDS,
  RECIPES,
  FISH_CATALOG,
  PLANT_DEATH_TIME,
  STAMINA_MAX,
  STAMINA_CHOP_COST,
  STAMINA_FISH_COST,
  STAMINA_GARDEN_COST,
  STAMINA_COOK_COST,
  STAMINA_WORK_COST,
  TREE_REGROW_TIME,
  FISHING_ROD_PRICE,
  AXE_PRICE,
  HUNTING_BOW_PRICE,
  STAMINA_HUNT_COST,
  DEER_HUNT_DURATION_MIN,
  DEER_HUNT_DURATION_MAX,
  DEER_MOVE_INTERVAL,
  DEER_APPEAR_CHANCE,
  FORAGE_STAMINA_COST,
  FORAGE_BASE_DURATION,
  FORAGE_MIN_DURATION,
  MUSHROOM_COUNT_MIN,
  MUSHROOM_COUNT_MAX,
  BUSH_COUNT,
  WEATHER_CHANGE_MIN,
  WEATHER_CHANGE_MAX,
  WEATHER_WEIGHTS,
} from './constants';
import { GameState, FurnitureItem, PlacedFurniture, GardenPlant, Fish, ForestTree, Pet, FishingSpot, Deer, ForestMushroom, ForestBush, WeatherType } from './types';

const ICON_MAP: Record<string, any> = {
  Bed,
  Table: TableIcon,
  Armchair,
  Leaf,
  Flame,
  Square,
  Lamp,
  Window: Layout,
  Sprout,
  Fish: FishIcon,
  Cat,
  Dog,
  Rabbit: PawPrint,
  Circle,
  Droplets
};

// ─── Fishing spot generator ──────────────────────────────────────────────────
function generateFishingSpots(): FishingSpot[] {
  const count = 5 + Math.floor(Math.random() * 4); // 5–8 spots
  const spots: FishingSpot[] = [];
  const used = new Set<string>();
  const sizes: FishingSpot['size'][] = ['small', 'medium', 'medium', 'large', 'medium', 'small', 'large', 'medium'];
  const shades: FishingSpot['shade'][] = ['light', 'light', 'medium', 'light', 'dark', 'medium', 'medium', 'light'];
  for (let i = 0; i < count; i++) {
    let x: number, y: number, key: string;
    let tries = 0;
    do {
      x = 2 + Math.floor(Math.random() * (POND_WIDTH - 4));
      y = 2 + Math.floor(Math.random() * (POND_HEIGHT - 4));
      key = `${x},${y}`;
      tries++;
    } while (used.has(key) && tries < 20);
    used.add(key);
    const shade = shades[i % shades.length];
    spots.push({
      id: `fs-${Date.now()}-${i}`,
      x,
      y,
      size: sizes[i % sizes.length],
      shade,
      skillRequired: shade === 'light' ? 1 : shade === 'medium' ? 2 : 3,
    });
  }
  return spots;
}
// ─────────────────────────────────────────────────────────────────────────────

// SVG asset paths for forest trees
const TREE_SVG_MAP: Record<string, string> = {
  normal: '/games/cozy-cottage/Forest/tree.svg',
  olive:  '/games/cozy-cottage/Forest/olive-tree.svg',
  orange: '/games/cozy-cottage/Forest/orange-tree.svg',
  apple:  '/games/cozy-cottage/Forest/apple-tree.svg',
};

// SVG asset paths for pets (keyed by pet type)
const PET_SVG_MAP: Record<string, string> = {
  cat: '/games/cozy-cottage/Pets/cat.svg',
  dog: '/games/cozy-cottage/Pets/corgi.svg',
  rabbit: '/games/cozy-cottage/Pets/pug.svg',
  kintamani: '/games/cozy-cottage/Pets/kintamani.svg',
};

// ─── Player sprite helpers ───────────────────────────────────────────────────
/**
 * Returns the correct image src for the player sprite.
 * For the woman character, woman1.png = front/SW and woman2.png = back/NW.
 * Isometric direction mapping:
 *   down  → SW (front, no flip)
 *   right → SE (front, flipped)
 *   up    → NE (back, flipped)
 *   left  → NW (back, no flip)
 */
function getPlayerSrc(sprite: 'man' | 'woman', facing: 'up' | 'down' | 'left' | 'right'): string {
  if (sprite === 'woman') {
    const isBack = facing === 'up' || facing === 'left';
    return isBack
      ? '/games/cozy-cottage/Player/woman2.png'
      : '/games/cozy-cottage/Player/woman1.png';
  }
  return `/games/cozy-cottage/Player/${sprite}.svg`;
}

function getPlayerFlip(sprite: 'man' | 'woman', facing: 'up' | 'down' | 'left' | 'right'): boolean {
  if (sprite === 'woman') {
    // Flip for SE (right) and NE (up) directions
    return facing === 'right' || facing === 'up';
  }
  return facing === 'left';
}

// ─── Isometric projection ────────────────────────────────────────────────────
const ISO_TILE_W = GRID_SIZE * 2;        // 80px – diamond width
const ISO_TILE_H = GRID_SIZE;            // 40px – diamond height (2:1 ratio)
const ISO_SPRITE_RISE = ISO_TILE_H * 1.5; // 60px – headroom above tile footprint

/** Grid (gx, gy) → absolute screen position of the tile's top diamond corner */
function toIso(gx: number, gy: number, gridH: number) {
  return {
    left: (gx - gy) * (ISO_TILE_W / 2) + gridH * (ISO_TILE_W / 2),
    top:  (gx + gy) * (ISO_TILE_H / 2) + ISO_SPRITE_RISE,
  };
}

/**
 * CSS position + size for a sprite with w×h tile footprint at grid (gx, gy).
 * spriteRise – extra px the sprite extends ABOVE the flat tile surface.
 *   • Default (ISO_SPRITE_RISE) for 3-D items like beds, tables, cabinets.
 *   • Pass 0 for flat ground items (garden patches, rugs) so they sit flush.
 */
function isoItemStyle(gx: number, gy: number, w: number, h: number, gridH: number, spriteRise = ISO_SPRITE_RISE) {
  const pos = toIso(gx, gy, gridH);
  return {
    position: 'absolute' as const,
    left:   pos.left  - h * (ISO_TILE_W / 2),
    top:    pos.top   - spriteRise,
    width:  (w + h)   * (ISO_TILE_W / 2),
    height: (w + h)   * (ISO_TILE_H / 2) + spriteRise,
  };
}

/** Convenience: ground-level flat items (patches, rugs) with no sprite rise */
const FLAT_ITEM_TYPES = new Set(['garden_patch', 'rug']);

// ─── Furniture colour presets ─────────────────────────────────────────────────
// Each preset is a CSS filter string applied to the furniture SVG.
// `swatch` is the representative hex shown in the picker.
export const COLOR_PRESETS: { name: string; swatch: string; filter: string | undefined }[] = [
  { name: 'Default',  swatch: '#c8a882', filter: undefined },
  { name: 'Rosewood', swatch: '#b54a5e', filter: 'hue-rotate(320deg) saturate(1.3) brightness(0.95)' },
  { name: 'Ocean',    swatch: '#3d8fbf', filter: 'hue-rotate(195deg) saturate(1.4)' },
  { name: 'Forest',   swatch: '#4a8a52', filter: 'hue-rotate(90deg) saturate(1.4) brightness(0.9)' },
  { name: 'Sunset',   swatch: '#c87832', filter: 'hue-rotate(25deg) saturate(1.5)' },
  { name: 'Lavender', swatch: '#9472cc', filter: 'hue-rotate(255deg) saturate(1.1) brightness(1.05)' },
  { name: 'Mint',     swatch: '#44b89a', filter: 'hue-rotate(148deg) saturate(1.3)' },
  { name: 'Slate',    swatch: '#6e7f96', filter: 'saturate(0.35) brightness(0.82)' },
  { name: 'Blush',    swatch: '#e88fa0', filter: 'hue-rotate(335deg) saturate(0.85) brightness(1.1)' },
  { name: 'Gold',     swatch: '#c9a227', filter: 'hue-rotate(45deg) saturate(1.6) brightness(1.0)' },
];
function isoRise(type: string) { return FLAT_ITEM_TYPES.has(type) ? 0 : ISO_SPRITE_RISE; }

/** Pixel dimensions of the isometric world container for a gridW × gridH grid */
function isoWorldDimensions(gridW: number, gridH: number) {
  return {
    width:  (gridW + gridH) * (ISO_TILE_W / 2),
    height: (gridW + gridH) * (ISO_TILE_H / 2) + ISO_SPRITE_RISE * 2,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const PLANT_ICON_MAP: Record<string, any> = {
  carrot: Carrot,
  tomato: Apple,
  herb: Leaf,
  special: Sparkles
};

// Renders either an SVG image (path starting with '/') or a Lucide icon (by name)
function GameIcon({ icon, className, size, style }: { icon: string, className?: string, size?: number, style?: CSSProperties }) {
  if (icon.startsWith('/')) {
    const imgStyle: CSSProperties = { ...(size ? { width: size, height: size } : {}), ...style };
    return <img src={icon} className={className} style={imgStyle} draggable={false} />;
  }
  const Icon = ICON_MAP[icon];
  if (!Icon) return null;
  return <Icon className={className} size={size} style={style} />;
}

const calculateLevel = (xp: number) => Math.floor(Math.sqrt(xp / 100)) || 1;

function SkillBadge({ icon, label, xp, color }: { icon: ReactNode, label: string, xp: number, color: string }) {
  const level = calculateLevel(xp);
  const nextLevelXp = Math.pow(level + 1, 2) * 100;
  const progress = (xp % nextLevelXp) / nextLevelXp * 100;

  return (
    <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50 flex items-center gap-3 w-40">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cozy-text/60 truncate">{label}</span>
          <span className="text-[10px] font-mono font-bold text-cozy-text">Lv.{level}</span>
        </div>
        <div className="h-1 bg-cozy-text/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${color}`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Deer generator ───────────────────────────────────────────────────────────
// Returns 0–4 deer for the day (60% chance any appear at all)
function generateForestDeer(): Deer[] {
  if (Math.random() > DEER_APPEAR_CHANCE) return [];
  const count = 1 + Math.floor(Math.random() * 4); // 1–4 deer
  const used = new Set<string>();
  const deer: Deer[] = [];
  for (let i = 0; i < count; i++) {
    let x: number, y: number, key: string;
    let tries = 0;
    do {
      x = 2 + Math.floor(Math.random() * (FOREST_WIDTH - 4));
      y = 2 + Math.floor(Math.random() * (FOREST_HEIGHT - 4));
      key = `${x},${y}`;
      tries++;
    } while (used.has(key) && tries < 20);
    used.add(key);
    deer.push({ id: `deer-${Date.now()}-${i}`, x, y, lastMove: Date.now(), facingLeft: Math.random() > 0.5 });
  }
  return deer;
}

// ─── Forest forage generators ─────────────────────────────────────────────────
function generateForestMushrooms(): ForestMushroom[] {
  const count = MUSHROOM_COUNT_MIN + Math.floor(Math.random() * (MUSHROOM_COUNT_MAX - MUSHROOM_COUNT_MIN + 1));
  const used = new Set<string>();
  const mushrooms: ForestMushroom[] = [];
  for (let i = 0; i < count; i++) {
    let x: number, y: number, key: string;
    let tries = 0;
    do {
      x = 1 + Math.floor(Math.random() * (FOREST_WIDTH - 2));
      y = 1 + Math.floor(Math.random() * (FOREST_HEIGHT - 2));
      key = `${x},${y}`;
      tries++;
    } while (used.has(key) && tries < 30);
    used.add(key);
    mushrooms.push({ id: `mush-${Date.now()}-${i}`, x, y });
  }
  return mushrooms;
}

// Fixed bush positions — regenerate hasBerries each day
function generateForestBushes(): ForestBush[] {
  const positions = [
    { x: 3, y: 4 }, { x: 8, y: 2 }, { x: 12, y: 6 },
    { x: 5, y: 10 }, { x: 18, y: 8 }, { x: 15, y: 3 },
    { x: 21, y: 11 }, { x: 6, y: 13 },
  ];
  return positions.slice(0, BUSH_COUNT).map((pos, i) => ({
    id: `bush-${i}`,
    x: pos.x,
    y: pos.y,
    hasBerries: true,
  }));
}

// ─── Exploration loot generator ───────────────────────────────────────────────
// Returns a loot object keyed by resource type → amount
// More rations = better chance at rarer items
function generateExplorationLoot(rations: number): {
  ingredients: Record<string, number>;
  wood: number;
  currency: number;
  seeds: Record<string, number>;
} {
  const loot: ReturnType<typeof generateExplorationLoot> = {
    ingredients: {},
    wood: 0,
    currency: 0,
    seeds: {},
  };

  // Scale by rations used (1–10 range for balanced gameplay)
  const power = Math.min(rations, 10);

  // Common ingredients — always get something
  const commonIngredients = ['carrot', 'herb', 'tomato', 'apple', 'orange', 'olive'];
  const rareIngredients = ['trout', 'salmon', 'koi'];

  const numCommon = 1 + Math.floor(power / 2);
  for (let i = 0; i < numCommon; i++) {
    const item = commonIngredients[Math.floor(Math.random() * commonIngredients.length)];
    loot.ingredients[item] = (loot.ingredients[item] ?? 0) + (1 + Math.floor(Math.random() * 2));
  }

  // Rare ingredient chance scales with rations
  const rareChance = Math.min(0.1 * power, 0.8); // 10% per ration up to 80%
  if (Math.random() < rareChance) {
    const item = rareIngredients[Math.floor(Math.random() * rareIngredients.length)];
    loot.ingredients[item] = (loot.ingredients[item] ?? 0) + 1;
  }

  // Wood — scales with rations
  loot.wood = Math.floor(Math.random() * power * 3);

  // Currency — scales with rations
  loot.currency = Math.floor(Math.random() * power * 15) + power * 5;

  // Seed chance — higher rations = more seeds
  const seedTypes = ['carrot', 'herb', 'tomato', 'potato', 'radish'];
  const seedChance = Math.min(0.15 * power, 0.9);
  if (Math.random() < seedChance) {
    const seedType = seedTypes[Math.floor(Math.random() * seedTypes.length)];
    const amt = 1 + Math.floor(Math.random() * Math.ceil(power / 3));
    loot.seeds[seedType] = (loot.seeds[seedType] ?? 0) + amt;
  }

  // Bonus golden seeds — only with 6+ rations
  if (power >= 6 && Math.random() < 0.15) {
    loot.seeds['special'] = (loot.seeds['special'] ?? 0) + 1;
  }

  return loot;
}

// ─── Initial state factory ────────────────────────────────────────────────────
function createInitialState(sprite: 'man' | 'woman'): GameState {
  return {
    currency: 500,
    inventory: ['f1', 'f4', 'f9'].map(id => ({ id })),
    inventorySize: 10,
    placedFurniture: [],
    houseSize: { width: HOUSE_INITIAL_WIDTH, height: HOUSE_INITIAL_HEIGHT },
    gardenSize: { width: GARDEN_INITIAL_WIDTH, height: GARDEN_INITIAL_HEIGHT },
    playerPosition: { x: 4, y: 4 },
    playerLocation: 'inside',
    workTimer: null,
    fishingTimer: null,
    timeOfDay: 600,
    ingredients: {},
    cookedFood: {},
    gardenPlants: [],
    unlockedRecipes: ['r1', 'r2'],
    dailyMarketItem: null,
    dailyShopItem: null,
    caughtFish: [],
    lastMarketUpdate: -1,
    lastWorkDay: -1,
    pets: [],
    petFood: 5,
    bowlStates: [],
    xp: 0,
    level: 1,
    skills: {
      cooking: 0, fishing: 0, gardening: 0, bartering: 0, strength: 0, foraging: 0,
      // New skills — XP starts at 0, gains wired progressively
      firecraft: 0, crafting: 0, building: 0, engineering: 0, navigation: 0, weatherResistance: 0,
    },
    stamina: STAMINA_MAX,
    maxStamina: STAMINA_MAX,
    wood: 0,
    fishingRod: false,
    hasAxe: false,
    playerSprite: sprite,
    fishingSpots: generateFishingSpots(),
    activeFishingSpot: null,
    fishingDuration: 5,
    boxContents: {},
    seeds: {},
    marketSeeds: SEEDS.reduce((acc, s) => ({ ...acc, [s.type]: 10 }), {}),
    forestTrees: Array.from({ length: 20 }).map((_, i) => ({
      id: `tree-${i}`,
      x: Math.floor(Math.random() * (FOREST_WIDTH - 2)) + 1,
      y: Math.floor(Math.random() * (FOREST_HEIGHT - 2)) + 1,
      health: 100,
      isCut: false,
      regrowsAt: null,
      type: ['normal', 'olive', 'orange', 'apple'][Math.floor(Math.random() * 4)] as 'normal' | 'olive' | 'orange' | 'apple',
    })),
    isRelaxing: false,
    rations: 0,
    explorationTimer: null,
    explorationRations: 0,
    forestDeer: generateForestDeer(),
    huntingBow: false,
    huntingTimer: null,
    activeDeer: null,
    forestMushrooms: generateForestMushrooms(),
    forestBushes: generateForestBushes(),
    foragingTimer: null,
    foragingTarget: null,
    harvestedTreeFruits: [],
    // New systems
    attributes: { agility: 0, endurance: 0, intelligence: 0, perception: 0 },
    weather: 'sunny' as WeatherType,
    weatherTimer: WEATHER_CHANGE_MAX,
    hunger: 100,
    thirst: 100,
    exploredAreas: ['inside'],
  };
}
const SAVE_KEY = 'cozyCottageSave';
const FIREBASE_SAVE_KEY = 'cozyCottageGameData'; // key inside studentData document
// ─────────────────────────────────────────────────────────────────────────────

interface AppProps {
  studentData?: Record<string, any>;
  updateStudentData?: (data: Record<string, any>) => Promise<void>;
  showToast?: (message: string, type?: string) => void;
}

export default function App({ studentData, updateStudentData, showToast }: AppProps = {}) {
  // ── Screen / menu state ───────────────────────────────────────────────────
  const [screen, setScreen] = useState<'menu' | 'character-select' | 'game'>('menu');

  // Detect existing save: Firebase first, localStorage as fallback
  const [hasSave, setHasSave] = useState(() => {
    if (studentData?.[FIREBASE_SAVE_KEY]) return true;
    return !!localStorage.getItem(SAVE_KEY);
  });

  const startNewGame = (sprite: 'man' | 'woman') => {
    localStorage.removeItem(SAVE_KEY);
    // Also wipe the Firebase save so Continue doesn't reload old data
    if (updateStudentData) {
      updateStudentData({ [FIREBASE_SAVE_KEY]: null }).catch(() => {});
    }
    setState(createInitialState(sprite));
    setScreen('game');
    setMessage("Welcome to your cozy cottage!");
  };

  const migrateAndLoad = (saved: GameState) => {
      // Migrate old saves: inventory was string[] — convert to InventorySlot[]
      if (saved.inventory.length > 0 && typeof (saved.inventory[0] as unknown) === 'string') {
        (saved as GameState).inventory = (saved.inventory as unknown as string[]).map(id => ({ id }));
      }
      // Migrate missing fields from older saves
      if (!saved.skills.foraging) (saved as GameState).skills = { ...saved.skills, foraging: 0 };
      if (!saved.forestMushrooms) (saved as GameState).forestMushrooms = generateForestMushrooms();
      if (!saved.forestBushes) (saved as GameState).forestBushes = generateForestBushes();
      if (saved.foragingTimer === undefined) (saved as GameState).foragingTimer = null;
      if (saved.foragingTarget === undefined) (saved as GameState).foragingTarget = null;
      if (!saved.harvestedTreeFruits) (saved as GameState).harvestedTreeFruits = [];
      if (!saved.skills.firecraft)        (saved as GameState).skills = { ...saved.skills, firecraft: 0, crafting: 0, building: 0, engineering: 0, navigation: 0, weatherResistance: 0 };
      if (!saved.attributes)              (saved as GameState).attributes = { agility: 0, endurance: 0, intelligence: 0, perception: 0 };
      if (!saved.weather)                 (saved as GameState).weather = 'sunny';
      if (saved.weatherTimer === undefined)(saved as GameState).weatherTimer = WEATHER_CHANGE_MAX;
      if (saved.hunger === undefined)     (saved as GameState).hunger = 100;
      if (saved.thirst === undefined)     (saved as GameState).thirst = 100;
      if (!saved.exploredAreas)           (saved as GameState).exploredAreas = ['inside'];
      setState(saved);
      setScreen('game');
      setMessage("Welcome back!");
  };

  const continueGame = () => {
    // ── Firebase save (cross-device) ──────────────────────────────────────
    if (studentData?.[FIREBASE_SAVE_KEY]) {
      try {
        migrateAndLoad(studentData[FIREBASE_SAVE_KEY] as GameState);
        return;
      } catch {
        // fall through to localStorage
      }
    }

    // ── localStorage fallback (teacher preview / offline) ─────────────────
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as GameState;
      migrateAndLoad(saved);
    } catch {
      setMessage("Save file corrupted — start a new game.");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const [state, setState] = useState<GameState>(() => createInitialState('man'));

  const [mode, setMode] = useState<'walk' | 'decorate' | 'shop' | 'cook' | 'market' | 'garden' | 'fish' | 'sleep' | 'inventory' | 'box' | 'explore'>('walk');
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [shopTab, setShopTab] = useState<'furniture' | 'pets' | 'tools'>('furniture');
  const [worldTooltip, setWorldTooltip] = useState<{ name: string, x: number, y: number } | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem | null>(null);
  const [placementPos, setPlacementPos] = useState({ x: 0, y: 0 });
  const [placementRotation, setPlacementRotation] = useState<0 | 90 | 180 | 270>(0);
  const [placementFlipped, setPlacementFlipped] = useState(false);
  // 4-directional facing; 'right'/'left' also controls sprite flip
  const [playerFacing, setPlayerFacing] = useState<'right' | 'left' | 'up' | 'down'>('down');
  // Kept for any legacy refs; derived from playerFacing
  const playerFacingLeft = playerFacing === 'left';
  const playerMoving = useRef(false); // set each RAF frame; drives CSS walking class
  const [message, setMessage] = useState<string | null>("Welcome to your cozy home!");
  const [selectedGardenPatch, setSelectedGardenPatch] = useState<string | null>(null);
  const [confirmExpand, setConfirmExpand] = useState<{ type: 'house' | 'garden', cost: number } | null>(null);
  const [sleepHours, setSleepHours] = useState(8);
  const [showGuide, setShowGuide] = useState(false);
  // shopColorChoices: furnitureId → chosen CSS filter (undefined = Default)
  const [shopColorChoices, setShopColorChoices] = useState<Record<string, string | undefined>>({});
  // color carried from inventory slot into the placement ghost
  const [placementColorFilter, setPlacementColorFilter] = useState<string | undefined>(undefined);
  const [rationIngredients, setRationIngredients] = useState<string[]>([]);
  const [explorationRationCount, setExplorationRationCount] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleMove = useCallback((dx: number, dy: number) => {
    if (mode !== 'walk') return;
    setState(prev => {
      let maxX = 29;
      let maxY = 19;
      
      if (prev.playerLocation === 'inside') {
        maxX = prev.houseSize.width - 1;
        maxY = prev.houseSize.height - 1;
      } else if (prev.playerLocation === 'outside') {
        maxX = prev.gardenSize.width - 1;
        maxY = prev.gardenSize.height - 1;
      } else if (prev.playerLocation === 'pond') {
        maxX = POND_WIDTH - 1;
        maxY = POND_HEIGHT - 1;
      } else if (prev.playerLocation === 'forest') {
        maxX = FOREST_WIDTH - 1;
        maxY = FOREST_HEIGHT - 1;
      }

      const newX = Math.max(0, Math.min(maxX, prev.playerPosition.x + dx));
      const newY = Math.max(0, Math.min(maxY, prev.playerPosition.y + dy));

      // Pond: player moves freely on the water (they're in a boat)

      return { ...prev, playerPosition: { x: newX, y: newY }, isRelaxing: false };
    });
  }, [mode]);

  const goToLocation = (location: 'inside' | 'outside' | 'pond' | 'forest') => {
    setState(prev => ({
      ...prev,
      playerLocation: location,
      isRelaxing: false,
      playerPosition: location === 'pond' ? { x: Math.floor(POND_WIDTH / 2), y: Math.floor(POND_HEIGHT / 2) } : { x: 2, y: 2 }
    }));
    const messages = {
      inside: "Back inside the cozy cottage.",
      outside: "Heading out to the garden!",
      pond: "Visiting the peaceful pond.",
      forest: "Entering the deep, whispering forest."
    };
    setMessage(messages[location]);
  };

  const plantSeed = (seedType: string) => {
    if (!selectedGardenPatch) return;
    const seed = SEEDS.find(s => s.type === seedType);
    if (!seed) return;

    if (state.stamina < STAMINA_GARDEN_COST) {
      setMessage("Too tired to plant! Rest or sleep.");
      return;
    }

    if ((state.seeds[seedType] || 0) > 0) {
      const newPlant: GardenPlant = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        furnitureId: selectedGardenPatch,
        type: seedType as any,
        growthStage: 0,
        plantedAt: Date.now(),
        lastWateredAt: Date.now(),
        isWatered: true, // Start watered
        isDead: false
      };

      setState(prev => ({
        ...prev,
        seeds: { ...prev.seeds, [seedType]: prev.seeds[seedType] - 1 },
        stamina: prev.stamina - STAMINA_GARDEN_COST,
        gardenPlants: [...prev.gardenPlants, newPlant],
        skills: { ...prev.skills, gardening: prev.skills.gardening + 1 }
      }));
      setMode('walk');
      setSelectedGardenPatch(null);
      setMessage(`Planted ${seed.name}! Don't forget to water it.`);
    } else {
      setMessage(`You don't have any ${seed.name} seeds! Buy some at the market.`);
    }
  };

  const waterPlant = (plantId: string) => {
    if (state.stamina < STAMINA_GARDEN_COST) {
      setMessage("Too tired to water plants!");
      return;
    }
    setState(prev => ({
      ...prev,
      stamina: prev.stamina - STAMINA_GARDEN_COST,
      gardenPlants: prev.gardenPlants.map(p => 
        p.id === plantId ? { ...p, isWatered: true, lastWateredAt: Date.now() } : p
      ),
      skills: { ...prev.skills, gardening: prev.skills.gardening + 2 }
    }));
    setMessage("Watered the plant! It looks happy.");
  };

  const harvestPlant = (plantId: string) => {
    const plant = state.gardenPlants.find(p => p.id === plantId);
    if (!plant) return;
    if (plant.growthStage < 3) {
      setMessage("It's not ready to harvest yet!");
      return;
    }

    if (state.stamina < STAMINA_GARDEN_COST) {
      setMessage("Too tired to harvest!");
      return;
    }

    setState(prev => ({
      ...prev,
      stamina: prev.stamina - STAMINA_GARDEN_COST,
      gardenPlants: prev.gardenPlants.filter(p => p.id !== plantId),
      ingredients: {
        ...prev.ingredients,
        [plant.type]: (prev.ingredients[plant.type] || 0) + 1
      },
      skills: { ...prev.skills, gardening: prev.skills.gardening + 10 }
    }));
    setMessage(`Harvested ${plant.type}!`);
  };

  const catchFish = (shade: 'light' | 'medium' | 'dark' = 'light') => {
    const rand = Math.random();
    let rarity: 'common' | 'uncommon' | 'rare' | 'legendary' = 'common';
    if (shade === 'light') {
      if (rand > 0.995) rarity = 'legendary';
      else if (rand > 0.95) rarity = 'rare';
      else if (rand > 0.75) rarity = 'uncommon';
    } else if (shade === 'medium') {
      if (rand > 0.95) rarity = 'legendary';
      else if (rand > 0.70) rarity = 'rare';
      else if (rand > 0.30) rarity = 'uncommon';
    } else { // dark
      if (rand > 0.70) rarity = 'legendary';
      else if (rand > 0.20) rarity = 'rare';
      else if (rand > 0.05) rarity = 'uncommon';
    }
    const possibleFish = FISH_CATALOG.filter(f => f.rarity === rarity);
    if (possibleFish.length === 0) return FISH_CATALOG[0]; // fallback
    return possibleFish[Math.floor(Math.random() * possibleFish.length)];
  };

  const goToPond = () => {
    setState(prev => {
      const visiting = prev.playerLocation !== 'pond';
      const area = 'pond';
      return {
        ...prev,
        playerLocation: visiting ? area : 'outside',
        playerPosition: visiting
          ? { x: Math.floor(POND_WIDTH / 2), y: Math.floor(POND_HEIGHT / 2) }
          : { x: 2, y: 2 },
        // Navigation XP for visiting a new area
        skills: visiting && !prev.exploredAreas.includes(area)
          ? { ...prev.skills, navigation: prev.skills.navigation + 20 }
          : prev.skills,
        exploredAreas: visiting && !prev.exploredAreas.includes(area)
          ? [...prev.exploredAreas, area]
          : prev.exploredAreas,
      };
    });
    setMessage(state.playerLocation === 'pond' ? "Back to the garden." : "Heading down to the peaceful pond.");
  };

  const startFishingAtSpot = (spotId: string) => {
    if (!state.fishingRod) {
      setMessage("You need a Fishing Rod! Buy one from the Shop.");
      return;
    }
    if (state.fishingTimer !== null) {
      setMessage("Already fishing!");
      return;
    }
    const spot = state.fishingSpots.find(s => s.id === spotId);
    if (!spot) return;

    const fishingLevel = calculateLevel(state.skills.fishing);
    if (fishingLevel < spot.skillRequired) {
      const shadeLabel = spot.shade === 'dark' ? 'dark' : spot.shade === 'medium' ? 'shadowy' : 'light';
      setMessage(`Need Fishing Lv.${spot.skillRequired} for ${shadeLabel} holes!`);
      return;
    }

    // Check adjacency (player must be within 1 tile)
    const dx = Math.abs(state.playerPosition.x - spot.x);
    const dy = Math.abs(state.playerPosition.y - spot.y);
    if (dx > 1.5 || dy > 1.5) {
      setMessage("Move closer to the fishing hole!");
      return;
    }

    if (state.stamina < STAMINA_FISH_COST) {
      setMessage("Too tired to fish!");
      return;
    }

    const duration = 5 + Math.floor(Math.random() * 6); // 5–10 seconds
    setState(prev => ({
      ...prev,
      fishingTimer: duration,
      fishingDuration: duration,
      activeFishingSpot: spotId,
      stamina: prev.stamina - STAMINA_FISH_COST,
    }));
    setMessage("Line cast! Wait for a bite...");
  };

  const buyFishingRod = () => {
    if (state.fishingRod) {
      setMessage("You already have a fishing rod!");
      return;
    }
    if (state.currency < FISHING_ROD_PRICE) {
      setMessage("Not enough coins!");
      return;
    }
    setState(prev => ({ ...prev, currency: prev.currency - FISHING_ROD_PRICE, fishingRod: true }));
    setMessage("Got a Fishing Rod! Head to the pond to fish.");
  };

  const buyAxe = () => {
    if (state.hasAxe) {
      setMessage("You already have an axe!");
      return;
    }
    if (state.currency < AXE_PRICE) {
      setMessage("Not enough coins!");
      return;
    }
    setState(prev => ({ ...prev, currency: prev.currency - AXE_PRICE, hasAxe: true }));
    setMessage("Got an Axe! Head to the forest to chop trees.");
  };

  const buyHuntingBow = () => {
    if (state.huntingBow) { setMessage("You already have a Hunting Bow!"); return; }
    if (state.currency < HUNTING_BOW_PRICE) { setMessage("Not enough coins!"); return; }
    setState(prev => ({ ...prev, currency: prev.currency - HUNTING_BOW_PRICE, huntingBow: true }));
    setMessage("Got a Hunting Bow! Find deer in the forest.");
  };

  const startHunting = (deerID: string) => {
    if (!state.huntingBow) { setMessage("You need a Hunting Bow! Buy one from the Shop."); return; }
    if (state.huntingTimer !== null) { setMessage("Already hunting — stay still!"); return; }
    const deer = state.forestDeer.find(d => d.id === deerID);
    if (!deer) return;
    const dx = Math.abs(state.playerPosition.x - deer.x);
    const dy = Math.abs(state.playerPosition.y - deer.y);
    if (dx > 1.5 || dy > 1.5) { setMessage("Get closer to the deer first!"); return; }
    if (state.stamina < STAMINA_HUNT_COST) { setMessage("Too tired to hunt!"); return; }
    const duration = DEER_HUNT_DURATION_MIN + Math.floor(Math.random() * (DEER_HUNT_DURATION_MAX - DEER_HUNT_DURATION_MIN + 1));
    setState(prev => ({
      ...prev,
      huntingTimer: duration,
      activeDeer: deerID,
      stamina: prev.stamina - STAMINA_HUNT_COST,
    }));
    setMessage("Draw... hold... release!");
  };

  // Cook rations — requires cooking level 2, consumes any 3 chosen ingredients
  const cookRations = (selectedIngredients: string[]) => {
    if (selectedIngredients.length !== 3) {
      setMessage("Choose exactly 3 ingredients to make Rations.");
      return;
    }
    const cookingLevel = calculateLevel(state.skills.cooking);
    if (cookingLevel < 2) {
      setMessage("Need Cooking Lv.2 to make Rations!");
      return;
    }
    if (state.stamina < STAMINA_COOK_COST) {
      setMessage("Too tired to cook!");
      return;
    }
    // Check we have all ingredients
    const needed: Record<string, number> = {};
    for (const ing of selectedIngredients) {
      needed[ing] = (needed[ing] ?? 0) + 1;
    }
    for (const [ing, amt] of Object.entries(needed)) {
      if ((state.ingredients[ing] ?? 0) < amt) {
        setMessage(`Not enough ${ing}!`);
        return;
      }
    }
    setState(prev => {
      const newIngredients = { ...prev.ingredients };
      for (const [ing, amt] of Object.entries(needed)) {
        newIngredients[ing] = (newIngredients[ing] ?? 0) - amt;
      }
      return {
        ...prev,
        ingredients: newIngredients,
        rations: prev.rations + 1,
        stamina: prev.stamina - STAMINA_COOK_COST,
        skills: { ...prev.skills, cooking: prev.skills.cooking + 10 },
        xp: prev.xp + 10,
      };
    });
    setMessage("Packed some Rations for the road!");
  };

  // Start exploration — costs rations, returns loot after 30s per ration
  const startExploration = (rationCount: number) => {
    if (rationCount < 1) {
      setMessage("Pack at least 1 ration to explore!");
      return;
    }
    if (state.rations < rationCount) {
      setMessage("Not enough Rations!");
      return;
    }
    if (state.explorationTimer !== null) {
      setMessage("Already out exploring!");
      return;
    }
    if (state.workTimer !== null) {
      setMessage("Can't explore while working!");
      return;
    }
    const duration = rationCount * 30; // 30s per ration
    setState(prev => ({
      ...prev,
      rations: prev.rations - rationCount,
      explorationTimer: duration,
      explorationRations: rationCount,
    }));
    setMessage(`Set off exploring with ${rationCount} ration${rationCount > 1 ? 's' : ''}! Back in ${duration}s.`);
    setMode('walk');
  };

  /** Transfer `amount` of `key` in `category` from player pocket → box */
  const putInBox = (boxId: string, category: 'ingredients' | 'seeds' | 'cookedFood' | 'wood', key: string, amount = 1) => {
    setState(prev => {
      if (category === 'wood') {
        if (prev.wood < amount) return prev;
        const boxSlot = prev.boxContents[boxId] ?? {};
        return { ...prev, wood: prev.wood - amount, boxContents: { ...prev.boxContents, [boxId]: { ...boxSlot, __wood: (boxSlot.__wood ?? 0) + amount } } };
      }
      const stock = (prev[category] as Record<string, number>)[key] ?? 0;
      if (stock < amount) return prev;
      const boxSlot = prev.boxContents[boxId] ?? {};
      return {
        ...prev,
        [category]: { ...(prev[category] as Record<string, number>), [key]: stock - amount },
        boxContents: { ...prev.boxContents, [boxId]: { ...boxSlot, [key]: (boxSlot[key] ?? 0) + amount } },
      };
    });
  };

  /** Transfer `amount` of `key` from box → player pocket */
  const takeFromBox = (boxId: string, category: 'ingredients' | 'seeds' | 'cookedFood' | 'wood', key: string, amount = 1) => {
    setState(prev => {
      const boxSlot = prev.boxContents[boxId] ?? {};
      const storeKey = category === 'wood' ? '__wood' : key;
      const inBox = boxSlot[storeKey] ?? 0;
      if (inBox < amount) return prev;
      const newBoxSlot = { ...boxSlot, [storeKey]: inBox - amount };
      if (category === 'wood') {
        return { ...prev, wood: prev.wood + amount, boxContents: { ...prev.boxContents, [boxId]: newBoxSlot } };
      }
      return {
        ...prev,
        [category]: { ...(prev[category] as Record<string, number>), [key]: ((prev[category] as Record<string, number>)[key] ?? 0) + amount },
        boxContents: { ...prev.boxContents, [boxId]: newBoxSlot },
      };
    });
  };

  const finishFishing = () => {
    const fish = catchFish();
    setState(prev => ({
      ...prev,
      fishingTimer: null,
      caughtFish: [...prev.caughtFish, fish.id],
      xp: prev.xp + 10,
      level: calculateLevel(prev.xp + 10)
    }));
    setMessage(`You caught a ${fish.name}! (${fish.rarity})`);
  };

  const skipTime = (hours: number) => {
    setState(prev => {
      const nextXp = prev.xp + 1;
      return {
        ...prev,
        timeOfDay: (prev.timeOfDay + hours * 100) % DAY_LENGTH,
        stamina: prev.maxStamina,
        xp: nextXp,
        level: calculateLevel(nextXp)
      };
    });
    setMode('walk');
    setMessage(`Slept for ${hours} hours. Feeling fully refreshed!`);
  };

  const buySeed = (seedType: string) => {
    const seed = SEEDS.find(s => s.type === seedType);
    if (!seed) return;
    const stock = state.marketSeeds[seedType] || 0;

    if (stock <= 0) {
      setMessage("Out of stock for today!");
      return;
    }

    if (state.currency >= seed.price) {
      setState(prev => ({
        ...prev,
        currency: prev.currency - seed.price,
        seeds: { ...prev.seeds, [seedType]: (prev.seeds[seedType] || 0) + 1 },
        marketSeeds: { ...prev.marketSeeds, [seedType]: prev.marketSeeds[seedType] - 1 },
        skills: { ...prev.skills, bartering: prev.skills.bartering + 1 }
      }));
      setMessage(`Bought ${seed.name} seed!`);
    } else {
      setMessage("Not enough coins!");
    }
  };

  const buyDailyMarketItem = () => {
    const item = state.dailyMarketItem;
    if (!item) return;
    if (state.currency >= item.price) {
      setState(prev => ({
        ...prev,
        currency: prev.currency - item.price,
        ingredients: item.type === 'ingredient' ? { ...prev.ingredients, [item.id]: (prev.ingredients[item.id] || 0) + 1 } : prev.ingredients,
        seeds: item.type === 'seed' ? { ...prev.seeds, [item.id]: (prev.seeds[item.id] || 0) + 1 } : prev.seeds,
        petFood: item.id === 'pet_food' ? prev.petFood + 5 : prev.petFood,
        dailyMarketItem: null,
        skills: { ...prev.skills, bartering: prev.skills.bartering + 2 }
      }));
      setMessage(`Bought special ${item.id}!`);
    } else {
      setMessage("Not enough coins!");
    }
  };

  const buyDailyShopItem = () => {
    const item = state.dailyShopItem;
    if (!item) return;
    if (state.currency >= item.price) {
      if (state.inventory.length >= state.inventorySize) {
        setMessage("Inventory full!");
        return;
      }
      setState(prev => ({
        ...prev,
        currency: prev.currency - item.price,
        inventory: [...prev.inventory, { id: item.id }],
        dailyShopItem: null,
        skills: { ...prev.skills, bartering: prev.skills.bartering + 5 }
      }));
      setMessage(`Bought special ${item.id}!`);
    } else {
      setMessage("Not enough coins!");
    }
  };
  const getTimeColor = () => {
    const time = state.timeOfDay;
    if (time > 1900 || time < 600) return 'rgba(10, 10, 40, 0.4)'; // Night
    if (time > 1700) return 'rgba(255, 100, 0, 0.2)'; // Sunset
    if (time < 800) return 'rgba(255, 200, 100, 0.1)'; // Sunrise
    return 'transparent';
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 100);
    const mins = time % 100;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${(mins * 0.6).toFixed(0).padStart(2, '0')} ${ampm}`;
  };

  // Time and Work Timers
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => {
        let nextTime = (prev.timeOfDay + 1) % DAY_LENGTH;
        let nextWorkTimer = prev.workTimer !== null ? Math.max(0, prev.workTimer - 1) : null;
        let nextFishingTimer = prev.fishingTimer !== null ? Math.max(0, prev.fishingTimer - 1) : null;
        let nextExplorationTimer = prev.explorationTimer !== null ? Math.max(0, prev.explorationTimer - 1) : null;
        let nextHuntingTimer = prev.huntingTimer !== null ? Math.max(0, prev.huntingTimer - 1) : null;
        let nextForagingTimer = prev.foragingTimer !== null ? Math.max(0, prev.foragingTimer - 1) : null;

        // Deer roaming — move each deer every DEER_MOVE_INTERVAL ms
        const now = Date.now();
        let nextForestDeer = prev.forestDeer.map(deer => {
          if (deer.id === prev.activeDeer) return deer; // freeze hunted deer
          if (now - deer.lastMove < DEER_MOVE_INTERVAL) return deer;
          const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1],[0,0]];
          const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
          const nx = Math.max(1, Math.min(FOREST_WIDTH - 2, deer.x + dx));
          const ny = Math.max(1, Math.min(FOREST_HEIGHT - 2, deer.y + dy));
          return { ...deer, x: nx, y: ny, lastMove: now, facingLeft: dx < 0 ? true : dx > 0 ? false : deer.facingLeft };
        });
        
        // Strength increases inventory size
        const strengthLevel = calculateLevel(prev.skills.strength);
        const nextInventorySize = 10 + (strengthLevel - 1) * 5;

        // Growth & Death Logic
        const nextGardenPlants = prev.gardenPlants.map(p => {
          if (p.isDead) return p;

          // Check for death
          if (!p.isWatered && Date.now() - p.lastWateredAt > PLANT_DEATH_TIME * 1000) {
            return { ...p, isDead: true };
          }

          if (p.isWatered && p.growthStage < 3) {
            const seed = SEEDS.find(s => s.type === p.type);
            const growthInterval = (seed?.growthTime || 30) * 1000 / 3;
            if (Date.now() - p.plantedAt > (p.growthStage + 1) * growthInterval) {
              return { ...p, growthStage: p.growthStage + 1, isWatered: false }; // Dries out after growing
            }
          }
          return p;
        });

        // Tree Regrowth
        let nextForestTrees = prev.forestTrees.map(t => {
          if (t.isCut && t.regrowsAt && Date.now() > t.regrowsAt) {
            return { ...t, isCut: false, regrowsAt: null, health: 100 };
          }
          return t;
        });

        // Calculate Comfort Level
        const comfortLevel = prev.placedFurniture
          .filter(f => f.location === 'inside')
          .reduce((acc, f) => {
            const furniture = FURNITURE_CATALOG.find(item => item.id === f.furnitureId);
            return acc + (furniture?.comfort || 0);
          }, 0);

        // Stamina Recovery (slowly over time if relaxing)
        let nextStamina = prev.stamina;
        if (prev.isRelaxing) {
          // Base recovery + bonus from comfort
          // User wants 1 point every 3 seconds. 1/3 = 0.33 per second.
          const recoveryRate = 0.33 + (comfortLevel * 0.02);
          nextStamina = Math.min(prev.maxStamina, prev.stamina + recoveryRate);
        }

        // ── Weather tick ──────────────────────────────────────────────────────
        const nextWeatherTimer = (prev.weatherTimer ?? WEATHER_CHANGE_MAX) - 1;
        let nextWeather = prev.weather ?? 'sunny';
        if (nextWeatherTimer <= 0) {
          const roll = Math.random();
          let cumulative = 0;
          const weatherTypes: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'stormy'];
          for (let i = 0; i < WEATHER_WEIGHTS.length; i++) {
            cumulative += WEATHER_WEIGHTS[i];
            if (roll < cumulative) { nextWeather = weatherTypes[i]; break; }
          }
        }
        const resetWeatherTimer = nextWeatherTimer <= 0
          ? WEATHER_CHANGE_MIN + Math.floor(Math.random() * (WEATHER_CHANGE_MAX - WEATHER_CHANGE_MIN))
          : nextWeatherTimer;

        // Pet AI
        let nextPets = prev.pets.map(pet => {
          let { x, y, hunger, thirst, health, lastMove } = pet;
          
          // Decrease stats
          hunger = Math.max(0, hunger - 0.05);
          thirst = Math.max(0, thirst - 0.08);
          
          if (hunger === 0 || thirst === 0) {
            health = Math.max(0, health - 0.1);
          } else {
            health = Math.min(100, health + 0.05);
          }

          // Move randomly
          if (Date.now() - lastMove > 5000 && prev.playerLocation === 'inside') {
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            x = Math.max(0, Math.min(prev.houseSize.width - 1, x + dx));
            y = Math.max(0, Math.min(prev.houseSize.height - 1, y + dy));
            lastMove = Date.now();
          }

          // Check for bowls
          const nearbyBowl = prev.bowlStates.find(b => {
            const f = prev.placedFurniture.find(pf => pf.id === b.furnitureId);
            if (!f || f.location !== 'inside') return false;
            return Math.abs(f.x - x) <= 1 && Math.abs(f.y - y) <= 1 && b.amount > 0;
          });

          if (nearbyBowl) {
            if (nearbyBowl.type === 'food' && hunger < 80) {
              hunger = Math.min(100, hunger + 20);
              // We'll update bowl amount in a separate step or here
            } else if (nearbyBowl.type === 'water' && thirst < 80) {
              thirst = Math.min(100, thirst + 20);
            }
          }

          return { ...pet, x, y, hunger, thirst, health, lastMove };
        });

        // Update bowl amounts if pets ate/drank
        let nextBowlStates = prev.bowlStates.map(b => {
          const f = prev.placedFurniture.find(pf => pf.id === b.furnitureId);
          if (!f) return b;
          const eatingPet = nextPets.find(p => Math.abs(f.x - p.x) <= 1 && Math.abs(f.y - p.y) <= 1);
          if (eatingPet) {
            if (b.type === 'food' && eatingPet.hunger > prev.pets.find(p => p.id === eatingPet.id)!.hunger) {
              return { ...b, amount: Math.max(0, b.amount - 5) };
            }
            if (b.type === 'water' && eatingPet.thirst > prev.pets.find(p => p.id === eatingPet.id)!.thirst) {
              return { ...b, amount: Math.max(0, b.amount - 5) };
            }
          }
          return b;
        });

        // Daily Market Update
        const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        let nextDailyMarketItem = prev.dailyMarketItem;
        let nextDailyShopItem = prev.dailyShopItem;
        let nextLastMarketUpdate = prev.lastMarketUpdate;
        let nextMarketSeeds = prev.marketSeeds;

        if (currentDay > prev.lastMarketUpdate) {
          // Farmers Market: Seed or Ingredient
          const foodSeeds = SEEDS.filter(s => ['carrot', 'tomato', 'herb'].includes(s.type));
          const randomSeed = foodSeeds[Math.floor(Math.random() * foodSeeds.length)];
          const isPetFood = Math.random() > 0.8;
          nextDailyMarketItem = isPetFood ? 
            { id: 'pet_food', price: 50, type: 'ingredient' } :
            { id: randomSeed.type, price: Math.floor(randomSeed.price * 0.5), type: 'seed' };

          // Refresh all seed stock
          nextMarketSeeds = SEEDS.reduce((acc, s) => ({ ...acc, [s.type]: 10 }), {});

          // Furniture Shop: Furniture
          const randomFurniture = FURNITURE_CATALOG[Math.floor(Math.random() * FURNITURE_CATALOG.length)];
          nextDailyShopItem = { id: randomFurniture.id, price: Math.floor(randomFurniture.price * 0.7), type: 'furniture' };
          
          // Respawn forest trees in new spots
          nextForestTrees = Array.from({ length: 20 }).map((_, i) => ({
            id: `tree-${i}`,
            x: Math.floor(Math.random() * (FOREST_WIDTH - 2)) + 1,
            y: Math.floor(Math.random() * (FOREST_HEIGHT - 2)) + 1,
            health: 100,
            isCut: false,
            regrowsAt: null,
            type: ['normal', 'olive', 'orange', 'apple'][Math.floor(Math.random() * 4)] as 'normal' | 'olive' | 'orange' | 'apple'
          }));

          nextLastMarketUpdate = currentDay;
        }

        // Daily: refresh mushrooms and bush berries
        let nextForestMushrooms = prev.forestMushrooms ?? [];
        let nextForestBushes = prev.forestBushes ?? generateForestBushes();
        let nextHarvestedTreeFruits = prev.harvestedTreeFruits ?? [];
        if (currentDay > prev.lastMarketUpdate) {
          nextForestMushrooms = generateForestMushrooms();
          nextForestBushes = nextForestBushes.map(b => ({ ...b, hasBerries: true }));
          nextHarvestedTreeFruits = [];
        }

        // Refresh fishing spots and deer each new day
        let nextFishingSpots = prev.fishingSpots;
        if (currentDay > prev.lastMarketUpdate) {
          nextFishingSpots = generateFishingSpots();
          nextForestDeer = generateForestDeer(); // new deer each day
        }

        // Auto-finish work
        if (prev.workTimer === 1) {
          setMessage("Finished work! Earned 50 coins.");
          const nextXp = prev.xp + 2;
          return { 
            ...prev, 
            timeOfDay: nextTime, 
            workTimer: null, 
            currency: prev.currency + 50,
            xp: nextXp,
            level: calculateLevel(nextXp),
            gardenPlants: nextGardenPlants,
            forestTrees: nextForestTrees,
            dailyMarketItem: nextDailyMarketItem,
            dailyShopItem: nextDailyShopItem,
            lastMarketUpdate: nextLastMarketUpdate
          };
        }

        // Auto-finish fishing
        if (prev.fishingTimer === 1) {
          if (prev.caughtFish.length >= prev.inventorySize) {
            setMessage("Inventory full! Couldn't keep the fish.");
            return { ...prev, fishingTimer: null, activeFishingSpot: null };
          }
          const spot = prev.fishingSpots.find(s => s.id === prev.activeFishingSpot);
          const shade = spot?.shade ?? 'light';
          const fish = catchFish(shade);
          setMessage(`Caught a ${fish.name}! (${fish.rarity})`);
          const nextXp = prev.xp + 2;
          // Remove the used fishing spot
          const nextFishingSpots = prev.fishingSpots.filter(s => s.id !== prev.activeFishingSpot);
          return {
            ...prev,
            timeOfDay: nextTime,
            fishingTimer: null,
            activeFishingSpot: null,
            fishingSpots: nextFishingSpots,
            caughtFish: [...prev.caughtFish, fish.id],
            xp: nextXp,
            level: calculateLevel(nextXp),
            skills: { ...prev.skills, fishing: prev.skills.fishing + 5 },
            gardenPlants: nextGardenPlants,
            forestTrees: nextForestTrees,
            dailyMarketItem: nextDailyMarketItem,
            dailyShopItem: nextDailyShopItem,
            lastMarketUpdate: nextLastMarketUpdate
          };
        }

        // Auto-finish foraging
        if (prev.foragingTimer === 1 && prev.foragingTarget) {
          const { id, kind } = prev.foragingTarget;
          const foragingLevel = calculateLevel(prev.skills.foraging);
          const bonus = Math.random() < (foragingLevel * 0.08) ? 1 : 0; // level-scaled extra yield
          let newIngredients = { ...prev.ingredients };
          let newForestMushrooms = nextForestMushrooms;
          let newForestBushes = nextForestBushes;
          let newHarvestedTreeFruits = nextHarvestedTreeFruits;
          let foragingXpGain = 0;
          let lootMsg = '';

          if (kind === 'mushroom') {
            const amt = 1 + bonus;
            newIngredients.mushroom = (newIngredients.mushroom ?? 0) + amt;
            newForestMushrooms = newForestMushrooms.filter(m => m.id !== id);
            foragingXpGain = 15;
            lootMsg = `Found ${amt} mushroom${amt > 1 ? 's' : ''}! 🍄`;
          } else if (kind === 'bush') {
            const amt = 1 + bonus;
            newIngredients.berry = (newIngredients.berry ?? 0) + amt;
            newForestBushes = newForestBushes.map(b => b.id === id ? { ...b, hasBerries: false } : b);
            foragingXpGain = 10;
            lootMsg = `Picked ${amt} berr${amt > 1 ? 'ies' : 'y'}! 🫐`;
          } else if (kind === 'fruit') {
            const tree = prev.forestTrees.find(t => t.id === id);
            const fruit = tree ? (TREE_FRUIT_MAP[tree.type ?? 'normal'] ?? null) : null;
            if (fruit) {
              const amt = 1 + bonus;
              newIngredients[fruit] = (newIngredients[fruit] ?? 0) + amt;
              newHarvestedTreeFruits = [...newHarvestedTreeFruits, id];
              foragingXpGain = 8;
              lootMsg = `Picked ${amt} ${fruit}${amt > 1 ? 's' : ''}! 🍎`;
            }
          }

          const nextXp = prev.xp + foragingXpGain;
          setMessage(lootMsg);
          return {
            ...prev,
            timeOfDay: nextTime,
            foragingTimer: null,
            foragingTarget: null,
            ingredients: newIngredients,
            forestMushrooms: newForestMushrooms,
            forestBushes: newForestBushes,
            harvestedTreeFruits: newHarvestedTreeFruits,
            xp: nextXp,
            level: calculateLevel(nextXp),
            skills: { ...prev.skills, foraging: prev.skills.foraging + foragingXpGain },
            attributes: {
              ...prev.attributes,
              perception: (prev.attributes?.perception ?? 0) + foragingXpGain * 0.5,
              endurance:  (prev.attributes?.endurance  ?? 0) + 0.005,
            },
            gardenPlants: nextGardenPlants,
            forestTrees: nextForestTrees,
            dailyMarketItem: nextDailyMarketItem,
            dailyShopItem: nextDailyShopItem,
            lastMarketUpdate: nextLastMarketUpdate,
            inventorySize: nextInventorySize,
            stamina: nextStamina,
            pets: nextPets,
            bowlStates: nextBowlStates,
            fishingSpots: nextFishingSpots,
            forestDeer: nextForestDeer,
          };
        }

        // Auto-finish hunting
        if (prev.huntingTimer === 1) {
          const venison = 1 + Math.floor(Math.random() * 2); // 1 or 2 venison
          setMessage(`Got ${venison} venison! 🦌`);
          const nextXp = prev.xp + 8;
          return {
            ...prev,
            timeOfDay: nextTime,
            huntingTimer: null,
            activeDeer: null,
            forestDeer: nextForestDeer.filter(d => d.id !== prev.activeDeer),
            ingredients: { ...prev.ingredients, venison: (prev.ingredients.venison ?? 0) + venison },
            xp: nextXp,
            level: calculateLevel(nextXp),
            gardenPlants: nextGardenPlants,
            forestTrees: nextForestTrees,
            dailyMarketItem: nextDailyMarketItem,
            dailyShopItem: nextDailyShopItem,
            lastMarketUpdate: nextLastMarketUpdate,
            inventorySize: nextInventorySize,
            stamina: nextStamina,
            pets: nextPets,
            bowlStates: nextBowlStates,
            fishingSpots: nextFishingSpots,
          };
        }

        // Auto-finish exploration
        if (prev.explorationTimer === 1) {
          const loot = generateExplorationLoot(prev.explorationRations);
          const mergedIngredients = { ...prev.ingredients };
          for (const [k, v] of Object.entries(loot.ingredients)) {
            mergedIngredients[k] = (mergedIngredients[k] ?? 0) + v;
          }
          const mergedSeeds = { ...prev.seeds };
          for (const [k, v] of Object.entries(loot.seeds)) {
            mergedSeeds[k] = (mergedSeeds[k] ?? 0) + v;
          }
          const ingList = Object.entries(loot.ingredients)
            .map(([k, v]) => `${v}x ${k}`)
            .join(', ');
          const seedList = Object.entries(loot.seeds)
            .map(([k, v]) => `${v}x ${k} seeds`)
            .join(', ');
          const parts: string[] = [];
          if (ingList) parts.push(ingList);
          if (loot.wood > 0) parts.push(`${loot.wood} wood`);
          if (loot.currency > 0) parts.push(`${loot.currency} coins`);
          if (seedList) parts.push(seedList);
          setMessage(`Back from exploration! Found: ${parts.join(', ')}.`);
          const nextXp = prev.xp + prev.explorationRations * 5;
          return {
            ...prev,
            timeOfDay: nextTime,
            explorationTimer: null,
            explorationRations: 0,
            ingredients: mergedIngredients,
            seeds: mergedSeeds,
            wood: prev.wood + loot.wood,
            currency: prev.currency + loot.currency,
            xp: nextXp,
            level: calculateLevel(nextXp),
            gardenPlants: nextGardenPlants,
            forestTrees: nextForestTrees,
            dailyMarketItem: nextDailyMarketItem,
            dailyShopItem: nextDailyShopItem,
            lastMarketUpdate: nextLastMarketUpdate,
            inventorySize: nextInventorySize,
            stamina: nextStamina,
            pets: nextPets,
            bowlStates: nextBowlStates,
            fishingSpots: nextFishingSpots,
          };
        }

        return {
          ...prev,
          timeOfDay: nextTime,
          workTimer: nextWorkTimer,
          fishingTimer: nextFishingTimer,
          explorationTimer: nextExplorationTimer,
          foragingTimer: nextForagingTimer,
          gardenPlants: nextGardenPlants,
          forestTrees: nextForestTrees,
          dailyMarketItem: nextDailyMarketItem,
          dailyShopItem: nextDailyShopItem,
          marketSeeds: nextMarketSeeds,
          lastMarketUpdate: nextLastMarketUpdate,
          inventorySize: nextInventorySize,
          stamina: nextStamina,
          pets: nextPets,
          bowlStates: nextBowlStates,
          fishingSpots: nextFishingSpots,
          forestDeer: nextForestDeer,
          huntingTimer: nextHuntingTimer,
          forestMushrooms: nextForestMushrooms,
          forestBushes: nextForestBushes,
          harvestedTreeFruits: nextHarvestedTreeFruits,
          level: calculateLevel(prev.xp),
          // New systems
          weather: nextWeather,
          weatherTimer: resetWeatherTimer,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-save: Firebase (debounced 5 s) with localStorage as fallback
  useEffect(() => {
    if (screen !== 'game') return;

    // Always keep a local copy as an offline/teacher-preview fallback
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    setHasSave(true);

    // Firebase save — debounce so we don't write on every keypress
    if (!updateStudentData) return;
    const timer = setTimeout(async () => {
      try {
        await updateStudentData({
          [FIREBASE_SAVE_KEY]: state,
          cozyCottageLastPlayed: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[CozyCottage] Firebase save failed:', err);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [state, screen, updateStudentData]);

  useEffect(() => {
    if (state.workTimer === 0) {
      setMessage("Work finished! Earned 200 coins.");
    }
  }, [state.workTimer]);

  const goToWork = () => {
    if (state.workTimer !== null) return;
    const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    if (state.lastWorkDay === currentDay) {
      setMessage("You've already worked today! Rest up for tomorrow.");
      return;
    }
    if (state.stamina < STAMINA_WORK_COST) {
      setMessage("Too tired to work!");
      return;
    }
    setState(prev => ({ 
      ...prev, 
      workTimer: 30,
      lastWorkDay: currentDay,
      stamina: prev.stamina - STAMINA_WORK_COST,
      skills: { ...prev.skills, strength: prev.skills.strength + 3 }
    }));
    setMessage("Off to work! See you in 30 seconds.");
  };

  const buyPet = (petId: string) => {
    const petData = PET_CATALOG.find(p => p.id === petId);
    if (!petData) return;
    if (state.currency >= petData.price) {
      const newPet: Pet = {
        id: `pet-${Date.now()}`,
        name: petData.name,
        type: petData.type as any,
        x: 2,
        y: 2,
        hunger: 100,
        thirst: 100,
        health: 100,
        lastMove: Date.now()
      };
      setState(prev => ({
        ...prev,
        currency: prev.currency - petData.price,
        pets: [...prev.pets, newPet]
      }));
      setMessage(`Welcome home, ${petData.name}!`);
    } else {
      setMessage("Not enough coins for a pet!");
    }
  };

  const fillBowl = (furnitureId: string) => {
    const f = state.placedFurniture.find(p => p.id === furnitureId);
    if (!f) return;
    const item = FURNITURE_CATALOG.find(cat => cat.id === f.furnitureId);
    if (!item) return;

    if (item.type === 'pet_bowl') {
      if (state.petFood <= 0) {
        setMessage("You need pet food! Buy some at the market.");
        return;
      }
      setState(prev => {
        const existing = prev.bowlStates.find(b => b.furnitureId === furnitureId);
        if (existing) {
          return {
            ...prev,
            petFood: prev.petFood - 1,
            bowlStates: prev.bowlStates.map(b => b.furnitureId === furnitureId ? { ...b, amount: 100 } : b)
          };
        }
        return {
          ...prev,
          petFood: prev.petFood - 1,
          bowlStates: [...prev.bowlStates, { furnitureId, type: 'food', amount: 100 }]
        };
      });
      setMessage("Filled the food bowl!");
    } else if (item.type === 'water_bowl') {
      setState(prev => {
        const existing = prev.bowlStates.find(b => b.furnitureId === furnitureId);
        if (existing) {
          return {
            ...prev,
            bowlStates: prev.bowlStates.map(b => b.furnitureId === furnitureId ? { ...b, amount: 100 } : b)
          };
        }
        return {
          ...prev,
          bowlStates: [...prev.bowlStates, { furnitureId, type: 'water', amount: 100 }]
        };
      });
      setMessage("Filled the water bowl!");
    }
  };

  const chopTree = (treeId: string) => {
    if (!state.hasAxe) {
      setMessage("You need an Axe! Buy one from the Shop.");
      return;
    }
    if (state.stamina < STAMINA_CHOP_COST) {
      setMessage("Too tired to chop wood!");
      return;
    }

    const tree = state.forestTrees.find(t => t.id === treeId);
    if (!tree || tree.isCut) return;

    const newHealth = tree.health - 25;
    const isCut = newHealth <= 0;
    const fruit = isCut ? (TREE_FRUIT_MAP[tree.type || 'normal'] ?? null) : null;
    const fruitAmount = fruit ? Math.floor(Math.random() * 3) + 1 : 0; // 1–3 fruits

    setState(prev => {
      const nextXp = isCut ? prev.xp + 5 : prev.xp + 1;
      return {
        ...prev,
        stamina: prev.stamina - STAMINA_CHOP_COST,
        wood: isCut ? prev.wood + 5 : prev.wood,
        ingredients: fruit
          ? { ...prev.ingredients, [fruit]: (prev.ingredients[fruit] || 0) + fruitAmount }
          : prev.ingredients,
        xp: nextXp,
        level: calculateLevel(nextXp),
        skills: {
          ...prev.skills,
          strength: isCut ? prev.skills.strength + 2 : prev.skills.strength + 0.5
        },
        forestTrees: prev.forestTrees.map(t =>
          t.id === treeId ? {
            ...t,
            health: isCut ? 100 : newHealth,
            isCut,
            regrowsAt: isCut ? Date.now() + TREE_REGROW_TIME * 1000 : null
          } : t
        )
      };
    });

    if (fruit) {
      setMessage(`Timber! You got wood and ${fruitAmount} ${fruit}${fruitAmount > 1 ? 's' : ''}!`);
    } else {
      setMessage("Chop! You're gathering wood.");
    }
  };

  // ─── Foraging ─────────────────────────────────────────────────────────────
  const foragingDuration = (foragingLevel: number) =>
    Math.max(FORAGE_MIN_DURATION, FORAGE_BASE_DURATION - foragingLevel);

  const startForaging = (id: string, kind: 'mushroom' | 'bush' | 'fruit') => {
    if (state.foragingTimer !== null) { setMessage("Already foraging!"); return; }
    if (state.stamina < FORAGE_STAMINA_COST) { setMessage("Too tired to forage!"); return; }
    // Adjacency check
    let tx: number, ty: number;
    if (kind === 'mushroom') {
      const m = state.forestMushrooms.find(m => m.id === id);
      if (!m) return;
      tx = m.x; ty = m.y;
    } else if (kind === 'bush') {
      const b = state.forestBushes.find(b => b.id === id);
      if (!b) return;
      if (!b.hasBerries) { setMessage("No berries left on this bush today."); return; }
      tx = b.x; ty = b.y;
    } else {
      const t = state.forestTrees.find(t => t.id === id);
      if (!t || t.isCut) return;
      if (!TREE_FRUIT_MAP[t.type || 'normal']) { setMessage("This tree has no fruit to pick."); return; }
      if (state.harvestedTreeFruits.includes(id)) { setMessage("Already picked fruit from this tree today."); return; }
      tx = t.x; ty = t.y;
    }
    const dx = Math.abs(state.playerPosition.x - tx);
    const dy = Math.abs(state.playerPosition.y - ty);
    if (dx > 1.5 || dy > 1.5) { setMessage("Move closer first!"); return; }
    const foragingLevel = calculateLevel(state.skills.foraging);
    const duration = foragingDuration(foragingLevel);
    setState(prev => ({
      ...prev,
      foragingTimer: duration,
      foragingTarget: { id, kind },
      stamina: prev.stamina - FORAGE_STAMINA_COST,
    }));
    const msgs: Record<string, string> = { mushroom: 'Picking mushrooms...', bush: 'Gathering berries...', fruit: 'Picking fruit from the tree...' };
    setMessage(msgs[kind]);
  };

  const TREE_FRUIT_MAP: Record<string, string | null> = {
    normal: null,
    olive:  'olive',
    orange: 'orange',
    apple:  'apple',
  };

  const skipToMorning = () => {
    if (state.timeOfDay > 1900 || state.timeOfDay < 600) {
      setState(prev => ({ ...prev, timeOfDay: 600, isRelaxing: false, stamina: prev.maxStamina }));
      setMessage("Good morning! You feel refreshed.");
    } else {
      setMessage("It's too early to sleep properly.");
    }
  };

  const expandHouse = () => {
    if (state.currency >= HOUSE_EXPAND_COST && state.wood >= HOUSE_EXPAND_WOOD_COST) {
      setState(prev => ({
        ...prev,
        currency: prev.currency - HOUSE_EXPAND_COST,
        wood: prev.wood - HOUSE_EXPAND_WOOD_COST,
        houseSize: { width: prev.houseSize.width + 1, height: prev.houseSize.height + 1 },
        skills: { ...prev.skills, strength: prev.skills.strength + 20 }
      }));
      setMessage("House expanded! So much room!");
      setConfirmExpand(null);
    } else {
      setMessage(`Need ${HOUSE_EXPAND_COST} coins and ${HOUSE_EXPAND_WOOD_COST} wood to expand!`);
    }
  };

  const expandGarden = () => {
    if (state.currency >= GARDEN_EXPAND_COST && state.wood >= GARDEN_EXPAND_WOOD_COST) {
      setState(prev => ({
        ...prev,
        currency: prev.currency - GARDEN_EXPAND_COST,
        wood: prev.wood - GARDEN_EXPAND_WOOD_COST,
        gardenSize: { width: prev.gardenSize.width + 1, height: prev.gardenSize.height + 1 },
        skills: { ...prev.skills, strength: prev.skills.strength + 20 }
      }));
      setMessage("Garden expanded! More space for crops!");
      setConfirmExpand(null);
    } else {
      setMessage(`Need ${GARDEN_EXPAND_COST} coins and ${GARDEN_EXPAND_WOOD_COST} wood to expand!`);
    }
  };

  const checkRelax = () => {
    if (state.playerLocation !== 'inside') {
      setMessage("It's better to relax inside.");
      return;
    }
    const onFurniture = state.placedFurniture.some(f => {
      if (f.location !== 'inside') return false;
      const item = FURNITURE_CATALOG.find(cat => cat.id === f.furnitureId);
      if (!item) return false;
      return (
        state.playerPosition.x >= f.x && 
        state.playerPosition.x < f.x + item.width &&
        state.playerPosition.y >= f.y && 
        state.playerPosition.y < f.y + item.height
      );
    });

    if (onFurniture) {
      setState(prev => ({ ...prev, isRelaxing: true }));
      setMessage("Ah, so relaxing...");
    } else {
      setMessage("Nothing to sit on here.");
    }
  };

  const startCooking = () => {
    const nearStove = state.placedFurniture.some(f => {
      const item = FURNITURE_CATALOG.find(cat => cat.id === f.furnitureId);
      return item?.type === 'stove' && 
        Math.abs(f.x - state.playerPosition.x) <= 1 && 
        Math.abs(f.y - state.playerPosition.y) <= 1;
    });

    if (nearStove) {
      setMode('cook');
    } else {
      setMessage("You need to be near a stove to cook!");
    }
  };


  const handlePlacementMove = (dx: number, dy: number) => {
    if (mode !== 'decorate' || !selectedFurniture) return;
    setPlacementPos(prev => {
      let maxX = 29;
      let maxY = 19;
      
      if (state.playerLocation === 'inside') {
        maxX = state.houseSize.width;
        maxY = state.houseSize.height;
      } else if (state.playerLocation === 'outside') {
        maxX = state.gardenSize.width;
        maxY = state.gardenSize.height;
      } else if (state.playerLocation === 'pond') {
        maxX = POND_WIDTH;
        maxY = POND_HEIGHT;
      }

      const newX = Math.max(0, Math.min(maxX - selectedFurniture.width, prev.x + dx));
      const newY = Math.max(0, Math.min(maxY - selectedFurniture.height, prev.y + dy));
      return { x: newX, y: newY };
    });
  };

  // ── Key tracking (held keys) ───────────────────────────────────────────────
  const pressedKeys = useRef(new Set<string>());
  const modeRef = useRef(mode);
  const checkRelaxRef = useRef(checkRelax);
  const playerFacingRef = useRef<'right' | 'left' | 'up' | 'down'>('down');
  // Kept for legacy; derived from playerFacing
  const playerFacingLeftRef = useRef(playerFacingLeft);
  const worldRef = useRef<HTMLDivElement>(null); // isometric world container
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { checkRelaxRef.current = checkRelax; }, [checkRelax]);
  useEffect(() => { playerFacingRef.current = playerFacing; playerFacingLeftRef.current = playerFacingLeft; }, [playerFacing, playerFacingLeft]);

  // Global key-up / key-down (one-shot actions + tracking)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
      if (modeRef.current === 'walk') {
        if (e.key === 'Enter' || e.key === ' ') checkRelaxRef.current();
      } else if (modeRef.current === 'decorate') {
        if (e.key === 'r') setPlacementFlipped(prev => !prev);
        if (e.key === 'Escape') { setMode('walk'); setSelectedFurniture(null); }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { pressedKeys.current.delete(e.key); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // ── RAF smooth walk movement ───────────────────────────────────────────────
  const WALK_SPEED = 0.055; // grid units per frame (~3.3 tiles/sec)
  const playerSpriteRef = useRef<HTMLDivElement>(null); // for direct DOM walking class

  useEffect(() => {
    if (mode !== 'walk') return;
    let rafId: number;
    const tick = () => {
      const keys = pressedKeys.current;
      let vx = 0, vy = 0;
      if (keys.has('ArrowLeft')  || keys.has('a')) vx -= 1;
      if (keys.has('ArrowRight') || keys.has('d')) vx += 1;
      if (keys.has('ArrowUp')    || keys.has('w')) vy -= 1;
      if (keys.has('ArrowDown')  || keys.has('s')) vy += 1;

      const moving = vx !== 0 || vy !== 0;

      // Toggle walking animation class directly on DOM (no re-render needed)
      if (playerSpriteRef.current) {
        playerSpriteRef.current.classList.toggle('player-walking', moving);
      }

      if (moving) {
        // Normalize diagonal
        if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; }

        // 4-direction facing: horizontal dominates unless purely vertical
        let newFacing: 'right' | 'left' | 'up' | 'down';
        if (Math.abs(vx) >= Math.abs(vy)) {
          newFacing = vx > 0 ? 'right' : 'left';
        } else {
          newFacing = vy > 0 ? 'down' : 'up';
        }
        if (newFacing !== playerFacingRef.current) {
          setPlayerFacing(newFacing);
        }

        setState(prev => {
          let maxX = prev.houseSize.width  - 1;
          let maxY = prev.houseSize.height - 1;
          if (prev.playerLocation === 'outside') { maxX = prev.gardenSize.width - 1; maxY = prev.gardenSize.height - 1; }
          else if (prev.playerLocation === 'pond')   { maxX = POND_WIDTH - 1;   maxY = POND_HEIGHT - 1; }
          else if (prev.playerLocation === 'forest') { maxX = FOREST_WIDTH - 1; maxY = FOREST_HEIGHT - 1; }
          const nx = Math.max(0, Math.min(maxX, prev.playerPosition.x + vx * WALK_SPEED));
          const ny = Math.max(0, Math.min(maxY, prev.playerPosition.y + vy * WALK_SPEED));
          if (Math.abs(nx - prev.playerPosition.x) < 0.0001 && Math.abs(ny - prev.playerPosition.y) < 0.0001) return prev;
          return { ...prev, playerPosition: { x: nx, y: ny }, isRelaxing: false };
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [mode]);

  // Decorate mode: 150ms step interval (keyboard nudge for fine-tuning)
  useEffect(() => {
    if (mode !== 'decorate') return;
    const interval = setInterval(() => {
      const keys = pressedKeys.current;
      if (keys.has('ArrowLeft')  || keys.has('a')) handlePlacementMove(-1, 0);
      else if (keys.has('ArrowRight') || keys.has('d')) handlePlacementMove(1, 0);
      if (keys.has('ArrowUp')    || keys.has('w')) handlePlacementMove(0, -1);
      else if (keys.has('ArrowDown')  || keys.has('s')) handlePlacementMove(0, 1);
    }, 150);
    return () => clearInterval(interval);
  }, [mode, handlePlacementMove]);

  // Scroll-to-rotate in decorate mode (non-passive so we can preventDefault)
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (modeRef.current !== 'decorate') return;
      e.preventDefault();
      setPlacementRotation(prev => {
        const order: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
        const idx = order.indexOf(prev);
        return e.deltaY > 0 ? order[(idx + 1) % 4] : order[(idx + 3) % 4];
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Isometric world dimensions derived from current location (declared here so
  // screenToGrid and handleWorldMouseMove can reference them without TDZ errors)
  const curGridW = state.playerLocation === 'inside'  ? state.houseSize.width
                 : state.playerLocation === 'outside' ? state.gardenSize.width
                 : state.playerLocation === 'forest'  ? FOREST_WIDTH
                 : state.playerLocation === 'pond'    ? POND_WIDTH
                 : HOUSE_INITIAL_WIDTH;
  const curGridH = state.playerLocation === 'inside'  ? state.houseSize.height
                 : state.playerLocation === 'outside' ? state.gardenSize.height
                 : state.playerLocation === 'forest'  ? FOREST_HEIGHT
                 : state.playerLocation === 'pond'    ? POND_HEIGHT
                 : HOUSE_INITIAL_HEIGHT;

  // Inverse isometric transform: screen pixel → grid cell
  const screenToGrid = useCallback((mx: number, my: number): { x: number; y: number } => {
    const a = (mx - curGridH * (ISO_TILE_W / 2)) / (ISO_TILE_W / 2);
    const b = (my - ISO_SPRITE_RISE) / (ISO_TILE_H / 2);
    return { x: Math.floor((a + b) / 2), y: Math.floor((b - a) / 2) };
  }, [curGridH]);

  // Mouse move over world → update placement ghost position
  const handleWorldMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'decorate' || !selectedFurniture || !worldRef.current) return;
    const rect = worldRef.current.getBoundingClientRect();
    const { x: gx, y: gy } = screenToGrid(e.clientX - rect.left, e.clientY - rect.top);
    let maxX = curGridW, maxY = curGridH;
    if (state.playerLocation === 'inside')  { maxX = state.houseSize.width;  maxY = state.houseSize.height; }
    if (state.playerLocation === 'outside') { maxX = state.gardenSize.width; maxY = state.gardenSize.height; }
    setPlacementPos({
      x: Math.max(0, Math.min(maxX - selectedFurniture.width,  gx)),
      y: Math.max(0, Math.min(maxY - selectedFurniture.height, gy)),
    });
  }, [mode, selectedFurniture, curGridW, curGridH, screenToGrid, state.playerLocation, state.houseSize, state.gardenSize]);

  const buyFurniture = (item: FurnitureItem, colorFilter?: string) => {
    if (state.currency >= item.price) {
      if (state.inventory.length >= state.inventorySize) {
        setMessage("Inventory full!");
        return;
      }
      setState(prev => ({
        ...prev,
        currency: prev.currency - item.price,
        inventory: [...prev.inventory, { id: item.id, colorFilter }],
        skills: { ...prev.skills, bartering: prev.skills.bartering + 5 }
      }));
      setMessage(`Bought ${item.name}!`);
    } else {
      setMessage("Not enough coins!");
    }
  };

  const startPlacement = (slot: { id: string; colorFilter?: string }) => {
    const item = FURNITURE_CATALOG.find(f => f.id === slot.id);
    if (item) {
      setSelectedFurniture(item);
      setPlacementColorFilter(slot.colorFilter);
      setMode('decorate');
      setPlacementPos({ x: 2, y: 2 });
      setPlacementFlipped(false);
    }
  };

  const placeFurniture = () => {
    if (!selectedFurniture) return;

    if (state.playerLocation === 'pond') {
      setMessage("You can't place furniture in the pond!");
      return;
    }

    const OUTDOOR_TYPES = new Set(['garden_patch']);
    if (OUTDOOR_TYPES.has(selectedFurniture.type) && state.playerLocation !== 'outside') {
      setMessage("This item must be placed in the garden!");
      return;
    }
    if (!OUTDOOR_TYPES.has(selectedFurniture.type) && state.playerLocation !== 'inside') {
      setMessage("This furniture belongs inside the house!");
      return;
    }

    const newPlaced: PlacedFurniture = {
      id: `f-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      furnitureId: selectedFurniture.id,
      x: placementPos.x,
      y: placementPos.y,
      rotation: placementRotation,
      flipped: placementFlipped,
      location: state.playerLocation as 'inside' | 'outside',
      colorFilter: placementColorFilter,
    };

    setState(prev => {
      const newInventory = [...prev.inventory];
      // Remove the first matching slot (preserves order for duplicates)
      const index = newInventory.findIndex(s => s.id === selectedFurniture.id);
      if (index > -1) newInventory.splice(index, 1);
      return {
        ...prev,
        placedFurniture: [...prev.placedFurniture, newPlaced],
        inventory: newInventory,
        // Building XP for placing furniture
        skills: { ...prev.skills, building: prev.skills.building + 3 },
      };
    });

    setMode('walk');
    setSelectedFurniture(null);
    setPlacementColorFilter(undefined);
    setMessage(`Placed ${selectedFurniture.name}`);
  };

  // Handle Enter/Space in decorate mode (placed after placeFurniture to avoid forward reference)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (mode === 'decorate' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        placeFurniture();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mode, placeFurniture]);

  const removeFurniture = (id: string) => {
    const placed = state.placedFurniture.find(f => f.id === id);
    if (!placed) return;

    setState(prev => ({
      ...prev,
      placedFurniture: prev.placedFurniture.filter(f => f.id !== id),
      inventory: [...prev.inventory, { id: placed.furnitureId, colorFilter: placed.colorFilter }],
      gardenPlants: prev.gardenPlants.filter(p => p.furnitureId !== id) // Remove plants on patches
    }));
    setMessage("Item returned to inventory.");
  };

  const comfortLevel = state.placedFurniture
    .filter(f => f.location === 'inside')
    .reduce((acc, f) => {
      const furniture = FURNITURE_CATALOG.find(item => item.id === f.furnitureId);
      return acc + (furniture?.comfort || 0);
    }, 0);

  const worldDims = isoWorldDimensions(curGridW, curGridH);

  // ── Start Menu ───────────────────────────────────────────────────────────
  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, #d4eac8 0%, #b8d4a0 40%, #8ab878 100%)' }}>
        {/* Decorative trees */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <img src="/games/cozy-cottage/Forest/tree.svg" className="absolute opacity-30" style={{ width: 180, bottom: 0, left: '5%' }} draggable={false} />
          <img src="/games/cozy-cottage/Forest/apple-tree.svg" className="absolute opacity-25" style={{ width: 140, bottom: 0, left: '18%' }} draggable={false} />
          <img src="/games/cozy-cottage/Forest/tree.svg" className="absolute opacity-20" style={{ width: 220, bottom: 0, right: '8%', transform: 'scaleX(-1)' }} draggable={false} />
          <img src="/games/cozy-cottage/Forest/olive-tree.svg" className="absolute opacity-25" style={{ width: 160, bottom: 0, right: '22%' }} draggable={false} />
        </div>

        {/* Title card */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12 relative z-10"
        >
          <div className="text-7xl mb-3">🏡</div>
          <h1 className="text-5xl font-bold text-white drop-shadow-lg tracking-tight mb-2"
            style={{ textShadow: '0 2px 12px rgba(80,120,60,0.5)' }}>
            Cozy Cottage
          </h1>
          <p className="text-white/80 text-lg font-medium">Your peaceful little life awaits</p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
          className="flex flex-col gap-4 relative z-10 w-64"
        >
          <button
            onClick={() => setScreen('character-select')}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-white text-green-800 shadow-xl hover:bg-green-50 active:scale-95 transition-all border-2 border-white/60 backdrop-blur"
          >
            ✨ New Game
          </button>
          <button
            onClick={continueGame}
            disabled={!hasSave}
            className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all border-2 ${
              hasSave
                ? 'bg-green-700 text-white hover:bg-green-600 border-green-500'
                : 'bg-white/30 text-white/40 border-white/20 cursor-not-allowed'
            }`}
          >
            ▶ Continue
          </button>
          {!hasSave && (
            <p className="text-white/50 text-xs text-center -mt-2">No save found</p>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Character Select ──────────────────────────────────────────────────────
  if (screen === 'character-select') {
    const characters = [
      { id: 'man',   label: 'He / Him',   src: '/games/cozy-cottage/Player/man.svg' },
      { id: 'woman', label: 'She / Her',  src: '/games/cozy-cottage/Player/woman1.png' },
    ] as const;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 60% 40%, #d4eac8 0%, #b8d4a0 40%, #8ab878 100%)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <button
            onClick={() => setScreen('menu')}
            className="self-start mb-6 text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold text-white drop-shadow mb-2">Choose your character</h2>
          <p className="text-white/70 mb-10 text-sm">You can't change this later</p>

          <div className="flex gap-8">
            {characters.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => startNewGame(c.id)}
                className="flex flex-col items-center gap-4 bg-white/20 backdrop-blur-md border-2 border-white/40 rounded-3xl p-8 w-48 hover:bg-white/30 hover:border-white/70 transition-all shadow-xl"
              >
                <div className="w-28 h-28 bg-white/30 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                  <img src={c.src} className="w-20 h-20 object-contain drop-shadow" draggable={false} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-lg">{c.label}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      {/* Time Overlay */}
      <div 
        className="fixed inset-0 z-[60] time-overlay pointer-events-none" 
        style={{ backgroundColor: getTimeColor() }} 
      />

      {/* HUD — compact strip for mobile/iPad */}
      <div className="fixed top-2 left-2 right-2 z-[70] flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Main stats pill */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-cozy-accent/20 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Coins className="text-yellow-500 w-4 h-4" />
              <span className="font-bold text-cozy-text text-sm">{state.currency}</span>
            </div>
            <div className="w-px h-3 bg-cozy-text/10" />
            <div className="flex items-center gap-1.5">
              <Trees className="text-amber-700 w-4 h-4" />
              <span className="font-bold text-cozy-text text-sm">{state.wood}</span>
            </div>
            <div className="w-px h-3 bg-cozy-text/10" />
            <div className="flex items-center gap-1.5">
              <Backpack className="text-orange-600 w-4 h-4" />
              <span className="font-bold text-cozy-text text-sm">{state.rations}</span>
            </div>
            <div className="w-px h-3 bg-cozy-text/10" />
            <div className="flex items-center gap-1.5 text-cozy-text/60">
              {state.timeOfDay > 2000 || state.timeOfDay < 600 ? <Moon size={14} /> : <Sun size={14} />}
              <span className="font-mono text-xs font-bold">{formatTime(state.timeOfDay)}</span>
            </div>
            <div className="w-px h-3 bg-cozy-text/10" />
            <div className="flex items-center gap-1 text-cozy-accent">
              <Plus size={13} />
              <span className="font-bold text-xs">Lv.{calculateLevel(state.xp)}</span>
            </div>
            {/* Stamina inline */}
            <div className="w-px h-3 bg-cozy-text/10" />
            <Zap className="text-blue-500 w-3.5 h-3.5" />
            <div className="w-20 h-1.5 bg-cozy-text/10 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(state.stamina / state.maxStamina) * 100}%` }}
                className={`h-full ${state.stamina < 20 ? 'bg-red-500' : 'bg-blue-400'}`}
              />
            </div>
            {comfortLevel > 0 && (
              <div className="flex items-center gap-1 text-pink-500" title="Comfort Level">
                <Sparkles size={12} />
                <span className="text-xs font-bold">{comfortLevel}</span>
              </div>
            )}
          </div>

          {/* Weather indicator */}
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border border-cozy-accent/20 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
            <span className="text-base">
              {state.weather === 'sunny'  ? '☀️'
              : state.weather === 'cloudy' ? '☁️'
              : state.weather === 'rainy'  ? '🌧️'
              : '⛈️'}
            </span>
            <span className="capitalize">{state.weather ?? 'Sunny'}</span>
          </div>
          
          {state.workTimer !== null && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-cozy-text text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3"
            >
              <Briefcase size={16} className="animate-pulse" />
              <span className="text-sm font-bold">Working... {state.workTimer}s</span>
            </motion.div>
          )}

          {state.fishingTimer !== null && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3"
            >
              <ArrowLeftRight size={16} className="animate-bounce" />
              <span className="text-sm font-bold">Fishing... {state.fishingTimer}s</span>
            </motion.div>
          )}

          {state.huntingTimer !== null && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-amber-700 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3"
            >
              <img src="/games/cozy-cottage/Forest/hunting-bow.svg" width={16} height={16} className="object-contain invert animate-pulse" draggable={false} />
              <span className="text-sm font-bold">Hunting... {state.huntingTimer}s</span>
            </motion.div>
          )}

          {state.explorationTimer !== null && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-orange-500 text-white px-4 py-2 rounded-2xl shadow-lg flex items-center gap-3"
            >
              <Compass size={16} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-bold">Exploring... {state.explorationTimer}s</span>
            </motion.div>
          )}


          {state.pets.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 pt-6 border-t border-cozy-text/5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-cozy-text/40 px-2">Pet Status</h3>
              <div className="flex flex-col gap-2">
                {state.pets.map(pet => (
                  <div key={pet.id} className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-sm border border-white/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-cozy-accent/10 flex items-center justify-center">
                          {PET_SVG_MAP[pet.type]
                            ? <img src={PET_SVG_MAP[pet.type]} width={14} height={14} draggable={false} className="object-contain" />
                            : <PawPrint size={12} className="text-cozy-accent" />
                          }
                        </div>
                        <span className="text-[10px] font-bold text-cozy-text">{pet.name}</span>
                      </div>
                      <span className="text-[8px] font-bold text-green-500">{Math.round(pet.health)}% HP</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[8px] font-bold text-cozy-text/60">
                        <span>Hunger</span>
                        <span>{Math.round(pet.hunger)}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 transition-all duration-500" style={{ width: `${pet.hunger}%` }} />
                      </div>
                      
                      <div className="flex justify-between items-center text-[8px] font-bold text-cozy-text/60">
                        <span>Thirst</span>
                        <span>{Math.round(pet.thirst)}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${pet.thirst}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Toast Notifications - Top Middle */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <AnimatePresence>
          {message && (
            <motion.div 
              key="hud-message"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-cozy-accent text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm border-2 border-white/20 backdrop-blur-md"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Touch D-Pad — only visible in walk mode, bottom-right */}
      {mode === 'walk' && (
        <div className="fixed bottom-24 right-3 z-[70] select-none touch-none" style={{ userSelect: 'none' }}>
          <div className="relative w-32 h-32">
            {/* Up */}
            <button
              onPointerDown={() => pressedKeys.current.add('ArrowUp')}
              onPointerUp={() => pressedKeys.current.delete('ArrowUp')}
              onPointerLeave={() => pressedKeys.current.delete('ArrowUp')}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-xl shadow-lg border border-cozy-accent/20 flex items-center justify-center text-cozy-text active:bg-cozy-accent active:text-white transition-colors"
              aria-label="Move up"
            >▲</button>
            {/* Down */}
            <button
              onPointerDown={() => pressedKeys.current.add('ArrowDown')}
              onPointerUp={() => pressedKeys.current.delete('ArrowDown')}
              onPointerLeave={() => pressedKeys.current.delete('ArrowDown')}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-xl shadow-lg border border-cozy-accent/20 flex items-center justify-center text-cozy-text active:bg-cozy-accent active:text-white transition-colors"
              aria-label="Move down"
            >▼</button>
            {/* Left */}
            <button
              onPointerDown={() => pressedKeys.current.add('ArrowLeft')}
              onPointerUp={() => pressedKeys.current.delete('ArrowLeft')}
              onPointerLeave={() => pressedKeys.current.delete('ArrowLeft')}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-xl shadow-lg border border-cozy-accent/20 flex items-center justify-center text-cozy-text active:bg-cozy-accent active:text-white transition-colors"
              aria-label="Move left"
            >◀</button>
            {/* Right */}
            <button
              onPointerDown={() => pressedKeys.current.add('ArrowRight')}
              onPointerUp={() => pressedKeys.current.delete('ArrowRight')}
              onPointerLeave={() => pressedKeys.current.delete('ArrowRight')}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-md rounded-xl shadow-lg border border-cozy-accent/20 flex items-center justify-center text-cozy-text active:bg-cozy-accent active:text-white transition-colors"
              aria-label="Move right"
            >▶</button>
            {/* Centre dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/40 backdrop-blur-md rounded-xl border border-cozy-accent/10" />
          </div>
        </div>
      )}

      {/* Bottom-left: Guide button */}
      <div className="fixed bottom-6 left-3 z-[70]">
        <button
          onClick={() => setShowGuide(true)}
          className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border-2 border-cozy-accent/20 transition-all active:scale-90 hover:bg-cozy-accent hover:text-white group"
          title="Guide"
        >
          <HelpCircle size={22} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex items-center justify-center p-1 overflow-auto" style={{ background: 'radial-gradient(ellipse at center, #f0e6d3 0%, #dfd0b8 100%)' }}>
        {/* Isometric world container — isolation:isolate keeps all internal
            z-indices scoped here so they never bleed over fixed-position modals */}
        <div
          ref={worldRef}
          className="relative"
          style={{ width: worldDims.width, height: worldDims.height, isolation: 'isolate', cursor: mode === 'decorate' ? 'crosshair' : 'default' }}
          onMouseMove={handleWorldMouseMove}
          onClick={mode === 'decorate' && selectedFurniture ? placeFurniture : undefined}
        >
          {/* ── Isometric floor tiles ── */}
          {Array.from({ length: curGridW * curGridH }, (_, i) => {
            const gx = i % curGridW;
            const gy = Math.floor(i / curGridW);
            const checker = (gx + gy) % 2 === 0;
            const pos = toIso(gx, gy, curGridH);
            const tileColors: Record<string, [string, string]> = {
              inside:  ['#c49a6c', '#b88852'],
              outside: ['#7aba6a', '#6aaa58'],
              forest:  ['#4a7a38', '#3d6a2c'],
              pond:    ['#4e8ec8', '#3d7eb8'],
            };
            const [c1, c2] = tileColors[state.playerLocation] ?? tileColors.inside;
            return (
              <div
                key={`tile-${gx}-${gy}`}
                className="absolute pointer-events-none"
                style={{
                  left: pos.left - ISO_TILE_W / 2,
                  top:  pos.top,
                  width: ISO_TILE_W,
                  height: ISO_TILE_H,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  backgroundColor: checker ? c1 : c2,
                }}
              />
            );
          })}

          {/* ── House walls (back two edges: right face gy=0, left face gx=0) ── */}
          {state.playerLocation === 'inside' && (() => {
            // WALL_H = ISO_SPRITE_RISE so the wall top sits exactly at y=0
            // (the top of the world container), making walls reach the corner.
            const WALL_H = ISO_SPRITE_RISE;      // 60px
            const W2 = ISO_TILE_W / 2;           // 40
            const H2 = ISO_TILE_H / 2;           // 20
            const wallRight = '#ecdcbf';
            const wallLeft  = '#d4c0a0';
            const wallEdge  = '#b89870';
            // zIndex: 1 — always above floor tiles, always below furniture/player
            const WALL_Z = 1;
            const segments: React.ReactNode[] = [];

            // ── Back-right wall: gy=0, gx = 0 … gridW-1 ──
            for (let gx = 0; gx < curGridW; gx++) {
              const pos = toIso(gx, 0, curGridH);
              segments.push(
                <svg key={`wall-r-${gx}`} style={{
                  position: 'absolute', pointerEvents: 'none',
                  left: pos.left, top: pos.top - WALL_H,
                  width: W2, height: WALL_H + H2,
                  overflow: 'visible', zIndex: WALL_Z,
                }}>
                  <polygon points={`0,${WALL_H} ${W2},${WALL_H + H2} ${W2},${H2} 0,0`}
                    fill={wallRight} stroke={wallEdge} strokeWidth="1" />
                  {[0.33, 0.66].map(t => (
                    <line key={t} x1={0} y1={WALL_H * t} x2={W2} y2={WALL_H * t + H2}
                      stroke={wallEdge} strokeWidth="0.8" opacity={0.5} />
                  ))}
                </svg>
              );
            }

            // ── Back-left wall: gx=0, gy = 0 … gridH-1 ──
            for (let gy = 0; gy < curGridH; gy++) {
              const pos = toIso(0, gy, curGridH);
              segments.push(
                <svg key={`wall-l-${gy}`} style={{
                  position: 'absolute', pointerEvents: 'none',
                  left: pos.left - W2, top: pos.top - WALL_H,
                  width: W2, height: WALL_H + H2,
                  overflow: 'visible', zIndex: WALL_Z,
                }}>
                  <polygon points={`${W2},${WALL_H} 0,${WALL_H + H2} 0,${H2} ${W2},0`}
                    fill={wallLeft} stroke={wallEdge} strokeWidth="1" />
                  {[0.33, 0.66].map(t => (
                    <line key={t} x1={W2} y1={WALL_H * t} x2={0} y2={WALL_H * t + H2}
                      stroke={wallEdge} strokeWidth="0.8" opacity={0.5} />
                  ))}
                </svg>
              );
            }

            return segments;
          })()}

          {/* ── Garden fence (back two edges: gy=0 row and gx=0 column) ── */}
          {state.playerLocation === 'outside' && (() => {
            // FENCE_H: total pixel height of each fence segment (rise + tile edge drop).
            const FENCE_H = ISO_SPRITE_RISE + ISO_TILE_H; // 100px
            const FENCE_Z = 1; // above floor, below all furniture/player
            const segments: React.ReactNode[] = [];

            // Each container is SEG_W (40px) wide, aligned to the tile's top vertex.
            // The fence.svg has ~18% whitespace on each side, so we render the image
            // at FENCE_IMG_W (≈61px) and centre it inside the 40px clip container.
            // This makes fence posts appear right at tile-junction points.
            const SEG_W = ISO_TILE_W / 2;           // 40px — one tile edge stride
            const FENCE_IMG_W = Math.round(SEG_W / 0.652); // ≈61px — fills content to 40px
            const FENCE_IMG_OFFSET = (FENCE_IMG_W - SEG_W) / 2; // ≈10.5px — left shift

            // Right edge (gy=0): containers run from top vertex of (0,0) rightward.
            for (let gx = 0; gx < curGridW; gx++) {
              const pos = toIso(gx, 0, curGridH);
              segments.push(
                <div key={`fence-tr-${gx}`} style={{
                  position: 'absolute',
                  left: pos.left,
                  top:  pos.top - ISO_SPRITE_RISE,
                  width: SEG_W, height: FENCE_H,
                  overflow: 'hidden',
                  zIndex: FENCE_Z, pointerEvents: 'none',
                }}>
                  <img src="/games/cozy-cottage/Farm/fence.svg" draggable={false}
                    style={{
                      position: 'absolute',
                      left: -FENCE_IMG_OFFSET,
                      top: 0,
                      width: FENCE_IMG_W, height: FENCE_H,
                      objectFit: 'fill',
                    }}
                  />
                </div>
              );
            }
            // Left edge (gx=0): mirror — containers run leftward from top vertex of (0,0).
            for (let gy = 0; gy < curGridH; gy++) {
              const pos = toIso(0, gy, curGridH);
              segments.push(
                <div key={`fence-tl-${gy}`} style={{
                  position: 'absolute',
                  left: pos.left - SEG_W,
                  top:  pos.top - ISO_SPRITE_RISE,
                  width: SEG_W, height: FENCE_H,
                  overflow: 'hidden',
                  zIndex: FENCE_Z, pointerEvents: 'none',
                }}>
                  <img src="/games/cozy-cottage/Farm/fence.svg" draggable={false}
                    style={{
                      position: 'absolute',
                      left: -FENCE_IMG_OFFSET,
                      top: 0,
                      width: FENCE_IMG_W, height: FENCE_H,
                      objectFit: 'fill',
                      transform: 'scaleX(-1)',
                      transformOrigin: 'center center',
                    }}
                  />
                </div>
              );
            }
            return segments;
          })()}

          {/* ── Fishing spots (pond) ── */}
          {state.playerLocation === 'pond' && state.fishingSpots.map(spot => {
            const pos = toIso(spot.x, spot.y, curGridH);
            const sizeMap = { small: 18, medium: 26, large: 36 };
            const shadeMap = {
              light:  { fill: '#7fc8f8', stroke: '#5ab0e8', opacity: 0.72 },
              medium: { fill: '#3a8fd4', stroke: '#2070b0', opacity: 0.80 },
              dark:   { fill: '#1a4f8c', stroke: '#0f2f5c', opacity: 0.90 },
            };
            const r = sizeMap[spot.size];
            const { fill, stroke, opacity } = shadeMap[spot.shade];
            const fishingLevel = calculateLevel(state.skills.fishing);
            const canFish = fishingLevel >= spot.skillRequired;
            const dx = Math.abs(state.playerPosition.x - spot.x);
            const dy = Math.abs(state.playerPosition.y - spot.y);
            const isAdjacent = dx <= 1.5 && dy <= 1.5;
            const isActive = state.activeFishingSpot === spot.id;

            return (
              <div
                key={spot.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: pos.left - r,
                  top: pos.top - r * 0.5,
                  width: r * 2,
                  height: r,
                  zIndex: (spot.x + spot.y) * 10 + 1,
                  cursor: isAdjacent && canFish && !isActive ? 'pointer' : 'default',
                }}
                onClick={() => startFishingAtSpot(spot.id)}
                title={
                  !canFish
                    ? `Needs Fishing Lv.${spot.skillRequired}`
                    : !isAdjacent
                    ? 'Move closer to fish here'
                    : isActive
                    ? 'Fishing...'
                    : 'Click to fish!'
                }
              >
                {/* Ellipse ripple */}
                <motion.div
                  animate={isActive ? { scale: [1, 1.15, 1], opacity: [opacity, 1, opacity] } : { scale: [1, 1.06, 1] }}
                  transition={{ duration: isActive ? 1.0 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: fill,
                    border: `2px solid ${stroke}`,
                    opacity,
                    boxShadow: isActive ? `0 0 12px 4px ${fill}` : undefined,
                    filter: !canFish ? 'grayscale(0.6)' : undefined,
                  }}
                />
                {isActive && (
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute -top-6 text-white text-[10px] font-bold drop-shadow pointer-events-none"
                  >
                    🎣
                  </motion.div>
                )}
                {isAdjacent && canFish && !isActive && state.fishingTimer === null && (
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7], y: [0, -3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute -top-5 text-white text-[10px] font-bold drop-shadow pointer-events-none whitespace-nowrap bg-black/40 rounded px-1"
                  >
                    Click to fish
                  </motion.div>
                )}
              </div>
            );
          })}

          {/* ── Forest trees ── */}
          {state.playerLocation === 'forest' && state.forestTrees.map(tree => {
            const treeScale = tree.type === 'olive' ? 4 : tree.type === 'orange' ? 3.2 : tree.type === 'apple' ? 3.6 : 3.0;
            const treeW = GRID_SIZE * treeScale;
            const pos = toIso(tree.x, tree.y, curGridH);
            const hasFruit = !!TREE_FRUIT_MAP[tree.type || 'normal'];
            const alreadyPicked = state.harvestedTreeFruits?.includes(tree.id);
            // Click a tree: try forage fruit → else chop (if axe) → else message
            const handleTreeClick = () => {
              if (tree.isCut) return;
              const dx = Math.abs(state.playerPosition.x - tree.x);
              const dy = Math.abs(state.playerPosition.y - tree.y);
              if (dx > 1.5 || dy > 1.5) { setMessage("Move closer to the tree!"); return; }
              if (hasFruit && !alreadyPicked && state.foragingTimer === null) {
                startForaging(tree.id, 'fruit');
              } else if (state.hasAxe) {
                chopTree(tree.id);
              } else if (hasFruit && alreadyPicked) {
                setMessage("Already picked fruit from this tree today.");
              } else {
                setMessage("Nothing to forage — use an axe to chop.");
              }
            };
            return (
              <div
                key={tree.id}
                className="absolute"
                style={{
                  left: pos.left - treeW / 2,
                  top:  pos.top  - treeW + ISO_TILE_H / 2,
                  zIndex: (tree.x + tree.y) * 10,
                }}
              >
                {!tree.isCut ? (
                  <button onClick={handleTreeClick} className="relative flex flex-col items-center cursor-pointer">
                    <img
                      src={TREE_SVG_MAP[tree.type || 'normal']}
                      draggable={false}
                      style={{ width: treeW, height: treeW }}
                      className="drop-shadow-lg object-contain hover:brightness-110 transition-[filter]"
                    />
                    {tree.health < 100 && (
                      <div className="absolute -top-2 w-full h-1 bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${tree.health}%` }} />
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="w-8 h-4 bg-amber-900/40 rounded-full blur-sm" />
                )}
              </div>
            );
          })}

          {/* ── Forest mushrooms ── */}
          {state.playerLocation === 'forest' && (state.forestMushrooms ?? []).map(mush => {
            const mSize = 32;
            const pos = toIso(mush.x, mush.y, curGridH);
            return (
              <div
                key={mush.id}
                className="absolute"
                style={{
                  left: pos.left - mSize / 2,
                  top: pos.top - mSize + 8,
                  zIndex: (mush.x + mush.y) * 10 + 3,
                }}
              >
                <button
                  onClick={() => startForaging(mush.id, 'mushroom')}
                  className="flex flex-col items-center hover:scale-110 transition-transform"
                  title="Click to forage"
                >
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img
                      src="/games/cozy-cottage/Forest/mushroom.svg"
                      width={mSize} height={mSize}
                      draggable={false}
                      className="object-contain drop-shadow"
                      onError={e => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const sib = img.nextElementSibling as HTMLElement | null;
                        if (sib) sib.style.removeProperty('display');
                      }}
                    />
                    <span style={{ display: 'none', fontSize: mSize * 0.75, lineHeight: 1 }}>🍄</span>
                  </motion.div>
                </button>
              </div>
            );
          })}

          {/* ── Forest bushes ── */}
          {state.playerLocation === 'forest' && (state.forestBushes ?? []).map(bush => {
            const bSize = 52;
            const pos = toIso(bush.x, bush.y, curGridH);
            return (
              <div
                key={bush.id}
                className="absolute"
                style={{
                  left: pos.left - bSize / 2,
                  top: pos.top - bSize + 10,
                  zIndex: (bush.x + bush.y) * 10 + 2,
                }}
              >
                <button
                  onClick={() => startForaging(bush.id, 'bush')}
                  className="relative flex flex-col items-center hover:scale-105 transition-transform"
                  title="Click to pick berries"
                >
                  <img
                    src="/games/cozy-cottage/Forest/bush.svg"
                    width={bSize} height={bSize}
                    draggable={false}
                    className={`object-contain drop-shadow ${!bush.hasBerries ? 'opacity-60 grayscale' : ''}`}
                  />
                  {/* Berry indicator */}
                  {bush.hasBerries && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -top-2 right-0 text-sm"
                    >
                      🫐
                    </motion.div>
                  )}
                </button>
              </div>
            );
          })}

          {/* ── Deer (forest only) ── */}
          {state.playerLocation === 'forest' && state.forestDeer.map(deer => {
            const deerSize = ISO_TILE_W * 1.1;
            const pos = toIso(deer.x, deer.y, curGridH);
            const isActive = deer.id === state.activeDeer;
            const dx = Math.abs(state.playerPosition.x - deer.x);
            const dy = Math.abs(state.playerPosition.y - deer.y);
            const isAdjacent = dx <= 1.5 && dy <= 1.5;
            return (
              <div
                key={deer.id}
                className="absolute pointer-events-none"
                style={{
                  left: pos.left - deerSize / 2,
                  top: pos.top - deerSize + ISO_TILE_H / 2,
                  zIndex: (deer.x + deer.y) * 10 + 1,
                  width: deerSize,
                  height: deerSize,
                  transition: 'left 1.0s ease-in-out, top 1.0s ease-in-out',
                }}
              >
                <button
                  className="relative group pointer-events-auto"
                  style={{ width: deerSize, height: deerSize }}
                  onClick={() => startHunting(deer.id)}
                >
                  <img
                    src="/games/cozy-cottage/Forest/deer.svg"
                    draggable={false}
                    style={{
                      width: deerSize,
                      height: deerSize,
                      transform: deer.facingLeft ? 'scaleX(-1)' : undefined,
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(255,100,0,0.8))' : undefined,
                      opacity: isActive ? 0.85 : 1,
                      transition: 'transform 0.3s',
                    }}
                    className="object-contain drop-shadow-md"
                  />
                  {isActive && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap">
                      Hunting... {state.huntingTimer}s
                    </div>
                  )}
                  {!isActive && isAdjacent && state.huntingBow && state.huntingTimer === null && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap transition-opacity">
                      Hunt (15st)
                    </div>
                  )}
                  {!isActive && !isAdjacent && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-lg whitespace-nowrap transition-opacity">
                      🦌 Deer — get closer
                    </div>
                  )}
                </button>
              </div>
            );
          })}

          {/* ── Placed furniture (depth-sorted) ── */}
          {state.placedFurniture
            .filter(f => f.location === state.playerLocation)
            .sort((a, b) => (a.x + a.y) - (b.x + b.y))
            .map(f => {
              const item = FURNITURE_CATALOG.find(cat => cat.id === f.furnitureId);
              if (!item) return null;
              const s = isoItemStyle(f.x, f.y, item.width, item.height, curGridH, isoRise(item.type));
              const isNight = state.timeOfDay > 1900 || state.timeOfDay < 600;
              return (
                <div
                  key={f.id}
                  onMouseEnter={() => {
                    if (mode !== 'walk') return;
                    tooltipTimer.current = setTimeout(() => setWorldTooltip({ name: item.name, x: f.x, y: f.y }), 1000);
                  }}
                  onMouseLeave={() => { if (tooltipTimer.current) clearTimeout(tooltipTimer.current); setWorldTooltip(null); }}
                  className={`absolute flex items-end justify-center cursor-pointer group ${mode === 'decorate' ? 'ring-2 ring-white ring-dashed animate-pulse' : ''}`}
                  style={{ ...s, zIndex: (f.x + f.y) * 10 + 2, backgroundColor: item.icon.startsWith('/') ? 'transparent' : item.color }}
                  onPointerDown={e => { if (mode === 'decorate') { e.stopPropagation(); removeFurniture(f.id); } }}
                  onClick={() => {
                    if (mode === 'decorate') return;
                    if (item.type === 'garden_patch') {
                      const plant = state.gardenPlants.find(p => p.furnitureId === f.id);
                      if (plant) {
                        if (plant.isDead) { setState(prev => ({ ...prev, gardenPlants: prev.gardenPlants.filter(p => p.id !== plant.id) })); setMessage("Removed the dead plant."); }
                        else if (plant.growthStage === 3) harvestPlant(plant.id);
                        else if (!plant.isWatered) waterPlant(plant.id);
                      } else { setSelectedGardenPatch(f.id); setMode('garden'); }
                    } else if (item.type === 'bed') { setMode('sleep'); }
                    else if (item.type === 'stove') { setMode('cook'); }
                    else if (item.type === 'box') { setSelectedBox(f.id); setMode('box'); }
                    else if (item.type === 'pet_bowl' || item.type === 'water_bowl') fillBowl(f.id);
                  }}
                >
                  {/* Flat ground items fill the tile edge-to-edge; tall items keep padding */}
                  <GameIcon icon={item.icon} className={`z-10 ${FLAT_ITEM_TYPES.has(item.type) ? 'absolute inset-0 w-full h-full object-fill' : 'w-full h-full object-contain object-bottom p-0.5'}`} style={(() => {
                    const rot = f.rotation ?? 0;
                    const flip = f.flipped ? ' scaleX(-1)' : '';
                    const rotStr = rot !== 0 ? `rotate(${rot}deg) ` : '';
                    if (item.type === 'garden_patch') {
                      return { transform: `${rotStr}scale(1.18)${flip}`, ...(f.colorFilter ? { filter: f.colorFilter } : {}) };
                    }
                    const t = `${rotStr}${flip}`.trim();
                    return { ...(t ? { transform: t } : {}), ...(f.colorFilter ? { filter: f.colorFilter } : {}) };
                  })()} />

                  {item.type === 'lamp' && isNight && (
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-yellow-200/50 blur-2xl rounded-full" />
                  )}

                  {item.type === 'garden_patch' && (() => {
                    const plant = state.gardenPlants.find(p => p.furnitureId === f.id);
                    if (!plant) return null;

                    const HARVEST_SRC: Record<string, string> = {
                      carrot:  '/games/cozy-cottage/Farm/carrot.svg',
                      tomato:  '/games/cozy-cottage/Farm/tomato.svg',
                      herb:    '/games/cozy-cottage/Farm/herb.svg',
                      potato:  '/games/cozy-cottage/Farm/potato.svg',
                      radish:  '/games/cozy-cottage/Farm/radish.svg',
                      special: '/games/cozy-cottage/Farm/grow1.svg',
                    };

                    // Wrapper: centred horizontally, shifted up so the plant base
                    // sits at the diamond surface rather than the container centre.
                    const tileCenter: React.CSSProperties = {
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 20, pointerEvents: 'none',
                    };
                    // Upward shift applied to every plant img so it looks like
                    // it is growing out of the dirt.
                    const plantShift: React.CSSProperties = { transform: 'translateY(-12px)' };

                    if (plant.isDead) {
                      return (
                        <div key={`plant-${f.id}`} style={tileCenter}>
                          <img src="/games/cozy-cottage/Farm/grow1.svg" width={20} height={20} draggable={false}
                            style={{ ...plantShift, filter: 'grayscale(1) opacity(0.45)' }} />
                        </div>
                      );
                    }

                    if (plant.growthStage === 3) {
                      // Harvest-ready: correct food asset, bobbing above tile centre
                      return (
                        <motion.div key={`plant-${f.id}`} style={tileCenter}
                          animate={{ y: [-12, -20, -12] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}>
                          <img src={HARVEST_SRC[plant.type] ?? '/games/cozy-cottage/Farm/grow1.svg'}
                            width={36} height={36} draggable={false} />
                        </motion.div>
                      );
                    }

                    // Stage 0–2: size grows with stage (not with watered state —
                    // the water-droplet badge already signals the plant needs water).
                    const growSize = plant.growthStage === 0 ? 20 : plant.growthStage === 1 ? 28 : 34;
                    return (
                      <motion.div key={`plant-${f.id}`} style={tileCenter}
                        initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <img src="/games/cozy-cottage/Farm/grow1.svg" width={growSize} height={growSize} draggable={false}
                          style={plantShift} />
                      </motion.div>
                    );
                  })()}

                  {/* Water-needed badge (still growing & unwatered) */}
                  {item.type === 'garden_patch' && state.gardenPlants.find(p => p.furnitureId === f.id && !p.isWatered && p.growthStage < 3 && !p.isDead) && (
                    <motion.div key={`water-needed-${f.id}`} animate={{ y: [0, -2, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute top-0.5 right-0.5 bg-blue-500 text-white p-0.5 rounded-full z-30 shadow-lg"><Droplets size={10} /></motion.div>
                  )}

                  {(item.type === 'pet_bowl' || item.type === 'water_bowl') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {(() => {
                        const bowl = state.bowlStates.find(b => b.furnitureId === f.id);
                        if (!bowl || bowl.amount <= 0) return null;
                        return <motion.div initial={{ scale: 0 }} animate={{ scale: bowl.amount / 100 }}
                          className={`w-1/2 h-1/2 rounded-full ${bowl.type === 'food' ? 'bg-amber-800' : 'bg-blue-400'} shadow-inner`} />;
                      })()}
                    </div>
                  )}

                  {mode === 'decorate' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 pointer-events-none">
                      <Trash2 size={24} className="text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
              );
            })
          }

          {/* ── Placement ghost — snaps instantly to mouse, no spring lag ── */}
          {mode === 'decorate' && selectedFurniture && (() => {
            const gs = isoItemStyle(placementPos.x, placementPos.y, selectedFurniture.width, selectedFurniture.height, curGridH, isoRise(selectedFurniture.type));
            const rotDeg = placementRotation;
            const rotTransform = rotDeg !== 0 ? `rotate(${rotDeg}deg)` : '';
            const flipTransform = placementFlipped ? 'scaleX(-1)' : '';
            const fullTransform = [rotTransform, flipTransform].filter(Boolean).join(' ') || undefined;
            return (
              <div
                className="absolute border-2 border-dashed border-white/80 flex items-end justify-center pointer-events-none z-[200] ring-2 ring-white/30"
                style={{
                  left: gs.left, top: gs.top,
                  width: gs.width, height: gs.height,
                  backgroundColor: selectedFurniture.icon.startsWith('/') ? 'rgba(255,255,255,0.08)' : selectedFurniture.color + '80',
                }}
              >
                <GameIcon icon={selectedFurniture.icon} className="w-full h-full object-contain object-bottom opacity-75 p-0.5" style={{
                  transform: fullTransform,
                  ...(placementColorFilter ? { filter: placementColorFilter } : {}),
                }} />
                {/* Rotation hint badge */}
                {rotDeg !== 0 && (
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-[9px] font-bold px-1 py-0.5 rounded pointer-events-none">
                    {rotDeg}°
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Pets (depth-sorted) ── */}
          {state.playerLocation === 'inside' && state.pets.map(pet => {
            const petSvg = PET_SVG_MAP[pet.type];
            const ps = isoItemStyle(pet.x, pet.y, 1, 1, curGridH);
            return (
              <motion.div
                key={pet.id}
                className="absolute flex items-end justify-center"
                animate={{ left: ps.left, top: ps.top }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                style={{ width: ps.width, height: ps.height, zIndex: (pet.x + pet.y) * 10 + 5 }}
              >
                {petSvg
                  ? <img src={petSvg} width={ISO_TILE_W * 0.8} height={ISO_TILE_W * 0.8} draggable={false} className="drop-shadow-sm object-contain mb-1" />
                  : <PawPrint size={ISO_TILE_W * 0.6} className="text-cozy-text drop-shadow-sm mb-1" />
                }
              </motion.div>
            );
          })}

          {/* ── Player ── */}
          {(() => {
            const px = state.playerPosition.x;
            const py = state.playerPosition.y;
            const ps = isoItemStyle(px, py, 1, 1, curGridH);
            const atPond = state.playerLocation === 'pond';
            return (
              <div
                className="absolute flex items-end justify-center"
                style={{
                  left: ps.left,
                  top: ps.top,
                  width: ps.width,
                  height: ps.height,
                  zIndex: Math.floor(px + py) * 10 + 6,
                  transform: state.isRelaxing ? 'scale(0.8)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* At the pond the player sits inside the boat.
                    Both images are absolutely stacked so the lower half of the
                    player truly overlaps (and is hidden by) the boat hull. */}
                {atPond ? (() => {
                  const boatW  = ISO_TILE_W * 1.45;
                  const boatH  = ISO_TILE_W * 0.60;
                  const playerW = ISO_TILE_W * 0.45;
                  const playerH = ISO_TILE_W * 0.95;
                  const overlap = playerH * 0.45;
                  const containerH = playerH + boatH - overlap;
                  const containerW = boatW;
                  const facingTransform = playerFacing === 'left' ? 'translateX(-50%) scaleX(-1)' : 'translateX(-50%)';
                  return (
                    <div style={{ position: 'relative', width: containerW, height: containerH, marginBottom: 2 }}>
                      <img
                        src="/games/cozy-cottage/Fishing/boat.svg"
                        width={boatW}
                        height={boatH}
                        draggable={false}
                        className="object-contain drop-shadow"
                        style={{ position: 'absolute', bottom: 0, left: 0, zIndex: 1 }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: -6,
                          left: 'calc(50% - 6px)',
                          transform: 'translateX(-50%)',
                          zIndex: 2,
                        }}
                      >
                        <img
                          src={getPlayerSrc(state.playerSprite, playerFacing)}
                          width={playerW}
                          height={playerH}
                          draggable={false}
                          className="object-contain drop-shadow"
                          style={{
                            transform: getPlayerFlip(state.playerSprite, playerFacing) ? 'scaleX(-1)' : undefined,
                            filter: state.isRelaxing ? 'brightness(0.88) saturate(0.9)' : undefined,
                          }}
                        />
                      </div>
                      {state.fishingTimer !== null && (
                        <motion.div
                          animate={{ rotate: [-10, 10, -10] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: playerFacingLeft ? undefined : containerW / 2 - playerW / 2 - 14,
                            left:  playerFacingLeft ? containerW / 2 - playerW / 2 - 14 : undefined,
                            zIndex: 3,
                            transformOrigin: 'bottom center',
                          }}
                        >
                          <img src="/games/cozy-cottage/Fishing/fishing-rod.svg" width={20} height={20} draggable={false} className="object-contain" />
                        </motion.div>
                      )}
                    </div>
                  );
                })() : (
                  <div ref={playerSpriteRef} className="flex flex-col items-center mb-2 relative">
                    <img
                      src={getPlayerSrc(state.playerSprite, playerFacing)}
                      width={ISO_TILE_W * 0.45}
                      height={ISO_TILE_W * 0.95}
                      draggable={false}
                      className="object-contain drop-shadow"
                      style={{
                        transform: getPlayerFlip(state.playerSprite, playerFacing) ? 'scaleX(-1)' : undefined,
                        filter: state.isRelaxing ? 'brightness(0.88) saturate(0.9)' : undefined,
                      }}
                    />
                    {state.isRelaxing && (
                      <motion.div animate={{ y: [-5, -15], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-8 text-cozy-text font-bold text-xs">zzz</motion.div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* World Tooltip */}
        <AnimatePresence>
          {worldTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="fixed top-8 left-1/2 z-[100] bg-white/90 backdrop-blur-md text-cozy-text text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-cozy-accent/20 flex items-center gap-2"
            >
              <Info size={14} className="text-cozy-accent" />
              {worldTooltip.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Overlay for Decorate Mode */}
      {mode === 'decorate' && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex gap-4 z-[80]">
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-cozy-accent/20 flex gap-2">
            <button 
              onClick={() => setPlacementPos(p => ({ ...p, x: Math.max(0, p.x - 1) }))}
              className="p-3 hover:bg-cozy-accent/10 rounded-xl transition-colors"
            >
              ←
            </button>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setPlacementPos(p => ({ ...p, y: Math.max(0, p.y - 1) }))}
                className="p-3 hover:bg-cozy-accent/10 rounded-xl transition-colors"
              >
                ↑
              </button>
              <button 
                onClick={() => setPlacementPos(p => ({ ...p, y: Math.min(state.houseSize.height - 1, p.y + 1) }))}
                className="p-3 hover:bg-cozy-accent/10 rounded-xl transition-colors"
              >
                ↓
              </button>
            </div>
            <button 
              onClick={() => setPlacementPos(p => ({ ...p, x: Math.min(state.houseSize.width - 1, p.x + 1) }))}
              className="p-3 hover:bg-cozy-accent/10 rounded-xl transition-colors"
            >
              →
            </button>
          </div>
          <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-cozy-accent/20 flex gap-2">
            <button
              onClick={() => setPlacementFlipped(f => !f)}
              className={`p-3 rounded-xl transition-colors text-cozy-text ${placementFlipped ? 'bg-cozy-accent/20' : 'hover:bg-cozy-accent/10'}`}
              title="Flip"
            >
              <FlipHorizontal2 size={24} />
            </button>
            <button 
              onClick={placeFurniture}
              className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors shadow-lg"
              title="Confirm"
            >
              <Check size={24} />
            </button>
            <button 
              onClick={() => { setMode('walk'); setSelectedFurniture(null); }}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-lg"
              title="Cancel"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bars — two scrollable rows, touch-friendly */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-auto max-w-[98vw]">

        {/* Action Bar */}
        <div className="bg-white/90 backdrop-blur-xl px-3 py-2 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3 overflow-x-auto">
          <NavButton
            active={mode === 'decorate'}
            onClick={mode === 'decorate' ? () => { setMode('walk'); setSelectedFurniture(null); } : () => setMode('decorate')}
            icon={<img src="/games/cozy-cottage/Menu/decorate.svg" width={22} height={22} draggable={false} />}
            label={mode === 'decorate' ? 'Done ✓' : 'Decorate'}
          />
          <NavButton
            active={false}
            onClick={() => setConfirmExpand({ type: state.playerLocation === 'inside' ? 'house' : 'garden', cost: state.playerLocation === 'inside' ? HOUSE_EXPAND_COST : GARDEN_EXPAND_COST })}
            icon={<img src="/games/cozy-cottage/Menu/expand.svg" width={22} height={22} draggable={false} />}
            label="Expand"
          />
          <NavButton
            active={mode === 'cook'}
            onClick={startCooking}
            icon={<img src="/games/cozy-cottage/Menu/cooking.svg" width={22} height={22} draggable={false} />}
            label="Cook"
          />
          <NavButton
            active={state.workTimer !== null}
            onClick={goToWork}
            disabled={state.workTimer !== null}
            icon={<Briefcase size={22} />}
            label={state.workTimer !== null ? `${state.workTimer}s` : 'Work'}
          />
          <NavButton
            active={state.isRelaxing}
            onClick={state.isRelaxing ? skipToMorning : checkRelax}
            icon={<img src="/games/cozy-cottage/Menu/relax.svg" width={22} height={22} draggable={false} />}
            label={state.isRelaxing ? 'Sleep' : 'Relax'}
          />
          <NavButton
            active={mode === 'explore' || state.explorationTimer !== null}
            onClick={() => setMode('explore')}
            disabled={state.explorationTimer !== null && mode !== 'explore'}
            icon={<Compass size={22} />}
            label={state.explorationTimer !== null ? `${state.explorationTimer}s` : 'Explore'}
          />
        </div>

        {/* Location + Commerce Bar */}
        <div className="bg-white/80 backdrop-blur-xl px-3 py-2 rounded-2xl shadow-2xl border border-white/50 flex items-center gap-3 overflow-x-auto">
          <NavButton
            active={state.playerLocation === 'inside'}
            onClick={() => goToLocation('inside')}
            icon={<img src="/games/cozy-cottage/Menu/house.svg" width={22} height={22} draggable={false} />}
            label="Home"
          />
          <NavButton
            active={state.playerLocation === 'outside'}
            onClick={() => goToLocation('outside')}
            icon={<img src="/games/cozy-cottage/Farm/sprout.svg" width={22} height={22} draggable={false} />}
            label="Garden"
          />
          <NavButton
            active={state.playerLocation === 'pond'}
            onClick={() => goToLocation('pond')}
            icon={<img src="/games/cozy-cottage/Menu/pond.svg" width={22} height={22} draggable={false} />}
            label="Pond"
          />
          <NavButton
            active={state.playerLocation === 'forest'}
            onClick={() => goToLocation('forest')}
            icon={<img src="/games/cozy-cottage/Menu/forest.svg" width={22} height={22} draggable={false} />}
            label="Forest"
          />

          <div className="w-px h-6 bg-cozy-text/10 mx-0.5 shrink-0" />

          <NavButton
            active={mode === 'shop'}
            onClick={() => setMode('shop')}
            icon={<img src="/games/cozy-cottage/Menu/shop.svg" width={22} height={22} draggable={false} />}
            label="Shop"
          />
          <NavButton
            active={mode === 'market'}
            onClick={() => setMode('market')}
            icon={<img src="/games/cozy-cottage/Farm/market.svg" width={22} height={22} draggable={false} />}
            label="Market"
          />
          <NavButton
            active={mode === 'inventory'}
            onClick={() => setMode('inventory')}
            icon={<img src="/games/cozy-cottage/Menu/inventory.svg" width={22} height={22} draggable={false} />}
            label="Inventory"
          />
        </div>
      </div>


      {/* Modals */}
      <AnimatePresence mode="wait">
        {confirmExpand && (
          <motion.div 
            key="modal-expand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-cozy-text/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 text-center"
            >
              <div className="w-20 h-20 bg-cozy-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Maximize className="text-cozy-accent" size={40} />
              </div>
              <h2 className="text-2xl font-display font-bold text-cozy-text mb-2">
                Expand your {confirmExpand.type}?
              </h2>
              <p className="text-cozy-text/60 mb-8">
                This will increase the size of your {confirmExpand.type} for <span className="font-bold text-yellow-600">{confirmExpand.cost} coins</span>.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setConfirmExpand(null)}
                  className="flex-1 py-4 rounded-2xl font-bold text-cozy-text/40 hover:bg-cozy-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmExpand.type === 'house' ? expandHouse : expandGarden}
                  className="flex-1 py-4 bg-cozy-accent text-white rounded-2xl font-bold shadow-lg hover:bg-cozy-accent/90 transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'inventory' && (
          <motion.div 
            key="modal-inventory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                  <ShoppingBag className="text-cozy-accent" />
                  Your Inventory
                </h2>
                <div className="flex items-center gap-4">
                  <div className="bg-cozy-bg px-4 py-2 rounded-xl text-xs font-bold text-cozy-text/60">
                    Capacity: {state.inventory.length + state.caughtFish.length} / {state.inventorySize}
                  </div>
                  <button onClick={() => setMode('walk')}><X /></button>
                </div>
              </div>

              <div className="space-y-8">
                {/* Fish */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Caught Fish</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {state.caughtFish.map((fishId, idx) => {
                      const fish = FISH_CATALOG.find(f => f.id === fishId);
                      if (!fish) return null;
                      return (
                        <div key={`fish-${idx}`} className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                          <GameIcon icon={fish.icon} size={32} className="mx-auto mb-2 object-contain" />
                          <p className="font-bold text-xs">{fish.name}</p>
                          <p className="text-[10px] text-blue-400 uppercase">{fish.rarity}</p>
                        </div>
                      );
                    })}
                    {state.caughtFish.length === 0 && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No fish caught yet.</p>
                    )}
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Ingredients</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(state.ingredients).map(([id, count]) => {
                      if (count === 0) return null;
                      return (
                        <div key={`ing-${id}`} className="bg-cozy-bg p-4 rounded-2xl text-center">
                          <p className="font-bold text-sm capitalize">{id}</p>
                          <p className="text-xs text-cozy-text/40">x{count}</p>
                        </div>
                      );
                    })}
                    {Object.values(state.ingredients).every(v => v === 0) && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No ingredients.</p>
                    )}
                  </div>
                </div>

                {/* Seeds */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Seeds</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(state.seeds).map(([type, count]) => {
                      if (count === 0) return null;
                      const seed = SEEDS.find(s => s.type === type);
                      return (
                        <div key={`seed-inv-${type}`} className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                          <Sprout className="mx-auto mb-2 text-green-500" size={24} />
                          <p className="font-bold text-xs">{seed?.name || type}</p>
                          <p className="text-[10px] text-green-400 uppercase">x{count}</p>
                        </div>
                      );
                    })}
                    {Object.values(state.seeds).every(v => v === 0) && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No seeds owned.</p>
                    )}
                  </div>
                </div>

                {/* Cooked Food */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Cooked Food</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(state.cookedFood).map(([foodId, count]) => {
                      if (count === 0) return null;
                      const recipe = RECIPES.find(r => r.id === foodId);
                      return (
                        <div key={`food-inv-${foodId}`} className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                          <ChefHat className="mx-auto mb-2 text-orange-500" size={24} />
                          <p className="font-bold text-xs">{recipe?.name || foodId}</p>
                          <p className="text-[10px] text-orange-400 uppercase">x{count}</p>
                        </div>
                      );
                    })}
                    {Object.values(state.cookedFood).every(v => v === 0) && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No cooked food.</p>
                    )}
                  </div>
                </div>

                {/* Furniture Inventory */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40">Furniture (Unplaced)</h3>
                    <button 
                      onClick={() => setMode('decorate')}
                      className="flex items-center gap-2 bg-cozy-accent text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all"
                    >
                      <Hammer size={14} />
                      Manage Placed Items
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {state.inventory.map((slot, idx) => {
                      const item = FURNITURE_CATALOG.find(f => f.id === slot.id);
                      if (!item) return null;
                      return (
                        <button
                          key={`inv-${idx}`}
                          onClick={() => startPlacement(slot)}
                          className="bg-cozy-bg p-4 rounded-2xl text-center hover:bg-cozy-accent hover:text-white transition-all group flex flex-col items-center gap-1"
                        >
                          <div className="w-10 h-10 flex items-center justify-center">
                            <GameIcon icon={item.icon} size={32} className="object-contain" style={slot.colorFilter ? { filter: slot.colorFilter } : undefined} />
                          </div>
                          <p className="font-bold text-xs">{item.name}</p>
                          <p className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Click to Place</p>
                        </button>
                      );
                    })}
                    {state.inventory.length === 0 && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No unplaced furniture.</p>
                    )}
                  </div>
                </div>

                {/* Placed Furniture */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Placed Furniture</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.placedFurniture.map((f) => {
                      const item = FURNITURE_CATALOG.find(cat => cat.id === f.furnitureId);
                      if (!item) return null;
                      return (
                        <div key={`placed-${f.id}`} className="bg-cozy-bg p-4 rounded-3xl flex items-center justify-between border border-transparent hover:border-cozy-accent transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center" style={{ color: item.color }}>
                              <GameIcon icon={item.icon} size={20} className="object-contain" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-[10px] text-cozy-text/40 capitalize">{f.location} ({f.x}, {f.y})</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                removeFurniture(f.id);
                                setSelectedFurniture(item);
                                setMode('decorate');
                                setPlacementPos({ x: f.x, y: f.y });
                                setPlacementRotation(f.rotation);
                                setPlacementFlipped(f.flipped ?? false);
                              }}
                              className="bg-cozy-accent text-white p-2 rounded-xl hover:scale-110 transition-all shadow-sm"
                              title="Move"
                            >
                              <ArrowLeftRight size={16} />
                            </button>
                            <button 
                              onClick={() => removeFurniture(f.id)}
                              className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 transition-all shadow-sm"
                              title="Pick Up"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {state.placedFurniture.length === 0 && (
                      <p className="col-span-full text-center text-cozy-text/30 italic py-4">No furniture placed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'market' && (
          <motion.div 
            key="modal-market"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                  <Store className="text-cozy-accent" />
                  Farmer's Market
                </h2>
                <button onClick={() => setMode('walk')}><X /></button>
              </div>
              
              <div className="space-y-8">
                {/* Daily Specials */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Daily Special</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {state.dailyMarketItem && (() => {
                      const item = state.dailyMarketItem;
                      const catalogItem = item.type === 'seed' ? SEEDS.find(s => s.type === item.id) : null;
                      if (!catalogItem) return null;
                      return (
                        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-200 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                              <Sprout className="text-green-500" />
                            </div>
                            <div>
                              <p className="font-bold text-lg">{catalogItem.name}</p>
                              <p className="text-sm text-yellow-700">Special Price!</p>
                            </div>
                          </div>
                          <button 
                            onClick={buyDailyMarketItem}
                            className="bg-yellow-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-yellow-600 transition-all active:scale-95"
                          >
                            {item.price} Coins
                          </button>
                        </div>
                      );
                    })()}
                    {!state.dailyMarketItem && (
                      <p className="text-center text-cozy-text/30 italic py-4">Sold out for today!</p>
                    )}
                  </div>
                </div>

                {/* Seed Shop */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Seed Shop</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SEEDS.map(seed => {
                      const stock = state.marketSeeds[seed.type] || 0;
                      return (
                        <div key={seed.id} className="bg-cozy-bg p-4 rounded-3xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                              <Sprout className="text-green-500" size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{seed.name}</p>
                              <p className="text-[10px] text-cozy-text/40">Stock: {stock}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => buySeed(seed.type)}
                            disabled={stock <= 0}
                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${stock > 0 ? 'bg-cozy-accent text-white hover:scale-105' : 'bg-cozy-text/10 text-cozy-text/30 cursor-not-allowed'}`}
                          >
                            {seed.price} Coins
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sell Items */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-cozy-text/40 mb-4">Sell Your Goods</h3>
                  <div className="space-y-4">
                    {Object.entries(state.cookedFood).map(([foodId, count]) => {
                      const recipe = RECIPES.find(r => r.id === foodId);
                      if (!recipe || count === 0) return null;
                      return (
                        <div key={foodId} className="bg-cozy-bg p-6 rounded-3xl flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-xl">{recipe.name}</h3>
                            <p className="text-cozy-text/60">You have {count} in stock</p>
                          </div>
                          <button 
                            onClick={() => {
                              setState(prev => ({
                                ...prev,
                                currency: prev.currency + recipe.sellPrice,
                                cookedFood: { ...prev.cookedFood, [foodId]: prev.cookedFood[foodId] - 1 }
                              }));
                              setMessage(`Sold ${recipe.name} for ${recipe.sellPrice}!`);
                            }}
                            className="bg-green-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-600 transition-all"
                          >
                            Sell for {recipe.sellPrice}
                          </button>
                        </div>
                      );
                    })}
                    {Object.values(state.cookedFood).every(v => v === 0) && (
                      <div className="text-center py-12 text-cozy-text/40 italic">
                        You don't have any cooked food to sell yet!
                      </div>
                    )}
                    
                    {/* Wood Selling Option */}
                    <div className="bg-cozy-bg p-6 rounded-3xl flex items-center justify-between border-t-2 border-cozy-accent/10 pt-8 mt-8">
                      <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                          <Axe className="text-cozy-wood" size={20} />
                          Sell Extra Wood
                        </h3>
                        <p className="text-cozy-text/60">You have {state.wood} wood</p>
                      </div>
                      <button 
                        onClick={() => {
                          if (state.wood >= 50) {
                            setState(prev => ({
                              ...prev,
                              currency: prev.currency + 10,
                              wood: prev.wood - 50
                            }));
                            setMessage("Sold 50 wood for 10 coins!");
                          } else {
                            setMessage("You need at least 50 wood to sell!");
                          }
                        }}
                        disabled={state.wood < 50}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${state.wood >= 50 ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg' : 'bg-cozy-text/10 text-cozy-text/30 cursor-not-allowed'}`}
                      >
                        Sell 50 Wood for 10 Coins
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'garden' && (
          <motion.div 
            key="modal-garden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8"
            >
              <h2 className="text-2xl font-display font-bold mb-6 text-center">Plant Seeds</h2>
              <div className="grid grid-cols-1 gap-4">
                {SEEDS.map(seed => {
                  const count = state.seeds[seed.type] || 0;
                  return (
                    <button
                      key={seed.id}
                      onClick={() => plantSeed(seed.type as any)}
                      disabled={count <= 0}
                      className={`bg-cozy-bg p-6 rounded-3xl flex items-center justify-between border-2 transition-all group ${count > 0 ? 'hover:border-cozy-accent border-transparent' : 'opacity-50 grayscale border-transparent cursor-not-allowed'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sprout className="text-green-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold">{seed.name}</h3>
                          <p className="text-xs text-cozy-text/40">You have {count} seeds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-bold text-cozy-accent">
                        Plant
                      </div>
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setMode('walk')}
                className="w-full mt-6 py-4 text-cozy-text/40 font-bold"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

        {mode === 'sleep' && (
          <motion.div 
            key="modal-sleep"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-cozy-text/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Moon className="text-blue-600" size={40} />
              </div>
              <h2 className="text-2xl font-display font-bold text-cozy-text mb-2">Rest and Skip Time</h2>
              <p className="text-cozy-text/60 mb-8">How many hours would you like to sleep?</p>
              
              <div className="flex justify-center gap-4 mb-8">
                {[4, 8, 12].map(h => (
                  <button
                    key={h}
                    onClick={() => setSleepHours(h)}
                    className={`w-16 h-16 rounded-2xl font-bold transition-all ${sleepHours === h ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-cozy-bg text-cozy-text/40'}`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setMode('walk')}
                  className="flex-1 py-4 rounded-2xl font-bold text-cozy-text/40 hover:bg-cozy-bg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => skipTime(sleepHours)}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                >
                  Sleep
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'cook' && (
          <motion.div 
            key="modal-cook"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-8"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                  <ChefHat className="text-cozy-accent" />
                  Kitchen
                </h2>
                <button onClick={() => setMode('walk')}><X /></button>
              </div>

              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[55vh] pr-1">
                {RECIPES.map(recipe => {
                  const isUnlocked = state.level >= recipe.minLevel;
                  const canCook = isUnlocked && Object.entries(recipe.ingredients).every(
                    ([ing, count]) => (state.ingredients[ing] || 0) >= count
                  );
                  return (
                    <div key={recipe.id} className={`bg-cozy-bg p-6 rounded-3xl flex items-center justify-between ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                      <div>
                        <h3 className="font-bold text-xl">{recipe.name} {!isUnlocked && `(Lv.${recipe.minLevel})`}</h3>
                        {isUnlocked ? (
                          <div className="flex gap-2 mt-1">
                            {Object.entries(recipe.ingredients).map(([ing, count]) => (
                              <span key={ing} className={`text-xs px-2 py-1 rounded-lg ${ (state.ingredients[ing] || 0) >= count ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {ing}: {state.ingredients[ing] || 0}/{count}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-cozy-text/40">Unlock at Level {recipe.minLevel}</p>
                        )}
                      </div>
                      <button
                        disabled={!canCook}
                        onClick={() => {
                          setState(prev => {
                            const newIngs = { ...prev.ingredients };
                            Object.entries(recipe.ingredients).forEach(([ing, count]) => {
                              newIngs[ing] -= count;
                            });
                            return {
                              ...prev,
                              ingredients: newIngs,
                              cookedFood: { ...prev.cookedFood, [recipe.id]: (prev.cookedFood[recipe.id] || 0) + 1 },
                              xp: prev.xp + 5,
                              skills: { ...prev.skills, cooking: prev.skills.cooking + 10 }
                            };
                          });
                          setMessage(`Cooked ${recipe.name}!`);
                        }}
                        className={`px-6 py-3 rounded-2xl font-bold transition-all ${canCook ? 'bg-cozy-accent text-white hover:bg-cozy-accent/90' : 'bg-cozy-text/10 text-cozy-text/30 cursor-not-allowed'}`}
                      >
                        Cook
                      </button>
                    </div>
                  );
                })}

                {/* ─── Rations Section ─── */}
                {(() => {
                  const cookingLevel = calculateLevel(state.skills.cooking);
                  const rationUnlocked = cookingLevel >= 2;
                  const availableIngredients = Object.entries(state.ingredients)
                    .filter(([, v]) => (v as number) > 0)
                    .map(([k]) => k);
                  const canMakeRations = rationUnlocked && rationIngredients.length === 3;

                  const toggleIngredient = (ing: string) => {
                    setRationIngredients(prev => {
                      if (prev.includes(ing)) return prev.filter(i => i !== ing);
                      if (prev.length >= 3) return prev; // max 3
                      return [...prev, ing];
                    });
                  };

                  return (
                    <div className={`bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl ${!rationUnlocked ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-xl flex items-center gap-2">
                            <Backpack size={18} className="text-orange-500" />
                            Rations
                            {!rationUnlocked && <span className="text-sm font-normal text-cozy-text/40">(Cooking Lv.2)</span>}
                          </h3>
                          <p className="text-xs text-cozy-text/50 mt-0.5">Pick any 3 ingredients to pack 1 ration for exploration.</p>
                        </div>
                        <button
                          disabled={!canMakeRations}
                          onClick={() => { cookRations(rationIngredients); setRationIngredients([]); }}
                          className={`px-6 py-3 rounded-2xl font-bold transition-all ${canMakeRations ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-cozy-text/10 text-cozy-text/30 cursor-not-allowed'}`}
                        >
                          Pack
                        </button>
                      </div>

                      {rationUnlocked && (
                        <>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {availableIngredients.length === 0 && (
                              <p className="text-xs text-cozy-text/40">No ingredients in your pack.</p>
                            )}
                            {availableIngredients.map(ing => {
                              const selected = rationIngredients.includes(ing);
                              const count = (state.ingredients[ing] as number) ?? 0;
                              return (
                                <button
                                  key={ing}
                                  onClick={() => toggleIngredient(ing)}
                                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold border-2 transition-all ${selected ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-cozy-text border-cozy-text/20 hover:border-orange-400'}`}
                                >
                                  {ing} ({count})
                                </button>
                              );
                            })}
                          </div>
                          {rationIngredients.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-orange-700 font-semibold">
                              <span>Selected ({rationIngredients.length}/3):</span>
                              {rationIngredients.map((ing, i) => (
                                <span key={i} className="bg-orange-100 px-2 py-0.5 rounded-lg">{ing}</span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
        {mode === 'explore' && (
          <motion.div
            key="modal-explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                  <Compass className="text-orange-500" />
                  Explore
                </h2>
                <button onClick={() => setMode('walk')}><X /></button>
              </div>

              {state.explorationTimer !== null ? (
                <div className="text-center py-8">
                  <Compass size={48} className="text-orange-400 mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
                  <p className="text-xl font-bold text-cozy-text mb-2">Out Exploring...</p>
                  <p className="text-4xl font-display font-bold text-orange-500">{state.explorationTimer}s</p>
                  <p className="text-sm text-cozy-text/50 mt-3">You'll return with supplies soon!</p>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 rounded-3xl p-5 mb-6">
                    <p className="text-sm text-cozy-text/70 leading-relaxed">
                      Pack rations and head out to explore! Each ration lets you explore for <strong>30 seconds</strong>.
                      More rations = longer trip = rarer loot. You'll return with ingredients, wood, coins, and maybe seeds!
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-cozy-text">Rations to use</span>
                    <span className="text-sm text-cozy-text/50">You have: {state.rations}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <button
                      onClick={() => setExplorationRationCount(c => Math.max(1, c - 1))}
                      className="w-10 h-10 rounded-full bg-cozy-bg hover:bg-cozy-accent hover:text-white font-bold text-xl transition-all flex items-center justify-center"
                    >−</button>
                    <div className="flex-1 text-center">
                      <span className="text-4xl font-display font-bold text-orange-500">{explorationRationCount}</span>
                    </div>
                    <button
                      onClick={() => setExplorationRationCount(c => Math.min(state.rations, c + 1))}
                      className="w-10 h-10 rounded-full bg-cozy-bg hover:bg-cozy-accent hover:text-white font-bold text-xl transition-all flex items-center justify-center"
                    >+</button>
                  </div>

                  <p className="text-center text-sm text-cozy-text/50 mb-6">
                    Duration: <strong>{explorationRationCount * 30}s</strong>
                    {' · '}Loot quality: <strong className={explorationRationCount >= 7 ? 'text-purple-500' : explorationRationCount >= 4 ? 'text-blue-500' : 'text-green-500'}>
                      {explorationRationCount >= 7 ? 'Rare' : explorationRationCount >= 4 ? 'Good' : 'Common'}
                    </strong>
                  </p>

                  <button
                    onClick={() => startExploration(explorationRationCount)}
                    disabled={state.rations < 1 || explorationRationCount > state.rations}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${state.rations >= 1 && explorationRationCount <= state.rations ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg' : 'bg-cozy-text/10 text-cozy-text/30 cursor-not-allowed'}`}
                  >
                    {state.rations < 1 ? 'No Rations — Cook some first!' : 'Set Off!'}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {mode === 'box' && selectedBox && (() => {
          const boxSlot = state.boxContents[selectedBox] ?? {};

          // Build rows for each resource category
          type BoxRow = { label: string; category: 'ingredients' | 'seeds' | 'cookedFood' | 'wood'; key: string; inPocket: number; inBox: number };
          const rows: BoxRow[] = [];

          // Wood
          rows.push({ label: 'Wood', category: 'wood', key: '__wood', inPocket: state.wood, inBox: boxSlot.__wood ?? 0 });

          // Seeds
          SEEDS.forEach(s => {
            const inPocket = (state.seeds[s.type] ?? 0);
            const inBox = boxSlot[s.type] ?? 0;
            if (inPocket > 0 || inBox > 0) rows.push({ label: s.name.replace(' Seeds','') + ' Seeds', category: 'seeds', key: s.type, inPocket, inBox });
          });

          // Ingredients
          Object.entries(state.ingredients).forEach(([k, v]) => {
            const vn = v as number;
            if (vn > 0 || (boxSlot[k] ?? 0) > 0)
              rows.push({ label: k.charAt(0).toUpperCase() + k.slice(1), category: 'ingredients', key: k, inPocket: vn, inBox: boxSlot[k] ?? 0 });
          });
          // ingredients sitting only in box
          Object.keys(boxSlot).forEach(k => {
            if (!['__wood'].includes(k) && !(state.ingredients[k] > 0) && !SEEDS.some(s => s.type === k) && (boxSlot[k] ?? 0) > 0)
              rows.push({ label: k.charAt(0).toUpperCase() + k.slice(1), category: 'ingredients', key: k, inPocket: 0, inBox: boxSlot[k] });
          });

          // Cooked food
          Object.entries(state.cookedFood).forEach(([k, v]) => {
            const vn = v as number;
            if (vn > 0 || (boxSlot[k] ?? 0) > 0)
              rows.push({ label: RECIPES.find(r => r.id === k)?.name ?? k, category: 'cookedFood', key: k, inPocket: vn, inBox: boxSlot[k] ?? 0 });
          });

          const totalInBox = (Object.values(boxSlot) as number[]).reduce((a, b) => a + b, 0);

          return (
            <motion.div
              key="modal-box"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-center p-8 pb-4">
                  <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                    <img src="/games/cozy-cottage/House/box.svg" width={32} height={32} className="object-contain" draggable={false} />
                    Storage Box
                    <span className="text-sm font-normal text-cozy-text/40 ml-1">({totalInBox} items)</span>
                  </h2>
                  <button onClick={() => { setMode('walk'); setSelectedBox(null); }}><X /></button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-8 pb-2 text-xs font-bold text-cozy-text/40 uppercase tracking-wide">
                  <span>Resource</span>
                  <span className="text-center w-20">In Pocket</span>
                  <span className="text-center w-20">In Box</span>
                </div>

                {/* Rows */}
                <div className="flex-1 overflow-y-auto px-8 pb-8 flex flex-col gap-2">
                  {rows.length === 0 && (
                    <p className="text-cozy-text/40 text-sm text-center py-8">Nothing to store yet — gather some resources first!</p>
                  )}
                  {rows.map(row => (
                    <div key={`${row.category}-${row.key}`} className="bg-cozy-bg rounded-2xl p-3 grid grid-cols-[1fr_auto_auto] gap-x-4 items-center">
                      <span className="font-semibold text-sm">{row.label}</span>

                      {/* Pocket column: count + "Store" button */}
                      <div className="flex items-center gap-2 w-20 justify-center">
                        <span className="text-sm font-bold w-6 text-center">{row.inPocket}</span>
                        <button
                          disabled={row.inPocket <= 0}
                          onClick={() => putInBox(selectedBox!, row.category, row.key)}
                          className="w-7 h-7 rounded-lg bg-cozy-accent text-white font-bold text-lg leading-none flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cozy-accent/80 transition-colors"
                          title="Store 1 in box"
                        >→</button>
                      </div>

                      {/* Box column: "Take" button + count */}
                      <div className="flex items-center gap-2 w-20 justify-center">
                        <button
                          disabled={row.inBox <= 0}
                          onClick={() => takeFromBox(selectedBox!, row.category, row.key)}
                          className="w-7 h-7 rounded-lg bg-amber-500 text-white font-bold text-lg leading-none flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
                          title="Take 1 from box"
                        >←</button>
                        <span className="text-sm font-bold w-6 text-center">{row.inBox}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
        {mode === 'shop' && (
          <motion.div 
            key="modal-shop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cozy-text/20 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-cozy-text/5 flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                    <ShoppingBag className="text-cozy-accent" />
                    Cottage Shop
                  </h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShopTab('furniture')}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${shopTab === 'furniture' ? 'bg-cozy-accent text-white' : 'bg-cozy-bg text-cozy-text/60 hover:bg-cozy-accent/10'}`}
                    >
                      Furniture
                    </button>
                    <button
                      onClick={() => setShopTab('pets')}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${shopTab === 'pets' ? 'bg-cozy-accent text-white' : 'bg-cozy-bg text-cozy-text/60 hover:bg-cozy-accent/10'}`}
                    >
                      Pets
                    </button>
                    <button
                      onClick={() => setShopTab('tools')}
                      className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${shopTab === 'tools' ? 'bg-cozy-accent text-white' : 'bg-cozy-bg text-cozy-text/60 hover:bg-cozy-accent/10'}`}
                    >
                      Tools
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {state.dailyShopItem && (() => {
                    const item = state.dailyShopItem;
                    const catalogItem = FURNITURE_CATALOG.find(f => f.id === item.id);
                    if (!catalogItem) return null;
                    return (
                      <div className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-200 flex items-center gap-4">
                        <span className="text-xs font-bold text-yellow-700 uppercase tracking-tighter">Daily Special: {catalogItem.name}</span>
                        <button 
                          onClick={buyDailyShopItem}
                          className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm"
                        >
                          {item.price}
                        </button>
                      </div>
                    );
                  })()}
                  <button 
                    onClick={() => setMode('walk')}
                    className="p-2 hover:bg-cozy-text/5 rounded-full transition-colors"
                  >
                    <X />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopTab === 'tools' ? (
                  <>
                    {/* Axe */}
                    <div>
                      <div className={`bg-cozy-bg/50 p-6 rounded-3xl border-2 transition-all group ${state.hasAxe ? 'border-green-300 opacity-60' : 'border-transparent hover:border-cozy-accent'}`}>
                        <div className="aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <img src="/games/cozy-cottage/Forest/axe.svg" width={72} height={72} className="object-contain" draggable={false} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Wood Axe</h3>
                        <p className="text-[10px] text-cozy-text/60 mb-4 line-clamp-2 h-8">Chop down trees in the forest for wood.</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-600 font-bold">
                            <Coins size={16} />
                            {AXE_PRICE}
                          </div>
                          <button
                            onClick={buyAxe}
                            disabled={state.hasAxe}
                            className={`px-4 py-2 rounded-xl font-bold transition-colors shadow-md active:scale-95 ${state.hasAxe ? 'bg-green-400 text-white cursor-default' : 'bg-cozy-accent text-white hover:bg-cozy-accent/90'}`}
                          >
                            {state.hasAxe ? 'Owned ✓' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Hunting Bow */}
                    <div>
                      <div className={`bg-cozy-bg/50 p-6 rounded-3xl border-2 transition-all group ${state.huntingBow ? 'border-green-300 opacity-60' : 'border-transparent hover:border-cozy-accent'}`}>
                        <div className="aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <img src="/games/cozy-cottage/Forest/hunting-bow.svg" width={72} height={72} className="object-contain" draggable={false} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Hunting Bow</h3>
                        <p className="text-[10px] text-cozy-text/60 mb-4 line-clamp-2 h-8">Hunt deer in the forest for venison.</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-600 font-bold">
                            <Coins size={16} />
                            {HUNTING_BOW_PRICE}
                          </div>
                          <button
                            onClick={buyHuntingBow}
                            disabled={state.huntingBow}
                            className={`px-4 py-2 rounded-xl font-bold transition-colors shadow-md active:scale-95 ${state.huntingBow ? 'bg-green-400 text-white cursor-default' : 'bg-cozy-accent text-white hover:bg-cozy-accent/90'}`}
                          >
                            {state.huntingBow ? 'Owned ✓' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Fishing Rod */}
                    <div>
                      <div className={`bg-cozy-bg/50 p-6 rounded-3xl border-2 transition-all group ${state.fishingRod ? 'border-green-300 opacity-60' : 'border-transparent hover:border-cozy-accent'}`}>
                        <div className="aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                          <img src="/games/cozy-cottage/Fishing/fishing-rod.svg" width={72} height={72} className="object-contain" draggable={false} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Fishing Rod</h3>
                        <p className="text-[10px] text-cozy-text/60 mb-4 line-clamp-2 h-8">Cast your line at the pond to catch fish.</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-yellow-600 font-bold">
                            <Coins size={16} />
                            {FISHING_ROD_PRICE}
                          </div>
                          <button
                            onClick={buyFishingRod}
                            disabled={state.fishingRod}
                            className={`px-4 py-2 rounded-xl font-bold transition-colors shadow-md active:scale-95 ${state.fishingRod ? 'bg-green-400 text-white cursor-default' : 'bg-cozy-accent text-white hover:bg-cozy-accent/90'}`}
                          >
                            {state.fishingRod ? 'Owned ✓' : 'Buy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : shopTab === 'furniture' ? FURNITURE_CATALOG.map(item => {
                  const chosenFilter = shopColorChoices[item.id]; // undefined = Default
                  return (
                  <div key={item.id} className="bg-cozy-bg/50 p-5 rounded-3xl border-2 border-transparent hover:border-cozy-accent transition-all group flex flex-col">
                    {/* Preview */}
                    <div className="aspect-square bg-white rounded-2xl mb-3 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                      <GameIcon
                        icon={item.icon}
                        size={72}
                        className="object-contain transition-all duration-300"
                        style={{
                          ...(item.icon.startsWith('/') ? {} : { color: item.color }),
                          ...(chosenFilter ? { filter: chosenFilter } : {}),
                        }}
                      />
                    </div>

                    <h3 className="font-bold text-lg mb-0.5">{item.name}</h3>
                    <p className="text-[10px] text-cozy-text/60 mb-3 line-clamp-2">{item.description}</p>

                    {/* Colour swatches */}
                    <div className="mb-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-cozy-text/40 mb-1.5">Colour</p>
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PRESETS.map(preset => {
                          const isActive = chosenFilter === preset.filter;
                          return (
                            <button
                              key={preset.name}
                              title={preset.name}
                              onClick={() => setShopColorChoices(prev => ({ ...prev, [item.id]: preset.filter }))}
                              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 ${isActive ? 'border-cozy-accent scale-110 shadow-md' : 'border-white/60'}`}
                              style={{ backgroundColor: preset.swatch }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Buy row */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Coins size={16} />
                        {item.price}
                      </div>
                      <button
                        onClick={() => buyFurniture(item, chosenFilter)}
                        className="bg-cozy-accent text-white px-4 py-2 rounded-xl font-bold hover:bg-cozy-accent/90 transition-colors shadow-md active:scale-95"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                  );
                }) : PET_CATALOG.map(item => (
                  <div key={item.id} className="bg-cozy-bg/50 p-6 rounded-3xl border-2 border-transparent hover:border-cozy-accent transition-all group">
                    <div className="aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <GameIcon icon={item.icon} size={64} className="object-contain text-cozy-text" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <p className="text-[10px] text-cozy-text/60 mb-4 line-clamp-2 h-8">Adopt a loyal companion for your home.</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-yellow-600 font-bold">
                        <Coins size={16} />
                        {item.price}
                      </div>
                      <button 
                        onClick={() => buyPet(item.id)}
                        className="bg-cozy-accent text-white px-4 py-2 rounded-xl font-bold hover:bg-cozy-accent/90 transition-colors shadow-md active:scale-95"
                      >
                        Adopt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {mode === 'decorate' && !selectedFurniture && (
          <motion.div 
            key="inventory-bar"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[80] w-full max-w-2xl px-6"
          >
            <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-white/50">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cozy-text/40 mb-4 px-2">Your Inventory</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {state.inventory.length === 0 && (
                  <p className="text-cozy-text/50 italic px-2">Your inventory is empty. Visit the shop!</p>
                )}
                {state.inventory.map((slot, idx) => {
                  const item = FURNITURE_CATALOG.find(f => f.id === slot.id);
                  if (!item) return null;
                  return (
                    <button
                      key={`${slot.id}-${idx}`}
                      onClick={() => startPlacement(slot)}
                      className="flex-shrink-0 w-20 h-20 bg-cozy-bg rounded-2xl flex items-center justify-center hover:bg-cozy-accent/20 transition-colors border-2 border-transparent hover:border-cozy-accent group"
                      title={item.name}
                    >
                      <GameIcon icon={item.icon} size={32} className="text-cozy-text group-hover:scale-110 transition-transform object-contain" style={slot.colorFilter ? { filter: slot.colorFilter } : undefined} />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
        {showGuide && (
          <motion.div 
            key="modal-guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-cozy-text/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-bold text-cozy-text flex items-center gap-3">
                  <HelpCircle className="text-cozy-accent" />
                  Cottage Guide
                </h2>
                <button onClick={() => setShowGuide(false)} className="p-2 hover:bg-cozy-bg rounded-full"><X /></button>
              </div>

              <div className="space-y-8 text-left">
                <section>
                  <h3 className="text-lg font-bold text-cozy-accent mb-2 flex items-center gap-2">
                    <Home size={18} /> Getting Started
                  </h3>
                  <p className="text-cozy-text/70 leading-relaxed">
                    Welcome to your new cottage! Use the <b>D-pad</b> (bottom-right) or <b>WASD / Arrow Keys</b> to move around.
                    Your goal is to grow your garden, decorate your home, and expand your property.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-cozy-accent mb-2 flex items-center gap-2">
                    <Zap size={18} /> Stamina & Rest
                  </h3>
                  <p className="text-cozy-text/70 leading-relaxed">
                    Actions like <b>chopping wood</b>, <b>fishing</b>, and <b>gardening</b> consume stamina. 
                    If you're tired, <b>sit on furniture</b> inside or <b>sleep in a bed</b> to recover.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-cozy-accent mb-2 flex items-center gap-2">
                    <Trees size={18} /> Resources & Expansion
                  </h3>
                  <p className="text-cozy-text/70 leading-relaxed">
                    Visit the <b>Forest</b> to chop trees for wood. You'll need both <b>coins</b> and <b>wood</b> to expand your house and garden. 
                    Expansions unlock more space for furniture and crops.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-cozy-accent mb-2 flex items-center gap-2">
                    <Hammer size={18} /> Decorating
                  </h3>
                  <p className="text-cozy-text/70 leading-relaxed">
                    Toggle <b>Decorate Mode</b> (Hammer icon) to move or remove items. 
                    In this mode, you can <b>drag</b> items to move them, <b>click</b> them to rotate, or use the <b>red bin</b> to return them to your inventory.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-cozy-accent mb-2 flex items-center gap-2">
                    <Sprout size={18} /> Gardening
                  </h3>
                  <p className="text-cozy-text/70 leading-relaxed">
                    Place <b>Garden Patches</b> in your garden. Buy seeds at the market, plant them, and keep them <b>watered</b>. 
                    Harvested crops can be sold or used in cooking.
                  </p>
                </section>
              </div>

              <button 
                onClick={() => setShowGuide(false)}
                className="w-full mt-8 py-4 bg-cozy-accent text-white rounded-2xl font-bold shadow-lg hover:bg-cozy-accent/90 transition-all active:scale-95"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, disabled }: { active: boolean, onClick: () => void, icon: ReactNode, label: string, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 transition-all select-none
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
        ${!disabled && active ? 'text-cozy-accent scale-110' : ''}
        ${!disabled && !active ? 'text-cozy-text/50 hover:text-cozy-text/70 hover:scale-105' : ''}`}
    >
      <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-cozy-accent/10 shadow-inner' : ''}`}>
        {/* Opacity wrapper dims image-based icons when inactive; Lucide icons use the text color above */}
        <div className={`transition-opacity ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-75'}`}>
          {icon}
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
