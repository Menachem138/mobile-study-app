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
    if (!goal.deadline) return null;

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

    return schedules.flatMap(schedule => {
      return schedule.schedule.map(slot => {
        const [hours, minutes] = slot.time.split(':');
        const scheduleTime = new Date();
        scheduleTime.setHours(parseInt(hours, 10));
        scheduleTime.setMinutes(parseInt(minutes, 10));
        scheduleTime.setSeconds(0);

        if (scheduleTime < new Date()) {
          scheduleTime.setDate(scheduleTime.getDate() + 1);
        }

        return {
          title: 'Schedule Reminder',
          body: `Time for: ${slot.activity}`,
          data: { scheduleId: schedule.id, activity: slot.activity },
          trigger: { 
            dateTime: scheduleTime,
            repeats: true
          }
        };
      });
    });
  }
}
