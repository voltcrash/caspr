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
  notes: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
  question_papers: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  solutions: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  project_reports: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  study_material: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
}

export default function ResourceList({ resources, currentUserId }: ResourceListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    if (days < 30) return `${Math.floor(days / 7)}w ago`
    if (days < 365) return `${Math.floor(days / 30)}mo ago`
    return `${Math.floor(days / 365)}y ago`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((resource) => (
        <Link
          key={resource.id}
          href={`/resources/${resource.id}`}
          className="group relative bg-gray-900/80 rounded-xl border border-gray-800 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5 overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="p-5">
            {/* Header row: type badge + time */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full ring-1 ring-inset ${
                    RESOURCE_TYPE_COLORS[resource.resource_type]
                  }`}
                >
                  {RESOURCE_TYPE_LABELS[resource.resource_type]}
                </span>
                {resource.visibility === 'private' && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full ring-1 ring-inset bg-gray-500/10 text-gray-400 ring-gray-500/20">
                    Private
                  </span>
                )}
                {currentUserId === resource.user_id && (
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full ring-1 ring-inset bg-orange-500/10 text-orange-400 ring-orange-500/20">
                    Yours
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{timeAgo(resource.created_at)}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-white group-hover:text-orange-400 transition-colors mb-1.5 line-clamp-1">
              {resource.title}
            </h3>

            {/* Subject + Semester */}
            <p className="text-sm text-gray-400 mb-3">
              {resource.subject} &middot; Sem {resource.semester} &middot; {resource.year_batch}
            </p>

            {/* Description */}
            {resource.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {resource.description}
              </p>
            )}

            {/* Bottom: stats + uploader */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              {/* Stats */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {resource.view_count}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {resource.download_count}
                </span>
                {resource.average_rating > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-yellow-500">{resource.average_rating.toFixed(1)}</span>
                  </span>
                )}
                <span>{formatFileSize(resource.file_size)}</span>
              </div>

              {/* Uploader */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {(resource.profiles?.name || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400 truncate max-w-[100px]">
                  {resource.profiles?.name || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
