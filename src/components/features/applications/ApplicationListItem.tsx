'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import Pill from '@/components/shared/Pill'

/**
 * ApplicationListItem Component
 *
 * A list item component for displaying application summary information.
 * Clickable card that links to the application detail page.
 *
 * @example
 * ```tsx
 * <ApplicationListItem
 *   id={123}
 *   applicant="John Doe"
 *   property="Sunset Apartments"
 *   unitNumber="101"
 *   status="Pending"
 *   moveInDate="12/01/2024"
 *   createdAt="11/15/2024"
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Manage statuses via the Settings page (/settings)
 * 2. Modify displayed fields to match your data structure
 * 3. Change link destination (/applications/${id}) to your detail route
 * 4. Adjust responsive breakpoints (sm:, md:) as needed
 * 5. Customize hover effects (hover:bg-gray-50) to your design
 */

interface ApplicationListItemProps {
  id: number
  applicant: string
  property: string
  unitNumber: string
  status: string[]
  moveInDate: string
  createdAt: string
  statusColors?: Record<string, string>
}

const ApplicationListItem = memo(function ApplicationListItem({ id, applicant, property, unitNumber, status, moveInDate, statusColors = {} }: ApplicationListItemProps) {
  return (
    <Link
      href={`/applications/${id}`}
      className="flex items-center justify-between w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Name */}
        <span className="font-semibold text-base text-gray-900 truncate">
          {applicant}
        </span>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5">
          {status.map((s, index) => {
            const bgColor = statusColors[s] || '#6B7280' // Default grey
            return (
              <Pill
                key={`${s}-${index}`}
                label={s}
                color={bgColor}
                variant="default"
              />
            )
          })}
        </div>

        {/* Property */}
        <span className="truncate font-medium text-gray-900">
          {property}
        </span>

        {/* Unit */}
        <span className="text-gray-500 text-sm">
          Unit {unitNumber}
        </span>

        {/* Move-in Date */}
        <span className="text-gray-500 text-sm">
          Move-in: {moveInDate}
        </span>
      </div>

      <motion.div
        className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-500 ml-3 sm:ml-4"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.15 }}
      >
        <span className="hidden sm:inline">View Details</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </Link>
  )
})

export default ApplicationListItem
