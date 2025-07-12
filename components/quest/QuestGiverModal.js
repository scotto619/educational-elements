// components/quest/QuestGiverModal.js - Interactive Quest Giver Dialog
import React from 'react';

const QuestGiverModal = ({ quest, onComplete, onClose, QUEST_GIVERS }) => {
  const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
  if (!questGiver) return null;

  const randomGreeting = questGiver.greetings[Math.floor(Math.random() * questGiver.greetings.length)];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-modal-appear">
        <div className="p-6">
          <div className="text-center mb-6">
            <img 
              src={questGiver.image} 
              alt={questGiver.name}
              className="w-24 h-24 mx-auto rounded-full border-4 border-blue-300 mb-4"
            />
            <h2 className="text-2xl font-bold text-blue-800">{questGiver.name}</h2>
            <p className="text-blue-600">{questGiver.role}</p>
            <p className="text-gray-600 mt-2">{randomGreeting}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{quest.icon}</span>
              <div>
                <h3 className="font-bold text-lg">{quest.title}</h3>
                <p className="text-sm text-gray-600">Difficulty: {quest.difficulty}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{quest.description}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>⏱️ {quest.estimatedTime}</span>
              <span>💰 {quest.reward.amount} coins</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Close
            </button>
            {quest.type === 'manual' && (
              <button
                onClick={() => {
                  onComplete(quest.id);
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes modal-appear {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QuestGiverModal;