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

  const baseClasses = `group relative p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${className}`;
  
  const selectionClasses = isSelected
    ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 shadow-lg shadow-blue-200 cursor-pointer'
    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer';

  const displayClasses = 'bg-white border-gray-200 shadow-sm';

  const cardClasses = variant === 'selection' ? `${baseClasses} ${selectionClasses}` : `${baseClasses} ${displayClasses}`;

  return (
    <div className={cardClasses} onClick={handleClick}>
      {/* Selection Indicator - Only show for selection variant */}
      {variant === 'selection' && (
        <div className={`absolute top-3 right-3 transition-all duration-200 ${
          isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100'
        }`}>
          {isSelected ? (
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Square className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {/* Player Avatar */}
      <div className="flex items-center space-x-3 mb-3">
        <UserAvatar 
          user={player} 
          size="lg"
          className={variant === 'selection' && isSelected ? 'bg-white text-blue-600' : ''}
        />
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-sm sm:text-base truncate ${
            variant === 'selection' && isSelected ? 'text-white' : 'text-gray-800'
          }`}>
            {player.name}
          </h4>
          <p className={`text-xs capitalize ${
            variant === 'selection' && isSelected ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {player.gender}
          </p>
        </div>
      </div>

      {/* Player Stats - Only show if showScore is true */}
      {showScore && (
        <div className={`p-3 rounded-lg ${
          variant === 'selection' && isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${
              variant === 'selection' && isSelected ? 'text-blue-100' : 'text-gray-600'
            }`}>
              Skill Score
            </span>
            <span className={`text-sm font-bold ${
              variant === 'selection' && isSelected ? 'text-white' : 'text-blue-600'
            }`}>
              {player.score.toFixed(1)}
            </span>
          </div>
          
          {/* Skill Level Bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((player.score / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Hover Effect - Only for selection variant */}
      {variant === 'selection' && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200"></div>
      )}
    </div>
  );
} 