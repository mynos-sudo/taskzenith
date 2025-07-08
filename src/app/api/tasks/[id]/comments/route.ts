import { NextResponse } from 'next/server';
import { tasks, users, comments } from '@/lib/data';
import type { Comment } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { content } = body;
    const taskId = params.id;

    if (!content) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 });
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // In a real app, you'd get the user from the auth session
    const author = users[0]; 

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      author,
    };

    // For this mock, we are persisting it to the in-memory array.
    comments.push(newComment);
    task.comments.push(newComment);

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(`Failed to create comment for task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the comment' }, { status: 500 });
  }
}
