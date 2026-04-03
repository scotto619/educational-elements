import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Sprout, Leaf, Flower2, Wheat, Carrot, Citrus, Trash2, Sparkles, Radio, Heart, Circle } from 'lucide-react';
import { PlotState, CropType, SprinklerType } from '../types';
import { CROPS, SPRINKLERS } from '../constants';

interface FarmPlotProps {
  plot: PlotState;
  sprinkler?: SprinklerType;
  onInteract: (id: number) => void;
}

const CropIcon = ({ type, stage, maxStages }: { type: CropType; stage: number; maxStages: number }) => {
  const progress = stage / maxStages;
  const size = 16 + progress * 24;
  const color = CROPS[type].color;

  if (stage === 0) return <Sprout size={16} className="text-green-600" />;
  
  const IconComponent = () => {
    switch (type) {
      case CropType.WHEAT:      return <Wheat  size={size} style={{ color }} />;
      case CropType.CARROT:     return <Carrot size={size} style={{ color }} />;
      case CropType.TOMATO:     return <Leaf   size={size} style={{ color }} />;
      case CropType.STRAWBERRY: return <Heart  size={size} style={{ color }} />;
      case CropType.PUMPKIN:    return <Citrus size={size} style={{ color }} />;
      case CropType.BLUEBERRY:  return <Circle size={size} style={{ color }} />;
      case CropType.SUNFLOWER:  return <Flower2 size={size} style={{ color }} />;
      default: return <Sprout size={size} className="text-green-500" />;
    }
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center justify-center"
    >
      <IconComponent />
    </motion.div>
  );
};

export const FarmPlot: React.FC<FarmPlotProps> = ({ plot, sprinkler, onInteract }) => {
  const isReady = plot.cropType && plot.growthStage >= CROPS[plot.cropType].growthStages;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onInteract(plot.id)}
      className={`
        relative w-full aspect-square rounded-xl cursor-pointer
        flex flex-col items-center justify-center overflow-hidden
        transition-colors duration-500
        ${plot.isWatered ? 'bg-[#5D4037]' : 'bg-[#8D6E63]'}
        border-4 ${isReady ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-[#4E342E]'}
      `}
    >
      {/* Soil Texture Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:4px_4px]" />

      {/* Sprinkler Visual */}
      {sprinkler && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div 
            className="p-1.5 rounded-full shadow-lg border-2 border-white/50"
            style={{ backgroundColor: SPRINKLERS[sprinkler].color }}
          >
            <Radio size={16} className="text-white" />
          </div>
        </div>
      )}

      {/* Fertilizer Sparkles */}
      {plot.isFertilized && (
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-2 left-2 pointer-events-none"
        >
          <Sparkles size={14} className="text-purple-300" />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {plot.cropType ? (
          <div className="flex flex-col items-center gap-1">
            <CropIcon 
              type={plot.cropType} 
              stage={plot.growthStage} 
              maxStages={CROPS[plot.cropType].growthStages} 
            />
            {isReady && (
              <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[10px] font-bold text-yellow-200 uppercase tracking-wider"
              >
                Ready!
              </motion.div>
            )}
          </div>
        ) : (
          <div className="opacity-20">
            <Trash2 size={24} className="text-white" />
          </div>
        )}
      </AnimatePresence>

      {/* Water Indicator */}
      {plot.isWatered && !isReady && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2"
        >
          <Droplets size={16} className="text-blue-400 fill-blue-400" />
        </motion.div>
      )}

      {/* Progress Bar */}
      {plot.cropType && !isReady && (
        <div className="absolute bottom-2 left-2 right-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${(plot.growthStage / CROPS[plot.cropType].growthStages) * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};
