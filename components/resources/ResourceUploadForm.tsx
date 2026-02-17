'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile, uploadResource } from '@/lib/actions/resources'
import type { ResourceType, ResourceVisibility } from '@/lib/types/database.types'

interface ResourceUploadFormProps {
  userId: string
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'notes', label: 'Class Notes' },
  { value: 'question_papers', label: 'Question Papers' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'project_reports', label: 'Project Reports' },
  { value: 'study_material', label: 'Study Material' },
]

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-rar-compressed',
]

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export default function ResourceUploadForm({ userId }: ResourceUploadFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    semester: 1,
    year_batch: '',
    resource_type: 'notes' as ResourceType,
    visibility: 'public' as ResourceVisibility,
    tags: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload PDF, DOCX, PPT, images, or other supported formats.')
      setFile(null)
      return
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50MB limit.')
      setFile(null)
      return
    }

    setFile(selectedFile)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please select a file to upload')
      return
    }

    setIsLoading(true)
    setUploadProgress(10)

    try {
      // Generate a temporary resource ID for file naming
      const tempResourceId = crypto.randomUUID()
      
      setUploadProgress(30)

      // Upload file to Supabase Storage
      const { data: fileData, error: fileError } = await uploadFile(file, userId, tempResourceId)

      if (fileError || !fileData) {
        setError(fileError || 'Failed to upload file')
        setIsLoading(false)
        return
      }

      setUploadProgress(60)

      // Parse tags
      const tags = formData.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)

      // Create resource record
      const result = await uploadResource({
        title: formData.title,
        description: formData.description || undefined,
        subject: formData.subject,
        semester: formData.semester,
        year_batch: formData.year_batch,
        resource_type: formData.resource_type,
        visibility: formData.visibility,
        file_url: fileData.url,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        tags,
      })

      setUploadProgress(100)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Redirect to resources page
      router.push('/resources')
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="bg-gray-900 border border-gray-700 px-4 py-3 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700">Uploading...</span>
            <span className="text-blue-700 font-semibold">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* File Upload */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
          Select File *
        </label>
        <input
          id="file"
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-blue-700 hover:file:bg-orange-900/50"
          required
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Supported: PDF, DOCX, PPT, Images, ZIP (Max 50MB)
        </p>
        {file && (
          <p className="mt-2 text-sm text-green-600">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
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
          placeholder="e.g., Data Structures Complete Notes"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          placeholder="Brief description of the resource..."
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            placeholder="e.g., Data Structures"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            placeholder="e.g., 2023-2024"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={formData.year_batch}
            onChange={(e) => setFormData({ ...formData, year_batch: e.target.value })}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Privacy Setting */}
      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-2">
          Privacy Setting *
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-gray-900">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={formData.visibility === 'public'}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ResourceVisibility })}
              disabled={isLoading}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">🌐 Public</span>
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">Recommended</span>
              </div>
              <p className="text-sm text-gray-600">
                Anyone from any college can view and download this resource
              </p>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 has-[:checked]:border-blue-500 has-[:checked]:bg-gray-900">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value as ResourceVisibility })}
              disabled={isLoading}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">🔒 Private</span>
              </div>
              <p className="text-sm text-gray-600">
                Only students from your college can view and download this resource
              </p>
            </div>
          </label>
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate tags with commas. These help others find your resource.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading || !file}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Uploading...' : 'Upload Resource'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
