// components/games/ChessGame.js — Full 2-player multiplayer Chess
// Features: Pawn colour fix · Timed mode · Firebase class leaderboard · Tournament mode
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Chess Engine (pure functions) ────────────────────────────────────────────
const INIT_BOARD = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];
const INIT_CASTLING = { wK: true, wQ: true, bK: true, bQ: true };

const pc  = p => p?.[0];
const pt  = p => p?.[1];
const opp = c => c === 'w' ? 'b' : 'w';
const inB = (r,c) => r>=0 && r<8 && c>=0 && c<8;
const cloneB = b => b.map(row=>[...row]);

// ── FIX: separate white (outline) and black (filled) unicode chess symbols ──
// Previously all pieces used black (filled) symbols and relied on CSS colour,
// but on some browsers/OS the emoji renderer ignores CSS colour on chess glyphs.
const WHITE_PIECE_SYM = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙' };
const BLACK_PIECE_SYM = { K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' };

const PIECE_VAL = { P:1, N:3, B:3, R:5, Q:9, K:0 };
const FILES = 'abcdefgh';

const TIME_OPTIONS = [
  { label: 'No Timer', seconds: 0 },
  { label: '1 min',    seconds: 60 },
  { label: '3 min',    seconds: 180 },
  { label: '5 min',    seconds: 300 },
  { label: '10 min',   seconds: 600 },
];

function findKing(board, color) {
  for (let r=0;r<8;r++) for (let c=0;c<8;c++) if (board[r][c]===color+'K') return [r,c];
  return [0,0];
}

function getRawAttacks(board, r, c) {
  const p=board[r][c]; if (!p) return [];
  const color=pc(p), type=pt(p), res=[];
  const slide=dirs=>{for(const [dr,dc] of dirs){let nr=r+dr,nc=c+dc;while(inB(nr,nc)){res.push([nr,nc]);if(board[nr][nc])break;nr+=dr;nc+=dc;}}};
  if(type==='P'){const d=color==='w'?-1:1;if(inB(r+d,c-1))res.push([r+d,c-1]);if(inB(r+d,c+1))res.push([r+d,c+1]);}
  if(type==='N'){for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])if(inB(r+dr,c+dc))res.push([r+dr,c+dc]);}
  if(type==='B'||type==='Q')slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  if(type==='R'||type==='Q')slide([[-1,0],[1,0],[0,-1],[0,1]]);
  if(type==='K'){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&inB(r+dr,c+dc))res.push([r+dr,c+dc]);}
  return res;
}

function isAttacked(board, r, c, byColor) {
  for(let rr=0;rr<8;rr++) for(let cc=0;cc<8;cc++){
    const p=board[rr][cc]; if(!p||pc(p)!==byColor) continue;
    if(getRawAttacks(board,rr,cc).some(([ar,ac])=>ar===r&&ac===c)) return true;
  }
  return false;
}

function isInCheck(board, color) {
  const[kr,kc]=findKing(board,color); return isAttacked(board,kr,kc,opp(color));
}

function getPseudo(board, r, c, ep, castling) {
  const p=board[r][c]; if(!p) return [];
  const color=pc(p), type=pt(p), moves=[];
  const add=(nr,nc)=>{if(inB(nr,nc)&&pc(board[nr][nc])!==color)moves.push([nr,nc]);};
  const slide=dirs=>{for(const[dr,dc]of dirs){let nr=r+dr,nc=c+dc;while(inB(nr,nc)){if(pc(board[nr][nc])!==color)moves.push([nr,nc]);if(board[nr][nc])break;nr+=dr;nc+=dc;}}};

  if(type==='P'){
    const d=color==='w'?-1:1, sr=color==='w'?6:1;
    if(inB(r+d,c)&&!board[r+d][c]){moves.push([r+d,c]);if(r===sr&&!board[r+2*d][c])moves.push([r+2*d,c]);}
    for(const dc of[-1,1]){
      const nr=r+d,nc=c+dc; if(!inB(nr,nc)) continue;
      if(board[nr][nc]&&pc(board[nr][nc])!==color) moves.push([nr,nc]);
      else if(ep&&nr===ep[0]&&nc===ep[1]) moves.push([nr,nc]);
    }
  }
  if(type==='N'){for(const[dr,dc]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])add(r+dr,c+dc);}
  if(type==='B'||type==='Q')slide([[-1,-1],[-1,1],[1,-1],[1,1]]);
  if(type==='R'||type==='Q')slide([[-1,0],[1,0],[0,-1],[0,1]]);
  if(type==='K'){
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)add(r+dr,c+dc);
    const row=color==='w'?7:0;
    if(r===row&&c===4&&castling&&!isInCheck(board,color)){
      if(castling[color+'K']&&!board[row][5]&&!board[row][6]&&!isAttacked(board,row,5,opp(color))&&!isAttacked(board,row,6,opp(color)))moves.push([row,6]);
      if(castling[color+'Q']&&!board[row][1]&&!board[row][2]&&!board[row][3]&&!isAttacked(board,row,3,opp(color))&&!isAttacked(board,row,2,opp(color)))moves.push([row,2]);
    }
  }
  return moves;
}

function getLegal(board, r, c, ep, castling) {
  const p=board[r][c]; if(!p) return [];
  const color=pc(p), type=pt(p);
  return getPseudo(board,r,c,ep,castling).filter(([nr,nc])=>{
    const nb=cloneB(board);
    if(type==='P'&&ep&&nr===ep[0]&&nc===ep[1]) nb[color==='w'?nr+1:nr-1][nc]=null;
    if(type==='K'&&Math.abs(nc-c)===2){if(nc===6){nb[r][5]=nb[r][7];nb[r][7]=null;}if(nc===2){nb[r][3]=nb[r][0];nb[r][0]=null;}}
    nb[nr][nc]=p; nb[r][c]=null;
    return !isInCheck(nb,color);
  });
}

function applyMove(board, fr, fc, tr, tc, promo, ep, castling) {
  const nb=cloneB(board), p=nb[fr][fc], color=pc(p), type=pt(p);
  let newEP=null; const newC={...castling};
  if(type==='P'&&ep&&tr===ep[0]&&tc===ep[1]) nb[color==='w'?tr+1:tr-1][tc]=null;
  if(type==='K'&&Math.abs(tc-fc)===2){if(tc===6){nb[fr][5]=nb[fr][7];nb[fr][7]=null;}if(tc===2){nb[fr][3]=nb[fr][0];nb[fr][0]=null;}}
  if(type==='P'&&Math.abs(tr-fr)===2) newEP=[(fr+tr)/2,fc];
  nb[tr][tc]=(type==='P'&&(tr===0||tr===7))?color+(promo||'Q'):p;
  nb[fr][fc]=null;
  if(type==='K'){newC[color+'K']=false;newC[color+'Q']=false;}
  if(type==='R'){if(fr===7&&fc===7)newC['wK']=false;if(fr===7&&fc===0)newC['wQ']=false;if(fr===0&&fc===7)newC['bK']=false;if(fr===0&&fc===0)newC['bQ']=false;}
  if(board[tr][tc]==='wR'&&tr===7&&tc===7)newC['wK']=false;
  if(board[tr][tc]==='wR'&&tr===7&&tc===0)newC['wQ']=false;
  if(board[tr][tc]==='bR'&&tr===0&&tc===7)newC['bK']=false;
  if(board[tr][tc]==='bR'&&tr===0&&tc===0)newC['bQ']=false;
  return { board:nb, ep:newEP, castling:newC };
}

function hasAnyLegal(board, color, ep, castling) {
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){const p=board[r][c];if(p&&pc(p)===color&&getLegal(board,r,c,ep,castling).length>0)return true;}
  return false;
}

function getGameStatus(board, color, ep, castling) {
  if(hasAnyLegal(board,color,ep,castling)) return 'playing';
  return isInCheck(board,color)?'checkmate':'stalemate';
}

function getMoveNotation(board, fr, fc, tr, tc, promo, ep) {
  const p=board[fr][fc], type=pt(p), captured=board[tr][tc]||(type==='P'&&ep&&tr===ep[0]&&tc===ep[1]);
  if(type==='K'&&tc-fc===2) return 'O-O';
  if(type==='K'&&tc-fc===-2) return 'O-O-O';
  let n='';
  if(type!=='P') n+=type;
  if(type==='P'&&captured) n+=FILES[fc];
  if(captured) n+='x';
  n+=FILES[tc]+(8-tr);
  if(promo) n+='='+promo;
  return n;
}

function getCaptured(board) {
  const init={wP:8,wN:2,wB:2,wR:2,wQ:1,bP:8,bN:2,bB:2,bR:2,bQ:1};
  const cur={};
  board.flat().forEach(p=>{if(p)cur[p]=(cur[p]||0)+1;});
  const result={w:[],b:[]};
  Object.entries(init).forEach(([piece,n])=>{
    const captured=n-(cur[piece]||0);
    for(let i=0;i<captured;i++) result[opp(pc(piece))].push(piece);
  });
  result.w.sort((a,b)=>PIECE_VAL[pt(b)]-PIECE_VAL[pt(a)]);
  result.b.sort((a,b)=>PIECE_VAL[pt(b)]-PIECE_VAL[pt(a)]);
  return result;
}

// ─── Board Helpers ─────────────────────────────────────────────────────────────
const toBoardPos   = (dr, dc, flipped) => flipped ? [7-dr, 7-dc] : [dr, dc];
const boardToJson  = b => JSON.stringify(b);
const jsonToBoard  = s => { try { return JSON.parse(s); } catch { return INIT_BOARD; } };

// ─── Timer helpers ─────────────────────────────────────────────────────────────
const formatMs = ms => {
  if (ms <= 0) return '0:00';
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
};

// ─── Piece Component (FIXED — uses correct symbol per colour) ─────────────────
const Piece = ({ piece, size=1, ghost=false }) => {
  if (!piece) return null;
  const color=pc(piece), type=pt(piece);
  const isWhite = color==='w';
  const sym = isWhite ? WHITE_PIECE_SYM[type] : BLACK_PIECE_SYM[type];
  return (
    <span aria-label={piece} style={{
      fontSize:`${size*2.1}rem`, lineHeight:1, userSelect:'none', display:'block',
      color: isWhite ? '#fffdf0' : '#1c1c2e',
      textShadow: isWhite
        ? '0 1px 0 #000,0 -1px 0 #000,1px 0 0 #000,-1px 0 0 #000,0 3px 6px rgba(0,0,0,0.7)'
        : '0 0 1px rgba(255,255,255,0.15),0 2px 5px rgba(0,0,0,0.5)',
      opacity: ghost ? 0.35 : 1,
      fontFamily:"'Segoe UI Symbol','Apple Color Emoji',serif",
    }}>{sym}</span>
  );
};

// ─── Timer Display ─────────────────────────────────────────────────────────────
const TimerDisplay = ({ ms, active }) => {
  const crit = active && ms < 30000;
  return (
    <div className={`font-mono font-black text-xl px-3 py-1.5 rounded-xl border-2 transition-all select-none
      ${active
        ? crit
          ? 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
          : 'bg-amber-500/15 border-amber-400 text-amber-200'
        : 'bg-slate-800/50 border-slate-700 text-slate-500'
      }`}>
      {formatMs(ms)}
    </div>
  );
};

// ─── Class Leaderboard (Firebase) ─────────────────────────────────────────────
const ChessLeaderboard = ({ entries, myId }) => (
  <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-white/10 p-4">
    <h3 className="text-yellow-400 font-black text-base mb-3">♟ Class Leaderboard</h3>
    {entries.length === 0
      ? <p className="text-slate-500 text-sm text-center py-4">No games yet — play to rank up!</p>
      : <div className="space-y-1.5">
          {entries.slice(0,15).map((e,i) => (
            <div key={e.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm
              ${e.id===myId?'bg-yellow-500/10 border border-yellow-500/30':i%2===0?'bg-white/5':''}`}>
              <span className="w-6 text-center font-black text-xs">
                {i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}
              </span>
              <span className={`flex-1 font-semibold truncate ${e.id===myId?'text-yellow-300':'text-slate-200'}`}>{e.name}</span>
              <span className="text-green-400 font-bold text-xs">{e.wins||0}W</span>
              <span className="text-red-400 text-xs">{e.losses||0}L</span>
              <span className="text-slate-500 text-xs">{e.draws||0}D</span>
            </div>
          ))}
        </div>
    }
  </div>
);

// ─── Tournament Bracket ────────────────────────────────────────────────────────
const TournamentBracket = ({ tournament, myId, onPlayMatch }) => {
  if (!tournament) return null;
  const { rounds=[], players={}, currentRound=0, winner, status } = tournament;

  if (!rounds.length) {
    return (
      <div className="text-slate-500 text-sm text-center py-8 italic">
        {status==='registering' ? 'Waiting for host to start the tournament...' : 'No bracket yet'}
      </div>
    );
  }

  const label = (i, total) =>
    i===total-1 ? 'Final' : i===total-2 ? 'Semi-Final' : `Round ${i+1}`;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-5 min-w-max pb-4 items-start">
        {rounds.map((round, rIdx) => (
          <div key={rIdx} className="flex flex-col gap-3" style={{minWidth:164}}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-1">
              {label(rIdx, rounds.length)}
            </p>
            {round.map((match, mIdx) => {
              const p1 = players[match.p1Id]||{};
              const p2 = players[match.p2Id]||{};
              const amInMatch = (match.p1Id===myId||match.p2Id===myId);
              const isMyActiveMatch = amInMatch && rIdx===currentRound && match.status!=='finished';
              const done = match.status==='finished';
              const inProgress = match.status==='in_progress';
              const amP1 = match.p1Id===myId;
              const canJoin = !amP1 && match.gameCode && isMyActiveMatch;
              const canStart = amP1 && !match.gameCode && isMyActiveMatch;
              const waitingForCode = !amP1 && !match.gameCode && isMyActiveMatch;
              return (
                <div key={mIdx} className={`rounded-xl border p-3 text-sm space-y-2
                  ${isMyActiveMatch?'border-amber-400/50 bg-amber-500/10':'border-white/10 bg-slate-800/40'}`}>
                  <div className={`flex items-center gap-1.5 text-xs
                    ${match.winnerId===match.p1Id?'text-yellow-300 font-bold':done?'text-slate-500':'text-slate-300'}`}>
                    <span className="shrink-0">{match.winnerId===match.p1Id?'🏆':'·'}</span>
                    <span className="truncate">{p1.name||'TBD'}</span>
                  </div>
                  <div className="border-t border-white/10"/>
                  <div className={`flex items-center gap-1.5 text-xs
                    ${match.winnerId===match.p2Id?'text-yellow-300 font-bold':done?'text-slate-500':'text-slate-300'}`}>
                    <span className="shrink-0">{match.winnerId===match.p2Id?'🏆':'·'}</span>
                    <span className="truncate">{match.p2Id?p2.name||'TBD':'BYE'}</span>
                  </div>
                  {done && <p className="text-green-400 text-xs text-center font-bold">✓ Complete</p>}
                  {inProgress && !amInMatch && <p className="text-amber-400 text-xs text-center animate-pulse">⚔ Playing...</p>}
                  {canStart && onPlayMatch && (
                    <button onClick={()=>onPlayMatch(match,rIdx,mIdx)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors">
                      ▶ Start Match
                    </button>
                  )}
                  {canJoin && onPlayMatch && (
                    <button onClick={()=>onPlayMatch(match,rIdx,mIdx)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-green-500 hover:bg-green-400 text-black transition-colors">
                      ▶ Join Match
                    </button>
                  )}
                  {waitingForCode && (
                    <p className="text-amber-300 text-xs text-center animate-pulse">⏳ Waiting for opponent...</p>
                  )}
                  {amP1 && match.gameCode && isMyActiveMatch && (
                    <button onClick={()=>onPlayMatch(match,rIdx,mIdx)}
                      className="w-full py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-400 text-white transition-colors">
                      ↩ Rejoin Match
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {winner && (
          <div className="flex flex-col items-center justify-center" style={{minWidth:110}}>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Champion</p>
            <div className="rounded-xl border-2 border-yellow-400 bg-yellow-500/10 p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-yellow-300 font-black text-sm">{players[winner]?.name||'Champion'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Promotion Modal ──────────────────────────────────────────────────────────
const PromotionModal = ({ color, onPick }) => (
  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <motion.div initial={{scale:0.7,y:30}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:300}}
      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
      <h3 className="text-white font-black text-xl mb-6">Promote Pawn</h3>
      <div className="flex gap-4 justify-center">
        {['Q','R','B','N'].map(type=>(
          <motion.button key={type} whileHover={{scale:1.15,y:-4}} whileTap={{scale:0.9}}
            onClick={()=>onPick(type)}
            className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 border-2 border-white/20 hover:border-yellow-400 transition-all shadow-xl">
            <Piece piece={color+type} size={1.3}/>
          </motion.button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const ChessGame = ({ studentData, showToast }) => {
  const [firebase, setFirebase]           = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // screens: menu | waiting | playing | finished(overlay) |
  //          tournament_menu | tournament_lobby | tournament_bracket
  const [screen, setScreen]               = useState('menu');
  const [joinCode, setJoinCode]           = useState('');
  const [roomCode, setRoomCode]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [gameData, setGameData]           = useState(null);

  // Per-game local state
  const [myColor, setMyColor]             = useState(null);
  const [selected, setSelected]           = useState(null);
  const [legalMoves, setLegalMoves]       = useState([]);
  const [pendingPromo, setPendingPromo]   = useState(null);
  const [flipped, setFlipped]             = useState(false);
  const [lastMove, setLastMove]           = useState(null);

  // Class leaderboard (Firebase — shared across all players)
  const [leaderboard, setLeaderboard]     = useState([]);

  // Timed mode
  const [selectedTime, setSelectedTime]   = useState(0); // seconds; 0 = no timer
  const [localTimerMs, setLocalTimerMs]   = useState({ w:0, b:0 });
  const timerRef                          = useRef(null);
  const timeoutFired                      = useRef(false);

  // Tournament
  const [tournamentData, setTournamentData]       = useState(null);
  const [tournamentCode, setTournamentCode]       = useState('');
  const [joinTournCode, setJoinTournCode]         = useState('');
  const [tournMatchInfo, setTournMatchInfo]       = useState(null); // {roundIdx,matchIdx}

  const gameRoom       = useRef(null);
  const tournRoom      = useRef(null);
  const processing     = useRef(false);
  const resultRecorded = useRef(false);

  const myId   = useRef(studentData?.id || `guest_${Date.now()}`).current;
  const myName = studentData?.firstName || studentData?.name || 'Player';

  // ── Firebase init ──────────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove, off, get } = await import('firebase/database');
        setFirebase({ database, ref, onValue, set, update, remove, off, get });
        setFirebaseReady(true);
      } catch(e){
        console.error(e);
        showToast('Could not connect to server','error');
      }
    })();
  },[]);

  // ── Load class leaderboard from Firebase ──────────────────────────────────
  useEffect(()=>{
    if(!firebaseReady||!firebase) return;
    const lbRef = firebase.ref(firebase.database,'chess_leaderboard');
    const unsub = firebase.onValue(lbRef, snap=>{
      const data = snap.val()||{};
      const entries = Object.values(data).sort((a,b)=>(b.wins||0)-(a.wins||0));
      setLeaderboard(entries);
    });
    return ()=>firebase.off(lbRef,'value',unsub);
  },[firebaseReady,firebase]);

  // ── Record MY result in Firebase (each player updates only their own entry) ─
  const recordMyResult = useCallback(async (isWin, isLoss, isDraw) => {
    if(!firebase) return;
    try {
      const ref  = firebase.ref(firebase.database, `chess_leaderboard/${myId}`);
      const snap = await firebase.get(ref);
      const ex   = snap.val() || { id:myId, name:myName, wins:0, losses:0, draws:0, gamesPlayed:0 };
      await firebase.update(ref, {
        id:   myId,
        name: myName,
        wins:       (ex.wins||0)+(isWin?1:0),
        losses:     (ex.losses||0)+(isLoss?1:0),
        draws:      (ex.draws||0)+(isDraw?1:0),
        gamesPlayed:(ex.gamesPlayed||0)+1,
      });
    } catch(e){ console.error('Leaderboard update failed',e); }
  },[firebase,myId,myName]);

  // ── Timer tick ────────────────────────────────────────────────────────────
  useEffect(()=>{
    if(timerRef.current) clearInterval(timerRef.current);
    if(!gameData?.timerEnabled || gameData?.status!=='playing') return;

    timerRef.current = setInterval(()=>{
      const now       = Date.now();
      const startedAt = gameData.timerStartedAt || now;
      const elapsed   = now - startedAt;
      const active    = gameData.timerActiveColor || 'w';
      const wMs = active==='w' ? Math.max(0,(gameData.wTimeMs||0)-elapsed) : (gameData.wTimeMs||0);
      const bMs = active==='b' ? Math.max(0,(gameData.bTimeMs||0)-elapsed) : (gameData.bTimeMs||0);
      setLocalTimerMs({ w:wMs, b:bMs });

      // Timeout detection: both clients watch; first one through processing.current wins
      const remaining = active==='w' ? wMs : bMs;
      if(remaining<=0 && !timeoutFired.current && !processing.current && gameData.status==='playing'){
        timeoutFired.current = true;
        handleTimeout(active);
      }
    },150);

    return ()=>clearInterval(timerRef.current);
  },[gameData]); // eslint-disable-line

  const handleTimeout = useCallback(async (timedOutColor)=>{
    if(!firebase||!gameRoom.current||!gameData) return;
    if(processing.current) return;
    processing.current = true;
    const winner   = opp(timedOutColor);
    const wPlayer  = Object.values(gameData.players||{}).find(p=>p.color===winner);
    const lPlayer  = Object.values(gameData.players||{}).find(p=>p.color===timedOutColor);
    try {
      await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{
        status:'finished', result:winner, resultReason:'timeout',
        winnerId: wPlayer?.id||null, winnerName: wPlayer?.name||null, loserId: lPlayer?.id||null,
      });
    } catch(e){ processing.current=false; }
  },[firebase,gameData]);

  // ── Firebase game listener ─────────────────────────────────────────────────
  useEffect(()=>{
    if(!firebaseReady||!firebase||!gameRoom.current) return;
    timeoutFired.current  = false;
    resultRecorded.current= false;
    const roomRef = firebase.ref(firebase.database,`chess/${gameRoom.current}`);
    const unsub   = firebase.onValue(roomRef, snap=>{
      const data = snap.val();
      if(!data){ setScreen('menu'); setGameData(null); showToast('Room closed.','info'); return; }
      setGameData(data);
      if(data.lastMove)  setLastMove(data.lastMove);
      if(data.status==='playing'  && screen==='waiting') setScreen('playing');
      if(data.status==='finished' && screen!=='finished' && !resultRecorded.current){
        resultRecorded.current = true;
        setScreen('finished');
        const isWinner = data.result===myColor;
        const isDraw   = data.result==='draw';
        const reason   = data.resultReason;
        showToast(
          isDraw ? '½ Draw!'
          : isWinner ? '♟ You win! 🎉'
          : reason==='timeout' ? '⏱ Time ran out!'
          : 'You lost.',
          isDraw?'info':isWinner?'success':'error'
        );
        recordMyResult(isWinner&&!isDraw, !isWinner&&!isDraw, isDraw);

        // Update tournament bracket if this was a tournament match
        if(data.tournamentCode && data.tournamentMatchRound!=null && data.tournamentMatchIdx!=null){
          updateTournamentMatch(
            data.tournamentCode,
            data.tournamentMatchRound,
            data.tournamentMatchIdx,
            data.winnerId,
            isDraw
          );
        }
      }
    });
    return ()=>firebase.off(roomRef,'value',unsub);
  },[firebaseReady,firebase,screen,myColor,myId]); // eslint-disable-line

  // ── Firebase tournament listener ───────────────────────────────────────────
  useEffect(()=>{
    if(!firebaseReady||!firebase||!tournRoom.current) return;
    const tRef = firebase.ref(firebase.database,`chess_tournaments/${tournRoom.current}`);
    const unsub = firebase.onValue(tRef, snap=>{
      const data = snap.val();
      if(data) setTournamentData(data);
    });
    return ()=>firebase.off(tRef,'value',unsub);
  },[firebaseReady,firebase,tournRoom.current]); // eslint-disable-line

  // ── Update tournament match after a chess game ends ───────────────────────
  const updateTournamentMatch = useCallback(async (tCode,roundIdx,matchIdx,winnerId,isDraw)=>{
    if(!firebase) return;
    const matchPath = `chess_tournaments/${tCode}/rounds/${roundIdx}/${matchIdx}`;
    const matchRef  = firebase.ref(firebase.database, matchPath);
    const mSnap     = await firebase.get(matchRef);
    const match     = mSnap.val();
    if(!match||match.status==='finished') return;

    await firebase.update(matchRef,{
      status:'finished',
      winnerId: isDraw ? null : winnerId,
      isDraw:   !!isDraw,
    });

    // Check if all matches in this round are done
    const tRef  = firebase.ref(firebase.database,`chess_tournaments/${tCode}`);
    const tSnap = await firebase.get(tRef);
    const tData = tSnap.val();
    if(!tData) return;

    const thisRound = tData.rounds[roundIdx];
    const allDone   = thisRound.every((m,i)=> i===matchIdx ? true : m.status==='finished');
    if(!allDone) return;

    // Collect winners
    const winners = thisRound.map((m,i)=>{
      if(i===matchIdx) return isDraw ? null : winnerId;
      return m.isDraw ? null : m.winnerId;
    }).filter(Boolean);

    // Handle draws that blocked advancement: give bye to remaining player
    const allPlayers = thisRound.flatMap(m=>[m.p1Id,m.p2Id].filter(Boolean));
    const advanced   = winners.length ? winners : allPlayers; // fallback

    if(advanced.length===1){
      // Tournament over
      await firebase.update(tRef,{ status:'finished', winner:advanced[0], currentRound:roundIdx+1 });
    } else {
      // Build next round
      const next = [];
      for(let i=0;i<advanced.length;i+=2){
        next.push({
          p1Id:     advanced[i],
          p2Id:     advanced[i+1]||null,
          winnerId: advanced[i+1] ? null : advanced[i],
          status:   advanced[i+1] ? 'pending' : 'finished',
          gameCode: null,
          isDraw:   false,
        });
      }
      const updates = {};
      updates[`rounds/${roundIdx+1}`] = next;
      updates['currentRound']         = roundIdx+1;
      await firebase.update(tRef, updates);
    }
  },[firebase]);

  // ── Create normal game ─────────────────────────────────────────────────────
  const createGame = async (timeSeconds=0, tournamentInfo=null) => {
    if(!firebaseReady||!firebase){ showToast('Connecting...','info'); return null; }
    setLoading(true);
    const code = Math.random().toString(36).substring(2,7).toUpperCase();
    gameRoom.current = code;
    try {
      const entry = {
        roomCode: code, hostId: myId, status:'waiting', createdAt: Date.now(),
        players:{ [myId]:{ id:myId, name:myName, color:'w' } },
        playerOrder:[myId],
        timerEnabled:  timeSeconds>0,
        timePerSideMs: timeSeconds*1000,
        wTimeMs:       timeSeconds*1000,
        bTimeMs:       timeSeconds*1000,
        timerStartedAt:null,
        timerActiveColor:'w',
        ...(tournamentInfo||{}),
      };
      await firebase.set(firebase.ref(firebase.database,`chess/${code}`), entry);
      setMyColor('w'); setFlipped(false);
      setRoomCode(code); setScreen('waiting');
      showToast(`Room created! Code: ${code}`,'success');
      return code;
    } catch(e){
      showToast('Failed to create room','error');
      gameRoom.current=null;
      return null;
    } finally { setLoading(false); }
  };

  // ── Join game ──────────────────────────────────────────────────────────────
  const joinGame = async (codeOverride=null) => {
    if(!firebaseReady||!firebase) return;
    const code = (codeOverride||joinCode).trim().toUpperCase();
    if(!code){ showToast('Enter a room code','error'); return; }
    setLoading(true);
    try {
      const snap = await firebase.get(firebase.ref(firebase.database,`chess/${code}`));
      const data = snap.val();
      if(!data)                  { showToast('Room not found','error');        setLoading(false); return; }
      if(data.status!=='waiting'){ showToast('Game already started','error');  setLoading(false); return; }
      const cur = Object.keys(data.players||{});
      if(cur.length>=2)          { showToast('Room is full','error');          setLoading(false); return; }
      if(cur.includes(myId))     { showToast('Already in this room','info');   setLoading(false); return; }
      await firebase.update(firebase.ref(firebase.database,`chess/${code}`),{
        [`players/${myId}`]:{ id:myId, name:myName, color:'b' },
        playerOrder:[...cur,myId],
      });
      gameRoom.current=code; setMyColor('b'); setFlipped(true);
      setRoomCode(code); setScreen('waiting');
      showToast('Joined! You play Black.','success');
    } catch(e){ showToast('Failed to join','error'); }
    setLoading(false);
  };

  // ── Start game (host) ──────────────────────────────────────────────────────
  const startGame = async () => {
    if(!gameData||!firebase) return;
    const po = gameData.playerOrder||[];
    if(po.length<2){ showToast('Need 2 players','error'); return; }
    const isTimer     = gameData.timerEnabled;
    const perSideMs   = gameData.timePerSideMs||0;
    await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{
      boardJson:   boardToJson(INIT_BOARD),
      turn:'w', castling:INIT_CASTLING, ep:null,
      status:'playing', lastMove:null, moveHistory:[], moveCount:0,
      result:null, winnerId:null, winnerName:null, loserId:null, resultReason:null,
      ...(isTimer ? { wTimeMs:perSideMs, bTimeMs:perSideMs, timerStartedAt:Date.now(), timerActiveColor:'w' } : {}),
    });
    setScreen('playing');
  };

  // ── Execute move ───────────────────────────────────────────────────────────
  const executeMove = async (fr,fc,tr,tc,promo) => {
    if(!gameData||!firebase||processing.current) return;
    processing.current=true;
    const board    = jsonToBoard(gameData.boardJson);
    const ep       = gameData.ep||null;
    const castling = gameData.castling||INIT_CASTLING;
    const turn     = gameData.turn;
    const notation = getMoveNotation(board,fr,fc,tr,tc,promo,ep);
    const { board:nb, ep:newEP, castling:newC } = applyMove(board,fr,fc,tr,tc,promo,ep,castling);
    const nextTurn   = opp(turn);
    const status     = getGameStatus(nb,nextTurn,newEP,newC);
    const isFinished = status==='checkmate'||status==='stalemate';
    const newHistory = [...(gameData.moveHistory||[]), notation+(status==='checkmate'?'#':isInCheck(nb,nextTurn)?'+':'')];

    // Timer accounting
    let timerUpdate = {};
    if(gameData.timerEnabled){
      const now     = Date.now();
      const elapsed = now-(gameData.timerStartedAt||now);
      timerUpdate = {
        wTimeMs:          turn==='w' ? Math.max(0,(gameData.wTimeMs||0)-elapsed) : (gameData.wTimeMs||0),
        bTimeMs:          turn==='b' ? Math.max(0,(gameData.bTimeMs||0)-elapsed) : (gameData.bTimeMs||0),
        timerStartedAt:   now,
        timerActiveColor: nextTurn,
      };
    }

    const update = {
      boardJson:   boardToJson(nb),
      turn:        nextTurn,
      castling:    newC,
      ep:          newEP,
      lastMove:    { fr,fc,tr,tc },
      moveHistory: newHistory,
      moveCount:   (gameData.moveCount||0)+1,
      ...timerUpdate,
    };

    if(isFinished){
      const winner  = status==='checkmate' ? turn : null;
      const wPlayer = Object.values(gameData.players||{}).find(p=>p.color===winner);
      const lPlayer = Object.values(gameData.players||{}).find(p=>p.color===opp(winner||'w'));
      Object.assign(update,{
        status:'finished',
        result:    status==='checkmate' ? winner : 'draw',
        resultReason: status,
        winnerId:  wPlayer?.id||null,
        winnerName:wPlayer?.name||null,
        loserId:   lPlayer?.id||null,
      });
    } else {
      update.status='playing';
    }

    try {
      await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),update);
    } catch(e){ showToast('Move failed','error'); }
    setSelected(null); setLegalMoves([]);
    processing.current=false;
  };

  // ── Resign ─────────────────────────────────────────────────────────────────
  const resign = async () => {
    if(!gameData||!firebase) return;
    const winner  = opp(myColor);
    const wPlayer = Object.values(gameData.players||{}).find(p=>p.color===winner);
    await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{
      status:'finished', result:winner, resultReason:'resign',
      winnerId:wPlayer?.id||null, winnerName:wPlayer?.name||null, loserId:myId,
    });
  };

  // ── Leave / reset ──────────────────────────────────────────────────────────
  const leaveGame = async () => {
    if(timerRef.current) clearInterval(timerRef.current);
    if(firebase&&gameRoom.current){
      try{
        if(gameData?.hostId===myId) await firebase.remove(firebase.ref(firebase.database,`chess/${gameRoom.current}`));
        else {
          const po=(gameData?.playerOrder||[]).filter(id=>id!==myId);
          const pl={...(gameData?.players||{})}; delete pl[myId];
          await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{playerOrder:po,players:pl});
        }
      }catch{}
    }
    gameRoom.current=null; setGameData(null);
    setSelected(null); setLegalMoves([]); setLastMove(null); setPendingPromo(null);
    processing.current=false; timeoutFired.current=false;
    if(tournRoom.current) setScreen('tournament_bracket');
    else setScreen('menu');
  };

  // ── Square click handler ────────────────────────────────────────────────────
  const handleSquareClick = (dr,dc) => {
    if(!gameData||processing.current) return;
    const [br,bc]  = toBoardPos(dr,dc,flipped);
    const board    = jsonToBoard(gameData.boardJson);
    const ep       = gameData.ep||null;
    const castling = gameData.castling||INIT_CASTLING;
    const isMyTurn = gameData.turn===myColor;

    if(selected){
      const [selBr,selBc]=selected;
      const isLegal=legalMoves.some(([lr,lc])=>lr===br&&lc===bc);
      if(isLegal){
        const piece=board[selBr][selBc], type=pt(piece), color=pc(piece);
        const isPromo=type==='P'&&((color==='w'&&br===0)||(color==='b'&&br===7));
        if(isPromo){ setPendingPromo({fr:selBr,fc:selBc,tr:br,tc:bc}); setSelected(null); setLegalMoves([]); return; }
        executeMove(selBr,selBc,br,bc,null);
        return;
      }
      if(board[br][bc]&&pc(board[br][bc])===myColor&&isMyTurn){
        setSelected([br,bc]); setLegalMoves(getLegal(board,br,bc,ep,castling)); return;
      }
      setSelected(null); setLegalMoves([]); return;
    }
    if(!isMyTurn) return;
    const piece=board[br][bc];
    if(!piece||pc(piece)!==myColor) return;
    setSelected([br,bc]); setLegalMoves(getLegal(board,br,bc,ep,castling));
  };

  // ── Tournament: create ─────────────────────────────────────────────────────
  const createTournament = async () => {
    if(!firebaseReady||!firebase){ showToast('Connecting...','info'); return; }
    setLoading(true);
    const code = 'T'+Math.random().toString(36).substring(2,5).toUpperCase();
    tournRoom.current = code;
    try{
      await firebase.set(firebase.ref(firebase.database,`chess_tournaments/${code}`),{
        code, hostId:myId, status:'registering', createdAt:Date.now(),
        players:{ [myId]:{ id:myId, name:myName } },
        playerOrder:[myId], rounds:[], currentRound:0, winner:null,
      });
      setTournamentCode(code); setScreen('tournament_lobby');
      showToast(`Tournament created! Code: ${code}`,'success');
    }catch(e){ showToast('Failed to create tournament','error'); tournRoom.current=null; }
    setLoading(false);
  };

  // ── Tournament: join ───────────────────────────────────────────────────────
  const joinTournament = async () => {
    if(!firebaseReady||!firebase) return;
    const code = joinTournCode.trim().toUpperCase();
    if(!code){ showToast('Enter tournament code','error'); return; }
    setLoading(true);
    try{
      const snap = await firebase.get(firebase.ref(firebase.database,`chess_tournaments/${code}`));
      const data = snap.val();
      if(!data)                      { showToast('Tournament not found','error'); setLoading(false); return; }
      if(data.status!=='registering'){ showToast('Tournament already started','error'); setLoading(false); return; }
      const curPO = data.playerOrder||[];
      if(curPO.includes(myId)){ showToast('Already in this tournament','info'); setLoading(false); return; }
      await firebase.update(firebase.ref(firebase.database,`chess_tournaments/${code}`),{
        [`players/${myId}`]:{ id:myId, name:myName },
        playerOrder:[...curPO, myId],
      });
      tournRoom.current=code; setTournamentCode(code);
      setTournamentData(data); setScreen('tournament_lobby');
      showToast('Joined tournament!','success');
    }catch(e){ showToast('Failed to join tournament','error'); }
    setLoading(false);
  };

  // ── Tournament: start (host only) ─────────────────────────────────────────
  const startTournament = async () => {
    if(!tournamentData||!firebase) return;
    const po = tournamentData.playerOrder||[];
    if(po.length<2){ showToast('Need at least 2 players','error'); return; }

    // Shuffle and pair
    const shuffled = [...po].sort(()=>Math.random()-0.5);
    const round0   = [];
    for(let i=0;i<shuffled.length;i+=2){
      const p2 = shuffled[i+1]||null;
      round0.push({
        p1Id:    shuffled[i],
        p2Id:    p2,
        winnerId:p2 ? null : shuffled[i], // bye
        status:  p2 ? 'pending' : 'finished',
        gameCode:null,
        isDraw:  false,
      });
    }
    await firebase.update(firebase.ref(firebase.database,`chess_tournaments/${tournRoom.current}`),{
      status:'playing', rounds:[round0], currentRound:0,
    });
    setScreen('tournament_bracket');
  };

  // ── Tournament: play match ─────────────────────────────────────────────────
  const playTournamentMatch = async (match, roundIdx, matchIdx) => {
    const isHost = match.p1Id===myId;
    if(isHost && !match.gameCode){
      // Create chess room for this match (no timer for simplicity)
      const code = await createGame(0,{
        tournamentCode:      tournRoom.current,
        tournamentMatchRound:roundIdx,
        tournamentMatchIdx:  matchIdx,
      });
      if(!code) return;
      // Store game code on the match
      await firebase.update(
        firebase.ref(firebase.database,`chess_tournaments/${tournRoom.current}/rounds/${roundIdx}/${matchIdx}`),
        { gameCode:code, status:'in_progress' }
      );
    } else if(isHost && match.gameCode){
      // Rejoin
      gameRoom.current = match.gameCode;
      setRoomCode(match.gameCode);
      setMyColor('w'); setFlipped(false);
      setTournMatchInfo({roundIdx,matchIdx});
      setScreen('waiting');
    } else if(!isHost && match.gameCode){
      // Challenger joins
      setTournMatchInfo({roundIdx,matchIdx});
      await joinGame(match.gameCode);
    }
  };

  // ── Leave tournament ───────────────────────────────────────────────────────
  const leaveTournament = () => {
    tournRoom.current=null; setTournamentData(null); setTournamentCode('');
    setTournMatchInfo(null); setScreen('menu');
  };

  // ═══════════════════════════════ RENDER ═══════════════════════════════════

  if(!firebaseReady){
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-12">
        <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mb-4"/>
        <p className="text-amber-200 font-bold animate-pulse">Connecting to chess server...</p>
      </div>
    );
  }

  // ── MENU ────────────────────────────────────────────────────────────────────
  if(screen==='menu'){
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{opacity:0,y:-24}} animate={{opacity:1,y:0}} className="text-center py-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 blur-3xl rounded-full"/>
            <h1 className="relative text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-2xl" style={{fontFamily:'serif'}}>
              ♟ Chess
            </h1>
            <p className="text-slate-400 text-sm font-semibold mt-2 tracking-wider uppercase">2-Player Live Multiplayer</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Play panel */}
            <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0,transition:{delay:0.1}}}
              className="bg-slate-900/80 backdrop-blur rounded-3xl border border-white/10 p-6 space-y-5 shadow-2xl">
              <h2 className="text-white font-black text-2xl">Play</h2>

              {/* Time control */}
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">⏱ Time Control</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIME_OPTIONS.map(opt=>(
                    <button key={opt.seconds} onClick={()=>setSelectedTime(opt.seconds)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border
                        ${selectedTime===opt.seconds
                          ?'bg-amber-500 text-black border-amber-400'
                          :'bg-slate-800 text-slate-300 border-slate-700 hover:border-amber-500/50'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button whileHover={{scale:1.02,boxShadow:'0 0 28px rgba(217,119,6,0.3)'}} whileTap={{scale:0.98}}
                onClick={()=>createGame(selectedTime)} disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:opacity-60 shadow-xl transition-all">
                {loading?'Creating...':'♟ Create Room'}
              </motion.button>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10"/>
                <span className="mx-3 text-slate-500 text-xs font-bold uppercase tracking-wider">or join</span>
                <div className="flex-1 border-t border-white/10"/>
              </div>

              <div className="space-y-3">
                <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e=>e.key==='Enter'&&joinGame()}
                  placeholder="ROOM CODE" maxLength={6}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-4 rounded-xl text-center font-mono text-2xl tracking-widest uppercase focus:border-amber-400 focus:outline-none transition-colors placeholder:text-slate-600"/>
                <motion.button whileHover={joinCode.trim()?{scale:1.02}:{}} whileTap={joinCode.trim()?{scale:0.98}:{}}
                  onClick={()=>joinGame()} disabled={loading||!joinCode.trim()}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all">
                  {loading?'Joining...':'🔗 Join Room'}
                </motion.button>
              </div>

              {/* Tournament entry */}
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10"/>
                <span className="mx-3 text-slate-500 text-xs font-bold uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-white/10"/>
              </div>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={()=>setScreen('tournament_menu')}
                className="w-full py-3 rounded-2xl font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-sm">
                🏆 Tournament Mode
              </motion.button>

              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-1.5 text-sm text-slate-400">
                <div className="text-white font-bold mb-2">Rules</div>
                <div>⬜ Host plays <strong className="text-white">White</strong>, guest plays <strong className="text-white">Black</strong></div>
                <div>♟ All standard rules: castling, en passant, promotion</div>
                <div>♚ Checkmate, resign, or time-out to end the game</div>
                <div>🔄 Use the flip button to change board orientation</div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0,transition:{delay:0.2}}}>
              <ChessLeaderboard entries={leaderboard} myId={myId}/>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── TOURNAMENT MENU ─────────────────────────────────────────────────────────
  if(screen==='tournament_menu'){
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-black text-white">Tournament Mode</h2>
            <p className="text-slate-400 text-sm mt-1">Bracket-style competition for the whole class</p>
          </div>

          <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
            onClick={createTournament} disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:opacity-60 shadow-xl">
            {loading?'Creating...':'🏆 Create Tournament'}
          </motion.button>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-white/10"/>
            <span className="mx-3 text-slate-500 text-xs font-bold uppercase">or join</span>
            <div className="flex-1 border-t border-white/10"/>
          </div>

          <div className="space-y-3">
            <input value={joinTournCode} onChange={e=>setJoinTournCode(e.target.value.toUpperCase())}
              onKeyDown={e=>e.key==='Enter'&&joinTournament()}
              placeholder="TOURNAMENT CODE" maxLength={8}
              className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-4 rounded-xl text-center font-mono text-xl tracking-widest uppercase focus:border-amber-400 focus:outline-none transition-colors placeholder:text-slate-600"/>
            <motion.button whileHover={joinTournCode.trim()?{scale:1.02}:{}} whileTap={joinTournCode.trim()?{scale:0.98}:{}}
              onClick={joinTournament} disabled={loading||!joinTournCode.trim()}
              className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-slate-600 to-slate-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl">
              {loading?'Joining...':'🔗 Join Tournament'}
            </motion.button>
          </div>

          <button onClick={()=>setScreen('menu')}
            className="w-full py-3 rounded-2xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    );
  }

  // ── TOURNAMENT LOBBY ────────────────────────────────────────────────────────
  if(screen==='tournament_lobby'){
    const td        = tournamentData;
    const po        = td?.playerOrder||[];
    const pl        = td?.players||{};
    const isHost    = td?.hostId===myId;
    const canStart  = isHost && po.length>=2;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-black text-white">Tournament Lobby</h2>
            <p className="text-slate-400 text-sm mt-1">{po.length} player{po.length!==1?'s':''} registered</p>
          </div>

          {/* Tournament code */}
          <div className="bg-slate-800 border-2 border-slate-600 hover:border-amber-400 rounded-2xl p-4 cursor-pointer transition-colors text-center"
            onClick={()=>{navigator.clipboard?.writeText(tournamentCode);showToast('Copied!','success');}}>
            <p className="font-mono text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">{tournamentCode}</p>
            <p className="text-slate-500 text-xs mt-1 font-bold uppercase tracking-widest">Tap to copy code</p>
          </div>

          {/* Player list */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {po.map((pid,i)=>(
              <div key={pid} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-slate-400 text-xs font-bold w-5">#{i+1}</span>
                <span className="text-white font-bold flex-1 truncate">{pl[pid]?.name||pid}</span>
                {pid===myId&&<span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">YOU</span>}
                {pid===td?.hostId&&<span className="text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-full">HOST</span>}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {isHost && (
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={startTournament} disabled={!canStart}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl">
                {po.length<2?'Need at least 2 players':'🏆 Start Tournament!'}
              </motion.button>
            )}
            {!isHost && (
              <p className="text-slate-400 text-sm animate-pulse text-center">Waiting for host to start...</p>
            )}
            {td?.status==='playing' && (
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={()=>setScreen('tournament_bracket')}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-amber-600 to-amber-800 shadow-xl">
                View Bracket →
              </motion.button>
            )}
            <button onClick={leaveTournament}
              className="w-full py-3 rounded-2xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors">
              Leave Tournament
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── TOURNAMENT BRACKET ──────────────────────────────────────────────────────
  if(screen==='tournament_bracket'){
    const td     = tournamentData;
    const isHost = td?.hostId===myId;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur rounded-2xl px-5 py-3 border border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h2 className="text-white font-black text-lg">Tournament</h2>
                <span className="font-mono text-amber-400 text-xs">{tournamentCode}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {td?.status==='playing'&&(
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                  Round {(td?.currentRound||0)+1}
                </span>
              )}
              {td?.status==='finished'&&(
                <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">🏆 Finished</span>
              )}
              <button onClick={leaveTournament}
                className="text-slate-500 hover:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-400/10 transition-colors">
                Leave
              </button>
            </div>
          </div>

          {td?.status==='finished'&&td?.winner&&(
            <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}}
              className="bg-yellow-500/10 border-2 border-yellow-400/40 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-2">🏆</div>
              <h3 className="text-yellow-300 font-black text-2xl">Tournament Champion</h3>
              <p className="text-yellow-200 text-xl font-bold mt-1">{td.players[td.winner]?.name||'Champion'}</p>
            </motion.div>
          )}

          <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-white/10 p-5">
            <TournamentBracket
              tournament={td}
              myId={myId}
              onPlayMatch={playTournamentMatch}
            />
          </div>

          {/* Players list */}
          <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-white/10 p-5">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Players ({Object.keys(td?.players||{}).length})</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(td?.players||{}).map(p=>(
                <span key={p.id} className={`px-3 py-1.5 rounded-xl text-sm font-bold border
                  ${p.id===myId?'bg-amber-500/20 border-amber-400/40 text-amber-300'
                  :p.id===td?.winner?'bg-yellow-500/20 border-yellow-400/40 text-yellow-300'
                  :'bg-slate-800/60 border-white/10 text-slate-300'}`}>
                  {p.id===td?.winner?'🏆 ':''}{p.name}
                  {p.id===myId?' (you)':''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if(screen==='waiting'){
    const isHost = gameData?.hostId===myId;
    const po     = gameData?.playerOrder||[];
    const pl     = gameData?.players||{};
    const timer  = gameData?.timerEnabled;
    const tSecs  = (gameData?.timePerSideMs||0)/1000;
    const tLabel = TIME_OPTIONS.find(o=>o.seconds===tSecs)?.label || `${tSecs}s`;
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div>
            <div className="text-5xl mb-3" style={{fontFamily:'serif'}}>♟</div>
            <h2 className="text-3xl font-black text-white mb-1">Waiting for Opponent</h2>
            <p className="text-slate-400">{po.length}/2 players</p>
            {timer&&<p className="text-amber-400 text-xs font-bold mt-1">⏱ {tLabel} per side</p>}
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 hover:border-amber-400 rounded-2xl p-5 cursor-pointer transition-colors"
            onClick={()=>{navigator.clipboard?.writeText(roomCode);showToast('Copied!','success');}}>
            <p className="font-mono text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">{roomCode}</p>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">Tap to copy</p>
          </div>
          <div className="space-y-2 text-left">
            {po.map((pid)=>(
              <div key={pid} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-2xl">{pl[pid]?.color==='w'?'⬜':'⬛'}</span>
                <span className="text-white font-bold flex-1">{pl[pid]?.name||pid}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pl[pid]?.color==='w'?'bg-slate-200 text-slate-800':'bg-slate-700 text-slate-200'}`}>
                  {pl[pid]?.color==='w'?'White':'Black'}
                </span>
                {pid===myId&&<span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">YOU</span>}
              </div>
            ))}
            {po.length<2&&(
              <div className="flex items-center gap-3 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-xl px-4 py-3">
                <span className="text-2xl opacity-30">⬛</span>
                <span className="text-slate-600 italic text-sm">Waiting for Black player...</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {isHost&&(
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                onClick={startGame} disabled={po.length<2}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all">
                {po.length<2?'Waiting for opponent...':'♟ Start Game!'}
              </motion.button>
            )}
            {!isHost&&po.length<2&&(
              <p className="text-slate-400 text-sm animate-pulse text-center">Waiting for host to start...</p>
            )}
            <button onClick={leaveGame}
              className="w-full py-3 rounded-2xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-red-400 transition-colors">
              Leave Room
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING / FINISHED ───────────────────────────────────────────────────────
  if(screen==='playing'||screen==='finished'){
    if(!gameData?.boardJson){
      return (
        <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 rounded-3xl">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"/>
        </div>
      );
    }

    const board    = jsonToBoard(gameData.boardJson);
    const turn     = gameData.turn;
    const ep       = gameData.ep||null;
    const castling = gameData.castling||INIT_CASTLING;
    const status   = gameData.status;
    const result   = gameData.result;
    const players  = gameData.players||{};
    const history  = gameData.moveHistory||[];
    const isMyTurn = turn===myColor && status==='playing';
    const captured = getCaptured(board);
    const timerOn  = !!gameData.timerEnabled;

    const myPlayer  = Object.values(players).find(p=>p.id===myId)||{name:myName,color:myColor};
    const oppPlayer = Object.values(players).find(p=>p.id!==myId)||{name:'Opponent'};
    const inCheck   = isInCheck(board,turn);
    const checkKing = inCheck ? findKing(board,turn) : null;

    // Determine displayed timers: use localTimerMs if timer is running, else Firebase values
    const dispW = timerOn ? localTimerMs.w : 0;
    const dispB = timerOn ? localTimerMs.b : 0;

    const renderBoard = () => {
      const rows = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
      const cols = flipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
      return (
        <div className="relative select-none">
          <div className="rounded-2xl p-3 shadow-2xl" style={{background:'linear-gradient(135deg,#5d3a1a,#3d2208)'}}>
            <div className="flex">
              {/* Rank labels */}
              <div className="flex flex-col justify-around pr-1.5" style={{width:'1.2rem'}}>
                {rows.map(r=>(
                  <span key={r} className="text-center font-bold" style={{color:'#c8a97e',fontSize:'0.6rem',lineHeight:1}}>
                    {flipped?r+1:8-r}
                  </span>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-8 rounded-lg overflow-hidden"
                style={{width:'min(80vw,480px)',height:'min(80vw,480px)',gridTemplateRows:'repeat(8,1fr)'}}>
                {rows.map(dr=>cols.map(dc=>{
                  const [br,bc] = toBoardPos(dr,dc,flipped);
                  const piece   = board[br][bc];
                  const isLight = (br+bc)%2===0;
                  const isSel   = selected&&selected[0]===br&&selected[1]===bc;
                  const isLegal = legalMoves.some(([lr,lc])=>lr===br&&lc===bc);
                  const isLast  = lastMove&&((lastMove.fr===br&&lastMove.fc===bc)||(lastMove.tr===br&&lastMove.tc===bc));
                  const isChk   = checkKing&&checkKing[0]===br&&checkKing[1]===bc;
                  const isCaptureLegal = isLegal&&!!piece;

                  let sqColor = isLight ? '#f0d9b5' : '#b58863';
                  if(isChk)       sqColor = isLight ? '#ff6b6b' : '#cc2222';
                  else if(isSel)  sqColor = isLight ? '#f6f669' : '#baca2b';
                  else if(isLast) sqColor = isLight ? '#cdd26a' : '#aaa23a';

                  return (
                    <div key={`${br}-${bc}`}
                      onClick={()=>status==='playing'&&handleSquareClick(dr,dc)}
                      className={`relative flex items-center justify-center ${status==='playing'&&isMyTurn?'cursor-pointer':''}`}
                      style={{backgroundColor:sqColor,transition:'background-color 0.15s'}}>
                      {isLegal&&!isCaptureLegal&&(
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="rounded-full" style={{width:'32%',height:'32%',background:'rgba(20,85,30,0.45)'}}/>
                        </div>
                      )}
                      {isCaptureLegal&&(
                        <div className="absolute inset-0 pointer-events-none z-10 rounded-sm"
                          style={{boxShadow:'inset 0 0 0 4px rgba(20,85,30,0.5)'}}/>
                      )}
                      {piece&&(
                        <motion.div
                          key={`${piece}-${br}-${bc}`}
                          initial={{scale:0.8,opacity:0}}
                          animate={{scale:1,opacity:1}}
                          transition={{type:'spring',stiffness:400,damping:22}}
                          className="relative z-20 flex items-center justify-center w-full h-full"
                          style={{
                            filter: isSel?'drop-shadow(0 0 8px rgba(255,220,0,0.9))':'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                            cursor: status==='playing'&&isMyTurn&&pc(piece)===myColor?'pointer':'default',
                            fontSize:'min(7vw,3.4rem)',
                          }}>
                          <Piece piece={piece} size={0.85}/>
                        </motion.div>
                      )}
                    </div>
                  );
                }))}
              </div>
              <div className="w-2"/>
            </div>
            {/* File labels */}
            <div className="flex pl-5 pt-1.5">
              {cols.map(dc=>(
                <div key={dc} className="flex-1 text-center font-bold" style={{color:'#c8a97e',fontSize:'0.6rem'}}>
                  {FILES[flipped?7-dc:dc]}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    const renderSidePanel = () => (
      <div className="flex flex-col gap-3 min-w-0 md:w-60">
        {/* Opponent section */}
        <div className={`bg-slate-900/80 rounded-2xl p-3 border-2 transition-all ${!isMyTurn&&status==='playing'?'border-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.3)]':'border-white/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{oppPlayer.color==='w'?'⬜':'⬛'}</span>
            <span className="text-white font-bold text-sm truncate flex-1">{oppPlayer.name}</span>
            {timerOn && (
              <TimerDisplay
                ms={oppPlayer.color==='w'?dispW:dispB}
                active={!isMyTurn&&status==='playing'}
              />
            )}
            {!isMyTurn&&status==='playing'&&!timerOn&&(
              <motion.span animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:1}}
                className="text-amber-400 text-xs font-bold">thinking...</motion.span>
            )}
          </div>
          {/* Captured by opponent */}
          <div className="flex flex-wrap gap-0.5 min-h-[1.2rem]">
            {captured[myColor==='w'?'w':'b'].map((p,i)=>{
              const isW = pc(p)==='w';
              const sym = isW ? WHITE_PIECE_SYM[pt(p)] : BLACK_PIECE_SYM[pt(p)];
              return (
                <span key={i} style={{
                  fontSize:'0.9rem',
                  color:isW?'#fffdf0':'#1c1c2e',
                  textShadow:isW?'0 0 2px #000':'none',
                  fontFamily:'serif'
                }}>{sym}</span>
              );
            })}
          </div>
        </div>

        {/* Move history */}
        <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-3 flex-1 min-h-0">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Moves</p>
          <div className="overflow-y-auto max-h-44 space-y-0.5" style={{scrollbarWidth:'thin',scrollbarColor:'#334155 transparent'}}>
            {history.length===0
              ? <p className="text-slate-600 text-xs italic">No moves yet</p>
              : Array.from({length:Math.ceil(history.length/2)}).map((_,i)=>(
                <div key={i} className="flex gap-2 text-xs">
                  <span className="text-slate-500 w-5 text-right flex-shrink-0">{i+1}.</span>
                  <span className="text-slate-200 font-mono w-12">{history[i*2]||''}</span>
                  <span className="text-slate-400 font-mono">{history[i*2+1]||''}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* My section */}
        <div className={`bg-slate-900/80 rounded-2xl p-3 border-2 transition-all ${isMyTurn&&status==='playing'?'border-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.3)]':'border-white/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{myColor==='w'?'⬜':'⬛'}</span>
            <span className="text-white font-bold text-sm truncate flex-1">{myPlayer.name} (You)</span>
            {timerOn && (
              <TimerDisplay
                ms={myColor==='w'?dispW:dispB}
                active={isMyTurn&&status==='playing'}
              />
            )}
            {isMyTurn&&!timerOn&&(
              <motion.span animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:0.9}}
                className="text-amber-400 text-xs font-bold">your turn</motion.span>
            )}
          </div>
          {/* Captured by me */}
          <div className="flex flex-wrap gap-0.5 min-h-[1.2rem]">
            {captured[myColor==='w'?'b':'w'].map((p,i)=>{
              const isW = pc(p)==='w';
              const sym = isW ? WHITE_PIECE_SYM[pt(p)] : BLACK_PIECE_SYM[pt(p)];
              return (
                <span key={i} style={{
                  fontSize:'0.9rem',
                  color:isW?'#fffdf0':'#1c1c2e',
                  textShadow:isW?'0 0 2px #000':'none',
                  fontFamily:'serif'
                }}>{sym}</span>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        {status==='playing'&&(
          <div className="flex gap-2">
            <button onClick={()=>setFlipped(f=>!f)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-white/10">
              🔄 Flip
            </button>
            <button onClick={resign}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors border border-red-400/20">
              🏳 Resign
            </button>
          </div>
        )}
      </div>
    );

    const renderGameResult = () => {
      if(status!=='finished') return null;
      const isWinner = result===myColor;
      const isDraw   = result==='draw';
      const reason   = gameData.resultReason;
      const reasonStr =
        reason==='checkmate' ? 'Checkmate!' :
        reason==='stalemate' ? 'Stalemate' :
        reason==='resign'    ? 'Opponent resigned' :
        reason==='timeout'   ? '⏱ Time ran out!' : 'Game over';
      const inTourn = !!gameData.tournamentCode;
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <motion.div initial={{scale:0.5,y:60}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:200,damping:20}}
            className="bg-slate-900 border border-white/20 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl space-y-5">
            <div className="text-6xl">{isDraw?'🤝':isWinner?'🏆':'😔'}</div>
            <h2 className={`text-4xl font-black ${isDraw?'text-slate-300':isWinner?'text-yellow-400':'text-slate-400'}`}>
              {isDraw?'Draw!':isWinner?'You Win!':'You Lose'}
            </h2>
            <p className="text-slate-400 text-sm">{reasonStr}</p>
            {isWinner&&!isDraw&&(
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3">
                <p className="text-yellow-300 font-bold text-sm">🏆 Result recorded on class leaderboard!</p>
              </div>
            )}
            <button onClick={leaveGame}
              className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 transition-all shadow-xl">
              {inTourn ? 'Back to Bracket' : 'Back to Menu'}
            </button>
          </motion.div>
        </motion.div>
      );
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 p-3 md:p-5">
        <AnimatePresence>
          {pendingPromo&&<PromotionModal color={myColor} onPick={promo=>{executeMove(pendingPromo.fr,pendingPromo.fc,pendingPromo.tr,pendingPromo.tc,promo);setPendingPromo(null);}}/>}
          {status==='finished'&&renderGameResult()}
        </AnimatePresence>

        {/* Header */}
        <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between bg-slate-900/80 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-amber-400" style={{fontFamily:'serif'}}>♟ Chess</span>
            <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-1 rounded-lg border border-slate-700">{roomCode}</span>
            {gameData.tournamentCode&&<span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded-lg border border-amber-500/30">🏆 Tournament</span>}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`turn-${turn}`} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className={`text-sm font-black px-3 py-1.5 rounded-full border ${isMyTurn?'bg-amber-500/20 text-amber-400 border-amber-500/40':'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {isMyTurn?'⚡ Your Turn':`${turn==='w'?'White':'Black'} to move`}
              {inCheck&&<span className="ml-2 text-red-400">· Check!</span>}
            </motion.div>
          </AnimatePresence>
          <button onClick={leaveGame}
            className="text-slate-600 hover:text-red-400 text-xs font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10">
            Leave
          </button>
        </div>

        {/* Main layout */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-center gap-5">
          {renderBoard()}
          {renderSidePanel()}
        </div>
      </div>
    );
  }

  return null;
};

export default ChessGame;
