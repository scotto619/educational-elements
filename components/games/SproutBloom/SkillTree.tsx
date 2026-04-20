/**
 * SkillTree.tsx — Full-screen Character Skills & Attributes sheet
 */

import React, { useState } from 'react';
import { X, ChevronRight, Lock, CheckCircle2, Circle, Zap } from 'lucide-react';
import { GameState, SkillType, AttributeType } from './types';
import {
  SKILL_DEFS,
  ATTRIBUTE_DEFS,
  SkillDef,
  AttributeDef,
  SkillCategory,
  skillLevel,
  levelProgress,
  unlockedTiers,
} from './SkillTreeData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
}

/** Get raw XP for a skill from game state */
function getSkillXp(state: GameState, id: SkillType): number {
  return (state.skills as Record<string, number>)[id] ?? 0;
}

/** Get raw XP for an attribute from game state (strength reuses skills.strength) */
function getAttrXp(state: GameState, id: string): number {
  if (id === 'strength') return state.skills.strength ?? 0;
  return (state.attributes as Record<string, number>)[id] ?? 0;
}

// ─── Unlock Node row ─────────────────────────────────────────────────────────

interface UnlockRowProps {
  unlocks: SkillDef['unlocks'];
  xp: number;
  color: string;
  borderColor: string;
}

function UnlockRow({ unlocks, xp, color, borderColor }: UnlockRowProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const lvl = skillLevel(xp);
  const achieved = unlockedTiers(xp, unlocks);

  return (
    <div className="mt-3">
      {/* Node track */}
      <div className="flex items-center gap-0 relative">
        {unlocks.map((u, i) => {
          const done = achieved[i];
          const isNext = !done && (i === 0 || achieved[i - 1]);
          return (
            <React.Fragment key={u.level}>
              {/* Connecting line */}
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 ${achieved[i - 1] ? color : 'bg-gray-200'} transition-colors duration-300`}
                />
              )}
              {/* Node */}
              <div
                className="relative flex flex-col items-center cursor-help"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-200
                    ${done
                      ? `${color} border-transparent text-white shadow-md`
                      : isNext
                        ? `bg-white ${borderColor} text-gray-400 animate-pulse`
                        : 'bg-gray-100 border-gray-200 text-gray-300'
                    }`}
                >
                  {done ? <CheckCircle2 size={14} /> : isNext ? <Circle size={14} /> : <Lock size={11} />}
                </div>
                <span className={`text-[9px] mt-0.5 font-semibold ${done ? 'text-gray-600' : 'text-gray-400'}`}>
                  Lv{u.level}
                </span>

                {/* Tooltip */}
                {hovered === i && (
                  <div
                    className="absolute z-50 bottom-10 left-1/2 -translate-x-1/2 w-44 bg-gray-900 text-white text-xs rounded-xl p-2.5 shadow-2xl pointer-events-none"
                    style={{ whiteSpace: 'normal' }}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1">
                      {done ? <CheckCircle2 size={11} className="text-green-400" /> : <Lock size={11} className="text-gray-400" />}
                      {u.name}
                    </div>
                    <div className="text-gray-300 leading-tight">{u.description}</div>
                    {!u.active && (
                      <div className="mt-1.5 text-yellow-400 text-[9px] italic">⚙ Needs new game system</div>
                    )}
                    {/* Triangle */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Unlock names (abbreviated) */}
      <div className="flex justify-between mt-1 px-0">
        {unlocks.map((u, i) => (
          <div
            key={u.level}
            className={`text-[8px] text-center leading-tight flex-1 ${achieved[i] ? 'text-gray-600 font-semibold' : 'text-gray-400'}`}
            style={{ minWidth: 0 }}
          >
            {u.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Single Skill Card ────────────────────────────────────────────────────────

function SkillCard({ def, xp }: { def: SkillDef; xp: number }) {
  const lvl = skillLevel(xp);
  const progress = levelProgress(xp);
  const nextLvl = lvl + 1;

  return (
    <div className={`bg-white rounded-2xl border-2 ${def.borderColor} p-3.5 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{def.emoji}</span>
          <div>
            <div className="font-bold text-sm text-gray-800 leading-tight">{def.name}</div>
            <div className="text-[10px] text-gray-400 leading-tight">{def.leveledBy}</div>
          </div>
        </div>
        <div className={`${def.color} text-white text-xs font-bold rounded-full px-2.5 py-1 min-w-[2.5rem] text-center shadow-sm`}>
          Lv.{lvl}
        </div>
      </div>

      {/* XP Progress bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[9px] text-gray-400 mb-0.5">
          <span>{xp.toFixed(0)} XP</span>
          <span>→ Lv.{nextLvl}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${def.color} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(100, progress * 100).toFixed(1)}%` }}
          />
        </div>
      </div>

      {/* Unlock tree */}
      <UnlockRow
        unlocks={def.unlocks}
        xp={xp}
        color={def.color}
        borderColor={def.borderColor}
      />
    </div>
  );
}

// ─── Attribute Card ───────────────────────────────────────────────────────────

function AttributeCard({ def, xp }: { def: AttributeDef; xp: number }) {
  const lvl = skillLevel(xp);
  const progress = levelProgress(xp);
  const nextUnlock = def.unlocks.find(u => u.level > lvl);

  return (
    <div className="bg-white rounded-2xl border-2 border-purple-200 p-3 shadow-sm flex-1 min-w-[130px]">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{def.emoji}</span>
          <span className="font-bold text-sm text-gray-800">{def.name}</span>
        </div>
        <span className="bg-purple-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
          {lvl}
        </span>
      </div>

      <p className="text-[9px] text-gray-500 mb-2 leading-tight">{def.description}</p>

      {/* XP bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-purple-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, progress * 100).toFixed(1)}%` }}
        />
      </div>

      {/* Next unlock */}
      {nextUnlock ? (
        <div className="text-[9px] text-purple-600 font-medium flex items-start gap-1">
          <ChevronRight size={10} className="mt-0.5 shrink-0" />
          <span><strong>Lv.{nextUnlock.level}:</strong> {nextUnlock.name}</span>
        </div>
      ) : (
        <div className="text-[9px] text-green-600 font-bold flex items-center gap-1">
          <CheckCircle2 size={10} /> Fully Mastered!
        </div>
      )}
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

const CATEGORY_META: Record<SkillCategory, { label: string; emoji: string; bg: string }> = {
  survival:    { label: 'Survival Skills',       emoji: '🌿', bg: 'from-emerald-50 to-green-50' },
  building:    { label: 'Building & Crafting',   emoji: '🧰', bg: 'from-amber-50 to-yellow-50' },
  exploration: { label: 'Exploration',           emoji: '🌍', bg: 'from-blue-50 to-cyan-50' },
};

function CategorySection({ category, skills, state }: {
  category: SkillCategory;
  skills: SkillDef[];
  state: GameState;
}) {
  const meta = CATEGORY_META[category];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${meta.bg} p-4 border border-gray-100`}>
      <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
        <span>{meta.emoji}</span> {meta.label}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {skills.map(def => (
          <SkillCard key={def.id} def={def} xp={getSkillXp(state, def.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── Coming Soon notice ───────────────────────────────────────────────────────

function ComingSoonBanner() {
  return (
    <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4">
      <h3 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-2">
        <Zap size={14} /> Systems needed to fully unlock all skills
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-yellow-700">
        {[
          ['🔥', 'Campfire / Firecraft system', 'Firecraft skill'],
          ['🎣', 'Advanced rods & fishing traps', 'Fishing Lv 10 / 15'],
          ['🌾', 'Auto-watering irrigation', 'Farming Lv 15'],
          ['🔨', 'Crafting workbench & recipes', 'Crafting skill'],
          ['⚙️', 'Machines & automation', 'Engineering skill'],
          ['🧭', 'Waypoints & fast travel', 'Navigation Lv 10+'],
          ['🌦️', 'Weather penalties system', 'Weather Resist. effects'],
          ['✨', 'Buff / timed-effect system', 'Cooking Lv 5+'],
        ].map(([icon, name, skill]) => (
          <div key={name} className="bg-yellow-100 rounded-xl p-2">
            <div className="font-bold">{icon} {name}</div>
            <div className="text-yellow-500 mt-0.5">For: {skill}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface SkillTreeProps {
  state: GameState;
  onClose: () => void;
}

export default function SkillTree({ state, onClose }: SkillTreeProps) {
  const globalLevel = calculateLevel(state.xp);

  const byCategory = (cat: SkillCategory) => SKILL_DEFS.filter(s => s.category === cat);

  return (
    <div className="fixed inset-0 z-[9000] bg-cozy-bg overflow-y-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📖</span>
          <div>
            <h1 className="font-bold text-lg text-gray-800 leading-tight">Character Skills</h1>
            <p className="text-xs text-gray-400">Hover unlock nodes for details · active unlocks affect gameplay now</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-cozy-accent/20 text-cozy-text rounded-full px-4 py-1.5 text-sm font-bold">
            Player Lv. {globalLevel} · {state.xp} XP
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            aria-label="Close skill tree"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Skill categories */}
        <CategorySection category="survival"    skills={byCategory('survival')}    state={state} />
        <CategorySection category="building"    skills={byCategory('building')}    state={state} />
        <CategorySection category="exploration" skills={byCategory('exploration')} state={state} />

        {/* Core Attributes */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 p-4 border border-purple-100">
          <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <span>🧠</span> Core Attributes
            <span className="text-[10px] font-normal text-gray-400 ml-1">— level automatically through behaviour</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {ATTRIBUTE_DEFS.map(def => (
              <AttributeCard
                key={def.id}
                def={def}
                xp={getAttrXp(state, def.id)}
              />
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <ComingSoonBanner />

        <div className="pb-6" />
      </div>
    </div>
  );
}
