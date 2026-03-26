// components/games/WerewolfGame.js - One Night Ultimate Werewolf
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../../utils/firebase';
import { ref, set, onValue, update, off, get, remove } from 'firebase/database';

// ─── Role Definitions ─────────────────────────────────────────────────────────
const ROLES = {
  werewolf: {
    name: 'Werewolf', team: 'werewolves',
    description: 'You are a Werewolf! Work together to avoid being caught.',
    nightAction: 'Wake up and look for fellow werewolves. If alone, peek at one center card.',
    icon: '🐺', emoji: '🐺',
    bg: 'from-red-800 to-red-950', border: 'border-red-600',
    text: 'text-red-100', badge: 'bg-red-700',
    priority: 1, hasAction: true
  },
  minion: {
    name: 'Minion', team: 'werewolves',
    description: 'You serve the Werewolves. You win if they win — even if you die.',
    nightAction: 'Wake up and see who the werewolves are.',
    icon: '😈', emoji: '😈',
    bg: 'from-red-600 to-rose-900', border: 'border-rose-500',
    text: 'text-rose-100', badge: 'bg-rose-700',
    priority: 2, hasAction: true
  },
  seer: {
    name: 'Seer', team: 'villagers',
    description: 'You can glimpse the truth. Use your vision wisely.',
    nightAction: 'Look at ONE player\'s card, OR look at TWO center cards.',
    icon: '👁️', emoji: '👁️',
    bg: 'from-blue-600 to-blue-900', border: 'border-blue-400',
    text: 'text-blue-100', badge: 'bg-blue-700',
    priority: 3, hasAction: true
  },
  robber: {
    name: 'Robber', team: 'villagers',
    description: 'Steal a role from another player and look at your new card.',
    nightAction: 'Swap your card with another player\'s card. Look at your new role.',
    icon: '🦹', emoji: '🦹',
    bg: 'from-purple-600 to-purple-900', border: 'border-purple-400',
    text: 'text-purple-100', badge: 'bg-purple-700',
    priority: 4, hasAction: true
  },
  troublemaker: {
    name: 'Troublemaker', team: 'villagers',
    description: 'Swap two other players\' cards without looking at them.',
    nightAction: 'Pick two other players and swap their cards (you don\'t see them).',
    icon: '🔀', emoji: '🔀',
    bg: 'from-yellow-600 to-amber-900', border: 'border-yellow-400',
    text: 'text-yellow-100', badge: 'bg-yellow-700',
    priority: 5, hasAction: true
  },
  drunk: {
    name: 'Drunk', team: 'villagers',
    description: 'You\'re too drunk to know your own role. You swap with a center card.',
    nightAction: 'Pick a center card and swap it with your card. You don\'t know what you got.',
    icon: '🍺', emoji: '🍺',
    bg: 'from-orange-600 to-amber-800', border: 'border-orange-400',
    text: 'text-orange-100', badge: 'bg-orange-700',
    priority: 6, hasAction: true
  },
  insomniac: {
    name: 'Insomniac', team: 'villagers',
    description: 'You can\'t sleep. At the end of the night, you check your card.',
    nightAction: 'Look at your own card one more time (it may have changed!).',
    icon: '😴', emoji: '😴',
    bg: 'from-indigo-600 to-indigo-900', border: 'border-indigo-400',
    text: 'text-indigo-100', badge: 'bg-indigo-700',
    priority: 7, hasAction: true
  },
  villager: {
    name: 'Villager', team: 'villagers',
    description: 'You are a simple Villager. No special powers — use your wits!',
    nightAction: null,
    icon: '👤', emoji: '👤',
    bg: 'from-green-600 to-green-900', border: 'border-green-400',
    text: 'text-green-100', badge: 'bg-green-700',
    priority: 99, hasAction: false
  },
  hunter: {
    name: 'Hunter', team: 'villagers',
    description: 'If you are eliminated, the player you voted for is also eliminated.',
    nightAction: null,
    icon: '🏹', emoji: '🏹',
    bg: 'from-teal-600 to-teal-900', border: 'border-teal-400',
    text: 'text-teal-100', badge: 'bg-teal-700',
    priority: 99, hasAction: false
  },
  tanner: {
    name: 'Tanner', team: 'tanner',
    description: 'You WANT to be eliminated! Win by getting the most votes.',
    nightAction: null,
    icon: '😅', emoji: '😅',
    bg: 'from-gray-600 to-gray-900', border: 'border-gray-400',
    text: 'text-gray-100', badge: 'bg-gray-700',
    priority: 99, hasAction: false
  }
};

const NIGHT_ORDER = ['werewolf', 'minion', 'seer', 'robber', 'troublemaker', 'drunk', 'insomniac'];

const ROLE_DESCRIPTIONS = {
  werewolves: 'Werewolves team',
  villagers: 'Village team',
  tanner: 'Tanner (solo)'
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

  // Robber acts first (from night action order perspective of resolution)
  if (na.robber) {
    const { actorId, targetId } = na.robber;
    if (actorId && targetId && finalRoles[actorId] && finalRoles[targetId]) {
      const tmp = finalRoles[actorId];
      finalRoles[actorId] = finalRoles[targetId];
      finalRoles[targetId] = tmp;
    }
  }
  // Troublemaker
  if (na.troublemaker) {
    const { target1Id, target2Id } = na.troublemaker;
    if (target1Id && target2Id && finalRoles[target1Id] && finalRoles[target2Id]) {
      const tmp = finalRoles[target1Id];
      finalRoles[target1Id] = finalRoles[target2Id];
      finalRoles[target2Id] = tmp;
    }
  }
  // Drunk
  if (na.drunk) {
    const { actorId, centerIndex } = na.drunk;
    if (actorId !== undefined && centerIndex !== undefined && finalRoles[actorId]) {
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

  const hasRealWerewolf = playerIds.some(id => finalRoles[id] === 'werewolf');
  const werewolfEliminated = eliminated.some(id => finalRoles[id] === 'werewolf');

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

const PhaseTimer = ({ endTime, onExpire }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const secs = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0 && onExpire) onExpire();
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [endTime, onExpire]);

  const pct = endTime ? Math.max(0, (endTime - Date.now()) / ((endTime - Date.now() + remaining * 1000)) * 100) : 0;
  const urgent = remaining <= 10;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className={`text-3xl font-black tabular-nums ${urgent ? 'text-red-400 animate-pulse' : 'text-white'}`}>
        {remaining}s
      </p>
    </div>
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
  const [screen, setScreen] = useState('menu');
  const [joinCode, setJoinCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [myId] = useState(() => genId());
  const [roomCode, setRoomCode] = useState('');
  const [roomData, setRoomData] = useState(null);
  const [myOriginalRole, setMyOriginalRole] = useState(null);
  const [nightResult, setNightResult] = useState(null); // what I saw during night
  const [nightActionDone, setNightActionDone] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [seerMode, setSeerMode] = useState(null); // 'player' | 'center'
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [hostRolePool, setHostRolePool] = useState([
    'werewolf', 'werewolf', 'seer', 'robber', 'troublemaker', 'villager', 'villager'
  ]);
  const [gameResult, setGameResult] = useState(null);
  const [finalRolesComputed, setFinalRolesComputed] = useState(null);

  const roomRef = useRef(null);
  const hostIntervalRef = useRef(null);
  const playerName = studentData?.firstName || studentData?.name || 'Player';

  // ── Firebase: subscribe to room ──────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return;
    const rRef = ref(database, `werewolfRooms/${roomCode}`);
    roomRef.current = rRef;

    const unsub = onValue(rRef, (snap) => {
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

    return () => off(rRef, 'value', unsub);
  }, [roomCode, screen, myId, myOriginalRole]);

  // ── Host: drive night phase progression ──────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || roomData.phase !== 'night') return;

    const nightStep = roomData.nightStep ?? 0;
    const stepStartTime = roomData.stepStartTime ?? Date.now();
    const STEP_DURATION = 25000; // 25 seconds per role

    if (hostIntervalRef.current) clearInterval(hostIntervalRef.current);

    hostIntervalRef.current = setInterval(async () => {
      const snap = await get(ref(database, `werewolfRooms/${roomCode}`));
      if (!snap.exists()) return;
      const data = snap.val();
      if (data.phase !== 'night') { clearInterval(hostIntervalRef.current); return; }

      const currentStep = data.nightStep ?? 0;
      const startTime = data.stepStartTime ?? Date.now();
      const elapsed = Date.now() - startTime;

      // Find current role
      const currentRole = NIGHT_ORDER[currentStep];
      const playersWithRole = Object.entries(data.players || {})
        .filter(([, p]) => p.originalRole === currentRole)
        .map(([id]) => id);

      // Check if all players with this role have submitted
      const allDone = playersWithRole.length === 0 ||
        playersWithRole.every(id => data.nightActions?.[id]?.done);

      // Advance if all done or timer expired
      if (allDone || elapsed >= STEP_DURATION) {
        const nextStep = currentStep + 1;
        if (nextStep >= NIGHT_ORDER.length) {
          // Night over → day phase
          clearInterval(hostIntervalRef.current);
          await update(ref(database, `werewolfRooms/${roomCode}`), {
            phase: 'day',
            dayEndTime: Date.now() + 120000, // 2 min discussion
          });
        } else {
          await update(ref(database, `werewolfRooms/${roomCode}`), {
            nightStep: nextStep,
            stepStartTime: Date.now(),
          });
        }
      }
    }, 2000);

    return () => clearInterval(hostIntervalRef.current);
  }, [isHost, roomData?.phase, roomData?.nightStep, roomCode]);

  // ── Host: drive day → vote → results ─────────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData) return;

    if (roomData.phase === 'day') {
      const dayEnd = roomData.dayEndTime;
      if (!dayEnd) return;
      const remaining = dayEnd - Date.now();
      if (remaining <= 0) {
        update(ref(database, `werewolfRooms/${roomCode}`), {
          phase: 'vote',
          voteEndTime: Date.now() + 45000, // 45 second vote
        });
        return;
      }
      const tid = setTimeout(() => {
        update(ref(database, `werewolfRooms/${roomCode}`), {
          phase: 'vote',
          voteEndTime: Date.now() + 45000,
        });
      }, remaining);
      return () => clearTimeout(tid);
    }

    if (roomData.phase === 'vote') {
      const voteEnd = roomData.voteEndTime;
      if (!voteEnd) return;
      const remaining = voteEnd - Date.now();
      if (remaining <= 0) {
        update(ref(database, `werewolfRooms/${roomCode}`), { phase: 'results' });
        return;
      }
      const tid = setTimeout(() => {
        update(ref(database, `werewolfRooms/${roomCode}`), { phase: 'results' });
      }, remaining);
      return () => clearTimeout(tid);
    }
  }, [isHost, roomData?.phase, roomData?.dayEndTime, roomData?.voteEndTime, roomCode]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    const code = genRoomCode();
    setRoomCode(code);
    setIsHost(true);
    await set(ref(database, `werewolfRooms/${code}`), {
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
  }, [myId, playerName, hostRolePool, showToast]);

  const joinRoom = useCallback(async () => {
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) { showToast?.('Enter a 4-character room code.', 'error'); return; }
    const snap = await get(ref(database, `werewolfRooms/${code}`));
    if (!snap.exists()) { showToast?.('Room not found.', 'error'); return; }
    const data = snap.val();
    if (data.phase !== 'lobby') { showToast?.('Game already started.', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 10) { showToast?.('Room is full.', 'error'); return; }

    setRoomCode(code);
    setIsHost(false);
    await update(ref(database, `werewolfRooms/${code}/players/${myId}`), {
      name: playerName, isHost: false, originalRole: '', vote: null, nightActionDone: false
    });
    setScreen('lobby');
    showToast?.(`Joined room ${code}!`, 'success');
  }, [joinCode, myId, playerName, showToast]);

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

    await update(ref(database, `werewolfRooms/${roomCode}`), updates);
    showToast?.('Game started! Players are seeing their roles.', 'success');
  }, [isHost, roomData, hostRolePool, roomCode, showToast]);

  const beginNight = useCallback(async () => {
    if (!isHost) return;
    await update(ref(database, `werewolfRooms/${roomCode}`), {
      phase: 'night',
      nightStep: 0,
      stepStartTime: Date.now(),
    });
  }, [isHost, roomCode]);

  const submitNightAction = useCallback(async (actionData) => {
    if (nightActionDone) return;
    setNightActionDone(true);
    await update(ref(database, `werewolfRooms/${roomCode}/nightActions/${myId}`), {
      ...actionData,
      done: true,
    });
    await update(ref(database, `werewolfRooms/${roomCode}/players/${myId}`), {
      nightActionDone: true
    });
  }, [nightActionDone, roomCode, myId]);

  const submitVote = useCallback(async (targetId) => {
    if (myVote) return;
    setMyVote(targetId);
    await update(ref(database, `werewolfRooms/${roomCode}/votes/${myId}`), targetId);
    // Also store in votes object (Firebase path update)
    await set(ref(database, `werewolfRooms/${roomCode}/votes/${myId}`), targetId);
    showToast?.('Vote cast!', 'success');
  }, [myVote, roomCode, myId, showToast]);

  const leaveGame = useCallback(async () => {
    if (roomCode) {
      await remove(ref(database, `werewolfRooms/${roomCode}/players/${myId}`));
    }
    setScreen('menu');
    setRoomCode('');
    setRoomData(null);
    setMyOriginalRole(null);
    setNightResult(null);
    setNightActionDone(false);
    setMyVote(null);
    setGameResult(null);
    setFinalRolesComputed(null);
  }, [roomCode, myId]);

  // ── Night action logic ────────────────────────────────────────────────────
  const handleNightAction = useCallback(() => {
    const role = myOriginalRole;
    const players = roomData?.players || {};
    const otherPlayers = Object.entries(players).filter(([id]) => id !== myId);
    const centerCards = roomData?.centerCards || [];
    const originalRoles = {};
    Object.entries(players).forEach(([id, p]) => { originalRoles[id] = p.originalRole; });

    if (role === 'werewolf') {
      const werewolves = Object.entries(players)
        .filter(([id, p]) => p.originalRole === 'werewolf' && id !== myId)
        .map(([, p]) => p.name);

      if (werewolves.length > 0) {
        setNightResult({ type: 'werewolf_team', werewolves });
        submitNightAction({ role: 'werewolf', saw: 'teammates' });
      } else if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        const card = centerCards[idx];
        setNightResult({ type: 'center_card', index: idx, role: card });
        submitNightAction({ role: 'werewolf', lookedAtCenter: true, centerIndex: idx, saw: card });
      } else {
        // Lone wolf - needs to pick center
        return; // wait for selection
      }
    } else if (role === 'minion') {
      const werewolves = Object.entries(players)
        .filter(([, p]) => p.originalRole === 'werewolf')
        .map(([, p]) => p.name);
      setNightResult({ type: 'minion_see', werewolves });
      submitNightAction({ role: 'minion', saw: 'werewolves' });
    } else if (role === 'seer') {
      if (seerMode === 'player' && selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        const targetRole = originalRoles[targetId];
        const targetName = players[targetId]?.name;
        setNightResult({ type: 'seer_player', targetName, targetRole });
        submitNightAction({ role: 'seer', mode: 'player', playerTarget: targetId });
      } else if (seerMode === 'center' && selectedTargets.length === 2) {
        const r1 = centerCards[selectedTargets[0]];
        const r2 = centerCards[selectedTargets[1]];
        setNightResult({ type: 'seer_center', indices: selectedTargets, roles: [r1, r2] });
        submitNightAction({ role: 'seer', mode: 'center', center1: selectedTargets[0], center2: selectedTargets[1] });
      } else return;
    } else if (role === 'robber') {
      if (selectedTargets.length === 1) {
        const targetId = selectedTargets[0];
        const stolenRole = originalRoles[targetId];
        const targetName = players[targetId]?.name;
        setNightResult({ type: 'robber', targetName, newRole: stolenRole });
        submitNightAction({ role: 'robber', actorId: myId, targetId });
      } else return;
    } else if (role === 'troublemaker') {
      if (selectedTargets.length === 2) {
        const [t1, t2] = selectedTargets;
        setNightResult({ type: 'troublemaker', name1: players[t1]?.name, name2: players[t2]?.name });
        submitNightAction({ role: 'troublemaker', target1Id: t1, target2Id: t2 });
      } else return;
    } else if (role === 'drunk') {
      if (selectedTargets.length === 1) {
        const idx = selectedTargets[0];
        setNightResult({ type: 'drunk', index: idx });
        submitNightAction({ role: 'drunk', actorId: myId, centerIndex: idx });
      } else return;
    } else if (role === 'insomniac') {
      // Compute final role for insomniac
      const { finalRoles } = resolveNightActions(originalRoles, centerCards, roomData?.nightActions || {});
      const myFinalRole = finalRoles[myId];
      setNightResult({ type: 'insomniac', finalRole: myFinalRole });
      submitNightAction({ role: 'insomniac', finalRole: myFinalRole });
    }
  }, [myOriginalRole, roomData, myId, selectedTargets, seerMode, submitNightAction]);

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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white/80">Role Pool</h3>
                <span className={`text-sm px-2 py-1 rounded-lg ${
                  hostRolePool.length === neededRoles ? 'bg-green-600/40 text-green-300' : 'bg-yellow-600/40 text-yellow-300'
                }`}>
                  {hostRolePool.length}/{neededRoles} roles needed
                </span>
              </div>
              <p className="text-white/50 text-xs mb-3">Need exactly {playerCount} players + 3 center = {neededRoles} total roles</p>

              <div className="grid grid-cols-2 gap-2">
                {allRoleTypes.map(roleId => {
                  const r = ROLES[roleId];
                  const count = roleCounts[roleId] || 0;
                  return (
                    <div key={roleId} className={`flex items-center justify-between p-2 rounded-xl border
                      ${count > 0 ? `bg-gradient-to-r ${r.bg} ${r.border}` : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center gap-2">
                        <span>{r.icon}</span>
                        <div>
                          <p className="text-xs font-bold">{r.name}</p>
                          <p className="text-xs opacity-60">{r.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setHostRolePool(prev => {
                            const idx = prev.lastIndexOf(roleId);
                            if (idx === -1) return prev;
                            return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                          })}
                          className="w-6 h-6 rounded-full bg-red-500/40 hover:bg-red-500/70 text-white text-xs font-bold flex items-center justify-center"
                          disabled={count === 0}
                        >−</button>
                        <span className="w-5 text-center text-sm font-bold">{count}</span>
                        <button
                          onClick={() => setHostRolePool(prev => [...prev, roleId])}
                          className="w-6 h-6 rounded-full bg-green-500/40 hover:bg-green-500/70 text-white text-xs font-bold flex items-center justify-center"
                        >+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={startGame}
                disabled={hostRolePool.length !== neededRoles || playerCount < 3}
                className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all"
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
            </div>
          )}
        </div>
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

          <AnimatePresence>
            {showRoleReveal && r ? (
              <motion.div
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
              <div className="mx-auto w-48 h-64 bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl border-4 border-white/20 flex items-center justify-center">
                <span className="text-white/20 font-black text-2xl">🌙</span>
              </div>
            )}
          </AnimatePresence>

          <p className="text-white/40 text-sm mt-6">Remember your role — don&apos;t show anyone!</p>

          {isHost && (
            <button
              onClick={beginNight}
              className="mt-6 w-full bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transition-all"
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
                  <button onClick={handleNightAction} className="w-full py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all">
                    Look at My Card
                  </button>
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
            {dayEnd && <PhaseTimer endTime={dayEnd} />}
            <p className="text-white/60 text-sm mt-1">Talk to each other. Accuse, bluff, and deduce.</p>
          </div>

          {r && (
            <div className={`bg-gradient-to-br ${r.bg} rounded-2xl p-4 border ${r.border}`}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{r.icon}</span>
                <div>
                  <p className="text-xs text-white/60">Your original role</p>
                  <h3 className="font-black text-lg text-white">{r.name}</h3>
                  <p className={`text-sm ${r.text} opacity-80`}>{r.description}</p>
                </div>
              </div>
            </div>
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
            {voteEnd && <PhaseTimer endTime={voteEnd} />}
            <p className="text-white/60 text-sm mt-1">Who do you think is the werewolf?</p>
          </div>

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
                  setNightActionDone(false);
                  setMyVote(null);
                  setGameResult(null);
                  setFinalRolesComputed(null);
                  setSelectedTargets([]);
                  setSeerMode(null);
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
                  await update(ref(database, `werewolfRooms/${roomCode}`), updates);
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
