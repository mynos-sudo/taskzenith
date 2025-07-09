import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/lib/types';
import { tasks as mockTasks } from '@/lib/data'; // Keep mock tasks for now

// A helper function to fetch tasks for a project and calculate progress.
// In a real app, this would also fetch from a 'tasks' table in Supabase.
const getProgressForProject = (projectId: string) => {
    const projectTasks = mockTasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    
    let query = supabase.from('projects').select('*');

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit)) {
        query = query.limit(parsedLimit);
      }
    }

    const { data: projectsData, error } = await query;
    
    if (error) {
      throw error;
    }

    // For now, we'll continue calculating progress based on mock tasks
    // and injecting mock members until those are also migrated to Supabase.
    const projectsWithProgress = projectsData.map(project => {
        const progress = getProgressForProject(project.id);
        
        let status: Project['status'] = project.status;
        if (progress === 100) {
            status = 'Completed';
        } else if (project.status === 'Completed') {
            status = 'On Track';
        }

        return { ...project, progress, status, members: [] }; // Return empty members for now
    });

    return NextResponse.json(projectsWithProgress);
  } catch (error) {
      console.error('Failed to fetch projects from Supabase:', error);
      return NextResponse.json({ message: 'An error occurred while fetching projects.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, color } = body;

        if (!name) {
            return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
        }
        
        const newProjectData = {
            name,
            description: description || '',
            status: 'On Track' as const,
            color: color || '#6366f1',
        };

        const { data, error } = await supabase
            .from('projects')
            .insert(newProjectData)
            .select()
            .single(); // .single() returns a single object instead of an array

        if (error) {
          throw error;
        }
        
        // Add progress and empty members to match the expected client-side type
        const newProject = {
          ...data,
          progress: 0,
          members: []
        }
        
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Project creation failed:', error);
        return NextResponse.json({ message: 'An error occurred while creating the project' }, { status: 500 });
    }
}
