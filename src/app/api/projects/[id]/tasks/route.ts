import { NextResponse } from 'next/server';
import { tasks } from '@/lib/data';

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
