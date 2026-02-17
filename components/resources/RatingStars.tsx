'use client'

import { useState } from 'react'
import { rateResource } from '@/lib/actions/resources'

interface RatingStarsProps {
  resourceId: string
  currentRating?: number
  averageRating: number
  ratingCount: number
  isOwner?: boolean
}

export default function RatingStars({
  resourceId,
  currentRating = 0,
  averageRating,
  ratingCount,
  isOwner = false,
}: RatingStarsProps) {
  const [rating, setRating] = useState(currentRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleRate = async (newRating: number) => {
    if (isOwner) {
      setMessage("You can't rate your own resource")
      setTimeout(() => setMessage(''), 3000)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    
    const result = await rateResource(resourceId, newRating)
    
    if (result.error) {
      setMessage(result.error)
    } else {
      setRating(newRating)
      setMessage('Rating submitted!')
    }
    
    setIsSubmitting(false)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={isSubmitting || isOwner}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`transition-colors ${isOwner ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          {averageRating > 0 ? (
            <>
              <span className="font-semibold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)}
              </span>{' '}
              ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes('error') || message.includes("can't")
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {message}
        </p>
      )}

      {rating > 0 && !isOwner && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Your rating: {rating} {rating === 1 ? 'star' : 'stars'}
        </p>
      )}
    </div>
  )
}
