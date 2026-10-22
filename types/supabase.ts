export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          academic_year: string | null;
          semester_name: string | null;
          primary_goal: string | null;
          theme: 'light' | 'dark' | 'system';
          daily_availability_hours: number;
          preferred_session_duration: number;
          preferred_time_of_day: string;
          session_pacing: string;
          break_frequency_minutes: number;
          prioritization_strategy: string;
          plan_explanation: string | null;
          onboarded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          academic_year?: string | null;
          semester_name?: string | null;
          primary_goal?: string | null;
          theme?: 'light' | 'dark' | 'system';
          daily_availability_hours?: number;
          preferred_session_duration?: number;
          preferred_time_of_day?: string;
          session_pacing?: string;
          break_frequency_minutes?: number;
          prioritization_strategy?: string;
          plan_explanation?: string | null;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          semester_id: string | null;
          name: string;
          code: string;
          exam_date: string;
          exam_time: string;
          difficulty: 'easy' | 'moderate' | 'difficult';
          prep_level: 'not_started' | 'beginner' | 'in_progress' | 'well_prepared';
          priority: 'high' | 'medium' | 'low';
          confidence: 'low' | 'medium' | 'high';
          color: string;
          syllabus_source: string | null;
          raw_syllabus_text: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          semester_id?: string | null;
          name: string;
          code?: string;
          exam_date: string;
          exam_time?: string;
          difficulty?: 'easy' | 'moderate' | 'difficult';
          prep_level?: 'not_started' | 'beginner' | 'in_progress' | 'well_prepared';
          priority?: 'high' | 'medium' | 'low';
          confidence?: 'low' | 'medium' | 'high';
          color?: string;
          syllabus_source?: string | null;
          raw_syllabus_text?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>;
      };
      topics: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          unit_id: string | null;
          title: string;
          status: 'not_started' | 'learning' | 'needs_revision' | 'confident';
          estimated_duration_minutes: number;
          actual_duration_minutes: number;
          difficulty: string | null;
          confidence: string | null;
          notes: string;
          last_studied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          unit_id?: string | null;
          title: string;
          status?: 'not_started' | 'learning' | 'needs_revision' | 'confident';
          estimated_duration_minutes?: number;
          actual_duration_minutes?: number;
          difficulty?: string | null;
          confidence?: string | null;
          notes?: string;
          last_studied_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['topics']['Insert']>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          topic_id: string | null;
          title: string;
          session_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          completed: boolean;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          topic_id?: string | null;
          title: string;
          session_date: string;
          start_time: string;
          end_time: string;
          duration_minutes?: number;
          completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['study_sessions']['Insert']>;
      };
      routine_commitments: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          days_of_week: number[];
          start_time: string;
          end_time: string;
          is_fixed: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string;
          days_of_week?: number[];
          start_time: string;
          end_time: string;
          is_fixed?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['routine_commitments']['Insert']>;
      };
      focus_records: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          topic_id: string | null;
          duration_minutes: number;
          completed_at: string;
          notes: string | null;
          rating: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          topic_id?: string | null;
          duration_minutes: number;
          completed_at?: string;
          notes?: string | null;
          rating?: string | null;
        };
        Update: Partial<Database['public']['Tables']['focus_records']['Insert']>;
      };
    };
  };
}
