// components/games/shared/kickPlayer.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared "host can remove a player" building block used by every multiplayer
// game that has a real host concept (Chess, UNO, Battleships, Tic Tac Toe,
// Sketch & Guess, Bluff Battle, Werewolf, Word Imposter, Word Agents, Math
// Grand Prix).
//
// Pattern used consistently across all of them:
//   1. The host calls `kickPlayer({ database, roomPath, targetId, targetName,
//      hostName, extraUpdates })`. `extraUpdates` is where each game's own
//      turn-order/vote/role cleanup gets merged in — see each game file for
//      what it passes.
//   2. This writes a `kicked/{targetId}` marker (so the removed player's own
//      client can show a friendly message instead of just going dark) and
//      deletes their `players/{targetId}` node, atomically with whatever
//      game-specific fields the caller passed in.
//   3. Every game also mounts `useKickWatcher(...)` (or the equivalent
//      inline effect) so a removed player notices `kicked/{myId}` appearing
//      and exits gracefully instead of sitting in a broken game.
//
// Nothing here is enforced server-side (these rooms use the same open RTDB
// rules as the rest of the app's realtime games) — this is a courtesy/UX
// mechanism for a teacher-run classroom, not a security boundary.
// ─────────────────────────────────────────────────────────────────────────────
import React from 'react';
import { ref, update, onValue } from 'firebase/database';

/**
 * Host-side: remove a player from a room, optionally merging in extra
 * game-specific updates (turn order splice, vote recount, etc.) in the same
 * atomic RTDB write.
 *
 * @param {object} database - the Firebase Realtime Database instance
 * @param {string} roomPath - e.g. `uno/${roomCode}` or `chess/${roomCode}`
 * @param {string} targetId - id of the player being removed
 * @param {string} [targetName] - display name, stored on the kicked marker
 * @param {string} [hostName] - the host's display name, shown to the removed player
 * @param {object} [extraUpdates] - additional `{ path: value }` pairs merged
 *   into the same `update()` call, relative to the database root (use full
 *   paths like `${roomPath}/playerOrder`, not relative ones)
 */
export async function kickPlayer({ database, roomPath, targetId, targetName, hostName, extraUpdates = {} }) {
  if (!database || !roomPath || !targetId) return;
  const updates = {
    [`${roomPath}/kicked/${targetId}`]: { at: Date.now(), by: hostName || 'the host', name: targetName || null },
    [`${roomPath}/players/${targetId}`]: null,
    ...extraUpdates,
  };
  await update(ref(database), updates);
}

/**
 * Player-side: watch for my own kick marker appearing and fire a callback
 * when it does. Returns an unsubscribe function — call it on unmount/leave.
 *
 * @param {object} database
 * @param {string} roomPath
 * @param {string} myId
 * @param {(info: {at: number, by: string, name: string|null}) => void} onKicked
 */
export function watchForKick(database, roomPath, myId, onKicked) {
  if (!database || !roomPath || !myId) return () => {};
  const kickedRef = ref(database, `${roomPath}/kicked/${myId}`);
  return onValue(kickedRef, (snap) => {
    if (snap.exists()) onKicked?.(snap.val());
  });
}

/**
 * Small, consistent kick button — drop next to a player's name/avatar in any
 * host-visible player list. Callers are responsible for only rendering this
 * when `isHost && player.id !== myId`.
 */
export const KickButton = ({ onClick, name = 'this player', className = '' }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    title={`Remove ${name} from the game`}
    aria-label={`Remove ${name} from the game`}
    className={`inline-flex items-center justify-center text-red-300 hover:text-white hover:bg-red-600/80 bg-red-900/40 border border-red-500/40 rounded-full w-5 h-5 text-xs leading-none transition-colors ${className}`}
  >
    ✕
  </button>
);

/**
 * Confirmation dialog for kicking — small, reusable so every game gets the
 * same "are you sure?" step instead of an instant, accidental-click-prone
 * removal.
 */
export const KickConfirmModal = ({ playerName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-6 max-w-xs w-full text-center text-white shadow-2xl">
      <div className="text-4xl mb-3">🚫</div>
      <div className="font-bold mb-1">Remove {playerName}?</div>
      <p className="text-white/60 text-sm mb-5">They&apos;ll be taken out of the game right away and shown a message that the host removed them.</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 bg-white/10 hover:bg-white/20 py-2.5 rounded-xl font-semibold">Cancel</button>
        <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 py-2.5 rounded-xl font-bold">Remove</button>
      </div>
    </div>
  </div>
);
