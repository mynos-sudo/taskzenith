'use server';

import {NextResponse} from 'next/server';
import { createClient } from '@/lib/supabase';
import type { Task } from '@/lib/types';

// Helper to shape Supabase task data into the client-side Task type
const shapeTaskData = (task: any): Task => {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      assignees: task.task_assignees?.map((a: any) => ({
        id: a.profiles.id,
        name: a.profiles.name,
        email: `user-${a.profiles.id}@example.com`,
        avatar: a.profiles.avatar ?? `https://i.pravatar.cc/150?u=${a.profiles.id}`
      })).filter((a: any) => a.id) || [],
      projectId: task.project_id,
      project: task.projects ? {
        id: task.projects.id,
        name: task.projects.name,
        color: task.projects.color,
      } : undefined,
      dueDate: task.due_date ?? undefined,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      comments: task.comments?.map((c: any) => ({
          id: c.id,
          content: c.content,
          createdAt: c.created_at,
          author: c.profiles ? {
              id: c.profiles.id,
              name: c.profiles.name,
              email: `user-${c.profiles.id}@example.com`,
              avatar: c.profiles.avatar ?? `https://i.pravatar.cc/150?u=${c.profiles.id}`
          } : null,
      })).filter((c: any) => c.author) || []
    };
};

export async function GET(request: Request) {
  try {
     const supabase = createClient();
     const { data, error } = await supabase
      .from('tasks')
      .select('*, projects (id, name, color), task_assignees(*, profiles(*)), comments(*, profiles(*))');

    if (error) {
      throw error;
    }

    const clientTasks = data.map(shapeTaskData);
    return NextResponse.json(clientTasks);
  } catch (error) {
    console.error(`Failed to fetch tasks:`, error);
    return NextResponse.json(
      {message: 'An error occurred while fetching tasks'},
      {status: 500}
    );
  }
}
