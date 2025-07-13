// classroom-champions.js - COMPLETE WITH QUEST SYSTEM OVERHAUL + GAMES TAB
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
    questTypes: ['organization', 'attendance', 'responsibility'],
    tips: [
      "⏰ Tip: Being on time shows respect for others!",
      "📋 Organization today prevents chaos tomorrow!",
      "✅ Small responsible actions build great character!"
    ]
  },
  {
    id: 'guide3',
    name: 'Sunny the Motivator',
    image: '/Guides/Guide 3.png',
    personality: 'energetic',
    role: 'Encouragement Specialist',
    specialty: 'motivation',
    greetings: [
      "You're doing amazing! Keep shining! ✨",
      "Every day is a new chance to be awesome!",
      "Your potential is unlimited! Let's unlock it!"
    ],
    questTypes: ['participation', 'improvement', 'goals'],
    tips: [
      "⭐ Tip: Celebrate small wins - they add up!",
      "🌟 Your effort matters more than perfection!",
      "🚀 Believe in yourself - others believe in you too!"
    ]
  },
  {
    id: 'guide4',
    name: 'Guardian Spirit',
    image: '/Guides/Guide 4.png',
    personality: 'protective',
    role: 'Behavior Quest Giver',
    specialty: 'respect',
    greetings: [
      "Kindness and respect make the strongest warriors.",
      "Protecting others starts with respectful actions.",
      "True strength comes from lifting others up."
    ],
    questTypes: ['kindness', 'respect', 'helping'],
    tips: [
      "🛡️ Tip: Kindness is a superpower everyone can have!",
      "🤝 Helping others helps you grow too!",
      "💙 Respect creates a safe space for everyone!"
    ]
  },
  {
    id: 'guide5',
    name: 'Sage Elder',
    image: '/Guides/Guide 5.png',
    personality: 'wise',
    role: 'Reflection Guide',
    specialty: 'growth',
    greetings: [
      "Reflection brings wisdom, young one.",
      "How have you grown today?",
      "The journey of learning never ends."
    ],
    questTypes: ['reflection', 'improvement', 'goals'],
    tips: [
      "🔮 Tip: Reflecting on mistakes helps you learn!",
      "🌱 Growth happens outside your comfort zone!",
      "📈 Progress, not perfection, is the goal!"
    ]
  },
  {
    id: 'guide6',
    name: 'Explorer Pete',
    image: '/Guides/Guide 6.png',
    personality: 'adventurous',
    role: 'Discovery Quest Giver',
    specialty: 'exploration',
    greetings: [
      "Adventure awaits around every corner! 🗺️",
      "What new territory will you explore today?",
      "The best discoveries come from curiosity!"
    ],
    questTypes: ['exploration', 'creativity', 'projects'],
    tips: [
      "🗺️ Tip: Ask questions - they lead to discoveries!",
      "🔍 Curiosity is your best learning tool!",
      "🎒 Every lesson is a new adventure!"
    ]
  },
  {
    id: 'guide7',
    name: 'The Grand Wizard',
    image: '/Guides/Guide 7.png',
    personality: 'magical',
    role: 'Master Quest Giver',
    specialty: 'all',
    greetings: [
      "Magic happens when effort meets opportunity! ✨",
      "You have the power to achieve greatness!",
      "Let the magic of learning transform you!"
    ],
    questTypes: ['mastery', 'special', 'achievement'],
    tips: [
      "✨ Tip: Every skill you learn is like casting a spell!",
      "🎭 Practice turns ordinary students into heroes!",
      "🌟 The real magic is in never giving up!"
    ]
  }
];

// Enhanced Quest Templates
const QUEST_TEMPLATES = [
  // Academic Quests
  {
    id: 'complete_homework',
    title: 'Homework Hero',
    description: 'Complete and submit today\'s homework',
    category: 'academic',
    type: 'manual',
    icon: '📝',
    questGiver: 'guide1',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'easy',
    estimatedTime: '30-60 minutes'
  },
  {
    id: 'participate_discussion',
    title: 'Discussion Champion',
    description: 'Actively participate in class discussion',
    category: 'academic',
    type: 'manual',
    icon: '💬',
    questGiver: 'guide3',
    reward: { type: 'coins', amount: 2 },
    difficulty: 'easy',
    estimatedTime: 'During class'
  },
  {
    id: 'ask_question',
    title: 'Curious Explorer',
    description: 'Ask a thoughtful question during class',
    category: 'academic',
    type: 'manual',
    icon: '❓',
    questGiver: 'guide6',
    reward: { type: 'coins', amount: 2 },
    difficulty: 'easy',
    estimatedTime: 'During class'
  },
  {
    id: 'earn_xp_learner',
    title: 'Learning Master',
    description: 'Earn 5 Learner XP',
    category: 'academic',
    type: 'auto',
    requirement: { type: 'xp', category: 'Learner', amount: 5 },
    icon: '📚',
    questGiver: 'guide1',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'medium',
    estimatedTime: 'Throughout day'
  },

  // Behavior/Respect Quests
  {
    id: 'help_classmate',
    title: 'Helpful Friend',
    description: 'Help a classmate with their work',
    category: 'behavior',
    type: 'manual',
    icon: '🤝',
    questGiver: 'guide4',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'easy',
    estimatedTime: '10-15 minutes'
  },
  {
    id: 'earn_xp_respectful',
    title: 'Respect Champion',
    description: 'Earn 5 Respectful XP',
    category: 'behavior',
    type: 'auto',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    icon: '👍',
    questGiver: 'guide4',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'medium',
    estimatedTime: 'Throughout day'
  },
  {
    id: 'kind_action',
    title: 'Kindness Warrior',
    description: 'Perform a random act of kindness',
    category: 'behavior',
    type: 'manual',
    icon: '💝',
    questGiver: 'guide4',
    reward: { type: 'coins', amount: 4 },
    difficulty: 'easy',
    estimatedTime: 'Anytime'
  },

  // Responsibility Quests
  {
    id: 'perfect_attendance',
    title: 'Attendance Star',
    description: 'Attend all classes today',
    category: 'responsibility',
    type: 'auto',
    requirement: { type: 'attendance', period: 'daily' },
    icon: '⭐',
    questGiver: 'guide2',
    reward: { type: 'coins', amount: 2 },
    difficulty: 'easy',
    estimatedTime: 'All day'
  },
  {
    id: 'organized_materials',
    title: 'Organization Expert',
    description: 'Keep your materials organized all day',
    category: 'responsibility',
    type: 'manual',
    icon: '📋',
    questGiver: 'guide2',
    reward: { type: 'coins', amount: 2 },
    difficulty: 'easy',
    estimatedTime: 'All day'
  },
  {
    id: 'earn_xp_responsible',
    title: 'Responsibility Master',
    description: 'Earn 5 Responsible XP',
    category: 'responsibility',
    type: 'auto',
    requirement: { type: 'xp', category: 'Responsible', amount: 5 },
    icon: '💼',
    questGiver: 'guide2',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'medium',
    estimatedTime: 'Throughout day'
  },

  // Weekly Challenges
  {
    id: 'week_attendance',
    title: 'Perfect Week',
    description: 'Attend all classes this week',
    category: 'weekly',
    type: 'auto',
    requirement: { type: 'attendance', period: 'weekly' },
    icon: '🏆',
    questGiver: 'guide7',
    reward: { type: 'coins', amount: 10 },
    difficulty: 'hard',
    estimatedTime: 'All week'
  },
  {
    id: 'improvement_goal',
    title: 'Growth Tracker',
    description: 'Show improvement in your chosen area',
    category: 'weekly',
    type: 'manual',
    icon: '📈',
    questGiver: 'guide5',
    reward: { type: 'coins', amount: 8 },
    difficulty: 'medium',
    estimatedTime: 'All week'
  },
  {
    id: 'creativity_project',
    title: 'Creative Explorer',
    description: 'Complete a creative project or presentation',
    category: 'weekly',
    type: 'manual',
    icon: '🎨',
    questGiver: 'guide6',
    reward: { type: 'coins', amount: 6 },
    difficulty: 'medium',
    estimatedTime: 'Multiple days'
  }
];

// ===============================================
// CONSTANTS AND CONFIGURATIONS (EXISTING)
// ===============================================

const MAX_LEVEL = 4;
const COINS_PER_XP = 5; // 1 coin per 5 XP

const ITEM_RARITIES = {
  common: { 
    name: 'Common', 
    color: 'gray', 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    chance: 60
  },
  rare: { 
    name: 'Rare', 
    color: 'blue', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    chance: 30
  },
  epic: { 
    name: 'Epic', 
    color: 'purple', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    chance: 8
  },
  legendary: { 
    name: 'Legendary', 
    color: 'yellow', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    chance: 2
  }
};

const SHOP_ITEMS = [
  // Cosmetic Items
  {
    id: 'crown',
    name: 'Golden Crown',
    description: 'A majestic crown for classroom royalty',
    price: 10,
    type: 'cosmetic',
    rarity: 'epic',
    icon: '👑',
    category: 'accessories'
  },
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    description: 'Channel your inner magic user',
    price: 6,
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🧙‍♂️',
    category: 'accessories'
  },
  {
    id: 'sunglasses',
    name: 'Cool Sunglasses',
    description: 'Look effortlessly cool',
    price: 3,
    type: 'cosmetic',
    rarity: 'common',
    icon: '😎',
    category: 'accessories'
  },
  {
    id: 'cape',
    name: 'Superhero Cape',
    description: 'Be the hero of your classroom',
    price: 8,
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🦸‍♂️',
    category: 'accessories'
  },
  
  // Power-ups
  {
    id: 'double_xp',
    name: 'Double XP Boost',
    description: 'Double XP for your next 5 actions',
    price: 8,
    type: 'powerup',
    rarity: 'rare',
    icon: '⚡',
    category: 'powerups',
    effect: 'double_xp_5'
  },
  {
    id: 'pet_treat',
    name: 'Pet Speed Boost',
    description: 'Permanently increase your pet\'s speed',
    price: 12,
    type: 'powerup',
    rarity: 'epic',
    icon: '🍖',
    category: 'powerups',
    effect: 'pet_speed_boost'
  },
  {
    id: 'luck_charm',
    name: 'Lucky Charm',
    description: 'Increase your loot box luck for 24 hours',
    price: 5,
    type: 'powerup',
    rarity: 'common',
    icon: '🍀',
    category: 'powerups',
    effect: 'luck_boost_24h'
  },
  
  // Loot Boxes
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 3 random items',
    price: 4,
    type: 'lootbox',
    rarity: 'common',
    icon: '📦',
    category: 'lootboxes',
    contents: { count: 3, rarityBonus: 0 }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 5 random items with better odds',
    price: 8,
    type: 'lootbox',
    rarity: 'rare',
    icon: '🎁',
    category: 'lootboxes',
    contents: { count: 5, rarityBonus: 15 }
  },
  {
    id: 'legendary_box',
    name: 'Legendary Loot Box',
    description: 'Contains 7 items with guaranteed rare+',
    price: 15,
    type: 'lootbox',
    rarity: 'legendary',
    icon: '💎',
    category: 'lootboxes',
    contents: { count: 7, rarityBonus: 30, guaranteedRare: true }
  },
  
  // Collectibles
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

// ===============================================
// QUEST GIVER COMPONENTS
// ===============================================

const QuestGiverTip = ({ questGiverId, onClose }) => {
  const questGiver = QUEST_GIVERS.find(qg => qg.id === questGiverId);
  if (!questGiver) return null;

  const randomTip = questGiver.tips[Math.floor(Math.random() * questGiver.tips.length)];
  const randomGreeting = questGiver.greetings[Math.floor(Math.random() * questGiver.greetings.length)];

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border-2 border-blue-200 max-w-sm z-50 animate-slide-up">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <img 
            src={questGiver.image} 
            alt={questGiver.name}
            className="w-16 h-16 rounded-full border-2 border-blue-300"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-blue-800">{questGiver.name}</h4>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-blue-600 mb-2">{randomGreeting}</p>
            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{randomTip}</p>
          </div>
        </div>
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
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-modal-appear">
        <div className="p-6">
          <div className="text-center mb-6">
            <img 
              src={questGiver.image} 
              alt={questGiver.name}
              className="w-24 h-24 mx-auto rounded-full border-4 border-blue-300 mb-4"
            />
            <h2 className="text-2xl font-bold text-blue-800">{questGiver.name}</h2>
            <p className="text-blue-600">{questGiver.role}</p>
            <p className="text-gray-600 mt-2">{randomGreeting}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{quest.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{quest.title}</h3>
                <p className="text-sm text-gray-600">Difficulty: {quest.difficulty}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{quest.description}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>⏱️ {quest.estimatedTime}</span>
              <span>💰 {quest.reward.amount} coins</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Close
            </button>
            {quest.type === 'manual' && (
              <button
                onClick={() => {
                  onComplete(quest.id);
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Mark Complete
              </button>
            )}
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    category: 'academic',
    type: 'manual',
    icon: '📝',
    questGiver: 'guide1',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'easy',
    estimatedTime: '30 minutes'
  });

  const categories = ['all', 'academic', 'behavior', 'responsibility', 'weekly'];
  const filteredTemplates = selectedCategory === 'all' 
    ? questTemplates 
    : questTemplates.filter(q => q.category === selectedCategory);

  const handleCreateQuest = () => {
    const customQuest = {
      ...newQuest,
      id: `custom-${Date.now()}`,
    };
    onCreateCustomQuest(customQuest);
    setShowCreateForm(false);
    setNewQuest({
      title: '',
      description: '',
      category: 'academic',
      type: 'manual',
      icon: '📝',
      questGiver: 'guide1',
      reward: { type: 'coins', amount: 3 },
      difficulty: 'easy',
      estimatedTime: '30 minutes'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Quest Management</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {!showCreateForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  + Create Custom Quest
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map(quest => {
                  const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
                  const isActive = currentQuests.some(q => q.templateId === quest.id);

                  return (
                    <div key={quest.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <img 
                          src={questGiver?.image} 
                          alt={questGiver?.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{quest.icon}</span>
                            <h3 className="font-bold">{quest.title}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                          <div className="flex justify-between text-xs text-gray-500 mb-3">
                            <span>{quest.category}</span>
                            <span>{quest.difficulty}</span>
                            <span>💰 {quest.reward.amount}</span>
                          </div>
                          <div className="flex gap-2">
                            {isActive ? (
                              <button
                                onClick={() => onRemoveQuest(quest.id)}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => onAddQuest(quest)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                              >
                                Add to Active
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold mb-6">Create Custom Quest</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Title</label>
                    <input
                      type="text"
                      value={newQuest.title}
                      onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quest title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                    <input
                      type="text"
                      value={newQuest.icon}
                      onChange={(e) => setNewQuest({...newQuest, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="📝"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe what students need to do"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={newQuest.category}
                      onChange={(e) => setNewQuest({...newQuest, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="academic">Academic</option>
                      <option value="behavior">Behavior</option>
                      <option value="responsibility">Responsibility</option>
                      <option value="weekly">Weekly Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                    <select
                      value={newQuest.type}
                      onChange={(e) => setNewQuest({...newQuest, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Manual (Teacher marks complete)</option>
                      <option value="auto">Automatic (XP based)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Giver</label>
                    <select
                      value={newQuest.questGiver}
                      onChange={(e) => setNewQuest({...newQuest, questGiver: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {QUEST_GIVERS.map(qg => (
                        <option key={qg.id} value={qg.id}>{qg.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={newQuest.difficulty}
                      onChange={(e) => setNewQuest({...newQuest, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reward (Coins)</label>
                    <input
                      type="number"
                      value={newQuest.reward.amount}
                      onChange={(e) => setNewQuest({
                        ...newQuest, 
                        reward: {...newQuest.reward, amount: parseInt(e.target.value)}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Time</label>
                    <input
                      type="text"
                      value={newQuest.estimatedTime}
                      onChange={(e) => setNewQuest({...newQuest, estimatedTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 30 minutes"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateQuest}
                    disabled={!newQuest.title || !newQuest.description}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Create Quest
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// ATTENDANCE TRACKING COMPONENT
// ===============================================

const AttendanceTracker = ({ students, onMarkAttendance, attendanceData, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  
  const getAttendanceForDate = (studentId, date) => {
    return attendanceData?.[date]?.[studentId] || 'unmarked';
  };

  const markAttendance = (studentId, status) => {
    onMarkAttendance(studentId, selectedDate, status);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">📅 Attendance Tracker</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        {students.map(student => {
          const attendance = getAttendanceForDate(student.id, selectedDate);
          
          return (
            <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={student.avatar || '/avatars/default.png'} 
                  alt={student.firstName}
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                />
                <span className="font-medium">{student.firstName}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => markAttendance(student.id, 'present')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attendance === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-green-200'
                  }`}
                >
                  ✅ Present
                </button>
                <button
                  onClick={() => markAttendance(student.id, 'absent')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attendance === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-red-200'
                  }`}
                >
                  ❌ Absent
                </button>
                <button
                  onClick={() => markAttendance(student.id, 'late')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    attendance === 'late'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
                  }`}
                >
                  ⏰ Late
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===============================================
// UTILITY FUNCTIONS - ENHANCED
// ===============================================

// Enhanced quest checking functions
const checkQuestRequirement = (quest, student, attendanceData) => {
  if (!quest.requirement) return false;

  const { type, category, amount, period } = quest.requirement;

  switch (type) {
    case 'xp':
      const categoryPoints = student.categoryWeekly?.[category] || 0;
      return categoryPoints >= amount;
    
    case 'attendance':
      if (period === 'daily') {
        const today = new Date().toISOString().split('T')[0];
        return attendanceData?.[today]?.[student.id] === 'present';
      } else if (period === 'weekly') {
        const weekDates = getWeekDates();
        return weekDates.every(date => 
          attendanceData?.[date]?.[student.id] === 'present'
        );
      }
      return false;
    
    default:
      return false;
  }
};

const getWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1);
  
  const weekDates = [];
  for (let i = 0; i < 5; i++) { // Monday to Friday
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDates.push(date.toISOString().split('T')[0]);
  }
  return weekDates;
};

// Random quest giver tip selector
const getRandomQuestGiverTip = () => {
  const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
  const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
  return { questGiver: randomGiver, tip: randomTip };
};

// FIXED: Calculate coins based on both XP and separate coins field
const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

const canAfford = (student, cost) => {
  const coins = calculateCoins(student);
  return coins >= cost;
};

const spendCoins = (student, cost) => {
  const coins = calculateCoins(student);
  if (coins >= cost) {
    // Deduct from bonus coins first, then from XP coins if needed
    const bonusCoins = student?.coins || 0;
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    
    let newBonusCoins = bonusCoins;
    let newTotalPoints = student?.totalPoints || 0;
    
    if (cost <= bonusCoins) {
      // Can pay with bonus coins only
      newBonusCoins = bonusCoins - cost;
    } else {
      // Need to use XP coins too
      const remainingCost = cost - bonusCoins;
      newBonusCoins = 0;
      newTotalPoints = Math.max(0, newTotalPoints - (remainingCost * COINS_PER_XP));
    }
    
    return {
      ...student,
      coins: newBonusCoins,
      totalPoints: newTotalPoints,
      coinsSpent: (student.coinsSpent || 0) + cost,
      logs: [
        ...(student.logs || []),
        {
          type: "purchase",
          amount: -cost,
          date: new Date().toISOString(),
          source: "shop_purchase",
        },
      ],
    };
  }
  return student;
};

// FIXED: Award bonus coins (from quests)
const awardCoins = (student, coinAmount) => {
  return {
    ...student,
    coins: (student.coins || 0) + coinAmount,
    logs: [
      ...(student.logs || []),
      {
        type: "quest_coins",
        amount: coinAmount,
        date: new Date().toISOString(),
        source: "quest_completion",
      },
    ],
  };
};

const generateLootBoxRewards = (lootBox) => {
  const rewards = [];
  const { count, rarityBonus, guaranteedRare } = lootBox.contents;
  
  for (let i = 0; i < count; i++) {
    let rarity = 'common';
    const roll = Math.random() * 100;
    
    // Apply rarity bonus
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

const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null
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

  // Attendance tracking states
  const [attendanceData, setAttendanceData] = useState({});

  // Settings states
  const [userData, setUserData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // UX states
  const [savingData, setSavingData] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');
  const [animatingXP, setAnimatingXP] = useState({});

  // ===============================================
  // ENHANCED FUNCTION DEFINITIONS
  // ===============================================

  const showToast = (message) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
  };

  // FIXED: Add function to save active class ID
  const saveActiveClassToFirebase = async (classId) => {
    if (!user) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        await setDoc(docRef, { ...data, activeClassId: classId });
        console.log("✅ Active class ID saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving active class ID:", error);
    }
  };

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Student data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving student data:", error);
    }
  };

  // ENHANCED: Quest data saving
  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...questData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Quest data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving quest data:", error);
    }
  };

  // ENHANCED: Attendance data saving
  const saveAttendanceToFirebase = async (attendanceData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, attendanceData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Attendance data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving attendance data:", error);
    }
  };

  // Group data saving
  const saveGroupDataToFirebase = async (groupData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, groupData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Group data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving group data:", error);
    }
  };

  // Classroom layout data saving
  const saveClassroomDataToFirebase = async (classroomData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, classroomData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Classroom data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving classroom data:", error);
    }
  };

  // ENHANCED: Quest Management Functions
  const addQuestToActive = (questTemplate) => {
    const newQuest = {
      ...questTemplate,
      id: `active-${Date.now()}`,
      templateId: questTemplate.id,
      startDate: new Date().toISOString().split('T')[0],
      completedBy: [],
      active: true
    };

    setActiveQuests(prev => [...prev, newQuest]);
    saveQuestDataToFirebase({ activeQuests: [...activeQuests, newQuest] });
    showToast(`Added "${questTemplate.title}" to active quests!`);
  };

  const removeQuestFromActive = (templateId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(q => q.templateId !== templateId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    showToast('Quest removed from active list!');
  };

  const createCustomQuest = (customQuest) => {
    setQuestTemplates(prev => {
      const updated = [...prev, customQuest];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    showToast('Custom quest created successfully!');
  };

  const completeQuest = (questId, studentId = null) => {
    const quest = activeQuests.find(q => q.id === questId);
    if (!quest) return;

    const completionKey = studentId || 'class';
    if (quest.completedBy.includes(completionKey)) return;

    // Update quest completion
    const updatedQuests = activeQuests.map(q => 
      q.id === questId ? { ...q, completedBy: [...q.completedBy, completionKey] } : q
    );

    setActiveQuests(updatedQuests);

    // Award rewards
    if (quest.reward.type === 'coins') {
      setStudents(prev => {
        const rewardedStudents = prev.map(student => {
          if (studentId && student.id !== studentId) return student;
          
          if (!studentId || student.id === studentId) {
            return awardCoins(student, quest.reward.amount);
          }
          return student;
        });
        
        saveStudentsToFirebase(rewardedStudents);
        return rewardedStudents;
      });
    }

    // Show completion modal with quest giver
    setQuestCompletionData({
      quest,
      studentId,
      student: studentId ? students.find(s => s.id === studentId) : null,
      questGiver: QUEST_GIVERS.find(qg => qg.id === quest.questGiver)
    });
    setShowQuestCompletion(true);

    // Save to Firebase
    saveQuestDataToFirebase({ activeQuests: updatedQuests });
  };

  // ENHANCED: Quest checking with attendance
  const checkQuestCompletionSafely = (studentId, updatedStudents) => {
    const student = updatedStudents.find(s => s.id === studentId);
    if (!student) return;

    activeQuests.forEach(quest => {
      if (quest.type === 'auto' && !quest.completedBy.includes(studentId)) {
        if (checkQuestRequirement(quest, student, attendanceData)) {
          setTimeout(() => completeQuest(quest.id, studentId), 100);
        }
      }
    });
  };

  // ENHANCED: Attendance management
  const markAttendance = (studentId, date, status) => {
    setAttendanceData(prev => {
      const updated = {
        ...prev,
        [date]: {
          ...prev[date],
          [studentId]: status
        }
      };
      saveAttendanceToFirebase(updated);
      
      // Check attendance-based quests
      const student = students.find(s => s.id === studentId);
      if (student && status === 'present') {
        setTimeout(() => checkQuestCompletionSafely(studentId, students), 100);
      }
      
      return updated;
    });
    
    showToast(`${status.charAt(0).toUpperCase() + status.slice(1)} marked for ${students.find(s => s.id === studentId)?.firstName}`);
  };

  // Quest Giver Tip System
  const showRandomQuestGiverTip = () => {
    const { questGiver } = getRandomQuestGiverTip();
    setShowQuestGiverTip(questGiver.id);
    setTimeout(() => setShowQuestGiverTip(null), 8000); // Auto-hide after 8 seconds
  };

  // Trigger tips periodically (you can customize this)
  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (Math.random() < 0.1 && !showQuestGiverTip) { // 10% chance every interval
        showRandomQuestGiverTip();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(tipInterval);
  }, [showQuestGiverTip]);

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

  // Settings functions
  const handleDeductXP = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId ? {
          ...s,
          totalPoints: Math.max(0, s.totalPoints - amount),
          weeklyPoints: Math.max(0, (s.weeklyPoints || 0) - amount),
          logs: [
            ...(s.logs || []),
            {
              type: "deduction",
              amount: -amount,
              date: new Date().toISOString(),
              source: "manual_deduction",
            },
          ],
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast(`Deducted ${amount} XP successfully!`);
  };

  const handleDeductCurrency = (studentId, coinAmount) => {
    if (coinAmount <= 0) {
      alert("Please enter a positive amount");
      return;
    }
    
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== studentId) return s;
        
        const currentCoins = calculateCoins(s);
        if (currentCoins < coinAmount) {
          alert(`Student only has ${currentCoins} coins available`);
          return s;
        }
        
        return {
          ...s,
          coins: Math.max(0, (s.coins || 0) - coinAmount),
          logs: [
            ...(s.logs || []),
            {
              type: "currency_deduction",
              amount: -coinAmount,
              date: new Date().toISOString(),
              source: "manual_currency_deduction",
            },
          ],
        };
      });
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast(`Deducted ${coinAmount} coins successfully!`);
  };

  // Reset functions
  const handleResetStudentPoints = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId ? {
          ...s,
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          avatarLevel: 1,
          avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
          pet: null,
          coins: 0,
          inventory: [],
          lootBoxes: [],
          coinsSpent: 0,
          logs: [
            ...(s.logs || []),
            {
              type: "full_reset",
              amount: 0,
              date: new Date().toISOString(),
              source: "complete_reset",
            },
          ],
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student completely reset successfully!');
  };

  const handleResetAllPoints = async () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => ({
        ...s,
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        avatarLevel: 1,
        avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
        pet: null,
        coins: 0,
        inventory: [],
        lootBoxes: [],
        coinsSpent: 0,
        logs: [
          ...(s.logs || []),
          {
            type: "bulk_reset",
            amount: 0,
            date: new Date().toISOString(),
            source: "bulk_reset",
          },
        ],
      }));
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All students completely reset successfully!');
  };

  const handleResetPetSpeeds = async () => {
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
    showToast('Pet speeds reset successfully!');
  };

  const handleRemoveStudent = async (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.filter(s => s.id !== studentId);
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student removed successfully!');
  };

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

  // FIXED: Class import with proper quest initialization and active class setting
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
          pet: null
        });
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray,
      activeQuests: [],
      questTemplates: QUEST_TEMPLATES,
      attendanceData: {}
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

  // FIXED: Load class with proper quest initialization and active class saving
  const loadClass = async (cls) => {
    // FIXED: Save this as the active class
    await saveActiveClassToFirebase(cls.id);
    
    const studentsWithCurrency = cls.students.map(updateStudentWithCurrency);
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
      alert(`${student.firstName} doesn't have enough coins! Needs ${cost}, has ${coins}`);
      return;
    }

    setSavingData(true);
    
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
        
        const newItem = {
          ...item,
          id: `${item.id}_${Date.now()}`,
          purchasedAt: new Date().toISOString()
        };
        
        return {
          ...updatedStudent,
          inventory: [...(updatedStudent.inventory || []), newItem]
        };
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    showToast(`${student.firstName} purchased ${item.name}!`);
  };

  const handleLootBoxPurchase = (student, lootBox) => {
    const coins = calculateCoins(student);
    const cost = lootBox.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    setSavingData(true);
    
    const rewards = generateLootBoxRewards(lootBox);
    
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
        
        return {
          ...updatedStudent,
          lootBoxes: [...(updatedStudent.lootBoxes || []), {
            boxType: lootBox.id,
            rewards: rewards,
            openedAt: new Date().toISOString()
          }]
        };
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    
    const rewardsList = rewards.map(r => r.name).join(', ');
    showToast(`${student.firstName} opened ${lootBox.name} and got: ${rewardsList}!`);
  };

  // ENHANCED: Quest Template Management Functions
  const handleAddQuestTemplate = (questTemplate) => {
    const newTemplate = {
      ...questTemplate,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setQuestTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, updatedTemplate) => {
    setQuestTemplates(prev => {
      const updated = prev.map(template => 
        template.id === templateId ? { ...template, ...updatedTemplate } : template
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

  // ENHANCED: Props object for all tabs with quest system
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
    // Shop props
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
    setShowQuestGiverTip
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
    calculateCoins
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  // Race logic with fixed finish line
  useEffect(() => {
    if (!raceInProgress || selectedPets.length === 0) return;

    const interval = setInterval(() => {
      setRacePositions((prev) => {
        const updated = { ...prev };
        let winnerId = null;

        const getRaceTrackWidth = () => {
          const raceTrack = document.querySelector('.race-track-container');
          if (raceTrack) {
            const rect = raceTrack.getBoundingClientRect();
            return rect.width - 80;
          }
          return 720;
        };

        const trackWidth = getRaceTrackWidth();
        const FINISH_LINE_POSITION = trackWidth;

        // Check for winners BEFORE updating positions
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const currentPosition = updated[id] || 0;
          
          if (currentPosition < FINISH_LINE_POSITION) {
            const speed = calculateSpeed(student.pet);
            const baseStep = speed * 2;
            const randomMultiplier = 0.8 + Math.random() * 0.4;
            const step = baseStep * randomMultiplier;
            const nextPosition = currentPosition + step;

            if (nextPosition >= FINISH_LINE_POSITION && !raceFinished) {
              winnerId = id;
              updated[id] = FINISH_LINE_POSITION;
              
              for (const otherId of selectedPets) {
                if (otherId !== id && updated[otherId] !== undefined) {
                  updated[otherId] = Math.min(updated[otherId] || 0, FINISH_LINE_POSITION - 10);
                }
              }
              break;
            }
          }
        }

        if (winnerId) {
          clearInterval(interval);
          
          const winner = students.find((s) => s.id === winnerId);
          setRaceWinner(winner);
          setRaceInProgress(false);
          setRaceFinished(true);

          // Award prizes
          setStudents((prev) => {
            const updatedStudents = prev.map((s) => {
              if (s.id === winnerId) {
                const updated = {
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

  // FIXED: Authentication and user data management with active class loading
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

            const savedClasses = data.classes || [];
            setTeacherClasses(savedClasses);

            if (savedClasses.length > 0) {
              // FIXED: Load the active class instead of always loading the first class
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? savedClasses.find(cls => cls.id === activeClassId)
                : savedClasses[0]; // Fallback to first class if no active class set
              
              if (activeClass) {
                await loadClass(activeClass);
              } else {
                // If activeClassId doesn't match any class, load the first one and update activeClassId
                const firstClass = savedClasses[0];
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
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <div className="text-center">
              <div className="text-6xl mb-4">{showConfirmDialog.icon}</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{showConfirmDialog.title}</h2>
              <p className="text-gray-600 mb-6">{showConfirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    showConfirmDialog.onConfirm();
                    setShowConfirmDialog(null);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-semibold text-white ${
                    showConfirmDialog.type === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {showConfirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">{feedbackType === 'bug' ? '🐛' : '💡'}</span>
              {feedbackType === 'bug' ? 'Report Bug' : 'Feature Request'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="feedback">💬 General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Brief description of the issue or idea"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Please provide detailed information..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackSubject || !feedbackMessage}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {savingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Saving changes...</p>
          </div>
        </div>
      )}

      {/* Lazy-loaded Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal {...modalProps} />
        )}
        {showAvatarSelectionModal && (
          <AvatarSelectionModal {...modalProps} />
        )}
        {levelUpData && (
          <LevelUpModal {...modalProps} />
        )}
        {petUnlockData && (
          <PetUnlockModal {...modalProps} />
        )}
        {showAddStudentModal && (
          <AddStudentModal {...modalProps} />
        )}
        {raceFinished && raceWinner && (
          <RaceWinnerModal {...modalProps} />
        )}
        {showRaceSetup && (
          <RaceSetupModal {...modalProps} />
        )}
        {showQuestCompletion && (
          <QuestCompletionModal {...modalProps} />
        )}
      </Suspense>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}