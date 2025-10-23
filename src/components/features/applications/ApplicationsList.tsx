'use client'

import { AnimatePresence, motion } from 'motion/react'
import ApplicationListItem from './ApplicationListItem'
import LoadingScreen from '@/components/shared/LoadingScreen'
import { listStagger, slideUp, scaleIn } from '@/lib/animations/variants'

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
  dateType: 'moveIn' | 'application'
}

export default function ApplicationsList({
  applications,
  isLoading,
  statusFilter,
  calendarFilter,
  dateType
}: ApplicationsListProps) {
  return (
    <div className="flex flex-col w-full bg-white">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : applications.length === 0 ? (
          <motion.div
            key="empty"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center justify-center py-16 text-gray-500 text-sm"
          >
            {statusFilter === 'All' && calendarFilter === 'All Time'
              ? 'No applications found'
              : 'No applications match the selected filters'}
          </motion.div>
        ) : (
          <motion.div
            key={`filtered-${statusFilter}-${dateType}-${calendarFilter}`}
            variants={listStagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col w-full"
          >
            {applications.map((app) => (
              <motion.div
                key={app.id}
                variants={slideUp}
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
