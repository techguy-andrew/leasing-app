'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import HeaderCard from '@/components/Cards/HeaderCard'
import ListItem from '@/components/Items/ListItem'

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

const statusColors: Record<string, string> = {
  All: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  New: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  Pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  Approved: 'bg-green-100 text-green-800 hover:bg-green-200',
  Rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
}

const statusOptions = ['All', 'New', 'Pending', 'Approved', 'Rejected']
const calendarOptions = ['All Time', 'This Week', 'This Month']

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortDirection, setSortDirection] = useState<'soonest' | 'furthest'>('soonest')
  const [calendarFilter, setCalendarFilter] = useState('All Time')

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch('/api/applications')
        const data = await response.json()

        if (response.ok) {
          setApplications(data.data)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadApplications()
  }, [])

  const getStartOfWeek = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    return new Date(now.setDate(diff))
  }

  const getEndOfWeek = () => {
    const startOfWeek = getStartOfWeek()
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return endOfWeek
  }

  const getStartOfMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const getEndOfMonth = () => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }

  const parseMoveInDate = (dateString: string) => {
    // Parse MM/DD/YYYY format
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1
      const day = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return new Date(dateString)
  }

  // First filter by status
  let filteredApplications = statusFilter === 'All'
    ? applications
    : applications.filter(app => app.status === statusFilter)

  // Then apply calendar filter
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (calendarFilter === 'This Week') {
    const startOfWeek = getStartOfWeek()
    const endOfWeek = getEndOfWeek()
    startOfWeek.setHours(0, 0, 0, 0)
    endOfWeek.setHours(23, 59, 59, 999)

    filteredApplications = filteredApplications.filter(app => {
      const moveInDate = parseMoveInDate(app.moveInDate)
      return moveInDate >= startOfWeek && moveInDate <= endOfWeek
    })
  } else if (calendarFilter === 'This Month') {
    const startOfMonth = getStartOfMonth()
    const endOfMonth = getEndOfMonth()
    startOfMonth.setHours(0, 0, 0, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    filteredApplications = filteredApplications.filter(app => {
      const moveInDate = parseMoveInDate(app.moveInDate)
      return moveInDate >= startOfMonth && moveInDate <= endOfMonth
    })
  }

  // Sort by move-in date based on direction
  filteredApplications = [...filteredApplications].sort((a, b) => {
    const dateA = parseMoveInDate(a.moveInDate)
    const dateB = parseMoveInDate(b.moveInDate)

    if (sortDirection === 'furthest') {
      return dateB.getTime() - dateA.getTime() // Furthest first (descending)
    } else {
      return dateA.getTime() - dateB.getTime() // Closest first (ascending)
    }
  })

  return (
    <>
      <div className="w-full">
        <HeaderCard
          title="Applications"
          description="View and manage all lease applications"
        />
      </div>
      <div className="w-full">
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
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  statusFilter === status
                    ? statusColors[status]
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
              onClick={() => setSortDirection('soonest')}
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
              onClick={() => setSortDirection('furthest')}
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
                onClick={() => setCalendarFilter(option)}
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
      </div>
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
          ) : filteredApplications.length === 0 ? (
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
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: 'easeOut'
                  }}
                >
                  <ListItem
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
    </>
  )
}
