// ShopTab.js - Redesigned Shop with Classroom Champions & Teacher Rewards
import React, { useState, useEffect } from 'react';

const ShopTab = ({ 
  students, 
  setStudents, 
  showToast,
  saveStudentsToFirebase,
  currentClassId,
  userData
}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeSection, setActiveSection] = useState('champions'); // 'champions' or 'rewards'
  const [activeChampsCategory, setActiveChampsCategory] = useState('avatars');
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [showInventoryModal, setShowInventoryModal] = useState(null);
  const [showRewardEditor, setShowRewardEditor] = useState(false);
  const [teacherRewards, setTeacherRewards] = useState([]);
  const [newReward, setNewReward] = useState({ name: '', description: '', price: 5, category: 'privileges' });
  const [editingReward, setEditingReward] = useState(null);
  const [featuredItem, setFeaturedItem] = useState(null);

  // Constants
  const COINS_PER_XP = 5;

  // Rarity colors with borders
  const RARITY_STYLES = {
    common: {
      name: 'Common',
      borderColor: 'border-gray-400',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      glowColor: 'shadow-gray-200',
      chance: 50
    },
    uncommon: {
      name: 'Uncommon',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      glowColor: 'shadow-green-200',
      chance: 30
    },
    rare: {
      name: 'Rare',
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      glowColor: 'shadow-blue-200',
      chance: 15
    },
    epic: {
      name: 'Epic',
      borderColor: 'border-purple-400',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      glowColor: 'shadow-purple-200',
      chance: 4
    },
    legendary: {
      name: 'Legendary',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      glowColor: 'shadow-yellow-200',
      chance: 1
    }
  };

  // Loot Box Items based on uploaded images
  const LOOT_ITEMS = {
    common: [
      { id: 'loot_c_1', name: 'Ancient Tome', image: '/Loot/Common/Loot 1.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_2', name: 'Crystal Orb', image: '/Loot/Common/Loot 2.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_3', name: 'Golden Key', image: '/Loot/Common/Loot 3.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_4', name: 'Mystic Arrows', image: '/Loot/Common/Loot 4.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_5', name: 'Enchanted Harp', image: '/Loot/Common/Loot 5.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_6', name: 'Wisdom Scroll', image: '/Loot/Common/Loot 6.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_7', name: 'Ancient Mask', image: '/Loot/Common/Loot 7.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_8', name: 'Crystal Shard', image: '/Loot/Common/Loot 8.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_9', name: 'Stone Tablet', image: '/Loot/Common/Loot 9.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_10', name: 'Vision Crystal', image: '/Loot/Common/Loot 10.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_11', name: 'Storm Charm', image: '/Loot/Common/Loot 11.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_12', name: 'Wind Amulet', image: '/Loot/Common/Loot 12.png', rarity: 'common', type: 'collectible' },
      { id: 'loot_c_13', name: 'Dream Sphere', image: '/Loot/Common/Loot 13.png', rarity: 'common', type: 'collectible' }
    ],
    uncommon: [
      { id: 'loot_u_1', name: 'Shadow Blades', image: '/Loot/Uncommon/Loot 1.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_2', name: 'Crystal Staff', image: '/Loot/Uncommon/Loot 2.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_3', name: 'Frost Axe', image: '/Loot/Uncommon/Loot 3.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_4', name: 'Golden Sword', image: '/Loot/Uncommon/Loot 4.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_5', name: 'Ancient Spear', image: '/Loot/Uncommon/Loot 5.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_7', name: 'War Hammer', image: '/Loot/Uncommon/Loot 7.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_8', name: 'Steam Cannon', image: '/Loot/Uncommon/Loot 8.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_9', name: 'Venom Whip', image: '/Loot/Uncommon/Loot 9.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_10', name: 'Cursed Mace', image: '/Loot/Uncommon/Loot 10.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_11', name: 'Moon Scythe', image: '/Loot/Uncommon/Loot 11.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_12', name: 'Sky Wings', image: '/Loot/Uncommon/Loot 12.png', rarity: 'uncommon', type: 'accessory' },
      { id: 'loot_u_13', name: 'Time Crystal', image: '/Loot/Uncommon/Loot 13.png', rarity: 'uncommon', type: 'accessory' }
    ],
    rare: [
      { id: 'loot_r_1', name: 'Elemental Staff', image: '/Loot/Rare/Loot 1.png', rarity: 'rare', type: 'weapon' },
      { id: 'loot_r_2', name: 'Storm Orb', image: '/Loot/Rare/Loot 2.png', rarity: 'rare', type: 'artifact' },
      { id: 'loot_r_3', name: 'Ancient Tome', image: '/Loot/Rare/Loot 3.png', rarity: 'rare', type: 'artifact' },
      { id: 'loot_r_4', name: 'Shadow Cube', image: '/Loot/Rare/Loot 4.png', rarity: 'rare', type: 'artifact' },
      { id: 'loot_r_5', name: 'Crown of Thorns', image: '/Loot/Rare/Loot 5.png', rarity: 'rare', type: 'accessory' },
      { id: 'loot_r_6', name: 'Twin Daggers', image: '/Loot/Rare/Loot 6.png', rarity: 'rare', type: 'weapon' },
      { id: 'loot_r_7', name: 'Crossed Swords', image: '/Loot/Rare/Loot 7.png', rarity: 'rare', type: 'weapon' },
      { id: 'loot_r_8', name: 'Mystic Sphere', image: '/Loot/Rare/Loot 8.png', rarity: 'rare', type: 'artifact' }
    ],
    epic: [
      { id: 'loot_e_1', name: 'Legendary Axe', image: '/Loot/Epic/Loot 1.png', rarity: 'epic', type: 'weapon' },
      { id: 'loot_e_2', name: 'Dragon Chain', image: '/Loot/Epic/Loot 2.png', rarity: 'epic', type: 'accessory' },
      { id: 'loot_e_3', name: 'Rose Blade', image: '/Loot/Epic/Loot 3.png', rarity: 'epic', type: 'weapon' }
    ],
    legendary: [
      { id: 'loot_l_1', name: 'Divine Hammer', image: '/Loot/Legendary/Loot 1.png', rarity: 'legendary', type: 'weapon' },
      { id: 'loot_l_2', name: 'Crystal Staff of Power', image: '/Loot/Legendary/Loot 2.png', rarity: 'legendary', type: 'artifact' }
    ]
  };

  // Consumables (rarer in loot boxes)
  const CONSUMABLES = [
    { id: 'bomb', name: 'Explosion Bomb', image: '/Consumables/Bomb.png', price: 8, effect: 'doubles_next_xp' },
    { id: 'food', name: 'Energy Food', image: '/Consumables/Food.png', price: 5, effect: 'restores_energy' },
    { id: 'health', name: 'Health Potion', image: '/Consumables/Health.png', price: 6, effect: 'heals_avatar' },
    { id: 'mana', name: 'Mana Potion', image: '/Consumables/Mana.png', price: 6, effect: 'restores_mana' },
    { id: 'scroll', name: 'Wisdom Scroll', image: '/Consumables/Scroll.png', price: 10, effect: 'grants_xp_bonus' },
    { id: 'speed', name: 'Speed Potion', image: '/Consumables/Speed.png', price: 7, effect: 'increases_speed' },
    { id: 'stealth', name: 'Stealth Elixir', image: '/Consumables/Stealth.png', price: 9, effect: 'grants_stealth' },
    { id: 'time', name: 'Time Hourglass', image: '/Consumables/Time.png', price: 12, effect: 'extends_time' },
    { id: 'xp', name: 'XP Crystal', image: '/Consumables/XP.png', price: 15, effect: 'instant_xp' }
  ];

  // Themed Avatar Sets (from uploaded images)
  const AVATAR_SETS = {
    pirate: {
      name: 'Pirate Adventure',
      female: Array.from({length: 4}, (_, i) => ({
        id: `pirate_f_${i+1}`,
        name: `Pirate Captain F`,
        level: i + 1,
        image: `/shop/Themed/Pirate/F Level ${i + 1}.png`,
        price: 20 + (i * 10),
        base: 'Pirate F'
      })),
      male: Array.from({length: 4}, (_, i) => ({
        id: `pirate_m_${i+1}`,
        name: `Pirate Captain M`,
        level: i + 1,
        image: `/shop/Themed/Pirate/M Level ${i + 1}.png`,
        price: 20 + (i * 10),
        base: 'Pirate M'
      })),
      pets: Array.from({length: 3}, (_, i) => ({
        id: `pirate_pet_${i+1}`,
        name: `Pirate Pet ${i + 1}`,
        image: `/shop/Themed/Pirate/Pet ${i + 1}.png`,
        price: 25 + (i * 5),
        type: 'pirate'
      }))
    },
    farm: {
      name: 'Farm Life',
      female: Array.from({length: 4}, (_, i) => ({
        id: `farm_f_${i+1}`,
        name: `Farmer F`,
        level: i + 1,
        image: `/shop/Themed/Farm/F Level ${i + 1}.png`,
        price: 20 + (i * 10),
        base: 'Farm F'
      })),
      male: Array.from({length: 4}, (_, i) => ({
        id: `farm_m_${i+1}`,
        name: `Farmer M`,
        level: i + 1,
        image: `/shop/Themed/Farm/M Level ${i + 1}.png`,
        price: 20 + (i * 10),
        base: 'Farm M'
      })),
      pets: Array.from({length: 3}, (_, i) => ({
        id: `farm_pet_${i+1}`,
        name: `Farm Pet ${i + 1}`,
        image: `/shop/Themed/Farm/Pet ${i + 1}.png`,
        price: 25 + (i * 5),
        type: 'farm'
      }))
    },
    robot: {
      name: 'Robot Future',
      female: Array.from({length: 4}, (_, i) => ({
        id: `robot_f_${i+1}`,
        name: `Robot F`,
        level: i + 1,
        image: `/shop/Themed/Robot/F Level ${i + 1}.png`,
        price: 25 + (i * 12),
        base: 'Robot F'
      })),
      male: Array.from({length: 4}, (_, i) => ({
        id: `robot_m_${i+1}`,
        name: `Robot M`,
        level: i + 1,
        image: `/shop/Themed/Robot/M Level ${i + 1}.png`,
        price: 25 + (i * 12),
        base: 'Robot M'
      })),
      pets: Array.from({length: 2}, (_, i) => ({
        id: `robot_pet_${i+1}`,
        name: `Robot Pet ${i + 1}`,
        image: `/shop/Themed/Robot/Pet ${i + 1}.png`,
        price: 30 + (i * 8),
        type: 'robot'
      }))
    }
  };

  // Loot Boxes
  const LOOT_BOXES = [
    {
      id: 'basic_box',
      name: 'Basic Loot Box',
      description: 'Contains 3 random items',
      image: '📦',
      price: 25,
      contents: { count: 3, guaranteedRare: false }
    },
    {
      id: 'premium_box',
      name: 'Premium Loot Box',
      description: 'Contains 5 items with guaranteed rare+',
      image: '✨',
      price: 50,
      contents: { count: 5, guaranteedRare: true }
    },
    {
      id: 'legendary_box',
      name: 'Legendary Loot Box',
      description: 'Contains 3 rare+ items with chance of legendary',
      image: '🏆',
      price: 100,
      contents: { count: 3, guaranteedRare: true, legendaryChance: true }
    }
  ];

  // Default teacher rewards
  const DEFAULT_TEACHER_REWARDS = [
    { id: 'tech_time', name: 'Technology Time', description: '10 minutes of educational technology', price: 15, category: 'privileges', icon: '💻' },
    { id: 'move_seat', name: 'Move Seat for a Day', description: 'Choose where to sit for one day', price: 10, category: 'privileges', icon: '🪑' },
    { id: 'lollies', name: 'Sweet Treat', description: 'A special sweet treat', price: 8, category: 'treats', icon: '🍭' },
    { id: 'homework_pass', name: 'Homework Pass', description: 'Skip one homework assignment', price: 25, category: 'privileges', icon: '📝' },
    { id: 'line_leader', name: 'Line Leader', description: 'Be the line leader for a week', price: 12, category: 'privileges', icon: '👑' },
    { id: 'extra_play', name: 'Extra Playtime', description: '5 minutes extra recess', price: 18, category: 'privileges', icon: '⚽' },
    { id: 'teacher_helper', name: 'Teacher Helper', description: 'Be the teacher\'s special helper for a day', price: 20, category: 'privileges', icon: '🌟' },
    { id: 'free_draw', name: 'Free Drawing Time', description: '15 minutes of free drawing', price: 12, category: 'activities', icon: '🎨' }
  ];

  // Initialize teacher rewards and featured item
  useEffect(() => {
    setTeacherRewards(DEFAULT_TEACHER_REWARDS);
    generateDailyFeaturedItem();
  }, []);

  // Generate daily featured item
  const generateDailyFeaturedItem = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`featuredItem_${today}`);
    
    if (stored) {
      setFeaturedItem(JSON.parse(stored));
    } else {
      // Combine all possible items for featured selection
      const allItems = [
        ...CONSUMABLES,
        ...Object.values(AVATAR_SETS).flatMap(set => [...set.female, ...set.male, ...set.pets]),
        ...LOOT_BOXES
      ];
      
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      const featured = {
        ...randomItem,
        originalPrice: randomItem.price,
        price: Math.max(1, Math.floor(randomItem.price * 0.7)), // 30% discount
        discount: 30
      };
      
      setFeaturedItem(featured);
      localStorage.setItem(`featuredItem_${today}`, JSON.stringify(featured));
    }
  };

  // Calculate coins for a student
  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  // Check if student can afford an item
  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  // Generate loot box rewards with proper rarity distribution
  const generateLootBoxRewards = (lootBox) => {
    const rewards = [];
    const { count, guaranteedRare, legendaryChance } = lootBox.contents;

    for (let i = 0; i < count; i++) {
      let rarity = 'common';
      const roll = Math.random() * 100;

      // Adjust chances for consumables (much rarer)
      const isConsumable = Math.random() < 0.1; // 10% chance for consumable
      
      if (legendaryChance && roll <= 5) rarity = 'legendary';
      else if (roll <= 10) rarity = 'epic';
      else if (roll <= 25) rarity = 'rare';
      else if (roll <= 45) rarity = 'uncommon';
      else rarity = 'common';

      // Guarantee at least one rare+ for premium boxes
      if (guaranteedRare && i === 0 && ['common', 'uncommon'].includes(rarity)) {
        rarity = 'rare';
      }

      let item;
      if (isConsumable && i > 0) { // Don't make first item consumable in guaranteed rare boxes
        item = CONSUMABLES[Math.floor(Math.random() * CONSUMABLES.length)];
      } else {
        const availableItems = LOOT_ITEMS[rarity] || LOOT_ITEMS.common;
        item = availableItems[Math.floor(Math.random() * availableItems.length)];
      }

      rewards.push({
        ...item,
        id: `${item.id}_${Date.now()}_${i}`,
        obtainedAt: new Date().toISOString()
      });
    }

    return rewards;
  };

  // Handle purchase
  const handlePurchase = (item) => {
    if (!selectedStudent) {
      showToast('Please select a student first!', 'error');
      return;
    }

    const price = item.price;
    const currentCoins = calculateCoins(selectedStudent);

    if (!canAfford(selectedStudent, price)) {
      showToast(`${selectedStudent.firstName} needs ${price} coins but only has ${currentCoins}!`, 'error');
      return;
    }

    // Handle different item types
    let purchaseData = {};
    
    if (item.id?.includes('box')) {
      // Loot box purchase
      const rewards = generateLootBoxRewards(item);
      purchaseData = {
        inventory: [...(selectedStudent.inventory || []), ...rewards],
        purchaseType: 'lootbox',
        rewards: rewards.map(r => r.name).join(', ')
      };
      showToast(`${selectedStudent.firstName} opened ${item.name} and got: ${purchaseData.rewards}!`);
    } else if (item.effect || CONSUMABLES.find(c => c.id === item.id)) {
      // Consumable purchase
      purchaseData = {
        inventory: [...(selectedStudent.inventory || []), { ...item, obtainedAt: new Date().toISOString() }],
        purchaseType: 'consumable'
      };
      showToast(`${selectedStudent.firstName} bought ${item.name}!`);
    } else if (item.base || item.type) {
      // Avatar or pet purchase
      if (item.base) {
        purchaseData = {
          ownedAvatars: [...(selectedStudent.ownedAvatars || []), item.base],
          purchaseType: 'avatar'
        };
      } else {
        purchaseData = {
          ownedPets: [...(selectedStudent.ownedPets || []), item],
          purchaseType: 'pet'
        };
      }
      showToast(`${selectedStudent.firstName} unlocked ${item.name}!`);
    } else {
      // Teacher reward purchase
      purchaseData = {
        rewardsPurchased: [...(selectedStudent.rewardsPurchased || []), { ...item, purchasedAt: new Date().toISOString() }],
        purchaseType: 'reward'
      };
      showToast(`${selectedStudent.firstName} redeemed ${item.name}!`);
    }

    // Update student
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id !== selectedStudent.id) return student;

        return {
          ...student,
          coinsSpent: (student.coinsSpent || 0) + price,
          ...purchaseData,
          logs: [
            ...(student.logs || []),
            {
              type: 'purchase',
              amount: -price,
              date: new Date().toISOString(),
              source: 'shop_purchase',
              item: item.name
            }
          ]
        };
      });

      saveStudentsToFirebase?.(updatedStudents);
      return updatedStudents;
    });

    // Update selected student
    setSelectedStudent(prev => ({
      ...prev,
      coinsSpent: (prev.coinsSpent || 0) + price,
      ...purchaseData
    }));

    setShowPurchaseModal(null);
  };

  // Handle avatar/pet switching
  const handleSwitchAvatar = (avatarBase) => {
    if (!selectedStudent) return;

    const avatarLevel = selectedStudent.avatarLevel || 1;
    const newAvatar = `/avatars/${avatarBase.replaceAll(" ", "%20")}/Level%20${avatarLevel}.png`;

    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id !== selectedStudent.id) return student;
        return { ...student, avatarBase, avatar: newAvatar };
      });
      saveStudentsToFirebase?.(updatedStudents);
      return updatedStudents;
    });

    setSelectedStudent(prev => ({ ...prev, avatarBase, avatar: newAvatar }));
    showToast(`${selectedStudent.firstName} switched to ${avatarBase}!`);
  };

  const handleSwitchPet = (pet) => {
    if (!selectedStudent) return;

    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id !== selectedStudent.id) return student;
        return { ...student, pet: { ...pet, name: pet.name || selectedStudent.pet?.name || 'Companion' } };
      });
      saveStudentsToFirebase?.(updatedStudents);
      return updatedStudents;
    });

    setSelectedStudent(prev => ({ ...prev, pet: { ...pet, name: pet.name || prev.pet?.name || 'Companion' } }));
    showToast(`${selectedStudent.firstName} switched pets!`);
  };

  // Teacher reward management
  const handleAddReward = () => {
    if (!newReward.name.trim()) return;

    const reward = {
      id: `reward_${Date.now()}`,
      ...newReward,
      isCustom: true
    };

    setTeacherRewards(prev => [...prev, reward]);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showToast('Reward added successfully!');
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward(reward);
  };

  const handleUpdateReward = () => {
    if (!editingReward) return;

    setTeacherRewards(prev => prev.map(r => 
      r.id === editingReward.id ? { ...newReward, id: editingReward.id } : r
    ));
    setEditingReward(null);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showToast('Reward updated successfully!');
  };

  const handleDeleteReward = (rewardId) => {
    setTeacherRewards(prev => prev.filter(r => r.id !== rewardId));
    showToast('Reward deleted!');
  };

  // Get avatar preview at student's level
  const getAvatarPreview = (avatarBase, studentLevel) => {
    const level = Math.min(studentLevel || 1, 4);
    return `/avatars/${avatarBase.replaceAll(" ", "%20")}/Level%20${level}.png`;
  };

  // Currency display component
  const CurrencyDisplay = ({ student }) => {
    const coins = calculateCoins(student);
    const coinsSpent = student?.coinsSpent || 0;
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;

    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-yellow-800 font-bold text-lg">💰 Available Coins</span>
          <span className="text-2xl font-bold text-yellow-900">{coins}</span>
        </div>
        <div className="text-sm text-yellow-700 mt-1">
          From XP: {xpCoins} • Bonus: {bonusCoins} • Spent: {coinsSpent}
        </div>
      </div>
    );
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Classroom Champions Shop</h2>
        <p className="text-gray-700">Add students to your class to start shopping!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-xl">
        <h2 className="text-4xl font-bold mb-2">🏪 Classroom Champions Shop</h2>
        <p className="text-lg opacity-90">Spend your coins on amazing rewards and epic adventures!</p>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4">👤 Select Student to Shop</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {students.map(student => {
            const coins = calculateCoins(student);
            const isSelected = selectedStudent?.id === student.id;
            
            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {student.avatar && (
                    <img src={student.avatar} alt={student.firstName} className="w-12 h-12 rounded-full" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{student.firstName}</div>
                    <div className="text-sm text-yellow-600 font-medium">💰 {coins} coins</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedStudent && <CurrencyDisplay student={selectedStudent} />}
      </div>

      {selectedStudent && (
        <>
          {/* Featured Daily Item */}
          {featuredItem && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">🌟 Daily Featured Item</h3>
                  <p className="text-lg opacity-90">{featuredItem.discount}% OFF Today Only!</p>
                </div>
                <div className="text-center">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    {featuredItem.image ? (
                      <img src={featuredItem.image} alt={featuredItem.name} className="w-16 h-16 mx-auto" />
                    ) : (
                      <div className="text-4xl">{featuredItem.image || '🎁'}</div>
                    )}
                    <div className="font-bold mt-2">{featuredItem.name}</div>
                    <div className="flex items-center justify-center space-x-2 mt-1">
                      <span className="line-through text-sm opacity-75">{featuredItem.originalPrice}</span>
                      <span className="font-bold text-lg">{featuredItem.price} 💰</span>
                    </div>
                    <button
                      onClick={() => setShowPurchaseModal(featuredItem)}
                      disabled={!canAfford(selectedStudent, featuredItem.price)}
                      className="mt-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveSection('champions')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeSection === 'champions'
                  ? 'bg-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              ⚔️ Champions Store
            </button>
            <button
              onClick={() => setActiveSection('rewards')}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeSection === 'rewards'
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-white text-green-600 border-2 border-green-200 hover:border-green-400'
              }`}
            >
              🎁 Classroom Rewards
            </button>
          </div>

          {/* Champions Store Section */}
          {activeSection === 'champions' && (
            <div className="space-y-6">
              {/* Category Navigation */}
              <div className="flex justify-center space-x-2 flex-wrap">
                {[
                  { id: 'avatars', name: 'Avatars', icon: '👤' },
                  { id: 'pets', name: 'Pets', icon: '🐾' },
                  { id: 'consumables', name: 'Power-ups', icon: '⚡' },
                  { id: 'lootboxes', name: 'Loot Boxes', icon: '📦' },
                  { id: 'inventory', name: 'My Items', icon: '🎒' }
                ].map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveChampsCategory(category.id)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeChampsCategory === category.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>

              {/* Avatars Category */}
              {activeChampsCategory === 'avatars' && (
                <div className="space-y-8">
                  {Object.entries(AVATAR_SETS).map(([setKey, avatarSet]) => (
                    <div key={setKey} className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                        {avatarSet.name} Collection
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Female Avatars */}
                        <div>
                          <h4 className="text-lg font-semibold text-pink-600 mb-3">Female Characters</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {avatarSet.female.map(avatar => {
                              const isOwned = selectedStudent.ownedAvatars?.includes(avatar.base);
                              const studentLevel = selectedStudent.avatarLevel || 1;
                              const previewImage = getAvatarPreview(avatar.base, studentLevel);
                              
                              return (
                                <div key={avatar.id} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <img 
                                    src={avatar.level === 1 ? avatar.image : previewImage} 
                                    alt={avatar.name} 
                                    className="w-16 h-16 mx-auto rounded-lg mb-2"
                                  />
                                  <div className="text-sm font-semibold">{avatar.name}</div>
                                  <div className="text-xs text-gray-600 mb-2">
                                    Preview at Level {studentLevel}
                                  </div>
                                  {isOwned ? (
                                    <button
                                      onClick={() => handleSwitchAvatar(avatar.base)}
                                      className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                    >
                                      Use Avatar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setShowPurchaseModal(avatar)}
                                      disabled={!canAfford(selectedStudent, avatar.price)}
                                      className="w-full px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:bg-gray-400"
                                    >
                                      {avatar.price} 💰
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Male Avatars */}
                        <div>
                          <h4 className="text-lg font-semibold text-blue-600 mb-3">Male Characters</h4>
                          <div className="grid grid-cols-2 gap-3">
                            {avatarSet.male.map(avatar => {
                              const isOwned = selectedStudent.ownedAvatars?.includes(avatar.base);
                              const studentLevel = selectedStudent.avatarLevel || 1;
                              const previewImage = getAvatarPreview(avatar.base, studentLevel);
                              
                              return (
                                <div key={avatar.id} className="bg-gray-50 rounded-lg p-3 text-center">
                                  <img 
                                    src={avatar.level === 1 ? avatar.image : previewImage} 
                                    alt={avatar.name} 
                                    className="w-16 h-16 mx-auto rounded-lg mb-2"
                                  />
                                  <div className="text-sm font-semibold">{avatar.name}</div>
                                  <div className="text-xs text-gray-600 mb-2">
                                    Preview at Level {studentLevel}
                                  </div>
                                  {isOwned ? (
                                    <button
                                      onClick={() => handleSwitchAvatar(avatar.base)}
                                      className="w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                    >
                                      Use Avatar
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setShowPurchaseModal(avatar)}
                                      disabled={!canAfford(selectedStudent, avatar.price)}
                                      className="w-full px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:bg-gray-400"
                                    >
                                      {avatar.price} 💰
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Pets for this set */}
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-green-600 mb-3">Companion Pets</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {avatarSet.pets.map(pet => {
                            const isOwned = selectedStudent.ownedPets?.some(p => p.id === pet.id);
                            
                            return (
                              <div key={pet.id} className="bg-gray-50 rounded-lg p-3 text-center">
                                <img src={pet.image} alt={pet.name} className="w-16 h-16 mx-auto rounded-lg mb-2" />
                                <div className="text-sm font-semibold">{pet.name}</div>
                                {isOwned ? (
                                  <button
                                    onClick={() => handleSwitchPet(pet)}
                                    className="w-full px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 mt-2"
                                  >
                                    Use Pet
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setShowPurchaseModal(pet)}
                                    disabled={!canAfford(selectedStudent, pet.price)}
                                    className="w-full px-3 py-1 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 disabled:bg-gray-400 mt-2"
                                  >
                                    {pet.price} 💰
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consumables Category */}
              {activeChampsCategory === 'consumables' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">⚡ Power-up Consumables</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {CONSUMABLES.map(consumable => (
                      <div key={consumable.id} className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4 text-center hover:shadow-lg transition-all">
                        <img src={consumable.image} alt={consumable.name} className="w-16 h-16 mx-auto mb-3" />
                        <div className="font-semibold text-gray-800 mb-1">{consumable.name}</div>
                        <div className="text-xs text-gray-600 mb-3">{consumable.effect.replace(/_/g, ' ')}</div>
                        <button
                          onClick={() => setShowPurchaseModal(consumable)}
                          disabled={!canAfford(selectedStudent, consumable.price)}
                          className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 font-semibold"
                        >
                          {consumable.price} 💰
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loot Boxes Category */}
              {activeChampsCategory === 'lootboxes' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📦 Treasure Loot Boxes</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {LOOT_BOXES.map(box => (
                      <div key={box.id} className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 text-center hover:shadow-lg transition-all">
                        <div className="text-6xl mb-4">{box.image}</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">{box.name}</h4>
                        <p className="text-gray-600 mb-4">{box.description}</p>
                        <div className="text-2xl font-bold text-purple-600 mb-4">{box.price} 💰</div>
                        <button
                          onClick={() => setShowPurchaseModal(box)}
                          disabled={!canAfford(selectedStudent, box.price)}
                          className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 font-bold"
                        >
                          Open Box
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Category */}
              {activeChampsCategory === 'inventory' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎒 My Inventory</h3>
                  
                  {/* Owned Avatars */}
                  {selectedStudent.ownedAvatars?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-blue-600 mb-4">🎭 Owned Avatars</h4>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {selectedStudent.ownedAvatars.map(avatarBase => {
                          const studentLevel = selectedStudent.avatarLevel || 1;
                          const previewImage = getAvatarPreview(avatarBase, studentLevel);
                          const isActive = selectedStudent.avatarBase === avatarBase;
                          
                          return (
                            <div key={avatarBase} className={`text-center ${isActive ? 'ring-2 ring-blue-500' : ''}`}>
                              <img 
                                src={previewImage} 
                                alt={avatarBase} 
                                className="w-16 h-16 mx-auto rounded-lg mb-2"
                              />
                              <div className="text-xs font-semibold mb-1">{avatarBase}</div>
                              {!isActive && (
                                <button
                                  onClick={() => handleSwitchAvatar(avatarBase)}
                                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                >
                                  Use
                                </button>
                              )}
                              {isActive && (
                                <div className="text-xs text-blue-600 font-bold">Active</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Owned Pets */}
                  {selectedStudent.ownedPets?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-green-600 mb-4">🐾 Owned Pets</h4>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {selectedStudent.ownedPets.map(pet => {
                          const isActive = selectedStudent.pet?.id === pet.id;
                          
                          return (
                            <div key={pet.id} className={`text-center ${isActive ? 'ring-2 ring-green-500' : ''}`}>
                              <img src={pet.image} alt={pet.name} className="w-16 h-16 mx-auto rounded-lg mb-2" />
                              <div className="text-xs font-semibold mb-1">{pet.name}</div>
                              {!isActive && (
                                <button
                                  onClick={() => handleSwitchPet(pet)}
                                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                                >
                                  Use
                                </button>
                              )}
                              {isActive && (
                                <div className="text-xs text-green-600 font-bold">Active</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inventory Items */}
                  <div>
                    <h4 className="text-lg font-semibold text-purple-600 mb-4">🎁 Collection Items</h4>
                    {(selectedStudent.inventory || []).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📦</div>
                        <p>No items in inventory yet!</p>
                        <p className="text-sm">Purchase items or open loot boxes to fill your collection.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {(selectedStudent.inventory || []).map((item, index) => {
                          const rarity = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
                          return (
                            <div key={index} className={`${rarity.bgColor} border-2 ${rarity.borderColor} rounded-lg p-3 text-center ${rarity.glowColor}`}>
                              <img src={item.image} alt={item.name} className="w-12 h-12 mx-auto mb-2" />
                              <div className="text-xs font-semibold text-gray-800">{item.name}</div>
                              <div className={`text-xs ${rarity.textColor} font-semibold`}>{rarity.name}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Classroom Rewards Section */}
          {activeSection === 'rewards' && (
            <div className="space-y-6">
              {/* Teacher Controls */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">🎁 Classroom Rewards</h3>
                  <button
                    onClick={() => setShowRewardEditor(!showRewardEditor)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    {showRewardEditor ? 'Hide Editor' : 'Edit Rewards'}
                  </button>
                </div>

                {/* Reward Editor */}
                {showRewardEditor && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-green-800 mb-4">
                      {editingReward ? 'Edit Reward' : 'Add New Reward'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Reward name"
                        value={newReward.name}
                        onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={newReward.description}
                        onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Price in coins"
                        value={newReward.price}
                        onChange={(e) => setNewReward(prev => ({ ...prev, price: parseInt(e.target.value) || 5 }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={newReward.category}
                        onChange={(e) => setNewReward(prev => ({ ...prev, category: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="privileges">Privileges</option>
                        <option value="treats">Treats</option>
                        <option value="activities">Activities</option>
                        <option value="supplies">Supplies</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={editingReward ? handleUpdateReward : handleAddReward}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                      >
                        {editingReward ? 'Update' : 'Add'} Reward
                      </button>
                      {editingReward && (
                        <button
                          onClick={() => {
                            setEditingReward(null);
                            setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Rewards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teacherRewards.map(reward => (
                    <div key={reward.id} className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-2xl">{reward.icon || '🎁'}</div>
                        {showRewardEditor && reward.isCustom && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditReward(reward)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteReward(reward.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-800 mb-1">{reward.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-600">{reward.price} 💰</span>
                        <button
                          onClick={() => setShowPurchaseModal(reward)}
                          disabled={!canAfford(selectedStudent, reward.price)}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 text-sm font-semibold"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Confirm Purchase
            </h2>
            
            <div className="text-center mb-6">
              {showPurchaseModal.image ? (
                <img 
                  src={showPurchaseModal.image} 
                  alt={showPurchaseModal.name} 
                  className="w-20 h-20 mx-auto mb-4"
                />
              ) : (
                <div className="text-6xl mb-4">{showPurchaseModal.image || '🎁'}</div>
              )}
              <h3 className="text-xl font-bold text-gray-800">{showPurchaseModal.name}</h3>
              {showPurchaseModal.description && (
                <p className="text-gray-600 mt-2">{showPurchaseModal.description}</p>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Price:</span>
                  <span className="text-xl font-bold text-yellow-600">
                    {showPurchaseModal.price} 💰
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Available:</span>
                  <span className="font-semibold">
                    {calculateCoins(selectedStudent)} 💰
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(showPurchaseModal)}
                disabled={!canAfford(selectedStudent, showPurchaseModal.price)}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400"
              >
                {showPurchaseModal.id?.includes('box') ? 'Open Box' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;