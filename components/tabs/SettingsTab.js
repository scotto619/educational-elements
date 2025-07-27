// components/tabs/SettingsTab.js - Settings and Configuration (UPDATED)
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

  // UPDATED: Reset student XP and progress (now includes pets and avatars)
  const resetStudentXP = async () => {
    const resetStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatarBase: 'Wizard F', // ADDED: Reset avatar to default
      avatar: `/avatars/Wizard F/Level 1.png`,
      ownedAvatars: ['Wizard F'], // ADDED: Reset owned avatars
      currency: 0,
      coinsSpent: 0,
      ownedPets: [], // Reset pets too
      questsCompleted: [],
      rewardsPurchased: [],
      behaviorPoints: { respectful: 0, responsible: 0, safe: 0, learner: 0 },
      lastUpdated: new Date().toISOString()
    }));
    
    setStudents(resetStudents);
    await saveStudentsToFirebase(resetStudents);
    setShowConfirmDialog(null);
    showToast('All student XP, progress, pets, and avatars have been reset', 'success');
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

  // Section navigation
  const sections = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'class', name: 'Class Settings', icon: '🎓' },
    { id: 'data', name: 'Data Management', icon: '💾' },
    { id: 'support', name: 'Help & Support', icon: '❓' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Settings</h2>
        <p className="text-gray-600">Manage your account, class settings, and preferences</p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Account Section */}
          {activeSection === 'account' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">👤 Account Information</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4">📧 Email & Authentication</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Email Address:</span>
                      <span className="font-semibold">{user?.email || 'Not available'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Account Status:</span>
                      <span className="text-green-600 font-semibold">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="font-semibold">
                        {user?.metadata?.creationTime 
                          ? new Date(user.metadata.creationTime).toLocaleDateString()
                          : 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-4">🔒 Security</h4>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your account is secured with Firebase Authentication. 
                      To change your password or update security settings, please contact support.
                    </p>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Class Settings Section */}
          {activeSection === 'class' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎓 Class Settings</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-4">📊 Class Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                      <div className="text-sm text-gray-600">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {students.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {students.filter(s => s.ownedPets && s.ownedPets.length > 0).length}
                      </div>
                      <div className="text-sm text-gray-600">Students with Pets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {students.length > 0 
                          ? (students.reduce((sum, s) => {
                              const level = s.totalPoints >= 300 ? 4 : s.totalPoints >= 200 ? 3 : s.totalPoints >= 100 ? 2 : 1;
                              return sum + level;
                            }, 0) / students.length).toFixed(1)
                          : '0'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Average Level</div>
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
                        <strong>UPDATED:</strong> Reset XP, coins, progress, pets, and avatars back to default (Wizard F).
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
                    <p>• Students get their first pet at 50 XP</p>
                    <p>• Use the Shop tab to let students spend coins on avatars and pets</p>
                    <p>• Create quests to give students structured goals</p>
                    <p>• Use the inventory button to manually manage student pets and avatars</p>
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
                    className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-all"
                  >
                    📝 Send Feedback
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">ℹ️ Version Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Version:</strong> 2.1.0</p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Build:</strong> Classroom Champions - Teacher Edition</p>
                    <p className="text-gray-500 italic">
                      Built for teachers, by teachers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
                  : 'Are you sure you want to reset all student progress? This will reset XP, coins, quests, purchases, pets, AND avatars back to default (Wizard F). Only student names will be kept.'
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
                {showConfirmDialog === 'resetAll' ? '🗑️ Reset Everything' : '🔄 Reset Progress & Avatars'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">📝 Send Feedback</h2>
              <p className="text-purple-100">Help us improve Classroom Champions</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="improvement">⚡ Improvement Suggestion</option>
                  <option value="question">❓ Question</option>
                  <option value="other">📋 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedbackForm.subject}
                  onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Please provide detailed information about your feedback..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your email for follow-up (optional)"
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
                📤 Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;