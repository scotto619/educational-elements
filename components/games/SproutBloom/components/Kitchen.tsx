import React from 'react';
import { motion } from "framer-motion";
import { Utensils, Zap, Wheat, Carrot, Leaf, Flower2, Citrus, ChefHat } from 'lucide-react';
import { GameState, CropType, FoodItem } from '../types';
import { RECIPES, CROPS } from '../constants';

interface KitchenProps {
  inventory: GameState['inventory'];
  onCook: (recipe: FoodItem) => void;
  onEat: (foodId: string) => void;
}

export const Kitchen: React.FC<KitchenProps> = ({ inventory, onCook, onEat }) => {
  const getIcon = (type: CropType) => {
    switch (type) {
      case CropType.WHEAT: return <Wheat size={14} />;
      case CropType.CARROT: return <Carrot size={14} />;
      case CropType.TOMATO: return <Leaf size={14} />;
      case CropType.PUMPKIN: return <Citrus size={14} />;
      case CropType.SUNFLOWER: return <Flower2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-orange-100">
      <div className="flex items-center gap-2 mb-6">
        <ChefHat className="text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-800">Farm Kitchen</h2>
      </div>

      <div className="space-y-6">
        {/* Recipes Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Recipes</h3>
          <div className="space-y-3">
            {RECIPES.map((recipe) => {
              const canCook = Object.entries(recipe.ingredients).every(([type, amount]) => 
                (inventory[type as CropType]?.harvested || 0) >= (amount || 0)
              );

              return (
                <div key={recipe.id} className="p-3 bg-orange-50 rounded-2xl border-2 border-orange-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-800">{recipe.name}</span>
                    <div className="flex gap-2">
                      {Object.entries(recipe.ingredients).map(([type, amount]) => (
                        <div key={type} className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                          <div style={{ color: CROPS[type as CropType].color }}>{getIcon(type as CropType)}</div>
                          {inventory[type as CropType]?.harvested || 0}/{amount}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                      <Zap size={12} />
                      +{recipe.energyRestore}
                    </div>
                    <motion.button
                      whileHover={canCook ? { scale: 1.05 } : {}}
                      whileTap={canCook ? { scale: 0.95 } : {}}
                      onClick={() => onCook(recipe)}
                      disabled={!canCook}
                      className={`
                        px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all
                        ${canCook ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                      `}
                    >
                      Cook
                    </motion.button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prepared Food Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Prepared Meals</h3>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(inventory.food || {}).map(([foodId, count]) => {
              if (count === 0) return null;
              const recipe = RECIPES.find(r => r.id === foodId);
              if (!recipe) return null;

              return (
                <div key={`prepared-${foodId}`} className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border-2 border-green-100">
                  <span className="font-bold text-gray-700">{recipe.name} x{count}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEat(foodId)}
                    className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-green-600"
                  >
                    Eat (+{recipe.energyRestore} Energy)
                  </motion.button>
                </div>
              );
            })}
            {(!inventory.food || Object.values(inventory.food).every(v => v === 0)) && (
              <div className="text-center py-4 text-gray-400 text-sm italic">
                No meals prepared...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
