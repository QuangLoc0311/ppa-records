import type { UIMatch } from '../types';

// Calculate ELO-like score changes for a match
export function calculateScoreChanges(
  match: UIMatch, 
  team1Score: number, 
  team2Score: number, 
  winner: 'team1' | 'team2'
): { playerId: string; scoreChange: number }[] {
  const kFactor = 32; // ELO rating change factor
  const scoreDifference = Math.abs(team1Score - team2Score);
  
  // Calculate expected win probability based on team scores
  const team1Expected = 1 / (1 + Math.pow(10, (match.team2.totalScore - match.team1.totalScore) / 400));
  const team2Expected = 1 - team1Expected;
  
  // Calculate actual result (1 for win, 0 for loss)
  const team1Actual = winner === 'team1' ? 1 : 0;
  const team2Actual = winner === 'team2' ? 1 : 0;
  
  // Calculate score changes
  const team1ScoreChange = Math.round(kFactor * (team1Actual - team1Expected));
  const team2ScoreChange = Math.round(kFactor * (team2Actual - team2Expected));
  
  // Apply bonus for close matches
  const closeMatchBonus = scoreDifference <= 2 ? 5 : 0;
  
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

// Check if teams are reasonably balanced
export function areTeamsBalanced(team1Score: number, team2Score: number, threshold: number = 200): boolean {
  return calculateTeamBalance(team1Score, team2Score) <= threshold;
}

// Determine match winner based on scores
export function determineWinner(team1Score: number, team2Score: number): 'team1' | 'team2' | null {
  if (team1Score === team2Score) return null;
  return team1Score > team2Score ? 'team1' : 'team2';
} 