// components/quizshow/shared/Reactions.js
// Live emoji reactions — students fire emojis from their devices and they
// float up on the teacher's projected screen (and in the lobby).
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { REACTION_EMOJIS } from '../../../utils/quizShowHelpers';

// ────────────────────────────────────────────────────────────────
// ReactionOverlay — mount on any screen that should DISPLAY reactions.
// Watches gameData.reactions ({playerId: {emoji, name, at}}) and floats
// new ones up the screen.
// ────────────────────────────────────────────────────────────────
export const ReactionOverlay = ({ reactions, showNames = true }) => {
  const [floaters, setFloaters] = useState([]);
  const seenRef = useRef({});
  const idRef = useRef(0);

  useEffect(() => {
    if (!reactions) return;
    const fresh = [];
    Object.entries(reactions).forEach(([playerId, r]) => {
      if (!r?.emoji || !r?.at) return;
      if (seenRef.current[playerId] === r.at) return;
      // Skip stale reactions on first mount (older than 5s)
      const isFirstSight = !(playerId in seenRef.current);
      seenRef.current[playerId] = r.at;
      if (isFirstSight && Date.now() - r.at > 5000) return;
      fresh.push({ id: `f_${idRef.current++}`, emoji: r.emoji, name: r.name || '', left: 8 + Math.random() * 84 });
    });
    if (fresh.length) {
      setFloaters(prev => [...prev.slice(-30), ...fresh]);
      fresh.forEach(f => {
        setTimeout(() => {
          setFloaters(prev => prev.filter(x => x.id !== f.id));
        }, 3600);
      });
    }
  }, [reactions]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      <style>{`
        @keyframes qsFloatUp {
          0%   { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; transform: translateY(-6vh) scale(1.15) rotate(-6deg); }
          80%  { opacity: 1; }
          100% { transform: translateY(-70vh) scale(1) rotate(8deg); opacity: 0; }
        }
      `}</style>
      {floaters.map(f => (
        <div
          key={f.id}
          className="absolute bottom-10 flex flex-col items-center"
          style={{ left: `${f.left}%`, animation: 'qsFloatUp 3.5s ease-out forwards' }}
        >
          <span className="text-4xl md:text-5xl drop-shadow-lg">{f.emoji}</span>
          {showNames && f.name && (
            <span className="mt-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white">
              {f.name}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// ReactionBar — mount on STUDENT screens. Fires the player's reaction
// to gameRooms/{roomCode}/reactions/{playerId} (one slot per player,
// throttled, so the database never grows unbounded).
// ────────────────────────────────────────────────────────────────
export const ReactionBar = ({ roomCode, playerInfo, compact = false }) => {
  const [cooldown, setCooldown] = useState(false);
  const [lastSent, setLastSent] = useState(null);

  const sendReaction = useCallback(async (emoji) => {
    if (cooldown || !roomCode || !playerInfo?.playerId) return;
    setCooldown(true);
    setLastSent(emoji);
    try {
      await set(ref(database, `gameRooms/${roomCode}/reactions/${playerInfo.playerId}`), {
        emoji,
        name: playerInfo.name || '',
        at: Date.now(),
      });
    } catch (e) {
      // non-fatal
    }
    setTimeout(() => setCooldown(false), 1200);
    setTimeout(() => setLastSent(null), 1200);
  }, [cooldown, roomCode, playerInfo]);

  return (
    <div className={`flex items-center justify-center gap-1.5 ${compact ? '' : 'flex-wrap'}`}>
      {REACTION_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          disabled={cooldown}
          className={`rounded-xl bg-white/10 border border-white/15 transition-all active:scale-90 hover:bg-white/20 hover:-translate-y-0.5 ${
            compact ? 'px-2 py-1 text-lg' : 'px-3 py-2 text-2xl'
          } ${cooldown && lastSent === emoji ? 'scale-125 bg-white/30' : ''} ${cooldown && lastSent !== emoji ? 'opacity-40' : ''}`}
          aria-label={`React with ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default ReactionOverlay;
