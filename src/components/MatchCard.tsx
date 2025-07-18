import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { UIMatch } from '../types';

interface MatchCardProps {
  match: UIMatch;
  variant?: 'compact' | 'detailed' | 'selectable';
  selected?: boolean;
  onSelect?: (match: UIMatch) => void;
  onStartMatch?: (match: UIMatch) => void;
  onGenerateNew?: () => void;
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
  onStartMatch,
  onGenerateNew,
  onSaveResult,
  showActions = true,
  showScores = true,
  className = '',
}: MatchCardProps) {
  const [team1Score, setTeam1Score] = React.useState('');
  const [team2Score, setTeam2Score] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSaveResult = async () => {
    if (!onSaveResult || !team1Score || !team2Score) return;
    
    setIsSubmitting(true);
    try {
      await onSaveResult(match, parseInt(team1Score), parseInt(team2Score));
      setTeam1Score('');
      setTeam2Score('');
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardStyles = () => {
    let baseStyles = 'transition-colors';
    
    if (variant === 'selectable') {
      baseStyles += selected 
        ? ' ring-2 ring-blue-500' 
        : ' hover:bg-gray-50 cursor-pointer';
    }
    
    if (match.winner) {
      baseStyles += ' border-green-200 bg-green-50';
    } else if (match.team1Score > 0 || match.team2Score > 0) {
      baseStyles += ' border-blue-200 bg-blue-50';
    }
    
    return `${baseStyles} ${className}`;
  };

  const renderCompactView = () => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="text-sm leading-tight">
          <span className="font-semibold text-blue-600">
            {match.team1.player1.name} & {match.team1.player2.name}
          </span>
          <span className="mx-2 text-gray-500">vs</span>
          <span className="font-semibold text-red-600">
            {match.team2.player1.name} & {match.team2.player2.name}
          </span>
        </div>
      </div>
      <div className="text-xs sm:text-sm text-gray-600">
        {new Date(match.createdAt).toLocaleDateString()}
      </div>
    </div>
  );

  const renderDetailedView = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Team 1 */}
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-blue-600">Team 1</h3>
            {showScores && (
              <p className="text-xs sm:text-sm text-gray-600">Total Score: {match.team1.totalScore}</p>
            )}
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[match.team1.player1, match.team1.player2].map((player) => (
              <div key={player.id} className="flex items-center space-x-3 p-2 sm:p-3 bg-white rounded-lg border">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm sm:text-base">
                    {player.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{player.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Score: {player.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 */}
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-red-600">Team 2</h3>
            {showScores && (
              <p className="text-xs sm:text-sm text-gray-600">Total Score: {match.team2.totalScore}</p>
            )}
          </div>
          <div className="space-y-2 sm:space-y-3">
            {[match.team2.player1, match.team2.player2].map((player) => (
              <div key={player.id} className="flex items-center space-x-3 p-2 sm:p-3 bg-white rounded-lg border">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-semibold text-sm sm:text-base">
                    {player.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{player.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Score: {player.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showScores && match.team1Score === 0 && match.team2Score === 0 && (
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
            Score difference: {Math.abs(match.team1.totalScore - match.team2.totalScore)} points
          </p>
        </div>
      )}

      {showScores && (match.team1Score > 0 || match.team2Score > 0) && (
        <div className="border-t pt-4 sm:pt-6">
          <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center">Final Score</h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-md mx-auto">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-blue-600">Team 1 Score</label>
              <input
                type="number"
                value={team1Score}
                onChange={(e) => setTeam1Score(e.target.value)}
                placeholder={match.team1Score.toString()}
                min="0"
                max="21"
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-red-600">Team 2 Score</label>
              <input
                type="number"
                value={team2Score}
                onChange={(e) => setTeam2Score(e.target.value)}
                placeholder={match.team2Score.toString()}
                min="0"
                max="21"
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>
      )}

      {showActions && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 justify-center">
          {onStartMatch && match.team1Score === 0 && match.team2Score === 0 && (
            <Button onClick={() => onStartMatch(match)} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              Start Match
            </Button>
          )}
          {onGenerateNew && match.team1Score === 0 && match.team2Score === 0 && (
            <Button variant="outline" onClick={onGenerateNew} className="w-full sm:w-auto">
              Generate New Match
            </Button>
          )}
          {onSaveResult && (match.team1Score > 0 || match.team2Score > 0) && (
            <Button 
              onClick={handleSaveResult}
              disabled={isSubmitting || !team1Score || !team2Score}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              {isSubmitting ? 'Saving...' : 'Save Result'}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Card 
      className={getCardStyles()}
      onClick={variant === 'selectable' && onSelect ? () => onSelect(match) : undefined}
    >
      <CardContent className="p-4 sm:p-6">
        {variant === 'compact' ? renderCompactView() : renderDetailedView()}
      </CardContent>
    </Card>
  );
}

export default MatchCard;