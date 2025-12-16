import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using local storage fallback.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types matching our schema
export interface DbActivity {
  id: string;
  name: string;
  created_at: string;
  order_index: number;
}

export interface DbLog {
  id: string;
  activity_id: string;
  logged_date: string;
  created_at: string;
}

export interface DbNote {
  id: string;
  logged_date: string;
  text: string;
  created_at: string;
  updated_at: string;
}

