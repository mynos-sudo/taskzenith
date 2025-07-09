'use server';

import {NextResponse} from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/lib/types';

// Helper to shape Supabase task data into the client-side Task type
const shapeTaskData = (task: any): Task => {
    return {
      id: task.id,
      title: task.title,
      description: task.description ?? undefined,
      status: task.status,
      priority: task.priority,
      assignees: task.task_assignees?.map((a: any) => a.users).filter(Boolean) || [],
      projectId: task.project_id,
      dueDate: task.due_date ?? undefined,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      comments: task.comments?.map((c: any) => ({
          id: c.id,
          content: c.content,
          createdAt: c.created_at,
          author: c.users
      })).filter(Boolean) || []
    };
};

export async function GET(request: Request) {
  try {
     const { data, error } = await supabase
      .from('tasks')
      .select('*, task_assignees(*, users(*)), comments(*, users(*))');

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
