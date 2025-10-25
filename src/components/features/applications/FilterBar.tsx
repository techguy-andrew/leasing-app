'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn, listStagger, slideUp } from '@/lib/animations/variants'
import Pill from '@/components/shared/Pill'

/**
 * FilterBar Component
 *
 * A reusable filter component for the applications list.
 * Provides status filtering, move-in date sorting, and calendar filtering.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   statusFilter={statusFilter}
 *   onStatusChange={setStatusFilter}
 *   sortDirection={sortDirection}
 *   onSortChange={setSortDirection}
 *   calendarFilter={calendarFilter}
 *   onCalendarChange={setCalendarFilter}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Manage statuses via the Settings page (/settings)
 * 2. Statuses are fetched from /api/statuses with dynamic colors
 * 3. Adjust calendarOptions if needed for your date filtering requirements
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
}

interface ApiStatus {
  id: string
  name: string
  color: string
  order: number
}

const calendarOptions = ['All Time', 'This Week', 'This Month']

export default function FilterBar({
  statusFilter,
  onStatusChange,
  dateType,
  onDateTypeChange,
  calendarFilter,
  onCalendarChange,
  propertyFilter,
  onPropertyChange
}: FilterBarProps) {
  const [propertyOptions, setPropertyOptions] = useState<string[]>(['All'])
  const [statusOptions, setStatusOptions] = useState<string[]>(['All'])
  const [statusColors, setStatusColors] = useState<Record<string, string>>({ All: '#9CA3AF' })
  const [isOpen, setIsOpen] = useState(true) // Open by default to show statuses immediately

  // Fetch statuses from database and applications
  const fetchData = useCallback(async () => {
    try {
      // Fetch both statuses and applications in parallel
      const [statusesResponse, appsResponse] = await Promise.all([
        fetch('/api/statuses', { cache: 'no-store' }),
        fetch('/api/applications', { cache: 'no-store' })
      ])

      const statusesData = await statusesResponse.json()
      const appsData = await appsResponse.json()

      let finalStatusOptions: string[] = ['All']
      const colors: Record<string, string> = { All: '#9CA3AF' }

      // If we have custom statuses in the database, use those
      if (statusesResponse.ok && statusesData.success && statusesData.data.length > 0) {
        const statuses: ApiStatus[] = statusesData.data
        const statusNames = statuses.map((status) => status.name)
        statuses.forEach((status) => {
          colors[status.name] = status.color
        })
        finalStatusOptions = ['All', ...statusNames]
      }
      // Otherwise, extract unique statuses from applications (migration fallback)
      else if (appsResponse.ok && appsData.success) {
        const apps: Array<{ status: string[] }> = appsData.data
        const uniqueStatuses = new Set<string>()
        apps.forEach(app => {
          app.status.forEach(s => uniqueStatuses.add(s))
        })
        const extractedStatuses = Array.from(uniqueStatuses).sort()
        finalStatusOptions = ['All', ...extractedStatuses]
        // Assign default colors for legacy statuses
        const defaultColors: Record<string, string> = {
          'New': '#3B82F6',
          'Pending': '#EAB308',
          'Approved': '#10B981',
          'Rejected': '#EF4444',
          'Outstanding Tasks': '#F59E0B',
          'Ready for Move-In': '#14B8A6',
          'Archived': '#64748B'
        }
        extractedStatuses.forEach(status => {
          colors[status] = defaultColors[status] || '#6B7280'
        })
      }

      setStatusOptions(finalStatusOptions)
      setStatusColors(colors)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setStatusOptions(['All'])
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Refetch when window regains focus (e.g., after adding a status in another tab or returning from Settings)
  useEffect(() => {
    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)

    // Also listen for visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchData])

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
    return count
  }, [statusFilter, dateType, calendarFilter, propertyFilter])

  // Toggle accordion
  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  // Clear all filters
  const handleClearFilters = () => {
    onStatusChange(['All'])
    onDateTypeChange('moveIn')
    onCalendarChange('All Time')
    onPropertyChange('All')
  }

  // Handle status filter toggle
  const handleStatusToggle = (status: string) => {
    if (status === 'All') {
      onStatusChange(['All'])
    } else {
      if (statusFilter.includes(status)) {
        // Remove status if already selected
        const newFilter = statusFilter.filter(s => s !== status && s !== 'All')
        onStatusChange(newFilter.length > 0 ? newFilter : ['All'])
      } else {
        // Add status if not selected, remove 'All'
        const newFilter = [...statusFilter.filter(s => s !== 'All'), status]
        onStatusChange(newFilter)
      }
    }
  }

  return (
    <motion.div
      data-filterbar
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="fixed left-0 right-0 w-full h-fit flex flex-col px-6 py-3 bg-white border-b border-gray-200 z-30"
      style={{ top: 'calc(var(--topbar-height, 0px) + var(--searchbox-height, 0px))' }}
    >
      {/* Accordion Header - Always Visible */}
      <button
        onClick={toggleAccordion}
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {/* Chevron Icon */}
        <motion.svg
          className="w-3 h-3 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </motion.svg>

        {/* "Filters" Text */}
        <span className="text-[10pt] text-gray-700 font-medium">Filters</span>

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-[9pt] font-medium bg-blue-100 text-blue-700 rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </button>

      {/* Accordion Content - Expandable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Clear Button */}
            <div className="flex justify-end mt-3 mb-2">
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Filter Sections Container */}
            <motion.div
              className="flex flex-row flex-wrap gap-6 w-full pb-2"
              variants={listStagger}
              initial="hidden"
              animate="visible"
            >
              {/* Status Filter Section */}
              <motion.div className="flex flex-col gap-2" variants={slideUp}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status (AND)</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {statusOptions.map((status) => {
                    const isSelected = statusFilter.includes(status)
                    const bgColor = statusColors[status] || '#6B7280'
                    return (
                      <Pill
                        key={status}
                        label={status}
                        color={bgColor}
                        variant="filter"
                        onClick={() => handleStatusToggle(status)}
                        isSelected={isSelected}
                        showCheckbox={true}
                      />
                    )
                  })}
                </div>
              </motion.div>

              {/* Date Type Selection Section */}
              <motion.div className="flex flex-col gap-2" variants={slideUp}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</span>
                <div className="flex flex-row flex-wrap gap-2">
                  <button
                    onClick={() => onDateTypeChange('moveIn')}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                      dateType === 'moveIn'
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Move-In Date
                  </button>
                  <button
                    onClick={() => onDateTypeChange('application')}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                      dateType === 'application'
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Application Date
                  </button>
                </div>
              </motion.div>

              {/* Calendar Filter Section */}
              <motion.div className="flex flex-col gap-2" variants={slideUp}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calendar</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {calendarOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => onCalendarChange(option)}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                        calendarFilter === option
                          ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Property Filter Section */}
              <motion.div className="flex flex-col gap-2" variants={slideUp}>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {propertyOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => onPropertyChange(option)}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                        propertyFilter === option
                          ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
