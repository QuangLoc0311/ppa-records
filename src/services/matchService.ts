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
  session_id: string;
  match_number: number;
  created_at: string;
  team1_score?: number;
  team2_score?: number;
  status: string;
  match_players: MatchPlayerData[];
}

export interface CreateMatchData {
  sessionId: string;
  matchNumber: number;
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
      const { data, error } = await supabase.functions.invoke('matches', {
        body: { action: 'getRecentMatches', payload: { limit } },
      });
      if (error) throw error;
      return transformMatchesToUI((data?.data as DatabaseMatch[]) || []);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
      throw error;
    }
  },

  // Fetch active matches (no scores yet)
  async getActiveMatches(): Promise<UIMatch[]> {
    try {
      const { data, error } = await supabase.functions.invoke('matches', {
        body: { action: 'getActiveMatches' },
      });
      if (error) throw error;
      return transformMatchesToUI((data?.data as DatabaseMatch[]) || []);
    } catch (error) {
      console.error('Error fetching active matches:', error);
      throw error;
    }
  },

  // Create a new match
  async createMatch(matchData: CreateMatchData): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('matches', {
        body: { action: 'createMatch', payload: matchData },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error creating match:', error);
      throw error;
    }
  },

  // Update match result
  async updateMatchResult(resultData: UpdateMatchResultData): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('matches', {
        body: { action: 'updateMatchResult', payload: resultData },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating match result:', error);
      throw error;
    }
  },

  // Get match by ID
  async getMatchById(matchId: string): Promise<UIMatch | null> {
    try {
      const { data, error } = await supabase.functions.invoke('matches', {
        body: { action: 'getMatchById', payload: { matchId } },
      });
      if (error) throw error;
      const record = (data?.data as DatabaseMatch) || null;
      if (!record) return null;
      const uiMatches = transformMatchesToUI([record]);
      return uiMatches[0];
    } catch (error) {
      console.error('Error fetching match by ID:', error);
      throw error;
    }
  },

  // Get match history for a player
  async getPlayerMatchHistory(playerId: string): Promise<UIMatch[]> {
    try {
      const { data, error } = await supabase.functions.invoke('matches', {
        body: { action: 'getPlayerMatchHistory', payload: { playerId } },
      });
      if (error) throw error;
      return transformMatchesToUI((data?.data as DatabaseMatch[]) || []);
    } catch (error) {
      console.error('Error fetching player match history:', error);
      throw error;
    }
  },
}; 