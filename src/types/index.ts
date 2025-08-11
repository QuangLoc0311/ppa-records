export type Gender = 'male' | 'female';

export type SessionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// User interface matching your schema
export interface User {
  id: string;
  username: string;
  display_name?: string;
  email: string;
  created_at: string;
}

// Group interface
export interface Group {
  id: string;
  name: string;
  host_player_id?: string;
  description?: string;
  created_at: string;
}

// Player interface
export interface Player {
  id: string;
  user_id: string;
  group_id: string;
  name: string;
  avatar_url?: string;
  gender: Gender;
  score: number;
  created_at: string;
}

// Session interface
export interface Session {
  id: string;
  group_id: string;
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
  playerId: string;
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
  playerId: string;
  name: string;
  sessionDurationMinutes: number;
  matchDurationMinutes: number;
  matches: Omit<UIMatch, 'id' | 'sessionId' | 'createdAt' | 'updatedAt'>[];
}

// Authentication interfaces
export interface AuthRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
}

// Group management interfaces
export interface CreateGroupData {
  name: string;
  description?: string;
}

export interface UpdateGroupData {
  name?: string;
  description?: string;
}

// Updated player creation data
export interface CreatePlayerData {
  groupId: string;
  name: string;
  avatar_url?: string;
  gender: Gender;
  score: number;
}

// Group with players
export interface GroupWithPlayers extends Group {
  players: Player[];
}

// Player with sessions
export interface PlayerWithSessions extends Player {
  sessions: Session[];
}