'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import StatusSelectionModal from '@/components/shared/modals/StatusSelectionModal'
import FilterSelectionModal from '@/components/shared/modals/FilterSelectionModal'
import SortingSelectionModal from '@/components/shared/modals/SortingSelectionModal'

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
  propertyFilter: string
  onPropertyChange: (property: string) => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

const calendarOptions = ['All Time', 'This Week', 'This Month']
const dateTypeOptions = ['Move-In Date', 'Application Date']

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
  const [propertyOptions, setPropertyOptions] = useState<string[]>(['All'])
  const [isExpanded, setIsExpanded] = useState(true)

  // Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [propertyModalOpen, setPropertyModalOpen] = useState(false)
  const [dateTypeModalOpen, setDateTypeModalOpen] = useState(false)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)

  // Refs for modal positioning
  const statusButtonRef = useRef<HTMLButtonElement>(null)
  const propertyButtonRef = useRef<HTMLButtonElement>(null)
  const dateTypeButtonRef = useRef<HTMLButtonElement>(null)
  const calendarButtonRef = useRef<HTMLButtonElement>(null)
  const sortButtonRef = useRef<HTMLButtonElement>(null)

  // Fetch properties from database
  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties')
        const data = await response.json()

        if (response.ok && data.success) {
          const properties = data.data.map((property: { name: string }) => property.name)
          setPropertyOptions(['All', ...properties])
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        setPropertyOptions(['All'])
      }
    }

    fetchProperties()
  }, [])

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (statusFilter.length > 0 && !statusFilter.includes('All')) count++
    if (dateType !== 'moveIn') count++
    if (calendarFilter !== 'All Time') count++
    if (propertyFilter !== 'All') count++
    if (sortDirection !== 'asc') count++
    return count
  }, [statusFilter, dateType, calendarFilter, propertyFilter, sortDirection])

  // Clear all filters
  const handleClearFilters = () => {
    onStatusChange(['All'])
    onDateTypeChange('moveIn')
    onCalendarChange('All Time')
    onPropertyChange('All')
    onSortDirectionChange('asc')
  }

  // Handle status filter toggle
  const handleStatusToggle = (status: string) => {
    if (status === 'All') {
      onStatusChange(['All'])
    } else {
      if (statusFilter.includes(status)) {
        const newFilter = statusFilter.filter(s => s !== status && s !== 'All')
        onStatusChange(newFilter.length > 0 ? newFilter : ['All'])
      } else {
        const newFilter = [...statusFilter.filter(s => s !== 'All'), status]
        onStatusChange(newFilter)
      }
    }
  }

  // Handle property filter toggle
  const handlePropertyToggle = (property: string) => {
    if (property === 'All') {
      onPropertyChange('All')
    } else {
      onPropertyChange(property)
    }
  }

  // Handle date type toggle
  const handleDateTypeToggle = (option: string) => {
    const type = option === 'Move-In Date' ? 'moveIn' : 'application'
    onDateTypeChange(type)
    setDateTypeModalOpen(false)
  }

  // Handle calendar toggle
  const handleCalendarToggle = (option: string) => {
    onCalendarChange(option)
    setCalendarModalOpen(false)
  }

  // Get display labels
  const getStatusLabel = () => {
    if (statusFilter.includes('All') || statusFilter.length === 0) return 'All'
    if (statusFilter.length === 1) return statusFilter[0]
    return `${statusFilter.length} selected`
  }

  const getDateTypeLabel = () => {
    return dateType === 'moveIn' ? 'Move-In Date' : 'Application Date'
  }

  const getSortLabel = () => {
    return sortDirection === 'asc' ? 'Earliest First' : 'Latest First'
  }

  return (
    <div
      data-filterbar
      className="fixed left-0 right-0 w-full h-fit flex flex-col px-6 py-3 bg-white border-b border-gray-200 z-30"
      style={{ top: 'calc(var(--topbar-height, 0px) + var(--searchbox-height, 0px))' }}
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
              ref={statusButtonRef}
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
              ref={propertyButtonRef}
              onClick={() => setPropertyModalOpen(!propertyModalOpen)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-800 hover:border-gray-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all flex items-center gap-2 min-w-[140px]"
            >
              <span className="flex-1 text-left">{propertyFilter}</span>
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
              ref={dateTypeButtonRef}
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
              ref={calendarButtonRef}
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
              ref={sortButtonRef}
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
      <StatusSelectionModal
        isOpen={statusModalOpen}
        triggerRef={statusButtonRef}
        selectedStatuses={statusFilter}
        onStatusToggle={handleStatusToggle}
        onClose={() => setStatusModalOpen(false)}
      />

      <FilterSelectionModal
        isOpen={propertyModalOpen}
        triggerRef={propertyButtonRef}
        options={propertyOptions}
        selectedOptions={[propertyFilter]}
        onOptionToggle={handlePropertyToggle}
        onClose={() => setPropertyModalOpen(false)}
        multiSelect={false}
      />

      <FilterSelectionModal
        isOpen={dateTypeModalOpen}
        triggerRef={dateTypeButtonRef}
        options={dateTypeOptions}
        selectedOptions={[getDateTypeLabel()]}
        onOptionToggle={handleDateTypeToggle}
        onClose={() => setDateTypeModalOpen(false)}
        multiSelect={false}
      />

      <FilterSelectionModal
        isOpen={calendarModalOpen}
        triggerRef={calendarButtonRef}
        options={calendarOptions}
        selectedOptions={[calendarFilter]}
        onOptionToggle={handleCalendarToggle}
        onClose={() => setCalendarModalOpen(false)}
        multiSelect={false}
      />

      <SortingSelectionModal
        isOpen={sortModalOpen}
        triggerRef={sortButtonRef}
        selectedDirection={sortDirection}
        onDirectionChange={onSortDirectionChange}
        onClose={() => setSortModalOpen(false)}
      />
    </div>
  )
}
