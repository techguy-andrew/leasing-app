'use client'

import { AnimatePresence, motion } from 'motion/react'
import ApplicationListItem from './ApplicationListItem'

/**
 * ApplicationsList Component
 *
 * A reusable list component for displaying filtered and sorted applications.
 * Handles loading states, empty states, and animated list rendering.
 *
 * @example
 * ```tsx
 * <ApplicationsList
 *   applications={filteredApplications}
 *   isLoading={isLoading}
 *   statusFilter={statusFilter}
 *   calendarFilter={calendarFilter}
 *   sortDirection={sortDirection}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Update the Application interface to match your database schema
 * 2. Update ApplicationListItem props to match your data structure
 * 3. Adjust the animation delays and durations as needed
 * 4. Customize loading and empty state messages
 */

interface Application {
  id: number
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
}

interface ApplicationsListProps {
  applications: Application[]
  isLoading: boolean
  statusFilter: string
  calendarFilter: string
  sortDirection: 'soonest' | 'furthest'
}

export default function ApplicationsList({
  applications,
  isLoading,
  statusFilter,
  calendarFilter,
  sortDirection
}: ApplicationsListProps) {
  return (
    <div className="flex flex-col w-full flex-1 bg-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center py-12 text-gray-500"
          >
            Loading applications...
          </motion.div>
        ) : applications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center py-12 text-gray-500"
          >
            {statusFilter === 'All' && calendarFilter === 'All Time'
              ? 'No applications found'
              : 'No applications match the selected filters'}
          </motion.div>
        ) : (
          <motion.div
            key={`filtered-${statusFilter}-${sortDirection}-${calendarFilter}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col w-full"
          >
            {applications.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.15,
                  delay: Math.min(index * 0.02, 0.3),
                  ease: 'easeOut'
                }}
              >
                <ApplicationListItem
                  id={app.id}
                  applicant={app.applicant}
                  property={app.property}
                  unitNumber={app.unitNumber}
                  status={app.status}
                  moveInDate={app.moveInDate}
                  createdAt={app.createdAt}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
