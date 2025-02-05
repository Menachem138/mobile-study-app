import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseList } from '../components/CourseList';
import { Course, Lesson } from '../types/course';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Initialize with sample data if no courses exist
  useEffect(() => {
    const initializeCourses = async () => {
      try {
        const savedCourses = await AsyncStorage.getItem('courses');
        if (!savedCourses) {
          const { sampleCourses } = await import('../data/sampleCourses');
          await AsyncStorage.setItem('courses', JSON.stringify(sampleCourses));
          setCourses(sampleCourses);
        } else {
          setCourses(JSON.parse(savedCourses));
        }
      } catch (error) {
        console.error('Error initializing courses:', error);
      }
    };
    
    initializeCourses();
  }, []);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const savedCourses = await AsyncStorage.getItem('courses');
      if (savedCourses) {
        setCourses(JSON.parse(savedCourses));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const handleSelectLesson = (courseId: string, chapterId: string, lessonId: string) => {
    // Navigate to lesson screen with the selected lesson
    navigation.navigate('Lesson', {
      courseId,
      chapterId,
      lessonId,
    });
  };

  return (
    <View style={styles.container}>
      <CourseList
        courses={courses}
        onSelectLesson={handleSelectLesson}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
