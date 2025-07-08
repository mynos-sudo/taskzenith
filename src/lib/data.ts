import type { Project, Task, User, KanbanColumn } from "./types";

export const users: User[] = [
  { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", avatar: "https://i.pravatar.cc/150?u=ada" },
  { id: "user-2", name: "Grace Hopper", email: "grace@example.com", avatar: "https://i.pravatar.cc/150?u=grace" },
  { id: "user-3", name: "Charles Babbage", email: "charles@example.com", avatar: "https://i.pravatar.cc/150?u=charles" },
  { id: "user-4", name: "Alan Turing", email: "alan@example.com", avatar: "https://i.pravatar.cc/150?u=alan" },
];

export const projects: Project[] = [
  {
    id: "proj-1",
    name: "QuantumLeap Engine",
    status: "On Track",
    members: [
      { user: users[0], role: "OWNER" },
      { user: users[1], role: "MEMBER" },
    ],
    progress: 75,
  },
  {
    id: "proj-2",
    name: "Project Nebula",
    status: "On Track",
    members: [
      { user: users[1], role: "OWNER" },
      { user: users[2], role: "MEMBER" },
      { user: users[3], role: "MEMBER" },
    ],
    progress: 40,
  },
  {
    id: "proj-3",
    name: "DataWeave Initiative",
    status: "At Risk",
    members: [
      { user: users[0], role: "OWNER" },
      { user: users[3], role: "VIEWER" },
    ],
    progress: 20,
  },
  {
    id: "proj-4",
    name: "Phoenix Framework R&D",
    status: "Completed",
    members: [
      { user: users[0], role: "MEMBER" },
      { user: users[1], role: "OWNER" },
      { user: users[2], role: "MEMBER" },
    ],
    progress: 100,
  },
  {
    id: "proj-5",
    name: "Mobile First Design System",
    status: "Off Track",
    members: [
      { user: users[1], role: "OWNER" },
      { user: users[3], role: "MEMBER" },
    ],
    progress: 10,
  },
];

export const tasks: Task[] = [
  { id: "task-1", title: "Implement authentication module", status: "done", priority: "high", assignees: [users[0]], projectId: "proj-1" },
  { id: "task-2", title: "Design database schema", status: "in-progress", priority: "high", assignees: [users[1]], projectId: "proj-1" },
  { id: "task-3", title: "Develop API for user profiles", status: "in-progress", priority: "medium", assignees: [users[1]], projectId: "proj-1" },
  { id: "task-4", title: "Create UI mockups for dashboard", status: "todo", priority: "medium", assignees: [], projectId: "proj-1" },
  { id: "task-5", title: "Set up CI/CD pipeline", status: "todo", priority: "critical", assignees: [], projectId: "proj-1" },
  { id: "task-6", title: "Initial research on scaling solutions", status: "done", priority: "low", assignees: [users[2]], projectId: "proj-2" },
  { id: "task-7", title: "User testing for new feature", status: "backlog", priority: "medium", assignees: [], projectId: "proj-1" },
  { id: "task-8", title: "Fix bug in reporting service", status: "in-progress", priority: "high", assignees: [users[3]], projectId: "proj-2" },
];

export const kanbanColumns: Omit<KanbanColumn, 'tasks'>[] = [
    { id: "backlog", title: "Backlog" },
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
];

export const getProjectTasks = (projectId: string): Task[] => {
    return tasks.filter(task => task.projectId === projectId);
}
