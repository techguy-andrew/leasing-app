'use client'

import { Suspense, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilter } from '@/contexts/FilterContext'
import ApplicationsList from '@/components/ApplicationsList'

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

function ApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const { statusFilter, setStatusFilter, dateType, calendarFilter, propertyFilter, sortDirection } = useFilter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set status filter from URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setStatusFilter([statusParam])
    }
  }, [searchParams, setStatusFilter])

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

  // Scroll to top when filters change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [statusFilter, propertyFilter, dateType, calendarFilter, sortDirection])

  const getStartOfWeek = useCallback(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    return new Date(now.setDate(diff))
  }, [])

  const getEndOfWeek = useCallback(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek
    const startOfWeek = new Date(now.setDate(diff))
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return endOfWeek
  }, [])

  const getStartOfMonth = useCallback(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }, [])

  const getEndOfMonth = useCallback(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }, [])

  const parseMoveInDate = useCallback((dateString: string) => {
    // Parse MM/DD/YYYY format
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1
      const day = parseInt(parts[1], 10)
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return new Date(dateString)
  }, [])

  const filteredApplications = useMemo(() => {
    // First filter by status using AND logic
    let filtered = applications

    if (statusFilter.includes('All')) {
      // "All" means show all non-archived applications
      filtered = applications.filter(app => !app.status.includes('Archived'))
    } else if (statusFilter.length > 0) {
      // AND logic: application must have ALL selected statuses
      filtered = applications.filter(app =>
        statusFilter.every(status => app.status.includes(status))
      )
    }

    // Then filter by property
    if (propertyFilter.length > 0 && !propertyFilter.includes('All')) {
      filtered = filtered.filter(app => propertyFilter.includes(app.property))
    }

    // Then apply calendar filter based on selected date type
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (calendarFilter === 'This Week') {
      const startOfWeek = getStartOfWeek()
      const endOfWeek = getEndOfWeek()
      startOfWeek.setHours(0, 0, 0, 0)
      endOfWeek.setHours(23, 59, 59, 999)

      filtered = filtered.filter(app => {
        const date = dateType === 'moveIn'
          ? parseMoveInDate(app.moveInDate)
          : parseMoveInDate(app.createdAt)
        return date >= startOfWeek && date <= endOfWeek
      })
    } else if (calendarFilter === 'This Month') {
      const startOfMonth = getStartOfMonth()
      const endOfMonth = getEndOfMonth()
      startOfMonth.setHours(0, 0, 0, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      filtered = filtered.filter(app => {
        const date = dateType === 'moveIn'
          ? parseMoveInDate(app.moveInDate)
          : parseMoveInDate(app.createdAt)
        return date >= startOfMonth && date <= endOfMonth
      })
    }

    // Sort by selected date type and direction
    return [...filtered].sort((a, b) => {
      const dateA = dateType === 'moveIn'
        ? parseMoveInDate(a.moveInDate)
        : parseMoveInDate(a.createdAt)
      const dateB = dateType === 'moveIn'
        ? parseMoveInDate(b.moveInDate)
        : parseMoveInDate(b.createdAt)

      const diff = dateA.getTime() - dateB.getTime()
      return sortDirection === 'asc' ? diff : -diff
    })
  }, [applications, statusFilter, propertyFilter, calendarFilter, dateType, sortDirection, parseMoveInDate, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth])

  return (
    <div ref={scrollContainerRef} className="w-full h-full overflow-y-auto">
      <ApplicationsList
        applications={filteredApplications}
        isLoading={isLoading}
        statusFilter={statusFilter}
        calendarFilter={calendarFilter}
        dateType={dateType}
      />
    </div>
  )
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
      <ApplicationsContent />
    </Suspense>
  )
}
