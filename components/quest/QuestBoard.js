// components/quest/QuestBoard.js - Interactive Quest Display Board
import React, { useState } from 'react';
import QuestProgressBar from './QuestProgressBar';

const QuestBoard = ({ 
  activeQuests, 
  QUEST_GIVERS, 
  students, 
  onQuestClick, 
  onCompleteQuest,
  compact = false 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('difficulty'); // difficulty, completion, recent

  if (!activeQuests || activeQuests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⚔️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Active Quests</h3>
        <p className="text-gray-600">Start your adventure by adding some quests!</p>
      </div>
    );
  }

  const categories = ['all', 'academic', 'behavior', 'responsibility', 'weekly'];
  
  const filteredQuests = activeQuests.filter(quest => 
    selectedCategory === 'all' || quest.category === selectedCategory
  ).sort((a, b) => {
    switch (sortBy) {
      case 'completion':
        return (b.completedBy?.length || 0) - (a.completedBy?.length || 0);
      case 'recent':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'difficulty':
      default:
        const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    }
  });

  const getQuestGiver = (questGiverId) => {
    return QUEST_GIVERS.find(qg => qg.id === questGiverId);
  };

  const getCompletionStats = (quest) => {
    const completions = quest.completedBy?.length || 0;
    const totalStudents = students.length;
    const percentage = totalStudents > 0 ? Math.round((completions / totalStudents) * 100) : 0;
    return { completions, totalStudents, percentage };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {!compact && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">⚔️ Active Quest Board</h3>
              <p className="text-gray-600">{activeQuests.length} quest{activeQuests.length !== 1 ? 's' : ''} available</p>
            </div>
            
            {/* Controls */}
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="difficulty">Sort by Difficulty</option>
                <option value="completion">Sort by Completion</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map(category => {
              const categoryQuests = activeQuests.filter(quest => quest.category === category);
              const completions = categoryQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0);
              
              return (
                <div key={category} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">
                    {category === 'academic' ? '📚' : 
                     category === 'behavior' ? '🌟' : 
                     category === 'responsibility' ? '👑' : '⚡'}
                  </div>
                  <div className="text-lg font-bold text-gray-800">{categoryQuests.length}</div>
                  <div className="text-sm text-gray-600 capitalize">{category}</div>
                  <div className="text-xs text-green-600 mt-1">{completions} completions</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quest Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredQuests.map(quest => {
          const questGiver = getQuestGiver(quest.questGiver);
          const stats = getCompletionStats(quest);
          
          return (
            <div 
              key={quest.id} 
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300 group"
              onClick={() => onQuestClick && onQuestClick(quest)}
            >
              {/* Quest Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{quest.icon}</span>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {quest.title}
                    </h4>
                    <p className="text-sm text-gray-600 capitalize">{quest.category}</p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(quest.difficulty)}`}>
                  {quest.difficulty}
                </span>
              </div>

              {/* Quest Description */}
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{quest.description}</p>

              {/* Quest Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                  <span className="text-sm text-gray-600">{stats.completions}/{stats.totalStudents}</span>
                </div>
                <QuestProgressBar 
                  completed={stats.completions} 
                  total={stats.totalStudents}
                  showNumbers={false}
                  height="h-3"
                  color={quest.difficulty === 'easy' ? 'green' : quest.difficulty === 'medium' ? 'yellow' : 'red'}
                />
              </div>

              {/* Quest Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">⏱️ Time:</span>
                  <span className="font-medium">{quest.estimatedTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">💰 Reward:</span>
                  <span className="font-medium text-yellow-600">{quest.reward.amount} coins</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">📊 Success Rate:</span>
                  <span className="font-medium text-green-600">{stats.percentage}%</span>
                </div>
              </div>

              {/* Quest Giver */}
              {questGiver && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={questGiver.image} 
                    alt={questGiver.name}
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{questGiver.name}</div>
                    <div className="text-xs text-gray-600">{questGiver.role}</div>
                  </div>
                </div>
              )}

              {/* Quest Actions */}
              <div className="flex gap-2">
                {quest.type === 'manual' && onCompleteQuest && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteQuest(quest.id);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    ✅ Complete
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuestClick && onQuestClick(quest);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  📋 Details
                </button>
              </div>

              {/* Completion Badges */}
              {stats.completions > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Recently completed by:</div>
                  <div className="flex flex-wrap gap-1">
                    {quest.completedBy.slice(0, 5).map(studentId => {
                      const student = students.find(s => s.id === studentId);
                      if (!student) return null;
                      
                      return (
                        <span 
                          key={studentId}
                          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {student.firstName}
                        </span>
                      );
                    })}
                    {quest.completedBy.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{quest.completedBy.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredQuests.length === 0 && activeQuests.length > 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No quests match your filters</h3>
          <p className="text-gray-600">Try adjusting your category or sort options</p>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default QuestBoard;