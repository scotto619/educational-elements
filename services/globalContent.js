import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { firestore } from '../utils/firebase';

const SHOP_COLLECTION = 'global_shop_items';
const DASHBOARD_UPDATES_COLLECTION = 'dashboard_updates';

const emptyInventory = () => ({
  basicAvatars: [],
  premiumAvatars: [],
  basicPets: [],
  premiumPets: []
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
    const date = value.toDate();
    return date instanceof Date ? date.toISOString() : null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return null;
};

const mergeByName = (primary = [], additions = []) => {
  const map = new Map();
  primary.forEach(item => {
    if (item?.name) {
      map.set(item.name.toLowerCase(), item);
    }
  });
  additions.forEach(item => {
    if (item?.name) {
      map.set(item.name.toLowerCase(), { ...item });
    }
  });
  return Array.from(map.values());
};

export const mergeShopInventories = (base = emptyInventory(), extra = emptyInventory()) => ({
  basicAvatars: mergeByName(base.basicAvatars, extra.basicAvatars),
  premiumAvatars: mergeByName(base.premiumAvatars, extra.premiumAvatars),
  basicPets: mergeByName(base.basicPets, extra.basicPets),
  premiumPets: mergeByName(base.premiumPets, extra.premiumPets)
});

const mapShopDocToItem = (docSnap) => {
  const data = docSnap.data() || {};
  const item = {
    id: docSnap.id,
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

export const fetchGlobalShopItems = async ({ includeInactive = false } = {}) => {
  const baseQuery = collection(firestore, SHOP_COLLECTION);
  let shopQuery;

  if (includeInactive) {
    shopQuery = query(baseQuery, orderBy('createdAt', 'desc'));
  } else {
    shopQuery = query(baseQuery, where('active', '==', true), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(shopQuery);
  const items = snapshot.docs.map(mapShopDocToItem);
  return groupShopItems(items);
};

export const listAllShopItems = async () => {
  const snapshot = await getDocs(query(collection(firestore, SHOP_COLLECTION), orderBy('createdAt', 'desc')));
  return snapshot.docs.map(mapShopDocToItem);
};

export const saveShopItem = async (item) => {
  const payload = {
    name: item.name,
    price: Number(item.price ?? 0),
    image: item.path || item.image || '',
    description: item.description || '',
    rarity: item.rarity || 'custom',
    type: item.type || 'avatar',
    category: item.category || 'basic',
    active: item.active !== false,
    updatedAt: serverTimestamp()
  };

  if (item.id) {
    const ref = doc(firestore, SHOP_COLLECTION, item.id);
    await updateDoc(ref, payload);
    return item.id;
  }

  const docId = toSlug(item.name);
  const ref = doc(firestore, SHOP_COLLECTION, docId);
  await setDoc(ref, { ...payload, createdAt: serverTimestamp() }, { merge: true });
  return docId;
};

export const setShopItemActive = async (id, active) => {
  const ref = doc(firestore, SHOP_COLLECTION, id);
  await updateDoc(ref, {
    active,
    updatedAt: serverTimestamp()
  });
};

export const removeShopItem = async (id) => {
  await deleteDoc(doc(firestore, SHOP_COLLECTION, id));
};

const mapUpdateDoc = (docSnap) => {
  const data = docSnap.data() || {};
  return {
    id: docSnap.id,
    title: data.title || 'Untitled Update',
    status: data.status || 'UPDATE',
    summary: data.summary || '',
    highlight: data.highlight || '',
    active: data.active !== false,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt)
  };
};

export const fetchDashboardUpdates = async ({ includeInactive = false } = {}) => {
  const collectionRef = collection(firestore, DASHBOARD_UPDATES_COLLECTION);
  let updatesQuery;

  if (includeInactive) {
    updatesQuery = query(collectionRef, orderBy('createdAt', 'desc'));
  } else {
    updatesQuery = query(collectionRef, where('active', '==', true), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(updatesQuery);
  return snapshot.docs.map(mapUpdateDoc);
};

export const saveDashboardUpdate = async (update) => {
  const payload = {
    title: update.title,
    status: update.status || 'UPDATE',
    summary: update.summary || '',
    highlight: update.highlight || '',
    active: update.active !== false,
    updatedAt: serverTimestamp()
  };

  if (update.id) {
    await updateDoc(doc(firestore, DASHBOARD_UPDATES_COLLECTION, update.id), payload);
    return update.id;
  }

  const newDoc = await addDoc(collection(firestore, DASHBOARD_UPDATES_COLLECTION), {
    ...payload,
    createdAt: serverTimestamp()
  });

  return newDoc.id;
};

export const setDashboardUpdateActive = async (id, active) => {
  await updateDoc(doc(firestore, DASHBOARD_UPDATES_COLLECTION, id), {
    active,
    updatedAt: serverTimestamp()
  });
};

export const removeDashboardUpdate = async (id) => {
  await deleteDoc(doc(firestore, DASHBOARD_UPDATES_COLLECTION, id));
};

export const DEFAULT_UPDATES = [
  {
    id: 'v2-architecture',
    title: 'V2 Architecture Migration',
    status: 'NEW',
    summary: 'Improved performance and reliability across classroom tools with our distributed database rollout.',
    highlight: 'Faster XP awards and sync!'
  },
  {
    id: 'daily-deals',
    title: 'Featured Daily Deals',
    status: 'IMPROVED',
    summary: 'Rotating shop specials now include avatars, pets, and classroom rewards with auto-applied discounts.',
    highlight: 'Fresh items every day'
  },
  {
    id: 'toolkit-expansion',
    title: 'Teachers Toolkit Expansion',
    status: 'ENHANCED',
    summary: 'Job assignments, timetable planning, birthday tracking, and more classroom organization helpers.',
    highlight: 'Power tools for busy teachers'
  }
];

export default {
  fetchGlobalShopItems,
  fetchDashboardUpdates,
  saveShopItem,
  setShopItemActive,
  removeShopItem,
  saveDashboardUpdate,
  setDashboardUpdateActive,
  removeDashboardUpdate,
  listAllShopItems,
  mergeShopInventories,
  DEFAULT_UPDATES
};
