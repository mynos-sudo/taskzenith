import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar');

    if (profilesError) throw profilesError;

    const teamMembersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const { count, error: tasksError } = await supabase
          .from('tasks')
          .select('id, task_assignees!inner(user_id)', { count: 'exact', head: true })
          .eq('task_assignees.user_id', profile.id)
          .in('status', ['todo', 'in-progress', 'backlog']);
        
        if (tasksError) {
          console.error(`Error fetching task count for ${profile.name}: `, tasksError.message);
        }

        return {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar ?? `https://i.pravatar.cc/150?u=${profile.id}`,
          activeTasks: tasksError ? 0 : count ?? 0,
          email: `user-${profile.id}@example.com`,
        };
      })
    );

    return NextResponse.json(teamMembersWithStats);
  } catch (error) {
    console.error('Failed to fetch team data:', error);
    return NextResponse.json({ message: 'An error occurred while fetching team data' }, { status: 500 });
  }
}
