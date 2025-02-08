import { useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableCallbacks = {
  [key: string]: (payload: RealtimePostgresChangesPayload<any>) => void;
};

export function useRealtimeSubscriptions(callbacks: TableCallbacks = {}) {
  const { supabase, session } = useSupabase();

  useEffect(() => {
    // Only proceed if we have an authenticated user
    if (!session?.user?.id) {
      console.warn('Realtime subscriptions require authentication');
      return;
    }

    // Securely reference the user ID
    const userId = session.user.id;

    const tables = [
      'achievements',
      'calendar_events',
      'chat_messages',
      'content_items',
      'course_progress',
      'documents',
      'learning_journal',
      'library_items',
      'notifications',
      'progress_tracking',
      'questions',
      'schedules',
      'study_goals',
      'timer_daily_summaries',
      'timer_sessions',
      'tweets',
      'user_profiles',
      'user_stats',
      'youtube_videos'
    ];

    const channels = tables.map(table => {
      const channel = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          try {
            callbacks[table]?.(payload);
          } catch (error) {
            console.error(`Error in ${table} callback:`, error);
          }
        })
        .on('system', { event: 'error' }, (payload: { error: Error }) => {
          console.error(`Channel ${table} error:`, payload.error);
        })
        .on('system', { event: 'disconnect' }, (payload: any) => {
          console.warn(`Channel ${table} disconnected`);
        })
        .on('system', { event: 'reconnect' }, (payload: any) => {
          console.log(`Channel ${table} reconnected`);
        });

      return channel;
    });

    // Subscribe to all channels with retry logic
    const subscribeWithRetry = async (channel: ReturnType<typeof supabase.channel>, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          await channel.subscribe();
          return;
        } catch (error) {
          console.error(`Subscription error (attempt ${i + 1}/${retries}):`, error);
          if (i === retries - 1) throw error;
        }
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
      }
    };

    // Subscribe to all channels
    channels.forEach(channel => subscribeWithRetry(channel));

    // Cleanup: unsubscribe from all channels
    return () => {
      channels.forEach(channel => {
        try {
          channel.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from channel:', error);
        }
      });
    };
  }, [session?.user?.id, callbacks]);
}
