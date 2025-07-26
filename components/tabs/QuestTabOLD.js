// QuestTab.js - Dedicated Quest Management System with Questgiver Showcase
import React, { useState, useEffect } from 'react';

const QuestTab = ({
  students,
  activeQuests,
  questTemplates,
  QUEST_GIVERS,
  onCreateQuest,
  onEditQuest,
  onDeleteQuest,
  onCompleteQuest,
  showToast,
  userData
}) => {
  const [selectedView, setSelectedView] = useState('today'); // 'today', 'past', 'create'
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuest, setEditingQuest] = useState(null);

  // Get today's and past quests
  const today = new Date().toISOString().split('T')[0];
  const todayQuests = activeQuests.filter(quest => {
    const questDate = quest.createdAt ? quest.createdAt.split('T')[0] : today;
    return questDate === today;
  });
  
  const pastQuests = activeQuests.filter(quest => {
    const questDate = quest.createdAt ? quest.createdAt.split('T')[0] : today;
    return questDate !== today;
  });

  // Filter quests based on category and search
  const filterQuests = (quests) => {
    return quests.filter(quest => {
      const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory;
      const matchesSearch = quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const filteredTodayQuests = filterQuests(todayQuests);
  const filteredPastQuests = filterQuests(pastQuests);

  // Get quest statistics
  const getQuestStats = () => {
    const totalQuests = activeQuests.length;
    const completedQuests = activeQuests.reduce((acc, quest) => acc + quest.completedBy.length, 0);
    const avgCompletion = totalQuests > 0 ? Math.round((completedQuests / (totalQuests * students.length)) * 100) : 0;
    
    return { totalQuests, completedQuests, avgCompletion };
  };

  const stats = getQuestStats();

  // Quest completion handler
  const handleQuestComplete = (questId, studentId) => {
    const quest = activeQuests.find(q => q.id === questId);
    const student = students.find(s => s.id === studentId);
    
    if (!quest || !student) return;
    
    if (quest.completedBy.includes(studentId)) {
      showToast(`${student.firstName} has already completed this quest!`);
      return;
    }

    onCompleteQuest(questId, studentId, quest.reward);
    showToast(`${student.firstName} completed "${quest.title}"!`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">⚔️ Quest Management</h2>
            <p className="text-purple-100">Create and manage epic quests for your students!</p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.totalQuests}</div>
              <div className="text-sm text-purple-100">Active Quests</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.completedQuests}</div>
              <div className="text-sm text-purple-100">Completions</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.avgCompletion}%</div>
              <div className="text-sm text-purple-100">Avg. Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          {[
            { id: 'today', label: "Today's Quests", icon: '🌟', count: filteredTodayQuests.length },
            { id: 'past', label: 'Past Quests', icon: '📜', count: filteredPastQuests.length },
            { id: 'create', label: 'Create Quest', icon: '➕' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                selectedView === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-purple-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  selectedView === tab.id ? 'bg-white text-purple-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {(selectedView === 'today' || selectedView === 'past') && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search quests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="academic">📚 Academic</option>
              <option value="behavior">🌟 Behavior</option>
              <option value="responsibility">👑 Responsibility</option>
              <option value="creative">🎨 Creative</option>
              <option value="physical">💪 Physical</option>
            </select>
          </div>
        </div>
      )}

      {/* Today's Quests */}
      {selectedView === 'today' && (
        <div className="space-y-6">
          {filteredTodayQuests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🗡️</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Quests for Today</h3>
              <p className="text-gray-500 mb-6">Create some exciting quests to motivate your students!</p>
              <button
                onClick={() => setSelectedView('create')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Create Your First Quest
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTodayQuests.map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  students={students}
                  questGiver={QUEST_GIVERS.find(qg => qg.id === quest.questGiverId)}
                  onComplete={handleQuestComplete}
                  onEdit={() => setEditingQuest(quest)}
                  onDelete={() => onDeleteQuest(quest.id)}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past Quests */}
      {selectedView === 'past' && (
        <div className="space-y-6">
          {filteredPastQuests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">No Past Quests</h3>
              <p className="text-gray-500">Past quests will appear here for students to complete.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPastQuests.map(quest => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  students={students}
                  questGiver={QUEST_GIVERS.find(qg => qg.id === quest.questGiverId)}
                  onComplete={handleQuestComplete}
                  onEdit={() => setEditingQuest(quest)}
                  onDelete={() => onDeleteQuest(quest.id)}
                  showToast={showToast}
                  isPast={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Quest */}
      {selectedView === 'create' && (
        <QuestCreationInterface
          questGivers={QUEST_GIVERS}
          students={students}
          onCreateQuest={onCreateQuest}
          onCancel={() => setSelectedView('today')}
          showToast={showToast}
          userData={userData}
        />
      )}

      {/* Edit Quest Modal */}
      {editingQuest && (
        <QuestEditModal
          quest={editingQuest}
          questGivers={QUEST_GIVERS}
          students={students}
          onSave={(updatedQuest) => {
            onEditQuest(editingQuest.id, updatedQuest);
            setEditingQuest(null);
          }}
          onCancel={() => setEditingQuest(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
};

// Quest Card Component
const QuestCard = ({ quest, students, questGiver, onComplete, onEdit, onDelete, showToast, isPast = false }) => {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const completedCount = quest.completedBy?.length || 0;
  const totalStudents = students.length;
  const completionPercentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

  const getRewardDisplay = (reward) => {
    switch (reward.type) {
      case 'xp':
        return `${reward.amount} XP (${reward.category})`;
      case 'coins':
        return `${reward.amount} Coins`;
      case 'item':
        return `Item: ${reward.item}`;
      default:
        return 'Mystery Reward';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'from-blue-500 to-blue-600',
      behavior: 'from-green-500 to-green-600',
      responsibility: 'from-purple-500 to-purple-600',
      creative: 'from-pink-500 to-pink-600',
      physical: 'from-orange-500 to-orange-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all hover:shadow-xl ${
      isPast ? 'border-gray-300 opacity-90' : 'border-purple-200'
    }`}>
      {/* Quest Header with Questgiver */}
      <div className={`bg-gradient-to-r ${getCategoryColor(quest.category)} text-white p-4`}>
        <div className="flex items-start space-x-3">
          {questGiver && (
            <img
              src={questGiver.image}
              alt={questGiver.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{quest.title}</h3>
            <div className="flex items-center space-x-2 text-sm opacity-90">
              <span>{quest.icon}</span>
              <span>{questGiver?.name || 'Quest Master'}</span>
            </div>
          </div>
          {isPast && <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">PAST</span>}
        </div>
      </div>

      {/* Quest Content */}
      <div className="p-4 space-y-4">
        <p className="text-gray-700">{quest.description}</p>

        {/* Reward Display */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-semibold text-yellow-800">Reward</div>
              <div className="text-yellow-700">{getRewardDisplay(quest.reward)}</div>
            </div>
          </div>
        </div>

        {/* Assignment Info */}
        {quest.assignedTo && quest.assignedTo.length > 0 && quest.assignedTo.length < students.length && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-700">
              <span className="font-semibold">Assigned to:</span> {quest.assignedTo.length} specific students
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span>{completedCount}/{totalStudents} ({completionPercentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowStudentModal(true)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Mark Complete
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this quest?')) {
                onDelete();
                showToast('Quest deleted successfully!');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Student Selection Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Mark Quest Complete</h3>
              <p className="text-gray-600">Who completed "{quest.title}"?</p>
            </div>
            <div className="p-6 space-y-4">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a student...</option>
                {students
                  .filter(student => {
                    // Filter based on assignment and completion status
                    const isAssigned = !quest.assignedTo || quest.assignedTo.length === 0 || quest.assignedTo.includes(student.id);
                    const isNotCompleted = !quest.completedBy?.includes(student.id);
                    return isAssigned && isNotCompleted;
                  })
                  .map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName}
                    </option>
                  ))}
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (selectedStudentId) {
                      onComplete(quest.id, selectedStudentId);
                      setShowStudentModal(false);
                      setSelectedStudentId('');
                    }
                  }}
                  disabled={!selectedStudentId}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors font-medium"
                >
                  Complete Quest
                </button>
                <button
                  onClick={() => {
                    setShowStudentModal(false);
                    setSelectedStudentId('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quest Creation Interface
const QuestCreationInterface = ({ questGivers, students, onCreateQuest, onCancel, showToast, userData }) => {
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(questGivers[0]);
  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    category: 'academic',
    icon: '📝',
    reward: {
      type: 'xp',
      amount: 1,
      category: 'Respectful'
    },
    assignedTo: [], // Empty means assigned to all
    dueDate: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreateQuest = () => {
    if (!questData.title.trim() || !questData.description.trim()) {
      showToast('Please fill in title and description!');
      return;
    }

    const newQuest = {
      ...questData,
      id: `quest_${Date.now()}`,
      questGiverId: selectedQuestGiver.id,
      createdAt: new Date().toISOString(),
      completedBy: []
    };

    onCreateQuest(newQuest);
    showToast(`Quest "${questData.title}" created successfully!`);
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* Questgiver Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Choose Your Quest Giver</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questGivers.map(questGiver => (
            <button
              key={questGiver.id}
              onClick={() => setSelectedQuestGiver(questGiver)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedQuestGiver.id === questGiver.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
              }`}
            >
              <img
                src={questGiver.image}
                alt={questGiver.name}
                className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white shadow-lg"
              />
              <h4 className="font-bold text-gray-800">{questGiver.name}</h4>
              <p className="text-sm text-gray-600">{questGiver.role}</p>
              <div className="mt-2 text-xs text-purple-600 font-medium">
                Specialty: {questGiver.specialty}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quest Details Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <img
            src={selectedQuestGiver.image}
            alt={selectedQuestGiver.name}
            className="w-12 h-12 rounded-full border-2 border-purple-300"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Create Quest with {selectedQuestGiver.name}</h3>
            <p className="text-gray-600">{selectedQuestGiver.greetings[0]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Quest Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quest Title</label>
              <input
                type="text"
                value={questData.title}
                onChange={(e) => setQuestData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter an exciting quest title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={questData.description}
                onChange={(e) => setQuestData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what students need to do..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={questData.category}
                  onChange={(e) => setQuestData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="academic">📚 Academic</option>
                  <option value="behavior">🌟 Behavior</option>
                  <option value="responsibility">👑 Responsibility</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="physical">💪 Physical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  value={questData.icon}
                  onChange={(e) => setQuestData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="📝">📝 Writing</option>
                  <option value="📚">📚 Reading</option>
                  <option value="🧮">🧮 Math</option>
                  <option value="🔬">🔬 Science</option>
                  <option value="🎨">🎨 Art</option>
                  <option value="🏃">🏃 Physical</option>
                  <option value="🤝">🤝 Teamwork</option>
                  <option value="🏆">🏆 Achievement</option>
                  <option value="⭐">⭐ Special</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reward Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
              <select
                value={questData.reward.type}
                onChange={(e) => setQuestData(prev => ({
                  ...prev,
                  reward: { ...prev.reward, type: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="xp">XP Points</option>
                <option value="coins">Coins</option>
                {userData?.subscription === 'pro' && <option value="item">Shop Item</option>}
              </select>
            </div>

            {questData.reward.type === 'xp' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Amount</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={questData.reward.amount}
                    onChange={(e) => setQuestData(prev => ({
                      ...prev,
                      reward: { ...prev.reward, amount: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Category</label>
                  <select
                    value={questData.reward.category}
                    onChange={(e) => setQuestData(prev => ({
                      ...prev,
                      reward: { ...prev.reward, category: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Respectful">👍 Respectful</option>
                    <option value="Responsible">💼 Responsible</option>
                    <option value="Learner">📚 Learner</option>
                  </select>
                </div>
              </>
            )}

            {questData.reward.type === 'coins' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Coin Amount</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={questData.reward.amount}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    reward: { ...prev.reward, amount: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {questData.reward.type === 'item' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Item</label>
                <input
                  type="text"
                  value={questData.reward.item || ''}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    reward: { ...prev.reward, item: e.target.value }
                  }))}
                  placeholder="Item name from shop..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Advanced Options */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Specific Students</label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={questData.assignedTo.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQuestData(prev => ({ ...prev, assignedTo: [] }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">All Students</span>
                    </label>
                    {students.map(student => (
                      <label key={student.id} className="flex items-center space-x-2 mb-1">
                        <input
                          type="checkbox"
                          checked={questData.assignedTo.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setQuestData(prev => ({
                                ...prev,
                                assignedTo: [...prev.assignedTo, student.id]
                              }));
                            } else {
                              setQuestData(prev => ({
                                ...prev,
                                assignedTo: prev.assignedTo.filter(id => id !== student.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{student.firstName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={questData.dueDate}
                    onChange={(e) => setQuestData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleCreateQuest}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Create Quest
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Quest Edit Modal Component
const QuestEditModal = ({ quest, questGivers, students, onSave, onCancel, showToast }) => {
  const [questData, setQuestData] = useState({
    ...quest,
    questGiverId: quest.questGiverId || questGivers[0].id
  });

  const selectedQuestGiver = questGivers.find(qg => qg.id === questData.questGiverId) || questGivers[0];

  const handleSave = () => {
    if (!questData.title.trim() || !questData.description.trim()) {
      showToast('Please fill in title and description!');
      return;
    }

    onSave(questData);
    showToast('Quest updated successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Edit Quest</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Similar form structure to creation interface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quest Title</label>
                <input
                  type="text"
                  value={questData.title}
                  onChange={(e) => setQuestData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={questData.description}
                  onChange={(e) => setQuestData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={questData.category}
                  onChange={(e) => setQuestData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="academic">📚 Academic</option>
                  <option value="behavior">🌟 Behavior</option>
                  <option value="responsibility">👑 Responsibility</option>
                  <option value="creative">🎨 Creative</option>
                  <option value="physical">💪 Physical</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reward Type</label>
                <select
                  value={questData.reward.type}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    reward: { ...prev.reward, type: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="xp">XP Points</option>
                  <option value="coins">Coins</option>
                  <option value="item">Shop Item</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={questData.reward.amount}
                  onChange={(e) => setQuestData(prev => ({
                    ...prev,
                    reward: { ...prev.reward, amount: parseInt(e.target.value) }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {questData.reward.type === 'xp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Category</label>
                  <select
                    value={questData.reward.category}
                    onChange={(e) => setQuestData(prev => ({
                      ...prev,
                      reward: { ...prev.reward, category: e.target.value }
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Respectful">👍 Respectful</option>
                    <option value="Responsible">💼 Responsible</option>
                    <option value="Learner">📚 Learner</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestTab;