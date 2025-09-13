// components/StudentPasswordManagement.js - FIXED VERSION
import React, { useState } from 'react';

const StudentPasswordManagement = ({ 
  students, 
  onUpdateStudent, 
  showToast, 
  currentClassData,
  architectureVersion 
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Generate a simple password for a student (firstName + random 2-digit number)
  const generateSimplePassword = (firstName) => {
    const randomNum = Math.floor(Math.random() * 90) + 10; // 10-99
    return (firstName || 'student').toLowerCase() + randomNum;
  };

  // Generate a secure password (for older students or teacher preference)
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Update individual student password
  const handleUpdateStudentPassword = async (studentId, password) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/update-student-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId,
          newPassword: password,
          classCode: currentClassData?.classCode,
          architectureVersion: architectureVersion
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update password');
      }

      showToast('Password updated successfully!', 'success');
      
      // Clear form
      setSelectedStudentId('');
      setNewPassword('');
      
    } catch (error) {
      console.error('Error updating password:', error);
      showToast('Failed to update password. Please try again.', 'error');
    }
    
    setIsUpdating(false);
  };

  // Bulk password operations
  const handleBulkPasswordUpdate = async () => {
    if (!bulkAction) return;
    
    const confirmMessage = bulkAction === 'reset-simple' 
      ? 'Generate simple passwords (name + number) for all students?' 
      : 'Generate secure passwords for all students?';
      
    if (!window.confirm(confirmMessage)) return;
    
    setIsBulkUpdating(true);
    
    try {
      const passwordUpdates = students.map(student => ({
        studentId: student.id,
        password: bulkAction === 'reset-simple' 
          ? generateSimplePassword(student.firstName)
          : generateSecurePassword()
      }));

      const response = await fetch('/api/bulk-update-passwords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordUpdates: passwordUpdates,
          classCode: currentClassData?.classCode,
          architectureVersion: architectureVersion
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update passwords');
      }

      showToast(`Updated passwords for ${result.updatedCount} students!`, 'success');
      setBulkAction('');
      
    } catch (error) {
      console.error('Error bulk updating passwords:', error);
      showToast('Failed to update passwords. Please try again.', 'error');
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
      const defaultPassword = generateSimplePassword(student.firstName);
      return `${student.firstName} ${student.lastName}: ${defaultPassword}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">Student Password Management</h2>
        <p className="text-purple-100">
          Manage individual student passwords for secure portal access
        </p>
      </div>

      {/* Password Security Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Password Guidelines</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Simple passwords:</strong> Student's first name + 2-digit number (e.g., "sarah47")</li>
          <li>• <strong>Secure passwords:</strong> 8-character random passwords for older students</li>
          <li>• <strong>Default behavior:</strong> If no password is set, system generates firstName + "123"</li>
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
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </div>
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
              {isBulkUpdating ? 'Updating...' : 'Apply to All Students'}
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
            <strong>Warning:</strong> Bulk operations will update passwords for all students in the class. 
            Students will need to use their new passwords to log in.
          </p>
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
                <th className="text-left py-2 px-3">Default Password</th>
                <th className="text-left py-2 px-3">Last Updated</th>
                <th className="text-left py-2 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const hasCustomPassword = student.passwordHash && student.passwordLastUpdated;
                const defaultPassword = generateSimplePassword(student.firstName);
                
                return (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={`/avatars/${student.avatarBase || 'Wizard F'}/Level 1.png`}
                          alt={student.firstName}
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          onError={(e) => { e.target.src = '/shop/Basic/Banana.png'; }}
                        />
                        <span className="font-medium">{student.firstName} {student.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        hasCustomPassword 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {hasCustomPassword ? 'Custom Set' : 'Using Default'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {showPasswords[student.id] ? defaultPassword : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePasswordVisibility(student.id)}
                          className="text-gray-500 hover:text-gray-700"
                          title={showPasswords[student.id] ? 'Hide' : 'Show'}
                        >
                          {showPasswords[student.id] ? '👁️' : '👁️‍🗨️'}
                        </button>
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
                          setNewPassword(defaultPassword);
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
    </div>
  );
};

export default StudentPasswordManagement;