export type Gender = 'male' | 'female';

export interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  gender: Gender;
  score: number; // float in database
}

export interface MatchPlayer {
  match_id: string;
  player_id: string;
  team: 1 | 2;
}

export interface Match {
  id: string;
  created_at: string;
  team1_score?: number;
  team2_score?: number;
  players?: MatchPlayer[];
}

export interface MatchWithPlayers extends Match {
  players: MatchPlayer[];
  playerDetails?: Player[];
}

// Helper interfaces for the UI
export interface Team {
  id: string;
  player1: Player;
  player2: Player;
  totalScore: number;
}

export interface UIMatch {
  id: string;
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  winner: 'team1' | 'team2' | null;
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  matchId: string;
  team1Score: number;
  team2Score: number;
} 