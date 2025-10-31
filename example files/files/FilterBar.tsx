'use client'

import { motion } from 'motion/react'
import { fadeIn, slideUp } from '@/lib/animations/variants'

/**
 * 🎯 FOREVER-ADAPTABLE FILTER BAR
 * 
 * Based on Design Philosophy: Section 3 (Flexbox Layout) & Section 5 (Wrap & Spacing)
 * 
 * This filter bar uses:
 * - NATURAL DOCUMENT FLOW (no fixed positioning)
 * - flex-wrap for responsive layout
 * - gap-4 for consistent spacing
 * 
 * Key Changes from Old Design:
 * ❌ REMOVED: position: fixed
 * ❌ REMOVED: style={{ top: 'calc(var(--topbar-height) + var(--searchbox-height))' }}
 * ❌ REMOVED: z-index stacking
 * ✅ ADDED: flex-wrap for mobile adaptation
 * ✅ ADDED: gap-based spacing (Section 5.3)
 * ✅ ADDED: Responsive breakpoints
 * 
 * Benefits:
 * - Wraps gracefully on mobile
 * - No JavaScript calculations
 * - Works on all screen sizes
 * - Automatic spacing
 * 
 * @example
 * ```tsx
 * <FilterBar
 *   statusFilter="all"
 *   onStatusChange={setStatusFilter}
 *   dateType="moveInDate"
 *   onDateTypeChange={setDateType}
 *   calendarFilter="allTime"
 *   onCalendarChange={setCalendarFilter}
 *   propertyFilter="all"
 *   onPropertyChange={setPropertyFilter}
 *   sortDirection="asc"
 *   onSortDirectionChange={setSortDirection}
 * />
 * ```
 */

interface FilterBarProps {
  statusFilter: string
  onStatusChange: (status: string) => void
  dateType: 'moveInDate' | 'applicationDate'
  onDateTypeChange: (type: 'moveInDate' | 'applicationDate') => void
  calendarFilter: string
  onCalendarChange: (filter: string) => void
  propertyFilter: string
  onPropertyChange: (property: string) => void
  sortDirection: 'asc' | 'desc'
  onSortDirectionChange: (direction: 'asc' | 'desc') => void
}

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
  return (
    <motion.div
      data-filterbar
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="w-full flex flex-row flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white border-b border-gray-200"
    >
      {/* Status Filter */}
      <motion.div 
        variants={slideUp}
        className="flex items-center gap-2"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Date Type Toggle */}
      <motion.div 
        variants={slideUp}
        className="flex items-center gap-2"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Date:
        </label>
        <select
          value={dateType}
          onChange={(e) => onDateTypeChange(e.target.value as 'moveInDate' | 'applicationDate')}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="moveInDate">Move-in Date</option>
          <option value="applicationDate">Application Date</option>
        </select>
      </motion.div>

      {/* Calendar Filter */}
      <motion.div 
        variants={slideUp}
        className="flex items-center gap-2"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Period:
        </label>
        <select
          value={calendarFilter}
          onChange={(e) => onCalendarChange(e.target.value)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="allTime">All Time</option>
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </motion.div>

      {/* Property Filter */}
      <motion.div 
        variants={slideUp}
        className="flex items-center gap-2"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Property:
        </label>
        <select
          value={propertyFilter}
          onChange={(e) => onPropertyChange(e.target.value)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Properties</option>
        </select>
      </motion.div>

      {/* Sort Direction */}
      <motion.div 
        variants={slideUp}
        className="flex items-center gap-2"
      >
        <label className="text-xs sm:text-sm font-medium text-gray-700">
          Sort:
        </label>
        <select
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as 'asc' | 'desc')}
          className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="asc">Soonest First</option>
          <option value="desc">Latest First</option>
        </select>
      </motion.div>
    </motion.div>
  )
}
