import { NextResponse } from 'next/server';
import { tasks, users } from '@/lib/data';
import type { Task } from '@/lib/types';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await request.json();
    const { title, description, priority, dueDate, assignees: assigneeIds = [] } = body;

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    if (!title || !priority) {
      return NextResponse.json({ message: 'Title and priority are required' }, { status: 400 });
    }

    const assignedUsers = users.filter(user => assigneeIds.includes(user.id));
    const now = new Date().toISOString();

    const updatedTask: Task = {
      ...tasks[taskIndex],
      title,
      description: description || '',
      priority,
      dueDate,
      assignees: assignedUsers,
      updatedAt: now,
    };

    tasks[taskIndex] = updatedTask;

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Failed to update task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while updating the task' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    tasks.splice(taskIndex, 1);

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while deleting the task' }, { status: 500 });
  }
}
