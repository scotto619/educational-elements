import { adminFirestore } from '../../utils/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const snapshot = await adminFirestore
      .collection('users')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ exists: false, loginDisabled: false });
    }

    const userData = snapshot.docs[0].data();

    return res.status(200).json({
      exists: true,
      loginDisabled: userData?.loginDisabled === true
    });
  } catch (error) {
    console.error('Prelogin status check failed:', error);
    return res.status(500).json({ error: 'Failed to check login status' });
  }
}
