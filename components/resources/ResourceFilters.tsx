'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { ResourceType, ResourceVisibility, SortOption } from '@/lib/types/database.types'

interface ResourceFiltersProps {
  currentFilters: {
    subject?: string
    semester?: number
    resource_type?: ResourceType
    branch?: string
    year_batch?: string
    visibility?: ResourceVisibility
    search?: string
    tags?: string
    sort?: SortOption
  }
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'notes', label: 'Notes' },
  { value: 'question_papers', label: 'Question Papers' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'project_reports', label: 'Project Reports' },
  { value: 'study_material', label: 'Study Material' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'rated', label: 'Top Rated' },
  { value: 'popular', label: 'Most Downloaded' },
  { value: 'most_viewed', label: 'Most Viewed' },
]

export default function ResourceFilters({ currentFilters }: ResourceFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(currentFilters.search || '')
  const [tags, setTags] = useState(currentFilters.tags || '')

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/resources?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('search', search)
  }

  const handleTagsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter('tags', tags)
  }

  const clearFilters = () => {
    setSearch('')
    setTags('')
    router.push('/resources')
  }

  const hasFilters = Object.values(currentFilters).some(v => v !== undefined && v !== '')

  const inputClass = "w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5"

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Tags */}
      <div>
        <form onSubmit={handleTagsSubmit}>
          <label className={labelClass}>Tags</label>
          <input
            type="text"
            placeholder="e.g., algorithms, database"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <p className="text-[11px] text-gray-500 mt-1">Comma-separated</p>
        </form>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-800" />

      {/* Sort */}
      <div>
        <label className={labelClass}>Sort By</label>
        <select
          className={inputClass}
          value={currentFilters.sort || 'latest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Resource Type */}
      <div>
        <label className={labelClass}>Type</label>
        <select
          className={inputClass}
          value={currentFilters.resource_type || ''}
          onChange={(e) => updateFilter('resource_type', e.target.value)}
        >
          <option value="">All Types</option>
          {RESOURCE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Semester */}
      <div>
        <label className={labelClass}>Semester</label>
        <select
          className={inputClass}
          value={currentFilters.semester || ''}
          onChange={(e) => updateFilter('semester', e.target.value)}
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={sem}>
              Semester {sem}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className={labelClass}>Subject</label>
        <input
          type="text"
          placeholder="e.g., Data Structures"
          className={inputClass}
          value={currentFilters.subject || ''}
          onChange={(e) => updateFilter('subject', e.target.value)}
        />
      </div>

      {/* Branch */}
      <div>
        <label className={labelClass}>Branch</label>
        <input
          type="text"
          placeholder="e.g., Computer Science"
          className={inputClass}
          value={currentFilters.branch || ''}
          onChange={(e) => updateFilter('branch', e.target.value)}
        />
      </div>

      {/* Year */}
      <div>
        <label className={labelClass}>Year / Batch</label>
        <input
          type="text"
          placeholder="e.g., 2023-2024"
          className={inputClass}
          value={currentFilters.year_batch || ''}
          onChange={(e) => updateFilter('year_batch', e.target.value)}
        />
      </div>

      {/* Visibility */}
      <div>
        <label className={labelClass}>Visibility</label>
        <select
          className={inputClass}
          value={currentFilters.visibility || ''}
          onChange={(e) => updateFilter('visibility', e.target.value)}
        >
          <option value="">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm font-medium text-orange-400 bg-orange-500/10 rounded-lg hover:bg-orange-500/20 transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
