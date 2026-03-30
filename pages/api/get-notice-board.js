// pages/api/get-notice-board.js
// Server-side endpoint using Admin SDK — bypasses Firestore auth rules
// so unauthenticated students can read the teacher's notice board.
import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { teacherId } = req.query;

  if (!teacherId || typeof teacherId !== 'string' || teacherId.trim() === '') {
    return res.status(400).json({ error: 'teacherId is required' });
  }

  try {
    const noticeRef = adminFirestore.collection('noticeBoards').doc(teacherId.trim());
    const snapshot = await noticeRef.get();

    if (!snapshot.exists) {
      return res.status(200).json({ items: [] });
    }

    const data = snapshot.data();
    return res.status(200).json({ items: data?.items || [] });
  } catch (error) {
    console.error('❌ Error reading notice board:', error);
    return res.status(500).json({ error: 'Failed to read notice board' });
  }
}
