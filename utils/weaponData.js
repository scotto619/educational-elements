// utils/weaponData.js - Shared weapon data for RPG experiences
// Centralizes the Clicker game weapon catalogue so other games (like Tower Defense Legends)
// can reference the exact same unlock requirements, power curves, and theming.

export const weaponDefinitions = [
  { id: '1', name: 'Novice Blade', icon: '⚔️', path: '/Loot/Weapons/1.png', requirement: null, dpcMultiplier: 1, rarity: 'common' },
  { id: '2', name: 'Mystic Staff', icon: '🔮', path: '/Loot/Weapons/2.png', requirement: { type: 'totalGold', value: 1000 }, dpcMultiplier: 1.5, rarity: 'common' },
  { id: '3', name: 'Frost Axe', icon: '🪓', path: '/Loot/Weapons/3.png', requirement: { type: 'totalGold', value: 5000 }, dpcMultiplier: 2, rarity: 'common' },
  { id: '4', name: 'Shadow Daggers', icon: '🗡️', path: '/Loot/Weapons/4.png', requirement: { type: 'totalGold', value: 25000 }, dpcMultiplier: 3, rarity: 'uncommon' },
  { id: '5', name: 'Elven Bow', icon: '🏹', path: '/Loot/Weapons/5.png', requirement: { type: 'attacks', value: 1000 }, dpcMultiplier: 4, rarity: 'uncommon' },
  { id: '6', name: 'Orcish Cleaver', icon: '⚔️', path: '/Loot/Weapons/6.png', requirement: { type: 'artifacts', value: 50 }, dpcMultiplier: 6, rarity: 'uncommon' },
  { id: '7', name: 'Divine Hammer', icon: '🔨', path: '/Loot/Weapons/7.png', requirement: { type: 'totalGold', value: 100000 }, dpcMultiplier: 8, rarity: 'rare' },
  { id: '8', name: 'Nature\'s Whip', icon: '🌿', path: '/Loot/Weapons/8.png', requirement: { type: 'upgrades', value: 3 }, dpcMultiplier: 12, rarity: 'rare' },
  { id: '9', name: 'Celestial Orb', icon: '✨', path: '/Loot/Weapons/9.png', requirement: { type: 'totalGold', value: 1000000 }, dpcMultiplier: 20, rarity: 'epic' },
  { id: '10', name: 'Heart Mace', icon: '❤️', path: '/Loot/Weapons/10.png', requirement: { type: 'dps', value: 100000 }, dpcMultiplier: 30, rarity: 'epic' },
  { id: '11', name: 'Mechanical Gauntlet', icon: '🤖', path: '/Loot/Weapons/11.png', requirement: { type: 'totalGold', value: 10000000 }, dpcMultiplier: 50, rarity: 'epic' },
  { id: '12', name: 'Golden Hammer', icon: '🌹', path: '/Loot/Weapons/12.png', requirement: { type: 'prestige', value: 1 }, dpcMultiplier: 100, rarity: 'legendary' },
  { id: '13', name: 'Electro Staff', icon: '⚡', path: '/Loot/Weapons/13.png', requirement: { type: 'totalGold', value: 100000000 }, dpcMultiplier: 200, rarity: 'legendary' },
  { id: '14', name: 'Void Staff', icon: '🌌', path: '/Loot/Weapons/14.png', requirement: { type: 'prestige', value: 2 }, dpcMultiplier: 1500, rarity: 'mythic' },
  { id: '15', name: 'Elemental Trident', icon: '🔱', path: '/Loot/Weapons/15.png', requirement: { type: 'totalGold', value: 1000000000 }, dpcMultiplier: 1000, rarity: 'mythic' },
  { id: '16', name: 'Soul Reaper', icon: '💀', path: '/Loot/Weapons/16.png', requirement: { type: 'prestige', value: 5 }, dpcMultiplier: 2500, rarity: 'mythic' },
  { id: '17', name: 'Cosmic Blades', icon: '🌟', path: '/Loot/Weapons/17.png', requirement: { type: 'prestige', value: 10 }, dpcMultiplier: 10000, rarity: 'ultimate' },
  { id: '18', name: 'Genesis Sword', icon: '💫', path: '/Loot/Weapons/18.png', requirement: { type: 'prestige', value: 15 }, dpcMultiplier: 25000, rarity: 'ultimate' },
  { id: '19', name: 'Reality Breaker', icon: '⚫', path: '/Loot/Weapons/19.png', requirement: { type: 'prestige', value: 20 }, dpcMultiplier: 50000, rarity: 'ultimate' },
  { id: '20', name: 'Infinity Edge', icon: '♾️', path: '/Loot/Weapons/20.png', requirement: { type: 'prestige', value: 25 }, dpcMultiplier: 100000, rarity: 'ultimate' },
  { id: '21', name: 'Omnislayer', icon: '🌠', path: '/Loot/Weapons/21.png', requirement: { type: 'masterLevel', value: 10 }, dpcMultiplier: 500000, rarity: 'transcendent' }
];

export const WEAPONS = weaponDefinitions.reduce((accumulator, weapon, index) => {
  accumulator[weapon.id] = {
    tier: index + 1,
    powerScore: weapon.dpcMultiplier,
    ...weapon
  };
  return accumulator;
}, {});

export const WEAPON_ORDER = weaponDefinitions.map((weapon) => weapon.id);

export const getWeaponById = (weaponId) => {
  if (!weaponId) return null;
  return WEAPONS[String(weaponId)] || null;
};

export const describeWeaponRequirement = (weapon) => {
  if (!weapon?.requirement) return 'Unlocked from the beginning';
  const { type, value } = weapon.requirement;
  switch (type) {
    case 'totalGold':
      return `Requires ${value.toLocaleString()} total gold earned`;
    case 'attacks':
      return `Requires ${value.toLocaleString()} total attacks`;
    case 'artifacts':
      return `Requires owning ${value} artifacts`;
    case 'upgrades':
      return `Requires purchasing ${value} upgrades`;
    case 'dps':
      return `Requires ${value.toLocaleString()} DPS`;
    case 'prestige':
      return `Requires Prestige level ${value}`;
    case 'masterLevel':
      return `Requires Master Level ${value}`;
    default:
      return 'Special unlock condition';
  }
};

export const listWeaponOptions = () => weaponDefinitions.map((weapon) => ({
  ...weapon,
  tier: WEAPONS[weapon.id].tier,
  powerScore: WEAPONS[weapon.id].powerScore,
  requirementDescription: describeWeaponRequirement(weapon)
}));

export default WEAPONS;
