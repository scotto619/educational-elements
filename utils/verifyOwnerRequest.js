import { adminAuth } from './firebase-admin';
import { OWNER_EMAILS } from './ownerEmails';

const formatUnauthorizedError = (message, status = 401) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const verifyOwnerRequest = async (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw formatUnauthorizedError('Missing Authorization header', 401);
  }

  const token = authHeader.slice(7);
  let decoded;

  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('❌ Failed to verify admin token:', error);
    throw formatUnauthorizedError('Invalid or expired token', 401);
  }

  const email = decoded.email?.toLowerCase();
  if (!email) {
    throw formatUnauthorizedError('Authenticated user is missing an email address', 403);
  }

  if (OWNER_EMAILS.length > 0 && !OWNER_EMAILS.includes(email)) {
    throw formatUnauthorizedError('User is not authorized to access admin tools', 403);
  }

  return { uid: decoded.uid, email };
};

export default verifyOwnerRequest;
