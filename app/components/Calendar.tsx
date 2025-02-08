import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar as RNCalendar, CalendarList, Agenda } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';

// Configure Hebrew locale
LocaleConfig.locales['he'] = {
  monthNames: [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר'
  ],
  monthNamesShort: ['ינו׳', 'פבר׳', 'מרץ', 'אפר׳', 'מאי', 'יוני', 'יולי', 'אוג׳', 'ספט׳', 'אוק׳', 'נוב׳', 'דצמ׳'],
  dayNames: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'],
  dayNamesShort: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'],
  today: 'היום'
};
LocaleConfig.defaultLocale = 'he';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  estimatedTime: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface CalendarProps {
  tasks: Task[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  viewMode: 'day' | 'week' | 'month';
}

export function Calendar({ tasks, selectedDate, onDateSelect, viewMode }: CalendarProps) {
  const markedDates = tasks.reduce((acc, task) => {
    const date = task.dueDate.split('T')[0];
    const urgencyColors = {
      low: '#4CAF50',
      medium: '#FFC107',
      high: '#F44336'
    };

    acc[date] = {
      marked: true,
      dotColor: urgencyColors[task.urgencyLevel],
      selected: selectedDate.toISOString().split('T')[0] === date,
      selectedColor: 'rgba(63, 81, 181, 0.1)'
    };
    return acc;
  }, {} as any);

  const getCalendarComponent = () => {
    switch (viewMode) {
      case 'day':
        return (
          <RNCalendar
            current={selectedDate.toISOString()}
            onDayPress={(day: { timestamp: number; dateString: string }) => onDateSelect(new Date(day.timestamp))}
            markedDates={markedDates}
            markingType={'dot'}
            style={styles.calendar}
            theme={{
              todayTextColor: '#3F51B5',
              selectedDayBackgroundColor: '#3F51B5',
              arrowColor: '#3F51B5',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        );
      case 'week':
        return (
          <CalendarList
            current={selectedDate.toISOString()}
            onDayPress={(day: { timestamp: number; dateString: string }) => onDateSelect(new Date(day.timestamp))}
            markedDates={markedDates}
            markingType={'dot'}
            pastScrollRange={0}
            futureScrollRange={0}
            scrollEnabled={true}
            showScrollIndicator={true}
            calendarHeight={120}
            horizontal={true}
            pagingEnabled={true}
            style={styles.calendar}
            theme={{
              todayTextColor: '#3F51B5',
              selectedDayBackgroundColor: '#3F51B5',
              arrowColor: '#3F51B5',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        );
      case 'month':
      default:
        return (
          <RNCalendar
            current={selectedDate.toISOString()}
            onDayPress={(day: { timestamp: number; dateString: string }) => onDateSelect(new Date(day.timestamp))}
            markedDates={markedDates}
            markingType={'dot'}
            style={styles.calendar}
            theme={{
              todayTextColor: '#3F51B5',
              selectedDayBackgroundColor: '#3F51B5',
              arrowColor: '#3F51B5',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {getCalendarComponent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendar: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
