import { supabase } from '../api/supabaseClient';
import { CalendarEvent, TimerSession, StudyGoal } from '../types/database.types';
import { NotificationSchedule } from '../hooks/useNotifications';

export class NotificationService {
  static async scheduleTaskReminder(event: CalendarEvent): Promise<NotificationSchedule> {
    const reminderTime = new Date(event.start_time);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 15 minutes before

    return {
      title: 'Task Reminder',
      body: `Your task "${event.title}" starts in 15 minutes`,
      data: { eventId: event.id },
      trigger: { dateTime: reminderTime }
    };
  }

  static async scheduleStudyBreakAlert(session: TimerSession): Promise<NotificationSchedule> {
    const endTime = new Date(session.ended_at);
    
    return {
      title: session.type === 'study' ? 'Study Session Complete' : 'Break Time Over',
      body: session.type === 'study' 
        ? 'Time for a break! Take some rest.'
        : 'Break time is over. Ready to study again?',
      data: { sessionId: session.id },
      trigger: { dateTime: endTime }
    };
  }

  static async scheduleGoalReminder(goal: StudyGoal): Promise<NotificationSchedule> {
    if (!goal.deadline) {
      throw new Error('Goal must have a deadline to schedule a reminder');
    }

    const deadlineDate = new Date(goal.deadline);
    const reminderDate = new Date(deadlineDate);
    reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

    return {
      title: 'Goal Deadline Approaching',
      body: `Your goal "${goal.title}" is due tomorrow`,
      data: { goalId: goal.id },
      trigger: { dateTime: reminderDate }
    };
  }

  static async scheduleScheduleReminders(userId: string): Promise<NotificationSchedule[]> {
    const { data: schedules } = await supabase
      .from('schedules')
      .select('*')
      .eq('user_id', userId);

    if (!schedules) return [];

    const notifications: NotificationSchedule[] = [];

    for (const schedule of schedules) {
      // Schedule reminders for study sessions
      if (schedule.schedule) {
        for (const slot of schedule.schedule) {
          const [hours, minutes] = slot.time.split(':');
          const scheduleTime = new Date();
          scheduleTime.setHours(parseInt(hours, 10));
          scheduleTime.setMinutes(parseInt(minutes, 10) - 15); // 15 minutes before
          scheduleTime.setSeconds(0);

          if (scheduleTime < new Date()) {
            scheduleTime.setDate(scheduleTime.getDate() + 1);
          }

          notifications.push({
            title: 'Upcoming Study Session',
            body: `Your ${slot.activity} session starts in 15 minutes`,
            data: { scheduleId: schedule.id, activity: slot.activity },
            trigger: { 
              dateTime: scheduleTime,
              repeats: true
            }
          });
        }
      }

      // Schedule break reminders
      const { data: timerSessions } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'study')
        .order('created_at', { ascending: false })
        .limit(1);

      if (timerSessions?.[0]) {
        const lastSession = timerSessions[0];
        const breakTime = new Date(lastSession.ended_at);
        
        if (breakTime > new Date()) {
          notifications.push({
            title: 'Break Time',
            body: 'Time for a short break to refresh your mind',
            data: { sessionId: lastSession.id },
            trigger: { dateTime: breakTime }
          });
        }
      }
    }

    // Add task deadline reminders
    const { data: tasks } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString());

    if (tasks) {
      for (const task of tasks) {
        const reminderTime = new Date(task.start_time);
        reminderTime.setMinutes(reminderTime.getMinutes() - 30); // 30 minutes before

        if (reminderTime > new Date()) {
          notifications.push({
            title: 'Task Reminder',
            body: `Task "${task.title}" starts in 30 minutes`,
            data: { taskId: task.id },
            trigger: { dateTime: reminderTime }
          });
        }
      }
    }

    // Add chatbot prompts based on study patterns
    const { data: studySessions } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'study')
      .order('created_at', { ascending: false })
      .limit(10);

    if (studySessions && studySessions.length > 0) {
      const lastSession = studySessions[0];
      const sessionEnd = new Date(lastSession.ended_at);
      const now = new Date();
      const hoursSinceLastSession = (now.getTime() - sessionEnd.getTime()) / (1000 * 60 * 60);

      // If it's been more than 24 hours since last study session
      if (hoursSinceLastSession > 24) {
        notifications.push({
          title: 'Study Reminder',
          body: 'It\'s been a while since your last study session. Need help getting back on track?',
          data: { type: 'chatbot_prompt', lastSessionId: lastSession.id },
          trigger: { seconds: 1 }
        });
      }

      // Check study consistency
      const sessionDates = studySessions?.map(session => new Date(session.created_at).toDateString()) || [];
      const uniqueDates = new Set(sessionDates);
      
      // If studying less than 3 different days in the last 10 sessions
      if (uniqueDates.size < 3) {
        notifications.push({
          title: 'Study Habit Check',
          body: 'Regular study sessions help build better habits. Want to discuss study scheduling?',
          data: { type: 'chatbot_prompt', action: 'schedule_discussion' },
          trigger: { seconds: 2 }
        });
      }
    }

      return notifications;
  }
}
