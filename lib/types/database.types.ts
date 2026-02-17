export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ResourceType = 
  | 'notes'
  | 'question_papers'
  | 'solutions'
  | 'project_reports'
  | 'study_material'

export type ResourceVisibility = 'public' | 'private'

export type SortOption = 'latest' | 'popular' | 'rated' | 'most_viewed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          college: string
          branch: string
          semester: number
          year: number
          profile_picture_url: string | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          college: string
          branch: string
          semester: number
          year: number
          profile_picture_url?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          college?: string
          branch?: string
          semester?: number
          year?: number
          profile_picture_url?: string | null
          bio?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          title: string
          description: string | null
          subject: string
          semester: number
          year_batch: string
          resource_type: ResourceType
          visibility: ResourceVisibility
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          download_count: number
          view_count: number
          average_rating: number
          rating_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          title: string
          description?: string | null
          subject: string
          semester: number
          year_batch: string
          resource_type: ResourceType
          visibility?: ResourceVisibility
          file_url: string
          file_name: string
          file_size: number
          file_type: string
          download_count?: number
          view_count?: number
          average_rating?: number
          rating_count?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          title?: string
          description?: string | null
          subject?: string
          semester?: number
          year_batch?: string
          resource_type?: ResourceType
          visibility?: ResourceVisibility
          file_url?: string
          file_name?: string
          file_size?: number
          file_type?: string
          download_count?: number
          view_count?: number
          average_rating?: number
          rating_count?: number
        }
      }
      ratings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          resource_id: string
          user_id: string
          rating: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          resource_id: string
          user_id: string
          rating: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          resource_id?: string
          user_id?: string
          rating?: number
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      resource_tags: {
        Row: {
          resource_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          resource_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          resource_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Resource = Database['public']['Tables']['resources']['Row']
export type ResourceInsert = Database['public']['Tables']['resources']['Insert']
export type ResourceUpdate = Database['public']['Tables']['resources']['Update']

export type Tag = Database['public']['Tables']['tags']['Row']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']

export type ResourceTag = Database['public']['Tables']['resource_tags']['Row']
export type ResourceTagInsert = Database['public']['Tables']['resource_tags']['Insert']
export type ResourceTagUpdate = Database['public']['Tables']['resource_tags']['Update']

export type Rating = Database['public']['Tables']['ratings']['Row']
export type RatingInsert = Database['public']['Tables']['ratings']['Insert']
export type RatingUpdate = Database['public']['Tables']['ratings']['Update']

// Extended types with relations
export interface ResourceWithProfile extends Resource {
  profiles: Profile
}

export interface ResourceWithTags extends Resource {
  tags: Tag[]
}

export interface ResourceWithProfileAndTags extends Resource {
  profiles: Profile
  tags: Tag[]
}
