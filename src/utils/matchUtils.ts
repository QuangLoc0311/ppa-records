import type { UIMatch, Player } from '../types';

interface MatchPlayerData {
  player_id: string;
  team: number;
  players: Player;
}

interface DatabaseMatch {
  id: string;
  created_at: string;
  team1_score?: number;
  team2_score?: number;
  match_players: MatchPlayerData[];
}

// Transform database matches to UI format
export function transformMatchesToUI(matches: DatabaseMatch[]): UIMatch[] {
  return matches.map(match => {
    const team1Players = match.match_players
      .filter((mp: MatchPlayerData) => mp.team === 1)
      .map((mp: MatchPlayerData) => mp.players);
    
    const team2Players = match.match_players
      .filter((mp: MatchPlayerData) => mp.team === 2)
      .map((mp: MatchPlayerData) => mp.players);

    const team1Score = team1Players[0]?.score + team1Players[1]?.score || 0;
    const team2Score = team2Players[0]?.score + team2Players[1]?.score || 0;

    const winner = match.team1_score && match.team2_score 
      ? (match.team1_score > match.team2_score ? 'team1' : 'team2')
      : null;

    return {
      id: match.id,
      team1: {
        id: `team1-${match.id}`,
        player1: team1Players[0],
        player2: team1Players[1],
        totalScore: team1Score,
      },
      team2: {
        id: `team2-${match.id}`,
        player1: team2Players[0],
        player2: team2Players[1],
        totalScore: team2Score,
      },
      team1Score: match.team1_score || 0,
      team2Score: match.team2_score || 0,
      winner,
      createdAt: match.created_at,
      updatedAt: match.created_at, // Using created_at as updated_at for now
    };
  });
}

// Filter matches where a specific player participated
export function filterMatchesByPlayer(matches: DatabaseMatch[], playerId: string): DatabaseMatch[] {
  return matches.filter(match => 
    match.match_players.some((mp: MatchPlayerData) => mp.player_id === playerId)
  );
}

// Get recent team pairings to avoid repetition
export function getRecentTeamPairings(matches: UIMatch[]): Set<string> {
  const recentPairings = new Set<string>();
  
  matches.forEach(match => {
    const team1Players = [match.team1.player1.id, match.team1.player2.id].sort();
    const team2Players = [match.team2.player1.id, match.team2.player2.id].sort();
    recentPairings.add(team1Players.join('-'));
    recentPairings.add(team2Players.join('-'));
  });
  
  return recentPairings;
}

// Check if a team pairing was used recently
export function isTeamPairingRecent(
  player1Id: string, 
  player2Id: string, 
  recentPairings: Set<string>
): boolean {
  const pairing = [player1Id, player2Id].sort().join('-');
  return recentPairings.has(pairing);
} 