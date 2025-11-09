import { adminFirestore } from '../../../utils/firebase-admin';
import { requireOwner } from '../../../utils/apiAuth';

const SHOP_COLLECTION = 'global_shop_items';
const DASHBOARD_UPDATES_COLLECTION = 'dashboard_updates';

const normalizeTimestamp = (value) => {
  if (!value) return null;
  if (typeof value.toDate === 'function') {
    const date = value.toDate();
    return date instanceof Date ? date.toISOString() : null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

const mapShopDocToItem = (doc) => {
  const data = doc.data() || {};
  const item = {
    id: doc.id,
    name: data.name || 'Unnamed Item',
    price: Number(data.price ?? 0),
    path: data.image || data.path || data.storagePath || '',
    description: data.description || '',
    rarity: data.rarity || data.tier || 'custom',
    type: data.type || 'avatar',
    category: data.category || 'basic',
    active: data.active !== false,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt)
  };

  if (!item.path && data.fileName) {
    item.path = `/shop/custom/${data.fileName}`;
  }

  return item;
};

const emptyInventory = () => ({
  basicAvatars: [],
  premiumAvatars: [],
  basicPets: [],
  premiumPets: []
});

const groupShopItems = (items = []) => {
  const inventory = emptyInventory();

  items.forEach(item => {
    if (!item.active) return;
    if (item.type === 'pet') {
      if (item.category === 'premium') {
        inventory.premiumPets.push(item);
      } else {
        inventory.basicPets.push(item);
      }
    } else if (item.category === 'premium') {
      inventory.premiumAvatars.push(item);
    } else {
      inventory.basicAvatars.push(item);
    }
  });

  return inventory;
};

const mapUpdateDoc = (doc) => {
  const data = doc.data() || {};
  return {
    id: doc.id,
    title: data.title || 'Untitled Update',
    status: data.status || 'UPDATE',
    summary: data.summary || '',
    highlight: data.highlight || '',
    active: data.active !== false,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt)
  };
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireOwner(req);

    const shopSnapshot = await adminFirestore
      .collection(SHOP_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const items = shopSnapshot.docs.map(mapShopDocToItem);

    const updatesSnapshot = await adminFirestore
      .collection(DASHBOARD_UPDATES_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();

    const updates = updatesSnapshot.docs.map(mapUpdateDoc);

    res.status(200).json({
      shop: {
        items,
        inventory: groupShopItems(items)
      },
      updates
    });
  } catch (error) {
    const status = error.status || 500;
    console.error('Failed to load admin global content:', error);
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
}
