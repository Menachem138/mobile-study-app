import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRealtimeSyncContext } from '../providers/RealtimeSyncProvider';
import { supabase, tables } from '../api/supabaseClient';
import { Database } from '../types/database.types';

type TableName = keyof Database['public']['Tables'];

export function RealtimeSyncTest() {
  const { triggerSync, getSyncErrors, clearSyncErrors } = useRealtimeSyncContext();
  const [userId, setUserId] = useState<string>();
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<TableName, boolean>>({} as any);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTable, setCurrentTable] = useState<string>();
  const [syncErrors, setSyncErrors] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    });
  }, []);

  const addLog = (message: string) => {
    setSyncLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testTable = async (tableName: TableName) => {
    if (!userId) {
      addLog(`Cannot test ${tableName}: No user ID`);
      return;
    }

    try {
      // Test data based on table requirements
      const testData = {
        user_id: userId,
        ...(tableName === 'achievements' && {
          type: 'study_milestone',
          progress: 50,
          completed: false
        }),
        ...(tableName === 'calendar_events' && {
          title: 'Test Event',
          description: 'Test event description',
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3600000).toISOString(),
          is_all_day: false
        }),
        ...(tableName === 'chat_messages' && {
          content: 'Test message',
          type: 'user'
        }),
        ...(tableName === 'content_items' && {
          type: 'note',
          content: 'Test content',
          title: 'Test Content',
          starred: false,
          file_path: '',
          file_name: '',
          file_size: 0,
          mime_type: 'text/plain'
        }),
        ...(tableName === 'course_progress' && {
          lesson_id: `test_lesson_${Date.now()}`,
          completed: false
        }),
        ...(tableName === 'documents' && {
          title: 'Test Document',
          description: '',
          type: 'pdf',
          file_url: 'https://example.com/test.pdf',
          file_size: 1024
        }),
        ...(tableName === 'learning_journal' && {
          content: 'Test journal entry',
          is_important: false,
          type: 'learning',
          tags: ['test']
        }),
        ...(tableName === 'library_items' && {
          title: 'Test Library Item',
          content: 'Test content',
          type: 'document',
          is_starred: false,
          file_details: {
            name: 'test.pdf',
            path: 'https://example.com/test.pdf',
            size: 1024,
            type: 'application/pdf'
          }
        }),
        ...(tableName === 'notifications' && {
          event_id: `test_${Date.now()}`,
          event_type: 'calendar',
          message: 'Test notification',
          scheduled_for: new Date(Date.now() + 1800000).toISOString(),
          is_sent: false,
          phone_number: ''
        }),
        ...(tableName === 'progress_tracking' && {
          course_id: `test_${Date.now()}`,
          progress: 0
        }),
        ...(tableName === 'questions' && {
          content: 'Test question',
          is_answered: false,
          type: 'general'
        }),
        ...(tableName === 'schedules' && {
          day_name: 'יום ראשון',
          schedule: [
            { time: '09:00-10:00', activity: 'Test activity' }
          ]
        }),
        ...(tableName === 'study_goals' && {
          title: 'Test Goal',
          description: 'Test goal description',
          deadline: new Date(Date.now() + 86400000).toISOString(),
          completed: false
        }),
        ...(tableName === 'timer_daily_summaries' && {
          date: new Date().toISOString().split('T')[0],
          total_study_time: 0,
          total_break_time: 0
        }),
        ...(tableName === 'timer_sessions' && {
          type: 'study',
          duration: 1500,
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 1500000).toISOString()
        }),
        ...(tableName === 'tweets' && {
          tweet_id: `test_${Date.now()}`,
          url: 'https://x.com/test/status/123'
        }),
        ...(tableName === 'user_profiles' && {
          id: userId,  // user_profiles uses id as primary key
          username: 'test_user',
          avatar_url: null,
          preferences: {},
          learning_goals: { daily: { time: 60, unit: 'minutes' }, monthly: { articles: 10 } },
          theme: 'light'
        }),
        ...(tableName === 'user_stats' && {
          total_study_time: 0,
          completed_tasks: 0,
          streak_days: 0
        }),
        ...(tableName === 'youtube_videos' && {
          title: 'Test Video',
          url: 'https://youtu.be/test',
          thumbnail_url: 'https://i.ytimg.com/vi/test/hqdefault.jpg',
          video_id: 'test'
        })
      };

      // Test insert
      addLog(`Testing insert for ${tableName}...`);
      const inserted = await triggerSync(tableName, 'INSERT', testData);
      addLog(`Successfully inserted record in ${tableName}`);

      // Test update
      if (inserted) {
        addLog(`Testing update for ${tableName}...`);
        const updateData = {
          ...inserted,
          ...(tableName === 'achievements' && { progress: 75 }),
          ...(tableName === 'calendar_events' && { description: 'Updated event description' }),
          ...(tableName === 'chat_messages' && { content: 'Updated message' }),
          ...(tableName === 'content_items' && { content: 'Updated content' }),
          ...(tableName === 'course_progress' && { completed: true }),
          ...(tableName === 'documents' && { description: 'Updated description' }),
          ...(tableName === 'learning_journal' && { content: 'Updated journal entry' }),
          ...(tableName === 'library_items' && { title: 'Updated library item' }),
          ...(tableName === 'notifications' && { message: 'Updated notification' }),
          ...(tableName === 'progress_tracking' && { progress: 50 }),
          ...(tableName === 'questions' && { content: 'Updated question' }),
          ...(tableName === 'schedules' && { 
            schedule: [{ time: '10:00-11:00', activity: 'Updated activity' }]
          }),
          ...(tableName === 'study_goals' && { description: 'Updated goal description' }),
          ...(tableName === 'timer_daily_summaries' && { total_study_time: 1500 }),
          ...(tableName === 'timer_sessions' && { duration: 1800 }),
          ...(tableName === 'tweets' && { url: 'https://x.com/test/status/456' }),
          ...(tableName === 'user_profiles' && { username: 'updated_test_user' }),
          ...(tableName === 'user_stats' && { total_study_time: 3600 }),
          ...(tableName === 'youtube_videos' && { title: 'Updated Video Title' })
        };
        await triggerSync(tableName, 'UPDATE', updateData);
        addLog(`Successfully updated record in ${tableName}`);

        // Test delete
        addLog(`Testing delete for ${tableName}...`);
        await triggerSync(tableName, 'DELETE', { id: inserted.id });
        addLog(`Successfully deleted record in ${tableName}`);
      }

      setTestResults(prev => ({ ...prev, [tableName]: true }));
      addLog(`All operations successful for ${tableName}`);
    } catch (error) {
      const err = error as Error;
      console.error(`Error testing ${tableName}:`, err);
      setTestResults(prev => ({ ...prev, [tableName]: false }));
      addLog(`Error testing ${tableName}: ${err.message}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncErrors(getSyncErrors());
    }, 1000);
    return () => clearInterval(interval);
  }, [getSyncErrors]);

  const testAllTables = async () => {
    try {
      setIsRunning(true);
      setSyncLogs([]);
      setTestResults({} as any);
      clearSyncErrors();
      
      const tableNames = Object.keys(tables) as TableName[];
      for (const tableName of tableNames) {
        setCurrentTable(tableName);
        await testTable(tableName);
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tables
      }
    } finally {
      setIsRunning(false);
      setCurrentTable(undefined);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realtime Sync Test</Text>
      
      <Button 
        title={isRunning ? "Testing..." : "Test All Tables"}
        onPress={testAllTables}
        disabled={isRunning}
      />
      
      {isRunning && (
        <View style={styles.progressContainer}>
          <ActivityIndicator />
          <Text style={styles.progressText}>Testing table: {currentTable}</Text>
        </View>
      )}

      {syncErrors.length > 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Sync Errors ({syncErrors.length}):</Text>
          {syncErrors.map((error, index) => (
            <Text key={index} style={styles.error}>
              {error.tableName} - {error.operation}: {error.error.message}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.resultsContainer}>
        <Text style={styles.subtitle}>Test Results:</Text>
        {Object.entries(testResults).map(([table, success]) => (
          <Text key={table} style={success ? styles.success : styles.error}>
            {table}: {success ? '✓' : '✗'}
          </Text>
        ))}
      </View>

      <ScrollView style={styles.logsContainer}>
        <Text style={styles.subtitle}>Sync Logs:</Text>
        {syncLogs.map((log, index) => (
          <Text key={index} style={styles.log}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8
  },
  resultsContainer: {
    marginVertical: 16
  },
  success: {
    color: 'green'
  },
  error: {
    color: 'red'
  },
  logsContainer: {
    flex: 1,
    marginTop: 16
  },
  log: {
    fontSize: 12,
    marginBottom: 4
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666'
  },
  errorContainer: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2'
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8
  }
});
