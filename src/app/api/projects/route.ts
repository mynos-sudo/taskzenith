import { NextResponse } from 'next/server';
import { projects, users, tasks } from '@/lib/data';
import type { Project } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  
  const projectsWithProgress = projects.map(project => {
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    let status: Project['status'] = 'On Track';
    if (progress === 100) {
        status = 'Completed';
    } else if (project.status === 'Off Track' || project.status === 'At Risk') {
        // Keep existing risk status unless completed
        status = project.status;
    }

    return { ...project, progress, status };
  });

  let projectData = projectsWithProgress;
  
  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit)) {
      projectData = projectsWithProgress.slice(0, parsedLimit);
    }
  }
  
  // In a real app, you'd fetch this from a database.
  return NextResponse.json(projectData);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, color } = body;

        if (!name) {
            return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
        }

        // In a real app, you'd get the user from the auth session
        const owner = users[0]; 

        const newProject: Project = {
            id: `proj-${Date.now()}`,
            name,
            description: description || '',
            status: 'On Track',
            members: [{ user: owner, role: 'OWNER' }],
            progress: 0,
            color: color || '#6366f1',
        };

        // For this mock, we are persisting it to the in-memory array.
        projects.unshift(newProject);

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Project creation failed:', error);
        return NextResponse.json({ message: 'An error occurred while creating the project' }, { status: 500 });
    }
}
