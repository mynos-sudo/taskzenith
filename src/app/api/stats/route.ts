import { NextResponse } from 'next/server';
import { projects, tasks, users } from '@/lib/data';

export async function GET(request: Request) {
  try {
    const totalProjects = projects.length;
    const activeTasks = tasks.filter(task => task.status === 'in-progress' || task.status === 'todo').length;
    const tasksCompleted = tasks.filter(task => task.status === 'done').length;
    const teamMembers = users.length;

    const stats = {
      totalProjects,
      activeTasks,
      tasksCompleted,
      teamMembers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ message: 'An error occurred while fetching stats' }, { status: 500 });
  }
}
