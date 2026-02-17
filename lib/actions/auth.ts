'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signupWithOTP(formData: {
  email: string
  name: string
  college: string
  branch: string
  semester: number
  year: number
}) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email: formData.email,
    options: {
      data: {
        name: formData.name,
        college: formData.college,
        branch: formData.branch,
        semester: formData.semester,
        year: formData.year,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email for the magic link!' }
}

export async function loginWithOTP(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email for the magic link!' }
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
