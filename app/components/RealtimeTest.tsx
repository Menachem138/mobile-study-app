import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRealtime } from '../providers/RealtimeProvider';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function RealtimeTest() {
  const { addCallback, removeCallback } = useRealtime();
  const [lastUpdate, setLastUpdate] = useState<string>('No updates yet');

  useEffect(() => {
    const handleUpdate = (payload: RealtimePostgresChangesPayload<any>) => {
      const eventType = payload.eventType;
      const record = payload.new || payload.old;
      setLastUpdate(
        `${eventType.toUpperCase()} on ${payload.table} at ${new Date().toLocaleTimeString()}\n` +
        `Record ID: ${record?.id}`
      );
    };

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

    tables.forEach(table => {
      addCallback(table, handleUpdate);
    });

    return () => {
      tables.forEach(table => {
        removeCallback(table);
      });
    };
  }, [addCallback, removeCallback]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{lastUpdate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  text: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'System',
    lineHeight: 20,
  },
});
