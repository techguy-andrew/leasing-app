'use client'

import { useState, useEffect, useMemo } from 'react'
import FullScreenFilterModal, { FilterOption } from '@/components/FullScreenFilterModal'

/**
 * FilterBar Component
 *
 * A simplified filter bar with dropdown-style buttons for filtering and sorting applications.
 * Uses modal selections for a clean, modern interface.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   statusFilter={statusFilter}
 *   onStatusChange={setStatusFilter}
 *   dateType={dateType}
 *   onDateTypeChange={setDateType}
 *   calendarFilter={calendarFilter}
 *   onCalendarChange={setCalendarFilter}
 *   propertyFilter={propertyFilter}
 *   onPropertyChange={setPropertyFilter}
 *   sortDirection={sortDirection}
 *   onSortDirectionChange={setSortDirection}
 * />
 * ```
 */

interface FilterBarProps {
  statusFilter: string[]
  onStatusChange: (status: string[]) => void
  dateType: 'moveIn' | 'application'
  onDateTypeChange: (type: 'moveIn' | 'application') => void
  calendarFilter: string
  onCalendarChange: (filter: string) => void
  propertyFilter: string[]
  onPropertyChange: (property: string[]) => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

// Static filter options (date, calendar, sort)
// Status options are fetched from API

const dateTypeOptions: FilterOption[] = [
  { value: 'moveIn', label: 'Move-In Date' },
  { value: 'application', label: 'Application Date' }
]

const calendarOptions: FilterOption[] = [
  { value: 'All Time', label: 'All Time' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' }
]

const sortOptions: FilterOption[] = [
  { value: 'asc', label: 'Earliest First' },
  { value: 'desc', label: 'Latest First' }
]

export default function FilterBar({
  statusFilter,
  onStatusChange,
  dateType,
  onDateTypeChange,
  calendarFilter,
  onCalendarChange,
  propertyFilter,
  onPropertyChange,
  sortDirection,
  onSortDirectionChange
}: FilterBarProps) {
  const [statusOptions, setStatusOptions] = useState<FilterOption[]>([{ value: 'All', label: 'All' }])
  const [propertyOptions, setPropertyOptions] = useState<FilterOption[]>([{ value: 'All', label: 'All' }])
  const [isExpanded, setIsExpanded] = useState(true)

  // Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)
  const [dateTypeModalOpen, setDateTypeModalOpen] = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)

  // Fetch statuses from database
  const fetchStatusOptions = async (): Promise<FilterOption[]> => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()

      if (response.ok && data.success) {
        const statuses = data.data.map((status: { name: string; color: string }) => ({
          value: status.name,
          label: status.name,
          color: status.color
        }))
        return [{ value: 'All', label: 'All' }, ...statuses]
      }
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
    }
    return [{ value: 'All', label: 'All' }]
  }

  // Fetch properties from database
  const fetchPropertyOptions = async (): Promise<FilterOption[]> => {
    try {
      const response = await fetch('/api/properties')
      const data = await response.json()

      if (response.ok && data.success) {
        const properties = data.data.map((property: { name: string }) => ({
          value: property.name,
          label: property.name
        }))
        return [{ value: 'All', label: 'All' }, ...properties]
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    }
    return [{ value: 'All', label: 'All' }]
  }

  // Initialize options on mount
  useEffect(() => {
    fetchStatusOptions().then(setStatusOptions)
    fetchPropertyOptions().then(setPropertyOptions)
  }, [])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter.length > 0 && !statusFilter.includes('All')) count++
    if (dateType !== 'moveIn') count++
    if (calendarFilter !== 'All Time') count++
    if (propertyFilter.length > 0 && !propertyFilter.includes('All')) count++
    if (sortDirection !== 'asc') count++
    return count
  }, [statusFilter, dateType, calendarFilter, propertyFilter, sortDirection])

  // Clear all filters
  const handleClearFilters = () => {
    onStatusChange(['All'])
    onDateTypeChange('moveIn')
    onCalendarChange('All Time')
    onPropertyChange(['All'])
    onSortDirectionChange('asc')
  }

  // Handle status filter changes
  const handleStatusApply = (values: string[]) => {
    onStatusChange(values)
    setStatusModalOpen(false)
  }

  // Handle property filter changes
  const handlePropertyApply = (values: string[]) => {
    onPropertyChange(values)
    setPropertyModalOpen(false)
  }

  // Handle date type changes
  const handleDateTypeApply = (values: string[]) => {
    const type = values[0] as 'moveIn' | 'application'
    onDateTypeChange(type)
    setDateTypeModalOpen(false)
  }

  // Handle calendar filter changes
  const handleCalendarApply = (values: string[]) => {
    onCalendarChange(values[0] || 'All Time')
    setCalendarModalOpen(false)
  }

  // Handle sort direction changes
  const handleSortApply = (values: string[]) => {
    const direction = values[0] as 'asc' | 'desc'
    onSortDirectionChange(direction)
    setSortModalOpen(false)
  }

  // Get display labels
  const getStatusLabel = () => {
    if (statusFilter.includes('All') || statusFilter.length === 0) return 'All'
    if (statusFilter.length === 1) return statusFilter[0]
    return `${statusFilter.length} selected`
  }

  const getPropertyLabel = () => {
    if (propertyFilter.includes('All') || propertyFilter.length === 0) return 'All'
    if (propertyFilter.length === 1) return propertyFilter[0]
    return `${propertyFilter.length} selected`
  }

  const getDateTypeLabel = () => {
    return dateTypeOptions.find(opt => opt.value === dateType)?.label || 'Move-In Date'
  }

  const getSortLabel = () => {
    return sortOptions.find(opt => opt.value === sortDirection)?.label || 'Earliest First'
  }

  return (
    <div
      data-filterbar
      className="w-full h-fit flex flex-col px-6 py-3 bg-white border-b border-gray-200"
    >
      {/* Header Row */}
      <div className="flex items-center gap-3">
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Filters
        </button>

        {/* Active Filter Count */}
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            {activeFilterCount} active
          </span>
        )}

        {/* Clear All Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="ml-auto px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Options */}
      {isExpanded && (
        <div className="flex gap-3 items-center flex-wrap mt-3">
          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </label>
            <button
              onClick={() => setStatusModalOpen(!statusModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getStatusLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Property Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Property
            </label>
            <button
              onClick={() => setPropertyModalOpen(!propertyModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getPropertyLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Date Type Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Date Type
            </label>
            <button
              onClick={() => setDateTypeModalOpen(!dateTypeModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[160px]"
            >
              <span className="flex-1 text-left">{getDateTypeLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Calendar Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Time Range
            </label>
            <button
              onClick={() => setCalendarModalOpen(!calendarModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{calendarFilter}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Sort Direction */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sort
            </label>
            <button
              onClick={() => setSortModalOpen(!sortModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{getSortLabel()}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 12 8">
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Status Filter Modal - Multi-select with API fetch */}
      <FullScreenFilterModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Filter by Status"
        icon="tag"
        mode="multi"
        options={statusOptions}
        selectedValues={statusFilter}
        onApply={handleStatusApply}
        showApplyButton={true}
        fetchOptions={fetchStatusOptions}
      />

      {/* Property Filter Modal - Multi-select with API fetch */}
      <FullScreenFilterModal
        isOpen={propertyModalOpen}
        onClose={() => setPropertyModalOpen(false)}
        title="Filter by Property"
        icon="building"
        mode="multi"
        options={propertyOptions}
        selectedValues={propertyFilter}
        onApply={handlePropertyApply}
        showApplyButton={true}
        fetchOptions={fetchPropertyOptions}
      />

      {/* Date Type Modal - Single-select */}
      <FullScreenFilterModal
        isOpen={dateTypeModalOpen}
        onClose={() => setDateTypeModalOpen(false)}
        title="Select Date Type"
        icon="calendar"
        mode="single"
        options={dateTypeOptions}
        selectedValues={[dateType]}
        onApply={handleDateTypeApply}
        autoCloseOnSelect={true}
      />

      {/* Calendar/Time Range Modal - Single-select */}
      <FullScreenFilterModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        title="Filter by Time Range"
        icon="clock"
        mode="single"
        options={calendarOptions}
        selectedValues={[calendarFilter]}
        onApply={handleCalendarApply}
        autoCloseOnSelect={true}
      />

      {/* Sort Direction Modal - Single-select */}
      <FullScreenFilterModal
        isOpen={sortModalOpen}
        onClose={() => setSortModalOpen(false)}
        title="Sort Applications"
        icon="sort"
        mode="single"
        options={sortOptions}
        selectedValues={[sortDirection]}
        onApply={handleSortApply}
        autoCloseOnSelect={true}
      />
    </div>
  )
}
