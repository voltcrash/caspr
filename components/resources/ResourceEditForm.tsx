'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateResource } from '@/lib/actions/resources'
import type { ResourceType } from '@/lib/types/database.types'

interface ResourceEditFormProps {
  resource: any // Resource with tags
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'notes', label: 'Class Notes' },
  { value: 'question_papers', label: 'Question Papers' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'project_reports', label: 'Project Reports' },
  { value: 'study_material', label: 'Study Material' },
]

export default function ResourceEditForm({ resource }: ResourceEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: resource.title,
    description: resource.description || '',
    subject: resource.subject,
    semester: resource.semester,
    year_batch: resource.year_batch,
    resource_type: resource.resource_type as ResourceType,
    tags: resource.tags?.map((t: any) => t.name).join(', ') || '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)

      // Update resource
      const result = await updateResource(resource.id, {
        title: formData.title,
        description: formData.description || undefined,
        subject: formData.subject,
        semester: formData.semester,
        year_batch: formData.year_batch,
        resource_type: formData.resource_type,
        tags,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Redirect to resource detail page
      router.push(`/resources/${resource.id}`)
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/resources/${resource.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> You cannot change the uploaded file. To upload a different file, please delete this resource and create a new one.
        </p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Resource Title *
        </label>
        <input
          id="title"
          type="text"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject/Course *
          </label>
          <input
            id="subject"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            disabled={isLoading}
          />
        </div>

        {/* Semester */}
        <div>
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
            Semester *
          </label>
          <select
            id="semester"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
            disabled={isLoading}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type */}
        <div>
          <label htmlFor="resource_type" className="block text-sm font-medium text-gray-700">
            Resource Type *
          </label>
          <select
            id="resource_type"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.resource_type}
            onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as ResourceType })}
            disabled={isLoading}
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year/Batch */}
        <div>
          <label htmlFor="year_batch" className="block text-sm font-medium text-gray-700">
            Year/Batch *
          </label>
          <input
            id="year_batch"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.year_batch}
            onChange={(e) => setFormData({ ...formData, year_batch: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags/Keywords (optional)
        </label>
        <input
          id="tags"
          type="text"
          placeholder="e.g., arrays, linked-lists, mid-term (comma separated)"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
