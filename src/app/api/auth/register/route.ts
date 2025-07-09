// This API route is no longer used.
// Authentication is now handled by Server Actions in src/app/(auth)/actions.ts
import {NextResponse} from 'next/server';

export async function POST() {
    return NextResponse.json({ message: "This endpoint is deprecated." }, { status: 404 });
}
