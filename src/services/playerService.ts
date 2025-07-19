import { supabase } from '../lib/supabase';
import type { Player, Gender } from '../types';

export interface CreatePlayerData {
  name: string;
  avatar_url?: string;
  gender: Gender;
  score: number;
}

export interface UpdatePlayerData {
  name?: string;
  avatar_url?: string;
  gender?: Gender;
  score?: number;
}

export const playerService = {
  // Fetch all players
  async getPlayers(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  // Fetch players ordered by score (for matchmaking)
  async getPlayersByScore(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('score', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching players by score:', error);
      throw error;
    }
  },

  // Create a new player
  async createPlayer(playerData: CreatePlayerData): Promise<Player> {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            name: playerData.name,
            avatar_url: playerData.avatar_url || '',
            score: playerData.score, 
            gender: playerData.gender,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  // Delete a player
  async deletePlayer(playerId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },

  // Update player score
  async updatePlayerScore(playerId: string, scoreChange: number): Promise<void> {
    try {
      // First get current score
      const { data: currentPlayer, error: fetchError } = await supabase
        .from('players')
        .select('score')
        .eq('id', playerId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new score with minimum of 0.0 and maximum of 10.0
      const newScore = Math.max(Math.min((currentPlayer.score || 5.0) + scoreChange, 10.0), 0.0);

      const { error } = await supabase
        .from('players')
        .update({ score: newScore })
        .eq('id', playerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating player score:', error);
      throw error;
    }
  },

  // Update player information
  async updatePlayer(playerId: string, playerData: UpdatePlayerData): Promise<Player> {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  // Get player by ID
  async getPlayerById(playerId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching player by ID:', error);
      throw error;
    }
  }
}; 