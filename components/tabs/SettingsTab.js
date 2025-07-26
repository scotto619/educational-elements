// components/tabs/SettingsTab.js - Settings and Configuration
import React, { useState } from 'react';

// ===============================================
// SETTINGS TAB COMPONENT
// ===============================================

const SettingsTab = ({ 
  user,
  currentClassId,
  students = [],
  setStudents,
  saveStudentsToFirebase,
  showToast = () => {} 
}) => {
  const [activeSection, setActiveSection] = useState('account');
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'bug',
    subject: '',
    message: '',
    email: user?.email || ''
  });

  // Export student data
  const exportStudentData = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom-champions-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Student data exported successfully!', 'success');
  };

  // Reset all student data
  const resetAllData = async () => {
    setStudents([]);
    await saveStudentsToFirebase([]);
    setShowConfirmDialog(null);
    showToast('All student data has been reset', 'success');
  };

  // Reset student XP only
  const resetStudentXP = async () => {
    const resetStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatar: `/avatars/${student.avatarBase || 'Wizard F'}/Level 1.png`,
      currency: 0,
      coinsSpent: 0,
      questsCompleted: [],
      rewardsPurchased: [],
      behaviorPoints: { respectful: 0, responsible: 0, safe: 0, learner: 0 },
      lastUpdated: new Date().toISOString()
    }));
    
    setStudents(resetStudents);
    await saveStudentsToFirebase(resetStudents);
    setShowConfirmDialog(null);
    showToast('All student XP and progress has been reset', 'success');
  };

  // Submit feedback
  const submitFeedback = async () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      showToast('Please fill in all feedback fields', 'error');
      return;
    }

    // Here you would typically send to your feedback API
    console.log('Feedback submitted:', feedbackForm);
    
    setShowFeedbackModal(false);
    setFeedbackForm({
      type: 'bug',
      subject: '',
      message: '',
      email: user?.email || ''
    });
    
    showToast('Thank you for your feedback!', 'success');
  };

  // Settings sections
  const sections = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'class', name: 'Class Settings', icon: '🏫' },
    { id: 'data', name: 'Data Management', icon: '💾' },
    { id: 'support', name: 'Help & Support', icon: '❓' },
    { id: 'about', name: 'About', icon: 'ℹ️' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Section Navigation */}
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{section.icon}</span>
              <span className="font-medium">{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        {/* Account Section */}
        {activeSection === 'account' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">👤 Account Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">User Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
                    <p><strong>User ID:</strong> {user?.uid?.slice(0, 8)}...</p>
                    <p><strong>Account Created:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Class Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Active Class ID:</strong> {currentClassId?.slice(0, 8)}...</p>
                    <p><strong>Total Students:</strong> {students.length}</p>
                    <p><strong>Total XP Earned:</strong> {students.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Account Actions</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all mr-3"
                  >
                    📧 Send Feedback
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@classroomchampions.com', '_blank')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                  >
                    📞 Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Settings Section */}
        {activeSection === 'class' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">🏫 Class Settings</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-4">🎮 Game Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      XP per Coin Conversion Rate
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="5">5 XP = 1 Coin (Default)</option>
                      <option value="3">3 XP = 1 Coin</option>
                      <option value="10">10 XP = 1 Coin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet Unlock Threshold
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="50">50 XP (Default)</option>
                      <option value="25">25 XP</option>
                      <option value="100">100 XP</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-4">🎵 Sound Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Enable XP Award Sounds</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Enable Level Up Celebrations</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Enable Pet Unlock Sounds</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Management Section */}
        {activeSection === 'data' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">💾 Data Management</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-4">📤 Export Data</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Download your class data as a backup or for transfer to another system.
                </p>
                <button
                  onClick={exportStudentData}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all"
                >
                  📥 Export Student Data
                </button>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-4">🔄 Reset Options</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Reset only XP, coins, and progress while keeping student names and avatars.
                    </p>
                    <button
                      onClick={() => setShowConfirmDialog('resetXP')}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all"
                    >
                      🔄 Reset Student Progress
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-yellow-200">
                    <p className="text-sm text-gray-600 mb-2">
                      ⚠️ <strong>Danger Zone:</strong> This will completely remove all student data.
                    </p>
                    <button
                      onClick={() => setShowConfirmDialog('resetAll')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                    >
                      🗑️ Reset All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Support Section */}
        {activeSection === 'support' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">❓ Help & Support</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-4">📚 Quick Start Guide</h4>
                <div className="space-y-2 text-sm">
                  <p>• Add students to your class using the "Add Student" button</p>
                  <p>• Award XP by clicking the colored buttons on student cards</p>
                  <p>• Students automatically level up every 100 XP</p>
                  <p>• Students earn coins based on their XP (5 XP = 1 coin)</p>
                  <p>• Use the Shop tab to let students spend coins on avatars and pets</p>
                  <p>• Create quests to give students structured goals</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-4">📞 Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Email Support:</strong> support@classroomchampions.com</p>
                  <p><strong>Documentation:</strong> Coming soon!</p>
                  <p><strong>Feature Requests:</strong> Use the feedback form below</p>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-4">🐛 Report Issues</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Found a bug or have a suggestion? We'd love to hear from you!
                </p>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all"
                >
                  📝 Send Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === 'about' && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6">ℹ️ About Classroom Champions</h3>
            
            <div className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
                <h4 className="text-3xl font-bold mb-2">🏰 Classroom Champions</h4>
                <p className="text-blue-100">Gamified Learning Management System</p>
                <p className="text-sm text-blue-200 mt-2">Version 2.0.0</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-3">✨ Features</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Student progress tracking</li>
                    <li>• XP and leveling system</li>
                    <li>• Avatar customization</li>
                    <li>• Pet companions</li>
                    <li>• Quest management</li>
                    <li>• Educational games</li>
                    <li>• Coin economy system</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-3">🛠️ Technology</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Next.js & React</li>
                    <li>• Firebase Database</li>
                    <li>• Tailwind CSS</li>
                    <li>• Vercel Hosting</li>
                    <li>• Real-time sync</li>
                    <li>• Mobile responsive</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">
                  Created with ❤️ for educators who want to make learning more engaging
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  © 2024 Classroom Champions. Built for teachers, by teachers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">⚠️ Confirm Action</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-800 mb-4">
                {showConfirmDialog === 'resetAll' 
                  ? 'Are you sure you want to reset ALL student data? This will permanently delete all students, their progress, and cannot be undone.'
                  : 'Are you sure you want to reset all student progress? This will reset XP, coins, quests, and purchases but keep student names and avatars.'
                }
              </p>
              <p className="text-sm text-red-600 font-semibold">This action cannot be undone!</p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog === 'resetAll' ? resetAllData : resetStudentXP}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                {showConfirmDialog === 'resetAll' ? 'Delete All Data' : 'Reset Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">📝 Send Feedback</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="improvement">🔧 Improvement Suggestion</option>
                  <option value="question">❓ Question</option>
                  <option value="other">💬 Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Brief description of your feedback"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Please provide details about your feedback..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="If you'd like a response"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;