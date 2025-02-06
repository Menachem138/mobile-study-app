import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRealtime } from '../providers/RealtimeProvider';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function RealtimeTest() {
  const { addCallback, removeCallback } = useRealtime();
  const [lastUpdate, setLastUpdate] = useState<string>('No updates yet');

  useEffect(() => {
    const handleUpdate = (payload: RealtimePostgresChangesPayload<any>) => {
      setLastUpdate(`Table ${payload.table} updated at ${new Date().toLocaleTimeString()}`);
    };

    ['questions', 'timer_sessions', 'study_goals'].forEach(table => {
      addCallback(table, handleUpdate);
    });

    return () => {
      ['questions', 'timer_sessions', 'study_goals'].forEach(table => {
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
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
