import admin from 'firebase-admin';
import { adminFirestore } from '../../../utils/firebase-admin';
import {
  DASHBOARD_UPDATES_COLLECTION,
  mapUpdateDoc
} from '../../../utils/globalContentHelpers';
import verifyOwnerRequest from '../../../utils/verifyOwnerRequest';

const { FieldValue } = admin.firestore;

const buildUpdatePayload = (update) => ({
  title: update.title,
  status: update.status || 'UPDATE',
  summary: update.summary || '',
  highlight: update.highlight || '',
  active: update.active !== false,
  updatedAt: FieldValue.serverTimestamp(),
});

export default async function handler(req, res) {
  try {
    await verifyOwnerRequest(req);
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ error: error.message || 'Unauthorized' });
  }

  const collectionRef = adminFirestore.collection(DASHBOARD_UPDATES_COLLECTION);

  try {
    switch (req.method) {
      case 'GET': {
        const includeInactive = req.query.includeInactive === 'true' || req.query.includeInactive === '1';
        const snapshot = await collectionRef.orderBy('createdAt', 'desc').get();
        const updates = snapshot.docs
          .map(mapUpdateDoc)
          .filter((update) => includeInactive || update.active);
        return res.status(200).json({ updates });
      }

      case 'POST':
      case 'PUT': {
        const update = req.body || {};
        if (!update.title || !update.summary) {
          return res.status(400).json({ error: 'Title and summary are required' });
        }

        const payload = buildUpdatePayload(update);
        let docRef;

        if (update.id) {
          docRef = collectionRef.doc(update.id);
          await docRef.set(payload, { merge: true });
        } else {
          docRef = await collectionRef.add({
            ...payload,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        const savedDoc = await docRef.get();
        return res.status(200).json({ id: savedDoc.id, update: mapUpdateDoc(savedDoc) });
      }

      case 'PATCH': {
        const { id, active } = req.body || {};
        if (!id) {
          return res.status(400).json({ error: 'Missing update id' });
        }

        await collectionRef.doc(id).set(
          {
            active: !!active,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const updatedDoc = await collectionRef.doc(id).get();
        return res.status(200).json({ id, update: mapUpdateDoc(updatedDoc) });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing update id' });
        }

        await collectionRef.doc(id).delete();
        return res.status(200).json({ id });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Admin dashboard updates API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
