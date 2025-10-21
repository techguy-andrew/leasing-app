'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
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
  sortDirection: 'soonest' | 'furthest'
  onSortChange: (direction: 'soonest' | 'furthest') => void
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
  sortDirection,
  onSortChange,
  calendarFilter,
  onCalendarChange,
  propertyFilter,
  onPropertyChange
}: FilterBarProps) {
  const [propertyOptions, setPropertyOptions] = useState<string[]>(['All'])

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
  return (
    <motion.div
      data-filterbar
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="fixed left-0 right-0 w-full h-fit flex flex-col gap-4 px-6 py-4 bg-white border-b border-gray-200 z-30"
      style={{ top: 'calc(var(--topbar-height, 0px) + var(--navbar-height, 0px))' }}
    >
      {/* Filter Sections Container */}
      <motion.div
        className="flex flex-row flex-wrap gap-6 w-full"
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

        {/* Move-In Date Sorting Section */}
        <motion.div className="flex flex-col gap-2" variants={slideUp}>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Move-In Date</span>
          <div className="flex flex-row flex-wrap gap-2">
            <button
              onClick={() => onSortChange('soonest')}
              className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors flex flex-row items-center gap-1 ${
                sortDirection === 'soonest'
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Soonest
            </button>
            <button
              onClick={() => onSortChange('furthest')}
              className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors flex flex-row items-center gap-1 ${
                sortDirection === 'furthest'
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Furthest
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
  )
}
