import { NextResponse } from 'next/server';
import { projects } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = projects.find(p => p.id === params.id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // In a real app, you would also check if the authenticated user has access to this project.
    return NextResponse.json(project);
  } catch (error) {
    console.error(`Failed to fetch project ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching the project' }, { status: 500 });
  }
}
