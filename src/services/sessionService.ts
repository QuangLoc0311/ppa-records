import { supabase } from '../lib/supabase';
import type { Session, UISession, CreateSessionData, SessionStatus, Player } from '../types';

export const sessionService = {
  // Fetch all sessions
  async getSessions(): Promise<Session[]> {
    try {
      const { data, error } = await supabase.functions.invoke('sessions', {
        body: { action: 'getSessions' },
      });
      if (error) throw error;
      return (data?.data as Session[]) || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Fetch session by ID with matches
  async getSessionById(sessionId: string): Promise<UISession | null> {
    try {
      const { data, error } = await supabase.functions.invoke('sessions', {
        body: { action: 'getSessionById', payload: { sessionId } },
      });
      if (error) throw error;
      const session = (data?.session as any) as Session;
      const matches = (data?.matches as any[]) || [];

      // Transform to UI format
      const uiMatches = matches?.map(match => {
        const team1Players = match.match_players
          .filter((mp: { team: number; players: Player }) => mp.team === 1)
          .map((mp: { team: number; players: Player }) => mp.players);
        
        const team2Players = match.match_players
          .filter((mp: { team: number; players: Player }) => mp.team === 2)
          .map((mp: { team: number; players: Player }) => mp.players);

        return {
          id: match.id,
          sessionId: match.session_id,
          matchNumber: match.match_number,
          team1: {
            id: `team1-${match.id}`,
            player1: team1Players[0],
            player2: team1Players[1],
            totalScore: (team1Players[0]?.score || 0) + (team1Players[1]?.score || 0),
          },
          team2: {
            id: `team2-${match.id}`,
            player1: team2Players[0],
            player2: team2Players[1],
            totalScore: (team2Players[0]?.score || 0) + (team2Players[1]?.score || 0),
          },
          team1Score: match.team1_score || 0,
          team2Score: match.team2_score || 0,
          winner: match.team1_score && match.team2_score 
            ? (match.team1_score > match.team2_score ? 'team1' as const : 'team2' as const)
            : null,
          status: match.status,
          createdAt: match.created_at,
          updatedAt: match.created_at,
        };
      }) || [];

      return {
        id: session.id,
        name: session.name,
        status: session.status,
        sessionDurationMinutes: session.session_duration_minutes,
        matchDurationMinutes: session.match_duration_minutes,
        matches: uiMatches,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      };
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw error;
    }
  },

  // Create a new session with matches
  async createSession(sessionData: CreateSessionData): Promise<Session> {
    try {
      const { data, error } = await supabase.functions.invoke('sessions', {
        body: { action: 'createSession', payload: sessionData },
      });
      if (error) throw error;
      return (data?.data as Session)!;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('sessions', {
        body: { action: 'updateSessionStatus', payload: { sessionId, status } },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('sessions', {
        body: { action: 'deleteSession', payload: { sessionId } },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}; 