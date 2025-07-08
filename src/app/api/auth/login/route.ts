import {NextResponse} from 'next/server';
import {users} from '@/lib/data';

export async function POST(request: Request) {
  try {
    const {email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {message: 'Email and password are required.'},
        {status: 400}
      );
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        {message: 'Invalid credentials'},
        {status: 401}
      );
    }

    // In a real app, you'd verify the password here.
    // For now, we just check if the user exists.

    // In a real app, you'd sign a JWT.
    const token = 'dummy-jwt-token-for-testing';

    return NextResponse.json({token, user});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {message: 'An error occurred during login.'},
      {status: 500}
    );
  }
}
