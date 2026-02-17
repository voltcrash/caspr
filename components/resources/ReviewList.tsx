'use client'

import type { RatingWithProfile } from '@/lib/types/database.types'

interface ReviewListProps {
  reviews: RatingWithProfile[]
  currentUserId?: string
}

export default function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-400">
        <p>No reviews yet. Be the first to review this resource!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isEdited = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt).getTime()
    const updated = new Date(updatedAt).getTime()
    // Consider edited if updated more than 1 minute after creation
    return updated - created > 60000
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">
        Reviews ({reviews.length})
      </h3>

      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div
            key={review.id}
            className="bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            {/* Reviewer Info */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-orange-900/50 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-orange-500 dark:text-blue-300">
                    {review.profiles?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>

                {/* Name and Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white">
                      {review.profiles?.name || 'Anonymous'}
                      {review.user_id === currentUserId && (
                        <span className="ml-2 text-xs font-normal text-orange-500 dark:text-blue-400">
                          (You)
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {review.profiles?.branch && review.profiles?.college && (
                      <>
                        {review.profiles.branch} • {review.profiles.college}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? 'text-yellow-500'
                        : 'text-gray-300 dark:text-gray-400'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Review Text */}
            {review.review_text && (
              <div className="mb-3">
                <p className="text-gray-300 whitespace-pre-wrap">
                  {review.review_text}
                </p>
              </div>
            )}

            {/* Review Date */}
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-400">
              <span>{formatDate(review.created_at)}</span>
              {isEdited(review.created_at, review.updated_at) && (
                <>
                  <span>•</span>
                  <span className="italic">Edited</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
