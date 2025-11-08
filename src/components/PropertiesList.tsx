'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import PropertyListItem from '@/components/PropertyListItem'
import { listStagger, staggerItem } from '@/lib/animations/variants'

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

interface PropertiesListProps {
  properties: Property[]
}

type SortOrder = 'asc' | 'desc'

export default function PropertiesList({ properties }: PropertiesListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  // Sort properties alphabetically
  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      const nameA = a.name.toLowerCase()
      const nameB = b.name.toLowerCase()

      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB)
      } else {
        return nameB.localeCompare(nameA)
      }
    })
  }, [properties, sortOrder])

  return (
    <div className="flex flex-col w-full bg-white p-4 sm:p-6 md:p-8">
      {/* Filter Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b border-gray-200 bg-gray-50 rounded-lg mb-4">
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
        <div className="text-xs sm:text-sm text-gray-600">
          {sortedProperties.length} {sortedProperties.length === 1 ? 'property' : 'properties'}
        </div>
      </div>

      {/* Properties List */}
      {sortedProperties.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
        >
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            Get started by adding your first property.
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
            {sortedProperties.map((property) => (
              <motion.div
                key={property.id}
                variants={staggerItem}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PropertyListItem
                  id={property.id}
                  name={property.name}
                  street={property.street}
                  city={property.city}
                  state={property.state}
                  zip={property.zip}
                  energyProvider={property.energyProvider}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
