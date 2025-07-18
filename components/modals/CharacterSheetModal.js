// CharacterSheetModal.js - Enhanced with Quest Management Integration
import React, { useState, useEffect } from 'react';

const CharacterSheetModal = ({ 
  student, 
  onClose, 
  QUEST_GIVERS,
  activeQuests,
  availableQuests,
  onCompleteQuest,
  showToast 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuestForCompletion, setSelectedQuestForCompletion] = useState(null);

  if (!student) return null;

  // Calculate coins
  const COINS_PER_XP = 5;
  const xpCoins = Math.floor((student.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student.coins || 0;
  const spentCoins = student.coinsSpent || 0;
  const availableCoins = Math.max(0, xpCoins + bonusCoins - spentCoins);

  // Get student's completed quests
  const completedQuests = activeQuests.filter(quest => 
    quest.completedBy?.includes(student.id)
  );

  // Get today's completed quests
  const today = new Date().toISOString().split('T')[0];
  const todayCompletedQuests = completedQuests.filter(quest => {
    const questDate = quest.createdAt ? quest.createdAt.split('T')[0] : today;
    return questDate === today;
  });

  // Calculate quest stats
  const questStats = {
    totalCompleted: completedQuests.length,
    todayCompleted: todayCompletedQuests.length,
    available: availableQuests?.length || 0,
    completionRate: activeQuests.length > 0 ? Math.round((completedQuests.length / activeQuests.length) * 100) : 0
  };

  const handleCompleteQuest = (quest) => {
    if (quest.completedBy?.includes(student.id)) {
      showToast(`${student.firstName} has already completed this quest!`);
      return;
    }

    onCompleteQuest(quest.id, student.id, quest.reward);
    setSelectedQuestForCompletion(null);
    showToast(`Quest "${quest.title}" completed successfully!`);
  };

  const getRewardDisplay = (reward) => {
    switch (reward.type) {
      case 'xp':
        return `${reward.amount} XP (${reward.category})`;
      case 'coins':
        return `${reward.amount} Coins`;
      case 'item':
        return `Item: ${reward.item}`;
      default:
        return 'Mystery Reward';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      academic: 'from-blue-500 to-blue-600',
      behavior: 'from-green-500 to-green-600',
      responsibility: 'from-purple-500 to-purple-600',
      creative: 'from-pink-500 to-pink-600',
      physical: 'from-orange-500 to-orange-600'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt={`${student.firstName}'s avatar`}
                  className="w-16 h-16 rounded-full border-2 border-white shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-white bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-3xl">👤</span>
                </div>
              )}
              <div>
                <h2 className="text-3xl font-bold">{student.firstName}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                    ⭐ Level {student.avatarLevel || 1}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                    {student.totalPoints || 0} XP
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                    💰 {availableCoins} Coins
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 px-6 py-2">
          <div className="flex space-x-4">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'quests', label: `Quests (${questStats.available})`, icon: '⚔️' },
              { id: 'progress', label: 'Progress', icon: '📈' },
              { id: 'inventory', label: 'Inventory', icon: '🎒' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{student.totalPoints || 0}</div>
                  <div className="text-sm text-blue-700">Total XP</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{availableCoins}</div>
                  <div className="text-sm text-yellow-700">Available Coins</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{questStats.totalCompleted}</div>
                  <div className="text-sm text-green-700">Quests Completed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{questStats.available}</div>
                  <div className="text-sm text-purple-700">Available Quests</div>
                </div>
              </div>

              {/* XP Categories */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">XP Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Respectful', 'Responsible', 'Learner'].map(category => {
                    const categoryXP = student.categoryTotal?.[category] || 0;
                    const weeklyXP = student.categoryWeekly?.[category] || 0;
                    
                    return (
                      <div key={category} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {category === 'Respectful' ? '👍' : 
                             category === 'Responsible' ? '💼' : 
                             '📚'}
                          </span>
                          <h4 className="font-bold text-gray-800">{category}</h4>
                        </div>
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-900">{categoryXP}</div>
                          <div className="text-sm text-gray-600">Total Points</div>
                          <div className="text-sm text-blue-600">+{weeklyXP} this week</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pet Information */}
              {student.pet?.image && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Companion Pet</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={student.pet.image}
                      alt={student.pet.name}
                      className="w-16 h-16 rounded-lg border-2 border-gray-300"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{student.pet.name}</h4>
                      <p className="text-gray-600">Loyal Companion</p>
                      <div className="flex space-x-4 mt-2">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Speed: {student.pet.speed || 5}
                        </span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                          Loyalty: High
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {(student.logs || []).slice(-5).reverse().map((log, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-2xl">
                        {log.type === 'Respectful' ? '👍' : 
                         log.type === 'Responsible' ? '💼' : 
                         log.type === 'Learner' ? '📚' :
                         log.source === 'quest' ? '⚔️' : '⭐'}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {log.source === 'quest' ? 'Quest Completed' : `${log.type} XP Earned`}
                        </div>
                        <div className="text-sm text-gray-600">
                          +{log.amount} {log.type} • {new Date(log.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!student.logs || student.logs.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No recent activity
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <div className="space-y-6">
              {/* Quest Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{questStats.available}</div>
                  <div className="text-sm text-orange-700">Available</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{questStats.todayCompleted}</div>
                  <div className="text-sm text-green-700">Completed Today</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{questStats.totalCompleted}</div>
                  <div className="text-sm text-blue-700">Total Completed</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{questStats.completionRate}%</div>
                  <div className="text-sm text-purple-700">Completion Rate</div>
                </div>
              </div>

              {/* Available Quests */}
              {availableQuests && availableQuests.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Available Quests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableQuests.map(quest => {
                      const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiverId);
                      
                      return (
                        <div
                          key={quest.id}
                          className="bg-white border-2 border-orange-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                        >
                          {/* Quest Header */}
                          <div className={`bg-gradient-to-r ${getCategoryColor(quest.category)} text-white p-4`}>
                            <div className="flex items-start space-x-3">
                              {questGiver && (
                                <img
                                  src={questGiver.image}
                                  alt={questGiver.name}
                                  className="w-10 h-10 rounded-full border-2 border-white"
                                />
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-lg">{quest.title}</h4>
                                <div className="flex items-center space-x-2 text-sm opacity-90">
                                  <span>{quest.icon}</span>
                                  <span>{questGiver?.name || 'Quest Master'}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quest Content */}
                          <div className="p-4 space-y-3">
                            <p className="text-gray-700">{quest.description}</p>

                            {/* Reward Display */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">🏆</span>
                                <div>
                                  <div className="font-semibold text-yellow-800">Reward</div>
                                  <div className="text-yellow-700">{getRewardDisplay(quest.reward)}</div>
                                </div>
                              </div>
                            </div>

                            {/* Due Date */}
                            {quest.dueDate && (
                              <div className="text-sm text-gray-600">
                                📅 Due: {new Date(quest.dueDate).toLocaleDateString()}
                              </div>
                            )}

                            {/* Complete Button */}
                            <button
                              onClick={() => setSelectedQuestForCompletion(quest)}
                              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              Mark as Complete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed Quests */}
              {completedQuests.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Completed Quests</h3>
                  <div className="space-y-3">
                    {completedQuests.slice(-10).reverse().map(quest => {
                      const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiverId);
                      
                      return (
                        <div
                          key={`${quest.id}-completed`}
                          className="bg-green-50 border border-green-200 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3">
                            {questGiver && (
                              <img
                                src={questGiver.image}
                                alt={questGiver.name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span>{quest.icon}</span>
                                <h4 className="font-bold text-green-800">{quest.title}</h4>
                                <span className="text-green-600">✅ Completed</span>
                              </div>
                              <div className="text-sm text-green-700">
                                Reward: {getRewardDisplay(quest.reward)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No Quests State */}
              {(!availableQuests || availableQuests.length === 0) && completedQuests.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚔️</div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">No Quests Available</h3>
                  <p className="text-gray-500">Check back later for new adventures!</p>
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              {/* Level Progress */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Level Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Level</span>
                    <span className="text-2xl font-bold text-blue-600">⭐ {student.avatarLevel || 1}</span>
                  </div>
                  
                  {student.avatarLevel < 4 && (
                    <>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progress to Level {(student.avatarLevel || 1) + 1}</span>
                        <span>{student.totalPoints || 0} / {(student.avatarLevel || 1) * 100} XP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((student.totalPoints || 0) / ((student.avatarLevel || 1) * 100)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                  
                  {student.avatarLevel >= 4 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <span className="text-yellow-800 font-medium">🏆 Maximum Level Reached!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">This Week's Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Respectful', 'Responsible', 'Learner'].map(category => {
                    const weeklyXP = student.categoryWeekly?.[category] || 0;
                    
                    return (
                      <div key={category} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-3xl mb-2">
                          {category === 'Respectful' ? '👍' : 
                           category === 'Responsible' ? '💼' : 
                           '📚'}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{weeklyXP}</div>
                        <div className="text-sm text-gray-600">{category} XP</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Currency Breakdown */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Currency Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{xpCoins}</div>
                    <div className="text-sm text-yellow-700">Coins from XP</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{bonusCoins}</div>
                    <div className="text-sm text-green-700">Bonus Coins</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{spentCoins}</div>
                    <div className="text-sm text-red-700">Coins Spent</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600">{availableCoins}</div>
                  <div className="text-sm text-blue-700">Available to Spend</div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Inventory Items */}
              {student.inventory && student.inventory.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Inventory Items</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {student.inventory.map((item, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎁</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{item.name}</h4>
                            <div className="text-sm text-gray-600">
                              From: {item.source || 'Unknown'}
                            </div>
                            {item.acquired && (
                              <div className="text-xs text-gray-500">
                                {new Date(item.acquired).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎒</div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">Empty Inventory</h3>
                  <p className="text-gray-500">Complete quests and shop purchases to collect items!</p>
                </div>
              )}

              {/* Achievements */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sample achievements based on student progress */}
                  {(student.totalPoints || 0) >= 50 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">🏆</span>
                        <div>
                          <h4 className="font-bold text-yellow-800">First Companion</h4>
                          <p className="text-yellow-700">Earned your first pet companion!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {(student.totalPoints || 0) >= 100 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">⭐</span>
                        <div>
                          <h4 className="font-bold text-blue-800">Level Up!</h4>
                          <p className="text-blue-700">Reached Level 2!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {questStats.totalCompleted >= 5 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">⚔️</span>
                        <div>
                          <h4 className="font-bold text-green-800">Quest Master</h4>
                          <p className="text-green-700">Completed 5 quests!</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {questStats.totalCompleted === 0 && (student.totalPoints || 0) < 50 && (
                    <div className="text-center py-8 text-gray-500 col-span-2">
                      No achievements yet. Keep earning XP and completing quests!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quest Completion Confirmation Modal */}
      {selectedQuestForCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Quest</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800">{selectedQuestForCompletion.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{selectedQuestForCompletion.description}</p>
                  <div className="mt-2 bg-yellow-100 border border-yellow-200 rounded p-2">
                    <span className="text-yellow-800 font-medium">
                      Reward: {getRewardDisplay(selectedQuestForCompletion.reward)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700">
                  Are you sure <strong>{student.firstName}</strong> has completed this quest?
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCompleteQuest(selectedQuestForCompletion)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Complete Quest
                  </button>
                  <button
                    onClick={() => setSelectedQuestForCompletion(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSheetModal;