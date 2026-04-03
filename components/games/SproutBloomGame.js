// components/games/SproutBloomGame.js - Sprout & Bloom: Cozy Farm Sim
// Ported from TypeScript source, integrated with Firebase via updateStudentData
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins, Sun, Droplets, Scissors, MousePointer2, Zap, CloudRain, Cloud, Moon,
  Sparkles, Radio, Sprout, Wheat, Carrot, Leaf, Flower2, Citrus, Heart, Circle,
  ShoppingBag, Package, ClipboardList, CheckCircle2, Star, ArrowUpCircle,
  ChefHat, Utensils, Trash2
} from 'lucide-react';

// ─── Enums (as constants) ────────────────────────────────────────────────────
const CropType = {
  WHEAT: 'WHEAT', CARROT: 'CARROT', TOMATO: 'TOMATO',
  STRAWBERRY: 'STRAWBERRY', PUMPKIN: 'PUMPKIN', BLUEBERRY: 'BLUEBERRY',
  SUNFLOWER: 'SUNFLOWER',
};

const WeatherType = { SUNNY: 'SUNNY', RAINY: 'RAINY', CLOUDY: 'CLOUDY' };
const SprinklerType = { BASIC: 'BASIC', QUALITY: 'QUALITY' };

// ─── Constants ────────────────────────────────────────────────────────────────
const CROPS = {
  [CropType.WHEAT]:      { type: CropType.WHEAT,      name: 'Wheat',      growthStages: 3, growthTimePerStage: 5,  buyPrice: 2,  sellPrice: 5,   color: '#F5DEB3', minLevel: 1, xpGain: 10 },
  [CropType.CARROT]:     { type: CropType.CARROT,     name: 'Carrot',     growthStages: 3, growthTimePerStage: 8,  buyPrice: 5,  sellPrice: 12,  color: '#FF8C00', minLevel: 2, xpGain: 25 },
  [CropType.TOMATO]:     { type: CropType.TOMATO,     name: 'Tomato',     growthStages: 4, growthTimePerStage: 12, buyPrice: 10, sellPrice: 25,  color: '#FF6347', minLevel: 3, xpGain: 50 },
  [CropType.STRAWBERRY]: { type: CropType.STRAWBERRY, name: 'Strawberry', growthStages: 4, growthTimePerStage: 15, buyPrice: 15, sellPrice: 40,  color: '#FF2E63', minLevel: 4, xpGain: 80 },
  [CropType.PUMPKIN]:    { type: CropType.PUMPKIN,    name: 'Pumpkin',    growthStages: 4, growthTimePerStage: 20, buyPrice: 20, sellPrice: 55,  color: '#FF4500', minLevel: 5, xpGain: 120 },
  [CropType.BLUEBERRY]:  { type: CropType.BLUEBERRY,  name: 'Blueberry',  growthStages: 5, growthTimePerStage: 25, buyPrice: 30, sellPrice: 85,  color: '#4D80E4', minLevel: 6, xpGain: 200 },
  [CropType.SUNFLOWER]:  { type: CropType.SUNFLOWER,  name: 'Sunflower',  growthStages: 5, growthTimePerStage: 30, buyPrice: 40, sellPrice: 120, color: '#FFD700', minLevel: 8, xpGain: 300 },
};

const INITIAL_MONEY = 50;
const INITIAL_ENERGY = 100;
const PLOT_COUNT = 9;

const WATERING_CAN_UPGRADES = [
  { level: 1, cost: 0,   range: 1, name: 'Basic Can' },
  { level: 2, cost: 150, range: 3, name: 'Copper Can' },
  { level: 3, cost: 500, range: 9, name: 'Golden Can' },
];

const ENERGY_COSTS = { PLANT: 3, WATER: 5, HARVEST: 2, FERTILIZE: 4 };
const FERTILIZER_COST = 15;
const FERTILIZER_GROWTH_BOOST = 0.5;
const KITCHEN_COST = 250;

const SPRINKLERS = {
  [SprinklerType.BASIC]:   { name: 'Basic Sprinkler',   cost: 50,  range: 'cross',  color: '#90A4AE' },
  [SprinklerType.QUALITY]: { name: 'Quality Sprinkler', cost: 150, range: 'square', color: '#FFD54F' },
};

const RECIPES = [
  { id: 'bread', name: 'Wheat Bread',   energyRestore: 25, ingredients: { [CropType.WHEAT]: 2 } },
  { id: 'soup',  name: 'Veggie Soup',   energyRestore: 45, ingredients: { [CropType.CARROT]: 2, [CropType.TOMATO]: 1 } },
  { id: 'salad', name: 'Summer Salad',  energyRestore: 60, ingredients: { [CropType.TOMATO]: 2, [CropType.SUNFLOWER]: 1 } },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOrders = (level) => {
  const available = Object.values(CROPS).filter(c => c.minLevel <= level);
  return Array.from({ length: 3 }, () => {
    const crop = available[Math.floor(Math.random() * available.length)];
    const amount = Math.floor(Math.random() * 3) + 2;
    return {
      id: Math.random().toString(36).substr(2, 9),
      cropType: crop.type,
      amount,
      reward: Math.floor(crop.sellPrice * amount * 1.5),
      xpReward: Math.floor(crop.xpGain * amount * 2),
    };
  });
};

const buildInitialState = () => ({
  money: INITIAL_MONEY,
  energy: INITIAL_ENERGY,
  maxEnergy: INITIAL_ENERGY,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  inventory: {
    [CropType.WHEAT]: { seeds: 3, harvested: 0 },
    fertilizer: 2,
    food: {},
  },
  plots: Array.from({ length: PLOT_COUNT }, (_, i) => ({
    id: i, cropType: null, growthStage: 0,
    lastWatered: null, plantedAt: null, isWatered: false, isFertilized: false,
  })),
  sprinklers: {},
  day: 1,
  weather: WeatherType.SUNNY,
  selectedTool: null,
  upgrades: { wateringCanLevel: 1, hasKitchen: false },
  orders: generateOrders(1),
});

// ─── Sub-Components ───────────────────────────────────────────────────────────

const CropIcon = ({ type, stage, maxStages }) => {
  const progress = stage / maxStages;
  const size = 16 + progress * 24;
  const color = CROPS[type]?.color || '#999';
  if (stage === 0) return <Sprout size={16} className="text-green-600" />;
  const icons = {
    [CropType.WHEAT]: <Wheat size={size} style={{ color }} />,
    [CropType.CARROT]: <Carrot size={size} style={{ color }} />,
    [CropType.TOMATO]: <Leaf size={size} style={{ color }} />,
    [CropType.STRAWBERRY]: <Heart size={size} style={{ color }} />,
    [CropType.PUMPKIN]: <Citrus size={size} style={{ color }} />,
    [CropType.BLUEBERRY]: <Circle size={size} style={{ color }} />,
    [CropType.SUNFLOWER]: <Flower2 size={size} style={{ color }} />,
  };
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center justify-center">
      {icons[type] || <Sprout size={size} className="text-green-500" />}
    </motion.div>
  );
};

const FarmPlot = ({ plot, sprinkler, onInteract }) => {
  const isReady = plot.cropType && plot.growthStage >= CROPS[plot.cropType]?.growthStages;
  return (
    <motion.div
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
      onClick={() => onInteract(plot.id)}
      className={`relative w-full aspect-square rounded-xl cursor-pointer flex flex-col items-center justify-center overflow-hidden transition-colors duration-500
        ${plot.isWatered ? 'bg-[#5D4037]' : 'bg-[#8D6E63]'}
        border-4 ${isReady ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-[#4E342E]'}`}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:4px_4px]" />
      {sprinkler && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="p-1.5 rounded-full shadow-lg border-2 border-white/50" style={{ backgroundColor: SPRINKLERS[sprinkler]?.color }}>
            <Radio size={16} className="text-white" />
          </div>
        </div>
      )}
      {plot.isFertilized && (
        <motion.div animate={{ scale: [1,1.2,1], opacity: [0.5,1,0.5] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-2 left-2 pointer-events-none">
          <Sparkles size={14} className="text-purple-300" />
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {plot.cropType ? (
          <div className="flex flex-col items-center gap-1">
            <CropIcon type={plot.cropType} stage={plot.growthStage} maxStages={CROPS[plot.cropType]?.growthStages} />
            {isReady && (
              <motion.div initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-[10px] font-bold text-yellow-200 uppercase tracking-wider">Ready!</motion.div>
            )}
          </div>
        ) : (
          <div className="opacity-20"><Trash2 size={24} className="text-white" /></div>
        )}
      </AnimatePresence>
      {plot.isWatered && !isReady && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
          <Droplets size={16} className="text-blue-400 fill-blue-400" />
        </motion.div>
      )}
      {plot.cropType && !isReady && (
        <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <motion.div className="h-full bg-green-400" initial={{ width: 0 }}
            animate={{ width: `${(plot.growthStage / CROPS[plot.cropType]?.growthStages) * 100}%` }} />
        </div>
      )}
    </motion.div>
  );
};

const ToolButton = ({ active, onClick, icon, label, color }) => (
  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClick}
    className={`relative p-3 rounded-2xl flex flex-col items-center gap-1 transition-all
      ${active ? `${color} text-white shadow-lg scale-110 z-10` : 'bg-white text-gray-400 hover:bg-gray-50'}`}>
    {icon}
    <span className={`text-[10px] font-bold uppercase ${active ? 'text-white' : 'text-gray-400'}`}>{label}</span>
    {active && <motion.div layoutId="active-tool-sb" className="absolute -bottom-1 w-2 h-2 bg-white rounded-full" />}
  </motion.button>
);

const HUD = ({ money, day, energy, maxEnergy, level, xp, xpToNextLevel, weather, selectedTool, onSelectTool, onSleep }) => {
  const weatherIcon = () => {
    if (weather === WeatherType.RAINY) return <CloudRain className="text-blue-400" size={18} />;
    if (weather === WeatherType.CLOUDY) return <Cloud className="text-gray-400" size={18} />;
    return <Sun className="text-yellow-400" size={18} />;
  };
  return (
    <div className="sticky top-0 z-50 bg-[#E8F5E9]/95 backdrop-blur-sm border-b-4 border-green-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Money */}
        <div className="bg-white/90 px-4 py-2 rounded-full shadow border-2 border-yellow-100 flex items-center gap-2">
          <div className="bg-yellow-400 p-1.5 rounded-full"><Coins className="text-white" size={16} /></div>
          <span className="text-lg font-black text-gray-800">${money}</span>
        </div>
        {/* Day / Weather */}
        <div className="bg-white/90 px-4 py-2 rounded-full shadow border-2 border-blue-100 flex items-center gap-3">
          <div className="flex items-center gap-1"><Sun className="text-yellow-500" size={16} /><span className="font-black text-gray-700">Day {day}</span></div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1">{weatherIcon()}<span className="text-xs font-bold text-gray-500 uppercase">{weather}</span></div>
        </div>
        {/* Energy */}
        <div className="bg-white/90 px-3 py-2 rounded-2xl shadow border-2 border-orange-100 flex flex-col gap-1 min-w-[120px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1"><Zap size={12} className="text-orange-500 fill-orange-500" /><span className="text-[10px] font-bold text-gray-500 uppercase">Energy</span></div>
            <span className="text-[10px] font-bold text-gray-700">{energy}/{maxEnergy}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div className="h-full bg-orange-400" animate={{ width: `${(energy / maxEnergy) * 100}%` }} />
          </div>
        </div>
        {/* Level/XP */}
        <div className="bg-white/90 px-3 py-2 rounded-2xl shadow border-2 border-purple-100 flex flex-col gap-1 min-w-[120px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-purple-600 uppercase">Level {level}</span>
            <span className="text-[10px] font-bold text-gray-500">{xp}/{xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-purple-400" animate={{ width: `${(xp / xpToNextLevel) * 100}%` }} />
          </div>
        </div>
        {/* Sleep button */}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onSleep}
          className="ml-auto bg-indigo-600 text-white px-5 py-2 rounded-full shadow-xl font-bold flex items-center gap-2 border-b-4 border-indigo-800 hover:bg-indigo-500 transition-colors">
          <Moon size={16} /> End Day
        </motion.button>
      </div>
      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
        <ToolButton active={selectedTool === null} onClick={() => onSelectTool(null)} icon={<MousePointer2 size={20} />} label="Select" color="bg-gray-400" />
        <ToolButton active={selectedTool === 'WATER'} onClick={() => onSelectTool('WATER')} icon={<Droplets size={20} />} label="Water" color="bg-blue-500" />
        <ToolButton active={selectedTool === 'HARVEST'} onClick={() => onSelectTool('HARVEST')} icon={<Scissors size={20} />} label="Harvest" color="bg-orange-500" />
        <ToolButton active={selectedTool === 'FERTILIZER'} onClick={() => onSelectTool('FERTILIZER')} icon={<Sparkles size={20} />} label="Fertilize" color="bg-purple-500" />
        <ToolButton active={selectedTool === 'SPRINKLER'} onClick={() => onSelectTool('SPRINKLER')} icon={<Radio size={20} />} label="Sprinkler" color="bg-slate-500" />
      </div>
    </div>
  );
};

const getCropIcon = (type, size = 16) => {
  const icons = {
    [CropType.WHEAT]: <Wheat size={size} />,
    [CropType.CARROT]: <Carrot size={size} />,
    [CropType.TOMATO]: <Leaf size={size} />,
    [CropType.STRAWBERRY]: <Heart size={size} />,
    [CropType.PUMPKIN]: <Citrus size={size} />,
    [CropType.BLUEBERRY]: <Circle size={size} />,
    [CropType.SUNFLOWER]: <Flower2 size={size} />,
  };
  return icons[type] || null;
};

const Inventory = ({ inventory, onSell, onSelectSeed, selectedTool }) => (
  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-blue-100">
    <div className="flex items-center gap-2 mb-6"><Package className="text-blue-500" /><h2 className="text-2xl font-bold text-gray-800">Storage</h2></div>
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Seeds & Items</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.values(CropType).map((type) => {
            const count = inventory[type]?.seeds || 0;
            const isSelected = selectedTool === type;
            return (
              <motion.button key={`seed-${type}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSeed(type)}
                className={`relative aspect-square rounded-xl flex items-center justify-center transition-all
                  ${count > 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
                  ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}>
                <div style={{ color: CROPS[type]?.color }}>{getCropIcon(type, 20)}</div>
                {count > 0 && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{count}</span>}
              </motion.button>
            );
          })}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSelectSeed('FERTILIZER')}
            className={`relative aspect-square rounded-xl flex items-center justify-center transition-all
              ${inventory.fertilizer > 0 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
              ${selectedTool === 'FERTILIZER' ? 'ring-4 ring-purple-400 ring-offset-2' : ''}`}>
            <Sparkles className="text-purple-500" size={20} />
            {inventory.fertilizer > 0 && <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{inventory.fertilizer}</span>}
          </motion.button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Harvested</h3>
        <div className="space-y-2">
          {Object.values(CropType).map((type) => {
            const count = inventory[type]?.harvested || 0;
            if (count === 0) return null;
            return (
              <div key={`harvest-${type}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl border-2 border-orange-100">
                <div className="flex items-center gap-3">
                  <div style={{ color: CROPS[type]?.color }}>{getCropIcon(type, 18)}</div>
                  <span className="font-bold text-gray-700">{CROPS[type]?.name} x{count}</span>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onSell(type)}
                  className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-green-600 flex items-center gap-1">
                  <Coins size={12} /> Sell ${CROPS[type]?.sellPrice * count}
                </motion.button>
              </div>
            );
          })}
          {Object.values(CropType).every(t => !inventory[t]?.harvested) && (
            <p className="text-center py-4 text-gray-400 text-sm italic">Nothing harvested yet...</p>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Shop = ({ money, level, wateringCanLevel, hasKitchen, onBuy, onBuyFertilizer, onBuySprinkler, onBuyKitchen, onUpgradeCan }) => {
  const nextCanUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === wateringCanLevel + 1);
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-pink-100">
      <div className="flex items-center gap-2 mb-6"><ShoppingBag className="text-pink-500" /><h2 className="text-2xl font-bold text-gray-800">Seed Shop</h2></div>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Tools & Items</h3>
          {nextCanUpgrade && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onUpgradeCan} disabled={money < nextCanUpgrade.cost}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${money >= nextCanUpgrade.cost ? 'bg-white border-blue-200 hover:border-blue-400' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3"><ArrowUpCircle className="text-blue-500" /><div className="text-left"><div className="font-bold text-gray-800">{nextCanUpgrade.name}</div><div className="text-[10px] text-gray-500">Waters {nextCanUpgrade.range} plots</div></div></div>
              <div className="flex items-center gap-1 font-bold text-blue-600"><Coins size={14} />{nextCanUpgrade.cost}</div>
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBuyFertilizer} disabled={money < FERTILIZER_COST}
            className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${money >= FERTILIZER_COST ? 'bg-white border-purple-200 hover:border-purple-400' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
            <div className="flex items-center gap-3"><Sparkles className="text-purple-500" /><div className="text-left"><div className="font-bold text-gray-800">Growth Fertilizer</div><div className="text-[10px] text-gray-500">Crops grow 50% faster</div></div></div>
            <div className="flex items-center gap-1 font-bold text-purple-600"><Coins size={14} />{FERTILIZER_COST}</div>
          </motion.button>
          {!hasKitchen && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBuyKitchen} disabled={money < KITCHEN_COST}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${money >= KITCHEN_COST ? 'bg-white border-orange-200 hover:border-orange-400' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3"><ChefHat className="text-orange-500" /><div className="text-left"><div className="font-bold text-gray-800">Kitchen Upgrade</div><div className="text-[10px] text-gray-500">Cook meals for energy</div></div></div>
              <div className="flex items-center gap-1 font-bold text-orange-600"><Coins size={14} />{KITCHEN_COST}</div>
            </motion.button>
          )}
          {Object.entries(SPRINKLERS).map(([type, data]) => (
            <motion.button key={type} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onBuySprinkler(type)} disabled={money < data.cost}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${money >= data.cost ? 'bg-white border-slate-200 hover:border-slate-400' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3"><Radio className="text-slate-500" /><div className="text-left"><div className="font-bold text-gray-800">{data.name}</div><div className="text-[10px] text-gray-500">Waters {data.range} daily</div></div></div>
              <div className="flex items-center gap-1 font-bold text-slate-600"><Coins size={14} />{data.cost}</div>
            </motion.button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(CROPS).map((crop) => {
            const isLocked = level < crop.minLevel;
            const canAfford = money >= crop.buyPrice;
            return (
              <motion.button key={crop.type} whileHover={!isLocked ? { scale: 1.02 } : {}} whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => onBuy(crop.type)} disabled={isLocked || !canAfford}
                className={`relative flex items-center justify-between p-3 rounded-2xl border-2 transition-all overflow-hidden
                  ${isLocked ? 'border-gray-200 bg-gray-100 grayscale' : canAfford ? 'border-green-100 bg-green-50 hover:bg-green-100' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}>
                {isLocked && <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10"><span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">Level {crop.minLevel}</span></div>}
                <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: crop.color }}>{getCropIcon(crop.type, 16)}</div><div className="text-left"><div className="font-bold text-gray-800 text-sm">{crop.name}</div><div className="text-[10px] text-gray-500">+{crop.xpGain} XP</div></div></div>
                <div className="flex items-center gap-1 font-bold text-green-600 text-sm"><Coins size={14} />{crop.buyPrice}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Orders = ({ orders, inventory, onComplete }) => (
  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-purple-100">
    <div className="flex items-center gap-2 mb-6"><ClipboardList className="text-purple-500" /><h2 className="text-2xl font-bold text-gray-800">Daily Orders</h2></div>
    <div className="space-y-3">
      {orders.map((order) => {
        const currentAmount = inventory[order.cropType]?.harvested || 0;
        const isComplete = currentAmount >= order.amount;
        return (
          <motion.div key={order.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${isComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: CROPS[order.cropType]?.color }}>{getCropIcon(order.cropType, 16)}</div>
              <div><div className="text-sm font-bold text-gray-700">{order.amount}x {CROPS[order.cropType]?.name}</div>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="text-green-600 flex items-center gap-0.5"><Coins size={10} />${order.reward}</span>
                  <span className="text-purple-600 flex items-center gap-0.5"><Star size={10} />{order.xpReward} XP</span>
                </div>
              </div>
            </div>
            <motion.button whileHover={isComplete ? { scale: 1.1 } : {}} whileTap={isComplete ? { scale: 0.9 } : {}}
              disabled={!isComplete} onClick={() => onComplete(order.id)}
              className={`p-2 rounded-full transition-all ${isComplete ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <CheckCircle2 size={20} />
            </motion.button>
          </motion.div>
        );
      })}
      {orders.length === 0 && <div className="text-center py-4 text-gray-400 text-sm italic">No orders today. Check back tomorrow!</div>}
    </div>
  </div>
);

const Kitchen = ({ inventory, onCook, onEat }) => (
  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-orange-100">
    <div className="flex items-center gap-2 mb-6"><ChefHat className="text-orange-500" /><h2 className="text-2xl font-bold text-gray-800">Farm Kitchen</h2></div>
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Recipes</h3>
        <div className="space-y-3">
          {RECIPES.map((recipe) => {
            const canCook = Object.entries(recipe.ingredients).every(([type, amount]) => (inventory[type]?.harvested || 0) >= amount);
            return (
              <div key={recipe.id} className="p-3 bg-orange-50 rounded-2xl border-2 border-orange-100 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-800">{recipe.name}</span>
                  <div className="flex gap-2">
                    {Object.entries(recipe.ingredients).map(([type, amount]) => (
                      <div key={type} className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                        <div style={{ color: CROPS[type]?.color }}>{getCropIcon(type, 12)}</div>
                        {inventory[type]?.harvested || 0}/{amount}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-orange-600 font-bold text-xs"><Zap size={12} />+{recipe.energyRestore}</div>
                  <motion.button whileHover={canCook ? { scale: 1.05 } : {}} whileTap={canCook ? { scale: 0.95 } : {}} onClick={() => onCook(recipe)} disabled={!canCook}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${canCook ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>Cook</motion.button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Prepared Meals</h3>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(inventory.food || {}).map(([foodId, count]) => {
            if (!count) return null;
            const recipe = RECIPES.find(r => r.id === foodId);
            if (!recipe) return null;
            return (
              <div key={`prepared-${foodId}`} className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border-2 border-green-100">
                <span className="font-bold text-gray-700">{recipe.name} x{count}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onEat(foodId)}
                  className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-green-600">
                  Eat (+{recipe.energyRestore} ⚡)
                </motion.button>
              </div>
            );
          })}
          {(!inventory.food || Object.values(inventory.food).every(v => !v)) && (
            <div className="text-center py-4 text-gray-400 text-sm italic">No meals prepared...</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Game Component ───────────────────────────────────────────────────────
const SproutBloomGame = ({ studentData, updateStudentData, showToast }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const lastSaveRef = useRef(0);

  const [gameState, setGameState] = useState(buildInitialState);
  const [notification, setNotification] = useState(null);

  // ── Load from Firebase (or build fresh state) ──────────────────────────────
  useEffect(() => {
    if (isLoaded) return;
    try {
      const saved = studentData?.farmSimData;
      if (saved) {
        // Ensure orders exist (older saves may lack them)
        const restored = {
          ...buildInitialState(),
          ...saved,
          orders: Array.isArray(saved.orders) && saved.orders.length > 0 ? saved.orders : generateOrders(saved.level || 1),
        };
        setGameState(restored);
      }
    } catch (err) {
      console.error('Error loading farm sim data:', err);
    }
    setIsLoaded(true);
  }, [studentData, isLoaded]);

  // ── Save to Firebase (debounced – max once per 15s) ───────────────────────
  useEffect(() => {
    if (!isLoaded || !updateStudentData) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 15000) return; // debounce
    if (saveInProgress) return;

    const timer = setTimeout(async () => {
      if (saveInProgress) return;
      setSaveInProgress(true);
      try {
        await updateStudentData({ farmSimData: gameState });
        lastSaveRef.current = Date.now();
      } catch (err) {
        console.error('Error saving farm sim data:', err);
      } finally {
        setSaveInProgress(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isLoaded]);

  // ── Notification helper ───────────────────────────────────────────────────
  const notify = useCallback((msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2200);
  }, []);

  // ── XP helper ────────────────────────────────────────────────────────────
  const gainXP = useCallback((amount) => {
    setGameState(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;
      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.5);
        setTimeout(() => notify(`🌟 Level Up! You are now level ${newLevel}!`), 100);
      }
      return { ...prev, xp: newXP, level: newLevel, xpToNextLevel: newXPToNext };
    });
  }, [notify]);

  // ── Growth loop (every second) ────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        plots: prev.plots.map(plot => {
          if (!plot.cropType || !plot.isWatered) return plot;
          const crop = CROPS[plot.cropType];
          if (!crop || plot.growthStage >= crop.growthStages) return plot;
          const now = Date.now();
          const timeSincePlanted = (now - (plot.plantedAt || now)) / 1000;
          const growthSpeed = plot.isFertilized ? (1 + FERTILIZER_GROWTH_BOOST) : 1;
          const adjustedTimePerStage = crop.growthTimePerStage / growthSpeed;
          const expectedStage = Math.min(crop.growthStages, Math.floor(timeSincePlanted / adjustedTimePerStage));
          if (expectedStage > plot.growthStage) return { ...plot, growthStage: expectedStage, isWatered: false };
          return plot;
        })
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePassOut = useCallback(() => {
    const penalty = Math.floor(gameState.money * 0.1);
    setGameState(prev => ({ ...prev, money: Math.max(0, prev.money - penalty), day: prev.day + 1, energy: Math.floor(prev.maxEnergy * 0.5), weather: WeatherType.SUNNY, orders: generateOrders(prev.level) }));
    notify(`😵 You passed out! Lost $${penalty} and woke up late...`);
  }, [gameState.money, notify]);

  const handleSleep = useCallback(() => {
    const weathers = [WeatherType.SUNNY, WeatherType.SUNNY, WeatherType.RAINY, WeatherType.CLOUDY];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    setGameState(prev => {
      const wateredPlotIds = new Set();
      if (newWeather === WeatherType.RAINY) {
        prev.plots.forEach(p => wateredPlotIds.add(p.id));
      } else {
        Object.entries(prev.sprinklers).forEach(([plotIdStr, type]) => {
          const plotId = parseInt(plotIdStr);
          const row = Math.floor(plotId / 3), col = plotId % 3;
          if (type === SprinklerType.BASIC) {
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => { const nr=row+dr, nc=col+dc; if(nr>=0&&nr<3&&nc>=0&&nc<3) wateredPlotIds.add(nr*3+nc); });
          } else if (type === SprinklerType.QUALITY) {
            for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) { const nr=row+dr,nc=col+dc; if(nr>=0&&nr<3&&nc>=0&&nc<3) wateredPlotIds.add(nr*3+nc); }
          }
        });
      }
      return { ...prev, day: prev.day + 1, energy: prev.maxEnergy, weather: newWeather, orders: generateOrders(prev.level), plots: prev.plots.map(p => ({ ...p, isWatered: wateredPlotIds.has(p.id) ? true : p.isWatered })) };
    });
    notify(`☀️ Day ${gameState.day + 1}: A ${newWeather.toLowerCase()} day begins!`);
  }, [gameState.day, notify]);

  const handleInteract = useCallback((plotId) => {
    const plot = gameState.plots[plotId];
    const tool = gameState.selectedTool;
    if (gameState.energy <= 0) { handlePassOut(); return; }

    if (tool === 'WATER') {
      if (!plot.cropType || plot.isWatered) return;
      const canUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === gameState.upgrades.wateringCanLevel);
      const range = canUpgrade?.range || 1;
      let targetIds = [plotId];
      if (range === 3) { const row = Math.floor(plotId / 3); targetIds = [row*3, row*3+1, row*3+2]; }
      else if (range === 9) { targetIds = Array.from({ length: 9 }, (_, i) => i); }
      setGameState(prev => ({ ...prev, energy: Math.max(0, prev.energy - ENERGY_COSTS.WATER), plots: prev.plots.map(p => targetIds.includes(p.id) && p.cropType ? { ...p, isWatered: true } : p) }));
    } else if (tool === 'HARVEST') {
      if (!plot.cropType) return;
      const crop = CROPS[plot.cropType];
      if (plot.growthStage < crop.growthStages) { notify('⏳ Not ready yet!'); return; }
      setGameState(prev => ({
        ...prev, energy: Math.max(0, prev.energy - ENERGY_COSTS.HARVEST),
        inventory: { ...prev.inventory, [plot.cropType]: { ...prev.inventory[plot.cropType], harvested: (prev.inventory[plot.cropType]?.harvested || 0) + 1 } },
        plots: prev.plots.map(p => p.id === plotId ? { ...p, cropType: null, growthStage: 0, plantedAt: null, isWatered: false, isFertilized: false } : p)
      }));
      gainXP(crop.xpGain);
      notify(`🌾 Harvested ${crop.name}! (+${crop.xpGain} XP)`);
    } else if (tool === 'FERTILIZER') {
      if (!plot.cropType) { notify('🌱 Plant something first!'); return; }
      if (plot.isFertilized) { notify('✨ Already fertilized!'); return; }
      if ((gameState.inventory.fertilizer || 0) <= 0) { notify('❌ No fertilizer left!'); return; }
      setGameState(prev => ({ ...prev, energy: Math.max(0, prev.energy - ENERGY_COSTS.FERTILIZE), inventory: { ...prev.inventory, fertilizer: (prev.inventory.fertilizer || 0) - 1 }, plots: prev.plots.map(p => p.id === plotId ? { ...p, isFertilized: true } : p) }));
      notify('✨ Fertilized! Growth speed increased.');
    } else if (Object.values(CropType).includes(tool)) {
      const seedType = tool;
      if (plot.cropType) return;
      if ((gameState.inventory[seedType]?.seeds || 0) <= 0) return;
      setGameState(prev => ({
        ...prev, energy: Math.max(0, prev.energy - ENERGY_COSTS.PLANT),
        inventory: { ...prev.inventory, [seedType]: { ...prev.inventory[seedType], seeds: prev.inventory[seedType].seeds - 1 } },
        plots: prev.plots.map(p => p.id === plotId ? { ...p, cropType: seedType, growthStage: 0, plantedAt: Date.now(), isWatered: false } : p)
      }));
    }
  }, [gameState, handlePassOut, gainXP, notify]);

  const handleBuy = useCallback((type) => {
    const crop = CROPS[type];
    if (gameState.money < crop.buyPrice || gameState.level < crop.minLevel) return;
    setGameState(prev => ({ ...prev, money: prev.money - crop.buyPrice, inventory: { ...prev.inventory, [type]: { ...prev.inventory[type] || { seeds: 0, harvested: 0 }, seeds: (prev.inventory[type]?.seeds || 0) + 1 } } }));
    notify(`🛒 Bought ${crop.name} seed!`);
  }, [gameState.money, gameState.level, notify]);

  const handleBuyFertilizer = useCallback(() => {
    if (gameState.money < FERTILIZER_COST) return;
    setGameState(prev => ({ ...prev, money: prev.money - FERTILIZER_COST, inventory: { ...prev.inventory, fertilizer: (prev.inventory.fertilizer || 0) + 1 } }));
    notify('🌿 Bought Fertilizer!');
  }, [gameState.money, notify]);

  const handleBuySprinkler = useCallback((type) => {
    const data = SPRINKLERS[type];
    if (gameState.money < data.cost) return;
    const emptyPlot = gameState.plots.find(p => !p.cropType && !gameState.sprinklers[p.id]);
    if (!emptyPlot) { notify('❌ No empty plots for a sprinkler!'); return; }
    setGameState(prev => ({ ...prev, money: prev.money - data.cost, sprinklers: { ...prev.sprinklers, [emptyPlot.id]: type } }));
    notify(`💧 Placed ${data.name}!`);
  }, [gameState, notify]);

  const handleBuyKitchen = useCallback(() => {
    if (gameState.money < KITCHEN_COST) return;
    setGameState(prev => ({ ...prev, money: prev.money - KITCHEN_COST, upgrades: { ...prev.upgrades, hasKitchen: true } }));
    notify('👨‍🍳 Kitchen built! You can now cook meals.');
  }, [gameState.money, notify]);

  const handleCook = useCallback((recipe) => {
    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      Object.entries(recipe.ingredients).forEach(([type, amount]) => {
        newInventory[type] = { ...newInventory[type], harvested: newInventory[type].harvested - amount };
      });
      const newFood = { ...(prev.inventory.food || {}) };
      newFood[recipe.id] = (newFood[recipe.id] || 0) + 1;
      return { ...prev, inventory: { ...newInventory, food: newFood } };
    });
    notify(`🍲 Cooked ${recipe.name}!`);
  }, [notify]);

  const handleEat = useCallback((foodId) => {
    const recipe = RECIPES.find(r => r.id === foodId);
    if (!recipe) return;
    setGameState(prev => ({ ...prev, energy: Math.min(prev.maxEnergy, prev.energy + recipe.energyRestore), inventory: { ...prev.inventory, food: { ...(prev.inventory.food || {}), [foodId]: (prev.inventory.food?.[foodId] || 0) - 1 } } }));
    notify(`🍽️ Ate ${recipe.name}. Energy restored!`);
  }, [notify]);

  const handleUpgradeCan = useCallback(() => {
    const nextUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === gameState.upgrades.wateringCanLevel + 1);
    if (!nextUpgrade || gameState.money < nextUpgrade.cost) return;
    setGameState(prev => ({ ...prev, money: prev.money - nextUpgrade.cost, upgrades: { ...prev.upgrades, wateringCanLevel: nextUpgrade.level } }));
    notify(`⬆️ Upgraded to ${nextUpgrade.name}!`);
  }, [gameState, notify]);

  const handleSell = useCallback((type) => {
    const count = gameState.inventory[type]?.harvested || 0;
    if (count <= 0) return;
    const totalGain = CROPS[type].sellPrice * count;
    setGameState(prev => ({ ...prev, money: prev.money + totalGain, inventory: { ...prev.inventory, [type]: { ...prev.inventory[type], harvested: 0 } } }));
    notify(`💰 Sold ${count} ${CROPS[type].name}s for $${totalGain}!`);
  }, [gameState.inventory, notify]);

  const handleCompleteOrder = useCallback((orderId) => {
    const order = gameState.orders.find(o => o.id === orderId);
    if (!order) return;
    const currentAmount = gameState.inventory[order.cropType]?.harvested || 0;
    if (currentAmount < order.amount) return;
    setGameState(prev => ({
      ...prev, money: prev.money + order.reward,
      inventory: { ...prev.inventory, [order.cropType]: { ...prev.inventory[order.cropType], harvested: prev.inventory[order.cropType].harvested - order.amount } },
      orders: prev.orders.filter(o => o.id !== orderId)
    }));
    gainXP(order.xpReward);
    notify(`📦 Order complete! +$${order.reward} and ${order.xpReward} XP!`);
  }, [gameState, gainXP, notify]);

  // ── Force save on unmount ─────────────────────────────────────────────────
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => {
    return () => {
      if (updateStudentData && isLoaded) {
        updateStudentData({ farmSimData: gameStateRef.current }).catch(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#E8F5E9] font-sans selection:bg-green-200">
      {/* Rain overlay */}
      {gameState.weather === WeatherType.RAINY && (
        <div className="fixed inset-0 pointer-events-none z-[60] opacity-30">
          <div className="absolute inset-0 bg-blue-900/10" />
        </div>
      )}

      <HUD
        money={gameState.money} day={gameState.day} energy={gameState.energy} maxEnergy={gameState.maxEnergy}
        level={gameState.level} xp={gameState.xp} xpToNextLevel={gameState.xpToNextLevel}
        weather={gameState.weather} selectedTool={gameState.selectedTool}
        onSelectTool={(tool) => setGameState(prev => ({ ...prev, selectedTool: tool }))}
        onSleep={handleSleep}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Farm + Orders */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#A1887F] p-6 rounded-[3rem] shadow-2xl border-8 border-[#795548] relative">
            <div className="absolute -inset-4 border-8 border-green-500/20 rounded-[4rem] pointer-events-none" />
            <div className="grid grid-cols-3 gap-3">
              {gameState.plots.map(plot => (
                <FarmPlot key={plot.id} plot={plot} sprinkler={gameState.sprinklers[plot.id]} onInteract={handleInteract} />
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <div className="bg-black/10 px-4 py-2 rounded-full text-xs font-bold text-[#4E342E] uppercase tracking-widest">
                {gameState.selectedTool ? `Tool: ${gameState.selectedTool}` : 'Select a tool or seed'}
              </div>
            </div>
          </div>
          <Orders orders={gameState.orders} inventory={gameState.inventory} onComplete={handleCompleteOrder} />
        </div>

        {/* Right: Inventory + Kitchen + Shop */}
        <div className="lg:col-span-5 space-y-8">
          <Inventory
            inventory={gameState.inventory} onSell={handleSell}
            onSelectSeed={(type) => setGameState(prev => ({ ...prev, selectedTool: type }))}
            selectedTool={gameState.selectedTool}
          />
          {gameState.upgrades.hasKitchen && (
            <Kitchen inventory={gameState.inventory} onCook={handleCook} onEat={handleEat} />
          )}
          <Shop
            money={gameState.money} level={gameState.level}
            wateringCanLevel={gameState.upgrades.wateringCanLevel} hasKitchen={gameState.upgrades.hasKitchen}
            onBuy={handleBuy} onBuyFertilizer={handleBuyFertilizer} onBuySprinkler={handleBuySprinkler}
            onBuyKitchen={handleBuyKitchen} onUpgradeCan={handleUpgradeCan}
          />
        </div>
      </main>

      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold z-[100] whitespace-nowrap">
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save indicator */}
      {saveInProgress && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow z-[100] flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Saving...
        </div>
      )}

      <footer className="text-center py-8 text-green-800/40 text-sm font-medium">
        🌱 Sprout & Bloom • Cozy Farm Sim
      </footer>
    </div>
  );
};

export default SproutBloomGame;
