import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationService } from '../services/NotificationService';
import { supabase } from '../api/supabaseClient';

export function NotificationTest() {
  const {
    expoPushToken,
    scheduleNotification,
    cancelAllNotifications
  } = useNotifications();

  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [deviceInfo, setDeviceInfo] = useState<string>();
  const [envInfo, setEnvInfo] = useState<string>();
  const [projectId, setProjectId] = useState<string>();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const projectId = process.env.EXPO_PROJECT_ID || 'study-time-manager';
        setProjectId(projectId);
        setDeviceInfo(`Platform: ${Platform.OS}, Environment: ${Constants.executionEnvironment}`);
        setEnvInfo(`App Ownership: ${Constants.appOwnership || 'unknown'}, Project ID: ${projectId}`);
        
        console.log('Checking push token with project ID:', projectId);
        
        if (expoPushToken) {
          setTokenStatus('success');
          setError(undefined);
          console.log('Push token obtained successfully:', expoPushToken);
        } else {
          setTokenStatus('error');
          console.log('No push token available');
        }
        
        console.log('Environment Status:', { 
          Platform: Platform.OS,
          Constants: {
            appOwnership: Constants.appOwnership,
            executionEnvironment: Constants.executionEnvironment,
            manifest: Constants.manifest
          }
        });

        // Check if we're running in Expo Go
        if (Constants.appOwnership !== 'expo') {
          setError('This app must be run in Expo Go');
          setTokenStatus('error');
          return;
        }
      } catch (error) {
        console.error('Error checking push token:', error);
        setError(`Token error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setTokenStatus('error');
      }
    };
    
    checkToken();
    
    if (!process.env.EXPO_PROJECT_ID) {
      console.error('Missing EXPO_PROJECT_ID environment variable');
      setError('Configuration error: Missing project ID');
      return;
    }
    
    if (!expoPushToken) {
      console.log('No push token available yet');
      setError('Push token not available. Please check permissions and try again.');
      return;
    }
    
    console.log('Push token successfully obtained:', expoPushToken);
    
    const setupTestData = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          setError(`Auth error: ${authError.message}`);
          return;
        }
        
        if (!user) {
          setError('No authenticated user found');
          return;
        }
        // Create test calendar event
        const { data: event, error: eventError } = await supabase
          .from('calendar_events')
          .insert({
            user_id: user.id,
            title: 'Test Study Session',
            description: 'Testing notifications',
            start_time: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
            end_time: new Date(Date.now() + 3660000).toISOString(),
            is_all_day: false
          })
          .select()
          .single();

        if (eventError) {
          setError(`Calendar event error: ${eventError.message}`);
          return;
        }

        if (event) {
          try {
            const reminder = await NotificationService.scheduleTaskReminder(event);
            await scheduleNotification(reminder);
          } catch (reminderError) {
            setError(`Failed to schedule reminder: ${reminderError instanceof Error ? reminderError.message : 'Unknown error'}`);
            return;
          }
        }

        // Create test timer sessions
        const now = new Date();
        const sessions = [
          {
            user_id: user.id,
            type: 'study',
            duration: 300,
            started_at: new Date(now.getTime() - 86400000 * 2).toISOString(), // 2 days ago
            ended_at: new Date(now.getTime() - 86400000 * 2 + 300000).toISOString()
          },
          {
            user_id: user.id,
            type: 'study',
            duration: 300,
            started_at: new Date().toISOString(),
            ended_at: new Date(Date.now() + 300000).toISOString()
          }
        ];

        const { data: session, error: sessionError } = await supabase
          .from('timer_sessions')
          .insert(sessions)
          .select()
          .single();

        if (sessionError) {
          setError(`Timer session error: ${sessionError.message}`);
          return;
        }

        if (session) {
          try {
            const breakAlert = await NotificationService.scheduleStudyBreakAlert(session);
            await scheduleNotification(breakAlert);
          } catch (breakError) {
            setError(`Failed to schedule break alert: ${breakError instanceof Error ? breakError.message : 'Unknown error'}`);
            return;
          }
        }

        // Create test study goal
        const { data: goal, error: goalError } = await supabase
          .from('study_goals')
          .insert({
            user_id: user.id,
            title: 'Test Goal',
            description: 'Testing goal notifications',
            deadline: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
            completed: false
          })
          .select()
          .single();

        if (goalError) {
          setError(`Study goal error: ${goalError.message}`);
          return;
        }

        if (goal) {
          try {
            const goalReminder = await NotificationService.scheduleGoalReminder(goal);
            if (goalReminder) {
              await scheduleNotification(goalReminder);
            }
          } catch (reminderError) {
            setError(`Failed to schedule goal reminder: ${reminderError instanceof Error ? reminderError.message : 'Unknown error'}`);
            return;
          }
        }

        // Schedule reminders based on user's schedule
        try {
          const scheduleReminders = await NotificationService.scheduleScheduleReminders(user.id);
          for (const reminder of scheduleReminders) {
            await scheduleNotification(reminder);
          }
        } catch (scheduleError) {
          setError(`Failed to schedule reminders: ${scheduleError instanceof Error ? scheduleError.message : 'Unknown error'}`);
          return;
        }
      } catch (error) {
        console.error('Error setting up test notifications:', error);
        setError(`Error setting up notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    setupTestData();
  }, [scheduleNotification]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test Panel</Text>
      <Text style={[styles.token, !expoPushToken && styles.tokenUnavailable]}>
        Push Token: {expoPushToken || 'Not available'}
      </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      {isLoading && <Text style={styles.loading}>Loading...</Text>}
      
      <Text style={styles.status}>
        Token Status: {tokenStatus}
      </Text>
      
      {deviceInfo && (
        <Text style={styles.deviceInfo}>
          {deviceInfo}
        </Text>
      )}
      {envInfo && (
        <Text style={styles.deviceInfo}>
          {envInfo}
        </Text>
      )}
      {projectId && (
        <Text style={styles.projectInfo}>
          Project ID: {projectId}
        </Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Cancel All Notifications" 
          onPress={cancelAllNotifications}
        />
      </View>

      <Text style={styles.subtitle}>Active Notifications:</Text>
      <Text style={styles.description}>
        • Task reminders (30 min before)
        {'\n'}• Study break alerts
        {'\n'}• Goal deadline reminders
        {'\n'}• Schedule-based notifications
        {'\n'}• Study pattern prompts
      </Text>
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
  error: {
    color: 'red',
    marginVertical: 8,
  },
  loading: {
    color: '#666',
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  token: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  tokenUnavailable: {
    color: '#ff6b6b',
  },
  status: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  projectInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    fontWeight: 'bold'
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
