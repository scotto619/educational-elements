// components/games/WildwoodHomesteadGame.js
// ─────────────────────────────────────────────────────────────────────────────
// WILDWOOD HOMESTEAD 🏕️ — survival-crafting incremental (replaces Cozy Cottage)
//
// • CLICK to chop, mine and forage — tool tiers + skill levels + node respawns.
// • FISH with a cast → wait → bite-window reflex catch. Legendary fish exist.
// • FARM crops, SMELT bars and COOK buff meals in real time (offline too).
// • Wood is FUEL: the kitchen and smelter burn the logs you chop.
// • Recipes are known, levelled into, or found on rare Recipe Scrolls.
// • Rare curios (ambers, gems, star fragments…) fill your Curio Shelf.
// • BUILD a homestead on a tile grid — decor gives Prosperity (and buffs).
// • CROSS-GAME: your Champion's Forge weapon boosts chopping/mining, and your
//   Menagerie companion lends a family bonus.
// • Anti-autoclicker: impossible click rates leave you Exhausted for a rest.
//
// Saves to studentData.homesteadData via updateStudentData (Firestore-safe).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fmtQty, ITEMS, RARE_IDS,
  ZONES, NODES,
  FISH_TABLE, FISH_WAIT_MIN_S, FISH_WAIT_MAX_S, FISH_BITE_WINDOW_MS,
  TOOL_TIERS, TOOL_DEFS, TOOL_COSTS, TOOL_LEVEL_REQ,
  SKILLS, skillLevel, skillProgress,
  FARM_BASE_PLOTS, CROPS, CROP_BY_SEED, GOLDEN_CROP_CHANCE,
  SMELT_SLOTS, SMELT_RECIPES,
  KITCHEN_TIERS, BUFF_LABELS, RECIPES, RECIPE_MAP, SCROLL_RECIPES, MAX_ACTIVE_BUFFS,
  CRAFTS, CRAFT_MAP, GRID_COLS, GRID_ROWS,
  prosperityOf, totalSkillLevel, HOMESTEAD_TITLES, HOMESTEAD_TITLE_MAP,
  defaultSave,
} from './Homestead/homesteadConfig';
import { forgeStageFor } from './SweetEmpire/sweetEmpireConfig';
import { SPECIES_MAP as MENAGERIE_SPECIES, levelForXp as menLevelForXp } from './Menagerie/menagerieConfig';

const now = () => Date.now();
const rand = (a, b) => a + Math.random() * (b - a);

const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

// Companion family → homestead bonus (read from Menagerie save, never written)
const COMPANION_BONUSES = {
  Tide:      { label: '+12% fishing luck & quick bites', buffs: { fishLuck: 12, fishFast: 12 } },
  Meadow:    { label: '+10% double drops',               buffs: { doubleDrop: 10 } },
  Wilds:     { label: '+10% gathering power',            buffs: { gatherSpeed: 10 } },
  Clockwork: { label: '+18% helper output',              buffs: { autoBoost: 18 } },
  Elemental: { label: '+18% smelting speed',             buffs: { smeltFast: 18 } },
  Cosmic:    { label: '+6% rare find luck',              buffs: { rareLuck: 6 } },
  Mythic:    { label: '+12% skill XP',                   buffs: { xpBoost: 12 } },
  Golden:    { label: '+9% rare find luck',              buffs: { rareLuck: 9 } },
};

// Firestore-safe clean of the save object
const cleanSave = (gs) => ({
  inv: Object.fromEntries(Object.entries(gs.inv || {}).filter(([, v]) => (Number(v) || 0) > 0).map(([k, v]) => [k, Math.floor(Number(v) || 0)])),
  gold: Math.floor(Number(gs.gold) || 0),
  skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, Number(gs.skills?.[k]) || 0])),
  tools: { axe: Number(gs.tools?.axe) || 0, pick: Number(gs.tools?.pick) || 0, rod: Number(gs.tools?.rod) || 0 },
  crafted: [...(gs.crafted || [])],
  grid: (gs.grid || []).map((g) => ({ slot: Number(g.slot) || 0, craftId: String(g.craftId) })),
  farm: (gs.farm || []).map((f) => ({ plot: Number(f.plot) || 0, seedId: String(f.seedId), readyAt: Number(f.readyAt) || 0 })),
  smelting: (gs.smelting || []).map((s) => ({ slot: Number(s.slot) || 0, barId: String(s.barId), doneAt: Number(s.doneAt) || 0 })),
  knownRecipes: [...(gs.knownRecipes || [])],
  unreadScrolls: Number(gs.unreadScrolls) || 0,
  activeBuffs: (gs.activeBuffs || []).filter((b) => (b.until || 0) > now()).map((b) => ({
    recipeId: String(b.recipeId), type: String(b.type), value: Number(b.value) || 0, until: Number(b.until) || 0,
  })),
  autoCollectAt: Object.fromEntries(Object.entries(gs.autoCollectAt || {}).map(([k, v]) => [k, Number(v) || 0])),
  discoveredRares: [...(gs.discoveredRares || [])],
  caughtFish: [...(gs.caughtFish || [])],
  cookedDishes: [...(gs.cookedDishes || [])],
  counters: {
    chops: Number(gs.counters?.chops) || 0,
    mines: Number(gs.counters?.mines) || 0,
    casts: Number(gs.counters?.casts) || 0,
    forages: Number(gs.counters?.forages) || 0,
    cooks: Number(gs.counters?.cooks) || 0,
    crafts: Number(gs.counters?.crafts) || 0,
  },
  menagerieEssenceEarned: Number(gs.menagerieEssenceEarned) || 0,
  unlockedTitles: [...(gs.unlockedTitles || [])],
  activeTitle: gs.activeTitle || null,
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

const TABS = [
  { id: 'gather', name: 'Gather', icon: '🌲' },
  { id: 'farm', name: 'Farm', icon: '🌾' },
  { id: 'craft', name: 'Craft', icon: '🛠️' },
  { id: 'cook', name: 'Kitchen', icon: '🍳' },
  { id: 'home', name: 'Homestead', icon: '🏕️' },
  { id: 'class', name: 'Class', icon: '👥' },
];

// ═════════════════════════════════════════════════════════════════════════════
const WildwoodHomesteadGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [] }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('gather');
  const [zone, setZone] = useState('forest');
  const [nodeState, setNodeState] = useState({});       // { key: { hitsLeft, stock, respawnAt } } (session-only)
  const [fishing, setFishing] = useState({ phase: 'idle' }); // idle | waiting | bite
  const [exhaustedUntil, setExhaustedUntil] = useState(0);
  const [rareFind, setRareFind] = useState(null);       // modal { itemId }
  const [newRecipe, setNewRecipe] = useState(null);     // modal { recipeId }
  const [placeMode, setPlaceMode] = useState(null);     // decor craftId being placed
  const [visitId, setVisitId] = useState(null);
  const [, setTick] = useState(0);

  const gsRef = useRef(gs); gsRef.current = gs;
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const showToastRef = useRef(showToast); showToastRef.current = showToast;
  const clickTimesRef = useRef([]);
  const exhaustedRef = useRef(0);
  const nodeStateRef = useRef({}); nodeStateRef.current = nodeState;
  const fishTimerRef = useRef(null);
  const fishingRef = useRef(fishing); fishingRef.current = fishing;

  // ── Cross-game bonuses (read-only peeks at the other games' saves) ─────────
  const forgeBonus = useMemo(() => {
    const sed = studentData?.sweetEmpireData;
    if (!sed) return { power: 0, stageName: null };
    const stage = forgeStageFor(sed);
    return { power: stage.index * 0.5, stageName: stage.index > 0 ? stage.name : null };
  }, [studentData?.sweetEmpireData]);

  const companionBonus = useMemo(() => {
    const md = studentData?.menagerieData;
    if (!md?.companionUid) return null;
    const comp = (md.creatures || []).find((c) => c.uid === md.companionUid);
    const sp = comp ? MENAGERIE_SPECIES[comp.speciesId] : null;
    if (!sp) return null;
    const bonus = COMPANION_BONUSES[sp.family];
    if (!bonus) return null;
    return { name: sp.name, img: sp.img, shiny: !!comp.shiny, level: menLevelForXp(comp.xp), family: sp.family, ...bonus };
  }, [studentData?.menagerieData]);

  // Aggregate a buff type: meals + decor effects + companion
  const buffVal = useCallback((type) => {
    const cur = gsRef.current;
    let v = 0;
    (cur.activeBuffs || []).forEach((b) => { if (b.type === type && b.until > now()) v += b.value; });
    (cur.crafted || []).forEach((id) => { const e = CRAFT_MAP[id]?.effect; if (e && e[type]) v += e[type]; });
    if (companionBonus?.buffs?.[type]) v += companionBonus.buffs[type];
    return v;
  }, [companionBonus]);

  const prosperity = useMemo(() => prosperityOf(gs), [gs]);
  const kitchenTier = gs.crafted.includes('kitchen') ? 2 : gs.crafted.includes('stove') ? 1 : 0;
  const farmPlots = FARM_BASE_PLOTS + (gs.crafted || []).reduce((n, id) => n + (CRAFT_MAP[id]?.plots || 0), 0);
  const fuelUnits = useMemo(
    () => Object.entries(gs.inv || {}).reduce((s, [id, q]) => s + (ITEMS[id]?.burn || 0) * q, 0),
    [gs.inv]
  );

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const raw = studentData?.homesteadData;
    const save = { ...defaultSave(), ...(raw || {}) };
    save.inv = { ...(raw?.inv || defaultSave().inv) };
    save.skills = { ...defaultSave().skills, ...(raw?.skills || {}) };
    save.tools = { ...defaultSave().tools, ...(raw?.tools || {}) };
    save.counters = { ...defaultSave().counters, ...(raw?.counters || {}) };
    save.farm = (raw?.farm || []).map((f) => ({ ...f }));
    save.smelting = (raw?.smelting || []).map((s) => ({ ...s }));
    save.grid = (raw?.grid || []).map((g) => ({ ...g }));
    save.activeBuffs = (raw?.activeBuffs || []).filter((b) => (b.until || 0) > now());
    setGs(save);
    setLoaded(true);
    dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Ticker (1s — countdowns, respawns, buff expiry) ────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [loaded]);

  // ── Title sweep ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => {
      const cur = gsRef.current;
      const fresh = HOMESTEAD_TITLES.filter((ti) => !(cur.unlockedTitles || []).includes(ti.id) && ti.check(cur)).map((ti) => ti.id);
      if (fresh.length === 0) return;
      fresh.forEach((id) => showToastRef.current(`📛 Title unlocked: ${HOMESTEAD_TITLE_MAP[id].name}!`, 'success'));
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
      await updateStudentData({ homesteadData: cleanSave(gsRef.current) });
      dirtyRef.current = false;
    } catch (err) {
      console.error('WildwoodHomestead: save failed', err);
    } finally {
      savingRef.current = false;
    }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 25000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  useEffect(() => () => clearTimeout(fishTimerRef.current), []);

  // ── Inventory helpers ───────────────────────────────────────────────────────
  const invCount = (id) => Math.floor(gsRef.current.inv?.[id] || 0);
  const addItems = (changes) => {
    setGs((p) => {
      const inv = { ...p.inv };
      Object.entries(changes).forEach(([id, d]) => { inv[id] = Math.max(0, (inv[id] || 0) + d); if (inv[id] === 0) delete inv[id]; });
      return { ...p, inv };
    });
    dirtyRef.current = true;
  };
  const hasItems = (req) => Object.entries(req || {}).every(([id, q]) => q === 0 || invCount(id) >= q);

  // Consume `units` of fuel using the lowest-burn wood first. Returns false if short.
  const consumeFuel = (units) => {
    const cur = gsRef.current;
    const woods = Object.keys(cur.inv || {})
      .filter((id) => ITEMS[id]?.burn)
      .sort((a, b) => ITEMS[a].burn - ITEMS[b].burn);
    let need = units;
    const spend = {};
    for (const id of woods) {
      if (need <= 0) break;
      const take = Math.min(cur.inv[id], Math.ceil(need / ITEMS[id].burn));
      spend[id] = -take;
      need -= take * ITEMS[id].burn;
    }
    if (need > 0) return false;
    addItems(spend);
    return true;
  };

  // Wild Essence flows back to Champion's Menagerie (claimed next time it's opened)
  const earnMenagerieEssence = (amount, reason) => {
    setGs((p) => ({ ...p, menagerieEssenceEarned: (p.menagerieEssenceEarned || 0) + amount }));
    showToastRef.current(`✨ ${reason} +${amount} Wild Essence sent to your Menagerie!`, 'success');
    dirtyRef.current = true;
  };

  const gainSkillXp = (skill, amount) => {
    const boosted = Math.round(amount * (1 + buffVal('xpBoost') / 100));
    const before = skillLevel(gsRef.current.skills?.[skill] || 0);
    setGs((p) => ({ ...p, skills: { ...p.skills, [skill]: (p.skills?.[skill] || 0) + boosted } }));
    const after = skillLevel((gsRef.current.skills?.[skill] || 0) + boosted);
    if (after > before) {
      showToast(`⬆️ ${SKILLS[skill].name} level ${after}!`, 'success');
      earnMenagerieEssence(10, `${SKILLS[skill].name} level up!`);
    }
    dirtyRef.current = true;
  };

  const foundRare = (itemId) => {
    addItems({ [itemId]: 1 });
    const cur = gsRef.current;
    if (!(cur.discoveredRares || []).includes(itemId)) {
      setGs((p) => ({ ...p, discoveredRares: [...(p.discoveredRares || []), itemId] }));
      setRareFind({ itemId });
      earnMenagerieEssence(40, `${ITEMS[itemId].name} discovered!`);
    } else {
      showToast(`${ITEMS[itemId].icon} Another ${ITEMS[itemId].name}!`, 'success');
    }
  };

  const rollRares = (rares) => {
    const luck = 1 + buffVal('rareLuck') / 100;
    rares.forEach((r) => {
      if (Math.random() < r.chance * luck) {
        if (r.id === 'recipe_scroll') {
          setGs((p) => ({ ...p, unreadScrolls: (p.unreadScrolls || 0) + 1 }));
          showToast('📜 You found a Recipe Scroll! Read it in the Kitchen.', 'success');
        } else if (ITEMS[r.id]?.kind === 'rare') {
          foundRare(r.id);
        } else {
          addItems({ [r.id]: 1 });
          showToast(`${ITEMS[r.id].icon} Bonus find: ${ITEMS[r.id].name}!`, 'success');
        }
      }
    });
  };

  // ── Anti-autoclicker (same guard as Champion's Forge) ──────────────────────
  const registerStrike = () => {
    const t = now();
    if (exhaustedRef.current > t) return false;
    const times = clickTimesRef.current;
    times.push(t);
    if (times.length > 30) times.shift();
    if (times.length === 30 && t - times[0] < 2000) {
      exhaustedRef.current = t + 15000;
      setExhaustedUntil(exhaustedRef.current);
      clickTimesRef.current = [];
      showToastRef.current('😮‍💨 Whoa — nobody swings THAT fast! You need a 15s breather…', 'error');
      return false;
    }
    return true;
  };

  // ── Gathering ───────────────────────────────────────────────────────────────
  const toolPower = (toolId) => {
    if (!toolId) return 1 + buffVal('gatherSpeed') / 100 + forgeBonus.power * 0.5;
    const tier = TOOL_TIERS[gsRef.current.tools?.[toolId] || 0];
    return (tier?.power || 1) * (1 + buffVal('gatherSpeed') / 100) + forgeBonus.power;
  };

  const clicksNeeded = (node, toolId) => Math.max(1, Math.ceil(node.hardness / toolPower(toolId)));

  const strikeNode = (zoneDef, node) => {
    if (!registerStrike()) return;
    const skill = zoneDef.skill;
    const lvl = skillLevel(gsRef.current.skills?.[skill] || 0);
    if (lvl < node.level) return;
    const key = `${zoneDef.id}_${node.id}`;
    const st = nodeStateRef.current[key] || { stock: node.stock, hitsLeft: clicksNeeded(node, zoneDef.tool), respawnAt: 0 };
    if (st.respawnAt > now()) return;

    if (st.hitsLeft > 1) {
      const next = { ...st, hitsLeft: st.hitsLeft - 1 };
      nodeStateRef.current = { ...nodeStateRef.current, [key]: next };
      setNodeState(nodeStateRef.current);
      return;
    }
    // Yield!
    const dbl = Math.random() < buffVal('doubleDrop') / 100;
    addItems({ [node.yieldId]: dbl ? 2 : 1 });
    gainSkillXp(skill, node.xp);
    rollRares(node.rares || []);
    if (dbl) showToast(`🎁 Double ${ITEMS[node.yieldId].name}!`, 'success');
    const counterKey = { wood: 'chops', mine: 'mines', forage: 'forages' }[skill];
    if (counterKey) setGs((p) => ({ ...p, counters: { ...p.counters, [counterKey]: (p.counters?.[counterKey] || 0) + 1 } }));

    const nextStock = st.stock - 1;
    const next = nextStock <= 0
      ? { stock: node.stock, hitsLeft: clicksNeeded(node, zoneDef.tool), respawnAt: now() + node.respawnSec * 1000 }
      : { stock: nextStock, hitsLeft: clicksNeeded(node, zoneDef.tool), respawnAt: 0 };
    nodeStateRef.current = { ...nodeStateRef.current, [key]: next };
    setNodeState(nodeStateRef.current);
  };

  // ── Fishing ─────────────────────────────────────────────────────────────────
  const castLine = () => {
    if (fishingRef.current.phase !== 'idle') return;
    const fast = 1 - Math.min(0.5, buffVal('fishFast') / 100);
    const waitMs = rand(FISH_WAIT_MIN_S, FISH_WAIT_MAX_S) * 1000 * fast;
    setFishing({ phase: 'waiting', biteAt: now() + waitMs });
    setGs((p) => ({ ...p, counters: { ...p.counters, casts: (p.counters?.casts || 0) + 1 } }));
    dirtyRef.current = true;
    clearTimeout(fishTimerRef.current);
    fishTimerRef.current = setTimeout(() => {
      const windowMs = FISH_BITE_WINDOW_MS * (1 + buffVal('fishFast') / 100);
      setFishing({ phase: 'bite', windowUntil: now() + windowMs });
      fishTimerRef.current = setTimeout(() => {
        setFishing({ phase: 'idle' });
        showToastRef.current('🐟 It slipped away… cast again!', 'error');
      }, windowMs);
    }, waitMs);
  };

  const reelIn = () => {
    const f = fishingRef.current;
    if (f.phase === 'waiting') {
      clearTimeout(fishTimerRef.current);
      setFishing({ phase: 'idle' });
      showToast('💦 Too eager! You scared it off — wait for the ❗', 'error');
      return;
    }
    if (f.phase !== 'bite') return;
    clearTimeout(fishTimerRef.current);
    setFishing({ phase: 'idle' });

    const lvl = skillLevel(gsRef.current.skills?.fish || 0);
    const rodTier = gsRef.current.tools?.rod || 0;
    const luck = 1 + buffVal('fishLuck') / 100;
    const rows = FISH_TABLE.filter((r) => lvl >= r.level && rodTier >= r.rod);
    const total = rows.reduce((s, r) => s + r.weight * (r.rare ? luck : 1), 0);
    let roll = Math.random() * total;
    let picked = rows[0];
    for (const r of rows) { roll -= r.weight * (r.rare ? luck : 1); if (roll <= 0) { picked = r; break; } }

    const item = ITEMS[picked.id];
    if (item.kind === 'rare') {
      foundRare(picked.id);
    } else {
      addItems({ [picked.id]: 1 });
      showToast(`${item.icon} Caught: ${item.name}!${item.rare ? ' INCREDIBLE!' : ''}`, item.rare ? 'success' : 'info');
    }
    if (item.kind === 'fish' && !(gsRef.current.caughtFish || []).includes(picked.id)) {
      setGs((p) => ({ ...p, caughtFish: [...(p.caughtFish || []), picked.id] }));
      if (item.rare) setRareFind({ itemId: picked.id });
    }
    gainSkillXp('fish', picked.xp || 3);
  };

  // ── Farming ─────────────────────────────────────────────────────────────────
  const plantSeed = (plot, seedId) => {
    const crop = CROP_BY_SEED[seedId];
    if (!crop || invCount(seedId) < 1) return;
    const fast = 1 - Math.min(0.5, buffVal('cropFast') / 100);
    addItems({ [seedId]: -1 });
    setGs((p) => ({ ...p, farm: [...p.farm, { plot, seedId, readyAt: now() + crop.growMin * 60 * 1000 * fast }] }));
    dirtyRef.current = true;
  };

  const harvest = (plotEntry) => {
    if (now() < plotEntry.readyAt) return;
    const crop = CROP_BY_SEED[plotEntry.seedId];
    const golden = Math.random() < GOLDEN_CROP_CHANCE;
    const qty = crop.yield * (golden ? 2 : 1);
    addItems({ [crop.cropId]: qty });
    setGs((p) => ({ ...p, farm: p.farm.filter((f) => f !== plotEntry && f.plot !== plotEntry.plot) }));
    showToast(`${golden ? '✨ GOLDEN harvest! ' : '🌾 '}+${qty} ${ITEMS[crop.cropId].name}!`, 'success');
    if (golden) earnMenagerieEssence(15, 'Golden harvest!');
    gainSkillXp('forage', Math.round(crop.growMin / 8) + 2);
  };

  const buySeed = (crop) => {
    if (gsRef.current.gold < crop.seedCost) return;
    setGs((p) => ({ ...p, gold: p.gold - crop.seedCost }));
    addItems({ [crop.seedId]: 1 });
  };

  const sellItem = (id, qty) => {
    const n = Math.min(qty, invCount(id));
    if (n <= 0 || !ITEMS[id].sell) return;
    addItems({ [id]: -n });
    setGs((p) => ({ ...p, gold: p.gold + ITEMS[id].sell * n }));
  };

  // ── Smelting ────────────────────────────────────────────────────────────────
  const startSmelt = (recipe) => {
    const cur = gsRef.current;
    if (!cur.crafted.includes('smelter')) return;
    const usedSlots = cur.smelting.map((s) => s.slot);
    const slot = [0, 1].find((i) => i < SMELT_SLOTS && !usedSlots.includes(i));
    if (slot === undefined) { showToast('🏭 Smelter is full!', 'error'); return; }
    if (invCount(recipe.oreId) < recipe.ore) return;
    if (!consumeFuel(recipe.fuel)) { showToast('🪵 Not enough wood fuel!', 'error'); return; }
    addItems({ [recipe.oreId]: -recipe.ore });
    const fast = 1 - Math.min(0.6, buffVal('smeltFast') / 100);
    setGs((p) => ({ ...p, smelting: [...p.smelting, { slot, barId: recipe.barId, doneAt: now() + recipe.minutes * 60 * 1000 * fast }] }));
    dirtyRef.current = true;
  };

  const collectBar = (job) => {
    if (now() < job.doneAt) return;
    addItems({ [job.barId]: 1 });
    setGs((p) => ({ ...p, smelting: p.smelting.filter((s) => s !== job && s.slot !== job.slot) }));
    showToast(`${ITEMS[job.barId].icon} ${ITEMS[job.barId].name} ready!`, 'success');
    gainSkillXp('mine', 6);
  };

  // ── Cooking ─────────────────────────────────────────────────────────────────
  const cookRecipe = (r) => {
    const cur = gsRef.current;
    const known = cur.knownRecipes.includes(r.id) || r.start || (r.cookLevel && skillLevel(cur.skills?.cook || 0) >= r.cookLevel);
    if (!known) return;
    if (kitchenTier < r.tier) { showToast(`Needs a ${KITCHEN_TIERS[r.tier].name}!`, 'error'); return; }
    if ((cur.activeBuffs || []).filter((b) => b.until > now()).length >= MAX_ACTIVE_BUFFS) {
      showToast(`🍽️ You're full! (max ${MAX_ACTIVE_BUFFS} active meals)`, 'error'); return;
    }
    if (!hasItems(r.ing)) return;
    if (!consumeFuel(r.fuel)) { showToast('🪵 Not enough wood fuel — chop some logs!', 'error'); return; }
    addItems(Object.fromEntries(Object.entries(r.ing).map(([id, q]) => [id, -q])));
    setGs((p) => ({
      ...p,
      activeBuffs: [...(p.activeBuffs || []).filter((b) => b.until > now()), { recipeId: r.id, type: r.buff.type, value: r.buff.value, until: now() + r.buff.minutes * 60 * 1000 }],
      cookedDishes: (p.cookedDishes || []).includes(r.id) ? p.cookedDishes : [...(p.cookedDishes || []), r.id],
      knownRecipes: (p.knownRecipes || []).includes(r.id) ? p.knownRecipes : [...(p.knownRecipes || []), r.id],
      counters: { ...p.counters, cooks: (p.counters?.cooks || 0) + 1 },
    }));
    if (!(cur.cookedDishes || []).includes(r.id)) earnMenagerieEssence(15, 'New dish mastered!');
    gainSkillXp('cook', r.xp);
    const bl = BUFF_LABELS[r.buff.type];
    showToast(`${r.icon} Delicious! ${bl.icon} +${r.buff.value}% ${bl.name} for ${r.buff.minutes} min.`, 'success');
    dirtyRef.current = true;
  };

  const readScroll = () => {
    const cur = gsRef.current;
    if ((cur.unreadScrolls || 0) < 1) return;
    const unknown = SCROLL_RECIPES.filter((id) => !cur.knownRecipes.includes(id));
    if (unknown.length === 0) {
      setGs((p) => ({ ...p, unreadScrolls: p.unreadScrolls - 1, gold: p.gold + 25 }));
      showToast('📜 A recipe you already know — you trade the scroll for 25 gold.', 'info');
      return;
    }
    const id = unknown[Math.floor(Math.random() * unknown.length)];
    setGs((p) => ({ ...p, unreadScrolls: p.unreadScrolls - 1, knownRecipes: [...p.knownRecipes, id] }));
    setNewRecipe({ recipeId: id });
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Crafting + tools + building ─────────────────────────────────────────────
  const craftItem = (c) => {
    const cur = gsRef.current;
    if (cur.crafted.includes(c.id)) return;
    if ((c.needs || []).some((n) => !cur.crafted.includes(n))) return;
    if (c.skill && skillLevel(cur.skills?.[c.skill[0]] || 0) < c.skill[1]) return;
    if (!hasItems(c.items)) return;
    addItems(Object.fromEntries(Object.entries(c.items).filter(([, q]) => q > 0).map(([id, q]) => [id, -q])));
    setGs((p) => ({ ...p, crafted: [...p.crafted, c.id], counters: { ...p.counters, crafts: (p.counters?.crafts || 0) + 1 } }));
    if (c.autoId) setGs((p) => ({ ...p, autoCollectAt: { ...p.autoCollectAt, [c.id]: now() } }));
    showToast(`${c.icon} ${c.name} built!${c.decor ? ' Place it on your homestead!' : ''}`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const upgradeTool = (toolId) => {
    const cur = gsRef.current;
    const nextTier = (cur.tools?.[toolId] || 0) + 1;
    const cost = TOOL_COSTS[nextTier];
    if (!cost || !cur.crafted.includes('workbench')) return;
    const skillId = { axe: 'wood', pick: 'mine', rod: 'fish' }[toolId];
    if (skillLevel(cur.skills?.[skillId] || 0) < TOOL_LEVEL_REQ[nextTier]) return;
    if (!hasItems(cost)) return;
    addItems(Object.fromEntries(Object.entries(cost).map(([id, q]) => [id, -q])));
    setGs((p) => ({ ...p, tools: { ...p.tools, [toolId]: nextTier } }));
    showToast(`${TOOL_DEFS[toolId].icon} ${TOOL_TIERS[nextTier].name} ${TOOL_DEFS[toolId].name} forged!`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const placeDecor = (slot) => {
    if (!placeMode) return;
    const cur = gsRef.current;
    if (cur.grid.some((g) => g.slot === slot)) return;
    setGs((p) => ({ ...p, grid: [...p.grid, { slot, craftId: placeMode }] }));
    setPlaceMode(null);
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const removeDecor = (slot) => {
    setGs((p) => ({ ...p, grid: p.grid.filter((g) => g.slot !== slot) }));
    dirtyRef.current = true;
  };

  // ── Automation collection ───────────────────────────────────────────────────
  const autoUnits = (gs.crafted || []).map((id) => CRAFT_MAP[id]).filter((c) => c?.autoId);
  const autoPending = (c) => {
    const anchor = gs.autoCollectAt?.[c.id] || now();
    const hours = Math.min(c.capHours, (now() - anchor) / 3600000);
    return Math.floor(hours * c.perHour * (1 + buffVal('autoBoost') / 100));
  };
  const collectAuto = (c) => {
    const n = autoPending(c);
    if (n < 1) return;
    addItems({ [c.autoId]: n });
    setGs((p) => ({ ...p, autoCollectAt: { ...p.autoCollectAt, [c.id]: now() } }));
    showToast(`${c.icon} Collected ${n} × ${ITEMS[c.autoId].name}!`, 'success');
  };

  const equipTitle = (id) => {
    setGs((p) => ({ ...p, activeTitle: p.activeTitle === id ? null : id }));
    dirtyRef.current = true;
    setTimeout(persist, 400);
    showToast('📛 Title updated — it shows on your class card!', 'success');
  };

  // ── UI bits ─────────────────────────────────────────────────────────────────
  const exhausted = exhaustedUntil > now();
  const activeBuffs = (gs.activeBuffs || []).filter((b) => b.until > now());

  const InventoryStrip = ({ kinds }) => {
    const entries = Object.entries(gs.inv || {}).filter(([id]) => !kinds || kinds.includes(ITEMS[id]?.kind)).sort();
    if (entries.length === 0) return <p className="text-xs text-gray-400 italic">Nothing yet — get gathering!</p>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([id, q]) => (
          <span key={id} className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs font-bold text-gray-600" title={ITEMS[id]?.name}>
            {ITEMS[id]?.icon} {fmtQty(q)}
          </span>
        ))}
      </div>
    );
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      <style>{`
        @keyframes wh-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes wh-shake { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes wh-pulse { 0%,100% { opacity: .7; } 50% { opacity: 1; } }
      `}</style>

      {/* Header */}
      <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🏕️ Wildwood Homestead</h1>
            <p className="text-white/85 text-sm">Chop. Mine. Fish. Cook. Build. Tame the wilds, one click at a time.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold drop-shadow">🏡 {fmtQty(prosperity)}</p>
            <p className="text-white/85 text-sm font-semibold">Prosperity</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-white/20 rounded-full px-3 py-1">🪙 {fmtQty(gs.gold)} gold</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🪵 {fmtQty(fuelUnits)} fuel</span>
          {Object.entries(SKILLS).map(([k, s]) => (
            <span key={k} className="bg-white/20 rounded-full px-3 py-1">{s.icon} {skillLevel(gs.skills?.[k] || 0)}</span>
          ))}
          {gs.unreadScrolls > 0 && <span className="bg-yellow-300 text-amber-900 rounded-full px-3 py-1 animate-pulse">📜 {gs.unreadScrolls} scroll{gs.unreadScrolls !== 1 ? 's' : ''}!</span>}
          {(gs.menagerieEssenceEarned || 0) > 0 && (
            <span className="bg-white/20 rounded-full px-3 py-1" title="Discoveries, level-ups, golden harvests and new dishes send Wild Essence to your Champion's Menagerie">
              ✨ {fmtQty(gs.menagerieEssenceEarned)} essence for your Menagerie
            </span>
          )}
        </div>
        {(forgeBonus.stageName || companionBonus) && (
          <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-bold">
            {forgeBonus.stageName && (
              <span className="bg-indigo-500/40 border border-indigo-300/40 rounded-full px-3 py-1" title="Earned in Champion's Forge">
                ⚔️ {forgeBonus.stageName} doubles as a fine axe: +{forgeBonus.power} power
              </span>
            )}
            {companionBonus && (
              <span className="bg-amber-500/30 border border-amber-300/40 rounded-full px-3 py-1 flex items-center gap-1.5" title="Your Menagerie companion is helping!">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={companionBonus.img} alt={companionBonus.name} className="w-4 h-4 rounded-full object-cover"
                  style={companionBonus.shiny ? { filter: 'hue-rotate(45deg) saturate(1.7)' } : undefined} />
                {companionBonus.shiny && '✨'}{companionBonus.name} helps: {companionBonus.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Active meal buffs + exhaustion */}
      {(activeBuffs.length > 0 || exhausted) && (
        <div className="flex flex-wrap gap-2">
          {activeBuffs.map((b, i) => {
            const r = RECIPE_MAP[b.recipeId];
            const bl = BUFF_LABELS[b.type];
            return (
              <span key={i} className="bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold rounded-full px-3 py-1">
                {r?.icon} {r?.name}: {bl.icon} +{b.value}% · {fmtCountdown(b.until - now())}
              </span>
            );
          })}
          {exhausted && (
            <span className="bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded-full px-3 py-1 animate-pulse">
              😮‍💨 Exhausted — resting {fmtCountdown(exhaustedUntil - now())}
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${
              tab === t.id ? 'bg-green-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50'
            }`}
          >
            {t.icon} {t.name}
            {t.id === 'cook' && gs.unreadScrolls > 0 && <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{gs.unreadScrolls}</span>}
          </button>
        ))}
      </div>

      {/* ══ GATHER ══ */}
      {tab === 'gather' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ZONES.map((z) => (
              <button key={z.id} onClick={() => setZone(z.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${zone === z.id ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-emerald-50'}`}>
                {z.icon} {z.name}
              </button>
            ))}
          </div>

          {ZONES.filter((z) => z.id === zone).map((z) => {
            const lvl = skillLevel(gs.skills?.[z.skill] || 0);
            const prog = skillProgress(gs.skills?.[z.skill] || 0);
            return (
              <div key={z.id} className="space-y-3">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex flex-wrap items-center gap-3">
                  <span className="font-bold text-gray-800 text-sm">{SKILLS[z.skill].icon} {SKILLS[z.skill].name} Lv {lvl}</span>
                  <div className="flex-1 min-w-[120px] bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-600" style={{ width: prog.needed ? `${Math.round((prog.into / prog.needed) * 100)}%` : '100%' }} />
                  </div>
                  {z.tool && (
                    <span className="text-xs font-bold text-gray-500">
                      {TOOL_DEFS[z.tool].icon} {TOOL_TIERS[gs.tools?.[z.tool] || 0].name} {TOOL_DEFS[z.tool].name}
                    </span>
                  )}
                  <InventoryStrip kinds={z.id === 'lake' ? ['fish', 'junk'] : z.id === 'caves' ? ['stone', 'ore', 'bar'] : z.id === 'forest' ? ['wood'] : ['forage', 'fiber']} />
                </div>

                {/* Lake = fishing; others = click nodes */}
                {z.id === 'lake' ? (
                  <div className="bg-gradient-to-b from-sky-900 to-blue-950 rounded-2xl border-2 border-blue-900/50 p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
                    {fishing.phase === 'idle' && (
                      <>
                        <p className="text-5xl mb-3">🎣</p>
                        <p className="text-blue-100 font-bold">The lake is still…</p>
                        <p className="text-blue-300/80 text-xs mt-1 mb-4">Cast, wait for the ❗, then reel like the wind!</p>
                        <button onClick={castLine} className="bg-sky-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-400 transition text-lg">
                          Cast Line
                        </button>
                      </>
                    )}
                    {fishing.phase === 'waiting' && (
                      <>
                        <p className="text-5xl mb-3" style={{ animation: 'wh-bob 1.8s ease-in-out infinite' }}>🛶</p>
                        <p className="text-blue-100 font-bold animate-pulse">Waiting for a bite…</p>
                        <p className="text-blue-300/80 text-xs mt-1 mb-4">Patience, angler. Don&apos;t reel yet!</p>
                        <button onClick={reelIn} className="bg-blue-800 text-blue-200 px-8 py-3 rounded-xl font-bold border border-blue-600 hover:bg-blue-700 transition">
                          Reel In
                        </button>
                      </>
                    )}
                    {fishing.phase === 'bite' && (
                      <>
                        <p className="text-6xl mb-3" style={{ animation: 'wh-shake 0.15s linear infinite' }}>❗</p>
                        <p className="text-yellow-300 font-bold text-xl animate-pulse">BITE! REEL IT IN!</p>
                        <button onClick={reelIn} className="mt-4 bg-yellow-400 text-yellow-950 px-10 py-4 rounded-xl font-bold text-xl hover:bg-yellow-300 transition animate-pulse">
                          🎣 REEL!
                        </button>
                      </>
                    )}
                    <p className="text-blue-300/60 text-[11px] mt-5">
                      Fishing log: {(gs.caughtFish || []).length}/{FISH_TABLE.filter((f) => ITEMS[f.id].kind === 'fish').length} fish species
                      {(gs.caughtFish || []).some((f) => ITEMS[f]?.rare) && ' · includes a LEGENDARY!'}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {NODES[z.id].map((node) => {
                      const key = `${z.id}_${node.id}`;
                      const st = nodeState[key] || { stock: node.stock, hitsLeft: clicksNeeded(node, z.tool), respawnAt: 0 };
                      const locked = lvl < node.level;
                      const respawning = st.respawnAt > now();
                      const need = clicksNeeded(node, z.tool);
                      return (
                        <button
                          key={node.id}
                          onClick={() => strikeNode(z, node)}
                          disabled={locked || respawning || exhausted}
                          className={`rounded-2xl border-2 p-4 text-center transition active:scale-95 ${
                            locked ? 'border-gray-200 bg-gray-50 opacity-60' : respawning ? 'border-gray-200 bg-gray-100' : 'border-emerald-200 bg-white hover:border-emerald-400 hover:shadow-md'
                          }`}
                        >
                          <p className="text-4xl" style={{ animation: !locked && !respawning ? 'wh-bob 2.4s ease-in-out infinite' : undefined, filter: respawning ? 'grayscale(1) opacity(0.5)' : undefined }}>
                            {node.icon}
                          </p>
                          <p className="font-bold text-gray-800 text-sm mt-1">{node.name}</p>
                          {locked ? (
                            <p className="text-xs text-gray-400 font-bold mt-1">🔒 {SKILLS[z.skill].name} Lv {node.level}</p>
                          ) : respawning ? (
                            <p className="text-xs text-amber-600 font-bold mt-1">Regrowing… {fmtCountdown(st.respawnAt - now())}</p>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500 mt-1">{ITEMS[node.yieldId].icon} {ITEMS[node.yieldId].name} · +{node.xp} XP</p>
                              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(((need - st.hitsLeft) / need) * 100)}%` }} />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">{st.hitsLeft} {z.verb.toLowerCase()}{st.hitsLeft !== 1 ? 's' : ''} to go · {st.stock} left</p>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ FARM ══ */}
      {tab === 'farm' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">🌾 Crop Plots ({gs.farm.length}/{farmPlots} planted)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {Array.from({ length: farmPlots }).map((_, i) => {
                const planted = gs.farm.find((f) => f.plot === i);
                if (!planted) {
                  const seeds = Object.keys(gs.inv || {}).filter((id) => ITEMS[id]?.kind === 'seed' && gs.inv[id] > 0);
                  return (
                    <div key={i} className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-3 text-center min-h-[110px] flex flex-col items-center justify-center">
                      <p className="text-2xl">🟫</p>
                      {seeds.length === 0 ? (
                        <p className="text-[10px] text-amber-600 font-bold mt-1">No seeds — buy some below!</p>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                          {seeds.map((sid) => (
                            <button key={sid} onClick={() => plantSeed(i, sid)}
                              className="text-[10px] font-bold bg-white border border-amber-300 rounded-full px-2 py-0.5 hover:bg-amber-100 transition"
                              title={`Plant ${ITEMS[sid].name} (${gs.inv[sid]} owned)`}>
                              {ITEMS[CROP_BY_SEED[sid]?.cropId]?.icon} Plant
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                const crop = CROP_BY_SEED[planted.seedId];
                const ready = now() >= planted.readyAt;
                return (
                  <button key={i} onClick={() => harvest(planted)} disabled={!ready}
                    className={`rounded-xl border-2 p-3 text-center min-h-[110px] transition ${ready ? 'border-green-400 bg-green-50 hover:shadow-md animate-pulse' : 'border-amber-200 bg-amber-50/40'}`}>
                    <p className="text-2xl" style={{ animation: ready ? 'wh-bob 1s ease-in-out infinite' : undefined }}>
                      {ready ? ITEMS[crop.cropId].icon : '🌱'}
                    </p>
                    <p className="font-bold text-gray-700 text-xs mt-1">{ITEMS[crop.cropId].name}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${ready ? 'text-green-600' : 'text-amber-600'}`}>
                      {ready ? 'HARVEST!' : fmtCountdown(planted.readyAt - now())}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seed shop + trading post */}
          <div className="grid lg:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">🌱 Seed Merchant <span className="text-xs text-gray-400 font-normal">— pay with 🪙 gold</span></h3>
              <div className="divide-y divide-gray-50">
                {CROPS.map((c) => (
                  <div key={c.seedId} className="flex items-center gap-2 py-1.5">
                    <span className="text-lg">{ITEMS[c.cropId].icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700">{ITEMS[c.seedId].name} <span className="text-[10px] text-gray-400 font-normal">(owned: {invCount(c.seedId)})</span></p>
                      <p className="text-[10px] text-gray-400">{c.growMin >= 60 ? `${Math.round(c.growMin / 60)}h` : `${c.growMin}min`} grow · yields {c.yield} {ITEMS[c.cropId].name}</p>
                    </div>
                    <button onClick={() => buySeed(c)} disabled={gs.gold < c.seedCost}
                      className="text-xs font-bold bg-green-100 text-green-700 rounded-lg px-3 py-1.5 hover:bg-green-200 disabled:opacity-40 transition">
                      🪙 {c.seedCost}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">⚖️ Trading Post <span className="text-xs text-gray-400 font-normal">— sell surplus for gold</span></h3>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 pr-1">
                {Object.entries(gs.inv || {}).filter(([id]) => ITEMS[id]?.sell > 0).sort((a, b) => (ITEMS[b[0]].sell - ITEMS[a[0]].sell)).map(([id, q]) => (
                  <div key={id} className="flex items-center gap-2 py-1.5">
                    <span className="text-lg">{ITEMS[id].icon}</span>
                    <p className="flex-1 text-sm font-bold text-gray-700">{ITEMS[id].name} <span className="text-[10px] text-gray-400 font-normal">× {fmtQty(q)}</span></p>
                    <span className="text-[10px] text-gray-400">🪙{ITEMS[id].sell} ea</span>
                    <button onClick={() => sellItem(id, 1)} className="text-xs font-bold bg-gray-100 text-gray-600 rounded-lg px-2 py-1 hover:bg-yellow-100 transition">Sell 1</button>
                    <button onClick={() => sellItem(id, 10)} className="text-xs font-bold bg-gray-100 text-gray-600 rounded-lg px-2 py-1 hover:bg-yellow-100 transition">×10</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ CRAFT ══ */}
      {tab === 'craft' && (
        <div className="space-y-3">
          {/* Tools */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-2">⚒️ Tools {!gs.crafted.includes('workbench') && <span className="text-xs text-red-500 font-normal">— build a Workbench first!</span>}</h3>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {Object.entries(TOOL_DEFS).map(([toolId, def]) => {
                const tier = gs.tools?.[toolId] || 0;
                const next = tier + 1;
                const cost = TOOL_COSTS[next];
                const skillId = { axe: 'wood', pick: 'mine', rod: 'fish' }[toolId];
                const lvlOk = !cost || skillLevel(gs.skills?.[skillId] || 0) >= TOOL_LEVEL_REQ[next];
                return (
                  <div key={toolId} className="rounded-xl border border-gray-200 p-3">
                    <p className="font-bold text-gray-800 text-sm">{def.icon} {TOOL_TIERS[tier].name} {def.name}</p>
                    <p className="text-[10px] text-gray-400">Power {TOOL_TIERS[tier].power}{forgeBonus.power > 0 && toolId !== 'rod' ? ` (+${forgeBonus.power} ⚔️)` : ''}</p>
                    {cost ? (
                      <>
                        <p className="text-[11px] text-gray-500 mt-1.5">
                          Next: <b>{TOOL_TIERS[next].name}</b> — {Object.entries(cost).map(([id, q]) => `${q} ${ITEMS[id].icon}`).join(' + ')}
                          {!lvlOk && <span className="text-red-400 font-bold"> · needs {SKILLS[skillId].name} {TOOL_LEVEL_REQ[next]}</span>}
                        </p>
                        <button onClick={() => upgradeTool(toolId)}
                          disabled={!gs.crafted.includes('workbench') || !lvlOk || !hasItems(cost)}
                          className="w-full mt-2 text-xs font-bold bg-emerald-600 text-white rounded-lg py-1.5 hover:bg-emerald-700 disabled:opacity-40 transition">
                          Upgrade
                        </button>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-600 font-bold mt-1.5">✨ Fully mastered!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Smelter */}
          {gs.crafted.includes('smelter') && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">🏭 Smelter <span className="text-xs text-gray-400 font-normal">— runs in real time, even while you&apos;re away</span></h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {gs.smelting.map((job) => {
                  const done = now() >= job.doneAt;
                  return (
                    <button key={job.slot} onClick={() => collectBar(job)} disabled={!done}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${done ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                      {ITEMS[job.barId].icon} {done ? `Collect ${ITEMS[job.barId].name}!` : `${ITEMS[job.barId].name} · ${fmtCountdown(job.doneAt - now())}`}
                    </button>
                  );
                })}
                {gs.smelting.length === 0 && <p className="text-xs text-gray-400 italic">Furnace is cold. Load it up!</p>}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SMELT_RECIPES.map((r) => (
                  <button key={r.barId} onClick={() => startSmelt(r)}
                    disabled={invCount(r.oreId) < r.ore || fuelUnits < r.fuel || gs.smelting.length >= SMELT_SLOTS}
                    className="text-left rounded-xl border border-gray-200 p-2.5 hover:border-amber-300 hover:shadow disabled:opacity-40 transition">
                    <p className="text-sm font-bold text-gray-700">{ITEMS[r.barId].icon} {ITEMS[r.barId].name}</p>
                    <p className="text-[10px] text-gray-400">{r.ore} {ITEMS[r.oreId].icon} + {r.fuel}🪵 fuel · {r.minutes} min</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Helpers (automation) */}
          {autoUnits.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">🤖 Helpers <span className="text-xs text-gray-400 font-normal">— they gather while you learn</span></h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {autoUnits.map((c) => {
                  const pending = autoPending(c);
                  return (
                    <button key={c.id} onClick={() => collectAuto(c)} disabled={pending < 1}
                      className={`text-left rounded-xl border-2 p-3 transition ${pending > 0 ? 'border-emerald-300 bg-emerald-50 hover:shadow' : 'border-gray-200 bg-gray-50'}`}>
                      <p className="text-sm font-bold text-gray-700">{c.icon} {c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.perHour}/{ITEMS[c.autoId].icon} per hour · holds {c.capHours}h</p>
                      <p className={`text-xs font-bold mt-1 ${pending > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {pending > 0 ? `Collect ${pending} × ${ITEMS[c.autoId].name}!` : 'Working…'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Build list */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-2">🛠️ Build</h3>
            {['station', 'auto', 'farm', 'decor'].map((cat) => (
              <div key={cat} className="mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1.5">
                  {{ station: '🏗️ Stations', auto: '🤖 Helpers', farm: '🌾 Farm', decor: '🎀 Decor (place on your Homestead)' }[cat]}
                </h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CRAFTS.filter((c) => c.cat === cat).map((c) => {
                    const owned = gs.crafted.includes(c.id);
                    const needsOk = (c.needs || []).every((n) => gs.crafted.includes(n));
                    const skillOk = !c.skill || skillLevel(gs.skills?.[c.skill[0]] || 0) >= c.skill[1];
                    const itemsOk = hasItems(c.items);
                    return (
                      <div key={c.id} className={`rounded-xl border p-2.5 ${owned ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200'}`}>
                        <p className="text-sm font-bold text-gray-700">{c.icon} {c.name} {owned && '✓'}</p>
                        <p className="text-[10px] text-gray-400 leading-snug">{c.desc}</p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {Object.entries(c.items).filter(([, q]) => q > 0).map(([id, q]) => `${q}${ITEMS[id].icon}`).join(' ')}
                          {c.skill && <span className={skillOk ? '' : 'text-red-400 font-bold'}> · {SKILLS[c.skill[0]].name} {c.skill[1]}</span>}
                          {(c.needs || []).length > 0 && !needsOk && <span className="text-red-400 font-bold"> · needs {c.needs.map((n) => CRAFT_MAP[n].name).join(', ')}</span>}
                          <span className="text-amber-600"> · +{c.prosperity}🏡</span>
                        </p>
                        {!owned && (
                          <button onClick={() => craftItem(c)} disabled={!needsOk || !skillOk || !itemsOk}
                            className="w-full mt-1.5 text-xs font-bold bg-green-700 text-white rounded-lg py-1.5 hover:bg-green-800 disabled:opacity-40 transition">
                            Build
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ KITCHEN ══ */}
      {tab === 'cook' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-gray-800">{KITCHEN_TIERS[kitchenTier].icon} {KITCHEN_TIERS[kitchenTier].name} <span className="text-xs text-gray-400 font-normal">· fuel: 🪵 {fmtQty(fuelUnits)}</span></h3>
              {gs.unreadScrolls > 0 && (
                <button onClick={readScroll} className="bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-600 animate-pulse transition">
                  📜 Read Recipe Scroll ({gs.unreadScrolls})
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Cooking burns wood as fuel and serves a timed buff (max {MAX_ACTIVE_BUFFS} meals at once). Find scroll recipes out in the wilds!
              Cooking level {skillLevel(gs.skills?.cook || 0)}.
            </p>
            <InventoryStrip kinds={['crop', 'forage', 'fish', 'ore']} />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {RECIPES.map((r) => {
              const known = gs.knownRecipes.includes(r.id) || r.start || (r.cookLevel && skillLevel(gs.skills?.cook || 0) >= r.cookLevel);
              const cooked = (gs.cookedDishes || []).includes(r.id);
              const tierOk = kitchenTier >= r.tier;
              const canCook = known && tierOk && hasItems(r.ing) && fuelUnits >= r.fuel;
              if (!known) {
                return (
                  <div key={r.id} className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-3 text-center">
                    <p className="text-2xl opacity-30">❓</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      {r.scroll ? 'Secret recipe — find the scroll!' : `Unlocks at Cooking Lv ${r.cookLevel}`}
                    </p>
                  </div>
                );
              }
              const bl = BUFF_LABELS[r.buff.type];
              return (
                <div key={r.id} className={`rounded-xl border-2 p-3 ${cooked ? 'border-orange-200 bg-orange-50/40' : 'border-gray-200 bg-white'}`}>
                  <p className="font-bold text-gray-800 text-sm">{r.icon} {r.name} {cooked && <span title="Cooked before">🍽️</span>}</p>
                  <p className="text-[10px] text-gray-400 italic leading-snug">{r.desc}</p>
                  <p className="text-[11px] text-gray-600 mt-1.5">
                    {Object.entries(r.ing).map(([id, q]) => {
                      const have = invCount(id) >= q;
                      return <span key={id} className={have ? '' : 'text-red-400 font-bold'}>{q}{ITEMS[id].icon} </span>;
                    })}
                    <span className={fuelUnits >= r.fuel ? 'text-gray-400' : 'text-red-400 font-bold'}>+ {r.fuel}🪵</span>
                  </p>
                  <p className="text-[11px] font-bold text-orange-600 mt-1">{bl.icon} +{r.buff.value}% {bl.name} · {r.buff.minutes} min</p>
                  {!tierOk && <p className="text-[10px] text-red-400 font-bold mt-0.5">Needs {KITCHEN_TIERS[r.tier].name}</p>}
                  <button onClick={() => cookRecipe(r)}
                    disabled={!canCook}
                    className="w-full mt-2 text-xs font-bold bg-orange-500 text-white rounded-lg py-1.5 hover:bg-orange-600 disabled:opacity-40 transition">
                    Cook &amp; Eat
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ HOMESTEAD ══ */}
      {tab === 'home' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-gray-800">🏕️ Your Homestead <span className="text-amber-600 text-sm">· {fmtQty(prosperity)} Prosperity</span></h3>
              {placeMode && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 animate-pulse">
                  Placing {CRAFT_MAP[placeMode]?.icon} {CRAFT_MAP[placeMode]?.name} — tap a tile! <button onClick={() => setPlaceMode(null)} className="underline ml-1">cancel</button>
                </span>
              )}
            </div>
            <div
              className="grid gap-1.5 rounded-xl p-3 bg-gradient-to-b from-green-200 to-emerald-300 border-2 border-emerald-400/50"
              style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, slot) => {
                const cabinSlot = Math.floor(GRID_ROWS / 2) * GRID_COLS + Math.floor(GRID_COLS / 2) - 1;
                if (slot === cabinSlot) {
                  return (
                    <div key={slot} className="aspect-square rounded-lg bg-amber-100/80 border-2 border-amber-400 flex items-center justify-center text-2xl shadow" title="Your cabin">
                      🛖
                    </div>
                  );
                }
                const placed = gs.grid.find((g) => g.slot === slot);
                if (placed) {
                  const c = CRAFT_MAP[placed.craftId];
                  return (
                    <button key={slot} onClick={() => removeDecor(slot)}
                      className="aspect-square rounded-lg bg-white/60 border border-white/80 flex items-center justify-center text-xl hover:bg-red-100 transition shadow-sm"
                      title={`${c?.name} — tap to pick up`}>
                      {c?.icon}
                    </button>
                  );
                }
                return (
                  <button key={slot} onClick={() => placeDecor(slot)} disabled={!placeMode}
                    className={`aspect-square rounded-lg transition ${placeMode ? 'bg-white/40 hover:bg-white/80 border-2 border-dashed border-white cursor-pointer' : 'bg-white/10'}`} />
                );
              })}
            </div>
            {/* Unplaced decor */}
            {(() => {
              const placedIds = gs.grid.map((g) => g.craftId);
              const unplaced = gs.crafted.filter((id) => CRAFT_MAP[id]?.decor && !placedIds.includes(id));
              return unplaced.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs font-bold text-gray-500 py-1">In storage:</span>
                  {unplaced.map((id) => (
                    <button key={id} onClick={() => setPlaceMode(id)}
                      className={`text-xs font-bold rounded-full px-3 py-1 border transition ${placeMode === id ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-emerald-50'}`}>
                      {CRAFT_MAP[id].icon} {CRAFT_MAP[id].name}
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Curio shelf */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-1">🗄️ Curio Shelf — {(gs.discoveredRares || []).length}/{RARE_IDS.length} rare finds <span className="text-xs text-amber-600 font-normal">(+5 Prosperity each)</span></h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 mt-2">
              {RARE_IDS.map((id) => {
                const found = (gs.discoveredRares || []).includes(id);
                return (
                  <div key={id} className={`rounded-xl border p-2 text-center ${found ? 'border-amber-200 bg-amber-50/50' : 'border-dashed border-gray-200 bg-gray-50'}`}
                    title={found ? ITEMS[id].name : '??? — keep exploring!'}>
                    <p className={`text-2xl ${found ? '' : 'opacity-20 grayscale'}`}>{found ? ITEMS[id].icon : '❔'}</p>
                    <p className={`text-[9px] font-bold truncate ${found ? 'text-gray-600' : 'text-gray-300'}`}>{found ? ITEMS[id].name : '???'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Titles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-2">📛 Wildwood Titles <span className="text-xs text-gray-400 font-normal">— the equipped one shows on your class card</span></h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {HOMESTEAD_TITLES.map((t) => {
                const unlocked = (gs.unlockedTitles || []).includes(t.id);
                const active = gs.activeTitle === t.id;
                return (
                  <button key={t.id} onClick={() => unlocked && equipTitle(t.id)} disabled={!unlocked}
                    className={`text-left rounded-xl border-2 p-2.5 transition ${active ? 'border-green-500 bg-green-50 shadow' : unlocked ? 'border-gray-200 bg-white hover:shadow' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
                    <p className={`font-bold text-sm ${t.color}`}>{t.name} {active && '· ON'}</p>
                    <p className="text-[11px] text-gray-500">{unlocked ? (active ? 'Tap to unequip' : 'Tap to equip') : `🔒 ${t.reqText}`}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ CLASS ══ */}
      {tab === 'class' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-1">👥 Valley Neighbours — Prosperity</h3>
          <p className="text-xs text-gray-500 mb-3">Tap a neighbour to peek at their homestead stats!</p>
          {(() => {
            const rows = [...(classmates || [])].map((s) => ({
              id: s.id,
              name: `${s.firstName || '?'} ${s.lastName?.charAt(0) || ''}`,
              data: s.homesteadData || null,
              isMe: s.id === studentData?.id,
            }));
            if (!rows.some((r) => r.isMe) && studentData) {
              rows.push({ id: studentData.id, name: `${studentData.firstName || 'You'}`, data: gs, isMe: true });
            } else {
              const me = rows.find((r) => r.isMe);
              if (me) me.data = gs;
            }
            const scored = rows.map((r) => ({ ...r, p: prosperityOf(r.data), skills: totalSkillLevel(r.data) })).sort((a, b) => b.p - a.p);
            return (
              <div className="divide-y divide-gray-50">
                {scored.slice(0, 30).map((r, i) => (
                  <div key={r.id || i}>
                    <button onClick={() => setVisitId(visitId === r.id ? null : r.id)}
                      className={`w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left transition hover:bg-green-50 ${r.isMe ? 'bg-green-50' : ''}`}>
                      <span className="w-8 text-center font-bold text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{r.name} {r.isMe && '(you)'}</p>
                      <span className="text-xs font-bold text-gray-400">📚 {r.skills}</span>
                      <span className="font-bold text-green-700 text-sm">🏡 {fmtQty(r.p)}</span>
                    </button>
                    {visitId === r.id && r.data && (
                      <div className="px-12 pb-3 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>🍳 {(r.data.knownRecipes || []).length} recipes</span>
                        <span>🗄️ {(r.data.discoveredRares || []).length} curios</span>
                        <span>🎣 {(r.data.caughtFish || []).length} fish species</span>
                        <span>🛠️ {(r.data.crafted || []).length} builds</span>
                        {(r.data.caughtFish || []).includes('leviathan') && <span className="text-purple-600 font-bold">🐉 LEVIATHAN SLAYER</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Rare find modal ── */}
      {rareFind && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setRareFind(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-amber-500 uppercase tracking-widest animate-pulse">✨ Rare discovery! ✨</p>
            <p className="text-7xl my-4" style={{ animation: 'wh-bob 1.2s ease-in-out infinite' }}>{ITEMS[rareFind.itemId]?.icon}</p>
            <h3 className="text-2xl font-bold text-gray-800">{ITEMS[rareFind.itemId]?.name}</h3>
            <p className="text-sm text-gray-500 mt-2">Added to your Curio Shelf (+5 Prosperity) — only the luckiest wanderers ever find one.</p>
            <button onClick={() => setRareFind(null)} className="mt-5 bg-amber-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition">
              Treasure it
            </button>
          </div>
        </div>
      )}

      {/* ── New recipe modal ── */}
      {newRecipe && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setNewRecipe(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">📜 The scroll reveals…</p>
            <p className="text-6xl my-4">{RECIPE_MAP[newRecipe.recipeId]?.icon}</p>
            <h3 className="text-2xl font-bold text-gray-800">{RECIPE_MAP[newRecipe.recipeId]?.name}</h3>
            <p className="text-sm text-gray-500 italic mt-1">“{RECIPE_MAP[newRecipe.recipeId]?.desc}”</p>
            {(() => {
              const r = RECIPE_MAP[newRecipe.recipeId];
              const bl = r && BUFF_LABELS[r.buff.type];
              return r && <p className="text-sm font-bold text-orange-600 mt-2">{bl.icon} +{r.buff.value}% {bl.name} for {r.buff.minutes} min</p>;
            })()}
            <button onClick={() => setNewRecipe(null)} className="mt-5 bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-orange-600 transition">
              To the kitchen!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WildwoodHomesteadGame;
