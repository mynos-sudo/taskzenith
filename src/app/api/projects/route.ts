import { NextResponse } from 'next/server';
import { projects, users } from '@/lib/data';
import type { Project } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit');
  
  let projectData = projects;
  
  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit)) {
      projectData = projects.slice(0, parsedLimit);
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
