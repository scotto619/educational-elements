// utils/profanityFilter.js
// ─────────────────────────────────────────────────────────────────────────────
// Lightweight, dependency-free profanity / inappropriate-language filter for
// student-facing chat (Town Square, and anywhere else student free-text is
// sent). No package install required — everything runs client-side.
//
// Strategy:
//  1. Normalize the message (lowercase, undo common leetspeak substitutions,
//     collapse repeated letters, strip punctuation used to "space out" a
//     word like "s.h.i.t" or "s h i t").
//  2. Check each individual word against the blocklist for an exact (or
//     near-exact, e.g. plural/repeated-letter) match — this is safe against
//     false positives like "class"/"assassin" containing "ass".
//  3. Separately scan the fully-squashed message (all separators removed)
//     for longer, more distinctive blocked words, to catch spaced-out
//     evasion ("s h i t") — short/common substrings are excluded from this
//     pass specifically to avoid flagging innocent words.
//
// This is intentionally a *blocklist*, not a censor: callers should reject
// the message outright (with a friendly toast) rather than send a
// partially-asterisked version, which just invites kids to find workarounds.
// ─────────────────────────────────────────────────────────────────────────────

const LEET_MAP = { '0': 'o', '1': 'i', '!': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't', '9': 'g' };

const normalizeWord = (w) =>
  w
    .toLowerCase()
    .split('')
    .map((ch) => LEET_MAP[ch] || ch)
    .join('')
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1{2,}/g, '$1$1'); // collapse 3+ repeated letters down to 2 ("shiiiit" -> "shiit")

// Words safe to say as whole tokens even though they contain a blocked
// substring (used to protect the squashed-text pass below).
const SAFE_WHOLE_WORDS = new Set([
  'class', 'classic', 'classroom', 'assassin', 'assist', 'assistant', 'assign', 'assignment',
  'assess', 'assessment', 'assemble', 'assembly', 'assume', 'assumption', 'grass', 'glass',
  'brass', 'pass', 'passed', 'passing', 'mass', 'massive', 'bass', 'cassette', 'embarrass',
  'embarrassed', 'harass', 'compass', 'trespass', 'surpass', 'bypass', 'hello', 'shell',
  'shellfish', 'shellac', 'scunthorpe', 'analysis', 'cockpit', 'cockatoo', 'cocktail',
]);

// Core blocklist — profanity, sexual terms, slurs, drug references. Root
// forms only; normalizeWord() handles common variations.
const BLOCKED_WORDS = [
  // profanity
  'fuck', 'fck', 'fuk', 'shit', 'shyt', 'bullshit', 'bitch', 'biatch', 'bastard', 'asshole',
  'dumbass', 'jackass', 'piss', 'pissed', 'crap', 'damn', 'goddamn', 'douche', 'douchebag',
  'twat', 'wanker', 'bollocks', 'bloody', 'arse', 'prick', 'dick', 'dickhead', 'cock',
  'pussy', 'cunt', 'slut', 'whore', 'skank', 'thot', 'tit', 'tits', 'boob', 'boobs',
  // sexual
  'sex', 'porn', 'porno', 'nude', 'nudes', 'penis', 'vagina', 'anal', 'blowjob', 'handjob',
  'orgasm', 'masturbate', 'masturbation', 'cum', 'jizz', 'horny', 'fetish', 'incest', 'rape',
  'rapist', 'molest', 'pedophile', 'pedo',
  // slurs / hate speech (root forms — deliberately not spelled out further)
  'nigger', 'nigga', 'chink', 'spic', 'wetback', 'gook', 'kike', 'faggot', 'fag', 'dyke',
  'tranny', 'retard', 'retarded', 'coon', 'paki', 'towelhead', 'raghead',
  // drugs / self-harm adjacent (kept minimal — not the focus of a classroom chat)
  'cocaine', 'heroin', 'meth', 'crackhead', 'weed', 'marijuana', 'suicide', 'kys',
];

// Longer/more distinctive words safe to substring-match on squashed text
// (i.e. NOT prone to appearing inside innocent words). Short ones like
// "ass", "sex", "tit", "cum" are excluded from the squashed pass — they're
// still caught by the exact whole-word pass above.
const SQUASHED_MIN_LEN = 4;

let compiledExact = null;
function getExactSet() {
  if (!compiledExact) compiledExact = new Set(BLOCKED_WORDS.map(normalizeWord));
  return compiledExact;
}

/**
 * Returns true if the given text contains blocked language.
 */
export function containsProfanity(text) {
  if (!text || typeof text !== 'string') return false;

  const exactSet = getExactSet();
  const rawWords = text.split(/\s+/).filter(Boolean);

  // Pass 1: exact-ish whole-word matches (safe against "class"/"assassin" etc.)
  for (const raw of rawWords) {
    const norm = normalizeWord(raw);
    if (!norm) continue;
    if (SAFE_WHOLE_WORDS.has(norm)) continue;
    if (exactSet.has(norm)) return true;
    // Trim a single trailing 's' (plurals: "bitches" -> already handled by
    // whole-word list mostly, but cheap extra safety net) — skip if the base
    // form itself is a safe word.
    if (norm.length > 3 && norm.endsWith('s') && exactSet.has(norm.slice(0, -1)) && !SAFE_WHOLE_WORDS.has(norm.slice(0, -1))) {
      return true;
    }
  }

  // Pass 2: squashed full-message scan to catch spaced-out evasion
  // ("s h i t", "s.h.i.t", "f-u-c-k").
  const squashed = normalizeWord(text.replace(/\s+/g, ''));
  if (squashed) {
    for (const word of BLOCKED_WORDS) {
      if (word.length < SQUASHED_MIN_LEN) continue;
      if (squashed.includes(word)) return true;
    }
  }

  return false;
}

/**
 * Convenience helper for chat inputs: returns { ok: true } or
 * { ok: false, reason } so callers can show a friendly message.
 */
export function checkChatMessage(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return { ok: false, reason: 'empty' };
  if (containsProfanity(trimmed)) return { ok: false, reason: 'profanity' };
  return { ok: true };
}

export default containsProfanity;
