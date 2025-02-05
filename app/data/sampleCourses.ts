import { Course } from '../types/course';

export const sampleCourses: Course[] = [
  {
    id: '1',
    title: 'מתמטיקה',
    description: 'קורס מתמטיקה בסיסי',
    order: 1,
    chapters: [
      {
        id: '1-1',
        title: 'אלגברה',
        order: 1,
        lessons: [
          {
            id: '1-1-1',
            title: 'משוואות ליניאריות',
            description: 'פתרון משוואות מדרגה ראשונה',
            completed: false,
            timeSpent: 0,
            estimatedTime: 60,
            order: 1,
          },
          {
            id: '1-1-2',
            title: 'משוואות ריבועיות',
            description: 'פתרון משוואות מדרגה שנייה',
            completed: false,
            timeSpent: 0,
            estimatedTime: 90,
            order: 2,
          },
        ],
      },
      {
        id: '1-2',
        title: 'גיאומטריה',
        order: 2,
        lessons: [
          {
            id: '1-2-1',
            title: 'משולשים',
            description: 'תכונות של משולשים',
            completed: false,
            timeSpent: 0,
            estimatedTime: 45,
            order: 1,
          },
        ],
      },
    ],
  },
];
