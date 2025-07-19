import { CheckSquare, Square } from 'lucide-react';
import type { Player } from '../types';
import { UserAvatar } from './UserAvatar';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onClick: (playerId: string) => void;
  variant?: 'selection' | 'display';
  showScore?: boolean;
  className?: string;
}

export function PlayerCard({ 
  player, 
  isSelected, 
  onClick, 
  variant = 'selection',
  showScore = true,
  className = ''
}: PlayerCardProps) {
  const handleClick = () => {
    if (variant === 'selection') {
      onClick(player.id);
    }
  };

  const baseClasses = `group relative p-2.5 sm:p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-102 active:scale-98 touch-manipulation ${className}`;
  
  const selectionClasses = isSelected
    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-lg shadow-blue-200 cursor-pointer'
    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer';

  const displayClasses = 'bg-white border-gray-200 shadow-sm';

  const cardClasses = variant === 'selection' ? `${baseClasses} ${selectionClasses}` : `${baseClasses} ${displayClasses}`;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Selection Indicator - Only show for selection variant */}
      {variant === 'selection' && (
        <div className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 transition-all duration-200 ${
          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100'
        }`}>
          {isSelected ? (
            <div className="w-6 h-6 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center shadow-md">
              <CheckSquare className="w-4 h-4 sm:w-3 sm:h-3 text-blue-600" />
            </div>
          ) : (
            <div className="w-6 h-6 sm:w-5 sm:h-5 bg-gray-100 rounded-full flex items-center justify-center">
              <Square className="w-4 h-4 sm:w-3 sm:h-3 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Player Avatar and Info - Mobile optimized layout */}
      <div className="flex items-center space-x-2.5 sm:space-x-2 mb-2">
        <UserAvatar 
          user={player} 
          size="md"
          className={variant === 'selection' && isSelected ? 'bg-white text-blue-600' : ''}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm sm:text-sm truncate leading-tight ${
            variant === 'selection' && isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            {player.name}
          </h4>
          <p className={`text-xs capitalize leading-tight ${
            variant === 'selection' && isSelected ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {player.gender}
          </p>
        </div>
      </div>

      {/* Player Stats - Only show if showScore is true */}
      {showScore && (
        <div className={`p-2 sm:p-2 rounded-md ${
          variant === 'selection' && isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${
              variant === 'selection' && isSelected ? 'text-blue-100' : 'text-gray-600'
            }`}>
              Skill
            </span>
            <span className={`text-sm font-bold ${
              variant === 'selection' && isSelected ? 'text-white' : 'text-blue-600'
            }`}>
              {player.score.toFixed(1)}
            </span>
          </div>
          
          {/* Skill Level Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-1.5">
            <div 
              className="bg-blue-600 h-1.5 sm:h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((player.score / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Hover Effect - Only for selection variant */}
      {variant === 'selection' && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200"></div>
      )}
    </div>
  );
} 