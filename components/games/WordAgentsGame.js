// components/games/WordAgentsGame.js — Word Agents: team-based word deduction (Codenames-style)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { kickPlayer, watchForKick, KickButton, KickConfirmModal } from './shared/kickPlayer';

// ─── Word Bank ────────────────────────────────────────────────────────────────
const WORD_BANK = [
  'Apple', 'Anchor', 'Angel', 'Ant', 'Arm', 'Arrow', 'Australia', 'Avalanche',
  'Ball', 'Banana', 'Band', 'Bank', 'Bark', 'Bat', 'Battery', 'Beach', 'Bear', 'Beard',
  'Bed', 'Bell', 'Belt', 'Bike', 'Bird', 'Blanket', 'Board', 'Boat', 'Bomb', 'Bone',
  'Book', 'Boot', 'Bottle', 'Bow', 'Box', 'Brain', 'Branch', 'Bread', 'Bridge', 'Brush',
  'Bubble', 'Bucket', 'Bug', 'Button', 'Cactus', 'Cake', 'Camp', 'Candle', 'Cannon',
  'Cap', 'Cape', 'Car', 'Card', 'Carpet', 'Carrot', 'Castle', 'Cat', 'Cave', 'Chain',
  'Chair', 'Chalk', 'Charge', 'Cheese', 'Chest', 'Chicken', 'Chocolate', 'Circle',
  'Class', 'Claw', 'Cliff', 'Cloak', 'Clock', 'Cloud', 'Clown', 'Club', 'Coach', 'Coast',
  'Code', 'Coin', 'Comet', 'Compass', 'Cook', 'Copper', 'Coral', 'Court', 'Cover',
  'Crane', 'Cricket', 'Cross', 'Crown', 'Crystal', 'Cup', 'Cycle', 'Dance', 'Deck',
  'Desert', 'Diamond', 'Dice', 'Dinosaur', 'Doctor', 'Dog', 'Dolphin', 'Door', 'Dragon',
  'Dream', 'Dress', 'Drill', 'Drop', 'Drum', 'Duck', 'Eagle', 'Earth', 'Egg', 'Engine',
  'Eye', 'Fair', 'Fall', 'Fan', 'Farm', 'Feather', 'Fence', 'Field', 'Fig', 'File',
  'Fire', 'Fish', 'Flag', 'Flood', 'Floor', 'Flute', 'Fly', 'Fog', 'Foot', 'Forest',
  'Fork', 'Fort', 'Frame', 'Frog', 'Frost', 'Game', 'Garden', 'Gate', 'Ghost', 'Giant',
  'Glass', 'Glove', 'Gold', 'Grass', 'Ground', 'Guard', 'Guitar', 'Hammer', 'Hand',
  'Harbour', 'Hat', 'Hawk', 'Heart', 'Helicopter', 'Helmet', 'Hide', 'Hole', 'Honey',
  'Hood', 'Hook', 'Horn', 'Horse', 'Hospital', 'Hotel', 'Ice', 'Iron', 'Island', 'Jam',
  'Jet', 'Judge', 'Jungle', 'Kangaroo', 'Key', 'King', 'Kite', 'Kiwi', 'Knife', 'Knight',
  'Koala', 'Ladder', 'Lake', 'Lava', 'Lead', 'Leaf', 'Lemon', 'Letter', 'Light',
  'Lightning', 'Line', 'Lion', 'Litter', 'Lock', 'Log', 'Luck', 'Magnet', 'Mail', 'Mammoth',
  'Map', 'March', 'Mark', 'Mask', 'Match', 'Maze', 'Medal', 'Milk', 'Mine', 'Mint',
  'Mirror', 'Model', 'Mole', 'Monkey', 'Monster', 'Moon', 'Mouse', 'Mouth', 'Mummy',
  'Nail', 'Needle', 'Nest', 'Net', 'Night', 'Ninja', 'Note', 'Nut', 'Ocean', 'Octopus',
  'Oil', 'Olive', 'Orange', 'Organ', 'Palm', 'Pan', 'Paper', 'Parachute', 'Park', 'Parrot',
  'Party', 'Pass', 'Paste', 'Path', 'Pea', 'Peach', 'Pearl', 'Pen', 'Penguin', 'Phone',
  'Piano', 'Pie', 'Pilot', 'Pin', 'Pipe', 'Pirate', 'Pit', 'Pitch', 'Pizza', 'Plane',
  'Planet', 'Plant', 'Plate', 'Play', 'Point', 'Pole', 'Police', 'Pool', 'Port', 'Post',
  'Pot', 'Present', 'Princess', 'Pumpkin', 'Puppet', 'Pyramid', 'Queen', 'Rabbit',
  'Race', 'Radio', 'Rail', 'Rain', 'Rainbow', 'Ray', 'Ring', 'River', 'Robot', 'Rock',
  'Rocket', 'Roll', 'Roof', 'Root', 'Rope', 'Rose', 'Ruler', 'Salt', 'Sand', 'Satellite',
  'Saw', 'Scale', 'School', 'Scientist', 'Scorpion', 'Screen', 'Seal', 'Seed', 'Shadow',
  'Shark', 'Shed', 'Sheep', 'Sheet', 'Shell', 'Ship', 'Shoe', 'Shop', 'Shoulder', 'Sink',
  'Skate', 'Sketch', 'Ski', 'Sled', 'Sleep', 'Slide', 'Slip', 'Smoke', 'Snake', 'Snow',
  'Soap', 'Sock', 'Soldier', 'Song', 'Space', 'Spell', 'Spider', 'Spike', 'Spine',
  'Sponge', 'Spoon', 'Spot', 'Spring', 'Spy', 'Square', 'Stadium', 'Stamp', 'Star',
  'Station', 'Stick', 'Sting', 'Stone', 'Storm', 'Straw', 'Stream', 'Street', 'Sugar',
  'Sun', 'Swing', 'Switch', 'Sword', 'Table', 'Tail', 'Tank', 'Tap', 'Teacher', 'Team',
  'Telescope', 'Tent', 'Thief', 'Thunder', 'Ticket', 'Tiger', 'Time', 'Toast', 'Tooth',
  'Torch', 'Tower', 'Track', 'Train', 'Trap', 'Treasure', 'Tree', 'Triangle', 'Trick',
  'Trip', 'Truck', 'Trunk', 'Tunnel', 'Turkey', 'Turtle', 'Umbrella', 'Unicorn',
  'Vet', 'Volcano', 'Wall', 'Wand', 'Watch', 'Water', 'Wave', 'Web', 'Well', 'Whale',
  'Wheel', 'Whip', 'Whistle', 'Wind', 'Window', 'Wing', 'Wizard', 'Wolf', 'Wood', 'Wool',
  'Worm', 'Yard', 'Zebra', 'Zoo',
];

const PLAYER_EMOJIS = ['🦊', '🐼', '🦁', '🐸', '🦄', '🐧', '🦋', '🐙', '🦖', '🐺', '🦝', '🦓', '🐨', '🐯', '🦉', '🐬'];

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// Build a 25-card board: starting team 9, other team 8, 7 bystanders, 1 assassin
const generateBoard = (startingTeam) => {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5).slice(0, 25);
  const otherTeam = startingTeam === 'red' ? 'blue' : 'red';
  const types = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(otherTeam),
    ...Array(7).fill('neutral'),
    'assassin',
  ].sort(() => Math.random() - 0.5);
  return shuffled.map((word, i) => ({ word, type: types[i], revealed: false }));
};

const TEAM_META = {
  red: { name: 'Red Team', color: 'red', emoji: '🔴', agent: '🕵️' },
  blue: { name: 'Blue Team', color: 'blue', emoji: '🔵', agent: '🕵️' },
};

const countRemaining = (board, team) =>
  (board || []).filter(c => c.type === team && !c.revealed).length;

// ─── Main Component ───────────────────────────────────────────────────────────

const WordAgentsGame = ({ studentData, showToast }) => {
  const [screen, setScreen] = useState('home'); // home | nameEntry | lobby | game
  const [mode, setMode] = useState(null);
  const [nameInput, setNameInput] = useState(studentData?.name || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId] = useState(() => `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [clueWordInput, setClueWordInput] = useState('');
  const [clueNumberInput, setClueNumberInput] = useState(2);
  const [confirmCard, setConfirmCard] = useState(null); // index awaiting tap-to-confirm
  const [kickTarget, setKickTarget] = useState(null); // player object pending kick confirmation
  const [fb, setFb] = useState(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  // ── Load Firebase ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { database } = await import('../../utils/firebase');
      const { ref, set, onValue, update, off, get, remove, push } = await import('firebase/database');
      setFb({ database, ref, set, onValue, update, off, get, remove, push });
    };
    load();
  }, []);

  // ── Room listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `wordAgentsRooms/${roomCode}`);
    const handler = fb.onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      setRoomData(data);
      const cur = screenRef.current;
      if ((data.phase === 'playing' || data.phase === 'gameover') && cur === 'lobby') {
        setScreen('game');
        setConfirmCard(null);
      }
      if (data.phase === 'lobby' && cur === 'game') {
        setScreen('lobby');
        setClueWordInput('');
        setConfirmCard(null);
      }
    });
    return () => fb.off(rRef, 'value', handler);
  }, [roomCode, fb]);

  // ── Kick watcher (local player) ─────────────────────────────────────────────
  useEffect(() => {
    if (!fb || !roomCode || !myId) return;
    const unsubscribe = watchForKick(fb.database, `wordAgentsRooms/${roomCode}`, myId, () => {
      showToast?.('You were removed from the game by the host.', 'error');
      setScreen('home');
      setRoomCode('');
      setRoomData(null);
      setIsHost(false);
      setClueWordInput('');
      setConfirmCard(null);
      setKickTarget(null);
    });
    return () => unsubscribe();
  }, [fb, roomCode, myId, showToast]);

  // ── Clear tap-to-confirm whenever the turn or stage changes ────────────────
  useEffect(() => {
    setConfirmCard(null);
  }, [roomData?.currentTeam, roomData?.turnStage]);

  // ── Log helper ─────────────────────────────────────────────────────────────
  const addLog = useCallback((text, team = null) => {
    if (!fb || !roomCode) return;
    fb.push(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/log`), { text, team, at: Date.now() });
  }, [fb, roomCode]);

  // ── Create room ────────────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = generateRoomCode();
    await fb.set(fb.ref(fb.database, `wordAgentsRooms/${code}`), {
      roomCode: code,
      phase: 'lobby',
      hostId: myId,
      createdAt: Date.now(),
      teamWins: { red: 0, blue: 0 },
      gamesPlayed: 0,
      players: {
        [myId]: { id: myId, name: nameInput.trim(), emoji: PLAYER_EMOJIS[0], team: null, role: 'operative', isHost: true }
      }
    });
    setRoomCode(code);
    setIsHost(true);
    setScreen('lobby');
  }, [fb, nameInput, myId, showToast]);

  // ── Join room ──────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 4) { showToast?.('Room code must be 4 letters!', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `wordAgentsRooms/${code}`));
    const data = snap.val();
    if (!data) { showToast?.('Room not found! Check the code.', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 16) { showToast?.('Room is full!', 'error'); return; }
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${code}/players/${myId}`), {
      id: myId,
      name: nameInput.trim(),
      emoji: PLAYER_EMOJIS[playerCount % PLAYER_EMOJIS.length],
      team: null,
      role: 'operative',
      isHost: false,
    });
    setRoomCode(code);
    setIsHost(false);
    setScreen(data.phase === 'lobby' ? 'lobby' : 'game');
  }, [fb, nameInput, roomCodeInput, myId, showToast]);

  // ── Lobby: pick team / role ────────────────────────────────────────────────
  const joinTeam = useCallback(async (team) => {
    if (!fb || !roomCode) return;
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/players/${myId}`), { team, role: 'operative' });
  }, [fb, roomCode, myId]);

  const becomeSpymaster = useCallback(async (team) => {
    if (!fb || !roomCode || !roomData) return;
    const existing = Object.values(roomData.players || {}).find(p => p.team === team && p.role === 'spymaster');
    if (existing && existing.id !== myId) { showToast?.(`${existing.name} is already the ${team} Spymaster!`, 'error'); return; }
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/players/${myId}`), { team, role: 'spymaster' });
  }, [fb, roomCode, roomData, myId, showToast]);

  const stepDownSpymaster = useCallback(async () => {
    if (!fb || !roomCode) return;
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/players/${myId}`), { role: 'operative' });
  }, [fb, roomCode, myId]);

  // ── Start game (host) ──────────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    if (!fb || !isHost || !roomData) return;
    const players = Object.values(roomData.players || {});
    const red = players.filter(p => p.team === 'red');
    const blue = players.filter(p => p.team === 'blue');
    const redSpy = red.find(p => p.role === 'spymaster');
    const blueSpy = blue.find(p => p.role === 'spymaster');
    if (red.length < 2 || blue.length < 2) { showToast?.('Each team needs at least 2 agents!', 'error'); return; }
    if (!redSpy || !blueSpy) { showToast?.('Each team needs a Spymaster!', 'error'); return; }
    const prevStart = roomData.lastStartingTeam;
    const startingTeam = prevStart ? (prevStart === 'red' ? 'blue' : 'red') : (Math.random() < 0.5 ? 'red' : 'blue');
    const board = generateBoard(startingTeam);
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), {
      phase: 'playing',
      board,
      startingTeam,
      lastStartingTeam: startingTeam,
      currentTeam: startingTeam,
      turnStage: 'clue',
      clue: null,
      guessesLeft: 0,
      winner: null,
      winReason: null,
      log: null,
      gamesPlayed: (roomData.gamesPlayed || 0) + 1,
    });
    fb.push(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/log`), {
      text: `Mission started! ${TEAM_META[startingTeam].name} goes first with 9 words to find.`,
      team: startingTeam, at: Date.now(),
    });
  }, [fb, isHost, roomData, roomCode, showToast]);

  // ── Submit clue (spymaster) ────────────────────────────────────────────────
  const submitClue = useCallback(async () => {
    if (!fb || !roomData) return;
    const word = clueWordInput.trim();
    if (!word) { showToast?.('Type a clue word!', 'error'); return; }
    if (/\s/.test(word)) { showToast?.('Clue must be ONE word — no spaces!', 'error'); return; }
    const num = Math.max(0, Math.min(9, parseInt(clueNumberInput, 10) || 0));
    const lower = word.toLowerCase();
    const clash = (roomData.board || []).find(c => !c.revealed && (
      c.word.toLowerCase() === lower ||
      c.word.toLowerCase().includes(lower) ||
      lower.includes(c.word.toLowerCase())
    ));
    if (clash) { showToast?.(`Too close to "${clash.word}" on the board! Pick a different clue.`, 'error'); return; }
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), {
      turnStage: 'guess',
      clue: { word, number: num, team: roomData.currentTeam },
      guessesLeft: num === 0 ? 99 : num + 1,
    });
    addLog(`Spymaster clue: "${word.toUpperCase()}" for ${num === 0 ? '∞' : num}`, roomData.currentTeam);
    setClueWordInput('');
  }, [fb, roomData, roomCode, clueWordInput, clueNumberInput, showToast, addLog]);

  // ── End turn ───────────────────────────────────────────────────────────────
  const endTurn = useCallback(async (reasonText) => {
    if (!fb || !roomData) return;
    const nextTeam = roomData.currentTeam === 'red' ? 'blue' : 'red';
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), {
      currentTeam: nextTeam,
      turnStage: 'clue',
      clue: null,
      guessesLeft: 0,
    });
    if (reasonText) addLog(reasonText, roomData.currentTeam);
  }, [fb, roomData, roomCode, addLog]);

  // ── Guess a card (operative) ───────────────────────────────────────────────
  const guessCard = useCallback(async (index) => {
    if (!fb || !roomData || roomData.phase !== 'playing') return;
    const me = roomData.players?.[myId];
    const board = roomData.board || [];
    const card = board[index];
    if (!card || card.revealed) return;
    if (!me || me.team !== roomData.currentTeam || me.role !== 'operative') return;
    if (roomData.turnStage !== 'guess') return;

    const team = roomData.currentTeam;
    const otherTeam = team === 'red' ? 'blue' : 'red';
    const updates = {
      [`board/${index}/revealed`]: true,
      [`board/${index}/revealedBy`]: team,
    };

    if (card.type === 'assassin') {
      updates.phase = 'gameover';
      updates.winner = otherTeam;
      updates.winReason = 'assassin';
      updates[`teamWins/${otherTeam}`] = (roomData.teamWins?.[otherTeam] || 0) + 1;
      await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
      addLog(`💀 ${me.name} found the ASSASSIN! ${TEAM_META[otherTeam].name} wins!`, otherTeam);
      return;
    }

    if (card.type === team) {
      const remainingAfter = countRemaining(board, team) - 1;
      if (remainingAfter <= 0) {
        updates.phase = 'gameover';
        updates.winner = team;
        updates.winReason = 'allFound';
        updates[`teamWins/${team}`] = (roomData.teamWins?.[team] || 0) + 1;
        await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
        addLog(`🎉 ${me.name} uncovered "${card.word}" — that's every agent! ${TEAM_META[team].name} wins!`, team);
        return;
      }
      const left = (roomData.guessesLeft || 1) - 1;
      if (left <= 0) {
        updates.currentTeam = otherTeam;
        updates.turnStage = 'clue';
        updates.clue = null;
        updates.guessesLeft = 0;
        await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
        addLog(`✅ ${me.name} found "${card.word}" — out of guesses, turn passes.`, team);
      } else {
        updates.guessesLeft = left;
        await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
        addLog(`✅ ${me.name} found "${card.word}"! Keep going…`, team);
      }
      return;
    }

    if (card.type === otherTeam) {
      const oppRemainingAfter = countRemaining(board, otherTeam) - 1;
      if (oppRemainingAfter <= 0) {
        updates.phase = 'gameover';
        updates.winner = otherTeam;
        updates.winReason = 'allFound';
        updates[`teamWins/${otherTeam}`] = (roomData.teamWins?.[otherTeam] || 0) + 1;
        await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
        addLog(`😱 ${me.name} revealed "${card.word}" — the LAST ${TEAM_META[otherTeam].name} word! ${TEAM_META[otherTeam].name} wins!`, otherTeam);
        return;
      }
      updates.currentTeam = otherTeam;
      updates.turnStage = 'clue';
      updates.clue = null;
      updates.guessesLeft = 0;
      await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
      addLog(`❌ ${me.name} hit "${card.word}" — an enemy agent! Turn over.`, team);
      return;
    }

    // Neutral bystander
    updates.currentTeam = otherTeam;
    updates.turnStage = 'clue';
    updates.clue = null;
    updates.guessesLeft = 0;
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), updates);
    addLog(`😐 ${me.name} revealed "${card.word}" — just a bystander. Turn over.`, team);
  }, [fb, roomData, roomCode, myId, addLog]);

  // ── New game / back to lobby (host) ────────────────────────────────────────
  const backToLobby = useCallback(async () => {
    if (!fb || !isHost) return;
    await fb.update(fb.ref(fb.database, `wordAgentsRooms/${roomCode}`), {
      phase: 'lobby', board: null, clue: null, winner: null, log: null,
    });
  }, [fb, isHost, roomCode]);

  // ── Leave room ─────────────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    if (fb && roomCode) {
      await fb.remove(fb.ref(fb.database, `wordAgentsRooms/${roomCode}/players/${myId}`));
    }
    setScreen('home');
    setRoomCode('');
    setRoomData(null);
    setIsHost(false);
    setClueWordInput('');
    setConfirmCard(null);
  }, [fb, roomCode, myId]);

  // ── Kick a player (host) ────────────────────────────────────────────────────
  const kickAgent = useCallback(async (targetId) => {
    if (!fb || !roomCode || !roomData || !isHost) return;
    const target = roomData.players?.[targetId];
    if (!target) return;
    const hostPlayer = roomData.players?.[myId];
    const roomPath = `wordAgentsRooms/${roomCode}`;
    const extraUpdates = {};

    if (roomData.phase === 'playing' && target.team) {
      const teammates = Object.values(roomData.players || {})
        .filter(p => p.id !== targetId && p.team === target.team);
      const isCurrentTeam = target.team === roomData.currentTeam;

      if (target.role === 'spymaster') {
        if (isCurrentTeam && roomData.turnStage === 'clue') {
          // No one can give a clue anymore — promote a teammate, or end the
          // mission if the team is now empty.
          const replacement = teammates[0];
          if (replacement) {
            extraUpdates[`${roomPath}/players/${replacement.id}/role`] = 'spymaster';
          } else {
            const otherTeam = target.team === 'red' ? 'blue' : 'red';
            extraUpdates[`${roomPath}/phase`] = 'gameover';
            extraUpdates[`${roomPath}/winner`] = otherTeam;
            extraUpdates[`${roomPath}/winReason`] = 'forfeit';
            extraUpdates[`${roomPath}/teamWins/${otherTeam}`] = (roomData.teamWins?.[otherTeam] || 0) + 1;
          }
        } else if (teammates.length) {
          // Spymaster removed off-turn (or mid-guess) — still hand the role
          // over so the team isn't leaderless next time it's their turn.
          extraUpdates[`${roomPath}/players/${teammates[0].id}/role`] = 'spymaster';
        }
      } else if (isCurrentTeam && roomData.turnStage === 'guess') {
        const remainingOperatives = teammates.filter(p => p.role === 'operative');
        if (remainingOperatives.length === 0) {
          // Last operative on the guessing team — force the turn to advance,
          // same update shape as the host's "Force End Turn" override.
          const nextTeam = roomData.currentTeam === 'red' ? 'blue' : 'red';
          extraUpdates[`${roomPath}/currentTeam`] = nextTeam;
          extraUpdates[`${roomPath}/turnStage`] = 'clue';
          extraUpdates[`${roomPath}/clue`] = null;
          extraUpdates[`${roomPath}/guessesLeft`] = 0;
        }
      }
    }

    await kickPlayer({
      database: fb.database,
      roomPath,
      targetId,
      targetName: target.name,
      hostName: hostPlayer?.name,
      extraUpdates,
    });
    addLog(`${target.name} was removed from the mission by the host.`);
    setKickTarget(null);
  }, [fb, roomCode, roomData, isHost, myId, addLog]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const players = roomData ? Object.values(roomData.players || {}) : [];
  const me = roomData?.players?.[myId];
  const myTeam = me?.team;
  const amSpymaster = me?.role === 'spymaster';
  const board = roomData?.board || [];
  const currentTeam = roomData?.currentTeam;
  const isMyTeamsTurn = myTeam && myTeam === currentTeam;
  const canGuess = isMyTeamsTurn && !amSpymaster && roomData?.turnStage === 'guess' && roomData?.phase === 'playing';
  const canClue = isMyTeamsTurn && amSpymaster && roomData?.turnStage === 'clue' && roomData?.phase === 'playing';
  const redPlayers = players.filter(p => p.team === 'red');
  const bluePlayers = players.filter(p => p.team === 'blue');
  const benchPlayers = players.filter(p => !p.team);
  const logEntries = roomData?.log
    ? Object.values(roomData.log).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 8)
    : [];

  const cardFace = (card, showSecrets) => {
    // Returns tailwind classes + badge for a board card
    if (card.revealed) {
      if (card.type === 'red') return { cls: 'bg-gradient-to-br from-red-500 to-rose-700 text-white border-red-400 shadow-red-900/50', badge: '🕵️' };
      if (card.type === 'blue') return { cls: 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white border-blue-400 shadow-blue-900/50', badge: '🕵️' };
      if (card.type === 'assassin') return { cls: 'bg-gradient-to-br from-zinc-800 to-black text-red-400 border-zinc-600', badge: '💀' };
      return { cls: 'bg-gradient-to-br from-stone-400 to-stone-600 text-white/80 border-stone-300', badge: '😐' };
    }
    if (showSecrets) {
      if (card.type === 'red') return { cls: 'bg-amber-50 text-red-700 border-red-500 ring-2 ring-red-500/70', badge: null };
      if (card.type === 'blue') return { cls: 'bg-amber-50 text-blue-700 border-blue-500 ring-2 ring-blue-500/70', badge: null };
      if (card.type === 'assassin') return { cls: 'bg-zinc-900 text-white border-zinc-500 ring-2 ring-zinc-400/70', badge: '💀' };
      return { cls: 'bg-amber-50 text-stone-500 border-stone-300', badge: null };
    }
    return { cls: 'bg-amber-50 hover:bg-amber-100 text-slate-800 border-amber-200', badge: null };
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ── SCREENS ───────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          {['🕵️', '🔍', '📡', '🗂️', '🧩', '🛰️', '🔐', '📻'].map((emoji, i) => (
            <span key={i} className="absolute text-5xl opacity-5 animate-pulse"
              style={{ top: `${(i * 13) % 100}%`, left: `${(i * 17 + 7) % 100}%`, animationDelay: `${i * 0.5}s` }}>
              {emoji}
            </span>
          ))}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md w-full">
          <div className="mb-2">
            <div className="text-8xl mb-4">🕵️‍♂️</div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
              Word <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400">Agents</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Red vs Blue. Your Spymaster knows which words are yours —<br />crack their one-word clues to find your agents first!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 my-8 text-left text-sm text-white/80 space-y-2">
            <div className="flex gap-3 items-start"><span className="text-lg">🗺️</span><span>25 words on the board. Some belong to <strong className="text-red-300">Red</strong>, some to <strong className="text-blue-300">Blue</strong> — only the Spymasters know which.</span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">🧠</span><span>Spymasters give a <strong className="text-white">one-word clue + a number</strong> linking their team&apos;s words.</span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">👆</span><span>Teammates tap words to guess. Wrong word? Turn over. Enemy word? You just helped them!</span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">💀</span><span>One word hides the <strong className="text-red-300">Assassin</strong> — reveal it and your team instantly loses!</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setMode('create'); setScreen('nameEntry'); }}
              className="bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-400 hover:to-blue-500 text-white font-bold py-5 rounded-2xl text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
            >
              🎮 Create Room
            </button>
            <button
              onClick={() => { setMode('join'); setScreen('nameEntry'); }}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-5 rounded-2xl text-lg transition-all active:scale-95"
            >
              🚪 Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── NAME ENTRY ─────────────────────────────────────────────────────────────
  if (screen === 'nameEntry') {
    const isJoin = mode === 'join';
    const handleSubmit = isJoin ? joinRoom : createRoom;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <button onClick={() => setScreen('home')} className="text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors">← Back</button>
          <h2 className="text-3xl font-black text-white mb-2">{isJoin ? '🚪 Join a Room' : '🎮 Create a Room'}</h2>
          <p className="text-white/50 mb-8">{isJoin ? 'Enter the room code to report for duty' : 'Choose your agent name'}</p>
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm font-semibold mb-2 block">Agent Name</label>
              <input
                type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Alex" maxLength={20}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} autoFocus
              />
            </div>
            {isJoin && (
              <div>
                <label className="text-white/70 text-sm font-semibold mb-2 block">Room Code</label>
                <input
                  type="text" value={roomCodeInput} onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ABCD" maxLength={4}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-400 hover:to-blue-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all active:scale-95 mt-4"
            >
              {isJoin ? '🚪 Join Mission' : '🚀 Create Mission'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    const redSpy = redPlayers.find(p => p.role === 'spymaster');
    const blueSpy = bluePlayers.find(p => p.role === 'spymaster');
    const ready = redPlayers.length >= 2 && bluePlayers.length >= 2 && redSpy && blueSpy;
    const wins = roomData?.teamWins || { red: 0, blue: 0 };

    const TeamPanel = ({ team, teamPlayers, spy }) => {
      const isRed = team === 'red';
      const onTeam = myTeam === team;
      return (
        <div className={`rounded-2xl p-4 border backdrop-blur ${isRed ? 'bg-red-950/50 border-red-500/40' : 'bg-blue-950/50 border-blue-500/40'}`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-black text-lg ${isRed ? 'text-red-300' : 'text-blue-300'}`}>{TEAM_META[team].emoji} {TEAM_META[team].name}</h3>
            <span className="text-white/40 text-xs font-bold">{wins[team] || 0} wins</span>
          </div>
          {/* Spymaster slot */}
          <div className={`rounded-xl p-3 mb-3 border ${isRed ? 'border-red-500/30 bg-red-900/30' : 'border-blue-500/30 bg-blue-900/30'}`}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1.5">🧠 Spymaster</p>
            {spy ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">{spy.emoji}</span>
                <span className="text-white font-bold text-sm flex-1 truncate">{spy.name}</span>
                {spy.id === myId && (
                  <button onClick={stepDownSpymaster} className="text-white/40 hover:text-white text-xs underline">step down</button>
                )}
                {isHost && spy.id !== myId && (
                  <KickButton onClick={() => setKickTarget(spy)} name={spy.name} />
                )}
              </div>
            ) : (
              <button
                onClick={() => becomeSpymaster(team)}
                className={`w-full py-2 rounded-lg text-sm font-bold transition-all active:scale-95 ${isRed ? 'bg-red-500/30 hover:bg-red-500/50 text-red-200' : 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-200'}`}
              >
                Claim Spymaster
              </button>
            )}
          </div>
          {/* Operatives */}
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1.5">🕵️ Field Agents</p>
          <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
            {teamPlayers.filter(p => p.role !== 'spymaster').map(p => (
              <span key={p.id} className="inline-flex items-center gap-1 bg-white/10 rounded-full pl-2.5 pr-1 py-1 text-xs text-white font-semibold">
                {p.emoji} {p.name}{p.id === myId ? ' (you)' : ''}
                {isHost && p.id !== myId && (
                  <KickButton onClick={() => setKickTarget(p)} name={p.name} className="ml-1" />
                )}
              </span>
            ))}
            {teamPlayers.filter(p => p.role !== 'spymaster').length === 0 && (
              <span className="text-white/25 text-xs italic">No agents yet…</span>
            )}
          </div>
          {!onTeam && (
            <button
              onClick={() => joinTeam(team)}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${isRed ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
            >
              Join {TEAM_META[team].name}
            </button>
          )}
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black text-white">🕵️‍♂️ Mission Briefing</h2>
            <button onClick={leaveRoom} className="text-white/40 hover:text-red-400 text-sm transition-colors">Leave</button>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 text-center mb-4">
            <p className="text-white/50 text-sm mb-1">Room Code</p>
            <div className="text-5xl font-black text-white tracking-[0.3em] font-mono">{roomCode}</div>
            <p className="text-white/40 text-xs mt-2">{players.length} / 16 agents · share the code to recruit more!</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <TeamPanel team="red" teamPlayers={redPlayers} spy={redSpy} />
            <TeamPanel team="blue" teamPlayers={bluePlayers} spy={blueSpy} />
          </div>

          {benchPlayers.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Waiting to pick a team</p>
              <div className="flex flex-wrap gap-1.5">
                {benchPlayers.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1 bg-white/10 rounded-full pl-2.5 pr-1 py-1 text-xs text-white/70 font-semibold">
                    {p.emoji} {p.name}{p.id === myId ? ' (you)' : ''}
                    {isHost && p.id !== myId && (
                      <KickButton onClick={() => setKickTarget(p)} name={p.name} className="ml-1" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isHost ? (
            <button
              onClick={startGame}
              disabled={!ready}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-green-500/30 transition-all active:scale-95"
            >
              {ready ? '🚀 Start Mission' : '🚀 Start Mission (need 2+ agents & a Spymaster per team)'}
            </button>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-1 animate-pulse">⏳</div>
              <p className="text-white/60 text-sm">Pick a team, then wait for the host to start…</p>
            </div>
          )}

          {isHost && kickTarget && (
            <KickConfirmModal
              playerName={kickTarget.name}
              onConfirm={() => kickAgent(kickTarget.id)}
              onCancel={() => setKickTarget(null)}
            />
          )}
        </div>
      </div>
    );
  }

  // ── GAME ───────────────────────────────────────────────────────────────────
  if (screen === 'game') {
    const isGameOver = roomData?.phase === 'gameover';
    const winner = roomData?.winner;
    const redLeft = countRemaining(board, 'red');
    const blueLeft = countRemaining(board, 'blue');
    const clue = roomData?.clue;
    const showSecrets = amSpymaster || isGameOver;
    const turnMeta = currentTeam ? TEAM_META[currentTeam] : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-3 md:p-6 pb-10">
        <div className="max-w-3xl mx-auto">
          {/* Top bar: scores */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${currentTeam === 'red' && !isGameOver ? 'bg-red-600/40 border-red-400 shadow-lg shadow-red-900/40' : 'bg-red-950/40 border-red-500/30'}`}>
              <span className="text-lg">🔴</span>
              <span className="text-red-200 font-black text-2xl">{redLeft}</span>
              <span className="text-red-200/50 text-xs font-semibold hidden sm:inline">left</span>
            </div>
            <div className="text-center flex-1 min-w-0">
              {!isGameOver && turnMeta && (
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 border text-sm font-bold ${currentTeam === 'red' ? 'bg-red-500/20 border-red-400/40 text-red-200' : 'bg-blue-500/20 border-blue-400/40 text-blue-200'}`}>
                  {turnMeta.emoji} {turnMeta.name}{roomData?.turnStage === 'clue' ? "'s Spymaster is thinking…" : ' is guessing!'}
                </div>
              )}
              {isGameOver && winner && (
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 border text-sm font-black ${winner === 'red' ? 'bg-red-500/30 border-red-400 text-red-100' : 'bg-blue-500/30 border-blue-400 text-blue-100'}`}>
                  🏆 {TEAM_META[winner].name} wins{roomData?.winReason === 'assassin' ? ' — assassin strike!' : '!'}
                </div>
              )}
            </div>
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${currentTeam === 'blue' && !isGameOver ? 'bg-blue-600/40 border-blue-400 shadow-lg shadow-blue-900/40' : 'bg-blue-950/40 border-blue-500/30'}`}>
              <span className="text-blue-200/50 text-xs font-semibold hidden sm:inline">left</span>
              <span className="text-blue-200 font-black text-2xl">{blueLeft}</span>
              <span className="text-lg">🔵</span>
            </div>
          </div>

          {/* Clue banner */}
          {!isGameOver && clue && (
            <div className={`rounded-2xl border p-3 mb-3 text-center ${clue.team === 'red' ? 'bg-red-900/40 border-red-500/40' : 'bg-blue-900/40 border-blue-500/40'}`}>
              <span className="text-white/50 text-xs uppercase tracking-widest mr-2">Clue</span>
              <span className="text-white font-black text-2xl tracking-wide">{clue.word.toUpperCase()}</span>
              <span className={`ml-3 inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-lg ${clue.team === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                {clue.number === 0 ? '∞' : clue.number}
              </span>
              {roomData?.turnStage === 'guess' && roomData?.guessesLeft > 0 && roomData.guessesLeft < 90 && (
                <span className="text-white/40 text-xs ml-3">{roomData.guessesLeft} guess{roomData.guessesLeft !== 1 ? 'es' : ''} left</span>
              )}
            </div>
          )}

          {/* My role strip */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex items-center gap-2 text-white/50">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${myTeam === 'red' ? 'bg-red-500/20 text-red-200' : myTeam === 'blue' ? 'bg-blue-500/20 text-blue-200' : 'bg-white/10 text-white/50'}`}>
                {me?.emoji} {me?.name} · {amSpymaster ? '🧠 Spymaster' : myTeam ? '🕵️ Field Agent' : '👀 Spectator'}
              </span>
              {amSpymaster && !isGameOver && <span className="text-white/30 hidden sm:inline">You can see every card&apos;s true colour — don&apos;t say a word!</span>}
            </div>
            <button onClick={leaveRoom} className="text-white/30 hover:text-red-400 transition-colors">Leave</button>
          </div>

          {/* Board */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 mb-4">
            {board.map((card, i) => {
              const face = cardFace(card, showSecrets);
              const clickable = canGuess && !card.revealed;
              const isConfirming = confirmCard === i;
              return (
                <button
                  key={`${card.word}-${i}`}
                  onClick={() => {
                    if (!clickable) return;
                    if (isConfirming) { setConfirmCard(null); guessCard(i); }
                    else setConfirmCard(i);
                  }}
                  disabled={!clickable}
                  className={`
                    relative rounded-lg sm:rounded-xl border-2 px-0.5 py-2.5 sm:py-4 min-h-[52px] sm:min-h-[64px]
                    flex items-center justify-center text-center font-bold shadow-md
                    text-[10px] sm:text-sm leading-tight break-words transition-all duration-200
                    ${face.cls}
                    ${clickable ? 'cursor-pointer hover:scale-105 hover:shadow-xl active:scale-95' : 'cursor-default'}
                    ${card.revealed ? 'shadow-inner' : ''}
                    ${isConfirming ? 'scale-110 ring-4 ring-yellow-400 z-10' : ''}
                  `}
                >
                  {face.badge && <span className="absolute top-0.5 right-1 text-[10px] sm:text-sm">{face.badge}</span>}
                  <span className={card.revealed ? 'opacity-80' : ''}>{isConfirming ? 'Sure?' : card.word}</span>
                </button>
              );
            })}
          </div>

          {/* Action panel */}
          {!isGameOver && canClue && (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-4">
              <p className="text-white font-bold text-sm mb-2">🧠 Give your team a clue</p>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="text" value={clueWordInput}
                  onChange={e => setClueWordInput(e.target.value.replace(/\s/g, ''))}
                  placeholder="One-word clue…" maxLength={24}
                  className="flex-1 min-w-[140px] bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-400 transition-all"
                  onKeyDown={e => e.key === 'Enter' && submitClue()}
                />
                <select
                  value={clueNumberInput}
                  onChange={e => setClueNumberInput(parseInt(e.target.value, 10))}
                  className="bg-slate-800 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                    <option key={n} value={n}>{n === 0 ? '∞' : n}</option>
                  ))}
                </select>
                <button
                  onClick={submitClue}
                  className={`font-bold px-5 py-3 rounded-xl transition-all active:scale-95 text-white ${myTeam === 'red' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  Send 📡
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2">The number = how many board words your clue connects. Your team gets that many guesses +1 bonus.</p>
            </div>
          )}

          {!isGameOver && canGuess && (
            <div className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4">
              <p className="text-white/60 text-sm">👆 Tap a word (tap twice to confirm). Agree with your team first!</p>
              <button
                onClick={() => { setConfirmCard(null); endTurn(`${me?.name} ended the turn.`); }}
                className="shrink-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all"
              >
                End Turn ➡️
              </button>
            </div>
          )}

          {!isGameOver && !canClue && !canGuess && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 mb-4 text-center">
              <p className="text-white/40 text-sm animate-pulse">
                {roomData?.turnStage === 'clue'
                  ? (isMyTeamsTurn ? '🧠 Your Spymaster is choosing a clue…' : `Waiting for the ${turnMeta?.name} Spymaster…`)
                  : (isMyTeamsTurn && amSpymaster ? '🤫 Your agents are guessing — stay quiet!' : `${turnMeta?.name} is guessing…`)}
              </p>
            </div>
          )}

          {/* Game over actions */}
          {isGameOver && (
            <div className="mb-4">
              <div className={`rounded-3xl p-6 text-center border shadow-2xl mb-4 ${winner === 'red' ? 'bg-gradient-to-br from-red-800 to-rose-950 border-red-500/40' : 'bg-gradient-to-br from-blue-800 to-indigo-950 border-blue-500/40'}`}>
                <div className="text-6xl mb-2">{roomData?.winReason === 'assassin' ? '💀' : '🏆'}</div>
                <h2 className="text-3xl font-black text-white mb-1">{TEAM_META[winner]?.name} Wins!</h2>
                <p className="text-white/60 text-sm">
                  {roomData?.winReason === 'assassin' ? 'The other team revealed the assassin!' : 'All their agents were found!'}
                  <span className="mx-2">·</span>
                  Series: <span className="text-red-300 font-bold">{roomData?.teamWins?.red || 0}</span> – <span className="text-blue-300 font-bold">{roomData?.teamWins?.blue || 0}</span>
                </p>
              </div>
              {isHost ? (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={startGame} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-4 rounded-xl transition-all active:scale-95">
                    🔄 Rematch
                  </button>
                  <button onClick={backToLobby} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-xl transition-all active:scale-95">
                    🧑‍🤝‍🧑 Change Teams
                  </button>
                </div>
              ) : (
                <p className="text-white/40 text-center text-sm animate-pulse">Waiting for the host to start a rematch…</p>
              )}
            </div>
          )}

          {/* Mission log */}
          {logEntries.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">📻 Mission Log</h3>
              <div className="space-y-1.5">
                {logEntries.map((entry, i) => (
                  <p key={`${entry.at}-${i}`} className={`text-xs leading-snug ${entry.team === 'red' ? 'text-red-200/70' : entry.team === 'blue' ? 'text-blue-200/70' : 'text-white/50'}`}>
                    {entry.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Host override */}
          {isHost && !isGameOver && roomData?.turnStage === 'guess' && (
            <button
              onClick={() => endTurn('Host moved the game along.')}
              className="mt-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 font-semibold py-2.5 rounded-xl text-xs transition-all"
            >
              Force End Turn (host override)
            </button>
          )}

          {/* Host: manage agents */}
          {isHost && (
            <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">🕵️ Manage Agents (host)</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {['red', 'blue'].map(team => (
                  <div key={team}>
                    <p className={`text-xs font-bold mb-1 ${team === 'red' ? 'text-red-300' : 'text-blue-300'}`}>{TEAM_META[team].emoji} {TEAM_META[team].name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {players.filter(p => p.team === team).map(p => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-white/10 rounded-full pl-2.5 pr-1 py-1 text-xs text-white font-semibold">
                          {p.emoji} {p.name}{p.role === 'spymaster' ? ' 🧠' : ''}{p.id === myId ? ' (you)' : ''}
                          {p.id !== myId && (
                            <KickButton onClick={() => setKickTarget(p)} name={p.name} className="ml-1" />
                          )}
                        </span>
                      ))}
                      {players.filter(p => p.team === team).length === 0 && (
                        <span className="text-white/25 text-xs italic">No agents</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isHost && kickTarget && (
            <KickConfirmModal
              playerName={kickTarget.name}
              onConfirm={() => kickAgent(kickTarget.id)}
              onCancel={() => setKickTarget(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default WordAgentsGame;
