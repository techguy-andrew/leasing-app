'use client'

import { useState, FormEvent } from 'react'
import MinimalTextField from '../Field/MinimalTextField'
import MinimalSelectField from '../Field/MinimalSelectField'
import Submit from '../Buttons/Submit/Submit'
import { STATUS_OPTIONS, PROPERTY_OPTIONS } from '@/lib/constants'
import { applicationCreateSchema } from '@/lib/validations/application'

interface FormData {
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  name: string
  email: string
  phone: string
  createdAt: string
}

interface ValidationErrors {
  [key: string]: string
}

export default function FormV2() {
  const [formData, setFormData] = useState<FormData>({
    status: '',
    moveInDate: '',
    property: '',
    unitNumber: '',
    name: '',
    email: '',
    phone: '',
    createdAt: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const formatDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')

    // Add slashes at appropriate positions
    if (digits.length <= 2) {
      return digits
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
    }
  }

  const formatPhone = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')

    // Add dashes at appropriate positions
    if (digits.length <= 3) {
      return digits
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  }

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({
      ...prev,
      moveInDate: formatted
    }))
  }

  const handleCreatedAtChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({
      ...prev,
      createdAt: formatted
    }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setValidationErrors({})

    // Validate form data with Zod before submitting
    const validationResult = applicationCreateSchema.safeParse(formData)

    if (!validationResult.success) {
      const errors: ValidationErrors = {}
      validationResult.error.errors.forEach(err => {
        const field = err.path[0] as string
        errors[field] = err.message
      })
      setValidationErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSuccess(true)

      // Reset form after successful submission
      setFormData({
        status: '',
        moveInDate: '',
        property: '',
        unitNumber: '',
        name: '',
        email: '',
        phone: '',
        createdAt: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <MinimalTextField
          placeholder="Name *"
          value={formData.name}
          onChange={(value) => handleFieldChange('name', value)}
          error={validationErrors.name}
        />

        <MinimalTextField
          placeholder="Application Date (MM/DD/YYYY) *"
          value={formData.createdAt}
          onChange={handleCreatedAtChange}
          error={validationErrors.createdAt}
        />

        <MinimalTextField
          placeholder="Move-in Date (MM/DD/YYYY) *"
          value={formData.moveInDate}
          onChange={handleDateChange}
          error={validationErrors.moveInDate}
        />

        <MinimalSelectField
          name="property"
          value={formData.property}
          onChange={handleSelectChange}
          options={PROPERTY_OPTIONS}
          placeholder="Select Property *"
          error={validationErrors.property}
        />

        <MinimalTextField
          placeholder="Unit Number *"
          value={formData.unitNumber}
          onChange={(value) => handleFieldChange('unitNumber', value)}
          error={validationErrors.unitNumber}
        />

        <MinimalTextField
          placeholder="Email (optional)"
          value={formData.email}
          onChange={(value) => handleFieldChange('email', value)}
          error={validationErrors.email}
        />

        <MinimalTextField
          placeholder="Phone (optional)"
          value={formData.phone}
          onChange={handlePhoneChange}
          error={validationErrors.phone}
        />

        <MinimalSelectField
          name="status"
          value={formData.status}
          onChange={handleSelectChange}
          options={STATUS_OPTIONS}
          placeholder="Select Status (optional)"
          error={validationErrors.status}
        />

        <Submit />
      </form>

      {isLoading && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
          Submitting application...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg">
          Error: {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          Application submitted successfully!
        </div>
      )}
    </div>
  )
}
