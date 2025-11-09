'use client'

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

export default function PeopleList({ people }: PeopleListProps) {
  return (
    <div className="flex flex-col w-full bg-white">
      <div className="p-4 sm:p-6 md:p-8">
        {/* People List */}
        {people.length === 0 ? (
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
            Try adjusting your filters or add your first person.
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
            {people.map((person) => (
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
    </div>
  )
}
