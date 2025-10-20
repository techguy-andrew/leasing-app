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
import { STATUS_OPTIONS, PROPERTY_OPTIONS } from '@/lib/constants'

/**
 * ApplicationForm Component
 *
 * A fully self-contained, reusable form component for creating and editing applications.
 * Supports both create and edit modes with inline editing, field validation, and toast notifications.
 *
 * @example
 * ```tsx
 * // Create mode
 * <ApplicationForm
 *   mode="create"
 *   onSave={(data) => createApplication(data)}
 *   onCancel={() => router.push('/')}
 * />
 *
 * // Edit mode
 * <ApplicationForm
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
}

interface ApplicationFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<FormData>
  applicationId?: number
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
  showDeleteButton?: boolean
}

const defaultFormData: FormData = {
  status: 'New',
  moveInDate: '',
  property: '',
  unitNumber: '',
  applicant: '',
  email: '',
  phone: '',
  createdAt: ''
}

export default function ApplicationForm({
  mode,
  initialData,
  applicationId,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = true
}: ApplicationFormProps) {
  const [isEditMode, setIsEditMode] = useState(mode === 'create')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>('success')

  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...initialData
  }))

  const [originalData, setOriginalData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...initialData
  }))

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

  // Status change handler
  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }))
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
      <div className="flex flex-col w-full flex-1 p-[3%] sm:p-[4%] md:p-[5%] lg:p-[6%] bg-white">
        <motion.div
          className="max-w-4xl mx-auto w-full p-[4%] sm:p-[5%] md:p-[6%] relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Action Buttons - Positioned in top right corner */}
          <div className="absolute top-[4%] right-[4%] sm:top-[5%] sm:right-[5%] md:top-[6%] md:right-[6%]">
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

          <div className="flex flex-col gap-[4%]">
            {/* Status Badge */}
            <div className="flex items-center gap-[2%]">
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Status:
              </span>
              <InlineStatusBadge
                status={formData.status}
                onChange={handleStatusChange}
                options={STATUS_OPTIONS}
              />
            </div>

            {/* Application Date Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Application Date
              </span>
              <InlineTextField
                value={formData.createdAt}
                onChange={handleCreatedAtChange}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
              />
            </div>

            {/* Applicant Name Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Applicant Name
              </span>
              <InlineTextField
                value={formData.applicant}
                onChange={(value) => handleFieldChange('applicant', value)}
                isEditMode={isEditMode}
                placeholder="Applicant Name"
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Email
              </span>
              <InlineTextField
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
                isEditMode={isEditMode}
                placeholder="Email"
              />
            </div>

            {/* Phone Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Phone
              </span>
              <InlineTextField
                value={formData.phone}
                onChange={handlePhoneChange}
                isEditMode={isEditMode}
                placeholder="Phone"
              />
            </div>

            {/* Property Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Property
              </span>
              <InlineSelectField
                value={formData.property}
                onChange={(value) => handleFieldChange('property', value)}
                options={PROPERTY_OPTIONS}
                isEditMode={isEditMode}
                placeholder="Property"
              />
            </div>

            {/* Unit Number Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Unit Number
              </span>
              <InlineTextField
                value={formData.unitNumber}
                onChange={(value) => handleFieldChange('unitNumber', value)}
                isEditMode={isEditMode}
                placeholder="Unit Number"
              />
            </div>

            {/* Move-in Date Field */}
            <div className="flex flex-col gap-[2%]">
              <span className="text-sm sm:text-base font-semibold text-gray-500">
                Move-in Date
              </span>
              <InlineTextField
                value={formData.moveInDate}
                onChange={handleDateChange}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
              />
            </div>
          </div>
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
