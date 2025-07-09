// DEPRECATION NOTICE: This file contains mock data for prototyping.
// It is being progressively replaced by live data from Supabase.
// Please refer to API routes and new service files for data fetching logic.

import type { Project, Task, User, KanbanColumn, Comment } from "./types";

// The mock users array is now deprecated and will be replaced by real user data from Supabase Auth.
export const users: User[] = [
  { id: "user-1", name: "Ada Lovelace", email: "ada@example.com", avatar: "https://i.pravatar.cc/150?u=ada" },
  { id: "user-2", name: "Grace Hopper", email: "grace@example.com", avatar: "https://i.pravatar.cc/150?u=grace" },
  { id: "user-3", name: "Charles Babbage", email: "charles@example.com", avatar: "https://i.pravatar.cc/150?u=charles" },
  { id: "user-4", name: "Alan Turing", email: "alan@example.com", avatar: "https://i.pravatar.cc/150?u=alan" },
];

// Mock projects are now fully replaced by Supabase. This array is kept for reference or legacy components if any.
export let projects: Project[] = [];

// Mock comments are now fully replaced by Supabase.
export let comments: Comment[] = [];

// Mock tasks are now fully replaced by Supabase.
export let tasks: Task[] = [];


export const kanbanColumns: Omit<KanbanColumn, 'tasks'>[] = [
    { id: "backlog", title: "Backlog" },
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "done", title: "Done" },
];
