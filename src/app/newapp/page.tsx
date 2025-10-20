'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import MinimalInlineTextField from '@/components/Field/MinimalInlineTextField'
import InlineSelectField from '@/components/Field/InlineSelectField'
import InlineStatusBadge from '@/components/Badges/InlineStatusBadge'
import Save from '@/components/Buttons/Save/Save'
import Cancel from '@/components/Buttons/Cancel/Cancel'
import Toast, { ToastType } from '@/components/Toast/Toast'
import { STATUS_OPTIONS, PROPERTY_OPTIONS } from '@/lib/constants'

export default function NewApplicationPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')

  const [formData, setFormData] = useState({
    status: 'New',
    moveInDate: '',
    property: '',
    unitNumber: '',
    applicant: '',
    email: '',
    phone: '',
    createdAt: ''
  })

  const formatDate = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDateChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({ ...prev, moveInDate: formatted }))
  }

  const handleCreatedAtChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({ ...prev, createdAt: formatted }))
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
  }

  const handleCancel = () => {
    router.push('/')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setToastMessage(null)

    try {
      // Normalize date to ensure MM/DD/YYYY format with leading zeros
      const normalizeDate = (dateStr: string): string => {
        const digits = dateStr.replace(/\D/g, '')
        if (digits.length === 8) {
          return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
        }
        // If not 8 digits, try to parse and reformat
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          const [month, day, year] = parts
          return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year.padStart(4, '0')}`
        }
        return dateStr
      }

      // Convert empty strings to null for email and phone
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

      // Show success message
      setToastType('success')
      setToastMessage('Application created successfully!')

      // Redirect to the newly created application's detail page
      setTimeout(() => {
        router.push(`/applications/${data.data.id}`)
      }, 1000)
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Applications', href: '/applications' },
          { label: 'New Application', href: '/newapp' }
        ]}
      />
      <div className="flex flex-col w-full flex-1 p-[3%] sm:p-[4%] md:p-[5%] lg:p-[6%] bg-white">
        <motion.div
          className="max-w-4xl mx-auto w-full p-[4%] sm:p-[5%] md:p-[6%] relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Action Buttons - Positioned in top right corner */}
          <div className="absolute top-[4%] right-[4%] sm:top-[5%] sm:right-[5%] md:top-[6%] md:right-[6%]">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Cancel onClick={handleCancel} />
              <Save onClick={handleSave} disabled={isSaving} />
            </motion.div>
          </div>

          <div className="flex flex-col gap-[4%]">
              {/* Status Badge */}
              <div className="flex items-center gap-[2%]">
                <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Status:</span>
                <InlineStatusBadge
                  status={formData.status}
                  onChange={handleStatusChange}
                  options={STATUS_OPTIONS}
                />
              </div>

              {/* Application Date Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Application Date</span>
                <MinimalInlineTextField
                  value={formData.createdAt}
                  onChange={handleCreatedAtChange}
                  isEditMode={true}
                  placeholder="MM/DD/YYYY"
                />
              </div>

              {/* Applicant Name Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Applicant Name</span>
                <MinimalInlineTextField
                  value={formData.applicant}
                  onChange={(value) => handleFieldChange('applicant', value)}
                  isEditMode={true}
                  placeholder="Applicant Name"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Email</span>
                <MinimalInlineTextField
                  value={formData.email}
                  onChange={(value) => handleFieldChange('email', value)}
                  isEditMode={true}
                  placeholder="Email"
                />
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Phone</span>
                <MinimalInlineTextField
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  isEditMode={true}
                  placeholder="Phone"
                />
              </div>

              {/* Property Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Property</span>
                <InlineSelectField
                  value={formData.property}
                  onChange={(value) => handleFieldChange('property', value)}
                  options={PROPERTY_OPTIONS}
                  isEditMode={true}
                  placeholder="Property"
                />
              </div>

              {/* Unit Number Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Unit Number</span>
                <MinimalInlineTextField
                  value={formData.unitNumber}
                  onChange={(value) => handleFieldChange('unitNumber', value)}
                  isEditMode={true}
                  placeholder="Unit Number"
                />
              </div>

              {/* Move-in Date Field */}
              <div className="flex flex-col gap-[2%]">
                <span className="text-sm sm:text-base font-semibold text-gray-500">Move-in Date</span>
                <MinimalInlineTextField
                  value={formData.moveInDate}
                  onChange={handleDateChange}
                  isEditMode={true}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>
        </motion.div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </>
  )
}
