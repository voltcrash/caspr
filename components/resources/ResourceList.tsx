'use client'

import Link from 'next/link'
import type { ResourceWithProfile } from '@/lib/types/database.types'

interface ResourceListProps {
  resources: ResourceWithProfile[]
  currentUserId?: string
}

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  notes: 'Notes',
  question_papers: 'Question Papers',
  solutions: 'Solutions',
  project_reports: 'Project Reports',
  study_material: 'Study Material',
}

const RESOURCE_TYPE_COLORS: Record<string, string> = {
  notes: 'bg-blue-100 text-blue-800',
  question_papers: 'bg-purple-100 text-purple-800',
  solutions: 'bg-green-100 text-green-800',
  project_reports: 'bg-yellow-100 text-yellow-800',
  study_material: 'bg-pink-100 text-pink-800',
}

export default function ResourceList({ resources, currentUserId }: ResourceListProps) {
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

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Link
          key={resource.id}
          href={`/resources/${resource.id}`}
          className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getFileIcon(resource.file_type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                    {resource.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        RESOURCE_TYPE_COLORS[resource.resource_type]
                      }`}
                    >
                      {RESOURCE_TYPE_LABELS[resource.resource_type]}
                    </span>
                    <span className="text-sm text-gray-500">
                      Semester {resource.semester}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{resource.year_batch}</span>
                  </div>
                </div>
              </div>

              {resource.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{resource.subject}</span>
                <span>•</span>
                <span>{formatFileSize(resource.file_size)}</span>
                <span>•</span>
                <span>👁️ {resource.view_count}</span>
                <span>•</span>
                <span>⬇️ {resource.download_count}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-500">Uploaded by</span>
                <span className="font-medium text-gray-700">
                  {resource.profiles?.name || 'Anonymous'}
                </span>
                {resource.profiles?.college && (
                  <>
                    <span className="text-gray-500">from</span>
                    <span className="text-gray-600">{resource.profiles.college}</span>
                  </>
                )}
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {currentUserId === resource.user_id && (
              <div className="ml-4">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  Your Upload
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
