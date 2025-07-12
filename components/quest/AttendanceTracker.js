// components/quest/AttendanceTracker.js - Comprehensive Attendance Management System
import React, { useState } from 'react';

const AttendanceTracker = ({ 
  students, 
  onMarkAttendance, 
  attendanceData, 
  currentDate,
  showToast 
}) => {
  const [selectedDate, setSelectedDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, calendar
  const [sortBy, setSortBy] = useState('name'); // name, status
  const [filterBy, setFilterBy] = useState('all'); // all, present, absent, late, unmarked

  const getAttendanceForDate = (studentId, date) => {
    return attendanceData?.[date]?.[studentId] || 'unmarked';
  };

  const markAttendance = (studentId, status) => {
    onMarkAttendance(studentId, selectedDate, status);
    const student = students.find(s => s.id === studentId);
    if (showToast) {
      showToast(`${student?.firstName} marked as ${status} for ${selectedDate}`);
    }
  };

  // Calculate statistics for selected date
  const getDayStats = () => {
    const dayData = attendanceData[selectedDate] || {};
    const present = Object.values(dayData).filter(status => status === 'present').length;
    const absent = Object.values(dayData).filter(status => status === 'absent').length;
    const late = Object.values(dayData).filter(status => status === 'late').length;
    const unmarked = students.length - present - absent - late;
    const attendanceRate = students.length > 0 ? Math.round((present / students.length) * 100) : 0;

    return { present, absent, late, unmarked, attendanceRate };
  };

  // Get recent attendance history
  const getRecentHistory = (days = 7) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates.map(date => {
      const dayData = attendanceData[date] || {};
      const present = Object.values(dayData).filter(status => status === 'present').length;
      const rate = students.length > 0 ? Math.round((present / students.length) * 100) : 0;
      return { date, present, rate };
    }).reverse();
  };

  // Filter and sort students
  const filteredStudents = students.filter(student => {
    if (filterBy === 'all') return true;
    const status = getAttendanceForDate(student.id, selectedDate);
    return status === filterBy;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.firstName.localeCompare(b.firstName);
    } else if (sortBy === 'status') {
      const statusA = getAttendanceForDate(a.id, selectedDate);
      const statusB = getAttendanceForDate(b.id, selectedDate);
      return statusA.localeCompare(statusB);
    }
    return 0;
  });

  const dayStats = getDayStats();
  const recentHistory = getRecentHistory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">📅 Attendance Tracker</h3>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{dayStats.present}</div>
          <div className="text-sm text-green-700">Present</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{dayStats.absent}</div>
          <div className="text-sm text-red-700">Absent</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{dayStats.late}</div>
          <div className="text-sm text-yellow-700">Late</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{dayStats.unmarked}</div>
          <div className="text-sm text-gray-700">Unmarked</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{dayStats.attendanceRate}%</div>
          <div className="text-sm text-blue-700">Rate</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">View:</label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Students</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="unmarked">Unmarked</option>
          </select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            students.forEach(student => markAttendance(student.id, 'present'));
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Mark All Present
        </button>
        <button
          onClick={() => {
            students.forEach(student => markAttendance(student.id, 'absent'));
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Mark All Absent
        </button>
        <button
          onClick={() => {
            students.forEach(student => {
              const currentStatus = getAttendanceForDate(student.id, selectedDate);
              if (currentStatus !== 'unmarked') {
                onMarkAttendance(student.id, selectedDate, 'unmarked');
              }
            });
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Student Attendance Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => {
            const attendance = getAttendanceForDate(student.id, selectedDate);
            
            return (
              <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={student.avatar || '/avatars/default.png'} 
                    alt={student.firstName}
                    className="w-12 h-12 rounded-full border-2 border-gray-300"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{student.firstName}</h4>
                    <p className="text-sm text-gray-600">
                      Current: <span className={`font-medium ${
                        attendance === 'present' ? 'text-green-600' :
                        attendance === 'absent' ? 'text-red-600' :
                        attendance === 'late' ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {attendance === 'unmarked' ? 'Not Marked' : attendance.charAt(0).toUpperCase() + attendance.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => markAttendance(student.id, 'present')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      attendance === 'present'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-green-200'
                    }`}
                  >
                    ✅ Present
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'absent')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      attendance === 'absent'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-red-200'
                    }`}
                  >
                    ❌ Absent
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'late')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      attendance === 'late'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
                    }`}
                  >
                    ⏰ Late
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const attendance = getAttendanceForDate(student.id, selectedDate);
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={student.avatar || '/avatars/default.png'} 
                          alt={student.firstName}
                          className="w-10 h-10 rounded-full border-2 border-gray-300 mr-3"
                        />
                        <span className="font-medium text-gray-800">{student.firstName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attendance === 'present' ? 'bg-green-100 text-green-800' :
                        attendance === 'absent' ? 'bg-red-100 text-red-800' :
                        attendance === 'late' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {attendance === 'unmarked' ? 'Not Marked' : attendance.charAt(0).toUpperCase() + attendance.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(student.id, 'present')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            attendance === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-200'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            attendance === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-200'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'late')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            attendance === 'late'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-yellow-200'
                          }`}
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-bold text-gray-800 mb-4">📊 Recent Attendance History</h4>
        <div className="grid grid-cols-7 gap-2">
          {recentHistory.map(({ date, present, rate }) => (
            <div key={date} className="text-center">
              <div className="text-xs text-gray-600 mb-1">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className={`w-full h-8 rounded flex items-center justify-center text-xs font-bold text-white ${
                rate >= 90 ? 'bg-green-500' :
                rate >= 75 ? 'bg-yellow-500' :
                rate >= 50 ? 'bg-orange-500' :
                'bg-red-500'
              }`}>
                {rate}%
              </div>
              <div className="text-xs text-gray-600 mt-1">{present}/{students.length}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;