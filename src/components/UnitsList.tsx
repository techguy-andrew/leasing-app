'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import UnitListItem from '@/components/UnitListItem'
import { listStagger, staggerItem } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
}

interface Unit {
  id: number
  unitNumber: string
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  baseRent: string | null
  status: string
  property: Property
}

interface UnitsListProps {
  units: Unit[]
}

type SortOrder = 'asc' | 'desc'
type StatusFilter = 'All' | 'Vacant' | 'Occupied' | 'Under Maintenance' | 'Reserved'

export default function UnitsList({ units }: UnitsListProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    // First filter by status
    let filtered = units
    if (statusFilter !== 'All') {
      filtered = units.filter(unit => unit.status === statusFilter)
    }

    // Then sort by property name, then unit number
    return [...filtered].sort((a, b) => {
      const propertyA = a.property.name.toLowerCase()
      const propertyB = b.property.name.toLowerCase()

      // First sort by property
      const propertyCompare = propertyA.localeCompare(propertyB)
      if (propertyCompare !== 0) {
        return sortOrder === 'asc' ? propertyCompare : -propertyCompare
      }

      // Then by unit number
      const unitA = a.unitNumber.toLowerCase()
      const unitB = b.unitNumber.toLowerCase()

      if (sortOrder === 'asc') {
        return unitA.localeCompare(unitB)
      } else {
        return unitB.localeCompare(unitA)
      }
    })
  }, [units, sortOrder, statusFilter])

  const statusOptions: StatusFilter[] = ['All', 'Vacant', 'Occupied', 'Under Maintenance', 'Reserved']

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
          {filteredAndSortedUnits.length} {filteredAndSortedUnits.length === 1 ? 'unit' : 'units'}
        </div>
      </div>

      {/* Units List */}
      {filteredAndSortedUnits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center"
        >
          <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No units found</h3>
          <p className="text-sm sm:text-base text-gray-500 max-w-md">
            {statusFilter !== 'All'
              ? `No units with status "${statusFilter}"`
              : 'Get started by adding your first unit.'}
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
            {filteredAndSortedUnits.map((unit) => (
              <motion.div
                key={unit.id}
                variants={staggerItem}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <UnitListItem
                  id={unit.id}
                  propertyName={unit.property.name}
                  unitNumber={unit.unitNumber}
                  bedrooms={unit.bedrooms}
                  bathrooms={unit.bathrooms}
                  squareFeet={unit.squareFeet}
                  baseRent={unit.baseRent}
                  status={unit.status}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
