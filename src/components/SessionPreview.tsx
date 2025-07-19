import { Play, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { UserAvatar } from './UserAvatar';
import type { Player, UIMatch } from '../types';

interface SessionPreviewProps {
  sessionMatches: UIMatch[];
  participantSummary: { player: Player; matchesPlayed: number }[];
  onActivateSession: () => void;
  onRegenerateSession: () => void;
  isActivating: boolean;
}

export function SessionPreview({
  sessionMatches,
  participantSummary,
  onActivateSession,
  onRegenerateSession,
  isActivating
}: SessionPreviewProps) {
  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Generated Session Preview</h3>
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {sessionMatches.length} matches generated
          </span>
        </div>

        {/* Participant Summary */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Participant Match Distribution</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {participantSummary.map(({ player, matchesPlayed }) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={player} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{player.name}</p>
                    <p className="text-xs text-gray-600">{player.score.toFixed(1)} pts</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{matchesPlayed}</p>
                  <p className="text-xs text-gray-500">matches</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Matches List */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Generated Matches</h4>
          <div className="space-y-3">
            {sessionMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg border shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-800">Match #{match.matchNumber}</h5>
                  <div className="text-xs text-gray-500">
                    Expected: {Math.abs(match.team1.totalScore - match.team2.totalScore).toFixed(1)} pts diff
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Team 1 */}
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">T1</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{match.team1.player1.name}</span>
                        <span className="text-gray-400">+</span>
                        <span className="text-sm font-medium">{match.team1.player2.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {match.team1.totalScore.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                  
                  {/* Team 2 */}
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">T2</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{match.team2.player1.name}</span>
                        <span className="text-gray-400">+</span>
                        <span className="text-sm font-medium">{match.team2.player2.name}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Total: {match.team2.totalScore.toFixed(1)} pts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onActivateSession}
            disabled={isActivating}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Play className="w-5 h-5 mr-2" />
            {isActivating ? 'Activating...' : 'Activate Session'}
          </Button>
          <Button
            onClick={onRegenerateSession}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 px-8 py-3 text-lg font-semibold transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Generate New Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SessionPreview; 