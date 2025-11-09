'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { UnitsFilterProvider, useUnitsFilter } from '@/contexts/UnitsFilterContext'
import UnitsFilterBar from '@/components/UnitsFilterBar'
import UnitsTable from '@/components/UnitsTable'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

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
  availableOn: Date | string | null
  property: Property
}

function UnitsPageContent() {
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    propertyFilter,
    bedroomsFilter,
    statusFilter,
    minPrice,
    maxPrice,
    availableByDate,
    sortField,
    sortDirection
  } = useUnitsFilter()

  useEffect(() => {
    async function fetchData() {
      try {
        const unitsResponse = await fetch('/api/units')
        const unitsData = await unitsResponse.json()

        if (!unitsResponse.ok) {
          throw new Error(unitsData.error || 'Failed to fetch units')
        }

        setUnits(unitsData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Parse price for sorting/filtering
  const parsePrice = (price: string | null): number => {
    if (!price) return 0
    return parseFloat(price.replace(/[^0-9.]/g, ''))
  }

  // Filter and sort units
  const filteredAndSortedUnits = useMemo(() => {
    let filtered = units

    // Property filter
    if (propertyFilter.length > 0 && !propertyFilter.includes('All')) {
      filtered = filtered.filter(unit => propertyFilter.includes(unit.property.name))
    }

    // Bedrooms filter
    if (bedroomsFilter.length > 0 && !bedroomsFilter.includes('All')) {
      filtered = filtered.filter(unit => {
        const bed = unit.bedrooms
        if (bed === null) return bedroomsFilter.includes('-')
        if (bed >= 4) return bedroomsFilter.includes('4+')
        return bedroomsFilter.includes(bed.toString())
      })
    }

    // Status filter
    if (statusFilter.length > 0 && !statusFilter.includes('All')) {
      filtered = filtered.filter(unit => statusFilter.includes(unit.status))
    }

    // Price range filter
    if (minPrice) {
      const min = parseFloat(minPrice)
      filtered = filtered.filter(unit => parsePrice(unit.baseRent) >= min)
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      filtered = filtered.filter(unit => parsePrice(unit.baseRent) <= max)
    }

    // Available by date filter
    if (availableByDate) {
      const filterDate = new Date(availableByDate)
      filtered = filtered.filter(unit => {
        if (!unit.availableOn) return false
        return new Date(unit.availableOn) <= filterDate
      })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'unitNumber':
          comparison = a.unitNumber.localeCompare(b.unitNumber)
          break
        case 'bedrooms':
          comparison = (a.bedrooms ?? 0) - (b.bedrooms ?? 0)
          break
        case 'price':
          comparison = parsePrice(a.baseRent) - parsePrice(b.baseRent)
          break
        case 'property':
          comparison = a.property.name.localeCompare(b.property.name)
          break
        case 'availableOn':
          const dateA = a.availableOn ? new Date(a.availableOn).getTime() : 0
          const dateB = b.availableOn ? new Date(b.availableOn).getTime() : 0
          comparison = dateA - dateB
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [units, propertyFilter, bedroomsFilter, statusFilter, minPrice, maxPrice, availableByDate, sortField, sortDirection])

  const handleNewUnit = () => {
    router.push('/units/new')
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
    <>
      {/* Filter Bar */}
      <UnitsFilterBar />

      {/* Page Content */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col flex-1 w-full"
      >
        {/* Header with Add Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Units</h1>
            <p className="text-sm text-gray-600 mt-1">Manage rental units across all properties</p>
          </div>
          <button
            onClick={handleNewUnit}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            + Add Unit
          </button>
        </div>

        {/* Units Table */}
        <UnitsTable units={filteredAndSortedUnits} />
      </motion.div>
    </>
  )
}

export default function UnitsPage() {
  return (
    <UnitsFilterProvider>
      <UnitsPageContent />
    </UnitsFilterProvider>
  )
}
