import type { UIMatch } from '../types';
// import { playerService } from './playerService';
// import { calculateScoreChanges } from '../utils/scoreUtils';

export const scoreService = {
  // Update all player scores after a match
  async updatePlayerScores(
    _match: UIMatch, 
    _team1Score: number, 
    _team2Score: number, 
    _winner: 'team1' | 'team2'
  ): Promise<void> {
    console.log('updatePlayerScores', _match, _team1Score, _team2Score, _winner);
    // const scoreChanges = calculateScoreChanges(match, team1Score, team2Score, winner);
    // // Update all players' scores
    // for (const { playerId, scoreChange } of scoreChanges) {
    //   await playerService.updatePlayerScore(playerId, scoreChange);
    // }
  },
}; 