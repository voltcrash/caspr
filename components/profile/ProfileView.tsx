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
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Profile Card */}
      <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 h-28 sm:h-36" />

        <div className="px-6 pb-8">
          {/* Avatar + Actions Row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-14 sm:-mt-16 mb-6">
            {/* Avatar */}
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-gray-900 object-cover shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-gray-900 bg-gray-800 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-orange-500">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Link
                href="/profile/edit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Name + Email */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-gray-400 text-sm">{profile.email}</p>
          </div>

          {profile.bio && (
            <p className="text-gray-300 mb-6 leading-relaxed">{profile.bio}</p>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">College</p>
              <p className="text-sm text-white font-medium truncate">{profile.college}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Branch</p>
              <p className="text-sm text-white font-medium truncate">{profile.branch}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Year</p>
              <p className="text-sm text-white font-medium">{profile.year}{getYearSuffix(profile.year)} Year</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-800">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Semester</p>
              <p className="text-sm text-white font-medium">Semester {profile.semester}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
            <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Updated {new Date(profile.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
