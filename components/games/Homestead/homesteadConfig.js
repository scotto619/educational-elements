// components/games/Homestead/homesteadConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// WILDWOOD HOMESTEAD 🏕️ — config: resources, tools, fishing, farming,
// smelting, cooking, crafting, decor, discoveries, titles + profile helpers.
//
// A survival-crafting incremental: chop, mine, fish and forage with clicks;
// smelt, farm, cook and build with real-time timers; discover rare treasures
// and recipes; and grow a homestead whose Prosperity shows on your profile.
//
// Cross-game: your Champion's Forge weapon boosts chopping/mining, and your
// Menagerie companion lends a family bonus (handled in the game component).
//
// Save data lives in studentData.homesteadData.
// ─────────────────────────────────────────────────────────────────────────────

export const fmtQty = (n) => Math.floor(Number(n) || 0).toLocaleString();

// ═══════════════════════════════════════════════════════════════════════════
// ITEMS — one flat registry. kind: wood|ore|bar|stone|fiber|forage|crop|seed|
// fish|junk|rare|dish|scroll
// ═══════════════════════════════════════════════════════════════════════════
export const ITEMS = {
  // Wood (burn = fuel value for cooking/smelting)
  pine_wood:    { name: 'Pine Log',      icon: '🪵', kind: 'wood', burn: 1, sell: 1 },
  oak_wood:     { name: 'Oak Log',       icon: '🪵', kind: 'wood', burn: 2, sell: 3 },
  maple_wood:   { name: 'Maple Log',     icon: '🪵', kind: 'wood', burn: 3, sell: 6 },
  ironbark_wood: { name: 'Ironbark Log', icon: '🪵', kind: 'wood', burn: 5, sell: 12 },
  elder_wood:   { name: 'Elderwood Log', icon: '🪵', kind: 'wood', burn: 8, sell: 25 },

  // Stone + ores
  stone:        { name: 'Stone',         icon: '🪨', kind: 'stone', sell: 1 },
  copper_ore:   { name: 'Copper Ore',    icon: '🟠', kind: 'ore', sell: 2 },
  iron_ore:     { name: 'Iron Ore',      icon: '⚙️', kind: 'ore', sell: 5 },
  silver_ore:   { name: 'Silver Ore',    icon: '⚪', kind: 'ore', sell: 9 },
  gold_ore:     { name: 'Gold Ore',      icon: '🟡', kind: 'ore', sell: 15 },
  mithril_ore:  { name: 'Mithril Ore',   icon: '💠', kind: 'ore', sell: 30 },
  salt:         { name: 'Rock Salt',     icon: '🧂', kind: 'ore', sell: 3 },

  // Bars (smelted)
  copper_bar:   { name: 'Copper Bar',    icon: '🥉', kind: 'bar', sell: 8 },
  iron_bar:     { name: 'Iron Bar',      icon: '🔩', kind: 'bar', sell: 16 },
  silver_bar:   { name: 'Silver Bar',    icon: '🥈', kind: 'bar', sell: 28 },
  gold_bar:     { name: 'Gold Bar',      icon: '🥇', kind: 'bar', sell: 45 },
  mithril_bar:  { name: 'Mithril Bar',   icon: '✨', kind: 'bar', sell: 90 },

  // Foraged
  berries:      { name: 'Wild Berries',  icon: '🫐', kind: 'forage', sell: 2 },
  herbs:        { name: 'Forest Herbs',  icon: '🌿', kind: 'forage', sell: 2 },
  mushroom:     { name: 'Mushroom',      icon: '🍄', kind: 'forage', sell: 3 },
  honey:        { name: 'Wild Honey',    icon: '🍯', kind: 'forage', sell: 5 },
  wild_egg:     { name: 'Wild Egg',      icon: '🥚', kind: 'forage', sell: 4 },
  fiber:        { name: 'Plant Fiber',   icon: '🧵', kind: 'fiber', sell: 1 },

  // Crops
  carrot:       { name: 'Carrot',        icon: '🥕', kind: 'crop', sell: 3 },
  potato:       { name: 'Potato',        icon: '🥔', kind: 'crop', sell: 3 },
  wheat:        { name: 'Wheat',         icon: '🌾', kind: 'crop', sell: 4 },
  tomato:       { name: 'Tomato',        icon: '🍅', kind: 'crop', sell: 5 },
  corn:         { name: 'Corn',          icon: '🌽', kind: 'crop', sell: 6 },
  pumpkin:      { name: 'Pumpkin',       icon: '🎃', kind: 'crop', sell: 10 },
  starfruit:    { name: 'Starfruit',     icon: '⭐', kind: 'crop', sell: 40 },

  // Seeds
  carrot_seed:  { name: 'Carrot Seed',   icon: '🌱', kind: 'seed', sell: 1 },
  potato_seed:  { name: 'Potato Seed',   icon: '🌱', kind: 'seed', sell: 1 },
  wheat_seed:   { name: 'Wheat Seed',    icon: '🌱', kind: 'seed', sell: 1 },
  tomato_seed:  { name: 'Tomato Seed',   icon: '🌱', kind: 'seed', sell: 2 },
  corn_seed:    { name: 'Corn Seed',     icon: '🌱', kind: 'seed', sell: 2 },
  pumpkin_seed: { name: 'Pumpkin Seed',  icon: '🌱', kind: 'seed', sell: 4 },
  star_seed:    { name: 'Starfruit Seed', icon: '✴️', kind: 'seed', sell: 15 },

  // Fish
  minnow:       { name: 'Minnow',        icon: '🐟', kind: 'fish', sell: 2 },
  perch:        { name: 'Perch',         icon: '🐟', kind: 'fish', sell: 4 },
  trout:        { name: 'Speckled Trout', icon: '🐟', kind: 'fish', sell: 6 },
  bass:         { name: 'Shadow Bass',   icon: '🐟', kind: 'fish', sell: 9 },
  catfish:      { name: 'Whisker Catfish', icon: '🐟', kind: 'fish', sell: 12 },
  eel:          { name: 'Marsh Eel',     icon: '🐍', kind: 'fish', sell: 16 },
  salmon:       { name: 'Silver Salmon', icon: '🐟', kind: 'fish', sell: 20 },
  pike:         { name: 'Duskwater Pike', icon: '🐡', kind: 'fish', sell: 26 },
  sturgeon:     { name: 'Sturgeon',      icon: '🐋', kind: 'fish', sell: 35 },
  ghostfin:     { name: 'Ghostfin',      icon: '👻', kind: 'fish', sell: 60, rare: true },
  golden_koi:   { name: 'Golden Koi',    icon: '🎏', kind: 'fish', sell: 120, rare: true },
  leviathan:    { name: 'Ancient Leviathan', icon: '🐉', kind: 'fish', sell: 400, rare: true },
  old_boot:     { name: 'Old Boot',      icon: '🥾', kind: 'junk', sell: 1 },
  kelp:         { name: 'Lake Kelp',     icon: '🌿', kind: 'junk', sell: 1 },
  pearl:        { name: 'Lake Pearl',    icon: '🫧', kind: 'rare', sell: 80 },

  // Rare discoveries (Curio Shelf — each unique find adds Prosperity)
  amber:        { name: 'Ancient Amber', icon: '🧿', kind: 'rare', sell: 50 },
  fossil:       { name: 'Ancient Fossil', icon: '🦴', kind: 'rare', sell: 70 },
  emerald:      { name: 'Emerald',       icon: '💚', kind: 'rare', sell: 60 },
  ruby:         { name: 'Ruby',          icon: '❤️', kind: 'rare', sell: 90 },
  diamond:      { name: 'Diamond',       icon: '💎', kind: 'rare', sell: 150 },
  star_fragment: { name: 'Star Fragment', icon: '🌟', kind: 'rare', sell: 200 },
  moonblossom:  { name: 'Moonblossom',   icon: '🌸', kind: 'rare', sell: 65 },
  truffle:      { name: 'Black Truffle', icon: '🟤', kind: 'rare', sell: 75 },
  clover:       { name: 'Four-Leaf Clover', icon: '🍀', kind: 'rare', sell: 55 },
  golden_leaf:  { name: 'Golden Leaf',   icon: '🍂', kind: 'rare', sell: 45 },
  living_root:  { name: 'Living Root',   icon: '🌳', kind: 'rare', sell: 85 },
  dragon_scale: { name: 'Dragon Scale',  icon: '🐲', kind: 'rare', sell: 250 },

  recipe_scroll: { name: 'Recipe Scroll', icon: '📜', kind: 'scroll', sell: 0 },
};

export const RARE_IDS = Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'rare');

// ═══════════════════════════════════════════════════════════════════════════
// GATHERING ZONES + NODES
// Each node: hardness (tool power needed per yield), stock (yields before it
// depletes), respawnSec, xp, level req, rare drop table [{id, chance}]
// ═══════════════════════════════════════════════════════════════════════════
export const ZONES = [
  { id: 'forest', name: 'Whispering Forest', icon: '🌲', skill: 'wood',   tool: 'axe',  verb: 'Chop' },
  { id: 'caves',  name: 'Glowstone Caves',   icon: '⛰️', skill: 'mine',   tool: 'pick', verb: 'Mine' },
  { id: 'lake',   name: 'Mistveil Lake',     icon: '🌊', skill: 'fish',   tool: 'rod',  verb: 'Fish' },
  { id: 'meadow', name: 'Suncrest Meadow',   icon: '🌼', skill: 'forage', tool: null,   verb: 'Gather' },
];

export const NODES = {
  forest: [
    { id: 'pine',     name: 'Pine Tree',      icon: '🌲', yieldId: 'pine_wood',    hardness: 3,  stock: 6, respawnSec: 25,  xp: 4,  level: 1,
      rares: [{ id: 'recipe_scroll', chance: 0.010 }, { id: 'amber', chance: 0.004 }] },
    { id: 'oak',      name: 'Old Oak',        icon: '🌳', yieldId: 'oak_wood',     hardness: 6,  stock: 6, respawnSec: 40,  xp: 9,  level: 5,
      rares: [{ id: 'recipe_scroll', chance: 0.012 }, { id: 'golden_leaf', chance: 0.006 }, { id: 'wild_egg', chance: 0.05 }] },
    { id: 'maple',    name: 'Crimson Maple',  icon: '🍁', yieldId: 'maple_wood',   hardness: 10, stock: 5, respawnSec: 70,  xp: 16, level: 10,
      rares: [{ id: 'recipe_scroll', chance: 0.014 }, { id: 'amber', chance: 0.010 }, { id: 'honey', chance: 0.06 }] },
    { id: 'ironbark', name: 'Ironbark Giant', icon: '🌴', yieldId: 'ironbark_wood', hardness: 16, stock: 5, respawnSec: 120, xp: 28, level: 16,
      rares: [{ id: 'living_root', chance: 0.010 }, { id: 'golden_leaf', chance: 0.012 }] },
    { id: 'elder',    name: 'Elderwood Ancient', icon: '🎄', yieldId: 'elder_wood', hardness: 26, stock: 4, respawnSec: 240, xp: 48, level: 22,
      rares: [{ id: 'living_root', chance: 0.02 }, { id: 'star_fragment', chance: 0.004 }, { id: 'recipe_scroll', chance: 0.02 }] },
  ],
  caves: [
    { id: 'stone',   name: 'Stone Outcrop',  icon: '🪨', yieldId: 'stone',       hardness: 3,  stock: 8, respawnSec: 20,  xp: 3,  level: 1,
      rares: [{ id: 'fossil', chance: 0.004 }] },
    { id: 'copper',  name: 'Copper Vein',    icon: '🟠', yieldId: 'copper_ore',  hardness: 5,  stock: 6, respawnSec: 35,  xp: 8,  level: 3,
      rares: [{ id: 'emerald', chance: 0.005 }, { id: 'salt', chance: 0.10 }] },
    { id: 'iron',    name: 'Iron Vein',      icon: '⚙️', yieldId: 'iron_ore',    hardness: 9,  stock: 6, respawnSec: 60,  xp: 14, level: 8,
      rares: [{ id: 'emerald', chance: 0.007 }, { id: 'fossil', chance: 0.008 }, { id: 'salt', chance: 0.10 }] },
    { id: 'silver',  name: 'Silver Seam',    icon: '⚪', yieldId: 'silver_ore',  hardness: 13, stock: 5, respawnSec: 90,  xp: 20, level: 12,
      rares: [{ id: 'ruby', chance: 0.007 }, { id: 'recipe_scroll', chance: 0.010 }] },
    { id: 'gold',    name: 'Gold Seam',      icon: '🟡', yieldId: 'gold_ore',    hardness: 18, stock: 5, respawnSec: 140, xp: 30, level: 16,
      rares: [{ id: 'ruby', chance: 0.010 }, { id: 'diamond', chance: 0.004 }] },
    { id: 'mithril', name: 'Mithril Heart',  icon: '💠', yieldId: 'mithril_ore', hardness: 30, stock: 4, respawnSec: 300, xp: 55, level: 22,
      rares: [{ id: 'diamond', chance: 0.010 }, { id: 'star_fragment', chance: 0.006 }, { id: 'dragon_scale', chance: 0.002 }] },
  ],
  meadow: [
    { id: 'berry',   name: 'Berry Bush',     icon: '🫐', yieldId: 'berries',   hardness: 2, stock: 6, respawnSec: 25,  xp: 3,  level: 1,
      rares: [{ id: 'clover', chance: 0.005 }] },
    { id: 'herb',    name: 'Herb Patch',     icon: '🌿', yieldId: 'herbs',     hardness: 2, stock: 6, respawnSec: 30,  xp: 4,  level: 2,
      rares: [{ id: 'clover', chance: 0.006 }, { id: 'recipe_scroll', chance: 0.010 }] },
    { id: 'fiberp',  name: 'Wild Flax',      icon: '🧵', yieldId: 'fiber',     hardness: 2, stock: 8, respawnSec: 25,  xp: 3,  level: 1,
      rares: [] },
    { id: 'shroom',  name: 'Mushroom Ring',  icon: '🍄', yieldId: 'mushroom',  hardness: 3, stock: 5, respawnSec: 45,  xp: 7,  level: 6,
      rares: [{ id: 'truffle', chance: 0.008 }, { id: 'moonblossom', chance: 0.004 }] },
    { id: 'hive',    name: 'Wild Hive',      icon: '🍯', yieldId: 'honey',     hardness: 5, stock: 4, respawnSec: 90,  xp: 12, level: 10,
      rares: [{ id: 'recipe_scroll', chance: 0.012 }] },
    { id: 'moonpatch', name: 'Moonlit Glade', icon: '🌸', yieldId: 'herbs',    hardness: 8, stock: 4, respawnSec: 180, xp: 22, level: 18,
      rares: [{ id: 'moonblossom', chance: 0.05 }, { id: 'star_fragment', chance: 0.003 }, { id: 'clover', chance: 0.02 }] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// FISHING — cast → wait → bite window → catch. Table depends on rod tier +
// fishing level; luck boosts rare rows.
// ═══════════════════════════════════════════════════════════════════════════
export const FISH_TABLE = [
  { id: 'old_boot',   weight: 8,  level: 1,  rod: 0 },
  { id: 'kelp',       weight: 8,  level: 1,  rod: 0 },
  { id: 'minnow',     weight: 30, level: 1,  rod: 0, xp: 4 },
  { id: 'perch',      weight: 24, level: 2,  rod: 0, xp: 6 },
  { id: 'trout',      weight: 18, level: 4,  rod: 1, xp: 9 },
  { id: 'bass',       weight: 14, level: 7,  rod: 1, xp: 13 },
  { id: 'catfish',    weight: 11, level: 9,  rod: 2, xp: 16 },
  { id: 'eel',        weight: 9,  level: 12, rod: 2, xp: 20 },
  { id: 'salmon',     weight: 7,  level: 14, rod: 3, xp: 25 },
  { id: 'pike',       weight: 5,  level: 17, rod: 3, xp: 32 },
  { id: 'sturgeon',   weight: 4,  level: 20, rod: 4, xp: 42 },
  { id: 'pearl',      weight: 1.5, level: 10, rod: 2, xp: 30, rare: true },
  { id: 'ghostfin',   weight: 1.2, level: 15, rod: 3, xp: 55, rare: true },
  { id: 'golden_koi', weight: 0.7, level: 18, rod: 4, xp: 80, rare: true },
  { id: 'leviathan',  weight: 0.2, level: 23, rod: 5, xp: 200, rare: true },
];
export const FISH_WAIT_MIN_S = 4;
export const FISH_WAIT_MAX_S = 16;
export const FISH_BITE_WINDOW_MS = 2600;
export const FISH_XP_BASE = 4;

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS — 6 tiers each. power = yields per "hardness" (clicks needed =
// ceil(hardness / power)). Rod tier gates the fish table.
// ═══════════════════════════════════════════════════════════════════════════
export const TOOL_TIERS = [
  { tier: 0, name: 'Flint',      power: 1 },
  { tier: 1, name: 'Copper',     power: 2 },
  { tier: 2, name: 'Iron',       power: 3.5 },
  { tier: 3, name: 'Silver',     power: 5 },
  { tier: 4, name: 'Gold',       power: 7 },
  { tier: 5, name: 'Mithril',    power: 10 },
];

export const TOOL_DEFS = {
  axe:  { name: 'Axe',     icon: '🪓' },
  pick: { name: 'Pickaxe', icon: '⛏️' },
  rod:  { name: 'Rod',     icon: '🎣' },
};

// Craft costs per tier upgrade (tier 1..5)
export const TOOL_COSTS = {
  1: { copper_bar: 4,  pine_wood: 10 },
  2: { iron_bar: 5,    oak_wood: 12 },
  3: { silver_bar: 6,  maple_wood: 14 },
  4: { gold_bar: 8,    ironbark_wood: 16 },
  5: { mithril_bar: 10, elder_wood: 18 },
};
export const TOOL_LEVEL_REQ = { 1: 3, 2: 8, 3: 12, 4: 16, 5: 22 };

// ═══════════════════════════════════════════════════════════════════════════
// SKILLS + LEVELING (max 25)
// ═══════════════════════════════════════════════════════════════════════════
export const SKILLS = {
  wood:   { name: 'Woodcutting', icon: '🪓' },
  mine:   { name: 'Mining',      icon: '⛏️' },
  fish:   { name: 'Fishing',     icon: '🎣' },
  forage: { name: 'Foraging',    icon: '🌿' },
  cook:   { name: 'Cooking',     icon: '🍳' },
};
export const SKILL_MAX = 25;
export const skillXpToNext = (level) => 30 + level * 22;
export const skillLevel = (xp) => {
  let lvl = 1;
  let rem = Number(xp) || 0;
  while (lvl < SKILL_MAX && rem >= skillXpToNext(lvl)) { rem -= skillXpToNext(lvl); lvl += 1; }
  return lvl;
};
export const skillProgress = (xp) => {
  let lvl = 1;
  let rem = Number(xp) || 0;
  while (lvl < SKILL_MAX && rem >= skillXpToNext(lvl)) { rem -= skillXpToNext(lvl); lvl += 1; }
  return { level: lvl, into: rem, needed: lvl >= SKILL_MAX ? 0 : skillXpToNext(lvl) };
};

// ═══════════════════════════════════════════════════════════════════════════
// FARMING — real-time crops
// ═══════════════════════════════════════════════════════════════════════════
export const FARM_BASE_PLOTS = 4;
export const FARM_MAX_PLOTS = 12;

export const CROPS = [
  { seedId: 'carrot_seed',  cropId: 'carrot',   growMin: 20,  yield: 2, seedCost: 4 },
  { seedId: 'potato_seed',  cropId: 'potato',   growMin: 30,  yield: 3, seedCost: 5 },
  { seedId: 'wheat_seed',   cropId: 'wheat',    growMin: 45,  yield: 3, seedCost: 6 },
  { seedId: 'tomato_seed',  cropId: 'tomato',   growMin: 90,  yield: 3, seedCost: 10 },
  { seedId: 'corn_seed',    cropId: 'corn',     growMin: 180, yield: 4, seedCost: 14 },
  { seedId: 'pumpkin_seed', cropId: 'pumpkin',  growMin: 420, yield: 2, seedCost: 25 },
  { seedId: 'star_seed',    cropId: 'starfruit', growMin: 960, yield: 1, seedCost: 120 },
];
export const CROP_BY_SEED = Object.fromEntries(CROPS.map((c) => [c.seedId, c]));
export const GOLDEN_CROP_CHANCE = 0.04; // double yield sparkle

// ═══════════════════════════════════════════════════════════════════════════
// SMELTING — ores + wood fuel → bars, real-time (keeps going offline)
// ═══════════════════════════════════════════════════════════════════════════
export const SMELT_SLOTS = 2;
export const SMELT_RECIPES = [
  { barId: 'copper_bar',  oreId: 'copper_ore',  ore: 2, fuel: 2, minutes: 2 },
  { barId: 'iron_bar',    oreId: 'iron_ore',    ore: 2, fuel: 3, minutes: 5 },
  { barId: 'silver_bar',  oreId: 'silver_ore',  ore: 2, fuel: 4, minutes: 10 },
  { barId: 'gold_bar',    oreId: 'gold_ore',    ore: 2, fuel: 6, minutes: 20 },
  { barId: 'mithril_bar', oreId: 'mithril_ore', ore: 3, fuel: 10, minutes: 45 },
];

// ═══════════════════════════════════════════════════════════════════════════
// COOKING — kitchen tiers, fuel from wood burn values, buff dishes.
// Recipes: known from start, unlocked at cooking levels, or found on scrolls.
// ═══════════════════════════════════════════════════════════════════════════
export const KITCHEN_TIERS = [
  { tier: 0, name: 'Campfire',        icon: '🔥' },
  { tier: 1, name: 'Stone Cookstove', icon: '♨️' },
  { tier: 2, name: 'Wildwood Kitchen', icon: '🍳' },
];

// Buff types the game understands:
//  gatherSpeed (extra tool power %), doubleDrop (%), rareLuck (%),
//  fishLuck (%), fishFast (% shorter wait + longer window), autoBoost (%),
//  smeltFast (%), xpBoost (%), cropFast (%) — value = percentage points.
export const BUFF_LABELS = {
  gatherSpeed: { name: 'Gathering power', icon: '💪' },
  doubleDrop:  { name: 'Double drops',    icon: '🎁' },
  rareLuck:    { name: 'Rare find luck',  icon: '🍀' },
  fishLuck:    { name: 'Fishing luck',    icon: '🎣' },
  fishFast:    { name: 'Quick bites',     icon: '⏱️' },
  autoBoost:   { name: 'Helper output',   icon: '🤖' },
  smeltFast:   { name: 'Smelting speed',  icon: '🔥' },
  xpBoost:     { name: 'Skill XP',        icon: '📚' },
  cropFast:    { name: 'Crop growth',     icon: '🌱' },
};

export const RECIPES = [
  // starters (known from the beginning)
  { id: 'roast_berries',  name: 'Roasted Berries',   icon: '🫐', tier: 0, start: true,
    ing: { berries: 3 }, fuel: 2, xp: 6,
    buff: { type: 'xpBoost', value: 10, minutes: 8 }, desc: 'Warm, sticky, motivating.' },
  { id: 'grilled_minnow', name: 'Grilled Minnow',    icon: '🐟', tier: 0, start: true,
    ing: { minnow: 2 }, fuel: 2, xp: 6,
    buff: { type: 'fishFast', value: 15, minutes: 8 }, desc: 'The classic first catch dinner.' },
  { id: 'herb_tea',       name: 'Forest Herb Tea',   icon: '🍵', tier: 0, start: true,
    ing: { herbs: 3 }, fuel: 1, xp: 5,
    buff: { type: 'gatherSpeed', value: 10, minutes: 8 }, desc: 'Puts a spring in your swing.' },

  // cooking-level unlocks
  { id: 'baked_potato',   name: 'Ember Baked Potato', icon: '🥔', tier: 0, cookLevel: 3,
    ing: { potato: 2, salt: 1 }, fuel: 3, xp: 10,
    buff: { type: 'gatherSpeed', value: 15, minutes: 12 }, desc: 'Crispy skin, molten middle.' },
  { id: 'mushroom_skewer', name: 'Mushroom Skewers', icon: '🍢', tier: 0, cookLevel: 5,
    ing: { mushroom: 3, herbs: 1 }, fuel: 3, xp: 12,
    buff: { type: 'doubleDrop', value: 12, minutes: 10 }, desc: 'Earthy, smoky, suspiciously moreish.' },
  { id: 'veggie_stew',    name: 'Homestead Stew',    icon: '🍲', tier: 1, cookLevel: 7,
    ing: { carrot: 2, potato: 2, herbs: 2 }, fuel: 5, xp: 18,
    buff: { type: 'gatherSpeed', value: 22, minutes: 18 }, desc: 'Tastes like progress.' },
  { id: 'honey_bread',    name: 'Honey Bread',       icon: '🍞', tier: 1, cookLevel: 9,
    ing: { wheat: 3, honey: 1, wild_egg: 1 }, fuel: 5, xp: 20,
    buff: { type: 'xpBoost', value: 25, minutes: 15 }, desc: 'Sweet fuel for sharp minds.' },
  { id: 'fish_pie',       name: 'Lakekeeper Pie',    icon: '🥧', tier: 1, cookLevel: 11,
    ing: { trout: 2, wheat: 2, wild_egg: 1 }, fuel: 6, xp: 24,
    buff: { type: 'fishLuck', value: 20, minutes: 15 }, desc: 'The lake respects those who bake.' },
  { id: 'miner_hotpot',   name: "Miner's Hotpot",    icon: '🍜', tier: 1, cookLevel: 13,
    ing: { potato: 2, mushroom: 2, salt: 2 }, fuel: 6, xp: 26,
    buff: { type: 'smeltFast', value: 25, minutes: 20 }, desc: 'Keeps the furnace — and you — roaring.' },
  { id: 'pumpkin_soup',   name: 'Harvest Pumpkin Soup', icon: '🎃', tier: 1, cookLevel: 15,
    ing: { pumpkin: 1, herbs: 2, honey: 1 }, fuel: 6, xp: 28,
    buff: { type: 'cropFast', value: 25, minutes: 25 }, desc: 'The garden grows to smell it again.' },

  // scroll-found recipes (rarer, stronger)
  { id: 'trail_mix',      name: "Wanderer's Trail Mix", icon: '🥜', tier: 0, scroll: true,
    ing: { berries: 2, honey: 1, wheat: 1 }, fuel: 1, xp: 14,
    buff: { type: 'doubleDrop', value: 18, minutes: 15 }, desc: 'Found scrawled on a trail marker.' },
  { id: 'smoked_eel',     name: 'Smoked Marsh Eel',  icon: '🐍', tier: 1, scroll: true,
    ing: { eel: 1, maple_wood: 1, salt: 1 }, fuel: 6, xp: 26,
    buff: { type: 'fishFast', value: 30, minutes: 18 }, desc: 'An old fisher’s secret.' },
  { id: 'golden_omelette', name: 'Golden Omelette',  icon: '🍳', tier: 1, scroll: true,
    ing: { wild_egg: 2, tomato: 1, herbs: 1 }, fuel: 5, xp: 24,
    buff: { type: 'rareLuck', value: 20, minutes: 15 }, desc: 'Glimmers faintly as it cooks.' },
  { id: 'clockwork_cocoa', name: 'Clockwork Cocoa',  icon: '☕', tier: 1, scroll: true,
    ing: { honey: 2, corn: 1, salt: 1 }, fuel: 4, xp: 22,
    buff: { type: 'autoBoost', value: 35, minutes: 30 }, desc: 'Your helpers hum a little faster.' },
  { id: 'truffle_pasta',  name: 'Truffle Pasta',     icon: '🍝', tier: 2, scroll: true,
    ing: { truffle: 1, wheat: 3, wild_egg: 1 }, fuel: 8, xp: 40,
    buff: { type: 'doubleDrop', value: 30, minutes: 25 }, desc: 'Worth every muddy dig.' },
  { id: 'moonlight_tart', name: 'Moonlight Tart',    icon: '🌙', tier: 2, scroll: true,
    ing: { moonblossom: 1, berries: 3, honey: 2 }, fuel: 8, xp: 45,
    buff: { type: 'rareLuck', value: 35, minutes: 25 }, desc: 'Tastes like a quiet midnight.' },
  { id: 'koi_sashimi',    name: 'Golden Koi Sashimi', icon: '🍣', tier: 2, scroll: true,
    ing: { golden_koi: 1, salt: 1 }, fuel: 2, xp: 60,
    buff: { type: 'fishLuck', value: 45, minutes: 30 }, desc: 'Almost too beautiful to eat. Almost.' },
  { id: 'star_jam',       name: 'Starfruit Jam',     icon: '✨', tier: 2, scroll: true,
    ing: { starfruit: 1, honey: 2, star_fragment: 1 }, fuel: 10, xp: 80,
    buff: { type: 'xpBoost', value: 50, minutes: 30 }, desc: 'Bottled starlight on toast.' },
  { id: 'leviathan_feast', name: 'Leviathan Feast',  icon: '🐉', tier: 2, scroll: true,
    ing: { leviathan: 1, pumpkin: 1, moonblossom: 1, salt: 2 }, fuel: 15, xp: 150,
    buff: { type: 'gatherSpeed', value: 50, minutes: 45 }, desc: 'A meal spoken of in legends. You cooked it.' },
];
export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const SCROLL_RECIPES = RECIPES.filter((r) => r.scroll).map((r) => r.id);
export const MAX_ACTIVE_BUFFS = 2;

// ═══════════════════════════════════════════════════════════════════════════
// CRAFTING — stations, automation helpers, farm plots, decor
// req: { items, skill: [skillId, level] }, gives station/build effect
// ═══════════════════════════════════════════════════════════════════════════
export const CRAFTS = [
  // Stations
  { id: 'workbench', cat: 'station', name: 'Workbench', icon: '🛠️', prosperity: 10,
    items: { pine_wood: 15, stone: 8 }, desc: 'Unlocks tool crafting and building.' },
  { id: 'smelter',   cat: 'station', name: 'Stone Smelter', icon: '🏭', prosperity: 15, needs: ['workbench'],
    items: { stone: 25, copper_ore: 6, pine_wood: 10 }, desc: 'Smelt ores into bars (runs in real time).' },
  { id: 'stove',     cat: 'station', name: 'Stone Cookstove', icon: '♨️', prosperity: 15, needs: ['workbench'],
    items: { stone: 20, iron_bar: 3, oak_wood: 12 }, skill: ['cook', 6], desc: 'Kitchen tier 2 — unlocks hearty recipes.' },
  { id: 'kitchen',   cat: 'station', name: 'Wildwood Kitchen', icon: '🍳', prosperity: 30, needs: ['stove'],
    items: { maple_wood: 20, silver_bar: 4, gold_bar: 2 }, skill: ['cook', 14], desc: 'Kitchen tier 3 — unlocks legendary dishes.' },

  // Automation helpers (idle production per hour, capped storage)
  { id: 'golem',     cat: 'auto', name: 'Lumber Golem', icon: '🪵', prosperity: 20, needs: ['workbench'],
    items: { oak_wood: 25, copper_bar: 5, living_root: 0 }, autoId: 'pine_wood', perHour: 12, capHours: 8,
    desc: 'A stumpy friend who stacks pine logs while you learn.' },
  { id: 'mole',      cat: 'auto', name: 'Mole Machine', icon: '⛏️', prosperity: 20, needs: ['smelter'],
    items: { iron_bar: 6, stone: 30, copper_bar: 4 }, autoId: 'stone', perHour: 10, capHours: 8,
    desc: 'Burrows politely. Returns with stone.' },
  { id: 'fishtrap',  cat: 'auto', name: 'Wicker Fish Trap', icon: '🪤', prosperity: 15, needs: ['workbench'],
    items: { fiber: 30, pine_wood: 10 }, autoId: 'minnow', perHour: 6, capHours: 8,
    desc: 'Catches minnows while the lake sleeps.' },
  { id: 'beebox',    cat: 'auto', name: 'Bee Box', icon: '🐝', prosperity: 15, needs: ['workbench'],
    items: { oak_wood: 15, honey: 3, fiber: 10 }, autoId: 'honey', perHour: 2, capHours: 12,
    desc: 'Happy bees, steady honey.' },

  // Farm expansion
  { id: 'plot1', cat: 'farm', name: 'Farm Plot (+2)', icon: '🟫', prosperity: 8,  needs: ['workbench'],
    items: { pine_wood: 12, stone: 6, fiber: 8 }, plots: 2, desc: 'Clear land for two more crop plots.' },
  { id: 'plot2', cat: 'farm', name: 'Rich Soil Plots (+3)', icon: '🟩', prosperity: 14, needs: ['plot1'],
    items: { oak_wood: 18, stone: 15, fiber: 15 }, plots: 3, desc: 'Three more plots of dark, rich soil.' },
  { id: 'plot3', cat: 'farm', name: 'Terraced Plots (+3)', icon: '🌄', prosperity: 20, needs: ['plot2'],
    items: { maple_wood: 20, iron_bar: 4, stone: 25 }, plots: 3, desc: 'Hillside terraces — the full dozen.' },
  { id: 'scarecrow', cat: 'farm', name: 'Scarecrow', icon: '🎃', prosperity: 10, needs: ['plot1'],
    items: { wheat: 5, fiber: 12, pine_wood: 6 }, effect: { cropFast: 10 }, decor: true,
    desc: 'Crops grow 10% faster under its watch.' },
  { id: 'sprinkler', cat: 'farm', name: 'Copper Sprinkler', icon: '⛲', prosperity: 12, needs: ['smelter', 'plot1'],
    items: { copper_bar: 6, iron_bar: 2 }, effect: { cropFast: 15 }, decor: true,
    desc: 'Crops grow 15% faster, and you stay dry.' },

  // Decor (placed on the homestead grid; pure prosperity + a few buffs)
  { id: 'fence',    cat: 'decor', name: 'Log Fence',     icon: '🪵', prosperity: 2,  items: { pine_wood: 4 }, decor: true, desc: 'Keeps nothing out. Looks great.' },
  { id: 'path',     cat: 'decor', name: 'Stone Path',    icon: '🪨', prosperity: 2,  items: { stone: 4 }, decor: true, desc: 'For purposeful striding.' },
  { id: 'flowerbed', cat: 'decor', name: 'Flowerbed',    icon: '🌷', prosperity: 4,  items: { fiber: 6, herbs: 3 }, decor: true, desc: 'A pop of meadow at home.' },
  { id: 'bench',    cat: 'decor', name: 'Oak Bench',     icon: '🪑', prosperity: 5,  items: { oak_wood: 8 }, decor: true, desc: 'For admiring your empire.' },
  { id: 'lantern',  cat: 'decor', name: 'Iron Lantern',  icon: '🏮', prosperity: 6,  needs: ['smelter'], items: { iron_bar: 2, fiber: 4 }, decor: true, desc: 'Warm light for cold nights.' },
  { id: 'gnome',    cat: 'decor', name: 'Lucky Gnome',   icon: '🧙', prosperity: 10, items: { stone: 10, ruby: 0, clover: 1 }, decor: true, effect: { rareLuck: 3 },
    desc: 'He knows where the treasure is. +3% rare luck.' },
  { id: 'fountain', cat: 'decor', name: 'Pearl Fountain', icon: '⛲', prosperity: 16, needs: ['workbench'], items: { stone: 30, pearl: 1, silver_bar: 2 }, decor: true, desc: 'The koi approve.' },
  { id: 'statue',   cat: 'decor', name: 'Champion Statue', icon: '🗿', prosperity: 22, needs: ['workbench'], items: { stone: 50, gold_bar: 2, fossil: 1 }, decor: true, desc: 'Modest? Never heard of it.' },
  { id: 'windmill', cat: 'decor', name: 'Windmill',      icon: '🌬️', prosperity: 28, needs: ['workbench'], items: { ironbark_wood: 20, iron_bar: 8, fiber: 20 }, decor: true, effect: { autoBoost: 10 },
    desc: 'Helpers work 10% faster in the breeze.' },
  { id: 'stargazer', cat: 'decor', name: 'Stargazer Dome', icon: '🔭', prosperity: 40, needs: ['workbench'], items: { mithril_bar: 3, star_fragment: 2, elder_wood: 10 }, decor: true, effect: { rareLuck: 5 },
    desc: 'See rare things coming. +5% rare luck.' },
];
export const CRAFT_MAP = Object.fromEntries(CRAFTS.map((c) => [c.id, c]));

// Homestead grid
export const GRID_COLS = 6;
export const GRID_ROWS = 5;
export const CABIN_PROSPERITY = 25;

// ═══════════════════════════════════════════════════════════════════════════
// PROSPERITY + TITLES + PROFILE
// ═══════════════════════════════════════════════════════════════════════════
export const prosperityOf = (save) => {
  if (!save) return 0;
  let p = CABIN_PROSPERITY;
  (save.crafted || []).forEach((id) => { p += CRAFT_MAP[id]?.prosperity || 0; });
  p += (save.discoveredRares || []).length * 5;
  p += (save.knownRecipes || []).length * 3;
  return p;
};

export const totalSkillLevel = (save) =>
  Object.keys(SKILLS).reduce((sum, k) => sum + skillLevel(save?.skills?.[k] || 0), 0);

export const HOMESTEAD_TITLES = [
  { id: 'wanderer',   name: 'Wanderer',          color: 'text-gray-500',    darkColor: 'text-slate-400',
    reqText: 'Arrive in the Wildwood',  check: () => true },
  { id: 'settler',    name: 'Settler',           color: 'text-green-600',   darkColor: 'text-green-400',
    reqText: '75 Prosperity',           check: (s) => prosperityOf(s) >= 75 },
  { id: 'gourmand',   name: 'Wildwood Gourmand', color: 'text-orange-600',  darkColor: 'text-orange-400',
    reqText: 'Know 10 recipes',         check: (s) => (s.knownRecipes || []).length >= 10 },
  { id: 'treasurer',  name: 'Treasure Hunter',   color: 'text-fuchsia-600', darkColor: 'text-fuchsia-400',
    reqText: 'Discover 5 rare curios',  check: (s) => (s.discoveredRares || []).length >= 5 },
  { id: 'homesteader', name: 'Homesteader',      color: 'text-blue-600',    darkColor: 'text-blue-400',
    reqText: '200 Prosperity',          check: (s) => prosperityOf(s) >= 200 },
  { id: 'angler',     name: 'Legend Angler',     color: 'text-cyan-600',    darkColor: 'text-cyan-400',
    reqText: 'Catch a legendary fish',  check: (s) => ['ghostfin', 'golden_koi', 'leviathan'].some((f) => (s.caughtFish || []).includes(f)) },
  { id: 'master',     name: 'Master of the Wilds', color: 'text-purple-600', darkColor: 'text-purple-400',
    reqText: 'Total skill level 75',    check: (s) => totalSkillLevel(s) >= 75 },
  { id: 'legend',     name: 'Wildwood Legend',   color: 'text-amber-600',   darkColor: 'text-amber-400',
    reqText: '400 Prosperity',          check: (s) => prosperityOf(s) >= 400 },
];
export const HOMESTEAD_TITLE_MAP = Object.fromEntries(HOMESTEAD_TITLES.map((t) => [t.id, t]));

// Profile hook for StudentsTab / StudentDashboard (same pattern as the others)
export const getHomesteadProfile = (homesteadData, isDark = false) => {
  if (!homesteadData) return null;
  const title = homesteadData.activeTitle ? HOMESTEAD_TITLE_MAP[homesteadData.activeTitle] : null;
  const prosperity = prosperityOf(homesteadData);
  if (!title && prosperity <= CABIN_PROSPERITY) return null;
  return {
    title: title ? { name: title.name, color: isDark ? title.darkColor : title.color } : null,
    prosperity,
    skillTotal: totalSkillLevel(homesteadData),
    recipes: (homesteadData.knownRecipes || []).length,
    rares: (homesteadData.discoveredRares || []).length,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT SAVE
// ═══════════════════════════════════════════════════════════════════════════
export const defaultSave = () => ({
  inv: { pine_wood: 5, berries: 3, carrot_seed: 2 },  // a wanderer's pockets
  gold: 15,                                            // trade coin (sell surplus / buy seeds)
  skills: { wood: 0, mine: 0, fish: 0, forage: 0, cook: 0 },
  tools: { axe: 0, pick: 0, rod: 0 },
  crafted: [],            // craft ids owned (stations/auto/farm/decor)
  grid: [],               // [{ slot, craftId }] homestead decor placements
  farm: [],               // [{ plot, seedId, readyAt }] active crops
  smelting: [],           // [{ slot, barId, doneAt }]
  knownRecipes: ['roast_berries', 'grilled_minnow', 'herb_tea'],
  unreadScrolls: 0,       // recipe scrolls waiting to be read
  activeBuffs: [],        // [{ recipeId, type, value, until }]
  autoCollectAt: {},      // { craftId: timestamp } automation anchors
  discoveredRares: [],    // unique rare item ids found (Curio Shelf)
  caughtFish: [],         // unique fish ids caught (fishing log)
  cookedDishes: [],       // unique recipe ids cooked
  counters: { chops: 0, mines: 0, casts: 0, forages: 0, cooks: 0, crafts: 0 },
  menagerieEssenceEarned: 0, // lifetime Wild Essence earned for Champion's Menagerie (claimed there)
  unlockedTitles: ['wanderer'],
  activeTitle: 'wanderer',
  lastSeen: null,
  lastSaved: null,
});
// EOF
