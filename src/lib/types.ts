export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type User = Profile; // Alias for backwards compatibility if needed

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: User;
};

export type ProjectRole = "OWNER" | "MEMBER" | "VIEWER";

export type ProjectMember = {
  user: User;
  role: ProjectRole;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  status: "On Track" | "At Risk" | "Off Track" | "Completed";
  members: ProjectMember[];
  progress: number;
};

export type TaskStatus = "todo" | "in-progress" | "done" | "backlog";

export type Priority = "low" | "medium" | "high" | "critical";

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignees: User[];
  projectId: string;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
};

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};

export type ProjectSummary = {
  summary: string;
  outlook: "Positive" | "Neutral" | "Concerning";
  suggestedAction: string;
};


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

type ProfileSchema = {
    id: string; // uuid, references auth.users.id
    name: string; // text
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
    author_id: string; // uuid
    created_at: string; // timestamptz
}
type TaskAssigneeSchema = {
    task_id: string; // text
    user_id: string; // uuid
}


export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectSchema;
        Insert: Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectSchema, 'id' | 'created_at' | 'updated_at'>>;
      };
      profiles: {
        Row: ProfileSchema;
        Insert: ProfileSchema;
        Update: Partial<ProfileSchema>;
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
