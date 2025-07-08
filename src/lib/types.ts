export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
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
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};