// components/games/Hangout/hangoutConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// MY HANGOUT v2 — personal rooms with:
// • FREE PLACEMENT (x/y percentages in wall/ground bands, no grid)
// • BUILDABLE AREAS (Games Den, Loft, Backyard, Observatory) — expensive,
//   rare-material expansions crafted from Wildwood resources
// • A big furniture catalog from the new /game icons/Hangout packs, with
//   per-item sizes and INTERACTIVE types (radio → real synced music, fridge →
//   your Wildwood pantry, stove → real cooking, arcade → game links, wheel →
//   daily prize spins)
// • LIVE PRESENCE — classmates appear and walk around in whichever hangout
//   they're visiting (worldRooms-style RTDB, under hangoutRooms/{class}/{owner})
// ─────────────────────────────────────────────────────────────────────────────

const WW = '/game icons/Wildwood';
const TS = '/game icons/Town Square';
const HF = '/game icons/Hangout/Furniture';
const HH = '/game icons/Hangout/Home';
const HE = '/game icons/Hangout/Education';
const HP = '/game icons/Hangout/Plants';
const HK = '/game icons/Hangout/Kitchen';
const HO = '/game icons/Hangout/Outdoor';

const T = {
  gold: 'sepia(1) saturate(5) hue-rotate(5deg) brightness(1.15)',
  purple: 'hue-rotate(260deg) saturate(1.5)',
  teal: 'hue-rotate(140deg) saturate(1.3)',
};

// Placement bands (percent of room height). Wall items hang in the wall band,
// ground items sit anywhere in the ground band — full horizontal freedom.
export const WALL_BAND = { top: 6, bottom: 44 };
export const GROUND_BAND = { top: 56, bottom: 92 };
export const WALL_SPLIT = 54; // % height where wall meets floor

// Furniture render sizes
export const SIZES = {
  sm: 'w-9 h-9 md:w-11 md:h-11',
  md: 'w-12 h-12 md:w-16 md:h-16',
  lg: 'w-16 h-16 md:w-24 md:h-24',
  xl: 'w-24 h-24 md:w-32 md:h-32',
};

// ═══════════════════════════════════════════════════════════════════════════
// AREAS — expansions built with serious Wildwood investment
// ═══════════════════════════════════════════════════════════════════════════
export const HANGOUT_AREAS = [
  { id: 'main', name: 'Main Room', icon: `${HH}/008-house.svg`, type: 'indoor', builtIn: true, style: 0,
    desc: 'Home sweet home.' },
  { id: 'trophy', name: 'Trophy Room', icon: `${HE}/037-trophy.svg`, type: 'indoor', builtIn: true, style: 10,
    desc: 'A dedicated hall for your weapon, curios, critters and trophy fish.' },
  { id: 'den', name: 'Games Den', icon: `${HF}/033-smart tv.svg`, type: 'indoor', style: 30,
    cost: { plank: 45, iron_bar: 12, hide: 12, tree_sap: 2, glimmer_dust: 1 },
    desc: 'A den for screens, snacks and rematches.' },
  { id: 'yard', name: 'Backyard', icon: `${HP}/020-sunflower.svg`, type: 'outdoor', style: 35,
    cost: { stone: 70, beech_wood: 50, fiber: 50, cherry_wood: 25, mandrake: 2, amber: 1 },
    desc: 'Open sky, real grass, room for a garden.' },
  { id: 'loft', name: 'Upstairs Loft', icon: `${HF}/035-stairs.svg`, type: 'indoor', style: 45,
    cost: { plank: 80, ironroot_wood: 25, iron_bar: 20, silver_bar: 8, moonpetal: 2, truffle: 1 },
    desc: 'A whole second floor. The view is worth every plank.' },
  { id: 'observatory', name: 'Observatory', icon: `${HE}/029-telescope.svg`, type: 'night', style: 70,
    cost: { mithril_bar: 5, gold_bar: 8, elder_wood: 15, glimmer_dust: 3, pearl: 1, diamond: 1 },
    desc: 'The ultimate build — a glass dome under the stars.' },
];
export const AREA_MAP = Object.fromEntries(HANGOUT_AREAS.map((a) => [a.id, a]));

// Fixed backdrops for special area types (indoor areas use wallpapers/floors)
export const OUTDOOR_SKY = 'linear-gradient(180deg, #8fd0f4 0%, #c3e7fb 70%, #dff2e0 100%)';
export const OUTDOOR_GROUND = 'linear-gradient(180deg, #7fae5c 0%, #699549 100%)';
export const NIGHT_SKY = 'linear-gradient(180deg, #0b1030 0%, #232a55 60%, #3b3f7a 100%)';
export const NIGHT_GROUND = 'repeating-linear-gradient(90deg, #3a3550 0 46px, #322d46 46px 50px)';

// ═══════════════════════════════════════════════════════════════════════════
// ROOM THEMES (indoor areas only)
// ═══════════════════════════════════════════════════════════════════════════
export const WALLPAPERS = [
  { id: 'cream',   name: 'Cottage Cream',  cost: 0,   css: 'linear-gradient(180deg, #f3e9d2 0%, #e8d9b8 100%)' },
  { id: 'sky',     name: 'Daydream Sky',   cost: 40,  css: 'linear-gradient(180deg, #bfe3f7 0%, #93c9ec 100%)' },
  { id: 'forest',  name: 'Forest Fern',    cost: 60,  css: 'linear-gradient(180deg, #cfe6c2 0%, #a4c98f 100%)' },
  { id: 'rose',    name: 'Rose Quartz',    cost: 60,  css: 'linear-gradient(180deg, #f7d9e3 0%, #ecb8cd 100%)' },
  { id: 'night',   name: 'Starlit Night',  cost: 120, css: 'linear-gradient(180deg, #232a55 0%, #3b3f7a 100%)' },
  { id: 'royal',   name: 'Royal Velvet',   cost: 200, css: 'linear-gradient(180deg, #4a1d6e 0%, #6b2fa0 100%)' },
];
export const FLOORS = [
  { id: 'oak',     name: 'Oak Boards',     cost: 0,   css: 'repeating-linear-gradient(90deg, #b9854c 0 46px, #a8763f 46px 50px)' },
  { id: 'stone',   name: 'Castle Stone',   cost: 50,  css: 'repeating-linear-gradient(90deg, #a8a294 0 60px, #948e80 60px 64px)' },
  { id: 'grass',   name: 'Meadow Grass',   cost: 70,  css: 'linear-gradient(180deg, #7fae5c 0%, #699549 100%)' },
  { id: 'checker', name: 'Checkered Tile', cost: 90,  css: 'repeating-linear-gradient(45deg, #d8d2c2 0 34px, #b8b2a2 34px 68px)' },
  { id: 'ice',     name: 'Glacier Glass',  cost: 150, css: 'linear-gradient(180deg, #bfe6ef 0%, #8fc9da 100%)' },
];
export const WALLPAPER_MAP = Object.fromEntries(WALLPAPERS.map((w) => [w.id, w]));
export const FLOOR_MAP = Object.fromEntries(FLOORS.map((f) => [f.id, f]));

// ═══════════════════════════════════════════════════════════════════════════
// MUSIC — real tracks the Wanderer Radio can play (synced for all visitors)
// ═══════════════════════════════════════════════════════════════════════════
export const MUSIC_TRACKS = [
  { id: 'lovely', name: 'Lovely', file: '/Music/lovely.mp3' },
  { id: 'morning', name: 'Morning Routine', file: '/Music/morning-routine.mp3' },
  { id: 'opensky', name: 'The Open Sky', file: '/Music/the-open-sky.mp3' },
  { id: 'ocean', name: 'Heart of the Ocean', file: '/Music/heart-of-the-ocean.mp3' },
  { id: 'petals', name: 'White Petals', file: '/Music/white-petals.mp3' },
  { id: 'beloved', name: 'Beloved', file: '/Music/beloved.mp3' },
  { id: 'embrace', name: 'Embrace', file: '/Music/embrace.mp3' },
  { id: 'boy', name: 'When I Was a Boy', file: '/Music/when-i-was-a-boy.mp3' },
  { id: 'transcend', name: 'Transcendence', file: '/Music/transcendence.mp3' },
];
export const MUSIC_MAP = Object.fromEntries(MUSIC_TRACKS.map((t) => [t.id, t]));

// ═══════════════════════════════════════════════════════════════════════════
// FURNITURE CATALOG
// zone: 'wall' | 'floor' | 'outdoor' (floor = any ground; outdoor = outdoor areas only)
// size: sm | md | lg | xl · interactive: radio|fridge|stove|games|wheel
// src: { gold } | { craft } | { found }
// ═══════════════════════════════════════════════════════════════════════════
export const FURNITURE = [
  // ── Comfy living (gold) ───────────────────────────────────────────────────
  { id: 'couch',      name: 'Comfy Couch',      img: `${HF}/034-sofa.svg`,        zone: 'floor', size: 'lg', style: 8,  src: { gold: 90 } },
  { id: 'sofa2',      name: 'Snug Sofa',        img: `${HF}/014-couch.svg`,       zone: 'floor', size: 'lg', style: 7,  src: { gold: 75 } },
  { id: 'armchair',   name: 'Reading Chair',    img: `${HF}/010-chair.svg`,       zone: 'floor', size: 'md', style: 4,  src: { gold: 40 } },
  { id: 'stool',      name: 'Little Stool',     img: `${HF}/036-stool.svg`,       zone: 'floor', size: 'sm', style: 2,  src: { gold: 15 } },
  { id: 'round_table', name: 'Round Table',     img: `${HF}/012-circle table.svg`, zone: 'floor', size: 'md', style: 4, src: { gold: 45 } },
  { id: 'dining_set', name: 'Dining Table',     img: `${HH}/015-Dining table.svg`, zone: 'floor', size: 'lg', style: 7, src: { gold: 85 } },
  { id: 'side_table', name: 'Side Table',       img: `${HF}/031-side table.svg`,  zone: 'floor', size: 'sm', style: 3,  src: { gold: 25 } },
  { id: 'double_bed', name: 'Dreamer Bed',      img: `${HH}/011-double bed.svg`,  zone: 'floor', size: 'xl', style: 10, src: { gold: 140 } },
  { id: 'nightstand', name: 'Night Stand',      img: `${HH}/028-night stand.svg`, zone: 'floor', size: 'sm', style: 3,  src: { gold: 30 } },
  { id: 'wardrobe',   name: 'Wardrobe',         img: `${HF}/039-wardrobe.svg`,    zone: 'floor', size: 'lg', style: 6,  src: { gold: 70 } },
  { id: 'floor_lamp', name: 'Floor Lamp',       img: `${HF}/029-floor lamp.svg`,  zone: 'floor', size: 'md', style: 4,  src: { gold: 35 } },
  { id: 'coffee_maker', name: 'Coffee Machine', img: `${HH}/009-coffee machine.svg`, zone: 'floor', size: 'sm', style: 4, src: { gold: 45 } },
  { id: 'washing',    name: 'Washing Machine',  img: `${HH}/021-washing machine.svg`, zone: 'floor', size: 'md', style: 5, src: { gold: 65 } },
  { id: 'bathtub',    name: 'Royal Bathtub',    img: `${HF}/003-bathtub.svg`,     zone: 'floor', size: 'lg', style: 9,  src: { gold: 120 } },
  { id: 'houseplant', name: 'House Plant',      img: `${HH}/013-plant.svg`,       zone: 'floor', size: 'md', style: 3,  src: { gold: 25 } },
  { id: 'bonsai',     name: 'Bonsai Tree',      img: `${HP}/021-bonsai.svg`,      zone: 'floor', size: 'sm', style: 5,  src: { gold: 55 } },

  // ── Wall pieces (gold) ────────────────────────────────────────────────────
  { id: 'window',     name: 'Sunny Window',     img: `${HF}/040-window.svg`,      zone: 'wall', size: 'lg', style: 6,  src: { gold: 60 } },
  { id: 'curtains',   name: 'Cozy Curtains',    img: `${HH}/012-curtains.svg`,    zone: 'wall', size: 'lg', style: 5,  src: { gold: 50 } },
  { id: 'frame',      name: 'Art Frame',        img: `${HF}/024-frame.svg`,       zone: 'wall', size: 'sm', style: 3,  src: { gold: 25 } },
  { id: 'mirror',     name: 'Wall Mirror',      img: `${HF}/030-mirror.svg`,      zone: 'wall', size: 'md', style: 5,  src: { gold: 45 } },
  { id: 'ceiling_lamp', name: 'Hanging Lamp',   img: `${HF}/009-ceiling lamp.svg`, zone: 'wall', size: 'md', style: 4, src: { gold: 40 } },
  { id: 'clock',      name: 'Vintage Clock',    img: `${HF}/038-vintage clock.svg`, zone: 'wall', size: 'md', style: 5, src: { gold: 55 } },
  { id: 'wall_shelf', name: 'Wall Shelf',       img: `${HH}/026-shelf.svg`,       zone: 'wall', size: 'md', style: 4,  src: { gold: 35 } },
  { id: 'banner',     name: 'Festival Banner',  img: `${TS}/005-banners.svg`,     zone: 'wall', size: 'md', style: 4,  src: { gold: 35 } },

  // ── Crafted from Wildwood resources ──────────────────────────────────────
  { id: 'bookshelf',  name: 'Grand Bookshelf',  img: `${HH}/030-bookshelf.svg`,   zone: 'floor', size: 'lg', style: 9,
    src: { craft: { plank: 10, cherry_wood: 8, hide: 2 } } },
  { id: 'study_desk', name: 'Study Desk',       img: `${HE}/005-desk.svg`,        zone: 'floor', size: 'lg', style: 7,
    src: { craft: { plank: 8, iron_bar: 2 } } },
  { id: 'desk_chair', name: 'Desk Chair',       img: `${HE}/036-desk chair.svg`,  zone: 'floor', size: 'md', style: 4,
    src: { craft: { plank: 4, hide: 3, fiber: 6 } } },
  { id: 'desk_lamp',  name: 'Desk Lamp',        img: `${HE}/027-desk lamp.svg`,   zone: 'floor', size: 'sm', style: 3,
    src: { craft: { copper_bar: 2, fiber: 4 } } },
  { id: 'easel',      name: 'Artist Easel',     img: `${HE}/038-easel.svg`,       zone: 'floor', size: 'lg', style: 7,
    src: { craft: { plank: 6, feather: 5 } } },
  { id: 'blackboard', name: 'Idea Blackboard',  img: `${HE}/009-blackboard.svg`,  zone: 'wall', size: 'lg', style: 6,
    src: { craft: { plank: 6, stone: 8 } } },
  { id: 'trophy_shelf', name: 'Trophy Shelf',   img: `${HE}/037-trophy.svg`,      zone: 'wall', size: 'md', style: 8,
    src: { craft: { gold_bar: 2, plank: 5 } } },
  { id: 'fireplace',  name: 'Stone Fireplace',  img: `${HF}/023-chimney.svg`,     zone: 'floor', size: 'xl', style: 12,
    src: { craft: { stone: 40, iron_bar: 4, tree_sap: 2 } } },
  { id: 'telescope',  name: 'Star Telescope',   img: `${HE}/029-telescope.svg`,   zone: 'floor', size: 'lg', style: 11,
    src: { craft: { silver_bar: 4, gold_bar: 2, glimmer_dust: 1 } } },
  { id: 'kitchen_unit', name: 'Kitchen Bench',  img: `${HF}/027-kitchen.svg`,     zone: 'floor', size: 'xl', style: 9,
    src: { craft: { plank: 12, stone: 15, iron_bar: 3 } } },
  { id: 'sink',       name: 'Kitchen Sink',     img: `${HH}/018-sink.svg`,        zone: 'floor', size: 'md', style: 4,
    src: { craft: { iron_bar: 3, copper_bar: 2 } } },
  { id: 'mailbox',    name: 'Friendly Mailbox', img: `${HH}/022-mail box.svg`,    zone: 'outdoor', size: 'md', style: 5,
    src: { craft: { plank: 4, copper_bar: 1 } } },

  // ── Interactive appliances ────────────────────────────────────────────────
  { id: 'fridge',     name: 'Pantry Fridge',    img: `${HF}/025-fridge.svg`,      zone: 'floor', size: 'lg', style: 8, interactive: 'fridge',
    src: { gold: 110 }, hint: 'Opens your real Wildwood pantry — visitors can peek, you can snack!' },
  { id: 'stove',      name: 'Home Stove',       img: `${HH}/017-stove.svg`,       zone: 'floor', size: 'lg', style: 9, interactive: 'stove',
    src: { craft: { iron_bar: 6, stone: 20, copper_bar: 3 } }, hint: 'Cook real Wildwood recipes without leaving home!' },
  { id: 'smart_tv',   name: 'Smart TV',         img: `${HF}/033-smart tv.svg`,    zone: 'wall', size: 'lg', style: 9, interactive: 'games',
    src: { gold: 160 }, hint: 'Opens the arcade — jump straight into any Champions game!' },
  { id: 'laptop',     name: 'Gamer Laptop',     img: `${HE}/012-laptop.svg`,      zone: 'floor', size: 'md', style: 7, interactive: 'games',
    src: { craft: { silver_bar: 3, copper_bar: 4, glimmer_dust: 1 } }, hint: 'Portable arcade!' },

  // ── Outdoor garden (Backyard & beyond) ────────────────────────────────────
  { id: 'sunflower_o', name: 'Giant Sunflower', img: `${HP}/020-sunflower.svg`,   zone: 'outdoor', size: 'lg', style: 5, src: { gold: 40 } },
  { id: 'flowerbed',  name: 'Flower Patch',     img: `${HP}/040-flower.svg`,      zone: 'outdoor', size: 'md', style: 4, src: { gold: 30 } },
  { id: 'tulips',     name: 'Tulip Row',        img: `${HP}/038-flower-2.svg`,    zone: 'outdoor', size: 'md', style: 4, src: { gold: 30 } },
  { id: 'cactus_big', name: 'Grand Cactus',     img: `${HP}/030-cactus.svg`,      zone: 'outdoor', size: 'lg', style: 6, src: { gold: 55 } },
  { id: 'cactus_pot', name: 'Potted Cactus',    img: `${HP}/026-cactus-4.svg`,    zone: 'outdoor', size: 'sm', style: 3, src: { gold: 20 } },
  { id: 'wheelbarrow', name: 'Wheelbarrow',     img: `${HP}/002-wheelbarrow.svg`, zone: 'outdoor', size: 'md', style: 4,
    src: { craft: { plank: 5, iron_bar: 2 } } },
  { id: 'lawnmower',  name: 'Lawn Mower',       img: `${HP}/001-lawn-mower.svg`,  zone: 'outdoor', size: 'md', style: 6,
    src: { craft: { iron_bar: 5, copper_bar: 3 } } },
  { id: 'garden_pot', name: 'Garden Pot',       img: `${HP}/011-pot.svg`,         zone: 'outdoor', size: 'sm', style: 2, src: { gold: 15 } },
  { id: 'bench_o',    name: 'Garden Bench',     img: `${HF}/005-bench.svg`,       zone: 'outdoor', size: 'lg', style: 6,
    src: { craft: { plank: 8, stone: 6 } } },

  // ── Cupboard collection (new!) ────────────────────────────────────────────
  { id: 'cupboard',   name: 'Country Cupboard', img: `${HF}/001-cupboard.svg`,    zone: 'floor', size: 'lg', style: 7,  src: { gold: 80 } },
  { id: 'display_cupboard', name: 'Display Cupboard', img: `${HF}/002-cupboard-1.svg`, zone: 'floor', size: 'lg', style: 10,
    src: { craft: { plank: 10, cherry_wood: 6, silver_bar: 2 } } },

  // ── Kitchen pack (new!) ───────────────────────────────────────────────────
  { id: 'kettle',     name: 'Whistling Kettle', img: `${HK}/025-kettle.svg`,      zone: 'floor', size: 'sm', style: 3,  src: { gold: 20 } },
  { id: 'teapot',     name: 'Granny Teapot',    img: `${HK}/045-teapot.svg`,      zone: 'floor', size: 'sm', style: 3,  src: { gold: 22 } },
  { id: 'toaster',    name: 'Pop-up Toaster',   img: `${HK}/047-toaster.svg`,     zone: 'floor', size: 'sm', style: 3,  src: { gold: 28 } },
  { id: 'microwave',  name: 'Microwave',        img: `${HK}/028-microwave.svg`,   zone: 'floor', size: 'md', style: 5,  src: { gold: 55 } },
  { id: 'coffee_pro', name: 'Barista Machine',  img: `${HK}/012-coffee machine.svg`, zone: 'floor', size: 'md', style: 6, src: { gold: 70 } },
  { id: 'blender',    name: 'Smoothie Blender', img: `${HK}/004-food blender.svg`, zone: 'floor', size: 'sm', style: 4, src: { gold: 35 } },
  { id: 'mixer',      name: 'Cake Mixer',       img: `${HK}/029-mixer.svg`,       zone: 'floor', size: 'sm', style: 5,  src: { gold: 45 } },
  { id: 'kitchen_sink2', name: 'Double Sink',   img: `${HK}/040-kitchen sink.svg`, zone: 'floor', size: 'md', style: 4,
    src: { craft: { iron_bar: 4, copper_bar: 2 } } },
  { id: 'pot_rack',   name: 'Copper Pot Set',   img: `${HK}/032-pans.svg`,        zone: 'wall', size: 'md', style: 5,
    src: { craft: { copper_bar: 4, iron_bar: 1 } } },
  { id: 'knife_block', name: 'Chef Knife Wall', img: `${HK}/026-knives.svg`,      zone: 'wall', size: 'md', style: 5,
    src: { craft: { iron_bar: 3, plank: 3 } } },
  { id: 'cutlery_set', name: 'Fancy Cutlery',   img: `${HK}/020-cutlery.svg`,     zone: 'wall', size: 'sm', style: 3,  src: { gold: 25 } },
  { id: 'dish_shelf', name: 'Dish Shelf',       img: `${HK}/017-dishes.svg`,      zone: 'wall', size: 'md', style: 4,  src: { gold: 40 } },
  { id: 'chef_hat',   name: 'Chef Hat Trophy',  img: `${HK}/008-chef hat.svg`,    zone: 'wall', size: 'sm', style: 5,  src: { gold: 45 } },
  { id: 'pasta_maker', name: 'Pasta Machine',   img: `${HK}/033-pasta machine.svg`, zone: 'floor', size: 'md', style: 7,
    src: { craft: { iron_bar: 4, copper_bar: 3, plank: 4 } } },
  { id: 'deep_fryer', name: 'Deep Fryer',       img: `${HK}/016-deep fryer.svg`,  zone: 'floor', size: 'md', style: 6,
    src: { craft: { iron_bar: 5, stone: 8 } } },
  { id: 'veggie_box', name: 'Veggie Crate',     img: `${HK}/049-vegetable box.svg`, zone: 'floor', size: 'sm', style: 3, src: { gold: 25 } },
  { id: 'kitchen_scale', name: 'Baker Scale',   img: `${HK}/014-scale.svg`,       zone: 'floor', size: 'sm', style: 3,  src: { gold: 20 } },
  { id: 'kitchen_timer', name: 'Egg Timer',     img: `${HK}/046-kitchen timer.svg`, zone: 'wall', size: 'sm', style: 3, src: { gold: 18 } },

  // ── Outdoor pack (new!) — garden glory for the Backyard ──────────────────
  { id: 'garden_fountain', name: 'Garden Fountain', img: `${HO}/002-fountain.svg`, zone: 'outdoor', size: 'xl', style: 14,
    src: { craft: { stone: 40, copper_bar: 4, pearl: 1 } } },
  { id: 'shade_tree', name: 'Shade Tree',       img: `${HO}/009-tree.svg`,        zone: 'outdoor', size: 'xl', style: 8,
    src: { craft: { beech_wood: 20, fiber: 15 } } },
  { id: 'hedge',      name: 'Trimmed Hedge',    img: `${HO}/010-shrub.svg`,       zone: 'outdoor', size: 'md', style: 4, src: { gold: 30 } },
  { id: 'garden_fence', name: 'Picket Fence',   img: `${HO}/033-fence.svg`,       zone: 'outdoor', size: 'md', style: 4,
    src: { craft: { plank: 5, fiber: 5 } } },
  { id: 'garden_shed', name: 'Garden Shed',     img: `${HO}/048-shed.svg`,        zone: 'outdoor', size: 'xl', style: 11,
    src: { craft: { plank: 18, stone: 12, iron_bar: 3 } } },
  { id: 'garden_lamp', name: 'Garden Lantern',  img: `${HO}/049-lamp.svg`,        zone: 'outdoor', size: 'md', style: 5, src: { gold: 45 } },
  { id: 'park_bench', name: 'Park Bench',       img: `${HO}/050-bench.svg`,       zone: 'outdoor', size: 'lg', style: 6,
    src: { craft: { plank: 8, iron_bar: 2 } } },
  { id: 'sprinkler_o', name: 'Lawn Sprinkler',  img: `${HO}/029-sprinkler.svg`,   zone: 'outdoor', size: 'sm', style: 4, src: { gold: 35 } },
  { id: 'garden_hose', name: 'Garden Hose',     img: `${HO}/030-hose.svg`,        zone: 'outdoor', size: 'sm', style: 2, src: { gold: 15 } },
  { id: 'big_mushroom', name: 'Giant Toadstool', img: `${HO}/017-mushroom.svg`,   zone: 'outdoor', size: 'md', style: 5, src: { gold: 40 } },
  { id: 'stone_pile', name: 'Zen Stones',       img: `${HO}/005-stones.svg`,      zone: 'outdoor', size: 'sm', style: 3, src: { gold: 20 } },
  { id: 'tree_stump', name: 'Old Tree Stump',   img: `${HO}/004-tree stump.svg`,  zone: 'outdoor', size: 'md', style: 3, src: { gold: 18 } },
  { id: 'hanging_pot', name: 'Hanging Basket',  img: `${HO}/008-hanging pot.svg`, zone: 'wall', size: 'sm', style: 4,  src: { gold: 30 } },
  { id: 'pink_flamingo', name: 'Pink Flamingo', img: `${HO}/047-flamingo.svg`,    zone: 'outdoor', size: 'md', style: 7, src: { gold: 75 } },
  { id: 'bird_friend', name: 'Humming Bird',    img: `${HO}/037-humming bird.svg`, zone: 'outdoor', size: 'sm', style: 5, src: { gold: 50 } },
  { id: 'garden_turtle', name: 'Garden Turtle', img: `${HO}/039-turtle.svg`,      zone: 'outdoor', size: 'sm', style: 5, src: { gold: 50 } },
  { id: 'wheelbarrow2', name: 'Work Wheelbarrow', img: `${HO}/031-wheelbarrow.svg`, zone: 'outdoor', size: 'md', style: 4,
    src: { craft: { plank: 5, iron_bar: 2 } } },
  { id: 'waterfall_feature', name: 'Waterfall Feature', img: `${HO}/003-waterfall.svg`, zone: 'outdoor', size: 'xl', style: 16,
    src: { craft: { stone: 60, silver_bar: 4, glimmer_dust: 1, pearl: 1 } } },

  // ── Interactive outdoor & garden growing (new!) ───────────────────────────
  { id: 'bbq',        name: 'Backyard BBQ',     img: `${HK}/002-barbecue.svg`,    zone: 'outdoor', size: 'lg', style: 9, interactive: 'stove',
    src: { craft: { iron_bar: 5, stone: 12, copper_bar: 2 } }, hint: 'Cook real Wildwood recipes under the open sky!' },
  { id: 'farm_plot',  name: 'Garden Bed',       img: `${HO}/014-vegetable garden.svg`, zone: 'outdoor', size: 'lg', style: 6, interactive: 'farm',
    src: { craft: { plank: 6, stone: 8, fiber: 12 } }, hint: 'Plant real Wildwood seeds and harvest the crops right here!' },

  // ── Super-rare Wildwood expedition finds (interactive showpieces!) ───────
  { id: 'retro_radio', name: 'Wanderer Radio',  img: `${WW}/Adventure/011-radio.svg`, zone: 'floor', size: 'md', style: 14, interactive: 'radio',
    src: { found: true }, hint: 'Plays REAL music that everyone in your hangout hears!' },
  { id: 'lucky_wheel', name: 'Wheel of Fortune', img: `${WW}/Magic/045-fortune wheel.svg`, zone: 'wall', size: 'lg', style: 14, interactive: 'wheel',
    src: { found: true }, hint: 'One free spin a day — visitors can spin it too!' },
  { id: 'dj_corner',  name: 'DJ Headphones',    img: `${WW}/Adventure/020-headphones.svg`, zone: 'wall', size: 'md', style: 12, interactive: 'radio',
    src: { found: true }, hint: 'A second way to control the tunes.' },
  { id: 'crystal_lamp', name: 'Crystal Chandelier', img: `${WW}/Mining/006-crystals.svg`, tint: T.gold, zone: 'wall', size: 'lg', style: 16,
    src: { found: true } },
  { id: 'garden_gnome', name: 'Grinning Garden Gnome', img: `${HO}/051-gnome.svg`, zone: 'outdoor', size: 'md', style: 14,
    src: { found: true }, hint: 'A legendary wanderer. He chose YOUR garden.' },
];
export const FURNITURE_MAP = Object.fromEntries(FURNITURE.map((f) => [f.id, f]));
export const FOUND_FURNITURE_ITEMS = ['retro_radio', 'lucky_wheel', 'dj_corner', 'crystal_lamp', 'garden_gnome'];

// ═══════════════════════════════════════════════════════════════════════════
// SHOWCASES (main room)
// ═══════════════════════════════════════════════════════════════════════════
export const CURIO_PEDESTALS = 3;
export const CRITTER_FRAMES = 3;
export const FISH_TROPHIES = 1;

export const WHEEL_PRIZES = [5, 8, 10, 12, 15, 20, 25, 40]; // gold

// ═══════════════════════════════════════════════════════════════════════════
// STYLE SCORE
// ═══════════════════════════════════════════════════════════════════════════
export const styleScoreOf = (h) => {
  if (!h) return 0;
  let s = 0;
  const areas = h.areas || {};
  Object.values(areas).forEach((a) => (a?.placed || []).forEach((p) => { s += FURNITURE_MAP[p.itemId]?.style || 0; }));
  // legacy shape (pre-areas)
  (h.placed || []).forEach((p) => { s += FURNITURE_MAP[p.itemId]?.style || 0; });
  (h.built || []).forEach((id) => { s += AREA_MAP[id]?.style || 0; });
  s += (WALLPAPER_MAP[(areas.main || h).wallpaper]?.cost || 0) > 0 ? 5 : 0;
  s += (FLOOR_MAP[(areas.main || h).floor]?.cost || 0) > 0 ? 5 : 0;
  s += (h.showcase?.curios || []).filter(Boolean).length * 6;
  s += (h.showcase?.critters || []).filter(Boolean).length * 3;
  s += h.showcase?.fish ? 6 : 0;
  return s;
};

export const newPlacedId = () => `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const defaultSave = () => ({
  built: ['main', 'trophy'],
  areas: {
    main: { wallpaper: 'cream', floor: 'oak', placed: [] },
    trophy: { wallpaper: 'cream', floor: 'stone', placed: [] },
  },
  ownedWallpapers: ['cream'],
  ownedFloors: ['oak'],
  owned: {},
  showcase: { curios: [], critters: [], fish: null },
  showcaseRoom: 'main',  // 'main' | 'trophy' — where collections are displayed
  farms: {},             // { placedId: { seedId, readyAt } } — backyard Garden Beds
  wheelDay: null,        // last day this student spun ANY Wheel of Fortune
  lastSeen: null,
  lastSaved: null,
});
// EOF
