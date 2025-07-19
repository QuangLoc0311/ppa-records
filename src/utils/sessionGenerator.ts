import type { Player, UIMatch } from '../types';
import { MatchWeights } from './matchWeights';

export interface InternalPlayer extends Player {
  matchesPlayed: number;
  lastPlayed: number;
  lastTeamPartners: Set<string>; // Track recent team partners
}

export interface SessionMatch {
  matchNumber: number;
  team1: InternalPlayer[];
  team2: InternalPlayer[];
}

function clonePlayers(players: Player[]): InternalPlayer[] {
  return players.map(p => ({ 
    ...p, 
    matchesPlayed: 0, 
    lastPlayed: -1,
    lastTeamPartners: new Set<string>()
  }));
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

  // Consecutive match penalty (HIGHEST priority - must be higher than balance score)
  const totalPlayers = team1.length + team2.length;
  const isSmallPool = totalPlayers <= 6;
  
  const consecutiveMatchPenalty = [...team1, ...team2].reduce((penalty, p) => {
    let consecutiveMatches = 0;
    for (let i = matchIndex - 1; i >= 0; i--) {
      if (p.lastPlayed === i) {
        consecutiveMatches++;
      } else {
        break;
      }
    }
    
    // MUCH higher penalty for consecutive matches - this should override balance
    const maxConsecutive = isSmallPool ? 3 : 2;
    const penaltyMultiplier = isSmallPool ? 1000 : 2000; // Much higher than balance score (100)
    
    return penalty + (consecutiveMatches >= maxConsecutive ? consecutiveMatches * penaltyMultiplier : 0);
  }, 0);

  // Team balance is SECOND priority (lower than consecutive match penalty)
  const balanceScore = scoreDiff * 100;

  // Secondary factors (much lower weights)
  const fatiguePenalty = [...team1, ...team2].reduce((penalty, p) => {
    const fatigueFactor = p.gender === 'female' ? MatchWeights.fatigueFactorFemale : MatchWeights.fatigueFactorMale;
    return penalty + p.matchesPlayed * fatigueFactor;
  }, 0) * MatchWeights.fatigue;

  const noRestPenalty = [...team1, ...team2].reduce((penalty, p) => {
    return penalty + (p.lastPlayed === matchIndex - 1 ? MatchWeights.noRestPenalty : 0);
  }, 0) * MatchWeights.noRest;

  // Team repetition penalty (moderate weight)
  const teamRepetitionPenalty = [...team1, ...team2].reduce((penalty, p) => {
    const teamPartners = team1.includes(p) ? team1 : team2;
    const repetitionCount = teamPartners
      .filter(partner => partner.id !== p.id)
      .filter(partner => p.lastTeamPartners.has(partner.id))
      .length;
    return penalty + repetitionCount * 10;
  }, 0);

  return consecutiveMatchPenalty + balanceScore + fatiguePenalty + noRestPenalty + teamRepetitionPenalty;
}

function getAvailablePlayers(players: InternalPlayer[], matchIndex: number): InternalPlayer[] {
  // Count total players
  const totalPlayers = players.length;
  
  // For small player pools (5-6 players), we need to relax rest rules
  const isSmallPool = totalPlayers <= 6;
  
  // Calculate consecutive matches for each player
  const playerConsecutiveMatches = players.map(p => {
    let consecutiveMatches = 0;
    for (let i = matchIndex - 1; i >= 0; i--) {
      if (p.lastPlayed === i) {
        consecutiveMatches++;
      } else {
        break;
      }
    }
    return { player: p, consecutiveMatches };
  });

  // Sort players by priority for selection
  const sortedPlayers = playerConsecutiveMatches.sort((a, b) => {
    // 1. Players who haven't played at all (highest priority)
    if (a.player.matchesPlayed === 0 && b.player.matchesPlayed > 0) return -1;
    if (b.player.matchesPlayed === 0 && a.player.matchesPlayed > 0) return 1;
    
    // 2. Players with fewer consecutive matches
    if (a.consecutiveMatches !== b.consecutiveMatches) {
      return a.consecutiveMatches - b.consecutiveMatches;
    }
    
    // 3. Players with fewer total matches
    if (a.player.matchesPlayed !== b.player.matchesPlayed) {
      return a.player.matchesPlayed - b.player.matchesPlayed;
    }
    
    // 4. Players who played longer ago (force rotation)
    return a.player.lastPlayed - b.player.lastPlayed;
  });

  // For small pools, implement forced rotation
  if (isSmallPool) {
    // If this is not the first match, try to exclude players from the previous match
    if (matchIndex > 0) {
      const previousMatchPlayers = players.filter(p => p.lastPlayed === matchIndex - 1);
      const otherPlayers = sortedPlayers.filter(p => !previousMatchPlayers.includes(p.player));
      
      // If we have enough other players, use them
      if (otherPlayers.length >= 4) {
        console.log(`Forcing rotation: excluding previous match players [${previousMatchPlayers.map(p => p.name).join(', ')}]`);
        return otherPlayers.slice(0, 4).map(p => p.player);
      }
    }
    
    // Take the first 4 players, but ensure we have at least 4
    const selectedPlayers = sortedPlayers.slice(0, 4).map(p => p.player);
    
    // If we don't have 4 players, include more
    if (selectedPlayers.length < 4) {
      const remainingPlayers = sortedPlayers
        .slice(4)
        .map(p => p.player)
        .filter(p => !selectedPlayers.includes(p));
      selectedPlayers.push(...remainingPlayers.slice(0, 4 - selectedPlayers.length));
    }
    
    return selectedPlayers;
  } else {
    // For larger pools, be more strict about consecutive matches
    const restedPlayers = sortedPlayers
      .filter(p => p.consecutiveMatches < 2)
      .map(p => p.player);
    
    // If we have enough rested players, use them
    if (restedPlayers.length >= 4) {
      return restedPlayers.slice(0, 4);
    }
    
    // Otherwise, use the best available players
    return sortedPlayers.slice(0, 4).map(p => p.player);
  }
}

function updatePlayerStats(
  team1: InternalPlayer[], 
  team2: InternalPlayer[], 
  matchIndex: number
): void {
  // Update team1 players
  team1.forEach(p => {
    p.matchesPlayed++;
    p.lastPlayed = matchIndex;
    // Add team partners to lastTeamPartners
    team1.forEach(partner => {
      if (partner.id !== p.id) {
        p.lastTeamPartners.add(partner.id);
      }
    });
  });

  // Update team2 players
  team2.forEach(p => {
    p.matchesPlayed++;
    p.lastPlayed = matchIndex;
    // Add team partners to lastTeamPartners
    team2.forEach(partner => {
      if (partner.id !== p.id) {
        p.lastTeamPartners.add(partner.id);
      }
    });
  });
}

export function generateSession(
  rawPlayers: Player[],
  sessionMinutes = 120,
  matchDurationMinutes = 15
): SessionMatch[] {
  if (rawPlayers.length < 4) {
    return [];
  }

  // Shuffle the players to ensure different results each time
  const shuffledPlayers = [...rawPlayers].sort(() => Math.random() - 0.5);
  const players = clonePlayers(shuffledPlayers);
  const matches: SessionMatch[] = [];
  const totalMatches = Math.floor(sessionMinutes / matchDurationMinutes);

  for (let matchIndex = 0; matchIndex < totalMatches; matchIndex++) {
    console.log(`\n--- Match ${matchIndex + 1} ---`);
    
    // Get available players for this match
    const availablePlayers = getAvailablePlayers(players, matchIndex);
    
    console.log('Available players:', availablePlayers.map(p => 
      `${p.name} (matches: ${p.matchesPlayed}, last: ${p.lastPlayed}, consecutive: ${
        (() => {
          let consecutive = 0;
          for (let i = matchIndex - 1; i >= 0; i--) {
            if (p.lastPlayed === i) consecutive++;
            else break;
          }
          return consecutive;
        })()
      })`
    ));

    // If we don't have enough players, try to include rested players
    if (availablePlayers.length < 4) {
      const restedPlayers = players.filter(p => p.lastPlayed < matchIndex);
      if (restedPlayers.length >= 4) {
        availablePlayers.push(...restedPlayers.filter(p => !availablePlayers.includes(p)));
      }
    }

    // If still not enough players, break
    if (availablePlayers.length < 4) {
      console.log(`Not enough players (${availablePlayers.length}), stopping generation`);
      break;
    }

    // Get all possible combinations of 4 players
    const candidateFours = getCombinations(availablePlayers, 4);
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

    console.log(`Selected match: Team1 [${bestMatch.team1.map(p => p.name).join(', ')}] vs Team2 [${bestMatch.team2.map(p => p.name).join(', ')}] (score: ${bestScore})`);

    // Update player stats including team partner tracking
    updatePlayerStats(bestMatch.team1, bestMatch.team2, matchIndex);

    matches.push({ 
      matchNumber: matchIndex + 1, 
      team1: bestMatch.team1, 
      team2: bestMatch.team2 
    });
  }

  console.log('\n=== Final Results ===');
  console.log('Total matches generated:', matches.length);
  console.log('Player participation:');
  players.forEach(p => {
    console.log(`${p.name}: ${p.matchesPlayed} matches`);
  });
  
  return matches;
}

// Helper function to convert SessionMatch to UIMatch format
export function convertSessionMatchToUIMatch(
  sessionMatch: SessionMatch, 
  baseId: string
): UIMatch {
  return {
    id: `${baseId}-${sessionMatch.matchNumber}`,
    sessionId: baseId,
    matchNumber: sessionMatch.matchNumber,
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
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
} 