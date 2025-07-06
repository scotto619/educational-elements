import React, { useState } from 'react';

const SettingsTab = ({ 
  userData, 
  user, 
  students,
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
  // Quest management props
  questTemplates,
  setQuestTemplates,
  dailyQuests,
  weeklyQuests,
  setDailyQuests,
  setWeeklyQuests,
  generateDailyQuests,
  generateWeeklyQuests,
  saveQuestDataToFirebase,
  savingData,
  showToast
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [editingQuest, setEditingQuest] = useState(null);
  const [showAddQuestModal, setShowAddQuestModal] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    reward: { type: 'XP', amount: 10 },
    icon: '🎯'
  });

  const handleSaveQuest = async () => {
    if (!newQuest.title || !newQuest.description) {
      alert('Please fill in all required fields');
      return;
    }

    const questToSave = {
      ...newQuest,
      id: editingQuest ? editingQuest.id : `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (editingQuest) {
      setQuestTemplates(prev => prev.map(q => q.id === editingQuest.id ? questToSave : q));
      setEditingQuest(null);
      showToast('Quest updated successfully!');
    } else {
      setQuestTemplates(prev => [...prev, questToSave]);
      showToast('Quest added successfully!');
    }

    setNewQuest({
      title: '',
      description: '',
      type: 'daily',
      category: 'individual',
      requirement: { type: 'xp', category: 'Respectful', amount: 5 },
      reward: { type: 'XP', amount: 10 },
      icon: '🎯'
    });
    setShowAddQuestModal(false);
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setNewQuest({ ...quest });
    setShowAddQuestModal(true);
  };

  const handleDeleteQuest = (questId) => {
    setShowConfirmDialog({
      title: 'Delete Quest',
      message: 'Are you sure you want to delete this quest template?',
      icon: '🗑️',
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => {
        setQuestTemplates(prev => prev.filter(q => q.id !== questId));
        showToast('Quest deleted successfully!');
      }
    });
  };

  const handleResetQuests = () => {
    setShowConfirmDialog({
      title: 'Reset Quests',
      message: 'This will generate new daily and weekly quests. Current progress will be lost.',
      icon: '🔄',
      type: 'warning',
      confirmText: 'Reset',
      onConfirm: async () => {
        const newDailyQuests = generateDailyQuests();
        const newWeeklyQuests = generateWeeklyQuests();
        setDailyQuests(newDailyQuests);
        setWeeklyQuests(newWeeklyQuests);
        await saveQuestDataToFirebase({
          dailyQuests: newDailyQuests,
          weeklyQuests: newWeeklyQuests
        });
        showToast('Quests reset successfully!');
      }
    });
  };

  const QUEST_ICONS = ['🎯', '⭐', '📚', '👍', '💼', '🏆', '🎊', '🌟', '🔥', '💎', '🎁', '🚀'];
  const REQUIREMENT_TYPES = [
    { id: 'xp', label: 'Earn XP Points', hasCategory: true, hasAmount: true },
    { id: 'total_xp', label: 'Total XP', hasCategory: false, hasAmount: true },
    { id: 'manual', label: 'Manual Verification', hasCategory: false, hasAmount: false },
    { id: 'pet_wins', label: 'Pet Race Wins', hasCategory: false, hasAmount: true },
    { id: 'class_total_xp', label: 'Class Total XP', hasCategory: false, hasAmount: true }
  ];

  return (
    <div className="animate-fade-in">

      {/* Emergency Fix Button - Add to your SettingsTab */}
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
  <h4 className="font-bold text-yellow-800 mb-2">🛠️ Emergency Fix</h4>
  <button
    onClick={() => {
      // Direct inline fix
      console.log('🔧 Applying fixes...');
      // Add your fix logic here or call the function
      if (typeof quickFixForExistingUsers === 'function') {
        quickFixForExistingUsers();
      } else {
        alert('Fix function not available. Try Option 1.');
      }
    }}
    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
  >
    Apply Quick Fix
  </button>
</div>

      {/* Settings Navigation */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { id: 'general', label: 'General', icon: '⚙️' },
          { id: 'quests', label: 'Quests', icon: '🎯' },
          { id: 'students', label: 'Students', icon: '👥' },
          { id: 'account', label: 'Account', icon: '👤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSettingsTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeSettingsTab === tab.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings Tab */}
      {activeSettingsTab === 'general' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">⚙️</span>
              General Settings
            </h2>
          </div>

          {/* Class Management */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Class Management</h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowConfirmDialog({
                  title: 'Reset All Student Points',
                  message: 'This will reset all student points to 0. This action cannot be undone.',
                  icon: '🔄',
                  type: 'danger',
                  confirmText: 'Reset All',
                  onConfirm: handleResetAllPoints
                })}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                🔄 Reset All Student Points
              </button>
              <button
                onClick={() => setShowConfirmDialog({
                  title: 'Reset Pet Speeds',
                  message: 'This will reset all pet speeds and wins to default values.',
                  icon: '🐾',
                  type: 'warning',
                  confirmText: 'Reset',
                  onConfirm: handleResetPetSpeeds
                })}
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                🐾 Reset Pet Speeds & Wins
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Help & Feedback</h3>
            <div className="space-y-4">
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                💬 Send Feedback or Report Bug
              </button>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
                <p className="text-gray-600 text-sm">
                  Contact our support team at{' '}
                  <a href="mailto:support@classroomchampions.com" className="text-blue-600 hover:underline">
                    support@classroomchampions.com
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Legal */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Legal</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/terms')}
                className="block w-full text-left text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50"
              >
                📄 Terms of Service
              </button>
              <button
                onClick={() => router.push('/privacy')}
                className="block w-full text-left text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50"
              >
                🔒 Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Management Tab */}
      {activeSettingsTab === 'quests' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Quest Management
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleResetQuests}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              >
                🔄 Reset Active Quests
              </button>
              <button
                onClick={() => setShowAddQuestModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                + Add Quest
              </button>
            </div>
          </div>

          {/* Active Quests Overview */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Active Quests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Daily Quests ({dailyQuests.length})</h4>
                <div className="space-y-2">
                  {dailyQuests.map((quest) => (
                    <div key={quest.id} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{quest.icon}</span>
                        <span className="font-medium">{quest.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Weekly Quests ({weeklyQuests.length})</h4>
                <div className="space-y-2">
                  {weeklyQuests.map((quest) => (
                    <div key={quest.id} className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{quest.icon}</span>
                        <span className="font-medium">{quest.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quest Templates */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quest Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questTemplates.map((quest) => (
                <div key={quest.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{quest.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                        <p className="text-sm text-gray-600">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuest(quest)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteQuest(quest.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quest.type === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {quest.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        quest.category === 'individual' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {quest.category}
                      </span>
                    </div>
                    <span className="text-purple-600 font-medium">
                      {quest.reward.type} +{quest.reward.amount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Students Management Tab */}
      {activeSettingsTab === 'students' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">👥</span>
              Student Management
            </h2>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Student Actions</h3>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">👥</div>
                <p className="text-gray-500">No students in your class yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.firstName} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            {student.firstName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-gray-800">{student.firstName}</h4>
                          <p className="text-sm text-gray-600">
                            Level {student.avatarLevel} • {student.totalPoints || 0} XP
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowConfirmDialog({
                            title: 'Reset Student Points',
                            message: `Reset all points for ${student.firstName}? This action cannot be undone.`,
                            icon: '🔄',
                            type: 'warning',
                            confirmText: 'Reset',
                            onConfirm: () => handleResetStudentPoints(student.id)
                          })}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                        >
                          🔄 Reset
                        </button>
                        <button
                          onClick={() => setShowConfirmDialog({
                            title: 'Remove Student',
                            message: `Remove ${student.firstName} from the class? This action cannot be undone.`,
                            icon: '🗑️',
                            type: 'danger',
                            confirmText: 'Remove',
                            onConfirm: () => handleRemoveStudent(student.id)
                          })}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Account Settings Tab */}
      {activeSettingsTab === 'account' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
              <span className="text-3xl mr-3">👤</span>
              Account Settings
            </h2>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">Subscription Plan</p>
                  <p className="text-gray-600">
                    {userData?.subscription === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                  </p>
                </div>
                <button
                  onClick={handleSubscriptionManagement}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                <p className="text-red-600 text-sm mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={() => setShowConfirmDialog({
                    title: 'Delete Account',
                    message: 'Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.',
                    icon: '⚠️',
                    type: 'danger',
                    confirmText: 'Delete Account',
                    onConfirm: () => {
                      // Implement account deletion logic here
                      alert('Account deletion is not implemented yet. Please contact support.');
                    }
                  })}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Quest Modal */}
      {showAddQuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingQuest ? 'Edit Quest' : 'Add New Quest'}
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Title</label>
                  <input
                    type="text"
                    value={newQuest.title}
                    onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quest title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <div className="flex space-x-2">
                    {QUEST_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewQuest(prev => ({ ...prev, icon }))}
                        className={`text-2xl p-2 rounded-lg transition-colors ${
                          newQuest.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={newQuest.description}
                  onChange={(e) => setNewQuest(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Enter quest description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quest Type</label>
                  <select
                    value={newQuest.type}
                    onChange={(e) => setNewQuest(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily Quest</option>
                    <option value="weekly">Weekly Quest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={newQuest.category}
                    onChange={(e) => setNewQuest(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Individual Quest</option>
                    <option value="class">Class Quest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requirement</label>
                <div className="space-y-3">
                  <select
                    value={newQuest.requirement.type}
                    onChange={(e) => {
                      const reqType = REQUIREMENT_TYPES.find(r => r.id === e.target.value);
                      setNewQuest(prev => ({ 
                        ...prev, 
                        requirement: { 
                          type: e.target.value,
                          ...(reqType?.hasCategory && { category: 'Respectful' }),
                          ...(reqType?.hasAmount && { amount: 5 })
                        }
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {REQUIREMENT_TYPES.map(req => (
                      <option key={req.id} value={req.id}>{req.label}</option>
                    ))}
                  </select>
                  
                  {newQuest.requirement.type === 'xp' && (
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newQuest.requirement.category}
                        onChange={(e) => setNewQuest(prev => ({ 
                          ...prev, 
                          requirement: { ...prev.requirement, category: e.target.value }
                        }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Respectful">Respectful</option>
                        <option value="Responsible">Responsible</option>
                        <option value="Learner">Learner</option>
                      </select>
                      <input
                        type="number"
                        value={newQuest.requirement.amount}
                        onChange={(e) => setNewQuest(prev => ({ 
                          ...prev, 
                          requirement: { ...prev.requirement, amount: Number(e.target.value) }
                        }))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Amount"
                        min="1"
                      />
                    </div>
                  )}
                  
                  {(newQuest.requirement.type === 'total_xp' || newQuest.requirement.type === 'pet_wins' || newQuest.requirement.type === 'class_total_xp') && (
                    <input
                      type="number"
                      value={newQuest.requirement.amount}
                      onChange={(e) => setNewQuest(prev => ({ 
                        ...prev, 
                        requirement: { ...prev.requirement, amount: Number(e.target.value) }
                      }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Amount required"
                      min="1"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reward</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newQuest.reward.type}
                    onChange={(e) => setNewQuest(prev => ({ 
                      ...prev, 
                      reward: { ...prev.reward, type: e.target.value }
                    }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="XP">XP Points</option>
                    <option value="coins">Coins</option>
                  </select>
                  <input
                    type="number"
                    value={newQuest.reward.amount}
                    onChange={(e) => setNewQuest(prev => ({ 
                      ...prev, 
                      reward: { ...prev.reward, amount: Number(e.target.value) }
                    }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Amount"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowAddQuestModal(false);
                  setEditingQuest(null);
                  setNewQuest({
                    title: '',
                    description: '',
                    type: 'daily',
                    category: 'individual',
                    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
                    reward: { type: 'XP', amount: 10 },
                    icon: '🎯'
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuest}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                {editingQuest ? 'Update Quest' : 'Add Quest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;