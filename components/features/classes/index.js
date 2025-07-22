// components/features/classes/index.js - Classes Management Components
// These focused components handle creating, editing, and managing multiple classes

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  InputField,
  TextareaField,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useAuth, useToast } from '../../../hooks';
import firebaseService from '../../../config/services/firebaseService';
import { formatDate, formatRelativeTime } from '../../shared/ErrorBoundary';

// ===============================================
// CLASS CARD COMPONENT
// ===============================================

/**
 * Individual class display card
 */
export const ClassCard = ({ 
  classData, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete,
  onDuplicate 
}) => {
  const studentCount = classData.students?.length || 0;
  const lastUpdated = classData.lastUpdated || classData.createdAt;

  return (
    <Card className={`
      cursor-pointer transition-all duration-200 hover:shadow-lg
      ${isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
    `}>
      <div className="space-y-4">
        {/* Class Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onSelect(classData.id)}>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {classData.name}
            </h3>
            {classData.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {classData.description}
              </p>
            )}
          </div>
          
          {isActive && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
              Active
            </span>
          )}
        </div>

        {/* Class Stats */}
        <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-xl font-bold text-blue-600">{studentCount}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-green-600">
              {classData.activeQuests?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Quests</div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-purple-600">
              {classData.students?.reduce((total, student) => 
                total + (student.totalPoints || 0), 0) || 0}
            </div>
            <div className="text-xs text-gray-600">Total XP</div>
          </div>
        </div>

        {/* Class Metadata */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Created: {formatDate(classData.createdAt)}</div>
          <div>Last Updated: {formatRelativeTime(lastUpdated)}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => onSelect(classData.id)}
            className={`flex-1 ${isActive ? 'bg-green-500 hover:bg-green-600' : ''}`}
          >
            {isActive ? '✓ Selected' : 'Select Class'}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(classData)}
            className="px-3"
          >
            ✏️
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDuplicate(classData)}
            className="px-3"
          >
            📋
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDelete(classData.id)}
            className="px-3 text-red-600 hover:bg-red-50"
          >
            🗑️
          </Button>
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// CREATE/EDIT CLASS MODAL
// ===============================================

/**
 * Modal for creating new classes or editing existing ones
 */
export const ClassModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  editingClass = null,
  isLoading = false 
}) => {
  const [classData, setClassData] = useState({
    name: '',
    description: '',
    grade: '',
    subject: '',
    school: '',
    academicYear: new Date().getFullYear()
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or editing class changes
  useEffect(() => {
    if (editingClass) {
      setClassData({
        name: editingClass.name || '',
        description: editingClass.description || '',
        grade: editingClass.grade || '',
        subject: editingClass.subject || '',
        school: editingClass.school || '',
        academicYear: editingClass.academicYear || new Date().getFullYear()
      });
    } else {
      setClassData({
        name: '',
        description: '',
        grade: '',
        subject: '',
        school: '',
        academicYear: new Date().getFullYear()
      });
    }
    setErrors({});
  }, [editingClass, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!classData.name.trim()) {
      newErrors.name = 'Class name is required';
    } else if (classData.name.trim().length < 2) {
      newErrors.name = 'Class name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    onSave({
      ...classData,
      name: classData.name.trim(),
      description: classData.description.trim(),
      grade: classData.grade.trim(),
      subject: classData.subject.trim(),
      school: classData.school.trim()
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingClass ? 'Edit Class' : 'Create New Class'}
      size="md"
    >
      <div className="p-6 space-y-4">
        <InputField
          label="Class Name"
          value={classData.name}
          onChange={(value) => setClassData(prev => ({ ...prev, name: value }))}
          onKeyPress={handleKeyPress}
          placeholder="e.g., 5th Grade Math, Biology 101"
          required
          error={errors.name}
        />

        <TextareaField
          label="Description"
          value={classData.description}
          onChange={(value) => setClassData(prev => ({ ...prev, description: value }))}
          placeholder="Brief description of this class (optional)"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Grade Level"
            value={classData.grade}
            onChange={(value) => setClassData(prev => ({ ...prev, grade: value }))}
            placeholder="e.g., 5th Grade, Year 7"
          />

          <InputField
            label="Subject"
            value={classData.subject}
            onChange={(value) => setClassData(prev => ({ ...prev, subject: value }))}
            placeholder="e.g., Mathematics, Science"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="School"
            value={classData.school}
            onChange={(value) => setClassData(prev => ({ ...prev, school: value }))}
            placeholder="School name (optional)"
          />

          <InputField
            label="Academic Year"
            type="number"
            value={classData.academicYear}
            onChange={(value) => setClassData(prev => ({ ...prev, academicYear: parseInt(value) || new Date().getFullYear() }))}
            min={2020}
            max={2030}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            loading={isLoading}
            disabled={!classData.name.trim()}
          >
            {editingClass ? 'Update Class' : 'Create Class'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ===============================================
// CLASS SEARCH AND FILTER
// ===============================================

/**
 * Search and filter controls for classes
 */
export const ClassSearchFilter = ({ 
  classes,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange 
}) => {
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' },
    { value: 'created', label: 'Recently Created' },
    { value: 'updated', label: 'Recently Updated' },
    { value: 'students', label: 'Most Students' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Classes' },
    { value: 'active', label: 'Has Students' },
    { value: 'empty', label: 'No Students' },
    { value: 'recent', label: 'Updated This Week' }
  ];

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search classes by name, subject, or grade..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-600">
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
          </div>
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// CLASS STATISTICS OVERVIEW
// ===============================================

/**
 * Overview statistics for all classes
 */
export const ClassesOverview = ({ classes, activeClassId }) => {
  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0),
    totalXP: classes.reduce((sum, cls) => 
      sum + (cls.students?.reduce((xp, student) => xp + (student.totalPoints || 0), 0) || 0), 0),
    activeQuests: classes.reduce((sum, cls) => sum + (cls.activeQuests?.length || 0), 0)
  };

  const recentActivity = classes
    .filter(cls => cls.lastUpdated)
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .slice(0, 3);

  return (
    <Card title="Classes Overview">
      <div className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalClasses}</div>
            <div className="text-sm text-blue-700">Total Classes</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalStudents}</div>
            <div className="text-sm text-green-700">Total Students</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.totalXP.toLocaleString()}</div>
            <div className="text-sm text-purple-700">Total XP Earned</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.activeQuests}</div>
            <div className="text-sm text-yellow-700">Active Quests</div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivity.map(cls => (
                <div 
                  key={cls.id}
                  className={`
                    flex items-center justify-between p-2 rounded border
                    ${cls.id === activeClassId ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}
                  `}
                >
                  <div>
                    <span className="font-medium">{cls.name}</span>
                    {cls.id === activeClassId && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatRelativeTime(cls.lastUpdated)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// MAIN CLASSES TAB COMPONENT
// ===============================================

/**
 * Complete Classes management tab using smaller components
 */
export const ClassesTab = ({ userId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeClassId, setActiveClassId] = useState(null);
  
  // Modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, [userId]);

  const loadClasses = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userData = await firebaseService.getUserData(userId);
      if (userData) {
        setClasses(userData.classes || []);
        setActiveClassId(userData.activeClassId);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
      showToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveClasses = async (updatedClasses, newActiveClassId = activeClassId) => {
    try {
      setSaving(true);
      await firebaseService.updateUserData(userId, {
        classes: updatedClasses,
        activeClassId: newActiveClassId
      });
      setClasses(updatedClasses);
      setActiveClassId(newActiveClassId);
    } catch (error) {
      console.error('Error saving classes:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClass = async (classData) => {
    try {
      const newClass = {
        id: `class_${Date.now()}`,
        ...classData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        students: [],
        activeQuests: [],
        questTemplates: [],
        teacherRewards: []
      };

      const updatedClasses = [...classes, newClass];
      await saveClasses(updatedClasses, newClass.id);
      
      setShowClassModal(false);
      setEditingClass(null);
      showToast('Class created successfully!', 'success');
    } catch (error) {
      showToast('Failed to create class', 'error');
    }
  };

  const handleEditClass = async (classData) => {
    try {
      const updatedClasses = classes.map(cls =>
        cls.id === editingClass.id
          ? { ...cls, ...classData, lastUpdated: new Date().toISOString() }
          : cls
      );

      await saveClasses(updatedClasses);
      
      setShowClassModal(false);
      setEditingClass(null);
      showToast('Class updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update class', 'error');
    }
  };

  const handleSelectClass = async (classId) => {
    try {
      await firebaseService.setActiveClass(userId, classId);
      setActiveClassId(classId);
      showToast('Class selected!', 'success');
    } catch (error) {
      showToast('Failed to select class', 'error');
    }
  };

  const handleDuplicateClass = async (originalClass) => {
    try {
      const duplicatedClass = {
        ...originalClass,
        id: `class_${Date.now()}`,
        name: `${originalClass.name} (Copy)`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        students: [], // Don't copy students
        activeQuests: [], // Don't copy active quests
        questTemplates: originalClass.questTemplates || [] // Copy templates
      };

      const updatedClasses = [...classes, duplicatedClass];
      await saveClasses(updatedClasses);
      
      showToast('Class duplicated successfully!', 'success');
    } catch (error) {
      showToast('Failed to duplicate class', 'error');
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      const updatedClasses = classes.filter(cls => cls.id !== classToDelete);
      const newActiveClassId = activeClassId === classToDelete 
        ? (updatedClasses.length > 0 ? updatedClasses[0].id : null)
        : activeClassId;

      await saveClasses(updatedClasses, newActiveClassId);
      
      setShowDeleteDialog(false);
      setClassToDelete(null);
      showToast('Class deleted successfully!', 'success');
    } catch (error) {
      showToast('Failed to delete class', 'error');
    }
  };

  // Filter and sort classes
  const filteredClasses = classes
    .filter(cls => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          cls.name.toLowerCase().includes(searchLower) ||
          cls.subject?.toLowerCase().includes(searchLower) ||
          cls.grade?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter(cls => {
      // Category filter
      switch (filterBy) {
        case 'active':
          return cls.students && cls.students.length > 0;
        case 'empty':
          return !cls.students || cls.students.length === 0;
        case 'recent':
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(cls.lastUpdated || cls.createdAt) > weekAgo;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
          return new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt);
        case 'students':
          return (b.students?.length || 0) - (a.students?.length || 0);
        default: // 'name'
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Classes 🏫</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your classroom adventures
          </p>
        </div>
        
        <Button
          onClick={() => {
            setEditingClass(null);
            setShowClassModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Class</span>
        </Button>
      </div>

      {/* Overview Stats */}
      <ClassesOverview classes={classes} activeClassId={activeClassId} />

      {/* Search and Filter */}
      <ClassSearchFilter
        classes={filteredClasses}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
      />

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(cls => (
            <ClassCard
              key={cls.id}
              classData={cls}
              isActive={cls.id === activeClassId}
              onSelect={handleSelectClass}
              onEdit={(classData) => {
                setEditingClass(classData);
                setShowClassModal(true);
              }}
              onDelete={(classId) => {
                setClassToDelete(classId);
                setShowDeleteDialog(true);
              }}
              onDuplicate={handleDuplicateClass}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏫"
          title={searchTerm || filterBy !== 'all' ? 'No classes found' : 'No classes yet'}
          description={
            searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first class to start your classroom adventure!'
          }
          action={
            !searchTerm && filterBy === 'all' ? (
              <Button 
                onClick={() => {
                  setEditingClass(null);
                  setShowClassModal(true);
                }}
              >
                Create First Class
              </Button>
            ) : null
          }
        />
      )}

      {/* Create/Edit Class Modal */}
      <ClassModal
        isOpen={showClassModal}
        onClose={() => {
          setShowClassModal(false);
          setEditingClass(null);
        }}
        onSave={editingClass ? handleEditClass : handleCreateClass}
        editingClass={editingClass}
        isLoading={saving}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Class"
        message="Are you sure you want to delete this class? This will permanently remove all students, quests, and progress data. This action cannot be undone."
        confirmText="Delete Class"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleDeleteClass}
        onCancel={() => {
          setShowDeleteDialog(false);
          setClassToDelete(null);
        }}
      />
    </div>
  );
};
export { ClassesTab };