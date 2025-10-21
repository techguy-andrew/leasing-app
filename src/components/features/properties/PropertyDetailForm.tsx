'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import InlineTextField from '@/components/shared/fields/InlineTextField'
import EditMenuButton from '@/components/shared/buttons/EditMenuButton'
import SaveButton from '@/components/shared/buttons/SaveButton'
import CancelButton from '@/components/shared/buttons/CancelButton'
import ConfirmModal from '@/components/shared/modals/ConfirmModal'
import Toast, { ToastType } from '@/components/shared/feedback/Toast'
import { pageTransition, formFieldStagger, formFieldItem } from '@/lib/animations/variants'

interface FormData {
  name: string
  street: string
  city: string
  state: string
  zip: string
  energyProvider: string
}

interface PropertyDetailFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<FormData>
  propertyId?: number
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
  showDeleteButton?: boolean
}

const defaultFormData: FormData = {
  name: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  energyProvider: ''
}

export default function PropertyDetailForm({
  mode,
  initialData,
  propertyId,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = true
}: PropertyDetailFormProps) {
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
    if (!formData.name.trim()) {
      setToastType('error')
      setToastMessage('Property name is required')
      return
    }

    if (!formData.street.trim()) {
      setToastType('error')
      setToastMessage('Street address is required')
      return
    }

    if (!formData.city.trim()) {
      setToastType('error')
      setToastMessage('City is required')
      return
    }

    if (!formData.state.trim()) {
      setToastType('error')
      setToastMessage('State is required')
      return
    }

    if (!formData.zip.trim()) {
      setToastType('error')
      setToastMessage('ZIP code is required')
      return
    }

    if (!formData.energyProvider.trim()) {
      setToastType('error')
      setToastMessage('Energy provider is required')
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
        setToastMessage('Property updated successfully!')
      } else {
        setToastType('success')
        setToastMessage('Property created successfully!')
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
    if (!onDelete || !propertyId) return

    setIsDeleting(true)

    try {
      await onDelete(propertyId)
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete property')
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
            {/* Property Name Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Property Name
              </span>
              <InlineTextField
                value={formData.name}
                onChange={(value) => handleFieldChange('name', value)}
                isEditMode={isEditMode}
                placeholder="Property Name"
              />
            </motion.div>

            {/* Street Address Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Street Address
              </span>
              <InlineTextField
                value={formData.street}
                onChange={(value) => handleFieldChange('street', value)}
                isEditMode={isEditMode}
                placeholder="Street Address"
              />
            </motion.div>

            {/* City Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                City
              </span>
              <InlineTextField
                value={formData.city}
                onChange={(value) => handleFieldChange('city', value)}
                isEditMode={isEditMode}
                placeholder="City"
              />
            </motion.div>

            {/* State and ZIP Fields - Side by side */}
            <div className="flex gap-4">
              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  State
                </span>
                <InlineTextField
                  value={formData.state}
                  onChange={(value) => handleFieldChange('state', value)}
                  isEditMode={isEditMode}
                  placeholder="State"
                />
              </motion.div>

              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  ZIP Code
                </span>
                <InlineTextField
                  value={formData.zip}
                  onChange={(value) => handleFieldChange('zip', value)}
                  isEditMode={isEditMode}
                  placeholder="ZIP Code"
                />
              </motion.div>
            </div>

            {/* Energy Provider Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Energy Provider
              </span>
              <InlineTextField
                value={formData.energyProvider}
                onChange={(value) => handleFieldChange('energyProvider', value)}
                isEditMode={isEditMode}
                placeholder="Provider Name and Contact Info"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {mode === 'edit' && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Property"
          message="Are you sure you want to delete this property? This action cannot be undone."
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
