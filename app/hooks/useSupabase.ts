import { createClient } from '@supabase/supabase-js';
import { MediaItem } from '../types/content';

// Access environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function useSupabase() {
  const uploadMedia = async (file: any, type: string) => {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      throw error;
    }
  };

  const saveMediaItem = async (item: Partial<MediaItem>) => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving media item:', error);
      throw error;
    }
  };

  const getMediaItems = async (type?: string) => {
    try {
      let query = supabase.from('media_items').select('*');
      
      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching media items:', error);
      throw error;
    }
  };

  const deleteMediaItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('media_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting media item:', error);
      throw error;
    }
  };

  const updateMediaItem = async (id: string, updates: Partial<MediaItem>) => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating media item:', error);
      throw error;
    }
  };

  return {
    uploadMedia,
    saveMediaItem,
    getMediaItems,
    deleteMediaItem,
    updateMediaItem,
  };
}
