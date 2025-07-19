import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { UIMatch } from '../types';

interface MatchCardProps {
  match: UIMatch;
  variant?: 'compact' | 'detailed' | 'selectable';
  selected?: boolean;
  onSelect?: (match: UIMatch) => void;
  onSaveResult?: (match: UIMatch, team1Score: number, team2Score: number) => void;
  showActions?: boolean;
  showScores?: boolean;
  className?: string;
}

export function MatchCard({
  match,
  variant = 'detailed',
  selected = false,
  onSelect,
  onSaveResult,
  showActions = true,
  className = '',
}: MatchCardProps) {
  const [team1Score, setTeam1Score] = React.useState(match.team1Score > 0 ? match.team1Score.toString() : '');
  const [team2Score, setTeam2Score] = React.useState(match.team2Score > 0 ? match.team2Score.toString() : '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSaveResult = async () => {
    if (!onSaveResult || !team1Score || !team2Score) return;
    
    setIsSubmitting(true);
    try {
      await onSaveResult(match, parseInt(team1Score), parseInt(team2Score));
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardStyles = () => {
    let baseStyles = 'transition-all duration-200';
    
    if (variant === 'selectable') {
      baseStyles += selected 
        ? ' ring-2 ring-purple-500 shadow-lg' 
        : ' hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:shadow-md cursor-pointer';
    }
    
    if (match.winner) {
      baseStyles += ' border-emerald-300 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50';
    } else if (match.team1Score > 0 || match.team2Score > 0) {
      baseStyles += ' border-indigo-300 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50';
    } else {
      baseStyles += ' border-gray-200 bg-gradient-to-br from-white via-gray-50 to-blue-50';
    }
    
    return `${baseStyles} ${className}`;
  };

  const renderMatchLayout = () => {
    const isCompleted = match.winner !== null;

    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Team Labels Row */}
        <div className="flex items-center justify-between">
          <div className="w-6 h-5 sm:w-8 sm:h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">T1</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Score</span>
          </div>
          <div className="w-6 h-5 sm:w-8 sm:h-6 bg-gradient-to-r from-orange-400 to-yellow-400 rounded flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xs">T2</span>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between space-x-2">
            {/* Team 1 Players - Mobile */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">
                    {match.team1.player1.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium truncate">{match.team1.player1.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">
                    {match.team1.player2.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium truncate">{match.team1.player2.name}</span>
              </div>
            </div>

            {/* Score Input - Mobile */}
            <div className="flex items-center justify-center space-x-1 min-w-[80px]">
              <input
                type="number"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                placeholder="0"
                min="0"
                max="21"
                disabled={isCompleted}
                className="w-8 px-1 py-1 text-center text-xs border-2 border-purple-300 rounded-md focus:outline-none disabled:bg-gray-100 bg-white touch-manipulation"
              />
              <span className="text-gray-500 font-bold text-xs">-</span>
              <input
                type="number"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                placeholder="0"
                min="0"
                max="21"
                disabled={isCompleted}
                className="w-8 px-1 py-1 text-center text-xs border-2 border-orange-300 rounded-md focus:outline-none disabled:bg-gray-100 bg-white touch-manipulation"
              />
            </div>

            {/* Team 2 Players - Mobile */}
            <div className="flex-1 space-y-2 text-right">
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs font-medium truncate">{match.team2.player1.name}</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">
                    {match.team2.player1.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs font-medium truncate">{match.team2.player2.name}</span>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">
                    {match.team2.player2.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center w-full">
          {/* Team 1 Players */}
          <div className="w-2/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">
                  {match.team1.player1.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium w-16 truncate">{match.team1.player1.name}</span>
            </div>
            <span className="text-gray-400 text-sm">-</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-16 truncate text-right">{match.team1.player2.name}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">
                  {match.team1.player2.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Score Input */}
          <div className="w-1/5 flex items-center justify-center space-x-2">
            <input
              type="number"
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              placeholder="0"
              min="0"
              max="21"
              disabled={isCompleted}
              className="w-12 px-2 py-2 text-center text-sm border-2 border-purple-300 rounded-md focus:outline-none disabled:bg-gray-100 bg-white touch-manipulation"
            />
            <span className="text-gray-500 font-bold text-base">-</span>
            <input
              type="number"
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
              placeholder="0"
              min="0"
              max="21"
              disabled={isCompleted}
              className="w-12 px-2 py-2 text-center text-sm border-2 border-orange-300 rounded-md focus:outline-none disabled:bg-gray-100 bg-white touch-manipulation"
            />
          </div>

          {/* Team 2 Players */}
          <div className="w-2/5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">
                  {match.team2.player1.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium w-16 truncate">{match.team2.player1.name}</span>
            </div>
            <span className="text-gray-400 text-sm">-</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium w-16 truncate text-right">{match.team2.player2.name}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xs">
                  {match.team2.player2.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card 
      className={getCardStyles()}
      onClick={variant === 'selectable' && onSelect ? () => onSelect(match) : undefined}
    >
      <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Match Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-gray-800">Match #{match.matchNumber}</h3>
          <div className="text-xs text-gray-500">
            {match.status === 'scheduled' ? 'Scheduled' : 
             match.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </div>
        </div>

        {/* Match Layout */}
        {renderMatchLayout()}

        {/* Finish Match Button */}
        {showActions && onSaveResult && match.winner === null && (
          <div className="flex justify-center pt-2">
            <Button 
              onClick={handleSaveResult}
              disabled={isSubmitting || !team1Score || !team2Score}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 sm:px-8 py-3 sm:py-2 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg touch-manipulation w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Finish Match'}
            </Button>
          </div>
        )}

        {/* Completed Badge */}
        {match.winner !== null && (
          <div className="flex justify-center">
            <span className="text-xs px-3 py-2 sm:py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 rounded-full font-medium shadow-sm">
              Match Completed
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MatchCard;