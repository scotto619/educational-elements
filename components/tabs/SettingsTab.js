// components/tabs/SettingsTab.js - UPDATED WITH DIRECT PASSWORD UPDATES (NO APIs)
import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../../utils/firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Import the password helpers for direct operations
import { updateStudentPasswordDirect, getDefaultPassword } from '../../utils/passwordHelpers';

const SettingsTab = ({
  user,
  currentClassId,
  students = [],
  setStudents,
  updateAndSaveClass,
  showToast = () => { },
  getAvatarImage,
  calculateCoins,
  calculateAvatarLevel,
  AVAILABLE_AVATARS = [],
  // Class code management props
  currentClassData = {},
  updateClassCode,
  xpCategories = [],
  // Widget settings props
  widgetSettings = { showTimer: true, showNamePicker: true },
  onUpdateWidgetSettings,
  // Password management props
  onUpdateStudent,
  onRemoveStudent,
  architectureVersion
}) => {
  const [activeSection, setActiveSection] = useState('students');
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showClassCodeModal, setShowClassCodeModal] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Password management states
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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
  // PASSWORD MANAGEMENT FUNCTIONS - DIRECT (NO APIs)
  // ===============================================

  // Generate a simple password for setting (with randomness when actually setting)
  const generateSimplePassword = (firstName) => {
    const randomNum = Math.floor(Math.random() * 90) + 10; // 10-99
    return (firstName || 'student').toLowerCase() + randomNum;
  };

  // Generate a secure password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // DIRECT password update (bypassing APIs completely)
  const handleUpdateStudentPassword = async (studentId, password) => {
    setIsUpdating(true);

    try {
      console.log('🔑 Updating password directly (no API) for student:', studentId);

      // Use direct Firestore operations (like your XP system)
      const result = await updateStudentPasswordDirect(
        studentId,
        password,
        currentClassData?.classCode,
        architectureVersion
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update password');
      }

      showToast('Password updated successfully!', 'success');
      console.log('✅ Password updated successfully via direct method');

      // Update local state to reflect the change
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === studentId
            ? {
              ...student,
              simplePasswordHash: 'set', // Indicate password is custom
              passwordLastUpdated: new Date().toISOString()
            }
            : student
        )
      );

      // Clear form
      setSelectedStudentId('');
      setNewPassword('');

    } catch (error) {
      console.error('❌ Direct password update error:', error);
      showToast('Failed to update password: ' + error.message, 'error');
    }

    setIsUpdating(false);
  };

  // DIRECT bulk password operations (bypassing APIs)
  const handleBulkPasswordUpdate = async () => {
    if (!bulkAction) return;

    const confirmMessage = bulkAction === 'reset-simple'
      ? 'Generate simple passwords (name + number) for all students?'
      : 'Generate secure passwords for all students?';

    if (!window.confirm(confirmMessage)) return;

    setIsBulkUpdating(true);

    try {
      console.log('🔐 Bulk updating passwords directly (no API)');

      let successCount = 0;

      // Update each student directly (like your XP system)
      for (const student of students) {
        try {
          const password = bulkAction === 'reset-simple'
            ? generateSimplePassword(student.firstName)
            : generateSecurePassword();

          const result = await updateStudentPasswordDirect(
            student.id,
            password,
            currentClassData?.classCode,
            architectureVersion
          );

          if (result.success) {
            successCount++;
          }
        } catch (error) {
          console.error('Error updating password for', student.firstName, error);
        }
      }

      showToast(`Updated passwords for ${successCount} students!`, 'success');
      setBulkAction('');

      // Update local state for all students
      setStudents(prevStudents =>
        prevStudents.map(student => ({
          ...student,
          simplePasswordHash: 'set',
          passwordLastUpdated: new Date().toISOString()
        }))
      );

    } catch (error) {
      console.error('❌ Bulk password update error:', error);
      showToast('Failed to update passwords: ' + error.message, 'error');
    }

    setIsBulkUpdating(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = (studentId) => {
    setShowPasswords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Export passwords to printable format
  const exportPasswordList = () => {
    const passwordData = students.map(student => {
      const password = student.simplePasswordHash && student.passwordLastUpdated
        ? '(Custom password - check with teacher)'
        : getDefaultPassword(student.firstName);
      return `${student.firstName} ${student.lastName}: ${password}`;
    }).join('\n');

    const blob = new Blob([passwordData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentClassData?.name || 'Class'}_Passwords.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Password list exported!', 'success');
  };

  // ===============================================
  // ALL OTHER FUNCTIONS (Same as before)
  // ===============================================

  const handleWidgetToggle = async (widgetName, enabled) => {
    const newSettings = {
      ...widgetSettings,
      [widgetName]: enabled
    };

    try {
      await onUpdateWidgetSettings(newSettings);
    } catch (error) {
      console.error('Error updating widget settings:', error);
    }
  };

  const handleAddStudent = () => {
    if (!newStudentForm.firstName.trim()) {
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
  };

  const handleRemoveStudent = async (studentId) => {
    console.log('🗑️ Attempting to remove student:', studentId);
    console.log('Available student IDs:', students.map(s => s.id));

    const student = students.find(s => s.id === studentId);
    if (!student) {
      console.error('❌ Student not found with ID:', studentId);
      alert('Student not found. Please refresh the page and try again.');
      setShowConfirmDialog(null);
      return;
    }

    console.log('✅ Student found:', student.firstName, student.lastName);

    try {
      if (architectureVersion === 'v2' && onRemoveStudent) {
        console.log('📡 Using V2 architecture - calling onRemoveStudent');
        await onRemoveStudent(studentId);
        console.log('✅ Student removed via V2');
      } else {
        console.log('📝 Using V1 architecture - manual removal');
        const newStudents = students.filter(s => s.id !== studentId);
        console.log('New students count:', newStudents.length, 'Previous:', students.length);

        setStudents(newStudents);
        await updateAndSaveClass(newStudents, xpCategories);
        console.log('✅ Student removed via V1');
      }

      // Close dialog on success
      setShowConfirmDialog(null);
      showToast(`${student.firstName} removed successfully`, 'success');

    } catch (error) {
      console.error('❌ Error removing student:', error);
      showToast('Could not remove student: ' + error.message, 'error');
      // Still close dialog even on error so UI isn't stuck
      setShowConfirmDialog(null);
    }
  };

  const handleAdjustStudent = async () => {
    if (!adjustmentForm.studentId || !adjustmentForm.amount) {
      return;
    }

    const student = students.find(s => s.id === adjustmentForm.studentId);
    if (!student) return;

    const updates = {};

    switch (adjustmentForm.type) {
      case 'xp':
        updates.totalPoints = (student.totalPoints || 0) + adjustmentForm.amount;
        break;
      case 'remove_xp':
        updates.totalPoints = Math.max(0, (student.totalPoints || 0) - adjustmentForm.amount);
        break;
      case 'coins':
        updates.currency = (student.currency || 0) + adjustmentForm.amount;
        break;
      case 'remove_coins':
        updates.currency = Math.max(0, (student.currency || 0) - adjustmentForm.amount);
        break;
    }

    updates.lastUpdated = new Date().toISOString();

    try {
      if (architectureVersion === 'v2' && onUpdateStudent) {
        await onUpdateStudent(student.id, updates, 'Settings Adjustment');
      } else {
        const newStudents = students.map(s => s.id === adjustmentForm.studentId ? { ...s, ...updates } : s);
        setStudents(newStudents);
        await updateAndSaveClass(newStudents, xpCategories);
      }

      setAdjustmentForm({ studentId: '', type: 'xp', amount: 0, reason: '' });
    } catch (error) {
      console.error('Error adjusting student:', error);
      showToast('Could not update student', 'error');
    }
  };

  const handleChangeAvatar = async (studentId, newAvatarBase) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updates = {
      avatarBase: newAvatarBase,
      ownedAvatars: [...new Set([...(student.ownedAvatars || []), newAvatarBase])],
      lastUpdated: new Date().toISOString()
    };

    try {
      if (architectureVersion === 'v2' && onUpdateStudent) {
        await onUpdateStudent(studentId, updates, 'Avatar Change');
      } else {
        const newStudents = students.map(s => s.id === studentId ? { ...s, ...updates } : s);
        setStudents(newStudents);
        await updateAndSaveClass(newStudents, xpCategories);
      }

      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating avatar:', error);
      showToast('Could not update avatar', 'error');
    }
  };

  const handleUpdateClassCode = async () => {
    if (!newClassCode.trim()) {
      return;
    }

    try {
      await updateClassCode(newClassCode.trim());
      setShowClassCodeModal(false);
      setNewClassCode('');
    } catch (error) {
      console.error('Error updating class code:', error);
    }
  };

  const exportStudentData = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `classroom-champions-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetAllData = async () => {
    setStudents([]);
    await updateAndSaveClass([], xpCategories);
    setShowConfirmDialog(null);
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
  };

  const handleUnsubscribe = () => {
    const emailBody = `
Please unsubscribe my account from Educational Elements.

Account Details:
Email: ${user?.email || 'Unknown'}
User ID: ${user?.uid || 'Unknown'}
Date: ${new Date().toISOString()}

Reason for unsubscribing (optional): 

Thank you.
    `.trim();

    const mailtoLink = `mailto:admin@educational-elements.com?subject=Unsubscribe Request&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;

    setShowUnsubscribeModal(false);
  };

  const handleDeleteAccount = () => {
    if (!user?.uid) {
      showToast('You need to be logged in to request account deletion.', 'error');
      return;
    }

    const emailBody = `
Request to Delete Account:

User Email: ${user?.email || 'Unknown'}
User ID: ${user?.uid || 'Unknown'}
Reason: ${deleteReason || 'No reason provided'}

Please process my account deletion request.
    `.trim();

    const mailtoLink = `mailto:admin@educational-elements.com?subject=Account Deletion Request&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    showToast('Opening email client...', 'success');
    setShowDeleteAccountModal(false);
    setDeleteReason('');
  };

  const submitFeedback = async () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      return;
    }

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

    const mailtoLink = `mailto:admin@educational-elements.com?subject=Educational Elements ${feedbackForm.type}: ${encodeURIComponent(feedbackForm.subject)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;

    setShowFeedbackModal(false);
    setFeedbackForm({
      type: 'suggestion',
      subject: '',
      message: '',
      email: user?.email || ''
    });
  };

  // Section navigation
  const sections = [
    { id: 'students', name: 'Student Management', icon: '👥' },
    { id: 'passwords', name: 'Student Passwords', icon: '🔐' },
    { id: 'adjustments', name: 'XP & Coin Adjustments', icon: '⚖️' },
    { id: 'widgets', name: 'Widget Settings', icon: '🎛️' },
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
              className={`flex items-center space-x-2 px-4 py-4 font-semibold transition-all whitespace-nowrap ${activeSection === section.id
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
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Last Name (Optional)"
                    value={newStudentForm.lastName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
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

          {/* Password Management Section - DIRECT (NO APIs) */}
          {activeSection === 'passwords' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-2">Student Password Management</h2>
                <p className="text-purple-100">
                  Manage individual student passwords for secure portal access
                </p>
              </div>

              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-800">Password System Working!</h3>
                    <p className="text-sm text-green-700">Default passwords are working. Students can now log in and you can update passwords below.</p>
                  </div>
                </div>
              </div>

              {/* Password Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Password Guidelines</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Default passwords:</strong> Student's first name + "123" (e.g., "frank123")</li>
                  <li>• <strong>Simple passwords:</strong> Student's first name + 2-digit number (e.g., "frank47")</li>
                  <li>• <strong>Secure passwords:</strong> 8-character random passwords for older students</li>
                  <li>• Students can ask you to reset their password if forgotten</li>
                </ul>
              </div>

              {/* Individual Password Management */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Update Individual Password</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Student
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!selectedStudentId}
                    />
                  </div>

                  <div className="flex items-end space-x-2">
                    <button
                      onClick={() => {
                        const student = students.find(s => s.id === selectedStudentId);
                        if (student) {
                          setNewPassword(generateSimplePassword(student.firstName));
                        }
                      }}
                      disabled={!selectedStudentId}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Generate Simple
                    </button>
                    <button
                      onClick={() => setNewPassword(generateSecurePassword())}
                      disabled={!selectedStudentId}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Generate Secure
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (selectedStudentId && newPassword) {
                        handleUpdateStudentPassword(selectedStudentId, newPassword);
                      }
                    }}
                    disabled={!selectedStudentId || !newPassword || isUpdating}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isUpdating ? 'Updating...' : 'Update Password (Direct)'}
                  </button>
                </div>
              </div>

              {/* Current Student Status */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Student Password Status</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Student</th>
                        <th className="text-left py-2 px-3">Password Status</th>
                        <th className="text-left py-2 px-3">Password</th>
                        <th className="text-left py-2 px-3">Last Updated</th>
                        <th className="text-left py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const hasCustomPassword = student.simplePasswordHash && student.passwordLastUpdated;
                        const displayPassword = hasCustomPassword
                          ? '(Custom password set)'
                          : getDefaultPassword(student.firstName);

                        return (
                          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={getAvatarImage(student.avatarBase || 'Wizard F', calculateAvatarLevel(student.totalPoints))}
                                  alt={student.firstName}
                                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                                  onError={(e) => { e.target.src = '/shop/Basic/Banana.png'; }}
                                />
                                <span className="font-medium">{student.firstName} {student.lastName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${hasCustomPassword
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {hasCustomPassword ? 'Custom Set' : 'Using Default'}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-2">
                                <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {showPasswords[student.id] ? displayPassword : '••••••••'}
                                </code>
                                {!hasCustomPassword && (
                                  <button
                                    onClick={() => togglePasswordVisibility(student.id)}
                                    className="text-gray-500 hover:text-gray-700"
                                    title={showPasswords[student.id] ? 'Hide' : 'Show'}
                                  >
                                    {showPasswords[student.id] ? '👁️' : '👁️‍🗨️'}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-gray-600">
                              {student.passwordLastUpdated
                                ? new Date(student.passwordLastUpdated).toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => {
                                  setSelectedStudentId(student.id);
                                  setNewPassword(hasCustomPassword ? '' : getDefaultPassword(student.firstName));
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Reset
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No students in this class yet.
                  </div>
                )}
              </div>

              {/* Bulk Operations */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Bulk Password Operations</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bulk Action
                    </label>
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose action...</option>
                      <option value="reset-simple">Reset all to simple passwords</option>
                      <option value="reset-secure">Reset all to secure passwords</option>
                    </select>
                  </div>

                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleBulkPasswordUpdate}
                      disabled={!bulkAction || isBulkUpdating}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isBulkUpdating ? 'Updating...' : 'Apply to All Students (Direct)'}
                    </button>

                    <button
                      onClick={exportPasswordList}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium"
                    >
                      Export List
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Password updates now work directly (no APIs).
                    Students will need to use their new passwords to log in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* All other sections remain the same... */}
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
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, studentId: e.target.value })}
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
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
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
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">Reason (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g., manual correction"
                        value={adjustmentForm.reason}
                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
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

          {/* Widget Settings */}
          {activeSection === 'widgets' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎛️ Widget Settings</h3>

              <div className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-4">🎯 Floating Widgets</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Control which floating widgets appear in the bottom corners of your screen across all tabs.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">⏰</span>
                        <div>
                          <div className="font-semibold text-gray-800">Timer Widget</div>
                          <div className="text-sm text-gray-600">Persistent timer for activities and transitions</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={widgetSettings.showTimer}
                          onChange={(e) => handleWidgetToggle('showTimer', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎯</span>
                        <div>
                          <div className="font-semibold text-gray-800">Name Picker Widget</div>
                          <div className="text-sm text-gray-600">Random student selection and group creation</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={widgetSettings.showNamePicker}
                          onChange={(e) => handleWidgetToggle('showNamePicker', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Class Settings */}
          {activeSection === 'class' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">🎓 Class Settings</h3>

              <div className="space-y-6">
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

          {/* Data Management */}
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

          {/* Help & Feedback */}
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
                    <p>• Use floating widgets (timer and name picker) for quick classroom tools</p>
                    <p>• Use the XP & Coin Adjustments section for manual corrections</p>
                    <p>• Set individual student passwords in the Student Passwords section</p>
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
                    <p><strong>Version:</strong> 2.4.0 - Password System Fixed!</p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                    <p><strong>Build:</strong> Educational Elements - Teacher Edition</p>
                    <p><strong>Architecture:</strong> {architectureVersion}</p>
                    <p className="text-gray-500 italic">
                      Built for teachers, by teachers. APIs bypassed for reliability.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">🛑 Delete My Account</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Instantly cancel your subscription, disable login access, and remove future charges. You can resubscribe later to regain access.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                    <button
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all shadow-sm"
                    >
                      Delete my account
                    </button>
                    <p className="text-xs text-red-600 italic">This signs you out immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* All the modals remain exactly the same as before... */}

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
                    className={`border-2 rounded-lg p-3 text-center cursor-pointer transition-all hover:border-blue-400 ${selectedStudent.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                onClick={() => { setShowClassCodeModal(false); setNewClassCode(''); }}
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

      {/* Delete Account Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">🚫 Delete Account</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-800 font-semibold">
                This will open your email client to send a deletion request to our admin team.
              </p>
              <p className="text-sm text-gray-600">
                We will process your request manually to ensure all data is handled correctly.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Tell us why you're leaving"
                />
              </div>
            </div>

            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => { setShowDeleteAccountModal(false); setDeleteReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                disabled={isDeletingAccount}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-60"
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? 'Opening...' : 'Send Deletion Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsubscribe Modal */}
      {showUnsubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">📧 Account Cancellation</h2>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-800">
                This will open your email client to send a cancellation request to our support team.
              </p>
              <p className="text-sm text-gray-600">
                We'll process your request and cancel your subscription. You'll keep access until your current billing period ends.
              </p>
            </div>

            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowUnsubscribeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUnsubscribe}
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                📧 Send Request
              </button>
            </div>
          </div>
        </div>
      )}

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
                  : showConfirmDialog === 'resetProgress'
                    ? 'Are you sure you want to reset all student progress? This will reset XP, coins, quests, purchases, pets, AND avatars back to default (Wizard F). Only student names will be kept.'
                    : showConfirmDialog.startsWith('remove_')
                      ? `Are you sure you want to remove ${students.find(s => s.id === showConfirmDialog.slice(7))?.firstName} from the class? This cannot be undone.`
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
                  console.log('🎯 Confirm dialog action:', showConfirmDialog);

                  if (showConfirmDialog === 'resetAll') {
                    resetAllData();
                  } else if (showConfirmDialog === 'resetProgress') {
                    resetStudentProgress();
                  } else if (showConfirmDialog?.startsWith('remove_')) {
                    // Extract student ID from the confirmation string
                    const studentId = showConfirmDialog.replace('remove_', '');
                    console.log('📍 Extracted student ID:', studentId);
                    handleRemoveStudent(studentId);
                  } else {
                    console.warn('⚠️ Unknown confirmation action:', showConfirmDialog);
                    setShowConfirmDialog(null);
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
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
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
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
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
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
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