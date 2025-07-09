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

type UserSchema = {
    id: string; // text
    name: string; // text
    email: string; // text
    avatar: string | null; // text
}
type TaskSchema = {
    id: string; // text
    title: string; // text
    description: string | null; // text
    status: "todo" | "in-progress" | "done" | "backlog";
    priority: "low" | "medium" | "high" | "critical";
    due_date: string | null; // timestamptz
    project_id: string; // uuid
    created_at: string; // timestamptz
    updated_at: string; // timestamptz
}
type CommentSchema = {
    id: string; // text
    content: string; // text
    task_id: string; // text
    author_id: string; // text
    created_at: string; // timestamptz
}
type TaskAssigneeSchema = {
    task_id: string; // text
    user_id: string; // text
}


export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectSchema;
        Insert: Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: UserSchema;
        Insert: Omit<UserSchema, 'id'>;
        Update: Partial<Omit<UserSchema, 'id'>>;
      };
      tasks: {
        Row: TaskSchema;
        Insert: Omit<TaskSchema, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TaskSchema, 'id' | 'created_at' | 'project_id'>>;
      };
      comments: {
        Row: CommentSchema;
        Insert: Omit<CommentSchema, 'id' | 'created_at'>;
        Update: Partial<Omit<CommentSchema, 'id' | 'created_at'>>;
      };
      task_assignees: {
        Row: TaskAssigneeSchema;
        Insert: TaskAssigneeSchema;
        Update: never;
      }
    };
    Enums: {
      project_status: "On Track" | "At Risk" | "Off Track" | "Completed";
      task_status: "todo" | "in-progress" | "done" | "backlog";
      task_priority: "low" | "medium" | "high" | "critical";
    }
    Functions: {
        [_ in never]: never
    }
  };
};

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anonymous key are required.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
