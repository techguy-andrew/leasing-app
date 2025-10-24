'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import LoadingScreen from '@/components/shared/LoadingScreen'

interface Application {
  id: number
  status: string[]
}

interface Status {
  id: string
  name: string
  color: string
  order: number
}

interface StatusCount {
  status: string
  count: number
  color: string
}

export default function Home() {
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Helper to get text color based on background
  const getTextColorClass = (hexColor: string) => {
    const r = parseInt(hexColor.slice(1, 3), 16)
    const g = parseInt(hexColor.slice(3, 5), 16)
    const b = parseInt(hexColor.slice(5, 7), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? 'text-gray-900' : 'text-white'
  }

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch both applications and statuses in parallel
        const [appsResponse, statusesResponse] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/statuses')
        ])

        const appsData = await appsResponse.json()
        const statusesData = await statusesResponse.json()

        if (appsResponse.ok) {
          const applications: Application[] = appsData.data

          // Count applications by status
          const counts: Record<string, number> = {}

          applications.forEach((app) => {
            // Each application can have multiple statuses
            app.status.forEach((statusName) => {
              counts[statusName] = (counts[statusName] || 0) + 1
            })
          })

          let statusCountsArray: StatusCount[] = []

          // If we have custom statuses, use those
          if (statusesResponse.ok && statusesData.data.length > 0) {
            const statuses: Status[] = statusesData.data
            statusCountsArray = statuses
              .map((status) => ({
                status: status.name,
                count: counts[status.name] || 0,
                color: status.color
              }))
              .filter((item) => item.count > 0) // Only show statuses with applications
          }
          // Otherwise, create status counts from existing application statuses
          else {
            const defaultColors: Record<string, string> = {
              'New': '#3B82F6',
              'Pending': '#EAB308',
              'Approved': '#10B981',
              'Rejected': '#EF4444',
              'Outstanding Tasks': '#F59E0B',
              'Ready for Move-In': '#14B8A6',
              'Archived': '#64748B'
            }

            statusCountsArray = Object.entries(counts)
              .filter(([_, count]) => count > 0)
              .map(([statusName, count]) => ({
                status: statusName,
                count,
                color: defaultColors[statusName] || '#6B7280'
              }))
              .sort((a, b) => b.count - a.count) // Sort by count descending
          }

          setStatusCounts(statusCountsArray)
        }
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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
        {statusCounts.map(({ status, count, color }) => {
          const textColor = getTextColorClass(color)
          return (
            <Link
              key={status}
              href={`/applications?status=${status}`}
            >
              <motion.div
                className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                variants={staggerItem}
              >
                <span className="text-base font-semibold text-gray-900">{count}</span>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${textColor}`}
                  style={{ backgroundColor: color }}
                >
                  {status}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>
    </div>
  )
}
