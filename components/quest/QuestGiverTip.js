// components/quest/QuestGiverTip.js - Floating Quest Giver Tips
import React from 'react';

const QuestGiverTip = ({ questGiverId, onClose, QUEST_GIVERS }) => {
  const questGiver = QUEST_GIVERS.find(qg => qg.id === questGiverId);
  if (!questGiver) return null;

  const randomTip = questGiver.tips[Math.floor(Math.random() * questGiver.tips.length)];
  const randomGreeting = questGiver.greetings[Math.floor(Math.random() * questGiver.greetings.length)];

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border-2 border-blue-200 max-w-sm z-50 animate-slide-up">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <img 
            src={questGiver.image} 
            alt={questGiver.name}
            className="w-16 h-16 rounded-full border-2 border-blue-300"
          />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-blue-800">{questGiver.name}</h4>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-blue-600 mb-2">{randomGreeting}</p>
            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">{randomTip}</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default QuestGiverTip;