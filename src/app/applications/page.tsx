'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFilter } from '@/contexts/FilterContext'
import ApplicationsList from '@/components/features/applications/ApplicationsList'

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

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const { statusFilter, setStatusFilter, sortDirection, calendarFilter } = useFilter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set status filter from URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status')
    if (statusParam) {
      setStatusFilter(statusParam)
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
  }, [statusFilter, sortDirection, calendarFilter])

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
    // First filter by status
    let filtered = statusFilter === 'All'
      ? applications.filter(app => app.status !== 'Archived') // Exclude archived from "All"
      : applications.filter(app => app.status === statusFilter)

    // Then apply calendar filter
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (calendarFilter === 'This Week') {
      const startOfWeek = getStartOfWeek()
      const endOfWeek = getEndOfWeek()
      startOfWeek.setHours(0, 0, 0, 0)
      endOfWeek.setHours(23, 59, 59, 999)

      filtered = filtered.filter(app => {
        const moveInDate = parseMoveInDate(app.moveInDate)
        return moveInDate >= startOfWeek && moveInDate <= endOfWeek
      })
    } else if (calendarFilter === 'This Month') {
      const startOfMonth = getStartOfMonth()
      const endOfMonth = getEndOfMonth()
      startOfMonth.setHours(0, 0, 0, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      filtered = filtered.filter(app => {
        const moveInDate = parseMoveInDate(app.moveInDate)
        return moveInDate >= startOfMonth && moveInDate <= endOfMonth
      })
    }

    // Sort by move-in date based on direction
    return [...filtered].sort((a, b) => {
      const dateA = parseMoveInDate(a.moveInDate)
      const dateB = parseMoveInDate(b.moveInDate)

      if (sortDirection === 'furthest') {
        return dateB.getTime() - dateA.getTime() // Furthest first (descending)
      } else {
        return dateA.getTime() - dateB.getTime() // Closest first (ascending)
      }
    })
  }, [applications, statusFilter, calendarFilter, sortDirection, parseMoveInDate, getStartOfWeek, getEndOfWeek, getStartOfMonth, getEndOfMonth])

  return (
    <div ref={scrollContainerRef} className="w-full h-full overflow-y-auto">
      <ApplicationsList
        applications={filteredApplications}
        isLoading={isLoading}
        statusFilter={statusFilter}
        calendarFilter={calendarFilter}
        sortDirection={sortDirection}
      />
    </div>
  )
}
