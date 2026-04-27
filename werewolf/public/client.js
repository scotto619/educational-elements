'use strict';

/* ══════════════════════════════════════════════════════════ FIREBASE INIT ══ */

let DB;

function fbInit() {
  if (!window.FIREBASE_CONFIG ||
      window.FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
    showCfgErr(); return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    DB = firebase.database();
    return true;
  } catch (e) {
    console.error('Firebase init error:', e);
    showCfgErr(); return false;
  }
}

function showCfgErr() {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;
      background:#1a1a1e;color:#fff;font-family:system-ui;text-align:center;padding:24px">
      <div>
        <div style="font-size:3rem;margin-bottom:16px">⚙️</div>
        <h2 style="margin:0 0 12px">Firebase not configured</h2>
        <p style="color:#8b93a5;max-width:420px;line-height:1.7;margin:0 auto">
          Open <code style="background:#25252f;padding:2px 8px;border-radius:4px;
            color:#4fc3f7">firebase-config.js</code> and fill in your project credentials.<br><br>
          <a href="https://console.firebase.google.com/" target="_blank"
            style="color:#4fc3f7;text-decoration:none">
            Create a free Firebase project →</a><br><br>
          <span style="font-size:.85rem;color:#6b7280">
            Enable Realtime Database and set rules to allow read/write.
          </span>
        </p>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════ ROLE DATA ══ */

const ROLES = {
  werewolf:     { icon:'🐺', name:'Werewolf',     team:'Werewolf',    teamCls:'werewolf',
    desc:'You are a Werewolf. Find your pack and stay hidden. Avoid getting voted out.',
    nightDesc:'Wake up and look for other Werewolves.' },
  minion:       { icon:'🤝', name:'Minion',        team:'Werewolf',    teamCls:'minion',
    desc:'You are the Minion. You win with the Werewolves — but they don\'t know who you are.',
    nightDesc:'Wake up and see who the Werewolves are.' },
  seer:         { icon:'🔮', name:'Seer',           team:'Village',     teamCls:'seer',
    desc:'You are the Seer. Look at another player\'s card, or peek at two center cards.',
    nightDesc:'Wake up. Choose a player\'s card to look at, OR look at two center cards.' },
  robber:       { icon:'🦹', name:'Robber',         team:'Village',     teamCls:'robber',
    desc:'You are the Robber. Steal another player\'s card and see your new role.',
    nightDesc:'Wake up. You may swap your card with another player\'s and see your new role.' },
  troublemaker: { icon:'😈', name:'Troublemaker',   team:'Village',     teamCls:'troublemaker',
    desc:'You are the Troublemaker. Swap two other players\' cards without looking.',
    nightDesc:'Wake up. Swap any two other players\' cards (you don\'t get to see them).' },
  drunk:        { icon:'🍺', name:'Drunk',           team:'Village',     teamCls:'drunk',
    desc:'You are the Drunk. Swap your card with a center card — you won\'t know what you became.',
    nightDesc:'Wake up and take one center card. You won\'t know what it is.' },
  insomniac:    { icon:'👁️', name:'Insomniac',       team:'Village',     teamCls:'insomniac',
    desc:'You are the Insomniac. You wake last to check whether your card changed.',
    nightDesc:'Wake up and look at your card to see if it was swapped.' },
  villager:     { icon:'👤', name:'Villager',        team:'Village',     teamCls:'villager',
    desc:'You are a Villager. You have no night power — rely on your wits during the day.',
    nightDesc:'' },
  mason:        { icon:'🔨', name:'Mason',            team:'Village',     teamCls:'mason',
    desc:'You are a Mason. You and the other Masons know each other.',
    nightDesc:'Wake up and look for the other Masons.' },
  hunter:       { icon:'🏹', name:'Hunter',           team:'Village',     teamCls:'hunter',
    desc:'You are the Hunter. If you are voted out, the player you voted for is also eliminated.',
    nightDesc:'' },
  tanner:       { icon:'🪚', name:'Tanner',           team:'Independent', teamCls:'tanner',
    desc:'You are the Tanner. You WANT to die — get yourself voted out to win!',
    nightDesc:'' },
};

const ROLE_MAX = {
  werewolf:3, villager:5, seer:1, robber:1, troublemaker:1,
  drunk:1, insomniac:1, mason:2, minion:1, hunter:1, tanner:1,
};

const NIGHT_ORDER = [
  'werewolf','minion','mason','seer','robber','troublemaker','drunk','insomniac',
];

const PASSIVE = new Set(['villager','hunter','tanner']);

/* ═══════════════════════════════════════════════════════════════ UTILS ══ */

function genUID() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Firebase stores arrays as objects {0:v, 1:v, ...} — convert back */
function objToArr(o) {
  if (!o) return [];
  if (Array.isArray(o)) return o;
  return Object.keys(o).sort((a, b) => +a - +b).map(k => o[k]);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

const WW = {
  adj:  ['Angry','Bold','Calm','Dark','Fierce','Glad','Happy','Lunar','Mighty','Noble','Quick','Swift','Wise'],
  noun: ['Bears','Cats','Eagles','Foxes','Hawks','Lions','Owls','Wolves','Bees','Deer','Crows','Stags'],
  verb: ['Chase','Dance','Hunt','Leap','March','Play','Race','Sing','Howl','Swim','Roam','Creep'],
  adv:  ['Boldly','Calmly','Fast','Gladly','Loudly','Quickly','Slowly','Wildly','Freely','Deeply'],
};
const pick = a => a[Math.random() * a.length | 0];
const genPhrase = () => `${pick(WW.adj)} ${pick(WW.noun)} ${pick(WW.verb)} ${pick(WW.adv)}`;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const genCode = () => Array(4).fill(0).map(() => CHARS[Math.random() * CHARS.length | 0]).join('');

/* ═══════════════════════════════════════════════════════════════ STATE ══ */

const S = {
  uid: null, name: '', code: null, isHost: false, mode: 'create',
  hostUid: null, phrase: '',
  phase: null,
  players: {},        // { uid: { name, joinedAt } }
  selectedRoles: {},  // { role: count }
  origRoles: {},      // { uid: role }
  roles: {},          // { uid: currentRole }
  center: [],         // [role, role, role]
  nightQueue: [],     // [role, ...]
  curNightRole: null,
  curNightIdx: -1,
  nightDone: {},      // { uid: true }
  votes: {},          // { uid: targetUid }
  dayDuration: 300,
  dayEnd: 0,
  dayInterval: null,
  myVote: null,
  pendingAction: null,
  // host-only timers
  _nightTimer: null,
  _voteTimer: null,
  _dayTimer: null,
  _nightAdv: false,
};

/* ════════════════════════════════════════════════════════════ FIREBASE OPS ══ */

const _listeners = [];
function fbOn(ref, ev, fn) { ref.on(ev, fn); _listeners.push({ ref, ev, fn }); }
function fbOff() { _listeners.forEach(({ ref, ev, fn }) => ref.off(ev, fn)); _listeners.length = 0; }

function rRef(path) {
  return DB.ref('rooms/' + S.code + (path ? '/' + path : ''));
}

/* ══════════════════════════════════════════════════════════════ AVATAR ══ */

const AV_BG = ['#e74c3c','#e67e22','#f1c40f','#2ecc71','#1abc9c',
               '#3498db','#9b59b6','#e91e63','#00bcd4','#ff5722'];
const AV_FG = ['#fff','#fff','#222','#222','#222','#fff','#fff','#fff','#222','#fff'];
const avStyle = i => `background:${AV_BG[i%10]};color:${AV_FG[i%10]}`;
const initials = n => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

/* ═══════════════════════════════════════════════════════════ SCREENS ══ */

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id)?.classList.add('active');
}
function curScreen() {
  return document.querySelector('.screen.active')?.id?.replace('screen-', '') || '';
}

/* ═══════════════════════════════════════════════════════════════ TOAST ══ */

let _tt;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ═══════════════════════════════════════════════════════════ LANDING ══ */

function showNameEntry(mode) {
  S.mode = mode;
  document.getElementById('code-group').style.display   = mode === 'join' ? '' : 'none';
  document.getElementById('name-title').textContent      = mode === 'join' ? 'Join a Game' : 'Enter Your Name';
  document.getElementById('name-submit-btn').textContent = mode === 'join' ? 'Join' : 'Create Game';
  document.getElementById('inp-name').value = S.name || '';
  document.getElementById('inp-code').value = '';
  showScreen('name');
  setTimeout(() => document.getElementById('inp-name').focus(), 100);
}

async function submitName() {
  const name = document.getElementById('inp-name').value.trim();
  if (!name) { toast('Please enter your name.'); return; }
  S.name = name;
  if (S.mode === 'join') {
    const code = document.getElementById('inp-code').value.trim().toUpperCase();
    if (code.length !== 4) { toast('Enter a 4-letter room code.'); return; }
    await joinRoom(name, code);
  } else {
    await createRoom(name);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ['inp-name', 'inp-code'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitName();
    });
  });
  if (!fbInit()) return;
  // Try to reconnect existing session
  const savedUid  = sessionStorage.getItem('ww_uid');
  const savedCode = sessionStorage.getItem('ww_code');
  const savedName = sessionStorage.getItem('ww_name');
  if (savedUid && savedCode && savedName) {
    attemptReconnect(savedUid, savedCode, savedName);
  }
});

async function attemptReconnect(uid, code, name) {
  try {
    const snap = await DB.ref('rooms/' + code + '/players/' + uid).once('value');
    if (snap.exists()) {
      S.uid = uid; S.code = code; S.name = name;
      const hostSnap = await DB.ref('rooms/' + code + '/host').once('value');
      S.hostUid = hostSnap.val();
      S.isHost  = hostSnap.val() === uid;
      listenRoom();
      // Phase will trigger correct screen via onPhase()
    }
  } catch (e) {
    // Ignore reconnect errors — just stay on landing
  }
}

function saveSession() {
  sessionStorage.setItem('ww_uid',  S.uid);
  sessionStorage.setItem('ww_code', S.code);
  sessionStorage.setItem('ww_name', S.name);
}

function clearSession() {
  sessionStorage.removeItem('ww_uid');
  sessionStorage.removeItem('ww_code');
  sessionStorage.removeItem('ww_name');
}

/* ════════════════════════════════════════════════════════ ROOM CREATION ══ */

async function createRoom(name) {
  // Find an unused room code
  let code;
  for (let i = 0; i < 20; i++) {
    code = genCode();
    const exists = await DB.ref('rooms/' + code + '/host').once('value');
    if (!exists.exists()) break;
  }
  S.uid = genUID(); S.code = code; S.isHost = true;
  S.hostUid = S.uid;
  S.selectedRoles = { werewolf:2, seer:1, robber:1, troublemaker:1 };

  await DB.ref('rooms/' + code).set({
    host:         S.uid,
    phrase:       genPhrase(),
    phase:        'lobby',
    dayDuration:  300,
    players:      { [S.uid]: { name, joinedAt: Date.now() } },
    selectedRoles: S.selectedRoles,
  });

  // Auto-remove player on disconnect
  DB.ref('rooms/' + code + '/players/' + S.uid).onDisconnect().remove();
  // If host disconnects, transfer host to first remaining player (handled via onDisconnect)
  // Simple approach: just remove their player entry

  saveSession();
  listenRoom();
  showScreen('lobby');
}

async function joinRoom(name, code) {
  const hostSnap = await DB.ref('rooms/' + code + '/host').once('value');
  if (!hostSnap.exists()) { toast('Room not found.'); return; }

  const phaseSnap = await DB.ref('rooms/' + code + '/phase').once('value');
  if (phaseSnap.val() !== 'lobby') { toast('Game already in progress.'); return; }

  const psSnap = await DB.ref('rooms/' + code + '/players').once('value');
  const ps = psSnap.val() || {};
  const pList = Object.values(ps);
  if (pList.length >= 10)  { toast('Room is full (max 10).'); return; }
  if (pList.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    toast('That name is taken.'); return;
  }

  S.uid = genUID(); S.code = code; S.isHost = false;
  S.hostUid = hostSnap.val();

  await DB.ref('rooms/' + code + '/players/' + S.uid).set({ name, joinedAt: Date.now() });
  DB.ref('rooms/' + code + '/players/' + S.uid).onDisconnect().remove();

  saveSession();
  listenRoom();
  showScreen('lobby');
}

function leaveRoom() {
  stopTimers();
  fbOff();
  if (S.code && S.uid) DB.ref('rooms/' + S.code + '/players/' + S.uid).remove();
  clearSession();
  resetState();
  showScreen('landing');
}

function resetState() {
  stopTimers();
  Object.assign(S, {
    uid:null, code:null, isHost:false, hostUid:null, phrase:'',
    phase:null, players:{}, selectedRoles:{},
    origRoles:{}, roles:{}, center:[], nightQueue:[],
    curNightRole:null, curNightIdx:-1,
    nightDone:{}, votes:{},
    dayDuration:300, dayEnd:0,
    myVote:null, pendingAction:null,
    _nightAdv:false,
  });
}

function stopTimers() {
  if (S.dayInterval)  { clearInterval(S.dayInterval);  S.dayInterval = null; }
  if (S._nightTimer)  { clearTimeout(S._nightTimer);   S._nightTimer = null; }
  if (S._voteTimer)   { clearTimeout(S._voteTimer);    S._voteTimer = null; }
  if (S._dayTimer)    { clearTimeout(S._dayTimer);      S._dayTimer = null; }
}

/* ════════════════════════════════════════════════════════ FIREBASE LISTEN ══ */

function listenRoom() {
  const c = S.code;

  // Phase — drives screen transitions
  fbOn(DB.ref(`rooms/${c}/phase`), 'value', snap => {
    const p = snap.val(); if (!p) return;
    const prev = S.phase; S.phase = p;
    if (p !== prev) onPhase(p);
  });

  // Players list
  fbOn(DB.ref(`rooms/${c}/players`), 'value', snap => {
    S.players = snap.val() || {};
    if (S.phase === 'lobby') renderLobby();
  });

  // Host uid
  fbOn(DB.ref(`rooms/${c}/host`), 'value', snap => {
    S.hostUid = snap.val();
    // If host left and I'm next
    if (S.hostUid === S.uid && !S.isHost) {
      S.isHost = true;
      toast('You are now the host.');
      if (S.phase === 'lobby') renderLobby();
    }
  });

  // Phrase
  fbOn(DB.ref(`rooms/${c}/phrase`), 'value', snap => {
    S.phrase = snap.val() || '';
    if (S.phase === 'lobby') {
      document.getElementById('lobby-phrase').textContent = S.phrase;
    }
  });

  // Day duration (set by host slider)
  fbOn(DB.ref(`rooms/${c}/dayDuration`), 'value', snap => {
    S.dayDuration = snap.val() || 300;
  });

  // Selected roles (host writes, guest reads for display)
  fbOn(DB.ref(`rooms/${c}/selectedRoles`), 'value', snap => {
    S.selectedRoles = snap.val() || {};
    if (S.phase === 'lobby') { renderRoleGrid(); updateRoleBadge(); updateStartButton(); }
  });

  // Game data (set once on game start)
  fbOn(DB.ref(`rooms/${c}/origRoles`), 'value', snap => { S.origRoles = snap.val() || {}; });
  fbOn(DB.ref(`rooms/${c}/roles`),     'value', snap => { S.roles     = snap.val() || {}; });
  fbOn(DB.ref(`rooms/${c}/center`),    'value', snap => { S.center    = objToArr(snap.val()); });
  fbOn(DB.ref(`rooms/${c}/nightQueue`),'value', snap => { S.nightQueue = objToArr(snap.val()); });

  // Current night role (host writes to advance night)
  fbOn(DB.ref(`rooms/${c}/curNightRole`), 'value', snap => {
    const role = snap.val();
    if (role === S.curNightRole) return;
    S.curNightRole = role;
    if (S.phase === 'night' && role) onNightRoleChange(role);
  });

  fbOn(DB.ref(`rooms/${c}/curNightIdx`), 'value', snap => {
    S.curNightIdx = snap.val() ?? -1;
  });

  // Night done (host watches to advance)
  fbOn(DB.ref(`rooms/${c}/nightDone`), 'value', snap => {
    S.nightDone = snap.val() || {};
    if (S.phase === 'night' && S.isHost) hostCheckNightDone();
  });

  // My night result (private per player)
  fbOn(DB.ref(`rooms/${c}/nightResults/${S.uid}`), 'value', snap => {
    const r = snap.val();
    if (r) renderNightResult(r);
  });

  // Votes
  fbOn(DB.ref(`rooms/${c}/votes`), 'value', snap => {
    S.votes = snap.val() || {};
    if (S.phase === 'voting') {
      const total = Object.keys(S.players).length;
      const count = Object.keys(S.votes).length;
      updateVoteCount(count, total);
      if (S.isHost && count >= total) {
        if (S._voteTimer) { clearTimeout(S._voteTimer); S._voteTimer = null; }
        setTimeout(() => hostResolveGame(), 800);
      }
    }
  });

  // Day end timestamp
  fbOn(DB.ref(`rooms/${c}/dayEnd`), 'value', snap => {
    const ts = snap.val();
    if (ts) { S.dayEnd = ts; if (S.phase === 'day') startDayCountdown(); }
  });

  // Game over payload
  fbOn(DB.ref(`rooms/${c}/gameOver`), 'value', snap => {
    const go = snap.val();
    if (go && S.phase === 'results') renderResults(go);
  });
}

/* ══════════════════════════════════════════════════ PHASE CHANGE HANDLER ══ */

function onPhase(phase) {
  switch (phase) {
    case 'lobby':
      stopTimers();
      renderLobby();
      showScreen('lobby');
      break;

    case 'reveal':
      // origRoles will have been written by host before phase change
      setTimeout(() => {
        const myRole = S.origRoles[S.uid];
        if (myRole) renderRoleReveal(myRole);
      }, 300);
      break;

    case 'night':
      // onNightRoleChange() fires when curNightRole updates
      // If already set, handle now (reconnect case)
      if (S.curNightRole) onNightRoleChange(S.curNightRole);
      break;

    case 'day':
      if (S.dayEnd) startDayCountdown();
      break;

    case 'voting':
      renderVotingScreen();
      break;

    case 'results':
      // gameOver listener will render results
      DB.ref(`rooms/${S.code}/gameOver`).once('value').then(snap => {
        const go = snap.val();
        if (go) renderResults(go);
      });
      break;
  }
}

/* ════════════════════════════════════════════════════════════════ LOBBY ══ */

function playerArray() {
  return Object.entries(S.players)
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
    .map(([uid, p]) => ({ uid, ...p }));
}

function renderLobby() {
  const pArr = playerArray();

  document.getElementById('lobby-code').textContent   = S.code || '----';
  document.getElementById('lobby-phrase').textContent = S.phrase || '';

  const list = document.getElementById('lobby-players');
  list.innerHTML = pArr.map((p, i) => {
    const isMe   = p.uid === S.uid;
    const isHost = p.uid === S.hostUid;
    const kick   = S.isHost && !isMe
      ? `<span class="player-kick" onclick="kickPlayer('${p.uid}')">✕</span>` : '';
    return `<div class="player-item">
      <div class="player-avatar av-${i}" style="${avStyle(i)}">${initials(p.name)}</div>
      <div class="player-name">${esc(p.name)}${isMe ? ' <span style="color:var(--text-dim);font-size:.78rem">(you)</span>' : ''}</div>
      ${isHost ? '<span class="player-host">host</span>' : ''}
      ${kick}
    </div>`;
  }).join('');

  document.getElementById('host-controls').style.display = S.isHost ? '' : 'none';
  document.getElementById('guest-waiting').style.display = S.isHost ? 'none' : '';
  document.getElementById('start-btn').style.display     = S.isHost ? '' : 'none';

  if (S.isHost) { renderRoleGrid(); updateRoleBadge(); }
  updateStartButton();
}

function updateStartButton() {
  const btn   = document.getElementById('start-btn');
  const pCnt  = Object.keys(S.players).length;
  const total = Object.values(S.selectedRoles).reduce((a, b) => a + b, 0);
  const need  = pCnt + 3;
  btn.disabled = pCnt < 3 || total !== need;
}

function kickPlayer(targetUid) {
  if (!S.isHost) return;
  DB.ref(`rooms/${S.code}/players/${targetUid}`).remove();
}

/* ══════════════════════════════════════════════════════════ ROLE PICKER ══ */

function renderRoleGrid() {
  const grid = document.getElementById('role-grid');
  grid.innerHTML = Object.entries(ROLES).map(([key, r]) => {
    const cnt = S.selectedRoles[key] || 0;
    const max = ROLE_MAX[key];
    return `<div class="role-tile${cnt > 0 ? ' has-count' : ''}" id="tile-${key}">
      <div class="role-tile-icon">${r.icon}</div>
      <div class="role-tile-name">${r.name}</div>
      <div class="role-tile-team">${r.team}</div>
      <div class="role-tile-ctrl">
        <button class="role-tile-btn" onclick="changeRole('${key}',-1)" ${cnt===0?'disabled':''}>−</button>
        <span class="role-tile-count" id="cnt-${key}">${cnt}</span>
        <button class="role-tile-btn" onclick="changeRole('${key}',+1)" ${cnt>=max?'disabled':''}>+</button>
      </div>
    </div>`;
  }).join('');
  updateRoleBadge();
}

function changeRole(key, delta) {
  if (!S.isHost) return;
  const cnt = Math.max(0, Math.min(ROLE_MAX[key], (S.selectedRoles[key] || 0) + delta));
  S.selectedRoles[key] = cnt;

  const tile  = document.getElementById('tile-' + key);
  const cntEl = document.getElementById('cnt-' + key);
  tile?.classList.toggle('has-count', cnt > 0);
  if (cntEl) cntEl.textContent = cnt;
  const btns = tile?.querySelectorAll('.role-tile-btn');
  if (btns) { btns[0].disabled = cnt === 0; btns[1].disabled = cnt >= ROLE_MAX[key]; }

  updateRoleBadge();
  updateStartButton();

  // Debounced write to Firebase
  clearTimeout(_roleWriteTimer);
  _roleWriteTimer = setTimeout(() => {
    DB.ref(`rooms/${S.code}/selectedRoles`).set(S.selectedRoles);
  }, 400);
}
let _roleWriteTimer;

function updateRoleBadge() {
  const total = Object.values(S.selectedRoles).reduce((a, b) => a + b, 0);
  const need  = Object.keys(S.players).length + 3;
  const badge = document.getElementById('role-count-badge');
  if (!badge) return;
  badge.textContent = `${total} / ${need}`;
  badge.className   = 'role-count-badge ' + (total === need ? 'ok' : 'bad');
}

function updateDayTimer(val) {
  const sec = Number(val);
  document.getElementById('day-timer-val').textContent = fmtTime(sec);
  S.dayDuration = sec;
  DB.ref(`rooms/${S.code}/dayDuration`).set(sec);
}

/* ══════════════════════════════════════════════════════════════ START ══ */

async function startGame() {
  if (!S.isHost) return;
  const pArr = playerArray();
  if (pArr.length < 3) { toast('Need at least 3 players.'); return; }

  const roles = [];
  for (const [key, cnt] of Object.entries(S.selectedRoles))
    for (let i = 0; i < cnt; i++) roles.push(key);

  if (roles.length !== pArr.length + 3) {
    toast(`Select exactly ${pArr.length + 3} role cards.`); return;
  }

  const shuffled = shuffle(roles);
  const center   = shuffled.slice(0, 3);
  const dealt    = shuffled.slice(3);

  const origRoles = {}, currentRoles = {};
  pArr.forEach((p, i) => { origRoles[p.uid] = dealt[i]; currentRoles[p.uid] = dealt[i]; });

  // Build night queue from roles in play
  const allRoles = new Set([...Object.values(origRoles), ...center]);
  const nightQueue = NIGHT_ORDER.filter(r => {
    if (!allRoles.has(r)) return false;
    if (r === 'mason') return [...allRoles].filter(x => x === 'mason').length >= 2;
    return true;
  });

  // Write all game data atomically then change phase
  await rRef().update({
    origRoles,
    roles:      currentRoles,
    center:     Object.fromEntries(center.map((r, i) => [i, r])),
    nightQueue: Object.fromEntries(nightQueue.map((r, i) => [i, r])),
    curNightRole:  null,
    curNightIdx:   -1,
    nightDone:     null,
    nightResults:  null,
    votes:         null,
    gameOver:      null,
    dayEnd:        null,
    phase:         'reveal',
  });

  // After role reveal pause, start night
  setTimeout(() => hostBeginNight(), 6000);
}

/* ═══════════════════════════════════════════════════════════ ROLE REVEAL ══ */

let _cardFlipped = false;

function renderRoleReveal(role) {
  _cardFlipped = false;
  const data  = ROLES[role];
  const back  = document.getElementById('reveal-card-back-el');
  back.innerHTML = `<div class="role-card role-${role}">
    <div class="role-card-icon">${data.icon}</div>
    <div class="role-card-name">${data.name}</div>
    <div class="role-card-team">${data.team}</div>
  </div>`;

  document.getElementById('reveal-hint').style.display  = '';
  document.getElementById('role-desc').style.display    = 'none';
  document.getElementById('reveal-ok-btn').disabled     = true;
  document.getElementById('reveal-flip').classList.remove('flipped');
  showScreen('role-reveal');
}

function flipCard() {
  if (_cardFlipped) return;
  _cardFlipped = true;
  document.getElementById('reveal-flip').classList.add('flipped');
  document.getElementById('reveal-hint').style.display  = 'none';
  document.getElementById('role-desc').style.display    = '';
  document.getElementById('role-desc').textContent      = ROLES[S.origRoles[S.uid]]?.desc || '';
  document.getElementById('reveal-ok-btn').disabled     = false;
}

function goToNightWait() {
  document.getElementById('sleep-role-name').textContent = 'Someone';
  showScreen('night-sleep');
}

/* ═══════════════════════════════════════════════════ HOST NIGHT LOGIC ══ */

async function hostBeginNight() {
  if (!S.isHost) return;
  await rRef('phase').set('night');
  await hostAdvanceNight(0);
}

async function hostAdvanceNight(idx) {
  if (!S.isHost || S._nightAdv) return;
  S._nightAdv = true;

  // Clear previous timer
  if (S._nightTimer) { clearTimeout(S._nightTimer); S._nightTimer = null; }

  // Find next applicable role
  while (idx < S.nightQueue.length) {
    const role   = S.nightQueue[idx];
    const active = hostActivePlayers(role);

    // Skip passive roles with no active players, or non-applicable masons
    if (active.length === 0 || PASSIVE.has(role)) {
      // Brief signal that this role "woke up" (for atmosphere), then advance
      await rRef().update({ curNightRole: role, curNightIdx: idx, nightDone: null });
      await sleep(1500);
      idx++; continue;
    }
    break;
  }

  if (idx >= S.nightQueue.length) {
    S._nightAdv = false;
    await hostStartDay();
    return;
  }

  const role = S.nightQueue[idx];
  S.curNightIdx = idx;

  // Write current night state (clear nightDone for fresh phase)
  await rRef().update({ curNightRole: role, curNightIdx: idx, nightDone: null });
  S.nightDone = {};
  S._nightAdv = false;

  // Timeout — auto-skip players who haven't acted
  S._nightTimer = setTimeout(async () => {
    const active = hostActivePlayers(role);
    const updates = {};
    for (const uid of active) {
      if (!S.nightDone[uid]) updates[`nightDone/${uid}`] = true;
    }
    if (Object.keys(updates).length) await rRef().update(updates);
    // advance handled by nightDone listener
  }, 60_000);
}

function hostActivePlayers(role) {
  return Object.entries(S.origRoles)
    .filter(([, r]) => r === role)
    .map(([uid]) => uid);
}

function hostCheckNightDone() {
  if (!S.isHost || S._nightAdv) return;
  const role = S.nightQueue[S.curNightIdx];
  if (!role || PASSIVE.has(role)) return;
  const active = hostActivePlayers(role);
  if (active.length > 0 && active.every(uid => S.nightDone[uid])) {
    setTimeout(() => hostAdvanceNight(S.curNightIdx + 1), 800);
  }
}

async function hostStartDay() {
  if (!S.isHost) return;
  const dayEnd = Date.now() + S.dayDuration * 1000;
  await rRef().update({ phase: 'day', dayEnd, curNightRole: null });
  // Auto-transition to voting when timer expires
  S._dayTimer = setTimeout(() => hostStartVoting(), S.dayDuration * 1000);
}

async function hostStartVoting() {
  if (!S.isHost) return;
  if (S._dayTimer) { clearTimeout(S._dayTimer); S._dayTimer = null; }
  await rRef().update({ phase: 'voting', votes: null });
  // Voting timeout
  S._voteTimer = setTimeout(() => hostResolveGame(), 60_000);
}

function hostSkipToVote() {
  if (!S.isHost || S.phase !== 'day') return;
  hostStartVoting();
}

/* ═════════════════════════════════════════════════ CLIENT NIGHT ACTIONS ══ */

function onNightRoleChange(role) {
  const myOrigRole = S.origRoles[S.uid];
  const rd = ROLES[role];

  if (myOrigRole === role) {
    // It's my turn — render action screen
    renderNightAction(role);
  } else {
    // I'm sleeping
    document.getElementById('sleep-role-name').textContent = rd?.name || role;
    if (!['night-result'].includes(curScreen())) showScreen('night-sleep');
  }
}

function renderNightAction(role) {
  const rd      = ROLES[role];
  const others  = playerArray().filter(p => p.uid !== S.uid);

  document.getElementById('night-action-icon').textContent  = rd.icon;
  document.getElementById('night-action-title').textContent = rd.name;
  document.getElementById('night-action-desc').textContent  = rd.nightDesc;

  const body    = document.getElementById('night-action-body');
  const skipBtn = document.getElementById('night-skip-btn');
  const confBtn = document.getElementById('night-confirm-btn');
  body.innerHTML   = '';
  confBtn.disabled = true;
  skipBtn.textContent = 'Skip / No action';
  S.pendingAction  = null;

  switch (role) {

    case 'werewolf': {
      const mates = playerArray().filter(p => p.uid !== S.uid && S.origRoles[p.uid] === 'werewolf');
      if (mates.length > 0) {
        body.innerHTML = `<div class="night-action-card">
          <div class="night-action-title">Your pack:</div>
          ${mates.map(m => `<div class="choice-btn" style="background:rgba(107,21,21,.3);border-color:#6b1515">
            <span style="font-size:1.2rem">🐺</span> ${esc(m.name)}</div>`).join('')}
        </div>`;
        skipBtn.textContent = 'OK, got it';
      } else {
        // Lone wolf — peek at one center card
        body.innerHTML = `<div class="night-action-card">
          <div class="night-action-title">You are the lone wolf. Peek at a center card:</div>
          <div class="center-card-row">
            ${[0,1,2].map(i => `<div class="center-card-btn" id="ccard-${i}" onclick="wolvePeekCenter(${i})">
              <div class="qm">?</div><div>Card ${i+1}</div></div>`).join('')}
          </div>
        </div>`;
      }
      break;
    }

    case 'minion': {
      const wolves = playerArray().filter(p => S.origRoles[p.uid] === 'werewolf');
      body.innerHTML = `<div class="night-action-card">
        <div class="night-action-title">${wolves.length ? 'Werewolves:' : 'No Werewolves in this game!'}</div>
        ${wolves.map(w => `<div class="choice-btn" style="background:rgba(107,21,21,.3);border-color:#6b1515">🐺 ${esc(w.name)}</div>`).join('')}
        ${!wolves.length ? '<div style="color:var(--text-muted)">You\'re on your own.</div>' : ''}
      </div>`;
      skipBtn.textContent = 'OK, got it';
      break;
    }

    case 'mason': {
      const mates = playerArray().filter(p => p.uid !== S.uid && S.origRoles[p.uid] === 'mason');
      body.innerHTML = `<div class="night-action-card">
        <div class="night-action-title">${mates.length ? 'Other Mason(s):' : 'You are the only Mason awake.'}</div>
        ${mates.map(m => `<div class="choice-btn" style="background:rgba(42,48,96,.4);border-color:#2a3060">🔨 ${esc(m.name)}</div>`).join('')}
      </div>`;
      skipBtn.textContent = 'OK, got it';
      break;
    }

    case 'seer': {
      body.innerHTML = `<div class="night-action-card" id="seer-body">
        <div class="tabs">
          <div class="tab active" id="tab-player" onclick="seerTab('player')">Look at a player</div>
          <div class="tab"        id="tab-center" onclick="seerTab('center')">Look at center cards</div>
        </div>
        <div class="tab-panel active" id="panel-player">
          ${others.map(p => `<div class="choice-btn" id="sp-${p.uid}" onclick="seerSelectPlayer('${p.uid}')">${esc(p.name)}</div>`).join('')}
        </div>
        <div class="tab-panel" id="panel-center">
          <div class="night-action-title">Pick two cards:</div>
          <div class="center-card-row">
            ${[0,1,2].map(i => `<div class="center-card-btn" id="sc-${i}" onclick="seerSelectCenter(${i})">
              <div class="qm">?</div><div>Card ${i+1}</div></div>`).join('')}
          </div>
        </div>
      </div>`;
      break;
    }

    case 'robber': {
      body.innerHTML = `<div class="night-action-card">
        <div class="night-action-title">Swap your card with:</div>
        ${others.map(p => `<div class="choice-btn" id="rp-${p.uid}" onclick="robberSelect('${p.uid}')">${esc(p.name)}</div>`).join('')}
      </div>`;
      break;
    }

    case 'troublemaker': {
      body.innerHTML = `<div class="night-action-card">
        <div class="night-action-title">Swap two other players' cards (select two):</div>
        ${others.map(p => `<div class="choice-btn" id="tp-${p.uid}" onclick="troublemakerSelect('${p.uid}')">${esc(p.name)}</div>`).join('')}
      </div>`;
      S._tmSel = [];
      break;
    }

    case 'drunk': {
      body.innerHTML = `<div class="night-action-card">
        <div class="night-action-title">Take a center card (you won't know what it is):</div>
        <div class="center-card-row">
          ${[0,1,2].map(i => `<div class="center-card-btn" id="dc-${i}" onclick="drunkSelect(${i})">
            <div class="qm">?</div><div>Card ${i+1}</div></div>`).join('')}
        </div>
      </div>`;
      break;
    }

    case 'insomniac': {
      body.innerHTML = `<div class="night-action-card" style="text-align:center;color:var(--text-muted)">
        Checking your card…</div>`;
      skipBtn.textContent = 'OK';
      // Auto-trigger: write result directly
      setTimeout(() => {
        const currentRole = S.roles[S.uid] || S.origRoles[S.uid];
        const result = { role:'insomniac', result:{ currentRole } };
        DB.ref(`rooms/${S.code}/nightResults/${S.uid}`).set(result);
        DB.ref(`rooms/${S.code}/nightDone/${S.uid}`).set(true);
      }, 800);
      break;
    }

    default: {
      body.innerHTML = `<div class="night-action-card" style="text-align:center;color:var(--text-muted)">
        No action required.</div>`;
      skipBtn.textContent = 'OK';
    }
  }

  showScreen('night-action');
}

/* ─── Night action helpers ─────────────────────────────────────────────────── */

let _seerMode = 'player', _seerPlayer = null, _seerCenterPicks = [];

function seerTab(mode) {
  _seerMode = mode; _seerPlayer = null; _seerCenterPicks = [];
  document.getElementById('tab-player').classList.toggle('active', mode === 'player');
  document.getElementById('tab-center').classList.toggle('active', mode === 'center');
  document.getElementById('panel-player').classList.toggle('active', mode === 'player');
  document.getElementById('panel-center').classList.toggle('active', mode === 'center');
  document.querySelectorAll('[id^="sp-"]').forEach(e => e.classList.remove('selected'));
  document.querySelectorAll('[id^="sc-"]').forEach(e => e.classList.remove('selected','selected2'));
  document.getElementById('night-confirm-btn').disabled = true;
  S.pendingAction = null;
}

function seerSelectPlayer(uid) {
  document.querySelectorAll('[id^="sp-"]').forEach(e => e.classList.remove('selected'));
  document.getElementById('sp-' + uid)?.classList.add('selected');
  S.pendingAction = { type:'player', targetId: uid };
  document.getElementById('night-confirm-btn').disabled = false;
}

function seerSelectCenter(idx) {
  if (_seerCenterPicks.includes(idx)) {
    _seerCenterPicks = _seerCenterPicks.filter(i => i !== idx);
    document.getElementById('sc-' + idx)?.classList.remove('selected','selected2');
  } else if (_seerCenterPicks.length < 2) {
    _seerCenterPicks.push(idx);
    document.getElementById('sc-' + idx)?.classList.add(_seerCenterPicks.length === 1 ? 'selected' : 'selected2');
  }
  const ready = _seerCenterPicks.length === 2;
  S.pendingAction = ready ? { type:'center', indices: [..._seerCenterPicks] } : null;
  document.getElementById('night-confirm-btn').disabled = !ready;
}

function robberSelect(uid) {
  document.querySelectorAll('[id^="rp-"]').forEach(e => e.classList.remove('selected'));
  document.getElementById('rp-' + uid)?.classList.add('selected');
  S.pendingAction = { type:'swap', targetId: uid };
  document.getElementById('night-confirm-btn').disabled = false;
}

function troublemakerSelect(uid) {
  if (!S._tmSel) S._tmSel = [];
  const idx = S._tmSel.indexOf(uid);
  if (idx !== -1) {
    S._tmSel.splice(idx, 1);
    document.getElementById('tp-' + uid)?.classList.remove('selected','selected2');
  } else if (S._tmSel.length < 2) {
    S._tmSel.push(uid);
    document.getElementById('tp-' + uid)?.classList.add(S._tmSel.length === 1 ? 'selected' : 'selected2');
  }
  const ready = S._tmSel.length === 2;
  S.pendingAction = ready ? { type:'swap', targetIds: [...S._tmSel] } : null;
  document.getElementById('night-confirm-btn').disabled = !ready;
}

function drunkSelect(idx) {
  document.querySelectorAll('[id^="dc-"]').forEach(e => e.classList.remove('selected'));
  document.getElementById('dc-' + idx)?.classList.add('selected');
  S.pendingAction = { type:'take', centerIndex: idx };
  document.getElementById('night-confirm-btn').disabled = false;
}

function wolvePeekCenter(idx) {
  document.querySelectorAll('[id^="ccard-"]').forEach(e => e.classList.remove('selected'));
  document.getElementById('ccard-' + idx)?.classList.add('selected');
  S.pendingAction = { type:'center', index: idx };
  document.getElementById('night-confirm-btn').disabled = false;
}

/* ─── Confirm / Skip ──────────────────────────────────────────────────────── */

async function nightConfirm() {
  if (!S.pendingAction) return;
  document.getElementById('night-confirm-btn').disabled = true;
  document.getElementById('night-skip-btn').disabled    = true;
  await processNightAction(S.pendingAction);
}

async function nightSkip() {
  document.getElementById('night-confirm-btn').disabled = true;
  document.getElementById('night-skip-btn').disabled    = true;
  await DB.ref(`rooms/${S.code}/nightDone/${S.uid}`).set(true);
}

/* ─── Process action (client-side logic, writes result + done) ──────────── */

async function processNightAction(action) {
  const role = S.origRoles[S.uid];
  const updates = {};
  let result = null;

  switch (role) {

    case 'seer': {
      if (action.type === 'player') {
        const targetRole = S.roles[action.targetId];
        const targetName = S.players[action.targetId]?.name || '?';
        result = { type:'player', targetName, role: targetRole };
      } else {
        result = { type:'center', roles: action.indices.map(i => S.center[i]) };
      }
      break;
    }

    case 'robber': {
      const mine   = S.roles[S.uid];
      const theirs = S.roles[action.targetId];
      updates[`roles/${S.uid}`]           = theirs;
      updates[`roles/${action.targetId}`]  = mine;
      const targetName = S.players[action.targetId]?.name || '?';
      result = { newRole: theirs, targetName };
      break;
    }

    case 'troublemaker': {
      const [a, b] = action.targetIds;
      const rA = S.roles[a], rB = S.roles[b];
      updates[`roles/${a}`] = rB;
      updates[`roles/${b}`] = rA;
      result = {
        name1: S.players[a]?.name || '?',
        name2: S.players[b]?.name || '?',
      };
      break;
    }

    case 'drunk': {
      const ci     = action.centerIndex;
      const myRole = S.roles[S.uid];
      const cRole  = S.center[ci];
      updates[`roles/${S.uid}`] = cRole;
      updates[`center/${ci}`]   = myRole;
      result = {};
      break;
    }

    case 'werewolf': {
      if (action.type === 'center') {
        result = { centerRole: S.center[action.index] };
      } else {
        result = {};
      }
      break;
    }

    default:
      result = {};
  }

  if (Object.keys(updates).length) await rRef().update(updates);

  updates[`nightResults/${S.uid}`] = { role, result };
  updates[`nightDone/${S.uid}`]    = true;
  await rRef().update(updates);
}

/* ══════════════════════════════════════════════════════════ NIGHT RESULT ══ */

function renderNightResult(data) {
  const { role, result } = data;
  const rd = ROLES[role];

  document.getElementById('night-result-icon').textContent  = rd?.icon || '?';
  document.getElementById('night-result-title').textContent = rd?.name || role;

  const body = document.getElementById('night-result-body');

  if (role === 'seer') {
    if (result.type === 'player') {
      const r = ROLES[result.role];
      body.innerHTML = `<div style="text-align:center">
        <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:8px">${esc(result.targetName)}'s card is:</div>
        <div class="big-role">${r?.icon||'?'}</div>
        <div class="role-name">${r?.name||result.role}</div>
      </div>`;
    } else {
      const cards = (result.roles||[]).map(r => ROLES[r]);
      body.innerHTML = `<div style="text-align:center">
        <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:10px">Center cards you saw:</div>
        <div style="display:flex;gap:16px;justify-content:center">
          ${cards.map(r => `<div><div style="font-size:2rem">${r?.icon||'?'}</div>
            <div style="font-size:.82rem;margin-top:4px">${r?.name||'?'}</div></div>`).join('')}
        </div>
      </div>`;
    }
  } else if (role === 'robber') {
    const r = ROLES[result.newRole];
    body.innerHTML = `<div style="text-align:center">
      <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:8px">You stole ${esc(result.targetName)}'s card. You are now:</div>
      <div class="big-role">${r?.icon||'?'}</div>
      <div class="role-name">${r?.name||result.newRole}</div>
    </div>`;
  } else if (role === 'troublemaker') {
    body.innerHTML = `<div style="text-align:center;color:var(--text-muted);font-size:.9rem">
      You swapped <strong style="color:#fff">${esc(result.name1)}</strong>'s and
      <strong style="color:#fff">${esc(result.name2)}</strong>'s cards.<br>
      <span style="font-size:.8rem;margin-top:6px;display:block">You don't know what they are now.</span>
    </div>`;
  } else if (role === 'insomniac') {
    const r = ROLES[result.currentRole];
    const changed = result.currentRole !== S.origRoles[S.uid];
    body.innerHTML = `<div style="text-align:center">
      <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:8px">Your current card is:</div>
      <div class="big-role">${r?.icon||'?'}</div>
      <div class="role-name">${r?.name||result.currentRole}</div>
      ${changed ? `<div style="color:var(--danger);font-size:.82rem;margin-top:8px">⚠️ Your card was swapped!</div>` : ''}
    </div>`;
  } else if (role === 'werewolf' && result.centerRole) {
    const r = ROLES[result.centerRole];
    body.innerHTML = `<div style="text-align:center">
      <div style="color:var(--text-muted);font-size:.85rem;margin-bottom:8px">The center card you peeked at:</div>
      <div class="big-role">${r?.icon||'?'}</div>
      <div class="role-name">${r?.name||result.centerRole}</div>
    </div>`;
  } else if (role === 'drunk') {
    body.innerHTML = `<div style="text-align:center;color:var(--text-muted)">
      You took a center card. You don't know what you are now.<br>
      <span style="font-size:.8rem">Stay alert during the day!</span>
    </div>`;
  } else {
    body.innerHTML = `<div style="text-align:center;color:var(--text-muted)">Action recorded.</div>`;
  }

  showScreen('night-result');
}

function acknowledgeNightResult() {
  showScreen('night-sleep');
}

/* ═══════════════════════════════════════════════════════════════════ DAY ══ */

function startDayCountdown() {
  const pArr = playerArray();
  const list = document.getElementById('day-players-list');
  list.innerHTML = pArr.map((p, i) => `
    <div class="day-player">
      <div class="player-avatar av-${i}" style="${avStyle(i)}">${initials(p.name)}</div>
      ${esc(p.name)}${p.uid === S.uid ? ' <span style="color:var(--text-dim);font-size:.78rem">(you)</span>' : ''}
    </div>`).join('');

  document.getElementById('skip-vote-btn').style.display = S.isHost ? '' : 'none';
  document.getElementById('vote-now-btn').style.display  = 'none';

  if (S.dayInterval) clearInterval(S.dayInterval);
  S.dayInterval = setInterval(tickDay, 500);
  tickDay();
  showScreen('day');
}

function tickDay() {
  const remaining = Math.max(0, Math.round((S.dayEnd - Date.now()) / 1000));
  const el = document.getElementById('day-timer-display');
  if (el) {
    el.textContent = fmtTime(remaining);
    el.classList.toggle('urgent', remaining <= 30 && remaining > 0);
  }
  if (remaining <= 10 && S.isHost) {
    document.getElementById('vote-now-btn').style.display  = '';
    document.getElementById('skip-vote-btn').style.display = 'none';
  }
  if (remaining === 0) { clearInterval(S.dayInterval); S.dayInterval = null; }
}

/* ══════════════════════════════════════════════════════════════ VOTING ══ */

function renderVotingScreen() {
  S.myVote = null;
  const pArr = playerArray();
  const grid = document.getElementById('vote-grid');
  grid.innerHTML = pArr.map((p, i) => {
    const isMe = p.uid === S.uid;
    return `<div class="vote-card${isMe?' me':''}" id="vc-${p.uid}"
        onclick="${isMe ? '' : `castVoteFor('${p.uid}')`}">
      <div class="vote-avatar" style="${avStyle(i)}">${initials(p.name)}</div>
      <div class="vote-name">${esc(p.name)}</div>
      <div class="vote-status" id="vs-${p.uid}">${isMe ? '(you)' : 'Not voted'}</div>
    </div>`;
  }).join('');

  document.getElementById('vote-confirm-btn').disabled = true;
  updateVoteCount(0, pArr.length);
  showScreen('voting');
}

function castVoteFor(uid) {
  if (S.myVote) return;
  S.myVote = uid;
  document.querySelectorAll('.vote-card').forEach(el => el.classList.remove('selected'));
  document.getElementById('vc-' + uid)?.classList.add('selected');
  document.getElementById('vote-confirm-btn').disabled = false;
}

async function confirmVote() {
  if (!S.myVote) return;
  document.getElementById('vote-confirm-btn').disabled = true;
  await DB.ref(`rooms/${S.code}/votes/${S.uid}`).set(S.myVote);
  document.getElementById('vs-' + S.myVote).textContent = 'Voted ✓';
}

function updateVoteCount(count, total) {
  document.getElementById('vote-count-text').textContent = `${count} / ${total} voted`;
  document.getElementById('vote-bar-fill').style.width   = `${total ? (count / total) * 100 : 0}%`;
}

/* ══════════════════════════════════════════════════════ HOST RESOLUTION ══ */

async function hostResolveGame() {
  if (!S.isHost) return;
  if (S._voteTimer) { clearTimeout(S._voteTimer); S._voteTimer = null; }

  const [rolesSnap, origSnap, centerSnap, votesSnap, playersSnap] = await Promise.all([
    rRef('roles').once('value'),
    rRef('origRoles').once('value'),
    rRef('center').once('value'),
    rRef('votes').once('value'),
    rRef('players').once('value'),
  ]);

  const roles     = rolesSnap.val()  || {};
  const origRoles = origSnap.val()   || {};
  const center    = objToArr(centerSnap.val());
  const votes     = votesSnap.val()  || {};
  const players   = Object.entries(playersSnap.val() || {})
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
    .map(([uid, p]) => ({ id: uid, name: p.name }));

  // Tally votes
  const tally = {};
  for (const v of Object.values(votes)) tally[v] = (tally[v] || 0) + 1;

  const maxV = Math.max(0, ...Object.values(tally));
  let killed = maxV >= 2
    ? Object.entries(tally).filter(([, c]) => c === maxV).map(([id]) => id)
    : [];

  // Hunter special: if eliminated, also kills their vote target
  const huntKills = [];
  for (const id of killed) {
    if (roles[id] === 'hunter') {
      const target = votes[id];
      if (target && !killed.includes(target)) huntKills.push(target);
    }
  }
  killed = [...new Set([...killed, ...huntKills])];

  // Win conditions
  const werewolvesExist = Object.values(roles).includes('werewolf');
  const werewolfKilled  = killed.some(id => roles[id] === 'werewolf');
  const tannerKilled    = killed.some(id => roles[id] === 'tanner');

  let winningTeam, winnerIds;

  if (tannerKilled && !werewolfKilled) {
    winningTeam = 'tanner';
    winnerIds   = players.filter(p => roles[p.id] === 'tanner').map(p => p.id);
  } else if (werewolfKilled) {
    winningTeam = 'village';
    winnerIds   = players.filter(p => !['werewolf','minion'].includes(roles[p.id])).map(p => p.id);
  } else if (!werewolvesExist && !killed.length) {
    winningTeam = 'village';
    winnerIds   = players.map(p => p.id);
  } else {
    winningTeam = 'werewolf';
    winnerIds   = werewolvesExist
      ? players.filter(p => ['werewolf','minion'].includes(roles[p.id])).map(p => p.id)
      : players.filter(p => origRoles[p.id] === 'minion').map(p => p.id);
  }

  const roleReveal = {};
  players.forEach(p => { roleReveal[p.id] = { orig: origRoles[p.id], final: roles[p.id] }; });

  const gameOver = {
    killed:      killed.map(id => ({ id, name: players.find(p => p.id === id)?.name, role: roles[id] })),
    winningTeam, winnerIds,
    roles:       roleReveal,
    center,
    players,
    votes,
    tally,
  };

  await rRef().update({ phase: 'results', gameOver });
}

/* ══════════════════════════════════════════════════════════════ RESULTS ══ */

function renderResults(data) {
  if (S.dayInterval) { clearInterval(S.dayInterval); S.dayInterval = null; }

  const { killed, winningTeam, winnerIds, roles, center, players, votes } = data;

  const banners = {
    village:  { icon:'🌅', title:'Village Wins!',   sub:'The werewolves were hunted down.',  cls:'village'  },
    werewolf: { icon:'🐺', title:'Werewolves Win!',  sub:'The village was deceived.',          cls:'werewolf' },
    tanner:   { icon:'🪚', title:'Tanner Wins!',     sub:'The tanner got what they wanted.',   cls:'tanner'   },
  };
  const b = banners[winningTeam] || banners.village;
  const bannerEl = document.getElementById('result-banner');
  bannerEl.className = 'result-banner ' + b.cls;
  bannerEl.innerHTML = `<span class="result-icon">${b.icon}</span>
    <div class="result-title">${b.title}</div>
    <div class="result-sub">${b.sub}</div>`;

  // Killed list
  const killedEl = document.getElementById('killed-list');
  if (killed.length) {
    killedEl.innerHTML = killed.map(k => {
      const r = ROLES[k.role];
      return `<div class="killed-chip"><span class="k-icon">☠️</span>${esc(k.name)} (${r?.name||k.role})</div>`;
    }).join('');
  } else {
    killedEl.innerHTML = `<div style="color:var(--text-muted);font-size:.9rem">Nobody was eliminated.</div>`;
  }

  // Center cards
  const centerArr = Array.isArray(center) ? center : objToArr(center);
  document.getElementById('center-row').innerHTML = centerArr.map((role, i) => {
    const r = ROLES[role];
    return `<div class="center-reveal">
      <div class="role-card role-${role}">
        <div class="role-card-icon" style="font-size:1.8rem">${r?.icon||'?'}</div>
        <div class="role-card-name" style="font-size:.6rem">${r?.name||role}</div>
      </div>
      <span>Card ${i+1}</span>
    </div>`;
  }).join('');

  // Role reveal table
  const winnerSet = new Set(winnerIds);
  const killedIds = new Set(killed.map(k => k.id));
  const pMap      = Object.fromEntries(players.map(p => [p.id, p]));

  document.getElementById('results-tbody').innerHTML = players.map(p => {
    const rv       = roles[p.id];
    const origR    = ROLES[rv?.orig];
    const finalR   = ROLES[rv?.final];
    const rowCls   = winnerSet.has(p.id) ? 'winner' : killedIds.has(p.id) ? 'dead' : '';
    const voteTgt  = pMap[votes[p.id]];
    const changed  = rv?.orig !== rv?.final;
    return `<tr class="${rowCls}">
      <td>${esc(p.name)}${p.id===S.uid?' 👈':''}</td>
      <td><span class="role-pill">${origR?.icon||'?'} ${origR?.name||rv?.orig}</span></td>
      <td><span class="role-pill${changed?' style="border:1px solid var(--accent)"':''}">
        ${finalR?.icon||'?'} ${finalR?.name||rv?.final}</span></td>
      <td style="color:var(--text-muted)">${voteTgt ? esc(voteTgt.name) : '—'}</td>
    </tr>`;
  }).join('');

  document.getElementById('play-again-btn').style.display = S.isHost ? '' : 'none';
  showScreen('results');
}

async function playAgain() {
  if (!S.isHost) return;
  await rRef().update({
    phase: 'lobby',
    origRoles: null, roles: null, center: null,
    nightQueue: null, curNightRole: null, curNightIdx: -1,
    nightDone: null, nightResults: null,
    votes: null, dayEnd: null, gameOver: null,
  });
}

/* ═════════════════════════════════════════════════════════════ HELPERS ══ */

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
