// classroom-champions.js - COMPLETE WITH QUEST SYSTEM OVERHAUL + GAMES TAB + SHOP INTEGRATION
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const ShopTab = React.lazy(() => import('../components/tabs/ShopTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const GamesTab = React.lazy(() => import('../components/tabs/GamesTab')); // ADDED: Games Tab
const ClassesTab = React.lazy(() => import('../components/tabs/ClassesTab'));
const SettingsTab = React.lazy(() => import('../components/tabs/SettingsTab'));
const TeachersToolkitTab = React.lazy(() => import('../components/tabs/TeachersToolkitTab'));

// Lazy load modals
const CharacterSheetModal = React.lazy(() => import('../components/modals/CharacterSheetModal'));
const AvatarSelectionModal = React.lazy(() => import('../components/modals/AvatarSelectionModal'));
const LevelUpModal = React.lazy(() => import('../components/modals/LevelUpModal'));
const PetUnlockModal = React.lazy(() => import('../components/modals/PetUnlockModal'));
const AddStudentModal = React.lazy(() => import('../components/modals/AddStudentModal'));
const RaceWinnerModal = React.lazy(() => import('../components/modals/RaceWinnerModal'));
const RaceSetupModal = React.lazy(() => import('../components/modals/RaceSetupModal'));
const QuestCompletionModal = React.lazy(() => import('../components/modals/QuestCompletionModal'));

// ===============================================
// QUEST SYSTEM OVERHAUL - QUEST GIVERS & DATA
// ===============================================

const QUEST_GIVERS = [
  {
    id: 'guide1',
    name: 'Professor Hoot',
    image: '/Guides/Guide 1.png',
    personality: 'wise',
    role: 'Learning Quest Giver',
    specialty: 'academic',
    greetings: [
      "Wisdom comes to those who seek knowledge! 🦉",
      "Ready for your next learning adventure?",
      "Books and quests await, young scholar!"
    ],
    questTypes: ['learning', 'homework', 'reading'],
    tips: [
      "💡 Tip: Consistent daily learning builds strong foundations!",
      "📚 Remember: Every expert was once a beginner!",
      "🎯 Focus on understanding, not just completing!"
    ]
  },
  {
    id: 'guide2',
    name: 'Captain Clockwork',
    image: '/Guides/Guide 2.png',
    personality: 'punctual',
    role: 'Organization Quest Giver',
    specialty: 'responsibility',
    greetings: [
      "Time for responsibility training! ⏰",
      "A well-organized student is a successful student!",
      "Ready to master the art of responsibility?"
    ],
    questTypes: ['organization', 'punctuality', 'preparation'],
    tips: [
      "⏰ Tip: Organization is the key to success!",
      "📝 A tidy workspace leads to a clear mind!",
      "🎯 Preparation prevents poor performance!"
    ]
  },
  {
    id: 'guide3',
    name: 'Sir Kindsworth',
    image: '/Guides/Guide 3.png',
    personality: 'noble',
    role: 'Respect Quest Giver',
    specialty: 'respectful',
    greetings: [
      "Greetings, young champion! ⚔️",
      "Honor and respect await those who are worthy!",
      "Ready to prove your noble character?"
    ],
    questTypes: ['kindness', 'helping', 'respect'],
    tips: [
      "🤝 Tip: Kindness is the greatest strength!",
      "💪 Help others and you help yourself!",
      "👑 True champions respect everyone!"
    ]
  }
];

// Enhanced Quest Templates with Quest Givers
const QUEST_TEMPLATES = [
  // Learning Quests (Professor Hoot)
  {
    id: 'hw_complete',
    name: 'Knowledge Seeker',
    description: 'Complete all homework assignments this week',
    xpReward: 10,
    coinReward: 2,
    category: 'learning',
    type: 'manual',
    questGiver: 'guide1',
    icon: '📚',
    difficulty: 'medium'
  },
  {
    id: 'reading_master',
    name: 'Reading Master',
    description: 'Read for 20 minutes every day this week',
    xpReward: 15,
    coinReward: 3,
    category: 'learning',
    type: 'manual',
    questGiver: 'guide1',
    icon: '📖',
    difficulty: 'hard'
  },
  {
    id: 'question_asker',
    name: 'Curious Mind',
    description: 'Ask 5 thoughtful questions during lessons',
    xpReward: 8,
    coinReward: 1,
    category: 'learning',
    type: 'manual',
    questGiver: 'guide1',
    icon: '❓',
    difficulty: 'easy'
  },

  // Responsibility Quests (Captain Clockwork)
  {
    id: 'on_time_warrior',
    name: 'Punctuality Champion',
    description: 'Arrive on time every day this week',
    xpReward: 12,
    coinReward: 2,
    category: 'responsibility',
    type: 'auto',
    questGiver: 'guide2',
    icon: '⏰',
    difficulty: 'medium',
    requirement: { type: 'attendance', status: 'present', days: 5 }
  },
  {
    id: 'organizer_supreme',
    name: 'Organization Expert',
    description: 'Keep desk organized all week',
    xpReward: 8,
    coinReward: 1,
    category: 'responsibility',
    type: 'manual',
    questGiver: 'guide2',
    icon: '📋',
    difficulty: 'easy'
  },
  {
    id: 'helper_hero',
    name: 'Classroom Helper',
    description: 'Help clean up after activities 3 times',
    xpReward: 10,
    coinReward: 2,
    category: 'responsibility',
    type: 'manual',
    questGiver: 'guide2',
    icon: '🧹',
    difficulty: 'medium'
  },

  // Respect Quests (Sir Kindsworth)
  {
    id: 'kindness_knight',
    name: 'Knight of Kindness',
    description: 'Show kindness to 3 different classmates',
    xpReward: 15,
    coinReward: 3,
    category: 'respectful',
    type: 'manual',
    questGiver: 'guide3',
    icon: '💝',
    difficulty: 'hard'
  },
  {
    id: 'respect_ruler',
    name: 'Respect Master',
    description: 'Show respect to teachers and peers all week',
    xpReward: 12,
    coinReward: 2,
    category: 'respectful',
    type: 'manual',
    questGiver: 'guide3',
    icon: '🤝',
    difficulty: 'medium'
  },
  {
    id: 'listening_legend',
    name: 'Listening Legend',
    description: 'Demonstrate active listening during all lessons',
    xpReward: 8,
    coinReward: 1,
    category: 'respectful',
    type: 'manual',
    questGiver: 'guide3',
    icon: '👂',
    difficulty: 'easy'
  },

  // Weekly Class Challenges
  {
    id: 'class_unity',
    name: 'United We Stand',
    description: 'Entire class completes their individual goals',
    xpReward: 20,
    coinReward: 4,
    category: 'class',
    type: 'auto',
    questGiver: 'guide1',
    icon: '👥',
    difficulty: 'epic'
  },
  {
    id: 'knowledge_storm',
    name: 'Knowledge Storm',
    description: 'Class earns 500 total learning XP this week',
    xpReward: 15,
    coinReward: 3,
    category: 'class',
    type: 'auto',
    questGiver: 'guide1',
    icon: '🌩️',
    difficulty: 'hard',
    requirement: { type: 'xp', category: 'Learner', amount: 500, scope: 'class' }
  }
];

// ===============================================
// CONSTANTS AND DATA
// ===============================================

const MAX_LEVEL = 4;
const COINS_PER_XP = 5; // 5 XP = 1 coin
const FINISH_LINE_POSITION = 100;

// Shop Items (Keeping existing for backward compatibility)
const SHOP_ITEMS = [
  // Accessories
  {
    id: 'crown_gold',
    name: 'Golden Crown',
    description: 'A majestic crown for true champions',
    icon: '👑',
    price: 15,
    category: 'accessories',
    rarity: 'epic',
    type: 'accessory'
  },
  {
    id: 'cape_hero',
    name: 'Hero Cape',
    description: 'A flowing cape that shows your heroic spirit',
    icon: '🦸',
    price: 12,
    category: 'accessories',
    rarity: 'rare',
    type: 'accessory'
  },
  {
    id: 'sword_legend',
    name: 'Legendary Sword',
    description: 'A powerful weapon for legendary adventures',
    icon: '⚔️',
    price: 20,
    category: 'accessories',
    rarity: 'legendary',
    type: 'weapon'
  },

  // Power-ups
  {
    id: 'xp_boost',
    name: 'XP Boost Potion',
    description: 'Doubles XP earned for the next task',
    icon: '⚡',
    price: 8,
    category: 'powerups',
    rarity: 'common',
    type: 'consumable'
  },
  {
    id: 'speed_boost',
    name: 'Speed Elixir',
    description: 'Increases pet racing speed temporarily',
    icon: '💨',
    price: 10,
    category: 'powerups',
    rarity: 'rare',
    type: 'consumable'
  },

  // Trophies
  {
    id: 'trophy_bronze',
    name: 'Bronze Trophy',
    description: 'A symbol of your achievements',
    price: 5,
    type: 'collectible',
    rarity: 'common',
    icon: '🥉',
    category: 'trophies'
  },
  {
    id: 'trophy_silver',
    name: 'Silver Trophy',
    description: 'Shining bright with success',
    price: 10,
    type: 'collectible',
    rarity: 'rare',
    icon: '🥈',
    category: 'trophies'
  },
  {
    id: 'trophy_gold',
    name: 'Gold Trophy',
    description: 'The ultimate achievement',
    price: 20,
    type: 'collectible',
    rarity: 'epic',
    icon: '🥇',
    category: 'trophies'
  },
  {
    id: 'trophy_diamond',
    name: 'Diamond Trophy',
    description: 'Reserved for the greatest champions',
    icon: '💎',
    price: 35,
    category: 'trophies',
    rarity: 'epic',
    type: 'trophy'
  },

  // Loot Boxes
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 3 random items of various rarities',
    icon: '📦',
    price: 25,
    category: 'lootboxes',
    rarity: 'common',
    type: 'lootbox',
    contents: {
      count: 3,
      rarityBonus: 0,
      guaranteedRare: false
    }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 5 random items with guaranteed rare+',
    icon: '✨',
    price: 50,
    category: 'lootboxes',
    rarity: 'epic',
    type: 'lootbox',
    contents: {
      count: 5,
      rarityBonus: 10,
      guaranteedRare: true
    }
  }
];

const LOOT_BOX_ITEMS = [
  // Common Items
  { id: 'coin_small', name: 'Coin Pouch', icon: '💰', rarity: 'common', effect: 'coins_1' },
  { id: 'sticker_star', name: 'Star Sticker', icon: '⭐', rarity: 'common', effect: 'cosmetic' },
  { id: 'pencil', name: 'Magic Pencil', icon: '✏️', rarity: 'common', effect: 'cosmetic' },
  { id: 'eraser', name: 'Lucky Eraser', icon: '🔸', rarity: 'common', effect: 'cosmetic' },
  
  // Rare Items
  { id: 'coin_medium', name: 'Coin Bag', icon: '💎', rarity: 'rare', effect: 'coins_3' },
  { id: 'rainbow_sticker', name: 'Rainbow Sticker', icon: '🌈', rarity: 'rare', effect: 'cosmetic' },
  { id: 'magic_wand', name: 'Magic Wand', icon: '🪄', rarity: 'rare', effect: 'cosmetic' },
  { id: 'pet_toy', name: 'Pet Toy', icon: '🧸', rarity: 'rare', effect: 'pet_happiness' },
  
  // Epic Items
  { id: 'coin_large', name: 'Treasure Chest', icon: '💰', rarity: 'epic', effect: 'coins_5' },
  { id: 'crystal_ball', name: 'Crystal Ball', icon: '🔮', rarity: 'epic', effect: 'cosmetic' },
  { id: 'spell_book', name: 'Ancient Spell Book', icon: '📚', rarity: 'epic', effect: 'xp_boost' },
  { id: 'golden_apple', name: 'Golden Apple', icon: '🍎', rarity: 'epic', effect: 'teacher_favorite' },
  
  // Legendary Items
  { id: 'coin_jackpot', name: 'Jackpot!', icon: '🎰', rarity: 'legendary', effect: 'coins_10' },
  { id: 'unicorn', name: 'Unicorn Friend', icon: '🦄', rarity: 'legendary', effect: 'pet_legendary' },
  { id: 'infinity_gem', name: 'Infinity Gem', icon: '💎', rarity: 'legendary', effect: 'permanent_buff' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔥', rarity: 'legendary', effect: 'resurrection' }
];

const AVAILABLE_AVATARS = [
  { base: "Alchemist F", path: "/avatars/Alchemist%20F/Level%201.png" },
  { base: "Alchemist M", path: "/avatars/Alchemist%20M/Level%201.png" },
  { base: "Archer F", path: "/avatars/Archer%20F/Level%201.png" },
  { base: "Archer M", path: "/avatars/Archer%20M/Level%201.png" },
  { base: "Barbarian F", path: "/avatars/Barbarian%20F/Level%201.png" },
  { base: "Barbarian M", path: "/avatars/Barbarian%20M/Level%201.png" },
  { base: "Bard F", path: "/avatars/Bard%20F/Level%201.png" },
  { base: "Bard M", path: "/avatars/Bard%20M/Level%201.png" },
  { base: "Beastmaster F", path: "/avatars/Beastmaster%20F/Level%201.png" },
  { base: "Beastmaster M", path: "/avatars/Beastmaster%20M/Level%201.png" },
  { base: "Cleric F", path: "/avatars/Cleric%20F/Level%201.png" },
  { base: "Cleric M", path: "/avatars/Cleric%20M/Level%201.png" },
  { base: "Crystal Sage F", path: "/avatars/Crystal%20Sage%20F/Level%201.png" },
  { base: "Crystal Sage M", path: "/avatars/Crystal%20Sage%20M/Level%201.png" },
  { base: "Druid F", path: "/avatars/Druid%20F/Level%201.png" },
  { base: "Druid M", path: "/avatars/Druid%20M/Level%201.png" },
  { base: "Engineer F", path: "/avatars/Engineer%20F/Level%201.png" },
  { base: "Engineer M", path: "/avatars/Engineer%20M/Level%201.png" },
  { base: "Ice Mage F", path: "/avatars/Ice%20Mage%20F/Level%201.png" },
  { base: "Ice Mage M", path: "/avatars/Ice%20Mage%20M/Level%201.png" },
  { base: "Illusionist F", path: "/avatars/Illusionist%20F/Level%201.png" },
  { base: "Illusionist M", path: "/avatars/Illusionist%20M/Level%201.png" },
  { base: "Knight F", path: "/avatars/Knight%20F/Level%201.png" },
  { base: "Knight M", path: "/avatars/Knight%20M/Level%201.png" },
  { base: "Monk F", path: "/avatars/Monk%20F/Level%201.png" },
  { base: "Monk M", path: "/avatars/Monk%20M/Level%201.png" },
  { base: "Necromancer F", path: "/avatars/Necromancer%20F/Level%201.png" },
  { base: "Necromancer M", path: "/avatars/Necromancer%20M/Level%201.png" },
  { base: "Orc F", path: "/avatars/Orc%20F/Level%201.png" },
  { base: "Orc M", path: "/avatars/Orc%20M/Level%201.png" },
  { base: "Paladin F", path: "/avatars/Paladin%20F/Level%201.png" },
  { base: "Paladin M", path: "/avatars/Paladin%20M/Level%201.png" },
  { base: "Rogue F", path: "/avatars/Rogue%20F/Level%201.png" },
  { base: "Rogue M", path: "/avatars/Rogue%20M/Level%201.png" },
  { base: "Sky Knight F", path: "/avatars/Sky%20Knight%20F/Level%201.png" },
  { base: "Sky Knight M", path: "/avatars/Sky%20Knight%20M/Level%201.png" },
  { base: "Time Mage F", path: "/avatars/Time%20Mage%20F/Level%201.png" },
  { base: "Time Mage M", path: "/avatars/Time%20Mage%20M/Level%201.png" },
  { base: "Wizard F", path: "/avatars/Wizard%20F/Level%201.png" },
  { base: "Wizard M", path: "/avatars/Wizard%20M/Level%201.png" }
];

const PETS = [
  "Alchemist", "Barbarian", "Bard", "Beastmaster", "Cleric", "Crystal Knight",
  "Crystal Sage", "Dream", "Druid", "Engineer", "Frost Mage", "Illusionist",
  "Knight", "Lightning", "Monk", "Necromancer", "Orc", "Paladin", "Rogue",
  "Stealth", "Time Knight", "Warrior", "Wizard"
];

const PET_NAMES = [
  "Flamepaw", "Shadowtail", "Brightfang", "Mysticwhisker", "Stormclaw",
  "Ironhoof", "Swiftbeak", "Frostwhisker", "Moonfang", "Nightclaw"
];

// Item Rarities
const ITEM_RARITIES = {
  common: {
    name: 'Common',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    chance: 60
  },
  rare: {
    name: 'Rare',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    chance: 25
  },
  epic: {
    name: 'Epic',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    chance: 10
  },
  legendary: {
    name: 'Legendary',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    chance: 5
  }
};

// ===============================================
// QUEST COMPONENTS
// ===============================================

const QuestGiverTip = ({ questGiverId, onClose }) => {
  const questGiver = QUEST_GIVERS.find(qg => qg.id === questGiverId);
  if (!questGiver) return null;

  const randomTip = questGiver.tips[Math.floor(Math.random() * questGiver.tips.length)];
  const randomGreeting = questGiver.greetings[Math.floor(Math.random() * questGiver.greetings.length)];

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-yellow-400 rounded-xl p-4 shadow-2xl z-50 max-w-sm animate-slide-up">
      <div className="flex items-start space-x-3">
        <img 
          src={questGiver.image} 
          alt={questGiver.name}
          className="w-16 h-16 rounded-full border-2 border-yellow-400"
        />
        <div className="flex-1">
          <div className="font-bold text-yellow-800 mb-1">{questGiver.name}</div>
          <div className="text-sm text-gray-600 mb-2">{randomGreeting}</div>
          <div className="text-sm text-blue-700">{randomTip}</div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
};

const QuestGiverModal = ({ quest, onComplete, onClose }) => {
  const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
  if (!questGiver) return null;

  const randomGreeting = questGiver.greetings[Math.floor(Math.random() * questGiver.greetings.length)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header with Quest Giver */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-center">
          <img 
            src={questGiver.image} 
            alt={questGiver.name}
            className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-white shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white mb-1">{questGiver.name}</h2>
          <p className="text-white opacity-90">{questGiver.role}</p>
        </div>

        {/* Quest Content */}
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{quest.icon}</div>
            <h3 className="text-xl font-bold text-gray-800">{quest.name}</h3>
            <p className="text-gray-600 mt-2">{randomGreeting}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Quest Objective:</h4>
            <p className="text-gray-700">{quest.description}</p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Rewards:</h4>
            <div className="flex justify-between">
              <span className="text-blue-600">⭐ {quest.xpReward} XP</span>
              <span className="text-yellow-600">💰 {quest.coinReward} Coins</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Maybe Later
            </button>
            <button
              onClick={() => onComplete(quest)}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Accept Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestManagementModal = ({ 
  isOpen, 
  onClose, 
  questTemplates, 
  currentQuests, 
  onAddQuest, 
  onRemoveQuest, 
  onCreateCustomQuest 
}) => {
  const [activeQuestGiver, setActiveQuestGiver] = useState('all');
  const [showCustomQuest, setShowCustomQuest] = useState(false);
  const [customQuest, setCustomQuest] = useState({
    name: '',
    description: '',
    xpReward: 10,
    coinReward: 2,
    category: 'learning',
    questGiver: 'guide1',
    icon: '⭐',
    difficulty: 'medium'
  });

  if (!isOpen) return null;

  const filteredTemplates = activeQuestGiver === 'all' 
    ? questTemplates 
    : questTemplates.filter(q => q.questGiver === activeQuestGiver);

  const handleCreateCustom = () => {
    const newQuest = {
      ...customQuest,
      id: `custom_${Date.now()}`,
      type: 'manual',
      isCustom: true
    };
    onCreateCustomQuest(newQuest);
    setCustomQuest({
      name: '',
      description: '',
      xpReward: 10,
      coinReward: 2,
      category: 'learning',
      questGiver: 'guide1',
      icon: '⭐',
      difficulty: 'medium'
    });
    setShowCustomQuest(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">⚔️ Quest Management</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quest Giver Filter */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveQuestGiver('all')}
              className={`px-4 py-2 rounded-lg font-semibold ${
                activeQuestGiver === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Quests
            </button>
            {QUEST_GIVERS.map(giver => (
              <button
                key={giver.id}
                onClick={() => setActiveQuestGiver(giver.id)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
                  activeQuestGiver === giver.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <img src={giver.image} alt={giver.name} className="w-6 h-6 rounded-full" />
                <span>{giver.name}</span>
              </button>
            ))}
          </div>

          {/* Create Custom Quest */}
          <div className="mb-6">
            <button
              onClick={() => setShowCustomQuest(!showCustomQuest)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              + Create Custom Quest
            </button>
          </div>

          {/* Custom Quest Form */}
          {showCustomQuest && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-green-800 mb-4">Create Custom Quest</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Quest name"
                  value={customQuest.name}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={customQuest.description}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="XP Reward"
                  value={customQuest.xpReward}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 10 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Coin Reward"
                  value={customQuest.coinReward}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, coinReward: parseInt(e.target.value) || 2 }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={customQuest.category}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="learning">Learning</option>
                  <option value="responsibility">Responsibility</option>
                  <option value="respectful">Respectful</option>
                </select>
                <select
                  value={customQuest.questGiver}
                  onChange={(e) => setCustomQuest(prev => ({ ...prev, questGiver: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {QUEST_GIVERS.map(giver => (
                    <option key={giver.id} value={giver.id}>{giver.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateCustom}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Quest
                </button>
                <button
                  onClick={() => setShowCustomQuest(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Current Active Quests */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Active Quests ({currentQuests.length})</h3>
            {currentQuests.length === 0 ? (
              <p className="text-gray-500 italic">No active quests. Add some from the templates below!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuests.map(quest => {
                  const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
                  return (
                    <div key={quest.id} className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{quest.icon}</span>
                            <h4 className="font-bold text-gray-800">{quest.name}</h4>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{quest.description}</p>
                          <div className="flex items-center space-x-3">
                            {questGiver && (
                              <div className="flex items-center space-x-1">
                                <img src={questGiver.image} alt={questGiver.name} className="w-4 h-4 rounded-full" />
                                <span className="text-xs text-gray-500">{questGiver.name}</span>
                              </div>
                            )}
                            <span className="text-blue-600 text-sm">⭐ {quest.xpReward} XP</span>
                            <span className="text-yellow-600 text-sm">💰 {quest.coinReward} Coins</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveQuest(quest.id)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Quest Templates */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">📜 Available Quest Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map(quest => {
                const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
                const isActive = currentQuests.some(aq => aq.id === quest.id);
                
                return (
                  <div key={quest.id} className={`border rounded-lg p-4 ${
                    isActive ? 'border-gray-300 bg-gray-100' : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">{quest.icon}</span>
                          <h4 className="font-bold text-gray-800">{quest.name}</h4>
                          {quest.isCustom && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Custom</span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{quest.description}</p>
                        <div className="flex items-center space-x-3">
                          {questGiver && (
                            <div className="flex items-center space-x-1">
                              <img src={questGiver.image} alt={questGiver.name} className="w-4 h-4 rounded-full" />
                              <span className="text-xs text-gray-500">{questGiver.name}</span>
                            </div>
                          )}
                          <span className="text-blue-600 text-sm">⭐ {quest.xpReward} XP</span>
                          <span className="text-yellow-600 text-sm">💰 {quest.coinReward} Coins</span>
                        </div>
                      </div>
                      <button
                        onClick={() => isActive ? onRemoveQuest(quest.id) : onAddQuest(quest)}
                        disabled={isActive}
                        className={`ml-2 px-3 py-1 rounded-lg text-sm font-semibold ${
                          isActive 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isActive ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// UPDATED: Enhanced student data structure for new shop system
const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null,
    // NEW SHOP FIELDS
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : []),
    ownedPets: student.ownedPets || (student.pet ? [{ 
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : []),
    rewardsPurchased: student.rewardsPurchased || []
  };
};

// NEW: Data migration function for existing students
const migrateStudentData = (student) => {
  // Check if student already has new fields (avoid double migration)
  if (student.ownedAvatars !== undefined) {
    return student;
  }

  const migratedStudent = {
    ...student,
    // Ensure all required fields exist
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    inventory: student.inventory || [],
    logs: student.logs || [],
    
    // NEW SHOP FIELDS
    ownedAvatars: student.avatarBase ? [student.avatarBase] : [], // Add current avatar to owned
    ownedPets: student.pet ? [{ 
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : [], // If student has a pet, add it to owned pets
    rewardsPurchased: [] // Start with empty rewards
  };

  console.log(`Migrated student: ${student.firstName}`);
  return migratedStudent;
};

// NEW: Function to migrate all students in a class
const migrateClassData = async (classData) => {
  const migratedStudents = classData.students.map(migrateStudentData);
  
  return {
    ...classData,
    students: migratedStudents,
    teacherRewards: classData.teacherRewards || [] // Add teacher rewards storage
  };
};

const getAvatarImage = (base, level) => {
  return `/avatars/${base.replaceAll(" ", "%20")}/Level%20${level}.png`;
};

const getRandomPet = () => {
  const type = PETS[Math.floor(Math.random() * PETS.length)];
  return {
    image: `/Pets/${type}.png`,
    level: 1,
    speed: 1,
    wins: 0,
    name: ''
  };
};

const getRandomPetName = () => {
  return PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
};

const calculateSpeed = (pet) => {
  const baseSpeed = pet.speed || 1;
  const level = pet.level || 1;
  
  // Very small level bonus to keep races competitive
  const levelBonus = (level - 1) * 0.05;
  
  return Math.max(baseSpeed + levelBonus, 0.8);
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
};

const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Tab Loading component
const TabLoadingSpinner = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading tab content...</p>
      </div>
    </div>
  </div>
);

// Currency Display Component - FIXED
const CurrencyDisplay = ({ student }) => {
  const coins = Math.max(0, Math.floor((student?.totalPoints || 0) / COINS_PER_XP) + (student?.coins || 0) - (student?.coinsSpent || 0));
  const coinsSpent = student?.coinsSpent || 0;
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  
  return (
    <div className="flex items-center space-x-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">💰</div>
        <div className="text-sm text-yellow-700">Available</div>
        <div className="text-lg font-bold text-yellow-800">{coins}</div>
        <div className="text-xs text-yellow-600">({xpCoins} XP + {bonusCoins} bonus)</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">🛍️</div>
        <div className="text-sm text-gray-700">Spent</div>
        <div className="text-lg font-bold text-gray-800">{coinsSpent}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">⭐</div>
        <div className="text-sm text-blue-700">Total XP</div>
        <div className="text-lg font-bold text-blue-800">{student?.totalPoints || 0}</div>
      </div>
    </div>
  );
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [petNameInput, setPetNameInput] = useState('');

  // Avatar selection states
  const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false);
  const [studentForAvatarChange, setStudentForAvatarChange] = useState(null);

  // Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('XP');
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);

  // Class management states
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);

  // Multiple XP award states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkXpAmount, setBulkXpAmount] = useState(1);
  const [bulkXpCategory, setBulkXpCategory] = useState('Respectful');
  const [showBulkXpPanel, setShowBulkXpPanel] = useState(false);

  // ENHANCED: Quest system states
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(QUEST_TEMPLATES);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [showQuestCompletion, setShowQuestCompletion] = useState(false);
  const [showQuestManagement, setShowQuestManagement] = useState(false);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(null);
  const [showQuestGiverTip, setShowQuestGiverTip] = useState(null);

  // Animation states
  const [animatingXP, setAnimatingXP] = useState({});
  const [savingData, setSavingData] = useState(false);

  // User and subscription states
  const [userData, setUserData] = useState(null);

  // Settings states
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // Attendance data
  const [attendanceData, setAttendanceData] = useState({});

  // ===============================================
  // CORE FUNCTIONS
  // ===============================================

  // Toast notification system
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
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

  // Spend coins function
  const spendCoins = (studentId, amount) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, coinsSpent: (student.coinsSpent || 0) + amount }
        : student
    ));
  };

  // Generate loot box rewards
  const generateLootBoxRewards = (lootBox) => {
    const rewards = [];
    const { count, rarityBonus, guaranteedRare } = lootBox.contents;

    for (let i = 0; i < count; i++) {
      let rarity = 'common';
      const roll = Math.random() * 100;
      const adjustedRoll = roll - (rarityBonus || 0);

      if (adjustedRoll <= ITEM_RARITIES.legendary.chance) {
        rarity = 'legendary';
      } else if (adjustedRoll <= ITEM_RARITIES.epic.chance) {
        rarity = 'epic';
      } else if (adjustedRoll <= ITEM_RARITIES.rare.chance) {
        rarity = 'rare';
      } else {
        rarity = 'common';
      }

      // Guarantee at least one rare+ item for premium boxes
      if (guaranteedRare && i === 0 && rarity === 'common') {
        rarity = 'rare';
      }

      const availableItems = LOOT_BOX_ITEMS.filter(item => item.rarity === rarity);
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];

      rewards.push({
        ...randomItem,
        id: `${randomItem.id}_${Date.now()}_${i}`,
        obtainedAt: new Date().toISOString()
      });
    }

    return rewards;
  };

  // Save students to Firebase
  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;

    try {
      setSavingData(true);
      
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                students: updatedStudents,
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
      console.error("Error saving to Firebase:", error);
    } finally {
      setSavingData(false);
    }
  };

  // Save active class to Firebase
  const saveActiveClassToFirebase = async (classId) => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        await setDoc(docRef, { 
          ...data, 
          activeClassId: classId 
        });
      }
    } catch (error) {
      console.error("Error saving active class:", error);
    }
  };

  // Save quest data to Firebase
  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                ...questData,
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
      console.error("Error saving quest data:", error);
    }
  };

  // Check for level up
  const checkForLevelUp = (student) => {
    const nextLevel = student.avatarLevel + 1;
    const xpNeeded = student.avatarLevel * 100;
    if (student.totalPoints >= xpNeeded && student.avatarLevel < MAX_LEVEL) {
      const newAvatar = getAvatarImage(student.avatarBase, nextLevel);
      setLevelUpData({
        name: student.firstName,
        oldAvatar: student.avatar,
        newAvatar,
      });
      return {
        ...student,
        avatarLevel: nextLevel,
        avatar: newAvatar,
      };
    }
    return student;
  };

  const handleAvatarClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentForAvatarChange(student);
      setShowAvatarSelectionModal(true);
    }
  };

  const handleAvatarChange = async (avatarBase) => {
    if (!studentForAvatarChange) return;

    setSavingData(true);
    const newAvatar = getAvatarImage(avatarBase, studentForAvatarChange.avatarLevel);
    
    setStudents(prev => {
      const updatedStudents = prev.map(student => 
        student.id === studentForAvatarChange.id 
          ? { ...student, avatarBase, avatar: newAvatar }
          : student
      );
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    try {
      showToast('Avatar updated successfully!');
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setSavingData(false);
    }

    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
  };

  // ENHANCED: Quest completion function with proper safety checks
  const checkQuestCompletionSafely = (studentId, updatedStudents) => {
    try {
      const student = updatedStudents.find(s => s.id === studentId);
      if (!student) return;

      const availableQuests = activeQuests.filter(quest => {
        if (quest.completedBy.includes(studentId)) return false;
        if (quest.category === 'class') return false;
        
        if (quest.type === 'auto' && quest.requirement) {
          const { type, category, amount } = quest.requirement;
          if (type === 'xp') {
            const categoryPoints = student.categoryWeekly?.[category] || 0;
            return categoryPoints >= amount;
          }
        }
        
        return false;
      });

      if (availableQuests.length > 0) {
        const questToComplete = availableQuests[0];
        setTimeout(() => {
          setSelectedQuestGiver(questToComplete);
        }, 1000);
      }
    } catch (error) {
      console.error("Error in quest completion check:", error);
    }
  };

  // FIXED: Award XP function with automatic coin generation
  const handleAwardXP = (id, category, amount = 1) => {
    // Prevent rapid firing
    if (animatingXP[id]) return;
    
    console.log(`🎯 Awarding ${amount} XP to student ${id} in category ${category}`);
    
    setAnimatingXP(prev => ({ ...prev, [id]: category }));
    setTimeout(() => setAnimatingXP(prev => ({ ...prev, [id]: null })), 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (s.id !== id) return s;

        const newTotal = s.totalPoints + amount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: (s.weeklyPoints || 0) + amount,
          lastXpDate: new Date().toISOString(),
          categoryTotal: {
            ...s.categoryTotal,
            [category]: (s.categoryTotal[category] || 0) + amount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [category]: (s.categoryWeekly[category] || 0) + amount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "manual",
            },
          ],
        };

        // Pet unlock check
        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);
      
      // Quest completion check
      checkQuestCompletionSafely(id, updatedStudents);
      
      return updatedStudents;
    });
  };

  // Student selection functions
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
  };

  const handleBulkXpAward = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setSavingData(true);
    
    // Animate all selected students
    selectedStudents.forEach(id => {
      setAnimatingXP(prev => ({ ...prev, [id]: bulkXpCategory }));
    });

    setTimeout(() => {
      selectedStudents.forEach(id => {
        setAnimatingXP(prev => ({ ...prev, [id]: null }));
      });
    }, 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (!selectedStudents.includes(s.id)) return s;

        const newTotal = s.totalPoints + bulkXpAmount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: (s.weeklyPoints || 0) + bulkXpAmount,
          lastXpDate: new Date().toISOString(),
          categoryTotal: {
            ...s.categoryTotal,
            [bulkXpCategory]: (s.categoryTotal[bulkXpCategory] || 0) + bulkXpAmount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [bulkXpCategory]: (s.categoryWeekly[bulkXpCategory] || 0) + bulkXpAmount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: bulkXpCategory,
              amount: bulkXpAmount,
              date: new Date().toISOString(),
              source: "bulk",
            },
          ],
        };

        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);

      // Quest completion for each student
      selectedStudents.forEach(studentId => {
        checkQuestCompletionSafely(studentId, updatedStudents);
      });

      return updatedStudents;
    });

    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    setSavingData(false);
    
    const studentNames = selectedStudents.length === students.length 
      ? 'the entire class'
      : `${selectedStudents.length} students`;
    
    showToast(`Awarded ${bulkXpAmount} XP to ${studentNames}!`);
  };

  // ENHANCED: Quest management functions
  const addQuestToActive = (quest) => {
    const newQuest = {
      ...quest,
      id: quest.id + '_' + Date.now(),
      completedBy: [],
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week from now
    };
    
    setActiveQuests(prev => {
      const updated = [...prev, newQuest];
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast(`Quest "${quest.name}" added to active quests!`);
  };

  const removeQuestFromActive = (questId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(quest => quest.id !== questId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast('Quest removed from active quests!');
  };

  const createCustomQuest = (questData) => {
    setQuestTemplates(prev => {
      const updated = [...prev, questData];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Custom quest created successfully!');
  };

  const completeQuest = (quest) => {
    // Award quest rewards to all students
    setStudents(prev => {
      const updatedStudents = prev.map(student => ({
        ...student,
        totalPoints: (student.totalPoints || 0) + quest.xpReward,
        coins: (student.coins || 0) + quest.coinReward,
        logs: [
          ...(student.logs || []),
          {
            type: 'quest_reward',
            amount: quest.xpReward,
            date: new Date().toISOString(),
            source: 'quest_completion',
            questName: quest.name
          }
        ]
      }));
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    // Mark quest as completed
    setActiveQuests(prev => {
      const updated = prev.map(q => 
        q.id === quest.id 
          ? { ...q, completedBy: [...new Set([...q.completedBy, ...students.map(s => s.id)])] }
          : q
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    setSelectedQuestGiver(null);
    showToast(`Quest "${quest.name}" completed! All students received rewards!`);
  };

  // Show random quest giver tip
  const showRandomQuestGiverTip = () => {
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    setShowQuestGiverTip(randomGiver.id);
    
    setTimeout(() => {
      setShowQuestGiverTip(null);
    }, 5000);
  };

  // Attendance functions
  const markAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    
    setAttendanceData(prev => {
      const updated = {
        ...prev,
        [today]: {
          ...prev[today],
          [studentId]: status
        }
      };
      
      // Save to Firebase
      if (currentClassId) {
        saveQuestDataToFirebase({ attendanceData: updated });
      }
      
      return updated;
    });
    
    const student = students.find(s => s.id === studentId);
    showToast(`${student?.firstName} marked as ${status}`);
  };

  // Settings functions
  const handleDeductXP = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              totalPoints: Math.max(0, s.totalPoints - amount),
              logs: [
                ...(s.logs || []),
                {
                  type: 'deduction',
                  amount: -amount,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('XP deducted successfully');
  };

  const handleDeductCurrency = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              coinsSpent: (s.coinsSpent || 0) + amount,
              logs: [
                ...(s.logs || []),
                {
                  type: 'coin_deduction',
                  amount: -amount,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Coins deducted successfully');
  };

  // Reset functions
  const handleResetStudentPoints = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              totalPoints: 0, 
              weeklyPoints: 0,
              categoryTotal: {},
              categoryWeekly: {},
              avatarLevel: 1,
              avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : s.avatar,
              logs: [
                ...(s.logs || []),
                {
                  type: 'reset',
                  amount: 0,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student points reset successfully');
  };

  const handleResetAllPoints = () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => ({
        ...s,
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        avatarLevel: 1,
        avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : s.avatar,
        logs: [
          ...(s.logs || []),
          {
            type: 'reset_all',
            amount: 0,
            date: new Date().toISOString(),
            source: 'admin'
          }
        ]
      }));
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All student points reset successfully');
  };

  const handleResetPetSpeeds = () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.pet ? { 
          ...s, 
          pet: { 
            ...s.pet, 
            speed: 1, 
            wins: 0 
          } 
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All pet speeds reset successfully');
  };

  const handleRemoveStudent = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.filter(s => s.id !== studentId);
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student removed successfully');
  };

  // Feedback functions
  const handleSubmitFeedback = async () => {
    setSavingData(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackEmail('');
      setShowFeedbackModal(false);
      
      showToast('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSavingData(false);
    }
  };

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
      router.push('/pricing');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userData.stripeCustomerId })
      });

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Error opening billing portal. Please try again.');
    }
  };

  // UPDATED: Class import with enhanced student data structure
  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      alert("Please fill in both class name and student names");
      return;
    }

    setSavingData(true);

    const studentsArray = newClassStudents
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => {
        return updateStudentWithCurrency({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: name,
          avatarBase: '',
          avatarLevel: 1,
          avatar: '',
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          coins: 0,
          logs: [],
          pet: null,
          // NEW SHOP FIELDS - Initialize empty for new students
          ownedAvatars: [],
          ownedPets: [],
          rewardsPurchased: [],
          inventory: [],
          coinsSpent: 0
        });
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray,
      activeQuests: [],
      questTemplates: QUEST_TEMPLATES,
      attendanceData: {},
      // NEW: Add teacher rewards storage
      teacherRewards: []
    };

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      const existingData = snap.exists() ? snap.data() : { subscription: 'basic', classes: [] };
      const maxAllowed = existingData.subscription === 'pro' ? 5 : 1;

      if (existingData.classes.length >= maxAllowed) {
        alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
        return;
      }

      const updatedClasses = [...existingData.classes, newClass];
      
      // FIXED: Save both classes and active class ID
      await setDoc(docRef, { 
        ...existingData, 
        classes: updatedClasses,
        activeClassId: newClass.id
      });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setActiveQuests([]);
      setQuestTemplates(QUEST_TEMPLATES);
      setAttendanceData({});
      setNewClassName('');
      setNewClassStudents('');
      showToast('Class imported successfully!');
    } catch (error) {
      console.error("Error importing class:", error);
      alert("Error importing class. Please try again.");
    } finally {
      setSavingData(false);
    }
  };

  // UPDATED: Load class with migration support
  const loadClass = async (cls) => {
    // FIXED: Save this as the active class
    await saveActiveClassToFirebase(cls.id);
    
    // UPDATED: Ensure all students have new shop fields
    const studentsWithCurrency = cls.students.map(student => updateStudentWithCurrency(student));
    setStudents(studentsWithCurrency);
    setCurrentClassId(cls.id);
    
    // Load quest and attendance data
    setActiveQuests(cls.activeQuests || []);
    setQuestTemplates(cls.questTemplates || QUEST_TEMPLATES);
    setAttendanceData(cls.attendanceData || {});
    
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  };

  // Shop functions
  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = (student, item) => {
    const coins = calculateCoins(student);
    const cost = item.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    spendCoins(student.id, cost);
    showToast(`${student.firstName} purchased ${item.name}!`);
  };

  const handleLootBoxPurchase = (student, lootBox) => {
    const coins = calculateCoins(student);
    const cost = lootBox.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    const rewards = generateLootBoxRewards(lootBox);
    spendCoins(student.id, cost);
    
    // Add rewards to student inventory
    setStudents(prev => prev.map(s => 
      s.id === student.id 
        ? { ...s, inventory: [...(s.inventory || []), ...rewards] }
        : s
    ));

    const rewardNames = rewards.map(r => r.name).join(', ');
    showToast(`${student.firstName} opened ${lootBox.name} and got: ${rewardNames}!`);
  };

  // Quest template management functions
  const handleAddQuestTemplate = (questData) => {
    const newTemplate = {
      ...questData,
      id: `template_${Date.now()}`,
      isCustom: true
    };
    
    setQuestTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, questData) => {
    setQuestTemplates(prev => {
      const updated = prev.map(template => 
        template.id === templateId ? { ...template, ...questData } : template
      );
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template updated successfully!');
  };

  const handleDeleteQuestTemplate = (templateId) => {
    setQuestTemplates(prev => {
      const updated = prev.filter(template => template.id !== templateId);
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template deleted successfully!');
  };

  const handleResetQuestTemplates = () => {
    setQuestTemplates(QUEST_TEMPLATES);
    saveQuestDataToFirebase({ questTemplates: QUEST_TEMPLATES });
    showToast('Quest templates reset to defaults!');
  };

  // Group management functions (for toolkit)
  const saveGroupDataToFirebase = async (groupData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                groupData,
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
      console.error("Error saving group data:", error);
    }
  };

  // Classroom management functions (for toolkit)
  const saveClassroomDataToFirebase = async (classroomData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                classroomData,
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
      console.error("Error saving classroom data:", error);
    }
  };

  // ENHANCED: Props object for all tabs with quest system and shop integration
  const tabProps = {
    students,
    setStudents,
    setActiveTab,
    handleAwardXP,
    handleAvatarClick,
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
    // Multiple XP props
    selectedStudents,
    setSelectedStudents,
    handleStudentSelect,
    handleSelectAll,
    handleDeselectAll,
    showBulkXpPanel,
    setShowBulkXpPanel,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    handleBulkXpAward,
    // ENHANCED: Quest props with quest givers
    activeQuests,
    setActiveQuests,
    questTemplates,
    setQuestTemplates,
    completeQuest,
    addQuestToActive,
    removeQuestFromActive,
    createCustomQuest,
    setShowQuestManagement,
    showQuestManagement,
    QUEST_GIVERS,
    setSelectedQuestGiver,
    selectedQuestGiver,
    saveQuestDataToFirebase,
    // Attendance props
    attendanceData,
    markAttendance,
    // Race props
    raceInProgress,
    raceFinished,
    racePositions,
    setRacePositions,
    raceWinner,
    setRaceWinner,
    selectedPrize,
    setSelectedPrize,
    xpAmount,
    setXpAmount,
    selectedPets,
    setSelectedPets,
    showRaceSetup,
    setShowRaceSetup,
    setRaceInProgress,
    setRaceFinished,
    calculateSpeed,
    checkForLevelUp,
    saveStudentsToFirebase,
    // Class props
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    teacherClasses,
    setTeacherClasses,
    currentClassId,
    setCurrentClassId,
    handleClassImport,
    loadClass,
    savingData,
    showToast,
    // Settings props
    userData,
    user,
    firestore,
    handleResetStudentPoints,
    handleResetAllPoints,
    handleResetPetSpeeds,
    handleRemoveStudent,
    handleSubscriptionManagement,
    setShowConfirmDialog,
    setShowFeedbackModal,
    feedbackType,
    setFeedbackType,
    feedbackSubject,
    setFeedbackSubject,
    feedbackMessage,
    setFeedbackMessage,
    feedbackEmail,
    setFeedbackEmail,
    handleSubmitFeedback,
    showFeedbackModal,
    router,
    // Shop props - ENHANCED with new functionality
    selectedStudent,
    setSelectedStudent,
    calculateCoins,
    canAfford,
    spendCoins,
    SHOP_ITEMS,
    ITEM_RARITIES,
    LOOT_BOX_ITEMS,
    generateLootBoxRewards,
    setSavingData,
    handleShopStudentSelect,
    handleShopPurchase,
    handleLootBoxPurchase,
    CurrencyDisplay,
    // Settings Functions
    handleDeductXP,
    handleDeductCurrency,
    // Quest Template Management (for Settings tab)
    handleAddQuestTemplate,
    handleEditQuestTemplate,
    handleDeleteQuestTemplate,
    handleResetQuestTemplates,
    // Group Management
    saveGroupDataToFirebase,
    // Classroom Management
    saveClassroomDataToFirebase,
    currentClassId,
    // Quest Giver Functions
    showRandomQuestGiverTip,
    setShowQuestGiverTip,
    // NEW SHOP INTEGRATION PROPS
    updateStudentWithCurrency
  };

  // Modal props
  const modalProps = {
    // Common
    students,
    setStudents,
    AVAILABLE_AVATARS,
    getAvatarImage,
    getRandomPetName,
    saveStudentsToFirebase,
    showToast,
    setSavingData,
    // Character sheet
    selectedStudent,
    setSelectedStudent,
    handleAvatarClick,
    // Avatar selection
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    handleAvatarChange,
    savingData,
    // Level up
    levelUpData,
    setLevelUpData,
    // Pet unlock
    petUnlockData,
    setPetUnlockData,
    petNameInput,
    setPetNameInput,
    // Add student
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
    // Race
    raceFinished,
    setRaceFinished,
    raceWinner,
    selectedPrize,
    xpAmount,
    showRaceSetup,
    setShowRaceSetup,
    selectedPets,
    setSelectedPets,
    setRacePositions,
    setRaceInProgress,
    setRaceWinner,
    // Quest completion
    questCompletionData,
    setQuestCompletionData,
    showQuestCompletion,
    setShowQuestCompletion,
    // Currency utilities
    calculateCoins,
    // NEW: Enhanced modals for shop
    handleDeselectAll
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  // Pet racing effect
  useEffect(() => {
    if (!raceInProgress || raceFinished) return;

    const interval = setInterval(() => {
      setRacePositions(prev => {
        const updated = { ...prev };
        let hasWinner = false;

        // Check if race should finish
        if (Object.values(updated).some(pos => pos >= FINISH_LINE_POSITION)) {
          setRaceInProgress(false);
          setRaceFinished(true);

          // Find winner
          const maxPosition = Math.max(...Object.values(updated));
          const winnerId = Object.keys(updated).find(id => updated[id] === maxPosition);
          const winnerStudent = students.find(s => s.id === winnerId);
          
          if (winnerStudent) {
            setRaceWinner(winnerStudent);

            // Update winner's pet stats and award prize
            setStudents(prev => {
              const updatedStudents = prev.map(s => {
                if (s.id === winnerId) {
                  let updated = {
                    ...s,
                    pet: {
                      ...s.pet,
                      wins: (s.pet.wins || 0) + 1,
                      speed: (s.pet.speed || 1) + 0.02
                    },
                  };

                  if (selectedPrize === 'XP') {
                    updated.totalPoints = (updated.totalPoints || 0) + xpAmount;
                    return checkForLevelUp(updated);
                  }

                  return updated;
                }
                return s;
              });

              saveStudentsToFirebase(updatedStudents);
              return updatedStudents;
            });
          }

          return updated;
        }

        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const speed = calculateSpeed(student.pet);
          const baseStep = speed * 2;
          const randomMultiplier = 0.8 + Math.random() * 0.4;
          const step = baseStep * randomMultiplier;
          
          const currentPosition = updated[id] || 0;
          const newPosition = Math.min(currentPosition + step, FINISH_LINE_POSITION);
          
          updated[id] = newPosition;
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, selectedPrize, xpAmount, raceFinished]);

  // UPDATED: Authentication and user data management with data migration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);

          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);

            let savedClasses = data.classes || [];
            
            // MIGRATION: Migrate existing classes to new data structure
            let needsUpdate = false;
            const migratedClasses = await Promise.all(
              savedClasses.map(async (cls) => {
                const hasOldData = cls.students.some(s => s.ownedAvatars === undefined);
                if (hasOldData) {
                  needsUpdate = true;
                  console.log(`Migrating class: ${cls.name}`);
                  return await migrateClassData(cls);
                }
                return cls;
              })
            );

            // Save migrated data back to Firebase if needed
            if (needsUpdate) {
              console.log('Saving migrated data to Firebase...');
              await setDoc(docRef, { 
                ...data, 
                classes: migratedClasses 
              });
              showToast('Data updated for new shop features!');
            }

            setTeacherClasses(migratedClasses);

            if (migratedClasses.length > 0) {
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? migratedClasses.find(cls => cls.id === activeClassId)
                : migratedClasses[0]; // Fallback to first class if no active class set
              
              if (activeClass) {
                await loadClass(activeClass);
              } else {
                // If activeClassId doesn't match any class, load the first one and update activeClassId
                const firstClass = migratedClasses[0];
                await loadClass(firstClass);
                await saveActiveClassToFirebase(firstClass.id);
              }
            } else {
              setStudents([]);
              setCurrentClassId(null);
              // Initialize with empty quest data
              setActiveQuests([]);
              setQuestTemplates(QUEST_TEMPLATES);
              setAttendanceData({});
            }

            // Redirect to dashboard if trying to access toolkit without PRO
            if (activeTab === 'toolkit' && data.subscription !== 'pro') {
              setActiveTab('dashboard');
            }
          } else {
            const defaultData = { subscription: 'basic', classes: [] };
            await setDoc(docRef, defaultData);
            setUserData(defaultData);
            setTeacherClasses([]);
            setStudents([]);
            setCurrentClassId(null);
            setActiveQuests([]);
            setQuestTemplates(QUEST_TEMPLATES);
            setAttendanceData({});
            
            if (activeTab === 'toolkit') {
              setActiveTab('dashboard');
            }
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error in auth listener:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Classroom Champions</h2>
          <p className="text-gray-500">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Classroom Champions
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'shop', label: 'Shop', icon: '🏪' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            { id: 'games', label: 'Games', icon: '🎮' }, // ADDED: Games Tab
            ...(userData?.subscription === 'pro' ? [{ id: 'toolkit', label: 'Teachers Toolkit', icon: '🛠️', isPro: true }] : []),
            { id: 'classes', label: 'My Classes', icon: '📚' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tab.isPro 
                  ? (activeTab === tab.id 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105" 
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg")
                  : (activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg")
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isPro && (
                <span className="bg-yellow-400 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content with Suspense */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <Suspense fallback={<TabLoadingSpinner />}>
            {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
            {activeTab === 'students' && <StudentsTab {...tabProps} />}
            {activeTab === 'shop' && <ShopTab {...tabProps} />}
            {activeTab === 'race' && <PetRaceTab {...tabProps} />}
            {activeTab === 'games' && <GamesTab {...tabProps} />}
            {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
            {activeTab === 'classes' && <ClassesTab {...tabProps} />}
            {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* ENHANCED: Quest Management Modal */}
      <QuestManagementModal
        isOpen={showQuestManagement}
        onClose={() => setShowQuestManagement(false)}
        questTemplates={questTemplates}
        currentQuests={activeQuests}
        onAddQuest={addQuestToActive}
        onRemoveQuest={removeQuestFromActive}
        onCreateCustomQuest={createCustomQuest}
      />

      {/* ENHANCED: Quest Giver Modal */}
      {selectedQuestGiver && (
        <QuestGiverModal
          quest={selectedQuestGiver}
          onComplete={completeQuest}
          onClose={() => setSelectedQuestGiver(null)}
        />
      )}

      {/* ENHANCED: Quest Giver Tip */}
      {showQuestGiverTip && (
        <QuestGiverTip
          questGiverId={showQuestGiverTip}
          onClose={() => setShowQuestGiverTip(null)}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{showConfirmDialog.icon}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{showConfirmDialog.title}</h2>
              <p className="text-gray-600">{showConfirmDialog.message}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showConfirmDialog.onConfirm();
                  setShowConfirmDialog(null);
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                {showConfirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">💬 Send Feedback</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="improvement">⚡ Improvement</option>
                  <option value="general">💬 General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Brief description of your feedback"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  rows="4"
                  placeholder="Please provide detailed feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={savingData || !feedbackSubject.trim() || !feedbackMessage.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
              >
                {savingData ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Modals */}
      <Suspense fallback={null}>
        {/* Character Sheet Modal */}
        {selectedStudent && (
          <CharacterSheetModal
            {...modalProps}
            student={selectedStudent}
          />
        )}

        {/* Avatar Selection Modal */}
        <AvatarSelectionModal {...modalProps} />

        {/* Level Up Modal */}
        {levelUpData && (
          <LevelUpModal
            {...modalProps}
            levelUpData={levelUpData}
          />
        )}

        {/* Pet Unlock Modal */}
        {petUnlockData && (
          <PetUnlockModal
            {...modalProps}
            petUnlockData={petUnlockData}
          />
        )}

        {/* Add Student Modal */}
        <AddStudentModal {...modalProps} />

        {/* Race Winner Modal */}
        {raceFinished && raceWinner && (
          <RaceWinnerModal
            {...modalProps}
            raceWinner={raceWinner}
          />
        )}

        {/* Race Setup Modal */}
        {showRaceSetup && (
          <RaceSetupModal {...modalProps} />
        )}

        {/* Quest Completion Modal */}
        {showQuestCompletion && questCompletionData && (
          <QuestCompletionModal
            {...modalProps}
            questData={questCompletionData}
          />
        )}
      </Suspense>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-semibold animate-slide-up ${
              toast.type === 'success' ? 'bg-green-600' :
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}