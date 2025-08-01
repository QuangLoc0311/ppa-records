import { useState, useEffect } from 'react';
import { Trophy, Users, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MatchCard } from './MatchCard';
import { PlayerCard } from './PlayerCard';
import type { Player, UIMatch, Team } from '../types';
import { playerService, matchService, scoreService } from '../services';

export function MatchRecording() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [currentMatch, setCurrentMatch] = useState<UIMatch | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentMatches, setRecentMatches] = useState<UIMatch[]>([]);

  useEffect(() => {
    fetchPlayers();
    fetchRecentMatches();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getPlayersByScore();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      const matches = await matchService.getRecentMatches();
      setRecentMatches(matches);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlayers.size === players.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(players.map(p => p.id)));
    }
  };

  const getSelectedPlayersList = () => {
    return players.filter(player => selectedPlayers.has(player.id));
  };

  const generateSimpleMatch = (players: Player[]): UIMatch => {
    if (players.length < 4) {
      throw new Error('Need at least 4 players to generate a match');
    }

    // Simple random selection for now
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const team1: Team = {
      id: 'team1',
      player1: shuffled[0],
      player2: shuffled[1],
      totalScore: shuffled[0].score + shuffled[1].score,
    };
    const team2: Team = {
      id: 'team2',
      player1: shuffled[2],
      player2: shuffled[3],
      totalScore: shuffled[2].score + shuffled[3].score,
    };

    return {
      id: `match-${Date.now()}`,
      sessionId: 'temp-session',
      matchNumber: 1,
      team1,
      team2,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleStartMatch = () => {
    const selectedPlayersList = getSelectedPlayersList();
    if (selectedPlayersList.length < 4) {
      alert('Please select at least 4 players to start a match.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      try {
        const match = generateSimpleMatch(selectedPlayersList);
        setCurrentMatch(match);
      } catch (error) {
        console.error('Error generating match:', error);
      }
      setIsGenerating(false);
    }, 500);
  };

  const handleSaveResult = async (match: UIMatch, team1Score: number, team2Score: number) => {
    try {
      // Create match with players
      await matchService.createMatch({
        sessionId: match.sessionId,
        matchNumber: match.matchNumber,
        team1Player1Id: match.team1.player1.id,
        team1Player2Id: match.team1.player2.id,
        team2Player1Id: match.team2.player1.id,
        team2Player2Id: match.team2.player2.id,
      });

      // Update match result
      await matchService.updateMatchResult({
        matchId: match.id,
        team1Score,
        team2Score,
      });

      // Update player scores
      const winner = team1Score > team2Score ? 'team1' : 'team2';
      await scoreService.updatePlayerScores(match, team1Score, team2Score, winner);

      setCurrentMatch(null);
      fetchPlayers();
      fetchRecentMatches();
    } catch (error) {
      console.error('Error saving match result:', error);
    }
  };

  const selectedPlayersList = getSelectedPlayersList();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Match Recording</h2>
          <p className="text-gray-600 mt-1">Record individual match results and update player scores</p>
        </div>
        <Button 
          onClick={handleStartMatch} 
          disabled={isGenerating || selectedPlayersList.length < 4}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Play className="w-4 h-4 mr-2" />
          {isGenerating ? 'Creating...' : 'Start Match'}
        </Button>
      </div>

      {/* Player Selection */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Select Players for Match</h3>
              <p className="text-sm text-gray-600">Choose 4 players to participate in this match</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-green-700">
                  {selectedPlayersList.length} of {players.length} selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                {selectedPlayers.size === players.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No players available</p>
              <p className="text-gray-400 text-sm">Add players first to start recording matches</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {players.map((player) => {
                const isSelected = selectedPlayers.has(player.id);
                return (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    isSelected={isSelected}
                    onClick={handlePlayerToggle}
                    variant="selection"
                    showScore={true}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning for insufficient players */}
      {selectedPlayersList.length < 4 && (
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 text-lg">Need More Players</h3>
                <p className="text-yellow-700 mt-1">
                  Exactly 4 players must be selected to start a match. 
                  Currently have <span className="font-semibold">{selectedPlayersList.length}</span> players selected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Match */}
      {currentMatch && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
              Record Match Results
            </h3>
          </div>
          <MatchCard 
            match={currentMatch} 
            variant="detailed" 
            onSaveResult={handleSaveResult}
            showActions={true}
            showScores={true}
            className="shadow-lg"
          />
        </div>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Recent Matches</h3>
            <span className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {recentMatches.length} matches
            </span>
          </div>
          <div className="space-y-4">
            {recentMatches.slice(0, 5).map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                variant="compact" 
                showActions={false}
                showScores={true}
                className="shadow-md"
              />
            ))}
          </div>
        </div>
      )}

      {recentMatches.length === 0 && !currentMatch && (
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No matches recorded yet</h3>
            <p className="text-gray-600 mb-6">Select 4 players and start a match to record results</p>
            <Button 
              onClick={handleStartMatch}
              disabled={selectedPlayersList.length < 4}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Match
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 