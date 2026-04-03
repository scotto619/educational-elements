import React from 'react';
import { motion } from "framer-motion";
import { ShoppingBag, Coins, Wheat, Carrot, Leaf, Flower2, Citrus, Sprout, ArrowUpCircle, Sparkles, Radio, ChefHat } from 'lucide-react';
import { CropType, SprinklerType } from '../types';
import { CROPS, WATERING_CAN_UPGRADES, FERTILIZER_COST, SPRINKLERS, KITCHEN_COST } from '../constants';

interface ShopProps {
  money: number;
  level: number;
  wateringCanLevel: number;
  hasKitchen: boolean;
  onBuy: (type: CropType) => void;
  onBuyFertilizer: () => void;
  onBuySprinkler: (type: SprinklerType) => void;
  onBuyKitchen: () => void;
  onUpgradeCan: () => void;
}

const SproutIcon = ({ type }: { type: CropType }) => {
  switch (type) {
    case CropType.WHEAT: return <Wheat size={20} />;
    case CropType.CARROT: return <Carrot size={20} />;
    case CropType.TOMATO: return <Leaf size={20} />;
    case CropType.PUMPKIN: return <Citrus size={20} />;
    case CropType.SUNFLOWER: return <Flower2 size={20} />;
    default: return <Sprout size={20} />;
  }
};

export const Shop: React.FC<ShopProps> = ({ money, level, wateringCanLevel, hasKitchen, onBuy, onBuyFertilizer, onBuySprinkler, onBuyKitchen, onUpgradeCan }) => {
  const nextCanUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === wateringCanLevel + 1);

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-pink-100">
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="text-pink-500" />
        <h2 className="text-2xl font-bold text-gray-800 font-sans">Seed Shop</h2>
      </div>

      <div className="space-y-6">
        {/* Upgrades & Items Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Tools & Items</h3>
          
          {nextCanUpgrade && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUpgradeCan}
              disabled={money < nextCanUpgrade.cost}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                ${money >= nextCanUpgrade.cost ? 'bg-white border-blue-200 hover:border-blue-400' : 'bg-gray-50 border-gray-100 opacity-60'}
              `}
            >
              <div className="flex items-center gap-3">
                <ArrowUpCircle className="text-blue-500" />
                <div className="text-left">
                  <div className="font-bold text-gray-800">{nextCanUpgrade.name}</div>
                  <div className="text-[10px] text-gray-500">Waters {nextCanUpgrade.range} plots</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-blue-600">
                <Coins size={14} />
                {nextCanUpgrade.cost}
              </div>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBuyFertilizer}
            disabled={money < FERTILIZER_COST}
            className={`
              w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
              ${money >= FERTILIZER_COST ? 'bg-white border-purple-200 hover:border-purple-400' : 'bg-gray-50 border-gray-100 opacity-60'}
            `}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="text-purple-500" />
              <div className="text-left">
                <div className="font-bold text-gray-800">Growth Fertilizer</div>
                <div className="text-[10px] text-gray-500">Crops grow 50% faster</div>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-purple-600">
              <Coins size={14} />
              {FERTILIZER_COST}
            </div>
          </motion.button>

          {!hasKitchen && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBuyKitchen}
              disabled={money < KITCHEN_COST}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                ${money >= KITCHEN_COST ? 'bg-white border-orange-200 hover:border-orange-400' : 'bg-gray-50 border-gray-100 opacity-60'}
              `}
            >
              <div className="flex items-center gap-3">
                <ChefHat className="text-orange-500" />
                <div className="text-left">
                  <div className="font-bold text-gray-800">Kitchen Upgrade</div>
                  <div className="text-[10px] text-gray-500">Cook meals for energy</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-orange-600">
                <Coins size={14} />
                {KITCHEN_COST}
              </div>
            </motion.button>
          )}

          {Object.entries(SPRINKLERS).map(([type, data]) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onBuySprinkler(type as SprinklerType)}
              disabled={money < data.cost}
              className={`
                w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all
                ${money >= data.cost ? 'bg-white border-slate-200 hover:border-slate-400' : 'bg-gray-50 border-gray-100 opacity-60'}
              `}
            >
              <div className="flex items-center gap-3">
                <Radio className="text-slate-500" />
                <div className="text-left">
                  <div className="font-bold text-gray-800">{data.name}</div>
                  <div className="text-[10px] text-gray-500">Waters {data.range} daily</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-bold text-slate-600">
                <Coins size={14} />
                {data.cost}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Seeds Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.values(CROPS).map((crop) => {
            const isLocked = level < crop.minLevel;
            const canAfford = money >= crop.buyPrice;

            return (
              <motion.button
                key={crop.type}
                whileHover={!isLocked ? { scale: 1.02 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => onBuy(crop.type)}
                disabled={isLocked || !canAfford}
                className={`
                  relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all overflow-hidden
                  ${isLocked 
                    ? 'border-gray-200 bg-gray-100 grayscale' 
                    : canAfford 
                      ? 'border-green-100 bg-green-50 hover:bg-green-100' 
                      : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}
                `}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
                    <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      Level {crop.minLevel}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: crop.color }}
                  >
                    <SproutIcon type={crop.type} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800">{crop.name}</div>
                    <div className="text-[10px] text-gray-500">XP: +{crop.xpGain}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-bold text-green-600">
                  <Coins size={16} />
                  {crop.buyPrice}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
