'use server';

import {NextResponse} from 'next/server';
import {tasks} from '@/lib/data';

export async function GET(request: Request) {
  try {
    // In a real app, you'd fetch tasks for the authenticated user.
    // For now, we return all tasks.
    return NextResponse.json(tasks);
  } catch (error) {
    console.error(`Failed to fetch tasks:`, error);
    return NextResponse.json(
      {message: 'An error occurred while fetching tasks'},
      {status: 500}
    );
  }
}
