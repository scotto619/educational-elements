// pages/api/admin/export-users.js
import { adminAuth, adminFirestore } from '../../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users from Firestore
    const usersSnapshot = await adminFirestore.collection('users').get();
    const users = [];

    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      users.push({
        id: doc.id,
        email: userData.email,
        createdAt: userData.createdAt,
        subscription: userData.subscription,
        subscriptionStatus: userData.subscriptionStatus,
        planType: userData.planType,
        discountCodeUsed: userData.discountCodeUsed,
        freeAccessUntil: userData.freeAccessUntil,
        // Add any other fields you want to export
      });
    });

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Return as JSON or CSV based on query parameter
    const format = req.query.format || 'json';

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Email,Created At,Subscription,Status,Plan Type,Discount Code,Free Access Until\n';
      const csvData = users.map(user => 
        `"${user.email}","${user.createdAt}","${user.subscription || 'none'}","${user.subscriptionStatus || 'none'}","${user.planType || 'none'}","${user.discountCodeUsed || 'none'}","${user.freeAccessUntil || 'none'}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="educational-elements-users.csv"');
      return res.status(200).send(csvHeaders + csvData);
    }

    // Return JSON format
    res.status(200).json({
      totalUsers: users.length,
      exportedAt: new Date().toISOString(),
      users: users
    });

  } catch (error) {
    console.error('Error exporting users:', error);
    res.status(500).json({ 
      error: 'Failed to export users',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}