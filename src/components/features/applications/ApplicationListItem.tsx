'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { STATUS_BADGE_COLORS } from '@/lib/constants'

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
 * 1. Update STATUS_BADGE_COLORS in lib/constants.ts to match your statuses
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
  status: string
  moveInDate: string
  createdAt: string
}

const ApplicationListItem = memo(function ApplicationListItem({ id, applicant, property, unitNumber, status, moveInDate }: ApplicationListItemProps) {
  return (
    <Link
      href={`/applications/${id}`}
      className="flex items-center justify-between w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="flex flex-col gap-2 sm:gap-1.5 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="font-semibold text-base sm:text-lg text-gray-900 truncate">
              {applicant}
            </span>
            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full w-fit ${STATUS_BADGE_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 text-sm sm:text-base text-gray-600">
            <span className="truncate font-medium">{property}</span>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <span className="text-gray-500">Unit {unitNumber}</span>
              <span className="text-gray-500">Move-in: {moveInDate}</span>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500 ml-3 sm:ml-4"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <span className="hidden sm:inline">View Details</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </Link>
  )
})

export default ApplicationListItem
