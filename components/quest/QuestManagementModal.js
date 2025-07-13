// components/quest/QuestManagementModal.js - Comprehensive Quest Management Interface
import React, { useState } from 'react';

const QuestManagementModal = ({ 
  isOpen, 
  onClose, 
  questTemplates,
  currentQuests,
  onAddQuest,
  onRemoveQuest,
  onCreateCustomQuest,
  QUEST_GIVERS
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    category: 'academic',
    type: 'manual',
    icon: '📝',
    questGiver: 'guide1',
    reward: { type: 'coins', amount: 3 },
    difficulty: 'easy',
    estimatedTime: '30 minutes'
  });

  if (!isOpen) return null;

  const categories = ['all', 'academic', 'behavior', 'responsibility', 'weekly'];
  const filteredTemplates = selectedCategory === 'all' 
    ? questTemplates 
    : questTemplates.filter(template => template.category === selectedCategory);

  const handleCreateQuest = () => {
    if (!newQuest.title || !newQuest.description) return;
    
    const questToCreate = {
      ...newQuest,
      id: `custom-${Date.now()}`,
      completedBy: [],
      createdAt: new Date().toISOString()
    };
    
    onCreateCustomQuest(questToCreate);
    setShowCreateForm(false);
    setNewQuest({
      title: '',
      description: '',
      category: 'academic',
      type: 'manual',
      icon: '📝',
      questGiver: 'guide1',
      reward: { type: 'coins', amount: 3 },
      difficulty: 'easy',
      estimatedTime: '30 minutes'
    });
  };

  const isQuestActive = (questId) => {
    return currentQuests.some(q => q.id === questId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">⚔️ Quest Management</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!showCreateForm ? (
            <div className="space-y-6">
              {/* Category Filter */}
              <div className="flex space-x-2 mb-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Create Custom Quest Button */}
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors font-semibold"
              >
                + Create Custom Quest
              </button>

              {/* Current Active Quests */}
              {currentQuests.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">🔥 Active Quests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {currentQuests.map(quest => {
                      const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
                      return (
                        <div key={quest.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{quest.icon}</span>
                              <div>
                                <h4 className="font-bold text-green-800">{quest.title}</h4>
                                <p className="text-sm text-green-600 capitalize">{quest.category} • {quest.difficulty}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => onRemoveQuest(quest.id)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-sm text-green-700 mb-2">{quest.description}</p>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-green-600">💰 {quest.reward.amount} coins</span>
                            <span className="text-green-600">✅ {quest.completedBy.length} completed</span>
                          </div>
                          {questGiver && (
                            <div className="flex items-center space-x-2 mt-2">
                              <img 
                                src={questGiver.image} 
                                alt={questGiver.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <span className="text-xs text-green-600">{questGiver.name}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quest Templates */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">📝 Quest Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTemplates.map(template => {
                    const questGiver = QUEST_GIVERS.find(qg => qg.id === template.questGiver);
                    const isActive = isQuestActive(template.id);
                    
                    return (
                      <div key={template.id} className={`border rounded-lg p-4 ${
                        isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:shadow-md'
                      } transition-shadow`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{template.icon}</span>
                            <div>
                              <h4 className="font-bold text-gray-800">{template.title}</h4>
                              <p className="text-sm text-gray-600 capitalize">{template.category} • {template.difficulty}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            template.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {template.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{template.description}</p>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-gray-600">⏱️ {template.estimatedTime}</span>
                          <span className="text-gray-600">💰 {template.reward.amount} coins</span>
                        </div>
                        {questGiver && (
                          <div className="flex items-center space-x-2 mb-3">
                            <img 
                              src={questGiver.image} 
                              alt={questGiver.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs text-gray-600">{questGiver.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => isActive ? onRemoveQuest(template.id) : onAddQuest(template)}
                          className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                            isActive
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isActive ? 'Remove Quest' : 'Add Quest'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Create Custom Quest Form */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">✨ Create Custom Quest</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quest Title</label>
                    <input
                      type="text"
                      value={newQuest.title}
                      onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quest title..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newQuest.description}
                      onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Describe what students need to do..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <input
                      type="text"
                      value={newQuest.icon}
                      onChange={(e) => setNewQuest({...newQuest, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="📝"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={newQuest.category}
                      onChange={(e) => setNewQuest({...newQuest, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="academic">Academic</option>
                      <option value="behavior">Behavior</option>
                      <option value="responsibility">Responsibility</option>
                      <option value="weekly">Weekly Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={newQuest.difficulty}
                      onChange={(e) => setNewQuest({...newQuest, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quest Giver</label>
                    <select
                      value={newQuest.questGiver}
                      onChange={(e) => setNewQuest({...newQuest, questGiver: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium bg-white"
                    >
                      {QUEST_GIVERS.map(giver => (
                        <option key={giver.id} value={giver.id}>{giver.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coin Reward</label>
                    <input
                      type="number"
                      value={newQuest.reward.amount}
                      onChange={(e) => setNewQuest({
                        ...newQuest, 
                        reward: {...newQuest.reward, amount: parseInt(e.target.value) || 0}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                    <input
                      type="text"
                      value={newQuest.estimatedTime}
                      onChange={(e) => setNewQuest({...newQuest, estimatedTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="30 minutes"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateQuest}
                  disabled={!newQuest.title || !newQuest.description}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  Create Quest
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestManagementModal;