'use client'

import { useRouter } from 'next/navigation'
import PersonDetailForm from '@/components/PersonDetailForm'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
}

export default function NewPersonPage() {
  const router = useRouter()

  const handleSave = async (formData: FormData) => {
    const response = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create person')
    }

    // Redirect to the newly created person's detail page
    setTimeout(() => {
      router.push(`/people/${data.data.id}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/people')
  }

  return (
    <PersonDetailForm
      mode="create"
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
