// pages/api/save-notice-board.js
// Server-side save using Admin SDK — bypasses Firestore auth rules.
import { adminFirestore } from '../../utils/firebase-admin';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teacherId, items } = req.body;

  if (!teacherId || typeof teacherId !== 'string' || teacherId.trim() === '') {
    return res.status(400).json({ error: 'teacherId is required' });
  }

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }

  try {
    const noticeRef = adminFirestore.collection('noticeBoards').doc(teacherId.trim());
    await noticeRef.set(
      {
        teacherId: teacherId.trim(),
        items,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Error saving notice board:', error);
    return res.status(500).json({ error: 'Failed to save notice board' });
  }
}
