// components/tools/ClassroomJobs.js - Interactive Classroom Jobs System with Firebase Persistence
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/config';

// ===============================================
// CLASSROOM JOBS COMPONENT WITH FIREBASE
// ===============================================

const ClassroomJobs = ({ 
  students = [], 
  showToast = () => {},
  onAwardXP = () => {},
  user,
  currentClassId
}) => {
  // State management
  const [jobs, setJobs] = useState([
    { 
      id: 'line-leader', 
      title: 'Line Leader', 
      description: 'Lead the class in lines and transitions',
      icon: '👑',
      payment: { xp: 5, coins: 2 },
      assignedTo: null,
      color: 'bg-yellow-500'
    },
    { 
      id: 'door-holder', 
      title: 'Door Holder', 
      description: 'Hold doors open for classmates',
      icon: '🚪',
      payment: { xp: 3, coins: 1 },
      assignedTo: null,
      color: 'bg-blue-500'
    },
    { 
      id: 'board-cleaner', 
      title: 'Board Cleaner', 
      description: 'Keep the whiteboard clean and organized',
      icon: '🧽',
      payment: { xp: 4, coins: 2 },
      assignedTo: null,
      color: 'bg-green-500'
    },
    { 
      id: 'materials-manager', 
      title: 'Materials Manager', 
      description: 'Distribute and collect classroom materials',
      icon: '📚',
      payment: { xp: 6, coins: 3 },
      assignedTo: null,
      color: 'bg-purple-500'
    },
    { 
      id: 'tech-helper', 
      title: 'Tech Helper', 
      description: 'Assist with technology and devices',
      icon: '💻',
      payment: { xp: 7, coins: 3 },
      assignedTo: null,
      color: 'bg-indigo-500'
    },
    { 
      id: 'messenger', 
      title: 'Messenger', 
      description: 'Deliver messages and run errands',
      icon: '📝',
      payment: { xp: 4, coins: 2 },
      assignedTo: null,
      color: 'bg-orange-500'
    },
    { 
      id: 'plant-caretaker', 
      title: 'Plant Caretaker', 
      description: 'Water and care for classroom plants',
      icon: '🌱',
      payment: { xp: 5, coins: 2 },
      assignedTo: null,
      color: 'bg-emerald-500'
    },
    { 
      id: 'librarian', 
      title: 'Librarian', 
      description: 'Organize and maintain classroom library',
      icon: '📖',
      payment: { xp: 6, coins: 3 },
      assignedTo: null,
      color: 'bg-red-500'
    }
  ]);

  const [jobHistory, setJobHistory] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [rotationSettings, setRotationSettings] = useState({
    frequency: 'weekly', // weekly, biweekly, monthly
    autoRotate: true,
    lastRotation: null
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // New job form state
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    icon: '⭐',
    payment: { xp: 5, coins: 2 },
    color: 'bg-blue-500'
  });

  // Available colors and icons for jobs
  const JOB_COLORS = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-orange-500',
    'bg-teal-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-rose-500'
  ];

  const JOB_ICONS = [
    '👑', '🚪', '🧽', '📚', '💻', '📝', '🌱', '📖', '🧹', '📐',
    '🎨', '🎵', '⚽', '🔬', '📊', '🏆', '⭐', '💡', '🔔', '📋'
  ];

  // ===============================================
  // FIREBASE FUNCTIONS
  // ===============================================

  // Load jobs data from Firebase
  const loadJobsFromFirebase = async () => {
    if (!user || !currentClassId) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const jobsData = userData.classroomJobsData?.[currentClassId];
        
        if (jobsData) {
          if (jobsData.jobs) setJobs(jobsData.jobs);
          if (jobsData.jobHistory) setJobHistory(jobsData.jobHistory);
          if (jobsData.rotationSettings) setRotationSettings(jobsData.rotationSettings);
          
          showToast('Classroom jobs loaded successfully!', 'success');
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      showToast('Error loading jobs data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save jobs data to Firebase
  const saveJobsToFirebase = async () => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        const jobsData = {
          jobs,
          jobHistory,
          rotationSettings,
          lastUpdated: new Date().toISOString()
        };

        const updatedData = {
          ...userData,
          classroomJobsData: {
            ...userData.classroomJobsData,
            [currentClassId]: jobsData
          }
        };
        
        await setDoc(docRef, updatedData);
      }
    } catch (error) {
      console.error('Error saving jobs:', error);
      showToast('Error saving jobs data', 'error');
    }
  };

  // Auto-save when jobs data changes
  useEffect(() => {
    if (!loading && user && currentClassId) {
      const timeoutId = setTimeout(() => {
        saveJobsToFirebase();
      }, 1000); // Auto-save 1 second after changes

      return () => clearTimeout(timeoutId);
    }
  }, [jobs, jobHistory, rotationSettings, loading, user, currentClassId]);

  // Load data on component mount
  useEffect(() => {
    loadJobsFromFirebase();
  }, [user, currentClassId]);

  // ===============================================
  // JOB MANAGEMENT FUNCTIONS
  // ===============================================

  // Assign student to job
  const assignStudentToJob = (jobId, studentId) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId 
        ? { ...job, assignedTo: studentId }
        : job
    ));
    
    const student = students.find(s => s.id === studentId);
    const job = jobs.find(j => j.id === jobId);
    
    if (student && job) {
      showToast(`${student.firstName} assigned to ${job.title}!`, 'success');
    }
  };

  // Remove student from job
  const removeStudentFromJob = (jobId) => {
    setJobs(prevJobs => prevJobs.map(job => 
      job.id === jobId 
        ? { ...job, assignedTo: null }
        : job
    ));
    
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      showToast(`Student removed from ${job.title}`, 'success');
    }
  };

  // Pay selected students for their jobs
  const paySelectedStudents = () => {
    let totalPayments = 0;
    
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      const assignedJobs = jobs.filter(job => job.assignedTo === studentId);
      
      assignedJobs.forEach(job => {
        // Award XP through the parent component
        if (onAwardXP && student) {
          onAwardXP(student, job.payment.xp, `${job.title} Job`);
          totalPayments++;
          
          // Add to job history
          const payment = {
            id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            jobId: job.id,
            jobTitle: job.title,
            payment: job.payment,
            date: new Date().toISOString(),
            week: getCurrentWeek()
          };
          
          setJobHistory(prev => [payment, ...prev.slice(0, 99)]); // Keep last 100 payments
        }
      });
    });
    
    setSelectedStudents([]);
    setShowPaymentModal(false);
    
    if (totalPayments > 0) {
      showToast(`Paid ${totalPayments} students for their job performance!`, 'success');
    } else {
      showToast('No jobs found for selected students', 'warning');
    }
  };

  // Auto-rotate jobs based on settings
  const rotateJobs = () => {
    const assignedStudents = jobs.map(job => job.assignedTo).filter(Boolean);
    const availableStudents = students.filter(s => !assignedStudents.includes(s.id));
    
    // Shuffle function
    const shuffle = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    
    const shuffledStudents = shuffle([...students]);
    const shuffledJobs = shuffle([...jobs]);
    
    // Assign students to jobs randomly
    const newJobs = shuffledJobs.map((job, index) => ({
      ...job,
      assignedTo: shuffledStudents[index % shuffledStudents.length]?.id || null
    }));
    
    setJobs(newJobs);
    setRotationSettings(prev => ({
      ...prev,
      lastRotation: new Date().toISOString()
    }));
    
    showToast('Jobs rotated successfully!', 'success');
  };

  // Add new custom job
  const addCustomJob = () => {
    if (!newJob.title.trim()) {
      showToast('Please enter a job title', 'error');
      return;
    }
    
    const job = {
      id: `custom_${Date.now()}`,
      title: newJob.title.trim(),
      description: newJob.description.trim(),
      icon: newJob.icon,
      payment: newJob.payment,
      assignedTo: null,
      color: newJob.color,
      isCustom: true
    };
    
    setJobs(prev => [...prev, job]);
    setNewJob({
      title: '',
      description: '',
      icon: '⭐',
      payment: { xp: 5, coins: 2 },
      color: 'bg-blue-500'
    });
    setShowJobModal(false);
    
    showToast('Custom job added successfully!', 'success');
  };

  // Delete job
  const deleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(prev => prev.filter(job => job.id !== jobId));
      showToast('Job deleted successfully!', 'success');
    }
  };

  // Get current week for history tracking
  const getCurrentWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return startOfWeek.toISOString().split('T')[0];
  };

  // Get student by ID
  const getStudentById = (id) => students.find(s => s.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classroom jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">💼 Classroom Jobs</h2>
            <p className="text-purple-100">Assign responsibilities and reward hard work</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Active Jobs</div>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <div className="text-xs text-purple-200 mt-1">
              💾 Auto-saves to cloud
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setShowJobModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              ➕ Add Job
            </button>
            
            <button
              onClick={rotateJobs}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              🔄 Rotate Jobs
            </button>
            
            <button
              onClick={() => setShowPaymentModal(true)}
              disabled={selectedStudents.length === 0}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💰 Pay Selected ({selectedStudents.length})
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Assigned:</span> {jobs.filter(j => j.assignedTo).length}/{jobs.length}
            </div>
            
            <button
              onClick={saveJobsToFirebase}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              💾 Save Now
            </button>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {jobs.map(job => {
          const assignedStudent = job.assignedTo ? getStudentById(job.assignedTo) : null;
          
          return (
            <div
              key={job.id}
              className={`${job.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer relative`}
            >
              {/* Job Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{job.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm opacity-90">{job.description}</p>
                  </div>
                </div>
                
                {job.isCustom && (
                  <button
                    onClick={() => deleteJob(job.id)}
                    className="text-white hover:text-red-200 opacity-70 hover:opacity-100 transition-all"
                    title="Delete custom job"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Payment:</span>
                  <span className="font-semibold">{job.payment.xp} XP • {job.payment.coins} coins</span>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="space-y-3">
                {assignedStudent ? (
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={`/avatars/${assignedStudent.avatarBase || 'Wizard F'}/Level 1.png`}
                          alt={`${assignedStudent.firstName}'s Avatar`}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          onError={(e) => {
                            e.target.src = '/avatars/Wizard F/Level 1.png';
                          }}
                        />
                        <span className="font-semibold">{assignedStudent.firstName}</span>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(assignedStudent.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(prev => [...prev, assignedStudent.id]);
                            } else {
                              setSelectedStudents(prev => prev.filter(id => id !== assignedStudent.id));
                            }
                          }}
                          className="ml-auto"
                          title="Select for payment"
                        />
                      </div>
                      <button
                        onClick={() => removeStudentFromJob(job.id)}
                        className="text-white hover:text-red-200 text-sm"
                        title="Remove student"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-center text-white text-opacity-70 text-sm py-2">
                      No student assigned
                    </div>
                    <select
                      value=""
                      onChange={(e) => e.target.value && assignStudentToJob(job.id, e.target.value)}
                      className="w-full px-3 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-white border-opacity-30 placeholder-white placeholder-opacity-70"
                    >
                      <option value="" className="text-gray-800">Assign student...</option>
                      {students
                        .filter(student => !jobs.some(j => j.assignedTo === student.id))
                        .map(student => (
                          <option key={student.id} value={student.id} className="text-gray-800">
                            {student.firstName} {student.lastName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Job History */}
      {jobHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">💰 Recent Payments</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {jobHistory.slice(0, 10).map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">{payment.studentName}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{payment.jobTitle}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="font-semibold text-green-600">+{payment.payment.xp} XP</span>
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">➕ Add Custom Job</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Paper Monitor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the job responsibilities..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Payment</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newJob.payment.xp}
                    onChange={(e) => setNewJob({
                      ...newJob, 
                      payment: {...newJob.payment, xp: parseInt(e.target.value) || 1}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coin Payment</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newJob.payment.coins}
                    onChange={(e) => setNewJob({
                      ...newJob, 
                      payment: {...newJob.payment, coins: parseInt(e.target.value) || 1}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewJob({...newJob, icon})}
                      className={`p-2 text-xl rounded-lg border-2 ${
                        newJob.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {JOB_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewJob({...newJob, color})}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newJob.color === color ? 'ring-4 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowJobModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addCustomJob}
                disabled={!newJob.title.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                Add Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">💰 Pay Students</h2>
              <p className="text-yellow-100">Confirm job payments</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Pay the following students for their assigned jobs?
                </p>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedStudents.map(studentId => {
                    const student = getStudentById(studentId);
                    const assignedJobs = jobs.filter(job => job.assignedTo === studentId);
                    
                    return (
                      <div key={studentId} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-semibold">{student?.firstName} {student?.lastName}</div>
                        <div className="text-sm text-gray-600">
                          {assignedJobs.map(job => (
                            <div key={job.id} className="flex justify-between">
                              <span>{job.title}</span>
                              <span className="font-semibold">+{job.payment.xp} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={paySelectedStudents}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                💰 Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomJobs;