export interface Lesson {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSpent: number; // in minutes
  estimatedTime?: number; // in minutes
  order: number;
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
  order: number;
}

export interface CourseProgress {
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number; // in minutes
  percentageComplete: number;
}

export function calculateCourseProgress(course: Course): CourseProgress {
  let totalLessons = 0;
  let completedLessons = 0;
  let totalTimeSpent = 0;

  course.chapters.forEach(chapter => {
    totalLessons += chapter.lessons.length;
    completedLessons += chapter.lessons.filter(lesson => lesson.completed).length;
    totalTimeSpent += chapter.lessons.reduce((total, lesson) => total + lesson.timeSpent, 0);
  });

  return {
    totalLessons,
    completedLessons,
    totalTimeSpent,
    percentageComplete: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  };
}

export function calculateChapterProgress(chapter: Chapter): CourseProgress {
  const totalLessons = chapter.lessons.length;
  const completedLessons = chapter.lessons.filter(lesson => lesson.completed).length;
  const totalTimeSpent = chapter.lessons.reduce((total, lesson) => total + lesson.timeSpent, 0);

  return {
    totalLessons,
    completedLessons,
    totalTimeSpent,
    percentageComplete: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  };
}
