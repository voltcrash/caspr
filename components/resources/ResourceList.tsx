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
  notes: 'bg-orange-900/50 text-orange-300',
  question_papers: 'bg-purple-900/50 text-purple-300',
  solutions: 'bg-green-900/50 text-green-300',
  project_reports: 'bg-yellow-900/50 text-yellow-300',
  study_material: 'bg-pink-900/50 text-pink-300',
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
          className="block bg-gray-800 rounded-lg shadow-xl border border-gray-700 hover:border-orange-600 transition-all p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getFileIcon(resource.file_type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white hover:text-orange-500 transition-colors">
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
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      resource.visibility === 'private'
                        ? 'bg-orange-900/50 text-orange-300'
                        : 'bg-green-900/50 text-green-300'
                    }`}>
                      {resource.visibility === 'private' ? '🔒 Private' : '🌐 Public'}
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
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="font-medium text-gray-300">{resource.subject}</span>
                <span>•</span>
                <span>{formatFileSize(resource.file_size)}</span>
                {resource.average_rating > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {resource.average_rating.toFixed(1)}
                    </span>
                  </>
                )}
                <span>•</span>
                <span>👁️ {resource.view_count}</span>
                <span>•</span>
                <span>⬇️ {resource.download_count}</span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-400">Uploaded by</span>
                <span className="font-medium text-gray-300">
                  {resource.profiles?.name || 'Anonymous'}
                </span>
                {resource.profiles?.college && (
                  <>
                    <span className="text-gray-400">from</span>
                    <span className="text-gray-300">{resource.profiles.college}</span>
                  </>
                )}
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  {new Date(resource.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {currentUserId === resource.user_id && (
              <div className="ml-4">
                <span className="px-2 py-1 text-xs font-medium bg-orange-900/50 text-orange-300 rounded">
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
