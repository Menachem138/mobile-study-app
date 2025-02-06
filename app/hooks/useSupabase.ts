import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { MediaItem, Album } from '../types/content';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// Test connection
supabase.from('users').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection test successful');
    }
  });

// Enable realtime subscriptions
supabase.realtime.setAuth(supabaseAnonKey);

export function useSupabase() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

  // Timer operations
  const createTimer = async (type: string, duration: number) => {
    try {
      const { data, error } = await supabase
        .from('timers')
        .insert([{
          user_id: session?.user?.id,
          type,
          duration,
          started_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating timer:', error);
      throw error;
    }
  };

  const getTimers = async () => {
    try {
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching timers:', error);
      throw error;
    }
  };

  // Task operations
  const createTask = async (title: string, description?: string, dueDate?: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          user_id: session?.user?.id,
          title,
          description,
          due_date: dueDate,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const getTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Course operations
  const createCourse = async (title: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          user_id: session?.user?.id,
          title,
          description,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const getCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  };

  // Journal operations
  const createJournalEntry = async (title: string, content: string, tags?: string[]) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          user_id: session?.user?.id,
          title,
          content,
          tags,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }
  };

  const getJournalEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }
  };

  // Questions & Answers
  const getQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*, answers(*)')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createQuestion = async (question: { title: string; content: string; tags?: string[] }) => {
    const { data, error } = await supabase
      .from('questions')
      .insert([{ ...question, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Tweets
  const getTweets = async () => {
    const { data, error } = await supabase
      .from('tweets')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createTweet = async (tweet: { url: string; tweet_id: string }) => {
    const { data, error } = await supabase
      .from('tweets')
      .insert([{ ...tweet, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // YouTube Videos
  const getYouTubeVideos = async () => {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createYouTubeVideo = async (video: { url: string; title: string; video_id: string; thumbnail: string }) => {
    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([{ ...video, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Study Goals
  const getStudyGoals = async () => {
    const { data, error } = await supabase
      .from('study_goals')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createStudyGoal = async (goal: { title: string; description?: string; target_date?: string }) => {
    const { data, error } = await supabase
      .from('study_goals')
      .insert([{ ...goal, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Progress Tracking
  const getProgressTracking = async () => {
    const { data, error } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const updateProgress = async (progress: { course_id: string; completed_items: string[]; total_items: number }) => {
    const { data, error } = await supabase
      .from('progress_tracking')
      .upsert([{ ...progress, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Timer Daily Summaries
  const getTimerDailySummaries = async () => {
    const { data, error } = await supabase
      .from('timer_daily_summaries')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('date', { ascending: false });
    return { data, error };
  };

  const updateTimerSummary = async (summary: { date: string; total_study_time: number; total_break_time: number }) => {
    const { data, error } = await supabase
      .from('timer_daily_summaries')
      .upsert([{ ...summary, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Achievements
  const getAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const updateAchievement = async (achievement: { type: string; progress: number; completed: boolean }) => {
    const { data, error } = await supabase
      .from('achievements')
      .upsert([{ ...achievement, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Chat Messages
  const getChatMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: true });
    return { data, error };
  };

  const createChatMessage = async (message: { content: string; type: 'user' | 'assistant' }) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([{ ...message, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Notifications
  const getNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createNotification = async (notification: { title: string; message: string; type: string }) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  const markNotificationRead = async (id: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', session?.user?.id)
      .select()
      .single();
    return { data, error };
  };

  // User Profile & Stats
  const getUserProfile = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session?.user?.id)
      .single();
    return { data, error };
  };

  const updateUserProfile = async (profile: { name?: string; avatar_url?: string; settings?: any }) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([{ ...profile, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  const getUserStats = async () => {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', session?.user?.id)
      .single();
    return { data, error };
  };

  const updateUserStats = async (stats: { total_study_time?: number; completed_tasks?: number; streak_days?: number }) => {
    const { data, error } = await supabase
      .from('user_stats')
      .upsert([{ ...stats, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  // Schedules
  const getSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', session?.user?.id)
      .order('created_at', { ascending: false });
    return { data, error };
  };

  const createSchedule = async (schedule: { title: string; type: 'main' | 'backup'; items: any[] }) => {
    const { data, error } = await supabase
      .from('schedules')
      .insert([{ ...schedule, user_id: session?.user?.id }])
      .select()
      .single();
    return { data, error };
  };

  const updateSchedule = async (id: string, updates: { title?: string; items?: any[] }) => {
    const { data, error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', id)
      .eq('user_id', session?.user?.id)
      .select()
      .single();
    return { data, error };
  };

  return {
    session,
    loading,
    signIn,
    signOut,
    // Timer operations
    createTimer,
    getTimers,
    // Task operations
    createTask,
    getTasks,
    updateTask,
    // Course operations
    createCourse,
    getCourses,
    // Media operations
    uploadMedia,
    saveMediaItem,
    getMediaItems,
    deleteMediaItem,
    updateMediaItem,
    // Album operations
    createAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    addItemToAlbum,
    removeItemFromAlbum,
    // Journal operations
    createJournalEntry,
    getJournalEntries,
    // Questions & Answers
    getQuestions,
    createQuestion,
    // Tweets
    getTweets,
    createTweet,
    // YouTube Videos
    getYouTubeVideos,
    createYouTubeVideo,
    // Study Goals
    getStudyGoals,
    createStudyGoal,
    // Progress Tracking
    getProgressTracking,
    updateProgress,
    // Timer Summaries
    getTimerDailySummaries,
    updateTimerSummary,
    // Achievements
    getAchievements,
    updateAchievement,
    // Chat Messages
    getChatMessages,
    createChatMessage,
    // Notifications
    getNotifications,
    createNotification,
    markNotificationRead,
    // User Profile & Stats
    getUserProfile,
    updateUserProfile,
    getUserStats,
    updateUserStats,
    // Schedules
    getSchedules,
    createSchedule,
    updateSchedule,
    // Base client
    supabase,
  };
}
