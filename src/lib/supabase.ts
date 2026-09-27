import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client for client components
export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// For backwards compatibility - create client directly
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Task { id: string; user_id: string; title: string; description?: string; priority: 'low' | 'medium' | 'high'; completed: boolean; created_at: string; }
export interface Habit { id: string; user_id: string; name: string; description?: string; frequency: string; created_at: string; }
export interface HabitLog { id: string; user_id: string; habit_id: string; date: string; completed: boolean; }
export interface Goal { id: string; user_id: string; title: string; target_value: number; current_value: number; unit: string; completed: boolean; created_at: string; }
export interface Meal { id: string; user_id: string; name: string; meal_type: string; calories: number; date: string; created_at: string; }
export interface MoodLog { id: string; user_id: string; mood: string; score: number; notes?: string; date: string; created_at: string; }
export interface SleepLog { id: string; user_id: string; hours: number; quality: number; date: string; created_at: string; }
export interface ExerciseLog { id: string; user_id: string; exercise: string; duration: number; date: string; created_at: string; }
export interface Note { id: string; user_id: string; title: string; content: string; created_at: string; }
export interface WeightLog { id: string; user_id: string; weight: number; date: string; created_at: string; }
