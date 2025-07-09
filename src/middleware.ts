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

  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL' || !supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    const errorText = `Action Requise: Vos clés d'API Supabase ne sont pas configurées.

Comment corriger :
1. Ouvrez le fichier '.env.local' dans l'explorateur de fichiers.
2. Allez sur le site de Supabase et ouvrez les paramètres API de votre projet.
3. Copiez vos clés ("Project URL" et "anon public key").
4. Collez-les dans le fichier '.env.local'.
5. **TRÈS IMPORTANT** : Redémarrez le serveur de développement.`;
    
    return new NextResponse(
        `<div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
            <h1 style="color: #d9534f;">Action Manuelle Requise</h1>
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
     const errorText = `Action Requise: Votre URL Supabase dans le fichier '.env.local' est invalide.
Il semble que la partie "<your-project-ref>" (la référence de votre projet) est manquante ou incorrecte.

Comment corriger (dernière étape !) :
1. Allez dans votre tableau de bord Supabase.
2. Naviguez vers "Project Settings", puis "API".
3. Copiez l'URL complète qui se trouve dans la section "Project URL".
4. Collez cette URL dans le fichier \`.env.local\` pour la variable NEXT_PUBLIC_SUPABASE_URL.
5. **TRÈS IMPORTANT** : Redémarrez le serveur de développement.`;

     return new NextResponse(
        `<div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
            <h1 style="color: #d9534f;">Action Manuelle Requise</h1>
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
