// components/games/MyHangoutGame.js
// ─────────────────────────────────────────────────────────────────────────────
// MY HANGOUT 🛋️ — your own 2D room in the Champions world.
// • Decorate: buy furniture with Wildwood gold, craft it from Wildwood
//   resources, and move in super-rare treasures found on expeditions.
// • Showcase: your Forge weapon mounts on the wall, your Menagerie companion
//   wanders the floor, plus curio pedestals, critter frames & a trophy fish.
// • Visit: browse classmates' rooms (read-only, from class data — no server
//   needed) and compare Style Scores.
// Saves to studentData.hangoutData; spends from studentData.homesteadData.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ROOM_COLS, WALL_ROWS, ROOM_ROWS,
  WALLPAPERS, FLOORS, WALLPAPER_MAP, FLOOR_MAP,
  FURNITURE, FURNITURE_MAP, FOUND_FURNITURE_ITEMS,
  CURIO_PEDESTALS, CRITTER_FRAMES,
  styleScoreOf, defaultSave,
} from './Hangout/hangoutConfig';
import { ITEMS as WW_ITEMS, CRITTER_MAP, GOLD_ICON, fmtQty } from './Homestead/homesteadConfig';
import { forgeStageFor } from './SweetEmpire/sweetEmpireConfig';
import { SPECIES_MAP as MENAGERIE_SPECIES, levelForXp as menLevelForXp } from './Menagerie/menagerieConfig';

const shinyFilter = 'hue-rotate(45deg) saturate(1.7) brightness(1.05)';

const cleanSave = (h) => ({
  wallpaper: WALLPAPER_MAP[h.wallpaper] ? h.wallpaper : 'cream',
  floor: FLOOR_MAP[h.floor] ? h.floor : 'oak',
  ownedWallpapers: [...new Set(['cream', ...(h.ownedWallpapers || [])])].filter((id) => WALLPAPER_MAP[id]),
  ownedFloors: [...new Set(['oak', ...(h.ownedFloors || [])])].filter((id) => FLOOR_MAP[id]),
  owned: Object.fromEntries(Object.entries(h.owned || {}).filter(([id, n]) => FURNITURE_MAP[id] && n > 0).map(([id, n]) => [id, Math.floor(n)])),
  placed: (h.placed || []).filter((p) => FURNITURE_MAP[p.itemId] && p.slot >= 0 && p.slot < ROOM_COLS * ROOM_ROWS)
    .map((p) => ({ slot: Number(p.slot), itemId: String(p.itemId) })),
  showcase: {
    curios: (h.showcase?.curios || []).filter(Boolean).slice(0, CURIO_PEDESTALS),
    critters: (h.showcase?.critters || []).filter(Boolean).slice(0, CRITTER_FRAMES),
    fish: h.showcase?.fish || null,
  },
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

// Extract everything a room render needs from any student's data blobs
const roomProfileOf = (hangoutData, sweetEmpireData, menagerieData) => {
  const stage = sweetEmpireData ? forgeStageFor(sweetEmpireData) : null;
  const comp = menagerieData?.companionUid
    ? (menagerieData.creatures || []).find((c) => c.uid === menagerieData.companionUid)
    : null;
  const compSp = comp ? MENAGERIE_SPECIES[comp.speciesId] : null;
  return {
    hangout: hangoutData || defaultSave(),
    weapon: stage && stage.index > 0 ? { name: stage.name, img: stage.img } : null,
    companion: compSp ? { name: compSp.name, img: compSp.img, shiny: !!comp.shiny, level: menLevelForXp(comp.xp) } : null,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOM VIEW — the shared 2D renderer (my room + visits)
// ═════════════════════════════════════════════════════════════════════════════
function RoomView({ profile, ownerName, editMode = false, editZone = null, onCellClick, onRemove }) {
  const { hangout, weapon, companion } = profile;
  const wall = WALLPAPER_MAP[hangout.wallpaper] || WALLPAPER_MAP.cream;
  const floor = FLOOR_MAP[hangout.floor] || FLOOR_MAP.oak;
  const placedBySlot = useMemo(() => {
    const m = {};
    (hangout.placed || []).forEach((p) => { m[p.slot] = p.itemId; });
    return m;
  }, [hangout.placed]);
  const wallPct = 54;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border-4 border-amber-900/50 shadow-2xl select-none" style={{ aspectRatio: '2 / 1.05', minHeight: 300 }}>
      <style>{`
        @keyframes hg-walk { 0% { left: 12%; transform: translateY(-50%) scaleX(1); } 48% { left: 78%; transform: translateY(-50%) scaleX(1); } 52% { left: 78%; transform: translateY(-50%) scaleX(-1); } 98% { left: 12%; transform: translateY(-50%) scaleX(-1); } 100% { left: 12%; transform: translateY(-50%) scaleX(1); } }
        @keyframes hg-hover { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
      {/* Wall + floor */}
      <div className="absolute inset-x-0 top-0" style={{ height: `${wallPct}%`, background: wall.css }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: `${100 - wallPct}%`, background: floor.css, boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.25)' }} />
      <div className="absolute inset-x-0" style={{ top: `${wallPct}%`, height: 4, background: 'rgba(0,0,0,0.25)' }} />

      {/* Forge weapon mount (auto showcase) */}
      {weapon && (
        <div className="absolute flex flex-col items-center" style={{ left: '50%', top: '6%', transform: 'translateX(-50%)' }} title={`Forge weapon: ${weapon.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={weapon.img} alt="" className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-lg" />
          <div className="text-[9px] font-bold text-amber-900 bg-amber-200/90 rounded-full px-2 mt-0.5 shadow">{weapon.name}</div>
        </div>
      )}

      {/* Showcase: curio pedestals along the floor front */}
      {(hangout.showcase?.curios || []).map((cid, i) => cid && WW_ITEMS[cid] && (
        <div key={`cu${i}`} className="absolute flex flex-col items-center" style={{ left: `${20 + i * 12}%`, bottom: '3%' }} title={WW_ITEMS[cid].name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WW_ITEMS[cid].img} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow" style={{ animation: 'hg-hover 2.4s ease-in-out infinite', ...(WW_ITEMS[cid].tint ? { filter: WW_ITEMS[cid].tint } : {}) }} />
          <div className="w-9 h-3 rounded-sm bg-amber-950/70 border border-amber-700/60" />
        </div>
      ))}

      {/* Showcase: critter frames (wall, right side) */}
      {(hangout.showcase?.critters || []).map((cid, i) => cid && CRITTER_MAP[cid] && (
        <div key={`cr${i}`} className="absolute bg-amber-100/90 border-2 border-amber-800/70 rounded-md p-1 shadow" style={{ right: `${4 + i * 8}%`, top: '10%' }} title={CRITTER_MAP[cid].name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CRITTER_MAP[cid].img} alt="" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
        </div>
      ))}

      {/* Showcase: trophy fish (wall, left) */}
      {hangout.showcase?.fish && WW_ITEMS[hangout.showcase.fish] && (
        <div className="absolute bg-amber-100/90 border-2 border-amber-800/70 rounded-lg px-2 py-1 shadow flex flex-col items-center" style={{ left: '4%', top: '10%' }} title={`Trophy: ${WW_ITEMS[hangout.showcase.fish].name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WW_ITEMS[hangout.showcase.fish].img} alt="" className="w-9 h-9 object-contain" style={WW_ITEMS[hangout.showcase.fish].tint ? { filter: WW_ITEMS[hangout.showcase.fish].tint } : undefined} />
          <div className="text-[8px] font-bold text-amber-800">{WW_ITEMS[hangout.showcase.fish].name}</div>
        </div>
      )}

      {/* Placed furniture + edit grid */}
      {Array.from({ length: ROOM_COLS * ROOM_ROWS }).map((_, slot) => {
        const row = Math.floor(slot / ROOM_COLS);
        const col = slot % ROOM_COLS;
        const isWall = row < WALL_ROWS;
        const itemId = placedBySlot[slot];
        const item = itemId ? FURNITURE_MAP[itemId] : null;
        // Cell positioning: wall rows share the wall band, floor rows the floor band
        const left = `${(col + 0.5) * (100 / ROOM_COLS)}%`;
        const top = isWall
          ? `${14 + row * 20}%`
          : `${wallPct + 6 + (row - WALL_ROWS) * 14}%`;
        if (item) {
          return (
            <button
              key={slot}
              onClick={() => editMode && onRemove?.(slot)}
              disabled={!editMode}
              className={`absolute ${editMode ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} transition-transform`}
              style={{ left, top, transform: 'translate(-50%,-50%)', zIndex: isWall ? 5 : 8 + row }}
              title={editMode ? `${item.name} — tap to put away` : item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt="" className={isWall ? 'w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow' : 'w-12 h-12 md:w-14 md:h-14 object-contain drop-shadow-lg'}
                style={item.tint ? { filter: item.tint } : undefined} />
            </button>
          );
        }
        if (editMode && editZone && ((editZone === 'wall') === isWall)) {
          return (
            <button
              key={slot}
              onClick={() => onCellClick?.(slot)}
              className="absolute w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-dashed border-white/60 bg-white/15 hover:bg-white/40 transition"
              style={{ left, top, transform: 'translate(-50%,-50%)', zIndex: 4 }}
              title="Place here"
            />
          );
        }
        return null;
      })}

      {/* Menagerie companion wanders the floor */}
      {companion && (
        <div className="absolute pointer-events-none" style={{ top: '82%', animation: 'hg-walk 14s linear infinite', zIndex: 20 }} title={`${companion.name} (Lv ${companion.level})`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={companion.img} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-white/80 shadow-lg"
            style={companion.shiny ? { filter: shinyFilter } : undefined} />
        </div>
      )}

      {/* Owner plate */}
      <div className="absolute top-2 left-2 bg-black/45 text-white text-xs font-bold rounded-full px-3 py-1 backdrop-blur-sm">
        {ownerName}&apos;s Hangout
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
const MyHangoutGame = ({ studentData, updateStudentData, showToast = () => {}, classmates = [], onSwitchGame = null }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('room');
  const [editItem, setEditItem] = useState(null);   // furnitureId being placed
  const [picker, setPicker] = useState(null);       // { kind: 'curios'|'critters'|'fish' }
  const [visitId, setVisitId] = useState(null);

  const gsRef = useRef(gs); gsRef.current = gs;
  const homesteadRef = useRef(null);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);

  const myName = studentData?.firstName || 'Student';

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    const raw = studentData?.hangoutData;
    const save = { ...defaultSave(), ...(raw || {}) };
    save.owned = { ...(raw?.owned || {}) };
    save.placed = (raw?.placed || []).map((p) => ({ ...p }));
    save.ownedWallpapers = [...new Set(['cream', ...(raw?.ownedWallpapers || [])])];
    save.ownedFloors = [...new Set(['oak', ...(raw?.ownedFloors || [])])];
    save.showcase = { curios: [], critters: [], fish: null, ...(raw?.showcase || {}) };
    homesteadRef.current = { ...(studentData?.homesteadData || {}), inv: { ...(studentData?.homesteadData?.inv || {}) } };
    setGs(save);
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Save ────────────────────────────────────────────────────────────────────
  const persist = useCallback(async (withHomestead = false) => {
    if (savingRef.current || !updateStudentData) return;
    savingRef.current = true;
    try {
      const payload = { hangoutData: cleanSave(gsRef.current) };
      if (withHomestead) payload.homesteadData = homesteadRef.current;
      await updateStudentData(payload);
      dirtyRef.current = false;
    } catch (err) {
      console.error('MyHangout: save failed', err);
    } finally {
      savingRef.current = false;
    }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 20000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  // ── Money & materials (Wildwood) ────────────────────────────────────────────
  const gold = () => Math.floor(Number(homesteadRef.current?.gold) || 0);
  const invCount = (id) => Math.floor(homesteadRef.current?.inv?.[id] || 0);
  const hasCraftItems = (req) => Object.entries(req || {}).every(([id, q]) => invCount(id) >= q);

  const spendGold = (n) => { homesteadRef.current.gold = gold() - n; };
  const spendItems = (req) => {
    Object.entries(req).forEach(([id, q]) => {
      homesteadRef.current.inv[id] = (homesteadRef.current.inv[id] || 0) - q;
      if (homesteadRef.current.inv[id] <= 0) delete homesteadRef.current.inv[id];
    });
  };

  // ── Shop actions ────────────────────────────────────────────────────────────
  const acquire = (f) => {
    if (f.src.gold) {
      if (gold() < f.src.gold) { showToast('Not enough Wildwood gold!', 'error'); return; }
      spendGold(f.src.gold);
    } else if (f.src.craft) {
      if (!hasCraftItems(f.src.craft)) { showToast('Missing materials — gather them in Wildwood!', 'error'); return; }
      spendItems(f.src.craft);
    } else if (f.src.found) {
      if (invCount(f.id) < 1) { showToast('Find one on a Wildwood expedition first!', 'error'); return; }
      spendItems({ [f.id]: 1 });
    }
    setGs((p) => ({ ...p, owned: { ...p.owned, [f.id]: (p.owned[f.id] || 0) + 1 } }));
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400); // let state flush to the ref first
    showToast(`${f.name} added to your hangout storage!`, 'success');
  };

  const buyTheme = (kind, t) => {
    const ownedKey = kind === 'wall' ? 'ownedWallpapers' : 'ownedFloors';
    const activeKey = kind === 'wall' ? 'wallpaper' : 'floor';
    const cur = gsRef.current;
    if (!(cur[ownedKey] || []).includes(t.id)) {
      if (gold() < t.cost) { showToast('Not enough Wildwood gold!', 'error'); return; }
      spendGold(t.cost);
      setGs((p) => ({ ...p, [ownedKey]: [...p[ownedKey], t.id], [activeKey]: t.id }));
      dirtyRef.current = true;
      setTimeout(() => persist(true), 400);
      showToast(`${t.name} applied!`, 'success');
    } else {
      setGs((p) => ({ ...p, [activeKey]: t.id }));
      dirtyRef.current = true;
    }
  };

  // ── Placement ───────────────────────────────────────────────────────────────
  const placedCount = (itemId) => gs.placed.filter((p) => p.itemId === itemId).length;
  const unplacedCount = (itemId) => (gs.owned[itemId] || 0) - placedCount(itemId);

  const placeAt = (slot) => {
    if (!editItem) return;
    if (unplacedCount(editItem) < 1) { setEditItem(null); return; }
    setGs((p) => ({ ...p, placed: [...p.placed, { slot, itemId: editItem }] }));
    dirtyRef.current = true;
    if (unplacedCount(editItem) <= 1) setEditItem(null);
  };
  const removeAt = (slot) => {
    setGs((p) => ({ ...p, placed: p.placed.filter((pl) => pl.slot !== slot) }));
    dirtyRef.current = true;
  };

  // ── Showcase pickers ────────────────────────────────────────────────────────
  const setShowcase = (kind, value) => {
    setGs((p) => ({ ...p, showcase: { ...p.showcase, [kind]: value } }));
    dirtyRef.current = true;
  };

  const myProfile = useMemo(
    () => ({ ...roomProfileOf(gs, studentData?.sweetEmpireData, studentData?.menagerieData), hangout: gs }),
    [gs, studentData]
  );
  const myScore = useMemo(() => styleScoreOf(gs), [gs]);

  const visitables = useMemo(
    () => (classmates || [])
      .filter((s) => s.id !== studentData?.id)
      .map((s) => ({ id: s.id, name: s.firstName || '?', data: s, score: styleScoreOf(s.hangoutData) }))
      .sort((a, b) => b.score - a.score),
    [classmates, studentData]
  );

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  const TABS = [
    { id: 'room', name: '🛋️ My Room' },
    { id: 'shop', name: '🛒 Furnish' },
    { id: 'showcase', name: '🏆 Showcase' },
    { id: 'visit', name: '🚪 Visit Friends' },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-amber-800 via-orange-800 to-rose-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🛋️ My Hangout</h1>
            <p className="text-white/85 text-sm">Your own corner of the Champions world — furnish it, show off your treasures, invite the class.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold drop-shadow">✨ {fmtQty(myScore)}</p>
            <p className="text-white/85 text-sm font-semibold">Style Score</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-xs font-bold">
          <span className="bg-black/30 rounded-full px-3 py-1 flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GOLD_ICON} alt="" className="w-4 h-4" /> {fmtQty(gold())} Wildwood gold
          </span>
          <span className="bg-black/30 rounded-full px-3 py-1">🪑 {Object.values(gs.owned).reduce((a, b) => a + b, 0)} furnishings</span>
          {onSwitchGame && (
            <>
              <button onClick={() => onSwitchGame('wildwood-homestead')} className="bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition">🏕️ Earn gold in Wildwood</button>
              <button onClick={() => onSwitchGame('town-square')} className="bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition">🏘️ Town Square</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setEditItem(null); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-amber-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50'}`}>
            {t.name}
          </button>
        ))}
      </div>

      {/* ══ MY ROOM ══ */}
      {tab === 'room' && (
        <div className="space-y-3">
          <RoomView
            profile={myProfile}
            ownerName={myName}
            editMode
            editZone={editItem ? FURNITURE_MAP[editItem]?.zone : null}
            onCellClick={placeAt}
            onRemove={removeAt}
          />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="font-bold text-gray-800">📦 Furniture Storage</h3>
              {editItem && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 animate-pulse">
                  Placing {FURNITURE_MAP[editItem]?.name} — tap a dashed spot on the {FURNITURE_MAP[editItem]?.zone}!
                  <button onClick={() => setEditItem(null)} className="underline ml-1.5">cancel</button>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">Tap an item to place it · tap placed furniture in the room to put it away.</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(gs.owned).filter(([id]) => unplacedCount(id) > 0).map(([id]) => {
                const f = FURNITURE_MAP[id];
                return f && (
                  <button key={id} onClick={() => setEditItem(editItem === id ? null : id)}
                    className={`flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition ${editItem === id ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.img} alt="" className="w-6 h-6 object-contain" style={f.tint ? { filter: f.tint } : undefined} />
                    {f.name} ×{unplacedCount(id)}
                  </button>
                );
              })}
              {Object.entries(gs.owned).filter(([id]) => unplacedCount(id) > 0).length === 0 && (
                <p className="text-sm text-gray-400 italic">Storage is empty — grab something from the Furnish tab!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ FURNISH (shop) ══ */}
      {tab === 'shop' && (
        <div className="space-y-3">
          {/* Themes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-2">🎨 Wallpaper &amp; Flooring</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[['wall', WALLPAPERS, gs.ownedWallpapers, gs.wallpaper], ['floor', FLOORS, gs.ownedFloors, gs.floor]].map(([kind, list, ownedList, active]) => (
                <div key={kind}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">{kind === 'wall' ? 'Wallpapers' : 'Floors'}</p>
                  <div className="flex flex-wrap gap-2">
                    {list.map((t) => {
                      const ownedIt = ownedList.includes(t.id);
                      return (
                        <button key={t.id} onClick={() => buyTheme(kind, t)}
                          className={`rounded-xl border-2 p-1.5 transition ${active === t.id ? 'border-amber-500 shadow' : 'border-gray-200 hover:border-amber-300'}`}
                          title={ownedIt ? t.name : `${t.name} — ${t.cost} gold`}>
                          <div className="w-14 h-9 rounded-lg" style={{ background: t.css }} />
                          <p className="text-[9px] font-bold text-gray-600 mt-0.5">{ownedIt ? t.name : `${t.cost}g`}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog */}
          {[['gold', '🛒 Buy with Wildwood Gold'], ['craft', '🔨 Craft from Wildwood Resources'], ['found', '🗺️ Rare Expedition Treasures']].map(([srcKind, label]) => (
            <div key={srcKind} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">{label}</h3>
              {srcKind === 'found' && (
                <p className="text-xs text-gray-500 mb-2">These only drop from Wildwood scavenges and hunts (very rarely!). Found one? Move it in here.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {FURNITURE.filter((f) => (srcKind === 'gold' ? !!f.src.gold : srcKind === 'craft' ? !!f.src.craft : !!f.src.found)).map((f) => {
                  const affordable = f.src.gold ? gold() >= f.src.gold : f.src.craft ? hasCraftItems(f.src.craft) : invCount(f.id) > 0;
                  return (
                    <div key={f.id} className={`rounded-xl border p-2.5 text-center ${f.src.found ? 'border-purple-200 bg-purple-50/40' : 'border-gray-200'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.img} alt="" className="w-10 h-10 mx-auto object-contain" style={f.tint ? { filter: f.tint } : undefined} />
                      <p className="text-xs font-bold text-gray-700 mt-1 truncate">{f.name}</p>
                      <p className="text-[9px] text-gray-400">{f.zone === 'wall' ? 'wall' : 'floor'} · +{f.style} style{(gs.owned[f.id] || 0) > 0 ? ` · own ${gs.owned[f.id]}` : ''}</p>
                      <p className="text-[10px] font-bold text-gray-600 mt-0.5 flex items-center justify-center gap-1 flex-wrap">
                        {f.src.gold && <>{f.src.gold} gold</>}
                        {f.src.craft && Object.entries(f.src.craft).map(([id, q]) => (
                          <span key={id} className={`flex items-center gap-0.5 ${invCount(id) >= q ? '' : 'text-red-400'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {q}<img src={WW_ITEMS[id]?.img} alt="" className="w-3.5 h-3.5 inline" style={WW_ITEMS[id]?.tint ? { filter: WW_ITEMS[id].tint } : undefined} />
                          </span>
                        ))}
                        {f.src.found && <span className={invCount(f.id) > 0 ? 'text-purple-600' : 'text-gray-400'}>{invCount(f.id) > 0 ? `1 in your pack!` : 'not found yet'}</span>}
                      </p>
                      <button onClick={() => acquire(f)} disabled={!affordable}
                        className="w-full mt-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg py-1.5 hover:bg-amber-500 disabled:opacity-40 transition">
                        {f.src.found ? 'Move In' : f.src.craft ? 'Craft' : 'Buy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══ SHOWCASE ══ */}
      {tab === 'showcase' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div>
            <h3 className="font-bold text-gray-800">🏆 Showcase your collections</h3>
            <p className="text-xs text-gray-500">Your Forge weapon and Menagerie companion appear automatically. Pick the rest below — they render right in your room.</p>
          </div>
          {[
            { kind: 'curios', label: `Curio pedestals (up to ${CURIO_PEDESTALS})`, pool: (studentData?.homesteadData?.discoveredRares || []), lookup: (id) => WW_ITEMS[id], picked: gs.showcase.curios, multi: CURIO_PEDESTALS },
            { kind: 'critters', label: `Critter frames (up to ${CRITTER_FRAMES})`, pool: (studentData?.homesteadData?.critters || []), lookup: (id) => CRITTER_MAP[id], picked: gs.showcase.critters, multi: CRITTER_FRAMES },
            { kind: 'fish', label: 'Trophy fish (1)', pool: (studentData?.homesteadData?.caughtFish || []), lookup: (id) => WW_ITEMS[id], picked: gs.showcase.fish ? [gs.showcase.fish] : [], multi: 1 },
          ].map(({ kind, label, pool, lookup, picked, multi }) => (
            <div key={kind}>
              <p className="text-sm font-bold text-gray-600 mb-1.5">{label}</p>
              {pool.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nothing collected yet — explore Wildwood Homestead!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {pool.map((id) => {
                    const it = lookup(id);
                    const isPicked = picked.includes(id);
                    return it && (
                      <button key={id}
                        onClick={() => {
                          if (kind === 'fish') setShowcase('fish', isPicked ? null : id);
                          else setShowcase(kind, isPicked ? picked.filter((x) => x !== id) : [...picked, id].slice(0, multi));
                        }}
                        className={`flex items-center gap-1.5 rounded-xl border-2 px-2 py-1.5 transition ${isPicked ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                        title={it.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={it.img} alt="" className="w-6 h-6 object-contain" style={it.tint ? { filter: it.tint } : undefined} />
                        <span className="text-[10px] font-bold text-gray-600 max-w-[70px] truncate">{it.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══ VISIT ══ */}
      {tab === 'visit' && (
        <div className="space-y-3">
          {visitId ? (() => {
            const v = visitables.find((x) => x.id === visitId);
            if (!v) return null;
            const prof = roomProfileOf(v.data.hangoutData, v.data.sweetEmpireData, v.data.menagerieData);
            return (
              <>
                <div className="flex items-center justify-between">
                  <button onClick={() => setVisitId(null)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-amber-50 transition">← Back to directory</button>
                  <span className="text-sm font-bold text-amber-700">✨ {v.score} Style Score</span>
                </div>
                <RoomView profile={prof} ownerName={v.name} />
              </>
            );
          })() : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-1">🚪 Class Hangout Directory</h3>
              <p className="text-xs text-gray-500 mb-3">Knock knock! Tap a classmate to look around their room.</p>
              <div className="divide-y divide-gray-50">
                {visitables.map((v, i) => (
                  <button key={v.id} onClick={() => setVisitId(v.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left hover:bg-amber-50 transition">
                    <span className="w-8 text-center font-bold text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{v.name}&apos;s Hangout</p>
                    {!v.data.hangoutData && <span className="text-[10px] text-gray-400">just moved in</span>}
                    <span className="font-bold text-amber-600 text-sm">✨ {v.score}</span>
                  </button>
                ))}
                {visitables.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No classmates found yet.</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyHangoutGame;
