'use client'

import { useState, useEffect, useMemo } from 'react'
import { UnitsFilterProvider, useUnitsFilter } from '@/contexts/UnitsFilterContext'
import UnitsFilterBar from '@/components/UnitsFilterBar'
import UnitsTable from '@/components/UnitsTable'
import GenericSearchBar from '@/components/GenericSearchBar'
import LoadingScreen from '@/components/LoadingScreen'

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

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 w-full items-center justify-center">
        <div className="text-base text-red-600 px-4 text-center">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Search Bar - Fixed */}
      <GenericSearchBar<Unit>
        apiEndpoint="/api/units"
        placeholder="Search by unit number or property name..."
        searchFields={(unit, term) =>
          unit.unitNumber.toLowerCase().includes(term) ||
          unit.property.name.toLowerCase().includes(term)
        }
        renderResult={(unit) => (
          <>
            <span className="font-medium text-gray-900">
              Unit {unit.unitNumber}
            </span>
            <span className="text-gray-500">
              {unit.property.name} • {unit.bedrooms || '?'} bed, {unit.bathrooms || '?'} bath
            </span>
          </>
        )}
        getResultLink={(unit) => `/units/${unit.id}`}
        getResultMeta={(unit) => unit.status}
        getItemId={(unit) => unit.id}
      />

      {/* Filter Bar - Fixed */}
      <UnitsFilterBar />

      {/* Results Count - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {filteredAndSortedUnits.length} {filteredAndSortedUnits.length === 1 ? 'unit' : 'units'}
        </p>
      </div>

      {/* Table with Fixed Headers - Scrollable Body */}
      <div className="flex-1 overflow-y-auto bg-white">
        <UnitsTable units={filteredAndSortedUnits} stickyHeader={true} />
      </div>
    </div>
  )
}

export default function UnitsPage() {
  return (
    <UnitsFilterProvider>
      <UnitsPageContent />
    </UnitsFilterProvider>
  )
}
