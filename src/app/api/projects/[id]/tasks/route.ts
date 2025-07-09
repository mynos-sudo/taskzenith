import { NextResponse } from 'next/server';
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


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_assignees(*, users(*)), comments(*, users(*))')
      .eq('project_id', params.id);

    if (error) {
      throw error;
    }

    const clientTasks = data.map(shapeTaskData);
    return NextResponse.json(clientTasks);
  } catch (error) {
    console.error(`Failed to fetch tasks for project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching tasks' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, priority, dueDate, assignees: assigneeIds = [] } = body;
    const projectId = params.id;

    if (!title || !priority) {
      return NextResponse.json({ message: 'Title and priority are required' }, { status: 400 });
    }

    const taskId = `task-${Date.now()}`;
    const now = new Date().toISOString();

    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        id: taskId,
        title,
        description: description || null,
        status: 'todo',
        priority,
        due_date: dueDate,
        project_id: projectId,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (taskError) {
      throw taskError;
    }

    if (assigneeIds.length > 0) {
      const assigneeRecords = assigneeIds.map((userId: string) => ({ task_id: taskId, user_id: userId }));
      const { error: assigneeError } = await supabase.from('task_assignees').insert(assigneeRecords);
      if (assigneeError) {
        // In a real app, we might want to roll back the task creation.
        // For now, we'll log the error and continue. The client will still get the created task.
        console.error("Failed to add assignees during task creation:", assigneeError);
      }
    }
    
    // The new task object doesn't have relations, so we create a client-compatible version
    const clientTask: Task = {
        ...newTask,
        status: 'todo',
        priority: priority,
        description: newTask.description ?? undefined,
        dueDate: newTask.due_date ?? undefined,
        projectId: newTask.project_id,
        assignees: [], // Client can re-fetch or handle this optimistically
        comments: [],
    }

    return NextResponse.json(clientTask, { status: 201 });
  } catch (error) {
    console.error(`Failed to create task for project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the task' }, { status: 500 });
  }
}
