// ShopTab.js - Enhanced Shop with Hover Preview, Firebase Rewards, and Pet Renaming
import React, { useState, useEffect } from 'react';

const ShopTab = ({ 
  students, 
  setStudents, 
  showToast,
  saveStudentsToFirebase,
  currentClassId,
  userData,
  user,
  firestore
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
  
  // NEW: Hover preview state
  const [hoverPreview, setHoverPreview] = useState({ show: false, image: '', name: '', x: 0, y: 0 });
  
  // NEW: Pet renaming state
  const [showPetRenameModal, setShowPetRenameModal] = useState(null);
  const [newPetName, setNewPetName] = useState('');

  // Constants
  const COINS_PER_XP = 5;

  // Existing pets from the game (to be added to shop)
  const EXISTING_PETS = [
    "Alchemist", "Barbarian", "Bard", "Beastmaster", "Cleric", "Crystal Knight",
    "Crystal Sage", "Dream", "Druid", "Engineer", "Frost Mage", "Illusionist",
    "Knight", "Lightning", "Monk", "Necromancer", "Orc", "Paladin", "Rogue",
    "Stealth", "Time Knight", "Warrior", "Wizard"
  ].map((pet, index) => ({
    id: `classic_pet_${pet.toLowerCase().replace(' ', '_')}`,
    name: `${pet} Companion`,
    image: `/Pets/${pet}.png`,
    price: 15 + (index % 5) * 3, // Varied pricing 15-27 coins
    type: 'classic'
  }));

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
      { id: 'loot_c_1', name: 'Basic Sword', image: '/Loot/Common/Loot 1.png', rarity: 'common', type: 'weapon' },
      { id: 'loot_c_2', name: 'Iron Shield', image: '/Loot/Common/Loot 2.png', rarity: 'common', type: 'armor' },
      { id: 'loot_c_3', name: 'Health Vial', image: '/Loot/Common/Loot 3.png', rarity: 'common', type: 'consumable' }
    ],
    uncommon: [
      { id: 'loot_u_1', name: 'Silver Blade', image: '/Loot/Uncommon/Loot 1.png', rarity: 'uncommon', type: 'weapon' },
      { id: 'loot_u_2', name: 'Mage Robe', image: '/Loot/Uncommon/Loot 2.png', rarity: 'uncommon', type: 'armor' }
    ],
    rare: [
      { id: 'loot_r_1', name: 'Enchanted Bow', image: '/Loot/Rare/Loot 1.png', rarity: 'rare', type: 'weapon' },
      { id: 'loot_r_2', name: 'Power Crystal', image: '/Loot/Rare/Loot 2.png', rarity: 'rare', type: 'artifact' }
    ],
    epic: [
      { id: 'loot_e_1', name: 'Dragon Sword', image: '/Loot/Epic/Loot 1.png', rarity: 'epic', type: 'weapon' },
      { id: 'loot_e_2', name: 'Phoenix Armor', image: '/Loot/Epic/Loot 2.png', rarity: 'epic', type: 'armor' }
    ],
    legendary: [
      { id: 'loot_l_1', name: 'Excalibur', image: '/Loot/Legendary/Loot 1.png', rarity: 'legendary', type: 'weapon' },
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

  // UPDATED: Themed Avatar Sets - Only Level 1 avatars in shop, higher levels for featured/loot
  const AVATAR_SETS = {
    pirate: {
      name: 'Pirate Adventure',
      female: [{
        id: 'pirate_f_1',
        name: 'Pirate Captain F',
        level: 1,
        image: '/shop/Themed/Pirate/F Level 1.png',
        price: 20,
        base: 'Pirate F'
      }],
      male: [{
        id: 'pirate_m_1',
        name: 'Pirate Captain M',
        level: 1,
        image: '/shop/Themed/Pirate/M Level 1.png',
        price: 20,
        base: 'Pirate M'
      }],
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
      female: [{
        id: 'farm_f_1',
        name: 'Farmer F',
        level: 1,
        image: '/shop/Themed/Farm/F Level 1.png',
        price: 20,
        base: 'Farm F'
      }],
      male: [{
        id: 'farm_m_1',
        name: 'Farmer M',
        level: 1,
        image: '/shop/Themed/Farm/M Level 1.png',
        price: 20,
        base: 'Farm M'
      }],
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
      female: [{
        id: 'robot_f_1',
        name: 'Robot F',
        level: 1,
        image: '/shop/Themed/Robot/F Level 1.png',
        price: 25,
        base: 'Robot F'
      }],
      male: [{
        id: 'robot_m_1',
        name: 'Robot M',
        level: 1,
        image: '/shop/Themed/Robot/M Level 1.png',
        price: 25,
        base: 'Robot M'
      }],
      pets: Array.from({length: 2}, (_, i) => ({
        id: `robot_pet_${i+1}`,
        name: `Robot Pet ${i + 1}`,
        image: `/shop/Themed/Robot/Pet ${i + 1}.png`,
        price: 30 + (i * 8),
        type: 'robot'
      }))
    }
  };

  // NEW: Higher level avatars for featured shop and loot boxes
  const PREMIUM_AVATARS = [
    // Pirate Level 2-4
    ...Array.from({length: 3}, (_, i) => ({
      id: `pirate_f_${i+2}`,
      name: `Elite Pirate Captain F`,
      level: i + 2,
      image: `/shop/Themed/Pirate/F Level ${i + 2}.png`,
      price: 30 + (i * 15),
      base: 'Pirate F',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    })),
    ...Array.from({length: 3}, (_, i) => ({
      id: `pirate_m_${i+2}`,
      name: `Elite Pirate Captain M`,
      level: i + 2,
      image: `/shop/Themed/Pirate/M Level ${i + 2}.png`,
      price: 30 + (i * 15),
      base: 'Pirate M',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    })),
    // Farm Level 2-4
    ...Array.from({length: 3}, (_, i) => ({
      id: `farm_f_${i+2}`,
      name: `Master Farmer F`,
      level: i + 2,
      image: `/shop/Themed/Farm/F Level ${i + 2}.png`,
      price: 30 + (i * 15),
      base: 'Farm F',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    })),
    ...Array.from({length: 3}, (_, i) => ({
      id: `farm_m_${i+2}`,
      name: `Master Farmer M`,
      level: i + 2,
      image: `/shop/Themed/Farm/M Level ${i + 2}.png`,
      price: 30 + (i * 15),
      base: 'Farm M',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    })),
    // Robot Level 2-4
    ...Array.from({length: 3}, (_, i) => ({
      id: `robot_f_${i+2}`,
      name: `Advanced Robot F`,
      level: i + 2,
      image: `/shop/Themed/Robot/F Level ${i + 2}.png`,
      price: 35 + (i * 18),
      base: 'Robot F',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    })),
    ...Array.from({length: 3}, (_, i) => ({
      id: `robot_m_${i+2}`,
      name: `Advanced Robot M`,
      level: i + 2,
      image: `/shop/Themed/Robot/M Level ${i + 2}.png`,
      price: 35 + (i * 18),
      base: 'Robot M',
      rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
    }))
  ];

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

  // Default teacher rewards (now deletable)
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

  // NEW: Firebase teacher rewards functions
  const saveTeacherRewardsToFirebase = async (rewards) => {
    if (!user || !currentClassId || !firestore) return;

    try {
      const { doc, getDoc, setDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                teacherRewards: rewards,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving teacher rewards:", error);
    }
  };

  // Load teacher rewards from Firebase
  const loadTeacherRewardsFromFirebase = async () => {
    if (!user || !currentClassId || !firestore) return;

    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const currentClass = data.classes?.find(cls => cls.id === currentClassId);
        
        if (currentClass?.teacherRewards) {
          setTeacherRewards(currentClass.teacherRewards);
        } else {
          // Initialize with defaults if no saved rewards
          setTeacherRewards(DEFAULT_TEACHER_REWARDS);
          saveTeacherRewardsToFirebase(DEFAULT_TEACHER_REWARDS);
        }
      }
    } catch (error) {
      console.error("Error loading teacher rewards:", error);
      setTeacherRewards(DEFAULT_TEACHER_REWARDS);
    }
  };

  // Initialize teacher rewards and featured item
  useEffect(() => {
    loadTeacherRewardsFromFirebase();
    generateDailyFeaturedItem();
  }, [currentClassId]);

  // NEW: Hover preview handlers
  const handleMouseEnter = (e, item) => {
    if (!item.image || item.image.includes('📦') || item.image.includes('✨') || item.image.includes('🏆')) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPreview({
      show: true,
      image: item.image,
      name: item.name,
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleMouseLeave = () => {
    setHoverPreview({ show: false, image: '', name: '', x: 0, y: 0 });
  };

  // Generate daily featured item
  const generateDailyFeaturedItem = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`featuredItem_${today}`);
    
    if (stored) {
      setFeaturedItem(JSON.parse(stored));
    } else {
      // Include premium avatars in featured selection
      const allItems = [
        ...CONSUMABLES,
        ...PREMIUM_AVATARS, // Now includes higher level avatars
        ...Object.values(AVATAR_SETS).flatMap(set => [...set.pets]),
        ...EXISTING_PETS,
        ...LOOT_BOXES
      ];
      
      const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
      const featured = {
        ...randomItem,
        originalPrice: randomItem.price,
        price: Math.max(1, Math.floor(randomItem.price * 0.7)), // 30% discount
        isFeatured: true
      };
      
      setFeaturedItem(featured);
      localStorage.setItem(`featuredItem_${today}`, JSON.stringify(featured));
    }
  };

  // Helper functions
  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;
    const spent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - spent);
  };

  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  const spendCoins = (student, amount) => {
    const newCoinsSpent = (student.coinsSpent || 0) + amount;
    return { ...student, coinsSpent: newCoinsSpent };
  };

  // Purchase handlers
  const handlePurchase = (item) => {
    if (!selectedStudent || !canAfford(selectedStudent, item.price)) {
      showToast('Not enough coins!', 'error');
      return;
    }

    const updatedStudent = spendCoins(selectedStudent, item.price);
    
    // Handle different item types
    if (item.base) {
      // Avatar purchase
      const ownedAvatars = updatedStudent.ownedAvatars || [];
      if (!ownedAvatars.includes(item.base)) {
        updatedStudent.ownedAvatars = [...ownedAvatars, item.base];
      }
    } else if (item.type && item.type !== 'consumable') {
      // Pet purchase
      const ownedPets = updatedStudent.ownedPets || [];
      const newPet = {
        id: item.id,
        name: item.name,
        image: item.image,
        type: item.type,
        purchaseDate: new Date().toISOString()
      };
      updatedStudent.ownedPets = [...ownedPets, newPet];
    } else {
      // Consumable or other item
      const inventory = updatedStudent.inventory || [];
      updatedStudent.inventory = [...inventory, { ...item, purchaseDate: new Date().toISOString() }];
    }

    // Update students array
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showToast(`${item.name} purchased!`, 'success');
    setShowPurchaseModal(null);
  };

  const handleSwitchAvatar = (avatarBase) => {
    const updatedStudent = { ...selectedStudent, avatarBase };
    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    showToast('Avatar changed!', 'success');
  };

  // NEW: Pet renaming functions
  const handlePetRename = (pet) => {
    setShowPetRenameModal(pet);
    setNewPetName(pet.name);
  };

  const handlePetRenameConfirm = () => {
    if (!newPetName.trim()) return;

    const updatedStudent = { ...selectedStudent };
    const updatedPets = updatedStudent.ownedPets.map(pet => 
      pet.id === showPetRenameModal.id 
        ? { ...pet, name: newPetName.trim() }
        : pet
    );
    updatedStudent.ownedPets = updatedPets;

    const updatedStudents = students.map(s => 
      s.id === selectedStudent.id ? updatedStudent : s
    );
    
    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showToast('Pet renamed successfully!', 'success');
    setShowPetRenameModal(null);
    setNewPetName('');
  };

  // Teacher reward functions
  const handleAddReward = () => {
    if (!newReward.name.trim()) return;
    
    const reward = {
      ...newReward,
      id: `reward_${Date.now()}`,
      icon: newReward.icon || '🎁'
    };
    
    const updatedRewards = [...teacherRewards, reward];
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showToast('Reward added!');
  };

  const handleEditReward = (reward) => {
    setEditingReward(reward);
    setNewReward(reward);
    setShowRewardEditor(true);
  };

  const handleUpdateReward = () => {
    const updatedRewards = teacherRewards.map(r => 
      r.id === editingReward.id ? { ...newReward, id: editingReward.id } : r
    );
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
    setEditingReward(null);
    setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
    showToast('Reward updated successfully!');
  };

  const handleDeleteReward = (rewardId) => {
    const updatedRewards = teacherRewards.filter(r => r.id !== rewardId);
    setTeacherRewards(updatedRewards);
    saveTeacherRewardsToFirebase(updatedRewards);
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
    <div className="space-y-6 relative">
      {/* NEW: Hover Preview Overlay */}
      {hoverPreview.show && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${hoverPreview.x}px`,
            top: `${hoverPreview.y - 350}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="bg-black bg-opacity-90 rounded-2xl p-6 shadow-2xl border-4 border-yellow-400">
            <img 
              src={hoverPreview.image} 
              alt={hoverPreview.name}
              className="w-80 h-80 object-contain rounded-lg"
            />
            <div className="text-white text-center mt-4 text-xl font-bold">
              {hoverPreview.name}
            </div>
          </div>
        </div>
      )}

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
                  <img 
                    src={`/avatars/${student.avatarBase?.replaceAll(" ", "%20") || "Knight%20M"}/Level%20${student.avatarLevel || 1}.png`}
                    alt="Avatar"
                    className="w-12 h-12 rounded-lg"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{student.firstName}</div>
                    <div className="text-sm text-yellow-600 font-medium">💰 {coins} coins</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Student Currency Display */}
        {selectedStudent && (
          <div className="mt-6">
            <CurrencyDisplay student={selectedStudent} />
          </div>
        )}
      </div>

      {/* Featured Item Banner */}
      {selectedStudent && featuredItem && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">⭐ Daily Featured Deal!</h3>
              <p className="text-lg opacity-90">Limited time offer - 30% off!</p>
            </div>
            <div className="text-center bg-white/20 rounded-xl p-4 min-w-[200px]">
              {featuredItem.image && !featuredItem.image.includes('📦') ? (
                <img src={featuredItem.image} alt={featuredItem.name} className="w-16 h-16 mx-auto" />
              ) : (
                <div className="text-4xl">{featuredItem.image || '🎁'}</div>
              )}
              <div className="font-bold mt-2 text-white">{featuredItem.name}</div>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="line-through text-sm opacity-75 text-white">{featuredItem.originalPrice}</span>
                <span className="font-bold text-lg text-white bg-black/20 px-2 py-1 rounded">{featuredItem.price} 💰</span>
              </div>
              <button
                onClick={() => setShowPurchaseModal(featuredItem)}
                disabled={!canAfford(selectedStudent, featuredItem.price)}
                className="mt-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
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
      {activeSection === 'champions' && selectedStudent && (
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

          {/* Avatars Category - Only Level 1 */}
          {activeChampsCategory === 'avatars' && (
            <div className="space-y-8">
              {Object.entries(AVATAR_SETS).map(([setKey, avatarSet]) => (
                <div key={setKey} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {avatarSet.name} Collection
                  </h3>
                  <p className="text-center text-gray-600 mb-6">
                    Level 1 avatars • Higher levels available in Featured Shop & Loot Boxes
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Female Avatars */}
                    <div>
                      <h4 className="text-lg font-semibold text-pink-600 mb-3">Female Characters</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {avatarSet.female.map(avatar => {
                          const isOwned = selectedStudent.ownedAvatars?.includes(avatar.base);
                          
                          return (
                            <div 
                              key={avatar.id} 
                              className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer"
                              onMouseEnter={(e) => handleMouseEnter(e, avatar)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <img 
                                src={avatar.image} 
                                alt={avatar.name} 
                                className="w-16 h-16 mx-auto rounded-lg mb-2"
                              />
                              <div className="text-sm font-semibold">{avatar.name}</div>
                              <div className="text-xs text-gray-600 mb-2">Level 1</div>
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
                          
                          return (
                            <div 
                              key={avatar.id} 
                              className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer"
                              onMouseEnter={(e) => handleMouseEnter(e, avatar)}
                              onMouseLeave={handleMouseLeave}
                            >
                              <img 
                                src={avatar.image} 
                                alt={avatar.name} 
                                className="w-16 h-16 mx-auto rounded-lg mb-2"
                              />
                              <div className="text-sm font-semibold">{avatar.name}</div>
                              <div className="text-xs text-gray-600 mb-2">Level 1</div>
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
                </div>
              ))}
            </div>
          )}

          {/* Pets Category - Themed + Classic Pets */}
          {activeChampsCategory === 'pets' && (
            <div className="space-y-8">
              {/* Classic Pets Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  🐾 Classic Pet Companions
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Choose from 23 loyal companions to join you on your adventure!
                </p>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {EXISTING_PETS.map(pet => {
                    const isOwned = selectedStudent.ownedPets?.some(p => p.id === pet.id);
                    
                    return (
                      <div 
                        key={pet.id} 
                        className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer"
                        onMouseEnter={(e) => handleMouseEnter(e, pet)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <img src={pet.image} alt={pet.name} className="w-16 h-16 mx-auto rounded-lg mb-2" />
                        <div className="text-sm font-semibold">{pet.name}</div>
                        {isOwned ? (
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs mt-2">
                            Owned ✓
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowPurchaseModal(pet)}
                            disabled={!canAfford(selectedStudent, pet.price)}
                            className="w-full px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-400 mt-2"
                          >
                            {pet.price} 💰
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Themed Pets */}
              {Object.entries(AVATAR_SETS).map(([setKey, avatarSet]) => (
                <div key={setKey} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                    {avatarSet.name} Pets
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {avatarSet.pets.map(pet => {
                      const isOwned = selectedStudent.ownedPets?.some(p => p.id === pet.id);
                      
                      return (
                        <div 
                          key={pet.id} 
                          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer"
                          onMouseEnter={(e) => handleMouseEnter(e, pet)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <img src={pet.image} alt={pet.name} className="w-16 h-16 mx-auto rounded-lg mb-2" />
                          <div className="text-sm font-semibold">{pet.name}</div>
                          {isOwned ? (
                            <div className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs mt-2">
                              Owned ✓
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowPurchaseModal(pet)}
                              disabled={!canAfford(selectedStudent, pet.price)}
                              className="w-full px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:bg-gray-400 mt-2"
                            >
                              {pet.price} 💰
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Consumables Category */}
          {activeChampsCategory === 'consumables' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">⚡ Power-ups & Consumables</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CONSUMABLES.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 rounded-lg p-4 text-center cursor-pointer"
                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <img src={item.image} alt={item.name} className="w-16 h-16 mx-auto rounded-lg mb-2" />
                    <div className="text-sm font-semibold mb-1">{item.name}</div>
                    <div className="text-xs text-gray-600 mb-3">{item.effect}</div>
                    <button
                      onClick={() => setShowPurchaseModal(item)}
                      disabled={!canAfford(selectedStudent, item.price)}
                      className="w-full px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400"
                    >
                      {item.price} 💰
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loot Boxes Category */}
          {activeChampsCategory === 'lootboxes' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">📦 Mystery Loot Boxes</h3>
              <p className="text-center text-gray-600 mb-6">
                Open loot boxes to discover rare avatars, powerful items, and exclusive rewards!
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {LOOT_BOXES.map(box => (
                  <div key={box.id} className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl p-6 text-center border-2 border-purple-200">
                    <div className="text-4xl mb-4">{box.image}</div>
                    <h4 className="text-xl font-bold text-purple-800 mb-2">{box.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{box.description}</p>
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
                            className="w-16 h-16 mx-auto rounded-lg mb-1"
                          />
                          <div className="text-xs font-semibold">{avatarBase}</div>
                          {isActive ? (
                            <div className="text-xs text-blue-600 font-bold">Active</div>
                          ) : (
                            <button
                              onClick={() => handleSwitchAvatar(avatarBase)}
                              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Use
                            </button>
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
                  <h4 className="text-lg font-semibold text-green-600 mb-4">🐾 Pet Collection</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedStudent.ownedPets.map(pet => (
                      <div key={pet.id} className="text-center bg-green-50 rounded-lg p-2">
                        <img src={pet.image} alt={pet.name} className="w-16 h-16 mx-auto rounded-lg mb-1" />
                        <div className="text-xs font-semibold">{pet.name}</div>
                        <div className="text-xs text-gray-500">{pet.type}</div>
                        <button
                          onClick={() => handlePetRename(pet)}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mt-1"
                        >
                          Rename
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inventory Items */}
              {selectedStudent.inventory?.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-purple-600 mb-4">⚡ Power-ups & Items</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {selectedStudent.inventory.map((item, index) => (
                      <div key={`${item.id}_${index}`} className="text-center bg-purple-50 rounded-lg p-2">
                        <img src={item.image} alt={item.name} className="w-16 h-16 mx-auto rounded-lg mb-1" />
                        <div className="text-xs font-semibold">{item.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!selectedStudent.ownedAvatars?.length && !selectedStudent.ownedPets?.length && !selectedStudent.inventory?.length) && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📦</div>
                  <p className="text-gray-600">Your inventory is empty. Start shopping to collect items!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Teacher Rewards Section */}
      {activeSection === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-green-800">🎁 Classroom Rewards</h3>
              <button
                onClick={() => setShowRewardEditor(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                + Add Reward
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teacherRewards.map(reward => (
                <div key={reward.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl">{reward.icon}</div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h4 className="font-bold text-green-800">{reward.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-600">{reward.price} 💰</span>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {reward.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
            <div className="text-center mb-4">
              {showPurchaseModal.image && !showPurchaseModal.image.includes('📦') ? (
                <img src={showPurchaseModal.image} alt={showPurchaseModal.name} className="w-20 h-20 mx-auto rounded-lg mb-2" />
              ) : (
                <div className="text-4xl mb-2">{showPurchaseModal.image || '🎁'}</div>
              )}
              <h4 className="font-bold">{showPurchaseModal.name}</h4>
              <p className="text-2xl font-bold text-purple-600">{showPurchaseModal.price} 💰</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPurchaseModal(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePurchase(showPurchaseModal)}
                disabled={!canAfford(selectedStudent, showPurchaseModal.price)}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Rename Modal */}
      {showPetRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Rename Pet</h3>
            <div className="text-center mb-4">
              <img src={showPetRenameModal.image} alt={showPetRenameModal.name} className="w-20 h-20 mx-auto rounded-lg mb-2" />
              <h4 className="font-bold">{showPetRenameModal.name}</h4>
            </div>
            <input
              type="text"
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              placeholder="Enter new pet name"
              className="w-full p-3 border rounded-lg mb-4"
              maxLength={20}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowPetRenameModal(null);
                  setNewPetName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePetRenameConfirm}
                disabled={!newPetName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Editor Modal */}
      {showRewardEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {editingReward ? 'Edit Reward' : 'Add New Reward'}
            </h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reward name"
                value={newReward.name}
                onChange={(e) => setNewReward(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={newReward.description}
                onChange={(e) => setNewReward(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                rows="3"
              />
              <input
                type="number"
                placeholder="Price in coins"
                value={newReward.price}
                onChange={(e) => setNewReward(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border rounded-lg"
              />
              <select
                value={newReward.category}
                onChange={(e) => setNewReward(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="privileges">Privileges</option>
                <option value="treats">Treats</option>
                <option value="activities">Activities</option>
                <option value="supplies">Supplies</option>
              </select>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowRewardEditor(false);
                  setEditingReward(null);
                  setNewReward({ name: '', description: '', price: 5, category: 'privileges' });
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={editingReward ? handleUpdateReward : handleAddReward}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {editingReward ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopTab;