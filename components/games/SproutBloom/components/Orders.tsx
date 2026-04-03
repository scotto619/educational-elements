import React from 'react';
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, Coins, Star, Wheat, Carrot, Leaf, Heart, Citrus, Circle, Flower2 } from 'lucide-react';
import { Order, CropType } from '../types';
import { CROPS } from '../constants';

interface OrdersProps {
  orders: Order[];
  inventory: Record<string, any>;
  onComplete: (orderId: string) => void;
}

export const Orders: React.FC<OrdersProps> = ({ orders, inventory, onComplete }) => {
  const getIcon = (type: CropType) => {
    switch (type) {
      case CropType.WHEAT: return <Wheat size={16} />;
      case CropType.CARROT: return <Carrot size={16} />;
      case CropType.TOMATO: return <Leaf size={16} />;
      case CropType.STRAWBERRY: return <Heart size={16} />;
      case CropType.PUMPKIN: return <Citrus size={16} />;
      case CropType.BLUEBERRY: return <Circle size={16} />;
      case CropType.SUNFLOWER: return <Flower2 size={16} />;
      default: return null;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-xl border-4 border-purple-100">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="text-purple-500" />
        <h2 className="text-2xl font-bold text-gray-800">Daily Orders</h2>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const currentAmount = inventory[order.cropType]?.harvested || 0;
          const isComplete = currentAmount >= order.amount;

          return (
            <motion.div
              key={order.id}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`
                p-4 rounded-2xl border-2 flex items-center justify-between transition-all
                ${isComplete ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}
              `}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: CROPS[order.cropType].color }}
                >
                  {getIcon(order.cropType)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-700">
                    {order.amount}x {CROPS[order.cropType].name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-green-600 flex items-center gap-0.5">
                      <Coins size={10} /> ${order.reward}
                    </span>
                    <span className="text-purple-600 flex items-center gap-0.5">
                      <Star size={10} /> {order.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={isComplete ? { scale: 1.1 } : {}}
                whileTap={isComplete ? { scale: 0.9 } : {}}
                disabled={!isComplete}
                onClick={() => onComplete(order.id)}
                className={`
                  p-2 rounded-full transition-all
                  ${isComplete 
                    ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                <CheckCircle2 size={20} />
              </motion.button>
            </motion.div>
          );
        })}
        {orders.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm italic">
            No orders today. Check back tomorrow!
          </div>
        )}
      </div>
    </div>
  );
};
