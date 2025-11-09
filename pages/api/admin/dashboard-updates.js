import admin from 'firebase-admin';
import { adminFirestore } from '../../../utils/firebase-admin';
import { requireOwner } from '../../../utils/apiAuth';

const DASHBOARD_UPDATES_COLLECTION = 'dashboard_updates';

const buildPayload = (update = {}) => ({
  title: update.title,
  status: update.status || 'UPDATE',
  summary: update.summary || '',
  highlight: update.highlight || '',
  active: update.active !== false,
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
});

const respond = (res, status, data) => {
  res.status(status).json(data);
};

export default async function handler(req, res) {
  try {
    await requireOwner(req);
  } catch (error) {
    const status = error.status || 401;
    return respond(res, status, { error: error.message });
  }

  try {
    if (req.method === 'POST') {
      const { update } = req.body || {};

      if (!update?.title) {
        return respond(res, 400, { error: 'A title is required for dashboard updates.' });
      }

      const payload = buildPayload(update);

      if (update.id) {
        await adminFirestore.collection(DASHBOARD_UPDATES_COLLECTION).doc(update.id).set(payload, { merge: true });
        return respond(res, 200, { id: update.id });
      }

      const docRef = await adminFirestore.collection(DASHBOARD_UPDATES_COLLECTION).add({
        ...payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return respond(res, 200, { id: docRef.id });
    }

    if (req.method === 'PATCH') {
      const { id, active } = req.body || {};
      if (!id) {
        return respond(res, 400, { error: 'Missing update id.' });
      }

      await adminFirestore.collection(DASHBOARD_UPDATES_COLLECTION).doc(id).set({
        active: !!active,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return respond(res, 200, { id, active: !!active });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return respond(res, 400, { error: 'Missing update id.' });
      }

      await adminFirestore.collection(DASHBOARD_UPDATES_COLLECTION).doc(id).delete();
      return respond(res, 200, { id });
    }

    return respond(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Failed to manage dashboard update:', error);
    return respond(res, 500, { error: error.message || 'Internal server error' });
  }
}
