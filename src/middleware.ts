import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    const errorText = `Action Required: Your Supabase environment variables are not configured correctly.
Please open the '.env.local' file in the file explorer on the left.
Then, replace the placeholder values with your actual Supabase URL and Anon Key.
You can find these keys in your Supabase project settings under 'API'.
After saving the file, you MUST restart the development server for the changes to take effect.`;
    
    return new NextResponse(
        `<div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
            <h1 style="color: #d9534f;">Configuration Error</h1>
            <p style="font-size: 1.1rem; color: #333; white-space: pre-wrap;">${errorText}</p>
         </div>`,
        { 
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        }
    );
  }

  try {
    new URL(supabaseUrl);
  } catch (e) {
     const errorText = `The Supabase URL you provided in '.env.local' is not a valid URL.
It should look exactly like this: https://<your-project-ref>.supabase.co
Please correct the URL in the .env.local file and restart the development server.
Error: ${(e as Error).message}`;

     return new NextResponse(
        `<div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
            <h1 style="color: #d9534f;">Configuration Error</h1>
            <p style="font-size: 1.1rem; color: #333; white-space: pre-wrap;">${errorText}</p>
         </div>`,
        { 
            status: 500,
            headers: { 'Content-Type': 'text/html' }
        }
    );
  }


  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const authRoutes = ['/login', '/register']
  if (user && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * This ensures that the middleware runs on all pages and API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
