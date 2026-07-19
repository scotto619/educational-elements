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
// ─────────────────────────────────────────────────────────────────────────────

export const NETWORK_RATE = 120; // ms between position/state syncs
export const CHAT_BUBBLE_MS = 5000;
export const INTERACT_RADIUS = 9; // % units — how close you must be to a stall/player to interact
export const WORLD_MIN = 3;
export const WORLD_MAX = 97;
export const MOVE_SPEED = 0.5; // % of world per animation tick at full key-hold

// ═══════════════════════════════════════════════════════════════════════════
// STALL PLOTS — fixed claimable locations around the plaza (percentage coords)
// ═══════════════════════════════════════════════════════════════════════════
export const PLOTS = [
  { id: 'plot1', x: 10, y: 34 },
  { id: 'plot2', x: 18, y: 14 },
  { id: 'plot3', x: 37, y: 6 },
  { id: 'plot4', x: 63, y: 6 },
  { id: 'plot5', x: 82, y: 14 },
  { id: 'plot6', x: 90, y: 34 },
  { id: 'plot7', x: 16, y: 82 },
  { id: 'plot8', x: 84, y: 82 },
  { id: 'plot9', x: 50, y: 90 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STALL TIERS — built with real Wildwood resources (studentData.homesteadData.inv)
// ═══════════════════════════════════════════════════════════════════════════
export const STALL_TIERS = [
  {
    tier: 1,
    name: 'Roadside Cart',
    icon: '🛒',
    slots: 3,
    cost: { beech_wood: 12, stone: 6 },
    color: '#a16207',
  },
  {
    tier: 2,
    name: 'Timber Stall',
    icon: '🏪',
    slots: 5,
    cost: { cherry_wood: 10, stone: 15, fiber: 12 },
    color: '#b45309',
  },
  {
    tier: 3,
    name: 'Grand Bazaar Stand',
    icon: '🏛️',
    slots: 8,
    cost: { ironroot_wood: 15, iron_bar: 6, emerald: 2 },
    color: '#7c3aed',
  },
];

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
  { id: 'rps', name: 'Rock Paper Scissors', icon: '✊', desc: 'Best of 3 throws' },
  { id: 'coinflip', name: 'Coin Flip', icon: '🪙', desc: 'Call it in the air' },
  { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', desc: 'Classic 3x3 grid' },
  { id: 'connect4', name: 'Connect Four', icon: '🔴', desc: 'Line up 4 in a row' },
  { id: 'quickdraw', name: 'Quick Draw', icon: '⚡', desc: 'Fastest tap wins' },
];

export const MINIGAME_MAP = Object.fromEntries(MINIGAMES.map((m) => [m.id, m]));

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

// Decorative plaza scenery (purely visual — emoji layered on CSS gradients so
// no new art assets are required).
export const DECOR = [
  { emoji: '⛲', x: 50, y: 48, size: 64 },
  { emoji: '🌳', x: 6, y: 8, size: 40 },
  { emoji: '🌳', x: 95, y: 8, size: 40 },
  { emoji: '🌳', x: 3, y: 60, size: 36 },
  { emoji: '🌳', x: 97, y: 60, size: 36 },
  { emoji: '🎪', x: 50, y: 4, size: 48 },
  { emoji: '🏮', x: 30, y: 20, size: 26 },
  { emoji: '🏮', x: 70, y: 20, size: 26 },
  { emoji: '🪧', x: 50, y: 20, size: 30 },
  { emoji: '🌸', x: 12, y: 50, size: 22 },
  { emoji: '🌸', x: 88, y: 50, size: 22 },
];
