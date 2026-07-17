// components/games/WildwoodHomesteadGame.js
// ─────────────────────────────────────────────────────────────────────────────
// WILDWOOD HOMESTEAD v2 — survival-crafting incremental built around
// INVENTORY MANAGEMENT. All item art is SVG from /public/game icons/Wildwood
// (no emoji glyphs — they don't render on every machine).
//
// • Limited inventory slots + stack sizes; craft pouches, backpacks, crates
//   and camp chests to expand. Overflow loot is auto-sold for gold.
// • Slow, chunky gathering: trees/veins take many swings, deplete and regrow.
// • Fishing spots unlock along the waterline, each with its own catch table.
// • EXPEDITIONS: timed Scavenge and Hunt trips that return chance-based loot,
//   critters (50 to collect!), seeds, scrolls and curios.
// • Farming plots + animal pens (eggs/milk/honey over real time) + cheese.
// • 45+ recipes across campfire/stove/oven + Cauldron potions; wood is fuel.
// • Cross-game: Forge weapon boosts gathering; Menagerie companion helps;
//   discoveries send Wild Essence back to the Menagerie.
//
// Saves to studentData.homesteadData via updateStudentData (Firestore-safe).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  fmtQty, ITEMS, FALLBACK_ICON, RARITY_STYLE, CURIO_IDS,
  CRITTERS, CRITTER_MAP, rollCritter,
  INV_BASE_SLOTS, STACK_BASE,
  ZONES, NODES, STUMP_ICON,
  FISHING_SPOTS, JUNK_IDS, FISH_WAIT_MIN_S, FISH_WAIT_MAX_S, FISH_BITE_WINDOW_MS, FISH_XP,
  TOOL_TIERS, TOOL_DEFS, TOOL_COSTS, TOOL_LEVEL_REQ,
  SKILLS, skillLevel, skillProgress,
  EXPEDITIONS, HUNT_XP_PER_ROLL, SCAV_XP_PER_ROLL, SEED_DROPS,
  FARM_BASE_PLOTS, CROPS, CROP_BY_SEED, GOLDEN_CROP_CHANCE, PENS, PEN_MAP, CHEESE_RECIPE,
  SMELT_SLOTS, SMELT_RECIPES, SAW_SLOTS, SAW_RECIPES,
  LANDMARKS, LANDMARK_MAP, FRIENDS, FRIEND_MAP, RANDOM_CURIO_IDS,
  KITCHEN_TIERS, BUFF_LABELS, RECIPES, RECIPE_MAP, SCROLL_RECIPES, MAX_ACTIVE_BUFFS,
  CRAFTS, CRAFT_MAP, GOLD_ICON, dishIdOf,
  prosperityOf, totalSkillLevel, HOMESTEAD_TITLES, HOMESTEAD_TITLE_MAP,
  defaultSave,
} from './Homestead/homesteadConfig';
import { forgeStageFor } from './SweetEmpire/sweetEmpireConfig';
import { SPECIES_MAP as MENAGERIE_SPECIES, levelForXp as menLevelForXp } from './Menagerie/menagerieConfig';

const now = () => Date.now();
const rand = (a, b) => a + Math.random() * (b - a);
const newUid = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const fmtCountdown = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
};

const ICN = '/game icons/Wildwood';

// Items can span MULTIPLE stacks — each stack takes one slot.
const slotsUsedOf = (inv, stackSize) =>
  Object.values(inv || {}).reduce((s, q) => s + Math.ceil((Number(q) || 0) / stackSize), 0);

// Companion family → homestead bonus (read-only peek at the Menagerie save)
const COMPANION_BONUSES = {
  Tide:      { label: '+12% fishing luck & quick bites', buffs: { fishLuck: 12, fishFast: 12 } },
  Meadow:    { label: '+10% double drops',               buffs: { doubleDrop: 10 } },
  Wilds:     { label: '+10% gathering power',            buffs: { gatherSpeed: 10 } },
  Clockwork: { label: '+15% smelting speed',             buffs: { smeltFast: 15 } },
  Elemental: { label: '+15% smelting speed',             buffs: { smeltFast: 15 } },
  Cosmic:    { label: '+6% rare find luck',              buffs: { rareLuck: 6 } },
  Mythic:    { label: '+12% skill XP',                   buffs: { xpBoost: 12 } },
  Golden:    { label: '+9% rare find luck',              buffs: { rareLuck: 9 } },
};

// Firestore-safe clean of the save object
const cleanSave = (gs) => ({
  inv: Object.fromEntries(Object.entries(gs.inv || {}).filter(([id, v]) => ITEMS[id] && (Number(v) || 0) > 0).map(([k, v]) => [k, Math.floor(Number(v) || 0)])),
  chest: Object.fromEntries(Object.entries(gs.chest || {}).filter(([id, v]) => ITEMS[id] && (Number(v) || 0) > 0).map(([k, v]) => [k, Math.floor(Number(v) || 0)])),
  gold: Math.floor(Number(gs.gold) || 0),
  skills: Object.fromEntries(Object.keys(SKILLS).map((k) => [k, Number(gs.skills?.[k]) || 0])),
  tools: { axe: Number(gs.tools?.axe) || 0, pick: Number(gs.tools?.pick) || 0, rod: Number(gs.tools?.rod) || 0 },
  crafted: (gs.crafted || []).filter((id) => CRAFT_MAP[id]),
  farm: (gs.farm || []).map((f) => ({ plot: Number(f.plot) || 0, seedId: String(f.seedId), readyAt: Number(f.readyAt) || 0 })),
  smelting: (gs.smelting || []).map((s) => ({ slot: Number(s.slot) || 0, barId: String(s.barId), doneAt: Number(s.doneAt) || 0 })),
  sawing: (gs.sawing || []).map((s) => ({ slot: Number(s.slot) || 0, planks: Number(s.planks) || 0, doneAt: Number(s.doneAt) || 0 })),
  pensAt: Object.fromEntries(Object.entries(gs.pensAt || {}).map(([k, v]) => [k, Number(v) || 0])),
  expeditions: (gs.expeditions || []).map((e) => ({ id: String(e.id), type: String(e.type), tier: Number(e.tier) || 0, returnAt: Number(e.returnAt) || 0, ...(e.landmarkId ? { landmarkId: String(e.landmarkId) } : {}) })),
  discoveredLandmarks: (gs.discoveredLandmarks || []).filter((id) => LANDMARK_MAP[id]),
  friendsFed: Object.fromEntries(Object.entries(gs.friendsFed || {}).filter(([k]) => FRIEND_MAP[k]).map(([k, v]) => [k, Number(v) || 0])),
  friends: (gs.friends || []).filter((id) => FRIEND_MAP[id]),
  knownRecipes: (gs.knownRecipes || []).filter((id) => RECIPE_MAP[id]),
  unreadScrolls: Number(gs.unreadScrolls) || 0,
  activeBuffs: (gs.activeBuffs || []).filter((b) => (b.until || 0) > now()).map((b) => ({
    recipeId: String(b.recipeId), type: String(b.type), value: Number(b.value) || 0, until: Number(b.until) || 0,
  })),
  discoveredRares: (gs.discoveredRares || []).filter((id) => ITEMS[id]),
  critters: (gs.critters || []).filter((id) => CRITTER_MAP[id]),
  caughtFish: (gs.caughtFish || []).filter((id) => ITEMS[id]),
  cookedDishes: (gs.cookedDishes || []).filter((id) => RECIPE_MAP[id]),
  counters: {
    chops: Number(gs.counters?.chops) || 0,
    mines: Number(gs.counters?.mines) || 0,
    casts: Number(gs.counters?.casts) || 0,
    forages: Number(gs.counters?.forages) || 0,
    cooks: Number(gs.counters?.cooks) || 0,
    crafts: Number(gs.counters?.crafts) || 0,
    expeditions: Number(gs.counters?.expeditions) || 0,
  },
  menagerieEssenceEarned: Number(gs.menagerieEssenceEarned) || 0,
  unlockedTitles: (gs.unlockedTitles || []).filter((id) => HOMESTEAD_TITLE_MAP[id]),
  activeTitle: HOMESTEAD_TITLE_MAP[gs.activeTitle] ? gs.activeTitle : 'wanderer',
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

const TABS = [
  { id: 'gather', name: 'Gather', img: `${ICN}/Nature/018-forest.svg` },
  { id: 'expeditions', name: 'Expeditions', img: `${ICN}/Camping/009-binoculars.svg` },
  { id: 'farm', name: 'Farm', img: `${ICN}/Farm/001-gardening.svg` },
  { id: 'craft', name: 'Craft', img: `${ICN}/Camping/010-axe.svg` },
  { id: 'cook', name: 'Kitchen', img: `${ICN}/Cooking/012-frying pan.svg` },
  { id: 'inventory', name: 'Pack', img: `${ICN}/Camping/007-backpack.svg` },
  { id: 'friends', name: 'Friends', img: `${ICN}/Animals/011-squirrel.svg` },
  { id: 'class', name: 'Class', img: `${ICN}/Nature/007-world.svg` },
];

// ── Icon components (SVG with graceful fallback) ─────────────────────────────
const Ico = ({ src, tint, size = 'w-8 h-8', className = '', style = {} }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={src || FALLBACK_ICON}
    alt=""
    draggable={false}
    className={`${size} object-contain select-none ${className}`}
    style={{ filter: tint || undefined, ...style }}
    onError={(e) => { if (e.currentTarget.src.indexOf('magic%20box') === -1) e.currentTarget.src = FALLBACK_ICON; }}
  />
);
const It = ({ id, size = 'w-8 h-8', className = '' }) => (
  <Ico src={ITEMS[id]?.img} tint={ITEMS[id]?.tint} size={size} className={className} />
);
const Panel = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-emerald-900/40 bg-slate-900 shadow-lg ${className}`}>{children}</div>
);

// ═════════════════════════════════════════════════════════════════════════════
const WildwoodHomesteadGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [] }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('gather');
  const [zone, setZone] = useState('forest');
  const [spot, setSpot] = useState('creek');
  const [nodeState, setNodeState] = useState({});
  const [fishing, setFishing] = useState({ phase: 'idle' });
  const [exhaustedUntil, setExhaustedUntil] = useState(0);
  const [rareFind, setRareFind] = useState(null);       // { kind: 'curio'|'critter', id }
  const [journeyDone, setJourneyDone] = useState(null); // { landmarkId }
  const [newRecipe, setNewRecipe] = useState(null);
  const [expResult, setExpResult] = useState(null);     // { typeName, loot: [{id|critterId, qty}], soldGold }
  const [visitId, setVisitId] = useState(null);
  const [, setTick] = useState(0);

  const gsRef = useRef(gs); gsRef.current = gs;
  const invRef = useRef(null);   // synchronous shadow of inv (rapid clicks)
  const chestRef = useRef(null);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const showToastRef = useRef(showToast); showToastRef.current = showToast;
  const clickTimesRef = useRef([]);
  const exhaustedRef = useRef(0);
  const nodeStateRef = useRef({}); nodeStateRef.current = nodeState;
  const fishTimerRef = useRef(null);
  const fishingRef = useRef(fishing); fishingRef.current = fishing;
  const floatIdRef = useRef(0);
  const [floaties, setFloaties] = useState([]);         // [{ id, key, text }]

  // ── Cross-game bonuses ──────────────────────────────────────────────────────
  const forgeBonus = useMemo(() => {
    const sed = studentData?.sweetEmpireData;
    if (!sed) return { power: 0, stageName: null };
    const stage = forgeStageFor(sed);
    return { power: stage.index * 0.4, stageName: stage.index > 0 ? stage.name : null };
  }, [studentData?.sweetEmpireData]);

  const companionBonus = useMemo(() => {
    const md = studentData?.menagerieData;
    if (!md?.companionUid) return null;
    const comp = (md.creatures || []).find((c) => c.uid === md.companionUid);
    const sp = comp ? MENAGERIE_SPECIES[comp.speciesId] : null;
    if (!sp) return null;
    const bonus = COMPANION_BONUSES[sp.family];
    if (!bonus) return null;
    return { name: sp.name, img: sp.img, shiny: !!comp.shiny, level: menLevelForXp(comp.xp), ...bonus };
  }, [studentData?.menagerieData]);

  // Permanent passives: crafted gear effects + Wild Map landmark perks + friends
  const passivesOf = (cur) => {
    const total = {};
    const add = (eff) => eff && Object.entries(eff).forEach(([k, v]) => { total[k] = (total[k] || 0) + v; });
    (cur.crafted || []).forEach((id) => add(CRAFT_MAP[id]?.effect));
    (cur.discoveredLandmarks || []).forEach((id) => add(LANDMARK_MAP[id]?.effect));
    (cur.friends || []).forEach((id) => add(FRIEND_MAP[id]?.effect));
    return total;
  };

  const buffVal = useCallback((type) => {
    const cur = gsRef.current;
    let v = passivesOf(cur)[type] || 0;
    (cur.activeBuffs || []).forEach((b) => { if (b.type === type && b.until > now()) v += b.value; });
    if (companionBonus?.buffs?.[type]) v += companionBonus.buffs[type];
    return v;
  }, [companionBonus]);

  // ── Derived capacities ──────────────────────────────────────────────────────
  const capsOf = (cur) => {
    let slots = INV_BASE_SLOTS, stack = STACK_BASE, chestSlots = 0, scavBonus = 0, huntBonus = 0, expSpeed = 0, cropYield = 0, smeltSlots = SMELT_SLOTS;
    (cur.crafted || []).forEach((id) => {
      const c = CRAFT_MAP[id];
      if (!c) return;
      slots += c.slots || 0;
      stack += c.stack || 0;
      chestSlots += c.chestSlots || 0;
      scavBonus += c.scavBonus || 0;
      huntBonus += c.huntBonus || 0;
      expSpeed += c.expSpeed || 0;
      cropYield += c.effect?.cropYield || 0;
      smeltSlots += c.smeltSlots || 0;
    });
    // Landmark perks + wild friends also feed expedition stats
    const P = passivesOf(cur);
    scavBonus += P.scavBonus || 0;
    huntBonus += P.huntBonus || 0;
    expSpeed += P.expSpeed || 0;
    return { slots, stack, chestSlots, scavBonus, huntBonus, expSpeed, cropYield, smeltSlots };
  };
  const caps = useMemo(() => capsOf(gs), [gs]);
  const prosperity = useMemo(() => prosperityOf(gs), [gs]);
  const kitchenTier = gs.crafted.includes('kitchen') ? 2 : gs.crafted.includes('stove') ? 1 : 0;
  const farmPlots = FARM_BASE_PLOTS + (gs.crafted || []).reduce((n, id) => n + (CRAFT_MAP[id]?.plots || 0), 0);
  const fuelUnits = useMemo(
    () => Object.entries(gs.inv || {}).reduce((s, [id, q]) => s + (ITEMS[id]?.burn || 0) * q, 0),
    [gs.inv]
  );
  const maxExpeditions = gs.crafted.includes('camp2') ? 2 : 1;
  const usedSlots = slotsUsedOf(gs.inv, caps.stack);
  const chestUsedSlots = slotsUsedOf(gs.chest, caps.stack * 2);

  // ── Load (migrates v1 saves — unknown ids are dropped by cleanSave rules) ──
  useEffect(() => {
    if (loaded) return;
    const raw = studentData?.homesteadData;
    const d = defaultSave();
    const save = { ...d, ...(raw || {}) };
    save.inv = Object.fromEntries(Object.entries({ ...(raw?.inv || d.inv) }).filter(([id]) => ITEMS[id]));
    save.chest = Object.fromEntries(Object.entries({ ...(raw?.chest || {}) }).filter(([id]) => ITEMS[id]));
    save.skills = { ...d.skills, ...(raw?.skills || {}) };
    save.tools = { ...d.tools, ...(raw?.tools || {}) };
    save.counters = { ...d.counters, ...(raw?.counters || {}) };
    save.crafted = (raw?.crafted || []).filter((id) => CRAFT_MAP[id]);
    save.farm = (raw?.farm || []).filter((f) => CROP_BY_SEED[f.seedId]).map((f) => ({ ...f }));
    save.smelting = (raw?.smelting || []).map((s) => ({ ...s }));
    save.sawing = (raw?.sawing || []).map((s) => ({ ...s }));
    save.discoveredLandmarks = (raw?.discoveredLandmarks || []).filter((id) => LANDMARK_MAP[id]);
    save.friendsFed = { ...(raw?.friendsFed || {}) };
    save.friends = (raw?.friends || []).filter((id) => FRIEND_MAP[id]);
    save.pensAt = { ...(raw?.pensAt || {}) };
    // Ensure every owned pen has a collection anchor
    save.crafted.forEach((id) => { if (CRAFT_MAP[id]?.pen && !save.pensAt[CRAFT_MAP[id].pen]) save.pensAt[CRAFT_MAP[id].pen] = now(); });
    save.expeditions = (raw?.expeditions || []).map((e) => ({ ...e }));
    save.knownRecipes = (raw?.knownRecipes || d.knownRecipes).filter((id) => RECIPE_MAP[id]);
    if (save.knownRecipes.length === 0) save.knownRecipes = d.knownRecipes;
    save.activeBuffs = (raw?.activeBuffs || []).filter((b) => (b.until || 0) > now() && RECIPE_MAP[b.recipeId]);
    save.discoveredRares = (raw?.discoveredRares || []).filter((id) => ITEMS[id]);
    save.critters = (raw?.critters || []).filter((id) => CRITTER_MAP[id]);
    save.caughtFish = (raw?.caughtFish || []).filter((id) => ITEMS[id]);
    save.cookedDishes = (raw?.cookedDishes || []).filter((id) => RECIPE_MAP[id]);
    invRef.current = { ...save.inv };
    chestRef.current = { ...save.chest };
    setGs(save);
    setLoaded(true);
    dirtyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Ticker ──────────────────────────────────────────────────────────────────
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
      fresh.forEach((id) => showToastRef.current(`Title unlocked: ${HOMESTEAD_TITLE_MAP[id].name}!`, 'success'));
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

  // ── Inventory core (slot + stack aware; overflow auto-sold) ────────────────
  const countOf = (id) => Math.floor((invRef.current || gsRef.current.inv)?.[id] || 0);

  const addLoot = (gains, { sellOverflow = true } = {}) => {
    const cur = gsRef.current;
    const c = capsOf(cur);
    const inv = { ...(invRef.current || cur.inv) };
    let soldGold = 0;
    const soldItems = [];
    Object.entries(gains).forEach(([id, q]) => {
      q = Math.floor(q);
      if (!ITEMS[id] || q === 0) return;
      if (q < 0) {
        inv[id] = Math.max(0, (inv[id] || 0) + q);
        if (inv[id] === 0) delete inv[id];
        return;
      }
      // Multi-stack: this item may occupy several slots (one per stack of `c.stack`)
      const have = inv[id] || 0;
      const used = slotsUsedOf(inv, c.stack);
      const freeSlots = c.slots - used + Math.ceil(have / c.stack); // slots available to THIS item
      const maxTotal = freeSlots * c.stack;
      const add = Math.max(0, Math.min(q, maxTotal - have));
      if (add > 0) inv[id] = have + add;
      const over = q - add;
      if (over > 0 && sellOverflow) {
        soldGold += (ITEMS[id].sell || 0) * over;
        soldItems.push(`${over} ${ITEMS[id].name}`);
      }
    });
    invRef.current = inv;
    setGs((p) => ({ ...p, inv: { ...inv }, gold: p.gold + soldGold }));
    dirtyRef.current = true;
    if (soldItems.length > 0) {
      showToastRef.current(`Pack full! Overflow sold: ${soldItems.join(', ')} (+${soldGold} gold). Craft bags & crates to carry more!`, 'info');
    }
    return { soldGold };
  };

  const canFit = (id, q = 1) => {
    const c = capsOf(gsRef.current);
    const inv = invRef.current || gsRef.current.inv;
    const have = inv?.[id] || 0;
    const used = slotsUsedOf(inv, c.stack);
    const newUsed = used - Math.ceil(have / c.stack) + Math.ceil((have + q) / c.stack);
    return newUsed <= c.slots;
  };

  const hasItems = (req) => Object.entries(req || {}).every(([id, q]) => q === 0 || countOf(id) >= q);

  const consumeFuel = (units) => {
    const inv = invRef.current || gsRef.current.inv;
    const woods = Object.keys(inv || {}).filter((id) => ITEMS[id]?.burn).sort((a, b) => ITEMS[a].burn - ITEMS[b].burn);
    let need = Math.max(1, Math.ceil(units * (1 - Math.min(0.5, buffVal('fuelSave') / 100))));
    const spend = {};
    for (const id of woods) {
      if (need <= 0) break;
      const take = Math.min(inv[id], Math.ceil(need / ITEMS[id].burn));
      spend[id] = -take;
      need -= take * ITEMS[id].burn;
    }
    if (need > 0) return false;
    addLoot(spend);
    return true;
  };

  // Chest: move items between inventory and camp chest (chest stacks are 2×)
  const chestMove = (id, qty, toChest) => {
    const cur = gsRef.current;
    const c = capsOf(cur);
    if (c.chestSlots === 0) return;
    const inv = { ...(invRef.current || cur.inv) };
    const chest = { ...(chestRef.current || cur.chest) };
    // Multi-stack capacity on both sides
    const capacityFor = (store, itemId, stackSize, slotLimit) => {
      const have = store[itemId] || 0;
      const used = slotsUsedOf(store, stackSize);
      const freeSlots = slotLimit - used + Math.ceil(have / stackSize);
      return Math.max(0, freeSlots * stackSize - have);
    };
    if (toChest) {
      const n = Math.min(qty, inv[id] || 0);
      if (n <= 0) return;
      const move = Math.min(n, capacityFor(chest, id, c.stack * 2, c.chestSlots));
      if (move <= 0) { showToastRef.current('Chest is full!', 'error'); return; }
      chest[id] = (chest[id] || 0) + move;
      inv[id] -= move;
      if (inv[id] <= 0) delete inv[id];
    } else {
      const n = Math.min(qty, chest[id] || 0);
      if (n <= 0) return;
      const move = Math.min(n, capacityFor(inv, id, c.stack, c.slots));
      if (move <= 0) { showToastRef.current('No room in your pack!', 'error'); return; }
      inv[id] = (inv[id] || 0) + move;
      chest[id] -= move;
      if (chest[id] <= 0) delete chest[id];
    }
    invRef.current = inv;
    chestRef.current = chest;
    setGs((p) => ({ ...p, inv: { ...inv }, chest: { ...chest } }));
    dirtyRef.current = true;
  };

  // ── Essence / skills / discoveries ─────────────────────────────────────────
  const earnMenagerieEssence = (amount, reason) => {
    setGs((p) => ({ ...p, menagerieEssenceEarned: (p.menagerieEssenceEarned || 0) + amount }));
    showToastRef.current(`${reason} +${amount} Wild Essence sent to your Menagerie!`, 'success');
    dirtyRef.current = true;
  };

  const gainSkillXp = (skill, amount) => {
    const boosted = Math.round(amount * (1 + buffVal('xpBoost') / 100));
    const before = skillLevel(gsRef.current.skills?.[skill] || 0);
    setGs((p) => ({ ...p, skills: { ...p.skills, [skill]: (p.skills?.[skill] || 0) + boosted } }));
    const after = skillLevel((gsRef.current.skills?.[skill] || 0) + boosted);
    if (after > before) {
      showToast(`${SKILLS[skill].name} reached level ${after}!`, 'success');
      earnMenagerieEssence(10, `${SKILLS[skill].name} level up!`);
    }
    dirtyRef.current = true;
  };

  const foundCurio = (itemId) => {
    addLoot({ [itemId]: 1 });
    const cur = gsRef.current;
    if (!(cur.discoveredRares || []).includes(itemId)) {
      setGs((p) => ({ ...p, discoveredRares: [...(p.discoveredRares || []), itemId] }));
      setRareFind({ kind: 'curio', id: itemId });
      earnMenagerieEssence(40, `${ITEMS[itemId].name} discovered!`);
    } else {
      showToast(`Another ${ITEMS[itemId].name}!`, 'success');
    }
  };

  const foundCritter = (critterId) => {
    const cur = gsRef.current;
    if (!(cur.critters || []).includes(critterId)) {
      setGs((p) => ({ ...p, critters: [...(p.critters || []), critterId] }));
      setRareFind({ kind: 'critter', id: critterId });
      earnMenagerieEssence(20, `${CRITTER_MAP[critterId].name} collected!`);
    } else {
      setGs((p) => ({ ...p, gold: p.gold + 5 }));
      showToast(`Another ${CRITTER_MAP[critterId].name} — released for 5 gold.`, 'info');
    }
  };

  const rollRares = (rares) => {
    const luck = 1 + buffVal('rareLuck') / 100;
    rares.forEach((r) => {
      if (Math.random() < r.chance * luck) {
        if (r.id === 'recipe_scroll') {
          setGs((p) => ({ ...p, unreadScrolls: (p.unreadScrolls || 0) + 1 }));
          showToast('You found a Recipe Scroll! Read it in the Kitchen.', 'success');
        } else if (ITEMS[r.id]?.kind === 'curio') {
          foundCurio(r.id);
        } else {
          addLoot({ [r.id]: 1 });
          showToast(`Bonus find: ${ITEMS[r.id].name}!`, 'success');
        }
      }
    });
  };

  // ── Anti-autoclicker ────────────────────────────────────────────────────────
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
      showToastRef.current('Whoa — nobody swings THAT fast! You need a 15s breather…', 'error');
      return false;
    }
    return true;
  };

  // ── Gathering ───────────────────────────────────────────────────────────────
  const toolPower = (toolId) => {
    const base = toolId ? (TOOL_TIERS[gsRef.current.tools?.[toolId] || 0]?.power || 1) : 1;
    return base * (1 + buffVal('gatherSpeed') / 100) + forgeBonus.power;
  };
  const clicksNeeded = (node, toolId) => Math.max(2, Math.ceil(node.hardness / toolPower(toolId)));

  const pushFloaty = (key, text) => {
    const id = floatIdRef.current++;
    setFloaties((f) => [...f.slice(-8), { id, key, text }]);
    setTimeout(() => setFloaties((f) => f.filter((x) => x.id !== id)), 900);
  };

  const strikeNode = (zoneDef, node) => {
    if (!registerStrike()) return;
    const skill = zoneDef.skill;
    const lvl = skillLevel(gsRef.current.skills?.[skill] || 0);
    if (lvl < node.level) return;
    const key = `${zoneDef.id}_${node.id}`;
    const st = nodeStateRef.current[key] || { stock: node.stock, hitsLeft: clicksNeeded(node, zoneDef.tool), respawnAt: 0 };
    if (st.respawnAt > now()) return;
    if (!canFit(node.yieldId, 1)) {
      showToastRef.current(`No room for ${ITEMS[node.yieldId].name}! Sell, store or craft a bigger pack.`, 'error');
      return;
    }

    if (st.hitsLeft > 1) {
      const next = { ...st, hitsLeft: st.hitsLeft - 1 };
      nodeStateRef.current = { ...nodeStateRef.current, [key]: next };
      setNodeState(nodeStateRef.current);
      return;
    }
    // Yield!
    const dbl = Math.random() < buffVal('doubleDrop') / 100;
    const qty = dbl ? 2 : 1;
    addLoot({ [node.yieldId]: qty });
    pushFloaty(key, `+${qty} ${ITEMS[node.yieldId].name}`);
    gainSkillXp(skill, node.xp);
    rollRares(node.rares || []);
    const counterKey = { wood: 'chops', mine: 'mines', forage: 'forages' }[skill];
    if (counterKey) setGs((p) => ({ ...p, counters: { ...p.counters, [counterKey]: (p.counters?.[counterKey] || 0) + 1 } }));

    const nextStock = st.stock - 1;
    const respawnMs = node.respawnSec * 1000 * (1 - Math.min(0.5, buffVal('respawnFast') / 100));
    const next = nextStock <= 0
      ? { stock: node.stock, hitsLeft: clicksNeeded(node, zoneDef.tool), respawnAt: now() + respawnMs }
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
        showToastRef.current('It slipped away… cast again!', 'error');
      }, windowMs);
    }, waitMs);
  };

  const reelIn = () => {
    const f = fishingRef.current;
    if (f.phase === 'waiting') {
      clearTimeout(fishTimerRef.current);
      setFishing({ phase: 'idle' });
      showToast('Too eager! You scared it off — wait for the bite!', 'error');
      return;
    }
    if (f.phase !== 'bite') return;
    clearTimeout(fishTimerRef.current);
    setFishing({ phase: 'idle' });

    const spotDef = FISHING_SPOTS.find((s) => s.id === spot) || FISHING_SPOTS[0];
    const luck = 1 + buffVal('fishLuck') / 100;
    const rows = spotDef.table;
    const weightOf = ([id, w]) => (ITEMS[id]?.rare || ITEMS[id]?.kind === 'curio' ? w * luck : w);
    const total = rows.reduce((s, r) => s + weightOf(r), 0);
    let roll = Math.random() * total;
    let pickedId = rows[0][0];
    for (const r of rows) { roll -= weightOf(r); if (roll <= 0) { pickedId = r[0]; break; } }
    if (pickedId === 'old_junk') pickedId = JUNK_IDS[Math.floor(Math.random() * JUNK_IDS.length)];

    const item = ITEMS[pickedId];
    if (item.kind === 'curio') {
      foundCurio(pickedId);
    } else {
      addLoot({ [pickedId]: 1 });
      showToast(`Caught: ${item.name}!${item.rare ? ' INCREDIBLE!' : ''}`, item.rare ? 'success' : 'info');
    }
    if (item.kind === 'fish' && !(gsRef.current.caughtFish || []).includes(pickedId)) {
      setGs((p) => ({ ...p, caughtFish: [...(p.caughtFish || []), pickedId] }));
      if (item.rare) earnMenagerieEssence(40, `${item.name} caught!`);
    }
    gainSkillXp('fish', FISH_XP[pickedId] || 3);
  };

  // ── Expeditions ─────────────────────────────────────────────────────────────
  const expeditionSlotFree = () => {
    const cur = gsRef.current;
    if ((cur.expeditions || []).length >= maxExpeditions) {
      showToast(maxExpeditions === 1 ? 'You can only run one expedition at a time — build a Forward Camp for two!' : 'Both expedition parties are already out!', 'error');
      return false;
    }
    return true;
  };

  const startExpedition = (type, tierIdx) => {
    const cur = gsRef.current;
    const def = EXPEDITIONS[type];
    if (def.needs && !cur.crafted.includes(def.needs)) return;
    const dur = def.durations[tierIdx];
    if (dur.needsCraft && !cur.crafted.includes(dur.needsCraft)) return;
    if (dur.needsLandmark && !(cur.discoveredLandmarks || []).includes(dur.needsLandmark)) return;
    if (!expeditionSlotFree()) return;
    const speed = 1 - Math.min(0.5, capsOf(cur).expSpeed / 100);
    setGs((p) => ({
      ...p,
      expeditions: [...(p.expeditions || []), { id: newUid(), type, tier: tierIdx, returnAt: now() + dur.minutes * 60 * 1000 * speed }],
      counters: { ...p.counters, expeditions: (p.counters?.expeditions || 0) + 1 },
    }));
    showToast(`${def.name} — ${dur.name} underway! Check back soon.`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Wild Map journeys ───────────────────────────────────────────────────────
  const landmarkState = (lm) => {
    const cur = gsRef.current;
    const idx = LANDMARKS.findIndex((l) => l.id === lm.id);
    if ((cur.discoveredLandmarks || []).includes(lm.id)) return 'discovered';
    if (idx > 0 && !(cur.discoveredLandmarks || []).includes(LANDMARKS[idx - 1].id)) return 'locked';
    if ((cur.expeditions || []).some((e) => e.type === 'journey' && e.landmarkId === lm.id)) return 'travelling';
    if ((lm.needs || []).some((n) => !cur.crafted.includes(n))) return 'gearLocked';
    return 'ready';
  };

  const startJourney = (lm) => {
    if (landmarkState(lm) !== 'ready') return;
    if (!expeditionSlotFree()) return;
    const speed = 1 - Math.min(0.5, capsOf(gsRef.current).expSpeed / 100);
    setGs((p) => ({
      ...p,
      expeditions: [...(p.expeditions || []), { id: newUid(), type: 'journey', tier: 0, landmarkId: lm.id, returnAt: now() + lm.hours * 3600 * 1000 * speed }],
      counters: { ...p.counters, expeditions: (p.counters?.expeditions || 0) + 1 },
    }));
    showToast(`Setting out for the ${lm.name} — a ${lm.hours}h journey!`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const collectJourney = (exp) => {
    const lm = LANDMARK_MAP[exp.landmarkId];
    if (!lm || now() < exp.returnAt) return;
    setGs((p) => ({
      ...p,
      expeditions: (p.expeditions || []).filter((e) => e.id !== exp.id),
      discoveredLandmarks: (p.discoveredLandmarks || []).includes(lm.id) ? p.discoveredLandmarks : [...(p.discoveredLandmarks || []), lm.id],
      gold: p.gold + (lm.reward.gold || 0),
      unreadScrolls: (p.unreadScrolls || 0) + (lm.reward.scrolls || 0),
    }));
    if (lm.reward.items) addLoot(lm.reward.items);
    if (lm.reward.curio) foundCurio(lm.reward.curio);
    if (lm.reward.essence) earnMenagerieEssence(lm.reward.essence, `${lm.name} discovered!`);
    else earnMenagerieEssence(50, `${lm.name} discovered!`);
    gainSkillXp('forage', 30 + lm.hours * 5);
    setJourneyDone({ landmarkId: lm.id });
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const collectExpedition = (exp) => {
    if (now() < exp.returnAt) return;
    if (exp.type === 'journey') { collectJourney(exp); return; }
    const cur = gsRef.current;
    const def = EXPEDITIONS[exp.type];
    const dur = def.durations[exp.tier] || def.durations[0];
    const c = capsOf(cur);
    const bonus = exp.type === 'hunt' ? c.huntBonus : c.scavBonus;
    const rolls = Math.round(dur.rolls * (1 + bonus / 100));
    const expLuck = 1 + buffVal('expLuck') / 100;

    const table = dur.table || def.table; // hunts have per-quarry loot tables
    const isLucky = (id) => id === 'CURIO' || id === 'recipe_scroll' || ITEMS[id]?.kind === 'rareIng' || ITEMS[id]?.kind === 'curio' || ITEMS[id]?.rarity === 'legendary';
    const weightOf = ([id, w]) => (isLucky(id) ? w * expLuck : w);
    const total = table.reduce((s, r) => s + weightOf(r), 0);

    const loot = {};       // itemId -> qty
    const critterFinds = [];
    let scrolls = 0;
    const curios = [];
    for (let i = 0; i < rolls; i++) {
      let roll = Math.random() * total;
      let picked = table[0][0];
      for (const r of table) { roll -= weightOf(r); if (roll <= 0) { picked = r[0]; break; } }
      if (picked === 'CRITTER') critterFinds.push(rollCritter().id);
      else if (picked === 'SEED') { const sid = SEED_DROPS[Math.floor(Math.random() * SEED_DROPS.length)]; loot[sid] = (loot[sid] || 0) + 1; }
      else if (picked === 'CURIO') curios.push(RANDOM_CURIO_IDS[Math.floor(Math.random() * RANDOM_CURIO_IDS.length)]);
      else if (picked === 'recipe_scroll') scrolls += 1;
      else if (ITEMS[picked]?.kind === 'curio') curios.push(picked); // named curios (amber, crest…)
      else loot[picked] = (loot[picked] || 0) + 1;
    }

    setGs((p) => ({ ...p, expeditions: (p.expeditions || []).filter((e) => e.id !== exp.id) }));
    const { soldGold } = addLoot(loot);
    if (scrolls > 0) setGs((p) => ({ ...p, unreadScrolls: (p.unreadScrolls || 0) + scrolls }));
    curios.forEach((id) => foundCurio(id));
    critterFinds.forEach((id) => foundCritter(id));
    gainSkillXp(exp.type === 'hunt' ? 'hunt' : 'forage', rolls * (exp.type === 'hunt' ? HUNT_XP_PER_ROLL : SCAV_XP_PER_ROLL));

    setExpResult({
      typeName: `${def.name} — ${dur.name}`,
      loot: Object.entries(loot).map(([id, qty]) => ({ id, qty })),
      critters: critterFinds,
      scrolls,
      curios,
      soldGold,
    });
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Farm + pens + trade ─────────────────────────────────────────────────────
  const plantSeed = (plot, seedId) => {
    const crop = CROP_BY_SEED[seedId];
    if (!crop || countOf(seedId) < 1) return;
    const fast = 1 - Math.min(0.6, buffVal('cropFast') / 100);
    addLoot({ [seedId]: -1 });
    setGs((p) => ({ ...p, farm: [...p.farm, { plot, seedId, readyAt: now() + crop.growMin * 60 * 1000 * fast }] }));
    dirtyRef.current = true;
  };

  const harvest = (plotEntry) => {
    if (now() < plotEntry.readyAt) return;
    const crop = CROP_BY_SEED[plotEntry.seedId];
    const golden = Math.random() < GOLDEN_CROP_CHANCE;
    const qty = (crop.yield + caps.cropYield) * (golden ? 2 : 1);
    setGs((p) => ({ ...p, farm: p.farm.filter((f) => f.plot !== plotEntry.plot) }));
    addLoot({ [crop.cropId]: qty });
    showToast(`${golden ? 'GOLDEN harvest! ' : ''}+${qty} ${ITEMS[crop.cropId].name}!`, 'success');
    if (golden) earnMenagerieEssence(15, 'Golden harvest!');
    gainSkillXp('forage', Math.round(crop.growMin / 10) + 3);
  };

  const pensOwned = PENS.concat([PEN_MAP.beebox, PEN_MAP.fishtrap]).filter((p) => gs.crafted.includes(p.id));
  const penPending = (pen) => {
    const anchor = gs.pensAt?.[pen.id] || now();
    const hours = Math.min(pen.capHours, (now() - anchor) / 3600000);
    return Math.floor(hours * pen.perHour * (1 + buffVal('penBoost') / 100));
  };
  const collectPen = (pen) => {
    const n = penPending(pen);
    if (n < 1) return;
    setGs((p) => ({ ...p, pensAt: { ...p.pensAt, [pen.id]: now() } }));
    addLoot({ [pen.produceId]: n });
    showToast(`Collected ${n} ${ITEMS[pen.produceId].name} from the ${pen.name}!`, 'success');
  };

  const pressCheese = () => {
    if (!gsRef.current.crafted.includes('cheesepress')) return;
    if (!hasItems(CHEESE_RECIPE.in)) return;
    if (!canFit(CHEESE_RECIPE.out, CHEESE_RECIPE.outQty)) { showToast('No room for cheese!', 'error'); return; }
    addLoot({ ...Object.fromEntries(Object.entries(CHEESE_RECIPE.in).map(([id, q]) => [id, -q])), [CHEESE_RECIPE.out]: CHEESE_RECIPE.outQty });
    showToast('Pressed a wheel of Wildwood Cheese!', 'success');
    gainSkillXp('cook', 8);
  };

  const buySeed = (crop) => {
    if (gsRef.current.gold < crop.seedCost) return;
    if (!canFit(crop.seedId, 1)) { showToast('No room in your pack!', 'error'); return; }
    setGs((p) => ({ ...p, gold: p.gold - crop.seedCost }));
    addLoot({ [crop.seedId]: 1 });
  };

  const buyTrade = (id) => {
    const cost = ITEMS[id]?.cost || 0;
    if (!cost || gsRef.current.gold < cost) return;
    if (!canFit(id, 1)) { showToast('No room in your pack!', 'error'); return; }
    setGs((p) => ({ ...p, gold: p.gold - cost }));
    addLoot({ [id]: 1 });
  };

  const sellItem = (id, qty) => {
    const n = Math.min(qty, countOf(id));
    if (n <= 0 || !ITEMS[id].sell) return;
    addLoot({ [id]: -n });
    setGs((p) => ({ ...p, gold: p.gold + ITEMS[id].sell * n }));
  };

  // ── Smelting ────────────────────────────────────────────────────────────────
  const startSmelt = (recipe) => {
    const cur = gsRef.current;
    if (!cur.crafted.includes('smelter')) return;
    const maxSlots = capsOf(cur).smeltSlots;
    const usedSmeltSlots = cur.smelting.map((s) => s.slot);
    const slot = Array.from({ length: maxSlots }, (_, i) => i).find((i) => !usedSmeltSlots.includes(i));
    if (slot === undefined) { showToast('The furnace is full — upgrade it for more slots!', 'error'); return; }
    if (countOf(recipe.oreId) < recipe.ore) return;
    if (!consumeFuel(recipe.fuel)) { showToast('Not enough wood fuel!', 'error'); return; }
    addLoot({ [recipe.oreId]: -recipe.ore });
    const fast = 1 - Math.min(0.75, buffVal('smeltFast') / 100);
    setGs((p) => ({ ...p, smelting: [...p.smelting, { slot, barId: recipe.barId, doneAt: now() + recipe.minutes * 60 * 1000 * fast }] }));
    dirtyRef.current = true;
  };

  const collectBar = (job) => {
    if (now() < job.doneAt) return;
    if (!canFit(job.barId, 1)) { showToast('No room for the bar — clear a slot first!', 'error'); return; }
    setGs((p) => ({ ...p, smelting: p.smelting.filter((s) => s.slot !== job.slot) }));
    addLoot({ [job.barId]: 1 });
    showToast(`${ITEMS[job.barId].name} ready!`, 'success');
    gainSkillXp('mine', 8);
  };

  // ── Sawmill (logs → planks, real time) ─────────────────────────────────────
  const startSaw = (recipe) => {
    const cur = gsRef.current;
    if (!cur.crafted.includes('sawmill')) return;
    const usedSawSlots = (cur.sawing || []).map((s) => s.slot);
    const slot = Array.from({ length: SAW_SLOTS }, (_, i) => i).find((i) => !usedSawSlots.includes(i));
    if (slot === undefined) { showToast('The sawmill is busy!', 'error'); return; }
    if (countOf(recipe.woodId) < recipe.wood) return;
    addLoot({ [recipe.woodId]: -recipe.wood });
    setGs((p) => ({ ...p, sawing: [...(p.sawing || []), { slot, planks: recipe.planks, doneAt: now() + recipe.minutes * 60 * 1000 }] }));
    dirtyRef.current = true;
  };

  const collectPlanks = (job) => {
    if (now() < job.doneAt) return;
    if (!canFit('plank', job.planks)) { showToast('No room for the planks — clear a slot first!', 'error'); return; }
    setGs((p) => ({ ...p, sawing: (p.sawing || []).filter((s) => s.slot !== job.slot) }));
    addLoot({ plank: job.planks });
    showToast(`${job.planks} Wood Plank${job.planks !== 1 ? 's' : ''} ready!`, 'success');
    gainSkillXp('wood', 6);
  };

  // ── Wild Friends (feed dishes to befriend) ─────────────────────────────────
  const feedFriend = (friend) => {
    const cur = gsRef.current;
    if ((cur.friends || []).includes(friend.id)) return;
    const dishId = dishIdOf(friend.dish);
    if (countOf(dishId) < 1) { showToast(`The ${friend.name} wants ${RECIPE_MAP[friend.dish]?.name} — cook one first!`, 'error'); return; }
    addLoot({ [dishId]: -1 });
    const fed = (cur.friendsFed?.[friend.id] || 0) + 1;
    if (fed >= friend.feeds) {
      setGs((p) => ({
        ...p,
        friendsFed: { ...p.friendsFed, [friend.id]: fed },
        friends: [...(p.friends || []), friend.id],
      }));
      showToast(`The ${friend.name} is now your friend! ${friend.effect ? friend.desc : ''}`, 'success');
      earnMenagerieEssence(25, `${friend.name} befriended!`);
    } else {
      setGs((p) => ({ ...p, friendsFed: { ...p.friendsFed, [friend.id]: fed } }));
      showToast(`The ${friend.name} munches happily… (${fed}/${friend.feeds})`, 'success');
    }
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Cooking ─────────────────────────────────────────────────────────────────
  const recipeKnown = (r, cur = gsRef.current) =>
    cur.knownRecipes.includes(r.id) || r.start || (r.cookLevel && skillLevel(cur.skills?.cook || 0) >= r.cookLevel);

  // Cooking PRODUCES a dish item — stash it, sell it, or eat it when needed.
  const cookRecipe = (r) => {
    const cur = gsRef.current;
    if (!recipeKnown(r, cur)) return;
    if (kitchenTier < r.tier) { showToast(`Needs a ${KITCHEN_TIERS[r.tier].name}!`, 'error'); return; }
    if (r.cauldron && !cur.crafted.includes('cauldron')) { showToast('Needs the Witch Cauldron!', 'error'); return; }
    if (!hasItems(r.ing)) return;
    if (!canFit(dishIdOf(r.id), 1)) { showToast('No room to plate it up — clear a pack slot!', 'error'); return; }
    if (!consumeFuel(r.fuel)) { showToast('Not enough wood fuel — chop some logs!', 'error'); return; }
    addLoot({ ...Object.fromEntries(Object.entries(r.ing).map(([id, q]) => [id, -q])), [dishIdOf(r.id)]: 1 });
    if (!(cur.cookedDishes || []).includes(r.id)) earnMenagerieEssence(15, 'New dish mastered!');
    setGs((p) => ({
      ...p,
      cookedDishes: (p.cookedDishes || []).includes(r.id) ? p.cookedDishes : [...(p.cookedDishes || []), r.id],
      knownRecipes: (p.knownRecipes || []).includes(r.id) ? p.knownRecipes : [...(p.knownRecipes || []), r.id],
      counters: { ...p.counters, cooks: (p.counters?.cooks || 0) + 1 },
    }));
    gainSkillXp('cook', r.xp);
    showToast(`${r.name} cooked and packed! Eat it whenever you need the boost.`, 'success');
    dirtyRef.current = true;
  };

  const eatDish = (dishId) => {
    const r = RECIPE_MAP[ITEMS[dishId]?.recipeId];
    if (!r || countOf(dishId) < 1) return;
    const cur = gsRef.current;
    if ((cur.activeBuffs || []).filter((b) => b.until > now()).length >= MAX_ACTIVE_BUFFS) {
      showToast(`You're full! (max ${MAX_ACTIVE_BUFFS} active meals)`, 'error'); return;
    }
    addLoot({ [dishId]: -1 });
    setGs((p) => ({
      ...p,
      activeBuffs: [...(p.activeBuffs || []).filter((b) => b.until > now()), { recipeId: r.id, type: r.buff.type, value: r.buff.value, until: now() + r.buff.minutes * 60 * 1000 }],
    }));
    const bl = BUFF_LABELS[r.buff.type];
    showToast(`Delicious! +${r.buff.value}% ${bl.name} for ${r.buff.minutes} min.`, 'success');
    dirtyRef.current = true;
  };

  const readScroll = () => {
    const cur = gsRef.current;
    if ((cur.unreadScrolls || 0) < 1) return;
    const unknown = SCROLL_RECIPES.filter((id) => !cur.knownRecipes.includes(id));
    if (unknown.length === 0) {
      setGs((p) => ({ ...p, unreadScrolls: p.unreadScrolls - 1, gold: p.gold + 30 }));
      showToast('A recipe you already know — you trade the scroll for 30 gold.', 'info');
      return;
    }
    const id = unknown[Math.floor(Math.random() * unknown.length)];
    setGs((p) => ({ ...p, unreadScrolls: p.unreadScrolls - 1, knownRecipes: [...p.knownRecipes, id] }));
    setNewRecipe({ recipeId: id });
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  // ── Crafting + tools ────────────────────────────────────────────────────────
  const craftItem = (c) => {
    const cur = gsRef.current;
    if (cur.crafted.includes(c.id)) return;
    if ((c.needs || []).some((n) => !cur.crafted.includes(n))) return;
    if (c.skill && skillLevel(cur.skills?.[c.skill[0]] || 0) < c.skill[1]) return;
    const realItems = Object.fromEntries(Object.entries(c.items).filter(([id, q]) => ITEMS[id] && q > 0));
    if (!hasItems(realItems)) return;
    addLoot(Object.fromEntries(Object.entries(realItems).map(([id, q]) => [id, -q])));
    setGs((p) => ({
      ...p,
      crafted: [...p.crafted, c.id],
      pensAt: c.pen ? { ...p.pensAt, [c.pen]: now() } : p.pensAt,
      counters: { ...p.counters, crafts: (p.counters?.crafts || 0) + 1 },
    }));
    showToast(`${c.name} built!`, 'success');
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
    addLoot(Object.fromEntries(Object.entries(cost).map(([id, q]) => [id, -q])));
    setGs((p) => ({ ...p, tools: { ...p.tools, [toolId]: nextTier } }));
    showToast(`${TOOL_TIERS[nextTier].name} ${TOOL_DEFS[toolId].name} forged!`, 'success');
    dirtyRef.current = true;
    setTimeout(persist, 400);
  };

  const equipTitle = (id) => {
    setGs((p) => ({ ...p, activeTitle: p.activeTitle === id ? 'wanderer' : id }));
    dirtyRef.current = true;
    setTimeout(persist, 400);
    showToast('Title updated — it shows on your class card!', 'success');
  };

  // ── UI bits ─────────────────────────────────────────────────────────────────
  const exhausted = exhaustedUntil > now();
  const activeBuffs = (gs.activeBuffs || []).filter((b) => b.until > now());

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
        @keyframes wh-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes wh-shake { 0%,100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
        @keyframes wh-float { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-44px); } }
        @keyframes wh-glow { 0%,100% { filter: drop-shadow(0 0 4px rgba(251,191,36,.5)); } 50% { filter: drop-shadow(0 0 14px rgba(251,191,36,.9)); } }
      `}</style>

      {/* ── Header ── */}
      <div
        className="rounded-2xl p-5 text-white shadow-xl border border-emerald-800/50 bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(rgba(6,20,12,0.82), rgba(6,20,12,0.9)), url('/Loot/Backgrounds/day.png')" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Ico src={`${ICN}/Camping/001-fire.svg`} size="w-12 h-12" style={{ animation: 'wh-glow 2s ease-in-out infinite' }} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold drop-shadow">Wildwood Homestead</h1>
              <p className="text-emerald-100/80 text-sm">Gather. Craft. Expand your pack. Tame the wilds.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-300 drop-shadow">{fmtQty(prosperity)}</p>
            <p className="text-emerald-100/80 text-sm font-semibold">Prosperity</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-black/40 border border-amber-500/40 text-amber-300 rounded-full px-3 py-1 flex items-center gap-1.5">
            <Ico src={GOLD_ICON} size="w-4 h-4" /> {fmtQty(gs.gold)}
          </span>
          <span className={`rounded-full px-3 py-1 border ${usedSlots >= caps.slots ? 'bg-red-900/60 border-red-500/60 text-red-300' : 'bg-black/40 border-white/20 text-white/90'}`}>
            Pack {usedSlots}/{caps.slots} slots
          </span>
          <span className="bg-black/40 border border-white/20 rounded-full px-3 py-1 text-white/90">Stacks of {caps.stack}</span>
          <span className="bg-black/40 border border-white/20 rounded-full px-3 py-1 text-white/90">Fuel {fmtQty(fuelUnits)}</span>
          {gs.unreadScrolls > 0 && (
            <button onClick={() => setTab('cook')} className="bg-amber-400 text-amber-950 rounded-full px-3 py-1 animate-pulse flex items-center gap-1">
              <Ico src={`${ICN}/Magic/030-scroll.svg`} size="w-4 h-4" /> {gs.unreadScrolls} scroll{gs.unreadScrolls !== 1 ? 's' : ''}!
            </button>
          )}
          {(gs.menagerieEssenceEarned || 0) > 0 && (
            <span className="bg-black/40 border border-fuchsia-400/40 text-fuchsia-300 rounded-full px-3 py-1" title="Discoveries send Wild Essence to your Menagerie">
              {fmtQty(gs.menagerieEssenceEarned)} essence for your Menagerie
            </span>
          )}
        </div>
        {(forgeBonus.stageName || companionBonus) && (
          <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-bold">
            {forgeBonus.stageName && (
              <span className="bg-indigo-900/60 border border-indigo-400/40 text-indigo-200 rounded-full px-3 py-1">
                Forge weapon “{forgeBonus.stageName}”: +{forgeBonus.power.toFixed(1)} gather power
              </span>
            )}
            {companionBonus && (
              <span className="bg-amber-900/50 border border-amber-400/40 text-amber-200 rounded-full px-3 py-1 flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={companionBonus.img} alt={companionBonus.name} className="w-4 h-4 rounded-full object-cover"
                  style={companionBonus.shiny ? { filter: 'hue-rotate(45deg) saturate(1.7)' } : undefined} />
                {companionBonus.name} helps: {companionBonus.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Active buffs + exhaustion ── */}
      {(activeBuffs.length > 0 || exhausted) && (
        <div className="flex flex-wrap gap-2">
          {activeBuffs.map((b, i) => {
            const r = RECIPE_MAP[b.recipeId];
            const bl = BUFF_LABELS[b.type];
            return (
              <span key={i} className="bg-orange-950 border border-orange-500/50 text-orange-300 text-xs font-bold rounded-full pl-1 pr-3 py-1 flex items-center gap-1.5">
                <Ico src={r?.img} size="w-5 h-5" /> {r?.name}: +{b.value}% {bl.name} · {fmtCountdown(b.until - now())}
              </span>
            );
          })}
          {exhausted && (
            <span className="bg-red-950 border border-red-500/60 text-red-300 text-xs font-bold rounded-full px-3 py-1 animate-pulse">
              Exhausted — resting {fmtCountdown(exhaustedUntil - now())}
            </span>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
              tab === t.id ? 'bg-emerald-700 text-white shadow-lg border border-emerald-500' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-600'
            }`}
          >
            <Ico src={t.img} size="w-5 h-5" className={tab === t.id ? '' : 'opacity-80'} /> {t.name}
            {t.id === 'expeditions' && gs.expeditions.some((e) => now() >= e.returnAt) && (
              <span className="bg-amber-400 text-amber-950 text-[10px] rounded-full px-1.5 animate-pulse">!</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ GATHER ══ */}
      {tab === 'gather' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ZONES.map((z) => (
              <button key={z.id} onClick={() => setZone(z.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${zone === z.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-600'}`}>
                <Ico src={z.img} size="w-4 h-4" /> {z.name}
              </button>
            ))}
          </div>

          {ZONES.filter((z) => z.id === zone).map((z) => {
            const lvl = skillLevel(gs.skills?.[z.skill] || 0);
            const prog = skillProgress(gs.skills?.[z.skill] || 0);
            return (
              <div key={z.id} className="space-y-3">
                {/* skill bar */}
                <Panel className="p-3 flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                    <Ico src={SKILLS[z.skill].img} size="w-5 h-5" /> {SKILLS[z.skill].name} Lv {lvl}
                  </span>
                  <div className="flex-1 min-w-[120px] bg-black/50 rounded-full h-2 border border-slate-700">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: prog.needed ? `${Math.round((prog.into / prog.needed) * 100)}%` : '100%' }} />
                  </div>
                  {z.tool && (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <Ico src={TOOL_DEFS[z.tool].img} size="w-4 h-4" /> {TOOL_TIERS[gs.tools?.[z.tool] || 0].name} {TOOL_DEFS[z.tool].name}
                    </span>
                  )}
                </Panel>

                {z.id === 'lake' ? (
                  /* ── FISHING ── */
                  <div className="rounded-2xl border-2 border-blue-900/60 overflow-hidden">
                    <div className="p-3 bg-slate-900 flex flex-wrap gap-1.5 border-b border-blue-900/40">
                      {FISHING_SPOTS.map((s) => {
                        const locked = (gs.tools?.rod || 0) < s.rod || lvl < s.level;
                        return (
                          <button key={s.id} onClick={() => !locked && setSpot(s.id)} disabled={locked}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ${
                              spot === s.id ? 'bg-sky-600 text-white' : locked ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                            title={locked ? `Needs ${TOOL_TIERS[s.rod].name} Rod + Fishing Lv ${s.level}` : s.name}>
                            <Ico src={s.img} size="w-4 h-4" className={locked ? 'grayscale opacity-40' : ''} />
                            {locked ? `Lv ${s.level}` : s.name}
                          </button>
                        );
                      })}
                    </div>
                    <div className="p-8 text-center min-h-[300px] flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: z.bg }}>
                      {(() => {
                        const spotDef = FISHING_SPOTS.find((s) => s.id === spot) || FISHING_SPOTS[0];
                        return (
                          <>
                            <p className="text-sky-200 font-bold text-lg mb-3 flex items-center gap-2">
                              <Ico src={spotDef.img} size="w-8 h-8" /> {spotDef.name}
                            </p>
                            {fishing.phase === 'idle' && (
                              <>
                                <Ico src={`${ICN}/Nature/027-fish.svg`} size="w-20 h-20" className="opacity-40 mb-3" />
                                <button onClick={castLine} className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-500 transition text-lg shadow-lg">
                                  Cast Line
                                </button>
                                <p className="text-sky-300/70 text-xs mt-3">Wait for the bite, then reel like the wind!</p>
                              </>
                            )}
                            {fishing.phase === 'waiting' && (
                              <>
                                <Ico src={`${ICN}/Water/006-drop.svg`} size="w-16 h-16" className="mb-3" style={{ animation: 'wh-bob 1.6s ease-in-out infinite' }} />
                                <p className="text-sky-200 font-bold animate-pulse">Waiting for a bite…</p>
                                <button onClick={reelIn} className="mt-4 bg-slate-800 text-sky-300 px-8 py-3 rounded-xl font-bold border border-sky-800 hover:bg-slate-700 transition">
                                  Reel In
                                </button>
                              </>
                            )}
                            {fishing.phase === 'bite' && (
                              <>
                                <Ico src={`${ICN}/Nature/027-fish.svg`} size="w-24 h-24" className="mb-2" style={{ animation: 'wh-shake 0.15s linear infinite' }} />
                                <p className="text-yellow-300 font-bold text-2xl animate-pulse">BITE!</p>
                                <button onClick={reelIn} className="mt-3 bg-yellow-400 text-yellow-950 px-12 py-4 rounded-xl font-bold text-xl hover:bg-yellow-300 transition animate-pulse shadow-xl">
                                  REEL IT IN!
                                </button>
                              </>
                            )}
                            <p className="text-sky-300/60 text-[11px] mt-5">
                              Fishing log: {(gs.caughtFish || []).length}/{Object.keys(ITEMS).filter((i) => ITEMS[i].kind === 'fish').length} species
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ) : (
                  /* ── CLICK NODES ── */
                  <div className="rounded-2xl border-2 border-emerald-900/60 p-4 bg-cover bg-center" style={{ backgroundImage: z.bg }}>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {NODES[z.id].map((node) => {
                        const key = `${z.id}_${node.id}`;
                        const st = nodeState[key] || { stock: node.stock, hitsLeft: clicksNeeded(node, z.tool), respawnAt: 0 };
                        const locked = lvl < node.level;
                        const respawning = st.respawnAt > now();
                        const need = clicksNeeded(node, z.tool);
                        const yieldItem = ITEMS[node.yieldId];
                        const rar = RARITY_STYLE[yieldItem?.rarity || 'common'];
                        return (
                          <button
                            key={node.id}
                            onClick={() => strikeNode(z, node)}
                            disabled={locked || respawning || exhausted}
                            className={`relative rounded-2xl border-2 p-4 text-center transition active:scale-95 bg-black/45 backdrop-blur-[1px] ${
                              locked ? 'border-slate-700/60 opacity-50' : respawning ? 'border-slate-600/60' : `${rar.border} hover:bg-black/60 hover:scale-[1.02]`
                            }`}
                          >
                            <div className="flex justify-center">
                              <Ico
                                src={z.id === 'forest' && respawning ? STUMP_ICON : node.img}
                                tint={respawning ? 'grayscale(1) opacity(0.5)' : node.tint}
                                size="w-16 h-16 md:w-20 md:h-20"
                                style={{ animation: !locked && !respawning ? 'wh-bob 2.6s ease-in-out infinite' : undefined }}
                              />
                            </div>
                            <p className="font-bold text-white text-sm mt-1 drop-shadow">{node.name}</p>
                            {locked ? (
                              <p className="text-xs text-slate-400 font-bold mt-1">{SKILLS[z.skill].name} Lv {node.level} required</p>
                            ) : respawning ? (
                              <p className="text-xs text-amber-400 font-bold mt-1">Regrowing… {fmtCountdown(st.respawnAt - now())}</p>
                            ) : (
                              <>
                                <p className={`text-xs mt-0.5 flex items-center justify-center gap-1 ${rar.text}`}>
                                  <It id={node.yieldId} size="w-4 h-4" /> {yieldItem.name} · +{node.xp} XP
                                </p>
                                <div className="w-full bg-black/60 rounded-full h-2 mt-2 border border-white/10">
                                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all" style={{ width: `${Math.round(((need - st.hitsLeft) / need) * 100)}%` }} />
                                </div>
                                <p className="text-[10px] text-slate-300 mt-1">{st.hitsLeft} swing{st.hitsLeft !== 1 ? 's' : ''} left · {st.stock} in the {z.id === 'forest' ? 'tree' : 'node'}</p>
                              </>
                            )}
                            {floaties.filter((f) => f.key === key).map((f) => (
                              <span key={f.id} className="absolute left-1/2 top-3 -translate-x-1/2 text-amber-300 font-bold text-sm pointer-events-none drop-shadow whitespace-nowrap" style={{ animation: 'wh-float 0.9s ease-out forwards' }}>
                                {f.text}
                              </span>
                            ))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ══ EXPEDITIONS ══ */}
      {tab === 'expeditions' && (
        <div className="space-y-3">
          {/* The Wild Map */}
          <div className="rounded-2xl border-2 border-indigo-900/60 p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(12,10,35,0.82), rgba(12,10,35,0.92)), url('/Loot/Backgrounds/night.png')" }}>
            <div className="flex items-center gap-3 mb-1">
              <Ico src={`${ICN}/Adventure/018-map-1.svg`} size="w-9 h-9" />
              <div>
                <h3 className="font-bold text-white text-lg drop-shadow">The Wild Map — {(gs.discoveredLandmarks || []).length}/{LANDMARKS.length} landmarks</h3>
                <p className="text-indigo-200/70 text-xs">Long journeys to lost places. Each discovery grants a permanent perk (+10 Prosperity).</p>
              </div>
            </div>
            {!gs.crafted.includes('compass') ? (
              <p className="mt-3 text-sm font-bold text-indigo-200 bg-black/40 rounded-xl p-3 border border-indigo-700/60 flex items-center gap-2">
                <Ico src={`${ICN}/Adventure/001-compass.svg`} size="w-6 h-6" />
                Craft the Wayfarer Compass at the Workbench to reveal the map…
              </p>
            ) : (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {LANDMARKS.map((lm) => {
                  const st = landmarkState(lm);
                  return (
                    <div key={lm.id}
                      className={`shrink-0 w-32 rounded-xl border-2 p-2.5 text-center ${
                        st === 'discovered' ? 'border-emerald-500/70 bg-emerald-950/40'
                        : st === 'ready' ? 'border-amber-400/70 bg-black/50'
                        : st === 'travelling' ? 'border-sky-500/70 bg-sky-950/40'
                        : 'border-slate-700/60 bg-black/40'
                      }`}
                      title={st === 'locked' ? 'Discover the previous landmark first' : lm.flavor}>
                      <Ico src={lm.img} size="w-10 h-10 mx-auto" className={st === 'locked' ? 'grayscale opacity-30' : st === 'gearLocked' ? 'grayscale opacity-60' : ''} />
                      <p className={`text-[11px] font-bold mt-1 leading-tight ${st === 'discovered' ? 'text-emerald-300' : st === 'locked' ? 'text-slate-600' : 'text-white'}`}>
                        {st === 'locked' ? '???' : lm.name}
                      </p>
                      {st === 'discovered' && <p className="text-[9px] text-emerald-400/90 font-bold mt-0.5 leading-tight">{lm.perkText}</p>}
                      {st === 'ready' && (
                        <button onClick={() => startJourney(lm)} className="w-full mt-1.5 text-[10px] font-bold bg-amber-500 text-amber-950 rounded-lg py-1 hover:bg-amber-400 transition">
                          Set out ({lm.hours}h)
                        </button>
                      )}
                      {st === 'travelling' && <p className="text-[9px] text-sky-300 font-bold mt-1 animate-pulse">Travelling…</p>}
                      {st === 'gearLocked' && (
                        <p className="text-[9px] text-red-400/90 font-bold mt-0.5 leading-tight">
                          Needs {(lm.needs || []).map((n) => CRAFT_MAP[n]?.name).join(' + ')}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active */}
          {gs.expeditions.length > 0 && (
            <Panel className="p-4">
              <h3 className="font-bold text-slate-200 mb-2">Parties in the field ({gs.expeditions.length}/{maxExpeditions})</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {gs.expeditions.map((exp) => {
                  const isJourney = exp.type === 'journey';
                  const lm = isJourney ? LANDMARK_MAP[exp.landmarkId] : null;
                  const def = isJourney ? null : EXPEDITIONS[exp.type];
                  const dur = isJourney ? null : (def.durations[exp.tier] || def.durations[0]);
                  const ready = now() >= exp.returnAt;
                  return (
                    <button key={exp.id} onClick={() => collectExpedition(exp)} disabled={!ready}
                      className={`rounded-xl border-2 p-3 flex items-center gap-3 text-left transition ${ready ? 'border-amber-400/70 bg-amber-950/40 animate-pulse' : 'border-slate-700 bg-black/30'}`}>
                      <Ico src={isJourney ? lm?.img : (dur.img || def.img)} size="w-10 h-10" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-200 text-sm">{isJourney ? `Journey — ${lm?.name}` : `${def.name} — ${dur.name}`}</p>
                        <p className={`text-xs font-bold ${ready ? 'text-amber-300' : 'text-slate-400'}`}>
                          {ready ? (isJourney ? 'ARRIVED — see what you found!' : 'RETURNED — open the haul!') : `Back in ${fmtCountdown(exp.returnAt - now())}`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Panel>
          )}

          {/* Launch */}
          <div className="grid lg:grid-cols-2 gap-3">
            {Object.entries(EXPEDITIONS).map(([type, def]) => {
              const gearLocked = def.needs && !gs.crafted.includes(def.needs);
              const bonus = type === 'hunt' ? caps.huntBonus : caps.scavBonus;
              return (
                <div key={type} className="rounded-2xl border-2 border-emerald-900/60 overflow-hidden bg-slate-900 flex">
                  <div className="p-4 bg-cover bg-center flex-1 flex flex-col" style={{ backgroundImage: type === 'hunt' ? "linear-gradient(rgba(30,10,5,0.8), rgba(30,10,5,0.9)), url('/Loot/Backgrounds/bloodmoon.png')" : "linear-gradient(rgba(8,25,10,0.78), rgba(8,25,10,0.88)), url('/Loot/Backgrounds/day.png')" }}>
                    <div className="flex items-center gap-3">
                      <Ico src={def.img} size="w-12 h-12" />
                      <div>
                        <h3 className="font-bold text-white text-lg">{def.name}</h3>
                        <p className="text-white/70 text-xs">{def.desc}</p>
                        {bonus > 0 && <p className="text-amber-300 text-[11px] font-bold mt-0.5">Gear bonus: +{bonus}% loot{caps.expSpeed > 0 ? ` · ${caps.expSpeed}% faster` : ''}</p>}
                      </div>
                    </div>
                    {gearLocked ? (
                      <p className="mt-4 text-sm font-bold text-red-300 bg-black/40 rounded-xl p-3 border border-red-800/60">
                        Craft a {CRAFT_MAP[def.needs]?.name} at the Workbench to unlock hunting!
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {def.durations.map((d, i) => {
                          const lmLocked = d.needsLandmark && !(gs.discoveredLandmarks || []).includes(d.needsLandmark);
                          const craftLocked = d.needsCraft && !gs.crafted.includes(d.needsCraft);
                          const locked = lmLocked || craftLocked;
                          return (
                            <button key={i} onClick={() => startExpedition(type, i)}
                              disabled={locked || gs.expeditions.length >= maxExpeditions}
                              className={`bg-black/50 border rounded-xl p-2.5 text-center transition ${locked ? 'border-white/10 opacity-50' : 'border-white/20 hover:border-amber-400/70 hover:bg-black/70 disabled:opacity-40'}`}
                              title={lmLocked ? `Discover the ${LANDMARK_MAP[d.needsLandmark]?.name} on the Wild Map first!` : craftLocked ? `Craft a ${CRAFT_MAP[d.needsCraft]?.name} first!` : d.name}>
                              {d.img && <Ico src={d.img} size="w-9 h-9 mx-auto mb-1" className={locked ? 'grayscale' : ''} />}
                              <p className="text-white font-bold text-sm">{d.name}</p>
                              <p className="text-white/60 text-[11px]">
                                {locked
                                  ? (lmLocked ? `Find the ${LANDMARK_MAP[d.needsLandmark]?.name}` : `Needs ${CRAFT_MAP[d.needsCraft]?.name}`)
                                  : `${d.minutes >= 60 ? `${Math.round(d.minutes / 60)}h` : `${d.minutes}min`} · ~${d.rolls} finds`}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critter collection */}
          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-1">Critter Collection — {(gs.critters || []).length}/{CRITTERS.length}</h3>
            <p className="text-xs text-slate-400 mb-3">Critters turn up on expeditions. Each new species: +2 Prosperity and +20 Menagerie essence!</p>
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-1.5">
              {CRITTERS.map((c) => {
                const found = (gs.critters || []).includes(c.id);
                const rar = RARITY_STYLE[c.rarity];
                return (
                  <div key={c.id} className={`rounded-lg border p-1.5 text-center ${found ? `${rar.border} bg-black/30` : 'border-slate-800 bg-black/20'}`}
                    title={found ? `${c.name} (${rar.name})` : '??? — keep exploring!'}>
                    <Ico src={c.img} size="w-full aspect-square" className={found ? '' : 'grayscale opacity-20'} />
                    <p className={`text-[8px] font-bold truncate ${found ? rar.text : 'text-slate-600'}`}>{found ? c.name : '???'}</p>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* ══ FARM ══ */}
      {tab === 'farm' && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-900/60 p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(15,25,5,0.72), rgba(15,25,5,0.85)), url('/Loot/Backgrounds/day.png')" }}>
            <h3 className="font-bold text-white mb-3 drop-shadow">Crop Plots ({gs.farm.length}/{farmPlots} planted){caps.cropYield > 0 && <span className="text-amber-300 text-xs"> · Scythe: +{caps.cropYield} yield</span>}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {Array.from({ length: farmPlots }).map((_, i) => {
                const planted = gs.farm.find((f) => f.plot === i);
                if (!planted) {
                  const seeds = Object.keys(gs.inv || {}).filter((id) => ITEMS[id]?.kind === 'seed' && gs.inv[id] > 0);
                  return (
                    <div key={i} className="rounded-xl border-2 border-dashed border-amber-600/50 bg-black/40 p-3 text-center min-h-[120px] flex flex-col items-center justify-center">
                      <Ico src={`${ICN}/Farm/001-gardening.svg`} size="w-8 h-8" className="opacity-50" />
                      {seeds.length === 0 ? (
                        <p className="text-[10px] text-amber-300/80 font-bold mt-1">No seeds — visit the merchant below!</p>
                      ) : (
                        <div className="flex flex-wrap justify-center gap-1 mt-1.5">
                          {seeds.slice(0, 4).map((sid) => (
                            <button key={sid} onClick={() => plantSeed(i, sid)}
                              className="flex items-center gap-1 text-[10px] font-bold bg-black/60 border border-amber-600/50 text-amber-200 rounded-full px-2 py-1 hover:bg-amber-900/50 transition"
                              title={`Plant ${ITEMS[sid].name} (${gs.inv[sid]} owned)`}>
                              <It id={CROP_BY_SEED[sid]?.cropId} size="w-4 h-4" /> Plant
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
                    className={`rounded-xl border-2 p-3 text-center min-h-[120px] transition ${ready ? 'border-lime-400/80 bg-lime-950/50 animate-pulse' : 'border-amber-800/50 bg-black/40'}`}>
                    <div className="flex justify-center">
                      {ready
                        ? <It id={crop.cropId} size="w-10 h-10" className="drop-shadow" />
                        : <Ico src={`${ICN}/Farm/003-sprout.svg`} size="w-8 h-8" style={{ animation: 'wh-bob 2.4s ease-in-out infinite' }} />}
                    </div>
                    <p className="font-bold text-white text-xs mt-1 drop-shadow">{ITEMS[crop.cropId].name}</p>
                    <p className={`text-[10px] font-bold mt-0.5 ${ready ? 'text-lime-300' : 'text-amber-300/90'}`}>
                      {ready ? 'HARVEST!' : fmtCountdown(planted.readyAt - now())}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Pens */}
            {pensOwned.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-white/90 text-sm mb-2 drop-shadow">Pens &amp; Keepers</h4>
                <div className="flex flex-wrap gap-2">
                  {pensOwned.map((pen) => {
                    const pending = penPending(pen);
                    return (
                      <button key={pen.id} onClick={() => collectPen(pen)} disabled={pending < 1}
                        className={`rounded-xl border-2 px-3 py-2 flex items-center gap-2 transition ${pending > 0 ? 'border-lime-400/70 bg-lime-950/50' : 'border-slate-700 bg-black/40'}`}>
                        <Ico src={pen.img} size="w-8 h-8" />
                        <div className="text-left">
                          <p className="text-white text-xs font-bold">{pen.name}</p>
                          <p className={`text-[10px] font-bold ${pending > 0 ? 'text-lime-300' : 'text-slate-400'}`}>
                            {pending > 0 ? `Collect ${pending} ${ITEMS[pen.produceId].name}` : 'Working…'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {gs.crafted.includes('cheesepress') && (
                    <button onClick={pressCheese} disabled={!hasItems(CHEESE_RECIPE.in)}
                      className="rounded-xl border-2 border-amber-600/60 bg-black/40 px-3 py-2 flex items-center gap-2 hover:bg-amber-950/40 disabled:opacity-40 transition">
                      <It id="cheese" size="w-8 h-8" />
                      <div className="text-left">
                        <p className="text-white text-xs font-bold">Cheese Press</p>
                        <p className="text-[10px] text-amber-300 font-bold">3 Milk + 1 Salt → Cheese</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Merchant */}
          <div className="grid lg:grid-cols-2 gap-3">
            <Panel className="p-4">
              <h3 className="font-bold text-slate-200 mb-2">Seed Merchant <span className="text-xs text-slate-500 font-normal">— pay with gold</span></h3>
              <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto pr-1">
                {CROPS.map((c) => (
                  <div key={c.seedId} className="flex items-center gap-2 py-1.5">
                    <It id={c.cropId} size="w-7 h-7" />
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${RARITY_STYLE[ITEMS[c.cropId].rarity].text}`}>{ITEMS[c.seedId].name} <span className="text-[10px] text-slate-500 font-normal">(own {countOf(c.seedId)})</span></p>
                      <p className="text-[10px] text-slate-500">{c.growMin >= 60 ? `${Math.round(c.growMin / 60)}h` : c.growMin >= 1 ? `${c.growMin}min` : `${Math.round(c.growMin * 60)}s`} · yields {c.yield + caps.cropYield}</p>
                    </div>
                    <button onClick={() => buySeed(c)} disabled={gs.gold < c.seedCost}
                      className="text-xs font-bold bg-emerald-900/70 border border-emerald-700 text-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-800 disabled:opacity-40 transition">
                      {c.seedCost} gold
                    </button>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 mb-1">Pantry goods</p>
                  {Object.keys(ITEMS).filter((id) => ITEMS[id].cost).map((id) => (
                    <div key={id} className="flex items-center gap-2 py-1.5">
                      <It id={id} size="w-7 h-7" />
                      <p className="flex-1 text-sm font-bold text-slate-300">{ITEMS[id].name} <span className="text-[10px] text-slate-500 font-normal">(own {countOf(id)})</span></p>
                      <button onClick={() => buyTrade(id)} disabled={gs.gold < ITEMS[id].cost}
                        className="text-xs font-bold bg-emerald-900/70 border border-emerald-700 text-emerald-300 rounded-lg px-3 py-1.5 hover:bg-emerald-800 disabled:opacity-40 transition">
                        {ITEMS[id].cost} gold
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel className="p-4">
              <h3 className="font-bold text-slate-200 mb-2">Trading Post <span className="text-xs text-slate-500 font-normal">— sell surplus (also frees pack slots!)</span></h3>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800 pr-1">
                {Object.entries(gs.inv || {}).filter(([id]) => ITEMS[id]?.sell > 0).sort((a, b) => (ITEMS[b[0]].sell - ITEMS[a[0]].sell)).map(([id, q]) => (
                  <div key={id} className="flex items-center gap-2 py-1.5">
                    <It id={id} size="w-7 h-7" />
                    <p className={`flex-1 text-sm font-bold ${RARITY_STYLE[ITEMS[id].rarity || 'common'].text}`}>{ITEMS[id].name} <span className="text-[10px] text-slate-500 font-normal">× {fmtQty(q)}</span></p>
                    <span className="text-[10px] text-slate-500">{ITEMS[id].sell}g ea</span>
                    <button onClick={() => sellItem(id, 1)} className="text-xs font-bold bg-slate-800 text-slate-300 rounded-lg px-2 py-1 hover:bg-amber-900/60 transition">Sell 1</button>
                    <button onClick={() => sellItem(id, 999999)} className="text-xs font-bold bg-slate-800 text-slate-300 rounded-lg px-2 py-1 hover:bg-amber-900/60 transition">All</button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}

      {/* ══ CRAFT ══ */}
      {tab === 'craft' && (
        <div className="space-y-3">
          {/* Tools */}
          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-2">Tools {!gs.crafted.includes('workbench') && <span className="text-xs text-red-400 font-normal">— build a Workbench first!</span>}</h3>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {Object.entries(TOOL_DEFS).map(([toolId, def]) => {
                const tier = gs.tools?.[toolId] || 0;
                const next = tier + 1;
                const cost = TOOL_COSTS[next];
                const skillId = { axe: 'wood', pick: 'mine', rod: 'fish' }[toolId];
                const lvlOk = !cost || skillLevel(gs.skills?.[skillId] || 0) >= TOOL_LEVEL_REQ[next];
                return (
                  <div key={toolId} className="rounded-xl border border-slate-700 bg-black/30 p-3">
                    <p className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                      <Ico src={def.img} size="w-6 h-6" /> {TOOL_TIERS[tier].name} {def.name}
                    </p>
                    <p className="text-[10px] text-slate-500">Power {TOOL_TIERS[tier].power}{forgeBonus.power > 0 ? ` (+${forgeBonus.power.toFixed(1)} Forge)` : ''}</p>
                    {cost ? (
                      <>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <span className="text-[11px] text-slate-400 font-bold">{TOOL_TIERS[next].name}:</span>
                          {Object.entries(cost).map(([id, q]) => (
                            <span key={id} className={`flex items-center gap-0.5 text-[11px] font-bold ${countOf(id) >= q ? 'text-slate-300' : 'text-red-400'}`}>
                              {q}<It id={id} size="w-4 h-4" />
                            </span>
                          ))}
                        </div>
                        {!lvlOk && <p className="text-[10px] text-red-400 font-bold">Needs {SKILLS[skillId].name} Lv {TOOL_LEVEL_REQ[next]}</p>}
                        <button onClick={() => upgradeTool(toolId)}
                          disabled={!gs.crafted.includes('workbench') || !lvlOk || !hasItems(cost)}
                          className="w-full mt-2 text-xs font-bold bg-emerald-700 text-white rounded-lg py-1.5 hover:bg-emerald-600 disabled:opacity-40 transition">
                          Upgrade
                        </button>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-400 font-bold mt-1.5">Fully mastered!</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Furnace */}
          {gs.crafted.includes('smelter') && (
            <Panel className="p-4">
              <h3 className="font-bold text-slate-200 mb-2">
                {gs.crafted.includes('smelter4') ? 'Mithril Forgeheart' : gs.crafted.includes('smelter3') ? 'Blast Furnace' : gs.crafted.includes('smelter2') ? 'Twin-Bellows Furnace' : 'Stone Furnace'}
                <span className="text-xs text-slate-500 font-normal"> — {gs.smelting.length}/{caps.smeltSlots} slots · fuel {fmtQty(fuelUnits)}{buffVal('smeltFast') > 0 ? ` · ${Math.min(75, buffVal('smeltFast'))}% faster` : ''} · runs while you're away</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {gs.smelting.map((job) => {
                  const done = now() >= job.doneAt;
                  return (
                    <button key={job.slot} onClick={() => collectBar(job)} disabled={!done}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition flex items-center gap-2 ${done ? 'border-amber-400/70 bg-amber-950/50 text-amber-300 animate-pulse' : 'border-slate-700 bg-black/30 text-slate-400'}`}>
                      <It id={job.barId} size="w-6 h-6" />
                      {done ? `Collect ${ITEMS[job.barId].name}!` : `${ITEMS[job.barId].name} · ${fmtCountdown(job.doneAt - now())}`}
                    </button>
                  );
                })}
                {gs.smelting.length === 0 && <p className="text-xs text-slate-500 italic">The furnace is cold. Load it up!</p>}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {SMELT_RECIPES.map((r) => (
                  <button key={r.barId} onClick={() => startSmelt(r)}
                    disabled={countOf(r.oreId) < r.ore || fuelUnits < r.fuel || gs.smelting.length >= caps.smeltSlots}
                    className="text-left rounded-xl border border-slate-700 bg-black/30 p-2.5 hover:border-amber-500/60 disabled:opacity-40 transition">
                    <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5"><It id={r.barId} size="w-5 h-5" /> {ITEMS[r.barId].name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      {r.ore}<It id={r.oreId} size="w-3.5 h-3.5" /> + {r.fuel} fuel · {r.minutes} min
                    </p>
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {/* Sawmill */}
          {gs.crafted.includes('sawmill') && (
            <Panel className="p-4">
              <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Ico src={`${ICN}/More/003-table-saw.svg`} size="w-6 h-6" /> Sawmill
                <span className="text-xs text-slate-500 font-normal">— {(gs.sawing || []).length}/{SAW_SLOTS} slots · planks build the finest gear</span>
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(gs.sawing || []).map((job) => {
                  const done = now() >= job.doneAt;
                  return (
                    <button key={job.slot} onClick={() => collectPlanks(job)} disabled={!done}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition flex items-center gap-2 ${done ? 'border-amber-400/70 bg-amber-950/50 text-amber-300 animate-pulse' : 'border-slate-700 bg-black/30 text-slate-400'}`}>
                      <It id="plank" size="w-6 h-6" />
                      {done ? `Collect ${job.planks} plank${job.planks !== 1 ? 's' : ''}!` : `${job.planks} plank${job.planks !== 1 ? 's' : ''} · ${fmtCountdown(job.doneAt - now())}`}
                    </button>
                  );
                })}
                {(gs.sawing || []).length === 0 && <p className="text-xs text-slate-500 italic">The saw is idle. Feed it logs!</p>}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {SAW_RECIPES.map((r) => (
                  <button key={r.woodId} onClick={() => startSaw(r)}
                    disabled={countOf(r.woodId) < r.wood || (gs.sawing || []).length >= SAW_SLOTS}
                    className="text-left rounded-xl border border-slate-700 bg-black/30 p-2.5 hover:border-amber-500/60 disabled:opacity-40 transition">
                    <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      {r.wood}<It id={r.woodId} size="w-5 h-5" /> <span className="text-slate-500">→</span> {r.planks}<It id="plank" size="w-5 h-5" />
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.minutes} min</p>
                  </button>
                ))}
              </div>
            </Panel>
          )}

          {/* Build list */}
          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-3">Build &amp; Gear</h3>
            {[['station', 'Stations'], ['gear', 'Pack, Chest & Expedition Gear'], ['farm', 'Farm & Animals'], ['helper', 'Helpers']].map(([cat, label]) => (
              <div key={cat} className="mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-2">{label}</h4>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CRAFTS.filter((c) => c.cat === cat).map((c) => {
                    const owned = gs.crafted.includes(c.id);
                    const needsOk = (c.needs || []).every((n) => gs.crafted.includes(n));
                    const skillOk = !c.skill || skillLevel(gs.skills?.[c.skill[0]] || 0) >= c.skill[1];
                    const realItems = Object.fromEntries(Object.entries(c.items).filter(([id, q]) => ITEMS[id] && q > 0));
                    const itemsOk = hasItems(realItems);
                    return (
                      <div key={c.id} className={`rounded-xl border p-2.5 ${owned ? 'border-emerald-600/60 bg-emerald-950/40' : 'border-slate-700 bg-black/30'}`}>
                        <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                          <Ico src={c.img} tint={c.tint} size="w-6 h-6" /> {c.name} {owned && <span className="text-emerald-400 text-xs">BUILT</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{c.desc}</p>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {Object.entries(realItems).map(([id, q]) => (
                            <span key={id} className={`flex items-center gap-0.5 text-[11px] font-bold ${countOf(id) >= q ? 'text-slate-300' : 'text-red-400'}`} title={ITEMS[id].name}>
                              {q}<It id={id} size="w-4 h-4" />
                            </span>
                          ))}
                          <span className="text-[10px] text-amber-400 font-bold">+{c.prosperity} Prosperity</span>
                        </div>
                        {c.skill && !skillOk && <p className="text-[10px] text-red-400 font-bold mt-0.5">Needs {SKILLS[c.skill[0]].name} Lv {c.skill[1]}</p>}
                        {(c.needs || []).length > 0 && !needsOk && <p className="text-[10px] text-red-400 font-bold mt-0.5">Needs {c.needs.map((n) => CRAFT_MAP[n].name).join(', ')}</p>}
                        {!owned && (
                          <button onClick={() => craftItem(c)} disabled={!needsOk || !skillOk || !itemsOk}
                            className="w-full mt-1.5 text-xs font-bold bg-emerald-700 text-white rounded-lg py-1.5 hover:bg-emerald-600 disabled:opacity-40 transition">
                            Build
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Panel>
        </div>
      )}

      {/* ══ KITCHEN ══ */}
      {tab === 'cook' && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-orange-900/60 p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(30,12,4,0.82), rgba(30,12,4,0.9)), url('/Loot/Backgrounds/night.png')" }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-white flex items-center gap-2 drop-shadow">
                <Ico src={KITCHEN_TIERS[kitchenTier].img} size="w-8 h-8" /> {KITCHEN_TIERS[kitchenTier].name}
                <span className="text-xs text-orange-200/70 font-normal">· Cooking Lv {skillLevel(gs.skills?.cook || 0)} · fuel {fmtQty(fuelUnits)}</span>
              </h3>
              {gs.unreadScrolls > 0 && (
                <button onClick={readScroll} className="bg-amber-400 text-amber-950 text-sm font-bold px-4 py-2 rounded-xl hover:bg-amber-300 animate-pulse transition flex items-center gap-1.5">
                  <Ico src={`${ICN}/Magic/030-scroll.svg`} size="w-5 h-5" /> Read Recipe Scroll ({gs.unreadScrolls})
                </button>
              )}
            </div>
            <p className="text-xs text-orange-100/70 mt-1">
              Cooking burns wood as fuel and serves a timed buff (max {MAX_ACTIVE_BUFFS} meals). {RECIPES.length} recipes exist — levels, scrolls and the Cauldron unlock them all.
            </p>
          </div>

          {[['dishes', 'Dishes'], ['cauldron', 'Cauldron Brews']].map(([group, label]) => (
            <Panel key={group} className="p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-2">{label}{group === 'cauldron' && !gs.crafted.includes('cauldron') && <span className="text-red-400 normal-case font-bold"> — craft the Witch Cauldron to brew</span>}</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {RECIPES.filter((r) => (group === 'cauldron') === !!r.cauldron).map((r) => {
                  const known = recipeKnown(r, gs);
                  const cooked = (gs.cookedDishes || []).includes(r.id);
                  const tierOk = kitchenTier >= r.tier && (!r.cauldron || gs.crafted.includes('cauldron'));
                  const canCook = known && tierOk && hasItems(r.ing) && fuelUnits >= r.fuel;
                  if (!known) {
                    return (
                      <div key={r.id} className="rounded-xl border border-dashed border-slate-700 bg-black/20 p-3 text-center">
                        <Ico src={`${ICN}/Magic/030-scroll.svg`} size="w-8 h-8" className="mx-auto opacity-25" />
                        <p className="text-xs font-bold text-slate-500 mt-1">
                          {r.scroll ? 'Secret recipe — find the scroll!' : `Unlocks at Cooking Lv ${r.cookLevel}`}
                        </p>
                      </div>
                    );
                  }
                  const bl = BUFF_LABELS[r.buff.type];
                  return (
                    <div key={r.id} className={`rounded-xl border p-3 bg-black/30 ${cooked ? 'border-orange-700/60' : 'border-slate-700'}`}>
                      <p className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                        <Ico src={r.img} size="w-7 h-7" /> {r.name}
                      </p>
                      <p className="text-[10px] text-slate-500 italic leading-snug mt-0.5">{r.desc}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                        {Object.entries(r.ing).map(([id, q]) => (
                          <span key={id} className={`flex items-center gap-0.5 text-[11px] font-bold ${countOf(id) >= q ? 'text-slate-300' : 'text-red-400'}`} title={ITEMS[id].name}>
                            {q}<It id={id} size="w-4 h-4" />
                          </span>
                        ))}
                        <span className={`text-[10px] font-bold ${fuelUnits >= r.fuel ? 'text-slate-500' : 'text-red-400'}`}>+{r.fuel} fuel</span>
                      </div>
                      <p className="text-[11px] font-bold text-orange-400 mt-1 flex items-center gap-1">
                        <Ico src={bl.img} size="w-4 h-4" /> +{r.buff.value}% {bl.name} · {r.buff.minutes} min
                      </p>
                      {!tierOk && <p className="text-[10px] text-red-400 font-bold mt-0.5">Needs {r.cauldron ? 'Witch Cauldron' : KITCHEN_TIERS[r.tier].name}</p>}
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={() => cookRecipe(r)} disabled={!canCook}
                          className="flex-1 text-xs font-bold bg-orange-600 text-white rounded-lg py-1.5 hover:bg-orange-500 disabled:opacity-40 transition">
                          Cook
                        </button>
                        <button onClick={() => eatDish(dishIdOf(r.id))} disabled={countOf(dishIdOf(r.id)) < 1}
                          className="flex-1 text-xs font-bold bg-emerald-700 text-white rounded-lg py-1.5 hover:bg-emerald-600 disabled:opacity-40 transition"
                          title="Eat one from your pack">
                          Eat ({countOf(dishIdOf(r.id))})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* ══ PACK (inventory management) ══ */}
      {tab === 'inventory' && (
        <div className="space-y-3">
          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Ico src={`${ICN}/Camping/007-backpack.svg`} size="w-7 h-7" /> Your Pack — {usedSlots}/{caps.slots} slots · stacks of {caps.stack}
              </h3>
              <p className="text-[11px] text-slate-500">Craft pouches, backpacks and crates in the Craft tab to carry more!</p>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {Object.entries(gs.inv || {}).sort((a, b) => (ITEMS[a[0]]?.name || '').localeCompare(ITEMS[b[0]]?.name || '')).map(([id, q]) => {
                const rar = RARITY_STYLE[ITEMS[id]?.rarity || 'common'];
                const itemSlots = Math.ceil(q / caps.stack);
                const isDish = ITEMS[id]?.kind === 'dish';
                return (
                  <div key={id} className={`rounded-xl border-2 ${rar.border} bg-black/40 p-2 text-center relative`} title={`${ITEMS[id]?.name} (${rar.name}) — sells for ${ITEMS[id]?.sell || 0}g${itemSlots > 1 ? ` · fills ${itemSlots} slots` : ''}`}>
                    <It id={id} size="w-10 h-10 mx-auto" />
                    <p className={`text-[9px] font-bold truncate mt-1 ${rar.text}`}>{ITEMS[id]?.name}</p>
                    <span className="absolute top-1 right-1.5 text-[10px] font-bold text-slate-300">{q}</span>
                    {itemSlots > 1 && <span className="absolute top-1 left-1.5 text-[8px] font-bold text-amber-400/90" title={`${itemSlots} slots`}>{itemSlots}▮</span>}
                    {isDish && (
                      <button onClick={() => eatDish(id)} className="w-full mt-1 text-[9px] font-bold bg-emerald-800 text-emerald-200 rounded py-0.5 hover:bg-emerald-700 transition">
                        Eat
                      </button>
                    )}
                    {caps.chestSlots > 0 && (
                      <button onClick={() => chestMove(id, q, true)} className="w-full mt-1 text-[9px] font-bold bg-slate-800 text-slate-400 rounded py-0.5 hover:bg-slate-700 transition">
                        Store all
                      </button>
                    )}
                  </div>
                );
              })}
              {Array.from({ length: Math.max(0, caps.slots - usedSlots) }).map((_, i) => (
                <div key={`e${i}`} className="rounded-xl border-2 border-dashed border-slate-800 bg-black/20 min-h-[86px] flex items-center justify-center">
                  <p className="text-slate-700 text-[10px] font-bold">empty</p>
                </div>
              ))}
            </div>
          </Panel>

          {/* Camp chest */}
          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-2">
              <Ico src={`${ICN}/Camping/008-basket.svg`} size="w-7 h-7" /> Camp Chest — {chestUsedSlots}/{caps.chestSlots} slots · stacks of {caps.stack * 2}
            </h3>
            {caps.chestSlots === 0 ? (
              <p className="text-xs text-slate-500">No chest yet — craft a <span className="text-emerald-400 font-bold">Camp Chest</span> at the Workbench to store items at camp.</p>
            ) : Object.keys(gs.chest || {}).length === 0 ? (
              <p className="text-xs text-slate-500 italic">The chest is empty. Store overflow here from your pack above.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {Object.entries(gs.chest || {}).sort((a, b) => (ITEMS[a[0]]?.name || '').localeCompare(ITEMS[b[0]]?.name || '')).map(([id, q]) => {
                  const rar = RARITY_STYLE[ITEMS[id]?.rarity || 'common'];
                  return (
                    <div key={id} className={`rounded-xl border ${rar.border} bg-black/30 p-2 text-center relative`} title={ITEMS[id]?.name}>
                      <It id={id} size="w-9 h-9 mx-auto" />
                      <p className={`text-[9px] font-bold truncate mt-1 ${rar.text}`}>{ITEMS[id]?.name}</p>
                      <span className="absolute top-1 right-1.5 text-[10px] font-bold text-slate-300">{q}</span>
                      <button onClick={() => chestMove(id, q, false)} className="w-full mt-1 text-[9px] font-bold bg-slate-800 text-slate-400 rounded py-0.5 hover:bg-slate-700 transition">
                        Take all
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Curio shelf + skills + titles */}
          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-2">Curio Shelf — {(gs.discoveredRares || []).length}/{CURIO_IDS.length} <span className="text-xs text-amber-500 font-normal">(+5 Prosperity each)</span></h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {CURIO_IDS.map((id) => {
                const found = (gs.discoveredRares || []).includes(id);
                const rar = RARITY_STYLE[ITEMS[id].rarity];
                return (
                  <div key={id} className={`rounded-lg border p-1.5 text-center ${found ? `${rar.border} bg-black/30` : 'border-slate-800 bg-black/20'}`}
                    title={found ? `${ITEMS[id].name} (${rar.name})` : '??? — keep exploring!'}>
                    <It id={id} size="w-full aspect-square" className={found ? '' : 'grayscale opacity-20'} />
                    <p className={`text-[8px] font-bold truncate ${found ? rar.text : 'text-slate-600'}`}>{found ? ITEMS[id].name : '???'}</p>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-2">Skills</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(SKILLS).map(([k, s]) => {
                const prog = skillProgress(gs.skills?.[k] || 0);
                return (
                  <div key={k} className="rounded-xl border border-slate-700 bg-black/30 p-2.5">
                    <p className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <Ico src={s.img} size="w-5 h-5" /> {s.name} <span className="text-emerald-400">Lv {prog.level}</span>
                    </p>
                    <div className="w-full bg-black/60 rounded-full h-1.5 mt-1.5 border border-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: prog.needed ? `${Math.round((prog.into / prog.needed) * 100)}%` : '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-4">
            <h3 className="font-bold text-slate-200 mb-2">Wildwood Titles <span className="text-xs text-slate-500 font-normal">— the equipped one shows on your class card</span></h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {HOMESTEAD_TITLES.map((t) => {
                const unlocked = (gs.unlockedTitles || []).includes(t.id);
                const active = gs.activeTitle === t.id;
                return (
                  <button key={t.id} onClick={() => unlocked && equipTitle(t.id)} disabled={!unlocked}
                    className={`text-left rounded-xl border p-2.5 transition ${active ? 'border-emerald-500 bg-emerald-950/60' : unlocked ? 'border-slate-700 bg-black/30 hover:border-emerald-700' : 'border-slate-800 bg-black/20 opacity-50'}`}>
                    <p className={`font-bold text-sm ${t.darkColor}`}>{t.name} {active && '· ON'}</p>
                    <p className="text-[10px] text-slate-500">{unlocked ? (active ? 'Tap to unequip' : 'Tap to equip') : t.reqText}</p>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>
      )}

      {/* ══ WILD FRIENDS ══ */}
      {tab === 'friends' && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-900/60 p-4 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(8,25,10,0.75), rgba(8,25,10,0.88)), url('/Loot/Backgrounds/day.png')" }}>
            <h3 className="font-bold text-white text-lg drop-shadow">Wild Friends — {(gs.friends || []).length}/{FRIENDS.length} befriended</h3>
            <p className="text-emerald-100/70 text-xs mt-0.5">
              Shy creatures live around your camp. Cook their favourite dish and share it a few times to win them over —
              each friend adds +4 Prosperity, and many lend a permanent helping paw.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {FRIENDS.map((f) => {
              const befriended = (gs.friends || []).includes(f.id);
              const fed = gs.friendsFed?.[f.id] || 0;
              const dishId = dishIdOf(f.dish);
              const recipe = RECIPE_MAP[f.dish];
              const haveDish = countOf(dishId) > 0;
              const dishKnown = recipe && recipeKnown(recipe, gs);
              return (
                <div key={f.id} className={`rounded-xl border-2 p-3 text-center ${befriended ? 'border-emerald-500/70 bg-emerald-950/40' : 'border-slate-700 bg-slate-900'}`}>
                  <div className="flex justify-center" style={{ animation: befriended ? 'wh-bob 2.4s ease-in-out infinite' : undefined }}>
                    <Ico src={f.img} size="w-16 h-16" className={befriended ? '' : 'grayscale opacity-60'} />
                  </div>
                  <p className={`font-bold text-sm mt-1 ${befriended ? 'text-emerald-300' : 'text-slate-200'}`}>{befriended ? f.name : `Shy ${f.name}`}</p>
                  <p className="text-[10px] text-slate-400 leading-snug mt-0.5">{befriended ? f.desc : 'Watches you from a distance…'}</p>
                  {!befriended && (
                    <>
                      <p className="text-[11px] text-slate-300 font-bold mt-1.5 flex items-center justify-center gap-1">
                        Craves: <Ico src={recipe?.img} size="w-5 h-5" /> {recipe?.name}
                      </p>
                      <div className="flex justify-center gap-1 mt-1">
                        {Array.from({ length: f.feeds }).map((_, i) => (
                          <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < fed ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <button onClick={() => feedFriend(f)} disabled={!haveDish}
                        className="w-full mt-2 text-xs font-bold bg-emerald-700 text-white rounded-lg py-1.5 hover:bg-emerald-600 disabled:opacity-40 transition"
                        title={haveDish ? `Share a ${recipe?.name}` : dishKnown ? `Cook a ${recipe?.name} first` : 'You haven’t learned this recipe yet…'}>
                        {haveDish ? 'Share a meal' : dishKnown ? `Cook ${recipe?.name}` : 'Recipe unknown…'}
                      </button>
                    </>
                  )}
                  {befriended && <p className="text-[10px] text-emerald-400 font-bold mt-1.5">Your friend!</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ CLASS ══ */}
      {tab === 'class' && (
        <Panel className="p-4">
          <h3 className="font-bold text-slate-200 mb-1">Valley Neighbours — Prosperity</h3>
          <p className="text-xs text-slate-500 mb-3">Tap a neighbour to peek at their homestead!</p>
          {(() => {
            const rows = [...(classmates || [])].map((s) => ({
              id: s.id, name: `${s.firstName || '?'} ${s.lastName?.charAt(0) || ''}`, data: s.homesteadData || null, isMe: s.id === studentData?.id,
            }));
            if (!rows.some((r) => r.isMe) && studentData) rows.push({ id: studentData.id, name: `${studentData.firstName || 'You'}`, data: gs, isMe: true });
            else { const me = rows.find((r) => r.isMe); if (me) me.data = gs; }
            const scored = rows.map((r) => ({ ...r, p: prosperityOf(r.data), skills: totalSkillLevel(r.data) })).sort((a, b) => b.p - a.p);
            return (
              <div className="divide-y divide-slate-800">
                {scored.slice(0, 30).map((r, i) => (
                  <div key={r.id || i}>
                    <button onClick={() => setVisitId(visitId === r.id ? null : r.id)}
                      className={`w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left transition hover:bg-emerald-950/50 ${r.isMe ? 'bg-emerald-950/50' : ''}`}>
                      <span className="w-8 text-center font-bold text-slate-500">#{i + 1}</span>
                      <p className="flex-1 font-semibold text-slate-200 text-sm truncate">{r.name} {r.isMe && '(you)'}</p>
                      <span className="text-xs font-bold text-slate-500">Skills {r.skills}</span>
                      <span className="font-bold text-emerald-400 text-sm">{fmtQty(r.p)} Prosperity</span>
                    </button>
                    {visitId === r.id && r.data && (
                      <div className="px-12 pb-3 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                        <span>{(r.data.knownRecipes || []).length} recipes</span>
                        <span>{(r.data.discoveredRares || []).length} curios</span>
                        <span>{(r.data.critters || []).length} critters</span>
                        <span>{(r.data.caughtFish || []).length} fish species</span>
                        <span>{(r.data.crafted || []).length} builds</span>
                        {(r.data.caughtFish || []).includes('leviathan') && <span className="text-purple-400 font-bold">LEVIATHAN SLAYER</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </Panel>
      )}

      {/* ── Expedition results modal ── */}
      {expResult && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setExpResult(null)}>
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-amber-400 uppercase tracking-widest text-center">The party returns!</p>
            <h3 className="text-xl font-bold text-white text-center mt-1">{expResult.typeName}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-4 max-h-64 overflow-y-auto">
              {expResult.loot.map(({ id, qty }) => (
                <div key={id} className={`rounded-xl border ${RARITY_STYLE[ITEMS[id]?.rarity || 'common'].border} bg-black/40 p-2 text-center`} title={ITEMS[id]?.name}>
                  <It id={id} size="w-9 h-9 mx-auto" />
                  <p className="text-[9px] font-bold text-slate-300 truncate">{ITEMS[id]?.name}</p>
                  <p className="text-[10px] font-bold text-amber-400">×{qty}</p>
                </div>
              ))}
              {expResult.critters.map((cid, i) => (
                <div key={`c${i}`} className={`rounded-xl border ${RARITY_STYLE[CRITTER_MAP[cid]?.rarity || 'common'].border} bg-black/40 p-2 text-center`} title={CRITTER_MAP[cid]?.name}>
                  <Ico src={CRITTER_MAP[cid]?.img} size="w-9 h-9 mx-auto" />
                  <p className="text-[9px] font-bold text-emerald-300 truncate">{CRITTER_MAP[cid]?.name}</p>
                </div>
              ))}
              {expResult.curios.map((id, i) => (
                <div key={`r${i}`} className="rounded-xl border border-amber-400/70 bg-black/40 p-2 text-center" title={ITEMS[id]?.name}>
                  <It id={id} size="w-9 h-9 mx-auto" />
                  <p className="text-[9px] font-bold text-amber-300 truncate">{ITEMS[id]?.name}</p>
                </div>
              ))}
              {expResult.scrolls > 0 && (
                <div className="rounded-xl border border-amber-400/70 bg-black/40 p-2 text-center">
                  <Ico src={`${ICN}/Magic/030-scroll.svg`} size="w-9 h-9 mx-auto" />
                  <p className="text-[9px] font-bold text-amber-300">Scroll ×{expResult.scrolls}</p>
                </div>
              )}
            </div>
            {expResult.soldGold > 0 && <p className="text-[11px] text-amber-400 font-bold text-center mt-2">Pack overflow sold for {expResult.soldGold} gold — craft bigger bags!</p>}
            <button onClick={() => setExpResult(null)} className="w-full mt-4 bg-amber-500 text-amber-950 px-8 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition">
              Stash the haul
            </button>
          </div>
        </div>
      )}

      {/* ── Landmark discovery modal ── */}
      {journeyDone && (() => {
        const lm = LANDMARK_MAP[journeyDone.landmarkId];
        return lm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setJourneyDone(null)}>
            <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest animate-pulse">Landmark discovered!</p>
              <div className="flex justify-center my-4" style={{ animation: 'wh-bob 1.4s ease-in-out infinite' }}>
                <Ico src={lm.img} size="w-28 h-28" />
              </div>
              <h3 className="text-2xl font-bold text-white">{lm.name}</h3>
              <p className="text-sm text-slate-400 italic mt-1">“{lm.flavor}”</p>
              <p className="text-sm font-bold text-emerald-400 mt-3">Permanent perk: {lm.perkText}</p>
              <p className="text-[11px] text-slate-500 mt-1">Rewards added to your pack (+10 Prosperity). The map stretches on…</p>
              <button onClick={() => setJourneyDone(null)} className="mt-5 bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-400 transition">
                Onward!
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Rare find modal ── */}
      {rareFind && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setRareFind(null)}>
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-amber-400 uppercase tracking-widest animate-pulse">Rare discovery!</p>
            <div className="flex justify-center my-4" style={{ animation: 'wh-bob 1.2s ease-in-out infinite' }}>
              {rareFind.kind === 'curio'
                ? <It id={rareFind.id} size="w-28 h-28" />
                : <Ico src={CRITTER_MAP[rareFind.id]?.img} size="w-28 h-28" />}
            </div>
            <h3 className="text-2xl font-bold text-white">{rareFind.kind === 'curio' ? ITEMS[rareFind.id]?.name : CRITTER_MAP[rareFind.id]?.name}</h3>
            <p className={`text-sm font-bold ${RARITY_STYLE[(rareFind.kind === 'curio' ? ITEMS[rareFind.id]?.rarity : CRITTER_MAP[rareFind.id]?.rarity) || 'rare'].text}`}>
              {RARITY_STYLE[(rareFind.kind === 'curio' ? ITEMS[rareFind.id]?.rarity : CRITTER_MAP[rareFind.id]?.rarity) || 'rare'].name}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {rareFind.kind === 'curio' ? 'Added to your Curio Shelf (+5 Prosperity).' : 'Added to your Critter Collection (+2 Prosperity).'}
            </p>
            <button onClick={() => setRareFind(null)} className="mt-5 bg-amber-500 text-amber-950 px-8 py-2.5 rounded-xl font-bold hover:bg-amber-400 transition">
              Treasure it
            </button>
          </div>
        </div>
      )}

      {/* ── New recipe modal ── */}
      {newRecipe && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setNewRecipe(null)}>
          <div className="bg-slate-900 border-2 border-orange-500/60 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-orange-400 uppercase tracking-widest">The scroll reveals…</p>
            <div className="flex justify-center my-4">
              <Ico src={RECIPE_MAP[newRecipe.recipeId]?.img} size="w-24 h-24" />
            </div>
            <h3 className="text-2xl font-bold text-white">{RECIPE_MAP[newRecipe.recipeId]?.name}</h3>
            <p className="text-sm text-slate-400 italic mt-1">“{RECIPE_MAP[newRecipe.recipeId]?.desc}”</p>
            {(() => {
              const r = RECIPE_MAP[newRecipe.recipeId];
              const bl = r && BUFF_LABELS[r.buff.type];
              return r && <p className="text-sm font-bold text-orange-400 mt-2">+{r.buff.value}% {bl.name} for {r.buff.minutes} min</p>;
            })()}
            <button onClick={() => setNewRecipe(null)} className="mt-5 bg-orange-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-orange-400 transition">
              To the kitchen!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WildwoodHomesteadGame;
