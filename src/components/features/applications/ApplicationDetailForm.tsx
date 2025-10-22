'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import InlineTextField from '@/components/shared/fields/InlineTextField'
import InlineSelectField from '@/components/shared/fields/InlineSelectField'
import InlineStatusBadge from '@/components/shared/fields/InlineStatusBadge'
import EditMenuButton from '@/components/shared/buttons/EditMenuButton'
import SaveButton from '@/components/shared/buttons/SaveButton'
import CancelButton from '@/components/shared/buttons/CancelButton'
import ConfirmModal from '@/components/shared/modals/ConfirmModal'
import Toast, { ToastType } from '@/components/shared/feedback/Toast'
import TasksList from './TasksList'
import { STATUS_OPTIONS } from '@/lib/constants'
import { pageTransition, formFieldStagger, formFieldItem } from '@/lib/animations/variants'

/**
 * ApplicationDetailForm Component
 *
 * A fully self-contained, reusable form component for creating and editing applications.
 * Supports both create and edit modes with inline editing, field validation, and toast notifications.
 *
 * Required fields:
 * - Applicant Name
 * - Application Date (MM/DD/YYYY format)
 *
 * All other fields are optional and flexible, as they are subject to change.
 *
 * @example
 * ```tsx
 * // Create mode
 * <ApplicationDetailForm
 *   mode="create"
 *   onSave={(data) => createApplication(data)}
 *   onCancel={() => router.push('/')}
 * />
 *
 * // Edit mode
 * <ApplicationDetailForm
 *   mode="edit"
 *   initialData={applicationData}
 *   applicationId={123}
 *   onSave={(data) => updateApplication(data)}
 *   onCancel={() => setEditMode(false)}
 *   onDelete={(id) => deleteApplication(id)}
 * />
 * ```
 *
 * To adapt for new projects:
 * 1. Update the FormData interface to match your database schema
 * 2. Modify STATUS_OPTIONS and PROPERTY_OPTIONS in lib/constants.ts
 * 3. Adjust field labels and placeholders as needed
 * 4. Update formatDate and formatPhone functions for your locale
 * 5. Modify the API endpoints in onSave callbacks
 * 6. Add/remove fields by copying the field block pattern below
 */

interface FormData {
  status: string
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
  petRent: string
  proratedRent: string
  concession: string
  rentersInsurance: string
  adminFee: string
}

interface Task {
  id: string
  description: string
  completed: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface ApplicationDetailFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<FormData>
  initialTasks?: Task[]
  applicationId?: number
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
  showDeleteButton?: boolean
  onStatusChange?: (status: string) => Promise<void>
  onTasksChange?: (tasks: Task[]) => void
}

const defaultFormData: FormData = {
  status: 'New',
  moveInDate: '',
  property: '',
  unitNumber: '',
  applicant: '',
  email: '',
  phone: '',
  createdAt: '',
  deposit: '',
  rent: '',
  petFee: '',
  petRent: '',
  proratedRent: '',
  concession: '',
  rentersInsurance: '',
  adminFee: ''
}

export default function ApplicationDetailForm({
  mode,
  initialData,
  initialTasks = [],
  applicationId,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = true,
  onStatusChange,
  onTasksChange
}: ApplicationDetailFormProps) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')
  const [propertyOptions, setPropertyOptions] = useState<{ value: string; label: string }[]>([])

  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...initialData
  }))

  const [originalData, setOriginalData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...initialData
  }))

  // Fetch properties from database
  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties')
        const data = await response.json()

        if (response.ok && data.success) {
          const options = data.data.map((property: { name: string }) => ({
            value: property.name,
            label: property.name
          }))
          setPropertyOptions(options)
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error)
        // Fallback to empty array if fetch fails
        setPropertyOptions([])
      }
    }

    fetchProperties()
  }, [])

  // Update form when initialData changes (edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const newData = { ...defaultFormData, ...initialData }
      setFormData(newData)
      setOriginalData(newData)
    }
  }, [initialData, mode])

  // Format date as MM/DD/YYYY
  const formatDate = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length === 0) return ''
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }

  // Format phone as XXX-XXX-XXXX
  const formatPhone = (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }

  // Format currency with dollar sign and commas
  const formatCurrency = (value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, '')

    // Ensure only one decimal point
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts.length === 2) {
      parts[1] = parts[1].slice(0, 2)
    }

    return cleaned
  }

  // Generic field change handler
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Date field change with formatting
  const handleDateChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({ ...prev, moveInDate: formatted }))
  }

  // Created at date change with formatting
  const handleCreatedAtChange = (value: string) => {
    const formatted = formatDate(value)
    setFormData(prev => ({ ...prev, createdAt: formatted }))
  }

  // Phone field change with formatting
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  // Currency field change handlers
  const handleCurrencyChange = (field: keyof FormData, value: string) => {
    const formatted = formatCurrency(value)
    setFormData(prev => ({ ...prev, [field]: formatted }))
  }

  // Status change handler
  const handleStatusChange = async (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))

    // If in edit mode and onStatusChange callback is provided, update database immediately
    if (mode === 'edit' && onStatusChange) {
      setToastMessage(null)

      try {
        await onStatusChange(value)
        setOriginalData(prev => ({ ...prev, status: value }))
        setToastType('success')
        setToastMessage('Status updated successfully!')
      } catch (err) {
        // Revert status on error
        setFormData(prev => ({ ...prev, status: originalData.status }))
        setToastType('error')
        setToastMessage(err instanceof Error ? err.message : 'Failed to update status')
      }
    }
  }

  // Edit button handler (edit mode only)
  const handleEdit = () => {
    setIsEditMode(true)
    setToastMessage(null)
  }

  // Cancel button handler
  const handleCancel = () => {
    if (mode === 'create') {
      onCancel()
    } else {
      setFormData(originalData)
      setIsEditMode(false)
      setToastMessage(null)
    }
  }

  // Save button handler
  const handleSave = async () => {
    // Validate required fields: applicant name and application date
    if (!formData.applicant.trim()) {
      setToastType('error')
      setToastMessage('Applicant name is required')
      return
    }

    if (!formData.createdAt.trim()) {
      setToastType('error')
      setToastMessage('Application date is required')
      return
    }

    // Validate date format (MM/DD/YYYY)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    if (!dateRegex.test(formData.createdAt)) {
      setToastType('error')
      setToastMessage('Application date must be in MM/DD/YYYY format')
      return
    }

    setIsSaving(true)
    setToastMessage(null)

    try {
      await onSave(formData)

      if (mode === 'edit') {
        setOriginalData(formData)
        setIsEditMode(false)
        setToastType('success')
        setToastMessage('Application updated successfully!')
      } else {
        setToastType('success')
        setToastMessage('Application created successfully!')
      }
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete button handler (edit mode only)
  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    if (!onDelete || !applicationId) return

    setIsDeleting(true)

    try {
      await onDelete(applicationId)
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete application')
      setShowDeleteModal(false)
      setIsDeleting(false)
    }
  }

  // Delete cancellation handler
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }


  return (
    <>
      <div className="flex flex-col w-full flex-1 p-4 sm:p-6 md:p-8 bg-white">
        <motion.div
          className="max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8 relative"
          variants={pageTransition}
          initial="initial"
          animate="animate"
        >
          {/* Action Buttons - Positioned in top right corner */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8">
            <AnimatePresence mode="wait">
              {mode === 'edit' && !isEditMode ? (
                <motion.div
                  key="edit-menu"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EditMenuButton
                    onEdit={handleEdit}
                    onDelete={showDeleteButton ? handleDeleteClick : () => {}}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="save-cancel"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <CancelButton onClick={handleCancel} />
                  <SaveButton onClick={handleSave} disabled={isSaving} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className="flex flex-col gap-2"
            variants={formFieldStagger}
            initial="hidden"
            animate="visible"
          >
            {/* Status Badge */}
            <motion.div className="flex items-center gap-3" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Status:
              </span>
              <InlineStatusBadge
                status={formData.status}
                onChange={handleStatusChange}
                options={STATUS_OPTIONS}
              />
            </motion.div>

            {/* Property Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Property
              </span>
              <InlineSelectField
                value={formData.property}
                onChange={(value) => handleFieldChange('property', value)}
                options={propertyOptions}
                isEditMode={isEditMode}
                placeholder="Property"
              />
            </motion.div>

            {/* Unit Number Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Unit Number
              </span>
              <InlineTextField
                value={formData.unitNumber}
                onChange={(value) => handleFieldChange('unitNumber', value)}
                isEditMode={isEditMode}
                placeholder="Unit Number"
              />
            </motion.div>

            {/* Move-in Date Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Move-in Date
              </span>
              <InlineTextField
                value={formData.moveInDate}
                onChange={handleDateChange}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
              />
            </motion.div>

            {/* Application Date Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Application Date
              </span>
              <InlineTextField
                value={formData.createdAt}
                onChange={handleCreatedAtChange}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
              />
            </motion.div>

            {/* Applicant Name Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Applicant Name
              </span>
              <InlineTextField
                value={formData.applicant}
                onChange={(value) => handleFieldChange('applicant', value)}
                isEditMode={isEditMode}
                placeholder="Applicant Name"
              />
            </motion.div>

            {/* Email Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Email
              </span>
              <InlineTextField
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
                isEditMode={isEditMode}
                placeholder="Email"
              />
            </motion.div>

            {/* Phone Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Phone
              </span>
              <InlineTextField
                value={formData.phone}
                onChange={handlePhoneChange}
                isEditMode={isEditMode}
                placeholder="Phone"
              />
            </motion.div>

            {/* Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Rent
              </span>
              <InlineTextField
                value={formData.rent}
                onChange={(value) => handleCurrencyChange('rent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Deposit Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Deposit
              </span>
              <InlineTextField
                value={formData.deposit}
                onChange={(value) => handleCurrencyChange('deposit', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Pet Fee Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Pet Fee
              </span>
              <InlineTextField
                value={formData.petFee}
                onChange={(value) => handleCurrencyChange('petFee', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Pet Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Pet Rent
              </span>
              <InlineTextField
                value={formData.petRent}
                onChange={(value) => handleCurrencyChange('petRent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Prorated Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Prorated Rent
              </span>
              <InlineTextField
                value={formData.proratedRent}
                onChange={(value) => handleCurrencyChange('proratedRent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Concession Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Concession
              </span>
              <InlineTextField
                value={formData.concession}
                onChange={(value) => handleCurrencyChange('concession', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Insurance Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Insurance
              </span>
              <InlineTextField
                value={formData.rentersInsurance}
                onChange={(value) => handleCurrencyChange('rentersInsurance', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Admin Fee Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Admin Fee
              </span>
              <InlineTextField
                value={formData.adminFee}
                onChange={(value) => handleCurrencyChange('adminFee', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
              />
            </motion.div>

            {/* Tasks Section - Integrated as a field */}
            {applicationId && (
              <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
                <TasksList
                  applicationId={applicationId}
                  initialTasks={initialTasks}
                  onTasksChange={onTasksChange}
                />
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {mode === 'edit' && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Application"
          message="Are you sure you want to delete this application? This action cannot be undone."
          confirmText={isDeleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDestructive={true}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </>
  )
}
