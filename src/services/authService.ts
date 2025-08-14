import { supabase } from '../lib/supabase';
import type { AuthResponse, User } from '../types';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  // Set secure cookie with proper flags
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const authService = {
  // Request verification code
  async requestCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await supabase.functions.invoke('authentication', {
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
      const res = await supabase.functions.invoke('authentication', {
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
    const token = getCookie('auth_token');
    return !!token;
  },

  // Get current user from token
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = getCookie('auth_token');
      if (!token) return null;

      const res = await supabase.functions.invoke('authentication', {
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
    deleteCookie('auth_token');
    deleteCookie('user');
    window.location.href = '/login';
  },

  // Store auth data
  storeAuth(token: string, user: User): void {
    setCookie('auth_token', token, 30); // 30 days
    setCookie('user', JSON.stringify(user), 30);
  }
};