// RaceWinnerModal.js - Enhanced Victory Celebration with Prize Display
import React, { useState, useEffect } from 'react';

const RaceWinnerModal = ({ 
  winner,
  selectedPrize,
  prizeDetails,
  onClose,
  awardPrize
}) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [showPrizeDetails, setShowPrizeDetails] = useState(false);
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    // Show prize details after initial celebration
    const timer = setTimeout(() => {
      setShowPrizeDetails(true);
    }, 2000);

    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setConfettiActive(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, []);

  if (!winner) return null;

  const handleCelebrate = () => {
    if (awardPrize) {
      awardPrize(winner);
    }
    onClose();
  };

  const getPrizeDisplay = () => {
    switch (selectedPrize) {
      case 'xp':
        return {
          icon: '⭐',
          title: `${prizeDetails.amount} ${prizeDetails.category} XP`,
          description: `Boosting ${winner.firstName}'s ${prizeDetails.category} skills!`,
          color: 'from-blue-500 to-purple-500'
        };
      
      case 'coins':
        return {
          icon: '💰',
          title: `${prizeDetails.amount} Coins`,
          description: `${winner.firstName} can spend these in the shop!`,
          color: 'from-yellow-400 to-yellow-600'
        };
      
      case 'shop_item':
        return {
          icon: prizeDetails.item.image ? null : '🏪',
          image: prizeDetails.item.image,
          title: prizeDetails.item.name,
          description: `A fantastic ${prizeDetails.item.category.slice(0, -1)} for ${winner.firstName}!`,
          color: 'from-purple-500 to-pink-500'
        };
      
      case 'loot_box':
        return {
          icon: prizeDetails.lootBox.image,
          title: prizeDetails.lootBox.name,
          description: `${winner.firstName} gets to open a mystery loot box!`,
          color: 'from-orange-500 to-red-500'
        };
      
      case 'classroom_reward':
        return {
          icon: prizeDetails.reward.icon,
          title: prizeDetails.reward.name,
          description: prizeDetails.reward.description,
          color: 'from-green-500 to-emerald-500'
        };
      
      default:
        return {
          icon: '🎁',
          title: 'Mystery Prize',
          description: 'Something special awaits!',
          color: 'from-gray-500 to-gray-600'
        };
    }
  };

  const prizeDisplay = getPrizeDisplay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {/* Confetti Effect */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              {['🎉', '🎊', '🏆', '⭐', '💫', '🎁', '👑', '🌟'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden transform animate-victory-bounce">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${prizeDisplay.color} text-white p-8 text-center relative`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            {/* Trophy Animation */}
            <div className="text-8xl mb-4 animate-bounce">🏆</div>
            
            {/* Winner Announcement */}
            <h2 className="text-4xl font-bold mb-2">VICTORY!</h2>
            <p className="text-xl opacity-90">Championship Winner</p>
          </div>
        </div>

        {/* Winner Details */}
        <div className="p-8">
          <div className="text-center mb-6">
            {/* Winner's Pet */}
            <div className="relative inline-block mb-4">
              <img 
                src={winner.pet?.image} 
                alt="Winning Pet"
                className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg mx-auto"
              />
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold animate-pulse">
                👑
              </div>
            </div>
            
            {/* Winner Info */}
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{winner.firstName}</h3>
            <p className="text-lg text-gray-600 mb-1">& {winner.pet?.name}</p>
            <p className="text-sm text-gray-500">Race Champions!</p>
          </div>

          {/* Prize Reveal */}
          {showPrizeDetails && (
            <div className="animate-slide-up">
              <div className={`bg-gradient-to-r ${prizeDisplay.color} rounded-xl p-6 text-white text-center mb-6`}>
                <div className="mb-3">
                  {prizeDisplay.image ? (
                    <img 
                      src={prizeDisplay.image} 
                      alt="Prize"
                      className="w-16 h-16 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="text-5xl">{prizeDisplay.icon}</div>
                  )}
                </div>
                <h4 className="text-xl font-bold mb-2">Victory Prize</h4>
                <p className="text-lg font-semibold mb-1">{prizeDisplay.title}</p>
                <p className="text-sm opacity-90">{prizeDisplay.description}</p>
              </div>
            </div>
          )}

          {/* Stats Update */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-bold text-gray-800 mb-2 text-center">🏅 Updated Stats</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{(winner.pet?.wins || 0) + 1}</div>
                <div className="text-sm text-gray-600">Total Wins</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {(((winner.pet?.speed || 1) + 0.02) * 10).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Speed Rating</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCelebrate}
            className={`w-full py-4 bg-gradient-to-r ${prizeDisplay.color} text-white font-bold text-lg rounded-xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg`}
          >
            🎉 Celebrate Victory! 🎉
          </button>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes victory-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) scale(1);
          }
          40% {
            transform: translateY(-20px) scale(1.05);
          }
          60% {
            transform: translateY(-10px) scale(1.02);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-victory-bounce {
          animation: victory-bounce 1s ease-in-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RaceWinnerModal;