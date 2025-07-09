import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const [
        { count: totalProjects },
        { count: activeTasks },
        { count: tasksCompleted },
        { count: teamMembers }
    ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).in('status', ['todo', 'in-progress']),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
    ]);


    const stats = {
      totalProjects: totalProjects ?? 0,
      activeTasks: activeTasks ?? 0,
      tasksCompleted: tasksCompleted ?? 0,
      teamMembers: teamMembers ?? 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ message: 'An error occurred while fetching stats' }, { status: 500 });
  }
}
