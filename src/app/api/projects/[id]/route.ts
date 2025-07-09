import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tasks as mockTasks } from '@/lib/data'; // Keep for progress calculation
import type { Project } from '@/lib/types';

// Helper to calculate progress based on mock tasks.
// This will be replaced when tasks are migrated to Supabase.
const getProgressForProject = (projectId: string) => {
    const projectTasks = mockTasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
};


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: projectData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !projectData) {
      if (error?.code === 'PGRST116') { // Error when no rows are found
        return NextResponse.json({ message: 'Project not found' }, { status: 404 });
      }
      throw error;
    }
    
    const progress = getProgressForProject(projectData.id);
    
    let status: Project['status'] = projectData.status;
    if (progress === 100 && status !== 'Completed') {
        status = 'Completed';
    } else if (progress < 100 && status === 'Completed') {
        status = 'On Track'; // Revert if tasks are added/reopened
    }

    // Construct the client-facing project object
    const projectWithDetails: Project = { 
        ...projectData, 
        description: projectData.description ?? undefined,
        color: projectData.color ?? undefined,
        progress,
        status,
        members: [] // Members are not yet in the database
    };

    return NextResponse.json(projectWithDetails);
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
    const { name, description, color, status } = body;

    // Note: 'members' are not handled yet as they are not in the DB schema
    const updateData: { name?: string; description?: string; color?: string; status?: Project['status'] } = {};

    if (name !== undefined) {
      if (!name) {
        return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
      }
      updateData.name = name;
    }
    if (description !== undefined) {
      updateData.description = description || '';
    }
    if (color !== undefined) {
      updateData.color = color || '#6366f1';
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    const progress = getProgressForProject(updatedProject.id);
    const clientProject = {...updatedProject, progress, members: [] }

    return NextResponse.json(clientProject);
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
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    // Once tasks are in Supabase, we would handle cascading deletes or orphaned tasks here.
    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while deleting the project' }, { status: 500 });
  }
}
