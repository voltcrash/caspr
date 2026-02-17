export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
