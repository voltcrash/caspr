import { redirect } from 'next/navigation'
import { getUser, getProfile, logout } from '@/lib/actions/auth'
import ProfileView from '@/components/profile/ProfileView'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    // Profile doesn't exist yet - create a basic one from auth metadata
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center max-w-md">
          <h2 className="text-xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-gray-400 mb-6">
            Your profile data could not be loaded. This may be because the database trigger 
            hasn&apos;t created your profile yet. Please run the FIX_DATABASE.sql script in 
            Supabase SQL Editor, then try logging out and back in.
          </p>
          <p className="text-sm text-gray-500 mb-4">Logged in as: {user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Logout & Try Again
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <ProfileView profile={profile} onLogout={logout} />
    </div>
  )
}
