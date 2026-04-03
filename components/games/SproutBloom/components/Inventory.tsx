import React from 'react';
import { motion } from "framer-motion";
import { Package, Coins, Wheat, Carrot, Leaf, Flower2, Citrus, Sparkles, Heart, Circle } from 'lucide-react';
import { GameState, CropType } from '../types';
import { CROPS } from '../constants';

interface InventoryProps {
  inventory: GameState['inventory'];
  onSell: (type: CropType) => void;
  onSelectSeed: (type: CropType | 'FERTILIZER' | 'SPRINKLER') => void;
  selectedTool: GameState['selectedTool'];
}

export const Inventory: React.FC<InventoryProps> = ({ inventory, onSell, onSelectSeed, selectedTool }) => {
  const getIcon = (type: CropType, size = 20) => {
    switch (type) {
      case CropType.WHEAT:      return <Wheat      size={size} />;
      case CropType.CARROT:     return <Carrot     size={size} />;
      case CropType.TOMATO:     return <Leaf       size={size} />;
      case CropType.STRAWBERRY: return <Heart      size={size} />;
      case CropType.PUMPKIN:    return <Citrus     size={size} />;
      case CropType.BLUEBERRY:  return <Circle     size={size} />;
      case CropType.SUNFLOWER:  return <Flower2    size={size} />;
      default:                   return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-blue-100">
      <div className="flex items-center gap-2 mb-6">
        <Package className="text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-800">Storage</h2>
      </div>

      <div className="space-y-6">
        {/* Seeds & Items Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Seeds & Items</h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(CropType).map((type) => {
              const count = inventory[type]?.seeds || 0;
              const isSelected = selectedTool === type;
              const crop = CROPS[type];
              const locked = count === 0;

              return (
                <motion.button
                  key={`seed-${type}`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onSelectSeed(type)}
                  title={`${crop.name} seed${locked ? ` (unlock at Lv.${crop.minLevel})` : ''}`}
                  className={`
                    relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all
                    ${!locked ? 'bg-blue-50 border-2 border-blue-200 hover:border-blue-400' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
                    ${isSelected ? 'ring-3 ring-blue-400 ring-offset-1 border-blue-400 bg-blue-100' : ''}
                  `}
                >
                  {/* Icon */}
                  <div style={{ color: crop.color }} className="flex items-center justify-center h-7">
                    {getIcon(type, 22)}
                  </div>
                  {/* Name */}
                  <span className={`text-[10px] font-bold leading-none text-center truncate w-full px-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {crop.name}
                  </span>
                  {/* Count badge or lock level */}
                  {count > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                      {count}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-gray-400 leading-none">Lv.{crop.minLevel}</span>
                  )}
                </motion.button>
              );
            })}

            {/* Fertilizer slot */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelectSeed('FERTILIZER')}
              title="Fertilizer — speeds up growth by 50%"
              className={`
                relative flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all
                ${(inventory as any).fertilizer > 0 ? 'bg-purple-50 border-2 border-purple-200 hover:border-purple-400' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
                ${selectedTool === 'FERTILIZER' ? 'ring-3 ring-purple-400 ring-offset-1 border-purple-400 bg-purple-100' : ''}
              `}
            >
              <div className="flex items-center justify-center h-7">
                <Sparkles className="text-purple-500" size={22} />
              </div>
              <span className={`text-[10px] font-bold leading-none text-center ${selectedTool === 'FERTILIZER' ? 'text-purple-700' : 'text-gray-600'}`}>
                Fertilizer
              </span>
              {(inventory as any).fertilizer > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {(inventory as any).fertilizer}
                </span>
              ) : (
                <span className="text-[9px] font-bold text-gray-400 leading-none">Buy</span>
              )}
            </motion.button>
          </div>
        </div>

        {/* Harvested Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Harvested</h3>
          <div className="space-y-2">
            {Object.values(CropType).map((type) => {
              const count = inventory[type]?.harvested || 0;
              if (count === 0) return null;
              return (
                <div key={`harvest-${type}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-2xl border-2 border-orange-100">
                  <div className="flex items-center gap-3">
                    <div style={{ color: CROPS[type].color }}>{getIcon(type, 20)}</div>
                    <span className="font-bold text-gray-700">{CROPS[type].name} x{count}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSell(type)}
                    className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm hover:bg-green-600 transition-colors"
                  >
                    <Coins size={14} />
                    Sell for {CROPS[type].sellPrice * count}
                  </motion.button>
                </div>
              );
            })}
            {Object.values(inventory).every((item) => {
              const harvested = (item as { harvested?: number })?.harvested || 0;
              return harvested === 0;
            }) && (
              <div className="text-center py-4 text-gray-400 text-sm italic">
                No crops harvested yet...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
