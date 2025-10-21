'use client'

import { useRouter } from 'next/navigation'
import PropertyDetailForm from '@/components/features/properties/PropertyDetailForm'

interface FormData {
  name: string
  address: string
  energyProvider: string
}

export default function NewPropertyPage() {
  const router = useRouter()

  const handleSave = async (formData: FormData) => {
    const response = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create property')
    }

    // Redirect to the newly created property's detail page
    setTimeout(() => {
      router.push(`/properties/${data.data.id}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/properties')
  }

  return (
    <PropertyDetailForm
      mode="create"
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
