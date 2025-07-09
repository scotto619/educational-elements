// TeachersToolkitTab.js - Updated with Student Help Queue Integration
import React, { useState, useEffect } from 'react';
import StudentHelpQueue from '../StudentHelpQueue';

const TeachersToolkitTab = ({ 
  students, 
  setStudents,
  dailyQuests,
  weeklyQuests,
  questTemplates,
  setQuestTemplates,
  generateDailyQuests,
  generateWeeklyQuests,
  setDailyQuests,
  setWeeklyQuests,
  saveQuestDataToFirebase,
  handleAddQuestTemplate,
  handleEditQuestTemplate,
  handleDeleteQuestTemplate,
  handleResetQuestTemplates,
  showToast,
  setSavingData,
  userData
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('help-queue');
  const [showQuestTemplateModal, setShowQuestTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    category: 'individual',
    requirementType: 'xp',
    requirementCategory: 'Respectful',
    requirementAmount: 5,
    rewardType: 'COINS',
    rewardAmount: 1,
    icon: '🎯'
  });

  // Check if user has PRO access
  if (userData?.subscription !== 'pro') {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Teachers Toolkit</h2>
        <p className="text-gray-600 mb-6">
          The Teachers Toolkit is a PRO feature that includes advanced classroom management tools.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <p className="text-yellow-700 font-semibold">🌟 PRO Features Include:</p>
          <ul className="text-yellow-600 text-sm mt-2 space-y-1">
            <li>• Student Help Queue System</li>
            <li>• Custom Quest Templates</li>
            <li>• Advanced Analytics</li>
            <li>• Bulk Operations</li>
            <li>• Priority Support</li>
          </ul>
        </div>
        <button 
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg"
        >
          Upgrade to PRO
        </button>
      </div>
    );
  }

  const handleSaveQuestTemplate = () => {
    const template = {
      title: questForm.title,
      description: questForm.description,
      type: questForm.type,
      category: questForm.category,
      requirement: {
        type: questForm.requirementType,
        category: questForm.requirementCategory,
        amount: questForm.requirementAmount,
        description: questForm.requirementType === 'manual' ? 'Teacher verification required' : undefined
      },
      reward: {
        type: questForm.rewardType,
        amount: questForm.rewardAmount
      },
      icon: questForm.icon
    };

    if (editingTemplate) {
      handleEditQuestTemplate(editingTemplate.id, template);
    } else {
      handleAddQuestTemplate(template);
    }

    setShowQuestTemplateModal(false);
    setEditingTemplate(null);
    setQuestForm({
      title: '',
      description: '',
      type: 'daily',
      category: 'individual',
      requirementType: 'xp',
      requirementCategory: 'Respectful',
      requirementAmount: 5,
      rewardType: 'COINS',
      rewardAmount: 1,
      icon: '🎯'
    });
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setQuestForm({
      title: template.title,
      description: template.description,
      type: template.type,
      category: template.category,
      requirementType: template.requirement.type,
      requirementCategory: template.requirement.category || 'Respectful',
      requirementAmount: template.requirement.amount,
      rewardType: template.reward.type,
      rewardAmount: template.reward.amount,
      icon: template.icon
    });
    setShowQuestTemplateModal(true);
  };

  const handleResetQuests = async () => {
    if (window.confirm('Are you sure you want to reset all quests? This will generate new daily and weekly quests.')) {
      setSavingData(true);
      try {
        const newDailyQuests = await generateDailyQuests();
        const newWeeklyQuests = await generateWeeklyQuests();
        setDailyQuests(newDailyQuests);
        setWeeklyQuests(newWeeklyQuests);
        showToast('Quests reset successfully!');
      } catch (error) {
        console.error('Error resetting quests:', error);
        showToast('Error resetting quests. Please try again.');
      } finally {
        setSavingData(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🛠️ Teachers Toolkit</h2>
        <p className="text-gray-600">Advanced classroom management tools for PRO users</p>
      </div>

      {/* Toolkit Navigation */}
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        {[
          { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
          { id: 'quest-management', label: 'Quest Management', icon: '⚔️' },
          { id: 'analytics', label: 'Analytics', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveToolkitTab(tab.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeToolkitTab === tab.id
                ? "bg-purple-600 text-white shadow-lg transform scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md hover:shadow-lg"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-xl p-6">
        {activeToolkitTab === 'help-queue' && (
          <StudentHelpQueue students={students} showToast={showToast} />
        )}

        {activeToolkitTab === 'quest-management' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">⚔️ Quest Management</h3>
              <p className="text-gray-600">Create and manage custom quest templates</p>
            </div>

            {/* Quest Controls */}
            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setShowQuestTemplateModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Add Quest Template</span>
              </button>
              <button
                onClick={handleResetQuests}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span>🔄</span>
                <span>Reset Quests</span>
              </button>
              <button
                onClick={handleResetQuestTemplates}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg flex items-center space-x-2"
              >
                <span>🔧</span>
                <span>Reset Templates</span>
              </button>
            </div>

            {/* Quest Templates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">Quest Templates</h4>
              
              <div className="grid gap-4">
                {questTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <h5 className="font-bold text-gray-800">{template.title}</h5>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          template.type === 'daily' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {template.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          template.category === 'individual' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Requirement:</span> {template.requirement.type === 'xp' ? `${template.requirement.amount} ${template.requirement.category} XP` : template.requirement.description}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Reward:</span> {template.reward.amount} {template.reward.type === 'COINS' ? 'Coins' : 'XP'}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                      {template.id.startsWith('custom-') && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this quest template?')) {
                              handleDeleteQuestTemplate(template.id);
                            }
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeToolkitTab === 'analytics' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Class Analytics</h3>
              <p className="text-gray-600">Detailed insights into your classroom performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* XP Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">XP Distribution</h4>
                <div className="space-y-2">
                  {['Respectful', 'Responsible', 'Learner'].map(category => {
                    const total = students.reduce((sum, s) => sum + (s.categoryTotal[category] || 0), 0);
                    const max = Math.max(...students.map(s => s.categoryTotal[category] || 0));
                    const percentage = max > 0 ? (total / (max * students.length)) * 100 : 0;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span>{total} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Top Performers</h4>
                <div className="space-y-3">
                  {students
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .slice(0, 5)
                    .map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️'}</span>
                          <span className="font-semibold">{student.firstName}</span>
                        </div>
                        <span className="text-blue-600 font-bold">{student.totalPoints}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Weekly Progress</h4>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {students.reduce((sum, s) => sum + (s.weeklyPoints || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">Total Weekly XP</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round(students.reduce((sum, s) => sum + (s.weeklyPoints || 0), 0) / students.length) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Average per Student</div>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Engagement Metrics</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {students.filter(s => s.pet?.image).length}
                  </div>
                  <div className="text-sm text-blue-700">Students with Pets</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.avatarLevel > 1).length}
                  </div>
                  <div className="text-sm text-green-700">Leveled Up</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {students.reduce((sum, s) => sum + (s.inventory?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-purple-700">Items Purchased</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {students.reduce((sum, s) => sum + (s.coinsSpent || 0), 0)}
                  </div>
                  <div className="text-sm text-orange-700">Coins Spent</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quest Template Modal */}
      {showQuestTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingTemplate ? 'Edit Quest Template' : 'Add Quest Template'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={questForm.title}
                  onChange={(e) => setQuestForm({...questForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quest title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={questForm.description}
                  onChange={(e) => setQuestForm({...questForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Quest description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                  <select
                    value={questForm.type}
                    onChange={(e) => setQuestForm({...questForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={questForm.category}
                    onChange={(e) => setQuestForm({...questForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="individual">Individual</option>
                    <option value="class">Class</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Requirement Type</label>
                <select
                  value={questForm.requirementType}
                  onChange={(e) => setQuestForm({...questForm, requirementType: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="xp">XP Points</option>
                  <option value="total_xp">Total XP</option>
                  <option value="manual">Manual Check</option>
                </select>
              </div>

              {questForm.requirementType === 'xp' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={questForm.requirementCategory}
                      onChange={(e) => setQuestForm({...questForm, requirementCategory: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Respectful">Respectful</option>
                      <option value="Responsible">Responsible</option>
                      <option value="Learner">Learner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={questForm.requirementAmount}
                      onChange={(e) => setQuestForm({...questForm, requirementAmount: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>
                </div>
              )}

              {questForm.requirementType === 'total_xp' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">XP Amount</label>
                  <input
                    type="number"
                    value={questForm.requirementAmount}
                    onChange={(e) => setQuestForm({...questForm, requirementAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                  <select
                    value={questForm.rewardType}
                    onChange={(e) => setQuestForm({...questForm, rewardType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="COINS">Coins</option>
                    <option value="XP">XP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Amount</label>
                  <input
                    type="number"
                    value={questForm.rewardAmount}
                    onChange={(e) => setQuestForm({...questForm, rewardAmount: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={questForm.icon}
                  onChange={(e) => setQuestForm({...questForm, icon: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="🎯"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowQuestTemplateModal(false);
                  setEditingTemplate(null);
                  setQuestForm({
                    title: '',
                    description: '',
                    type: 'daily',
                    category: 'individual',
                    requirementType: 'xp',
                    requirementCategory: 'Respectful',
                    requirementAmount: 5,
                    rewardType: 'COINS',
                    rewardAmount: 1,
                    icon: '🎯'
                  });
                }}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestTemplate}
                disabled={!questForm.title || !questForm.description}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersToolkitTab;