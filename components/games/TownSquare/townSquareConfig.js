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

// ═══════════════════════════════════════════════════════════════════════════
// THE WISHING FOUNTAIN — toss a coin, get a surprise (few per day)
// ═══════════════════════════════════════════════════════════════════════════
export const FOUNTAIN = { x: CX, y: CY };
export const FOUNTAIN_IMG = `${TS}/fountain.svg`;
export const WISH_COST = 5;        // gold per coin toss
export const WISHES_PER_DAY = 3;

export const rollWish = () => {
  const r = Math.random();
  if (r < 0.005) return { type: 'jackpot', gold: 200, text: 'JACKPOT! The fountain erupts — 200 gold rains down!' };
  if (r < 0.05) return { type: 'scroll', text: 'A soggy Recipe Scroll floats to the surface!' };
  if (r < 0.25) return { type: 'essence', essence: 15, text: 'The water glows — +15 Wild Essence drifts to your Menagerie!' };
  if (r < 0.35) return { type: 'gold', gold: 20 + Math.floor(Math.random() * 21), text: 'Lucky splash! Coins wash back to you!' };
  if (r < 0.60) return { type: 'gold', gold: 2 + Math.floor(Math.random() * 9), text: 'A little luck ripples back to you.' };
  return { type: 'nothing', text: 'The coin sinks with a hopeful *ploink*. The fountain says: soon.' };
};

// ═══════════════════════════════════════════════════════════════════════════
// PLAZA RACE — run the flag circuit around the fountain, fastest lap wins.
// Route: start (S) → 1 (W) → 2 (N) → 3 (E) → back to start.
// ═══════════════════════════════════════════════════════════════════════════
export const RACE_START = { x: CX, y: CY + 410 };
export const RACE_CHECKPOINTS = [
  { x: CX - 460, y: CY },        // 1 — west
  { x: CX, y: CY - 400 },        // 2 — north
  { x: CX + 460, y: CY },        // 3 — east
];
export const RACE_RADIUS = 85;   // how close counts as "touching" a flag
export const RACE_FLAG_IMG = `${TS}/001-flag.svg`; // checkered!

// ═══════════════════════════════════════════════════════════════════════════
// NOTICE BOARD — three shared daily quests (same for the whole class)
// ═══════════════════════════════════════════════════════════════════════════
export const NOTICEBOARD = { x: CX - 320, y: WORLD_H * 0.30 };
export const NOTICEBOARD_IMG = `${TS}/002-notice-board.svg`;

export const DAILY_QUESTS = [
  { id: 'duels2',  name: 'Win 2 duels',                     stat: 'duelWins', need: 2, reward: 20, img: `${TS}/013-rock-paper-scissors.svg` },
  { id: 'lap1',    name: 'Run a plaza lap',                 stat: 'laps',     need: 1, reward: 15, img: `${TS}/001-flag.svg` },
  { id: 'laps3',   name: 'Run 3 plaza laps',                stat: 'laps',     need: 3, reward: 30, img: `${TS}/001-flag.svg` },
  { id: 'wish2',   name: 'Make 2 fountain wishes',          stat: 'wishes',   need: 2, reward: 15, img: `${TS}/fountain.svg` },
  { id: 'buy2',    name: 'Buy 2 items (stalls or caravan)', stat: 'buys',     need: 2, reward: 20, img: `${TS}/004-money-bag.svg` },
  { id: 'donate3', name: 'Donate 3 items to the merchant',  stat: 'donates',  need: 3, reward: 25, img: `${TS}/010-caravan.svg` },
  { id: 'emote3',  name: 'Send 3 emotes',                   stat: 'emotes',   need: 3, reward: 10, img: `${TS}/004-ballons.svg` },
  { id: 'chat3',   name: 'Send 3 friendly chat messages',   stat: 'chats',    need: 3, reward: 10, img: `${TS}/011-old-scroll.svg` },
];

export const hashStr = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31 + s.charCodeAt(i)) >>> 0);
  return h;
};

// Avalanche mixer so nearby seeds land on very different values
const mix32 = (n) => {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
};

// The same three quests for everyone, rotating daily
export const questsForDay = (day) => {
  const picks = [];
  const pool = [...DAILY_QUESTS];
  const seed = hashStr(day);
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const h = mix32(seed + Math.imul(i + 1, 0x9e3779b9));
    picks.push(pool.splice(h % pool.length, 1)[0]);
  }
  return picks;
};

// ═══════════════════════════════════════════════════════════════════════════
// DAILY TREASURE HUNT — an X buried somewhere new each day (same spot for
// the whole class, revealed only when you walk near it). The notice board
// gives a rough hint.
// ═══════════════════════════════════════════════════════════════════════════
export const TREASURE_CROSS_IMG = `${TS}/005-cross.svg`;
export const TREASURE_MAP_IMG = `${TS}/006-map.svg`;
export const TREASURE_RADIUS = 120;   // how close before the X appears
export const TREASURE_REWARD = { gold: 25, essence: 20 };

export const treasureSpot = (day, code) => {
  const h1 = hashStr(`tx_${day}_${code}`);
  const h2 = hashStr(`ty_${code}_${day}`);
  let x = MARGIN + 120 + (h1 % Math.floor(WORLD_W - 2 * (MARGIN + 120)));
  let y = MARGIN + 120 + (h2 % Math.floor(WORLD_H - 2 * (MARGIN + 120)));
  // Nudge it out of the central plaza so it's never sitting in plain sight
  const dx = x - CX, dy = y - CY;
  const d = Math.hypot(dx, dy) || 1;
  if (d < 450) { x = CX + (dx / d) * 460; y = CY + (dy / d) * 460; }
  return { x: Math.round(x), y: Math.round(y) };
};

export const treasureHint = (spot) => {
  const ns = spot.y < WORLD_H * 0.38 ? 'north' : spot.y > WORLD_H * 0.62 ? 'south' : '';
  const ew = spot.x < WORLD_W * 0.38 ? 'west' : spot.x > WORLD_W * 0.62 ? 'east' : '';
  const dir = [ns, ew].filter(Boolean).join('-');
  return dir ? `somewhere in the ${dir} of town` : 'surprisingly close to the middle of town';
};

// ═══════════════════════════════════════════════════════════════════════════
// THE MYSTERY TRADER — a travelling peddler who only SOMETIMES rolls into
// town. Visit windows are computed deterministically from classCode + date,
// so every client agrees on when she's here without any server coordination.
// Her cart carries a different (sometimes very rare) haul each visit,
// including Hangout furniture and sealed MYSTERY boxes — you don't know
// what's inside until you pay. Shared limited stock lives at
// worldRooms/{code}/trader (created once per visit via transaction).
// ═══════════════════════════════════════════════════════════════════════════
export const TRADER = { x: WORLD_W * 0.74, y: WORLD_H * 0.66 };
export const TRADER_IMG = `${TS}/009-cart.svg`;
export const MYSTERY_IMG = '/game icons/Wildwood/Magic/037-magic box.svg';
export const TRADER_SLOTS = 5;

// 1–3 visits per day, 15–35 minutes each, between 07:30 and 18:30 local time
export const traderWindowsForDay = (day, code = '') => {
  const seed = hashStr(`trader_${day}_${code}`);
  const count = 1 + (mix32(seed) % 3);
  const windows = [];
  for (let i = 0; i < count; i++) {
    const startMin = 450 + (mix32(seed + Math.imul(i + 1, 0x9e3779b9)) % 660); // 07:30–18:30
    const durMin = 15 + (mix32(seed ^ Math.imul(i + 7, 0x85ebca6b)) % 21);     // 15–35 min
    windows.push({ slot: i, startMin, endMin: startMin + durMin });
  }
  return windows;
};

// The window that is open RIGHT NOW (or null) → { key, endsAt }
export const activeTraderWindow = (code) => {
  const nowD = new Date();
  const day = dayKey();
  const mins = nowD.getHours() * 60 + nowD.getMinutes() + nowD.getSeconds() / 60;
  const w = traderWindowsForDay(day, code).find((x) => mins >= x.startMin && mins < x.endMin);
  if (!w) return null;
  const endsAt = new Date(nowD.getFullYear(), nowD.getMonth(), nowD.getDate(), 0, w.endMin, 0, 0).getTime();
  return { key: `${day}_${w.slot}`, endsAt };
};

// What the cart may carry: [weight, { itemId | mystery, lo, hi, price }]
export const TRADER_POOL = [
  // Everyday goods (cheap filler so rares stay special)
  [9, { itemId: 'salt', lo: 4, hi: 8, price: 4 }],
  [9, { itemId: 'sugar', lo: 4, hi: 8, price: 6 }],
  [8, { itemId: 'bread', lo: 3, hi: 6, price: 6 }],
  [8, { itemId: 'almonds', lo: 3, hi: 6, price: 8 }],
  [7, { itemId: 'cinnamon', lo: 2, hi: 4, price: 8 }],
  [7, { itemId: 'vanilla', lo: 2, hi: 4, price: 11 }],
  [7, { itemId: 'plank', lo: 3, hi: 6, price: 10 }],
  [6, { itemId: 'hide', lo: 2, hi: 5, price: 16 }],
  [6, { itemId: 'silver_bar', lo: 1, hi: 3, price: 55 }],
  // Rare ingredients & gems
  [5, { itemId: 'tree_sap', lo: 1, hi: 2, price: 40 }],
  [5, { itemId: 'mandrake', lo: 1, hi: 2, price: 70 }],
  [4, { itemId: 'truffle', lo: 1, hi: 2, price: 95 }],
  [4, { itemId: 'moonpetal', lo: 1, hi: 2, price: 80 }],
  [4, { itemId: 'emerald', lo: 1, hi: 1, price: 95 }],
  [3, { itemId: 'glimmer_dust', lo: 1, hi: 1, price: 110 }],
  [3, { itemId: 'ruby', lo: 1, hi: 1, price: 150 }],
  [2.5, { itemId: 'golden_feather', lo: 1, hi: 1, price: 130 }],
  [2, { itemId: 'diamond', lo: 1, hi: 1, price: 260 }],
  // Find-only seeds occasionally fall off the back of the cart
  [3, { itemId: 'frost_lettuce_seed', lo: 1, hi: 2, price: 45 }],
  [2.5, { itemId: 'ember_pepper_seed', lo: 1, hi: 1, price: 65 }],
  [2, { itemId: 'moon_melon_seed', lo: 1, hi: 1, price: 90 }],
  [1.5, { itemId: 'royal_grapes_seed', lo: 1, hi: 1, price: 120 }],
  // FURNITURE for the Hangout — jackpot finds
  [2, { itemId: 'retro_radio', lo: 1, hi: 1, price: 240 }],
  [2, { itemId: 'dj_corner', lo: 1, hi: 1, price: 220 }],
  [1.5, { itemId: 'lucky_wheel', lo: 1, hi: 1, price: 260 }],
  [1.5, { itemId: 'garden_gnome', lo: 1, hi: 1, price: 250 }],
  [1, { itemId: 'crystal_lamp', lo: 1, hi: 1, price: 320 }],
  // Sealed mystery boxes — contents revealed only after you pay!
  [8, { mystery: 'common', lo: 2, hi: 4, price: 15 }],
  [5, { mystery: 'rare', lo: 1, hi: 2, price: 45 }],
  [3, { mystery: 'epic', lo: 1, hi: 1, price: 120 }],
];

export const MYSTERY_TIERS = {
  common: { name: 'Mystery Pouch', tint: '', desc: 'Rattles promisingly.' },
  rare: { name: 'Sealed Mystery Box', tint: 'hue-rotate(140deg) saturate(1.3)', desc: 'Heavier than it looks…' },
  epic: { name: 'Arcane Mystery Chest', tint: 'hue-rotate(260deg) saturate(1.5)', desc: 'It hums. It definitely hums.' },
};

// Weighted contents per tier: [itemId, qty, weight]
export const MYSTERY_TABLES = {
  common: [
    ['berries', 5, 8], ['salt', 3, 8], ['plank', 2, 6], ['wild_egg', 3, 6],
    ['honey', 2, 5], ['copper_bar', 2, 5], ['carrot_seed', 3, 5], ['stone', 8, 4],
    ['bacon', 2, 4], ['cheese', 2, 3], ['old_boot', 1, 3], ['recipe_scroll', 1, 1.5],
    ['emerald', 1, 0.7],
  ],
  rare: [
    ['iron_bar', 3, 6], ['silver_bar', 2, 6], ['tree_sap', 1, 5], ['truffle', 1, 4],
    ['moonpetal', 1, 4], ['mandrake', 1, 4], ['recipe_scroll', 1, 3], ['emerald', 1, 2.5],
    ['frost_lettuce_seed', 1, 2], ['ruby', 1, 1.5], ['glimmer_dust', 1, 1.5],
    ['pearl', 1, 1], ['golden_feather', 1, 1],
  ],
  epic: [
    ['glimmer_dust', 2, 5], ['ruby', 1, 4], ['recipe_scroll', 2, 4], ['diamond', 1, 2.5],
    ['moon_melon_seed', 1, 2.5], ['royal_grapes_seed', 1, 2], ['golden_feather', 1, 2],
    ['pearl', 1, 2], ['retro_radio', 1, 1], ['dj_corner', 1, 1], ['bottled_fairy', 1, 0.7],
    ['lucky_wheel', 1, 0.8], ['garden_gnome', 1, 0.8], ['dragon_idol', 1, 0.5],
    ['crystal_lamp', 1, 0.5],
  ],
};

const weightedPick = (rows) => {
  const total = rows.reduce((s, r) => s + r[r.length - 1], 0);
  let roll = Math.random() * total;
  for (const r of rows) { roll -= r[r.length - 1]; if (roll <= 0) return r; }
  return rows[0];
};

// One client (the transaction winner) rolls the visit's stock
export const rollTraderStock = () => {
  const pool = [...TRADER_POOL];
  const stock = {};
  for (let i = 0; i < TRADER_SLOTS && pool.length > 0; i++) {
    const picked = weightedPick(pool);
    pool.splice(pool.indexOf(picked), 1);
    const e = picked[1];
    const qty = e.lo + Math.floor(Math.random() * (e.hi - e.lo + 1));
    stock[`t${i}`] = { ...(e.itemId ? { itemId: e.itemId } : { mystery: e.mystery }), qty, price: e.price };
  }
  return stock;
};

// Rolled at PURCHASE time — nobody knows what's inside until they pay
export const rollMysteryReward = (tier) => {
  const [itemId, qty] = weightedPick(MYSTERY_TABLES[tier] || MYSTERY_TABLES.common);
  return { itemId, qty };
};

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
  // (The fountain itself is an interactive object rendered by the game — see FOUNTAIN)
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

  // Park benches around the plaza ring — a spot to hang out
  { img: `${TS}/003-bench.svg`, x: WORLD_W * 0.36, y: WORLD_H * 0.58, size: 56 },
  { img: `${TS}/003-bench.svg`, x: WORLD_W * 0.64, y: WORLD_H * 0.58, size: 56 },
  { img: `${TS}/003-bench.svg`, x: WORLD_W * 0.50, y: WORLD_H * 0.68, size: 56 },

  // Party balloons at the notice board + plaza entries
  { img: `${TS}/004-ballons.svg`, x: WORLD_W * 0.50 - 380, y: WORLD_H * 0.26, size: 56 },
  { img: `${TS}/004-ballons.svg`, x: WORLD_W * 0.28, y: WORLD_H * 0.86, size: 50 },
  { img: `${TS}/004-ballons.svg`, x: WORLD_W * 0.72, y: WORLD_H * 0.86, size: 50 },

  // Ambient butterflies drifting near the flowers
  { img: `${WW}/Bugs/002-butterfly.svg`, x: WORLD_W * 0.26, y: WORLD_H * 0.41, size: 26 },
  { img: `${WW}/Bugs/025-butterfly.svg`, x: WORLD_W * 0.74, y: WORLD_H * 0.47, size: 24 },
  { img: `${WW}/Bugs/001-ladybug.svg`, x: WORLD_W * 0.52, y: WORLD_H * 0.62, size: 20 },

  // A cozy campsite in the south-east corner
  { img: `${WW}/Adventure/045-tent.svg`, x: WORLD_W * 0.90, y: WORLD_H * 0.66, size: 90 },
  { img: `${WW}/Adventure/037-bonfire.svg`, x: WORLD_W * 0.85, y: WORLD_H * 0.72, size: 56 },
  { img: `${WW}/More/004-crate.svg`, x: WORLD_W * 0.93, y: WORLD_H * 0.73, size: 34 },
  { img: `${WW}/Adventure/031-marshmallow.svg`, x: WORLD_W * 0.87, y: WORLD_H * 0.76, size: 30 },
];
