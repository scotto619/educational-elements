import admin from 'firebase-admin';
import { adminFirestore } from '../../../utils/firebase-admin';
import {
  SHOP_COLLECTION,
  groupShopItems,
  mapShopDocToItem,
  toSlug
} from '../../../utils/globalContentHelpers';
import verifyOwnerRequest from '../../../utils/verifyOwnerRequest';

const { FieldValue } = admin.firestore;

const buildShopPayload = (item) => ({
  name: item.name,
  price: Number(item.price ?? 0),
  image: item.path || item.image || '',
  description: item.description || '',
  rarity: item.rarity || 'custom',
  type: item.type || 'avatar',
  category: item.category || 'basic',
  active: item.active !== false,
  updatedAt: FieldValue.serverTimestamp(),
});

export default async function handler(req, res) {
  try {
    await verifyOwnerRequest(req);
  } catch (error) {
    const status = error.status || 401;
    return res.status(status).json({ error: error.message || 'Unauthorized' });
  }

  const collectionRef = adminFirestore.collection(SHOP_COLLECTION);

  try {
    switch (req.method) {
      case 'GET': {
        const snapshot = await collectionRef.orderBy('createdAt', 'desc').get();
        const items = snapshot.docs.map(mapShopDocToItem);
        const inventory = groupShopItems(items.filter((item) => item.active));
        return res.status(200).json({ items, inventory });
      }

      case 'POST':
      case 'PUT': {
        const item = req.body || {};
        if (!item.name || !(item.path || item.image)) {
          return res.status(400).json({ error: 'Name and image path are required' });
        }

        const payload = buildShopPayload(item);
        let docId = item.id;

        if (docId) {
          await collectionRef.doc(docId).set(payload, { merge: true });
        } else {
          docId = toSlug(item.name);
          await collectionRef.doc(docId).set(
            {
              ...payload,
              createdAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        }

        const savedDoc = await collectionRef.doc(docId).get();
        return res.status(200).json({ id: docId, item: mapShopDocToItem(savedDoc) });
      }

      case 'PATCH': {
        const { id, active } = req.body || {};
        if (!id) {
          return res.status(400).json({ error: 'Missing item id' });
        }

        await collectionRef.doc(id).set(
          {
            active: !!active,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const updatedDoc = await collectionRef.doc(id).get();
        return res.status(200).json({ id, item: mapShopDocToItem(updatedDoc) });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing item id' });
        }

        await collectionRef.doc(id).delete();
        return res.status(200).json({ id });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('❌ Admin shop API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
