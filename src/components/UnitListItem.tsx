'use client'

import { memo } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import Pill from '@/components/Pill'

interface UnitListItemProps {
  id: number
  propertyName: string
  unitNumber: string
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  baseRent: string | null
  status: string
}

const UnitListItem = memo(function UnitListItem({
  id,
  propertyName,
  unitNumber,
  bedrooms,
  bathrooms,
  squareFeet,
  baseRent,
  status
}: UnitListItemProps) {
  const specs = []
  if (bedrooms !== null) specs.push(`${bedrooms} BR`)
  if (bathrooms !== null) specs.push(`${bathrooms} BA`)
  if (squareFeet !== null) specs.push(`${squareFeet.toLocaleString()} sqft`)

  const specsText = specs.length > 0 ? specs.join(' • ') : 'No specs'

  // Simple status color mapping
  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      'Vacant': '#10B981',        // Green
      'Occupied': '#3B82F6',      // Blue
      'Under Maintenance': '#F59E0B', // Orange
      'Reserved': '#8B5CF6'       // Purple
    }
    return statusMap[status] || '#6B7280' // Default gray
  }

  return (
    <Link
      href={`/units/${id}`}
      className="flex items-center justify-between w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="font-semibold text-sm sm:text-base text-gray-900 truncate">
              {propertyName} - Unit {unitNumber}
            </span>
            <Pill label={status} color={getStatusColor(status)} variant="default" />
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base text-gray-600">
            <span className="truncate font-medium">{specsText}</span>
            {baseRent && (
              <span className="text-gray-500 text-xs sm:text-sm">
                Base Rent: {baseRent}
              </span>
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-500 ml-3 sm:ml-4"
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

export default UnitListItem
