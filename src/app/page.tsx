'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { STATUS_BADGE_COLORS } from '@/lib/constants'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import LoadingScreen from '@/components/shared/LoadingScreen'

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
    return <LoadingScreen />
  }

  return (
    <div className="w-full max-w-7xl p-4 md:p-8">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statusCounts.map(({ status, count, colorClass }) => (
          <Link
            key={status}
            href={`/applications?status=${status}`}
          >
            <motion.div
              className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200"
              variants={staggerItem}
            >
              <span className="text-base font-semibold text-gray-900">{count}</span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                {status}
              </span>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
