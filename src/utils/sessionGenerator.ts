import type { Player, UIMatch } from '../types';
import { MatchWeights } from './matchWeights';

export interface InternalPlayer extends Player {
  matchesPlayed: number;
  lastPlayed: number;
}

export interface SessionMatch {
  matchNumber: number;
  team1: InternalPlayer[];
  team2: InternalPlayer[];
}

function clonePlayers(players: Player[]): InternalPlayer[] {
  return players.map(p => ({ ...p, matchesPlayed: 0, lastPlayed: -1 }));
}

function getCombinations<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  const combine = (start: number, combo: T[]) => {
    if (combo.length === size) {
      result.push(combo);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combine(i + 1, combo.concat([arr[i]]));
    }
  };
  combine(0, []);
  return result;
}

function splitTeams(players: InternalPlayer[]): [InternalPlayer[], InternalPlayer[]][] {
  const [a, b, c, d] = players;
  return [
    [[a, b], [c, d]],
    [[a, c], [b, d]],
    [[a, d], [b, c]]
  ];
}

function scoreMatch(team1: InternalPlayer[], team2: InternalPlayer[], matchIndex: number): number {
  const total1 = team1.reduce((sum, p) => sum + p.score, 0);
  const total2 = team2.reduce((sum, p) => sum + p.score, 0);
  const scoreDiff = Math.abs(total1 - total2);

  const fatiguePenalty = [...team1, ...team2].reduce((penalty, p) => {
    const fatigueFactor = p.gender === 'female' ? MatchWeights.fatigueFactorFemale : MatchWeights.fatigueFactorMale;
    return penalty + p.matchesPlayed * fatigueFactor;
  }, 0);

  const noRestPenalty = [...team1, ...team2].reduce((penalty, p) => {
    return penalty + (p.lastPlayed === matchIndex - 1 ? MatchWeights.noRestPenalty : 0);
  }, 0);

  return (
    MatchWeights.balance * scoreDiff +
    MatchWeights.fatigue * fatiguePenalty +
    MatchWeights.noRest * noRestPenalty
  );
}

export function generateSession(
  rawPlayers: Player[],
  sessionMinutes = 120,
  matchDurationMinutes = 15
): SessionMatch[] {
  if (rawPlayers.length < 4) {
    return [];
  }

  const players = clonePlayers(rawPlayers);
  const matches: SessionMatch[] = [];
  const totalMatches = Math.floor(sessionMinutes / matchDurationMinutes);

  for (let matchIndex = 0; matchIndex < totalMatches; matchIndex++) {
    const candidateFours = getCombinations(players, 4);
    let bestMatch = null;
    let bestScore = Infinity;

    for (const four of candidateFours) {
      const teamPairs = splitTeams(four);
      for (const [team1, team2] of teamPairs) {
        const matchScore = scoreMatch(team1, team2, matchIndex);
        if (matchScore < bestScore) {
          bestScore = matchScore;
          bestMatch = { team1, team2 };
        }
      }
    }

    if (!bestMatch) break;

    // Update player stats
    for (const p of [...bestMatch.team1, ...bestMatch.team2]) {
      p.matchesPlayed++;
      p.lastPlayed = matchIndex;
    }

    matches.push({ 
      matchNumber: matchIndex + 1, 
      team1: bestMatch.team1, 
      team2: bestMatch.team2 
    });
  }

  return matches;
}

// Helper function to convert SessionMatch to UIMatch format
export function convertSessionMatchToUIMatch(
  sessionMatch: SessionMatch, 
  baseId: string
): UIMatch {
  return {
    id: `${baseId}-${sessionMatch.matchNumber}`,
    team1: {
      id: `team1-${baseId}-${sessionMatch.matchNumber}`,
      player1: sessionMatch.team1[0],
      player2: sessionMatch.team1[1],
      totalScore: sessionMatch.team1[0].score + sessionMatch.team1[1].score,
    },
    team2: {
      id: `team2-${baseId}-${sessionMatch.matchNumber}`,
      player1: sessionMatch.team2[0],
      player2: sessionMatch.team2[1],
      totalScore: sessionMatch.team2[0].score + sessionMatch.team2[1].score,
    },
    team1Score: 0,
    team2Score: 0,
    winner: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
} 