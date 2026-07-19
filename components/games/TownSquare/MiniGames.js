// components/games/TownSquare/MiniGames.js
// ─────────────────────────────────────────────────────────────────────────────
// Quick head-to-head minigames students can challenge each other to inside
// Town Square: Rock Paper Scissors, Coin Flip, Tic Tac Toe, Connect Four and
// Quick Draw (reaction duel). All state lives at
// worldRooms/{classCode}/challenges/{challengeId} in the Realtime Database.
//
// Concurrency rule of thumb used throughout this file: each client is only
// ever allowed to write fields keyed by ITS OWN id (no race), or uses a
// Firebase transaction for any shared cell/slot that both players could touch
// (tic-tac-toe cell, connect-4 column, the coin flip trigger). Derived
// results (who won a round) are computed identically and locally by both
// clients from the shared inputs — never written to the DB — so there's
// nothing to race over.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { database } from '../../../utils/firebase';
import { ref, onValue, update, runTransaction, remove } from 'firebase/database';
import { RPS_THROWS, COIN_HEADS_IMG, COIN_TAILS_IMG } from './townSquareConfig';

const pathFor = (classCode, challengeId) => `worldRooms/${classCode}/challenges/${challengeId}`;

// ── Shared shell every minigame renders inside ──────────────────────────────
const Shell = ({ title, icon, iconSrc, opponentName, onForfeit, children }) => (
  <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
    <motion.div
      initial={{ scale: 0.85, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-md p-6 text-white relative overflow-hidden"
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" className="absolute -top-8 -right-8 w-32 h-32 opacity-10 select-none object-contain" />
      ) : (
        <div className="absolute -top-10 -right-10 text-8xl opacity-10 select-none">{icon}</div>
      )}
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="text-xl font-extrabold flex items-center gap-2">
          {iconSrc ? <img src={iconSrc} alt="" className="w-7 h-7 object-contain" /> : <span className="text-2xl">{icon}</span>} {title}
        </h3>
        <button
          onClick={onForfeit}
          className="text-white/50 hover:text-white text-sm bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors"
        >
          ✕ Leave
        </button>
      </div>
      <p className="text-white/60 text-sm mb-4">vs <span className="text-white font-semibold">{opponentName}</span></p>
      {children}
    </motion.div>
  </div>
);

const ResultBanner = ({ result, myId }) => {
  if (!result) return null;
  const mine = result.winnerId === myId;
  const draw = result.winnerId === 'draw';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`text-center rounded-2xl p-4 mb-4 font-bold text-lg ${
        draw ? 'bg-slate-600/40 text-slate-200' : mine ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
      }`}
    >
      {draw ? "🤝 It's a draw!" : mine ? '🏆 You won!' : `${result.winnerName} won!`}
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROCK PAPER SCISSORS
// ═══════════════════════════════════════════════════════════════════════════
const THROWS = RPS_THROWS;
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

function RPS({ classCode, challengeId, myId, myName, opponentId, opponentName, isHost, onForfeit }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    const r = ref(database, `${pathFor(classCode, challengeId)}/state`);
    if (isHost) update(r, { throws: {}, wins: { [myId]: 0, [opponentId]: 0 }, round: 1 }).catch(() => {});
    return onValue(r, (snap) => setState(snap.val() || {}));
  }, [classCode, challengeId]);

  const throws = (state || {}).throws || {};
  const wins = (state || {}).wins || {};
  const myThrow = throws[myId];
  const oppThrow = throws[opponentId];
  const bothIn = myThrow && oppThrow;

  let result = null;
  if (bothIn) {
    if (myThrow === oppThrow) result = { winnerId: 'draw' };
    else if (beats[myThrow] === oppThrow) result = { winnerId: myId, winnerName: myName };
    else result = { winnerId: opponentId, winnerName: opponentName };
  }

  const matchOver = (wins[myId] >= 2 || wins[opponentId] >= 2) && !bothIn;

  const throwHand = (id) => {
    if (myThrow || matchOver) return;
    update(ref(database, `${pathFor(classCode, challengeId)}/state/throws`), { [myId]: id }).catch(() => {});
  };

  const nextRound = useCallback(() => {
    if (!isHost) return;
    const newWins = { ...wins };
    if (result?.winnerId === myId || result?.winnerId === opponentId) {
      newWins[result.winnerId] = (newWins[result.winnerId] || 0) + 1;
    }
    update(ref(database, `${pathFor(classCode, challengeId)}/state`), {
      throws: {},
      wins: newWins,
      round: (state?.round || 1) + 1,
    }).catch(() => {});
  }, [isHost, wins, result, myId, opponentId, state, classCode, challengeId]);

  useEffect(() => {
    if (bothIn && isHost) {
      const t = setTimeout(nextRound, 2200);
      return () => clearTimeout(t);
    }
  }, [bothIn, isHost, nextRound]);

  if (!state) return <div className="text-center py-10 text-white/50">Loading…</div>;

  return (
    <Shell title="Rock Paper Scissors" icon="✊" iconSrc="/game icons/Town Square/013-rock-paper-scissors.svg" opponentName={opponentName} onForfeit={onForfeit}>
      <div className="flex justify-center gap-6 mb-5 text-sm">
        <div className="bg-white/5 rounded-xl px-4 py-2 text-center">
          <div className="text-white/50 text-xs">You</div>
          <div className="text-2xl font-black text-emerald-400">{wins[myId] || 0}</div>
        </div>
        <div className="bg-white/5 rounded-xl px-4 py-2 text-center">
          <div className="text-white/50 text-xs">{opponentName}</div>
          <div className="text-2xl font-black text-rose-400">{wins[opponentId] || 0}</div>
        </div>
      </div>

      {bothIn ? (
        <div className="flex items-center justify-center gap-8 mb-4">
          <img src={THROWS.find((t) => t.id === myThrow)?.img} alt={myThrow} className="w-16 h-16 object-contain" />
          <div className="text-2xl text-white/40">vs</div>
          <img src={THROWS.find((t) => t.id === oppThrow)?.img} alt={oppThrow} className="w-16 h-16 object-contain" />
        </div>
      ) : (
        <div className="text-center text-white/60 mb-4 h-16 flex items-center justify-center">
          {myThrow ? 'Waiting for opponent…' : 'Pick your throw!'}
        </div>
      )}

      <ResultBanner result={result} myId={myId} />

      {matchOver ? (
        <div className="text-center">
          <div className="text-xl font-bold mb-4">
            {wins[myId] > wins[opponentId] ? '🏆 You won the match!' : '😅 They won the match!'}
          </div>
          <button onClick={() => isHost && nextRoundReset(classCode, challengeId, myId, opponentId)} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold w-full">
            Rematch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {THROWS.map((t) => (
            <button
              key={t.id}
              disabled={!!myThrow}
              onClick={() => throwHand(t.id)}
              className={`py-4 rounded-2xl border-2 transition-all flex items-center justify-center ${
                myThrow === t.id ? 'border-emerald-400 bg-emerald-500/20 scale-105' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105'
              } ${myThrow && myThrow !== t.id ? 'opacity-30' : ''}`}
            >
              <img src={t.img} alt={t.id} className="w-10 h-10 object-contain" />
            </button>
          ))}
        </div>
      )}
    </Shell>
  );
}
function nextRoundReset(classCode, challengeId, myId, opponentId) {
  update(ref(database, `${pathFor(classCode, challengeId)}/state`), {
    throws: {}, wins: { [myId]: 0, [opponentId]: 0 }, round: 1,
  }).catch(() => {});
}

// ═══════════════════════════════════════════════════════════════════════════
// COIN FLIP
// ═══════════════════════════════════════════════════════════════════════════
function CoinFlip({ classCode, challengeId, myId, myName, opponentId, opponentName, isHost, onForfeit }) {
  const [state, setState] = useState(null);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    const r = ref(database, `${pathFor(classCode, challengeId)}/state`);
    if (isHost) update(r, { callerId: myId, call: null, result: null }).catch(() => {});
    return onValue(r, (snap) => setState(snap.val() || {}));
  }, [classCode, challengeId]);

  if (!state) return <div className="text-center py-10 text-white/50">Loading…</div>;

  const callerId = state.callerId || opponentId;
  const isCaller = callerId === myId;
  const callerName = isCaller ? myName : opponentName;

  const makeCall = (side) => {
    if (!isCaller || state.call) return;
    update(ref(database, `${pathFor(classCode, challengeId)}/state`), { call: side }).catch(() => {});
  };

  const flip = () => {
    if (isCaller || state.result || flipping) return;
    setFlipping(true);
    runTransaction(ref(database, `${pathFor(classCode, challengeId)}/state/result`), (cur) => {
      if (cur) return cur;
      return Math.random() < 0.5 ? 'heads' : 'tails';
    }).finally(() => setTimeout(() => setFlipping(false), 1200));
  };

  const result = state.result;
  const won = result && state.call === result;
  const winnerId = result ? (won ? callerId : (callerId === myId ? opponentId : myId)) : null;
  const winnerName = winnerId === myId ? myName : opponentName;

  return (
    <Shell title="Coin Flip" icon="🪙" iconSrc={COIN_HEADS_IMG} opponentName={opponentName} onForfeit={onForfeit}>
      <div className="text-center py-6">
        <motion.div
          animate={result || flipping ? { rotateY: [0, 1440] } : {}}
          transition={{ duration: 1.1 }}
          className="mb-4 inline-block"
        >
          <img src={result === 'tails' ? COIN_TAILS_IMG : COIN_HEADS_IMG} alt="" className="w-24 h-24 object-contain drop-shadow-lg" />
        </motion.div>
        <div className="text-white/60 text-sm mb-4">
          {!state.call && isCaller && 'Call it in the air!'}
          {!state.call && !isCaller && `Waiting for ${callerName} to call heads or tails…`}
          {state.call && !result && isCaller && `You called ${state.call}. Waiting for the flip…`}
          {state.call && !result && !isCaller && `${callerName} called ${state.call}. Flip when ready!`}
        </div>

        {!state.call && isCaller && (
          <div className="flex gap-3 justify-center">
            <button onClick={() => makeCall('heads')} className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-xl font-bold">Heads</button>
            <button onClick={() => makeCall('tails')} className="bg-slate-600 hover:bg-slate-500 px-6 py-3 rounded-xl font-bold">Tails</button>
          </div>
        )}

        {state.call && !result && !isCaller && (
          <button onClick={flip} disabled={flipping} className="bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl font-bold text-lg disabled:opacity-50">
            {flipping ? 'Flipping…' : '🪙 Flip the Coin'}
          </button>
        )}

        {result && (
          <>
            <div className="text-2xl font-black mb-3 capitalize">{result}!</div>
            <ResultBanner result={{ winnerId, winnerName }} myId={myId} />
            {isHost && (
              <button onClick={() => update(ref(database, `${pathFor(classCode, challengeId)}/state`), { callerId: opponentId === state.callerId ? myId : opponentId, call: null, result: null })} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold w-full mt-2">
                Rematch (swap caller)
              </button>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIC TAC TOE
// ─────────────────────────────────────────────────────────────────────────
// NOTE: board is stored as a plain 9-character STRING ('.' = empty), never a
// JS array. The Realtime Database silently drops `null` entries and can
// re-hydrate a sparse array as a plain object on read (e.g. {2:"X"} instead
// of [null,null,"X",...]), which broke `.every()`/`.map()` calls the first
// time a square was played. Strings sidestep that class of bug entirely.
// ═══════════════════════════════════════════════════════════════════════════
const TTT_LINES = [
  [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6],
];
const TTT_EMPTY = '.'.repeat(9);
function tttWinner(board) {
  for (const [a,b,c] of TTT_LINES) {
    if (board[a] !== '.' && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (!board.includes('.')) return 'draw';
  return null;
}

function TicTacToe({ classCode, challengeId, myId, myName, opponentId, opponentName, isHost, onForfeit }) {
  const [state, setState] = useState(null);
  const mySymbol = isHost ? 'X' : 'O';
  const oppSymbol = isHost ? 'O' : 'X';

  useEffect(() => {
    const r = ref(database, `${pathFor(classCode, challengeId)}/state`);
    if (isHost) update(r, { board: TTT_EMPTY, turn: 'X' }).catch(() => {});
    return onValue(r, (snap) => setState(snap.val() || {}));
  }, [classCode, challengeId]);

  const board = typeof state?.board === 'string' ? state.board : TTT_EMPTY;
  const winner = tttWinner(board);
  const myTurn = state?.turn === mySymbol && !winner;

  const play = (i) => {
    if (!myTurn || board[i] !== '.') return;
    runTransaction(ref(database, `${pathFor(classCode, challengeId)}/state`), (cur) => {
      if (!cur) return cur;
      const curBoard = typeof cur.board === 'string' ? cur.board : TTT_EMPTY;
      if (curBoard[i] !== '.' || cur.turn !== mySymbol) return cur; // already taken / not our turn
      const chars = curBoard.split('');
      chars[i] = mySymbol;
      return { ...cur, board: chars.join(''), turn: mySymbol === 'X' ? 'O' : 'X' };
    });
  };

  const restart = () => update(ref(database, `${pathFor(classCode, challengeId)}/state`), { board: TTT_EMPTY, turn: 'X' }).catch(() => {});

  if (!state) return <div className="text-center py-10 text-white/50">Loading…</div>;

  const winnerId = winner === 'draw' ? 'draw' : winner === mySymbol ? myId : winner === oppSymbol ? opponentId : null;

  return (
    <Shell title="Tic Tac Toe" icon="⭕" opponentName={opponentName} onForfeit={onForfeit}>
      <div className="text-center text-sm text-white/60 mb-3">
        You are <span className="font-bold text-white">{mySymbol}</span> {!winner && (myTurn ? '— your turn!' : `— waiting for ${opponentName}…`)}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 max-w-[240px] mx-auto">
        {board.split('').map((cell, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            disabled={!myTurn || cell !== '.'}
            className="aspect-square bg-white/5 hover:bg-white/10 rounded-xl text-4xl font-black flex items-center justify-center border border-white/10 disabled:cursor-default"
          >
            <span className={cell === 'X' ? 'text-cyan-400' : 'text-pink-400'}>{cell !== '.' ? cell : ''}</span>
          </button>
        ))}
      </div>
      {winner && (
        <>
          <ResultBanner result={{ winnerId, winnerName: winnerId === myId ? myName : opponentName }} myId={myId} />
          {isHost && <button onClick={restart} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold w-full">Rematch</button>}
        </>
      )}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CONNECT FOUR — grid is also stored as a single 42-char STRING (row-major,
// '.' = empty) for the same reason described above for Tic Tac Toe.
// ═══════════════════════════════════════════════════════════════════════════
const C4_COLS = 7, C4_ROWS = 6;
const C4_EMPTY = '.'.repeat(C4_ROWS * C4_COLS);
function c4Winner(grid) {
  const get = (r, c) => (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS ? grid[r * C4_COLS + c] : null);
  for (let r = 0; r < C4_ROWS; r++) {
    for (let c = 0; c < C4_COLS; c++) {
      const v = get(r, c);
      if (!v || v === '.') continue;
      const dirs = [[0,1],[1,0],[1,1],[1,-1]];
      for (const [dr,dc] of dirs) {
        if ([1,2,3].every((k) => get(r+dr*k, c+dc*k) === v)) return v;
      }
    }
  }
  if (!grid.includes('.')) return 'draw';
  return null;
}

function ConnectFour({ classCode, challengeId, myId, myName, opponentId, opponentName, isHost, onForfeit }) {
  const [state, setState] = useState(null);
  const mySymbol = isHost ? 'R' : 'Y';

  useEffect(() => {
    const r = ref(database, `${pathFor(classCode, challengeId)}/state`);
    if (isHost) update(r, { grid: C4_EMPTY, turn: 'R' }).catch(() => {});
    return onValue(r, (snap) => setState(snap.val() || {}));
  }, [classCode, challengeId]);

  const grid = typeof state?.grid === 'string' ? state.grid : C4_EMPTY;
  const winner = c4Winner(grid);
  const myTurn = state?.turn === mySymbol && !winner;

  const drop = (col) => {
    if (!myTurn) return;
    runTransaction(ref(database, `${pathFor(classCode, challengeId)}/state`), (cur) => {
      if (!cur || cur.turn !== mySymbol) return cur;
      const curGrid = typeof cur.grid === 'string' ? cur.grid : C4_EMPTY;
      let row = -1;
      for (let r = C4_ROWS - 1; r >= 0; r--) { if (curGrid[r * C4_COLS + col] === '.') { row = r; break; } }
      if (row === -1) return cur; // column full
      const chars = curGrid.split('');
      chars[row * C4_COLS + col] = mySymbol;
      return { ...cur, grid: chars.join(''), turn: mySymbol === 'R' ? 'Y' : 'R' };
    });
  };

  const restart = () => update(ref(database, `${pathFor(classCode, challengeId)}/state`), { grid: C4_EMPTY, turn: 'R' }).catch(() => {});

  if (!state) return <div className="text-center py-10 text-white/50">Loading…</div>;

  const winnerId = winner === 'draw' ? 'draw' : winner === mySymbol ? myId : winner ? opponentId : null;

  return (
    <Shell title="Connect Four" icon="🔴" opponentName={opponentName} onForfeit={onForfeit}>
      <div className="text-center text-sm text-white/60 mb-3">
        You are <span className={mySymbol === 'R' ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>{mySymbol === 'R' ? 'Red' : 'Yellow'}</span>
        {!winner && (myTurn ? ' — your turn!' : ` — waiting for ${opponentName}…`)}
      </div>
      <div className="bg-blue-900/40 rounded-2xl p-2 mb-4 mx-auto" style={{ width: 'fit-content' }}>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: C4_ROWS }, (_, r) => r).map((r) => Array.from({ length: C4_COLS }, (_, c) => c).map((c) => {
            const cell = grid[r * C4_COLS + c];
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => drop(c)}
                disabled={!myTurn}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-900/60 flex items-center justify-center disabled:cursor-default"
              >
                {cell !== '.' && (
                  <span
                    className="w-6 h-6 md:w-7 md:h-7 rounded-full block"
                    style={{ background: cell === 'R' ? '#ef4444' : '#facc15' }}
                  />
                )}
              </button>
            );
          }))}
        </div>
      </div>
      {winner && (
        <>
          <ResultBanner result={{ winnerId, winnerName: winnerId === myId ? myName : opponentName }} myId={myId} />
          {isHost && <button onClick={restart} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold w-full">Rematch</button>}
        </>
      )}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK DRAW — reaction duel
// ═══════════════════════════════════════════════════════════════════════════
function QuickDraw({ classCode, challengeId, myId, myName, opponentId, opponentName, isHost, onForfeit }) {
  const [state, setState] = useState(null);
  const startedAt = useRef(null);

  useEffect(() => {
    const r = ref(database, `${pathFor(classCode, challengeId)}/state`);
    if (isHost) {
      const delay = 1500 + Math.random() * 2500;
      const goAt = Date.now() + delay;
      update(r, { taps: {}, goAt, phase: 'waiting' }).catch(() => {});
    }
    return onValue(r, (snap) => setState(snap.val() || {}));
  }, [classCode, challengeId]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(t);
  }, []);

  if (!state) return <div className="text-center py-10 text-white/50">Loading…</div>;
  const goAt = state.goAt || 0;
  const isGo = now >= goAt;
  const taps = state.taps || {};
  const myTap = taps[myId];
  const oppTap = taps[opponentId];

  const tap = () => {
    if (myTap !== undefined) return;
    if (!isGo) {
      // false start
      update(ref(database, `${pathFor(classCode, challengeId)}/state/taps`), { [myId]: -1 }).catch(() => {});
      return;
    }
    update(ref(database, `${pathFor(classCode, challengeId)}/state/taps`), { [myId]: Date.now() - goAt }).catch(() => {});
  };

  let result = null;
  if (myTap !== undefined && oppTap !== undefined) {
    const myFalse = myTap === -1, oppFalse = oppTap === -1;
    if (myFalse && oppFalse) result = { winnerId: 'draw' };
    else if (myFalse) result = { winnerId: opponentId, winnerName: opponentName };
    else if (oppFalse) result = { winnerId: myId, winnerName: myName };
    else if (myTap < oppTap) result = { winnerId: myId, winnerName: myName };
    else if (oppTap < myTap) result = { winnerId: opponentId, winnerName: opponentName };
    else result = { winnerId: 'draw' };
  }

  const restart = () => {
    const delay = 1500 + Math.random() * 2500;
    update(ref(database, `${pathFor(classCode, challengeId)}/state`), { taps: {}, goAt: Date.now() + delay, phase: 'waiting' }).catch(() => {});
  };

  return (
    <Shell title="Quick Draw" icon="⚡" opponentName={opponentName} onForfeit={onForfeit}>
      <button
        onClick={tap}
        disabled={myTap !== undefined || !!result}
        className={`w-full rounded-2xl py-16 text-3xl font-black mb-4 transition-colors ${
          isGo ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-600'
        } disabled:opacity-70`}
      >
        {result ? '—' : isGo ? '⚡ TAP NOW!' : 'Wait for it…'}
      </button>
      {myTap !== undefined && myTap !== -1 && !result && <div className="text-center text-white/60 text-sm mb-3">You tapped in {myTap}ms — waiting for {opponentName}…</div>}
      {myTap === -1 && !result && <div className="text-center text-rose-300 text-sm mb-3">Too soon! Waiting for {opponentName}…</div>}
      {result && (
        <>
          <ResultBanner result={result} myId={myId} />
          <div className="text-center text-white/50 text-xs mb-3">
            {myTap === -1 ? 'You: false start' : `You: ${myTap}ms`} · {oppTap === -1 ? `${opponentName}: false start` : `${opponentName}: ${oppTap}ms`}
          </div>
          {isHost && <button onClick={restart} className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold w-full">Rematch</button>}
        </>
      )}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════
const GAME_COMPONENTS = {
  rps: RPS,
  coinflip: CoinFlip,
  tictactoe: TicTacToe,
  connect4: ConnectFour,
  quickdraw: QuickDraw,
};

export default function ChallengeOverlay({ classCode, challengeId, game, myId, myName, opponentId, opponentName, isHost, onClose }) {
  const Comp = GAME_COMPONENTS[game];
  if (!Comp) return null;

  const forfeit = () => {
    remove(ref(database, pathFor(classCode, challengeId))).catch(() => {});
    onClose?.();
  };

  return (
    <AnimatePresence>
      <Comp
        classCode={classCode}
        challengeId={challengeId}
        myId={myId}
        myName={myName}
        opponentId={opponentId}
        opponentName={opponentName}
        isHost={isHost}
        onForfeit={forfeit}
      />
    </AnimatePresence>
  );
}
