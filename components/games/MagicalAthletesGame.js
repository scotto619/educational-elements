// components/games/MagicalAthletesGame.js — Magical Athletes Multiplayer Digital Companion
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ─── Character Definitions (uploads folder only) ──────────────────────────────
const CHARACTERS = [
  { name: 'Alchemist', file: 'Alchemist.png', emoji: '⚗️', color: '#7c3aed',
    ability: 'When rolling a 1 or 2, you may choose to move 4 spaces instead.',
    hint: '🎯 Rolled 1 or 2? Press "Use Ability" to move 4 instead!', type: 'active' },
  { name: 'Amazon', file: 'Amazon.png', emoji: '🏹', color: '#b45309',
    ability: 'Do not roll a die during your turn. Move exactly 5 spaces instead.',
    hint: '💡 Skip the dice — you always move exactly 5.', type: 'passive' },
  { name: 'Assassin', file: 'Assassin.png', emoji: '🗡️', color: '#374151',
    ability: 'Before the race begins, choose 1 racer. Remove that racer and replace it with a random unused racer.',
    hint: '⚠️ Setup ability — use before race starts.', type: 'setup' },
  { name: 'Banana', file: 'Banana.png', emoji: '🍌', color: '#d97706',
    ability: 'Any racer that passes Banana trips (misses next turn). Banana also trips anyone it passes.',
    hint: '🍌 Auto-trips anyone who passes you, and anyone you pass!', type: 'passive' },
  { name: 'Bard', file: 'Bard.png', emoji: '🎵', color: '#0891b2',
    ability: 'Whenever another racer uses a special ability, move forward 1 space.',
    hint: '🎶 Every time ANY ability fires, press +1 on Bard.', type: 'passive' },
  { name: 'Centaur', file: 'Centaur.png', emoji: '🐴', color: '#92400e',
    ability: 'Whenever you pass another racer while moving, move that racer backward 1 space.',
    hint: '⚡ Push each racer you pass back 1 space.', type: 'passive' },
  { name: 'Cheerleader', file: 'Cheerleader.png', emoji: '📣', color: '#ec4899',
    ability: 'Before your main move, you may force last-place racer(s) to move 2 spaces forward. If you do, you also move 1 space.',
    hint: '📣 Before rolling, use ability to push last-place +2 (you get +1).', type: 'active' },
  { name: 'Coach', file: 'Coach.png', emoji: '🏋️', color: '#16a34a',
    ability: 'Everyone sharing a space with you gets +1 to their main move (including you).',
    hint: '💪 Add +1 to anyone on your space each move.', type: 'passive' },
  { name: 'Conjurer', file: 'Conjurer.png', emoji: '✨', color: '#7c3aed',
    ability: 'Once during your turn after rolling, you may reroll your die. You must use the new result.',
    hint: '🎲 After rolling, press Reroll once (must keep new result).', type: 'active' },
  { name: 'Copycat', file: 'Copycat.png', emoji: '🪞', color: '#6366f1',
    ability: 'Permanently copies the power of whichever racer is currently in the lead.',
    hint: '🪞 Use the ability of whoever is in 1st place right now!', type: 'passive' },
  { name: 'Cupid', file: 'Cupid.png', emoji: '💘', color: '#f43f5e',
    ability: 'Before the race begins, choose another racer as your Loved racer. Whenever you end your movement on the same space as your Loved racer, move 1 extra space.',
    hint: '💘 Setup: pick a Loved racer. Land on their space = +1 bonus.', type: 'setup' },
  { name: 'Demon', file: 'Demon.png', emoji: '😈', color: '#dc2626',
    ability: 'After rolling your die, you may increase or decrease the result by 1.',
    hint: '😈 After rolling, use +1 or -1 buttons to adjust by 1.', type: 'active' },
  { name: 'Dicemonger', file: 'Dicemonger.png', emoji: '🎲', color: '#d97706',
    ability: 'Anyone may reroll their main move once per turn. Whenever another racer uses this reroll, you move 1 space.',
    hint: '🎲 Others can reroll once/turn. Each time they do, +1 for Dicemonger.', type: 'passive' },
  { name: 'Druid', file: 'Druid.png', emoji: '🌿', color: '#15803d',
    ability: 'If another racer is on the same space as you at the end of your turn, move forward 1 extra space on your next turn.',
    hint: '🌿 Sharing a space at end of turn = +1 bonus next turn.', type: 'passive' },
  { name: 'Duelist', file: 'Duelist.png', emoji: '⚔️', color: '#b45309',
    ability: 'Whenever sharing a space with another racer, you may shout "DUEL!" Both racers roll a die; the highest roll moves 2 spaces. You win all ties.',
    hint: '⚔️ Sharing a space? Press DUEL — winner moves 2!', type: 'active' },
  { name: 'Egg', file: 'Egg.png', emoji: '🥚', color: '#ca8a04',
    ability: "Before the race begins, draw 3 new racers from the deck and pick one. Gain that racer's powers for the race.",
    hint: '🥚 Setup: randomly get 3 character options and pick one.', type: 'setup' },
  { name: 'Flip Flop', file: 'Flip Flop.png', emoji: '🩴', color: '#06b6d4',
    ability: 'You may skip rolling your main move to swap spaces with any other racer instead.',
    hint: '🩴 Instead of rolling, swap positions with any racer.', type: 'active' },
  { name: 'Ghoul', file: 'Ghoul.png', emoji: '👻', color: '#6b7280',
    ability: 'Whenever another racer rolls a 1, you move forward 2 spaces.',
    hint: '👻 Each time ANY player rolls a 1, apply +2 to Ghoul.', type: 'passive' },
  { name: 'Gladiator', file: 'Gladiator.png', emoji: '🛡️', color: '#991b1b',
    ability: 'Whenever another racer ends movement on your space, you may Challenge them. Both racers roll a die; the higher result moves forward 2 spaces.',
    hint: '🛡️ Someone landed on you? Challenge — both roll, winner +2.', type: 'active' },
  { name: 'Gunk', file: 'Gunk.png', emoji: '🦠', color: '#65a30d',
    ability: 'All other racers get -1 to their main move.',
    hint: '🦠 Passive: every other player rolls -1. Apply when moving others.', type: 'passive' },
  { name: 'Hare', file: 'Hare.png', emoji: '🐇', color: '#f97316',
    ability: 'You receive an automatic +2 to your movement roll, but must skip your turn entirely if you are currently in the lead.',
    hint: '🐇 Always +2 to rolls, BUT skip turn if in 1st place!', type: 'passive' },
  { name: 'Heckler', file: 'Heckler.png', emoji: '📢', color: '#7c3aed',
    ability: 'Whenever another racer ends their turn within 1 space of where they started (e.g. due to being tripped), you move 2 spaces.',
    hint: '📢 Did someone barely move this turn (<=1 space)? Press +2 Heckler.', type: 'passive' },
  { name: 'Martial Artist', file: 'Martial Artist.png', emoji: '🥋', color: '#1d4ed8',
    ability: 'You may move through spaces occupied by other racers without stopping.',
    hint: '🥋 Pass through occupied spaces freely.', type: 'passive' },
  { name: 'Medusa', file: 'Medusa.png', emoji: '🐍', color: '#6d28d9',
    ability: 'Whenever another racer ends movement on your space, that racer becomes Petrified. Petrified racers move 2 fewer spaces on their next turn.',
    hint: '🐍 Someone landed on you? Mark them Petrified (-2 next turn).', type: 'passive' },
  { name: 'Merchant', file: 'Merchant.png', emoji: '🛒', color: '#b45309',
    ability: 'Instead of moving during your turn, you may swap spaces with any other racer.',
    hint: '🛒 Instead of rolling, swap spaces with anyone.', type: 'active' },
  { name: 'Mouth', file: 'Mouth.png', emoji: '👄', color: '#dc2626',
    ability: 'If you stop on a space with exactly one other racer, that racer is instantly eliminated from the race entirely.',
    hint: '👄 Landed on a space with exactly 1 other racer? They are eliminated!', type: 'passive' },
  { name: 'Necromancer', file: 'Necromancer.png', emoji: '💀', color: '#312e81',
    ability: 'Whenever another racer is moved backward by an ability, you move forward 1 space.',
    hint: '💀 Every time a racer is pushed BACK by any ability, +1 for Necromancer.', type: 'passive' },
  { name: 'Ninja', file: 'Ninja.png', emoji: '🥷', color: '#1f2937',
    ability: 'At the start of your turn, choose another racer. Instead of rolling, move the same number of spaces that racer moved on their last turn.',
    hint: '🥷 Instead of rolling, copy another racer s last move total.', type: 'active' },
  { name: 'Philosopher', file: 'Philosopher.png', emoji: '🤔', color: '#0e7490',
    ability: 'Once per round, when another racer uses a special ability, you may cancel that ability.',
    hint: '🤔 Once per round: cancel another ability when it fires.', type: 'active' },
  { name: 'Pirate', file: 'Pirate.png', emoji: '🏴', color: '#92400e',
    ability: 'Whenever you end movement on the same space as another racer, you may carry them. While carrying a racer, both move together whenever you move.',
    hint: '🏴 Landed on someone? Carry them — they move with you each turn.', type: 'active' },
  { name: 'Priest', file: 'Priest.png', emoji: '⛪', color: '#475569',
    ability: 'At the end of each round, the racer in last place moves forward 2 spaces.',
    hint: '⛪ At end of each full round: apply +2 to the last-place racer.', type: 'passive' },
  { name: 'Prophet', file: 'Prophet.png', emoji: '🔮', color: '#7c3aed',
    ability: 'Before the race begins, choose a racer you think will win. If that racer wins and you finish outside 1st, you are treated as finishing 2nd instead.',
    hint: '🔮 Setup: name your predicted winner. Correct = treated as 2nd if not 1st.', type: 'setup' },
  { name: 'Ranger', file: 'Ranger.png', emoji: '🏹', color: '#15803d',
    ability: 'After rolling your die, if the result is odd, move forward 1 extra space.',
    hint: '🎯 Auto-applied: odd roll (1,3,5) adds +1 bonus automatically.', type: 'passive' },
  { name: 'Rocket Scientist', file: 'Rocket Scientist.png', emoji: '🚀', color: '#0284c7',
    ability: 'Doubles the number rolled for your main move, but you immediately trip (miss your next turn) after moving.',
    hint: '🚀 Double your dice roll, then get Tripped automatically!', type: 'passive' },
  { name: 'Scoocher', file: 'Scoocher.png', emoji: '🐛', color: '#9333ea',
    ability: "You move 1 space forward automatically whenever another racer's special ability is triggered.",
    hint: '🐛 Every time ANY ability fires, press +1 Scoocher.', type: 'passive' },
  { name: 'Siren', file: 'Siren.png', emoji: '🧜', color: '#06b6d4',
    ability: 'At the start of your turn, choose a racer within 2 spaces of you. Move that racer onto your space.',
    hint: '🧜 Start of turn: pull a nearby racer onto your space.', type: 'active' },
  { name: 'Spy', file: 'Spy.png', emoji: '🕵️', color: '#374151',
    ability: 'After all racers are chosen, you may replace your racer with a random unused racer.',
    hint: '🕵️ Setup: after everyone picks, swap to a random character.', type: 'setup' },
  { name: 'Thief', file: 'Thief.png', emoji: '💰', color: '#92400e',
    ability: 'Whenever you pass another racer while moving, steal 1 Victory Token from that racer.',
    hint: '💰 Passing a racer? Steal 1 Victory Token from them!', type: 'passive' },
  { name: 'Troll', file: 'Troll.png', emoji: '🧌', color: '#4ade80',
    ability: 'Other racers may not end movement on your space. If they would, they stop on the space before you instead.',
    hint: '🧌 If anyone would land on you, they stop 1 space before instead.', type: 'passive' },
  { name: 'Witch', file: 'Witch.png', emoji: '🧙', color: '#7c3aed',
    ability: 'Whenever another racer passes you while moving, that racer becomes Cursed. Cursed racers move 1 fewer space on their next turn.',
    hint: '🧙 Anyone who passes you gets Cursed (-1 next turn).', type: 'passive' },
];

// ─── Constants ─────────────────────────────────────────────────────────────────
const TOTAL_SPACES = 26;
const FINISH_POS   = 25;
const RACE_NAMES   = ['Mild Mile', 'Wild Wilds', 'Mild Mile', 'Wild Wilds'];
const RACE_TYPES   = ['mild', 'wild', 'mild', 'wild'];
const FINISH_PTS   = [5, 3, 2, 1, 0, 0, 0, 0];
const PCOLORS      = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899'];
const PBORDERS     = ['#b91c1c','#1d4ed8','#15803d','#b45309','#7e22ce','#be185d'];

const WILD_TILES = [
  { type: 'star', icon: '⭐', bg: '#78350f', border: '#f59e0b', desc: '+1 Token' },
  { type: 'trip', icon: '🍌', bg: '#7c2d12', border: '#f97316', desc: 'TRIP!' },
  { type: 'fwd2', icon: '⏩', bg: '#14532d', border: '#22c55e', desc: 'Fwd +2' },
  { type: 'fwd3', icon: '🚀', bg: '#052e16', border: '#16a34a', desc: 'Fwd +3' },
  { type: 'bck2', icon: '⏪', bg: '#450a0a', border: '#ef4444', desc: 'Back -2' },
  { type: 'rerl', icon: '🎲', bg: '#2e1065', border: '#a855f7', desc: 'Reroll!' },
];

const STATUS_INFO = {
  tripped:   { icon: '💫', label: 'TRIPPED',   desc: 'Misses next turn',    color: '#f59e0b' },
  cursed:    { icon: '🌑', label: 'CURSED',    desc: '-1 space next turn',  color: '#a855f7' },
  petrified: { icon: '🗿', label: 'PETRIFIED', desc: '-2 spaces next turn', color: '#6b7280' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────────
function genId()       { return Math.random().toString(36).slice(2, 10); }
function genRoomCode() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return [0,1,2,3].map(() => c[Math.floor(Math.random()*c.length)]).join('');
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function buildWildBoard() {
  const spaces = Array.from({ length: TOTAL_SPACES }, (_, i) => ({
    id: i, type: i===0 ? 'start' : i===FINISH_POS ? 'finish' : 'normal'
  }));
  const pool = shuffle(['star','star','star','trip','trip','trip','fwd2','fwd2','fwd3','bck2','bck2','rerl','rerl']);
  let placed = 0;
  for (let i = 2; i < FINISH_POS - 1 && placed < pool.length; i++) {
    if (Math.random() > 0.45) continue;
    const tile = WILD_TILES.find(t => t.type === pool[placed]);
    if (tile) { spaces[i] = { id: i, ...tile }; placed++; i++; }
  }
  return spaces;
}
function buildMildBoard() {
  return Array.from({ length: TOTAL_SPACES }, (_, i) => ({
    id: i, type: i===0 ? 'start' : i===FINISH_POS ? 'finish' : 'normal'
  }));
}

// ─── Dice Face ──────────────────────────────────────────────────────────────────
const DICE_DOTS = {
  1:[[50,50]], 2:[[28,28],[72,72]], 3:[[28,28],[50,50],[72,72]],
  4:[[28,28],[72,28],[28,72],[72,72]], 5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
  6:[[28,28],[72,28],[28,50],[72,50],[28,72],[72,72]],
};
const DiceFace = ({ value, size=72, rolling=false }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"
    style={{ filter: rolling ? 'drop-shadow(0 0 8px #a855f7)' : 'drop-shadow(0 2px 4px rgba(0,0,0,.5))', flexShrink: 0 }}>
    <rect x="4" y="4" width="92" height="92" rx="16"
      fill={rolling ? '#1e1b4b' : 'white'}
      stroke={rolling ? '#a855f7' : '#374151'} strokeWidth="4"/>
    {(DICE_DOTS[value]||[]).map(([cx,cy],i) => (
      <circle key={i} cx={cx} cy={cy} r="8.5" fill={rolling ? '#a855f7' : '#1f2937'}/>
    ))}
  </svg>
);

// ─── Board Track ────────────────────────────────────────────────────────────────
const BoardTrack = ({ spaces, players, myId }) => {
  const playerIds = Object.keys(players || {});
  const byPos = {};
  playerIds.forEach(pid => {
    const p = players[pid];
    if (p && !p.eliminated) {
      const pos = p.position != null ? p.position : 0;
      if (!byPos[pos]) byPos[pos] = [];
      byPos[pos].push({ id: pid, ...p });
    }
  });

  const getSpaceBg     = (sp) => sp.type==='start' ? '#166534' : sp.type==='finish' ? '#92400e' : sp.bg || '#1e293b';
  const getSpaceBorder = (sp) => sp.type==='start' ? '#22c55e' : sp.type==='finish' ? '#fbbf24' : sp.border || '#334155';

  const Space = ({ sp }) => {
    const occ = byPos[sp.id] || [];
    const hasMe = occ.some(p => p.id === myId);
    return (
      <div style={{
        background: getSpaceBg(sp), border: `2px solid ${getSpaceBorder(sp)}`,
        borderRadius: 8, flex: '1 1 0', minWidth: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2px 1px', position: 'relative', minHeight: 42,
        boxShadow: hasMe ? '0 0 0 2px white' : 'none',
      }}>
        <span style={{ fontSize: sp.icon ? 13 : 9, fontWeight: 700, color: 'rgba(255,255,255,.8)', lineHeight: 1 }}>
          {sp.type==='start' ? '🏁' : sp.type==='finish' ? '🏆' : sp.icon || sp.id}
        </span>
        {sp.desc && <span style={{ fontSize: 6, color: 'rgba(255,255,255,.45)', lineHeight: 1 }}>{sp.desc}</span>}
        {occ.length > 0 && (
          <div style={{ position: 'absolute', inset: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
            {occ.map(p => {
              const ci = playerIds.indexOf(p.id) % PCOLORS.length;
              return (
                <div key={p.id} title={`${p.name}`} style={{
                  width: p.id===myId ? 13 : 11, height: p.id===myId ? 13 : 11,
                  borderRadius: '50%', background: PCOLORS[ci], border: `1.5px solid ${PBORDERS[ci]}`,
                  boxShadow: p.id===myId ? '0 0 4px white' : 'none', flexShrink: 0,
                }} />
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const row1 = spaces.slice(0, 13);
  const row2 = spaces.slice(13).reverse();

  return (
    <div style={{ background: 'linear-gradient(135deg,#052e16 0%,#0f172a 100%)', borderRadius: 16, padding: 10, border: '2px solid #166534' }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
        {row1.map(sp => <Space key={sp.id} sp={sp} />)}
        <div style={{ display:'flex', alignItems:'center', color:'rgba(255,255,255,.25)', fontSize: 16, paddingLeft: 2 }}>↓</div>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ display:'flex', alignItems:'center', color:'rgba(255,255,255,.25)', fontSize: 16, paddingRight: 2 }}>↑</div>
        {row2.map(sp => <Space key={sp.id} sp={sp} />)}
      </div>
      {spaces.some(s => s.icon) && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {WILD_TILES.filter(t => spaces.some(s => s.type === t.type)).map(t => (
            <span key={t.type} style={{ fontSize: 10, color: 'rgba(255,255,255,.6)', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 4, padding: '1px 5px' }}>
              {t.icon} {t.desc}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function MagicalAthletesGame({ studentData, showToast }) {
  const [fb,           setFb]          = useState(null);
  const [myId]                         = useState(() => genId());
  const playerName = studentData?.firstName || studentData?.name || 'Player';

  const [screen,       setScreen]      = useState('menu');
  const [joinCode,     setJoinCode]    = useState('');
  const [isHost,       setIsHost]      = useState(false);
  const [roomCode,     setRoomCode]    = useState('');
  const [roomData,     setRoomData]    = useState(null);
  const [charSearch,   setCharSearch]  = useState('');
  const [diceValue,    setDiceValue]   = useState(null);
  const [diceRolling,  setDiceRolling] = useState(false);
  const [showHint,     setShowHint]    = useState(false);
  const [pendingMove,  setPendingMove] = useState(null);
  const [abilityModal, setAbilityModal]= useState(null);
  const [localLog,     setLocalLog]    = useState([]);

  const rollRef = useRef(null);

  // ── Firebase init ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, set, onValue, update, off, get } = await import('firebase/database');
        setFb({ database, ref, set, onValue, update, off, get });
      } catch (e) {
        showToast?.('Could not connect to game server', 'error');
      }
    })();
  }, []);

  // ── Room subscription ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`);
    const unsub = fb.onValue(rRef, snap => {
      if (!snap.exists()) { resetToMenu(); return; }
      setRoomData(snap.val());
    });
    return () => fb.off(rRef, 'value', unsub);
  }, [roomCode, fb]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const players       = roomData?.players || {};
  const playerIds     = useMemo(() =>
    Object.keys(players).sort((a,b) => (players[a]?.joinedAt||0)-(players[b]?.joinedAt||0)),
    [players]);
  const myData        = players[myId];
  const amHost        = roomData?.host === myId;
  const phase         = roomData?.phase || 'lobby';
  const currentRace   = roomData?.currentRace ?? 0;
  const boardSpaces   = useMemo(() =>
    roomData?.boardSpaces ? JSON.parse(roomData.boardSpaces) : buildMildBoard(),
    [roomData?.boardSpaces]);
  const playerOrder   = roomData?.playerOrder || playerIds;
  const currentTurnIdx= roomData?.currentTurnIndex ?? 0;
  const currentTurnId = playerOrder[currentTurnIdx % Math.max(playerOrder.length,1)];
  const isMyTurn      = currentTurnId === myId;
  const finishOrder   = roomData?.finishOrder || [];

  const standings = useMemo(() => [...playerIds].sort((a,b) => {
    const fa=finishOrder.indexOf(a), fb2=finishOrder.indexOf(b);
    if (fa>=0 && fb2>=0) return fa-fb2;
    if (fa>=0) return -1;
    if (fb2>=0) return 1;
    return (players[b]?.position||0)-(players[a]?.position||0);
  }), [playerIds, finishOrder, players]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const resetToMenu = useCallback(() => {
    setScreen('menu'); setRoomCode(''); setRoomData(null); setIsHost(false);
    setDiceValue(null); setDiceRolling(false); setPendingMove(null);
    if (rollRef.current) clearInterval(rollRef.current);
  }, []);

  const addLog = useCallback(async (msg) => {
    const entry = `${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} — ${msg}`;
    setLocalLog(p => [entry,...p.slice(0,29)]);
    if (!fb || !roomCode) return;
    try {
      const logRef = fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/log`);
      const snap = await fb.get(logRef);
      const existing = snap.val() || [];
      await fb.set(logRef, [entry,...existing.slice(0,29)]);
    } catch {}
  }, [fb, roomCode]);

  // ── Create room ────────────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    if (!fb) { showToast?.('Connecting, please wait…', 'error'); return; }
    const code = genRoomCode();
    await fb.set(fb.ref(fb.database, `magicalAthletesRooms/${code}`), {
      host: myId, phase: 'lobby',
      players: { [myId]: { name: playerName, characterName: null, position: 0, victoryTokens: 0,
        totalPoints: 0, status: null, abilityUsed: false, eliminated: false,
        finished: false, lastMoved: 0, racePoints: [], joinedAt: Date.now() } },
      currentRace: 0, playerOrder: [myId], currentTurnIndex: 0,
      boardSpaces: JSON.stringify(buildMildBoard()), finishOrder: [], log: [], createdAt: Date.now(),
    });
    setRoomCode(code); setIsHost(true); setScreen('game');
    showToast?.(`Room created! Code: ${code}`, 'success');
  }, [fb, myId, playerName, showToast]);

  // ── Join room ──────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    if (!fb) { showToast?.('Connecting, please wait…', 'error'); return; }
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 4) { showToast?.('Enter a 4-letter room code.', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `magicalAthletesRooms/${code}`));
    if (!snap.exists()) { showToast?.('Room not found.', 'error'); return; }
    const data = snap.val();
    if (data.phase === 'racing' || data.phase === 'raceEnd' || data.phase === 'gameEnd') {
      showToast?.('Game already in progress.', 'error'); return;
    }
    if (Object.keys(data.players||{}).length >= 6) { showToast?.('Room is full (max 6).', 'error'); return; }
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${code}/players`), {
      [myId]: { name: playerName, characterName: null, position: 0, victoryTokens: 0,
        totalPoints: 0, status: null, abilityUsed: false, eliminated: false,
        finished: false, lastMoved: 0, racePoints: [], joinedAt: Date.now() }
    });
    const newOrder = [...(data.playerOrder||Object.keys(data.players||{})), myId];
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${code}`), { playerOrder: newOrder });
    setRoomCode(code); setIsHost(false); setScreen('game');
    showToast?.(`Joined room ${code}!`, 'success');
  }, [fb, joinCode, myId, playerName, showToast]);

  // ── Start char select ──────────────────────────────────────────────────────
  const startCharSelect = useCallback(async () => {
    if (!fb || !amHost) return;
    if (playerIds.length < 2) { showToast?.('Need at least 2 players.', 'error'); return; }
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), {
      phase: 'charSelect', playerOrder: playerIds
    });
  }, [fb, amHost, playerIds, roomCode, showToast]);

  // ── Select character ───────────────────────────────────────────────────────
  const selectCharacter = useCallback(async (charName) => {
    if (!fb) return;
    const taken = Object.values(players).some(p => p.characterName === charName);
    if (taken) { showToast?.('Already taken!', 'error'); return; }
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${myId}`), { characterName: charName });
    showToast?.(`You chose ${charName}!`, 'success');
  }, [fb, players, roomCode, myId, showToast]);

  // ── Start race ─────────────────────────────────────────────────────────────
  const startRace = useCallback(async () => {
    if (!fb || !amHost) return;
    if (!Object.values(players).every(p => p.characterName)) {
      showToast?.('All players must choose a character first!', 'error'); return;
    }
    const board = RACE_TYPES[currentRace]==='wild' ? buildWildBoard() : buildMildBoard();
    const updates = {};
    Object.keys(players).forEach(pid => {
      updates[`players/${pid}/position`]    = 0;
      updates[`players/${pid}/status`]      = null;
      updates[`players/${pid}/abilityUsed`] = false;
      updates[`players/${pid}/eliminated`]  = false;
      updates[`players/${pid}/finished`]    = false;
      updates[`players/${pid}/lastMoved`]   = 0;
    });
    updates.phase          = 'racing';
    updates.boardSpaces    = JSON.stringify(board);
    updates.currentTurnIndex = 0;
    updates.finishOrder    = [];
    updates.currentDice    = null;
    updates.diceRoller     = null;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), updates);
    await addLog(`🏁 Race ${currentRace+1}: ${RACE_NAMES[currentRace]} started!`);
  }, [fb, amHost, players, roomCode, currentRace, addLog, showToast]);

  // ── Roll dice ──────────────────────────────────────────────────────────────
  const rollDice = useCallback(() => {
    if (diceRolling || !isMyTurn || phase!=='racing') return;
    setDiceRolling(true); setDiceValue(null); setPendingMove(null);
    let count = 0;
    rollRef.current = setInterval(() => {
      setDiceValue(Math.ceil(Math.random()*6));
      if (++count >= 12) {
        clearInterval(rollRef.current);
        const final = Math.ceil(Math.random()*6);
        setDiceValue(final);
        setDiceRolling(false);
        const me = players[myId];
        const myChar = me?.characterName;
        let move = final;
        if (me?.status==='cursed')    move = Math.max(0, move-1);
        if (me?.status==='petrified') move = Math.max(0, move-2);
        if (myChar==='Ranger' && final%2!==0) move += 1;
        if (myChar==='Hare')  move += 2;
        if (myChar==='Rocket Scientist') move = move*2;
        if (myChar==='Amazon') move = 5;
        const hasGunk = Object.values(players).some(p => p.characterName==='Gunk' && !p.eliminated && p!==me);
        if (hasGunk && myChar!=='Gunk') move = Math.max(0, move-1);
        setPendingMove(move);
        fb?.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), {
          currentDice: final, diceRoller: myId
        });
      }
    }, 80);
  }, [diceRolling, isMyTurn, phase, players, myId, fb, roomCode]);

  // ── Confirm move ───────────────────────────────────────────────────────────
  const confirmMove = useCallback(async (overrideSpaces) => {
    if (!fb) return;
    const spaces = overrideSpaces != null ? overrideSpaces : pendingMove;
    if (spaces == null) return;
    const me = players[myId]; if (!me) return;
    const oldPos = me.position || 0;
    const newPos = Math.min(oldPos + spaces, FINISH_POS);
    const landed = boardSpaces[newPos];
    const updates = {};
    updates[`players/${myId}/position`]  = newPos;
    updates[`players/${myId}/lastMoved`] = spaces;
    if (me.status) updates[`players/${myId}/status`] = null;
    if (me.characterName==='Rocket Scientist') updates[`players/${myId}/status`] = 'tripped';
    if (landed?.type==='star')  updates[`players/${myId}/victoryTokens`] = (me.victoryTokens||0)+1;
    if (landed?.type==='trip')  updates[`players/${myId}/status`] = 'tripped';
    if (landed?.type==='fwd2') {
      const fp = Math.min(newPos+2,FINISH_POS);
      updates[`players/${myId}/position`] = fp;
      if (fp>=FINISH_POS) { updates[`players/${myId}/finished`]=true; const fo=[...(roomData?.finishOrder||[])]; if(!fo.includes(myId)) fo.push(myId); updates.finishOrder=fo; }
    } else if (landed?.type==='fwd3') {
      const fp = Math.min(newPos+3,FINISH_POS);
      updates[`players/${myId}/position`] = fp;
      if (fp>=FINISH_POS) { updates[`players/${myId}/finished`]=true; const fo=[...(roomData?.finishOrder||[])]; if(!fo.includes(myId)) fo.push(myId); updates.finishOrder=fo; }
    } else if (landed?.type==='bck2') {
      updates[`players/${myId}/position`] = Math.max(newPos-2,0);
    } else if (newPos>=FINISH_POS) {
      updates[`players/${myId}/finished`]=true;
      const fo=[...(roomData?.finishOrder||[])]; if(!fo.includes(myId)) fo.push(myId); updates.finishOrder=fo;
    }
    updates.currentDice=null; updates.diceRoller=null;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), updates);
    const ch = CHARACTERS.find(c=>c.name===me.characterName);
    await addLog(`${ch?.emoji||'🏃'} ${me.name} moved ${spaces} → space ${updates[`players/${myId}/position`]||newPos}${landed?.desc?' ('+landed.desc+')':''}`);
    setPendingMove(null); setDiceValue(null);
  }, [fb, pendingMove, players, myId, boardSpaces, roomCode, roomData, addLog]);

  // ── End turn ───────────────────────────────────────────────────────────────
  const endTurn = useCallback(async () => {
    if (!fb || (!isMyTurn && !amHost)) return;
    let idx = (currentTurnIdx+1) % Math.max(playerOrder.length,1);
    let tries = 0;
    while (tries < playerOrder.length) {
      const pid = playerOrder[idx % playerOrder.length];
      if (players[pid] && !players[pid].finished && !players[pid].eliminated) break;
      idx++; tries++;
    }
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), {
      currentTurnIndex: idx % Math.max(playerOrder.length,1), currentDice: null, diceRoller: null,
    });
    setPendingMove(null); setDiceValue(null); setShowHint(false);
  }, [fb, isMyTurn, amHost, currentTurnIdx, playerOrder, players, roomCode]);

  // ── Skip turn (tripped) ────────────────────────────────────────────────────
  const skipTurn = useCallback(async () => {
    if (!fb || !isMyTurn) return;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${myId}`), { status: null });
    await addLog(`💫 ${myData?.name} skipped — Tripped!`);
    endTurn();
  }, [fb, isMyTurn, myId, myData, roomCode, addLog, endTurn]);

  // ── End race ───────────────────────────────────────────────────────────────
  const endRace = useCallback(async () => {
    if (!fb) return;
    const fo = roomData?.finishOrder || [];
    const updates = {};
    Object.keys(players).forEach(pid => {
      const finPos = fo.indexOf(pid);
      const pts = finPos>=0 ? (FINISH_PTS[finPos]||0) : 0;
      updates[`players/${pid}/racePoints`]  = [...(players[pid]?.racePoints||[]), pts];
      updates[`players/${pid}/totalPoints`] = (players[pid]?.totalPoints||0) + pts + (players[pid]?.victoryTokens||0);
    });
    const nextRace = currentRace+1;
    updates.phase = nextRace>=4 ? 'gameEnd' : 'raceEnd';
    if (nextRace<4) updates.currentRace = nextRace;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), updates);
    await addLog(`🏁 Race ${currentRace+1} ended! Scores updated.`);
  }, [fb, roomData, players, currentRace, roomCode, addLog]);

  // ── Next race ──────────────────────────────────────────────────────────────
  const nextRace = useCallback(async () => {
    if (!fb || !amHost) return;
    const updates = {};
    Object.keys(players).forEach(pid => {
      updates[`players/${pid}/position`]    = 0;
      updates[`players/${pid}/status`]      = null;
      updates[`players/${pid}/abilityUsed`] = false;
      updates[`players/${pid}/eliminated`]  = false;
      updates[`players/${pid}/finished`]    = false;
      updates[`players/${pid}/lastMoved`]   = 0;
      updates[`players/${pid}/characterName`] = null;
    });
    updates.phase          = 'charSelect';
    updates.currentTurnIndex = 0;
    updates.finishOrder    = [];
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}`), updates);
  }, [fb, amHost, players, roomCode]);

  // ── Quick controls ─────────────────────────────────────────────────────────
  const quickMove = useCallback(async (pid, delta) => {
    if (!fb || (!amHost && pid!==myId)) return;
    const p = players[pid]; if (!p) return;
    const newPos = Math.max(0, Math.min((p.position||0)+delta, FINISH_POS));
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${pid}`), { position: newPos });
  }, [fb, amHost, myId, players, roomCode]);

  const quickStatus = useCallback(async (pid, status) => {
    if (!fb || (!amHost && pid!==myId)) return;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${pid}`), { status: status||null });
  }, [fb, amHost, myId, roomCode]);

  const quickToken = useCallback(async (pid, delta) => {
    if (!fb || (!amHost && pid!==myId)) return;
    const p = players[pid]; if (!p) return;
    await fb.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${pid}`), {
      victoryTokens: Math.max(0,(p.victoryTokens||0)+delta)
    });
  }, [fb, amHost, myId, players, roomCode]);

  // ── Char filter ────────────────────────────────────────────────────────────
  const takenChars   = Object.values(players).map(p=>p.characterName).filter(Boolean);
  const filteredChars = CHARACTERS.filter(c =>
    !takenChars.includes(c.name) &&
    (charSearch==='' || c.name.toLowerCase().includes(charSearch.toLowerCase()) || c.ability.toLowerCase().includes(charSearch.toLowerCase()))
  );
  const log = roomData?.log?.length ? roomData.log : localLog;

  // ─────────────────────────────────────────────────────────────────────────
  // ── RENDER ────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  const bg = { minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)', padding: 16 };

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (screen==='menu') return (
    <div style={{ ...bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>⚡</div>
        <h1 style={{ fontSize: 34, fontWeight: 900, color:'white', margin:0, letterSpacing:'-0.5px' }}>Magical Athletes</h1>
        <p style={{ color:'#a5b4fc', margin:'6px 0 0', fontSize: 15 }}>Fantasy Racing — Multiplayer</p>
      </div>
      <div style={{ width:'100%', maxWidth: 380, display:'flex', flexDirection:'column', gap: 12 }}>
        <button onClick={createRoom} style={{
          width:'100%', padding:'16px 24px', borderRadius:16, border:'none', cursor:'pointer',
          background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white',
          fontSize:18, fontWeight:800, boxShadow:'0 4px 24px rgba(124,58,237,.4)',
        }}>🎯 Host a Game</button>

        <div style={{ background:'rgba(255,255,255,.08)', borderRadius:16, padding:16, border:'1.5px solid rgba(255,255,255,.15)' }}>
          <p style={{ color:'rgba(255,255,255,.7)', fontSize:14, margin:'0 0 10px', fontWeight:600 }}>Join a room</p>
          <div style={{ display:'flex', gap:8 }}>
            <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase().slice(0,4))}
              onKeyDown={e=>e.key==='Enter'&&joinRoom()} placeholder="CODE" maxLength={4}
              style={{ flex:1, padding:'12px 14px', borderRadius:10, border:'1.5px solid rgba(255,255,255,.2)',
                background:'rgba(0,0,0,.3)', color:'white', fontSize:22, fontWeight:900,
                textAlign:'center', letterSpacing:6, outline:'none' }} />
            <button onClick={joinRoom} style={{ padding:'12px 20px', borderRadius:10, border:'none',
              cursor:'pointer', background:'#0891b2', color:'white', fontSize:14, fontWeight:800 }}>Join →</button>
          </div>
        </div>

        <button onClick={()=>setScreen('reference')} style={{
          width:'100%', padding:12, borderRadius:12, border:'1.5px solid rgba(255,255,255,.15)',
          background:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.7)', fontSize:14, fontWeight:600, cursor:'pointer',
        }}>📖 Character Reference</button>
      </div>
    </div>
  );

  // ── REFERENCE ─────────────────────────────────────────────────────────────
  if (screen==='reference') {
    const rfilt = CHARACTERS.filter(c =>
      charSearch==='' || c.name.toLowerCase().includes(charSearch.toLowerCase()) || c.ability.toLowerCase().includes(charSearch.toLowerCase()));
    return (
      <div style={bg}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <button onClick={()=>{setScreen('menu');setCharSearch('');}} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'white', padding:'8px 16px', borderRadius:10, cursor:'pointer', fontWeight:600 }}>← Back</button>
            <h1 style={{ color:'white', fontSize:20, fontWeight:800, margin:0 }}>📖 Character Reference</h1>
          </div>
          <input value={charSearch} onChange={e=>setCharSearch(e.target.value)} placeholder="Search characters or abilities…"
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(255,255,255,.15)',
              background:'rgba(0,0,0,.3)', color:'white', fontSize:14, outline:'none', marginBottom:12, boxSizing:'border-box' }} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
            {rfilt.map(char => (
              <div key={char.name} style={{ background:'rgba(255,255,255,.07)', borderRadius:14, padding:14, border:'1.5px solid rgba(255,255,255,.12)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <img src={`/games/magical-athletes/${char.file}`} alt={char.name}
                    onError={e=>e.target.style.display='none'}
                    style={{ width:52, height:52, objectFit:'contain', borderRadius:8, background:'rgba(0,0,0,.3)' }} />
                  <div>
                    <div style={{ color:'white', fontWeight:800, fontSize:15 }}>{char.emoji} {char.name}</div>
                    <div style={{ fontSize:10, padding:'2px 6px', borderRadius:4, display:'inline-block', marginTop:2,
                      background: char.type==='passive'?'#065f46':char.type==='setup'?'#1e3a5f':'#4c1d95',
                      color:'rgba(255,255,255,.8)' }}>{char.type}</div>
                  </div>
                </div>
                <p style={{ color:'rgba(255,255,255,.8)', fontSize:12, margin:0, lineHeight:1.5 }}>{char.ability}</p>
                <p style={{ color:'#a5b4fc', fontSize:11, margin:'6px 0 0', lineHeight:1.4 }}>{char.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME SCREEN ──────────────────────────────────────────────────────────
  const myChar    = CHARACTERS.find(c=>c.name===myData?.characterName);
  const curPlayer = players[currentTurnId];
  const curChar   = CHARACTERS.find(c=>c.name===curPlayer?.characterName);

  // ─── LOBBY ────────────────────────────────────────────────────────────────
  if (phase==='lobby') return (
    <div style={bg}>
      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <button onClick={resetToMenu} style={{ background:'rgba(255,255,255,.1)', border:'none', color:'white', padding:'8px 14px', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:16 }}>← Leave</button>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h2 style={{ color:'white', fontSize:22, fontWeight:900, margin:0 }}>⚡ Magical Athletes</h2>
          <p style={{ color:'#a5b4fc', fontSize:14, margin:'4px 0 0' }}>Waiting Room</p>
        </div>
        <div style={{ background:'rgba(0,0,0,.4)', borderRadius:16, padding:20, textAlign:'center', marginBottom:16, border:'2px dashed rgba(165,180,252,.4)' }}>
          <p style={{ color:'rgba(255,255,255,.5)', fontSize:13, margin:'0 0 6px' }}>Room Code — Share with players</p>
          <div style={{ fontSize:48, fontWeight:900, letterSpacing:8, color:'#a5b4fc' }}>{roomCode}</div>
        </div>
        <div style={{ background:'rgba(255,255,255,.07)', borderRadius:16, padding:16, marginBottom:16, border:'1.5px solid rgba(255,255,255,.1)' }}>
          <h3 style={{ color:'white', fontSize:16, fontWeight:700, margin:'0 0 12px' }}>👥 Players ({playerIds.length}/6)</h3>
          {playerIds.map((pid,i) => (
            <div key={pid} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<playerIds.length-1 ? '1px solid rgba(255,255,255,.07)' : 'none' }}>
              <div style={{ width:12, height:12, borderRadius:'50%', background:PCOLORS[i%PCOLORS.length], border:`2px solid ${PBORDERS[i%PBORDERS.length]}` }} />
              <span style={{ color:'white', fontWeight:600, fontSize:15, flex:1 }}>{players[pid]?.name}{pid===myId?' (you)':''}</span>
              {pid===roomData?.host && <span style={{ fontSize:11, background:'#7c3aed', color:'white', padding:'2px 8px', borderRadius:6 }}>Host</span>}
            </div>
          ))}
          {playerIds.length<2 && <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, margin:'8px 0 0', textAlign:'center' }}>Waiting for more players…</p>}
        </div>
        {amHost ? (
          <button onClick={startCharSelect} disabled={playerIds.length<2} style={{
            width:'100%', padding:14, borderRadius:14, border:'none',
            cursor: playerIds.length<2 ? 'not-allowed' : 'pointer',
            background: playerIds.length<2 ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
            color: playerIds.length<2 ? 'rgba(255,255,255,.3)' : 'white',
            fontSize:16, fontWeight:800,
            boxShadow: playerIds.length>=2 ? '0 4px 20px rgba(124,58,237,.4)' : 'none',
          }}>🎭 Start Character Selection</button>
        ) : (
          <p style={{ color:'rgba(255,255,255,.5)', textAlign:'center', fontSize:14 }}>Waiting for host to start…</p>
        )}
      </div>
    </div>
  );

  // ─── CHARACTER SELECTION ──────────────────────────────────────────────────
  if (phase==='charSelect') {
    const myCharName = myData?.characterName;
    const allPicked  = playerIds.every(pid=>players[pid]?.characterName);
    return (
      <div style={bg}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1 }}>
              <h2 style={{ color:'white', fontSize:20, fontWeight:900, margin:0 }}>🎭 Choose Your Character</h2>
              <p style={{ color:'#a5b4fc', fontSize:13, margin:'2px 0 0' }}>Race {currentRace+1}: {RACE_NAMES[currentRace]}</p>
            </div>
            <div style={{ background:'rgba(0,0,0,.4)', borderRadius:8, padding:'4px 10px', fontSize:12, color:'rgba(255,255,255,.6)' }}>
              {playerIds.filter(pid=>players[pid]?.characterName).length}/{playerIds.length} picked
            </div>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
            {playerIds.map((pid,i) => {
              const p = players[pid];
              const ch = CHARACTERS.find(c=>c.name===p?.characterName);
              return (
                <div key={pid} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.07)', borderRadius:10, padding:'6px 10px', border:`1.5px solid ${PCOLORS[i%PCOLORS.length]}40` }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:PCOLORS[i%PCOLORS.length] }} />
                  <span style={{ color:'white', fontSize:12, fontWeight:600 }}>{p?.name}</span>
                  {ch ? <span style={{ color:'#a5b4fc', fontSize:11 }}>{ch.emoji} {ch.name}</span>
                      : <span style={{ color:'rgba(255,255,255,.3)', fontSize:11 }}>choosing…</span>}
                </div>
              );
            })}
          </div>
          {!myCharName ? (
            <>
              <input value={charSearch} onChange={e=>setCharSearch(e.target.value)} placeholder="Search characters…"
                style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid rgba(255,255,255,.15)',
                  background:'rgba(0,0,0,.3)', color:'white', fontSize:14, outline:'none', marginBottom:12, boxSizing:'border-box' }} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, maxHeight:'50vh', overflowY:'auto' }}>
                {filteredChars.map(char => (
                  <button key={char.name} onClick={()=>selectCharacter(char.name)} style={{
                    background:'rgba(255,255,255,.05)', border:'1.5px solid rgba(255,255,255,.1)',
                    borderRadius:12, padding:12, cursor:'pointer', textAlign:'center',
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                    transition:'all .15s',
                  }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,.25)'; e.currentTarget.style.borderColor='#7c3aed';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.borderColor='rgba(255,255,255,.1)';}}
                  >
                    <img src={`/games/magical-athletes/${char.file}`} alt={char.name}
                      onError={e=>e.target.style.display='none'}
                      style={{ width:60, height:60, objectFit:'contain', borderRadius:8, background:'rgba(0,0,0,.2)' }} />
                    <div style={{ color:'white', fontSize:12, fontWeight:700 }}>{char.emoji} {char.name}</div>
                    <div style={{ color:'rgba(255,255,255,.5)', fontSize:10, lineHeight:1.3 }}>{char.ability.slice(0,55)}…</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background:'rgba(255,255,255,.08)', borderRadius:16, padding:20, textAlign:'center', border:'2px solid rgba(34,197,94,.4)' }}>
              <div style={{ fontSize:24, marginBottom:8 }}>✅</div>
              <div style={{ color:'#22c55e', fontWeight:800, fontSize:18, marginBottom:4 }}>You chose: {myChar?.emoji} {myCharName}</div>
              <div style={{ color:'rgba(255,255,255,.6)', fontSize:13 }}>{myChar?.ability}</div>
              {!allPicked && <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, margin:'12px 0 0' }}>Waiting for others to pick…</p>}
            </div>
          )}
          {amHost && allPicked && (
            <button onClick={startRace} style={{
              width:'100%', marginTop:16, padding:14, borderRadius:14, border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#059669,#0891b2)', color:'white', fontSize:16, fontWeight:800,
              boxShadow:'0 4px 20px rgba(5,150,105,.4)',
            }}>🏁 Start Race {currentRace+1}!</button>
          )}
        </div>
      </div>
    );
  }

  // ─── RACE END / GAME END ──────────────────────────────────────────────────
  if (phase==='raceEnd' || phase==='gameEnd') {
    const sortedByPts = [...playerIds].sort((a,b)=>(players[b]?.totalPoints||0)-(players[a]?.totalPoints||0));
    return (
      <div style={bg}>
        <div style={{ maxWidth:480, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ fontSize:40, marginBottom:8 }}>{phase==='gameEnd'?'🏆':'🏁'}</div>
            <h2 style={{ color:'white', fontSize:24, fontWeight:900, margin:0 }}>
              {phase==='gameEnd' ? 'Final Results!' : `Race ${currentRace} Complete!`}
            </h2>
            {phase==='raceEnd' && <p style={{ color:'#a5b4fc', margin:'4px 0 0', fontSize:14 }}>Next up: Race {currentRace+1} — {RACE_NAMES[currentRace]}</p>}
          </div>
          {finishOrder.length>0 && (
            <div style={{ background:'rgba(255,255,255,.07)', borderRadius:16, padding:16, marginBottom:16 }}>
              <h3 style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 12px' }}>Race Finish Order</h3>
              {finishOrder.map((pid,i) => {
                const p=players[pid]; const ch=CHARACTERS.find(c=>c.name===p?.characterName);
                const medals=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'];
                return (
                  <div key={pid} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<finishOrder.length-1?'1px solid rgba(255,255,255,.07)':'none' }}>
                    <span style={{ fontSize:20 }}>{medals[i]||`${i+1}.`}</span>
                    {ch && <img src={`/games/magical-athletes/${ch.file}`} alt={ch.name} onError={e=>e.target.style.display='none'} style={{ width:32, height:32, objectFit:'contain', borderRadius:6, background:'rgba(0,0,0,.2)' }} />}
                    <div style={{ flex:1 }}>
                      <div style={{ color:'white', fontWeight:700, fontSize:14 }}>{p?.name}</div>
                      <div style={{ color:'rgba(255,255,255,.5)', fontSize:11 }}>{ch?.emoji} {ch?.name}</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ color:'#fbbf24', fontWeight:800, fontSize:16 }}>+{FINISH_PTS[i]||0}pts</div>
                      {(p?.victoryTokens||0)>0 && <div style={{ color:'#f59e0b', fontSize:11 }}>+{p.victoryTokens} tokens</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ background:'rgba(255,255,255,.07)', borderRadius:16, padding:16, marginBottom:16 }}>
            <h3 style={{ color:'white', fontWeight:700, fontSize:15, margin:'0 0 12px' }}>
              {phase==='gameEnd' ? '🏆 Final Standings' : '📊 Overall Standings'}
            </h3>
            {sortedByPts.map((pid,i) => {
              const p=players[pid]; const ch=CHARACTERS.find(c=>c.name===p?.characterName);
              return (
                <div key={pid} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i<sortedByPts.length-1?'1px solid rgba(255,255,255,.07)':'none' }}>
                  <span style={{ fontSize:18, width:24 }}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:PCOLORS[playerIds.indexOf(pid)%PCOLORS.length] }} />
                  <div style={{ flex:1 }}>
                    <div style={{ color:pid===myId?'#a5b4fc':'white', fontWeight:700, fontSize:14 }}>{p?.name}{pid===myId?' (you)':''}</div>
                    {ch && <div style={{ color:'rgba(255,255,255,.4)', fontSize:11 }}>{ch.emoji} {ch.name}</div>}
                  </div>
                  <div style={{ color:'#fbbf24', fontWeight:900, fontSize:18 }}>{p?.totalPoints||0}<span style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>pts</span></div>
                </div>
              );
            })}
          </div>
          {amHost && phase==='raceEnd' && (
            <button onClick={nextRace} style={{ width:'100%', padding:14, borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#7c3aed,#4f46e5)', color:'white', fontSize:16, fontWeight:800, boxShadow:'0 4px 20px rgba(124,58,237,.4)' }}>
              🎭 Pick Characters for Race {currentRace+1}
            </button>
          )}
          {amHost && phase==='gameEnd' && (
            <button onClick={resetToMenu} style={{ width:'100%', padding:14, borderRadius:14, border:'none', cursor:'pointer', background:'rgba(255,255,255,.1)', color:'white', fontSize:16, fontWeight:700, marginTop:8 }}>
              ← Main Menu
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── RACING ───────────────────────────────────────────────────────────────
  const isTripped = myData?.status==='tripped';

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#1e1b4b 0%,#0f172a 100%)', padding:12, paddingBottom:72 }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
          <h1 style={{ color:'white', fontSize:16, fontWeight:900, margin:0, flex:1 }}>
            ⚡ Race {currentRace+1}/4: <span style={{ color:RACE_TYPES[currentRace]==='wild'?'#fbbf24':'#86efac' }}>{RACE_NAMES[currentRace]}</span>
          </h1>
          <span style={{ color:'rgba(255,255,255,.4)', fontSize:12 }}>Room: <span style={{ color:'#a5b4fc', fontWeight:800, letterSpacing:2 }}>{roomCode}</span></span>
          {amHost && <span style={{ color:'#fbbf24', fontSize:11, fontWeight:700 }}>👑</span>}
          <button onClick={()=>setScreen('reference')} style={{ padding:'5px 10px', borderRadius:7, border:'none', cursor:'pointer', background:'rgba(255,255,255,.1)', color:'white', fontSize:12, fontWeight:700 }}>📖</button>
        </div>

        {/* Current turn banner */}
        <div style={{
          background: isMyTurn ? 'linear-gradient(135deg,rgba(124,58,237,.4),rgba(79,70,229,.4))' : 'rgba(255,255,255,.05)',
          borderRadius:14, padding:'11px 14px', marginBottom:12,
          border: isMyTurn ? '2px solid rgba(165,180,252,.5)' : '1.5px solid rgba(255,255,255,.08)',
          boxShadow: isMyTurn ? '0 0 20px rgba(124,58,237,.25)' : 'none',
        }}>
          {isMyTurn ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:22 }}>🎯</span>
              <div>
                <div style={{ color:'#a5b4fc', fontSize:11, fontWeight:700, letterSpacing:1 }}>YOUR TURN</div>
                <div style={{ color:'white', fontSize:15, fontWeight:800 }}>{myData?.name} — {myChar?.emoji} {myData?.characterName}</div>
              </div>
              {myData?.status && (
                <div style={{ marginLeft:'auto', background:'rgba(0,0,0,.3)', borderRadius:8, padding:'3px 8px', fontSize:12, color:STATUS_INFO[myData.status]?.color }}>
                  {STATUS_INFO[myData.status]?.icon} {STATUS_INFO[myData.status]?.label}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24' }} />
              <span style={{ color:'rgba(255,255,255,.6)', fontSize:13 }}>
                <span style={{ color:'white', fontWeight:700 }}>{curPlayer?.name}</span> is taking their turn
                {curChar && <span style={{ color:'#a5b4fc' }}> — {curChar.emoji} {curChar.name}</span>}
              </span>
              {roomData?.currentDice && roomData?.diceRoller!==myId && (
                <div style={{ marginLeft:'auto' }}>
                  <DiceFace value={roomData.currentDice} size={34} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* My character panel */}
        {myChar && (
          <div style={{ background:'rgba(255,255,255,.07)', borderRadius:14, padding:12, marginBottom:12, border:'1.5px solid rgba(255,255,255,.1)' }}>
            <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <img src={`/games/magical-athletes/${myChar.file}`} alt={myChar.name}
                onError={e=>e.target.style.display='none'}
                style={{ width:60, height:60, objectFit:'contain', borderRadius:10, background:'rgba(0,0,0,.3)', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ color:'white', fontWeight:800, fontSize:15 }}>{myChar.emoji} {myChar.name}</div>
                <div style={{ color:'rgba(255,255,255,.5)', fontSize:12, marginTop:2 }}>
                  Space <span style={{ color:'#a5b4fc', fontWeight:700 }}>{myData?.position??0}</span>/{FINISH_POS}
                  {(myData?.victoryTokens||0)>0 && <span style={{ color:'#f59e0b', marginLeft:8 }}>⭐{myData.victoryTokens}</span>}
                  {(myData?.totalPoints||0)>0 && <span style={{ color:'#6ee7b7', marginLeft:8 }}>🏆{myData.totalPoints}pts</span>}
                </div>
                <button onClick={()=>setShowHint(v=>!v)} style={{ marginTop:5, background:'none', border:'none', color:'#a5b4fc', cursor:'pointer', fontSize:12, padding:0, fontWeight:600 }}>
                  {showHint?'▲ Hide':'▼ Show ability'}
                </button>
                {showHint && <p style={{ color:'rgba(255,255,255,.75)', fontSize:12, margin:'5px 0 0', background:'rgba(0,0,0,.2)', borderRadius:7, padding:'7px 9px', lineHeight:1.5 }}>{myChar.hint}</p>}
              </div>
            </div>
          </div>
        )}

        {/* DICE + ACTIONS — current player's turn */}
        {isMyTurn && !myData?.finished && (
          <div style={{ background:'rgba(255,255,255,.07)', borderRadius:14, padding:14, marginBottom:12, border:'1.5px solid rgba(165,180,252,.2)' }}>
            {isTripped ? (
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>💫</div>
                <p style={{ color:'#fbbf24', fontWeight:700, fontSize:16, margin:'0 0 12px' }}>You are TRIPPED — Skip this turn!</p>
                <button onClick={skipTurn} style={{ background:'#d97706', border:'none', color:'white', padding:'12px 28px', borderRadius:12, fontWeight:800, fontSize:15, cursor:'pointer' }}>
                  💫 Skip Turn
                </button>
              </div>
            ) : myChar?.name==='Amazon' ? (
              <div style={{ textAlign:'center' }}>
                <p style={{ color:'#a5b4fc', fontSize:14, margin:'0 0 12px' }}>🏹 Amazon — You always move exactly 5 spaces (no dice roll)</p>
                <button onClick={()=>confirmMove(5)} style={{ background:'linear-gradient(135deg,#b45309,#92400e)', border:'none', color:'white', padding:'14px 28px', borderRadius:12, fontWeight:800, fontSize:16, cursor:'pointer' }}>
                  🏹 Move 5 Spaces
                </button>
              </div>
            ) : (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <button onClick={rollDice} disabled={diceRolling||!!diceValue} style={{
                    padding:'13px 24px', borderRadius:12, border:'none',
                    cursor: (diceRolling||!!diceValue) ? 'not-allowed' : 'pointer',
                    background: (diceRolling||!!diceValue) ? 'rgba(255,255,255,.1)' : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                    color:'white', fontSize:17, fontWeight:800,
                    boxShadow: !(diceRolling||!!diceValue) ? '0 4px 16px rgba(124,58,237,.5)' : 'none',
                  }}>
                    🎲 {diceRolling ? 'Rolling…' : diceValue ? `Rolled ${diceValue}!` : 'Roll Dice'}
                  </button>
                  {diceValue && <DiceFace value={diceValue} size={60} rolling={diceRolling} />}
                </div>
                {diceValue && !diceRolling && (
                  <div style={{ marginTop:12 }}>
                    <div style={{ background:'rgba(0,0,0,.3)', borderRadius:9, padding:'8px 12px', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ color:'rgba(255,255,255,.55)', fontSize:13 }}>Suggested move:</span>
                      <span style={{ color:'#a5b4fc', fontWeight:800, fontSize:20 }}>{pendingMove} spaces</span>
                      {pendingMove!==diceValue && <span style={{ color:'rgba(255,255,255,.35)', fontSize:11 }}>(modified by ability)</span>}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      <button onClick={()=>confirmMove()} style={{ flex:1, minWidth:140, padding:'12px', borderRadius:12, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#059669,#0891b2)', color:'white', fontSize:15, fontWeight:800 }}>
                        ✅ Move {pendingMove} Spaces
                      </button>
                      {myChar?.name==='Demon' && (
                        <>
                          <button onClick={()=>setPendingMove(p=>Math.min((p||0)+1,12))} style={{ padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', background:'#dc2626', color:'white', fontSize:14, fontWeight:700 }}>😈 +1</button>
                          <button onClick={()=>setPendingMove(p=>Math.max((p||0)-1,0))} style={{ padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', background:'#dc2626', color:'white', fontSize:14, fontWeight:700 }}>😈 −1</button>
                        </>
                      )}
                      {myChar?.name==='Conjurer' && !myData?.abilityUsed && (
                        <button onClick={async ()=>{
                          await fb?.update(fb.ref(fb.database, `magicalAthletesRooms/${roomCode}/players/${myId}`),{abilityUsed:true});
                          setDiceValue(null); setPendingMove(null);
                        }} style={{ padding:'10px 14px', borderRadius:10, border:'none', cursor:'pointer', background:'#7c3aed', color:'white', fontSize:13, fontWeight:700 }}>✨ Reroll</button>
                      )}
                    </div>
                  </div>
                )}
                {myChar && ['Cheerleader','Flip Flop','Merchant','Ninja','Siren'].includes(myChar.name) && (
                  <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,.08)' }}>
                    <button onClick={()=>setAbilityModal(myChar.name)} style={{ padding:'8px 14px', borderRadius:9, border:'1.5px solid rgba(165,180,252,.3)', background:'rgba(124,58,237,.2)', color:'#a5b4fc', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      ✨ Use {myChar.name} Ability
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Board */}
        <div style={{ marginBottom:12 }}>
          <div style={{ color:'rgba(255,255,255,.5)', fontSize:12, fontWeight:600, marginBottom:6 }}>🗺️ Race Track</div>
          <BoardTrack spaces={boardSpaces} players={players} myId={myId} />
        </div>

        {/* Player controls */}
        <div style={{ background:'rgba(255,255,255,.05)', borderRadius:14, padding:12, marginBottom:12, border:'1.5px solid rgba(255,255,255,.07)' }}>
          <h3 style={{ color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:700, margin:'0 0 10px' }}>🎮 Player Controls</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {playerIds.map((pid,i) => {
              const p=players[pid]; if(!p) return null;
              const ch=CHARACTERS.find(c=>c.name===p.characterName);
              const canCtrl=amHost||pid===myId;
              const isActive=pid===currentTurnId;
              return (
                <div key={pid} style={{ display:'flex', alignItems:'center', gap:7, background:isActive?'rgba(124,58,237,.15)':'rgba(0,0,0,.2)', borderRadius:9, padding:'7px 9px', border:isActive?'1px solid rgba(124,58,237,.3)':'none' }}>
                  <div style={{ width:9, height:9, borderRadius:'50%', background:PCOLORS[i%PCOLORS.length], flexShrink:0 }} />
                  {ch && <img src={`/games/magical-athletes/${ch.file}`} alt={ch.name} onError={e=>e.target.style.display='none'} style={{ width:26, height:26, objectFit:'contain', borderRadius:5, background:'rgba(0,0,0,.2)', flexShrink:0 }} />}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ color:pid===myId?'#a5b4fc':'white', fontSize:12, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {p.name} {ch?ch.emoji:''}
                    </div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                      <span style={{ color:'rgba(255,255,255,.45)', fontSize:10 }}>📍{p.position??0}</span>
                      {(p.victoryTokens||0)>0 && <span style={{ color:'#f59e0b', fontSize:10 }}>⭐{p.victoryTokens}</span>}
                      {(p.totalPoints||0)>0 && <span style={{ color:'#6ee7b7', fontSize:10 }}>🏆{p.totalPoints}</span>}
                      {p.status && <span style={{ fontSize:10 }}>{STATUS_INFO[p.status]?.icon} {STATUS_INFO[p.status]?.label}</span>}
                      {p.finished && <span style={{ color:'#22c55e', fontSize:10 }}>✅ Done</span>}
                      {p.eliminated && <span style={{ color:'#ef4444', fontSize:10 }}>💥 Out</span>}
                    </div>
                  </div>
                  {canCtrl && (
                    <div style={{ display:'flex', gap:3, flexShrink:0, flexWrap:'wrap' }}>
                      {[-1,1,2,3].map(d => (
                        <button key={d} onClick={()=>quickMove(pid,d)} style={{ width:26, height:26, borderRadius:5, border:'none', cursor:'pointer', background:d<0?'#7f1d1d':'#14532d', color:'white', fontSize:10, fontWeight:700 }}>
                          {d>0?`+${d}`:d}
                        </button>
                      ))}
                      <button onClick={()=>quickStatus(pid,p.status==='tripped'?null:'tripped')} title="Trip" style={{ width:26, height:26, borderRadius:5, border:'none', cursor:'pointer', background:p.status==='tripped'?'#d97706':'rgba(255,255,255,.08)', color:'white', fontSize:12 }}>💫</button>
                      <button onClick={()=>quickStatus(pid,p.status==='cursed'?null:'cursed')} title="Curse" style={{ width:26, height:26, borderRadius:5, border:'none', cursor:'pointer', background:p.status==='cursed'?'#7c3aed':'rgba(255,255,255,.08)', color:'white', fontSize:12 }}>🌑</button>
                      <button onClick={()=>quickStatus(pid,p.status==='petrified'?null:'petrified')} title="Petrify" style={{ width:26, height:26, borderRadius:5, border:'none', cursor:'pointer', background:p.status==='petrified'?'#4b5563':'rgba(255,255,255,.08)', color:'white', fontSize:12 }}>🗿</button>
                      <button onClick={()=>quickToken(pid,1)} title="+Token" style={{ width:26, height:26, borderRadius:5, border:'none', cursor:'pointer', background:'rgba(245,158,11,.2)', color:'#f59e0b', fontSize:12 }}>⭐</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Standings */}
        <div style={{ background:'rgba(255,255,255,.05)', borderRadius:14, padding:12, marginBottom:12, border:'1.5px solid rgba(255,255,255,.07)' }}>
          <h3 style={{ color:'rgba(255,255,255,.6)', fontSize:13, fontWeight:700, margin:'0 0 10px' }}>🏆 Race Standings</h3>
          {standings.map((pid,i) => {
            const p=players[pid]; if(!p) return null;
            const ch=CHARACTERS.find(c=>c.name===p.characterName);
            const inFin=finishOrder.includes(pid);
            return (
              <div key={pid} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 0', borderBottom: i<standings.length-1?'1px solid rgba(255,255,255,.05)':'none' }}>
                <span style={{ fontSize:13, width:20, color:'rgba(255,255,255,.45)', fontWeight:700 }}>
                  {inFin?['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣'][finishOrder.indexOf(pid)]:`${i+1}.`}
                </span>
                <div style={{ width:7, height:7, borderRadius:'50%', background:PCOLORS[playerIds.indexOf(pid)%PCOLORS.length] }} />
                <div style={{ flex:1, fontSize:12, color:pid===myId?'#a5b4fc':'rgba(255,255,255,.8)', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {p.name} {ch?ch.emoji:''}
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <span style={{ color:'rgba(255,255,255,.5)', fontSize:11 }}>sp.{p.position??0} </span>
                  <span style={{ color:'#6ee7b7', fontSize:12, fontWeight:700 }}>{p.totalPoints||0}pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Log */}
        {log.length>0 && (
          <div style={{ background:'rgba(0,0,0,.25)', borderRadius:12, padding:10, marginBottom:12 }}>
            <div style={{ color:'rgba(255,255,255,.4)', fontSize:11, fontWeight:700, marginBottom:6 }}>📋 Turn Log</div>
            <div style={{ maxHeight:90, overflowY:'auto' }}>
              {log.slice(0,12).map((entry,i) => (
                <div key={i} style={{ color:'rgba(255,255,255,.45)', fontSize:11, lineHeight:1.6 }}>{entry}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(15,23,42,.96)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,.08)', padding:'10px 16px', display:'flex', gap:8, justifyContent:'center', zIndex:100 }}>
        {(isMyTurn||amHost) && phase==='racing' && (
          <button onClick={endTurn} style={{ padding:'11px 24px', borderRadius:12, border:'none', cursor:'pointer', background:'#0891b2', color:'white', fontSize:14, fontWeight:800, flex:1, maxWidth:220 }}>
            ⏭️ End Turn
          </button>
        )}
        {amHost && phase==='racing' && (
          <button onClick={endRace} style={{ padding:'11px 16px', borderRadius:12, border:'1px solid rgba(239,68,68,.3)', cursor:'pointer', background:'rgba(239,68,68,.15)', color:'#ef4444', fontSize:13, fontWeight:700 }}>
            🏁 End Race
          </button>
        )}
      </div>

      {/* Ability modal */}
      {abilityModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}
          onClick={e=>{if(e.target===e.currentTarget)setAbilityModal(null);}}>
          <div style={{ background:'#1e1b4b', borderRadius:20, padding:24, maxWidth:380, width:'100%', border:'2px solid rgba(165,180,252,.3)' }}>
            {(() => {
              const c=CHARACTERS.find(ch=>ch.name===abilityModal);
              return c ? (
                <>
                  <div style={{ textAlign:'center', marginBottom:16 }}>
                    <img src={`/games/magical-athletes/${c.file}`} alt={c.name} onError={e=>e.target.style.display='none'}
                      style={{ width:80, height:80, objectFit:'contain', borderRadius:12, background:'rgba(0,0,0,.3)', display:'block', margin:'0 auto 10px' }} />
                    <div style={{ color:'white', fontSize:20, fontWeight:900 }}>{c.emoji} {c.name}</div>
                  </div>
                  <p style={{ color:'rgba(255,255,255,.85)', fontSize:14, lineHeight:1.6, margin:'0 0 8px' }}>{c.ability}</p>
                  <p style={{ color:'#a5b4fc', fontSize:13, lineHeight:1.5, margin:'0 0 16px', background:'rgba(124,58,237,.1)', borderRadius:8, padding:'8px 12px' }}>{c.hint}</p>
                  <button onClick={()=>setAbilityModal(null)} style={{ width:'100%', padding:12, borderRadius:12, border:'none', cursor:'pointer', background:'#7c3aed', color:'white', fontWeight:800, fontSize:15 }}>
                    Got it! 👍
                  </button>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
