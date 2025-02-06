export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  progress: number;
  completed: boolean;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  type: 'user' | 'assistant';
  created_at: string;
}

export interface ContentItem {
  id: string;
  user_id: string;
  type: string;
  content: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  starred: boolean;
  created_at: string;
  cloudinary_public_id: string | null;
  cloudinary_url: string | null;
  title: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  file_url: string;
  cloudinary_public_id: string | null;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface LearningJournal {
  id: string;
  user_id: string;
  content: string;
  is_important: boolean;
  created_at: string;
  image_url: string | null;
  type: string;
  tags: string[];
}

export interface LibraryItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  file_details: {
    name: string;
    path: string;
    size: number;
    type: string;
  };
  is_starred: boolean;
  created_at: string;
  type: string;
  cloudinary_data: {
    url: string;
    size: number;
    format: string;
    publicId: string;
    resourceType: string;
  };
  cloudinary_urls: Record<string, string> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  event_id: string;
  event_type: string;
  phone_number: string;
  message: string;
  scheduled_for: string;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressTracking {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  created_at: string;
}

export interface Question {
  id: string;
  user_id: string;
  content: string;
  answer: string | null;
  is_answered: boolean;
  created_at: string;
  type: string;
}

export interface Schedule {
  id: string;
  user_id: string;
  day_name: string;
  schedule: Array<{
    time: string;
    activity: string;
  }>;
  created_at: string;
}

export interface StudyGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  deadline: string | null;
  completed: boolean;
  created_at: string;
}

export interface TimerDailySummary {
  id: string;
  user_id: string;
  date: string;
  total_study_time: number;
  total_break_time: number;
  created_at: string;
  updated_at: string;
}

export interface TimerSession {
  id: string;
  user_id: string;
  type: string;
  duration: number;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export interface Tweet {
  id: string;
  user_id: string;
  tweet_id: string;
  url: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  learning_goals: {
    daily: {
      time: number;
      unit: string;
    };
    monthly: {
      articles: number;
    };
  };
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_study_time: number;
  completed_tasks: number;
  streak_days: number;
  created_at: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string;
  video_id: string;
  user_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      achievements: Achievement;
      calendar_events: CalendarEvent;
      chat_messages: ChatMessage;
      content_items: ContentItem;
      course_progress: CourseProgress;
      documents: Document;
      learning_journal: LearningJournal;
      library_items: LibraryItem;
      notifications: Notification;
      progress_tracking: ProgressTracking;
      questions: Question;
      schedules: Schedule;
      study_goals: StudyGoal;
      timer_daily_summaries: TimerDailySummary;
      timer_sessions: TimerSession;
      tweets: Tweet;
      user_profiles: UserProfile;
      user_stats: UserStats;
      youtube_videos: YouTubeVideo;
    };
  };
}
