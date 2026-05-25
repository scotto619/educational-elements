// pages/teacher-tools.js — Classroom Screen
// A full-screen, multi-tool workspace inspired by classroomscreen.com
// Tools open as floating, draggable, pastel-coloured windows

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Tool Components
import NamePicker from '../components/tools/NamePicker';
import TimerTools from '../components/tools/TimerTools';
import DiceRoller from '../components/tools/DiceRoller';
import GroupMaker from '../components/tools/GroupMaker';
import VisualChecklist from '../components/tools/VisualChecklist';
import BrainBreaks from '../components/tools/BrainBreaks';
import StudentHelpQueue from '../components/tools/StudentHelpQueue';
import ClassroomJobs from '../components/tools/ClassroomJobs';
import ReportCommentGenerator from '../components/tools/ReportCommentGenerator';

// ─── Tool Registry ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'timer',       label: 'Timer',           emoji: '⏰', pastel: '#FFF0E6', header: 'linear-gradient(135deg,#FF9A6C,#FF7043)', defaultW: 420, defaultH: 540 },
  { id: 'name-picker', label: 'Name Picker',      emoji: '🎯', pastel: '#F0EAFF', header: 'linear-gradient(135deg,#A78BFA,#7C3AED)', defaultW: 460, defaultH: 520 },
  { id: 'dice',        label: 'Dice Roller',      emoji: '🎲', pastel: '#E6F4FF', header: 'linear-gradient(135deg,#60A5FA,#2563EB)', defaultW: 520, defaultH: 520 },
  { id: 'groups',      label: 'Group Maker',      emoji: '👥', pastel: '#E6FFF5', header: 'linear-gradient(135deg,#34D399,#059669)', defaultW: 560, defaultH: 600 },
  { id: 'checklist',   label: 'Checklist',        emoji: '✅', pastel: '#FFFDE6', header: 'linear-gradient(135deg,#FCD34D,#D97706)', defaultW: 460, defaultH: 540 },
  { id: 'brain-break', label: 'Brain Break',      emoji: '🧠', pastel: '#FFF0F5', header: 'linear-gradient(135deg,#F472B6,#DB2777)', defaultW: 460, defaultH: 520 },
  { id: 'help-queue',  label: 'Help Queue',       emoji: '🙋', pastel: '#EEF2FF', header: 'linear-gradient(135deg,#818CF8,#4F46E5)', defaultW: 500, defaultH: 540 },
  { id: 'jobs',        label: 'Class Jobs',       emoji: '💼', pastel: '#E6FFFE', header: 'linear-gradient(135deg,#22D3EE,#0891B2)', defaultW: 560, defaultH: 600 },
  { id: 'reports',     label: 'Report Comments',  emoji: '📝', pastel: '#FFF1F0', header: 'linear-gradient(135deg,#FB923C,#DC2626)', defaultW: 620, defaultH: 600 },
  { id: 'clock',       label: 'Clock',            emoji: '🕐', pastel: '#F5F0FF', header: 'linear-gradient(135deg,#C084FC,#9333EA)', defaultW: 300, defaultH: 220 },
  { id: 'random-num',  label: 'Random Number',    emoji: '🔢', pastel: '#F0FFF4', header: 'linear-gradient(135deg,#6EE7B7,#059669)', defaultW: 340, defaultH: 280 },
  { id: 'noise',       label: 'Noise Level',      emoji: '🔊', pastel: '#FFFBEB', header: 'linear-gradient(135deg,#FDE68A,#F59E0B)', defaultW: 340, defaultH: 300 },
];

// ─── Inline: Clock ──────────────────────────────────────────────────────────
function ClockTool() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');
  const day = time.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 6, padding: '12px 0' }}>
      <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-2px', color: '#5B21B6', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
        {h}<span style={{ opacity: 0.35 }}>:</span>{m}
        <span style={{ fontSize: 28, color: '#8B5CF6', verticalAlign: 'middle', marginLeft: 4 }}>.{s}</span>
      </div>
      <div style={{ fontSize: 13, color: '#7C3AED', fontWeight: 700, letterSpacing: '-0.2px' }}>{day}</div>
    </div>
  );
}

// ─── Inline: Random Number ───────────────────────────────────────────────────
function RandomNumberTool() {
  const [min, setMin] = React.useState(1);
  const [max, setMax] = React.useState(100);
  const [result, setResult] = React.useState(null);
  const [rolling, setRolling] = React.useState(false);
  const roll = () => {
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * (Number(max) - Number(min) + 1)) + Number(min));
      count++;
      if (count > 18) { clearInterval(interval); setRolling(false); }
    }, 55);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '12px 20px' }}>
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        {[['MIN', min, setMin], ['MAX', max, setMax]].map(([lbl, val, setter]) => (
          <div key={lbl} style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#065F46', marginBottom: 4, letterSpacing: '0.5px' }}>{lbl}</div>
            <input type="number" value={val} onChange={e => setter(e.target.value)}
              style={{ width: '100%', border: '2px solid #A7F3D0', borderRadius: 10, padding: '8px', fontSize: 16, fontWeight: 800, color: '#065F46', background: '#F0FDF4', textAlign: 'center', outline: 'none' }} />
          </div>
        ))}
      </div>
      <div style={{ fontSize: result ? 68 : 44, fontWeight: 900, color: rolling ? '#6EE7B7' : result ? '#059669' : '#D1FAE5', minHeight: 80, display: 'flex', alignItems: 'center', fontVariantNumeric: 'tabular-nums', transition: 'color 0.1s' }}>
        {result ?? '—'}
      </div>
      <button onClick={roll} disabled={rolling} style={{ background: 'linear-gradient(135deg,#6EE7B7,#059669)', color: 'white', border: 'none', borderRadius: 14, padding: '11px 28px', fontSize: 15, fontWeight: 800, cursor: rolling ? 'not-allowed' : 'pointer', opacity: rolling ? 0.75 : 1, boxShadow: '0 4px 16px rgba(5,150,105,0.3)', transition: 'all 0.2s' }}>
        {rolling ? '…' : '🎲 Roll'}
      </button>
    </div>
  );
}

// ─── Inline: Noise Level ─────────────────────────────────────────────────────
function NoiseTool() {
  const [level, setLevel] = React.useState(0);
  const levels = [
    { label: 'Silent',   emoji: '🤫', color: '#059669', bg: '#ECFDF5', bar: '#6EE7B7' },
    { label: 'Whisper',  emoji: '🤫', color: '#16A34A', bg: '#DCFCE7', bar: '#86EFAC' },
    { label: 'Quiet',    emoji: '🔉', color: '#D97706', bg: '#FFFDE7', bar: '#FCD34D' },
    { label: 'Normal',   emoji: '🔊', color: '#EA580C', bg: '#FFF7ED', bar: '#FB923C' },
    { label: 'Loud',     emoji: '📢', color: '#DC2626', bg: '#FFF1F2', bar: '#F87171' },
    { label: 'Too Loud!',emoji: '🚨', color: '#991B1B', bg: '#FFF0F0', bar: '#EF4444' },
  ];
  const curr = levels[level];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: curr.color, background: curr.bg, borderRadius: 18, padding: '10px 24px', width: '100%', textAlign: 'center', transition: 'all 0.3s', border: `2px solid ${curr.bar}` }}>
        <div>{curr.emoji} {curr.label}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
        {levels.map((l, i) => (
          <button key={i} onClick={() => setLevel(i)} title={l.label} style={{ flex: 1, height: 32, borderRadius: 8, background: level === i ? l.bar : '#F3F4F6', border: level === i ? `2px solid ${l.color}` : '2px solid #E5E7EB', cursor: 'pointer', transition: 'all 0.2s', fontSize: 14 }}>
            {l.emoji}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setLevel(l => Math.max(0, l - 1))} style={{ background: '#F3F4F6', border: '2px solid #E5E7EB', borderRadius: 10, padding: '7px 18px', fontSize: 17, cursor: 'pointer', fontWeight: 900, color: '#374151' }}>−</button>
        <button onClick={() => setLevel(l => Math.min(5, l + 1))} style={{ background: '#F3F4F6', border: '2px solid #E5E7EB', borderRadius: 10, padding: '7px 18px', fontSize: 17, cursor: 'pointer', fontWeight: 900, color: '#374151' }}>+</button>
      </div>
    </div>
  );
}

// ─── Tool Window ─────────────────────────────────────────────────────────────
function ToolWindow({ win, tool, onClose, onMinimize, onDragStart, onFocus, children }) {
  return (
    <div
      onClick={() => onFocus(win.id)}
      style={{
        position: 'absolute', left: win.x, top: win.y, width: win.w,
        height: win.minimized ? 52 : win.h, zIndex: win.zIndex,
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 12px 48px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.7)',
        display: 'flex', flexDirection: 'column',
        background: tool.pastel,
        transition: 'height 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        minWidth: 260,
        animation: 'winPop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Header */}
      <div onMouseDown={e => onDragStart(e, win.id)} style={{ background: tool.header, padding: '0 14px', height: 52, display: 'flex', alignItems: 'center', gap: 10, cursor: 'grab', flexShrink: 0, userSelect: 'none' }}>
        <span style={{ fontSize: 22 }}>{tool.emoji}</span>
        <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: 'white', letterSpacing: '-0.3px', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>{tool.label}</span>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onMinimize(win.id); }} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }} title={win.minimized ? 'Expand' : 'Minimise'}>
          {win.minimized ? '▲' : '▼'}
        </button>
        <button onMouseDown={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); onClose(win.id); }} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.22)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 18, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }} title="Close">
          ×
        </button>
      </div>
      {/* Content */}
      {!win.minimized && (
        <div style={{ flex: 1, overflowY: 'auto', background: tool.pastel }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Dock Icon ────────────────────────────────────────────────────────────────
function DockIcon({ tool, isOpen, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {hovered && (
        <div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(10,10,20,0.85)', color: 'white', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.25)', letterSpacing: '0.3px' }}>
          {tool.label}
        </div>
      )}
      <button onClick={() => onClick(tool.id)} style={{
        width: 52, height: 52, borderRadius: 15,
        background: isOpen ? tool.header : hovered ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.72)',
        border: isOpen ? '2px solid rgba(255,255,255,0.45)' : '2px solid rgba(255,255,255,0.35)',
        cursor: 'pointer', fontSize: 24,
        transform: hovered ? 'translateY(-7px) scale(1.14)' : isOpen ? 'translateY(-4px) scale(1.05)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? '0 10px 28px rgba(0,0,0,0.18)' : isOpen ? '0 4px 16px rgba(0,0,0,0.14)' : '0 2px 6px rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {tool.emoji}
      </button>
      {isOpen && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'white', boxShadow: '0 0 8px rgba(255,255,255,0.9)' }} />}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 64, right: 20, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 99999, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: 'rgba(15,15,30,0.88)', color: 'white', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.25)', animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', backdropFilter: 'blur(12px)' }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Background ───────────────────────────────────────────────────────────────
function Background() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'rgba(167,139,250,0.10)', top: -250, left: -150, filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(96,165,250,0.09)', top: -100, right: -50, filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'rgba(251,191,36,0.06)', bottom: -300, left: '25%', filter: 'blur(110px)' }} />
      <div style={{ position: 'absolute', width: 450, height: 450, borderRadius: '50%', background: 'rgba(244,114,182,0.08)', bottom: 0, right: -80, filter: 'blur(75px)' }} />
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TeacherTools() {
  const router = useRouter();

  // Auth & data
  const [user, setUser]         = useState(null);
  const [userData, setUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [classId, setClassId]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [classData, setClassData] = useState({});

  // Window manager
  const [windows, setWindows] = useState([]);
  const [maxZ, setMaxZ]       = useState(100);

  // Toast
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Drag
  const drag = useRef({ active: false, id: null, startX: 0, startY: 0, winX: 0, winY: 0 });

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg) => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2600);
  }, []);

  // ── Auth & data ───────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);
      try {
        const snap = await getDoc(doc(firestore, 'users', currentUser.uid));
        if (!snap.exists()) { router.push('/login'); return; }
        const data = snap.data() || {};
        setUserData(data);
        const classes = Array.isArray(data.classes) ? data.classes : [];
        if (classes.length > 0) {
          const cls = (data.activeClassId ? classes.find(c => c.id === data.activeClassId) : null) || classes[0];
          if (cls) {
            setClassId(cls.id || cls.classId || 'v1');
            setStudents(Array.isArray(cls.students) ? cls.students : []);
            setClassData(cls.toolkitData || {});
          }
        }
      } catch (e) { console.error('Teacher tools load error:', e); }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // ── Save data ─────────────────────────────────────────────────────────────
  const saveToolkitData = useCallback(async (newData) => {
    if (!user || !userData) return;
    try {
      const classes = Array.isArray(userData.classes) ? [...userData.classes] : [];
      const idx = classId ? classes.findIndex(c => c.id === classId) : 0;
      const target = idx >= 0 ? idx : 0;
      if (classes[target]) {
        classes[target] = { ...classes[target], toolkitData: { ...(classes[target].toolkitData || {}), ...newData } };
        await updateDoc(doc(firestore, 'users', user.uid), { classes });
        setClassData(prev => ({ ...prev, ...newData }));
      }
    } catch (e) { console.error('Save error:', e); }
  }, [user, userData, classId]);

  // ── Drag ──────────────────────────────────────────────────────────────────
  const startDrag = useCallback((e, winId) => {
    e.preventDefault();
    const win = windows.find(w => w.id === winId);
    if (!win) return;
    drag.current = { active: true, id: winId, startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    setMaxZ(z => { const nz = z + 1; setWindows(p => p.map(w => w.id === winId ? { ...w, zIndex: nz } : w)); return nz; });
  }, [windows]);

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      const dy = e.clientY - drag.current.startY;
      setWindows(p => p.map(w => w.id === drag.current.id ? { ...w, x: Math.max(0, drag.current.winX + dx), y: Math.max(0, drag.current.winY + dy) } : w));
    };
    const onUp = () => { drag.current.active = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  // ── Window management ─────────────────────────────────────────────────────
  const openTool = useCallback((toolId) => {
    const existing = windows.find(w => w.toolId === toolId);
    if (existing) {
      setMaxZ(z => { const nz = z + 1; setWindows(p => p.map(w => w.id === existing.id ? { ...w, zIndex: nz, minimized: false } : w)); return nz; });
      return;
    }
    const tool = TOOLS.find(t => t.id === toolId);
    if (!tool) return;
    const nz = maxZ + 1;
    setMaxZ(nz);
    const offset = (windows.length % 9) * 30;
    setWindows(p => [...p, { id: `${toolId}-${Date.now()}`, toolId, x: 70 + offset, y: 65 + offset, w: tool.defaultW, h: tool.defaultH, zIndex: nz, minimized: false }]);
  }, [windows, maxZ]);

  const closeWindow   = useCallback((id) => setWindows(p => p.filter(w => w.id !== id)), []);
  const toggleMin     = useCallback((id) => setWindows(p => p.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)), []);
  const bringToFront  = useCallback((id) => setMaxZ(z => { const nz = z + 1; setWindows(p => p.map(w => w.id === id ? { ...w, zIndex: nz } : w)); return nz; }), []);

  // ── Render tool content ───────────────────────────────────────────────────
  const renderTool = useCallback((toolId) => {
    const p16 = { padding: 16, minHeight: '100%' };
    switch (toolId) {
      case 'timer':       return <div style={p16}><TimerTools showToast={showToast} students={students} /></div>;
      case 'name-picker': return <div style={p16}><NamePicker students={students} showToast={showToast} /></div>;
      case 'dice':        return <div style={p16}><DiceRoller showToast={showToast} /></div>;
      case 'groups':      return <div style={p16}><GroupMaker students={students} showToast={showToast} userData={userData} currentClassId={classId} groupData={classData.groupData} saveGroupDataToFirebase={d => saveToolkitData({ groupData: d })} /></div>;
      case 'checklist':   return <div style={p16}><VisualChecklist students={students} showToast={showToast} saveData={d => saveToolkitData({ checklistData: d })} loadedData={classData.checklistData} /></div>;
      case 'brain-break': return <div style={p16}><BrainBreaks showToast={showToast} /></div>;
      case 'help-queue':  return <div style={p16}><StudentHelpQueue students={students} showToast={showToast} /></div>;
      case 'jobs':        return <div style={p16}><ClassroomJobs students={students} showToast={showToast} saveData={d => saveToolkitData({ jobsData: d })} loadedData={classData.jobsData || {}} /></div>;
      case 'reports':     return <div style={p16}><ReportCommentGenerator students={students} showToast={showToast} /></div>;
      case 'clock':       return <ClockTool />;
      case 'random-num':  return <RandomNumberTool />;
      case 'noise':       return <NoiseTool />;
      default:            return <div style={{ padding: 24, color: '#9CA3AF', textAlign: 'center' }}>🚧 Coming soon…</div>;
    }
  }, [students, showToast, userData, classId, classData, saveToolkitData]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#EEF2FF,#FDF4FF,#FFF7ED)', fontFamily: 'Inter, -apple-system, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, display: 'block', animation: 'spin 1.2s linear infinite', marginBottom: 16 }}>⚙️</div>
          <p style={{ fontWeight: 800, color: '#7C3AED', fontSize: 18 }}>Setting up your classroom…</p>
        </div>
      </div>
    );
  }

  const openIds = new Set(windows.map(w => w.toolId));

  return (
    <>
      <Head>
        <title>Classroom Screen — Educational Elements</title>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { overflow: hidden; height: 100%; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
          @keyframes winPop { from { opacity:0; transform:scale(0.88) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
          ::-webkit-scrollbar { width:5px; height:5px; }
          ::-webkit-scrollbar-track { background:transparent; }
          ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.13); border-radius:8px; }
        `}</style>
      </Head>

      <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(160deg,#EEF2FF 0%,#F5F0FF 28%,#FFF0F5 60%,#FFF9F0 100%)', fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", overflow: 'hidden' }}>
        <Background />

        {/* ── Top bar ── */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 54, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', paddingInline: 20, gap: 14, zIndex: 9998 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(124,58,237,0.1)', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#7C3AED', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            ← Back
          </button>
          <span style={{ fontSize: 22 }}>🖥️</span>
          <span style={{ fontWeight: 900, fontSize: 17, color: '#1E1B4B', letterSpacing: '-0.5px' }}>Classroom Screen</span>
          {students.length > 0 && (
            <div style={{ marginLeft: 'auto', background: 'rgba(124,58,237,0.1)', borderRadius: 10, padding: '4px 12px', fontSize: 13, fontWeight: 700, color: '#7C3AED' }}>
              👥 {students.length} students
            </div>
          )}
          {windows.length > 0 && (
            <button onClick={() => setWindows([])} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: '#DC2626', cursor: 'pointer', marginLeft: students.length === 0 ? 'auto' : 0 }}>
              ✕ Clear All
            </button>
          )}
        </div>

        {/* ── Canvas ── */}
        <div style={{ position: 'absolute', inset: 0, top: 54, bottom: 104 }}>
          {windows.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, pointerEvents: 'none' }}>
              <div style={{ fontSize: 72, opacity: 0.15 }}>🖥️</div>
              <p style={{ fontSize: 21, fontWeight: 900, color: 'rgba(90,60,180,0.3)', letterSpacing: '-0.5px' }}>Click a tool below to get started</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(90,60,180,0.2)' }}>Open multiple tools at once — drag to arrange</p>
            </div>
          )}
          {windows.map(win => {
            const tool = TOOLS.find(t => t.id === win.toolId);
            if (!tool) return null;
            return (
              <ToolWindow key={win.id} win={win} tool={tool} onClose={closeWindow} onMinimize={toggleMin} onDragStart={startDrag} onFocus={bringToFront}>
                {renderTool(win.toolId)}
              </ToolWindow>
            );
          })}
        </div>

        {/* ── Dock ── */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 104, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 14, zIndex: 9997 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(28px)', borderRadius: 24, padding: '10px 18px', border: '1px solid rgba(255,255,255,0.92)', boxShadow: '0 8px 40px rgba(100,80,200,0.13),0 2px 8px rgba(0,0,0,0.06)' }}>
            {TOOLS.map(tool => (
              <DockIcon key={tool.id} tool={tool} isOpen={openIds.has(tool.id)} onClick={openTool} />
            ))}
          </div>
        </div>

        <Toast toasts={toasts} />
      </div>
    </>
  );
}
