// components/features/quests/index.js - Quest Management Components
// These focused components handle specific quest-related functionality

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  IconButton, 
  Card, 
  Modal,
  InputField,
  SelectField,
  TextareaField,
  XPBadge,
  CoinDisplay,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useQuests, useModals, useStudents } from '../../../hooks';
import { QUEST_GIVERS, GAME_CONFIG } from '../../../config/gameData';
import questService from '../../../config/services/questService';

// ===============================================
// QUEST GIVER COMPONENT
// ===============================================

/**
 * Quest Giver Display with Personality
 */
export const QuestGiver = ({ 
  questGiver, 
  isSelected = false, 
  onClick,
  showGreeting = false,
  showTip = false 
}) => {
  const [currentGreeting, setCurrentGreeting] = useState('');
  const [currentTip, setCurrentTip] = useState('');

  React.useEffect(() => {
    if (showGreeting && questGiver) {
      setCurrentGreeting(questService.getRandomGreeting(questGiver.id));
    }
    if (showTip && questGiver) {
      setCurrentTip(questService.getRandomTip(questGiver.id));
    }
  }, [questGiver, showGreeting, showTip]);

  if (!questGiver) return null;

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
      `}
      onClick={onClick}
    >
      <div className="text-center space-y-3">
        {/* Quest Giver Image */}
        <div className="relative inline-block">
          <img
            src={questGiver.imagePath || questGiver.image}
            alt={questGiver.name}
            className="w-20 h-20 rounded-full border-4 border-purple-200"
            onError={(e) => {
              e.target.src = '/Guides/Guide 1.png'; // Fallback
            }}
          />
          
          {/* Role Badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {questGiver.specialty || 'Guide'}
            </div>
          </div>
        </div>

        {/* Quest Giver Info */}
        <div>
          <h3 className="font-bold text-gray-800">{questGiver.name}</h3>
          <p className="text-sm text-gray-600">{questGiver.role}</p>
        </div>

        {/* Greeting */}
        {showGreeting && currentGreeting && (
          <div className="bg-purple-100 text-purple-800 p-3 rounded-lg text-sm italic">
            "{currentGreeting}"
          </div>
        )}

        {/* Tip */}
        {showTip && currentTip && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg text-sm">
            {currentTip}
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// QUEST CARD COMPONENT
// ===============================================

/**
 * Individual Quest Card
 */
export const QuestCard = ({ 
  quest, 
  students = [],
  onComplete,
  onEdit,
  onDelete,
  onMarkAsStarted,
  canEdit = true
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiverId);
  const completionCount = quest.completedBy?.length || 0;
  const isExpired = questService.isQuestExpired(quest);
  const timeLeft = new Date(quest.expiresAt) - new Date();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  const availableStudents = students.filter(student => 
    !quest.completedBy?.some(completion => completion.studentId === student.id)
  );

  const handleComplete = async () => {
    if (!selectedStudent) return;
    
    setIsCompleting(true);
    try {
      const student = students.find(s => s.id === selectedStudent);
      await onComplete(quest.id, student);
      setSelectedStudent('');
      setShowDetails(false);
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <Card className={`
      ${isExpired ? 'bg-red-50 border-red-200' : 'bg-white'}
      ${quest.isClassQuest ? 'border-l-4 border-l-blue-500' : ''}
    `}>
      <div className="space-y-4">
        {/* Quest Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-gray-800">{quest.title}</h3>
              {quest.isClassQuest && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                  CLASS
                </span>
              )}
              {isExpired && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                  EXPIRED
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm line-clamp-2">{quest.description}</p>
          </div>

          {canEdit && (
            <div className="flex items-center space-x-1">
              <IconButton
                icon="✏️"
                onClick={() => onEdit?.(quest)}
                size="sm"
                tooltip="Edit Quest"
              />
              <IconButton
                icon="🗑️"
                onClick={() => onDelete?.(quest.id)}
                size="sm"
                variant="ghost"
                tooltip="Delete Quest"
              />
            </div>
          )}
        </div>

        {/* Quest Giver */}
        {questGiver && (
          <div className="flex items-center space-x-3">
            <img
              src={questGiver.imagePath || questGiver.image}
              alt={questGiver.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.target.src = '/Guides/Guide 1.png';
              }}
            />
            <div>
              <div className="text-sm font-medium text-gray-800">{questGiver.name}</div>
              <div className="text-xs text-gray-600">{questGiver.role}</div>
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center space-x-4">
          {quest.xpReward > 0 && (
            <XPBadge amount={quest.xpReward} category={quest.category} />
          )}
          {quest.coinReward > 0 && (
            <CoinDisplay amount={quest.coinReward} size="sm" />
          )}
        </div>

        {/* Quest Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Completed by {completionCount} student{completionCount !== 1 ? 's' : ''}
          </div>
          <div>
            {isExpired ? 'Expired' : `${hoursLeft}h left`}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          
          {!isExpired && availableStudents.length > 0 && (
            <Button
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              Mark Complete
            </Button>
          )}
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            {/* Completion Form */}
            {!isExpired && availableStudents.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">Mark as Complete</h4>
                
                <SelectField
                  label="Select Student"
                  value={selectedStudent}
                  onChange={setSelectedStudent}
                  options={availableStudents.map(student => ({
                    value: student.id,
                    label: `${student.firstName} ${student.lastName}`
                  }))}
                  placeholder="Choose a student..."
                />
                
                <Button
                  onClick={handleComplete}
                  disabled={!selectedStudent}
                  loading={isCompleting}
                  size="sm"
                >
                  Complete Quest
                </Button>
              </div>
            )}

            {/* Completion History */}
            {quest.completedBy?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Completion History</h4>
                <div className="space-y-2">
                  {quest.completedBy.map((completion, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <span className="text-sm font-medium">{completion.studentName}</span>
                      <span className="text-xs text-gray-600">
                        {new Date(completion.completedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// CREATE QUEST MODAL COMPONENT
// ===============================================

/**
 * Modal for Creating New Quests
 */
export const CreateQuestModal = ({ 
  isOpen, 
  onClose, 
  onCreateQuest,
  students = [],
  templates = []
}) => {
  const [questData, setQuestData] = useState({
    title: '',
    description: '',
    xpReward: 5,
    coinReward: 0,
    category: 'Learner',
    questGiverId: 'guide1',
    duration: 24,
    isClassQuest: false,
    targetStudents: [],
    difficulty: 'easy'
  });
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedQuestGiver = QUEST_GIVERS.find(qg => qg.id === questData.questGiverId);

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setQuestData({
        ...questData,
        title: template.title,
        description: template.description,
        xpReward: template.xpReward,
        coinReward: template.coinReward,
        category: template.category,
        questGiverId: template.questGiverId,
        duration: template.duration,
        difficulty: template.difficulty
      });
    }
  };

  const handleSubmit = async () => {
    if (!questData.title.trim() || !questData.description.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      await onCreateQuest(questData);
      onClose();
      // Reset form
      setQuestData({
        title: '',
        description: '',
        xpReward: 5,
        coinReward: 0,
        category: 'Learner',
        questGiverId: 'guide1',
        duration: 24,
        isClassQuest: false,
        targetStudents: [],
        difficulty: 'easy'
      });
    } catch (error) {
      console.error('Error creating quest:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Quest"
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Template Selection */}
        {templates.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useTemplate"
                checked={useTemplate}
                onChange={(e) => setUseTemplate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="useTemplate" className="text-sm font-medium text-gray-700">
                Use Quest Template
              </label>
            </div>

            {useTemplate && (
              <SelectField
                label="Choose Template"
                value={selectedTemplate}
                onChange={(templateId) => {
                  setSelectedTemplate(templateId);
                  handleTemplateSelect(templateId);
                }}
                options={templates.map(template => ({
                  value: template.id,
                  label: template.title
                }))}
                placeholder="Select a template..."
              />
            )}
          </div>
        )}

        {/* Quest Giver Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Quest Giver
          </label>
          <div className="grid grid-cols-3 gap-3">
            {QUEST_GIVERS.slice(0, 6).map(giver => (
              <QuestGiver
                key={giver.id}
                questGiver={giver}
                isSelected={questData.questGiverId === giver.id}
                onClick={() => setQuestData(prev => ({ ...prev, questGiverId: giver.id }))}
              />
            ))}
          </div>
        </div>

        {/* Basic Quest Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Quest Title"
            value={questData.title}
            onChange={(value) => setQuestData(prev => ({ ...prev, title: value }))}
            placeholder="Enter quest title..."
            required
          />

          <SelectField
            label="Difficulty"
            value={questData.difficulty}
            onChange={(value) => setQuestData(prev => ({ ...prev, difficulty: value }))}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' }
            ]}
          />
        </div>

        <TextareaField
          label="Quest Description"
          value={questData.description}
          onChange={(value) => setQuestData(prev => ({ ...prev, description: value }))}
          placeholder="Describe what students need to do..."
          rows={3}
          required
        />

        {/* Rewards */}
        <div className="grid grid-cols-3 gap-4">
          <InputField
            label="XP Reward"
            type="number"
            value={questData.xpReward}
            onChange={(value) => setQuestData(prev => ({ ...prev, xpReward: parseInt(value) || 0 }))}
            placeholder="5"
            required
          />

          <InputField
            label="Coin Reward"
            type="number"
            value={questData.coinReward}
            onChange={(value) => setQuestData(prev => ({ ...prev, coinReward: parseInt(value) || 0 }))}
            placeholder="0"
          />

          <SelectField
            label="XP Category"
            value={questData.category}
            onChange={(value) => setQuestData(prev => ({ ...prev, category: value }))}
            options={GAME_CONFIG.XP_CATEGORIES.map(cat => ({
              value: cat,
              label: cat
            }))}
          />
        </div>

        {/* Duration and Targeting */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Duration (hours)"
            type="number"
            value={questData.duration}
            onChange={(value) => setQuestData(prev => ({ ...prev, duration: parseInt(value) || 24 }))}
            placeholder="24"
          />

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isClassQuest"
                checked={questData.isClassQuest}
                onChange={(e) => setQuestData(prev => ({ ...prev, isClassQuest: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isClassQuest" className="text-sm font-medium text-gray-700">
                Class Quest (all students)
              </label>
            </div>
          </div>
        </div>

        {/* Selected Quest Giver Preview */}
        {selectedQuestGiver && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={selectedQuestGiver.imagePath || selectedQuestGiver.image}
                alt={selectedQuestGiver.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-semibold text-purple-800">{selectedQuestGiver.name}</div>
                <div className="text-sm text-purple-600">{selectedQuestGiver.role}</div>
                <div className="text-sm text-purple-600 italic">
                  "{questService.getRandomGreeting(selectedQuestGiver.id)}"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isCreating}
            disabled={!questData.title.trim() || !questData.description.trim()}
          >
            Create Quest
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ===============================================
// QUEST FILTER COMPONENT
// ===============================================

/**
 * Quest Search and Filter Controls
 */
export const QuestFilter = ({
  quests,
  searchTerm,
  onSearchChange,
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  showExpired,
  onToggleExpired
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Quests' },
    { value: 'active', label: 'Active Only' },
    { value: 'completed', label: 'Has Completions' },
    { value: 'class', label: 'Class Quests' },
    { value: 'individual', label: 'Individual Quests' },
    ...QUEST_GIVERS.map(giver => ({
      value: `giver_${giver.id}`,
      label: `By ${giver.name}`
    }))
  ];

  const sortOptions = [
    { value: 'created', label: 'Newest First' },
    { value: 'expires', label: 'Expires Soon' },
    { value: 'completions', label: 'Most Completed' },
    { value: 'title', label: 'Title A-Z' }
  ];

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search quests by title or description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <SelectField
            label="Filter"
            value={filterBy}
            onChange={onFilterChange}
            options={filterOptions}
            className="min-w-40"
          />

          <SelectField
            label="Sort"
            value={sortBy}
            onChange={onSortChange}
            options={sortOptions}
            className="min-w-40"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showExpired"
              checked={showExpired}
              onChange={(e) => onToggleExpired(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="showExpired" className="text-sm font-medium text-gray-700">
              Show Expired
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// MAIN QUESTS TAB COMPONENT
// ===============================================

/**
 * Complete Quests Tab using smaller components
 */
export const QuestsTab = ({ userId, classId }) => {
  const { activeQuests, questTemplates, loading, createQuest, completeQuest } = useQuests(userId, classId);
  const { students } = useStudents(userId, classId);
  const { modals, openModal, closeModal } = useModals();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [showExpired, setShowExpired] = useState(false);

  // Filter and sort quests
  const filteredQuests = useMemo(() => {
    let filtered = [...activeQuests];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'active':
        filtered = filtered.filter(quest => 
          quest.status === 'active' && !questService.isQuestExpired(quest)
        );
        break;
      case 'completed':
        filtered = filtered.filter(quest => quest.completedBy?.length > 0);
        break;
      case 'class':
        filtered = filtered.filter(quest => quest.isClassQuest);
        break;
      case 'individual':
        filtered = filtered.filter(quest => !quest.isClassQuest);
        break;
      default:
        if (filterBy.startsWith('giver_')) {
          const giverId = filterBy.replace('giver_', '');
          filtered = filtered.filter(quest => quest.questGiverId === giverId);
        }
    }

    // Filter expired quests
    if (!showExpired) {
      filtered = filtered.filter(quest => !questService.isQuestExpired(quest));
    }

    // Apply sorting
    switch (sortBy) {
      case 'created':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'expires':
        filtered.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
        break;
      case 'completions':
        filtered.sort((a, b) => (b.completedBy?.length || 0) - (a.completedBy?.length || 0));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return filtered;
  }, [activeQuests, searchTerm, filterBy, sortBy, showExpired]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quest Management</h2>
          <p className="text-gray-600">Create and manage quests for your students</p>
        </div>
        
        <Button
          onClick={() => openModal('createQuest')}
          className="flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Quest</span>
        </Button>
      </div>

      {/* Quest Filter */}
      <QuestFilter
        quests={activeQuests}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showExpired={showExpired}
        onToggleExpired={setShowExpired}
      />

      {/* Quest Grid */}
      {filteredQuests.length > 0 ? (
        <div className="grid gap-6">
          {filteredQuests.map(quest => (
            <QuestCard
              key={quest.id}
              quest={quest}
              students={students}
              onComplete={completeQuest}
              onEdit={(quest) => openModal('editQuest', quest)}
              onDelete={(questId) => {
                // Handle delete with confirmation
                console.log('Delete quest:', questId);
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📜"
          title="No quests found"
          description="Create your first quest to start engaging your students!"
          action={
            <Button onClick={() => openModal('createQuest')}>
              Create First Quest
            </Button>
          }
        />
      )}

      {/* Create Quest Modal */}
      <CreateQuestModal
        isOpen={modals.createQuest}
        onClose={() => closeModal('createQuest')}
        onCreateQuest={createQuest}
        students={students}
        templates={questTemplates}
      />
    </div>
  );
};

// Export all components
export { QuestsTab };