'use client'

import Link from 'next/link'
import type { Profile } from '@/lib/types/database.types'

interface ProfileViewProps {
  profile: Profile
  onLogout: () => Promise<void>
}

export default function ProfileView({ profile, onLogout }: ProfileViewProps) {
  const handleLogout = async () => {
    await onLogout()
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <div className="flex gap-3">
          <Link
            href="/resources"
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
          >
            Browse Resources
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-md hover:bg-orange-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-black to-orange-500 h-32"></div>
        
        <div className="px-6 pb-6">
          {/* Profile Picture */}
          <div className="flex justify-between items-start -mt-16 mb-4">
            <div className="relative">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-gray-700 bg-gray-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-orange-500">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <Link
              href="/profile/edit"
              className="mt-16 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
              <p className="text-gray-400">{profile.email}</p>
            </div>

            {profile.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
                <p className="text-gray-300">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">College/Institution</h3>
                <p className="text-white">{profile.college}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Branch/Department</h3>
                <p className="text-white">{profile.branch}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Current Year</h3>
                <p className="text-white">{profile.year}{getYearSuffix(profile.year)} Year</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Current Semester</h3>
                <p className="text-white">Semester {profile.semester}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                <span>Last updated {new Date(profile.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getYearSuffix(year: number): string {
  if (year === 1) return 'st'
  if (year === 2) return 'nd'
  if (year === 3) return 'rd'
  return 'th'
}
