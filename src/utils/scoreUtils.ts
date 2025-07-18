import type { UIMatch } from '../types';

// Calculate ELO-like score changes for a match (adjusted for 0-10 range)
export function calculateScoreChanges(
  match: UIMatch, 
  team1Score: number, 
  team2Score: number, 
  winner: 'team1' | 'team2'
): { playerId: string; scoreChange: number }[] {
  const kFactor = 0.5; // ELO rating change factor (adjusted for 0-10 range)
  const scoreDifference = Math.abs(team1Score - team2Score);
  
  // Calculate expected win probability based on team scores
  const team1Expected = 1 / (1 + Math.pow(10, (match.team2.totalScore - match.team1.totalScore) / 2));
  const team2Expected = 1 - team1Expected;
  
  // Calculate actual result (1 for win, 0 for loss)
  const team1Actual = winner === 'team1' ? 1 : 0;
  const team2Actual = winner === 'team2' ? 1 : 0;
  
  // Calculate score changes
  const team1ScoreChange = Math.round((kFactor * (team1Actual - team1Expected)) * 10) / 10;
  const team2ScoreChange = Math.round((kFactor * (team2Actual - team2Expected)) * 10) / 10;
  
  // Apply bonus for close matches
  const closeMatchBonus = scoreDifference <= 2 ? 0.1 : 0;
  
  return [
    { playerId: match.team1.player1.id, scoreChange: team1ScoreChange + closeMatchBonus },
    { playerId: match.team1.player2.id, scoreChange: team1ScoreChange + closeMatchBonus },
    { playerId: match.team2.player1.id, scoreChange: team2ScoreChange + closeMatchBonus },
    { playerId: match.team2.player2.id, scoreChange: team2ScoreChange + closeMatchBonus },
  ];
}

// Calculate team balance score (lower is more balanced)
export function calculateTeamBalance(team1Score: number, team2Score: number): number {
  return Math.abs(team1Score - team2Score);
}

// Check if teams are reasonably balanced (adjusted for 0-10 range)
export function areTeamsBalanced(team1Score: number, team2Score: number, threshold: number = 2.0): boolean {
  return calculateTeamBalance(team1Score, team2Score) <= threshold;
}

// Determine match winner based on scores
export function determineWinner(team1Score: number, team2Score: number): 'team1' | 'team2' | null {
  if (team1Score === team2Score) return null;
  return team1Score > team2Score ? 'team1' : 'team2';
} 