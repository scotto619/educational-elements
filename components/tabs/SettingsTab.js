import React from 'react';

const SettingsTab = ({ 
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
  setFeedbackType,
  router
}) => {
  const currentPlan = userData?.subscription || 'basic';
  const isProPlan = currentPlan === 'pro';
  const hasStudents = students.length > 0;
  const studentsWithPets = students.filter(s => s.pet?.image).length;

  // Export data function
  const handleExportData = () => {
    const exportData = {
      classes: userData?.classes || [],
      exportDate: new Date().toISOString(),
      userEmail: user?.email,
      subscription: userData?.subscription
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `classroom-champions-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center">
          <span className="text-3xl mr-3">⚙️</span>
          Settings
        </h2>
        <p className="text-gray-600 mt-2">Manage your classroom, subscription, and account settings</p>
      </div>

      {/* Student & Class Management */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">👥</span>
            Student & Class Management
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Reset All Points */}
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <h4 className="font-semibold text-gray-800">Reset All Student Points</h4>
              <p className="text-sm text-gray-600 mt-1">Reset XP points for all students in the current class</p>
            </div>
            <button
              onClick={() => setShowConfirmDialog({
                title: 'Reset All Points?',
                message: 'This will reset XP points for all students in the current class. This action cannot be undone.',
                icon: '⚠️',
                type: 'warning',
                confirmText: 'Reset All',
                onConfirm: handleResetAllPoints
              })}
              disabled={!hasStudents}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Reset All Points
            </button>
          </div>

          {/* Reset Pet Speeds */}
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <h4 className="font-semibold text-gray-800">Reset Pet Racing Speeds</h4>
              <p className="text-sm text-gray-600 mt-1">Reset all pet speeds and win records to default values</p>
            </div>
            <button
              onClick={() => setShowConfirmDialog({
                title: 'Reset Pet Speeds?',
                message: 'This will reset all pet speeds to 1.0 and clear win records. This action cannot be undone.',
                icon: '🐾',
                type: 'warning',
                confirmText: 'Reset Speeds',
                onConfirm: handleResetPetSpeeds
              })}
              disabled={studentsWithPets === 0}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              Reset Pet Speeds
            </button>
          </div>

          {/* Individual Student Management */}
          {hasStudents && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Individual Student Actions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.firstName} className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {student.firstName.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{student.firstName}</span>
                      <span className="text-sm text-gray-500">({student.totalPoints || 0} XP)</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowConfirmDialog({
                          title: 'Reset Student Points?',
                          message: `Reset all XP points for ${student.firstName}? This action cannot be undone.`,
                          icon: '⚠️',
                          type: 'warning',
                          confirmText: 'Reset Points',
                          onConfirm: () => handleResetStudentPoints(student.id)
                        })}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                      >
                        Reset XP
                      </button>
                      <button
                        onClick={() => setShowConfirmDialog({
                          title: 'Remove Student?',
                          message: `Permanently remove ${student.firstName} from the class? This action cannot be undone.`,
                          icon: '🗑️',
                          type: 'danger',
                          confirmText: 'Remove Student',
                          onConfirm: () => handleRemoveStudent(student.id)
                        })}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription & Billing */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">💳</span>
            Subscription & Billing
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-800">Current Plan</h4>
              <p className="text-sm text-gray-600 mt-1">
                You're currently on the <span className="font-semibold capitalize">{currentPlan}</span> plan
              </p>
              {isProPlan && (
                <p className="text-sm text-green-600 mt-1">✅ Up to 5 classes • Priority support</p>
              )}
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isProPlan ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isProPlan ? 'PRO' : 'BASIC'}
              </span>
            </div>
          </div>

          {/* Upgrade/Manage Subscription */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <h4 className="font-semibold text-gray-800">
                {isProPlan ? 'Manage Subscription' : 'Upgrade to Pro'}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {isProPlan 
                  ? 'View billing history, update payment methods, or cancel subscription'
                  : 'Unlock up to 5 classes, priority support, and advanced features'
                }
              </p>
            </div>
            <button
              onClick={handleSubscriptionManagement}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              {isProPlan ? 'Manage Billing' : 'Upgrade Now'}
            </button>
          </div>

          {/* Pricing Information */}
          {!isProPlan && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-3">Pro Plan Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Up to 5 classrooms</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Priority support</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✅</span>
                    <span>Early access to new features</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support & Feedback */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">🆘</span>
            Support & Feedback
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setFeedbackType('bug');
                setShowFeedbackModal(true);
              }}
              className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🐛</div>
              <h4 className="font-semibold text-gray-800">Report Bug</h4>
              <p className="text-sm text-gray-600 mt-1">Found something broken? Let us know!</p>
            </button>
            
            <button
              onClick={() => {
                setFeedbackType('feature');
                setShowFeedbackModal(true);
              }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-semibold text-gray-800">Request Feature</h4>
              <p className="text-sm text-gray-600 mt-1">Have an idea? We'd love to hear it!</p>
            </button>
            
            <button
              onClick={() => {
                setFeedbackType('feedback');
                setShowFeedbackModal(true);
              }}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">💬</div>
              <h4 className="font-semibold text-gray-800">General Feedback</h4>
              <p className="text-sm text-gray-600 mt-1">Share your thoughts and suggestions</p>
            </button>
          </div>
        </div>
      </div>

      {/* Account & Data */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">👤</span>
            Account & Data
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Account Information */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Account Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-800">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plan:</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{currentPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Classes:</span>
                <span className="text-sm font-medium text-gray-800">{userData?.classes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Students:</span>
                <span className="text-sm font-medium text-gray-800">
                  {userData?.classes?.reduce((sum, cls) => sum + cls.students.length, 0) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Data Export */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-semibold text-gray-800">Export Data</h4>
              <p className="text-sm text-gray-600 mt-1">Download all your classroom data as a backup</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Export Data
            </button>
          </div>

          {/* Legal & Privacy */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3">Legal & Privacy</h4>
            <div className="space-y-2">
              <button
                onClick={() => window.open('/terms', '_blank')}
                className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                📄 Terms of Service
              </button>
              <button
                onClick={() => window.open('/privacy', '_blank')}
                className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                🔒 Privacy Policy
              </button>
              <button
                onClick={() => {
                  setFeedbackType('feedback');
                  setShowFeedbackModal(true);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                🗑️ Request Data Deletion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="mr-3">📱</span>
            App Information
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Version Info</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Version:</span>
                  <span className="text-sm font-medium text-gray-800">2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm font-medium text-gray-800">Jan 2025</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Quick Links</h4>
              <div className="space-y-2">
                <button
                  onClick={() => window.open('https://docs.classroomchampions.com', '_blank')}
                  className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  📚 User Guide
                </button>
                <button
                  onClick={() => window.open('https://blog.classroomchampions.com', '_blank')}
                  className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  📰 What's New
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;