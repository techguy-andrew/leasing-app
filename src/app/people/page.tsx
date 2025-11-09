'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PeopleList from '@/components/PeopleList'
import LoadingScreen from '@/components/LoadingScreen'
import GenericSearchBar from '@/components/GenericSearchBar'
import PeopleFilterBar from '@/components/PeopleFilterBar'
import { PeopleFilterProvider, usePeopleFilter } from '@/contexts/PeopleFilterContext'
import { fadeIn } from '@/lib/animations/variants'

interface Person {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

function PeoplePageContent() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    statusFilter,
    setStatusFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection
  } = usePeopleFilter()

  useEffect(() => {
    async function fetchPeople() {
      try {
        const response = await fetch('/api/people')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch people')
        }

        setPeople(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPeople()
  }, [])

  const handleNewPerson = () => {
    router.push('/people/new')
  }

  // Get unique statuses for filter options
  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(people.map(p => p.status)))
    return uniqueStatuses.sort()
  }, [people])

  // Apply filters and sorting
  const filteredPeople = useMemo(() => {
    let filtered = [...people]

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(p => statusFilter.includes(p.status))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`
        const nameB = `${b.firstName} ${b.lastName}`
        comparison = nameA.localeCompare(nameB)
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status)
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [people, statusFilter, sortField, sortDirection])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col flex-1 w-full items-center justify-center"
      >
        <div className="text-base text-red-600 px-4 text-center">
          Error: {error}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="flex flex-col flex-1 w-full"
    >
      {/* Search Bar */}
      <GenericSearchBar<Person>
        apiEndpoint="/api/people"
        placeholder="Search by name, email, or phone..."
        searchFields={(person, term) =>
          `${person.firstName} ${person.lastName}`.toLowerCase().includes(term) ||
          person.email?.toLowerCase().includes(term) ||
          person.phone?.toLowerCase().includes(term) ||
          false
        }
        renderResult={(person) => (
          <>
            <span className="font-medium text-gray-900">
              {person.firstName} {person.lastName}
            </span>
            <span className="text-gray-500">
              {person.email || person.phone || 'No contact info'}
            </span>
          </>
        )}
        getResultLink={(person) => `/people/${person.id}`}
        getResultMeta={(person) => person.status}
        getItemId={(person) => person.id}
      />

      {/* Filter Bar */}
      <PeopleFilterBar
        statuses={statuses}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      {/* Header with Add Button */}
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}
          </p>
        </div>
        <button
          onClick={handleNewPerson}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Add Person
        </button>
      </div>

      {/* People List */}
      <PeopleList people={filteredPeople} />
    </motion.div>
  )
}

export default function PeoplePage() {
  return (
    <PeopleFilterProvider>
      <PeoplePageContent />
    </PeopleFilterProvider>
  )
}
