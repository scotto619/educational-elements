'use strict';

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');

const app        = express();
const httpServer = http.createServer(app);
const io         = new Server(httpServer, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, 'public')));

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NIGHT_ORDER = [
  'doppelganger', 'werewolf', 'minion', 'mason',
  'seer', 'robber', 'troublemaker', 'drunk', 'insomniac'
];

// How many of each role can be in a deck
const ROLE_MAX = {
  werewolf: 3, villager: 5, seer: 1, robber: 1, troublemaker: 1,
  drunk: 1, insomniac: 1, mason: 2, minion: 1, hunter: 1, tanner: 1
};

const ROLE_TEAM = {
  werewolf: 'werewolf', minion: 'werewolf',
  villager: 'village',  seer: 'village', robber: 'village',
  troublemaker: 'village', drunk: 'village', insomniac: 'village',
  mason: 'village', hunter: 'village',
  tanner: 'tanner'
};

// Night action timeout (seconds per phase)
const NIGHT_TIMEOUT_SEC = 60;
// Voting timeout (seconds)
const VOTE_TIMEOUT_SEC  = 60;

// ─── WORD LISTS (for human-readable room phrases) ─────────────────────────────

const W = {
  adj:  ['Angry','Bold','Calm','Dark','Eager','Fierce','Glad','Happy','Kind',
          'Loud','Merry','Noble','Quick','Red','Swift','Tall','Wise','Young','Brave','Sly'],
  noun: ['Bears','Cats','Dogs','Eagles','Foxes','Geese','Hawks','Lions','Mice',
          'Owls','Pigs','Rats','Stags','Toads','Wolves','Bees','Crabs','Deer','Elks','Frogs'],
  verb: ['Chase','Dance','Eat','Fight','Hunt','Jump','Leap','March','Play','Race',
          'Sing','Trek','Wait','Roam','Hide','Seek','Creep','Howl','Swim','Fly'],
  adv:  ['Badly','Boldly','Calmly','Daily','Fast','Gladly','Idly','Keenly','Loudly',
          'Often','Quickly','Rarely','Slowly','Truly','Wisely','Merrily','Deeply','Freely','Wildly','Briskly']
};
const pick = arr => arr[Math.random() * arr.length | 0];
const phrase  = ()  => `${pick(W.adj)} ${pick(W.noun)} ${pick(W.verb)} ${pick(W.adv)}`;

// ─── ROOM MANAGEMENT ─────────────────────────────────────────────────────────

const rooms = Object.create(null);

function uid() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c; do { c = Array(4).fill(0).map(() => chars[Math.random() * chars.length | 0]).join(''); }
  while (rooms[c]);
  return c;
}

function makeRoom(hostId, hostName) {
  const code = uid();
  rooms[code] = {
    code, phrase: phrase(), host: hostId,
    players: [{ id: hostId, name: hostName }],
    phase: 'lobby',
    // ─ game state ─
    roles: {}, origRoles: {}, center: [],
    nightQueue: [], curNightRole: null,
    nightDone: new Set(), _nightTimer: null,
    votes: {}, _voteTimer: null, _dayTimer: null,
    dayDuration: 300,
  };
  return rooms[code];
}

function roomOf(sid) {
  return Object.values(rooms).find(r => r.players.some(p => p.id === sid)) || null;
}

function dropPlayer(sid) {
  const room = roomOf(sid);
  if (!room) return null;
  room.players = room.players.filter(p => p.id !== sid);
  if (!room.players.length) { delete rooms[room.code]; return null; }
  if (room.host === sid) room.host = room.players[0].id;
  return room;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function syncLobby(room) {
  io.to(room.code).emit('lobby-update', {
    code:    room.code,
    phrase:  room.phrase,
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    host:    room.host,
  });
}

// ─── GAME START ───────────────────────────────────────────────────────────────

function startGame(room, selectedRoles) {
  const cards   = shuffle(selectedRoles);
  room.center   = cards.slice(0, 3);
  const dealt   = cards.slice(3);

  room.roles = {}; room.origRoles = {};
  room.players.forEach((p, i) => {
    room.roles[p.id] = dealt[i];
    room.origRoles[p.id] = dealt[i];
  });

  room.phase     = 'night';
  room.votes     = {};
  room.nightDone = new Set();

  // Build night queue from roles actually in play
  const allRoles = new Set([...Object.values(room.origRoles), ...room.center]);
  room.nightQueue = NIGHT_ORDER.filter(r => {
    if (!allRoles.has(r)) return false;
    if (r === 'mason') return [...allRoles].filter(x => x === 'mason').length >= 2;
    return true;
  });

  // Tell each player their role
  room.players.forEach(p => {
    io.to(p.id).emit('game-started', {
      role: room.origRoles[p.id],
      players: room.players.map(q => ({ id: q.id, name: q.name })),
    });
  });

  // Brief pause for role reveal, then begin night
  setTimeout(() => advanceNight(room), 5000);
}

// ─── NIGHT PHASE ──────────────────────────────────────────────────────────────

function advanceNight(room) {
  if (room._nightTimer) { clearTimeout(room._nightTimer); room._nightTimer = null; }

  if (!room.nightQueue.length) { startDay(room); return; }

  const role = room.nightQueue.shift();
  room.curNightRole = role;
  room.nightDone    = new Set();

  const active    = room.players.filter(p => room.origRoles[p.id] === role);
  const activeIds = new Set(active.map(p => p.id));

  // Build per-player context
  active.forEach(p => {
    let context = {};
    if (role === 'werewolf') {
      const mates = room.players.filter(q => room.origRoles[q.id] === 'werewolf' && q.id !== p.id);
      context = { mates: mates.map(q => ({ id: q.id, name: q.name })), loneWolf: !mates.length };
    }
    if (role === 'minion') {
      const wolves = room.players.filter(q => room.origRoles[q.id] === 'werewolf');
      context = { wolves: wolves.map(q => ({ id: q.id, name: q.name })) };
    }
    if (role === 'mason') {
      const mates = room.players.filter(q => room.origRoles[q.id] === 'mason' && q.id !== p.id);
      context = { mates: mates.map(q => ({ id: q.id, name: q.name })) };
    }
    io.to(p.id).emit('night-action', {
      role, context,
      others: room.players.filter(q => q.id !== p.id).map(q => ({ id: q.id, name: q.name })),
    });
  });

  // Sleeping players
  room.players.filter(p => !activeIds.has(p.id)).forEach(p =>
    io.to(p.id).emit('night-sleep', { role })
  );

  // Roles with no interactive action auto-advance
  const passive = new Set(['villager', 'hunter', 'tanner']);
  if (passive.has(role) || !active.length) {
    setTimeout(() => advanceNight(room), 1500);
    return;
  }

  // Timeout — auto-skip anyone who hasn't acted
  room._nightTimer = setTimeout(() => {
    active.filter(p => !room.nightDone.has(p.id)).forEach(p => {
      room.nightDone.add(p.id);
      io.to(p.id).emit('night-timeout');
    });
    advanceNight(room);
  }, NIGHT_TIMEOUT_SEC * 1000);
}

function handleNightAction(room, sid, action) {
  if (room.origRoles[sid] !== room.curNightRole) return;
  if (room.nightDone.has(sid)) return;

  const role = room.origRoles[sid];
  let result = null;

  switch (role) {
    case 'seer': {
      if (action.type === 'player') {
        const t = room.players.find(p => p.id === action.targetId);
        result = { type: 'player', targetName: t?.name, role: room.roles[action.targetId] };
      } else {
        result = { type: 'center', roles: action.indices.map(i => room.center[i]) };
      }
      break;
    }
    case 'robber': {
      const mine = room.roles[sid];
      const theirs = room.roles[action.targetId];
      room.roles[sid] = theirs;
      room.roles[action.targetId] = mine;
      const t = room.players.find(p => p.id === action.targetId);
      result = { newRole: theirs, targetName: t?.name };
      break;
    }
    case 'troublemaker': {
      const [a, b] = action.targetIds;
      [room.roles[a], room.roles[b]] = [room.roles[b], room.roles[a]];
      result = {
        name1: room.players.find(p => p.id === a)?.name,
        name2: room.players.find(p => p.id === b)?.name,
      };
      break;
    }
    case 'drunk': {
      const i = action.centerIndex;
      [room.roles[sid], room.center[i]] = [room.center[i], room.roles[sid]];
      result = {};
      break;
    }
    case 'insomniac': {
      result = { currentRole: room.roles[sid] };
      break;
    }
    case 'werewolf': {
      // Lone wolf can peek at one center card
      if (action.type === 'center') {
        result = { centerRole: room.center[action.index] };
      } else {
        result = {};
      }
      break;
    }
    case 'minion':
    case 'mason': {
      result = {};
      break;
    }
    default: result = {};
  }

  if (result !== null) io.to(sid).emit('night-result', { role, result });

  room.nightDone.add(sid);
  checkNightComplete(room);
}

function handleNightSkip(room, sid) {
  if (room.origRoles[sid] !== room.curNightRole) return;
  room.nightDone.add(sid);
  checkNightComplete(room);
}

function checkNightComplete(room) {
  const active = room.players.filter(p => room.origRoles[p.id] === room.curNightRole);
  if (active.every(p => room.nightDone.has(p.id))) {
    setTimeout(() => advanceNight(room), 800);
  }
}

// ─── DAY PHASE ────────────────────────────────────────────────────────────────

function startDay(room) {
  room.phase = 'day';
  io.to(room.code).emit('day-start', {
    duration: room.dayDuration,
    players:  room.players.map(p => ({ id: p.id, name: p.name })),
  });
  room._dayTimer = setTimeout(() => startVoting(room), room.dayDuration * 1000);
}

// ─── VOTING ───────────────────────────────────────────────────────────────────

function startVoting(room) {
  if (room._dayTimer) { clearTimeout(room._dayTimer); room._dayTimer = null; }
  room.phase = 'voting';
  room.votes = {};
  io.to(room.code).emit('voting-start', {
    players: room.players.map(p => ({ id: p.id, name: p.name })),
  });
  // Timeout — auto-resolve when time is up
  room._voteTimer = setTimeout(() => resolveGame(room), VOTE_TIMEOUT_SEC * 1000);
}

function handleVote(room, sid, targetId) {
  if (room.votes[sid]) return; // already voted
  room.votes[sid] = targetId;
  const voteCount = Object.keys(room.votes).length;
  io.to(room.code).emit('vote-update', { voteCount, total: room.players.length });
  if (voteCount === room.players.length) resolveGame(room);
}

// ─── RESOLUTION ───────────────────────────────────────────────────────────────

function resolveGame(room) {
  if (room._voteTimer) { clearTimeout(room._voteTimer); room._voteTimer = null; }

  // Tally votes
  const tally = {};
  for (const v of Object.values(room.votes)) tally[v] = (tally[v] || 0) + 1;

  const maxV = Math.max(0, ...Object.values(tally));
  // Need ≥2 votes to be eliminated; on a tie all tied players die
  let killed = maxV >= 2
    ? Object.entries(tally).filter(([, c]) => c === maxV).map(([id]) => id)
    : [];

  // Hunter: if eliminated, also kills the player they voted for
  const huntKills = [];
  for (const id of killed) {
    if (room.roles[id] === 'hunter') {
      const target = room.votes[id];
      if (target && !killed.includes(target)) huntKills.push(target);
    }
  }
  killed = [...new Set([...killed, ...huntKills])];

  // Win conditions
  const finalRoles = room.roles;
  const werewolvesExist = Object.values(finalRoles).includes('werewolf');
  const werewolfKilled  = killed.some(id => finalRoles[id] === 'werewolf');
  const tannerKilled    = killed.some(id => finalRoles[id] === 'tanner');

  let winningTeam, winnerIds;

  if (tannerKilled && !werewolfKilled) {
    winningTeam = 'tanner';
    winnerIds   = room.players.filter(p => finalRoles[p.id] === 'tanner').map(p => p.id);
  } else if (werewolfKilled) {
    winningTeam = 'village';
    winnerIds   = room.players
      .filter(p => !['werewolf', 'minion'].includes(finalRoles[p.id]))
      .map(p => p.id);
  } else if (!werewolvesExist && !killed.length) {
    winningTeam = 'village';
    winnerIds   = room.players.map(p => p.id);
  } else {
    winningTeam = 'werewolf';
    if (werewolvesExist) {
      winnerIds = room.players
        .filter(p => ['werewolf', 'minion'].includes(finalRoles[p.id]) ||
                     room.origRoles[p.id] === 'minion')
        .map(p => p.id);
    } else {
      // No werewolves — minion wins if someone (not tanner) was killed
      winnerIds = room.players.filter(p => room.origRoles[p.id] === 'minion').map(p => p.id);
    }
  }

  // Build role reveal map
  const roleReveal = {};
  room.players.forEach(p => {
    roleReveal[p.id] = { orig: room.origRoles[p.id], final: finalRoles[p.id] };
  });

  room.phase = 'results';

  io.to(room.code).emit('game-over', {
    killed:      killed.map(id => ({
      id, name: room.players.find(p => p.id === id)?.name, role: finalRoles[id],
    })),
    winningTeam, winnerIds,
    roles:   roleReveal,
    center:  room.center,
    players: room.players.map(p => ({ id: p.id, name: p.name })),
    votes:   room.votes,
    tally,
  });
}

// ─── SOCKET.IO ────────────────────────────────────────────────────────────────

io.on('connection', socket => {

  socket.on('create-room', ({ name }) => {
    const n = name?.trim();
    if (!n) return;
    const room = makeRoom(socket.id, n);
    socket.join(room.code);
    socket.emit('room-joined', { code: room.code, phrase: room.phrase, isHost: true, playerId: socket.id });
    syncLobby(room);
  });

  socket.on('join-room', ({ name, code }) => {
    const n = name?.trim();
    const c = code?.trim().toUpperCase();
    if (!n || !c) return;
    const room = rooms[c];
    if (!room)                    { socket.emit('error', { msg: 'Room not found.' }); return; }
    if (room.phase !== 'lobby')   { socket.emit('error', { msg: 'Game already in progress.' }); return; }
    if (room.players.length >= 10){ socket.emit('error', { msg: 'Room is full (max 10).' }); return; }
    if (room.players.some(p => p.name.toLowerCase() === n.toLowerCase()))
                                  { socket.emit('error', { msg: 'That name is taken.' }); return; }
    room.players.push({ id: socket.id, name: n });
    socket.join(c);
    socket.emit('room-joined', { code: c, phrase: room.phrase, isHost: false, playerId: socket.id });
    syncLobby(room);
  });

  socket.on('start-game', ({ roles: sel }) => {
    const room = roomOf(socket.id);
    if (!room || room.host !== socket.id) return;
    if (room.players.length < 3)                        { socket.emit('error', { msg: 'Need at least 3 players.' }); return; }
    if (!Array.isArray(sel) || sel.length !== room.players.length + 3)
                                                         { socket.emit('error', { msg: `Select exactly ${room.players.length + 3} role cards.` }); return; }
    // Validate counts
    const counts = {};
    for (const r of sel) counts[r] = (counts[r] || 0) + 1;
    for (const [r, cnt] of Object.entries(counts)) {
      if (cnt > (ROLE_MAX[r] || 1)) { socket.emit('error', { msg: `Too many ${r} cards.` }); return; }
    }
    startGame(room, sel);
  });

  socket.on('set-day-duration', ({ seconds }) => {
    const room = roomOf(socket.id);
    if (!room || room.host !== socket.id) return;
    room.dayDuration = Math.max(30, Math.min(600, Number(seconds) || 300));
  });

  socket.on('night-action', ({ action }) => {
    const room = roomOf(socket.id);
    if (!room || room.phase !== 'night') return;
    handleNightAction(room, socket.id, action);
  });

  socket.on('night-skip', () => {
    const room = roomOf(socket.id);
    if (!room || room.phase !== 'night') return;
    handleNightSkip(room, socket.id);
  });

  socket.on('skip-to-vote', () => {
    const room = roomOf(socket.id);
    if (!room || room.host !== socket.id || room.phase !== 'day') return;
    startVoting(room);
  });

  socket.on('vote', ({ targetId }) => {
    const room = roomOf(socket.id);
    if (!room || room.phase !== 'voting') return;
    handleVote(room, socket.id, targetId);
  });

  socket.on('play-again', () => {
    const room = roomOf(socket.id);
    if (!room || room.host !== socket.id) return;
    if (room._dayTimer)  clearTimeout(room._dayTimer);
    if (room._voteTimer) clearTimeout(room._voteTimer);
    if (room._nightTimer)clearTimeout(room._nightTimer);
    room.phase = 'lobby';
    room.roles = {}; room.origRoles = {}; room.center = [];
    room.nightQueue = []; room.curNightRole = null; room.nightDone = new Set();
    room.votes = {};
    io.to(room.code).emit('return-to-lobby');
    syncLobby(room);
  });

  socket.on('kick-player', ({ targetId }) => {
    const room = roomOf(socket.id);
    if (!room || room.host !== socket.id) return;
    room.players = room.players.filter(p => p.id !== targetId);
    io.to(targetId).emit('kicked');
    syncLobby(room);
  });

  socket.on('change-name', ({ name }) => {
    const n = name?.trim();
    if (!n) return;
    const room = roomOf(socket.id);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (p) { p.name = n; syncLobby(room); }
  });

  socket.on('disconnect', () => {
    const room = dropPlayer(socket.id);
    if (room) {
      io.to(room.code).emit('player-left', { id: socket.id });
      if (room.phase === 'lobby') syncLobby(room);
    }
  });
});

// ─── START ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`🐺 Werewolf server running → http://localhost:${PORT}`)
);
