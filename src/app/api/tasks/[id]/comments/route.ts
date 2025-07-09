import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/lib/types';
import { users } from '@/lib/data'; // kept for mock user

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
    
    // In a real app, you'd get the user from the auth session
    const author = users[0];
    const commentId = `comment-${Date.now()}`;

    const { data: newCommentData, error } = await supabase
      .from('comments')
      .insert({
        id: commentId,
        content,
        task_id: taskId,
        author_id: author.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    // Shape the data for the client
    const clientComment: Comment = {
      id: newCommentData.id,
      content: newCommentData.content,
      createdAt: newCommentData.created_at,
      author: author,
    };

    return NextResponse.json(clientComment, { status: 201 });
  } catch (error) {
    console.error(`Failed to create comment for task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the comment' }, { status: 500 });
  }
}
