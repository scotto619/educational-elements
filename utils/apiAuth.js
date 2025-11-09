import { adminAuth } from './firebase-admin';
import { isOwnerEmail } from './ownerEmails';

const parseTokenFromRequest = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
};

export const requireOwner = async (req) => {
  const token = parseTokenFromRequest(req);

  if (!token) {
    const error = new Error('Missing authentication token');
    error.status = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (err) {
    const error = new Error('Invalid authentication token');
    error.status = 401;
    throw error;
  }

  if (!isOwnerEmail(decoded.email)) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  return decoded;
};
