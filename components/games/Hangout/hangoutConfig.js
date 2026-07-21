// components/games/Hangout/hangoutConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// MY HANGOUT 🛋️ — every student gets their own 2D room to decorate and show
// off. Furniture is BOUGHT with Wildwood gold, CRAFTED from Wildwood
// resources, or FOUND as super-rare treasures on Wildwood expeditions.
// Showcases display real collectables: Forge weapon on the wall, Menagerie
// companion wandering the floor, curio pedestals, critter frames and a
// trophy fish. Classmates' rooms are visitable (read-only) from class data.
//
// Save lives in studentData.hangoutData. Gold/resources are spent from
// studentData.homesteadData (same local-clone pattern as Town Square).
// ─────────────────────────────────────────────────────────────────────────────

const WW = '/game icons/Wildwood';
const TS = '/game icons/Town Square';

// Room grid: wall rows hold wall-mounted items, floor rows hold furniture.
export const ROOM_COLS = 10;
export const WALL_ROWS = 2;   // rows 0..1
export const FLOOR_ROWS = 3;  // rows 2..4
export const ROOM_ROWS = WALL_ROWS + FLOOR_ROWS;

const T = {
  copper: 'sepia(1) saturate(3) hue-rotate(-25deg)',
  gold: 'sepia(1) saturate(5) hue-rotate(5deg) brightness(1.15)',
  purple: 'hue-rotate(260deg) saturate(1.5)',
  teal: 'hue-rotate(140deg) saturate(1.3)',
  dark: 'brightness(0.7) saturate(0.9)',
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOM THEMES — wallpapers & floors (pure CSS, bought with gold)
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
// FURNITURE CATALOG
// zone: 'wall' | 'floor' · style: Style Score points
// src: { gold } bought · { craft } built from Wildwood resources ·
//      { found } super-rare Wildwood expedition treasure (moved in from inv)
// ═══════════════════════════════════════════════════════════════════════════
export const FURNITURE = [
  // ── Bought with gold ──────────────────────────────────────────────────────
  { id: 'bench',      name: 'Park Bench',       img: `${TS}/003-bench.svg`,          zone: 'floor', style: 4,  src: { gold: 35 } },
  { id: 'tulip_pot',  name: 'Tulip Pot',        img: `${WW}/Nature/010-tulip.svg`,   zone: 'floor', style: 3,  src: { gold: 20 } },
  { id: 'sunflower',  name: 'Sunny Sunflower',  img: `${WW}/Nature/011-sunflower.svg`, zone: 'floor', style: 3, src: { gold: 25 } },
  { id: 'shroomlamp', name: 'Mushroom Lamp',    img: `${WW}/Nature/006-mushroom.svg`, tint: T.purple, zone: 'floor', style: 5, src: { gold: 45 } },
  { id: 'fridge',     name: 'Snack Fridge',     img: `${WW}/Cooking/009-refrigerator.svg`, zone: 'floor', style: 6, src: { gold: 80 } },
  { id: 'toaster',    name: 'Trusty Toaster',   img: `${WW}/Cooking/007-toaster.svg`, zone: 'floor', style: 3, src: { gold: 30 } },
  { id: 'wok_stand',  name: 'Noodle Cart',      img: `${WW}/Cooking/041-wok.svg`,    zone: 'floor', style: 5,  src: { gold: 55 } },
  { id: 'balloons',   name: 'Party Balloons',   img: `${TS}/004-ballons.svg`,        zone: 'floor', style: 4,  src: { gold: 30 } },
  { id: 'lantern',    name: 'Brass Lantern',    img: `${WW}/Camping/002-oil-lamp.svg`, zone: 'wall', style: 3, src: { gold: 25 } },
  { id: 'banner',     name: 'Festival Banner',  img: `${TS}/005-banners.svg`,        zone: 'wall', style: 4,  src: { gold: 35 } },
  { id: 'wall_map',   name: 'Adventurer Map',   img: `${TS}/007-old-map.svg`,        zone: 'wall', style: 5,  src: { gold: 50 } },
  { id: 'star_chartw', name: 'Star Chart',      img: `${WW}/Magic/049-constellation.svg`, zone: 'wall', style: 6, src: { gold: 70 } },
  { id: 'wall_clock', name: 'Wanderer Watch',   img: `${WW}/Adventure/049-watch.svg`, zone: 'wall', style: 4, src: { gold: 40 } },
  { id: 'photo_wall', name: 'Memory Camera',    img: `${WW}/Adventure/005-camera.svg`, zone: 'wall', style: 5, src: { gold: 60 } },

  // ── Crafted from Wildwood resources ──────────────────────────────────────
  { id: 'log_table',  name: 'Log Table',        img: `${WW}/Nature/003-wood.svg`,    zone: 'floor', style: 4,
    src: { craft: { plank: 4, beech_wood: 6 } } },
  { id: 'storage_crate', name: 'Storage Crate', img: `${WW}/More/004-crate.svg`,     zone: 'floor', style: 3,
    src: { craft: { plank: 3, fiber: 8 } } },
  { id: 'cozy_firepit', name: 'Cozy Firepit',   img: `${WW}/Camping/001-fire.svg`,   zone: 'floor', style: 7,
    src: { craft: { stone: 12, beech_wood: 10, tree_sap: 1 } } },
  { id: 'stew_corner', name: 'Stew Corner',     img: `${WW}/Camping/004-cooking-pot.svg`, zone: 'floor', style: 5,
    src: { craft: { iron_bar: 2, cherry_wood: 6 } } },
  { id: 'brew_station', name: 'Mini Cauldron',  img: `${WW}/Magic/008-cauldron.svg`, tint: T.teal, zone: 'floor', style: 8,
    src: { craft: { iron_bar: 4, mandrake: 1 } } },
  { id: 'shelf',      name: 'Spellbook Shelf',  img: `${WW}/Magic/039-spellbook.svg`, zone: 'wall', style: 6,
    src: { craft: { plank: 6, hide: 2 } } },
  { id: 'mirror',     name: 'Enchanted Mirror', img: `${WW}/Magic/041-magic mirror.svg`, zone: 'wall', style: 8,
    src: { craft: { silver_bar: 3, glimmer_dust: 1 } } },
  { id: 'candle_row', name: 'Candle Row',       img: `${WW}/Magic/004-candle.svg`,   zone: 'wall', style: 4,
    src: { craft: { honey: 4, fiber: 6 } } },
  { id: 'trophy_bar', name: 'Golden Trophy Bar', img: `${WW}/Mining/008-gold-ingots.svg`, zone: 'wall', style: 9,
    src: { craft: { gold_bar: 3, plank: 4 } } },

  // ── Super-rare Wildwood expedition finds (kind 'furniture' in the pack) ──
  { id: 'retro_radio', name: 'Wanderer Radio',  img: `${WW}/Adventure/011-radio.svg`, zone: 'floor', style: 12, src: { found: true } },
  { id: 'lucky_wheel', name: 'Wheel of Fortune', img: `${WW}/Magic/045-fortune wheel.svg`, zone: 'wall', style: 12, src: { found: true } },
  { id: 'dj_corner',  name: 'DJ Headphones',    img: `${WW}/Adventure/020-headphones.svg`, zone: 'wall', style: 12, src: { found: true } },
  { id: 'crystal_lamp', name: 'Crystal Chandelier', img: `${WW}/Mining/006-crystals.svg`, tint: T.gold, zone: 'wall', style: 14, src: { found: true } },
];
export const FURNITURE_MAP = Object.fromEntries(FURNITURE.map((f) => [f.id, f]));
// Wildwood item ids for the rare finds (added to homestead ITEMS + drop tables)
export const FOUND_FURNITURE_ITEMS = ['retro_radio', 'lucky_wheel', 'dj_corner', 'crystal_lamp'];

// ═══════════════════════════════════════════════════════════════════════════
// SHOWCASES — display real collectables from the other games
// ═══════════════════════════════════════════════════════════════════════════
export const CURIO_PEDESTALS = 3;   // pick curios you've DISCOVERED in Wildwood
export const CRITTER_FRAMES = 3;    // pick critters from your collection
export const FISH_TROPHIES = 1;     // one mounted trophy fish

// ═══════════════════════════════════════════════════════════════════════════
// STYLE SCORE
// ═══════════════════════════════════════════════════════════════════════════
export const styleScoreOf = (h) => {
  if (!h) return 0;
  let s = 0;
  (h.placed || []).forEach((p) => { s += FURNITURE_MAP[p.itemId]?.style || 0; });
  s += (WALLPAPER_MAP[h.wallpaper]?.cost || 0) > 0 ? 5 : 0;
  s += (FLOOR_MAP[h.floor]?.cost || 0) > 0 ? 5 : 0;
  s += (h.showcase?.curios || []).filter(Boolean).length * 6;
  s += (h.showcase?.critters || []).filter(Boolean).length * 3;
  s += h.showcase?.fish ? 6 : 0;
  return s;
};

export const defaultSave = () => ({
  wallpaper: 'cream',
  floor: 'oak',
  ownedWallpapers: ['cream'],
  ownedFloors: ['oak'],
  owned: {},            // { furnitureId: count } (bought/crafted/moved-in)
  placed: [],           // [{ slot, itemId }] — slot = row * ROOM_COLS + col
  showcase: { curios: [], critters: [], fish: null },
  lastSeen: null,
  lastSaved: null,
});
// EOF
