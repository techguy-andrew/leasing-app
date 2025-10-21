'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { STATUS_BADGE_COLORS } from '@/lib/constants'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'

interface Application {
  id: number
  status: string
}

interface StatusCount {
  status: string
  count: number
  colorClass: string
}

export default function Home() {
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch('/api/applications')
        const data = await response.json()

        if (response.ok) {
          const applications: Application[] = data.data

          // Count applications by status (excluding Archived)
          const counts = {
            New: 0,
            Pending: 0,
            Approved: 0,
            Rejected: 0
          }

          applications.forEach((app) => {
            if (app.status in counts) {
              counts[app.status as keyof typeof counts]++
            }
          })

          // Create status count array with colors
          const statusCountsArray: StatusCount[] = [
            { status: 'New', count: counts.New, colorClass: STATUS_BADGE_COLORS.New },
            { status: 'Pending', count: counts.Pending, colorClass: STATUS_BADGE_COLORS.Pending },
            { status: 'Approved', count: counts.Approved, colorClass: STATUS_BADGE_COLORS.Approved },
            { status: 'Rejected', count: counts.Rejected, colorClass: STATUS_BADGE_COLORS.Rejected }
          ]

          setStatusCounts(statusCountsArray)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadApplications()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-8">
      <motion.div
        className="flex flex-col gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statusCounts.map(({ status, count, colorClass }) => (
          <motion.div
            key={status}
            className="flex items-center gap-4"
            variants={staggerItem}
          >
            <span className="text-2xl font-semibold text-gray-900">{count}</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClass}`}>
              {status}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
