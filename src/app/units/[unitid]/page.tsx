'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import UnitDetailForm from '@/components/UnitDetailForm'
import ApplicationListItem from '@/components/ApplicationListItem'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn, listStagger, staggerItem } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
}

interface Application {
  id: number
  name: string
  status: string[]
  moveInDate: string | null
  createdAt: string
}

interface Unit {
  id: number
  propertyId: number
  unitNumber: string
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  bedrooms: number | null
  bathrooms: number | null
  squareFeet: number | null
  floor: number | null
  baseRent: string | null
  status: string
  availableOn: Date | string | null
  property: Property
  applications?: Application[]
}

interface FormData {
  propertyId: number
  unitNumber: string
  street: string
  city: string
  state: string
  zip: string
  bedrooms: string
  bathrooms: string
  squareFeet: string
  floor: string
  baseRent: string
  status: string
  availableOn: string
}

interface PageProps {
  params: Promise<{ unitid: string }>
}

export default function UnitDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unitId, setUnitId] = useState<number | null>(null)

  useEffect(() => {
    async function loadUnit() {
      try {
        const { unitid } = await params
        const id = parseInt(unitid, 10)

        if (isNaN(id)) {
          setError('Invalid unit ID')
          setIsLoading(false)
          return
        }

        setUnitId(id)

        // Fetch unit and properties in parallel
        const [unitResponse, propertiesResponse] = await Promise.all([
          fetch(`/api/units/${id}`),
          fetch('/api/properties')
        ])

        const unitData = await unitResponse.json()
        const propertiesData = await propertiesResponse.json()

        if (!unitResponse.ok) {
          throw new Error(unitData.error || 'Failed to fetch unit')
        }

        if (!propertiesResponse.ok) {
          throw new Error(propertiesData.error || 'Failed to fetch properties')
        }

        setUnit(unitData.data)
        setProperties(propertiesData.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    loadUnit()
  }, [params])

  const handleSave = async (formData: FormData) => {
    if (!unitId) throw new Error('No unit ID')

    // Convert string values to proper types for API
    const payload = {
      propertyId: formData.propertyId,
      unitNumber: formData.unitNumber,
      bedrooms: formData.bedrooms === '' ? '' : Number(formData.bedrooms),
      bathrooms: formData.bathrooms === '' ? '' : Number(formData.bathrooms),
      squareFeet: formData.squareFeet === '' ? '' : Number(formData.squareFeet),
      floor: formData.floor === '' ? '' : Number(formData.floor),
      baseRent: formData.baseRent,
      status: formData.status,
      availableOn: formData.availableOn
    }

    const response = await fetch(`/api/units/${unitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update unit')
    }

    setUnit(data.data)
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/units/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete unit')
    }

    router.push('/units')
  }

  const handleCancel = () => {
    // Cancel is handled within UnitDetailForm for edit mode
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error && !unit) {
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

  if (!unit || !unitId) return null

  // Format availableOn date for input
  const formatDateForInput = (date: Date | string | null): string => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  const applications = unit.applications || []

  return (
    <div className="flex flex-col flex-1 w-full">
      <UnitDetailForm
        mode="edit"
        initialData={{
          propertyId: unit.propertyId,
          unitNumber: unit.unitNumber,
          bedrooms: unit.bedrooms?.toString() || '',
          bathrooms: unit.bathrooms?.toString() || '',
          squareFeet: unit.squareFeet?.toString() || '',
          floor: unit.floor?.toString() || '',
          baseRent: unit.baseRent || '',
          status: unit.status,
          availableOn: formatDateForInput(unit.availableOn)
        }}
        unitId={unitId}
        properties={properties}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={handleDelete}
        showDeleteButton={true}
      />

      {/* Applications Section */}
      <div className="flex flex-col w-full bg-white border-t border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Applications</h2>
            <p className="text-sm text-gray-600 mt-1">
              {applications.length} {applications.length === 1 ? 'application' : 'applications'} for this unit
            </p>
          </div>
          <button
            onClick={() => router.push(`/newapp?unitId=${unitId}`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            + Add Application
          </button>
        </div>

        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center border-2 border-dashed border-gray-300 rounded-lg"
          >
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-sm sm:text-base text-gray-500 max-w-md mb-4">
              Get started by adding the first application for this unit.
            </p>
            <button
              onClick={() => router.push(`/newapp?unitId=${unitId}`)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              + Add First Application
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
              {applications.map((application) => (
                <motion.div
                  key={application.id}
                  variants={staggerItem}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ApplicationListItem
                    id={application.id}
                    applicant={application.name}
                    status={application.status}
                    moveInDate={application.moveInDate}
                    createdAt={application.createdAt}
                    showPropertyUnit={false}
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
