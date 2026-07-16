// components/games/Homestead/homesteadConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// WILDWOOD HOMESTEAD v2 — config. SVG icon packs (no emoji), inventory
// management, timed expeditions (scavenge/hunt), animal pens, 45+ recipes,
// rare ingredients, curios and a 50-critter collection.
//
// All item art comes from /public/game icons/Wildwood/**. Items may carry a
// `tint` (CSS filter) so one base SVG serves several tiers/species.
// Save data lives in studentData.homesteadData.
// ─────────────────────────────────────────────────────────────────────────────

export const fmtQty = (n) => Math.floor(Number(n) || 0).toLocaleString();

const IC = '/game icons/Wildwood';
const CAMP = `${IC}/Camping`;
const COOK = `${IC}/Cooking`;
const FARM = `${IC}/Farm`;
const FV = `${IC}/Fruit and Veg`;
const MAGIC = `${IC}/Magic`;
const NAT = `${IC}/Nature`;
const SNACK = `${IC}/Snacks`;
const SWEET = `${IC}/Sweets`;
const TREE = `${IC}/Trees`;
const WATER = `${IC}/Water`;
const BUGS = `${IC}/Bugs`;

export const FALLBACK_ICON = `${MAGIC}/037-magic box.svg`;

// Handy tints (CSS filter strings applied to the base SVG)
const T = {
  copper: 'sepia(1) saturate(3) hue-rotate(-25deg)',
  iron: 'grayscale(1) brightness(0.85)',
  silver: 'grayscale(1) brightness(1.25)',
  gold: 'sepia(1) saturate(5) hue-rotate(5deg) brightness(1.15)',
  mythic: 'hue-rotate(230deg) saturate(1.6) brightness(1.05)',
  green: 'hue-rotate(90deg) saturate(1.4)',
  red: 'hue-rotate(-45deg) saturate(1.8)',
  teal: 'hue-rotate(140deg) saturate(1.3)',
  dark: 'brightness(0.6) saturate(0.8)',
  bright: 'brightness(1.3) saturate(1.4)',
  purple: 'hue-rotate(260deg) saturate(1.5)',
};

// ═══════════════════════════════════════════════════════════════════════════
// RARITY STYLES (borders/labels for item cards)
// ═══════════════════════════════════════════════════════════════════════════
export const RARITY_STYLE = {
  common:    { name: 'Common',    border: 'border-slate-500/60',  text: 'text-slate-300',   chip: 'bg-slate-700 text-slate-200' },
  uncommon:  { name: 'Uncommon',  border: 'border-green-500/70',  text: 'text-green-400',   chip: 'bg-green-900/80 text-green-300' },
  rare:      { name: 'Rare',      border: 'border-blue-400/70',   text: 'text-blue-400',    chip: 'bg-blue-900/80 text-blue-300' },
  epic:      { name: 'Epic',      border: 'border-purple-400/70', text: 'text-purple-400',  chip: 'bg-purple-900/80 text-purple-300' },
  legendary: { name: 'Legendary', border: 'border-amber-400/80',  text: 'text-amber-400',   chip: 'bg-amber-900/80 text-amber-300' },
};

// ═══════════════════════════════════════════════════════════════════════════
// ITEMS — flat registry. kind: wood|stone|ore|bar|forage|herb|crop|seed|fish|
// junk|meat|material|rareIng|curio|trade|scroll
// ═══════════════════════════════════════════════════════════════════════════
export const ITEMS = {
  // ── Wood (burn = fuel value) ──────────────────────────────────────────────
  beech_wood:   { name: 'Beech Log',     img: `${NAT}/003-wood.svg`, kind: 'wood', burn: 1, sell: 1, rarity: 'common' },
  cherry_wood:  { name: 'Cherrywood Log', img: `${NAT}/003-wood.svg`, tint: T.red, kind: 'wood', burn: 2, sell: 3, rarity: 'common' },
  banyan_wood:  { name: 'Banyan Log',    img: `${NAT}/003-wood.svg`, tint: T.green, kind: 'wood', burn: 4, sell: 7, rarity: 'uncommon' },
  ironroot_wood: { name: 'Ironroot Log', img: `${NAT}/003-wood.svg`, tint: T.iron, kind: 'wood', burn: 6, sell: 14, rarity: 'rare' },
  elder_wood:   { name: 'Elderwood Log', img: `${NAT}/003-wood.svg`, tint: T.purple, kind: 'wood', burn: 10, sell: 30, rarity: 'epic' },
  tree_sap:     { name: 'Amber Sap',     img: `${SWEET}/019-maple syrup.svg`, kind: 'rareIng', sell: 22, rarity: 'rare' },

  // ── Stone + ores + bars ───────────────────────────────────────────────────
  stone:        { name: 'Stone',         img: `${NAT}/024-mountain.svg`, tint: T.dark, kind: 'stone', sell: 1, rarity: 'common' },
  copper_ore:   { name: 'Copper Ore',    img: `${NAT}/024-mountain.svg`, tint: T.copper, kind: 'ore', sell: 3, rarity: 'common' },
  iron_ore:     { name: 'Iron Ore',      img: `${NAT}/024-mountain.svg`, tint: T.iron, kind: 'ore', sell: 6, rarity: 'uncommon' },
  silver_ore:   { name: 'Silver Ore',    img: `${NAT}/024-mountain.svg`, tint: T.silver, kind: 'ore', sell: 11, rarity: 'rare' },
  gold_ore:     { name: 'Gold Ore',      img: `${NAT}/024-mountain.svg`, tint: T.gold, kind: 'ore', sell: 18, rarity: 'rare' },
  mithril_ore:  { name: 'Mithril Ore',   img: `${MAGIC}/017-crystal.svg`, tint: T.mythic, kind: 'ore', sell: 38, rarity: 'epic' },
  salt:         { name: 'Rock Salt',     img: `${COOK}/024-salt and pepper.svg`, kind: 'trade', sell: 3, cost: 6, rarity: 'common' },
  copper_bar:   { name: 'Copper Bar',    img: `${SWEET}/027-chocolate bar.svg`, tint: T.copper, kind: 'bar', sell: 10, rarity: 'common' },
  iron_bar:     { name: 'Iron Bar',      img: `${SWEET}/027-chocolate bar.svg`, tint: T.iron, kind: 'bar', sell: 20, rarity: 'uncommon' },
  silver_bar:   { name: 'Silver Bar',    img: `${SWEET}/027-chocolate bar.svg`, tint: T.silver, kind: 'bar', sell: 34, rarity: 'rare' },
  gold_bar:     { name: 'Gold Bar',      img: `${SWEET}/027-chocolate bar.svg`, tint: T.gold, kind: 'bar', sell: 55, rarity: 'rare' },
  mithril_bar:  { name: 'Mithril Bar',   img: `${SWEET}/027-chocolate bar.svg`, tint: T.mythic, kind: 'bar', sell: 110, rarity: 'epic' },

  // ── Foraged + herbs ───────────────────────────────────────────────────────
  berries:      { name: 'Wild Berries',  img: `${SNACK}/049-berries.svg`, kind: 'forage', sell: 2, rarity: 'common' },
  mushroom:     { name: 'Field Mushroom', img: `${FV}/049-mushroom.svg`, kind: 'forage', sell: 3, rarity: 'common' },
  acorn:        { name: 'Acorn',         img: `${NAT}/001-acorn.svg`, kind: 'forage', sell: 2, rarity: 'common' },
  fiber:        { name: 'Plant Fiber',   img: `${NAT}/025-grass.svg`, kind: 'forage', sell: 1, rarity: 'common' },
  honey:        { name: 'Wild Honey',    img: `${SWEET}/048-honey.svg`, kind: 'forage', sell: 6, rarity: 'uncommon' },
  wild_egg:     { name: 'Wild Egg',      img: `${COOK}/014-eggs.svg`, kind: 'forage', sell: 4, rarity: 'common' },
  basil:        { name: 'Wild Basil',    img: `${COOK}/046-basil.svg`, kind: 'herb', sell: 3, rarity: 'common' },
  rosemary:     { name: 'Rosemary',      img: `${COOK}/045-rosemary.svg`, kind: 'herb', sell: 4, rarity: 'uncommon' },
  mint:         { name: 'River Mint',    img: `${COOK}/048-mint.svg`, kind: 'herb', sell: 4, rarity: 'uncommon' },
  avocado:      { name: 'Wild Avocado',  img: `${FV}/045-avocado.svg`, kind: 'forage', sell: 7, rarity: 'uncommon' },
  truffle:      { name: 'Black Truffle', img: `${FV}/049-mushroom.svg`, tint: T.dark, kind: 'rareIng', sell: 55, rarity: 'epic' },
  moonpetal:    { name: 'Moonpetal',     img: `${NAT}/010-tulip.svg`, tint: T.purple, kind: 'rareIng', sell: 45, rarity: 'epic' },
  mandrake:     { name: 'Mandrake Root', img: `${MAGIC}/015-root.svg`, kind: 'rareIng', sell: 40, rarity: 'rare' },
  glimmer_dust: { name: 'Glimmer Dust',  img: `${MAGIC}/032-magic dust.svg`, kind: 'rareIng', sell: 60, rarity: 'epic' },

  // ── Crops + seeds ─────────────────────────────────────────────────────────
  carrot:       { name: 'Carrot',        img: `${FV}/035-carrot.svg`, kind: 'crop', sell: 3, rarity: 'common' },
  potato:       { name: 'Potato',        img: `${FV}/025-potato.svg`, kind: 'crop', sell: 3, rarity: 'common' },
  cabbage:      { name: 'Cabbage',       img: `${FV}/003-cabbage.svg`, kind: 'crop', sell: 4, rarity: 'common' },
  oats:         { name: 'Wild Oats',     img: `${SNACK}/027-oats.svg`, kind: 'crop', sell: 4, rarity: 'common' },
  tomato:       { name: 'Tomato',        img: `${FV}/001-tomato.svg`, kind: 'crop', sell: 5, rarity: 'common' },
  onion:        { name: 'Onion',         img: `${FV}/023-onion.svg`, kind: 'crop', sell: 5, rarity: 'common' },
  corn:         { name: 'Corn',          img: `${FV}/014-corn.svg`, kind: 'crop', sell: 6, rarity: 'uncommon' },
  strawberry:   { name: 'Strawberry',    img: `${FV}/015-strawberry.svg`, kind: 'crop', sell: 7, rarity: 'uncommon' },
  garlic:       { name: 'Garlic',        img: `${FV}/043-garlic.svg`, kind: 'crop', sell: 6, rarity: 'uncommon' },
  chili:        { name: 'Fire Chili',    img: `${FV}/042-chili.svg`, kind: 'crop', sell: 9, rarity: 'rare' },
  pumpkin:      { name: 'Pumpkin',       img: `${FV}/020-pumpkin.svg`, kind: 'crop', sell: 12, rarity: 'rare' },
  watermelon:   { name: 'Watermelon',    img: `${FV}/050-watermelon.svg`, kind: 'crop', sell: 14, rarity: 'rare' },
  sunfruit:     { name: 'Sunfruit',      img: `${FV}/010-orange.svg`, tint: T.gold, kind: 'crop', sell: 45, rarity: 'legendary' },

  // ── Farm produce (pens) + dairy ───────────────────────────────────────────
  egg:          { name: 'Hen Egg',       img: `${COOK}/014-eggs.svg`, tint: T.bright, kind: 'crop', sell: 5, rarity: 'common' },
  milk:         { name: 'Fresh Milk',    img: `${COOK}/032-milk.svg`, kind: 'crop', sell: 7, rarity: 'common' },
  cheese:       { name: 'Wildwood Cheese', img: `${COOK}/027-cheese.svg`, kind: 'crop', sell: 16, rarity: 'uncommon' },

  // ── Hunted materials ──────────────────────────────────────────────────────
  meat:         { name: 'Game Meat',     img: `${COOK}/015-meat.svg`, kind: 'meat', sell: 8, rarity: 'common' },
  bacon:        { name: 'Smoked Bacon',  img: `${COOK}/018-bacon.svg`, kind: 'meat', sell: 12, rarity: 'uncommon' },
  hide:         { name: 'Animal Hide',   img: `${MAGIC}/038-bag.svg`, tint: T.copper, kind: 'material', sell: 9, rarity: 'uncommon' },
  bone:         { name: 'Bone',          img: `${MAGIC}/048-skull.svg`, kind: 'material', sell: 6, rarity: 'common' },
  feather:      { name: 'Feather',       img: `${MAGIC}/031-feather.svg`, kind: 'material', sell: 5, rarity: 'common' },
  golden_feather: { name: 'Golden Feather', img: `${MAGIC}/031-feather.svg`, tint: T.gold, kind: 'rareIng', sell: 70, rarity: 'legendary' },

  // ── Fish (shared base icon, tinted per species) ───────────────────────────
  minnow:       { name: 'Minnow',        img: `${NAT}/027-fish.svg`, kind: 'fish', sell: 2, rarity: 'common' },
  perch:        { name: 'Perch',         img: `${NAT}/027-fish.svg`, tint: T.green, kind: 'fish', sell: 4, rarity: 'common' },
  trout:        { name: 'Speckled Trout', img: `${NAT}/027-fish.svg`, tint: T.copper, kind: 'fish', sell: 7, rarity: 'common' },
  bass:         { name: 'Shadow Bass',   img: `${NAT}/027-fish.svg`, tint: T.dark, kind: 'fish', sell: 10, rarity: 'uncommon' },
  catfish:      { name: 'Whisker Catfish', img: `${NAT}/027-fish.svg`, tint: T.iron, kind: 'fish', sell: 14, rarity: 'uncommon' },
  eel:          { name: 'Marsh Eel',     img: `${NAT}/027-fish.svg`, tint: T.teal, kind: 'fish', sell: 18, rarity: 'uncommon' },
  salmon:       { name: 'Silver Salmon', img: `${NAT}/027-fish.svg`, tint: T.silver, kind: 'fish', sell: 24, rarity: 'rare' },
  pike:         { name: 'Duskwater Pike', img: `${NAT}/027-fish.svg`, tint: T.purple, kind: 'fish', sell: 30, rarity: 'rare' },
  sturgeon:     { name: 'Sturgeon',      img: `${NAT}/027-fish.svg`, tint: T.bright, kind: 'fish', sell: 40, rarity: 'rare' },
  ghostfin:     { name: 'Ghostfin',      img: `${NAT}/027-fish.svg`, tint: 'grayscale(1) brightness(1.6) opacity(0.75)', kind: 'fish', sell: 70, rarity: 'epic', rare: true },
  golden_koi:   { name: 'Golden Koi',    img: `${NAT}/027-fish.svg`, tint: T.gold, kind: 'fish', sell: 140, rarity: 'legendary', rare: true },
  leviathan:    { name: 'Ancient Leviathan', img: `${NAT}/027-fish.svg`, tint: T.red, kind: 'fish', sell: 450, rarity: 'legendary', rare: true },
  kelp:         { name: 'Lake Kelp',     img: `${NAT}/008-leaf.svg`, tint: T.teal, kind: 'junk', sell: 1, rarity: 'common' },
  driftwood:    { name: 'Driftwood',     img: `${NAT}/003-wood.svg`, tint: T.dark, kind: 'junk', sell: 1, rarity: 'common' },
  pearl:        { name: 'Lake Pearl',    img: `${WATER}/010-dew.svg`, kind: 'curio', sell: 90, rarity: 'epic' },

  // ── Trader goods (bought with gold) ──────────────────────────────────────
  rice:         { name: 'Rice',          img: `${COOK}/022-rice.svg`, kind: 'trade', sell: 3, cost: 6, rarity: 'common' },
  pasta:        { name: 'Pasta',         img: `${COOK}/023-pasta.svg`, kind: 'trade', sell: 4, cost: 8, rarity: 'common' },
  olive_oil:    { name: 'Olive Oil',     img: `${COOK}/029-olive oil.svg`, kind: 'trade', sell: 5, cost: 10, rarity: 'common' },
  sugar:        { name: 'Sugar',         img: `${SWEET}/025-sugar.svg`, kind: 'trade', sell: 4, cost: 8, rarity: 'common' },
  cocoa:        { name: 'Cocoa',         img: `${SWEET}/011-cocoa.svg`, kind: 'trade', sell: 6, cost: 12, rarity: 'uncommon' },

  // ── Curios (Curio Shelf — unique finds, +5 Prosperity each) ──────────────
  seers_orb:    { name: "Seer's Orb",    img: `${MAGIC}/001-crystal ball.svg`, kind: 'curio', sell: 80, rarity: 'epic' },
  ancient_rune: { name: 'Ancient Rune',  img: `${MAGIC}/021-rune.svg`, kind: 'curio', sell: 60, rarity: 'rare' },
  bottled_fairy: { name: 'Bottled Fairy', img: `${MAGIC}/029-fairy.svg`, kind: 'curio', sell: 120, rarity: 'legendary' },
  lost_ring:    { name: 'Lost Ring',     img: `${MAGIC}/034-magic ring.svg`, kind: 'curio', sell: 70, rarity: 'rare' },
  forest_amulet: { name: 'Forest Amulet', img: `${MAGIC}/046-amulet.svg`, kind: 'curio', sell: 65, rarity: 'rare' },
  star_chart:   { name: 'Star Chart',    img: `${MAGIC}/049-constellation.svg`, kind: 'curio', sell: 85, rarity: 'epic' },
  puzzle_box:   { name: 'Puzzle Box',    img: `${MAGIC}/037-magic box.svg`, kind: 'curio', sell: 55, rarity: 'rare' },
  dragon_idol:  { name: 'Dragon Idol',   img: `${MAGIC}/036-dragon.svg`, kind: 'curio', sell: 150, rarity: 'legendary' },
  unicorn_figurine: { name: 'Unicorn Figurine', img: `${MAGIC}/035-unicorn.svg`, kind: 'curio', sell: 110, rarity: 'legendary' },
  old_talisman: { name: 'Old Talisman',  img: `${MAGIC}/044-triquetra.svg`, kind: 'curio', sell: 50, rarity: 'rare' },
  enchanted_mirror: { name: 'Enchanted Mirror', img: `${MAGIC}/041-magic mirror.svg`, kind: 'curio', sell: 95, rarity: 'epic' },
  glacier_shard: { name: 'Glacier Shard', img: `${WATER}/014-iceberg.svg`, kind: 'curio', sell: 75, rarity: 'epic' },
  fate_card:    { name: 'Fate Card',     img: `${MAGIC}/002-tarot.svg`, kind: 'curio', sell: 45, rarity: 'rare' },
  honey_comb:   { name: 'Great Honeycomb', img: `${BUGS}/043-honeycomb.svg`, kind: 'curio', sell: 60, rarity: 'rare' },

  recipe_scroll: { name: 'Recipe Scroll', img: `${MAGIC}/030-scroll.svg`, kind: 'scroll', sell: 0, rarity: 'rare' },
};

export const CURIO_IDS = Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'curio');
export const RARE_ING_IDS = Object.keys(ITEMS).filter((id) => ITEMS[id].kind === 'rareIng');

// ═══════════════════════════════════════════════════════════════════════════
// CRITTERS — 50 collectible bugs found while scavenging and foraging.
// Each unique find: +2 Prosperity, +20 Menagerie essence.
// ═══════════════════════════════════════════════════════════════════════════
const critter = (file, name, rarity) => ({ id: file.split('-').slice(1).join('-').replace('.svg', '').replace(/ /g, '_') + '_' + file.slice(0, 3), name, img: `${BUGS}/${file}`, rarity });
export const CRITTERS = [
  critter('001-ladybug.svg', 'Ladybug', 'common'),
  critter('002-butterfly.svg', 'Meadow Butterfly', 'common'),
  critter('003-ant.svg', 'Worker Ant', 'common'),
  critter('004-bee.svg', 'Honeybee', 'common'),
  critter('005-wasp.svg', 'Paper Wasp', 'common'),
  critter('006-bumblebee.svg', 'Bumblebee', 'common'),
  critter('007-spider.svg', 'Garden Spider', 'common'),
  critter('008-fly.svg', 'Bluebottle Fly', 'common'),
  critter('009-dragonfly.svg', 'Dragonfly', 'uncommon'),
  critter('010-worm.svg', 'Earthworm', 'common'),
  critter('011-caterpillar.svg', 'Caterpillar', 'common'),
  critter('012-cicada.svg', 'Summer Cicada', 'uncommon'),
  critter('013-grasshopper.svg', 'Grasshopper', 'common'),
  critter('014-cricket.svg', 'Field Cricket', 'common'),
  critter('015-firefly.svg', 'Firefly', 'rare'),
  critter('016-cochineal.svg', 'Cochineal', 'uncommon'),
  critter('017-mantis.svg', 'Praying Mantis', 'rare'),
  critter('018-beetle.svg', 'Ground Beetle', 'common'),
  critter('019-moth.svg', 'Dusk Moth', 'common'),
  critter('020-black widow.svg', 'Black Widow', 'epic'),
  critter('021-mosquito.svg', 'Mosquito', 'common'),
  critter('022-tarantula.svg', 'Tarantula', 'epic'),
  critter('023-snail.svg', 'Garden Snail', 'common'),
  critter('024-slug.svg', 'Forest Slug', 'common'),
  critter('025-butterfly.svg', 'Azure Butterfly', 'uncommon'),
  critter('026-centipede.svg', 'Centipede', 'uncommon'),
  critter('027-butterfly.svg', 'Monarch Butterfly', 'rare'),
  critter('028-silk cocoon.svg', 'Silk Cocoon', 'rare'),
  critter('029-beetle.svg', 'Jewel Beetle', 'rare'),
  critter('030-spider web.svg', 'Dewdrop Web', 'uncommon'),
  critter('031-bee.svg', 'Queen Bee', 'epic'),
  critter('032-beehive.svg', 'Wild Beehive', 'rare'),
  critter('033-leaf bug.svg', 'Leaf Bug', 'uncommon'),
  critter('034-stick insect.svg', 'Stick Insect', 'rare'),
  critter('035-beetle.svg', 'Longhorn Beetle', 'uncommon'),
  critter('036-beetle.svg', 'Scarab Beetle', 'epic'),
  critter('037-slug.svg', 'Banana Slug', 'uncommon'),
  critter('038-tarantula.svg', 'Curly-Hair Tarantula', 'rare'),
  critter('039-scorpion.svg', 'Cave Scorpion', 'epic'),
  critter('040-flea.svg', 'Flea', 'common'),
  critter('041-mayfly.svg', 'Mayfly', 'uncommon'),
  critter('042-moth.svg', 'Luna Moth', 'rare'),
  critter('043-honeycomb.svg', 'Honeycomb Piece', 'uncommon'),
  critter('044-stag beetle.svg', 'Stag Beetle', 'legendary'),
  critter('045-butterfly.svg', 'Glasswing Butterfly', 'legendary'),
  critter('046-ant.svg', 'Bullet Ant', 'rare'),
  critter('047-weevil.svg', 'Acorn Weevil', 'uncommon'),
  critter('048-louse.svg', 'Bark Louse', 'common'),
  critter('049-termite.svg', 'Termite', 'common'),
  critter('050-tick.svg', 'Forest Tick', 'common'),
];
export const CRITTER_MAP = Object.fromEntries(CRITTERS.map((c) => [c.id, c]));
const CRITTER_WEIGHT = { common: 20, uncommon: 9, rare: 4, epic: 1.6, legendary: 0.5 };
export const rollCritter = () => {
  const total = CRITTERS.reduce((s, c) => s + CRITTER_WEIGHT[c.rarity], 0);
  let roll = Math.random() * total;
  for (const c of CRITTERS) { roll -= CRITTER_WEIGHT[c.rarity]; if (roll <= 0) return c; }
  return CRITTERS[0];
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY MANAGEMENT — the core loop. Limited slots + stack sizes,
// expanded by crafting gear. The camp chest is separate storage.
// ═══════════════════════════════════════════════════════════════════════════
export const INV_BASE_SLOTS = 12;
export const STACK_BASE = 20;
export const CHEST_BASE_SLOTS = 0; // no chest until crafted

// ═══════════════════════════════════════════════════════════════════════════
// GATHERING ZONES + NODES (deliberately slow — this is the grind)
// ═══════════════════════════════════════════════════════════════════════════
export const ZONES = [
  { id: 'forest', name: 'Whispering Forest', img: `${NAT}/018-forest.svg`, skill: 'wood', tool: 'axe', verb: 'Chop',
    bg: "linear-gradient(rgba(6,25,12,0.72), rgba(6,25,12,0.85)), url('/Loot/Backgrounds/night.png')" },
  { id: 'caves', name: 'Glowstone Caves', img: `${NAT}/024-mountain.svg`, skill: 'mine', tool: 'pick', verb: 'Mine',
    bg: "linear-gradient(rgba(15,10,30,0.78), rgba(15,10,30,0.9)), url('/Loot/Backgrounds/bloodmoon.png')" },
  { id: 'lake', name: 'Mistveil Waters', img: `${WATER}/023-lake.svg`, skill: 'fish', tool: 'rod', verb: 'Fish',
    bg: "linear-gradient(rgba(5,20,40,0.72), rgba(5,20,40,0.88)), url('/Loot/Backgrounds/night.png')" },
  { id: 'meadow', name: 'Suncrest Meadow', img: `${NAT}/011-sunflower.svg`, skill: 'forage', tool: null, verb: 'Gather',
    bg: "linear-gradient(rgba(25,30,5,0.62), rgba(20,25,5,0.82)), url('/Loot/Backgrounds/day.png')" },
];

export const STUMP_ICON = `${TREE}/009-tree-stump.svg`;

// hardness = tool-power-clicks per yield; stock = yields before depletion
export const NODES = {
  forest: [
    { id: 'beech',   name: 'Beech Tree',       img: `${TREE}/001-beech.svg`,        yieldId: 'beech_wood',   hardness: 8,  stock: 5, respawnSec: 45,  xp: 5,  level: 1,
      rares: [{ id: 'recipe_scroll', chance: 0.008 }, { id: 'acorn', chance: 0.12 }] },
    { id: 'cherry',  name: 'Wild Cherry Tree', img: `${TREE}/007-cherry-tree.svg`,  yieldId: 'cherry_wood',  hardness: 16, stock: 5, respawnSec: 90,  xp: 11, level: 5,
      rares: [{ id: 'recipe_scroll', chance: 0.010 }, { id: 'tree_sap', chance: 0.015 }, { id: 'wild_egg', chance: 0.05 }] },
    { id: 'banyan',  name: 'Old Banyan',       img: `${TREE}/005-banyan.svg`,       yieldId: 'banyan_wood',  hardness: 28, stock: 4, respawnSec: 180, xp: 20, level: 10,
      rares: [{ id: 'tree_sap', chance: 0.025 }, { id: 'mandrake', chance: 0.008 }, { id: 'recipe_scroll', chance: 0.012 }] },
    { id: 'ironroot', name: 'Ironroot Giant',  img: `${TREE}/008-joshua-tree.svg`,  yieldId: 'ironroot_wood', hardness: 45, stock: 4, respawnSec: 360, xp: 34, level: 16,
      rares: [{ id: 'tree_sap', chance: 0.035 }, { id: 'ancient_rune', chance: 0.005 }] },
    { id: 'elder',   name: 'Elderwood Olive',  img: `${TREE}/006-olive-tree.svg`,   yieldId: 'elder_wood',   hardness: 70, stock: 3, respawnSec: 720, xp: 55, level: 22,
      rares: [{ id: 'glimmer_dust', chance: 0.012 }, { id: 'bottled_fairy', chance: 0.003 }, { id: 'recipe_scroll', chance: 0.018 }] },
  ],
  caves: [
    { id: 'stone',   name: 'Stone Outcrop',  img: `${NAT}/024-mountain.svg`, tint: T.dark,   yieldId: 'stone',       hardness: 7,  stock: 6, respawnSec: 40,  xp: 4,  level: 1,
      rares: [{ id: 'bone', chance: 0.04 }] },
    { id: 'copper',  name: 'Copper Vein',    img: `${NAT}/024-mountain.svg`, tint: T.copper, yieldId: 'copper_ore',  hardness: 13, stock: 5, respawnSec: 80,  xp: 9,  level: 3,
      rares: [{ id: 'salt', chance: 0.10 }] },
    { id: 'iron',    name: 'Iron Vein',      img: `${NAT}/024-mountain.svg`, tint: T.iron,   yieldId: 'iron_ore',    hardness: 24, stock: 5, respawnSec: 150, xp: 16, level: 8,
      rares: [{ id: 'salt', chance: 0.10 }, { id: 'old_talisman', chance: 0.004 }] },
    { id: 'silver',  name: 'Silver Seam',    img: `${NAT}/024-mountain.svg`, tint: T.silver, yieldId: 'silver_ore',  hardness: 36, stock: 4, respawnSec: 240, xp: 24, level: 12,
      rares: [{ id: 'lost_ring', chance: 0.005 }, { id: 'recipe_scroll', chance: 0.010 }] },
    { id: 'gold',    name: 'Gold Seam',      img: `${NAT}/024-mountain.svg`, tint: T.gold,   yieldId: 'gold_ore',    hardness: 50, stock: 4, respawnSec: 420, xp: 35, level: 16,
      rares: [{ id: 'puzzle_box', chance: 0.006 }, { id: 'glimmer_dust', chance: 0.008 }] },
    { id: 'mithril', name: 'Mithril Heart',  img: `${MAGIC}/017-crystal.svg`, tint: T.mythic, yieldId: 'mithril_ore', hardness: 85, stock: 3, respawnSec: 900, xp: 65, level: 22,
      rares: [{ id: 'glimmer_dust', chance: 0.02 }, { id: 'dragon_idol', chance: 0.003 }, { id: 'seers_orb', chance: 0.005 }] },
  ],
  meadow: [
    { id: 'berry',   name: 'Berry Bush',    img: `${SNACK}/049-berries.svg`,  yieldId: 'berries',  hardness: 5,  stock: 5, respawnSec: 50,  xp: 4,  level: 1,
      rares: [{ id: 'fate_card', chance: 0.003 }] },
    { id: 'flax',    name: 'Wild Flax',     img: `${NAT}/025-grass.svg`,      yieldId: 'fiber',    hardness: 4,  stock: 7, respawnSec: 45,  xp: 3,  level: 1,
      rares: [] },
    { id: 'basilp',  name: 'Basil Patch',   img: `${COOK}/046-basil.svg`,     yieldId: 'basil',    hardness: 6,  stock: 5, respawnSec: 70,  xp: 6,  level: 3,
      rares: [{ id: 'recipe_scroll', chance: 0.010 }] },
    { id: 'shroom',  name: 'Mushroom Ring', img: `${FV}/049-mushroom.svg`,    yieldId: 'mushroom', hardness: 8,  stock: 4, respawnSec: 100, xp: 9,  level: 6,
      rares: [{ id: 'truffle', chance: 0.010 }, { id: 'mandrake', chance: 0.008 }] },
    { id: 'herbrow', name: 'Herb Hollow',   img: `${COOK}/045-rosemary.svg`,  yieldId: 'rosemary', hardness: 10, stock: 4, respawnSec: 140, xp: 12, level: 9,
      rares: [{ id: 'mint', chance: 0.35 }, { id: 'recipe_scroll', chance: 0.012 }] },
    { id: 'hive',    name: 'Wild Hive',     img: `${BUGS}/032-beehive.svg`,   yieldId: 'honey',    hardness: 14, stock: 3, respawnSec: 240, xp: 16, level: 12,
      rares: [{ id: 'honey_comb', chance: 0.008 }] },
    { id: 'avotree', name: 'Avocado Grove', img: `${FV}/045-avocado.svg`,     yieldId: 'avocado',  hardness: 16, stock: 3, respawnSec: 300, xp: 20, level: 15,
      rares: [{ id: 'moonpetal', chance: 0.010 }] },
    { id: 'moonglade', name: 'Moonlit Glade', img: `${NAT}/010-tulip.svg`, tint: T.purple, yieldId: 'moonpetal', hardness: 30, stock: 2, respawnSec: 600, xp: 32, level: 20,
      rares: [{ id: 'glimmer_dust', chance: 0.02 }, { id: 'unicorn_figurine', chance: 0.003 }, { id: 'bottled_fairy', chance: 0.002 }] },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// FISHING SPOTS — each unlocks with rod tier + level, with its own table
// ═══════════════════════════════════════════════════════════════════════════
export const FISHING_SPOTS = [
  { id: 'creek',  name: 'Babbling Creek', img: `${WATER}/011-creek.svg`, rod: 0, level: 1,
    table: [['old_junk', 10], ['minnow', 40], ['perch', 25], ['trout', 12]] },
  { id: 'lake',   name: 'Mistveil Lake',  img: `${WATER}/023-lake.svg`, rod: 1, level: 5,
    table: [['old_junk', 8], ['perch', 25], ['trout', 22], ['bass', 16], ['catfish', 9], ['pearl', 0.8]] },
  { id: 'river',  name: 'Silverrun River', img: `${WATER}/021-river.svg`, rod: 2, level: 9,
    table: [['old_junk', 6], ['trout', 20], ['bass', 18], ['eel', 12], ['salmon', 9], ['pearl', 1], ['ghostfin', 0.7]] },
  { id: 'grotto', name: 'Echo Grotto',    img: `${WATER}/008-grotto.svg`, rod: 3, level: 13,
    table: [['catfish', 18], ['eel', 16], ['salmon', 12], ['pike', 9], ['ghostfin', 1.4], ['pearl', 1.4], ['glacier_shard', 0.4]] },
  { id: 'hotspring', name: 'Ember Spring', img: `${WATER}/003-hot spring.svg`, rod: 4, level: 17,
    table: [['salmon', 16], ['pike', 14], ['sturgeon', 9], ['golden_koi', 1], ['ghostfin', 1.6], ['enchanted_mirror', 0.3]] },
  { id: 'deep',   name: 'The Deepshine',  img: `${WATER}/048-ocean.svg`, rod: 5, level: 22,
    table: [['pike', 16], ['sturgeon', 14], ['golden_koi', 2], ['ghostfin', 2], ['leviathan', 0.5], ['glacier_shard', 0.7], ['pearl', 2]] },
];
export const JUNK_IDS = ['kelp', 'driftwood'];
export const FISH_WAIT_MIN_S = 5;
export const FISH_WAIT_MAX_S = 20;
export const FISH_BITE_WINDOW_MS = 2400;
export const FISH_XP = { minnow: 4, perch: 6, trout: 10, bass: 14, catfish: 18, eel: 22, salmon: 28, pike: 36, sturgeon: 46, ghostfin: 60, golden_koi: 90, leviathan: 220, pearl: 35, glacier_shard: 40, enchanted_mirror: 40, old_junk: 1 };

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS (slower growth — upgrades matter)
// ═══════════════════════════════════════════════════════════════════════════
export const TOOL_TIERS = [
  { tier: 0, name: 'Flint',   power: 1 },
  { tier: 1, name: 'Copper',  power: 1.6 },
  { tier: 2, name: 'Iron',    power: 2.4 },
  { tier: 3, name: 'Silver',  power: 3.4 },
  { tier: 4, name: 'Gold',    power: 4.6 },
  { tier: 5, name: 'Mithril', power: 6.5 },
];
export const TOOL_DEFS = {
  axe:  { name: 'Axe',     img: `${CAMP}/010-axe.svg` },
  pick: { name: 'Pickaxe', img: `${FARM}/009-hoe.svg` },
  rod:  { name: 'Rod',     img: `${CAMP}/006-rope.svg` },
};
export const TOOL_COSTS = {
  1: { copper_bar: 5,  beech_wood: 15 },
  2: { iron_bar: 6,    cherry_wood: 18 },
  3: { silver_bar: 8,  banyan_wood: 20, hide: 4 },
  4: { gold_bar: 10,   ironroot_wood: 22, hide: 8 },
  5: { mithril_bar: 12, elder_wood: 20, glimmer_dust: 2 },
};
export const TOOL_LEVEL_REQ = { 1: 3, 2: 8, 3: 12, 4: 16, 5: 22 };

// ═══════════════════════════════════════════════════════════════════════════
// SKILLS (max 30 — long grind)
// ═══════════════════════════════════════════════════════════════════════════
export const SKILLS = {
  wood:   { name: 'Woodcutting', img: `${CAMP}/010-axe.svg` },
  mine:   { name: 'Mining',      img: `${NAT}/024-mountain.svg` },
  fish:   { name: 'Fishing',     img: `${NAT}/027-fish.svg` },
  forage: { name: 'Foraging',    img: `${NAT}/008-leaf.svg` },
  cook:   { name: 'Cooking',     img: `${COOK}/012-frying pan.svg` },
  hunt:   { name: 'Hunting',     img: `${CAMP}/003-knife.svg` },
};
export const SKILL_MAX = 30;
export const skillXpToNext = (level) => 40 + level * 30;
export const skillLevel = (xp) => {
  let lvl = 1; let rem = Number(xp) || 0;
  while (lvl < SKILL_MAX && rem >= skillXpToNext(lvl)) { rem -= skillXpToNext(lvl); lvl += 1; }
  return lvl;
};
export const skillProgress = (xp) => {
  let lvl = 1; let rem = Number(xp) || 0;
  while (lvl < SKILL_MAX && rem >= skillXpToNext(lvl)) { rem -= skillXpToNext(lvl); lvl += 1; }
  return { level: lvl, into: rem, needed: lvl >= SKILL_MAX ? 0 : skillXpToNext(lvl) };
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPEDITIONS — timed scavenge/hunt trips with chance loot
// ═══════════════════════════════════════════════════════════════════════════
export const EXPEDITIONS = {
  scavenge: {
    name: 'Scavenge', img: `${CAMP}/009-binoculars.svg`,
    desc: 'Comb the wilds for materials, seeds and critters.',
    durations: [
      { minutes: 15,  rolls: 4,  name: 'Quick Look' },
      { minutes: 60,  rolls: 9,  name: 'Long Ramble' },
      { minutes: 240, rolls: 22, name: 'Deep Expedition' },
    ],
    table: [
      ['fiber', 20], ['berries', 15], ['acorn', 12], ['basil', 10], ['mushroom', 9],
      ['stone', 8], ['beech_wood', 8], ['wild_egg', 6], ['CRITTER', 6], ['SEED', 5],
      ['honey', 3], ['rosemary', 3], ['avocado', 2], ['recipe_scroll', 1.2],
      ['mandrake', 0.8], ['tree_sap', 0.8], ['CURIO', 0.5], ['glimmer_dust', 0.3],
    ],
  },
  hunt: {
    name: 'Hunt', img: `${CAMP}/003-knife.svg`,
    desc: 'Track game for meat, hides, bones and feathers.',
    needs: 'knife1', // hunting gear craft required
    durations: [
      { minutes: 30,  rolls: 5,  name: 'Short Stalk' },
      { minutes: 120, rolls: 12, name: 'Day Hunt' },
      { minutes: 360, rolls: 26, name: 'Great Hunt' },
    ],
    table: [
      ['meat', 26], ['bone', 18], ['feather', 16], ['hide', 14], ['wild_egg', 8],
      ['bacon', 5], ['CRITTER', 4], ['meat', 4], ['recipe_scroll', 1],
      ['golden_feather', 0.5], ['CURIO', 0.5], ['truffle', 0.7],
    ],
  },
};
export const HUNT_XP_PER_ROLL = 6;
export const SCAV_XP_PER_ROLL = 4;
export const SEED_DROPS = ['carrot_seed', 'potato_seed', 'cabbage_seed', 'oats_seed', 'tomato_seed', 'onion_seed'];

// ═══════════════════════════════════════════════════════════════════════════
// FARMING
// ═══════════════════════════════════════════════════════════════════════════
export const FARM_BASE_PLOTS = 3;
export const CROPS = [
  { seedId: 'carrot_seed',   cropId: 'carrot',     growMin: 30,   yield: 2, seedCost: 5 },
  { seedId: 'potato_seed',   cropId: 'potato',     growMin: 45,   yield: 3, seedCost: 6 },
  { seedId: 'cabbage_seed',  cropId: 'cabbage',    growMin: 70,   yield: 2, seedCost: 8 },
  { seedId: 'oats_seed',     cropId: 'oats',       growMin: 90,   yield: 3, seedCost: 9 },
  { seedId: 'tomato_seed',   cropId: 'tomato',     growMin: 140,  yield: 3, seedCost: 12 },
  { seedId: 'onion_seed',    cropId: 'onion',      growMin: 180,  yield: 3, seedCost: 14 },
  { seedId: 'corn_seed',     cropId: 'corn',       growMin: 260,  yield: 4, seedCost: 18 },
  { seedId: 'strawberry_seed', cropId: 'strawberry', growMin: 320, yield: 3, seedCost: 22 },
  { seedId: 'garlic_seed',   cropId: 'garlic',     growMin: 400,  yield: 3, seedCost: 24 },
  { seedId: 'chili_seed',    cropId: 'chili',      growMin: 540,  yield: 2, seedCost: 35 },
  { seedId: 'pumpkin_seed',  cropId: 'pumpkin',    growMin: 720,  yield: 2, seedCost: 45 },
  { seedId: 'watermelon_seed', cropId: 'watermelon', growMin: 900, yield: 2, seedCost: 55 },
  { seedId: 'sunfruit_seed', cropId: 'sunfruit',   growMin: 1440, yield: 1, seedCost: 200 },
];
export const CROP_BY_SEED = Object.fromEntries(CROPS.map((c) => [c.seedId, c]));
export const GOLDEN_CROP_CHANCE = 0.04;
// Seeds share one sprout icon
CROPS.forEach((c) => {
  ITEMS[c.seedId] = { name: `${ITEMS[c.cropId].name} Seed`, img: `${FARM}/003-sprout.svg`, kind: 'seed', sell: Math.max(1, Math.floor(c.seedCost / 3)), rarity: ITEMS[c.cropId].rarity };
});

// Animal pens: craft once, produce over real time, collect at the pen
export const PENS = [
  { id: 'coop', name: 'Chicken Coop', img: `${FARM}/008-chicken.svg`, produceId: 'egg',  perHour: 2,   capHours: 10 },
  { id: 'goatpen', name: 'Goat Pen',  img: `${FARM}/006-goat.svg`,    produceId: 'milk', perHour: 1.5, capHours: 10 },
  { id: 'cowbarn', name: 'Cow Barn',  img: `${FARM}/007-cow.svg`,     produceId: 'milk', perHour: 3,   capHours: 12 },
];
export const PEN_MAP = Object.fromEntries(PENS.map((p) => [p.id, p]));

// ═══════════════════════════════════════════════════════════════════════════
// SMELTING
// ═══════════════════════════════════════════════════════════════════════════
export const SMELT_SLOTS = 2;
export const SMELT_RECIPES = [
  { barId: 'copper_bar',  oreId: 'copper_ore',  ore: 3, fuel: 3,  minutes: 4 },
  { barId: 'iron_bar',    oreId: 'iron_ore',    ore: 3, fuel: 5,  minutes: 10 },
  { barId: 'silver_bar',  oreId: 'silver_ore',  ore: 3, fuel: 7,  minutes: 20 },
  { barId: 'gold_bar',    oreId: 'gold_ore',    ore: 3, fuel: 10, minutes: 40 },
  { barId: 'mithril_bar', oreId: 'mithril_ore', ore: 4, fuel: 16, minutes: 90 },
];

// ═══════════════════════════════════════════════════════════════════════════
// COOKING — 48 recipes. Kitchen tiers via stations; cauldron = potions.
// ═══════════════════════════════════════════════════════════════════════════
export const KITCHEN_TIERS = [
  { tier: 0, name: 'Campfire',        img: `${CAMP}/001-fire.svg` },
  { tier: 1, name: 'Stone Stove',     img: `${COOK}/006-gas stove.svg` },
  { tier: 2, name: 'Wildwood Oven',   img: `${COOK}/042-oven.svg` },
];

export const BUFF_LABELS = {
  gatherSpeed: { name: 'Gathering power', img: `${CAMP}/010-axe.svg` },
  doubleDrop:  { name: 'Double drops',    img: `${CAMP}/008-basket.svg` },
  rareLuck:    { name: 'Rare find luck',  img: `${MAGIC}/032-magic dust.svg` },
  fishLuck:    { name: 'Fishing luck',    img: `${NAT}/027-fish.svg` },
  fishFast:    { name: 'Quick bites',     img: `${WATER}/006-drop.svg` },
  smeltFast:   { name: 'Smelting speed',  img: `${CAMP}/001-fire.svg` },
  xpBoost:     { name: 'Skill XP',        img: `${MAGIC}/006-spellbook.svg` },
  cropFast:    { name: 'Crop growth',     img: `${FARM}/003-sprout.svg` },
  expLuck:     { name: 'Expedition luck', img: `${CAMP}/009-binoculars.svg` },
  penBoost:    { name: 'Animal output',   img: `${FARM}/008-chicken.svg` },
};
export const MAX_ACTIVE_BUFFS = 2;

const R = (id, name, iconPath, tier, unlock, ing, fuel, xp, buff, desc) =>
  ({ id, name, img: iconPath, tier, ...unlock, ing, fuel, xp, buff, desc });

export const RECIPES = [
  // ── Campfire basics (start / early levels) ────────────────────────────────
  R('berry_jam', 'Berry Jam', `${SWEET}/040-jam.svg`, 0, { start: true }, { berries: 4 }, 2, 6, { type: 'xpBoost', value: 10, minutes: 10 }, 'Sweet, sticky motivation.'),
  R('campfire_fish', 'Campfire Fish', `${SNACK}/048-sashimi.svg`, 0, { start: true }, { minnow: 2, basil: 1 }, 2, 6, { type: 'fishFast', value: 15, minutes: 10 }, 'The first catch always tastes best.'),
  R('herb_tea', 'Forest Tea', `${SNACK}/010-tea.svg`, 0, { start: true }, { basil: 2, mint: 1 }, 1, 5, { type: 'gatherSpeed', value: 10, minutes: 10 }, 'A spring in your swing.'),
  R('boiled_eggs', 'Boiled Eggs', `${SNACK}/035-boiled eggs.svg`, 0, { start: true }, { wild_egg: 2 }, 2, 6, { type: 'doubleDrop', value: 8, minutes: 8 }, 'Simple. Round. Reliable.'),
  R('scrambled', 'Scrambled Eggs', `${COOK}/047-scrambled eggs.svg`, 0, { cookLevel: 2 }, { egg: 2, milk: 1 }, 3, 9, { type: 'penBoost', value: 20, minutes: 15 }, 'The hens approve of the irony.'),
  R('forest_fries', 'Forest Fries', `${SNACK}/017-fries.svg`, 0, { cookLevel: 3 }, { potato: 2, olive_oil: 1, salt: 1 }, 3, 10, { type: 'gatherSpeed', value: 15, minutes: 14 }, 'Crispy fuel for hard work.'),
  R('oatmeal', 'Honest Oatmeal', `${SNACK}/039-oatmeal.svg`, 0, { cookLevel: 4 }, { oats: 2, milk: 1, honey: 1 }, 3, 11, { type: 'xpBoost', value: 15, minutes: 15 }, 'Breakfast of homesteaders.'),
  R('smores', 'Campfire Smores', `${SWEET}/013-smore.svg`, 0, { cookLevel: 5 }, { sugar: 2, cocoa: 1, honey: 1 }, 4, 13, { type: 'expLuck', value: 15, minutes: 20 }, 'Expedition morale +100.'),
  R('salad', 'Meadow Salad', `${SNACK}/022-salad.svg`, 0, { cookLevel: 6 }, { cabbage: 1, tomato: 1, avocado: 1 }, 1, 12, { type: 'cropFast', value: 15, minutes: 20 }, 'The garden, in a bowl.'),
  R('kebab', 'Hunter Kebab', `${SNACK}/003-snacking.svg`, 0, { cookLevel: 7 }, { meat: 2, onion: 1, chili: 1 }, 4, 15, { type: 'gatherSpeed', value: 20, minutes: 18 }, 'Reward for a good stalk.'),

  // ── Stone Stove (tier 1) ──────────────────────────────────────────────────
  R('tomato_soup', 'Tomato Soup', `${SNACK}/033-tomato soup.svg`, 1, { cookLevel: 8 }, { tomato: 3, basil: 1, salt: 1 }, 5, 17, { type: 'doubleDrop', value: 15, minutes: 18 }, 'Ladled straight from summer.'),
  R('avo_toast', 'Avocado Toast', `${SNACK}/020-avocado toast.svg`, 1, { cookLevel: 9 }, { avocado: 1, oats: 2, wild_egg: 1 }, 4, 18, { type: 'xpBoost', value: 20, minutes: 18 }, 'Fancy? In THIS forest?'),
  R('pancakes', 'Fluffy Pancakes', `${SWEET}/030-pancakes.svg`, 1, { cookLevel: 10 }, { oats: 2, egg: 1, milk: 1, honey: 1 }, 5, 20, { type: 'penBoost', value: 30, minutes: 25 }, 'Stack them past the treeline.'),
  R('grilled_cheese', 'Grilled Cheese', `${SNACK}/032-cheese.svg`, 1, { cookLevel: 11 }, { cheese: 1, oats: 2 }, 4, 20, { type: 'smeltFast', value: 20, minutes: 22 }, 'Melts like a sunset.'),
  R('fish_stew', 'Lakekeeper Stew', `${COOK}/039-broth.svg`, 1, { cookLevel: 12 }, { trout: 2, potato: 1, onion: 1 }, 6, 22, { type: 'fishLuck', value: 20, minutes: 20 }, 'The lake respects a good stew.'),
  R('pasta_pomodoro', 'Pasta Pomodoro', `${COOK}/023-pasta.svg`, 1, { cookLevel: 13 }, { pasta: 2, tomato: 2, garlic: 1, olive_oil: 1 }, 5, 24, { type: 'gatherSpeed', value: 25, minutes: 25 }, 'Twirl-powered productivity.'),
  R('bacon_brekky', 'Bacon Breakfast', `${COOK}/018-bacon.svg`, 1, { cookLevel: 14 }, { bacon: 2, egg: 2 }, 5, 24, { type: 'expLuck', value: 25, minutes: 25 }, 'Hunters hunt better on bacon.'),
  R('miners_hotpot', "Miner's Hotpot", `${COOK}/035-cooking pot.svg`, 1, { cookLevel: 15 }, { potato: 2, mushroom: 2, meat: 1, salt: 1 }, 6, 26, { type: 'smeltFast', value: 30, minutes: 25 }, 'Keeps the furnace roaring.'),
  R('pumpkin_soup', 'Harvest Soup', `${FV}/020-pumpkin.svg`, 1, { cookLevel: 16 }, { pumpkin: 1, milk: 1, rosemary: 1 }, 6, 28, { type: 'cropFast', value: 25, minutes: 30 }, 'The garden grows to smell it.'),
  R('sushi', 'Riverside Sushi', `${SNACK}/024-sushi.svg`, 1, { cookLevel: 17 }, { rice: 2, salmon: 1, kelp: 1 }, 4, 30, { type: 'fishLuck', value: 28, minutes: 25 }, 'Kelp: finally useful.'),
  R('poke_bowl', 'Angler Poke Bowl', `${SNACK}/023-poke bowl.svg`, 1, { cookLevel: 18 }, { rice: 2, bass: 1, avocado: 1 }, 4, 30, { type: 'fishFast', value: 30, minutes: 25 }, 'Fresh from three worlds.'),
  R('cookies', 'Acorn Cookies', `${SWEET}/008-cookies.svg`, 1, { cookLevel: 19 }, { acorn: 3, sugar: 2, egg: 1 }, 5, 30, { type: 'xpBoost', value: 30, minutes: 25 }, 'Squirrel-approved.'),

  // ── Wildwood Oven (tier 2) ────────────────────────────────────────────────
  R('apple_pie', 'Orchard Pie', `${SWEET}/015-apple pie.svg`, 2, { cookLevel: 20 }, { strawberry: 2, oats: 2, sugar: 2, egg: 1 }, 8, 36, { type: 'doubleDrop', value: 25, minutes: 30 }, 'Technically a strawberry pie. Shh.'),
  R('cheesecake', 'Moon Cheesecake', `${SWEET}/020-cheesecake.svg`, 2, { cookLevel: 21 }, { cheese: 2, sugar: 2, egg: 2 }, 8, 38, { type: 'penBoost', value: 40, minutes: 35 }, 'Luminous. Possibly literally.'),
  R('big_roast', 'Wildwood Roast', `${COOK}/015-meat.svg`, 2, { cookLevel: 22 }, { meat: 3, garlic: 2, rosemary: 2 }, 10, 42, { type: 'gatherSpeed', value: 35, minutes: 35 }, 'A feast for one very hungry hero.'),
  R('gelato', 'Glacier Gelato', `${SNACK}/030-gelato.svg`, 2, { cookLevel: 24 }, { milk: 2, sugar: 2, strawberry: 2 }, 6, 44, { type: 'fishFast', value: 40, minutes: 30 }, 'Chilled with mountain patience.'),

  // ── Scroll recipes (found in the wilds — stronger) ────────────────────────
  R('trail_mix', "Wanderer's Trail Mix", `${SNACK}/013-protein bar.svg`, 0, { scroll: true }, { acorn: 2, berries: 2, honey: 1 }, 1, 16, { type: 'expLuck', value: 30, minutes: 30 }, 'Scrawled on a trail marker.'),
  R('smoked_eel', 'Smoked Marsh Eel', `${SNACK}/028-agedashi.svg`, 1, { scroll: true }, { eel: 1, banyan_wood: 1, salt: 1 }, 6, 30, { type: 'fishFast', value: 35, minutes: 25 }, 'An old fisher’s secret.'),
  R('golden_omelette', 'Golden Omelette', `${COOK}/047-scrambled eggs.svg`, 1, { scroll: true }, { egg: 2, golden_feather: 1, cheese: 1 }, 6, 40, { type: 'rareLuck', value: 25, minutes: 25 }, 'Glimmers as it cooks.'),
  R('guacamole', 'Grove Guacamole', `${SNACK}/042-guacamole.svg`, 0, { scroll: true }, { avocado: 2, tomato: 1, chili: 1 }, 1, 26, { type: 'doubleDrop', value: 22, minutes: 25 }, 'Smash with intent.'),
  R('truffle_pasta', 'Truffle Pasta', `${COOK}/023-pasta.svg`, 2, { scroll: true }, { truffle: 1, pasta: 2, cheese: 1 }, 8, 45, { type: 'doubleDrop', value: 35, minutes: 30 }, 'Worth every muddy dig.'),
  R('moon_tart', 'Moonlight Tart', `${SWEET}/041-tart.svg`, 2, { scroll: true }, { moonpetal: 1, berries: 3, sugar: 2 }, 8, 48, { type: 'rareLuck', value: 35, minutes: 30 }, 'Tastes like quiet midnight.'),
  R('koi_sashimi', 'Golden Koi Sashimi', `${SNACK}/048-sashimi.svg`, 2, { scroll: true }, { golden_koi: 1, rice: 1, salt: 1 }, 3, 60, { type: 'fishLuck', value: 45, minutes: 35 }, 'Almost too beautiful to eat.'),
  R('sun_smoothie', 'Sunrise Smoothie', `${SNACK}/002-smoothie.svg`, 1, { scroll: true }, { sunfruit: 1, milk: 1, honey: 1 }, 2, 55, { type: 'xpBoost', value: 45, minutes: 35 }, 'Bottled dawn.'),
  R('crepes', 'Fairy Crepes', `${SWEET}/022-crepe.svg`, 2, { scroll: true }, { oats: 2, egg: 2, glimmer_dust: 1 }, 7, 55, { type: 'expLuck', value: 45, minutes: 40 }, 'Impossibly thin. Slightly floaty.'),
  R('hunters_wrap', "Hunter's Wrap", `${SNACK}/019-wrap.svg`, 1, { scroll: true }, { meat: 2, cabbage: 1, cheese: 1 }, 5, 34, { type: 'gatherSpeed', value: 30, minutes: 30 }, 'Portable. Devourable.'),
  R('leviathan_feast', 'Leviathan Feast', `${COOK}/035-cooking pot.svg`, 2, { scroll: true }, { leviathan: 1, pumpkin: 1, moonpetal: 1, salt: 2 }, 16, 160, { type: 'gatherSpeed', value: 50, minutes: 60 }, 'A meal spoken of in legends.'),

  // ── Cauldron brews (need the Cauldron station) ────────────────────────────
  R('lucky_brew', 'Lucky Clover Brew', `${MAGIC}/010-potion.svg`, 0, { cauldron: true, cookLevel: 10 }, { mandrake: 1, mint: 2, honey: 1 }, 4, 30, { type: 'rareLuck', value: 30, minutes: 30 }, 'Fortune favours the brewer.'),
  R('growth_tonic', 'Growth Tonic', `${MAGIC}/013-potion.svg`, 0, { cauldron: true, cookLevel: 14 }, { tree_sap: 1, moonpetal: 1, milk: 1 }, 5, 36, { type: 'cropFast', value: 40, minutes: 40 }, 'The pumpkins whisper thanks.'),
  R('miners_draught', "Deepdelver's Draught", `${MAGIC}/027-potion.svg`, 0, { cauldron: true, cookLevel: 18 }, { glimmer_dust: 1, mushroom: 3, salt: 1 }, 6, 44, { type: 'gatherSpeed', value: 40, minutes: 40 }, 'You can smell the ore veins.'),
  R('stargazer_elixir', 'Stargazer Elixir', `${MAGIC}/047-flame.svg`, 0, { cauldron: true, cookLevel: 24 }, { glimmer_dust: 2, sunfruit: 1, moonpetal: 1 }, 10, 80, { type: 'rareLuck', value: 50, minutes: 45 }, 'Drink the night sky.'),
];
export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const SCROLL_RECIPES = RECIPES.filter((r) => r.scroll).map((r) => r.id);

// ═══════════════════════════════════════════════════════════════════════════
// CRAFTS — stations, gear (inventory!), farm, helpers
// ═══════════════════════════════════════════════════════════════════════════
export const CRAFTS = [
  // Stations
  { id: 'workbench', cat: 'station', name: 'Workbench', img: `${CAMP}/003-knife.svg`, prosperity: 10,
    items: { beech_wood: 25, stone: 12, fiber: 10 }, desc: 'Unlocks tool upgrades and serious building.' },
  { id: 'smelter', cat: 'station', name: 'Stone Furnace', img: `${MAGIC}/023-burner.svg`, prosperity: 15, needs: ['workbench'],
    items: { stone: 40, copper_ore: 10, beech_wood: 20 }, desc: 'Smelt ores into bars (real-time, offline too).' },
  { id: 'stove', cat: 'station', name: 'Stone Stove', img: `${COOK}/006-gas stove.svg`, prosperity: 15, needs: ['workbench'],
    items: { stone: 30, iron_bar: 4, cherry_wood: 18 }, skill: ['cook', 8], desc: 'Kitchen tier 2 — hearty recipes.' },
  { id: 'kitchen', cat: 'station', name: 'Wildwood Oven', img: `${COOK}/042-oven.svg`, prosperity: 30, needs: ['stove'],
    items: { banyan_wood: 25, silver_bar: 6, gold_bar: 2, hide: 6 }, skill: ['cook', 18], desc: 'Kitchen tier 3 — masterpiece dishes.' },
  { id: 'cauldron', cat: 'station', name: 'Witch Cauldron', img: `${MAGIC}/008-cauldron.svg`, prosperity: 25, needs: ['stove'],
    items: { iron_bar: 8, mandrake: 1, glimmer_dust: 1 }, skill: ['cook', 10], desc: 'Brew potent potions from rare ingredients.' },

  // Gear — INVENTORY expansion (the big goals)
  { id: 'pouch', cat: 'gear', name: 'Fiber Pouch', img: `${MAGIC}/038-bag.svg`, prosperity: 6,
    items: { fiber: 25, hide: 2 }, slots: 4, desc: '+4 inventory slots.' },
  { id: 'satchel', cat: 'gear', name: 'Leather Satchel', img: `${MAGIC}/038-bag.svg`, tint: T.copper, prosperity: 12, needs: ['pouch'],
    items: { hide: 8, fiber: 20, copper_bar: 2 }, slots: 5, desc: '+5 inventory slots.' },
  { id: 'backpack', cat: 'gear', name: 'Explorer Backpack', img: `${CAMP}/007-backpack.svg`, prosperity: 20, needs: ['satchel'],
    items: { hide: 15, iron_bar: 4, fiber: 30 }, slots: 6, desc: '+6 inventory slots.' },
  { id: 'voidbag', cat: 'gear', name: 'Bottomless Bag', img: `${MAGIC}/038-bag.svg`, tint: T.purple, prosperity: 35, needs: ['backpack'],
    items: { hide: 20, glimmer_dust: 2, silver_bar: 6, moonpetal: 1 }, slots: 9, desc: '+9 inventory slots. Don’t look inside.' },
  { id: 'ropebundle', cat: 'gear', name: 'Rope Bindings', img: `${CAMP}/006-rope.svg`, prosperity: 8,
    items: { fiber: 40, beech_wood: 10 }, stack: 15, desc: 'Bundle items tighter: +15 stack size.' },
  { id: 'crates', cat: 'gear', name: 'Packing Crates', img: `${MAGIC}/037-magic box.svg`, prosperity: 16, needs: ['ropebundle', 'workbench'],
    items: { cherry_wood: 30, iron_bar: 3, rope_placeholder: 0, fiber: 20 }, stack: 25, desc: '+25 stack size.' },
  { id: 'enchcrate', cat: 'gear', name: 'Enchanted Crates', img: `${MAGIC}/037-magic box.svg`, tint: T.purple, prosperity: 28, needs: ['crates'],
    items: { banyan_wood: 30, glimmer_dust: 2, silver_bar: 4 }, stack: 40, desc: '+40 stack size. Bigger on the inside.' },
  { id: 'chest1', cat: 'gear', name: 'Camp Chest', img: `${CAMP}/008-basket.svg`, prosperity: 10, needs: ['workbench'],
    items: { cherry_wood: 25, iron_bar: 2 }, chestSlots: 10, desc: 'Camp storage: 10 chest slots (double stacks).' },
  { id: 'chest2', cat: 'gear', name: 'Iron-bound Chest', img: `${CAMP}/008-basket.svg`, tint: T.iron, prosperity: 18, needs: ['chest1'],
    items: { ironroot_wood: 15, iron_bar: 8 }, chestSlots: 10, desc: '+10 chest slots.' },
  { id: 'chest3', cat: 'gear', name: 'Enchanted Chest', img: `${CAMP}/008-basket.svg`, tint: T.purple, prosperity: 30, needs: ['chest2'],
    items: { elder_wood: 10, mithril_bar: 2, glimmer_dust: 1 }, chestSlots: 15, desc: '+15 chest slots.' },

  // Gear — expedition upgrades
  { id: 'knife1', cat: 'gear', name: 'Hunting Knife', img: `${CAMP}/003-knife.svg`, prosperity: 8, needs: ['workbench'],
    items: { copper_bar: 3, beech_wood: 8, fiber: 10 }, desc: 'Unlocks HUNT expeditions.' },
  { id: 'knife2', cat: 'gear', name: 'Skinning Kit', img: `${CAMP}/003-knife.svg`, tint: T.iron, prosperity: 14, needs: ['knife1'],
    items: { iron_bar: 5, hide: 6, bone: 8 }, huntBonus: 25, desc: 'Hunts return 25% more loot.' },
  { id: 'knife3', cat: 'gear', name: 'Master Trapper Set', img: `${CAMP}/003-knife.svg`, tint: T.gold, prosperity: 24, needs: ['knife2'],
    items: { silver_bar: 6, hide: 12, feather: 15, bone: 15 }, huntBonus: 35, skill: ['hunt', 12], desc: 'Hunts return another 35% more loot.' },
  { id: 'torch', cat: 'gear', name: 'Trail Torch', img: `${CAMP}/005-flashlight.svg`, prosperity: 6,
    items: { beech_wood: 12, fiber: 10, tree_sap: 1 }, scavBonus: 20, desc: 'Scavenges return 20% more loot.' },
  { id: 'binoculars', cat: 'gear', name: 'Field Binoculars', img: `${CAMP}/009-binoculars.svg`, prosperity: 16, needs: ['torch', 'workbench'],
    items: { copper_bar: 4, silver_bar: 2, hide: 4 }, scavBonus: 30, desc: 'Scavenges return another 30% more loot.' },
  { id: 'lamp', cat: 'gear', name: "Explorer's Lamp", img: `${CAMP}/002-oil-lamp.svg`, prosperity: 26, needs: ['binoculars'],
    items: { gold_bar: 3, glimmer_dust: 1, olive_oil: 3 }, scavBonus: 40, expSpeed: 20, desc: '+40% scavenge loot, expeditions 20% faster.' },
  { id: 'camp2', cat: 'gear', name: 'Forward Camp', img: `${CAMP}/001-fire.svg`, prosperity: 30, needs: ['knife1', 'torch'],
    items: { ironroot_wood: 20, hide: 15, rope_x: 0, fiber: 40 }, desc: 'Run TWO expeditions at once.' },

  // Farm
  { id: 'plot1', cat: 'farm', name: 'Cleared Plots (+2)', img: `${FARM}/001-gardening.svg`, prosperity: 8, needs: ['workbench'],
    items: { beech_wood: 15, stone: 10, fiber: 12 }, plots: 2, desc: 'Two more crop plots.' },
  { id: 'plot2', cat: 'farm', name: 'Rich Soil Plots (+3)', img: `${FARM}/001-gardening.svg`, prosperity: 14, needs: ['plot1'],
    items: { cherry_wood: 20, stone: 20, fiber: 20 }, plots: 3, desc: 'Three plots of dark, rich soil.' },
  { id: 'plot3', cat: 'farm', name: 'Terraces (+4)', img: `${FARM}/001-gardening.svg`, prosperity: 22, needs: ['plot2'],
    items: { banyan_wood: 22, iron_bar: 5, stone: 35 }, plots: 4, desc: 'Hillside terraces — the full spread.' },
  { id: 'wateringcan', cat: 'farm', name: 'Watering Can', img: `${FARM}/005-watering-can.svg`, prosperity: 8, needs: ['plot1'],
    items: { copper_bar: 3, fiber: 8 }, effect: { cropFast: 10 }, desc: 'Crops grow 10% faster.' },
  { id: 'scythe', cat: 'farm', name: 'Harvest Scythe', img: `${FARM}/004-scythe.svg`, prosperity: 14, needs: ['plot1', 'workbench'],
    items: { iron_bar: 4, cherry_wood: 10 }, effect: { cropYield: 1 }, desc: 'Every harvest yields +1 extra crop.' },
  { id: 'sprinkler', cat: 'farm', name: 'Silver Sprinkler', img: `${FARM}/005-watering-can.svg`, tint: T.silver, prosperity: 20, needs: ['wateringcan', 'smelter'],
    items: { silver_bar: 4, copper_bar: 4 }, effect: { cropFast: 20 }, desc: 'Crops grow another 20% faster.' },
  { id: 'coop', cat: 'farm', name: 'Chicken Coop', img: `${FARM}/008-chicken.svg`, prosperity: 15, needs: ['plot1'],
    items: { beech_wood: 25, fiber: 20, wild_egg: 3 }, pen: 'coop', desc: 'Hens lay eggs over time.' },
  { id: 'goatpen', cat: 'farm', name: 'Goat Pen', img: `${FARM}/006-goat.svg`, prosperity: 18, needs: ['coop'],
    items: { cherry_wood: 25, stone: 15, fiber: 25 }, pen: 'goatpen', desc: 'Goats give milk over time.' },
  { id: 'cowbarn', cat: 'farm', name: 'Cow Barn', img: `${FARM}/007-cow.svg`, prosperity: 26, needs: ['goatpen'],
    items: { banyan_wood: 30, iron_bar: 6, hide: 8 }, pen: 'cowbarn', desc: 'Cows: milk, but ambitious.' },
  { id: 'cheesepress', cat: 'farm', name: 'Cheese Press', img: `${COOK}/027-cheese.svg`, prosperity: 16, needs: ['goatpen'],
    items: { cherry_wood: 15, iron_bar: 3, stone: 10 }, desc: 'Unlocks pressing milk + salt into cheese.' },

  // Helpers
  { id: 'beebox', cat: 'helper', name: 'Bee Box', img: `${BUGS}/032-beehive.svg`, prosperity: 15, needs: ['workbench'],
    items: { cherry_wood: 18, honey: 3, fiber: 12 }, pen: 'beebox', desc: 'Bees deliver honey while you learn.' },
  { id: 'fishtrap', cat: 'helper', name: 'Wicker Fish Trap', img: `${CAMP}/008-basket.svg`, tint: T.teal, prosperity: 12, needs: ['workbench'],
    items: { fiber: 35, beech_wood: 12 }, pen: 'fishtrap', desc: 'Traps minnows overnight.' },
];
export const CRAFT_MAP = Object.fromEntries(CRAFTS.map((c) => [c.id, c]));
// helper pens (extend PEN_MAP)
PEN_MAP.beebox = { id: 'beebox', name: 'Bee Box', img: `${BUGS}/032-beehive.svg`, produceId: 'honey', perHour: 1, capHours: 12 };
PEN_MAP.fishtrap = { id: 'fishtrap', name: 'Fish Trap', img: `${CAMP}/008-basket.svg`, produceId: 'minnow', perHour: 2, capHours: 10 };

// Cheese pressing (simple conversion at the Cheese Press)
export const CHEESE_RECIPE = { in: { milk: 3, salt: 1 }, out: 'cheese', outQty: 1 };

// ═══════════════════════════════════════════════════════════════════════════
// PROSPERITY + TITLES + PROFILE (same external API as v1)
// ═══════════════════════════════════════════════════════════════════════════
export const prosperityOf = (save) => {
  if (!save) return 0;
  let p = 25;
  (save.crafted || []).forEach((id) => { p += CRAFT_MAP[id]?.prosperity || 0; });
  p += (save.discoveredRares || []).length * 5;
  p += (save.critters || []).length * 2;
  p += (save.knownRecipes || []).length * 3;
  p += (save.caughtFish || []).length * 2;
  return p;
};

export const totalSkillLevel = (save) =>
  Object.keys(SKILLS).reduce((sum, k) => sum + skillLevel(save?.skills?.[k] || 0), 0);

export const HOMESTEAD_TITLES = [
  { id: 'wanderer', name: 'Wanderer', color: 'text-gray-500', darkColor: 'text-slate-400',
    reqText: 'Arrive in the Wildwood', check: () => true },
  { id: 'packrat', name: 'Pack Rat', color: 'text-lime-600', darkColor: 'text-lime-400',
    reqText: 'Craft 3 inventory upgrades', check: (s) => ['pouch', 'satchel', 'backpack', 'voidbag', 'ropebundle', 'crates', 'enchcrate'].filter((id) => (s.crafted || []).includes(id)).length >= 3 },
  { id: 'settler', name: 'Settler', color: 'text-green-600', darkColor: 'text-green-400',
    reqText: '120 Prosperity', check: (s) => prosperityOf(s) >= 120 },
  { id: 'bugcatcher', name: 'Bug Catcher', color: 'text-emerald-600', darkColor: 'text-emerald-400',
    reqText: 'Collect 10 critters', check: (s) => (s.critters || []).length >= 10 },
  { id: 'gourmand', name: 'Wildwood Gourmand', color: 'text-orange-600', darkColor: 'text-orange-400',
    reqText: 'Know 15 recipes', check: (s) => (s.knownRecipes || []).length >= 15 },
  { id: 'treasurer', name: 'Treasure Hunter', color: 'text-fuchsia-600', darkColor: 'text-fuchsia-400',
    reqText: 'Discover 6 curios', check: (s) => (s.discoveredRares || []).length >= 6 },
  { id: 'homesteader', name: 'Homesteader', color: 'text-blue-600', darkColor: 'text-blue-400',
    reqText: '300 Prosperity', check: (s) => prosperityOf(s) >= 300 },
  { id: 'angler', name: 'Legend Angler', color: 'text-cyan-600', darkColor: 'text-cyan-400',
    reqText: 'Catch a legendary fish', check: (s) => ['ghostfin', 'golden_koi', 'leviathan'].some((f) => (s.caughtFish || []).includes(f)) },
  { id: 'master', name: 'Master of the Wilds', color: 'text-purple-600', darkColor: 'text-purple-400',
    reqText: 'Total skill level 90', check: (s) => totalSkillLevel(s) >= 90 },
  { id: 'legend', name: 'Wildwood Legend', color: 'text-amber-600', darkColor: 'text-amber-400',
    reqText: '600 Prosperity', check: (s) => prosperityOf(s) >= 600 },
];
export const HOMESTEAD_TITLE_MAP = Object.fromEntries(HOMESTEAD_TITLES.map((t) => [t.id, t]));

export const getHomesteadProfile = (homesteadData, isDark = false) => {
  if (!homesteadData) return null;
  const title = homesteadData.activeTitle ? HOMESTEAD_TITLE_MAP[homesteadData.activeTitle] : null;
  const prosperity = prosperityOf(homesteadData);
  if (!title && prosperity <= 25) return null;
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
  inv: { beech_wood: 6, berries: 4, carrot_seed: 2 },
  chest: {},
  gold: 20,
  skills: { wood: 0, mine: 0, fish: 0, forage: 0, cook: 0, hunt: 0 },
  tools: { axe: 0, pick: 0, rod: 0 },
  crafted: [],
  farm: [],                 // [{ plot, seedId, readyAt }]
  smelting: [],             // [{ slot, barId, doneAt }]
  pensAt: {},               // { penId: lastCollect ts }
  expeditions: [],          // [{ id, type, tier, returnAt }]
  knownRecipes: ['berry_jam', 'campfire_fish', 'herb_tea', 'boiled_eggs'],
  unreadScrolls: 0,
  activeBuffs: [],          // [{ recipeId, type, value, until }]
  discoveredRares: [],      // curio ids (Curio Shelf)
  critters: [],             // critter ids (Critter Collection)
  caughtFish: [],
  cookedDishes: [],
  counters: { chops: 0, mines: 0, casts: 0, forages: 0, cooks: 0, crafts: 0, expeditions: 0 },
  menagerieEssenceEarned: 0,
  unlockedTitles: ['wanderer'],
  activeTitle: 'wanderer',
  lastSeen: null,
  lastSaved: null,
});
// EOF
