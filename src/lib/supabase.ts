import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type AlertStatus = 'Safe' | 'Moderate' | 'High' | 'Dangerous';
export type Role = 'teacher' | 'student' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  department: string | null;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  roll_no: string;
  department: string;
  year: number;
  section: string;
  email: string | null;
  created_at: string;
}

export interface AttendanceRow {
  id: string;
  student_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface MarksRow {
  id: string;
  student_id: string;
  subject: string;
  internal: number;
  external: number;
  total: number;
  created_at: string;
}

export interface NoiseReading {
  id: number;
  noise_level: number;
  safe_limit: number;
  time_period: TimePeriod;
  status: AlertStatus;
  ai_recommendation: string;
  recorded_at: string;
}
