import { supabase } from '../lib/supabase';
import type { Player, Gender } from '../types';

export interface CreatePlayerData {
  name: string;
  avatar_url?: string;
  gender: Gender;
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
            avatar_url: playerData.avatar_url || 'https://via.placeholder.com/150',
            score: 1000, // Default starting score
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

      // Calculate new score with minimum of 100
      const newScore = Math.max((currentPlayer.score || 1000) + scoreChange, 100);

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