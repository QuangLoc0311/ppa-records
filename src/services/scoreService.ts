import type { UIMatch } from '../types';
import { playerService } from './playerService';
import { calculateScoreChanges } from '../utils/scoreUtils';

export const scoreService = {
  // Update all player scores after a match
  async updatePlayerScores(
    match: UIMatch, 
    team1Score: number, 
    team2Score: number, 
    winner: 'team1' | 'team2'
  ): Promise<void> {
    const scoreChanges = calculateScoreChanges(match, team1Score, team2Score, winner);
    // Update all players' scores
    for (const { playerId, scoreChange } of scoreChanges) {
      await playerService.updatePlayerScore(playerId, scoreChange);
    }
  },
}; 