import { supabase } from '../lib/supabase';
import type { Group, CreateGroupData, UpdateGroupData, GroupWithPlayers } from '../types';

export const groupService = {
  // Get all groups for current user
  async getGroups(): Promise<Group[]> {
    try {
      const res = await supabase.functions.invoke('groups', {
        body: { action: 'getGroups' }
      });
      return res.data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // Create a new group
  async createGroup(groupData: CreateGroupData): Promise<Group> {
    try {
      const res = await supabase.functions.invoke('groups', {
        body: { action: 'createGroup', payload: groupData }
      });
      return res.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Update group
  async updateGroup(groupId: string, updates: UpdateGroupData): Promise<Group> {
    try {
      const res = await supabase.functions.invoke('groups', {
        body: { action: 'updateGroup', payload: { groupId, updates } }
      });
      return res.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  // Delete group (will cascade delete players and sessions)
  async deleteGroup(groupId: string): Promise<void> {
    try {
      await supabase.functions.invoke('groups', {
        body: { action: 'deleteGroup', payload: { groupId } }
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
};