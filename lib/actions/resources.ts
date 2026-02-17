'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUser } from './auth'
import type { ResourceInsert, ResourceUpdate, ResourceType } from '@/lib/types/database.types'

export async function uploadResource(formData: {
  title: string
  description?: string
  subject: string
  semester: number
  year_batch: string
  resource_type: ResourceType
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  tags: string[]
}) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Insert resource
  const resource: ResourceInsert = {
    user_id: user.id,
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    semester: formData.semester,
    year_batch: formData.year_batch,
    resource_type: formData.resource_type,
    file_url: formData.file_url,
    file_name: formData.file_name,
    file_size: formData.file_size,
    file_type: formData.file_type,
  }

  const { data: resourceData, error: resourceError } = await supabase
    .from('resources')
    .insert(resource)
    .select()
    .single()

  if (resourceError) {
    return { error: resourceError.message }
  }

  // Handle tags
  if (formData.tags.length > 0) {
    const tagError = await addTagsToResource(resourceData.id, formData.tags)
    if (tagError) {
      // Resource was created, but tags failed
      return { 
        error: `Resource created but tags failed: ${tagError}`,
        resourceId: resourceData.id 
      }
    }
  }

  revalidatePath('/resources')
  return { success: true, resourceId: resourceData.id }
}

export async function updateResource(
  resourceId: string,
  formData: {
    title: string
    description?: string
    subject: string
    semester: number
    year_batch: string
    resource_type: ResourceType
    tags: string[]
  }
) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update resource
  const update: ResourceUpdate = {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    semester: formData.semester,
    year_batch: formData.year_batch,
    resource_type: formData.resource_type,
  }

  const { error: updateError } = await supabase
    .from('resources')
    .update(update)
    .eq('id', resourceId)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // Update tags - remove old ones and add new ones
  const { error: deleteTagsError } = await supabase
    .from('resource_tags')
    .delete()
    .eq('resource_id', resourceId)

  if (deleteTagsError) {
    return { error: deleteTagsError.message }
  }

  if (formData.tags.length > 0) {
    const tagError = await addTagsToResource(resourceId, formData.tags)
    if (tagError) {
      return { error: tagError }
    }
  }

  revalidatePath('/resources')
  revalidatePath(`/resources/${resourceId}`)
  return { success: true }
}

export async function deleteResource(resourceId: string) {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get resource to get file path
  const { data: resource, error: fetchError } = await supabase
    .from('resources')
    .select('file_url, user_id')
    .eq('id', resourceId)
    .single()

  if (fetchError || !resource) {
    return { error: 'Resource not found' }
  }

  if (resource.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Delete file from storage
  const filePath = getFilePathFromUrl(resource.file_url)
  if (filePath) {
    await supabase.storage.from('resource-files').remove([filePath])
  }

  // Delete resource (tags will be deleted automatically via cascade)
  const { error: deleteError } = await supabase
    .from('resources')
    .delete()
    .eq('id', resourceId)
    .eq('user_id', user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath('/resources')
  return { success: true }
}

export async function getResources(filters?: {
  subject?: string
  semester?: number
  resource_type?: ResourceType
  search?: string
  user_id?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('resources')
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        college,
        branch
      )
    `)
    .order('created_at', { ascending: false })

  if (filters?.subject) {
    query = query.ilike('subject', `%${filters.subject}%`)
  }

  if (filters?.semester) {
    query = query.eq('semester', filters.semester)
  }

  if (filters?.resource_type) {
    query = query.eq('resource_type', filters.resource_type)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getResource(resourceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('resources')
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        college,
        branch,
        semester,
        year
      )
    `)
    .eq('id', resourceId)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Get tags for this resource
  const { data: tagsData } = await supabase
    .from('resource_tags')
    .select('tags(*)')
    .eq('resource_id', resourceId)

  const tags = tagsData?.map((rt: any) => rt.tags) || []

  return { data: { ...data, tags }, error: null }
}

export async function incrementDownloadCount(resourceId: string) {
  const supabase = await createClient()
  
  await supabase.rpc('increment_download_count', {
    resource_id: resourceId
  })
}

export async function incrementViewCount(resourceId: string) {
  const supabase = await createClient()
  
  await supabase.rpc('increment_view_count', {
    resource_id: resourceId
  })
}

export async function uploadFile(file: File, userId: string, resourceId: string) {
  const supabase = await createClient()

  // Create unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `${resourceId}_${file.name}`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from('resource-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { data: null, error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('resource-files')
    .getPublicUrl(filePath)

  return { 
    data: {
      path: data.path,
      url: urlData.publicUrl
    }, 
    error: null 
  }
}

// Helper function to add tags to a resource
async function addTagsToResource(resourceId: string, tagNames: string[]) {
  const supabase = await createClient()

  for (const tagName of tagNames) {
    const trimmedTag = tagName.trim().toLowerCase()
    if (!trimmedTag) continue

    // Get or create tag
    let { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id')
      .eq('name', trimmedTag)
      .single()

    if (tagError || !tag) {
      // Create new tag
      const { data: newTag, error: createError } = await supabase
        .from('tags')
        .insert({ name: trimmedTag })
        .select()
        .single()

      if (createError) {
        return createError.message
      }
      tag = newTag
    }

    // Link tag to resource
    const { error: linkError } = await supabase
      .from('resource_tags')
      .insert({
        resource_id: resourceId,
        tag_id: tag.id,
      })

    if (linkError) {
      return linkError.message
    }
  }

  return null
}

// Helper to extract file path from Supabase Storage URL
function getFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/resource-files/')
    return pathParts[1] || null
  } catch {
    return null
  }
}

export async function searchTags(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(10)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
