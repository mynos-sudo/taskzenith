import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import type { Project } from '@/lib/types';
import { tasks as mockTasks } from '@/lib/data'; // Keep mock tasks for now

// A helper function to fetch tasks for a project and calculate progress.
// In a real app, this would also fetch from Firestore.
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
    
    if (!db) {
      throw new Error("Firestore is not initialized.");
    }

    let query: admin.firestore.Query<admin.firestore.DocumentData> = db.collection('projects');

    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit)) {
        query = query.limit(parsedLimit);
      }
    }

    const projectsSnapshot = await query.get();
    const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));

    // For now, we'll continue calculating progress based on mock tasks
    // until the tasks are also migrated to Firestore.
    const projectsWithProgress = projectsData.map(project => {
        const progress = getProgressForProject(project.id);
        
        let status: Project['status'] = project.status;
        if (progress === 100) {
            status = 'Completed';
        } else if (project.status === 'Completed') {
            // If progress is not 100 but status is completed, revert to On Track
            status = 'On Track';
        }

        return { ...project, progress, status };
    });

    return NextResponse.json(projectsWithProgress);
  } catch (error) {
      console.error('Failed to fetch projects from Firestore:', error);
      return NextResponse.json({ message: 'An error occurred while fetching projects.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        if (!db) {
          throw new Error("Firestore is not initialized.");
        }

        const body = await request.json();
        const { name, description, color } = body;

        if (!name) {
            return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
        }
        
        // In a real app, you'd get the owner from Firebase Auth session
        const ownerId = 'user-1'; // Mock owner for now

        const newProjectData = {
            name,
            description: description || '',
            status: 'On Track',
            members: [{ userId: ownerId, role: 'OWNER' }], // Storing only IDs now
            color: color || '#6366f1',
        };

        const docRef = await db.collection('projects').add(newProjectData);
        
        const newProject = {
          id: docRef.id,
          ...newProjectData,
          progress: 0, // New projects have 0 progress
          // We'd need to fetch the user data to return the full member object
          members: []
        };
        
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Project creation failed:', error);
        return NextResponse.json({ message: 'An error occurred while creating the project' }, { status: 500 });
    }
}
