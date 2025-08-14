// ===============================================
// components/quizshow/shared/PlayerCard.js - PLAYER DISPLAY CARD
// ===============================================
export const PlayerCard = ({ 
  player, 
  isHighlighted = false, 
  showScore = true, 
  showStatus = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const avatarSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  return (
    <div className={`bg-white rounded-xl border-2 transition-all duration-200 ${
      isHighlighted 
        ? 'border-purple-400 shadow-lg scale-105 bg-purple-50' 
        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
    } ${sizeClasses[size]}`}>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img 
            src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
            alt={`${player.name}'s avatar`}
            className={`${avatarSizes[size]} rounded-full border-2 ${
              isHighlighted ? 'border-purple-400' : 'border-gray-300'
            }`}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {player.avatar?.level || 1}
          </div>
          {showStatus && (
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold truncate ${
            isHighlighted ? 'text-purple-800' : 'text-gray-800'
          }`}>
            {player.name}
          </h4>
          <p className="text-sm text-gray-600">
            Level {player.avatar?.level || 1}
          </p>
        </div>
        
        {showScore && player.totalScore !== undefined && (
          <div className="text-right">
            <div className={`font-bold ${
              isHighlighted ? 'text-purple-600' : 'text-gray-700'
            }`}>
              {formatScore(player.totalScore)}
            </div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        )}
      </div>
    </div>
  );
};