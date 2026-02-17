'use client'

import { useState } from 'react'
import { rateResource, deleteReview } from '@/lib/actions/resources'

interface RatingStarsProps {
  resourceId: string
  currentRating?: number
  currentReviewText?: string
  averageRating: number
  ratingCount: number
  isOwner?: boolean
}

export default function RatingStars({
  resourceId,
  currentRating = 0,
  currentReviewText = '',
  averageRating,
  ratingCount,
  isOwner = false,
}: RatingStarsProps) {
  const [rating, setRating] = useState(currentRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState(currentReviewText)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [showReviewInput, setShowReviewInput] = useState(!!currentReviewText)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isOwner) {
      setMessage("You can't rate your own resource")
      setTimeout(() => setMessage(''), 3000)
      return
    }

    if (rating === 0) {
      setMessage('Please select a star rating')
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    
    const result = await rateResource(resourceId, rating, reviewText.trim() || undefined)
    
    if (result.error) {
      setMessage(result.error)
    } else {
      setMessage(reviewText.trim() ? 'Review submitted!' : 'Rating submitted!')
    }
    
    setIsSubmitting(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return
    }

    setIsSubmitting(true)
    const result = await deleteReview(resourceId)
    
    if (result.error) {
      setMessage(result.error)
    } else {
      setRating(0)
      setReviewText('')
      setShowReviewInput(false)
      setMessage('Review deleted')
    }
    
    setIsSubmitting(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleStarClick = (newRating: number) => {
    if (isOwner) {
      setMessage("You can't rate your own resource")
      setTimeout(() => setMessage(''), 3000)
      return
    }
    setRating(newRating)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting || isOwner}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`transition-all ${isOwner ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500'
                    : 'text-gray-300 '
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-400">
          {averageRating > 0 ? (
            <>
              <span className="font-semibold text-white">
                {averageRating.toFixed(1)}
              </span>{' '}
              ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
      </div>

      {!isOwner && (
        <>
          {!showReviewInput && rating === 0 && (
            <button
              type="button"
              onClick={() => setShowReviewInput(true)}
              className="text-sm text-orange-400 hover:underline"
            >
              Write a review
            </button>
          )}

          {(showReviewInput || rating > 0) && (
            <div className="space-y-3">
              <div>
                <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  id="reviewText"
                  rows={4}
                  maxLength={1000}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this resource... (Optional)"
                  className="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-400  mt-1">
                  {reviewText.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isSubmitting ? 'Submitting...' : currentRating > 0 ? 'Update Review' : 'Submit Review'}
                </button>

                {currentRating > 0 && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Delete
                  </button>
                )}

                {showReviewInput && rating === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewInput(false)
                      setReviewText('')
                    }}
                    className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-800 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.includes('error') || message.includes("can't")
              ? 'text-red-400'
              : 'text-green-400'
          }`}
        >
          {message}
        </p>
      )}

      {rating > 0 && !isOwner && !showReviewInput && (
        <p className="text-xs text-gray-400 ">
          Your rating: {rating} {rating === 1 ? 'star' : 'stars'}
          {currentReviewText && <span> • Click "Write a review" to edit</span>}
        </p>
      )}
    </form>
  )
}
