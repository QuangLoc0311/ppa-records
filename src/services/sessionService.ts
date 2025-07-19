import { supabase } from '../lib/supabase';
import type { Session, UISession, CreateSessionData, SessionStatus, Player } from '../types';

export const sessionService = {
  // Fetch all sessions
  async getSessions(): Promise<Session[]> {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Fetch session by ID with matches
  async getSessionById(sessionId: string): Promise<UISession | null> {
    try {
      // Get session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      // Get matches for this session
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          match_players (
            *,
            players (*)
          )
        `)
        .eq('session_id', sessionId)
        .order('match_number', { ascending: true });

      if (matchesError) throw matchesError;

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
      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert([
          {
            name: sessionData.name,
            session_duration_minutes: sessionData.sessionDurationMinutes,
            match_duration_minutes: sessionData.matchDurationMinutes,
            status: 'draft',
          }
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create matches
      const matchInserts = sessionData.matches.map((_match, index) => ({
        session_id: session.id,
        match_number: index + 1,
        status: 'scheduled',
      }));

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .insert(matchInserts)
        .select();

      if (matchesError) throw matchesError;

      // Create match players
      const matchPlayerInserts = [];
      for (let i = 0; i < sessionData.matches.length; i++) {
        const match = sessionData.matches[i];
        const matchId = matches[i].id;

        // Team 1 players
        matchPlayerInserts.push({
          match_id: matchId,
          player_id: match.team1.player1.id,
          team: 1,
        });
        matchPlayerInserts.push({
          match_id: matchId,
          player_id: match.team1.player2.id,
          team: 1,
        });

        // Team 2 players
        matchPlayerInserts.push({
          match_id: matchId,
          player_id: match.team2.player1.id,
          team: 2,
        });
        matchPlayerInserts.push({
          match_id: matchId,
          player_id: match.team2.player2.id,
          team: 2,
        });
      }

      const { error: matchPlayersError } = await supabase
        .from('match_players')
        .insert(matchPlayerInserts);

      if (matchPlayersError) throw matchPlayersError;

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  },

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
}; 