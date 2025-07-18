import type { Player, UIMatch } from '../types';
import { calculateTeamBalance, areTeamsBalanced } from './scoreUtils';
import { getRecentTeamPairings, isTeamPairingRecent } from './matchUtils';

export interface Team {
  id: string;
  player1: Player;
  player2: Player;
  totalScore: number;
}

export interface BalancedTeams {
  team1: Team;
  team2: Team;
  balanceScore: number;
}

// Generate all possible team combinations from a list of players
export function generateTeamCombinations(players: Player[]): Team[] {
  const teams: Team[] = [];
  
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const team: Team = {
        id: `team-${players[i].id}-${players[j].id}`,
        player1: players[i],
        player2: players[j],
        totalScore: players[i].score + players[j].score,
      };
      teams.push(team);
    }
  }
  
  return teams;
}

// Find the most balanced team combination
export function findBalancedTeams(
  players: Player[], 
  recentMatches: UIMatch[] = []
): BalancedTeams | null {
  if (players.length < 4) return null;
  
  const teams = generateTeamCombinations(players);
  const recentPairings = getRecentTeamPairings(recentMatches);
  
  let bestCombination: BalancedTeams | null = null;
  let bestBalanceScore = Infinity;
  
  // Try all possible team combinations
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const team1 = teams[i];
      const team2 = teams[j];
      
      // Check if teams share any players
      const team1PlayerIds = [team1.player1.id, team1.player2.id];
      const team2PlayerIds = [team2.player1.id, team2.player2.id];
      
      if (team1PlayerIds.some(id => team2PlayerIds.includes(id))) {
        continue; // Skip if teams share players
      }
      
      // Check for recent pairings
      const team1Recent = isTeamPairingRecent(team1.player1.id, team1.player2.id, recentPairings);
      const team2Recent = isTeamPairingRecent(team2.player1.id, team2.player2.id, recentPairings);
      
      if (team1Recent || team2Recent) {
        continue; // Skip if either team was recently paired
      }
      
      const balanceScore = calculateTeamBalance(team1.totalScore, team2.totalScore);
      
      if (balanceScore < bestBalanceScore) {
        bestBalanceScore = balanceScore;
        bestCombination = { team1, team2, balanceScore };
      }
    }
  }
  
  return bestCombination;
}

// Generate balanced teams with fallback options
export function generateBalancedTeams(
  players: Player[], 
  recentMatches: UIMatch[] = []
): { team1: Team; team2: Team; isBalanced: boolean } | null {
  if (players.length < 4) return null;
  
  // First try to find perfectly balanced teams
  const balancedTeams = findBalancedTeams(players, recentMatches);
  
  if (balancedTeams && areTeamsBalanced(balancedTeams.team1.totalScore, balancedTeams.team2.totalScore)) {
    return {
      team1: balancedTeams.team1,
      team2: balancedTeams.team2,
      isBalanced: true,
    };
  }
  
  // If no balanced teams found, return the best available combination
  if (balancedTeams) {
    return {
      team1: balancedTeams.team1,
      team2: balancedTeams.team2,
      isBalanced: false,
    };
  }
  
  // Fallback: create teams without considering recent pairings
  const fallbackTeams = findBalancedTeams(players, []);
  if (fallbackTeams) {
    return {
      team1: fallbackTeams.team1,
      team2: fallbackTeams.team2,
      isBalanced: areTeamsBalanced(fallbackTeams.team1.totalScore, fallbackTeams.team2.totalScore),
    };
  }
  
  return null;
}

// Shuffle array in place (Fisher-Yates algorithm)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random teams (for testing or when no balanced teams can be found)
export function generateRandomTeams(players: Player[]): { team1: Team; team2: Team } | null {
  if (players.length < 4) return null;
  
  const shuffledPlayers = shuffleArray(players);
  
  const team1: Team = {
    id: `team-${shuffledPlayers[0].id}-${shuffledPlayers[1].id}`,
    player1: shuffledPlayers[0],
    player2: shuffledPlayers[1],
    totalScore: shuffledPlayers[0].score + shuffledPlayers[1].score,
  };
  
  const team2: Team = {
    id: `team-${shuffledPlayers[2].id}-${shuffledPlayers[3].id}`,
    player1: shuffledPlayers[2],
    player2: shuffledPlayers[3],
    totalScore: shuffledPlayers[2].score + shuffledPlayers[3].score,
  };
  
  return { team1, team2 };
} 