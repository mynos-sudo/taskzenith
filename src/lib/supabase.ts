import { createClient } from '@supabase/supabase-js'
import type { Project } from './types';

// This file is typed for the 'public' schema.
// You can add more schemas by duplicating this file and changing the generic.
// See: https://supabase.com/docs/guides/api/generating-types
export type Tables<T> = {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'progress' | 'members'>;
        Update: Partial<Omit<Project, 'id' | 'progress' | 'members'>>;
      };
      // Add other tables here...
    };
  };
}[T];


const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Tables<'public'>>(supabaseUrl, supabaseAnonKey);
