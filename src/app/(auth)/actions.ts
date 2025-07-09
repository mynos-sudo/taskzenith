'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return redirect(`/login?message=Could not authenticate user: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    return redirect(`/register?message=Could not register user: ${error.message}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle() {
    const supabase = createClient();
    const origin = headers().get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/login?message=Could not authenticate with Google: ${error.message}`);
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function loginWithGitHub() {
    const supabase = createClient();
    const origin = headers().get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect(`/login?message=Could not authenticate with GitHub: ${error.message}`);
    }

    if (data.url) {
        redirect(data.url);
    }
}


export async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
}
