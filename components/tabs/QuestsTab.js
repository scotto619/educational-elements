// components/tabs/QuestsTab.js - Redesigned Quest Management System
import React, { useState, useEffect } from 'react';

// ===============================================
// QUEST CHARACTERS & TYPES
// ===============================================

const QUEST_TYPES = [
  {
    id: 'learning',
    name: 'Learning Quest',
    color: 'from-blue-500 to-blue-600',
    icon: '📚',
    description: 'Academic and educational tasks'
  },
  {
    id: 'behaviour',
    name: 'Behaviour Quest',
    color: 'from-green-500 to-green-600',
    icon: '⭐',
    description: 'Positive behavior and classroom conduct'
  },
  {
    id: 'community',
    name: 'Community Quest',
    color: 'from-purple-500 to-purple-600',
    icon: '🤝',
    description: 'Helping others and teamwork'
  },
  {
    id: 'assessment',
    name: 'Assessment Quest',
    color: 'from-red-500 to-red-600',
    icon: '⚔️',
    description: 'Tests, projects, and major evaluations'
  }
];

// Guide characters (for Learning, Behaviour, Community)
const GUIDE_CHARACTERS = [
  { id: 'guide1', name: 'Wise Owl', path: '/Guides/Guide 1.png' },
  { id: 'guide2', name: 'Magic Fox', path: '/Guides/Guide 2.png' },
  { id: 'guide3', name: 'Golden Cat', path: '/Guides/Guide 3.png' },
  { id: 'guide4', name: 'Shadow Wolf', path: '/Guides/Guide 4.png' },
  { id: 'guide5', name: 'Elder Sage', path: '/Guides/Guide 5.png' },
  { id: 'guide6', name: 'Forest Guardian', path: '/Guides/Guide 6.png' },
  { id: 'guide7', name: 'Scholar Mouse', path: '/Guides/Guide 7.png' }
];

// Boss characters (for Assessment quests)
const BOSS_CHARACTERS = [
  { id: 'boss1', name: 'The Examiner', path: '/Bosses/Boss 1.png' },
  { id: 'boss2', name: 'Test Master', path: '/Bosses/Boss 2.png' },
  { id: 'boss3', name: 'Grade Guardian', path: '/Bosses/Boss 3.png' },
  { id: 'boss4', name: 'Assessment Lord', path: '/Bosses/Boss 4.png' }
];

// ===============================================
// QUESTS TAB COMPONENT
// ===============================================

const QuestsTab = ({ 
  students = [], 
  user,
  showToast = () => {},
  userData = {},
  currentClassId,
  onAwardXP,
  onAwardCoins,
  saveClassData
}) => {
  const [activeQuests, setActiveQuests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState({});
  
  // Quest form state
  const [questForm, setQuestForm] = useState({
    title: '',
    task: '',
    dueDate: '',
    questType: 'learning',
    character: 'guide1',
    rewardType: 'xp',
    rewardAmount: 5
  });

  // Load quests from current class data
  useEffect(() => {
    if (userData.classes && currentClassId) {
      const currentClass = userData.classes.find(cls => cls.id === currentClassId);
      if (currentClass && currentClass.quests) {
        setActiveQuests(currentClass.quests);
      }
    }
  }, [userData, currentClassId]);

  // Save quests to Firebase
  const saveQuests = async (updatedQuests) => {
    try {
      if (saveClassData) {
        await saveClassData({ quests: updatedQuests });
        setActiveQuests(updatedQuests);
      }
    } catch (error) {
      console.error('Error saving quests:', error);
      showToast('Error saving quest. Please try again.', 'error');
    }
  };

  // Get available characters based on quest type
  const getAvailableCharacters = (questType) => {
    return questType === 'assessment' ? BOSS_CHARACTERS : GUIDE_CHARACTERS;
  };

  // Get character info by ID
  const getCharacterById = (characterId) => {
    const allCharacters = [...GUIDE_CHARACTERS, ...BOSS_CHARACTERS];
    return allCharacters.find(char => char.id === characterId) || GUIDE_CHARACTERS[0];
  };

  // Create a new quest
  const createQuest = async () => {
    if (!questForm.title.trim() || !questForm.task.trim()) {
      showToast('Please fill in the quest title and task.', 'error');
      return;
    }

    const newQuest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...questForm,
      character: questForm.questType === 'assessment' && !BOSS_CHARACTERS.find(b => b.id === questForm.character)
        ? 'boss1' 
        : questForm.character,
      createdAt: new Date().toISOString(),
      completedBy: []
    };

    const updatedQuests = [...activeQuests, newQuest];
    await saveQuests(updatedQuests);

    // Reset form
    setQuestForm({
      title: '',
      task: '',
      dueDate: '',
      questType: 'learning',
      character: 'guide1',
      rewardType: 'xp',
      rewardAmount: 5
    });
    setShowCreateForm(false);
  };

  // Delete a quest
  const deleteQuest = async (questId) => {
    const updatedQuests = activeQuests.filter(q => q.id !== questId);
    await saveQuests(updatedQuests);
  };

  // Handle quest completion
  const completeQuestForStudents = async (quest) => {
    const studentsToReward = Object.keys(selectedStudents).filter(
      studentId => selectedStudents[studentId] && 
      !quest.completedBy.some(c => c.studentId === studentId)
    );

    if (studentsToReward.length === 0) {
      showToast('Please select students to complete this quest.', 'error');
      return;
    }

    // Award rewards to students
    for (const studentId of studentsToReward) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        if (quest.rewardType === 'xp') {
          onAwardXP(studentId, quest.rewardAmount, quest.title);
        } else {
          onAwardCoins(studentId, quest.rewardAmount, quest.title);
        }
      }
    }

    // Update quest completion status
    const updatedQuests = activeQuests.map(q => {
      if (q.id === quest.id) {
        const newCompletions = studentsToReward.map(studentId => ({
          studentId,
          completedAt: new Date().toISOString(),
          rewardAwarded: quest.rewardAmount
        }));
        return { ...q, completedBy: [...q.completedBy, ...newCompletions] };
      }
      return q;
    });

    await saveQuests(updatedQuests);
    setShowCompletionModal(null);
    setSelectedStudents({});
  };

  // Get quest type info
  const getQuestTypeInfo = (typeId) => {
    return QUEST_TYPES.find(t => t.id === typeId) || QUEST_TYPES[0];
  };

  // Format due date for display
  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Check if quest is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📜 Quest Management</h2>
            <p className="text-gray-600">Create and manage classroom quests</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            + Create Quest
          </button>
        </div>
      </div>

      {/* Create Quest Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">🎯 Create New Quest</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Title *</label>
                <input
                  type="text"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({...questForm, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quest title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Description *</label>
                <textarea
                  value={questForm.task}
                  onChange={(e) => setQuestForm({...questForm, task: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Describe what students need to do"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={questForm.dueDate}
                  onChange={(e) => setQuestForm({...questForm, dueDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUEST_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setQuestForm({
                        ...questForm, 
                        questType: type.id,
                        character: type.id === 'assessment' ? 'boss1' : 'guide1'
                      })}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        questForm.questType === type.id
                          ? `bg-gradient-to-r ${type.color} text-white border-transparent`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="font-semibold">{type.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Character</label>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableCharacters(questForm.questType).map(character => (
                    <button
                      key={character.id}
                      onClick={() => setQuestForm({...questForm, character: character.id})}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        questForm.character === character.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={character.path} 
                        alt={character.name}
                        className="w-12 h-12 mx-auto rounded"
                      />
                      <p className="text-xs mt-1 font-medium">{character.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                  <select
                    value={questForm.rewardType}
                    onChange={(e) => setQuestForm({...questForm, rewardType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="xp">⭐ XP Points</option>
                    <option value="coins">🪙 Coins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Amount</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={questForm.rewardAmount}
                    onChange={(e) => setQuestForm({...questForm, rewardAmount: parseInt(e.target.value) || 1})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={createQuest}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Create Quest
            </button>
          </div>
        </div>
      )}

      {/* Active Quests */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Active Quests ({activeQuests.length})</h3>
        
        {activeQuests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h4 className="text-xl font-bold text-gray-600 mb-2">No Active Quests</h4>
            <p className="text-gray-500">Create your first quest to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeQuests.map(quest => {
              const questType = getQuestTypeInfo(quest.questType);
              const character = getCharacterById(quest.character);
              const completedCount = quest.completedBy.length;
              const overdue = isOverdue(quest.dueDate);
              
              return (
                <div key={quest.id} className="border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                  {/* Quest Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={character.path} 
                        alt={character.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="text-2xl">{questType.icon}</span>
                    </div>
                    <div className="flex space-x-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${questType.color} text-white`}>
                        {questType.name}
                      </span>
                      {overdue && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quest Details */}
                  <h4 className="font-bold text-gray-800 mb-2">{quest.title}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{quest.task}</p>
                  
                  {/* Quest Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Due:</span>
                      <span className={overdue ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                        {formatDueDate(quest.dueDate)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Reward:</span>
                      <span className="font-semibold">
                        {quest.rewardType === 'xp' ? '⭐' : '🪙'} {quest.rewardAmount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed:</span>
                      <span className="text-green-600 font-semibold">{completedCount}/{students.length}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCompletionModal(quest)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => deleteQuest(quest.id)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
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

      {/* Quest Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Complete Quest</h2>
              <p className="text-green-100">{showCompletionModal.title}</p>
            </div>
            
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-4 mb-2">
                  <img 
                    src={getCharacterById(showCompletionModal.character).path}
                    alt="Character"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-blue-800">Quest Reward</h4>
                    <p className="text-blue-600">
                      {showCompletionModal.rewardType === 'xp' ? '⭐' : '🪙'} {showCompletionModal.rewardAmount} {showCompletionModal.rewardType.toUpperCase()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-blue-700">{showCompletionModal.task}</p>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select students who completed this quest:</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 max-h-60 overflow-y-auto">
                {students.map(student => {
                  const alreadyCompleted = showCompletionModal.completedBy.some(c => c.studentId === student.id);
                  const isSelected = selectedStudents[student.id];
                  
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (alreadyCompleted) return;
                        setSelectedStudents(prev => ({
                          ...prev,
                          [student.id]: !prev[student.id]
                        }));
                      }}
                      disabled={alreadyCompleted}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        alreadyCompleted
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-sm">{student.firstName}</p>
                        <p className="text-xs text-gray-600">{student.lastName}</p>
                        {alreadyCompleted && (
                          <p className="text-xs text-green-600 mt-1">✅ Completed</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {Object.values(selectedStudents).filter(Boolean).length} student(s) selected
              </p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowCompletionModal(null);
                  setSelectedStudents({});
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => completeQuestForStudents(showCompletionModal)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Award Rewards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestsTab;