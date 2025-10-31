'use client'

import { useState, useEffect, useCallback } from 'react'
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
  status: string[]
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
  statusFilter: string[]
  calendarFilter: string
  dateType: 'moveIn' | 'application'
}

interface ApiStatus {
  id: string
  name: string
  color: string
  order: number
}

export default function ApplicationsList({
  applications,
  isLoading,
  statusFilter,
  calendarFilter,
  dateType
}: ApplicationsListProps) {
  const [statusColors, setStatusColors] = useState<Record<string, string>>({})
  const [statusOrder, setStatusOrder] = useState<Record<string, number>>({})

  // Fetch status colors and order
  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/statuses', { cache: 'no-store' })
      const data = await response.json()

      const colors: Record<string, string> = {}
      const order: Record<string, number> = {}

      if (response.ok && data.success && data.data.length > 0) {
        const statuses: ApiStatus[] = data.data
        statuses.forEach((status) => {
          colors[status.name] = status.color
          order[status.name] = status.order
        })
      } else {
        // Fallback colors for legacy statuses if Status table is empty
        const defaultColors: Record<string, string> = {
          'New': '#3B82F6',
          'Pending': '#EAB308',
          'Approved': '#10B981',
          'Rejected': '#EF4444',
          'Outstanding Tasks': '#F59E0B',
          'Ready for Move-In': '#14B8A6',
          'Archived': '#64748B'
        }
        Object.assign(colors, defaultColors)
      }

      setStatusColors(colors)
      setStatusOrder(order)
    } catch (error) {
      console.error('Failed to fetch statuses:', error)
      // Set default colors even on error
      const defaultColors: Record<string, string> = {
        'New': '#3B82F6',
        'Pending': '#EAB308',
        'Approved': '#10B981',
        'Rejected': '#EF4444',
        'Outstanding Tasks': '#F59E0B',
        'Ready for Move-In': '#14B8A6',
        'Archived': '#64748B'
      }
      setStatusColors(defaultColors)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  // Refetch when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchStatuses()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchStatuses])

  return (
    <div className="flex flex-col w-full bg-white p-4 sm:p-6 md:p-8">
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
            className="flex items-center justify-center py-12 sm:py-16 text-gray-500 text-sm sm:text-base"
          >
            {statusFilter.includes('All') && calendarFilter === 'All Time'
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
                  statusColors={statusColors}
                  statusOrder={statusOrder}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
