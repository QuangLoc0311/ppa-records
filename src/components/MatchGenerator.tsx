import { useState, useEffect } from 'react';
import { Users, Zap, Play, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MatchCard } from './MatchCard';
import { PlayerCard } from './PlayerCard';
import type { Player, UIMatch } from '../types';
import { playerService, matchService, scoreService } from '../services';
import { generateSession, convertSessionMatchToUIMatch } from '../utils/sessionGenerator';

export function MatchGenerator() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [sessionMatches, setSessionMatches] = useState<UIMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [matchDuration, setMatchDuration] = useState(15);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const data = await playerService.getPlayersByScore();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
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

  const handleGenerateSession = () => {
    const selectedPlayersList = getSelectedPlayersList();
    if (selectedPlayersList.length < 4) {
      alert('Please select at least 4 players to generate a session.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const matches = generateSession(selectedPlayersList, sessionMinutes, matchDuration);
      setSessionMatches(matches.map(m => convertSessionMatchToUIMatch(m, `session`)));
      setIsGenerating(false);
      setCurrentMatchIndex(0); // Start with the first match
    }, 500);
  };

  const handleSaveMatchResult = async (match: UIMatch, team1Score: number, team2Score: number) => {
    try {
      // Create match with players
      await matchService.createMatch({
        team1Player1Id: match.team1.player1.id,
        team1Player2Id: match.team1.player2.id,
        team2Player1Id: match.team2.player1.id,
        team2Player2Id: match.team2.player2.id,
        sessionId: match.sessionId,
        matchNumber: match.matchNumber,
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

      // Update the match in our local state
      const updatedMatches = [...sessionMatches];
      const matchIndex = updatedMatches.findIndex(m => m.id === match.id);
      if (matchIndex !== -1) {
        updatedMatches[matchIndex] = {
          ...match,
          team1Score,
          team2Score,
          winner,
        };
        setSessionMatches(updatedMatches);
      }

      // Move to next match or finish session
      if (currentMatchIndex !== null && currentMatchIndex < sessionMatches.length - 1) {
        setCurrentMatchIndex(currentMatchIndex + 1);
      } else {
        setCurrentMatchIndex(null);
      }

      // Refresh players to get updated scores
      fetchPlayers();
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
          <h2 className="text-2xl sm:text-3xl font-bold">Session Planner</h2>
          <p className="text-gray-600 mt-1">Plan and play a complete session with AI-powered matchmaking</p>
        </div>
        <Button 
          onClick={handleGenerateSession} 
          disabled={isGenerating || selectedPlayersList.length < 4}
          className="bg-gradient-to-r cursor-pointer from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Session'}
        </Button>
      </div>

      {/* Player Selection */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Select Players</h3>
              <p className="text-sm text-gray-600">Choose which players will participate in this session</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-blue-700">
                  {selectedPlayersList.length} of {players.length} selected
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {selectedPlayers.size === players.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No players available</p>
              <p className="text-gray-400 text-sm">Add players first to start generating matches</p>
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

      {/* Session Controls */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Session Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Session Duration</label>
              <div className="relative">
                <input
                  type="number"
                  min={30}
                  max={300}
                  value={sessionMinutes}
                  onChange={e => setSessionMinutes(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">min</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Match Duration</label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={matchDuration}
                  onChange={e => setMatchDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">min</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-center text-white">
              <p className="text-sm font-medium opacity-90">Total Matches</p>
              <p className="text-2xl font-bold">{Math.floor(sessionMinutes / matchDuration)}</p>
            </div>
          </div>
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
                  At least 4 players must be selected to generate a session. 
                  Currently have <span className="font-semibold">{selectedPlayersList.length}</span> players selected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Progress */}
      {sessionMatches.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Session Progress</h3>
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {sessionMatches.filter(m => m.winner).length} of {sessionMatches.length} completed
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(sessionMatches.filter(m => m.winner).length / sessionMatches.length) * 100}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              {sessionMatches.map((match) => {
                
                return (
                  <div key={match.id} className="relative">
                      <MatchCard 
                        match={match} 
                        variant="compact" 
                        showActions={true}
                        showScores={true}
                        className={''}
                      />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 