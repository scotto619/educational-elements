import admin from 'firebase-admin';
import { adminFirestore } from '../../../utils/firebase-admin';
import { requireOwner } from '../../../utils/apiAuth';

const SHOP_COLLECTION = 'global_shop_items';

const toSlug = (text = '') =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    || `item-${Date.now()}`;

const buildPayload = (item = {}) => ({
  name: item.name,
  price: Number(item.price ?? 0),
  image: item.path || item.image || '',
  description: item.description || '',
  rarity: item.rarity || 'custom',
  type: item.type || 'avatar',
  category: item.category || 'basic',
  active: item.active !== false,
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
      const { item } = req.body || {};

      if (!item?.name) {
        return respond(res, 400, { error: 'A name is required for shop items.' });
      }

      const payload = buildPayload(item);

      if (item.id) {
        await adminFirestore.collection(SHOP_COLLECTION).doc(item.id).set(payload, { merge: true });
        return respond(res, 200, { id: item.id });
      }

      const docId = toSlug(item.name);
      await adminFirestore.collection(SHOP_COLLECTION).doc(docId).set({
        ...payload,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return respond(res, 200, { id: docId });
    }

    if (req.method === 'PATCH') {
      const { id, active } = req.body || {};
      if (!id) {
        return respond(res, 400, { error: 'Missing item id.' });
      }

      await adminFirestore.collection(SHOP_COLLECTION).doc(id).set({
        active: !!active,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return respond(res, 200, { id, active: !!active });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return respond(res, 400, { error: 'Missing item id.' });
      }

      await adminFirestore.collection(SHOP_COLLECTION).doc(id).delete();
      return respond(res, 200, { id });
    }

    return respond(res, 405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Failed to manage global shop item:', error);
    return respond(res, 500, { error: error.message || 'Internal server error' });
  }
}
