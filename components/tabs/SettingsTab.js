// SettingsTab.js - FIXED VERSION with Proper Coin System
import React, { useState } from 'react';

export default function SettingsTab({
  students,
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
  calculateCoins,
  handleDeductXP,
  handleDeductCurrency,
  questTemplates,
  handleAddQuestTemplate,
  handleEditQuestTemplate,
  handleDeleteQuestTemplate,
  handleResetQuestTemplates
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [xpAmount, setXpAmount] = useState(1);
  const [coinAmount, setCoinAmount] = useState(1);
  const [showQuestEditor, setShowQuestEditor] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    reward: { type: 'COINS', amount: 1 },
    icon: '⭐'
  });

  const settingsTabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'quests', name: 'Quest Editor', icon: '🎯' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'account', name: 'Account', icon: '👤' }
  ];

  const handleQuestSubmit = (e) => {
    e.preventDefault();
    if (editingQuest) {
      handleEditQuestTemplate(editingQuest.id, questForm);
      setEditingQuest(null);
    } else {
      handleAddQuestTemplate(questForm);
    }
    setQuestForm({
      title: '',
      description: '',
      type: 'daily',
      category: 'individual',
      requirement: { type: 'xp', category: 'Respectful', amount: 5 },
      reward: { type: 'COINS', amount: 1 },
      icon: '⭐'
    });
    setShowQuestEditor(false);
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setQuestForm({ ...quest });
    setShowQuestEditor(true);
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Settings</h2>
        <p className="text-gray-600">Manage your classroom and account settings</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-all flex items-center space-x-2 ${
                activeSettingsTab === tab.id
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        
        {/* General Settings */}
        {activeSettingsTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">⚙️ General Settings</h3>
            
            {/* System Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📊 System Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                  <div className="text-gray-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {students.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
                  </div>
                  <div className="text-gray-600">Total Class XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {students.reduce((sum, s) => sum + calculateCoins(s), 0)}
                  </div>
                  <div className="text-gray-600">Total Class Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {students.filter(s => s.pet?.image).length}
                  </div>
                  <div className="text-gray-600">Students with Pets</div>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-blue-800 mb-4">💬 Feedback & Support</h4>
              <p className="text-blue-700 mb-4">
                Help us improve Classroom Champions! Report bugs or suggest new features.
              </p>
              <button
                onClick={() => setShowFeedbackModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                📝 Send Feedback
              </button>
            </div>
          </div>
        )}

        {/* Quest Editor */}
        {activeSettingsTab === 'quests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">🎯 Quest Template Editor</h3>
              <button
                onClick={() => setShowQuestEditor(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                + Add Quest Template
              </button>
            </div>

            {/* Quest Templates List */}
            <div className="space-y-4">
              {questTemplates.map(quest => (
                <div key={quest.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{quest.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                        <p className="text-sm text-gray-600">{quest.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {quest.type}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            {quest.category}
                          </span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            {quest.reward.type} +{quest.reward.amount}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditQuest(quest)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmDialog({
                            title: "Delete Quest Template",
                            message: `Are you sure you want to delete "${quest.title}"?`,
                            icon: "🗑️",
                            type: "danger",
                            confirmText: "Delete",
                            onConfirm: () => handleDeleteQuestTemplate(quest.id)
                          });
                        }}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Templates */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🔄 Reset Quest Templates</h4>
              <p className="text-yellow-700 mb-4">Reset all quest templates to default ones.</p>
              <button
                onClick={() => {
                  setShowConfirmDialog({
                    title: "Reset Quest Templates",
                    message: "This will delete all custom quests and restore defaults. Continue?",
                    icon: "🔄",
                    type: "warning",
                    confirmText: "Reset Templates",
                    onConfirm: handleResetQuestTemplates
                  });
                }}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        )}

        {/* Student Management */}
        {activeSettingsTab === 'students' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">👥 Student Management</h3>
            
            {/* Individual Student Management */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">👤 Individual Student Management</h4>
              
              {/* Student Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a student...</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} - {student.totalPoints || 0} XP - {calculateCoins(student)} coins
                    </option>
                  ))}
                </select>
              </div>

              {selectedStudentId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* XP Management */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-700">⭐ XP Management</h5>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">XP Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => handleDeductXP(selectedStudentId, xpAmount)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Remove {xpAmount} XP
                    </button>
                  </div>

                  {/* FIXED: Currency Management */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-700">💰 Currency Management</h5>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Bonus Coin Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={coinAmount}
                        onChange={(e) => setCoinAmount(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        Note: This removes bonus coins only. XP coins are calculated automatically (1 coin per 5 XP).
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeductCurrency(selectedStudentId, coinAmount)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                    >
                      Remove {coinAmount} Bonus Coins
                    </button>
                  </div>

                  {/* Reset Options */}
                  <div className="md:col-span-2 space-y-3">
                    <h5 className="font-semibold text-gray-700">🔄 Reset Options</h5>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowConfirmDialog({
                            title: "Complete Student Reset",
                            message: "This will reset ALL progress for this student: XP, level, pet, inventory, and currency. This cannot be undone!",
                            icon: "🚨",
                            type: "danger",
                            confirmText: "Reset Everything",
                            onConfirm: () => handleResetStudentPoints(selectedStudentId)
                          });
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                      >
                        🚨 Complete Reset
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmDialog({
                            title: "Remove Student",
                            message: "This will permanently remove this student from your class. This cannot be undone!",
                            icon: "❌",
                            type: "danger",
                            confirmText: "Remove Student",
                            onConfirm: () => handleRemoveStudent(selectedStudentId)
                          });
                        }}
                        className="flex-1 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 font-semibold"
                      >
                        ❌ Remove Student
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bulk Operations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">🏫 Class-Wide Operations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowConfirmDialog({
                      title: "Reset All Students",
                      message: "This will completely reset ALL students: XP, levels, pets, inventories, and currency. This cannot be undone!",
                      icon: "🚨",
                      type: "danger",
                      confirmText: "Reset Everyone",
                      onConfirm: handleResetAllPoints
                    });
                  }}
                  className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-semibold"
                >
                  🚨 Reset All Students
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog({
                      title: "Reset Pet Speeds",
                      message: "This will reset all pet speeds and wins to default values. Continue?",
                      icon: "🐾",
                      type: "warning",
                      confirmText: "Reset Pet Speeds",
                      onConfirm: handleResetPetSpeeds
                    });
                  }}
                  className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 font-semibold"
                >
                  🐾 Reset All Pet Speeds
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        {activeSettingsTab === 'account' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">👤 Account Settings</h3>
            
            {/* Subscription Info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-purple-800 mb-4">💎 Subscription</h4>
              {userData?.subscription && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      userData.subscription === 'pro' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userData.subscription === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                    </span>
                    <p className="text-purple-700 text-sm mt-2">
                      {userData.subscription === 'pro' 
                        ? 'Access to up to 5 classes, Teachers Toolkit, and premium features'
                        : 'Access to 1 class with core features'
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {userData.subscription !== 'pro' && (
                      <button
                        onClick={() => router.push('/pricing')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold"
                      >
                        Upgrade to Pro
                      </button>
                    )}
                    {userData?.stripeCustomerId && (
                      <button
                        onClick={handleSubscriptionManagement}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
                      >
                        Manage Billing
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📧 Account Information</h4>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Account Created:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>User ID:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-sm">{user?.uid}</code></p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quest Editor Modal */}
      {showQuestEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingQuest ? 'Edit Quest Template' : 'Add Quest Template'}
            </h2>

            <form onSubmit={handleQuestSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={questForm.title}
                    onChange={(e) => setQuestForm({...questForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
                  <input
                    type="text"
                    value={questForm.icon}
                    onChange={(e) => setQuestForm({...questForm, icon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="⭐"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={questForm.description}
                  onChange={(e) => setQuestForm({...questForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={questForm.type}
                    onChange={(e) => setQuestForm({...questForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={questForm.category}
                    onChange={(e) => setQuestForm({...questForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="class">Class</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                  <select
                    value={questForm.reward.type}
                    onChange={(e) => setQuestForm({...questForm, reward: {...questForm.reward, type: e.target.value}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COINS">Coins</option>
                    <option value="XP">XP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={questForm.reward.amount}
                    onChange={(e) => setQuestForm({...questForm, reward: {...questForm.reward, amount: parseInt(e.target.value) || 1}})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuestEditor(false);
                    setEditingQuest(null);
                    setQuestForm({
                      title: '',
                      description: '',
                      type: 'daily',
                      category: 'individual',
                      requirement: { type: 'xp', category: 'Respectful', amount: 5 },
                      reward: { type: 'COINS', amount: 1 },
                      icon: '⭐'
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  {editingQuest ? 'Update Quest' : 'Add Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
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
    </div>
  );
}