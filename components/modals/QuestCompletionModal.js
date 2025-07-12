// QuestCompletionModal.js - ENHANCED with Quest Giver Integration
import React, { useState, useEffect } from 'react';

const QuestCompletionModal = ({ questData, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationPhase, setAnimationPhase] = useState('entrance'); // entrance, celebration, exit

  if (!questData) return null;

  const { quest, student, questGiver } = questData;
  
  // Quest giver celebration responses based on personality
  const getCelebrationMessage = () => {
    if (!questGiver) return "Quest completed successfully!";
    
    const messages = {
      wise: [
        "Excellent work! Your dedication to learning shines through! 🌟",
        "Knowledge is power, and you've gained both today! 📚✨",
        "Your wisdom grows with each quest completed! 🦉💫"
      ],
      punctual: [
        "Outstanding! Your responsible approach is exemplary! ⏰✨",
        "Precision and dedication - well done, champion! 🎯⭐",
        "Time well invested in your growth! Keep it up! ⚡💪"
      ],
      energetic: [
        "AMAZING! You're absolutely crushing it! 🚀✨",
        "Your energy and enthusiasm are incredible! 🌟⚡",
        "Keep shining bright, superstar! You're unstoppable! ✨🎉"
      ],
      protective: [
        "Your kindness and respect make you a true champion! 🛡️💙",
        "Well done, guardian! Your actions protect and inspire! 🌟🤝",
        "Strength through compassion - you exemplify it perfectly! 💪❤️"
      ],
      wise: [
        "Growth comes to those who persist. Well done! 🌱✨",
        "Your reflection and effort have borne fruit! 🍃⭐",
        "The journey of learning continues. Excellent progress! 🔮💫"
      ],
      adventurous: [
        "What an adventure! You've conquered this quest! 🗺️⚡",
        "Explorer's spirit at its finest! Well done! 🎒✨",
        "Your curiosity leads to great discoveries! 🔍🌟"
      ],
      magical: [
        "The magic of learning has transformed you! ✨🎭",
        "Spellbinding performance! Your potential is limitless! 🌟⚡",
        "You've unlocked new powers through dedication! 🔮💫"
      ]
    };

    const personalityMessages = messages[questGiver.personality] || messages.magical;
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
  };

  const getQuestTypeMessage = () => {
    if (quest.category === 'academic') return "Academic Excellence Achieved! 📚";
    if (quest.category === 'behavior') return "Character Development Unlocked! 🌟";
    if (quest.category === 'responsibility') return "Leadership Skills Enhanced! 👑";
    if (quest.category === 'weekly') return "Weekly Challenge Conquered! 🏆";
    return "Quest Completed! ⚔️";
  };

  // Animation control
  useEffect(() => {
    setShowConfetti(true);
    setAnimationPhase('entrance');
    
    const timer1 = setTimeout(() => setAnimationPhase('celebration'), 500);
    const timer2 = setTimeout(() => setAnimationPhase('exit'), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const confettiElements = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 animate-bounce ${
        ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][i % 5]
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti Background */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confettiElements}
        </div>
      )}
      
      <div className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-700 ${
        animationPhase === 'entrance' ? 'scale-50 opacity-0' :
        animationPhase === 'celebration' ? 'scale-100 opacity-100' :
        'scale-110 opacity-90'
      }`}>
        
        {/* Header with Quest Giver */}
        <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-2xl p-6 text-center">
          {/* Quest Giver Avatar */}
          {questGiver && (
            <div className={`mx-auto mb-4 transform transition-all duration-1000 ${
              animationPhase === 'celebration' ? 'scale-110 rotate-12' : 'scale-100'
            }`}>
              <img 
                src={questGiver.image} 
                alt={questGiver.name}
                className="w-20 h-20 mx-auto rounded-full border-4 border-white shadow-lg"
              />
              <div className="mt-2 text-white font-bold text-lg">{questGiver.name}</div>
              <div className="text-orange-100 text-sm">{questGiver.role}</div>
            </div>
          )}
          
          {/* Quest Type Badge */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm font-semibold">
            {getQuestTypeMessage()}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {/* Quest Details */}
          <div className="text-center mb-6">
            <div className={`text-6xl mb-4 transform transition-all duration-1000 ${
              animationPhase === 'celebration' ? 'scale-125 animate-pulse' : 'scale-100'
            }`}>
              {quest.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{quest.title}</h2>
            <p className="text-gray-600 mb-4">{quest.description}</p>
            
            {student && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="text-lg font-semibold text-blue-800">
                  🎉 Completed by {student.firstName}!
                </div>
              </div>
            )}
          </div>

          {/* Quest Giver Message */}
          {questGiver && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <img 
                  src={questGiver.image} 
                  alt={questGiver.name}
                  className="w-12 h-12 rounded-full border-2 border-blue-300 flex-shrink-0"
                />
                <div>
                  <div className="font-bold text-blue-800 mb-1">{questGiver.name} says:</div>
                  <div className="text-blue-700 italic">"{getCelebrationMessage()}"</div>
                </div>
              </div>
            </div>
          )}

          {/* Rewards Section */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-yellow-800 mb-3 text-center">🎁 Quest Rewards</h3>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <div className={`text-3xl mb-2 transform transition-all duration-1000 ${
                  animationPhase === 'celebration' ? 'scale-150 animate-spin' : 'scale-100'
                }`}>
                  💰
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  +{quest.reward?.amount || 0}
                </div>
                <div className="text-sm text-yellow-700">Coins Earned</div>
              </div>
              
              {quest.difficulty && (
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {quest.difficulty === 'easy' ? '⭐' : 
                     quest.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                  </div>
                  <div className="text-lg font-bold text-gray-600 capitalize">
                    {quest.difficulty}
                  </div>
                  <div className="text-sm text-gray-500">Difficulty</div>
                </div>
              )}
            </div>
          </div>

          {/* Quest Stats */}
          {quest.estimatedTime && (
            <div className="text-center text-sm text-gray-600 mb-6">
              <span className="inline-flex items-center space-x-1">
                <span>⏱️</span>
                <span>Estimated time: {quest.estimatedTime}</span>
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              ✨ Awesome! Continue Adventure
            </button>
          </div>

          {/* Quest Giver Tip */}
          {questGiver && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">💡 {questGiver.name}'s Tip:</div>
              <div className="text-sm text-gray-700">
                {questGiver.tips[Math.floor(Math.random() * questGiver.tips.length)]}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Visual Effects */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-100vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
        
        @keyframes celebrate-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s linear infinite;
        }
        
        .animate-celebrate {
          animation: celebrate-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default QuestCompletionModal;