'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import PropertyDetailForm from '@/components/PropertyDetailForm'
import UnitListItem from '@/components/UnitListItem'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn, listStagger, staggerItem } from '@/lib/animations/variants'

interface Unit {
  id: number
  unitNumber: string
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  baseRent: string | null
  status: string
}

interface Property {
  id: number
  name: string
  street: string
  city: string
  state: string
  zip: string
  energyProvider: string
  createdAt: string
  updatedAt: string
  units?: Unit[]
}

interface FormData {
  name: string
  street: string
  city: string
  state: string
  zip: string
  energyProvider: string
}

interface PageProps {
  params: Promise<{ propertyid: string }>
}

export default function PropertyDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<number | null>(null)

  useEffect(() => {
    async function loadProperty() {
      try {
        const { propertyid } = await params
        const id = parseInt(propertyid, 10)

        if (isNaN(id)) {
          setError('Invalid property ID')
          setIsLoading(false)
          return
        }

        setPropertyId(id)

        const response = await fetch(`/api/properties/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch property')
        }

        setProperty(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadProperty()
  }, [params])

  const handleSave = async (formData: FormData) => {
    if (!propertyId) throw new Error('No property ID')

    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update property')
    }

    setProperty(data.data)
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/properties/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete property')
    }

    router.push('/properties')
  }

  const handleCancel = () => {
    // Cancel is handled within PropertyDetailForm for edit mode
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error && !property) {
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

  if (!property || !propertyId) return null

  const units = property.units || []

  return (
    <div className="flex flex-col flex-1 w-full">
      <PropertyDetailForm
        mode="edit"
        initialData={{
          name: property.name,
          street: property.street,
          city: property.city,
          state: property.state,
          zip: property.zip,
          energyProvider: property.energyProvider
        }}
        propertyId={propertyId}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        showDeleteButton={true}
      />

      {/* Units Section */}
      <div className="flex flex-col w-full bg-white border-t border-gray-200 p-4 sm:p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Units</h2>
              <p className="text-sm text-gray-600 mt-1">
                {units.length} {units.length === 1 ? 'unit' : 'units'} in this property
              </p>
            </div>
            <button
              onClick={() => router.push(`/units/new?propertyId=${propertyId}`)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              + Add Unit
            </button>
          </div>

          {units.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center border-2 border-dashed border-gray-300 rounded-lg"
            >
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No units yet</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md mb-4">
                Get started by adding your first unit to this property.
              </p>
              <button
                onClick={() => router.push(`/units/new?propertyId=${propertyId}`)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                + Add First Unit
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={listStagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col border border-gray-200 rounded-lg overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                {units.map((unit) => (
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
                      propertyName={property.name}
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
    </div>
  )
}
