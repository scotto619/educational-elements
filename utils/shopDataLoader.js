// utils/shopDataLoader.js - Load shop data from Firebase Admin System
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase';

/**
 * Fetch all avatars from the admin-managed shop
 */
export async function fetchShopAvatars() {
  try {
    const avatarsRef = collection(firestore, 'shopData', 'avatars', 'items');
    const snapshot = await getDocs(avatarsRef);
    
    const avatars = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Separate by type
    const basic = avatars.filter(a => a.type === 'basic');
    const premium = avatars.filter(a => a.type === 'premium');

    console.log(`✅ Loaded ${avatars.length} avatars from admin shop (${basic.length} basic, ${premium.length} premium)`);
    
    return {
      basic,
      premium,
      all: avatars
    };
  } catch (error) {
    console.error('❌ Error loading shop avatars:', error);
    
    // Return empty arrays if collection doesn't exist yet
    return {
      basic: [],
      premium: [],
      all: []
    };
  }
}

/**
 * Fetch all pets from the admin-managed shop
 */
export async function fetchShopPets() {
  try {
    const petsRef = collection(firestore, 'shopData', 'pets', 'items');
    const snapshot = await getDocs(petsRef);
    
    const pets = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Separate by type
    const basic = pets.filter(p => p.type === 'basic');
    const premium = pets.filter(p => p.type === 'premium');

    console.log(`✅ Loaded ${pets.length} pets from admin shop (${basic.length} basic, ${premium.length} premium)`);
    
    return {
      basic,
      premium,
      all: pets
    };
  } catch (error) {
    console.error('❌ Error loading shop pets:', error);
    
    // Return empty arrays if collection doesn't exist yet
    return {
      basic: [],
      premium: [],
      all: []
    };
  }
}

/**
 * Fetch dashboard updates for teachers
 */
export async function fetchDashboardUpdates(limit = 10) {
  try {
    const updatesRef = collection(firestore, 'dashboardUpdates');
    const snapshot = await getDocs(updatesRef);
    
    const updates = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    console.log(`✅ Loaded ${updates.length} dashboard updates`);
    
    return updates;
  } catch (error) {
    console.error('❌ Error loading dashboard updates:', error);
    return [];
  }
}

/**
 * Get featured items for today
 */
export async function getFeaturedItems() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const featuredRef = doc(firestore, 'featuredItems', today);
    const featuredDoc = await getDoc(featuredRef);
    
    if (featuredDoc.exists()) {
      console.log('✅ Loaded featured items for today');
      return featuredDoc.data();
    }
    
    // If no featured items set, return null
    return null;
  } catch (error) {
    console.error('❌ Error loading featured items:', error);
    return null;
  }
}

/**
 * Combine admin shop data with hardcoded special items (Christmas, etc.)
 */
export async function getCombinedShopData(specialItems = {}) {
  const [avatars, pets] = await Promise.all([
    fetchShopAvatars(),
    fetchShopPets()
  ]);

  return {
    avatars: {
      basic: [...(specialItems.basicAvatars || []), ...avatars.basic],
      premium: [...(specialItems.premiumAvatars || []), ...avatars.premium]
    },
    pets: {
      basic: [...(specialItems.basicPets || []), ...pets.basic],
      premium: [...(specialItems.premiumPets || []), ...pets.premium]
    }
  };
}

/**
 * Check if admin shop has any items
 */
export async function hasAdminShopItems() {
  try {
    const [avatars, pets] = await Promise.all([
      fetchShopAvatars(),
      fetchShopPets()
    ]);
    
    return avatars.all.length > 0 || pets.all.length > 0;
  } catch (error) {
    return false;
  }
}

export default {
  fetchShopAvatars,
  fetchShopPets,
  fetchDashboardUpdates,
  getFeaturedItems,
  getCombinedShopData,
  hasAdminShopItems
};