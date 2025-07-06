// SettingsTab.js - Complete Settings Component with Enhanced Management
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
  debugCurrencySystem,
  quickFixForExistingUsers,
  resetQuestProgressForExistingStudents
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [xpAmount, setXpAmount] = useState(1);
  const [coinAmount, setCoinAmount] = useState(1);

  const settingsTabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'quests', name: 'Quests', icon: '🎯' },
    { id: 'students', name: 'Students', icon: '👥' },
    { id: 'account', name: 'Account', icon: '👤' }
  ];

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Settings</h2>
        <p className="text-gray-600">Manage your classroom and account settings</p>
      </div>

      {/* Quick Fix Section for Existing Users */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-yellow-800 mb-4">🔧 Quick Fixes</h3>
        <p className="text-yellow-700 mb-4">
          If you're experiencing XP/quest issues after recent updates, use these fixes:
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (quickFixForExistingUsers) {
                quickFixForExistingUsers();
              } else {
                alert('Fix function not available');
              }
            }}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
          >
            🛠️ Apply All Fixes
          </button>
          <button
            onClick={() => {
              if (resetQuestProgressForExistingStudents) {
                resetQuestProgressForExistingStudents();
              } else {
                alert('Fix function not available');
              }
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-semibold"
          >
            🎯 Reset Quest Progress
          </button>
          <button
            onClick={() => {
              if (debugCurrencySystem) {
                debugCurrencySystem();
              } else {
                alert('Debug function not available');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
          >
            🪙 Debug Currency
          </button>
        </div>
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
                    {students.reduce((sum, s) => sum + calculateCoins(s.totalPoints || 0), 0)}
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

        {/* Quest Settings */}
        {activeSettingsTab === 'quests' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 Quest Management</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-green-800 mb-4">🏆 Quest System Status</h4>
              <p className="text-green-700 mb-4">
                Quests now reward coins instead of XP to prevent cascading rewards:
              </p>
              <ul className="list-disc list-inside text-green-700 space-y-1">
                <li>Daily Quests: 1 coin each (5 XP equivalent)</li>
                <li>Weekly Quests: 5 coins each (25 XP equivalent)</li>
                <li>No more double XP rewards</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-yellow-800 mb-4">🔄 Quest Reset Options</h4>
              <button
                onClick={() => {
                  if (resetQuestProgressForExistingStudents) {
                    setShowConfirmDialog({
                      title: "Reset Quest Progress",
                      message: "This will reset all quest completion progress for all students. They can complete quests again.",
                      icon: "🎯",
                      type: "warning",
                      confirmText: "Reset Quests",
                      onConfirm: resetQuestProgressForExistingStudents
                    });
                  }
                }}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
              >
                🎯 Reset All Quest Progress
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
                      {student.firstName} - {student.totalPoints || 0} XP - {calculateCoins(student.totalPoints || 0)} coins
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (handleDeductXP) {
                            handleDeductXP(selectedStudentId, xpAmount);
                          }
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                      >
                        Remove {xpAmount} XP
                      </button>
                    </div>
                  </div>

                  {/* Currency Management */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-700">🪙 Currency Management</h5>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Coin Amount</label>
                      <input
                        type="number"
                        min="1"
                        value={coinAmount}
                        onChange={(e) => setCoinAmount(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (handleDeductCurrency) {
                            handleDeductCurrency(selectedStudentId, coinAmount);
                          }
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                      >
                        Remove {coinAmount} Coins
                      </button>
                    </div>
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
                        ? 'Access to up to 5 classes and premium features'
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

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100">
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