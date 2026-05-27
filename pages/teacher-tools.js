// pages/teacher-tools.js — Teacher Toolkit
// Resizable, draggable, fullscreen-capable windows. Pastel, no gradients.

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';



// ════════ TIMER ══════════════════════════════════════════════════════════════
function TimerTool() {
  const [total,setTotal]=useState(300),[left,setLeft]=useState(300),[running,setRunning]=useState(false),[done,setDone]=useState(false),[editing,setEditing]=useState(false),[editVal,setEditVal]=useState('5:00');
  const intRef=useRef(null);
  const R=72,CIRC=2*Math.PI*R,pct=total>0?left/total:0,dash=CIRC*(1-pct);
  const ringCol=pct>0.5?'#4ADE80':pct>0.2?'#FBBF24':'#F87171';
  const mm=Math.floor(left/60).toString().padStart(2,'0'),ss=(left%60).toString().padStart(2,'0');
  const chime=()=>{try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[880,1100,1320].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;const t=ctx.currentTime+i*0.18;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.25,t+0.04);g.gain.exponentialRampToValueAtTime(0.001,t+0.6);o.start(t);o.stop(t+0.65);});}catch(e){}};
  useEffect(()=>{if(running&&left>0){intRef.current=setInterval(()=>setLeft(l=>{if(l<=1){setRunning(false);setDone(true);chime();return 0;}return l-1;}),1000);}return()=>clearInterval(intRef.current);},[running]);
  const applyEdit=()=>{const pts=editVal.split(':');let s=0;if(pts.length===2)s=parseInt(pts[0]||0)*60+parseInt(pts[1]||0);else s=parseInt(pts[0]||0)*60;if(!isNaN(s)&&s>0){setTotal(s);setLeft(s);setRunning(false);setDone(false);}setEditing(false);};
  const preset=s=>{setTotal(s);setLeft(s);setRunning(false);setDone(false);};
  const reset=()=>{setRunning(false);setLeft(total);setDone(false);};
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:18,padding:'20px 16px'}}>
      <div style={{position:'relative',width:180,height:180}}>
        <svg width="180" height="180" style={{transform:'rotate(-90deg)',display:'block'}}>
          <circle cx="90" cy="90" r={R} fill="none" stroke="#F3F4F6" strokeWidth="10"/>
          <circle cx="90" cy="90" r={R} fill="none" stroke={done?'#F87171':ringCol} strokeWidth="10" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dash} style={{transition:'stroke-dashoffset 0.9s linear,stroke 0.4s'}}/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
          {editing?(<input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={applyEdit} onKeyDown={e=>e.key==='Enter'&&applyEdit()} style={{width:100,textAlign:'center',fontSize:28,fontWeight:900,border:'none',background:'transparent',color:'#111827',outline:'none',fontVariantNumeric:'tabular-nums'}}/>):(
            <div onClick={()=>{if(!running){setEditVal(`${Math.floor(total/60)}:${(total%60).toString().padStart(2,'0')}`);setEditing(true);}}} style={{fontSize:38,fontWeight:900,color:done?'#EF4444':'#111827',cursor:running?'default':'pointer',fontVariantNumeric:'tabular-nums',letterSpacing:'-1px',userSelect:'none'}}>{mm}:{ss}</div>
          )}
          {!editing&&<div style={{fontSize:11,color:'#9CA3AF',fontWeight:600}}>{done?'✅ Done!':running?'running':'tap to edit'}</div>}
        </div>
      </div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
        {[[1,60],[2,120],[5,300],[10,600],[15,900],[20,1200],[30,1800]].map(([m,s])=>(
          <button key={m} onClick={()=>preset(s)} style={{background:total===s?'#FDE68A':'#F9FAFB',border:total===s?'2px solid #F59E0B':'2px solid #E5E7EB',borderRadius:10,padding:'5px 11px',fontSize:13,fontWeight:700,cursor:'pointer',color:total===s?'#78350F':'#6B7280',transition:'all 0.15s'}}>{m}m</button>
        ))}
      </div>
      <div style={{display:'flex',gap:10}}>
        <button onClick={()=>{if(running)setRunning(false);else{setDone(false);setRunning(true);}}} style={{background:running?'#FECACA':'#BBF7D0',border:running?'2px solid #FCA5A5':'2px solid #86EFAC',borderRadius:14,padding:'11px 26px',fontSize:15,fontWeight:800,cursor:'pointer',color:running?'#991B1B':'#14532D',minWidth:110,transition:'all 0.15s'}}>
          {running?'⏸ Pause':left===0?'↺ Restart':'▶ Start'}
        </button>
        <button onClick={reset} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'11px 16px',fontSize:18,fontWeight:800,cursor:'pointer',color:'#9CA3AF'}}>↺</button>
      </div>
    </div>
  );
}

// ════════ DICE ════════════════════════════════════════════════════════════════
const DOT_GRID={1:[0,0,0,0,1,0,0,0,0],2:[1,0,0,0,0,0,0,0,1],3:[1,0,0,0,1,0,0,0,1],4:[1,0,1,0,0,0,1,0,1],5:[1,0,1,0,1,0,1,0,1],6:[1,0,1,1,0,1,1,0,1]};
const DCOLS=['#F87171','#60A5FA','#34D399','#FBBF24','#A78BFA','#F472B6'];
function DieFace({value,color,size=76,rolling}){const dots=DOT_GRID[value]||DOT_GRID[1];return(<div style={{width:size,height:size,background:'white',borderRadius:16,border:`2.5px solid ${color}55`,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:size<70?3:5,padding:size<70?9:11,boxShadow:`0 4px 16px ${color}22`,animation:rolling?'diceWobble 0.5s ease-in-out':'none'}}>{dots.map((on,i)=><div key={i} style={{borderRadius:'50%',background:on?color:'transparent',width:'100%',aspectRatio:'1'}}/>)}</div>);}
function DiceTool(){
  const [dice,setDice]=useState([{id:1,type:6,value:1,rolling:false}]);
  const rollOne=id=>{setDice(p=>p.map(d=>d.id===id?{...d,rolling:true}:d));setTimeout(()=>setDice(p=>p.map(d=>d.id===id?{...d,value:Math.floor(Math.random()*d.type)+1,rolling:false}:d)),480);};
  const rollAll=()=>dice.forEach(d=>rollOne(d.id));
  const addDie=type=>{if(dice.length>=6)return;setDice(p=>[...p,{id:Date.now(),type,value:Math.floor(Math.random()*type)+1,rolling:false}]);};
  const removeDie=id=>setDice(p=>p.filter(d=>d.id!==id));
  const total=dice.reduce((s,d)=>s+(d.value||0),0);
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'18px 16px'}}>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',minHeight:90}}>
        {dice.map((die,idx)=>{const color=DCOLS[idx%DCOLS.length];return(
          <div key={die.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
            <div onClick={()=>rollOne(die.id)} style={{cursor:'pointer'}} title="Click to roll">
              {die.type===6?<DieFace value={die.value||1} color={color} rolling={die.rolling}/>:<div style={{width:76,height:76,background:'white',borderRadius:16,border:`2.5px solid ${color}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:900,color,boxShadow:`0 4px 16px ${color}22`,animation:die.rolling?'diceWobble 0.5s ease-in-out':'none',fontVariantNumeric:'tabular-nums'}}>{die.rolling?'?':die.value}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4}}><span style={{fontSize:11,color:'#9CA3AF',fontWeight:700}}>D{die.type}</span>{dice.length>1&&<button onClick={()=>removeDie(die.id)} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:13,padding:0}}>×</button>}</div>
          </div>);
        })}
      </div>
      {dice.length>1&&<div style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:12,padding:'6px 18px',fontSize:14,fontWeight:800,color:'#374151'}}>Total: <span style={{color:'#1D4ED8',fontSize:16}}>{total}</span></div>}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center'}}>
        {[4,6,8,10,12,20].map(t=>(<button key={t} onClick={()=>addDie(t)} disabled={dice.length>=6} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'5px 10px',fontSize:12,fontWeight:700,cursor:dice.length>=6?'not-allowed':'pointer',color:'#6B7280',opacity:dice.length>=6?0.45:1}}>+D{t}</button>))}
      </div>
      <button onClick={rollAll} style={{background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:14,padding:'12px 0',fontSize:16,fontWeight:800,cursor:'pointer',color:'#1E3A5F',width:'100%'}}>🎲 Roll All</button>
    </div>
  );
}

// ════════ NAME PICKER ═════════════════════════════════════════════════════════
function NamePickerTool({students=[]}){
  const names=students.length>0?students:['Alex','Bailey','Casey','Dana','Elliot','Finley','Grace','Hunter','Indie','Jordan'];
  const [picked,setPicked]=useState(new Set());
  const [current,setCurrent]=useState(null);
  const [spinning,setSpinning]=useState(false);
  const spinRef=useRef(null);
  const pickRandom=()=>{
    const avail=names.filter(n=>!picked.has(n));
    if(!avail.length)return;
    setSpinning(true);
    let delay=60,count=0,max=18+Math.floor(Math.random()*12);
    const tick=()=>{
      setCurrent(avail[Math.floor(Math.random()*avail.length)]);
      count++;
      if(count>=max){
        const winner=avail[Math.floor(Math.random()*avail.length)];
        setCurrent(winner);
        setSpinning(false);
        setPicked(p=>new Set([...p,winner]));
        return;
      }
      delay=Math.min(delay*1.12,400);
      spinRef.current=setTimeout(tick,delay);
    };
    tick();
  };
  const reset=()=>{setPicked(new Set());setCurrent(null);setSpinning(false);if(spinRef.current)clearTimeout(spinRef.current);};
  const pct=picked.size/names.length*100;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:14,padding:'18px 16px'}}>
      <div style={{background:'#FFFBEB',borderRadius:18,padding:'22px 12px',textAlign:'center',minHeight:90,display:'flex',alignItems:'center',justifyContent:'center',border:'2.5px solid #FDE68A'}}>
        {current?<span style={{fontSize:28,fontWeight:900,color:'#92400E',letterSpacing:-0.5,animation:spinning?'blink 0.15s linear infinite':'none'}}>{current}</span>:<span style={{fontSize:15,color:'#D97706',fontWeight:600}}>Press Pick to start</span>}
      </div>
      <div style={{background:'#F3F4F6',borderRadius:8,height:8,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:'#FCD34D',borderRadius:8,transition:'width 0.4s'}}/></div>
      <div style={{fontSize:12,color:'#9CA3AF',textAlign:'center',fontWeight:600}}>{picked.size} of {names.length} picked</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,maxHeight:72,overflowY:'auto'}}>
        {[...picked].map(n=><span key={n} style={{background:'#FDE68A',borderRadius:20,padding:'3px 10px',fontSize:12,fontWeight:700,color:'#78350F'}}>{n}</span>)}
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={pickRandom} disabled={spinning||picked.size===names.length} style={{flex:1,background:'#FDE68A',border:'2px solid #FCD34D',borderRadius:14,padding:'13px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:'#78350F',opacity:(spinning||picked.size===names.length)?0.5:1}}>
          {spinning?'Picking…':picked.size===names.length?'All picked!':'🎯 Pick Name'}
        </button>
        <button onClick={reset} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'13px 14px',fontSize:18,fontWeight:800,cursor:'pointer',color:'#9CA3AF'}}>↺</button>
      </div>
    </div>
  );
}

// ════════ GROUP MAKER ═════════════════════════════════════════════════════════
const GPAL=['#FDE68A','#BBF7D0','#BFDBFE','#DDD6FE','#FBCFE8','#A5F3FC','#FCA5A5','#FEF08A','#C7D2FE','#D9F99D'];
function GroupMakerTool({students=[]}){
  const names=students.length>0?students:['Alex','Bailey','Casey','Dana','Elliot','Finley','Grace','Hunter','Indie','Jordan','Kim','Leo'];
  const [mode,setMode]=useState('size');
  const [val,setVal]=useState(3);
  const [groups,setGroups]=useState([]);
  const [dragOver,setDragOver]=useState(null);
  const dragInfo=useRef(null);
  const make=()=>{
    const shuffled=[...names].sort(()=>Math.random()-0.5);
    const gs=[];
    if(mode==='size'){
      for(let i=0;i<shuffled.length;i+=val)gs.push(shuffled.slice(i,i+val));
    }else{
      const sz=Math.ceil(shuffled.length/val);
      for(let i=0;i<val&&i*sz<shuffled.length;i++)gs.push(shuffled.slice(i*sz,i*sz+sz));
    }
    setGroups(gs);
  };
  const moveStudent=(name,fromIdx,toIdx)=>{
    if(fromIdx===toIdx)return;
    setGroups(prev=>{
      const next=prev.map(g=>[...g]);
      next[fromIdx]=next[fromIdx].filter(n=>n!==name);
      next[toIdx]=[...next[toIdx],name];
      return next.filter(g=>g.length>0);
    });
  };
  const removeStudent=(name,fromIdx)=>{
    setGroups(prev=>{
      const next=prev.map(g=>[...g]);
      next[fromIdx]=next[fromIdx].filter(n=>n!==name);
      return next.filter(g=>g.length>0);
    });
  };
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'18px 16px'}}>
      <div style={{display:'flex',background:'#F3F4F6',borderRadius:12,padding:3,gap:2}}>
        {['size','count'].map(m=><button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:'7px 0',borderRadius:10,border:'none',background:mode===m?'white':'transparent',fontWeight:700,fontSize:13,cursor:'pointer',color:mode===m?'#374151':'#9CA3AF',boxShadow:mode===m?'0 1px 4px #0001':''}}>{m==='size'?'Group size':'# of groups'}</button>)}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
        <button onClick={()=>setVal(v=>Math.max(2,v-1))} style={{width:36,height:36,borderRadius:10,border:'2px solid #E5E7EB',background:'#F9FAFB',fontSize:20,fontWeight:900,cursor:'pointer',color:'#6B7280'}}>−</button>
        <span style={{fontSize:24,fontWeight:900,color:'#374151',minWidth:30,textAlign:'center'}}>{val}</span>
        <button onClick={()=>setVal(v=>v+1)} style={{width:36,height:36,borderRadius:10,border:'2px solid #E5E7EB',background:'#F9FAFB',fontSize:20,fontWeight:900,cursor:'pointer',color:'#6B7280'}}>+</button>
      </div>
      <button onClick={make} style={{background:'#BBF7D0',border:'2px solid #86EFAC',borderRadius:14,padding:'12px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:'#14532D'}}>🔀 Make Groups</button>
      {groups.length>0&&<div style={{fontSize:11,color:'#9CA3AF',textAlign:'center',fontWeight:600}}>✦ Drag students between groups · × to remove</div>}
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        {groups.map((g,i)=>(
          <div key={i}
            onDragOver={e=>{e.preventDefault();setDragOver(i);}}
            onDragEnter={e=>{e.preventDefault();setDragOver(i);}}
            onDragLeave={()=>setDragOver(null)}
            onDrop={e=>{
              e.preventDefault();
              setDragOver(null);
              if(dragInfo.current){
                moveStudent(dragInfo.current.name,dragInfo.current.fromIdx,i);
                dragInfo.current=null;
              }
            }}
            style={{background:dragOver===i?'#E0E7FF':GPAL[i%GPAL.length],borderRadius:12,padding:'8px 10px',minWidth:90,border:dragOver===i?'2px dashed #818CF8':'2px solid transparent',transition:'all 0.15s'}}>
            <div style={{fontSize:11,fontWeight:800,color:'#374151',marginBottom:6}}>Group {i+1} <span style={{color:'#9CA3AF',fontWeight:600}}>({g.length})</span></div>
            {g.map(n=>(
              <div key={n}
                draggable
                onDragStart={()=>{dragInfo.current={name:n,fromIdx:i};}}
                onDragEnd={()=>{dragInfo.current=null;setDragOver(null);}}
                style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:4,fontSize:13,fontWeight:600,color:'#1F2937',padding:'3px 4px',borderRadius:7,background:'rgba(255,255,255,0.55)',marginBottom:2,cursor:'grab',userSelect:'none'}}>
                <span>{n}</span>
                <button onClick={()=>removeStudent(n,i)} style={{width:16,height:16,borderRadius:50,border:'none',background:'rgba(0,0,0,0.12)',color:'#374151',fontSize:11,fontWeight:900,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,padding:0,flexShrink:0}}>×</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════ CHECKLIST ═══════════════════════════════════════════════════════════
const CHECKLIST_TEMPLATES={
  morning:['📅 Mark the roll','📢 Share morning message','📚 Collect homework','✏️ Sharpen pencils','🧹 Check classroom tidiness','📋 Review daily schedule','🎯 State learning goals'],
  packup:['📦 Pack up books and stationery','🪑 Push in chairs','🗑️ Pick up litter around desk','🏠 Collect take-home items','📝 Copy homework into diary','👋 Line up quietly','🔕 Phones away'],
  focus:['💡 Think about what we are learning','🤫 Quiet body and calm mind','👁️ Eyes on the board','✋ Raise hand to speak','🤝 Be kind to classmates','💪 Try your best','🎧 Headphones in if needed'],
  custom:[],
};
function ChecklistTool(){
  const [tab,setTab]=useState('morning');
  const [items,setItems]=useState(()=>Object.fromEntries(Object.entries(CHECKLIST_TEMPLATES).map(([k,v])=>[k,v.map(t=>({text:t,done:false}))])));
  const [newText,setNewText]=useState('');
  const toggle=(t,i)=>setItems(p=>({...p,[t]:p[t].map((it,idx)=>idx===i?{...it,done:!it.done}:it)}));
  const addCustom=()=>{if(!newText.trim())return;setItems(p=>({...p,custom:[...p.custom,{text:newText.trim(),done:false}]}));setNewText('');setTab('custom');};
  const reset=t=>setItems(p=>({...p,[t]:p[t].map(it=>({...it,done:false}))}));
  const cur=items[tab]||[];
  const done=cur.filter(i=>i.done).length;
  const TABS={morning:'☀️ Morning',packup:'🎒 Pack Up',focus:'🎯 Focus',custom:'✏️ Custom'};
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:'14px 14px'}}>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {Object.entries(TABS).map(([k,v])=><button key={k} onClick={()=>setTab(k)} style={{padding:'5px 10px',borderRadius:20,border:'none',background:tab===k?'#BBF7D0':'#F3F4F6',color:tab===k?'#14532D':'#6B7280',fontWeight:700,fontSize:12,cursor:'pointer'}}>{v}</button>)}
      </div>
      <div style={{background:'#F3F4F6',borderRadius:8,height:7,overflow:'hidden'}}><div style={{width:`${cur.length?done/cur.length*100:0}%`,height:'100%',background:'#34D399',borderRadius:8,transition:'width 0.3s'}}/></div>
      <div style={{fontSize:12,color:'#9CA3AF',fontWeight:600,textAlign:'right'}}>{done}/{cur.length} done</div>
      <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:200,overflowY:'auto'}}>
        {cur.map((item,i)=>(
          <div key={i} onClick={()=>toggle(tab,i)} style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:10,background:item.done?'#DCFCE7':'#F9FAFB',border:item.done?'1.5px solid #86EFAC':'1.5px solid #E5E7EB',cursor:'pointer',transition:'all 0.15s'}}>
            <div style={{width:20,height:20,borderRadius:6,border:item.done?'none':'2px solid #D1D5DB',background:item.done?'#22C55E':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {item.done&&<span style={{color:'white',fontSize:13,fontWeight:900}}>✓</span>}
            </div>
            <span style={{fontSize:13,fontWeight:600,color:item.done?'#15803D':'#374151',textDecoration:item.done?'line-through':'none',flex:1}}>{item.text}</span>
          </div>
        ))}
      </div>
      {tab==='custom'&&(
        <div style={{display:'flex',gap:7}}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCustom()} placeholder="Add item…" style={{flex:1,border:'2px solid #E5E7EB',borderRadius:10,padding:'8px 11px',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
          <button onClick={addCustom} style={{background:'#BBF7D0',border:'2px solid #86EFAC',borderRadius:10,padding:'8px 14px',fontWeight:800,cursor:'pointer',fontSize:14,color:'#14532D'}}>+</button>
        </div>
      )}
      <button onClick={()=>reset(tab)} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:10,padding:'7px 0',fontSize:12,fontWeight:700,cursor:'pointer',color:'#9CA3AF'}}>↺ Reset list</button>
    </div>
  );
}

// ════════ BRAIN BREAK ═════════════════════════════════════════════════════════
const BRAIN_BREAKS=[
  // Movement
  {id:1,title:'Star Jumps',desc:'Do 20 star jumps as fast as you can!',type:'Movement',emoji:'⭐',dur:'1 min'},
  {id:2,title:'Freeze Dance',desc:'Dance to your favourite song — freeze when it stops!',type:'Movement',emoji:'🕺',dur:'2 min'},
  {id:3,title:'Jog on the Spot',desc:'Jog on the spot, lifting your knees as high as you can for 60 seconds.',type:'Movement',emoji:'🏃',dur:'1 min'},
  {id:4,title:'Simon Says',desc:'Simon says touch your nose! Simon says jump twice! Now sit down — ha, Simon didn\'t say!',type:'Game',emoji:'🙋',dur:'3 min'},
  {id:5,title:'Animal Walk',desc:'Walk around the room like your favourite animal. Change animal every 20 seconds!',type:'Movement',emoji:'🐻',dur:'2 min'},
  {id:6,title:'Hula Hoop Challenge',desc:'Imagine you\'re spinning a hula hoop around your waist for 30 seconds!',type:'Movement',emoji:'🌀',dur:'1 min'},
  {id:7,title:'Basketball Shootout',desc:'Stand up and mime shooting basketball hoops — 10 shots each hand!',type:'Movement',emoji:'🏀',dur:'1 min'},
  {id:8,title:'Hop Scotch',desc:'Draw a hopscotch grid and hop across it 3 times!',type:'Movement',emoji:'🦘',dur:'2 min'},
  // Stretch
  {id:9,title:'Shoulder Roll',desc:'Roll your shoulders forward 5 times, then backward 5 times. Relax and breathe.',type:'Stretch',emoji:'💆',dur:'1 min'},
  {id:10,title:'Neck Stretch',desc:'Slowly tilt your head to each side, hold 10 seconds. Gentle circles forward and back.',type:'Stretch',emoji:'🦒',dur:'1 min'},
  {id:11,title:'Standing Toe Touch',desc:'Stand up, slowly reach down toward your toes. Hold 15 seconds. Repeat 3 times.',type:'Stretch',emoji:'🤸',dur:'1 min'},
  {id:12,title:'Cat-Cow Stretch',desc:'On all fours, arch your back up like a cat, then dip it down like a cow. Repeat 8 times.',type:'Stretch',emoji:'🐱',dur:'1 min'},
  {id:13,title:'Side Stretch',desc:'Reach one arm over your head and lean sideways. Hold 10 seconds each side. Breathe deeply.',type:'Stretch',emoji:'🌿',dur:'1 min'},
  {id:14,title:'Wrist & Hand Stretch',desc:'Stretch your fingers wide, make a fist, then wiggle all fingers. Roll your wrists 10 times.',type:'Stretch',emoji:'🤲',dur:'1 min'},
  // Breathing
  {id:15,title:'Box Breathing',desc:'Breathe in for 4 counts, hold 4, out for 4, hold 4. Repeat 4 times. Feel calm!',type:'Breathing',emoji:'📦',dur:'2 min'},
  {id:16,title:'Balloon Breaths',desc:'Breathe in slowly to inflate your "balloon" belly, then let it out. 8 slow breaths.',type:'Breathing',emoji:'🎈',dur:'2 min'},
  {id:17,title:'Bumble Bee Breath',desc:'Breathe in deeply, then hum loudly like a bee as you breathe out. Repeat 5 times.',type:'Breathing',emoji:'🐝',dur:'1 min'},
  {id:18,title:'4-7-8 Breathing',desc:'Breathe in for 4 counts, hold for 7, breathe out slowly for 8 counts. Repeat 3 times.',type:'Breathing',emoji:'🌬️',dur:'2 min'},
  {id:19,title:'Finger Breathing',desc:'Trace up each finger as you breathe in, down each finger as you breathe out. One whole hand!',type:'Breathing',emoji:'✋',dur:'1 min'},
  // Mindfulness
  {id:20,title:'5-4-3-2-1 Grounding',desc:'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',type:'Mindfulness',emoji:'🧘',dur:'2 min'},
  {id:21,title:'Body Scan',desc:'Close your eyes. Start at your toes and notice every part of your body up to the top of your head.',type:'Mindfulness',emoji:'👁️',dur:'3 min'},
  {id:22,title:'Gratitude Moment',desc:'Think of 3 things you are grateful for today. Share one with the class if you\'d like!',type:'Mindfulness',emoji:'🙏',dur:'2 min'},
  {id:23,title:'Silent Nature',desc:'Close your eyes for 60 seconds. Imagine your favourite outdoor place in vivid detail.',type:'Mindfulness',emoji:'🌳',dur:'1 min'},
  {id:24,title:'Positive Affirmations',desc:'Everyone say aloud: "I am smart. I am kind. I can do hard things." Repeat 3 times with confidence!',type:'Mindfulness',emoji:'💬',dur:'1 min'},
  // Yoga
  {id:25,title:'Tree Pose',desc:'Stand on one foot, place the other foot on your ankle or knee. Hold 20 seconds each side. Wobbling is okay!',type:'Yoga',emoji:'🌲',dur:'2 min'},
  {id:26,title:'Downward Dog',desc:'Make an upside-down V shape with your body. Pedal your heels one at a time. Hold 30 seconds.',type:'Yoga',emoji:'🐕',dur:'1 min'},
  {id:27,title:'Warrior Pose',desc:'Lunge forward with arms out wide like a warrior. Hold 15 seconds each side. Be strong!',type:'Yoga',emoji:'⚔️',dur:'2 min'},
  {id:28,title:'Child\'s Pose',desc:'Kneel and stretch your arms forward on the floor, resting your forehead down. Breathe deeply for 30 seconds.',type:'Yoga',emoji:'🛌',dur:'1 min'},
  {id:29,title:'Chair Yoga',desc:'Seated: twist left and right, reach arms up, then fold forward. Do each move 5 times.',type:'Yoga',emoji:'🪑',dur:'2 min'},
  // Dance
  {id:30,title:'Macarena',desc:'Everyone do the Macarena! Follow the teacher or make up your own moves.',type:'Dance',emoji:'💃',dur:'3 min'},
  {id:31,title:'Robot Dance',desc:'Move like a stiff robot for 30 seconds, then switch to a flowing smooth dancer. Alternate 3 times.',type:'Dance',emoji:'🤖',dur:'2 min'},
  {id:32,title:'Follow the Leader Dance',desc:'One student leads a dance move, everyone copies. Swap leader every 20 seconds!',type:'Dance',emoji:'🎵',dur:'3 min'},
  {id:33,title:'Slow Motion Dance',desc:'Dance your best moves but in SUPER slow motion. Try not to laugh!',type:'Dance',emoji:'🐢',dur:'2 min'},
  // Game
  {id:34,title:'Rock Paper Scissors Tournament',desc:'Play best of 3 against your neighbour. Winners challenge other winners! Find the class champion.',type:'Game',emoji:'✂️',dur:'3 min'},
  {id:35,title:'Thumb Wars',desc:'Pair up for thumb war! 1,2,3,4 — I declare a thumb war! Best of 3.',type:'Game',emoji:'👍',dur:'2 min'},
  {id:36,title:'20 Questions',desc:'One person thinks of an animal/object. Class asks yes/no questions. 20 questions to guess!',type:'Game',emoji:'❓',dur:'5 min'},
  {id:37,title:'Emoji Story',desc:'Tell a 3-sentence story using ONLY emojis. Share with the class and let them decode it!',type:'Game',emoji:'😂',dur:'3 min'},
  {id:38,title:'Zip Zap Zoom',desc:'Sit in a circle. Zip passes left, Zap bounces across, Zoom reverses direction. Don\'t get caught!',type:'Game',emoji:'⚡',dur:'3 min'},
  {id:39,title:'Would You Rather',desc:'Teacher reads a fun Would You Rather question. Class votes with thumbs up/down and shares reasons.',type:'Game',emoji:'🤔',dur:'2 min'},
  {id:40,title:'Human Bingo',desc:'Stand up and find someone who: likes cats, plays sport, has a sibling, etc. First with a line wins!',type:'Game',emoji:'🎯',dur:'5 min'},
  {id:41,title:'Invisible Drawing',desc:'Draw a picture in the air with your finger. Partner tries to guess what you\'re drawing!',type:'Game',emoji:'🖌️',dur:'2 min'},
  {id:42,title:'Categories Challenge',desc:'Pick a category (fruits, animals, countries). Go around the class — each person names one. No repeats!',type:'Game',emoji:'📋',dur:'3 min'},
  {id:43,title:'Mirror Mirror',desc:'Face a partner. One leads movements, the other mirrors exactly. Switch after 1 minute. Be a perfect mirror!',type:'Game',emoji:'🪞',dur:'2 min'},
  {id:44,title:'Two Truths & a Lie',desc:'Each student shares 3 facts about themselves — but one is a lie! Class votes on which one is false.',type:'Game',emoji:'🃏',dur:'5 min'},
];
const BB_TYPES=['All','Movement','Stretch','Breathing','Mindfulness','Yoga','Dance','Game'];
const BB_COLS={Movement:'#FCA5A5',Stretch:'#86EFAC',Breathing:'#93C5FD',Mindfulness:'#C4B5FD',Yoga:'#FDE68A',Dance:'#F9A8D4',Game:'#67E8F9'};
function BrainBreakTool(){
  const [filter,setFilter]=useState('All');
  const [idx,setIdx]=useState(0);
  const [fav,setFav]=useState(new Set());
  const pool=BRAIN_BREAKS.filter(b=>filter==='All'||b.type===filter);
  const cur=pool[idx%Math.max(pool.length,1)];
  const next=()=>setIdx(i=>(i+1)%pool.length);
  const rand=()=>setIdx(Math.floor(Math.random()*pool.length));
  const col=cur?BB_COLS[cur.type]||'#FDE68A':'#FDE68A';
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:'14px 14px'}}>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {BB_TYPES.map(t=><button key={t} onClick={()=>{setFilter(t);setIdx(0);}} style={{padding:'4px 9px',borderRadius:20,border:'none',background:filter===t?col:'#F3F4F6',color:filter===t?'#1F2937':'#6B7280',fontWeight:700,fontSize:11,cursor:'pointer',transition:'all 0.15s'}}>{t}</button>)}
      </div>
      {cur&&<div style={{background:col+'33',border:`2.5px solid ${col}`,borderRadius:18,padding:'18px 16px',position:'relative'}}>
        <div style={{position:'absolute',top:10,right:10,display:'flex',gap:6}}>
          <span style={{background:col,borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:800,color:'#1F2937'}}>{cur.type}</span>
          <span style={{background:'#F9FAFB',borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:700,color:'#9CA3AF'}}>⏱ {cur.dur}</span>
        </div>
        <div style={{fontSize:34,marginBottom:8}}>{cur.emoji}</div>
        <div style={{fontSize:17,fontWeight:900,color:'#1F2937',marginBottom:7}}>{cur.title}</div>
        <div style={{fontSize:13,color:'#4B5563',lineHeight:1.55,fontWeight:500}}>{cur.desc}</div>
        <button onClick={()=>setFav(f=>{const n=new Set(f);n.has(cur.id)?n.delete(cur.id):n.add(cur.id);return n;})} style={{position:'absolute',bottom:10,right:12,background:'none',border:'none',fontSize:18,cursor:'pointer',opacity:0.7}}>{fav.has(cur.id)?'❤️':'🤍'}</button>
      </div>}
      <div style={{display:'flex',gap:8}}>
        <button onClick={rand} style={{flex:1,background:'#FDE68A',border:'2px solid #FCD34D',borderRadius:12,padding:'11px 0',fontSize:14,fontWeight:800,cursor:'pointer',color:'#78350F'}}>🎲 Random</button>
        <button onClick={next} style={{flex:1,background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:12,padding:'11px 0',fontSize:14,fontWeight:800,cursor:'pointer',color:'#374151'}}>Next →</button>
      </div>
      <div style={{fontSize:11,color:'#9CA3AF',textAlign:'center',fontWeight:600}}>{pool.indexOf(cur)+1} of {pool.length} activities {filter!=='All'?`in ${filter}`:''}</div>
    </div>
  );
}

// ════════ HELP QUEUE ══════════════════════════════════════════════════════════
const HELP_CATS=[{id:'help',label:'Need Help',emoji:'🙋',color:'#BFDBFE'},{id:'check',label:'Check Work',emoji:'✅',color:'#BBF7D0'},{id:'toilet',label:'Bathroom',emoji:'🚻',color:'#FDE68A'}];
const ACTION_LABEL={help:'✅ Help Next',check:'✅ Checked',toilet:'🚻 Returned'};
function QueueTimer({since}){
  const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{const iv=setInterval(()=>setElapsed(Math.floor((Date.now()-since)/1000)),1000);return()=>clearInterval(iv);},[since]);
  const m=Math.floor(elapsed/60),s=elapsed%60;
  const col=elapsed>300?'#EF4444':elapsed>120?'#F59E0B':'#22C55E';
  return <span style={{color:col,fontWeight:800,fontSize:12}}>{m}:{String(s).padStart(2,'0')}</span>;
}
function HelpQueueTool({students=[]}){
  const names=students.length>0?students:['Alex','Bailey','Casey','Dana','Elliot'];
  const [queue,setQueue]=useState([]);
  const [log,setLog]=useState([]);
  const [sel,setSel]=useState('');
  const [selCat,setSelCat]=useState('help');
  const [custom,setCustom]=useState('');
  const [showLog,setShowLog]=useState(false);
  const add=(name,catId)=>{
    if(!name.trim())return;
    setQueue(q=>[...q,{id:Date.now(),name:name.trim(),catId,since:Date.now()}]);
    setSel('');setCustom('');
  };
  const dismiss=(item)=>{
    const cat=HELP_CATS.find(c=>c.id===item.catId)||HELP_CATS[0];
    setLog(l=>[{name:item.name,catId:item.catId,catLabel:cat.label,emoji:cat.emoji,time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})},...l]);
    setQueue(q=>q.filter(x=>x.id!==item.id));
  };
  const remove=id=>setQueue(q=>q.filter(x=>x.id!==id));
  const next=queue[0];
  const nextCat=next?HELP_CATS.find(c=>c.id===next.catId)||HELP_CATS[0]:null;
  const nextLabel=next?ACTION_LABEL[next.catId]||'✅ Done':'';
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:'14px 14px'}}>
      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
        {HELP_CATS.map(c=><button key={c.id} onClick={()=>setSelCat(c.id)} style={{padding:'5px 10px',borderRadius:20,border:'none',background:selCat===c.id?c.color:'#F3F4F6',color:'#374151',fontWeight:700,fontSize:12,cursor:'pointer'}}>{c.emoji} {c.label}</button>)}
      </div>
      <div style={{display:'flex',gap:7}}>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{flex:1,border:'2px solid #E5E7EB',borderRadius:10,padding:'8px 10px',fontSize:13,fontFamily:'inherit',outline:'none',background:'white',color:sel?'#1F2937':'#9CA3AF'}}>
          <option value="">Select student…</option>
          {names.map(n=><option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={()=>add(sel,selCat)} disabled={!sel} style={{background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:10,padding:'8px 14px',fontWeight:800,fontSize:14,cursor:'pointer',color:'#1E40AF',opacity:sel?1:0.4}}>Add</button>
      </div>
      <div style={{display:'flex',gap:7}}>
        <input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Or type a name…" onKeyDown={e=>e.key==='Enter'&&add(custom,selCat)} style={{flex:1,border:'2px solid #E5E7EB',borderRadius:10,padding:'8px 11px',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
        <button onClick={()=>add(custom,selCat)} disabled={!custom.trim()} style={{background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:10,padding:'8px 14px',fontWeight:800,fontSize:14,cursor:'pointer',color:'#1E40AF',opacity:custom.trim()?1:0.4}}>Add</button>
      </div>
      {/* Queue */}
      <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:150,overflowY:'auto'}}>
        {queue.length===0&&<div style={{textAlign:'center',color:'#9CA3AF',fontSize:13,padding:'16px 0',fontWeight:600}}>Queue is empty 🎉</div>}
        {queue.map((item,i)=>{
          const cat=HELP_CATS.find(c=>c.id===item.catId)||HELP_CATS[0];
          return(
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:10,background:i===0?cat.color+'55':cat.color+'22',border:`1.5px solid ${cat.color}`}}>
              <span style={{fontSize:16}}>{cat.emoji}</span>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:'#1F2937'}}>{item.name}</div><div style={{fontSize:11,color:'#6B7280',fontWeight:600}}>{cat.label} · <QueueTimer since={item.since}/></div></div>
              {i===0&&<span style={{background:'#FDE68A',borderRadius:8,padding:'2px 7px',fontSize:10,fontWeight:800,color:'#78350F'}}>NEXT</span>}
              <button onClick={()=>remove(item.id)} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:15,padding:0,lineHeight:1}}>×</button>
            </div>
          );
        })}
      </div>
      {/* Action button — label changes based on category */}
      {next&&<button onClick={()=>dismiss(next)} style={{background:nextCat.color,border:`2px solid ${nextCat.color}CC`,borderRadius:12,padding:'11px 0',fontSize:14,fontWeight:800,cursor:'pointer',color:'#1F2937'}}>
        {nextLabel} ({next.name})
      </button>}
      {/* History log */}
      <div style={{borderTop:'1.5px solid #F3F4F6',paddingTop:8}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:showLog?8:0}}>
          <button onClick={()=>setShowLog(s=>!s)} style={{background:'none',border:'none',fontSize:12,fontWeight:700,color:'#9CA3AF',cursor:'pointer',padding:0}}>
            {showLog?'▲':'▼'} History ({log.length})
          </button>
          {showLog&&log.length>0&&<button onClick={()=>setLog([])} style={{background:'#FEE2E2',border:'1.5px solid #FECACA',borderRadius:8,padding:'3px 9px',fontSize:11,fontWeight:700,cursor:'pointer',color:'#991B1B'}}>Clear</button>}
        </div>
        {showLog&&(
          <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:120,overflowY:'auto'}}>
            {log.length===0&&<div style={{textAlign:'center',color:'#D1D5DB',fontSize:12,padding:'8px 0'}}>No history yet</div>}
            {log.map((entry,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:7,padding:'5px 8px',borderRadius:8,background:'#F9FAFB',border:'1px solid #F3F4F6'}}>
                <span style={{fontSize:13}}>{entry.emoji}</span>
                <div style={{flex:1,fontSize:12,fontWeight:700,color:'#374151'}}>{entry.name}</div>
                <span style={{fontSize:11,color:'#9CA3AF',fontWeight:600}}>{entry.catLabel}</span>
                <span style={{fontSize:11,color:'#D1D5DB',fontWeight:600,marginLeft:4}}>{entry.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════ CLASS JOBS ══════════════════════════════════════════════════════════
const DEFAULT_JOBS=[{id:'1',title:'Line Leader',emoji:'🚶'},{id:'2',title:'Door Holder',emoji:'🚪'},{id:'3',title:'Whiteboard Cleaner',emoji:'🧹'},{id:'4',title:'Tech Helper',emoji:'💻'},{id:'5',title:'Librarian',emoji:'📚'},{id:'6',title:'Messenger',emoji:'✉️'},{id:'7',title:'Recycling Monitor',emoji:'♻️'},{id:'8',title:'Supply Manager',emoji:'✏️'}];
function ClassJobsTool({students=[]}){
  const names=students.length>0?students:['Alex','Bailey','Casey','Dana','Elliot','Finley','Grace','Hunter'];
  const [assign,setAssign]=useState({});
  const shuffle=()=>{
    const s=[...names].sort(()=>Math.random()-0.5);
    const a={};
    DEFAULT_JOBS.forEach((j,i)=>{a[j.id]=s[i%s.length];});
    setAssign(a);
  };
  const cycle=(jid)=>{
    const cur=assign[jid];
    const i=names.indexOf(cur);
    setAssign(p=>({...p,[jid]:names[(i+1)%names.length]}));
  };
  return(
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:'14px 14px'}}>
      <button onClick={shuffle} style={{background:'#DDD6FE',border:'2px solid #C4B5FD',borderRadius:14,padding:'12px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:'#4C1D95'}}>🔀 Assign Randomly</button>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,maxHeight:260,overflowY:'auto'}}>
        {DEFAULT_JOBS.map(job=>(
          <div key={job.id} onClick={()=>assign[job.id]&&cycle(job.id)} style={{background:'#FAFAFA',border:'2px solid #E5E7EB',borderRadius:12,padding:'10px 10px',cursor:assign[job.id]?'pointer':'default',transition:'all 0.15s'}}>
            <div style={{fontSize:20,marginBottom:4}}>{job.emoji}</div>
            <div style={{fontSize:11,fontWeight:800,color:'#6B7280',marginBottom:2}}>{job.title}</div>
            <div style={{fontSize:13,fontWeight:700,color:assign[job.id]?'#4C1D95':'#D1D5DB'}}>{assign[job.id]||'—'}</div>
          </div>
        ))}
      </div>
      {Object.keys(assign).length>0&&<div style={{fontSize:11,color:'#9CA3AF',textAlign:'center',fontWeight:600}}>Tap a job to cycle to next student</div>}
    </div>
  );
}

// ════════ CLOCK ═══════════════════════════════════════════════════════════════
function ClockTool(){
  const [now,setNow]=useState(()=>new Date());
  useEffect(()=>{const iv=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(iv);},[]);
  const h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
  const day=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()];
  const mName=['January','February','March','April','May','June','July','August','September','October','November','December'][now.getMonth()];
  // Analogue clock
  const cx=80,cy=80,r=68;
  const hDeg=((h%12)/12*360)+((m/60)*30)-90;
  const mDeg=(m/60*360)+(s/60*6)-90;
  const sDeg=(s/60*360)-90;
  const toXY=(deg,len)=>[cx+Math.cos(deg*Math.PI/180)*len, cy+Math.sin(deg*Math.PI/180)*len];
  const [hx,hy]=toXY(hDeg,40);
  const [mx,my]=toXY(mDeg,56);
  const [sx,sy]=toXY(sDeg,62);
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'18px 16px'}}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="#FFFBEB" stroke="#FDE68A" strokeWidth={3}/>
        {[...Array(12)].map((_,i)=>{const a=(i*30-90)*Math.PI/180;const [x1,y1]=[cx+Math.cos(a)*(r-6),cy+Math.sin(a)*(r-6)];const [x2,y2]=[cx+Math.cos(a)*(r-13),cy+Math.sin(a)*(r-13)];return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth={i%3===0?3:1.5} strokeLinecap="round"/>;})}
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#1F2937" strokeWidth={5} strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#374151" strokeWidth={3.5} strokeLinecap="round"/>
        <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#EF4444" strokeWidth={2} strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r={4} fill="#1F2937"/>
      </svg>
      <div style={{fontSize:32,fontWeight:900,color:'#1F2937',letterSpacing:-1,fontVariantNumeric:'tabular-nums'}}>
        {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
      </div>
      <div style={{fontSize:15,color:'#6B7280',fontWeight:600}}>{day}, {now.getDate()} {mName} {now.getFullYear()}</div>
    </div>
  );
}

// ════════ RANDOM NUMBER ═══════════════════════════════════════════════════════
function RandomNumberTool(){
  const [min,setMin]=useState(1);
  const [max,setMax]=useState(100);
  const [result,setResult]=useState(null);
  const [rolling,setRolling]=useState(false);
  const roll=()=>{
    if(min>=max)return;
    setRolling(true);
    let count=0,iv=setInterval(()=>{
      setResult(Math.floor(Math.random()*(max-min+1))+min);
      count++;if(count>16){clearInterval(iv);setRolling(false);}
    },50);
  };
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,padding:'20px 16px'}}>
      <div style={{background:'#EFF6FF',border:'3px solid #BFDBFE',borderRadius:20,width:140,height:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <span style={{fontSize:44,fontWeight:900,color:'#1E40AF',fontVariantNumeric:'tabular-nums',animation:rolling?'blink 0.08s linear infinite':'none'}}>{result??'?'}</span>
      </div>
      <div style={{display:'flex',gap:16,alignItems:'center'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF'}}>MIN</label>
          <input type="number" value={min} onChange={e=>setMin(Number(e.target.value))} style={{width:70,border:'2px solid #E5E7EB',borderRadius:10,padding:'7px 10px',fontSize:16,fontWeight:800,textAlign:'center',outline:'none',fontFamily:'inherit',color:'#374151'}}/>
        </div>
        <span style={{fontSize:20,color:'#D1D5DB',fontWeight:900,paddingTop:18}}>→</span>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
          <label style={{fontSize:11,fontWeight:700,color:'#9CA3AF'}}>MAX</label>
          <input type="number" value={max} onChange={e=>setMax(Number(e.target.value))} style={{width:70,border:'2px solid #E5E7EB',borderRadius:10,padding:'7px 10px',fontSize:16,fontWeight:800,textAlign:'center',outline:'none',fontFamily:'inherit',color:'#374151'}}/>
        </div>
      </div>
      <button onClick={roll} disabled={rolling||min>=max} style={{background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:14,padding:'13px 0',fontSize:16,fontWeight:800,cursor:'pointer',color:'#1E3A5F',width:'100%',opacity:rolling||min>=max?0.5:1}}>
        {rolling?'Rolling…':'🎲 Roll'}
      </button>
    </div>
  );
}

// ════════ NOISE MONITOR ═══════════════════════════════════════════════════════
function NoiseTool(){
  const [active,setActive]=useState(false);
  const [level,setLevel]=useState(0);
  const [threshold,setThreshold]=useState(60);
  const [alert,setAlert]=useState(false);
  const audioRef=useRef(null);
  const analyserRef=useRef(null);
  const rafRef=useRef(null);
  const stopMonitor=()=>{
    setActive(false);setLevel(0);setAlert(false);
    if(rafRef.current)cancelAnimationFrame(rafRef.current);
    if(audioRef.current){audioRef.current.getTracks().forEach(t=>t.stop());audioRef.current=null;}
  };
  const startMonitor=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      audioRef.current=stream;
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const src=ctx.createMediaStreamSource(stream);
      const an=ctx.createAnalyser();an.fftSize=256;
      src.connect(an);analyserRef.current=an;
      setActive(true);
      const tick=()=>{
        const buf=new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(buf);
        const avg=buf.reduce((a,b)=>a+b,0)/buf.length;
        const db=Math.round(avg/255*100);
        setLevel(db);setAlert(db>threshold);
        rafRef.current=requestAnimationFrame(tick);
      };
      tick();
    }catch(e){alert('Microphone access denied.');}
  };
  useEffect(()=>()=>stopMonitor(),[]);
  const col=alert?'#EF4444':level>threshold*0.7?'#F59E0B':'#22C55E';
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,padding:'20px 16px'}}>
      <div style={{width:130,height:130,borderRadius:'50%',border:`6px solid ${active?col:'#E5E7EB'}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:active?col+'15':'#F9FAFB',transition:'all 0.2s',position:'relative'}}>
        <div style={{fontSize:36,fontWeight:900,color:active?col:'#D1D5DB',fontVariantNumeric:'tabular-nums'}}>{active?level:0}</div>
        <div style={{fontSize:11,fontWeight:700,color:'#9CA3AF'}}>dB level</div>
        {alert&&<div style={{position:'absolute',top:-8,right:-8,background:'#EF4444',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,animation:'blink 0.5s linear infinite'}}>🔔</div>}
      </div>
      <div style={{width:'100%'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:'#9CA3AF'}}>Threshold</span><span style={{fontSize:12,fontWeight:800,color:'#374151'}}>{threshold}</span></div>
        <input type="range" min={10} max={90} value={threshold} onChange={e=>setThreshold(Number(e.target.value))} style={{width:'100%',accentColor:'#60A5FA'}}/>
      </div>
      <div style={{width:'100%',background:'#F3F4F6',borderRadius:8,height:16,overflow:'hidden'}}>
        <div style={{width:`${level}%`,height:'100%',background:col,borderRadius:8,transition:'width 0.08s'}}/>
        <div style={{width:2,height:'100%',background:'#374151',position:'relative',left:`${threshold}%`,top:'-100%',borderRadius:2}}/>
      </div>
      <button onClick={active?stopMonitor:startMonitor} style={{background:active?'#FECACA':'#BBF7D0',border:active?'2px solid #FCA5A5':'2px solid #86EFAC',borderRadius:14,padding:'12px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:active?'#991B1B':'#14532D',width:'100%'}}>
        {active?'🔇 Stop':'🎤 Start Monitoring'}
      </button>
    </div>
  );
}

// ════════ MATHS CHALLENGE ════════════════════════════════════════════════════
const OP_META={'+': {col:'#BBF7D0',text:'#14532D'}, '−': {col:'#BFDBFE',text:'#1E3A5F'}, '×': {col:'#FDE68A',text:'#78350F'}, '÷': {col:'#DDD6FE',text:'#4C1D95'}};
function MathsChallengeTool(){
  const [ops,setOps]=useState({'+':true,'−':true,'×':false,'÷':false});
  const [diff,setDiff]=useState('easy');
  const [q,setQ]=useState(null);
  const [ans,setAns]=useState(null);
  const [shown,setShown]=useState(false);
  const [count,setCount]=useState(0);
  const [streak,setStreak]=useState(0);
  const generate=()=>{
    const active=Object.entries(ops).filter(([,v])=>v).map(([k])=>k);
    if(!active.length)return;
    const op=active[Math.floor(Math.random()*active.length)];
    const max=diff==='easy'?10:diff==='medium'?20:50;
    const mmax=diff==='easy'?5:diff==='medium'?10:12;
    let question,answer;
    if(op==='+'){const a=Math.floor(Math.random()*max)+1,b=Math.floor(Math.random()*max)+1;question=`${a} + ${b}`;answer=a+b;}
    else if(op==='−'){const a=Math.floor(Math.random()*max)+2,b=Math.floor(Math.random()*(a-1))+1;question=`${a} − ${b}`;answer=a-b;}
    else if(op==='×'){const a=Math.floor(Math.random()*mmax)+1,b=Math.floor(Math.random()*mmax)+1;question=`${a} × ${b}`;answer=a*b;}
    else{const b=Math.floor(Math.random()*mmax)+1,a=(Math.floor(Math.random()*mmax)+1)*b;question=`${a} ÷ ${b}`;answer=a/b;}
    setQ(question);setAns(answer);setShown(false);
    setCount(c=>c+1);
  };
  const reveal=()=>{if(q&&!shown){setShown(true);setStreak(s=>s+1);}};
  const reset=()=>{setQ(null);setAns(null);setShown(false);setCount(0);setStreak(0);};
  const anyOp=Object.values(ops).some(Boolean);
  return(
    <div style={{display:'flex',flexDirection:'column',gap:11,padding:'14px 14px'}}>
      {/* Op toggles */}
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        {Object.entries(ops).map(([op,on])=>{const m=OP_META[op];return(
          <button key={op} onClick={()=>setOps(o=>({...o,[op]:!o[op]}))} style={{width:54,height:46,borderRadius:13,border:'none',background:on?m.col:'#F3F4F6',color:on?m.text:'#D1D5DB',fontWeight:900,fontSize:22,cursor:'pointer',transition:'all 0.15s',transform:on?'scale(1.05)':'scale(1)'}}>{op}</button>
        );})}
      </div>
      {/* Difficulty */}
      <div style={{display:'flex',background:'#F3F4F6',borderRadius:11,padding:3,gap:2}}>
        {['easy','medium','hard'].map(d=><button key={d} onClick={()=>setDiff(d)} style={{flex:1,padding:'6px 0',borderRadius:9,border:'none',background:diff===d?'white':'transparent',fontWeight:700,fontSize:12,cursor:'pointer',color:diff===d?'#374151':'#9CA3AF',boxShadow:diff===d?'0 1px 4px #0001':''}}>{d.charAt(0).toUpperCase()+d.slice(1)}</button>)}
      </div>
      {/* Question card */}
      <div
        onClick={reveal}
        style={{background:q?'#F0F9FF':'#F9FAFB',border:`2.5px solid ${q?'#BFDBFE':'#E5E7EB'}`,borderRadius:20,padding:'22px 16px',textAlign:'center',minHeight:128,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:q&&!shown?'pointer':'default',gap:10,transition:'border-color 0.2s'}}>
        {q
          ?<>
            <div style={{fontSize:30,fontWeight:900,color:'#1E3A5F',letterSpacing:-0.5,fontVariantNumeric:'tabular-nums'}}>{q} = <span style={{color:'#9CA3AF'}}>?</span></div>
            {shown
              ?<div style={{fontSize:42,fontWeight:900,color:'#22C55E',animation:'winPop 0.3s ease-out',fontVariantNumeric:'tabular-nums'}}>{ans}</div>
              :<div style={{fontSize:13,color:'#93C5FD',fontWeight:700,background:'#EFF6FF',borderRadius:20,padding:'5px 14px'}}>👆 Tap to reveal answer</div>
            }
          </>
          :<div style={{fontSize:14,color:'#9CA3AF',fontWeight:600}}>Press New Question to begin</div>
        }
      </div>
      {/* Stats row */}
      {count>0&&<div style={{display:'flex',gap:8,justifyContent:'center'}}>
        <span style={{background:'#EFF6FF',borderRadius:20,padding:'3px 11px',fontSize:12,fontWeight:700,color:'#1E3A5F'}}>📋 {count} question{count>1?'s':''}</span>
        {streak>0&&<span style={{background:'#FDF2F8',borderRadius:20,padding:'3px 11px',fontSize:12,fontWeight:700,color:'#831843'}}>🔥 {streak} streak</span>}
      </div>}
      {/* Buttons */}
      <div style={{display:'flex',gap:8}}>
        <button onClick={generate} disabled={!anyOp} style={{flex:1,background:'#BFDBFE',border:'2px solid #93C5FD',borderRadius:14,padding:'12px 0',fontSize:15,fontWeight:800,cursor:anyOp?'pointer':'not-allowed',color:'#1E3A5F',opacity:anyOp?1:0.45}}>
          {q?'→ Next':'🧮 New Question'}
        </button>
        {count>0&&<button onClick={reset} style={{background:'#F9FAFB',border:'2px solid #E5E7EB',borderRadius:14,padding:'12px 14px',fontSize:16,cursor:'pointer',color:'#9CA3AF'}}>↺</button>}
      </div>
    </div>
  );
}


// ════════ BREATHING ═══════════════════════════════════════════════════════════
const BREATH_PATTERNS=[
  {label:'Box',        phases:[{t:'Breathe in',d:4,scale:1.0,col:'#93C5FD'},{t:'Hold',d:4,scale:1.0,col:'#C4B5FD'},{t:'Breathe out',d:4,scale:0.38,col:'#86EFAC'},{t:'Hold',d:4,scale:0.38,col:'#C4B5FD'}]},
  {label:'4-7-8',      phases:[{t:'Breathe in',d:4,scale:1.0,col:'#93C5FD'},{t:'Hold',d:7,scale:1.0,col:'#C4B5FD'},{t:'Breathe out',d:8,scale:0.38,col:'#86EFAC'}]},
  {label:'5-5 Calm',   phases:[{t:'Breathe in',d:5,scale:1.0,col:'#93C5FD'},{t:'Breathe out',d:5,scale:0.38,col:'#86EFAC'}]},
  {label:'3-3-3',      phases:[{t:'Breathe in',d:3,scale:1.0,col:'#93C5FD'},{t:'Hold',d:3,scale:1.0,col:'#C4B5FD'},{t:'Breathe out',d:3,scale:0.38,col:'#86EFAC'}]},
];
function BreathingTool(){
  const [active,setActive]=useState(false);
  const [patIdx,setPatIdx]=useState(0);
  const [phIdx,setPhIdx]=useState(0);
  const [tick,setTick]=useState(0);
  const [cycles,setCycles]=useState(0);
  const stRef=useRef({patIdx:0,phIdx:0,tick:0});
  const ivRef=useRef(null);
  const stop=()=>{setActive(false);clearInterval(ivRef.current);setPhIdx(0);setTick(0);setCycles(0);stRef.current={patIdx,phIdx:0,tick:0};};
  const start=()=>{
    const p=BREATH_PATTERNS[patIdx];
    const initTick=p.phases[0].d;
    stRef.current={patIdx,phIdx:0,tick:initTick};
    setPhIdx(0);setTick(initTick);setCycles(0);setActive(true);
    ivRef.current=setInterval(()=>{
      const s=stRef.current;
      const pat=BREATH_PATTERNS[s.patIdx];
      if(s.tick>1){
        stRef.current={...s,tick:s.tick-1};
        setTick(s.tick-1);
      }else{
        const next=(s.phIdx+1)%pat.phases.length;
        const nt=pat.phases[next].d;
        if(next===0)setCycles(c=>c+1);
        stRef.current={...s,phIdx:next,tick:nt};
        setPhIdx(next);setTick(nt);
      }
    },1000);
  };
  useEffect(()=>()=>clearInterval(ivRef.current),[]);
  const pat=BREATH_PATTERNS[patIdx];
  const ph=pat.phases[phIdx];
  const col=active?ph.col:'#D1D5DB';
  const scale=active?ph.scale:0.55;
  const dur=active?ph.d:0.6;
  const instrs=[pat.phases.map(p=>`${p.t} ${p.d}s`).join(' → ')];
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'18px 16px'}}>
      {/* Pattern tabs */}
      <div style={{display:'flex',gap:5,flexWrap:'wrap',justifyContent:'center'}}>
        {BREATH_PATTERNS.map((p,i)=><button key={i} onClick={()=>{if(!active){setPatIdx(i);setPhIdx(0);}}} style={{padding:'5px 11px',borderRadius:20,border:'none',background:patIdx===i?'#BFDBFE':'#F3F4F6',color:patIdx===i?'#1E3A5F':'#9CA3AF',fontWeight:700,fontSize:12,cursor:'pointer',transition:'all 0.15s'}}>{p.label}</button>)}
      </div>
      {/* Animated circle */}
      <div style={{position:'relative',width:190,height:190,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {/* Glow ring */}
        <div style={{position:'absolute',width:164,height:164,borderRadius:'50%',background:col+'22',transform:`scale(${scale*1.18})`,transition:`transform ${dur}s ease-in-out`,pointerEvents:'none'}}/>
        {/* Main circle */}
        <div style={{width:150,height:150,borderRadius:'50%',background:col+'44',border:`5px solid ${col}`,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',transform:`scale(${scale})`,transition:`transform ${dur}s ease-in-out, background ${0.4}s, border-color 0.4s`,boxShadow:`0 0 40px ${col}55`,position:'relative',zIndex:1}}>
          {active
            ?<><div style={{fontSize:34,fontWeight:900,color:'#1F2937',lineHeight:1,fontVariantNumeric:'tabular-nums'}}>{tick}</div><div style={{fontSize:11,fontWeight:700,color:'#6B7280',marginTop:3}}>{ph.t.toLowerCase()}</div></>
            :<div style={{fontSize:36}}>🌬️</div>
          }
        </div>
      </div>
      {/* Phase label */}
      <div style={{minHeight:28,textAlign:'center'}}>
        {active&&<div style={{fontSize:18,fontWeight:800,color:'#374151',transition:'opacity 0.3s'}}>{ph.t}</div>}
        {!active&&<div style={{fontSize:12,color:'#9CA3AF',fontWeight:600}}>{instrs}</div>}
      </div>
      {/* Cycles */}
      {cycles>0&&<div style={{background:'#F0FDF4',border:'2px solid #BBF7D0',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:700,color:'#14532D'}}>✓ {cycles} cycle{cycles>1?'s':''} complete</div>}
      <button onClick={active?stop:start} style={{background:active?'#FECACA':'#BFDBFE',border:active?'2px solid #FCA5A5':'2px solid #93C5FD',borderRadius:14,padding:'13px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:active?'#991B1B':'#1E3A5F',width:'100%',transition:'all 0.2s'}}>
        {active?'⏹ Stop':'▶ Start Breathing'}
      </button>
    </div>
  );
}


// ════════ SCOREBOARD ══════════════════════════════════════════════════════════
const SCORE_COLS=[
  {bg:'#FDE68A',border:'#FCD34D',text:'#92400E',btn:'#F59E0B'},
  {bg:'#BFDBFE',border:'#93C5FD',text:'#1E3A5F',btn:'#3B82F6'},
  {bg:'#BBF7D0',border:'#86EFAC',text:'#14532D',btn:'#22C55E'},
  {bg:'#DDD6FE',border:'#C4B5FD',text:'#4C1D95',btn:'#8B5CF6'},
];
function ScoreboardTool(){
  const [teams,setTeams]=useState(()=>{
    try{const s=localStorage.getItem('toolkit_scoreboard');if(s)return JSON.parse(s);}catch(e){}
    return [{id:1,name:'Team 1',score:0,editing:false},{id:2,name:'Team 2',score:0,editing:false}];
  });
  useEffect(()=>{try{localStorage.setItem('toolkit_scoreboard',JSON.stringify(teams));}catch(e){};},[teams]);
  const [flash,setFlash]=useState({});
  const addScore=(id,delta)=>{
    setTeams(t=>t.map(tm=>tm.id===id?{...tm,score:Math.max(0,tm.score+delta)}:tm));
    setFlash(f=>({...f,[id]:(delta>0?'+':'')+delta}));
    setTimeout(()=>setFlash(f=>{const n={...f};delete n[id];return n;}),700);
  };
  const addTeam=()=>{
    if(teams.length>=4)return;
    setTeams(t=>[...t,{id:Date.now(),name:`Team ${t.length+1}`,score:0,editing:false}]);
  };
  const startEdit=id=>setTeams(t=>t.map(tm=>({...tm,editing:tm.id===id})));
  const endEdit=(id,val)=>setTeams(t=>t.map(tm=>tm.id===id?{...tm,name:(val||tm.name).trim(),editing:false}:tm));
  const reset=()=>setTeams(t=>t.map(tm=>({...tm,score:0})));
  const maxScore=Math.max(...teams.map(t=>t.score),0);
  return(
    <div style={{display:'flex',flexDirection:'column',gap:9,padding:'14px 14px'}}>
      {teams.map((team,i)=>{
        const col=SCORE_COLS[i%SCORE_COLS.length];
        const leading=team.score>0&&team.score===maxScore;
        return(
          <div key={team.id} style={{background:col.bg,border:`2.5px solid ${col.border}`,borderRadius:16,padding:'11px 13px',position:'relative'}}>
            {leading&&<div style={{position:'absolute',top:-9,right:10,background:'#FCD34D',borderRadius:20,padding:'2px 8px',fontSize:10,fontWeight:800,color:'#78350F',boxShadow:'0 2px 6px #0002'}}>👑 Leading</div>}
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{flex:1}}>
                {team.editing
                  ?<input autoFocus defaultValue={team.name} onBlur={e=>endEdit(team.id,e.target.value)} onKeyDown={e=>e.key==='Enter'&&endEdit(team.id,e.target.value)} style={{fontSize:14,fontWeight:800,color:col.text,background:'transparent',border:`2px solid ${col.border}`,borderRadius:7,padding:'3px 7px',width:'100%',outline:'none',fontFamily:'inherit'}}/>
                  :<div onClick={()=>startEdit(team.id)} style={{fontSize:14,fontWeight:800,color:col.text,cursor:'pointer'}} title="Click to rename">{team.name}</div>
                }
              </div>
              <div style={{position:'relative',textAlign:'center',minWidth:58}}>
                <div style={{fontSize:38,fontWeight:900,color:col.text,fontVariantNumeric:'tabular-nums',lineHeight:1}}>{team.score}</div>
                {flash[team.id]&&<div style={{position:'absolute',top:-14,right:0,fontSize:15,fontWeight:900,color:col.btn,animation:'winPop 0.4s ease-out',pointerEvents:'none'}}>{flash[team.id]}</div>}
              </div>
              {teams.length>1&&<button onClick={()=>setTeams(t=>t.filter(tm=>tm.id!==team.id))} style={{background:'none',border:'none',color:'#D1D5DB',cursor:'pointer',fontSize:16,padding:0,flexShrink:0,lineHeight:1}}>×</button>}
            </div>
            <div style={{display:'flex',gap:5}}>
              {[1,5,10].map(d=><button key={d} onClick={()=>addScore(team.id,d)} style={{flex:1,background:'white',border:`2px solid ${col.border}`,borderRadius:9,padding:'7px 0',fontSize:13,fontWeight:800,cursor:'pointer',color:col.text}}>+{d}</button>)}
              <button onClick={()=>addScore(team.id,-1)} style={{background:'white',border:'2px solid #E5E7EB',borderRadius:9,padding:'7px 11px',fontSize:13,fontWeight:800,cursor:'pointer',color:'#9CA3AF'}}>−1</button>
            </div>
          </div>
        );
      })}
      <div style={{display:'flex',gap:8}}>
        {teams.length<4&&<button onClick={addTeam} style={{flex:1,background:'#F9FAFB',border:'2px dashed #D1D5DB',borderRadius:12,padding:'9px 0',fontSize:13,fontWeight:700,cursor:'pointer',color:'#9CA3AF'}}>+ Add Team</button>}
        <button onClick={reset} style={{flex:1,background:'#FEE2E2',border:'2px solid #FECACA',borderRadius:12,padding:'9px 0',fontSize:13,fontWeight:700,cursor:'pointer',color:'#991B1B'}}>↺ Reset All</button>
      </div>
    </div>
  );
}


// ════════ SPINNER WHEEL ═══════════════════════════════════════════════════════
const WHEEL_COLS=['#FDE68A','#BBF7D0','#BFDBFE','#DDD6FE','#FBCFE8','#A5F3FC','#FCA5A5','#C7D2FE','#D9F99D','#FED7AA'];
function SpinnerWheelTool({students=[]}){
  const defaultNames=['Alex','Bailey','Casey','Dana','Elliot','Finley','Grace','Hunter','Indie','Jordan'];
  const [entries,setEntries]=useState(students.length>0?[...students]:[...defaultNames]);
  const [spinning,setSpinning]=useState(false);
  const [rotation,setRotation]=useState(0);
  const [winner,setWinner]=useState(null);
  const [newEntry,setNewEntry]=useState('');
  const rotRef=useRef(0);
  const spin=()=>{
    if(spinning||entries.length<2)return;
    setWinner(null);setSpinning(true);
    const extra=(4+Math.random()*3)*360;
    const land=Math.random()*360;
    const total=rotRef.current+extra+land;
    rotRef.current=total;
    setRotation(total);
    setTimeout(()=>{
      const finalNorm=((total%360)+360)%360;
      const seg=360/entries.length;
      const ptr=(360-finalNorm)%360;
      const idx=Math.floor(ptr/seg)%entries.length;
      setWinner(entries[idx]);setSpinning(false);
    },4200);
  };
  const addEntry=()=>{if(!newEntry.trim())return;setEntries(e=>[...e,newEntry.trim()]);setNewEntry('');setWinner(null);};
  const removeEntry=i=>{setEntries(e=>e.filter((_,idx)=>idx!==i));setWinner(null);};
  // SVG pie
  const n=entries.length;
  const CX=120,CY=120,R=105;
  const segs=entries.map((name,i)=>{
    const a0=(i/n)*2*Math.PI-Math.PI/2;
    const a1=((i+1)/n)*2*Math.PI-Math.PI/2;
    const x0=CX+R*Math.cos(a0),y0=CY+R*Math.sin(a0);
    const x1=CX+R*Math.cos(a1),y1=CY+R*Math.sin(a1);
    const large=(1/n)>0.5?1:0;
    const ma=(a0+a1)/2,tr=R*0.66;
    const tx=CX+tr*Math.cos(ma),ty=CY+tr*Math.sin(ma);
    const tDeg=Math.cos(ma)>=0?ma*180/Math.PI:ma*180/Math.PI+180;
    const d=n===1?`M ${CX-R} ${CY} a ${R} ${R} 0 1 1 0.001 0 Z`:`M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
    return{name,color:WHEEL_COLS[i%WHEEL_COLS.length],d,tx,ty,tDeg};
  });
  const fs=n>10?7:n>6?9:11;
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,padding:'12px 14px'}}>
      {/* Wheel + pointer */}
      <div style={{position:'relative',width:240,height:248}}>
        <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',fontSize:20,zIndex:10,lineHeight:1,filter:'drop-shadow(0 2px 2px #0003)'}}>▼</div>
        <svg width={240} height={240} viewBox={`0 0 240 240`} style={{position:'absolute',top:8,left:0,transform:`rotate(${rotation}deg)`,transition:spinning?'transform 4.2s cubic-bezier(0.15,0.5,0.1,1.0)':'none'}}>
          <circle cx={CX} cy={CY} r={R+4} fill="white" stroke="#E5E7EB" strokeWidth={3}/>
          {segs.map((s,i)=>(
            <g key={i}>
              <path d={s.d} fill={s.color} stroke="white" strokeWidth={2}/>
              <text x={s.tx} y={s.ty} textAnchor="middle" dominantBaseline="middle" fontSize={fs} fontWeight="800" fill="#1F2937" transform={`rotate(${s.tDeg},${s.tx},${s.ty})`}>{s.name.length>9?s.name.slice(0,8)+'…':s.name}</text>
            </g>
          ))}
          <circle cx={CX} cy={CY} r={14} fill="white" stroke="#E5E7EB" strokeWidth={2.5}/>
        </svg>
      </div>
      {/* Winner */}
      {winner&&<div style={{background:'#FDE68A',border:'2.5px solid #FCD34D',borderRadius:14,padding:'8px 20px',textAlign:'center',animation:'winPop 0.3s ease-out'}}>
        <div style={{fontSize:11,fontWeight:700,color:'#92400E'}}>🎉 Selected!</div>
        <div style={{fontSize:18,fontWeight:900,color:'#78350F'}}>{winner}</div>
      </div>}
      <button onClick={spin} disabled={spinning||entries.length<2} style={{background:'#DDD6FE',border:'2px solid #C4B5FD',borderRadius:14,padding:'11px 0',fontSize:15,fontWeight:800,cursor:spinning||entries.length<2?'not-allowed':'pointer',color:'#4C1D95',width:'100%',opacity:spinning||entries.length<2?0.55:1}}>
        {spinning?'🌀 Spinning…':'🎡 Spin the Wheel!'}
      </button>
      {/* Entries manager */}
      <details style={{width:'100%'}}>
        <summary style={{fontSize:12,fontWeight:700,color:'#9CA3AF',cursor:'pointer',userSelect:'none',padding:'4px 0'}}>⚙ Edit entries ({entries.length})</summary>
        <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
          <div style={{display:'flex',flexWrap:'wrap',gap:4,maxHeight:80,overflowY:'auto'}}>
            {entries.map((e,i)=><span key={i} style={{background:'#F3F4F6',borderRadius:20,padding:'3px 8px',fontSize:11,fontWeight:700,color:'#374151',display:'flex',alignItems:'center',gap:3}}>{e}<button onClick={()=>removeEntry(i)} style={{background:'none',border:'none',color:'#9CA3AF',cursor:'pointer',fontSize:11,padding:0,lineHeight:1}}>×</button></span>)}
          </div>
          <div style={{display:'flex',gap:6}}>
            <input value={newEntry} onChange={e=>setNewEntry(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addEntry()} placeholder="Add entry…" style={{flex:1,border:'2px solid #E5E7EB',borderRadius:9,padding:'7px 10px',fontSize:12,outline:'none',fontFamily:'inherit'}}/>
            <button onClick={addEntry} style={{background:'#DDD6FE',border:'2px solid #C4B5FD',borderRadius:9,padding:'7px 12px',fontWeight:800,cursor:'pointer',fontSize:13,color:'#4C1D95'}}>+</button>
          </div>
        </div>
      </details>
    </div>
  );
}


// ════════ MORNING MEETING ═════════════════════════════════════════════════════
const MM_DAYS_CONTENT=[
  {greeting:'Silent Movie Stars!',value:'INTEGRITY',maths:['9 × 8 + 14 = ?','³⁄₈ of 240 = ?','40% of 75 = ?'],word:'resilient',riddle:'The more you take, the more you leave behind.'},
  {greeting:'Two Truths and a Lie!',value:'RESILIENCE',maths:['6² − 4 × 5 = ?','²⁄₅ of 350 = ?','35% of 60 = ?'],word:'tenacious',riddle:'I speak without a mouth and hear without ears.'},
  {greeting:'Question Tennis!',value:'EMPATHY',maths:['(12 + 8) × 3 − 14 = ?','³⁄₄ of 360 = ?','15% of 80 = ?'],word:'eloquent',riddle:'I have cities, but no houses live there.'},
  {greeting:'Compliment Circle!',value:'COURAGE',maths:['7² + 3 × 6 = ?','⁴⁄₅ of 200 = ?','60% of 45 = ?'],word:'persevere',riddle:'The more you have of it, the less you see.'},
  {greeting:'Mirror Movement!',value:'RESPECT',maths:['48 ÷ 6 + 5² = ?','³⁄₇ of 490 = ?','25% of 96 = ?'],word:'audacious',riddle:'I go up but never come down.'},
];
function MorningMeetingTool(){
  const safeLS=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}};
  const getDayIdx=()=>{
    const ov=safeLS('mm_dayOverride',null);
    if(ov!==null)return ov;
    const doy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
    return(doy-1)%20;
  };
  const [dayIdx,setDayIdx]=useState(()=>getDayIdx());
  const [className,setClassName]=useState(()=>safeLS('mm_className',''));
  const [greeting,setGreeting]=useState(()=>safeLS('mm_greeting','Good Morning!'));
  const [sections,setSections]=useState(()=>{
    const saved=safeLS('mm_sections',{});
    const defs={greeting:true,value:true,announcements:true,game:true,grammar:true,spelling:true,word:true,maths:true,literacy:true,riddle:true,reflection:true};
    return Object.fromEntries(Object.entries(defs).map(([k,v])=>[k,saved[k]!==undefined?saved[k]:v]));
  });
  const preview=MM_DAYS_CONTENT[dayIdx%MM_DAYS_CONTENT.length];
  const enabledCount=Object.values(sections).filter(Boolean).length;
  const SECTION_ICONS={greeting:'👋',value:'⭐',announcements:'📢',game:'🎮',grammar:'✏️',spelling:'🔤',word:'📖',maths:'🔢',literacy:'✍️',riddle:'🧩',reflection:'💭'};
  return(
    <div style={{display:'flex',flexDirection:'column',gap:12,padding:'16px 14px'}}>
      {/* Day header */}
      <div style={{background:'#EDE9FE',border:'2.5px solid #C4B5FD',borderRadius:16,padding:'14px 16px',textAlign:'center'}}>
        <div style={{fontSize:11,fontWeight:800,color:'#7C3AED',letterSpacing:1,marginBottom:4}}>DAY {dayIdx+1} OF 20</div>
        <div style={{fontSize:16,fontWeight:900,color:'#4C1D95'}}>{greeting}</div>
        {className&&<div style={{fontSize:12,color:'#7C3AED',fontWeight:600,marginTop:2}}>{className}</div>}
      </div>
      {/* Quick preview */}
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <div style={{fontSize:11,fontWeight:800,color:'#9CA3AF',letterSpacing:0.5}}>TODAY'S HIGHLIGHTS</div>
        {sections.greeting&&<div style={{display:'flex',gap:8,alignItems:'flex-start',padding:'7px 10px',background:'#FFFBEB',borderRadius:10,border:'1.5px solid #FDE68A'}}>
          <span style={{fontSize:15,flexShrink:0}}>👋</span>
          <div><div style={{fontSize:10,fontWeight:800,color:'#92400E'}}>GREETING</div><div style={{fontSize:12,fontWeight:600,color:'#78350F'}}>{preview.greeting}</div></div>
        </div>}
        {sections.value&&<div style={{display:'flex',gap:8,alignItems:'flex-start',padding:'7px 10px',background:'#F0FDF4',borderRadius:10,border:'1.5px solid #BBF7D0'}}>
          <span style={{fontSize:15,flexShrink:0}}>⭐</span>
          <div><div style={{fontSize:10,fontWeight:800,color:'#14532D'}}>VALUE</div><div style={{fontSize:12,fontWeight:600,color:'#14532D'}}>{preview.value}</div></div>
        </div>}
        {sections.maths&&<div style={{display:'flex',gap:8,alignItems:'flex-start',padding:'7px 10px',background:'#EFF6FF',borderRadius:10,border:'1.5px solid #BFDBFE'}}>
          <span style={{fontSize:15,flexShrink:0}}>🔢</span>
          <div><div style={{fontSize:10,fontWeight:800,color:'#1E3A5F'}}>MATHS</div><div style={{fontSize:11,fontWeight:600,color:'#1E40AF'}}>{preview.maths[0]}</div></div>
        </div>}
        {sections.word&&<div style={{display:'flex',gap:8,alignItems:'flex-start',padding:'7px 10px',background:'#FDF2F8',borderRadius:10,border:'1.5px solid #FBCFE8'}}>
          <span style={{fontSize:15,flexShrink:0}}>📖</span>
          <div><div style={{fontSize:10,fontWeight:800,color:'#831843'}}>WORD OF THE DAY</div><div style={{fontSize:12,fontWeight:700,color:'#831843',fontStyle:'italic'}}>{preview.word}</div></div>
        </div>}
      </div>
      {/* Sections indicator */}
      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
        {Object.entries(SECTION_ICONS).map(([k,icon])=>(
          <span key={k} style={{fontSize:14,opacity:sections[k]?1:0.2}} title={k}>{icon}</span>
        ))}
        <span style={{fontSize:11,color:'#9CA3AF',fontWeight:600,alignSelf:'center',marginLeft:4}}>{enabledCount} sections</span>
      </div>
      {/* Launch button */}
      <button
        onClick={()=>window.open('/morning-meeting','_blank')}
        style={{background:'#7C3AED',border:'none',borderRadius:14,padding:'14px 0',fontSize:15,fontWeight:800,cursor:'pointer',color:'white',boxShadow:'0 4px 14px #7C3AED44',letterSpacing:0.2}}
      >
        ▶ Launch Presentation
      </button>
      <button
        onClick={()=>window.open('/morning-meeting','_blank')}
        style={{background:'#F5F3FF',border:'2px solid #DDD6FE',borderRadius:12,padding:'9px 0',fontSize:12,fontWeight:700,cursor:'pointer',color:'#7C3AED'}}
      >
        ⚙ Edit & Configure
      </button>
    </div>
  );
}


// ════════ MUSIC PLAYER ════════════════════════════════════════════════════════
const MUSIC_TRACKS=[
  {file:'heart-of-the-ocean.mp3',  title:'Heart of the Ocean', artist:'Chosic'},
  {file:'lovely.mp3',              title:'Lovely',             artist:'Chosic'},
  {file:'morning-routine.mp3',     title:'Morning Routine',    artist:'Lofi Study'},
  {file:'beloved.mp3',             title:'Beloved',            artist:'Roa'},
  {file:'embrace.mp3',             title:'Embrace',            artist:'Roa'},
  {file:'the-open-sky.mp3',        title:'The Open Sky',       artist:'Chosic'},
  {file:'transcendence.mp3',       title:'Transcendence',      artist:'Chosic'},
  {file:'when-i-was-a-boy.mp3',    title:'When I Was A Boy',   artist:'Chosic'},
  {file:'white-petals.mp3',        title:'White Petals',       artist:'Keys of Moon'},
];
function MusicPlayerTool(){
  const [trackIdx,setTrackIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [progress,setProgress]=useState(0);
  const [duration,setDuration]=useState(0);
  const [volume,setVolume]=useState(0.7);
  const audioRef=useRef(null);
  const playingRef=useRef(false);
  const track=MUSIC_TRACKS[trackIdx];
  const PASTEL=['#FDE68A','#BBF7D0','#BFDBFE','#FBCFE8','#DDD6FE','#A5F3FC','#FEF08A','#D9F99D','#C7D2FE'];

  // Create ONE persistent Audio element on mount
  useEffect(()=>{
    const a=new Audio();
    a.volume=0.7;
    audioRef.current=a;
    const onTime=()=>setProgress(a.currentTime);
    const onMeta=()=>setDuration(isFinite(a.duration)?a.duration:0);
    const onEnd=()=>{
      const next=(playingRef.current===false)?0:undefined;
      setTrackIdx(i=>{
        const ni=(i+1)%MUSIC_TRACKS.length;
        const nextSrc='/music/'+MUSIC_TRACKS[ni].file;
        a.src=nextSrc;
        a.load();
        a.play().catch(()=>{});
        return ni;
      });
    };
    a.addEventListener('timeupdate',onTime);
    a.addEventListener('loadedmetadata',onMeta);
    a.addEventListener('durationchange',onMeta);
    a.addEventListener('ended',onEnd);
    return()=>{
      a.pause();
      a.src='';
      a.removeEventListener('timeupdate',onTime);
      a.removeEventListener('loadedmetadata',onMeta);
      a.removeEventListener('durationchange',onMeta);
      a.removeEventListener('ended',onEnd);
    };
  },[]);

  useEffect(()=>{if(audioRef.current)audioRef.current.volume=volume;},[volume]);

  const loadAndPlay=(idx)=>{
    const a=audioRef.current;
    if(!a)return;
    a.src='/music/'+MUSIC_TRACKS[idx].file;
    a.load();
    setProgress(0);
    setDuration(0);
    a.play().catch(e=>console.warn('Play blocked:',e));
    playingRef.current=true;
    setPlaying(true);
    setTrackIdx(idx);
  };
  const togglePlay=()=>{
    const a=audioRef.current;
    if(!a)return;
    if(!a.src||a.src===window.location.href){
      loadAndPlay(trackIdx);
      return;
    }
    if(playing){a.pause();playingRef.current=false;setPlaying(false);}
    else{a.play().catch(e=>console.warn(e));playingRef.current=true;setPlaying(true);}
  };
  const prev=()=>loadAndPlay((trackIdx-1+MUSIC_TRACKS.length)%MUSIC_TRACKS.length);
  const next=()=>loadAndPlay((trackIdx+1)%MUSIC_TRACKS.length);
  const seek=e=>{
    const a=audioRef.current;
    if(!a||!duration)return;
    const rect=e.currentTarget.getBoundingClientRect();
    const t=(e.clientX-rect.left)/rect.width*duration;
    a.currentTime=t;
    setProgress(t);
  };
  const fmt=s=>{if(!s||!isFinite(s))return'0:00';const m=Math.floor(s/60);return`${m}:${Math.floor(s%60).toString().padStart(2,'0')}`;};
  const pct=duration>0?Math.min(100,progress/duration*100):0;

  return(
    <div style={{display:'flex',flexDirection:'column',gap:0,padding:'16px 14px 14px',height:'100%',boxSizing:'border-box'}}>
      <div style={{background:PASTEL[trackIdx%PASTEL.length],borderRadius:18,padding:'18px 16px 16px',marginBottom:12,textAlign:'center',flexShrink:0}}>
        <div style={{fontSize:44,marginBottom:8}}>{playing?'🎶':'🎵'}</div>
        <div style={{fontSize:15,fontWeight:900,color:'#1F2937',lineHeight:1.2,marginBottom:3}}>{track.title}</div>
        <div style={{fontSize:12,fontWeight:600,color:'#6B7280'}}>{track.artist}</div>
      </div>
      <div style={{marginBottom:4,flexShrink:0}}>
        <div onClick={seek} style={{height:8,background:'#E5E7EB',borderRadius:99,cursor:'pointer',overflow:'hidden',position:'relative'}}>
          <div style={{width:`${pct}%`,height:'100%',background:'#818CF8',borderRadius:99}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
          <span style={{fontSize:10,color:'#9CA3AF',fontWeight:600}}>{fmt(progress)}</span>
          <span style={{fontSize:10,color:'#9CA3AF',fontWeight:600}}>{fmt(duration)}</span>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,marginBottom:12,flexShrink:0}}>
        <button onClick={prev} style={{width:38,height:38,borderRadius:'50%',border:'2px solid #E5E7EB',background:'#F9FAFB',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>⏮</button>
        <button onClick={togglePlay} style={{width:52,height:52,borderRadius:'50%',border:'none',background:'#818CF8',fontSize:22,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 14px #818CF844',color:'white'}}>
          {playing?'⏸':'▶'}
        </button>
        <button onClick={next} style={{width:38,height:38,borderRadius:'50%',border:'2px solid #E5E7EB',background:'#F9FAFB',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>⏭</button>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,flexShrink:0}}>
        <span style={{fontSize:14}}>🔈</span>
        <input type="range" min={0} max={1} step={0.01} value={volume}
          onChange={e=>setVolume(Number(e.target.value))}
          style={{flex:1,accentColor:'#818CF8',cursor:'pointer'}}/>
        <span style={{fontSize:14}}>🔊</span>
      </div>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:4}}>
        <div style={{fontSize:10,fontWeight:800,color:'#9CA3AF',letterSpacing:0.5,marginBottom:4}}>PLAYLIST</div>
        {MUSIC_TRACKS.map((t,i)=>(
          <div key={i} onClick={()=>loadAndPlay(i)}
            style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:10,background:i===trackIdx?PASTEL[i%PASTEL.length]:'#F9FAFB',border:i===trackIdx?'1.5px solid #C4B5FD':'1.5px solid transparent',cursor:'pointer',transition:'all 0.12s'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:i===trackIdx?'#818CF8':'#E5E7EB',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {i===trackIdx&&playing
                ?<span style={{fontSize:9,color:'white'}}>▶</span>
                :<span style={{fontSize:10,color:i===trackIdx?'white':'#9CA3AF',fontWeight:800}}>{i+1}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12,fontWeight:700,color:i===trackIdx?'#4338CA':'#374151',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{t.title}</div>
              <div style={{fontSize:10,color:'#9CA3AF',fontWeight:600}}>{t.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════ TOOL WINDOW (with resize + maximize) ════════════════════════════════
function ToolWindow({win,tool,students,onClose,onFocus,onStartDrag,onStartResize,onToggleMax,onToggleMin}){
  const isMax=win.maximized;
  const isMin=win.minimized;
  const hCol=tool.header;
  const txtCol=tool.text;
  const boxStyle=isMax
    ?{position:'absolute',inset:0,zIndex:win.zIndex,display:'flex',flexDirection:'column',borderRadius:0,border:'none',boxShadow:'none',background:tool.bg,overflow:'hidden'}
    :{position:'absolute',left:win.x,top:win.y,width:win.w,height:isMin?44:win.h,zIndex:win.zIndex,display:'flex',flexDirection:'column',borderRadius:18,border:'2px solid #E5E7EB',boxShadow:'0 8px 32px rgba(0,0,0,0.13)',background:tool.bg,overflow:'hidden',transition:'height 0.2s',minWidth:200,minHeight:isMin?44:120};
  const ToolComp={timer:TimerTool,dice:DiceTool,namepicker:NamePickerTool,groupmaker:GroupMakerTool,checklist:ChecklistTool,brainbreak:BrainBreakTool,helpqueue:HelpQueueTool,classjobs:ClassJobsTool,clock:ClockTool,randomnum:RandomNumberTool,noise:NoiseTool,spinner:SpinnerWheelTool,scoreboard:ScoreboardTool,breathing:BreathingTool,maths:MathsChallengeTool,morning:MorningMeetingTool,music:MusicPlayerTool}[tool.id];
  return(
    <div style={boxStyle} onMouseDown={onFocus}>
      {/* Header / title bar */}
      <div
        onMouseDown={e=>{if(!isMax&&!e.target.closest('button'))onStartDrag(e,win.id);}}
        style={{display:'flex',alignItems:'center',gap:8,padding:'0 10px',height:44,background:hCol,cursor:isMax?'default':'grab',flexShrink:0,userSelect:'none',borderBottom:'1.5px solid #0001'}}
      >
        <span style={{fontSize:18}}>{tool.emoji}</span>
        <span style={{flex:1,fontWeight:800,fontSize:14,color:txtCol,letterSpacing:-0.3}}>{tool.label}</span>
        <button onClick={onToggleMin} title={isMin?'Restore':'Minimise'} style={{width:24,height:24,borderRadius:'50%',border:'none',background:'#FDE68A',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          {isMin?'▲':'▼'}
        </button>
        <button onClick={onToggleMax} title={isMax?'Restore':'Maximise'} style={{width:24,height:24,borderRadius:'50%',border:'none',background:'#BBF7D0',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          {isMax?'⊡':'⊞'}
        </button>
        <button onClick={onClose} title="Close" style={{width:24,height:24,borderRadius:'50%',border:'none',background:'#FCA5A5',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:900,color:'#7F1D1D'}}>×</button>
      </div>
      {/* Content — always mounted (display:none when minimised) so tool state is preserved */}
      <div style={{flex:1,overflow:'hidden',position:'relative',display:isMin?'none':'flex',flexDirection:'column'}}>
        <div style={{zoom:isMax?1:Math.max(0.4,win.w/340),overflowY:'auto',overflowX:'hidden',flex:1}}>
          {ToolComp?<ToolComp students={students}/>:<div style={{padding:20,color:'#9CA3AF',fontSize:14}}>Tool coming soon…</div>}
        </div>
      </div>
      {/* Resize handles (bottom-right corner, right edge, bottom edge) – hidden when maximised or minimised */}
      {!isMax&&!isMin&&<>
        <div onMouseDown={e=>onStartResize(e,win.id,'se')} style={{position:'absolute',right:0,bottom:0,width:18,height:18,cursor:'se-resize',zIndex:10,borderRadius:'0 0 16px 0'}}/>
        <div onMouseDown={e=>onStartResize(e,win.id,'e')}  style={{position:'absolute',right:0,top:18,bottom:18,width:6,cursor:'e-resize',zIndex:9}}/>
        <div onMouseDown={e=>onStartResize(e,win.id,'s')}  style={{position:'absolute',left:18,right:18,bottom:0,height:6,cursor:'s-resize',zIndex:9}}/>
      </>}
    </div>
  );
}

// ════════ DOCK ICON ═══════════════════════════════════════════════════════════
function DockIcon({tool,isOpen,isMinimized,onClick}){
  return(
    <button onClick={onClick} title={tool.label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,padding:'6px 10px',borderRadius:14,border:'none',background:isOpen?tool.header+'CC':'transparent',cursor:'pointer',transition:'all 0.18s',transform:isOpen?'scale(1.08)':'scale(1)',outline:'none'}}>
      <span style={{fontSize:22}}>{tool.emoji}</span>
      <span style={{fontSize:9,fontWeight:800,color:isOpen?tool.text:'#9CA3AF',letterSpacing:0.3,maxWidth:52,textAlign:'center',lineHeight:1.2}}>{tool.label}</span>
      {isOpen&&<div style={{width:5,height:5,borderRadius:'50%',background:isMinimized?'#F59E0B':tool.text,marginTop:1}}/>}
    </button>
  );
}

// ════════ MAIN PAGE ═══════════════════════════════════════════════════════════
const TOOLS=[
  {id:'timer',      label:'Timer',         emoji:'⏰', header:'#FDE68A', text:'#92400E', bg:'#FFFBEB',  w:340, h:440},
  {id:'dice',       label:'Dice',          emoji:'🎲', header:'#BFDBFE', text:'#1E3A5F', bg:'#EFF6FF',  w:340, h:440},
  {id:'namepicker', label:'Name Picker',   emoji:'🎯', header:'#BBF7D0', text:'#14532D', bg:'#F0FDF4',  w:340, h:440},
  {id:'groupmaker', label:'Group Maker',   emoji:'👥', header:'#DDD6FE', text:'#4C1D95', bg:'#F5F3FF',  w:340, h:440},
  {id:'checklist',  label:'Checklist',     emoji:'✅', header:'#A7F3D0', text:'#064E3B', bg:'#ECFDF5',  w:340, h:440},
  {id:'brainbreak', label:'Brain Break',   emoji:'🧠', header:'#FBCFE8', text:'#831843', bg:'#FDF2F8',  w:340, h:440},
  {id:'helpqueue',  label:'Help Queue',    emoji:'🙋', header:'#A5F3FC', text:'#164E63', bg:'#ECFEFF',  w:340, h:440},
  {id:'classjobs',  label:'Class Jobs',    emoji:'⭐', header:'#FEF08A', text:'#713F12', bg:'#FEFCE8',  w:340, h:440},
  {id:'clock',      label:'Clock',         emoji:'🕐', header:'#E0F2FE', text:'#0C4A6E', bg:'#F0F9FF',  w:340, h:440},
  {id:'randomnum',  label:'Random Number', emoji:'🔢', header:'#DDD6FE', text:'#3B0764', bg:'#FAF5FF',  w:340, h:440},
  {id:'noise',      label:'Noise Monitor', emoji:'🔊', header:'#BBF7D0', text:'#14532D', bg:'#F0FDF4',  w:340, h:440},
  {id:'spinner',    label:'Spinner Wheel', emoji:'🎡', header:'#DDD6FE', text:'#4C1D95', bg:'#F5F3FF',  w:340, h:440},
  {id:'scoreboard', label:'Scoreboard',   emoji:'🏆', header:'#FDE68A', text:'#92400E', bg:'#FFFBEB',  w:340, h:440},
  {id:'breathing',  label:'Breathing',    emoji:'🌬️', header:'#BFDBFE', text:'#1E3A5F', bg:'#EFF6FF',  w:340, h:440},
  {id:'maths',      label:'Maths',        emoji:'🧮', header:'#BBF7D0', text:'#14532D', bg:'#F0FDF4',  w:340, h:440},
  {id:'morning',    label:'Morning Meet', emoji:'☀️', header:'#EDE9FE', text:'#4C1D95', bg:'#F5F3FF',  w:340, h:440},
  {id:'music',      label:'Music Player', emoji:'🎵', header:'#DDD6FE', text:'#4338CA', bg:'#F5F3FF',  w:340, h:520},
];
const MIN_W=220, MIN_H=160;
let MAX_Z=10;

export default function TeacherToolsPage(){
  const router=useRouter();
  const [user,setUser]=useState(null);
  const [students,setStudents]=useState([]);
  const [windows,setWindows]=useState([]);
  const drag=useRef({active:false,id:null,startX:0,startY:0,winX:0,winY:0});
  const resize=useRef({active:false,id:null,dir:'se',startX:0,startY:0,startW:0,startH:0});
  const userRef=useRef(null);
  const layoutLoaded=useRef(false);
  const [isFullscreen,setIsFullscreen]=useState(false);

  useEffect(()=>{
    const unsub=onAuthStateChanged(auth,async u=>{
      if(!u){router.push('/login');return;}
      setUser(u);
      userRef.current=u;
      try{
        const saved=localStorage.getItem('toolkit_layout_'+u.uid);
        if(saved){
          const parsed=JSON.parse(saved);
          const valid=parsed.filter(w=>TOOLS.some(t=>t.id===w.toolId));
          if(valid.length>0){MAX_Z=Math.max(MAX_Z,...valid.map(w=>w.zIndex||10));setWindows(valid);}
        }
        layoutLoaded.current=true;
      }catch(e){layoutLoaded.current=true;}
      try{
        const snap=await getDoc(doc(firestore,'users',u.uid));
        const data=snap.data()||{};
        const classes=data.classes||[];
        if(classes.length>0){
          const names=[];
          (classes[0].students||[]).forEach(s=>{
            if(typeof s==='string') names.push(s);
            else if(s.firstName||s.lastName) names.push([s.firstName,s.lastName].filter(Boolean).join(' '));
            else if(s.name) names.push(s.name);
            else if(s.displayName) names.push(s.displayName);
          });
          setStudents(names.filter(n=>typeof n==='string'&&n.trim()));
        }
      }catch(e){}
    });
    return unsub;
  },[]);

  useEffect(()=>{
    const onMove=e=>{
      if(drag.current.active){
        const dx=e.clientX-drag.current.startX;
        const dy=e.clientY-drag.current.startY;
        setWindows(ws=>ws.map(w=>w.id===drag.current.id?{...w,x:Math.max(0,drag.current.winX+dx),y:Math.max(0,drag.current.winY+dy)}:w));
      }
      if(resize.current.active){
        const dx=e.clientX-resize.current.startX;
        const dy=e.clientY-resize.current.startY;
        const d=resize.current.dir;
        setWindows(ws=>ws.map(w=>{
          if(w.id!==resize.current.id)return w;
          let nw=w.w,nh=w.h;
          if(d==='se'||d==='e')nw=Math.max(MIN_W,resize.current.startW+dx);
          if(d==='se'||d==='s')nh=Math.max(MIN_H,resize.current.startH+dy);
          return{...w,w:nw,h:nh};
        }));
      }
    };
    const onUp=()=>{drag.current.active=false;resize.current.active=false;};
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onUp);
    return()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};
  },[]);

  useEffect(()=>{
    if(!layoutLoaded.current||!userRef.current)return;
    try{localStorage.setItem('toolkit_layout_'+userRef.current.uid,JSON.stringify(windows));}catch(e){}
  },[windows]);

  useEffect(()=>{
    const onFSChange=()=>setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange',onFSChange);
    return()=>document.removeEventListener('fullscreenchange',onFSChange);
  },[]);

  const toggleFullscreen=()=>{
    if(!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
  };

  const focusWindow=id=>{MAX_Z++;setWindows(ws=>ws.map(w=>w.id===id?{...w,zIndex:MAX_Z}:w));};
  const startDrag=(e,id)=>{e.preventDefault();const w=windows.find(x=>x.id===id);if(!w)return;drag.current={active:true,id,startX:e.clientX,startY:e.clientY,winX:w.x,winY:w.y};focusWindow(id);};
  const startResize=(e,id,dir)=>{e.preventDefault();e.stopPropagation();const w=windows.find(x=>x.id===id);if(!w)return;resize.current={active:true,id,dir,startX:e.clientX,startY:e.clientY,startW:w.w,startH:w.h};focusWindow(id);};
  const closeWindow=id=>setWindows(ws=>ws.filter(w=>w.id!==id));
  const toggleMin=id=>setWindows(ws=>ws.map(w=>w.id===id?{...w,minimized:!w.minimized}:w));
  const toggleMax=id=>setWindows(ws=>ws.map(w=>{
    if(w.id!==id)return w;
    if(w.maximized)return{...w,maximized:false,x:w.savedX,y:w.savedY,w:w.savedW,h:w.savedH};
    return{...w,maximized:true,savedX:w.x,savedY:w.y,savedW:w.w,savedH:w.h};
  }));
  const openTool=toolId=>{
    const existing=windows.find(w=>w.toolId===toolId);
    if(existing){
      if(!existing.minimized){closeWindow(existing.id);return;}
      setWindows(ws=>ws.map(w=>w.id===existing.id?{...w,minimized:false,zIndex:++MAX_Z}:w));
      return;
    }
    const tool=TOOLS.find(t=>t.id===toolId);if(!tool)return;
    const offsetBase=windows.length;
    MAX_Z++;
    setWindows(ws=>[...ws,{id:Date.now()+'_'+toolId,toolId,x:60+offsetBase*24,y:60+offsetBase*20,w:tool.w,h:tool.h,zIndex:MAX_Z,minimized:false,maximized:false,savedX:0,savedY:0,savedW:tool.w,savedH:tool.h}]);
  };

  return(
    <>
      <Head><title>Teacher Toolkit</title></Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes winPop{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes diceWobble{0%{transform:rotate(0deg) scale(1)}25%{transform:rotate(-8deg) scale(1.06)}50%{transform:rotate(8deg) scale(0.96)}75%{transform:rotate(-4deg) scale(1.03)}100%{transform:rotate(0deg) scale(1)}}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#D1D5DB;border-radius:4px}
      `}</style>
      <div style={{display:'flex',flexDirection:'column',height:'100dvh',background:'#F8FAFC',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',height:52,background:'white',borderBottom:'2px solid #F1F5F9',flexShrink:0,zIndex:9999}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:22}}>🛠️</span>
            <span style={{fontWeight:900,fontSize:17,color:'#1F2937',letterSpacing:-0.5}}>Teacher Toolkit</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            {windows.length>0&&<button onClick={()=>{setWindows([]);try{if(userRef.current)localStorage.removeItem('toolkit_layout_'+userRef.current.uid);}catch(e){};}} style={{background:'#FEE2E2',border:'1.5px solid #FECACA',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,cursor:'pointer',color:'#991B1B'}}>Close All</button>}
            <button onClick={toggleFullscreen} title={isFullscreen?'Exit fullscreen':'Enter fullscreen'} style={{background:'#F1F5F9',border:'1.5px solid #E2E8F0',borderRadius:8,padding:'5px 12px',fontSize:14,fontWeight:700,cursor:'pointer',color:'#64748B'}}>{isFullscreen?'⊡':'⛶'}</button>
            <button onClick={()=>router.back()} style={{background:'#F1F5F9',border:'1.5px solid #E2E8F0',borderRadius:8,padding:'5px 12px',fontSize:12,fontWeight:700,cursor:'pointer',color:'#64748B'}}>← Back</button>
          </div>
        </div>
        <div style={{flex:1,position:'relative',overflow:'hidden'}}>
          {windows.length===0&&(
            <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,pointerEvents:'none'}}>
              <div style={{fontSize:52}}>🛠️</div>
              <div style={{fontSize:18,fontWeight:800,color:'#CBD5E1'}}>Open a tool from the dock below</div>
              <div style={{fontSize:13,color:'#E2E8F0',fontWeight:500}}>Multiple tools can be open at once</div>
            </div>
          )}
          {windows.map(win=>{
            const tool=TOOLS.find(t=>t.id===win.toolId);
            if(!tool)return null;
            return(
              <ToolWindow
                key={win.id}
                win={win}
                tool={tool}
                students={students}
                onClose={()=>closeWindow(win.id)}
                onFocus={()=>focusWindow(win.id)}
                onStartDrag={startDrag}
                onStartResize={startResize}
                onToggleMax={()=>toggleMax(win.id)}
                onToggleMin={()=>toggleMin(win.id)}
              />
            );
          })}
        </div>
        <div style={{flexShrink:0,background:'white',borderTop:'2px solid #F1F5F9',padding:'8px 12px',display:'flex',justifyContent:'center',zIndex:9999}}>
          <div style={{display:'flex',gap:2,flexWrap:'wrap',justifyContent:'center',maxWidth:'100%'}}>
            {TOOLS.map(tool=>{
              const win=windows.find(w=>w.toolId===tool.id);
              return <DockIcon key={tool.id} tool={tool} isOpen={!!win} isMinimized={win?.minimized||false} onClick={()=>openTool(tool.id)}/>;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
