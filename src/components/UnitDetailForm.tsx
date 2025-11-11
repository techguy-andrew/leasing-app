'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  propertyId: number
  unitNumber: string
  street: string
  city: string
  state: string
  zip: string
  bedrooms: string
  bathrooms: string
  squareFeet: string
  floor: string
  baseRent: string
  status: string
  availableOn: string
}

interface Property {
  id: number
  name: string
}

interface UnitDetailFormProps {
  mode: 'create' | 'edit'
  initialData?: Partial<FormData>
  unitId?: number
  properties: Property[]
  onSave: (data: FormData) => Promise<void>
  onCancel: () => void
  onDelete?: (id: number) => Promise<void>
  showDeleteButton?: boolean
}

const defaultFormData: FormData = {
  propertyId: 0,
  unitNumber: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  bedrooms: '',
  bathrooms: '',
  squareFeet: '',
  floor: '',
  baseRent: '',
  status: 'Vacant',
  availableOn: ''
}

const STATUS_OPTIONS = [
  { value: 'Vacant', label: 'Vacant' },
  { value: 'Occupied', label: 'Occupied' },
  { value: 'Under Maintenance', label: 'Under Maintenance' },
  { value: 'Reserved', label: 'Reserved' }
]

export default function UnitDetailForm({
  mode,
  initialData,
  unitId,
  properties,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = true
}: UnitDetailFormProps) {
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
  const handleFieldChange = (field: keyof FormData, value: string | number) => {
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
    if (!formData.propertyId || formData.propertyId === 0) {
      setToastType('error')
      setToastMessage('Property is required')
      return
    }

    if (!formData.unitNumber.trim()) {
      setToastType('error')
      setToastMessage('Unit number is required')
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
        setToastMessage('Unit updated successfully!')
      } else {
        setToastType('success')
        setToastMessage('Unit created successfully!')
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
    if (!onDelete || !unitId) return

    setIsDeleting(true)

    try {
      await onDelete(unitId)
    } catch (err) {
      setToastType('error')
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete unit')
      setShowDeleteModal(false)
      setIsDeleting(false)
    }
  }

  // Delete cancellation handler
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  // Convert properties to select options
  const propertyOptions = properties.map(p => ({
    value: p.id.toString(),
    label: p.name
  }))

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
            {/* Property Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Property
              </span>
              {isEditMode ? (
                <InlineSelectField
                  value={formData.propertyId.toString()}
                  onChange={(value) => handleFieldChange('propertyId', parseInt(value, 10))}
                  options={propertyOptions}
                  isEditMode={isEditMode}
                />
              ) : (
                formData.propertyId ? (
                  <Link
                    href={`/properties/${formData.propertyId}`}
                    className="text-base sm:text-lg font-sans text-blue-600 underline hover:text-blue-800 transition-colors"
                  >
                    {propertyOptions.find(opt => opt.value === formData.propertyId.toString())?.label || formData.propertyId}
                  </Link>
                ) : (
                  <span className="text-base sm:text-lg font-sans text-gray-400">No property selected</span>
                )
              )}
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
                placeholder="N/A"
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
                placeholder="N/A"
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
                  placeholder="N/A"
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
                  placeholder="N/A"
                />
              </motion.div>
            </div>

            {/* Unit Number and Status Fields - Side by side */}
            <div className="flex gap-4">
              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
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

              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
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
            </div>

            {/* Bedrooms and Bathrooms Fields - Side by side */}
            <div className="flex gap-4">
              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  Bedrooms
                </span>
                <InlineTextField
                  value={formData.bedrooms}
                  onChange={(value) => handleFieldChange('bedrooms', value)}
                  isEditMode={isEditMode}
                  placeholder="Bedrooms"
                  type="number"
                />
              </motion.div>

              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  Bathrooms
                </span>
                <InlineTextField
                  value={formData.bathrooms}
                  onChange={(value) => handleFieldChange('bathrooms', value)}
                  isEditMode={isEditMode}
                  placeholder="Bathrooms"
                  type="number"
                />
              </motion.div>
            </div>

            {/* Square Feet and Floor Fields - Side by side */}
            <div className="flex gap-4">
              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  Square Feet
                </span>
                <InlineTextField
                  value={formData.squareFeet}
                  onChange={(value) => handleFieldChange('squareFeet', value)}
                  isEditMode={isEditMode}
                  placeholder="Square Feet"
                  type="number"
                />
              </motion.div>

              <motion.div className="flex flex-col gap-1 flex-1" variants={formFieldItem}>
                <span className="text-xs font-semibold text-gray-500">
                  Floor
                </span>
                <InlineTextField
                  value={formData.floor}
                  onChange={(value) => handleFieldChange('floor', value)}
                  isEditMode={isEditMode}
                  placeholder="Floor"
                  type="number"
                />
              </motion.div>
            </div>

            {/* Base Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Base Rent
              </span>
              <InlineTextField
                value={formData.baseRent}
                onChange={(value) => handleFieldChange('baseRent', value)}
                isEditMode={isEditMode}
                placeholder="Base Rent"
                formatType="currency"
              />
            </motion.div>

            {/* Available On Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Available On
              </span>
              <InlineTextField
                value={formData.availableOn}
                onChange={(value) => handleFieldChange('availableOn', value)}
                isEditMode={isEditMode}
                placeholder="Available Date"
                type="date"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {mode === 'edit' && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Unit"
          message="Are you sure you want to delete this unit? This action cannot be undone."
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
