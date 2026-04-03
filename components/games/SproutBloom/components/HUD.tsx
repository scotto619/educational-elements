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
      case WeatherType.SUNNY: return <Sun className="text-yellow-400" size={20} />;
      case WeatherType.RAINY: return <CloudRain className="text-blue-400" size={20} />;
      case WeatherType.CLOUDY: return <Cloud className="text-gray-400" size={20} />;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-50">
      {/* Stats Left */}
      <div className="flex flex-col gap-3 pointer-events-auto">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border-4 border-yellow-100 flex items-center gap-3"
        >
          <div className="bg-yellow-400 p-2 rounded-full shadow-inner">
            <Coins className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase leading-none">Balance</span>
            <span className="text-2xl font-black text-gray-800 leading-none">{money}</span>
          </div>
        </motion.div>

        {/* Energy Bar */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border-4 border-orange-100 flex flex-col gap-1 w-48"
        >
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1">
              <Zap size={14} className="text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase">Energy</span>
            </div>
            <span className="text-[10px] font-bold text-gray-700">{energy}/{maxEnergy}</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              className="h-full bg-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${(energy / maxEnergy) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Level & XP */}
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border-4 border-purple-100 flex flex-col gap-1 w-48"
        >
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-purple-600 uppercase">Level {level}</span>
            <span className="text-[10px] font-bold text-gray-500">{xp}/{xpToNextLevel} XP</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-400"
              initial={{ width: 0 }}
              animate={{ width: `${(xp / xpToNextLevel) * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Center Info */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border-4 border-blue-100 flex items-center gap-4"
        >
          <div className="flex items-center gap-2">
            <Sun className="text-yellow-500" size={18} />
            <span className="font-black text-gray-700">Day {day}</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            {weatherIcon()}
            <span className="text-xs font-bold text-gray-500 uppercase">{weather}</span>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSleep}
          className="bg-indigo-600 text-white px-6 py-2 rounded-full shadow-xl font-bold flex items-center gap-2 border-b-4 border-indigo-800 hover:bg-indigo-500 transition-colors"
        >
          <Moon size={18} />
          End Day
        </motion.button>
      </div>

      {/* Toolbar Right */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-3xl shadow-2xl border-4 border-green-100 flex gap-2 pointer-events-auto">
        <ToolButton 
          active={selectedTool === null} 
          onClick={() => onSelectTool(null)}
          icon={<MousePointer2 size={24} />}
          label="Select"
          color="bg-gray-400"
        />
        <ToolButton 
          active={selectedTool === 'WATER'} 
          onClick={() => onSelectTool('WATER')}
          icon={<Droplets size={24} />}
          label="Water"
          color="bg-blue-500"
        />
        <ToolButton 
          active={selectedTool === 'HARVEST'} 
          onClick={() => onSelectTool('HARVEST')}
          icon={<Scissors size={24} />}
          label="Harvest"
          color="bg-orange-500"
        />
        <ToolButton 
          active={selectedTool === 'FERTILIZER'} 
          onClick={() => onSelectTool('FERTILIZER')}
          icon={<Sparkles size={24} />}
          label="Fertilize"
          color="bg-purple-500"
        />
        <ToolButton 
          active={selectedTool === 'SPRINKLER'} 
          onClick={() => onSelectTool('SPRINKLER')}
          icon={<Radio size={24} />}
          label="Sprinkler"
          color="bg-slate-500"
        />
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, label, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`
      relative p-4 rounded-2xl flex flex-col items-center gap-1 transition-all
      ${active ? `${color} text-white shadow-lg scale-110 z-10` : 'bg-white text-gray-400 hover:bg-gray-50'}
    `}
  >
    {icon}
    <span className={`text-[10px] font-bold uppercase ${active ? 'text-white' : 'text-gray-400'}`}>{label}</span>
    {active && (
      <motion.div 
        layoutId="active-tool"
        className="absolute -bottom-1 w-2 h-2 bg-white rounded-full"
      />
    )}
  </motion.button>
);
