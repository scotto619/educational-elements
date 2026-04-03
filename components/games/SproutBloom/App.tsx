import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HUD } from './components/HUD';
import { FarmPlot } from './components/FarmPlot';
import { Shop } from './components/Shop';
import { Inventory } from './components/Inventory';
import { Orders } from './components/Orders';
import { Kitchen } from './components/Kitchen';
import { GameState, CropType, PlotState, WeatherType, Order, SprinklerType, FoodItem } from './types';
import { CROPS, INITIAL_MONEY, INITIAL_ENERGY, PLOT_COUNT, ENERGY_COSTS, WATERING_CAN_UPGRADES, FERTILIZER_COST, FERTILIZER_GROWTH_BOOST, SPRINKLERS, KITCHEN_COST, RECIPES } from './constants';

// ── Firebase integration props (optional — no-ops when not provided) ──────────
interface FirebaseProps {
  studentData?: Record<string, any>;
  updateStudentData?: (data: Record<string, any>) => Promise<void>;
  showToast?: (msg: string, type?: string) => void;
}

const generateOrders = (level: number): Order[] => {
  const availableCrops = Object.values(CROPS).filter(c => c.minLevel <= level);
  const count = 3;
  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    const crop = availableCrops[Math.floor(Math.random() * availableCrops.length)];
    const amount = Math.floor(Math.random() * 3) + 2;
    orders.push({
      id: Math.random().toString(36).substr(2, 9),
      cropType: crop.type,
      amount,
      reward: Math.floor(crop.sellPrice * amount * 1.5),
      xpReward: Math.floor(crop.xpGain * amount * 2),
    });
  }
  return orders;
};

const INITIAL_STATE: GameState = {
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
    id: i,
    cropType: null,
    growthStage: 0,
    lastWatered: null,
    plantedAt: null,
    isWatered: false,
    isFertilized: false,
  })),
  sprinklers: {},
  day: 1,
  weather: WeatherType.SUNNY,
  selectedTool: null,
  upgrades: {
    wateringCanLevel: 1,
    hasKitchen: false,
  },
  orders: generateOrders(1),
};

export default function App({ studentData, updateStudentData, showToast: _showToast }: FirebaseProps = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);
  const lastSaveRef = useRef<number>(0);

  const [gameState, setGameState] = useState<GameState>(() => {
    // Load from localStorage as immediate fallback (Firebase data applied in effect below)
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('farm-sim-save-v5');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_STATE;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // ── Load from Firebase (takes priority over localStorage) ─────────────────
  useEffect(() => {
    if (isLoaded) return;
    try {
      const saved = studentData?.farmSimData as GameState | undefined;
      if (saved) {
        setGameState({
          ...INITIAL_STATE,
          ...saved,
          orders: Array.isArray(saved.orders) && saved.orders.length > 0
            ? saved.orders
            : generateOrders(saved.level ?? 1),
        });
      }
    } catch (err) {
      console.error('Error loading farm sim data from Firebase:', err);
    }
    setIsLoaded(true);
  }, [studentData, isLoaded]);

  // ── Save to localStorage (always) + Firebase (debounced, if available) ────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('farm-sim-save-v5', JSON.stringify(gameState));
    }

    if (!isLoaded || !updateStudentData || saveInProgress) return;
    const now = Date.now();
    if (now - lastSaveRef.current < 15000) return; // debounce to 15s

    const timer = setTimeout(async () => {
      if (saveInProgress) return;
      setSaveInProgress(true);
      try {
        await updateStudentData({ farmSimData: gameState });
        lastSaveRef.current = Date.now();
      } catch (err) {
        console.error('Error saving farm sim data to Firebase:', err);
      } finally {
        setSaveInProgress(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, isLoaded]);

  // ── Force-save to Firebase on unmount ────────────────────────────────────
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

  // Game Loop: Growth
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        plots: prev.plots.map(plot => {
          if (!plot.cropType || !plot.isWatered) return plot;

          const crop = CROPS[plot.cropType];
          if (plot.growthStage >= crop.growthStages) return plot;

          const now = Date.now();
          const timeSincePlanted = (now - (plot.plantedAt || now)) / 1000;

          // Apply fertilizer boost
          const growthSpeed = plot.isFertilized ? (1 + FERTILIZER_GROWTH_BOOST) : 1;
          const adjustedTimePerStage = crop.growthTimePerStage / growthSpeed;

          const expectedStage = Math.min(
            crop.growthStages,
            Math.floor(timeSincePlanted / adjustedTimePerStage)
          );

          if (expectedStage > plot.growthStage) {
            return {
              ...plot,
              growthStage: expectedStage,
              isWatered: false,
            };
          }
          return plot;
        })
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2000);
  };

  const gainXP = (amount: number) => {
    setGameState(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNextLevel;

      while (newXP >= newXPToNext) {
        newXP -= newXPToNext;
        newLevel += 1;
        newXPToNext = Math.floor(newXPToNext * 1.5);
        notify(`Level Up! You are now level ${newLevel}!`);
      }

      return { ...prev, xp: newXP, level: newLevel, xpToNextLevel: newXPToNext };
    });
  };

  const handleSleep = () => {
    const weathers = [WeatherType.SUNNY, WeatherType.SUNNY, WeatherType.RAINY, WeatherType.CLOUDY];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];

    setGameState(prev => {
      // Sprinkler Logic
      const wateredPlotIds = new Set<number>();
      if (newWeather === WeatherType.RAINY) {
        prev.plots.forEach(p => wateredPlotIds.add(p.id));
      } else {
        Object.entries(prev.sprinklers).forEach(([plotIdStr, type]) => {
          const plotId = parseInt(plotIdStr);
          const row = Math.floor(plotId / 3);
          const col = plotId % 3;

          if (type === SprinklerType.BASIC) {
            // N, S, E, W
            [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                wateredPlotIds.add(nr * 3 + nc);
              }
            });
          } else if (type === SprinklerType.QUALITY) {
            // 3x3 square
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                  wateredPlotIds.add(nr * 3 + nc);
                }
              }
            }
          }
        });
      }

      return {
        ...prev,
        day: prev.day + 1,
        energy: prev.maxEnergy,
        weather: newWeather,
        orders: generateOrders(prev.level),
        plots: prev.plots.map(p => ({
          ...p,
          isWatered: wateredPlotIds.has(p.id) ? true : p.isWatered
        }))
      };
    });
    notify(`Day ${gameState.day + 1}: It's a ${newWeather.toLowerCase()} day!`);
  };

  const handlePassOut = () => {
    const penalty = Math.floor(gameState.money * 0.1);
    setGameState(prev => ({
      ...prev,
      money: Math.max(0, prev.money - penalty),
      day: prev.day + 1,
      energy: Math.floor(prev.maxEnergy * 0.5),
      weather: WeatherType.SUNNY,
      orders: generateOrders(prev.level),
    }));
    notify(`You passed out! Lost $${penalty} and woke up late...`);
  };

  const handleInteract = (plotId: number) => {
    const plot = gameState.plots[plotId];
    const tool = gameState.selectedTool;

    if (gameState.energy <= 0) {
      handlePassOut();
      return;
    }

    if (tool === 'WATER') {
      if (!plot.cropType) return;
      if (plot.isWatered) return;

      const canUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === gameState.upgrades.wateringCanLevel);
      const range = canUpgrade?.range || 1;

      let targetIds = [plotId];
      if (range === 3) {
        const row = Math.floor(plotId / 3);
        targetIds = [row * 3, row * 3 + 1, row * 3 + 2];
      } else if (range === 9) {
        targetIds = Array.from({ length: 9 }, (_, i) => i);
      }

      setGameState(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - ENERGY_COSTS.WATER),
        plots: prev.plots.map(p => targetIds.includes(p.id) && p.cropType ? { ...p, isWatered: true } : p)
      }));
    }
    else if (tool === 'HARVEST') {
      if (!plot.cropType) return;
      const crop = CROPS[plot.cropType];
      if (plot.growthStage < crop.growthStages) {
        notify("Not ready yet!");
        return;
      }

      setGameState(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - ENERGY_COSTS.HARVEST),
        inventory: {
          ...prev.inventory,
          [plot.cropType!]: {
            ...prev.inventory[plot.cropType!]!,
            harvested: (prev.inventory[plot.cropType!]?.harvested || 0) + 1
          }
        },
        plots: prev.plots.map(p => p.id === plotId ? {
          ...p,
          cropType: null,
          growthStage: 0,
          plantedAt: null,
          isWatered: false,
          isFertilized: false
        } : p)
      }));
      gainXP(crop.xpGain);
      notify(`Harvested ${crop.name}! (+${crop.xpGain} XP)`);
    }
    else if (tool === 'FERTILIZER') {
      if (!plot.cropType) {
        notify("Plant something first!");
        return;
      }
      if (plot.isFertilized) {
        notify("Already fertilized!");
        return;
      }
      if ((gameState.inventory.fertilizer || 0) <= 0) {
        notify("No fertilizer left!");
        return;
      }

      setGameState(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - ENERGY_COSTS.FERTILIZE),
        inventory: {
          ...prev.inventory,
          fertilizer: (prev.inventory.fertilizer || 0) - 1
        },
        plots: prev.plots.map(p => p.id === plotId ? { ...p, isFertilized: true } : p)
      }));
      notify("Fertilized! Growth speed increased.");
    }
    else if (tool === 'SPRINKLER') {
      if (gameState.sprinklers[plotId]) {
        notify("Sprinkler already here!");
        return;
      }
    }
    else if (Object.values(CropType).includes(tool as CropType)) {
      const seedType = tool as CropType;
      if (plot.cropType) return;
      if ((gameState.inventory[seedType]?.seeds || 0) <= 0) return;

      setGameState(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - ENERGY_COSTS.PLANT),
        inventory: {
          ...prev.inventory,
          [seedType]: {
            ...prev.inventory[seedType]!,
            seeds: prev.inventory[seedType]!.seeds - 1
          }
        },
        plots: prev.plots.map(p => p.id === plotId ? {
          ...p,
          cropType: seedType,
          growthStage: 0,
          plantedAt: Date.now(),
          isWatered: false
        } : p)
      }));
    }
  };

  const handleBuy = (type: CropType) => {
    const crop = CROPS[type];
    if (gameState.money < crop.buyPrice || gameState.level < crop.minLevel) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money - crop.buyPrice,
      inventory: {
        ...prev.inventory,
        [type]: {
          ...prev.inventory[type] || { seeds: 0, harvested: 0 },
          seeds: (prev.inventory[type]?.seeds || 0) + 1
        }
      }
    }));
    notify(`Bought ${crop.name} seed!`);
  };

  const handleBuyFertilizer = () => {
    if (gameState.money < FERTILIZER_COST) return;
    setGameState(prev => ({
      ...prev,
      money: prev.money - FERTILIZER_COST,
      inventory: {
        ...prev.inventory,
        fertilizer: (prev.inventory.fertilizer || 0) + 1
      }
    }));
    notify("Bought Fertilizer!");
  };

  const handleBuySprinkler = (type: SprinklerType) => {
    const data = SPRINKLERS[type];
    if (gameState.money < data.cost) return;

    const emptyPlot = gameState.plots.find(p => !p.cropType && !gameState.sprinklers[p.id]);
    if (!emptyPlot) {
      notify("No empty plots for a sprinkler!");
      return;
    }

    setGameState(prev => ({
      ...prev,
      money: prev.money - data.cost,
      sprinklers: {
        ...prev.sprinklers,
        [emptyPlot.id]: type
      }
    }));
    notify(`Placed ${data.name}!`);
  };

  const handleBuyKitchen = () => {
    if (gameState.money < KITCHEN_COST) return;
    setGameState(prev => ({
      ...prev,
      money: prev.money - KITCHEN_COST,
      upgrades: { ...prev.upgrades, hasKitchen: true }
    }));
    notify("Kitchen built! You can now cook meals.");
  };

  const handleCook = (recipe: FoodItem) => {
    setGameState(prev => {
      const newInventory = { ...prev.inventory };
      Object.entries(recipe.ingredients).forEach(([type, amount]) => {
        const cropType = type as CropType;
        newInventory[cropType] = {
          ...newInventory[cropType]!,
          harvested: newInventory[cropType]!.harvested - (amount || 0)
        };
      });

      const newFood = { ...prev.inventory.food };
      newFood[recipe.id] = (newFood[recipe.id] || 0) + 1;

      return {
        ...prev,
        inventory: { ...newInventory, food: newFood }
      };
    });
    notify(`Cooked ${recipe.name}!`);
  };

  const handleEat = (foodId: string) => {
    const recipe = RECIPES.find(r => r.id === foodId);
    if (!recipe) return;

    setGameState(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + recipe.energyRestore),
      inventory: {
        ...prev.inventory,
        food: {
          ...prev.inventory.food,
          [foodId]: (prev.inventory.food?.[foodId] || 0) - 1
        }
      }
    }));
    notify(`Ate ${recipe.name}. Energy restored!`);
  };

  const handleUpgradeCan = () => {
    const nextUpgrade = WATERING_CAN_UPGRADES.find(u => u.level === gameState.upgrades.wateringCanLevel + 1);
    if (!nextUpgrade || gameState.money < nextUpgrade.cost) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money - nextUpgrade.cost,
      upgrades: {
        ...prev.upgrades,
        wateringCanLevel: nextUpgrade.level
      }
    }));
    notify(`Upgraded to ${nextUpgrade.name}!`);
  };

  const handleSell = (type: CropType) => {
    const count = gameState.inventory[type]?.harvested || 0;
    if (count <= 0) return;

    const totalGain = CROPS[type].sellPrice * count;
    setGameState(prev => ({
      ...prev,
      money: prev.money + totalGain,
      inventory: {
        ...prev.inventory,
        [type]: {
          ...prev.inventory[type]!,
          harvested: 0
        }
      }
    }));
    notify(`Sold ${count} ${CROPS[type].name}s for $${totalGain}!`);
  };

  const handleCompleteOrder = (orderId: string) => {
    const order = gameState.orders.find(o => o.id === orderId);
    if (!order) return;

    const currentAmount = gameState.inventory[order.cropType]?.harvested || 0;
    if (currentAmount < order.amount) return;

    setGameState(prev => ({
      ...prev,
      money: prev.money + order.reward,
      inventory: {
        ...prev.inventory,
        [order.cropType]: {
          ...prev.inventory[order.cropType]!,
          harvested: prev.inventory[order.cropType]!.harvested - order.amount
        }
      },
      orders: prev.orders.filter(o => o.id !== orderId)
    }));
    gainXP(order.xpReward);
    notify(`Order complete! +$${order.reward} and ${order.xpReward} XP!`);
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] font-sans selection:bg-green-200 overflow-x-hidden">
      {/* Weather Visuals */}
      {gameState.weather === WeatherType.RAINY && (
        <div className="fixed inset-0 pointer-events-none z-[60] opacity-30">
          <div className="absolute inset-0 bg-blue-900/10" />
          <div className="rain-container" />
        </div>
      )}

      <HUD
        money={gameState.money}
        day={gameState.day}
        energy={gameState.energy}
        maxEnergy={gameState.maxEnergy}
        level={gameState.level}
        xp={gameState.xp}
        xpToNextLevel={gameState.xpToNextLevel}
        weather={gameState.weather}
        selectedTool={gameState.selectedTool}
        onSelectTool={(tool) => setGameState(prev => ({ ...prev, selectedTool: tool }))}
        onSleep={handleSleep}
      />

      <main className="max-w-7xl mx-auto pt-6 pb-20 px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Farm & Orders */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#A1887F] p-8 rounded-[3rem] shadow-2xl border-8 border-[#795548] relative">
            <div className="absolute -inset-4 border-8 border-green-500/20 rounded-[4rem] pointer-events-none" />

            <div className="grid grid-cols-3 gap-4">
              {gameState.plots.map(plot => (
                <FarmPlot
                  key={plot.id}
                  plot={plot}
                  sprinkler={gameState.sprinklers[plot.id]}
                  onInteract={handleInteract}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <div className="bg-black/10 px-4 py-2 rounded-full text-xs font-bold text-[#4E342E] uppercase tracking-widest">
                {gameState.selectedTool ? `Tool: ${gameState.selectedTool}` : 'Select a tool or seed'}
              </div>
            </div>
          </div>

          <Orders
            orders={gameState.orders}
            inventory={gameState.inventory}
            onComplete={handleCompleteOrder}
          />
        </div>

        {/* Right Column: Inventory & Shop & Kitchen */}
        <div className="lg:col-span-5 space-y-8">
          <Inventory
            inventory={gameState.inventory}
            onSell={handleSell}
            onSelectSeed={(type) => setGameState(prev => ({ ...prev, selectedTool: type }))}
            selectedTool={gameState.selectedTool}
          />

          {gameState.upgrades.hasKitchen && (
            <Kitchen
              inventory={gameState.inventory}
              onCook={handleCook}
              onEat={handleEat}
            />
          )}

          <Shop
            money={gameState.money}
            level={gameState.level}
            wateringCanLevel={gameState.upgrades.wateringCanLevel}
            hasKitchen={gameState.upgrades.hasKitchen}
            onBuy={handleBuy}
            onBuyFertilizer={handleBuyFertilizer}
            onBuySprinkler={handleBuySprinkler}
            onBuyKitchen={handleBuyKitchen}
            onUpgradeCan={handleUpgradeCan}
          />
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-8 py-4 rounded-2xl shadow-2xl font-bold z-[100]"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Firebase save indicator */}
      {saveInProgress && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow z-[100] flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> Saving...
        </div>
      )}

      <footer className="text-center py-8 text-green-800/40 text-sm font-medium">
        Sprout & Bloom • Built for Cozy Learning
      </footer>
    </div>
  );
}
