import { NextResponse } from 'next/server';
import { tasks, users } from '@/lib/data';
import type { Task } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // In a real app, you would also check if the authenticated user has access to this project.
    const projectTasks = tasks.filter(task => task.projectId === params.id);
    return NextResponse.json(projectTasks);
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

    const assignedUsers = users.filter(user => assigneeIds.includes(user.id));
    const now = new Date().toISOString();

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: description || '',
      status: 'todo', // New tasks default to 'todo'
      priority,
      assignees: assignedUsers,
      projectId,
      dueDate,
      createdAt: now,
      updatedAt: now,
    };

    tasks.unshift(newTask);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(`Failed to create task for project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the task' }, { status: 500 });
  }
}