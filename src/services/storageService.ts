import { supabase } from '../lib/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

export const storageService = {
  // Upload image to Supabase Storage
  async uploadImage(file: File, folder: string = 'avatars'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      // Include auth token if available (not required for public function)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${supabaseUrl}/functions/v1/storage?action=upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Failed to upload image');
      }
      const json = await response.json();
      return json.publicUrl as string;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete image from Supabase Storage
  async deleteImage(url: string): Promise<void> {
    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${supabaseUrl}/functions/v1/storage?action=delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ filePath }),
      });
      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Validate file type and size
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Please select a valid image file (JPEG, PNG, or WebP)' 
      };
    }

    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'Image size must be less than 10MB' 
      };
    }

    return { isValid: true };
  }
}; 