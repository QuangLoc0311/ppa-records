export const MatchWeights = {
  balance: 1,                 // weight for score balance between teams
  fatigue: 2,                 // weight for fatigue penalty
  noRest: 1,                 // weight for no rest between matches
  fatigueFactorMale: 0.2,    // fatigue multiplier for male (adjusted for 0-10 range)
  fatigueFactorFemale: 0.3,  // fatigue multiplier for female (adjusted for 0-10 range)
  noRestPenalty: 1.0         // fixed penalty if player played in previous match (adjusted for 0-10 range)
}; 