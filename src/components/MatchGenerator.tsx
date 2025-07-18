import { useState, useEffect } from 'react';
import { Users, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MatchCard } from './MatchCard';
import type { Player, UIMatch } from '../types';
import { playerService } from '../services';
import { generateSession, convertSessionMatchToUIMatch } from '../utils/sessionGenerator';

export function MatchGenerator() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sessionMatches, setSessionMatches] = useState<UIMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [matchDuration, setMatchDuration] = useState(15);

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

  const handleGenerateSession = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const matches = generateSession(players, sessionMinutes, matchDuration);
      setSessionMatches(matches.map(m => convertSessionMatchToUIMatch(m, `session`)));
      setIsGenerating(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">AI Match Session Generator</h2>
        <Button 
          onClick={handleGenerateSession} 
          disabled={isGenerating || players.length < 4}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Session'}
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <label className="text-sm">Session Minutes:
          <input
            type="number"
            min={30}
            max={300}
            value={sessionMinutes}
            onChange={e => setSessionMinutes(Number(e.target.value))}
            className="ml-2 w-20 border rounded px-2 py-1"
          />
        </label>
        <label className="text-sm">Match Duration:
          <input
            type="number"
            min={5}
            max={60}
            value={matchDuration}
            onChange={e => setMatchDuration(Number(e.target.value))}
            className="ml-2 w-20 border rounded px-2 py-1"
          />
        </label>
        <span className="text-gray-500 text-sm">Total Matches: {Math.floor(sessionMinutes / matchDuration)}</span>
      </div>

      {players.length < 4 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Need More Players</h3>
                <p className="text-yellow-700">
                  At least 4 players are required to generate a session. 
                  Currently have {players.length} players.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sessionMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-2">Generated Session Matches</h3>
          {sessionMatches.map(match => (
            <MatchCard key={match.id} match={match} variant="detailed" showActions={false} />
          ))}
        </div>
      )}
    </div>
  );
} 