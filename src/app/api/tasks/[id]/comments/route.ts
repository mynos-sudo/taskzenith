import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import type { Comment } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { content } = body;
    const taskId = params.id;

    if (!content) {
      return NextResponse.json({ message: 'Comment content is required' }, { status: 400 });
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: authorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !authorProfile) {
        return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    const { data: newCommentData, error } = await supabase
      .from('comments')
      .insert({
        content,
        task_id: taskId,
        author_id: user.id,
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
      author: {
        id: authorProfile.id,
        name: authorProfile.name,
        email: user.email!,
        avatar: authorProfile.avatar ?? `https://i.pravatar.cc/150?u=${user.id}`,
      }
    };

    return NextResponse.json(clientComment, { status: 201 });
  } catch (error) {
    console.error(`Failed to create comment for task ${params.id}:`, error);
    return NextResponse.json({ message: 'An error occurred while creating the comment' }, { status: 500 });
  }
}
