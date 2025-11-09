'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import InlineTextField from '@/components/InlineTextField'
import InlineSelectField from '@/components/InlineSelectField'
import EditMenuButton from '@/components/EditMenuButton'
import SaveButton from '@/components/SaveButton'
import CancelButton from '@/components/CancelButton'
import ConfirmModal from '@/components/ConfirmModal'
import Toast, { ToastType } from '@/components/Toast'
import { pageTransition, formFieldStagger, formFieldItem } from '@/lib/animations/variants'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
}

interface PersonDetailFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<FormData>
  personId?: number
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
  showDeleteButton?: boolean
}

const defaultFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  status: 'Prospect'
}

const STATUS_OPTIONS = [
  { value: 'Prospect', label: 'Prospect' },
  { value: 'Applicant', label: 'Applicant' },
  { value: 'Current Resident', label: 'Current Resident' },
  { value: 'Past Resident', label: 'Past Resident' }
]

export default function PersonDetailForm({
  mode,
  initialData,
  personId,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = true
}: PersonDetailFormProps) {
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

  // Generic field change handler
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    // Validate required fields
    if (!formData.firstName.trim()) {
      setToastType('error')
      setToastMessage('First name is required')
      return
    }

    if (!formData.lastName.trim()) {
      setToastType('error')
      setToastMessage('Last name is required')
      return
    }

    if (!formData.status.trim()) {
      setToastType('error')
      setToastMessage('Status is required')
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
        setToastMessage('Person updated successfully!')
      } else {
        setToastType('success')
        setToastMessage('Person created successfully!')
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
    if (!onDelete || !personId) return

    setIsDeleting(true)

    try {
      await onDelete(personId)
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete person')
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
            {/* First Name and Last Name Fields - Side by side */}
            <div className="flex gap-4">
              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  First Name
                </span>
                <InlineTextField
                  value={formData.firstName}
                  onChange={(value) => handleFieldChange('firstName', value)}
                  isEditMode={isEditMode}
                  placeholder="First Name"
                />
              </motion.div>

              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  Last Name
                </span>
                <InlineTextField
                  value={formData.lastName}
                  onChange={(value) => handleFieldChange('lastName', value)}
                  isEditMode={isEditMode}
                  placeholder="Last Name"
                />
              </motion.div>
            </div>

            {/* Email Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Email
              </span>
              <InlineTextField
                value={formData.email}
                onChange={(value) => handleFieldChange('email', value)}
                isEditMode={isEditMode}
                placeholder="email@example.com"
              />
            </motion.div>

            {/* Phone Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Phone
              </span>
              <InlineTextField
                value={formData.phone}
                onChange={(value) => handleFieldChange('phone', value)}
                isEditMode={isEditMode}
                placeholder="Phone"
                type="number"
                formatType="phone"
              />
            </motion.div>

            {/* Status Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Status
              </span>
              <InlineSelectField
                value={formData.status}
                onChange={(value) => handleFieldChange('status', value)}
                options={STATUS_OPTIONS}
                isEditMode={isEditMode}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {mode === 'edit' && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Person"
          message="Are you sure you want to delete this person? This action cannot be undone."
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
