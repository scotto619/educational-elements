// pages/teacher-tools.js — Teacher Toolkit
// All tools purpose-built for the windowed workspace. Pastel, no gradients.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// ─── Tool Registry ────────────────────────────────────────────────────────────
const TOOLS = [
  { id:'timer',       label:'Timer',        emoji:'⏰', header:'#FDE68A', text:'#92400E', bg:'#FFFBEB', w:360, h:460 },
  { id:'dice',        label:'Dice',         emoji:'🎲', header:'#BFDBFE', text:'#1E3A5F', bg:'#EFF6FF', w:400, h:420 },
  { id:'name-picker', label:'Name Picker',  emoji:'🎯', header:'#DDD6FE', text:'#4C1D95', bg:'#F5F3FF', w:360, h:440 },
  { id:'groups',      label:'Group Maker',  emoji:'👥', header:'#BBF7D0', text:'#14532D', bg:'#F0FDF4', w:420, h:500 },
  { id:'checklist',   label:'Checklist',    emoji:'✅', header:'#FEF08A', text:'#713F12', bg:'#FEFCE8', w:360, h:480 },
  { id:'brain-break', label:'Brain Break',  emoji:'🧠', header:'#FBCFE8', text:'#831843', bg:'#FFF0F7', w:380, h:400 },
  { id:'help-queue',  label:'Help Queue',   emoji:'🙋', header:'#C7D2FE', text:'#312E81', bg:'#EEF2FF', w:400, h:480 },
  { id:'jobs',        label:'Class Jobs',   emoji:'💼', header:'#A5F3FC', text:'#164E63', bg:'#ECFEFF', w:420, h:500 },
  { id:'clock',       label:'Clock',        emoji:'🕐', header:'#E9D5FF', text:'#4C1D95', bg:'#FAF5FF', w:300, h:200 },
  { id:'random-num',  label:'Random Number',emoji:'🔢', header:'#A7F3D0', text:'#065F46', bg:'#ECFDF5', w:320, h:280 },
  { id:'noise',       label:'Noise Meter',  emoji:'🔊', header:'#FED7AA', text:'#7C2D12', bg:'#FFF7ED', w:320, h:290 },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
const PASTEL_CHIPS = ['#FDE68A','#BBF7D0','#BFDBFE','#DDD6FE','#FBCFE8','#A5F3FC','#FCA5A5','#FEF08A'];

// ════════════════════════════════════════════════════════════════════════════
// TIMER
// ════════════════════════════════════════════════════════════════════════════
function TimerTool() {
  const [total, setTotal]     = useState(300);
  const [left, setLeft]       = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('5:00');
  const intRef = useRef(null);

  const R = 72, CIRC = 2 * Math.PI * R;
  const pct = total > 0 ? left / total : 0;
  const dash = CIRC * (1 - pct);
  const ringCol = pct > 0.5 ? '#4ADE80' : pct > 0.2 ? '#FBBF24' : '#F87171';
  const mm = Math.floor(left/60).toString().padStart(2,'0');
  const ss = (left%60).toString().padStart(2,'0');

  const chime = () => { try { const ctx=new(window.AudioContext||window.webkitAudioContext)(); [880,1100,1320].forEach((f,i)=>{ const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f; const t=ctx.currentTime+i*0.18; g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.25,t+0.04);g.gain.exponentialRampToValueAtTime(0.001,t+0.6); o.start(t);o.stop(t+0.65); }); } catch(e){} };

  useEffect(() => {
    if (running && left > 0) {
      intRef.current = setInterval(() => setLeft(l => { if(l<=1){setRunning(false);setDone(true);chime();return 0;} return l-1; }),1000);
    }
    return () => clearInterval(intRef.current);
  }, [running]);

  const applyEdit = () => {
    const pts=editVal.split(':'); let s=0;
    if(pts.length===2) s=parseInt(pts[0]||0)*60+parseInt(pts[1]||0);
    else s=parseInt(pts[0]||0)*60;
    if(!isNaN(s)&&s>0){setTotal(s);setLeft(s);setRunning(false);setDone(false);}
    setEditing(false);
  };
  const preset = s => { setTotal(s);setLeft(s);setRunning(false);setDone(false); };
  const reset  = () => { setRunning(false);setLeft(total);setDone(false); };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,padding:'20px 16px'}}>
      <div style={{position:'relative',width:180,height:180}}>
        <svg width="180" height="180" style={{transform:'rotate(-90deg)',display:'block'}}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="#F3F4F6" strokeWidth="10"/>
          <circle cx="90" cy="90" r={R} fill="none" stroke={done?'#F87171':ringCol} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dash}
            style={{transition:'stroke-dashoffset 0.9s linear,stroke 0.4s'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
          {editing ? (
            <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)}
              onBlur={applyEdit} onKeyDown={e=>e.key==='Enter'&&applyEdit()}
              style={{width:100,textAlign:'center',fontSize:28,fontWeight:900,border:'none',background:'transparent',color:'#111827',outline:'none',fontVariantNumeric:'tabular-nums'}}/>
          ) : (
            <div onClick={()=>{if(!running){setEditVal(`${Math.floor(total/60)}:${(total%60).toString().padStart(2,'0')}`);setEditing(true);}}}
              style={{fontSize:38,fontWeight:900,color:done?'#EF4444':'#111827',cursor:running?'default':'pointer',fontVariantNumeric:'tabular-nums',letterSpacing:'-1px',userSelect:'none'}}>
              {mm}:{ss}
            </div>
          )}
          {!editing && <div style={{fontSize:11,color:'#9CA3AF',fontWeight:600}}>{done?'✅ Done!':running?'running':'tap to edit'}</div>}
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
        {[[1,60],[2,120],[5,300],[10,600],[15,900],[20,1200],[30,1800]].map(([m,s])=>(
          <button key={m} onClick={()=>preset(s)} style={{background:total===s?'#FDE68A':'#F9FAFB',border:total===s?'2px solid #F59E0B':'2px solid #E5E7EB',borderRadius:10,padding:'5px 11px',fontSize:13,fontWeight:700,cursor:'pointer',color:total===s?'#78350F':'#6B7280',transition:'all 0.15s'}}>{m}m</button>
        ))}
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>{if(running)setRunning(false);else{setDone(false);setRunning(true);}}}
          style={{background:running?'#FECACA':'#BBF7D0',border:running?'2px solid #FCA5A5':'2px solid #86EFAC',borderRadius:14,padding:'11px 26px',fontSize:15,fontWeight:800,cursor:'pointer',color:running?'#991B1B':'#14532D',minWidth:110,transition:'all 0.15s'}}>
          {running?'⏸ Pause':left===0?'↺ Restart':'▶ Start'}
        </button>
        <button onClick={reset} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'11px 16px',fontSize:18,fontWeight:800,cursor:'pointer',color:'#9CA3AF'}}>↺</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DICE
// ════════════════════════════════════════════════════════════════════════════
const DOT_GRID={1:[0,0,0,0,1,0,0,0,0],2:[1,0,0,0,0,0,0,0,1],3:[1,0,0,0,1,0,0,0,1],4:[1,0,1,0,0,0,1,0,1],5:[1,0,1,0,1,0,1,0,1],6:[1,0,1,1,0,1,1,0,1]};
const DCOLS=['#F87171','#60A5FA','#34D399','#FBBF24','#A78BFA','#F472B6'];

function DieFace({value,color,size=76,rolling}){
  const dots=DOT_GRID[value]||DOT_GRID[1];
  return (
    <div style={{width:size,height:size,background:'white',borderRadius:16,border:`2.5px solid ${color}55`,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:size<70?3:5,padding:size<70?9:11,boxShadow:`0 4px 16px ${color}22`,animation:rolling?'diceWobble 0.5s ease-in-out':'none'}}>
      {dots.map((on,i)=><div key={i} style={{borderRadius:'50%',background:on?color:'transparent',width:'100%',aspectRatio:'1'}}/>)}
    </div>
  );
}

function DiceTool(){
  const [dice,setDice]=useState([{id:1,type:6,value:1,rolling:false}]);
  const rollOne=id=>{
    setDice(p=>p.map(d=>d.id===id?{...d,rolling:true}:d));
    setTimeout(()=>setDice(p=>p.map(d=>d.id===id?{...d,value:Math.floor(Math.random()*d.type)+1,rolling:false}:d)),480);
  };
  const rollAll=()=>dice.forEach(d=>rollOne(d.id));
  const addDie=type=>{if(dice.length>=6)return;setDice(p=>[...p,{id:Date.now(),type,value:Math.floor(Math.random()*type)+1,rolling:false}]);};
  const removeDie=id=>setDice(p=>p.filter(d=>d.id!==id));
  const total=dice.reduce((s,d)=>s+(d.value||0),0);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'18px 16px'}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',minHeight:90}}>
        {dice.map((die,idx)=>{
          const color=DCOLS[idx%DCOLS.length];
          return (
            <div key={die.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
              <div onClick={()=>rollOne(die.id)} style={{cursor:'pointer'}} title="Click to roll">
                {die.type===6?<DieFace value={die.value||1} color={color} rolling={die.rolling}/>:
                  <div style={{width:76,height:76,background:'white',borderRadius:16,border:`2.5px solid ${color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:900,color,boxShadow:`0 4px 16px ${color}22`,animation:die.rolling?'diceWobble 0.5s ease-in-out':'none',fontVariantNumeric:'tabular-nums'}}>
                    {die.rolling?'?':die.value}
                  </div>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <span style={{fontSize:11,color:'#9CA3AF',fontWeight:700}}>D{die.type}</span>
                {dice.length>1&&<button onClick={()=>removeDie(die.id)} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13,padding:0}}>×</button>}
              </div>
            </div>
          );
        })}
      </div>
      {dice.length>1&&<div style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:12,padding:'6px 18px',fontSize:14,fontWeight:800,color:'#374151'}}>Total: <span style={{color:'#1D4ED8',fontSize:16}}>{total}</span></div>}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
        {[4,6,8,10,12,20].map(t=>(
          <button key={t} onClick={()=>addDie(t)} disabled={dice.length>=6} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'5px 10px',fontSize:12,fontWeight:700,cursor:dice.length>=6?'not-allowed':'pointer',color:'#6B7280',opacity:dice.length>=6?0.45:1}}>+D{t}</button>
        ))}
      </div>
      <button onClick={rollAll} style={{background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:14,padding:'12px 0',fontSize:16,fontWeight:800,cursor:'pointer',color:'#1E3A5F',width:'100%'}}>🎲 Roll All</button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// NAME PICKER
// ════════════════════════════════════════════════════════════════════════════
function NamePickerTool({ students }) {
  const [display, setDisplay] = useState('?');
  const [picked, setPicked]   = useState(new Set());
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner]   = useState(null);
  const timerRef = useRef(null);

  const available = students.filter(s => !picked.has(s.id || s.firstName));

  const spin = () => {
    if (spinning || available.length === 0) return;
    setSpinning(true); setWinner(null);
    let count = 0; const total = 22;
    const tick = delay => {
      const r = available[Math.floor(Math.random() * available.length)];
      setDisplay(r.firstName || r.name || '?');
      count++;
      if (count < total) {
        const next = Math.min(delay * (1 + count / (total * 0.6)), 280);
        timerRef.current = setTimeout(() => tick(next), next);
      } else {
        const w = available[Math.floor(Math.random() * available.length)];
        setDisplay(w.firstName || w.name || '?');
        setWinner(w);
        setPicked(p => new Set([...p, w.id || w.firstName]));
        setSpinning(false);
      }
    };
    tick(55);
  };

  const reset = () => { setPicked(new Set()); setDisplay('?'); setWinner(null); clearTimeout(timerRef.current); setSpinning(false); };
  const noStudents = students.length === 0;
  const allPicked  = available.length === 0 && students.length > 0;

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'20px 16px'}}>
      {/* Big display */}
      <div style={{
        width:'100%',background:'white',borderRadius:20,padding:'28px 20px',
        textAlign:'center',border:'2px solid #EDE9FE',minHeight:120,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
        boxShadow:'0 2px 12px rgba(139,92,246,0.08)'
      }}>
        <div style={{fontSize:winner?52:38,fontWeight:900,color:winner?'#5B21B6':'#9CA3AF',letterSpacing:'-1px',transition:'font-size 0.2s',lineHeight:1.1}}>
          {noStudents?'No students':allPicked&&!spinning?'All picked!':display}
        </div>
        {winner&&<div style={{fontSize:12,color:'#8B5CF6',fontWeight:700,background:'#EDE9FE',borderRadius:20,padding:'3px 12px'}}>✨ Selected!</div>}
      </div>

      {/* Progress */}
      {students.length > 0 && (
        <div style={{width:'100%'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:700,color:'#9CA3AF',marginBottom:6}}>
            <span>{picked.size} picked</span><span>{available.length} remaining</span>
          </div>
          <div style={{width:'100%',height:6,background:'#EDE9FE',borderRadius:99}}>
            <div style={{height:'100%',background:'#8B5CF6',borderRadius:99,width:`${students.length>0?(picked.size/students.length)*100:0}%`,transition:'width 0.4s'}}/>
          </div>
        </div>
      )}

      {/* Who's been picked */}
      {picked.size > 0 && (
        <div style={{width:'100%',display:'flex',gap:5,flexWrap:'wrap'}}>
          {students.filter(s=>picked.has(s.id||s.firstName)).map(s=>(
            <span key={s.id||s.firstName} style={{background:'#EDE9FE',color:'#5B21B6',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700}}>
              {s.firstName||s.name}
            </span>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{display:'flex',gap:10,width:'100%'}}>
        <button onClick={spin} disabled={spinning||noStudents||allPicked}
          style={{flex:1,background:spinning||noStudents||allPicked?'#F3F4F6':'#DDD6FE',border:spinning||noStudents||allPicked?'2px solid #E5E7EB':'2px solid #C4B5FD',borderRadius:14,padding:'12px',fontSize:15,fontWeight:800,cursor:spinning||noStudents||allPicked?'not-allowed':'pointer',color:spinning||noStudents||allPicked?'#9CA3AF':'#4C1D95',transition:'all 0.15s'}}>
          {spinning?'Spinning…':allPicked?'All done!':'🎯 Pick!'}
        </button>
        <button onClick={reset} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'12px 14px',fontSize:15,cursor:'pointer',color:'#9CA3AF',fontWeight:700}} title="Reset">↺</button>
      </div>

      {noStudents && <p style={{fontSize:13,color:'#9CA3AF',fontWeight:600,textAlign:'center'}}>Add students to your class to use this tool</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// GROUP MAKER
// ════════════════════════════════════════════════════════════════════════════
function GroupMakerTool({ students }) {
  const [mode, setMode]       = useState('size');   // 'size' | 'count'
  const [groupSize, setGroupSize] = useState(3);
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups]   = useState([]);
  const [made, setMade]       = useState(false);

  const makeGroups = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const result = [];
    if (mode === 'size') {
      for (let i = 0; i < shuffled.length; i += groupSize) result.push(shuffled.slice(i, i + groupSize));
    } else {
      const n = Math.min(groupCount, shuffled.length);
      for (let i = 0; i < n; i++) result.push([]);
      shuffled.forEach((s, i) => result[i % n].push(s));
    }
    setGroups(result); setMade(true);
  };

  const noStudents = students.length === 0;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14,padding:'18px 16px'}}>
      {/* Mode selector */}
      <div style={{display:'flex',background:'#F3F4F6',borderRadius:12,padding:3,gap:3}}>
        {[['size','Group size'],['count','No. of groups']].map(([m,l])=>(
          <button key={m} onClick={()=>setMode(m)} style={{flex:1,background:mode===m?'white':'transparent',border:'none',borderRadius:10,padding:'8px',fontSize:13,fontWeight:700,cursor:'pointer',color:mode===m?'#14532D':'#6B7280',boxShadow:mode===m?'0 1px 4px rgba(0,0,0,0.08)':'none',transition:'all 0.15s'}}>
            {l}
          </button>
        ))}
      </div>

      {/* Size input */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
        <button onClick={()=>mode==='size'?setGroupSize(s=>Math.max(2,s-1)):setGroupCount(c=>Math.max(2,c-1))}
          style={{width:36,height:36,borderRadius:10,background:'#F0FDF4',border:'2px solid #BBF7D0',fontSize:20,fontWeight:900,cursor:'pointer',color:'#15803D',display:'flex',alignItems:'center',justifyContent:'center'}}>−</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:36,fontWeight:900,color:'#14532D',lineHeight:1}}>{mode==='size'?groupSize:groupCount}</div>
          <div style={{fontSize:12,color:'#6B7280',fontWeight:600}}>{mode==='size'?'per group':'groups'}</div>
        </div>
        <button onClick={()=>mode==='size'?setGroupSize(s=>Math.min(students.length||20,s+1)):setGroupCount(c=>Math.min(students.length||20,c+1))}
          style={{width:36,height:36,borderRadius:10,background:'#F0FDF4',border:'2px solid #BBF7D0',fontSize:20,fontWeight:900,cursor:'pointer',color:'#15803D',display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
      </div>

      {/* Make button */}
      <button onClick={makeGroups} disabled={noStudents}
        style={{background:noStudents?'#F3F4F6':'#BBF7D0',border:noStudents?'2px solid #E5E7EB':'2px solid #86EFAC',borderRadius:14,padding:'12px',fontSize:15,fontWeight:800,cursor:noStudents?'not-allowed':'pointer',color:noStudents?'#9CA3AF':'#14532D',transition:'all 0.15s'}}>
        {made?'🔀 Shuffle':'👥 Make Groups'}
      </button>

      {/* Groups */}
      {groups.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:220,overflowY:'auto'}}>
          {groups.map((g,i)=>(
            <div key={i} style={{background:'white',borderRadius:14,padding:'10px 14px',border:`2px solid ${PASTEL_CHIPS[i%PASTEL_CHIPS.length]}`,display:'flex',alignItems:'center',gap:10}}>
              <div style={{width:28,height:28,borderRadius:8,background:PASTEL_CHIPS[i%PASTEL_CHIPS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#374151',flexShrink:0}}>
                {i+1}
              </div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                {g.map(s=>(
                  <span key={s.id||s.firstName} style={{fontSize:13,fontWeight:700,color:'#374151'}}>{s.firstName||s.name}{g.indexOf(s)<g.length-1?',':''}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {noStudents && <p style={{fontSize:13,color:'#9CA3AF',fontWeight:600,textAlign:'center'}}>Add students to your class to use this tool</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CHECKLIST
// ════════════════════════════════════════════════════════════════════════════
const CHECKLIST_TEMPLATES = {
  morning: [
    { id:1, text:'Hang up backpack',   emoji:'🎒' },
    { id:2, text:'Unpack homework',    emoji:'📚' },
    { id:3, text:'Sharpen pencils',    emoji:'✏️' },
    { id:4, text:'Morning journal',    emoji:'📖' },
    { id:5, text:'Ready to learn!',    emoji:'⭐' },
  ],
  packup: [
    { id:1, text:'Clear your desk',   emoji:'🧹' },
    { id:2, text:'Pack your bag',      emoji:'🎒' },
    { id:3, text:'Tuck in your chair', emoji:'🪑' },
    { id:4, text:'Pick up rubbish',    emoji:'🗑️' },
    { id:5, text:'Line up quietly',    emoji:'🚶' },
  ],
  focus: [
    { id:1, text:'Eyes on the board',  emoji:'👀' },
    { id:2, text:'Pencil down',        emoji:'✏️' },
    { id:3, text:'Lips sealed',        emoji:'🤫' },
    { id:4, text:'Sit up straight',    emoji:'💺' },
    { id:5, text:'Hands to yourself',  emoji:'🙌' },
  ],
};

function ChecklistTool() {
  const [tab, setTab]       = useState('morning');
  const [done, setDone]     = useState(new Set());
  const [custom, setCustom] = useState([]);
  const [newItem, setNewItem] = useState('');

  const items = tab === 'custom' ? custom : CHECKLIST_TEMPLATES[tab];
  const toggle = id => setDone(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });
  const resetAll = () => setDone(new Set());
  const addCustom = () => {
    if (!newItem.trim()) return;
    setCustom(p=>[...p,{id:Date.now(),text:newItem.trim(),emoji:'📌'}]);
    setNewItem('');
  };
  const pct = items.length > 0 ? Math.round((done.size / items.length) * 100) : 0;

  const TABS = [['morning','🌅','Morning'],['packup','📦','Pack Up'],['focus','👀','Focus'],['custom','✏️','Custom']];

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'16px'}}>
      {/* Tab row */}
      <div style={{display:'flex',gap:4,overflowX:'auto',paddingBottom:2}}>
        {TABS.map(([t,e,l])=>(
          <button key={t} onClick={()=>{setTab(t);setDone(new Set());}} style={{flexShrink:0,background:tab===t?'#FEF08A':'#F9FAFB',border:tab===t?'2px solid #FCD34D':'2px solid #E5E7EB',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:700,cursor:'pointer',color:tab===t?'#713F12':'#6B7280',transition:'all 0.15s'}}>
            {e} {l}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:700,color:'#9CA3AF',marginBottom:5}}>
          <span>{done.size}/{items.length} done</span><span style={{color:pct===100?'#16A34A':'#9CA3AF'}}>{pct===100?'✅ Complete!':pct+'%'}</span>
        </div>
        <div style={{width:'100%',height:7,background:'#F3F4F6',borderRadius:99}}>
          <div style={{height:'100%',background:pct===100?'#4ADE80':'#FCD34D',borderRadius:99,width:`${pct}%`,transition:'width 0.35s'}}/>
        </div>
      </div>

      {/* Items */}
      <div style={{display:'flex',flexDirection:'column',gap:7}}>
        {items.map(item=>{
          const isDone = done.has(item.id);
          return (
            <button key={item.id} onClick={()=>toggle(item.id)} style={{display:'flex',alignItems:'center',gap:12,background:isDone?'#F0FDF4':'white',border:isDone?'2px solid #BBF7D0':'2px solid #E5E7EB',borderRadius:12,padding:'10px 14px',cursor:'pointer',transition:'all 0.15s',textAlign:'left'}}>
              <div style={{width:26,height:26,borderRadius:8,background:isDone?'#4ADE80':'#F3F4F6',border:isDone?'2px solid #22C55E':'2px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0,transition:'all 0.2s'}}>
                {isDone?'✓':''}
              </div>
              <span style={{fontSize:19,flexShrink:0}}>{item.emoji}</span>
              <span style={{fontSize:14,fontWeight:700,color:isDone?'#15803D':'#374151',textDecoration:isDone?'line-through':'none',transition:'all 0.15s'}}>
                {item.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Custom add */}
      {tab==='custom'&&(
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <input value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCustom()}
            placeholder="Add an item…"
            style={{flex:1,border:'2px solid #FCD34D',borderRadius:10,padding:'8px 12px',fontSize:13,fontWeight:700,color:'#374151',outline:'none',background:'#FEFCE8'}}/>
          <button onClick={addCustom} style={{background:'#FEF08A',border:'2px solid #FCD34D',borderRadius:10,padding:'8px 14px',fontSize:14,fontWeight:800,cursor:'pointer',color:'#713F12'}}>+</button>
        </div>
      )}

      {/* Reset */}
      {done.size>0&&<button onClick={resetAll} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:12,padding:'8px',fontSize:13,fontWeight:700,cursor:'pointer',color:'#9CA3AF'}}>↺ Reset all</button>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BRAIN BREAK
// ════════════════════════════════════════════════════════════════════════════
const BRAIN_BREAKS = [
  { name:'Dance Freeze',       duration:'2–3 min', type:'Movement',  emoji:'💃', desc:'Play music and everyone dances freely. When the music stops — freeze! Anyone still moving sits out.' },
  { name:'20 Jumping Jacks',   duration:'1 min',   type:'Exercise',  emoji:'🤸', desc:'Count out loud together as a class. Try to beat your time from last round!' },
  { name:'Silent Ball',        duration:'3–5 min', type:'Focus',     emoji:'⚽', desc:'Pass a ball in silence. Drop it, talk, or make a bad throw and you\'re out. Last one standing wins!' },
  { name:'Would You Rather',   duration:'2 min',   type:'Discussion',emoji:'🤔', desc:'Move to different sides of the room for each choice. Then defend your decision!' },
  { name:'Mirror Partner',     duration:'2 min',   type:'Movement',  emoji:'🪞', desc:'Face your partner. One leads, one mirrors exactly. Swap roles after 1 minute.' },
  { name:'4-7-8 Breathing',    duration:'2 min',   type:'Calm',      emoji:'🌬️', desc:'Breathe in for 4, hold for 7, exhale for 8. Repeat 4 times. Great for refocusing.' },
  { name:'Rock Paper Scissors',duration:'2 min',   type:'Game',      emoji:'✂️', desc:'Tournament style! Losers become cheerleaders for their winner. Last one standing wins the class!' },
  { name:'Simon Says',         duration:'3 min',   type:'Focus',     emoji:'🎯', desc:'Classic Simon Says — teacher leads first. Try to trick the class! Fastest out wins.' },
  { name:'Desk Stretches',     duration:'2 min',   type:'Exercise',  emoji:'🧘', desc:'Lead 8 desk stretches: neck rolls, shoulder shrugs, wrist circles, forward bend, and more.' },
  { name:'Thumb War',          duration:'2 min',   type:'Game',      emoji:'👍', desc:'Thumb war with your neighbour. Best of 3. Winners play each other until there\'s a class champion!' },
  { name:'10 Deep Breaths',    duration:'1 min',   type:'Calm',      emoji:'💨', desc:'Everyone stands. Take 10 slow, deep breaths together. Hands on belly to feel it move.' },
  { name:'Clapping Rhythm',    duration:'2 min',   type:'Focus',     emoji:'👏', desc:'Teacher claps a rhythm — class repeats it. Gradually get faster and more complex.' },
];
const BB_TYPES = ['All','Movement','Exercise','Focus','Discussion','Calm','Game'];
const BB_COLS  = { Movement:'#FBCFE8', Exercise:'#BBF7D0', Focus:'#BFDBFE', Discussion:'#FDE68A', Calm:'#DDD6FE', Game:'#FCA5A5' };

function BrainBreakTool() {
  const [filter, setFilter] = useState('All');
  const [idx, setIdx]       = useState(0);
  const pool = filter==='All' ? BRAIN_BREAKS : BRAIN_BREAKS.filter(b=>b.type===filter);
  const current = pool[idx % pool.length] || pool[0];
  const next = () => setIdx(i=>(i+1)%pool.length);
  const rand = () => setIdx(Math.floor(Math.random()*pool.length));
  const col = BB_COLS[current.type] || '#F3F4F6';

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14,padding:'16px'}}>
      {/* Filter chips */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
        {BB_TYPES.map(t=>(
          <button key={t} onClick={()=>{setFilter(t);setIdx(0);}} style={{background:filter===t?'#FBCFE8':'#F9FAFB',border:filter===t?'2px solid #F9A8D4':'2px solid #E5E7EB',borderRadius:20,padding:'4px 12px',fontSize:12,fontWeight:700,cursor:'pointer',color:filter===t?'#831843':'#6B7280',transition:'all 0.15s'}}>
            {t}
          </button>
        ))}
      </div>

      {/* Card */}
      <div style={{background:col,borderRadius:18,padding:'20px',border:`2px solid ${col}`,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{fontSize:48,marginBottom:10,textAlign:'center'}}>{current.emoji}</div>
        <div style={{fontSize:20,fontWeight:900,color:'#111827',marginBottom:4,textAlign:'center',letterSpacing:'-0.3px'}}>{current.name}</div>
        <div style={{display:'flex',justifyContent:'center',gap:8,marginBottom:12}}>
          <span style={{background:'rgba(0,0,0,0.07)',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700,color:'#374151'}}>⏱ {current.duration}</span>
          <span style={{background:'rgba(0,0,0,0.07)',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700,color:'#374151'}}>{current.type}</span>
        </div>
        <p style={{fontSize:14,color:'#374151',lineHeight:1.55,textAlign:'center'}}>{current.desc}</p>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:8}}>
        <button onClick={rand} style={{flex:1,background:'#FBCFE8',border:'2px solid #F9A8D4',borderRadius:14,padding:'11px',fontSize:14,fontWeight:800,cursor:'pointer',color:'#831843'}}>🎲 Random</button>
        <button onClick={next} style={{flex:1,background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'11px',fontSize:14,fontWeight:800,cursor:'pointer',color:'#6B7280'}}>Next →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HELP QUEUE
// ════════════════════════════════════════════════════════════════════════════
const HELP_CATS = [
  { id:'stuck',    label:'Stuck',      emoji:'🤔', col:'#FDE68A', text:'#78350F' },
  { id:'check',    label:'Check work', emoji:'✅', col:'#BBF7D0', text:'#14532D' },
  { id:'question', label:'Question',   emoji:'❓', col:'#BFDBFE', text:'#1E3A5F' },
  { id:'urgent',   label:'Urgent',     emoji:'🚨', col:'#FCA5A5', text:'#7F1D1D' },
];

function QueueTimer({ since }) {
  const [secs, setSecs] = useState(0);
  useEffect(()=>{ const id=setInterval(()=>setSecs(Math.floor((Date.now()-since)/1000)),1000); return()=>clearInterval(id); },[since]);
  const m=Math.floor(secs/60), s=secs%60;
  const col = secs>300?'#DC2626':secs>120?'#D97706':'#059669';
  return <span style={{fontWeight:800,fontSize:12,color:col,fontVariantNumeric:'tabular-nums'}}>{m}:{s.toString().padStart(2,'0')}</span>;
}

function HelpQueueTool({ students }) {
  const [queue, setQueue]     = useState([]);
  const [adding, setAdding]   = useState(false);
  const [selStudent, setSelStudent] = useState('');
  const [selCat, setSelCat]   = useState('question');

  const addToQueue = () => {
    if (!selStudent) return;
    const s = students.find(s=>(s.id||s.firstName)===selStudent) || { firstName:selStudent };
    setQueue(p=>[...p,{ id:Date.now(), student:s, cat:selCat, since:Date.now() }]);
    setAdding(false); setSelStudent(''); setSelCat('question');
  };
  const remove = id => setQueue(p=>p.filter(q=>q.id!==id));
  const helpNext = () => setQueue(p=>p.slice(1));

  const noStudents = students.length === 0;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'16px'}}>
      {/* Queue count + help next */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:15,fontWeight:800,color:'#312E81'}}>{queue.length===0?'Queue is empty':`${queue.length} waiting`}</div>
        {queue.length>0&&<button onClick={helpNext} style={{background:'#C7D2FE',border:'2px solid #A5B4FC',borderRadius:10,padding:'7px 14px',fontSize:13,fontWeight:800,cursor:'pointer',color:'#312E81'}}>Help next →</button>}
      </div>

      {/* Queue list */}
      <div style={{display:'flex',flexDirection:'column',gap:7,maxHeight:240,overflowY:'auto'}}>
        {queue.map((q,i)=>{
          const cat=HELP_CATS.find(c=>c.id===q.cat)||HELP_CATS[0];
          return (
            <div key={q.id} style={{display:'flex',alignItems:'center',gap:10,background:'white',borderRadius:12,padding:'10px 12px',border:`2px solid ${cat.col}`,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div style={{width:26,height:26,borderRadius:8,background:i===0?'#C7D2FE':'#F3F4F6',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:i===0?'#312E81':'#9CA3AF',flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:16}}>{cat.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>{q.student.firstName||q.student.name}</div>
                <div style={{fontSize:11,color:'#9CA3AF',fontWeight:600}}>{cat.label}</div>
              </div>
              <QueueTimer since={q.since}/>
              <button onClick={()=>remove(q.id)} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:16,padding:'0 2px'}}>×</button>
            </div>
          );
        })}
        {queue.length===0&&<div style={{textAlign:'center',padding:'20px',color:'#9CA3AF',fontSize:14,fontWeight:600}}>No students waiting 🎉</div>}
      </div>

      {/* Add to queue */}
      {!adding ? (
        <button onClick={()=>setAdding(true)} style={{background:'#EEF2FF',border:'2px solid #C7D2FE',borderRadius:14,padding:'11px',fontSize:14,fontWeight:800,cursor:'pointer',color:'#312E81'}}>+ Add to Queue</button>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8,background:'#EEF2FF',borderRadius:14,padding:'12px',border:'2px solid #C7D2FE'}}>
          {noStudents ? (
            <input value={selStudent} onChange={e=>setSelStudent(e.target.value)} placeholder="Student name…"
              style={{border:'2px solid #C7D2FE',borderRadius:10,padding:'8px 12px',fontSize:14,fontWeight:700,outline:'none',background:'white'}}/>
          ) : (
            <select value={selStudent} onChange={e=>setSelStudent(e.target.value)}
              style={{border:'2px solid #C7D2FE',borderRadius:10,padding:'8px 12px',fontSize:14,fontWeight:700,outline:'none',background:'white',cursor:'pointer'}}>
              <option value="">Select student…</option>
              {students.map(s=><option key={s.id||s.firstName} value={s.id||s.firstName}>{s.firstName||s.name}</option>)}
            </select>
          )}
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {HELP_CATS.map(c=>(
              <button key={c.id} onClick={()=>setSelCat(c.id)} style={{background:selCat===c.id?c.col:'#F9FAFB',border:selCat===c.id?`2px solid ${c.text}44`:'2px solid #E5E7EB',borderRadius:10,padding:'5px 10px',fontSize:12,fontWeight:700,cursor:'pointer',color:selCat===c.id?c.text:'#6B7280',transition:'all 0.15s'}}>
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={addToQueue} disabled={!selStudent} style={{flex:1,background:selStudent?'#C7D2FE':'#F3F4F6',border:selStudent?'2px solid #A5B4FC':'2px solid #E5E7EB',borderRadius:10,padding:'9px',fontSize:14,fontWeight:800,cursor:selStudent?'pointer':'not-allowed',color:selStudent?'#312E81':'#9CA3AF'}}>Add</button>
            <button onClick={()=>{setAdding(false);setSelStudent('');}} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'9px 14px',fontSize:14,fontWeight:700,cursor:'pointer',color:'#9CA3AF'}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CLASS JOBS
// ════════════════════════════════════════════════════════════════════════════
const DEFAULT_JOBS = [
  { id:1, title:'Line Leader',     emoji:'🚶', desc:'Leads the class' },
  { id:2, title:'Board Wiper',     emoji:'🧹', desc:'Cleans the board' },
  { id:3, title:'Tech Helper',     emoji:'💻', desc:'Manages devices' },
  { id:4, title:'Book Monitor',    emoji:'📚', desc:'Hands out books' },
  { id:5, title:'Rubbish Patrol',  emoji:'🗑️', desc:'Picks up rubbish' },
  { id:6, title:'Lights Monitor',  emoji:'💡', desc:'Controls the lights' },
  { id:7, title:'Plant Waterer',   emoji:'🌿', desc:'Waters the plants' },
  { id:8, title:'Door Holder',     emoji:'🚪', desc:'Holds doors open' },
];

function ClassJobsTool({ students }) {
  const [assignments, setAssignments] = useState({});
  const [randomised, setRandomised]   = useState(false);

  const randomise = () => {
    if (students.length === 0) return;
    const shuffled = [...students].sort(()=>Math.random()-0.5);
    const map = {};
    DEFAULT_JOBS.forEach((job,i) => { map[job.id] = shuffled[i % shuffled.length]; });
    setAssignments(map); setRandomised(true);
  };

  const cycle = jobId => {
    if (students.length === 0) return;
    const cur = assignments[jobId];
    const curIdx = cur ? students.findIndex(s=>(s.id||s.firstName)===(cur.id||cur.firstName)) : -1;
    const next = students[(curIdx+1) % students.length];
    setAssignments(p=>({...p,[jobId]:next}));
  };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'16px'}}>
      <button onClick={randomise}
        style={{background:'#A5F3FC',border:'2px solid #67E8F9',borderRadius:14,padding:'11px',fontSize:14,fontWeight:800,cursor:students.length===0?'not-allowed':'pointer',color:'#164E63',opacity:students.length===0?0.5:1}}>
        {randomised?'🔀 Re-randomise':'🎲 Assign Jobs Randomly'}
      </button>

      <div style={{display:'flex',flexDirection:'column',gap:7,maxHeight:340,overflowY:'auto'}}>
        {DEFAULT_JOBS.map((job,i)=>{
          const assigned = assignments[job.id];
          return (
            <div key={job.id} style={{display:'flex',alignItems:'center',gap:10,background:'white',borderRadius:12,padding:'10px 12px',border:`2px solid ${PASTEL_CHIPS[i%PASTEL_CHIPS.length]}`,cursor:students.length>0?'pointer':'default',transition:'all 0.15s'}} onClick={()=>cycle(job.id)} title="Click to cycle student">
              <div style={{width:38,height:38,borderRadius:10,background:PASTEL_CHIPS[i%PASTEL_CHIPS.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
                {job.emoji}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:800,color:'#111827'}}>{job.title}</div>
                <div style={{fontSize:11,color:'#9CA3AF',fontWeight:600}}>{job.desc}</div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:assigned?'#374151':'#D1D5DB',background:assigned?'#F9FAFB':'transparent',borderRadius:8,padding:assigned?'4px 10px':'0'}}>
                {assigned?assigned.firstName||assigned.name:'—'}
              </div>
            </div>
          );
        })}
      </div>

      {students.length===0&&<p style={{fontSize:13,color:'#9CA3AF',fontWeight:600,textAlign:'center'}}>Add students to your class to use this tool</p>}
      {students.length>0&&randomised&&<p style={{fontSize:11,color:'#9CA3AF',fontWeight:600,textAlign:'center'}}>Tap any job to cycle through students</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CLOCK / RANDOM NUMBER / NOISE (inline utilities)
// ════════════════════════════════════════════════════════════════════════════
function ClockTool() {
  const [t,setT]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(id);},[]);
  const hh=t.getHours().toString().padStart(2,'0'),mm=t.getMinutes().toString().padStart(2,'0'),ss=t.getSeconds().toString().padStart(2,'0');
  const day=t.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:4,padding:'10px 0'}}>
      <div style={{fontSize:50,fontWeight:900,color:'#4C1D95',letterSpacing:'-2px',fontVariantNumeric:'tabular-nums',lineHeight:1}}>
        {hh}<span style={{opacity:0.25,animation:'blink 1s infinite'}}>:</span>{mm}
      </div>
      <div style={{fontSize:20,color:'#7C3AED',fontWeight:700,opacity:0.6,fontVariantNumeric:'tabular-nums'}}>.{ss}</div>
      <div style={{fontSize:12,color:'#6D28D9',fontWeight:600,opacity:0.6,marginTop:2}}>{day}</div>
    </div>
  );
}

function RandomNumberTool() {
  const [min,setMin]=useState(1),[max,setMax]=useState(100),[result,setResult]=useState(null),[rolling,setRolling]=useState(false);
  const roll=()=>{setRolling(true);let n=0;const id=setInterval(()=>{setResult(Math.floor(Math.random()*(Number(max)-Number(min)+1))+Number(min));if(++n>=18){clearInterval(id);setRolling(false);}},55);};
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'14px 18px'}}>
      <div style={{display:'flex',gap:10,width:'100%'}}>
        {[['Min',min,setMin],['Max',max,setMax]].map(([l,v,s])=>(
          <div key={l} style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:800,color:'#065F46',marginBottom:4,letterSpacing:'0.5px'}}>{l.toUpperCase()}</div>
            <input type="number" value={v} onChange={e=>s(e.target.value)} style={{width:'100%',border:'2px solid #A7F3D0',borderRadius:10,padding:'8px',fontSize:18,fontWeight:800,color:'#064E3B',background:'#F0FDF4',textAlign:'center',outline:'none'}}/>
          </div>
        ))}
      </div>
      <div style={{fontSize:result?70:46,fontWeight:900,color:rolling?'#6EE7B7':result?'#059669':'#D1FAE5',minHeight:80,display:'flex',alignItems:'center',fontVariantNumeric:'tabular-nums',transition:'color 0.1s'}}>
        {result??'—'}
      </div>
      <button onClick={roll} disabled={rolling} style={{background:'#A7F3D0',border:'2px solid #6EE7B7',borderRadius:14,padding:'11px 0',fontSize:15,fontWeight:800,cursor:rolling?'not-allowed':'pointer',color:'#064E3B',width:'100%',opacity:rolling?0.7:1}}>
        🎲 Generate
      </button>
    </div>
  );
}

function NoiseTool() {
  const [level,setLevel]=useState(0);
  const LEVELS=[{label:'Silent',emoji:'🤫',bg:'#ECFDF5',dot:'#059669'},{label:'Whisper',emoji:'🤫',bg:'#D1FAE5',dot:'#10B981'},{label:'Quiet',emoji:'🔉',bg:'#FFFDE7',dot:'#D97706'},{label:'Normal',emoji:'🔊',bg:'#FFF7ED',dot:'#EA580C'},{label:'Loud',emoji:'📢',bg:'#FEF2F2',dot:'#DC2626'},{label:'Too Loud!',emoji:'🚨',bg:'#FFF0F0',dot:'#991B1B'}];
  const curr=LEVELS[level];
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'14px 18px'}}>
      <div style={{background:curr.bg,borderRadius:16,padding:'12px 20px',width:'100%',textAlign:'center',transition:'all 0.3s',border:`2px solid ${curr.dot}33`}}>
        <div style={{fontSize:32,marginBottom:4}}>{curr.emoji}</div>
        <div style={{fontSize:18,fontWeight:800,color:curr.dot}}>{curr.label}</div>
      </div>
      <div style={{display:'flex',gap:5,width:'100%'}}>
        {LEVELS.map((l,i)=>(
          <button key={i} onClick={()=>setLevel(i)} style={{flex:1,height:34,borderRadius:8,cursor:'pointer',transition:'all 0.2s',background:i<=level?l.dot:'#F3F4F6',border:level===i?`2px solid ${l.dot}`:'2px solid #E5E7EB',fontSize:14}} title={l.label}>{l.emoji}</button>
        ))}
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setLevel(l=>Math.max(0,l-1))} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'7px 20px',fontSize:18,cursor:'pointer',fontWeight:900,color:'#374151'}}>−</button>
        <button onClick={()=>setLevel(l=>Math.min(5,l+1))} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'7px 20px',fontSize:18,cursor:'pointer',fontWeight:900,color:'#374151'}}>+</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// WINDOW CHROME
// ════════════════════════════════════════════════════════════════════════════
function ToolWindow({win,tool,onClose,onMinimize,onDragStart,onFocus,children}){
  return (
    <div onClick={()=>onFocus(win.id)} style={{position:'absolute',left:win.x,top:win.y,width:win.w,height:win.minimized?50:win.h,zIndex:win.zIndex,display:'flex',flexDirection:'column',borderRadius:18,overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.11),0 2px 6px rgba(0,0,0,0.06),0 0 0 1px rgba(0,0,0,0.04)',background:tool.bg,transition:'height 0.25s cubic-bezier(0.34,1.56,0.64,1)',minWidth:260,animation:'winPop 0.25s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div onMouseDown={e=>onDragStart(e,win.id)} style={{background:tool.header,height:50,display:'flex',alignItems:'center',paddingInline:14,gap:10,cursor:'grab',flexShrink:0,userSelect:'none'}}>
        <span style={{fontSize:19}}>{tool.emoji}</span>
        <span style={{flex:1,fontWeight:800,fontSize:14,color:tool.text,letterSpacing:'-0.2px'}}>{tool.label}</span>
        <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onMinimize(win.id);}} style={{width:26,height:26,borderRadius:7,background:'rgba(0,0,0,0.07)',border:'none',cursor:'pointer',fontSize:13,fontWeight:900,color:tool.text,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.65}} title={win.minimized?'Expand':'Minimise'}>
          {win.minimized?'▲':'▼'}
        </button>
        <button onMouseDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onClose(win.id);}} style={{width:26,height:26,borderRadius:7,background:'rgba(0,0,0,0.09)',border:'none',cursor:'pointer',fontSize:16,fontWeight:900,color:tool.text,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.65}} title="Close">×</button>
      </div>
      {!win.minimized&&<div style={{flex:1,overflowY:'auto',background:tool.bg}}>{children}</div>}
    </div>
  );
}

function DockIcon({tool,isOpen,onClick}){
  const [hov,setHov]=useState(false);
  return (
    <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center',gap:3}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {hov&&<div style={{position:'absolute',bottom:'112%',left:'50%',transform:'translateX(-50%)',background:'rgba(15,15,25,0.82)',color:'white',borderRadius:8,padding:'4px 10px',fontSize:11,fontWeight:800,whiteSpace:'nowrap',pointerEvents:'none'}}>{tool.label}</div>}
      <button onClick={()=>onClick(tool.id)} style={{width:50,height:50,borderRadius:14,background:isOpen?tool.header:hov?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.7)',border:isOpen?`2px solid ${tool.text}33`:'2px solid rgba(255,255,255,0.4)',cursor:'pointer',fontSize:23,display:'flex',alignItems:'center',justifyContent:'center',transform:hov?'translateY(-7px) scale(1.12)':isOpen?'translateY(-3px) scale(1.04)':'none',transition:'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:hov?'0 8px 20px rgba(0,0,0,0.14)':isOpen?'0 3px 10px rgba(0,0,0,0.1)':'0 1px 4px rgba(0,0,0,0.06)'}}>
        {tool.emoji}
      </button>
      {isOpen&&<div style={{width:4,height:4,borderRadius:'50%',background:tool.text,opacity:0.4}}/>}
    </div>
  );
}

function Toast({toasts}){
  return (
    <div style={{position:'fixed',top:64,right:20,display:'flex',flexDirection:'column',gap:8,zIndex:99999,pointerEvents:'none'}}>
      {toasts.map(t=><div key={t.id} style={{background:'rgba(15,15,25,0.85)',color:'white',borderRadius:10,padding:'9px 16px',fontSize:13,fontWeight:700,boxShadow:'0 4px 16px rgba(0,0,0,0.2)',animation:'slideIn 0.25s ease'}}>{t.msg}</div>)}
    </div>
  );
}

function Background(){
  return (
    <div style={{position:'fixed',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'rgba(167,139,250,0.09)',top:-200,left:-120,filter:'blur(90px)'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'rgba(96,165,250,0.08)',top:-80,right:-60,filter:'blur(70px)'}}/>
      <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'rgba(251,191,36,0.06)',bottom:-250,left:'30%',filter:'blur(110px)'}}/>
      <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'rgba(244,114,182,0.07)',bottom:0,right:-80,filter:'blur(75px)'}}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
export default function TeacherTools() {
  const router = useRouter();
  const [user,setUser]           = useState(null);
  const [students,setStudents]   = useState([]);
  const [loading,setLoading]     = useState(true);
  const [windows,setWindows]     = useState([]);
  const [maxZ,setMaxZ]           = useState(100);
  const [toasts,setToasts]       = useState([]);
  const toastId = useRef(0);
  const drag = useRef({active:false,id:null,startX:0,startY:0,winX:0,winY:0});

  const showToast = useCallback(msg=>{
    const id=++toastId.current;
    setToasts(p=>[...p,{id,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),2500);
  },[]);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async cur=>{
      if(!cur){router.push('/login');return;}
      setUser(cur);
      try{
        const snap=await getDoc(doc(firestore,'users',cur.uid));
        if(!snap.exists()){router.push('/login');return;}
        const data=snap.data()||{};
        const classes=Array.isArray(data.classes)?data.classes:[];
        if(classes.length>0){
          const cls=(data.activeClassId?classes.find(c=>c.id===data.activeClassId):null)||classes[0];
          if(cls)setStudents(Array.isArray(cls.students)?cls.students:[]);
        }
      }catch(e){console.error(e);}
      setLoading(false);
    });
    return()=>unsub();
  },[router]);

  const startDrag=useCallback((e,winId)=>{
    e.preventDefault();
    const win=windows.find(w=>w.id===winId);
    if(!win)return;
    drag.current={active:true,id:winId,startX:e.clientX,startY:e.clientY,winX:win.x,winY:win.y};
    setMaxZ(z=>{const nz=z+1;setWindows(p=>p.map(w=>w.id===winId?{...w,zIndex:nz}:w));return nz;});
  },[windows]);

  useEffect(()=>{
    const onMove=e=>{if(!drag.current.active)return;const dx=e.clientX-drag.current.startX,dy=e.clientY-drag.current.startY;setWindows(p=>p.map(w=>w.id===drag.current.id?{...w,x:Math.max(0,drag.current.winX+dx),y:Math.max(0,drag.current.winY+dy)}:w));};
    const onUp=()=>{drag.current.active=false;};
    document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);
    return()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
  },[]);

  const openTool=useCallback(toolId=>{
    const existing=windows.find(w=>w.toolId===toolId);
    if(existing){setMaxZ(z=>{const nz=z+1;setWindows(p=>p.map(w=>w.id===existing.id?{...w,zIndex:nz,minimized:false}:w));return nz;});return;}
    const tool=TOOLS.find(t=>t.id===toolId);if(!tool)return;
    const nz=maxZ+1;setMaxZ(nz);
    const off=(windows.length%9)*28;
    setWindows(p=>[...p,{id:`${toolId}-${Date.now()}`,toolId,x:70+off,y:60+off,w:tool.w,h:tool.h,zIndex:nz,minimized:false}]);
  },[windows,maxZ]);

  const closeWindow =useCallback(id=>setWindows(p=>p.filter(w=>w.id!==id)),[]);
  const toggleMin   =useCallback(id=>setWindows(p=>p.map(w=>w.id===id?{...w,minimized:!w.minimized}:w)),[]);
  const bringToFront=useCallback(id=>setMaxZ(z=>{const nz=z+1;setWindows(p=>p.map(w=>w.id===id?{...w,zIndex:nz}:w));return nz;}),[]);

  const renderTool=useCallback(toolId=>{
    switch(toolId){
      case 'timer':       return <TimerTool/>;
      case 'dice':        return <DiceTool/>;
      case 'name-picker': return <NamePickerTool students={students}/>;
      case 'groups':      return <GroupMakerTool students={students}/>;
      case 'checklist':   return <ChecklistTool/>;
      case 'brain-break': return <BrainBreakTool/>;
      case 'help-queue':  return <HelpQueueTool students={students}/>;
      case 'jobs':        return <ClassJobsTool students={students}/>;
      case 'clock':       return <ClockTool/>;
      case 'random-num':  return <RandomNumberTool/>;
      case 'noise':       return <NoiseTool/>;
      default: return <div style={{padding:24,color:'#9CA3AF',textAlign:'center'}}>🚧 Coming soon…</div>;
    }
  },[students]);

  if(loading)return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F9FAFB',fontFamily:'Inter,-apple-system,sans-serif'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:48,marginBottom:16}}>🛠️</div><p style={{fontWeight:800,color:'#6B7280',fontSize:17}}>Loading Toolkit…</p></div>
    </div>
  );

  const openIds=new Set(windows.map(w=>w.toolId));

  return(
    <>
      <Head>
        <title>Teacher Toolkit — Educational Elements</title>
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html,body{overflow:hidden;height:100%;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif}
          @keyframes winPop{from{opacity:0;transform:scale(0.9) translateY(10px)}to{opacity:1;transform:none}}
          @keyframes slideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:none}}
          @keyframes spin{to{transform:rotate(360deg)}}
          @keyframes blink{0%,100%{opacity:0.2}50%{opacity:0.8}}
          @keyframes diceWobble{0%{transform:rotate(0) scale(1)}20%{transform:rotate(-9deg) scale(1.06)}50%{transform:rotate(7deg) scale(1.09)}80%{transform:rotate(-4deg) scale(1.04)}100%{transform:rotate(0) scale(1)}}
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:8px}
        `}</style>
      </Head>

      <div style={{position:'fixed',inset:0,background:'linear-gradient(160deg,#F5F3FF 0%,#EFF6FF 40%,#F0FDF4 100%)',overflow:'hidden'}}>
        <Background/>

        {/* Top bar */}
        <div style={{position:'fixed',top:0,left:0,right:0,height:52,background:'rgba(255,255,255,0.72)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,0.06)',display:'flex',alignItems:'center',paddingInline:18,gap:12,zIndex:9998}}>
          <button onClick={()=>router.back()} style={{background:'#F3F4F6',border:'none',borderRadius:9,padding:'6px 13px',fontSize:13,fontWeight:700,color:'#6B7280',cursor:'pointer'}}>← Back</button>
          <span style={{fontSize:20}}>🛠️</span>
          <span style={{fontWeight:900,fontSize:17,color:'#111827',letterSpacing:'-0.5px'}}>Teacher Toolkit</span>
          {students.length>0&&<div style={{background:'#F3F4F6',borderRadius:9,padding:'4px 11px',fontSize:12,fontWeight:700,color:'#6B7280'}}>👥 {students.length} students</div>}
          {windows.length>0&&<button onClick={()=>setWindows([])} style={{marginLeft:'auto',background:'#FEE2E2',border:'none',borderRadius:9,padding:'6px 13px',fontSize:13,fontWeight:700,color:'#991B1B',cursor:'pointer'}}>✕ Clear all</button>}
        </div>

        {/* Canvas */}
        <div style={{position:'absolute',inset:0,top:52,bottom:102}}>
          {windows.length===0&&(
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,pointerEvents:'none'}}>
              <div style={{fontSize:60,opacity:0.1}}>🛠️</div>
              <p style={{fontSize:20,fontWeight:900,color:'rgba(80,60,160,0.25)',letterSpacing:'-0.5px'}}>Click a tool below to open it</p>
              <p style={{fontSize:13,fontWeight:600,color:'rgba(80,60,160,0.16)'}}>Open multiple tools at once — drag to arrange</p>
            </div>
          )}
          {windows.map(win=>{
            const tool=TOOLS.find(t=>t.id===win.toolId);
            if(!tool)return null;
            return(
              <ToolWindow key={win.id} win={win} tool={tool} onClose={closeWindow} onMinimize={toggleMin} onDragStart={startDrag} onFocus={bringToFront}>
                {renderTool(win.toolId)}
              </ToolWindow>
            );
          })}
        </div>

        {/* Dock */}
        <div style={{position:'fixed',bottom:0,left:0,right:0,height:102,display:'flex',alignItems:'center',justifyContent:'center',paddingBottom:14,zIndex:9997}}>
          <div style={{display:'flex',alignItems:'flex-end',gap:8,background:'rgba(255,255,255,0.72)',backdropFilter:'blur(28px)',borderRadius:22,padding:'10px 18px',border:'1px solid rgba(255,255,255,0.92)',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
            {TOOLS.map(tool=><DockIcon key={tool.id} tool={tool} isOpen={openIds.has(tool.id)} onClick={openTool}/>)}
          </div>
        </div>

        <Toast toasts={toasts}/>
      </div>
    </>
  );
}
