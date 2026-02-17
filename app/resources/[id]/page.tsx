import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { getResource, incrementViewCount, getUserRating, getResourceReviews } from '@/lib/actions/resources'
import ResourceActions from '@/components/resources/ResourceActions'
import RatingStars from '@/components/resources/RatingStars'
import ReviewList from '@/components/resources/ReviewList'

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  const { data: resource, error } = await getResource(id)

  if (error || !resource) {
    redirect('/resources')
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
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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
    notes: 'bg-orange-900/50 text-blue-800',
    question_papers: 'bg-purple-100 text-purple-800',
    solutions: 'bg-green-900/50 text-green-300',
    project_reports: 'bg-yellow-100 text-yellow-800',
    study_material: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/resources"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resources
        </Link>

        {/* Resource Card */}
        <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-black to-orange-500 px-8 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-5xl">{getFileIcon(resource.file_type)}</span>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{resource.title}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded ${
                        RESOURCE_TYPE_COLORS[resource.resource_type]
                      }`}
                    >
                      {RESOURCE_TYPE_LABELS[resource.resource_type]}
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded ${
                      resource.visibility === 'private'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/20 text-white'
                    }`}>
                      {resource.visibility === 'private' ? '🔒 Private - College Only' : '🌐 Public'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">Semester {resource.semester}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-300">{resource.year_batch}</span>
                  </div>
                </div>
              </div>
              {isOwner && (
                <ResourceActions resourceId={resource.id} resource={resource} />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Subject */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-1">Subject</h3>
              <p className="text-lg font-semibold text-white">{resource.subject}</p>
            </div>

            {/* Description */}
            {resource.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                <p className="text-gray-300">{resource.description}</p>
              </div>
            )}

            {/* File Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-black rounded-lg border border-gray-800">
              <div>
                <p className="text-sm text-gray-400">File Name</p>
                <p className="font-medium text-white truncate">{resource.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">File Size</p>
                <p className="font-medium text-white">{formatFileSize(resource.file_size)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Downloads</p>
                <p className="font-medium text-white">{resource.download_count}</p>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-black border border-gray-800 text-orange-400 text-sm rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rating & Review */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                {userRating > 0 ? 'Your Review' : 'Rate & Review'}
              </h3>
              <RatingStars
                resourceId={resource.id}
                currentRating={userRating}
                currentReviewText={userReviewText}
                averageRating={resource.average_rating}
                ratingCount={resource.rating_count}
                isOwner={isOwner}
              />
            </div>

            {/* All Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="border-t border-gray-800 pt-6">
                <ReviewList reviews={reviews} currentUserId={user?.id} />
              </div>
            )}

            {/* Uploader Info */}
            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Uploaded By</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-900/50 flex items-center justify-center">
                  <span className="text-xl font-bold text-orange-400">
                    {resource.profiles?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{resource.profiles?.name}</p>
                  <p className="text-sm text-gray-300">
                    {resource.profiles?.branch} • {resource.profiles?.college}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Uploaded on {new Date(resource.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="pt-4">
              <a
                href={resource.file_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 bg-orange-500 text-white text-center font-medium rounded-lg hover:bg-orange-600 transition-colors"
              >
                Download Resource
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
