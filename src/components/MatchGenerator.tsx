import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { PlayerSelection } from './PlayerSelection';
import { SessionConfiguration } from './SessionConfiguration';
import { SessionPreview } from './SessionPreview';
import { SessionProgress } from './SessionProgress';
import type { Player, UIMatch } from '../types';
import { playerService, matchService, scoreService, sessionService } from '../services';
import { generateSession, convertSessionMatchToUIMatch } from '../utils/sessionGenerator';

export function MatchGenerator() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [sessionMatches, setSessionMatches] = useState<UIMatch[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(120);
  const [matchDuration, setMatchDuration] = useState(15);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null);
  const [showGeneratedMatches, setShowGeneratedMatches] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    try {
      // Fetch all sessions and find the one with status 'in_progress'
      const sessions = await sessionService.getSessions();
      const activeSession = sessions.find(session => session.status === 'in_progress');
      
      if (activeSession) {
        // Load the active session with its matches
        const sessionWithMatches = await sessionService.getSessionById(activeSession.id);
        if (sessionWithMatches) {
          setSessionMatches(sessionWithMatches.matches);
          setSessionMinutes(sessionWithMatches.sessionDurationMinutes);
          setMatchDuration(sessionWithMatches.matchDurationMinutes);
          setCurrentSessionId(activeSession.id);
          setShowGeneratedMatches(true);
          
          // Find the current match index (first uncompleted match)
          const currentMatchIdx = sessionWithMatches.matches.findIndex(match => !match.winner);
          setCurrentMatchIndex(currentMatchIdx !== -1 ? currentMatchIdx : null);
          
          // Auto-select players participating in this session
          const sessionPlayers = new Set<string>();
          sessionWithMatches.matches.forEach(match => {
            sessionPlayers.add(match.team1.player1.id);
            sessionPlayers.add(match.team1.player2.id);
            sessionPlayers.add(match.team2.player1.id);
            sessionPlayers.add(match.team2.player2.id);
          });
          setSelectedPlayers(sessionPlayers);
        }
      }
    } catch (error) {
      console.error('Error loading current session:', error);
    }
  };

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
      setShowGeneratedMatches(true);
      setCurrentMatchIndex(null);
    }, 500);
  };

  const handleActivateSession = async () => {
    if (sessionMatches.length === 0) return;

    setIsActivating(true);
    try {
      // Create session with matches
      const session = await sessionService.createSession({
        name: `Session ${new Date().toLocaleDateString()}`,
        groupId: "",
        sessionDurationMinutes: sessionMinutes,
        matchDurationMinutes: matchDuration,
        matches: sessionMatches.map(match => ({
          matchNumber: match.matchNumber,
          team1: match.team1,
          team2: match.team2,
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: 'scheduled' as const,
        })),
      });

      // Update session status to in_progress
      await sessionService.updateSessionStatus(session.id, 'in_progress');

      // Fetch the session with real match IDs to update local state
      const sessionWithRealIds = await sessionService.getSessionById(session.id);
      
      if (sessionWithRealIds) {
        // Update local state with matches that have real database IDs
        setSessionMatches(sessionWithRealIds.matches);
        setCurrentMatchIndex(0);
      }

      alert('Session activated successfully! You can now start playing matches.');
    } catch (error) {
      console.error('Error activating session:', error);
      alert('Failed to activate session. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleRegenerateSession = () => {
    setShowGeneratedMatches(false);
    setSessionMatches([]);
    setCurrentMatchIndex(null);
    
    // Add a small delay to ensure state is cleared before regenerating
    setTimeout(() => {
      const selectedPlayersList = getSelectedPlayersList();
      const matches = generateSession(selectedPlayersList, sessionMinutes, matchDuration);
      setSessionMatches(matches.map(m => convertSessionMatchToUIMatch(m, `session-${Date.now()}`)));
      setIsGenerating(false);
      setShowGeneratedMatches(true);
      setCurrentMatchIndex(null);
    }, 100);
  };

  const handleSaveMatchResult = async (match: UIMatch, team1Score: number, team2Score: number) => {
    try {
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
          status: 'completed' as const,
        };
        setSessionMatches(updatedMatches);
      }

      // Move to next match or finish session
      if (currentMatchIndex !== null && currentMatchIndex < sessionMatches.length - 1) {
        setCurrentMatchIndex(currentMatchIndex + 1);
      } else {
        setCurrentMatchIndex(null);
        // Update session status to completed if all matches are done
        const completedMatches = updatedMatches.filter(m => m.winner);
        if (completedMatches.length === sessionMatches.length && currentSessionId) {
          // Update session status to completed
          await sessionService.updateSessionStatus(currentSessionId, 'completed');
          // Session is complete
          alert('Session completed! All matches have been played.');
        }
      }

      // Refresh players to get updated scores
      fetchPlayers();
    } catch (error) {
      console.error('Error saving match result:', error);
    }
  };

  const getParticipantSummary = () => {
    const selectedPlayersList = getSelectedPlayersList();
    const participantStats = selectedPlayersList.map(player => {
      const matchesPlayed = sessionMatches.filter(match => 
        match.team1.player1.id === player.id ||
        match.team1.player2.id === player.id ||
        match.team2.player1.id === player.id ||
        match.team2.player2.id === player.id
      ).length;
      
      return { player, matchesPlayed };
    });

    return participantStats.sort((a, b) => b.matchesPlayed - a.matchesPlayed);
  };

  const selectedPlayersList = getSelectedPlayersList();
  const participantSummary = getParticipantSummary();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Session Planner</h2>
          <p className="text-gray-600 mt-1">Plan and play a complete session with AI-powered matchmaking</p>
        </div>
      </div>

      {/* Player Selection */}
      <PlayerSelection
        players={players}
        selectedPlayers={selectedPlayers}
        onPlayerToggle={handlePlayerToggle}
        onSelectAll={handleSelectAll}
      />

      {/* Session Configuration */}
      <SessionConfiguration
        sessionMinutes={sessionMinutes}
        matchDuration={matchDuration}
        onSessionMinutesChange={setSessionMinutes}
        onMatchDurationChange={setMatchDuration}
        onGenerateSession={handleGenerateSession}
        isGenerating={isGenerating}
        showGenerateButton={!showGeneratedMatches}
        disabled={selectedPlayersList.length < 4}
      />

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

      {/* Generated Session Preview */}
      {showGeneratedMatches && sessionMatches.length > 0 && currentMatchIndex === null && (
        <SessionPreview
          sessionMatches={sessionMatches}
          participantSummary={participantSummary}
          onActivateSession={handleActivateSession}
          onRegenerateSession={handleRegenerateSession}
          isActivating={isActivating}
        />
      )}

      {/* Active Session Progress */}
      {sessionMatches.length > 0 && currentMatchIndex !== null && (
        <SessionProgress
          sessionMatches={sessionMatches}
          onSaveMatchResult={handleSaveMatchResult}
        />
      )}
    </div>
  );
} 