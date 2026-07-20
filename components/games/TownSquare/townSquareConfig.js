// components/games/TownSquare/townSquareConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// TOWN SQUARE — shared config. A live multiplayer plaza that ties Wildwood
// Homestead, Champions Menagerie and Champions Forge (Sweet Empire) together:
// students walk around as their real avatar, chat, build market stalls out of
// Wildwood resources to trade spare items/gold, and challenge each other to
// quick head-to-head minigames.
//
// Realtime world state (position/chat/stalls-for-sale/challenges) lives in the
// Realtime Database under `worldRooms/{classCode}` — same pattern as
// MultiplayerAgarGame.js. Durable stall ownership + stock is mirrored into
// studentData.homesteadData (inv/gold) via updateStudentData, exactly like
// WildwoodHomesteadGame.js, so building/trading really consumes & rewards
// real Wildwood resources.
//
// The plaza is a big scrollable world (WORLD_W x WORLD_H pixels) — bigger
// than any single screen — with a camera that follows the local player, so
// there's real room to walk around. All positions below are plain pixel
// coordinates inside that world.
// ─────────────────────────────────────────────────────────────────────────────

const TS = '/game icons/Town Square';
const WW = '/game icons/Wildwood';

export const NETWORK_RATE = 120; // ms between position/state syncs
export const CHAT_BUBBLE_MS = 5000;

export const WORLD_W = 2200;
export const WORLD_H = 1400;
export const MARGIN = 60; // keep the avatar this far from the world edge
export const INTERACT_RADIUS = 150; // px — how close you must be to a stall/player to interact
export const MOVE_SPEED = 4.2; // px per animation frame at full key-hold
export const CAMERA_LERP = 0.12; // how quickly the camera catches up to the player

const CX = WORLD_W / 2;
const CY = WORLD_H / 2;

// ═══════════════════════════════════════════════════════════════════════════
// STALL PLOTS — fixed claimable locations around the plaza (pixel coords)
// ═══════════════════════════════════════════════════════════════════════════
export const PLOTS = [
  { id: 'plot1', x: WORLD_W * 0.10, y: WORLD_H * 0.34 },
  { id: 'plot2', x: WORLD_W * 0.18, y: WORLD_H * 0.14 },
  { id: 'plot3', x: WORLD_W * 0.37, y: WORLD_H * 0.06 },
  { id: 'plot4', x: WORLD_W * 0.63, y: WORLD_H * 0.06 },
  { id: 'plot5', x: WORLD_W * 0.82, y: WORLD_H * 0.14 },
  { id: 'plot6', x: WORLD_W * 0.90, y: WORLD_H * 0.34 },
  { id: 'plot7', x: WORLD_W * 0.16, y: WORLD_H * 0.82 },
  { id: 'plot8', x: WORLD_W * 0.84, y: WORLD_H * 0.82 },
  { id: 'plot9', x: WORLD_W * 0.50, y: WORLD_H * 0.90 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STALL TIERS — built with real Wildwood resources (studentData.homesteadData.inv)
// ═══════════════════════════════════════════════════════════════════════════
export const STALL_TIERS = [
  {
    tier: 1,
    name: 'Roadside Cart',
    img: `${TS}/009-cart.svg`,
    slots: 3,
    cost: { beech_wood: 12, stone: 6 },
    color: '#a16207',
  },
  {
    tier: 2,
    name: 'Timber Stall',
    img: `${TS}/002-market.svg`,
    slots: 5,
    cost: { cherry_wood: 10, stone: 15, fiber: 12 },
    color: '#b45309',
  },
  {
    tier: 3,
    name: 'Grand Bazaar Stand',
    img: `${TS}/003-medieval-house.svg`,
    slots: 8,
    cost: { ironroot_wood: 15, iron_bar: 6, emerald: 2 },
    color: '#7c3aed',
  },
];

export const EMPTY_PLOT_IMG = `${TS}/001-stand.svg`;

export const STALL_THEMES = [
  { id: 'red', label: 'Crimson', color: '#dc2626' },
  { id: 'blue', label: 'Ocean', color: '#2563eb' },
  { id: 'green', label: 'Forest', color: '#16a34a' },
  { id: 'purple', label: 'Royal', color: '#7c3aed' },
  { id: 'gold', label: 'Golden', color: '#ca8a04' },
  { id: 'pink', label: 'Blossom', color: '#db2777' },
];

// ═══════════════════════════════════════════════════════════════════════════
// MINIGAMES — quick head-to-head challenges playable anywhere in the plaza
// ═══════════════════════════════════════════════════════════════════════════
export const MINIGAMES = [
  { id: 'rps', name: 'Rock Paper Scissors', icon: '✊', iconImg: `${TS}/013-rock-paper-scissors.svg`, desc: 'Best of 3 throws' },
  { id: 'coinflip', name: 'Coin Flip', icon: '🪙', iconImg: `${TS}/017-coin-heads.svg`, desc: 'Call it in the air' },
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', desc: 'Classic 3x3 grid' },
  { id: 'connect4', name: 'Connect Four', icon: '🔴', desc: 'Line up 4 in a row' },
  { id: 'quickdraw', name: 'Quick Draw', icon: '⚡', desc: 'Fastest tap wins' },
];

export const MINIGAME_MAP = Object.fromEntries(MINIGAMES.map((m) => [m.id, m]));

// ═══════════════════════════════════════════════════════════════════════════
// EVENTS / ANNOUNCEMENTS — town-wide feed (victories, purchases, restocks)
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_BANNER_MS = 5000;

// Quick emotes (deliberately old, universally-supported emoji codepoints)
export const EMOTES = ['😀', '❤️', '👍', '🎉', '😮', '😢'];

// ═══════════════════════════════════════════════════════════════════════════
// THE WANDERING MERCHANT — class-shared central shop (worldRooms/{code}/shop)
// Stock is random, limited, and shared by the whole class. When the class
// completes the donation task, the caravan restocks with fresh goods.
// ═══════════════════════════════════════════════════════════════════════════
export const MERCHANT = { x: CX, y: WORLD_H * 0.30 };
export const MERCHANT_IMG = `${TS}/010-caravan.svg`;
export const SHOP_SLOTS = 6;

// What the merchant may sell: [itemId, minQty, maxQty, price(gold each)]
export const SHOP_POOL = [
  ['salt', 3, 6, 5], ['rice', 3, 6, 5], ['pasta', 3, 6, 7], ['sugar', 3, 6, 7],
  ['olive_oil', 2, 5, 9], ['cocoa', 2, 5, 11], ['honey', 2, 4, 12],
  ['hide', 2, 4, 18], ['bone', 3, 6, 10], ['feather', 3, 6, 9],
  ['plank', 2, 4, 12], ['iron_bar', 1, 3, 38], ['copper_bar', 2, 4, 20],
  ['tomato_seed', 2, 4, 6], ['corn_seed', 2, 4, 10], ['strawberry_seed', 2, 3, 13],
  ['pumpkin_seed', 1, 3, 26], ['sunfruit_seed', 1, 1, 75],
  ['tree_sap', 1, 2, 40], ['mandrake', 1, 2, 70], ['truffle', 1, 1, 95],
  ['glimmer_dust', 1, 1, 110], ['emerald', 1, 1, 100], ['moonpetal', 1, 2, 80],
];

// Donation tasks the class works on together to restock the caravan
export const RESTOCK_TASKS = [
  ['fiber', 30], ['beech_wood', 30], ['stone', 30], ['berries', 25],
  ['minnow', 20], ['acorn', 25], ['basil', 20], ['meat', 15],
  ['cherry_wood', 20], ['copper_ore', 18], ['mushroom', 18], ['wild_egg', 15],
];

// Roll a fresh set of shop stock (the single client that wins the restock
// transaction generates and writes it — no cross-client determinism needed).
export const rollShopStock = () => {
  const pool = [...SHOP_POOL];
  const stock = {};
  for (let i = 0; i < SHOP_SLOTS && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [itemId, lo, hi, price] = pool.splice(idx, 1)[0];
    stock[`s${i}`] = { itemId, qty: lo + Math.floor(Math.random() * (hi - lo + 1)), price };
  }
  return stock;
};

export const rollRestockTask = () => {
  const [itemId, need] = RESTOCK_TASKS[Math.floor(Math.random() * RESTOCK_TASKS.length)];
  return { itemId, need, have: 0 };
};

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);

// Rock/Paper/Scissors throw icons (rock reuses the "stone" icon from the
// Town Square pack — there's no dedicated rock icon, and it's a perfect fit).
export const RPS_THROWS = [
  { id: 'rock', img: `${TS}/012-stone.svg` },
  { id: 'paper', img: `${TS}/014-paper.svg` },
  { id: 'scissors', img: `${TS}/015-scissors.svg` },
];
export const COIN_HEADS_IMG = `${TS}/017-coin-heads.svg`;
export const COIN_TAILS_IMG = `${TS}/016-coin-tails.svg`;

// ═══════════════════════════════════════════════════════════════════════════
// AVATAR helpers
// ═══════════════════════════════════════════════════════════════════════════
export const AVATAR_RING_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee',
  '#60a5fa', '#a78bfa', '#f472b6', '#2dd4bf', '#fbbf24',
];

export const ringColorFor = (id = '') => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return AVATAR_RING_COLORS[h % AVATAR_RING_COLORS.length];
};

export const levelFor = (totalPoints = 0) =>
  Math.min(4, Math.max(1, Math.floor((Number(totalPoints) || 0) / 100) + 1));

// ═══════════════════════════════════════════════════════════════════════════
// Cost helpers — shared by stall-building UI
// ═══════════════════════════════════════════════════════════════════════════
export const canAfford = (inv = {}, cost = {}) =>
  Object.entries(cost).every(([id, qty]) => (Number(inv[id]) || 0) >= qty);

export const deductCost = (inv = {}, cost = {}) => {
  const next = { ...inv };
  Object.entries(cost).forEach(([id, qty]) => {
    next[id] = Math.max(0, (Number(next[id]) || 0) - qty);
    if (next[id] === 0) delete next[id];
  });
  return next;
};

export const fmtCost = (cost, ITEMS) =>
  Object.entries(cost)
    .map(([id, qty]) => `${qty}× ${ITEMS[id]?.name || id}`)
    .join(', ');

// ═══════════════════════════════════════════════════════════════════════════
// Decorative plaza scenery — real SVGs from the Town Square icon pack and the
// Wildwood icon folders (trees/flowers/lamps), spread across the bigger
// world. `emoji` entries are used only where no matching icon exists (the
// fountain centerpiece).
// ═══════════════════════════════════════════════════════════════════════════
export const DECOR = [
  // Centerpiece fountain (real icon — no emoji dependence)
  { img: `${WW}/Water/001-spring.svg`, x: CX, y: CY, size: 100 },
  // Marketplace props around the merchant caravan
  { img: `${TS}/004-money-bag.svg`, x: CX - 90, y: WORLD_H * 0.315, size: 40 },
  { img: `${TS}/011-old-scroll.svg`, x: CX + 92, y: WORLD_H * 0.305, size: 42 },
  { img: `${TS}/005-banners.svg`, x: CX - 150, y: WORLD_H * 0.26, size: 60 },
  { img: `${TS}/005-banners.svg`, x: CX + 150, y: WORLD_H * 0.26, size: 60 },

  // Landmark + flavor buildings from the Town Square pack
  { img: `${TS}/006-tower.svg`, x: CX, y: WORLD_H * 0.075, size: 140 },
  { img: `${TS}/005-banners.svg`, x: WORLD_W * 0.32, y: WORLD_H * 0.12, size: 70 },
  { img: `${TS}/005-banners.svg`, x: WORLD_W * 0.68, y: WORLD_H * 0.12, size: 70 },
  { img: `${TS}/010-caravan.svg`, x: WORLD_W * 0.05, y: CY, size: 110 },
  { img: `${TS}/007-old-map.svg`, x: WORLD_W * 0.95, y: CY, size: 90 },
  { img: `${TS}/008-medieval-house-1.svg`, x: WORLD_W * 0.06, y: WORLD_H * 0.09, size: 100 },
  { img: `${TS}/008-medieval-house-1.svg`, x: WORLD_W * 0.94, y: WORLD_H * 0.09, size: 100 },

  // Trees ringing the outer edges (Wildwood)
  { img: `${WW}/Trees/001-beech.svg`, x: WORLD_W * 0.03, y: WORLD_H * 0.05, size: 90 },
  { img: `${WW}/Trees/005-banyan.svg`, x: WORLD_W * 0.97, y: WORLD_H * 0.05, size: 90 },
  { img: `${WW}/Trees/007-cherry-tree.svg`, x: WORLD_W * 0.03, y: WORLD_H * 0.95, size: 90 },
  { img: `${WW}/Trees/001-beech.svg`, x: WORLD_W * 0.97, y: WORLD_H * 0.95, size: 90 },
  { img: `${WW}/Trees/006-olive-tree.svg`, x: WORLD_W * 0.23, y: WORLD_H * 0.95, size: 70 },
  { img: `${WW}/Trees/007-cherry-tree.svg`, x: WORLD_W * 0.77, y: WORLD_H * 0.95, size: 70 },
  { img: `${WW}/Trees/005-banyan.svg`, x: WORLD_W * 0.50, y: WORLD_H * 0.03, size: 80 },

  // Flowers + nature accents nearer the plaza ring
  { img: `${WW}/Nature/010-tulip.svg`, x: WORLD_W * 0.25, y: WORLD_H * 0.44, size: 42 },
  { img: `${WW}/Nature/011-sunflower.svg`, x: WORLD_W * 0.75, y: WORLD_H * 0.44, size: 46 },
  { img: `${WW}/Nature/006-mushroom.svg`, x: WORLD_W * 0.25, y: WORLD_H * 0.62, size: 36 },
  { img: `${WW}/Nature/010-tulip.svg`, x: WORLD_W * 0.75, y: WORLD_H * 0.62, size: 40 },
  { img: `${WW}/Nature/025-grass.svg`, x: WORLD_W * 0.14, y: WORLD_H * 0.22, size: 32 },
  { img: `${WW}/Nature/025-grass.svg`, x: WORLD_W * 0.86, y: WORLD_H * 0.22, size: 32 },
  { img: `${WW}/Nature/025-grass.svg`, x: WORLD_W * 0.14, y: WORLD_H * 0.78, size: 32 },
  { img: `${WW}/Nature/025-grass.svg`, x: WORLD_W * 0.86, y: WORLD_H * 0.78, size: 32 },
  { img: `${WW}/Nature/025-grass.svg`, x: CX, y: WORLD_H * 0.20, size: 30 },

  // Lamp posts between plots
  { img: `${WW}/Camping/002-oil-lamp.svg`, x: WORLD_W * 0.27, y: WORLD_H * 0.30, size: 40 },
  { img: `${WW}/Camping/002-oil-lamp.svg`, x: WORLD_W * 0.73, y: WORLD_H * 0.30, size: 40 },
  { img: `${WW}/Camping/002-oil-lamp.svg`, x: WORLD_W * 0.27, y: WORLD_H * 0.70, size: 40 },
  { img: `${WW}/Camping/002-oil-lamp.svg`, x: WORLD_W * 0.73, y: WORLD_H * 0.70, size: 40 },

  // Crates near the fountain — a bit of marketplace clutter
  { img: `${WW}/More/004-crate.svg`, x: CX - 70, y: CY + 60, size: 38 },
  { img: `${WW}/More/004-crate.svg`, x: CX + 80, y: CY - 50, size: 34 },

  // Sky flavor
  { img: `${WW}/Nature/017-sun.svg`, x: WORLD_W * 0.06, y: WORLD_H * 0.045, size: 64 },
  { img: `${WW}/Nature/015-cloud.svg`, x: WORLD_W * 0.40, y: WORLD_H * 0.04, size: 60 },
  { img: `${WW}/Nature/015-cloud.svg`, x: WORLD_W * 0.88, y: WORLD_H * 0.04, size: 54 },
];
