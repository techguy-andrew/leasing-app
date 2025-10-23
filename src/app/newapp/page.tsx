'use client'

import { useRouter } from 'next/navigation'
import ApplicationForm from '@/components/features/applications/ApplicationForm'
import { getDefaultTasks } from '@/lib/applicantDefaultTasks'

interface FormData {
  status: string[]
  moveInDate: string
  property: string
  unitNumber: string
  applicant: string
  email: string
  phone: string
  createdAt: string
  deposit: string
  rent: string
  petFee: string
  rentersInsurance: string
  adminFee: string
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

    // Map 'applicant' to 'name' for the API and include default tasks
    const payload = {
      name: formData.applicant,
      status: formData.status,
      moveInDate: normalizeDate(formData.moveInDate),
      property: formData.property,
      unitNumber: formData.unitNumber,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      createdAt: normalizeDate(formData.createdAt),
      deposit: formData.deposit.trim() || null,
      rent: formData.rent.trim() || null,
      petFee: formData.petFee.trim() || null,
      rentersInsurance: formData.rentersInsurance.trim() || null,
      adminFee: formData.adminFee.trim() || null,
      tasks: getDefaultTasks() // Add default tasks to new applications
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
    <ApplicationForm
      mode="create"
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}
