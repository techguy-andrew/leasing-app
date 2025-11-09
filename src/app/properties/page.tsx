'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PropertiesList from '@/components/PropertiesList'
import LoadingScreen from '@/components/LoadingScreen'
import GenericSearchBar from '@/components/GenericSearchBar'
import PropertiesFilterBar from '@/components/PropertiesFilterBar'
import { PropertiesFilterProvider, usePropertiesFilter } from '@/contexts/PropertiesFilterContext'
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

function PropertiesPageContent() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const {
    cityFilter,
    setCityFilter,
    stateFilter,
    setStateFilter,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection
  } = usePropertiesFilter()

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

  // Get unique cities and states for filter options
  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(properties.map(p => p.city)))
    return uniqueCities.sort()
  }, [properties])

  const states = useMemo(() => {
    const uniqueStates = Array.from(new Set(properties.map(p => p.state)))
    return uniqueStates.sort()
  }, [properties])

  // Apply filters and sorting
  const filteredProperties = useMemo(() => {
    let filtered = [...properties]

    // Apply city filter
    if (cityFilter.length > 0) {
      filtered = filtered.filter(p => cityFilter.includes(p.city))
    }

    // Apply state filter
    if (stateFilter.length > 0) {
      filtered = filtered.filter(p => stateFilter.includes(p.state))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'city') {
        comparison = a.city.localeCompare(b.city)
      } else if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [properties, cityFilter, stateFilter, sortField, sortDirection])

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
      {/* Search Bar */}
      <GenericSearchBar<Property>
        apiEndpoint="/api/properties"
        placeholder="Search by property name, address, or city..."
        searchFields={(property, term) =>
          property.name.toLowerCase().includes(term) ||
          property.street.toLowerCase().includes(term) ||
          property.city.toLowerCase().includes(term)
        }
        renderResult={(property) => (
          <>
            <span className="font-medium text-gray-900">{property.name}</span>
            <span className="text-gray-500">
              {property.street}, {property.city}, {property.state}
            </span>
          </>
        )}
        getResultLink={(property) => `/properties/${property.id}`}
        getItemId={(property) => property.id}
      />

      {/* Filter Bar */}
      <PropertiesFilterBar
        cities={cities}
        states={states}
        cityFilter={cityFilter}
        onCityChange={setCityFilter}
        stateFilter={stateFilter}
        onStateChange={setStateFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        sortDirection={sortDirection}
        onSortDirectionChange={setSortDirection}
      />

      {/* Header with Add Button */}
      <div className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <button
          onClick={handleNewProperty}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          + Add Property
        </button>
      </div>

      {/* Properties List */}
      <PropertiesList properties={filteredProperties} />
    </motion.div>
  )
}

export default function PropertiesPage() {
  return (
    <PropertiesFilterProvider>
      <PropertiesPageContent />
    </PropertiesFilterProvider>
  )
}
