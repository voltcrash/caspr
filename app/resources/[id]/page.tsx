import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/actions/auth'
import { getResource, incrementViewCount } from '@/lib/actions/resources'
import ResourceActions from '@/components/resources/ResourceActions'

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
    notes: 'bg-blue-100 text-blue-800',
    question_papers: 'bg-purple-100 text-purple-800',
    solutions: 'bg-green-100 text-green-800',
    project_reports: 'bg-yellow-100 text-yellow-800',
    study_material: 'bg-pink-100 text-pink-800',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/resources"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resources
        </Link>

        {/* Resource Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
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
                    <span className="text-blue-100">•</span>
                    <span className="text-blue-100">Semester {resource.semester}</span>
                    <span className="text-blue-100">•</span>
                    <span className="text-blue-100">{resource.year_batch}</span>
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
              <h3 className="text-sm font-medium text-gray-500 mb-1">Subject</h3>
              <p className="text-lg font-semibold text-gray-900">{resource.subject}</p>
            </div>

            {/* Description */}
            {resource.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-700">{resource.description}</p>
              </div>
            )}

            {/* File Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">File Name</p>
                <p className="font-medium text-gray-900 truncate">{resource.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">File Size</p>
                <p className="font-medium text-gray-900">{formatFileSize(resource.file_size)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Downloads</p>
                <p className="font-medium text-gray-900">{resource.download_count}</p>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader Info */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Uploaded By</h3>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {resource.profiles?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{resource.profiles?.name}</p>
                  <p className="text-sm text-gray-600">
                    {resource.profiles?.branch} • {resource.profiles?.college}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
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
                className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
