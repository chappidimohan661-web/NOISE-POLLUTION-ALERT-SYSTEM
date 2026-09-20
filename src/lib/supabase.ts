import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';
export type AlertStatus = 'Safe' | 'Moderate' | 'High' | 'Dangerous';

export interface NoiseReading {
  id: number;
  noise_level: number;
  safe_limit: number;
  time_period: TimePeriod;
  status: AlertStatus;
  ai_recommendation: string;
  recorded_at: string;
}
