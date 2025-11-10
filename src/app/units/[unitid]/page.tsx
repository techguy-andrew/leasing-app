'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import UnitDetailForm from '@/components/UnitDetailForm'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

interface Property {
  id: number
  name: string
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

  return (
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
  )
}
