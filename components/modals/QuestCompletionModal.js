import React from 'react';

const QuestCompletionModal = ({ 
  questCompletionData, 
  setQuestCompletionData, 
  showQuestCompletion, 
  setShowQuestCompletion 
}) => {
  if (!showQuestCompletion || !questCompletionData) return null;

  const { quest, student, studentId } = questCompletionData;
  const isClassQuest = quest.category === 'class';

  const handleClose = () => {
    setShowQuestCompletion(false);
    setQuestCompletionData(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-modal-appear">
        <div className="p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">Quest Complete!</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">{quest.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-gray-800">{quest.title}</h3>
                <p className="text-sm text-gray-600">{quest.description}</p>
              </div>
            </div>
            
            {isClassQuest ? (
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg mb-4">
                <span className="font-semibold">🏆 Class Quest Completed!</span>
                <p className="text-sm mt-1">Everyone in the class worked together to complete this quest!</p>
              </div>
            ) : (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg mb-4">
                <span className="font-semibold">✨ {student?.firstName} completed the quest!</span>
              </div>
            )}
            
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
              <span className="font-semibold">Reward Earned:</span>
              <div className="text-lg font-bold mt-1">
                {quest.reward.type} +{quest.reward.amount}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isClassQuest ? (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">🎊 Class Celebration!</h4>
                <p className="text-sm text-yellow-700">
                  All students receive +{quest.reward.amount} {quest.reward.type} for completing this class quest together!
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🌟 Individual Achievement!</h4>
                <p className="text-sm text-blue-700">
                  {student?.firstName} has earned +{quest.reward.amount} {quest.reward.type} for completing this quest!
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="mr-1">📅</span>
                <span>{quest.type === 'daily' ? 'Daily Quest' : 'Weekly Quest'}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">🎯</span>
                <span>{isClassQuest ? 'Class Challenge' : 'Individual Quest'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Awesome! Continue Adventure 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestCompletionModal;