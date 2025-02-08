import React, { createContext, useContext } from 'react';
import { useNotifications, NotificationSchedule } from '../hooks/useNotifications';
import { NotificationService } from '../services/NotificationService';
import { CalendarEvent, TimerSession, StudyGoal } from '../types/database.types';

type NotificationContextType = {
  expoPushToken: string | undefined;
  scheduleTaskReminder: (event: CalendarEvent) => Promise<string>;
  scheduleStudyBreakAlert: (session: TimerSession) => Promise<string>;
  scheduleGoalReminder: (goal: StudyGoal) => Promise<string>;
  scheduleScheduleReminders: (userId: string) => Promise<string[]>;
  cancelNotification: (identifier: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const {
    expoPushToken,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  } = useNotifications();

  const scheduleTaskReminder = async (event: CalendarEvent) => {
    const notification = await NotificationService.scheduleTaskReminder(event);
    return scheduleNotification(notification);
  };

  const scheduleStudyBreakAlert = async (session: TimerSession) => {
    const notification = await NotificationService.scheduleStudyBreakAlert(session);
    return scheduleNotification(notification);
  };

  const scheduleGoalReminder = async (goal: StudyGoal) => {
    const notification = await NotificationService.scheduleGoalReminder(goal);
    return scheduleNotification(notification);
  };

  const scheduleScheduleReminders = async (userId: string) => {
    const notifications = await NotificationService.scheduleScheduleReminders(userId);
    const identifiers = await Promise.all(
      notifications.map(notification => scheduleNotification(notification))
    );
    return identifiers.filter(Boolean);
  };

  return (
    <NotificationContext.Provider
      value={{
        expoPushToken,
        scheduleTaskReminder,
        scheduleStudyBreakAlert,
        scheduleGoalReminder,
        scheduleScheduleReminders,
        cancelNotification,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
