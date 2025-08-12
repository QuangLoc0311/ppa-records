import { supabase } from '../lib/supabase';
import type { AuthResponse, User } from '../types';

export const authService = {
  // Request verification code
  async requestCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await supabase.functions.invoke('auth', {
        body: { action: 'requestCode', payload: { email } }
      });
      
      if (res.error) throw new Error(res.error);
      
      return { 
        success: true, 
        message: 'Verification code sent to your email!' 
      };
    } catch (error) {
      console.error('Error requesting code:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to send code' 
      };
    }
  },

  // Verify code and get user
  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    try {
      const res = await supabase.functions.invoke('auth', {
        body: { action: 'verifyCode', payload: { email, code } }
      });
      
      if (res.error) throw new Error(res.error);
      
      return res.data;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get current user from token
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const res = await supabase.functions.invoke('auth', {
        body: { action: 'getCurrentUser' },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.error) throw new Error(res.error);
      
      return res.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.logout();
      return null;
    }
  },

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Store auth data
  storeAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};