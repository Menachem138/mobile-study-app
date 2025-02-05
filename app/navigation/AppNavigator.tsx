import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { ContentLibraryScreen } from '../screens/ContentLibraryScreen';
import { DocumentsLibraryScreen } from '../screens/DocumentsLibraryScreen';
import { YouTubeLibraryScreen } from '../screens/YouTubeLibraryScreen';
import { TweetsLibraryScreen } from '../screens/TweetsLibraryScreen';
import { QAScreen } from '../screens/QAScreen';
import { QuestionDetailScreen } from '../screens/QuestionDetailScreen';
import { AddQuestionScreen } from '../screens/AddQuestionScreen';
import { Question } from '../types/qa';

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
      <Tab.Screen
        name="ContentLibrary"
        component={ContentLibraryScreen}
        options={{
          title: 'ספריית תוכן',
          tabBarIcon: ({ color }) => <MaterialIcons name="photo-library" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsLibraryScreen}
        options={{
          title: 'מסמכים',
          tabBarIcon: ({ color }) => <MaterialIcons name="description" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="YouTube"
        component={YouTubeLibraryScreen}
        options={{
          title: 'סרטוני יוטיוב',
          tabBarIcon: ({ color }) => <MaterialIcons name="video-library" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Tweets"
        component={TweetsLibraryScreen}
        options={{
          title: 'ציוצים',
          tabBarIcon: ({ color }) => <MaterialIcons name="chat" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="QA"
        component={QAScreen}
        options={{
          title: 'שאלות ותשובות',
          tabBarIcon: ({ color }) => <MaterialIcons name="question-answer" size={24} color={color} />,
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
  ContentLibrary: undefined;
  Documents: undefined;
  YouTube: undefined;
  Tweets: undefined;
  QA: undefined;
  QuestionDetail: {
    question: Question;
  };
  AddQuestion: undefined;
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
      <Stack.Screen
        name="QuestionDetail"
        component={QuestionDetailScreen}
        options={{
          title: 'שאלה',
          headerBackTitle: 'חזרה',
        }}
      />
      <Stack.Screen
        name="AddQuestion"
        component={AddQuestionScreen}
        options={{
          title: 'שאלה חדשה',
          headerBackTitle: 'חזרה',
        }}
      />
    </Stack.Navigator>
  );
}
