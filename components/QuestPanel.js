// QuestPanel.js - FIXED VERSION with Proper Quest Display
import React from 'react';

const QuestPanel = ({ 
  dailyQuests, 
  weeklyQuests, 
  students, 
  checkQuestCompletion, 
  markQuestComplete 
}) => {
  console.log('QuestPanel render:', { dailyQuests, weeklyQuests }); // Debug log

  return (
    <div className="space-y-6">
      {/* Daily Quests */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Daily Quests
          </h3>
          <div className="text-sm text-gray-500">
            Reset in 7h 7m
          </div>
        </div>

        <div className="space-y-3">
          {dailyQuests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-500 italic">No daily quests available</p>
            </div>
          ) : (
            dailyQuests.map((quest) => {
              // Calculate completion status
              let completionText = '';
              let isCompleted = false;
              
              if (quest.category === 'individual') {
                const completedCount = students.filter(student => 
                  checkQuestCompletion(quest.id, student.id)
                ).length;
                completionText = `${completedCount}/${students.length}`;
                isCompleted = completedCount === students.length;
              } else {
                isCompleted = checkQuestCompletion(quest.id);
                completionText = isCompleted ? 'Complete' : 'In Progress';
              }

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{quest.icon}</span>
                        <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                      
                      {/* Reward Display */}
                      <div className="flex items-center space-x-2">
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                          {quest.reward.type} +{quest.reward.amount}
                        </div>
                        <span className="text-xs text-gray-500">
                          {quest.category === 'individual' ? 'Individual' : 'Class'} Quest
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {quest.category === 'individual' ? '👤' : '🏫'}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {completionText}
                        </span>
                      </div>
                      
                      {/* Manual completion button for manual quests */}
                      {quest.requirement.type === 'manual' && !isCompleted && (
                        <button
                          onClick={() => markQuestComplete(quest.id, quest.category === 'individual' ? 'manual' : null)}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          ✓ Mark Complete
                        </button>
                      )}
                      
                      {isCompleted && (
                        <div className="text-xs text-green-600 font-bold flex items-center">
                          <span className="mr-1">✓</span>
                          Complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Weekly Quests */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">🏆</span>
            Weekly Quests
          </h3>
          <div className="text-sm text-gray-500">
            Reset in 3 days
          </div>
        </div>

        <div className="space-y-3">
          {weeklyQuests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-gray-500 italic">No weekly quests available</p>
            </div>
          ) : (
            weeklyQuests.map((quest) => {
              // Calculate completion status
              let completionText = '';
              let isCompleted = false;
              
              if (quest.category === 'individual') {
                const completedCount = students.filter(student => 
                  checkQuestCompletion(quest.id, student.id)
                ).length;
                completionText = `${completedCount}/${students.length}`;
                isCompleted = completedCount === students.length;
              } else {
                isCompleted = checkQuestCompletion(quest.id);
                completionText = isCompleted ? 'Complete' : 'In Progress';
              }

              return (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{quest.icon}</span>
                        <h4 className="font-semibold text-gray-800">{quest.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                      
                      {/* Reward Display */}
                      <div className="flex items-center space-x-2">
                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                          {quest.reward.type} +{quest.reward.amount}
                        </div>
                        <span className="text-xs text-gray-500">
                          {quest.category === 'individual' ? 'Individual' : 'Class'} Quest
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {quest.category === 'individual' ? '👤' : '🏫'}
                        </span>
                        <span className="text-sm font-bold text-gray-800">
                          {completionText}
                        </span>
                      </div>
                      
                      {/* Manual completion button for manual quests */}
                      {quest.requirement.type === 'manual' && !isCompleted && (
                        <button
                          onClick={() => markQuestComplete(quest.id, quest.category === 'individual' ? 'manual' : null)}
                          className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          ✓ Mark Complete
                        </button>
                      )}
                      
                      {isCompleted && (
                        <div className="text-xs text-green-600 font-bold flex items-center">
                          <span className="mr-1">✓</span>
                          Complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestPanel;