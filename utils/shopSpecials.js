// utils/shopSpecials.js - shared helpers for daily shop specials

export const DEFAULT_TEACHER_REWARDS = [
  { id: 'reward_1', name: 'Extra Computer Time', price: 20, category: 'technology', icon: '💻' },
  { id: 'reward_2', name: 'Class Game Session', price: 30, category: 'fun', icon: '🎮' },
  { id: 'reward_3', name: 'No Homework Pass', price: 25, category: 'privileges', icon: '📝' },
  { id: 'reward_4', name: 'Choose Class Music', price: 15, category: 'privileges', icon: '🎵' },
  { id: 'reward_5', name: 'Line Leader for a Week', price: 10, category: 'privileges', icon: '🎯' },
  { id: 'reward_6', name: 'Sit Anywhere Day', price: 12, category: 'privileges', icon: '💺' },
  { id: 'reward_7', name: 'Extra Recess Time', price: 18, category: 'fun', icon: '⏰' },
  { id: 'reward_8', name: 'Teach the Class', price: 35, category: 'special', icon: '🎓' }
];

const mapItemsWithMeta = (items = [], meta = {}) =>
  items.map(item => ({
    ...item,
    ...meta,
    originalPrice: item.originalPrice || item.price
  }));

export const buildShopInventory = ({
  basicAvatars = [],
  premiumAvatars = [],
  basicPets = [],
  premiumPets = [],
  rewards = [],
  extraItems = []
} = {}) => {
  const inventory = [
    ...mapItemsWithMeta(basicAvatars, { category: 'basic_avatars', type: 'avatar' }),
    ...mapItemsWithMeta(premiumAvatars, { category: 'premium_avatars', type: 'avatar' }),
    ...mapItemsWithMeta(basicPets, { category: 'basic_pets', type: 'pet' }),
    ...mapItemsWithMeta(premiumPets, { category: 'premium_pets', type: 'pet' }),
    ...mapItemsWithMeta(rewards, { category: 'rewards', type: 'reward' }),
    ...mapItemsWithMeta(extraItems, {})
  ];

  return inventory;
};

const createDailySeed = (date = new Date()) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const shuffleWithSeed = (items, seed) => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getDailySpecials = (items = [], { count = 3, discount = 0.3, date } = {}) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const seed = createDailySeed(date);
  const shuffled = shuffleWithSeed(items, seed);
  const selection = shuffled.slice(0, count);

  return selection.map(item => {
    const basePrice = item.price ?? item.originalPrice ?? 0;
    const discountedPrice = Math.max(1, Math.floor(basePrice * (1 - discount)));

    return {
      ...item,
      originalPrice: item.originalPrice ?? basePrice,
      price: discountedPrice,
      salePercentage: Math.round(discount * 100)
    };
  });
};
