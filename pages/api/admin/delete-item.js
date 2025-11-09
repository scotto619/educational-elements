// pages/api/admin/delete-item.js
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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { itemType, itemId, adminEmail } = req.body;

    // Verify admin email
    if (adminEmail !== 'scotto6190@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
    }

    // Validate required fields
    if (!itemType || !itemId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['itemType', 'itemId']
      });
    }

    console.log(`🗑️ Admin deleting ${itemType}:`, itemId);

    // Determine collection path
    let docRef;
    switch (itemType) {
      case 'avatar':
        docRef = db.collection('shopData').doc('avatars').collection('items').doc(itemId);
        break;
      case 'pet':
        docRef = db.collection('shopData').doc('pets').collection('items').doc(itemId);
        break;
      case 'update':
        docRef = db.collection('dashboardUpdates').doc(itemId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid item type' });
    }

    // Delete the document
    await docRef.delete();

    console.log(`✅ ${itemType} deleted successfully:`, itemId);

    return res.status(200).json({
      success: true,
      message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`,
      itemId: itemId
    });

  } catch (error) {
    console.error('❌ Error deleting item:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}