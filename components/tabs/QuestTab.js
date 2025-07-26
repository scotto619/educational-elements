// components/tabs/QuestsTab.js - Quest Management System
import React, { useState } from 'react';

// ===============================================
// QUEST DATA
// ===============================================

const QUEST_TEMPLATES = [
  {
    id: 1,
    title: 'Complete Math Homework',
    description: 'Submit all math homework assignments this week',
    xpReward: 10,
    coinReward: 5,
    category: 'Academic',
    icon: '📚',
    difficulty: 'Easy'
  },
  {
    id: 2,
    title: 'Help a Classmate',
    description: 'Assist another student with their learning',
    xpReward: 8,
    coinReward: 3,
    category: 'Social',
    icon: '🤝',
    difficulty: 'Easy'
  },
  {
    id: 3,
    title: 'Read 5 Books',
    description: 'Read and report on 5 books this month',
    xpReward: 25,
    coinReward: 15,
    category: 'Academic',
    icon: '📖',
    difficulty: 'Medium'
  },
  {
    id: 4,
    title: 'Clean Up Classroom',
    description: 'Take initiative to tidy up the classroom',
    xpReward: 5,
    coinReward: 2,
    category: 'Responsibility',
    icon: '🧹',
    difficulty: 'Easy'
  },
  {
    id: 5,
    title: 'Perfect Attendance Week',
    description: 'Attend every class this week',
    xpReward: 15,
    coinReward: 8,
    category: 'Dedication',
    icon: '📅',
    difficulty: 'Medium'
  },
  {
    id: 6,
    title: 'Science Project Excellence',
    description: 'Create an outstanding science project',
    xpReward: 30,
    coinReward: 20,
    category: 'Academic',
    icon: '🔬',
    difficulty: 'Hard'
  }
];

const QUEST_GIVERS = [
  {
    id: 1,
    name: 'Professor Owl',
    emoji: '🦉',
    specialty: 'Academic quests and knowledge challenges',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Captain Bear',
    emoji: '🐻',
    specialty: 'Teamwork and social challenges',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 3,
    name: 'Wizard Fox',
    emoji: '🦊',
    specialty: 'Creative and artistic quests',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 4,
    name: 'Guardian Dragon',
    emoji: '🐉',
    specialty: 'Epic challenges and major achievements',
    color: 'from-red-500 to-red-600'
  }
];

// ===============================================
// QUESTS TAB COMPONENT
// ===============================================

const QuestsTab = ({ 
  students = [], 
  updateStudent,
  showToast = () => {} 
}) => {
  const [activeQuests, setActiveQuests] = useState([]);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(QUEST_GIVERS[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Custom quest form
  const [customQuest, setCustomQuest] = useState({
    title: '',
    description: '',
    xpReward: 5,
    coinReward: 2,
    category: 'Academic',
    difficulty: 'Easy'
  });

  // Create a quest from template
  const createQuestFromTemplate = (template) => {
    const newQuest = {
      ...template,
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questGiver: selectedQuestGiver,
      createdAt: new Date().toISOString(),
      completedBy: [],
      isActive: true
    };

    setActiveQuests([...activeQuests, newQuest]);
    showToast(`Quest "${template.title}" created by ${selectedQuestGiver.name}!`, 'success');
  };

  // Create custom quest
  const createCustomQuest = () => {
    if (!customQuest.title.trim() || !customQuest.description.trim()) {
      showToast('Please fill in all quest details!', 'error');
      return;
    }

    const newQuest = {
      ...customQuest,
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questGiver: selectedQuestGiver,
      createdAt: new Date().toISOString(),
      completedBy: [],
      isActive: true,
      icon: '⭐' // Default icon for custom quests
    };

    setActiveQuests([...activeQuests, newQuest]);
    setShowCreateModal(false);
    setCustomQuest({
      title: '',
      description: '',
      xpReward: 5,
      coinReward: 2,
      category: 'Academic',
      difficulty: 'Easy'
    });
    
    showToast(`Custom quest "${newQuest.title}" created!`, 'success');
  };

  // Mark quest as completed for selected students
  const completeQuest = (quest) => {
    if (selectedStudents.length === 0) {
      showToast('Please select students who completed this quest!', 'error');
      return;
    }

    // Update quest completion
    const updatedQuests = activeQuests.map(q => {
      if (q.id === quest.id) {
        const newCompletedBy = [...q.completedBy, ...selectedStudents.map(id => ({
          studentId: id,
          completedAt: new Date().toISOString()
        }))];
        return { ...q, completedBy: newCompletedBy };
      }
      return q;
    });
    setActiveQuests(updatedQuests);

    // Award XP and coins to students
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        const updatedStudent = {
          ...student,
          totalPoints: (student.totalPoints || 0) + quest.xpReward,
          currency: (student.currency || 0) + quest.coinReward,
          questsCompleted: [...(student.questsCompleted || []), {
            questId: quest.id,
            questTitle: quest.title,
            completedAt: new Date().toISOString(),
            xpEarned: quest.xpReward,
            coinsEarned: quest.coinReward
          }]
        };
        updateStudent(updatedStudent);
      }
    });

    setShowCompletionModal(null);
    setSelectedStudents([]);
    showToast(`Quest completed! ${selectedStudents.length} students earned rewards!`, 'success');
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quest Giver Selector */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎭 Choose Your Quest Giver</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUEST_GIVERS.map(giver => (
            <button
              key={giver.id}
              onClick={() => setSelectedQuestGiver(giver)}
              className={`p-4 rounded-xl transition-all border-2 ${
                selectedQuestGiver.id === giver.id
                  ? `border-transparent bg-gradient-to-r ${giver.color} text-white`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-4xl mb-2">{giver.emoji}</div>
              <h4 className="font-bold text-lg">{giver.name}</h4>
              <p className={`text-sm ${selectedQuestGiver.id === giver.id ? 'text-white opacity-90' : 'text-gray-600'}`}>
                {giver.specialty}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quest Creation */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">📜 Create New Quest</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            Create Custom Quest
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUEST_TEMPLATES.map(quest => (
            <div key={quest.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="text-3xl">{quest.icon}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty}
                </span>
              </div>
              
              <h4 className="font-bold text-gray-800 mb-2">{quest.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-3 text-sm">
                  <span className="text-blue-600">⭐ {quest.xpReward} XP</span>
                  <span className="text-yellow-600">🪙 {quest.coinReward}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {quest.category}
                </span>
              </div>
              
              <button
                onClick={() => createQuestFromTemplate(quest)}
                className={`w-full bg-gradient-to-r ${selectedQuestGiver.color} text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold`}
              >
                Create Quest
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Quests */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Active Quests</h3>
        
        {activeQuests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📜</div>
            <h4 className="text-xl font-bold text-gray-600 mb-2">No Active Quests</h4>
            <p className="text-gray-500">Create your first quest to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeQuests.map(quest => (
              <div key={quest.id} className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">{quest.icon}</div>
                    <div className="text-2xl">{quest.questGiver.emoji}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-2">{quest.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                <p className="text-xs text-gray-500 mb-3">Created by {quest.questGiver.name}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-3 text-sm">
                    <span className="text-blue-600">⭐ {quest.xpReward} XP</span>
                    <span className="text-yellow-600">🪙 {quest.coinReward}</span>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">
                    {quest.completedBy.length} completed
                  </span>
                </div>
                
                <button
                  onClick={() => setShowCompletionModal(quest)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Mark as Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Quest Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Create Custom Quest</h2>
              <p className="text-purple-100">By {selectedQuestGiver.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quest Title</label>
                <input
                  type="text"
                  value={customQuest.title}
                  onChange={(e) => setCustomQuest({...customQuest, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter quest title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={customQuest.description}
                  onChange={(e) => setCustomQuest({...customQuest, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Describe what students need to do"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">XP Reward</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customQuest.xpReward}
                    onChange={(e) => setCustomQuest({...customQuest, xpReward: parseInt(e.target.value) || 5})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coin Reward</label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={customQuest.coinReward}
                    onChange={(e) => setCustomQuest({...customQuest, coinReward: parseInt(e.target.value) || 2})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={customQuest.category}
                    onChange={(e) => setCustomQuest({...customQuest, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Social">Social</option>
                    <option value="Creative">Creative</option>
                    <option value="Responsibility">Responsibility</option>
                    <option value="Dedication">Dedication</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={customQuest.difficulty}
                    onChange={(e) => setCustomQuest({...customQuest, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createCustomQuest}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Create Quest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Mark Quest Complete</h2>
              <p className="text-green-100">{showCompletionModal.title}</p>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select students who completed this quest:</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {students.map(student => {
                  const alreadyCompleted = showCompletionModal.completedBy.some(c => c.studentId === student.id);
                  const isSelected = selectedStudents.includes(student.id);
                  
                  return (
                    <button
                      key={student.id}
                      onClick={() => {
                        if (alreadyCompleted) return;
                        setSelectedStudents(prev => 
                          prev.includes(student.id)
                            ? prev.filter(id => id !== student.id)
                            : [...prev, student.id]
                        );
                      }}
                      disabled={alreadyCompleted}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        alreadyCompleted
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-sm">{student.firstName}</p>
                        {alreadyCompleted && (
                          <p className="text-xs text-green-600">✅ Completed</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Quest Rewards:</h4>
                <div className="flex space-x-4">
                  <span className="text-blue-600">⭐ {showCompletionModal.xpReward} XP</span>
                  <span className="text-yellow-600">🪙 {showCompletionModal.coinReward} coins</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {selectedStudents.length} student(s) selected to receive rewards
              </p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowCompletionModal(null);
                  setSelectedStudents([]);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => completeQuest(showCompletionModal)}
                disabled={selectedStudents.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestsTab;