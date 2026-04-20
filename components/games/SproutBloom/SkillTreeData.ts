/**
 * SkillTreeData.ts
 *
 * Static definitions for every skill and attribute:
 * name, category, icon, how it levels, and its 5-tier unlock tree.
 *
 * Unlock effects marked [ACTIVE] are wired into gameplay.
 * Effects marked [STUB] are defined here and displayed in UI
 * but need the corresponding game system to be built first.
 */

import { SkillType, AttributeType } from './types';
import { skillXpForLevel } from './constants';

// ─── Unlock node ─────────────────────────────────────────────────────────────

export interface SkillUnlock {
  level: number;          // skill level required
  name: string;           // short unlock name
  description: string;    // what it does
  active: boolean;        // true = wired into game; false = stub (UI only)
}

// ─── Skill definition ─────────────────────────────────────────────────────────

export type SkillCategory = 'survival' | 'building' | 'exploration';

export interface SkillDef {
  id: SkillType;
  emoji: string;
  name: string;
  category: SkillCategory;
  leveledBy: string;
  color: string;        // Tailwind bg class for accents
  textColor: string;    // Tailwind text class
  borderColor: string;  // Tailwind border class
  unlocks: SkillUnlock[];
}

// ─── Attribute definition ─────────────────────────────────────────────────────

export interface AttributeDef {
  id: AttributeType | 'strength'; // strength uses skills.strength XP
  emoji: string;
  name: string;
  leveledBy: string;
  description: string;
  unlocks: { level: number; name: string; description: string }[];
}

// ─── 10 Skill Definitions ─────────────────────────────────────────────────────

export const SKILL_DEFS: SkillDef[] = [

  // ── SURVIVAL ──────────────────────────────────────────────────────────────

  {
    id: 'foraging',
    emoji: '🌱',
    name: 'Foraging',
    category: 'survival',
    leveledBy: 'Gathering mushrooms, berries and forest fruits',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300',
    unlocks: [
      { level: 2,  name: 'Keen Eye',       description: 'Forageable plants glow with a subtle outline as you walk past them.',    active: false },
      { level: 5,  name: 'Double Harvest',  description: '25% chance to gather double resources from any forage action.',          active: false },
      { level: 10, name: 'Rare Botanica',   description: 'Rare plants begin appearing in the forest — new ingredients unlocked.',  active: false },
      { level: 15, name: 'Auto-Collect',    description: 'Small resources (berries, mushrooms) collected automatically while walking in the forest.', active: false },
      { level: 20, name: 'Master Forager',  description: 'Triple yield chance replaces double. Rare plants appear daily.',        active: false },
    ],
  },

  {
    id: 'fishing',
    emoji: '🎣',
    name: 'Fishing',
    category: 'survival',
    leveledBy: 'Catching fish at the pond',
    color: 'bg-blue-400',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    unlocks: [
      { level: 2,  name: 'Quick Bite',      description: 'Fish bite 25% faster — shorter wait time on all fishing spots.',        active: true  },
      { level: 5,  name: 'Big Fish',         description: 'Larger (higher-value) fish start appearing in your catch pool.',       active: false },
      { level: 10, name: 'Advanced Rods',    description: 'Unlock crafting recipe for the Silver Rod (boosts rare catch rate). Needs: Crafting system.', active: false },
      { level: 15, name: 'Fishing Traps',    description: 'Place passive traps that catch fish while you do other things. Needs: Trap structure.', active: false },
      { level: 20, name: 'Legendary Catch',  description: 'Legendary fish can now spawn — massively valuable and extremely rare.', active: false },
    ],
  },

  {
    id: 'cooking',
    emoji: '🍳',
    name: 'Cooking',
    category: 'survival',
    leveledBy: 'Preparing meals at the stove',
    color: 'bg-orange-400',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-300',
    unlocks: [
      { level: 2,  name: 'Longer Lasting',   description: 'Cooked food provides its stamina bonus for 20% longer.',              active: false },
      { level: 5,  name: 'Stamina Boost',     description: 'All cooked meals grant +5 bonus stamina on top of their base value.', active: false },
      { level: 10, name: 'Complex Meals',     description: 'Multi-ingredient recipes unlocked — powerful dishes with stacking effects. Needs: Recipe system.', active: false },
      { level: 15, name: 'Community Feast',   description: 'Cook a Feast — bonus effects apply to all pets in the area.',        active: false },
      { level: 20, name: 'Grand Feast',       description: 'The Feast system unlocks massive multi-hour stamina and skill bonuses.', active: false },
    ],
  },

  {
    id: 'firecraft',
    emoji: '🔥',
    name: 'Firecraft',
    category: 'survival',
    leveledBy: 'Lighting and maintaining campfires (coming soon)',
    color: 'bg-red-400',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    unlocks: [
      { level: 2,  name: 'Longer Burn',      description: 'Fires last 50% longer before burning out.',                          active: false },
      { level: 5,  name: 'Rain Resistant',   description: 'Your fires no longer extinguish in rainy weather.',                  active: false },
      { level: 10, name: 'Wide Warmth',      description: 'The heat and light radius of fires doubles.',                        active: false },
      { level: 15, name: 'Fuel Saver',       description: 'Fires consume half as much wood fuel.',                             active: false },
      { level: 20, name: 'Eternal Flame',    description: 'Unlock Permanent Hearth — a placeable structure that never goes out.', active: false },
    ],
  },

  {
    id: 'gardening',
    emoji: '🌾',
    name: 'Farming',
    category: 'survival',
    leveledBy: 'Planting seeds, watering and harvesting crops',
    color: 'bg-lime-500',
    textColor: 'text-lime-700',
    borderColor: 'border-lime-300',
    unlocks: [
      { level: 2,  name: 'Rapid Growth',    description: 'Crops grow 20% faster.',                                              active: true  },
      { level: 5,  name: 'Bumper Crop',     description: '30% chance to harvest one extra unit from each mature plant.',        active: false },
      { level: 10, name: 'Exotic Seeds',    description: 'New seed varieties available in the market — higher value crops.',    active: false },
      { level: 15, name: 'Auto-Watering',   description: 'Unlock the Irrigation System structure — waters nearby patches daily. Needs: Structure.', active: false },
      { level: 20, name: 'Hybrid Harvest',  description: 'Rare hybrid crops can now grow — combining traits of two plants for massive value.', active: false },
    ],
  },

  // ── BUILDING & CRAFTING ───────────────────────────────────────────────────

  {
    id: 'crafting',
    emoji: '🔨',
    name: 'Crafting',
    category: 'building',
    leveledBy: 'Creating items at the crafting bench (coming soon)',
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    unlocks: [
      { level: 2,  name: 'Swift Hands',    description: 'Crafting takes 25% less time.',                                        active: false },
      { level: 5,  name: 'Reinforced',     description: 'Crafted tools and structures have 40% more durability.',               active: false },
      { level: 10, name: 'Master Recipes', description: 'Advanced crafting recipes unlock — fishing rods, traps, machines.',    active: false },
      { level: 15, name: 'Bulk Craft',     description: 'Craft up to 10 of an item in a single action.',                       active: false },
      { level: 20, name: 'Perfect Craft',  description: '15% chance any crafted item is "Perfect" — bonus stats on everything.', active: false },
    ],
  },

  {
    id: 'building',
    emoji: '🏗️',
    name: 'Building',
    category: 'building',
    leveledBy: 'Placing and arranging furniture and structures',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    unlocks: [
      { level: 2,  name: 'Quick Place',    description: 'Furniture placement animation is instant.',                            active: false },
      { level: 5,  name: 'Tough Walls',    description: 'All placed structures gain +30% durability rating.',                   active: false },
      { level: 10, name: 'Grand Designs',  description: 'House expansion costs reduced by 20%.',                               active: false },
      { level: 15, name: 'Decorative Arts',description: 'Unlock new decorative furniture items exclusive to high building skill.', active: false },
      { level: 20, name: 'Instant Build',  description: 'Small items (1×1 tiles) can be placed instantly with no cost.',       active: false },
    ],
  },

  {
    id: 'engineering',
    emoji: '⚙️',
    name: 'Engineering',
    category: 'building',
    leveledBy: 'Building machines and automated systems (coming soon)',
    color: 'bg-slate-500',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
    unlocks: [
      { level: 2,  name: 'Basic Machines', description: 'Unlock simple machines: water pump, seed dispenser.',                  active: false },
      { level: 5,  name: 'Auto-Harvest',   description: 'Build an auto-harvester that collects ripe crops once per day.',      active: false },
      { level: 10, name: 'Power Grid',     description: 'Connect machines to a power source — expands automation range.',      active: false },
      { level: 15, name: 'Smart Systems',  description: 'Add timers and trigger conditions to machines.',                      active: false },
      { level: 20, name: 'Full Automation',description: 'Your homestead can run itself — all core tasks automated.',           active: false },
    ],
  },

  // ── EXPLORATION ───────────────────────────────────────────────────────────

  {
    id: 'navigation',
    emoji: '🧭',
    name: 'Navigation',
    category: 'exploration',
    leveledBy: 'Visiting new areas and exploring the map',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-300',
    unlocks: [
      { level: 2,  name: 'Map Reveal',    description: 'The world map shows more detail for areas you\'ve visited.',           active: true  },
      { level: 5,  name: 'Swift Feet',    description: 'Movement speed increases by 15%.',                                     active: false },
      { level: 10, name: 'Waypoints',     description: 'Set up to 3 custom waypoints on the map for quick reference.',        active: false },
      { level: 15, name: 'Fast Travel',   description: 'Teleport instantly to any visited area from the map screen.',          active: false },
      { level: 20, name: 'Omniscient',    description: 'All resource locations in visited areas are permanently revealed.',    active: false },
    ],
  },

  {
    id: 'weatherResistance',
    emoji: '🌦️',
    name: 'Weather Resist.',
    category: 'exploration',
    leveledBy: 'Surviving rainy and stormy weather conditions',
    color: 'bg-indigo-400',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-300',
    unlocks: [
      { level: 2,  name: 'Tough Skin',      description: 'Stamina penalties from bad weather are reduced by 30%.',             active: false },
      { level: 5,  name: 'Steady Pace',     description: 'Hunger and thirst drain 20% slower in harsh weather.',               active: false },
      { level: 10, name: 'Storm Proof',     description: 'Mild weather (cloudy, light rain) has zero negative effects on you.', active: false },
      { level: 15, name: 'Elements Master', description: 'Extreme weather (storms) no longer affects your stamina or hunger.', active: false },
      { level: 20, name: 'Weather Boon',    description: 'Rain now boosts crop growth speed. Storms give you bonus XP.',       active: false },
    ],
  },
];

// ─── 5 Attribute Definitions ─────────────────────────────────────────────────

export const ATTRIBUTE_DEFS: AttributeDef[] = [
  {
    id: 'strength',
    emoji: '💪',
    name: 'Strength',
    leveledBy: 'Chopping wood, physical work and hunting',
    description: 'Raw physical power. Increases carry capacity and chopping efficiency.',
    unlocks: [
      { level: 2,  name: 'Pack Mule I',    description: 'Inventory slots increased by 5.' },
      { level: 5,  name: 'Pack Mule II',   description: 'Inventory slots increased by another 5.' },
      { level: 10, name: 'Lumberjack',     description: 'Trees yield +1 wood per chop.' },
      { level: 15, name: 'Heavy Load',     description: 'Carry up to 3× more in exploration rations.' },
      { level: 20, name: 'Herculean',      description: 'Chop twice as fast. Inventory capped at 40 slots.' },
    ],
  },
  {
    id: 'agility',
    emoji: '🏃',
    name: 'Agility',
    leveledBy: 'Moving between areas and exploring frequently',
    description: 'Speed and grace. Reduces stamina costs for movement-heavy tasks.',
    unlocks: [
      { level: 2,  name: 'Light Step',    description: 'Foraging stamina cost reduced by 1.' },
      { level: 5,  name: 'Fleet Footed',  description: 'Movement feels snappier. Exploration timer -10%.' },
      { level: 10, name: 'Nimble',        description: 'Fishing and foraging stamina costs halved.' },
      { level: 15, name: 'Sprint',        description: 'Fast-travel unlocked between inside and outside.' },
      { level: 20, name: 'Shadow Step',   description: 'Zero stamina drain from all movement actions.' },
    ],
  },
  {
    id: 'endurance',
    emoji: '❤️',
    name: 'Endurance',
    leveledBy: 'Surviving long periods — time spent in-game',
    description: 'Your body\'s resilience. Increases max stamina and slows drain rates.',
    unlocks: [
      { level: 2,  name: 'Iron Will',     description: 'Max stamina increases by 10.' },
      { level: 5,  name: 'Second Wind',   description: 'Stamina regenerates 10% faster while relaxing.' },
      { level: 10, name: 'Tough',         description: 'Max stamina increases by another 15.' },
      { level: 15, name: 'Unstoppable',   description: 'Stamina never drops below 5 from environmental effects.' },
      { level: 20, name: 'Titan',         description: 'Max stamina doubles. Stamina regen works even while active.' },
    ],
  },
  {
    id: 'intelligence',
    emoji: '🧠',
    name: 'Intelligence',
    leveledBy: 'Cooking complex meals and engineering',
    description: 'Mental sharpness. Boosts XP gains and unlocks advanced recipes.',
    unlocks: [
      { level: 2,  name: 'Quick Learner', description: 'All skill XP gains increased by 10%.' },
      { level: 5,  name: 'Resourceful',   description: 'Cooking failures (if added) never waste ingredients.' },
      { level: 10, name: 'Scholar',       description: 'All skill XP gains increased by 25% total.' },
      { level: 15, name: 'Polymath',      description: 'XP earned in any skill grants 5% to all other skills.' },
      { level: 20, name: 'Genius',        description: 'All XP gains doubled. Rare recipes appear in the shop.' },
    ],
  },
  {
    id: 'perception',
    emoji: '👁️',
    name: 'Perception',
    leveledBy: 'Foraging, fishing and discovering new resources',
    description: 'Awareness of your surroundings. Reveals hidden resources and rare finds.',
    unlocks: [
      { level: 2,  name: 'Sharp Eyes',    description: 'Forageable items have a subtle glow.' },
      { level: 5,  name: 'Tracker',       description: 'Deer positions are shown on the forest overlay.' },
      { level: 10, name: 'Resource Sense',description: 'Rare fishing spots are highlighted.' },
      { level: 15, name: 'Eagle Eye',     description: 'Rare drops from forage have +15% chance.' },
      { level: 20, name: 'All-Seeing',    description: 'All hidden resource locations are visible on the map.' },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Derive skill level from raw XP using the same curve as calculateLevel */
export const skillLevel = (xp: number) => Math.max(1, Math.floor(Math.sqrt(xp / 50)));

/** XP required to reach the next level from current */
export const xpToNextLevel = (xp: number) => {
  const lvl = skillLevel(xp);
  return skillXpForLevel(lvl + 1);
};

/** 0-1 progress fraction toward the next level */
export const levelProgress = (xp: number) => {
  const lvl = skillLevel(xp);
  const currentFloor = skillXpForLevel(lvl);
  const nextCeil = skillXpForLevel(lvl + 1);
  return (xp - currentFloor) / (nextCeil - currentFloor);
};

/** Which unlock tiers are achieved at a given XP */
export const unlockedTiers = (xp: number, unlocks: SkillUnlock[]) => {
  const lvl = skillLevel(xp);
  return unlocks.map(u => lvl >= u.level);
};
