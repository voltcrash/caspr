'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteResource } from '@/lib/actions/resources'
import type { Resource } from '@/lib/types/database.types'

interface ResourceActionsProps {
  resourceId: string
  resource: Resource
}

export default function ResourceActions({ resourceId, resource }: ResourceActionsProps) {
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    const result = await deleteResource(resourceId)

    if (result.error) {
      setError(result.error)
      setIsDeleting(false)
      return
    }

    // Redirect to resources page
    router.push('/resources')
  }

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Link
          href={`/resources/${resourceId}/edit`}
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-md hover:bg-blue-50"
        >
          Edit
        </Link>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-md hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Resource?
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{resource.title}"? This action cannot be undone and the file will be permanently deleted.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
