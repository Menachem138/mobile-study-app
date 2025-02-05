import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, Lesson } from '../types/course';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';

type LessonScreenRouteProp = RouteProp<RootStackParamList, 'Lesson'>;

export function LessonScreen() {
  const route = useRoute<LessonScreenRouteProp>();
  const navigation = useNavigation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadLesson();
  }, []);

  const loadLesson = async () => {
    try {
      const { courseId, chapterId, lessonId } = route.params;
      const savedCourses = await AsyncStorage.getItem('courses');
      if (savedCourses) {
        const courses: Course[] = JSON.parse(savedCourses);
        const foundCourse = courses.find((c: Course) => c.id === courseId);
        if (foundCourse) {
          setCourse(foundCourse);
          const chapter = foundCourse.chapters.find((ch: Chapter) => ch.id === chapterId);
          if (chapter) {
            const foundLesson = chapter.lessons.find((l: Lesson) => l.id === lessonId);
            if (foundLesson) {
              setLesson(foundLesson);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const toggleLessonCompletion = async () => {
    if (!lesson || !course) return;

    try {
      const savedCourses = await AsyncStorage.getItem('courses');
      if (savedCourses) {
        const courses: Course[] = JSON.parse(savedCourses);
        const updatedCourses = courses.map((c: Course) => {
          if (c.id === course.id) {
            return {
              ...c,
              chapters: c.chapters.map((ch: Chapter) => {
                return {
                  ...ch,
                  lessons: ch.lessons.map((l: Lesson) => {
                    if (l.id === lesson.id) {
                      return { ...l, completed: !l.completed };
                    }
                    return l;
                  }),
                };
              }),
            };
          }
          return c;
        });

        await AsyncStorage.setItem('courses', JSON.stringify(updatedCourses));
        setLesson({ ...lesson, completed: !lesson.completed });
      }
    } catch (error) {
      console.error('Error updating lesson completion:', error);
    }
  };

  if (!lesson || !course) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>טוען...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#E8EAF6', '#C5CAE9']}
        style={styles.header}
      >
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {lesson.description && (
          <Text style={styles.description}>{lesson.description}</Text>
        )}

        <View style={styles.timeInfo}>
          <Text style={styles.timeText}>
            זמן שהושקע: {Math.floor(lesson.timeSpent / 60)}ש {lesson.timeSpent % 60}ד
          </Text>
          {lesson.estimatedTime && (
            <Text style={styles.timeText}>
              זמן מוערך: {Math.floor(lesson.estimatedTime / 60)}ש {lesson.estimatedTime % 60}ד
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.completeButton, lesson.completed && styles.completedButton]}
          onPress={toggleLessonCompletion}
        >
          <Text style={styles.completeButtonText}>
            {lesson.completed ? '✓ הושלם' : 'סמן כהושלם'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'right',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    color: '#3949AB',
    textAlign: 'right',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#263238',
    textAlign: 'right',
    marginBottom: 20,
    lineHeight: 24,
  },
  timeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'right',
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: '#3F51B5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
