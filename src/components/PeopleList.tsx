'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PersonListItem from '@/components/PersonListItem'
import { listStagger, staggerItem } from '@/lib/animations/variants'

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

interface PeopleListProps {
  people: Person[]
}

type SortOrder = 'asc' | 'desc'
type StatusFilter = 'All' | 'Prospect' | 'Applicant' | 'Current Resident' | 'Past Resident'

export default function PeopleList({ people }: PeopleListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  // Filter and sort people
  const filteredAndSortedPeople = useMemo(() => {
    // First filter by status
    let filtered = people
    if (statusFilter !== 'All') {
      filtered = people.filter(person => person.status === statusFilter)
    }

    // Then sort alphabetically by last name
    return [...filtered].sort((a, b) => {
      const nameA = a.lastName.toLowerCase()
      const nameB = b.lastName.toLowerCase()

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB)
      } else {
        return nameB.localeCompare(nameA)
      }
    })
  }, [people, sortOrder, statusFilter])

  const statusOptions: StatusFilter[] = ['All', 'Prospect', 'Applicant', 'Current Resident', 'Past Resident']

  return (
    <div className="flex flex-col w-full bg-white p-4 sm:p-6 md:p-8">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 rounded-lg mb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Status:
            </span>
            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Sort:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                  sortOrder === 'asc'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                A → Z
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                  sortOrder === 'desc'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Z → A
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-gray-600">
          {filteredAndSortedPeople.length} {filteredAndSortedPeople.length === 1 ? 'person' : 'people'}
        </div>
      </div>

      {/* People List */}
      {filteredAndSortedPeople.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
        >
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No people found</h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            {statusFilter !== 'All'
              ? `No people with status "${statusFilter}"`
              : 'Get started by adding your first person.'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={listStagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedPeople.map((person) => (
              <motion.div
                key={person.id}
                variants={staggerItem}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PersonListItem
                  id={person.id}
                  firstName={person.firstName}
                  lastName={person.lastName}
                  email={person.email}
                  phone={person.phone}
                  status={person.status}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
