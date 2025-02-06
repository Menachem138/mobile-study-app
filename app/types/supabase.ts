export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      timers: {
        Row: {
          id: string
          user_id: string
          type: string
          duration: number
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          duration?: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          due_date: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string | null
          order_index: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content?: string | null
          order_index: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string | null
          order_index?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      media_items: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          url: string
          description: string | null
          album_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          url: string
          description?: string | null
          album_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          url?: string
          description?: string | null
          album_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          user_id: string
          content: string
          answer: string | null
          is_answered: boolean
          created_at: string
          type: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          answer?: string | null
          is_answered?: boolean
          created_at?: string
          type?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          answer?: string | null
          is_answered?: boolean
          created_at?: string
          type?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          tags?: string[]
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
