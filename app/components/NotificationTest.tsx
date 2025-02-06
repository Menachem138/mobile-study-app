import React, { useEffect } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { useNotificationContext } from '../providers/NotificationProvider';
import { supabase } from '../api/supabaseClient';

export function NotificationTest() {
  const {
    expoPushToken,
    scheduleTaskReminder,
    scheduleStudyBreakAlert,
    scheduleGoalReminder,
    scheduleScheduleReminders,
    cancelAllNotifications
  } = useNotificationContext();

  useEffect(() => {
    const setupTestData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
        await scheduleTaskReminder(event);
      }

      // Create test timer session
      const { data: session } = await supabase
        .from('timer_sessions')
        .insert({
          user_id: user.id,
          type: 'study',
          duration: 300,
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 300000).toISOString()
        })
        .select()
        .single();

      if (session) {
        await scheduleStudyBreakAlert(session);
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
        await scheduleGoalReminder(goal);
      }

      // Schedule reminders based on user's schedule
      await scheduleScheduleReminders(user.id);
    };

    setupTestData();
  }, []);

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
  token: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
  },
});
