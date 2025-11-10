import {
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  HALLOWEEN_BASIC_AVATARS,
  HALLOWEEN_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_PETS
} from './gameHelpers';

const slugify = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeAssetPath = (path = '') => {
  if (!path) return '';
  const segments = path.split('/');
  return segments
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join('/');
};

const mapToCoreRarity = (rarity, price) => {
  const lowered = (rarity || '').toLowerCase();
  if (lowered === 'legendary' || lowered === 'mythic') return 'legendary';
  if (lowered === 'epic' || lowered === 'rare') return 'rare';
  if (lowered === 'uncommon') return 'common';

  if (typeof price === 'number') {
    if (price >= 55) return 'legendary';
    if (price >= 30) return 'rare';
  }

  return 'common';
};

const CLICKER_WEAPON_CARDS = [
  { id: 'weapon-1', name: 'Novice Blade', image: '/Loot/Weapons/1.png', tier: 1 },
  { id: 'weapon-2', name: 'Mystic Staff', image: '/Loot/Weapons/2.png', tier: 1 },
  { id: 'weapon-3', name: 'Frost Axe', image: '/Loot/Weapons/3.png', tier: 1 },
  { id: 'weapon-4', name: 'Shadow Daggers', image: '/Loot/Weapons/4.png', tier: 1 },
  { id: 'weapon-5', name: 'Elven Bow', image: '/Loot/Weapons/5.png', tier: 1 },
  { id: 'weapon-6', name: 'Orcish Cleaver', image: '/Loot/Weapons/6.png', tier: 1 },
  { id: 'weapon-7', name: 'Divine Hammer', image: '/Loot/Weapons/7.png', tier: 2 },
  { id: 'weapon-8', name: "Nature's Whip", image: '/Loot/Weapons/8.png', tier: 2 },
  { id: 'weapon-9', name: 'Celestial Orb', image: '/Loot/Weapons/9.png', tier: 2 },
  { id: 'weapon-10', name: 'Heart Mace', image: '/Loot/Weapons/10.png', tier: 2 },
  { id: 'weapon-11', name: 'Mechanical Gauntlet', image: '/Loot/Weapons/11.png', tier: 2 },
  { id: 'weapon-12', name: 'Golden Hammer', image: '/Loot/Weapons/12.png', tier: 2 },
  { id: 'weapon-13', name: 'Electro Staff', image: '/Loot/Weapons/13.png', tier: 2 },
  { id: 'weapon-14', name: 'Void Staff', image: '/Loot/Weapons/14.png', tier: 3 },
  { id: 'weapon-15', name: 'Elemental Trident', image: '/Loot/Weapons/15.png', tier: 3 },
  { id: 'weapon-16', name: 'Soul Reaper', image: '/Loot/Weapons/16.png', tier: 3 },
  { id: 'weapon-17', name: 'Cosmic Blades', image: '/Loot/Weapons/17.png', tier: 3 },
  { id: 'weapon-18', name: 'Genesis Sword', image: '/Loot/Weapons/18.png', tier: 3 },
  { id: 'weapon-19', name: 'Reality Breaker', image: '/Loot/Weapons/19.png', tier: 3 },
  { id: 'weapon-20', name: 'Infinity Edge', image: '/Loot/Weapons/20.png', tier: 3 },
  { id: 'weapon-21', name: 'Omnislayer', image: '/Loot/Weapons/21.png', tier: 3 }
];

const CLICKER_ARTIFACT_CARDS = [
  { id: 'artifact-1', name: 'Crystal Orb', image: '/Loot/Artifacts/1.png', tier: 1 },
  { id: 'artifact-2', name: 'Ancient Tome', image: '/Loot/Artifacts/2.png', tier: 1 },
  { id: 'artifact-3', name: 'Mystic Lute', image: '/Loot/Artifacts/3.png', tier: 1 },
  { id: 'artifact-4', name: 'Guardian Shield', image: '/Loot/Artifacts/4.png', tier: 1 },
  { id: 'artifact-5', name: 'Divine Chalice', image: '/Loot/Artifacts/5.png', tier: 2 },
  { id: 'artifact-6', name: 'Crown of Ages', image: '/Loot/Artifacts/6.png', tier: 2 },
  { id: 'artifact-7', name: 'Shadow Mask', image: '/Loot/Artifacts/7.png', tier: 2 },
  { id: 'artifact-8', name: 'Primal Totem', image: '/Loot/Artifacts/8.png', tier: 2 },
  { id: 'artifact-9', name: 'Phoenix Feather', image: '/Loot/Artifacts/9.png', tier: 3 },
  { id: 'artifact-10', name: 'Void Cauldron', image: '/Loot/Artifacts/10.png', tier: 3 }
];

const tierToRarity = (tier = 1) => {
  if (tier >= 3) return 'legendary';
  if (tier === 2) return 'rare';
  return 'common';
};

export const CARD_RARITY_ORDER = ['common', 'rare', 'legendary'];

export const CARD_RARITY_STYLES = {
  common: {
    label: 'Common',
    color: '#6b7280',
    border: '#cbd5f5',
    glow: 'rgba(148, 163, 184, 0.35)',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 60%, #f8fafc 100%)',
    particle: 'rgba(148, 163, 184, 0.55)'
  },
  rare: {
    label: 'Rare',
    color: '#2563eb',
    border: '#60a5fa',
    glow: 'rgba(37, 99, 235, 0.55)',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 55%, #e0f2fe 100%)',
    particle: 'rgba(96, 165, 250, 0.65)'
  },
  legendary: {
    label: 'Legendary',
    color: '#f59e0b',
    border: '#fcd34d',
    glow: 'rgba(251, 191, 36, 0.75)',
    gradient: 'linear-gradient(135deg, #fff7ed 0%, #fde68a 45%, #fef08a 100%)',
    particle: 'rgba(251, 191, 36, 0.85)'
  }
};

export const CARD_TYPE_LABELS = {
  avatar: 'Avatar',
  pet: 'Pet',
  weapon: 'Weapon',
  artifact: 'Artifact'
};

export const DEFAULT_PACK_RARITY_WEIGHTS = {
  common: 0.72,
  rare: 0.23,
  legendary: 0.05
};

export const DEFAULT_CARD_PACKS = [
  {
    id: 'starter_spark_pack',
    name: 'Starter Spark Pack',
    rarity: 'common',
    price: 18,
    minCards: 1,
    maxCards: 2,
    rarityWeights: { common: 0.78, rare: 0.2, legendary: 0.02 },
    description: 'A bright introduction filled with beginner-friendly cards.',
    icon: '✨',
    visual: {
      gradient: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 45%, #fef3c7 100%)',
      glow: 'rgba(249, 115, 22, 0.45)',
      accent: '#f59e0b',
      label: '#fff8e7'
    }
  },
  {
    id: 'champion_prism_pack',
    name: 'Champion Prism Pack',
    rarity: 'rare',
    price: 32,
    minCards: 2,
    maxCards: 3,
    rarityWeights: { common: 0.55, rare: 0.35, legendary: 0.1 },
    description: 'Higher-tier heroes and companions radiate from this pack.',
    icon: '🃏',
    visual: {
      gradient: 'linear-gradient(135deg, #a855f7 0%, #6366f1 45%, #22d3ee 100%)',
      glow: 'rgba(79, 70, 229, 0.6)',
      accent: '#1e40af',
      label: '#f8fafc'
    }
  },
  {
    id: 'mythic_aurora_pack',
    name: 'Mythic Aurora Pack',
    rarity: 'legendary',
    price: 60,
    minCards: 3,
    maxCards: 3,
    rarityWeights: { common: 0.55, rare: 0.4, legendary: 0.05 },
    description: 'Shimmering legends and radiant artifacts await true collectors.',
    icon: '🌌',
    visual: {
      gradient: 'linear-gradient(135deg, #0f172a 0%, #6366f1 40%, #f97316 100%)',
      glow: 'rgba(217, 119, 6, 0.7)',
      accent: '#fbbf24',
      label: '#fef3c7'
    }
  }
];

const uniqueByName = (items = []) => {
  const map = new Map();
  items.forEach(item => {
    if (!item || !item.name) return;
    const key = item.name.toLowerCase();
    if (!map.has(key)) {
      map.set(key, item);
    }
  });
  return Array.from(map.values());
};

const buildAvatarCards = (avatars = []) => {
  return uniqueByName(avatars).map(avatar => {
    const rarity = mapToCoreRarity(avatar.rarity, avatar.price);
    return {
      id: `avatar-${slugify(avatar.name)}`,
      name: avatar.name,
      type: 'avatar',
      rarity,
      image: normalizeAssetPath(avatar.path || `/avatars/${encodeURIComponent(avatar.name)}/Level 4.png`),
      metadata: {
        price: avatar.price || 0
      }
    };
  });
};

const buildPetCards = (pets = []) => {
  return uniqueByName(pets).map(pet => {
    const rarity = mapToCoreRarity(pet.rarity, pet.price);
    return {
      id: `pet-${slugify(pet.name)}`,
      name: pet.name,
      type: 'pet',
      rarity,
      image: normalizeAssetPath(pet.path || pet.image || ''),
      metadata: {
        price: pet.price || 0
      }
    };
  });
};

const buildWeaponCards = (weapons = []) => {
  return weapons.map(weapon => ({
    id: weapon.id,
    name: weapon.name,
    type: 'weapon',
    rarity: tierToRarity(weapon.tier),
    image: normalizeAssetPath(weapon.image),
    metadata: {
      tier: weapon.tier
    }
  }));
};

const buildArtifactCards = (artifacts = []) => {
  return artifacts.map(artifact => ({
    id: artifact.id,
    name: artifact.name,
    type: 'artifact',
    rarity: tierToRarity(artifact.tier),
    image: normalizeAssetPath(artifact.image),
    metadata: {
      tier: artifact.tier
    }
  }));
};

export const buildTradingCardLibrary = ({
  avatars = [
    ...SHOP_BASIC_AVATARS,
    ...SHOP_PREMIUM_AVATARS,
    ...HALLOWEEN_BASIC_AVATARS,
    ...HALLOWEEN_PREMIUM_AVATARS
  ],
  pets = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS],
  weapons = CLICKER_WEAPON_CARDS,
  artifacts = CLICKER_ARTIFACT_CARDS
} = {}) => {
  const avatarCards = buildAvatarCards(avatars);
  const petCards = buildPetCards(pets);
  const weaponCards = buildWeaponCards(weapons);
  const artifactCards = buildArtifactCards(artifacts);

  const combined = [...avatarCards, ...petCards, ...weaponCards, ...artifactCards];
  const typeOrder = ['avatar', 'pet', 'weapon', 'artifact'];

  return combined.sort((a, b) => {
    const rarityComparison = CARD_RARITY_ORDER.indexOf(a.rarity) - CARD_RARITY_ORDER.indexOf(b.rarity);
    if (rarityComparison !== 0) return rarityComparison;

    const typeComparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
    if (typeComparison !== 0) return typeComparison;

    return a.name.localeCompare(b.name);
  });
};

const pickRarity = (weights, randomFn) => {
  const normalized = weights || DEFAULT_PACK_RARITY_WEIGHTS;
  const total = Object.values(normalized).reduce((acc, value) => acc + value, 0) || 1;
  const roll = randomFn() * total;

  let accumulator = 0;
  for (const rarity of CARD_RARITY_ORDER) {
    const weight = normalized[rarity] ?? 0;
    accumulator += weight;
    if (roll <= accumulator) {
      return rarity;
    }
  }

  return 'common';
};

export const drawCardsFromPack = (pack, { cardLibrary, random = Math.random } = {}) => {
  const library = Array.isArray(cardLibrary) ? cardLibrary : buildTradingCardLibrary();
  if (!pack) return [];

  const rarityBuckets = library.reduce((acc, card) => {
    if (!acc[card.rarity]) {
      acc[card.rarity] = [];
    }
    acc[card.rarity].push(card);
    return acc;
  }, {});

  const minCards = Math.max(1, Number(pack.minCards) || 1);
  const maxCards = Math.max(minCards, Number(pack.maxCards) || minCards);
  const totalCards = Math.floor(random() * (maxCards - minCards + 1)) + minCards;

  const pulls = [];
  for (let index = 0; index < totalCards; index += 1) {
    let rarity = pickRarity(pack.rarityWeights || DEFAULT_PACK_RARITY_WEIGHTS, random);
    if (!rarityBuckets[rarity] || rarityBuckets[rarity].length === 0) {
      rarity = 'common';
    }

    const bucket = rarityBuckets[rarity] || library;
    const card = bucket[Math.floor(random() * bucket.length)];
    pulls.push(card);
  }

  return pulls;
};

export const summarizeCardPull = (cards = []) => {
  const counts = cards.reduce((acc, card) => {
    if (!acc[card.rarity]) acc[card.rarity] = 0;
    acc[card.rarity] += 1;
    return acc;
  }, {});

  return CARD_RARITY_ORDER
    .map(rarity => {
      if (!counts[rarity]) return null;
      const label = CARD_RARITY_STYLES[rarity].label;
      return `${counts[rarity]} ${label}`;
    })
    .filter(Boolean)
    .join(', ');
};

export const getCardLibraryMap = (library = []) => {
  const map = new Map();
  library.forEach(card => {
    map.set(card.id, card);
  });
  return map;
};

export const getRarityBreakdown = (cardCollection = {}, library = []) => {
  const base = CARD_RARITY_ORDER.reduce((acc, rarity) => {
    acc[rarity] = { total: 0, owned: 0 };
    return acc;
  }, {});

  const ownedCards = cardCollection.cards || {};

  library.forEach(card => {
    base[card.rarity].total += 1;
    if (ownedCards[card.id]?.count) {
      base[card.rarity].owned += 1;
    }
  });

  return base;
};

export const getCollectionProgress = (cardCollection = {}, library = []) => {
  const ownedCards = cardCollection.cards || {};
  const totalUnique = library.length;
  const uniqueOwned = library.reduce((acc, card) => acc + (ownedCards[card.id]?.count ? 1 : 0), 0);
  const totalOwned = Object.values(ownedCards).reduce((acc, entry) => acc + (entry.count || 0), 0);

  const completion = totalUnique === 0 ? 0 : Math.round((uniqueOwned / totalUnique) * 100);

  return {
    totalUnique,
    uniqueOwned,
    totalOwned,
    completion
  };
};

