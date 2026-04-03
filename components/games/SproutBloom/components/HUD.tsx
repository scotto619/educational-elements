import React from 'react';
import { motion } from "framer-motion";
import { Coins, Sun, Droplets, Scissors, MousePointer2, Zap, CloudRain, Cloud, Moon, Sparkles, Radio } from 'lucide-react';
import { GameState, WeatherType } from '../types';

interface HUDProps {
  money: number;
  day: number;
  energy: number;
  maxEnergy: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  weather: WeatherType;
  selectedTool: GameState['selectedTool'];
  onSelectTool: (tool: GameState['selectedTool']) => void;
  onSleep: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  money, day, energy, maxEnergy, level, xp, xpToNextLevel, weather, selectedTool, onSelectTool, onSleep
}) => {
  const weatherIcon = () => {
    switch (weather) {
      case WeatherType.SUNNY: return <Sun className="text-yellow-400" size={16} />;
      case WeatherType.RAINY: return <CloudRain className="text-blue-400" size={16} />;
      case WeatherType.CLOUDY: return <Cloud className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="bg-[#E8F5E9] border-b-4 border-green-200 shadow-md">
      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">

        {/* Money */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow border-2 border-yellow-100 min-w-[90px]">
          <div className="bg-yellow-400 p-1 rounded-full flex-shrink-0">
            <Coins className="text-white" size={14} />
          </div>
          <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase leading-none">Gold</div>
            <div className="text-base font-black text-gray-800 leading-none">${money}</div>
          </div>
        </div>

        {/* Day & Weather */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow border-2 border-blue-100">
          <Sun className="text-yellow-500 flex-shrink-0" size={14} />
          <span className="font-black text-gray-700 text-sm">Day {day}</span>
          <div className="w-px h-4 bg-gray-200" />
          {weatherIcon()}
          <span className="text-xs font-bold text-gray-500 uppercase">{weather}</span>
        </div>

        {/* Energy */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow border-2 border-orange-100 min-w-[140px]">
          <Zap size={14} className="text-orange-500 fill-orange-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase">Energy</span>
              <span className="text-[9px] font-bold text-gray-600">{energy}/{maxEnergy}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200 w-20">
              <motion.div
                className="h-full bg-orange-400 rounded-full"
                animate={{ width: `${(energy / maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Level & XP */}
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow border-2 border-purple-100 min-w-[140px]">
          <span className="text-[9px] font-bold text-purple-600 uppercase flex-shrink-0">Lv.{level}</span>
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className="text-[9px] font-bold text-gray-400 uppercase">XP</span>
              <span className="text-[9px] font-bold text-gray-600">{xp}/{xpToNextLevel}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-20">
              <motion.div
                className="h-full bg-purple-400 rounded-full"
                animate={{ width: `${(xp / xpToNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sleep button — pushed to the right */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSleep}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow font-bold flex items-center gap-2 border-b-4 border-indigo-800 hover:bg-indigo-500 transition-colors text-sm"
        >
          <Moon size={14} />
          End Day
        </motion.button>
      </div>

      {/* ── Tools Row ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        <ToolButton active={selectedTool === null}        onClick={() => onSelectTool(null)}         icon={<MousePointer2 size={18} />} label="Select"    color="bg-gray-400" />
        <ToolButton active={selectedTool === 'WATER'}     onClick={() => onSelectTool('WATER')}      icon={<Droplets size={18} />}      label="Water"     color="bg-blue-500" />
        <ToolButton active={selectedTool === 'HARVEST'}   onClick={() => onSelectTool('HARVEST')}    icon={<Scissors size={18} />}      label="Harvest"   color="bg-orange-500" />
        <ToolButton active={selectedTool === 'FERTILIZER'} onClick={() => onSelectTool('FERTILIZER')} icon={<Sparkles size={18} />}    label="Fertilize" color="bg-purple-500" />
        <ToolButton active={selectedTool === 'SPRINKLER'} onClick={() => onSelectTool('SPRINKLER')}  icon={<Radio size={18} />}         label="Sprinkler" color="bg-slate-500" />
        <div className="ml-3 text-xs font-bold text-[#4E342E]/60 uppercase tracking-widest whitespace-nowrap">
          {selectedTool ? `Active: ${selectedTool}` : 'Select a tool or seed below'}
        </div>
      </div>
    </div>
  );
};

const ToolButton = ({
  active, onClick, icon, label, color
}: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string;
}) => (
  <motion.button
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={`
      relative px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap
      ${active ? `${color} text-white shadow-md` : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}
    `}
  >
    {icon}
    <span className="text-[11px] font-bold uppercase">{label}</span>
  </motion.button>
);
