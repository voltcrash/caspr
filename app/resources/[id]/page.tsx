import Link from 'next/link'
import { getUser, getProfile } from '@/lib/actions/auth'
import { getResource, incrementViewCount, getUserRating, getResourceReviews } from '@/lib/actions/resources'
import ResourceActions from '@/components/resources/ResourceActions'
import RatingStars from '@/components/resources/RatingStars'
import ReviewList from '@/components/resources/ReviewList'
import DownloadButton from '@/components/resources/DownloadButton'

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  const { data: resource, error } = await getResource(id)

  // Resource not found or error
  if (error || !resource) {
    // Check if this might be an access denied (private resource from another college)
    const accessDenied = error && (error.includes('permission') || error.includes('policy') || error.includes('row-level'))
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m12-6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {accessDenied ? 'Access Denied' : 'Resource Not Found'}
          </h2>
          <p className="text-gray-400 mb-6">
            {accessDenied
              ? 'This resource is private and only available to students from the same college as the uploader.'
              : 'The resource you are looking for does not exist or has been removed.'}
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all"
          >
            Back to Resources
          </Link>
        </div>
      </div>
    )
  }

  // Access control check for private resources
  if (resource.visibility === 'private' && user) {
    const userProfile = await getProfile(user.id)
    const uploaderCollege = resource.profiles?.college
    
    if (userProfile && uploaderCollege && userProfile.college !== uploaderCollege) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-orange-900/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Private Resource</h2>
            <p className="text-gray-400 mb-3">
              This resource is private and only available to students from <span className="text-orange-400 font-semibold">{uploaderCollege}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your college: {userProfile.college}
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all"
            >
              Browse Public Resources
            </Link>
          </div>
        </div>
      )
    }
  }

  if (resource.visibility === 'private' && !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-orange-900/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">
            This is a private resource. Please log in to check if you have access.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  // Increment view count
  await incrementViewCount(id)

  // Get user's rating and review if authenticated
  const { data: userRatingData } = await getUserRating(id)
  const userRating = userRatingData?.rating || 0
  const userReviewText = userRatingData?.review_text || ''

  // Get all reviews for this resource
  const { data: reviews } = await getResourceReviews(id)

  const isOwner = user?.id === resource.user_id

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📊'
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📈'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦'
    return '📁'
  }

  const RESOURCE_TYPE_LABELS: Record<string, string> = {
    notes: 'Class Notes',
    question_papers: 'Question Papers',
    solutions: 'Solutions',
    project_reports: 'Project Reports',
    study_material: 'Study Material',
  }

  const RESOURCE_TYPE_COLORS: Record<string, string> = {
    notes: 'bg-orange-500/10 text-orange-400 ring-1 ring-inset ring-orange-500/20',
    question_papers: 'bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20',
    solutions: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
    project_reports: 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20',
    study_material: 'bg-pink-500/10 text-pink-400 ring-1 ring-inset ring-pink-500/20',
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Resources
          </Link>
          {isOwner && <ResourceActions resourceId={resource.id} resource={resource} />}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resource Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{getFileIcon(resource.file_type)}</span>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{resource.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${RESOURCE_TYPE_COLORS[resource.resource_type]}`}>
                  {RESOURCE_TYPE_LABELS[resource.resource_type]}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ring-1 ring-inset ${
                  resource.visibility === 'private'
                    ? 'bg-red-500/10 text-red-400 ring-red-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
                }`}>
                  {resource.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {resource.subject}
            </span>
            <span>Semester {resource.semester}</span>
            <span>{resource.year_batch}</span>
            <span>{formatFileSize(resource.file_size)}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {resource.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {resource.download_count} downloads
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {resource.description && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-gray-300 leading-relaxed">{resource.description}</p>
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-gray-800 text-orange-400 text-sm rounded-lg border border-gray-700"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Review Section */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {userRating > 0 ? 'Your Review' : 'Rate & Review'}
              </h3>
              {user ? (
                <RatingStars
                  resourceId={resource.id}
                  currentRating={userRating}
                  currentReviewText={userReviewText}
                  averageRating={resource.average_rating}
                  ratingCount={resource.rating_count}
                  isOwner={isOwner}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-3">Log in to rate and review this resource.</p>
                  <Link href="/login" className="text-orange-400 hover:underline text-sm font-medium">
                    Log In
                  </Link>
                </div>
              )}
            </div>

            {/* All Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <ReviewList reviews={reviews} currentUserId={user?.id} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Download</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">File</span>
                  <span className="text-white truncate ml-2 max-w-[160px]">{resource.file_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Size</span>
                  <span className="text-white">{formatFileSize(resource.file_size)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Type</span>
                  <span className="text-white uppercase">{resource.file_type.split('/').pop()}</span>
                </div>
              </div>
              <DownloadButton
                fileUrl={resource.file_url}
                resourceId={resource.id}
                fileName={resource.file_name}
              />
            </div>

            {/* Uploader Info */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Uploaded By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {(resource.profiles?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{resource.profiles?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {resource.profiles?.branch} &middot; {resource.profiles?.college}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Uploaded {new Date(resource.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
