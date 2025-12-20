// pages/api/admin/get-data.js
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataType, adminEmail } = req.query;

    // Verify admin email
    if (adminEmail !== 'scotto6190@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
    }

    console.log(`📊 Admin fetching data: ${dataType}`);

    let data = [];

    switch (dataType) {
      case 'avatars':
        const avatarsSnapshot = await db.collection('shopData')
          .doc('avatars')
          .collection('items')
          .get();
        data = avatarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;

      case 'pets':
        const petsSnapshot = await db.collection('shopData')
          .doc('pets')
          .collection('items')
          .get();
        data = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;

      case 'updates':
        const updatesSnapshot = await db.collection('dashboardUpdates')
          .orderBy('date', 'desc')
          .get();
        data = updatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        break;

      case 'cancellations':
        // Query users who have cancelled or deleted their account
        const canceledUsersSnapshot = await db.collection('users')
          .where('accountStatus', '==', 'canceled')
          .orderBy('canceledAt', 'desc')
          .limit(50) // Limit to 50 for performance
          .get();

        data = canceledUsersSnapshot.docs.map(doc => {
          const userData = doc.data();
          return {
            id: doc.id,
            email: userData.email,
            accountStatus: userData.accountStatus,
            canceledAt: userData.canceledAt,
            cancelReason: userData.cancelReason,
            subscriptionStatus: userData.subscriptionStatus,
            cancellationDetails: userData.cancellationDetails || {}
          };
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    console.log(`✅ Retrieved ${data.length} ${dataType}`);

    return res.status(200).json({
      success: true,
      data: data,
      count: data.length
    });

  } catch (error) {
    console.error('❌ Error fetching admin data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}