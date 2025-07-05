import React from 'react';

const QuestPanel = ({ 
  dailyQuests, 
  weeklyQuests, 
  students, 
  currentStudentId = null,
  checkQuestCompletion,
  markQuestComplete
}) => {
  const today = new Date();
  const timeUntilMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) - today;
  const hoursUntilMidnight = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
  const minutesUntilMidnight = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));

  const getWeekEnd = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = 6 - day; // Days until Sunday
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + diff);
    return weekEnd;
  };

  const weekEnd = getWeekEnd();
  const timeUntilWeekEnd = weekEnd - today;
  const daysUntilWeekEnd = Math.floor(timeUntilWeekEnd / (1000 * 60 * 60 * 24));

  const getQuestProgress = (quest, studentId = null) => {
    if (quest.category === 'class') {
      return checkQuestCompletion(quest.id) ? 'completed' : 'in-progress';
    } else if (studentId) {
      return checkQuestCompletion(quest.id, studentId) ? 'completed' : 'in-progress';
    } else {
      // For dashboard view, show overall class progress
      const completedCount = students.filter(s => checkQuestCompletion(quest.id, s.id)).length;
      return completedCount > 0 ? `${completedCount}/${students.length}` : 'not-started';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 'completed') return 'text-green-600';
    if (progress === 'in-progress') return 'text-yellow-600';
    if (progress.includes('/')) return 'text-blue-600';
    return 'text-gray-500';
  };

  const getProgressIcon = (progress) => {
    if (progress === 'completed') return '✅';
    if (progress === 'in-progress') return '⏳';
    if (progress.includes('/')) return '👥';
    return '❌';
  };

  const canMarkComplete = (quest, studentId = null) => {
    return quest.requirement.type === 'manual' && 
           (quest.category === 'class' || studentId) &&
           !checkQuestCompletion(quest.id, studentId);
  };

  const QuestCard = ({ quest, isWeekly = false }) => {
    const progress = getQuestProgress(quest, currentStudentId);
    const progressColor = getProgressColor(progress);
    const progressIcon = getProgressIcon(progress);

    return (
      <div className={`bg-white rounded-lg p-4 border-2 transition-all duration-300 hover:shadow-md ${
        progress === 'completed' ? 'border-green-400 bg-green-50' : 'border-gray-200'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{quest.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">{quest.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{quest.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-sm font-medium ${progressColor}`}>
              {progressIcon} {progress === 'completed' ? 'Done!' : 
                            progress === 'in-progress' ? 'Active' : 
                            progress.includes('/') ? progress : 'Start'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {quest.reward.type} +{quest.reward.amount}
            </span>
            {quest.category === 'class' && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Class Quest
              </span>
            )}
          </div>
          
          {canMarkComplete(quest, currentStudentId) && (
            <button
              onClick={() => markQuestComplete(quest.id, currentStudentId)}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🎯</span>
          Daily Quests
        </h3>
        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
          Reset in {hoursUntilMidnight}h {minutesUntilMidnight}m
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {dailyQuests.length > 0 ? (
          dailyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>No daily quests available</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🏆</span>
          Weekly Quests
        </h3>
        <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
          Reset in {daysUntilWeekEnd} days
        </div>
      </div>

      <div className="space-y-3">
        {weeklyQuests.length > 0 ? (
          weeklyQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} isWeekly={true} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🏆</div>
            <p>No weekly quests available</p>
          </div>
        )}
      </div>

      {currentStudentId && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📈 Your Progress</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Daily Completed:</span>
              <span className="font-semibold ml-2">
                {dailyQuests.filter(q => checkQuestCompletion(q.id, currentStudentId)).length}/{dailyQuests.length}
              </span>
            </div>
            <div>
              <span className="text-blue-600">Weekly Completed:</span>
              <span className="font-semibold ml-2">
                {weeklyQuests.filter(q => checkQuestCompletion(q.id, currentStudentId)).length}/{weeklyQuests.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestPanel;