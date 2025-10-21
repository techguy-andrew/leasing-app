'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PropertiesList from '@/components/features/properties/PropertiesList'
import LoadingScreen from '@/components/shared/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
  street: string
  city: string
  state: string
  zip: string
  energyProvider: string
  createdAt: Date
  updatedAt: Date
}

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch properties')
        }

        setProperties(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [])

  const handleNewProperty = () => {
    router.push('/properties/new')
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
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your property portfolio</p>
        </div>
        <button
          onClick={handleNewProperty}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Add Property
        </button>
      </div>

      {/* Properties List */}
      <PropertiesList properties={properties} />
    </motion.div>
  )
}
