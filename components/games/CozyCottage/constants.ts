// CozyCottage/constants.ts
import { FurnitureItem, SeedDef, FishDef, Recipe } from './types';

// ── Grid constants ─────────────────────────────────────────────────────────────
export const HOUSE_COLS = 6;
export const HOUSE_ROWS = 5;
export const GARDEN_COLS = 4;
export const GARDEN_ROWS = 3;
export const DAY_LENGTH = 120; // real seconds per full day
export const TREE_REGROW_TIME = 60; // real seconds

// ── Furniture catalog ──────────────────────────────────────────────────────────
export const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: 'f1',  type: 'bed',       name: 'Cozy Bed',      description: 'A soft bed to make your cottage feel like home.',     price: 200, icon: '/games/cozy-cottage/House/bed.svg',          color: '#ffb7b2' },
  { id: 'f2',  type: 'table',     name: 'Wooden Table',  description: 'A sturdy dining table.',                              price: 100, icon: '/games/cozy-cottage/House/table.svg',        color: '#e2b49a' },
  { id: 'f3',  type: 'chair',     name: 'Soft Chair',    description: 'A cozy armchair for relaxing.',                       price: 50,  icon: '/games/cozy-cottage/House/sofa.svg',         color: '#b2e2f2' },
  { id: 'f4',  type: 'plant',     name: 'Potted Fern',   description: 'Brings a bit of nature indoors.',                     price: 30,  icon: '/games/cozy-cottage/House/pot-plant.svg',    color: '#b2f2bb' },
  { id: 'f5',  type: 'stove',     name: 'Little Stove',  description: 'Cook meals & discover new recipes!',                  price: 150, icon: '/games/cozy-cottage/House/stove.svg',        color: '#f2b2b2' },
  { id: 'f6',  type: 'rug',       name: 'Fluffy Mat',    description: 'A soft rug to warm up the floor.',                    price: 80,  icon: '/games/cozy-cottage/House/rug.svg',          color: '#f2e2b2' },
  { id: 'f7',  type: 'lamp',      name: 'Warm Lamp',     description: 'Casts a golden glow at night.',                       price: 40,  icon: '/games/cozy-cottage/House/bedside-lamp.svg', color: '#fff9c4' },
  { id: 'f8',  type: 'sofa',      name: 'Loveseat',      description: 'A plush two-seater sofa.',                            price: 180, icon: '/games/cozy-cottage/House/sofa2.svg',        color: '#ce93d8' },
  { id: 'f9',  type: 'cabinet',   name: 'Cabinet',       description: 'Keeps your things tidy.',                             price: 120, icon: '/games/cozy-cottage/House/cabinet.svg',      color: '#a0522d' },
  { id: 'f10', type: 'chest',     name: 'Wooden Chest',  description: 'Great for storing your treasures.',                   price: 130, icon: '/games/cozy-cottage/House/chest.svg',        color: '#8d6e4a' },
  { id: 'f11', type: 'bookshelf', name: 'Bookshelf',     description: 'A shelf lined with well-loved books.',                price: 80,  icon: '/games/cozy-cottage/House/bookshelf.svg',    color: '#bcaaa4' },
  { id: 'f12', type: 'cupboard',  name: 'Cupboard',      description: 'Stylish storage for your cottage.',                   price: 150, icon: '/games/cozy-cottage/House/cupboard.svg',     color: '#8d6e4a' },
  { id: 'f13', type: 'garden_patch', name: 'Garden Patch', description: 'Tilled soil ready for planting seeds.',            price: 60,  icon: '/games/cozy-cottage/Farm/plot.svg',          color: '#795548' },
  { id: 'f14', type: 'pet_bed',   name: 'Pet Bed',       description: 'A cozy spot for your furry friend.',                  price: 150, icon: '/games/cozy-cottage/Pets/pet-bed.svg',       color: '#ffccbc' },
];

// ── Seed catalog (20 crops) ────────────────────────────────────────────────────
export const SEEDS: SeedDef[] = [
  { id: 's1',  type: 'carrot',     name: 'Carrot Seeds',     price: 10,  growthTime: 25, produceEmoji: '🥕', seedEmoji: '🌱' },
  { id: 's2',  type: 'tomato',     name: 'Tomato Seeds',     price: 15,  growthTime: 35, produceEmoji: '🍅', seedEmoji: '🌱' },
  { id: 's3',  type: 'herb',       name: 'Herb Seeds',       price: 5,   growthTime: 15, produceEmoji: '🌿', seedEmoji: '🌱' },
  { id: 's4',  type: 'potato',     name: 'Potato Seeds',     price: 12,  growthTime: 30, produceEmoji: '🥔', seedEmoji: '🌱' },
  { id: 's5',  type: 'radish',     name: 'Radish Seeds',     price: 8,   growthTime: 20, produceEmoji: '🔴', seedEmoji: '🌱' },
  { id: 's6',  type: 'corn',       name: 'Corn Seeds',       price: 18,  growthTime: 50, produceEmoji: '🌽', seedEmoji: '🌱' },
  { id: 's7',  type: 'pumpkin',    name: 'Pumpkin Seeds',    price: 25,  growthTime: 80, produceEmoji: '🎃', seedEmoji: '🌱' },
  { id: 's8',  type: 'strawberry', name: 'Strawberry Seeds', price: 20,  growthTime: 45, produceEmoji: '🍓', seedEmoji: '🌱' },
  { id: 's9',  type: 'blueberry',  name: 'Blueberry Seeds',  price: 22,  growthTime: 50, produceEmoji: '🫐', seedEmoji: '🌱' },
  { id: 's10', type: 'pea',        name: 'Pea Seeds',        price: 8,   growthTime: 18, produceEmoji: '🫛', seedEmoji: '🌱' },
  { id: 's11', type: 'onion',      name: 'Onion Seeds',      price: 10,  growthTime: 35, produceEmoji: '🧅', seedEmoji: '🌱' },
  { id: 's12', type: 'garlic',     name: 'Garlic Seeds',     price: 14,  growthTime: 40, produceEmoji: '🧄', seedEmoji: '🌱' },
  { id: 's13', type: 'pepper',     name: 'Pepper Seeds',     price: 16,  growthTime: 40, produceEmoji: '🫑', seedEmoji: '🌱' },
  { id: 's14', type: 'wheat',      name: 'Wheat Seeds',      price: 10,  growthTime: 35, produceEmoji: '🌾', seedEmoji: '🌱' },
  { id: 's15', type: 'lettuce',    name: 'Lettuce Seeds',    price: 7,   growthTime: 15, produceEmoji: '🥬', seedEmoji: '🌱' },
  { id: 's16', type: 'eggplant',   name: 'Eggplant Seeds',   price: 18,  growthTime: 45, produceEmoji: '🍆', seedEmoji: '🌱' },
  { id: 's17', type: 'spinach',    name: 'Spinach Seeds',    price: 8,   growthTime: 20, produceEmoji: '🌿', seedEmoji: '🌱' },
  { id: 's18', type: 'beet',       name: 'Beet Seeds',       price: 10,  growthTime: 28, produceEmoji: '🟣', seedEmoji: '🌱' },
  { id: 's19', type: 'zucchini',   name: 'Zucchini Seeds',   price: 14,  growthTime: 38, produceEmoji: '🥒', seedEmoji: '🌱' },
  { id: 's20', type: 'cucumber',   name: 'Cucumber Seeds',   price: 12,  growthTime: 32, produceEmoji: '🥒', seedEmoji: '🌱' },
];

// ── Fish catalog (18 types) ────────────────────────────────────────────────────
export const FISH_CATALOG: FishDef[] = [
  { type: 'minnow',      name: 'Minnow',      rarity: 'common',    sellPrice: 10,   icon: '/games/cozy-cottage/Fishing/capelin.svg'          },
  { type: 'bass',        name: 'Bass',        rarity: 'common',    sellPrice: 25,   icon: '/games/cozy-cottage/Fishing/tilapia.svg'          },
  { type: 'trout',       name: 'Trout',       rarity: 'uncommon',  sellPrice: 50,   icon: '/games/cozy-cottage/Fishing/nasus-fish.svg'       },
  { type: 'salmon',      name: 'Salmon',      rarity: 'uncommon',  sellPrice: 75,   icon: '/games/cozy-cottage/Fishing/red-snapper-fish.svg' },
  { type: 'koi',         name: 'Koi',         rarity: 'rare',      sellPrice: 200,  icon: '/games/cozy-cottage/Fishing/tarpon.svg'           },
  { type: 'golden_carp', name: 'Golden Carp', rarity: 'legendary', sellPrice: 1000, icon: '/games/cozy-cottage/Fishing/blue-marlin.svg'      },
  { type: 'catfish',     name: 'Catfish',     rarity: 'common',    sellPrice: 20,   icon: '/games/cozy-cottage/Fishing/capelin.svg'          },
  { type: 'perch',       name: 'Perch',       rarity: 'common',    sellPrice: 18,   icon: '/games/cozy-cottage/Fishing/tilapia.svg'          },
  { type: 'pike',        name: 'Pike',        rarity: 'uncommon',  sellPrice: 60,   icon: '/games/cozy-cottage/Fishing/nasus-fish.svg'       },
  { type: 'eel',         name: 'Eel',         rarity: 'rare',      sellPrice: 150,  icon: '/games/cozy-cottage/Fishing/tarpon.svg'           },
  { type: 'crab',        name: 'Crab',        rarity: 'uncommon',  sellPrice: 80,   icon: '/games/cozy-cottage/Fishing/red-snapper-fish.svg' },
  { type: 'shrimp',      name: 'Shrimp',      rarity: 'common',    sellPrice: 15,   icon: '/games/cozy-cottage/Fishing/capelin.svg'          },
  { type: 'clam',        name: 'Clam',        rarity: 'common',    sellPrice: 22,   icon: '/games/cozy-cottage/Fishing/capelin.svg'          },
  { type: 'lobster',     name: 'Lobster',     rarity: 'rare',      sellPrice: 180,  icon: '/games/cozy-cottage/Fishing/tarpon.svg'           },
  { type: 'tuna',        name: 'Tuna',        rarity: 'uncommon',  sellPrice: 90,   icon: '/games/cozy-cottage/Fishing/nasus-fish.svg'       },
  { type: 'cod',         name: 'Cod',         rarity: 'common',    sellPrice: 20,   icon: '/games/cozy-cottage/Fishing/tilapia.svg'          },
  { type: 'anchovy',     name: 'Anchovy',     rarity: 'common',    sellPrice: 12,   icon: '/games/cozy-cottage/Fishing/capelin.svg'          },
  { type: 'mackerel',    name: 'Mackerel',    rarity: 'uncommon',  sellPrice: 55,   icon: '/games/cozy-cottage/Fishing/nasus-fish.svg'       },
];

// ── Ingredient sell prices ─────────────────────────────────────────────────────
export const INGREDIENT_SELL_PRICES: Record<string, number> = {
  // Garden crops
  carrot: 15, tomato: 20, herb: 10, potato: 18, radish: 12,
  corn: 25, pumpkin: 35, strawberry: 28, blueberry: 30, pea: 12,
  onion: 14, garlic: 18, pepper: 22, wheat: 14, lettuce: 10,
  eggplant: 20, spinach: 12, beet: 14, zucchini: 16, cucumber: 14,
  // Forest fruits
  apple: 20, orange: 22, olive: 18, cherry: 24, pear: 22,
  lemon: 20, fig: 28, plum: 24,
  // Foraging
  mushroom: 20, berry: 16, truffle: 80, pine_nut: 25, honey: 40,
  nettle: 12, wild_ginger: 30, acorn: 10, chestnut: 22, rose_hip: 18,
  dandelion: 8, clover: 8,
  // Hunting
  venison: 45, duck: 35, rabbit_meat: 30, wild_boar: 55, pheasant: 40,
  // Fish
  minnow: 10, bass: 25, trout: 50, salmon: 75, koi: 200, golden_carp: 1000,
  catfish: 20, perch: 18, pike: 60, eel: 150, crab: 80, shrimp: 15,
  clam: 22, lobster: 180, tuna: 90, cod: 20, anchovy: 12, mackerel: 55,
};

// ── Ingredient emoji map ───────────────────────────────────────────────────────
export const INGREDIENT_EMOJI: Record<string, string> = {
  carrot: '🥕', tomato: '🍅', herb: '🌿', potato: '🥔', radish: '🔴',
  corn: '🌽', pumpkin: '🎃', strawberry: '🍓', blueberry: '🫐', pea: '🫛',
  onion: '🧅', garlic: '🧄', pepper: '🫑', wheat: '🌾', lettuce: '🥬',
  eggplant: '🍆', spinach: '🥬', beet: '🟣', zucchini: '🥒', cucumber: '🥒',
  apple: '🍎', orange: '🍊', olive: '🫒', cherry: '🍒', pear: '🍐',
  lemon: '🍋', fig: '🟤', plum: '🟣',
  mushroom: '🍄', berry: '🫐', truffle: '⚫', pine_nut: '🌰', honey: '🍯',
  nettle: '🌿', wild_ginger: '🫚', acorn: '🌰', chestnut: '🌰', rose_hip: '🌹',
  dandelion: '🌼', clover: '🍀',
  venison: '🦌', duck: '🦆', rabbit_meat: '🐇', wild_boar: '🐗', pheasant: '🦚',
  minnow: '🐟', bass: '🐟', trout: '🐠', salmon: '🐟', koi: '🐡',
  golden_carp: '✨', catfish: '🐟', perch: '🐟', pike: '🐟', eel: '🐍',
  crab: '🦀', shrimp: '🦐', clam: '🐚', lobster: '🦞', tuna: '🐟',
  cod: '🐟', anchovy: '🐟', mackerel: '🐠',
};

// ── Recipes (65 total — all hidden until discovered at stove) ──────────────────
export const RECIPES: Recipe[] = [
  // Garden basics
  { id: 'r1',  name: 'Veggie Soup',          emoji: '🥣', ingredients: { carrot: 2, herb: 1 },                             sellPrice: 90,   description: 'A hearty carrot and herb broth.' },
  { id: 'r2',  name: 'Tomato Pasta',          emoji: '🍝', ingredients: { tomato: 2, herb: 1 },                             sellPrice: 110,  description: 'Rich tomato sauce on fresh pasta.' },
  { id: 'r3',  name: 'Garden Salad',          emoji: '🥗', ingredients: { lettuce: 1, tomato: 1, carrot: 1 },               sellPrice: 80,   description: 'Crisp garden vegetables tossed together.' },
  { id: 'r4',  name: 'Roasted Potatoes',      emoji: '🥔', ingredients: { potato: 2, herb: 1 },                             sellPrice: 95,   description: 'Golden potatoes roasted with fresh herbs.' },
  { id: 'r5',  name: 'Corn Chowder',          emoji: '🍲', ingredients: { corn: 2, herb: 1 },                               sellPrice: 130,  description: 'Creamy sweet corn soup.' },
  { id: 'r6',  name: 'Pumpkin Pie',           emoji: '🥧', ingredients: { pumpkin: 1, wheat: 2 },                           sellPrice: 200,  description: 'A classic autumn dessert.' },
  { id: 'r7',  name: 'Garlic Bread',          emoji: '🥖', ingredients: { wheat: 2, garlic: 1 },                            sellPrice: 120,  description: 'Crispy bread with roasted garlic butter.' },
  { id: 'r8',  name: 'Onion Soup',            emoji: '🧅', ingredients: { onion: 2, herb: 1 },                              sellPrice: 100,  description: 'Rich caramelised onion soup.' },
  { id: 'r9',  name: 'Stuffed Pepper',        emoji: '🫑', ingredients: { pepper: 1, tomato: 1, herb: 1 },                  sellPrice: 140,  description: 'Pepper stuffed with seasoned filling.' },
  { id: 'r10', name: 'Strawberry Jam',        emoji: '🫙', ingredients: { strawberry: 3 },                                   sellPrice: 130,  description: 'Sweet homemade strawberry jam.' },
  { id: 'r11', name: 'Blueberry Muffins',     emoji: '🧁', ingredients: { blueberry: 2, wheat: 1 },                         sellPrice: 150,  description: 'Fluffy muffins bursting with blueberries.' },
  { id: 'r12', name: 'Pea Soup',              emoji: '🫛', ingredients: { pea: 2, carrot: 1 },                              sellPrice: 90,   description: 'Smooth, warming pea and carrot soup.' },
  { id: 'r13', name: 'Radish Salad',          emoji: '🥗', ingredients: { radish: 2, lettuce: 1 },                          sellPrice: 85,   description: 'A crunchy radish and lettuce salad.' },
  { id: 'r14', name: 'Spring Stir-fry',       emoji: '🥘', ingredients: { pea: 1, carrot: 1, pepper: 1 },                   sellPrice: 120,  description: 'Colourful spring vegetables tossed in a wok.' },
  { id: 'r15', name: 'Herb Omelette',         emoji: '🍳', ingredients: { herb: 2, tomato: 1 },                             sellPrice: 100,  description: 'Light and fluffy herb omelette.' },
  { id: 'r16', name: 'Ratatouille',           emoji: '🫕', ingredients: { eggplant: 1, tomato: 1, zucchini: 1 },            sellPrice: 180,  description: 'Classic Provençal vegetable medley.' },
  { id: 'r17', name: 'Spinach Quiche',        emoji: '🥧', ingredients: { spinach: 2, wheat: 1 },                           sellPrice: 160,  description: 'Creamy spinach tart in a buttery crust.' },
  { id: 'r18', name: 'Borscht',               emoji: '🍲', ingredients: { beet: 2, onion: 1 },                              sellPrice: 140,  description: 'Deep ruby-red Eastern European beet soup.' },
  { id: 'r19', name: 'Cucumber Salad',        emoji: '🥗', ingredients: { cucumber: 2, herb: 1 },                           sellPrice: 90,   description: 'Cool and refreshing cucumber salad.' },
  { id: 'r20', name: 'Zucchini Fritters',     emoji: '🥙', ingredients: { zucchini: 2, herb: 1 },                           sellPrice: 130,  description: 'Crispy pan-fried zucchini cakes.' },
  // Fish dishes
  { id: 'r21', name: 'Grilled Bass',          emoji: '🐟', ingredients: { bass: 1, herb: 1 },                               sellPrice: 160,  description: 'Simply grilled bass with fresh herbs.' },
  { id: 'r22', name: 'Fish & Chips',          emoji: '🐠', ingredients: { bass: 1, potato: 1 },                             sellPrice: 170,  description: 'The classic British favourite.' },
  { id: 'r23', name: 'Salmon Salad',          emoji: '🥗', ingredients: { salmon: 1, tomato: 1, herb: 1 },                  sellPrice: 280,  description: 'Flaked salmon on a bed of garden greens.' },
  { id: 'r24', name: 'Sushi Platter',         emoji: '🍣', ingredients: { salmon: 2, radish: 1 },                           sellPrice: 310,  description: 'Elegantly arranged salmon sushi.' },
  { id: 'r25', name: 'Minnow Fritters',       emoji: '🍤', ingredients: { minnow: 3, herb: 1 },                             sellPrice: 120,  description: 'Crispy battered minnow bites.' },
  { id: 'r26', name: 'Crab Bisque',           emoji: '🦀', ingredients: { crab: 1, tomato: 1, herb: 1 },                    sellPrice: 260,  description: 'Velvety crab and tomato bisque.' },
  { id: 'r27', name: 'Shrimp Stir-fry',       emoji: '🦐', ingredients: { shrimp: 2, pepper: 1 },                           sellPrice: 160,  description: 'Juicy shrimp tossed with peppers.' },
  { id: 'r28', name: 'Trout Almondine',       emoji: '🐟', ingredients: { trout: 1, herb: 2 },                              sellPrice: 220,  description: 'Pan-seared trout with herb crust.' },
  { id: 'r29', name: 'Eel Sushi',             emoji: '🍣', ingredients: { eel: 1, radish: 1 },                              sellPrice: 340,  description: 'Silky grilled eel over seasoned rice.' },
  { id: 'r30', name: 'Pike Stew',             emoji: '🍲', ingredients: { pike: 1, potato: 1, onion: 1 },                   sellPrice: 260,  description: 'Rustic pike and potato stew.' },
  { id: 'r31', name: 'Catfish Curry',         emoji: '🍛', ingredients: { catfish: 1, tomato: 1, garlic: 1 },               sellPrice: 200,  description: 'Fragrant catfish in a spiced tomato curry.' },
  { id: 'r32', name: 'Perch Tacos',           emoji: '🌮', ingredients: { perch: 2, lettuce: 1 },                           sellPrice: 180,  description: 'Crispy perch in soft tortillas with slaw.' },
  { id: 'r33', name: 'Lobster Bisque',        emoji: '🦞', ingredients: { lobster: 1, herb: 2 },                            sellPrice: 480,  description: 'A luxurious, velvety lobster soup.' },
  { id: 'r34', name: 'Tuna Poke Bowl',        emoji: '🥗', ingredients: { tuna: 1, cucumber: 1, herb: 1 },                  sellPrice: 280,  description: 'Fresh tuna over a seasoned grain bowl.' },
  { id: 'r35', name: 'Clam Chowder',          emoji: '🍲', ingredients: { clam: 2, potato: 1 },                             sellPrice: 220,  description: 'Creamy New England clam chowder.' },
  { id: 'r36', name: 'Anchovy Puttanesca',    emoji: '🍝', ingredients: { anchovy: 3, tomato: 1, garlic: 1 },               sellPrice: 210,  description: 'Bold pasta with anchovies and olives.' },
  { id: 'r37', name: 'Mackerel Salad',        emoji: '🥗', ingredients: { mackerel: 1, lettuce: 1, lemon: 1 },             sellPrice: 200,  description: 'Smoked mackerel with a lemony salad.' },
  { id: 'r38', name: 'Cod Fish Cakes',        emoji: '🥞', ingredients: { cod: 2, potato: 1, herb: 1 },                     sellPrice: 230,  description: 'Golden pan-fried cod and potato cakes.' },
  // Fruit dishes
  { id: 'r39', name: 'Fruit Salad',           emoji: '🍱', ingredients: { apple: 1, orange: 1, strawberry: 1 },             sellPrice: 160,  description: 'A colourful medley of fresh fruits.' },
  { id: 'r40', name: 'Apple Crumble',         emoji: '🍮', ingredients: { apple: 3, wheat: 1 },                             sellPrice: 220,  description: 'Warm baked apple under a buttery crumble.' },
  { id: 'r41', name: 'Orange Glazed Fish',    emoji: '🐠', ingredients: { orange: 1, bass: 1 },                             sellPrice: 240,  description: 'Caramelised orange glaze on grilled bass.' },
  { id: 'r42', name: 'Cherry Tart',           emoji: '🥧', ingredients: { cherry: 2, wheat: 1 },                            sellPrice: 230,  description: 'Buttery pastry filled with tart cherries.' },
  { id: 'r43', name: 'Pear Jam',              emoji: '🫙', ingredients: { pear: 3 },                                         sellPrice: 190,  description: 'Delicate spiced pear jam.' },
  { id: 'r44', name: 'Berry Jam',             emoji: '🫙', ingredients: { berry: 3 },                                        sellPrice: 140,  description: 'Tangy wild berry jam.' },
  { id: 'r45', name: 'Olive Bread',           emoji: '🫒', ingredients: { olive: 2, wheat: 2 },                             sellPrice: 200,  description: 'Rustic loaf studded with Kalamata olives.' },
  { id: 'r46', name: 'Lemon Drizzle Cake',    emoji: '🍋', ingredients: { lemon: 2, wheat: 2 },                             sellPrice: 240,  description: 'Zingy lemon sponge with a drizzle glaze.' },
  { id: 'r47', name: 'Fig Compote',           emoji: '🟤', ingredients: { fig: 3 },                                          sellPrice: 200,  description: 'Sweet jammy fig compote.' },
  { id: 'r48', name: 'Plum Crumble',          emoji: '🟣', ingredients: { plum: 3, wheat: 1 },                              sellPrice: 210,  description: 'Juicy plums under a golden crumble topping.' },
  // Forest / foraging
  { id: 'r49', name: 'Mushroom Soup',         emoji: '🍄', ingredients: { mushroom: 2, herb: 1 },                           sellPrice: 150,  description: 'Earthy wild mushroom broth.' },
  { id: 'r50', name: 'Wild Forage Salad',     emoji: '🥗', ingredients: { mushroom: 1, berry: 1, herb: 1 },                 sellPrice: 180,  description: 'A woodland salad of foraged ingredients.' },
  { id: 'r51', name: 'Truffle Pasta',         emoji: '🍝', ingredients: { truffle: 1, herb: 2 },                            sellPrice: 450,  description: 'Silky pasta tossed with shaved black truffle.' },
  { id: 'r52', name: 'Pine Nut Pesto',        emoji: '🌿', ingredients: { pine_nut: 2, herb: 2 },                           sellPrice: 200,  description: 'Classic basil and pine nut pesto.' },
  { id: 'r53', name: 'Honey Toast',           emoji: '🍯', ingredients: { honey: 1, wheat: 2 },                             sellPrice: 170,  description: 'Warm toast drizzled with golden honey.' },
  { id: 'r54', name: 'Stuffed Mushrooms',     emoji: '🍄', ingredients: { mushroom: 3, tomato: 1 },                         sellPrice: 260,  description: 'Cap mushrooms filled with herbed tomato.' },
  { id: 'r55', name: 'Garlic Mushroom Toast', emoji: '🥪', ingredients: { mushroom: 2, garlic: 1, wheat: 1 },              sellPrice: 240,  description: 'Wild mushrooms and roasted garlic on toast.' },
  { id: 'r56', name: 'Nettle Soup',           emoji: '🥣', ingredients: { nettle: 2, herb: 1 },                             sellPrice: 120,  description: 'Surprisingly tasty foraged nettle soup.' },
  { id: 'r57', name: 'Ginger Tea',            emoji: '🍵', ingredients: { wild_ginger: 2, honey: 1 },                       sellPrice: 150,  description: 'Warming spiced ginger tea with honey.' },
  { id: 'r58', name: 'Chestnut Soup',         emoji: '🌰', ingredients: { chestnut: 2, herb: 1 },                           sellPrice: 140,  description: 'Rich roasted chestnut and herb soup.' },
  { id: 'r59', name: 'Rose Hip Syrup',        emoji: '🌹', ingredients: { rose_hip: 3 },                                     sellPrice: 160,  description: 'Tangy vitamin-rich rose hip syrup.' },
  { id: 'r60', name: 'Acorn Coffee',          emoji: '☕', ingredients: { acorn: 3, honey: 1 },                             sellPrice: 120,  description: 'A nutty, caffeine-free acorn brew.' },
  // Hunting
  { id: 'r61', name: 'Venison Stew',          emoji: '🍲', ingredients: { venison: 1, potato: 1, carrot: 1 },               sellPrice: 360,  description: 'Slow-cooked venison in a root vegetable broth.' },
  { id: 'r62', name: 'Venison Burger',         emoji: '🍔', ingredients: { venison: 1, lettuce: 1, tomato: 1 },             sellPrice: 340,  description: 'Juicy venison patty in a brioche bun.' },
  { id: 'r63', name: 'Duck Roast',            emoji: '🦆', ingredients: { duck: 1, herb: 2, carrot: 1 },                    sellPrice: 380,  description: 'Crispy-skinned duck with roasted vegetables.' },
  { id: 'r64', name: 'Rabbit Pie',            emoji: '🥧', ingredients: { rabbit_meat: 1, carrot: 2, potato: 1 },           sellPrice: 400,  description: 'Golden-topped rabbit and root vegetable pie.' },
  { id: 'r65', name: 'Wild Boar Ragu',        emoji: '🍝', ingredients: { wild_boar: 1, tomato: 2, herb: 1 },               sellPrice: 420,  description: 'Slow-simmered wild boar meat sauce.' },
  { id: 'r66', name: 'Pheasant Casserole',    emoji: '🍲', ingredients: { pheasant: 1, mushroom: 1, herb: 1 },              sellPrice: 390,  description: 'Tender pheasant braised with forest mushrooms.' },
  // Grand / special
  { id: 'r67', name: 'Royal Feast',           emoji: '👑', ingredients: { koi: 1, tomato: 2, herb: 2 },                    sellPrice: 900,  description: 'A regal dish fit for a feast.' },
  { id: 'r68', name: 'Golden Harvest Bowl',   emoji: '✨', ingredients: { golden_carp: 1, corn: 1, carrot: 1 },             sellPrice: 1800, description: 'The ultimate cozy cottage masterpiece.' },
  { id: 'r69', name: 'Forest Harvest Bowl',   emoji: '🌲', ingredients: { apple: 1, mushroom: 1, honey: 1, herb: 1 },      sellPrice: 520,  description: 'Nature\'s bounty in a single bowl.' },
  { id: 'r70', name: 'Lobster Thermidor',     emoji: '🦞', ingredients: { lobster: 1, herb: 2, lemon: 1 },                  sellPrice: 600,  description: 'Classic French luxury dish.' },
];

// ── Color presets for furniture ────────────────────────────────────────────────
export const COLOR_PRESETS: { name: string; swatch: string; filter?: string }[] = [
  { name: 'Default',  swatch: '#c8a882' },
  { name: 'Rosewood', swatch: '#b54a5e', filter: 'hue-rotate(320deg) saturate(1.3) brightness(0.95)' },
  { name: 'Ocean',    swatch: '#3d8fbf', filter: 'hue-rotate(195deg) saturate(1.4)' },
  { name: 'Forest',   swatch: '#4a8a52', filter: 'hue-rotate(90deg) saturate(1.4) brightness(0.9)' },
  { name: 'Sunset',   swatch: '#c87832', filter: 'hue-rotate(25deg) saturate(1.5)' },
  { name: 'Lavender', swatch: '#9472cc', filter: 'hue-rotate(255deg) saturate(1.1) brightness(1.05)' },
  { name: 'Mint',     swatch: '#44b89a', filter: 'hue-rotate(148deg) saturate(1.3)' },
  { name: 'Gold',     swatch: '#c9a227', filter: 'hue-rotate(45deg) saturate(1.6)' },
];

// ── Pet catalog ────────────────────────────────────────────────────────────────
export const PET_CATALOG = [
  { id: 'p1', type: 'cat',       name: 'Calico Cat',    price: 800,  icon: '/games/cozy-cottage/Pets/cat.svg',       emoji: '🐱' },
  { id: 'p2', type: 'corgi',     name: 'Golden Corgi',  price: 1200, icon: '/games/cozy-cottage/Pets/corgi.svg',     emoji: '🐕' },
  { id: 'p3', type: 'pug',       name: 'Lop Rabbit',    price: 600,  icon: '/games/cozy-cottage/Pets/pug.svg',       emoji: '🐇' },
  { id: 'p4', type: 'kintamani', name: 'Kintamani Dog', price: 1000, icon: '/games/cozy-cottage/Pets/kintamani.svg', emoji: '🐕' },
];

// ── Fish rarity weights ────────────────────────────────────────────────────────
export const FISH_RARITY_CHANCES = {
  common: 0.55,
  uncommon: 0.30,
  rare: 0.12,
  legendary: 0.03,
};

// ── Forage loot table ──────────────────────────────────────────────────────────
export const FORAGE_LOOT: Array<{ type: string; weight: number; emoji: string }> = [
  { type: 'mushroom',    weight: 30, emoji: '🍄' },
  { type: 'berry',       weight: 25, emoji: '🫐' },
  { type: 'honey',       weight: 12, emoji: '🍯' },
  { type: 'pine_nut',    weight: 15, emoji: '🌰' },
  { type: 'nettle',      weight: 20, emoji: '🌿' },
  { type: 'wild_ginger', weight: 10, emoji: '🫚' },
  { type: 'acorn',       weight: 22, emoji: '🌰' },
  { type: 'chestnut',    weight: 18, emoji: '🌰' },
  { type: 'rose_hip',    weight: 14, emoji: '🌹' },
  { type: 'dandelion',   weight: 25, emoji: '🌼' },
  { type: 'clover',      weight: 20, emoji: '🍀' },
  { type: 'truffle',     weight: 3,  emoji: '⚫' },
];

// ── Deer hunt loot ─────────────────────────────────────────────────────────────
export const HUNT_LOOT: Array<{ type: string; weight: number; emoji: string }> = [
  { type: 'venison',     weight: 40, emoji: '🦌' },
  { type: 'duck',        weight: 25, emoji: '🦆' },
  { type: 'rabbit_meat', weight: 30, emoji: '🐇' },
  { type: 'wild_boar',   weight: 15, emoji: '🐗' },
  { type: 'pheasant',    weight: 20, emoji: '🦚' },
];
