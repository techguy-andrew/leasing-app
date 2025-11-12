'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import UnitDetailForm from '@/components/UnitDetailForm'
import LoadingScreen from '@/components/LoadingScreen'

interface Property {
  id: number
  name: string
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

export default function NewUnitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialPropertyId, setInitialPropertyId] = useState<number>(0)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch properties')
        }

        setProperties(data.data)

        // Check if there's a propertyId query parameter
        const propertyIdParam = searchParams.get('propertyId')
        if (propertyIdParam) {
          const propertyId = parseInt(propertyIdParam, 10)
          if (!isNaN(propertyId)) {
            setInitialPropertyId(propertyId)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [searchParams])

  const handleSave = async (formData: FormData) => {
    // Convert empty strings to null for API (matching application creation pattern)
    const payload = {
      propertyId: formData.propertyId,
      unitNumber: formData.unitNumber,
      street: formData.street.trim() || null,
      city: formData.city.trim() || null,
      state: formData.state.trim() || null,
      zip: formData.zip.trim() || null,
      bedrooms: formData.bedrooms === '' ? null : Number(formData.bedrooms),
      bathrooms: formData.bathrooms === '' ? null : Number(formData.bathrooms),
      squareFeet: formData.squareFeet === '' ? null : Number(formData.squareFeet),
      floor: formData.floor === '' ? null : Number(formData.floor),
      baseRent: formData.baseRent.trim() || null,
      status: formData.status,
      availableOn: formData.availableOn.trim() || null
    }

    const response = await fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create unit')
    }

    // Redirect to the newly created unit's detail page
    setTimeout(() => {
      router.push(`/units/${data.data.id}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/units')
  }

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
    <UnitDetailForm
      mode="create"
      initialData={initialPropertyId > 0 ? { propertyId: initialPropertyId } : undefined}
      properties={properties}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
