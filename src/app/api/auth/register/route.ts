import {NextResponse} from 'next/server';
import {users} from '@/lib/data';

export async function POST(request: Request) {
  try {
    const {name, email, password} = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        {message: 'Name, email, and password are required.'},
        {status: 400}
      );
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        {message: 'User with this email already exists.'},
        {status: 409}
      );
    }

    // In a real app, you would hash the password and create a new user in the database here.
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
    };
    
    // Note: This does not persist the new user to the mock data `users` array.
    // It just simulates a successful creation.

    const token = 'dummy-jwt-token-for-new-user';

    return NextResponse.json({token, user: newUser}, {status: 201});
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {message: 'An error occurred during registration.'},
      {status: 500}
    );
  }
}
