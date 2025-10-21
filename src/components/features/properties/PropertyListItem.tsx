'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'

interface PropertyListItemProps {
  id: number
  name: string
  address: string
  energyProvider: string
}

const PropertyListItem = memo(function PropertyListItem({ id, name, address, energyProvider }: PropertyListItemProps) {
  return (
    <Link
      href={`/properties/${id}`}
      className="flex items-center justify-between w-full px-6 md:px-8 py-5 sm:py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="font-semibold text-base text-gray-900 truncate">
              {name}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-base text-gray-600">
            <span className="truncate font-medium">{address}</span>
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <span className="text-gray-500">Energy: {energyProvider}</span>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        className="flex items-center gap-3 text-base text-gray-500 ml-4"
        whileHover={{ x: 3 }}
        transition={{ duration: 0.15 }}
      >
        <span className="hidden sm:inline">View Details</span>
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </Link>
  )
})

export default PropertyListItem
