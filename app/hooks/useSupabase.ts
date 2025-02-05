import { createClient } from '@supabase/supabase-js';
import { MediaItem, Album } from '../types/content';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';

// Access environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Enable realtime subscriptions
supabase.realtime.setAuth(supabaseKey);

export function useSupabase() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };
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

  const createAlbum = async (album: Partial<Album>) => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .insert([album])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating album:', error);
      throw error;
    }
  };

  const getAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching albums:', error);
      throw error;
    }
  };

  const updateAlbum = async (id: string, updates: Partial<Album>) => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating album:', error);
      throw error;
    }
  };

  const deleteAlbum = async (id: string) => {
    try {
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting album:', error);
      throw error;
    }
  };

  const addItemToAlbum = async (albumId: string, itemId: string) => {
    try {
      const { data: album } = await supabase
        .from('albums')
        .select('items')
        .eq('id', albumId)
        .single();

      if (!album) throw new Error('Album not found');

      const items = [...(album.items || []), itemId];
      
      const { data, error } = await supabase
        .from('albums')
        .update({ items })
        .eq('id', albumId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding item to album:', error);
      throw error;
    }
  };

  const removeItemFromAlbum = async (albumId: string, itemId: string) => {
    try {
      const { data: album } = await supabase
        .from('albums')
        .select('items')
        .eq('id', albumId)
        .single();

      if (!album) throw new Error('Album not found');

      const items = (album.items || []).filter((id: string) => id !== itemId);
      
      const { data, error } = await supabase
        .from('albums')
        .update({ items })
        .eq('id', albumId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error removing item from album:', error);
      throw error;
    }
  };

  return {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    uploadMedia,
    saveMediaItem,
    getMediaItems,
    deleteMediaItem,
    updateMediaItem,
    createAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    addItemToAlbum,
    removeItemFromAlbum,
    supabase,
  };
}
