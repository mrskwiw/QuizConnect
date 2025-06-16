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
          username: string
          email: string
          avatar_url: string | null
          bio: string | null
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          user_id: string
          quizzes_created: number
          quizzes_taken: number
          average_score: number
          total_points: number
          followers: number
          following: number
          updated_at: string
        }
        Insert: {
          user_id: string
          quizzes_created?: number
          quizzes_taken?: number
          average_score?: number
          total_points?: number
          followers?: number
          following?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          quizzes_created?: number
          quizzes_taken?: number
          average_score?: number
          total_points?: number
          followers?: number
          following?: number
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          author_id: string
          title: string
          description: string
          category: string
          difficulty: string
          is_public: boolean
          time_limit: number | null
          pass_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          description: string
          category: string
          difficulty: string
          is_public?: boolean
          time_limit?: number | null
          pass_threshold: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          description?: string
          category?: string
          difficulty?: string
          is_public?: boolean
          time_limit?: number | null
          pass_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}