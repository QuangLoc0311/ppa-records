export type Gender = 'male' | 'female';

export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Player {
  id: string;
  name: string;
  avatar_url?: string;
  gender: Gender;
  score: number; // float 0-10 with one decimal place
}

export interface Session {
  id: string;
  name: string;
  status: SessionStatus;
  session_duration_minutes: number;
  match_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface MatchPlayer {
  match_id: string;
  player_id: string;
  team: 1 | 2;
}

export interface Match {
  id: string;
  session_id: string;
  match_number: number;
  created_at: string;
  team1_score?: number;
  team2_score?: number;
  status: MatchStatus;
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
  sessionId: string;
  matchNumber: number;
  team1: Team;
  team2: Team;
  team1Score: number;
  team2Score: number;
  winner: 'team1' | 'team2' | null;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UISession {
  id: string;
  name: string;
  status: SessionStatus;
  sessionDurationMinutes: number;
  matchDurationMinutes: number;
  matches: UIMatch[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  matchId: string;
  team1Score: number;
  team2Score: number;
}

export interface CreateSessionData {
  name: string;
  sessionDurationMinutes: number;
  matchDurationMinutes: number;
  matches: Omit<UIMatch, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>[];
} 