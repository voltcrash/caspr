import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile, logout } from '@/lib/actions/auth'
import { getResources } from '@/lib/actions/resources'
import { createClient } from '@/lib/supabase/server'
import ProfileView from '@/components/profile/ProfileView'

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  let profile = await getProfile(user.id)

  // Auto-create profile from auth metadata if missing
  if (!profile) {
    const supabase = await createClient()
    const meta = user.user_metadata || {}

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        name: meta.name || user.email?.split('@')[0] || 'User',
        college: meta.college || 'Unknown',
        branch: meta.branch || 'Unknown',
        semester: meta.semester || 1,
        year: meta.year || 1,
      })

    if (!error) {
      profile = await getProfile(user.id)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-4">Profile Setup Required</h2>
          <p className="text-gray-400 mb-2">
            We could not create your profile automatically. Please run the database setup script.
          </p>
          <p className="text-sm text-gray-500 mb-6">Logged in as: {user.email}</p>
          <form action={logout}>
            <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
              Logout & Try Again
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Fetch user's uploaded resources
  const { data: myResources } = await getResources({ user_id: user.id })

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">C</span>
              </div>
              <span className="text-base font-bold text-white">CASPR</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/resources" className="text-sm text-gray-400 hover:text-white transition-colors">Resources</Link>
              <Link href="/resources/upload" className="text-sm text-gray-400 hover:text-white transition-colors">Upload</Link>
            </div>
          </div>
        </div>
      </nav>

      <ProfileView profile={profile} onLogout={logout} />

      {/* My Uploads Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">My Uploads</h2>
          <Link
            href="/resources/upload"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all"
          >
            + Upload New
          </Link>
        </div>

        {(!myResources || myResources.length === 0) ? (
          <div className="bg-gray-900 rounded-xl border border-dashed border-gray-700 p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No uploads yet</h3>
            <p className="text-gray-400 text-sm mb-5">Share your first resource with your campus community.</p>
            <Link
              href="/resources/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all"
            >
              Upload Resource
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myResources.map((resource: any) => (
              <Link
                key={resource.id}
                href={`/resources/${resource.id}`}
                className="flex items-center justify-between bg-gray-900 rounded-xl border border-gray-800 hover:border-orange-500/50 transition-all p-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">
                    {resource.file_type?.includes('pdf') ? '📄' :
                     resource.file_type?.includes('word') ? '📝' :
                     resource.file_type?.includes('presentation') ? '📊' :
                     resource.file_type?.includes('image') ? '🖼️' : '📁'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {resource.subject} &middot; Sem {resource.semester} &middot; {resource.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-shrink-0 ml-4">
                  <span className="hidden sm:inline">{resource.view_count} views</span>
                  <span className="hidden sm:inline">{resource.download_count} downloads</span>
                  {resource.average_rating > 0 && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {resource.average_rating.toFixed(1)}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
