// components/games/SweetEmpireGame.js
// ─────────────────────────────────────────────────────────────────────────────
// CHAMPION'S FORGE ⚔️ — the deep idle/clicker (formerly Sweet Empire, rethemed
// to heroes & champions; all save data and ids unchanged so progress is kept).
//
// Features: an evolving legendary weapon you strike to earn gold, 12 champion
// recruits, 75+ upgrades, Battle Momentum combos, loot chests with random
// buffs, RANDOM REALM EVENTS (merchants, blessings, goblin hordes and
// clickable DRAGON RAIDS), 45+ achievements (each a permanent boost), Heroic
// Ascension prestige with a Glory Star shop, offline production, a class
// leaderboard, and slow-grind profile unlocks (card themes, titles, special
// effects) that appear on the Classroom Champions student cards and the
// student's own dashboard.
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
  GOLDEN_MIN_GAP, GOLDEN_MAX_GAP, GOLDEN_LIFETIME, GOLDEN_EFFECTS, LOOT_CHEST_IMAGES,
  EVENT_MIN_GAP, EVENT_MAX_GAP, EVENT_LIFETIME, REALM_EVENTS,
  DRAGON_HP_CLICKS, DRAGON_TIME, DRAGON_REWARD_MINUTES, DRAGON_IMAGES,
  COMBO_MAX, COMBO_MAX_BONUS, COMBO_GAIN_PER_CLICK, COMBO_DECAY_PER_SEC, COMBO_DECAY_GRACE_MS,
  AUTOCLICK_WINDOW_CLICKS, AUTOCLICK_WINDOW_MS, WEAPON_BREAK_SECONDS,
  FORGE_STAGES, forgeStageFor,
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
  dragonsSlain: Number(gs.dragonsSlain) || 0,
  eventsClaimed: Number(gs.eventsClaimed) || 0,
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
  mult *= 1 + (gs.sugarStars || 0) * STAR_SPS_BONUS;          // +2% per Glory Star
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
  if (buffs.blessingUntil && buffs.blessingUntil > now()) sps *= 3;
  if (buffs.inspiredUntil && buffs.inspiredUntil > now()) sps *= 2;
  if (buffs.curseUntil && buffs.curseUntil > now()) sps *= 0.5;
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
  if (buffs.trainingUntil && buffs.trainingUntil > now()) power *= 10;
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

const eventGapMs = (gs) => {
  const freq = (gs.starUpgrades || []).includes('su_event') ? 1.5 : 1;
  const min = (EVENT_MIN_GAP / freq) * 1000;
  const max = (EVENT_MAX_GAP / freq) * 1000;
  return min + Math.random() * (max - min);
};

const goldenDurationMult = (gs) =>
  (gs.upgrades || []).some((id) => UPGRADE_MAP[id]?.type === 'goldenDur') ? 1.5 : 1;

const offlineHours = (gs) => {
  if ((gs.starUpgrades || []).includes('su_off2')) return 24;
  if ((gs.starUpgrades || []).includes('su_off1')) return 8;
  return OFFLINE_BASE_HOURS;
};

const pickWeighted = (list) => {
  const total = list.reduce((s, e) => s + e.weight, 0);
  let roll = Math.random() * total;
  for (const e of list) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return list[0];
};

const merchantDiscount = (buffs) => (buffs.merchantUntil && buffs.merchantUntil > now() ? 0.75 : 1);

const TABS = [
  { id: 'bakery', name: 'Forge', icon: '⚔️' },
  { id: 'upgrades', name: 'Armory', icon: '⬆️' },
  { id: 'rebirth', name: 'Ascension', icon: '⭐' },
  { id: 'style', name: 'Style', icon: '🎨' },
  { id: 'awards', name: 'Awards', icon: '🏅' },
  { id: 'stats', name: 'Stats', icon: '📊' },
  { id: 'class', name: 'Class', icon: '👥' },
];

// ═════════════════════════════════════════════════════════════════════════════
const SweetEmpireGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [], onSwitchGame = null }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('bakery');
  const [buyAmount, setBuyAmount] = useState(1);
  const [combo, setCombo] = useState(0);
  const [buffs, setBuffs] = useState({});          // { frenzyUntil, clickFrenzyUntil, blessingUntil, trainingUntil, merchantUntil }
  const [golden, setGolden] = useState(null);      // loot chest { x, y, img, expiresAt }
  const [event, setEvent] = useState(null);        // realm event banner { def, expiresAt }
  const [dragon, setDragon] = useState(null);      // { hp, maxHp, until, img }
  const [floaties, setFloaties] = useState([]);    // floating strike numbers
  const [offlineReport, setOfflineReport] = useState(null);
  const [rebirthConfirm, setRebirthConfirm] = useState(false);
  const [weaponPop, setWeaponPop] = useState(false);
  const [stageFlash, setStageFlash] = useState(false);
  const [brokenUntil, setBrokenUntil] = useState(0); // weapon overheated (anti-autoclick)
  const [, setTick] = useState(0);                 // forces countdown re-renders

  const gsRef = useRef(gs); gsRef.current = gs;
  const buffsRef = useRef(buffs); buffsRef.current = buffs;
  const comboRef = useRef(combo); comboRef.current = combo;
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const goldenTimer = useRef(null);
  const eventTimer = useRef(null);
  const floatId = useRef(0);
  const stageIndexRef = useRef(null);
  const lastClickAtRef = useRef(0);      // for momentum decay grace period
  const clickTimesRef = useRef([]);      // rolling strike timestamps (anti-autoclick)
  const brokenUntilRef = useRef(0);
  const showToastRef = useRef(showToast); showToastRef.current = showToast;

  const sps = useMemo(() => calcSps(gs, buffs), [gs, buffs]);
  const clickPower = useMemo(() => calcClickPower(gs, buffs, combo), [gs, buffs, combo]);
  const pendingStars = starsForRun(gs.runSweets);
  const forgeStage = useMemo(() => forgeStageFor(gs), [gs]);

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
    stageIndexRef.current = forgeStageFor(save).index;
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
      if (comboRef.current > 0 && now() - lastClickAtRef.current > COMBO_DECAY_GRACE_MS) {
        const slow = (cur.starUpgrades || []).includes('su_combo') ? 3 : 1;
        setCombo((c) => Math.max(0, c - COMBO_DECAY_PER_SEC / 10 / slow));
      }
    }, 100);
    return () => clearInterval(t);
  }, [loaded]);

  // ── Countdown ticker (only while something timed is on screen) ──────────────
  const hasTimedThing = !!(dragon || event || golden || brokenUntil > now() ||
    buffs.frenzyUntil > now() || buffs.clickFrenzyUntil > now() ||
    buffs.blessingUntil > now() || buffs.trainingUntil > now() || buffs.merchantUntil > now() ||
    buffs.inspiredUntil > now() || buffs.curseUntil > now());
  useEffect(() => {
    if (!loaded || !hasTimedThing) return;
    const t = setInterval(() => setTick((x) => x + 1), 250);
    return () => clearInterval(t);
  }, [loaded, hasTimedThing]);

  // ── Weapon evolution watcher ────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    if (stageIndexRef.current === null) { stageIndexRef.current = forgeStage.index; return; }
    if (forgeStage.index > stageIndexRef.current) {
      stageIndexRef.current = forgeStage.index;
      setStageFlash(true);
      setTimeout(() => setStageFlash(false), 2500);
      showToast(`⚔️ Your weapon has evolved: ${forgeStage.name}!`, 'success');
    }
  }, [loaded, forgeStage.index, forgeStage.name, showToast]);

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
      console.error('ChampionsForge: save failed', err);
    } finally {
      savingRef.current = false;
    }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 25000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  // ── Loot chest scheduler (self-sustaining: spawn → expire/claim → repeat) ──
  const scheduleGolden = useCallback(() => {
    clearTimeout(goldenTimer.current);
    goldenTimer.current = setTimeout(() => {
      setGolden({
        x: 8 + Math.random() * 76,   // % across the play area
        y: 12 + Math.random() * 60,
        img: LOOT_CHEST_IMAGES[Math.floor(Math.random() * LOOT_CHEST_IMAGES.length)],
        expiresAt: now() + GOLDEN_LIFETIME * 1000,
      });
      goldenTimer.current = setTimeout(() => { setGolden(null); scheduleGolden(); }, GOLDEN_LIFETIME * 1000);
    }, goldenGapMs(gsRef.current));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    scheduleGolden();
    return () => clearTimeout(goldenTimer.current);
  }, [loaded, scheduleGolden]);

  const clickGolden = () => {
    if (!golden) return;
    setGolden(null);
    scheduleGolden();

    const effect = pickWeighted(GOLDEN_EFFECTS);
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
      showToast(`💰 Treasure Trove! +${fmtNum(gain)} gold!`, 'success');
    } else if (effect.id === 'rush') {
      setCombo(COMBO_MAX);
      showToast('🌀 War Cry! Battle Momentum maxed out!', 'success');
    } else if (effect.id === 'jackpot') {
      const gain = baseSps * 3600 + 777;
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`🎰 DRAGON'S HOARD! +${fmtNum(gain)} gold!`, 'success');
    }
    if (effect.duration > 0) showToast(`${effect.icon} ${effect.name} ${effect.desc}`, 'success');

    setGs((p) => ({ ...p, goldenClicks: p.goldenClicks + 1 }));
    dirtyRef.current = true;
  };

  // ── Realm event scheduler (self-sustaining) ─────────────────────────────────
  const scheduleEvent = useCallback(() => {
    clearTimeout(eventTimer.current);
    eventTimer.current = setTimeout(() => {
      const def = pickWeighted(REALM_EVENTS);
      setEvent({ def, expiresAt: now() + EVENT_LIFETIME * 1000 });
      eventTimer.current = setTimeout(() => {
        // Bad events punish you for ignoring them!
        if (def.kind === 'bad') {
          if (def.id === 'thief') {
            const stolen = gsRef.current.sweets * 0.05;
            setGs((p) => ({ ...p, sweets: Math.max(0, p.sweets - p.sweets * 0.05) }));
            showToastRef.current(`🦹 The thief got away with ${fmtNum(stolen)} gold!`, 'error');
          } else if (def.id === 'omen') {
            setBuffs((b) => ({ ...b, curseUntil: now() + def.duration * 1000 }));
            showToastRef.current('🌩️ The curse takes hold — production HALVED for 60s!', 'error');
          }
          dirtyRef.current = true;
        }
        setEvent(null);
        scheduleEvent();
      }, EVENT_LIFETIME * 1000);
    }, eventGapMs(gsRef.current));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    scheduleEvent();
    return () => clearTimeout(eventTimer.current);
  }, [loaded, scheduleEvent]);

  const answerEvent = () => {
    if (!event) return;
    const def = event.def;

    // Choice events open their options instead of resolving straight away
    // (the expiry timer is paused while you decide).
    if (def.kind === 'choice' && !event.choosing) {
      clearTimeout(eventTimer.current);
      setEvent((ev) => (ev ? { ...ev, choosing: true } : ev));
      // If they never decide, the moment passes on its own after 30s.
      eventTimer.current = setTimeout(() => { setEvent(null); scheduleEvent(); }, 30000);
      return;
    }

    setEvent(null);
    scheduleEvent();
    const cur = gsRef.current;
    const baseSps = calcSps(cur, {});

    if (def.id === 'thief') {
      const gain = baseSps * 180 + 50;
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`🦹 Thief caught! He drops his loot bag: +${fmtNum(gain)} gold!`, 'success');
    } else if (def.id === 'omen') {
      const gain = baseSps * 60 + 25;
      setCombo((c) => Math.min(COMBO_MAX, c + 50));
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`🌩️ Curse warded off! The realm rewards you: +${fmtNum(gain)} gold + momentum surge!`, 'success');
    } else if (def.id === 'merchant') {
      setBuffs((b) => ({ ...b, merchantUntil: now() + def.duration * 1000 }));
      showToast('🧝 Travelling Merchant! All recruits 25% off — hire fast!', 'success');
    } else if (def.id === 'blessing') {
      setBuffs((b) => ({ ...b, blessingUntil: now() + def.duration * 1000 }));
      showToast('✨ Royal Blessing! Production ×3!', 'success');
    } else if (def.id === 'training') {
      setBuffs((b) => ({ ...b, trainingUntil: now() + def.duration * 1000 }));
      showToast('🛡️ Weapons Master! Strike power ×10!', 'success');
    } else if (def.id === 'star') {
      const gain = Math.max(cur.sweets * 0.15, baseSps * 600) + 42;
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`🌠 Falling Star! +${fmtNum(gain)} gold!`, 'success');
    } else if (def.id === 'horde') {
      const gain = baseSps * 300 + 99;
      setCombo(COMBO_MAX);
      setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
      showToast(`👺 Goblin Horde routed! Momentum maxed + ${fmtNum(gain)} gold!`, 'success');
    } else if (def.id === 'dragon') {
      setDragon({
        hp: DRAGON_HP_CLICKS,
        maxHp: DRAGON_HP_CLICKS,
        until: now() + DRAGON_TIME * 1000,
        img: DRAGON_IMAGES[Math.floor(Math.random() * DRAGON_IMAGES.length)],
      });
      showToast('🐉 DRAGON RAID! Strike it down before it escapes!', 'error');
      return; // dragon claims eventsClaimed on resolution
    }
    setGs((p) => ({ ...p, eventsClaimed: (p.eventsClaimed || 0) + 1 }));
    dirtyRef.current = true;
  };

  // ── Choice event resolution ─────────────────────────────────────────────────
  const resolveChoice = (optionId) => {
    if (!event) return;
    const def = event.def;
    setEvent(null);
    scheduleEvent();
    const cur = gsRef.current;
    const baseSps = calcSps(cur, {});

    if (def.id === 'wizard') {
      if (optionId === 'accept') {
        if (Math.random() < 0.6) {
          const gain = cur.sweets * 0.2 + baseSps * 60 + 100;
          setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
          showToast(`🧙 The spell works! Your hoard swells: +${fmtNum(gain)} gold!`, 'success');
        } else {
          const loss = cur.sweets * 0.1;
          setGs((p) => ({ ...p, sweets: Math.max(0, p.sweets - loss) }));
          showToast(`🧙 It was a TRICKSTER! He vanishes with ${fmtNum(loss)} of your gold…`, 'error');
        }
      } else {
        const gain = baseSps * 120 + 40;
        setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
        showToast(`🙅 Wise choice. He tosses you a coin purse anyway: +${fmtNum(gain)} gold.`, 'success');
      }
    } else if (def.id === 'bard') {
      if (optionId === 'pay') {
        const price = cur.sweets * 0.05;
        setGs((p) => ({ ...p, sweets: Math.max(0, p.sweets - price) }));
        setBuffs((b) => ({ ...b, inspiredUntil: now() + 90 * 1000 }));
        showToast(`🎻 The ballad echoes across the realm — production ×2 for 90s! (−${fmtNum(price)} gold)`, 'success');
      } else {
        showToast('🚪 The bard shrugs and wanders off, humming something rude about you.', 'info');
      }
    } else if (def.id === 'chest') {
      if (optionId === 'open') {
        if (Math.random() < 0.7) {
          const gain = baseSps * 480 + 150;
          setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
          showToast(`🗝️ TREASURE! The chest bursts with gold: +${fmtNum(gain)}!`, 'success');
        } else {
          const loss = cur.sweets * 0.05;
          setCombo(0);
          setGs((p) => ({ ...p, sweets: Math.max(0, p.sweets - loss) }));
          showToast(`👄 IT'S A MIMIC! It bites, scattering ${fmtNum(loss)} gold and your momentum!`, 'error');
        }
      } else {
        const gain = baseSps * 30 + 15;
        setGs((p) => ({ ...p, sweets: p.sweets + gain, runSweets: p.runSweets + gain, lifetimeSweets: p.lifetimeSweets + gain }));
        showToast(`🏃 You find ${fmtNum(gain)} gold dropped on the road as you walk away. Probably fine.`, 'success');
      }
    }
    setGs((p) => ({ ...p, eventsClaimed: (p.eventsClaimed || 0) + 1 }));
    dirtyRef.current = true;
  };

  // ── Dragon raid: escapes when the timer runs out ────────────────────────────
  useEffect(() => {
    if (!dragon) return;
    const t = setTimeout(() => {
      setDragon(null);
      showToast('🐉 The dragon escaped with its hoard… next time, champion!', 'error');
      setGs((p) => ({ ...p, eventsClaimed: (p.eventsClaimed || 0) + 1 }));
      dirtyRef.current = true;
    }, Math.max(0, dragon.until - now()));
    return () => clearTimeout(t);
  }, [dragon, showToast]);

  const strikeDragon = (e) => {
    e.stopPropagation();
    if (!dragon) return;
    if (!registerStrike()) return;
    const nextHp = dragon.hp - 1;
    if (nextHp > 0) { setDragon({ ...dragon, hp: nextHp }); return; }
    // SLAIN!
    setDragon(null);
    const cur = gsRef.current;
    const baseSps = calcSps(cur, {});
    const mult = (cur.starUpgrades || []).includes('su_dragon') ? 2 : 1;
    const gain = (baseSps * 60 * DRAGON_REWARD_MINUTES + 777) * mult;
    setGs((p) => ({
      ...p,
      sweets: p.sweets + gain,
      runSweets: p.runSweets + gain,
      lifetimeSweets: p.lifetimeSweets + gain,
      dragonsSlain: (p.dragonsSlain || 0) + 1,
      eventsClaimed: (p.eventsClaimed || 0) + 1,
    }));
    showToast(`🐉 DRAGON SLAIN! Bounty: +${fmtNum(gain)} gold!`, 'success');
    dirtyRef.current = true;
  };

  // ── Anti-autoclick gate: every strike passes through here ───────────────────
  // Returns false if the weapon is overheated or this strike triggered the
  // detector (an impossible sustained click rate = autoclicker).
  const registerStrike = () => {
    const t = now();
    if (brokenUntilRef.current > t) return false;
    const times = clickTimesRef.current;
    times.push(t);
    if (times.length > AUTOCLICK_WINDOW_CLICKS) times.shift();
    if (times.length === AUTOCLICK_WINDOW_CLICKS && t - times[0] < AUTOCLICK_WINDOW_MS) {
      brokenUntilRef.current = t + WEAPON_BREAK_SECONDS * 1000;
      setBrokenUntil(brokenUntilRef.current);
      clickTimesRef.current = [];
      setCombo(0);
      showToastRef.current(`🔥 Your weapon OVERHEATED from impossibly fast striking! It needs ${WEAPON_BREAK_SECONDS}s to cool down…`, 'error');
      return false;
    }
    return true;
  };

  // ── The Forge (main clickable) ──────────────────────────────────────────────
  const clickWeapon = (e) => {
    if (!registerStrike()) return;
    lastClickAtRef.current = now();
    const power = calcClickPower(gsRef.current, buffsRef.current, comboRef.current);
    setGs((p) => ({
      ...p,
      sweets: p.sweets + power,
      runSweets: p.runSweets + power,
      lifetimeSweets: p.lifetimeSweets + power,
      clicks: p.clicks + 1,
    }));
    setCombo((c) => Math.min(COMBO_MAX, c + COMBO_GAIN_PER_CLICK));
    setWeaponPop(true);
    setTimeout(() => setWeaponPop(false), 90);
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
    const cost = Math.ceil(bulkBuildingCost(b, owned, buyAmount) * merchantDiscount(buffs));
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
    showToast(`${u.icon} ${u.name} forged!`, 'success');
    dirtyRef.current = true;
  };

  const buyStarUpgrade = (u) => {
    if (gs.sugarStars < u.cost || gs.starUpgrades.includes(u.id)) return;
    setGs((p) => ({ ...p, sugarStars: p.sugarStars - u.cost, starUpgrades: [...p.starUpgrades, u.id] }));
    showToast(`${u.icon} ${u.name} — yours forever!`, 'success');
    dirtyRef.current = true;
  };

  // ── Heroic Ascension ────────────────────────────────────────────────────────
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
    setDragon(null);
    setBrokenUntil(0);
    brokenUntilRef.current = 0;
    clickTimesRef.current = [];
    setRebirthConfirm(false);
    setTab('bakery');
    showToast(`⭐ Heroic Ascension! +${stars} Glory Star${stars !== 1 ? 's' : ''} (${next.sugarStars} total, +${Math.round(next.sugarStars * STAR_SPS_BONUS * 100)}% production)`, 'success');
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
  const blessingOn = buffs.blessingUntil > now();
  const trainingOn = buffs.trainingUntil > now();
  const merchantOn = buffs.merchantUntil > now();
  const inspiredOn = buffs.inspiredUntil > now();
  const cursedOn = buffs.curseUntil > now();
  const brokenOn = brokenUntil > now();
  const availableUpgrades = UPGRADES.filter((u) => !gs.upgrades.includes(u.id) && u.unlock(gs)).sort((a, b) => a.cost - b.cost);
  const comboPct = Math.round((Math.min(combo, COMBO_MAX) / COMBO_MAX) * 100);
  const activeThemeStyle = gs.activeTheme ? SE_THEME_STYLES[gs.activeTheme] : null;
  const nextStage = FORGE_STAGES[forgeStage.index + 1] || null;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <style>{`
        @keyframes cf-float { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-60px); } }
        @keyframes cf-chest { 0%,100% { transform: scale(1) rotate(-6deg); } 50% { transform: scale(1.15) rotate(6deg); } }
        @keyframes cf-wobble { 0%,100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
        @keyframes cf-evolve { 0% { filter: drop-shadow(0 0 0px #fbbf24); } 50% { filter: drop-shadow(0 0 34px #fbbf24); } 100% { filter: drop-shadow(0 0 0px #fbbf24); } }
        @keyframes cf-dragon { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.03); } }
        @keyframes cf-glow { 0%,100% { filter: drop-shadow(0 0 8px rgba(251,191,36,.55)); } 50% { filter: drop-shadow(0 0 20px rgba(251,191,36,.9)); } }
      `}</style>

      {/* Header */}
      <div className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r ${activeThemeStyle ? activeThemeStyle.grad : 'from-slate-800 via-indigo-900 to-purple-900'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">⚔️ Champion&apos;s Forge</h1>
            <p className="text-white/85 text-sm">Strike the forge. Raise an army. Become a legend.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold drop-shadow">{fmtNum(gs.sweets)} 🪙</p>
            <p className="text-white/85 text-sm font-semibold">
              {fmtNum(sps)}/sec {frenzyOn && <span className="text-yellow-200 font-bold">🔥 FURY ×7</span>}{blessingOn && <span className="text-cyan-200 font-bold"> ✨ ×3</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-white/20 rounded-full px-3 py-1">⭐ {fmtNum(gs.sugarStars)} Glory Stars</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🔄 {gs.rebirths} Ascension{gs.rebirths !== 1 ? 's' : ''}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏅 {gs.achievements.length}/{ACHIEVEMENTS.length}</span>
          {(gs.dragonsSlain || 0) > 0 && <span className="bg-white/20 rounded-full px-3 py-1">🐉 {gs.dragonsSlain} slain</span>}
          {pendingStars > 0 && (
            <button onClick={() => setTab('rebirth')} className="bg-yellow-300 text-amber-900 rounded-full px-3 py-1 animate-pulse">
              ⭐ {pendingStars} star{pendingStars !== 1 ? 's' : ''} ready — Ascend!
            </button>
          )}
        </div>
        {onSwitchGame && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-bold">
            <span className="text-white/60">Linked worlds:</span>
            <button onClick={() => onSwitchGame('champions-menagerie')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Your weapon's legend powers nothing here — but your essence discoveries flow to your creatures!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shop/Egg/Egg.png" alt="" className="w-4 h-4 object-contain" />
              Champion&apos;s Menagerie
            </button>
            <button onClick={() => onSwitchGame('wildwood-homestead')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Your legendary weapon doubles as a mighty axe in the Wildwood!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game icons/Wildwood/Camping/001-fire.svg" alt="" className="w-4 h-4 object-contain" />
              Wildwood Homestead
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
              tab === t.id ? 'bg-indigo-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-indigo-50'
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

      {/* ══ FORGE TAB ══ */}
      {tab === 'bakery' && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Battle zone */}
          <div
            className="relative rounded-2xl border-2 border-indigo-900/40 p-6 overflow-hidden min-h-[460px] flex flex-col items-center justify-center bg-slate-900 bg-cover bg-center"
            style={{ backgroundImage: "linear-gradient(rgba(10,10,30,0.55), rgba(10,10,30,0.7)), url('/Loot/Backgrounds/night.png')" }}
          >
            {/* realm event banner */}
            {event && !dragon && !event.choosing && (
              <button
                onClick={answerEvent}
                className={`absolute top-3 inset-x-3 z-30 border-2 rounded-xl px-4 py-2.5 text-left shadow-xl hover:scale-[1.02] transition animate-pulse ${
                  event.def.kind === 'bad'
                    ? 'bg-gradient-to-r from-red-800 to-rose-700 border-red-300/80'
                    : 'bg-gradient-to-r from-purple-700 to-indigo-700 border-yellow-300/70'
                }`}
              >
                <p className={`font-bold text-sm ${event.def.kind === 'bad' ? 'text-red-200' : 'text-yellow-300'}`}>{event.def.icon} REALM EVENT: {event.def.name}</p>
                <p className="text-white/90 text-xs">{event.def.desc} <span className="font-bold text-yellow-200">{event.def.kind === 'bad' ? 'Tap to stop it!' : event.def.kind === 'choice' ? 'Tap to decide!' : 'Tap to answer the call!'} ({Math.max(0, Math.ceil((event.expiresAt - now()) / 1000))}s)</span></p>
              </button>
            )}

            {/* choice event: pick an option */}
            {event && !dragon && event.choosing && (
              <div className="absolute top-3 inset-x-3 z-30 bg-gradient-to-r from-purple-800 to-indigo-800 border-2 border-yellow-300/70 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-yellow-300 font-bold text-sm">{event.def.icon} {event.def.name}</p>
                <p className="text-white/90 text-xs mb-2">{event.def.desc}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  {(event.def.options || []).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => resolveChoice(opt.id)}
                      className="flex-1 bg-white/10 hover:bg-white/25 border border-white/30 rounded-lg px-3 py-2 text-left transition"
                    >
                      <p className="text-white font-bold text-xs">{opt.label}</p>
                      <p className="text-indigo-200 text-[10px]">{opt.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* loot chest */}
            {golden && !dragon && (
              <button
                onClick={clickGolden}
                className="absolute z-20 w-16 h-16 md:w-20 md:h-20"
                style={{ left: `${golden.x}%`, top: `${golden.y}%`, animation: 'cf-chest 0.8s ease-in-out infinite' }}
                title="Legendary loot! Grab it!"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={golden.img} alt="Legendary loot" className="w-full h-full object-contain" style={{ animation: 'cf-glow 1.2s ease-in-out infinite' }} />
              </button>
            )}

            {/* active buffs */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {frenzyOn && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🔥 Battle Fury ×7 · {Math.ceil((buffs.frenzyUntil - now()) / 1000)}s
                </span>
              )}
              {clickFrenzyOn && (
                <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  ⚡ Blade Storm ×20 · {Math.ceil((buffs.clickFrenzyUntil - now()) / 1000)}s
                </span>
              )}
              {blessingOn && (
                <span className="bg-cyan-600 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  ✨ Royal Blessing ×3 · {Math.ceil((buffs.blessingUntil - now()) / 1000)}s
                </span>
              )}
              {trainingOn && (
                <span className="bg-emerald-600 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🛡️ Weapons Master ×10 · {Math.ceil((buffs.trainingUntil - now()) / 1000)}s
                </span>
              )}
              {merchantOn && (
                <span className="bg-amber-500 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🧝 Merchant −25% · {Math.ceil((buffs.merchantUntil - now()) / 1000)}s
                </span>
              )}
              {inspiredOn && (
                <span className="bg-pink-600 text-white text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🎻 Inspired ×2 · {Math.ceil((buffs.inspiredUntil - now()) / 1000)}s
                </span>
              )}
              {cursedOn && (
                <span className="bg-gray-700 text-red-300 text-xs font-bold rounded-full px-3 py-1 animate-pulse">
                  🌩️ Cursed ×0.5 · {Math.ceil((buffs.curseUntil - now()) / 1000)}s
                </span>
              )}
            </div>

            {/* DRAGON RAID overlay */}
            {dragon ? (
              <div className="relative flex flex-col items-center z-20">
                <p className="text-red-400 font-bold text-lg mb-1 animate-pulse">🐉 DRAGON RAID! {Math.max(0, Math.ceil((dragon.until - now()) / 1000))}s</p>
                <button onClick={strikeDragon} className="active:scale-95 transition-transform" title="STRIKE THE DRAGON!">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dragon.img} alt="Raiding dragon" className={`w-44 h-44 md:w-56 md:h-56 object-contain ${brokenOn ? 'grayscale opacity-60' : ''}`} style={{ animation: 'cf-dragon 0.6s ease-in-out infinite' }} />
                </button>
                <div className="w-56 bg-black/50 rounded-full h-4 border border-red-400 mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400 transition-all" style={{ width: `${(dragon.hp / dragon.maxHp) * 100}%` }} />
                </div>
                <p className="text-red-200 text-xs font-bold mt-1">{dragon.hp}/{dragon.maxHp} — strike it down for a {DRAGON_REWARD_MINUTES}-minute gold bounty!</p>
              </div>
            ) : (
              <>
                {/* the evolving weapon */}
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1 z-10">Stage {forgeStage.index + 1}/{FORGE_STAGES.length}</p>
                <p className="text-white font-bold text-lg drop-shadow z-10">{forgeStage.name}</p>
                <div className="relative z-10">
                  <button
                    onClick={clickWeapon}
                    className={`transition-transform duration-75 hover:scale-105 active:scale-95 ${weaponPop ? 'scale-90' : 'scale-100'}`}
                    style={{
                      animation: [frenzyOn ? 'cf-wobble 0.4s ease-in-out infinite' : '', stageFlash ? 'cf-evolve 0.8s ease-in-out 3' : ''].filter(Boolean).join(', ') || undefined,
                    }}
                    title="Strike to earn gold!"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={forgeStage.img}
                      alt={forgeStage.name}
                      className={`w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl ${brokenOn ? 'grayscale opacity-50' : ''}`}
                      draggable={false}
                    />
                  </button>
                  {brokenOn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-red-600/90 text-white text-xs font-bold rounded-xl px-3 py-2 text-center shadow-lg animate-pulse">
                        🔥 OVERHEATED!<br />Cooling down… {Math.max(0, Math.ceil((brokenUntil - now()) / 1000))}s
                      </span>
                    </div>
                  )}
                  {floaties.map((f) => (
                    <span
                      key={f.id}
                      className="absolute text-yellow-300 font-bold text-xl pointer-events-none drop-shadow"
                      style={{ left: f.x, top: f.y, animation: 'cf-float 0.9s ease-out forwards' }}
                    >
                      {f.text}
                    </span>
                  ))}
                </div>
                <p className="text-indigo-100/80 text-xs italic mt-1 z-10">“{forgeStage.flavor}”</p>
                <p className="text-yellow-300 font-bold mt-1 z-10">+{fmtNum(clickPower)} gold per strike</p>
                {nextStage && (
                  <p className="text-indigo-300/80 text-[11px] mt-0.5 z-10">
                    Next: <span className="font-bold">{nextStage.name}</span> — {nextStage.req.type === 'rebirths'
                      ? `${nextStage.req.value} Ascension${nextStage.req.value !== 1 ? 's' : ''}`
                      : `${fmtNum(nextStage.req.value)} lifetime gold`}
                  </p>
                )}
              </>
            )}

            {/* Battle Momentum bar */}
            <div className="w-full max-w-xs mt-4 z-10">
              <div className="flex justify-between text-xs font-bold text-indigo-200 mb-1">
                <span>⚡ Battle Momentum</span>
                <span>+{Math.round(comboPct * COMBO_MAX_BONUS)}% strike power</span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-3 border border-indigo-500/50">
                <div
                  className={`h-3 rounded-full transition-all ${comboPct >= 100 ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'}`}
                  style={{ width: `${comboPct}%` }}
                />
              </div>
              <p className="text-[10px] text-indigo-300/80 mt-1 text-center">Keep striking to build momentum — it fades when you rest!</p>
            </div>
          </div>

          {/* Champions (recruits) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">🏰 Champions {merchantOn && <span className="text-amber-600 text-xs">🧝 25% OFF!</span>}</h3>
              <div className="flex gap-1">
                {[1, 10, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBuyAmount(n)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${buyAmount === n ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
                  >
                    ×{n}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
              {BUILDINGS.map((b, i) => {
                const owned = gs.buildings[b.id] || 0;
                const prevOwned = i === 0 || (gs.buildings[BUILDINGS[i - 1].id] || 0) > 0;
                const revealed = owned > 0 || prevOwned || gs.lifetimeSweets >= b.baseCost * 0.5;
                if (!revealed) {
                  return (
                    <div key={b.id} className="px-4 py-3 flex items-center gap-3 opacity-40">
                      <span className="text-2xl">❓</span>
                      <p className="text-sm font-bold text-gray-400">A mysterious ally awaits…</p>
                    </div>
                  );
                }
                const cost = Math.ceil(bulkBuildingCost(b, owned, buyAmount) * merchantDiscount(buffs));
                const canAfford = gs.sweets >= cost;
                const eachSps = b.sps * calcBuildingMult(gs, b.id) * calcGlobalMult(gs);
                return (
                  <button
                    key={b.id}
                    onClick={() => buyBuilding(b)}
                    disabled={!canAfford}
                    className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition ${canAfford ? 'hover:bg-indigo-50' : 'opacity-50'}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.img} alt={b.name} className="w-10 h-10 object-contain shrink-0 rounded-lg bg-slate-100" draggable={false} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-800">{b.name} {owned > 0 && <span className="text-indigo-600">×{owned}</span>}</p>
                      <p className="text-[11px] text-gray-500 truncate">{fmtNum(eachSps)}/sec each{owned > 0 ? ` · ${fmtNum(eachSps * owned)}/sec total` : ''}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${canAfford ? 'text-emerald-600' : 'text-red-400'}`}>
                      🪙 {fmtNum(cost)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ ARMORY (upgrades) TAB ══ */}
      {tab === 'upgrades' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">⬆️ Armory ({gs.upgrades.length} forged)</h3>
          {availableUpgrades.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nothing on the anvil right now — keep questing and striking to reveal more!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {availableUpgrades.map((u) => {
                const canAfford = gs.sweets >= u.cost;
                return (
                  <button
                    key={u.id}
                    onClick={() => buyUpgrade(u)}
                    disabled={!canAfford}
                    className={`text-left rounded-xl border-2 p-3 transition ${canAfford ? 'border-indigo-300 bg-indigo-50 hover:border-indigo-400 hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                  >
                    <p className="font-bold text-gray-800 text-sm">{u.icon} {u.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{u.desc}</p>
                    <p className={`text-xs font-bold mt-1 ${canAfford ? 'text-emerald-600' : 'text-red-400'}`}>🪙 {fmtNum(u.cost)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ ASCENSION TAB ══ */}
      {tab === 'rebirth' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold">⭐ Heroic Ascension</h3>
            <p className="text-indigo-100 text-sm mt-1">
              Lay down your arms and ascend to legend. You lose your gold, champions and most upgrades —
              but earn <span className="font-bold text-yellow-300">Glory Stars</span>: each one boosts ALL production by {Math.round(STAR_SPS_BONUS * 100)}%, forever.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-indigo-200">GOLD THIS QUEST</p>
                <p className="text-lg font-bold">{fmtNum(gs.runSweets)}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-indigo-200">STARS ON ASCENSION</p>
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
                    <span className="text-sm font-bold">Really ascend for ⭐ {pendingStars}?</span>
                    <button onClick={doRebirth} className="bg-yellow-400 text-amber-900 px-5 py-2 rounded-xl font-bold hover:bg-yellow-300 transition">Yes — Ascend!</button>
                    <button onClick={() => setRebirthConfirm(false)} className="bg-white/20 px-4 py-2 rounded-xl font-bold hover:bg-white/30 transition">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setRebirthConfirm(true)} className="bg-yellow-400 text-amber-900 px-6 py-2.5 rounded-xl font-bold hover:bg-yellow-300 transition shadow">
                    ⭐ Ascend for {pendingStars} Glory Star{pendingStars !== 1 ? 's' : ''}
                  </button>
                )
              ) : (
                <p className="text-sm bg-white/15 rounded-xl px-4 py-2.5 inline-block">
                  🔒 Earn <span className="font-bold">{fmtNum(1e9)}</span> gold in one quest to earn your first star.
                  ({fmtNum(gs.runSweets)} / {fmtNum(1e9)})
                </p>
              )}
            </div>
          </div>

          {/* Hall of Legends */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800">🌟 Hall of Legends — permanent upgrades</h3>
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
            <h3 className="font-bold text-gray-800">🎨 Champion Style</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-4">
              Rare rewards that change how YOUR card looks on the Classroom Champions board and your own dashboard.
              Unlocks are permanent — even through Ascensions.
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
                      active ? 'border-indigo-400 bg-indigo-50 ' + t.color
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
          <h3 className="font-bold text-gray-800 mb-1">🏅 Deeds of Legend ({gs.achievements.length}/{ACHIEVEMENTS.length})</h3>
          <p className="text-xs text-gray-500 mb-3">Every deed permanently boosts ALL production by 1%. Current bonus: +{gs.achievements.length}%.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const earned = gs.achievements.includes(a.id);
              return (
                <div key={a.id} className={`rounded-xl border p-2.5 ${earned ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
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
          <h3 className="font-bold text-gray-800 mb-4">📊 Champion&apos;s Chronicle</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['🪙 Gold in hoard', fmtNum(gs.sweets)],
              ['🏭 Production', `${fmtNum(sps)}/sec`],
              ['⚔️ Gold per strike', fmtNum(clickPower)],
              ['📈 Gold this quest', fmtNum(gs.runSweets)],
              ['🌍 Lifetime gold', fmtNum(gs.lifetimeSweets)],
              ['🖱️ Total strikes', fmtNum(gs.clicks)],
              ['🗡️ Weapon stage', `${forgeStage.index + 1}/${FORGE_STAGES.length} — ${forgeStage.name}`],
              ['🎁 Loot chests opened', fmtNum(gs.goldenClicks)],
              ['🐉 Dragons slain', fmtNum(gs.dragonsSlain || 0)],
              ['🌪️ Realm events answered', fmtNum(gs.eventsClaimed || 0)],
              ['🏰 Champions recruited', fmtNum(BUILDINGS.reduce((s, b) => s + (gs.buildings[b.id] || 0), 0))],
              ['⬆️ Upgrades forged', gs.upgrades.length],
              ['⭐ Glory Stars', fmtNum(gs.sugarStars)],
              ['🔄 Heroic Ascensions', gs.rebirths],
              ['🏅 Deed bonus', `+${gs.achievements.length}%`],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
                <p className="text-lg font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            💤 Offline production: {offlineHours(gs)}h window at {Math.round(OFFLINE_RATE * 100)}% speed — your army keeps fighting while you&apos;re away!
          </p>
        </div>
      )}

      {/* ══ CLASS TAB ══ */}
      {tab === 'class' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3">👥 Hall of Champions — lifetime gold</h3>
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
                  <div key={r.id || i} className={`flex items-center gap-3 py-2.5 px-2 rounded-lg ${r.isMe ? 'bg-indigo-50' : ''}`}>
                    <span className="w-8 text-center font-bold text-gray-400">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{r.name} {r.isMe && '(you)'}</p>
                    {r.rebirths > 0 && <span className="text-xs font-bold text-indigo-500">⭐{r.rebirths}</span>}
                    <span className="font-bold text-amber-600 text-sm">🪙 {fmtNum(r.lifetime)}</span>
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
            <p className="text-5xl mb-3">🌙⚔️</p>
            <h3 className="text-xl font-bold text-gray-800">Welcome back, champion!</h3>
            <p className="text-sm text-gray-500 mt-2">
              Your army kept fighting for {Math.round(offlineReport.seconds / 60)} minutes while you were away and plundered…
            </p>
            <p className="text-3xl font-bold text-amber-600 my-3">+{fmtNum(offlineReport.earned)} 🪙</p>
            <button onClick={() => setOfflineReport(null)} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
              To battle!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SweetEmpireGame;
