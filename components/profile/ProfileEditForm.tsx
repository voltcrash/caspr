'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/lib/actions/auth'
import type { Profile } from '@/lib/types/database.types'

interface ProfileEditFormProps {
  profile: Profile
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: profile.name,
    college: profile.college,
    branch: profile.branch,
    semester: profile.semester,
    year: profile.year,
    bio: profile.bio || '',
    profile_picture_url: profile.profile_picture_url || '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await updateProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/profile')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 p-8 space-y-6">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-400">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* College */}
        <div className="md:col-span-2">
          <label htmlFor="college" className="block text-sm font-medium text-gray-400">
            College/Institution *
          </label>
          <input
            id="college"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
          />
        </div>

        {/* Branch */}
        <div className="md:col-span-2">
          <label htmlFor="branch" className="block text-sm font-medium text-gray-400">
            Branch/Department *
          </label>
          <input
            id="branch"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
          />
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-400">
            Current Year *
          </label>
          <select
            id="year"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          >
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
            <option value={5}>5th Year</option>
            <option value={6}>6th Year</option>
          </select>
        </div>

        {/* Semester */}
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-400">
            Current Semester *
          </label>
          <select
            id="semester"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Profile Picture URL */}
        <div className="md:col-span-2">
          <label htmlFor="profile_picture_url" className="block text-sm font-medium text-gray-400">
            Profile Picture URL (optional)
          </label>
          <input
            id="profile_picture_url"
            type="url"
            placeholder="https://example.com/your-photo.jpg"
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.profile_picture_url}
            onChange={(e) => setFormData({ ...formData, profile_picture_url: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-400">
            Enter a URL to an image you'd like to use as your profile picture
          </p>
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-400">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Tell us about yourself..."
            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-900 text-white placeholder-gray-500"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-400 bg-white hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
