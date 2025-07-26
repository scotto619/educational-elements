// SettingsTab.js - ENHANCED with Quest Management Integration
import React, { useState } from 'react';

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
  handleDeductXP,
  handleDeductCurrency,
  showToast,
  router,
  // Quest System Props
  activeQuests,
  questTemplates,
  setShowQuestManagement,
  QUEST_GIVERS,
  attendanceData,
  markAttendance,
  saveQuestDataToFirebase,
  handleAddQuestTemplate,
  handleEditQuestTemplate,
  handleDeleteQuestTemplate,
  handleResetQuestTemplates
}) => {
  const [activeSection, setActiveSection] = useState('general');
  const [deductXpAmount, setDeductXpAmount] = useState(1);
  const [deductCoinAmount, setDeductCoinAmount] = useState(1);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState('');
  const [showAttendanceHistory, setShowAttendanceHistory] = useState(false);

  // Calculate quest statistics
  const totalActiveQuests = activeQuests.length;
  const completedQuests = activeQuests.filter(quest => quest.completedBy.length > 0).length;
  const totalQuestTemplates = questTemplates.length;
  const customQuestTemplates = questTemplates.filter(qt => qt.id.startsWith('custom-')).length;

  // Calculate attendance statistics
  const attendanceDates = Object.keys(attendanceData);
  const totalAttendanceRecords = attendanceDates.length;
  const recentAttendance = attendanceDates.slice(-7); // Last 7 days

  const getAttendanceStats = () => {
    let totalPresent = 0;
    let totalPossible = 0;
    
    recentAttendance.forEach(date => {
      const dayData = attendanceData[date];
      Object.values(dayData).forEach(status => {
        totalPossible++;
        if (status === 'present') totalPresent++;
      });
    });
    
    return totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
  };

  const handleStudentAction = (actionType) => {
    if (!selectedStudentForAction) {
      alert('Please select a student first.');
      return;
    }

    const student = students.find(s => s.id === selectedStudentForAction);
    if (!student) return;

    switch (actionType) {
      case 'reset':
        setShowConfirmDialog({
          title: 'Reset Student',
          message: `Are you sure you want to reset all progress for ${student.firstName}? This cannot be undone.`,
          confirmText: 'Reset',
          type: 'danger',
          icon: '⚠️',
          onConfirm: () => {
            handleResetStudentPoints(selectedStudentForAction);
            setSelectedStudentForAction('');
          }
        });
        break;
      case 'remove':
        setShowConfirmDialog({
          title: 'Remove Student',
          message: `Are you sure you want to remove ${student.firstName} from the class? This cannot be undone.`,
          confirmText: 'Remove',
          type: 'danger',
          icon: '🗑️',
          onConfirm: () => {
            handleRemoveStudent(selectedStudentForAction);
            setSelectedStudentForAction('');
          }
        });
        break;
      case 'deductXP':
        if (deductXpAmount > 0) {
          handleDeductXP(selectedStudentForAction, deductXpAmount);
          setDeductXpAmount(1);
        }
        break;
      case 'deductCoins':
        if (deductCoinAmount > 0) {
          handleDeductCurrency(selectedStudentForAction, deductCoinAmount);
          setDeductCoinAmount(1);
        }
        break;
    }
  };

  const exportAttendanceData = () => {
    const csvData = [];
    csvData.push(['Date', 'Student', 'Status']);
    
    Object.keys(attendanceData).forEach(date => {
      Object.keys(attendanceData[date]).forEach(studentId => {
        const student = students.find(s => s.id === studentId);
        const status = attendanceData[date][studentId];
        csvData.push([date, student?.firstName || 'Unknown', status]);
      });
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sections = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'quests', name: 'Quest Management', icon: '⚔️' },
    { id: 'attendance', name: 'Attendance', icon: '📅' },
    { id: 'students', name: 'Student Management', icon: '👥' },
    { id: 'data', name: 'Data & Export', icon: '📊' },
    { id: 'feedback', name: 'Feedback & Support', icon: '💬' }
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
        <span className="text-3xl mr-3">⚙️</span>
        Settings & Management
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
            <h3 className="font-bold text-gray-800 mb-4">Settings Menu</h3>
            <nav className="space-y-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-2 ${
                    activeSection === section.id 
                      ? 'bg-blue-100 text-blue-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🏫 Class Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                    <div className="text-sm text-blue-700">Total Students</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{userData?.subscription || 'Basic'}</div>
                    <div className="text-sm text-green-700">Subscription Plan</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💳 Subscription Management</h3>
                <p className="text-gray-600 mb-4">
                  Current Plan: <span className="font-semibold">{userData?.subscription || 'Basic'}</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubscriptionManagement}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Manage Subscription
                  </button>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quest Management */}
          {activeSection === 'quests' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⚔️ Quest System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{totalActiveQuests}</div>
                    <div className="text-sm text-green-700">Active Quests</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{completedQuests}</div>
                    <div className="text-sm text-blue-700">Completed Today</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{totalQuestTemplates}</div>
                    <div className="text-sm text-purple-700">Total Templates</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{customQuestTemplates}</div>
                    <div className="text-sm text-orange-700">Custom Quests</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowQuestManagement(true)}
                    className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">⚔️</span>
                    <span>Manage Active Quests</span>
                  </button>
                  <button
                    onClick={() => setShowQuestManagement(true)}
                    className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">➕</span>
                    <span>Create Custom Quest</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎭 Quest Givers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUEST_GIVERS.map(questGiver => (
                    <div key={questGiver.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={questGiver.image} 
                          alt={questGiver.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-300"
                        />
                        <div>
                          <h4 className="font-bold text-gray-900">{questGiver.name}</h4>
                          <p className="text-sm text-gray-600">{questGiver.role}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Specialty: {questGiver.specialty}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🔧 Quest Template Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleResetQuestTemplates}
                    className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">🔄</span>
                    <span>Reset to Default Templates</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmDialog({
                        title: 'Export Quest Data',
                        message: 'This will download all quest templates and active quest data.',
                        confirmText: 'Export',
                        icon: '📥',
                        onConfirm: () => {
                          const questData = { questTemplates, activeQuests };
                          const dataStr = JSON.stringify(questData, null, 2);
                          const blob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `quest-data-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      });
                    }}
                    className="p-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📥</span>
                    <span>Export Quest Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Management */}
          {activeSection === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Attendance Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{getAttendanceStats()}%</div>
                    <div className="text-sm text-green-700">Attendance Rate (7 days)</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalAttendanceRecords}</div>
                    <div className="text-sm text-blue-700">Days Recorded</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{students.length}</div>
                    <div className="text-sm text-purple-700">Students Tracked</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAttendanceHistory(!showAttendanceHistory)}
                    className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📊</span>
                    <span>{showAttendanceHistory ? 'Hide' : 'Show'} Attendance History</span>
                  </button>
                  <button
                    onClick={exportAttendanceData}
                    className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📥</span>
                    <span>Export Attendance Data</span>
                  </button>
                </div>
              </div>

              {showAttendanceHistory && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Recent Attendance History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Date</th>
                          {students.map(student => (
                            <th key={student.id} className="text-center p-2">{student.firstName}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentAttendance.slice(-10).reverse().map(date => (
                          <tr key={date} className="border-b hover:bg-gray-50">
                            <td className="p-2 font-medium">{date}</td>
                            {students.map(student => {
                              const status = attendanceData[date]?.[student.id] || 'unmarked';
                              const statusIcon = {
                                present: '✅',
                                absent: '❌',
                                late: '⏰',
                                unmarked: '⚪'
                              }[status];
                              return (
                                <td key={student.id} className="text-center p-2">
                                  {statusIcon}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Management */}
          {activeSection === 'students' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">👥 Individual Student Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student</label>
                    <select
                      value={selectedStudentForAction}
                      onChange={(e) => setSelectedStudentForAction(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a student...</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.firstName} - {student.totalPoints || 0} XP
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={deductXpAmount}
                        onChange={(e) => setDeductXpAmount(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="1"
                      />
                      <button
                        onClick={() => handleStudentAction('deductXP')}
                        disabled={!selectedStudentForAction}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-semibold"
                      >
                        Deduct XP
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={deductCoinAmount}
                        onChange={(e) => setDeductCoinAmount(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="1"
                      />
                      <button
                        onClick={() => handleStudentAction('deductCoins')}
                        disabled={!selectedStudentForAction}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors text-sm font-semibold"
                      >
                        Deduct Coins
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <button
                    onClick={() => handleStudentAction('reset')}
                    disabled={!selectedStudentForAction}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Reset Student Progress
                  </button>
                  <button
                    onClick={() => handleStudentAction('remove')}
                    disabled={!selectedStudentForAction}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Remove Student
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🔄 Bulk Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setShowConfirmDialog({
                        title: 'Reset All Students',
                        message: 'Are you sure you want to reset ALL student progress? This cannot be undone.',
                        confirmText: 'Reset All',
                        type: 'danger',
                        icon: '⚠️',
                        onConfirm: handleResetAllPoints
                      });
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Reset All Student Progress
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmDialog({
                        title: 'Reset Pet Speeds',
                        message: 'Reset all pet speeds and race wins? This cannot be undone.',
                        confirmText: 'Reset',
                        icon: '🐾',
                        onConfirm: handleResetPetSpeeds
                      });
                    }}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    Reset All Pet Stats
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Data & Export */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Data Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const classData = {
                        students,
                        activeQuests,
                        questTemplates,
                        attendanceData,
                        exportDate: new Date().toISOString()
                      };
                      const dataStr = JSON.stringify(classData, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `classroom-data-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📥</span>
                    <span>Export All Class Data</span>
                  </button>
                  <button
                    onClick={exportAttendanceData}
                    className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📅</span>
                    <span>Export Attendance CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback & Support */}
          {activeSection === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💬 Feedback & Support</h3>
                <p className="text-gray-600 mb-6">
                  Help us improve Classroom Champions! Your feedback is valuable and helps us create better features.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">🐛</span>
                    <span>Report Bug / Request Feature</span>
                  </button>
                  <button
                    onClick={() => window.open('mailto:support@classroomchampions.com', '_blank')}
                    className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <span className="text-xl">📧</span>
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-blue-800 mb-2">🌟 Feature Requests Welcome!</h4>
                <p className="text-blue-700 text-sm mb-4">
                  We're actively developing new features for Classroom Champions. Let us know what would make your teaching experience even better!
                </p>
                <div className="text-xs text-blue-600">
                  Version: 2.0.0 - Quest System Update
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;