// components/games/MyHangoutGame.js
// ─────────────────────────────────────────────────────────────────────────────
// MY HANGOUT v2 — personal rooms, now ALIVE:
// • LIVE PRESENCE: classmates appear in whichever hangout they're in, walking
//   around (WASD/arrows), chatting in bubbles and emoting — Town Square style,
//   under hangoutRooms/{classCode}/{ownerId} in the Realtime Database.
// • FREE PLACEMENT: furniture drops exactly where you click (wall band or
//   ground band), with proper per-item sizes.
// • BUILDABLE AREAS: Games Den, Backyard, Upstairs Loft and the Observatory —
//   expensive expansions crafted from serious Wildwood materials.
// • INTERACTIVE FURNITURE: the Wanderer Radio plays real music synced for
//   everyone in the room, the fridge opens your actual Wildwood pantry (snack
//   for real buffs!), the stove cooks real Wildwood recipes, TVs/laptops open
//   the arcade, and the Wheel of Fortune pays a daily gold prize to anyone.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { database } from '../../utils/firebase';
import { ref, set, update, remove, onValue, off, onDisconnect } from 'firebase/database';
import { getAvatarImage, calculateAvatarLevel } from '../../utils/gameHelpers';
import { containsProfanity } from '../../utils/profanityFilter';
import {
  WALL_BAND, GROUND_BAND, WALL_SPLIT, SIZES,
  HANGOUT_AREAS, AREA_MAP, OUTDOOR_SKY, OUTDOOR_GROUND, NIGHT_SKY, NIGHT_GROUND,
  WALLPAPERS, FLOORS, WALLPAPER_MAP, FLOOR_MAP,
  MUSIC_TRACKS, MUSIC_MAP,
  FURNITURE, FURNITURE_MAP,
  CURIO_PEDESTALS, CRITTER_FRAMES, WHEEL_PRIZES,
  styleScoreOf, newPlacedId, defaultSave,
} from './Hangout/hangoutConfig';
import {
  ITEMS as WW_ITEMS, CRITTER_MAP, GOLD_ICON, fmtQty,
  RECIPES as WW_RECIPES_LIST, RECIPE_MAP as WW_RECIPE_MAP, dishIdOf,
  KITCHEN_TIERS, BUFF_LABELS, MAX_ACTIVE_BUFFS, skillLevel as wwSkillLevel,
  CROP_BY_SEED, GOLDEN_CROP_CHANCE,
} from './Homestead/homesteadConfig';
import { forgeStageFor } from './SweetEmpire/sweetEmpireConfig';
import { SPECIES_MAP as MENAGERIE_SPECIES, levelForXp as menLevelForXp } from './Menagerie/menagerieConfig';
import { MINIGAMES } from './TownSquare/townSquareConfig';
import ChallengeOverlay from './TownSquare/MiniGames';

// The connected "world" games never appear in the arcade — they have their own doors
const WORLD_GAME_IDS = ['sweet-empire', 'champions-menagerie', 'wildwood-homestead', 'town-square', 'my-hangout'];

const shinyFilter = 'hue-rotate(45deg) saturate(1.7) brightness(1.05)';
const dayStr = () => new Date().toISOString().slice(0, 10);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// ── Save hygiene + legacy (grid-slot) migration ──────────────────────────────
const migrate = (raw) => {
  const d = defaultSave();
  if (!raw) return d;
  const save = { ...d, ...raw };
  save.built = [...new Set(['main', ...(raw.built || [])])].filter((id) => AREA_MAP[id]);
  save.areas = {};
  save.built.forEach((id) => {
    const a = raw.areas?.[id] || {};
    save.areas[id] = {
      wallpaper: WALLPAPER_MAP[a.wallpaper] ? a.wallpaper : 'cream',
      floor: FLOOR_MAP[a.floor] ? a.floor : 'oak',
      placed: (a.placed || []).filter((p) => FURNITURE_MAP[p.itemId])
        .map((p) => ({ id: p.id || newPlacedId(), itemId: p.itemId, x: clamp(Number(p.x) || 50, 2, 98), y: clamp(Number(p.y) || 70, 4, 96) })),
    };
  });
  // v1 legacy: root wallpaper/floor + slot-grid placed → main room, free coords
  if (raw.placed && !raw.areas) {
    save.areas.main.wallpaper = WALLPAPER_MAP[raw.wallpaper] ? raw.wallpaper : 'cream';
    save.areas.main.floor = FLOOR_MAP[raw.floor] ? raw.floor : 'oak';
    save.areas.main.placed = (raw.placed || []).filter((p) => FURNITURE_MAP[p.itemId]).map((p) => {
      const row = Math.floor((p.slot || 0) / 10);
      const col = (p.slot || 0) % 10;
      const isWall = row < 2;
      return {
        id: newPlacedId(), itemId: p.itemId,
        x: clamp((col + 0.5) * 10, 4, 96),
        y: isWall ? clamp(14 + row * 20, WALL_BAND.top, WALL_BAND.bottom) : clamp(62 + (row - 2) * 13, GROUND_BAND.top, GROUND_BAND.bottom),
      };
    });
  }
  save.owned = Object.fromEntries(Object.entries(raw.owned || {}).filter(([id, n]) => FURNITURE_MAP[id] && n > 0));
  // Free starters — every player automatically owns the Arcade Cabinet + Game Bookshelf
  save.owned.arcade_cab = Math.max(1, save.owned.arcade_cab || 0);
  save.owned.game_bookshelf = Math.max(1, save.owned.game_bookshelf || 0);
  save.ownedWallpapers = [...new Set(['cream', ...(raw.ownedWallpapers || [])])].filter((id) => WALLPAPER_MAP[id]);
  save.ownedFloors = [...new Set(['oak', ...(raw.ownedFloors || [])])].filter((id) => FLOOR_MAP[id]);
  save.showcase = { curios: [], critters: [], fish: null, ...(raw.showcase || {}) };
  save.showcaseRoom = raw.showcaseRoom === 'trophy' ? 'trophy' : 'main';
  save.farms = Object.fromEntries(Object.entries(raw.farms || {}).filter(([, f]) => f && CROP_BY_SEED[f.seedId])
    .map(([pid, f]) => [pid, { seedId: f.seedId, readyAt: Number(f.readyAt) || 0 }]));
  return save;
};

const cleanSave = (h) => ({
  built: [...new Set(['main', 'trophy', ...(h.built || [])])].filter((id) => AREA_MAP[id]),
  areas: Object.fromEntries(Object.entries(h.areas || {}).map(([id, a]) => [id, {
    wallpaper: a.wallpaper, floor: a.floor,
    placed: (a.placed || []).map((p) => ({ id: p.id, itemId: p.itemId, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 })),
  }])),
  owned: h.owned,
  ownedWallpapers: h.ownedWallpapers,
  ownedFloors: h.ownedFloors,
  showcase: {
    curios: (h.showcase?.curios || []).filter(Boolean).slice(0, CURIO_PEDESTALS),
    critters: (h.showcase?.critters || []).filter(Boolean).slice(0, CRITTER_FRAMES),
    fish: h.showcase?.fish || null,
  },
  showcaseRoom: h.showcaseRoom === 'trophy' ? 'trophy' : 'main',
  farms: (() => {
    const placedIds = new Set();
    Object.values(h.areas || {}).forEach((a) => (a.placed || []).forEach((p) => placedIds.add(p.id)));
    return Object.fromEntries(Object.entries(h.farms || {})
      .filter(([pid, f]) => placedIds.has(pid) && f && CROP_BY_SEED[f.seedId])
      .map(([pid, f]) => [pid, { seedId: f.seedId, readyAt: Number(f.readyAt) || 0 }]));
  })(),
  wheelDay: h.wheelDay || null,
  lastSeen: new Date().toISOString(),
  lastSaved: new Date().toISOString(),
});

const roomProfileOf = (hangoutData, sweetEmpireData, menagerieData) => {
  const stage = sweetEmpireData ? forgeStageFor(sweetEmpireData) : null;
  const comp = menagerieData?.companionUid
    ? (menagerieData.creatures || []).find((c) => c.uid === menagerieData.companionUid)
    : null;
  const compSp = comp ? MENAGERIE_SPECIES[comp.speciesId] : null;
  return {
    hangout: migrate(hangoutData),
    weapon: stage && stage.index > 0 ? { name: stage.name, img: stage.img } : null,
    companion: compSp ? { name: compSp.name, img: compSp.img, shiny: !!comp.shiny, level: menLevelForXp(comp.xp) } : null,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// COMPANION SPRITE — greets you at the door, shakes with joy, then potters
// around the room sniffing at the furniture.
// Phases: greet (runs to your avatar) → shake (happy wiggle + hearts) →
// explore (walks to a random decoration or spot) → pause (looks around) → …
// ═════════════════════════════════════════════════════════════════════════════
function CompanionSprite({ companion, area, myPosRef }) {
  const divRef = useRef(null);
  const faceRef = useRef(null);
  const posRef = useRef({ x: 4, y: 86 });
  const targetRef = useRef(null);
  const pauseUntilRef = useRef(0);
  const [phase, setPhase] = useState('greet');
  const phaseRef = useRef('greet'); phaseRef.current = phase;

  // A fresh room (or different companion) restarts the greeting from the door
  useEffect(() => {
    posRef.current = { x: 4, y: 86 };
    targetRef.current = null;
    setPhase('greet');
  }, [companion?.name, area]);

  useEffect(() => {
    let raf;
    const step = () => {
      const p = posRef.current;
      const ph = phaseRef.current;
      let target = null;
      if (ph === 'greet') {
        const me = myPosRef?.current || { x: 50, y: 80 };
        target = { x: clamp(me.x - 7, 3, 97), y: clamp(me.y + 2, 56, 93) };
      } else if (ph === 'explore') {
        target = targetRef.current;
      }
      if (target) {
        const dx = target.x - p.x, dy = target.y - p.y;
        const d = Math.hypot(dx, dy);
        const speed = ph === 'greet' ? 0.6 : 0.22; // sprints to say hi, ambles after
        if (d < 1.4) {
          if (ph === 'greet') { pauseUntilRef.current = Date.now() + 2000; setPhase('shake'); }
          else { pauseUntilRef.current = Date.now() + 1200 + Math.random() * 2400; setPhase('pause'); }
        } else {
          p.x += (dx / d) * speed;
          p.y += (dy / d) * speed;
          if (faceRef.current) faceRef.current.style.transform = `scaleX(${dx >= 0 ? 1 : -1})`;
        }
      } else if ((ph === 'shake' || ph === 'pause') && Date.now() >= pauseUntilRef.current) {
        // Next stop: usually a piece of furniture to investigate, sometimes a random sniff-spot
        const decorations = (area?.placed || []).filter((q) => (q.y || 0) > 50);
        const pick = decorations.length > 0 && Math.random() < 0.65
          ? decorations[Math.floor(Math.random() * decorations.length)]
          : null;
        targetRef.current = pick
          ? { x: clamp(pick.x + (Math.random() * 12 - 6), 3, 97), y: clamp(pick.y + 4, 56, 93) }
          : { x: 5 + Math.random() * 90, y: 56 + Math.random() * 36 };
        setPhase('explore');
      }
      if (divRef.current) {
        divRef.current.style.left = `${p.x}%`;
        divRef.current.style.top = `${p.y}%`;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [area, myPosRef]);

  return (
    <div ref={divRef} className="absolute pointer-events-none" style={{ left: '4%', top: '86%', transform: 'translate(-50%,-50%)', zIndex: 60 }}
      title={`${companion.name} (Lv ${companion.level})`}>
      {phase === 'shake' && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-base" style={{ animation: 'hg-note 1.1s linear infinite' }}>❤️</span>
      )}
      <span ref={faceRef} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={companion.img} alt="" className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/80 shadow-lg"
          style={{
            ...(companion.shiny ? { filter: shinyFilter } : {}),
            animation: phase === 'shake' ? 'hg-shake 0.35s ease-in-out infinite'
              : phase === 'pause' ? 'hg-look 2.6s ease-in-out infinite'
              : 'hg-trot 0.5s ease-in-out infinite',
          }} />
      </span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ROOM VIEW — one area, free-placed furniture, live players
// ═════════════════════════════════════════════════════════════════════════════
function RoomView({ profile, areaId, ownerName, editMode, placingZone, players = {}, myId, myPosDivRef, myPosRef, myInfo, onRoomClick, onItemClick, musicPlaying }) {
  const { hangout, weapon, companion } = profile;
  const area = hangout.areas[areaId] || hangout.areas.main;
  const areaDef = AREA_MAP[areaId] || AREA_MAP.main;
  const isMain = areaId === (hangout.showcaseRoom === 'trophy' ? 'trophy' : 'main'); // showcase room (kept name for the blocks below)
  const wallCss = areaDef.type === 'outdoor' ? OUTDOOR_SKY : areaDef.type === 'night' ? NIGHT_SKY : (WALLPAPER_MAP[area.wallpaper] || WALLPAPER_MAP.cream).css;
  const floorCss = areaDef.type === 'outdoor' ? OUTDOOR_GROUND : areaDef.type === 'night' ? NIGHT_GROUND : (FLOOR_MAP[area.floor] || FLOOR_MAP.oak).css;
  const rootRef = useRef(null);
  const nowTs = Date.now();

  const handleClick = (e) => {
    if (!onRoomClick || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onRoomClick(x, y);
  };

  return (
    <div ref={rootRef} onClick={handleClick}
      className={`relative w-full rounded-2xl overflow-hidden border-4 border-amber-900/50 shadow-2xl select-none ${placingZone ? 'cursor-crosshair' : ''}`}
      style={{ aspectRatio: '2 / 1.05', minHeight: 320 }}>
      <style>{`
        @keyframes hg-shake { 0%,100% { transform: rotate(-9deg) translateY(0); } 25% { transform: rotate(9deg) translateY(-3px); } 50% { transform: rotate(-9deg) translateY(0); } 75% { transform: rotate(9deg) translateY(-3px); } }
        @keyframes hg-trot { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes hg-look { 0%,55%,100% { transform: rotate(0deg); } 15% { transform: rotate(-7deg); } 35% { transform: rotate(7deg); } 75% { transform: translateY(-2px); } }
        @keyframes hg-hover { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes hg-glow { 0%,100% { filter: drop-shadow(0 0 3px rgba(251,191,36,0.7)); } 50% { filter: drop-shadow(0 0 10px rgba(251,191,36,1)); } }
        @keyframes hg-note { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-26px); } }
      `}</style>

      {/* Backdrop */}
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_SPLIT}%`, background: wallCss }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: `${100 - WALL_SPLIT}%`, background: floorCss, boxShadow: 'inset 0 6px 12px rgba(0,0,0,0.22)' }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_SPLIT}%`, height: 4, background: 'rgba(0,0,0,0.25)' }} />
      {areaDef.type === 'outdoor' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/game icons/Wildwood/Nature/017-sun.svg" alt="" className="absolute w-14 h-14 opacity-90" style={{ right: '6%', top: '5%' }} />
      )}
      {areaDef.type === 'night' && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game icons/Wildwood/Nature/002-moon.svg" alt="" className="absolute w-12 h-12 opacity-90" style={{ right: '8%', top: '6%' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/game icons/Wildwood/Magic/049-constellation.svg" alt="" className="absolute w-14 h-14 opacity-60" style={{ left: '10%', top: '8%' }} />
        </>
      )}

      {/* Placement band hint */}
      {placingZone && (
        <div className="absolute inset-x-0 pointer-events-none border-y-2 border-dashed border-white/70 bg-white/10"
          style={placingZone === 'wall'
            ? { top: `${WALL_BAND.top}%`, height: `${WALL_BAND.bottom - WALL_BAND.top}%` }
            : { top: `${GROUND_BAND.top}%`, height: `${GROUND_BAND.bottom - GROUND_BAND.top}%` }} />
      )}

      {/* Showcase (main room only) */}
      {isMain && weapon && (
        <div className="absolute flex flex-col items-center pointer-events-none" style={{ left: '50%', top: '4%', transform: 'translateX(-50%)' }} title={`Forge weapon: ${weapon.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={weapon.img} alt="" className="w-14 h-14 md:w-20 md:h-20 object-contain drop-shadow-lg" />
          <div className="text-[9px] font-bold text-amber-900 bg-amber-200/90 rounded-full px-2 mt-0.5 shadow">{weapon.name}</div>
        </div>
      )}
      {isMain && (hangout.showcase?.curios || []).map((cid, i) => cid && WW_ITEMS[cid] && (
        <div key={`cu${i}`} className="absolute flex flex-col items-center pointer-events-none" style={{ left: `${8 + i * 9}%`, bottom: '2%' }} title={WW_ITEMS[cid].name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WW_ITEMS[cid].img} alt="" className="w-9 h-9 md:w-12 md:h-12 object-contain drop-shadow" style={{ animation: 'hg-hover 2.4s ease-in-out infinite', ...(WW_ITEMS[cid].tint ? { filter: WW_ITEMS[cid].tint } : {}) }} />
          <div className="w-10 h-3 rounded-sm bg-amber-950/70 border border-amber-700/60" />
        </div>
      ))}
      {isMain && (hangout.showcase?.critters || []).map((cid, i) => cid && CRITTER_MAP[cid] && (
        <div key={`cr${i}`} className="absolute bg-amber-100/90 border-2 border-amber-800/70 rounded-md p-1 shadow pointer-events-none" style={{ right: `${3 + i * 7}%`, top: '7%' }} title={CRITTER_MAP[cid].name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CRITTER_MAP[cid].img} alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
        </div>
      ))}
      {isMain && hangout.showcase?.fish && WW_ITEMS[hangout.showcase.fish] && (
        <div className="absolute bg-amber-100/90 border-2 border-amber-800/70 rounded-lg px-2 py-1 shadow flex flex-col items-center pointer-events-none" style={{ left: '3%', top: '7%' }} title={`Trophy: ${WW_ITEMS[hangout.showcase.fish].name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={WW_ITEMS[hangout.showcase.fish].img} alt="" className="w-9 h-9 md:w-11 md:h-11 object-contain" style={WW_ITEMS[hangout.showcase.fish].tint ? { filter: WW_ITEMS[hangout.showcase.fish].tint } : undefined} />
          <div className="text-[8px] font-bold text-amber-800">{WW_ITEMS[hangout.showcase.fish].name}</div>
        </div>
      )}

      {/* Placed furniture */}
      {(area.placed || []).map((p) => {
        const item = FURNITURE_MAP[p.itemId];
        if (!item) return null;
        const glow = item.interactive && !editMode;
        const farm = item.interactive === 'farm' ? hangout.farms?.[p.id] : null;
        const farmCrop = farm ? CROP_BY_SEED[farm.seedId] : null;
        const farmReady = farm && nowTs >= farm.readyAt;
        return (
          <button
            key={p.id}
            onClick={(e) => { e.stopPropagation(); onItemClick?.(p, item); }}
            className={`absolute transition-transform ${editMode ? 'hover:scale-110' : glow ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', zIndex: Math.round(p.y) }}
            title={editMode ? `${item.name} — tap to put away` : item.interactive ? `${item.name} — tap to use!` : item.name}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.img} alt="" className={`${SIZES[item.size] || SIZES.md} object-contain drop-shadow-lg`}
              style={{ ...(item.tint ? { filter: item.tint } : {}), ...(glow ? { animation: 'hg-glow 2s ease-in-out infinite' } : {}) }} />
            {glow && item.interactive === 'radio' && musicPlaying && (
              <span className="absolute -top-2 left-1/2 text-base pointer-events-none" style={{ animation: 'hg-note 1.4s linear infinite' }}>🎵</span>
            )}
            {/* Growing crop overlay on Garden Beds */}
            {farmCrop && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={farmReady ? WW_ITEMS[farmCrop.cropId]?.img : '/game icons/Wildwood/Farm/003-sprout.svg'}
                  alt="" className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow"
                  style={{ animation: farmReady ? 'hg-glow 1.6s ease-in-out infinite' : 'hg-hover 2.4s ease-in-out infinite', ...(farmReady && WW_ITEMS[farmCrop.cropId]?.tint ? { filter: WW_ITEMS[farmCrop.cropId].tint } : {}) }} />
                {farmReady && <span className="text-[8px] font-bold text-white bg-emerald-700/90 rounded-full px-1.5 shadow">READY!</span>}
              </span>
            )}
          </button>
        );
      })}

      {/* Companion: greets you, shakes happily, then explores the decorations */}
      {companion && <CompanionSprite companion={companion} area={area} myPosRef={myPosRef} />}

      {/* Live visitors */}
      {Object.entries(players).map(([pid, p]) => pid !== myId && (
        <div key={pid} className="absolute flex flex-col items-center pointer-events-none" style={{ left: `${p.x || 50}%`, top: `${p.y || 80}%`, transform: 'translate(-50%,-50%)', zIndex: 70, transition: 'left 0.18s linear, top 0.18s linear' }}>
          {p.emote && nowTs - (p.emote.at || 0) < 3000 ? (
            <div className="text-2xl mb-0.5" style={{ animation: 'hg-hover 0.6s ease-in-out infinite' }}>{p.emote.e}</div>
          ) : p.bubble && nowTs - (p.bubble.at || 0) < 5000 ? (
            <div className="bg-white text-slate-800 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[120px] truncate">{p.bubble.text}</div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getAvatarImage(p.avatarBase, p.level)} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg bg-white/80" />
          <div className="text-[10px] font-bold text-white bg-black/60 rounded px-1.5 mt-0.5 max-w-[90px] truncate">{p.name}</div>
        </div>
      ))}

      {/* Me (moved via ref by the movement loop) */}
      {myInfo && (
        <div ref={myPosDivRef} className="absolute flex flex-col items-center pointer-events-none" style={{ left: '50%', top: '80%', transform: 'translate(-50%,-50%)', zIndex: 75 }}>
          {myInfo.emote && nowTs - (myInfo.emote.at || 0) < 3000 ? (
            <div className="text-2xl mb-0.5" style={{ animation: 'hg-hover 0.6s ease-in-out infinite' }}>{myInfo.emote.e}</div>
          ) : myInfo.bubble && nowTs - (myInfo.bubble.at || 0) < 5000 ? (
            <div className="bg-yellow-300 text-slate-900 text-xs rounded-xl px-2 py-1 mb-1 shadow max-w-[120px] truncate">{myInfo.bubble.text}</div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={myInfo.avatarSrc} alt="" className="w-11 h-11 md:w-12 md:h-12 rounded-full border-2 border-yellow-300 shadow-xl bg-white/80" />
          <div className="text-[10px] font-bold text-white bg-black/70 rounded px-1.5 mt-0.5">{myInfo.name}</div>
        </div>
      )}

      <div className="absolute top-2 left-2 bg-black/45 text-white text-xs font-bold rounded-full px-3 py-1 backdrop-blur-sm pointer-events-none z-[80]">
        {ownerName}&apos;s {AREA_MAP[areaId]?.name || 'Hangout'}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// On-screen d-pad button (touch devices) — pointer events so it also works with a stylus
const DpadBtn = ({ label, onDown, onUp }) => (
  <button
    onPointerDown={(e) => { e.preventDefault(); onDown(); }}
    onPointerUp={onUp}
    onPointerLeave={onUp}
    onPointerCancel={onUp}
    className="bg-black/30 active:bg-black/60 border border-white/30 text-white rounded-xl text-2xl font-bold flex items-center justify-center h-12 w-12 mx-auto touch-none select-none"
  >
    {label}
  </button>
);

const MyHangoutGame = ({ studentData, updateStudentData, showToast = () => {}, classData, classmates = [], onSwitchGame = null, arcadeGames = [] }) => {
  const [gs, setGs] = useState(defaultSave);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('room');
  const [areaId, setAreaId] = useState('main');
  const [editMode, setEditMode] = useState(false);
  const [placingId, setPlacingId] = useState(null);
  const [picker, setPicker] = useState(null);        // showcase picker kind
  const [shopFilter, setShopFilter] = useState('all'); // furniture catalog zone filter
  const [visitId, setVisitId] = useState(null);
  const [interact, setInteract] = useState(null);    // { type, ownerIsMe, ownerData }
  const [players, setPlayers] = useState({});
  const [roomMusic, setRoomMusic] = useState(null);
  const [musicBlocked, setMusicBlocked] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [myBubble, setMyBubble] = useState(null);
  const [myEmote, setMyEmote] = useState(null);
  const [liveRoom, setLiveRoom] = useState(null);    // live RTDB mirror of the room I'm visiting
  const [hgChallenge, setHgChallenge] = useState(null); // live bookshelf minigame I'm part of
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [, forceTick] = useState(0);

  const gsRef = useRef(gs); gsRef.current = gs;
  const homesteadRef = useRef(null);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const homesteadDirtyRef = useRef(false); // an unsaved Wildwood deduction exists
  const queuedSaveRef = useRef(false);     // a persist arrived while another was in flight
  const myPosRef = useRef({ x: 50, y: 80 });
  const myPosDivRef = useRef(null);
  const keysRef = useRef({});
  const roomPathRef = useRef(null);
  const myPlayerRef = useRef(null);
  const audioRef = useRef(null);

  const myId = studentData?.id || 'anon';
  const myName = studentData?.firstName || 'Student';
  const myLevel = calculateAvatarLevel(studentData?.totalPoints || 0);
  const myAvatarSrc = getAvatarImage(studentData?.avatarBase || 'Wizard F', myLevel);
  const classCode = (classData?.classCode || '').toLowerCase();

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (loaded) return;
    setGs(migrate(studentData?.hangoutData));
    homesteadRef.current = {
      ...(studentData?.homesteadData || {}),
      inv: { ...(studentData?.homesteadData?.inv || {}) },
      chest: { ...(studentData?.homesteadData?.chest || {}) },
      activeBuffs: [...(studentData?.homesteadData?.activeBuffs || [])],
    };
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentData, loaded]);

  // ── Save ────────────────────────────────────────────────────────────────────
  // Never drop a save: if one is in flight, queue another pass. homesteadDirtyRef
  // guarantees a spent cost can't be skipped by a later hangout-only save.
  const persist = useCallback(async (withHomestead = false) => {
    if (withHomestead) homesteadDirtyRef.current = true;
    if (!updateStudentData) return;
    if (savingRef.current) { queuedSaveRef.current = true; return; }
    savingRef.current = true;
    try {
      do {
        queuedSaveRef.current = false;
        const inclHome = homesteadDirtyRef.current;
        const payload = { hangoutData: cleanSave(gsRef.current) };
        if (inclHome) payload.homesteadData = homesteadRef.current;
        await updateStudentData(payload);
        dirtyRef.current = false;
        if (inclHome) homesteadDirtyRef.current = false;
      } while (queuedSaveRef.current);
    } catch (err) { console.error('MyHangout: save failed', err); }
    finally { savingRef.current = false; }
  }, [updateStudentData]);

  useEffect(() => {
    if (!loaded) return;
    const t = setInterval(() => { if (dirtyRef.current) persist(); }, 20000);
    return () => { clearInterval(t); persist(); };
  }, [loaded, persist]);

  // Touch-capable device? (iPads included — don't gate on screen width)
  useEffect(() => {
    const touchCapable = (typeof window !== 'undefined' && 'ontouchstart' in window) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!touchCapable);
  }, []);

  // ── LIVE ROOM MIRROR ────────────────────────────────────────────────────────
  // Publish my room layout to RTDB whenever it changes (debounced), so visitors
  // see redecorating within a second — no page reload on either side. Firestore
  // stays the authoritative save; this is just a fast read-only mirror.
  useEffect(() => {
    if (!loaded || !classCode || !myId || myId === 'anon') return;
    const t = setTimeout(() => {
      set(ref(database, `hangoutRooms/${classCode}/${myId}/room`), {
        data: cleanSave(gsRef.current), updatedAt: Date.now(),
      }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [gs, loaded, classCode, myId]);

  // While visiting, subscribe to the owner's live mirror (falls back to the
  // page-load snapshot for owners who haven't opened their hangout recently).
  useEffect(() => {
    if (!(tab === 'visit' && visitId && classCode)) { setLiveRoom(null); return undefined; }
    const r = ref(database, `hangoutRooms/${classCode}/${visitId}/room`);
    onValue(r, (snap) => setLiveRoom(snap.val()));
    return () => { off(r); setLiveRoom(null); };
  }, [tab, visitId, classCode]);

  // ── BOOKSHELF MULTIPLAYER — live minigames vs whoever is in the room ───────
  // Challenges live under worldRooms/{class}/challenges with an `hg_` prefix so
  // the Town Square engine (and its class-wide win announcements) just work.
  useEffect(() => {
    if (!loaded || !classCode) return undefined;
    const r = ref(database, `worldRooms/${classCode}/challenges`);
    onValue(r, (snap) => {
      const all = snap.val() || {};
      const mine = Object.entries(all).find(([id, c]) => id.startsWith('hg_')
        && c?.status === 'active'
        && (c.from?.id === myId || c.to?.id === myId)
        && Date.now() - (c.createdAt || 0) < 2 * 60 * 60 * 1000);
      setHgChallenge(mine ? { id: mine[0], ...mine[1] } : null);
    });
    return () => { off(r); setHgChallenge(null); };
  }, [loaded, classCode, myId]);

  const startLibraryGame = (gameId) => {
    if (hgChallenge) { showToast('Finish your current game first!', 'error'); return; }
    const visitors = Object.entries(players).filter(([pid]) => pid !== myId);
    if (visitors.length === 0) { showToast('No one else is here — invite a classmate to visit!', 'info'); return; }
    const [oppId, opp] = visitors[Math.floor(Math.random() * visitors.length)];
    const challengeId = `hg_${myId}_${Date.now()}`;
    set(ref(database, `worldRooms/${classCode}/challenges/${challengeId}`), {
      game: gameId, from: { id: myId, name: myName }, to: { id: oppId, name: opp?.name || '?' },
      status: 'active', createdAt: Date.now(), hangout: true,
    }).catch(() => {});
    setInteract(null);
  };

  const closeHgChallenge = () => {
    if (hgChallenge?.id && classCode) remove(ref(database, `worldRooms/${classCode}/challenges/${hgChallenge.id}`)).catch(() => {});
    setHgChallenge(null);
  };

  // ── Which hangout am I standing in? ────────────────────────────────────────
  const currentOwnerId = tab === 'visit' && visitId ? visitId : myId;
  const inRoomView = loaded && (tab === 'room' || (tab === 'visit' && !!visitId));

  // ── LIVE PRESENCE (join/leave the current hangout's RTDB room) ─────────────
  useEffect(() => {
    if (!inRoomView || !classCode) return;
    const path = `hangoutRooms/${classCode}/${currentOwnerId}`;
    roomPathRef.current = path;
    const meRef = ref(database, `${path}/players/${myId}`);
    myPlayerRef.current = meRef;
    myPosRef.current = { x: 30 + Math.random() * 40, y: 78 };
    set(meRef, { name: myName, avatarBase: studentData?.avatarBase || 'Wizard F', level: myLevel, x: myPosRef.current.x, y: myPosRef.current.y, at: Date.now() }).catch(() => {});
    onDisconnect(meRef).remove();

    const playersR = ref(database, `${path}/players`);
    onValue(playersR, (snap) => setPlayers(snap.val() || {}));
    const musicR = ref(database, `${path}/music`);
    onValue(musicR, (snap) => setRoomMusic(snap.val()));

    const sync = setInterval(() => {
      update(meRef, { x: Math.round(myPosRef.current.x * 10) / 10, y: Math.round(myPosRef.current.y * 10) / 10, at: Date.now() }).catch(() => {});
    }, 160);
    const pulse = setInterval(() => forceTick((n) => n + 1), 800); // bubble/emote expiry

    return () => {
      clearInterval(sync);
      clearInterval(pulse);
      remove(meRef).catch(() => {});
      off(playersR);
      off(musicR);
      setPlayers({});
      setRoomMusic(null);
    };
  }, [inRoomView, classCode, currentOwnerId, myId, myName, myLevel, studentData?.avatarBase]);

  // ── Movement (WASD/arrows, free within the room) ───────────────────────────
  useEffect(() => {
    if (!inRoomView) return;
    const down = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        keysRef.current[e.key.toLowerCase().replace('arrow', '')] = true;
        e.preventDefault();
      }
    };
    const up = (e) => { keysRef.current[e.key.toLowerCase().replace('arrow', '')] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    let raf;
    const loop = () => {
      const k = keysRef.current;
      let dx = 0, dy = 0;
      if (k.up || k.w) dy -= 1;
      if (k.down || k.s) dy += 1;
      if (k.left || k.a) dx -= 1;
      if (k.right || k.d) dx += 1;
      if (dx || dy) {
        const len = Math.hypot(dx, dy) || 1;
        myPosRef.current.x = clamp(myPosRef.current.x + (dx / len) * 0.9, 3, 97);
        myPosRef.current.y = clamp(myPosRef.current.y + (dy / len) * 0.9, 50, 94);
        if (myPosDivRef.current) {
          myPosDivRef.current.style.left = `${myPosRef.current.x}%`;
          myPosDivRef.current.style.top = `${myPosRef.current.y}%`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); cancelAnimationFrame(raf); };
  }, [inRoomView]);

  // ── Synced radio music ──────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = roomMusic?.playing ? MUSIC_MAP[roomMusic.trackId] : null;
    if (!track) { audio.pause(); setMusicBlocked(false); return; }
    if (!audio.src.endsWith(track.file)) audio.src = track.file;
    audio.loop = true;
    audio.volume = 0.45;
    audio.play().then(() => setMusicBlocked(false)).catch(() => setMusicBlocked(true));
  }, [roomMusic]);

  const setRoomTrack = useCallback((trackId) => {
    if (!roomPathRef.current) return;
    if (trackId) set(ref(database, `${roomPathRef.current}/music`), { trackId, playing: true, startedAt: Date.now(), by: myName }).catch(() => {});
    else remove(ref(database, `${roomPathRef.current}/music`)).catch(() => {});
  }, [myName]);

  // ── Bubbles + emotes ────────────────────────────────────────────────────────
  const sendBubble = useCallback((e) => {
    e?.preventDefault();
    const text = chatInput.trim().slice(0, 60);
    if (!text) return;
    if (containsProfanity(text)) { showToast("Let's keep it friendly!", 'error'); setChatInput(''); return; }
    const bubble = { text, at: Date.now() };
    setMyBubble(bubble);
    if (myPlayerRef.current) update(myPlayerRef.current, { bubble }).catch(() => {});
    setChatInput('');
  }, [chatInput, showToast]);

  const sendEmote = useCallback((e) => {
    const emote = { e, at: Date.now() };
    setMyEmote(emote);
    if (myPlayerRef.current) update(myPlayerRef.current, { emote }).catch(() => {});
  }, []);

  // ── Wildwood wallet (pack + camp chest — stored items count everywhere) ────
  const gold = () => Math.floor(Number(homesteadRef.current?.gold) || 0);
  const invCount = (id) => Math.floor(homesteadRef.current?.inv?.[id] || 0) + Math.floor(homesteadRef.current?.chest?.[id] || 0);
  const hasItems = (req) => Object.entries(req || {}).every(([id, q]) => invCount(id) >= q);
  const spendGold = (n) => { homesteadRef.current.gold = gold() - n; homesteadDirtyRef.current = true; };
  const spendItems = (req) => {
    const h = homesteadRef.current;
    if (!h.chest) h.chest = {};
    Object.entries(req).forEach(([id, q]) => {
      let need = q;
      const fromInv = Math.min(need, h.inv[id] || 0);
      if (fromInv > 0) {
        h.inv[id] -= fromInv;
        if (h.inv[id] <= 0) delete h.inv[id];
        need -= fromInv;
      }
      if (need > 0 && (h.chest[id] || 0) > 0) {
        h.chest[id] = Math.max(0, (h.chest[id] || 0) - need);
        if (h.chest[id] <= 0) delete h.chest[id];
      }
    });
    homesteadDirtyRef.current = true;
  };
  const fuelUnits = () => Object.entries(homesteadRef.current?.inv || {}).reduce((s, [id, q]) => s + (WW_ITEMS[id]?.burn || 0) * q, 0)
    + Object.entries(homesteadRef.current?.chest || {}).reduce((s, [id, q]) => s + (WW_ITEMS[id]?.burn || 0) * q, 0);
  const consumeFuel = (units) => {
    const woods = Object.keys(WW_ITEMS).filter((id) => WW_ITEMS[id]?.burn && invCount(id) > 0).sort((a, b) => WW_ITEMS[a].burn - WW_ITEMS[b].burn);
    let need = units;
    const spend = {};
    for (const id of woods) {
      if (need <= 0) break;
      const take = Math.min(invCount(id), Math.ceil(need / WW_ITEMS[id].burn));
      spend[id] = take;
      need -= take * WW_ITEMS[id].burn;
    }
    if (need > 0) return false;
    spendItems(spend);
    return true;
  };

  // ── Shop / build / place ────────────────────────────────────────────────────
  const acquire = (f) => {
    if (f.src.gold) {
      if (gold() < f.src.gold) { showToast('Not enough Wildwood gold!', 'error'); return; }
      spendGold(f.src.gold);
    } else if (f.src.craft) {
      if (!hasItems(f.src.craft)) { showToast('Missing materials — gather them in Wildwood!', 'error'); return; }
      spendItems(f.src.craft);
    } else if (f.src.found) {
      if (invCount(f.id) < 1) { showToast('Find one on a Wildwood expedition first!', 'error'); return; }
      spendItems({ [f.id]: 1 });
    }
    setGs((p) => ({ ...p, owned: { ...p.owned, [f.id]: (p.owned[f.id] || 0) + 1 } }));
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400);
    showToast(`${f.name} added to storage!`, 'success');
  };

  const buyTheme = (kind, t) => {
    const ownedKey = kind === 'wall' ? 'ownedWallpapers' : 'ownedFloors';
    const areaKey = kind === 'wall' ? 'wallpaper' : 'floor';
    const cur = gsRef.current;
    const apply = (p) => ({ ...p, areas: { ...p.areas, [areaId]: { ...p.areas[areaId], [areaKey]: t.id } } });
    if (!(cur[ownedKey] || []).includes(t.id)) {
      if (gold() < t.cost) { showToast('Not enough Wildwood gold!', 'error'); return; }
      spendGold(t.cost);
      setGs((p) => apply({ ...p, [ownedKey]: [...p[ownedKey], t.id] }));
      dirtyRef.current = true;
      setTimeout(() => persist(true), 400);
    } else {
      setGs(apply);
      dirtyRef.current = true;
    }
  };

  const buildArea = (a) => {
    if (!hasItems(a.cost)) { showToast('You need far more materials — check the list!', 'error'); return; }
    spendItems(a.cost);
    setGs((p) => ({
      ...p,
      built: [...p.built, a.id],
      areas: { ...p.areas, [a.id]: { wallpaper: 'cream', floor: 'oak', placed: [] } },
    }));
    setAreaId(a.id);
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400);
    showToast(`🏗️ ${a.name} built! A whole new space to furnish!`, 'success');
  };

  const placedCount = (itemId) => Object.values(gs.areas).reduce((n, a) => n + (a.placed || []).filter((p) => p.itemId === itemId).length, 0);
  const unplacedCount = (itemId) => (gs.owned[itemId] || 0) - placedCount(itemId);

  const roomClicked = (x, y) => {
    if (!editMode || !placingId) return;
    const item = FURNITURE_MAP[placingId];
    if (!item) return;
    const areaDef = AREA_MAP[areaId];
    if (item.zone === 'outdoor' && areaDef.type !== 'outdoor') { showToast('That belongs outdoors — build the Backyard!', 'error'); return; }
    if (item.zone === 'wall' && areaDef.type === 'outdoor') { showToast("Can't hang that on the sky!", 'error'); return; }
    const band = item.zone === 'wall' ? WALL_BAND : GROUND_BAND;
    if (y < band.top || y > band.bottom) { showToast(item.zone === 'wall' ? 'Place that on the wall (upper area)!' : 'Place that on the ground (lower area)!', 'error'); return; }
    if (unplacedCount(placingId) < 1) { setPlacingId(null); return; }
    setGs((p) => ({
      ...p,
      areas: { ...p.areas, [areaId]: { ...p.areas[areaId], placed: [...p.areas[areaId].placed, { id: newPlacedId(), itemId: placingId, x: clamp(x, 2, 98), y: clamp(y, 4, 96) }] } },
    }));
    dirtyRef.current = true;
    if (unplacedCount(placingId) <= 1) setPlacingId(null);
  };

  const itemClicked = (p, item) => {
    if (tab === 'room' && editMode) {
      setGs((prev) => {
        const nextFarms = { ...prev.farms };
        delete nextFarms[p.id]; // putting away a Garden Bed clears its crop
        return {
          ...prev,
          farms: nextFarms,
          areas: { ...prev.areas, [areaId]: { ...prev.areas[areaId], placed: prev.areas[areaId].placed.filter((x) => x.id !== p.id) } },
        };
      });
      dirtyRef.current = true;
      return;
    }
    if (item.interactive) {
      const ownerIsMe = currentOwnerId === myId;
      const ownerData = ownerIsMe ? null : (classmates || []).find((s) => s.id === currentOwnerId);
      setInteract({ type: item.interactive, placedId: p.id, ownerIsMe, ownerData });
    }
  };

  // ── Interactive: eat from fridge / cook on stove / spin wheel ──────────────
  const eatDish = (dishId) => {
    const r = WW_RECIPE_MAP[WW_ITEMS[dishId]?.recipeId];
    if (!r || invCount(dishId) < 1) return;
    const buffs = (homesteadRef.current.activeBuffs || []).filter((b) => b.until > Date.now());
    if (buffs.length >= MAX_ACTIVE_BUFFS) { showToast(`You're full! (max ${MAX_ACTIVE_BUFFS} active meals)`, 'error'); return; }
    spendItems({ [dishId]: 1 });
    homesteadRef.current.activeBuffs = [...buffs, { recipeId: r.id, type: r.buff.type, value: r.buff.value, until: Date.now() + r.buff.minutes * 60 * 1000 }];
    persist(true);
    showToast(`Delicious! +${r.buff.value}% ${BUFF_LABELS[r.buff.type].name} for ${r.buff.minutes} min (works in Wildwood too!)`, 'success');
    forceTick((n) => n + 1);
  };

  const myKitchenTier = () => {
    const crafted = homesteadRef.current?.crafted || [];
    return crafted.includes('kitchen') ? 2 : crafted.includes('stove') ? 1 : 0;
  };
  const recipeKnownHere = (r) => {
    const h = homesteadRef.current || {};
    return (h.knownRecipes || []).includes(r.id) || r.start || (r.cookLevel && wwSkillLevel(h.skills?.cook || 0) >= r.cookLevel);
  };
  const cookHere = (r) => {
    if (!recipeKnownHere(r)) return;
    if (r.cauldron) { showToast('Brews need the Witch Cauldron in Wildwood!', 'error'); return; }
    if (myKitchenTier() < r.tier) { showToast(`Needs a ${KITCHEN_TIERS[r.tier].name} (upgrade in Wildwood)!`, 'error'); return; }
    if (!hasItems(r.ing)) { showToast('Missing ingredients!', 'error'); return; }
    if (!consumeFuel(r.fuel)) { showToast('Not enough wood fuel in your pack!', 'error'); return; }
    spendItems(r.ing);
    homesteadRef.current.inv[dishIdOf(r.id)] = (homesteadRef.current.inv[dishIdOf(r.id)] || 0) + 1;
    persist(true);
    showToast(`${r.name} cooked on your home stove!`, 'success');
    forceTick((n) => n + 1);
  };

  const spinWheel = () => {
    if (gsRef.current.wheelDay === dayStr()) { showToast('You already spun a wheel today — come back tomorrow!', 'info'); return; }
    const prize = WHEEL_PRIZES[Math.floor(Math.random() * WHEEL_PRIZES.length)];
    homesteadRef.current.gold = gold() + prize;
    setGs((p) => ({ ...p, wheelDay: dayStr() }));
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400);
    showToast(`🎡 The wheel lands on… ${prize} GOLD!`, 'success');
    forceTick((n) => n + 1);
  };

  const setShowcase = (kind, value) => {
    setGs((p) => ({ ...p, showcase: { ...p.showcase, [kind]: value } }));
    dirtyRef.current = true;
  };

  // ── Backyard Garden Beds — real Wildwood farming at home ───────────────────
  const plantFarm = (placedId, seedId) => {
    const crop = CROP_BY_SEED[seedId];
    if (!crop || invCount(seedId) < 1) return;
    if (gsRef.current.farms?.[placedId]) return; // already growing
    spendItems({ [seedId]: 1 });
    setGs((p) => ({ ...p, farms: { ...p.farms, [placedId]: { seedId, readyAt: Date.now() + crop.growMin * 60 * 1000 } } }));
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400);
    showToast(`${WW_ITEMS[crop.cropId]?.name} planted! Ready in ${crop.growMin >= 60 ? `${Math.round(crop.growMin / 60)}h` : crop.growMin >= 1 ? `${crop.growMin} min` : `${Math.round(crop.growMin * 60)}s`}.`, 'success');
  };

  const harvestFarm = (placedId) => {
    const farm = gsRef.current.farms?.[placedId];
    const crop = farm && CROP_BY_SEED[farm.seedId];
    if (!crop || Date.now() < farm.readyAt) return;
    const golden = Math.random() < GOLDEN_CROP_CHANCE;
    const qty = crop.yield * (golden ? 2 : 1);
    const h = homesteadRef.current;
    h.inv[crop.cropId] = (h.inv[crop.cropId] || 0) + qty;
    homesteadDirtyRef.current = true;
    setGs((p) => { const nf = { ...p.farms }; delete nf[placedId]; return { ...p, farms: nf }; });
    dirtyRef.current = true;
    setTimeout(() => persist(true), 400);
    showToast(`${golden ? '✨ GOLDEN harvest! ' : ''}Harvested ${qty}× ${WW_ITEMS[crop.cropId]?.name} — sent to your Wildwood pack!`, 'success');
    forceTick((n) => n + 1);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const myProfile = useMemo(
    () => ({ ...roomProfileOf(null, studentData?.sweetEmpireData, studentData?.menagerieData), hangout: gs }),
    [gs, studentData]
  );
  const myScore = useMemo(() => styleScoreOf(gs), [gs]);
  const visitables = useMemo(
    () => (classmates || [])
      .filter((s) => s.id !== myId)
      .map((s) => ({ id: s.id, name: s.firstName || '?', data: s, score: styleScoreOf(s.hangoutData) }))
      .sort((a, b) => b.score - a.score),
    [classmates, myId]
  );
  const visitProfile = useMemo(() => {
    if (!visitId) return null;
    const v = (classmates || []).find((s) => s.id === visitId);
    if (!v) return null;
    const roomData = liveRoom?.data || v.hangoutData; // live mirror wins over the page-load snapshot
    return { profile: roomProfileOf(roomData, v.sweetEmpireData, v.menagerieData), name: v.firstName || '?', data: v };
  }, [visitId, classmates, liveRoom]);
  const [visitAreaId, setVisitAreaId] = useState('main');
  useEffect(() => { setVisitAreaId('main'); }, [visitId]);

  const myInfo = { name: myName, avatarSrc: myAvatarSrc, bubble: myBubble, emote: myEmote };
  const musicPlayingHere = !!(roomMusic?.playing && MUSIC_MAP[roomMusic.trackId]);

  if (!loaded) {
    return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  const TABS = [
    { id: 'room', name: '🛋️ My Hangout' },
    { id: 'shop', name: '🛒 Furnish & Build' },
    { id: 'showcase', name: '🏆 Showcase' },
    { id: 'visit', name: '🚪 Visit Friends' },
  ];

  // Plain JSX (not a nested component) so the chat input never remounts/loses focus
  const roomChrome = (
    <div className="flex flex-wrap items-center gap-2">
      <form onSubmit={sendBubble} className="flex gap-1.5 flex-1 min-w-[220px]">
        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} maxLength={60}
          placeholder="Say something to the room…"
          className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-amber-400" />
        <button type="submit" className="bg-amber-500 text-white font-bold px-4 rounded-xl text-sm">Say</button>
      </form>
      {['😀', '❤️', '👍', '🎉', '😮'].map((e) => (
        <button key={e} onClick={() => sendEmote(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
      ))}
      <span className="text-xs text-gray-400 font-semibold hidden md:inline">{isTouchDevice ? 'Use the arrow pad to walk' : 'WASD / arrows to walk'} · {Object.keys(players).length || 1} here</span>
      {musicBlocked && (
        <button onClick={() => audioRef.current?.play().then(() => setMusicBlocked(false)).catch(() => {})}
          className="bg-purple-600 text-white text-xs font-bold rounded-xl px-3 py-2 animate-pulse">
          🎵 Tap to hear the music!
        </button>
      )}
      {musicPlayingHere && !musicBlocked && (
        <span className="text-xs font-bold text-purple-600">🎵 {MUSIC_MAP[roomMusic.trackId]?.name}</span>
      )}

      {/* Touch d-pad — floats over the room on any touch-capable device */}
      {isTouchDevice && (
        <div className="fixed bottom-24 right-4 z-40 grid grid-cols-3 grid-rows-3 gap-1.5 bg-white/40 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          <div />
          <DpadBtn label="▲" onDown={() => (keysRef.current.up = true)} onUp={() => (keysRef.current.up = false)} />
          <div />
          <DpadBtn label="◀" onDown={() => (keysRef.current.left = true)} onUp={() => (keysRef.current.left = false)} />
          <div />
          <DpadBtn label="▶" onDown={() => (keysRef.current.right = true)} onUp={() => (keysRef.current.right = false)} />
          <div />
          <DpadBtn label="▼" onDown={() => (keysRef.current.down = true)} onUp={() => (keysRef.current.down = false)} />
          <div />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 select-none">
      <audio ref={audioRef} />
      {/* Header */}
      <div className="rounded-2xl p-5 text-white shadow-lg bg-gradient-to-r from-amber-800 via-orange-800 to-rose-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold drop-shadow">🛋️ My Hangout</h1>
            <p className="text-white/85 text-sm">Build it, furnish it, fill it with music and friends.</p>
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
          <span className="bg-black/30 rounded-full px-3 py-1">🏗️ {gs.built.length}/{HANGOUT_AREAS.length} areas built</span>
        </div>
        {onSwitchGame && (
          <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-bold">
            <span className="text-white/50">Linked worlds:</span>
            <button onClick={() => onSwitchGame('sweet-empire')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Forge the weapon that hangs on your wall!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Loot/Weapons/1.png" alt="" className="w-4 h-4 object-contain" />
              Champion&apos;s Forge
            </button>
            <button onClick={() => onSwitchGame('champions-menagerie')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Raise the companion that wanders your room!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/shop/Egg/Egg.png" alt="" className="w-4 h-4 object-contain" />
              Champion&apos;s Menagerie
            </button>
            <button onClick={() => onSwitchGame('wildwood-homestead')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Earn the gold, materials and rare treasures that furnish this place!">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game icons/Wildwood/Camping/001-fire.svg" alt="" className="w-4 h-4 object-contain" />
              Wildwood Homestead
            </button>
            <button onClick={() => onSwitchGame('town-square')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/30 border border-white/25 rounded-full px-3 py-1 transition"
              title="Meet the whole class in the plaza!">
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
          <button key={t.id} onClick={() => { setTab(t.id); setPlacingId(null); setEditMode(false); setVisitId(null); }}
            className={`px-3.5 py-2 rounded-xl text-sm font-bold transition ${tab === t.id ? 'bg-amber-700 text-white shadow' : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50'}`}>
            {t.name}
          </button>
        ))}
      </div>

      {/* ══ MY ROOM ══ */}
      {tab === 'room' && (
        <div className="space-y-3">
          {/* Area tabs + edit toggle */}
          <div className="flex flex-wrap items-center gap-1.5">
            {gs.built.map((id) => (
              <button key={id} onClick={() => { setAreaId(id); setPlacingId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${areaId === id ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-amber-50'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={AREA_MAP[id].icon} alt="" className="w-4 h-4 object-contain" /> {AREA_MAP[id].name}
              </button>
            ))}
            <div className="flex-1" />
            <button onClick={() => { setEditMode((m) => !m); setPlacingId(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${editMode ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {editMode ? '✅ Done decorating' : '🔧 Decorate'}
            </button>
          </div>

          <RoomView
            profile={myProfile}
            areaId={areaId}
            ownerName={myName}
            editMode={editMode}
            placingZone={editMode && placingId ? (FURNITURE_MAP[placingId]?.zone === 'wall' ? 'wall' : 'ground') : null}
            players={players}
            myId={myId}
            myPosDivRef={myPosDivRef}
            myPosRef={myPosRef}
            myInfo={myInfo}
            onRoomClick={roomClicked}
            onItemClick={itemClicked}
            musicPlaying={musicPlayingHere}
          />
          {roomChrome}

          {editMode && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-gray-800">📦 Storage — tap an item, then tap anywhere in its zone</h3>
                {placingId && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 animate-pulse">
                    Placing {FURNITURE_MAP[placingId]?.name} ({FURNITURE_MAP[placingId]?.zone})
                    <button onClick={() => setPlacingId(null)} className="underline ml-1.5">cancel</button>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(gs.owned).filter((id) => unplacedCount(id) > 0).map((id) => {
                  const f = FURNITURE_MAP[id];
                  return f && (
                    <button key={id} onClick={() => setPlacingId(placingId === id ? null : id)}
                      className={`flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-xs font-bold transition ${placingId === id ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.img} alt="" className="w-7 h-7 object-contain" style={f.tint ? { filter: f.tint } : undefined} />
                      {f.name} ×{unplacedCount(id)}
                    </button>
                  );
                })}
                {Object.keys(gs.owned).filter((id) => unplacedCount(id) > 0).length === 0 && (
                  <p className="text-sm text-gray-400 italic">Storage is empty — hit the Furnish &amp; Build tab!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ FURNISH & BUILD ══ */}
      {tab === 'shop' && (
        <div className="space-y-3">
          {/* Area expansions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-1">🏗️ Build New Areas <span className="text-xs text-gray-400 font-normal">— massive projects for serious builders</span></h3>
            <div className="grid sm:grid-cols-2 gap-2.5 mt-2">
              {HANGOUT_AREAS.filter((a) => !a.builtIn).map((a) => {
                const built = gs.built.includes(a.id);
                return (
                  <div key={a.id} className={`rounded-xl border-2 p-3 ${built ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200'}`}>
                    <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.icon} alt="" className="w-7 h-7 object-contain" /> {a.name} {built && <span className="text-emerald-600 text-xs">BUILT ✓</span>}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{a.desc} · +{a.style} style</p>
                    {!built && (
                      <>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                          {Object.entries(a.cost).map(([id, q]) => (
                            <span key={id} className={`flex items-center gap-0.5 text-[11px] font-bold ${invCount(id) >= q ? 'text-gray-600' : 'text-red-400'}`} title={WW_ITEMS[id]?.name}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {q}<img src={WW_ITEMS[id]?.img} alt="" className="w-4 h-4 inline" style={WW_ITEMS[id]?.tint ? { filter: WW_ITEMS[id].tint } : undefined} />
                            </span>
                          ))}
                        </div>
                        <button onClick={() => buildArea(a)} disabled={!hasItems(a.cost)}
                          className="w-full mt-2 text-xs font-bold bg-amber-700 text-white rounded-lg py-1.5 hover:bg-amber-600 disabled:opacity-40 transition">
                          Build {a.name}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Themes (current area) */}
          {AREA_MAP[areaId]?.type === 'indoor' || AREA_MAP.main ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">🎨 Wallpaper &amp; Flooring <span className="text-xs text-gray-400 font-normal">(applies to the area open in My Hangout: {AREA_MAP[areaId]?.name})</span></h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[['wall', WALLPAPERS, gs.ownedWallpapers], ['floor', FLOORS, gs.ownedFloors]].map(([kind, list, ownedList]) => (
                  <div key={kind}>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">{kind === 'wall' ? 'Wallpapers' : 'Floors'}</p>
                    <div className="flex flex-wrap gap-2">
                      {list.map((t) => {
                        const ownedIt = ownedList.includes(t.id);
                        const active = (gs.areas[areaId] || gs.areas.main)[kind === 'wall' ? 'wallpaper' : 'floor'] === t.id;
                        return (
                          <button key={t.id} onClick={() => buyTheme(kind, t)}
                            className={`rounded-xl border-2 p-1.5 transition ${active ? 'border-amber-500 shadow' : 'border-gray-200 hover:border-amber-300'}`}
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
          ) : null}

          {/* Catalog filter */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-400 uppercase mr-1">Show:</span>
            {[['all', 'Everything'], ['floor', '🛋️ Indoor'], ['wall', '🖼️ Wall'], ['outdoor', '🌳 Outdoor'], ['interactive', '⚡ Interactive']].map(([fid, flabel]) => (
              <button key={fid} onClick={() => setShopFilter(fid)}
                className={`text-xs font-bold rounded-full px-3 py-1.5 border-2 transition ${shopFilter === fid ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}>
                {flabel}
              </button>
            ))}
          </div>

          {/* Catalog */}
          {[['gold', '🛒 Buy with Wildwood Gold'], ['craft', '🔨 Craft from Wildwood Resources'], ['found', '🗺️ Rare Expedition Treasures']].map(([srcKind, label]) => (
            <div key={srcKind} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-2">{label}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {FURNITURE.filter((f) => (srcKind === 'gold' ? !!f.src.gold : srcKind === 'craft' ? !!f.src.craft : !!f.src.found))
                  .filter((f) => shopFilter === 'all' || (shopFilter === 'interactive' ? !!f.interactive : f.zone === shopFilter))
                  .map((f) => {
                  const affordable = f.src.gold ? gold() >= f.src.gold : f.src.craft ? hasItems(f.src.craft) : invCount(f.id) > 0;
                  return (
                    <div key={f.id} className={`rounded-xl border p-2.5 text-center ${f.src.found ? 'border-purple-200 bg-purple-50/40' : 'border-gray-200'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={f.img} alt="" className="w-12 h-12 mx-auto object-contain" style={f.tint ? { filter: f.tint } : undefined} />
                      <p className="text-xs font-bold text-gray-700 mt-1 truncate">{f.name} {f.interactive && '⚡'}</p>
                      <p className="text-[9px] text-gray-400">{f.zone} · +{f.style} style{(gs.owned[f.id] || 0) > 0 ? ` · own ${gs.owned[f.id]}` : ''}</p>
                      {f.hint && <p className="text-[9px] text-purple-500 font-semibold leading-tight mt-0.5">{f.hint}</p>}
                      <p className="text-[10px] font-bold text-gray-600 mt-0.5 flex items-center justify-center gap-1 flex-wrap">
                        {f.src.gold && <>{f.src.gold} gold</>}
                        {f.src.craft && Object.entries(f.src.craft).map(([id, q]) => (
                          <span key={id} className={`flex items-center gap-0.5 ${invCount(id) >= q ? '' : 'text-red-400'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {q}<img src={WW_ITEMS[id]?.img} alt="" className="w-3.5 h-3.5 inline" style={WW_ITEMS[id]?.tint ? { filter: WW_ITEMS[id].tint } : undefined} />
                          </span>
                        ))}
                        {f.src.found && <span className={invCount(f.id) > 0 ? 'text-purple-600' : 'text-gray-400'}>{invCount(f.id) > 0 ? '1 in your pack!' : 'not found yet'}</span>}
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
            <p className="text-xs text-gray-500">Your Forge weapon and Menagerie companion appear automatically. Pick the rest:</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Display in:</span>
              {[['main', '🛋️ Main Room'], ['trophy', '🏆 Trophy Room']].map(([rid, rlabel]) => (
                <button key={rid}
                  onClick={() => { setGs((p) => ({ ...p, showcaseRoom: rid })); dirtyRef.current = true; }}
                  className={`text-xs font-bold rounded-full px-3 py-1.5 border-2 transition ${(gs.showcaseRoom || 'main') === rid ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}>
                  {rlabel}
                </button>
              ))}
            </div>
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
          {visitId && visitProfile ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button onClick={() => setVisitId(null)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-amber-50 transition">← Back to directory</button>
                <div className="flex gap-1.5">
                  {(visitProfile.profile.hangout.built || ['main']).map((id) => (
                    <button key={id} onClick={() => setVisitAreaId(id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${visitAreaId === id ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      {AREA_MAP[id]?.name}
                    </button>
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-700">✨ {visitProfile ? styleScoreOf(visitProfile.profile.hangout) : 0} Style</span>
              </div>
              <RoomView
                profile={visitProfile.profile}
                areaId={visitProfile.profile.hangout.built.includes(visitAreaId) ? visitAreaId : 'main'}
                ownerName={visitProfile.name}
                players={players}
                myId={myId}
                myPosDivRef={myPosDivRef}
                myPosRef={myPosRef}
                myInfo={myInfo}
                onItemClick={itemClicked}
                musicPlaying={musicPlayingHere}
              />
              {roomChrome}
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-800 mb-1">🚪 Class Hangout Directory</h3>
              <p className="text-xs text-gray-500 mb-3">Walk around inside, chat, listen to their radio, spin their wheel!</p>
              <div className="divide-y divide-gray-50">
                {visitables.map((v, i) => (
                  <button key={v.id} onClick={() => setVisitId(v.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-2 rounded-lg text-left hover:bg-amber-50 transition">
                    <span className="w-8 text-center font-bold text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <p className="flex-1 font-semibold text-gray-800 text-sm truncate">{v.name}&apos;s Hangout</p>
                    <span className="text-[10px] text-gray-400">{(migrate(v.data.hangoutData).built || []).length} areas</span>
                    <span className="font-bold text-amber-600 text-sm">✨ {v.score}</span>
                  </button>
                ))}
                {visitables.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No classmates found yet.</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ INTERACTIVE MODALS ══ */}
      {interact && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setInteract(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {interact.type === 'radio' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-1">📻 Wanderer Radio</h3>
                <p className="text-xs text-gray-500 text-center mb-3">Everyone in this hangout hears the same track — DJ responsibly!</p>
                <div className="space-y-1.5">
                  {MUSIC_TRACKS.map((t) => (
                    <button key={t.id} onClick={() => setRoomTrack(t.id)}
                      className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${roomMusic?.trackId === t.id && roomMusic?.playing ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' : 'bg-gray-50 text-gray-700 hover:bg-purple-50'}`}>
                      <span>{roomMusic?.trackId === t.id && roomMusic?.playing ? '🔊' : '▶️'}</span> {t.name}
                    </button>
                  ))}
                </div>
                {roomMusic?.playing && (
                  <button onClick={() => setRoomTrack(null)} className="w-full mt-3 bg-rose-100 text-rose-700 py-2 rounded-xl font-bold text-sm">⏹ Stop the music</button>
                )}
              </>
            )}

            {interact.type === 'fridge' && (() => {
              const pantryOwner = interact.ownerIsMe ? homesteadRef.current : interact.ownerData?.homesteadData;
              const foods = Object.entries(pantryOwner?.inv || {}).filter(([id]) => ['dish', 'crop', 'fish', 'meat', 'forage'].includes(WW_ITEMS[id]?.kind)).sort((a, b) => (WW_ITEMS[a[0]].kind === 'dish' ? -1 : 1));
              return (
                <>
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🧊 {interact.ownerIsMe ? 'Your' : 'Their'} Pantry Fridge</h3>
                  <p className="text-xs text-gray-500 text-center mb-3">{interact.ownerIsMe ? 'Straight from your Wildwood pack — eat a dish for a real buff!' : 'A peek at their Wildwood pantry. Look, don’t touch!'}</p>
                  {foods.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Echoingly empty. Someone should go foraging…</p>}
                  <div className="grid grid-cols-2 gap-1.5">
                    {foods.map(([id, q]) => (
                      <div key={id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-2 py-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={WW_ITEMS[id]?.img} alt="" className="w-7 h-7 object-contain" style={WW_ITEMS[id]?.tint ? { filter: WW_ITEMS[id].tint } : undefined} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{WW_ITEMS[id]?.name}</p>
                          <p className="text-[9px] text-gray-400">×{q}</p>
                        </div>
                        {interact.ownerIsMe && WW_ITEMS[id]?.kind === 'dish' && (
                          <button onClick={() => eatDish(id)} className="bg-emerald-600 text-white text-[10px] font-bold rounded-lg px-2 py-1">Eat</button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {interact.type === 'stove' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🍳 Home Stove</h3>
                {!interact.ownerIsMe ? (
                  <p className="text-sm text-gray-500 text-center py-6">Something smells amazing… but it&apos;s not your kitchen!</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 text-center mb-3">Cook real Wildwood recipes at home — kitchen tier {myKitchenTier() + 1} · fuel {fmtQty(fuelUnits())}</p>
                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {WW_RECIPES_LIST.filter((r) => !r.cauldron && recipeKnownHere(r)).map((r) => {
                        const ok = myKitchenTier() >= r.tier && hasItems(r.ing) && fuelUnits() >= r.fuel;
                        return (
                          <div key={r.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-2.5 py-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.img} alt="" className="w-7 h-7 object-contain" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-700 truncate">{r.name}</p>
                              <p className="text-[9px] text-gray-400 flex items-center gap-1 flex-wrap">
                                {Object.entries(r.ing).map(([id, q]) => (
                                  <span key={id} className={invCount(id) >= q ? '' : 'text-red-400 font-bold'}>{q}× {WW_ITEMS[id]?.name}</span>
                                ))}
                                <span>+{r.fuel} fuel</span>
                              </p>
                            </div>
                            <button onClick={() => cookHere(r)} disabled={!ok}
                              className="bg-orange-500 text-white text-[10px] font-bold rounded-lg px-2.5 py-1.5 disabled:opacity-40">Cook</button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {interact.type === 'games' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🕹️ Champions Arcade</h3>
                <p className="text-xs text-gray-500 text-center mb-3">Fire up any world, straight from the couch:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['sweet-empire', "⚔️ Champion's Forge"],
                    ['champions-menagerie', "🐣 Champion's Menagerie"],
                    ['wildwood-homestead', '🏕️ Wildwood Homestead'],
                    ['town-square', '🏘️ Town Square'],
                  ].map(([gid, label]) => (
                    <button key={gid} onClick={() => onSwitchGame?.(gid)} disabled={!onSwitchGame}
                      className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-3 text-sm font-bold disabled:opacity-40 transition">
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {interact.type === 'arcade' && (() => {
              const funGames = (arcadeGames || []).filter((g) => g.category === 'fun' && !WORLD_GAME_IDS.includes(g.id));
              return (
                <>
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🕹️ Arcade Cabinet</h3>
                  <p className="text-xs text-gray-500 text-center mb-3">Every fun game from the Game Center, one tap away:</p>
                  {funGames.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">The arcade only works from the student Game Center.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
                      {funGames.map((g) => (
                        <button key={g.id} onClick={() => onSwitchGame?.(g.id)} disabled={!onSwitchGame}
                          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-2.5 py-2 text-left disabled:opacity-40 transition">
                          {g.logo ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={g.logo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <span className="text-xl flex-shrink-0">{g.icon || '🎮'}</span>
                          )}
                          <span className="text-xs font-bold truncate">{g.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {interact.type === 'library' && (() => {
              const visitors = Object.entries(players).filter(([pid]) => pid !== myId);
              const lobbyGames = (arcadeGames || []).filter((g) => g.category === 'multiplayer' && !WORLD_GAME_IDS.includes(g.id));
              return (
                <>
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-1">📚 Game Bookshelf</h3>
                  {visitors.length > 0 ? (
                    <>
                      <p className="text-xs text-emerald-600 font-bold text-center mb-2">
                        🎉 {visitors.map(([, v]) => v?.name || '?').join(', ')} {visitors.length === 1 ? 'is' : 'are'} here — pick a game and you&apos;ll be matched instantly!
                      </p>
                      <div className="grid grid-cols-2 gap-1.5 mb-3">
                        {MINIGAMES.map((mg) => (
                          <button key={mg.id} onClick={() => startLibraryGame(mg.id)}
                            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl px-2.5 py-2 text-left transition">
                            {mg.iconImg ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={mg.iconImg} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
                            ) : (
                              <span className="text-xl flex-shrink-0">{mg.icon || '🎲'}</span>
                            )}
                            <span className="text-xs font-bold truncate">{mg.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gray-500 text-center mb-3">
                      The head-to-head games need a visitor — invite a classmate over and you&apos;ll be dropped into a match together the moment you pick one!
                    </p>
                  )}
                  {lobbyGames.length > 0 && (
                    <>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Big multiplayer games (open a lobby)</p>
                      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                        {lobbyGames.map((g) => (
                          <button key={g.id} onClick={() => onSwitchGame?.(g.id)} disabled={!onSwitchGame}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-2.5 py-2 text-left disabled:opacity-40 transition">
                            {g.logo ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={g.logo} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <span className="text-xl flex-shrink-0">{g.icon || '🎮'}</span>
                            )}
                            <span className="text-xs font-bold truncate">{g.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}

            {interact.type === 'farm' && (() => {
              const farmState = interact.ownerIsMe
                ? gs.farms?.[interact.placedId]
                : (visitProfile?.profile?.hangout?.farms || {})[interact.placedId];
              const crop = farmState && CROP_BY_SEED[farmState.seedId];
              const ready = farmState && Date.now() >= farmState.readyAt;
              const mySeeds = interact.ownerIsMe
                ? Object.keys({ ...(homesteadRef.current?.inv || {}), ...(homesteadRef.current?.chest || {}) })
                    .filter((id) => WW_ITEMS[id]?.kind === 'seed' && CROP_BY_SEED[id] && invCount(id) > 0)
                : [];
              return (
                <>
                  <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🌱 Garden Bed</h3>
                  {crop ? (
                    <div className="text-center py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ready ? WW_ITEMS[crop.cropId]?.img : '/game icons/Wildwood/Farm/003-sprout.svg'} alt=""
                        className="w-16 h-16 mx-auto object-contain mb-1"
                        style={ready && WW_ITEMS[crop.cropId]?.tint ? { filter: WW_ITEMS[crop.cropId].tint } : undefined} />
                      <p className="text-sm font-bold text-gray-700">{WW_ITEMS[crop.cropId]?.name}</p>
                      <p className={`text-xs font-bold ${ready ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {ready ? 'Ready to harvest!' : `Ready in ${Math.max(1, Math.ceil((farmState.readyAt - Date.now()) / 60000))} min`}
                      </p>
                      {interact.ownerIsMe && ready && (
                        <button onClick={() => { harvestFarm(interact.placedId); setInteract(null); }}
                          className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold transition">
                          🧺 Harvest (goes to your Wildwood pack)
                        </button>
                      )}
                      {!interact.ownerIsMe && <p className="text-[11px] text-gray-400 mt-2">Only the gardener can harvest this bed.</p>}
                    </div>
                  ) : !interact.ownerIsMe ? (
                    <p className="text-sm text-gray-500 text-center py-6">Freshly turned soil, waiting for seeds…</p>
                  ) : mySeeds.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No seeds in your pack or chest — buy or find some in Wildwood!</p>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500 text-center mb-3">Pick a seed from your Wildwood stores:</p>
                      <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto pr-1">
                        {mySeeds.map((sid) => {
                          const c = CROP_BY_SEED[sid];
                          return (
                            <button key={sid} onClick={() => { plantFarm(interact.placedId, sid); setInteract(null); }}
                              className="flex items-center gap-2 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-xl px-2.5 py-2 text-left transition">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={WW_ITEMS[c.cropId]?.img} alt="" className="w-7 h-7 object-contain"
                                style={WW_ITEMS[c.cropId]?.tint ? { filter: WW_ITEMS[c.cropId].tint } : undefined} />
                              <span className="min-w-0">
                                <span className="block text-xs font-semibold text-gray-700 truncate">{WW_ITEMS[sid]?.name}</span>
                                <span className="block text-[9px] text-gray-400">×{invCount(sid)} · {c.growMin >= 60 ? `${Math.round(c.growMin / 60)}h` : c.growMin >= 1 ? `${c.growMin}min` : `${Math.round(c.growMin * 60)}s`} · yields {c.yield}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              );
            })()}

            {interact.type === 'wheel' && (
              <>
                <h3 className="text-lg font-bold text-gray-800 text-center mb-1">🎡 Wheel of Fortune</h3>
                <p className="text-xs text-gray-500 text-center mb-4">One free spin a day, on ANY wheel in the class — prizes go to the spinner!</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={FURNITURE_MAP.lucky_wheel.img} alt="" className="w-24 h-24 mx-auto object-contain mb-3" />
                <button onClick={spinWheel} disabled={gs.wheelDay === dayStr()}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition">
                  {gs.wheelDay === dayStr() ? 'Come back tomorrow!' : '🎡 SPIN!'}
                </button>
              </>
            )}

            <button onClick={() => setInteract(null)} className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-xl font-bold text-sm">Close</button>
          </div>
        </div>
      )}

      {/* Live bookshelf minigame — auto-opens for BOTH players the moment a game starts */}
      {hgChallenge && (
        <ChallengeOverlay
          classCode={classCode}
          challengeId={hgChallenge.id}
          game={hgChallenge.game}
          myId={myId}
          myName={myName}
          opponentId={hgChallenge.from?.id === myId ? hgChallenge.to?.id : hgChallenge.from?.id}
          opponentName={hgChallenge.from?.id === myId ? hgChallenge.to?.name : hgChallenge.from?.name}
          isHost={hgChallenge.from?.id === myId}
          onClose={closeHgChallenge}
        />
      )}
    </div>
  );
};

export default MyHangoutGame;
