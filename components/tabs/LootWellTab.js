// components/tabs/LootWellTab.js - Extracted Loot Well functionality
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Constants
const LOOT_WELL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const MAX_LOOT_WELL_HISTORY = 10;

// Helper to format duration
const formatDuration = (ms) => {
    if (ms <= 0) return 'Ready!';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

const LootWellTab = ({
    students = [],
    student = null, // Optional: for single student mode
    onUpdateStudent,
    SHOP_BASIC_AVATARS = [],
    SHOP_PREMIUM_AVATARS = [],
    SHOP_BASIC_PETS = [],
    SHOP_PREMIUM_PETS = [],
    showToast = () => { },
    calculateCoins
}) => {
    const [selectedStudentId, setSelectedStudentId] = useState(student?.id || null);
    const [lootWellAnimating, setLootWellAnimating] = useState(false);
    const [lootWellResult, setLootWellResult] = useState(null);

    // Determine effective selected student
    const selectedStudent = student || students.find(s => s.id === selectedStudentId);

    // Get loot well stats from student data
    const lootWellStats = useMemo(() => {
        return selectedStudent?.lootWell || {
            lastDrawAt: null,
            history: [],
            totalAttempts: 0,
            totalWins: 0
        };
    }, [selectedStudent]); // Fixed dependency to just selectedStudent (object ref change should trigger)

    // Calculate cooldown
    const { lootWellReady, timeRemaining } = useMemo(() => {
        if (!lootWellStats.lastDrawAt) {
            return { lootWellReady: true, timeRemaining: 0 };
        }

        const lastDraw = new Date(lootWellStats.lastDrawAt).getTime();
        const nextAvailable = lastDraw + LOOT_WELL_COOLDOWN_MS;
        const now = Date.now();

        if (now >= nextAvailable) {
            return { lootWellReady: true, timeRemaining: 0 };
        }

        return { lootWellReady: false, timeRemaining: nextAvailable - now };
    }, [lootWellStats.lastDrawAt]);

    // Countdown timer
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (lootWellReady) {
            setCountdown('');
            return;
        }

        const updateCountdown = () => {
            if (!lootWellStats.lastDrawAt) return;

            const lastDraw = new Date(lootWellStats.lastDrawAt).getTime();
            const nextAvailable = lastDraw + LOOT_WELL_COOLDOWN_MS;
            const remaining = Math.max(0, nextAvailable - Date.now());

            setCountdown(formatDuration(remaining));
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);
        return () => clearInterval(interval);
    }, [lootWellStats.lastDrawAt, lootWellReady]);

    // Prize pool
    const prizePool = useMemo(() => {
        const allAvatars = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS];
        const allPets = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS];

        const prizes = [];

        // Add avatars as prizes
        allAvatars.forEach(avatar => {
            prizes.push({
                type: 'avatar',
                item: avatar,
                rarity: avatar.price > 30 ? 'rare' : avatar.price > 20 ? 'uncommon' : 'common'
            });
        });

        // Add pets as prizes
        allPets.forEach(pet => {
            prizes.push({
                type: 'pet',
                item: pet,
                rarity: pet.price > 40 ? 'rare' : pet.price > 25 ? 'uncommon' : 'common'
            });
        });

        // Add coin rewards
        prizes.push({ type: 'coins', amount: 5, rarity: 'common' });
        prizes.push({ type: 'coins', amount: 10, rarity: 'uncommon' });
        prizes.push({ type: 'coins', amount: 25, rarity: 'rare' });

        // Add XP rewards
        prizes.push({ type: 'xp', amount: 5, rarity: 'common' });
        prizes.push({ type: 'xp', amount: 10, rarity: 'uncommon' });
        prizes.push({ type: 'xp', amount: 25, rarity: 'rare' });

        return prizes;
    }, [SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS]);

    const selectRandomPrize = () => {
        if (prizePool.length === 0) return null;

        // Weighted random selection based on rarity
        const rarityWeights = { common: 60, uncommon: 30, rare: 10 };
        const totalWeight = prizePool.reduce((sum, prize) => sum + (rarityWeights[prize.rarity] || 10), 0);

        let random = Math.random() * totalWeight;
        for (const prize of prizePool) {
            random -= rarityWeights[prize.rarity] || 10;
            if (random <= 0) return prize;
        }

        return prizePool[0];
    };

    const handleLootWellDraw = async () => {
        if (!selectedStudent) {
            showToast('Please select a student first!', 'warning');
            return;
        }

        if (!lootWellReady || lootWellAnimating) {
            showToast('The Loot Well is still recharging!', 'info');
            return;
        }

        setLootWellAnimating(true);
        setLootWellResult(null);

        const prize = selectRandomPrize();

        if (!prize) {
            showToast('The well is empty! Try again later.', 'error');
            setLootWellAnimating(false);
            return;
        }

        const timestamp = Date.now();
        const nowIso = new Date(timestamp).toISOString();

        // Build updates
        let updates = {};

        if (prize.type === 'avatar' && prize.item) {
            const currentAvatars = selectedStudent.ownedAvatars || [];
            if (!currentAvatars.includes(prize.item.name)) {
                updates.ownedAvatars = [...currentAvatars, prize.item.name];
            } else {
                // Already owned, give coins instead
                updates.currency = (selectedStudent.currency || 0) + 5;
            }
        } else if (prize.type === 'pet' && prize.item) {
            const currentPets = selectedStudent.ownedPets || [];
            if (!currentPets.some(p => p.name === prize.item.name)) {
                updates.ownedPets = [...currentPets, {
                    id: `pet_${timestamp}`,
                    name: prize.item.name,
                    path: prize.item.path,
                    acquiredAt: nowIso
                }];
            } else {
                // Already owned, give coins instead
                updates.currency = (selectedStudent.currency || 0) + 5;
            }
        } else if (prize.type === 'coins') {
            updates.currency = (selectedStudent.currency || 0) + prize.amount;
        } else if (prize.type === 'xp') {
            updates.totalPoints = (selectedStudent.totalPoints || 0) + prize.amount;
        }

        // Update loot well stats
        const history = lootWellStats.history || [];
        const historyEntry = {
            id: `lootwell_${timestamp}`,
            prizeType: prize.type,
            prizeName: prize.item?.name || `${prize.amount} ${prize.type}`,
            rarity: prize.rarity,
            timestamp: nowIso
        };

        updates.lootWell = {
            lastDrawAt: nowIso,
            history: [...history.slice(-MAX_LOOT_WELL_HISTORY + 1), historyEntry],
            totalAttempts: (lootWellStats.totalAttempts || 0) + 1,
            totalWins: (lootWellStats.totalWins || 0) + 1
        };

        // Simulate animation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            await onUpdateStudent(selectedStudentId, updates);
            setLootWellResult(prize);
            showToast(`🎉 Drew from the Loot Well!`, 'success');
        } catch (error) {
            showToast('Failed to save the prize. Try again!', 'error');
        }

        setLootWellAnimating(false);
    };

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'rare': return 'text-purple-600';
            case 'uncommon': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getRarityBg = (rarity) => {
        switch (rarity) {
            case 'rare': return 'bg-purple-100 border-purple-300';
            case 'uncommon': return 'bg-blue-100 border-blue-300';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 shadow-lg text-center">
                <h2 className="text-3xl font-bold mb-2">💠 The Loot Well</h2>
                <p className="text-cyan-100">A magical well of treasures awaits!</p>
            </div>

            {/* Student Selector - Only show if not in single student mode */}
            {!student && (
                <div className="bg-white rounded-xl p-4 shadow-md">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Student:
                    </label>
                    <select
                        value={selectedStudentId || ''}
                        onChange={(e) => {
                            setSelectedStudentId(e.target.value || null);
                            setLootWellResult(null);
                        }}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-cyan-500 focus:outline-none"
                    >
                        <option value="">-- Choose a student --</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.firstName} {student.lastName} (💰 {calculateCoins ? calculateCoins(student) : 0})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Main Well Area */}
            {selectedStudent ? (
                <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-8 text-center shadow-xl">
                    {/* Well Animation */}
                    <div className={`relative inline-block mb-6 ${lootWellAnimating ? 'animate-pulse' : ''}`}>
                        <div className="w-40 h-40 rounded-full bg-gradient-to-b from-cyan-400 to-blue-700 shadow-2xl flex items-center justify-center border-8 border-stone-600">
                            <span className="text-6xl">
                                {lootWellAnimating ? '✨' : '💠'}
                            </span>
                        </div>
                        {lootWellAnimating && (
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping"></div>
                        )}
                    </div>

                    {/* Status */}
                    {lootWellReady ? (
                        <div className="text-emerald-400 text-lg font-bold mb-4">
                            ✨ The Well is ready! ✨
                        </div>
                    ) : (
                        <div className="text-amber-400 text-lg font-bold mb-4">
                            ⏳ Recharging: {countdown}
                        </div>
                    )}

                    {/* Draw Button */}
                    <button
                        onClick={handleLootWellDraw}
                        disabled={!lootWellReady || lootWellAnimating}
                        className={`px-8 py-4 rounded-xl text-xl font-bold transition-all transform ${lootWellReady && !lootWellAnimating
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:scale-105 hover:shadow-xl active:scale-95'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {lootWellAnimating ? '✨ Drawing...' : '💠 Draw from the Well'}
                    </button>

                    {/* Result Display */}
                    {lootWellResult && (
                        <div className={`mt-6 p-4 rounded-xl border-2 ${getRarityBg(lootWellResult.rarity)}`}>
                            <h3 className={`text-xl font-bold mb-2 ${getRarityColor(lootWellResult.rarity)}`}>
                                🎉 You Won!
                            </h3>
                            {lootWellResult.type === 'avatar' && (
                                <div className="flex flex-col items-center">
                                    <div className="w-32 aspect-[3/4] mb-4 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                                        <img
                                            src={lootWellResult.item.path}
                                            alt={lootWellResult.item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="font-bold text-lg">{lootWellResult.item.name}</span>
                                </div>
                            )}
                            {lootWellResult.type === 'pet' && (
                                <div className="flex flex-col items-center">
                                    <div className="w-32 aspect-square mb-4 bg-white rounded-xl shadow-lg border-4 border-white overflow-hidden">
                                        <img
                                            src={lootWellResult.item.path}
                                            alt={lootWellResult.item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <span className="font-bold text-lg">{lootWellResult.item.name}</span>
                                </div>
                            )}
                            {lootWellResult.type === 'coins' && (
                                <div className="text-3xl">💰 {lootWellResult.amount} Coins</div>
                            )}
                            {lootWellResult.type === 'xp' && (
                                <div className="text-3xl">⭐ {lootWellResult.amount} XP</div>
                            )}
                            <div className={`text-sm mt-2 capitalize ${getRarityColor(lootWellResult.rarity)}`}>
                                {lootWellResult.rarity} Rarity
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-100 rounded-xl p-8 text-center">
                    <div className="text-5xl mb-4">👆</div>
                    <p className="text-gray-600">Select a student to use the Loot Well</p>
                </div>
            )}

            {/* History */}
            {selectedStudent && lootWellStats.history && lootWellStats.history.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="font-bold text-gray-800 mb-4">📜 Recent Draws</h3>
                    <div className="space-y-2">
                        {[...lootWellStats.history].reverse().slice(0, 5).map((entry, idx) => (
                            <div key={entry.id || idx} className={`p-3 rounded-lg border ${getRarityBg(entry.rarity)}`}>
                                <span className={`font-semibold ${getRarityColor(entry.rarity)}`}>
                                    {entry.prizeName}
                                </span>
                                <span className="text-gray-500 text-sm ml-2">
                                    {new Date(entry.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-center text-sm text-cyan-800">
                <strong>How it works:</strong> Each student can draw from the Loot Well once per hour.
                Prizes include avatars, pets, coins, and XP!
            </div>
        </div>
    );
};

export default LootWellTab;
