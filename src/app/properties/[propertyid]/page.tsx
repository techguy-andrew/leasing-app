'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import PropertyDetailForm from '@/components/PropertyDetailForm'
import LoadingScreen from '@/components/LoadingScreen'
import { fadeIn } from '@/lib/animations/variants'

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

  return (
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
  )
}
