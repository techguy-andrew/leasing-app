'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

interface UnitPropertyCardProps {
  propertyName: string
  propertyId: number
  unitNumber: string
  unitId: number
  address?: string
}

/**
 * UnitPropertyCard Component
 *
 * Displays unit and property information with navigation links.
 * Used on application detail pages to show related unit/property context.
 */
export default function UnitPropertyCard({
  propertyName,
  propertyId,
  unitNumber,
  unitId,
  address
}: UnitPropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Property & Unit Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {propertyName} - {unitNumber}
          </h3>
          {address && (
            <p className="text-sm text-gray-600 mb-3">
              {address}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/units/${unitId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              View Unit
            </Link>
            <Link
              href={`/properties/${propertyId}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              View Property
            </Link>
          </div>
        </div>

        {/* Visual Icon */}
        <div className="hidden md:flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}
