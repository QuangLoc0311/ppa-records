import { supabase } from '../lib/supabase';
import type { UIMatch } from '../types';
import { transformMatchesToUI } from '../utils/matchUtils';
import type { Player } from '../types';

interface MatchPlayerData {
  player_id: string;
  team: number;
  players: Player;
}

interface DatabaseMatch {
  id: string;
  created_at: string;
  team1_score?: number;
  team2_score?: number;
  match_players: MatchPlayerData[];
}

export interface CreateMatchData {
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
}

export interface UpdateMatchResultData {
  matchId: string;
  team1Score: number;
  team2Score: number;
}

export const matchService = {
  // Fetch recent matches
  async getRecentMatches(limit: number = 5): Promise<UIMatch[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_players!inner(
            player_id,
            team,
            players(*)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      return transformMatchesToUI(data as DatabaseMatch[] || []);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      throw error;
    }
  },

  // Fetch active matches (no scores yet)
  async getActiveMatches(): Promise<UIMatch[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_players!inner(
            player_id,
            team,
            players(*)
          )
        `)
        .is('team1_score', null)
        .is('team2_score', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return transformMatchesToUI(data as DatabaseMatch[] || []);
    } catch (error) {
      console.error('Error fetching active matches:', error);
      throw error;
    }
  },

  // Create a new match
  async createMatch(matchData: CreateMatchData): Promise<void> {
    try {
      // First create the match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert([{}])
        .select()
        .single();

      if (matchError) throw matchError;

      // Then create the match_players relationships
      const matchPlayers = [
        { match_id: match.id, player_id: matchData.team1Player1Id, team: 1 },
        { match_id: match.id, player_id: matchData.team1Player2Id, team: 1 },
        { match_id: match.id, player_id: matchData.team2Player1Id, team: 2 },
        { match_id: match.id, player_id: matchData.team2Player2Id, team: 2 },
      ];

      const { error: playersError } = await supabase
        .from('match_players')
        .insert(matchPlayers);

      if (playersError) throw playersError;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Update match result
  async updateMatchResult(resultData: UpdateMatchResultData): Promise<void> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          team1_score: resultData.team1Score,
          team2_score: resultData.team2Score,
        })
        .eq('id', resultData.matchId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating match result:', error);
      throw error;
    }
  },

  // Get match by ID
  async getMatchById(matchId: string): Promise<UIMatch | null> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_players!inner(
            player_id,
            team,
            players(*)
          )
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;
      
      if (!data) return null;

      const uiMatches = transformMatchesToUI([data as DatabaseMatch]);
      return uiMatches[0];
    } catch (error) {
      console.error('Error fetching match by ID:', error);
      throw error;
    }
  },

  // Get match history for a player
  async getPlayerMatchHistory(playerId: string): Promise<UIMatch[]> {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          match_players!inner(
            player_id,
            team,
            players(*)
          )
        `)
        .not('team1_score', 'is', null)
        .not('team2_score', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter matches where the player participated
      const playerMatches = (data as DatabaseMatch[])?.filter(match => 
        match.match_players.some((mp: MatchPlayerData) => mp.player_id === playerId)
      ) || [];
      
      return transformMatchesToUI(playerMatches);
    } catch (error) {
      console.error('Error fetching player match history:', error);
      throw error;
    }
  },
}; 