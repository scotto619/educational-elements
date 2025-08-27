// components/tabs/SettingsTab.js - Fixed Settings with Working Remove Student Functionality
import React, { useState } from 'react';

const SettingsTab = ({ 
  user,
  currentClassId,
  students = [],
  setStudents,
  updateAndSaveClass,
  showToast = () => {},
  getAvatarImage,
  calculateCoins,
  calculateAvatarLevel,
  AVAILABLE_AVATARS = [],
  // Class code management props
  currentClassData = {},
  updateClassCode,
  xpCategories = []
}) => {
  const [activeSection, setActiveSection] = useState('students');
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  
  // Form states
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: '',
    lastName: ''
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    studentId: '',
    type: 'xp', // xp, coins, remove_xp, remove_coins
    amount: 0,
    reason: ''
  });

  const [newClassCode, setNewClassCode] = useState('');
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'suggestion',
    subject: '',
    message: '',
    email: user?.email || ''
  });

  // ===============================================
  // STUDENT MANAGEMENT FUNCTIONS - FIXED
  // ===============================================

  const handleAddStudent = () => {
    if (!newStudentForm.firstName.trim()) {
      showToast('Please enter a first name', 'error');
      return;
    }

    const newStudent = {
      id: `student_${Date.now()}`,
      firstName: newStudentForm.firstName.trim(),
      lastName: newStudentForm.lastName.trim(),
      totalPoints: 0,
      currency: 0,
      coinsSpent: 0,
      avatarLevel: 1,
      avatarBase: 'Wizard F',
      avatar: getAvatarImage('Wizard F', 1),
      ownedAvatars: ['Wizard F'],
      ownedPets: [],
      createdAt: new Date().toISOString()
    };

    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);
    
    setNewStudentForm({ firstName: '', lastName: '' });
    showToast(`${newStudent.firstName} added to class!`, 'success');
  };

  // FIXED: Properly handle student removal with correct state updates
  const handleRemoveStudent = (studentId) => {
    console.log('Removing student:', studentId);
    
    const student = students.find(s => s.id === studentId);
    if (!student) {
      console.log('Student not found');
      showToast('Student not found', 'error');
      return;
    }

    const newStudents = students.filter(s => s.id !== studentId);
    console.log('New students array:', newStudents.length);
    
    // Update state immediately
    setStudents(newStudents);
    
    // Save to Firebase
    updateAndSaveClass(newStudents, xpCategories);
    
    // Close dialog and show feedback
    setShowConfirmDialog(null);
    showToast(`${student.firstName} removed from class`, 'success');
    
    console.log('Student removal completed');
  };

  const handleAdjustStudent = () => {
    if (!adjustmentForm.studentId || !adjustmentForm.amount) {
      showToast('Please select a student and enter an amount', 'error');
      return;
    }

    const student = students.find(s => s.id === adjustmentForm.studentId);
    if (!student) return;

    let updatedStudent = { ...student, lastUpdated: new Date().toISOString() };

    switch (adjustmentForm.type) {
      case 'xp':
        updatedStudent.totalPoints = (updatedStudent.totalPoints || 0) + adjustmentForm.amount;
        break;
      case 'remove_xp':
        updatedStudent.totalPoints = Math.max(0, (updatedStudent.totalPoints || 0) - adjustmentForm.amount);
        break;
      case 'coins':
        updatedStudent.currency = (updatedStudent.currency || 0) + adjustmentForm.amount;
        break;
      case 'remove_coins':
        updatedStudent.currency = Math.max(0, (updatedStudent.currency || 0) - adjustmentForm.amount);
        break;
    }

    const newStudents = students.map(s => s.id === adjustmentForm.studentId ? updatedStudent : s);
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);

    const action = adjustmentForm.type.includes('remove') ? 'removed' : 'added';
    const currency = adjustmentForm.type.includes('xp') ? 'XP' : 'coins';
    showToast(`${adjustmentForm.amount} ${currency} ${action} ${adjustmentForm.reason ? `for ${adjustmentForm.reason}` : ''}`, 'success');
    
    setAdjustmentForm({ studentId: '', type: 'xp', amount: 0, reason: '' });
  };

  const handleChangeAvatar = (studentId, newAvatarBase) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updatedStudent = {
      ...student,
      avatarBase: newAvatarBase,
      ownedAvatars: [...new Set([...(student.ownedAvatars || []), newAvatarBase])],
      lastUpdated: new Date().toISOString()
    };

    const newStudents = students.map(s => s.id === studentId ? updatedStudent : s);
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);

    showToast(`${student.firstName}'s avatar changed to ${newAvatarBase}!`, 'success');
    setSelectedStudent(null);
  };

  // ===============================================
  // CLASS CODE MANAGEMENT
  // ===============================================

  const handleUpdateClassCode = async () => {
    if (!newClassCode.trim()) {
      showToast('Please enter a class code', 'error');
      return;
    }

    try {
      await updateClassCode(newClassCode.trim());
      showToast('Class code updated successfully!', 'success');
      setShowClassCodeModal(false);
      setNewClassCode('');
    } catch (error) {
      showToast('Error updating class code', 'error');
    }
  };

  // ===============================================
  // DATA MANAGEMENT
  // ===============================================

  const exportStudentData = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom-champions-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Student data exported!', 'success');
  };

  const resetAllData = async () => {
    setStudents([]);
    await updateAndSaveClass([], xpCategories);
    setShowConfirmDialog(null);
    showToast('All data has been reset', 'success');
  };

  const resetStudentProgress = async () => {
    const resetStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatarBase: 'Wizard F',
      avatar: getAvatarImage('Wizard F', 1),
      ownedAvatars: ['Wizard F'],
      currency: 0,
      coinsSpent: 0,
      ownedPets: [],
      questsCompleted: [],
      rewardsPurchased: [],
      behaviorPoints: { respectful: 0, responsible: 0, safe: 0, learner: 0 },
      lastUpdated: new Date().toISOString()
    }));
    
    setStudents(resetStudents);
    await updateAndSaveClass(resetStudents, xpCategories);
    setShowConfirmDialog(null);
    showToast('All student progress has been reset', 'success');
  };

  // ===============================================
  // FEEDBACK SYSTEM
  // ===============================================

  const submitFeedback = async () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      showToast('Please fill in subject and message', 'error');
      return;
    }

    // Create email content
    const emailBody = `
Subject: ${feedbackForm.type.toUpperCase()}: ${feedbackForm.subject}
From: ${feedbackForm.email || 'Anonymous'}
User ID: ${user?.uid || 'Unknown'}
Type: ${feedbackForm.type}

Message:
${feedbackForm.message}

---
Sent from Educational Elements Settings
Time: ${new Date().toISOString()}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:admin@educational-elements.com?subject=Educational Elements ${feedbackForm.type}: ${encodeURIComponent(feedbackForm.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    setShowFeedbackModal(false);
    setFeedbackForm({
      type: 'suggestion',
      subject: '',
      message: '',
      email: user?.email || ''
    });
    
    showToast('Email client opened with your feedback!', 'success');
  };

  // Section navigation
  const sections = [
    { id: 'students', name: 'Student Management', icon: '👥' },
    { id: 'adjustments', name: 'XP & Coin Adjustments', icon: '⚖️' },
    { id: 'class', name: 'Class Settings', icon: '🎓' },
    { id: 'data', name: 'Data Management', icon: '💾' },
    { id: 'support', name: 'Help & Feedback', icon: '💬' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Settings & Management</h2>
        <p className="text-gray-600">Manage your students, class settings, and provide feedback</p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-4 font-semibold transition-all whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="text-sm">{section.name}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Student Management Section */}
          {activeSection === 'students' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">👥 Student Management</h3>
              
              {/* Add Student */}
              <div className="mb-8 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-4">➕ Add New Student</h4>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newStudentForm.firstName}
                    onChange={(e) => setNewStudentForm({...newStudentForm, firstName: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Last Name (Optional)"
                    value={newStudentForm.lastName}
                    onChange={(e) => setNewStudentForm({...newStudentForm, lastName: e.target.value})}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <button
                    onClick={handleAddStudent}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all"
                  >
                    Add Student
                  </button>
                </div>
              </div>

              {/* Current Students */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 mb-4">Current Students ({students.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <div key={student.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                          className="w-12 h-12 rounded-full border-2 border-gray-300"
                          alt={student.firstName}
                        />
                        <div className="flex-1">
                          <h5 className="font-semibold">{student.firstName} {student.lastName}</h5>
                          <p className="text-sm text-gray-600">Level {calculateAvatarLevel(student.totalPoints)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <p>XP: {student.totalPoints || 0}</p>
                        <p>Coins: {calculateCoins(student)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Change Avatar
                        </button>
                        <button 
                          onClick={() => {
                            console.log('Setting confirm dialog for student:', student.id);
                            setShowConfirmDialog(`remove_${student.id}`);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* XP & Coin Adjustments Section */}
          {activeSection === 'adjustments' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">⚖️ XP & Coin Adjustments</h3>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-4">Adjust Student Points</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Select Student</label>
                      <select
                        value={adjustmentForm.studentId}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, studentId: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Choose student...</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Action</label>
                      <select
                        value={adjustmentForm.type}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="xp">Add XP</option>
                        <option value="remove_xp">Remove XP</option>
                        <option value="coins">Add Coins</option>
                        <option value="remove_coins">Remove Coins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Amount</label>
                      <input
                        type="number"
                        min="0"
                        value={adjustmentForm.amount}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, amount: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Reason (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., manual correction"
                        value={adjustmentForm.reason}
                        onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAdjustStudent}
                    disabled={!adjustmentForm.studentId || !adjustmentForm.amount}
                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Class Settings Section */}
          {activeSection === 'class' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎓 Class Settings</h3>
              
              <div className="space-y-6">
                {/* Class Code Management */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-4">🔑 Class Code Management</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current Class Code:</span>
                      <span className="font-bold text-lg text-purple-600">
                        {currentClassData.classCode || 'Not set'}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowClassCodeModal(true)}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all"
                    >
                      Update Class Code
                    </button>
                    <p className="text-sm text-gray-600">
                      Students use this code to join your class on the student portal.
                    </p>
                  </div>
                </div>

                {/* Class Statistics */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4">📊 Class Statistics</h4>
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
                              const level = calculateAvatarLevel(s.totalPoints || 0);
                              return sum + level;
                            }, 0) / students.length).toFixed(1)
                          : '0'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Average Level</div>
                    </div>
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
                        Reset XP, coins, progress, pets, and avatars back to default (Wizard F).
                      </p>
                      <button
                        onClick={() => setShowConfirmDialog('resetProgress')}
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

          {/* Help & Feedback Section */}
          {activeSection === 'support' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">💬 Help & Feedback</h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-4">📚 Quick Start Guide</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Add students to your class using the Student Management section</p>
                    <p>• Award XP by clicking colored buttons on student cards in the Students tab</p>
                    <p>• Students automatically level up every 100 XP</p>
                    <p>• Students earn coins based on their XP (5 XP = 1 coin)</p>
                    <p>• Students get their first pet at 50 XP</p>
                    <p>• Use the Shop tab to let students spend coins on avatars and pets</p>
                    <p>• Create quests to give students structured goals</p>
                    <p>• Use the XP & Coin Adjustments section for manual corrections</p>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-4">💡 Send Feedback or Suggestions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Help us improve Educational Elements! Share your ideas, report bugs, or ask questions.
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
                    <p><strong>Build:</strong> Educational Elements - Teacher Edition</p>
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

      {/* Avatar Selection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Change Avatar for {selectedStudent.firstName}</h2>
              <button onClick={() => setSelectedStudent(null)} className="text-2xl font-bold hover:text-red-600">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {AVAILABLE_AVATARS.map(avatarName => (
                  <div 
                    key={avatarName} 
                    className={`border-2 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${
                      selectedStudent.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => handleChangeAvatar(selectedStudent.id, avatarName)}
                  >
                    <img 
                      src={getAvatarImage(avatarName, calculateAvatarLevel(selectedStudent.totalPoints))} 
                      className="w-16 h-16 rounded-full mx-auto mb-2"
                      alt={avatarName}
                    />
                    <p className="text-xs font-semibold truncate">{avatarName}</p>
                    {selectedStudent.avatarBase === avatarName && (
                      <p className="text-xs text-blue-600 font-bold">Current</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Class Code Modal */}
      {showClassCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">🔑 Update Class Code</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Class Code</label>
                <input
                  type="text"
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value)}
                  placeholder="Enter new class code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-600">
                Students will use this code to join your class on the student portal.
              </p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => {setShowClassCodeModal(false); setNewClassCode('');}}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateClassCode}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Update Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Confirmation Dialog with Better Logic */}
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
                  : showConfirmDialog === 'resetProgress'
                  ? 'Are you sure you want to reset all student progress? This will reset XP, coins, quests, purchases, pets, AND avatars back to default (Wizard F). Only student names will be kept.'
                  : showConfirmDialog.startsWith('remove_')
                  ? `Are you sure you want to remove ${students.find(s => s.id === showConfirmDialog.split('_')[1])?.firstName} from the class? This cannot be undone.`
                  : 'Are you sure you want to continue?'
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
                onClick={() => {
                  console.log('Confirm dialog action:', showConfirmDialog);
                  
                  if (showConfirmDialog === 'resetAll') {
                    resetAllData();
                  } else if (showConfirmDialog === 'resetProgress') {
                    resetStudentProgress();
                  } else if (showConfirmDialog.startsWith('remove_')) {
                    const studentId = showConfirmDialog.split('_')[1];
                    console.log('Removing student with ID:', studentId);
                    handleRemoveStudent(studentId);
                  }
                }}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                {showConfirmDialog === 'resetAll' ? '🗑️ Reset Everything' 
                : showConfirmDialog === 'resetProgress' ? '🔄 Reset Progress'
                : '🗑️ Remove Student'}
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
              <p className="text-purple-100">Help us improve Educational Elements</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="suggestion">💡 Suggestion</option>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">⭐ Feature Request</option>
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