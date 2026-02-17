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
  { value: 'notes', label: 'Class Notes' },
  { value: 'question_papers', label: 'Question Papers' },
  { value: 'solutions', label: 'Solutions' },
  { value: 'project_reports', label: 'Project Reports' },
  { value: 'study_material', label: 'Study Material' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest First' },
  { value: 'rated', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700 p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search & Filter</h3>
        
        {/* Sort Options */}
        <div className="mb-6">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="flex gap-2">
            <input
              id="search"
              type="text"
              placeholder="Title, subject, description..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Go
            </button>
          </div>
        </form>

        {/* Tags Search */}
        <form onSubmit={handleTagsSubmit} className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search by Tags
          </label>
          <div className="flex gap-2">
            <input
              id="tags"
              type="text"
              placeholder="e.g., algorithms, database"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Go
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate multiple tags with commas</p>
        </form>

        {/* Resource Type */}
        <div className="mb-6">
          <label htmlFor="resource_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resource Type
          </label>
          <select
            id="resource_type"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="mb-6">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Semester
          </label>
          <select
            id="semester"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        <div className="mb-6">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            placeholder="e.g., Data Structures"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentFilters.subject || ''}
            onChange={(e) => updateFilter('subject', e.target.value)}
          />
        </div>

        {/* Branch/Department */}
        <div className="mb-6">
          <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Branch/Department
          </label>
          <input
            id="branch"
            type="text"
            placeholder="e.g., Computer Science"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentFilters.branch || ''}
            onChange={(e) => updateFilter('branch', e.target.value)}
          />
        </div>

        {/* Year/Batch */}
        <div className="mb-6">
          <label htmlFor="year_batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Year/Batch
          </label>
          <input
            id="year_batch"
            type="text"
            placeholder="e.g., 2023"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentFilters.year_batch || ''}
            onChange={(e) => updateFilter('year_batch', e.target.value)}
          />
        </div>

        {/* Privacy Level */}
        <div className="mb-6">
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Privacy Level
          </label>
          <select
            id="visibility"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={currentFilters.visibility || ''}
            onChange={(e) => updateFilter('visibility', e.target.value)}
          >
            <option value="">All Resources</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}
