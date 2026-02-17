'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(
  formData: {
    email: string
    password: string
    name: string
    college: string
    branch: string
    semester: number
    year: number
  },
  origin: string
) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: formData.name,
        college: formData.college,
        branch: formData.branch,
        semester: formData.semester,
        year: formData.year,
      }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user' }
  }

  // Check if email confirmation is required
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: 'User already exists' }
  }

  return { success: true, message: 'Account created! Check your email to confirm.' }
}

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  return user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function updateProfile(formData: {
  name: string
  college: string
  branch: string
  semester: number
  year: number
  bio?: string
  profile_picture_url?: string
}) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.name,
      college: formData.college,
      branch: formData.branch,
      semester: formData.semester,
      year: formData.year,
      bio: formData.bio,
      profile_picture_url: formData.profile_picture_url,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
