import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'ברוך הבא',
        }}
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen}
        options={{
          title: 'לוח שנה',
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{
          title: 'קורסים',
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          title: 'לוח זמנים',
        }}
      />
    </Tab.Navigator>
  );
}

export type RootStackParamList = {
  TabNavigator: undefined;
  Home: undefined;
  Calendar: undefined;
  Courses: undefined;
  Schedule: undefined;
  Lesson: {
    courseId: string;
    chapterId: string;
    lessonId: string;
  };
};

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TabNavigator"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
        options={{
          title: 'שיעור',
          headerBackTitle: 'חזרה',
        }}
      />
    </Stack.Navigator>
  );
}
