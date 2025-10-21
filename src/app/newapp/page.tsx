'use client'

import { useRouter } from 'next/navigation'
import NavBar from '@/components/shared/navigation/NavBar'
import ApplicationForm from '@/components/features/applications/ApplicationForm'

interface FormData {
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string
  phone: string
  createdAt: string
}

export default function NewApplicationPage() {
  const router = useRouter()

  const handleSave = async (formData: FormData) => {
    // Normalize date to ensure MM/DD/YYYY format with leading zeros
    const normalizeDate = (dateStr: string): string => {
      const digits = dateStr.replace(/\D/g, '')
      if (digits.length === 8) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
      }
      const parts = dateStr.split('/')
      if (parts.length === 3) {
        const [month, day, year] = parts
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year.padStart(4, '0')}`
      }
      return dateStr
    }

    // Map 'applicant' to 'name' for the API
    const payload = {
      name: formData.applicant,
      status: formData.status,
      moveInDate: normalizeDate(formData.moveInDate),
      property: formData.property,
      unitNumber: formData.unitNumber,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      createdAt: normalizeDate(formData.createdAt)
    }

    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create application')
    }

    // Redirect to the newly created application's detail page
    setTimeout(() => {
      router.push(`/applications/${data.data.id}`)
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <>
      <NavBar />
      <ApplicationForm
        mode="create"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  )
}
