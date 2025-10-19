'use client'

import { useState, FormEvent } from 'react'
import TextField from '../Field/TextField'
import SelectField from '../Field/SelectField'
import Submit from '../Buttons/Submit/Submit'

interface FormData {
  status: string
  moveInDate: string
  property: string
  unitNumber: string
  name: string
  email: string
  phone: string
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' }
]

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    <div className="flex flex-col gap-6 border border-gray-300 rounded-lg p-8 w-[80vw]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectField
          name="status"
          value={formData.status}
          onChange={handleSelectChange}
          options={statusOptions}
          placeholder="Select Status"
        />
        <TextField
          type="date"
          placeholder="Move-In Date"
          name="moveInDate"
          value={formData.moveInDate}
          onChange={handleChange}
        />
        <TextField
          type="text"
          placeholder="Property"
          name="property"
          value={formData.property}
          onChange={handleChange}
        />
        <TextField
          type="text"
          placeholder="Unit Number"
          name="unitNumber"
          value={formData.unitNumber}
          onChange={handleChange}
        />
        <TextField
          type="text"
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          type="tel"
          placeholder="555-123-4567"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
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
