import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { getResources } from '@/lib/actions/resources'
import ResourceList from '@/components/resources/ResourceList'
import ResourceFilters from '@/components/resources/ResourceFilters'

interface SearchParams {
  subject?: string
  semester?: string
  resource_type?: string
  branch?: string
  year_batch?: string
  visibility?: string
  search?: string
  tags?: string
  sort?: string
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await getUser()
  const params = await searchParams

  const filters = {
    subject: params.subject,
    semester: params.semester ? parseInt(params.semester) : undefined,
    resource_type: params.resource_type as any,
    branch: params.branch,
    year_batch: params.year_batch,
    visibility: params.visibility as any,
    search: params.search,
    tags: params.tags,
    sort: params.sort as any,
  }

  const { data: resources, error } = await getResources(filters)
  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-white">CASPR</span>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-500 transition-all"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/resources/upload"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    + Upload
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Resources
          </h1>
          <p className="mt-2 text-gray-400 text-lg max-w-2xl">
            Browse, download, and share academic materials with your campus community.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ResourceFilters currentFilters={filters} />
            </div>
          </aside>

          {/* Resource List */}
          <main className="flex-1 min-w-0">
            {/* Results Bar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-400">
                {resources ? (
                  <>
                    <span className="text-white font-semibold">{resources.length}</span>{' '}
                    resource{resources.length !== 1 ? 's' : ''} found
                    {activeFilterCount > 0 && (
                      <span className="ml-2 text-orange-400">
                        ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)
                      </span>
                    )}
                  </>
                ) : (
                  'Loading...'
                )}
              </p>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 px-5 py-4 rounded-xl mb-6">
                <p className="font-medium">Error loading resources</p>
                <p className="text-sm mt-1 text-red-400/80">{error}</p>
              </div>
            )}

            {resources && resources.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-700 p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No resources found</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                  {activeFilterCount > 0
                    ? 'Try adjusting your filters or search query.'
                    : 'Be the first to share academic materials with your campus!'}
                </p>
                {user && (
                  <Link
                    href="/resources/upload"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload Resource
                  </Link>
                )}
              </div>
            )}

            {resources && resources.length > 0 && (
              <ResourceList resources={resources} currentUserId={user?.id} />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
