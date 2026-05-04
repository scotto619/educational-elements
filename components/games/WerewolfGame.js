// components/games/WerewolfGame.js — One Night Ultimate Werewolf (Visual Overhaul)
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Role Definitions (only roles with character images) ─────────────────────
const ROLES = {
  werewolf: {
    name: 'Werewolf', team: 'werewolves',
    desc: 'You are a Werewolf! Work with your pack to avoid being caught.',
    nightDesc: 'Wake up and see your fellow Werewolves. Lone wolf? Peek at a center card.',
    winCondition: 'Win if no Werewolf is eliminated.',
    hasAction: true, bg: 'from-red-900 to-red-950', border: 'border-red-600',
    text: 'text-red-100', badge: 'bg-red-800', teamLabel: 'Werewolf Team 🐺',
  },
  alphaWolf: {
    name: 'Alpha Wolf', team: 'werewolves',
    desc: 'Pack leader with dark power. You can secretly replace a player with a wolf from the center!',
    nightDesc: 'Wake with your pack. If a wolf card is in the center, swap it with any player\'s card.',
    winCondition: 'Win if no Werewolf is eliminated.',
    hasAction: true, bg: 'from-red-950 to-slate-900', border: 'border-red-400',
    text: 'text-red-100', badge: 'bg-red-900', teamLabel: 'Werewolf Team 🐺',
  },
  minion: {
    name: 'Minion', team: 'werewolves',
    desc: 'You serve the Werewolves and share their victory — even if you are eliminated!',
    nightDesc: 'Wake up and see who the Werewolves are. They do NOT see you.',
    winCondition: 'Win with the Werewolves. Even if you die, you win if they win.',
    hasAction: true, bg: 'from-rose-800 to-red-950', border: 'border-rose-500',
    text: 'text-rose-100', badge: 'bg-rose-800', teamLabel: 'Werewolf Team 🐺',
  },
  witch: {
    // Displayed as "Witch" (female) or "Warlock" (male)
    name: 'Witch', team: 'villagers',
    desc: 'A powerful potion-brewer. Peek at a center card and optionally brew a swap with any player.',
    nightDesc: 'Look at ONE center card. You may then swap it with any player\'s card (including yourself).',
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: true, bg: 'from-fuchsia-900 to-purple-950', border: 'border-fuchsia-500',
    text: 'text-fuchsia-100', badge: 'bg-fuchsia-900', teamLabel: 'Village Team 🏘️',
  },
  seer: {
    name: 'Seer', team: 'villagers',
    desc: 'You can glimpse one truth in the night. Use your vision wisely in discussion.',
    nightDesc: 'Look at ONE other player\'s card, OR look at TWO center cards.',
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: true, bg: 'from-blue-800 to-blue-950', border: 'border-blue-400',
    text: 'text-blue-100', badge: 'bg-blue-900', teamLabel: 'Village Team 🏘️',
  },
  robber: {
    name: 'Robber', team: 'villagers',
    desc: 'Steal a role from another player, look at your new card, and play as that role!',
    nightDesc: 'Swap your card with another player\'s card. Look at your new role.',
    winCondition: 'Win with your new team (whatever role you stole).',
    hasAction: true, bg: 'from-purple-800 to-purple-950', border: 'border-purple-400',
    text: 'text-purple-100', badge: 'bg-purple-900', teamLabel: 'Village Team 🏘️',
  },
  troublemaker: {
    name: 'Troublemaker', team: 'villagers',
    desc: 'Swap two other players\' cards without looking. Cause chaos and confusion!',
    nightDesc: 'Pick two other players and swap their cards (you don\'t see the roles).',
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: true, bg: 'from-amber-800 to-orange-950', border: 'border-amber-400',
    text: 'text-amber-100', badge: 'bg-amber-900', teamLabel: 'Village Team 🏘️',
  },
  drunk: {
    name: 'Drunk', team: 'villagers',
    desc: 'Too drunk to know your own role. You swap with a mystery center card and have no idea what you are!',
    nightDesc: 'Pick a center card to take. Your card goes to center. You don\'t see your new role.',
    winCondition: 'Win with your new team (whatever card you unknowingly took).',
    hasAction: true, bg: 'from-orange-800 to-amber-950', border: 'border-orange-400',
    text: 'text-orange-100', badge: 'bg-orange-900', teamLabel: 'Village Team 🏘️',
  },
  insomniac: {
    name: 'Insomniac', team: 'villagers',
    desc: 'You can\'t sleep. At the end of the night you check your card — it may have changed!',
    nightDesc: 'Look at your own card at the END of the night (it may have been swapped).',
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: true, bg: 'from-indigo-800 to-slate-950', border: 'border-indigo-400',
    text: 'text-indigo-100', badge: 'bg-indigo-900', teamLabel: 'Village Team 🏘️',
  },
  villager: {
    name: 'Villager', team: 'villagers',
    desc: 'A simple Villager with no special powers. Trust your instincts and deduce who the Werewolf is!',
    nightDesc: null,
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: false, bg: 'from-green-800 to-green-950', border: 'border-green-400',
    text: 'text-green-100', badge: 'bg-green-900', teamLabel: 'Village Team 🏘️',
  },
  mason: {
    name: 'Mason', team: 'villagers',
    desc: 'Part of a secret brotherhood. You and the other Masons wake up and recognize each other — total trust!',
    nightDesc: 'Wake up and see the other Masons. If alone, you know no other Mason is in play.',
    winCondition: 'Win with the village if a Werewolf is eliminated.',
    hasAction: true, bg: 'from-stone-700 to-stone-950', border: 'border-stone-400',
    text: 'text-stone-100', badge: 'bg-stone-700', teamLabel: 'Village Team 🏘️',
  },
  tanner: {
    name: 'Tanner', team: 'tanner',
    desc: 'You WANT to be eliminated! Your goal is to trick the village into voting you out.',
    nightDesc: null,
    winCondition: 'WIN by being eliminated! Get the most votes against you.',
    hasAction: false, bg: 'from-yellow-800 to-stone-950', border: 'border-yellow-600',
    text: 'text-yellow-100', badge: 'bg-yellow-900', teamLabel: 'Solo — Tanner 😅',
  },
  tannerApprentice: {
    name: 'Tanner Apprentice', team: 'tanner',
    desc: 'You\'re learning from the best. Just like the Tanner, you WANT to be voted out!',
    nightDesc: null,
    winCondition: 'WIN by being eliminated! Get the most votes against you.',
    hasAction: false, bg: 'from-lime-900 to-stone-950', border: 'border-lime-600',
    text: 'text-lime-100', badge: 'bg-lime-900', teamLabel: 'Solo — Tanner 😅',
  },
  prince: {
    // Displayed as "Prince" (male) or "Princess" (female)
    name: 'Prince', team: 'villagers',
    desc: 'Royalty cannot be executed! If the village votes you out, you reveal your card and survive.',
    nightDesc: null,
    winCondition: 'Win with the village. You CANNOT be eliminated by votes.',
    hasAction: false, bg: 'from-sky-800 to-indigo-950', border: 'border-sky-400',
    text: 'text-sky-100', badge: 'bg-sky-900', teamLabel: 'Village Team 🏘️',
  },
};

const WEREWOLF_ROLES = new Set(['werewolf', 'alphaWolf']);

// Night order — only active-action roles, passive roles never appear
const NIGHT_ORDER = [
  'alphaWolf', 'werewolf', 'minion', 'mason',
  'seer', 'witch', 'robber', 'troublemaker', 'drunk', 'insomniac',
];

// Roles grouped for lobby picker
const ROLE_GROUPS = [
  { label: 'Werewolf Team 🐺', keys: ['werewolf', 'alphaWolf', 'minion'] },
  { label: 'Village Team 🏘️', keys: ['seer', 'witch', 'robber', 'troublemaker', 'drunk', 'insomniac', 'villager', 'mason', 'prince'] },
  { label: 'Solo Roles', keys: ['tanner', 'tannerApprentice'] },
];

const ROLE_MAX = {
  werewolf: 3, alphaWolf: 1, minion: 1, witch: 1, seer: 1, robber: 1,
  troublemaker: 1, drunk: 1, insomniac: 1, villager: 5,
  mason: 2, tanner: 1, tannerApprentice: 1, prince: 1,
};

// ─── Image helpers ────────────────────────────────────────────────────────────
function getRoleImage(roleKey, gender, masonSlot) {
  const g = gender === 'female' ? 'Female' : 'Male';
  const map = {
    werewolf:        `Werewolf ${g}.png`,
    alphaWolf:       `Alpha Wolf ${g}.png`,
    witch:           gender === 'female' ? 'Witch.png' : 'Warlock.png',
    minion:          `Minion ${g}.png`,
    seer:            `Seer ${g}.png`,
    robber:          `Robber ${g}.png`,
    troublemaker:    `Trouble Maker ${g}.png`,
    drunk:           `Drunk ${g}.png`,
    insomniac:       `Insomniac ${g}.png`,
    villager:        `Villager ${g}.png`,
    mason:           `Mason ${masonSlot || 1} ${g}.png`,
    tanner:          `Tanner ${g}.png`,
    tannerApprentice:`Tanner Apprentice ${g}.png`,
    prince:          gender === 'female' ? 'Princess.png' : 'Prince.png',
  };
  return `/games/werewolf/${map[roleKey] || `Villager ${g}.png`}`;
}

function getRoleDisplayName(roleKey, gender) {
  if (roleKey === 'witch')  return gender === 'female' ? 'Witch' : 'Warlock';
  if (roleKey === 'prince') return gender === 'female' ? 'Princess' : 'Prince';
  return ROLES[roleKey]?.name || roleKey;
}

// ─── Game helpers ─────────────────────────────────────────────────────────────
function genId()       { return Math.random().toString(36).slice(2, 10); }
function genRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c = ''; for (let i = 0; i < 4; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function fmtTime(sec) {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function resolveNightActions(originalRoles, centerCards, nightActions) {
  const finalRoles  = { ...originalRoles };
  const finalCenter = [...centerCards];
  const na = nightActions || {};
  const find = role => Object.values(na).find(a => a?.role === role);

  // alphaWolf: swap center wolf card with a player
  const aw = find('alphaWolf');
  if (aw && !aw.noWolf && aw.targetId && aw.centerIndex !== undefined) {
    const tmp = finalRoles[aw.targetId]; finalRoles[aw.targetId] = finalCenter[aw.centerIndex]; finalCenter[aw.centerIndex] = tmp;
  }
  // witch: swap a center card with a player
  const wt = find('witch');
  if (wt && wt.swapTargetId) {
    const tmp = finalRoles[wt.swapTargetId]; finalRoles[wt.swapTargetId] = finalCenter[wt.centerIndex]; finalCenter[wt.centerIndex] = tmp;
  }
  // robber
  const rb = find('robber');
  if (rb?.actorId && rb?.targetId) { const tmp = finalRoles[rb.actorId]; finalRoles[rb.actorId] = finalRoles[rb.targetId]; finalRoles[rb.targetId] = tmp; }
  // troublemaker
  const tm = find('troublemaker');
  if (tm?.target1Id && tm?.target2Id) { const tmp = finalRoles[tm.target1Id]; finalRoles[tm.target1Id] = finalRoles[tm.target2Id]; finalRoles[tm.target2Id] = tmp; }
  // drunk
  const dr = find('drunk');
  if (dr?.actorId !== undefined && dr?.centerIndex !== undefined) { const tmp = finalRoles[dr.actorId]; finalRoles[dr.actorId] = finalCenter[dr.centerIndex]; finalCenter[dr.centerIndex] = tmp; }

  return { finalRoles, finalCenter };
}

function determineWinner(finalRoles, votes, playerIds, originalRoles) {
  const voteCounts = {};
  playerIds.forEach(id => { voteCounts[id] = 0; });
  Object.entries(votes || {}).forEach(([, t]) => { if (voteCounts[t] !== undefined) voteCounts[t]++; });

  const maxVotes = Math.max(...Object.values(voteCounts), 0);
  let eliminated = maxVotes < 2 ? [] : playerIds.filter(id => voteCounts[id] === maxVotes);

  // All tied with 1 vote and 3+ players = no elimination
  if (eliminated.length === playerIds.length && maxVotes === 1 && playerIds.length >= 3) eliminated = [];

  // Prince/Princess protection — remove from eliminated list
  eliminated = eliminated.filter(id => finalRoles[id] !== 'prince');

  const werewolvesExist = playerIds.some(id => WEREWOLF_ROLES.has(finalRoles[id]));
  const werewolfKilled  = eliminated.some(id => WEREWOLF_ROLES.has(finalRoles[id]));
  const tannerKilled    = eliminated.some(id => ['tanner', 'tannerApprentice'].includes(finalRoles[id]));

  if (tannerKilled && !werewolfKilled) return { winner: 'tanner', eliminated };
  if (werewolfKilled)                  return { winner: 'villagers', eliminated };
  if (!werewolvesExist && !eliminated.length) return { winner: 'villagers', eliminated };
  return { winner: 'werewolves', eliminated };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Role card using actual character image
const RoleCard = ({ roleKey, gender, masonSlot, large, dim, glow, onClick, showBack }) => {
  const r = ROLES[roleKey];
  if (!r && !showBack) return null;
  const imgSrc = roleKey ? getRoleImage(roleKey, gender, masonSlot) : null;
  const displayName = getRoleDisplayName(roleKey, gender);

  if (showBack) {
    return (
      <div onClick={onClick} className={`relative rounded-2xl overflow-hidden shadow-2xl select-none
        ${large ? 'w-48 h-64' : 'w-28 h-36'}
        bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-600/40
        flex flex-col items-center justify-center gap-2 cursor-pointer
        ${glow ? 'ring-4 ring-yellow-400/60' : ''}
      `}>
        <div className="text-5xl opacity-20 font-black text-white">?</div>
        <p className="text-white/20 text-xs font-bold tracking-[0.2em] uppercase">Role Hidden</p>
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.04, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      className={`relative rounded-2xl overflow-hidden shadow-2xl select-none
        border-2 ${r.border}
        ${large ? 'w-48 h-64' : 'w-28 h-36'}
        ${onClick ? 'cursor-pointer' : ''}
        ${dim ? 'opacity-40' : ''}
        ${glow ? 'ring-4 ring-yellow-400/60 shadow-yellow-400/30' : ''}
      `}
    >
      {imgSrc && (
        <img src={imgSrc} alt={displayName} className="absolute inset-0 w-full h-full object-cover object-top" />
      )}
      {/* Gradient overlay for text readability */}
      <div className={`absolute inset-0 bg-gradient-to-t ${r.bg} opacity-70`} />
      <div className="absolute bottom-0 left-0 right-0 p-2 flex flex-col items-center">
        <p className={`font-black text-white text-center leading-tight drop-shadow-lg ${large ? 'text-sm' : 'text-[10px]'}`}>
          {displayName.toUpperCase()}
        </p>
        {large && (
          <p className={`text-xs mt-0.5 font-semibold opacity-80 text-center ${r.text}`}>
            {r.teamLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Small role badge for lobby role picker
const RoleTile = ({ roleKey, count, onAdd, onRemove, onInfo }) => {
  const r = ROLES[roleKey];
  const max = ROLE_MAX[roleKey] || 1;
  const active = count > 0;
  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-all ${active ? r.border + ' bg-white/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-2 p-2">
        <div className={`w-10 h-12 rounded-lg overflow-hidden flex-shrink-0 relative bg-gradient-to-br ${r.bg}`}>
          <img src={getRoleImage(roleKey, 'male', 1)} alt={r.name} className="w-full h-full object-cover object-top" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold truncate ${active ? 'text-white' : 'text-white/50'}`}>{r.name}</p>
          <p className={`text-[10px] truncate ${active ? r.text : 'text-white/25'} opacity-80`}>{r.teamLabel.split(' ')[0]}</p>
        </div>
        <button onClick={onInfo} className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/40 hover:text-white text-[10px] flex items-center justify-center flex-shrink-0 transition-all">?</button>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={onRemove} disabled={count === 0} className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/50 text-white text-sm font-bold flex items-center justify-center disabled:opacity-20 transition-all">−</button>
          <span className="w-5 text-center text-xs font-black text-white">{count}</span>
          <button onClick={onAdd} disabled={count >= max} className="w-6 h-6 rounded-full bg-green-500/20 hover:bg-green-500/50 text-white text-sm font-bold flex items-center justify-center disabled:opacity-20 transition-all">+</button>
        </div>
      </div>
    </div>
  );
};

// Role info modal
const RoleInfoModal = ({ roleKey, gender = 'male', onClose }) => {
  const r = ROLES[roleKey];
  if (!r) return null;
  const name = getRoleDisplayName(roleKey, gender);
  const img = getRoleImage(roleKey, gender, 1);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`bg-gradient-to-br ${r.bg} border-2 ${r.border} rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl`}
        onClick={e => e.stopPropagation()}>
        <div className="relative h-40">
          <img src={img} alt={name} className="w-full h-full object-cover object-top" />
          <div className={`absolute inset-0 bg-gradient-to-t ${r.bg}`} style={{ opacity: 0.7 }} />
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-2xl font-black text-white drop-shadow-lg">{name}</h2>
            <span className={`text-xs font-bold ${r.text} opacity-80`}>{r.teamLabel}</span>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Description</p>
            <p className={`${r.text} text-sm leading-relaxed`}>{r.desc}</p>
          </div>
          {r.nightDesc && (
            <div className="bg-black/30 rounded-xl p-3">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">🌙 Night Action</p>
              <p className={`${r.text} text-sm`}>{r.nightDesc}</p>
            </div>
          )}
          <div className="bg-black/30 rounded-xl p-3">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">🏆 Win Condition</p>
            <p className={`${r.text} text-sm`}>{r.winCondition}</p>
          </div>
          <button onClick={onClose} className="w-full bg-black/30 hover:bg-black/50 text-white/60 hover:text-white font-bold py-2.5 rounded-xl transition-all text-sm">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const WerewolfGame = ({ studentData, showToast, updateStudentData, classData }) => {
  const [fb, setFb]                           = useState(null);
  const [screen, setScreen]                   = useState('menu');
  const [joinCode, setJoinCode]               = useState('');
  const [isHost, setIsHost]                   = useState(false);
  const [myId]                                = useState(() => genId());
  const [roomCode, setRoomCode]               = useState('');
  const [roomData, setRoomData]               = useState(null);
  const [myOriginalRole, setMyOriginalRole]   = useState(null);
  const [myGender, setMyGender]               = useState('male');
  const [nightActionDone, setNightActionDone] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [myVote, setMyVote]                   = useState(null);
  const [seerMode, setSeerMode]               = useState(null);
  const [roleRevealed, setRoleRevealed]       = useState(false); // has user ever tapped to see
  const [roleVisible, setRoleVisible]         = useState(false); // currently showing
  const [nightResult, setNightResult]         = useState(null);
  const [showNightResult, setShowNightResult] = useState(false);
  const [roleInfoModal, setRoleInfoModal]     = useState(null);
  const [hostRolePool, setHostRolePool]       = useState({
    werewolf: 2, seer: 1, robber: 1, troublemaker: 1, villager: 1,
  });
  const [nightActionSubStep, setNightActionSubStep] = useState(null);
  const [witchPeekedCard, setWitchPeekedCard]       = useState(null);
  const [gameResult, setGameResult]                 = useState(null);
  const [finalRolesData, setFinalRolesData]         = useState(null);
  const [nightCountdown, setNightCountdown]         = useState(7);
  const [dayCountdown, setDayCountdown]             = useState(300);

  const roomRef        = useRef(null);
  const hostIntervalRef = useRef(null);
  const nightTickRef   = useRef(null);
  const dayTickRef     = useRef(null);

  const playerName = studentData?.firstName || studentData?.name || 'Player';

  // ── Dynamic Firebase init ─────────────────────────────────────────────────
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

  // ── Firebase: subscribe to room ───────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `werewolfRooms/${roomCode}`);
    roomRef.current = rRef;

    const unsub = fb.onValue(rRef, snap => {
      if (!snap.exists()) {
        if (screen !== 'menu') { showToast?.('Room no longer exists.', 'error'); resetToMenu(); }
        return;
      }
      const data = snap.val();
      setRoomData(data);

      // Sync my role
      if (data.players?.[myId]?.originalRole && !myOriginalRole) {
        setMyOriginalRole(data.players[myId].originalRole);
      }

      // Phase transitions
      if (data.phase === 'roleReveal' && screen === 'lobby') {
        setScreen('roleReveal'); setRoleRevealed(false); setRoleVisible(false);
      }
      if (data.phase === 'night' && (screen === 'roleReveal' || screen === 'lobby')) {
        setScreen('night'); setNightActionDone(false); setNightResult(null); setShowNightResult(false);
      }
      if (data.phase === 'night' && screen === 'night') {
        // Reset action state when night step changes
      }
      if (data.phase === 'day' && screen === 'night') {
        setScreen('day'); setNightResult(null); setShowNightResult(false);
      }
      if (data.phase === 'vote' && screen === 'day') {
        setScreen('vote'); setMyVote(null);
      }
      if (data.phase === 'results' && screen === 'vote') {
        setScreen('results');
        const originalRoles = {};
        Object.entries(data.players || {}).forEach(([id, p]) => { originalRoles[id] = p.originalRole; });
        const { finalRoles } = resolveNightActions(originalRoles, data.centerCards || [], data.nightActions || {});
        const playerIds = Object.keys(data.players || {});
        const result = determineWinner(finalRoles, data.votes || {}, playerIds, originalRoles);
        setFinalRolesData(finalRoles);
        setGameResult(result);
      }
    });

    return () => fb.off(rRef, 'value', unsub);
  }, [roomCode, screen, myId, myOriginalRole, fb]);

  // ── Night countdown (local tick from stepStartTime) ───────────────────────
  useEffect(() => {
    if (screen !== 'night' || !roomData?.stepStartTime) return;
    if (nightTickRef.current) clearInterval(nightTickRef.current);
    nightTickRef.current = setInterval(() => {
      const elapsed = (Date.now() - roomData.stepStartTime) / 1000;
      const remaining = Math.max(0, 7 - elapsed);
      setNightCountdown(Math.ceil(remaining));
    }, 250);
    return () => clearInterval(nightTickRef.current);
  }, [screen, roomData?.stepStartTime]);

  // Reset night action state when step changes
  const prevNightStepRef = useRef(-1);
  useEffect(() => {
    const step = roomData?.nightStep ?? 0;
    if (step !== prevNightStepRef.current) {
      prevNightStepRef.current = step;
      setNightActionDone(false);
      setSelectedTargets([]);
      setSeerMode(null);
      setNightActionSubStep(null);
      setWitchPeekedCard(null);
    }
  }, [roomData?.nightStep]);

  // ── Day countdown ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'day' || !roomData?.dayEndTime) return;
    if (dayTickRef.current) clearInterval(dayTickRef.current);
    dayTickRef.current = setInterval(() => {
      setDayCountdown(Math.max(0, Math.ceil((roomData.dayEndTime - Date.now()) / 1000)));
    }, 500);
    return () => clearInterval(dayTickRef.current);
  }, [screen, roomData?.dayEndTime]);

  // ── Host: drive night phase (7s per active role) ──────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || roomData.phase !== 'night' || !fb) return;
    if (hostIntervalRef.current) clearInterval(hostIntervalRef.current);

    hostIntervalRef.current = setInterval(async () => {
      const snap = await fb.get(fb.ref(fb.database, `werewolfRooms/${roomCode}`));
      if (!snap.exists()) return;
      const data = snap.val();
      if (data.phase !== 'night') { clearInterval(hostIntervalRef.current); return; }

      const elapsed = Date.now() - (data.stepStartTime ?? Date.now());
      if (elapsed < 7000) return; // Always wait full 7 seconds

      const activeOrder = data.activeNightOrder || [];
      const nextStep = (data.nightStep ?? 0) + 1;

      if (nextStep >= activeOrder.length) {
        clearInterval(hostIntervalRef.current);
        await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
          phase: 'day',
          dayEndTime: Date.now() + 300000, // 5-minute discussion
        });
      } else {
        await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
          nightStep: nextStep,
          stepStartTime: Date.now(),
        });
      }
    }, 500);

    return () => clearInterval(hostIntervalRef.current);
  }, [isHost, roomData?.phase, roomData?.nightStep, roomCode, fb]);

  // ── Host: day → vote, vote → results ─────────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || !fb) return;
    if (roomData.phase === 'day') {
      const end = roomData.dayEndTime;
      if (!end) return;
      const rem = end - Date.now();
      if (rem <= 0) { fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote' }); return; }
      const t = setTimeout(() => fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote' }), rem);
      return () => clearTimeout(t);
    }
    if (roomData.phase === 'vote') {
      const allVoted = Object.keys(roomData.players || {}).every(id => roomData.votes?.[id]);
      if (allVoted) {
        const t = setTimeout(() => fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'results' }), 800);
        return () => clearTimeout(t);
      }
    }
  }, [isHost, roomData?.phase, roomData?.dayEndTime, roomData?.votes, roomCode, fb]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const getRolePoolArray = useCallback(() => {
    const arr = [];
    Object.entries(hostRolePool).forEach(([key, cnt]) => { for (let i = 0; i < cnt; i++) arr.push(key); });
    return arr;
  }, [hostRolePool]);

  const createRoom = useCallback(async () => {
    if (!fb) { showToast?.('Game engine loading, please try again.', 'error'); return; }
    const code = genRoomCode();
    setRoomCode(code); setIsHost(true);
    await fb.set(fb.ref(fb.database, `werewolfRooms/${code}`), {
      host: myId, phase: 'lobby', createdAt: Date.now(),
      players: { [myId]: { name: playerName, gender: myGender, isHost: true, originalRole: '', masonSlot: 0 } },
      rolePool: getRolePoolArray(), nightStep: 0, centerCards: [], nightActions: {}, votes: {},
    });
    setScreen('lobby');
    showToast?.(`Room created! Code: ${code}`, 'success');
  }, [fb, myId, playerName, myGender, getRolePoolArray, showToast]);

  const joinRoom = useCallback(async () => {
    if (!fb) { showToast?.('Game engine loading, please try again.', 'error'); return; }
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) { showToast?.('Enter a 4-character room code.', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `werewolfRooms/${code}`));
    if (!snap.exists()) { showToast?.('Room not found.', 'error'); return; }
    const data = snap.val();
    if (data.phase !== 'lobby') { showToast?.('Game already started.', 'error'); return; }
    if (Object.keys(data.players || {}).length >= 10) { showToast?.('Room is full.', 'error'); return; }
    setRoomCode(code); setIsHost(false);
    await fb.update(fb.ref(fb.database, `werewolfRooms/${code}/players/${myId}`), {
      name: playerName, gender: myGender, isHost: false, originalRole: '', masonSlot: 0,
    });
    setScreen('lobby');
    showToast?.(`Joined room ${code}!`, 'success');
  }, [fb, joinCode, myId, playerName, myGender, showToast]);

  const startGame = useCallback(async () => {
    if (!isHost || !fb) return;
    const players = Object.entries(roomData?.players || {});
    const playerIds = players.map(([id]) => id);
    if (playerIds.length < 3) { showToast?.('Need at least 3 players.', 'error'); return; }
    const pool = getRolePoolArray();
    if (pool.length !== playerIds.length + 3) {
      showToast?.(`Select exactly ${playerIds.length + 3} roles (${playerIds.length} players + 3 center cards).`, 'error'); return;
    }

    const shuffled = shuffle(pool);
    const centerCards = shuffled.slice(0, 3);
    const dealt = shuffled.slice(3);

    // Build active night order from all roles in play (player + center)
    const allRolesInPlay = new Set([...dealt, ...centerCards]);
    const activeNightOrder = NIGHT_ORDER.filter(r => {
      if (!allRolesInPlay.has(r)) return false;
      if (r === 'mason') return [...allRolesInPlay].filter(x => x === 'mason').length >= 2;
      return true;
    });

    const updates = {};
    let masonSlot = 0;
    // Sort by join order (using player index)
    players.sort(([, a], [, b]) => (a.joinedAt || 0) - (b.joinedAt || 0));
    playerIds.forEach((id, i) => {
      updates[`players/${id}/originalRole`] = dealt[i];
      if (dealt[i] === 'mason') { masonSlot++; updates[`players/${id}/masonSlot`] = masonSlot; }
    });
    updates.centerCards     = centerCards;
    updates.rolePool        = pool;
    updates.activeNightOrder = activeNightOrder;
    updates.phase           = 'roleReveal';
    updates.nightStep       = 0;
    updates.stepStartTime   = Date.now();

    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), updates);
  }, [fb, isHost, roomData, getRolePoolArray, roomCode, showToast]);

  const beginNight = useCallback(async () => {
    if (!isHost || !fb) return;
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
      phase: 'night', nightStep: 0, stepStartTime: Date.now(),
    });
  }, [fb, isHost, roomCode]);

  const skipToVote = useCallback(async () => {
    if (!isHost || !fb || roomData?.phase !== 'day') return;
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { phase: 'vote' });
  }, [fb, isHost, roomCode, roomData?.phase]);

  const submitNightAction = useCallback(async actionData => {
    if (nightActionDone || !fb) return;
    setNightActionDone(true);
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}/nightActions/${myId}`), { ...actionData, done: true });
  }, [fb, nightActionDone, roomCode, myId]);

  const submitVote = useCallback(async targetId => {
    if (myVote || !fb) return;
    setMyVote(targetId);
    await fb.set(fb.ref(fb.database, `werewolfRooms/${roomCode}/votes/${myId}`), targetId);
  }, [fb, myVote, roomCode, myId]);

  const resetToMenu = useCallback(async () => {
    if (roomCode && fb) await fb.remove(fb.ref(fb.database, `werewolfRooms/${roomCode}/players/${myId}`)).catch(() => {});
    setScreen('menu'); setRoomCode(''); setRoomData(null); setMyOriginalRole(null);
    setNightResult(null); setNightActionDone(false); setMyVote(null);
    setGameResult(null); setFinalRolesData(null); setRoleRevealed(false); setRoleVisible(false);
    setSeerMode(null); setSelectedTargets([]); setNightActionSubStep(null); setWitchPeekedCard(null);
  }, [roomCode, myId, fb]);

  const playAgain = useCallback(async () => {
    if (!isHost || !fb) return;
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), {
      phase: 'lobby', centerCards: [], nightActions: {}, votes: {},
      activeNightOrder: null, rolePool: getRolePoolArray(),
    });
    // Clear player roles
    const playerIds = Object.keys(roomData?.players || {});
    const pUpdates = {};
    playerIds.forEach(id => { pUpdates[`players/${id}/originalRole`] = ''; pUpdates[`players/${id}/masonSlot`] = 0; });
    await fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), pUpdates);
    setScreen('lobby'); setMyOriginalRole(null); setMyVote(null);
    setGameResult(null); setFinalRolesData(null);
  }, [fb, isHost, roomCode, roomData, getRolePoolArray]);

  // ── Night action handler ──────────────────────────────────────────────────
  const handleNightAction = useCallback(() => {
    const role = myOriginalRole;
    const players = roomData?.players || {};
    const centerCards = roomData?.centerCards || [];
    const origRoles = {};
    Object.entries(players).forEach(([id, p]) => { origRoles[id] = p.originalRole; });
    const otherIds = Object.keys(players).filter(id => id !== myId);

    const getWolfPack = () => Object.entries(players)
      .filter(([id, p]) => WEREWOLF_ROLES.has(p.originalRole) && id !== myId)
      .map(([, p]) => p.name);

    let result = null, actionData = null;

    if (role === 'werewolf') {
      const pack = getWolfPack();
      if (pack.length > 0) {
        result = { type: 'werewolf_team', werewolves: pack };
        actionData = { role: 'werewolf', saw: 'teammates' };
      } else if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        result = { type: 'center_card', index: idx, roleKey: centerCards[idx] };
        actionData = { role: 'werewolf', lookedAtCenter: true, centerIndex: idx };
      } else return;

    } else if (role === 'alphaWolf') {
      const pack = getWolfPack();
      const wolfCenterIdx = centerCards.findIndex(c => WEREWOLF_ROLES.has(c));
      if (nightActionSubStep === null) {
        if (wolfCenterIdx === -1 || selectedTargets[0] === 'skip') {
          result = { type: 'alphaWolf_no_wolf', pack };
          actionData = { role: 'alphaWolf', noWolf: true };
        } else {
          setNightActionSubStep('place'); return;
        }
      } else if (nightActionSubStep === 'place' && selectedTargets.length === 1) {
        result = { type: 'alphaWolf', pack, targetName: players[selectedTargets[0]]?.name, wolfCenterIdx };
        actionData = { role: 'alphaWolf', targetId: selectedTargets[0], centerIndex: wolfCenterIdx };
      } else return;

    } else if (role === 'minion') {
      const wolves = Object.entries(players).filter(([, p]) => WEREWOLF_ROLES.has(p.originalRole)).map(([, p]) => p.name);
      result = { type: 'minion_see', werewolves: wolves };
      actionData = { role: 'minion', saw: 'werewolves' };

    } else if (role === 'mason') {
      const mates = Object.entries(players).filter(([id, p]) => p.originalRole === 'mason' && id !== myId).map(([, p]) => p.name);
      result = { type: 'mason', masons: mates };
      actionData = { role: 'mason' };

    } else if (role === 'seer') {
      if (seerMode === 'player' && selectedTargets.length === 1) {
        result = { type: 'seer_player', targetName: players[selectedTargets[0]]?.name, targetRole: origRoles[selectedTargets[0]] };
        actionData = { role: 'seer', mode: 'player', playerTarget: selectedTargets[0] };
      } else if (seerMode === 'center' && selectedTargets.length === 2) {
        result = { type: 'seer_center', indices: [...selectedTargets], roles: selectedTargets.map(i => centerCards[i]) };
        actionData = { role: 'seer', mode: 'center', center1: selectedTargets[0], center2: selectedTargets[1] };
      } else return;

    } else if (role === 'witch') {
      if (!witchPeekedCard) return;
      const swapTarget = selectedTargets[0] || null;
      result = { type: 'witch', peekedCard: witchPeekedCard, swapTargetId: swapTarget, swapTargetName: swapTarget ? players[swapTarget]?.name : null };
      actionData = { role: 'witch', centerIndex: witchPeekedCard.index, swapTargetId: swapTarget || null };

    } else if (role === 'robber') {
      if (selectedTargets.length !== 1) return;
      result = { type: 'robber', targetName: players[selectedTargets[0]]?.name, newRole: origRoles[selectedTargets[0]] };
      actionData = { role: 'robber', actorId: myId, targetId: selectedTargets[0] };

    } else if (role === 'troublemaker') {
      if (selectedTargets.length !== 2) return;
      const [t1, t2] = selectedTargets;
      result = { type: 'troublemaker', name1: players[t1]?.name, name2: players[t2]?.name };
      actionData = { role: 'troublemaker', target1Id: t1, target2Id: t2 };

    } else if (role === 'drunk') {
      if (selectedTargets.length !== 1) return;
      result = { type: 'drunk', index: selectedTargets[0] };
      actionData = { role: 'drunk', actorId: myId, centerIndex: selectedTargets[0] };

    } else if (role === 'insomniac') {
      const { finalRoles } = resolveNightActions(origRoles, centerCards, roomData?.nightActions || {});
      result = { type: 'insomniac', finalRole: finalRoles[myId] || myOriginalRole };
      actionData = { role: 'insomniac', finalRole: finalRoles[myId] || myOriginalRole };
    }

    if (result && actionData) {
      setNightResult(result); setShowNightResult(true);
      submitNightAction(actionData);
    }
  }, [myOriginalRole, roomData, myId, selectedTargets, seerMode, nightActionSubStep, witchPeekedCard, submitNightAction]);

  // ─── Derived state ────────────────────────────────────────────────────────
  const players        = roomData?.players || {};
  const playerList     = Object.entries(players).map(([id, p]) => ({ id, ...p }));
  const otherPlayers   = playerList.filter(p => p.id !== myId);
  const activeOrder    = roomData?.activeNightOrder || [];
  const currentNightRole = activeOrder[roomData?.nightStep ?? 0];
  const isMyNightTurn  = myOriginalRole === currentNightRole;
  const myMasonSlot    = players[myId]?.masonSlot || 1;
  const myPlayerGender = players[myId]?.gender || myGender;

  // ─── SCREENS ──────────────────────────────────────────────────────────────

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0d0d1a 60%, #050508 100%)' }}>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex justify-center gap-3 mb-6">
            {['werewolf','seer','tanner'].map((r, i) => (
              <motion.div key={r} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} className="w-16 h-20 rounded-xl overflow-hidden relative border border-white/10 shadow-xl">
                <img src={getRoleImage(r, i === 1 ? 'female' : 'male', 1)} alt="" className="w-full h-full object-cover object-top" />
                <div className={`absolute inset-0 bg-gradient-to-t ${ROLES[r].bg} opacity-40`} />
              </motion.div>
            ))}
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight">One Night</h1>
          <h2 className="text-5xl font-black tracking-tight" style={{ color: 'rgba(255,255,255,0.2)' }}>Werewolf</h2>
          <p className="text-white/30 text-sm mt-3 tracking-wider">Social deduction · 3–10 players</p>
        </motion.div>

        {/* Gender picker */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 w-full max-w-xs">
          <p className="text-white/40 text-xs text-center tracking-widest uppercase mb-3">Choose your character</p>
          <div className="grid grid-cols-2 gap-3">
            {['male', 'female'].map(g => {
              const previewRole = g === 'male' ? 'werewolf' : 'seer';
              return (
                <button key={g} onClick={() => setMyGender(g)}
                  className={`relative rounded-2xl overflow-hidden h-28 border-2 transition-all ${myGender === g ? 'border-white/60 scale-105 shadow-2xl shadow-white/10' : 'border-white/10 opacity-60'}`}>
                  <img src={getRoleImage(previewRole, g, 1)} alt={g} className="w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <p className="text-white font-black text-sm capitalize tracking-wide">{g}</p>
                    {myGender === g && <p className="text-yellow-400 text-[10px] font-bold">✓ Selected</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full max-w-xs space-y-3">
          <button onClick={createRoom}
            className="w-full bg-white text-gray-950 font-black py-4 rounded-2xl text-lg hover:bg-white/90 active:scale-[0.98] shadow-lg shadow-black/40 transition-all">
            Create Room
          </button>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-xs tracking-widest uppercase">or join</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
              placeholder="CODE" onKeyDown={e => e.key === 'Enter' && joinRoom()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 font-black text-2xl tracking-[0.4em] text-center uppercase focus:outline-none focus:border-white/30 transition-all" />
            <button onClick={joinRoom}
              className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black px-6 rounded-xl transition-all active:scale-[0.98] text-lg">
              Join
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── LOBBY ─────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    const playerCount  = playerList.length;
    const neededRoles  = playerCount + 3;
    const poolTotal    = Object.values(hostRolePool).reduce((a, b) => a + b, 0);
    const poolOk       = poolTotal === neededRoles;

    const updatePool = (key, delta) => {
      setHostRolePool(prev => {
        const next = { ...prev, [key]: Math.max(0, Math.min(ROLE_MAX[key], (prev[key] || 0) + delta)) };
        if (isHost && fb && roomCode) {
          const arr = [];
          Object.entries(next).forEach(([k, c]) => { for (let i = 0; i < c; i++) arr.push(k); });
          fb.update(fb.ref(fb.database, `werewolfRooms/${roomCode}`), { rolePool: arr }).catch(() => {});
        }
        return next;
      });
    };

    return (
      <div className="min-h-screen p-4 text-white" style={{ background: '#0d0d1a' }}>
        <div className="max-w-2xl mx-auto space-y-4 pb-6">

          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <button onClick={resetToMenu} className="text-white/40 hover:text-white/70 text-sm transition-colors px-1">← Leave</button>
            <span className="text-white/30 text-xs font-mono">{playerCount}/10 players</span>
          </div>

          {/* Room code */}
          <div className="text-center py-5 border-b border-white/[0.06]">
            <p className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Room Code</p>
            <p className="text-6xl font-black tracking-[0.15em] text-white">{roomCode}</p>
            <p className="text-white/20 text-xs mt-2">Share this code with your players</p>
          </div>

          {/* Players */}
          <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase mb-3">Players · {playerCount}</p>
            <div className="grid grid-cols-2 gap-2">
              {playerList.map(p => (
                <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all
                  ${p.id === myId ? 'bg-white/10 border-white/20' : 'bg-white/[0.03] border-white/[0.05]'}`}>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={getRoleImage('villager', p.gender || 'male', 1)} alt="" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-white/80">{p.name}</p>
                    <p className="text-[10px] text-white/30 capitalize">{p.gender || 'male'}{p.isHost ? ' · host' : ''}{p.id === myId ? ' · you' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role pool (host only) */}
          {isHost ? (
            <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white/30 text-[10px] font-bold tracking-widest uppercase">Role Pool</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-black border
                  ${poolOk ? 'bg-green-500/15 text-green-400 border-green-500/25' : 'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>
                  {poolTotal} / {neededRoles}
                </span>
              </div>
              <p className="text-white/20 text-xs mb-3">{playerCount} players + 3 center = {neededRoles} roles needed</p>

              {ROLE_GROUPS.map(group => (
                <div key={group.label} className="mb-4">
                  <p className="text-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">{group.label}</p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {group.keys.map(key => (
                      <RoleTile key={key} roleKey={key} count={hostRolePool[key] || 0}
                        onAdd={() => updatePool(key, 1)} onRemove={() => updatePool(key, -1)}
                        onInfo={() => setRoleInfoModal(key)} />
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={startGame} disabled={!poolOk || playerCount < 3}
                className="mt-2 w-full bg-white disabled:bg-white/20 disabled:text-white/30 text-gray-950 font-black py-4 rounded-xl transition-all hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed text-base">
                {playerCount < 3 ? `Need ${3 - playerCount} more player${3 - playerCount !== 1 ? 's' : ''}` :
                 !poolOk ? `Set ${neededRoles} roles to start` : 'Start Game ▶'}
              </button>
            </div>
          ) : (
            <div className="bg-white/[0.04] rounded-2xl p-8 border border-white/[0.06] text-center">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-5xl mb-4">🌕</motion.div>
              <p className="text-white/60 font-bold text-lg">Waiting for host...</p>
              <p className="text-white/25 text-sm mt-2">Code: <span className="font-black font-mono tracking-widest text-white/50">{roomCode}</span></p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {roleInfoModal && <RoleInfoModal roleKey={roleInfoModal} gender={myGender} onClose={() => setRoleInfoModal(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  // ── ROLE REVEAL ───────────────────────────────────────────────────────────
  if (screen === 'roleReveal') {
    const role = myOriginalRole || roomData?.players?.[myId]?.originalRole;
    const r = role ? ROLES[role] : null;
    const displayName = role ? getRoleDisplayName(role, myPlayerGender) : '';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at top, #12001f 0%, #0a0a14 100%)' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs text-center">
          <p className="text-white/30 text-[10px] tracking-[0.35em] uppercase mb-6 font-bold">Your Secret Role</p>

          <AnimatePresence mode="wait">
            {!roleVisible ? (
              <motion.div key="hidden" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, rotateY: -90 }} transition={{ duration: 0.3 }}
                onClick={() => { setRoleVisible(true); setRoleRevealed(true); }}
                className="mx-auto w-52 h-72 rounded-3xl overflow-hidden cursor-pointer relative
                  bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-600/40
                  flex flex-col items-center justify-center gap-3 shadow-2xl hover:border-white/20 transition-all group">
                <div className="text-6xl font-black text-white/10 group-hover:text-white/20 transition-all">?</div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-white/30 text-xs font-bold tracking-[0.3em] uppercase">ROLE HIDDEN</p>
                  <p className="text-white/20 text-[10px]">Tap to reveal</p>
                </div>
                <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
              </motion.div>
            ) : r ? (
              <motion.div key="revealed" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className={`mx-auto w-52 h-72 rounded-3xl overflow-hidden relative border-2 ${r.border} shadow-2xl`}>
                <img src={getRoleImage(role, myPlayerGender, myMasonSlot)} alt={displayName}
                  className="w-full h-full object-cover object-top absolute inset-0" />
                <div className={`absolute inset-0 bg-gradient-to-t ${r.bg} opacity-60`} />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-white font-black text-lg drop-shadow-lg uppercase tracking-wide">{displayName}</p>
                  <p className={`text-xs font-bold mt-0.5 ${r.text} opacity-80`}>{r.teamLabel}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {roleVisible && r && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="mt-4 text-left space-y-2">
              <div className={`bg-gradient-to-br ${r.bg} rounded-2xl p-4 border ${r.border} border-opacity-50`}>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Your Role</p>
                <p className={`${r.text} text-sm leading-relaxed`}>{r.desc}</p>
              </div>
              {r.nightDesc && (
                <div className="bg-black/40 rounded-2xl p-4 border border-white/10">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">🌙 Tonight</p>
                  <p className="text-white/80 text-sm">{r.nightDesc}</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-4 space-y-2">
            {roleVisible && (
              <button onClick={() => setRoleVisible(false)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 font-semibold py-2.5 rounded-xl transition-all text-sm">
                Hide My Role 🙈
              </button>
            )}
            {isHost && roleRevealed && (
              <button onClick={beginNight}
                className="w-full bg-white text-gray-950 font-black py-4 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all">
                Begin Night Phase 🌙
              </button>
            )}
            {!isHost && (
              <motion.p animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-white/30 text-sm text-center pt-2">
                {roleRevealed ? 'Waiting for host to begin night...' : 'Tap your card to see your role'}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ── NIGHT ─────────────────────────────────────────────────────────────────
  if (screen === 'night') {
    const role = currentNightRole;
    const r = role ? ROLES[role] : null;
    const centerCards = roomData?.centerCards || [];
    const myPlayerData = players[myId] || {};

    // Night result overlay
    if (showNightResult && nightResult) {
      const res = nightResult;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4"
          style={{ background: 'radial-gradient(ellipse at top, #12001f 0%, #050510 100%)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm">
            <NightResultContent res={res} players={players} centerCards={centerCards}
              myGender={myPlayerGender} myMasonSlot={myMasonSlot} />
            <button onClick={() => setShowNightResult(false)}
              className="mt-4 w-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold py-3 rounded-xl transition-all">
              Continue →
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at top, #0a001a 0%, #050510 100%)' }}>

        {/* Night role progress bar */}
        <div className="flex gap-1 p-3 pt-4">
          {activeOrder.map((rk, i) => {
            const step = roomData?.nightStep ?? 0;
            const isDone = i < step;
            const isCurrent = i === step;
            return (
              <div key={rk + i} className={`h-1 rounded-full flex-1 transition-all duration-500
                ${isCurrent ? 'bg-white' : isDone ? 'bg-white/25' : 'bg-white/10'}`} />
            );
          })}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">

          {isMyNightTurn ? (
            // My turn — show action UI
            <motion.div key={`action-${currentNightRole}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm space-y-4">

              {/* Role header with image */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-20 rounded-xl overflow-hidden border border-white/20 flex-shrink-0">
                  <img src={getRoleImage(myOriginalRole, myPlayerGender, myMasonSlot)} alt=""
                    className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-white/40 text-[10px] tracking-widest uppercase font-bold">Your Night Action</p>
                  <h2 className="text-2xl font-black text-white">{getRoleDisplayName(myOriginalRole, myPlayerGender)}</h2>
                  {r && <p className={`text-xs ${r.text} mt-0.5`}>{r.nightDesc}</p>}
                </div>
              </div>

              {/* Countdown */}
              <div className="flex justify-end">
                <div className={`px-3 py-1 rounded-full text-sm font-black border transition-all
                  ${nightCountdown <= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-white/50 border-white/10'}`}>
                  {nightCountdown}s
                </div>
              </div>

              {/* Action UI */}
              <NightActionUI role={myOriginalRole} players={players} myId={myId} centerCards={centerCards}
                selectedTargets={selectedTargets} setSelectedTargets={setSelectedTargets}
                seerMode={seerMode} setSeerMode={setSeerMode}
                nightActionSubStep={nightActionSubStep}
                witchPeekedCard={witchPeekedCard} setWitchPeekedCard={setWitchPeekedCard}
                nightActionDone={nightActionDone} myGender={myPlayerGender} />

              {!nightActionDone && (
                <button onClick={handleNightAction}
                  className="w-full bg-white text-gray-950 font-black py-4 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg">
                  Confirm Action ✓
                </button>
              )}
              {nightActionDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="w-full py-4 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 font-bold text-center">
                  ✓ Action submitted — waiting for night to end
                </motion.div>
              )}
            </motion.div>

          ) : (
            // Sleeping — show whose turn it is
            <motion.div key={`sleep-${currentNightRole}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center space-y-6">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-7xl">🌙</motion.div>
              <div>
                <p className="text-white/30 text-sm font-semibold tracking-wider">Everyone close your eyes...</p>
                {r && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex flex-col items-center gap-3">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
                      <img src={getRoleImage(role, 'male', 1)} alt={r.name}
                        className="w-full h-full object-cover object-top" />
                    </div>
                    <p className="text-white font-black text-xl">{r.name}</p>
                    <p className="text-white/40 text-sm">is awake…</p>
                  </motion.div>
                )}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-black border
                ${nightCountdown <= 3 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-white/40 border-white/10'}`}>
                {nightCountdown}s
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── DAY ───────────────────────────────────────────────────────────────────
  if (screen === 'day') {
    const urgent = dayCountdown <= 30;
    const veryUrgent = dayCountdown <= 10;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white"
        style={{ background: 'radial-gradient(ellipse at top, #1a1200 0%, #0d0d06 100%)' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center space-y-6">

          <div>
            <div className="text-6xl mb-4">☀️</div>
            <h1 className="text-3xl font-black text-white">Day has broken</h1>
            <p className="text-white/40 text-sm mt-1">Discuss, debate, and decide who the Werewolf is.</p>
          </div>

          {/* Timer */}
          <div>
            <motion.p animate={veryUrgent ? { opacity: [1, 0.4, 1] } : {}} transition={{ repeat: Infinity, duration: 0.6 }}
              className={`text-7xl font-black tabular-nums tracking-tight
                ${veryUrgent ? 'text-red-400' : urgent ? 'text-amber-400' : 'text-white'}`}>
              {fmtTime(dayCountdown)}
            </motion.p>
            <p className="text-white/25 text-xs mt-1 tracking-wider">remaining to discuss</p>
          </div>

          {/* Players */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {playerList.map(p => (
              <div key={p.id} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border
                ${p.id === myId ? 'bg-white/10 border-white/20' : 'bg-white/[0.04] border-white/[0.06]'}`}>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  <img src={getRoleImage('villager', p.gender || 'male', 1)} alt="" className="w-full h-full object-cover object-top" />
                </div>
                <p className="text-[10px] font-semibold text-white/70 text-center leading-tight truncate w-full">{p.name}</p>
              </div>
            ))}
          </div>

          {isHost && (
            <button onClick={skipToVote}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3.5 rounded-xl transition-all active:scale-[0.98]">
              Skip to Vote ⚡
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // ── VOTE ──────────────────────────────────────────────────────────────────
  if (screen === 'vote') {
    const voteCount = Object.keys(roomData?.votes || {}).length;
    const totalPlayers = playerList.length;

    return (
      <div className="min-h-screen flex flex-col p-4 text-white" style={{ background: '#0d0d1a' }}>
        <div className="max-w-sm mx-auto w-full flex flex-col flex-1">

          <div className="text-center pt-6 pb-4">
            <div className="text-4xl mb-3">⚔️</div>
            <h1 className="text-2xl font-black">Who is the Werewolf?</h1>
            <p className="text-white/40 text-sm mt-1">Vote for the player you want to eliminate</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-1.5 rounded-full bg-white/10 w-32 overflow-hidden">
                <motion.div className="h-full bg-white rounded-full" animate={{ width: `${(voteCount / totalPlayers) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
              <p className="text-white/40 text-xs font-mono">{voteCount}/{totalPlayers} voted</p>
            </div>
            {myVote && <p className="text-green-400 text-xs font-bold mt-2">✓ Your vote has been cast</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            {playerList.map(p => {
              const isMe = p.id === myId;
              const isSelected = myVote === p.id;
              const hasVoted = !!roomData?.votes?.[p.id]; // anonymous: just show voted/not, not who for
              return (
                <motion.button key={p.id} onClick={() => !isMe && !myVote && submitVote(p.id)}
                  disabled={isMe || !!myVote}
                  whileHover={!isMe && !myVote ? { scale: 1.03 } : {}}
                  whileTap={!isMe && !myVote ? { scale: 0.97 } : {}}
                  className={`relative rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-end pb-3 pt-0 transition-all min-h-[120px]
                    ${isSelected ? 'border-red-500 shadow-red-500/30 shadow-lg' : isMe ? 'border-white/20 opacity-70' : 'border-white/10 hover:border-white/30'}
                    ${myVote && !isSelected ? 'opacity-50' : ''}
                  `}>
                  <img src={getRoleImage('villager', p.gender || 'male', 1)} alt=""
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center z-10">
                      <span className="text-white text-xs font-black">✓</span>
                    </div>
                  )}
                  {/* Anonymous: only show if someone voted, not how many */}
                  {hasVoted && !isSelected && (
                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40 z-10" />
                  )}
                  <div className="relative z-10 text-center">
                    <p className="text-white font-black text-sm leading-tight">{p.name}</p>
                    {isMe && <p className="text-white/40 text-[10px]">(you)</p>}
                    {isSelected && <p className="text-red-300 text-[10px] font-bold">Your vote</p>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ───────────────────────────────────────────────────────────────
  if (screen === 'results') {
    if (!gameResult || !finalRolesData) {
      return <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] text-white/40">Tallying votes…</div>;
    }
    const { winner, eliminated } = gameResult;
    const votes = roomData?.votes || {};
    const centerCards = roomData?.centerCards || [];
    const originalRoles = {};
    Object.entries(players).forEach(([id, p]) => { originalRoles[id] = p.originalRole; });

    const bannerMap = {
      villagers: { emoji: '🏘️', title: 'Village Wins!',    sub: 'A werewolf has been hunted down.', color: 'from-green-900/50 to-green-950', border: 'border-green-500/30' },
      werewolves: { emoji: '🐺', title: 'Werewolves Win!', sub: 'The village was deceived.',         color: 'from-red-900/50 to-red-950',   border: 'border-red-500/30' },
      tanner:    { emoji: '😅', title: 'Tanner Wins!',     sub: 'They got what they wanted.',        color: 'from-amber-900/50 to-amber-950', border: 'border-amber-500/30' },
    };
    const bannerInfo = bannerMap[winner] || bannerMap.villagers;

    return (
      <div className="min-h-screen p-4 text-white" style={{ background: '#0a0a14' }}>
        <div className="max-w-lg mx-auto space-y-4 pb-8">

          {/* Banner */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${bannerInfo.color} border ${bannerInfo.border} rounded-3xl p-6 text-center mt-4`}>
            <div className="text-6xl mb-3">{bannerInfo.emoji}</div>
            <h1 className="text-3xl font-black">{bannerInfo.title}</h1>
            <p className="text-white/50 text-sm mt-1">{bannerInfo.sub}</p>
          </motion.div>

          {/* Eliminated */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">⚰️ Eliminated</p>
            {eliminated.length === 0 ? (
              <p className="text-white/40 text-sm">Nobody was eliminated.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {eliminated.map(id => {
                  const p = players[id]; const role = finalRolesData[id];
                  return (
                    <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${ROLES[role]?.border || 'border-white/20'} bg-white/[0.05]`}>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getRoleImage(role, p?.gender || 'male', p?.masonSlot || 1)} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{p?.name}</p>
                        <p className={`text-[10px] ${ROLES[role]?.text || 'text-white/50'}`}>{getRoleDisplayName(role, p?.gender || 'male')}</p>
                      </div>
                      <span className="text-lg ml-1">💀</span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Center cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">🃏 Center Cards</p>
            <div className="flex gap-3 justify-center">
              {centerCards.map((role, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <RoleCard roleKey={role} gender="male" masonSlot={1} />
                  <p className="text-white/30 text-[10px]">Card {i + 1}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Full role reveal table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.06]">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3">📋 Role Reveal</p>
            <div className="space-y-2">
              {playerList.map(p => {
                const orig = originalRoles[p.id];
                const final = finalRolesData[p.id];
                const changed = orig !== final;
                const votedFor = votes[p.id] ? players[votes[p.id]]?.name : null;
                const isElim = eliminated.includes(p.id);
                const isWinner = gameResult.winner === 'villagers'
                  ? !['werewolf','alphaWolf','minion'].includes(final)
                  : gameResult.winner === 'werewolves'
                  ? ['werewolf','alphaWolf','minion'].includes(final)
                  : ['tanner','tannerApprentice'].includes(final);

                return (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                    ${p.id === myId ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.05] bg-white/[0.03]'}`}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img src={getRoleImage(final, p.gender || 'male', p.masonSlot || 1)} alt=""
                        className="w-full h-full object-cover object-top" />
                      {isElim && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-sm">💀</span></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        {p.id === myId && <span className="text-[10px] text-white/30">(you)</span>}
                        {isWinner && <span className="text-[10px] text-yellow-400 font-bold">✓ Win</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ROLES[orig]?.badge || 'bg-white/10'}`}>
                          {getRoleDisplayName(orig, p.gender || 'male')}
                        </span>
                        {changed && <>
                          <span className="text-white/20 text-[10px]">→</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${ROLES[final]?.border || 'border-white/20'} ${ROLES[final]?.badge || 'bg-white/10'}`}>
                            {getRoleDisplayName(final, p.gender || 'male')}
                          </span>
                        </>}
                      </div>
                      {votedFor && <p className="text-white/25 text-[10px] mt-0.5">Voted: {votedFor}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={resetToMenu} className="flex-1 bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-bold py-3 rounded-xl transition-all text-sm">Leave</button>
            {isHost && (
              <button onClick={playAgain} className="flex-1 bg-white text-gray-950 font-black py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all">Play Again</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ─── Night Action UI Component ────────────────────────────────────────────────
const NightActionUI = ({ role, players, myId, centerCards, selectedTargets, setSelectedTargets,
  seerMode, setSeerMode, nightActionSubStep, witchPeekedCard, setWitchPeekedCard, nightActionDone, myGender }) => {

  const r = ROLES[role];
  const otherPlayers = Object.entries(players).filter(([id]) => id !== myId).map(([id, p]) => ({ id, ...p }));

  const toggleTarget = (val, max = 1) => {
    setSelectedTargets(prev => {
      if (prev.includes(val)) return prev.filter(v => v !== val);
      if (prev.length >= max) return [...prev.slice(1), val];
      return [...prev, val];
    });
  };

  const PlayerBtn = ({ id, name, gender, disabled: dis }) => {
    const sel = selectedTargets.includes(id);
    return (
      <button onClick={() => !dis && toggleTarget(id, role === 'troublemaker' ? 2 : 1)} disabled={dis || nightActionDone}
        className={`flex items-center gap-2.5 w-full p-3 rounded-xl border-2 transition-all text-left
          ${sel ? 'border-yellow-400 bg-yellow-400/10' : 'border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]'}
          ${dis ? 'opacity-30 cursor-not-allowed' : ''}`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
          <img src={getRoleImage('villager', gender || 'male', 1)} alt="" className="w-full h-full object-cover object-top" />
        </div>
        <span className="font-semibold text-sm">{name}</span>
        {sel && <span className="ml-auto text-yellow-400 text-sm">✓</span>}
      </button>
    );
  };

  const CenterBtn = ({ index, selected, selected2, disabled: dis }) => (
    <button onClick={() => !dis && toggleTarget(index, role === 'seer' ? 2 : 1)} disabled={dis || nightActionDone}
      className={`relative w-20 h-24 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-end pb-1 transition-all
        ${selected ? 'border-yellow-400' : selected2 ? 'border-green-400' : 'border-white/15 hover:border-white/30'}
        ${dis ? 'opacity-30 cursor-not-allowed' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl text-white/15 font-black">?</span>
      </div>
      <span className="relative text-[9px] text-white/40 font-bold z-10">{index + 1}</span>
    </button>
  );

  if (nightActionDone) return (
    <div className="text-center py-4 text-white/30 text-sm">Action submitted ✓</div>
  );

  // ── Werewolf ──
  if (role === 'werewolf') {
    const pack = Object.entries(players).filter(([id, p]) => id !== myId && WEREWOLF_ROLES.has(p.originalRole));
    if (pack.length > 0) {
      return (
        <div className="space-y-2">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Your pack:</p>
          {pack.map(([id, p]) => (
            <div key={id} className={`flex items-center gap-3 p-3 rounded-xl bg-red-900/30 border border-red-500/40`}>
              <div className="w-8 h-8 rounded-lg overflow-hidden"><img src={getRoleImage('werewolf', p.gender || 'male', 1)} alt="" className="w-full h-full object-cover object-top" /></div>
              <span className="font-bold text-red-200">🐺 {p.name}</span>
            </div>
          ))}
          <p className="text-white/25 text-xs text-center">Press Confirm when ready</p>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-sm font-semibold">You are the lone wolf. Peek at a center card:</p>
        <div className="flex gap-3 justify-center mt-2">
          {centerCards.map((_, i) => <CenterBtn key={i} index={i} selected={selectedTargets.includes(i)} />)}
        </div>
      </div>
    );
  }

  // ── Alpha Wolf ──
  if (role === 'alphaWolf') {
    const pack = Object.entries(players).filter(([id, p]) => id !== myId && WEREWOLF_ROLES.has(p.originalRole));
    const wolfCenterIdx = centerCards.findIndex(c => WEREWOLF_ROLES.has(c));
    if (nightActionSubStep === 'place') {
      return (
        <div className="space-y-2">
          <p className="text-white/50 text-xs font-bold">Choose a player to secretly become a Wolf:</p>
          {otherPlayers.map(p => <PlayerBtn key={p.id} {...p} />)}
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-xs font-bold">Your pack:</p>
        {pack.length > 0 ? pack.map(([id, p]) => (
          <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-red-900/30 border border-red-500/40">
            <span className="font-bold text-red-200">🐺 {p.name}</span>
          </div>
        )) : <p className="text-white/40 text-sm">You are the lone Alpha.</p>}
        {wolfCenterIdx !== -1 && (
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-white/40 text-xs mb-2">A wolf card is in the center. Tap Confirm to place it on a player.</p>
            <button onClick={() => setSelectedTargets(['skip'])}
              className="w-full py-2 rounded-xl border border-white/10 text-white/40 text-sm">Skip placement</button>
          </div>
        )}
      </div>
    );
  }

  // ── Minion ──
  if (role === 'minion') {
    const wolves = Object.entries(players).filter(([, p]) => WEREWOLF_ROLES.has(p.originalRole));
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider">{wolves.length ? 'The Werewolves are:' : 'No Werewolves in this game!'}</p>
        {wolves.map(([id, p]) => (
          <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-red-900/30 border border-red-500/40">
            <div className="w-8 h-8 rounded-lg overflow-hidden"><img src={getRoleImage('werewolf', p.gender || 'male', 1)} alt="" className="w-full h-full object-cover object-top" /></div>
            <span className="font-bold text-red-200">🐺 {p.name}</span>
          </div>
        ))}
        {!wolves.length && <p className="text-white/40 text-sm">You're on your own — be careful!</p>}
        <p className="text-white/25 text-xs text-center">Press Confirm when ready</p>
      </div>
    );
  }

  // ── Mason ──
  if (role === 'mason') {
    const mates = Object.entries(players).filter(([id, p]) => id !== myId && p.originalRole === 'mason');
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-xs font-bold uppercase tracking-wider">{mates.length ? 'Other Masons:' : 'You are the only Mason.'}</p>
        {mates.map(([id, p]) => (
          <div key={id} className="flex items-center gap-3 p-3 rounded-xl bg-stone-800/50 border border-stone-500/40">
            <span className="font-bold text-stone-200">🤝 {p.name}</span>
          </div>
        ))}
        <p className="text-white/25 text-xs text-center">Press Confirm when ready</p>
      </div>
    );
  }

  // ── Seer ──
  if (role === 'seer') {
    return (
      <div className="space-y-3">
        <div className="flex rounded-xl overflow-hidden border border-white/10">
          {['player', 'center'].map(m => (
            <button key={m} onClick={() => { setSeerMode(m); setSelectedTargets([]); }}
              className={`flex-1 py-2 text-sm font-bold transition-all capitalize
                ${seerMode === m ? 'bg-white/15 text-white' : 'bg-white/[0.03] text-white/30 hover:text-white/50'}`}>
              {m === 'player' ? 'A Player' : '2 Center Cards'}
            </button>
          ))}
        </div>
        {seerMode === 'player' && <div className="space-y-1.5">{otherPlayers.map(p => <PlayerBtn key={p.id} {...p} />)}</div>}
        {seerMode === 'center' && (
          <div>
            <p className="text-white/40 text-xs mb-2">Pick two center cards:</p>
            <div className="flex gap-3 justify-center">
              {centerCards.map((_, i) => (
                <CenterBtn key={i} index={i}
                  selected={selectedTargets[0] === i}
                  selected2={selectedTargets[1] === i} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Witch ──
  if (role === 'witch') {
    if (!witchPeekedCard) {
      return (
        <div className="space-y-2">
          <p className="text-white/50 text-sm">Peek at a center card:</p>
          <div className="flex gap-3 justify-center">
            {centerCards.map((roleKey, i) => (
              <button key={i} onClick={() => setWitchPeekedCard({ index: i, roleKey })}
                className="relative w-20 h-24 rounded-xl border-2 border-white/15 overflow-hidden hover:border-white/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                <span className="absolute inset-0 flex items-center justify-center text-white/15 font-black text-xl">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    const peeked = ROLES[witchPeekedCard.roleKey];
    return (
      <div className="space-y-3">
        <div className={`p-3 rounded-xl border ${peeked?.border || 'border-white/20'} bg-white/[0.05] flex items-center gap-3`}>
          <div className="w-10 h-12 rounded-lg overflow-hidden">
            <img src={getRoleImage(witchPeekedCard.roleKey, myGender, 1)} alt="" className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <p className="text-white/40 text-[10px]">Center card {witchPeekedCard.index + 1}:</p>
            <p className={`font-black ${peeked?.text || 'text-white'}`}>{getRoleDisplayName(witchPeekedCard.roleKey, myGender)}</p>
          </div>
        </div>
        <p className="text-white/50 text-sm">Optionally swap with a player (or Confirm to skip):</p>
        <div className="space-y-1.5">{otherPlayers.map(p => <PlayerBtn key={p.id} {...p} />)}</div>
        <button onClick={() => setWitchPeekedCard(null)} className="text-white/30 text-xs underline w-full text-center">Peek a different card</button>
      </div>
    );
  }

  // ── Robber ──
  if (role === 'robber') {
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-sm">Swap your card with:</p>
        {otherPlayers.map(p => <PlayerBtn key={p.id} {...p} />)}
      </div>
    );
  }

  // ── Troublemaker ──
  if (role === 'troublemaker') {
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-sm">Select two players to swap (you won't see their roles):</p>
        {otherPlayers.map(p => <PlayerBtn key={p.id} {...p} />)}
        {selectedTargets.length > 0 && <p className="text-white/30 text-xs text-center">{selectedTargets.length}/2 selected</p>}
      </div>
    );
  }

  // ── Drunk ──
  if (role === 'drunk') {
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-sm">Pick a center card (you won't know what you become):</p>
        <div className="flex gap-3 justify-center mt-2">
          {centerCards.map((_, i) => <CenterBtn key={i} index={i} selected={selectedTargets.includes(i)} />)}
        </div>
      </div>
    );
  }

  // ── Insomniac ──
  if (role === 'insomniac') {
    return (
      <div className="text-center py-4">
        <p className="text-white/50 text-sm mb-2">Checking your card at end of night…</p>
        <p className="text-white/30 text-xs">Press Confirm to see if your role changed</p>
      </div>
    );
  }

  return <div className="text-white/30 text-sm text-center py-4">No action needed this turn.</div>;
};

// ─── Night Result Content ─────────────────────────────────────────────────────
const NightResultContent = ({ res, players, centerCards, myGender, myMasonSlot }) => {
  const roleCard = (roleKey, gender, slot) => {
    const r = ROLES[roleKey];
    if (!r) return null;
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${r.border} bg-white/[0.05]`}>
        <div className="w-12 h-14 rounded-xl overflow-hidden flex-shrink-0">
          <img src={getRoleImage(roleKey, gender || 'male', slot || 1)} alt="" className="w-full h-full object-cover object-top" />
        </div>
        <div>
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-bold">{r.teamLabel}</p>
          <p className={`font-black text-lg ${r.text}`}>{getRoleDisplayName(roleKey, gender || 'male')}</p>
        </div>
      </div>
    );
  };

  let title = '', content = null;

  if (res.type === 'werewolf_team') {
    title = '🐺 Your Pack';
    content = res.werewolves.length > 0
      ? <div className="space-y-2">{res.werewolves.map(n => <div key={n} className="px-4 py-3 bg-red-900/40 rounded-xl border border-red-500/40 text-red-200 font-bold">🐺 {n}</div>)}</div>
      : <p className="text-red-300">You are the lone wolf. Stay hidden!</p>;
  } else if (res.type === 'center_card') {
    title = `Center Card ${res.index + 1}`;
    content = roleCard(res.roleKey, myGender, 1);
  } else if (res.type === 'minion_see') {
    title = '😈 The Werewolves Are...';
    content = res.werewolves.length > 0
      ? <div className="space-y-2">{res.werewolves.map(n => <div key={n} className="px-4 py-3 bg-red-900/40 rounded-xl border border-red-500/40 text-red-200 font-bold">🐺 {n}</div>)}</div>
      : <p className="text-white/50">No Werewolves in this game! You&apos;re on your own.</p>;
  } else if (res.type === 'mason') {
    title = '🤝 Fellow Masons';
    content = res.masons.length > 0
      ? <div className="space-y-2">{res.masons.map(n => <div key={n} className="px-4 py-3 bg-stone-800/50 rounded-xl border border-stone-500/40 text-stone-200 font-bold">🤝 {n}</div>)}</div>
      : <p className="text-stone-300">You are the only Mason. No one else has this role.</p>;
  } else if (res.type === 'seer_player') {
    title = `👁️ ${res.targetName}'s Card`;
    content = roleCard(res.targetRole, myGender, 1);
  } else if (res.type === 'seer_center') {
    title = '👁️ Center Cards You Saw';
    content = (
      <div className="flex gap-3 justify-center">
        {res.roles.map((r, i) => <div key={i} className="flex flex-col items-center gap-1.5">
          {roleCard(r, myGender, 1)}
          <p className="text-white/30 text-[10px]">Card {res.indices[i] + 1}</p>
        </div>)}
      </div>
    );
  } else if (res.type === 'witch') {
    title = '🧙 You Peeked...';
    content = (
      <div className="space-y-3">
        {roleCard(res.peekedCard?.roleKey, myGender, 1)}
        {res.swapTargetName
          ? <p className="text-fuchsia-300 text-sm font-semibold">↔️ Swapped with <strong>{res.swapTargetName}</strong></p>
          : <p className="text-white/40 text-sm">No swap made.</p>}
      </div>
    );
  } else if (res.type === 'robber') {
    title = '🦹 You Stole a Role!';
    content = (
      <div className="space-y-2">
        <p className="text-white/50 text-sm">You took {res.targetName}'s card. Your new role:</p>
        {roleCard(res.newRole, myGender, myMasonSlot)}
      </div>
    );
  } else if (res.type === 'troublemaker') {
    title = '🔀 Cards Swapped!';
    content = <p className="text-amber-300 font-semibold">You swapped <strong>{res.name1}</strong> and <strong>{res.name2}</strong>'s cards. You don't know what they have now.</p>;
  } else if (res.type === 'drunk') {
    title = '🍺 You Took a Card!';
    content = <p className="text-orange-300">You took center card {res.index + 1}. You have no idea what you are now — figure it out during the day!</p>;
  } else if (res.type === 'insomniac') {
    title = '😴 Your Current Card';
    content = <div className="space-y-2">
      {roleCard(res.finalRole, myGender, myMasonSlot)}
      {res.finalRole !== res.originalRole && <p className="text-amber-300 text-sm font-bold">⚠️ Your card was swapped during the night!</p>}
    </div>;
  } else if (res.type === 'alphaWolf') {
    title = '⚔️ Alpha Wolf';
    content = (
      <div className="space-y-2">
        <p className="text-red-300 text-sm">Pack: {res.pack?.join(', ') || 'Lone wolf'}</p>
        {res.targetName && <p className="text-red-400 font-bold">↗️ Placed wolf on <strong>{res.targetName}</strong></p>}
      </div>
    );
  } else if (res.type === 'alphaWolf_no_wolf') {
    title = '⚔️ Alpha Wolf';
    content = <div className="space-y-2">
      <p className="text-red-300 text-sm">Pack: {res.pack?.join(', ') || 'Lone wolf'}</p>
      <p className="text-white/40 text-sm">No wolf card available to place.</p>
    </div>;
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="text-xl font-black text-white">{title}</h3>
      <div>{content}</div>
      <p className="text-white/25 text-xs text-center">Remember what you learned — use it wisely.</p>
    </motion.div>
  );
};

export default WerewolfGame;
