export const MatchWeights = {
  balance: 1,               // HIGHEST priority - team balance (score difference)
  fatigue: 0.5,               // LOW priority - fatigue penalty
  noRest: 0.3,                // LOW priority - no rest between matches
  fatigueFactorMale: 0.2,     // fatigue multiplier for male
  fatigueFactorFemale: 0.3,   // fatigue multiplier for female
  noRestPenalty: 1.0          // penalty if player played in previous match
}; 