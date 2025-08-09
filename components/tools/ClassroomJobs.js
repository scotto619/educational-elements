// components/tools/ClassroomJobs.js - FIXED Version with Compact Layout + Proper Payment
import React, { useState, useEffect } from 'react';

// ===============================================
// CLASSROOM JOBS COMPONENT - FIXED VERSION
// ===============================================

const ClassroomJobs = ({ 
  students = [], 
  showToast = () => {},
  onAwardXP = () => {}, // Function to award XP to students
  onAwardCoins = () => {}, // Function to award coins to students
  saveData = () => {}, // Function to save data to Firebase
  loadedData = {} // Pre-loaded data from Firebase
}) => {
  // State management
  const [jobs, setJobs] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [showPayAllModal, setShowPayAllModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // New job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    maxStudents: 1,
    payType: 'coins', // 'coins' or 'xp'
    payAmount: 5,
    color: 'bg-blue-500',
    icon: '📋'
  });

  // Available job colors and icons
  const JOB_COLORS = [
    { class: 'bg-blue-500', name: 'Blue' },
    { class: 'bg-green-500', name: 'Green' },
    { class: 'bg-purple-500', name: 'Purple' },
    { class: 'bg-red-500', name: 'Red' },
    { class: 'bg-yellow-500', name: 'Yellow' },
    { class: 'bg-indigo-500', name: 'Indigo' },
    { class: 'bg-pink-500', name: 'Pink' },
    { class: 'bg-teal-500', name: 'Teal' }
  ];

  const JOB_ICONS = [
    '📋', '🧹', '📚', '🖥️', '🌱', '📝', '🔧', '📊', '🎨', '⭐', '🔔', '📋', '🗂️', '📐', '🧮', '⚡'
  ];

  // Default classroom jobs
  const DEFAULT_JOBS = [
    { id: 'line-leader', title: 'Line Leader', description: 'Lead the class line', maxStudents: 1, payType: 'xp', payAmount: 3, color: 'bg-blue-500', icon: '👑', assignedStudents: [] },
    { id: 'board-cleaner', title: 'Board Cleaner', description: 'Keep the whiteboard clean', maxStudents: 2, payType: 'coins', payAmount: 5, color: 'bg-green-500', icon: '🧹', assignedStudents: [] },
    { id: 'tech-helper', title: 'Tech Helper', description: 'Assist with technology', maxStudents: 1, payType: 'xp', payAmount: 5, color: 'bg-purple-500', icon: '🖥️', assignedStudents: [] },
    { id: 'librarian', title: 'Class Librarian', description: 'Organize classroom books', maxStudents: 2, payType: 'coins', payAmount: 4, color: 'bg-indigo-500', icon: '📚', assignedStudents: [] },
    { id: 'plant-care', title: 'Plant Caretaker', description: 'Water and care for plants', maxStudents: 1, payType: 'xp', payAmount: 4, color: 'bg-green-500', icon: '🌱', assignedStudents: [] },
    { id: 'supplies', title: 'Supply Manager', description: 'Distribute and collect supplies', maxStudents: 2, payType: 'coins', payAmount: 3, color: 'bg-yellow-500', icon: '📝', assignedStudents: [] }
  ];

  // ===============================================
  // MANUAL SAVE FUNCTION
  // ===============================================
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      await saveData({ classroomJobs: jobs });
      setHasUnsavedChanges(false);
      showToast('Classroom jobs saved successfully!', 'success');
    } catch (error) {
      console.error('❌ Error saving jobs:', error);
      showToast('Error saving jobs. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ===============================================
  // INITIALIZATION
  // ===============================================
  useEffect(() => {
    // Load saved jobs from Firebase or use defaults
    if (loadedData.classroomJobs && loadedData.classroomJobs.length > 0) {
      setJobs(loadedData.classroomJobs);
    } else if (jobs.length === 0) {
      setJobs(DEFAULT_JOBS);
    }
  }, [loadedData]);

  useEffect(() => {
    // Calculate unassigned students
    const assignedStudentIds = jobs.flatMap(job => job.assignedStudents?.map(s => s.id) || []);
    const unassigned = students.filter(student => !assignedStudentIds.includes(student.id));
    setUnassignedStudents(unassigned);
  }, [students, jobs]);

  // ===============================================
  // JOB MANAGEMENT FUNCTIONS
  // ===============================================

  const createJob = () => {
    if (!newJob.title.trim()) {
      return;
    }

    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...newJob,
      title: newJob.title.trim(),
      assignedStudents: []
    };

    const updatedJobs = [...jobs, job];
    setJobs(updatedJobs);
    setHasUnsavedChanges(true);
    setNewJob({
      title: '',
      description: '',
      maxStudents: 1,
      payType: 'coins',
      payAmount: 5,
      color: 'bg-blue-500',
      icon: '📋'
    });
    setShowCreateJobModal(false);
    showToast('Job created! Click "Save Changes" to save.', 'info');
  };

  const updateJob = () => {
    if (!editingJob.title.trim()) {
      return;
    }

    const updatedJobs = jobs.map(job => 
      job.id === editingJob.id ? { ...editingJob, title: editingJob.title.trim() } : job
    );
    setJobs(updatedJobs);
    setHasUnsavedChanges(true);
    setEditingJob(null);
    setShowEditJobModal(false);
    showToast('Job updated! Click "Save Changes" to save.', 'info');
  };

  const deleteJob = (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    setHasUnsavedChanges(true);
    showToast('Job deleted! Click "Save Changes" to save.', 'info');
  };

  // ===============================================
  // DRAG AND DROP FUNCTIONS
  // ===============================================

  const handleDragStart = (e, student, source) => {
    setDraggedStudent(student);
    setDraggedFrom(source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnJob = (e, targetJobId) => {
    e.preventDefault();
    if (!draggedStudent) return;

    const targetJob = jobs.find(job => job.id === targetJobId);
    if (!targetJob) return;

    // Check if job is at capacity
    if (targetJob.assignedStudents.length >= targetJob.maxStudents) {
      showToast('Job is at maximum capacity!', 'error');
      setDraggedStudent(null);
      setDraggedFrom(null);
      return;
    }

    // Single state update for better performance
    setJobs(prevJobs => {
      let updatedJobs = [...prevJobs];

      // Remove student from previous position
      if (draggedFrom && draggedFrom.startsWith('job-')) {
        const sourceJobId = draggedFrom.replace('job-', '');
        updatedJobs = updatedJobs.map(job => {
          if (job.id === sourceJobId) {
            return {
              ...job,
              assignedStudents: job.assignedStudents.filter(s => s.id !== draggedStudent.id)
            };
          }
          return job;
        });
      }

      // Add student to target job
      updatedJobs = updatedJobs.map(job => {
        if (job.id === targetJobId) {
          return {
            ...job,
            assignedStudents: [...job.assignedStudents, draggedStudent]
          };
        }
        return job;
      });

      return updatedJobs;
    });

    setHasUnsavedChanges(true);
    showToast(`${draggedStudent.firstName} assigned to ${targetJob.title}!`, 'success');
    setDraggedStudent(null);
    setDraggedFrom(null);
  };

  const handleDropOnUnassigned = (e) => {
    e.preventDefault();
    if (!draggedStudent || !draggedFrom || !draggedFrom.startsWith('job-')) return;

    const sourceJobId = draggedFrom.replace('job-', '');
    
    // Single state update
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job.id === sourceJobId) {
          return {
            ...job,
            assignedStudents: job.assignedStudents.filter(s => s.id !== draggedStudent.id)
          };
        }
        return job;
      })
    );

    setHasUnsavedChanges(true);
    showToast(`${draggedStudent.firstName} removed from job!`, 'success');
    setDraggedStudent(null);
    setDraggedFrom(null);
  };

  // ===============================================
  // PAYMENT FUNCTIONS - FIXED
  // ===============================================

  const payJob = (job) => {
    if (job.assignedStudents.length === 0) {
      showToast('No students assigned to this job!', 'error');
      return;
    }

    let paymentCount = 0;
    job.assignedStudents.forEach(student => {
      if (job.payType === 'xp') {
        onAwardXP(student.id, job.payAmount, `Job: ${job.title}`);
      } else {
        // FIXED: Use proper coin awarding function instead of XP conversion
        onAwardCoins(student.id, job.payAmount, `Job: ${job.title}`);
      }
      paymentCount++;
    });

    showToast(`Paid ${paymentCount} student(s) for ${job.title}!`, 'success');
  };

  const payAllJobs = () => {
    let totalPayments = 0;
    let totalStudents = 0;
    
    jobs.forEach(job => {
      if (job.assignedStudents.length > 0) {
        job.assignedStudents.forEach(student => {
          if (job.payType === 'xp') {
            onAwardXP(student.id, job.payAmount, `Job: ${job.title}`);
          } else {
            // FIXED: Use proper coin awarding function
            onAwardCoins(student.id, job.payAmount, `Job: ${job.title}`);
          }
          totalStudents++;
        });
        totalPayments++;
      }
    });

    showToast(`Paid all jobs! ${totalStudents} students received payments for ${totalPayments} different jobs.`, 'success');
    setShowPayAllModal(false);
  };

  // ===============================================
  // RENDER FUNCTIONS - COMPACT LAYOUT
  // ===============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">💼 Classroom Jobs</h2>
            <p className="text-blue-100">Assign students to classroom responsibilities and manage payments</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{jobs.reduce((sum, job) => sum + job.assignedStudents.length, 0)}</div>
            <div className="text-blue-100 text-sm">Students Working</div>
            {hasUnsavedChanges && <div className="text-yellow-200 text-xs">Unsaved changes</div>}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            >
              ➕ Create New Job
            </button>
            
            <button
              onClick={() => setShowPayAllModal(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
            >
              💰 Pay All Jobs
            </button>

            <button
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                hasUnsavedChanges 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>💾 Save Changes</>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-600">
            <span className="font-semibold">💡 Tip:</span> Drag students between jobs to reassign them
            {hasUnsavedChanges && <span className="ml-2 text-orange-600 font-semibold">• Click "Save Changes" to save your work</span>}
          </div>
        </div>
      </div>

      {/* Job Management Area - COMPACT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Unassigned Students - More Compact */}
        <div 
          className="bg-white rounded-xl p-3 shadow-lg border-2 border-dashed border-gray-300 h-fit max-h-96 overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={handleDropOnUnassigned}
        >
          <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center">
            <span className="text-lg mr-2">👥</span>
            Available Students ({unassignedStudents.length})
          </h3>
          
          <div className="space-y-2">
            {unassignedStudents.map(student => (
              <div
                key={student.id}
                draggable
                onDragStart={(e) => handleDragStart(e, student, 'unassigned')}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <img 
                  src={`/avatars/${student.avatarBase || 'Wizard F'}/Level ${Math.min(Math.max(Math.floor((student.totalPoints || 0) / 100) + 1, 1), 4)}.png`}
                  alt={`${student.firstName}'s Avatar`}
                  className="w-6 h-6 rounded-full border border-gray-300"
                  onError={(e) => {
                    e.target.src = '/avatars/Wizard F/Level 1.png';
                  }}
                />
                <div>
                  <div className="font-semibold text-xs text-gray-800">{student.firstName}</div>
                  <div className="text-xs text-gray-500">{student.totalPoints || 0} XP</div>
                </div>
              </div>
            ))}
            
            {unassignedStudents.length === 0 && (
              <div className="text-center py-4">
                <div className="text-2xl mb-1">✨</div>
                <p className="text-gray-500 text-xs">All students have jobs!</p>
              </div>
            )}
          </div>
        </div>

        {/* Jobs Grid - MUCH MORE COMPACT */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {jobs.map(job => (
            <div
              key={job.id}
              className={`${job.color} rounded-xl p-3 text-white shadow-lg h-fit`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnJob(e, job.id)}
            >
              {/* Job Header - Compact */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <span className="text-lg">{job.icon}</span>
                    <h3 className="text-sm font-bold truncate">{job.title}</h3>
                  </div>
                  <p className="text-xs opacity-90 mb-1 line-clamp-1">{job.description}</p>
                  <div className="text-xs opacity-75">
                    Max: {job.maxStudents} • Pay: {job.payAmount} {job.payType === 'xp' ? 'XP' : 'coins'}
                  </div>
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => {
                      setEditingJob(job);
                      setShowEditJobModal(true);
                    }}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded text-xs"
                    title="Edit Job"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded text-xs"
                    title="Delete Job"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Assigned Students - Compact */}
              <div className="space-y-1 mb-2">
                {job.assignedStudents.map(student => (
                  <div
                    key={student.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, student, `job-${job.id}`)}
                    className="flex items-center space-x-2 p-1.5 bg-white bg-opacity-20 rounded-lg cursor-move hover:bg-opacity-30 transition-all"
                  >
                    <img 
                      src={`/avatars/${student.avatarBase || 'Wizard F'}/Level ${Math.min(Math.max(Math.floor((student.totalPoints || 0) / 100) + 1, 1), 4)}.png`}
                      alt={`${student.firstName}'s Avatar`}
                      className="w-6 h-6 rounded-full border border-white border-opacity-50"
                      onError={(e) => {
                        e.target.src = '/avatars/Wizard F/Level 1.png';
                      }}
                    />
                    <div>
                      <div className="font-semibold text-xs">{student.firstName}</div>
                      <div className="text-xs opacity-75">{student.totalPoints || 0} XP</div>
                    </div>
                  </div>
                ))}
                
                {/* Empty slots - Compact */}
                {Array.from({ length: job.maxStudents - job.assignedStudents.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="p-2 border border-dashed border-white border-opacity-50 rounded-lg text-center text-xs opacity-75"
                  >
                    Drop student here
                  </div>
                ))}
              </div>

              {/* Pay Button - Compact */}
              <button
                onClick={() => payJob(job)}
                disabled={job.assignedStudents.length === 0}
                className={`w-full py-1.5 px-2 rounded-lg font-semibold text-xs transition-all ${
                  job.assignedStudents.length === 0
                    ? 'bg-white bg-opacity-20 text-white opacity-50 cursor-not-allowed'
                    : 'bg-white bg-opacity-30 hover:bg-opacity-40 text-white'
                }`}
              >
                💰 Pay {job.assignedStudents.length > 0 ? `${job.assignedStudents.length} Student${job.assignedStudents.length !== 1 ? 's' : ''}` : 'Job'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">➕ Create New Job</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Door Holder"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of the job"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newJob.maxStudents}
                    onChange={(e) => setNewJob({...newJob, maxStudents: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <select
                    value={newJob.payType}
                    onChange={(e) => setNewJob({...newJob, payType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="coins">Coins</option>
                    <option value="xp">XP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Amount ({newJob.payType === 'xp' ? 'XP' : 'Coins'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newJob.payAmount}
                  onChange={(e) => setNewJob({...newJob, payAmount: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Color</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_COLORS.map(color => (
                    <button
                      key={color.class}
                      onClick={() => setNewJob({...newJob, color: color.class})}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        newJob.color === color.class ? 'ring-4 ring-gray-400' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Icon</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewJob({...newJob, icon})}
                      className={`p-2 text-xl rounded-lg border-2 ${
                        newJob.icon === icon ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createJob}
                disabled={!newJob.title.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditJobModal && editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">✏️ Edit Job</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) => setEditingJob({...editingJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({...editingJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingJob.maxStudents}
                    onChange={(e) => setEditingJob({...editingJob, maxStudents: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <select
                    value={editingJob.payType}
                    onChange={(e) => setEditingJob({...editingJob, payType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="coins">Coins</option>
                    <option value="xp">XP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay Amount ({editingJob.payType === 'xp' ? 'XP' : 'Coins'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={editingJob.payAmount}
                  onChange={(e) => setEditingJob({...editingJob, payAmount: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Color</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_COLORS.map(color => (
                    <button
                      key={color.class}
                      onClick={() => setEditingJob({...editingJob, color: color.class})}
                      className={`w-8 h-8 rounded-full ${color.class} ${
                        editingJob.color === color.class ? 'ring-4 ring-gray-400' : ''
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Icon</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setEditingJob({...editingJob, icon})}
                      className={`p-2 text-xl rounded-lg border-2 ${
                        editingJob.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowEditJobModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={updateJob}
                disabled={!editingJob.title.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay All Jobs Confirmation Modal */}
      {showPayAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">💰 Pay All Jobs</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-800 mb-4">
                This will pay all students currently assigned to jobs. Are you sure you want to proceed?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Payment Summary:</h4>
                <div className="space-y-1 text-sm">
                  {jobs.filter(job => job.assignedStudents.length > 0).map(job => (
                    <div key={job.id} className="flex justify-between">
                      <span>{job.title}: {job.assignedStudents.length} student(s)</span>
                      <span className="font-semibold">
                        {job.payAmount} {job.payType === 'xp' ? 'XP' : 'coins'} each
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowPayAllModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={payAllJobs}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                💰 Pay All Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomJobs;