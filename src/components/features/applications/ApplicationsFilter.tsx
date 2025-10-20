'use client'

import { motion } from 'motion/react'
import { STATUS_COLORS } from '@/lib/constants'

/**
 * ApplicationsFilter Component
 *
 * A reusable filter component for the applications list.
 * Provides status filtering, move-in date sorting, and calendar filtering.
 *
 * @example
 * ```tsx
 * <ApplicationsFilter
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

interface ApplicationsFilterProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  sortDirection: 'soonest' | 'furthest'
  onSortChange: (direction: 'soonest' | 'furthest') => void
  calendarFilter: string
  onCalendarChange: (filter: string) => void
}

const statusOptions = ['All', 'New', 'Pending', 'Approved', 'Rejected']
const calendarOptions = ['All Time', 'This Week', 'This Month']

export default function ApplicationsFilter({
  statusFilter,
  onStatusChange,
  sortDirection,
  onSortChange,
  calendarFilter,
  onCalendarChange
}: ApplicationsFilterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 py-5 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
    >
      {/* Status Filter */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                statusFilter === status
                  ? STATUS_COLORS[status]
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Move-In Date Sorting */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Move-In Date</span>
        <div className="flex gap-2">
          <button
            onClick={() => onSortChange('soonest')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
              sortDirection === 'soonest'
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Soonest
          </button>
          <button
            onClick={() => onSortChange('furthest')}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${
              sortDirection === 'furthest'
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Furthest
          </button>
        </div>
      </div>

      {/* Calendar Filter */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Calendar</span>
        <div className="flex flex-wrap gap-2">
          {calendarOptions.map((option) => (
            <button
              key={option}
              onClick={() => onCalendarChange(option)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                calendarFilter === option
                  ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
