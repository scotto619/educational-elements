// pages/api/admin/add-shop-item.js
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!privateKey || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PROJECT_ID) {
      console.error('❌ Missing Firebase Admin SDK environment variables');
      throw new Error('Missing Firebase Admin SDK environment variables');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });

    console.log('✅ Firebase Admin SDK initialized for admin API');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemType, itemData, adminEmail } = req.body;

    // Verify admin email
    if (adminEmail !== 'scotto6190@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
    }

    // Validate item type
    if (!['avatar', 'pet'].includes(itemType)) {
      return res.status(400).json({ error: 'Invalid item type. Must be "avatar" or "pet".' });
    }

    // Validate required fields
    if (!itemData.name || !itemData.price || !itemData.path || !itemData.type) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'price', 'path', 'type']
      });
    }

    console.log(`🛠️ Admin adding ${itemType}:`, itemData.name);

    // Determine collection path
    const collectionPath = itemType === 'avatar' ? 'shopData/avatars/items' : 'shopData/pets/items';

    // Add item to Firestore
    const docRef = await db.collection(collectionPath.split('/')[0])
      .doc(collectionPath.split('/')[1])
      .collection(collectionPath.split('/')[2])
      .add({
        name: itemData.name,
        price: parseInt(itemData.price),
        type: itemData.type,
        path: itemData.path,
        createdAt: new Date().toISOString(),
        createdBy: adminEmail
      });

    console.log(`✅ ${itemType} added successfully:`, docRef.id);

    return res.status(200).json({
      success: true,
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} added successfully`,
      itemId: docRef.id,
      itemData: {
        id: docRef.id,
        ...itemData
      }
    });

  } catch (error) {
    console.error('❌ Error adding shop item:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}