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
import {
  DASHBOARD_UPDATES_COLLECTION,
  SHOP_COLLECTION,
  emptyInventory,
  groupShopItems,
  mapShopDocToItem,
  mapUpdateDoc,
  mergeByName,
  toSlug
} from '../utils/globalContentHelpers';

export const mergeShopInventories = (base = emptyInventory(), extra = emptyInventory()) => ({
  basicAvatars: mergeByName(base.basicAvatars, extra.basicAvatars),
  premiumAvatars: mergeByName(base.premiumAvatars, extra.premiumAvatars),
  basicPets: mergeByName(base.basicPets, extra.basicPets),
  premiumPets: mergeByName(base.premiumPets, extra.premiumPets)
});

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
