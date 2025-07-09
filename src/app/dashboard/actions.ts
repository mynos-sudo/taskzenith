'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

export async function updateProfile(formData: FormData) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }
  
  const name = formData.get('name') as string

  const schema = z.string().min(2, { message: 'Name must be at least 2 characters long.' });
  const validation = schema.safeParse(name);

  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name: validation.data })
    .eq('id', user.id)

  if (error) {
    return { error: `Could not update profile: ${error.message}` }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/layout') // To update header/sidebar immediately
  return { success: 'Profile updated successfully.' }
}


export async function updatePassword(formData: FormData) {
  const supabase = createClient()
  
  const newPassword = formData.get('newPassword') as string

  const schema = z.string().min(6, { message: 'Password must be at least 6 characters long.' });
  const validation = schema.safeParse(newPassword);

  if (!validation.success) {
      return { error: validation.error.errors[0].message };
  }
  
  const { error } = await supabase.auth.updateUser({ password: validation.data })

  if (error) {
    return { error: `Could not update password: ${error.message}` }
  }
  
  return { success: 'Password updated successfully. You might be logged out.' }
}
