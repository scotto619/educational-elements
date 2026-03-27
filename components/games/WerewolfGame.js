// components/games/WerewolfGame.js - One Night Ultimate Werewolf
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Role Definitions ─────────────────────────────────────────────────────────
const ROLES = {
  // ── Base Game ──────────────────────────────────────────────────────────────
  werewolf: {
    name: 'Werewolf', team: 'werewolves', expansion: 'Base Game',
    description: 'You are a Werewolf! Work with your pack to avoid being caught.',
    nightAction: 'Wake up and see fellow werewolves. If alone (lone wolf), peek at one center card.',
    winCondition: 'Win if no werewolf is eliminated.',
    icon: '🐺', bg: 'from-red-800 to-red-950', border: 'border-red-600', text: 'text-red-100', badge: 'bg-red-700', priority: 3, hasAction: true
  },
  minion: {
    name: 'Minion', team: 'werewolves', expansion: 'Base Game',
    description: 'You serve the Werewolves and share their victory — even if you are eliminated!',
    nightAction: 'Wake up and see who the werewolves are. They do NOT see you.',
    winCondition: 'Win with the werewolves. Even if you die, you win if they win.',
    icon: '😈', bg: 'from-red-600 to-rose-900', border: 'border-rose-500', text: 'text-rose-100', badge: 'bg-rose-700', priority: 4, hasAction: true
  },
  seer: {
    name: 'Seer', team: 'villagers', expansion: 'Base Game',
    description: 'You can glimpse one truth in the night. Use your vision wisely in discussion.',
    nightAction: 'Look at ONE other player\'s card, OR look at TWO center cards.',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '👁️', bg: 'from-blue-600 to-blue-900', border: 'border-blue-400', text: 'text-blue-100', badge: 'bg-blue-700', priority: 5, hasAction: true
  },
  robber: {
    name: 'Robber', team: 'villagers', expansion: 'Base Game',
    description: 'Steal a role from another player, look at your new card, and play as that role!',
    nightAction: 'Swap your card with another player\'s card. Look at your new role.',
    winCondition: 'Win with your new team (whatever role you stole).',
    icon: '🦹', bg: 'from-purple-600 to-purple-900', border: 'border-purple-400', text: 'text-purple-100', badge: 'bg-purple-700', priority: 11, hasAction: true
  },
  troublemaker: {
    name: 'Troublemaker', team: 'villagers', expansion: 'Base Game',
    description: 'Swap two other players\' cards without looking. Cause chaos and confusion!',
    nightAction: 'Pick two other players and swap their cards (you don\'t see the roles).',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🔀', bg: 'from-yellow-600 to-amber-900', border: 'border-yellow-400', text: 'text-yellow-100', badge: 'bg-yellow-700', priority: 12, hasAction: true
  },
  drunk: {
    name: 'Drunk', team: 'villagers', expansion: 'Base Game',
    description: 'You\'re too drunk to know your own role. You swap with a mystery center card and have no idea what you are!',
    nightAction: 'Pick a center card to take. Your card goes to center. You don\'t see your new role.',
    winCondition: 'Win with your new team (whatever card you unknowingly took).',
    icon: '🍺', bg: 'from-orange-600 to-amber-800', border: 'border-orange-400', text: 'text-orange-100', badge: 'bg-orange-700', priority: 13, hasAction: true
  },
  insomniac: {
    name: 'Insomniac', team: 'villagers', expansion: 'Base Game',
    description: 'You can\'t sleep. At the end of the night you check your card — it may have changed!',
    nightAction: 'Look at your own card at the END of the night (it may have been swapped).',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '😴', bg: 'from-indigo-600 to-indigo-900', border: 'border-indigo-400', text: 'text-indigo-100', badge: 'bg-indigo-700', priority: 14, hasAction: true
  },
  villager: {
    name: 'Villager', team: 'villagers', expansion: 'Base Game',
    description: 'A simple Villager with no special powers. Trust your instincts and deduce who the werewolf is!',
    nightAction: null,
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '👤', bg: 'from-green-600 to-green-900', border: 'border-green-400', text: 'text-green-100', badge: 'bg-green-700', priority: 99, hasAction: false
  },
  hunter: {
    name: 'Hunter', team: 'villagers', expansion: 'Base Game',
    description: 'If you are eliminated, the player you voted for is also eliminated. Use your vote carefully!',
    nightAction: null,
    winCondition: 'Win with village. If eliminated, drag your vote target down with you.',
    icon: '🏹', bg: 'from-teal-600 to-teal-900', border: 'border-teal-400', text: 'text-teal-100', badge: 'bg-teal-700', priority: 99, hasAction: false
  },
  tanner: {
    name: 'Tanner', team: 'tanner', expansion: 'Base Game',
    description: 'You WANT to be eliminated! Your goal is to trick the village into voting you out.',
    nightAction: null,
    winCondition: 'WIN by being eliminated! Get the most votes against you.',
    icon: '😅', bg: 'from-gray-600 to-gray-900', border: 'border-gray-400', text: 'text-gray-100', badge: 'bg-gray-700', priority: 99, hasAction: false
  },
  mason: {
    name: 'Mason', team: 'villagers', expansion: 'Base Game',
    description: 'Part of a secret brotherhood. You and the other Masons wake up and recognize each other — total trust!',
    nightAction: 'Wake up and see the other Masons. If alone, you know no other Mason is in play.',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🤝', bg: 'from-stone-600 to-stone-900', border: 'border-stone-400', text: 'text-stone-100', badge: 'bg-stone-700', priority: 99, hasAction: true
  },

  // ── Daybreak Expansion ─────────────────────────────────────────────────────
  mysticWolf: {
    name: 'Mystic Wolf', team: 'werewolves', expansion: 'Daybreak',
    description: 'A werewolf with mystic sight. You wake with your pack AND secretly peek at one player\'s card.',
    nightAction: 'Wake with werewolves (see your pack). Then look at ONE other player\'s card.',
    winCondition: 'Win with the werewolves if no werewolf is eliminated.',
    icon: '🔮', bg: 'from-red-700 to-violet-900', border: 'border-violet-500', text: 'text-violet-100', badge: 'bg-violet-800', priority: 3, hasAction: true
  },
  dreamWolf: {
    name: 'Dream Wolf', team: 'werewolves', expansion: 'Daybreak',
    description: 'A werewolf who sleeps through the night. Other wolves don\'t know you exist — you are a hidden threat!',
    nightAction: null,
    winCondition: 'Win with the werewolves if no werewolf is eliminated.',
    icon: '🌙', bg: 'from-slate-700 to-red-900', border: 'border-slate-500', text: 'text-slate-100', badge: 'bg-slate-700', priority: 99, hasAction: false
  },
  alphaWolf: {
    name: 'Alpha Wolf', team: 'werewolves', expansion: 'Daybreak',
    description: 'The pack leader. You wake with your pack and can secretly replace a player with a hidden wolf from the center!',
    nightAction: 'Wake with werewolves. Then look at center cards. If a wolf card is there, swap it with any player\'s card.',
    winCondition: 'Win with the werewolves if no werewolf is eliminated.',
    icon: '⚔️', bg: 'from-red-900 to-red-950', border: 'border-red-400', text: 'text-red-100', badge: 'bg-red-800', priority: 2, hasAction: true
  },
  apprenticeSeer: {
    name: 'Apprentice Seer', team: 'villagers', expansion: 'Daybreak',
    description: 'Learning the craft. Not as powerful as the Seer — you can only peek at one center card.',
    nightAction: 'Look at ONE center card.',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🔭', bg: 'from-cyan-600 to-blue-900', border: 'border-cyan-400', text: 'text-cyan-100', badge: 'bg-cyan-700', priority: 6, hasAction: true
  },
  pi: {
    name: 'Paranormal Investigator', team: 'villagers', expansion: 'Daybreak',
    description: 'An investigator chasing the supernatural. Peek at player cards one by one — but stop if you find evil!',
    nightAction: 'Look at one player\'s card. If it\'s a village role, you MAY look at one more. Stop if you find a non-village role.',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🔍', bg: 'from-emerald-600 to-teal-900', border: 'border-emerald-400', text: 'text-emerald-100', badge: 'bg-emerald-700', priority: 7, hasAction: true
  },
  witch: {
    name: 'Witch', team: 'villagers', expansion: 'Daybreak',
    description: 'A powerful potion-brewer. You peek at a center card and may brew a swap with any player.',
    nightAction: 'Look at ONE center card. You may then swap it with any player\'s card (including yourself).',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🧙', bg: 'from-fuchsia-700 to-purple-950', border: 'border-fuchsia-500', text: 'text-fuchsia-100', badge: 'bg-fuchsia-800', priority: 8, hasAction: true
  },
  revealer: {
    name: 'Revealer', team: 'villagers', expansion: 'Daybreak',
    description: 'You can expose a player\'s card. If it\'s evil it goes back face-down (only you know). If it\'s village, everyone learns the truth!',
    nightAction: 'Flip a player\'s card face-up. If they\'re a werewolf or tanner, their card goes back face-down.',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '📢', bg: 'from-lime-600 to-green-900', border: 'border-lime-400', text: 'text-lime-100', badge: 'bg-lime-700', priority: 9, hasAction: true
  },
  villageIdiot: {
    name: 'Village Idiot', team: 'villagers', expansion: 'Daybreak',
    description: 'Your bumbling chaos actually helps! You rotate ALL other players\' cards in one direction during the night.',
    nightAction: 'Choose a direction: shift ALL other players\' cards LEFT or RIGHT (their roles rotate around).',
    winCondition: 'Win with the village if a werewolf is eliminated.',
    icon: '🤪', bg: 'from-pink-600 to-rose-900', border: 'border-pink-400', text: 'text-pink-100', badge: 'bg-pink-700', priority: 10, hasAction: true
  },
};

// Roles that count as "actual werewolf" for win condition
const WEREWOLF_ROLES = new Set(['werewolf', 'mysticWolf', 'alphaWolf', 'dreamWolf']);

const NIGHT_ORDER = [
  'alphaWolf', 'mysticWolf', 'werewolf',
  'minion', 'mason',
  'seer', 'apprenticeSeer', 'pi', 'witch', 'revealer', 'villageIdiot',
  'robber', 'troublemaker', 'drunk', 'insomniac'
];

const ROLE_DESCRIPTIONS = {
  werewolves: 'Werewolf Team 🐺',
  villagers: 'Village Team 🏘️',
  tanner: 'Solo — Tanner 😅'
};

const EXPANSION_COLORS = {
  'Base Game': 'text-blue-300 bg-blue-900/40 border-blue-700',
  'Daybreak': 'text-orange-300 bg-orange-900/40 border-orange-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function resolveNightActions(originalRoles, centerCards, nightActions) {
  const finalRoles = { ...originalRoles };
  const finalCenter = [...centerCards];
  const na = nightActions || {};

  // Night actions stored keyed by player ID — find each by the 'role' field
  const findAction = (roleName) => Object.values(na).find(a => a?.role === roleName);

  // 1. Alpha Wolf: swap a center wolf card into a player
  const alphaWolfAction = findAction('alphaWolf');
  if (alphaWolfAction && !alphaWolfAction.noWolf && alphaWolfAction.targetId && alphaWolfAction.centerIndex !== undefined) {
    const { targetId, centerIndex } = alphaWolfAction;
    if (finalRoles[targetId] !== undefined && finalCenter[centerIndex] !== undefined) {
      const tmp = finalRoles[targetId];
      finalRoles[targetId] = finalCenter[centerIndex];
      finalCenter[centerIndex] = tmp;
    }
  }

  // 2. Robber
  const robberAction = findAction('robber');
  if (robberAction) {
    const { actorId, targetId } = robberAction;
    if (actorId && targetId && finalRoles[actorId] !== undefined && finalRoles[targetId] !== undefined) {
      const tmp = finalRoles[actorId];
      finalRoles[actorId] = finalRoles[targetId];
      finalRoles[targetId] = tmp;
    }
  }

  // 3. Troublemaker
  const troublemakerAction = findAction('troublemaker');
  if (troublemakerAction) {
    const { target1Id, target2Id } = troublemakerAction;
    if (target1Id && target2Id && finalRoles[target1Id] !== undefined && finalRoles[target2Id] !== undefined) {
      const tmp = finalRoles[target1Id];
      finalRoles[target1Id] = finalRoles[target2Id];
      finalRoles[target2Id] = tmp;
    }
  }

  // 4. Village Idiot: rotate all other players' roles
  const villageIdiotAction = findAction('villageIdiot');
  if (villageIdiotAction && villageIdiotAction.playerOrder && villageIdiotAction.playerOrder.length > 1) {
    const { direction, playerOrder } = villageIdiotAction;
    const roles = playerOrder.map(id => finalRoles[id]);
    const shifted = direction === 'left'
      ? [...roles.slice(1), roles[0]]
      : [roles[roles.length - 1], ...roles.slice(0, -1)];
    playerOrder.forEach((id, i) => { finalRoles[id] = shifted[i]; });
  }

  // 5. Witch: optionally swap a center card with a player
  const witchAction = findAction('witch');
  if (witchAction && witchAction.swapTargetId) {
    const { centerIndex, swapTargetId } = witchAction;
    if (finalRoles[swapTargetId] !== undefined && finalCenter[centerIndex] !== undefined) {
      const tmp = finalRoles[swapTargetId];
      finalRoles[swapTargetId] = finalCenter[centerIndex];
      finalCenter[centerIndex] = tmp;
    }
  }

  // 6. Drunk
  const drunkAction = findAction('drunk');
  if (drunkAction) {
    const { actorId, centerIndex } = drunkAction;
    if (actorId !== undefined && centerIndex !== undefined && finalRoles[actorId] !== undefined) {
      const tmp = finalRoles[actorId];
      finalRoles[actorId] = finalCenter[centerIndex];
      finalCenter[centerIndex] = tmp;
    }
  }

  return { finalRoles, finalCenter };
}

function determineWinner(finalRoles, votes, playerIds) {
  const voteCounts = {};
  playerIds.forEach(id => { voteCounts[id] = 0; });
  Object.entries(votes || {}).forEach(([, targetId]) => {
    if (voteCounts[targetId] !== undefined) voteCounts[targetId]++;
  });

  const maxVotes = Math.max(...Object.values(voteCounts), 0);
  let eliminated = playerIds.filter(id => voteCounts[id] === maxVotes && maxVotes > 0);

  // All tied with 1 vote each and 3+ players = no elimination
  if (eliminated.length === playerIds.length && maxVotes === 1 && playerIds.length >= 3) {
    eliminated = [];
  }

  // Hunter: also eliminate who they voted for
  const hunterElimId = eliminated.find(id => finalRoles[id] === 'hunter');
  if (hunterElimId) {
    const hunterTarget = votes[hunterElimId];
    if (hunterTarget && !eliminated.includes(hunterTarget)) {
      eliminated.push(hunterTarget);
    }
  }

  // Tanner wins if eliminated
  const tannerElim = eliminated.some(id => finalRoles[id] === 'tanner');
  if (tannerElim) return { winner: 'tanner', eliminated };

  const hasRealWerewolf = playerIds.some(id => WEREWOLF_ROLES.has(finalRoles[id]));
  const werewolfEliminated = eliminated.some(id => WEREWOLF_ROLES.has(finalRoles[id]));

  if (!hasRealWerewolf) {
    // No werewolves in play: villagers win only if no one is eliminated
    return eliminated.length === 0
      ? { winner: 'villagers', eliminated }
      : { winner: 'werewolves', eliminated };
  }

  return werewolfEliminated
    ? { winner: 'villagers', eliminated }
    : { winner: 'werewolves', eliminated };
}

// ─── Sub Components ───────────────────────────────────────────────────────────
const RoleCard = ({ role, large, flipped, onClick, glow }) => {
  const r = ROLES[role];
  if (!r) return null;
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      className={`
        bg-gradient-to-br ${r.bg} ${r.border} border-2 rounded-2xl
        flex flex-col items-center justify-center select-none
        ${large ? 'w-40 h-56 p-4' : 'w-24 h-32 p-2'}
        ${onClick ? 'cursor-pointer' : ''}
        ${glow ? 'ring-4 ring-yellow-400 ring-opacity-80 shadow-yellow-400/50 shadow-lg' : 'shadow-lg'}
        relative overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-black/20 rounded-2xl" />
      <span className={large ? 'text-5xl relative z-10' : 'text-3xl relative z-10'}>{r.icon}</span>
      <p className={`font-bold mt-2 relative z-10 text-center ${r.text} ${large ? 'text-lg' : 'text-xs'}`}>
        {r.name}
      </p>
      {large && (
        <p className={`text-xs mt-1 text-center ${r.text} opacity-80 relative z-10`}>
          {ROLE_DESCRIPTIONS[r.team]}
        </p>
      )}
    </motion.div>
  );
};

const PlayerChip = ({ player, isMe, isSelected, onClick, showRole, finalRole, eliminated }) => {
  const role = showRole && finalRole ? ROLES[finalRole] : null;
  return (
    <motion.button
      onClick={onClick}
      disabled={!onClick}
      whileHover={onClick ? { scale: 1.04 } : {}}
      whileTap={onClick ? { scale: 0.96 } : {}}
      className={`
        relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
        ${isSelected ? 'border-yellow-400 bg-yellow-400/20 shadow-yellow-400/40 shadow-lg' : 'border-white/20 bg-white/10'}
        ${eliminated ? 'opacity-50' : ''}
        ${onClick ? 'cursor-pointer hover:border-white/40' : 'cursor-default'}
        min-w-[80px]
      `}
    >
      {eliminated && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-2xl">💀</span>
        </div>
      )}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm
        ${role ? `bg-gradient-to-br ${role.bg}` : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
        {role ? role.icon : player.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <p className={`text-xs font-semibold text-center leading-tight ${isMe ? 'text-yellow-300' : 'text-white/90'}`}>
        {player.name}{isMe ? ' (You)' : ''}
      </p>
      {showRole && finalRole && (
        <p className={`text-xs ${role?.text || 'text-white/70'}`}>{role?.name}</p>
      )}
    </motion.button>
  );
};

const PhaseTimer = ({ endTime, paused, pausedRemaining, onExpire }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (paused) {
      setRemaining(Math.ceil((pausedRemaining || 0) / 1000));
      return;
    }
    const tick = () => {
      const secs = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTime, paused, pausedRemaining, onExpire]);

  const urgent = !paused && remaining <= 10;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className={`text-3xl font-black tabular-nums ${paused ? 'text-yellow-400' : urgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
        {paused ? '⏸' : ''}{remaining}s
      </p>
    </div>
  );
};

// ─── Role Info Modal (standalone, used in lobby) ──────────────────────────────
const RoleInfoCard = ({ roleId, onClose }) => {
  const r = ROLES[roleId];
  if (!r) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`bg-gradient-to-br ${r.bg} border-2 ${r.border} rounded-3xl p-6 max-w-sm w-full shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{r.icon}</div>
          <h2 className="text-2xl font-black text-white">{r.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${EXPANSION_COLORS[r.expansion] || 'text-white/60 bg-white/10 border-white/20'}`}>{r.expansion}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.badge} text-white font-semibold`}>{ROLE_DESCRIPTIONS[r.team] || r.team}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Description</p>
            <p className={`${r.text} text-sm leading-relaxed`}>{r.description}</p>
          </div>
          {r.nightAction && (
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">🌙 Night Action</p>
              <p className={`${r.text} text-sm`}>{r.nightAction}</p>
            </div>
          )}
          {r.winCondition && (
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">🏆 Win Condition</p>
              <p className={`${r.text} text-sm`}>{r.winCondition}</p>
            </div>
          )}
        </div>
        <button onClick={onClose} className="mt-4 w-full bg-black/30 hover:bg-black/50 text-white/70 hover:text-white font-bold py-2 rounded-xl transition-all text-sm">Close</button>
      </motion.div>
    </motion.div>
  );
};

// ─── Role Guide (all roles) ───────────────────────────────────────────────────
const RoleGuide = ({ onClose, onSelectRole }) => {
  const expansions = ['Base Game', 'Daybreak'];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-4"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 py-3 -mx-4 px-4 backdrop-blur-sm">
          <h2 className="text-2xl font-black text-white">📖 Role Guide</h2>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all">✕ Close</button>
        </div>
        {expansions.map(exp => (
          <div key={exp} className="mb-6">
            <div className={`inline-block text-xs px-3 py-1 rounded-full border font-bold mb-3 ${EXPANSION_COLORS[exp] || 'text-white/60 bg-white/10 border-white/20'}`}>{exp}</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ROLES).filter(([, r]) => r.expansion === exp).map(([id, r]) => (
                <button
                  key={id}
                  onClick={() => onSelectRole(id)}
                  className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${r.bg} border ${r.border} text-left hover:scale-[1.02] transition-all`}
                >
                  <span className="text-2xl flex-shrink-0">{r.icon}</span>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-sm truncate">{r.name}</p>
                    <p className={`text-xs ${r.text} opacity-70 truncate`}>{ROLE_DESCRIPTIONS[r.team] || r.team}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const NightRoleIndicator = ({ currentRole, nightStep }) => {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {NIGHT_ORDER.map((role, i) => {
        const r = ROLES[role];
        const isActive = i === nightStep;
        const isDone = i < nightStep;
        return (
          <div
            key={role}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all
              ${isActive ? `bg-gradient-to-r ${r.bg} text-white scale-110 shadow-lg` : ''}
              ${isDone ? 'bg-white/10 text-white/40 line-through' : ''}
              ${!isActive && !isDone ? 'bg-white/10 text-white/60' : ''}
            `}
          >
            <span>{r.icon}</span>
            <span>{r.name}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WerewolfGame = ({ studentData, showToast, updateStudentData, classData }) => {
  const [fb, setFb] = useState(null); // Firebase functions
  const [screen, setScreen] = useState('menu');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [myId] = useState(() => genId());
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [myOriginalRole, setMyOriginalRole] = useState(null);
  const [nightResult, setNightResult] = useState(null);
  const [nightActionDone, setNightActionDone] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [seerMode, setSeerMode] = useState(null);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [hostRolePool, setHostRolePool] = useState([
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'villager', 'villager'
  ]);
  const [gameResult, setGameResult] = useState(null);
  const [finalRolesComputed, setFinalRolesComputed] = useState(null);
  const [roleHidden, setRoleHidden] = useState(false);
  const [nightResultModal, setNightResultModal] = useState(null);
  const [roleInfoModal, setRoleInfoModal] = useState(null); // roleId to show info for
  const [showRoleGuide, setShowRoleGuide] = useState(false);
  // Multi-step night action state
  const [nightActionSubStep, setNightActionSubStep] = useState(null);
  const [witchPeekedCard, setWitchPeekedCard] = useState(null); // {index, role}
  const [piSeen, setPiSeen] = useState([]); // [{id, name, role}]

  const roomRef = useRef(null);
  const hostIntervalRef = useRef(null);
  const playerName = studentData?.firstName || studentData?.name || 'Player';

  // ── Dynamic Firebase init ────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, set, onValue, update, off, get, remove } = await import('firebase/database');
        setFb({ database, ref, set, onValue, update, off, get, remove });
      } catch (err) {
        console.error('Firebase load error:', err);
        showToast?.('Failed to load game engine', 'error');
      }
    };
    init();
  }, []);

  // ── Firebase: subscribe to room ──────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `werewolfRooms/${roomCode}`);
    roomRef.current = rRef;

    const unsub = fb.onValue(rRef, (snap) => {
      if (!snap.exists()) {
        if (screen !== 'menu') {
          showToast?.('Room no longer exists.', 'error');
          setScreen('menu');
        }
        return;
      }
      const data = snap.val();
      setRoomData(data);

      // Sync my role from Firebase
      if (data.players?.[myId]?.originalRole && !myOriginalRole) {
        setMyOriginalRole(data.players[myId].originalRole);
      }

      // Phase transitions
      if (data.phase === 'roleReveal' && screen === 'lobby') {
        setScreen('roleReveal');
        setShowRoleReveal(true);
      }
      if (data.phase === 'night' && (screen === 'lobby' || screen === 'roleReveal')) {
        setScreen('night');
        setNightActionDone(false);
        setNightResult(null);
      }
      if (data.phase === 'day' && screen === 'night') {
        setScreen('day');
      }
      if (data.phase === 'vote' && screen === 'day') {
        setScreen('vote');
      }
      if (data.phase === 'results' && screen === 'vote') {
        setScreen('results');
        // Compute final roles client-side
        const originalRoles = {};
        Object.entries(data.players || {}).forEach(([id, p]) => {
          originalRoles[id] = p.originalRole;
        });
        const { finalRoles } = resolveNightActions(
          originalRoles,
          data.centerCards || [],
          data.nightActions || {}
        );
        const playerIds = Object.keys(data.players || {});
        const result = determineWinner(finalRoles, data.votes || {}, playerIds);
        setFinalRolesComputed(finalRoles);
        setGameResult(result);
      }
    });

    return () => fb.off(rRef, 'value', unsub);
  }, [roomCode, screen, myId, myOriginalRole, fb]);

  // ── Host: drive night phase progression ──────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || roomData.phase !== 'night' || !fb) return;

    const STEP_DURATION = 25000;

    if (hostIntervalRef.current) clearInterval(hostIntervalRef.current);

    hostIntervalRef.current = setInterval(async () => {
      const snap = await fb.get(fb.ref(fb.database, `werewolfRooms/${roomCode}`));
      if (!snap.exists()) return;
      const data = snap.val();
      if (data.phase !== 'night') { clearInterval(hostIntervalRef.current); return; }

      const currentStep = data.nightStep ?? 0;
      const startTime = data.stepStartTime ?? Date.now();
      const elapsed = Date.now() - startTime;

      const currentRole = NIGHT_ORDER[currentStep];
      const playersWithRole = Object.entries(data.players || {})
        .filter(([, p]) => p.originalRole === currentRole)
        .map(([id]) => id);

      const allDone = playersWithRole.length === 0 ||
        playersWithRole.every(id => data.nightActions?.[id]?.done);

      if (allDone || elapsed >= STEP_DURATION) {
        const nextStep = currentStep + 1;
        if (nextStep >= NIGHT_ORDER.length) {
          clearInterval(hostIntervalRef.current);
          await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
            phase: 'day',
            dayEndTime: Date.now() + 120000,
          });
        } else {
          await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
            nightStep: nextStep,
            stepStartTime: Date.now(),
          });
        }
      }
    }, 2000);

    return () => clearInterval(hostIntervalRef.current);
  }, [isHost, roomData?.phase, roomData?.nightStep, roomCode, fb]);

  // ── Host: drive day → vote → results ─────────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || !fb) return;
    if (roomData.timerPaused) return; // paused — do nothing

    if (roomData.phase === 'day') {
      const dayEnd = roomData.dayEndTime;
      if (!dayEnd) return;
      const remaining = dayEnd - Date.now();
      if (remaining <= 0) {
        fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote', voteEndTime: Date.now() + 60000, timerPaused: false });
        return;
      }
      const tid = setTimeout(() => {
        fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote', voteEndTime: Date.now() + 60000, timerPaused: false });
      }, remaining);
      return () => clearTimeout(tid);
    }

    if (roomData.phase === 'vote') {
      const voteEnd = roomData.voteEndTime;
      if (!voteEnd) return;
      const remaining = voteEnd - Date.now();
      if (remaining <= 0) {
        fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'results' });
        return;
      }
      const tid = setTimeout(() => {
        fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'results' });
      }, remaining);
      return () => clearTimeout(tid);
    }
  }, [isHost, roomData?.phase, roomData?.dayEndTime, roomData?.voteEndTime, roomData?.timerPaused, roomCode, fb]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    if (!fb) { showToast?.('Game engine not ready yet, please try again.', 'error'); return; }
    const code = genRoomCode();
    setRoomCode(code);
    setIsHost(true);
    await fb.set(fb.ref(fb.database, `werewolfRooms/${code}`), {
      host: myId,
      phase: 'lobby',
      createdAt: Date.now(),
      players: {
        [myId]: { name: playerName, isHost: true, originalRole: '', vote: null, nightActionDone: false }
      },
      rolePool: hostRolePool,
      nightStep: 0,
      centerCards: [],
      nightActions: {},
      votes: {},
    });
    setScreen('lobby');
    showToast?.(`Room created! Code: ${code}`, 'success');
  }, [fb, myId, playerName, hostRolePool, showToast]);

  const joinRoom = useCallback(async () => {
    if (!fb) { showToast?.('Game engine not ready yet, please try again.', 'error'); return; }
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) { showToast?.('Enter a 4-character room code.', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `werewolfRooms/${code}`));
    if (!snap.exists()) { showToast?.('Room not found.', 'error'); return; }
    const data = snap.val();
    if (data.phase !== 'lobby') { showToast?.('Game already started.', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 10) { showToast?.('Room is full.', 'error'); return; }

    setRoomCode(code);
    setIsHost(false);
    await fb.update(fb.ref(fb.database, `werewolfRooms/${code}/players/${myId}`), {
      name: playerName, isHost: false, originalRole: '', vote: null, nightActionDone: false
    });
    setScreen('lobby');
    showToast?.(`Joined room ${code}!`, 'success');
  }, [fb, joinCode, myId, playerName, showToast]);

  const startGame = useCallback(async () => {
    if (!isHost) return;
    const players = Object.keys(roomData?.players || {});
    if (players.length < 3) { showToast?.('Need at least 3 players.', 'error'); return; }
    if (players.length > hostRolePool.length - 3) {
      showToast?.(`Need at least ${players.length + 3} roles selected (${players.length} players + 3 center cards).`, 'error');
      return;
    }

    // Assign roles
    const shuffledRoles = shuffle(hostRolePool);
    const playerAssignments = {};
    players.forEach((id, i) => {
      playerAssignments[id] = shuffledRoles[i];
    });
    const centerCards = shuffledRoles.slice(players.length, players.length + 3);

    const updates = {};
    players.forEach(id => {
      updates[`players/${id}/originalRole`] = playerAssignments[id];
    });
    updates.centerCards = centerCards;
    updates.phase = 'roleReveal';
    updates.nightStep = 0;
    updates.stepStartTime = Date.now() + 10000; // 10s to reveal role

    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), updates);
    showToast?.('Game started! Players are seeing their roles.', 'success');
  }, [fb, isHost, roomData, hostRolePool, roomCode, showToast]);

  const beginNight = useCallback(async () => {
    if (!isHost || !fb) return;
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
      phase: 'night',
      nightStep: 0,
      stepStartTime: Date.now(),
    });
  }, [fb, isHost, roomCode]);

  const submitNightAction = useCallback(async (actionData) => {
    if (nightActionDone || !fb) return;
    setNightActionDone(true);
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}/nightActions/${myId}`), {
      ...actionData,
      done: true,
    });
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}/players/${myId}`), {
      nightActionDone: true
    });
  }, [fb, nightActionDone, roomCode, myId]);

  const submitVote = useCallback(async (targetId) => {
    if (myVote || !fb) return;
    setMyVote(targetId);
    await fb.set(fb.ref(fb.database, `werewolfRooms/${roomCode}/votes/${myId}`), targetId);
    showToast?.('Vote cast!', 'success');
  }, [fb, myVote, roomCode, myId, showToast]);

  const leaveGame = useCallback(async () => {
    if (roomCode && fb) {
      await fb.remove(fb.ref(fb.database, `werewolfRooms/${roomCode}/players/${myId}`));
    }
    setScreen('menu');
    setRoomCode('');
    setRoomData(null);
    setMyOriginalRole(null);
    setNightResult(null);
    setNightResultModal(null);
    setNightActionDone(false);
    setMyVote(null);
    setGameResult(null);
    setFinalRolesComputed(null);
    setRoleHidden(false);
    setSeerMode(null);
    setSelectedTargets([]);
    setNightActionSubStep(null);
    setWitchPeekedCard(null);
    setPiSeen([]);
  }, [roomCode, myId]);

  // ── Night action logic ────────────────────────────────────────────────────
  const handleNightAction = useCallback(() => {
    const role = myOriginalRole;
    const players = roomData?.players || {};
    const centerCards = roomData?.centerCards || [];
    const originalRoles = {};
    Object.entries(players).forEach(([id, p]) => { originalRoles[id] = p.originalRole; });
    const otherIds = Object.keys(players).filter(id => id !== myId);

    // Helper: get pack members (all wolf-team roles)
    const getWolfPack = (includeRole) => Object.entries(players)
      .filter(([id, p]) => WEREWOLF_ROLES.has(p.originalRole) && id !== myId && p.originalRole !== 'dreamWolf')
      .map(([, p]) => p.name);

    let result = null;
    let actionData = null;

    if (role === 'werewolf') {
      const pack = getWolfPack();
      if (pack.length > 0) {
        result = { type: 'werewolf_team', werewolves: pack };
        actionData = { role: 'werewolf', saw: 'teammates' };
      } else if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        const card = centerCards[idx] || '';
        result = { type: 'center_card', index: idx, role: card };
        actionData = { role: 'werewolf', lookedAtCenter: true, centerIndex: idx, saw: card };
      } else {
        return; // lone wolf — needs to pick center first
      }
    } else if (role === 'minion') {
      const wolves = Object.entries(players)
        .filter(([, p]) => WEREWOLF_ROLES.has(p.originalRole))
        .map(([, p]) => p.name);
      result = { type: 'minion_see', werewolves: wolves };
      actionData = { role: 'minion', saw: 'werewolves' };

    } else if (role === 'mason') {
      const masons = Object.entries(players)
        .filter(([id, p]) => p.originalRole === 'mason' && id !== myId)
        .map(([, p]) => p.name);
      result = { type: 'mason', masons };
      actionData = { role: 'mason' };

    } else if (role === 'mysticWolf') {
      if (nightActionSubStep === null) {
        // Step 1: see pack, advance to peek
        setNightActionSubStep('peek');
        setSelectedTargets([]);
        return;
      } else if (selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        const pack = getWolfPack();
        result = { type: 'mysticWolf', pack, targetName: players[targetId]?.name || '?', targetRole: originalRoles[targetId] || '' };
        actionData = { role: 'mysticWolf', playerTarget: targetId };
      } else return;

    } else if (role === 'alphaWolf') {
      const pack = getWolfPack();
      const wolfCenterIdx = centerCards.findIndex(c => WEREWOLF_ROLES.has(c));
      if (nightActionSubStep === null) {
        if (wolfCenterIdx === -1 || selectedTargets.length === 0) {
          // No wolf in center OR skipping — just done
          result = { type: 'alphaWolf_no_wolf', pack };
          actionData = { role: 'alphaWolf', noWolf: true };
        } else {
          // Advance to player selection
          setNightActionSubStep('place');
          return;
        }
      } else if (nightActionSubStep === 'place' && selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        result = { type: 'alphaWolf', pack, targetName: players[targetId]?.name || '?', wolfCenterIdx };
        actionData = { role: 'alphaWolf', targetId, centerIndex: wolfCenterIdx };
      } else return;

    } else if (role === 'seer') {
      if (seerMode === 'player' && selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        result = { type: 'seer_player', targetName: players[targetId]?.name || '?', targetRole: originalRoles[targetId] || '' };
        actionData = { role: 'seer', mode: 'player', playerTarget: targetId };
      } else if (seerMode === 'center' && selectedTargets.length === 2) {
        result = { type: 'seer_center', indices: [...selectedTargets], roles: [centerCards[selectedTargets[0]] || '', centerCards[selectedTargets[1]] || ''] };
        actionData = { role: 'seer', mode: 'center', center1: selectedTargets[0], center2: selectedTargets[1] };
      } else return;

    } else if (role === 'apprenticeSeer') {
      if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        result = { type: 'apprenticeSeer', index: idx, role: centerCards[idx] || '' };
        actionData = { role: 'apprenticeSeer', centerIndex: idx };
      } else return;

    } else if (role === 'pi') {
      const lastId = selectedTargets[0];
      if (!lastId) return;
      const targetRole = originalRoles[lastId] || '';
      const targetName = players[lastId]?.name || '?';
      const isVillage = ROLES[targetRole]?.team === 'villagers';
      const allSeen = [...piSeen, { id: lastId, name: targetName, role: targetRole }];
      // If found non-village OR second investigation OR chose to stop
      if (!isVillage || nightActionSubStep === 'second' || allSeen.length >= 2) {
        result = { type: 'pi', seen: allSeen };
        actionData = { role: 'pi', targets: allSeen.map(s => s.id) };
      } else {
        // Village found on first look — advance to optional second
        setPiSeen(allSeen);
        setNightActionSubStep('second');
        setSelectedTargets([]);
        return;
      }

    } else if (role === 'witch') {
      if (!witchPeekedCard) return;
      const swapTargetId = selectedTargets[0] || null;
      result = { type: 'witch', peekedCard: witchPeekedCard, swapTargetId, swapTargetName: swapTargetId ? players[swapTargetId]?.name : null };
      actionData = { role: 'witch', centerIndex: witchPeekedCard.index, swapTargetId: swapTargetId || null };

    } else if (role === 'revealer') {
      if (selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        const targetRole = originalRoles[targetId] || '';
        const isEvil = WEREWOLF_ROLES.has(targetRole) || targetRole === 'tanner' || targetRole === 'minion';
        result = { type: 'revealer', targetName: players[targetId]?.name || '?', targetRole, flippedBack: isEvil };
        actionData = { role: 'revealer', targetId, revealed: !isEvil };
      } else return;

    } else if (role === 'villageIdiot') {
      if (selectedTargets.length === 1) {
        const direction = selectedTargets[0] === 0 ? 'left' : 'right';
        const playerOrder = otherIds; // consistent order
        result = { type: 'villageIdiot', direction };
        actionData = { role: 'villageIdiot', direction, playerOrder };
      } else return;

    } else if (role === 'robber') {
      if (selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        result = { type: 'robber', targetName: players[targetId]?.name || '?', newRole: originalRoles[targetId] || '' };
        actionData = { role: 'robber', actorId: myId, targetId };
      } else return;

    } else if (role === 'troublemaker') {
      if (selectedTargets.length === 2) {
        const [t1, t2] = selectedTargets;
        result = { type: 'troublemaker', name1: players[t1]?.name || '?', name2: players[t2]?.name || '?' };
        actionData = { role: 'troublemaker', target1Id: t1, target2Id: t2 };
      } else return;

    } else if (role === 'drunk') {
      if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        result = { type: 'drunk', index: idx };
        actionData = { role: 'drunk', actorId: myId, centerIndex: idx };
      } else return;

    } else if (role === 'insomniac') {
      const { finalRoles } = resolveNightActions(originalRoles, centerCards, roomData?.nightActions || {});
      const myFinalRole = finalRoles[myId] || myOriginalRole;
      result = { type: 'insomniac', finalRole: myFinalRole };
      actionData = { role: 'insomniac', finalRole: myFinalRole };
    }

    if (result && actionData) {
      setNightResult(result);
      setNightResultModal(result);
      submitNightAction(actionData);
    }
  }, [myOriginalRole, roomData, myId, selectedTargets, seerMode, nightActionSubStep, witchPeekedCard, piSeen, submitNightAction]);

  // ─── RENDER HELPERS ────────────────────────────────────────────────────────
  const players = roomData?.players || {};
  const playerList = Object.entries(players).map(([id, p]) => ({ id, ...p }));
  const otherPlayers = playerList.filter(p => p.id !== myId);
  const currentNightRole = NIGHT_ORDER[roomData?.nightStep ?? 0];
  const isMyNightTurn = myOriginalRole === currentNightRole;
  const isLoneWerewolf = myOriginalRole === 'werewolf' &&
    !otherPlayers.some(p => p.originalRole === 'werewolf');

  // ─── SCREENS ──────────────────────────────────────────────────────────────

  // MENU
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">🐺</div>
            <h1 className="text-4xl font-black text-white tracking-tight">One Night</h1>
            <h2 className="text-3xl font-black text-purple-300">Werewolf</h2>
            <p className="text-white/60 mt-2 text-sm">The ultimate social deduction game</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 space-y-4">
            <button
              onClick={createRoom}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl text-lg transition-all hover:scale-[1.02] shadow-lg"
            >
              🎮 Create Room
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-sm">or join</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="Room code"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 font-mono text-lg tracking-widest text-center uppercase focus:outline-none focus:border-purple-400"
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
              />
              <button
                onClick={joinRoom}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 rounded-xl transition-all hover:scale-[1.02]"
              >
                Join
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            {['🐺 Werewolves', '👁️ Seer', '🦹 Robber'].map(r => (
              <div key={r} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-white/80 text-sm font-semibold">{r}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-xs mt-4">3–10 players • ~15 minutes</p>
        </motion.div>
      </div>
    );
  }

  // LOBBY
  if (screen === 'lobby') {
    const playerCount = playerList.length;
    const neededRoles = playerCount + 3; // 3 center cards

    // Available roles to add/remove
    const allRoleTypes = Object.keys(ROLES);
    const roleCounts = {};
    hostRolePool.forEach(r => { roleCounts[r] = (roleCounts[r] || 0) + 1; });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 text-white">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={leaveGame} className="text-white/60 hover:text-white text-sm">← Leave</button>
            <div className="text-center">
              <p className="text-white/60 text-sm">Room Code</p>
              <p className="text-3xl font-black tracking-widest text-yellow-300">{roomCode}</p>
            </div>
            <div className="text-white/60 text-sm text-right">
              {playerCount} player{playerCount !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Players */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold mb-3 text-white/80">Players in Room</h3>
            <div className="flex flex-wrap gap-2">
              {playerList.map(p => (
                <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border
                  ${p.id === myId ? 'bg-purple-600/30 border-purple-400' : 'bg-white/10 border-white/20'}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold">
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{p.name}{p.id === myId ? ' (You)' : ''}</span>
                  {p.isHost && <span className="text-xs text-yellow-300">HOST</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Role Selection (host only) */}
          {isHost && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white/80">Role Pool</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded-lg ${hostRolePool.length === neededRoles ? 'bg-green-600/40 text-green-300' : 'bg-yellow-600/40 text-yellow-300'}`}>
                    {hostRolePool.length}/{neededRoles}
                  </span>
                  <button onClick={() => setShowRoleGuide(true)} className="text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 px-2 py-1 rounded-lg transition-all">📖 Guide</button>
                </div>
              </div>
              <p className="text-white/50 text-xs mb-3">Need exactly {playerCount} players + 3 center = {neededRoles} total roles</p>

              {['Base Game', 'Daybreak'].map(exp => {
                const expRoles = allRoleTypes.filter(id => ROLES[id].expansion === exp);
                return (
                  <div key={exp} className="mb-3">
                    <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mb-2 font-semibold ${EXPANSION_COLORS[exp] || 'text-white/50 bg-white/5 border-white/10'}`}>{exp}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {expRoles.map(roleId => {
                        const r = ROLES[roleId];
                        const count = roleCounts[roleId] || 0;
                        return (
                          <div key={roleId} className={`flex items-center justify-between p-2 rounded-xl border
                            ${count > 0 ? `bg-gradient-to-r ${r.bg} ${r.border}` : 'bg-white/5 border-white/10'}`}>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-base flex-shrink-0">{r.icon}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-bold leading-tight truncate">{r.name}</p>
                                <p className="text-xs opacity-60 truncate">{r.team === 'werewolves' ? '🐺' : r.team === 'tanner' ? '😅' : '🏘️'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button onClick={() => setRoleInfoModal(roleId)} className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 text-white text-xs flex items-center justify-center">?</button>
                              <button
                                onClick={() => setHostRolePool(prev => { const idx = prev.lastIndexOf(roleId); if (idx === -1) return prev; return [...prev.slice(0, idx), ...prev.slice(idx + 1)]; })}
                                className="w-5 h-5 rounded-full bg-red-500/40 hover:bg-red-500/70 text-white text-xs font-bold flex items-center justify-center"
                                disabled={count === 0}
                              >−</button>
                              <span className="w-4 text-center text-xs font-bold">{count}</span>
                              <button
                                onClick={() => setHostRolePool(prev => [...prev, roleId])}
                                className="w-5 h-5 rounded-full bg-green-500/40 hover:bg-green-500/70 text-white text-xs font-bold flex items-center justify-center"
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={startGame}
                disabled={hostRolePool.length !== neededRoles || playerCount < 3}
                className="mt-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
              >
                {playerCount < 3 ? `Need ${3 - playerCount} more player(s)` :
                 hostRolePool.length !== neededRoles ? `Adjust roles (need ${neededRoles})` :
                 '🌙 Start Game'}
              </button>
            </div>
          )}

          {!isHost && (
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-4xl mb-2 animate-pulse">⏳</div>
              <p className="text-white/70">Waiting for the host to start the game...</p>
              <p className="text-white/40 text-sm mt-1">Share room code <span className="text-yellow-300 font-mono font-bold">{roomCode}</span> with friends</p>
              <button onClick={() => setShowRoleGuide(true)} className="mt-3 text-sm bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 px-4 py-2 rounded-xl transition-all">📖 View Role Guide</button>
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showRoleGuide && <RoleGuide onClose={() => setShowRoleGuide(false)} onSelectRole={(id) => { setRoleInfoModal(id); }} />}
          {roleInfoModal && <RoleInfoCard roleId={roleInfoModal} onClose={() => setRoleInfoModal(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  // ROLE REVEAL
  if (screen === 'roleReveal') {
    const role = myOriginalRole || roomData?.players?.[myId]?.originalRole;
    const r = role ? ROLES[role] : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm w-full"
        >
          <p className="text-white/60 mb-4">Your secret role</p>

          <AnimatePresence mode="wait">
            {roleHidden ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mx-auto w-48 h-64 bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl border-4 border-white/20 flex flex-col items-center justify-center gap-3 shadow-2xl cursor-pointer"
                onClick={() => setRoleHidden(false)}
              >
                <span className="text-5xl">🙈</span>
                <p className="text-white/50 text-sm font-semibold">Role Hidden</p>
                <p className="text-white/30 text-xs">Tap to reveal</p>
              </motion.div>
            ) : showRoleReveal && r ? (
              <motion.div
                key="revealed"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`mx-auto bg-gradient-to-br ${r.bg} ${r.border} border-4 rounded-3xl p-8 shadow-2xl max-w-xs`}
              >
                <div className="text-7xl mb-4">{r.icon}</div>
                <h2 className="text-3xl font-black text-white mb-2">{r.name}</h2>
                <div className={`inline-block px-3 py-1 rounded-full ${r.badge} text-xs font-bold text-white mb-4`}>
                  {ROLE_DESCRIPTIONS[r.team]}
                </div>
                <p className={`${r.text} text-sm leading-relaxed`}>{r.description}</p>
                {r.nightAction && (
                  <div className="mt-4 bg-black/30 rounded-xl p-3">
                    <p className="text-white/60 text-xs mb-1">Tonight you will:</p>
                    <p className={`${r.text} text-sm font-semibold`}>{r.nightAction}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                className="mx-auto w-48 h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl border-4 border-white/20 flex items-center justify-center"
              >
                <span className="text-white/20 font-black text-2xl">🌙</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-white/40 text-sm mt-6">Remember your role — don&apos;t show anyone!</p>

          {/* Hide role toggle */}
          <button
            onClick={() => setRoleHidden(h => !h)}
            className="mt-3 w-full bg-black/40 hover:bg-black/60 border border-white/20 text-white/70 hover:text-white font-semibold py-2 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
          >
            {roleHidden ? '👁️ Show My Role' : '🙈 Hide My Role'}
          </button>

          {isHost && (
            <button
              onClick={beginNight}
              className="mt-4 w-full bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              🌙 Begin Night Phase
            </button>
          )}
          {!isHost && (
            <p className="mt-4 text-white/40 text-sm animate-pulse">Waiting for host to start night phase...</p>
          )}
        </motion.div>
      </div>
    );
  }

  // ── Night result modal ────────────────────────────────────────────────────
  const NightResultModal = () => {
    if (!nightResultModal) return null;
    const res = nightResultModal;

    let title = '';
    let content = null;

    if (res.type === 'werewolf_team') {
      title = '🐺 Your Pack';
      content = res.werewolves.length > 0
        ? <div className="space-y-2">{res.werewolves.map(n => <div key={n} className="px-4 py-3 bg-red-900/60 rounded-xl border border-red-500 text-red-200 font-bold text-lg">🐺 {n}</div>)}</div>
        : <p className="text-red-300 text-lg">You are the lone wolf...</p>;
    } else if (res.type === 'center_card') {
      const cr = ROLES[res.role];
      title = `Center Card ${res.index + 1}`;
      content = cr ? (
        <div className={`bg-gradient-to-br ${cr.bg} ${cr.border} border-2 rounded-2xl p-6 text-center`}>
          <div className="text-5xl mb-2">{cr.icon}</div>
          <p className="text-white font-black text-2xl">{cr.name}</p>
          <p className={`${cr.text} text-sm mt-1`}>{ROLE_DESCRIPTIONS[cr.team]}</p>
        </div>
      ) : <p className="text-white/60">Unknown card</p>;
    } else if (res.type === 'minion_see') {
      title = '😈 The Werewolves Are...';
      content = res.werewolves.length > 0
        ? <div className="space-y-2">{res.werewolves.map(n => <div key={n} className="px-4 py-3 bg-red-900/60 rounded-xl border border-red-500 text-red-200 font-bold text-lg">🐺 {n}</div>)}</div>
        : <p className="text-orange-300 text-lg">No werewolves! You are on your own!</p>;
    } else if (res.type === 'seer_player') {
      const sr = ROLES[res.targetRole];
      title = `👁️ ${res.targetName}'s Card`;
      content = sr ? (
        <div className={`bg-gradient-to-br ${sr.bg} ${sr.border} border-2 rounded-2xl p-6 text-center`}>
          <div className="text-5xl mb-2">{sr.icon}</div>
          <p className="text-white font-black text-2xl">{sr.name}</p>
          <p className={`${sr.text} text-sm mt-1`}>{ROLE_DESCRIPTIONS[sr.team]}</p>
          <p className={`${sr.text} text-xs mt-2 opacity-70`}>{sr.description}</p>
        </div>
      ) : <p className="text-white/60">Card not found (role: {res.targetRole})</p>;
    } else if (res.type === 'seer_center') {
      title = '👁️ Center Cards';
      content = (
        <div className="flex gap-3 justify-center">
          {res.roles.map((roleName, i) => {
            const cr = ROLES[roleName];
            return cr ? (
              <div key={i} className={`bg-gradient-to-br ${cr.bg} ${cr.border} border-2 rounded-xl p-4 text-center flex-1`}>
                <div className="text-3xl mb-1">{cr.icon}</div>
                <p className="text-white font-bold text-sm">{cr.name}</p>
                <p className="text-white/50 text-xs">Center {res.indices[i] + 1}</p>
              </div>
            ) : <div key={i} className="text-white/40 text-sm">Unknown</div>;
          })}
        </div>
      );
    } else if (res.type === 'robber') {
      const rr = ROLES[res.newRole];
      title = `🦹 You Stole from ${res.targetName}`;
      content = rr ? (
        <div>
          <p className="text-white/60 text-sm mb-3 text-center">Your new role is:</p>
          <div className={`bg-gradient-to-br ${rr.bg} ${rr.border} border-2 rounded-2xl p-6 text-center`}>
            <div className="text-5xl mb-2">{rr.icon}</div>
            <p className="text-white font-black text-2xl">{rr.name}</p>
            <p className={`${rr.text} text-sm mt-1`}>{ROLE_DESCRIPTIONS[rr.team]}</p>
            <p className={`${rr.text} text-xs mt-2 opacity-70`}>{rr.description}</p>
          </div>
        </div>
      ) : <p className="text-white/60">New role: {res.newRole}</p>;
    } else if (res.type === 'troublemaker') {
      title = '🔀 Swap Complete';
      content = (
        <div className="text-center">
          <p className="text-yellow-200 text-lg font-semibold">{res.name1}</p>
          <p className="text-white/40 my-2 text-2xl">⇄</p>
          <p className="text-yellow-200 text-lg font-semibold">{res.name2}</p>
          <p className="text-white/50 text-sm mt-4">Their roles have been secretly swapped. You don&apos;t know what they got!</p>
        </div>
      );
    } else if (res.type === 'drunk') {
      title = '🍺 You Swapped!';
      content = (
        <div className="text-center">
          <div className="text-6xl mb-4">🍺</div>
          <p className="text-orange-200 text-lg">You drunkenly took <strong>Center Card {res.index + 1}</strong></p>
          <p className="text-white/50 text-sm mt-3">You have no idea what role you now have... good luck!</p>
        </div>
      );
    } else if (res.type === 'insomniac') {
      const ir = ROLES[res.finalRole];
      const changed = res.finalRole !== myOriginalRole;
      title = '😴 Your Final Card';
      content = ir ? (
        <div>
          {changed && <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-2 mb-3 text-center"><p className="text-yellow-300 text-sm font-bold">⚠️ Your card was changed during the night!</p></div>}
          <div className={`bg-gradient-to-br ${ir.bg} ${ir.border} border-2 rounded-2xl p-6 text-center`}>
            <div className="text-5xl mb-2">{ir.icon}</div>
            <p className="text-white font-black text-2xl">{ir.name}</p>
            <p className={`${ir.text} text-sm mt-1`}>{ROLE_DESCRIPTIONS[ir.team]}</p>
          </div>
          {!changed && <p className="text-white/40 text-sm text-center mt-2">Your card was not changed.</p>}
        </div>
      ) : <p className="text-white/60">Role: {res.finalRole}</p>;

    } else if (res.type === 'mason') {
      title = '🤝 Fellow Masons';
      content = res.masons.length > 0
        ? <div className="space-y-2">{res.masons.map(n => <div key={n} className="px-4 py-3 bg-stone-700/60 rounded-xl border border-stone-500 text-stone-200 font-bold text-lg">🤝 {n}</div>)}</div>
        : <p className="text-stone-300 text-lg text-center">You are the lone Mason. No other Mason is in this game.</p>;

    } else if (res.type === 'mysticWolf') {
      const mr = ROLES[res.targetRole];
      title = `🔮 Mystic Wolf`;
      content = (
        <div className="space-y-3">
          {res.pack.length > 0 && <div className="bg-red-900/40 rounded-xl p-3"><p className="text-red-300 text-xs font-bold mb-1">YOUR PACK</p>{res.pack.map(n => <p key={n} className="text-red-200 font-semibold">🐺 {n}</p>)}</div>}
          {res.pack.length === 0 && <p className="text-red-300 text-sm">You are the lone wolf.</p>}
          <div className="border-t border-white/10 pt-3">
            <p className="text-white/60 text-xs mb-2">You peeked at <strong className="text-white">{res.targetName}</strong>:</p>
            {mr ? <div className={`bg-gradient-to-br ${mr.bg} ${mr.border} border-2 rounded-xl p-4 text-center`}><div className="text-3xl mb-1">{mr.icon}</div><p className="text-white font-black">{mr.name}</p></div> : <p className="text-white/60">Unknown role</p>}
          </div>
        </div>
      );

    } else if (res.type === 'alphaWolf') {
      title = `⚔️ Alpha Wolf`;
      content = (
        <div className="space-y-3">
          {res.pack.length > 0 && <div className="bg-red-900/40 rounded-xl p-3"><p className="text-red-300 text-xs font-bold mb-1">YOUR PACK</p>{res.pack.map(n => <p key={n} className="text-red-200 font-semibold">🐺 {n}</p>)}</div>}
          <div className="bg-green-900/40 rounded-xl p-3 text-center"><p className="text-green-300 text-sm">You placed a 🐺 Werewolf card onto <strong className="text-white">{res.targetName}</strong>!</p><p className="text-white/40 text-xs mt-1">Their old card is now in the center.</p></div>
        </div>
      );

    } else if (res.type === 'alphaWolf_no_wolf') {
      title = `⚔️ Alpha Wolf`;
      content = (
        <div className="space-y-3">
          {res.pack.length > 0 && <div className="bg-red-900/40 rounded-xl p-3"><p className="text-red-300 text-xs font-bold mb-1">YOUR PACK</p>{res.pack.map(n => <p key={n} className="text-red-200 font-semibold">🐺 {n}</p>)}</div>}
          <p className="text-white/60 text-sm text-center">No Werewolf card in the center — nothing to swap.</p>
        </div>
      );

    } else if (res.type === 'apprenticeSeer') {
      const ar = ROLES[res.role];
      title = `🔭 Center Card ${res.index + 1}`;
      content = ar ? <div className={`bg-gradient-to-br ${ar.bg} ${ar.border} border-2 rounded-2xl p-6 text-center`}><div className="text-5xl mb-2">{ar.icon}</div><p className="text-white font-black text-2xl">{ar.name}</p><p className={`${ar.text} text-sm mt-1`}>{ROLE_DESCRIPTIONS[ar.team]}</p></div> : <p className="text-white/60">Unknown card</p>;

    } else if (res.type === 'pi') {
      title = '🔍 Investigation Results';
      content = (
        <div className="space-y-2">
          {res.seen.map((s, i) => {
            const pr = ROLES[s.role];
            return pr ? (
              <div key={i} className={`bg-gradient-to-r ${pr.bg} ${pr.border} border rounded-xl p-3 flex items-center gap-3`}>
                <span className="text-2xl">{pr.icon}</span>
                <div><p className="text-white font-bold">{s.name}</p><p className={`text-xs ${pr.text}`}>{pr.name}</p></div>
              </div>
            ) : null;
          })}
        </div>
      );

    } else if (res.type === 'witch') {
      const wc = ROLES[res.peekedCard.role];
      title = '🧙 Witch Brewed';
      content = (
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-white/60 text-xs mb-2">You peeked at Center Card {res.peekedCard.index + 1}:</p>
            {wc ? <div className={`bg-gradient-to-br ${wc.bg} ${wc.border} border-2 rounded-xl p-4 text-center inline-block min-w-[120px]`}><div className="text-3xl mb-1">{wc.icon}</div><p className="text-white font-black">{wc.name}</p></div> : null}
          </div>
          {res.swapTargetId
            ? <p className="text-fuchsia-300 text-sm text-center">✅ You swapped it with <strong className="text-white">{res.swapTargetName}</strong>&apos;s card!</p>
            : <p className="text-white/50 text-sm text-center">You chose not to swap — the center card stays.</p>}
        </div>
      );

    } else if (res.type === 'revealer') {
      const rv = ROLES[res.targetRole];
      title = '📢 Revealer';
      content = (
        <div className="space-y-3">
          {rv ? <div className={`bg-gradient-to-br ${rv.bg} ${rv.border} border-2 rounded-2xl p-5 text-center`}><div className="text-4xl mb-1">{rv.icon}</div><p className="text-white font-black text-xl">{res.targetName}</p><p className={`${rv.text} font-semibold`}>{rv.name}</p></div> : null}
          {res.flippedBack
            ? <div className="bg-red-900/40 rounded-xl p-3 text-center"><p className="text-red-300 text-sm font-bold">⚠️ This is an evil role — card goes back face-down.</p><p className="text-white/50 text-xs mt-1">Only you know what you saw!</p></div>
            : <div className="bg-green-900/40 rounded-xl p-3 text-center"><p className="text-green-300 text-sm font-bold">✅ Village role — this card stays revealed!</p><p className="text-white/50 text-xs mt-1">During day discussion, tell everyone what you found.</p></div>}
        </div>
      );

    } else if (res.type === 'villageIdiot') {
      title = '🤪 Village Idiot';
      content = (
        <div className="text-center">
          <div className="text-6xl mb-3">{res.direction === 'left' ? '⬅️' : '➡️'}</div>
          <p className="text-pink-200 text-lg font-bold">Shifted {res.direction === 'left' ? 'Left' : 'Right'}!</p>
          <p className="text-white/50 text-sm mt-2">All other players&apos; roles have been rotated. Nobody knows — except you!</p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => setNightResultModal(null)}
      >
        <motion.div
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 40 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <h3 className="text-xl font-black text-white text-center mb-4">{title}</h3>
          {content}
          <button
            onClick={() => setNightResultModal(null)}
            className="mt-5 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all"
          >
            Got it ✓
          </button>
        </motion.div>
      </motion.div>
    );
  };

  // NIGHT PHASE
  if (screen === 'night') {
    const nightStep = roomData?.nightStep ?? 0;
    const stepStartTime = roomData?.stepStartTime ?? Date.now();
    const STEP_DURATION = 25000;
    const stepEnd = stepStartTime + STEP_DURATION;
    const role = myOriginalRole;
    const r = role ? ROLES[role] : null;

    const centerCards = roomData?.centerCards || [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 text-white">
        <div className="max-w-lg mx-auto space-y-4">
          {/* Header */}
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🌙</div>
            <h2 className="text-2xl font-black">Night Phase</h2>
            <p className="text-white/50 text-sm">Everyone is asleep... except one</p>
          </div>

          {/* Night order progress */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <NightRoleIndicator currentRole={currentNightRole} nightStep={nightStep} />
            <div className="text-center mt-3">
              <p className="text-white/60 text-sm">
                {ROLES[currentNightRole]?.icon} <span className="font-bold text-white">{ROLES[currentNightRole]?.name}</span> is awake
              </p>
              <PhaseTimer endTime={stepEnd} />
            </div>
          </div>

          {/* My action UI or waiting */}
          {isMyNightTurn && !nightActionDone ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gradient-to-br ${r?.bg} rounded-2xl p-5 border-2 ${r?.border} shadow-xl`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{r?.icon}</span>
                <div>
                  <h3 className="text-lg font-black text-white">It&apos;s your turn, {r?.name}!</h3>
                  <p className={`text-sm ${r?.text} opacity-80`}>{r?.nightAction}</p>
                </div>
              </div>

              {/* Werewolf: see teammates or look at center */}
              {role === 'werewolf' && (
                <div className="space-y-3">
                  {!isLoneWerewolf ? (
                    <div>
                      <p className="text-white/80 text-sm mb-2">Your fellow werewolves:</p>
                      <div className="flex flex-wrap gap-2">
                        {otherPlayers.filter(p => p.originalRole === 'werewolf').map(p => (
                          <div key={p.id} className="px-3 py-2 bg-red-900/60 rounded-xl border border-red-500 text-sm font-bold text-red-200">
                            🐺 {p.name}
                          </div>
                        ))}
                        {otherPlayers.filter(p => p.originalRole === 'werewolf').length === 0 && (
                          <p className="text-red-300 text-sm">You are the lone wolf...</p>
                        )}
                      </div>
                      <button
                        onClick={handleNightAction}
                        className="mt-3 w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition-all"
                      >
                        Close Eyes ✓
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/80 text-sm mb-2">You are the lone wolf. Pick a center card to peek at:</p>
                      <div className="flex gap-2 justify-center">
                        {[0, 1, 2].map(i => (
                          <button
                            key={i}
                            onClick={() => setSelectedTargets([i])}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all
                              ${selectedTargets.includes(i) ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/30 text-white/70'}`}
                          >
                            Center {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleNightAction}
                        disabled={selectedTargets.length === 0}
                        className="mt-3 w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold py-2 rounded-xl transition-all"
                      >
                        {selectedTargets.length === 0 ? 'Select a center card' : 'Peek at Card'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Minion: see werewolves */}
              {role === 'minion' && (
                <div className="space-y-2">
                  <p className="text-white/80 text-sm">The werewolves are:</p>
                  {otherPlayers.filter(p => p.originalRole === 'werewolf').length > 0 ? (
                    otherPlayers.filter(p => p.originalRole === 'werewolf').map(p => (
                      <div key={p.id} className="px-3 py-2 bg-red-900/60 rounded-xl text-sm font-bold text-red-200 border border-red-500">
                        🐺 {p.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-orange-300 text-sm">No werewolves! You are on your own...</p>
                  )}
                  <button onClick={handleNightAction} className="w-full bg-rose-700 hover:bg-rose-600 text-white font-bold py-2 rounded-xl mt-2 transition-all">
                    Got it ✓
                  </button>
                </div>
              )}

              {/* Seer: look at player or 2 center cards */}
              {role === 'seer' && (
                <div className="space-y-3">
                  {!seerMode ? (
                    <>
                      <p className="text-white/80 text-sm">Choose what to look at:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setSeerMode('player')} className="py-3 bg-blue-800/60 hover:bg-blue-700/60 border border-blue-500 rounded-xl text-sm font-bold text-blue-200 transition-all">
                          👥 One Player's Card
                        </button>
                        <button onClick={() => setSeerMode('center')} className="py-3 bg-blue-800/60 hover:bg-blue-700/60 border border-blue-500 rounded-xl text-sm font-bold text-blue-200 transition-all">
                          📚 Two Center Cards
                        </button>
                      </div>
                    </>
                  ) : seerMode === 'player' ? (
                    <>
                      <p className="text-white/80 text-sm">Select a player to view their card:</p>
                      <div className="flex flex-wrap gap-2">
                        {otherPlayers.map(p => (
                          <button
                            key={p.id}
                            onClick={() => setSelectedTargets([p.id])}
                            className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                              ${selectedTargets.includes(p.id) ? 'bg-blue-500/40 border-blue-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSeerMode(null); setSelectedTargets([]); }} className="flex-1 py-2 bg-white/10 rounded-xl text-sm font-bold text-white/70 transition-all">Back</button>
                        <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">
                          See Card
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-white/80 text-sm">Select 2 center cards to peek at:</p>
                      <div className="flex gap-2 justify-center">
                        {[0, 1, 2].map(i => (
                          <button
                            key={i}
                            onClick={() => setSelectedTargets(prev =>
                              prev.includes(i) ? prev.filter(x => x !== i) :
                              prev.length < 2 ? [...prev, i] : prev
                            )}
                            className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all
                              ${selectedTargets.includes(i) ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/30 text-white/70'}`}
                          >
                            Center {i + 1}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSeerMode(null); setSelectedTargets([]); }} className="flex-1 py-2 bg-white/10 rounded-xl text-sm font-bold text-white/70">Back</button>
                        <button onClick={handleNightAction} disabled={selectedTargets.length !== 2} className="flex-1 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">
                          Peek Cards
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Robber */}
              {role === 'robber' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a player to steal their role:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${selectedTargets.includes(p.id) ? 'bg-purple-500/40 border-purple-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">
                    {selectedTargets.length === 0 ? 'Select a player' : 'Steal Role'}
                  </button>
                </div>
              )}

              {/* Troublemaker */}
              {role === 'troublemaker' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick 2 other players to swap their roles:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedTargets(prev =>
                          prev.includes(p.id) ? prev.filter(x => x !== p.id) :
                          prev.length < 2 ? [...prev, p.id] : prev
                        )}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all
                          ${selectedTargets.includes(p.id) ? 'bg-yellow-500/40 border-yellow-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length !== 2} className="w-full py-2 bg-yellow-700 hover:bg-yellow-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">
                    {selectedTargets.length < 2 ? `Select ${2 - selectedTargets.length} more` : 'Swap Their Roles'}
                  </button>
                </div>
              )}

              {/* Drunk */}
              {role === 'drunk' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a center card to take (you won&apos;t know what it is):</p>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map(i => (
                      <button
                        key={i}
                        onClick={() => setSelectedTargets([i])}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all
                          ${selectedTargets.includes(i) ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/30 text-white/70'}`}
                      >
                        Center {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">
                    Take Card
                  </button>
                </div>
              )}

              {/* Insomniac */}
              {role === 'insomniac' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Check your final role card...</p>
                  <button onClick={handleNightAction} className="w-full py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all">Look at My Card</button>
                </div>
              )}

              {/* Mason */}
              {role === 'mason' && (
                <div className="space-y-2">
                  <p className="text-white/80 text-sm">Your fellow Masons:</p>
                  {otherPlayers.filter(p => p.originalRole === 'mason').length > 0
                    ? otherPlayers.filter(p => p.originalRole === 'mason').map(p => (
                        <div key={p.id} className="px-3 py-2 bg-stone-700/60 rounded-xl border border-stone-500 text-stone-200 font-bold">🤝 {p.name}</div>
                      ))
                    : <p className="text-stone-300 text-sm">No other Masons — you are alone.</p>}
                  <button onClick={handleNightAction} className="w-full py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl mt-1 transition-all">Got it ✓</button>
                </div>
              )}

              {/* Mystic Wolf — Step 1: see pack */}
              {role === 'mysticWolf' && nightActionSubStep === null && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Your wolf pack:</p>
                  {otherPlayers.filter(p => WEREWOLF_ROLES.has(p.originalRole) && p.originalRole !== 'dreamWolf').length > 0
                    ? otherPlayers.filter(p => WEREWOLF_ROLES.has(p.originalRole) && p.originalRole !== 'dreamWolf').map(p => (
                        <div key={p.id} className="px-3 py-2 bg-red-900/60 rounded-xl border border-red-500 text-red-200 font-bold">🐺 {p.name}</div>
                      ))
                    : <p className="text-red-300 text-sm">Lone wolf...</p>}
                  <button onClick={handleNightAction} className="w-full py-2 bg-violet-700 hover:bg-violet-600 text-white font-bold rounded-xl transition-all">Got it → Now Peek at a Player</button>
                </div>
              )}
              {/* Mystic Wolf — Step 2: peek at player */}
              {role === 'mysticWolf' && nightActionSubStep === 'peek' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Select a player to peek at their card:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button key={p.id} onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-violet-500/40 border-violet-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">See Card</button>
                </div>
              )}

              {/* Alpha Wolf — Step 1: see pack + center preview */}
              {role === 'alphaWolf' && nightActionSubStep === null && (() => {
                const wolfCenterIdx = (roomData?.centerCards || []).findIndex(c => WEREWOLF_ROLES.has(c));
                return (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm">Your wolf pack:</p>
                    {otherPlayers.filter(p => WEREWOLF_ROLES.has(p.originalRole) && p.originalRole !== 'dreamWolf').length > 0
                      ? otherPlayers.filter(p => WEREWOLF_ROLES.has(p.originalRole) && p.originalRole !== 'dreamWolf').map(p => (
                          <div key={p.id} className="px-3 py-2 bg-red-900/60 rounded-xl border border-red-500 text-red-200 font-bold">🐺 {p.name}</div>
                        ))
                      : <p className="text-red-300 text-sm">Lone wolf.</p>}
                    {wolfCenterIdx >= 0
                      ? <><p className="text-white/70 text-sm mt-1">🐺 Wolf card found in <strong>Center {wolfCenterIdx + 1}</strong>! Pick a player to receive it:</p>
                          <button onClick={() => { setNightActionSubStep('place'); setSelectedTargets([]); }} className="w-full py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl transition-all">Choose Target →</button></>
                      : <><p className="text-white/60 text-sm">No wolf card in center. Nothing to swap.</p>
                          <button onClick={handleNightAction} className="w-full py-2 bg-red-900 hover:bg-red-800 text-white font-bold rounded-xl transition-all">Close Eyes ✓</button></>}
                  </div>
                );
              })()}
              {/* Alpha Wolf — Step 2: pick target */}
              {role === 'alphaWolf' && nightActionSubStep === 'place' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a player to receive the wolf card:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button key={p.id} onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-red-500/40 border-red-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Give Wolf Card</button>
                </div>
              )}

              {/* Apprentice Seer */}
              {role === 'apprenticeSeer' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick one center card to peek at:</p>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map(i => (
                      <button key={i} onClick={() => setSelectedTargets([i])}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedTargets.includes(i) ? 'bg-white/30 border-white text-white' : 'bg-white/10 border-white/30 text-white/70'}`}>
                        Center {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Peek</button>
                </div>
              )}

              {/* PI — Step 1 */}
              {role === 'pi' && nightActionSubStep === null && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a player to investigate:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button key={p.id} onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-emerald-500/40 border-emerald-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Investigate</button>
                </div>
              )}
              {/* PI — Step 2 (optional second) */}
              {role === 'pi' && nightActionSubStep === 'second' && (
                <div className="space-y-3">
                  {piSeen.length > 0 && <div className="bg-emerald-900/40 rounded-xl p-2 text-xs text-emerald-300">Found <strong>{ROLES[piSeen[0]?.role]?.name}</strong> on {piSeen[0]?.name} — village role! May investigate one more.</div>}
                  <p className="text-white/80 text-sm">Investigate one more (optional):</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.filter(p => !piSeen.some(s => s.id === p.id)).map(p => (
                      <button key={p.id} onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-emerald-500/40 border-emerald-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setNightResult({ type: 'pi', seen: piSeen }); setNightResultModal({ type: 'pi', seen: piSeen }); submitNightAction({ role: 'pi', targets: piSeen.map(s => s.id) }); }} className="flex-1 py-2 bg-white/10 rounded-xl text-sm font-bold text-white/70">Stop Here</button>
                    <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Investigate & Done</button>
                  </div>
                </div>
              )}

              {/* Witch — Step 1: pick center card */}
              {role === 'witch' && nightActionSubStep === null && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a center card to peek at:</p>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map(i => (
                      <button key={i} onClick={() => setSelectedTargets([i])}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${selectedTargets.includes(i) ? 'bg-fuchsia-500/40 border-fuchsia-300 text-white' : 'bg-white/10 border-white/30 text-white/70'}`}>
                        Center {i + 1}
                      </button>
                    ))}
                  </div>
                  <button disabled={selectedTargets.length === 0} onClick={() => {
                    const idx = selectedTargets[0];
                    setWitchPeekedCard({ index: idx, role: (roomData?.centerCards || [])[idx] || '' });
                    setNightActionSubStep('decide');
                    setSelectedTargets([]);
                  }} className="w-full py-2 bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Peek at Card</button>
                </div>
              )}
              {/* Witch — Step 2: decide swap */}
              {role === 'witch' && nightActionSubStep === 'decide' && witchPeekedCard && (() => {
                const wc = ROLES[witchPeekedCard.role];
                return (
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-white/60 text-xs mb-2">Center Card {witchPeekedCard.index + 1} is:</p>
                      {wc && <div className={`inline-block bg-gradient-to-br ${wc.bg} ${wc.border} border-2 rounded-xl p-3`}><span className="text-3xl">{wc.icon}</span><p className="text-white font-bold mt-1 text-sm">{wc.name}</p></div>}
                    </div>
                    <p className="text-white/80 text-sm">Swap with a player (optional):</p>
                    <div className="flex flex-wrap gap-2">
                      {[...otherPlayers, { id: myId, name: 'Yourself' }].map(p => (
                        <button key={p.id} onClick={() => setSelectedTargets(prev => prev.includes(p.id) ? [] : [p.id])}
                          className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-fuchsia-500/40 border-fuchsia-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedTargets([]); handleNightAction(); }} className="flex-1 py-2 bg-white/10 rounded-xl text-sm font-bold text-white/70">Keep as-is</button>
                      <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="flex-1 py-2 bg-fuchsia-700 hover:bg-fuchsia-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Swap!</button>
                    </div>
                  </div>
                );
              })()}

              {/* Revealer */}
              {role === 'revealer' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Pick a player to reveal their card:</p>
                  <div className="flex flex-wrap gap-2">
                    {otherPlayers.map(p => (
                      <button key={p.id} onClick={() => setSelectedTargets([p.id])}
                        className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${selectedTargets.includes(p.id) ? 'bg-lime-500/40 border-lime-300 text-white' : 'bg-white/10 border-white/20 text-white/70'}`}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-lime-700 hover:bg-lime-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Flip Card</button>
                </div>
              )}

              {/* Village Idiot */}
              {role === 'villageIdiot' && (
                <div className="space-y-3">
                  <p className="text-white/80 text-sm">Shift all other players&apos; cards:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ label: '⬅️ Shift Left', val: 0 }, { label: '➡️ Shift Right', val: 1 }].map(({ label, val }) => (
                      <button key={val} onClick={() => setSelectedTargets([val])}
                        className={`py-4 rounded-xl border-2 font-bold text-sm transition-all ${selectedTargets.includes(val) ? 'bg-pink-500/40 border-pink-300 text-white' : 'bg-white/10 border-white/30 text-white/70'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleNightAction} disabled={selectedTargets.length === 0} className="w-full py-2 bg-pink-700 hover:bg-pink-600 disabled:opacity-40 text-white font-bold rounded-xl transition-all">Shift Roles</button>
                </div>
              )}
            </motion.div>
          ) : nightActionDone ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 rounded-2xl p-5 border border-white/20 text-center"
            >
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-white mb-2">Action Complete</h3>

              {nightResult && (
                <div className="bg-black/30 rounded-xl p-3 text-sm text-left">
                  {nightResult.type === 'werewolf_team' && (
                    <p className="text-red-300">Your fellow werewolves: {nightResult.werewolves.join(', ') || 'None'}</p>
                  )}
                  {nightResult.type === 'center_card' && (
                    <p className="text-red-300">Center card {nightResult.index + 1} is: <strong>{ROLES[nightResult.role]?.icon} {ROLES[nightResult.role]?.name}</strong></p>
                  )}
                  {nightResult.type === 'minion_see' && (
                    <p className="text-rose-300">The werewolves are: {nightResult.werewolves.join(', ') || 'None (you\'re on your own!)'}</p>
                  )}
                  {nightResult.type === 'seer_player' && (
                    <p className="text-blue-300">{nightResult.targetName}&apos;s card is: <strong>{ROLES[nightResult.targetRole]?.icon} {ROLES[nightResult.targetRole]?.name}</strong></p>
                  )}
                  {nightResult.type === 'seer_center' && (
                    <p className="text-blue-300">Center cards {nightResult.indices.map(i => i + 1).join(' & ')}: <strong>{nightResult.roles.map(r => ROLES[r]?.name).join(' and ')}</strong></p>
                  )}
                  {nightResult.type === 'robber' && (
                    <p className="text-purple-300">You stole from {nightResult.targetName}. Your new role is: <strong>{ROLES[nightResult.newRole]?.icon} {ROLES[nightResult.newRole]?.name}</strong></p>
                  )}
                  {nightResult.type === 'troublemaker' && (
                    <p className="text-yellow-300">You swapped {nightResult.name1}&apos;s and {nightResult.name2}&apos;s roles.</p>
                  )}
                  {nightResult.type === 'drunk' && (
                    <p className="text-orange-300">You took center card {nightResult.index + 1}. You don&apos;t know what role you now have!</p>
                  )}
                  {nightResult.type === 'insomniac' && (
                    <p className="text-indigo-300">Your final role is: <strong>{ROLES[nightResult.finalRole]?.icon} {ROLES[nightResult.finalRole]?.name}</strong>
                      {nightResult.finalRole !== role ? ' ⚠️ Your card changed!' : ' (unchanged)'}</p>
                  )}
                </div>
              )}

              <p className="text-white/50 text-xs mt-2">Close your eyes and wait for morning...</p>
              {nightResult && (
                <button
                  onClick={() => setNightResultModal(nightResult)}
                  className="mt-3 w-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-semibold py-2 rounded-xl border border-white/20 transition-all"
                >
                  👁️ Review What You Saw
                </button>
              )}
            </motion.div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-5xl mb-3 animate-pulse">😴</div>
              <p className="text-white/70 font-semibold">You are asleep...</p>
              <p className="text-white/40 text-sm mt-1">
                {isMyNightTurn ? 'Your turn is next!' : `Waiting for the ${ROLES[currentNightRole]?.name}...`}
              </p>
              {r && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 mt-3 rounded-full ${r.badge} text-xs text-white`}>
                  {r.icon} You are the {r.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Night result modal overlay */}
        <AnimatePresence>
          {nightResultModal && <NightResultModal />}
        </AnimatePresence>
      </div>
    );
  }

  // DAY PHASE
  if (screen === 'day') {
    const dayEnd = roomData?.dayEndTime;
    const r = myOriginalRole ? ROLES[myOriginalRole] : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 p-4 text-white">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="text-center py-4">
            <div className="text-5xl mb-2">☀️</div>
            <h2 className="text-2xl font-black">Morning — Discuss!</h2>
            {dayEnd && <PhaseTimer endTime={dayEnd} paused={roomData?.timerPaused} pausedRemaining={roomData?.pausedRemaining} />}
            <p className="text-white/60 text-sm mt-1">Talk to each other. Accuse, bluff, and deduce.</p>
          </div>

          {/* Host timer controls */}
          {isHost && (
            <div className="bg-black/30 rounded-2xl p-3 border border-white/10 flex flex-wrap gap-2 justify-center">
              <button onClick={() => {
                if (roomData?.timerPaused) {
                  fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { timerPaused: false, dayEndTime: Date.now() + (roomData.pausedRemaining || 30000), pausedRemaining: null });
                } else {
                  const rem = Math.max(0, (roomData?.dayEndTime || Date.now()) - Date.now());
                  fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { timerPaused: true, pausedRemaining: rem });
                }
              }} className={`px-3 py-2 rounded-xl text-sm font-bold border transition-all ${roomData?.timerPaused ? 'bg-green-600/40 border-green-500 text-green-300 hover:bg-green-600/60' : 'bg-yellow-600/40 border-yellow-500 text-yellow-300 hover:bg-yellow-600/60'}`}>
                {roomData?.timerPaused ? '▶ Resume' : '⏸ Pause'}
              </button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { dayEndTime: (roomData?.dayEndTime || Date.now()) + 60000, timerPaused: false })} className="px-3 py-2 rounded-xl text-sm font-bold bg-blue-600/40 border border-blue-500 text-blue-300 hover:bg-blue-600/60 transition-all">+1 min</button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { dayEndTime: Math.max(Date.now() + 10000, (roomData?.dayEndTime || Date.now()) - 60000) })} className="px-3 py-2 rounded-xl text-sm font-bold bg-orange-600/40 border border-orange-500 text-orange-300 hover:bg-orange-600/60 transition-all">−1 min</button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote', voteEndTime: Date.now() + 60000, timerPaused: false })} className="px-3 py-2 rounded-xl text-sm font-bold bg-red-600/40 border border-red-500 text-red-300 hover:bg-red-600/60 transition-all">⏭ Skip to Vote</button>
            </div>
          )}

          {r && (
            roleHidden ? (
              <button
                onClick={() => setRoleHidden(false)}
                className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-white/60 hover:text-white transition-all"
              >
                <span className="text-2xl">🙈</span>
                <div className="text-left">
                  <p className="font-bold text-sm">Role Hidden</p>
                  <p className="text-xs text-white/40">Tap to reveal your role</p>
                </div>
              </button>
            ) : (
              <div className={`bg-gradient-to-br ${r.bg} rounded-2xl p-4 border ${r.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{r.icon}</span>
                    <div>
                      <p className="text-xs text-white/60">Your original role</p>
                      <h3 className="font-black text-lg text-white">{r.name}</h3>
                      <p className={`text-sm ${r.text} opacity-80`}>{r.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRoleHidden(true)}
                    className="ml-2 flex-shrink-0 bg-black/30 hover:bg-black/50 text-white/60 hover:text-white rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                    title="Hide role from others"
                  >
                    🙈 Hide
                  </button>
                </div>
              </div>
            )
          )}

          {nightResult && (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <h4 className="font-bold text-white/80 text-sm mb-2">🌙 What you learned last night:</h4>
              <div className="text-sm text-white/80">
                {nightResult.type === 'werewolf_team' && <p>Your fellow werewolves: <strong>{nightResult.werewolves.join(', ') || 'None'}</strong></p>}
                {nightResult.type === 'center_card' && <p>Center card {nightResult.index + 1}: <strong>{ROLES[nightResult.role]?.icon} {ROLES[nightResult.role]?.name}</strong></p>}
                {nightResult.type === 'minion_see' && <p>Werewolves: <strong>{nightResult.werewolves.join(', ') || 'None'}</strong></p>}
                {nightResult.type === 'seer_player' && <p>{nightResult.targetName} is: <strong>{ROLES[nightResult.targetRole]?.icon} {ROLES[nightResult.targetRole]?.name}</strong></p>}
                {nightResult.type === 'seer_center' && <p>Centers {nightResult.indices.map(i => i + 1).join(' & ')}: <strong>{nightResult.roles.map(r => ROLES[r]?.name).join(', ')}</strong></p>}
                {nightResult.type === 'robber' && <p>You stole from {nightResult.targetName} — now a <strong>{ROLES[nightResult.newRole]?.icon} {ROLES[nightResult.newRole]?.name}</strong></p>}
                {nightResult.type === 'troublemaker' && <p>You swapped {nightResult.name1} and {nightResult.name2}</p>}
                {nightResult.type === 'drunk' && <p>You drunkenly took center card {nightResult.index + 1} — you don&apos;t know your role!</p>}
                {nightResult.type === 'insomniac' && <p>Your final role: <strong>{ROLES[nightResult.finalRole]?.icon} {ROLES[nightResult.finalRole]?.name}</strong></p>}
              </div>
            </div>
          )}

          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h4 className="font-bold text-white/80 text-sm mb-3">Players</h4>
            <div className="flex flex-wrap gap-2">
              {playerList.map(p => (
                <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border
                  ${p.id === myId ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20'}`}>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold">
                    {p.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{p.name}{p.id === myId ? ' (You)' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-800/40 rounded-2xl p-4 border border-amber-600/40 text-center">
            <p className="text-amber-200 text-sm">💬 Discuss out loud! Voting begins when the timer runs out.</p>
          </div>
        </div>
      </div>
    );
  }

  // VOTE PHASE
  if (screen === 'vote') {
    const voteEnd = roomData?.voteEndTime;
    const votes = roomData?.votes || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-950 to-red-950 p-4 text-white">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="text-center py-4">
            <div className="text-5xl mb-2">🗳️</div>
            <h2 className="text-2xl font-black">Vote!</h2>
            {voteEnd && <PhaseTimer endTime={voteEnd} paused={roomData?.timerPaused} pausedRemaining={roomData?.pausedRemaining} />}
            <p className="text-white/60 text-sm mt-1">Who do you think is the werewolf?</p>
          </div>

          {isHost && (
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => {
                  if (roomData?.timerPaused) {
                    const newEnd = Date.now() + (roomData.pausedRemaining || 0);
                    fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { timerPaused: false, voteEndTime: newEnd, pausedRemaining: null });
                  } else {
                    const remaining = (voteEnd || Date.now()) - Date.now();
                    fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { timerPaused: true, pausedRemaining: Math.max(0, remaining) });
                  }
                }}
                className="px-3 py-2 rounded-xl text-sm font-bold bg-yellow-600/40 border border-yellow-500 text-yellow-300 hover:bg-yellow-600/60 transition-all"
              >{roomData?.timerPaused ? '▶ Resume' : '⏸ Pause'}</button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { voteEndTime: (roomData?.voteEndTime || Date.now()) + 30000, timerPaused: false })} className="px-3 py-2 rounded-xl text-sm font-bold bg-blue-600/40 border border-blue-500 text-blue-300 hover:bg-blue-600/60 transition-all">+30s</button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { voteEndTime: Math.max(Date.now() + 5000, (roomData?.voteEndTime || Date.now()) - 30000) })} className="px-3 py-2 rounded-xl text-sm font-bold bg-orange-600/40 border border-orange-500 text-orange-300 hover:bg-orange-600/60 transition-all">−30s</button>
              <button onClick={() => fb?.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'results', timerPaused: false })} className="px-3 py-2 rounded-xl text-sm font-bold bg-red-600/40 border border-red-500 text-red-300 hover:bg-red-600/60 transition-all">⏭ End Voting Now</button>
            </div>
          )}

          {myVote ? (
            <div className="bg-green-900/40 rounded-2xl p-4 border border-green-500/40 text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-green-300 font-bold">Vote cast for {players[myVote]?.name}</p>
              <p className="text-white/50 text-sm mt-1">{Object.keys(votes).length}/{playerList.length} voted</p>
            </div>
          ) : (
            <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
              <h4 className="font-bold text-white/80 mb-3">Vote to eliminate:</h4>
              <div className="grid grid-cols-2 gap-2">
                {playerList.filter(p => p.id !== myId).map(p => (
                  <button
                    key={p.id}
                    onClick={() => submitVote(p.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400 transition-all text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-rose-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {p.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-white/50 text-xs mb-2">Votes submitted: {Object.keys(votes).length}/{playerList.length}</h4>
            <div className="flex flex-wrap gap-2">
              {playerList.map(p => (
                <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                  ${votes[p.id] ? 'bg-green-800/40 text-green-300' : 'bg-white/5 text-white/40'}`}>
                  {p.name} {votes[p.id] ? '✓' : '…'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (screen === 'results') {
    const fr = finalRolesComputed || {};
    const result = gameResult || { winner: 'villagers', eliminated: [] };
    const eliminated = result.eliminated || [];
    const centerCards = roomData?.centerCards || [];

    const winnerConfig = {
      villagers: {
        bg: 'from-green-800 to-emerald-900',
        title: '🏘️ Villagers Win!',
        text: 'The werewolf was found and eliminated!',
        color: 'text-green-300'
      },
      werewolves: {
        bg: 'from-red-900 to-red-950',
        title: '🐺 Werewolves Win!',
        text: 'The werewolves escaped justice!',
        color: 'text-red-300'
      },
      tanner: {
        bg: 'from-gray-700 to-gray-900',
        title: '😅 Tanner Wins!',
        text: 'The Tanner wanted to be eliminated — and they were!',
        color: 'text-gray-300'
      }
    };

    const wc = winnerConfig[result.winner] || winnerConfig.villagers;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 text-white">
        <div className="max-w-xl mx-auto space-y-4">
          {/* Winner banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${wc.bg} rounded-3xl p-6 text-center border-2 border-white/20 shadow-2xl`}
          >
            <h2 className={`text-3xl font-black ${wc.color} mb-2`}>{wc.title}</h2>
            <p className="text-white/70">{wc.text}</p>
            {eliminated.length > 0 && (
              <p className="mt-3 text-white/80 text-sm">
                💀 Eliminated: <strong>{eliminated.map(id => players[id]?.name).join(', ')}</strong>
              </p>
            )}
            {eliminated.length === 0 && <p className="mt-2 text-white/60 text-sm">No one was eliminated (all tied).</p>}
          </motion.div>

          {/* Player role reveals */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-white/80 mb-3">🎭 Final Roles Revealed</h3>
            <div className="space-y-2">
              {playerList.map((p, i) => {
                const finalRole = fr[p.id] || p.originalRole;
                const originalRole = p.originalRole;
                const r = ROLES[finalRole];
                const changed = finalRole !== originalRole;
                const isElim = eliminated.includes(p.id);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border
                      ${isElim ? 'bg-red-900/40 border-red-600/40' : `bg-gradient-to-r ${r?.bg || 'from-slate-700 to-slate-800'} border-white/20`}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{isElim ? '💀' : (r?.icon || '?')}</span>
                      <div>
                        <p className="font-bold text-white">{p.name}{p.id === myId ? ' (You)' : ''}</p>
                        <p className={`text-xs ${r?.text || 'text-white/60'}`}>
                          {r?.name || finalRole}
                          {changed && <span className="text-yellow-300 ml-1">(was {ROLES[originalRole]?.name})</span>}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${r?.badge || 'bg-white/10'} text-white`}>
                      {r?.team}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Center cards */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-white/80 mb-3">📚 Center Cards</h3>
            <div className="flex gap-3 justify-center">
              {centerCards.map((role, i) => {
                const r = ROLES[role];
                return (
                  <div key={i} className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-gradient-to-br ${r?.bg || 'from-slate-700 to-slate-800'} border ${r?.border || 'border-white/20'}`}>
                    <span className="text-2xl">{r?.icon}</span>
                    <p className="text-xs font-bold text-white">{r?.name}</p>
                    <p className="text-xs text-white/50">Center {i + 1}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Votes recap */}
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <h3 className="font-bold text-white/80 mb-3">🗳️ How People Voted</h3>
            <div className="space-y-1">
              {playerList.map(p => {
                const votedForId = roomData?.votes?.[p.id];
                const votedFor = votedForId ? players[votedForId]?.name : 'Did not vote';
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm px-2 py-1">
                    <span className="text-white/80">{p.name}</span>
                    <span className="text-white/50">→ {votedFor}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Play again */}
          <div className="flex gap-3">
            {isHost && (
              <button
                onClick={async () => {
                  setScreen('lobby');
                  setMyOriginalRole(null);
                  setNightResult(null);
                  setNightResultModal(null);
                  setNightActionDone(false);
                  setMyVote(null);
                  setGameResult(null);
                  setFinalRolesComputed(null);
                  setSelectedTargets([]);
                  setSeerMode(null);
                  setRoleHidden(false);
                  const updates = {};
                  Object.keys(players).forEach(id => {
                    updates[`players/${id}/originalRole`] = '';
                    updates[`players/${id}/vote`] = null;
                    updates[`players/${id}/nightActionDone`] = false;
                  });
                  updates.phase = 'lobby';
                  updates.nightStep = 0;
                  updates.centerCards = [];
                  updates.nightActions = {};
                  updates.votes = {};
                  updates.dayEndTime = null;
                  updates.voteEndTime = null;
                  if (fb) await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), updates);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all"
              >
                🔄 Play Again
              </button>
            )}
            <button
              onClick={leaveGame}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl border border-white/20 transition-all"
            >
              Leave Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WerewolfGame;
