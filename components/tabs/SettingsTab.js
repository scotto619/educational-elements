// components/tabs/SettingsTab.js - UPDATED WITH PASSWORD MANAGEMENT
import React, { useState } from 'react';
import StudentPasswordManagement from '../StudentPasswordManagement'; // Add this import

const SettingsTab = ({ 
  students, 
  setStudents, 
  updateAndSaveClass, 
  AVAILABLE_AVATARS, 
  currentClassData, 
  updateClassCode, 
  widgetSettings, 
  onUpdateWidgetSettings,
  showToast,
  onUpdateStudent, // Add this prop
  architectureVersion, // Add this prop
  user // Add this prop
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newClassCode, setNewClassCode] = useState('');
  const [isUpdatingClassCode, setIsUpdatingClassCode] = useState(false);

  // Settings tabs
  const settingsTabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'passwords', name: 'Student Passwords', icon: '🔐' }, // New tab
    { id: 'widgets', name: 'Widgets', icon: '🔧' },
    { id: 'reset', name: 'Reset Data', icon: '🗑️' },
    { id: 'account', name: 'Account', icon: '👤' }
  ];

  const generateNewClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleUpdateClassCode = async () => {
    if (!newClassCode.trim()) {
      showToast('Please enter a class code', 'error');
      return;
    }

    setIsUpdatingClassCode(true);
    try {
      await updateClassCode(newClassCode.trim().toUpperCase());
      showToast('Class code updated successfully!', 'success');
      setNewClassCode('');
    } catch (error) {
      console.error('Error updating class code:', error);
      showToast('Failed to update class code', 'error');
    }
    setIsUpdatingClassCode(false);
  };

  const handleGenerateNewCode = async () => {
    const code = generateNewClassCode();
    setNewClassCode(code);
  };

  const resetAllStudentData = () => {
    if (window.confirm('Are you sure you want to reset ALL student data? This action cannot be undone!')) {
      const resetStudents = students.map(student => ({
        ...student,
        totalPoints: 0,
        currency: 0,
        coinsSpent: 0,
        avatarLevel: 1,
        ownedAvatars: ['Wizard F'],
        ownedPets: [],
        gameProgress: {},
        achievements: []
      }));
      setStudents(resetStudents);
      showToast('All student data has been reset!', 'success');
      setShowResetConfirm(false);
    }
  };

  const renderTabContent = () => {
    switch (activeSettingsTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Class Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Class Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    {currentClassData?.name || 'My Class'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Class Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg font-mono text-lg">
                      {currentClassData?.classCode || 'No code set'}
                    </div>
                    <button
                      onClick={() => {
                        if (currentClassData?.classCode) {
                          navigator.clipboard.writeText(currentClassData.classCode);
                          showToast('Class code copied!', 'success');
                        }
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Update Class Code */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-3">Update Class Code</h4>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                    placeholder="Enter new class code"
                    className="px-3 py-2 border border-gray-300 rounded-lg font-mono text-lg"
                    maxLength="6"
                  />
                  <button
                    onClick={handleGenerateNewCode}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Generate
                  </button>
                  <button
                    onClick={handleUpdateClassCode}
                    disabled={!newClassCode.trim() || isUpdatingClassCode}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingClassCode ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
              
              {/* Architecture Info */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">System Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Architecture: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{architectureVersion}</span></div>
                  <div>Students: {students.length}</div>
                  <div>User ID: <span className="font-mono text-xs">{user?.uid?.substring(0, 10)}...</span></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'passwords':
        return (
          <StudentPasswordManagement 
            students={students}
            onUpdateStudent={onUpdateStudent}
            showToast={showToast}
            currentClassData={currentClassData}
            architectureVersion={architectureVersion}
          />
        );

      case 'widgets':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Widget Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">Floating Timer</label>
                    <p className="text-sm text-gray-500">Show draggable timer widget</p>
                  </div>
                  <button
                    onClick={() => onUpdateWidgetSettings({
                      ...widgetSettings,
                      showTimer: !widgetSettings.showTimer
                    })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      widgetSettings.showTimer ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        widgetSettings.showTimer ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-gray-700">Name Picker</label>
                    <p className="text-sm text-gray-500">Show random student name picker</p>
                  </div>
                  <button
                    onClick={() => onUpdateWidgetSettings({
                      ...widgetSettings,
                      showNamePicker: !widgetSettings.showNamePicker
                    })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      widgetSettings.showNamePicker ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        widgetSettings.showNamePicker ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reset':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-600">Reset Data</h3>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Warning</h4>
                <p className="text-red-700 text-sm">
                  These actions cannot be undone. Make sure you want to permanently delete this data.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full md:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  Reset All Student Data
                </button>
              </div>
              
              {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
                    <h3 className="text-xl font-bold text-red-600 mb-4">Confirm Reset</h3>
                    <p className="text-gray-700 mb-6">
                      This will reset ALL student XP, coins, avatars, and pets. This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={resetAllStudentData}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Reset All Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    {user?.email || 'Not available'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    {user?.metadata?.creationTime 
                      ? new Date(user.metadata.creationTime).toLocaleDateString()
                      : 'Not available'
                    }
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Sign In</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    {user?.metadata?.lastSignInTime 
                      ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
                      : 'Not available'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-200">
          Manage your class settings and preferences
        </p>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {settingsTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${
                  activeSettingsTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;