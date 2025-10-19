'use client'

import { useState, FormEvent } from 'react'
import TextField from '../Field/TextField'
import SelectField from '../Field/SelectField'
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
    phone: ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value)
    setFormData(prev => ({
      ...prev,
      moveInDate: formatted
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
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
        phone: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 border border-gray-300 rounded-lg p-6 md:p-8 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <TextField
            type="text"
            placeholder="Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <TextField
            type="text"
            placeholder="MM/DD/YYYY *"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleDateChange}
          />
          {validationErrors.moveInDate && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.moveInDate}</p>
          )}
        </div>

        <div>
          <SelectField
            name="property"
            value={formData.property}
            onChange={handleSelectChange}
            options={PROPERTY_OPTIONS}
            placeholder="Select Property *"
          />
          {validationErrors.property && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.property}</p>
          )}
        </div>

        <div>
          <TextField
            type="text"
            placeholder="Unit Number *"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
          />
          {validationErrors.unitNumber && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.unitNumber}</p>
          )}
        </div>

        <div>
          <TextField
            type="email"
            placeholder="Email (optional)"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <TextField
            type="text"
            placeholder="Phone (optional)"
            name="phone"
            value={formData.phone}
            onChange={handlePhoneChange}
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <SelectField
            name="status"
            value={formData.status}
            onChange={handleSelectChange}
            options={STATUS_OPTIONS}
            placeholder="Select Status (optional)"
          />
          {validationErrors.status && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.status}</p>
          )}
        </div>

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
