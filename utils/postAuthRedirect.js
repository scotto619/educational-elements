// utils/postAuthRedirect.js
// Remembers where a logged-out visitor was trying to go (e.g. a shared resource
// link from Facebook/Instagram) so we can send them there after login/signup —
// even after the round trip through Stripe checkout.

const KEY = 'postAuthRedirect';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Only allow same-site paths like "/curriculum?link=..." (never external URLs)
const isSafePath = (path) =>
    typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

export const saveRedirect = (path) => {
    try {
        if (isSafePath(path)) {
            localStorage.setItem(KEY, JSON.stringify({ path, ts: Date.now() }));
        }
    } catch (e) { /* storage unavailable — ignore */ }
};

// Returns the saved path (and clears it), or null if none/expired/invalid.
export const consumeRedirect = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        localStorage.removeItem(KEY);
        const { path, ts } = JSON.parse(raw);
        if (!isSafePath(path)) return null;
        if (!ts || Date.now() - ts > MAX_AGE_MS) return null;
        return path;
    } catch (e) {
        return null;
    }
};
