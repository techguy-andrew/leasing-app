'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PeopleList from '@/components/PeopleList'
import LoadingScreen from '@/components/LoadingScreen'
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

export default function PeoplePage() {
  const router = useRouter()
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      {/* Header with Add Button */}
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People</h1>
          <p className="text-sm text-gray-600 mt-1">Manage contacts and track status transitions</p>
        </div>
        <button
          onClick={handleNewPerson}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Add Person
        </button>
      </div>

      {/* People List */}
      <PeopleList people={people} />
    </motion.div>
  )
}
