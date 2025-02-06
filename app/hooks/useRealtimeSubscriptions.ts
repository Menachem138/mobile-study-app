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

    const channels = tables.map(table => 
      supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`
        }, (payload) => callbacks[table]?.(payload))
    );

    // Subscribe to all channels
    channels.forEach(channel => channel.subscribe());

    // Cleanup: unsubscribe from all channels
    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [session?.user?.id, callbacks]);
}
