import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const html = `
      <div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
        <h1 style="color: #d9534f;">Action Manuelle Requise: Fichier .env.local manquant ou vide</h1>
        <p style="font-size: 1.1rem; color: #333; white-space: pre-wrap;">Les variables d'environnement Supabase ne sont pas chargées.
          
          <strong>Comment corriger :</strong>
          <ol style="line-height: 1.6;">
            <li>Assurez-vous qu'un fichier nommé <strong>.env.local</strong> existe à la racine de votre projet.</li>
            <li>Assurez-vous que ce fichier contient les variables <strong>NEXT_PUBLIC_SUPABASE_URL</strong> et <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> avec leurs valeurs.</li>
            <li><strong>TRÈS IMPORTANT :</strong> Redémarrez le serveur de développement après avoir créé ou modifié le fichier.</li>
          </ol>
        </p>
      </div>
    `
    return new NextResponse(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    new URL(supabaseUrl)
  } catch (e) {
     const html = `
      <div style="font-family: sans-serif; padding: 2rem; background-color: #fff3f3; border: 1px solid #ffcccc; border-radius: 8px;">
        <h1 style="color: #d9534f;">Action Manuelle Requise: URL Supabase Invalide</h1>
        <p style="font-size: 1.1rem; color: #333; white-space: pre-wrap;">L'URL Supabase que vous avez fournie dans '.env.local' est invalide.
          
          <strong>Comment corriger :</strong>
          <ol style="line-height: 1.6;">
            <li>Allez dans votre tableau de bord Supabase -> Project Settings -> API.</li>
            <li>Copiez l'URL complète qui se trouve dans la section "Project URL".</li>
            <li>Collez cette URL dans le fichier <strong>.env.local</strong> pour la variable NEXT_PUBLIC_SUPABASE_URL.</li>
            <li>L'URL doit être complète et commencer par https://, par exemple: <strong>https://&lt;votre-id-projet&gt;.supabase.co</strong></li>
            <li><strong>TRÈS IMPORTANT :</strong> Redémarrez le serveur de développement.</li>
          </ol>
        </p>
      </div>
    `
    return new NextResponse(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const authRoutes = ['/login', '/register']
  if (user && (authRoutes.includes(pathname) || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
