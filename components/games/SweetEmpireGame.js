// components/games/SweetEmpireGame.js
// ─────────────────────────────────────────────────────────────────────────────
// SWEET EMPIRE 🍪 — the deep idle/clicker that replaces Hero Forge.
//
// Features: 12 buildings, 70+ upgrades, Sugar Rush click combos, golden
// cookies with random buffs, 40+ achievements (each a permanent boost),
// Recipe Rebirth prestige with a Sugar Star shop, offline production,
// a class leaderboard, and slow-grind profile unlocks (card themes, titles,
// special effects) that appear on the Classroom Champions student cards and
// the student's own dashboard.
//
// Saves to studentData.sweetEmpireData via updateStudentData (Firestore-safe).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fmtNum,
  BUILDINGS, BUILDING_MAP, buildingCost, bulkBuildingCost,
  UPGRADES, UPGRADE_MAP,
  ACHIEVEMENTS, ACHIEVEMENT_MAP,
  starsForRun, STAR_SPS_BONUS, STAR_UPGRADES, STAR_UPGRADE_MAP,
  GOLDEN_MIN_GAP, GOLDEN_MAX_GAP, GOLDEN_LIFETIME, GOLDEN_EFFECTS,
  COMBO_MAX, COMBO_MAX_BONUS, COMBO_DECAY_PER_SEC,
  SE_THEMES, SE_THEME_STYLES, SE_TITLES, SE_EFFECTS, meetsUnlockReq,
  OFFLINE_BASE_HOURS, OFFLINE_RATE,
  defaultSave,
} from './SweetEmpire/sweetEmpireConfig';

const now = () => Date.now();

// Firestore-safe clean of the save object (no undefined values, ever)
const cleanSave = (gs) => ({
  sweets: Number(gs.sweets) || 0,
  runSweets: Number(gs.runSweets) || 0,
  lifetimeSweets: Number(gs.lifetimeSweets) || 0,
  clicks: Number(gs.clicks) || 0,
  goldenClicks: Number(gs.goldenClicks) || 0,
  buildings: Object.fromEntries(Object.entries(gs.buildings || {}).map(([k, v]) => [k, Number(v) || 0])),
  upgrades: [...(gs.upgrades || [])],
  achievements: [...(gs.achievements || [])],
  sugarStars: Number(gs.sugarStars) || 0,
  starUpgrades: [...(gs.starUpgrades || [])],
  rebirths: Number(gs.rebirths) || 0,
  unlockedThemes: [...(gs.unlockedThemes || [])],
  unlockedTitles: [...(gs.unlockedTitles || [])],
  unlockedEffects: [...(gs.unlockedEffects || [])],
  activeTheme: gs.activeTheme || null,
  activeTitle: gs.activeTitle || null,
  activeEffect: gs.activeEffect || null,
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

// ─── Pure calculators ─────────────────────────────────────────────────────────
const calcBuildingMult = (gs, buildingId) => {
  let mult = 1;
  (gs.upgrades || []).forEach((id) => {
    const u = UPGRADE_MAP[id];
    if (u && u.type === 'building' && u.target === buildingId) mult *= u.mult;
  });
  return mult;
};

const calcGlobalMult = (gs) => {
  let mult = 1;
  (gs.upgrades || []).forEach((id) => {
    const u = UPGRADE_MAP[id];
    if (u && u.type === 'global') mult *= u.mult;
  });
  mult *= 1 + (gs.achievements || []).length * 0.01;          // +1% per achievement
  mult *= 1 + (gs.sugarStars || 0) * STAR_SPS_BONUS;          // +2% per sugar star
  if ((gs.starUpgrades || []).includes('su_prod')) mult *= 2;
  if ((gs.starUpgrades || []).includes('su_prod2')) mult *= 3;
  return mult;
};

const calcSps = (gs, buffs = {}) => {
  let sps = 0;
  BUILDINGS.forEach((b) => {
    const owned = gs.buildings?.[b.id] || 0;
    if (owned > 0) sps += owned * b.sps * calcBuildingMult(gs, b.id);
  });
  sps *= calcGlobalMult(gs);
  if (buffs.frenzyUntil && buffs.frenzyUntil > now()) sps *= 7;
  return sps;
};

const calcClickPower = (gs, buffs = {}, combo = 0) => {
  let power = 1;
  let spsPct = 0;
  (gs.upgrades || []).forEach((id) => {
    const u = UPGRADE_MAP[id];
    if (!u) return;
    if (u.type === 'click') power *= u.mult;
    if (u.type === 'clickSps') spsPct += u.value;
  });
  if ((gs.starUpgrades || []).includes('su_click')) power *= 5;
  power *= calcGlobalMult(gs);
  power *= 1 + (Math.min(combo, COMBO_MAX) / COMBO_MAX) * COMBO_MAX_BONUS;
  if (buffs.clickFrenzyUntil && buffs.clickFrenzyUntil > now()) power *= 20;
  if (spsPct > 0) power += calcSps(gs, buffs) * spsPct;
  return power;
};

const goldenGapMs = (gs) => {
  let freq = 1;
  (gs.upgrades || []).forEach((id) => {
    const u = UPGRADE_MAP[id];
    if (u && u.type === 'goldenFreq') freq += u.value;
  });
  if ((gs.starUpgrades || []).includes('su_gold')) freq *= 2;
  const min = (GOLDEN_MIN_GAP / freq) * 1000;
  const max = (GOLDEN_MAX_GAP / freq) * 1000;
  return min + Math.random() * (max - min);
};

const goldenDurationMult = (gs) =>
  (gs.upgrades || []).some((id) => UPGRADE_MAP[id]?.type === 'goldenDur') ? 1.5 : 1;

const offlineHours = (gs) => {
  if ((gs.starUpgrades || []).includes('su_off2')) return 24;
  if ((gs.starUpgrades || []).includes('su_off1')) return 8;
  return OFFLINE_BASE_HOURS;
};

const pickGoldenEffect = () => {
  const total = GOLDEN_EFFECTS.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const e of GOLDEN_EFFECTS) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return GOLDEN_EFFECTS[0];
};

const TABS = [
  { id: 'bakery', name: 'Bakery', icon: '🍪' },
  { id: 'upgrades', name: 'Upgrades', icon: '⬆️' },
  { id: 'rebirth', name: 'Rebirth', icon: '⭐' },
  { id: 'style', name: 'Style', icon: '🎨' },
  { id: 'awards', name: 'Awards', icon: '🏅' },
  { id: 'stats', name: 'Stats', icon: '📊' },
  { id: 'class', name: 'Class', icon: '👥' },
];

// ═════════════════════════════════════════════════════════════════════════════
const SweetEmpireGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [] }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('bakery');
  const [buyAmount, setBuyAmount] = useState(1);
  const [combo, setCombo] = useState(0);
  const [buffs, setBuffs] = useState({});          // { frenzyUntil, clickFrenzyUntil }
  const [golden, setGolden] = useState(null);      // { x, y, expiresAt }
  const [floaties, setFloaties] = useState([]);    // floating click numbers
  const [offlineReport, setOfflineReport] = useState(null);
  const [rebirthConfirm, setRebirthConfirm] = useState(false);
  const [cookiePop, setCookiePop] = useState(false);

  const gsRef = useRef(gs); gsRef.current = gs;
  const buffsRef = useRef(buffs); buffsRef.current = buffs;
  const comboRef = useRef(combo); comboRef.current = combo;
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const goldenTimer = useRef(null);
  const floatId = useRef(0);

  const sps = useMemo(() => calcSps(gs, buffs), [gs, buffs]);
  const clickPower = useMemo(() => calcClickPower(gs, buffs, combo), [gs, buffs, combo]);
  const pendingStars = starsForRun(gs.runSweets);

  // ── Load save + offline earnings ────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const raw = studentData?.sweetEmpireData;
    let save = { ...defaultSave(), ...(raw || {}) };
    save.buildings = { ...(raw?.buildings || {}) };

    if (raw?.lastSeen) {
      const away = (now() - new Date(raw.lastSeen).getTime()) / 1000;
      const capped = Math.min(away, offlineHours(save) * 3600);
      if (capped > 120) {
        const baseSps = calcSps(save, {});
        const earned = baseSps * capped * OFFLINE_RATE;
        if (earned > 0) {
          save = {
            ...save,
            sweets: save.sweets + earned,
            runSweets: save.runSweets + earned,
            lifetimeSweets: save.lifetimeSweets + earned,
          };
          setOfflineReport({ earned, seconds: capped });
        }
      }
    }
    setGs(save);
    setLoaded(true);
    dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Production tick (10×/sec) + combo decay ─────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      const cur = gsRef.current;
      const gain = calcSps(cur, buffsRef.current) / 10;
      if (gain > 0) {
        setGs((p) => ({
          ...p,
          sweets: p.sweets + gain,
          runSweets: p.runSweets + gain,
          lifetimeSweets: p.lifetimeSweets + gain,
        }));
      }
      if (comboRef.current > 0) {
        const slow = (cur.starUpgrades || []).includes('su_combo') ? 3 : 1;
        setCombo((c) => Math.max(0, c - COMBO_DECAY_PER_SEC / 10 / slow));
      }
    }, 100);
    return () => clearInterval(t);
  }, [loaded]);

  // ── Achievement + profile-unlock sweep (every 2s) ───────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      const cur = gsRef.current;
      const newAch = ACHIEVEMENTS.filter((a) => !cur.achievements.includes(a.id) && a.check(cur)).map((a) => a.id);
      const newThemes = SE_THEMES.filter((x) => !cur.unlockedThemes.includes(x.id) && meetsUnlockReq(x.req, cur)).map((x) => x.id);
      const newTitles = SE_TITLES.filter((x) => !cur.unlockedTitles.includes(x.id) && meetsUnlockReq(x.req, cur)).map((x) => x.id);
      const newEffects = SE_EFFECTS.filter((x) => !cur.unlockedEffects.includes(x.id) && meetsUnlockReq(x.req, cur)).map((x) => x.id);
      if (newAch.length + newThemes.length + newTitles.length + newEffects.length === 0) return;

      newAch.forEach((id) => showToast(`🏅 Achievement: ${ACHIEVEMENT_MAP[id].name}! (+1% production forever)`, 'success'));
      newThemes.forEach((id) => showToast(`🎨 Profile theme unlocked: ${SE_THEMES.find((t2) => t2.id === id).name}! Equip it in the Style tab.`, 'success'));
      newTitles.forEach((id) => showToast(`📛 Title unlocked: ${SE_TITLES.find((t2) => t2.id === id).name}!`, 'success'));
      newEffects.forEach((id) => showToast(`✨ Special effect unlocked: ${SE_EFFECTS.find((e) => e.id === id).name}!`, 'success'));

      setGs((p) => ({
        ...p,
        achievements: [...p.achievements, ...newAch],
        unlockedThemes: [...p.unlockedThemes, ...newThemes],
        unlockedTitles: [...p.unlockedTitles, ...newTitles],
        unlockedEffects: [...p.unlockedEffects, ...newEffects],
      }));
      dirtyRef.current = true;
    }, 2000);
    return () => clearInterval(t);
  }, [loaded, showToast]);

  // ── Autosave (every 25s when dirty, and on unmount) ─────────────────────────
  const persist = useCallback(async () => {
    if (savingRef.current || !updateStudentData) return;
    savingRef.current = true;
    try {
      await updateStudentData({ sweetEmpireData: cleanSave(gsRef.current) });
      dirtyRef.current = false;
    } catch (err) {
      console.error('SweetEmpire: save failed', err);
    } finally {
      savingRef.current = false;
    }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 25000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  // ── Golden cookie scheduler ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    const schedule = () => {
      if (cancelled) return;
      goldenTimer.current = setTimeout(() => {
        if (cancelled) return;
        setGolden({
          x: 8 + Math.random() * 76,   // % across the play area
          y: 12 + Math.random() * 60,
          expiresAt: now() + GOLDEN_LIFETIME * 1000,
        });
        goldenTimer.current = setTimeout(() => { if (!cancelled) { setGolden(null); schedule(); } }, GOLDEN_LIFETIME * 1000);
      }, goldenGapMs(gsRef.current));
    };
    schedule();
    return () => { cancelled = true; clearTimeout(goldenTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const clickGolden = () => {
    if (!golden) return;
    setGolden(null);
    clearTimeout(goldenTimer.current);
    goldenTimer.current = setTimeout(() => {
      setGolden({ x: 8 + Math.random() * 76, y: 12 + Math.random() * 60, expiresAt: now() + GOLDEN_LIFETIME * 1000 });
    }, goldenGapMs(gsRef.current));

    const effect = pickGoldenEffect();
    const durMult = goldenDurationMult(gsRef.current);
    const cur = gsRef.current;
    const baseSps = calcSps(cur, {});

    if (effect.id === 'frenzy') {
      setBuffs((b) => ({ ...b, frenzyUntil: now() + effect.duration * durMult * 1000 }));
    } else if (effect.id === 'clickfrenzy') {
      setBuffs((b) => ({ ...b, clickFrenzyUntil: now() + effect.duration * durMult * 1000 }));
    } else if (effect.id === 'lucky') {
      const gain = Math.max(cur.sweets * 0.1, baseSps * 900) + 13;
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`💰 Sweet Windfall! +${fmtNum(gain)} sweets!`, 'success');
    } else if (effect.id === 'rush') {
      setCombo(COMBO_MAX);
      showToast('🌀 Sugar Rush maxed out!', 'success');
    } else if (effect.id === 'jackpot') {
      const gain = baseSps * 3600 + 777;
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`🎰 JACKPOT! +${fmtNum(gain)} sweets!`, 'success');
    }
    if (effect.duration > 0) showToast(`${effect.icon} ${effect.name} ${effect.desc}`, 'success');

    setGs((p) => ({ ...p, goldenClicks: p.goldenClicks + 1 }));
    dirtyRef.current = true;
  };

  // ── The Big Cookie ──────────────────────────────────────────────────────────
  const clickCookie = (e) => {
    const power = calcClickPower(gsRef.current, buffsRef.current, comboRef.current);
    setGs((p) => ({
      ...p,
      sweets: p.sweets + power,
      runSweets: p.runSweets + power,
      lifetimeSweets: p.lifetimeSweets + power,
      clicks: p.clicks + 1,
    }));
    setCombo((c) => Math.min(COMBO_MAX, c + 1));
    setCookiePop(true);
    setTimeout(() => setCookiePop(false), 90);
    dirtyRef.current = true;

    // floating number
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = floatId.current++;
    setFloaties((f) => [...f.slice(-14), { id, x, y, text: `+${fmtNum(power)}` }]);
    setTimeout(() => setFloaties((f) => f.filter((fl) => fl.id !== id)), 900);
  };

  // ── Purchases ───────────────────────────────────────────────────────────────
  const buyBuilding = (b) => {
    const owned = gs.buildings[b.id] || 0;
    const cost = bulkBuildingCost(b, owned, buyAmount);
    if (gs.sweets < cost) return;
    setGs((p) => ({
      ...p,
      sweets: p.sweets - cost,
      buildings: { ...p.buildings, [b.id]: (p.buildings[b.id] || 0) + buyAmount },
    }));
    dirtyRef.current = true;
  };

  const buyUpgrade = (u) => {
    if (gs.sweets < u.cost || gs.upgrades.includes(u.id)) return;
    setGs((p) => ({ ...p, sweets: p.sweets - u.cost, upgrades: [...p.upgrades, u.id] }));
    showToast(`${u.icon} ${u.name} purchased!`, 'success');
    dirtyRef.current = true;
  };

  const buyStarUpgrade = (u) => {
    if (gs.sugarStars < u.cost || gs.starUpgrades.includes(u.id)) return;
    setGs((p) => ({ ...p, sugarStars: p.sugarStars - u.cost, starUpgrades: [...p.starUpgrades, u.id] }));
    showToast(`${u.icon} ${u.name} — yours forever!`, 'success');
    dirtyRef.current = true;
  };

  // ── Rebirth ─────────────────────────────────────────────────────────────────
  const doRebirth = async () => {
    const stars = starsForRun(gsRef.current.runSweets);
    if (stars < 1) return;
    const cur = gsRef.current;
    const keepClicks = (cur.starUpgrades || []).includes('su_keep');
    const keptUpgrades = keepClicks
      ? cur.upgrades.filter((id) => ['click', 'clickSps'].includes(UPGRADE_MAP[id]?.type))
      : [];
    const startBuildings = (cur.starUpgrades || []).includes('su_head') ? { whisk: 5, oven: 1 } : {};

    const next = {
      ...cur,
      sweets: 0,
      runSweets: 0,
      clicks: cur.clicks,       // lifetime stat
      buildings: startBuildings,
      upgrades: keptUpgrades,
      sugarStars: cur.sugarStars + stars,
      rebirths: cur.rebirths + 1,
    };
    setGs(next);
    setBuffs({});
    setCombo(0);
    setRebirthConfirm(false);
    setTab('bakery');
    showToast(`⭐ Recipe Rebirth! +${stars} Sugar Star${stars !== 1 ? 's' : ''} (${next.sugarStars} total, +${Math.round(next.sugarStars * STAR_SPS_BONUS * 100)}% production)`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 500);
  };

  // ── Style equipping ─────────────────────────────────────────────────────────
  const equip = (kind, id) => {
    setGs((p) => ({ ...p, [kind]: p[kind] === id ? (kind === 'activeTitle' ? 'kitchenhand' : null) : id }));
    dirtyRef.current = true;
    setTimeout(persist, 400);
    showToast('Profile style updated — check your dashboard and class card!', 'success');
  };

  // ── Derived UI bits ─────────────────────────────────────────────────────────
  const frenzyOn = buffs.frenzyUntil > now();
  const clickFrenzyOn = buffs.clickFrenzyUntil > now();
  const availableUpgrades = UPGRADES.filter((u) => !gs.upgrades.includes(u.id) && u.unlock(gs)).sort((a, b) => a.cost - b.cost);
  const comboPct = Math.round((Math.min(combo, COMBO_MAX) / COMBO_MAX) * 100);
  const activeThemeStyle = gs.activeTheme ? SE_THEME_STYLES[gs.activeTheme] : null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <style>{`
        @keyframes se-float { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-60px); } }
        @keyframes se-golden { 0%,100% { transform: scale(1) rotate(-6deg); } 50% { transform: scale(1.15) rotate(6deg); } }
        @keyframes se-wobble { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
      `}</style>

      {/* Header */}
      <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r ${activeThemeStyle ? activeThemeStyle.grad : 'from-amber-500 via-orange-500 to-rose-500'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🍪 Sweet Empire</h1>
            <p className="text-white/85 text-sm">Bake sweets. Build an empire. Unlock legendary profile style.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold drop-shadow">{fmtNum(gs.sweets)} 🍬</p>
            <p className="text-white/85 text-sm font-semibold">
              {fmtNum(sps)}/sec {frenzyOn && <span className="text-yellow-200 font-bold">🔥 FRENZY ×7</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-white/20 rounded-full px-3 py-1">⭐ {fmtNum(gs.sugarStars)} stars</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🔄 {gs.rebirths} rebirth{gs.rebirths !== 1 ? 's' : ''}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏅 {gs.achievements.length}/{ACHIEVEMENTS.length}</span>
          {pendingStars > 0 && (
            <button onClick={() => setTab('rebirth')} className="bg-yellow-300 text-amber-900 rounded-full px-3 py-1 animate-pulse">
              ⭐ {pendingStars} star{pendingStars !== 1 ? 's' : ''} ready — Rebirth!
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
              tab === t.id ? 'bg-amber-500 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50'
            }`}
          >
            {t.icon} {t.name}
            {t.id === 'upgrades' && availableUpgrades.filter((u) => u.cost <= gs.sweets).length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                {availableUpgrades.filter((u) => u.cost <= gs.sweets).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══ BAKERY TAB ══ */}
      {tab === 'bakery' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Clicker zone */}
          <div className="relative bg-gradient-to-b from-amber-50 to-orange-100 rounded-2xl border-2 border-amber-200 p-6 overflow-hidden min-h-[420px] flex flex-col items-center justify-center">
            {/* golden cookie */}
            {golden && (
              <button
                onClick={clickGolden}
                className="absolute z-20 text-5xl md:text-6xl drop-shadow-lg"
                style={{ left: `${golden.x}%`, top: `${golden.y}%`, animation: 'se-golden 0.8s ease-in-out infinite' }}
                title="Golden cookie! Click it!"
              >
                🌟🍪
              </button>
            )}

            {/* buffs */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {frenzyOn && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🔥 Frenzy ×7 · {Math.ceil((buffs.frenzyUntil - now()) / 1000)}s
                </span>
              )}
              {clickFrenzyOn && (
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  ⚡ Click Frenzy ×20 · {Math.ceil((buffs.clickFrenzyUntil - now()) / 1000)}s
                </span>
              )}
            </div>

            {/* the cookie */}
            <div className="relative">
              <button
                onClick={clickCookie}
                className={`text-[9rem] md:text-[11rem] leading-none transition-transform duration-75 hover:scale-105 active:scale-95 ${cookiePop ? 'scale-90' : 'scale-100'}`}
                style={frenzyOn ? { animation: 'se-wobble 0.4s ease-in-out infinite' } : undefined}
                title="Click to bake!"
              >
                🍪
              </button>
              {floaties.map((f) => (
                <span
                  key={f.id}
                  className="absolute text-amber-700 font-bold text-xl pointer-events-none"
                  style={{ left: f.x, top: f.y, animation: 'se-float 0.9s ease-out forwards' }}
                >
                  {f.text}
                </span>
              ))}
            </div>

            <p className="text-amber-800 font-bold mt-2">+{fmtNum(clickPower)} per click</p>

            {/* Sugar Rush combo bar */}
            <div className="w-full max-w-xs mt-4">
              <div className="flex justify-between text-xs font-bold text-amber-700 mb-1">
                <span>⚡ Sugar Rush</span>
                <span>+{Math.round(comboPct * COMBO_MAX_BONUS)}% click power</span>
              </div>
              <div className="w-full bg-white/70 rounded-full h-3 border border-amber-200">
                <div
                  className={`h-3 rounded-full transition-all ${comboPct >= 100 ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                  style={{ width: `${comboPct}%` }}
                />
              </div>
              <p className="text-[10px] text-amber-600 mt-1 text-center">Keep clicking to build your combo — it fades when you rest!</p>
            </div>
          </div>

          {/* Buildings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">🏗️ Buildings</h3>
              <div className="flex gap-1">
                {[1, 10, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBuyAmount(n)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${buyAmount === n ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                  >
                    ×{n}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {BUILDINGS.map((b, i) => {
                const owned = gs.buildings[b.id] || 0;
                const prevOwned = i === 0 || (gs.buildings[BUILDINGS[i - 1].id] || 0) > 0;
                const revealed = owned > 0 || prevOwned || gs.lifetimeSweets >= b.baseCost * 0.5;
                if (!revealed) {
                  return (
                    <div key={b.id} className="px-4 py-3 flex items-center gap-3 opacity-40">
                      <span className="text-2xl">❓</span>
                      <p className="text-sm font-bold text-gray-400">???</p>
                    </div>
                  );
                }
                const cost = bulkBuildingCost(b, owned, buyAmount);
                const canAfford = gs.sweets >= cost;
                const eachSps = b.sps * calcBuildingMult(gs, b.id) * calcGlobalMult(gs);
                return (
                  <button
                    key={b.id}
                    onClick={() => buyBuilding(b)}
                    disabled={!canAfford}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition ${canAfford ? 'hover:bg-amber-50' : 'opacity-50'}`}
                  >
                    <span className="text-2xl shrink-0">{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800">{b.name} {owned > 0 && <span className="text-amber-600">×{owned}</span>}</p>
                      <p className="text-[11px] text-gray-500 truncate">{fmtNum(eachSps)}/sec each{owned > 0 ? ` · ${fmtNum(eachSps * owned)}/sec total` : ''}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${canAfford ? 'text-emerald-600' : 'text-red-400'}`}>
                      🍬 {fmtNum(cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ UPGRADES TAB ══ */}
      {tab === 'upgrades' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">⬆️ Upgrades ({gs.upgrades.length} owned)</h3>
          {availableUpgrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No upgrades available right now — keep baking and clicking to reveal more!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {availableUpgrades.map((u) => {
                const canAfford = gs.sweets >= u.cost;
                return (
                  <button
                    key={u.id}
                    onClick={() => buyUpgrade(u)}
                    disabled={!canAfford}
                    className={`text-left rounded-xl border-2 p-3 transition ${canAfford ? 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{u.icon} {u.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                    <p className={`text-xs font-bold mt-1 ${canAfford ? 'text-emerald-600' : 'text-red-400'}`}>🍬 {fmtNum(u.cost)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ REBIRTH TAB ══ */}
      {tab === 'rebirth' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold">⭐ Recipe Rebirth</h3>
            <p className="text-indigo-100 text-sm mt-1">
              Sacrifice your bakery to discover a legendary new recipe. You lose your sweets, buildings and most upgrades —
              but earn <span className="font-bold text-yellow-300">Sugar Stars</span>: each one boosts ALL production by {Math.round(STAR_SPS_BONUS * 100)}%, forever.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-indigo-200">BAKED THIS RUN</p>
                <p className="text-lg font-bold">{fmtNum(gs.runSweets)}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-indigo-200">STARS ON REBIRTH</p>
                <p className="text-lg font-bold text-yellow-300">⭐ {pendingStars}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-indigo-200">CURRENT BONUS</p>
                <p className="text-lg font-bold">+{Math.round(gs.sugarStars * STAR_SPS_BONUS * 100)}%</p>
              </div>
            </div>
            <div className="mt-4">
              {pendingStars >= 1 ? (
                rebirthConfirm ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">Really rebirth for ⭐ {pendingStars}?</span>
                    <button onClick={doRebirth} className="bg-yellow-400 text-amber-900 px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition">Yes — Rebirth!</button>
                    <button onClick={() => setRebirthConfirm(false)} className="bg-white/20 px-4 py-2 rounded-xl font-bold hover:bg-white/30 transition">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setRebirthConfirm(true)} className="bg-yellow-400 text-amber-900 px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-300 transition shadow">
                    ⭐ Rebirth for {pendingStars} Sugar Star{pendingStars !== 1 ? 's' : ''}
                  </button>
                )
              ) : (
                <p className="text-sm bg-white/15 rounded-xl px-4 py-2.5 inline-block">
                  🔒 Bake <span className="font-bold">{fmtNum(1e9)}</span> sweets in one run to earn your first star.
                  ({fmtNum(gs.runSweets)} / {fmtNum(1e9)})
                </p>
              )}
            </div>
          </div>

          {/* Star shop */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">🌟 Star Shop — permanent upgrades</h3>
              <span className="text-sm font-bold text-indigo-600">⭐ {fmtNum(gs.sugarStars)} available</span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STAR_UPGRADES.map((u) => {
                const owned = gs.starUpgrades.includes(u.id);
                const canAfford = gs.sugarStars >= u.cost;
                return (
                  <button
                    key={u.id}
                    onClick={() => !owned && buyStarUpgrade(u)}
                    disabled={owned || !canAfford}
                    className={`text-left rounded-xl border-2 p-3 transition ${
                      owned ? 'border-emerald-300 bg-emerald-50'
                        : canAfford ? 'border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:shadow'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{u.icon} {u.name} {owned && '✅'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                    {!owned && <p className={`text-xs font-bold mt-1 ${canAfford ? 'text-indigo-600' : 'text-red-400'}`}>⭐ {u.cost}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ STYLE TAB ══ */}
      {tab === 'style' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800">🎨 Profile Style</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">
              Rare rewards that change how YOUR card looks on the Classroom Champions board and your own dashboard.
              Unlocks are permanent — even through rebirths.
            </p>

            {/* Themes */}
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Card Themes</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-5">
              {SE_THEMES.map((t) => {
                const unlocked = gs.unlockedThemes.includes(t.id);
                const active = gs.activeTheme === t.id;
                const style = SE_THEME_STYLES[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => unlocked && equip('activeTheme', t.id)}
                    disabled={!unlocked}
                    className={`text-left rounded-xl border-2 p-3 transition ${
                      active ? `${style.border} ${style.bg} shadow-md ${style.glow}`
                        : unlocked ? 'border-gray-200 bg-white hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{t.icon} {t.name} {active && '· EQUIPPED'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{unlocked ? (active ? 'Tap to unequip' : 'Tap to equip') : `🔒 ${t.reqText}`}</p>
                    <div className={`h-2 rounded-full mt-2 bg-gradient-to-r ${style.grad}`} />
                  </button>
                );
              })}
            </div>

            {/* Titles */}
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Titles</h4>
            <div className="flex flex-wrap gap-2 mb-5">
              {SE_TITLES.map((t) => {
                const unlocked = gs.unlockedTitles.includes(t.id);
                const active = gs.activeTitle === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => unlocked && equip('activeTitle', t.id)}
                    disabled={!unlocked}
                    title={unlocked ? '' : t.reqText}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-bold border-2 transition ${
                      active ? 'border-amber-400 bg-amber-50 ' + t.color
                        : unlocked ? `border-gray-200 bg-white ${t.color} hover:shadow` : 'border-gray-200 bg-gray-50 text-gray-300'
                    }`}
                  >
                    {unlocked ? t.name : `🔒 ${t.name}`}{active && ' ✓'}
                  </button>
                );
              })}
            </div>

            {/* Effects */}
            <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-2">Special Effects</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {SE_EFFECTS.map((ef) => {
                const unlocked = gs.unlockedEffects.includes(ef.id);
                const active = gs.activeEffect === ef.id;
                return (
                  <button
                    key={ef.id}
                    onClick={() => unlocked && equip('activeEffect', ef.id)}
                    disabled={!unlocked}
                    className={`text-left rounded-xl border-2 p-3 transition ${
                      active ? `border-fuchsia-300 bg-fuchsia-50 ${ef.cls}`
                        : unlocked ? 'border-gray-200 bg-white hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{ef.icon} {ef.name} {active && '· EQUIPPED'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{unlocked ? (active ? 'Tap to unequip' : 'Tap to equip') : `🔒 ${ef.reqText}`}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ AWARDS TAB ══ */}
      {tab === 'awards' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-1">🏅 Achievements ({gs.achievements.length}/{ACHIEVEMENTS.length})</h3>
          <p className="text-xs text-gray-500 mb-3">Every achievement permanently boosts ALL production by 1%. Current bonus: +{gs.achievements.length}%.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const earned = gs.achievements.includes(a.id);
              return (
                <div key={a.id} className={`rounded-xl border p-2.5 ${earned ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                  <p className="text-sm font-bold text-gray-800">{earned ? a.icon : '🔒'} {a.name}</p>
                  <p className="text-[11px] text-gray-500">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ STATS TAB ══ */}
      {tab === 'stats' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-800 mb-4">📊 Empire Statistics</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['🍬 Sweets in bank', fmtNum(gs.sweets)],
              ['🏭 Production', `${fmtNum(sps)}/sec`],
              ['👆 Sweets per click', fmtNum(clickPower)],
              ['📈 Baked this run', fmtNum(gs.runSweets)],
              ['🌍 Lifetime sweets', fmtNum(gs.lifetimeSweets)],
              ['🖱️ Total clicks', fmtNum(gs.clicks)],
              ['🌟 Golden cookies clicked', fmtNum(gs.goldenClicks)],
              ['🏗️ Buildings owned', fmtNum(BUILDINGS.reduce((s, b) => s + (gs.buildings[b.id] || 0), 0))],
              ['⬆️ Upgrades owned', gs.upgrades.length],
              ['⭐ Sugar Stars', fmtNum(gs.sugarStars)],
              ['🔄 Recipe Rebirths', gs.rebirths],
              ['🏅 Achievement bonus', `+${gs.achievements.length}%`],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            💤 Offline production: {offlineHours(gs)}h window at {Math.round(OFFLINE_RATE * 100)}% speed — your bakery keeps working while you&apos;re away!
          </p>
        </div>
      )}

      {/* ══ CLASS TAB ══ */}
      {tab === 'class' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">👥 Class Sweet-Off — lifetime sweets</h3>
          {(() => {
            const rows = [...(classmates || [])]
              .map((s) => ({
                id: s.id,
                name: `${s.firstName || '?'} ${s.lastName?.charAt(0) || ''}`,
                lifetime: s.sweetEmpireData?.lifetimeSweets || 0,
                rebirths: s.sweetEmpireData?.rebirths || 0,
                isMe: s.id === studentData?.id,
              }));
            if (!rows.some((r) => r.isMe) && studentData) {
              rows.push({ id: studentData.id, name: `${studentData.firstName || 'You'}`, lifetime: gs.lifetimeSweets, rebirths: gs.rebirths, isMe: true });
            } else {
              const me = rows.find((r) => r.isMe);
              if (me) { me.lifetime = Math.max(me.lifetime, gs.lifetimeSweets); me.rebirths = gs.rebirths; }
            }
            rows.sort((a, b) => b.lifetime - a.lifetime);
            return rows.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No classmates found yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {rows.slice(0, 20).map((r, i) => (
                  <div key={r.id || i} className={`flex items-center gap-3 py-2.5 px-2 rounded-lg ${r.isMe ? 'bg-amber-50' : ''}`}>
                    <span className="w-8 text-center font-bold text-gray-400">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{r.name} {r.isMe && '(you)'}</p>
                    {r.rebirths > 0 && <span className="text-xs font-bold text-indigo-500">🔄{r.rebirths}</span>}
                    <span className="font-bold text-amber-600 text-sm">🍬 {fmtNum(r.lifetime)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Offline earnings modal */}
      {offlineReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOfflineReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <p className="text-5xl mb-3">💤🍪</p>
            <h3 className="text-xl font-bold text-gray-800">Welcome back, boss!</h3>
            <p className="text-sm text-gray-500 mt-2">
              Your bakery kept working for {Math.round(offlineReport.seconds / 60)} minutes while you were away and baked…
            </p>
            <p className="text-3xl font-bold text-amber-600 my-3">+{fmtNum(offlineReport.earned)} 🍬</p>
            <button onClick={() => setOfflineReport(null)} className="bg-amber-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition">
              Sweet!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SweetEmpireGame;
