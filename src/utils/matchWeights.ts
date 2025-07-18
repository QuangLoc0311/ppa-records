export const MatchWeights = {
  balance: 1,                 // weight for score balance between teams
  fatigue: 2,                 // weight for fatigue penalty
  noRest: 1,                 // weight for no rest between matches
  fatigueFactorMale: 1.0,    // fatigue multiplier for male
  fatigueFactorFemale: 1.2,  // fatigue multiplier for female
  noRestPenalty: 5           // fixed penalty if player played in previous match
}; 