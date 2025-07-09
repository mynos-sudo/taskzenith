import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import type { Task, User } from '@/lib/types';

// Helper to shape Supabase task data into the client-side Task type
const shapeTaskData = (task: any, projectData?: any): Task => {
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
      project: projectData ? {
        id: projectData.id,
        name: projectData.name,
        color: projectData.color
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


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, color')
        .eq('id', params.id)
        .single();
    
    if (projectError) throw projectError;

    const { data, error } = await supabase
      .from('tasks')
      .select('*, task_assignees(*, profiles(*)), comments(*, profiles(*))')
      .eq('project_id', params.id);

    if (error) {
      throw error;
    }

    const clientTasks = data.map(task => shapeTaskData(task, projectData));
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
    const supabase = createClient();
    const body = await request.json();
    const { title, description, priority, dueDate, assignees: assigneeIds = [] } = body;
    const projectId = params.id;

    if (!title || !priority) {
      return NextResponse.json({ message: 'Title and priority are required' }, { status: 400 });
    }

    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        status: 'todo',
        priority,
        due_date: dueDate,
        project_id: projectId,
      })
      .select()
      .single();

    if (taskError) {
      throw taskError;
    }

    if (assigneeIds.length > 0) {
      const assigneeRecords = assigneeIds.map((userId: string) => ({ task_id: newTask.id, user_id: userId }));
      const { error: assigneeError } = await supabase.from('task_assignees').insert(assigneeRecords);
      if (assigneeError) {
        console.error("Failed to add assignees during task creation:", assigneeError);
      }
    }
    
    // Re-fetch the task to get all relations for the response
     const { data: finalTaskData, error: finalTaskError } = await supabase
        .from('tasks')
        .select('*, task_assignees(*, profiles(*)), comments(*, profiles(*))')
        .eq('id', newTask.id)
        .single();
    
    if (finalTaskError) throw finalTaskError;


    return NextResponse.json(shapeTaskData(finalTaskData), { status: 201 });
  } catch (error) {
    console.error(`Failed to create task for project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the task' }, { status: 500 });
  }
}
