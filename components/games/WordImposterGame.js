// components/games/WordImposterGame.js — Word Imposter multiplayer social deduction game
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Word Pairs ───────────────────────────────────────────────────────────────
const WORD_PAIRS = [
  // Food
  { realWord: 'Pizza', imposterWord: 'Calzone', category: 'Food' },
  { realWord: 'Sushi', imposterWord: 'Sashimi', category: 'Food' },
  { realWord: 'Burger', imposterWord: 'Hot Dog', category: 'Food' },
  { realWord: 'Tacos', imposterWord: 'Burritos', category: 'Food' },
  { realWord: 'Pasta', imposterWord: 'Noodles', category: 'Food' },
  { realWord: 'Cake', imposterWord: 'Muffin', category: 'Food' },
  { realWord: 'Ice Cream', imposterWord: 'Gelato', category: 'Food' },
  { realWord: 'Sandwich', imposterWord: 'Wrap', category: 'Food' },
  { realWord: 'Chips', imposterWord: 'Crackers', category: 'Food' },
  { realWord: 'Chocolate', imposterWord: 'Caramel', category: 'Food' },
  { realWord: 'Pancakes', imposterWord: 'Waffles', category: 'Food' },
  { realWord: 'Popcorn', imposterWord: 'Peanuts', category: 'Food' },
  { realWord: 'Donut', imposterWord: 'Bagel', category: 'Food' },
  { realWord: 'Lemonade', imposterWord: 'Orange Juice', category: 'Food' },
  // Animals
  { realWord: 'Lion', imposterWord: 'Tiger', category: 'Animals' },
  { realWord: 'Dolphin', imposterWord: 'Whale', category: 'Animals' },
  { realWord: 'Eagle', imposterWord: 'Hawk', category: 'Animals' },
  { realWord: 'Wolf', imposterWord: 'Fox', category: 'Animals' },
  { realWord: 'Elephant', imposterWord: 'Rhino', category: 'Animals' },
  { realWord: 'Penguin', imposterWord: 'Seal', category: 'Animals' },
  { realWord: 'Shark', imposterWord: 'Barracuda', category: 'Animals' },
  { realWord: 'Horse', imposterWord: 'Donkey', category: 'Animals' },
  { realWord: 'Bear', imposterWord: 'Panda', category: 'Animals' },
  { realWord: 'Snake', imposterWord: 'Lizard', category: 'Animals' },
  { realWord: 'Octopus', imposterWord: 'Jellyfish', category: 'Animals' },
  { realWord: 'Parrot', imposterWord: 'Toucan', category: 'Animals' },
  // Sports
  { realWord: 'Football', imposterWord: 'Rugby', category: 'Sports' },
  { realWord: 'Basketball', imposterWord: 'Netball', category: 'Sports' },
  { realWord: 'Tennis', imposterWord: 'Badminton', category: 'Sports' },
  { realWord: 'Swimming', imposterWord: 'Diving', category: 'Sports' },
  { realWord: 'Baseball', imposterWord: 'Cricket', category: 'Sports' },
  { realWord: 'Skiing', imposterWord: 'Snowboarding', category: 'Sports' },
  { realWord: 'Cycling', imposterWord: 'Running', category: 'Sports' },
  { realWord: 'Boxing', imposterWord: 'Wrestling', category: 'Sports' },
  { realWord: 'Surfing', imposterWord: 'Skateboarding', category: 'Sports' },
  // Places
  { realWord: 'Beach', imposterWord: 'Lake', category: 'Places' },
  { realWord: 'Mountain', imposterWord: 'Hill', category: 'Places' },
  { realWord: 'Forest', imposterWord: 'Jungle', category: 'Places' },
  { realWord: 'Castle', imposterWord: 'Palace', category: 'Places' },
  { realWord: 'Airport', imposterWord: 'Train Station', category: 'Places' },
  { realWord: 'Museum', imposterWord: 'Gallery', category: 'Places' },
  { realWord: 'Stadium', imposterWord: 'Arena', category: 'Places' },
  { realWord: 'Library', imposterWord: 'Bookshop', category: 'Places' },
  { realWord: 'Hospital', imposterWord: 'Clinic', category: 'Places' },
  // Music
  { realWord: 'Guitar', imposterWord: 'Bass Guitar', category: 'Music' },
  { realWord: 'Piano', imposterWord: 'Keyboard', category: 'Music' },
  { realWord: 'Trumpet', imposterWord: 'Trombone', category: 'Music' },
  { realWord: 'Violin', imposterWord: 'Viola', category: 'Music' },
  { realWord: 'Drums', imposterWord: 'Bongos', category: 'Music' },
  { realWord: 'Microphone', imposterWord: 'Headphones', category: 'Music' },
  // Nature
  { realWord: 'Rainbow', imposterWord: 'Sunset', category: 'Nature' },
  { realWord: 'Thunder', imposterWord: 'Lightning', category: 'Nature' },
  { realWord: 'Volcano', imposterWord: 'Geyser', category: 'Nature' },
  { realWord: 'Tornado', imposterWord: 'Hurricane', category: 'Nature' },
  { realWord: 'Waterfall', imposterWord: 'River', category: 'Nature' },
  { realWord: 'Glacier', imposterWord: 'Iceberg', category: 'Nature' },
  // Space
  { realWord: 'Moon', imposterWord: 'Comet', category: 'Space' },
  { realWord: 'Asteroid', imposterWord: 'Meteor', category: 'Space' },
  { realWord: 'Black Hole', imposterWord: 'Nebula', category: 'Space' },
  { realWord: 'Saturn', imposterWord: 'Jupiter', category: 'Space' },
  { realWord: 'Astronaut', imposterWord: 'Cosmonaut', category: 'Space' },
  { realWord: 'Telescope', imposterWord: 'Satellite', category: 'Space' },
  // School
  { realWord: 'Pencil', imposterWord: 'Pen', category: 'School' },
  { realWord: 'Backpack', imposterWord: 'Satchel', category: 'School' },
  { realWord: 'Ruler', imposterWord: 'Protractor', category: 'School' },
  { realWord: 'Laptop', imposterWord: 'Tablet', category: 'School' },
  { realWord: 'Whiteboard', imposterWord: 'Blackboard', category: 'School' },
  { realWord: 'Compass', imposterWord: 'Set Square', category: 'School' },
  // Fantasy
  { realWord: 'Dragon', imposterWord: 'Phoenix', category: 'Fantasy' },
  { realWord: 'Wizard', imposterWord: 'Witch', category: 'Fantasy' },
  { realWord: 'Knight', imposterWord: 'Samurai', category: 'Fantasy' },
  { realWord: 'Pirate', imposterWord: 'Viking', category: 'Fantasy' },
  { realWord: 'Mermaid', imposterWord: 'Siren', category: 'Fantasy' },
  { realWord: 'Vampire', imposterWord: 'Werewolf', category: 'Fantasy' },
  { realWord: 'Unicorn', imposterWord: 'Pegasus', category: 'Fantasy' },
];

const CATEGORIES = ['All', 'Food', 'Animals', 'Sports', 'Places', 'Music', 'Nature', 'Space', 'School', 'Fantasy'];

const PLAYER_EMOJIS = ['🦊', '🐼', '🦁', '🐸', '🦄', '🐧', '🦋', '🐙', '🦖', '🐺', '🦝', '🦓'];

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const getRandomWordPair = (category = 'All') => {
  const pool = category === 'All' ? WORD_PAIRS : WORD_PAIRS.filter(p => p.category === category);
  return pool[Math.floor(Math.random() * pool.length)];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const PlayerChip = ({ player, size = 'md', highlight = false, votes = 0, showVotes = false, onClick, disabled }) => {
  const sizes = {
    sm: 'text-xl p-2',
    md: 'text-3xl p-3',
    lg: 'text-4xl p-4',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-1 rounded-2xl transition-all duration-200
        ${sizes[size]}
        ${highlight ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 scale-105' : 'bg-white/10 text-white hover:bg-white/20'}
        ${onClick && !disabled ? 'cursor-pointer active:scale-95' : 'cursor-default'}
        ${disabled ? 'opacity-60' : ''}
        border border-white/20
      `}
    >
      <span>{player.emoji}</span>
      <span className="text-xs font-semibold truncate max-w-[72px]">{player.name}</span>
      {showVotes && votes > 0 && (
        <span className="text-xs bg-red-500 text-white rounded-full px-2">{votes} vote{votes !== 1 ? 's' : ''}</span>
      )}
    </button>
  );
};

const ScoreBoard = ({ players }) => {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  return (
    <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
      <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">Scores</h3>
      <div className="flex flex-wrap gap-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
            <span>{i === 0 ? '👑' : p.emoji}</span>
            <span className="text-white text-sm font-semibold">{p.name}</span>
            <span className="text-yellow-300 font-bold text-sm">{p.score || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Game Component ──────────────────────────────────────────────────────

const WordImposterGame = ({ studentData, showToast }) => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState('home'); // home | nameEntry | lobby | wordReveal | clues | vote | results
  const [mode, setMode] = useState(null); // 'create' | 'join'
  const [nameInput, setNameInput] = useState(studentData?.name || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId] = useState(() => `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [wordRevealed, setWordRevealed] = useState(false);
  const [clueInput, setClueInput] = useState('');
  const [myVote, setMyVote] = useState(null);
  const [fb, setFb] = useState(null);
  const listenerRef = useRef(null);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  // ── Load Firebase ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const { database } = await import('../../utils/firebase');
      const { ref, set, onValue, update, off, get, remove } = await import('firebase/database');
      setFb({ database, ref, set, onValue, update, off, get, remove });
    };
    load();
  }, []);

  // ── Room listener ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `wordImposterRooms/${roomCode}`);
    const handler = fb.onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      setRoomData(data);

      const cur = screenRef.current;
      if (data.phase === 'wordReveal' && cur === 'lobby') {
        setWordRevealed(false);
        setScreen('wordReveal');
      }
      if (data.phase === 'clues' && (cur === 'lobby' || cur === 'wordReveal')) setScreen('clues');
      if (data.phase === 'vote' && cur === 'clues') setScreen('vote');
      if (data.phase === 'results' && cur === 'vote') setScreen('results');
      if (data.phase === 'lobby' && cur === 'results') {
        setScreen('lobby');
        setWordRevealed(false);
        setClueInput('');
        setMyVote(null);
      }
    });
    listenerRef.current = handler;
    return () => fb.off(rRef, 'value', handler);
  }, [roomCode, fb]);

  // ── Create room ────────────────────────────────────────────────────────────
  const createRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = generateRoomCode();
    await fb.set(fb.ref(fb.database, `wordImposterRooms/${code}`), {
      roomCode: code,
      phase: 'lobby',
      hostId: myId,
      createdAt: Date.now(),
      roundNumber: 0,
      players: {
        [myId]: { id: myId, name: nameInput.trim(), score: 0, emoji: PLAYER_EMOJIS[0], isHost: true }
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
    const snap = await fb.get(fb.ref(fb.database, `wordImposterRooms/${code}`));
    const data = snap.val();
    if (!data) { showToast?.('Room not found! Check the code.', 'error'); return; }
    if (data.phase !== 'lobby') { showToast?.('Game already started!', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 12) { showToast?.('Room is full!', 'error'); return; }
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${code}/players/${myId}`), {
      id: myId,
      name: nameInput.trim(),
      score: 0,
      emoji: PLAYER_EMOJIS[playerCount % PLAYER_EMOJIS.length],
      isHost: false
    });
    setRoomCode(code);
    setIsHost(false);
    setScreen('lobby');
  }, [fb, nameInput, roomCodeInput, myId, showToast]);

  // ── Start game (host only) ─────────────────────────────────────────────────
  const startGame = useCallback(async () => {
    if (!fb || !isHost || !roomData) return;
    const players = Object.values(roomData.players || {});
    if (players.length < 3) { showToast?.('Need at least 3 players to start!', 'error'); return; }
    const wordPair = getRandomWordPair(selectedCategory);
    const imposterIdx = Math.floor(Math.random() * players.length);
    const imposterId = players[imposterIdx].id;
    const clueOrder = [...players].sort(() => Math.random() - 0.5).map(p => p.id);
    // Clear clues/votes from any previous round
    const playerUpdates = {};
    players.forEach(p => {
      playerUpdates[`${p.id}/clue`] = null;
      playerUpdates[`${p.id}/vote`] = null;
    });
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players`), playerUpdates);
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), {
      phase: 'wordReveal',
      wordPair,
      imposterId,
      clueOrder,
      currentClueTurn: 0,
      results: null,
      roundNumber: (roomData.roundNumber || 0) + 1,
    });
  }, [fb, isHost, roomData, roomCode, selectedCategory, showToast]);

  // ── Advance to clues (host only) ───────────────────────────────────────────
  const startClues = useCallback(async () => {
    if (!fb || !isHost) return;
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), { phase: 'clues' });
  }, [fb, isHost, roomCode]);

  // ── Submit clue ────────────────────────────────────────────────────────────
  const submitClue = useCallback(async () => {
    const trimmed = clueInput.trim();
    if (!fb || !trimmed) { showToast?.('Type a one-word clue!', 'error'); return; }
    if (trimmed.includes(' ')) { showToast?.('One word only — no spaces!', 'error'); return; }
    const clueOrder = roomData?.clueOrder || Object.values(roomData?.players || {}).map(p => p.id);
    const currentClueTurn = roomData?.currentClueTurn || 0;
    const currentPlayerId = clueOrder[currentClueTurn];
    if (currentPlayerId && currentPlayerId !== myId) {
      showToast?.("It's not your turn yet!", 'error');
      return;
    }
    const normalizedClue = trimmed.toLowerCase();
    const existingClues = Object.values(roomData?.players || {})
      .filter(p => p.id !== myId && p.clue)
      .map(p => p.clue.toLowerCase());
    if (existingClues.includes(normalizedClue)) {
      showToast?.('That clue has already been used. Try a different word!', 'error');
      return;
    }
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players/${myId}`), { clue: trimmed });
    if (currentPlayerId) {
      const nextTurn = currentClueTurn + 1;
      const updates = {};
      if (nextTurn >= clueOrder.length) {
        updates.phase = 'vote';
      } else {
        updates.currentClueTurn = nextTurn;
      }
      await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), updates);
    }
    setClueInput('');
    showToast?.('Clue locked in! 🔒', 'success');
  }, [fb, clueInput, roomCode, myId, showToast, roomData]);

  // ── Keep clue turn valid (host): repair missing order / skip missing players ─
  useEffect(() => {
    if (!isHost || !roomData || roomData.phase !== 'clues' || !fb) return;
    const livePlayers = Object.values(roomData.players || {});
    if (livePlayers.length === 0) return;

    const liveIds = new Set(livePlayers.map(p => p.id));
    const existingOrder = Array.isArray(roomData.clueOrder) ? roomData.clueOrder : [];
    const filteredOrder = existingOrder.filter(id => liveIds.has(id));
    const missingIds = livePlayers.map(p => p.id).filter(id => !filteredOrder.includes(id));
    const repairedOrder = [...filteredOrder, ...missingIds];
    const currentTurn = Math.max(0, roomData.currentClueTurn || 0);

    // If order changed, save it.
    if (repairedOrder.length !== existingOrder.length || repairedOrder.some((id, i) => id !== existingOrder[i])) {
      fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), {
        clueOrder: repairedOrder,
        currentClueTurn: Math.min(currentTurn, Math.max(0, repairedOrder.length - 1)),
      });
      return;
    }

    // If current turn points to someone who already submitted, advance automatically.
    let nextTurn = currentTurn;
    while (nextTurn < repairedOrder.length) {
      const nextPlayer = livePlayers.find(p => p.id === repairedOrder[nextTurn]);
      if (!nextPlayer?.clue) break;
      nextTurn += 1;
    }

    if (nextTurn >= repairedOrder.length) {
      fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), { phase: 'vote' });
    } else if (nextTurn !== currentTurn) {
      fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), { currentClueTurn: nextTurn });
    }
  }, [isHost, roomData, fb, roomCode]);

  // ── Cast vote ──────────────────────────────────────────────────────────────
  const castVote = useCallback(async (targetId) => {
    if (!fb || myVote || targetId === myId) return;
    setMyVote(targetId);
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players/${myId}`), { vote: targetId });
  }, [fb, myVote, roomCode, myId]);

  // ── Auto-tally votes → results (host) ─────────────────────────────────────
  useEffect(() => {
    if (!isHost || !roomData || roomData.phase !== 'vote' || !fb) return;
    const players = Object.values(roomData.players || {});
    if (players.length === 0) return;
    const allVoted = players.every(p => p.vote);
    if (!allVoted) return;

    const voteCounts = {};
    players.forEach(p => {
      if (p.vote) voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1;
    });
    const maxVotes = Math.max(...Object.values(voteCounts));
    const topIds = Object.entries(voteCounts).filter(([, v]) => v === maxVotes).map(([k]) => k);
    const mostVotedId = topIds[Math.floor(Math.random() * topIds.length)];
    const imposterCaught = mostVotedId === roomData.imposterId;

    // Update scores
    const scoreUpdates = {};
    players.forEach(p => {
      if (imposterCaught && p.id !== roomData.imposterId) {
        scoreUpdates[`${p.id}/score`] = (p.score || 0) + 1;
      } else if (!imposterCaught && p.id === roomData.imposterId) {
        scoreUpdates[`${p.id}/score`] = (p.score || 0) + 3;
      }
    });
    fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players`), scoreUpdates);
    fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), {
      phase: 'results',
      results: { mostVotedId, imposterCaught, voteCounts }
    });
  }, [isHost, roomData?.phase, JSON.stringify(Object.values(roomData?.players || {}).map(p => p.vote)), roomCode, fb]);

  // ── Play again (host) ──────────────────────────────────────────────────────
  const playAgain = useCallback(async () => {
    if (!fb || !isHost) return;
    const players = Object.values(roomData?.players || {});
    const resetUpdates = {};
    players.forEach(p => {
      resetUpdates[`${p.id}/clue`] = null;
      resetUpdates[`${p.id}/vote`] = null;
    });
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players`), resetUpdates);
    await fb.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), {
      phase: 'lobby',
      wordPair: null,
      imposterId: null,
      results: null,
    });
    setWordRevealed(false);
    setClueInput('');
    setMyVote(null);
  }, [fb, isHost, roomData, roomCode]);

  // ── Leave room ─────────────────────────────────────────────────────────────
  const leaveRoom = useCallback(async () => {
    if (fb && roomCode) {
      await fb.remove(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players/${myId}`));
    }
    setScreen('home');
    setRoomCode('');
    setRoomData(null);
    setIsHost(false);
    setWordRevealed(false);
    setClueInput('');
    setMyVote(null);
  }, [fb, roomCode, myId]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const players = roomData ? Object.values(roomData.players || {}) : [];
  const myPlayerData = players.find(p => p.id === myId);
  const amIImposter = roomData?.imposterId === myId;
  const myWord = roomData?.wordPair
    ? (amIImposter ? 'IMPOSTER' : roomData.wordPair.realWord)
    : null;
  const imposterPlayer = players.find(p => p.id === roomData?.imposterId);
  const myClue = myPlayerData?.clue;
  const cluesSubmitted = players.filter(p => p.clue).length;
  const votesSubmitted = players.filter(p => p.vote).length;

  // ─────────────────────────────────────────────────────────────────────────
  // ── SCREENS ───────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
        {/* Background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['🕵️', '🔍', '❓', '👁️', '🎭', '🃏', '🔮', '⚡'].map((emoji, i) => (
            <span
              key={i}
              className="absolute text-4xl opacity-5 animate-pulse"
              style={{
                top: `${(i * 13) % 100}%`,
                left: `${(i * 17 + 7) % 100}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            >{emoji}</span>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-md w-full">
          {/* Logo */}
          <div className="mb-2">
            <div className="text-8xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>🕵️</div>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
              Word <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Imposter</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Everyone shares the same secret word — except one.<br />
              Find the imposter before they fool you!
            </p>
          </div>

          {/* How to play */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 mb-8 text-left text-sm text-white/80 space-y-2">
            <div className="flex gap-3 items-start"><span className="text-lg">🎯</span><span>Everyone gets the <strong className="text-white">same word</strong> — except the imposter, whose card only says <strong className="text-red-300">IMPOSTER</strong></span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">💬</span><span>Players say a <strong className="text-white">one-word clue</strong> about their word. The imposter must bluff!</span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">🗳️</span><span>Vote for who you think is the imposter</span></div>
            <div className="flex gap-3 items-start"><span className="text-lg">🏆</span><span>Catch the imposter → <strong className="text-green-300">everyone gets 1pt</strong>. Imposter escapes → <strong className="text-red-300">imposter gets 3pts</strong></span></div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setMode('create'); setScreen('nameEntry'); }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-5 rounded-2xl text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <button
            onClick={() => setScreen('home')}
            className="text-white/50 hover:text-white mb-8 flex items-center gap-2 transition-colors"
          >
            ← Back
          </button>

          <h2 className="text-3xl font-black text-white mb-2">
            {isJoin ? '🚪 Join a Room' : '🎮 Create a Room'}
          </h2>
          <p className="text-white/50 mb-8">{isJoin ? 'Enter the room code to jump in' : 'Give yourself a name to get started'}</p>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm font-semibold mb-2 block">Your Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={20}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>

            {isJoin && (
              <div>
                <label className="text-white/70 text-sm font-semibold mb-2 block">Room Code</label>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={e => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ABCD"
                  maxLength={4}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all uppercase"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all active:scale-95 mt-4"
            >
              {isJoin ? '🚪 Join Game' : '🚀 Create Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOBBY ──────────────────────────────────────────────────────────────────
  if (screen === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white">🎮 Lobby</h2>
            <button onClick={leaveRoom} className="text-white/40 hover:text-red-400 text-sm transition-colors">Leave</button>
          </div>

          {/* Room code */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6 text-center mb-4">
            <p className="text-white/50 text-sm mb-1">Room Code</p>
            <div className="text-5xl font-black text-white tracking-[0.3em] font-mono">{roomCode}</div>
            <p className="text-white/40 text-xs mt-2">Share this with your friends!</p>
          </div>

          {/* Players */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest">Players</h3>
              <span className="text-white/40 text-sm">{players.length} / 12</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {players.map(p => (
                <div key={p.id} className="flex flex-col items-center gap-1 bg-white/10 rounded-xl p-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="text-white text-xs font-semibold truncate w-full text-center">{p.name}</span>
                  {p.isHost && <span className="text-yellow-400 text-xs">👑 Host</span>}
                </div>
              ))}
              {players.length < 3 && (
                <div className="col-span-4 text-center text-white/30 text-sm py-2">
                  Need at least {3 - players.length} more player{3 - players.length !== 1 ? 's' : ''} to start
                </div>
              )}
            </div>
          </div>

          {/* Scores (if not first round) */}
          {roomData?.roundNumber > 0 && players.some(p => p.score > 0) && (
            <div className="mb-4">
              <ScoreBoard players={players} />
            </div>
          )}

          {/* Host controls */}
          {isHost && (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-4">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start / waiting */}
          {isHost ? (
            <button
              onClick={startGame}
              disabled={players.length < 3}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all active:scale-95"
            >
              🚀 Start Game
            </button>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2 animate-pulse">⏳</div>
              <p className="text-white/60">Waiting for the host to start…</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── WORD REVEAL ────────────────────────────────────────────────────────────
  if (screen === 'wordReveal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <p className="text-white/50 text-lg mb-8">Round {roomData?.roundNumber || 1}</p>

          {!wordRevealed ? (
            <>
              <div
                onClick={() => setWordRevealed(true)}
                className="bg-gradient-to-br from-purple-700 to-pink-700 rounded-3xl p-10 mb-6 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-purple-500/40 border border-purple-400/30"
              >
                <div className="text-6xl mb-4">🔒</div>
                <p className="text-white/70 text-lg">Tap to reveal your secret word</p>
                <p className="text-white/40 text-sm mt-2">Make sure nobody else can see your screen!</p>
              </div>
              <p className="text-white/30 text-sm">Category: <strong className="text-white/50">{roomData?.wordPair?.category}</strong></p>
            </>
          ) : (
            <>
              <div
                className={`rounded-3xl p-8 mb-6 shadow-2xl border ${
                  amIImposter
                    ? 'bg-gradient-to-br from-red-800 to-red-950 border-red-500/50 shadow-red-500/30'
                    : 'bg-gradient-to-br from-indigo-700 to-purple-900 border-purple-400/30 shadow-purple-500/30'
                }`}
              >
                {amIImposter ? (
                  <>
                    <div className="text-5xl mb-3">🕵️</div>
                    <div className="bg-red-500/20 rounded-xl px-3 py-1 inline-block mb-3">
                      <span className="text-red-300 text-sm font-bold uppercase tracking-widest">You are the Imposter!</span>
                    </div>
                    <p className="text-white/60 text-sm mb-4">You don't get the secret word. Bluff your way through!</p>
                    <div className="text-4xl font-black text-white mb-1">{myWord}</div>
                    <p className="text-red-300/70 text-xs mt-2">⚠️ The others have a different word. Don't reveal yours!</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-3">🎯</div>
                    <div className="bg-purple-500/20 rounded-xl px-3 py-1 inline-block mb-3">
                      <span className="text-purple-300 text-sm font-bold uppercase tracking-widest">Your Secret Word</span>
                    </div>
                    <p className="text-white/60 text-sm mb-4">Give a clever one-word clue — not too obvious, but enough for others to know you're legit!</p>
                    <div className="text-4xl font-black text-white mb-1">{myWord}</div>
                    <p className="text-purple-300/70 text-xs mt-2">✅ Everyone else (except one imposter) has this word</p>
                  </>
                )}
              </div>

              <p className="text-white/40 text-sm mb-4">Category: <strong className="text-white/50">{roomData?.wordPair?.category}</strong></p>

              {isHost ? (
                <button
                  onClick={startClues}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-95 hover:from-purple-400 hover:to-pink-400"
                >
                  🎤 Everyone's Ready — Start Clues
                </button>
              ) : (
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1 animate-pulse">⏳</div>
                  <p className="text-white/50 text-sm">Waiting for host to start the clue round…</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ── CLUES ──────────────────────────────────────────────────────────────────
  if (screen === 'clues') {
    const myClueSubmitted = !!myPlayerData?.clue;
    const clueOrder = roomData?.clueOrder || [];
    const currentClueTurn = roomData?.currentClueTurn || 0;
    const currentCluePlayerId = clueOrder[currentClueTurn];
    const currentCluePlayer = players.find(p => p.id === currentCluePlayerId);
    const isMyTurnForClue = currentCluePlayerId === myId;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white">💬 Clue Time!</h2>
            <p className="text-white/50 mt-1">Give ONE word that relates to your secret word</p>
            <p className="text-white/70 mt-2 text-sm">
              Turn: <strong className="text-white">{currentCluePlayer?.name || '—'}</strong>
            </p>
            <div className="mt-3 bg-white/10 rounded-full px-4 py-1.5 inline-flex items-center gap-2">
              <span className="text-green-400 font-bold">{cluesSubmitted}</span>
              <span className="text-white/50">/ {players.length} clues in</span>
            </div>
          </div>

          {/* Word reminder */}
          <div className={`rounded-2xl p-4 mb-5 border ${amIImposter ? 'bg-red-900/40 border-red-500/30' : 'bg-purple-900/40 border-purple-500/30'}`}>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Your word</p>
            <p className="text-white font-black text-2xl">{myWord}</p>
            {amIImposter && <p className="text-red-300 text-xs mt-1">🕵️ You're the imposter — bluff wisely!</p>}
          </div>

          {/* Clue input */}
          {!myClueSubmitted ? (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-5">
              <label className="text-white/70 text-sm font-semibold mb-2 block">Your One-Word Clue</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clueInput}
                  onChange={e => setClueInput(e.target.value.replace(/\s/g, ''))}
                  placeholder="e.g. Hot, Round, Delicious…"
                  maxLength={30}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-purple-400 transition-all"
                  onKeyDown={e => e.key === 'Enter' && submitClue()}
                  disabled={!isMyTurnForClue}
                />
                <button
                  onClick={submitClue}
                  disabled={!isMyTurnForClue}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-5 rounded-xl text-lg hover:from-purple-400 hover:to-pink-400 transition-all active:scale-95"
                >
                  Lock
                </button>
              </div>
              {!isMyTurnForClue && (
                <p className="text-white/40 text-xs mt-2">Please wait for your turn.</p>
              )}
            </div>
          ) : (
            <div className="bg-green-900/40 border border-green-500/30 rounded-2xl p-4 mb-5 text-center">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-green-300 font-bold">Your clue: <span className="text-white">{myPlayerData?.clue}</span></p>
              <p className="text-white/40 text-sm mt-1">Waiting for everyone else…</p>
            </div>
          )}

          {/* All clues so far */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-4">
            <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">Clues So Far</h3>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-white font-semibold flex-1">{p.name}</span>
                  {p.id === currentCluePlayerId && !p.clue && (
                    <span className="text-yellow-300 text-xs font-bold uppercase tracking-wide">🎤 Their turn</span>
                  )}
                  {p.clue ? (
                    <span className="bg-purple-500/30 text-purple-200 font-bold px-3 py-1 rounded-full text-sm">{p.clue}</span>
                  ) : (
                    <span className="text-white/30 text-sm animate-pulse">thinking…</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Host: force advance */}
          {isHost && (
            <button
              onClick={() => fb?.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), { phase: 'vote' })}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/60 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all"
            >
              Skip to Voting (host override)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── VOTE ───────────────────────────────────────────────────────────────────
  if (screen === 'vote') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-white mb-2">🗳️ Who's the Imposter?</h2>
            <p className="text-white/50">Tap to cast your vote — you can't vote for yourself!</p>
            <div className="mt-3 bg-white/10 rounded-full px-4 py-1.5 inline-flex items-center gap-2">
              <span className="text-yellow-400 font-bold">{votesSubmitted}</span>
              <span className="text-white/50">/ {players.length} voted</span>
            </div>
          </div>

          {/* Clue summary */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-6">
            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">All Clues</h3>
            <div className="space-y-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xl w-7 text-center">{p.emoji}</span>
                  <span className="text-white font-semibold w-24 truncate">{p.name}</span>
                  <span className="flex-1 text-center bg-white/10 rounded-full px-3 py-1 text-sm text-white/80 font-mono">
                    {p.clue || <span className="text-white/30">—</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vote grid */}
          {!myVote ? (
            <>
              <p className="text-white/50 text-center text-sm mb-4">Vote for who you think is faking it:</p>
              <div className="grid grid-cols-3 gap-3">
                {players.map(p => (
                  <button
                    key={p.id}
                    onClick={() => castVote(p.id)}
                    disabled={p.id === myId}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border
                      ${p.id === myId
                        ? 'opacity-30 cursor-not-allowed bg-white/5 border-white/10'
                        : 'bg-white/10 hover:bg-red-600/40 hover:border-red-400/50 border-white/20 cursor-pointer active:scale-95 hover:scale-105'}
                    `}
                  >
                    <span className="text-4xl">{p.emoji}</span>
                    <span className="text-white font-semibold text-sm text-center leading-tight">{p.name}</span>
                    {p.id === myId && <span className="text-white/30 text-xs">You</span>}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-green-900/40 border border-green-500/30 rounded-2xl p-6 text-center mb-4">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-300 font-bold text-lg">Vote cast!</p>
              <p className="text-white/50 text-sm mt-1">
                You voted for <strong className="text-white">{players.find(p => p.id === myVote)?.name}</strong>
              </p>
              <p className="text-white/30 text-sm mt-3 animate-pulse">Waiting for results…</p>
            </div>
          )}

          {/* Host force results */}
          {isHost && votesSubmitted > 0 && (
            <button
              onClick={() => {
                const voteCounts = {};
                players.forEach(p => { if (p.vote) voteCounts[p.vote] = (voteCounts[p.vote] || 0) + 1; });
                const maxVotes = Math.max(...Object.values(voteCounts), 0);
                const topIds = Object.entries(voteCounts).filter(([, v]) => v === maxVotes).map(([k]) => k);
                const mostVotedId = topIds[Math.floor(Math.random() * topIds.length)];
                const imposterCaught = mostVotedId === roomData.imposterId;
                const scoreUpdates = {};
                players.forEach(p => {
                  if (imposterCaught && p.id !== roomData.imposterId) scoreUpdates[`${p.id}/score`] = (p.score || 0) + 1;
                  else if (!imposterCaught && p.id === roomData.imposterId) scoreUpdates[`${p.id}/score`] = (p.score || 0) + 3;
                });
                if (Object.keys(scoreUpdates).length > 0) fb?.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}/players`), scoreUpdates);
                fb?.update(fb.ref(fb.database, `wordImposterRooms/${roomCode}`), {
                  phase: 'results',
                  results: { mostVotedId, imposterCaught, voteCounts }
                });
              }}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white/60 hover:text-white font-semibold py-3 rounded-xl text-sm transition-all"
            >
              Show Results Now (host override)
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (screen === 'results') {
    const results = roomData?.results;
    const imposterCaught = results?.imposterCaught;
    const voteCounts = results?.voteCounts || {};
    const mostVotedPlayer = players.find(p => p.id === results?.mostVotedId);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
        <div className="max-w-lg mx-auto">
          {/* Big result */}
          <div className={`rounded-3xl p-8 mb-6 text-center shadow-2xl border ${
            imposterCaught
              ? 'bg-gradient-to-br from-green-800 to-emerald-950 border-green-500/30 shadow-green-500/20'
              : 'bg-gradient-to-br from-red-800 to-red-950 border-red-500/30 shadow-red-500/20'
          }`}>
            <div className="text-7xl mb-4">{imposterCaught ? '🎉' : '🕵️'}</div>
            <h2 className="text-4xl font-black text-white mb-2">
              {imposterCaught ? 'Imposter Caught!' : 'Imposter Escaped!'}
            </h2>
            {imposterCaught ? (
              <p className="text-green-300 text-lg">The crew wins! Everyone gets <strong>+1 point</strong></p>
            ) : (
              <p className="text-red-300 text-lg">The imposter gets away with <strong>+3 points</strong>!</p>
            )}
          </div>

          {/* Imposter reveal */}
          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 mb-4">
            <h3 className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">The Reveal</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{imposterPlayer?.emoji}</span>
              <div>
                <p className="text-white font-bold text-lg">{imposterPlayer?.name} <span className="text-red-400 text-sm">was the Imposter</span></p>
                <p className="text-white/50 text-sm mt-1">
                  Real word: <strong className="text-green-300">{roomData?.wordPair?.realWord}</strong>
                  <span className="mx-2">·</span>
                  Imposter's card: <strong className="text-red-300">IMPOSTER</strong>
                </p>
              </div>
            </div>

            {/* Vote breakdown */}
            <div className="space-y-2 mt-3">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Vote Results</p>
              {players.map(p => {
                const voteCount = voteCounts[p.id] || 0;
                const maxV = Math.max(...Object.values(voteCounts), 0);
                const isImposter = p.id === roomData?.imposterId;
                return (
                  <div key={p.id} className="flex items-center gap-2">
                    <span className="text-lg w-7 text-center">{p.emoji}</span>
                    <span className="text-white text-sm w-20 truncate">{p.name}</span>
                    {isImposter && <span className="text-red-400 text-xs px-2 py-0.5 bg-red-500/20 rounded-full">🕵️ Imposter</span>}
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${voteCount === maxV && voteCount > 0 ? 'bg-red-500' : 'bg-white/30'}`}
                        style={{ width: maxV > 0 ? `${(voteCount / maxV) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-white/60 text-sm w-6 text-right">{voteCount}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoreboard */}
          <div className="mb-6">
            <ScoreBoard players={players} />
          </div>

          {/* Actions */}
          {isHost ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={playAgain}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold py-4 rounded-xl text-base shadow-lg transition-all active:scale-95"
              >
                🔄 Play Again
              </button>
              <button
                onClick={leaveRoom}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-xl text-base transition-all active:scale-95"
              >
                🚪 End Game
              </button>
            </div>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl mb-1 animate-pulse">⏳</div>
              <p className="text-white/50">Waiting for host to start the next round…</p>
              <button onClick={leaveRoom} className="mt-3 text-white/30 hover:text-white/60 text-sm transition-colors">Leave game</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default WordImposterGame;
