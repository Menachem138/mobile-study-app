import React, { useEffect } from 'react';
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

  useEffect(() => {
    const setupTestData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Create test calendar event
        const { data: event } = await supabase
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

        if (event) {
          const reminder = await NotificationService.scheduleTaskReminder(event);
          await scheduleNotification(reminder);
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

        const { data: session } = await supabase
          .from('timer_sessions')
          .insert(sessions)
          .select()
          .single();

        if (session) {
          const breakAlert = await NotificationService.scheduleStudyBreakAlert(session);
          await scheduleNotification(breakAlert);
        }

        // Create test study goal
        const { data: goal } = await supabase
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

        if (goal) {
          const goalReminder = await NotificationService.scheduleGoalReminder(goal);
          if (goalReminder) {
            await scheduleNotification(goalReminder);
          }
        }

        // Schedule reminders based on user's schedule
        const scheduleReminders = await NotificationService.scheduleScheduleReminders(user.id);
        for (const reminder of scheduleReminders) {
          await scheduleNotification(reminder);
        }
      } catch (error) {
        console.error('Error setting up test notifications:', error);
      }
    };

    setupTestData();
  }, [scheduleNotification]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Test Panel</Text>
      <Text style={styles.token}>Push Token: {expoPushToken || 'Not available'}</Text>
      
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
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
  }, [scheduleNotification]);
