// components/games/Menagerie/menagerieConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// CHAMPION'S MENAGERIE 🐣 — config, creature roster and profile helpers.
//
// The menagerie is powered by REAL classroom XP: every XP a student earns in
// class charges their incubator with Wild Essence, which buys eggs. Creatures
// are raised over days/weeks with real-time care (feed / play / train),
// evolve through five life stages, and can be equipped as a card companion
// that appears on the Classroom Champions student card and dashboard.
//
// Save data lives in studentData.menagerieData (see defaultSave at bottom).
// ─────────────────────────────────────────────────────────────────────────────

export const fmtInt = (n) => Math.floor(Number(n) || 0).toLocaleString();

// ═══════════════════════════════════════════════════════════════════════════
// RARITIES
// ═══════════════════════════════════════════════════════════════════════════
export const RARITIES = {
  common:    { name: 'Common',    color: 'text-gray-500',    darkColor: 'text-slate-400',  ring: 'ring-gray-300',    chip: 'bg-gray-100 text-gray-600',       score: 10 },
  uncommon:  { name: 'Uncommon',  color: 'text-green-600',   darkColor: 'text-green-400',  ring: 'ring-green-400',   chip: 'bg-green-100 text-green-700',     score: 25 },
  rare:      { name: 'Rare',      color: 'text-blue-600',    darkColor: 'text-blue-400',   ring: 'ring-blue-400',    chip: 'bg-blue-100 text-blue-700',       score: 60 },
  epic:      { name: 'Epic',      color: 'text-purple-600',  darkColor: 'text-purple-400', ring: 'ring-purple-400',  chip: 'bg-purple-100 text-purple-700',   score: 150 },
  legendary: { name: 'Legendary', color: 'text-amber-600',   darkColor: 'text-amber-400',  ring: 'ring-amber-400',   chip: 'bg-amber-100 text-amber-700',     score: 400 },
};

// ═══════════════════════════════════════════════════════════════════════════
// CREATURE ROSTER — 40 species (art from the existing /public/shop pet packs)
// ═══════════════════════════════════════════════════════════════════════════
const SB = '/shop/BasicPets';
const SU2 = '/shop/BasicPets/Update2';
const SU1 = '/shop/BasicPets/Update1';
const SU3 = '/shop/BasicPets/Update 3';
const SP = '/shop/PremiumPets';
const EC = '/shop/Egg/Babies/Common';
const ER = '/shop/Egg/Babies/Rare';

export const SPECIES = [
  // ── Common ────────────────────────────────────────────────────────────────
  { id: 'sandwhisker', name: 'Sandwhisker',    rarity: 'common', family: 'Meadow',  img: `${EC}/Cat Pet.png`,       desc: 'A dozy desert cat that purrs in its sleep.' },
  { id: 'mooth',       name: 'Mooth',          rarity: 'common', family: 'Meadow',  img: `${EC}/Bull Pet.png`,      desc: 'A gentle calf with big dreams and bigger horns (one day).' },
  { id: 'pebblesaur',  name: 'Pebblesaur',     rarity: 'common', family: 'Wilds',   img: `${EC}/DinoPet.png`,       desc: 'A tiny dino that collects shiny pebbles.' },
  { id: 'zibble',      name: 'Zibble',         rarity: 'common', family: 'Cosmic',  img: `${EC}/Alien Pet.png`,     desc: 'Crash-landed. Not in a hurry to leave.' },
  { id: 'mischief',    name: 'Mischief',       rarity: 'common', family: 'Wilds',   img: `${SU3}/Monkey.png`,       desc: 'If something went missing, Mischief knows where it is.' },
  { id: 'peep',        name: 'Peep',           rarity: 'common', family: 'Meadow',  img: `${SU2}/Choco.png`,        desc: 'Peep peep. That is all. Peep.' },
  { id: 'patch',       name: 'Patch',          rarity: 'common', family: 'Meadow',  img: `${SU2}/Snoopy.png`,       desc: 'A loyal pup who naps on top of his kennel. Odd.' },
  { id: 'coralfin',    name: 'Coralfin',       rarity: 'common', family: 'Tide',    img: `${SU2}/Nemo.png`,         desc: 'A brave little reef fish, very easy to lose.' },
  { id: 'burrow',      name: 'Burrow',         rarity: 'common', family: 'Wilds',   img: `${SB}/RabbitPet.png`,     desc: 'Grumpy-looking. Actually the softest creature alive.' },

  // ── Uncommon ──────────────────────────────────────────────────────────────
  { id: 'emberfox',    name: 'Emberfox',       rarity: 'uncommon', family: 'Wilds',  img: `${SU2}/Tails.png`,        desc: 'Two tails, twice the zoomies.' },
  { id: 'rusty',       name: 'Rusty',          rarity: 'uncommon', family: 'Wilds',  img: `${SU1}/RedpandaPet.png`,  desc: 'A red panda in a scarf he refuses to take off.' },
  { id: 'trufflesnout', name: 'Trufflesnout',  rarity: 'uncommon', family: 'Meadow', img: `${SB}/FarmPet1.png`,      desc: 'Can smell buried treasure. Digs up turnips instead.' },
  { id: 'shepherd',    name: 'Old Shepherd',   rarity: 'uncommon', family: 'Meadow', img: `${SB}/FarmPet2.png`,      desc: 'Keeps the whole menagerie in line.' },
  { id: 'harvestmouse', name: 'Harvest Mouse', rarity: 'uncommon', family: 'Meadow', img: `${SB}/FarmPet3.png`,      desc: 'Carries a pitchfork three times her size.' },
  { id: 'squawks',     name: 'Squawks',        rarity: 'uncommon', family: 'Tide',   img: `${SB}/PiratePet1.png`,    desc: 'Repeats your secrets to everyone. EVERYONE.' },
  { id: 'firstmate',   name: 'First Mate',     rarity: 'uncommon', family: 'Tide',   img: `${SB}/PiratePet2.png`,    desc: 'Handles the gold. Definitely trustworthy. Probably.' },

  // ── Rare ──────────────────────────────────────────────────────────────────
  { id: 'snaggle',     name: 'Snaggle',        rarity: 'rare', family: 'Wilds',   img: `${SB}/GoblinPet.png`,     desc: 'A baby goblin. Bites. Affectionately, mostly.' },
  { id: 'snapjaw',     name: 'Snapjaw',        rarity: 'rare', family: 'Tide',    img: `${SB}/PiratePet3.png`,    desc: 'A crocodile with a pirate past and a gold tooth.' },
  { id: 'skinksquire', name: 'Skink Squire',   rarity: 'rare', family: 'Wilds',   img: `${SU1}/LizardPet.png`,    desc: 'A lizard knight in training. Very serious about it.' },
  { id: 'inkwell',     name: 'Inkwell',        rarity: 'rare', family: 'Tide',    img: `${SU1}/OctopusPet.png`,   desc: 'A dapper octopus. The hat is non-negotiable.' },
  { id: 'gearhound',   name: 'Gearhound',      rarity: 'rare', family: 'Clockwork', img: `${SB}/RobotPet1.png`,   desc: 'A mechanical hound that fetches spanners.' },
  { id: 'botling',     name: 'Botling',        rarity: 'rare', family: 'Clockwork', img: `${SB}/RobotPet2.png`,   desc: 'Beeps when happy. Beeps when sad. Beeps.' },
  { id: 'scrapbot',    name: 'Scrapbot',       rarity: 'rare', family: 'Clockwork', img: `${SU3}/Claptrap.png`,   desc: 'Built from spare parts and unearned confidence.' },
  { id: 'kickle',      name: 'Kickle',         rarity: 'rare', family: 'Cosmic',  img: `${SB}/SoccerPet.png`,     desc: 'A living ball. Do NOT kick. It kicks back.' },
  { id: 'wafflebeast', name: 'Wafflebeast',    rarity: 'rare', family: 'Cosmic',  img: `${SU3}/Waffle.png`,       desc: 'Smells like breakfast. Fights like lunch.' },
  { id: 'peelian',     name: 'Peelian',        rarity: 'rare', family: 'Cosmic',  img: `${ER}/BananaPet.png`,     desc: 'A radiant banana spirit. Slippery when startled.' },

  // ── Epic ──────────────────────────────────────────────────────────────────
  { id: 'zephyrwisp',  name: 'Zephyr Wisp',    rarity: 'epic', family: 'Elemental', img: `${SU2}/Air.png`,        desc: 'A curl of living wind that giggles in storms.' },
  { id: 'tidesoul',    name: 'Tidesoul',       rarity: 'epic', family: 'Elemental', img: `${SU2}/Water.png`,      desc: 'The ocean, pocket-sized and cheeky.' },
  { id: 'cinderling',  name: 'Cinderling',     rarity: 'epic', family: 'Elemental', img: `${SU2}/Fire.png`,       desc: 'A happy little blaze. Keep away from homework.' },
  { id: 'terrasprout', name: 'Terrasprout',    rarity: 'epic', family: 'Elemental', img: `${SU2}/Earth.png`,      desc: 'An ancient forest spirit, freshly sprouted.' },
  { id: 'prismane',    name: 'Prismane',       rarity: 'epic', family: 'Mythic',   img: `${SB}/UnicornPet.png`,   desc: 'A unicorn foal whose mane holds a whole rainbow.' },
  { id: 'fernwing',    name: 'Fernwing',       rarity: 'epic', family: 'Mythic',   img: `${SB}/DragonPet.png`,    desc: 'A forest dragon hatchling. Sneezes leaves.' },
  { id: 'solserpent',  name: 'Solserpent',     rarity: 'epic', family: 'Mythic',   img: `${SP}/SnakePet.png`,     desc: 'A serpent of living flame, coiled like a sunrise.' },
  { id: 'duskwing',    name: 'Duskwing',       rarity: 'epic', family: 'Mythic',   img: `${SP}/VampirePet.png`,   desc: 'A velvet-winged bat that only drinks juice boxes.' },

  // ── Legendary ─────────────────────────────────────────────────────────────
  { id: 'everflame',   name: 'Everflame',      rarity: 'legendary', family: 'Mythic', img: `${EC}/PhoenixPet.png`,          desc: 'A phoenix chick. Has never stayed extinguished.' },
  { id: 'astrallion',  name: 'Astral Lion',    rarity: 'legendary', family: 'Cosmic', img: `${SP}/LionPet.png`,             desc: 'A lion woven from the night sky itself.' },
  { id: 'gildeddragon', name: 'Gilded Dragon', rarity: 'legendary', family: 'Golden', img: `${ER}/Golden Dragon Pet.png`,   desc: 'Its scales are solid gold. It knows. It gloats.' },
  { id: 'midascat',    name: 'Midas Cat',      rarity: 'legendary', family: 'Golden', img: `${ER}/Golden Cat Pet.png`,      desc: 'Everything it naps on turns to treasure.' },
  { id: 'goldauroch',  name: 'Golden Auroch',  rarity: 'legendary', family: 'Golden', img: `${ER}/Golden Bull Pet.png`,     desc: 'A bull of pure gold. Surprisingly light on his hooves.' },
  { id: 'starsovereign', name: 'Star Sovereign', rarity: 'legendary', family: 'Golden', img: `${ER}/Golden Alien Pet.png`,  desc: 'Royalty from a golden galaxy far, far away.' },
];

export const SPECIES_MAP = Object.fromEntries(SPECIES.map((s) => [s.id, s]));

// ═══════════════════════════════════════════════════════════════════════════
// FUSION — 3 Adult+ creatures of the same species merge into one random
// creature of the NEXT rarity tier (hatchling, level 1).
// ═══════════════════════════════════════════════════════════════════════════
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
export const nextRarity = (r) => {
  const i = RARITY_ORDER.indexOf(r);
  return i >= 0 && i < RARITY_ORDER.length - 1 ? RARITY_ORDER[i + 1] : null;
};
export const FUSION_MIN_LEVEL = 12;        // Adult stage
export const FUSION_SHINY_BONUS = 0.15;    // extra shiny chance per shiny consumed
export const FUSION_ESSENCE_REWARD = 25;

// ═══════════════════════════════════════════════════════════════════════════
// GOURMET MEALS — feed dishes cooked in Wildwood Homestead for creature XP
// ═══════════════════════════════════════════════════════════════════════════
export const MEALS_PER_CREATURE_PER_DAY = 3;
export const MEAL_XP_MULT = 2.5;           // creature XP = recipe cooking XP × this

// ═══════════════════════════════════════════════════════════════════════════
// EGGS — bought with Wild Essence, hatch in real time (continues offline)
// ═══════════════════════════════════════════════════════════════════════════
export const INCUBATOR_SLOTS = 2;
export const SHINY_CHANCE = 0.05; // 1 in 20

export const EGG_TIERS = [
  { id: 'meadow', name: 'Meadow Egg',  icon: '🥚', cost: 60,   minutes: 20,
    grad: 'from-lime-400 to-green-500',
    weights: { common: 70, uncommon: 25, rare: 5 } },
  { id: 'forest', name: 'Forest Egg',  icon: '🍃', cost: 300,  minutes: 120,
    grad: 'from-emerald-500 to-teal-600',
    weights: { common: 25, uncommon: 40, rare: 27, epic: 8 } },
  { id: 'mystic', name: 'Mystic Egg',  icon: '🔮', cost: 1200, minutes: 360,
    grad: 'from-violet-500 to-purple-700',
    weights: { uncommon: 20, rare: 45, epic: 30, legendary: 5 } },
  { id: 'royal',  name: 'Royal Egg',   icon: '👑', cost: 5000, minutes: 1200,
    grad: 'from-amber-400 to-yellow-600',
    weights: { rare: 30, epic: 45, legendary: 25 } },
];
export const EGG_TIER_MAP = Object.fromEntries(EGG_TIERS.map((e) => [e.id, e]));

export const EGG_IMAGES = {
  whole:   '/shop/Egg/Egg.png',
  cracked: '/shop/Egg/Egg Cracked.png',
  open:    '/shop/Egg/Egg Open.png',
};

// Roll a species from an egg tier's rarity weights.
export const rollSpecies = (tierId, rand = Math.random) => {
  const tier = EGG_TIER_MAP[tierId] || EGG_TIERS[0];
  const entries = Object.entries(tier.weights);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let roll = rand() * total;
  let rarity = entries[0][0];
  for (const [r, w] of entries) { roll -= w; if (roll <= 0) { rarity = r; break; } }
  const pool = SPECIES.filter((s) => s.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)];
};

// ═══════════════════════════════════════════════════════════════════════════
// LIFE STAGES + LEVELING
// ═══════════════════════════════════════════════════════════════════════════
export const STAGES = [
  { name: 'Hatchling', minLevel: 1,  scoreMult: 1,   size: 'w-16 h-16',  aura: '',                                              badge: 'bg-gray-200 text-gray-600' },
  { name: 'Juvenile',  minLevel: 5,  scoreMult: 1.5, size: 'w-20 h-20',  aura: '',                                              badge: 'bg-green-100 text-green-700' },
  { name: 'Adult',     minLevel: 12, scoreMult: 2,   size: 'w-24 h-24',  aura: 'drop-shadow(0 0 6px rgba(96,165,250,0.7))',     badge: 'bg-blue-100 text-blue-700' },
  { name: 'Elder',     minLevel: 20, scoreMult: 3,   size: 'w-24 h-24',  aura: 'drop-shadow(0 0 10px rgba(192,132,252,0.8))',   badge: 'bg-purple-100 text-purple-700' },
  { name: 'Mythic',    minLevel: 30, scoreMult: 5,   size: 'w-28 h-28',  aura: 'drop-shadow(0 0 14px rgba(251,191,36,0.9))',    badge: 'bg-amber-100 text-amber-700' },
];

export const MAX_LEVEL = 30;

// XP needed to go from `level` to `level + 1`.
export const xpToNext = (level) => 20 + level * 12;

// Total XP → level (levels start at 1).
export const levelForXp = (xp) => {
  let lvl = 1;
  let rem = Number(xp) || 0;
  while (lvl < MAX_LEVEL && rem >= xpToNext(lvl)) { rem -= xpToNext(lvl); lvl += 1; }
  return lvl;
};

export const xpProgress = (xp) => {
  let lvl = 1;
  let rem = Number(xp) || 0;
  while (lvl < MAX_LEVEL && rem >= xpToNext(lvl)) { rem -= xpToNext(lvl); lvl += 1; }
  return { level: lvl, into: rem, needed: lvl >= MAX_LEVEL ? 0 : xpToNext(lvl) };
};

export const stageForLevel = (level) => {
  let stage = STAGES[0];
  let index = 0;
  STAGES.forEach((s, i) => { if (level >= s.minLevel) { stage = s; index = i; } });
  return { ...stage, index };
};

// ═══════════════════════════════════════════════════════════════════════════
// CARE + ECONOMY
// ═══════════════════════════════════════════════════════════════════════════
export const FOOD_CAP = 30;
export const FOOD_REGEN_MINUTES = 4;      // 1 food every 4 real minutes (offline too)
export const FEED_XP = 8;                 // 1 food → +8 creature XP
export const PLAY_XP = 15;                // free, per-creature cooldown
export const PLAY_COOLDOWN_H = 4;
export const PLAY_ESSENCE = 5;
export const TRAIN_XP = 30;
export const TRAIN_COOLDOWN_H = 10;
export const TRAIN_ESSENCE = 10;

export const ESSENCE_PER_CLASS_XP = 3;    // every classroom XP earned → 3 Wild Essence
export const DAILY_GIFT_ESSENCE = 25;     // first visit each day
export const DAILY_GIFT_FOOD = 10;

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION SCORE + TITLES
// ═══════════════════════════════════════════════════════════════════════════
export const creatureScore = (c) => {
  const sp = SPECIES_MAP[c.speciesId];
  if (!sp) return 0;
  const base = RARITIES[sp.rarity]?.score || 10;
  const stage = stageForLevel(levelForXp(c.xp));
  return Math.round(base * stage.scoreMult * (c.shiny ? 3 : 1));
};

export const collectionScore = (save) =>
  (save?.creatures || []).reduce((sum, c) => sum + creatureScore(c), 0);

export const speciesDiscovered = (save) =>
  new Set((save?.creatures || []).map((c) => c.speciesId)).size;

export const MENAGERIE_TITLES = [
  { id: 'eggsitter',   name: 'Egg Sitter',       color: 'text-green-600',  darkColor: 'text-green-400',
    reqText: 'Hatch your first egg',        check: (s) => (s.eggsHatched || 0) >= 1 },
  { id: 'keeper',      name: 'Creature Keeper',  color: 'text-teal-600',   darkColor: 'text-teal-400',
    reqText: 'Discover 5 species',          check: (s) => speciesDiscovered(s) >= 5 },
  { id: 'whisperer',   name: 'Beast Whisperer',  color: 'text-blue-600',   darkColor: 'text-blue-400',
    reqText: '100 care actions',            check: (s) => (s.careActions || 0) >= 100 },
  { id: 'shinyhunter', name: 'Shiny Hunter',     color: 'text-fuchsia-600', darkColor: 'text-fuchsia-400',
    reqText: 'Hatch a shiny creature',      check: (s) => (s.creatures || []).some((c) => c.shiny) },
  { id: 'scholar',     name: 'Zoodex Scholar',   color: 'text-indigo-600', darkColor: 'text-indigo-400',
    reqText: 'Discover 15 species',         check: (s) => speciesDiscovered(s) >= 15 },
  { id: 'mythictrainer', name: 'Mythic Trainer', color: 'text-purple-600', darkColor: 'text-purple-400',
    reqText: 'Raise a creature to Mythic',  check: (s) => (s.creatures || []).some((c) => levelForXp(c.xp) >= 30) },
  { id: 'legendkeeper', name: 'Legend Keeper',   color: 'text-amber-600',  darkColor: 'text-amber-400',
    reqText: 'Own 3 legendary creatures',   check: (s) => (s.creatures || []).filter((c) => SPECIES_MAP[c.speciesId]?.rarity === 'legendary').length >= 3 },
  { id: 'master',      name: 'Menagerie Master', color: 'text-rose-600',   darkColor: 'text-rose-400',
    reqText: 'Discover 30 species',         check: (s) => speciesDiscovered(s) >= 30 },
];
export const MENAGERIE_TITLE_MAP = Object.fromEntries(MENAGERIE_TITLES.map((t) => [t.id, t]));

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE HOOK — used by StudentsTab (class cards) and StudentDashboard.
// Returns null when the student hasn't got anything to show.
// ═══════════════════════════════════════════════════════════════════════════
export const getMenagerieProfile = (menagerieData, isDark = false) => {
  if (!menagerieData) return null;
  const companion = (menagerieData.creatures || []).find((c) => c.uid === menagerieData.companionUid) || null;
  const title = menagerieData.activeTitle ? MENAGERIE_TITLE_MAP[menagerieData.activeTitle] : null;
  if (!companion && !title) return null;

  let companionInfo = null;
  if (companion) {
    const sp = SPECIES_MAP[companion.speciesId];
    if (sp) {
      const level = levelForXp(companion.xp);
      const stage = stageForLevel(level);
      companionInfo = {
        name: sp.name,
        img: sp.img,
        shiny: !!companion.shiny,
        level,
        stageName: stage.name,
        stageIndex: stage.index,
        rarity: sp.rarity,
        ringCls: RARITIES[sp.rarity]?.ring || 'ring-gray-300',
      };
    }
  }

  return {
    companion: companionInfo,
    title: title ? { name: title.name, color: isDark ? title.darkColor : title.color } : null,
    score: collectionScore(menagerieData),
    species: speciesDiscovered(menagerieData),
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPANION → CHAMPION'S FORGE production bonus
// % per creature level, by rarity; shiny companions get ×1.5.
// Maxed (Lv 30): common +3%, uncommon +6%, rare +10.5%, epic +15%,
// legendary +24% (shiny legendary +36%).
// ═══════════════════════════════════════════════════════════════════════════
export const FORGE_RARITY_RATE = { common: 0.1, uncommon: 0.2, rare: 0.35, epic: 0.5, legendary: 0.8 };

export const companionForgeBonus = (menagerieData) => {
  const comp = menagerieData?.companionUid
    ? (menagerieData.creatures || []).find((c) => c.uid === menagerieData.companionUid)
    : null;
  const sp = comp ? SPECIES_MAP[comp.speciesId] : null;
  if (!sp) return { mult: 1, pct: 0 };
  const level = levelForXp(comp.xp);
  let pct = (FORGE_RARITY_RATE[sp.rarity] || 0.1) * level;
  if (comp.shiny) pct *= 1.5;
  pct = Math.round(pct * 10) / 10;
  return { mult: 1 + pct / 100, pct, name: sp.name, img: sp.img, shiny: !!comp.shiny, level, rarity: sp.rarity };
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT SAVE
// ═══════════════════════════════════════════════════════════════════════════
export const defaultSave = () => ({
  essence: 80,             // enough for a first Meadow Egg + change
  food: 10,
  lastFoodAt: null,        // ISO — food regen anchor
  lastXpSnapshot: null,    // classroom XP watermark (essence is earned on the delta)
  homesteadEssenceClaimed: 0, // watermark vs homesteadData.menagerieEssenceEarned
  totalEssenceEarned: 0,
  creatures: [],           // [{ uid, speciesId, shiny, xp, hatchedAt, lastPlayedAt, lastTrainedAt }]
  eggs: [],                // [{ uid, tier, hatchAt }]
  companionUid: null,
  eggsHatched: 0,
  careActions: 0,
  lastGiftDay: null,       // 'YYYY-MM-DD' — daily gift tracker
  unlockedTitles: [],
  activeTitle: null,
  lastSeen: null,
  lastSaved: null,
});
// EOF
