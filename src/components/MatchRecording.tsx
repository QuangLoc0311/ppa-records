import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { MatchCard } from './MatchCard';
import type { UIMatch } from '../types';
import { matchService, scoreService, type UpdateMatchResultData } from '../services';

export function MatchRecording() {
  const [activeMatches, setActiveMatches] = useState<UIMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<UIMatch | null>(null);

  useEffect(() => {
    fetchActiveMatches();
  }, []);

  const fetchActiveMatches = async () => {
    try {
      const data = await matchService.getActiveMatches();
      setActiveMatches(data);
    } catch (error) {
      console.error('Error fetching active matches:', error);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Match Recording</h2>
        <Trophy className="w-6 h-6 text-yellow-500" />
      </div>

      {activeMatches.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Matches</h3>
            <p className="text-gray-600">
              All matches have been completed or no matches are currently in progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="selectable"
              selected={selectedMatch?.id === match.id}
              onSelect={setSelectedMatch}
              showActions={false}
              showScores={false}
            />
          ))}
        </div>
      )}

      {selectedMatch && (
        <MatchCard
          match={selectedMatch}
          variant="detailed"
          onSaveResult={async (match, team1Score, team2Score) => {
            const winner = team1Score > team2Score ? 'team1' : 'team2';
            
            // Update match with final scores
            const resultData: UpdateMatchResultData = {
              matchId: match.id,
              team1Score,
              team2Score,
            };

            await matchService.updateMatchResult(resultData);
            await scoreService.updatePlayerScores(match, team1Score, team2Score, winner);
            await fetchActiveMatches();
            setSelectedMatch(null);
          }}
          showActions={true}
          showScores={true}
          className="border-blue-200 bg-blue-50"
        />
      )}
    </div>
  );
} 