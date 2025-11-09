const SHOP_COLLECTION = 'global_shop_items';
const DASHBOARD_UPDATES_COLLECTION = 'dashboard_updates';

const emptyInventory = () => ({
  basicAvatars: [],
  premiumAvatars: [],
  basicPets: [],
  premiumPets: [],
});

const toSlug = (text = '') =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    || `item-${Date.now()}`;

const normalizeTimestamp = (value) => {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    try {
      const date = value.toDate();
      return date instanceof Date ? date.toISOString() : null;
    } catch (error) {
      console.warn('⚠️ Failed to convert Firestore timestamp:', error);
      return null;
    }
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }

  return null;
};

const mergeByName = (primary = [], additions = []) => {
  const map = new Map();
  primary.forEach((item) => {
    if (item?.name) {
      map.set(item.name.toLowerCase(), item);
    }
  });
  additions.forEach((item) => {
    if (item?.name) {
      map.set(item.name.toLowerCase(), { ...item });
    }
  });
  return Array.from(map.values());
};

const mapShopDocToItem = (docSnap) => {
  const data = typeof docSnap?.data === 'function' ? docSnap.data() || {} : docSnap || {};
  const id = docSnap?.id || data.id || toSlug(data.name);

  const item = {
    id,
    name: data.name || 'Unnamed Item',
    price: Number(data.price ?? 0),
    path: data.image || data.path || data.storagePath || '',
    description: data.description || '',
    rarity: data.rarity || data.tier || 'custom',
    type: data.type || 'avatar',
    category: data.category || 'basic',
    active: data.active !== false,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };

  if (!item.path && data.fileName) {
    item.path = `/shop/custom/${data.fileName}`;
  }

  return item;
};

const groupShopItems = (items = []) => {
  const inventory = emptyInventory();
  items.forEach((item) => {
    if (!item?.active) return;
    if (item.type === 'pet') {
      if (item.category === 'premium') {
        inventory.premiumPets.push(item);
      } else {
        inventory.basicPets.push(item);
      }
    } else {
      if (item.category === 'premium') {
        inventory.premiumAvatars.push(item);
      } else {
        inventory.basicAvatars.push(item);
      }
    }
  });
  return inventory;
};

const mapUpdateDoc = (docSnap) => {
  const data = typeof docSnap?.data === 'function' ? docSnap.data() || {} : docSnap || {};
  const id = docSnap?.id || data.id || toSlug(data.title || 'update');

  return {
    id,
    title: data.title || 'Untitled Update',
    status: data.status || 'UPDATE',
    summary: data.summary || '',
    highlight: data.highlight || '',
    active: data.active !== false,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
};

export {
  SHOP_COLLECTION,
  DASHBOARD_UPDATES_COLLECTION,
  emptyInventory,
  mergeByName,
  toSlug,
  normalizeTimestamp,
  mapShopDocToItem,
  groupShopItems,
  mapUpdateDoc,
};
