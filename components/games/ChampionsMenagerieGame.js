// components/games/ChampionsMenagerieGame.js
// ─────────────────────────────────────────────────────────────────────────────
// CHAMPION'S MENAGERIE 🐣 — hatch, raise and collect magical creatures.
//
// • Wild Essence is charged by REAL classroom XP — every XP earned in class
//   becomes essence for eggs, so classroom effort literally hatches creatures.
// • Eggs incubate in real time (they keep warming while you're offline).
// • Creatures are raised over days/weeks: feed (food energy that regenerates
//   in real time), play and train (per-creature cooldowns). They evolve
//   through five life stages: Hatchling → Juvenile → Adult → Elder → Mythic.
// • ~1-in-20 hatches are SHINY.
// • Equip a companion + earned titles — they appear on your Classroom
//   Champions class card and dashboard (see getMenagerieProfile).
// • Class tab: Hall of Beasts leaderboard + visit classmates' menageries.
//
// Saves to studentData.menagerieData via updateStudentData (Firestore-safe).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fmtInt,
  RARITIES, SPECIES, SPECIES_MAP,
  EGG_TIERS, EGG_TIER_MAP, EGG_IMAGES, INCUBATOR_SLOTS, SHINY_CHANCE, rollSpecies,
  STAGES, MAX_LEVEL, levelForXp, xpProgress, stageForLevel,
  FOOD_CAP, FOOD_REGEN_MINUTES, FEED_XP,
  PLAY_XP, PLAY_COOLDOWN_H, PLAY_ESSENCE,
  TRAIN_XP, TRAIN_COOLDOWN_H, TRAIN_ESSENCE,
  ESSENCE_PER_CLASS_XP, DAILY_GIFT_ESSENCE, DAILY_GIFT_FOOD,
  creatureScore, collectionScore, speciesDiscovered,
  MENAGERIE_TITLES, MENAGERIE_TITLE_MAP,
  defaultSave,
} from './Menagerie/menagerieConfig';

const now = () => Date.now();
const todayStr = () => new Date().toISOString().slice(0, 10);
const newUid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const REGEN_MS = FOOD_REGEN_MINUTES * 60 * 1000;

const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

// Firestore-safe clean of the save object (no undefined values, ever)
const cleanSave = (gs) => ({
  essence: Number(gs.essence) || 0,
  food: Number(gs.food) || 0,
  lastFoodAt: gs.lastFoodAt || null,
  lastXpSnapshot: gs.lastXpSnapshot === null || gs.lastXpSnapshot === undefined ? null : Number(gs.lastXpSnapshot),
  homesteadEssenceClaimed: Number(gs.homesteadEssenceClaimed) || 0,
  totalEssenceEarned: Number(gs.totalEssenceEarned) || 0,
  creatures: (gs.creatures || []).map((c) => ({
    uid: String(c.uid),
    speciesId: String(c.speciesId),
    shiny: !!c.shiny,
    xp: Number(c.xp) || 0,
    hatchedAt: c.hatchedAt || null,
    lastPlayedAt: Number(c.lastPlayedAt) || 0,
    lastTrainedAt: Number(c.lastTrainedAt) || 0,
  })),
  eggs: (gs.eggs || []).map((e) => ({
    uid: String(e.uid),
    tier: String(e.tier),
    hatchAt: Number(e.hatchAt) || 0,
  })),
  companionUid: gs.companionUid || null,
  eggsHatched: Number(gs.eggsHatched) || 0,
  careActions: Number(gs.careActions) || 0,
  lastGiftDay: gs.lastGiftDay || null,
  unlockedTitles: [...(gs.unlockedTitles || [])],
  activeTitle: gs.activeTitle || null,
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

const TABS = [
  { id: 'menagerie', name: 'Menagerie', icon: '🐾' },
  { id: 'hatchery', name: 'Hatchery', icon: '🥚' },
  { id: 'zoodex', name: 'Zoodex', icon: '📖' },
  { id: 'class', name: 'Class', icon: '👥' },
];

// Shiny creatures get a colour-shifted coat + sparkle
const shinyFilter = 'hue-rotate(45deg) saturate(1.7) brightness(1.05)';

// ═════════════════════════════════════════════════════════════════════════════
const ChampionsMenagerieGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [], onSwitchGame = null }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('menagerie');
  const [reveal, setReveal] = useState(null);        // hatch reveal modal { species, shiny }
  const [welcome, setWelcome] = useState(null);      // arrival report { essenceFromXp, gift }
  const [visitId, setVisitId] = useState(null);      // expanded classmate row
  const [, setTick] = useState(0);

  const gsRef = useRef(gs); gsRef.current = gs;
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const showToastRef = useRef(showToast); showToastRef.current = showToast;

  const score = useMemo(() => collectionScore(gs), [gs]);
  const species = useMemo(() => speciesDiscovered(gs), [gs]);

  // ── Load save: food regen + classroom-XP essence + daily gift ───────────────
  useEffect(() => {
    if (loaded) return;
    const raw = studentData?.menagerieData;
    let save = { ...defaultSave(), ...(raw || {}) };
    save.creatures = (raw?.creatures || []).map((c) => ({ ...c }));
    save.eggs = (raw?.eggs || []).map((e) => ({ ...e }));

    // Food regenerated while away
    const anchor = save.lastFoodAt ? new Date(save.lastFoodAt).getTime() : now();
    if (save.food < FOOD_CAP) {
      const gained = Math.floor((now() - anchor) / REGEN_MS);
      if (gained > 0) save.food = Math.min(FOOD_CAP, save.food + gained);
    }
    save.lastFoodAt = new Date().toISOString();

    // Classroom XP → Wild Essence (the incubator runs on learning!)
    const xpNow = Number(studentData?.totalPoints) || 0;
    let essenceFromXp = 0;
    if (save.lastXpSnapshot === null || save.lastXpSnapshot === undefined) {
      save.lastXpSnapshot = xpNow; // first visit: set the watermark, no award
    } else if (xpNow > save.lastXpSnapshot) {
      essenceFromXp = (xpNow - save.lastXpSnapshot) * ESSENCE_PER_CLASS_XP;
      save.essence += essenceFromXp;
      save.totalEssenceEarned += essenceFromXp;
      save.lastXpSnapshot = xpNow;
    }

    // Wild Essence earned out in the Wildwood Homestead (discoveries, level-ups…)
    const homesteadEarned = Number(studentData?.homesteadData?.menagerieEssenceEarned) || 0;
    let essenceFromHomestead = 0;
    if (homesteadEarned > (save.homesteadEssenceClaimed || 0)) {
      essenceFromHomestead = homesteadEarned - (save.homesteadEssenceClaimed || 0);
      save.essence += essenceFromHomestead;
      save.totalEssenceEarned += essenceFromHomestead;
    }
    save.homesteadEssenceClaimed = homesteadEarned;

    // Daily gift
    let gift = false;
    if (save.lastGiftDay !== todayStr()) {
      save.lastGiftDay = todayStr();
      save.essence += DAILY_GIFT_ESSENCE;
      save.totalEssenceEarned += DAILY_GIFT_ESSENCE;
      save.food = Math.min(FOOD_CAP, save.food + DAILY_GIFT_FOOD);
      gift = true;
    }

    setGs(save);
    setLoaded(true);
    dirtyRef.current = true;
    if (essenceFromXp > 0 || essenceFromHomestead > 0 || gift) setWelcome({ essenceFromXp, essenceFromHomestead, gift });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Live tick: food regen + countdowns (every 5s) ───────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      setTick((x) => x + 1);
      const cur = gsRef.current;
      const anchor = cur.lastFoodAt ? new Date(cur.lastFoodAt).getTime() : now();
      if (cur.food >= FOOD_CAP) {
        // keep the anchor fresh so no regen is banked while full
        if (now() - anchor > REGEN_MS) setGs((p) => ({ ...p, lastFoodAt: new Date().toISOString() }));
        return;
      }
      const gained = Math.floor((now() - anchor) / REGEN_MS);
      if (gained > 0) {
        setGs((p) => ({
          ...p,
          food: Math.min(FOOD_CAP, p.food + gained),
          lastFoodAt: new Date(anchor + gained * REGEN_MS).toISOString(),
        }));
        dirtyRef.current = true;
      }
    }, 5000);
    return () => clearInterval(t);
  }, [loaded]);

  // ── Title sweep (every 3s) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      const cur = gsRef.current;
      const fresh = MENAGERIE_TITLES.filter((ti) => !(cur.unlockedTitles || []).includes(ti.id) && ti.check(cur)).map((ti) => ti.id);
      if (fresh.length === 0) return;
      fresh.forEach((id) => showToastRef.current(`📛 Title unlocked: ${MENAGERIE_TITLE_MAP[id].name}! Equip it below your menagerie.`, 'success'));
      setGs((p) => ({ ...p, unlockedTitles: [...(p.unlockedTitles || []), ...fresh] }));
      dirtyRef.current = true;
    }, 3000);
    return () => clearInterval(t);
  }, [loaded]);

  // ── Autosave ────────────────────────────────────────────────────────────────
  const persist = useCallback(async () => {
    if (savingRef.current || !updateStudentData) return;
    savingRef.current = true;
    try {
      await updateStudentData({ menagerieData: cleanSave(gsRef.current) });
      dirtyRef.current = false;
    } catch (err) {
      console.error('ChampionsMenagerie: save failed', err);
    } finally {
      savingRef.current = false;
    }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 25000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  // ── Hatchery actions ────────────────────────────────────────────────────────
  const buyEgg = (tier) => {
    const cur = gsRef.current;
    if (cur.eggs.length >= INCUBATOR_SLOTS) { showToast('🥚 The incubator is full — hatch an egg first!', 'error'); return; }
    if (cur.essence < tier.cost) return;
    setGs((p) => ({
      ...p,
      essence: p.essence - tier.cost,
      eggs: [...p.eggs, { uid: newUid(), tier: tier.id, hatchAt: now() + tier.minutes * 60 * 1000 }],
    }));
    showToast(`${tier.icon} ${tier.name} is warming in the incubator!`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const hatchEgg = (egg) => {
    if (now() < egg.hatchAt) return;
    const sp = rollSpecies(egg.tier);
    const shiny = Math.random() < SHINY_CHANCE;
    const creature = {
      uid: newUid(),
      speciesId: sp.id,
      shiny,
      xp: 0,
      hatchedAt: new Date().toISOString(),
      lastPlayedAt: 0,
      lastTrainedAt: 0,
    };
    setGs((p) => ({
      ...p,
      eggs: p.eggs.filter((e) => e.uid !== egg.uid),
      creatures: [...p.creatures, creature],
      eggsHatched: (p.eggsHatched || 0) + 1,
      companionUid: p.companionUid || creature.uid, // first creature auto-becomes companion
    }));
    setReveal({ species: sp, shiny });
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Care actions ────────────────────────────────────────────────────────────
  const giveXp = (uid, amount, essenceGain = 0, extra = {}) => {
    const cur = gsRef.current;
    const c = cur.creatures.find((x) => x.uid === uid);
    if (!c) return;
    const before = stageForLevel(levelForXp(c.xp));
    const after = stageForLevel(levelForXp(c.xp + amount));
    setGs((p) => ({
      ...p,
      essence: p.essence + essenceGain,
      totalEssenceEarned: p.totalEssenceEarned + essenceGain,
      careActions: (p.careActions || 0) + 1,
      creatures: p.creatures.map((x) => (x.uid === uid ? { ...x, xp: x.xp + amount, ...extra } : x)),
    }));
    if (after.index > before.index) {
      const sp = SPECIES_MAP[c.speciesId];
      showToast(`🌟 ${sp?.name || 'Your creature'} evolved into ${after.name === 'Mythic' ? 'a MYTHIC' : `a ${after.name}`}!`, 'success');
    }
    dirtyRef.current = true;
  };

  const feed = (c) => {
    const cur = gsRef.current;
    if (cur.food < 1) { showToast('🍖 No food left — it regenerates over time (1 every 4 min)!', 'error'); return; }
    if (levelForXp(c.xp) >= MAX_LEVEL) return;
    setGs((p) => ({ ...p, food: p.food - 1, lastFoodAt: p.food >= FOOD_CAP ? new Date().toISOString() : p.lastFoodAt }));
    giveXp(c.uid, FEED_XP);
  };

  const play = (c) => {
    if (now() - (c.lastPlayedAt || 0) < PLAY_COOLDOWN_H * 3600 * 1000) return;
    giveXp(c.uid, PLAY_XP, PLAY_ESSENCE, { lastPlayedAt: now() });
    showToast(`🎾 Playtime! +${PLAY_XP} XP and +${PLAY_ESSENCE} essence.`, 'success');
  };

  const train = (c) => {
    if (now() - (c.lastTrainedAt || 0) < TRAIN_COOLDOWN_H * 3600 * 1000) return;
    giveXp(c.uid, TRAIN_XP, TRAIN_ESSENCE, { lastTrainedAt: now() });
    showToast(`🏋️ Training complete! +${TRAIN_XP} XP and +${TRAIN_ESSENCE} essence.`, 'success');
  };

  const setCompanion = (uid) => {
    setGs((p) => ({ ...p, companionUid: p.companionUid === uid ? null : uid }));
    dirtyRef.current = true;
    setTimeout(persist, 400);
    showToast('⭐ Companion updated — check your class card!', 'success');
  };

  const equipTitle = (id) => {
    setGs((p) => ({ ...p, activeTitle: p.activeTitle === id ? null : id }));
    dirtyRef.current = true;
    setTimeout(persist, 400);
    showToast('📛 Title updated — it shows on your profile!', 'success');
  };

  // ── Render helpers ──────────────────────────────────────────────────────────
  const renderCreatureImg = (c, sp, sizeCls, aura) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sp.img}
      alt={sp.name}
      draggable={false}
      className={`${sizeCls} object-cover rounded-2xl`}
      style={{ filter: [c.shiny ? shinyFilter : '', aura].filter(Boolean).join(' ') || undefined }}
    />
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <style>{`
        @keyframes cm-wiggle { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
        @keyframes cm-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes cm-sparkle { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🐣 Champion&apos;s Menagerie</h1>
            <p className="text-white/85 text-sm">Your learning hatches legends — every classroom XP charges the incubator!</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold drop-shadow">✨ {fmtInt(gs.essence)}</p>
            <p className="text-white/85 text-sm font-semibold">Wild Essence</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-white/20 rounded-full px-3 py-1">🍖 {gs.food}/{FOOD_CAP} food</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🐾 {gs.creatures.length} creature{gs.creatures.length !== 1 ? 's' : ''}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">📖 {species}/{SPECIES.length} species</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏆 {fmtInt(score)} collection score</span>
          {gs.creatures.some((c) => c.shiny) && <span className="bg-white/20 rounded-full px-3 py-1">✨ shiny owner!</span>}
        </div>
        {onSwitchGame && (
          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-bold">
            <span className="text-white/60">Linked worlds:</span>
            <button onClick={() => onSwitchGame('sweet-empire')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Strike the forge — essence flows back to your creatures!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Loot/Weapons/1.png" alt="" className="w-4 h-4 object-contain" />
              Champion&apos;s Forge
            </button>
            <button onClick={() => onSwitchGame('wildwood-homestead')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Your companion lends its talents in the Wildwood, and discoveries there earn essence!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game icons/Wildwood/Camping/001-fire.svg" alt="" className="w-4 h-4 object-contain" />
              Wildwood Homestead
            </button>
            <button onClick={() => onSwitchGame('town-square')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Walk over to Town Square — trade with classmates and challenge them to minigames!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/game-logos/Town Square.svg" alt="" className="w-4 h-4 object-contain rounded-full" />
              Town Square
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
              tab === t.id ? 'bg-emerald-600 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50'
            }`}
          >
            {t.icon} {t.name}
            {t.id === 'hatchery' && gs.eggs.some((e) => now() >= e.hatchAt) && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 animate-pulse">!</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ MENAGERIE TAB ══ */}
      {tab === 'menagerie' && (
        <div className="space-y-4">
          {gs.creatures.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <p className="text-5xl mb-3">🥚</p>
              <p className="font-bold text-gray-700">Your menagerie is empty… for now!</p>
              <p className="text-sm text-gray-500 mt-1">Head to the Hatchery and warm your first egg. You start with enough essence for a Meadow Egg.</p>
              <button onClick={() => setTab('hatchery')} className="mt-4 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition">
                🥚 To the Hatchery
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gs.creatures.map((c) => {
                const sp = SPECIES_MAP[c.speciesId];
                if (!sp) return null;
                const prog = xpProgress(c.xp);
                const stage = stageForLevel(prog.level);
                const rar = RARITIES[sp.rarity];
                const playReady = now() - (c.lastPlayedAt || 0) >= PLAY_COOLDOWN_H * 3600 * 1000;
                const trainReady = now() - (c.lastTrainedAt || 0) >= TRAIN_COOLDOWN_H * 3600 * 1000;
                const isCompanion = gs.companionUid === c.uid;
                const maxed = prog.level >= MAX_LEVEL;
                return (
                  <div key={c.uid} className={`bg-white rounded-2xl border-2 shadow-sm p-4 flex flex-col items-center relative ${isCompanion ? 'border-amber-400 shadow-amber-200/60 shadow-lg' : 'border-gray-200'}`}>
                    {isCompanion && <span className="absolute top-2 left-2 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">⭐ Companion</span>}
                    {c.shiny && <span className="absolute top-2 right-2 text-lg" style={{ animation: 'cm-sparkle 1.2s ease-in-out infinite' }}>✨</span>}
                    <div style={{ animation: maxed ? 'cm-bounce 1.6s ease-in-out infinite' : undefined }}>
                      {renderCreatureImg(c, sp, stage.size, stage.aura)}
                    </div>
                    <p className="font-bold text-gray-800 mt-2">{c.shiny && '✨ '}{sp.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${rar.chip}`}>{rar.name}</span>
                      <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${stage.badge}`}>{stage.name} · Lv {prog.level}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                        style={{ width: maxed ? '100%' : `${Math.round((prog.into / prog.needed) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{maxed ? 'MAX LEVEL — a true Mythic!' : `${prog.into}/${prog.needed} XP to Lv ${prog.level + 1}`}</p>
                    <div className="grid grid-cols-3 gap-1.5 w-full mt-2.5">
                      <button
                        onClick={() => feed(c)}
                        disabled={gs.food < 1 || maxed}
                        className="text-xs font-bold rounded-lg py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-40 transition"
                        title={`+${FEED_XP} XP (1 food)`}
                      >
                        🍖 Feed
                      </button>
                      <button
                        onClick={() => play(c)}
                        disabled={!playReady || maxed}
                        className="text-xs font-bold rounded-lg py-1.5 bg-sky-100 text-sky-700 hover:bg-sky-200 disabled:opacity-40 transition"
                        title={`+${PLAY_XP} XP, +${PLAY_ESSENCE} essence`}
                      >
                        {playReady ? '🎾 Play' : `⏳ ${fmtCountdown(PLAY_COOLDOWN_H * 3600 * 1000 - (now() - (c.lastPlayedAt || 0)))}`}
                      </button>
                      <button
                        onClick={() => train(c)}
                        disabled={!trainReady || maxed}
                        className="text-xs font-bold rounded-lg py-1.5 bg-violet-100 text-violet-700 hover:bg-violet-200 disabled:opacity-40 transition"
                        title={`+${TRAIN_XP} XP, +${TRAIN_ESSENCE} essence`}
                      >
                        {trainReady ? '🏋️ Train' : `⏳ ${fmtCountdown(TRAIN_COOLDOWN_H * 3600 * 1000 - (now() - (c.lastTrainedAt || 0)))}`}
                      </button>
                    </div>
                    <button
                      onClick={() => setCompanion(c.uid)}
                      className={`w-full mt-1.5 text-xs font-bold rounded-lg py-1.5 transition ${isCompanion ? 'bg-amber-400 text-amber-900' : 'bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-700'}`}
                    >
                      {isCompanion ? '⭐ On your class card!' : '☆ Make card companion'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Titles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-1">📛 Keeper Titles</h3>
            <p className="text-xs text-gray-500 mb-3">Earn titles by growing your menagerie — the equipped one shows on your class card and dashboard.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {MENAGERIE_TITLES.map((t) => {
                const unlocked = (gs.unlockedTitles || []).includes(t.id);
                const active = gs.activeTitle === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => unlocked && equipTitle(t.id)}
                    disabled={!unlocked}
                    className={`text-left rounded-xl border-2 p-2.5 transition ${
                      active ? 'border-emerald-400 bg-emerald-50 shadow' : unlocked ? 'border-gray-200 bg-white hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <p className={`font-bold text-sm ${t.color}`}>{t.name} {active && '· ON'}</p>
                    <p className="text-[11px] text-gray-500">{unlocked ? (active ? 'Tap to unequip' : 'Tap to equip') : `🔒 ${t.reqText}`}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ HATCHERY TAB ══ */}
      {tab === 'hatchery' && (
        <div className="space-y-4">
          {/* Incubator */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">🔥 Incubator ({gs.eggs.length}/{INCUBATOR_SLOTS} slots)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {gs.eggs.map((egg) => {
                const tier = EGG_TIER_MAP[egg.tier];
                const ready = now() >= egg.hatchAt;
                const total = (tier?.minutes || 20) * 60 * 1000;
                const pct = Math.min(100, Math.round(((total - Math.max(0, egg.hatchAt - now())) / total) * 100));
                return (
                  <div key={egg.uid} className={`rounded-xl border-2 p-4 flex items-center gap-4 ${ready ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ready ? EGG_IMAGES.cracked : EGG_IMAGES.whole}
                      alt={tier?.name || 'Egg'}
                      className="w-16 h-16 object-contain"
                      style={{ animation: ready ? 'cm-wiggle 0.4s ease-in-out infinite' : undefined }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{tier?.icon} {tier?.name}</p>
                      {ready ? (
                        <button onClick={() => hatchEgg(egg)} className="mt-1.5 bg-amber-500 text-white text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-amber-600 animate-pulse transition">
                          🐣 HATCH IT!
                        </button>
                      ) : (
                        <>
                          <div className="w-full bg-white rounded-full h-2 border border-gray-200 mt-1.5">
                            <div className={`h-full rounded-full bg-gradient-to-r ${tier?.grad || 'from-gray-300 to-gray-400'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">Hatches in {fmtCountdown(egg.hatchAt - now())} (keeps warming while you&apos;re away)</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, INCUBATOR_SLOTS - gs.eggs.length) }).map((_, i) => (
                <div key={`empty_${i}`} className="rounded-xl border-2 border-dashed border-gray-200 p-4 flex items-center justify-center text-gray-300 text-sm font-bold min-h-[96px]">
                  Empty nest — buy an egg below
                </div>
              ))}
            </div>
          </div>

          {/* Egg shop */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-1">🛒 Egg Dealer</h3>
            <p className="text-xs text-gray-500 mb-3">
              Wild Essence comes from YOUR learning: every classroom XP you earn becomes ✨{ESSENCE_PER_CLASS_XP} essence — plus a daily visit gift, bonus essence for playing with and training your creatures, and essence gathered on your Wildwood Homestead adventures 🏕️.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {EGG_TIERS.map((tier) => {
                const afford = gs.essence >= tier.cost;
                const slots = gs.eggs.length < INCUBATOR_SLOTS;
                return (
                  <div key={tier.id} className="rounded-xl border border-gray-200 p-3 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${tier.grad} flex items-center justify-center text-2xl shadow`}>{tier.icon}</div>
                    <p className="font-bold text-gray-800 text-sm mt-2">{tier.name}</p>
                    <p className="text-[10px] text-gray-500">{tier.minutes >= 60 ? `${Math.round(tier.minutes / 60)}h` : `${tier.minutes}min`} incubation</p>
                    <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                      {Object.entries(tier.weights).map(([r, w]) => (
                        <span key={r} className={`text-[9px] font-bold rounded-full px-1.5 py-0.5 ${RARITIES[r].chip}`}>{RARITIES[r].name} {w}%</span>
                      ))}
                    </div>
                    <button
                      onClick={() => buyEgg(tier)}
                      disabled={!afford || !slots}
                      className="w-full mt-2 bg-emerald-600 text-white text-sm font-bold rounded-lg py-1.5 hover:bg-emerald-700 disabled:opacity-40 transition"
                    >
                      ✨ {fmtInt(tier.cost)}
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">✨ Every egg has a 1-in-20 chance of hatching a SHINY — a colour-shifted creature worth triple collection score!</p>
          </div>
        </div>
      )}

      {/* ══ ZOODEX TAB ══ */}
      {tab === 'zoodex' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-1">📖 Zoodex — {species}/{SPECIES.length} discovered</h3>
          <p className="text-xs text-gray-500 mb-4">Every species you hatch is recorded forever. Can you complete the Zoodex?</p>
          {Object.keys(RARITIES).map((rarKey) => {
            const list = SPECIES.filter((s) => s.rarity === rarKey);
            const rar = RARITIES[rarKey];
            const owned = new Set(gs.creatures.map((c) => c.speciesId));
            return (
              <div key={rarKey} className="mb-4">
                <h4 className={`text-xs font-bold uppercase tracking-wide mb-2 ${rar.color}`}>{rar.name} — {list.filter((s) => owned.has(s.id)).length}/{list.length}</h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-2">
                  {list.map((sp) => {
                    const found = owned.has(sp.id);
                    const shinyOwned = gs.creatures.some((c) => c.speciesId === sp.id && c.shiny);
                    return (
                      <div key={sp.id} className={`rounded-xl border p-1.5 text-center ${found ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50'}`} title={found ? sp.desc : 'Not discovered yet'}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.img}
                          alt={found ? sp.name : '???'}
                          draggable={false}
                          className="w-full aspect-square object-cover rounded-lg"
                          style={found ? (shinyOwned ? { filter: shinyFilter } : undefined) : { filter: 'brightness(0) opacity(0.15)' }}
                        />
                        <p className={`text-[10px] font-bold mt-1 truncate ${found ? 'text-gray-700' : 'text-gray-300'}`}>{found ? `${shinyOwned ? '✨' : ''}${sp.name}` : '???'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ CLASS TAB ══ */}
      {tab === 'class' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-1">👥 Hall of Beasts — collection score</h3>
          <p className="text-xs text-gray-500 mb-3">Tap a classmate to visit their menagerie!</p>
          {(() => {
            const rows = [...(classmates || [])].map((s) => ({
              id: s.id,
              name: `${s.firstName || '?'} ${s.lastName?.charAt(0) || ''}`,
              data: s.menagerieData || null,
              isMe: s.id === studentData?.id,
            }));
            if (!rows.some((r) => r.isMe) && studentData) {
              rows.push({ id: studentData.id, name: `${studentData.firstName || 'You'}`, data: gs, isMe: true });
            } else {
              const me = rows.find((r) => r.isMe);
              if (me) me.data = gs;
            }
            const scored = rows.map((r) => ({
              ...r,
              score: collectionScore(r.data),
              species: speciesDiscovered(r.data),
              shinies: (r.data?.creatures || []).filter((c) => c.shiny).length,
            })).sort((a, b) => b.score - a.score);

            return scored.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No classmates found yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {scored.slice(0, 30).map((r, i) => (
                  <div key={r.id || i}>
                    <button
                      onClick={() => setVisitId(visitId === r.id ? null : r.id)}
                      className={`w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left transition hover:bg-emerald-50 ${r.isMe ? 'bg-emerald-50' : ''}`}
                    >
                      <span className="w-8 text-center font-bold text-gray-400">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{r.name} {r.isMe && '(you)'}</p>
                      <span className="text-xs font-bold text-gray-400">🐾 {(r.data?.creatures || []).length}</span>
                      {r.shinies > 0 && <span className="text-xs font-bold text-fuchsia-500">✨ {r.shinies}</span>}
                      <span className="font-bold text-emerald-600 text-sm">🏆 {fmtInt(r.score)}</span>
                    </button>
                    {visitId === r.id && (
                      <div className="px-3 pb-3">
                        {(r.data?.creatures || []).length === 0 ? (
                          <p className="text-xs text-gray-400 py-2">Their menagerie is still empty.</p>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2 mt-1">
                            {(r.data.creatures || []).map((c) => {
                              const sp = SPECIES_MAP[c.speciesId];
                              if (!sp) return null;
                              const lvl = levelForXp(c.xp);
                              const st = stageForLevel(lvl);
                              return (
                                <div key={c.uid} className="text-center" title={`${sp.name} — ${st.name} Lv ${lvl}${c.shiny ? ' ✨SHINY' : ''}`}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={sp.img}
                                    alt={sp.name}
                                    draggable={false}
                                    className={`w-full aspect-square object-cover rounded-lg ${r.data.companionUid === c.uid ? 'ring-2 ring-amber-400' : ''}`}
                                    style={{ filter: [c.shiny ? shinyFilter : '', st.aura].filter(Boolean).join(' ') || undefined }}
                                  />
                                  <p className="text-[9px] font-bold text-gray-500 truncate">{c.shiny && '✨'}{sp.name}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Hatch reveal modal ── */}
      {reveal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setReveal(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">The egg hatches…</p>
            <div className="my-4 flex justify-center" style={{ animation: 'cm-bounce 1.2s ease-in-out infinite' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reveal.species.img}
                alt={reveal.species.name}
                className="w-36 h-36 object-cover rounded-3xl shadow-lg"
                style={{ filter: reveal.shiny ? shinyFilter : undefined }}
              />
            </div>
            {reveal.shiny && <p className="text-fuchsia-500 font-bold text-lg animate-pulse">✨ IT&apos;S SHINY! ✨</p>}
            <h3 className="text-2xl font-bold text-gray-800">{reveal.species.name}</h3>
            <p className={`text-sm font-bold ${RARITIES[reveal.species.rarity].color}`}>{RARITIES[reveal.species.rarity].name}</p>
            <p className="text-sm text-gray-500 italic mt-2">“{reveal.species.desc}”</p>
            <button onClick={() => setReveal(null)} className="mt-5 bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition">
              Welcome to the menagerie!
            </button>
          </div>
        </div>
      )}

      {/* ── Arrival report modal ── */}
      {welcome && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setWelcome(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-4xl mb-2">🌿</p>
            <h3 className="text-xl font-bold text-gray-800">Welcome back, Keeper!</h3>
            {welcome.essenceFromXp > 0 && (
              <p className="text-sm text-gray-600 mt-3">
                Your classroom learning charged the incubator:
                <span className="block text-2xl font-bold text-emerald-600 mt-1">+{fmtInt(welcome.essenceFromXp)} ✨ Wild Essence</span>
                <span className="block text-[11px] text-gray-400 mt-0.5">(earned from the XP you gained in class)</span>
              </p>
            )}
            {welcome.essenceFromHomestead > 0 && (
              <p className="text-sm text-gray-600 mt-3">
                Your Wildwood Homestead adventures gathered:
                <span className="block text-xl font-bold text-green-700 mt-1">+{fmtInt(welcome.essenceFromHomestead)} ✨ Wild Essence</span>
                <span className="block text-[11px] text-gray-400 mt-0.5">(from discoveries, level-ups, golden harvests and new dishes 🏕️)</span>
              </p>
            )}
            {welcome.gift && (
              <p className="text-sm text-gray-600 mt-3">
                Daily care package: <span className="font-bold text-emerald-600">+{DAILY_GIFT_ESSENCE} ✨</span> and <span className="font-bold text-orange-600">+{DAILY_GIFT_FOOD} 🍖</span>
              </p>
            )}
            <button onClick={() => setWelcome(null)} className="mt-5 bg-emerald-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition">
              To the creatures!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChampionsMenagerieGame;
