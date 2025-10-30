'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import InlineTextField from '@/components/shared/fields/InlineTextField'
import InlineSelectField from '@/components/shared/fields/InlineSelectField'
import StatusBadge from '@/components/shared/StatusBadge'
import EditMenuButton from '@/components/shared/buttons/EditMenuButton'
import SaveButton from '@/components/shared/buttons/SaveButton'
import CancelButton from '@/components/shared/buttons/CancelButton'
import ConfirmModal from '@/components/shared/modals/ConfirmModal'
import Toast, { ToastType } from '@/components/shared/feedback/Toast'
import TasksList from './TasksList'
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
 * 2. Manage statuses via the Settings page (/settings)
 * 3. Adjust field labels and placeholders as needed
 * 4. Update formatDate and formatPhone functions for your locale
 * 5. Modify the API endpoints in onSave callbacks
 * 6. Add/remove fields by copying the field block pattern below
 */

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
  petRent: string
  proratedRent: string
  concession: string
  rentersInsurance: string
  adminFee: string
  initialPayment: string
}

interface Task {
  id: string
  description: string
  completed: boolean
  type: 'AGENT' | 'APPLICANT' | 'NOTES' | 'TODO'
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
  onStatusChange?: (status: string[]) => Promise<void>
  onTasksChange?: (tasks: Task[], taskType: 'AGENT' | 'APPLICANT' | 'NOTES') => void
}

const defaultFormData: FormData = {
  status: ['New'],
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
  adminFee: '',
  initialPayment: ''
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

  // Format phone as XXX-XXX-XXXX
  const formatPhone = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }, [])

  // Format currency with fixed decimal point
  // Decimal is always in place, user types digits and they fill in naturally
  const formatCurrency = useCallback((value: string): string => {
    // Don't format N/A
    if (value === 'N/A') return 'N/A'

    // Remove all non-digit characters
    const digitsOnly = value.replace(/\D/g, '')

    // Allow empty state - user can clear the field
    if (digitsOnly === '') return ''

    // Treat input as cents and convert to dollars with decimal
    // Pad with zeros if needed (minimum 3 digits for proper decimal placement)
    const paddedCents = digitsOnly.padStart(3, '0')

    // Insert decimal point 2 places from the right
    const dollars = paddedCents.slice(0, -2)
    const cents = paddedCents.slice(-2)

    return `${dollars}.${cents}`
  }, [])

  // Calculate prorated rent based on move-in date and monthly rent
  // Formula: (Monthly Rent ÷ Days in Month) × Days Occupied = Prorated Amount
  const calculateProratedRent = useCallback((moveInDate: string, rent: string): string => {
    // Validate inputs - return empty if either is missing
    if (!moveInDate || !rent) return ''

    // Parse date (MM/DD/YYYY format)
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
    const match = moveInDate.match(dateRegex)
    if (!match) return ''

    const month = parseInt(match[1], 10)
    const day = parseInt(match[2], 10)
    const year = parseInt(match[3], 10)

    // Validate date components
    if (month < 1 || month > 12 || day < 1 || day > 31) return ''

    // Calculate days in the move-in month (month parameter is 0-indexed, so we use month directly to get last day)
    const daysInMonth = new Date(year, month, 0).getDate()

    // Validate that the day is valid for this month
    if (day > daysInMonth) return ''

    // Calculate days occupied (from move-in date to end of month, inclusive)
    const daysOccupied = daysInMonth - day + 1

    // Parse rent amount (remove commas and convert to number)
    const rentValue = parseFloat(rent.replace(/,/g, ''))
    if (isNaN(rentValue) || rentValue <= 0) return ''

    // Calculate prorated rent: Daily Rate × Days Occupied
    const dailyRate = rentValue / daysInMonth
    const proratedAmount = dailyRate * daysOccupied

    // Round to 2 decimal places and format as currency string
    const rounded = Math.round(proratedAmount * 100) / 100
    return rounded.toFixed(2)
  }, [])

  // Calculate initial payment based on multiple payment fields
  // Formula: Rent + Deposit + Renters Insurance + Admin Fee + Pet Fee + Pet Rent
  // Only includes fields with positive values (excludes $0.00, empty, and N/A)
  const calculateInitialPayment = useCallback((
    rent: string,
    deposit: string,
    rentersInsurance: string,
    adminFee: string,
    petFee: string,
    petRent: string
  ): string => {
    // Helper function to parse amount - returns 0 if invalid/empty
    const parseAmount = (value: string): number => {
      if (!value || value === 'N/A') return 0
      const parsed = parseFloat(value.replace(/,/g, ''))
      if (isNaN(parsed) || parsed <= 0) return 0  // Treat zero/negative as 0
      return parsed
    }

    // Parse all payment fields
    const rentAmount = parseAmount(rent)
    const depositAmount = parseAmount(deposit)
    const insuranceAmount = parseAmount(rentersInsurance)
    const adminAmount = parseAmount(adminFee)
    const petFeeAmount = parseAmount(petFee)
    const petRentAmount = parseAmount(petRent)

    // Calculate total - if all are 0, total will be 0
    const total = rentAmount + depositAmount + insuranceAmount +
                  adminAmount + petFeeAmount + petRentAmount

    // Return empty if no valid amounts
    if (total === 0) return ''

    // Return formatted as currency string
    return total.toFixed(2)
  }, [])

  // Format initial data for display
  const formatInitialData = useCallback((data: Partial<FormData>): FormData => {
    const formatted = { ...defaultFormData, ...data }

    // Format phone if present
    if (formatted.phone) {
      formatted.phone = formatPhone(formatted.phone)
    }

    // Format currency fields
    const currencyFields = ['deposit', 'rent', 'petFee', 'petRent', 'proratedRent', 'concession', 'rentersInsurance', 'adminFee', 'initialPayment'] as const
    currencyFields.forEach(field => {
      const value = formatted[field]
      if (value && typeof value === 'string' && value !== 'N/A') {
        formatted[field] = formatCurrency(value)
      }
    })

    // Dates are formatted inline by InlineTextField with formatType="date"

    return formatted
  }, [formatPhone, formatCurrency])

  // Update form when initialData changes (edit mode) with formatting
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const newData = formatInitialData(initialData)
      setFormData(newData)
      setOriginalData(newData)
    }
  }, [initialData, mode, formatInitialData])

  // Auto-calculate prorated rent when move-in date or rent changes
  useEffect(() => {
    // If rent is N/A, set prorated rent to N/A
    if (formData.rent === 'N/A') {
      setFormData(prev => ({ ...prev, proratedRent: 'N/A' }))
      return
    }

    // If either field is empty, clear the prorated rent
    if (!formData.moveInDate || !formData.rent) {
      setFormData(prev => ({ ...prev, proratedRent: '' }))
      return
    }

    // Calculate prorated rent based on both fields
    const calculated = calculateProratedRent(formData.moveInDate, formData.rent)

    // Always update prorated rent (even if empty string for invalid data)
    // This ensures stale values are cleared when data becomes invalid
    setFormData(prev => ({ ...prev, proratedRent: calculated }))
  }, [formData.moveInDate, formData.rent, calculateProratedRent])

  // Auto-calculate initial payment when any contributing field changes
  useEffect(() => {
    // Calculate initial payment based on all 6 fields
    const calculated = calculateInitialPayment(
      formData.rent,
      formData.deposit,
      formData.rentersInsurance,
      formData.adminFee,
      formData.petFee,
      formData.petRent
    )

    // Always update initial payment (even if empty string when all fields are 0/empty)
    // The calculateInitialPayment function handles N/A by treating it as 0
    setFormData(prev => ({ ...prev, initialPayment: calculated }))
  }, [formData.rent, formData.deposit, formData.rentersInsurance, formData.adminFee, formData.petFee, formData.petRent, calculateInitialPayment])

  // Generic field change handler
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Status change handler
  const handleStatusChange = async (value: string[]) => {
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
              <StatusBadge
                statuses={formData.status}
                onChange={handleStatusChange}
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
                onEnterPress={handleSave}
              />
            </motion.div>

            {/* Move-in Date Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Move-in Date
              </span>
              <InlineTextField
                value={formData.moveInDate}
                onChange={(value) => handleFieldChange('moveInDate', value)}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
                onEnterPress={handleSave}
                formatType="date"
              />
            </motion.div>

            {/* Application Date Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Application Date
              </span>
              <InlineTextField
                value={formData.createdAt}
                onChange={(value) => handleFieldChange('createdAt', value)}
                isEditMode={isEditMode}
                placeholder="MM/DD/YYYY"
                onEnterPress={handleSave}
                formatType="date"
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
                onEnterPress={handleSave}
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
                onEnterPress={handleSave}
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
                onEnterPress={handleSave}
              />
            </motion.div>

            {/* Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Rent
              </span>
              <InlineTextField
                value={formData.rent}
                onChange={(value) => handleFieldChange('rent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Deposit Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Deposit
              </span>
              <InlineTextField
                value={formData.deposit}
                onChange={(value) => handleFieldChange('deposit', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Pet Fee Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Pet Fee
              </span>
              <InlineTextField
                value={formData.petFee}
                onChange={(value) => handleFieldChange('petFee', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Pet Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Pet Rent
              </span>
              <InlineTextField
                value={formData.petRent}
                onChange={(value) => handleFieldChange('petRent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Prorated Rent Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Prorated Rent
              </span>
              <InlineTextField
                value={formData.proratedRent}
                onChange={(value) => handleFieldChange('proratedRent', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Concession Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Concession
              </span>
              <InlineTextField
                value={formData.concession}
                onChange={(value) => handleFieldChange('concession', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Insurance Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Insurance
              </span>
              <InlineTextField
                value={formData.rentersInsurance}
                onChange={(value) => handleFieldChange('rentersInsurance', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Admin Fee Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Admin Fee
              </span>
              <InlineTextField
                value={formData.adminFee}
                onChange={(value) => handleFieldChange('adminFee', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Initial Payment Field */}
            <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
              <span className="text-xs font-semibold text-gray-500">
                Initial Payment
              </span>
              <InlineTextField
                value={formData.initialPayment}
                onChange={(value) => handleFieldChange('initialPayment', value)}
                isEditMode={isEditMode}
                placeholder="0.00"
                prefix="$"
                type="number"
                formatType="currency"
                onEnterPress={handleSave}
                allowNA={true}
              />
            </motion.div>

            {/* Notes Section */}
            {applicationId && (
              <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
                <TasksList
                  applicationId={applicationId}
                  initialTasks={initialTasks}
                  onTasksChange={(tasks) => onTasksChange?.(tasks, 'NOTES')}
                  taskType="NOTES"
                  title="Notes"
                />
              </motion.div>
            )}

            {/* Leasing Agent Tasks Section */}
            {applicationId && (
              <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
                <TasksList
                  applicationId={applicationId}
                  initialTasks={initialTasks}
                  onTasksChange={(tasks) => onTasksChange?.(tasks, 'AGENT')}
                  taskType="AGENT"
                  title="Leasing Agent Tasks"
                />
              </motion.div>
            )}

            {/* Applicant Tasks Section */}
            {applicationId && (
              <motion.div className="flex flex-col gap-1" variants={formFieldItem}>
                <TasksList
                  applicationId={applicationId}
                  initialTasks={initialTasks}
                  onTasksChange={(tasks) => onTasksChange?.(tasks, 'APPLICANT')}
                  taskType="APPLICANT"
                  title="Applicant Tasks"
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
