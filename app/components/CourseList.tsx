import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Course, Chapter, calculateCourseProgress, calculateChapterProgress } from '../types/course';
import { LinearGradient } from 'expo-linear-gradient';

interface CourseListProps {
  courses: Course[];
  onSelectLesson: (courseId: string, chapterId: string, lessonId: string) => void;
}

export function CourseList({ courses, onSelectLesson }: CourseListProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const renderProgressBar = (percentage: number) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%` }]} />
    </View>
  );

  const renderTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ש ${remainingMinutes}ד`;
  };

  return (
    <ScrollView style={styles.container}>
      {courses.map(course => {
        const progress = calculateCourseProgress(course);
        const isExpanded = expandedCourse === course.id;

        return (
          <View key={course.id} style={styles.courseContainer}>
            <TouchableOpacity
              style={styles.courseHeader}
              onPress={() => setExpandedCourse(isExpanded ? null : course.id)}
            >
              <LinearGradient
                colors={['#E8EAF6', '#C5CAE9']}
                style={styles.courseHeaderGradient}
              >
                <View style={styles.courseHeaderContent}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseProgress}>
                      {progress.completedLessons}/{progress.totalLessons} שיעורים • {renderTimeSpent(progress.totalTimeSpent)}
                    </Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </View>
                {renderProgressBar(progress.percentageComplete)}
              </LinearGradient>
            </TouchableOpacity>

            {isExpanded && course.chapters.map(chapter => {
              const chapterProgress = calculateChapterProgress(chapter);
              const isChapterExpanded = expandedChapter === chapter.id;

              return (
                <View key={chapter.id} style={styles.chapterContainer}>
                  <TouchableOpacity
                    style={styles.chapterHeader}
                    onPress={() => setExpandedChapter(isChapterExpanded ? null : chapter.id)}
                  >
                    <View style={styles.chapterHeaderContent}>
                      <View style={styles.chapterInfo}>
                        <Text style={styles.chapterTitle}>{chapter.title}</Text>
                        <Text style={styles.chapterProgress}>
                          {chapterProgress.completedLessons}/{chapterProgress.totalLessons} שיעורים • {renderTimeSpent(chapterProgress.totalTimeSpent)}
                        </Text>
                      </View>
                      <Text style={styles.expandIcon}>{isChapterExpanded ? '▼' : '▶'}</Text>
                    </View>
                    {renderProgressBar(chapterProgress.percentageComplete)}
                  </TouchableOpacity>

                  {isChapterExpanded && chapter.lessons.map(lesson => (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.lessonItem, lesson.completed && styles.completedLesson]}
                      onPress={() => onSelectLesson(course.id, chapter.id, lesson.id)}
                    >
                      <View style={styles.lessonContent}>
                        <Text style={[styles.lessonTitle, lesson.completed && styles.completedText]}>
                          {lesson.title}
                        </Text>
                        <Text style={styles.lessonTime}>
                          {renderTimeSpent(lesson.timeSpent)}
                          {lesson.estimatedTime && ` / ${renderTimeSpent(lesson.estimatedTime)}`}
                        </Text>
                      </View>
                      {lesson.completed && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  courseContainer: {
    marginBottom: 16,
  },
  courseHeader: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  courseHeaderGradient: {
    padding: 16,
  },
  courseHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    textAlign: 'right',
  },
  courseProgress: {
    fontSize: 14,
    color: '#3949AB',
    textAlign: 'right',
    marginTop: 4,
  },
  chapterContainer: {
    marginTop: 8,
    marginRight: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
  },
  chapterHeader: {
    padding: 12,
    backgroundColor: '#F5F5F5',
  },
  chapterHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#263238',
    textAlign: 'right',
  },
  chapterProgress: {
    fontSize: 12,
    color: '#546E7A',
    textAlign: 'right',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 16,
    color: '#1A237E',
    marginRight: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3F51B5',
    borderRadius: 2,
  },
  lessonItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: '#263238',
    textAlign: 'right',
  },
  lessonTime: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'right',
    marginTop: 2,
  },
  completedLesson: {
    backgroundColor: '#F5F5F5',
  },
  completedText: {
    color: '#78909C',
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
});
