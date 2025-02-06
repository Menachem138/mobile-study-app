import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import { useRealtimeSyncContext } from '../providers/RealtimeSyncProvider';
import { supabase, tables } from '../api/supabaseClient';
import { Database } from '../types/database.types';

type TableName = keyof Database['public']['Tables'];

export function RealtimeSyncTest() {
  const { triggerSync } = useRealtimeSyncContext();
  const [userId, setUserId] = useState<string>();
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<TableName, boolean>>({} as any);

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
        ...(tableName === 'timer_sessions' && {
          type: 'study',
          duration: 1500,
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 1500000).toISOString()
        }),
        ...(tableName === 'questions' && {
          content: 'Test question',
          is_answered: false,
          type: 'general'
        }),
        ...(tableName === 'user_stats' && {
          total_points: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity: new Date().toISOString()
        }),
        ...(tableName === 'study_goals' && {
          title: 'Test goal',
          description: 'Test description',
          target_date: new Date(Date.now() + 86400000).toISOString()
        }),
        ...(tableName === 'documents' && {
          title: 'Test document',
          content: 'Test content',
          type: 'note'
        }),
        ...(tableName === 'learning_journal' && {
          content: 'Test journal entry',
          tags: ['test']
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
          ...(tableName === 'questions' && { content: 'Updated test question' }),
          ...(tableName === 'documents' && { title: 'Updated test document' }),
          ...(tableName === 'learning_journal' && { content: 'Updated test entry' })
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
      console.error(`Error testing ${tableName}:`, error);
      setTestResults(prev => ({ ...prev, [tableName]: false }));
      addLog(`Error testing ${tableName}: ${error.message}`);
    }
  };

  const testAllTables = async () => {
    setSyncLogs([]);
    setTestResults({} as any);
    
    const tableNames = Object.keys(tables) as TableName[];
    for (const tableName of tableNames) {
      await testTable(tableName);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Realtime Sync Test</Text>
      
      <Button 
        title="Test All Tables"
        onPress={testAllTables}
      />

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
  }
});
