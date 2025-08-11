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

async function invokePlayers<TResponse>(action: string, payload?: unknown): Promise<TResponse> {
  const { data, error } = await supabase.functions.invoke('players', {
    body: { action, payload },
  });
  if (error) throw error;
  return data as TResponse;
}

export const playerService = {
  // Fetch all players
  async getPlayers(): Promise<Player[]> {
    try {
      const res = await invokePlayers<{ data: Player[] }>('getPlayers');
      return res.data || [];
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  },

  // Fetch players ordered by score (for matchmaking)
  async getPlayersByScore(): Promise<Player[]> {
    try {
      const res = await invokePlayers<{ data: Player[] }>('getPlayersByScore');
      return res.data || [];
    } catch (error) {
      console.error('Error fetching players by score:', error);
      throw error;
    }
  },

  // Create a new player
  async createPlayer(playerData: CreatePlayerData): Promise<Player> {
    try {
      const res = await invokePlayers<{ data: Player }>('createPlayer', playerData);
      return res.data as Player;
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  },

  // Delete a player
  async deletePlayer(playerId: string): Promise<void> {
    try {
      await invokePlayers('deletePlayer', { playerId });
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  },

  // Update player score
  async updatePlayerScore(playerId: string, scoreChange: number): Promise<void> {
    try {
      await invokePlayers('updatePlayerScore', { playerId, scoreChange });
    } catch (error) {
      console.error('Error updating player score:', error);
      throw error;
    }
  },

  // Update player information
  async updatePlayer(playerId: string, playerData: UpdatePlayerData): Promise<Player> {
    try {
      const res = await invokePlayers<{ data: Player }>('updatePlayer', { playerId, updates: playerData });
      return res.data as Player;
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  },

  // Get player by ID
  async getPlayerById(playerId: string): Promise<Player | null> {
    try {
      const res = await invokePlayers<{ data: Player | null }>('getPlayerById', { playerId });
      return res.data ?? null;
    } catch (error) {
      console.error('Error fetching player by ID:', error);
      throw error;
    }
  }
}; 