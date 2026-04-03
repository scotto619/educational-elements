import React from 'react';
import { motion } from "framer-motion";
import { Package, Coins, Wheat, Carrot, Leaf, Flower2, Citrus, Sparkles } from 'lucide-react';
import { GameState, CropType } from '../types';
import { CROPS } from '../constants';

interface InventoryProps {
  inventory: GameState['inventory'];
  onSell: (type: CropType) => void;
  onSelectSeed: (type: CropType | 'FERTILIZER' | 'SPRINKLER') => void;
  selectedTool: GameState['selectedTool'];
}

export const Inventory: React.FC<InventoryProps> = ({ inventory, onSell, onSelectSeed, selectedTool }) => {
  const getIcon = (type: CropType) => {
    switch (type) {
      case CropType.WHEAT: return <Wheat size={20} />;
      case CropType.CARROT: return <Carrot size={20} />;
      case CropType.TOMATO: return <Leaf size={20} />;
      case CropType.PUMPKIN: return <Citrus size={20} />;
      case CropType.SUNFLOWER: return <Flower2 size={20} />;
      default: return null;
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
          <div className="grid grid-cols-5 gap-2">
            {Object.values(CropType).map((type) => {
              const count = inventory[type]?.seeds || 0;
              const isSelected = selectedTool === type;
              return (
                <motion.button
                  key={`seed-${type}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectSeed(type)}
                  className={`
                    relative aspect-square rounded-xl flex items-center justify-center transition-all
                    ${count > 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
                    ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2' : ''}
                  `}
                >
                  <div style={{ color: CROPS[type].color }}>
                    {getIcon(type)}
                  </div>
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </motion.button>
              );
            })}
            
            {/* Fertilizer in Inventory */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSeed('FERTILIZER')}
              className={`
                relative aspect-square rounded-xl flex items-center justify-center transition-all
                ${(inventory as any).fertilizer > 0 ? 'bg-purple-50 border-2 border-purple-200' : 'bg-gray-50 border-2 border-gray-100 opacity-40'}
                ${selectedTool === 'FERTILIZER' ? 'ring-4 ring-purple-400 ring-offset-2' : ''}
              `}
            >
              <Sparkles className="text-purple-500" size={20} />
              {(inventory as any).fertilizer > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {(inventory as any).fertilizer}
                </span>
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
                    <div style={{ color: CROPS[type].color }}>{getIcon(type)}</div>
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
