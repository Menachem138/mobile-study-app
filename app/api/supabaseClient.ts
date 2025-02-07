import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import Constants from 'expo-constants';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Custom storage for Node.js environment
const nodeStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

// Use AsyncStorage in React Native, fallback to custom storage in Node.js
const authStorage = typeof window === 'undefined' 
  ? nodeStorage 
  : require('@react-native-async-storage/async-storage').default;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export const tables = {
  achievements: () => supabase.from('achievements'),
  calendarEvents: () => supabase.from('calendar_events'),
  chatMessages: () => supabase.from('chat_messages'),
  contentItems: () => supabase.from('content_items'),
  courseProgress: () => supabase.from('course_progress'),
  documents: () => supabase.from('documents'),
  learningJournal: () => supabase.from('learning_journal'),
  libraryItems: () => supabase.from('library_items'),
  notifications: () => supabase.from('notifications'),
  progressTracking: () => supabase.from('progress_tracking'),
  questions: () => supabase.from('questions'),
  schedules: () => supabase.from('schedules'),
  studyGoals: () => supabase.from('study_goals'),
  timerDailySummaries: () => supabase.from('timer_daily_summaries'),
  timerSessions: () => supabase.from('timer_sessions'),
  tweets: () => supabase.from('tweets'),
  userProfiles: () => supabase.from('user_profiles'),
  userStats: () => supabase.from('user_stats'),
  youtubeVideos: () => supabase.from('youtube_videos'),
};

export const storage = {
  contentLibrary: supabase.storage.from('content_library'),
  documents: supabase.storage.from('documents'),
  avatars: supabase.storage.from('avatars'),
};

export const functions = {
  createTableIfNotExists: (tableName: string, definition: string) =>
    supabase.rpc('create_table_if_not_exists', { table_name: tableName, definition }),
};

export const channels = {
  tableChanges: (table: keyof Database['public']['Tables'], userId: string) =>
    supabase.channel(`${table}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter: `user_id=eq.${userId}`,
      }, (payload) => payload),
};

export type SupabaseClient = typeof supabase;
export type Tables = typeof tables;
export type Storage = typeof storage;
export type Functions = typeof functions;
export type Channels = typeof channels;

export default {
  client: supabase,
  tables,
  storage,
  functions,
  channels,
};
