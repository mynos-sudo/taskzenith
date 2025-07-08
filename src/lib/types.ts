export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
};

export type Project = {
  id: string;
  name: string;
  status: "On Track" | "At Risk" | "Off Track" | "Completed";
  members: User[];
  progress: number;
};

export type TaskStatus = "todo" | "in-progress" | "done" | "backlog";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignees: User[];
  projectId: string;
};

export type KanbanColumn = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};
