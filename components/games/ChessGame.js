// components/games/ChessGame.js — Full 2-player multiplayer Chess
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

const PIECE_SYM = { K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' };
const PIECE_VAL = { P:1, N:3, B:3, R:5, Q:9, K:0 };
const FILES = 'abcdefgh';

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
  // Rook captured: revoke its castling right
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
const toDisplayPos = (br, bc, flipped) => flipped ? [7-br, 7-bc] : [br, bc];
const toBoardPos   = (dr, dc, flipped) => flipped ? [7-dr, 7-dc] : [dr, dc];

const boardToJson  = b => JSON.stringify(b);
const jsonToBoard  = s => { try { return JSON.parse(s); } catch { return INIT_BOARD; } };

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const LS_KEY = 'chess_leaderboard';
const loadLB  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch { return []; } };
const saveLB  = entries => localStorage.setItem(LS_KEY, JSON.stringify(entries));

// ─── Piece Component ──────────────────────────────────────────────────────────
const Piece = ({ piece, size = 1, ghost = false }) => {
  if (!piece) return null;
  const color = pc(piece), type = pt(piece);
  const isWhite = color === 'w';
  return (
    <span
      aria-label={piece}
      style={{
        fontSize: `${size * 2.1}rem`,
        lineHeight: 1,
        userSelect: 'none',
        display: 'block',
        color: isWhite ? '#fffdf0' : '#1c1c2e',
        textShadow: isWhite
          ? '0 1px 0 #000, 0 -1px 0 #000, 1px 0 0 #000, -1px 0 0 #000, 0 3px 6px rgba(0,0,0,0.7)'
          : '0 0 1px rgba(255,255,255,0.15), 0 2px 5px rgba(0,0,0,0.5)',
        opacity: ghost ? 0.35 : 1,
        fontFamily: "'Segoe UI Symbol','Apple Color Emoji',serif",
      }}
    >
      {PIECE_SYM[type]}
    </span>
  );
};

// ─── Leaderboard Panel ────────────────────────────────────────────────────────
const ChessLeaderboard = ({ entries, myId }) => (
  <div className="bg-slate-900/70 backdrop-blur rounded-2xl border border-white/10 p-4">
    <h3 className="text-yellow-400 font-black text-base mb-3 flex items-center gap-2">♟ Chess Leaderboard</h3>
    {entries.length === 0
      ? <p className="text-slate-500 text-sm text-center py-4">No wins yet — play to rank up!</p>
      : <div className="space-y-1.5">
          {entries.slice(0,10).map((e,i)=>(
            <div key={e.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${e.id===myId?'bg-yellow-500/10 border border-yellow-500/30':i%2===0?'bg-white/5':''}`}>
              <span className="w-6 text-center font-black text-xs">{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}.`}</span>
              <span className={`flex-1 font-semibold truncate ${e.id===myId?'text-yellow-300':'text-slate-200'}`}>{e.name}</span>
              <span className="text-yellow-400 font-black text-xs">{e.wins}W</span>
              <span className="text-slate-500 text-xs">{e.gamesPlayed}GP</span>
            </div>
          ))}
        </div>
    }
  </div>
);

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

  const [screen, setScreen]               = useState('menu');
  const [joinCode, setJoinCode]           = useState('');
  const [roomCode, setRoomCode]           = useState('');
  const [loading, setLoading]             = useState(false);
  const [gameData, setGameData]           = useState(null);

  // Local game state
  const [myColor, setMyColor]             = useState(null); // 'w' | 'b'
  const [selected, setSelected]           = useState(null); // [r, c]
  const [legalMoves, setLegalMoves]       = useState([]);
  const [pendingPromo, setPendingPromo]   = useState(null); // {fr,fc,tr,tc}
  const [flipped, setFlipped]             = useState(false);
  const [lastMove, setLastMove]           = useState(null); // {fr,fc,tr,tc}
  const [leaderboard, setLeaderboard]     = useState([]);

  const gameRoom    = useRef(null);
  const processing  = useRef(false);
  const myId        = useRef(studentData?.id || `guest_${Date.now()}`).current;
  const myName      = studentData?.firstName || 'Player';

  // ── Firebase init ──
  useEffect(() => {
    (async()=>{
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove, off, get } = await import('firebase/database');
        setFirebase({ database, ref, onValue, set, update, remove, off, get });
        setFirebaseReady(true);
      } catch(e) {
        console.error(e);
        showToast('Could not connect to server','error');
      }
    })();
  }, []);

  // ── Leaderboard ──
  useEffect(()=>{ setLeaderboard(loadLB()); },[]);

  const recordResult = useCallback((winnerId, winnerName, loserId, isDraw) => {
    const lb = loadLB();
    const updated = [...lb];
    const upsert = (id, name, isWin) => {
      const idx = updated.findIndex(e=>e.id===id);
      if(idx>=0) { updated[idx]={...updated[idx], gamesPlayed:(updated[idx].gamesPlayed||0)+1, wins:(updated[idx].wins||0)+(isWin?1:0)}; }
      else updated.push({ id, name, wins:isWin?1:0, gamesPlayed:1 });
    };
    if(isDraw) { upsert(winnerId,winnerName,false); if(loserId) upsert(loserId,'',false); }
    else { upsert(winnerId,winnerName,true); if(loserId) upsert(loserId,'',false); }
    updated.sort((a,b)=>(b.wins||0)-(a.wins||0));
    saveLB(updated.slice(0,20));
    setLeaderboard(updated.slice(0,20));
  }, []);

  // ── Firebase listener ──
  useEffect(() => {
    if(!firebaseReady||!firebase||!gameRoom.current) return;
    const roomRef = firebase.ref(firebase.database, `chess/${gameRoom.current}`);
    const unsub = firebase.onValue(roomRef, snap => {
      const data = snap.val();
      if(!data){ setScreen('menu'); setGameData(null); showToast('Room closed.','info'); return; }
      setGameData(data);
      if(data.lastMove) setLastMove(data.lastMove);
      if(data.status==='playing' && screen==='waiting') setScreen('playing');
      if(data.status==='finished' && screen!=='finished') {
        setScreen('finished');
        const isWinner = data.result===myColor;
        const isDraw   = data.result==='draw';
        showToast(isDraw?'½ Draw!':isWinner?'♟ You win! 🎉':'You lost.',isDraw?'info':isWinner?'success':'error');
        if(!isDraw) recordResult(data.winnerId,data.winnerName,data.loserId,false);
        else recordResult(myId,myName,null,true);
      }
    });
    return ()=>firebase.off(roomRef,'value',unsub);
  }, [firebaseReady,firebase,screen,myColor,myId]);

  // ── Create game ──
  const createGame = async () => {
    if(!firebaseReady||!firebase){showToast('Connecting...','info');return;}
    setLoading(true);
    const code = Math.random().toString(36).substring(2,7).toUpperCase();
    gameRoom.current = code;
    try {
      await firebase.set(firebase.ref(firebase.database,`chess/${code}`), {
        roomCode: code, hostId: myId, status: 'waiting', createdAt: Date.now(),
        players: { [myId]: { id:myId, name:myName, color:'w' } },
        playerOrder: [myId],
      });
      setMyColor('w'); setFlipped(false);
      setRoomCode(code); setScreen('waiting');
      showToast(`Room created! Code: ${code}`,'success');
    } catch(e){ showToast('Failed to create room','error'); gameRoom.current=null; }
    setLoading(false);
  };

  // ── Join game ──
  const joinGame = async () => {
    if(!firebaseReady||!firebase) return;
    const code = joinCode.trim().toUpperCase();
    if(!code){ showToast('Enter a room code','error'); return; }
    setLoading(true);
    try {
      const snap = await firebase.get(firebase.ref(firebase.database,`chess/${code}`));
      const data = snap.val();
      if(!data)                    { showToast('Room not found','error'); setLoading(false); return; }
      if(data.status!=='waiting')  { showToast('Game already started','error'); setLoading(false); return; }
      const cur = Object.keys(data.players||{});
      if(cur.length>=2)            { showToast('Room is full','error'); setLoading(false); return; }
      if(cur.includes(myId))       { showToast('Already in this room','info'); setLoading(false); return; }
      await firebase.update(firebase.ref(firebase.database,`chess/${code}`),{
        [`players/${myId}`]: { id:myId, name:myName, color:'b' },
        playerOrder: [...cur, myId],
      });
      gameRoom.current = code; setMyColor('b'); setFlipped(true);
      setRoomCode(code); setScreen('waiting');
      showToast('Joined! You play Black.','success');
    } catch(e){ showToast('Failed to join','error'); }
    setLoading(false);
  };

  // ── Start game (host) ──
  const startGame = async () => {
    if(!gameData||!firebase) return;
    const po = gameData.playerOrder||[];
    if(po.length<2){ showToast('Need 2 players','error'); return; }
    await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{
      boardJson: boardToJson(INIT_BOARD),
      turn: 'w',
      castling: INIT_CASTLING,
      ep: null,
      status: 'playing',
      lastMove: null,
      moveHistory: [],
      moveCount: 0,
      result: null, winnerId: null, winnerName: null, loserId: null, resultReason: null,
    });
    setScreen('playing');
  };

  // ── Execute move ──
  const executeMove = async (fr, fc, tr, tc, promo) => {
    if(!gameData||!firebase||processing.current) return;
    processing.current = true;
    const board    = jsonToBoard(gameData.boardJson);
    const ep       = gameData.ep || null;
    const castling = gameData.castling || INIT_CASTLING;
    const turn     = gameData.turn;
    const notation = getMoveNotation(board, fr, fc, tr, tc, promo, ep);
    const { board:nb, ep:newEP, castling:newC } = applyMove(board,fr,fc,tr,tc,promo,ep,castling);
    const nextTurn  = opp(turn);
    const status    = getGameStatus(nb, nextTurn, newEP, newC);
    const isFinished = status==='checkmate'||status==='stalemate';
    const newHistory = [...(gameData.moveHistory||[]), notation+(status==='checkmate'?'#':isInCheck(nb,nextTurn)?'+':'')];
    const update = {
      boardJson: boardToJson(nb),
      turn: nextTurn,
      castling: newC,
      ep: newEP,
      lastMove: { fr, fc, tr, tc },
      moveHistory: newHistory,
      moveCount: (gameData.moveCount||0)+1,
    };
    if(isFinished) {
      const winner = status==='checkmate' ? turn : null;
      const loser  = status==='checkmate' ? nextTurn : null;
      const wPlayer = Object.values(gameData.players||{}).find(p=>p.color===winner);
      const lPlayer = Object.values(gameData.players||{}).find(p=>p.color===loser);
      Object.assign(update,{
        status:'finished',
        result: status==='checkmate'?winner:'draw',
        resultReason: status,
        winnerId: wPlayer?.id||null, winnerName: wPlayer?.name||null,
        loserId:  lPlayer?.id||null,
      });
    } else {
      update.status = 'playing';
    }
    try {
      await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),update);
    } catch(e){ showToast('Move failed','error'); }
    setSelected(null); setLegalMoves([]);
    processing.current = false;
  };

  // ── Resign ──
  const resign = async () => {
    if(!gameData||!firebase) return;
    const winner = opp(myColor);
    const wPlayer = Object.values(gameData.players||{}).find(p=>p.color===winner);
    await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{
      status:'finished', result:winner, resultReason:'resign',
      winnerId:wPlayer?.id||null, winnerName:wPlayer?.name||null, loserId:myId,
    });
  };

  // ── Leave ──
  const leaveGame = async () => {
    if(firebase&&gameRoom.current){
      try {
        if(gameData?.hostId===myId) await firebase.remove(firebase.ref(firebase.database,`chess/${gameRoom.current}`));
        else {
          const po=(gameData?.playerOrder||[]).filter(id=>id!==myId);
          const pl={...(gameData?.players||{})}; delete pl[myId];
          await firebase.update(firebase.ref(firebase.database,`chess/${gameRoom.current}`),{playerOrder:po,players:pl});
        }
      } catch{}
    }
    gameRoom.current=null; setGameData(null); setScreen('menu');
    setSelected(null); setLegalMoves([]); setLastMove(null); setPendingPromo(null);
    processing.current=false;
  };

  // ── Handle square click ──
  const handleSquareClick = (dr, dc) => {
    if(!gameData||processing.current) return;
    const [br,bc] = toBoardPos(dr,dc,flipped);
    const board   = jsonToBoard(gameData.boardJson);
    const ep      = gameData.ep||null;
    const castling = gameData.castling||INIT_CASTLING;
    const isMyTurn = gameData.turn===myColor;

    if(selected) {
      const [selBr, selBc] = selected;
      const isLegal = legalMoves.some(([lr,lc])=>lr===br&&lc===bc);
      if(isLegal) {
        const piece=board[selBr][selBc], type=pt(piece), color=pc(piece);
        const isPromo = type==='P'&&((color==='w'&&br===0)||(color==='b'&&br===7));
        if(isPromo){ setPendingPromo({fr:selBr,fc:selBc,tr:br,tc:bc}); setSelected(null); setLegalMoves([]); return; }
        executeMove(selBr,selBc,br,bc,null);
        return;
      }
      // Reselect own piece
      if(board[br][bc]&&pc(board[br][bc])===myColor&&isMyTurn) {
        setSelected([br,bc]);
        setLegalMoves(getLegal(board,br,bc,ep,castling));
        return;
      }
      setSelected(null); setLegalMoves([]); return;
    }

    if(!isMyTurn) return;
    const piece=board[br][bc];
    if(!piece||pc(piece)!==myColor) return;
    setSelected([br,bc]);
    setLegalMoves(getLegal(board,br,bc,ep,castling));
  };

  // ─────────────────── RENDER ──────────────────────────────────────────────────

  if(!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-12">
        <motion.div animate={{rotate:360}} transition={{repeat:Infinity,duration:1,ease:'linear'}}
          className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mb-4"/>
        <p className="text-amber-200 font-bold animate-pulse">Connecting to chess server...</p>
      </div>
    );
  }

  // ── MENU ────────────────────────────────────────────────────────────────────
  if(screen==='menu') {
    const board = [...leaderboard].sort((a,b)=>(b.wins||0)-(a.wins||0));
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
            <motion.div initial={{opacity:0,x:-24}} animate={{opacity:1,x:0,transition:{delay:0.1}}}
              className="bg-slate-900/80 backdrop-blur rounded-3xl border border-white/10 p-6 space-y-5 shadow-2xl">
              <h2 className="text-white font-black text-2xl">Play</h2>
              <motion.button whileHover={{scale:1.02,boxShadow:'0 0 28px rgba(217,119,6,0.3)'}} whileTap={{scale:0.98}}
                onClick={createGame} disabled={loading}
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
                  onClick={joinGame} disabled={loading||!joinCode.trim()}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all">
                  {loading?'Joining...':'🔗 Join Room'}
                </motion.button>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-1.5 text-sm text-slate-400">
                <div className="text-white font-bold mb-2">Rules</div>
                <div>⬜ Host plays <strong className="text-white">White</strong>, guest plays <strong className="text-white">Black</strong></div>
                <div>♟ All standard rules: castling, en passant, promotion</div>
                <div>♚ Checkmate or resign to end the game</div>
                <div>🔄 Use the flip button to change board orientation</div>
              </div>
            </motion.div>
            <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0,transition:{delay:0.2}}}>
              <ChessLeaderboard entries={board} myId={myId}/>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if(screen==='waiting') {
    const isHost = gameData?.hostId===myId;
    const po     = gameData?.playerOrder||[];
    const pl     = gameData?.players||{};
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div>
            <div className="text-5xl mb-3" style={{fontFamily:'serif'}}>♟</div>
            <h2 className="text-3xl font-black text-white mb-1">Waiting for Opponent</h2>
            <p className="text-slate-400">{po.length}/2 players</p>
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 hover:border-amber-400 rounded-2xl p-5 cursor-pointer transition-colors"
            onClick={()=>{navigator.clipboard?.writeText(roomCode);showToast('Copied!','success');}}>
            <p className="font-mono text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">{roomCode}</p>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">Tap to copy</p>
          </div>
          <div className="space-y-2 text-left">
            {po.map((pid,i)=>(
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
            <button onClick={leaveGame} className="w-full py-3 rounded-2xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-red-400 transition-colors">Leave Room</button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING / FINISHED ───────────────────────────────────────────────────────
  if(screen==='playing'||screen==='finished') {
    if(!gameData?.boardJson) {
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

    const myPlayer  = Object.values(players).find(p=>p.id===myId)||{name:myName,color:myColor};
    const oppPlayer = Object.values(players).find(p=>p.id!==myId)||{name:'Opponent'};
    const inCheck   = isInCheck(board, turn);
    const checkKing = inCheck ? findKing(board, turn) : null;

    const displayFlipped = flipped;

    const renderBoard = () => {
      const rows = displayFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
      const cols = displayFlipped ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];

      return (
        <div className="relative select-none">
          {/* Board outer frame */}
          <div className="rounded-2xl p-3 shadow-2xl" style={{background:'linear-gradient(135deg,#5d3a1a,#3d2208)'}}>
            {/* Rank labels + board + file labels */}
            <div className="flex">
              {/* Rank labels */}
              <div className="flex flex-col justify-around pr-1.5" style={{width:'1.2rem'}}>
                {rows.map(r=>(
                  <span key={r} className="text-center font-bold" style={{color:'#c8a97e',fontSize:'0.6rem',lineHeight:1}}>
                    {displayFlipped?r+1:8-r}
                  </span>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-8 rounded-lg overflow-hidden"
                style={{width:'min(80vw,480px)',height:'min(80vw,480px)',gridTemplateRows:'repeat(8,1fr)'}}>
                {rows.map(dr=>cols.map(dc=>{
                  const [br,bc] = toBoardPos(dr,dc,displayFlipped);
                  const piece   = board[br][bc];
                  const isLight = (br+bc)%2===0;
                  const isSel   = selected&&selected[0]===br&&selected[1]===bc;
                  const isLegal = legalMoves.some(([lr,lc])=>lr===br&&lc===bc);
                  const isLast  = lastMove&&((lastMove.fr===br&&lastMove.fc===bc)||(lastMove.tr===br&&lastMove.tc===bc));
                  const isChk   = checkKing&&checkKing[0]===br&&checkKing[1]===bc;
                  const isCaptureLegal = isLegal && !!piece;

                  let sqColor = isLight ? '#f0d9b5' : '#b58863';
                  if(isChk)  sqColor = isLight ? '#ff6b6b' : '#cc2222';
                  else if(isSel)  sqColor = isLight ? '#f6f669' : '#baca2b';
                  else if(isLast) sqColor = isLight ? '#cdd26a' : '#aaa23a';

                  return (
                    <div key={`${br}-${bc}`}
                      onClick={()=>status==='playing'&&handleSquareClick(dr,dc)}
                      className={`relative flex items-center justify-center ${status==='playing'&&isMyTurn?'cursor-pointer':''}`}
                      style={{backgroundColor:sqColor,transition:'background-color 0.15s'}}>

                      {/* Legal move indicator (empty) */}
                      {isLegal&&!isCaptureLegal&&(
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                          <div className="rounded-full" style={{width:'32%',height:'32%',background:'rgba(20,85,30,0.45)'}}/>
                        </div>
                      )}
                      {/* Legal capture ring */}
                      {isCaptureLegal&&(
                        <div className="absolute inset-0 pointer-events-none z-10 rounded-sm"
                          style={{boxShadow:'inset 0 0 0 4px rgba(20,85,30,0.5)'}}/>
                      )}

                      {/* Piece */}
                      {piece&&(
                        <motion.div
                          key={`${piece}-${br}-${bc}`}
                          initial={{scale:0.8,opacity:0}}
                          animate={{scale:1,opacity:1}}
                          transition={{type:'spring',stiffness:400,damping:22}}
                          className="relative z-20 flex items-center justify-center w-full h-full"
                          style={{
                            filter: isSel ? 'drop-shadow(0 0 8px rgba(255,220,0,0.9))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))',
                            cursor: status==='playing'&&isMyTurn&&pc(piece)===myColor ? 'pointer' : 'default',
                            fontSize: 'min(7vw, 3.4rem)',
                          }}>
                          <Piece piece={piece} size={0.85}/>
                        </motion.div>
                      )}
                    </div>
                  );
                }))}
              </div>

              {/* Right margin */}
              <div className="w-2"/>
            </div>

            {/* File labels */}
            <div className="flex pl-5 pt-1.5">
              {cols.map(dc=>(
                <div key={dc} className="flex-1 text-center font-bold" style={{color:'#c8a97e',fontSize:'0.6rem'}}>
                  {FILES[displayFlipped?7-dc:dc]}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    const renderSidePanel = () => (
      <div className="flex flex-col gap-3 min-w-0 md:w-56">
        {/* Opponent */}
        <div className={`bg-slate-900/80 rounded-2xl p-3 border-2 transition-all ${!isMyTurn&&status==='playing'?'border-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.3)]':'border-white/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{oppPlayer.color==='w'?'⬜':'⬛'}</span>
            <span className="text-white font-bold text-sm truncate">{oppPlayer.name}</span>
            {!isMyTurn&&status==='playing'&&<motion.span animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:1}} className="ml-auto text-amber-400 text-xs font-bold">thinking...</motion.span>}
          </div>
          <div className="flex flex-wrap gap-0.5 min-h-[1.2rem]">
            {captured[myColor==='w'?'w':'b'].map((p,i)=>(
              <span key={i} style={{fontSize:'0.9rem',color:pc(p)==='w'?'#fffdf0':'#1c1c2e',textShadow:pc(p)==='w'?'0 0 2px #000':'none',fontFamily:'serif'}}>{PIECE_SYM[pt(p)]}</span>
            ))}
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

        {/* My player */}
        <div className={`bg-slate-900/80 rounded-2xl p-3 border-2 transition-all ${isMyTurn&&status==='playing'?'border-amber-500 shadow-[0_0_12px_rgba(217,119,6,0.3)]':'border-white/10'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{myColor==='w'?'⬜':'⬛'}</span>
            <span className="text-white font-bold text-sm truncate">{myPlayer.name} (You)</span>
            {isMyTurn&&<motion.span animate={{opacity:[0.5,1,0.5]}} transition={{repeat:Infinity,duration:0.9}} className="ml-auto text-amber-400 text-xs font-bold">your turn</motion.span>}
          </div>
          <div className="flex flex-wrap gap-0.5 min-h-[1.2rem]">
            {captured[myColor==='w'?'b':'w'].map((p,i)=>(
              <span key={i} style={{fontSize:'0.9rem',color:pc(p)==='w'?'#fffdf0':'#1c1c2e',textShadow:pc(p)==='w'?'0 0 2px #000':'none',fontFamily:'serif'}}>{PIECE_SYM[pt(p)]}</span>
            ))}
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
      return (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <motion.div initial={{scale:0.5,y:60}} animate={{scale:1,y:0}} transition={{type:'spring',stiffness:200,damping:20}}
            className="bg-slate-900 border border-white/20 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl space-y-5">
            <div className="text-6xl">{isDraw?'🤝':isWinner?'🏆':'😔'}</div>
            <h2 className={`text-4xl font-black ${isDraw?'text-slate-300':isWinner?'text-yellow-400':'text-slate-400'}`}>
              {isDraw?'Draw!':isWinner?'You Win!':'You Lose'}
            </h2>
            <p className="text-slate-400 text-sm capitalize">{reason==='checkmate'?'Checkmate!':reason==='stalemate'?'Stalemate':reason==='resign'?'Opponent resigned':'Game over'}</p>
            {isWinner&&!isDraw&&(
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3">
                <p className="text-yellow-300 font-bold text-sm">🏆 Win recorded on leaderboard!</p>
              </div>
            )}
            <button onClick={leaveGame}
              className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 transition-all shadow-xl">
              Back to Menu
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
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`turn-${turn}`} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              className={`text-sm font-black px-3 py-1.5 rounded-full border ${isMyTurn?'bg-amber-500/20 text-amber-400 border-amber-500/40':'bg-slate-800 text-slate-300 border-slate-700'}`}>
              {isMyTurn?'⚡ Your Turn':`${turn==='w'?'White':'Black'} to move`}
              {inCheck&&<span className="ml-2 text-red-400">· Check!</span>}
            </motion.div>
          </AnimatePresence>
          <button onClick={leaveGame} className="text-slate-600 hover:text-red-400 text-xs font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10">Leave</button>
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
