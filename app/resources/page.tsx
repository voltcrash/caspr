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

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Resources</h1>
              <p className="mt-1 text-gray-400">
                Browse and download academic materials shared by students
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
              >
                My Profile
              </Link>
              {user && (
                <Link
                  href="/resources/upload"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Upload Resource
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ResourceFilters currentFilters={filters} />
          </div>

          {/* Resource List */}
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {resources && resources.length === 0 && (
              <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-white">No resources found</h3>
                <p className="mt-1 text-gray-400">
                  {Object.keys(filters).some(key => filters[key as keyof typeof filters])
                    ? 'Try adjusting your filters'
                    : 'Be the first to upload a resource!'}
                </p>
                {user && (
                  <Link
                    href="/resources/upload"
                    className="mt-4 inline-block px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Upload Resource
                  </Link>
                )}
              </div>
            )}

            {resources && resources.length > 0 && (
              <ResourceList resources={resources} currentUserId={user?.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
