import { NextResponse } from 'next/server';
import { projects, tasks } from '@/lib/data';
import type { Project } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = projects.find(p => p.id === params.id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    
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

    const projectWithProgress = { ...project, progress, status };


    // In a real app, you would also check if the authenticated user has access to this project.
    return NextResponse.json(projectWithProgress);
  } catch (error) {
    console.error(`Failed to fetch project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching the project' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const body = await request.json();
    const { name, description, color } = body;

    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      name,
      description: description || '',
      color: color || '#6366f1',
    };

    projects[projectIndex] = updatedProject;

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Failed to update project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while updating the project' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    projects.splice(projectIndex, 1);
    
    // Also delete associated tasks
    const remainingTasks = tasks.filter(task => task.projectId !== projectId);
    tasks.length = 0;
    Array.prototype.push.apply(tasks, remainingTasks);


    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while deleting the project' }, { status: 500 });
  }
}
