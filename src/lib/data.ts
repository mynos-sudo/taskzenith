// DEPRECATION NOTICE: This file contains mock data for prototyping.
// It is being progressively replaced by live data from Firebase Firestore.
// Please refer to API routes and new service files for data fetching logic.

import type { Project, Task, User, KanbanColumn, Comment } from "./types";

export const users: User[] = [
  { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", avatar: "https://i.pravatar.cc/150?u=ada" },
  { id: "user-2", name: "Grace Hopper", email: "grace@example.com", avatar: "https://i.pravatar.cc/150?u=grace" },
  { id: "user-3", name: "Charles Babbage", email: "charles@example.com", avatar: "https://i.pravatar.cc/150?u=charles" },
  { id: "user-4", name: "Alan Turing", email: "alan@example.com", avatar: "https://i.pravatar.cc/150?u=alan" },
];

export let projects: Project[] = [
  {
    id: "proj-1",
    name: "QuantumLeap Engine",
    description: "A next-generation physics engine for hyper-realistic simulations.",
    color: "#6d28d9",
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
    description: "Exploration and mapping of uncharted digital territories.",
    color: "#be185d",
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
    description: "An initiative to unify and streamline data processing pipelines.",
    color: "#059669",
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
    description: "Research and development of a resilient, self-healing application framework.",
    color: "#ea580c",
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
    description: "Creating a comprehensive and accessible design system for all mobile platforms.",
    color: "#2563eb",
    status: "Off Track",
    members: [
      { user: users[1], role: "OWNER" },
      { user: users[3], role: "MEMBER" },
    ],
    progress: 10,
  },
];

export let comments: Comment[] = [
    { id: 'comment-1', content: 'Great idea, let\'s start with a solid foundation.', createdAt: '2024-05-01T11:00:00Z', author: users[1] },
    { id: 'comment-2', content: 'I\'ve pushed the initial schema to the dev branch.', createdAt: '2024-05-03T15:30:00Z', author: users[0] },
    { id: 'comment-3', content: 'Could you review my latest commit?', createdAt: '2024-05-06T12:00:00Z', author: users[1] },
];

export let tasks: Task[] = [
  { id: "task-1", title: "Implement authentication module", description: "Set up Passport.js with JWT strategy.", status: "done", priority: "high", assignees: [users[0]], projectId: "proj-1", createdAt: "2024-05-01T10:00:00Z", updatedAt: "2024-05-02T14:30:00Z", dueDate: "2024-05-10T23:59:59Z", comments: [comments[0]] },
  { id: "task-2", title: "Design database schema", description: "Define models for users, projects, and tasks.", status: "in-progress", priority: "high", assignees: [users[1]], projectId: "proj-1", createdAt: "2024-05-03T11:00:00Z", updatedAt: "2024-05-04T16:00:00Z", dueDate: "2024-05-15T23:59:59Z", comments: [comments[1]] },
  { id: "task-3", title: "Develop API for user profiles", description: "Create endpoints for getting and updating user data.", status: "in-progress", priority: "medium", assignees: [users[1]], projectId: "proj-1", createdAt: "2024-05-05T09:00:00Z", updatedAt: "2024-05-06T11:20:00Z", comments: [comments[2]] },
  { id: "task-4", title: "Create UI mockups for dashboard", description: "Use Figma to design the main dashboard view.", status: "todo", priority: "medium", assignees: [], projectId: "proj-1", createdAt: "2024-05-07T13:00:00Z", updatedAt: "2024-05-07T13:00:00Z", dueDate: "2024-05-20T23:59:59Z", comments: [] },
  { id: "task-5", title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment.", status: "todo", priority: "critical", assignees: [], projectId: "proj-1", createdAt: "2024-05-08T15:00:00Z", updatedAt: "2024-05-08T15:00:00Z", comments: [] },
  { id: "task-6", title: "Initial research on scaling solutions", description: "Investigate Kubernetes and serverless options.", status: "done", priority: "low", assignees: [users[2]], projectId: "proj-2", createdAt: "2024-04-20T10:00:00Z", updatedAt: "2024-04-25T12:00:00Z", comments: [] },
  { id: "task-7", title: "User testing for new feature", description: "Gather feedback from a focus group on the new Kanban view.", status: "backlog", priority: "medium", assignees: [], projectId: "proj-1", createdAt: "2024-05-09T18:00:00Z", updatedAt: "2024-05-09T18:00:00Z", comments: [] },
  { id: "task-8", title: "Fix bug in reporting service", description: "The quarterly report is showing incorrect revenue numbers.", status: "in-progress", priority: "high", assignees: [users[3]], projectId: "proj-2", createdAt: "2024-05-10T10:00:00Z", updatedAt: "2024-05-11T09:45:00Z", dueDate: "2024-05-12T23:59:59Z", comments: [] },
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
