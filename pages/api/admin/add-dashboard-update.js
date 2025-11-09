// pages/api/admin/add-dashboard-update.js
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
    const { updateData, adminEmail } = req.body;

    // Verify admin email
    if (adminEmail !== 'scotto6190@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized. Admin access only.' });
    }

    // Validate required fields
    if (!updateData.title || !updateData.description || !updateData.type || !updateData.date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'description', 'type', 'date']
      });
    }

    console.log('📢 Admin adding dashboard update:', updateData.title);

    // Add update to Firestore
    const docRef = await db.collection('dashboardUpdates').add({
      title: updateData.title,
      description: updateData.description,
      type: updateData.type,
      date: updateData.date,
      createdAt: new Date().toISOString(),
      createdBy: adminEmail
    });

    console.log('✅ Dashboard update added successfully:', docRef.id);

    return res.status(200).json({
      success: true,
      message: 'Dashboard update added successfully',
      updateId: docRef.id,
      updateData: {
        id: docRef.id,
        ...updateData
      }
    });

  } catch (error) {
    console.error('❌ Error adding dashboard update:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}