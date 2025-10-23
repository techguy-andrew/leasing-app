'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { STATUS_COLORS } from '@/lib/constants'
import { fadeIn, listStagger, slideUp } from '@/lib/animations/variants'

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
 * 1. Update STATUS_COLORS constant in lib/constants.ts with your status types
 * 2. Modify statusOptions array to match your application statuses
 * 3. Adjust calendarOptions if needed for your date filtering requirements
 */

interface FilterBarProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  dateType: 'moveIn' | 'application'
  onDateTypeChange: (type: 'moveIn' | 'application') => void
  calendarFilter: string
  onCalendarChange: (filter: string) => void
  propertyFilter: string
  onPropertyChange: (property: string) => void
}

const statusOptions = ['All', 'New', 'Pending', 'Approved', 'Rejected', 'Archived']
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
  const [isOpen, setIsOpen] = useState(false)

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
    if (statusFilter !== 'All') count++
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
    onStatusChange('All')
    onDateTypeChange('moveIn')
    onCalendarChange('All Time')
    onPropertyChange('All')
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
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                <div className="flex flex-row flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => onStatusChange(status)}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                        statusFilter === status
                          ? STATUS_COLORS[status]
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
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
