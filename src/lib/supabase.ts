import { createClient } from '@supabase/supabase-js'

// This file is typed for the 'public' schema.
// You can add more schemas by duplicating this file and changing the generic.
// See: https://supabase.com/docs/guides/api/generating-types

// Defines the schema for the 'projects' table to ensure type safety.
type ProjectSchema = {
    id: string; // uuid
    name: string;
    description: string | null;
    color: string | null;
    status: "On Track" | "At Risk" | "Off Track" | "Completed";
    created_at: string; // timestamptz
    updated_at: string; // timestamptz
}

export type Tables<T> = {
  public: {
    Tables: {
      projects: {
        Row: ProjectSchema;
        Insert: Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>>;
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
